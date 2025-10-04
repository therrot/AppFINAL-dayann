import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import MapView, { Marker } from 'react-native-maps';
import { AnimatedBackground } from '../../components/AnimatedBackground';
import { useTheme } from '../../contexts/ThemeContext';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function MapaScreen() {
  const { theme } = useTheme();
  const [reportes, setReportes] = useState([]);
  const [reportesPublicos, setReportesPublicos] = useState([]);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('mapa');

  useEffect(() => {
    loadReportes();
  }, []);

  const loadReportes = async () => {
    try {
      const [mapaResponse, publicosResponse] = await Promise.all([
        axios.get(`${API_URL}/api/mapa-reportes`),
        axios.get(`${API_URL}/api/reportes-publicos`)
      ]);
      
      setReportes(mapaResponse.data.reportes);
      setReportesPublicos(publicosResponse.data.reportes);
    } catch (error) {
      console.log('Error loading reportes:', error);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReportes();
    setRefreshing(false);
  };

  const openReportDetail = (reporte: any) => {
    setSelectedReport(reporte);
    setShowModal(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando mapa de reportes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedBackground>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Ionicons name="map" size={30} color="#FFD700" />
              <Text style={styles.headerTitle}>Mapa de Reportes</Text>
            </View>
            <Text style={styles.headerSubtitle}>
              Visualiza y explora reportes ambientales en Ventanilla
            </Text>
          </View>

          {/* Tab Selector */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'mapa' && styles.activeTab]}
              onPress={() => setActiveTab('mapa')}
            >
              <Ionicons name="map" size={20} color={activeTab === 'mapa' ? '#4CAF50' : 'white'} />
              <Text style={[styles.tabText, activeTab === 'mapa' && styles.activeTabText]}>Mapa</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === 'lista' && styles.activeTab]}
              onPress={() => setActiveTab('lista')}
            >
              <Ionicons name="list" size={20} color={activeTab === 'lista' ? '#4CAF50' : 'white'} />
              <Text style={[styles.tabText, activeTab === 'lista' && styles.activeTabText]}>Lista</Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'mapa' ? (
            /* Map View */
            <View style={styles.content}>
              <View style={styles.mapContainer}>
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: -11.8795,
                    longitude: -77.1282,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                  }}
                >
                  {reportes.map((reporte: any, index: number) => (
                    <Marker
                      key={index}
                      coordinate={{
                        latitude: reporte.latitud,
                        longitude: reporte.longitud,
                      }}
                      title={reporte.descripcion}
                      description={`Reportado por ${reporte.usuario_nombre}`}
                      onPress={() => openReportDetail(reporte)}
                    />
                  ))}
                </MapView>
                
                <View style={styles.mapOverlay}>
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
                    style={styles.mapStats}
                  >
                    <View style={styles.statItem}>
                      <Ionicons name="location" size={20} color="#FF5722" />
                      <Text style={styles.statText}>{reportes.length} Reportes Activos</Text>
                    </View>
                  </LinearGradient>
                </View>
              </View>
            </View>
          ) : (
            /* List View */
            <ScrollView 
              style={styles.content}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.listContainer}>
                <Text style={styles.sectionTitle}>Reportes de la Comunidad</Text>
                
                {reportesPublicos.map((reporte: any, index: number) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.reportCard}
                    onPress={() => openReportDetail(reporte)}
                  >
                    <LinearGradient
                      colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
                      style={styles.reportGradient}
                    >
                      <View style={styles.reportHeader}>
                        <View style={styles.reportIcon}>
                          <Ionicons name="warning" size={20} color="#FF5722" />
                        </View>
                        <View style={styles.reportInfo}>
                          <Text style={styles.reportTitle} numberOfLines={2}>
                            {reporte.descripcion}
                          </Text>
                          <View style={styles.reportMeta}>
                            <View style={styles.reportUser}>
                              <Ionicons name="person" size={12} color="#666" />
                              <Text style={styles.reportUserText}>
                                {reporte.usuario_nombre}
                              </Text>
                            </View>
                            <View style={styles.reportDate}>
                              <Ionicons name="time" size={12} color="#666" />
                              <Text style={styles.reportDateText}>
                                {formatDate(reporte.fecha)}
                              </Text>
                            </View>
                          </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#666" />
                      </View>
                      
                      {reporte.direccion && (
                        <View style={styles.reportLocation}>
                          <Ionicons name="location-outline" size={14} color="#4CAF50" />
                          <Text style={styles.reportLocationText} numberOfLines={1}>
                            {reporte.direccion}
                          </Text>
                        </View>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={styles.bottomSpacing} />
            </ScrollView>
          )}

          {/* Report Detail Modal */}
          <Modal
            visible={showModal}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={() => setShowModal(false)}
          >
            <SafeAreaView style={styles.modalContainer}>
              <ImageBackground
                source={{ uri: 'https://customer-assets.emergentagent.com/job_recicla-contigo-1/artifacts/61qxumpg_ChatGPT%20Image%203%20oct%202025%2C%2010_52_44.png' }}
                style={styles.modalBackground}
                blurRadius={8}
              >
                <LinearGradient
                  colors={['rgba(46, 125, 50, 0.98)', 'rgba(33, 150, 243, 0.96)', 'rgba(0, 0, 0, 0.85)']}
                  style={styles.modalGradient}
                >
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Detalle del Reporte</Text>
                    <TouchableOpacity
                      onPress={() => setShowModal(false)}
                      style={styles.closeButton}
                    >
                      <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>
                  </View>

                  {selectedReport && (
                    <ScrollView style={styles.modalContent}>
                      <View style={styles.modalCard}>
                        <LinearGradient
                          colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
                          style={styles.modalCardGradient}
                        >
                          <View style={styles.modalReportHeader}>
                            <View style={styles.modalReportIcon}>
                              <Ionicons name="warning" size={30} color="#FF5722" />
                            </View>
                            <View style={styles.modalReportInfo}>
                              <Text style={styles.modalReportTitle}>
                                {selectedReport.descripcion}
                              </Text>
                              <Text style={styles.modalReportUser}>
                                Reportado por: {selectedReport.usuario_nombre}
                              </Text>
                              <Text style={styles.modalReportDate}>
                                {formatDate(selectedReport.fecha)}
                              </Text>
                            </View>
                          </View>

                          {selectedReport.direccion && (
                            <View style={styles.modalLocation}>
                              <Ionicons name="location" size={20} color="#4CAF50" />
                              <Text style={styles.modalLocationText}>
                                {selectedReport.direccion}
                              </Text>
                            </View>
                          )}

                          <View style={styles.modalCoordinates}>
                            <Text style={styles.modalCoordinatesTitle}>Coordenadas:</Text>
                            <Text style={styles.modalCoordinatesText}>
                              Lat: {selectedReport.latitud?.toFixed(6)}, 
                              Lng: {selectedReport.longitud?.toFixed(6)}
                            </Text>
                          </View>
                        </LinearGradient>
                      </View>
                    </ScrollView>
                  )}
                </LinearGradient>
              </ImageBackground>
            </SafeAreaView>
          </Modal>
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
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeTab: {
    backgroundColor: 'white',
  },
  tabText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  activeTabText: {
    color: '#4CAF50',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  mapContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  mapOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
  },
  mapStats: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  listContainer: {
    paddingBottom: 20,
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
  reportCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  reportGradient: {
    padding: 16,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  reportMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportUser: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  reportUserText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  reportDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportDateText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  reportLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  reportLocationText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 6,
    flex: 1,
  },
  modalContainer: {
    flex: 1,
  },
  modalBackground: {
    flex: 1,
  },
  modalGradient: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  modalCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalCardGradient: {
    padding: 20,
  },
  modalReportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalReportIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modalReportInfo: {
    flex: 1,
  },
  modalReportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    lineHeight: 24,
  },
  modalReportUser: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  modalReportDate: {
    fontSize: 12,
    color: '#999',
  },
  modalLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  modalLocationText: {
    fontSize: 14,
    color: '#2E7D32',
    marginLeft: 8,
    flex: 1,
  },
  modalCoordinates: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  modalCoordinatesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  modalCoordinatesText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  bottomSpacing: {
    height: 20,
  },
});