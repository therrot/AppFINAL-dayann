import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function HomeScreen() {
  const [user, setUser] = useState<any>(null);
  const [noticias, setNoticias] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserData();
    loadNoticias();
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

  const loadNoticias = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/noticias`);
      setNoticias(response.data.noticias.slice(0, 3)); // Show only 3 latest news
    } catch (error) {
      console.log('Error loading news:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNoticias();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'long'
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={{ uri: 'https://customer-assets.emergentagent.com/job_recicla-contigo-1/artifacts/61qxumpg_ChatGPT%20Image%203%20oct%202025%2C%2010_52_44.png' }}
        style={styles.backgroundImage}
        blurRadius={8}
      >
        <LinearGradient
          colors={['rgba(46, 125, 50, 0.98)', 'rgba(33, 150, 243, 0.96)', 'rgba(0, 0, 0, 0.85)']}
          style={styles.gradient}
        >
          <ScrollView 
            style={styles.scrollView}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <View style={styles.logoCircle}>
                  <Ionicons name="leaf" size={30} color="#FFD700" />
                </View>
                <View>
                  <Text style={styles.appTitle}>VENTANILLA</Text>
                  <Text style={styles.appSubtitle}>RECICLA CONTIGO</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.profileButton}>
                <Ionicons name="person-circle" size={40} color="white" />
              </TouchableOpacity>
            </View>

            {/* Welcome Card */}
            <View style={styles.welcomeCard}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
                style={styles.cardGradient}
              >
                <View style={styles.welcomeContent}>
                  <Text style={styles.welcomeTitle}>
                    ¡Hola {user?.nombre || 'Eco-Warrior'}! 🌱
                  </Text>
                  <Text style={styles.welcomeText}>
                    Gracias por cuidar nuestro planeta. Cada acción cuenta.
                  </Text>
                </View>
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Ionicons name="trophy" size={24} color="#FFD700" />
                    <Text style={styles.statNumber}>{user?.puntos || 0}</Text>
                    <Text style={styles.statLabel}>Puntos</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons name="camera" size={24} color="#4CAF50" />
                    <Text style={styles.statNumber}>{user?.reportes_enviados || 0}</Text>
                    <Text style={styles.statLabel}>Reportes</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons name="medal" size={24} color="#FF9800" />
                    <Text style={styles.statNumber}>{user?.logros?.length || 0}</Text>
                    <Text style={styles.statLabel}>Logros</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* Quick Actions */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
              <View style={styles.actionsGrid}>
                <TouchableOpacity 
                  style={styles.actionCard}
                  onPress={() => router.push('/(tabs)/reportar')}
                >
                  <LinearGradient
                    colors={['#4CAF50', '#2E7D32']}
                    style={styles.actionGradient}
                  >
                    <Ionicons name="camera" size={30} color="white" />
                    <Text style={styles.actionText}>Reportar</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionCard}
                  onPress={() => router.push('/(tabs)/educacion')}
                >
                  <LinearGradient
                    colors={['#2196F3', '#1976D2']}
                    style={styles.actionGradient}
                  >
                    <Ionicons name="book" size={30} color="white" />
                    <Text style={styles.actionText}>Aprender</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionCard}
                  onPress={() => router.push('/(tabs)/incentivos')}
                >
                  <LinearGradient
                    colors={['#FF9800', '#F57C00']}
                    style={styles.actionGradient}
                  >
                    <Ionicons name="gift" size={30} color="white" />
                    <Text style={styles.actionText}>Canjear</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionCard}>
                  <LinearGradient
                    colors={['#9C27B0', '#7B1FA2']}
                    style={styles.actionGradient}
                  >
                    <Ionicons name="people" size={30} color="white" />
                    <Text style={styles.actionText}>Ranking</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            {/* News Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Noticias Ambientales</Text>
              {noticias.map((noticia: any) => (
                <View key={noticia.id} style={styles.newsCard}>
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
                    style={styles.newsGradient}
                  >
                    <View style={styles.newsHeader}>
                      <View style={styles.newsCategoryBadge}>
                        <Text style={styles.newsCategoryText}>{noticia.categoria}</Text>
                      </View>
                      <Text style={styles.newsDate}>{formatDate(noticia.fecha)}</Text>
                    </View>
                    <Text style={styles.newsTitle}>{noticia.titulo}</Text>
                    <Text style={styles.newsContent} numberOfLines={3}>
                      {noticia.contenido}
                    </Text>
                  </LinearGradient>
                </View>
              ))}
            </View>

            {/* Call to Action */}
            <TouchableOpacity style={styles.ctaButton}>
              <LinearGradient
                colors={['#4CAF50', '#388E3C']}
                style={styles.ctaGradient}
              >
                <Ionicons name="leaf" size={24} color="white" />
                <Text style={styles.ctaText}>¡Haz tu primer reporte hoy!</Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </LinearGradient>
            </TouchableOpacity>

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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  appTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    letterSpacing: 1,
  },
  appSubtitle: {
    fontSize: 12,
    color: 'white',
    opacity: 0.9,
  },
  profileButton: {
    opacity: 0.8,
  },
  welcomeCard: {
    margin: 16,
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
  cardGradient: {
    padding: 20,
  },
  welcomeContent: {
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  sectionContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
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
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  actionGradient: {
    padding: 20,
    alignItems: 'center',
  },
  actionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
  },
  newsCard: {
    marginBottom: 12,
    borderRadius: 15,
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
  newsGradient: {
    padding: 16,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  newsCategoryBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  newsCategoryText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  newsDate: {
    fontSize: 12,
    color: '#666',
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  newsContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  ctaButton: {
    margin: 16,
    borderRadius: 15,
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
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  ctaText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 12,
  },
  bottomSpacing: {
    height: 20,
  },
});