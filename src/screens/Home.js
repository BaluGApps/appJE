// import React from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   BackHandler,
//   Alert,
//   Dimensions,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/FontAwesome';
// import {
//   widthPercentageToDP as wp,
//   heightPercentageToDP as hp,
// } from 'react-native-responsive-screen';
// import {useNavigation} from '@react-navigation/native';
// import Animated, {
//   useAnimatedStyle,
//   useSharedValue,
//   withSpring,
//   withDelay,
//   withTiming,
//   interpolate,
//   Extrapolate,
//   FadeIn,
//   FadeInDown,
// } from 'react-native-reanimated';
// import {BlurView} from '@react-native-community/blur';
// import {useSafeAreaInsets} from 'react-native-safe-area-context';

// const {width} = Dimensions.get('window');

// const AnimatedTouchableOpacity =
//   Animated.createAnimatedComponent(TouchableOpacity);

// const SPRING_CONFIG = {
//   damping: 15,
//   mass: 1,
//   stiffness: 100,
// };

// const Home = () => {
//   const navigation = useNavigation();
//   const insets = useSafeAreaInsets();

//   // Shared values for animations
//   const scale = useSharedValue(1);
//   const backgroundY = useSharedValue(0);
//   const menuItemsProgress = useSharedValue(0);

//   React.useEffect(() => {
//     backgroundY.value = withSpring(-100, SPRING_CONFIG);
//     menuItemsProgress.value = withTiming(1, {duration: 1000});
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

//   const handlePress = screenName => {
//     scale.value = withSpring(0.95, SPRING_CONFIG);
//     setTimeout(() => {
//       scale.value = withSpring(1, SPRING_CONFIG);
//       navigation.navigate(screenName);
//     }, 200);
//   };

//   const backgroundStyle = useAnimatedStyle(() => ({
//     transform: [{translateY: backgroundY.value}],
//   }));

//   const getMenuItemStyle = index => {
//     return useAnimatedStyle(() => {
//       const translateY = interpolate(
//         menuItemsProgress.value,
//         [0, 1],
//         [100, 0],
//         Extrapolate.CLAMP,
//       );

//       const opacity = interpolate(
//         menuItemsProgress.value,
//         [0, 1],
//         [0, 1],
//         Extrapolate.CLAMP,
//       );

//       return {
//         opacity,
//         transform: [
//           {translateY},
//           {scale: withSpring(scale.value, SPRING_CONFIG)},
//         ],
//       };
//     });
//   };

//   const MenuItem = ({icon, title, onPress, index}) => (
//     <AnimatedTouchableOpacity
//       style={[styles.item, getMenuItemStyle(index)]}
//       onPress={onPress}>
//       <BlurView
//         style={styles.blurContainer}
//         blurType="light"
//         blurAmount={10}
//         reducedTransparencyFallbackColor="white">
//         <Icon name={icon} size={wp('8%')} color="#1E90FF" />
//         <Text style={styles.itemText}>{title}</Text>
//       </BlurView>
//     </AnimatedTouchableOpacity>
//   );

//   return (
//     <View style={[styles.container, {paddingTop: insets.top}]}>
//       <Animated.View style={[styles.backgroundCircle, backgroundStyle]} />

//       <Animated.Text
//         entering={FadeInDown.delay(200).springify()}
//         style={styles.title}>
//         Welcome Back
//       </Animated.Text>

//       <View style={styles.menuContainer}>
//         <MenuItem
//           icon="book"
//           title="CBT 1"
//           onPress={() => handlePress('cbt1')}
//           index={0}
//         />
//         <MenuItem
//           icon="book"
//           title="CBT 2"
//           onPress={() => handlePress('cbt2')}
//           index={1}
//         />
//         <MenuItem
//           icon="list-alt"
//           title="Syllabus"
//           onPress={() => handlePress('Syllabus')}
//           index={2}
//         />
//         <MenuItem
//           icon="question-circle"
//           title="Quiz"
//           onPress={() => handlePress('Quiz')}
//           index={3}
//         />
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F8F9FF',
//   },
//   backgroundCircle: {
//     position: 'absolute',
//     top: -300,
//     left: -100,
//     width: width + 200,
//     height: width + 200,
//     borderRadius: (width + 200) / 2,
//     backgroundColor: '#1E90FF',
//     opacity: 0.1,
//   },
//   title: {
//     fontSize: wp('8%'),
//     fontWeight: 'bold',
//     color: '#1E90FF',
//     textAlign: 'center',
//     marginTop: hp('5%'),
//     marginBottom: hp('5%'),
//   },
//   menuContainer: {
//     flex: 1,
//     paddingHorizontal: wp('5%'),
//     justifyContent: 'center',
//   },
//   item: {
//     marginVertical: hp('1.5%'),
//     borderRadius: 15,
//     overflow: 'hidden',
//   },
//   blurContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: wp('5%'),
//     backgroundColor: 'rgba(255, 255, 255, 0.8)',
//   },
//   itemText: {
//     marginLeft: wp('5%'),
//     fontSize: wp('5%'),
//     fontWeight: '600',
//     color: '#1E90FF',
//   },
// });

