#!/usr/bin/env python3
"""
Backend API Testing for VENTANILLA RECICLA CONTIGO
Testing NEW FUNCTIONALITY: Profile photos, updated points system, public reports, and new endpoints
"""

import requests
import json
import base64
from datetime import datetime
import os
from dotenv import load_dotenv
import sys

load_dotenv()

# Use external URL from frontend environment
BASE_URL = "https://recicla-ventanilla.preview.emergentagent.com"
API_URL = f"{BASE_URL}/api"

print(f"🧪 Testing VENTANILLA RECICLA CONTIGO API - NEW FUNCTIONALITY")
print(f"📍 Backend URL: {BASE_URL}")
print(f"🔗 API URL: {API_URL}")
print("=" * 60)

# Test data for Ventanilla, Lima, Peru
test_users = [
    {
        "nombre": "Carmen Flores",
        "email": "carmen.flores@ventanilla.pe",
        "password": "EcoVentanilla2024",
        "latitud": -11.8746,
        "longitud": -77.1539
    },
    {
        "nombre": "Roberto Mendoza", 
        "email": "roberto.mendoza@ventanilla.pe",
        "password": "ReciclaLima2024",
        "latitud": -11.8756,
        "longitud": -77.1549
    }
]

# Sample base64 image (small test image)
sample_image_b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

class TestResults:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.errors = []
        self.critical_errors = []
    
    def add_pass(self, test_name):
        self.passed += 1
        print(f"  ✅ {test_name}")
    
    def add_fail(self, test_name, error, critical=False):
        self.failed += 1
        if critical:
            self.critical_errors.append(f"{test_name}: {error}")
            print(f"  ❌ CRITICAL: {test_name}: {error}")
        else:
            self.errors.append(f"{test_name}: {error}")
            print(f"  ❌ {test_name}: {error}")
    
    def summary(self):
        total = self.passed + self.failed
        print(f"\n{'='*60}")
        print(f"TEST SUMMARY: {self.passed}/{total} tests passed")
        if self.critical_errors:
            print(f"\nCRITICAL FAILURES:")
            for error in self.critical_errors:
                print(f"  - {error}")
        if self.errors:
            print(f"\nOTHER FAILURES:")
            for error in self.errors:
                print(f"  - {error}")
        print(f"{'='*60}")

results = TestResults()

def test_api_endpoint(method, endpoint, data=None, headers=None, expected_status=200):
    """Helper function to test API endpoints"""
    url = f"{API_URL}{endpoint}"
    try:
        if method.upper() == "GET":
            response = requests.get(url, headers=headers, timeout=10)
        elif method.upper() == "POST":
            response = requests.post(url, json=data, headers=headers, timeout=10)
        elif method.upper() == "DELETE":
            response = requests.delete(url, headers=headers, timeout=10)
        
        if response.status_code == expected_status:
            try:
                return response.json()
            except:
                return response.text
        else:
            print(f"    Status: {response.status_code}, Expected: {expected_status}")
            print(f"    Response: {response.text[:200]}...")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"    CONNECTION ERROR: {str(e)}")
        return None
    except Exception as e:
        print(f"    ERROR: {str(e)}")
        return None

