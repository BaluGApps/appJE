import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/Ionicons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import {useAppTheme} from '../util/theme';
import auth from '@react-native-firebase/auth';
import {BannerAd, BannerAdSize, TestIds} from 'react-native-google-mobile-ads';

const MOCK_TESTS = [
  { id: 'ntpc_1', tKey: 'ntpc_mock_1', category: 'NTPC', totalMarks: 100 },
  { id: 'alp_1', tKey: 'alp_mock_1', category: 'ALP', totalMarks: 75 },
  { id: 'je_1', tKey: 'je_mock_1', category: 'JE', totalMarks: 150 },
];

const PYQ_PDF_LINKS = {
  NTPC: [
    {id: 'ntpc-2023', year: '2023', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'},
    {id: 'ntpc-2022', year: '2022', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'},
  ],
  ALP: [
    {id: 'alp-2023', year: '2023', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'},
    {id: 'alp-2022', year: '2022', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'},
  ],
  JE: [
    {id: 'je-2023', year: '2023', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'},
    {id: 'je-2022', year: '2022', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'},
  ],
  GroupD: [
    {id: 'groupd-2023', year: '2023', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'},
    {id: 'groupd-2022', year: '2022', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'},
  ],
};

const TestsScreen = ({route, navigation}) => {
  const { t, i18n } = useTranslation();
  const {colors, isDark} = useAppTheme();
  const [activeTab, setActiveTab] = useState(route?.params?.pyq ? 'pyq' : 'tests'); // 'tests' | 'leaderboard' | 'pyq'
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [myCredits, setMyCredits] = useState(0);

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      fetchLeaderboard();
      fetchMyCredits();
    }
  }, [activeTab]);

  const fetchMyCredits = async () => {
    try {
      const uid = auth().currentUser?.uid;
      if (!uid) return;
      const snap = await firestore().collection('users').doc(uid).get();
      if (snap.exists) {
        setMyCredits(snap.data()?.totalCredits || 0);
      }
    } catch (e) {
      // no-op
    }
  };

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const snapshot = await firestore()
        .collection('leaderboards')
        .orderBy('points', 'desc')
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

  const openPdfLink = (url, category, year) => {
    navigation.navigate('PdfViewerScreen', {
      url,
      title: `RRB ${category} ${year} PDF`,
    });
  };

  const simulateTestSubmit = test => {
    navigation.navigate('MockTestScreen', {category: test.category});
  };

  const renderTests = () => (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Text style={[styles.sectionTitle, {color: colors.text}]}>{t('availableExams')}</Text>
      {MOCK_TESTS.map((test) => (
        <View key={test.id} style={[styles.card, {backgroundColor: colors.card}]}>
          <View style={styles.cardInfo}>
             <View style={styles.iconCircle}>
                <Icon name="medal" size={24} color="#0074E4" />
             </View>
             <View style={styles.textContainer}>
                <Text style={[styles.testTitle, {color: colors.text}]}>{t(test.tKey)}</Text>
                <View style={styles.metaRow}>
                   <View style={styles.labelBadge}>
                      <Text style={styles.labelText}>{test.category}</Text>
                   </View>
                   <Text style={[styles.marksText, {color: colors.subtext}]}>{test.totalMarks} {t('marks')}</Text>
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
      <View style={[styles.creditsCard, {backgroundColor: colors.card}]}>
        <Text style={[styles.creditsLabel, {color: colors.subtext}]}>Your Credits</Text>
        <Text style={[styles.creditsValue, {color: colors.primary}]}>{myCredits}</Text>
      </View>
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
                <Text style={styles.testTag} numberOfLines={1}>
                  {item.testTitle} • {item.points || 0} pts
                </Text>
              </View>
              <Text style={styles.scoreText}>{item.score}</Text>
            </View>
          )}
        />
      )}
    </View>
  );

  const renderPyq = () => (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Text style={[styles.sectionTitle, {color: colors.text}]}>Previous Year Papers (PDF)</Text>
      {Object.keys(PYQ_PDF_LINKS).map(category => (
        <View key={category} style={[styles.card, {backgroundColor: colors.card}]}>
          <Text style={[styles.testTitle, {color: colors.text}]}>RRB {category}</Text>
          {PYQ_PDF_LINKS[category].map(paper => (
            <TouchableOpacity
              key={paper.id}
              style={[styles.pyqItem, {borderColor: colors.border}]}
              onPress={() => openPdfLink(paper.url, category, paper.year)}>
              <View style={styles.pyqLeft}>
                <Icon name="document-text-outline" size={20} color={colors.primary} />
                <Text style={[styles.pyqLabel, {color: colors.text}]}>{paper.year} Paper PDF</Text>
              </View>
              <Icon name="open-outline" size={18} color={colors.subtext} />
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </ScrollView>
  );

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={[styles.header, {backgroundColor: colors.primary}]}>
        <Text style={styles.headerTitle}>{t('tests')}</Text>
      </View>

      <View style={[styles.tabContainer, {backgroundColor: colors.card}]}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'tests' && styles.activeTab]} 
          onPress={() => setActiveTab('tests')}
        >
          <Text style={[styles.tabText, {color: colors.subtext}, activeTab === 'tests' && styles.activeTabText]}>{t('mockTests')}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'leaderboard' && styles.activeTab]} 
          onPress={() => setActiveTab('leaderboard')}
        >
          <Text style={[styles.tabText, {color: colors.subtext}, activeTab === 'leaderboard' && styles.activeTabText]}>{t('leaderboard')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pyq' && styles.activeTab]}
          onPress={() => setActiveTab('pyq')}>
          <Text style={[styles.tabText, {color: colors.subtext}, activeTab === 'pyq' && styles.activeTabText]}>PYQ PDFs</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'tests' ? renderTests() : activeTab === 'leaderboard' ? renderLeaderboard() : renderPyq()}
      <BannerAd
        unitId={__DEV__ ? TestIds.ADAPTIVE_BANNER : 'ca-app-pub-2627956667785383/2550120291'}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      />
    </SafeAreaView>
  );
};

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
    flex: 1 / 3,
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
  },
  creditsCard: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  creditsLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  creditsValue: {
    fontSize: 24,
    fontWeight: '900',
    marginTop: 4,
  },
  pyqItem: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pyqLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pyqLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default TestsScreen;
