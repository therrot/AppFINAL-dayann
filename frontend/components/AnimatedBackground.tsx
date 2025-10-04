import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ImageBackground, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';

interface AnimatedBackgroundProps {
  children: React.ReactNode;
  style?: any;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ children, style }) => {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.8)).current;
  
  useEffect(() => {
    // Animación de respiración suave
    const breatheAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.02,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    );

    // Animación de opacidad
    const fadeAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.8,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );

    breatheAnimation.start();
    fadeAnimation.start();

    return () => {
      breatheAnimation.stop();
      fadeAnimation.stop();
    };
  }, []);
  
  return (
    <View style={[styles.container, style]}>
      <Animated.View style={[
        styles.animatedContainer,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }
      ]}>
        <ImageBackground
          source={{ uri: 'https://customer-assets.emergentagent.com/job_recicla-contigo-1/artifacts/61qxumpg_ChatGPT%20Image%203%20oct%202025%2C%2010_52_44.png' }}
          style={styles.backgroundImage}
          blurRadius={6}
        >
          <LinearGradient
            colors={theme.background}
            style={styles.gradient}
          >
            {children}
          </LinearGradient>
        </ImageBackground>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  animatedContainer: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
});