import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {WebView} from 'react-native-webview';
import {useAppTheme} from '../util/theme';

const PdfViewerScreen = ({route}) => {
  const {colors} = useAppTheme();
  const {url, title} = route.params || {};

  const viewerUrl = useMemo(() => {
    if (!url) return '';
    return `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(url)}`;
  }, [url]);

  if (!viewerUrl) {
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
        <View style={styles.center}>
          <Text style={{color: colors.text}}>PDF URL missing.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={[styles.header, {backgroundColor: colors.card, borderBottomColor: colors.border}]}>
        <Text style={[styles.headerText, {color: colors.text}]} numberOfLines={1}>
          {title || 'PDF Viewer'}
        </Text>
      </View>
      <WebView source={{uri: viewerUrl}} startInLoadingState style={styles.webview} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  header: {paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1},
  headerText: {fontSize: 16, fontWeight: '700'},
  webview: {flex: 1},
});

export default PdfViewerScreen;
