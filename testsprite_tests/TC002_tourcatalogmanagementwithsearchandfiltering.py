import requests
import json

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

# Replace these with actual valid credentials of an admin user in the test environment
ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "AdminPassword123!"

def test_tourcatalogmanagementwithsearchandfiltering():
    session = requests.Session()
    try:
        # 1. Authenticate as admin to get token for admin-only endpoints
        signin_resp = session.post(
            f"{BASE_URL}/api/auth/sign-in",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            timeout=TIMEOUT
        )
        assert signin_resp.status_code == 200, f"Admin sign-in failed: {signin_resp.text}"
        # Session cookie or token assumed handled by session or returned in JSON (check session)
        # We'll try to get session info to confirm authentication
        session_resp = session.get(f"{BASE_URL}/api/auth/get-session", timeout=TIMEOUT)
        assert session_resp.status_code == 200, f"Failed to get session after admin sign-in: {session_resp.text}"
        session_data = session_resp.json()
        assert session_data.get("user") and session_data["user"].get("role") == "admin", "User is not admin after sign in"

        # 2. Create a new tour as admin (for testing filters later)
        new_tour_payload = {
            "name": "Test Tour Deluxe",
            "title": "Deluxe Adventure Tour",
            "description": "An exciting deluxe tour for testing filtering.",
            "location": "Wonderland",
            "duration": 5,
            "pricePerPerson": 350,
            "category": "Adventure",
            "difficulty": "Hard",
            "maxGroupSize": 10,
            "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
            "startDates": ["2025-12-10T00:00:00Z", "2026-01-15T00:00:00Z"],
            "included": ["Breakfast", "Guide"],
            "notIncluded": ["Flights"],
            "itinerary": [
                {"day": 1, "activities": ["Arrival and welcome"]},
                {"day": 2, "activities": ["Mountain climbing"]}
            ],
            "featured": True
        }
        create_resp = session.post(
            f"{BASE_URL}/api/admin/tours",
            json=new_tour_payload,
            timeout=TIMEOUT
        )
        assert create_resp.status_code == 201 or create_resp.status_code == 200, f"Failed to create tour: {create_resp.text}"
        created_tour = create_resp.json()
        assert created_tour.get("id") or created_tour.get("_id"), "Created tour does not contain an ID"
        tour_id = created_tour.get("id") or created_tour.get("_id")

        # 3. Define function to delete the tour after tests
        def delete_tour(tid):
            del_resp = session.delete(f"{BASE_URL}/api/admin/tours/{tid}", timeout=TIMEOUT)
            # Some APIs might return 204 or 200 on delete
            assert del_resp.status_code in (200, 204), f"Failed to delete tour: {del_resp.text}"

        # 4. Test GET /api/tours with various filters
        # Basic get all tours
        get_all_resp = requests.get(f"{BASE_URL}/api/tours", timeout=TIMEOUT)
        assert get_all_resp.status_code == 200, f"Get all tours failed: {get_all_resp.text}"
        tours = get_all_resp.json()
        assert isinstance(tours, list), "Tours response is not a list"

        # Filter by search keyword (name/title)
        params_search = {"search": "Deluxe"}
        search_resp = requests.get(f"{BASE_URL}/api/tours", params=params_search, timeout=TIMEOUT)
        assert search_resp.status_code == 200, f"Search filter failed: {search_resp.text}"
        tours_search = search_resp.json()
        assert any("Deluxe" in (t.get("name","") + t.get("title","")) for t in tours_search), \
            "Search filter did not return tours with the search keyword"

        # Filter by price range
        params_price = {"minPrice": 300, "maxPrice": 400}
        price_resp = requests.get(f"{BASE_URL}/api/tours", params=params_price, timeout=TIMEOUT)
        assert price_resp.status_code == 200, f"Price filter failed: {price_resp.text}"
        tours_price = price_resp.json()
        for t in tours_price:
            price = t.get("pricePerPerson")
            assert price is not None, "Tour missing pricePerPerson in price range filter"
            assert 300 <= price <= 400, f"Tour price {price} outside filter range"

        # Filter by difficulty
        params_difficulty = {"difficulty": "Hard"}
        diff_resp = requests.get(f"{BASE_URL}/api/tours", params=params_difficulty, timeout=TIMEOUT)
        assert diff_resp.status_code == 200, f"Difficulty filter failed: {diff_resp.text}"
        tours_diff = diff_resp.json()
        for t in tours_diff:
            assert t.get("difficulty") == "Hard", "Tour difficulty does not match filter"

        # Filter by location
        params_location = {"location": "Wonderland"}
        loc_resp = requests.get(f"{BASE_URL}/api/tours", params=params_location, timeout=TIMEOUT)
        assert loc_resp.status_code == 200, f"Location filter failed: {loc_resp.text}"
        tours_loc = loc_resp.json()
        for t in tours_loc:
            assert t.get("location") == "Wonderland", "Tour location does not match filter"

        # Filter by featured flag
        params_featured = {"featured": "true"}
        feat_resp = requests.get(f"{BASE_URL}/api/tours", params=params_featured, timeout=TIMEOUT)
        assert feat_resp.status_code == 200, f"Featured filter failed: {feat_resp.text}"
        tours_feat = feat_resp.json()
        for t in tours_feat:
            assert t.get("featured") is True, "Tour featured flag not true in filter results"

        # 5. Verify non-admin user cannot create tour
        # Register normal user
        user_email = "testuser@example.com"
        user_password = "UserPass123!"
        signup_resp = requests.post(
            f"{BASE_URL}/api/auth/sign-up",
            json={"email": user_email, "password": user_password, "firstName": "Test", "lastName": "User"},
            timeout=TIMEOUT
        )
        assert signup_resp.status_code in (200,201), f"User signup failed: {signup_resp.text}"
        # Sign-in user
        user_session = requests.Session()
        signin_user_resp = user_session.post(
            f"{BASE_URL}/api/auth/sign-in",
            json={"email": user_email, "password": user_password},
            timeout=TIMEOUT
        )
        assert signin_user_resp.status_code == 200, f"User sign-in failed: {signin_user_resp.text}"

        # Attempt to create tour with normal user session (non-admin)
        create_tour_user_resp = user_session.post(
            f"{BASE_URL}/api/admin/tours",
            json=new_tour_payload,
            timeout=TIMEOUT
        )
        assert create_tour_user_resp.status_code in (401,403), "Non-admin user should not be able to create tour"

    finally:
        # Cleanup - delete created tour if exists and if admin session available
        try:
            if 'tour_id' in locals():
                # Delete tour via admin session
                delete_resp = session.delete(f"{BASE_URL}/api/admin/tours/{tour_id}", timeout=TIMEOUT)
                # Accept 204 No Content or 200 OK for delete
                assert delete_resp.status_code in (200, 204), f"Failed to delete tour in cleanup: {delete_resp.text}"
        except Exception:
            pass
        # Optionally, delete user created for test if API supports it (not specified)

test_tourcatalogmanagementwithsearchandfiltering()