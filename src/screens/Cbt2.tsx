import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const Cbt2 = () => {
  const [questionsData, setQuestionsData] = useState([]);
  const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Fetch data from the API
//     fetch('https://apije.pythonanywhere.com/exam/api/questions/?page=1&page_size=5')
//       .then(response => response.json())
//       .then(data => {
//         // Check if the question's section is 'cbt1'
//         const cbt2Questions = data.results
//         console.log('cbt2 questions',cbt2Questions)
//           .filter(question => question.section === 'cbt2')
//           .map(question => ({ ...question, selectedOption: null }));
  
//         setQuestionsData(cbt2Questions);
//         setLoading(false);
//       })
//       .catch(error => console.error('Error fetching data:', error));
//   }, []);
  
useEffect(() => {
    // Fetch data from the API
    fetch('https://apije.pythonanywhere.com/exam/api/questions/?page=1&page_size=5')
      .then(response => response.json())
      .then(data => {
        console.log('Received data:', data);
  
        if (data && data.results && Array.isArray(data.results)) {
          // Check if the question's section is 'cbt2'
          const cbt2Questions = data.results
            .filter(question => question.section === 'cbt2')
            .map(question => ({ ...question, selectedOption: null }));
  
          console.log('Cbt2 questions:', cbt2Questions);
  
          setQuestionsData(cbt2Questions);
          setLoading(false);
        } else {
          console.error('Unexpected data structure:', data);
        }
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);
  
  

const renderQuestion = ({ item }) => (
    <View style={styles.questionContainer}>
      <Text style={styles.questionText}>• {item.question_text}</Text>
      <TouchableOpacity
        style={[
          styles.option,
          item.selectedOption === 'A' && styles.selectedOption,
          item.selectedOption === 'A' && item.correct_option === 'A' && styles.correctOption,
        ]}
        onPress={() => handleOptionPress(item, 'A')}
      >
        <Text>{item.option_a}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.option,
          item.selectedOption === 'B' && styles.selectedOption,
          item.selectedOption === 'B' && item.correct_option === 'B' && styles.correctOption,
        ]}
        onPress={() => handleOptionPress(item, 'B')}
      >
        <Text>{item.option_b}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.option,
          item.selectedOption === 'C' && styles.selectedOption,
          item.selectedOption === 'C' && item.correct_option === 'C' && styles.correctOption,
        ]}
        onPress={() => handleOptionPress(item, 'C')}
      >
        <Text>{item.option_c}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.option,
          item.selectedOption === 'D' && styles.selectedOption,
          item.selectedOption === 'D' && item.correct_option === 'D' && styles.correctOption,
        ]}
        onPress={() => handleOptionPress(item, 'D')}
      >
        <Text>{item.option_d}</Text>
      </TouchableOpacity>
      {item.selectedOption && (
        <View style={styles.answerDescription}>
          <Text style={item.answeredCorrectly ? styles.correctText : styles.incorrectText}>
            {item.answeredCorrectly ? 'Correct!' : 'Incorrect!'}
          </Text>
          <Text>{item.answer_description}</Text>
        </View>
      )}
    </View>
  );
  

  const handleOptionPress = (selectedQuestion, selectedOption) => {
    // Handle logic for selected option
    const updatedQuestions = questionsData.map(question =>
      question.id === selectedQuestion.id
        ? {
            ...question,
            selectedOption,
            answered: true,
            answeredCorrectly: selectedOption === question.correct_option,
          }
        : question
    );
    setQuestionsData(updatedQuestions);
  };

  const handleEndReached = () => {
    // Handle logic for reaching the end of questions, e.g., fetch more questions
    console.log('End reached! Fetch more questions...');
  };

  return (
    <View style={styles.container}>
      {questionsData.length > 0 && (
        <FlatList
          data={questionsData}
          renderItem={renderQuestion}
          keyExtractor={item => item.id.toString()}
        //   horizontal
        //   pagingEnabled
          showsHorizontalScrollIndicator={false}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.1}
        />
      )}
      {loading && <ActivityIndicator style={styles.loadingIndicator} size="large" color="#0074E4" />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  questionContainer: {
    width: wp('100%'),
    height: hp('50%'),
    padding: wp('5%'),
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',

  },
  questionText: {
    fontSize: wp('4.5%'),
    marginBottom: hp('2%'),
  },
  option: {
    padding: wp('3%'),
    marginVertical: hp('1%'),
    borderWidth: wp('0.2%'),
    borderColor: '#ddd',
  },
  correctText: {
    color: 'green',
    fontWeight: 'bold',
    marginBottom: hp('1%'),
  },
  incorrectText: {
    color: 'red',
    fontWeight: 'bold',
    marginBottom: hp('1%'),
  },
  answerDescription: {
    marginTop: hp('2%'),
  },
  loadingIndicator: {
    marginVertical: hp('2%'),
  },
  selectedOption: {
    backgroundColor: '#0074E4',
    borderColor: '#0074E4',
    color:'white'
    // Add any other styles as needed
  },
});

export default Cbt2;
