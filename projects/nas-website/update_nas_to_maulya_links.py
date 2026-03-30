import os

directory = '/Users/sriramrk/NotAloneStudios/projects/nas-website'
extensions = ['.html', '.css', '.js', '.md', '.txt']
exclude_dirs = ['.git', 'node_modules', '.gemini', 'public_hostinger', 'public_clean', 'extracted-public-clean']

replacements = {
    'https://maulya.in/product/': '/products/maulya/',
    'https://maulya.in/product': '/products/maulya/',
}

for root, dirs, files in os.walk(directory):
    dirs[:] = [d for d in dirs if d not in exclude_dirs]
    for file in files:
        if any(file.endswith(ext) for ext in extensions):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()

                modified = False
                for old, new in replacements.items():
                    if old in content:
                        content = content.replace(old, new)
                        modified = True
                
                if modified:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Updated NAS links in: {filepath}")
            except Exception as e:
                print(f"Could not process {filepath}: {e}")
