import urllib.request
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

url = "https://morsall.com/test_root.php"
print(f"Requesting: {url}...")
try:
    req = urllib.request.Request(
        url, 
        headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    )
    # 10 second timeout
    with urllib.request.urlopen(req, timeout=10) as response:
        print(f"HTTP Status: {response.getcode()}")
        print(f"HTTP Body: {response.read().decode('utf-8')}")
except Exception as e:
    print(f"HTTP Request failed: {e}")
