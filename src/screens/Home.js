import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {useAppTheme} from '../util/theme';
import {BannerAd, BannerAdSize, TestIds} from 'react-native-google-mobile-ads';
import auth from '@react-native-firebase/auth';

const ExamCard = ({ title, subtitle, icon, colors, onPress }) => (
  <TouchableOpacity style={styles.cardContainer} onPress={onPress} activeOpacity={0.8}>
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.cardGradient}
    >
      <View style={styles.cardOverlay} />
      <View style={styles.cardContent}>
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
        </View>
        <View style={styles.cardIconContainer}>
          <Icon name={icon} size={36} color="#FFF" />
        </View>
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

const Home = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const {colors, isDark} = useAppTheme();
  const [userName, setUserName] = useState('Railway Aspirant');
  const [userEmail, setUserEmail] = useState('guest@railaspirant.app');

  useEffect(() => {
    const unsub = auth().onAuthStateChanged(user => {
      if (user) {
        setUserName(user.displayName || 'Railway Aspirant');
        setUserEmail(user.email || 'Signed in user');
      } else {
        setUserName('Railway Aspirant');
        setUserEmail('guest@railaspirant.app');
      }
    });
    return unsub;
  }, []);

  const handleNavigation = (category) => {
    navigation.navigate('Practice', { category });
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />
      <LinearGradient colors={['#004E92', '#000428']} style={styles.topBackground} />
      
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]} showsVerticalScrollIndicator={false}>
        
        {/* Modern Header Section */}
        <View style={styles.header}>
            <View>
                <Text style={styles.greeting}>RailAspirant</Text>
                <Text style={styles.subGreeting}>{userName} • {userEmail}</Text>
            </View>
            <TouchableOpacity style={styles.profileIcon} onPress={() => navigation.navigate('Profile')}>
                <Icon name="person" size={24} color="#FFF" />
            </TouchableOpacity>
        </View>

        {/* Motivation Card */}
        <LinearGradient
          colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
          style={styles.motivationCard}
        >
          <View style={styles.trainRow}>
            <Icon name="train-outline" size={20} color="#93C5FD" />
            <Text style={styles.trainTag}>Railway Dream Mode</Text>
          </View>
          <Text style={styles.motivationTitle}>{t('motivationTitle')}</Text>
          <Text style={styles.motivationText}>{t('motivationText')}</Text>
        </LinearGradient>

        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('targetExams')}</Text>
            <TouchableOpacity>
                <Text style={styles.seeAll}>{t('seeAll')}</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.gridContainer}>
          <ExamCard
            title="RRB NTPC"
            subtitle={t('ntpcSubtitle')}
            icon="people-circle"
            colors={['#FF5F6D', '#FFC371']}
            onPress={() => handleNavigation('NTPC')}
          />
          <ExamCard
            title="RRB ALP"
            subtitle={t('alpSubtitle')}
            icon="speedometer"
            colors={['#2193b0', '#6dd5ed']}
            onPress={() => handleNavigation('ALP')}
          />
          <ExamCard
            title="RRB JE"
            subtitle={t('jeSubtitle')}
            icon="settings"
            colors={['#1D976C', '#93F9B9']}
            onPress={() => handleNavigation('JE')}
          />
          <ExamCard
            title="RRB Group D"
            subtitle={t('groupDSubtitle')}
            icon="build"
            colors={['#614385', '#516395']}
            onPress={() => handleNavigation('GroupD')}
          />
        </View>

        <Text style={styles.sectionTitle}>{t('extraResources')}</Text>

        <TouchableOpacity
          style={[styles.resourceItem, {backgroundColor: colors.card}]}
          onPress={() => navigation.navigate('Tests', { pyq: true })}
        >
            <View style={[styles.resourceIcon, { backgroundColor: '#E3F2FD' }]}>
                <Icon name="newspaper" size={24} color="#0074E4" />
            </View>
            <View style={styles.resourceText}>
                <Text style={[styles.resourceTitle, {color: colors.text}]}>{t('pyqTitle')}</Text>
                <Text style={[styles.resourceSubtitle, {color: colors.subtext}]}>{t('pyqSubtitle')}</Text>
            </View>
            <Icon name="chevron-forward" size={18} color="#A0AEC0" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.resourceItem, {backgroundColor: colors.card}]}
          onPress={() => navigation.navigate('Revision')}
        >
            <View style={[styles.resourceIcon, { backgroundColor: '#FFF3E0' }]}>
                <Icon name="bookmark" size={24} color="#F57C00" />
            </View>
            <View style={styles.resourceText}>
                <Text style={[styles.resourceTitle, {color: colors.text}]}>{t('revisionVault')}</Text>
                <Text style={[styles.resourceSubtitle, {color: colors.subtext}]}>{t('revisionSubtitle')}</Text>
            </View>
            <Icon name="chevron-forward" size={18} color="#A0AEC0" />
        </TouchableOpacity>

      </ScrollView>
      <View style={styles.bannerWrap}>
        <BannerAd
          unitId={__DEV__ ? TestIds.ADAPTIVE_BANNER : 'ca-app-pub-2627956667785383/2550120291'}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  topBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: hp('40%'),
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -0.5,
  },
  subGreeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  profileIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(255,255,255,0.1)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
  },
  motivationCard: {
      padding: 24,
      borderRadius: 24,
      marginBottom: 32,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
  },
  motivationTitle: {
      color: '#4ADE80',
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 8,
  },
  motivationText: {
  trainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  trainTag: {
    color: '#93C5FD',
    fontWeight: '700',
  },
      color: '#E2E8F0',
      fontSize: 15,
      lineHeight: 22,
  },
  sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  seeAll: {
      color: '#0074E4',
      fontWeight: '600',
  },
  gridContainer: {
    marginBottom: 32,
  },
  cardContainer: {
    marginBottom: 16,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  cardGradient: {
    padding: 26,
    flexDirection: 'row',
  },
  cardOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.05)',
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardText: {
    flex: 1,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '600',
  },
  cardIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resourceItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#1E293B',
      padding: 16,
      borderRadius: 20,
      marginBottom: 12,
  },
  resourceIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
  },
  resourceText: {
      flex: 1,
  },
  resourceTitle: {
      color: '#FFF',
      fontSize: 16,
      fontWeight: '700',
  },
  resourceSubtitle: {
      color: '#94A3B8',
      fontSize: 12,
      marginTop: 2,
  },
  bannerWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});

export default Home;
