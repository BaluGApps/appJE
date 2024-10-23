// import React, {useState, useEffect} from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   StyleSheet,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   BackHandler,
//   Modal,
//   Animated,
// } from 'react-native';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
// import {
//   widthPercentageToDP as wp,
//   heightPercentageToDP as hp,
// } from 'react-native-responsive-screen';
// import axios from 'axios';
// import {
//   RewardedAd,
//   RewardedAdEventType,
//   TestIds,
// } from 'react-native-google-mobile-ads';
// import LottieView from 'lottie-react-native';
// import { useGetQuestionsQuery } from '../utils/apiSlice';

// // Use test ID in development, real ID in production
// const adUnitId = __DEV__
//   ? TestIds.REWARDED
//   : 'ca-app-pub-2627956667785383/9398599673';

// const rewarded = RewardedAd.createForAdRequest(adUnitId, {
//   keywords: ['education', 'exam', 'learning'],
// });

// const Cbt1 = ({navigation}) => {
//   // State management
//   const [questionsData, setQuestionsData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [page, setPage] = useState(1);
//   const [hasMoreQuestions, setHasMoreQuestions] = useState(true);
//   const [error, setError] = useState(null);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [currentHint, setCurrentHint] = useState('');
//   const [fadeAnim] = useState(new Animated.Value(0));
//   // const [rewarded, setRewarded] = useState(null);
//   const [isAdLoaded, setIsAdLoaded] = useState(false);

//   const handleBackPress = () => {
//     // Check if the current route is the HomeScreen
//     if (navigation.isFocused()) {
//       Alert.alert(
//         'Exit App',
//         'Are you sure you want to exit?',
//         [
//           {text: 'Cancel', onPress: () => {}, style: 'cancel'},
//           {
//             text: 'Exit',
//             onPress: () => BackHandler.exitApp(),
//             style: 'destructive',
//           },
//         ],
//         {
//           cancelable: false,
//           style: 'default', // Customize the Alert dialog style
//           titleStyle: {fontSize: 24, fontWeight: 'bold'}, // Customize the title style
//           messageStyle: {fontSize: 16}, // Customize the message style
//         },
//       );

//       // Return true to prevent default behavior (exit the app) only on the HomeScreen
//       return true;
//     }

//     // Return false to allow the default back behavior on other screens
//     return false;
//   };

//   useEffect(() => {
//     const backHandler = BackHandler.addEventListener(
//       'hardwareBackPress',
//       handleBackPress,
//     );

//     return () => {
//       backHandler.remove();
//     };
//   }, []);

//   useEffect(() => {
//     const adLoadTimeout = setTimeout(() => {
//       if (!isAdLoaded) {
//         // Handle the scenario where the ad did not load within the specified time
//         console.log('Ad load timeout');
//         // Alert.alert("Ad Load Error", "Failed to load the rewarded ad. Please try again later.");
//         setIsAdLoaded(true); // Set isAdLoaded to true to prevent further attempts
//       }
//     }, 4000); // Set a timeout of 5 seconds (you can adjust the time as needed)

//     const unsubscribeLoaded = rewarded.addAdEventListener(
//       RewardedAdEventType.LOADED,
//       () => {
//         // setLoaded(true);
//         setIsAdLoaded(true);
//       },
//     );
//     const unsubscribeEarned = rewarded.addAdEventListener(
//       RewardedAdEventType.EARNED_REWARD,
//       reward => {
//         console.log('User earned reward of ', reward);
//       },
//     );

//     // Start loading the rewarded ad straight away
//     rewarded.load();

//     // Unsubscribe from events on unmount
//     return () => {
//       clearTimeout(adLoadTimeout);
//       unsubscribeLoaded();
//       unsubscribeEarned();
//     };
//   }, []);

//   useEffect(() => {
//     const fetchQuestions = async () => {
//       try {
//         setLoading(true);
//         const response = await axios.get(
//           `https://apije.pythonanywhere.com/exam/api/cbt1/?page=${page}&page_size=5`,
//         );

//         const newData = response.data.results;
//         setQuestionsData(prevData => [...prevData, ...newData]);
//         setHasMoreQuestions(newData.length > 0);
//         setLoading(false);
//       } catch (err) {
//         setError(err);
//         setLoading(false);
//         // Alert.alert('Error', 'Failed to load questions. Please try again.');
//       }
//     };