def test_new_functionality():
    print("\n🔍 TESTING NEW FUNCTIONALITY")
    print("=" * 60)
    
    # Store user data for later tests
    created_users = []
    
    # Test 1: User Registration (to get users for testing reports)
    print("\n1️⃣ TESTING USER REGISTRATION")
    print("-" * 40)
    
    for i, user_data in enumerate(test_users):
        print(f"\n👤 Creating User {i+1}: {user_data['nombre']}")
        result = test_api_endpoint("POST", "/usuarios", user_data)
        if result and "user_id" in result:
            created_users.append({
                "user_id": result["user_id"],
                "token": result["token"],
                "nombre": user_data["nombre"],
                "email": user_data["email"]
            })
            print(f"    🆔 User ID: {result['user_id']}")
            print(f"    🎯 Initial Points: {result['usuario']['puntos']}")
            results.add_pass(f"User registration - {user_data['nombre']}")
        else:
            # User might already exist, try login
            print(f"    ⚠️ User might exist, trying login...")
            login_data = {"email": user_data["email"], "password": user_data["password"]}
            login_result = test_api_endpoint("POST", "/login", login_data)
            if login_result and "user_id" in login_result:
                created_users.append({
                    "user_id": login_result["user_id"],
                    "token": login_result["token"],
                    "nombre": user_data["nombre"],
                    "email": user_data["email"]
                })
                print(f"    🆔 User ID (login): {login_result['user_id']}")
                print(f"    🎯 Current Points: {login_result['usuario']['puntos']}")
                results.add_pass(f"User login (existing) - {user_data['nombre']}")
            else:
                results.add_fail(f"User registration/login - {user_data['nombre']}", "Failed to create or login user", critical=True)
    
    if not created_users:
        results.add_fail("User Registration", "No users created. Cannot proceed with report testing.", critical=True)
        return
    
    # Test 2: NEW FUNCTIONALITY - Create Reports with usuario_id (20 points system)
    print("\n2️⃣ TESTING NEW REPORTS SYSTEM (20 POINTS)")
    print("-" * 40)
    
    report_ids = []
    for i, user in enumerate(created_users):
        print(f"\n📝 Creating Report for {user['nombre']}")
        
        # Get user points before report
        user_before = test_api_endpoint("GET", f"/usuarios/{user['user_id']}")
        points_before = user_before.get("puntos", 0) if user_before else 0
        reports_before = user_before.get("reportes_enviados", 0) if user_before else 0
        
        print(f"    📊 Points before: {points_before}")
        print(f"    📊 Reports before: {reports_before}")
        
        report_data = {
            "descripcion": f"Basura acumulada en Av. Néstor Gambetta, Ventanilla - Reporte #{i+1}",
            "foto_base64": sample_image_b64,
            "latitud": -11.8746 + (i * 0.001),
            "longitud": -77.1539 + (i * 0.001),
            "direccion": f"Av. Néstor Gambetta {100 + i*50}, Ventanilla, Lima",
            "usuario_id": user["user_id"]
        }
        
        result = test_api_endpoint("POST", "/reportes", report_data)
        if result:
            report_ids.append(result.get("reporte_id"))
            points_awarded = result.get("puntos_ganados", 0)
            print(f"    🎯 Points awarded: {points_awarded}")
            
            # Verify it's 20 points (NEW FUNCTIONALITY)
            if points_awarded == 20:
                results.add_pass(f"20 points system - {user['nombre']}")
            else:
                results.add_fail(f"20 points system - {user['nombre']}", f"Expected 20, got {points_awarded}", critical=True)
            
            # Check user points after report
            user_after = test_api_endpoint("GET", f"/usuarios/{user['user_id']}")
            if user_after:
                points_after = user_after.get("puntos", 0)
                reports_after = user_after.get("reportes_enviados", 0)
                
                print(f"    📊 Points after: {points_after}")
                print(f"    📊 Reports after: {reports_after}")
                
                # Verify points increase
                if points_after == points_before + 20:
                    results.add_pass(f"User points update - {user['nombre']}")
                else:
                    results.add_fail(f"User points update - {user['nombre']}", f"Expected {points_before + 20}, got {points_after}", critical=True)
                
                # Verify reports counter increase
                if reports_after == reports_before + 1:
                    results.add_pass(f"Reports counter update - {user['nombre']}")
                else:
                    results.add_fail(f"Reports counter update - {user['nombre']}", f"Expected {reports_before + 1}, got {reports_after}", critical=True)
        else:
            results.add_fail(f"Create report - {user['nombre']}", "Failed to create report", critical=True)
    
    # Test 3: NEW FUNCTIONALITY - Public Reports System
    print("\n3️⃣ TESTING PUBLIC REPORTS SYSTEM")
    print("-" * 40)
    
    print("\n📋 Testing GET /api/reportes-publicos")
    public_reports = test_api_endpoint("GET", "/reportes-publicos")
    if public_reports and "reportes" in public_reports:
        reports_list = public_reports["reportes"]
        print(f"    📊 Found {len(reports_list)} public reports")
        
        if reports_list:
            sample_report = reports_list[0]
            print(f"    🔍 Sample report structure:")
            
            # Check required fields for public reports
            required_fields = ["descripcion", "latitud", "longitud", "fecha", "estado", "publico", "usuario_nombre"]
            missing_fields = []
            
            for field in required_fields:
                if field in sample_report:
                    print(f"      ✅ {field}: {sample_report[field]}")
                else:
                    missing_fields.append(field)
                    print(f"      ❌ Missing: {field}")
            
            if not missing_fields:
                results.add_pass("Public reports structure")
            else:
                results.add_fail("Public reports structure", f"Missing fields: {missing_fields}", critical=True)
            
            # Verify report is public and active
            if sample_report.get("publico") == True:
                results.add_pass("Reports marked as public")
            else:
                results.add_fail("Reports marked as public", f"Expected True, got {sample_report.get('publico')}", critical=True)
                
            if sample_report.get("estado") == "activo":
                results.add_pass("Reports marked as active")
            else:
                results.add_fail("Reports marked as active", f"Expected 'activo', got {sample_report.get('estado')}", critical=True)
            
            # Verify user names are included
            if "usuario_nombre" in sample_report and sample_report["usuario_nombre"]:
                results.add_pass("User names in public reports")
            else:
                results.add_fail("User names in public reports", "User names missing or empty", critical=True)
        else:
            results.add_fail("Public reports availability", "No public reports found", critical=True)
    else:
        results.add_fail("Public reports endpoint", "Failed to get public reports", critical=True)
    
    # Test 4: NEW FUNCTIONALITY - Map Reports System
    print("\n📍 Testing GET /api/mapa-reportes")
    map_reports = test_api_endpoint("GET", "/mapa-reportes")
    if map_reports and "reportes" in map_reports:
        reports_list = map_reports["reportes"]
        print(f"    📊 Found {len(reports_list)} map reports")
        
        if reports_list:
            sample_report = reports_list[0]
            print(f"    🔍 Sample map report structure:")
            
            # Check required fields for map reports
            map_fields = ["latitud", "longitud", "descripcion", "fecha", "usuario_nombre"]
            missing_fields = []
            
            for field in map_fields:
                if field in sample_report:
                    print(f"      ✅ {field}: {sample_report[field]}")
                else:
                    missing_fields.append(field)
                    print(f"      ❌ Missing: {field}")
            
            if not missing_fields:
                results.add_pass("Map reports structure")
            else:
                results.add_fail("Map reports structure", f"Missing fields: {missing_fields}", critical=True)
            
            # Verify no foto_base64 in map reports (performance optimization)
            if "foto_base64" not in sample_report:
                results.add_pass("Map reports performance optimization")
            else:
                results.add_fail("Map reports performance optimization", "Photo data included (may affect performance)")
        else:
            results.add_fail("Map reports availability", "No map reports found", critical=True)
    else:
        results.add_fail("Map reports endpoint", "Failed to get map reports", critical=True)
    
    # Test 5: NEW FUNCTIONALITY - Terms and Conditions
    print("\n4️⃣ TESTING NEW TERMS ENDPOINT")
    print("-" * 40)
    
    print("\n📜 Testing GET /api/terminos")
    terms = test_api_endpoint("GET", "/terminos")
    if terms:
        print(f"    🔍 Terms structure:")
        
        # Check required fields
        required_terms_fields = ["app_name", "creado_por", "version", "descripcion", "terminos"]
        missing_fields = []
        
        for field in required_terms_fields:
            if field in terms:
                if field == "creado_por":
                    if terms[field] == "Fernando Rufasto":
                        print(f"      ✅ {field}: {terms[field]}")
                        results.add_pass("Terms creator info")
                    else:
                        print(f"      ❌ {field}: Expected 'Fernando Rufasto', got '{terms[field]}'")
                        results.add_fail("Terms creator info", f"Expected 'Fernando Rufasto', got '{terms[field]}'")
                elif field == "app_name":
                    if terms[field] == "VENTANILLA RECICLA CONTIGO":
                        print(f"      ✅ {field}: {terms[field]}")
                        results.add_pass("Terms app name")
                    else:
                        print(f"      ❌ {field}: Expected 'VENTANILLA RECICLA CONTIGO', got '{terms[field]}'")
                        results.add_fail("Terms app name", f"Expected 'VENTANILLA RECICLA CONTIGO', got '{terms[field]}'")
                else:
                    print(f"      ✅ {field}: {terms[field]}")
            else:
                missing_fields.append(field)
                print(f"      ❌ Missing: {field}")
        
        if not missing_fields:
            results.add_pass("Terms structure")
        else:
            results.add_fail("Terms structure", f"Missing fields: {missing_fields}", critical=True)
        
        # Check terms array
        if "terminos" in terms and isinstance(terms["terminos"], list) and len(terms["terminos"]) > 0:
            results.add_pass("Terms array content")
        else:
            results.add_fail("Terms array content", "Terms array missing or empty", critical=True)
    else:
        results.add_fail("Terms endpoint", "Failed to get terms and conditions", critical=True)
    
    # Test 6: Verify Enhanced Reports Structure
    print("\n5️⃣ TESTING ENHANCED REPORTS STRUCTURE")
    print("-" * 40)
    
    if created_users:
        user = created_users[0]
        print(f"\n📋 Testing GET /api/reportes/{user['user_id']}")
        user_reports = test_api_endpoint("GET", f"/reportes/{user['user_id']}")
        
        if user_reports and "reportes" in user_reports:
            reports_list = user_reports["reportes"]
            print(f"    📊 Found {len(reports_list)} user reports")
            
            if reports_list:
                sample_report = reports_list[0]
                print(f"    🔍 Enhanced report structure:")
                
                # Check enhanced fields
                enhanced_fields = ["usuario_id", "publico", "estado", "descripcion", "latitud", "longitud"]
                missing_fields = []
                
                for field in enhanced_fields:
                    if field in sample_report:
                        print(f"      ✅ {field}: {sample_report[field]}")
                    else:
                        missing_fields.append(field)
                        print(f"      ❌ Missing: {field}")
                
                if not missing_fields:
                    results.add_pass("Enhanced reports structure")
                else:
                    results.add_fail("Enhanced reports structure", f"Missing fields: {missing_fields}", critical=True)
                
                # Verify enhanced values
                if sample_report.get("usuario_id") == user["user_id"]:
                    results.add_pass("Usuario_id linking")
                else:
                    results.add_fail("Usuario_id linking", f"Expected {user['user_id']}, got {sample_report.get('usuario_id')}", critical=True)
            else:
                results.add_fail("User reports availability", "No user reports found", critical=True)
        else:
            results.add_fail("User reports endpoint", "Failed to get user reports", critical=True)
    
    print("\n" + "=" * 60)
    print("🏁 NEW FUNCTIONALITY TESTING COMPLETED")
    print("=" * 60)

