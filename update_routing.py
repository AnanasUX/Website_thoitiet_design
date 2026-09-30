import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Modify handleArticleSelect to push state
handle_article_select = """  const handleArticleSelect = (article: any) => {
    setSelectedArticle(article);
    if (article) {
      const slug = toSlug(article.author);
      window.history.pushState({ articleSlug: slug }, '', `/Website_thoitiet_design/chi-tiet-${slug}`);
    }
  };

  const closeArticle = () => {
    setSelectedArticle(null);
    window.history.pushState({}, '', `/Website_thoitiet_design/`);
  };

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (!path.includes('/chi-tiet-')) {
        setSelectedArticle(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
"""

# Insert inside App() before the first useEffect
idx = content.find("export default function App() {\n  const [selectedArticle, setSelectedArticle] = useState<any>(null);")
if idx == -1:
    print("Could not find App definition.")
else:
    end_idx = idx + len("export default function App() {\n  const [selectedArticle, setSelectedArticle] = useState<any>(null);")
    content = content[:end_idx] + "\n" + handle_article_select + content[end_idx:]

# Replace setSelectedArticle with handleArticleSelect in props
content = content.replace('onArticleClick={setSelectedArticle}', 'onArticleClick={handleArticleSelect}')
content = content.replace('onClose={() => setSelectedArticle(null)}', 'onClose={closeArticle}')
content = content.replace('onSelectRelated={setSelectedArticle}', 'onSelectRelated={handleArticleSelect}')

# We need to also hook into the fetchMarket success to check if we should auto-open an article on load
hook_initial = """          setGoldData(finalGoldData);
          setChartData(prev => prev.real.length ? prev : generateDynamicData(chartBasePrice));
          setLoading(false);

          // Check if URL has a detail slug on initial load
          const path = window.location.pathname;
          if (path.includes('/chi-tiet-')) {
            const slug = path.split('/chi-tiet-')[1];
            const found = allMapped.find(a => toSlug(a.author) === slug);
            if (found) setSelectedArticle(found);
          }
"""

content = content.replace("          setGoldData(finalGoldData);\n          setChartData(prev => prev.real.length ? prev : generateDynamicData(chartBasePrice));\n          setLoading(false);", hook_initial)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Added URL routing logic.")