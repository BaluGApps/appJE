import React, {useEffect, useMemo, useState} from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/Ionicons';
import LottieView from 'lottie-react-native';
import {BannerAd, BannerAdSize, TestIds} from 'react-native-google-mobile-ads';
import {useAppTheme} from '../util/theme';
import mockTestsData from '../data/mockTestsData';
import {playSound} from '../util/sound';

const COPY = {
  en: {
    question: 'Question',
    prev: 'Prev',
    next: 'Next',
    submit: 'Submit',
    review: 'Review Solutions',
    explanation: 'Explanation',
    skipped: 'Skipped',
    score: 'Score',
    credits: 'Credits',
    completed: 'Test Completed',
    subtitle: 'Full review is unlocked below.',
    back: 'Back to tests',
    locked: 'Answer locked',
    correct: 'Correct answer',
    reviewHint: 'Read the explanation and move ahead.',
  },
  hi: {
    question: 'प्रश्न',
    prev: 'पिछला',
    next: 'अगला',
    submit: 'सबमिट',
    review: 'समाधान समीक्षा',
    explanation: 'व्याख्या',
    skipped: 'छोड़ा गया',
    score: 'स्कोर',
    credits: 'क्रेडिट्स',
    completed: 'टेस्ट पूरा हुआ',
    subtitle: 'पूरा रिव्यू नीचे उपलब्ध है।',
    back: 'टेस्ट्स पर वापस जाएं',
    locked: 'उत्तर लॉक हो गया',
    correct: 'सही उत्तर',
    reviewHint: 'व्याख्या पढ़ें और आगे बढ़ें।',
  },
  kn: {
    question: 'ಪ್ರಶ್ನೆ',
    prev: 'ಹಿಂದಿನ',
    next: 'ಮುಂದಿನ',
    submit: 'ಸಲ್ಲಿಸಿ',
    review: 'ಉತ್ತರ ಪರಿಶೀಲನೆ',
    explanation: 'ವಿವರಣೆ',
    skipped: 'ಬಿಟ್ಟಿದೆ',
    score: 'ಅಂಕ',
    credits: 'ಕ್ರೆಡಿಟ್‌ಗಳು',
    completed: 'ಪರೀಕ್ಷೆ ಪೂರ್ಣಗೊಂಡಿದೆ',
    subtitle: 'ಪೂರ್ಣ ವಿಮರ್ಶೆ ಕೆಳಗೆ ಲಭ್ಯವಿದೆ.',
    back: 'ಪರೀಕ್ಷೆಗಳಿಗೆ ಹಿಂತಿರುಗಿ',
    locked: 'ಉತ್ತರ ಲಾಕ್ ಆಯಿತು',
    correct: 'ಸರಿಯಾದ ಉತ್ತರ',
    reviewHint: 'ವಿವರಣೆಯನ್ನು ನೋಡಿ ಮುಂದೆ ಸಾಗಿರಿ.',
  },
};

const DEFAULT_DURATION_SECONDS = 20 * 60;

