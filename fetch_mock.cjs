const fs = require("fs");

async function run() {
  const url = "https://thanhnien.vn/ly-do-hai-thanh-pho-viet-nam-vao-top-10-diem-den-cua-khach-o-dai-ngay-185260930075328455.htm";
  const res = await fetch(url);
  const html = await res.text();
  
  const mockData = {
    contents: html
  };
  
  fs.writeFileSync("public/mock-thanhnien.json", JSON.stringify(mockData));
  console.log("Mock data saved.");
}
run();