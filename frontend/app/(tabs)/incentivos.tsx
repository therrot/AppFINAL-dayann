import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ImageBackground,
  RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function IncentivosScreen() {
  const [incentivos, setIncentivos] = useState([]);
  const [user, setUser] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await loadUserData();
    await loadIncentivos();
    setLoading(false);
  };

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

  const loadIncentivos = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/incentivos`);
      setIncentivos(response.data.incentivos);
    } catch (error) {
      console.log('Error loading incentivos:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const canjearIncentivo = async (incentivo: any) => {
    if (!user) {
      Alert.alert('Error', 'Debes iniciar sesión para canjear incentivos');
      return;
    }

    const puntosUsuario = user.puntos || 0;
    
    if (puntosUsuario < incentivo.puntos_requeridos) {
      Alert.alert(
        'Puntos Insuficientes',
        `Necesitas ${incentivo.puntos_requeridos} puntos para canjear este incentivo. Actualmente tienes ${puntosUsuario} puntos.\n\n¡Sigue reportando para ganar más puntos!`
      );
      return;
    }

    Alert.alert(
      'Confirmar Canje',
      `¿Quieres canjear "${incentivo.nombre}" por ${incentivo.puntos_requeridos} puntos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Canjear',
          onPress: async () => {
            try {
              const response = await axios.post(`${API_URL}/api/canjear`, {
                incentivo_id: incentivo.id,
                usuario_id: user.id
              });

              Alert.alert(
                '¡Canje Exitoso!',
                'Tu incentivo ha sido canjeado exitosamente. Pronto recibirás más información sobre cómo reclamarlo.',
                [
                  {
                    text: 'Continuar',
                    onPress: () => {
                      // Update user points locally
                      const newUser = {
                        ...user,
                        puntos: puntosUsuario - incentivo.puntos_requeridos
                      };
                      setUser(newUser);
                      AsyncStorage.setItem('user', JSON.stringify(newUser));
                    }
                  }
                ]
              );
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.detail || 'Error al canjear incentivo');
            }
          }
        }
      ]
    );
  };

  const getCategoryIcon = (categoria: string) => {
    switch (categoria) {
      case 'Descuentos':
        return 'pricetag';
      case 'Regalos':
        return 'gift';
      case 'Productos':
        return 'cube';
      default:
        return 'star';
    }
  };

  const getCategoryColor = (categoria: string) => {
    switch (categoria) {
      case 'Descuentos':
        return ['#FF9800', '#F57C00'];
      case 'Regalos':
        return ['#E91E63', '#C2185B'];
      case 'Productos':
        return ['#9C27B0', '#7B1FA2'];
      default:
        return ['#4CAF50', '#388E3C'];
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando incentivos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={{ uri: 'https://customer-assets.emergentagent.com/job_recicla-contigo-1/artifacts/61qxumpg_ChatGPT%20Image%203%20oct%202025%2C%2010_52_44.png' }}
        style={styles.backgroundImage}
        blurRadius={8}
      >
        <LinearGradient
          colors={['rgba(46, 125, 50, 0.98)', 'rgba(33, 150, 243, 0.96)', 'rgba(0, 0, 0, 0.85)']}>
          style={styles.gradient}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Ionicons name="gift" size={30} color="#FFD700" />
              <Text style={styles.headerTitle}>Incentivos</Text>
            </View>
            <Text style={styles.headerSubtitle}>
              Canjea tus puntos por increibles recompensas
            </Text>
          </View>

          <ScrollView 
            style={styles.content}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          >
            {/* Points Card */}
            <View style={styles.pointsCard}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
                style={styles.pointsGradient}
              >
                <View style={styles.pointsHeader}>
                  <Ionicons name="trophy" size={40} color="#FFD700" />
                  <View style={styles.pointsInfo}>
                    <Text style={styles.pointsTitle}>Tus Puntos</Text>
                    <Text style={styles.pointsAmount}>{user?.puntos || 0}</Text>
                  </View>
                </View>
                <Text style={styles.pointsSubtext}>
                  Gana puntos reportando problemas ambientales y cámbialos por recompensas
                </Text>
              </LinearGradient>
            </View>

            {/* Incentivos List */}
            <View style={styles.incentivosContainer}>
              <Text style={styles.sectionTitle}>Recompensas Disponibles</Text>
              
              {incentivos.map((incentivo: any) => {
                const categoryColors = getCategoryColor(incentivo.categoria);
                const canAfford = (user?.puntos || 0) >= incentivo.puntos_requeridos;
                
                return (
                  <View key={incentivo.id} style={styles.incentivoCard}>
                    <LinearGradient
                      colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
                      style={styles.incentivoGradient}
                    >
                      <View style={styles.incentivoHeader}>
                        <View style={styles.incentivoIconContainer}>
                          <LinearGradient
                            colors={categoryColors}
                            style={styles.incentivoIconGradient}
                          >
                            <Ionicons 
                              name={getCategoryIcon(incentivo.categoria) as any} 
                              size={30} 
                              color="white" 
                            />
                          </LinearGradient>
                        </View>
                        <View style={styles.incentivoInfo}>
                          <Text style={styles.incentivoNombre}>{incentivo.nombre}</Text>
                          <View style={styles.categoryBadge}>
                            <Text style={styles.categoryText}>{incentivo.categoria}</Text>
                          </View>
                        </View>
                        <View style={styles.puntosContainer}>
                          <Ionicons name="star" size={16} color="#FFD700" />
                          <Text style={styles.puntosText}>{incentivo.puntos_requeridos}</Text>
                        </View>
                      </View>
                      
                      <Text style={styles.incentivoDescripcion}>
                        {incentivo.descripcion}
                      </Text>
                      
                      <TouchableOpacity
                        style={[
                          styles.canjearButton,
                          !canAfford && styles.canjearButtonDisabled
                        ]}
                        onPress={() => canjearIncentivo(incentivo)}
                        disabled={!canAfford}
                      >
                        <LinearGradient
                          colors={canAfford ? ['#4CAF50', '#388E3C'] : ['#9E9E9E', '#757575']}
                          style={styles.canjearGradient}
                        >
                          <Ionicons 
                            name={canAfford ? "checkmark-circle" : "lock-closed"} 
                            size={20} 
                            color="white" 
                          />
                          <Text style={styles.canjearText}>
                            {canAfford ? 'Canjear' : `Necesitas ${incentivo.puntos_requeridos - (user?.puntos || 0)} puntos más`}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </LinearGradient>
                  </View>
                );
              })}
            </View>

            {/* Call to Action */}
            <View style={styles.ctaCard}>
              <LinearGradient
                colors={['rgba(76, 175, 80, 0.1)', 'rgba(33, 150, 243, 0.1)']}
                style={styles.ctaGradient}
              >
                <Ionicons name="rocket" size={40} color="#4CAF50" />
                <Text style={styles.ctaTitle}>¿Necesitas más puntos?</Text>
                <Text style={styles.ctaText}>
                  Reporta problemas ambientales y gana 10 puntos por cada reporte validado
                </Text>
                <TouchableOpacity style={styles.ctaButton}>
                  <LinearGradient
                    colors={['#2196F3', '#1976D2']}
                    style={styles.ctaButtonGradient}
                  >
                    <Ionicons name="camera" size={20} color="white" />
                    <Text style={styles.ctaButtonText}>Hacer Reporte</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </View>

            <View style={styles.bottomSpacing} />
          </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
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
  pointsCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  pointsGradient: {
    padding: 24,
  },
  pointsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pointsInfo: {
    marginLeft: 16,
  },
  pointsTitle: {
    fontSize: 16,
    color: '#666',
  },
  pointsAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  pointsSubtext: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  incentivosContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  incentivoCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  incentivoGradient: {
    padding: 20,
  },
  incentivoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  incentivoIconContainer: {
    marginRight: 16,
  },
  incentivoIconGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  incentivoInfo: {
    flex: 1,
  },
  incentivoNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  categoryBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '600',
  },
  puntosContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  puntosText: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F57C00',
  },
  incentivoDescripcion: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  canjearButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  canjearButtonDisabled: {
    opacity: 0.7,
  },
  canjearGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  canjearText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  ctaCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  ctaGradient: {
    padding: 24,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 12,
    marginBottom: 8,
  },
  ctaText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  ctaButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  ctaButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  ctaButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 20,
  },
});