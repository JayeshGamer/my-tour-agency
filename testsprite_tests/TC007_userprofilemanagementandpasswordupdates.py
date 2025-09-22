import requests
import uuid

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

# Test user credentials for sign up and sign in
TEST_USER_EMAIL = f"testuser_{uuid.uuid4().hex[:8]}@example.com"
TEST_USER_PASSWORD = "TestPass123!"
TEST_USER_FIRST_NAME = "Test"
TEST_USER_LAST_NAME = "User"


def test_userprofilemanagementandpasswordupdates():
    session = requests.Session()

    def sign_up():
        url = f"{BASE_URL}/api/auth/sign-up"
        payload = {
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD,
            "firstName": TEST_USER_FIRST_NAME,
            "lastName": TEST_USER_LAST_NAME
        }
        resp = session.post(url, json=payload, timeout=TIMEOUT)
        resp.raise_for_status()
        assert resp.status_code == 200 or resp.status_code == 201

    def sign_in():
        url = f"{BASE_URL}/api/auth/sign-in"
        payload = {
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        }
        resp = session.post(url, json=payload, timeout=TIMEOUT)
        resp.raise_for_status()
        assert resp.status_code == 200
        # Expect a cookie/session token in response
        assert resp.cookies or 'authorization' in resp.headers or 'Authorization' in resp.headers

    def get_auth_headers():
        # This assumes session cookies are managed by requests.Session automatically.
        return {}

    def get_profile():
        url = f"{BASE_URL}/api/profile"
        resp = session.get(url, headers=get_auth_headers(), timeout=TIMEOUT)
        resp.raise_for_status()
        assert resp.status_code == 200
        profile_data = resp.json()
        assert isinstance(profile_data, dict)
        assert profile_data.get("email") == TEST_USER_EMAIL
        return profile_data

    def update_profile(new_first_name, new_last_name):
        url = f"{BASE_URL}/api/profile"
        payload = {
            "firstName": new_first_name,
            "lastName": new_last_name
        }
        resp = session.patch(url, json=payload, headers=get_auth_headers(), timeout=TIMEOUT)
        resp.raise_for_status()
        assert resp.status_code == 200
        updated_data = resp.json()
        assert updated_data.get("firstName") == new_first_name
        assert updated_data.get("lastName") == new_last_name
        return updated_data

    def update_password(old_password, new_password):
        url = f"{BASE_URL}/api/profile/password"
        payload = {
            "oldPassword": old_password,
            "newPassword": new_password
        }
        resp = session.patch(url, json=payload, headers=get_auth_headers(), timeout=TIMEOUT)
        resp.raise_for_status()
        assert resp.status_code == 200

    def sign_out():
        url = f"{BASE_URL}/api/auth/sign-out"
        resp = session.post(url, headers=get_auth_headers(), timeout=TIMEOUT)
        resp.raise_for_status()
        assert resp.status_code == 200

    # Start of the test
    sign_up()
    sign_in()

    # Get current profile and confirm info
    profile = get_profile()
    assert profile.get("firstName") == TEST_USER_FIRST_NAME
    assert profile.get("lastName") == TEST_USER_LAST_NAME
    assert profile.get("email") == TEST_USER_EMAIL

    # Update personal info
    new_first_name = "UpdatedFirst"
    new_last_name = "UpdatedLast"
    updated_profile = update_profile(new_first_name, new_last_name)
    assert updated_profile.get("firstName") == new_first_name
    assert updated_profile.get("lastName") == new_last_name

    # Verify changes persist
    profile_after_update = get_profile()
    assert profile_after_update.get("firstName") == new_first_name
    assert profile_after_update.get("lastName") == new_last_name

    # Update password securely
    new_password = "NewPass456!"
    update_password(TEST_USER_PASSWORD, new_password)

    # Sign out and sign in with new password to verify change
    sign_out()
    # Clear session cookies to simulate fresh login
    session.cookies.clear()
    # Sign in with old password should fail
    url_sign_in = f"{BASE_URL}/api/auth/sign-in"
    resp_old_pass = session.post(url_sign_in, json={"email": TEST_USER_EMAIL, "password": TEST_USER_PASSWORD}, timeout=TIMEOUT)
    assert resp_old_pass.status_code == 401 or resp_old_pass.status_code == 400

    # Sign in with new password should succeed
    resp_new_pass = session.post(url_sign_in, json={"email": TEST_USER_EMAIL, "password": new_password}, timeout=TIMEOUT)
    resp_new_pass.raise_for_status()
    assert resp_new_pass.status_code == 200

    # Clean up: sign out
    sign_out()


test_userprofilemanagementandpasswordupdates()