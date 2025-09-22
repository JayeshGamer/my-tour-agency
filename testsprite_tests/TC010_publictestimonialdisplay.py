import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30


def test_public_testimonial_display():
    url = f"{BASE_URL}/api/testimonials"
    headers = {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                      "(KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    }

    try:
        response = requests.get(url, headers=headers, timeout=TIMEOUT)
        response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    # Validate response content-type header is JSON
    content_type = response.headers.get("Content-Type", "")
    assert "application/json" in content_type, f"Expected 'application/json' content-type, got '{content_type}'."

    # Validate the response body content
    try:
        testimonials = response.json()
    except ValueError:
        assert False, "Response is not valid JSON."

    # The response should be a list (array) of testimonials
    assert isinstance(testimonials, list), f"Expected response to be a list but got {type(testimonials)}."

    # If there are testimonials, validate at least one testimonial structure
    if testimonials:
        sample = testimonials[0]
        assert isinstance(sample, dict), f"Testimonial should be a dict, got {type(sample)}."
        # Validate presence of common testimonial fields
        # Because no schema details are given, check for usual plausible fields
        possible_fields = ["id", "name", "title", "comment", "rating", "date"]
        assert any(field in sample for field in possible_fields), "Testimonial lacks expected fields."

    # Additional accessibility check: ensure response is not empty (some testimonials should be public)
    # It is valid that there are zero testimonials, but we note it
    # So no failure for empty list, just pass


test_public_testimonial_display()