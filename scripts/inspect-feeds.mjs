import fs from 'fs';

const content = fs.readFileSync('src/App.tsx', 'utf8');
const match = content.match(/export const RSS_FEEDS_DB = \[([\s\S]*?)\];/);
if (!match) {
  console.error("Could not find RSS_FEEDS_DB");
  process.exit(1);
}

const list = eval('[' + match[1] + ']');
console.log(`Checking ${list.length} RSS feeds...`);

async function fetchFeed(feed) {
  // Try worker proxy
  const pUrl = `https://new-bot.mrkun28.workers.dev/?url=${encodeURIComponent(feed.url)}`;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(pUrl, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return { name: feed.name, url: feed.url, error: `HTTP ${res.status}` };
    const data = await res.json();
    if (!data || !data.contents) return { name: feed.name, url: feed.url, error: 'Empty contents' };
    
    const xml = data.contents;
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let m;
    while ((m = itemRegex.exec(xml)) !== null) {
      const itemXml = m[1];
      const titleMatch = itemXml.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
      const linkMatch = itemXml.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);
      const pubDateMatch = itemXml.match(/<pubDate>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/pubDate>/i);
      const title = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : '';
      const link = linkMatch ? linkMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : '';
      const pubDate = pubDateMatch ? pubDateMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : '';
      if (title) {
        items.push({ title, link, pubDate, parsedTime: pubDate ? new Date(pubDate).getTime() : 0 });
      }
    }
    
    if (items.length === 0) return { name: feed.name, url: feed.url, error: 'No items parsed' };
    
    items.sort((a, b) => b.parsedTime - a.parsedTime);
    const newest = items[0];
    const oldest = items[items.length - 1];
    
    return {
      name: feed.name,
      category: feed.category,
      url: feed.url,
      count: items.length,
      newestDate: newest.pubDate,
      newestTime: newest.parsedTime,
      newestTitle: newest.title.slice(0, 50),
      oldestDate: oldest.pubDate
    };
  } catch (err) {
    return { name: feed.name, url: feed.url, error: err.message };
  }
}

// Check in chunks of 5
const results = [];
for (let i = 0; i < list.length; i += 8) {
  const chunk = list.slice(i, i + 8);
  const chunkRes = await Promise.all(chunk.map(fetchFeed));
  results.push(...chunkRes);
  process.stdout.write(`Processed ${results.length}/${list.length}...\r`);
}
console.log('\nFinished checking.');

const now = Date.now();
const oneDayMs = 24 * 60 * 60 * 1000;
const sevenDaysMs = 7 * oneDayMs;
const thirtyDaysMs = 30 * oneDayMs;

const errors = results.filter(r => r.error);
const veryOld = results.filter(r => !r.error && r.newestTime && (now - r.newestTime > sevenDaysMs));
const invalidDates = results.filter(r => !r.error && (!r.newestTime || isNaN(r.newestTime)));
const good = results.filter(r => !r.error && r.newestTime && (now - r.newestTime <= sevenDaysMs));

console.log(`\n=== SUMMARY ===`);
console.log(`Total feeds: ${results.length}`);
console.log(`Active & fresh (<= 7 days): ${good.length}`);
console.log(`Very old feeds (> 7 days): ${veryOld.length}`);
console.log(`Invalid date formats: ${invalidDates.length}`);
console.log(`Errors / Unreachable: ${errors.length}`);

if (veryOld.length > 0) {
  console.log(`\n--- VERY OLD FEEDS ---`);
  veryOld.forEach(f => {
    const daysAgo = Math.round((now - f.newestTime) / oneDayMs);
    console.log(`[${f.category}] ${f.name} - ${daysAgo} days ago (${f.newestDate}) | URL: ${f.url}`);
  });
}

if (invalidDates.length > 0) {
  console.log(`\n--- INVALID DATE FORMATS ---`);
  invalidDates.forEach(f => {
    console.log(`[${f.category}] ${f.name} - Raw date: "${f.newestDate}" | URL: ${f.url}`);
  });
}

if (errors.length > 0) {
  console.log(`\n--- ERRORS ---`);
  errors.forEach(f => {
    console.log(`[${f.name}] Error: ${f.error} | URL: ${f.url}`);
  });
}
