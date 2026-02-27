import { openPauseMenu } from '../helpers/pauseHelpers.js';

export function attachPauseKey(scene, gameSceneKey = 'ChaossCrucibleScene') {
  const escHandler = () => {
    openPauseMenu(scene, gameSceneKey);
  };

  scene.input.keyboard.on('keydown-ESC', escHandler);
  return escHandler;
}

export function detachPauseKey(scene, escHandler) {
  if (!escHandler) {
    return;
  }

  scene.input.keyboard.off('keydown-ESC', escHandler);
}
