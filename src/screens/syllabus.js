import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {BannerAd, BannerAdSize, TestIds} from 'react-native-google-mobile-ads';

const Syllabus = () => {
  const [syllabusData, setSyllabusData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTopicId, setExpandedTopicId] = useState(null);

  useEffect(() => {
    fetchSyllabusData();
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
    setExpandedTopicId(prevId =>
      prevId === selectedTopicId ? null : selectedTopicId,
    );
  };

  const renderItem = ({item}) => (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => handleTopicPress(item.id)}>
        <View style={styles.topicContainer}>
          <Text style={styles.topicTitle}>{item.topic}</Text>
          <MaterialCommunityIcons
            name={expandedTopicId === item.id ? 'chevron-up' : 'chevron-down'}
            size={wp('5%')}
            color="#0074E4"
          />
        </View>
      </TouchableOpacity>
      {expandedTopicId === item.id && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>{item.description}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#0074E4"
          style={styles.loadingIndicator}
        />
      ) : (
        <>
          <FlatList
            data={syllabusData}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
          />
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              width: '80%',
              height: '10%',
            }}>
            <BannerAd
              unitId="ca-app-pub-2627956667785383/2550120291"
              size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
              requestOptions={{
                requestNonPersonalizedAdsOnly: true,
              }}
              onAdLoaded={() => {
                console.log('Ad loaded!');
              }}
              onAdFailedToLoad={error => {
                console.error('Ad failed to load: ', error);
              }}
              // style={styles.bannerAd}
            />
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    padding: wp('2%'),
  },
  card: {
    backgroundColor: 'white',
    borderRadius: wp('2%'),
    padding: wp('4%'),
    marginVertical: wp('2%'),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  topicContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topicTitle: {
    fontSize: wp('4.3%'),
    fontFamily: 'Poppins',
    fontWeight: 'bold',
    color: '#0074E4',
  },
  descriptionContainer: {
    paddingTop: wp('3%'),
  },
  descriptionText: {
    fontSize: wp('3.9%'),
    color: '#333',
    fontFamily: 'Poppins',
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerAd: {
    alignSelf: 'center',
    width: '100%',
    height: hp('10%'), // Adjust height as needed
  },
});

export default Syllabus;
