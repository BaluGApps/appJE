import { Text, View, StyleSheet } from "react-native";
import React, { useEffect } from 'react';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';


const Splash = ({navigation}) =>{
    useEffect(() => {
        // Wait for 3 seconds and then navigate to your main screen
        setTimeout(() => {
          navigation.replace('Navigation'); // Replace 'Main' with the name of your main screen
        }, 3000); // 3000 milliseconds (3 seconds)
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.brandText}>RRB JE</Text>
            <Text style={styles.subtitleText}>Railway Recruitment Board</Text>
            <Text style={styles.welcomeText}>Welcome to the App</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0074E4', // Set the background color to royal blue
    },
    brandText: {
        fontSize: wp('12%'), // Responsive font size
        fontWeight: 'bold',
        color: 'white', // Set the text color to white
        marginBottom: hp('1%'),
    },
    subtitleText: {
        fontSize: wp('5%'), // Responsive font size
        color: 'white', // Set the text color to white
        marginBottom: hp('2%'),
    },
    welcomeText: {
        fontSize: wp('7%'), // Responsive font size
        color: 'white', // Set the text color to white
    },
});

export default Splash;
