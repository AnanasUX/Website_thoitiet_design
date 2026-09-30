import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

fullscreen_hook = """  // Force Fullscreen on first user interaction (browser security requires a gesture)
  useEffect(() => {
    const enterFullscreen = () => {
      const elem = document.documentElement as any;
      if (!document.fullscreenElement) {
        try {
          if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(() => {});
          } else if (elem.webkitRequestFullscreen) { /* Safari */
            elem.webkitRequestFullscreen();
          } else if (elem.msRequestFullscreen) { /* IE11 */
            elem.msRequestFullscreen();
          }
        } catch (e) {
          console.warn("Fullscreen request failed", e);
        }
      }
    };

    const handleInteraction = () => {
      enterFullscreen();
      // Remove listeners after first successful attempt
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

"""

# Insert right before "useEffect(() => {" inside App
idx = content.find("export default function App() {")
idx2 = content.find("useEffect(() => {", idx)

content = content[:idx2] + fullscreen_hook + content[idx2:]

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Added fullscreen hook.")