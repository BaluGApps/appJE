import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import revisionData from '../data/revisionData';
import {useAppTheme} from '../util/theme';

const DAILY_GOAL = 50;
const SESSION_SIZE = 12;

const COPY = {
  en: {
    smartTitle: 'Smart Revision Lab',
    smartSubtitle: 'Flash sessions for new facts, weak areas and mastered facts.',
    newLabel: 'New',
    rescueLabel: 'Rescue',
    sprintLabel: 'Sprint',
    masteredLabel: 'Mastered',
    streak: 'Streak',
    today: 'Today',
    reveal: 'Reveal answer',
    needWork: 'Revise again',
    mastered: 'Mark mastered',
    next: 'Next card',
    empty: 'No cards available for this mode right now.',
    reset: 'Reset Progress?',
    resetBody: 'This clears revision progress for the current language.',
    rescueHint: 'Rescue mode focuses on viewed cards that are not yet mastered.',
  },
  hi: {
    smartTitle: 'स्मार्ट रिवीजन लैब',
    smartSubtitle: 'नए फैक्ट्स, कमजोर हिस्सों और mastered cards के लिए फ्लैश सेशन।',
    newLabel: 'नया',
    rescueLabel: 'रिस्क्यू',
    sprintLabel: 'स्प्रिंट',
    masteredLabel: 'मास्टर',
    streak: 'स्ट्रीक',
    today: 'आज',
    reveal: 'उत्तर दिखाएं',
    needWork: 'फिर से दोहराएं',
    mastered: 'मास्टर चिह्नित करें',
    next: 'अगला कार्ड',
    empty: 'इस मोड के लिए अभी कोई कार्ड उपलब्ध नहीं है।',
    reset: 'प्रगति रीसेट करें?',
    resetBody: 'यह वर्तमान भाषा की रिवीजन प्रगति साफ कर देगा।',
    rescueHint: 'रिस्क्यू मोड उन कार्ड्स पर फोकस करता है जिन्हें देखा गया है लेकिन mastered नहीं किया गया है।',
  },
  kn: {
    smartTitle: 'ಸ್ಮಾರ್ಟ್ ರಿವಿಷನ್ ಲ್ಯಾಬ್',
    smartSubtitle: 'ಹೊಸ ವಿಷಯಗಳು, ದುರ್ಬಲ ಭಾಗಗಳು ಮತ್ತು mastered ಕಾರ್ಡ್‌ಗಳಿಗೆ ಫ್ಲ್ಯಾಶ್ ಸೆಷನ್‌ಗಳು.',
    newLabel: 'ಹೊಸದು',
    rescueLabel: 'ರೆಸ್ಕ್ಯೂ',
    sprintLabel: 'ಸ್ಪ್ರಿಂಟ್',
    masteredLabel: 'ಮಾಸ್ಟರ್ಡ್',
    streak: 'ಸ್ಟ್ರೀಕ್',
    today: 'ಇಂದು',
    reveal: 'ಉತ್ತರ ತೋರಿಸಿ',
    needWork: 'ಮತ್ತೆ ಓದಿ',
    mastered: 'ಮಾಸ್ಟರ್ಡ್ ಗುರುತಿಸಿ',
    next: 'ಮುಂದಿನ ಕಾರ್ಡ್',
    empty: 'ಈ ಮೋಡ್‌ಗೆ ಈಗ ಕಾರ್ಡ್‌ಗಳು ಲಭ್ಯವಿಲ್ಲ.',
    reset: 'ಪ್ರಗತಿಯನ್ನು ಮರುಹೊಂದಿಸಬೇಕೆ?',
    resetBody: 'ಇದು ಪ್ರಸ್ತುತ ಭಾಷೆಯ ರಿವಿಷನ್ ಪ್ರಗತಿಯನ್ನು ಕ್ಲಿಯರ್ ಮಾಡುತ್ತದೆ.',
    rescueHint: 'ರೆಸ್ಕ್ಯೂ ಮೋಡ್ ನೋಡಿದರೂ mastered ಆಗದ ಕಾರ್ಡ್‌ಗಳ ಮೇಲೆ ಕೇಂದ್ರೀಕರಿಸುತ್ತದೆ.',
  },
};

