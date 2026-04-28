import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import {BannerAd, BannerAdSize, TestIds} from 'react-native-google-mobile-ads';
import {useAppTheme} from '../util/theme';
import mockTestsData from '../data/mockTestsData';

const COPY = {
  en: {
    testsIntro: 'Full-length mock packs built from your practice bank.',
    questions: 'questions',
    minutes: 'min',
    credits: 'Your Credits',
    ready: 'Ready for score improvement',
  },
  hi: {
    testsIntro: 'आपके प्रैक्टिस बैंक से बनाए गए फुल-लेंथ मॉक पैक।',
    questions: 'प्रश्न',
    minutes: 'मिनट',
    credits: 'आपके क्रेडिट्स',
    ready: 'स्कोर सुधारने के लिए तैयार',
  },
  kn: {
    testsIntro: 'ನಿಮ್ಮ ಅಭ್ಯಾಸ ಬ್ಯಾಂಕ್‌ನಿಂದ ನಿರ್ಮಿಸಿದ ಫುಲ್-ಲೆಂಗ್ತ್ ಮಾಕ್ ಪ್ಯಾಕ್‌ಗಳು.',
    questions: 'ಪ್ರಶ್ನೆಗಳು',
    minutes: 'ನಿಮಿಷ',
    credits: 'ನಿಮ್ಮ ಕ್ರೆಡಿಟ್‌ಗಳು',
    ready: 'ಸ್ಕೋರ್ ಹೆಚ್ಚಿಸಲು ಸಿದ್ಧ',
  },
};

const CATEGORY_ORDER = ['NTPC', 'ALP', 'JE', 'GroupD'];

