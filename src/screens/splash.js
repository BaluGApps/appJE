import React, { useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Dimensions, 
  Animated, 
  Text, 
  StatusBar,
  Easing
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const Splash = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      })
    ]).start();

    // Check for existing language preference and navigate
    const checkUserStatus = async () => {
      try {
        const lang = await AsyncStorage.getItem('settings.lang');
        
        // Wait for 2.5 seconds total for splash experience
        setTimeout(() => {
          if (lang) {
            navigation.replace('MainTabs');
          } else {
            navigation.replace('LanguageSelection');
          }
        }, 2500);
      } catch (error) {
        console.error('Splash error:', error);
        navigation.replace('LanguageSelection');
      }
    };

    checkUserStatus();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={['#0F172A', '#1E293B', '#0F172A']}
        style={styles.background}>
        
        {/* Decorative elements */}
        <View style={styles.blurCircle1} />
        <View style={styles.blurCircle2} />

        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim }
              ]
            }
          ]}>
          
          <View style={styles.logoContainer}>
              <Icon name="train" size={80} color="#38BDF8" />
              <View style={styles.logoOverlay} />
          </View>

          <Text style={styles.title}>RailAspirant</Text>
          <View style={styles.divider} />
          <Text style={styles.subtitle}>Empowering Indian Students 🇮🇳</Text>
          
          <View style={styles.loaderContainer}>
              <Animated.View style={[styles.loaderBar, { width: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%']
              }) }]} />
          </View>
        </Animated.View>

        <Text style={styles.footerText}>Version 2.0 • Phase 3</Text>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurCircle1: {
      position: 'absolute',
      width: width * 0.8,
      height: width * 0.8,
      borderRadius: width * 0.4,
      backgroundColor: 'rgba(56, 189, 248, 0.05)',
      top: -100,
      left: -100,
  },
  blurCircle2: {
      position: 'absolute',
      width: width * 0.6,
      height: width * 0.6,
      borderRadius: width * 0.3,
      backgroundColor: 'rgba(56, 189, 248, 0.03)',
      bottom: -50,
      right: -50,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 140,
    height: 140,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    elevation: 20,
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  logoOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(56, 189, 248, 0.02)',
      borderRadius: 40,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  divider: {
      width: 40,
      height: 4,
      backgroundColor: '#38BDF8',
      borderRadius: 2,
      marginVertical: 15,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '500',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  loaderContainer: {
      width: 150,
      height: 2,
      backgroundColor: 'rgba(255,255,255,0.1)',
      marginTop: 40,
      borderRadius: 1,
      overflow: 'hidden',
  },
  loaderBar: {
      height: '100%',
      backgroundColor: '#38BDF8',
  },
  footerText: {
      position: 'absolute',
      bottom: 40,
      color: '#475569',
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: 1,
  }
});

export default Splash;
