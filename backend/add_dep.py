import os

file_path = 'requirements.txt'

def read_file(path, encoding):
    with open(path, 'r', encoding=encoding) as f:
        return f.read()

content = None
encoding = 'utf-16'

try:
    content = read_file(file_path, encoding)
except Exception:
    encoding = 'utf-8'
    try:
        content = read_file(file_path, encoding)
    except Exception as e:
        print(f"Error reading file: {e}")
        exit(1)

if 'beautifulsoup4' not in content:
    try:
        with open(file_path, 'a', encoding=encoding) as f:
            f.write('\nbeautifulsoup4\n')
        print("Added beautifulsoup4")
    except Exception as e:
        print(f"Error writing file: {e}")
        exit(1)
else:
    print("beautifulsoup4 already present")