const TestsScreen = ({navigation}) => {
  const {t, i18n} = useTranslation();
  const {colors} = useAppTheme();
  const currentUserId = auth().currentUser?.uid;
  const [activeTab, setActiveTab] = useState('tests');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [myCredits, setMyCredits] = useState(0);

  const copy = COPY[i18n.language] || COPY.en;
  const mockCatalog = useMemo(
    () => mockTestsData.buildMockCatalog(i18n.language),
    [i18n.language],
  );

  const groupedMocks = useMemo(
    () =>
      CATEGORY_ORDER.map(category => ({
        category,
        tests: mockCatalog.filter(item => item.category === category),
      })).filter(section => section.tests.length > 0),
    [mockCatalog],
  );

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      fetchLeaderboard();
      fetchMyCredits();
    }
  }, [activeTab]);

  const fetchMyCredits = async () => {
    try {
      const uid = auth().currentUser?.uid;
      if (!uid) {
        setMyCredits(0);
        return;
      }

      const snap = await firestore().collection('users').doc(uid).get();
      if (snap.exists) {
        setMyCredits(snap.data()?.totalCredits || 0);
      }
    } catch (_error) {
      setMyCredits(0);
    }
  };

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const snapshot = await firestore()
        .collection('leaderboards')
        .orderBy('points', 'desc')
        .limit(100)
        .get();

      const attempts = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
      const bestByUser = new Map();

      for (const row of attempts) {
        if (!row.userId || row.userId === 'system') {
          continue;
        }

        const previous = bestByUser.get(row.userId);
        if (!previous || Number(row.points || 0) > Number(previous.points || 0)) {
          bestByUser.set(row.userId, row);
        }
      }

      setLeaderboard(
        Array.from(bestByUser.values())
          .sort((a, b) => Number(b.points || 0) - Number(a.points || 0))
          .slice(0, 10),
      );
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderTests = () => (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={[styles.heroCard, {backgroundColor: colors.card}]}>
        <Text style={[styles.heroTitle, {color: colors.text}]}>{t('mockTests')}</Text>
        <Text style={[styles.heroSubtitle, {color: colors.subtext}]}>{copy.testsIntro}</Text>
      </View>

      {groupedMocks.map(section => (
        <View key={section.category} style={styles.sectionWrap}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, {color: colors.text}]}>RRB {section.category}</Text>
            <Text style={[styles.sectionMeta, {color: colors.subtext}]}>
              {section.tests.length} tests
            </Text>
          </View>

          {section.tests.map(test => (
            <TouchableOpacity
              key={test.id}
              style={[styles.mockCard, {backgroundColor: colors.card, borderColor: colors.border}]}
              onPress={() => navigation.navigate('MockTestScreen', {testId: test.id})}>
              <View style={[styles.mockAccent, {backgroundColor: test.accent}]} />
              <View style={styles.mockBody}>
                <Text style={[styles.mockTitle, {color: colors.text}]}>{test.title}</Text>
                <Text style={[styles.mockMeta, {color: colors.subtext}]}>
                  {test.questionCount} {copy.questions} • {Math.round(test.durationSeconds / 60)} {copy.minutes}
                </Text>
              </View>
              <Icon name="play-circle" size={28} color={colors.primary} />
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </ScrollView>
  );

  const renderLeaderboard = () => (
    <View style={styles.leaderboardContainer}>
      <View style={[styles.creditsCard, {backgroundColor: colors.card}]}>
        <Text style={[styles.creditsLabel, {color: colors.subtext}]}>{copy.credits}</Text>
        <Text style={[styles.creditsValue, {color: colors.primary}]}>{myCredits}</Text>
        <Text style={[styles.creditsHint, {color: colors.subtext}]}>{copy.ready}</Text>
      </View>

      <View style={styles.leaderboardHeader}>
        <Text style={[styles.rankTitle, {color: colors.subtext}]}>{t('rank')}</Text>
        <Text style={[styles.nameTitle, {color: colors.subtext}]}>{t('aspirant')}</Text>
        <Text style={[styles.scoreTitle, {color: colors.subtext}]}>{t('score')}</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : leaderboard.length === 0 ? (
        <View style={styles.noDataContainer}>
          <Icon name="podium-outline" size={60} color={colors.subtext} />
          <Text style={[styles.noDataText, {color: colors.subtext}]}>{t('noScoresYet')}</Text>
        </View>
      ) : (
        <FlatList
          data={leaderboard}
          keyExtractor={item => item.userId || item.id}
          renderItem={({item, index}) => (
            <View
              style={[
                styles.leaderboardRow,
                {backgroundColor: colors.card, borderColor: colors.border},
                item.userId === currentUserId && {borderColor: colors.primary},
              ]}>
              <Text style={[styles.rankText, {color: colors.text}]}>{index + 1}</Text>
              <View style={styles.aspirantInfo}>
                <Text style={[styles.aspirantName, {color: colors.text}]} numberOfLines={1}>
                  {item.userName}
                </Text>
                <Text style={[styles.testTag, {color: colors.subtext}]} numberOfLines={1}>
                  {item.testTitle} • {item.points || 0} pts
                </Text>
              </View>
              <Text style={[styles.scoreText, {color: colors.primary}]}>{item.score}</Text>
            </View>
          )}
        />
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={[styles.header, {backgroundColor: colors.primary}]}>
        <Text style={styles.headerTitle}>{t('tests')}</Text>
      </View>

      <View style={[styles.tabContainer, {backgroundColor: colors.card, borderColor: colors.border}]}>
        {[
          {id: 'tests', label: t('mockTests')},
          {id: 'leaderboard', label: t('leaderboard')},
        ].map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && {backgroundColor: `${colors.primary}18`},
            ]}
            onPress={() => setActiveTab(tab.id)}>
            <Text
              style={[
                styles.tabText,
                {color: activeTab === tab.id ? colors.primary : colors.subtext},
              ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'tests' ? renderTests() : renderLeaderboard()}

      <BannerAd
        unitId={__DEV__ ? TestIds.ADAPTIVE_BANNER : 'ca-app-pub-2627956667785383/2550120291'}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '900',
  },
  tabContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 18,
    padding: 6,
    flexDirection: 'row',
    borderWidth: 1,
  },
  tab: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabText: {
    fontWeight: '700',
    fontSize: 13,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  heroCard: {
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 21,
    fontWeight: '900',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 21,
  },
  sectionWrap: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  sectionMeta: {
    fontSize: 13,
    fontWeight: '700',
  },
  mockCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mockAccent: {
    width: 6,
    alignSelf: 'stretch',
    borderRadius: 999,
    marginRight: 12,
  },
  mockBody: {
    flex: 1,
  },
  mockTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  mockMeta: {
    fontSize: 13,
    fontWeight: '600',
  },
  leaderboardContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 100,
  },
  creditsCard: {
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
  },
  creditsLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  creditsValue: {
    fontSize: 30,
    fontWeight: '900',
    marginVertical: 4,
  },
  creditsHint: {
    fontSize: 13,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  rankTitle: {
    width: 40,
    fontWeight: '700',
  },
  nameTitle: {
    flex: 1,
    fontWeight: '700',
  },
  scoreTitle: {
    width: 50,
    textAlign: 'right',
    fontWeight: '700',
  },
  leaderboardRow: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankText: {
    width: 40,
    fontSize: 18,
    fontWeight: '900',
  },
  aspirantInfo: {
    flex: 1,
    paddingRight: 10,
  },
  aspirantName: {
    fontSize: 15,
    fontWeight: '800',
  },
  testTag: {
    fontSize: 12,
    marginTop: 2,
  },
  scoreText: {
    width: 50,
    textAlign: 'right',
    fontSize: 17,
    fontWeight: '900',
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  noDataText: {
    marginTop: 12,
    textAlign: 'center',
  },
  loader: {
    marginTop: 50,
  },
});

export default TestsScreen;
