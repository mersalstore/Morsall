import urllib.request
import ssl
import time

def main():
    url = "https://morsall.com/health?nocache=2&t=1748721385"
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    print("Sending request to trigger Passenger Node start...")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, context=ctx) as response:
            print("Status:", response.status)
            print("Headers:")
            for k, v in response.getheaders():
                print(f"  {k}: {v}")
            print("Body:", response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        print("Status:", e.code)
        print("Headers:")
        for k, v in e.headers.items():
            print(f"  {k}: {v}")
        try:
            print("Body:", e.read().decode('utf-8'))
        except Exception:
            pass
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    main()
