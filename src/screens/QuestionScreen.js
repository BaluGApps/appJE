import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import questions from '../util/Questions.json';

const QuestionScreen = ({route, navigation}) => {
  const {level} = route.params;
  console.log(level, '###');
  const [selectedOption, setSelectedOption] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  const currentQuestion = questions.questions.find(q => q.level === level);

  //   const handleOptionSelect = async index => {
  //     setSelectedOption(index);
  //     if (index === currentQuestion.correctAnswer) {
  //       // If correct answer
  //       try {
  //         const nextLevel = level + 1;
  //         await AsyncStorage.setItem('unlockedLevel', nextLevel.toString());
  //         Alert.alert('Correct!', 'Moving to next level...', [
  //           {
  //             text: 'OK',
  //             onPress: () => navigation.goBack(),
  //           },
  //         ]);
  //       } catch (error) {
  //         console.error('Error saving level:', error);
  //       }
  //     } else {
  //       // If wrong answer
  //       Alert.alert('Wrong Answer', 'Try again!');
  //     }
  //   };

  const handleOptionSelect = async index => {
    setSelectedOption(index);
    if (index === currentQuestion.correctAnswer) {
      // If correct answer
      try {
        const nextLevel = level + 1;
        await AsyncStorage.setItem('unlockedLevel', nextLevel.toString());
        Alert.alert('Correct!', 'Moving to next level...', [
          {
            text: 'OK',
            onPress: () =>
              navigation.replace('QuestionScreen', {level: nextLevel}),
          },
        ]);
      } catch (error) {
        console.error('Error saving level:', error);
      }
    } else {
      // If wrong answer
      Alert.alert('Wrong Answer', 'Try again!');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.levelIndicator}>Level {level}</Text>
      </View>

      <View style={styles.questionContent}>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>

        {currentQuestion.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
              selectedOption === index && styles.selectedOption,
              selectedOption === index &&
                index === currentQuestion.correctAnswer &&
                styles.correctOption,
              selectedOption === index &&
                index !== currentQuestion.correctAnswer &&
                styles.wrongOption,
            ]}
            onPress={() => handleOptionSelect(index)}>
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.helpButtons}>
          <TouchableOpacity
            style={styles.helpButton}
            onPress={() => setShowHint(!showHint)}>
            <Text style={styles.helpButtonText}>
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.helpButton}
            onPress={() => setShowSolution(!showSolution)}>
            <Text style={styles.helpButtonText}>
              {showSolution ? 'Hide Solution' : 'Show Solution'}
            </Text>
          </TouchableOpacity>
        </View>

        {showHint && (
          <View style={styles.hintContainer}>
            <Text style={styles.hintText}>{currentQuestion.hint}</Text>
          </View>
        )}

        {showSolution && (
          <View style={styles.solutionContainer}>
            <Text style={styles.solutionText}>{currentQuestion.solution}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default QuestionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  levelIndicator: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
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
    borderColor: '#3498db',
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
    marginTop: 30,
    marginBottom: 20,
  },
  helpButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#3498db',
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
    elevation: 2,
  },
  helpButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  hintContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff9c4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fff176',
  },
  hintText: {
    color: '#666',
    fontSize: 16,
    lineHeight: 22,
  },
  solutionContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#a5d6a7',
  },
  solutionText: {
    color: '#2c3e50',
    fontSize: 16,
    lineHeight: 22,
  },
});
