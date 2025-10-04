import React, { useEffect } from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';

interface AnimatedBackgroundProps {
  children: React.ReactNode;
  style?: any;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ children, style }) => {
  const { theme, backgroundAnimation } = useTheme();
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    if (backgroundAnimation) {
      animatedValue.value = withRepeat(
        withTiming(1, { duration: 8000 }),
        -1,
        true
      );
    }
  }, [backgroundAnimation]);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(animatedValue.value, [0, 0.5, 1], [0.8, 1, 0.8]);
    const scale = interpolate(animatedValue.value, [0, 0.5, 1], [1, 1.02, 1]);
    
    return {
      opacity: backgroundAnimation ? opacity : 1,
      transform: [{ scale: backgroundAnimation ? scale : 1 }],
    };
  });

  const gradientAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(animatedValue.value, [0, 1], [0.95, 0.85]);
    
    return {
      opacity: backgroundAnimation ? opacity : 0.9,
    };
  });

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={[styles.background, animatedStyle]}>
        <ImageBackground
          source={{ uri: 'https://customer-assets.emergentagent.com/job_recicla-contigo-1/artifacts/61qxumpg_ChatGPT%20Image%203%20oct%202025%2C%2010_52_44.png' }}
          style={styles.backgroundImage}
          blurRadius={8}
        >
          <Animated.View style={[styles.gradient, gradientAnimatedStyle]}>
            <LinearGradient
              colors={theme.background}
              style={styles.gradientFill}
            >
              {children}
            </LinearGradient>
          </Animated.View>
        </ImageBackground>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  gradientFill: {
    flex: 1,
  },
});