import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: "new",
  args: ["--no-sandbox", "--disable-gpu", "--window-size=1600,900"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1600, height: 900 });
await page.goto("http://localhost:8080/sign-in", { waitUntil: "networkidle2", timeout: 60000 });
await new Promise((r) => setTimeout(r, 5000));

const doorHtml = (side) => `
  <div class="royal-signin-portal-door royal-signin-portal-door--${side}">
    <div class="royal-signin-portal-door__panel">
      <div class="royal-signin-portal-door__arch-panel"></div>
      <div class="royal-signin-portal-door__emblem"></div>
      <div class="royal-signin-portal-door__studs"></div>
      <div class="royal-signin-portal-door__carving"></div>
    </div>
    <div class="royal-signin-portal-door__ring"></div>
  </div>`;

await page.evaluate((leftDoor, rightDoor) => {
  const opening = document.querySelector(".royal-signin-gateway__opening");
  const decree = document.querySelector(".royal-gate-decree");
  if (decree) decree.classList.add("is-dissolving");
  const doors = document.createElement("div");
  doors.className = "royal-signin-portal-doors is-revealed";
  doors.innerHTML = `${leftDoor}<div class="royal-signin-portal-door__seam"></div>${rightDoor}`;
  opening?.appendChild(doors);
}, doorHtml("left"), doorHtml("right"));

await new Promise((r) => setTimeout(r, 1200));
await page.screenshot({ path: "D:\\The-Royal-Passage\\.tmp-doors-closed.png" });

await page.evaluate(() => {
  document.querySelector(".royal-signin-portal-doors")?.classList.add("is-open");
});
await new Promise((r) => setTimeout(r, 900));
await page.screenshot({ path: "D:\\The-Royal-Passage\\.tmp-doors-opening.png" });
await new Promise((r) => setTimeout(r, 1500));
await page.screenshot({ path: "D:\\The-Royal-Passage\\.tmp-doors-open.png" });

await browser.close();
console.log("done");
