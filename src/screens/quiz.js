import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {CommonActions, useNavigation} from '@react-navigation/native';

const Quiz = () => {
  const [unlockedLevels, setUnlockedLevels] = React.useState(1);
  const navigation = useNavigation();

  React.useEffect(() => {
    loadUnlockedLevels();
  }, []);

  const loadUnlockedLevels = async () => {
    try {
      const level = await AsyncStorage.getItem('unlockedLevel');
      if (level) {
        setUnlockedLevels(parseInt(level));
      }
    } catch (error) {
      console.error('Error loading levels:', error);
    }
  };

  const handleLevelPress = level => {
    console.log(level);
    if (level <= unlockedLevels) {
      navigation.navigate('QuestionScreen', level);
    } else {
      Alert.alert(
        'Level Locked',
        'Complete previous levels to unlock this one!',
      );
    }
  };

  const renderLevels = () => {
    const levels = [];
    for (let i = 0; i < 20; i++) {
      const row = [];
      for (let j = 0; j < 5; j++) {
        const levelNum = i * 5 + j + 1;
        if (levelNum <= 100) {
          row.push(
            <TouchableOpacity
              key={levelNum}
              style={[
                styles.levelButton,
                levelNum <= unlockedLevels
                  ? styles.unlockedLevel
                  : styles.lockedLevel,
              ]}
              onPress={() => handleLevelPress(levelNum)}>
              <Text style={styles.levelText}>{levelNum}</Text>
              {levelNum <= unlockedLevels && (
                <View style={styles.progressDot} />
              )}
            </TouchableOpacity>,
          );
        }
      }
      levels.push(
        <View key={i} style={styles.row}>
          {row}
        </View>,
      );
    }
    return levels;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>RRB Question Levels</Text>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderLevels()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 20,
    color: '#2c3e50',
  },
  scrollContent: {
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  levelButton: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    margin: 5,
  },
  unlockedLevel: {
    backgroundColor: '#3498db',
    elevation: 3,
  },
  lockedLevel: {
    backgroundColor: '#bdc3c7',
  },
  levelText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressDot: {
    position: 'absolute',
    bottom: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2ecc71',
  },
  questionContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  levelIndicator: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  questionCounter: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  questionContent: {
    flex: 1,
  },
  questionText: {
    fontSize: 18,
    marginBottom: 20,
    color: '#2c3e50',
    lineHeight: 24,
  },
  optionButton: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedOption: {
    borderWidth: 2,
  },
  correctOption: {
    backgroundColor: '#2ecc71',
    borderColor: '#27ae60',
  },
  wrongOption: {
    backgroundColor: '#e74c3c',
    borderColor: '#c0392b',
  },
  optionText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  helpButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  helpButton: {
    padding: 10,
    backgroundColor: '#3498db',
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  helpButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  hintContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff9c4',
    borderRadius: 8,
  },
  hintText: {
    color: '#666',
    fontSize: 14,
  },
  solutionContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
  },
  solutionText: {
    color: '#2c3e50',
    fontSize: 14,
  },
});

export default Quiz;

// import React from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   Alert,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import {useQuestions} from '../util/QuestionsContext';

// const Quiz = ({navigation}) => {
//   const {questionData} = useQuestions();
//   const [unlockedLevels, setUnlockedLevels] = React.useState(1);

//   React.useEffect(() => {
//     loadUnlockedLevels();
//     const unsubscribe = navigation.addListener('focus', () => {
//       loadUnlockedLevels();
//     });
//     return unsubscribe;
//   }, [navigation]);

//   const loadUnlockedLevels = async () => {
//     try {
//       const level = await AsyncStorage.getItem('unlockedLevel');
//       if (level) {
//         setUnlockedLevels(parseInt(level));
//       }
//     } catch (error) {
//       console.error('Error loading levels:', error);
//     }
//   };

