"""Resample public Wugong elevation data for the program-drawn walking scene."""
import argparse
import json
from pathlib import Path
import numpy as np

parser = argparse.ArgumentParser()
parser.add_argument('--source', type=Path, required=True)
parser.add_argument('--output', type=Path, required=True)
parser.add_argument('--columns', type=int, default=481)
parser.add_argument('--rows', type=int, default=561)
args = parser.parse_args()
if not 2 <= args.columns <= 600 or not 2 <= args.rows <= 700:
    parser.error('Use 2–600 columns and 2–700 rows, matching the browser terrain format.')
source = np.load(args.source)
elevation = source['elevation']
west, east, south, north = source['bounds']
columns, rows = args.columns, args.rows
x_min, x_max, z_min, z_max = -2.8, 2.4, -1.60, 3.70

def sample(x, z):
    u = np.clip((np.asarray(x) + 1.75) / 3.5, 0, 1) * (elevation.shape[1] - 1)
    latitude = 27.4675 + np.asarray(z) * (.095 / 3)
    v = np.clip((north - latitude) / (north - south), 0, 1) * (elevation.shape[0] - 1)
    x0, y0 = np.floor(u).astype(int), np.floor(v).astype(int)
    x1, y1 = np.minimum(x0 + 1, elevation.shape[1] - 1), np.minimum(y0 + 1, elevation.shape[0] - 1)
    a, b = u - x0, v - y0
    return elevation[y0, x0] * (1-a) * (1-b) + elevation[y0, x1] * a * (1-b) + elevation[y1, x0] * (1-a) * b + elevation[y1, x1] * a * b

xs, zs = np.linspace(x_min, x_max, columns), np.linspace(z_min, z_max, rows)
xx, zz = np.meshgrid(xs, zs)
heights = np.rint(sample(xx, zz)).astype(int)
ridge_z = np.linspace(-.90, .10, 181)
horizon = [round(float(ridge_z[np.argmax(sample(x, ridge_z))]) - .075, 4) for x in xs]
payload = dict(version=1, columns=columns, rows=rows, xMin=x_min, xMax=x_max, zMin=z_min, zMax=z_max,
               heights=heights.ravel().tolist(), horizon=horizon,
               attribution='Mapzen / USGS SRTM and GMTED2010. Terrain Tiles accessed 2026-10-17.',
               source='https://registry.opendata.aws/terrain-tiles/',
               license='https://github.com/tilezen/joerd/blob/master/docs/attribution.md',
               changes='Resampled elevations, scenic northern-face cut, exaggerated vertical scale, original program shading. Route is an artistic schematic.')
args.output.parent.mkdir(parents=True, exist_ok=True)
args.output.write_text(json.dumps(payload, separators=(',', ':')))
print(f'Wrote program terrain grid: {columns} × {rows}; no background painting exported.')
