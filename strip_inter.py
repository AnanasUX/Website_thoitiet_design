import re

def strip_inter(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Matches font-['Inter:Regular'], font-['Inter:Semi_Bold'], etc.
    new_content = re.sub(r'font-\[\'Inter:[^\']+\'\]\s*', '', content)
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(new_content)
    print(f"Stripped Inter from {filepath}")

strip_inter("src/App.tsx")
strip_inter("src/components/WeatherSection.tsx")