def test_terminos_specific():
    """
    Specific test for GET /api/terminos endpoint as requested by user
    Verifies:
    1. Propietarios: "Dayan Gallegos" and "Maria Ferrer"
    2. Desarrollador: "Fernando Rufasto" 
    3. Complete terms and conditions content
    4. All required fields structure (mision, vision, contacto, etc.)
    """
    print("\n🎯 SPECIFIC TERMINOS ENDPOINT TEST (USER REQUESTED)")
    print("=" * 60)
    
    print("\n📜 Testing GET /api/terminos endpoint...")
    terms = test_api_endpoint("GET", "/terminos")
    
    if not terms:
        results.add_fail("Terms endpoint connectivity", "Failed to connect to /api/terminos", critical=True)
        return
    
    print(f"✅ Successfully connected to /api/terminos")
    
    # Test 1: Verify Propietarios
    print("\n1️⃣ Testing Propietarios...")
    propietarios = terms.get("propietarios", [])
    expected_owners = ["Dayan Gallegos", "Maria Ferrer"]
    
    if not isinstance(propietarios, list):
        results.add_fail("Propietarios structure", f"Expected list, got {type(propietarios)}", critical=True)
        return
    
    print(f"    📋 Found propietarios: {propietarios}")
    
    for owner in expected_owners:
        if owner in propietarios:
            print(f"    ✅ Found propietario: {owner}")
            results.add_pass(f"Propietario present: {owner}")
        else:
            print(f"    ❌ MISSING propietario: {owner}")
            results.add_fail(f"Propietario missing: {owner}", f"Expected '{owner}' in {propietarios}", critical=True)
    
    # Test 2: Verify Desarrollador
    print("\n2️⃣ Testing Desarrollador...")
    desarrollador = terms.get("desarrollador")
    expected_developer = "Fernando Rufasto"
    
    print(f"    👨‍💻 Found desarrollador: {desarrollador}")
    
    if desarrollador == expected_developer:
        print(f"    ✅ Desarrollador correct: {desarrollador}")
        results.add_pass("Desarrollador correct")
    else:
        print(f"    ❌ FAILED: Expected '{expected_developer}', got '{desarrollador}'")
        results.add_fail("Desarrollador incorrect", f"Expected '{expected_developer}', got '{desarrollador}'", critical=True)
    
    # Test 3: Verify Complete Structure
    print("\n3️⃣ Testing Complete Structure...")
    required_fields = [
        "app_name", "version", "propietarios", "desarrollador", 
        "fecha_creacion", "descripcion", "mision", "vision", 
        "terminos", "contacto", "politica_privacidad", "licencia", 
        "derechos", "agradecimientos"
    ]
    
    print(f"    🏗️ Checking {len(required_fields)} required fields...")
    
    missing_fields = []
    for field in required_fields:
        if field in terms:
            print(f"    ✅ Field present: {field}")
            results.add_pass(f"Field present: {field}")
        else:
            missing_fields.append(field)
            print(f"    ❌ MISSING field: {field}")
            results.add_fail(f"Field missing: {field}", f"Required field '{field}' not found", critical=True)
    
    # Test 4: Verify Content Quality
    print("\n4️⃣ Testing Content Quality...")
    
    # Check app name
    app_name = terms.get("app_name")
    expected_app_name = "VENTANILLA RECICLA CONTIGO"
    print(f"    📱 App name: {app_name}")
    if app_name == expected_app_name:
        print(f"    ✅ App name correct")
        results.add_pass("App name correct")
    else:
        print(f"    ❌ App name incorrect: expected '{expected_app_name}', got '{app_name}'")
        results.add_fail("App name incorrect", f"Expected '{expected_app_name}', got '{app_name}'", critical=True)
    
    # Check mision content
    mision = terms.get("mision", "")
    print(f"    🎯 Mision: {mision[:100]}...")
    if "Ventanilla" in mision and "medio ambiente" in mision:
        print(f"    ✅ Mision content appropriate")
        results.add_pass("Mision content appropriate")
    else:
        print(f"    ❌ Mision content insufficient")
        results.add_fail("Mision content insufficient", f"Missing key terms in: {mision[:100]}...", critical=True)
    
    # Check vision content
    vision = terms.get("vision", "")
    print(f"    🔮 Vision: {vision[:100]}...")
    if "Ventanilla" in vision and "sostenibilidad" in vision:
        print(f"    ✅ Vision content appropriate")
        results.add_pass("Vision content appropriate")
    else:
        print(f"    ❌ Vision content insufficient")
        results.add_fail("Vision content insufficient", f"Missing key terms in: {vision[:100]}...", critical=True)
    
    # Check terms array
    terminos_array = terms.get("terminos", [])
    print(f"    📋 Terms array length: {len(terminos_array) if isinstance(terminos_array, list) else 'not a list'}")
    if isinstance(terminos_array, list) and len(terminos_array) > 10:
        print(f"    ✅ Terms array complete with {len(terminos_array)} items")
        results.add_pass("Terms array complete")
    else:
        print(f"    ❌ Terms array insufficient")
        results.add_fail("Terms array insufficient", f"Expected list with >10 items, got {len(terminos_array) if isinstance(terminos_array, list) else 'not a list'}", critical=True)
    
    # Check contact details
    contacto = terms.get("contacto", {})
    required_contact_fields = ["municipalidad", "email_soporte", "telefono", "direccion"]
    print(f"    📞 Contact info: {len(contacto)} fields")
    
    for field in required_contact_fields:
        if field in contacto:
            print(f"    ✅ Contact field present: {field} = {contacto[field]}")
            results.add_pass(f"Contact field: {field}")
        else:
            print(f"    ❌ MISSING contact field: {field}")
            results.add_fail(f"Contact field missing: {field}", f"Required contact field '{field}' not found", critical=True)
    
    print("\n🎉 TERMINOS ENDPOINT SPECIFIC TEST COMPLETED!")
    print("=" * 60)
    print("SUMMARY OF REQUESTED VERIFICATION:")
    print(f"✅ Propietarios: {', '.join(propietarios) if isinstance(propietarios, list) else 'ERROR'}")
    print(f"✅ Desarrollador: {desarrollador}")
    print(f"✅ App Name: {app_name}")
    print(f"✅ Mision: Present and appropriate")
    print(f"✅ Vision: Present and appropriate")
    print(f"✅ Terms Count: {len(terminos_array) if isinstance(terminos_array, list) else 'ERROR'} items")
    print(f"✅ Contact Info: {len(contacto)} fields present")
    print("=" * 60)

def main():
    """Run specific terminos endpoint test as requested"""
    print("\n🧪 VENTANILLA RECICLA CONTIGO - SPECIFIC TERMINOS ENDPOINT TEST")
    print("=" * 60)
    print(f"Backend URL: {BASE_URL}")
    print(f"API URL: {API_URL}")
    print("=" * 60)
    
    # Test basic connectivity first
    print("\n🔌 Testing basic connectivity...")
    try:
        response = requests.get(BASE_URL, timeout=5)
        if response.status_code == 200:
            print("  ✅ Backend is accessible")
        else:
            print(f"  ❌ Backend returned status {response.status_code}")
            return 1
    except Exception as e:
        print(f"  ❌ Cannot connect to backend: {e}")
        return 1
    
    # Run the specific terminos test as requested
    test_terminos_specific()
    
    # Print summary
    results.summary()
    
    # Return exit code based on results
    return 0 if results.failed == 0 else 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)