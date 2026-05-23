import ftplib

def find_node_modules_everywhere():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        
        # Check all folders in public_html for node_modules
        print(f"PWD: {ftp.pwd()}")
        ftp.cwd('/')
        print(f"Root contents: {ftp.nlst()}")
        
        # Check if there's a node_modules directly in public_html
        ftp.cwd('/public_html')
        all_items = ftp.mlsd()
        for name, facts in all_items:
            if name == 'node_modules':
                print("\n>>> node_modules FOUND directly in public_html! <<<")
                break
                
    except Exception as e:
        print(f"Error: {e}")

find_node_modules_everywhere()
