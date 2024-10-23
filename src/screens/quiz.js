// import React from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   Alert,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import {CommonActions, useNavigation} from '@react-navigation/native';

// const Quiz = () => {
//   const [unlockedLevels, setUnlockedLevels] = React.useState(1);
//   const navigation = useNavigation();

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
//     console.log(level);
//     if (level <= unlockedLevels) {
//       navigation.navigate('QuestionScreen', level);
//     } else {
//       Alert.alert(
//         'Level Locked',
//         'Complete previous levels to unlock this one!',
//       );
//     }
//   };

//   const renderLevels = () => {
//     const levels = [];
//     for (let i = 0; i < 20; i++) {
//       const row = [];
//       for (let j = 0; j < 5; j++) {
//         const levelNum = i * 5 + j + 1;
//         if (levelNum <= 100) {
//           row.push(
//             <TouchableOpacity
//               key={levelNum}
//               style={[
//                 styles.levelButton,
//                 levelNum <= unlockedLevels
//                   ? styles.unlockedLevel
//                   : styles.lockedLevel,
//               ]}
//               onPress={() => handleLevelPress(levelNum)}>
//               <Text style={styles.levelText}>{levelNum}</Text>
//               {levelNum <= unlockedLevels && (
//                 <View style={styles.progressDot} />
//               )}
//             </TouchableOpacity>,
//           );
//         }
//       }
//       levels.push(
//         <View key={i} style={styles.row}>
//           {row}
//         </View>,
//       );
//     }
//     return levels;
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>RRB Question Levels</Text>
//       <ScrollView contentContainerStyle={styles.scrollContent}>
//         {renderLevels()}
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     padding: 20,
//     color: '#2c3e50',
//   },
//   scrollContent: {
//     padding: 10,
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginBottom: 15,
//   },
//   levelButton: {
//     width: 60,
//     height: 60,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 30,
//     margin: 5,
//   },
//   unlockedLevel: {
//     backgroundColor: '#3498db',
//     elevation: 3,
//   },
//   lockedLevel: {
//     backgroundColor: '#bdc3c7',
//   },
//   levelText: {
//     color: 'white',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   progressDot: {
//     position: 'absolute',
//     bottom: 5,
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: '#2ecc71',
//   },
//   questionContainer: {
//     flex: 1,
//     backgroundColor: '#fff',
//     padding: 20,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   levelIndicator: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#2c3e50',
//   },
//   questionCounter: {
//     fontSize: 16,
//     color: '#7f8c8d',
//   },
//   questionContent: {
//     flex: 1,
//   },
//   questionText: {
//     fontSize: 18,
//     marginBottom: 20,
//     color: '#2c3e50',
//     lineHeight: 24,
//   },
//   optionButton: {
//     padding: 15,
//     marginVertical: 8,
//     backgroundColor: '#f0f0f0',
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#ddd',
//   },
//   selectedOption: {
//     borderWidth: 2,
//   },
//   correctOption: {
//     backgroundColor: '#2ecc71',
//     borderColor: '#27ae60',
//   },
//   wrongOption: {
//     backgroundColor: '#e74c3c',
//     borderColor: '#c0392b',
//   },
//   optionText: {
//     fontSize: 16,
//     color: '#2c3e50',
//   },
//   helpButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginTop: 20,
//   },
//   helpButton: {
//     padding: 10,
//     backgroundColor: '#3498db',
//     borderRadius: 5,
//     minWidth: 100,
//     alignItems: 'center',
//   },
//   helpButtonText: {
//     color: 'white',
//     fontWeight: 'bold',
//   },
//   hintContainer: {
//     marginTop: 20,
//     padding: 15,
//     backgroundColor: '#fff9c4',
//     borderRadius: 8,
//   },
//   hintText: {
//     color: '#666',
//     fontSize: 14,
//   },
//   solutionContainer: {
//     marginTop: 20,
//     padding: 15,
//     backgroundColor: '#e8f5e9',
//     borderRadius: 8,
//   },
//   solutionText: {
//     color: '#2c3e50',
//     fontSize: 14,
//   },
// });

// export default Quiz;

// // import React from 'react';
// // import {
// //   View,
// //   Text,
// //   TouchableOpacity,
// //   StyleSheet,
// //   ScrollView,
// //   Alert,
// // } from 'react-native';
// // import AsyncStorage from '@react-native-async-storage/async-storage';
// // import {useQuestions} from '../util/QuestionsContext';

// // const Quiz = ({navigation}) => {
// //   const {questionData} = useQuestions();
// //   const [unlockedLevels, setUnlockedLevels] = React.useState(1);

// //   React.useEffect(() => {
// //     loadUnlockedLevels();
// //     const unsubscribe = navigation.addListener('focus', () => {
// //       loadUnlockedLevels();
// //     });
// //     return unsubscribe;
// //   }, [navigation]);

