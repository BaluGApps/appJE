// import React, {useState, useEffect} from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   Animated,
//   Dimensions,
//   ScrollView,
//   Platform,
//   Vibration,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import * as Progress from 'react-native-progress';
// import LottieView from 'lottie-react-native';
// import questions from '../util/Questions.json';
// import {FadeInDown} from 'react-native-reanimated';
// import ResultModal from '../util/ResultModal';
// import {
//   widthPercentageToDP as wp,
//   heightPercentageToDP as hp,
// } from 'react-native-responsive-screen';
// import {
//   RewardedAd,
//   RewardedAdEventType,
//   TestIds,
// } from 'react-native-google-mobile-ads';

// const {width} = Dimensions.get('window');

// const adUnitId = __DEV__
//   ? TestIds.REWARDED
//   : 'ca-app-pub-2627956667785383/4994135018';

// const rewarded = RewardedAd.createForAdRequest(adUnitId, {
//   keywords: ['fashion', 'clothing'],
// });

// const QuestionScreen = ({route, navigation}) => {
//   const {level} = route.params;
//   const [selectedOption, setSelectedOption] = useState(null);
//   const [showHint, setShowHint] = useState(false);
//   const [showSolution, setShowSolution] = useState(false);
//   const [fadeAnim] = useState(new Animated.Value(0));
//   const [scaleAnim] = useState(new Animated.Value(0.95));
//   const [progress, setProgress] = useState(0);
//   const [isCorrect, setIsCorrect] = useState(false);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [isSuccess, setIsSuccess] = useState(false);
//   const [isAdLoaded, setIsAdLoaded] = useState(false);

//   const currentQuestion = questions.questions.find(q => q.level === level);
//   const totalQuestions = questions.questions.length;

//   useEffect(() => {
//     // Entrance animation
//     Animated.parallel([
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 500,
//         useNativeDriver: true,
//       }),
//       Animated.spring(scaleAnim, {
//         toValue: 1,
//         friction: 8,
//         tension: 40,
//         useNativeDriver: true,
//       }),
//     ]).start();

//     // Set progress
//     setProgress(level / totalQuestions);
//   }, []);
//   useEffect(() => {
//     const adLoadTimeout = setTimeout(() => {
//       if (!isAdLoaded) {
//         console.log('Ad load timeout');
//         setIsAdLoaded(true);
//       }
//     }, 4000);

//     const unsubscribeLoaded = rewarded.addAdEventListener(
//       RewardedAdEventType.LOADED,
//       () => setShowSolution(true),
//     );

//     const unsubscribeEarned = rewarded.addAdEventListener(
//       RewardedAdEventType.EARNED_REWARD,
//       reward => {
//         console.log('User earned reward of ', reward);
//         setShowSolution(true);
//       },
//     );

//     rewarded.load();

//     return () => {
//       clearTimeout(adLoadTimeout);
//       unsubscribeLoaded();
//       unsubscribeEarned();
//     };
//   }, []);

//   const handleOptionSelect = async index => {
//     setSelectedOption(index);

//     if (index === currentQuestion.correctAnswer) {
//       setIsSuccess(true);
//       try {
//         const nextLevel = level + 1;
//         await AsyncStorage.setItem('unlockedLevel', nextLevel.toString());
//         setModalVisible(true);
//       } catch (error) {
//         console.error('Error saving level:', error);
//       }
//     } else {
//       setIsSuccess(false);
//       if (Platform.OS === 'ios' || Platform.OS === 'android') {
//         Vibration.vibrate(500);
//       }
//       setModalVisible(true);
//     }
//   };

//   const handleModalContinue = () => {
//     setModalVisible(false);
//     if (isSuccess) {
//       const nextLevel = level + 1;
//       navigation.replace('QuestionScreen', {level: nextLevel});
//     } else {
//       setShowHint(true);
//     }
//   };

//   const renderOptionButton = (option, index) => {
//     const isSelected = selectedOption === index;
//     const isCorrectAnswer = index === currentQuestion.correctAnswer;

