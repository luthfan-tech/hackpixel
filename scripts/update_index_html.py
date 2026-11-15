import re

index_path = r"c:\Users\Lutfan\OneDrive\Desktop\Deadline Decoder\static\index.html"
with open(index_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Replace hero-art-block SVG with canvas
art_block_replacement = """      <div class="hero-art-block" aria-hidden="true">
        <!-- 3D-Style Isometric Topographic Floating Terrain (Pure Canvas) -->
        <canvas id="heroTerrainCanvas" class="hero-terrain-canvas" width="480" height="380" aria-hidden="true">
          <p class="visually-hidden">Decorative 3D isometric topographic terrain slab</p>
        </canvas>
      </div>"""

content = re.sub(
    r'<div class="hero-art-block" aria-hidden="true">.*?<!-- Scrolling Ticker Strip Under Hero -->',
    art_block_replacement + '\n    </div>\n\n    <!-- Scrolling Ticker Strip Under Hero -->',
    content,
    flags=re.DOTALL
)

# 2. Add status strip between </header> and <main class="page-body-grid">
status_strip = """  <!-- ==============================================================================
       System Status Strip (Real configuration & browser statistics)
       ============================================================================== -->
  <section class="status-strip-wrapper" id="systemStatusSection" aria-label="System status">
    <div class="status-strip">
      <div class="status-cell">
        <span class="status-indicator-dot" aria-hidden="true"></span>
        <span class="status-label">SYS_MODE:</span>
        <strong class="status-val font-pixel-label" id="statusMode">Checking...</strong>
      </div>
      <div class="status-divider" aria-hidden="true">//</div>
      <div class="status-cell">
        <span class="status-label">LOCAL_IDEAS_GENERATED:</span>
        <strong class="status-val font-pixel-label" id="statusIdeasCount">0</strong>
      </div>
      <div class="status-divider" aria-hidden="true">//</div>
      <div class="status-cell">
        <span class="status-label">LAST_RUN:</span>
        <strong class="status-val font-pixel-label" id="statusLastRun">None recorded</strong>
      </div>
    </div>
  </section>

  <!-- ==============================================================================
       Body Layout: Form, Results, Recent Ideas, What You Get, and How Scores Work
       ============================================================================== -->
  <main class="page-body-grid">"""

content = content.replace(
    '  <!-- ==============================================================================\n       Body Layout: Form, Results, Recent Ideas, What You Get, and How Scores Work\n       ============================================================================== -->\n  <main class="page-body-grid">',
    status_strip
)

# 3. Add Coming Soon card inside <aside class="body-area-recent" ...>
coming_soon_card = """        <div id="recentEmpty" class="recent-empty-text">No recent ideas stored yet.</div>
        <ul id="recentList" class="recent-items-list" aria-live="polite"></ul>
      </div>

      <!-- Coming Soon Card: Planned Features (Transparent roadmap) -->
      <div class="card coming-soon-card" id="comingSoonCard" aria-labelledby="coming-soon-heading">
        <div class="coming-soon-header">
          <span class="badge-planned font-pixel-label" aria-hidden="true">[PLANNED]</span>
          <h3 id="coming-soon-heading">Coming Soon</h3>
        </div>
        <p class="coming-soon-intro">Features planned for future releases (not currently active):</p>
        <ul class="coming-soon-list">
          <li>
            <strong class="font-pixel-label">LIVE DUPLICATE SEARCH</strong>
            <span>Deep code repository matching against GitHub, PyPI, and npm registries.</span>
          </li>
          <li>
            <strong class="font-pixel-label">MULTI-MODEL ROUTING</strong>
            <span>Toggle between fast flash models, local Ollama endpoints, and reasoning engines.</span>
          </li>
          <li>
            <strong class="font-pixel-label">EXPORT TO DEVPOST</strong>
            <span>One-click scaffold generator with README, presentation slides outline, and skeleton.</span>
          </li>
        </ul>
      </div>
    </aside>"""

content = re.sub(
    r'<div id="recentEmpty" class="recent-empty-text">No recent ideas stored yet\.</div>\s*<ul id="recentList" class="recent-items-list" aria-live="polite"></ul>\s*</div>\s*</aside>',
    coming_soon_card,
    content
)

# 4. Update SVGs fill colors in "What You Get" to baby blue
content = content.replace('fill="#a3ff20"', 'fill="#89cff0"')
content = content.replace('fill="#7ecc12"', 'fill="#66bce6"')

# 5. Redesign Footer (3 columns on desktop, stacked on mobile)
new_footer = """  <!-- ==============================================================================
       Redesigned Footer (3-column layout + Buy Me a Coffee section)
       ============================================================================== -->
  <footer class="app-footer" id="appFooter">
    <div class="footer-container">
      <div class="footer-grid">
        <!-- Col 1: About -->
        <div class="footer-col footer-col-about">
          <h3 class="footer-heading font-pixel-display">Hackpixel</h3>
          <p class="footer-text">
            Practical hackathon idea assistant providing scoped MVPs, tech stacks, and transparent rubric rankings for developer teams under tight deadlines.
          </p>
          <p class="footer-note">
            <em>Notice: Scores and time estimations are heuristic guidance to assist team prioritization, not factual guarantees.</em>
          </p>
        </div>

        <!-- Col 2: Links (Real links only) -->
        <div class="footer-col footer-col-links">
          <h3 class="footer-heading font-pixel-display">Documentation</h3>
          <ul class="footer-links-list">
            <li><a href="/README.md" class="footer-link">Project README &amp; Spec</a></li>
            <li><a href="#howScoresWorkSection" class="footer-link">Scoring Rubric &amp; Weights</a></li>
            <li><a href="#whatYouGetSection" class="footer-link">Architecture &amp; Features</a></li>
          </ul>
        </div>

        <!-- Col 3: Support (Buy Me a Coffee) -->
        <div class="footer-col footer-col-support">
          <h3 class="footer-heading font-pixel-display">Support</h3>
          <p class="footer-text">If this helped, you can support the project.</p>
          <div class="bmc-container">
            <div class="bmc-qr-wrapper">
              <img src="/static/bmc-qr.svg" alt="QR code for the Buy Me a Coffee page" class="bmc-qr-img" width="112" height="112">
            </div>
            <div class="bmc-btn-wrapper">
              <a href="#" id="bmcBtn" class="bmc-btn" target="_blank" rel="noopener noreferrer">
                <span class="bmc-icon" aria-hidden="true">&#9749;</span> Buy me a coffee
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Bottom Bar -->
      <div class="footer-bottom">
        <p>&copy; <span id="copyrightYear"></span> Hackpixel. Built with FastAPI and vanilla JavaScript.</p>
      </div>
    </div>
  </footer>

  <!-- Scripts -->
  <script src="/static/js/helpers.js"></script>
  <script src="/static/js/terrain.js"></script>
  <script src="/static/app.js"></script>
</body>
</html>"""

content = re.sub(
    r'<footer class="app-footer">.*?</html>',
    new_footer,
    content,
    flags=re.DOTALL
)

with open(index_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated static/index.html successfully!")
