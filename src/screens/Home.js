// import React from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   BackHandler,
//   Alert,
//   Dimensions,
//   Platform,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/FontAwesome';
// import LinearGradient from 'react-native-linear-gradient';
// import {
//   widthPercentageToDP as wp,
//   heightPercentageToDP as hp,
// } from 'react-native-responsive-screen';
// import {useNavigation} from '@react-navigation/native';
// import Animated, {
//   useAnimatedStyle,
//   useSharedValue,
//   withSpring,
//   withTiming,
//   interpolate,
//   Extrapolate,
//   FadeInDown,
//   runOnJS,
// } from 'react-native-reanimated';
// import {useSafeAreaInsets} from 'react-native-safe-area-context';

// const {width, height} = Dimensions.get('window');
// const isSmallDevice = height < 700;

// // Enhanced spring configuration for smoother animations

// const SPRING_CONFIG = {
//   damping: 10,
//   mass: 0.5, // Reduced from 0.8
//   stiffness: 100, // Reduced from 150
// };

// // const SPRING_CONFIG = {
// //   damping: 15,
// //   mass: 0.8,
// //   stiffness: 150,
// //   overshootClamping: false,
// //   restSpeedThreshold: 0.3,
// //   restDisplacementThreshold: 0.3,
// // };

// const FONTS = {
//   title: isSmallDevice ? wp('7%') : wp('6%'),
//   sectionTitle: isSmallDevice ? wp('4.5%') : wp('4%'),
//   itemTitle: isSmallDevice ? wp('4%') : wp('3.5%'),
//   description: isSmallDevice ? wp('3.5%') : wp('3%'),
// };

// const SPACING = {
//   containerPadding: wp('5%'),
//   itemSpacing: isSmallDevice ? hp('1.5%') : hp('2%'),
//   sectionSpacing: isSmallDevice ? hp('2%') : hp('3%'),
//   iconSize: isSmallDevice ? wp('12%') : wp('10%'),
// };

// const Home = () => {
//   const navigation = useNavigation();
//   const insets = useSafeAreaInsets();

//   const scale = useSharedValue(1);
//   const menuItemsProgress = useSharedValue(0);

//   React.useEffect(() => {
//     menuItemsProgress.value = withTiming(1, {duration: 800});
//   }, []);

//   React.useEffect(() => {
//     const backHandler = BackHandler.addEventListener(
//       'hardwareBackPress',
//       handleBackPress,
//     );
//     return () => backHandler.remove();
//   }, []);

//   const handleBackPress = () => {
//     if (navigation.isFocused()) {
//       Alert.alert(
//         'Exit App',
//         'Are you sure you want to exit?',
//         [
//           {text: 'Cancel', style: 'cancel'},
//           {
//             text: 'Exit',
//             onPress: () => BackHandler.exitApp(),
//             style: 'destructive',
//           },
//         ],
//         {cancelable: false},
//       );
//       return true;
//     }
//     return false;
//   };

//   const navigateToScreen = React.useCallback(
//     screenName => {
//       navigation.navigate(screenName);
//     },
//     [navigation],
//   );

//   const handlePress = React.useCallback(
//     screenName => {
//       // Enhanced press animation
//       scale.value = withSpring(
//         0.97,
//         {
//           ...SPRING_CONFIG,
//           duration: 150,
//         },
//         () => {
//           scale.value = withSpring(
//             1,
//             {
//               ...SPRING_CONFIG,
//               duration: 150,
//             },
//             () => {
//               runOnJS(navigateToScreen)(screenName);
//             },
//           );
//         },
//       );
//     },
//     [navigateToScreen],
//   );

//   const getMenuItemStyle = index => {
//     return useAnimatedStyle(() => {
//       const translateY = interpolate(
//         menuItemsProgress.value,
//         [0, 1],
//         [50, 0],
//         Extrapolate.CLAMP,
//       );

