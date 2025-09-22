import requests
import uuid

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

# Test user credentials
TEST_USER_EMAIL = f"testuser_{uuid.uuid4().hex[:8]}@example.com"
TEST_USER_PASSWORD = "TestPassword123!"
TEST_USER_FIRSTNAME = "Test"
TEST_USER_LASTNAME = "User"

# Tour data for creating a tour to add to wishlist
TEST_TOUR_DATA = {
    "name": "Test Tour " + uuid.uuid4().hex[:6],
    "title": "Test Tour Title",
    "description": "Test description for wishlist functionality",
    "location": "Test Location",
    "duration": 3,
    "pricePerPerson": 123,
    "category": "Adventure",
    "difficulty": "Moderate",
    "maxGroupSize": 10,
    "images": ["https://example.com/image1.jpg"],
    "startDates": ["2025-12-01", "2025-12-15"],
    "included": ["Guide", "Meals"],
    "notIncluded": ["Flights"],
    "itinerary": [{"day": 1, "activities": ["Hiking", "Camping"]}],
    "featured": False
}


def test_user_wishlist_functionality():
    session = requests.Session()
    headers = {'Content-Type': 'application/json'}
    try:
        # 1. Register a new user
        sign_up_resp = session.post(
            f"{BASE_URL}/api/auth/sign-up",
            json={
                "email": TEST_USER_EMAIL,
                "password": TEST_USER_PASSWORD,
                "firstName": TEST_USER_FIRSTNAME,
                "lastName": TEST_USER_LASTNAME,
            },
            headers=headers,
            timeout=TIMEOUT,
        )
        assert sign_up_resp.status_code in (200, 201), f"Sign-up failed: {sign_up_resp.status_code} {sign_up_resp.text}"

        # 2. Sign in with the created user to get session cookie or tokens
        sign_in_resp = session.post(
            f"{BASE_URL}/api/auth/sign-in",
            json={"email": TEST_USER_EMAIL, "password": TEST_USER_PASSWORD},
            headers=headers,
            timeout=TIMEOUT,
        )
        assert sign_in_resp.status_code == 200, f"Sign-in failed: {sign_in_resp.status_code} {sign_in_resp.text}"

        # 3. Verify authenticated session by getting session info
        session_resp = session.get(f"{BASE_URL}/api/auth/get-session", timeout=TIMEOUT)
        assert session_resp.status_code == 200, f"Get session failed: {session_resp.status_code} {session_resp.text}"
        session_data = session_resp.json()
        assert session_data.get("user"), "Session data missing user info"

        # 4. Create a new tour via admin endpoint since wishlist needs a tour to add
        # For this test, we try without auth, if 401 then fail
        create_tour_resp = session.post(
            f"{BASE_URL}/api/admin/tours",
            json=TEST_TOUR_DATA,
            headers=headers,
            timeout=TIMEOUT,
        )

        if create_tour_resp.status_code == 401:
            raise AssertionError("Cannot create tour without admin access; test requires a valid tour ID")

        assert create_tour_resp.status_code in (200, 201), f"Create tour failed: {create_tour_resp.status_code} {create_tour_resp.text}"

        tour = create_tour_resp.json()
        tour_id = tour.get("id")
        assert tour_id, "Created tour missing id"

        try:
            # 5. Add the tour to user's wishlist (POST /api/wishlist with tourId)
            add_wishlist_resp = session.post(
                f"{BASE_URL}/api/wishlist",
                json={"tourId": tour_id},
                headers=headers,
                timeout=TIMEOUT,
            )
            assert add_wishlist_resp.status_code == 200, f"Add to wishlist failed: {add_wishlist_resp.text}"
            add_result = add_wishlist_resp.json()
            assert add_result.get("success") or add_result.get("message"), "Unexpected add wishlist response"

            # 6. Retrieve the wishlist for the user (GET /api/wishlist)
            get_wishlist_resp = session.get(f"{BASE_URL}/api/wishlist", timeout=TIMEOUT)
            assert get_wishlist_resp.status_code == 200, f"Get wishlist failed: {get_wishlist_resp.text}"
            wishlist = get_wishlist_resp.json()
            assert any(item.get("tourId") == tour_id or item.get("id") == tour_id for item in wishlist), \
                "Tour not found in wishlist after adding"

            # 7. Remove the tour from wishlist (DELETE /api/wishlist with tourId)
            remove_wishlist_resp = session.delete(
                f"{BASE_URL}/api/wishlist",
                json={"tourId": tour_id},
                headers=headers,
                timeout=TIMEOUT,
            )
            assert remove_wishlist_resp.status_code == 200, f"Remove from wishlist failed: {remove_wishlist_resp.text}"
            remove_result = remove_wishlist_resp.json()
            assert remove_result.get("success") or remove_result.get("message"), "Unexpected remove wishlist response"

            # 8. Confirm the tour is removed from wishlist
            get_wishlist_after_removal_resp = session.get(f"{BASE_URL}/api/wishlist", timeout=TIMEOUT)
            assert get_wishlist_after_removal_resp.status_code == 200, \
                f"Get wishlist after removal failed: {get_wishlist_after_removal_resp.text}"
            wishlist_after_removal = get_wishlist_after_removal_resp.json()
            assert all((item.get("tourId") != tour_id and item.get("id") != tour_id)
                       for item in wishlist_after_removal), "Tour still found in wishlist after removal"

            # 9. Check access control: attempt to get wishlist without authentication
            session_no_auth = requests.Session()
            no_auth_resp = session_no_auth.get(f"{BASE_URL}/api/wishlist", timeout=TIMEOUT)
            assert no_auth_resp.status_code in (401, 403), \
                f"Unauthorized wishlist access allowed: {no_auth_resp.text}"

            # 10. Check access control: attempt to add to wishlist without authentication
            no_auth_add_resp = session_no_auth.post(
                f"{BASE_URL}/api/wishlist",
                json={"tourId": tour_id},
                timeout=TIMEOUT,
            )
            assert no_auth_add_resp.status_code in (401, 403), \
                f"Unauthorized add to wishlist allowed: {no_auth_add_resp.text}"

            # 11. Check access control: attempt to remove from wishlist without authentication
            no_auth_remove_resp = session_no_auth.delete(
                f"{BASE_URL}/api/wishlist",
                json={"tourId": tour_id},
                timeout=TIMEOUT,
            )
            assert no_auth_remove_resp.status_code in (401, 403), \
                f"Unauthorized remove from wishlist allowed: {no_auth_remove_resp.text}"

        finally:
            # Cleanup: delete the created tour (admin only)
            del_url = f"{BASE_URL}/api/admin/tours/{tour_id}"
            del_resp = session.delete(del_url, timeout=TIMEOUT)
            if del_resp.status_code not in [200, 204, 404]:
                raise AssertionError(f"Failed to delete test tour: {del_resp.status_code} - {del_resp.text}")

    finally:
        # Sign out the user to clean session ONLY if signed in
        try:
            sign_out_resp = session.post(f"{BASE_URL}/api/auth/sign-out", timeout=TIMEOUT)
            assert sign_out_resp.status_code in (200, 204), f"Sign out failed with status {sign_out_resp.status_code}"
        except Exception as e:
            raise AssertionError(f"Sign out failed: {str(e)}")
        finally:
            session.close()


test_user_wishlist_functionality()
