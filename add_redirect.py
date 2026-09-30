import re

with open("src/main.tsx", "r", encoding="utf-8") as f:
    content = f.read()

gh_redirect = """
// GitHub Pages SPA redirect handler
(function() {
  const redirect = sessionStorage.redirect;
  delete sessionStorage.redirect;
  if (redirect && redirect != location.href) {
    window.history.replaceState(null, '', redirect);
  }
})();
"""

if "sessionStorage.redirect" not in content:
    content = gh_redirect + "\n" + content
    with open("src/main.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Added GH Pages redirect handler.")