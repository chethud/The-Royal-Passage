import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: "new",
  args: ["--no-sandbox", "--disable-gpu", "--window-size=1600,900"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1600, height: 900 });
page.on("console", (m) => console.log("[console]", m.type(), m.text()));
page.on("pageerror", (e) => console.log("[pageerror]", e.message));
await page.goto("http://localhost:8080/sign-in", { waitUntil: "networkidle2", timeout: 60000 });
await new Promise((r) => setTimeout(r, 6000));

const info = await page.evaluate(() => {
  const btn = document.querySelector(".royal-gate-decree__submit");
  const pillar = document.querySelector(".royal-pillar--left");
  const arch = document.querySelector(".royal-signin-gateway__arch");
  const cs = btn ? getComputedStyle(btn) : null;
  return {
    btnFound: !!btn,
    btnRadius: cs?.borderRadius,
    btnWidth: cs?.width,
    pillarFound: !!pillar,
    pillarWidth: pillar ? getComputedStyle(pillar).width : null,
    archFound: !!arch,
    stylesheets: [...document.styleSheets].map((s) => s.href || "inline").slice(0, 10),
    phase: document.querySelector(".royal-signin-page")?.dataset.phase,
  };
});
console.log(JSON.stringify(info, null, 2));

await page.screenshot({ path: "D:\\The-Royal-Passage\\.tmp-signin2.png" });
await browser.close();
