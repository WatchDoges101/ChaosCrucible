export function hasRegisteredScene(scene, sceneKey) {
  if (!scene?.scene) {
    return false;
  }

  try {
    const existingScene = scene.scene.get(sceneKey);
    if (existingScene) {
      return true;
    }
  } catch (error) {
  }

  return Boolean(scene.scene.manager?.keys?.[sceneKey]);
}

export function ensureSceneRegistered(scene, sceneKey) {
  if (hasRegisteredScene(scene, sceneKey)) {
    return true;
  }

  const sceneClass = window?.sceneClasses?.[sceneKey];
  if (!sceneClass) {
    console.error(`[PauseHelpers] Missing scene class for ${sceneKey}`);
    return false;
  }

  scene.scene.add(sceneKey, sceneClass, false);
  return hasRegisteredScene(scene, sceneKey);
}

export function openPauseMenu(scene, gameSceneKey = 'ChaossCrucibleScene') {
  if (scene.scene.isPaused(gameSceneKey)) {
    return false;
  }

  if (!ensureSceneRegistered(scene, 'PauseScene')) {
    return false;
  }

  if (scene.scene.isActive('PauseScene') || scene.scene.isSleeping('PauseScene')) {
    scene.scene.stop('PauseScene');
  }

  scene.scene.pause(gameSceneKey);
  scene.scene.run('PauseScene', { gameSceneKey });
  scene.scene.bringToTop('PauseScene');
  return true;
}

export function resumeFromPause(scene, gameSceneKey = 'ChaossCrucibleScene') {
  scene.scene.stop('PauseScene');
  if (hasRegisteredScene(scene, gameSceneKey)) {
    scene.scene.resume(gameSceneKey);
  }
}

export function openOptionsFromPause(scene, gameSceneKey = 'ChaossCrucibleScene') {
  if (!ensureSceneRegistered(scene, 'OptionsScene')) {
    return false;
  }

  scene.scene.stop('PauseScene');
  scene.scene.start('OptionsScene', {
    returnScene: 'PauseScene',
    gameSceneKey
  });
  return true;
}

export function quitToMenuFromPause(scene, gameSceneKey = 'ChaossCrucibleScene') {
  scene.scene.stop('PauseScene');
  if (hasRegisteredScene(scene, gameSceneKey)) {
    scene.scene.stop(gameSceneKey);
  }
  scene.scene.start('MenuScene');
}
