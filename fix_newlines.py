import re

file_path = r"c:\Users\pooja\OneDrive\Desktop\AI-Awareness\frontend\src\pages\AwarenessHub.tsx"
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

def replace_newlines(match):
    fixed = match.group(0).replace('\n', '\\n')
    return fixed

content = re.sub(r'detail: "([^"]+)"', replace_newlines, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed newlines in string literals.")