// //   const loadUnlockedLevels = async () => {
// //     try {
// //       const level = await AsyncStorage.getItem('unlockedLevel');
// //       if (level) {
// //         setUnlockedLevels(parseInt(level));
// //       }
// //     } catch (error) {
// //       console.error('Error loading levels:', error);
// //     }
// //   };

// //   const handleLevelPress = level => {
// //     if (level <= unlockedLevels) {
// //       if (questionData[level]) {
// //         navigation.navigate('Question', {level});
// //       } else {
// //         Alert.alert(
// //           'Level Not Available',
// //           'Questions for this level are not available yet.',
// //         );
// //       }
// //     } else {
// //       Alert.alert(
// //         'Level Locked',
// //         'Complete previous levels to unlock this one!',
// //       );
// //     }
// //   };

// //   const renderLevels = () => {
// //     const levels = [];
// //     for (let i = 0; i < 20; i++) {
// //       const row = [];
// //       for (let j = 0; j < 5; j++) {
// //         const levelNum = i * 5 + j + 1;
// //         if (levelNum <= 100) {
// //           const hasQuestions = questionData[levelNum] !== undefined;
// //           row.push(
// //             <TouchableOpacity
// //               key={levelNum}
// //               style={[
// //                 styles.levelButton,
// //                 levelNum <= unlockedLevels
// //                   ? styles.unlockedLevel
// //                   : styles.lockedLevel,
// //                 !hasQuestions && styles.unavailableLevel,
// //               ]}
// //               onPress={() => handleLevelPress(levelNum)}>
// //               <Text style={styles.levelText}>{levelNum}</Text>
// //               {levelNum <= unlockedLevels && hasQuestions && (
// //                 <View style={styles.progressDot} />
// //               )}
// //             </TouchableOpacity>,
// //           );
// //         }
// //       }
// //       levels.push(
// //         <View key={i} style={styles.row}>
// //           {row}
// //         </View>,
// //       );
// //     }
// //     return levels;
// //   };

// //   return (
// //     <View style={styles.container}>
// //       <Text style={styles.title}>RRB Question Levels</Text>
// //       <ScrollView contentContainerStyle={styles.scrollContent}>
// //         {renderLevels()}
// //       </ScrollView>
// //     </View>
// //   );
// // };

// // export default Quiz;

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: '#f5f5f5',
// //   },
// //   title: {
// //     fontSize: 24,
// //     fontWeight: 'bold',
// //     textAlign: 'center',
// //     padding: 20,
// //     color: '#2c3e50',
// //   },
// //   scrollContent: {
// //     padding: 10,
// //   },
// //   row: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-around',
// //     marginBottom: 15,
// //   },
// //   levelButton: {
// //     width: 60,
// //     height: 60,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     borderRadius: 30,
// //     margin: 5,
// //   },
// //   unlockedLevel: {
// //     backgroundColor: '#3498db',
// //     elevation: 3,
// //   },
// //   lockedLevel: {
// //     backgroundColor: '#bdc3c7',
// //   },
// //   levelText: {
// //     color: 'white',
// //     fontSize: 18,
// //     fontWeight: 'bold',
// //   },
// //   progressDot: {
// //     position: 'absolute',
// //     bottom: 5,
// //     width: 8,
// //     height: 8,
// //     borderRadius: 4,
// //     backgroundColor: '#2ecc71',
// //   },
// //   questionContainer: {
// //     flex: 1,
// //     backgroundColor: '#fff',
// //     padding: 20,
// //   },
// //   header: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     marginBottom: 20,
// //   },
// //   levelIndicator: {
// //     fontSize: 20,
// //     fontWeight: 'bold',
// //     color: '#2c3e50',
// //   },
// //   questionCounter: {
// //     fontSize: 16,
// //     color: '#7f8c8d',
// //   },
// //   questionContent: {
// //     flex: 1,
// //   },
// //   questionText: {
// //     fontSize: 18,
// //     marginBottom: 20,
// //     color: '#2c3e50',
// //     lineHeight: 24,
// //   },
// //   optionButton: {
// //     padding: 15,
// //     marginVertical: 8,
// //     backgroundColor: '#f0f0f0',
// //     borderRadius: 8,
// //     borderWidth: 1,
// //     borderColor: '#ddd',
// //   },
// //   selectedOption: {
// //     borderWidth: 2,
// //   },
// //   correctOption: {
// //     backgroundColor: '#2ecc71',
// //     borderColor: '#27ae60',
// //   },
// //   wrongOption: {
// //     backgroundColor: '#e74c3c',
// //     borderColor: '#c0392b',
// //   },
// //   optionText: {
// //     fontSize: 16,
// //     color: '#2c3e50',
// //   },
// //   helpButtons: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-around',
// //     marginTop: 20,
// //   },
// //   helpButton: {
// //     padding: 10,
// //     backgroundColor: '#3498db',
// //     borderRadius: 5,
// //     minWidth: 100,
// //     alignItems: 'center',
// //   },
// //   helpButtonText: {
// //     color: 'white',
// //     fontWeight: 'bold',
// //   },
// //   hintContainer: {
// //     marginTop: 20,
// //     padding: 15,
// //     backgroundColor: '#fff9c4',
// //     borderRadius: 8,
// //   },
// //   hintText: {
// //     color: '#666',
// //     fontSize: 14,
// //   },
// //   solutionContainer: {
// //     marginTop: 20,
// //     padding: 15,
// //     backgroundColor: '#e8f5e9',
// //     borderRadius: 8,
// //   },
// //   solutionText: {
// //     color: '#2c3e50',
// //     fontSize: 14,
// //   },
// // });

