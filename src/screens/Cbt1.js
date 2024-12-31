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
  const [page, setPage] = useState(1);
  const [allQuestions, setAllQuestions] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentHint, setCurrentHint] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [isAdLoaded, setIsAdLoaded] = useState(false);

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

  const showHintWithAd = async answer_description => {
    setCurrentHint(answer_description);

    try {
      if (isAdLoaded) {
        await rewarded.show();
      } else {
        await rewarded.load();
        Alert.alert(
          'Just a Moment',
          'The ad is taking a bit longer to load. We will show you the solution right away instead!',
          [
            {
              text: 'Show Solution',
              onPress: () => setModalVisible(true),
            },
          ],
        );
      }
    } catch (error) {
      Alert.alert(
        'Quick Update',
        'We encountered a small hiccup with the ad, but no worries - you can still view the solution!',
        [
          {
            text: 'Show Solution',
            onPress: () => setModalVisible(true),
          },
        ],
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
        {item.answer_description && (
          <TouchableOpacity
            style={styles.hintButton}
            onPress={() => showHintWithAd(item.answer_description)}>
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
              Hint
            </Text>
            <Text style={styles.descriptionText}>{item.hint}</Text>
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
            <Text style={styles.modalTitle}>Solution</Text>
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="White" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CBT1</Text>
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp('4%'),
    backgroundColor: '#0074E4',
  },
  headerTitle: {
    fontSize: wp('5%'),
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: wp('30%'),
    justifyContent: 'center',
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
