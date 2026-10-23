#!/usr/bin/env python3
"""Author the small Tiger Gorge slice in Blender; never substitute missing Tripo art.

Run with Blender 4.5 LTS, for example:
  blender --background --python scripts/art/build-mountain-slice.py -- \
    --character .local/tripo/assets/character/walk-idle.glb \
    --rock .local/tripo/assets/rocks/stratified-rock.glb

This is a production script, not a browser, performance or animation acceptance test.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import re
import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path

import bpy
from mathutils import Matrix, Vector


def arguments():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project", type=Path, default=Path(__file__).resolve().parents[2])
    parser.add_argument("--contract", type=Path)
    parser.add_argument("--character", type=Path, required=True, help="A real Tripo skinned, animated GLB")
    parser.add_argument("--rock", type=Path, action="append", required=True, help="A real Tripo static rock GLB; repeat for variants")
    parser.add_argument("--animation", type=Path, action="append", default=[],
                        help="Additional real animation GLB from the same source skeleton; repeat for separate clips")
    parser.add_argument("--character-forward", choices=["+Z", "-Z", "+X", "-X"], default="+Z",
                        help="Declared forward axis in the source GLB, before Blender's Y-up conversion")
    parser.add_argument("--walk-action", help="Exact source action name to label Walk, when its name is ambiguous")
    parser.add_argument("--idle-action", help="Exact source action name to label Idle; never creates an action")
    parser.add_argument("--atlas", type=Path)
    parser.add_argument("--rock-triangle-budget", type=int, default=14000)
    parser.add_argument("--stride-length", type=float, default=1.44,
                        help="Runtime whole-cycle stride assumption, not a measured claim")
    parser.add_argument("--replace-generated", action="store_true",
                        help="Replace only artifacts whose recorded hashes still match this script's previous build-report")
    return parser.parse_args(argv)


def require_file(path, kind):
    path = path.expanduser().resolve()
    if not path.is_file():
        raise RuntimeError(f"Missing {kind}: {path}. Supply the actual Tripo input; no substitute is generated.")
    return path


def clamp(value, lo=0.0, hi=1.0):
    return min(hi, max(lo, value))


def smooth(value):
    t = clamp(value)
    return t * t * (3.0 - 2.0 * t)


def lerp(a, b, t):
    return a + (b - a) * t


def noise(x, z):
    return (math.sin(x * .31 + z * .17) * .50 + math.sin(x * .77 - z * .39) * .26
            + math.sin(x * 1.81 + z * 1.13) * .12)


def bv(point):
    """Contract/GLTF +Y up -> Blender +Z up; glTF export_yup reverses this."""
    return Vector((point[0], -point[2], point[1]))


def safe_source(path, project):
    try:
        local = str(path.relative_to(project))
    except ValueError:
        local = path.name
    info = {"provider": "unknown", "sourceKind": "user-provided local GLB", "sourceFile": local,
            "sha256": hashlib.sha256(path.read_bytes()).hexdigest()}
    # Keep useful local provenance, without copying secrets or temporary URLs.
    for candidate in [path.with_suffix(".provenance.json"), path.with_name(path.name+".json"), path.with_suffix(".json")]:
        if not candidate.is_file():
            continue
        try:
            raw = json.loads(candidate.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            continue
        if str(raw.get("provider", "")).strip().casefold()=="tripo":
            info["provider"]="Tripo"
            info["provenanceEvidence"]="adjacent local metadata declares provider=tripo"
        for key in ["task_id", "taskId", "model_version", "modelVersion", "license", "attribution"]:
            value = raw.get(key)
            if isinstance(value, (str, int, float, bool)) and "http" not in str(value).lower():
                info[key] = value
        break
    return info


GENERATOR="trailbound-mountain-slice-v1"


def file_hash(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def protect_existing(paths, report_path, project, replace):
    existing=[path for path in paths if path.exists()]
    if not existing and not report_path.exists():
        return
    if not replace:
        raise RuntimeError("Existing production output is protected. Choose a new version or explicitly use --replace-generated for unchanged outputs from this script: "+", ".join(str(path) for path in existing))
    if not report_path.is_file():
        raise RuntimeError("Cannot replace outputs without this script's prior build-report.json.")
    prior=json.loads(report_path.read_text(encoding="utf-8"))
    if prior.get("generator")!=GENERATOR:
        raise RuntimeError("Prior output is not identified as this generator's work; no overwrite is allowed.")
    expected=prior.get("generatedFileHashes",{})
    for path in existing:
        key=str(path.relative_to(project))
        if not path.is_file() or expected.get(key)!=file_hash(path):
            raise RuntimeError(f"Protected output differs from the recorded generated file: {path}. Preserve the hand-edited artifact and choose a new version.")


class Route:
    def __init__(self, contract):
        self.controls = [(p["x"], p["y"], p["z"]) for p in contract["controlPoints"]]
        if len(self.controls) < 4:
            raise RuntimeError("The slice needs at least four authored route controls.")
        self.points = []
        for i in range(361):
            t = i / 360 * (len(self.controls) - 1)
            index = min(len(self.controls) - 2, int(t))
            u = t - index
            controls = [self.controls[max(0, index - 1)], self.controls[index],
                        self.controls[index + 1], self.controls[min(len(self.controls) - 1, index + 2)]]
            p = []
            for axis in range(3):
                a, b, c, d = [point[axis] for point in controls]
                p.append(.5 * ((2*b) + (-a+c)*u + (2*a-5*b+4*c-d)*u*u + (-a+3*b-3*c+d)*u*u*u))
            self.points.append(tuple(p))
        self.distances = [0.0]
        for a, b in zip(self.points, self.points[1:]):
            self.distances.append(self.distances[-1] + (Vector(b) - Vector(a)).length)
        self.length = self.distances[-1]

    def at(self, t):
        f = clamp(t) * (len(self.points) - 1)
        index = min(len(self.points) - 2, int(f))
        return tuple(lerp(a, b, f-index) for a, b in zip(self.points[index], self.points[index+1]))

    def at_z(self, z):
        if z >= self.points[0][2]:
            return self.points[0]
        if z <= self.points[-1][2]:
            return self.points[-1]
        lo, hi = 0, len(self.points) - 1
        while lo + 1 < hi:
            mid = (lo + hi) // 2
            if self.points[mid][2] > z:
                lo = mid
            else:
                hi = mid
        a, b = self.points[lo], self.points[hi]
        t = clamp((a[2] - z) / max(.00001, a[2] - b[2]))
        return tuple(lerp(c, d, t) for c, d in zip(a, b))

    def surface(self, x, z):
        rx, ry, _ = self.at_z(z)
        lateral = x - rx
        if lateral <= 1.15:
            base = ry + max(0, -lateral-1.1) * .38 + noise(x, z) * .24
        else:
            drop = (1 - math.exp(-(lateral-1.15) / 16)) ** .76
            base = ry - (ry + 77) * drop + noise(x, z) * .8
        # A continuous rock promontory, clearly to the right/rear after ~10 m.
        mass = math.exp(-((x+23)/7.0)**4 - ((z-70)/4.8)**4)
        base += mass * 68
        # The walking ribbon is cut into the same terrain, with no floating road.
        if -1.8 < lateral < 1.8 and 44 < z < 77:
            base = lerp(ry, base, smooth((abs(lateral)-.80)/.95))
        return base


def collection(name, parent=None):
    result = bpy.data.collections.new(name)
    (parent or bpy.context.scene.collection).children.link(result)
    return result


def empty(name, coll, parent=None):
    result = bpy.data.objects.new(name, None)
    coll.objects.link(result)
    result.parent = parent
    return result


def move_to_collection(obj, coll):
    for old in list(obj.users_collection):
        old.objects.unlink(obj)
    coll.objects.link(obj)


def mesh_object(name, vertices, faces, material, coll, parent=None, uv=None):
    mesh = bpy.data.meshes.new(name + "Mesh")
    mesh.from_pydata([tuple(v) for v in vertices], [], faces)
    mesh.update()
    layer = mesh.uv_layers.new(name="UVMap")
    for polygon in mesh.polygons:
        polygon.use_smooth = True
        for loop_index in polygon.loop_indices:
            vertex = mesh.loops[loop_index].vertex_index
            layer.data[loop_index].uv = uv[vertex] if uv else (vertices[vertex][0]*.16, vertices[vertex][1]*.16)
    obj = bpy.data.objects.new(name, mesh)
    coll.objects.link(obj)
    obj.parent = parent
    if material:
        mesh.materials.append(material)
    return obj


def quads(rows, columns):
    result = []
    for row in range(rows-1):
        for col in range(columns-1):
            a = row*columns + col
            # Rows increase in contract Z, therefore decrease in Blender Y.
            result.append((a, a+columns, a+columns+1, a+1))
    return result


def atlas_tiles(path, directory):
    source = bpy.data.images.load(str(path), check_existing=True)
    width, height = source.size
    if width < 64 or height < 64 or width % 2 or height % 2:
        raise RuntimeError("Expected the existing 2 x 2 watercolor material atlas.")
    channels = source.channels
    pixels = list(source.pixels)
    result = {}
    directory.mkdir(parents=True, exist_ok=True)
    # Blender pixel rows start at the bottom; art tile names use the top row.
    for name, col, row in [("rock",0,1), ("earth",1,1), ("grass",0,0), ("farrock",1,0)]:
        tw, th, inset = width//2, height//2, 3
        w, h = tw-inset*2, th-inset*2
        data = []
        for y in range(row*th+inset, (row+1)*th-inset):
            offset = (y*width + col*tw+inset)*channels
            row_pixels = pixels[offset:offset+w*channels]
            if channels == 4:
                data.extend(row_pixels)
            else:
                for x in range(w):
                    rgb = row_pixels[x*channels:x*channels+3]
                    data.extend([*rgb, 1.0])
        image = bpy.data.images.new("Watercolor_"+name, width=w, height=h, alpha=True)
        image.pixels.foreach_set(data)
        image.colorspace_settings.name = "sRGB"
        image.filepath_raw = str(directory / (name+"-from-atlas.png"))
        image.file_format = "PNG"
        image.save()
        image.pack()
        image["source"] = "Derived crop of existing tiger-mountain-materials-v1.webp; no new authorship claimed"
        result[name] = image
    return result


def material(name, color, image=None, roughness=.95, double_sided=False):
    result = bpy.data.materials.new(name)
    result.use_nodes = True
    result.diffuse_color = (*color, 1)
    result.use_backface_culling = not double_sided
    nodes = result.node_tree.nodes
    surface = nodes.get("Principled BSDF")
    surface.inputs["Base Color"].default_value = (*color, 1)
    surface.inputs["Roughness"].default_value = roughness
    surface.inputs["Metallic"].default_value = 0
    if image:
        tex = nodes.new("ShaderNodeTexImage")
        tex.image = image
        tex.extension = "REPEAT"
        tex.interpolation = "Linear"
        # Multiplication is baked into the base image tint by the existing art;
        # use a direct image connection supported by the glTF material exporter.
        result.node_tree.links.new(tex.outputs["Color"], surface.inputs["Base Color"])
    return result


def bounds(objects):
    dependency = bpy.context.evaluated_depsgraph_get()
    points = []
    for obj in objects:
        if obj.type != "MESH":
            continue
        evaluated = obj.evaluated_get(dependency)
        points.extend(evaluated.matrix_world @ Vector(corner) for corner in evaluated.bound_box)
    if not points:
        raise RuntimeError("Imported asset contains no mesh geometry.")
    return (Vector(tuple(min(p[a] for p in points) for a in range(3))),
            Vector(tuple(max(p[a] for p in points) for a in range(3))))


def import_asset(path, coll, name, target_height, forward="+Z"):
    before_objects, before_actions = set(bpy.data.objects), set(bpy.data.actions)
    bpy.ops.import_scene.gltf(filepath=str(path))
    imported = [obj for obj in bpy.data.objects if obj not in before_objects]
    actions = [act for act in bpy.data.actions if act not in before_actions]
    imported = [obj for obj in imported if obj.type not in {"LIGHT", "CAMERA"}]
    if not imported:
        raise RuntimeError(f"No usable objects imported from {path.name}")
    for obj in imported:
        move_to_collection(obj, coll)
    root = empty(name, coll)
    normalizer = empty(name+"SourceTransform", coll, root)
    top = [obj for obj in imported if obj.parent not in imported]
    for obj in top:
        world = obj.matrix_world.copy()
        obj.parent = normalizer
        obj.matrix_world = world
    armatures = [obj for obj in imported if obj.type == "ARMATURE"]
    saved_pose = [(obj, obj.data.pose_position) for obj in armatures]
    for obj, _pose in saved_pose:
        obj.data.pose_position = "REST"
    bpy.context.view_layer.update()
    minimum, maximum = bounds(imported)
    height = maximum.z-minimum.z
    if height < .01:
        raise RuntimeError(f"Asset {path.name} has no usable vertical extent.")
    angle = {"+Z":0, "-Z":math.pi, "+X":-math.pi/2, "-X":math.pi/2}[forward]
    rotation = Matrix.Rotation(angle, 4, "Z")
    centre = rotation @ Vector(((minimum.x+maximum.x)/2, (minimum.y+maximum.y)/2, minimum.z))
    scale = target_height/height
    normalizer.rotation_euler.z = angle
    normalizer.scale = (scale, scale, scale)
    normalizer.location = -centre*scale
    for obj, pose in saved_pose:
        obj.data.pose_position = pose
    bpy.context.view_layer.update()
    return root, imported, actions, scale


def curves_of(action):
    if getattr(action, "is_action_layered", False):
        for layer in action.layers:
            for strip in layer.strips:
                for bag in getattr(strip, "channelbags", []):
                    yield from bag.fcurves
    else:
        yield from action.fcurves


def compatible_skeleton(first, second):
    a, b = first.data.bones, second.data.bones
    if set(a.keys()) != set(b.keys()):
        return False
    for bone in a:
        other = b[bone.name]
        if (bone.parent.name if bone.parent else None) != (other.parent.name if other.parent else None):
            return False
        if any(abs(bone.matrix_local[row][col]-other.matrix_local[row][col])>.001 for row in range(4) for col in range(4)):
            return False
    return True


def append_same_rig_animations(paths, armatures, character_coll):
    """Bind actual actions only when names, hierarchy and rest pose agree.

    This is intentionally not an automatic cross-character retargeter. Source
    translations stay in the original rig's units; both rest rigs must match.
    """
    added=[]
    for index,path in enumerate(paths):
        temporary=collection(f"__AnimationImport_{index}")
        before_objects,before_actions=set(bpy.data.objects),set(bpy.data.actions)
        bpy.ops.import_scene.gltf(filepath=str(path))
        objects=[obj for obj in bpy.data.objects if obj not in before_objects]
        actions=[act for act in bpy.data.actions if act not in before_actions]
        for obj in objects:
            move_to_collection(obj,temporary)
        source_armatures=[obj for obj in objects if obj.type=="ARMATURE"]
        mapping={}
        for source_armature in source_armatures:
            matches=[target for target in armatures if compatible_skeleton(target,source_armature)]
            if len(matches)!=1:
                raise RuntimeError(f"Animation GLB {path.name} does not have exactly one matching source rest skeleton; explicit retargeting is required.")
            mapping[source_armature]=matches[0]
        if not mapping or not actions:
            raise RuntimeError(f"Animation GLB {path.name} has no actual rig animation to append.")
        for action in actions:
            bone_paths=[curve.data_path for curve in curves_of(action) if curve.data_path.startswith('pose.bones[')]
            owners=[]
            for source_armature in source_armatures:
                animation=source_armature.animation_data
                if animation and (animation.action==action or any(strip.action==action for track in animation.nla_tracks for strip in track.strips)):
                    owners.append(source_armature)
            if not owners and len(mapping)==1 and bone_paths:
                owners=list(mapping)
            if len(owners)!=1:
                raise RuntimeError(f"Action {action.name!r} from {path.name} has no unambiguous matching armature. No guessed animation is exported.")
            target=mapping[owners[0]]
            target.animation_data_create()
            track=target.animation_data.nla_tracks.new()
            track.name="Actual imported clip: "+action.name
            strip=track.strips.new(action.name,math.floor(action.frame_range[0]),action)
            # Blender 4.4+ actions can have explicit slots. Retain the source
            # armature slot when available; do not reuse another object's slot.
            slots=list(getattr(action,"slots",[]))
            if hasattr(strip,"action_slot") and slots:
                source_animation=owners[0].animation_data
                candidates=[]
                if source_animation.action==action:
                    candidates.append(getattr(source_animation,"action_slot",None))
                candidates.extend(getattr(source_strip,"action_slot",None)
                                  for source_track in source_animation.nla_tracks
                                  for source_strip in source_track.strips if source_strip.action==action)
                actual_slots=[candidate for candidate in candidates if candidate in slots]
                if not actual_slots and len(slots)>1:
                    raise RuntimeError(f"Action {action.name!r} has multiple slots without an identifiable armature slot.")
                strip.action_slot=actual_slots[0] if actual_slots else slots[0]
            action["sourceAnimationFile"]=path.name
            action.use_fake_user=True
            added.append(action)
        # The main character keeps the actual actions through its NLA tracks;
        # duplicate source meshes and armatures never enter the export.
        for obj in objects:
            bpy.data.objects.remove(obj,do_unlink=True)
        bpy.data.collections.remove(temporary)
    return added


def prepare_character(path, coll, contract, args, source, animation_paths):
    root, imported, actions, scale = import_asset(path, coll, "TigerHiker", contract["characterHeight"], args.character_forward)
    armatures = [obj for obj in imported if obj.type == "ARMATURE"]
    skinned = [obj for obj in imported if obj.type == "MESH" and any(mod.type == "ARMATURE" for mod in obj.modifiers)]
    if not armatures or not skinned:
        raise RuntimeError("The Tripo character must include a real armature, skinned meshes and animation. No static sliding substitute is exported.")
    actions.extend(append_same_rig_animations(animation_paths,armatures,coll))
    if not actions:
        raise RuntimeError("The actual character inputs contain no animation; no sliding substitute is exported.")
    names = [action.name for action in actions]
    for requested in [args.walk_action, args.idle_action]:
        if requested and requested not in names:
            raise RuntimeError(f"Requested action {requested!r} not found. Actual actions: {names}")
    report, mapped = [], set()
    for action in actions:
        original = action.name
        words = re.sub(r"[^a-z]", "", original.lower())
        if original == args.walk_action:
            canonical = "Walk"
        elif original == args.idle_action:
            canonical = "Idle"
        elif "uphill" in words or "walkup" in words:
            canonical = "WalkUphill"
        elif "idle" in words or "standing" in words or "breathing" in words:
            canonical = "Idle"
        elif "walk" in words:
            canonical = "Walk"
        else:
            canonical = original
        if canonical in mapped:
            canonical = original
        mapped.add(canonical)
        removed = []
        owners=[]
        for obj in imported:
            animation=obj.animation_data
            if animation and (animation.action==action or any(strip.action==action for track in animation.nla_tracks for strip in track.strips)):
                owners.append(obj)
        # Object locations are local to the parent, too. Only correct a single
        # root owner when its local XY axes are demonstrably world-horizontal.
        # Bone local axes are never guessed; Tripo is asked for in-place clips.
        root_owner=owners[0] if len(owners)==1 else None
        horizontal=False
        if root_owner and (root_owner.type=="ARMATURE" or root_owner.parent not in imported) and len(getattr(action,"slots",[]))<=1:
            parent_matrix=root_owner.parent.matrix_world if root_owner.parent else Matrix.Identity(4)
            x_axis=parent_matrix.to_3x3() @ Vector((1,0,0))
            y_axis=parent_matrix.to_3x3() @ Vector((0,1,0))
            horizontal=abs(x_axis.z)<.000001 and abs(y_axis.z)<.000001
        for curve in curves_of(action):
            if not horizontal or curve.array_index not in {0,1} or curve.data_path!="location":
                continue
            points = curve.keyframe_points
            if len(points) < 2:
                continue
            start, end = points[0].co.copy(), points[-1].co.copy()
            drift = end.y-start.y
            if abs(drift)*scale < .02 or end.x-start.x < .001:
                continue
            for point in points:
                for handle in [point.co, point.handle_left, point.handle_right]:
                    handle.y -= drift*clamp((handle.x-start.x)/(end.x-start.x))
            curve.update()
            removed.append({"channel":curve.data_path,"axis":curve.array_index,"sourceDrift":drift})
        report.append({"sourceName":original,"exportName":canonical,"rootMotionCorrections":removed,
                       "sourceFile":action.get("sourceAnimationFile",path.name),
                       "motionCorrectionScope":"single object root with proven world-horizontal XY only; all pose-bone translations retained",
                       "objectAxesEligible":horizontal})
    if "Walk" not in [item["exportName"] for item in report]:
        raise RuntimeError(f"No identifiable Walk action. Actual actions: {names}. Pass --walk-action with the real walking clip name.")
    # Two-pass rename avoids a source action reserving another canonical name.
    for index, action in enumerate(actions):
        action.name = f"__TigerSourceAction_{index}"
    for action, item in zip(actions, report):
        action.name = item["exportName"]
        item["exportName"] = action.name
    for obj in imported:
        animation = obj.animation_data
        if animation:
            for track in list(animation.nla_tracks):
                for strip in list(track.strips):
                    # Blender's ACTIONS exporter writes the active action and
                    # its duplicate NLA stash twice. Keep the real active clip.
                    if strip.action==animation.action and getattr(strip,"action_slot",None)==getattr(animation,"action_slot",None):
                        track.strips.remove(strip)
                        continue
                    if strip.action in actions:
                        strip.name = strip.action.name
                if not track.strips:
                    animation.nla_tracks.remove(track)
                elif len(track.strips)==1 and track.strips[0].action in actions:
                    track.name=track.strips[0].action.name
    root["provenance"] = json.dumps(source, ensure_ascii=False)
    root["actualAnimations"] = json.dumps([item["exportName"] for item in report])
    root["strideLength"] = args.stride_length
    root["strideLengthStatus"] = "runtime default assumption; not measured from this generated motion"
    root["characterHeight"] = contract["characterHeight"]
    root["forward"] = "+Z"
    root["rootMotion"] = "only eligible object-root horizontal net cycle drift corrected; all pose-bone translations retained; source requested in-place"
    return root, [root, *root.children_recursive], report


def duplicate_asset(template, coll, parent, position, height, angle, name):
    originals = [template, *template.children_recursive]
    copies = {}
    for original in originals:
        obj = original.copy()
        obj.animation_data_clear()
        obj.hide_render = False
        obj.hide_viewport = False
        coll.objects.link(obj)
        copies[original] = obj
    for original, obj in copies.items():
        obj.parent = copies.get(original.parent, parent)
    root = copies[template]
    root.name = name
    root.location = bv(position)
    root.rotation_euler.z = angle
    root.scale = (height, height, height)
    return root


def author_environment(route, contract, coll, templates, mats):
    root = empty("TigerWalkEnvironment", coll)
    root["routeKind"] = "authored 20–30 second scenic slice; not GPS"
    root["coordinates"] = "+Y up, +X gorge, +Z character forward after glTF export"
    root["pathWidth"] = contract["pathWidth"]
    root["controlPoints"] = json.dumps(contract["controlPoints"])
    root["provenance"] = "Blender authored; key rocks retain their local input provenance, unknown when metadata is absent"
    vertices, uvs = [], []
    # Cross-section follows the ledge instead of wasting its resolution on a
    # broad regular grid. Close vertical rock faces keep evenly scaled UVs.
    offsets = [-55,-40,-28,-18,-11,-7,-4,-2,-1.1,-.8,0,.8,1.1,1.4,1.8,2.4,3.4,5,7,10,14,19,26,35,48,65,85,112]
    rows = 97
    for row in range(rows):
        z = 24+row/(rows-1)*78
        rx, _ry, _rz = route.at_z(z)
        for offset in offsets:
            x = rx+offset
            y = route.surface(x,z)
            vertices.append(bv((x,y,z)))
            # Cliff projection uses physical height as well as travel; texture
            # does not stretch a tiny horizontal UV cell down a 100 m face.
            uvs.append(((x+y*.42)*.22,z*.22))
    near = mesh_object("TerrainNear",vertices,quads(rows,len(offsets)),mats["cliff"],coll,root,uvs)
    near["surface"] = "continuous graded terrain with sculpted strata and shoulder"
    # Narrow strata accent strips follow the rock face and break its silhouette
    # without covering it in evenly repeated generated rocks.
    for index, depth in enumerate([4.3,9.0,16.0,28.0]):
        verts, uv = [], []
        for i in range(65):
            z = 31+i/64*64
            rx, _y, _z = route.at_z(z)
            x = rx+depth+math.sin(z*.17+index)*.35
            for delta in [0,.32+.12*math.sin(z*.31)]:
                y = route.surface(x+delta,z)+.025
                verts.append(bv((x+delta,y,z)))
                uv.append((i*.13,delta*2))
        mesh_object(f"ErodedStratum_{index+1}",verts,quads(65,2),mats["stoneLight" if index%2 else "stoneShade"],coll,root,uv)
    shoulder = empty("CliffShoulder",coll,root)
    shoulder["meaning"] = "near promontory occludes the initial view, then passes to the traveller's right/rear"
    # Deliberate placements define the promontory and a few close foregrounds.
    placements = [(-24.2,70.8,3.2,.2),(-21.9,68.8,4.4,1.2),(-25.3,73.5,2.8,-.5),
                  (-28.6,64.7,1.25,.6),(-25.0,49.2,1.65,-.7),(-31.6,59.8,.68,.3)]
    for index,(x,z,height,angle) in enumerate(placements):
        duplicate_asset(templates[index%len(templates)],coll,shoulder,(x,route.surface(x,z)-.18*height,z),height,angle,f"SourceKeyRock_{index+1}")
    # Small stones belong in two authored clusters, outside the walking ribbon.
    for cluster,(x,z) in enumerate([(-33.1,66.1),(-27.1,48.5)]):
        for index in range(5):
            sx = x+math.sin(index*2.1)*.55
            sz = z+math.cos(index*1.7)*.7
            height = .12+.035*(index%3)
            duplicate_asset(templates[index%len(templates)],coll,shoulder,(sx,route.surface(sx,sz)-.025,sz),height,index*.8,f"PathStone_{cluster}_{index}")

    path_vertices, path_uvs, path_faces = [], [], []
    half = contract["pathWidth"]/2
    for index in range(len(route.points)):
        x,y,z = route.points[index]
        a = route.points[max(0,index-1)]
        b = route.points[min(len(route.points)-1,index+1)]
        tangent = Vector((b[0]-a[0],b[2]-a[2])).normalized()
        nx,nz = -tangent.y,tangent.x
        for side in [-1,1]:
            px,pz = x+side*nx*half,z+side*nz*half
            path_vertices.append(bv((px,route.surface(px,pz)+.025,pz)))
            path_uvs.append((0 if side<0 else 1,route.distances[index]/1.55))
        if index < len(route.points)-1:
            v=index*2
            # This ribbon progresses toward -contract-Z, unlike the land grid.
            path_faces.append((v,v+1,v+3,v+2))
    path = mesh_object("PathSurface",path_vertices,path_faces,mats["earth"],coll,root,path_uvs)
    path["raycastSurface"] = True
    path["width"] = contract["pathWidth"]
    path["surfaceOffset"] = .025

    # A meandering river belt with tapered banks, not a rectangular water card.
    river_vertices, river_uvs = [], []
    rrows,rcols = 145,13
    for row in range(rrows):
        z = -170+row/(rrows-1)*360
        centre = 105+math.sin(z*.025)*4.6+math.sin(z*.063)*1.3
        width = 27+math.sin(z*.032+1.4)*4
        left,right = max(85,centre-width/2),min(125,centre+width/2)
        for col in range(rcols):
            x = lerp(left,right,col/(rcols-1))
            y = -75+math.sin(z*.28+x*.16)*.08
            river_vertices.append(bv((x,y,z)))
            river_uvs.append((col/(rcols-1)*3,z*.06))
    river = mesh_object("River",river_vertices,quads(rrows,rcols),mats["river"],coll,root,river_uvs)
    river["flowDirection"] = "+Z"
    river["waterLevel"] = -75
    river["runtimeMotion"] = "use subtle material/vertex flow; silhouette is authored in this GLB"
    for index in range(22):
        z = -110+index*12.5
        centre = 105+math.sin(z*.025)*4.6
        x = centre+math.sin(index*2.4)*7
        verts=[]
        for j in range(6):
            pz=z+j*.75
            px=x+math.sin(j*.6+index)*.28
            verts.extend([bv((px,-74.84,pz)),bv((px+.09,-74.84,pz))])
        mesh_object(f"FoamStroke_{index}",verts,quads(6,2),mats["foam"],coll,river)

    ridges=empty("FarRidges",coll,root)
    for layer in range(4):
        verts,uv=[],[]
        for row in range(93):
            z=-200+row/92*440
            peak=138+layer*17+math.sin(z*.022+layer)*31+math.sin(z*.067+layer*.8)*11
            for col,t in enumerate([0,.13,.34,.58,.8,1]):
                x=125+layer*42+t*77
                # The first wall rises from the river's opposite bank.
                y=lerp(-77 if layer==0 else 20,peak,math.sin(t*math.pi*.56))
                y+=noise(x,z)*(2+layer)
                verts.append(bv((x,y,z)))
                uv.append((x*.025,z*.025))
        mesh_object(f"OppositeWall_{layer+1}",verts,quads(93,6),mats["far"+str(layer)],coll,ridges,uv)

    foliage=empty("Foliage",coll,root)
    # Leaves and grasses are shaped meshes in localized communities, with no
    # transparent rectangles or repeated green balls in the near foreground.
    for cluster,(x,z,size) in enumerate([(-33.0,73.0,1.0),(-33.8,66.0,.8),(-30.0,59.4,.7),(-28.9,52.0,.85),(-26.9,47.4,.6)]):
        verts,faces,uv=[],[],[]
        for blade in range(19):
            phase=blade*2.39996+cluster
            bx=x+math.sin(phase)*(.18+.035*(blade%5))
            bz=z+math.cos(phase)*(.19+.03*(blade%4))
            base=route.surface(bx,bz)+.015
            height=size*(.22+.065*(blade%6))
            leanx,leanz=math.cos(phase)*height*.3,math.sin(phase)*height*.3
            width=.018+.005*(blade%3)
            start=len(verts)
            verts.extend([bv((bx-width,base,bz)),bv((bx+width,base,bz)),
                          bv((bx+leanx+width*.5,base+height*.65,bz+leanz*.65)),
                          bv((bx+leanx,base+height,bz+leanz)),
                          bv((bx+leanx-width*.5,base+height*.65,bz+leanz*.65))])
            faces.append(tuple(start+i for i in [0,1,2,3,4]))
            uv.extend([(0,0),(1,0),(1,.65),(.5,1),(0,.65)])
        mesh_object(f"CliffGrassCommunity_{cluster+1}",verts,faces,mats["grass"],coll,foliage,uv)
    # Low shrubs sit uphill, letting the canyon-side silhouette stay open.
    for shrub,(x,z) in enumerate([(-35.6,70.3),(-32.4,56.2),(-29.9,48.8)]):
        verts,faces,uv=[],[],[]
        base=route.surface(x,z)
        for leaf in range(35):
            theta=leaf*2.39996
            radius=.12+(leaf%7)*.055
            px,pz=x+math.cos(theta)*radius,z+math.sin(theta)*radius
            py=base+.14+.07*(leaf%6)
            length=.13+.025*(leaf%4)
            start=len(verts)
            for lx,ly in [(-1,0),(-.65,.55),(0,1),(.65,.55),(1,0),(0,-.2)]:
                verts.append(bv((px+lx*length,py+ly*length,pz+math.sin(theta)*ly*length*.6)))
                uv.append(((lx+1)/2,(ly+.2)/1.2))
            faces.append(tuple(start+i for i in range(6)))
        mesh_object(f"UphillShrub_{shrub+1}",verts,faces,mats["grass"],coll,foliage,uv)
    return root


def export_glb(path, objects, animations):
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        obj.hide_set(False)
        obj.select_set(True)
    bpy.context.view_layer.objects.active=next((obj for obj in objects if obj.type=="ARMATURE"),objects[0])
    offered=bpy.ops.export_scene.gltf.get_rna_type().properties
    options={"filepath":str(path),"export_format":"GLB","use_selection":True,"export_yup":True,
             "export_animations":animations,"export_skins":True,"export_extras":True,
             "export_apply":False,"export_cameras":False,"export_lights":False,
             "export_materials":"EXPORT","export_force_sampling":True}
    if animations and "export_animation_mode" in offered:
        modes={item.identifier for item in offered["export_animation_mode"].enum_items}
        if "ACTIONS" not in modes:
            raise RuntimeError("This Blender glTF exporter cannot export actual source actions in ACTIONS mode.")
        options["export_animation_mode"]="ACTIONS"
    required={"filepath","export_format","use_selection","export_yup","export_animations","export_skins"}
    unsupported=required-set(offered.keys())
    if unsupported:
        raise RuntimeError(f"Unsupported Blender glTF export contract: {sorted(unsupported)}")
    bpy.ops.export_scene.gltf(**{key:value for key,value in options.items() if key in offered})


def main():
    args=arguments()
    project=args.project.expanduser().resolve()
    contract_path=require_file(args.contract or project/"art/mountain-slice/slice-v1.json","slice contract")
    character_path=require_file(args.character,"Tripo animated character GLB")
    animation_paths=[require_file(path,"Tripo additional animation GLB") for path in args.animation]
    rocks=[require_file(path,"Tripo rock GLB") for path in args.rock]
    for path in [character_path,*animation_paths,*rocks]:
        if path.suffix.lower()!=".glb":
            raise RuntimeError(f"Expected a downloaded, local GLB, not a URL or sidecar: {path}")
    atlas=require_file(args.atlas or project/"dist/textures/tiger-mountain-materials-v1.webp","existing watercolor atlas")
    contract=json.loads(contract_path.read_text(encoding="utf-8"))
    if contract["coordinates"]!={"unit":"metre","up":"+Y","gorge":"+X","characterForward":"+Z"}:
        raise RuntimeError("The source coordinate contract changed; adapt this authoring script explicitly.")
    if args.stride_length<=0 or args.rock_triangle_budget<1000:
        raise RuntimeError("Stride length must be positive; rock triangle budget must be at least 1000.")
    art_dir=project/"art/mountain-slice"
    models_dir=project/"dist/models"
    environment_path=models_dir/"tiger-walk-environment-v1.glb"
    character_output=models_dir/"tiger-hiker-v1.glb"
    blend_path=art_dir/"tiger-walk-v1.blend"
    report_path=art_dir/"build-report.json"
    derived_paths=[art_dir/"materials"/(name+"-from-atlas.png") for name in ["rock","earth","grass","farrock"]]
    generated_paths=[blend_path,environment_path,character_output,*derived_paths]
    protect_existing(generated_paths,report_path,project,args.replace_generated)
    art_dir.mkdir(parents=True,exist_ok=True)
    models_dir.mkdir(parents=True,exist_ok=True)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene=bpy.context.scene
    scene.unit_settings.system="METRIC"
    scene.unit_settings.scale_length=1
    scene.render.engine="CYCLES"
    scene.cycles.samples=48
    scene.render.bake.margin=12
    scene.render.bake.use_selected_to_active=False
    scene.render.bake.target="IMAGE_TEXTURES"
    scene["AO_normal_bake_status"]="Bake targets configured; AO/normal maps are not claimed baked by this script"
    scene.render.resolution_x=1920
    scene.render.resolution_y=1080
    scene.render.resolution_percentage=100
    scene.render.fps=30
    scene.frame_start=1
    scene.frame_end=750
    environment=collection("Environment")
    characters=collection("Character")
    sources=collection("SourceRockAssets")
    source_records=[safe_source(path,project) for path in [character_path,*rocks]]
    animation_sources=[safe_source(path,project) for path in animation_paths]
    tiles=atlas_tiles(atlas,art_dir/"materials")
    mats={"cliff":material("Watercolor layered cliff",(.62,.61,.52),tiles["rock"]),
          "earth":material("Watercolor walking earth",(.76,.69,.52),tiles["earth"]),
          "grass":material("Sage cliff leaves",(.38,.47,.29),tiles["grass"],double_sided=True),
          "stoneLight":material("Ochre sediment light",(.64,.61,.49)),
          "stoneShade":material("Cool sediment seam",(.43,.48,.43)),
          "river":material("Jinsha blue grey",(.31,.47,.44),roughness=.58),
          "foam":material("Broken river foam",(.78,.82,.71),double_sided=True)}
    for index,color in enumerate([(.46,.53,.49),(.55,.61,.55),(.64,.69,.61),(.72,.75,.67)]):
        # Distant colour layers stay deliberately flat and desaturated; a
        # detailed repeated close-rock map would defeat atmospheric recession.
        mats["far"+str(index)]=material("Far ridge wash "+str(index+1),color)
    character,character_objects,action_report=prepare_character(character_path,characters,contract,args,source_records[0],animation_paths)
    character["additionalAnimationSources"]=json.dumps(animation_sources,ensure_ascii=False)
    templates=[]
    for index,(path,record) in enumerate(zip(rocks,source_records[1:])):
        template,objects,actions,_scale=import_asset(path,sources,f"SourceRockAsset_{index+1}",1.0)
        if any(obj.type=="ARMATURE" for obj in objects):
            raise RuntimeError(f"Rock source {path.name} must be static, not a rigged character.")
        for obj in objects:
            if obj.type!="MESH":
                continue
            # Shared mesh data is retained across deliberate rock placements.
            triangles=sum(max(0,len(poly.vertices)-2) for poly in obj.data.polygons)
            if triangles>args.rock_triangle_budget:
                bpy.ops.object.select_all(action="DESELECT")
                obj.select_set(True)
                bpy.context.view_layer.objects.active=obj
                modifier=obj.modifiers.new("Local detail triangle budget","DECIMATE")
                modifier.ratio=args.rock_triangle_budget/triangles
                bpy.ops.object.modifier_apply(modifier=modifier.name)
        template["provenance"]=json.dumps(record,ensure_ascii=False)
        templates.append(template)
    route=Route(contract)
    env=author_environment(route,contract,environment,templates,mats)
    env["materialAtlas"]=str(atlas.relative_to(project)) if atlas.is_relative_to(project) else atlas.name
    env["sourceAssets"]=json.dumps(source_records[1:],ensure_ascii=False)
    # Native file has an explicit lighting/baking workspace; exported runtime
    # GLBs carry no lights, cameras or assertion of completed visual acceptance.
    lighting=collection("LightingAndPreview")
    sun_data=bpy.data.lights.new("Soft afternoon sun","SUN")
    sun_data.energy=2.2
    sun_data.angle=math.radians(17)
    sun=bpy.data.objects.new("Soft afternoon sun",sun_data)
    lighting.objects.link(sun)
    sun.rotation_euler=(math.radians(28),math.radians(-24),math.radians(-38))
    world=bpy.data.worlds.new("Warm paper atmosphere")
    world.use_nodes=True
    world.node_tree.nodes["Background"].inputs["Color"].default_value=(.73,.77,.66,1)
    world.node_tree.nodes["Background"].inputs["Strength"].default_value=.42
    scene.world=world
    camera_data=bpy.data.cameras.new("Walking slice preview")
    camera_data.angle=math.radians(contract["camera"]["fov"])
    camera_data.clip_end=900
    camera=bpy.data.objects.new("Walking slice preview",camera_data)
    lighting.objects.link(camera)
    start=contract["controlPoints"][0]
    camera.location=bv((start["x"]-.4,start["y"]+contract["camera"]["eyeHeight"],start["z"]+contract["camera"]["initialFollowDistance"]))
    target=bv((start["x"]+4,start["y"]+.8,start["z"]-8))
    camera.rotation_euler=(target-camera.location).to_track_quat("-Z","Y").to_euler()
    scene.camera=camera
    sources.hide_render=True
    sources.hide_viewport=True
    # Export the character at the agreed local origin; move it to the path only
    # for the editable .blend composition after the runtime character is saved.
    stage=art_dir/(".build-stage-"+datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%f"))
    stage.mkdir()
    export_glb(stage/environment_path.name,[env,*env.children_recursive],False)
    export_glb(stage/character_output.name,character_objects,True)
    character.location=bv((start["x"],start["y"]+.025,start["z"]))
    scene["slice_contract"]=json.dumps(contract,ensure_ascii=False)
    scene["implementation_status"]="Authored slice; browser, camera framing, gait and sound acceptance remain separate"
    bpy.ops.file.pack_all()
    bpy.ops.wm.save_as_mainfile(filepath=str(stage/blend_path.name),compress=True)
    # All three artifacts must finish creation before replacing generated work.
    # A failing authoring/export stage leaves prior final files untouched.
    for output in [environment_path,character_output,blend_path]:
        (stage/output.name).replace(output)
    shutil.rmtree(stage)
    report={"generator":GENERATOR,"createdAt":datetime.now(timezone.utc).isoformat(),"contract":contract["id"],
            "scope":"20–30 second authored sample only", "routeLength":route.length,
            "sources":source_records,"additionalAnimationSources":animation_sources,"animations":action_report,
            "outputs":[str(path.relative_to(project)) for path in [blend_path,environment_path,character_output]],
            "generatedFileHashes":{str(path.relative_to(project)):file_hash(path) for path in generated_paths},
            "acceptance":"Not performed by this authoring script", "aoNormalBake":"Configured only, not baked"}
    report_path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps({"created":report["outputs"],"actualAnimations":[a["exportName"] for a in action_report]},ensure_ascii=False))


if __name__=="__main__":
    try:
        main()
    except Exception as error:
        print(f"Mountain slice authoring failed: {error}",file=sys.stderr)
        raise
