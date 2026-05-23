import json
import sys

def parse_requirements():
    sys.stdout.reconfigure(encoding='utf-8')
    try:
        with open('Vixcell_Full_Logistics_And_Store_Requirements.md', 'r', encoding='utf-8') as f:
            content = f.read()
            
        print("File length:", len(content))
        
        # Let's inspect if it's a JSON or contains JSON blocks
        # Let's print out the first 500 characters
        print("First 500 chars:")
        print(content[:500])
        
        # Let's check if there's any JSON in it
        # Let's look for JSON array/object patterns
        if content.strip().startswith('['):
            print("Detected JSON array!")
        elif content.strip().startswith('{'):
            print("Detected JSON object!")
        else:
            # Let's find any occurrences of json strings
            print("Scanning for text...")
            
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    parse_requirements()
