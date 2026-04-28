import React, {useEffect, useMemo, useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import LottieView from 'lottie-react-native';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {useAppTheme} from '../util/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  BannerAd,
  BannerAdSize,
  InterstitialAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';
import allQuestions from '../data/questions';
import {playSound} from '../util/sound';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';

const interstitial = InterstitialAd.createForAdRequest(
  __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-2627956667785383/2550120291',
);

const COPY = {
  en: {
    playing: 'Practice Flow',
    hint: 'Hint',
    solution: 'Solution',
    nextLevel: 'Next Level',
    retry: 'Retry Level',
    backLevels: 'Back to Levels',
    correct: 'Correct',
    retryTitle: 'Wrong Answer',
    keepGoing: 'Great rhythm. Move to the next level.',
    tryAgain: 'Review the explanation and attempt the level again.',
  },
  hi: {
    playing: 'प्रैक्टिस मोड',
    hint: 'हिंट',
    solution: 'समाधान',
    nextLevel: 'अगला लेवल',
    retry: 'फिर प्रयास करें',
    backLevels: 'लेवल्स पर वापस जाएं',
    correct: 'सही उत्तर',
    retryTitle: 'गलत उत्तर',
    keepGoing: 'बहुत अच्छा। अगले लेवल पर बढ़िए।',
    tryAgain: 'व्याख्या पढ़ें और इस लेवल को फिर से हल करें।',
  },
  kn: {
    playing: 'ಪ್ರಾಕ್ಟಿಸ್ ಮೋಡ್',
    hint: 'ಸುಳಿವು',
    solution: 'ಪರಿಹಾರ',
    nextLevel: 'ಮುಂದಿನ ಹಂತ',
    retry: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
    backLevels: 'ಹಂತಗಳಿಗೆ ಹಿಂತಿರುಗಿ',
    correct: 'ಸರಿಯಾದ ಉತ್ತರ',
    retryTitle: 'ತಪ್ಪು ಉತ್ತರ',
    keepGoing: 'ಚೆನ್ನಾಗಿದೆ. ಮುಂದಿನ ಹಂತಕ್ಕೆ ಸಾಗಿರಿ.',
    tryAgain: 'ವಿವರಣೆಯನ್ನು ನೋಡಿ ಇದೇ ಹಂತವನ್ನು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
  },
};

const normalizeAnswerIndex = value => {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return 0;
  }

  return parsed > 0 ? parsed - 1 : parsed;
};

