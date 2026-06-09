import os
import re

def find_missing_hooks(directory):
    missing_files = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx'):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        # Simple check: has t( but no useTranslation
                        if 't(' in content and 'useTranslation' not in content:
                            missing_files.append(path)
                except Exception as e:
                    print(f"Error reading {path}: {e}")
    return missing_files

if __name__ == "__main__":
    search_dir = r"d:\vaidiktalkAI\web-vaidik-main\src\app\(main)"
    missing = find_missing_hooks(search_dir)
    if missing:
        print("Files likely missing useTranslation hook:")
        for m in missing:
            print(m)
    else:
        print("No missing hooks found in simple audit.")