//**** below is animated */
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
//   interpolate,
//   Extrapolate,
//   FadeInDown,
//   FadeIn,
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
//   const fadeAnim = useSharedValue(0);
//   const scaleAnim = useSharedValue(1);

//   React.useEffect(() => {
//     loadUnlockedLevels();
//     fadeAnim.value = withTiming(1, {duration: 1000});
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
//       scaleAnim.value = withSequence(
//         withSpring(0.95, SPRING_CONFIG),
//         withSpring(1, SPRING_CONFIG),
//       );
//       navigation.navigate('QuestionScreen', level);
//     } else {
//       // Shake animation for locked levels
//       scaleAnim.value = withSequence(
//         withSpring(1.1, SPRING_CONFIG),
//         withSpring(0.95, SPRING_CONFIG),
//         withSpring(1, SPRING_CONFIG),
//       );
//       Alert.alert(
//         'Level Locked',
//         'Complete previous levels to unlock this one!',
//       );
//     }
//   };

//   const LevelButton = React.memo(({levelNum, onPress}) => {
//     const isUnlocked = levelNum <= unlockedLevels;
//     const buttonScale = useSharedValue(1);

//     const animatedStyle = useAnimatedStyle(() => {
//       return {
//         transform: [{scale: buttonScale.value}],
//       };
//     });

//     const handlePress = () => {
//       buttonScale.value = withSequence(
//         withSpring(0.95, SPRING_CONFIG),
//         withSpring(1, SPRING_CONFIG),
//         () => onPress(levelNum),
//       );
//     };

//     return (
//       <Animated.View
//         entering={FadeInDown.delay(levelNum * 50).springify()}
//         style={[styles.levelButtonContainer, animatedStyle]}>
//         <TouchableOpacity activeOpacity={0.8} onPress={handlePress}>
//           <LinearGradient
//             colors={
//               isUnlocked ? ['#4A90E2', '#357ABD'] : ['#BDC3C7', '#95A5A6']
//             }
//             start={{x: 0, y: 0}}
//             end={{x: 1, y: 1}}
//             style={[styles.levelButton]}>
//             <Text style={styles.levelText}>{levelNum}</Text>
//             {isUnlocked && (
//               <View style={styles.progressContainer}>
//                 <LinearGradient
//                   colors={['#2ECC71', '#27AE60']}
//                   style={styles.progressDot}
//                 />
//               </View>
//             )}
//             {!isUnlocked && (
//               <Icon
//                 name="lock"
//                 size={12}
//                 color="rgba(255,255,255,0.5)"
//                 style={styles.lockIcon}
//               />
//             )}
//           </LinearGradient>
//         </TouchableOpacity>
//       </Animated.View>
//     );
//   });

//   const renderLevels = () => {
//     const levels = [];
//     for (let i = 0; i < 20; i++) {
//       const row = [];
//       for (let j = 0; j < 5; j++) {
//         const levelNum = i * 5 + j + 1;
//         if (levelNum <= 100) {
//           row.push(
//             <LevelButton
//               key={levelNum}
//               levelNum={levelNum}
//               onPress={handleLevelPress}
//             />,
//           );
//         }
//       }
//       levels.push(
//         <Animated.View
//           key={i}
//           entering={FadeIn.delay(i * 100)}
//           style={styles.row}>
//           {row}
//         </Animated.View>,
//       );
//     }
//     return levels;
//   };

