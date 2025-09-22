import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_contact_form_submission_and_inquiry_management():
    url = f"{BASE_URL}/api/contact"
    headers = {
        "Content-Type": "application/json"
    }
    payload = {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "phone": "+1234567890",
        "subject": "Inquiry about tour packages",
        "message": "I would like to know more about the upcoming tours to Europe in winter.",
        "inquiryType": "General"
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
        response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    assert response.status_code == 201 or response.status_code == 200, f"Unexpected status code: {response.status_code}"
    response_data = response.json()
    # Assuming the API returns a JSON object with at least a success indication or the saved inquiry data
    assert isinstance(response_data, dict), "Response data is not a JSON object"
    # Check presence of keys that confirm data storage; adapt if actual keys differ
    expected_keys = {"id", "name", "email", "phone", "subject", "message", "inquiryType", "createdAt"}
    has_required_keys = expected_keys.intersection(response_data.keys())
    assert has_required_keys, f"Response JSON missing expected keys: {expected_keys}"

test_contact_form_submission_and_inquiry_management()