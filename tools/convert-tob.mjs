/* Converts Tome of Beasts data from the Open5e project into the app's statblock
   schema. Inputs (fetch these next to this script before running):
   - tob-monsters.json  https://raw.githubusercontent.com/open5e/open5e-api/main/data/v1/tob/Monster.json
   - tob-doc.json       https://raw.githubusercontent.com/open5e/open5e-api/main/data/v1/tob/Document.json
   - licenses.json      https://raw.githubusercontent.com/open5e/open5e-api/main/data/v2/License.json
   Run: node tools/convert-tob.mjs  (from the directory containing the inputs)
   Output: src/data/bestiaryTob.js */
import fs from "fs";

const raw = JSON.parse(fs.readFileSync("tob-monsters.json", "utf8"));
const docs = JSON.parse(fs.readFileSync("tob-doc.json", "utf8"));
const licenses = JSON.parse(fs.readFileSync("licenses.json", "utf8"));
const oglText = licenses.find((x) => x.pk === "ogl-10a").fields.desc;
const tobCopyright = docs[0].fields.copyright;

// SRD names for collision check
const srd = fs.readFileSync("/home/user/DM-Screen/src/data/bestiary.js", "utf8");
const srdNames = new Set([...srd.matchAll(/"name":"([^"]+)"/g)].map((m) => m[1].toLowerCase()));

const mod = (s) => Math.floor((s - 10) / 2);
const clean = (s) => String(s ?? "").replace(/\s+/g, "");
const DICE_RE = /^\d*d\d+([+-]\d+)?$/;
const ABIL = { Strength: "STR", Dexterity: "DEX", Constitution: "CON", Intelligence: "INT", Wisdom: "WIS", Charisma: "CHA" };
const TYPES = "acid|bludgeoning|cold|fire|force|lightning|necrotic|piercing|poison|psychic|radiant|slashing|thunder";
const dtypeFrom = (txt) => (String(txt || "").match(new RegExp(`(${TYPES}) damage`, "i")) || [])[1]?.toLowerCase();
const csv = (s) => String(s || "").split(/[;,]/).map((x) => x.trim()).filter(Boolean);
const jarr = (s) => { try { const v = JSON.parse(s || "[]"); return Array.isArray(v) ? v : []; } catch { return []; } };
const NUMW = { one: 1, two: 2, three: 3, four: 4, five: 5 };

const catOf = (type, subtype, name) => {
  const t = String(type).toLowerCase(), st = String(subtype || "").toLowerCase();
  if (t === "dragon") return "dragon";
  if (t === "undead") return "undead";
  if (t === "fiend" || t === "celestial") return "fiend";
  if (t === "giant") return "giant";
  if (t === "elemental" || t === "construct") return "elem";
  if (t === "aberration" || t === "ooze") return "aber";
  if (t === "monstrosity") return "monst";
  if (t === "plant" || t === "fey") return "crawl";
  if (t === "beast" || t === "swarm of tiny beasts") return "beast";
  if (t === "humanoid") return /goblin|orc|kobold|gnoll|hobgob|bugbear|ratfolk|derro|troglodyte/.test(st + name.toLowerCase()) ? "kin" : "people";
  return "monst";
};

const BIOMES = ["Swamp","Forest","Jungle","Desert","Open Sea","Mountains","Roadside","Cavern","Dungeon","Crypt","Volcanic","Storm Peak","Feywild","Shadowfell","Fiendish Realm","Underdark","Arctic","Urban"];
function biomesOf(m, cat) {
  const hay = (m.name + " " + (m.desc || "")).toLowerCase();
  const t = String(m.type).toLowerCase(), st = String(m.subtype || "").toLowerCase();
  const out = new Set();
  const kw = [
    [/swamp|bog|marsh|mire|toad/, "Swamp"], [/forest|wood|grove|moss|deer|elk|owl\b/, "Forest"],
    [/jungle|vine|serpent|ape\b/, "Jungle"], [/desert|sand|dust|dune|mummy|sphinx|scorpion/, "Desert"],
    [/\bsea\b|ocean|reef|coral|shark|eel|kraken|drowned|tide|wave|siren/, "Open Sea"],
    [/mountain|peak|crag|cliff|roc\b/, "Mountains"], [/bandit|road|highway|wolf|boar/, "Roadside"],
    [/cave|cavern|\bbat\b|stalag/, "Cavern"], [/crypt|tomb|grave|bone|ghoul|ossuary/, "Crypt"],
    [/volcan|lava|magma|ember|ash|cinder|salamander/, "Volcanic"], [/storm|thunder|lightning|cloud|wind/, "Storm Peak"],
    [/\bfey\b|fairy|sprite|pixie|dream/, "Feywild"], [/shadow|umbral|night|dark/, "Shadowfell"],
    [/demon|devil|infernal|hell|abyss/, "Fiendish Realm"], [/underdark|deep |drow|fungus|mushroom|myconid/, "Underdark"],
    [/arctic|frost|ice|snow|frozen|glacial|yeti/, "Arctic"], [/city|urban|street|sewer|alley|thief|cult/, "Urban"],
  ];
  kw.forEach(([re, b]) => { if (re.test(hay) && out.size < 2) out.add(b); });
  if (!out.size) {
    const fb = { undead: "Crypt", fiend: "Fiendish Realm", celestial: "Urban", fey: "Feywild", aberration: "Underdark",
      dragon: "Mountains", plant: "Forest", ooze: "Dungeon", construct: "Dungeon", giant: "Mountains",
      monstrosity: "Cavern", beast: "Forest", humanoid: "Roadside" };
    let b = fb[t];
    if (t === "elemental") b = /fire/.test(st + hay) ? "Volcanic" : /water/.test(st + hay) ? "Open Sea" : /air|storm/.test(st + hay) ? "Storm Peak" : "Cavern";
    out.add(b || "Dungeon");
  }
  return [...out];
}

const monsters = [];
const pools = Object.fromEntries(BIOMES.map((b) => [b, []]));
const problems = [];

for (const rec of raw) {
  const f = rec.fields;
  if (srdNames.has(f.name.toLowerCase())) { problems.push(`collision (skipped): ${f.name}`); continue; }
  const sb = { name: f.name, cr: String(f.challenge_rating), src: "tob", cat: catOf(f.type, f.subtype, f.name) };
  sb.ac = f.armor_class; sb.hp = f.hit_points;
  const hpF = clean(f.hit_dice);
  if (DICE_RE.test(hpF)) sb.hpF = hpF;
  try {
    const sp = JSON.parse(f.speed_json || "{}");
    const parts = [];
    if (sp.walk != null) parts.push(`${sp.walk} ft.`);
    for (const k of ["burrow", "climb", "fly", "swim"]) if (sp[k] != null) parts.push(`${k} ${sp[k]} ft.${k === "fly" && sp.hover ? " (hover)" : ""}`);
    sb.spd = parts.join(", ") || "30 ft.";
  } catch { sb.spd = "30 ft."; }
  sb.mods = { str: mod(f.strength), dex: mod(f.dexterity), con: mod(f.constitution), int: mod(f.intelligence), wis: mod(f.wisdom), cha: mod(f.charisma) };
  const saves = {};
  for (const [k, s] of [["str", "strength_save"], ["dex", "dexterity_save"], ["con", "constitution_save"], ["int", "intelligence_save"], ["wis", "wisdom_save"], ["cha", "charisma_save"]])
    if (f[s] != null) saves[k] = f[s];
  if (Object.keys(saves).length) sb.saves = saves;
  if (f.damage_resistances) sb.resist = csv(f.damage_resistances);
  if (f.damage_immunities) sb.immune = csv(f.damage_immunities);
  if (f.damage_vulnerabilities) sb.vuln = csv(f.damage_vulnerabilities);
  if (f.condition_immunities) sb.condImmune = csv(f.condition_immunities);

  const traits = jarr(f.special_abilities_json).map((x) => ({ n: x.name, d: x.desc }));
  if (traits.length) sb.traits = traits;
  const lr = traits.find((x) => /Legendary Resistance \((\d+)\/Day/i.test(x.n || ""));
  if (lr) sb.legRes = +(lr.n.match(/\((\d+)\/Day/i) || [])[1] || 3;

  const actions = [];
  for (const a of jarr(f.actions_json)) {
    let n = a.name || "Action";
    if (/^Multiattack$/i.test(n)) { sb.multi = a.desc; continue; }
    const act = {};
    const rm = n.match(/\(Recharge (\d)(?:\s*[–-]\s*\d)?\)/i);
    if (rm) { act.rech = +rm[1]; n = n.replace(/\s*\(Recharge[^)]*\)/i, ""); }
    act.n = n; act.d = a.desc;
    const saveM = (a.desc || "").match(/DC (\d+) (Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma) saving throw/);
    if (a.attack_bonus != null) {
      act.kind = "atk"; act.hit = a.attack_bonus;
      let dmg = clean(a.damage_dice);
      if (!(DICE_RE.test(dmg) || /^\d+$/.test(dmg))) {
        dmg = clean(((a.desc || "").match(/Hit:\s*\d+\s*\((\d+d\d+(?:\s*[+-]\s*\d+)?)\)/) || [])[1] || "");
      }
      if (DICE_RE.test(dmg) || /^\d+$/.test(dmg)) act.dmg = dmg;
      else problems.push(`no parsable dmg: ${f.name} / ${n}`);
      const hitIdx = (a.desc || "").indexOf("Hit:");
      act.dtype = dtypeFrom(hitIdx >= 0 ? a.desc.slice(hitIdx) : a.desc) || "bludgeoning";
    } else if (saveM) {
      act.kind = "save"; act.save = { ability: ABIL[saveM[2]], dc: +saveM[1] };
      const dm = (a.desc || "").match(/(\d+)\s*\((\d+d\d+(?:\s*[+-]\s*\d+)?)\)/);
      if (dm) { act.dmg = clean(dm[2]); const dt = dtypeFrom(a.desc.slice(a.desc.indexOf(dm[0]))); if (dt) act.dtype = dt; }
    } else act.kind = "text";
    actions.push(act);
  }
  if (actions.length) sb.actions = actions;

  const bonus = jarr(f.bonus_actions_json).map((x) => ({ n: x.name, d: x.desc }));
  if (bonus.length) sb.bonus = bonus;
  const reactions = jarr(f.reactions_json).map((x) => ({ n: x.name, d: x.desc }));
  if (reactions.length) sb.reactions = reactions;
  const lopts = jarr(f.legendary_actions_json).map((x) => ({ n: x.name, d: x.desc }));
  if (lopts.length) {
    const cm = (f.legendary_desc || "").match(/take (\w+|\d) legendary/i);
    sb.legendary = { count: cm ? (NUMW[(cm[1] || "").toLowerCase()] || parseInt(cm[1], 10) || 3) : 3, options: lopts };
  }
  monsters.push(sb);
  biomesOf(f, sb.cat).forEach((b) => pools[b].push(sb.name));
}

// validation summary
const CRS = new Set(["0","1/8","1/4","1/2",...Array.from({length:30},(_,i)=>String(i+1))]);
let bad = 0;
for (const m of monsters) {
  if (!CRS.has(m.cr)) { problems.push(`bad CR: ${m.name} = ${m.cr}`); bad++; }
  if (!Number.isFinite(m.ac) || !Number.isFinite(m.hp)) { problems.push(`bad ac/hp: ${m.name}`); bad++; }
  for (const a of m.actions || []) {
    if (a.kind === "atk" && !Number.isFinite(a.hit)) { problems.push(`bad hit: ${m.name}/${a.n}`); bad++; }
  }
}
console.log("converted:", monsters.length, "of", raw.length, "| hard problems:", bad);
console.log("action kinds:", JSON.stringify(monsters.flatMap((m) => m.actions || []).reduce((o, a) => (o[a.kind] = (o[a.kind] || 0) + 1, o), {})));
console.log("with multi:", monsters.filter((m) => m.multi).length, "| legendary:", monsters.filter((m) => m.legendary).length, "| legRes:", monsters.filter((m) => m.legRes).length);
console.log("cats:", JSON.stringify(monsters.reduce((o, m) => (o[m.cat] = (o[m.cat] || 0) + 1, o), {})));
console.log("pool sizes:", BIOMES.map((b) => `${b}:${pools[b].length}`).join(" "));
console.log("problems (first 15):"); problems.slice(0, 15).forEach((p) => console.log("  -", p));

const out = `/* ---------------- Tome of Beasts expanded bestiary ----------------
   Open game content from Tome of Beasts by Kobold Press, converted from the
   Open5e project's data. Used under the Open Game License v 1.0a — the full
   license text ships below and is shown in the app's Licenses panel.
   ${tobCopyright}
   Auto-generated by tools/convert-tob (do not hand-edit). */
const BESTIARY_TOB = ${JSON.stringify(monsters)};
const TOB_POOLS = ${JSON.stringify(pools)};
const TOB_META = {
  title: "Tome of Beasts",
  organization: "Kobold Press™",
  copyright: ${JSON.stringify(tobCopyright)},
  licenseName: "OPEN GAME LICENSE Version 1.0a",
  licenseText: ${JSON.stringify(oglText)},
  s15: [
    "Open Game License v 1.0a Copyright 2000, Wizards of the Coast, LLC.",
    ${JSON.stringify(tobCopyright)},
  ],
};
export { BESTIARY_TOB, TOB_POOLS, TOB_META };
export default BESTIARY_TOB;
`;
fs.writeFileSync("/home/user/DM-Screen/src/data/bestiaryTob.js", out);
console.log("wrote src/data/bestiaryTob.js:", (out.length / 1024).toFixed(0) + "KB");
