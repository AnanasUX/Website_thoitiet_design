const https = require("https");
https.get("https://html.duckduckgo.com/html/?q=gia+vang+phu+quy", (res) => {
  let data = "";
  res.on("data", chunk => data += chunk);
  res.on("end", () => {
    const regex = /href="([^"]+phuquy[^"]+)"/gi;
    let match;
    while(match = regex.exec(data)) {
      console.log(match[1]);
    }
  });
});