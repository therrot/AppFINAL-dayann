#!/usr/bin/env python3
"""
Backend API Testing for VENTANILLA RECICLA CONTIGO
Tests all endpoints with realistic data for recycling app in Ventanilla, Lima, Peru
"""

import requests
import json
import base64
import os
from datetime import datetime
import sys

# Get backend URL - use localhost for testing since external URL routes to frontend
def get_backend_url():
    # For testing, use localhost directly since the external URL routes to frontend
    return "http://localhost:8001"

BASE_URL = get_backend_url()
API_URL = f"{BASE_URL}/api"

print(f"Testing backend at: {API_URL}")

class TestResults:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.errors = []
    
    def add_pass(self, test_name):
        self.passed += 1
        print(f"✅ {test_name}")
    
    def add_fail(self, test_name, error):
        self.failed += 1
        self.errors.append(f"{test_name}: {error}")
        print(f"❌ {test_name}: {error}")
    
    def summary(self):
        total = self.passed + self.failed
        print(f"\n{'='*60}")
        print(f"TEST SUMMARY: {self.passed}/{total} tests passed")
        if self.errors:
            print(f"\nFAILED TESTS:")
            for error in self.errors:
                print(f"  - {error}")
        print(f"{'='*60}")

results = TestResults()

# Test data for Ventanilla, Lima, Peru
test_user_data = {
    "nombre": "Carmen Rodriguez",
    "email": "carmen.rodriguez@gmail.com", 
    "password": "MiClave123!",
    "latitud": -11.8746,  # Ventanilla coordinates
    "longitud": -77.1539
}

test_user_data_2 = {
    "nombre": "Miguel Santos",
    "email": "miguel.santos@hotmail.com",
    "password": "Recicla2024",
    "latitud": -11.8800,
    "longitud": -77.1600
}

# Sample base64 image (small test image)
sample_image_b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

def test_root_endpoint():
    """Test root endpoint"""
    try:
        response = requests.get(BASE_URL)
        if response.status_code == 200:
            data = response.json()
            if "VENTANILLA RECICLA CONTIGO" in data.get("message", ""):
                results.add_pass("Root endpoint")
                return True
            else:
                results.add_fail("Root endpoint", f"Unexpected message: {data}")
        else:
            results.add_fail("Root endpoint", f"Status {response.status_code}")
    except Exception as e:
        results.add_fail("Root endpoint", str(e))
    return False

def test_user_registration():
    """Test user registration endpoint"""
    try:
        response = requests.post(f"{API_URL}/usuarios", json=test_user_data)
        if response.status_code == 200:
            data = response.json()
            if "token" in data and "user_id" in data:
                results.add_pass("User registration")
                return data["user_id"], data["token"]
            else:
                results.add_fail("User registration", f"Missing token or user_id: {data}")
        else:
            results.add_fail("User registration", f"Status {response.status_code}: {response.text}")
    except Exception as e:
        results.add_fail("User registration", str(e))
    return None, None

def test_duplicate_user_registration():
    """Test duplicate user registration should fail"""
    try:
        response = requests.post(f"{API_URL}/usuarios", json=test_user_data)
        if response.status_code == 400:
            data = response.json()
            if "ya está registrado" in data.get("detail", ""):
                results.add_pass("Duplicate user registration prevention")
                return True
            else:
                results.add_fail("Duplicate user registration prevention", f"Wrong error message: {data}")
        else:
            results.add_fail("Duplicate user registration prevention", f"Should return 400, got {response.status_code}")
    except Exception as e:
        results.add_fail("Duplicate user registration prevention", str(e))
    return False

def test_user_login():
    """Test user login endpoint"""
    try:
        login_data = {
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        }
        response = requests.post(f"{API_URL}/login", json=login_data)
        if response.status_code == 200:
            data = response.json()
            if "token" in data and "user_id" in data:
                results.add_pass("User login")
                return data["user_id"], data["token"]
            else:
                results.add_fail("User login", f"Missing token or user_id: {data}")
        else:
            results.add_fail("User login", f"Status {response.status_code}: {response.text}")
    except Exception as e:
        results.add_fail("User login", str(e))
    return None, None

def test_invalid_login():
    """Test login with invalid credentials"""
    try:
        login_data = {
            "email": test_user_data["email"],
            "password": "wrong_password"
        }
        response = requests.post(f"{API_URL}/login", json=login_data)
        if response.status_code == 401:
            results.add_pass("Invalid login rejection")
            return True
        else:
            results.add_fail("Invalid login rejection", f"Should return 401, got {response.status_code}")
    except Exception as e:
        results.add_fail("Invalid login rejection", str(e))
    return False

