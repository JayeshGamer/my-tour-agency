import requests
import uuid

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

# Placeholder for authentication token - needs to be replaced with a valid token for the tests to pass
AUTH_TOKEN = "Bearer your_valid_token_here"

def test_stripe_payment_intent_creation_and_coupon_application():
    # Test minimum amount validation for payment intent creation and coupon application handling

    headers = {
        "Content-Type": "application/json",
        "Authorization": AUTH_TOKEN
    }

    # 1. Test: Create payment intent with amount less than minimum (50) - expect error
    invalid_amount_payload = {"amount": 40}
    try:
        resp = requests.post(
            f"{BASE_URL}/api/checkout/create-payment-intent",
            json=invalid_amount_payload,
            headers=headers,
            timeout=TIMEOUT,
        )
        if resp.status_code in (400, 422):
            pass
        elif resp.status_code == 200:
            data = resp.json()
            assert "id" not in data, "Payment intent should not be created with amount below minimum"
        else:
            assert False, f"Unexpected status code for invalid amount: {resp.status_code}"
    except requests.RequestException as e:
        assert False, f"Request failed during invalid amount test: {e}"

    # 2. Test: Create payment intent with valid minimum amount
    valid_amount_payload = {"amount": 100}
    payment_intent_id = None
    try:
        resp = requests.post(
            f"{BASE_URL}/api/checkout/create-payment-intent",
            json=valid_amount_payload,
            headers=headers,
            timeout=TIMEOUT,
        )
        assert resp.status_code == 200, f"Unexpected status code: {resp.status_code}"
        data = resp.json()
        assert "id" in data, "Payment intent ID missing in response"
        payment_intent_id = data.get("id")
        assert isinstance(payment_intent_id, str) and payment_intent_id, "Invalid payment intent ID"
    except requests.RequestException as e:
        assert False, f"Request failed during valid amount payment intent creation: {e}"

    # 3. Test: Apply coupon with valid code and amount
    coupon_code = f"TESTCOUPON-{uuid.uuid4().hex[:8].upper()}"
    coupon_amount = 10

    apply_coupon_payload = {
        "code": coupon_code,
        "amount": coupon_amount
    }
    try:
        resp = requests.post(
            f"{BASE_URL}/api/checkout/apply-coupon",
            json=apply_coupon_payload,
            headers=headers,
            timeout=TIMEOUT,
        )
        if resp.status_code == 200:
            data = resp.json()
            assert "success" in data or "discount" in data or "message" in data, (
                "Response missing expected coupon application details"
            )
        else:
            assert resp.status_code == 400 or resp.status_code == 404, (
                f"Unexpected status code on apply coupon: {resp.status_code}"
            )
    except requests.RequestException as e:
        assert False, f"Request failed during coupon application test: {e}"

    # 4. Test: Apply coupon with zero or negative amount - expect error or handled gracefully
    invalid_coupon_payload = {
        "code": "VALIDCODE",
        "amount": 0
    }
    try:
        resp = requests.post(
            f"{BASE_URL}/api/checkout/apply-coupon",
            json=invalid_coupon_payload,
            headers=headers,
            timeout=TIMEOUT,
        )
        assert resp.status_code == 400 or resp.status_code == 422, (
            "Expected client error for coupon application with zero or negative amount"
        )
    except requests.RequestException as e:
        assert False, f"Request failed during invalid coupon amount test: {e}"


test_stripe_payment_intent_creation_and_coupon_application()
