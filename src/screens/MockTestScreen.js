import React, {useEffect, useMemo, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import mockTestsData from '../data/mockTestsData';
import {useAppTheme} from '../util/theme';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/Ionicons';

const TEST_DURATION_SECONDS = 10 * 60;

const MockTestScreen = ({route, navigation}) => {
  const {i18n} = useTranslation();
  const {colors} = useAppTheme();
  const category = route.params?.category || 'General';
  const questions = useMemo(
    () => (mockTestsData[i18n.language] || mockTestsData.en).slice(0, 10),
    [i18n.language],
  );
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [remaining, setRemaining] = useState(TEST_DURATION_SECONDS);

  useEffect(() => {
    if (submitted) return;
    const timer = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [submitted]);
  const saveScore = async finalScore => {
    if (saved) return;
    const user = auth().currentUser;
    if (!user) return;
    try {
      // New Points Formula: Accuracy * (1 + RemainingTime/TotalTime) * 100
      const accuracy = finalScore / questions.length;
      const speedFactor = 1 + (remaining / TEST_DURATION_SECONDS);
      const points = Math.floor(accuracy * speedFactor * 100);

      await firestore().collection('leaderboards').add({
        userId: user.uid,
        userName: user.displayName || 'Anonymous Aspirant',
        userEmail: user.email || '',
        testId: `mock-${category}-${i18n.language}`,
        testTitle: `RRB ${category} (${i18n.language})`,
        score: finalScore,
        totalMarks: questions.length,
        points: points,
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
    } catch (e) {
      console.error('Error saving score:', e);
    }
  };

  const current = questions[index];
  const score = questions.reduce((acc, q) => (answers[q.id] === q.ans ? acc + 1 : acc), 0);
  const mins = String(Math.floor(remaining / 60)).padStart(2, '0');
  const secs = String(remaining % 60).padStart(2, '0');

  if (!current) {
    return null;
  }

  const choose = optionIndex => {
    if (submitted) return;
    setAnswers(prev => ({...prev, [current.id]: optionIndex}));
  };

  useEffect(() => {
    if (submitted && !saved) {
      saveScore(score);
    }
  }, [submitted, saved, score]);

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          !submitted && {flexGrow: 1, justifyContent: 'center'},
        ]}>
        {!submitted ? (
        <View style={[styles.card, {backgroundColor: colors.card}]}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, {color: colors.text}]}>RRB {category} Mock</Text>
            <View style={[styles.timerBadge, {backgroundColor: colors.background, borderColor: colors.border}]}>
              <Icon name="time-outline" size={14} color={colors.primary} />
              <Text style={[styles.timerText, {color: colors.primary}]}>
                {mins}:{secs}
              </Text>
            </View>
          </View>
          <Text style={[styles.counter, {color: colors.subtext}]}>
            Question {index + 1} / {questions.length}
          </Text>
          <Text style={[styles.question, {color: colors.text}]}>{current.q}</Text>
          {current.options.map((opt, idx) => {
            const selected = answers[current.id] === idx;
            const correct = current.ans === idx;
            const showCorrect = submitted && correct;
            const showWrong = submitted && selected && !correct;
            return (
              <TouchableOpacity
                key={`${current.id}-${idx}`}
                onPress={() => choose(idx)}
                style={[
                  styles.option,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                  },
                  selected && {borderColor: colors.primary},
                  showCorrect && {backgroundColor: '#214A2A', borderColor: '#22C55E'},
                  showWrong && {backgroundColor: '#4D1F2A', borderColor: '#EF4444'},
                ]}>
                <Text style={{color: colors.text}}>{opt}</Text>
              </TouchableOpacity>
            );
          })}

          {submitted && (
            <View style={[styles.explain, {backgroundColor: colors.background, borderColor: colors.border}]}>
              <Text style={[styles.explainLabel, {color: colors.primary}]}>Explanation</Text>
              <Text style={{color: colors.text}}>{current.explanation}</Text>
            </View>
          )}
        </View>
        ) : (
          <View style={[styles.card, {backgroundColor: colors.card, borderLeftWidth: 5, borderLeftColor: colors.primary}]}>
            <View style={styles.resultsHeader}>
              <Icon name="checkmark-circle" size={48} color="#22C55E" />
              <View>
                <Text style={[styles.title, {color: colors.text}]}>Test Completed</Text>
                <Text style={[styles.subtitle, {color: colors.subtext}]}>Great effort on your RRB {category} prep!</Text>
              </View>
            </View>

            <View style={styles.scoreBanner}>
              <View style={styles.scoreBox}>
                <Text style={[styles.scoreVal, {color: colors.text}]}>{score}/{questions.length}</Text>
                <Text style={[styles.scoreLab, {color: colors.subtext}]}>Score</Text>
              </View>
              <View style={styles.scoreBox}>
                <Text style={[styles.scoreVal, {color: colors.primary}]}>+{Math.floor((score / questions.length) * (1 + remaining / TEST_DURATION_SECONDS) * 100)}</Text>
                <Text style={[styles.scoreLab, {color: colors.subtext}]}>Credits</Text>
              </View>
            </View>

            <Text style={[styles.reviewTitle, {color: colors.text}]}>Review Solutions</Text>
            {questions.map((q, i) => {
              const selectedIdx = answers[q.id];
              const isCorrect = selectedIdx === q.ans;
              return (
                <View
                  key={q.id}
                  style={[
                    styles.solutionItem,
                    {backgroundColor: colors.background, borderColor: colors.border},
                    isCorrect ? {borderLeftColor: '#22C55E', borderLeftWidth: 4} : {borderLeftColor: '#EF4444', borderLeftWidth: 4}
                  ]}>
                  <Text style={[styles.solutionQ, {color: colors.text}]}>
                    {i + 1}. {q.q}
                  </Text>
                  
                  <View style={styles.solRow}>
                    <Icon name={isCorrect ? "checkmark-circle" : "close-circle"} size={16} color={isCorrect ? '#22C55E' : '#EF4444'} />
                    <Text style={{color: isCorrect ? '#22C55E' : '#EF4444', fontWeight: '700', marginLeft: 6}}>
                      Your: {selectedIdx !== undefined ? q.options[selectedIdx] : 'Skipped'}
                    </Text>
                  </View>

                  {!isCorrect && (
                    <View style={styles.solRow}>
                      <Icon name="star" size={16} color="#22C55E" />
                      <Text style={{color: '#22C55E', fontWeight: '700', marginLeft: 6}}>
                        Correct: {q.options[q.ans]}
                      </Text>
                    </View>
                  )}

                  <View style={styles.explWrap}>
                    <Text style={[styles.explTitle, {color: colors.primary}]}>Why? (Explanation)</Text>
                    <Text style={{color: colors.text, fontSize: 13}}>{q.explanation || q.solution}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {!submitted ? (
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.btn, {backgroundColor: '#CBD5E1'}]}
              onPress={() => setIndex(i => Math.max(i - 1, 0))}>
              <Text style={styles.btnText}>Prev</Text>
            </TouchableOpacity>
            {index < questions.length - 1 ? (
              <TouchableOpacity
                style={[styles.btn, {backgroundColor: colors.primary}]}
                onPress={() => setIndex(i => Math.min(i + 1, questions.length - 1))}>
                <Text style={styles.btnText}>Next</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.btn, {backgroundColor: colors.primary}]}
                onPress={async () => {
                  setSubmitted(true);
                  await saveScore(score);
                }}>
                <Text style={styles.btnText}>Submit</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.btn, {backgroundColor: colors.primary, marginTop: 10, alignSelf: 'center'}]}
            onPress={() => navigation.goBack()}>
            <Text style={styles.btnText}>Back to Leaderboard</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  content: {padding: 16, paddingBottom: 30},
  card: {borderRadius: 16, padding: 16, maxWidth: 680, width: '100%', alignSelf: 'center'},
  headerRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  title: {fontSize: 20, fontWeight: '800'},
  timerBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timerText: {fontWeight: '800', fontSize: 12},
  counter: {marginTop: 4, marginBottom: 12},
  question: {fontSize: 17, fontWeight: '700', marginBottom: 12},
  option: {borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 10},
  explain: {borderWidth: 1, borderRadius: 12, padding: 12, marginTop: 10},
  explainLabel: {fontWeight: '800', marginBottom: 6},
  row: {flexDirection: 'row', justifyContent: 'space-between', marginTop: 14},
  btn: {paddingVertical: 12, paddingHorizontal: 22, borderRadius: 12},
  btnText: {color: '#fff', fontWeight: '700'},
  resultText: {fontSize: 18, fontWeight: '800'},
  pointsText: {marginTop: 6, fontWeight: '700'},
  solutionItem: {borderWidth: 1, borderRadius: 12, padding: 12, marginTop: 10},
  solutionQ: {fontWeight: '700', marginBottom: 8, fontSize: 15},
  resultsHeader: {flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20},
  subtitle: {fontSize: 14, marginTop: 2},
  scoreBanner: {flexDirection: 'row', gap: 12, marginBottom: 20},
  scoreBox: {flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#ccc', borderStyle: 'dashed', alignItems: 'center'},
  scoreVal: {fontSize: 20, fontWeight: '900'},
  scoreLab: {fontSize: 10, fontWeight: '700', textTransform: 'uppercase', marginTop: 2},
  reviewTitle: {fontSize: 18, fontWeight: '800', marginBottom: 10, marginTop: 10},
  solRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 4},
  explWrap: {marginTop: 10, padding: 10, backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 8},
  explTitle: {fontSize: 12, fontWeight: '800', marginBottom: 4},
});

export default MockTestScreen;
