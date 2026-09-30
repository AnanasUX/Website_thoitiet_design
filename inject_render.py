with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

target = """      <InfiniteScrollTrigger onTrigger={fetchMoreNews} isLoading={isLoadingMore} hasMoreNews={hasMoreNews} />
      <ScrollToTop />
    </div>
  );
}"""

replacement = """      <InfiniteScrollTrigger onTrigger={fetchMoreNews} isLoading={isLoadingMore} hasMoreNews={hasMoreNews} />
      <ScrollToTop />

      {selectedArticle && (
        <NewsDetailView 
          article={selectedArticle} 
          allNews={liveNews} 
          onClose={closeArticle} 
          onSelectRelated={handleArticleSelect}
        />
      )}
    </div>
  );
}"""

content = content.replace(target, replacement)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Injected NewsDetailView renderer.")