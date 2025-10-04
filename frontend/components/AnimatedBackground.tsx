import React from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';

interface AnimatedBackgroundProps {
  children: React.ReactNode;
  style?: any;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ children, style }) => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.container, style]}>
      <ImageBackground
        source={{ uri: 'https://customer-assets.emergentagent.com/job_recicla-contigo-1/artifacts/61qxumpg_ChatGPT%20Image%203%20oct%202025%2C%2010_52_44.png' }}
        style={styles.backgroundImage}
        blurRadius={8}
      >
        <LinearGradient
          colors={theme.background}
          style={styles.gradient}
        >
          {children}
        </LinearGradient>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
});