"""
Capture the Google login warning by:
1. Navigating to /auth/login
2. Taking a screenshot
3. Collecting all console messages (errors, warnings)
4. Inspecting the DOM for any visible warning text
"""
from playwright.sync_api import sync_playwright
import json

SCREENSHOT_PATH = "scripts/login_screenshot.png"
LOGS_PATH = "scripts/login_logs.json"

logs = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1280, "height": 800})
    page = context.new_page()

    # Capture ALL console messages
    def on_console(msg):
        logs.append({
            "type": msg.type,
            "text": msg.text,
            "location": f"{msg.location.get('url','?')}:{msg.location.get('lineNumber','?')}"
        })

    page.on("console", on_console)

    # Also capture page errors
    page.on("pageerror", lambda err: logs.append({"type": "pageerror", "text": str(err)}))

    # Navigate to login
    page.goto("http://localhost:3000/auth/login")
    page.wait_for_load_state("networkidle")

    # Screenshot of login page
    page.screenshot(path=SCREENSHOT_PATH, full_page=True)
    print(f"[✓] Screenshot saved: {SCREENSHOT_PATH}")

    # Check for any visible warning/error text on the page
    warning_texts = page.locator("text=warning, text=Warning, [role=alert], .text-error, .text-warning").all_text_contents()
    if warning_texts:
        print(f"[!] Visible warnings on page: {warning_texts}")
    else:
        print("[i] No visible warning text found on login page DOM")

    # Get full page text content to spot anything unusual
    body_text = page.inner_text("body")
    print("\n--- Visible page text (first 800 chars) ---")
    print(body_text[:800])

    browser.close()

# Save logs
with open(LOGS_PATH, "w") as f:
    json.dump(logs, f, indent=2)

print(f"\n[✓] Console logs saved: {LOGS_PATH}")
print(f"\n--- Console logs ({len(logs)} entries) ---")
for entry in logs:
    if entry["type"] in ("error", "warning", "pageerror"):
        print(f"  [{entry['type'].upper()}] {entry['text']}")

# Also print all logs for full picture
print("\n--- All console logs ---")
for entry in logs:
    print(f"  [{entry['type']}] {entry['text'][:200]}")
