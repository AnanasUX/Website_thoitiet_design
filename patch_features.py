import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add sticky top-0 z-[100] to headers
content = content.replace(
    'className="bg-white border-b border-[#e3e7ef] flex h-[var(--header-height)] items-center justify-between px-[var(--page-padding)] w-full shrink-0"',
    'className="bg-white border-b border-[#e3e7ef] flex h-[var(--header-height)] items-center justify-between px-[var(--page-padding)] w-full shrink-0 sticky top-0 z-[100]"'
)
content = content.replace(
    'className="bg-white border-b border-[#e3e7ef] flex h-[var(--header-height)] items-center justify-between px-[var(--page-padding)] w-full shrink-0 max-w-[1200px] mx-auto"',
    'className="bg-white border-b border-[#e3e7ef] flex h-[var(--header-height)] items-center justify-between px-[var(--page-padding)] w-full shrink-0 max-w-[1200px] mx-auto sticky top-0 z-[100]"'
)

# 2. Add ScrollToTop component
scroll_to_top = """
function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const toggleVisibility = () => setIsVisible(window.scrollY > 300);
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);
  return isVisible ? (
    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-6 right-6 z-[100] bg-white border border-[#e3e7ef] shadow-[0_8px_20px_rgba(23,33,51,0.2)] hover:-translate-y-1 transition-all duration-300 rounded-full size-12 flex items-center justify-center text-[#ff315f] group animate-bounce hover:animate-none">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-y-1 transition-transform duration-300"><path d="M18 15l-6-6-6 6"/></svg>
    </button>
  ) : null;
}
"""

if "function ScrollToTop()" not in content:
    content = content.replace("export default function App() {", scroll_to_top + "\nexport default function App() {")

# 3. Mount ScrollToTop
if "<ScrollToTop />" not in content:
    content = content.replace(
        "      <InfiniteScrollTrigger onTrigger={fetchMoreNews} isLoading={isLoadingMore} hasMoreNews={hasMoreNews} />\n    </div>",
        "      <InfiniteScrollTrigger onTrigger={fetchMoreNews} isLoading={isLoadingMore} hasMoreNews={hasMoreNews} />\n      <ScrollToTop />\n    </div>"
    )

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")