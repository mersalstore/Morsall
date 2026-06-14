from selenium import webdriver
from selenium.webdriver.edge.options import Options

edge_options = Options()
edge_options.add_argument("--headless")
edge_options.add_argument("--no-sandbox")
edge_options.add_argument("--disable-dev-shm-usage")

try:
    driver = webdriver.Edge(options=edge_options)
    print("Success: Edge WebDriver initialized successfully!")
    driver.get("https://far-mile.olivery.io/web/login")
    print(f"Page title: {driver.title}")
    driver.quit()
except Exception as e:
    print(f"Error initializing Edge WebDriver: {e}")
