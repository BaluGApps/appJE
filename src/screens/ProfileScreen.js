import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  SafeAreaView, 
  ScrollView, 
  Switch,
  Platform
} from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Settings states
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(true);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '1010565650879-ena7o86jt2858lrms66r5rpeat13lpnj.apps.googleusercontent.com',
    });

    const subscriber = auth().onAuthStateChanged((userState) => {
      setUser(userState);
      if (initializing) setInitializing(false);
    });

    loadSettings();
    return subscriber;
  }, []);

  const loadSettings = async () => {
    try {
      const savedDarkMode = await AsyncStorage.getItem('settings.darkMode');
      const savedNotifications = await AsyncStorage.getItem('settings.notifications');
      const savedSounds = await AsyncStorage.getItem('settings.sounds');

      if (savedDarkMode !== null) setDarkMode(JSON.parse(savedDarkMode));
      if (savedNotifications !== null) setNotifications(JSON.parse(savedNotifications));
      if (savedSounds !== null) setSounds(JSON.parse(savedSounds));
    } catch (e) {
      console.error('Failed to load settings');
    }
  };

  const toggleSetting = async (key, value, setter) => {
    setter(value);
    await AsyncStorage.setItem(`settings.${key}`, JSON.stringify(value));
  };

  const onGoogleButtonPress = async () => {
    try {
      setIsSigningIn(true);
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const { data } = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(data.idToken);
      await auth().signInWithCredential(googleCredential);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSigningIn(false);
    }
  };

  const signOut = async () => {
    try {
      await auth().signOut();
      await GoogleSignin.signOut();
    } catch (error) {
      console.error(error);
    }
  };

  if (initializing) return null;

  return (
    <SafeAreaView style={[styles.container, darkMode && styles.darkContainer]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, darkMode && styles.darkText]}>{t('profile')}</Text>
        </View>

        {!user ? (
          <View style={styles.unauthContainer}>
            <Icon name="person-circle-outline" size={120} color={darkMode ? "#444" : "#ccc"} />
            <Text style={[styles.unauthTitle, darkMode && styles.darkText]}>{t('saveProgress')}</Text>
            <Text style={[styles.unauthSub, darkMode && styles.darkSubText]}>{t('signInBenefit')}</Text>
            <TouchableOpacity 
              style={styles.googleButton} 
              onPress={onGoogleButtonPress}
              disabled={isSigningIn}
            >
              {isSigningIn ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Icon name="logo-google" size={24} color="#fff" style={styles.googleIcon} />
                  <Text style={styles.googleButtonText}>{t('signInWithGoogle')}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.authContainer}>
            <Image source={{ uri: user.photoURL || 'https://via.placeholder.com/150' }} style={styles.avatar} />
            <Text style={[styles.userName, darkMode && styles.darkText]}>{user.displayName || 'Railway Aspirant'}</Text>
            <Text style={[styles.userEmail, darkMode && styles.darkSubText]}>{user.email}</Text>

            <View style={[styles.statsContainer, darkMode && styles.darkBox]}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>{t('tests')}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>85%</Text>
                <Text style={styles.statLabel}>{t('accuracy')}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>#42</Text>
                <Text style={styles.statLabel}>{t('rank')}</Text>
              </View>
            </View>
          </View>
        )}

        <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>{t('appSettings')}</Text>
        <View style={[styles.settingsList, darkMode && styles.darkBox]}>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Icon name="moon" size={22} color="#5C6BC0" />
              <Text style={[styles.settingLabel, darkMode && styles.darkText]}>{t('darkMode')}</Text>
            </View>
            <Switch 
              value={darkMode} 
              onValueChange={(val) => toggleSetting('darkMode', val, setDarkMode)}
              trackColor={{ false: "#D1D1D1", true: "#0074E4" }}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Icon name="notifications" size={22} color="#FF7043" />
              <Text style={[styles.settingLabel, darkMode && styles.darkText]}>{t('notifications')}</Text>
            </View>
            <Switch 
              value={notifications} 
              onValueChange={(val) => toggleSetting('notifications', val, setNotifications)}
              trackColor={{ false: "#D1D1D1", true: "#0074E4" }}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Icon name="volume-high" size={22} color="#26A69A" />
              <Text style={[styles.settingLabel, darkMode && styles.darkText]}>{t('soundEffects')}</Text>
            </View>
            <Switch 
              value={sounds} 
              onValueChange={(val) => toggleSetting('sounds', val, setSounds)}
              trackColor={{ false: "#D1D1D1", true: "#0074E4" }}
            />
          </View>

          <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('LanguageSelection')}>
            <View style={styles.settingInfo}>
              <Icon name="language" size={22} color="#0074E4" />
              <Text style={[styles.settingLabel, darkMode && styles.darkText]}>{t('changeLanguage')}</Text>
            </View>
            <Icon name="chevron-forward" size={18} color="#ccc" />
          </TouchableOpacity>
        </View>

        {user && (
          <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
            <Icon name="log-out" size={20} color="#FF5252" />
            <Text style={styles.signOutText}>{t('signOut')}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  darkText: {
    color: '#FFFFFF',
  },
  darkSubText: {
    color: '#AAAAAA',
  },
  unauthContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  unauthTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 20,
  },
  unauthSub: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
    lineHeight: 24,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DB4437',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 32,
    elevation: 8,
    shadowColor: '#DB4437',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  googleIcon: {
    marginRight: 12,
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  authContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: '#0074E4',
    marginBottom: 16,
  },
  userName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  darkBox: {
    backgroundColor: '#1E1E1E',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0074E4',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
    marginTop: 8,
  },
  settingsList: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  settingLabel: {
    fontSize: 17,
    fontWeight: '500',
    color: '#333',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    gap: 8,
  },
  signOutText: {
    color: '#FF5252',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
