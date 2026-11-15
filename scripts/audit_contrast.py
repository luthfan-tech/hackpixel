def get_luminance(hex_str):
    hex_str = hex_str.lstrip("#")
    r, g, b = [int(hex_str[i:i+2], 16) / 255.0 for i in (0, 2, 4)]
    def to_linear(c):
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    lr, lg, lb = to_linear(r), to_linear(g), to_linear(b)
    return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb

def get_contrast(hex1, hex2):
    l1 = get_luminance(hex1)
    l2 = get_luminance(hex2)
    lighter = max(l1, l2)
    darker = min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)

pairs = [
    ("White Text (#f8fafc)", "#f8fafc", "Dark Base (#0a0e14)", "#0a0e14", "Main headings, body text"),
    ("White Text (#f8fafc)", "#f8fafc", "Surface Card (#111722)", "#111722", "Form cards, idea card titles"),
    ("Muted Text (#94a3b8)", "#94a3b8", "Dark Base (#0a0e14)", "#0a0e14", "Hero subtitle, ticker text"),
    ("Muted Text (#94a3b8)", "#94a3b8", "Surface Card (#111722)", "#111722", "Card descriptions, labels"),
    ("Subtle Text (#8494a8)", "#8494a8", "Dark Base (#0a0e14)", "#0a0e14", "Footer note, fine print"),
    ("Baby Blue Accent (#89cff0)", "#89cff0", "Dark Base (#0a0e14)", "#0a0e14", "Hero title, kicker, icons"),
    ("Baby Blue Accent (#89cff0)", "#89cff0", "Surface Card (#111722)", "#111722", "Card score tags, focus rings"),
    ("Dark Button Text (#0a0e14)", "#0a0e14", "Baby Blue Accent (#89cff0)", "#89cff0", "CTA button, Buy Me a Coffee button"),
    ("Dark Button Text (#0a0e14)", "#0a0e14", "Baby Blue Hover (#aee2fb)", "#aee2fb", "Button hover state"),
    ("Danger Text (#f87171)", "#f87171", "Surface Card (#111722)", "#111722", "Duplicate warnings, 422 errors"),
    ("Warning Text (#fbbf24)", "#fbbf24", "Surface Card (#111722)", "#111722", "Warning status badges"),
    ("Secondary Cyan (#7dd3fc)", "#7dd3fc", "Surface Card (#111722)", "#111722", "Tech stack tags, planned badge"),
]

print("| Foreground | Background | Computed Ratio | WCAG AA (> 4.5:1) | WCAG AAA (> 7.0:1) | Usage Location |")
print("| :--- | :--- | :--- | :--- | :--- | :--- |")
for fg_name, fg_hex, bg_name, bg_hex, usage in pairs:
    ratio = get_contrast(fg_hex, bg_hex)
    aa = "Pass" if ratio >= 4.5 else "Fail"
    aaa = "Pass" if ratio >= 7.0 else "Fail"
    print(f"| {fg_name} | {bg_name} | **{ratio:.2f} : 1** | {aa} | {aaa} | {usage} |")
