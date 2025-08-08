from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("http://localhost:3000")
        time.sleep(5)
        page.screenshot(path="/app/jules-scratch/verification/screenshot.png")
        browser.close()

run()
