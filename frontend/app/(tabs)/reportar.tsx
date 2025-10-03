import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function ReportarScreen() {
  const [descripcion, setDescripcion] = useState('');
  const [foto, setFoto] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [direccion, setDireccion] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    requestPermissions();
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

  const requestPermissions = async () => {
    // Request camera permission
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraStatus !== 'granted') {
      Alert.alert(
        'Permisos de Cámara',
        'Necesitamos acceso a tu cámara para tomar fotos de los reportes.'
      );
    }

    // Request location permission
    const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
    if (locationStatus === 'granted') {
      getCurrentLocation();
    } else {
      Alert.alert(
        'Permisos de Ubicación',
        'Necesitamos acceso a tu ubicación para registrar dónde se encuentra el problema ambiental.'
      );
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(location);
      
      // Get address from coordinates
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      
      const fullAddress = `${address.street || ''} ${address.streetNumber || ''}, ${address.district || ''}, Ventanilla`;
      setDireccion(fullAddress.trim());
    } catch (error) {
      console.log('Error getting location:', error);
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setFoto(`data:image/jpeg;base64,${result.assets[0].base64}`);
      }
    } catch (error) {
      console.log('Error taking photo:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  const pickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setFoto(`data:image/jpeg;base64,${result.assets[0].base64}`);
      }
    } catch (error) {
      console.log('Error picking image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const showImagePicker = () => {
    Alert.alert(
      'Seleccionar Foto',
      'Elige una opción para agregar la foto:',
      [
        { text: 'Cámara', onPress: takePhoto },
        { text: 'Galería', onPress: pickFromGallery },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const enviarReporte = async () => {
    if (!descripcion.trim()) {
      Alert.alert('Error', 'Por favor describe el problema ambiental');
      return;
    }

    if (!foto) {
      Alert.alert('Error', 'Por favor toma una foto del problema');
      return;
    }

    if (!location) {
      Alert.alert('Error', 'No se pudo obtener tu ubicación');
      return;
    }

    setLoading(true);
    try {
      const reportData = {
        descripcion: descripcion.trim(),
        foto_base64: foto,
        latitud: location.coords.latitude,
        longitud: location.coords.longitude,
        direccion: direccion,
      };

      const response = await axios.post(`${API_URL}/api/reportes`, reportData);

      Alert.alert(
        '¡Reporte Enviado!',
        `Tu reporte ha sido enviado exitosamente. Has ganado ${response.data.puntos_ganados} puntos por ayudar al medio ambiente.`,
        [
          {
            text: 'Continuar',
            onPress: () => {
              // Clear form
              setDescripcion('');
              setFoto(null);
              setDireccion('');
              getCurrentLocation();
            }
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Error al enviar el reporte');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={{ uri: 'https://customer-assets.emergentagent.com/job_recicla-contigo-1/artifacts/61qxumpg_ChatGPT%20Image%203%20oct%202025%2C%2010_52_44.png' }}
        style={styles.backgroundImage}
        blurRadius={8}
      >
        <LinearGradient
          colors={['rgba(46, 125, 50, 0.95)', 'rgba(33, 150, 243, 0.9)']}
          style={styles.gradient}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardContainer}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <Ionicons name="camera" size={30} color="#FFD700" />
                <Text style={styles.headerTitle}>Reportar Punto Crítico</Text>
              </View>
              <Text style={styles.headerSubtitle}>
                Ayuda a mejorar nuestro entorno reportando problemas ambientales
              </Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Photo Section */}
              <View style={styles.photoSection}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
                  style={styles.photoCard}
                >
                  <Text style={styles.sectionTitle}>Foto del Problema</Text>
                  {foto ? (
                    <View style={styles.photoContainer}>
                      <Image source={{ uri: foto }} style={styles.photoPreview} />
                      <TouchableOpacity
                        style={styles.changePhotoButton}
                        onPress={showImagePicker}
                      >
                        <Ionicons name="camera" size={20} color="white" />
                        <Text style={styles.changePhotoText}>Cambiar Foto</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.photoPlaceholder} onPress={showImagePicker}>
                      <Ionicons name="camera-outline" size={60} color="#999" />
                      <Text style={styles.photoPlaceholderText}>Toca para tomar foto</Text>
                    </TouchableOpacity>
                  )}
                </LinearGradient>
              </View>

              {/* Description Section */}
              <View style={styles.descriptionSection}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
                  style={styles.descriptionCard}
                >
                  <Text style={styles.sectionTitle}>Descripción del Problema</Text>
                  <TextInput
                    style={styles.descriptionInput}
                    placeholder="Describe el problema ambiental que observas..."
                    placeholderTextColor="#999"
                    value={descripcion}
                    onChangeText={setDescripcion}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </LinearGradient>
              </View>

              {/* Location Section */}
              <View style={styles.locationSection}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
                  style={styles.locationCard}
                >
                  <View style={styles.locationHeader}>
                    <Ionicons name="location" size={24} color="#4CAF50" />
                    <Text style={styles.sectionTitle}>Ubicación</Text>
                    <TouchableOpacity onPress={getCurrentLocation} style={styles.refreshLocationButton}>
                      <Ionicons name="refresh" size={20} color="#2196F3" />
                    </TouchableOpacity>
                  </View>
                  
                  {location ? (
                    <View style={styles.locationInfo}>
                      <Text style={styles.locationText}>{direccion || 'Ventanilla, Lima'}</Text>
                      <Text style={styles.coordinatesText}>
                        Lat: {location.coords.latitude.toFixed(6)}, 
                        Lng: {location.coords.longitude.toFixed(6)}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.locationError}>Obteniendo ubicación...</Text>
                  )}
                </LinearGradient>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, loading && styles.buttonDisabled]}
                onPress={enviarReporte}
                disabled={loading}
              >
                <LinearGradient
                  colors={['#4CAF50', '#388E3C']}
                  style={styles.submitGradient}
                >
                  <Ionicons name="send" size={24} color="white" />
                  <Text style={styles.submitText}>
                    {loading ? 'Enviando...' : 'Enviar Reporte'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Tips Section */}
              <View style={styles.tipsSection}>
                <LinearGradient
                  colors={['rgba(255, 193, 7, 0.1)', 'rgba(255, 193, 7, 0.05)']}
                  style={styles.tipsCard}
                >
                  <View style={styles.tipsHeader}>
                    <Ionicons name="bulb" size={20} color="#FF9800" />
                    <Text style={styles.tipsTitle}>Consejos para un buen reporte:</Text>
                  </View>
                  <Text style={styles.tipsText}>
                    • Toma fotos claras del problema
                  </Text>
                  <Text style={styles.tipsText}>
                    • Describe con detalle lo que observas
                  </Text>
                  <Text style={styles.tipsText}>
                    • Incluye referencias de ubicación
                  </Text>
                  <Text style={styles.tipsText}>
                    • Mantén tu seguridad al reportar
                  </Text>
                </LinearGradient>
              </View>

              <View style={styles.bottomSpacing} />
            </ScrollView>
          </KeyboardAvoidingView>
        </LinearGradient>
      </ImageBackground>
    </SafeAreaView>
  );
}

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
  keyboardContainer: {
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
  photoSection: {
    marginBottom: 16,
  },
  photoCard: {
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
    color: '#333',
    marginBottom: 16,
  },
  photoContainer: {
    alignItems: 'center',
  },
  photoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  changePhotoText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  photoPlaceholder: {
    height: 200,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  photoPlaceholderText: {
    marginTop: 12,
    fontSize: 16,
    color: '#999',
  },
  descriptionSection: {
    marginBottom: 16,
  },
  descriptionCard: {
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
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f8f9fa',
    minHeight: 120,
  },
  locationSection: {
    marginBottom: 16,
  },
  locationCard: {
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
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  refreshLocationButton: {
    marginLeft: 'auto',
    padding: 4,
  },
  locationInfo: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  locationText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  coordinatesText: {
    fontSize: 12,
    color: '#666',
  },
  locationError: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  submitButton: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  submitText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  tipsSection: {
    marginBottom: 16,
  },
  tipsCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F57C00',
    marginLeft: 8,
  },
  tipsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 20,
  },
});