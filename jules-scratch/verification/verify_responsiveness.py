from playwright.sync_api import sync_playwright
import time

def run():
    print("Starting Playwright script...")
    with sync_playwright() as p:
        print("Launching browser...")
        browser = p.chromium.launch()
        page = browser.new_page()

        print("Setting viewport to portrait...")
        page.set_viewport_size({"width": 390, "height": 844})
        print("Navigating to page...")
        page.goto("http://localhost:3000", wait_until="networkidle")
        print("Waiting for animations...")
        time.sleep(3)
        print("Taking portrait screenshot...")
        page.screenshot(path="/app/jules-scratch/verification/screenshot_portrait.png")
        print("Portrait screenshot taken.")

        print("Setting viewport to landscape...")
        page.set_viewport_size({"width": 844, "height": 390})
        print("Waiting for resize...")
        time.sleep(3)
        print("Taking landscape screenshot...")
        page.screenshot(path="/app/jules-scratch/verification/screenshot_landscape.png")
        print("Landscape screenshot taken.")

        print("Closing browser...")
        browser.close()
    print("Playwright script finished.")

if __name__ == "__main__":
    run()