def test_get_user_details(user_id):
    """Test get user details endpoint"""
    if not user_id:
        results.add_fail("Get user details", "No user_id provided")
        return False
    
    try:
        response = requests.get(f"{API_URL}/usuarios/{user_id}")
        if response.status_code == 200:
            data = response.json()
            if "nombre" in data and "email" in data and "puntos" in data:
                results.add_pass("Get user details")
                return True
            else:
                results.add_fail("Get user details", f"Missing required fields: {data}")
        else:
            results.add_fail("Get user details", f"Status {response.status_code}: {response.text}")
    except Exception as e:
        results.add_fail("Get user details", str(e))
    return False

def test_create_report():
    """Test create environmental report endpoint"""
    try:
        report_data = {
            "descripcion": "Basura acumulada en la esquina de Av. Néstor Gambetta con Jr. Los Pinos. Hay residuos orgánicos y plásticos que necesitan recolección urgente.",
            "foto_base64": sample_image_b64,
            "latitud": -11.8746,
            "longitud": -77.1539,
            "direccion": "Av. Néstor Gambetta 1234, Ventanilla, Callao"
        }
        response = requests.post(f"{API_URL}/reportes", json=report_data)
        if response.status_code == 200:
            data = response.json()
            if "reporte_id" in data and "puntos_ganados" in data:
                results.add_pass("Create environmental report")
                return data["reporte_id"]
            else:
                results.add_fail("Create environmental report", f"Missing required fields: {data}")
        else:
            results.add_fail("Create environmental report", f"Status {response.status_code}: {response.text}")
    except Exception as e:
        results.add_fail("Create environmental report", str(e))
    return None

def test_get_user_reports(user_id):
    """Test get user reports endpoint"""
    if not user_id:
        results.add_fail("Get user reports", "No user_id provided")
        return False
    
    try:
        response = requests.get(f"{API_URL}/reportes/{user_id}")
        if response.status_code == 200:
            data = response.json()
            if "reportes" in data and isinstance(data["reportes"], list):
                results.add_pass("Get user reports")
                return True
            else:
                results.add_fail("Get user reports", f"Invalid response format: {data}")
        else:
            results.add_fail("Get user reports", f"Status {response.status_code}: {response.text}")
    except Exception as e:
        results.add_fail("Get user reports", str(e))
    return False

def test_get_incentives():
    """Test get available incentives endpoint"""
    try:
        response = requests.get(f"{API_URL}/incentivos")
        if response.status_code == 200:
            data = response.json()
            if "incentivos" in data and isinstance(data["incentivos"], list) and len(data["incentivos"]) > 0:
                # Check if incentives have required fields
                incentive = data["incentivos"][0]
                if all(field in incentive for field in ["id", "nombre", "descripcion", "puntos_requeridos"]):
                    results.add_pass("Get available incentives")
                    return data["incentivos"]
                else:
                    results.add_fail("Get available incentives", f"Missing required fields in incentive: {incentive}")
            else:
                results.add_fail("Get available incentives", f"Invalid response format: {data}")
        else:
            results.add_fail("Get available incentives", f"Status {response.status_code}: {response.text}")
    except Exception as e:
        results.add_fail("Get available incentives", str(e))
    return None

def test_redeem_incentive(user_id, incentives):
    """Test redeem incentive endpoint"""
    if not user_id or not incentives:
        results.add_fail("Redeem incentive", "No user_id or incentives provided")
        return False
    
    try:
        redeem_data = {
            "incentivo_id": incentives[0]["id"],
            "usuario_id": user_id
        }
        response = requests.post(f"{API_URL}/canjear", json=redeem_data)
        if response.status_code == 200:
            data = response.json()
            if "message" in data and "fecha_canje" in data:
                results.add_pass("Redeem incentive")
                return True
            else:
                results.add_fail("Redeem incentive", f"Missing required fields: {data}")
        else:
            results.add_fail("Redeem incentive", f"Status {response.status_code}: {response.text}")
    except Exception as e:
        results.add_fail("Redeem incentive", str(e))
    return False

def test_get_education_content():
    """Test get environmental education content endpoint"""
    try:
        response = requests.get(f"{API_URL}/educacion")
        if response.status_code == 200:
            data = response.json()
            if "contenido" in data and isinstance(data["contenido"], list) and len(data["contenido"]) > 0:
                # Check if content has required fields
                content = data["contenido"][0]
                if all(field in content for field in ["id", "titulo", "tipo", "contenido"]):
                    results.add_pass("Get environmental education content")
                    return True
                else:
                    results.add_fail("Get environmental education content", f"Missing required fields: {content}")
            else:
                results.add_fail("Get environmental education content", f"Invalid response format: {data}")
        else:
            results.add_fail("Get environmental education content", f"Status {response.status_code}: {response.text}")
    except Exception as e:
        results.add_fail("Get environmental education content", str(e))
    return False