//     fetchQuestions();
//   }, [page]);

//   // Handle showing hint with ad
//   const showHintWithAd = async hint => {
//     if (!hint) {
//       Alert.alert('No Hint', 'No hint available for this question.');
//       return;
//     }

//     setCurrentHint(hint);

//     try {
//       if (isAdLoaded) {
//         await rewarded.show();
//       } else {
//         await rewarded.load();
//         Alert.alert(
//           'Advertisement Unavailable',
//           'We are currently unable to display an advertisement. Please try again shortly, or check back later for  hint.',
//           [{text: 'OK'}],
//         );
//       }
//       setModalVisible(true);
//     } catch (error) {
//       Alert.alert(
//         'Error Occurred',
//         'There was an issue displaying the advertisement. Please try again later.',
//         [{text: 'OK'}],
//       );
//     }
//   };

//   // Handle option selection
//   const handleOptionPress = (selectedQuestion, selectedOption) => {
//     const updatedQuestions = questionsData.map(question =>
//       question.id === selectedQuestion.id
//         ? {
//             ...question,
//             selectedOption,
//             answered: true,
//             answeredCorrectly: selectedOption === question.correct_option,
//           }
//         : question,
//     );
//     setQuestionsData(updatedQuestions);
//   };

//   // Render individual question
//   const renderQuestion = ({item}) => (
//     <View style={styles.questionContainer}>
//       <View style={styles.questionHeader}>
//         <Text style={styles.questionText}>• {item.question_text}</Text>
//         {item.hint && (
//           <TouchableOpacity
//             style={styles.hintButton}
//             onPress={() => showHintWithAd(item.hint)}>
//             <MaterialCommunityIcons
//               name="lightbulb-outline"
//               size={24}
//               // color="#FFD700"
//               color="black"
//             />
//           </TouchableOpacity>
//         )}
//       </View>

//       {['A', 'B', 'C', 'D'].map(option => (
//         <TouchableOpacity
//           key={option}
//           style={[
//             styles.option,
//             item.selectedOption === option && styles.selectedOption,
//             item.selectedOption === option &&
//               item.correct_option === option &&
//               styles.correctOption,
//           ]}
//           onPress={() => handleOptionPress(item, option)}>
//           <View style={styles.optionContent}>
//             <View style={styles.optionBadge}>
//               <Text style={styles.optionBadgeText}>{option}</Text>
//             </View>
//             <Text style={styles.optionText}>
//               {item[`option_${option.toLowerCase()}`]}
//             </Text>
//           </View>
//         </TouchableOpacity>
//       ))}

//       {item.selectedOption && (
//         <View style={styles.answerDescription}>
//           {/* <MaterialCommunityIcons
//             name={item.answeredCorrectly ? 'check-circle' : 'close-circle'}
//             size={24}
//             color={item.answeredCorrectly ? '#4CAF50' : '#F44336'}
//           /> */}
//           <View style={{display: 'flex', flexDirection: 'row'}}>
//             {item.answeredCorrectly ? (
//               <LottieView
//                 source={require('../util/right.json')}
//                 autoPlay
//                 loop={false}
//                 style={{width: 24, height: 24}}
//               />
//             ) : (
//               <LottieView
//                 source={require('../util/wrong.json')}
//                 autoPlay
//                 loop={false}
//                 style={{width: 24, height: 24}}
//               />
//             )}
//             <Text
//               style={[
//                 styles.resultText,
//                 item.answeredCorrectly
//                   ? styles.correctText
//                   : styles.incorrectText,
//               ]}>
//               {item.answeredCorrectly ? 'Correct!' : 'Incorrect!'}
//             </Text>
//           </View>
//           <View>
//             <Text
//               style={{color: 'green', fontSize: wp('4%'), fontWeight: '600'}}>
//               Answer
//             </Text>
//             <Text style={styles.descriptionText}>
//               {item.answer_description}
//             </Text>
//           </View>
//           {/* <Text style={styles.descriptionText}>{item.answer_description}</Text> */}
//         </View>
//       )}
//     </View>
//   );

