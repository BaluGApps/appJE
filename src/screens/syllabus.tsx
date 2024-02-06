// REAL CODE FOR FUNCTIONALITY ITS WORKING BUT ITS NOT RESPONSIVE
// import React, { useState, useEffect } from 'react';
// import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// const Syllabus = () => {
//   const [syllabusData, setSyllabusData] = useState([]);

//   useEffect(() => {
//     // Fetch data from the API
//     fetch('https://apije.pythonanywhere.com/exam/api/syllabus/')
//       .then(response => response.json())
//       .then(data => setSyllabusData(data))
//       .catch(error => console.error('Error fetching data:', error));
//   }, []);

//   const [expandedTopicId, setExpandedTopicId] = useState(null);

//   const renderItem = ({ item }) => (
//     <View>
//       <TouchableOpacity onPress={() => handleTopicPress(item.id)}>
//         <View style={styles.topicContainer}>
//           <Text style={styles.topicTitle}>{item.topic}</Text>
//           <MaterialCommunityIcons
//             name={expandedTopicId === item.id ? 'chevron-up' : 'chevron-down'}
//             size={20}
//             color="#0074E4"
//           />
//         </View>
//       </TouchableOpacity>
//       {expandedTopicId === item.id && (
//         <View style={styles.descriptionContainer}>
//           <Text style={styles.descriptionText}>{item.description}</Text>
//         </View>
//       )}
//     </View>
//   );

//   const handleTopicPress = (selectedTopicId) => {
//     // Toggle expand/collapse for the selected topic
//     setExpandedTopicId((prevId) => (prevId === selectedTopicId ? null : selectedTopicId));
//   };

//   return (
//     <FlatList
//       data={syllabusData}
//       renderItem={renderItem}
//       keyExtractor={(item) => item.id.toString()}
//     />
//   );
// };

// const styles = StyleSheet.create({
//   topicContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ddd',
//   },
//   topicTitle: {
//     fontSize: 18,
//     fontFamily: 'Poppins',
//     fontWeight: 'bold',
//     color: '#0074E4', // Royal Blue
//   },
//   descriptionContainer: {
//     padding: 15,
//     backgroundColor: '#f0f0f0', // Background color for the description
//   },
//   descriptionText: {
//     fontSize: 16,
//     color: '#333',
//     fontFamily: 'Poppins'
//   },
// });

// export default Syllabus;

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';

const Syllabus = () => {
  const [syllabusData, setSyllabusData] = useState([]);

  useEffect(() => {
    // Fetch data from the API
    fetch('https://apije.pythonanywhere.com/exam/api/syllabus/')
      .then(response => response.json())
      .then(data => setSyllabusData(data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const [expandedTopicId, setExpandedTopicId] = useState(null);

  const renderItem = ({ item }) => (
    <View>
      <TouchableOpacity onPress={() => handleTopicPress(item.id)}>
        <View style={styles.topicContainer}>
          <Text style={styles.topicTitle}>{item.topic}</Text>
          <MaterialCommunityIcons
            name={expandedTopicId === item.id ? 'chevron-up' : 'chevron-down'}
            size={wp('5%')} // Use responsive size
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

  const handleTopicPress = (selectedTopicId) => {
    // Toggle expand/collapse for the selected topic
    setExpandedTopicId((prevId) => (prevId === selectedTopicId ? null : selectedTopicId));
  };

  return (
    <FlatList
      data={syllabusData}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
    />
  );
};

const styles = StyleSheet.create({
  topicContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp('4%'), // Use responsive padding
    borderBottomWidth: wp('0.2%'),
    borderBottomColor: '#778899',
  },
  topicTitle: {
    fontSize: wp('4.3%'), // Use responsive font size
    fontFamily: 'Poppins',
    fontWeight: 'bold',
    color: '#0074E4', // Royal Blue
  },
  descriptionContainer: {
    padding: wp('3%'), // Use responsive padding
    backgroundColor: '#F5FFFA', // Background color for the description
  },
  descriptionText: {
    fontSize: wp('3.9%'), // Use responsive font size
    color: '#F08080',
    fontFamily: 'Poppins',
    fontWeight: 'bold',
  },
});

export default Syllabus;
