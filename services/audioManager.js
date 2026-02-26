import { Howl } from 'howler';

/**
 * AudioManager
 * Centralized audio control using Howler.
 * Patterns:
 *  - Organize by category (bgm, sfx, voice)
 *  - Use volume groups for easy muting
 *  - Pre-load sounds to avoid delays
 */
class AudioManager {
  constructor() {
    this.sounds = {};
    this.music = null;
    this.masterVolume = 1.0;
    this.sfxVolume = 1.0;
    this.musicVolume = 0.6;
    this.voiceVolume = 1.0;
  }

  /**
   * Register a sound effect
   */
  registerSFX(key, src, volume = 1.0) {
    if (!this.sounds[key]) {
      this.sounds[key] = new Howl({
        src: [src],
        volume: volume * this.sfxVolume * this.masterVolume,
        preload: true
      });
    }
  }

  /**
   * Register background music
   */
  registerMusic(key, src, volume = 0.6) {
    this.sounds[key] = new Howl({
      src: [src],
      volume: volume * this.musicVolume * this.masterVolume,
      loop: true,
      preload: true
    });
  }

  /**
   * Play a sound effect
   */
  playSFX(key) {
    if (this.sounds[key]) {
      this.sounds[key].play();
    } else {
      console.warn(`[Audio] SFX "${key}" not found`);
    }
  }

  /**
   * Play music (stops previous track)
   */
  playMusic(key, fadeIn = false) {
    if (this.music) {
      this.music.stop();
    }
    if (this.sounds[key]) {
      this.music = this.sounds[key];
      if (fadeIn) {
        this.music.fade(0, this.musicVolume * this.masterVolume, 1000);
      }
      this.music.play();
    } else {
      console.warn(`[Audio] Music "${key}" not found`);
    }
  }

  /**
   * Stop all audio
   */
  stopAll() {
    Object.values(this.sounds).forEach(sound => sound.stop());
    this.music = null;
  }

  /**
   * Set master volume (affects all)
   */
  setMasterVolume(vol) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    Object.values(this.sounds).forEach(sound => {
      sound.volume(this.masterVolume);
    });
  }

  /**
   * Set SFX volume
   */
  setSFXVolume(vol) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    // Update all non-music sounds
  }

  /**
   * Set music volume
   */
  setMusicVolume(vol) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.music) {
      this.music.volume(this.musicVolume * this.masterVolume);
    }
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.stopAll();
    Object.values(this.sounds).forEach(sound => sound.unload());
    this.sounds = {};
  }
}

// Global singleton
export const audioManager = new AudioManager();
