import "./style.css";
import {
  fresh,
  decode,
  advance,
  gather,
  buyTender,
  buyImprovement,
  rekindle,
  emberReward,
  rate,
  tapValue,
  tenderCost,
  format,
  TENDERS,
  IMPROVEMENTS,
  KEEPSAKES,
} from "./economy.ts";
const KEY = "lantern-orchard-v1";
let state = fresh(),
  saveMessage = "Your orchard saves automatically.",
  loaded = false;
try {
  const raw = localStorage.getItem(KEY);
  if (raw) {
    const restored = decode(raw, Date.now());
    if (restored) {
      const old = JSON.parse(raw);
      state = restored;
      loaded = true;
      const gain = state.glow - old.glow;
      saveMessage =
        gain > 0
          ? `Welcome back. Your tenders gathered ${format(gain)} glow (up to 4 hours).`
          : "Welcome back to your orchard.";
    } else
      saveMessage =
        "The saved orchard was unreadable. A fresh season has begun.";
  }
} catch {
  saveMessage =
    "Browser storage is unavailable. Keep this tab open to retain progress.";
}
const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `
<header><a class="wordmark" href="#">✳ <span>LANTERN ORCHARD</span></a><div class="header-note">A little light goes a long way.</div><button id="save" class="quiet">Save orchard</button></header>
<main><section class="orchard panel" aria-labelledby="title"><div class="eyebrow">AN IDLE GARDEN OF SMALL WONDERS</div><h1 id="title">Grow something<br><em>brilliant.</em></h1><p class="intro">Gather a spark. Give it a home.<br>Let the night do the rest.</p>
<div class="balance"><strong id="glow">0</strong><span>glow in your basket</span></div><div class="metrics"><span><b id="rate">0</b> / second</span><span><b id="tap">1</b> / tap</span></div>
<div class="scene"><div class="moon"></div><div class="stars">·　✦　　·　　✧　·</div><div class="hill hill-back"></div><div class="hill"></div><div class="trees" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div class="orbit" aria-hidden="true"></div><button id="gather" aria-label="Gather glow" class="lantern"><svg viewBox="0 0 180 240" aria-hidden="true"><defs><linearGradient id="light" x2="0" y2="1"><stop stop-color="#ffe5a4"/><stop offset="1" stop-color="#e5a947"/></linearGradient></defs><path d="M66 45V29Q90 3 114 29V45" fill="none" stroke="#b1c4b7" stroke-width="7"/><path d="M45 58L57 42H123L135 58L128 72H52Z" fill="#b2c8b7"/><path d="M52 72Q30 124 53 181H127Q150 124 128 72Z" fill="url(#light)"/><path d="M70 73Q53 126 72 180M110 73Q127 126 108 180M90 73V180" fill="none" stroke="#956238" stroke-width="3" opacity=".45"/><path d="M50 181H130L139 194H41Z" fill="#92ae9c"/><path d="M66 194H114L109 205H71Z" fill="#456759"/><path d="M90 205V225M82 222L90 234L98 222" stroke="#e5b557" stroke-width="3" fill="none"/></svg></button><div id="particles" aria-hidden="true"></div><div class="scene-caption">TAP THE LANTERN TO GATHER</div></div>
<div class="season-strip"><span>SEASON <b id="season">01</b></span><span id="grove-note">An empty orchard. A beautiful beginning.</span></div></section>
<section class="workshop" aria-label="Orchard workshop"><div class="section-title"><div><span class="eyebrow">LET IT GROW</span><h2>The night shift</h2></div><span class="pill" id="tender-total">0 tenders</span></div><p class="subtext">A few quiet helpers, gathering while you dream.</p><div id="tenders" class="tenders"></div><div class="section-title upgrades-title"><div><span class="eyebrow">MAKE LIGHT WORK</span><h2>Bright ideas</h2></div></div><div id="improvements" class="improvements"></div></section>
<section class="memory panel"><div><span class="eyebrow">LIGHT REMEMBERS</span><h2>A new season, a brighter start.</h2><p>Rekindle your orchard to keep embers. Each ember adds <b>10%</b> to every tap and tender, forever.</p><div class="ember-stats"><span><b id="embers">0</b> embers kept</span><span><b id="bonus">+0%</b> gathering</span></div></div><div class="rekindle-box"><p id="prestige-progress"></p><progress id="progress" max="5000" value="0" aria-label="Progress toward rekindling"></progress><button id="rekindle" class="primary">Rekindle season</button><small>Preview the exchange before deciding.</small></div></section>
<section class="keepsake-section"><div class="section-title"><div><span class="eyebrow">LITTLE MILESTONES</span><h2>The keepsake shelf</h2></div><span id="achievement-count" class="pill"></span></div><div id="keepsakes" class="keepsakes"></div></section>
<footer><p id="status" role="status">${saveMessage}</p><p>Made for slow evenings. Offline growth is capped at 4 hours.<br><span id="lifetime"></span> · Saved on this browser only.</p></footer></main>
<dialog id="confirm"><form method="dialog"><span class="eyebrow">EVERY END IS A BEGINNING</span><h2>Let this light become memory?</h2><p id="exchange"></p><p>Your glow, tenders and improvements reset. Your embers, lifetime glow and keepsakes stay.</p><div class="dialog-actions"><button value="cancel" class="quiet">Keep growing</button><button id="confirm-rekindle" value="confirm" class="primary">Rekindle now</button></div></form></dialog>`;
const el = <T extends HTMLElement = HTMLElement>(id: string) =>
  document.getElementById(id) as T;