const shuffle = items => {
  const cloned = [...items];
  for (let index = cloned.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [cloned[index], cloned[randomIndex]] = [cloned[randomIndex], cloned[index]];
  }
  return cloned;
};

const RevisionScreen = () => {
  const {i18n} = useTranslation();
  const {colors} = useAppTheme();
  const copy = COPY[i18n.language] || COPY.en;

  const [viewedQuestions, setViewedQuestions] = useState(new Set());
  const [masteredQuestions, setMasteredQuestions] = useState(new Set());
  const [todayCount, setTodayCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [mode, setMode] = useState('new');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [sessionSeed, setSessionSeed] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const allData = useMemo(() => {
    const languageData = revisionData[i18n.language] || revisionData.en || [];
    return Array.isArray(languageData) ? languageData : [];
  }, [i18n.language]);

  useEffect(() => {
    loadProgress();
  }, [i18n.language]);

  const loadProgress = async () => {
    try {
      setIsLoading(true);
      const language = i18n.language;
      const viewedData = await AsyncStorage.getItem(`revision_viewed_${language}`);
      const masteredData = await AsyncStorage.getItem(`revision_mastered_${language}`);
      const streakData = await AsyncStorage.getItem(`revision_streak_${language}`);
      const bestData = await AsyncStorage.getItem(`revision_best_streak_${language}`);
      const countData = await AsyncStorage.getItem(`revision_today_count_${language}`);
      const lastDateData = await AsyncStorage.getItem(`revision_last_date_${language}`);

      const today = new Date().toDateString();

      setViewedQuestions(new Set(viewedData ? JSON.parse(viewedData) : []));
      setMasteredQuestions(new Set(masteredData ? JSON.parse(masteredData) : []));
      setStreak(Number(streakData || 0));
      setBestStreak(Number(bestData || 0));

      if (lastDateData === today) {
        setTodayCount(Number(countData || 0));
      } else {
        setTodayCount(0);
        await AsyncStorage.setItem(`revision_last_date_${language}`, today);
        await AsyncStorage.setItem(`revision_today_count_${language}`, '0');
      }
    } catch (error) {
      console.log('Error loading revision progress:', error);
    } finally {
      setIsLoading(false);
      setCurrentIndex(0);
      setRevealed(false);
      setSessionSeed(previous => previous + 1);
    }
  };

  const persistSets = async (nextViewed, nextMastered) => {
    const language = i18n.language;
    await AsyncStorage.setItem(`revision_viewed_${language}`, JSON.stringify([...nextViewed]));
    await AsyncStorage.setItem(`revision_mastered_${language}`, JSON.stringify([...nextMastered]));
  };

  const modeData = useMemo(() => {
    const rescueCards = allData.filter(
      item => viewedQuestions.has(item.id) && !masteredQuestions.has(item.id),
    );
    const newCards = allData.filter(
      item => !viewedQuestions.has(item.id) && !masteredQuestions.has(item.id),
    );
    const masteredCards = allData.filter(item => masteredQuestions.has(item.id));

    if (mode === 'rescue') {
      return rescueCards;
    }
    if (mode === 'sprint') {
      return shuffle([...newCards, ...rescueCards]).slice(0, SESSION_SIZE);
    }
    if (mode === 'mastered') {
      return masteredCards;
    }
    return newCards.length > 0 ? newCards : rescueCards;
  }, [allData, masteredQuestions, mode, viewedQuestions, sessionSeed]);

  const sessionCards = useMemo(() => {
    if (mode === 'sprint') {
      return modeData;
    }
    return modeData.slice(0, SESSION_SIZE);
  }, [mode, modeData]);

  const currentCard = sessionCards[currentIndex] || null;
  const progressPercent = allData.length
    ? Math.round((masteredQuestions.size / allData.length) * 100)
    : 0;

  const updateDailyCount = async delta => {
    const nextToday = todayCount + delta;
    setTodayCount(nextToday);
    await AsyncStorage.setItem(`revision_today_count_${i18n.language}`, String(nextToday));
    await AsyncStorage.setItem(
      `revision_last_date_${i18n.language}`,
      new Date().toDateString(),
    );

    if (nextToday === DAILY_GOAL) {
      Alert.alert('Goal achieved', `${DAILY_GOAL} revision cards completed today.`);
    }
  };

  const updateMasteryStreak = async delta => {
    const nextStreak = Math.max(0, streak + delta);
    const nextBest = Math.max(bestStreak, nextStreak);
    setStreak(nextStreak);
    setBestStreak(nextBest);
    await AsyncStorage.setItem(`revision_streak_${i18n.language}`, String(nextStreak));
    await AsyncStorage.setItem(
      `revision_best_streak_${i18n.language}`,
      String(nextBest),
    );
  };

  const updateDailyProgress = async () => {
    await updateDailyCount(1);
  };

  const moveNext = () => {
    setRevealed(false);
    setCurrentIndex(previous =>
      previous + 1 < sessionCards.length ? previous + 1 : 0,
    );
  };

  const markNeedWork = async () => {
    if (!currentCard) {
      return;
    }

    const nextViewed = new Set(viewedQuestions);
    nextViewed.add(currentCard.id);
    setViewedQuestions(nextViewed);
    await persistSets(nextViewed, masteredQuestions);
    await updateDailyProgress();
    await updateMasteryStreak(-streak);
    moveNext();
  };

  const markMastered = async () => {
    if (!currentCard) {
      return;
    }

    const nextViewed = new Set(viewedQuestions);
    const nextMastered = new Set(masteredQuestions);
    nextViewed.delete(currentCard.id);
    nextMastered.add(currentCard.id);
    setViewedQuestions(nextViewed);
    setMasteredQuestions(nextMastered);
    await persistSets(nextViewed, nextMastered);
    await updateDailyProgress();
    await updateMasteryStreak(1);
    setSessionSeed(previous => previous + 1);
    moveNext();
  };

  const resetProgress = () => {
    Alert.alert(copy.reset, copy.resetBody, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          const language = i18n.language;
          await AsyncStorage.multiRemove([
            `revision_viewed_${language}`,
            `revision_mastered_${language}`,
            `revision_today_count_${language}`,
            `revision_last_date_${language}`,
            `revision_streak_${language}`,
            `revision_best_streak_${language}`,
          ]);
          setViewedQuestions(new Set());
          setMasteredQuestions(new Set());
          setTodayCount(0);
          setStreak(0);
          setBestStreak(0);
          setCurrentIndex(0);
          setRevealed(false);
          setSessionSeed(previous => previous + 1);
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loaderText, {color: colors.text}]}>Loading revision lab...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={[styles.header, {backgroundColor: colors.primary}]}>
        <View style={{flex: 1}}>
          <Text style={styles.headerTitle}>{copy.smartTitle}</Text>
          <Text style={styles.headerSubtitle}>{copy.smartSubtitle}</Text>
        </View>
        <TouchableOpacity onPress={resetProgress} style={styles.resetButton}>
          <Icon name="refresh" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, {backgroundColor: colors.card}]}>
            <Text style={[styles.statLabel, {color: colors.subtext}]}>{copy.today}</Text>
            <Text style={[styles.statValue, {color: colors.text}]}>{todayCount}</Text>
          </View>
          <View style={[styles.statCard, {backgroundColor: colors.card}]}>
            <Text style={[styles.statLabel, {color: colors.subtext}]}>{copy.streak}</Text>
            <Text style={[styles.statValue, {color: colors.text}]}>{streak}</Text>
          </View>
          <View style={[styles.statCard, {backgroundColor: colors.card}]}>
            <Text style={[styles.statLabel, {color: colors.subtext}]}>Best</Text>
            <Text style={[styles.statValue, {color: colors.text}]}>{bestStreak}</Text>
          </View>
        </View>

        <View style={[styles.progressCard, {backgroundColor: colors.card}]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, {color: colors.text}]}>
              {masteredQuestions.size}/{allData.length} mastered
            </Text>
            <Text style={[styles.progressPercent, {color: colors.primary}]}>
              {progressPercent}%
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {width: `${progressPercent}%`, backgroundColor: colors.primary},
              ]}
            />
          </View>
          <Text style={[styles.progressHint, {color: colors.subtext}]}>
            {copy.rescueHint}
          </Text>
        </View>

        <View style={styles.modeRow}>
          {[
            {id: 'new', label: copy.newLabel, icon: 'sparkles-outline'},
            {id: 'rescue', label: copy.rescueLabel, icon: 'fitness-outline'},
            {id: 'sprint', label: copy.sprintLabel, icon: 'flash-outline'},
            {id: 'mastered', label: copy.masteredLabel, icon: 'trophy-outline'},
          ].map(item => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.modeChip,
                {
                  backgroundColor: mode === item.id ? colors.primary : colors.card,
                  borderColor: mode === item.id ? colors.primary : colors.border,
                },
              ]}
              onPress={() => {
                setMode(item.id);
                setCurrentIndex(0);
                setRevealed(false);
                setSessionSeed(previous => previous + 1);
              }}>
              <Icon
                name={item.icon}
                size={16}
                color={mode === item.id ? '#FFF' : colors.primary}
              />
              <Text
                style={[
                  styles.modeChipText,
                  {color: mode === item.id ? '#FFF' : colors.text},
                ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {currentCard ? (
          <View style={[styles.card, {backgroundColor: colors.card, borderColor: colors.border}]}>
            <View style={styles.cardTop}>
              <Text style={[styles.cardMeta, {color: colors.subtext}]}>
                {mode.toUpperCase()} • {currentIndex + 1}/{sessionCards.length}
              </Text>
              <Text style={[styles.cardMeta, {color: colors.primary}]}>#{currentCard.id}</Text>
            </View>

            <Text style={[styles.questionText, {color: colors.text}]}>{currentCard.q}</Text>

            {revealed ? (
              <View style={[styles.answerBox, {backgroundColor: `${colors.primary}12`}]}>
                <Text style={[styles.answerLabel, {color: colors.primary}]}>Answer</Text>
                <Text style={[styles.answerText, {color: colors.text}]}>{currentCard.a}</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.revealButton, {borderColor: colors.border}]}
                onPress={() => setRevealed(true)}>
                <Icon name="eye-outline" size={18} color={colors.primary} />
                <Text style={[styles.revealText, {color: colors.primary}]}>{copy.reveal}</Text>
              </TouchableOpacity>
            )}

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.secondaryAction, {backgroundColor: '#F9731620'}]}
                onPress={markNeedWork}>
                <Text style={styles.secondaryActionText}>{copy.needWork}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryAction, {backgroundColor: colors.primary}]}
                onPress={markMastered}>
                <Text style={styles.primaryActionText}>{copy.mastered}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.nextLink} onPress={moveNext}>
              <Text style={[styles.nextLinkText, {color: colors.subtext}]}>{copy.next}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.emptyCard, {backgroundColor: colors.card}]}>
            <Icon name="checkmark-done-circle" size={54} color={colors.primary} />
            <Text style={[styles.emptyText, {color: colors.text}]}>{copy.empty}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    marginTop: 12,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: '900',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.82)',
    marginTop: 4,
    lineHeight: 20,
  },
  resetButton: {
    padding: 8,
    marginLeft: 12,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 18,
    padding: 16,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  statValue: {
    marginTop: 8,
    fontSize: 25,
    fontWeight: '900',
  },
  progressCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  progressPercent: {
    fontWeight: '900',
    fontSize: 18,
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: '#DCE5F0',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  progressHint: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 19,
  },
  modeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  modeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 6,
  },
  modeChipText: {
    fontWeight: '800',
  },
  card: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardMeta: {
    fontSize: 12,
    fontWeight: '800',
  },
  questionText: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 31,
    marginBottom: 16,
  },
  revealButton: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  revealText: {
    marginLeft: 8,
    fontWeight: '800',
  },
  answerBox: {
    borderRadius: 18,
    padding: 16,
  },
  answerLabel: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 6,
  },
  answerText: {
    fontSize: 19,
    lineHeight: 28,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  secondaryAction: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryActionText: {
    color: '#C2410C',
    fontWeight: '800',
  },
  primaryAction: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryActionText: {
    color: '#FFF',
    fontWeight: '800',
  },
  nextLink: {
    alignSelf: 'center',
    marginTop: 16,
  },
  nextLinkText: {
    fontWeight: '700',
  },
  emptyCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 22,
  },
});

export default RevisionScreen;