//   const handleLevelPress = level => {
//     if (level <= unlockedLevels) {
//       if (questionData[level]) {
//         navigation.navigate('Question', {level});
//       } else {
//         Alert.alert(
//           'Level Not Available',
//           'Questions for this level are not available yet.',
//         );
//       }
//     } else {
//       Alert.alert(
//         'Level Locked',
//         'Complete previous levels to unlock this one!',
//       );
//     }
//   };

//   const renderLevels = () => {
//     const levels = [];
//     for (let i = 0; i < 20; i++) {
//       const row = [];
//       for (let j = 0; j < 5; j++) {
//         const levelNum = i * 5 + j + 1;
//         if (levelNum <= 100) {
//           const hasQuestions = questionData[levelNum] !== undefined;
//           row.push(
//             <TouchableOpacity
//               key={levelNum}
//               style={[
//                 styles.levelButton,
//                 levelNum <= unlockedLevels
//                   ? styles.unlockedLevel
//                   : styles.lockedLevel,
//                 !hasQuestions && styles.unavailableLevel,
//               ]}
//               onPress={() => handleLevelPress(levelNum)}>
//               <Text style={styles.levelText}>{levelNum}</Text>
//               {levelNum <= unlockedLevels && hasQuestions && (
//                 <View style={styles.progressDot} />
//               )}
//             </TouchableOpacity>,
//           );
//         }
//       }
//       levels.push(
//         <View key={i} style={styles.row}>
//           {row}
//         </View>,
//       );
//     }
//     return levels;
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>RRB Question Levels</Text>
//       <ScrollView contentContainerStyle={styles.scrollContent}>
//         {renderLevels()}
//       </ScrollView>
//     </View>
//   );
// };

// export default Quiz;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     padding: 20,
//     color: '#2c3e50',
//   },
//   scrollContent: {
//     padding: 10,
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginBottom: 15,
//   },
//   levelButton: {
//     width: 60,
//     height: 60,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 30,
//     margin: 5,
//   },
//   unlockedLevel: {
//     backgroundColor: '#3498db',
//     elevation: 3,
//   },
//   lockedLevel: {
//     backgroundColor: '#bdc3c7',
//   },
//   levelText: {
//     color: 'white',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   progressDot: {
//     position: 'absolute',
//     bottom: 5,
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: '#2ecc71',
//   },
//   questionContainer: {
//     flex: 1,
//     backgroundColor: '#fff',
//     padding: 20,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   levelIndicator: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#2c3e50',
//   },
//   questionCounter: {
//     fontSize: 16,
//     color: '#7f8c8d',
//   },
//   questionContent: {
//     flex: 1,
//   },
//   questionText: {
//     fontSize: 18,
//     marginBottom: 20,
//     color: '#2c3e50',
//     lineHeight: 24,
//   },
//   optionButton: {
//     padding: 15,
//     marginVertical: 8,
//     backgroundColor: '#f0f0f0',
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#ddd',
//   },
//   selectedOption: {
//     borderWidth: 2,
//   },
//   correctOption: {
//     backgroundColor: '#2ecc71',
//     borderColor: '#27ae60',
//   },
//   wrongOption: {
//     backgroundColor: '#e74c3c',
//     borderColor: '#c0392b',
//   },
//   optionText: {
//     fontSize: 16,
//     color: '#2c3e50',
//   },
//   helpButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginTop: 20,
//   },
//   helpButton: {
//     padding: 10,
//     backgroundColor: '#3498db',
//     borderRadius: 5,
//     minWidth: 100,
//     alignItems: 'center',
//   },
//   helpButtonText: {
//     color: 'white',
//     fontWeight: 'bold',
//   },
//   hintContainer: {
//     marginTop: 20,
//     padding: 15,
//     backgroundColor: '#fff9c4',
//     borderRadius: 8,
//   },
//   hintText: {
//     color: '#666',
//     fontSize: 14,
//   },
//   solutionContainer: {
//     marginTop: 20,
//     padding: 15,
//     backgroundColor: '#e8f5e9',
//     borderRadius: 8,
//   },
//   solutionText: {
//     color: '#2c3e50',
//     fontSize: 14,
//   },
// });
