import sys
from pathlib import Path
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_deck(output_path: str):
    prs = Presentation()
    # 16:9 widescreen layout
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Apple Modern Palette
    BG_COLOR = RGBColor(245, 245, 247)       # #F5F5F7 Apple Light Gray
    CARD_BG = RGBColor(255, 255, 255)        # #FFFFFF Pure White
    TEXT_MAIN = RGBColor(29, 29, 31)         # #1D1D1F Jet Black
    TEXT_MUTED = RGBColor(110, 110, 115)     # #6E6E73 Secondary Slate
    ACCENT_BLUE = RGBColor(0, 122, 255)      # #007AFF Electric Blue
    ACCENT_AMBER = RGBColor(245, 166, 35)    # #F5A623 Top Pick Amber
    BORDER_COLOR = RGBColor(229, 229, 234)   # #E5E5EA Silver Border
    CARD_SUB_BG = RGBColor(248, 249, 250)    # Subcard background

    def set_slide_background(slide):
        bg_shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(7.5))
        bg_shape.fill.solid()
        bg_shape.fill.fore_color.rgb = BG_COLOR
        bg_shape.line.color.rgb = BG_COLOR

    def add_badge(slide, text: str, left, top, width, height=Inches(0.4), color=ACCENT_BLUE):
        shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        shape.fill.solid()
        shape.fill.fore_color.rgb = RGBColor(235, 243, 255)
        shape.line.color.rgb = RGBColor(180, 215, 255)
        tf = shape.text_frame
        tf.word_wrap = False
        p = tf.paragraphs[0]
        p.alignment = PP_ALIGN.CENTER
        run = p.add_run()
        run.text = text
        run.font.name = "Arial"
        run.font.size = Pt(11)
        run.font.bold = True
        run.font.color.rgb = color
        return shape

    def add_header(slide, title_text: str, category_text: str):
        set_slide_background(slide)
        # Category Kicker
        add_badge(slide, category_text.upper(), Inches(0.8), Inches(0.6), Inches(2.2), Inches(0.35))
        
        # Main Title
        tx_box = slide.shapes.add_textbox(Inches(0.8), Inches(1.05), Inches(11.7), Inches(0.9))
        tf = tx_box.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title_text
        p.font.name = "Arial"
        p.font.size = Pt(30)
        p.font.bold = True
        p.font.color.rgb = TEXT_MAIN

    # =========================================================================
    # SLIDE 1: Title Slide (Cover)
    # =========================================================================
    slide1 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide1)

    # Accent decorative bar
    bar = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.8), Inches(0.12), Inches(3.8))
    bar.fill.solid()
    bar.fill.fore_color.rgb = ACCENT_BLUE
    bar.line.fill.background()

    # Brand Title & Kicker
    add_badge(slide1, "HACKATHON IDEATION ENGINE", Inches(1.1), Inches(1.8), Inches(3.2), Inches(0.42))

    t_box = slide1.shapes.add_textbox(Inches(1.1), Inches(2.4), Inches(11.0), Inches(1.8))
    tf1 = t_box.text_frame
    tf1.word_wrap = True
    p1 = tf1.paragraphs[0]
    p1.text = "Hackpixel ⚡"
    p1.font.name = "Arial"
    p1.font.size = Pt(56)
    p1.font.bold = True
    p1.font.color.rgb = TEXT_MAIN

    p2 = tf1.add_paragraph()
    p2.text = "Scoped, scored, and ranked project ideas you can actually finish on time."
    p2.font.name = "Arial"
    p2.font.size = Pt(22)
    p2.font.color.rgb = TEXT_MUTED
    p2.space_before = Pt(14)

    # Card with stack & meta
    card1 = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.1), Inches(4.7), Inches(11.0), Inches(1.5))
    card1.fill.solid()
    card1.fill.fore_color.rgb = CARD_BG
    card1.line.color.rgb = BORDER_COLOR
    
    c_tf = card1.text_frame
    c_tf.word_wrap = True
    cp1 = c_tf.paragraphs[0]
    cp1.text = "ARCHITECTURE & CORE STACK"
    cp1.font.name = "Arial"
    cp1.font.size = Pt(11)
    cp1.font.bold = True
    cp1.font.color.rgb = ACCENT_BLUE
    
    cp2 = c_tf.add_paragraph()
    cp2.text = "FastAPI  •  React 19  •  Three.js 3D Hardware  •  Tailwind CSS v4  •  Google Gemini 2.5 Flash"
    cp2.font.name = "Arial"
    cp2.font.size = Pt(15)
    cp2.font.bold = True
    cp2.font.color.rgb = TEXT_MAIN
    cp2.space_before = Pt(6)

    # =========================================================================
    # SLIDE 2: The Problem
    # =========================================================================
    slide2 = prs.slides.add_slide(blank_layout)
    add_header(slide2, "Why Hackathon Teams Fail to Submit", "The Problem")

    problems = [
        ("Scope Creep", "Teams brainstorm massive ideas without considering the ticking clock, resulting in half-baked prototypes with broken flows."),
        ("Ambiguous MVPs", "Unclear boundaries of what is strictly necessary for demo day versus what is optional causes team friction and wasted effort."),
        ("Duplicate Repos", "Teams accidentally build copies of existing projects, losing judge points for originality and market freshness."),
        ("Zero Rubric Alignment", "Projects fail to target the judging criteria (feasibility, business value, demo impact), scoring poorly despite heroic coding.")
    ]

    card_w = Inches(2.7)
    card_h = Inches(4.4)
    gap = Inches(0.3)
    start_x = Inches(0.8)
    top_y = Inches(2.2)

    for i, (p_title, p_desc) in enumerate(problems):
        card = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, start_x + i * (card_w + gap), top_y, card_w, card_h)
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = BORDER_COLOR
        
        ctf = card.text_frame
        ctf.word_wrap = True
        
        # Number badge
        p_num = ctf.paragraphs[0]
        p_num.text = f"0{i+1}"
        p_num.font.name = "Arial"
        p_num.font.size = Pt(28)
        p_num.font.bold = True
        p_num.font.color.rgb = ACCENT_BLUE
        
        # Title
        p_t = ctf.add_paragraph()
        p_t.text = p_title
        p_t.font.name = "Arial"
        p_t.font.size = Pt(17)
        p_t.font.bold = True
        p_t.font.color.rgb = TEXT_MAIN
        p_t.space_before = Pt(12)
        
        # Description
        p_d = ctf.add_paragraph()
        p_d.text = p_desc
        p_d.font.name = "Arial"
        p_d.font.size = Pt(13)
        p_d.font.color.rgb = TEXT_MUTED
        p_d.space_before = Pt(12)

    # =========================================================================
    # SLIDE 3: The Solution
    # =========================================================================
    slide3 = prs.slides.add_slide(blank_layout)
    add_header(slide3, "Hackpixel: Intelligent Scoping Co-Pilot", "The Solution")

    s_card1 = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(2.2), Inches(5.7), Inches(4.4))
    s_card1.fill.solid()
    s_card1.fill.fore_color.rgb = CARD_BG
    s_card1.line.color.rgb = BORDER_COLOR
    
    stf1 = s_card1.text_frame
    stf1.word_wrap = True
    sp1 = stf1.paragraphs[0]
    sp1.text = "PRECISION CONSTRAINT INPUTS"
    sp1.font.name = "Arial"
    sp1.font.size = Pt(13)
    sp1.font.bold = True
    sp1.font.color.rgb = ACCENT_BLUE

    bullets_1 = [
        "Time Remaining: Exact hours left until submission deadline",
        "Team Dynamics: Size (1-6 devs) and skill level (Beginner/Mid/Adv)",
        "Demo Style: Live App, Slides-Heavy, or Data Story",
        "Risk Appetite: Safe & solid vs. Ambitious Moonshot",
        "Architecture Presets: 1-Click Jamstack, AI Native, Mobile, Data"
    ]
    for b in bullets_1:
        bp = stf1.add_paragraph()
        bp.text = f"✔  {b}"
        bp.font.name = "Arial"
        bp.font.size = Pt(13)
        bp.font.color.rgb = TEXT_MAIN
        bp.space_before = Pt(14)

    s_card2 = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(2.2), Inches(5.7), Inches(4.4))
    s_card2.fill.solid()
    s_card2.fill.fore_color.rgb = CARD_BG
    s_card2.line.color.rgb = BORDER_COLOR
    
    stf2 = s_card2.text_frame
    stf2.word_wrap = True
    sp2 = stf2.paragraphs[0]
    sp2.text = "FEASIBLE, SCOPED DELIVERABLES"
    sp2.font.name = "Arial"
    sp2.font.size = Pt(13)
    sp2.font.bold = True
    sp2.font.color.rgb = ACCENT_BLUE

    bullets_2 = [
        "10 Deterministic Idea Cards: Ranked from #1 Top Pick to #10",
        "Minimum Viable Version: Strict MVP scope you can finish",
        "Optional Extras: Stretch goals only if time permits",
        "Transparent 5-Dimension Rubric: Weighted scoring out of 5.0",
        "GitHub Duplicate Protection: Pre-flight originality check"
    ]
    for b in bullets_2:
        bp = stf2.add_paragraph()
        bp.text = f"⚡  {b}"
        bp.font.name = "Arial"
        bp.font.size = Pt(13)
        bp.font.color.rgb = TEXT_MAIN
        bp.space_before = Pt(14)

    # =========================================================================
    # SLIDE 4: 5-Dimension Scoring Rubric
    # =========================================================================
    slide4 = prs.slides.add_slide(blank_layout)
    add_header(slide4, "Transparent Scoring Rubric (Out of 5.0)", "Evaluation Engine")

    rubrics = [
        ("Time Fit", "25%", "Strict evaluation against available hours so the scope never exceeds deadlines."),
        ("Feasibility", "25%", "Stack pragmatism, architectural complexity, and free API reliability."),
        ("Team Fit", "20%", "Matches team size and developer skill distribution to prevent bottlenecks."),
        ("Demo Impact", "15%", "Ensures the project produces a visual, memorable live judging demonstration."),
        ("Theme Fit", "15%", "Aligns tightly with hackathon tracks, sponsors, and domain prompts.")
    ]

    r_w = Inches(2.2)
    r_h = Inches(4.4)
    r_gap = Inches(0.18)

    for i, (r_name, r_weight, r_desc) in enumerate(rubrics):
        card = slide4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8) + i * (r_w + r_gap), Inches(2.2), r_w, r_h)
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = BORDER_COLOR
        
        rtf = card.text_frame
        rtf.word_wrap = True
        
        rp1 = rtf.paragraphs[0]
        rp1.text = r_weight
        rp1.font.name = "Arial"
        rp1.font.size = Pt(32)
        rp1.font.bold = True
        rp1.font.color.rgb = ACCENT_BLUE
        
        rp2 = rtf.add_paragraph()
        rp2.text = r_name
        rp2.font.name = "Arial"
        rp2.font.size = Pt(16)
        rp2.font.bold = True
        rp2.font.color.rgb = TEXT_MAIN
        rp2.space_before = Pt(10)
        
        rp3 = rtf.add_paragraph()
        rp3.text = r_desc
        rp3.font.name = "Arial"
        rp3.font.size = Pt(12)
        rp3.font.color.rgb = TEXT_MUTED
        rp3.space_before = Pt(14)

    # =========================================================================
    # SLIDE 5: Full-Stack Architecture
    # =========================================================================
    slide5 = prs.slides.add_slide(blank_layout)
    add_header(slide5, "Full-Stack System Architecture", "Engineering & Stack")

    layers = [
        ("Client UI / Modern Jamstack", "React 19, Vite, Three.js 3D Hardware Canvas, Tailwind CSS v4, Lucide Icons, Framer Motion."),
        ("API & Orchestration Layer", "FastAPI (Python 3.14), Pydantic v2 schemas, automated input validation, CORS, error gateways."),
        ("AI Inference Engine", "Google Gemini 2.5 Flash with structured system prompt engineering and zero-shot schema guarantees."),
        ("Scoring & Deduplication", "Deterministic Python heuristic weighted scoring + GitHub API repository similarity check.")
    ]

    l_top = Inches(2.2)
    for i, (l_title, l_desc) in enumerate(layers):
        card = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), l_top + i * Inches(1.15), Inches(11.7), Inches(1.0))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = BORDER_COLOR
        
        ltf = card.text_frame
        ltf.word_wrap = True
        lp = ltf.paragraphs[0]
        lp.text = f"STEP {i+1} : {l_title.upper()}"
        lp.font.name = "Arial"
        lp.font.size = Pt(11)
        lp.font.bold = True
        lp.font.color.rgb = ACCENT_BLUE
        
        lp2 = ltf.add_paragraph()
        lp2.text = l_desc
        lp2.font.name = "Arial"
        lp2.font.size = Pt(13)
        lp2.font.color.rgb = TEXT_MAIN
        lp2.space_before = Pt(3)

    # =========================================================================
    # SLIDE 6: UI/UX & 3D Interactive Hero
    # =========================================================================
    slide6 = prs.slides.add_slide(blank_layout)
    add_header(slide6, "Apple Modern Design Language & 3D Hardware", "Design & Experience")

    ui_points = [
        ("3D Anodized Aluminum Laptop", "Interactive Three.js laptop standing 90° upright in the hero section, featuring custom studio lighting, Electric Blue rim glow, and live retina screen terminal."),
        ("Prominent Brand Foreground", "The bold 'HACKPIXEL' title stands in front of the 3D hardware with non-blocking pointer events for maximum brand recognition."),
        ("Apple Modern Color Palette", "Clean #F5F5F7 canvas, pure white card containers, silver borders, and #007AFF interactive touchpoints."),
        ("Accessible Developer UX", "WCAG AAA contrast ratings, instant Markdown export, dynamic filter-by-stack, and responsive layout for mobile and desktop.")
    ]

    for i, (u_title, u_desc) in enumerate(ui_points):
        row = i // 2
        col = i % 2
        card = slide6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8) + col * Inches(6.0), Inches(2.2) + row * Inches(2.3), Inches(5.7), Inches(2.1))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = BORDER_COLOR
        
        utf = card.text_frame
        utf.word_wrap = True
        up = utf.paragraphs[0]
        up.text = u_title
        up.font.name = "Arial"
        up.font.size = Pt(16)
        up.font.bold = True
        up.font.color.rgb = ACCENT_BLUE
        
        up2 = utf.add_paragraph()
        up2.text = u_desc
        up2.font.name = "Arial"
        up2.font.size = Pt(13)
        up2.font.color.rgb = TEXT_MAIN
        up2.space_before = Pt(8)

    # =========================================================================
    # SLIDE 7: Roadmap & Next Steps
    # =========================================================================
    slide7 = prs.slides.add_slide(blank_layout)
    add_header(slide7, "Roadmap & Future Capabilities", "Vision & Growth")

    roadmap = [
        ("Q1 2027", "Live Duplicate Vector Search", "Semantic embeddings comparison against 100,000+ past winning hackathon repos on Devpost and GitHub."),
        ("Q2 2027", "Multi-LLM Consensus Routing", "Cross-validating idea feasibility across Google Gemini 2.5 Pro, Claude 3.7 Sonnet, and GPT-4o."),
        ("Q3 2027", "1-Click GitHub Repo Scaffolding", "Instantly bootstrap a complete Next.js 15 or FastAPI repo with database models and README from the chosen idea card.")
    ]

    for i, (quarter, title, desc) in enumerate(roadmap):
        card = slide7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(2.2) + i * Inches(1.5), Inches(11.7), Inches(1.3))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = BORDER_COLOR
        
        rtf = card.text_frame
        rtf.word_wrap = True
        rp = rtf.paragraphs[0]
        rp.text = f"{quarter}  —  {title.upper()}"
        rp.font.name = "Arial"
        rp.font.size = Pt(15)
        rp.font.bold = True
        rp.font.color.rgb = ACCENT_BLUE
        
        rp2 = rtf.add_paragraph()
        rp2.text = desc
        rp2.font.name = "Arial"
        rp2.font.size = Pt(13)
        rp2.font.color.rgb = TEXT_MAIN
        rp2.space_before = Pt(6)

    # =========================================================================
    # SLIDE 8: Summary / Thank You Slide
    # =========================================================================
    slide8 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide8)

    bar8 = slide8.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.8), Inches(0.12), Inches(3.8))
    bar8.fill.solid()
    bar8.fill.fore_color.rgb = ACCENT_BLUE
    bar8.line.fill.background()

    add_badge(slide8, "GET STARTED TODAY", Inches(1.1), Inches(1.8), Inches(2.4), Inches(0.42))

    t_box8 = slide8.shapes.add_textbox(Inches(1.1), Inches(2.4), Inches(11.0), Inches(1.8))
    tf8 = t_box8.text_frame
    tf8.word_wrap = True
    p8_1 = tf8.paragraphs[0]
    p8_1.text = "Ship Your Next Hackathon on Time."
    p8_1.font.name = "Arial"
    p8_1.font.size = Pt(48)
    p8_1.font.bold = True
    p8_1.font.color.rgb = TEXT_MAIN

    p8_2 = tf8.add_paragraph()
    p8_2.text = "Hackpixel takes the guesswork out of hackathons with precision scoping and AI guidance."
    p8_2.font.name = "Arial"
    p8_2.font.size = Pt(20)
    p8_2.font.color.rgb = TEXT_MUTED
    p8_2.space_before = Pt(12)

    # Contact & Links Card
    card8 = slide8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.1), Inches(4.7), Inches(11.0), Inches(1.6))
    card8.fill.solid()
    card8.fill.fore_color.rgb = CARD_BG
    card8.line.color.rgb = BORDER_COLOR
    
    c_tf8 = card8.text_frame
    c_tf8.word_wrap = True
    
    cp8_1 = c_tf8.paragraphs[0]
    cp8_1.text = "PROJECT LINKS & REPOSITORY"
    cp8_1.font.name = "Arial"
    cp8_1.font.size = Pt(11)
    cp8_1.font.bold = True
    cp8_1.font.color.rgb = ACCENT_BLUE

    cp8_2 = c_tf8.add_paragraph()
    cp8_2.text = "GitHub: https://github.com/luthfan-tech/hackpixel    •    Support: buymeacoffee.com/luthfanmakl"
    cp8_2.font.name = "Arial"
    cp8_2.font.size = Pt(15)
    cp8_2.font.bold = True
    cp8_2.font.color.rgb = TEXT_MAIN
    cp8_2.space_before = Pt(8)

    prs.save(output_path)
    print(f"Presentation saved successfully to: {output_path}")

if __name__ == "__main__":
    out_file = sys.argv[1] if len(sys.argv) > 1 else "Hackpixel_Pitch_Deck.pptx"
    create_deck(out_file)
