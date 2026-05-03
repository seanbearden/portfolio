from playwright.sync_api import Page, expect, sync_playwright
import time

def verify_hero_section(page: Page):
    # Navigate to the homepage
    page.goto("http://localhost:5173")

    # Wait for the hero section to be visible
    # The name is "Sean Bearden Ph.D."
    expect(page.get_by_role("heading", name="Sean Bearden Ph.D.")).to_be_visible()

    # Wait for animations to settle
    time.sleep(2)

    # Take a screenshot of the hero section
    page.screenshot(path="/home/jules/verification/hero_verification.png")
    print("Screenshot saved to /home/jules/verification/hero_verification.png")

if __name__ == "__main__":
    import os
    if not os.path.exists("/home/jules/verification"):
        os.makedirs("/home/jules/verification")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_hero_section(page)
        finally:
            browser.close()
