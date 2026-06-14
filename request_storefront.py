import urllib.request
import urllib.error
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

try:
    url = "https://morsall.com/"
    print(f"Requesting {url}...")
    req = urllib.request.Request(
        url, 
        headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
    )
    res = urllib.request.urlopen(req, context=ctx)
    print("STATUS:", res.status)
    print("CONTENT:", res.read().decode('utf-8')[:500])
except urllib.error.HTTPError as e:
    print("HTTP Error Code:", e.code)
    try:
        error_html = e.read().decode('utf-8', errors='ignore')
        print("ERROR HTML (first 1000 chars):")
        print(error_html[:1000])
    except Exception as read_err:
        print("Could not read error body:", read_err)
except Exception as e:
    print("Other Error:", e)