//   return (
//     <LinearGradient colors={['#F8F9FF', '#E8EFFF']} style={styles.container}>
//       <LinearGradient
//         colors={['#4A90E2', '#357ABD']}
//         start={{x: 0, y: 0}}
//         end={{x: 1, y: 0}}
//         style={styles.header}>
//         <Animated.Text entering={FadeInDown.springify()} style={styles.title}>
//           RRB Question Levels
//         </Animated.Text>
//       </LinearGradient>
//       <ScrollView
//         ref={scrollViewRef}
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}>
//         {renderLevels()}
//       </ScrollView>
//     </LinearGradient>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
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
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginBottom: 15,
//   },
//   levelButtonContainer: {
//     margin: 5,
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
//   levelButton: {
//     width: BUTTON_SIZE,
//     height: BUTTON_SIZE,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: BUTTON_SIZE / 2,
//     borderWidth: 2,
//     borderColor: 'rgba(255,255,255,0.2)',
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

import React from 'react';
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
import {CommonActions, useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  FadeIn,
  Layout,
  ZoomIn,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/FontAwesome5';

const {width} = Dimensions.get('window');
const BUTTON_SIZE = width * 0.15;
const SPRING_CONFIG = {
  damping: 12,
  mass: 1,
  stiffness: 100,
};

const Quiz = () => {
  const [unlockedLevels, setUnlockedLevels] = React.useState(1);
  const navigation = useNavigation();
  const scrollViewRef = React.useRef(null);

  React.useEffect(() => {
    loadUnlockedLevels();
  }, []);

  const loadUnlockedLevels = async () => {
    try {
      const level = await AsyncStorage.getItem('unlockedLevel');
      if (level) {
        setUnlockedLevels(parseInt(level));
      }
    } catch (error) {
      console.error('Error loading levels:', error);
    }
  };

  const handleLevelPress = level => {
    if (level <= unlockedLevels) {
      navigation.navigate('QuestionScreen', level);
    } else {
      Alert.alert(
        'Level Locked',
        'Complete previous levels to unlock this one!',
      );
    }
  };

  const LevelButton = React.memo(({levelNum, onPress, index}) => {
    const isUnlocked = levelNum <= unlockedLevels;
    const scale = useSharedValue(1);

    const rStyle = useAnimatedStyle(() => {
      return {
        transform: [{scale: scale.value}],
      };
    });

    const handlePress = () => {
      scale.value = withSequence(
        withSpring(0.95, SPRING_CONFIG),
        withSpring(1, SPRING_CONFIG),
      );
      onPress(levelNum);
    };

    return (
      <Animated.View
        entering={ZoomIn.delay(50 * index).springify()}
        layout={Layout.springify()}
        style={[styles.levelButtonContainer]}>
        <Animated.View style={rStyle}>
          <TouchableOpacity activeOpacity={0.8} onPress={handlePress}>
            <LinearGradient
              colors={
                isUnlocked ? ['#4A90E2', '#357ABD'] : ['#BDC3C7', '#95A5A6']
              }
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={[styles.levelButton]}>
              <Text style={styles.levelText}>{levelNum}</Text>
              {isUnlocked && (
                <View style={styles.progressContainer}>
                  <LinearGradient
                    colors={['#2ECC71', '#27AE60']}
                    style={styles.progressDot}
                  />
                </View>
              )}
              {!isUnlocked && (
                <Icon
                  name="lock"
                  size={12}
                  color="rgba(255,255,255,0.5)"
                  style={styles.lockIcon}
                />
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    );
  });

  const renderLevels = () => {
    const levels = [];
    for (let i = 0; i < 20; i++) {
      const row = [];
      for (let j = 0; j < 5; j++) {
        const levelNum = i * 5 + j + 1;
        const index = i * 5 + j;
        if (levelNum <= 100) {
          row.push(
            <LevelButton
              key={levelNum}
              levelNum={levelNum}
              onPress={handleLevelPress}
              index={index}
            />,
          );
        }
      }
      levels.push(
        <Animated.View
          key={i}
          entering={FadeIn.delay(i * 50)}
          layout={Layout.springify()}
          style={styles.row}>
          {row}
        </Animated.View>,
      );
    }
    return levels;
  };

  return (
    <LinearGradient colors={['#F8F9FF', '#E8EFFF']} style={styles.container}>
      <Animated.View
        entering={FadeIn}
        layout={Layout.springify()}
        style={styles.headerContainer}>
        <LinearGradient
          colors={['#4A90E2', '#357ABD']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.header}>
          <Text style={styles.title}>RRB Question Levels</Text>
        </LinearGradient>
      </Animated.View>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Animated.View
          entering={FadeIn}
          layout={Layout.springify()}
          style={styles.levelsContainer}>
          {renderLevels()}
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    overflow: 'hidden',
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
        elevation: 8,
      },
    }),
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 4,
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
        elevation: 4,
      },
    }),
  },
  levelText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 8,
    alignItems: 'center',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  lockIcon: {
    position: 'absolute',
    bottom: 8,
  },
});

export default Quiz;
