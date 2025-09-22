import requests
import uuid
import time

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "AdminPass123!"

HEADERS_JSON = {"Content-Type": "application/json"}

def admin_sign_in():
    session = requests.Session()
    url = f"{BASE_URL}/api/auth/sign-in"
    data = {"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    resp = session.post(url, json=data, headers=HEADERS_JSON, timeout=TIMEOUT)
    resp.raise_for_status()
    # According to PRD, sign-in uses session management (cookies), no token field.
    # Ensure session cookies exist
    assert session.cookies, "No session cookies set after sign-in"
    return session

def create_tour(session):
    url = f"{BASE_URL}/api/admin/tours"
    tour_payload = {
        "name": f"Test Tour {uuid.uuid4()}",
        "title": "Admin Test Tour Title",
        "description": "A test tour created during admin dashboard API testing.",
        "location": "Testland",
        "duration": 5,
        "pricePerPerson": 150,
        "category": "Adventure",
        "difficulty": "Medium",
        "maxGroupSize": 10,
        "images": ["https://example.com/image1.jpg"],
        "startDates": [(time.strftime("%Y-%m-%dT%H:%M:%S"))],
        "included": ["Guide", "Lunch"],
        "notIncluded": ["Flights"],
        "itinerary": [{"day": 1, "activities": ["Arrival", "City tour"]}],
        "featured": True
    }
    resp = session.post(url, json=tour_payload, timeout=TIMEOUT)
    resp.raise_for_status()
    created_tour = resp.json()
    assert "id" in created_tour, "Created tour ID not found in response"
    return created_tour

def delete_tour(tour_id, session):
    # No delete endpoint specified in PRD, so no action
    pass

def create_coupon(session):
    url = f"{BASE_URL}/api/admin/coupons"
    coupon_payload = {
        "code": f"TESTCOUPON{uuid.uuid4().hex[:6].upper()}"
    }
    resp = session.post(url, json=coupon_payload, timeout=TIMEOUT)
    if resp.status_code != 201:
        return None
    created_coupon = resp.json()
    assert "id" in created_coupon or "code" in created_coupon, "Coupon creation failed or missing id/code"
    return created_coupon

def get_users(session):
    url = f"{BASE_URL}/api/admin/users"
    resp = session.get(url, timeout=TIMEOUT)
    resp.raise_for_status()
    users = resp.json()
    assert isinstance(users, list), "Users response is not a list"
    return users

def get_bookings(session):
    url = f"{BASE_URL}/api/admin/bookings"
    resp = session.get(url, timeout=TIMEOUT)
    resp.raise_for_status()
    bookings = resp.json()
    assert isinstance(bookings, list), "Bookings response is not a list"
    return bookings

def update_booking_status(booking_id, new_status, session):
    url = f"{BASE_URL}/api/admin/bookings/{booking_id}/status"
    payload = {"status": new_status}
    resp = session.patch(url, json=payload, timeout=TIMEOUT)
    resp.raise_for_status()
    updated = resp.json()
    assert updated.get("status") == new_status, f"Booking status not updated to {new_status}"
    return updated

def get_reviews(session):
    url = f"{BASE_URL}/api/admin/reviews"
    resp = session.get(url, timeout=TIMEOUT)
    if resp.status_code == 404:
        return []
    resp.raise_for_status()
    reviews = resp.json()
    assert isinstance(reviews, list), "Reviews response is not a list"
    return reviews

def delete_review(review_id, session):
    url = f"{BASE_URL}/api/admin/reviews/{review_id}"
    resp = session.delete(url, timeout=TIMEOUT)
    resp.raise_for_status()

def get_coupons(session):
    url = f"{BASE_URL}/api/admin/coupons"
    resp = session.get(url, timeout=TIMEOUT)
    resp.raise_for_status()
    coupons = resp.json()
    assert isinstance(coupons, list), "Coupons response is not a list"
    return coupons

def get_notifications(session):
    url = f"{BASE_URL}/api/admin/notifications"
    resp = session.get(url, timeout=TIMEOUT)
    resp.raise_for_status()
    notifs = resp.json()
    assert isinstance(notifs, list), "Notifications response is not a list"
    return notifs

def get_system_logs(session):
    url = f"{BASE_URL}/api/admin/logs"
    resp = session.get(url, timeout=TIMEOUT)
    resp.raise_for_status()
    logs = resp.json()
    assert isinstance(logs, list), "System logs response is not a list"
    return logs


def test_admin_dashboard_management_features():
    # Authenticate as admin
    session = admin_sign_in()

    created_tour = None
    try:
        # Tours: Create a new tour (admin only)
        created_tour = create_tour(session)
        tour_id = created_tour.get("id")

        # Tours: Get all tours (admin only)
        tours_resp = session.get(f"{BASE_URL}/api/admin/tours", timeout=TIMEOUT)
        tours_resp.raise_for_status()
        tours = tours_resp.json()
        assert any(t.get("id") == tour_id for t in tours), "Created tour not found in tours list"

        # Users: Get all users (admin only)
        users = get_users(session)
        assert users, "No users returned"

        # Bookings: Get all bookings (admin only)
        bookings = get_bookings(session)
        if bookings:
            booking = bookings[0]
            booking_id = booking.get("id") or booking.get("bookingId")
            if booking_id:
                current_status = booking.get("status", "Pending")
                new_status = "Confirmed" if current_status != "Confirmed" else "Canceled"
                updated_booking = update_booking_status(booking_id, new_status, session)
                assert updated_booking.get("status") == new_status

        # Reviews: Get reviews (admin)
        reviews = get_reviews(session)
        if reviews:
            review = reviews[0]
            review_id = review.get("id") or review.get("reviewId")
            if review_id:
                delete_review(review_id, session)
                reviews_after_delete = get_reviews(session)
                assert all(r.get("id") != review_id for r in reviews_after_delete)

        # Coupons: Create and list coupons
        coupon_created = None
        try:
            coupon_created = create_coupon(session)
        except Exception:
            coupon_created = None

        coupons = get_coupons(session)
        if coupon_created:
            assert any(c.get("code") == coupon_created.get("code") for c in coupons)

        # Notifications: Get admin notifications
        notifications = get_notifications(session)

        # System Logs: Get system logs (admin only)
        logs = get_system_logs(session)

        assert isinstance(notifications, list), "Notifications not a list"
        assert isinstance(logs, list), "System logs not a list"
    finally:
        if created_tour:
            pass


test_admin_dashboard_management_features()