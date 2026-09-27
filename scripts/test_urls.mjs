const API = process.env.API || "https://mediasaver-57yu.onrender.com";
// const API =  "http://localhost:3001";

const URLS = [
  ["YouTube  watch", "https://www.youtube.com/watch?v=rkKZIMPecRA"],
  ["YouTube  shorts", "https://www.youtube.com/shorts/WSW3uKxuWHE"],
  ["YouTube  short-url", "https://youtu.be/dQw4w9WgXcQ"],
  ["YouTube  live","https://www.youtube.com/live/vlt4EaFB5cw?si=famaPkJ8nz0cpD33",],
  ["Instagram reel", "https://www.instagram.com/reel/DbtcKgcvuZm/"],
  ["Pinterest pin", "https://in.pinterest.com/pin/872361390329846020/"],
  ["Pinterest short", "https://pin.it/1T40N6LKS"],
  ["Twitter  status","https://x.com/JatinTweets_/status/2099798797933215801?s=20",],
  ["Facebook videos","https://www.facebook.com/61550668607841/videos/1581834693624239/?__so__=discover&__rv__=video_home_www_loe_popular_videos",],
  ["Facebook reel", "https://www.facebook.com/reel/1409569064701479"],
  ["Facebook share", "https://www.facebook.com/share/v/1BcwKzyipF/"],
  ["LinkedIn short", "https://lnkd.in/p/dFa85g9f"],
  ["LinkedIn feed","https://www.linkedin.com/feed/update/urn:li:activity:7355582191143157760/",],
  ["Snapchat spotlight","https://www.snapchat.com/@duplex_2007/spotlight/W7_EDlXWTBiXAEEniNoMPwAAYZWF4c3hzaGpiAaAvpLpWAaAvpLo9AAAAAQ",],
  ["Reddit   share", "https://www.reddit.com/r/videos/s/ETA70n1ZU2"],
  ["Reddit   shorts", "https://www.reddit.com/r/funnyvideos/s/reJJ7ANIN4"],
  ["Threads  post", "https://www.threads.com/@meta/post/DdRnPEPErua"],
  ["Vimeo video1", "https://vimeo.com/1226433979?autoplay=1&muted=1&stream_id=ZmVhdHVyZWR8fGlkOmRlc2N8eyJyZW1vdmVfdm9kX3RpdGxlcyI6ZmFsc2V9"],
  ["Vimeo video2", "https://vimeo.com/1225708698?share=copy&fl=cl&fe=ci"],
  ["Vimeo video3", "https://vimeo.com/1225041540"],
  ["Dailymotion", "https://www.dailymotion.com/video/x9no4f2"],
  ["Twitch Video1", "https://m.twitch.tv/twitch/clip/RespectfulFastWaterMau5-5MHfVlPos9CR7tr9"],
  ["Twitch Video2 ", "https://www.twitch.tv/twitch/clip/RespectfulFastWaterMau5-5MHfVlPos9CR7tr9?tt_content=clip&tt_medium=mobile_web_share"],
  ["Spotify Song", "https://open.spotify.com/track/59GU2OeltZirxzBLa7m5GC"],
  ["Spotify Playlist", "https://open.spotify.com/playlist/37i9dQZF1E4CZ5fGT71Kyo?si=3kUsc6RsRuS5W5Y9_STnvQ&utm_source=copy-link&pi=jLX9gVqwSWeH2"],
  ["Apple song", "https://music.apple.com/us/song/agua/6810372461"],
  ["Apple album", "https://music.apple.com/us/album/agua/6810372456?i=6810372461"],
  ["Youtube music song", "https://music.youtube.com/watch?v=GX9x62kFsVU"],
  ["Youtube music playlist", "https://music.youtube.com/playlist?list=RDCLAK5uy_krbBs7P2iEb30IODyVbiOXWyhZtAIX9Uk&playnext=1&si=XNjQcRQz-ZVcbhUl"],
  ["SoundCloud music", "https://on.soundcloud.com/vnlfzOZLvO2qSeY7xJ"],
  ["SoundCloud music2", "https://soundcloud.com/bloodyhound-q50/my-girl?utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing"],
  

];

async function test(name, url) {
  const t = Date.now();
  try {
    const res = await fetch(`${API}/api/info`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const d = await res.json().catch(() => ({}));
    return {
      Case: name,
      Result: res.ok ? "PASS" : `FAIL ${res.status}`,
      Time: `${Date.now() - t}ms`,
      Info: (res.ok ? d.title : d.message || "-").slice(0, 40),
      Formats: d.formats?.length ?? 0,
    };
  } catch (e) {
    return {
      Case: name,
      Result: "ERROR",
      Time: `${Date.now() - t}ms`,
      Info: e.message.slice(0, 40),
      Formats: 0,
    };
  }
}

async function runPool(items, limit, fn) {
  const results = new Array(items.length);
  let currentIndex = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (currentIndex < items.length) {
      const idx = currentIndex++;
      const res = await fn(items[idx], idx);
      results[idx] = res;
      console.log(`[${idx + 1}/${items.length}] ${res.Case.padEnd(22)}: ${res.Result} (${res.Time}) - ${res.Info}`);
    }
  });
  await Promise.all(workers);
  return results;
}

console.log(`Testing ${URLS.length} URLs against ${API} with concurrency 3...\n`);
const results = await runPool(URLS, 3, ([n, u]) => test(n, u));

console.log("\nSummary Table:");
console.table(results);
console.log(
  `\n${results.filter((r) => r.Result === "PASS").length}/${results.length} passed`,
);

const failed = results.filter((r) => r.Result !== "PASS");
if (failed.length) {
  console.log("Failing cases:", failed.map((r) => `${r.Case} (${r.Result}: ${r.Info})`).join("\n  "));
}
