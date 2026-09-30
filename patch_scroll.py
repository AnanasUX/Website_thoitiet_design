import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_trigger = """function InfiniteScrollTrigger({ onTrigger, isLoading }: { onTrigger: () => void, isLoading: boolean }) {
  const targetRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !isLoading) {
        onTrigger();
      }
    }, { rootMargin: '150px' });
    if (targetRef.current) observer.observe(targetRef.current);
    return () => observer.disconnect();
  }, [onTrigger, isLoading]);"""

new_trigger = """function InfiniteScrollTrigger({ onTrigger, isLoading }: { onTrigger: () => void, isLoading: boolean }) {
  const targetRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // 1. Intersection Observer
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !isLoading) {
        onTrigger();
      }
    }, { rootMargin: '150px' });
    if (targetRef.current) observer.observe(targetRef.current);
    
    // 2. Backup scroll event
    const handleScroll = () => {
      if (!targetRef.current || isLoading) return;
      const rect = targetRef.current.getBoundingClientRect();
      // If the top of the trigger element is within 500px of the bottom of the viewport
      if (rect.top <= window.innerHeight + 500) {
        onTrigger();
      }
    };
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('touchmove', handleScroll);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchmove', handleScroll);
    };
  }, [onTrigger, isLoading]);"""

content = content.replace(old_trigger, new_trigger)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")