import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, gather, buyTender, rate } from "../src/economy.ts";
test("gather then buy the first tender: 15 glow buys 0.5 per second", () => {
  const s = fresh(1000);
  for (let i = 0; i < 15; i++) gather(s);
  assert.equal(buyTender(s, 0), true);
  assert.equal(s.glow, 0);
  assert.equal(rate(s), 0.5);
  assert.equal(buyTender(s, 0), false);
});

import {
  advance,
  OFFLINE_MS,
  decode,
  buyImprovement,
  tapValue,
  rekindle,
  emberReward,
  LIMIT,
  format,
} from "../src/economy.ts";
test("production is fractional and upgrades apply to the correct gathering source", () => {
  const s = fresh(1000);
  s.glow = s.run = s.lifetime = 250;
  buyTender(s, 0);
  advance(s, 2000);
  assert.equal(s.glow, 235.5);
  assert.equal(buyImprovement(s, 0), true);
  assert.equal(tapValue(s), 2);
  assert.equal(rate(s), 0.5);
  assert.equal(buyImprovement(s, 0), false);
  assert.equal(buyImprovement(s, 1), false);
});
test("repeated purchases never overspend and costs rise", () => {
  const s = fresh();
  s.glow = s.run = s.lifetime = 32;
  assert.equal(buyTender(s, 0), true);
  assert.equal(buyTender(s, 0), false);
  assert.equal(s.glow, 17);
  assert.equal(buyTender(s, -1), false);
  assert.equal(buyImprovement(s, 99), false);
});
test("four-hour offline limit and backward clock high-water mark", () => {
  const s = fresh(1000);
  s.tenders[0] = 2;
  assert.equal(advance(s, 1000 + OFFLINE_MS * 2), 14400);
  const now = s.savedAt;
  assert.equal(advance(s, now - 10000), 0);
  assert.equal(s.savedAt, now);
  assert.equal(advance(s, now), 0);
  assert.equal(advance(s, now + 1000), 1);
});
test("save roundtrip accrues offline production once", () => {
  const s = fresh(1000);
  s.tenders[0] = 1;
  const restored = decode(JSON.stringify(s), 11000)!;
  assert.equal(restored.glow, 5);
  assert.equal(decode(JSON.stringify(restored), 11000)!.glow, 5);
  assert.equal(restored.version, 1);
});
test("malformed and incompatible saves are rejected", () => {
  const s = fresh();
  for (const raw of [
    "null",
    "[]",
    "{",
    "{}",
    JSON.stringify({ ...s, version: 2 }),
    JSON.stringify({ ...s, glow: -1 }),
    JSON.stringify({ ...s, tenders: [1] }),
    JSON.stringify({ ...s, tenders: [1.5, 0, 0, 0, 0] }),
    JSON.stringify({ ...s, improvements: [1, 0, 0, 0, 0, 0] }),
    JSON.stringify({ ...s, keepsakes: ["first", "first"] }),
    JSON.stringify({ ...s, savedAt: Infinity }),
    JSON.stringify({ ...s, glow: 1 }),
  ])
    assert.equal(decode(raw, Date.now()), null, raw);
});
test("rekindle preview, cancel, confirm and repeated confirmation preserve contract", () => {
  const s = fresh(1000);
  s.glow = s.run = s.lifetime = 5000;
  s.clicks = 100;
  s.tenders[0] = 10;
  s.improvements[0] = true;
  s.keepsakes = ["first"];
  assert.equal(emberReward(s), 1);
  const before = JSON.stringify(s);
  assert.equal(rekindle(s, false), false);
  assert.equal(JSON.stringify(s), before);
  assert.equal(rekindle(s, true), true);
  assert.equal(s.glow, 0);
  assert.equal(s.run, 0);
  assert.equal(s.lifetime, 5000);
  assert.equal(s.embers, 1);
  assert.equal(s.seasons, 1);
  assert.equal(tapValue(s), 1.1);
  assert.equal(rate(s), 0);
  assert.equal(s.keepsakes.includes("first"), true);
  assert.equal(s.keepsakes.includes("ember"), true);
  assert.equal(rekindle(s, true), false);
});
test("large values remain finite, format readably and respect caps", () => {
  const s = fresh(0);
  s.glow = s.run = s.lifetime = LIMIT;
  s.tenders.fill(1000);
  s.embers = 1e6;
  advance(s, OFFLINE_MS);
  gather(s);
  assert.equal(s.glow, LIMIT);
  assert.ok(Number.isFinite(rate(s)));
  assert.equal(buyTender(s, 0), false);
  assert.equal(emberReward(s), 0);
  assert.equal(format(LIMIT), "1.00e+100");
});
test("keepsakes persist through saves and seasons without duplicates", () => {
  const s = fresh();
  for (let i = 0; i < 100; i++) gather(s);
  assert.ok(s.keepsakes.includes("tap"));
  assert.ok(s.keepsakes.includes("first"));
  assert.equal(new Set(s.keepsakes).size, s.keepsakes.length);
  assert.deepEqual(
    decode(JSON.stringify(s), s.savedAt)!.keepsakes,
    s.keepsakes,
  );
});
