import Sound from 'react-native-sound';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Vibration} from 'react-native';

// Enable playback in silence mode
Sound.setCategory('Playback', true);

const SOUND_FILES = {
  correct: ['correct', 'correct.mp3'],
  wrong: ['wrong', 'wrong.mp3'],
  levelup: ['levelup', 'levelup.mp3'],
};

const tryPlayCandidates = (candidates, type) => {
  const tryAt = index => {
    if (index >= candidates.length) {
      Vibration.vibrate(type === 'wrong' ? 120 : 60);
      return;
    }
    const candidate = candidates[index];
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
    console.error('Error playing sound', e);
    Vibration.vibrate(type === 'wrong' ? 120 : 60);
  }
};

export default {
  playSound,
};
