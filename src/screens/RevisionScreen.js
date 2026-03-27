import React, {useState, useMemo, useEffect} from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, ActivityIndicator, Alert} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAppTheme} from '../util/theme';
import revisionData from '../data/revisionData';

const ITEMS_PER_PAGE = 20; // Show 20 items at a time
const DAILY_GOAL = 50; // Daily revision goal

const RevisionScreen = ({navigation}) => {
  const { t, i18n } = useTranslation();
  const {colors, isDark} = useAppTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const [viewedQuestions, setViewedQuestions] = useState(new Set());
  const [masteredQuestions, setMasteredQuestions] = useState(new Set());
  const [todayCount, setTodayCount] = useState(0);
  const [showMode, setShowMode] = useState('unviewed'); // 'unviewed', 'all', 'mastered'
  const [isLoading, setIsLoading] = useState(true);
  
  // Load progress on mount
  useEffect(() => {
    loadProgress();
  }, [i18n.language]);

  const loadProgress = async () => {
    try {
      setIsLoading(true);
      const lang = i18n.language;
      
      // Load viewed questions
      const viewedData = await AsyncStorage.getItem(`revision_viewed_${lang}`);
      if (viewedData) {
        setViewedQuestions(new Set(JSON.parse(viewedData)));
      }
      
      // Load mastered questions
      const masteredData = await AsyncStorage.getItem(`revision_mastered_${lang}`);
      if (masteredData) {
        setMasteredQuestions(new Set(JSON.parse(masteredData)));
      }
      
      // Load today's count
      const today = new Date().toDateString();
      const lastDate = await AsyncStorage.getItem('revision_last_date');
      const countData = await AsyncStorage.getItem('revision_today_count');
      
      if (lastDate === today && countData) {
        setTodayCount(parseInt(countData));
      } else {
        // New day, reset count
        setTodayCount(0);
        await AsyncStorage.setItem('revision_last_date', today);
        await AsyncStorage.setItem('revision_today_count', '0');
      }
    } catch (error) {
      console.log('Error loading progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProgress = async (viewed, mastered) => {
    try {
      const lang = i18n.language;
      await AsyncStorage.setItem(`revision_viewed_${lang}`, JSON.stringify([...viewed]));
      await AsyncStorage.setItem(`revision_mastered_${lang}`, JSON.stringify([...mastered]));
    } catch (error) {
      console.log('Error saving progress:', error);
    }
  };

  // Get all data
  const allData = useMemo(() => {
    try {
      const data = revisionData[i18n.language] || revisionData.en || [];
      if (!Array.isArray(data)) {
        return [];
      }
      return data;
    } catch (error) {
      console.log('Error loading revision data:', error);
      return [];
    }
  }, [i18n.language]);

  // Filter and sort data based on mode
  const filteredData = useMemo(() => {
    let filtered = [...allData];
    
    if (showMode === 'unviewed') {
      // Show only unviewed questions
      filtered = filtered.filter(item => !viewedQuestions.has(item.id) && !masteredQuestions.has(item.id));
    } else if (showMode === 'mastered') {
      // Show only mastered questions
      filtered = filtered.filter(item => masteredQuestions.has(item.id));
    } else {
      // Show all, but prioritize unviewed
      filtered.sort((a, b) => {
        const aViewed = viewedQuestions.has(a.id) || masteredQuestions.has(a.id);
        const bViewed = viewedQuestions.has(b.id) || masteredQuestions.has(b.id);
        if (aViewed === bViewed) return 0;
        return aViewed ? 1 : -1;
      });
    }
    
    return filtered;
  }, [allData, viewedQuestions, masteredQuestions, showMode]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const endIndex = currentPage * ITEMS_PER_PAGE;
    return filteredData.slice(0, endIndex);
  }, [filteredData, currentPage]);

  const hasMore = paginatedData.length < filteredData.length;
  const totalItems = allData.length;
  const unviewedCount = allData.length - viewedQuestions.size - masteredQuestions.size;
  const masteredCount = masteredQuestions.size;
  const progressPercent = Math.round((masteredQuestions.size / totalItems) * 100);

  const markAsViewed = async (questionId) => {
    const newViewed = new Set(viewedQuestions);
    newViewed.add(questionId);
    setViewedQuestions(newViewed);
    
    // Update today's count
    const newCount = todayCount + 1;
    setTodayCount(newCount);
    await AsyncStorage.setItem('revision_today_count', newCount.toString());
    
    // Check daily goal
    if (newCount === DAILY_GOAL) {
      Alert.alert(
        '🎉 Daily Goal Achieved!',
        `Congratulations! You've revised ${DAILY_GOAL} questions today!`,
        [{text: 'Awesome!', style: 'default'}]
      );
    }
    
    await saveProgress(newViewed, masteredQuestions);
  };

  const markAsMastered = async (questionId) => {
    const newMastered = new Set(masteredQuestions);
    const newViewed = new Set(viewedQuestions);
    
    newMastered.add(questionId);
    newViewed.delete(questionId); // Remove from viewed
    
    setMasteredQuestions(newMastered);
    setViewedQuestions(newViewed);
    await saveProgress(newViewed, newMastered);
  };

  const unmarkAsMastered = async (questionId) => {
    const newMastered = new Set(masteredQuestions);
    newMastered.delete(questionId);
    setMasteredQuestions(newMastered);
    await saveProgress(viewedQuestions, newMastered);
  };

  const resetProgress = () => {
    Alert.alert(
      'Reset Progress?',
      'This will clear all your revision progress. Are you sure?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            setViewedQuestions(new Set());
            setMasteredQuestions(new Set());
            setTodayCount(0);
            setCurrentPage(1);
            const lang = i18n.language;
            await AsyncStorage.removeItem(`revision_viewed_${lang}`);
            await AsyncStorage.removeItem(`revision_mastered_${lang}`);
            await AsyncStorage.setItem('revision_today_count', '0');
          }
        }
      ]
    );
  };

  const loadMore = () => {
    if (hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const renderItem = ({item}) => {
    const isViewed = viewedQuestions.has(item.id);
    const isMastered = masteredQuestions.has(item.id);
    
    return (
      <View style={[
        styles.qaCard, 
        {
          backgroundColor: isMastered ? colors.success + '15' : colors.card, 
          borderColor: isMastered ? colors.success : colors.border,
          opacity: isViewed && !isMastered ? 0.6 : 1
        }
      ]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.idText, {color: colors.subtext}]}>#{item.id}</Text>
          <View style={styles.cardActions}>
            {isMastered ? (
              <TouchableOpacity onPress={() => unmarkAsMastered(item.id)}>
                <Icon name="checkmark-circle" size={24} color={colors.success} />
              </TouchableOpacity>
            ) : (
              <>
                {!isViewed && (
                  <TouchableOpacity onPress={() => markAsViewed(item.id)}>
                    <Icon name="eye-outline" size={22} color={colors.primary} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => markAsMastered(item.id)}>
                  <Icon name="checkmark-circle-outline" size={22} color={colors.subtext} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
        <Text style={[styles.qText, {color: colors.text}]}>{item.q}</Text>
        <Text style={[styles.aText, {color: isMastered ? colors.success : colors.primary}]}>
          Ans: {item.a}
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!hasMore) {
      return (
        <View style={styles.endMessage}>
          <Icon name="checkmark-done-circle" size={48} color={colors.success} />
          <Text style={[styles.endText, {color: colors.text}]}>
            {showMode === 'unviewed' ? 'All caught up! 🎉' : 'End of list'}
          </Text>
        </View>
      );
    }
    
    return (
      <TouchableOpacity 
        style={[styles.loadMoreButton, {backgroundColor: colors.primary}]} 
        onPress={loadMore}
      >
        <Text style={styles.loadMoreText}>
          Load More ({paginatedData.length}/{filteredData.length})
        </Text>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <>
      {/* Stats Card */}
      <View style={[styles.statsCard, {backgroundColor: colors.card}]}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, {color: colors.primary}]}>{unviewedCount}</Text>
            <Text style={[styles.statLabel, {color: colors.subtext}]}>New</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, {color: colors.success}]}>{masteredCount}</Text>
            <Text style={[styles.statLabel, {color: colors.subtext}]}>Mastered</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, {color: colors.warning || '#FF9800'}]}>{todayCount}</Text>
            <Text style={[styles.statLabel, {color: colors.subtext}]}>Today</Text>
          </View>
        </View>
        
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, {width: `${progressPercent}%`, backgroundColor: colors.success}]} />
          </View>
          <Text style={[styles.progressText, {color: colors.subtext}]}>
            {progressPercent}% Complete
          </Text>
        </View>

        {/* Daily Goal */}
        <View style={[styles.goalContainer, {backgroundColor: colors.background}]}>
          <Icon name="trophy" size={20} color={colors.warning || '#FF9800'} />
          <Text style={[styles.goalText, {color: colors.text}]}>
            Daily Goal: {todayCount}/{DAILY_GOAL}
          </Text>
          <View style={styles.goalBar}>
            <View style={[styles.goalFill, {width: `${Math.min((todayCount/DAILY_GOAL)*100, 100)}%`, backgroundColor: colors.warning || '#FF9800'}]} />
          </View>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <TouchableOpacity 
          style={[styles.filterTab, showMode === 'unviewed' && {backgroundColor: colors.primary}]}
          onPress={() => {setShowMode('unviewed'); setCurrentPage(1);}}
        >
          <Text style={[styles.filterTabText, showMode === 'unviewed' && styles.filterTabTextActive]}>
            New ({unviewedCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterTab, showMode === 'all' && {backgroundColor: colors.primary}]}
          onPress={() => {setShowMode('all'); setCurrentPage(1);}}
        >
          <Text style={[styles.filterTabText, showMode === 'all' && styles.filterTabTextActive]}>
            All ({totalItems})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterTab, showMode === 'mastered' && {backgroundColor: colors.success}]}
          onPress={() => {setShowMode('mastered'); setCurrentPage(1);}}
        >
          <Text style={[styles.filterTabText, showMode === 'mastered' && styles.filterTabTextActive]}>
            Mastered ({masteredCount})
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
        <View style={[styles.header, {backgroundColor: colors.primary}]}>
          <Text style={styles.headerTitle}>{t('revision') || 'Revision & Notes'}</Text>
        </View>
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.emptyStateText, {color: colors.text}]}>
            Loading your progress...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={[styles.header, {backgroundColor: colors.primary}]}>
        <Text style={styles.headerTitle}>{t('revision') || 'Smart Revision'}</Text>
        <TouchableOpacity onPress={resetProgress} style={styles.resetButton}>
          <Icon name="refresh" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      {paginatedData.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="checkmark-done-circle" size={80} color={colors.success} />
          <Text style={[styles.emptyStateTitle, {color: colors.text}]}>
            All Done! 🎉
          </Text>
          <Text style={[styles.emptyStateText, {color: colors.subtext}]}>
            {showMode === 'unviewed' 
              ? "You've viewed all questions! Switch to 'All' to review."
              : "No questions to show."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={paginatedData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          contentContainerStyle={styles.content}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
        />
      )}
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
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8 },
      android: { elevation: 6 },
    }),
  },
  headerTitle: {
    fontSize: wp('6.5%'),
    fontWeight: 'bold',
    color: '#FFF',
  },
  resetButton: {
    padding: 8,
  },
  content: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 40,
  },
  statsCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: wp('7%'),
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: wp('3.5%'),
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: wp('3.2%'),
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '600',
  },
  goalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  goalText: {
    fontSize: wp('3.8%'),
    fontWeight: '600',
    flex: 1,
  },
  goalBar: {
    width: 60,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  goalFill: {
    height: '100%',
    borderRadius: 3,
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
  },
  filterTabText: {
    fontSize: wp('3.5%'),
    fontWeight: '600',
    color: '#0074E4',
  },
  filterTabTextActive: {
    color: '#FFF',
  },
  qaCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 1 },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  idText: {
    fontSize: wp('3%'),
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  qText: {
    fontSize: wp('4%'),
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 22,
  },
  aText: {
    fontSize: wp('3.8%'),
    fontWeight: '700',
    lineHeight: 20,
  },
  loadMoreButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignSelf: 'center',
    marginVertical: 20,
  },
  loadMoreText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: wp('4%'),
  },
  endMessage: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  endText: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    marginTop: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: wp('6%'),
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateText: {
    marginTop: 8,
    fontSize: wp('4%'),
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default RevisionScreen;
