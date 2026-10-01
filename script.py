import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'<a\s*(key=\{.*?\})?\s*href=\{([a-zA-Z0-9_]+)\.link \?\? "#"\} target=\{.*?\? "_blank" : undefined\} rel="noopener noreferrer"(.*?)>'
def repl(m):
    key_str = m.group(1) + ' ' if m.group(1) else ''
    return f'<div {key_str}onClick={{() => onArticleClick && onArticleClick({m.group(2)})}} {m.group(3)}>'

content = re.sub(pattern, repl, content, flags=re.DOTALL)

# Because we replaced <a with <div, we need to replace </a> with </div>
# The </a> is always at the end of the block.
# We will do a generic replacement for </a> in the file but only if it's a card.
# Wait, let's just replace all </a> with </div> in the news rendering section.
content = content.replace('</a>', '</div>')

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
