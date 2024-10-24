// import React from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   Alert,
//   Dimensions,
//   Platform,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import {CommonActions, useNavigation} from '@react-navigation/native';
// import LinearGradient from 'react-native-linear-gradient';
// import Animated, {
//   useAnimatedStyle,
//   useSharedValue,
//   withSpring,
//   withSequence,
//   withTiming,
//   FadeIn,
//   Layout,
//   ZoomIn,
// } from 'react-native-reanimated';
// import Icon from 'react-native-vector-icons/FontAwesome5';

// const {width} = Dimensions.get('window');
// const BUTTON_SIZE = width * 0.15;
// const SPRING_CONFIG = {
//   damping: 12,
//   mass: 1,
//   stiffness: 100,
// };

// const Quiz = () => {
//   const [unlockedLevels, setUnlockedLevels] = React.useState(1);
//   const navigation = useNavigation();
//   const scrollViewRef = React.useRef(null);

//   React.useEffect(() => {
//     loadUnlockedLevels();
//   }, []);

//   const loadUnlockedLevels = async () => {
//     try {
//       const level = await AsyncStorage.getItem('unlockedLevel');
//       if (level) {
//         setUnlockedLevels(parseInt(level));
//       }
//     } catch (error) {
//       console.error('Error loading levels:', error);
//     }
//   };

//   const handleLevelPress = level => {
//     if (level <= unlockedLevels) {
//       navigation.navigate('QuestionScreen', {level});
//     } else {
//       Alert.alert(
//         'Level Locked',
//         'Complete previous levels to unlock this one!',
//       );
//     }
//   };

//   const LevelButton = React.memo(({levelNum, onPress, index}) => {
//     const isUnlocked = levelNum <= unlockedLevels;
//     const scale = useSharedValue(1);

//     const rStyle = useAnimatedStyle(() => {
//       return {
//         transform: [{scale: scale.value}],
//       };
//     });

//     const handlePress = () => {
//       scale.value = withSequence(
//         withSpring(0.95, SPRING_CONFIG),
//         withSpring(1, SPRING_CONFIG),
//       );
//       onPress(levelNum);
//     };

//     return (
//       <Animated.View
//         entering={ZoomIn.delay(25 * index).springify()}
//         layout={Layout.springify()}
//         style={[styles.levelButtonContainer]}>
//         <Animated.View style={rStyle}>
//           <TouchableOpacity activeOpacity={0.8} onPress={handlePress}>
//             <LinearGradient
//               colors={
//                 isUnlocked ? ['#4A90E2', '#357ABD'] : ['#BDC3C7', '#95A5A6']
//               }
//               start={{x: 0, y: 0}}
//               end={{x: 1, y: 1}}
//               style={[styles.levelButton]}>
//               <Text style={styles.levelText}>{levelNum}</Text>
//               {isUnlocked && (
//                 <View style={styles.progressContainer}>
//                   <LinearGradient
//                     colors={['#2ECC71', '#27AE60']}
//                     style={styles.progressDot}
//                   />
//                 </View>
//               )}
//               {!isUnlocked && (
//                 <Icon
//                   name="lock"
//                   size={12}
//                   color="rgba(255,255,255,0.5)"
//                   style={styles.lockIcon}
//                 />
//               )}
//             </LinearGradient>
//           </TouchableOpacity>
//         </Animated.View>
//       </Animated.View>
//     );
//   });

//   const renderLevels = () => {
//     const levels = [];
//     for (let i = 0; i < 20; i++) {
//       const row = [];
//       for (let j = 0; j < 5; j++) {
//         const levelNum = i * 5 + j + 1;
//         const index = i * 5 + j;
//         if (levelNum <= 100) {
//           row.push(
//             <LevelButton
//               key={levelNum}
//               levelNum={levelNum}
//               onPress={handleLevelPress}
//               index={index}
//             />,
//           );
//         }
//       }
//       levels.push(
//         // <Animated.View
//         //   key={i}
//         //   entering={FadeIn.delay(i * 10)}
//         //   layout={Layout.springify()}
//         //   style={styles.row}>
//         //   {row}
//         // </Animated.View>,
//         <Animated.View
//           key={i}
//           entering={FadeIn.delay(i * 5)} // Reduced from 10
//           layout={Layout.duration(150)} // Replace springify with duration
//           style={styles.row}>
//           {row}
//         </Animated.View>,
//       );
//     }
//     return levels;
//   };

