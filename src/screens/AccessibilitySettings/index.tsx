import React, { useEffect, useState } from 'react';
import { Linking, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { useAppSelector } from '@/hooks/useAppDispatch';

import Button  from '@/components/atoms/Button';
import { Text, Title } from '@/components/atoms/Text';

const AccessibilitySettings = () => {
  const {
    isScreenReaderEnabled,
    isBoldTextEnabled,
    isReduceMotionEnabled,
    isReduceTransparencyEnabled,
    isInvertColorsEnabled,
    fontScale,
  } = useAppSelector((state) => state.accessibility);

  const openAccessibilitySettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      accessible={true}>
      <Title style={styles.title} accessibilityRole="header">
        Accessibility Settings
      </Title>

      <Text style={styles.description}>
        This screen shows the current accessibility settings on your device. To
        change these settings, please use your device's accessibility settings.
      </Text>

      <View style={styles.settingContainer}>
        <Text style={styles.settingTitle} accessibilityRole="header">
          Screen Reader
        </Text>
        <Text style={styles.settingValue}>
          {isScreenReaderEnabled ? 'Enabled' : 'Disabled'}
        </Text>
      </View>

      {Platform.OS === 'ios' && (
        <>
          <View style={styles.settingContainer}>
            <Text style={styles.settingTitle} accessibilityRole="header">
              Bold Text
            </Text>
            <Text style={styles.settingValue}>
              {isBoldTextEnabled ? 'Enabled' : 'Disabled'}
            </Text>
          </View>

          <View style={styles.settingContainer}>
            <Text style={styles.settingTitle} accessibilityRole="header">
              Reduce Motion
            </Text>
            <Text style={styles.settingValue}>
              {isReduceMotionEnabled ? 'Enabled' : 'Disabled'}
            </Text>
          </View>

          <View style={styles.settingContainer}>
            <Text style={styles.settingTitle} accessibilityRole="header">
              Reduce Transparency
            </Text>
            <Text style={styles.settingValue}>
              {isReduceTransparencyEnabled ? 'Enabled' : 'Disabled'}
            </Text>
          </View>

          <View style={styles.settingContainer}>
            <Text style={styles.settingTitle} accessibilityRole="header">
              Invert Colors
            </Text>
            <Text style={styles.settingValue}>
              {isInvertColorsEnabled ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
        </>
      )}

      <View style={styles.settingContainer}>
        <Text style={styles.settingTitle} accessibilityRole="header">
          Font Scale
        </Text>
        <Text style={styles.settingValue}>{fontScale.toFixed(1)}</Text>
      </View>

      <Button
        title="Open Device Accessibility Settings"
        onPress={openAccessibilitySettings}
        style={styles.button}
        accessibilityLabel="Open Device Accessibility Settings"
        accessibilityHint="Opens your device's accessibility settings where you can change screen reader, font size, and other options"
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    marginBottom: 24,
    lineHeight: 22,
  },
  settingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingTitle: {
    fontWeight: '500',
  },
  settingValue: {
  },
  button: {
    marginTop: 32,
  },
});

export default AccessibilitySettings;
