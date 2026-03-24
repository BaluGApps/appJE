import React from 'react';
import {View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Platform} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import {useAppTheme} from '../util/theme';
import revisionData from '../data/revisionData';

const RevisionScreen = ({navigation}) => {
  const { t, i18n } = useTranslation();
  const {colors, isDark} = useAppTheme();
  const oneWordData = revisionData[i18n.language] || revisionData.en;

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={[styles.header, {backgroundColor: colors.primary}]}>
        <Text style={styles.headerTitle}>{t('revision') || 'Revision & Notes'}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.emptyContainer, {backgroundColor: colors.card}]}>
          <Icon name="flash-outline" size={40} color={colors.primary} />
          <Text style={[styles.emptyTitle, {color: colors.text}]}>Important One Word Revision</Text>
          <Text style={[styles.emptySubtitle, {color: colors.subtext}]}>
            Quick high-yield facts for daily 10-minute revision.
          </Text>
        </View>

        <View style={styles.listWrap}>
          {oneWordData.map(item => (
            <View key={item.id} style={[styles.qaCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
              <Text style={[styles.qText, {color: colors.text}]}>{item.q}</Text>
              <Text style={[styles.aText, {color: colors.success}]}>Ans: {item.a}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={[styles.actionButton, {backgroundColor: isDark ? '#0E223D' : '#E0E7FF'}]} onPress={() => navigation.navigate('Practice')}>
            <Text style={styles.actionButtonText}>{t('goToPractice')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#0074E4',
    padding: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8 },
      android: { elevation: 6 },
    }),
  },
  headerTitle: {
    fontSize: wp('7%'),
    fontWeight: 'bold',
    color: '#FFF',
  },
  content: {
    flexGrow: 1,
    padding: 24,
  },
  emptyContainer: {
    alignItems: 'flex-start',
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  emptyTitle: {
    fontSize: wp('5.5%'),
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: wp('3.8%'),
    textAlign: 'left',
    lineHeight: 22,
    marginTop: 6,
  },
  listWrap: {
    gap: 10,
  },
  qaCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  qText: {
    fontSize: wp('3.9%'),
    fontWeight: '600',
  },
  aText: {
    marginTop: 6,
    fontSize: wp('3.7%'),
    fontWeight: '700',
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignSelf: 'center',
    marginTop: 20,
  },
  actionButtonText: {
    color: '#0074E4',
    fontWeight: 'bold',
    fontSize: wp('4%'),
  },
});

export default RevisionScreen;