def test_get_news():
    """Test get environmental news endpoint"""
    try:
        response = requests.get(f"{API_URL}/noticias")
        if response.status_code == 200:
            data = response.json()
            if "noticias" in data and isinstance(data["noticias"], list) and len(data["noticias"]) > 0:
                # Check if news have required fields
                news = data["noticias"][0]
                if all(field in news for field in ["id", "titulo", "contenido", "fecha"]):
                    results.add_pass("Get environmental news")
                    return True
                else:
                    results.add_fail("Get environmental news", f"Missing required fields: {news}")
            else:
                results.add_fail("Get environmental news", f"Invalid response format: {data}")
        else:
            results.add_fail("Get environmental news", f"Status {response.status_code}: {response.text}")
    except Exception as e:
        results.add_fail("Get environmental news", str(e))
    return False

def test_get_ranking():
    """Test get user ranking endpoint"""
    try:
        response = requests.get(f"{API_URL}/ranking")
        if response.status_code == 200:
            data = response.json()
            if "ranking" in data and isinstance(data["ranking"], list) and len(data["ranking"]) > 0:
                # Check if ranking has required fields
                rank = data["ranking"][0]
                if all(field in rank for field in ["posicion", "nombre", "puntos"]):
                    results.add_pass("Get user ranking")
                    return True
                else:
                    results.add_fail("Get user ranking", f"Missing required fields: {rank}")
            else:
                results.add_fail("Get user ranking", f"Invalid response format: {data}")
        else:
            results.add_fail("Get user ranking", f"Status {response.status_code}: {response.text}")
    except Exception as e:
        results.add_fail("Get user ranking", str(e))
    return False

def test_get_notifications(user_id):
    """Test get user notifications endpoint"""
    if not user_id:
        results.add_fail("Get user notifications", "No user_id provided")
        return False
    
    try:
        response = requests.get(f"{API_URL}/notificaciones/{user_id}")
        if response.status_code == 200:
            data = response.json()
            if "notificaciones" in data and isinstance(data["notificaciones"], list):
                results.add_pass("Get user notifications")
                return True
            else:
                results.add_fail("Get user notifications", f"Invalid response format: {data}")
        else:
            results.add_fail("Get user notifications", f"Status {response.status_code}: {response.text}")
    except Exception as e:
        results.add_fail("Get user notifications", str(e))
    return False

def test_mongodb_connection():
    """Test MongoDB connection by checking if we can create and retrieve data"""
    try:
        # Register a test user to verify DB connection
        test_user = {
            "nombre": "Test DB Connection",
            "email": f"test_db_{datetime.now().timestamp()}@test.com",
            "password": "TestDB123"
        }
        
        response = requests.post(f"{API_URL}/usuarios", json=test_user)
        if response.status_code == 200:
            data = response.json()
            user_id = data.get("user_id")
            
            # Try to retrieve the user
            get_response = requests.get(f"{API_URL}/usuarios/{user_id}")
            if get_response.status_code == 200:
                results.add_pass("MongoDB connection and data persistence")
                return True
            else:
                results.add_fail("MongoDB connection and data persistence", "Could not retrieve created user")
        else:
            results.add_fail("MongoDB connection and data persistence", f"Could not create test user: {response.text}")
    except Exception as e:
        results.add_fail("MongoDB connection and data persistence", str(e))
    return False

def main():
    """Run all backend tests"""
    print("🧪 Starting VENTANILLA RECICLA CONTIGO Backend API Tests")
    print(f"Backend URL: {BASE_URL}")
    print(f"API URL: {API_URL}")
    print("="*60)
    
    # Test basic connectivity
    if not test_root_endpoint():
        print("❌ Cannot connect to backend. Stopping tests.")
        return
    
    # Test MongoDB connection
    test_mongodb_connection()
    
    # Test authentication endpoints
    user_id, token = test_user_registration()
    test_duplicate_user_registration()
    
    # Test login with the registered user
    login_user_id, login_token = test_user_login()
    test_invalid_login()
    
    # Use the user_id from registration or login
    active_user_id = user_id or login_user_id
    
    # Test user details
    test_get_user_details(active_user_id)
    
    # Test reports endpoints
    report_id = test_create_report()
    test_get_user_reports(active_user_id)
    
    # Test incentives endpoints
    incentives = test_get_incentives()
    test_redeem_incentive(active_user_id, incentives)
    
    # Test education and news endpoints
    test_get_education_content()
    test_get_news()
    test_get_ranking()
    test_get_notifications(active_user_id)
    
    # Print summary
    results.summary()
    
    # Return exit code based on results
    return 0 if results.failed == 0 else 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)