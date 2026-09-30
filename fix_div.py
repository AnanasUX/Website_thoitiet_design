with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
"""            <span>23:59</span>
          </div>
        </div>
      </div>
    </div>
    </div>

        {activeMarketTab === 'fx' && (""",
"""            <span>23:59</span>
          </div>
        </div>
      </div>
    </div>

        {activeMarketTab === 'fx' && ("""
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)