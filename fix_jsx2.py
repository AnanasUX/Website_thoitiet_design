import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Let's find exactly the span 23:59 and the end of MarketSection
match = re.search(r'(<span>23:59</span>\s*</div>\s*</div>\s*</div>\s*</div>\s*</div>).*?{activeMarketTab === \'fx\'', content, re.DOTALL)
if match:
    # the exact end of gold tab should be:
    # <span>23:59</span>
    # </div> (closes time labels)
    # </div> (closes the absolute overlay or relative container)
    # </div> (closes chart wrapper)
    # </div> (closes the new gold tab wrapper)
    
    # Then fx tab, petrol tab, then final Root wrapper closing </div>
    
    correct_end = """<span>23:59</span>
            </div>
          </div>
        </div>
      </div>

      {activeMarketTab === 'fx' && ("""
      
    content = content.replace(match.group(0), correct_end + match.group(0)[len(match.group(1)):])
    
    # Also I need to make sure the final Root wrapper is closed at the very end of Petrol tab!
    # Let's check how Petrol tab is closed:
    #         )}
    #       </div>
    #     );
    # Actually, it should be:
    #         )}
    #       </div>
    #     );
    # which is 1 closing div for petrol tab, but we need another </div> for the ROOT wrapper!
    
    petrol_end = """          </div>
        )}
      </div>
    );"""
    
    content = re.sub(r'          </div>\s*\)\}\s*</div>\s*\);\s*}', """          </div>
        )}
      </div>
    );
}""", content)
    
    with open("src/App.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Fixed JSX correctly")
else:
    print("Could not find the match block")