//       const opacity = interpolate(
//         menuItemsProgress.value,
//         [0, 1],
//         [0, 1],
//         Extrapolate.CLAMP,
//       );

//       const delay = index * 50;

//       return {
//         opacity,
//         transform: [
//           {
//             translateY: withSpring(translateY, {
//               ...SPRING_CONFIG,
//               delay,
//             }),
//           },
//           {scale: scale.value},
//         ],
//       };
//     });
//   };

//   const AnimatedTouchableOpacity =
//     Animated.createAnimatedComponent(TouchableOpacity);

//   const MenuItem = React.memo(({icon, title, onPress, index, description}) => (
//     <AnimatedTouchableOpacity
//       style={[styles.item]}
//       onPress={onPress}
//       activeOpacity={0.95}>
//       <Animated.View style={[styles.itemContent, getMenuItemStyle(index)]}>
//         <LinearGradient
//           colors={
//             index % 2 === 0 ? ['#4A90E2', '#357ABD'] : ['#5C6BC0', '#3F51B5']
//           }
//           start={{x: 0, y: 0}}
//           end={{x: 1, y: 1}}
//           style={styles.gradientContainer}>
//           <View style={styles.iconContainer}>
//             <Icon name={icon} size={wp('6%')} color="#FFF" />
//           </View>
//           <View style={styles.textContainer}>
//             <Text style={styles.itemTitle}>{title}</Text>
//             {description && (
//               <Text style={styles.description}>{description}</Text>
//             )}
//           </View>
//           <Icon name="chevron-right" size={wp('4%')} color="#FFF" />
//         </LinearGradient>
//       </Animated.View>
//     </AnimatedTouchableOpacity>
//   ));

//   return (
//     <LinearGradient
//       colors={['#F8F9FF', '#E8EFFF']}
//       style={[styles.container, {paddingTop: insets.top || hp('2%')}]}>
//       <View style={styles.header}>
//         <LinearGradient
//           colors={['#4A90E2', '#357ABD']}
//           start={{x: 0, y: 0}}
//           end={{x: 1, y: 0}}
//           style={styles.headerGradient}>
//           <Animated.Text
//             entering={FadeInDown.delay(200).springify()}
//             style={styles.title}>
//             Welcome Back
//           </Animated.Text>
//         </LinearGradient>
//       </View>

//       <View style={styles.content}>
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Practice Tests</Text>
//           <MenuItem
//             icon="book"
//             title="CBT Test 1"
//             description="Practice questions for your first test"
//             onPress={() => handlePress('cbt1')}
//             index={0}
//           />
//           <MenuItem
//             icon="book"
//             title="CBT Test 2"
//             description="Additional practice questions"
//             onPress={() => handlePress('cbt2')}
//             index={1}
//           />
//         </View>

