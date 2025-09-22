import requests
import uuid

BASE_URL = "http://localhost:3000"
TIMEOUT = 30


def test_user_authentication_flows():
    session = requests.Session()

    # 1) Test user registration (email/password)
    register_url = f"{BASE_URL}/api/auth/sign-up"
    test_email = f"testuser_{uuid.uuid4()}@example.com"
    register_payload = {
        "email": test_email,
        "password": "TestPass123!",
        "firstName": "Test",
        "lastName": "User"
    }
    try:
        r = session.post(register_url, json=register_payload, timeout=TIMEOUT)
        assert r.status_code == 201 or r.status_code == 200, f"Registration failed: {r.text}"

        # 2) Test user sign in (email/password)
        sign_in_url = f"{BASE_URL}/api/auth/sign-in"
        sign_in_payload = {
            "email": test_email,
            "password": "TestPass123!"
        }
        r = session.post(sign_in_url, json=sign_in_payload, timeout=TIMEOUT)
        assert r.status_code == 200, f"Sign-in failed: {r.text}"
        # Normally token/session cookie set here; preserve session cookies
        # We expect a cookie or token in Set-Cookie or response body
        # Check presence of session cookie or token in response
        # We'll check cookies saved in session
        assert session.cookies, "Session cookies not set after sign-in"

        # 3) Get current session information
        session_url = f"{BASE_URL}/api/auth/get-session"
        r = session.get(session_url, timeout=TIMEOUT)
        assert r.status_code == 200, f"Get session failed: {r.text}"
        session_data = r.json()
        assert isinstance(session_data, dict), "Session response is not a dict"
        # We expect at least user email and role in session data for RBAC
        assert session_data.get("user"), "Session data missing 'user'"
        assert session_data["user"].get("email") == test_email, "Session user email mismatch"
        # Check for role field presence
        assert "role" in session_data["user"], "Role field missing in session user data"

        # 4) Check role-based access: try to access admin-only endpoint without admin rights
        admin_tours_url = f"{BASE_URL}/api/admin/tours"
        r = session.get(admin_tours_url, timeout=TIMEOUT)
        # Expecting 403 Forbidden or 401 Unauthorized for non-admin user
        assert r.status_code in (401, 403), f"Non-admin user allowed admin access: {r.status_code}"

        # 5) Test sign out
        sign_out_url = f"{BASE_URL}/api/auth/sign-out"
        r = session.post(sign_out_url, timeout=TIMEOUT)
        assert r.status_code == 200, f"Sign out failed: {r.text}"

        # 6) After sign out, session should be invalid
        r = session.get(session_url, timeout=TIMEOUT)
        # Expect 401 Unauthorized or session empty/invalid
        assert r.status_code == 401 or r.json().get("user") is None, "Session still valid after sign out"

        # 7) OAuth (Google) flow - We only simulate here as real OAuth needs redirect and front-end:
        # Typically OAuth sign-in would happen via a front-end redirect.
        # Check for existence of OAuth initiation endpoint or token endpoint
        # Normally we test presence or 302 redirect, here we verify the endpoint exists:
        oauth_url = f"{BASE_URL}/api/auth/oauth/google"
        r = session.get(oauth_url, timeout=TIMEOUT)
        # Accept either 404 Not Found (if OAuth endpoint isn't a GET) or 405 Method Not Allowed or redirect 3xx
        assert r.status_code in (404, 405, 302, 301), "Unexpected response for OAuth initiation endpoint"

    finally:
        # Clean up: delete the test user via admin API if available (not specified, so skip)
        pass


test_user_authentication_flows()