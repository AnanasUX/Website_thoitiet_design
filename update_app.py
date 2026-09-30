import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Add selectedArticle state
app_state = "export default function App() {"
new_app_state = "export default function App() {\n  const [selectedArticle, setSelectedArticle] = useState<any>(null);"
content = content.replace(app_state, new_app_state)

# Render NewsDetailView
old_render = """        <div className="hidden xl:block w-full">
          <DesktopLayout activeCategory={activeCategory} setActiveCategory={setActiveCategory} condKey={condKey} liveData={liveData} liveNews={liveNews} isFetchingCategory={isFetchingCategory} isLoading={apiStatus === 'loading'} darkMode={darkMode} setDarkMode={setDarkMode} liveOverrides={liveOverrides} />
        </div>
      </div>
    </div>
  );
}"""

new_render = """        <div className="hidden xl:block w-full">
          <DesktopLayout activeCategory={activeCategory} setActiveCategory={setActiveCategory} condKey={condKey} liveData={liveData} liveNews={liveNews} isFetchingCategory={isFetchingCategory} isLoading={apiStatus === 'loading'} darkMode={darkMode} setDarkMode={setDarkMode} liveOverrides={liveOverrides} onArticleClick={setSelectedArticle} />
        </div>
      </div>

      {selectedArticle && (
        <NewsDetailView 
          article={selectedArticle} 
          allNews={liveNews ?? DEFAULT_NEWS_FEED} 
          onClose={() => setSelectedArticle(null)} 
          onSelectRelated={setSelectedArticle}
        />
      )}
    </div>
  );
}"""

content = content.replace(old_render, new_render)

# Update Mobile and Tablet layouts to pass onArticleClick
content = content.replace('liveOverrides={liveOverrides} />', 'liveOverrides={liveOverrides} onArticleClick={setSelectedArticle} />')

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("State and conditional rendering added.")