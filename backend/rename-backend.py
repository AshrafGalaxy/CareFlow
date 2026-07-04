import os

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content.replace('provider', 'doctor').replace('Provider', 'Doctor')

    if content != new_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated: {filepath}")

def walk_and_replace(directory):
    for root, dirs, files in os.walk(directory):
        if '__pycache__' in dirs:
            dirs.remove('__pycache__')
        for file in files:
            if file.endswith('.py'):
                replace_in_file(os.path.join(root, file))

if __name__ == '__main__':
    walk_and_replace('C:/Users/Ashraf/Desktop/CareFlow/backend/app')
