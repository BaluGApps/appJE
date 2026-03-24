import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TouchableOpacity, 
  StatusBar,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const ITEM_SIZE = (width - 64) / COLUMN_COUNT;

const languages = [
  { code: 'en', name: 'English', native: 'English', script: 'A' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', script: 'अ' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', script: 'ಕ' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', script: 'অ' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', script: 'અ' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', script: 'ਅ' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', script: 'அ' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', script: 'అ' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', script: 'म' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ', script: 'ଅ' },
  { code: 'as', name: 'Assamese', native: 'অসমীয়া', script: 'অ' },
  { code: 'mni', name: 'Manipuri', native: 'মৈতৈলোন্', script: 'ম' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', script: 'അ' },
  { code: 'gom', name: 'Konkani', native: 'कोंकणी', script: 'क' },
  { code: 'ur', name: 'Urdu', native: 'اردو', script: 'ا' },
];

const LanguageSelectionScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const [selected, setSelected] = useState(i18n.language);

  const handleLanguageSelect = async (langCode) => {
    setSelected(langCode);
    await AsyncStorage.setItem('settings.lang', langCode);
    i18n.changeLanguage(langCode);
    // Short delay for visual feedback
    setTimeout(() => {
        navigation.replace('MainTabs');
    }, 300);
  };

  const renderItem = ({ item }) => {
    const isSelected = selected === item.code;
    return (
      <TouchableOpacity
        style={[styles.gridItem, isSelected && styles.selectedItem]}
        onPress={() => handleLanguageSelect(item.code)}
        activeOpacity={0.8}
      >
        <LinearGradient
            colors={isSelected ? ['#4facfe', '#00f2fe'] : ['#FFFFFF', '#F8FAFC']}
            style={styles.cardGradient}
        >
            <View style={[styles.scriptCircle, isSelected && styles.selectedScriptCircle]}>
                <Text style={[styles.scriptText, isSelected && styles.selectedScriptText]}>{item.script}</Text>
            </View>
            <Text style={[styles.nativeText, isSelected && styles.selectedNativeText]}>{item.native}</Text>
            <Text style={[styles.englishText, isSelected && styles.selectedEnglishText]}>{item.name}</Text>
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
      
      <FlatList
        data={languages}
        keyExtractor={(item) => item.code}
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
      shadowOffset: { width: 0, height: 4 },
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  selectedItem: {
      elevation: 12,
      shadowOpacity: 0.3,
      shadowColor: '#4facfe',
  },
  cardGradient: {
      flex: 1,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 10,
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
      backgroundColor: 'rgba(255,255,255,0.3)',
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
  englishText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },
  selectedEnglishText: {
    color: 'rgba(255,255,255,0.8)',
  },
  footer: {
      padding: 20,
      alignItems: 'center',
  },
  footerText: {
      fontSize: 13,
      color: '#94A3B8',
      fontWeight: '500',
  }
});

export default LanguageSelectionScreen;
