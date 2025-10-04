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
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function ConfiguracionScreen() {
  const { theme, isDark, toggleTheme, backgroundAnimation, toggleBackgroundAnimation } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  };

  const updateProfilePhoto = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos', 'Necesitamos acceso a tu galería para cambiar la foto de perfil.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setLoading(true);
        const photoBase64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
        
        // Update profile photo on server
        const response = await axios.put(`${API_URL}/api/usuarios/${user.id}`, {
          foto_perfil: photoBase64,
        });

        if (response.data) {
          // Update local user data
          const updatedUser = { ...user, foto_perfil: photoBase64 };
          setUser(updatedUser);
          await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
          
          Alert.alert('Éxito', 'Foto de perfil actualizada correctamente');
        }
      }
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo actualizar la foto de perfil');
    }
    setLoading(false);
  };

  const takePicture = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos', 'Necesitamos acceso a la cámara para tomar una foto de perfil.');
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setLoading(true);
        const photoBase64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
        
        // Update profile photo on server
        const response = await axios.put(`${API_URL}/api/usuarios/${user.id}`, {
          foto_perfil: photoBase64,
        });

        if (response.data) {
          // Update local user data
          const updatedUser = { ...user, foto_perfil: photoBase64 };
          setUser(updatedUser);
          await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
          
          Alert.alert('Éxito', 'Foto de perfil actualizada correctamente');
        }
      }
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo tomar la foto de perfil');
    }
    setLoading(false);
  };

  const showPhotoOptions = () => {
    Alert.alert(
      'Foto de Perfil',
      'Selecciona una opción:',
      [
        { text: 'Cámara', onPress: takePicture },
        { text: 'Galería', onPress: updateProfilePhoto },
        { text: 'Cancelar', style: 'cancel' },
      ]
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
          {/* Profile Section */}
          <View style={styles.profileSection}>
            <LinearGradient
              colors={theme.cardBackground}
              style={styles.profileCard}
            >
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                Perfil
              </Text>
              
              <View style={styles.profileInfo}>
                <TouchableOpacity 
                  onPress={showPhotoOptions}
                  style={styles.avatarContainer}
                  disabled={loading}
                >
                  {user?.foto_perfil ? (
                    <View style={styles.avatarWrapper}>
                      <img 
                        src={user.foto_perfil} 
                        style={styles.avatarImage}
                        alt="Foto de perfil"
                      />
                      <View style={styles.cameraOverlay}>
                        <Ionicons name="camera" size={20} color="white" />
                      </View>
                    </View>
                  ) : (
                    <LinearGradient
                      colors={['#4CAF50', '#2E7D32']}
                      style={styles.defaultAvatar}
                    >
                      <Ionicons name="person" size={40} color="white" />
                      <View style={styles.cameraOverlay}>
                        <Ionicons name="camera" size={20} color="white" />
                      </View>
                    </LinearGradient>
                  )}
                </TouchableOpacity>
                
                <View style={styles.userInfo}>
                  <Text style={[styles.userName, { color: theme.textPrimary }]}>
                    {user?.nombre || 'Usuario'}
                  </Text>
                  <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
                    {user?.email}
                  </Text>
                  <TouchableOpacity 
                    onPress={showPhotoOptions}
                    style={styles.changePhotoButton}
                    disabled={loading}
                  >
                    <Text style={styles.changePhotoText}>
                      {loading ? 'Actualizando...' : 'Cambiar foto de perfil'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          </View>

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
                  onValueChange={toggleBackgroundAnimation}
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
              
              <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="information-circle" size={24} color={theme.accent} />
                  <View style={styles.settingText}>
                    <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>
                      Acerca de la app
                    </Text>
                    <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                      Versión 1.0.0 - Creado por Fernando Rufasto
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
                      Ayuda y soporte
                    </Text>
                    <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                      ¿Necesitas ayuda? Contáctanos
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
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  profileSection: {
    marginBottom: 16,
  },
  profileCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatarWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    position: 'relative',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  defaultAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 8,
  },
  changePhotoButton: {
    paddingVertical: 4,
  },
  changePhotoText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
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