import zipfile

with zipfile.ZipFile('fixes2.zip', 'r') as zip_ref:
    for f in zip_ref.namelist()[:10]:
        print(f)
