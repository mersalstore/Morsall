import os
import glob

# Search specific directories
search_dirs = [
    r"C:\Users\hazem\Downloads",
    r"C:\Users\hazem\AppData\Local",
    r"D:\New-folder\matger2"
]
patterns = ["**/chromedriver.exe", "**/msedgedriver.exe"]

print("Searching for drivers...")
for s_dir in search_dirs:
    for pattern in patterns:
        path = os.path.join(s_dir, pattern)
        for filepath in glob.glob(path, recursive=True):
            print(f"Found: {filepath}")
print("Search finished.")