//     return (
//       <TouchableOpacity
//         key={index}
//         style={[
//           styles.optionButton,
//           isSelected && styles.selectedOption,
//           isSelected && isCorrectAnswer && styles.correctOption,
//           isSelected && !isCorrectAnswer && styles.wrongOption,
//         ]}
//         onPress={() => handleOptionSelect(index)}
//         activeOpacity={0.7}>
//         <View style={styles.optionContent}>
//           <Text style={styles.optionLetter}>
//             {String.fromCharCode(65 + index)}
//           </Text>
//           <Text
//             style={[
//               styles.optionText,
//               isSelected && isCorrectAnswer && styles.correctOptionText,
//               isSelected && !isCorrectAnswer && styles.wrongOptionText,
//             ]}>
//             {option}
//           </Text>
//           {isSelected && isCorrectAnswer && (
//             <Icon
//               name="check-circle"
//               size={24}
//               color="#fff"
//               style={styles.optionIcon}
//             />
//           )}
//           {isSelected && !isCorrectAnswer && (
//             <Icon
//               name="close-circle"
//               size={24}
//               color="#fff"
//               style={styles.optionIcon}
//             />
//           )}
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <>
//       <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
//         <Animated.View
//           style={[
//             styles.content,
//             {
//               opacity: fadeAnim,
//               transform: [{scale: scaleAnim}],
//             },
//           ]}>
//           <View style={styles.header}>
//             <View style={styles.levelInfo}>
//               <Text style={styles.levelLabel}>Level {level}</Text>
//               <Progress.Bar
//                 progress={progress}
//                 width={width * 0.4}
//                 color="#3498db"
//                 unfilledColor="#e0e0e0"
//                 borderWidth={0}
//                 height={4}
//                 style={styles.progressBar}
//               />
//             </View>
//             <Text style={styles.questionCounter}>
//               {level}/{totalQuestions}
//             </Text>
//           </View>

//           <View style={styles.questionCard}>
//             <Text style={styles.questionText}>{currentQuestion.question}</Text>

//             <View style={styles.optionsContainer}>
//               {currentQuestion.options.map((option, index) =>
//                 renderOptionButton(option, index),
//               )}
//             </View>

//             <View style={styles.helpButtons}>
//               <TouchableOpacity
//                 style={[styles.helpButton, showHint && styles.activeHelpButton]}
//                 onPress={() => setShowHint(!showHint)}>
//                 <Icon
//                   name={showHint ? 'lightbulb-on' : 'lightbulb-outline'}
//                   size={24}
//                   color={showHint ? '#fff' : '#3498db'}
//                 />
//                 <Text
//                   style={[
//                     styles.helpButtonText,
//                     showHint && styles.activeHelpButtonText,
//                   ]}>
//                   {showHint ? 'Hide Hint' : 'Need a Hint?'}
//                 </Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={[
//                   styles.helpButton,
//                   showSolution && styles.activeHelpButton,
//                 ]}
//                 // onPress={() => setShowSolution(!showSolution)}>
//                 onPress={() => {
//                   if (showSolution) {
//                     setShowSolution(!showSolution);
//                   } else {
//                     if (isAdLoaded) {
//                       rewarded.show();
//                     } else {
//                       Alert.alert(
//                         'Ad not ready',
//                         'Please try again in a moment.',
//                       );
//                       rewarded.load();
//                     }
//                   }
//                 }}>
//                 <Icon
//                   name={showSolution ? 'eye-off' : 'eye'}
//                   size={24}
//                   color={showSolution ? '#fff' : '#3498db'}
//                 />
//                 <Text
//                   style={[
//                     styles.helpButtonText,
//                     showSolution && styles.activeHelpButtonText,
//                   ]}>
//                   {showSolution ? 'Hide Solution' : 'Show Solution'}
//                 </Text>
//               </TouchableOpacity>
//             </View>

//             {showHint && (
//               <Animated.View entering={FadeInDown} style={styles.hintContainer}>
//                 <Icon name="lightbulb-on" size={24} color="#f39c12" />
//                 <Text style={styles.hintText}>{currentQuestion.hint}</Text>
//               </Animated.View>
//             )}

//             {showSolution && (
//               <Animated.View
//                 entering={FadeInDown}
//                 style={styles.solutionContainer}>
//                 <Icon name="book-open-variant" size={24} color="#27ae60" />
//                 <Text style={styles.solutionText}>
//                   {currentQuestion.solution}
//                 </Text>
//               </Animated.View>
//             )}
//           </View>

