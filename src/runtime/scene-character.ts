interface SceneCharacterVisibility {
  dialogue: boolean;
  photo: boolean;
}

type CharacterAsset =
  | { kind: 'loading' }
  | { kind: 'ready' }
  | { kind: 'failed' };

type CharacterPose = 'dialogue' | 'view';

const CHARACTER_FILE = 'characters/trailbound-realistic-v1.webp';

/** Adds the traveler's illustration beside existing scene text. Owns no route or reward state. */
export function createSceneCharacter(document: Document) {
  const storyPanel = document.getElementById('story-panel');
  const storyCopy = document.getElementById('story-copy');
  const photoPanel = document.getElementById('photo-panel');
  const photoTop = photoPanel?.querySelector<HTMLElement>('.photo-top');
  if (!storyPanel || !storyCopy || !photoPanel || !photoTop) {
    throw new Error('Missing story or photo character placement');
  }

  function portrait(pose: CharacterPose, label: string) {
    const frame = document.createElement('span');
    frame.className = `scene-character scene-character-${pose}`;
    frame.hidden = true;
    frame.setAttribute('role', 'img');
    frame.setAttribute('aria-label', label);
    const bounds = pose === 'dialogue' ? { x: 380, y: 24, width: 401, height: 843 }
      : { x: 1057, y: 25, width: 357, height: 848 };
    frame.style.setProperty('--scene-character-ratio', String(bounds.width / bounds.height));
    const art = document.createElement('span');
    art.className = 'scene-character-art';
    art.setAttribute('aria-hidden', 'true');
    const status = document.createElement('span');
    status.className = 'scene-character-status';
    status.textContent = '人物画作展开中';
    status.setAttribute('aria-hidden', 'true');
    frame.append(art, status);
    return { frame, art, status, label, bounds };
  }

  const dialogue = portrait('dialogue', '戴草帽、背着背包的旅人，停步交谈');
  const view = portrait('view', '戴草帽、背着背包的旅人，停步看风景');
  const storyContent = document.createElement('div');
  storyContent.className = 'scene-character-story';
  storyCopy.before(storyContent);
  storyContent.append(dialogue.frame, storyCopy);
  photoTop.prepend(view.frame);

  const portraits = [dialogue, view];
  const source = document.createElement('img');
  source.decoding = 'async';
  let asset: CharacterAsset = { kind: 'loading' };
  let destroyed = false;

  function showAsset() {
    if (destroyed) return;
    for (const item of portraits) {
      item.frame.dataset.asset = asset.kind;
      item.frame.setAttribute('aria-label', asset.kind === 'failed' ? '人物插画暂未加载，场景文字仍可阅读' : item.label);
      if (asset.kind === 'ready') {
        const bounds = item.bounds;
        item.art.style.backgroundImage = `url("${CHARACTER_FILE}")`;
        item.art.style.backgroundSize = `${1774 / bounds.width * 100}% ${887 / bounds.height * 100}%`;
        item.art.style.backgroundPosition = `${bounds.x / (1774 - bounds.width) * 100}% ${bounds.y / (887 - bounds.height) * 100}%`;
        item.status.hidden = true;
      } else {
        item.status.hidden = false;
        item.status.textContent = asset.kind === 'failed' ? '人物插画暂未加载' : '人物画作展开中';
      }
    }
  }

  source.onload = () => {
    const reveal = () => {
      if (destroyed) return;
      asset = source.naturalWidth === 1774 && source.naturalHeight === 887
        ? { kind: 'ready' }
        : { kind: 'failed' };
      showAsset();
    };
    // One decoded sheet supplies both poses; scene changes do not reload or decode it.
    if (source.decode) source.decode().then(reveal, reveal);
    else reveal();
  };
  source.onerror = () => {
    if (destroyed) return;
    asset = { kind: 'failed' };
    showAsset();
  };
  showAsset();
  source.src = CHARACTER_FILE;

  return {
    render(visibility: SceneCharacterVisibility): void {
      if (destroyed) return;
      dialogue.frame.hidden = !visibility.dialogue;
      view.frame.hidden = !visibility.photo;
      storyPanel.classList.toggle('has-scene-character', visibility.dialogue);
      photoPanel.classList.toggle('has-scene-character', visibility.photo);
    },
    destroy(): void {
      if (destroyed) return;
      destroyed = true;
      source.onload = null;
      source.onerror = null;
      dialogue.frame.hidden = true;
      view.frame.hidden = true;
      storyContent.before(storyCopy);
      storyContent.remove();
      view.frame.remove();
      storyPanel.classList.remove('has-scene-character');
      photoPanel.classList.remove('has-scene-character');
    },
  };
}
