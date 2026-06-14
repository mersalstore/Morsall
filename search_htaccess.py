import os

def main():
    dir_path = "D:\\New-folder\\matger2"
    for file in os.listdir(dir_path):
        if file.startswith(".htaccess") or file.endswith(".htaccess") or "htaccess" in file.lower():
            file_path = os.path.join(dir_path, file)
            if os.path.isfile(file_path):
                try:
                    with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                        content = f.read()
                    if "3000" in content or "proxypass" in content.lower():
                        print(f"=== Found in: {file} ===")
                        print(content)
                        print("=======================\n")
                except Exception as e:
                    print(f"Error reading {file}: {e}")

if __name__ == "__main__":
    main()
