// import React, {useEffect} from 'react';
// import {
//   View,
//   StyleSheet,
//   Image,
//   Dimensions,
//   Animated,
//   Text,
// } from 'react-native';
// import LinearGradient from 'react-native-linear-gradient';

// const {width, height} = Dimensions.get('window');

// const Splash = ({navigation}) => {
//   const fadeAnim = new Animated.Value(0);
//   const slideAnim = new Animated.Value(-width);

//   useEffect(() => {
//     // Animate the train and fade in the content
//     Animated.parallel([
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 2000,
//         useNativeDriver: true,
//       }),
//       Animated.timing(slideAnim, {
//         toValue: width,
//         duration: 4000,
//         useNativeDriver: true,
//       }),
//     ]).start();

//     // Navigate to main screen after 5 seconds
//     setTimeout(() => {
//       navigation.replace('Navigation');
//     }, 5000);
//   }, []);

//   return (
//     <View style={styles.container}>
//       <LinearGradient
//         colors={['#1a2a6c', '#b21f1f', '#fdbb2d']}
//         style={styles.background}>
//         {/* Train tracks */}
//         <View style={styles.tracks}>
//           <View style={styles.track} />
//           <View style={styles.track} />
//         </View>

//         {/* Animated train */}
//         <Animated.View
//           style={[
//             styles.trainContainer,
//             {
//               transform: [{translateX: slideAnim}],
//             },
//           ]}>
//           {/* Simple train shape using Views */}
//           <View style={styles.train}>
//             <View style={styles.engine}>
//               <View style={styles.cabin} />
//               <View style={styles.chimney} />
//             </View>
//             <View style={styles.wagon} />
//             <View style={styles.wagon} />
//           </View>
//         </Animated.View>

//         {/* App title */}
//         <Animated.View
//           style={[
//             styles.titleContainer,
//             {
//               opacity: fadeAnim,
//             },
//           ]}>
//           <Text style={styles.title}>TrainApp</Text>
//           <Text style={styles.subtitle}>Your Journey Begins Here</Text>
//         </Animated.View>
//       </LinearGradient>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   background: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   tracks: {
//     position: 'absolute',
//     bottom: height * 0.2,
//     flexDirection: 'row',
//     width: width,
//     justifyContent: 'center',
//     paddingHorizontal: 20,
//   },
//   track: {
//     height: 8,
//     backgroundColor: '#463E3F',
//     width: width,
//     marginHorizontal: 20,
//   },
//   trainContainer: {
//     position: 'absolute',
//     bottom: height * 0.25,
//     flexDirection: 'row',
//   },
//   train: {
//     flexDirection: 'row',
//     alignItems: 'flex-end',
//   },
//   engine: {
//     width: 100,
//     height: 60,
//     backgroundColor: '#2C3E50',
//     borderRadius: 10,
//     marginRight: 5,
//   },
//   cabin: {
//     width: 40,
//     height: 30,
//     backgroundColor: '#34495E',
//     position: 'absolute',
//     top: -20,
//     right: 10,
//     borderRadius: 5,
//   },
//   chimney: {
//     width: 15,
//     height: 25,
//     backgroundColor: '#7F8C8D',
//     position: 'absolute',
//     top: -35,
//     left: 20,
//     borderRadius: 3,
//   },
//   wagon: {
//     width: 80,
//     height: 50,
//     backgroundColor: '#E74C3C',
//     borderRadius: 8,
//     marginRight: 5,
//   },
//   titleContainer: {
//     position: 'absolute',
//     top: height * 0.3,
//     alignItems: 'center',
//   },
//   title: {
//     fontSize: 48,
//     fontWeight: 'bold',
//     color: '#FFFFFF',
//     textShadowColor: 'rgba(0, 0, 0, 0.75)',
//     textShadowOffset: {width: 2, height: 2},
//     textShadowRadius: 5,
//   },
//   subtitle: {
//     fontSize: 18,
//     color: '#FFFFFF',
//     marginTop: 10,
//     textShadowColor: 'rgba(0, 0, 0, 0.75)',
//     textShadowOffset: {width: 1, height: 1},
//     textShadowRadius: 3,
//   },
// });

// export default Splash;

import React, {useEffect} from 'react';
import {View, StyleSheet, Dimensions, Animated, Text} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const {width, height} = Dimensions.get('window');

const Splash = ({navigation}) => {
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(-width);

  useEffect(() => {
    // Animate the train and fade in the content
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 4000,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate to main screen after 5 seconds
    setTimeout(() => {
      navigation.replace('Navigation');
    }, 5000);
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a2a6c', '#2575fc', '#6a11cb']}
        style={styles.background}>
        {/* Train tracks */}
        <View style={styles.tracks}>
          <View style={styles.track} />
          <View style={styles.track} />
        </View>

        {/* Animated train */}
        <Animated.View
          style={[
            styles.trainContainer,
            {
              transform: [{translateX: slideAnim}],
            },
          ]}>
          {/* Simple train shape using Views */}
          <View style={styles.train}>
            <View style={styles.engine}>
              <View style={styles.cabin} />
              <View style={styles.chimney} />
            </View>
            <View style={styles.wagon} />
            <View style={styles.wagon} />
          </View>
        </Animated.View>

        {/* App title */}
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: fadeAnim,
            },
          ]}>
          <Text style={styles.title}>RRB JE </Text>
          <Text style={styles.subtitle}>Your Path to Success Starts Here</Text>
        </Animated.View>
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
  tracks: {
    position: 'absolute',
    bottom: height * 0.2,
    flexDirection: 'row',
    width: width,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  track: {
    height: 8,
    backgroundColor: '#463E3F',
    width: width,
    marginHorizontal: 20,
  },
  trainContainer: {
    position: 'absolute',
    bottom: height * 0.25,
    flexDirection: 'row',
  },
  train: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  engine: {
    width: 100,
    height: 60,
    backgroundColor: '#2C3E50',
    borderRadius: 10,
    marginRight: 5,
  },
  cabin: {
    width: 40,
    height: 30,
    backgroundColor: '#34495E',
    position: 'absolute',
    top: -20,
    right: 10,
    borderRadius: 5,
  },
  chimney: {
    width: 15,
    height: 25,
    backgroundColor: '#7F8C8D',
    position: 'absolute',
    top: -35,
    left: 20,
    borderRadius: 3,
  },
  wagon: {
    width: 80,
    height: 50,
    backgroundColor: '#E74C3C',
    borderRadius: 8,
    marginRight: 5,
  },
  titleContainer: {
    position: 'absolute',
    top: height * 0.3,
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: 2, height: 2},
    textShadowRadius: 5,
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 3,
  },
});

export default Splash;
