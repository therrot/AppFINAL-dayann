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
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function PerfilScreen() {
  const [user, setUser] = useState<any>(null);
  const [reportes, setReportes] = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        await loadUserDetails(parsedUser.id);
        await loadNotifications(parsedUser.id);
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    }
    setLoading(false);
  };

  const loadUserDetails = async (userId: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/usuarios/${userId}`);
      setUser(response.data);
      
      // Update local storage with latest user data
      await AsyncStorage.setItem('user', JSON.stringify(response.data));
      
      // Load user reports
      const reportesResponse = await axios.get(`${API_URL}/api/reportes/${userId}`);
      setReportes(reportesResponse.data.reportes);
    } catch (error) {
      console.log('Error loading user details:', error);
    }
  };

  const loadNotifications = async (userId: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/notificaciones/${userId}`);
      setNotificaciones(response.data.notificaciones);
    } catch (error) {
      console.log('Error loading notifications:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  const logout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('token');
              await AsyncStorage.removeItem('user');
              router.replace('/auth/login');
            } catch (error) {
              console.log('Error during logout:', error);
            }
          }
        }
      ]
    );
  };

  const getBadgeIcon = (logro: string) => {
    switch (logro) {
      case 'Primer Reporte':
        return 'medal';
      case 'Eco Warrior':
        return 'leaf';
      case 'Defensor Verde':
        return 'shield';
      default:
        return 'star';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando perfil...</Text>
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
          colors={['rgba(46, 125, 50, 0.95)', 'rgba(33, 150, 243, 0.9)']}
          style={styles.gradient}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Ionicons name="person" size={30} color="#FFD700" />
              <Text style={styles.headerTitle}>Mi Perfil</Text>
            </View>
            <TouchableOpacity onPress={logout} style={styles.logoutButton}>
              <Ionicons name="log-out" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.content}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          >
            {/* Profile Card */}
            <View style={styles.profileCard}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
                style={styles.profileGradient}
              >
                <View style={styles.profileHeader}>
                  <View style={styles.avatarContainer}>
                    <LinearGradient
                      colors={['#4CAF50', '#2E7D32']}
                      style={styles.avatarGradient}
                    >
                      <Ionicons name="person" size={40} color="white" />
                    </LinearGradient>
                  </View>
                  <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>{user?.nombre || 'Usuario'}</Text>
                    <Text style={styles.profileEmail}>{user?.email}</Text>
                    <View style={styles.memberSince}>
                      <Ionicons name="calendar" size={14} color="#666" />
                      <Text style={styles.memberSinceText}>
                        Miembro desde {user?.fecha_registro ? formatDate(user.fecha_registro) : '2024'}
                      </Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <LinearGradient
                  colors={['#FFD700', '#FFA000']}
                  style={styles.statGradient}
                >
                  <Ionicons name="trophy" size={30} color="white" />
                  <Text style={styles.statNumber}>{user?.puntos || 0}</Text>
                  <Text style={styles.statLabel}>Puntos</Text>
                </LinearGradient>
              </View>
              
              <View style={styles.statCard}>
                <LinearGradient
                  colors={['#4CAF50', '#2E7D32']}
                  style={styles.statGradient}
                >
                  <Ionicons name="camera" size={30} color="white" />
                  <Text style={styles.statNumber}>{user?.reportes_enviados || 0}</Text>
                  <Text style={styles.statLabel}>Reportes</Text>
                </LinearGradient>
              </View>
              
              <View style={styles.statCard}>
                <LinearGradient
                  colors={['#FF9800', '#F57C00']}
                  style={styles.statGradient}
                >
                  <Ionicons name="medal" size={30} color="white" />
                  <Text style={styles.statNumber}>{user?.logros?.length || 0}</Text>
                  <Text style={styles.statLabel}>Logros</Text>
                </LinearGradient>
              </View>
            </View>

            {/* Achievements */}
            <View style={styles.achievementsContainer}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
                style={styles.achievementsGradient}
              >
                <View style={styles.sectionHeader}>
                  <Ionicons name="medal" size={24} color="#FF9800" />
                  <Text style={styles.sectionTitle}>Logros Obtenidos</Text>
                </View>
                
                {user?.logros && user.logros.length > 0 ? (
                  <View style={styles.badgesContainer}>
                    {user.logros.map((logro: string, index: number) => (
                      <View key={index} style={styles.badge}>
                        <Ionicons name={getBadgeIcon(logro) as any} size={24} color="#FF9800" />
                        <Text style={styles.badgeText}>{logro}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="medal-outline" size={40} color="#ccc" />
                    <Text style={styles.emptyStateText}>Aún no tienes logros</Text>
                    <Text style={styles.emptyStateSubtext}>Comienza a reportar para desbloquear logros</Text>
                  </View>
                )}
              </LinearGradient>
            </View>

            {/* Recent Activity */}
            <View style={styles.activityContainer}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
                style={styles.activityGradient}
              >
                <View style={styles.sectionHeader}>
                  <Ionicons name="time" size={24} color="#2196F3" />
                  <Text style={styles.sectionTitle}>Actividad Reciente</Text>
                </View>
                
                {reportes.length > 0 ? (
                  <View>
                    {reportes.slice(0, 3).map((reporte: any, index: number) => (
                      <View key={index} style={styles.activityItem}>
                        <View style={styles.activityIcon}>
                          <Ionicons name="camera" size={20} color="#4CAF50" />
                        </View>
                        <View style={styles.activityContent}>
                          <Text style={styles.activityTitle}>Reporte enviado</Text>
                          <Text style={styles.activityDescription}>
                            {reporte.descripcion?.substring(0, 50)}...
                          </Text>
                          <Text style={styles.activityDate}>
                            {formatDate(reporte.fecha)}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="time-outline" size={40} color="#ccc" />
                    <Text style={styles.emptyStateText}>No hay actividad reciente</Text>
                    <Text style={styles.emptyStateSubtext}>Haz tu primer reporte para comenzar</Text>
                  </View>
                )}
              </LinearGradient>
            </View>

            {/* Notifications */}
            <View style={styles.notificationsContainer}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
                style={styles.notificationsGradient}
              >
                <View style={styles.sectionHeader}>
                  <Ionicons name="notifications" size={24} color="#9C27B0" />
                  <Text style={styles.sectionTitle}>Notificaciones</Text>
                  {notificaciones.length > 0 && (
                    <View style={styles.notificationBadge}>
                      <Text style={styles.notificationBadgeText}>{notificaciones.length}</Text>
                    </View>
                  )}
                </View>
                
                {notificaciones.length > 0 ? (
                  <View>
                    {notificaciones.slice(0, 3).map((notif: any, index: number) => (
                      <View key={index} style={styles.notificationItem}>
                        <View style={styles.notificationIcon}>
                          <Ionicons name="notifications" size={16} color="#9C27B0" />
                        </View>
                        <View style={styles.notificationContent}>
                          <Text style={styles.notificationText}>{notif.mensaje}</Text>
                          <Text style={styles.notificationDate}>
                            {formatDate(notif.fecha)}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="notifications-outline" size={40} color="#ccc" />
                    <Text style={styles.emptyStateText}>No hay notificaciones</Text>
                  </View>
                )}
              </LinearGradient>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity style={styles.actionButton}>
                <LinearGradient
                  colors={['#2196F3', '#1976D2']}
                  style={styles.actionButtonGradient}
                >
                  <Ionicons name="settings" size={20} color="white" />
                  <Text style={styles.actionButtonText}>Configuración</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => {
                  Alert.alert(
                    'Términos y Condiciones',
                    'VENTANILLA RECICLA CONTIGO v1.0.0\n\nCreado por: Fernando Rufasto\n\nAplicación móvil para el cuidado del medio ambiente en Ventanilla, Lima, Perú.\n\n• Los reportes enviados serán públicos para la comunidad\n• Tu privacidad es importante para nosotros\n• El sistema de puntos e incentivos está sujeto a disponibilidad\n\nContacto: Municipalidad de Ventanilla\n\n© 2024 Fernando Rufasto. Todos los derechos reservados.',
                    [{ text: 'Aceptar' }]
                  );
                }}
              >
                <LinearGradient
                  colors={['#4CAF50', '#388E3C']}
                  style={styles.actionButtonGradient}
                >
                  <Ionicons name="document-text" size={20} color="white" />
                  <Text style={styles.actionButtonText}>Términos</Text>
                </LinearGradient>
              </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
  logoutButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  profileCard: {
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
  profileGradient: {
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatarGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  memberSince: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberSinceText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  statGradient: {
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'white',
    opacity: 0.9,
  },
  achievementsContainer: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  achievementsGradient: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 14,
    color: '#F57C00',
    marginLeft: 6,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginTop: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 4,
    textAlign: 'center',
  },
  activityContainer: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  activityGradient: {
    padding: 20,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  activityDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  activityDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  notificationsContainer: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  notificationsGradient: {
    padding: 20,
  },
  notificationBadge: {
    backgroundColor: '#F44336',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  notificationIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3E5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
  },
  notificationDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 20,
  },
});