//   // Hint modal
//   const HintModal = () => (
//     <Modal
//       animationType="slide"
//       transparent={true}
//       visible={modalVisible}
//       onRequestClose={() => setModalVisible(false)}>
//       <View style={styles.modalOverlay}>
//         <View style={styles.modalContent}>
//           <View style={styles.modalHeader}>
//             <Text style={styles.modalTitle}>Hint</Text>
//             <TouchableOpacity
//               style={styles.closeButton}
//               onPress={() => setModalVisible(false)}>
//               <MaterialCommunityIcons name="close" size={24} color="#000" />
//             </TouchableOpacity>
//           </View>
//           <Text style={styles.hintText}>{currentHint}</Text>
//         </View>
//       </View>
//     </Modal>
//   );

//   return (
//     <View style={styles.container}>
//       <HintModal />
//       {questionsData.length > 0 ? (
//         <FlatList
//           data={questionsData}
//           renderItem={renderQuestion}
//           // keyExtractor={item => item.id.toString()}
//           keyExtractor={(item, index) => `${item.id}-${index}`}
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={styles.listContainer}
//           onEndReached={() => {
//             if (hasMoreQuestions && !loading) {
//               setPage(prev => prev + 1);
//             }
//           }}
//           onEndReachedThreshold={0.5}
//           ListFooterComponent={() => (
//             <View style={styles.footer}>
//               {loading && <ActivityIndicator size="large" color="#0074E4" />}
//               {!hasMoreQuestions && !loading && (
//                 <Text style={styles.noMoreQuestionsText}>
//                   You've reached the end!
//                 </Text>
//               )}
//             </View>
//           )}
//         />
//       ) : (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#0074E4" />
//           <Text style={styles.loadingText}>Loading questions...</Text>
//         </View>
//       )}
//     </View>
//   );
// };
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F5F7FA',
//   },
//   listContainer: {
//     padding: wp('2%'),
//   },
//   questionContainer: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: wp('4%'),
//     padding: wp('4%'),
//     marginBottom: hp('2%'),
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: {width: 0, height: 2},
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   questionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: hp('2%'),
//   },
//   questionText: {
//     fontSize: wp('4.5%'),
//     color: '#2C3E50',
//     fontWeight: '600',
//     flex: 1,
//   },
//   hintButton: {
//     padding: wp('2%'),
//     borderRadius: wp('50%'),
//     backgroundColor: '#FFF9C4',
//   },
//   option: {
//     backgroundColor: '#F8F9FA',
//     borderRadius: wp('2%'),
//     marginVertical: hp('1%'),
//     borderWidth: 1,
//     borderColor: '#E9ECEF',
//     overflow: 'hidden',
//   },
//   optionContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: wp('3%'),
//   },
//   optionBadge: {
//     backgroundColor: '#E9ECEF',
//     borderRadius: wp('50%'),
//     width: wp('8%'),
//     height: wp('8%'),
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: wp('3%'),
//   },
//   optionBadgeText: {
//     color: '#495057',
//     fontWeight: '600',
//   },
//   optionText: {
//     color: '#495057',
//     fontSize: wp('4%'),
//     flex: 1,
//   },
//   selectedOption: {
//     backgroundColor: '#E3F2FD',
//     borderColor: '#2196F3',
//   },
//   correctOption: {
//     backgroundColor: '#E8F5E9',
//     borderColor: '#4CAF50',
//   },
//   answerDescription: {
//     marginTop: hp('2%'),
//     padding: wp('3%'),
//     backgroundColor: '#F8F9FA',
//     borderRadius: wp('2%'),
//   },
//   resultText: {
//     fontSize: wp('4%'),
//     fontWeight: '600',
//     marginBottom: hp('1%'),
//     marginLeft: 8,
//   },
//   correctText: {
//     color: '#4CAF50',
//   },
//   incorrectText: {
//     color: '#F44336',
//   },
//   descriptionText: {
//     color: '#6C757D',
//     fontSize: wp('3.8%'),
//     lineHeight: wp('5.5%'),
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContent: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: wp('4%'),
//     padding: wp('5%'),
//     width: wp('90%'),
//     maxHeight: hp('60%'),
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: hp('2%'),
//   },
//   modalTitle: {
//     fontSize: wp('5%'),
//     fontWeight: '600',
//     color: '#2C3E50',
//   },
//   closeButton: {
//     padding: wp('2%'),
//   },
//   hintText: {
//     fontSize: wp('4%'),
//     color: '#495057',
//     lineHeight: wp('6%'),
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingText: {
//     marginTop: hp('2%'),
//     color: '#6C757D',
//     fontSize: wp('4%'),
//   },
//   footer: {
//     padding: wp('4%'),
//     alignItems: 'center',
//   },
//   noMoreQuestionsText: {
//     color: 'black',
//     fontSize: wp('4%'),
//     fontWeight: '500',
//   },
// });

// export default Cbt1;

//**** below code is awesome */
// import React, {useState, useEffect} from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   ActivityIndicator,
//   SafeAreaView,
//   Alert,
// } from 'react-native';
// import {useGetQuestionsQuery} from '../util/apiSlice';

// const cbt1 = ({navigation}) => {
//   const [currentPage, setCurrentPage] = useState(1);
//   const [selectedAnswers, setSelectedAnswers] = useState({});
//   const [timeLeft, setTimeLeft] = useState(3600); // 1 hour in seconds

//   const {
//     data: questionsData,
//     isLoading,
//     isError,
//     error,
//     refetch,
//   } = useGetQuestionsQuery({
//     page: currentPage,
//     pageSize: 10,
//   });

//   // Timer effect
//   useEffect(() => {
//     const timer = setInterval(() => {
//       setTimeLeft(prevTime => {
//         if (prevTime <= 0) {
//           clearInterval(timer);
//           handleTimeUp();
//           return 0;
//         }
//         return prevTime - 1;
//       });
//     }, 1000);

//     return () => clearInterval(timer);
//   }, []);

//   const handleTimeUp = () => {
//     Alert.alert(
//       'Time Up!',
//       'Your examination time has elapsed.',
//       [
//         {
//           text: 'Submit',
//           onPress: handleSubmit,
//         },
//       ],
//       {cancelable: false},
//     );
//   };

//   const formatTime = seconds => {
//     const minutes = Math.floor(seconds / 60);
//     const remainingSeconds = seconds % 60;
//     return `${String(minutes).padStart(2, '0')}:${String(
//       remainingSeconds,
//     ).padStart(2, '0')}`;
//   };

//   const handleAnswerSelect = (questionId, answer) => {
//     setSelectedAnswers(prev => ({
//       ...prev,
//       [questionId]: answer,
//     }));
//   };

//   const handleSubmit = () => {
//     // Calculate score
//     let score = 0;
//     let totalQuestions = 0;

//     if (questionsData?.results) {
//       questionsData.results.forEach(question => {
//         if (selectedAnswers[question.id] === question.correct_answer) {
//           score++;
//         }
//         totalQuestions++;
//       });
//     }

//     Alert.alert(
//       'Submit Exam',
//       `Are you sure you want to submit?\nAnswered: ${
//         Object.keys(selectedAnswers).length
//       }/${totalQuestions}`,
//       [
//         {
//           text: 'Cancel',
//           style: 'cancel',
//         },
//         {
//           text: 'Submit',
//           onPress: () => {
//             // Navigate to results screen with score
//             navigation.navigate('Results', {
//               score,
//               totalQuestions,
//               timeSpent: 3600 - timeLeft,
//             });
//           },
//         },
//       ],
//     );
//   };

//   if (isLoading) {
//     return (
//       <View style={styles.centerContainer}>
//         <ActivityIndicator size="large" color="#0066cc" />
//         <Text style={styles.loadingText}>Loading questions...</Text>
//       </View>
//     );
//   }

//   if (isError) {
//     return (
//       <View style={styles.centerContainer}>
//         <Text style={styles.errorText}>
//           Error: {error?.data?.message || 'Failed to load questions'}
//         </Text>
//         <TouchableOpacity style={styles.retryButton} onPress={refetch}>
//           <Text style={styles.retryButtonText}>Retry</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   if (!questionsData?.results || questionsData.results.length === 0) {
//     return (
//       <View style={styles.centerContainer}>
//         <Text style={styles.noQuestionsText}>No questions available</Text>
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <Text style={styles.timerText}>Time Left: {formatTime(timeLeft)}</Text>
//         <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
//           <Text style={styles.submitButtonText}>Submit</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Questions */}
//       <ScrollView style={styles.questionsContainer}>
//         {questionsData.results.map((question, index) => (
//           <View key={question.id} style={styles.questionCard}>
//             <Text style={styles.questionNumber}>Question {index + 1}</Text>
//             <Text style={styles.questionText}>{question.question}</Text>

//             {/* Options */}
//             <View style={styles.optionsContainer}>
//               {['A', 'B', 'C', 'D'].map(option => (
//                 <TouchableOpacity
//                   key={option}
//                   style={[
//                     styles.optionButton,
//                     selectedAnswers[question.id] === option &&
//                       styles.selectedOption,
//                   ]}
//                   onPress={() => handleAnswerSelect(question.id, option)}>
//                   <Text
//                     style={[
//                       styles.optionText,
//                       selectedAnswers[question.id] === option &&
//                         styles.selectedOptionText,
//                     ]}>
//                     {option}. {question[`option_${option.toLowerCase()}`]}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           </View>
//         ))}
//       </ScrollView>

//       {/* Pagination */}
//       {questionsData.total_pages > 1 && (
//         <View style={styles.pagination}>
//           <TouchableOpacity
//             style={[
//               styles.pageButton,
//               currentPage === 1 && styles.disabledButton,
//             ]}
//             onPress={() => setCurrentPage(prev => Math.max(1, prev - 1))}
//             disabled={currentPage === 1}>
//             <Text style={styles.pageButtonText}>Previous</Text>
//           </TouchableOpacity>

//           <Text style={styles.pageText}>
//             Page {currentPage} of {questionsData.total_pages}
//           </Text>

//           <TouchableOpacity
//             style={[
//               styles.pageButton,
//               currentPage === questionsData.total_pages &&
//                 styles.disabledButton,
//             ]}
//             onPress={() =>
//               setCurrentPage(prev =>
//                 Math.min(questionsData.total_pages, prev + 1),
//               )
//             }
//             disabled={currentPage === questionsData.total_pages}>
//             <Text style={styles.pageButtonText}>Next</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
//   centerContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 15,
//     backgroundColor: '#ffffff',
//     borderBottomWidth: 1,
//     borderBottomColor: '#e0e0e0',
//   },
//   timerText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   submitButton: {
//     backgroundColor: '#0066cc',
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 5,
//   },
//   submitButtonText: {
//     color: '#ffffff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   questionsContainer: {
//     flex: 1,
//     padding: 15,
//   },
//   questionCard: {
//     backgroundColor: '#ffffff',
//     borderRadius: 10,
//     padding: 15,
//     marginBottom: 15,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: {width: 0, height: 2},
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   questionNumber: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#666',
//     marginBottom: 10,
//   },
//   questionText: {
//     fontSize: 18,
//     color: '#333',
//     marginBottom: 15,
//     lineHeight: 24,
//   },
//   optionsContainer: {
//     marginTop: 10,
//   },
//   optionButton: {
//     padding: 15,
//     borderRadius: 8,
//     marginBottom: 10,
//     backgroundColor: '#f8f8f8',
//     borderWidth: 1,
//     borderColor: '#e0e0e0',
//   },
//   selectedOption: {
//     backgroundColor: '#e3f2fd',
//     borderColor: '#0066cc',
//   },
//   optionText: {
//     fontSize: 16,
//     color: '#444',
//   },
//   selectedOptionText: {
//     color: '#0066cc',
//     fontWeight: '500',
//   },
//   pagination: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 15,
//     backgroundColor: '#ffffff',
//     borderTopWidth: 1,
//     borderTopColor: '#e0e0e0',
//   },
//   pageButton: {
//     backgroundColor: '#0066cc',
//     paddingHorizontal: 15,
//     paddingVertical: 8,
//     borderRadius: 5,
//   },
//   disabledButton: {
//     backgroundColor: '#cccccc',
//   },
//   pageButtonText: {
//     color: '#ffffff',
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   pageText: {
//     fontSize: 14,
//     color: '#666',
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: '#666',
//   },
//   errorText: {
//     fontSize: 16,
//     color: '#dc3545',
//     textAlign: 'center',
//     marginBottom: 15,
//   },
//   retryButton: {
//     backgroundColor: '#0066cc',
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 5,
//   },
//   retryButtonText: {
//     color: '#ffffff',
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   noQuestionsText: {
//     fontSize: 16,
//     color: '#666',
//   },
// });

// export default cbt1;

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  BackHandler,
  Modal,
  Animated,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';
import LottieView from 'lottie-react-native';
import {useGetQuestionsQuery} from '../util/apiSlice';

// Ad unit configuration
const adUnitId = __DEV__
  ? TestIds.REWARDED
  : 'ca-app-pub-2627956667785383/9398599673';

const rewarded = RewardedAd.createForAdRequest(adUnitId, {
  keywords: ['education', 'exam', 'learning'],
});

const Cbt1 = ({navigation}) => {
  // State management
  const [page, setPage] = useState(1);
  const [allQuestions, setAllQuestions] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentHint, setCurrentHint] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [isAdLoaded, setIsAdLoaded] = useState(false);

  // RTK Query hook
  const {
    data: questionsData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetQuestionsQuery({
    page,
    pageSize: 5,
  });

  // Update allQuestions when new data arrives
  useEffect(() => {
    if (questionsData?.results) {
      setAllQuestions(prev => {
        const newQuestions = questionsData.results.filter(
          newQ => !prev.find(existingQ => existingQ.id === newQ.id),
        );
        return [...prev, ...newQuestions];
      });
    }
  }, [questionsData]);

  // Back handler setup
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );
    return () => backHandler.remove();
  }, []);

  // Ad loading setup
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
        setModalVisible(true);
      },
    );

    rewarded.load();

    return () => {
      clearTimeout(adLoadTimeout);
      unsubscribeLoaded();
      unsubscribeEarned();
    };
  }, []);

  const handleBackPress = () => {
    if (navigation.isFocused()) {
      Alert.alert(
        'Exit App',
        'Are you sure you want to exit?',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Exit',
            onPress: () => BackHandler.exitApp(),
            style: 'destructive',
          },
        ],
        {cancelable: false},
      );
      return true;
    }
    return false;
  };

  const showHintWithAd = async hint => {
    if (!hint) {
      Alert.alert('No Hint', 'No hint available for this question.');
      return;
    }

    setCurrentHint(hint);

    try {
      if (isAdLoaded) {
        await rewarded.show();
      } else {
        await rewarded.load();
        Alert.alert(
          'Advertisement Unavailable',
          'We are currently unable to display an advertisement. Please try again shortly, or check back later for hint.',
          [{text: 'OK'}],
        );
      }
    } catch (error) {
      Alert.alert(
        'Error Occurred',
        'There was an issue displaying the advertisement. Please try again later.',
        [{text: 'OK'}],
      );
    }
  };

  const handleOptionPress = (selectedQuestion, selectedOption) => {
    setAllQuestions(prevQuestions =>
      prevQuestions.map(question =>
        question.id === selectedQuestion.id
          ? {
              ...question,
              selectedOption,
              answered: true,
              answeredCorrectly: selectedOption === question.correct_option,
            }
          : question,
      ),
    );
  };

  const renderQuestion = ({item}) => (
    <View style={styles.questionContainer}>
      <View style={styles.questionHeader}>
        <Text style={styles.questionText}>• {item.question_text}</Text>
        {item.hint && (
          <TouchableOpacity
            style={styles.hintButton}
            onPress={() => showHintWithAd(item.hint)}>
            <MaterialCommunityIcons
              name="lightbulb-outline"
              size={24}
              color="black"
            />
          </TouchableOpacity>
        )}
      </View>

      {['A', 'B', 'C', 'D'].map(option => (
        <TouchableOpacity
          key={option}
          style={[
            styles.option,
            item.selectedOption === option && styles.selectedOption,
            item.selectedOption === option &&
              item.correct_option === option &&
              styles.correctOption,
          ]}
          onPress={() => handleOptionPress(item, option)}>
          <View style={styles.optionContent}>
            <View style={styles.optionBadge}>
              <Text style={styles.optionBadgeText}>{option}</Text>
            </View>
            <Text style={styles.optionText}>
              {item[`option_${option.toLowerCase()}`]}
            </Text>
          </View>
        </TouchableOpacity>
      ))}

      {item.selectedOption && (
        <View style={styles.answerDescription}>
          <View style={{display: 'flex', flexDirection: 'row'}}>
            {item.answeredCorrectly ? (
              <LottieView
                source={require('../util/right.json')}
                autoPlay
                loop={false}
                style={{width: 24, height: 24}}
              />
            ) : (
              <LottieView
                source={require('../util/wrong.json')}
                autoPlay
                loop={false}
                style={{width: 24, height: 24}}
              />
            )}
            <Text
              style={[
                styles.resultText,
                item.answeredCorrectly
                  ? styles.correctText
                  : styles.incorrectText,
              ]}>
              {item.answeredCorrectly ? 'Correct!' : 'Incorrect!'}
            </Text>
          </View>
          <View>
            <Text
              style={{color: 'green', fontSize: wp('4%'), fontWeight: '600'}}>
              Answer
            </Text>
            <Text style={styles.descriptionText}>
              {item.answer_description}
            </Text>
          </View>
        </View>
      )}
    </View>
  );

  const HintModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Hint</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}>
              <MaterialCommunityIcons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <Text style={styles.hintText}>{currentHint}</Text>
        </View>
      </View>
    </Modal>
  );

  if (isError) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>
          Error loading questions. Please try again.
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HintModal />
      {allQuestions.length > 0 ? (
        <FlatList
          data={allQuestions}
          renderItem={renderQuestion}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          onEndReached={() => {
            if (questionsData?.next && !isFetching) {
              setPage(prev => prev + 1);
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() => (
            <View style={styles.footer}>
              {isFetching && <ActivityIndicator size="large" color="#0074E4" />}
              {!questionsData?.next && !isFetching && (
                <Text style={styles.noMoreQuestionsText}>
                  You've reached the end!
                </Text>
              )}
            </View>
          )}
        />
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0074E4" />
          <Text style={styles.loadingText}>Loading questions...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  listContainer: {
    padding: wp('2%'),
  },
  questionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp('4%'),
    padding: wp('4%'),
    marginBottom: hp('2%'),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  questionText: {
    fontSize: wp('4.5%'),
    color: '#2C3E50',
    fontWeight: '600',
    flex: 1,
  },
  hintButton: {
    padding: wp('2%'),
    borderRadius: wp('50%'),
    backgroundColor: '#FFF9C4',
  },
  option: {
    backgroundColor: '#F8F9FA',
    borderRadius: wp('2%'),
    marginVertical: hp('1%'),
    borderWidth: 1,
    borderColor: '#E9ECEF',
    overflow: 'hidden',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp('3%'),
  },
  optionBadge: {
    backgroundColor: '#E9ECEF',
    borderRadius: wp('50%'),
    width: wp('8%'),
    height: wp('8%'),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('3%'),
  },
  optionBadgeText: {
    color: '#495057',
    fontWeight: '600',
  },
  optionText: {
    color: '#495057',
    fontSize: wp('4%'),
    flex: 1,
  },
  selectedOption: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  correctOption: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  answerDescription: {
    marginTop: hp('2%'),
    padding: wp('3%'),
    backgroundColor: '#F8F9FA',
    borderRadius: wp('2%'),
  },
  resultText: {
    fontSize: wp('4%'),
    fontWeight: '600',
    marginBottom: hp('1%'),
    marginLeft: 8,
  },
  correctText: {
    color: '#4CAF50',
  },
  incorrectText: {
    color: '#F44336',
  },
  descriptionText: {
    color: '#6C757D',
    fontSize: wp('3.8%'),
    lineHeight: wp('5.5%'),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp('4%'),
    padding: wp('5%'),
    width: wp('90%'),
    maxHeight: hp('60%'),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  modalTitle: {
    fontSize: wp('5%'),
    fontWeight: '600',
    color: '#2C3E50',
  },
  closeButton: {
    padding: wp('2%'),
  },
  hintText: {
    fontSize: wp('4%'),
    color: '#495057',
    lineHeight: wp('6%'),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: hp('2%'),
    color: '#6C757D',
    fontSize: wp('4%'),
  },
  footer: {
    padding: wp('4%'),
    alignItems: 'center',
  },
  noMoreQuestionsText: {
    color: 'black',
    fontSize: wp('4%'),
    fontWeight: '500',
  },
  errorText: {
    color: '#F44336',
    fontSize: wp('4%'),
    textAlign: 'center',
    marginBottom: hp('2%'),
  },
  retryButton: {
    backgroundColor: '#0074E4',
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('1.5%'),
    borderRadius: wp('2%'),
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: wp('4%'),
    fontWeight: '600',
  },
});

export default Cbt1;