//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Resources</Text>
//           <MenuItem
//             icon="list-alt"
//             title="Syllabus"
//             description="View complete course content"
//             onPress={() => handlePress('syllabus')}
//             index={2}
//           />
//           <MenuItem
//             icon="question-circle"
//             title="Quiz"
//             description="Test your knowledge"
//             onPress={() => handlePress('Quiz')}
//             index={3}
//           />
//         </View>
//       </View>
//     </LinearGradient>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   header: {
//     marginBottom: SPACING.containerPadding,
//   },
//   headerGradient: {
//     paddingVertical: SPACING.containerPadding,
//     paddingHorizontal: SPACING.containerPadding,
//     borderBottomLeftRadius: 20,
//     borderBottomRightRadius: 20,
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: {width: 0, height: 4},
//         shadowOpacity: 0.15,
//         shadowRadius: 8,
//       },
//       android: {
//         elevation: 8,
//       },
//     }),
//   },
//   title: {
//     fontSize: FONTS.title,
//     fontWeight: 'bold',
//     color: '#FFF',
//     textAlign: 'left',
//   },
//   content: {
//     flex: 1,
//     paddingHorizontal: SPACING.containerPadding,
//     paddingTop: SPACING.sectionSpacing,
//   },
//   section: {
//     marginBottom: SPACING.sectionSpacing * 1.5,
//   },
//   sectionTitle: {
//     fontSize: FONTS.sectionTitle,
//     fontWeight: '600',
//     color: '#357ABD',
//     marginBottom: SPACING.itemSpacing,
//     paddingLeft: wp('2%'),
//   },
//   item: {
//     marginBottom: SPACING.itemSpacing,
//     borderRadius: 16,
//     overflow: 'hidden',
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: {width: 0, height: 4},
//         shadowOpacity: 0.15,
//         shadowRadius: 8,
//       },
//       android: {
//         elevation: 8,
//       },
//     }),
//   },
//   gradientContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: SPACING.itemSpacing,
//     minHeight: SPACING.iconSize * 1.2,
//   },
//   itemContent: {
//     backgroundColor: 'transparent',
//   },
//   iconContainer: {
//     width: SPACING.iconSize,
//     height: SPACING.iconSize,
//     borderRadius: SPACING.iconSize / 2,
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   textContainer: {
//     flex: 1,
//     marginHorizontal: wp('3%'),
//   },
//   itemTitle: {
//     fontSize: FONTS.itemTitle,
//     fontWeight: '600',
//     color: '#FFF',
//     marginBottom: 4,
//   },
//   description: {
//     fontSize: FONTS.description,
//     color: 'rgba(255, 255, 255, 0.9)',
//   },
// });

// export default Home;

import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  BackHandler,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {BannerAd, BannerAdSize} from 'react-native-google-mobile-ads';

const isSmallDevice = hp('100%') < 700;

const FONTS = {
  title: isSmallDevice ? wp('7%') : wp('6%'),
  sectionTitle: isSmallDevice ? wp('4.5%') : wp('4%'),
  itemTitle: isSmallDevice ? wp('4%') : wp('3.5%'),
  description: isSmallDevice ? wp('3.5%') : wp('3%'),
};

const SPACING = {
  containerPadding: wp('5%'),
  itemSpacing: isSmallDevice ? hp('1.5%') : hp('2%'),
  sectionSpacing: isSmallDevice ? hp('2%') : hp('3%'),
  iconSize: isSmallDevice ? wp('12%') : wp('10%'),
};

const MenuItem = React.memo(({icon, title, onPress, description}) => (
  <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.7}>
    <LinearGradient
      colors={['#4A90E2', '#357ABD']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.gradientContainer}>
      <View style={styles.iconContainer}>
        <Icon name={icon} size={wp('6%')} color="#FFF" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.itemTitle}>{title}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
      <Icon name="chevron-right" size={wp('4%')} color="#FFF" />
    </LinearGradient>
  </TouchableOpacity>
));