//   return (
//     <LinearGradient colors={['#F8F9FF', '#E8EFFF']} style={styles.container}>
//       <Animated.View
//         entering={FadeIn}
//         layout={Layout.springify()}
//         style={styles.headerContainer}>
//         <LinearGradient
//           colors={['#4A90E2', '#357ABD']}
//           start={{x: 0, y: 0}}
//           end={{x: 1, y: 0}}
//           style={styles.header}>
//           <Text style={styles.title}>RRB Question Levels</Text>
//         </LinearGradient>
//       </Animated.View>
//       <ScrollView
//         ref={scrollViewRef}
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}>
//         <Animated.View
//           entering={FadeIn}
//           layout={Layout.springify()}
//           style={styles.levelsContainer}>
//           {renderLevels()}
//         </Animated.View>
//       </ScrollView>
//     </LinearGradient>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   headerContainer: {
//     overflow: 'hidden',
//   },
//   header: {
//     paddingVertical: 20,
//     borderBottomLeftRadius: 20,
//     borderBottomRightRadius: 20,
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: {width: 0, height: 4},
//         shadowOpacity: 0.15,
//         shadowRadius: 8,
//       },
//       android: {
//         elevation: 8,
//       },
//     }),
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     color: '#FFFFFF',
//     textShadowColor: 'rgba(0, 0, 0, 0.2)',
//     textShadowOffset: {width: 0, height: 2},
//     textShadowRadius: 4,
//   },
//   scrollContent: {
//     padding: 15,
//     paddingBottom: 30,
//   },
//   levelsContainer: {
//     flex: 1,
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginBottom: 15,
//   },
//   levelButtonContainer: {
//     margin: 5,
//   },
//   levelButton: {
//     width: BUTTON_SIZE,
//     height: BUTTON_SIZE,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: BUTTON_SIZE / 2,
//     borderWidth: 2,
//     borderColor: 'rgba(255,255,255,0.2)',
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: {width: 0, height: 2},
//         shadowOpacity: 0.15,
//         shadowRadius: 4,
//       },
//       android: {
//         elevation: 4,
//       },
//     }),
//   },
//   levelText: {
//     color: 'white',
//     fontSize: 18,
//     fontWeight: 'bold',
//     textShadowColor: 'rgba(0, 0, 0, 0.2)',
//     textShadowOffset: {width: 0, height: 1},
//     textShadowRadius: 2,
//   },
//   progressContainer: {
//     position: 'absolute',
//     bottom: 8,
//     alignItems: 'center',
//   },
//   progressDot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.4)',
//   },
//   lockIcon: {
//     position: 'absolute',
//     bottom: 8,
//   },
// });

// export default Quiz;

import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome5';

const {width} = Dimensions.get('window');
const BUTTON_SIZE = width * 0.15;
const LEVELS_PER_ROW = 5;
const TOTAL_LEVELS = 100;

const LevelButton = React.memo(({levelNum, isUnlocked, onPress}) => (
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={() => onPress(levelNum)}
    style={styles.levelButtonContainer}>
    <LinearGradient
      colors={isUnlocked ? ['#4A90E2', '#357ABD'] : ['#BDC3C7', '#95A5A6']}
      style={styles.levelButton}>
      <Text style={styles.levelText}>{levelNum}</Text>
      {isUnlocked ? (
        <View style={styles.progressDot} />
      ) : (
        <Icon
          name="lock"
          size={12}
          color="rgba(255,255,255,0.5)"
          style={styles.lockIcon}
        />
      )}
    </LinearGradient>
  </TouchableOpacity>
));

const Quiz = () => {
  const [unlockedLevels, setUnlockedLevels] = useState(1);
  const navigation = useNavigation();

  useEffect(() => {
    AsyncStorage.getItem('unlockedLevel')
      .then(level => level && setUnlockedLevels(parseInt(level)))
      .catch(error => console.error('Error loading levels:', error));
  }, []);

  const handleLevelPress = level => {
    if (level <= unlockedLevels) {
      navigation.navigate('QuestionScreen', {level});
    } else {
      Alert.alert(
        'Level Locked',
        'Complete previous levels to unlock this one!',
      );
    }
  };

  const renderLevelRows = () => {
    const rows = [];
    const totalRows = Math.ceil(TOTAL_LEVELS / LEVELS_PER_ROW);

    for (let i = 0; i < totalRows; i++) {
      const rowButtons = [];
      for (let j = 0; j < LEVELS_PER_ROW; j++) {
        const levelNum = i * LEVELS_PER_ROW + j + 1;
        if (levelNum <= TOTAL_LEVELS) {
          rowButtons.push(
            <LevelButton
              key={levelNum}
              levelNum={levelNum}
              isUnlocked={levelNum <= unlockedLevels}
              onPress={handleLevelPress}
            />,
          );
        }
      }
      rows.push(
        <View key={i} style={styles.row}>
          {rowButtons}
        </View>,
      );
    }
    return rows;
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#4A90E2', '#357ABD']} style={styles.header}>
        <Text style={styles.title}>RRB JE Questions Levels</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.levelsContainer}>{renderLevelRows()}</View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FF',
  },
  header: {
    paddingVertical: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 30,
  },
  levelsContainer: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  levelButtonContainer: {
    margin: 5,
  },
  levelButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BUTTON_SIZE / 2,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  levelText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressDot: {
    position: 'absolute',
    bottom: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2ECC71',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  lockIcon: {
    position: 'absolute',
    bottom: 8,
  },
});

export default React.memo(Quiz);
