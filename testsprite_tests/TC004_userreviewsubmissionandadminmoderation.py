import requests
import uuid
import datetime

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

# Test user review submission with rating, comment, title, and booking association,
# retrieval with optional filtering by tour or user, and deletion by owner or admin with proper authorization and moderation controls.

def test_user_review_submission_and_admin_moderation():
    # Helper functions
    def sign_up_user(email, password, first_name, last_name):
        resp = requests.post(
            f"{BASE_URL}/api/auth/sign-up",
            json={
                "email": email,
                "password": password,
                "firstName": first_name,
                "lastName": last_name,
            },
            timeout=TIMEOUT,
        )
        resp.raise_for_status()
        return resp.json()

    def sign_in_user(email, password):
        resp = requests.post(
            f"{BASE_URL}/api/auth/sign-in",
            json={"email": email, "password": password},
            timeout=TIMEOUT,
        )
        resp.raise_for_status()
        # Assuming Bearer token in json.accessToken or in cookie/session; use json.token here
        data = resp.json()
        return data.get("accessToken") or data.get("token") or resp.cookies

    def get_auth_headers(token):
        if isinstance(token, dict):
            # Cookies or session handling
            return {"Cookie": "; ".join([f"{k}={v}" for k,v in token.items()])}
        return {"Authorization": f"Bearer {token}"}

    def create_tour(admin_token):
        tour_payload = {
            "name": "Test Tour " + str(uuid.uuid4()),
            "title": "Amazing Test Tour",
            "description": "A wonderful tour for testing review features.",
            "location": "Testville",
            "duration": 3,
            "pricePerPerson": 150,
            "category": "adventure",
            "difficulty": "medium",
            "maxGroupSize": 10,
            "images": ["https://example.com/image.jpg"],
            "startDates": [datetime.datetime.utcnow().date().isoformat()],
            "included": ["Guide", "Transport"],
            "notIncluded": ["Meals"],
            "itinerary": [{"day": 1, "activity": "Arrival and briefing"}],
            "featured": False,
        }
        resp = requests.post(
            f"{BASE_URL}/api/admin/tours",
            json=tour_payload,
            headers=get_auth_headers(admin_token),
            timeout=TIMEOUT,
        )
        resp.raise_for_status()
        return resp.json().get("id") or resp.json().get("_id") or resp.json().get("tourId") or resp.json().get("id")

    def create_booking(user_token, tour_id):
        now_iso = datetime.datetime.utcnow().isoformat() + "Z"
        booking_payload = {
            "tourId": tour_id,
            "numberOfPeople": 1,
            "startDate": now_iso,
            "paymentIntentId": "test_payment_intent_" + str(uuid.uuid4()),
        }
        resp = requests.post(
            f"{BASE_URL}/api/bookings",
            json=booking_payload,
            headers=get_auth_headers(user_token),
            timeout=TIMEOUT,
        )
        resp.raise_for_status()
        json_data = resp.json()
        return json_data.get("id") or json_data.get("bookingId") or json_data.get("_id")

    def submit_review(user_token, tour_id, booking_id, rating=5, comment="Great tour!", title="Loved it!"):
        review_payload = {
            "tourId": tour_id,
            "rating": rating,
            "comment": comment,
            "title": title,
            "bookingId": booking_id,
        }
        resp = requests.post(
            f"{BASE_URL}/api/reviews",
            json=review_payload,
            headers=get_auth_headers(user_token),
            timeout=TIMEOUT,
        )
        resp.raise_for_status()
        return resp.json().get("id") or resp.json().get("reviewId") or resp.json().get("_id")

    def get_reviews(user_token=None, tour_id=None, user_id=None):
        params = {}
        if tour_id:
            params["tourId"] = tour_id
        if user_id:
            params["userId"] = user_id
        headers = get_auth_headers(user_token) if user_token else {}
        resp = requests.get(f"{BASE_URL}/api/reviews", headers=headers, params=params, timeout=TIMEOUT)
        resp.raise_for_status()
        return resp.json()

    def delete_review(user_token, review_id):
        # According to schema: DELETE on /api/reviews with body containing reviewId
        # Use user token (owner or admin)
        payload = {"reviewId": review_id}
        resp = requests.delete(
            f"{BASE_URL}/api/reviews",
            json=payload,
            headers=get_auth_headers(user_token),
            timeout=TIMEOUT,
        )
        resp.raise_for_status()
        return resp

    def admin_delete_review(admin_token, review_id):
        # Admin can delete review via /api/admin/reviews/{id} DELETE
        resp = requests.delete(
            f"{BASE_URL}/api/admin/reviews/{review_id}",
            headers=get_auth_headers(admin_token),
            timeout=TIMEOUT,
        )
        resp.raise_for_status()
        return resp

    def get_session(token):
        headers = get_auth_headers(token)
        resp = requests.get(f"{BASE_URL}/api/auth/get-session", headers=headers, timeout=TIMEOUT)
        resp.raise_for_status()
        return resp.json()

    # Create admin user and normal user for testing
    admin_email = "admin_" + str(uuid.uuid4()) + "@test.com"
    admin_pass = "AdminPass123!"
    user_email = "user_" + str(uuid.uuid4()) + "@test.com"
    user_pass = "UserPass123!"

    # We assume an admin user already exists, or we create one - here we simulate sign-up and then promote to admin (not implemented),
    # so we login with assumed existing admin credentials. If unavailable, skip admin functionality.

    # For robustness, let's try to sign-up and sign-in both admin and user, but admin operations may fail if not really admin.

    # Sign up and sign in user
    sign_up_user(user_email, user_pass, "John", "Doe")
    user_token = sign_in_user(user_email, user_pass)
    assert user_token, "User authentication failed"

    # Sign up and sign in admin
    try:
        sign_up_user(admin_email, admin_pass, "Admin", "User")
    except requests.HTTPError:
        # If admin sign-up not allowed, skip sign-up
        pass
    admin_token = sign_in_user(admin_email, admin_pass)
    assert admin_token, "Admin authentication failed"

    # Get user profile to retrieve userId
    user_session = get_session(user_token)
    user_id = user_session.get("user", {}).get("id") or user_session.get("user", {}).get("_id")
    assert user_id, "Failed to get user ID from session"

    # Create a new tour by admin (needed for booking and review)
    tour_id = None
    booking_id = None
    review_id = None

    try:
        tour_id = create_tour(admin_token)
        assert tour_id, "Failed to create tour"

        # Create a booking for the user associated with the tour
        booking_id = create_booking(user_token, tour_id)
        assert booking_id, "Failed to create booking"

        # Submit a review
        review_id = submit_review(user_token, tour_id, booking_id)
        assert review_id, "Failed to submit review"

        # Retrieve reviews filtered by tourId
        reviews_by_tour = get_reviews(tour_id=tour_id)
        assert any(r.get("id") == review_id or r.get("_id") == review_id for r in reviews_by_tour), \
            "Review not found when filtered by tourId"

        # Retrieve reviews filtered by userId
        reviews_by_user = get_reviews(user_id=user_id)
        assert any(r.get("id") == review_id or r.get("_id") == review_id for r in reviews_by_user), \
            "Review not found when filtered by userId"

        # User deletes own review
        del_resp = delete_review(user_token, review_id)
        assert del_resp.status_code == 200

        # Verify review is deleted (should not appear in reviews)
        reviews_after_delete = get_reviews(tour_id=tour_id)
        assert all(r.get("id") != review_id and r.get("_id") != review_id for r in reviews_after_delete), \
            "Review still present after user deletion"

        # Re-submit review to test admin deletion
        review_id = submit_review(user_token, tour_id, booking_id)
        assert review_id, "Failed to re-submit review for admin deletion test"

        # Admin deletes review
        del_admin_resp = admin_delete_review(admin_token, review_id)
        assert del_admin_resp.status_code == 200

        # Verify review deleted by admin
        reviews_after_admin_delete = get_reviews(tour_id=tour_id)
        assert all(r.get("id") != review_id and r.get("_id") != review_id for r in reviews_after_admin_delete), \
            "Review still present after admin deletion"

    finally:
        # Cleanup: delete booking, tour if applicable (no direct delete from bookings mentioned, assume only admin tour delete)
        if review_id:
            try:
                delete_review(user_token, review_id)
            except Exception:
                pass
        if booking_id:
            # No delete endpoint for booking in PRD, so skip unless admin can remove bookings
            pass
        if tour_id:
            try:
                resp = requests.delete(
                    f"{BASE_URL}/api/admin/tours/{tour_id}",
                    headers=get_auth_headers(admin_token),
                    timeout=TIMEOUT,
                )
                if resp.status_code not in (200, 204):
                    pass  # ignore errors in cleanup
            except Exception:
                pass

test_user_review_submission_and_admin_moderation()