const PracticeQuizScreen = ({route, navigation}) => {
  const insets = useSafeAreaInsets();
  const {t, i18n} = useTranslation();
  const {colors, isDark} = useAppTheme();
  const {category, levelIndex} = route.params;
  const copy = COPY[i18n.language] || COPY.en;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(levelIndex);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [isInterstitialLoaded, setIsInterstitialLoaded] = useState(false);
  const [progressState, setProgressState] = useState({unlockedLevel: 1, completed: []});

  const questions = useMemo(() => {
    const langData = allQuestions[i18n.language] || allQuestions.en;
    return langData[category] || [];
  }, [i18n.language, category]);

  const currentQuestion = questions[currentQuestionIndex];
  const progressKey = `practice.progress.${i18n.language}.${category}`;
  const correctAnswerIndex = currentQuestion ? normalizeAnswerIndex(currentQuestion.ans) : 0;
  const isCorrect = showResult && selectedOption === correctAnswerIndex;

  useEffect(() => {
    const setup = async () => {
      const saved = await AsyncStorage.getItem(progressKey);
      if (saved) {
        try {
          setProgressState(JSON.parse(saved));
        } catch (_error) {
          setProgressState({unlockedLevel: 1, completed: []});
        }
      } else {
        setProgressState({unlockedLevel: 1, completed: []});
      }
    };
    setup();
  }, [progressKey]);

  useEffect(() => {
    const adListener = interstitial.addAdEventListener(AdEventType.LOADED, () =>
      setIsInterstitialLoaded(true),
    );
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

  const maybeShowAdAfterCompletion = async () => {
    const key = 'ads.practiceCompletedCount';
    const current = Number((await AsyncStorage.getItem(key)) || '0') + 1;
    await AsyncStorage.setItem(key, String(current));
    if (current % 8 === 0 && isInterstitialLoaded) {
      interstitial.show();
    }
  };

  const persistProgress = async nextState => {
    setProgressState(nextState);
    await AsyncStorage.setItem(progressKey, JSON.stringify(nextState));
  };

  const resetCardState = () => {
    setSelectedOption(null);
    setShowResult(false);
    setShowHint(false);
    setShowSolution(false);
  };

  const goToGrid = () => {
    navigation.goBack();
  };

  const moveToNextLevel = () => {
    const nextLevelIndex = currentQuestionIndex + 1;
    if (nextLevelIndex < questions.length) {
      setCurrentQuestionIndex(nextLevelIndex);
      resetCardState();
    } else {
      goToGrid();
    }
  };

  const handleOptionSelect = async optionIndex => {
    if (!currentQuestion || showResult) {
      return;
    }

    setSelectedOption(optionIndex);
    setShowResult(true);
    const answerIsCorrect = optionIndex === correctAnswerIndex;

    if (answerIsCorrect) {
      playSound('correct');
      const level = currentQuestionIndex + 1;
      const completed = Array.from(new Set([...progressState.completed, level])).sort(
        (a, b) => a - b,
      );
      const unlockedLevel = Math.max(progressState.unlockedLevel, level + 1);
      await persistProgress({unlockedLevel, completed});
    } else {
      playSound('wrong');
    }

  };

  if (!currentQuestion) {
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
        <View style={[styles.header, {backgroundColor: colors.primary}]}>
          <TouchableOpacity onPress={goToGrid}>
            <Icon name="arrow-back" size={22} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{category} Practice</Text>
          <View style={{width: 22}} />
        </View>
        <View style={styles.center}>
          <Text style={{color: colors.text}}>Questions coming soon!</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}
      edges={['left', 'right', 'bottom']}>
      <View style={[styles.header, {backgroundColor: colors.primary, paddingTop: insets.top + 10}]}>
        <TouchableOpacity onPress={goToGrid}>
          <Icon name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category} Practice</Text>
        <View style={{width: 22}} />
      </View>

      <View style={styles.subHeader}>
        <Icon name="school-outline" size={16} color={colors.subtext} />
        <Text style={[styles.subHeaderText, {color: colors.subtext}]}>
          {copy.playing} • {category}
        </Text>
      </View>

      <ScrollView contentContainerStyle={[styles.content, {paddingBottom: 34}]}>
        <View style={styles.quizCenterWrap}>
          <View
            style={[
              styles.questionCard,
              {backgroundColor: colors.card, borderColor: colors.border},
            ]}>
            <Text style={[styles.levelPill, {color: colors.primary}]}>
              Level {currentQuestionIndex + 1}
            </Text>
            <Text style={[styles.questionText, {color: colors.text}]}>
              {currentQuestion.q}
            </Text>
          </View>

          <View style={styles.iconRow}>
            <TouchableOpacity
              onPress={() => setShowHint(v => !v)}
              style={[styles.iconChip, {backgroundColor: colors.card, borderColor: colors.border}]}>
              <Icon name="bulb-outline" size={18} color={showHint ? '#F59E0B' : colors.primary} />
              <Text style={[styles.iconChipText, {color: colors.text}]}>{copy.hint}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowSolution(v => !v)}
              style={[styles.iconChip, {backgroundColor: colors.card, borderColor: colors.border}]}>
              <Icon name="book-outline" size={18} color={showSolution ? '#6366F1' : colors.primary} />
              <Text style={[styles.iconChipText, {color: colors.text}]}>{copy.solution}</Text>
            </TouchableOpacity>
          </View>

          {showHint ? (
            <View style={[styles.infoCard, {backgroundColor: isDark ? '#3D341F' : '#FFF9C4'}]}>
              <Text style={styles.infoTitle}>{copy.hint}</Text>
              <Text style={[styles.infoBody, {color: isDark ? '#FDE68A' : '#7F6000'}]}>
                {currentQuestion.hint}
              </Text>
            </View>
          ) : null}

          {currentQuestion.options.map((option, idx) => {
            const optionIsCorrect = showResult && idx === correctAnswerIndex;
            const optionIsWrong = showResult && idx === selectedOption && idx !== correctAnswerIndex;

            return (
              <TouchableOpacity
                key={`${currentQuestion.id}-${idx}`}
                style={[
                  styles.option,
                  {backgroundColor: colors.card, borderColor: colors.border},
                  optionIsCorrect && {
                    backgroundColor: isDark ? '#143226' : '#DCFCE7',
                    borderColor: '#22C55E',
                  },
                  optionIsWrong && {
                    backgroundColor: isDark ? '#4B1D28' : '#FEE2E2',
                    borderColor: '#EF4444',
                  },
                ]}
                onPress={() => handleOptionSelect(idx)}
                disabled={showResult}>
                <Text style={[styles.optionText, {color: colors.text}]}>{option}</Text>
              </TouchableOpacity>
            );
          })}

          {(showResult || showSolution) ? (
            <View style={[styles.feedbackCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
              <View style={styles.feedbackTop}>
                <LottieView
                  autoPlay
                  loop={false}
                  style={styles.feedbackAnimation}
                  source={
                    isCorrect
                      ? require('../util/right.json')
                      : require('../util/wrong.json')
                  }
                />
                <View style={styles.feedbackTextWrap}>
                  <Text
                    style={[
                      styles.feedbackTitle,
                      {color: isCorrect ? '#22C55E' : '#EF4444'},
                    ]}>
                    {isCorrect ? copy.correct : copy.retryTitle}
                  </Text>
                  <Text style={[styles.feedbackSubtitle, {color: colors.subtext}]}>
                    {isCorrect ? copy.keepGoing : copy.tryAgain}
                  </Text>
                </View>
              </View>

              {!isCorrect && showResult ? (
                <Text style={[styles.correctLine, {color: colors.text}]}>
                  Correct answer: {currentQuestion.options[correctAnswerIndex]}
                </Text>
              ) : null}

              <View style={[styles.explanationWrap, {backgroundColor: isDark ? '#1E3A30' : '#EEFDF4'}]}>
                <Text style={[styles.infoTitle, {color: '#2E7D32'}]}>{t('explanation')}</Text>
                <Text style={[styles.infoBody, {color: isDark ? '#D1FAE5' : '#1B5E20'}]}>
                  {currentQuestion.explanation || currentQuestion.solution}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.feedbackButton, {backgroundColor: isCorrect ? colors.primary : '#EF4444'}]}
                onPress={() => {
                  if (isCorrect) {
                    maybeShowAdAfterCompletion();
                    moveToNextLevel();
                  } else {
                    resetCardState();
                  }
                }}>
                <Text style={styles.feedbackButtonText}>
                  {isCorrect
                    ? currentQuestionIndex + 1 < questions.length
                      ? copy.nextLevel
                      : copy.backLevels
                    : copy.retry}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {showResult && isCorrect ? (
        <View style={styles.bannerWrap}>
          <BannerAd
            unitId={__DEV__ ? TestIds.ADAPTIVE_BANNER : 'ca-app-pub-2627956667785383/2550120291'}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTitle: {
    fontSize: wp('5.5%'),
    fontWeight: '800',
    color: '#FFF',
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  subHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    opacity: 0.8,
  },
  content: {
    padding: 16,
    flexGrow: 1,
    justifyContent: 'center',
  },
  quizCenterWrap: {maxWidth: 760, width: '100%', alignSelf: 'center'},
  questionCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    marginBottom: 12,
  },
  levelPill: {fontWeight: '800', marginBottom: 8},
  questionText: {
    fontSize: wp('4.7%'),
    lineHeight: 28,
    fontWeight: '700',
  },
  iconRow: {flexDirection: 'row', gap: 10, marginBottom: 10},
  iconChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconChipText: {fontWeight: '700'},
  option: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 15,
    marginBottom: 10,
  },
  optionText: {fontWeight: '700', fontSize: 15, lineHeight: 21},
  infoCard: {padding: 14, borderRadius: 16, marginBottom: 10},
  infoTitle: {fontWeight: '800', marginBottom: 5},
  infoBody: {fontSize: 14, lineHeight: 20},
  feedbackCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    marginTop: 6,
  },
  feedbackTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  feedbackAnimation: {
    width: 84,
    height: 84,
  },
  feedbackTextWrap: {
    flex: 1,
    marginLeft: 8,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  feedbackSubtitle: {
    marginTop: 4,
    lineHeight: 19,
  },
  correctLine: {
    fontWeight: '700',
    marginBottom: 10,
  },
  explanationWrap: {
    borderRadius: 18,
    padding: 14,
  },
  feedbackButton: {
    marginTop: 14,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  feedbackButtonText: {
    color: '#FFF',
    fontWeight: '800',
  },
  bannerWrap: {
    alignItems: 'center',
    paddingBottom: 6,
  },
});

export default PracticeQuizScreen;
