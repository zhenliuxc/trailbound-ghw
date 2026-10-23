interface ProceduralCharacterPose {
  clock: number;
  walking: boolean;
  reduced: boolean;
  action: string;
  kitMotion?: boolean;
  detailed?: boolean;
}

const cycleSeconds = 1.24;
const tau = Math.PI * 2;
const number = (value: number) => value.toFixed(3);

/** The map's own clock drives this drawn figure; it has no asset or frame loop. */
export function createProceduralMapCharacter(document: Document) {
  const facing = document.getElementById('hiker-facing');
  if (!facing) throw new Error('Missing map character placement: hiker-facing');

  const hiddenArt = ['hiker-art-crop', 'hiker-art-status'].flatMap(id => {
    const element = document.getElementById(id);
    if (!element) return [];
    const visibility = element.getAttribute('visibility');
    element.setAttribute('visibility', 'hidden');
    return [{ element, visibility }];
  });
  function node<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string>, parent: Element) {
    const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [name, value] of Object.entries(attrs)) element.setAttribute(name, value);
    parent.append(element);
    return element;
  }
  const details: SVGGElement[] = [];
  function detailGroup(parent: Element): SVGGElement {
    const group = node('g', { visibility: 'hidden', 'pointer-events': 'none' }, parent);
    details.push(group);
    return group;
  }
  const figure = node('g', { id: 'procedural-map-hiker', transform: 'translate(0 -3.096) scale(1.18)', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, facing);
  const legBack = node('path', { fill: 'none', stroke: '#969176', 'stroke-width': '3.5' }, figure);
  const shoeBack = node('path', { fill: 'none', stroke: '#685b48', 'stroke-width': '2' }, figure);
  const torso = node('g', {}, figure);
  const pack = node('g', {}, torso);
  node('path', { d: 'M-13-13Q-14-18-8-18Q-3-18-2-13L-2 2Q-6 6-13 3Z', fill: '#879267', stroke: '#657452', 'stroke-width': '.75' }, pack);
  node('path', { d: 'M-12-7Q-8-9-4-7V0Q-8 2-12 0Z', fill: '#a1a879', stroke: '#71805a', 'stroke-width': '.55' }, pack);
  node('path', { d: 'M-11-14H-4M-10-18Q-7-21-4-17M-10-5H-6', fill: 'none', stroke: '#c7cba1', 'stroke-width': '.8' }, pack);
  node('rect', { x: '-16', y: '-4', width: '4', height: '8', rx: '1.5', fill: '#8ea7a2', stroke: '#657f7b', 'stroke-width': '.5' }, pack);
  node('path', { d: 'M-15-4V-6H-13V-4', fill: '#647b70' }, pack);
  const packDetail = detailGroup(pack);
  node('path', { d: 'M-12-13Q-11-16-8-16H-4M-11-5V-1M-5-5V-1', fill: 'none', stroke: '#c5cca1', 'stroke-width': '.5' }, packDetail);
  node('path', { d: 'M-11-15V-10H-9V-15M-5-15V-10H-3V-14', fill: 'none', stroke: '#6d7654', 'stroke-width': '.65' }, packDetail);
  node('rect', { x: '-10.8', y: '-10.2', width: '2', height: '1.6', rx: '.3', fill: '#d8cf9b', stroke: '#74805a', 'stroke-width': '.3' }, packDetail);
  node('path', { d: 'M-13 2L-4 3.1Q-1 5-3 6.5L-13 5.2Z', fill: '#c1b48e', stroke: '#887e5e', 'stroke-width': '.6' }, packDetail);
  node('ellipse', { cx: '-3.3', cy: '4.7', rx: '1.6', ry: '1.8', fill: '#ded0a8', stroke: '#928664', 'stroke-width': '.45' }, packDetail);
  node('path', { d: 'M-3.5 3.5Q-2 4-2.9 5.2Q-3.8 5.9-4 4.7M-10 2.4L-10 5.5M-6 2.8L-6 5.9M-14.7-3V1', fill: 'none', stroke: '#8b835f', 'stroke-width': '.4' }, packDetail);
  const armBack = node('path', { fill: 'none', stroke: '#6c8188', 'stroke-width': '3' }, torso);
  const handBack = node('circle', { r: '1.5', fill: '#dec19c' }, torso);
  node('path', { d: 'M-4-13Q0-15 4-12L7 3Q1 5-5 3Z', fill: '#829aa0', stroke: '#5d7a81', 'stroke-width': '.7' }, torso);
  node('path', { d: 'M-3-12Q0-9 3-12M1-10V2M3-4H5V-1H3', fill: 'none', stroke: '#b3c3bf', 'stroke-width': '.65' }, torso);
  node('path', { d: 'M-4-12Q-2-7-3 1', fill: 'none', stroke: '#697455', 'stroke-width': '1.3' }, torso);
  const coatDetail = detailGroup(torso);
  node('path', { d: 'M-2-11Q0-10 2-11M-2-3H0V0H-2ZM2-9L4-5M-3 2Q1 3 5 2', fill: 'none', stroke: '#c1cfca', 'stroke-width': '.45' }, coatDetail);
  node('path', { d: 'M-3-8H4', fill: 'none', stroke: '#596f67', 'stroke-width': '.9' }, coatDetail);
  node('rect', { x: '-.2', y: '-8.7', width: '1.8', height: '1.4', rx: '.3', fill: '#c8c49b', stroke: '#68745a', 'stroke-width': '.3' }, coatDetail);
  const scarf = node('g', {}, torso);
  node('path', { d: 'M-4-16Q-10-18-17-12L-16-9Q-9-13-1-14Z', fill: '#aa6658', stroke: '#88574e', 'stroke-width': '.5' }, scarf);
  node('path', { d: 'M-5-15Q0-17 5-15L4-12Q0-13-4-12Z', fill: '#b67662', stroke: '#955f50', 'stroke-width': '.5' }, torso);
  node('path', { d: 'M-5-24Q-4-29 2-27Q7-26 6-22L8-20L6-19Q6-15 1-15L-3-17Q-6-19-5-24Z', fill: '#e3c39f', stroke: '#aa9274', 'stroke-width': '.55' }, torso);
  node('path', { d: 'M-5-23Q-1-21-3-18L-5-19Z', fill: '#776857' }, torso);
  node('path', { d: 'M3-17Q5-16 6-18', fill: 'none', stroke: '#af816c', 'stroke-width': '.45' }, torso);
  node('path', { d: 'M-7-23Q-7-30 1-29Q8-28 8-23Z', fill: '#c4b88c', stroke: '#968c67', 'stroke-width': '.65' }, torso);
  node('path', { d: 'M-6-23Q1-24 7-23L7-21Q0-20-6-22Z', fill: '#88916c' }, torso);
  node('path', { d: 'M-9-22Q1-19 11-21Q8-23 5-23', fill: '#d5c79b', stroke: '#978e6c', 'stroke-width': '.65' }, torso);
  node('circle', { cx: '3.8', cy: '-20', r: '.65', fill: '#51594a' }, torso);
  const headDetail = detailGroup(torso);
  node('path', { d: 'M-4-27Q0-29 4-26M-6-22.2Q1-21 7-21.8M-7-21Q0-18.9 9-20.5', fill: 'none', stroke: '#e6dab3', 'stroke-width': '.45' }, headDetail);
  node('path', { d: 'M-2-27L-3-24M3-26L4-23M-3.8-19Q-2-20-2-18M2.9-21.4L4.4-21.4', fill: 'none', stroke: '#8f8062', 'stroke-width': '.35' }, headDetail);
  node('path', { d: 'M-3-16L-1-15M-3-15L-1-14', fill: 'none', stroke: '#d5a38b', 'stroke-width': '.4' }, headDetail);
  const armFront = node('path', { fill: 'none', stroke: '#90a6a9', 'stroke-width': '3.3' }, torso);
  const handFront = node('circle', { r: '1.6', fill: '#e3c39f' }, torso);
  const camera = node('g', { visibility: 'hidden' }, torso);
  node('rect', { x: '6', y: '-20', width: '10', height: '6', rx: '1.4', fill: '#506a66', stroke: '#d5d8ba', 'stroke-width': '.6' }, camera);
  node('circle', { cx: '11.5', cy: '-17', r: '2', fill: '#acc5bf', stroke: '#375450', 'stroke-width': '.8' }, camera);
  const legFront = node('path', { fill: 'none', stroke: '#aca587', 'stroke-width': '3.8' }, figure);
  const shoeFront = node('path', { fill: 'none', stroke: '#584c3d', 'stroke-width': '2' }, figure);
  const bootBackDetail = detailGroup(figure);
  const bootFrontDetail = detailGroup(figure);
  for (const boot of [bootBackDetail, bootFrontDetail]) {
    node('path', { d: 'M-1 1.05H2.7M-.6-.9L.2-.4M.3-.9L1-.4', fill: 'none', stroke: '#c0ad84', 'stroke-width': '.4' }, boot);
    node('path', { d: 'M-1.1 1.5H2.8', fill: 'none', stroke: '#4e493a', 'stroke-width': '.35' }, boot);
  }
  let disposed = false;
  let detailed = false;

  function leg(path: SVGPathElement, shoe: SVGPathElement, boot: SVGGElement, phase: number, offset: number, bob: number, moving: boolean) {
    const t = (phase + offset) % 1;
    const swing = Math.max(0, (t - .62) / .38);
    const x = moving ? t < .62 ? 3.9 - t / .62 * 7.8 : -3.9 + swing * 7.8 : offset ? 2.5 : -2.5;
    const y = 16.1 - (moving ? Math.sin(swing * Math.PI) * 3.1 : 0);
    const hipX = offset ? 1 : -1, hipY = 3.1 - bob;
    const dx = x - hipX, dy = y - hipY, length = Math.hypot(dx, dy);
    const along = length / 2;
    const bend = Math.sqrt(Math.max(0, 7.4 * 7.4 - along * along));
    const kneeX = hipX + dx / 2 + dy / length * bend;
    const kneeY = hipY + dy / 2 - dx / length * bend;
    path.setAttribute('d', `M${number(hipX)} ${number(hipY)}L${number(kneeX)} ${number(kneeY)}L${number(x)} ${number(y)}`);
    shoe.setAttribute('d', `M${number(x - 1)} ${number(y + .1)}L${number(x + 2.6)} ${number(y + .1)}`);
    boot.setAttribute('transform', `translate(${number(x)} ${number(y)})`);
  }
  function arm(path: SVGPathElement, hand: SVGCircleElement, shoulderX: number, elbowX: number, elbowY: number, handX: number, handY: number) {
    path.setAttribute('d', `M${shoulderX}-8Q${number(elbowX)} ${number(elbowY)} ${number(handX)} ${number(handY)}`);
    hand.setAttribute('cx', number(handX)); hand.setAttribute('cy', number(handY));
  }
  function paint(pose: ProceduralCharacterPose): void {
    if (disposed) return;
    if (detailed !== !!pose.detailed) {
      detailed = !!pose.detailed;
      for (const detail of details) detail.setAttribute('visibility', detailed ? 'visible' : 'hidden');
      figure.setAttribute('data-detail', detailed ? 'wugong' : 'standard');
    }
    const moving = pose.walking && !pose.reduced;
    const phase = ((pose.clock / cycleSeconds) % 1 + 1) % 1;
    const swing = moving ? Math.sin(phase * tau) : 0;
    const bob = moving ? .3 * (1 - Math.cos(phase * tau * 2)) : 0;
    leg(legBack, shoeBack, bootBackDetail, phase, .5, bob, moving);
    leg(legFront, shoeFront, bootFrontDetail, phase, 0, bob, moving);
    torso.setAttribute('transform', `translate(0 ${number(-bob)})`);
    pack.setAttribute('transform', `rotate(${number(swing * .8)} -7 -12)`);
    scarf.setAttribute('transform', `rotate(${number(moving ? Math.sin(phase * tau - .4) * 3 : 0)} -2 -15)`);
    camera.setAttribute('visibility', pose.action === 'photo' ? 'visible' : 'hidden');
    arm(armBack, handBack, -4, -7 + swing, -3, -6 + swing * 2, 2);
    arm(armFront, handFront, 4, 7 - swing, -3, 6 - swing * 2, 2);
    if (pose.action === 'photo') {
      arm(armFront, handFront, 4, 10, -10, 11, -16);
      arm(armBack, handBack, -4, 0, -13, 7, -16);
    } else if (pose.action === 'look' || pose.action === 'discover') {
      arm(armFront, handFront, 4, 10, -13, 7, -22);
    } else if (pose.action === 'shelter') {
      arm(armFront, handFront, 4, 9, -5, 3, -13);
      arm(armBack, handBack, -4, -7, -3, 0, -11);
    } else if (pose.action === 'finish') {
      arm(armFront, handFront, 4, 11, -14, 12, -22);
    }
  }
  paint({ clock: 0, walking: false, reduced: false, action: 'ready' });
  return {
    paint,
    destroy(): void {
      if (disposed) return;
      disposed = true;
      figure.remove();
      for (const { element, visibility } of hiddenArt) {
        if (visibility === null) element.removeAttribute('visibility');
        else element.setAttribute('visibility', visibility);
      }
    },
  };
}