const text = (id: string, value: string) => {
  el(id).textContent = value;
};
TENDERS.forEach((t, i) => {
  const button = document.createElement("button");
  button.className = "tender";
  button.innerHTML = `<span class="tender-icon">${t.icon}</span><span class="tender-copy"><strong>${t.name}</strong><small>${t.story}</small><span class="yield"></span></span><span class="purchase"><b class="owned"></b><span class="cost"></span></span>`;
  button.onclick = () => {
    advance(state, Date.now());
    if (buyTender(state, i)) {
      notify(`${t.name} joined the night shift.`);
      save(false);
      render();
    }
  };
  el("tenders").append(button);
});
IMPROVEMENTS.forEach((u, i) => {
  const button = document.createElement("button");
  button.className = "improvement";
  button.innerHTML = `<span class="idea-icon">✧</span><strong>${u.name}</strong><small>${u.description}</small><b></b>`;
  button.onclick = () => {
    advance(state, Date.now());
    if (buyImprovement(state, i)) {
      notify(`${u.name}: ${u.description}`);
      save(false);
      render();
    }
  };
  el("improvements").append(button);
});
KEEPSAKES.forEach((k) => {
  const item = document.createElement("div");
  item.className = "keepsake";
  item.innerHTML = `<span>✺</span><div><strong>${k.name}</strong><small>${k.hint}</small></div>`;
  el("keepsakes").append(item);
});
function notify(message: string) {
  text("status", message);
}
function save(announce = true) {
  advance(state, Date.now());
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    if (announce)
      notify("Orchard saved. Your light will be here when you return.");
  } catch {
    notify(
      "Could not save: browser storage is full or unavailable. Progress remains in this tab.",
    );
  }
}
function render() {
  text("glow", format(state.glow));
  text("rate", format(rate(state)));
  text("tap", format(tapValue(state)));
  text("season", String(state.seasons + 1).padStart(2, "0"));
  const total = state.tenders.reduce((a, b) => a + b, 0);
  text("tender-total", `${total} tenders`);
  text(
    "grove-note",
    total === 0
      ? "An empty orchard. A beautiful beginning."
      : total < 10
        ? "Little lights are finding their home."
        : "The orchard hums with possibility.",
  );
  [...el("tenders").children].forEach((item, i) => {
    const b = item as HTMLButtonElement;
    const cost = tenderCost(state, i);
    b.disabled = state.glow < cost;
    b.querySelector(".owned")!.textContent = `${state.tenders[i]} owned`;
    b.querySelector(".cost")!.textContent = `${format(cost)} glow`;
    b.querySelector(".yield")!.textContent =
      `${format(TENDERS[i].rate * rateMultiplier())} glow / sec each`;
  });
  [...el("improvements").children].forEach((item, i) => {
    const b = item as HTMLButtonElement;
    b.disabled = state.improvements[i] || state.glow < IMPROVEMENTS[i].cost;
    b.classList.toggle("purchased", state.improvements[i]);
    b.querySelector("b")!.textContent = state.improvements[i]
      ? "✓ Woven in"
      : `${format(IMPROVEMENTS[i].cost)} glow`;
  });
  [...el("keepsakes").children].forEach((item, i) =>
    item.classList.toggle(
      "unlocked",
      state.keepsakes.includes(KEEPSAKES[i].id),
    ),
  );
  text("achievement-count", `${state.keepsakes.length} / ${KEEPSAKES.length}`);
  text("embers", format(state.embers));
  text("bonus", `+${format(state.embers * 10)}%`);
  text("lifetime", `${format(state.lifetime)} lifetime glow`);
  const reward = emberReward(state);
  text(
    "prestige-progress",
    reward > 0
      ? `Ready to keep ${format(reward)} new ember${reward === 1 ? "" : "s"}.`
      : `${format(state.run)} / 5,000 season glow`,
  );
  el<HTMLProgressElement>("progress").value = Math.min(5000, state.run);
  el<HTMLButtonElement>("rekindle").disabled = reward < 1;
}
function rateMultiplier() {
  return (
    IMPROVEMENTS.reduce(
      (n, u, i) => (state.improvements[i] ? n * u.production : n),
      1,
    ) *
    (1 + state.embers * 0.1)
  );
}
el("gather").onclick = () => {
  advance(state, Date.now());
  const amount = tapValue(state);
  gather(state);
  const particle = document.createElement("span");
  particle.className = "spark";
  particle.textContent = `+${format(amount)}`;
  particle.style.left = `${35 + Math.random() * 30}%`;
  el("particles").append(particle);
  setTimeout(() => particle.remove(), 900);
  render();
};
el("save").onclick = () => save();
const dialog = el<HTMLDialogElement>("confirm");
el("rekindle").onclick = () => {
  advance(state, Date.now());
  const reward = emberReward(state);
  if (reward < 1) return;
  text(
    "exchange",
    `Keep ${format(reward)} new ember${reward === 1 ? "" : "s"}, for a total of ${format(state.embers + reward)}. Your gathering bonus becomes +${format((state.embers + reward) * 10)}%.`,
  );
  dialog.showModal();
};
dialog.addEventListener("close", () => {
  if (dialog.returnValue === "confirm" && rekindle(state, true)) {
    notify("A new season begins. Your light remembers.");
    save(false);
    render();
  }
});
setInterval(() => {
  advance(state, Date.now());
  render();
}, 200);
setInterval(() => save(false), 5000);
window.addEventListener("pagehide", () => save(false));
document.addEventListener("visibilitychange", () => {
  if (document.hidden) save(false);
  else {
    advance(state, Date.now());
    render();
  }
});
render();
if (loaded) notify(saveMessage);
