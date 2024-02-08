import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator,Alert } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import axios from 'axios';

const Cbt1 = () => {
  const [questionsData, setQuestionsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMoreQuestions, setHasMoreQuestions] = useState(true);
  const [loadingHeader, setLoadingHeader] = useState(true);
  const [error, setError] = useState(null);
  const [canScroll, setCanScroll] = useState(true)
  
useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await axios.get(`https://apije.pythonanywhere.com/exam/api/cbt1/?page=${page}&page_size=5`);
      const newData = response.data.results;

      setQuestionsData(prevData => [...prevData, ...newData]);
      setLoading(false);
      setHasMoreQuestions(newData.length < response.data.count);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  fetchData();
}, [page]);


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
        <Text style={styles.textcolor}>{item.option_a}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.option,
          item.selectedOption === 'B' && styles.selectedOption,
          item.selectedOption === 'B' && item.correct_option === 'B' && styles.correctOption,
        ]}
        onPress={() => handleOptionPress(item, 'B')}
      >
        <Text style={styles.textcolor}>{item.option_b}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.option,
          item.selectedOption === 'C' && styles.selectedOption,
          item.selectedOption === 'C' && item.correct_option === 'C' && styles.correctOption,
        ]}
        onPress={() => handleOptionPress(item, 'C')}
      >
        <Text style={styles.textcolor}>{item.option_c}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.option,
          item.selectedOption === 'D' && styles.selectedOption,
          item.selectedOption === 'D' && item.correct_option === 'D' && styles.correctOption,
        ]}
        onPress={() => handleOptionPress(item, 'D')}
      >
        <Text style={styles.textcolor}>{item.option_d}</Text>
      </TouchableOpacity>
      {item.selectedOption && (
        <View style={styles.answerDescription}>
          <Text style={item.answeredCorrectly ? styles.correctText : styles.incorrectText}>
            {item.answeredCorrectly ? 'Correct!' : 'Incorrect!'}
          </Text>
          <Text style={{fontWeight:'400',color:'black'}}>{item.answer_description}</Text>
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

  return (
    <View style={styles.container}>
    {questionsData.length > 0 ? (
      <FlatList
        data={questionsData}
        renderItem={renderQuestion}
        keyExtractor={item => item.id.toString()}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          if (hasMoreQuestions && !loading && canScroll) {
            setPage(prevPage => prevPage + 1);
            setLoading(true);
          }
        }}
        onEndReachedThreshold={0.1}
        ListFooterComponent={()=>(
          <View>
            {loading && <ActivityIndicator style={styles.loadingIndicator} size="large" color="#0074E4" />}
            {!hasMoreQuestions && !loading && (
            <Text style={styles.noMoreQuestionsText}>No more questions available</Text>
    )}
          </View>
    )}
        scrollEnabled={canScroll}
      />
    ) : (
      <Text style={styles.noQuestionsText}>loading ..</Text>
    )}
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87CEEB'
  },
  questionContainer: {
    padding: wp('4%'),
    margin: wp('2%'),
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: 'white',
    borderRadius: wp('2%')
  },
  textcolor:{
    color:'black',
    fontWeight:'500'
  },
  questionText: {
    fontSize: wp('4.5%'),
    marginBottom: hp('2%'),
    color: 'black',
    fontWeight:'500'
  },
  option: {
    padding: wp('3%'),
    marginVertical: hp('1%'),
    borderWidth: wp('0.3%'),
    borderColor: '#87CEEB',
    borderRadius: wp('1%'),
    backgroundColor: 'white',
    color:'black'
  },
  optionText: {
    // color: '#0074E4',
    color: '#FFFFFF', 
    fontWeight: 'bold'
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
    color: 'red',
    fontWeight: 'bold',
  },
  descriptionText: {
    fontSize: wp('4%'),
  },

  loadingIndicator: {
    marginVertical: hp('2%'),
  },
  selectedOption: {
    backgroundColor: 'lightcoral', // Darker shade for selected option
    borderColor: '#004080',
    color: 'white',
  },
  correctOption: {
    backgroundColor: 'lightgreen',
  },
  noQuestionsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 18,
    color: '#555', // You can adjust the color as needed
    fontWeight: 'bold',
  },
  noMoreQuestionsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 18,
    color: '#555',
    fontWeight: 'bold',
  },
});


export default Cbt1;