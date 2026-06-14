import zlib
import re

filepath = r"C:\Users\hazem\.gemini\antigravity\brain\bc573419-c267-49c2-bcd4-c72cafca7aa7\olivery_waybill_a6.pdf"

with open(filepath, 'rb') as f:
    content = f.read()

# Find all streams in the PDF
# Streams in PDF look like:
# 5 0 obj
# << ... >>
# stream
# [binary data]
# endstream

streams = []
idx = 0
while True:
    idx = content.find(b'stream\r\n', idx)
    if idx == -1:
        idx = content.find(b'stream\n', idx)
    if idx == -1:
        break
    
    # Start of stream data is after the stream keyword and newline
    start_data = idx + (8 if content[idx:idx+8].startswith(b'stream\r\n') else 7)
    
    end_stream = content.find(b'endstream', start_data)
    if end_stream != -1:
        stream_data = content[start_data:end_stream].strip()
        streams.append(stream_data)
        idx = end_stream + 9
    else:
        idx += 6

print(f"Found {len(streams)} streams in the PDF.")

# Decompress and print text
for i, stream in enumerate(streams, 1):
    try:
        decompressed = zlib.decompress(stream, -15)
        print(f"\n--- Stream {i} (Length: {len(decompressed)}) ---")
        
        # Let's search for text operators. Text inside PDF streams is drawn using Tj or TJ operators,
        # and looks like: (text) Tj or [(text1) 123 (text2)] TJ
        # We can search for parentheses.
        # Since it might be custom encoded, let's look for characters and decode them using our map
        # or print the raw Tj/TJ operators.
        
        lines = decompressed.split(b'\n')
        text_lines = []
        for line in lines:
            if b'Tj' in line or b'TJ' in line or b'BT' in line or b'ET' in line:
                text_lines.append(line.decode('utf-8', errors='replace').strip())
        
        print("\n".join(text_lines[:50])) # Print first 50 lines of text drawing operators
    except Exception as e:
        print(f"Stream {i} failed to decompress or parse: {e}")
