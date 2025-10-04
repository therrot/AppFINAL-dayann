import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedBackground } from '../../components/AnimatedBackground';
import { useTheme } from '../../contexts/ThemeContext';

export default function ConfiguracionScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const [backgroundAnimation, setBackgroundAnimation] = useState(true);

  const showTerms = () => {
    Alert.alert(
      'Términos y Condiciones',
      'VENTANILLA RECICLA CONTIGO v1.0.0\n\nCreado por: Fernando Rufasto\n\nAplicación móvil para el cuidado del medio ambiente en Ventanilla, Lima, Perú.\n\n• Los reportes enviados serán públicos para la comunidad\n• Tu privacidad es importante para nosotros\n• El sistema de puntos e incentivos está sujeto a disponibilidad\n\nContacto: Municipalidad de Ventanilla\n\n© 2024 Fernando Rufasto. Todos los derechos reservados.',
      [{ text: 'Aceptar' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedBackground>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Ionicons name="settings" size={30} color="#FFD700" />
            <Text style={styles.headerTitle}>Configuración</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            Personaliza tu experiencia en la aplicación
          </Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Theme Section */}
          <View style={styles.settingSection}>
            <LinearGradient
              colors={theme.cardBackground}
              style={styles.settingCard}
            >
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                Apariencia
              </Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons 
                    name={isDark ? "moon" : "sunny"} 
                    size={24} 
                    color={theme.accent} 
                  />
                  <View style={styles.settingText}>
                    <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>
                      Tema Oscuro
                    </Text>
                    <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                      {isDark ? 'Tema oscuro activado' : 'Tema claro activado'}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{ false: '#E0E0E0', true: theme.accent }}
                  thumbColor={isDark ? '#FFFFFF' : '#F4F3F4'}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons 
                    name="play-circle" 
                    size={24} 
                    color={theme.accent} 
                  />
                  <View style={styles.settingText}>
                    <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>
                      Fondo Animado
                    </Text>
                    <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                      {backgroundAnimation ? 'Animación activada' : 'Animación desactivada'}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={backgroundAnimation}
                  onValueChange={setBackgroundAnimation}
                  trackColor={{ false: '#E0E0E0', true: theme.accent }}
                  thumbColor={backgroundAnimation ? '#FFFFFF' : '#F4F3F4'}
                />
              </View>
            </LinearGradient>
          </View>

          {/* App Info Section */}
          <View style={styles.settingSection}>
            <LinearGradient
              colors={theme.cardBackground}
              style={styles.settingCard}
            >
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                Información
              </Text>
              
              <TouchableOpacity style={styles.settingItem} onPress={showTerms}>
                <View style={styles.settingInfo}>
                  <Ionicons name="information-circle" size={24} color={theme.accent} />
                  <View style={styles.settingText}>
                    <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>
                      Términos y Condiciones
                    </Text>
                    <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                      Creado por Fernando Rufasto
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="help-circle" size={24} color={theme.accent} />
                  <View style={styles.settingText}>
                    <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>
                      Acerca de la app
                    </Text>
                    <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                      Versión 1.0.0 - Ventanilla Recicla Contigo
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </LinearGradient>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </AnimatedBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  settingSection: {
    marginBottom: 16,
  },
  settingCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
  },
  bottomSpacing: {
    height: 20,
  },
});