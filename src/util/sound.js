import Sound from 'react-native-sound';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Vibration} from 'react-native';

// Enable playback in silence mode
Sound.setCategory('Playback', true);

const SOUND_FILES = {
  // Android raw resources should be referenced without extension.
  correct: 'correct',
  wrong: 'wrong',
  levelup: 'levelup',
};

export const playSound = async type => {
  try {
    const soundEnabled = await AsyncStorage.getItem('settings.sounds');
    if (soundEnabled === 'false') return;
    const soundFile = SOUND_FILES[type];
    if (!soundFile) return;

    const sound = new Sound(soundFile, Sound.MAIN_BUNDLE, error => {
      if (error) {
        console.log('failed to load the sound', error);
        Vibration.vibrate(type === 'wrong' ? 120 : 60);
        return;
      }
      sound.play(success => {
        if (!success) {
          console.log('playback failed due to audio decoding errors');
          Vibration.vibrate(type === 'wrong' ? 120 : 60);
        }
        sound.release();
      });
    });
  } catch (e) {
    console.error('Error playing sound', e);
    Vibration.vibrate(type === 'wrong' ? 120 : 60);
  }
};

export default {
  playSound,
};
