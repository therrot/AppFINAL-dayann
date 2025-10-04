import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '../contexts/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <StatusBar style="light" backgroundColor="#2E7D32" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ThemeProvider>
  );
}