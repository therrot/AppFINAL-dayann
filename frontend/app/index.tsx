import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      // Simulate splash screen delay
      setTimeout(() => {
        if (token) {
          router.replace('/(tabs)');
        } else {
          setIsLoading(false);
        }
      }, 2000);
    } catch (error) {
      console.log('Error checking auth status:', error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.splashContainer}>
        <ImageBackground
          source={{ uri: 'https://customer-assets.emergentagent.com/job_recicla-contigo-1/artifacts/61qxumpg_ChatGPT%20Image%203%20oct%202025%2C%2010_52_44.png' }}
          style={styles.splashBackground}
          blurRadius={1}
        >
          <LinearGradient
            colors={['rgba(46, 125, 50, 0.9)', 'rgba(33, 150, 243, 0.9)']}
            style={styles.splashGradient}
          >
            <View style={styles.splashContent}>
              <View style={styles.splashLogoContainer}>
                <View style={styles.splashLogoCircle}>
                  <Ionicons name="leaf" size={80} color="#FFD700" />
                </View>
                <Text style={styles.splashTitle}>VENTANILLA</Text>
                <Text style={styles.splashSubtitle}>RECICLA CONTIGO</Text>
                <View style={styles.splashTagline}>
                  <Text style={styles.splashTaglineText}>Cuidando nuestro planeta</Text>
                  <Text style={styles.splashTaglineText}>juntos</Text>
                </View>
              </View>
              
              <View style={styles.loadingContainer}>
                <View style={styles.loadingDots}>
                  <View style={[styles.dot, styles.dot1]} />
                  <View style={[styles.dot, styles.dot2]} />
                  <View style={[styles.dot, styles.dot3]} />
                </View>
                <Text style={styles.loadingText}>Cargando...</Text>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={{ uri: 'https://customer-assets.emergentagent.com/job_recicla-contigo-1/artifacts/61qxumpg_ChatGPT%20Image%203%20oct%202025%2C%2010_52_44.png' }}
        style={styles.backgroundImage}
        blurRadius={2}
      >
        <LinearGradient
          colors={['rgba(46, 125, 50, 0.98)', 'rgba(33, 150, 243, 0.96)', 'rgba(0, 0, 0, 0.85)']}
          style={styles.gradient}
        >
          <View style={styles.content}>
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <View style={styles.logoContainer}>
                <View style={styles.logoCircle}>
                  <Ionicons name="leaf" size={60} color="#FFD700" />
                </View>
                <Text style={styles.appTitle}>VENTANILLA</Text>
                <Text style={styles.appSubtitle}>RECICLA CONTIGO</Text>
              </View>
            </View>

            {/* Welcome Content */}
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeTitle}>¡Bienvenido!</Text>
              <Text style={styles.welcomeText}>
                Únete a la revolución del reciclaje y ayuda a crear un futuro más sostenible para Ventanilla
              </Text>
              
              <View style={styles.featuresContainer}>
                <View style={styles.featureItem}>
                  <Ionicons name="camera" size={24} color="#FFD700" />
                  <Text style={styles.featureText}>Reporta problemas ambientales</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="trophy" size={24} color="#FFD700" />
                  <Text style={styles.featureText}>Gana puntos y recompensas</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="people" size={24} color="#FFD700" />
                  <Text style={styles.featureText}>Únete a la comunidad</Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonsContainer}>
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={() => router.push('/auth/register')}
              >
                <LinearGradient
                  colors={['#4CAF50', '#388E3C']}
                  style={styles.primaryButtonGradient}
                >
                  <Ionicons name="person-add" size={24} color="white" />
                  <Text style={styles.primaryButtonText}>Crear Cuenta</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => router.push('/auth/login')}
              >
                <View style={styles.secondaryButtonContent}>
                  <Ionicons name="log-in" size={20} color="white" />
                  <Text style={styles.secondaryButtonText}>Ya tengo cuenta</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Al continuar, aceptas ayudar a proteger el medio ambiente
              </Text>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Splash Screen Styles
  splashContainer: {
    flex: 1,
  },
  splashBackground: {
    flex: 1,
  },
  splashGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  splashLogoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  splashLogoCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 4,
    borderColor: '#FFD700',
  },
  splashTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFD700',
    letterSpacing: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  splashSubtitle: {
    fontSize: 20,
    color: 'white',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  splashTagline: {
    alignItems: 'center',
  },
  splashTaglineText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFD700',
    marginHorizontal: 4,
  },
  dot1: {
    animationDelay: '0s',
  },
  dot2: {
    animationDelay: '0.2s',
  },
  dot3: {
    animationDelay: '0.4s',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    opacity: 0.8,
  },
  
  // Main Screen Styles
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  logoSection: {
    paddingTop: 60,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  appSubtitle: {
    fontSize: 18,
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  featuresContainer: {
    width: '100%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  featureText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 16,
    fontWeight: '500',
  },
  buttonsContainer: {
    paddingVertical: 40,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  secondaryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
