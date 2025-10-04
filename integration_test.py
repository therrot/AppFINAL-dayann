#!/usr/bin/env python3
"""
VENTANILLA RECICLA CONTIGO - Complete Integration Testing
Testing the complete flow: Create user → Update photo → Make report → Verify points
"""

import requests
import json
import base64
from datetime import datetime

BASE_URL = "http://localhost:8001"
API_URL = f"{BASE_URL}/api"

# Sample base64 images
PROFILE_PHOTO = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="

UPDATED_PHOTO = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

def test_complete_integration():
    """Test the complete integration flow"""
    print("🔄 TESTING COMPLETE INTEGRATION FLOW")
    print("=" * 60)
    
    # Step 1: Create user with profile photo
    print("\n1️⃣ Creating User with Profile Photo")
    print("-" * 40)
    
    user_data = {
        "nombre": "Luis Ramírez",
        "email": "luis.ramirez.integration@ventanilla.pe",
        "password": "IntegracionVentanilla2024",
        "latitud": -11.8800,
        "longitud": -77.1600,
        "foto_perfil": PROFILE_PHOTO
    }
    
    try:
        response = requests.post(f"{API_URL}/usuarios", json=user_data)
        if response.status_code == 200:
            data = response.json()
            user_id = data["user_id"]
            token = data["token"]
            print(f"✅ User created: {user_id}")
            print(f"   Name: {data['usuario']['nombre']}")
            print(f"   Initial Points: {data['usuario']['puntos']}")
        else:
            print(f"❌ User creation failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ User creation error: {e}")
        return False
    
    # Step 2: Verify user has profile photo
    print("\n2️⃣ Verifying Profile Photo in Registration")
    print("-" * 40)
    
    try:
        response = requests.get(f"{API_URL}/usuarios/{user_id}")
        if response.status_code == 200:
            user_data = response.json()
            if user_data.get("foto_perfil") == PROFILE_PHOTO:
                print("✅ Profile photo saved during registration")
            else:
                print("❌ Profile photo not saved during registration")
                return False
        else:
            print(f"❌ Failed to get user: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Get user error: {e}")
        return False
    
    # Step 3: Update profile photo
    print("\n3️⃣ Updating Profile Photo")
    print("-" * 40)
    
    try:
        update_data = {"foto_perfil": UPDATED_PHOTO}
        response = requests.put(f"{API_URL}/usuarios/{user_id}", json=update_data)
        if response.status_code == 200:
            data = response.json()
            if data.get("foto_perfil") == UPDATED_PHOTO:
                print("✅ Profile photo updated successfully")
            else:
                print("❌ Profile photo update failed")
                return False
        else:
            print(f"❌ Photo update failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Photo update error: {e}")
        return False
    
    # Step 4: Make environmental report
    print("\n4️⃣ Creating Environmental Report")
    print("-" * 40)
    
    report_data = {
        "descripcion": "Acumulación de residuos sólidos en la intersección de Av. Pedro Beltrán con Jr. Túpac Amaru, Ventanilla. Se requiere intervención urgente del servicio de limpieza pública.",
        "foto_base64": PROFILE_PHOTO,
        "latitud": -11.8800,
        "longitud": -77.1600,
        "direccion": "Av. Pedro Beltrán con Jr. Túpac Amaru, Ventanilla, Callao",
        "usuario_id": user_id
    }
    
    try:
        response = requests.post(f"{API_URL}/reportes", json=report_data)
        if response.status_code == 200:
            data = response.json()
            report_id = data["reporte_id"]
            points_awarded = data["puntos_ganados"]
            print(f"✅ Report created: {report_id}")
            print(f"   Points awarded: {points_awarded}")
            
            if points_awarded == 20:
                print("✅ Correct 20 points awarded")
            else:
                print(f"❌ Expected 20 points, got {points_awarded}")
                return False
        else:
            print(f"❌ Report creation failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Report creation error: {e}")
        return False
    
    # Step 5: Verify user points and data consistency
    print("\n5️⃣ Verifying Points and Data Consistency")
    print("-" * 40)
    
    try:
        response = requests.get(f"{API_URL}/usuarios/{user_id}")
        if response.status_code == 200:
            user_data = response.json()
            print(f"   Current Points: {user_data['puntos']}")
            print(f"   Reports Sent: {user_data['reportes_enviados']}")
            print(f"   Profile Photo: {'Present' if user_data.get('foto_perfil') else 'Missing'}")
            
            # Verify points
            if user_data["puntos"] == 20:
                print("✅ User points correctly updated")
            else:
                print(f"❌ Expected 20 points, got {user_data['puntos']}")
                return False
            
            # Verify reports counter
            if user_data["reportes_enviados"] == 1:
                print("✅ Reports counter correctly updated")
            else:
                print(f"❌ Expected 1 report, got {user_data['reportes_enviados']}")
                return False
            
            # Verify profile photo persisted
            if user_data.get("foto_perfil") == UPDATED_PHOTO:
                print("✅ Profile photo persisted correctly")
            else:
                print("❌ Profile photo not persisted")
                return False
        else:
            print(f"❌ Failed to get updated user: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ User verification error: {e}")
        return False
    
    # Step 6: Verify report appears in public reports with user name
    print("\n6️⃣ Verifying Report in Public System")
    print("-" * 40)
    
    try:
        response = requests.get(f"{API_URL}/reportes-publicos")
        if response.status_code == 200:
            data = response.json()
            reports = data["reportes"]
            
            # Find our report
            user_report = None
            for report in reports:
                if report.get("usuario_id") == user_id:
                    user_report = report
                    break
            
            if user_report:
                print(f"✅ Report found in public system")
                print(f"   User Name: {user_report.get('usuario_nombre')}")
                print(f"   Description: {user_report.get('descripcion')[:50]}...")
                print(f"   Status: {user_report.get('estado')}")
                print(f"   Public: {user_report.get('publico')}")
                
                # Verify user name
                if user_report.get("usuario_nombre") == "Luis Ramírez":
                    print("✅ User name correctly linked")
                else:
                    print(f"❌ Expected 'Luis Ramírez', got '{user_report.get('usuario_nombre')}'")
                    return False
                
                # Verify public status
                if user_report.get("publico") == True and user_report.get("estado") == "activo":
                    print("✅ Report correctly marked as public and active")
                else:
                    print("❌ Report not properly marked as public/active")
                    return False
            else:
                print("❌ Report not found in public system")
                return False
        else:
            print(f"❌ Failed to get public reports: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Public reports verification error: {e}")
        return False
    
    # Step 7: Verify report appears in map system
    print("\n7️⃣ Verifying Report in Map System")
    print("-" * 40)
    
    try:
        response = requests.get(f"{API_URL}/mapa-reportes")
        if response.status_code == 200:
            data = response.json()
            reports = data["reportes"]
            
            # Find our report
            user_report = None
            for report in reports:
                if report.get("usuario_id") == user_id:
                    user_report = report
                    break
            
            if user_report:
                print(f"✅ Report found in map system")
                print(f"   Coordinates: ({user_report.get('latitud')}, {user_report.get('longitud')})")
                print(f"   User Name: {user_report.get('usuario_nombre')}")
                
                # Verify coordinates
                if (user_report.get("latitud") == -11.8800 and 
                    user_report.get("longitud") == -77.1600):
                    print("✅ Coordinates correctly preserved")
                else:
                    print("❌ Coordinates not preserved correctly")
                    return False
                
                # Verify no photo data (performance optimization)
                if "foto_base64" not in user_report:
                    print("✅ Photo data excluded for map performance")
                else:
                    print("⚠️ Photo data included in map (may affect performance)")
            else:
                print("❌ Report not found in map system")
                return False
        else:
            print(f"❌ Failed to get map reports: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Map reports verification error: {e}")
        return False
    
    print("\n" + "=" * 60)
    print("🎉 COMPLETE INTEGRATION TEST PASSED!")
    print("✅ User Registration with Photo: WORKING")
    print("✅ Profile Photo Update: WORKING")
    print("✅ Environmental Report Creation: WORKING")
    print("✅ 20 Points System: WORKING")
    print("✅ Data Consistency: WORKING")
    print("✅ Public Reports with Names: WORKING")
    print("✅ Map Reports Optimization: WORKING")
    print("=" * 60)
    
    return True

if __name__ == "__main__":
    success = test_complete_integration()
    if success:
        print("\n🎯 INTEGRATION FLOW: FULLY FUNCTIONAL")
        print("🌟 All NEW functionalities working correctly for Ventanilla users!")
    else:
        print("\n❌ INTEGRATION FLOW: ISSUES FOUND")
    exit(0 if success else 1)