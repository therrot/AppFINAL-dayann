#!/usr/bin/env python3
"""
VENTANILLA RECICLA CONTIGO - Profile Photo System Testing
Testing NEW FUNCTIONALITY: Profile photo upload and update system
"""

import requests
import json
import base64
from datetime import datetime

BASE_URL = "http://localhost:8001"
API_URL = f"{BASE_URL}/api"

# Sample base64 images for testing
PROFILE_PHOTO_1 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="

PROFILE_PHOTO_2 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

def test_profile_photo_functionality():
    """Test the complete profile photo system"""
    print("🖼️ TESTING PROFILE PHOTO SYSTEM")
    print("=" * 50)
    
    # Test 1: Register user with profile photo
    print("\n1️⃣ Testing Registration with Profile Photo")
    print("-" * 40)
    
    user_data = {
        "nombre": "Ana García",
        "email": "ana.garcia.photo@ventanilla.pe",
        "password": "FotoVentanilla2024",
        "latitud": -11.8756,
        "longitud": -77.1549,
        "foto_perfil": PROFILE_PHOTO_1
    }
    
    try:
        response = requests.post(f"{API_URL}/usuarios", json=user_data)
        if response.status_code == 200:
            data = response.json()
            user_id = data["user_id"]
            print(f"✅ User registered with photo: {user_id}")
            print(f"   Name: {data['usuario']['nombre']}")
            print(f"   Email: {data['usuario']['email']}")
        elif response.status_code == 400 and "ya está registrado" in response.text:
            # User exists, try login
            print("⚠️ User exists, trying login...")
            login_data = {"email": user_data["email"], "password": user_data["password"]}
            response = requests.post(f"{API_URL}/login", json=login_data)
            if response.status_code == 200:
                data = response.json()
                user_id = data["user_id"]
                print(f"✅ User logged in: {user_id}")
            else:
                print(f"❌ Login failed: {response.text}")
                return False
        else:
            print(f"❌ Registration failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Registration error: {e}")
        return False
    
    # Test 2: Get user and verify photo is included
    print("\n2️⃣ Testing Get User with Profile Photo")
    print("-" * 40)
    
    try:
        response = requests.get(f"{API_URL}/usuarios/{user_id}")
        if response.status_code == 200:
            user_data = response.json()
            print(f"✅ User data retrieved successfully")
            print(f"   ID: {user_data['id']}")
            print(f"   Name: {user_data['nombre']}")
            print(f"   Email: {user_data['email']}")
            print(f"   Points: {user_data['puntos']}")
            
            if "foto_perfil" in user_data:
                if user_data["foto_perfil"]:
                    print(f"✅ Profile photo present: {len(user_data['foto_perfil'])} characters")
                else:
                    print("⚠️ Profile photo field exists but is null")
            else:
                print("❌ Profile photo field missing")
                return False
        else:
            print(f"❌ Get user failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Get user error: {e}")
        return False
    
    # Test 3: Update profile photo using PUT endpoint
    print("\n3️⃣ Testing Profile Photo Update (PUT)")
    print("-" * 40)
    
    update_data = {
        "foto_perfil": PROFILE_PHOTO_2
    }
    
    try:
        response = requests.put(f"{API_URL}/usuarios/{user_id}", json=update_data)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Profile photo updated successfully")
            print(f"   Message: {data.get('message', 'No message')}")
            
            if "foto_perfil" in data:
                if data["foto_perfil"] == PROFILE_PHOTO_2:
                    print("✅ Updated photo matches sent data")
                else:
                    print("❌ Updated photo doesn't match sent data")
                    return False
            else:
                print("❌ Updated photo not returned in response")
                return False
        else:
            print(f"❌ Photo update failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Photo update error: {e}")
        return False
    
    # Test 4: Verify photo was actually updated
    print("\n4️⃣ Testing Photo Update Verification")
    print("-" * 40)
    
    try:
        response = requests.get(f"{API_URL}/usuarios/{user_id}")
        if response.status_code == 200:
            user_data = response.json()
            
            if user_data.get("foto_perfil") == PROFILE_PHOTO_2:
                print("✅ Photo update verified in database")
            else:
                print("❌ Photo update not persisted in database")
                return False
        else:
            print(f"❌ Verification failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Verification error: {e}")
        return False
    
    # Test 5: Update name and photo together
    print("\n5️⃣ Testing Combined Name and Photo Update")
    print("-" * 40)
    
    combined_update = {
        "nombre": "Ana García Mendoza",
        "foto_perfil": PROFILE_PHOTO_1
    }
    
    try:
        response = requests.put(f"{API_URL}/usuarios/{user_id}", json=combined_update)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Combined update successful")
            print(f"   New name: {data.get('nombre')}")
            
            if data.get("nombre") == "Ana García Mendoza" and data.get("foto_perfil") == PROFILE_PHOTO_1:
                print("✅ Both name and photo updated correctly")
            else:
                print("❌ Combined update data mismatch")
                return False
        else:
            print(f"❌ Combined update failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Combined update error: {e}")
        return False
    
    # Test 6: Error handling - empty update
    print("\n6️⃣ Testing Error Handling - Empty Update")
    print("-" * 40)
    
    try:
        response = requests.put(f"{API_URL}/usuarios/{user_id}", json={})
        if response.status_code == 400:
            print("✅ Empty update properly rejected")
        else:
            print(f"❌ Empty update should return 400, got {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error handling test failed: {e}")
        return False
    
    # Test 7: Error handling - invalid user ID
    print("\n7️⃣ Testing Error Handling - Invalid User ID")
    print("-" * 40)
    
    try:
        response = requests.put(f"{API_URL}/usuarios/invalid_id", json={"foto_perfil": PROFILE_PHOTO_1})
        if response.status_code == 400:
            print("✅ Invalid user ID properly rejected")
        else:
            print(f"❌ Invalid user ID should return 400, got {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Invalid ID test failed: {e}")
        return False
    
    print("\n" + "=" * 50)
    print("🎉 ALL PROFILE PHOTO TESTS PASSED!")
    print("✅ Registration with photo: WORKING")
    print("✅ Get user with photo: WORKING")
    print("✅ Update profile photo: WORKING")
    print("✅ Photo persistence: WORKING")
    print("✅ Combined updates: WORKING")
    print("✅ Error handling: WORKING")
    print("=" * 50)
    
    return True

if __name__ == "__main__":
    success = test_profile_photo_functionality()
    if success:
        print("\n🎯 PROFILE PHOTO SYSTEM: FULLY FUNCTIONAL")
    else:
        print("\n❌ PROFILE PHOTO SYSTEM: ISSUES FOUND")
    exit(0 if success else 1)