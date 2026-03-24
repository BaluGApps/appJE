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
  { id: 'ntpc_1', tKey: 'ntpc_mock_1', category: 'NTPC', totalMarks: 100 },
  { id: 'alp_1', tKey: 'alp_mock_1', category: 'ALP', totalMarks: 75 },
  { id: 'je_1', tKey: 'je_mock_1', category: 'JE', totalMarks: 150 },
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
        userName: user.displayName || t('anonymousAspirant'),
        testId: test.id,
        testTitle: t(test.tKey),
        score: randomScore,
        totalMarks: test.totalMarks,
        timestamp: firestore.FieldValue.serverTimestamp(),
      });
      
      Alert.alert(t('testCompleted'), `${t('score')}: ${randomScore}/${test.totalMarks}. ${t('rank')} ${t('updatesShortly')}`);
      
      if (activeTab === 'leaderboard') {
        fetchLeaderboard();
      }
    } catch (error) {
      console.error('Error saving score:', error);
      Alert.alert(t('error'), t('leaderboardSaveError'));
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
                <Text style={styles.testTitle}>{t(test.tKey)}</Text>
                <View style={styles.metaRow}>
                   <View style={styles.labelBadge}>
                      <Text style={styles.labelText}>{test.category}</Text>
                   </View>
                   <Text style={styles.marksText}>{test.totalMarks} {t('marks')}</Text>
                </View>
             </View>
          </View>
          <TouchableOpacity 
            style={styles.startButton} 
            onPress={() => simulateTestSubmit(test)}
            disabled={loading}
          >
            <Text style={styles.startButtonText}>{t('startTest')}</Text>
            <Icon name="play" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );

  const renderLeaderboard = () => (
    <View style={styles.leaderboardContainer}>
      <View style={styles.leaderboardHeader}>
        <Text style={styles.rankTitle}>{t('rank')}</Text>
        <Text style={styles.nameTitle}>{t('aspirant')}</Text>
        <Text style={styles.scoreTitle}>{t('score')}</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#0074E4" style={{ marginTop: 40 }} />
      ) : leaderboard.length === 0 ? (
        <View style={styles.noDataContainer}>
          <Icon name="podium-outline" size={60} color="#ccc" />
          <Text style={styles.noDataText}>{t('noScoresYet')}</Text>
        </View>
      ) : (
        <FlatList
          data={leaderboard}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <View style={[styles.leaderboardRow, index === 0 && styles.topRank]}>
              <Text style={styles.rankText}>{index + 1}</Text>
              <View style={styles.aspirantInfo}>
                <Text style={styles.aspirantName} numberOfLines={1}>{item.userName}</Text>
                <Text style={styles.testTag} numberOfLines={1}>{item.testTitle}</Text>
              </View>
              <Text style={styles.scoreText}>{item.score}</Text>
            </View>
          )}
        />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('tests')}</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'tests' && styles.activeTab]} 
          onPress={() => setActiveTab('tests')}
        >
          <Text style={[styles.tabText, activeTab === 'tests' && styles.activeTabText]}>{t('mockTests')}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'leaderboard' && styles.activeTab]} 
          onPress={() => setActiveTab('leaderboard')}
        >
          <Text style={[styles.tabText, activeTab === 'leaderboard' && styles.activeTabText]}>{t('leaderboard')}</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'tests' ? renderTests() : renderLeaderboard()}
    </SafeAreaView>
  );
};

// ... Styles remains same as previous ...
// Re-importing FlatList as I used it in leaderboard
import { FlatList } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#0074E4',
    padding: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: wp('7%'),
    fontWeight: 'bold',
    color: '#FFF',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    margin: 20,
    borderRadius: 16,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: '#E3F2FD',
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  activeTabText: {
    color: '#0074E4',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
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
    marginBottom: 16,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  labelBadge: {
    backgroundColor: '#F0F2F5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  labelText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#666',
  },
  marksText: {
    fontSize: 12,
    color: '#888',
  },
  startButton: {
    backgroundColor: '#0074E4',
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  leaderboardContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingHorizontal: 12,
  },
  rankTitle: { flex: 0.5, fontSize: 12, fontWeight: 'bold', color: '#888' },
  nameTitle: { flex: 2, fontSize: 12, fontWeight: 'bold', color: '#888' },
  scoreTitle: { flex: 0.5, fontSize: 12, fontWeight: 'bold', color: '#888', textAlign: 'right' },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    marginTop: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  topRank: {
    backgroundColor: '#FFF9C4',
    borderWidth: 1,
    borderColor: '#FBC02D',
  },
  rankText: {
    flex: 0.5,
    fontWeight: 'bold',
    color: '#333',
  },
  aspirantInfo: {
    flex: 2,
  },
  aspirantName: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 14,
  },
  testTag: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  scoreText: {
    flex: 0.5,
    fontWeight: 'bold',
    color: '#0074E4',
    textAlign: 'right',
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  noDataText: {
    marginTop: 16,
    color: '#888',
    fontSize: 16,
  }
});

export default TestsScreen;
