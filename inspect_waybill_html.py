import re
import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

def parse_html(filepath):
    print(f"\n=========================================\nInspecting: {filepath}\n=========================================")
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
    
    # Extract title
    title_match = re.search(r'<title>(.*?)</title>', html, re.IGNORECASE)
    print(f"Title: {title_match.group(1) if title_match else 'No Title'}")
    
    # Strip HTML tags to get clean text
    clean_text = re.sub(r'<[^>]+>', ' ', html)
    clean_text = "\n".join([line.strip() for line in clean_text.split('\n') if line.strip()])
    print("=== Texts found (First 40 lines) ===")
    print("\n".join(clean_text.split('\n')[:40]))
    
    # Extract images
    print("\n=== Images ===")
    images = re.findall(r'<img[^>]+src=["\'](.*?)["\']', html, re.IGNORECASE)
    for src in images[:10]:
        print(f"  src: {src}")
        
    # Extract tables
    tables = re.findall(r'<table', html, re.IGNORECASE)
    print(f"\n=== Tables found: {len(tables)} ===")

parse_html(r"D:\New-folder\matger2\olivery_waybill_a6.html")
parse_html(r"D:\New-folder\matger2\olivery_waybill_75x100.html")
