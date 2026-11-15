from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_get_root_returns_html_page():
    """Verify that GET / returns the HTML page containing the Hackpixel hero, status strip, form, results, footer, and BMC section."""
    response = client.get("/")
    assert response.status_code == 200
    assert "text/html" in response.headers.get("content-type", "")

    html = response.text
    # 1. Single h1 containing the app name
    assert "<h1 class=\"hero-title\">Hackpixel</h1>" in html
    assert html.count("<h1") == 1, "There must be exactly one <h1> heading on the page"

    # 2. Subtitle line
    assert "Tell us your hours and theme. Get 10 ideas you can actually finish." in html

    # 3. Bracketed call-to-action
    assert "Generate ideas" in html
    assert "cta-bracket" in html

    # 4. Canvas element for 3D isometric floating terrain
    assert "id=\"heroTerrainCanvas\"" in html
    assert "hero-terrain-canvas" in html
    assert "aria-hidden=\"true\"" in html

    # 5. Ticker strip
    assert "hero-ticker-wrap" in html
    assert "Hours left &middot; Theme &middot; Stack &middot; Team size &middot; Tone" in html

    # 6. Status strip between hero and body
    assert "id=\"systemStatusSection\"" in html
    assert "id=\"statusMode\"" in html
    assert "id=\"statusIdeasCount\"" in html
    assert "id=\"statusLastRun\"" in html

    # 7. Form with required id
    assert "id=\"ideasForm\"" in html
    assert "fieldset" in html
    assert "legend" in html

    # 8. Results region with required id and pagination controls
    assert "id=\"resultsSection\"" in html
    assert "id=\"paginationControls\"" in html
    assert "id=\"pageInfoText\"" in html
    assert "id=\"pageSizeSelect\"" in html
    assert "id=\"prevPageBtn\"" in html
    assert "id=\"nextPageBtn\"" in html
    assert "id=\"pageNumbersContainer\"" in html
    assert "id=\"exportMarkdownBtn\"" in html
    assert "id=\"copyToast\"" in html
    assert "id=\"pixelBloomCanvas\"" in html
    assert "data-preset=\"jamstack\"" in html
    assert "tech-icon" in html

    # 9. Recent ideas region & Coming Soon card
    assert "id=\"recentSection\"" in html
    assert "id=\"comingSoonCard\"" in html
    assert "LIVE DUPLICATE SEARCH" in html

    # 10. What you get and How scores work sections
    assert "id=\"whatYouGetSection\"" in html
    assert "id=\"howScoresWorkSection\"" in html

    # 11. Redesigned footer and Buy Me a Coffee section
    assert "id=\"appFooter\"" in html
    assert "id=\"bmcBtn\"" in html
    assert "Buy me a coffee" in html
    assert "bmc-qr.svg" in html
    assert "QR code for the Buy Me a Coffee page" in html
    assert "id=\"copyrightYear\"" in html


def test_tokens_css_is_served_with_baby_blue_accent():
    """Verify that static/css/tokens.css is served with 200 and defines baby blue accent (#89cff0)."""
    response = client.get("/static/css/tokens.css")
    assert response.status_code == 200
    assert "text/css" in response.headers.get("content-type", "")
    assert "--color-accent-primary" in response.text
    assert "#89cff0" in response.text.lower()
    assert "--color-bg-base" in response.text
    assert "--font-display" in response.text
    assert "--font-label" in response.text
    assert "--font-tech" in response.text


def test_static_files_are_served():
    """Verify that static CSS, JS, terrain, and QR SVG assets are accessible via /static/."""
    # Test CSS file
    css_response = client.get("/static/styles.css")
    assert css_response.status_code == 200
    assert "text/css" in css_response.headers.get("content-type", "")
    assert "tokens.css" in css_response.text

    # Test main JavaScript file
    js_response = client.get("/static/app.js")
    assert js_response.status_code == 200
    content_type = js_response.headers.get("content-type", "")
    assert "javascript" in content_type or "text/plain" in content_type
    assert "handleFormSubmit" in js_response.text
    assert "BMC_URL" in js_response.text

    # Test pure helper JavaScript file
    helpers_response = client.get("/static/js/helpers.js")
    assert helpers_response.status_code == 200
    helpers_type = helpers_response.headers.get("content-type", "")
    assert "javascript" in helpers_type or "text/plain" in helpers_type
    assert "filterIdeasByStack" in helpers_response.text
    assert "paginate" in helpers_response.text

    # Test 3D terrain canvas JavaScript file
    terrain_response = client.get("/static/js/terrain.js")
    assert terrain_response.status_code == 200
    terrain_type = terrain_response.headers.get("content-type", "")
    assert "javascript" in terrain_type or "text/plain" in terrain_type
    assert "heroTerrainCanvas" in terrain_response.text
    assert "prefers-reduced-motion" in terrain_response.text

    # Test Buy Me a Coffee QR Code SVG file
    qr_response = client.get("/static/bmc-qr.svg")
    assert qr_response.status_code == 200
    qr_type = qr_response.headers.get("content-type", "")
    assert "svg" in qr_type or "xml" in qr_type
    assert "<svg" in qr_response.text


def test_api_status_endpoint():
    """Verify that GET /api/status returns mode, mock_mode, and strictly omits all keys/secrets."""
    response = client.get("/api/status")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["status"] == "ok"
    assert "mode" in data
    assert data["mode"] in ("Mock data", "Live Gemini")
    assert "mock_mode" in data

    # Strictly verify NO key-like or secret fields are present in the JSON response
    forbidden_terms = ["key", "api_key", "gemini", "secret", "token", "password", "auth", "credential"]
    for k in data.keys():
        for term in forbidden_terms:
            assert term not in k.lower(), f"Forbidden secret-like field '{k}' found in /api/status response"

    # Also inspect values
    for v in data.values():
        val_str = str(v).lower()
        assert "aiza" not in val_str
        assert "aq." not in val_str


def test_readme_endpoint():
    """Verify that GET /README.md serves the markdown documentation."""
    response = client.get("/README.md")
    assert response.status_code == 200
    assert "Hackpixel" in response.text
