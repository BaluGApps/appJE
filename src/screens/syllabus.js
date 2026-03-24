import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {BannerAd, BannerAdSize} from 'react-native-google-mobile-ads';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';

const Syllabus = () => {
  const [syllabusData, setSyllabusData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTopicId, setExpandedTopicId] = useState(null);
  const rotateAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchSyllabusData();
    // Initial fade-in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const fetchSyllabusData = async () => {
    try {
      const response = await fetch(
        'https://apije.pythonanywhere.com/exam/api/syllabus/',
      );
      const data = await response.json();
      setSyllabusData(data);
    } catch (error) {
      console.error('Error fetching syllabus data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTopicPress = selectedTopicId => {
    setExpandedTopicId(prevId => {
      const newValue = prevId === selectedTopicId ? null : selectedTopicId;
      // Rotate animation
      Animated.timing(rotateAnimation, {
        toValue: newValue === selectedTopicId ? 1 : 0,
        duration: 300,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }).start();
      return newValue;
    });
  };

  const renderItem = ({item, index}) => {
    const spin = rotateAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    });

    return (
      <Animatable.View
        animation="fadeInUp"
        delay={index * 100}
        duration={500}
        style={styles.cardContainer}>
        <LinearGradient
          colors={['#ffffff', '#f8f9ff']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.card}>
          <TouchableOpacity
            onPress={() => handleTopicPress(item.id)}
            activeOpacity={0.8}>
            <View style={styles.topicContainer}>
              <View style={styles.titleContainer}>
                <MaterialCommunityIcons
                  name="book-open-variant"
                  size={wp('5%')}
                  color="#0074E4"
                  style={styles.topicIcon}
                />
                <Text style={styles.topicTitle}>{item.topic}</Text>
              </View>
              <Animated.View style={{transform: [{rotate: spin}]}}>
                <MaterialCommunityIcons
                  name="chevron-down"
                  size={wp('5%')}
                  color="#0074E4"
                />
              </Animated.View>
            </View>
          </TouchableOpacity>
          {expandedTopicId === item.id && (
            <Animatable.View
              animation="fadeIn"
              duration={300}
              style={styles.descriptionContainer}>
              <LinearGradient
                colors={['#f0f4ff', '#ffffff']}
                style={styles.descriptionGradient}>
                <Text style={styles.descriptionText}>{item.description}</Text>
              </LinearGradient>
            </Animatable.View>
          )}
        </LinearGradient>
      </Animatable.View>
    );
  };

  return (
    <LinearGradient colors={['#f0f4ff', '#ffffff']} style={styles.container}>
      {loading ? (
        <Animatable.View
          animation="pulse"
          easing="ease-out"
          iterationCount="infinite">
          <ActivityIndicator
            size="large"
            color="#0074E4"
            style={styles.loadingIndicator}
          />
        </Animatable.View>
      ) : (
        <Animated.View style={{opacity: fadeAnim, flex: 1}}>
          <FlatList
            data={syllabusData}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
          <View style={styles.bannerContainer}>
            <BannerAd
              unitId="ca-app-pub-2627956667785383/2550120291"
              size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
              requestOptions={{
                requestNonPersonalizedAdsOnly: true,
              }}
            />
          </View>
        </Animated.View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: wp('2%'),
  },
  listContainer: {
    paddingBottom: hp('12%'), // Space for banner ad
  },
  cardContainer: {
    marginVertical: wp('2%'),
    borderRadius: wp('3%'),
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  card: {
    borderRadius: wp('3%'),
    overflow: 'hidden',
  },
  topicContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp('4%'),
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  topicIcon: {
    marginRight: wp('2%'),
  },
  topicTitle: {
    fontSize: wp('4.3%'),
    fontFamily: 'Poppins',
    fontWeight: '600',
    color: '#0074E4',
    flex: 1,
  },
  descriptionContainer: {
    overflow: 'hidden',
  },
  descriptionGradient: {
    padding: wp('4%'),
    paddingTop: 0,
  },
  descriptionText: {
    fontSize: wp('3.9%'),
    color: '#333',
    fontFamily: 'Poppins',
    lineHeight: wp('5.5%'),
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp('30%'),
  },
  bannerContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});

export default Syllabus;
