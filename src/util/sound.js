import Sound from 'react-native-sound';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Vibration} from 'react-native';

// Enable playback in silence mode
Sound.setCategory('Playback', true);

const SOUND_FILES = {
  correct: ['correct.mp3', 'correct'],
  wrong: ['wrong.mp3', 'wrong'],
  levelup: ['levelup.mp3', 'levelup'],
};

const tryPlayCandidates = (candidates, type) => {
  const tryAt = index => {
    if (index >= candidates.length) {
      Vibration.vibrate(type === 'wrong' ? 120 : 60);
      return;
    }
    const candidate = candidates[index];
    try {
      const sound = new Sound(candidate, Sound.MAIN_BUNDLE, error => {
        if (error) {
          // Try next candidate format to handle Android/iOS differences.
          tryAt(index + 1);
          return;
        }
        sound.play(success => {
          if (!success) {
            Vibration.vibrate(type === 'wrong' ? 120 : 60);
          }
          sound.release();
        });
      });
    } catch (_e) {
      tryAt(index + 1);
    }
  };

  tryAt(0);
};

export const playSound = async type => {
  try {
    const soundEnabled = await AsyncStorage.getItem('settings.sounds');
    if (soundEnabled === 'false') return;
    const candidates = SOUND_FILES[type];
    if (!candidates) return;
    tryPlayCandidates(candidates, type);
  } catch (e) {
    // Avoid console.error here - RN shows redbox for handled runtime issues.
    console.log('sound fallback active');
    Vibration.vibrate(type === 'wrong' ? 120 : 60);
  }
};

export default {
  playSound,
};