const Home = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [exitModalVisible, setExitModalVisible] = useState(false);

  React.useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );
    return () => backHandler.remove();
  }, []);

  // const handleBackPress = () => {
  //   if (navigation.isFocused()) {
  //     Alert.alert(
  //       'Exit App',
  //       'Are you sure you want to exit?',
  //       [
  //         {text: 'Cancel', style: 'cancel'},
  //         {
  //           text: 'Exit',
  //           onPress: () => BackHandler.exitApp(),
  //           style: 'destructive',
  //         },
  //       ],
  //       {cancelable: false},
  //     );
  //     return true;
  //   }
  //   return false;
  // };

  const handleBackPress = () => {
    if (navigation.isFocused()) {
      setExitModalVisible(true);
      return true;
    }
    return false;
  };

  const handleExit = () => {
    BackHandler.exitApp();
  };

  const handleNavigation = React.useCallback(
    screenName => {
      requestAnimationFrame(() => {
        navigation.navigate(screenName);
      });
    },
    [navigation],
  );

  const menuItems = React.useMemo(
    () => [
      {
        section: 'Practice Tests',
        items: [
          {
            icon: 'book',
            title: 'CBT Test 1',
            description: 'Practice questions for your first test',
            screen: 'cbt1',
          },
          {
            icon: 'book',
            title: 'CBT Test 2',
            description: 'Additional practice questions',
            screen: 'cbt2',
          },
        ],
      },
      {
        section: 'Resources',
        items: [
          {
            icon: 'list-alt',
            title: 'Syllabus',
            description: 'View complete course content',
            screen: 'syllabus',
          },
          {
            icon: 'question-circle',
            title: 'Quiz',
            description: 'Test your knowledge',
            screen: 'Quiz',
          },
        ],
      },
    ],
    [],
  );

  return (
    <LinearGradient
      colors={['#F8F9FF', '#E8EFFF']}
      style={[styles.container, {paddingTop: insets.top || hp('2%')}]}>
      <View style={styles.header}>
        <LinearGradient
          colors={['#4A90E2', '#357ABD']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.headerGradient}>
          <Text style={styles.title}>Welcome Back</Text>
        </LinearGradient>
      </View>

      <View style={styles.content}>
        {menuItems.map((section, sectionIndex) => (
          <View key={section.section} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.section}</Text>
            {section.items.map((item, itemIndex) => (
              <MenuItem
                key={`${sectionIndex}-${itemIndex}`}
                icon={item.icon}
                title={item.title}
                description={item.description}
                onPress={() => handleNavigation(item.screen)}
              />
            ))}
          </View>
        ))}
      </View>
      <View style={styles.bannerContainer}>
        <BannerAd
          unitId="ca-app-pub-2627956667785383/2550120291"
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
        />
      </View>
      {/* <Modal
        visible={exitModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setExitModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Exit App</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to exit?
            </Text>

            <BannerAd
              unitId="ca-app-pub-2627956667785383/7596247624"
              size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
              requestOptions={{
                requestNonPersonalizedAdsOnly: true,
              }}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setExitModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
                <Text style={styles.buttonText}>Exit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal> */}
      <Modal
        visible={exitModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setExitModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Exit App</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to exit?
            </Text>

            <View style={styles.bannerContainer1}>
              <BannerAd
                unitId="ca-app-pub-2627956667785383/7596247624"
                size={BannerAdSize.MEDIUM_RECTANGLE}
                requestOptions={{
                  requestNonPersonalizedAdsOnly: true,
                }}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setExitModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
                <Text style={styles.buttonText}>Exit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: SPACING.containerPadding,
  },
  headerGradient: {
    paddingVertical: SPACING.containerPadding,
    paddingHorizontal: SPACING.containerPadding,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  title: {
    fontSize: FONTS.title,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'left',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.containerPadding,
    paddingTop: SPACING.sectionSpacing,
  },
  section: {
    marginBottom: SPACING.sectionSpacing * 1.5,
  },
  sectionTitle: {
    fontSize: FONTS.sectionTitle,
    fontWeight: '600',
    color: '#357ABD',
    marginBottom: SPACING.itemSpacing,
    paddingLeft: wp('2%'),
  },
  item: {
    marginBottom: SPACING.itemSpacing,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  gradientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.itemSpacing,
    minHeight: SPACING.iconSize * 1.2,
  },
  iconContainer: {
    width: SPACING.iconSize,
    height: SPACING.iconSize,
    borderRadius: SPACING.iconSize / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginHorizontal: wp('3%'),
  },
  itemTitle: {
    fontSize: FONTS.itemTitle,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  description: {
    fontSize: FONTS.description,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  bannerContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: wp('80%'),
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
  },
  modalMessage: {
    fontSize: wp('4%'),
    marginBottom: 20,
    textAlign: 'center',
    color: 'black',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#357ABD',
    borderRadius: 5,
    marginRight: 5,
  },
  exitButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    borderRadius: 5,
    marginLeft: 5,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  bannerContainer1: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20, // Adds space between the ad and the buttons
  },
});

export default React.memo(Home);
