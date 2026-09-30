import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace featured.link <a> tags
content = re.sub(
    r'href=\{featured\.link \?\? "#"\}\s*target=\{featured\.link \? "_blank" : undefined\}\s*rel="noopener noreferrer"\s*className="([^"]+)"',
    r'href="#" onClick={(e) => { e.preventDefault(); if (onArticleClick) onArticleClick(featured); }} className="\1 cursor-pointer"',
    content
)

# Replace weatherNews link in WeatherSection just in case they clicked that one too, but WeatherSection doesn't have `onArticleClick` passed to it right now.
# Wait, I won't touch weatherNews unless I pass onArticleClick down. The user likely clicked the big featured news card.

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Replaced featured links.")