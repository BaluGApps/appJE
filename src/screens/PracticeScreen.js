import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {useAppTheme} from '../util/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from 'react-native-google-mobile-ads';
import allQuestions from '../data/questions';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

const GRID_COLUMNS = 5;
const TOTAL_LEVELS = 1000;
const levelData = Array.from({length: TOTAL_LEVELS}, (_, i) => ({id: i + 1}));

const PracticeScreen = ({route, navigation}) => {
  const insets = useSafeAreaInsets();
  const {i18n} = useTranslation();
  const {colors} = useAppTheme();
  const initialCategory = route.params?.category || 'NTPC';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [progressState, setProgressState] = useState({unlockedLevel: 1, completed: []});

  // Sync category with params if they change
  useEffect(() => {
    if (route.params?.category && route.params.category !== selectedCategory) {
      setSelectedCategory(route.params.category);
      // Reset progress state locally while loading new data
      setProgressState({unlockedLevel: 1, completed: []});
    }
  }, [route.params?.category]);

  const questions = useMemo(() => {
    const langData = allQuestions[i18n.language] || allQuestions.en;
    return langData[selectedCategory] || [];
  }, [i18n.language, selectedCategory]);

  const progressKey = `practice.progress.${i18n.language}.${selectedCategory}`;

  const loadProgress = async () => {
    const saved = await AsyncStorage.getItem(progressKey);
    if (saved) {
      try {
        setProgressState(JSON.parse(saved));
      } catch (_e) {
        setProgressState({unlockedLevel: 1, completed: []});
      }
    } else {
      // CLEAR OLD STATE if no progress exists for this new category
      setProgressState({unlockedLevel: 1, completed: []});
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadProgress();
    }, [progressKey])
  );

  const onLevelPress = levelIndex => {
    const level = levelIndex + 1;
    if (level > progressState.unlockedLevel) {
      return;
    }
    
    // Check if question exists for this level
    if (!questions[levelIndex]) {
      require('react-native').Alert.alert(
        'Practice',
        'Questions are coming soon we are working on it',
        [{text: 'OK'}]
      );
      return;
    }

    navigation.navigate('PracticeQuizScreen', {
      category: selectedCategory,
      levelIndex: levelIndex,
    });
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]} edges={['left', 'right', 'bottom']}>
      <View style={[styles.header, {backgroundColor: colors.primary, paddingTop: insets.top + 10}]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>RailAspirant {selectedCategory}</Text>
        <View style={{width: 22}} />
      </View>
      <View style={styles.levelMeta}>
        <Text style={[styles.metaText, {color: colors.text}]}>
          Unlocked: {progressState.unlockedLevel} / {TOTAL_LEVELS}
        </Text>
        <Text style={[styles.metaText, {color: colors.subtext}]}>
          Completed: {progressState.completed.length}
        </Text>
      </View>
      <FlatList
        key={selectedCategory} // SMART SOLUTION: Force re-render on category change
        data={levelData}
        keyExtractor={(item) => `level-${item.id}`}
        numColumns={GRID_COLUMNS}
        contentContainerStyle={styles.grid}
        renderItem={({index}) => {
          const level = index + 1;
          const locked = level > progressState.unlockedLevel;
          const completed = progressState.completed.includes(level);
          return (
            <TouchableOpacity
              style={[
                styles.levelCell,
                {
                  backgroundColor: completed ? '#1F5131' : colors.card,
                  borderColor: locked ? '#64748B' : colors.border,
                },
              ]}
              onPress={() => onLevelPress(index)}
              activeOpacity={0.7}
              disabled={locked}>
              <Text style={[styles.levelNumber, {color: completed ? '#D1FAE5' : (locked ? '#94A3B8' : colors.text)}]}>
                {level}
              </Text>
              <Icon
                name={locked ? 'lock-closed' : completed ? 'checkmark-circle' : 'lock-open'}
                size={14}
                color={locked ? '#94A3B8' : completed ? '#22C55E' : colors.primary}
              />
            </TouchableOpacity>
          );
        }}
        initialNumToRender={20}
        maxToRenderPerBatch={20}
        windowSize={10}
      />
      <View style={styles.bannerWrap}>
        <BannerAd
          unitId={__DEV__ ? TestIds.ADAPTIVE_BANNER : 'ca-app-pub-2627956667785383/2550120291'}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#0074E4',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: wp('5.5%'),
    fontWeight: 'bold',
    color: '#FFF',
  },
  levelMeta: {paddingHorizontal: 16, paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between'},
  metaText: {fontWeight: '700'},
  grid: {padding: 12, paddingBottom: 100},
  levelCell: {
    width: '18%',
    margin: '1%',
    height: 68,
    borderWidth: 1,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelNumber: {fontSize: 16, fontWeight: '800', marginBottom: 4},
  bannerWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});

export default PracticeScreen;