const MockTestScreen = ({route, navigation}) => {
  const {i18n} = useTranslation();
  const {colors} = useAppTheme();
  const insets = useSafeAreaInsets();
  const copy = COPY[i18n.language] || COPY.en;
  const testId = route.params?.testId;

  const test = useMemo(
    () => mockTestsData.getMockTestById(i18n.language, testId),
    [i18n.language, testId],
  );
  const questions = test?.questions || [];
  const durationSeconds = test?.durationSeconds || DEFAULT_DURATION_SECONDS;

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [remaining, setRemaining] = useState(durationSeconds);

  useEffect(() => {
    setRemaining(durationSeconds);
    setIndex(0);
    setAnswers({});
    setSubmitted(false);
    setSaved(false);
  }, [testId, durationSeconds]);

  useEffect(() => {
    if (submitted || questions.length === 0) {
      return undefined;
    }

    const timer = setInterval(() => {
      setRemaining(previous => {
        if (previous <= 1) {
          clearInterval(timer);
          setSubmitted(true);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [submitted, questions.length]);

  const current = questions[index];
  const currentAnswer = current ? answers[current.id] : undefined;
  const hasAnsweredCurrent = currentAnswer !== undefined;
  const isCurrentCorrect = hasAnsweredCurrent && currentAnswer === current?.ans;
  const score = questions.reduce(
    (total, question) => (answers[question.id] === question.ans ? total + 1 : total),
    0,
  );
  const mins = String(Math.floor(remaining / 60)).padStart(2, '0');
  const secs = String(remaining % 60).padStart(2, '0');

  const saveScore = async finalScore => {
    if (saved || !test) {
      return;
    }

    const user = auth().currentUser;
    if (!user) {
      return;
    }

    try {
      const accuracy = finalScore / Math.max(questions.length, 1);
      const speedFactor = 1 + remaining / Math.max(durationSeconds, 1);
      const points = Math.floor(accuracy * speedFactor * 100);

      await firestore().collection('leaderboards').add({
        userId: user.uid,
        userName: user.displayName || 'Anonymous Aspirant',
        userEmail: user.email || '',
        testId: test.id,
        testTitle: test.title,
        score: finalScore,
        totalMarks: questions.length,
        points,
        language: i18n.language,
        remainingTime: remaining,
        timestamp: firestore.FieldValue.serverTimestamp(),
      });

      await firestore()
        .collection('users')
        .doc(user.uid)
        .set(
          {
            name: user.displayName || 'Railway Aspirant',
            email: user.email || '',
            totalCredits: firestore.FieldValue.increment(points),
            lastTestAt: firestore.FieldValue.serverTimestamp(),
          },
          {merge: true},
        );

      setSaved(true);
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  useEffect(() => {
    if (submitted && !saved) {
      saveScore(score);
    }
  }, [submitted, saved, score]);

  const choose = optionIndex => {
    if (submitted || !current || hasAnsweredCurrent) {
      return;
    }

    playSound(optionIndex === current.ans ? 'correct' : 'wrong');
    setAnswers(previous => ({...previous, [current.id]: optionIndex}));
  };

  if (!test || !current) {
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
        <View style={styles.emptyState}>
          <Text style={{color: colors.text}}>Mock test unavailable.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <ScrollView contentContainerStyle={[styles.content, {paddingBottom: submitted ? 28 : 130}]}>
        {!submitted ? (
          <View style={[styles.card, styles.quizCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
            <View style={styles.headerRow}>
              <View style={{flex: 1, paddingRight: 12}}>
                <Text style={[styles.title, {color: colors.text}]}>{test.title}</Text>
                <Text style={[styles.counter, {color: colors.subtext}]}>
                  {copy.question} {index + 1} / {questions.length}
                </Text>
              </View>
              <View
                style={[
                  styles.timerBadge,
                  {backgroundColor: colors.background, borderColor: colors.border},
                ]}>
                <Icon name="time-outline" size={14} color={colors.primary} />
                <Text style={[styles.timerText, {color: colors.primary}]}>
                  {mins}:{secs}
                </Text>
              </View>
            </View>

            <Text style={[styles.question, {color: colors.text}]}>{current.q}</Text>

            {current.options.map((option, optionIndex) => {
              const selected = currentAnswer === optionIndex;
              const optionIsCorrect = hasAnsweredCurrent && optionIndex === current.ans;
              const optionIsWrong = hasAnsweredCurrent && selected && optionIndex !== current.ans;
              return (
                <TouchableOpacity
                  key={`${current.id}-${optionIndex}`}
                  style={[
                    styles.option,
                    {backgroundColor: colors.background, borderColor: colors.border},
                    selected && {borderColor: colors.primary, backgroundColor: `${colors.primary}12`},
                    optionIsCorrect && {
                      backgroundColor: '#DCFCE7',
                      borderColor: '#22C55E',
                    },
                    optionIsWrong && {
                      backgroundColor: '#FEE2E2',
                      borderColor: '#EF4444',
                    },
                  ]}
                  onPress={() => choose(optionIndex)}>
                  <Text style={[styles.optionText, {color: colors.text}]}>{option}</Text>
                </TouchableOpacity>
              );
            })}

            {hasAnsweredCurrent ? (
              <View style={[styles.feedbackCard, {backgroundColor: colors.background, borderColor: colors.border}]}>
                <View style={styles.feedbackHead}>
                  <LottieView
                    autoPlay
                    loop={false}
                    style={styles.feedbackAnimation}
                    source={
                      isCurrentCorrect
                        ? require('../util/right.json')
                        : require('../util/wrong.json')
                    }
                  />
                  <View style={styles.feedbackCopy}>
                    <Text
                      style={[
                        styles.feedbackTitle,
                        {color: isCurrentCorrect ? '#22C55E' : '#EF4444'},
                      ]}>
                      {isCurrentCorrect ? copy.correct : copy.locked}
                    </Text>
                    <Text style={[styles.feedbackHint, {color: colors.subtext}]}>
                      {copy.reviewHint}
                    </Text>
                  </View>
                </View>

                {!isCurrentCorrect ? (
                  <Text style={[styles.correctAnswer, {color: colors.text}]}>
                    {copy.correct}: {current.options[current.ans]}
                  </Text>
                ) : null}

                <View style={[styles.explainBox, {backgroundColor: colors.card}]}>
                  <Text style={[styles.explainLabel, {color: colors.primary}]}>
                    {copy.explanation}
                  </Text>
                  <Text style={[styles.explainBody, {color: colors.text}]}>
                    {current.explanation}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>
        ) : (
          <View
            style={[
              styles.card,
              styles.resultCard,
              {backgroundColor: colors.card, borderLeftColor: colors.primary, borderLeftWidth: 5},
            ]}>
            <View style={styles.resultsHeader}>
              <Icon name="checkmark-circle" size={48} color="#22C55E" />
              <View style={{flex: 1}}>
                <Text style={[styles.title, {color: colors.text}]}>{copy.completed}</Text>
                <Text style={[styles.subtitle, {color: colors.subtext}]}>{copy.subtitle}</Text>
              </View>
            </View>

            <View style={styles.scoreBanner}>
              <View style={[styles.scoreBox, {backgroundColor: colors.background}]}>
                <Text style={[styles.scoreVal, {color: colors.text}]}>
                  {score}/{questions.length}
                </Text>
                <Text style={[styles.scoreLab, {color: colors.subtext}]}>{copy.score}</Text>
              </View>
              <View style={[styles.scoreBox, {backgroundColor: colors.background}]}>
                <Text style={[styles.scoreVal, {color: colors.primary}]}>
                  +
                  {Math.floor(
                    (score / Math.max(questions.length, 1)) *
                      (1 + remaining / Math.max(durationSeconds, 1)) *
                      100,
                  )}
                </Text>
                <Text style={[styles.scoreLab, {color: colors.subtext}]}>{copy.credits}</Text>
              </View>
            </View>

            <Text style={[styles.reviewTitle, {color: colors.text}]}>{copy.review}</Text>
            <View style={styles.resultBannerWrap}>
              <BannerAd
                unitId={__DEV__ ? TestIds.ADAPTIVE_BANNER : 'ca-app-pub-2627956667785383/2550120291'}
                size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
              />
            </View>
            {questions.map((question, questionIndex) => {
              const selectedIdx = answers[question.id];
              const isCorrect = selectedIdx === question.ans;
              return (
                <View
                  key={question.id}
                  style={[
                    styles.solutionItem,
                    {backgroundColor: colors.background, borderColor: colors.border},
                    {borderLeftWidth: 4, borderLeftColor: isCorrect ? '#22C55E' : '#EF4444'},
                  ]}>
                  <Text style={[styles.solutionQ, {color: colors.text}]}>
                    {questionIndex + 1}. {question.q}
                  </Text>
                  <Text style={{color: isCorrect ? '#22C55E' : '#EF4444', fontWeight: '700'}}>
                    {selectedIdx !== undefined
                      ? `${copy.question}: ${question.options[selectedIdx]}`
                      : `${copy.question}: ${copy.skipped}`}
                  </Text>
                  {!isCorrect ? (
                    <Text style={{color: '#22C55E', fontWeight: '700', marginTop: 6}}>
                      Correct: {question.options[question.ans]}
                    </Text>
                  ) : null}
                  <View style={styles.explWrap}>
                    <Text style={[styles.explTitle, {color: colors.primary}]}>
                      {copy.explanation}
                    </Text>
                    <Text style={[styles.explBody, {color: colors.text}]}>
                      {question.explanation}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {submitted ? (
          <TouchableOpacity
            style={[styles.btn, styles.backButton, {backgroundColor: colors.primary}]}
            onPress={() => navigation.goBack()}>
            <Text style={styles.btnText}>{copy.back}</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>

      {!submitted ? (
        <View
          style={[
            styles.bottomBar,
            {
              backgroundColor: colors.card,
              borderTopColor: colors.border,
              paddingBottom: Math.max(insets.bottom, 12),
            },
          ]}>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.btn, styles.secondaryBtn]}
              onPress={() => setIndex(currentIndex => Math.max(currentIndex - 1, 0))}>
              <Text style={styles.btnText}>{copy.prev}</Text>
            </TouchableOpacity>
            {index < questions.length - 1 ? (
              <TouchableOpacity
                style={[styles.btn, {backgroundColor: colors.primary}]}
                onPress={() =>
                  setIndex(currentIndex => Math.min(currentIndex + 1, questions.length - 1))
                }
                disabled={!hasAnsweredCurrent}>
                <Text style={styles.btnText}>{copy.next}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.btn, {backgroundColor: colors.primary}]}
                onPress={async () => {
                  setSubmitted(true);
                  await saveScore(score);
                }}
                disabled={!hasAnsweredCurrent}>
                <Text style={styles.btnText}>{copy.submit}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderRadius: 20,
    padding: 16,
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
  },
  quizCard: {
    borderWidth: 1,
    minHeight: 420,
    justifyContent: 'center',
  },
  resultCard: {
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
  },
  counter: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '600',
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  timerText: {
    marginLeft: 6,
    fontWeight: '800',
  },
  question: {
    fontSize: 19,
    lineHeight: 28,
    fontWeight: '700',
    marginBottom: 16,
  },
  option: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  optionText: {
    fontSize: 15,
    lineHeight: 21,
  },
  feedbackCard: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
  },
  feedbackHead: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedbackAnimation: {
    width: 78,
    height: 78,
  },
  feedbackCopy: {
    flex: 1,
    marginLeft: 8,
  },
  feedbackTitle: {
    fontSize: 17,
    fontWeight: '900',
  },
  feedbackHint: {
    marginTop: 4,
    lineHeight: 19,
  },
  correctAnswer: {
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 10,
  },
  explainBox: {
    borderRadius: 16,
    padding: 12,
    marginTop: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  btn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryBtn: {
    backgroundColor: '#CBD5E1',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
  backButton: {
    alignSelf: 'center',
    marginTop: 10,
    maxWidth: 360,
  },
  btnText: {
    color: '#FFF',
    fontWeight: '800',
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
  },
  scoreBanner: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  scoreBox: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  scoreVal: {
    fontSize: 24,
    fontWeight: '900',
  },
  scoreLab: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '700',
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 12,
  },
  resultBannerWrap: {
    alignItems: 'center',
    marginBottom: 14,
  },
  solutionItem: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  solutionQ: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  explWrap: {
    marginTop: 10,
  },
  explTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  explBody: {
    fontSize: 14,
    lineHeight: 21,
  },
});

export default MockTestScreen;
