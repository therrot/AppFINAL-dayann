import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ImageBackground,
  RefreshControl,
  Linking
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function EducacionScreen() {
  const [contenidoEducativo, setContenidoEducativo] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredContent, setFilteredContent] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const categories = ['Todos', 'Básico', 'Servicios Locales', 'Avanzado'];

  useEffect(() => {
    loadEducacionContent();
  }, []);

  useEffect(() => {
    filterContent();
  }, [searchText, contenidoEducativo, selectedCategory]);

  const loadEducacionContent = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/educacion`);
      setContenidoEducativo(response.data.contenido);
    } catch (error) {
      console.log('Error loading education content:', error);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEducacionContent();
    setRefreshing(false);
  };

  const filterContent = () => {
    let filtered = contenidoEducativo;

    // Filter by category
    if (selectedCategory !== 'Todos') {
      filtered = filtered.filter((item: any) => item.categoria === selectedCategory);
    }

    // Filter by search text
    if (searchText.trim()) {
      filtered = filtered.filter((item: any) => 
        item.titulo.toLowerCase().includes(searchText.toLowerCase()) ||
        item.contenido.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredContent(filtered);
  };

  const getTypeIcon = (tipo: string) => {
    switch (tipo) {
      case 'video':
        return 'play-circle';
      case 'articulo':
        return 'document-text';
      case 'informacion':
        return 'information-circle';
      default:
        return 'book';
    }
  };

  const getTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'video':
        return ['#F44336', '#D32F2F'];
      case 'articulo':
        return ['#2196F3', '#1976D2'];
      case 'informacion':
        return ['#4CAF50', '#388E3C'];
      default:
        return ['#FF9800', '#F57C00'];
    }
  };

  const getCategoryColor = (categoria: string) => {
    switch (categoria) {
      case 'Básico':
        return '#4CAF50';
      case 'Servicios Locales':
        return '#2196F3';
      case 'Avanzado':
        return '#FF9800';
      default:
        return '#666';
    }
  };

  const openVideo = async (url: string) => {
    if (url && url.startsWith('http')) {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.log("No se puede abrir la URL: " + url);
      }
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando contenido educativo...</Text>
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
          colors={['rgba(46, 125, 50, 0.98)', 'rgba(33, 150, 243, 0.96)', 'rgba(0, 0, 0, 0.85)']}
          style={styles.gradient}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Ionicons name="book" size={30} color="#FFD700" />
              <Text style={styles.headerTitle}>Educación Ambiental</Text>
            </View>
            <Text style={styles.headerSubtitle}>
              Aprende sobre reciclaje y cuidado ambiental en Ventanilla
            </Text>
          </View>

          <ScrollView 
            style={styles.content}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          >
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
                style={styles.searchGradient}
              >
                <View style={styles.searchInputContainer}>
                  <Ionicons name="search" size={20} color="#666" />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar contenido educativo..."
                    placeholderTextColor="#999"
                    value={searchText}
                    onChangeText={setSearchText}
                  />
                </View>
              </LinearGradient>
            </View>

            {/* Category Filter */}
            <View style={styles.categoriesContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      selectedCategory === category && styles.categoryButtonActive
                    ]}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <Text style={[
                      styles.categoryButtonText,
                      selectedCategory === category && styles.categoryButtonTextActive
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Content List */}
            <View style={styles.contentContainer}>
              <Text style={styles.sectionTitle}>
                {filteredContent.length} contenidos encontrados
              </Text>
              
              {filteredContent.map((item: any) => {
                const typeColors = getTypeColor(item.tipo);
                
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.contentCard}
                    onPress={() => {
                      if (item.tipo === 'video' && item.url) {
                        openVideo(item.url);
                      }
                    }}
                  >
                    <LinearGradient
                      colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
                      style={styles.contentGradient}
                    >
                      <View style={styles.contentHeader}>
                        <View style={styles.typeIconContainer}>
                          <LinearGradient
                            colors={typeColors}
                            style={styles.typeIconGradient}
                          >
                            <Ionicons 
                              name={getTypeIcon(item.tipo) as any} 
                              size={24} 
                              color="white" 
                            />
                          </LinearGradient>
                        </View>
                        
                        <View style={styles.contentInfo}>
                          <Text style={styles.contentTitle}>{item.titulo}</Text>
                          <View style={styles.contentMeta}>
                            <View style={[
                              styles.categoryTag,
                              { backgroundColor: getCategoryColor(item.categoria) + '20' }
                            ]}>
                              <Text style={[
                                styles.categoryTagText,
                                { color: getCategoryColor(item.categoria) }
                              ]}>
                                {item.categoria}
                              </Text>
                            </View>
                            {item.duracion && (
                              <View style={styles.durationTag}>
                                <Ionicons name="time" size={12} color="#666" />
                                <Text style={styles.durationText}>{item.duracion}</Text>
                              </View>
                            )}
                          </View>
                        </View>
                        
                        {item.tipo === 'video' && (
                          <Ionicons name="chevron-forward" size={20} color="#666" />
                        )}
                      </View>
                      
                      <Text style={styles.contentDescription}>
                        {item.contenido}
                      </Text>
                      
                      {item.tipo === 'video' && (
                        <View style={styles.videoCallout}>
                          <Ionicons name="play" size={16} color="#F44336" />
                          <Text style={styles.videoCalloutText}>
                            Toca para reproducir video
                          </Text>
                        </View>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Información Adicional de Ventanilla */}
            <View style={styles.additionalInfoContainer}>
              <LinearGradient
                colors={['rgba(76, 175, 80, 0.1)', 'rgba(33, 150, 243, 0.1)']}
                style={styles.additionalInfoGradient}
              >
                <View style={styles.infoHeader}>
                  <Ionicons name="location" size={24} color="#4CAF50" />
                  <Text style={styles.infoTitle}>Información Local - Ventanilla</Text>
                </View>
                
                <View style={styles.infoSection}>
                  <Text style={styles.infoSectionTitle}>Contactos Útiles:</Text>
                  <Text style={styles.infoText}>• Municipalidad de Ventanilla: (01) 552-8010</Text>
                  <Text style={styles.infoText}>• Emergencias Ambientales: 105</Text>
                  <Text style={styles.infoText}>• Serenazgo: (01) 552-4444</Text>
                </View>
                
                <View style={styles.infoSection}>
                  <Text style={styles.infoSectionTitle}>Puntos de Reciclaje:</Text>
                  <Text style={styles.infoText}>• Plaza Principal de Ventanilla</Text>
                  <Text style={styles.infoText}>• Mercado Central</Text>
                  <Text style={styles.infoText}>• Centro Cívico Municipal</Text>
                </View>
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
  searchContainer: {
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
  searchGradient: {
    padding: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    height: 44,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  categoryButtonActive: {
    backgroundColor: 'white',
  },
  categoryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryButtonTextActive: {
    color: '#4CAF50',
  },
  contentContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  contentCard: {
    marginBottom: 12,
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
  contentGradient: {
    padding: 16,
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeIconContainer: {
    marginRight: 12,
  },
  typeIconGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentInfo: {
    flex: 1,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  contentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  categoryTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  durationTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  contentDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  videoCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
  },
  videoCalloutText: {
    fontSize: 12,
    color: '#F44336',
    marginLeft: 6,
    fontWeight: '600',
  },
  additionalInfoContainer: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  additionalInfoGradient: {
    padding: 20,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginLeft: 8,
  },
  infoSection: {
    marginBottom: 16,
  },
  infoSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 4,
  },
  bottomSpacing: {
    height: 20,
  },
});