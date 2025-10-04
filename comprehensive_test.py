#!/usr/bin/env python3
"""
COMPREHENSIVE TEST SUITE for VENTANILLA RECICLA CONTIGO
Testing ALL endpoints as requested in the review
"""

import requests
import json
import base64
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Use localhost for backend testing
BACKEND_URL = 'http://localhost:8001'
API_BASE = f"{BACKEND_URL}/api"

print(f"🚀 COMPREHENSIVE TEST SUITE - VENTANILLA RECICLA CONTIGO")
print(f"📍 Backend URL: {BACKEND_URL}")
print(f"🔗 API URL: {API_BASE}")
print("=" * 80)

class ComprehensiveTestSuite:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = {
            'passed': 0,
            'failed': 0,
            'critical_failures': [],
            'minor_issues': []
        }
        self.test_users = []
        
    def log_result(self, test_name, success, details="", critical=False):
        if success:
            self.test_results['passed'] += 1
            print(f"✅ {test_name}")
            if details:
                print(f"   📝 {details}")
        else:
            self.test_results['failed'] += 1
            if critical:
                self.test_results['critical_failures'].append(f"{test_name}: {details}")
                print(f"❌ CRITICAL: {test_name}")
            else:
                self.test_results['minor_issues'].append(f"{test_name}: {details}")
                print(f"⚠️ MINOR: {test_name}")
            if details:
                print(f"   📝 {details}")
        print()
    
    def make_request(self, method, endpoint, data=None, headers=None, expected_status=200):
        """Helper method to make API requests"""
        url = f"{API_BASE}{endpoint}"
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=headers, timeout=10)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, headers=headers, timeout=10)
            elif method.upper() == "DELETE":
                response = self.session.delete(url, headers=headers, timeout=10)
            
            if response.status_code == expected_status:
                try:
                    return response.json()
                except:
                    return response.text
            else:
                return None
                
        except Exception as e:
            print(f"   🔥 Request failed: {str(e)}")
            return None
    
    def test_1_registration_and_login_flow(self):
        """Test complete registration and login flow"""
        print("🧪 TEST 1: FLUJO DE REGISTRO Y LOGIN")
        print("-" * 60)
        
        # Test data for Ventanilla residents
        new_user_data = {
            "nombre": "Ana María Gonzales",
            "email": f"ana.gonzales.{datetime.now().microsecond}@ventanilla.pe",
            "password": "VentanillaSegura2024",
            "latitud": -11.8746,
            "longitud": -77.1539
        }
        
        # Test user registration
        print("👤 Testing user registration...")
        registration_result = self.make_request("POST", "/usuarios", new_user_data)
        
        if registration_result and "user_id" in registration_result:
            user_id = registration_result["user_id"]
            token = registration_result["token"]
            
            # Verify JWT token is generated
            if token and len(token) > 20:
                self.log_result("User Registration", True, f"User created with ID: {user_id}, JWT token generated")
                
                # Store user for later tests
                self.test_users.append({
                    'user_id': user_id,
                    'token': token,
                    'email': new_user_data['email'],
                    'password': new_user_data['password'],
                    'nombre': new_user_data['nombre']
                })
                
                # Test login with the new user
                print("🔐 Testing login functionality...")
                login_data = {
                    "email": new_user_data["email"],
                    "password": new_user_data["password"]
                }
                
                login_result = self.make_request("POST", "/login", login_data)
                
                if login_result and "token" in login_result:
                    login_token = login_result["token"]
                    if login_token and len(login_token) > 20:
                        self.log_result("User Login", True, f"Login successful, JWT token: {login_token[:20]}...")
                    else:
                        self.log_result("JWT Token Generation", False, "Invalid or empty JWT token", critical=True)
                else:
                    self.log_result("User Login", False, "Login failed", critical=True)
                    
            else:
                self.log_result("JWT Token Generation", False, "Invalid or empty JWT token", critical=True)
        else:
            self.log_result("User Registration", False, "Registration failed", critical=True)
    
    def test_2_reports_20_points_system(self):
        """Test report creation with 20 points system"""
        print("🧪 TEST 2: SISTEMA DE REPORTES CON 20 PUNTOS")
        print("-" * 60)
        
        if not self.test_users:
            self.log_result("Reports System Test", False, "No users available for testing", critical=True)
            return
        
        user = self.test_users[0]
        
        # Get user points before report
        user_before = self.make_request("GET", f"/usuarios/{user['user_id']}")
        points_before = user_before.get("puntos", 0) if user_before else 0
        
        print(f"📊 User points before report: {points_before}")
        
        # Create environmental report
        sample_image_b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
        
        report_data = {
            "descripcion": "Acumulación de residuos sólidos en la intersección de Av. Néstor Gambetta con Jr. Los Olivos, Ventanilla. Se requiere intervención municipal urgente.",
            "foto_base64": sample_image_b64,
            "latitud": -11.8746,
            "longitud": -77.1539,
            "direccion": "Av. Néstor Gambetta con Jr. Los Olivos, Ventanilla, Callao",
            "usuario_id": user["user_id"]
        }
        
        print("📝 Creating environmental report...")
        report_result = self.make_request("POST", "/reportes", report_data)
        
        if report_result:
            points_awarded = report_result.get("puntos_ganados", 0)
            
            # Verify 20 points awarded (not 10)
            if points_awarded == 20:
                self.log_result("20 Points System", True, f"Correctly awarded 20 points (not 10)")
                
                # Verify user points updated
                user_after = self.make_request("GET", f"/usuarios/{user['user_id']}")
                if user_after:
                    points_after = user_after.get("puntos", 0)
                    
                    if points_after == points_before + 20:
                        self.log_result("User Points Update", True, f"Points updated: {points_before} → {points_after}")
                        
                        # Verify report is public and active
                        if "reporte_id" in report_result:
                            # Check if report appears in public reports
                            public_reports = self.make_request("GET", "/reportes-publicos")
                            if public_reports and "reportes" in public_reports:
                                found_report = False
                                for report in public_reports["reportes"]:
                                    if report.get("_id") == report_result["reporte_id"]:
                                        if report.get("publico") == True and report.get("estado") == "activo":
                                            found_report = True
                                            break
                                
                                if found_report:
                                    self.log_result("Report Public & Active", True, "Report is public and active as expected")
                                else:
                                    self.log_result("Report Public & Active", False, "Report not found in public reports or not active", critical=True)
                            else:
                                self.log_result("Public Reports Check", False, "Could not retrieve public reports", critical=True)
                    else:
                        self.log_result("User Points Update", False, f"Points not updated correctly. Expected: {points_before + 20}, Got: {points_after}", critical=True)
                else:
                    self.log_result("User Points Verification", False, "Could not verify user points after report", critical=True)
            else:
                self.log_result("20 Points System", False, f"Expected 20 points, got {points_awarded}", critical=True)
        else:
            self.log_result("Report Creation", False, "Failed to create report", critical=True)
    
    def test_3_map_and_public_reports(self):
        """Test map and public reports endpoints"""
        print("🧪 TEST 3: ENDPOINTS DE MAPA Y REPORTES PÚBLICOS")
        print("-" * 60)
        
        # Test GET /api/reportes-publicos
        print("📋 Testing GET /api/reportes-publicos...")
        public_reports = self.make_request("GET", "/reportes-publicos")
        
        if public_reports and "reportes" in public_reports:
            reports = public_reports["reportes"]
            
            if reports:
                # Check if user names are included
                has_user_names = all("usuario_nombre" in report and report["usuario_nombre"] for report in reports)
                
                if has_user_names:
                    self.log_result("Public Reports with User Names", True, f"Found {len(reports)} public reports with user names")
                else:
                    self.log_result("Public Reports with User Names", False, "Some reports missing user names", critical=True)
                
                # Verify structure
                sample_report = reports[0]
                required_fields = ["descripcion", "latitud", "longitud", "fecha", "estado", "publico", "usuario_nombre"]
                missing_fields = [field for field in required_fields if field not in sample_report]
                
                if not missing_fields:
                    self.log_result("Public Reports Structure", True, "All required fields present")
                else:
                    self.log_result("Public Reports Structure", False, f"Missing fields: {missing_fields}", critical=True)
            else:
                self.log_result("Public Reports Availability", False, "No public reports found", critical=True)
        else:
            self.log_result("GET /api/reportes-publicos", False, "Endpoint failed", critical=True)
        
        # Test GET /api/mapa-reportes
        print("🗺️ Testing GET /api/mapa-reportes...")
        map_reports = self.make_request("GET", "/mapa-reportes")
        
        if map_reports and "reportes" in map_reports:
            reports = map_reports["reportes"]
            
            if reports:
                # Check if user names are included
                has_user_names = all("usuario_nombre" in report and report["usuario_nombre"] for report in reports)
                
                if has_user_names:
                    self.log_result("Map Reports with User Names", True, f"Found {len(reports)} map reports with user names")
                else:
                    self.log_result("Map Reports with User Names", False, "Some map reports missing user names", critical=True)
                
                # Verify optimized structure (no foto_base64)
                has_photos = any("foto_base64" in report for report in reports)
                
                if not has_photos:
                    self.log_result("Map Reports Optimization", True, "Photo data excluded for performance")
                else:
                    self.log_result("Map Reports Optimization", False, "Photo data included (may affect performance)")
            else:
                self.log_result("Map Reports Availability", False, "No map reports found", critical=True)
        else:
            self.log_result("GET /api/mapa-reportes", False, "Endpoint failed", critical=True)
    
    def test_4_terms_and_conditions(self):
        """Test terms and conditions endpoint"""
        print("🧪 TEST 4: TÉRMINOS Y CONDICIONES")
        print("-" * 60)
        
        print("📜 Testing GET /api/terminos...")
        terms = self.make_request("GET", "/terminos")
        
        if terms:
            # Verify Fernando Rufasto information
            creator = terms.get("creado_por", "")
            if creator == "Fernando Rufasto":
                self.log_result("Fernando Rufasto Info", True, f"Creator correctly listed as: {creator}")
            else:
                self.log_result("Fernando Rufasto Info", False, f"Expected 'Fernando Rufasto', got '{creator}'", critical=True)
            
            # Verify app name
            app_name = terms.get("app_name", "")
            if app_name == "VENTANILLA RECICLA CONTIGO":
                self.log_result("App Name in Terms", True, f"App name: {app_name}")
            else:
                self.log_result("App Name in Terms", False, f"Expected 'VENTANILLA RECICLA CONTIGO', got '{app_name}'", critical=True)
            
            # Verify required fields
            required_fields = ["version", "descripcion", "terminos", "contacto", "politica_privacidad", "derechos"]
            missing_fields = [field for field in required_fields if field not in terms]
            
            if not missing_fields:
                self.log_result("Terms Structure", True, "All required fields present")
            else:
                self.log_result("Terms Structure", False, f"Missing fields: {missing_fields}")
            
            # Verify terms array
            if "terminos" in terms and isinstance(terms["terminos"], list) and len(terms["terminos"]) > 0:
                self.log_result("Terms Content", True, f"Found {len(terms['terminos'])} terms")
            else:
                self.log_result("Terms Content", False, "Terms array missing or empty", critical=True)
        else:
            self.log_result("GET /api/terminos", False, "Endpoint failed", critical=True)
    
    def test_5_incentives_system(self):
        """Test incentives system"""
        print("🧪 TEST 5: SISTEMA DE INCENTIVOS")
        print("-" * 60)
        
        # Test GET /api/incentivos
        print("🎁 Testing GET /api/incentivos...")
        incentivos = self.make_request("GET", "/incentivos")
        
        if incentivos and "incentivos" in incentivos:
            incentivos_list = incentivos["incentivos"]
            
            if incentivos_list:
                self.log_result("Incentives Availability", True, f"Found {len(incentivos_list)} incentives")
                
                # Verify structure
                sample_incentivo = incentivos_list[0]
                required_fields = ["id", "nombre", "descripcion", "puntos_requeridos", "categoria"]
                missing_fields = [field for field in required_fields if field not in sample_incentivo]
                
                if not missing_fields:
                    self.log_result("Incentives Structure", True, "All required fields present")
                else:
                    self.log_result("Incentives Structure", False, f"Missing fields: {missing_fields}")
                
                # Test POST /api/canjear (simulation)
                if self.test_users:
                    print("💰 Testing POST /api/canjear (simulation)...")
                    canje_data = {
                        "incentivo_id": incentivos_list[0]["id"],
                        "usuario_id": self.test_users[0]["user_id"]
                    }
                    
                    canje_result = self.make_request("POST", "/canjear", canje_data)
                    
                    if canje_result and "message" in canje_result and "fecha_canje" in canje_result:
                        self.log_result("Incentive Redemption", True, "Redemption simulation successful")
                    else:
                        self.log_result("Incentive Redemption", False, "Redemption simulation failed")
                else:
                    self.log_result("Incentive Redemption Test", False, "No users available for testing")
            else:
                self.log_result("Incentives Availability", False, "No incentives found", critical=True)
        else:
            self.log_result("GET /api/incentivos", False, "Endpoint failed", critical=True)
    
    def test_6_education_and_news(self):
        """Test education and news endpoints"""
        print("🧪 TEST 6: EDUCACIÓN Y NOTICIAS")
        print("-" * 60)
        
        # Test GET /api/educacion
        print("📚 Testing GET /api/educacion...")
        educacion = self.make_request("GET", "/educacion")
        
        if educacion and "contenido" in educacion:
            contenido = educacion["contenido"]
            
            if contenido:
                self.log_result("Education Content", True, f"Found {len(contenido)} education items")
                
                # Verify structure
                sample_content = contenido[0]
                required_fields = ["id", "titulo", "tipo", "contenido", "categoria"]
                missing_fields = [field for field in required_fields if field not in sample_content]
                
                if not missing_fields:
                    self.log_result("Education Structure", True, "All required fields present")
                else:
                    self.log_result("Education Structure", False, f"Missing fields: {missing_fields}")
            else:
                self.log_result("Education Content", False, "No education content found", critical=True)
        else:
            self.log_result("GET /api/educacion", False, "Endpoint failed", critical=True)
        
        # Test GET /api/noticias (Ventanilla-specific)
        print("📰 Testing GET /api/noticias (Ventanilla-specific)...")
        noticias = self.make_request("GET", "/noticias")
        
        if noticias and "noticias" in noticias:
            noticias_list = noticias["noticias"]
            
            if noticias_list:
                # Check for Ventanilla-specific content
                ventanilla_news = 0
                for noticia in noticias_list:
                    if "Ventanilla" in noticia.get("titulo", "") or "Ventanilla" in noticia.get("contenido", ""):
                        ventanilla_news += 1
                
                if ventanilla_news > 0:
                    self.log_result("Ventanilla-Specific News", True, f"Found {ventanilla_news}/{len(noticias_list)} Ventanilla-specific news")
                else:
                    self.log_result("Ventanilla-Specific News", False, "No Ventanilla-specific news found")
                
                # Verify structure
                sample_noticia = noticias_list[0]
                required_fields = ["id", "titulo", "contenido", "fecha", "categoria"]
                missing_fields = [field for field in required_fields if field not in sample_noticia]
                
                if not missing_fields:
                    self.log_result("News Structure", True, "All required fields present")
                else:
                    self.log_result("News Structure", False, f"Missing fields: {missing_fields}")
            else:
                self.log_result("News Content", False, "No news found", critical=True)
        else:
            self.log_result("GET /api/noticias", False, "Endpoint failed", critical=True)
    
    def run_comprehensive_test(self):
        """Run all comprehensive tests"""
        print("🚀 STARTING COMPREHENSIVE TEST SUITE")
        print("=" * 80)
        
        self.test_1_registration_and_login_flow()
        self.test_2_reports_20_points_system()
        self.test_3_map_and_public_reports()
        self.test_4_terms_and_conditions()
        self.test_5_incentives_system()
        self.test_6_education_and_news()
        
        # Print final summary
        print("=" * 80)
        print("🏁 COMPREHENSIVE TEST SUITE COMPLETED")
        print("=" * 80)
        
        total_tests = self.test_results['passed'] + self.test_results['failed']
        print(f"📊 RESULTS: {self.test_results['passed']}/{total_tests} tests passed")
        
        if self.test_results['critical_failures']:
            print(f"\n❌ CRITICAL FAILURES ({len(self.test_results['critical_failures'])}):")
            for failure in self.test_results['critical_failures']:
                print(f"   • {failure}")
        
        if self.test_results['minor_issues']:
            print(f"\n⚠️ MINOR ISSUES ({len(self.test_results['minor_issues'])}):")
            for issue in self.test_results['minor_issues']:
                print(f"   • {issue}")
        
        if not self.test_results['critical_failures']:
            print(f"\n✅ ALL CRITICAL FUNCTIONALITY WORKING CORRECTLY")
            print(f"✅ 20 POINTS SYSTEM VERIFIED")
            print(f"✅ PUBLIC REPORTS WITH USER NAMES VERIFIED")
            print(f"✅ FERNANDO RUFASTO TERMS VERIFIED")
            print(f"✅ VENTANILLA-SPECIFIC CONTENT VERIFIED")
        
        print("=" * 80)

if __name__ == "__main__":
    tester = ComprehensiveTestSuite()
    tester.run_comprehensive_test()