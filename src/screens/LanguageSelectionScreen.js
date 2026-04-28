import React, {useMemo, useState} from 'react';
import {
  Dimensions,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

const {width} = Dimensions.get('window');
const COLUMN_COUNT = 3;
const ITEM_SIZE = (width - 64) / COLUMN_COUNT;

const languages = [
  {code: 'en', name: 'English', native: 'English', script: 'A', enabled: true},
  {code: 'hi', name: 'Hindi', native: 'हिन्दी', script: 'अ', enabled: true},
  {code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', script: 'ಕ', enabled: true},
  {code: 'bn', name: 'Bengali', native: 'বাংলা', script: 'অ', enabled: false},
  {code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', script: 'અ', enabled: false},
  {code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', script: 'ਅ', enabled: false},
  {code: 'ta', name: 'Tamil', native: 'தமிழ்', script: 'அ', enabled: false},
  {code: 'te', name: 'Telugu', native: 'తెలుగు', script: 'అ', enabled: false},
  {code: 'mr', name: 'Marathi', native: 'मराठी', script: 'म', enabled: false},
  {code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ', script: 'ଅ', enabled: false},
  {code: 'as', name: 'Assamese', native: 'অসমীয়া', script: 'অ', enabled: false},
  {code: 'mni', name: 'Manipuri', native: 'মৈতৈলোন্', script: 'ম', enabled: false},
  {code: 'ml', name: 'Malayalam', native: 'മലയാളം', script: 'അ', enabled: false},
  {code: 'gom', name: 'Konkani', native: 'कोंकणी', script: 'क', enabled: false},
  {code: 'ur', name: 'Urdu', native: 'اردو', script: 'ا', enabled: false},
];

const COPY = {
  en: {
    focusTitle: 'Live languages',
    focusSubtitle: 'English, Hindi and Kannada are fully supported right now.',
    comingSoon: 'Coming soon',
  },
  hi: {
    focusTitle: 'लाइव भाषाएं',
    focusSubtitle: 'अभी English, Hindi और Kannada पूरी तरह समर्थित हैं।',
    comingSoon: 'जल्द आ रहा है',
  },
  kn: {
    focusTitle: 'ಲೈವ್ ಭಾಷೆಗಳು',
    focusSubtitle: 'ಈಗ English, Hindi ಮತ್ತು Kannada ಮಾತ್ರ ಸಂಪೂರ್ಣವಾಗಿ ಲಭ್ಯವಿವೆ.',
    comingSoon: 'ಶೀಘ್ರದಲ್ಲೇ',
  },
};

const LanguageSelectionScreen = ({navigation}) => {
  const {t, i18n} = useTranslation();
  const copy = COPY[i18n.language] || COPY.en;
  const defaultLanguage = useMemo(
    () => (languages.find(language => language.code === i18n.language && language.enabled) ? i18n.language : 'en'),
    [i18n.language],
  );
  const [selected, setSelected] = useState(defaultLanguage);

  const handleLanguageSelect = async language => {
    if (!language.enabled) {
      return;
    }

    setSelected(language.code);
    await AsyncStorage.setItem('settings.lang', language.code);
    await i18n.changeLanguage(language.code);

    setTimeout(() => {
      navigation.replace('MainTabs');
    }, 250);
  };

  const renderItem = ({item}) => {
    const isSelected = selected === item.code;
    const isEnabled = item.enabled;

    return (
      <TouchableOpacity
        style={[
          styles.gridItem,
          isSelected && styles.selectedItem,
          !isEnabled && styles.disabledItem,
        ]}
        onPress={() => handleLanguageSelect(item)}
        disabled={!isEnabled}
        activeOpacity={0.85}>
        <LinearGradient
          colors={
            isSelected
              ? ['#0EA5E9', '#2563EB']
              : isEnabled
                ? ['#FFFFFF', '#F8FAFC']
                : ['#F8FAFC', '#EEF2F7']
          }
          style={styles.cardGradient}>
          {!isEnabled ? (
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>{copy.comingSoon}</Text>
            </View>
          ) : null}

          <View style={[styles.scriptCircle, isSelected && styles.selectedScriptCircle]}>
            <Text style={[styles.scriptText, isSelected && styles.selectedScriptText]}>{item.script}</Text>
          </View>
          <Text style={[styles.nativeText, isSelected && styles.selectedNativeText, !isEnabled && styles.disabledText]}>
            {item.native}
          </Text>
          <Text style={[styles.englishText, isSelected && styles.selectedEnglishText]}>
            {item.name}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F1F5F9" />
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Icon name="language" size={32} color="#0074E4" />
        </View>
        <Text style={styles.title}>{t('chooseLanguage')}</Text>
        <Text style={styles.subtitle}>{t('selectPreferredLang')}</Text>
      </View>

      <View style={styles.liveBanner}>
        <Text style={styles.liveBannerTitle}>{copy.focusTitle}</Text>
        <Text style={styles.liveBannerSubtitle}>{copy.focusSubtitle}</Text>
      </View>

      <FlatList
        data={languages}
        keyExtractor={item => item.code}
        renderItem={renderItem}
        numColumns={COLUMN_COUNT}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>{t('changeAnytime')}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  header: {
    padding: 30,
    alignItems: 'center',
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 24,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#0074E4',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },
  liveBanner: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 20,
    padding: 16,
    backgroundColor: '#DBEAFE',
  },
  liveBannerTitle: {
    color: '#1D4ED8',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  liveBannerSubtitle: {
    color: '#334155',
    lineHeight: 20,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  gridItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE * 1.25,
    margin: 6,
    borderRadius: 24,
    backgroundColor: '#FFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  selectedItem: {
    elevation: 12,
    shadowOpacity: 0.3,
    shadowColor: '#2563EB',
  },
  disabledItem: {
    opacity: 0.85,
  },
  cardGradient: {
    flex: 1,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    position: 'relative',
  },
  comingSoonBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#E2E8F0',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  comingSoonText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
  },
  scriptCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  selectedScriptCircle: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  scriptText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0074E4',
  },
  selectedScriptText: {
    color: '#FFF',
  },
  nativeText: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '700',
    textAlign: 'center',
  },
  selectedNativeText: {
    color: '#FFF',
  },
  disabledText: {
    color: '#64748B',
  },
  englishText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },
  selectedEnglishText: {
    color: 'rgba(255,255,255,0.85)',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
});

export default LanguageSelectionScreen;
