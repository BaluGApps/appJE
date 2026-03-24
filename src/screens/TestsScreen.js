import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  ActivityIndicator, 
  Alert, 
  Platform,
  Dimensions
} from 'react-native';
import { useTranslation } from 'react-i18next';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/Ionicons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const MOCK_TESTS = [
  { id: 'ntpc_1', title: 'RRB NTPC Grand Mock 1', category: 'NTPC', totalMarks: 100 },
  { id: 'alp_1', title: 'RRB ALP Full Test 1', category: 'ALP', totalMarks: 75 },
  { id: 'je_1', title: 'RRB JE Technical Mock', category: 'JE', totalMarks: 150 },
];

const TestsScreen = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('tests'); // 'tests' or 'leaderboard'
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      fetchLeaderboard();
    }
  }, [activeTab]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const snapshot = await firestore()
        .collection('leaderboards')
        .orderBy('score', 'desc')
        .limit(10)
        .get();
        
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLeaderboard(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const simulateTestSubmit = async (test) => {
    const user = auth().currentUser;
    if (!user) {
      Alert.alert(t('signInRequired'), t('signInPrompt'));
      return;
    }

    const randomScore = Math.floor(Math.random() * test.totalMarks) + 1;
    
    try {
      setLoading(true);
      await firestore().collection('leaderboards').add({
        userId: user.uid,
        userName: user.displayName || 'Anonymous Aspirant',
        testId: test.id,
        testTitle: test.title,
        score: randomScore,
        totalMarks: test.totalMarks,
        timestamp: firestore.FieldValue.serverTimestamp(),
      });
      
      Alert.alert(t('testCompleted'), `${t('score')}: ${randomScore}/${test.totalMarks}. ${t('rank')} updates shortly!`);
      
      if (activeTab === 'leaderboard') {
        fetchLeaderboard();
      }
    } catch (error) {
      console.error('Error saving score:', error);
      Alert.alert('Error', 'Could not save score to leaderboard.');
    } finally {
      setLoading(false);
    }
  };

  const renderTests = () => (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>{t('availableExams')}</Text>
      {MOCK_TESTS.map((test) => (
        <View key={test.id} style={styles.card}>
          <View style={styles.cardInfo}>
             <View style={styles.iconCircle}>
                <Icon name="medal" size={24} color="#0074E4" />
             </View>
             <View style={styles.textContainer}>
                <Text style={styles.testTitle}>{test.title}</Text>
                <Text style={styles.testSubtitle}>{test.category} • {test.totalMarks} {t('score')}</Text>
             </View>
          </View>
          
          <TouchableOpacity 
            style={styles.startButton}
            onPress={() => simulateTestSubmit(test)}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.startButtonText}>{t('takeMockTest')}</Text>}
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );

  const renderLeaderboard = () => (
    <View style={styles.leaderboardContainer}>
      {loading && leaderboard.length === 0 ? (
        <ActivityIndicator size="large" color="#0074E4" style={{ marginTop: 50 }} />
      ) : leaderboard.length === 0 ? (
        <View style={styles.emptyContainer}>
            <Icon name="trophy-outline" size={80} color="#E0E0E0" />
            <Text style={styles.emptyText}>{t('noScoresYet')}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {leaderboard.map((entry, index) => (
            <View key={entry.id} style={styles.leaderboardRow}>
              <View style={[styles.rankCircle, index < 3 ? styles[`topRank${index + 1}`] : {}]}>
                {index < 3 ? (
                    <Icon name="star" size={16} color="#FFF" />
                ) : (
                    <Text style={styles.rankText}>#{index + 1}</Text>
                )}
              </View>
              <View style={styles.leaderboardInfo}>
                <Text style={styles.playerName}>{entry.userName}</Text>
                <Text style={styles.playerTest}>{entry.testTitle}</Text>
              </View>
              <View style={styles.scoreBox}>
                <Text style={styles.scoreText}>{entry.score}</Text>
                <Text style={styles.totalText}>/{entry.totalMarks}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.topRow}>
            <Text style={styles.headerTitle}>{t('testsRankings')}</Text>
            <TouchableOpacity onPress={fetchLeaderboard} disabled={loading}>
                <Icon name="refresh" size={24} color="#FFF" />
            </TouchableOpacity>
        </View>
        
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'tests' && styles.activeTab]}
            onPress={() => setActiveTab('tests')}
          >
            <Text style={[styles.tabText, activeTab === 'tests' && styles.activeTabText]}>{t('allExams')}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'leaderboard' && styles.activeTab]}
            onPress={() => setActiveTab('leaderboard')}
          >
            <Text style={[styles.tabText, activeTab === 'leaderboard' && styles.activeTabText]}>{t('leaderboard')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.body}>
        {activeTab === 'tests' ? renderTests() : renderLeaderboard()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#0074E4',
    paddingTop: 10,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
  },
  activeTab: {
    backgroundColor: '#FFF',
  },
  tabText: {
    color: '#BFDBFF',
    fontWeight: '700',
    fontSize: 15,
  },
  activeTabText: {
    color: '#0074E4',
  },
  body: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: '#EFF6FF',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
  },
  textContainer: {
      flex: 1,
  },
  testTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  testSubtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  startButton: {
    backgroundColor: '#0074E4',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 18,
    borderRadius: 20,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
  },
  rankCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  topRank1: { backgroundColor: '#FCD34D' },
  topRank2: { backgroundColor: '#CBD5E1' },
  topRank3: { backgroundColor: '#D97706' },
  rankText: {
    fontWeight: 'bold',
    color: '#475569',
    fontSize: 16,
  },
  leaderboardInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  playerTest: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  scoreBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0074E4',
  },
  totalText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 60,
  },
  emptyText: {
    color: '#94A3B8',
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default TestsScreen;
