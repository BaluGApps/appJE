import React, {useEffect, useMemo, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView} from 'react-native';
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
      const timeBonus = Math.floor(remaining / 10);
      const points = finalScore * 10 + timeBonus;
      await firestore().collection('leaderboards').add({
        userId: user.uid,
        userName: user.displayName || 'Anonymous Aspirant',
        userEmail: user.email || '',
        testId: `mock-${category}-${i18n.language}`,
        testTitle: `RRB ${category} (${i18n.language})`,
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
    } catch (e) {
      // no-op for now
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

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          !submitted && {flexGrow: 1, justifyContent: 'center'},
        ]}>
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
          <View style={[styles.resultCard, {backgroundColor: colors.card}]}>
            <Text style={[styles.resultText, {color: colors.text}]}>
              Result: {score} / {questions.length}
            </Text>
            <Text style={[styles.pointsText, {color: colors.primary}]}>
              Credits Earned: {score * 10 + Math.floor(remaining / 10)}
            </Text>
            <TouchableOpacity
              style={[styles.btn, {backgroundColor: colors.primary, marginTop: 10}]}
              onPress={() => navigation.goBack()}>
              <Text style={styles.btnText}>Back to Leaderboard</Text>
            </TouchableOpacity>
          </View>
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
  resultCard: {padding: 14, borderRadius: 12, marginTop: 16},
  resultText: {fontSize: 18, fontWeight: '800'},
  pointsText: {marginTop: 6, fontWeight: '700'},
});

export default MockTestScreen;
