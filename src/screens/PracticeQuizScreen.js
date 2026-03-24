import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const interstitial = InterstitialAd.createForAdRequest(
  __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-2627956667785383/2550120291',
);

const PracticeQuizScreen = ({route, navigation}) => {
  const insets = useSafeAreaInsets();
  const {t, i18n} = useTranslation();
  const {colors, isDark} = useAppTheme();
  const {category, levelIndex} = route.params;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(levelIndex);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [isInterstitialLoaded, setIsInterstitialLoaded] = useState(false);
  const [progressState, setProgressState] = useState({unlockedLevel: 1, completed: []});
  const [levelCompleteVisible, setLevelCompleteVisible] = useState(false);
  const [wrongAnswerVisible, setWrongAnswerVisible] = useState(false);

  const questions = useMemo(() => {
    const langData = allQuestions[i18n.language] || allQuestions.en;
    return langData[category] || [];
  }, [i18n.language, category]);

  const currentQuestion = questions[currentQuestionIndex];

  const progressKey = `practice.progress.${i18n.language}.${category}`;

  useEffect(() => {
    const setup = async () => {
      const saved = await AsyncStorage.getItem(progressKey);
      if (saved) {
        try {
          setProgressState(JSON.parse(saved));
        } catch (_e) {
          setProgressState({unlockedLevel: 1, completed: []});
        }
      } else {
        // Reset to default for new category/level
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

  const maybeShowAdAfter5 = async () => {
    const key = 'ads.practiceAnsweredCount';
    const current = Number((await AsyncStorage.getItem(key)) || '0') + 1;
    await AsyncStorage.setItem(key, String(current));
    if (current % 5 === 0 && isInterstitialLoaded) {
      interstitial.show();
    }
  };

  const persistProgress = async nextState => {
    setProgressState(nextState);
    await AsyncStorage.setItem(progressKey, JSON.stringify(nextState));
  };

  const handleOptionSelect = async optionIndex => {
    if (!currentQuestion || showResult) return;
    setSelectedOption(optionIndex);
    setShowResult(true);
    const isCorrect = optionIndex === (Number(currentQuestion.ans) - 1);
    if (isCorrect) {
      playSound('correct');
      // Show modal immediately for better UX
      setLevelCompleteVisible(true);
      
      const level = currentQuestionIndex + 1;
      const completed = Array.from(new Set([...progressState.completed, level])).sort(
        (a, b) => a - b,
      );
      const unlockedLevel = Math.max(progressState.unlockedLevel, level + 1);
      await persistProgress({unlockedLevel, completed});
    } else {
      playSound('wrong');
      setWrongAnswerVisible(true);
    }
    await maybeShowAdAfter5();
  };

  const goToGrid = () => {
    navigation.goBack();
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
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]} edges={['left', 'right', 'bottom']}>
      <View style={[styles.header, {backgroundColor: colors.primary, paddingTop: insets.top + 10}]}>
        <TouchableOpacity onPress={goToGrid}>
          <Icon name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category} Practice</Text>
        <View style={{width: 22}} />
      </View>

      <View style={styles.subHeader}>
         <Icon name="school-outline" size={16} color={colors.subtext} />
         <Text style={[styles.subHeaderText, {color: colors.subtext}]}>Currently Playing: {category} Mode</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
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
              style={[
                styles.iconChip,
                {backgroundColor: colors.card, borderColor: colors.border},
              ]}>
              <Icon
                name="bulb-outline"
                size={18}
                color={showHint ? '#F59E0B' : colors.primary}
              />
              <Text style={[styles.iconChipText, {color: colors.text}]}>Hint</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowSolution(v => !v)}
              style={[
                styles.iconChip,
                {backgroundColor: colors.card, borderColor: colors.border},
              ]}>
              <Icon
                name="book-outline"
                size={18}
                color={showSolution ? '#6366F1' : colors.primary}
              />
              <Text style={[styles.iconChipText, {color: colors.text}]}>Solution</Text>
            </TouchableOpacity>
          </View>

          {showHint && (
            <View
              style={[
                styles.infoCard,
                {backgroundColor: isDark ? '#3D341F' : '#FFF9C4'},
              ]}>
              <Text style={styles.infoTitle}>Hint</Text>
              <Text style={[styles.infoBody, {color: isDark ? '#FDE68A' : '#7F6000'}]}>
                {currentQuestion.hint}
              </Text>
            </View>
          )}

          {currentQuestion.options.map((opt, idx) => {
            const isCorrect = showResult && idx === (Number(currentQuestion.ans) - 1);
            const isWrong =
              showResult && idx === selectedOption && idx !== (Number(currentQuestion.ans) - 1);
            return (
              <TouchableOpacity
                key={`${currentQuestion.id}-${idx}`}
                style={[
                  styles.option,
                  {backgroundColor: colors.card, borderColor: colors.border},
                  isCorrect && {
                    backgroundColor: isDark ? '#1F5131' : '#DCFCE7',
                    borderColor: '#22C55E',
                  },
                  isWrong && {
                    backgroundColor: isDark ? '#5A2633' : '#FEE2E2',
                    borderColor: '#EF4444',
                  },
                ]}
                onPress={() => handleOptionSelect(idx)}
                disabled={showResult}>
                <Text style={[styles.optionText, {color: colors.text}]}>{opt}</Text>
              </TouchableOpacity>
            );
          })}

          {(showResult || showSolution) && (
            <View
              style={[
                styles.infoCard,
                {backgroundColor: isDark ? '#1E3A30' : '#E8F5E9'},
              ]}>
              <Text style={[styles.infoTitle, {color: '#2E7D32'}]}>
                {t('explanation')}
              </Text>
              <Text style={[styles.infoBody, {color: isDark ? '#D1FAE5' : '#1B5E20'}]}>
                {currentQuestion.explanation || currentQuestion.solution}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.bannerWrap}>
        <BannerAd
          unitId={__DEV__ ? TestIds.ADAPTIVE_BANNER : 'ca-app-pub-2627956667785383/2550120291'}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        />
      </View>

      <Modal
        transparent
        animationType="fade"
        visible={levelCompleteVisible}
        onRequestClose={() => setLevelCompleteVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, {backgroundColor: colors.card}]}>
            <Icon name="trophy-outline" size={36} color="#F59E0B" />
            <Text style={[styles.modalTitle, {color: colors.text}]}>Great Job!</Text>
            <Text style={[styles.modalText, {color: colors.subtext}]}>
              Keep going, you are doing amazing.
            </Text>
            <TouchableOpacity
              style={[styles.modalBtn, {backgroundColor: colors.primary}]}
              onPress={() => {
                setLevelCompleteVisible(false);
                const nextLevelIndex = currentQuestionIndex + 1;
                if (nextLevelIndex < questions.length) {
                  setCurrentQuestionIndex(nextLevelIndex);
                  setSelectedOption(null);
                  setShowResult(false);
                  setShowHint(false);
                  setShowSolution(false);
                } else {
                  goToGrid();
                }
              }}>
              <Text style={styles.modalBtnText}>
                {currentQuestionIndex + 1 < questions.length
                  ? `${t('next')} Level`
                  : 'Back to Levels'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        animationType="fade"
        visible={wrongAnswerVisible}
        onRequestClose={() => setWrongAnswerVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.wrongModalCard, {backgroundColor: colors.card}]}>
            <Icon name="alert-circle-outline" size={36} color="#EF4444" />
            <Text style={[styles.modalTitle, {color: colors.text}]}>Try Again</Text>
            <Text style={[styles.modalText, {color: colors.subtext}]}>
              Wrong answer. Read the hint and attempt this level once more.
            </Text>
            <TouchableOpacity
              style={[styles.modalBtn, {backgroundColor: '#EF4444'}]}
              onPress={() => {
                setWrongAnswerVisible(false);
                setSelectedOption(null);
                setShowResult(false);
                setShowSolution(false);
              }}>
              <Text style={styles.modalBtnText}>Retry Level</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#0074E4',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: wp('5.5%'),
    fontWeight: 'bold',
    color: '#FFF',
  },
  content: {padding: 16, paddingBottom: 100, flexGrow: 1, justifyContent: 'center'},
  quizCenterWrap: {maxWidth: 760, width: '100%', alignSelf: 'center'},
  questionCard: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    marginBottom: 12,
  },
  questionText: {
    fontSize: wp('4.7%'),
    lineHeight: 26,
    fontWeight: '600',
  },
  levelPill: {fontWeight: '800', marginBottom: 8},
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
  iconChipText: {fontWeight: '600'},
  option: {borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 10},
  optionText: {fontWeight: '600', fontSize: 15},
  infoCard: {padding: 14, borderRadius: 12, marginBottom: 10},
  infoTitle: {fontWeight: '800', marginBottom: 5},
  infoBody: {fontSize: 14, lineHeight: 20},
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
  bannerWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 8,
  },
  modalText: {
    marginTop: 6,
    lineHeight: 20,
    textAlign: 'center',
  },
  modalBtn: {
    marginTop: 14,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  modalBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  wrongModalCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
});

export default PracticeQuizScreen;
