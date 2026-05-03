"""Visual verification script for the hero section. Run against a local
dev server (npm run dev) — saves a screenshot to verify_hero.png in the
working directory.

Usage:
    python verify_hero.py
"""
from pathlib import Path
import time

from playwright.sync_api import Page, expect, sync_playwright


def verify_hero_section(page: Page, output: Path):
    page.goto("http://localhost:5173")

    # The h1 reads from home.hero.name in home.json.
    expect(page.get_by_role("heading", name="Sean Bearden Ph.D.")).to_be_visible()

    # Wait for animations to settle.
    time.sleep(2)

    page.screenshot(path=str(output))
    print(f"Screenshot saved to {output}")


if __name__ == "__main__":
    output = Path(__file__).resolve().parent / "hero_verification.png"
    output.parent.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_hero_section(page, output)
        finally:
            browser.close()
