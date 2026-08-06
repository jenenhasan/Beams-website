import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def test_setup():
    """Test admin setup"""
    response = requests.post(f"{BASE_URL}/auth/setup")
    print(f"Setup: {response.json()}")

def test_login():
    """Test login"""
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"username": "admin", "password": "beams123"}
    )
    data = response.json()
    print(f"Login: {data}")
    return data.get("access_token")

def test_get_menu():
    """Test getting menu"""
    response = requests.get(f"{BASE_URL}/menu/")
    print(f"Menu: {response.json()}")

def test_update_menu(token):
    """Test updating menu"""
    new_menu = {
        "categories": [
            {
                "id": "hot",
                "numeral": "01",
                "title": "Hot Coffee",
                "subtitle": "Freshly brewed",
                "items": [
                    {
                        "id": "1",
                        "name": "Test Coffee",
                        "desc": "Test description",
                        "price": "5.00",
                        "favorite": True
                    }
                ]
            }
        ]
    }
    response = requests.put(
        f"{BASE_URL}/menu/",
        json=new_menu,
        headers={"Authorization": f"Bearer {token}"}
    )
    print(f"Update Menu: {response.json()}")

if __name__ == "__main__":
    print("=== Testing BEAMS API ===")
    test_setup()
    token = test_login()
    test_get_menu()
    if token:
        test_update_menu(token)
        test_get_menu()  # Verify update