//           {isCorrect && (
//             <LottieView
//               ref={animation => {
//                 this.successAnimation = animation;
//               }}
//               source={require('../util/right.json')}
//               style={styles.successAnimation}
//               loop={false}
//             />
//           )}
//         </Animated.View>
//       </ScrollView>
//       <ResultModal
//         visible={modalVisible}
//         isSuccess={isSuccess}
//         onContinue={handleModalContinue}
//         currentLevel={level}
//       />
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
//   content: {
//     flex: 1,
//     padding: wp('4%'),
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: hp('2.5%'),
//     paddingTop: Platform.OS === 'ios' ? hp('6%') : hp('3%'),
//   },
//   levelInfo: {
//     flex: 1,
//   },
//   levelLabel: {
//     fontSize: wp('7%'),
//     fontWeight: 'bold',
//     color: '#2c3e50',
//     marginBottom: hp('1%'),
//   },
//   progressBar: {
//     marginTop: hp('1%'),
//   },
//   questionCounter: {
//     fontSize: wp('4.5%'),
//     color: '#7f8c8d',
//     fontWeight: '600',
//   },
//   questionCard: {
//     backgroundColor: '#fff',
//     borderRadius: wp('4%'),
//     padding: wp('5%'),
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: {width: 0, height: hp('0.5%')},
//         shadowOpacity: 0.1,
//         shadowRadius: wp('2%'),
//       },
//       android: {
//         elevation: 4,
//       },
//     }),
//   },
//   questionText: {
//     fontSize: wp('5%'),
//     color: '#2c3e50',
//     lineHeight: hp('3.5%'),
//     marginBottom: hp('3%'),
//     fontWeight: '600',
//   },
//   optionsContainer: {
//     marginBottom: hp('3%'),
//   },
//   optionButton: {
//     marginVertical: hp('1%'),
//     borderRadius: wp('3%'),
//     backgroundColor: '#fff',
//     borderWidth: 2,
//     borderColor: '#e0e0e0',
//     overflow: 'hidden',
//   },
//   optionContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: wp('4%'),
//   },
//   optionLetter: {
//     fontSize: wp('4.5%'),
//     fontWeight: 'bold',
//     color: '#95a5a6',
//     marginRight: wp('3%'),
//     width: wp('7%'),
//   },
//   optionText: {
//     flex: 1,
//     fontSize: wp('4%'),
//     color: '#2c3e50',
//   },
//   selectedOption: {
//     borderColor: '#3498db',
//   },
//   correctOption: {
//     backgroundColor: '#2ecc71',
//     borderColor: '#27ae60',
//   },
//   wrongOption: {
//     backgroundColor: '#e74c3c',
//     borderColor: '#c0392b',
//   },
//   correctOptionText: {
//     color: '#fff',
//     fontWeight: '600',
//   },
//   wrongOptionText: {
//     color: '#fff',
//     fontWeight: '600',
//   },
//   optionIcon: {
//     marginLeft: wp('3%'),
//   },
//   helpButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: hp('2%'),
//   },
//   helpButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: wp('3%'),
//     borderRadius: wp('3%'),
//     backgroundColor: '#f8f9fa',
//     borderWidth: 1,
//     borderColor: '#3498db',
//     flex: 0.48,
//     justifyContent: 'center',
//   },
//   activeHelpButton: {
//     backgroundColor: '#3498db',
//   },
//   helpButtonText: {
//     marginLeft: wp('2%'),
//     fontSize: wp('4%'),
//     color: '#3498db',
//     fontWeight: '600',
//   },
//   activeHelpButtonText: {
//     color: '#fff',
//   },
//   hintContainer: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     padding: wp('4%'),
//     backgroundColor: '#fff9c4',
//     borderRadius: wp('3%'),
//     marginTop: hp('2%'),
//   },
//   hintText: {
//     flex: 1,
//     marginLeft: wp('3%'),
//     color: '#666',
//     fontSize: wp('4%'),
//     lineHeight: hp('3%'),
//   },
//   solutionContainer: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     padding: wp('4%'),
//     backgroundColor: '#e8f5e9',
//     borderRadius: wp('3%'),
//     marginTop: hp('2%'),
//   },
//   solutionText: {
//     flex: 1,
//     marginLeft: wp('3%'),
//     color: '#2c3e50',
//     fontSize: wp('4%'),
//     lineHeight: hp('3%'),
//   },
//   successAnimation: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//   },
// });

// export default QuestionScreen;

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Dimensions,
  ScrollView,
  Platform,
  Vibration,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Progress from 'react-native-progress';
import LottieView from 'lottie-react-native';
import questions from '../util/Questions.json';
import {FadeInDown} from 'react-native-reanimated';
import ResultModal from '../util/ResultModal';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

const {width} = Dimensions.get('window');

const adUnitId = __DEV__
  ? TestIds.REWARDED
  : 'ca-app-pub-2627956667785383/4994135018';

const rewarded = RewardedAd.createForAdRequest(adUnitId, {
  keywords: ['fashion', 'clothing'],
});

