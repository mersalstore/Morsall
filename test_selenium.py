import sys
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

print("Selenium version:")
import selenium
print(selenium.__version__)

chrome_options = Options()
chrome_options.add_argument("--headless")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")

try:
    driver = webdriver.Chrome(options=chrome_options)
    print("Success: WebDriver initialized successfully!")
    driver.quit()
except Exception as e:
    print(f"Error initializing WebDriver: {e}")