// export default Home;
//***** above is animated */

//**********BELOW CODE IS WORKING FINE WITHOUT NAVIGATION */
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

// const AnimatedTouchableOpacity =
//   Animated.createAnimatedComponent(TouchableOpacity);

// const SPRING_CONFIG = {
//   damping: 12,
//   mass: 1,
//   stiffness: 100,
// };

// // Standard font sizes based on device size
// const FONTS = {
//   title: isSmallDevice ? wp('7%') : wp('6%'),
//   sectionTitle: isSmallDevice ? wp('4.5%') : wp('4%'),
//   itemTitle: isSmallDevice ? wp('4%') : wp('3.5%'),
//   description: isSmallDevice ? wp('3.5%') : wp('3%'),
// };

// // Standard spacing based on device size
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
//   const backgroundY = useSharedValue(0);
//   const menuItemsProgress = useSharedValue(0);

//   // Initialize animations
//   React.useEffect(() => {
//     backgroundY.value = withSpring(-100, SPRING_CONFIG);
//     menuItemsProgress.value = withTiming(1, {duration: 800});
//   }, []);

//   // Handle back button
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

//   // Navigation handler with animation
//   const navigateToScreen = React.useCallback(
//     screenName => {
//       console.log('Navigating to screen:', screenName);
//       navigation.navigate(screenName);
//     },
//     [navigation],
//   );

//     const handlePress = React.useCallback(
//       screenName => {
//         'worklet';
//         scale.value = withSpring(0.95, SPRING_CONFIG);
//         scale.value = withSpring(1, {
//           ...SPRING_CONFIG,
//           callback: finished => {
//             if (finished) {
//               runOnJS(navigateToScreen)(screenName);
//             }
//           },
//         });
//       },
//       [navigateToScreen],
//     );

//   const getMenuItemStyle = index => {
//     return useAnimatedStyle(() => {
//       'worklet';
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

//       return {
//         opacity,
//         transform: [
//           {
//             translateY: withSpring(translateY, {
//               ...SPRING_CONFIG,
//               delay: index * 100,
//             }),
//           },
//           {scale: scale.value},
//         ],
//       };
//     });
//   };

//   const MenuItem = React.memo(({icon, title, onPress, index, description}) => (
//     <AnimatedTouchableOpacity
//       style={[styles.item, getMenuItemStyle(index)]}
//       onPress={onPress}
//       activeOpacity={0.7}>
//       <View style={styles.itemContent}>
//         <View style={styles.iconContainer}>
//           <Icon name={icon} size={wp('6%')} color="#1E90FF" />
//         </View>
//         <View style={styles.textContainer}>
//           <Text style={styles.itemTitle}>{title}</Text>
//           {description && <Text style={styles.description}>{description}</Text>}
//         </View>
//         <Icon name="chevron-right" size={wp('4%')} color="#1E90FF" />
//       </View>
//     </AnimatedTouchableOpacity>
//   ));

//   return (
//     <View style={[styles.container, {paddingTop: insets.top || hp('2%')}]}>
//       <View style={styles.header}>
//         <Animated.Text
//           entering={FadeInDown.delay(200).springify()}
//           style={styles.title}>
//           Welcome Back
//         </Animated.Text>
//       </View>

//       <View style={styles.content}>
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Practice Tests</Text>
//           <MenuItem
//             icon="book"
//             title="CBT Test 1"
//             description="Practice questions for your first test"
//             onPress={() => handlePress(cbt1)}
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
//             onPress={() => handlePress('Syllabus')}
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
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F8F9FF',
//   },
//   header: {
//     paddingVertical: SPACING.containerPadding,
//     paddingHorizontal: SPACING.containerPadding,
//     backgroundColor: '#FFF',
//     borderBottomWidth: 1,
//     borderBottomColor: 'rgba(0,0,0,0.05)',
//   },
//   title: {
//     fontSize: FONTS.title,
//     fontWeight: 'bold',
//     color: '#1E90FF',
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
//     color: '#555',
//     marginBottom: SPACING.itemSpacing,
//     paddingLeft: wp('2%'),
//   },
//   item: {
//     marginBottom: SPACING.itemSpacing,
//     backgroundColor: '#FFF',
//     borderRadius: 12,
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: {width: 0, height: 2},
//         shadowOpacity: 0.1,
//         shadowRadius: 3,
//       },
//       android: {
//         elevation: 3,
//       },
//     }),
//   },
//   itemContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: SPACING.itemSpacing,
//     minHeight: SPACING.iconSize * 1.2,
//   },
//   iconContainer: {
//     width: SPACING.iconSize,
//     height: SPACING.iconSize,
//     borderRadius: SPACING.iconSize / 2,
//     backgroundColor: 'rgba(30, 144, 255, 0.1)',
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
//     color: '#1E90FF',
//     marginBottom: 4,
//   },
//   description: {
//     fontSize: FONTS.description,
//     color: '#666',
//   },
// });

