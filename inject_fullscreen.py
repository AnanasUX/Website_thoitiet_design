with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

target = """  const closeArticle = () => {
    setSelectedArticle(null);
    window.history.pushState({}, '', `/Website_thoitiet_design/`);
  };"""

replacement = """  const closeArticle = () => {
    setSelectedArticle(null);
    window.history.pushState({}, '', `/Website_thoitiet_design/`);
  };

  // Auto-fullscreen on first user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(err => console.log("Fullscreen request failed:", err));
      }
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
    
    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction, { passive: true });
    document.addEventListener('keydown', handleFirstInteraction);
    
    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);"""

content = content.replace(target, replacement)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Injected fullscreen hook.")