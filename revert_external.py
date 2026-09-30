import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Restore the a tag clicks to normal links
content = re.sub(
    r'href="#" onClick=\{\(e\) => \{ e\.preventDefault\(\); if \(onArticleClick\) onArticleClick\((item|featured)\); \}\}',
    r'href={\1.link ?? "#"} target={\1.link ? "_blank" : undefined} rel="noopener noreferrer"',
    content
)

# Remove NewsDetailView component invocation in App
render_block = """      {selectedArticle && (
        <NewsDetailView 
          article={selectedArticle} 
          allNews={liveNews ?? DEFAULT_NEWS_FEED} 
          onClose={closeArticle} 
          onSelectRelated={handleArticleSelect}
        />
      )}"""
content = content.replace(render_block, "")

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Reverted article clicks back to external links.")