// export default Home;

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  BackHandler,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useNavigation} from '@react-navigation/native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
  FadeInDown,
  runOnJS,
} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const {width, height} = Dimensions.get('window');
const isSmallDevice = height < 700;

const SPRING_CONFIG = {
  damping: 12,
  mass: 1,
  stiffness: 100,
};

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

const Home = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const scale = useSharedValue(1);
  const menuItemsProgress = useSharedValue(0);

  React.useEffect(() => {
    menuItemsProgress.value = withTiming(1, {duration: 800});
  }, []);

  React.useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );
    return () => backHandler.remove();
  }, []);

  const handleBackPress = () => {
    if (navigation.isFocused()) {
      Alert.alert(
        'Exit App',
        'Are you sure you want to exit?',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Exit',
            onPress: () => BackHandler.exitApp(),
            style: 'destructive',
          },
        ],
        {cancelable: false},
      );
      return true;
    }
    return false;
  };

  const navigateToScreen = React.useCallback(
    screenName => {
      console.log('Navigating to screen:', screenName);
      navigation.navigate(screenName);
    },
    [navigation],
  );

  const handlePress = React.useCallback(
    screenName => {
      scale.value = withSpring(0.95, SPRING_CONFIG, () => {
        scale.value = withSpring(1, SPRING_CONFIG, () => {
          runOnJS(navigateToScreen)(screenName);
        });
      });
    },
    [navigateToScreen],
  );

  const getMenuItemStyle = index => {
    return useAnimatedStyle(() => {
      const translateY = interpolate(
        menuItemsProgress.value,
        [0, 1],
        [50, 0],
        Extrapolate.CLAMP,
      );

      const opacity = interpolate(
        menuItemsProgress.value,
        [0, 1],
        [0, 1],
        Extrapolate.CLAMP,
      );

      return {
        opacity,
        transform: [{translateY}, {scale: scale.value}],
      };
    });
  };

  const MenuItem = React.memo(({icon, title, onPress, index, description}) => (
    <TouchableOpacity
      style={[styles.item]}
      onPress={onPress}
      activeOpacity={0.7}>
      <Animated.View style={[styles.itemContent, getMenuItemStyle(index)]}>
        <View style={styles.iconContainer}>
          <Icon name={icon} size={wp('6%')} color="#1E90FF" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.itemTitle}>{title}</Text>
          {description && <Text style={styles.description}>{description}</Text>}
        </View>
        <Icon name="chevron-right" size={wp('4%')} color="#1E90FF" />
      </Animated.View>
    </TouchableOpacity>
  ));

  return (
    <View style={[styles.container, {paddingTop: insets.top || hp('2%')}]}>
      <View style={styles.header}>
        <Animated.Text
          entering={FadeInDown.delay(200).springify()}
          style={styles.title}>
          Welcome Back
        </Animated.Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Practice Tests</Text>
          <MenuItem
            icon="book"
            title="CBT Test 1"
            description="Practice questions for your first test"
            onPress={() => handlePress('cbt1')}
            index={0}
          />
          <MenuItem
            icon="book"
            title="CBT Test 2"
            description="Additional practice questions"
            onPress={() => handlePress('cbt2')}
            index={1}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resources</Text>
          <MenuItem
            icon="list-alt"
            title="Syllabus"
            description="View complete course content"
            onPress={() => handlePress('Syllabus')}
            index={2}
          />
          <MenuItem
            icon="question-circle"
            title="Quiz"
            description="Test your knowledge"
            onPress={() => handlePress('Quiz')}
            index={3}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FF',
  },
  header: {
    paddingVertical: SPACING.containerPadding,
    paddingHorizontal: SPACING.containerPadding,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  title: {
    fontSize: FONTS.title,
    fontWeight: 'bold',
    color: '#1E90FF',
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
    color: '#555',
    marginBottom: SPACING.itemSpacing,
    paddingLeft: wp('2%'),
  },
  item: {
    marginBottom: SPACING.itemSpacing,
    backgroundColor: '#FFF',
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.itemSpacing,
    minHeight: SPACING.iconSize * 1.2,
  },
  iconContainer: {
    width: SPACING.iconSize,
    height: SPACING.iconSize,
    borderRadius: SPACING.iconSize / 2,
    backgroundColor: 'rgba(30, 144, 255, 0.1)',
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
    color: '#1E90FF',
    marginBottom: 4,
  },
  description: {
    fontSize: FONTS.description,
    color: '#666',
  },
});

export default Home;
