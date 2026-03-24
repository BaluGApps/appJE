import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  Dimensions,
  Animated,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import {useAppTheme} from '../util/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  BannerAd,
  BannerAdSize,
  InterstitialAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

// Data imports
import allQuestions from '../data/questions';
import { playSound } from '../util/sound';

const { width } = Dimensions.get('window');
const interstitialId = __DEV__
  ? TestIds.INTERSTITIAL
  : 'ca-app-pub-2627956667785383/2550120291';
const interstitial = InterstitialAd.createForAdRequest(interstitialId);

const PracticeScreen = ({ route, navigation }) => {
  const { t, i18n } = useTranslation();
  const {colors, isDark} = useAppTheme();
  
  const initialCategory = route.params?.category || 'NTPC';
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isInterstitialLoaded, setIsInterstitialLoaded] = useState(false);

  const categories = ['NTPC', 'ALP', 'JE', 'GroupD'];

  const getLanguageData = () => {
    return allQuestions[i18n.language] || allQuestions.en;
  };

  const questions = getLanguageData()[selectedCategory] || [];
  const currentQuestion = questions[currentQuestionIndex];

  const handleOptionSelect = (index) => {
    if (showResult) return;
    setSelectedOption(index);
    setShowResult(true);
    
    if (index === currentQuestion.ans) {
      playSound('correct');
    } else {
      playSound('wrong');
    }
    maybeShowAdAfter15();
  };

  useEffect(() => {
    const adListener = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      setIsInterstitialLoaded(true);
    });
    const closeListener = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      setIsInterstitialLoaded(false);
      interstitial.load();
    });
    interstitial.load();
    return () => {
      adListener();
      closeListener();
    };
  }, []);

  const maybeShowAdAfter15 = async () => {
    try {
      const key = 'ads.practiceAnsweredCount';
      const current = Number((await AsyncStorage.getItem(key)) || '0') + 1;
      await AsyncStorage.setItem(key, String(current));
      if (current % 15 === 0 && isInterstitialLoaded) {
        interstitial.show();
      }
    } catch (e) {
      // no-op
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      resetState();
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      resetState();
    }
  };

  const resetState = () => {
    setSelectedOption(null);
    setShowResult(false);
    setShowHint(false);
  };

  if (!currentQuestion) {
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
        <View style={[styles.header, {backgroundColor: colors.primary}]}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Icon name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedCategory}</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Icon name="document-text-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>{t('noQuestions')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={[styles.header, {backgroundColor: colors.primary}]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>RRB {selectedCategory}</Text>
        <TouchableOpacity onPress={() => setShowHint(!showHint)}>
          <Icon name="bulb-outline" size={24} color={showHint ? "#FFD700" : "#FFF"} />
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }]} />
        <Text style={styles.progressText}>{currentQuestionIndex + 1} / {questions.length}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.questionCard, {backgroundColor: colors.card}]}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{t('level')} {currentQuestion.level}</Text>
          </View>
          <Text style={[styles.questionText, {color: colors.text}]}>{currentQuestion.q}</Text>
        </View>

        {showHint && (
          <View style={styles.hintBox}>
            <Text style={styles.hintTitle}>💡 {t('hint')}:</Text>
            <Text style={styles.hintText}>{currentQuestion.hint}</Text>
          </View>
        )}

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((opt, idx) => {
            let buttonStyle = styles.optionButton;
            let textStyle = styles.optionText;
            const isUnselectedAfterResult = showResult && idx !== selectedOption && idx !== currentQuestion.ans;

            if (showResult) {
              if (idx === currentQuestion.ans) {
                buttonStyle = [styles.optionButton, styles.correctOption];
                textStyle = [styles.optionText, styles.correctText];
              } else if (idx === selectedOption) {
                buttonStyle = [styles.optionButton, styles.wrongOption];
                textStyle = [styles.optionText, styles.wrongText];
              }
            } else if (idx === selectedOption) {
                buttonStyle = [styles.optionButton, styles.selectedOption];
            }

            return (
              <TouchableOpacity
                key={idx}
                style={[
                  buttonStyle,
                  styles.optionBaseTheme,
                  (isUnselectedAfterResult || !showResult) && {
                    backgroundColor: isDark ? '#253149' : '#FFFFFF',
                    borderColor: isDark ? '#34425D' : '#E5E7EB',
                  },
                ]}
                onPress={() => handleOptionSelect(idx)}
                disabled={showResult}
              >
                <Text
                  style={[
                    textStyle,
                    (isUnselectedAfterResult || !showResult) && {
                      color: isDark ? '#F3F6FB' : '#334155',
                    },
                  ]}>
                  {opt}
                </Text>
                {showResult && idx === currentQuestion.ans && (
                  <Icon name="checkmark-circle" size={20} color="#FFF" />
                )}
                {showResult && idx === selectedOption && idx !== currentQuestion.ans && (
                  <Icon name="close-circle" size={20} color="#FFF" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {showResult && (
          <View style={styles.solutionBox}>
            <Text style={styles.solutionTitle}>{t('explanation')}</Text>
            <Text style={styles.solutionText}>
              {currentQuestion.explanation || currentQuestion.solution}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.bannerWrap}>
        <BannerAd
          unitId={__DEV__ ? TestIds.ADAPTIVE_BANNER : 'ca-app-pub-2627956667785383/2550120291'}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        />
      </View>

      <View style={[styles.footer, {backgroundColor: colors.card, borderTopColor: colors.border}]}>
        <TouchableOpacity 
          style={[styles.navButton, currentQuestionIndex === 0 && styles.disabledButton]} 
          onPress={prevQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <Icon name="chevron-back" size={24} color={currentQuestionIndex === 0 ? "#ccc" : "#0074E4"} />
          <Text style={[styles.navButtonText, currentQuestionIndex === 0 && styles.disabledText]}>{t('prev')}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navButton, currentQuestionIndex === questions.length - 1 && styles.disabledButton]} 
          onPress={nextQuestion}
          disabled={currentQuestionIndex === questions.length - 1}
        >
          <Text style={[styles.navButtonText, currentQuestionIndex === questions.length - 1 && styles.disabledText]}>{t('next')}</Text>
          <Icon name="chevron-forward" size={24} color={currentQuestionIndex === questions.length - 1 ? "#ccc" : "#0074E4"} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#0074E4',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: wp('5.5%'),
    fontWeight: 'bold',
    color: '#FFF',
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#E0E0E0',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#43e97b',
  },
  progressText: {
      position: 'absolute',
      right: 10,
      top: 10,
      fontSize: 12,
      color: '#666',
      fontWeight: 'bold'
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  questionCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  levelText: {
    color: '#0074E4',
    fontWeight: 'bold',
    fontSize: 12,
  },
  questionText: {
    fontSize: wp('4.8%'),
    color: '#333',
    lineHeight: 28,
    fontWeight: '600',
  },
  hintBox: {
    backgroundColor: '#FFF9C4',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FBC02D',
  },
  hintTitle: {
    fontWeight: 'bold',
    color: '#F9A825',
    marginBottom: 4,
  },
  hintText: {
    color: '#7F6000',
    fontSize: 14,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#FFF',
    padding: 18,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  optionBaseTheme: {
    borderWidth: 1,
  },
  selectedOption: {
      borderColor: '#0074E4',
      borderWidth: 2,
  },
  correctOption: {
    backgroundColor: '#43e97b',
  },
  wrongOption: {
    backgroundColor: '#FF5252',
  },
  optionText: {
    fontSize: 16,
    color: '#444',
    fontWeight: '500',
    flex: 1,
  },
  correctText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  wrongText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  solutionBox: {
    marginTop: 24,
    padding: 20,
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#43A047',
  },
  solutionTitle: {
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
    fontSize: 16,
  },
  solutionText: {
    color: '#388E3C',
    lineHeight: 22,
    fontSize: 14,
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0074E4',
  },
  disabledText: {
    color: '#ccc',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
    marginTop: 16,
  },
  bannerWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default PracticeScreen;
