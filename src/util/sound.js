import Sound from 'react-native-sound';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Enable playback in silence mode
Sound.setCategory('Playback');

const loadSound = (fileName) => {
  return new Sound(fileName, Sound.MAIN_BUNDLE, (error) => {
    if (error) {
      console.log('failed to load the sound', error);
      return;
    }
  });
};

// These would need actual files in android/app/src/main/res/raw or ios/Resources
const sounds = {
  correct: loadSound('correct.mp3'),
  wrong: loadSound('wrong.mp3'),
  levelup: loadSound('levelup.mp3'),
};

export const playSound = async (type) => {
  try {
    const soundEnabled = await AsyncStorage.getItem('settings.sounds');
    if (soundEnabled === 'false') return;

    const sound = sounds[type];
    if (sound) {
      sound.play((success) => {
        if (!success) {
          console.log('playback failed due to audio decoding errors');
        }
      });
    }
  } catch (e) {
    console.error('Error playing sound', e);
  }
};