const QuestionScreen = ({route, navigation}) => {
  const {level} = route.params;
  const [selectedOption, setSelectedOption] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.95));
  const [progress, setProgress] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isAdLoaded, setIsAdLoaded] = useState(false);

  const currentQuestion = questions.questions.find(q => q.level === level);
  const totalQuestions = questions.questions.length;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Set progress
    setProgress(level / totalQuestions);
  }, []);

  useEffect(() => {
    const adLoadTimeout = setTimeout(() => {
      if (!isAdLoaded) {
        console.log('Ad load timeout');
        setIsAdLoaded(true);
      }
    }, 4000);

    const unsubscribeLoaded = rewarded.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => setIsAdLoaded(true),
    );

    const unsubscribeEarned = rewarded.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      reward => {
        console.log('User earned reward of ', reward);
        setShowSolution(true);
      },
    );

    rewarded.load();

    return () => {
      clearTimeout(adLoadTimeout);
      unsubscribeLoaded();
      unsubscribeEarned();
    };
  }, []);

  const showRewardedAd = () => {
    if (isAdLoaded) {
      rewarded.show().catch(error => {
        console.error('Ad show error:', error);
        Alert.alert(
          'Quick Update',
          'We encountered a small hiccup with the ad, but no worries - you can still view the solution!',
          [
            {
              text: 'Show Solution',
              onPress: () => setShowSolution(true),
            },
          ],
        );
      });
    } else {
      Alert.alert(
        'Just a Moment',
        "The ad is taking a bit longer to load. We'll show you the solution right away instead!",
        [
          {
            text: 'Show Solution',
            onPress: () => setShowSolution(true),
          },
        ],
      );
    }
  };

  const handleOptionSelect = async index => {
    setSelectedOption(index);

    if (index === currentQuestion.correctAnswer) {
      setIsSuccess(true);
      try {
        const nextLevel = level + 1;
        await AsyncStorage.setItem('unlockedLevel', nextLevel.toString());
        setModalVisible(true);
      } catch (error) {
        console.error('Error saving level:', error);
      }
    } else {
      setIsSuccess(false);
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        Vibration.vibrate(500);
      }
      setModalVisible(true);
    }
  };

  const handleModalContinue = () => {
    setModalVisible(false);
    if (isSuccess) {
      const nextLevel = level + 1;
      navigation.replace('QuestionScreen', {level: nextLevel});
    } else {
      setShowHint(true);
    }
  };

  const renderOptionButton = (option, index) => {
    const isSelected = selectedOption === index;
    const isCorrectAnswer = index === currentQuestion.correctAnswer;

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.optionButton,
          isSelected && styles.selectedOption,
          isSelected && isCorrectAnswer && styles.correctOption,
          isSelected && !isCorrectAnswer && styles.wrongOption,
        ]}
        onPress={() => handleOptionSelect(index)}
        activeOpacity={0.7}>
        <View style={styles.optionContent}>
          <Text style={styles.optionLetter}>
            {String.fromCharCode(65 + index)}
          </Text>
          <Text
            style={[
              styles.optionText,
              isSelected && isCorrectAnswer && styles.correctOptionText,
              isSelected && !isCorrectAnswer && styles.wrongOptionText,
            ]}>
            {option}
          </Text>
          {isSelected && isCorrectAnswer && (
            <Icon
              name="check-circle"
              size={24}
              color="#fff"
              style={styles.optionIcon}
            />
          )}
          {isSelected && !isCorrectAnswer && (
            <Icon
              name="close-circle"
              size={24}
              color="#fff"
              style={styles.optionIcon}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{scale: scaleAnim}],
            },
          ]}>
          <View style={styles.header}>
            <View style={styles.levelInfo}>
              <Text style={styles.levelLabel}>Level {level}</Text>
              <Progress.Bar
                progress={progress}
                width={width * 0.4}
                color="#3498db"
                unfilledColor="#e0e0e0"
                borderWidth={0}
                height={4}
                style={styles.progressBar}
              />
            </View>
            <Text style={styles.questionCounter}>
              {level}/{totalQuestions}
            </Text>
          </View>

          <View style={styles.questionCard}>
            <Text style={styles.questionText}>{currentQuestion.question}</Text>

            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option, index) =>
                renderOptionButton(option, index),
              )}
            </View>

            <View style={styles.helpButtons}>
              <TouchableOpacity
                style={[styles.helpButton, showHint && styles.activeHelpButton]}
                onPress={() => setShowHint(!showHint)}>
                <Icon
                  name={showHint ? 'lightbulb-on' : 'lightbulb-outline'}
                  size={24}
                  color={showHint ? '#fff' : '#3498db'}
                />
                <Text
                  style={[
                    styles.helpButtonText,
                    showHint && styles.activeHelpButtonText,
                  ]}>
                  {showHint ? 'Hide Hint' : 'Need a Hint?'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.helpButton,
                  showSolution && styles.activeHelpButton,
                ]}
                onPress={showRewardedAd}>
                <Icon
                  name={showSolution ? 'eye-off' : 'eye'}
                  size={24}
                  color={showSolution ? '#fff' : '#3498db'}
                />
                <Text
                  style={[
                    styles.helpButtonText,
                    showSolution && styles.activeHelpButtonText,
                  ]}>
                  {showSolution ? 'Hide Solution' : 'Show Solution'}
                </Text>
              </TouchableOpacity>
            </View>

            {showHint && (
              <Animated.View entering={FadeInDown} style={styles.hintContainer}>
                <Icon name="lightbulb-on" size={24} color="#f39c12" />
                <Text style={styles.hintText}>{currentQuestion.hint}</Text>
              </Animated.View>
            )}

            {showSolution && (
              <Animated.View
                entering={FadeInDown}
                style={styles.solutionContainer}>
                <Icon name="book-open-variant" size={24} color="#27ae60" />
                <Text style={styles.solutionText}>
                  {currentQuestion.solution}
                </Text>
              </Animated.View>
            )}
          </View>
          {isCorrect && (
            <LottieView
              ref={animation => {
                this.successAnimation = animation;
              }}
              source={require('../util/right.json')}
              style={styles.successAnimation}
              loop={false}
            />
          )}
        </Animated.View>
      </ScrollView>
      <ResultModal
        visible={modalVisible}
        isSuccess={isSuccess}
        onContinue={handleModalContinue}
        currentLevel={level}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: wp('4%'),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('2.5%'),
    paddingTop: Platform.OS === 'ios' ? hp('6%') : hp('3%'),
  },
  levelInfo: {
    flex: 1,
  },
  levelLabel: {
    fontSize: wp('7%'),
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: hp('1%'),
  },
  progressBar: {
    marginTop: hp('1%'),
  },
  questionCounter: {
    fontSize: wp('4.5%'),
    color: '#7f8c8d',
    fontWeight: '600',
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: wp('4%'),
    padding: wp('5%'),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: hp('0.5%')},
        shadowOpacity: 0.1,
        shadowRadius: wp('2%'),
      },
      android: {
        elevation: 4,
      },
    }),
  },
  questionText: {
    fontSize: wp('5%'),
    color: '#2c3e50',
    lineHeight: hp('3.5%'),
    marginBottom: hp('3%'),
    fontWeight: '600',
  },
  optionsContainer: {
    marginBottom: hp('3%'),
  },
  optionButton: {
    marginVertical: hp('1%'),
    borderRadius: wp('3%'),
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp('4%'),
  },
  optionLetter: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    color: '#95a5a6',
    marginRight: wp('3%'),
    width: wp('7%'),
  },
  optionText: {
    flex: 1,
    fontSize: wp('4%'),
    color: '#2c3e50',
  },
  selectedOption: {
    borderColor: '#3498db',
  },
  correctOption: {
    backgroundColor: '#2ecc71',
    borderColor: '#27ae60',
  },
  wrongOption: {
    backgroundColor: '#e74c3c',
    borderColor: '#c0392b',
  },
  correctOptionText: {
    color: '#fff',
    fontWeight: '600',
  },
  wrongOptionText: {
    color: '#fff',
    fontWeight: '600',
  },
  optionIcon: {
    marginLeft: wp('3%'),
  },
  helpButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp('2%'),
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp('3%'),
    borderRadius: wp('3%'),
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#3498db',
    flex: 0.48,
    justifyContent: 'center',
  },
  activeHelpButton: {
    backgroundColor: '#3498db',
  },
  helpButtonText: {
    marginLeft: wp('2%'),
    fontSize: wp('4%'),
    color: '#3498db',
    fontWeight: '600',
  },
  activeHelpButtonText: {
    color: '#fff',
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: wp('4%'),
    backgroundColor: '#fff9c4',
    borderRadius: wp('3%'),
    marginTop: hp('2%'),
  },
  hintText: {
    flex: 1,
    marginLeft: wp('3%'),
    color: '#666',
    fontSize: wp('4%'),
    lineHeight: hp('3%'),
  },
  solutionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: wp('4%'),
    backgroundColor: '#e8f5e9',
    borderRadius: wp('3%'),
    marginTop: hp('2%'),
  },
  solutionText: {
    flex: 1,
    marginLeft: wp('3%'),
    color: '#2c3e50',
    fontSize: wp('4%'),
    lineHeight: hp('3%'),
  },
  successAnimation: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default QuestionScreen;
