import requests
import datetime

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

# Credentials for test users (should exist in system or created beforehand)
USER_EMAIL = "testuser@example.com"
USER_PASSWORD = "TestPass123!"
ADMIN_EMAIL = "adminuser@example.com"
ADMIN_PASSWORD = "AdminPass123!"

def sign_in(email, password):
    url = f"{BASE_URL}/api/auth/sign-in"
    payload = {"email": email, "password": password}
    try:
        resp = requests.post(url, json=payload, timeout=TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
        # Assuming the token is in data['token'] or data['accessToken'], else session cookie is set
        token = data.get("token") or data.get("accessToken")
        if token:
            return token
        # If no token but session cookie is set, return session cookies for auth
        return resp.cookies
    except Exception as e:
        raise Exception(f"Sign-in failed for {email}: {e}")

def create_tour(admin_auth):
    url = f"{BASE_URL}/api/admin/tours"
    # Create minimal required tour data
    today_iso = datetime.datetime.utcnow().date().isoformat()
    payload = {
        "name": "Test Tour for Booking",
        "title": "Test Tour for Booking",
        "description": "A tour created for testing booking flow.",
        "location": "Testland",
        "duration": 3,
        "pricePerPerson": 100,
        "category": "Adventure",
        "difficulty": "Easy",
        "maxGroupSize": 10,
        "images": [],
        "startDates": [today_iso],
        "included": ["Guide", "Equipment"],
        "notIncluded": ["Lunch"],
        "itinerary": [],
        "featured": False
    }
    headers = {"Authorization": f"Bearer {admin_auth}"} if isinstance(admin_auth, str) else {}
    try:
        resp = requests.post(url, json=payload, headers=headers, cookies=None if headers else admin_auth, timeout=TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
        assert "id" in data, "Tour creation response missing 'id'"
        return data["id"]
    except Exception as e:
        raise Exception(f"Failed to create tour: {e}")

def create_payment_intent(user_auth, amount):
    url = f"{BASE_URL}/api/checkout/create-payment-intent"
    payload = {"amount": amount}
    headers = {"Authorization": f"Bearer {user_auth}"} if isinstance(user_auth, str) else {}
    try:
        resp = requests.post(url, json=payload, headers=headers, cookies=None if headers else user_auth, timeout=TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
        assert "id" in data, "Payment intent creation missing 'id'"
        return data["id"]
    except Exception as e:
        raise Exception(f"Failed to create payment intent: {e}")

def create_booking(user_auth, tour_id, number_of_people, start_date, payment_intent_id):
    url = f"{BASE_URL}/api/bookings"
    payload = {
        "tourId": tour_id,
        "numberOfPeople": number_of_people,
        "startDate": start_date,
        "paymentIntentId": payment_intent_id
    }
    headers = {"Authorization": f"Bearer {user_auth}"} if isinstance(user_auth, str) else {}
    try:
        resp = requests.post(url, json=payload, headers=headers, cookies=None if headers else user_auth, timeout=TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
        assert "id" in data, "Booking creation response missing 'id'"
        # Booking status should default to "Pending"
        assert data.get("status") == "Pending", f"Unexpected booking status on creation: {data.get('status')}"
        return data["id"], data
    except Exception as e:
        raise Exception(f"Failed to create booking: {e}")

def update_booking_status(admin_auth, booking_id, status, payment_intent_id=None):
    url = f"{BASE_URL}/api/admin/bookings/{booking_id}/status"
    payload = {"bookingId": booking_id, "status": status}
    if payment_intent_id:
        payload["paymentIntentId"] = payment_intent_id
    headers = {"Authorization": f"Bearer {admin_auth}"} if isinstance(admin_auth, str) else {}
    try:
        resp = requests.patch(url, json=payload, headers=headers, cookies=None if headers else admin_auth, timeout=TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
        assert data.get("status") == status, f"Booking status update failed, expected {status} but got {data.get('status')}"
        return data
    except Exception as e:
        raise Exception(f"Failed to update booking status to {status}: {e}")

def get_booking(user_auth, booking_id):
    url = f"{BASE_URL}/api/bookings"
    headers = {"Authorization": f"Bearer {user_auth}"} if isinstance(user_auth, str) else {}
    try:
        resp = requests.get(url, headers=headers, cookies=None if headers else user_auth, timeout=TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
        # Return booking with matching id or None
        return next((b for b in data if b.get("id") == booking_id), None)
    except Exception as e:
        raise Exception(f"Failed to retrieve bookings: {e}")

def delete_booking(admin_auth, booking_id):
    # No explicit delete API described in PRD for bookings, skipping deletion step
    # Usually, bookings are not deletable, so no attempt here.
    pass

def test_booking_creation_and_status_updates_with_stripe_integration():
    # Sign in user and admin
    user_auth = sign_in(USER_EMAIL, USER_PASSWORD)
    admin_auth = sign_in(ADMIN_EMAIL, ADMIN_PASSWORD)

    # Create a tour as admin to book - will clean up the tour after test
    tour_id = None
    booking_id = None
    try:
        tour_id = create_tour(admin_auth)

        # Calculate a booking start date (use one of the tour's start dates or tomorrow)
        start_date = (datetime.datetime.utcnow() + datetime.timedelta(days=1)).date().isoformat() + "T00:00:00Z"

        # Create Stripe payment intent for booking amount (pricePerPerson * numberOfPeople * 100 cents)
        number_of_people = 2
        amount = 100 * number_of_people * 100  # amount in cents

        payment_intent_id = create_payment_intent(user_auth, amount)
        assert payment_intent_id is not None and payment_intent_id != "", "Invalid payment intent ID"

        # Create booking with tour, people count, start date and payment intent id
        booking_id, booking_data = create_booking(user_auth, tour_id, number_of_people, start_date, payment_intent_id)
        assert booking_id is not None and booking_id != "", "Invalid booking ID"

        # Verify booking initially has status Pending
        assert booking_data.get("status") == "Pending", "Booking initial status is not Pending"

        # Test admin status updates: Pending -> Confirmed
        updated = update_booking_status(admin_auth, booking_id, "Confirmed", payment_intent_id=payment_intent_id)
        assert updated.get("status") == "Confirmed", "Booking status not updated to Confirmed"

        # Test admin status updates: Confirmed -> Canceled
        updated = update_booking_status(admin_auth, booking_id, "Canceled")
        assert updated.get("status") == "Canceled", "Booking status not updated to Canceled"

        # Attempt invalid status update as user (should fail)
        url = f"{BASE_URL}/api/bookings"
        payload = {
            "bookingId": booking_id,
            "status": "Confirmed"
        }
        headers = {"Authorization": f"Bearer {user_auth}"} if isinstance(user_auth, str) else {}
        try:
            resp = requests.patch(url, json=payload, headers=headers, cookies=None if headers else user_auth, timeout=TIMEOUT)
            # Expecting error for unauthorized status update
            assert resp.status_code in (401,403), "User should not be able to update booking status"
        except requests.exceptions.HTTPError as e:
            assert e.response.status_code in (401,403), "User not authorized to update booking status"

    finally:
        # Cleanup: no explicit delete booking API per PRD, so skip booking deletion

        # Delete created tour as admin
        if tour_id:
            url = f"{BASE_URL}/api/admin/tours/{tour_id}"
            headers = {"Authorization": f"Bearer {admin_auth}"} if isinstance(admin_auth, str) else {}
            try:
                resp = requests.delete(url, headers=headers, cookies=None if headers else admin_auth, timeout=TIMEOUT)
                if resp.status_code not in (200,204):
                    pass  # Log warning or ignore; test cleanup attempt
            except Exception:
                pass

test_booking_creation_and_status_updates_with_stripe_integration()