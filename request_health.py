import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

try:
    url = "https://morsall.com/health.php"
    print(f"Requesting {url}...")
    req = urllib.request.urlopen(url, context=ctx)
    print("STATUS:", req.status)
    print("CONTENT:", req.read().decode('utf-8')[:500])
except Exception as e:
    print("Error:", e)
