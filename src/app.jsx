import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import BESTIARY from "./data/bestiary.js";
import SPELL_REF from "./data/spells.js";
import ENCOUNTER_POOLS from "./data/encounterPools.js";
import LAIR_THEMES from "./data/lairThemes.js";

/* ============================================================
   DM COMBAT SCREEN — D&D 5e (2024 / SRD 5.2 compatible)
   ============================================================ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=JetBrains+Mono:wght@400;600&display=swap');

:root{
  --ink:#1b1722; --panel:#241f2e; --raised:#2e2839; --line:#3a3347; --line2:#4a4159;
  --text:#e9e2d6; --dim:#9a91a8; --faint:#6d6480;
  --gold:#d9a441; --gold-soft:rgba(217,164,65,.14);
  --enemy:#c65f52; --ally:#6aa87c; --fx:#7a8fc9;
  --danger:#e0645a; --ok:#7fbf8e;
  --mono:'JetBrains Mono',ui-monospace,Menlo,Consolas,monospace;
  --disp:'Cinzel',Georgia,serif;
}
*{box-sizing:border-box;margin:0;padding:0}
.dm-app{min-height:100vh;min-height:100dvh;display:flex;flex-direction:column;
  background:var(--ink);color:var(--text);
  font:14px/1.45 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
  padding-bottom:80px}
.dm-app ::selection{background:var(--gold-soft)}
button{font:inherit;color:inherit;background:none;border:none;cursor:pointer}
input,select,textarea{font:inherit;font-size:16px;color:var(--text);background:var(--ink);
  border:1px solid var(--line2);border-radius:6px;padding:6px 8px;outline:none}
input:focus,select:focus,textarea:focus{border-color:var(--gold)}
input[type=number]{width:64px}

.hdr{display:flex;align-items:center;gap:12px;padding:10px 14px;
  padding-top:calc(10px + env(safe-area-inset-top,0px));
  border-bottom:1px solid var(--line);position:sticky;top:0;background:var(--ink);z-index:40}
.hdr .title{font-family:var(--disp);font-weight:700;font-size:15px;letter-spacing:.12em;
  text-transform:uppercase;color:var(--gold)}
.hdr .round{font-family:var(--disp);font-size:13px;letter-spacing:.08em;color:var(--text);
  border:1px solid var(--line2);border-radius:6px;padding:3px 10px}
.hdr .spacer{flex:1}
.btn{border:1px solid var(--line2);border-radius:7px;padding:6px 12px;background:var(--panel);
  transition:border-color .15s,background .15s;white-space:nowrap}
.btn:hover{border-color:var(--gold)}
.btn.primary{background:var(--gold);color:#241d0e;font-weight:600;border-color:var(--gold)}
.btn.primary:hover{background:#e5b657}
.btn.danger{border-color:var(--danger);color:var(--danger)}
.btn.small{padding:3px 8px;font-size:12px;border-radius:6px}
.btn.ghost{border-color:transparent;color:var(--dim)}
.btn.ghost:hover{color:var(--text);border-color:var(--line2)}
.btn:disabled{opacity:.4;cursor:default}
.btn.primary:disabled{background:var(--raised);border-color:var(--line2);color:var(--faint);opacity:.75}

.mono{font-family:var(--mono);font-size:12px}
.chip{display:inline-flex;align-items:center;gap:3px;font-family:var(--mono);font-size:12px;background:var(--ink);
  border:1px solid var(--line);border-radius:5px;padding:1px 6px;white-space:nowrap}
.die{flex-shrink:0}
.die .facet{fill:none;stroke-width:.8}
.die.plain .shell{fill:#2a2333;stroke:#8a7f96}
.die.plain .facet{stroke:#57506388}
.die.plain text{fill:#e8e2d5}
.die.critd .shell{fill:rgba(217,164,65,.18);stroke:var(--gold)}
.die.critd .facet{stroke:rgba(217,164,65,.5)}
.die.critd text{fill:var(--gold)}
.die.fumbled .shell{fill:#211d28;stroke:#5a5364}
.die.fumbled .facet{stroke:#4a445455}
.die.fumbled text{fill:#8a8494}
.die.dmgd .shell{fill:rgba(198,95,82,.14);stroke:#c07264}
.die.dmgd .facet{stroke:rgba(198,95,82,.4)}
.die.dmgd text{fill:#e8a49b}
.die.dropped{opacity:.4}
.die text{font-family:var(--mono);font-weight:700}
.die .flick{opacity:.55}
.results .chip{font-size:13px;padding:3px 8px}
.peekmodal{width:min(680px,96vw);max-height:90vh;overflow-y:auto;padding:10px}
.peekmodal .card{border:none;box-shadow:none;margin:0;padding:4px 0 0}
.peekbanner{position:sticky;top:-10px;z-index:5;display:flex;align-items:center;gap:8px;background:rgba(90,110,180,.18);border:1px solid rgba(120,140,220,.45);border-radius:10px;padding:6px 10px;font-size:13px;color:#aab8e0;margin-bottom:4px}
.gs-targets{max-height:34vh;overflow-y:auto;border:1px solid var(--line);border-radius:10px;padding:4px 8px}
.gs-target{display:flex;gap:8px;align-items:baseline;padding:4px 0;border-bottom:1px solid var(--line)}
.gs-target:last-child{border-bottom:0}
.gs-row{display:flex;gap:8px;align-items:baseline;padding:4px 0;border-bottom:1px solid var(--line)}
.gs-row:last-child{border-bottom:0}
.verdict.small{font-size:12px;padding:0 6px}
.sbook{width:min(560px,96vw);max-height:88vh;display:flex;flex-direction:column;padding:12px}
.sbook-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.sbook-search{width:100%;box-sizing:border-box;background:var(--panel);border:1px solid var(--line2);border-radius:10px;color:var(--text);padding:8px 10px;font-size:16px;margin-bottom:8px}
input.sbook-search,textarea.sbook-search,select.sbook-search{color:var(--text) !important;-webkit-text-fill-color:var(--text) !important;caret-color:var(--gold);background:var(--panel) !important;color-scheme:dark;-webkit-appearance:none;appearance:none}
.sbook-search::placeholder{color:var(--faint);-webkit-text-fill-color:var(--faint);opacity:1}
.sbook-lvls{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:8px}
.lvlchip{cursor:pointer;font-size:11px;background:var(--panel);border:1px solid var(--line2);border-radius:8px;color:var(--dim);padding:2px 8px}
.lvlchip.on{color:var(--gold);border-color:var(--gold)}
.sbook-list{overflow-y:auto;flex:1;min-height:0}
.sbook-row{border-bottom:1px solid var(--line);padding:2px 0}
.sbook-name{cursor:pointer;display:flex;align-items:baseline;gap:6px;padding:6px 2px;flex-wrap:wrap}
.sbook-meta{color:var(--faint);font-size:10.5px;margin-left:auto;text-align:right}
.sbadge{font-size:9px;font-family:var(--mono);border:1px solid var(--line2);border-radius:5px;padding:0 4px;color:var(--dim)}
.sbook .spellinfo{max-height:none}
.spellinfo{flex-basis:100%;width:100%;margin-top:3px;font-size:12px;max-height:280px;overflow:auto;line-height:1.45}
.casterline{display:flex;align-items:center;flex-wrap:wrap;gap:4px;background:rgba(217,164,65,.1);border:1px solid rgba(217,164,65,.4);border-radius:8px;padding:4px 8px;margin-bottom:6px;font-size:12px}
.spellstats{font-family:var(--mono);font-size:11px;color:var(--dim);margin:3px 0}
.verdict{font-family:var(--disp);font-size:18px;font-weight:700;letter-spacing:1px;padding:2px 10px;border-radius:8px}
.verdict.good{color:#9fd3ab;border:1px solid rgba(127,191,142,.6);background:rgba(127,191,142,.08)}
.verdict.bad{color:#e8a49c;border:1px solid rgba(224,100,90,.6);background:rgba(224,100,90,.08)}
.statchip{cursor:pointer;display:inline-block;font-size:11px;color:var(--dim);background:rgba(217,164,65,.05);border:1px solid var(--line2);border-radius:8px;padding:1px 7px;margin:1px 4px 1px 0;font-family:var(--mono);white-space:nowrap}
.legbanner{padding:0}
.legbanner-head{cursor:pointer;padding:8px 10px;display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.legcaret{margin-left:auto;color:var(--faint);font-size:10px}
.legpanel{padding:0 10px 8px;border-top:1px solid var(--line)}
.savestrip{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:6px 0 2px}
.savestrip .chip{font-size:13px;padding:3px 8px}
.chip.sgood{border-color:rgba(127,191,142,.6);color:#9fd3ab;background:rgba(127,191,142,.08)}
.chip.sbad{border-color:rgba(224,100,90,.6);color:#e8a49c;background:rgba(224,100,90,.08)}
.atkbudget{margin-left:8px;font-family:var(--mono);font-size:10.5px;color:var(--gold);letter-spacing:.5px}
.atkbudget .btn.tiny{font-size:9px;padding:0 5px;margin-left:5px;line-height:1.5}
.usepips{font-size:9px;letter-spacing:1.5px;color:var(--gold);white-space:nowrap;margin-right:2px}
.usepips .off{color:var(--line2)}
.usepips.spent{opacity:.55}
.spellpips{background:none;border:1px solid var(--line2);border-radius:6px;padding:0 4px;cursor:pointer;line-height:1.4}
.spellpips:disabled{cursor:default}
.rowflash{position:absolute;right:10px;top:-15px;z-index:7;pointer-events:none;white-space:nowrap;
  font-size:11.5px;font-family:var(--mono);color:#ffd9a0;background:rgba(30,24,14,.92);border:1px solid rgba(217,164,65,.55);
  border-radius:8px;padding:2px 8px;box-shadow:0 2px 10px rgba(0,0,0,.5);animation:rowflashfade 3s ease forwards}
@keyframes rowflashfade{0%{opacity:0;transform:translateY(7px)}6%{opacity:1;transform:translateY(0)}82%{opacity:1}100%{opacity:0;transform:translateY(-7px)}}
.rolltotal{display:inline-block;min-width:22px;text-align:center;font-weight:700;font-family:var(--mono);
  border-radius:6px;padding:1px 6px;margin:0 1px}
.rolltotal.good{background:rgba(94,168,96,.22);border:1px solid rgba(94,168,96,.65);color:#9fd8a0}
.rolltotal.bad{background:rgba(198,84,74,.2);border:1px solid rgba(198,84,74,.6);color:#eda49c}
.srd-attrib{max-width:860px;margin:48px auto 0;padding:20px 14px 0;font-size:10.5px;line-height:1.5;color:var(--faint);
  border-top:1px solid var(--line)}
.srd-attrib a{color:var(--dim)}
.savetag{cursor:pointer;font-size:10px;font-family:var(--mono);border:1px solid var(--line2);border-radius:8px;padding:0 5px;margin-left:6px;color:var(--dim);white-space:nowrap}
.savetag.good{color:#9fd3ab;border-color:rgba(127,191,142,.5)}
.savetag.bad{color:#e8a49c;border-color:rgba(224,100,90,.5)}
.concring{position:absolute;inset:3px;border:1.5px solid rgba(102,146,222,.8);border-radius:5px;pointer-events:none}
.advhint{cursor:pointer;display:inline-block;font-size:11px;color:#8fae87;background:rgba(122,168,110,.10);border:1px solid rgba(122,168,110,.28);border-radius:8px;padding:1px 7px;margin:1px 4px 1px 0;font-family:var(--mono)}
.btn.cond{border-color:rgba(217,164,65,.45);color:var(--gold);background:rgba(217,164,65,.07);font-family:var(--mono);font-size:11px;padding:2px 8px}
.chip.hit{border-color:var(--gold);color:var(--gold)}
.chip.dmg{border-color:var(--enemy);color:#e8a49b}
.chip.ok{border-color:var(--ok);color:var(--ok)}
.chip.bad{border-color:var(--danger);color:var(--danger)}

/* initiative rail */
.rail{background:var(--panel);border-bottom:1px solid var(--line)}
.rail.collapsed{display:none}
.railbar{display:flex;align-items:center;gap:8px;padding:4px 14px;background:var(--panel);
  border-bottom:1px solid var(--line);position:sticky;top:49px;z-index:31;font-size:12px;color:var(--dim)}
.row{display:flex;align-items:center;gap:8px;padding:5px 10px;border-bottom:1px solid var(--line);
  min-height:38px;flex-wrap:wrap}
.row:last-child{border-bottom:none}
.row.active{background:var(--gold-soft);box-shadow:inset 3px 0 0 var(--gold)}
.row.dead > *:not(.lootico){opacity:.42}
.row.dead .nm{text-decoration:line-through}
.row.dead .lootico{opacity:1;filter:drop-shadow(0 0 4px rgba(217,164,65,.7))}
.initmark{font-family:var(--mono);font-size:13px;font-weight:600;width:30px;text-align:center;
  flex-shrink:0;position:relative}
.sidebar-dot{width:7px;height:7px;transform:rotate(45deg);flex-shrink:0}
.side-enemy{background:var(--enemy)} .side-ally{background:var(--ally)} .side-effect{background:var(--fx)}
.nm{font-weight:600;min-width:80px;flex-shrink:0}
.nm .sub{font-weight:400;color:var(--faint);font-size:11px;margin-left:4px}
.hpbox{display:flex;align-items:center;gap:2px;flex-shrink:0;position:relative}
@keyframes hp-punch{0%{transform:scale(1)}30%{transform:scale(1.35)}100%{transform:scale(1)}}
@keyframes hp-float{0%{opacity:1;transform:translate(-50%,0)}100%{opacity:0;transform:translate(-50%,-16px)}}
.hpval.pd{animation:hp-punch .7s ease;color:#e0645a}
.hpval.ph{animation:hp-punch .7s ease;color:#7fbf8e}
.hpghost{position:absolute;left:50%;top:-4px;transform:translate(-50%,0);font-family:var(--mono);
  font-size:11px;font-weight:700;pointer-events:none;animation:hp-float 1.5s ease-out forwards;z-index:5}
.hpghost.d{color:#e0645a}
.hpghost.h{color:#7fbf8e}
.hpheart{width:14px;height:13px;flex-shrink:0;display:block}
.thpchip{font-family:var(--mono);font-size:11px;font-weight:700;color:#6ecbd8;
  border:1px solid rgba(110,203,216,.45);background:rgba(110,203,216,.08);
  border-radius:5px;padding:1px 4px;line-height:1.3;flex-shrink:0}
@keyframes spotpulse{0%{background:rgba(217,164,65,0)}30%{background:rgba(217,164,65,.16)}100%{background:rgba(217,164,65,0)}}
.row.spot::before{content:"";position:absolute;inset:0;pointer-events:none;animation:spotpulse 1.1s ease;border-radius:2px}
@keyframes deathfade{0%{filter:saturate(1) brightness(1.15)}100%{filter:saturate(.15) brightness(.85)}}
.row.dying{animation:deathfade 1.2s ease}
@keyframes skullfloat{0%{opacity:1;transform:translate(-50%,0) scale(.9)}100%{opacity:0;transform:translate(-50%,-24px) scale(1.3)}}
.skullghost{position:absolute;left:50%;top:-4px;font-size:14px;pointer-events:none;animation:skullfloat 1.5s ease-out forwards;z-index:6}
@keyframes badgepop{0%{transform:scale(.55);opacity:0}60%{transform:scale(1.12)}100%{transform:scale(1);opacity:1}}
.cond{animation:badgepop .35s ease}
@keyframes badgefade{0%{opacity:.9;transform:scale(1)}100%{opacity:0;transform:scale(.65)}}
.condghost{animation:badgefade .5s ease forwards;pointer-events:none}
@keyframes critburst{0%{box-shadow:0 0 0 0 rgba(217,164,65,.7);transform:scale(.9)}45%{box-shadow:0 0 14px 4px rgba(217,164,65,.55);transform:scale(1.12)}100%{box-shadow:0 0 0 0 rgba(217,164,65,0);transform:scale(1)}}
.chip.crit{color:var(--gold);border-color:var(--gold);background:var(--gold-soft);animation:critburst .9s ease}
@keyframes fumblethud{0%{transform:translateY(-4px);opacity:.4}55%{transform:translateY(1px)}100%{transform:translateY(0);opacity:1}}
.chip.fumble{color:var(--faint);border-color:var(--line2);animation:fumblethud .55s ease}
@keyframes thpshatter{0%{opacity:1;transform:scale(1) rotate(0deg);filter:blur(0)}100%{opacity:0;transform:scale(1.6) rotate(10deg);filter:blur(2px)}}
.thpchip.shattering{animation:thpshatter .7s ease forwards;pointer-events:none}
@keyframes roundpulse{0%{transform:scale(1)}35%{transform:scale(1.25);color:var(--gold)}100%{transform:scale(1)}}
.round.roundpulse{display:inline-block;animation:roundpulse .7s ease}
.hpval{font-family:var(--mono);font-size:12px;min-width:52px;text-align:center;cursor:pointer;
  border-radius:5px;padding:2px 3px}
.hpval:hover{background:var(--raised)}
.hpval .max{color:var(--faint)}
.acbox{font-family:var(--mono);font-size:12px;color:var(--dim);display:flex;align-items:center;
  gap:3px;flex-shrink:0}
.shield{cursor:pointer;opacity:.5;font-size:13px}
.shield.on{opacity:1;filter:drop-shadow(0 0 3px var(--gold))}
.badges{display:flex;gap:4px;flex-wrap:wrap;align-items:center;flex:1 1 auto}
.cond{font-size:11px;background:var(--raised);border:1px solid var(--line2);border-radius:10px;
  padding:0 7px;line-height:18px;cursor:pointer;white-space:nowrap}
.cond:hover{border-color:var(--danger)}
.cond .rt{color:var(--gold);font-family:var(--mono)}
.conc{font-size:11px;border:1px solid var(--fx);color:#aab8e0;border-radius:10px;padding:0 7px;
  line-height:18px;cursor:pointer;white-space:nowrap}
.rtog{font-family:var(--mono);font-size:11px;border:1px solid var(--line2);border-radius:5px;
  padding:1px 6px;color:var(--faint);flex-shrink:0}
.rtog.on{border-color:var(--ok);color:var(--ok)}
.advtag{font-family:var(--mono);font-size:11px;border-radius:5px;padding:1px 6px;flex-shrink:0;
  border:1px solid var(--line2);color:var(--faint)}
.roundabbr{display:none}
.advtag.selfadv.none{opacity:.5}
.advtag.adv{border-color:var(--ok);color:var(--ok)}
.advtag.dis{border-color:var(--danger);color:var(--danger)}
.vschip{font-family:var(--mono);font-size:11px;border-radius:5px;padding:1px 6px;flex-shrink:0;
  border:1px solid var(--line2);color:var(--faint);cursor:pointer;opacity:.55}
.vschip:hover{opacity:1;border-color:var(--line2)}
.vschip.adv{opacity:1;border-color:var(--ok);color:var(--ok)}
.vschip.dis{opacity:1;border-color:var(--fx);color:#aab8e0}
.vschip.mix{opacity:1;color:var(--text);border:1px solid transparent;
  background:linear-gradient(var(--panel),var(--panel)) padding-box,
  repeating-linear-gradient(45deg,rgba(224,100,90,.9) 0 5px,rgba(127,191,142,.85) 5px 10px) border-box}
.row{position:relative}
.row.vs-mix::after{content:"";position:absolute;inset:0;pointer-events:none;
  border:1.5px solid transparent;
  background:repeating-linear-gradient(45deg,rgba(224,100,90,.85) 0 8px,rgba(127,191,142,.8) 8px 16px) border-box;
  -webkit-mask:linear-gradient(#fff 0 0) padding-box,linear-gradient(#fff 0 0);
  -webkit-mask-composite:xor;mask:linear-gradient(#fff 0 0) padding-box,linear-gradient(#fff 0 0);
  mask-composite:exclude}
.row.bloody{background:rgba(198,95,82,.13)}
.row.bloody.active{background:linear-gradient(rgba(198,95,82,.13),rgba(198,95,82,.13)),var(--gold-soft)}
.row.vs-adv{box-shadow:inset 0 0 0 1.5px rgba(224,100,90,.8)}
.row.vs-dis{box-shadow:inset 0 0 0 1.5px rgba(127,191,142,.75)}
.row.active.vs-adv{box-shadow:inset 3px 0 0 var(--gold),inset 0 0 0 1.5px rgba(224,100,90,.8)}
.row.active.vs-dis{box-shadow:inset 3px 0 0 var(--gold),inset 0 0 0 1.5px rgba(127,191,142,.75)}
.bloodtag{font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:#e8a49b;
  border:1px solid var(--enemy);border-radius:4px;padding:0 4px;margin-left:5px;font-weight:600}
.pips{display:flex;gap:2px;align-items:center;flex-shrink:0;font-size:10px;color:var(--dim)}
.pip{width:8px;height:8px;transform:rotate(45deg);border:1px solid var(--gold);cursor:pointer}
.pip.full{background:var(--gold)}
.menu-anchor{position:relative;flex-shrink:0;margin-left:auto}
.menu{position:absolute;right:0;top:24px;background:var(--raised);border:1px solid var(--line2);
  border-radius:8px;min-width:170px;z-index:60;box-shadow:0 8px 24px rgba(0,0,0,.5);overflow:hidden}
.menu button{display:block;width:100%;text-align:left;padding:8px 12px;font-size:13px}
.menu button:hover{background:var(--gold-soft)}
.menu button.warn{color:var(--danger)}

/* main column */
.main{max-width:860px;margin:0 auto;padding:12px 14px;display:flex;flex-direction:column;gap:12px}
.card{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:14px}
.card.torch{border-color:var(--gold);box-shadow:0 0 0 1px var(--gold),0 0 24px rgba(217,164,65,.12)}
.card h3{font-family:var(--disp);font-size:14px;letter-spacing:.08em;text-transform:uppercase;
  color:var(--gold);margin-bottom:8px}
.statline{color:var(--dim);font-size:12px;margin-bottom:8px}
.statline b{color:var(--text)}
.sect{margin-top:10px;padding-top:8px;border-top:1px solid var(--line)}
.sect .lbl{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);margin-bottom:6px}
.actrow{display:flex;align-items:flex-start;gap:8px;padding:6px 0;flex-wrap:wrap}
.actrow .an{font-weight:600;min-width:110px}
.actrow .ad{color:var(--dim);font-size:12px;flex:1;min-width:160px}
.actrow .results{width:100%;display:flex;gap:6px;flex-wrap:wrap;padding-left:2px}
.trait{font-size:12px;color:var(--dim);margin-bottom:4px}
.trait b{color:var(--text)}
.reminder{border:1px solid var(--gold);background:var(--gold-soft);border-radius:8px;
  padding:8px 12px;font-size:13px}
.notice{border:1px solid var(--fx);border-radius:8px;padding:8px 12px;font-size:13px;color:#c3cdec}

/* chat */
.lootico{cursor:default;font-size:12px;flex-shrink:0}

/* log */
.logpane{max-height:260px;overflow-y:auto;display:flex;flex-direction:column-reverse}
.logline{font-size:12px;padding:3px 0;border-bottom:1px solid var(--line);color:var(--dim)}
.logline b{color:var(--text)}
.logline .rn{font-family:var(--mono);color:var(--faint);margin-right:6px}

/* modals */
.overlay{position:fixed;inset:0;background:rgba(10,8,14,.7);z-index:80;display:flex;
  align-items:center;justify-content:center;padding:16px;
  padding-top:calc(16px + env(safe-area-inset-top,0px));
  padding-bottom:calc(16px + env(safe-area-inset-bottom,0px))}
.modal{background:var(--panel);border:1px solid var(--line2);border-radius:12px;padding:16px;
  width:100%;max-width:520px;max-height:88vh;overflow-y:auto}
.modal h3{font-family:var(--disp);font-size:14px;letter-spacing:.08em;text-transform:uppercase;
  color:var(--gold);margin-bottom:12px}
.frow{display:flex;gap:8px;align-items:center;margin-bottom:10px;flex-wrap:wrap}
.frow label{font-size:12px;color:var(--dim);min-width:90px}
.frow input[type=text]{flex:1;min-width:120px}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.pick{display:flex;flex-wrap:wrap;gap:6px}
.pick .btn.sel{border-color:var(--gold);background:var(--gold-soft)}
.targetline{display:flex;align-items:center;gap:8px;padding:4px 0;font-size:13px}
.mlist{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px;margin-top:8px}
.mlist .btn{text-align:left;font-size:12px}
.mlist .btn .cr{color:var(--faint);font-family:var(--mono);font-size:11px}

.tabs{display:flex;gap:6px;flex-wrap:wrap}
.toastwrap{position:fixed;top:calc(56px + env(safe-area-inset-top,0px));right:14px;z-index:90;display:flex;flex-direction:column;gap:8px}
.toast{background:var(--raised);border:1px solid var(--gold);border-radius:8px;padding:10px 14px;
  font-size:13px;max-width:320px;box-shadow:0 8px 24px rgba(0,0,0,.5)}
.toast.bad{border-color:var(--danger)}
.toast.good{border-color:var(--ok)}
.hdr-wide{display:flex;align-items:center;gap:8px}
.hdr-narrow{display:none}
@media (max-width:640px){
  .hdr-wide{display:none}
  .hdr-narrow{display:block}
  .hdr .title.incombat{display:none}
  .hdr{gap:6px;padding:8px 8px;padding-top:calc(8px + env(safe-area-inset-top,0px))}
}
@media (max-width:560px){
  .nm{min-width:64px;font-size:13px}
  .actrow .an{min-width:90px}
  .hdr{gap:8px;padding:8px 10px;padding-top:calc(8px + env(safe-area-inset-top,0px))}
  .hdr .title{font-size:12px}
}
`;

/* ---------------- dice ---------------- */
const ri = (n) => Math.floor(Math.random() * n) + 1;

// parse "2d6+3", "1d8", "3d6-1", plain "7"
function rollFormula(f) {
  if (f == null) return null;
  const s = String(f).replace(/\s/g, "");
  if (/^-?\d+$/.test(s)) return { total: parseInt(s, 10), text: `${s}` };
  const m = s.match(/^(\d*)d(\d+)([+-]\d+)?$/i);
  if (!m) return null;
  const n = parseInt(m[1] || "1", 10), d = parseInt(m[2], 10), mod = parseInt(m[3] || "0", 10);
  const rolls = Array.from({ length: n }, () => ri(d));
  const sum = rolls.reduce((a, b) => a + b, 0) + mod;
  const modTxt = mod ? (mod > 0 ? `+${mod}` : `${mod}`) : "";
  return { total: Math.max(0, sum), mod, dice: rolls.map((v) => ({ s: d, v })), text: `${rolls.join("+")}(${n}d${d})${modTxt} = ${sum}` };
}

// d20 with modifier + advantage mode ('none'|'adv'|'dis')
function d20(mod, advMode = "none") {
  const a = ri(20), b = ri(20);
  let used = a, tag = "";
  if (advMode === "adv") { used = Math.max(a, b); tag = "adv "; }
  if (advMode === "dis") { used = Math.min(a, b); tag = "dis "; }
  const total = used + mod;
  const modTxt = mod ? (mod > 0 ? `+${mod}` : `${mod}`) : "";
  const rollTxt = advMode === "none" ? `${used}(d20)` : `${tag}${a},${b}→${used}(d20)`;
  return { total, nat: used, a, b, adv: advMode, text: `(${rollTxt}${modTxt}) = ${total}`, crit: used === 20, fumble: used === 1 };
}

const fmtMod = (m) => (m >= 0 ? `+${m}` : `${m}`);

/* ---------------- conditions ---------------- */
const CONDITIONS = {
  Blinded: "Can't see; auto-fails sight checks. Its attacks: DIS. Attacks vs it: ADV.",
  Charmed: "Can't attack the charmer; charmer has ADV on social checks.",
  Deafened: "Can't hear; auto-fails hearing checks.",
  Frightened: "DIS on checks & attacks while source in sight; can't willingly move closer.",
  Grappled: "Speed 0; attacks have DIS vs targets other than grappler.",
  Incapacitated: "No actions, bonus actions, or reactions.",
  Invisible: "Its attacks: ADV. Attacks vs it: DIS.",
  Paralyzed: "Incapacitated; auto-fail STR/DEX saves. Attacks vs it: ADV; hits within 5 ft crit.",
  Petrified: "Incapacitated; resist all damage; auto-fail STR/DEX saves.",
  Poisoned: "DIS on attack rolls and ability checks.",
  Prone: "Its attacks: DIS. Melee attacks vs it (5 ft): ADV; ranged vs it: DIS.",
  Restrained: "Speed 0. Its attacks: DIS; DEX saves: DIS. Attacks vs it: ADV.",
  Stunned: "Incapacitated; auto-fail STR/DEX saves. Attacks vs it: ADV.",
  Unconscious: "Incapacitated, prone; auto-fail STR/DEX saves. Attacks vs it: ADV; 5 ft hits crit.",
  Exhaustion: "−2 per level to d20 tests (2024 rules).",
  Burning: "Takes 1d4 fire damage at the start of each of its turns until doused (an action) or submerged.",
  Suffocating: "Out of breath: gains 1 Exhaustion level at the end of each of its turns until it can breathe.",
  Hiding: "Counts as Invisible: its attacks have ADV; attacks vs it have DIS. Ends when it attacks, casts with a verbal component, makes noise, or is found.",
  "Half Cover": "+2 to AC and DEX saving throws.",
  "Three-Quarters Cover": "+5 to AC and DEX saving throws.",
  "Total Cover": "Can't be targeted directly by an attack or spell.",
};
const COVER_AC = { "Half Cover": 2, "Three-Quarters Cover": 5 };
function coverBonus(c) {
  let b = 0;
  for (const cd of c.conditions || []) { const v = COVER_AC[cd.name]; if (v) b = Math.max(b, v); }
  return b;
}
const ADV_HINT = {
  Blinded: "dis", Frightened: "dis", Poisoned: "dis", Prone: "dis", Restrained: "dis",
  Invisible: "adv",
};

/* conditions that change how attacks AGAINST the creature roll */
const ADV_VS = {
  Restrained: "adv", Blinded: "adv", Paralyzed: "adv", Stunned: "adv", Unconscious: "adv",
  Prone: "adv*", Invisible: "dis", Hiding: "dis",
};
function condAdvVs(c) {
  let prone = null;
  for (const cd of c.conditions || []) {
    const v = ADV_VS[cd.name];
    if (v === "adv" || v === "dis") return { mode: v, from: cd.name };
    if (v === "adv*") prone = { mode: "adv*", from: cd.name };
  }
  if (c.unconscious) return { mode: "adv", from: "Unconscious" };
  return prone;
}
const isBloodied = (c) => c.hp != null && c.maxHp > 0 && !c.dead && c.hp <= Math.floor(c.maxHp / 2);

/* ---------------- storage ---------------- */
const hasStorage = () => typeof window !== "undefined" && !!window.storage;
async function stSet(k, v) { try { if (hasStorage()) await window.storage.set(k, JSON.stringify(v)); } catch (e) {} }
async function stGet(k) {
  try { if (!hasStorage()) return null; const r = await window.storage.get(k); return r ? JSON.parse(r.value) : null; }
  catch (e) { return null; }
}
async function stDel(k) { try { if (hasStorage()) await window.storage.delete(k); } catch (e) {} }
async function stList(pfx) {
  try { if (!hasStorage()) return []; const r = await window.storage.list(pfx); return (r && r.keys) || []; }
  catch (e) { return []; }
}

/* ---------------- bundled bestiary ----------------
   All 330 stat blocks extracted verbatim from the System Reference Document 5.2.1
   by Wizards of the Coast LLC, licensed under CC-BY-4.0
   (https://creativecommons.org/licenses/by/4.0/). */
const BESTIARY_CATS = [
  ["people", "People"], ["kin", "Goblins, Orcs & Kin"], ["beast", "Beasts"],
  ["dragon", "Dragons & Dragonkin"], ["undead", "Undead"], ["fiend", "Fiends & Celestials"],
  ["giant", "Giants & Brutes"], ["elem", "Elementals & Constructs"], ["aber", "Aberrations & Oozes"],
  ["monst", "Monstrosities"], ["crawl", "Plants, Fey & Crawlies"],
];
function bestiaryBadges(b) {
  const spd = b.spd || "";
  const walk = parseInt((spd.match(/^(\d+)/) || [])[1] || "0", 10);
  const swim = parseInt((spd.match(/swim (\d+)/i) || [])[1] || "0", 10);
  let s = "";
  if (b.legendary) s += "👑";
  if (/fly/i.test(spd)) s += "🪽";
  if (/burrow/i.test(spd)) s += "🕳";
  if (swim > 0 && swim > walk) s += "🌊";
  return s;
}


/* ---------------- magic item catalog (SRD 5.2, CC-BY-4.0) ----------------
   [name, rarity C/U/R/V/L, effect, extras {heal, ch(arges), c(onsumable)}] */
const ITEMS_RAW = [
["Dagger","G","Simple melee — finesse, thrown 20/60.",{wpn:{dmg:"1d4",dtype:"piercing",fin:1}}],
["Club","G","Simple melee.",{wpn:{dmg:"1d4",dtype:"bludgeoning"}}],
["Greatclub","G","Simple melee, two-handed.",{wpn:{dmg:"1d8",dtype:"bludgeoning"}}],
["Handaxe","G","Simple melee — thrown 20/60.",{wpn:{dmg:"1d6",dtype:"slashing"}}],
["Javelin","G","Simple melee — thrown 30/120.",{wpn:{dmg:"1d6",dtype:"piercing"}}],
["Light Hammer","G","Simple melee — thrown 20/60.",{wpn:{dmg:"1d4",dtype:"bludgeoning"}}],
["Mace","G","Simple melee.",{wpn:{dmg:"1d6",dtype:"bludgeoning"}}],
["Quarterstaff","G","Simple melee — versatile (1d8).",{wpn:{dmg:"1d6",dtype:"bludgeoning"}}],
["Sickle","G","Simple melee.",{wpn:{dmg:"1d4",dtype:"slashing"}}],
["Spear","G","Simple melee — thrown 20/60, versatile (1d8).",{wpn:{dmg:"1d6",dtype:"piercing"}}],
["Light Crossbow","G","Simple ranged 80/320.",{wpn:{dmg:"1d8",dtype:"piercing",rng:1}}],
["Dart","G","Simple ranged 20/60 — finesse.",{wpn:{dmg:"1d4",dtype:"piercing",rng:1}}],
["Shortbow","G","Simple ranged 80/320.",{wpn:{dmg:"1d6",dtype:"piercing",rng:1}}],
["Sling","G","Simple ranged 30/120.",{wpn:{dmg:"1d4",dtype:"bludgeoning",rng:1}}],
["Battleaxe","G","Martial melee — versatile (1d10).",{wpn:{dmg:"1d8",dtype:"slashing"}}],
["Flail","G","Martial melee.",{wpn:{dmg:"1d8",dtype:"bludgeoning"}}],
["Glaive","G","Martial melee — reach 10 ft, two-handed.",{wpn:{dmg:"1d10",dtype:"slashing"}}],
["Greataxe","G","Martial melee — two-handed.",{wpn:{dmg:"1d12",dtype:"slashing"}}],
["Greatsword","G","Martial melee — two-handed.",{wpn:{dmg:"2d6",dtype:"slashing"}}],
["Halberd","G","Martial melee — reach 10 ft, two-handed.",{wpn:{dmg:"1d10",dtype:"slashing"}}],
["Lance","G","Martial melee — reach 10 ft, mounted.",{wpn:{dmg:"1d10",dtype:"piercing"}}],
["Longsword","G","Martial melee — versatile (1d10).",{wpn:{dmg:"1d8",dtype:"slashing"}}],
["Maul","G","Martial melee — two-handed.",{wpn:{dmg:"2d6",dtype:"bludgeoning"}}],
["Morningstar","G","Martial melee.",{wpn:{dmg:"1d8",dtype:"piercing"}}],
["Pike","G","Martial melee — reach 10 ft, two-handed.",{wpn:{dmg:"1d10",dtype:"piercing"}}],
["Rapier","G","Martial melee — finesse.",{wpn:{dmg:"1d8",dtype:"piercing",fin:1}}],
["Scimitar","G","Martial melee — finesse, light.",{wpn:{dmg:"1d6",dtype:"slashing",fin:1}}],
["Shortsword","G","Martial melee — finesse, light.",{wpn:{dmg:"1d6",dtype:"piercing",fin:1}}],
["Trident","G","Martial melee — thrown 20/60, versatile (1d8).",{wpn:{dmg:"1d6",dtype:"piercing"}}],
["War Pick","G","Martial melee.",{wpn:{dmg:"1d8",dtype:"piercing"}}],
["Warhammer","G","Martial melee — versatile (1d10).",{wpn:{dmg:"1d8",dtype:"bludgeoning"}}],
["Whip","G","Martial melee — finesse, reach 10 ft.",{wpn:{dmg:"1d4",dtype:"slashing",fin:1}}],
["Blowgun","G","Martial ranged 25/100.",{wpn:{dmg:"1",dtype:"piercing",rng:1}}],
["Hand Crossbow","G","Martial ranged 30/120 — light.",{wpn:{dmg:"1d6",dtype:"piercing",rng:1}}],
["Heavy Crossbow","G","Martial ranged 100/400 — two-handed.",{wpn:{dmg:"1d10",dtype:"piercing",rng:1}}],
["Longbow","G","Martial ranged 150/600 — two-handed.",{wpn:{dmg:"1d8",dtype:"piercing",rng:1}}],
["Padded Armor","G","Light armor — AC 11 + DEX; Stealth DIS.",{armor:{ac:11,cat:"light"}}],
["Leather Armor","G","Light armor — AC 11 + DEX.",{armor:{ac:11,cat:"light"}}],
["Studded Leather","G","Light armor — AC 12 + DEX.",{armor:{ac:12,cat:"light"}}],
["Hide Armor","G","Medium armor — AC 12 + DEX (max 2).",{armor:{ac:12,cat:"medium"}}],
["Chain Shirt","G","Medium armor — AC 13 + DEX (max 2).",{armor:{ac:13,cat:"medium"}}],
["Scale Mail","G","Medium armor — AC 14 + DEX (max 2); Stealth DIS.",{armor:{ac:14,cat:"medium"}}],
["Breastplate","G","Medium armor — AC 14 + DEX (max 2).",{armor:{ac:14,cat:"medium"}}],
["Half Plate","G","Medium armor — AC 15 + DEX (max 2); Stealth DIS.",{armor:{ac:15,cat:"medium"}}],
["Ring Mail","G","Heavy armor — AC 14; Stealth DIS.",{armor:{ac:14,cat:"heavy"}}],
["Chain Mail","G","Heavy armor — AC 16; STR 13; Stealth DIS.",{armor:{ac:16,cat:"heavy"}}],
["Splint Armor","G","Heavy armor — AC 17; STR 15; Stealth DIS.",{armor:{ac:17,cat:"heavy"}}],
["Plate Armor","G","Heavy armor — AC 18; STR 15; Stealth DIS.",{armor:{ac:18,cat:"heavy"}}],
["Shield","G","+2 AC while wielded.",{acB:2}],
["Potion of Healing","C","Drink: regain 2d4+2 HP.",{heal:"2d4+2",c:1}],
["Spell Scroll (Cantrip)","C","Cast the inscribed cantrip; scroll crumbles.",{c:1}],
["Spell Scroll (1st Level)","C","Cast the inscribed 1st-level spell (DC 13, +5).",{c:1}],
["Potion of Healing (Greater)","U","Drink: regain 4d4+4 HP.",{heal:"4d4+4",c:1}],
["Potion of Fire Breath","U","Drink: bonus-action 30-ft fire exhale, DC 13 DEX, 4d6 fire (3 uses, ends after 1 hr).",{c:1}],
["Potion of Resistance","U","Drink: resistance to one damage type for 1 hour.",{c:1}],
["Potion of Animal Friendship","U","Drink: cast Animal Friendship (DC 13) at will for 1 hour.",{c:1}],
["Potion of Growth","U","Drink: Enlarge effect for 1d4 hours.",{c:1}],
["Potion of Water Breathing","U","Drink: breathe underwater for 1 hour.",{c:1}],
["Potion of Hill Giant Strength","U","Drink: Strength 21 for 1 hour.",{c:1}],
["Oil of Slipperiness","U","Coat: Freedom of Movement 8 hrs, or grease a 10-ft square.",{c:1}],
["Spell Scroll (2nd Level)","U","Cast the inscribed 2nd-level spell (DC 13, +5).",{c:1}],
["Spell Scroll (3rd Level)","U","Cast the inscribed 3rd-level spell (DC 15, +7).",{c:1}],
["Dust of Disappearance","U","Throw: 10-ft radius of creatures turn Invisible for 2d4 minutes.",{c:1}],
["Elemental Gem","U","Crush: summon the bound elemental.",{c:1}],
["Alchemy Jug","U","Produces a chosen liquid each day (water, mayonnaise, acid…)."],
["Amulet of Proof against Detection and Location","U","Wearer hidden from divination magic."],
["Bag of Holding","U","Holds 500 lb in an extradimensional space."],
["Boots of Elvenkind","U","Steps make no sound; ADV on Stealth to move silently."],
["Boots of Striding and Springing","U","Speed 30 ft; jump distance ×3."],
["Bracers of Archery","U","Proficiency with bows; +2 damage with them."],
["Brooch of Shielding","U","Immune to Magic Missile; resist force damage."],
["Cloak of Elvenkind","U","Hood up: ADV on Stealth; sight checks to spot you have DIS."],
["Cloak of Protection","U","+1 AC and saving throws while worn.",{acB:1}],
["Decanter of Endless Water","U","Pours stream/geyser of water on command."],
["Driftglobe","U","Hovering globe casts Light or Daylight."],
["Eyes of the Eagle","U","ADV on sight-based Perception checks."],
["Gauntlets of Ogre Power","U","Strength becomes 19."],
["Gloves of Missile Snaring","U","Reaction: reduce ranged weapon damage by 1d10+DEX; catch at 0."],
["Goggles of Night","U","Darkvision 60 ft."],
["Hat of Disguise","U","Cast Disguise Self at will."],
["Headband of Intellect","U","Intelligence becomes 19."],
["Immovable Rod","U","Button: rod fixes in place, holds 8,000 lb."],
["Javelin of Lightning","U","Throw as lightning bolt: line 4d6 lightning, DC 13 DEX (recharges at dawn).",{wpn:{dmg:"1d6",dtype:"piercing"}}],
["Keoghtom's Ointment","U","Apply a dose: heal 2d8+2, cure poison and disease (1d4+1 doses).",{heal:"2d8+2",ch:3}],
["Lantern of Revealing","U","Light reveals invisible creatures and objects."],
["Mithral Armor","U","Armor without Stealth disadvantage or STR requirement."],
["Pearl of Power","U","Regain one expended spell slot (3rd or lower) once per dawn."],
["Ring of Jumping","U","Cast Jump on yourself at will."],
["Ring of Mind Shielding","U","Immune to thought-reading; soul enters ring on death."],
["Ring of Swimming","U","Swim speed 40 ft."],
["Rope of Climbing","U","60-ft rope moves and knots on command."],
["Sending Stones","U","Paired stones: one Sending message per dawn."],
["Slippers of Spider Climbing","U","Climb walls and ceilings, hands free."],
["Stone of Good Luck","U","+1 to ability checks and saving throws."],
["Wand of Magic Detection","U","Cast Detect Magic (3 charges, 1d3 at dawn).",{ch:3}],
["Wand of Magic Missiles","U","Cast Magic Missile; more charges = higher level (7 charges).",{ch:7}],
["Wand of Secrets","U","Charge: sense nearest secret door or trap within 30 ft (3 charges).",{ch:3}],
["Wand of Web","U","Cast Web, DC 15 (7 charges).",{ch:7}],
["Weapon, +1","U","+1 to attack and damage rolls.",{wpn:{dmg:"1d8",dtype:"slashing",b:1}}],
["Shield, +1","U","+1 bonus to AC (stacks with shield's +2).",{acB:3}],
["Winged Boots","U","Fly speed equal to walking, 4 hours per day."],
["Ammunition, +1 (each)","U","+1 to attack and damage; bonus lost after hit.",{c:1}],
["Bag of Tricks","U","Pull a fuzzy object: becomes a random beast until dawn."],
["Circlet of Blasting","U","Cast Scorching Ray (+5) once per dawn."],
["Deck of Illusions","U","Draw a card: creates an illusory creature.",{ch:34}],
["Dust of Dryness","U","Pinch absorbs 15-ft cube of water into a pellet.",{c:1}],
["Dust of Sneezing and Choking","U","Cloud: DC 15 CON or Incapacitated, suffocating.",{c:1}],
["Eversmoking Bottle","U","Unstopper: 60-ft radius of heavy smoke."],
["Helm of Comprehending Languages","U","Cast Comprehend Languages at will."],
["Instrument of the Bards (Doss Lute)","U","Charm-focused spells while playing; +bard casting."],
["Medallion of Thoughts","U","Cast Detect Thoughts, DC 13 (3 charges, 1d3 at dawn).",{ch:3}],
["Necklace of Adaptation","U","Breathe normally in any environment."],
["Periapt of Health","U","Immune to disease."],
["Periapt of Wound Closure","U","Stabilize automatically at 0 HP; double natural healing."],
["Pipes of Haunting","U","3 charges: fearsome music, DC 15 WIS or Frightened.",{ch:3}],
["Quiver of Ehlonna","U","Three compartments hold far more than they should."],
["Ring of Water Walking","U","Walk on liquid surfaces."],
["Robe of Useful Items","U","Tear off patches that become real objects.",{ch:8}],
["Saddle of the Cavalier","U","Can't be dislodged from mount; ADV vs. it isn't granted."],
["Trident of Fish Command","U","Cast Dominate Beast (DC 15) on water creatures (3 charges).",{ch:3}],
["Potion of Healing (Superior)","R","Drink: regain 8d4+8 HP.",{heal:"8d4+8",c:1}],
["Potion of Clairvoyance","R","Drink: Clairvoyance effect.",{c:1}],
["Potion of Diminution","R","Drink: Reduce effect for 1d4 hours.",{c:1}],
["Potion of Gaseous Form","R","Drink: Gaseous Form for 1 hour.",{c:1}],
["Potion of Frost Giant Strength","R","Drink: Strength 23 for 1 hour.",{c:1}],
["Potion of Heroism","R","Drink: 10 temp HP + Bless for 1 hour.",{c:1}],
["Potion of Invisibility","R","Drink: Invisible for 1 hour.",{c:1}],
["Potion of Mind Reading","R","Drink: Detect Thoughts effect.",{c:1}],
["Elixir of Health","R","Drink: cures disease, poison, and conditions; no HP.",{c:1}],
["Oil of Etherealness","R","Coat: Etherealness for 1 hour.",{c:1}],
["Spell Scroll (4th/5th Level)","R","Cast the inscribed spell (DC 17, +9).",{c:1}],
["Amulet of Health","R","Constitution becomes 19."],
["Armor of Resistance","R","Resistance to one damage type while worn."],
["Armor, +1","R","+1 bonus to AC."],
["Bag of Beans","R","Plant a bean: wildly random magical effect.",{ch:6}],
["Bead of Force","R","Throw: 3d4 force + sphere imprisons, DC 15 DEX.",{c:1}],
["Belt of Dwarvenkind","R","CON +2 (max 20), dwarven traits, ADV vs. poison."],
["Boots of Levitation","R","Cast Levitate on self at will."],
["Boots of Speed","R","Click heels: double speed, no opportunity attacks (10 min/day)."],
["Bracers of Defense","R","+2 AC while unarmored and shieldless.",{acB:2}],
["Cape of the Mountebank","R","Cast Dimension Door once per dawn."],
["Chime of Opening","R","Strike: opens one lock/latch within 120 ft (10 uses).",{ch:10}],
["Cloak of Displacement","R","Attacks against you have DIS until you take damage."],
["Cloak of the Bat","R","ADV on Stealth; fly in dim light; become a bat."],
["Cube of Force","R","Barrier cube, 36 charges to power different faces.",{ch:36}],
["Daern's Instant Fortress","R","Cube grows into an adamantine tower."],
["Dagger of Venom","R","+1 dagger; coat blade: DC 15 CON or 2d10 poison + Poisoned.",{wpn:{dmg:"1d4",dtype:"piercing",fin:1,b:1}}],
["Dimensional Shackles","R","Manacles prevent all extradimensional travel."],
["Dragon Slayer","R","+1 sword; +3d6 damage vs. dragons.",{wpn:{dmg:"1d8",dtype:"slashing",b:1}}],
["Flame Tongue","R","Command: flaming blade, +2d6 fire damage.",{wpn:{dmg:"1d8",dtype:"slashing",extra:"2d6",extraType:"fire"}}],
["Gem of Seeing","R","3 charges: Truesight 120 ft for 10 min.",{ch:3}],
["Giant Slayer","R","+1 weapon; +2d6 vs. giants, DC 15 STR or prone.",{wpn:{dmg:"1d8",dtype:"slashing",b:1}}],
["Glamoured Studded Leather","R","+1 studded leather; changes appearance on command."],
["Helm of Teleportation","R","Cast Teleport (3 charges, 1d3 at dawn).",{ch:3}],
["Horn of Blasting","R","Blow: 30-ft cone, 5d6 thunder + Deafened, DC 15 CON."],
["Horseshoes of Speed","R","Mount's speed +30 ft."],
["Ioun Stone (Protection)","R","Orbits head: +1 AC.",{acB:1}],
["Mace of Disruption","R","+2d6 radiant vs. fiends/undead; can destroy weak undead (DC 15 WIS).",{wpn:{dmg:"1d6",dtype:"bludgeoning",extra:"2d6",extraType:"radiant"}}],
["Mace of Smiting","R","+1 mace, +3 vs. constructs; crits deal +7.",{wpn:{dmg:"1d6",dtype:"bludgeoning",b:1}}],
["Mace of Terror","R","3 charges: 30-ft fear burst, DC 15 WIS.",{ch:3,ch:3,wpn:{dmg:"1d6",dtype:"bludgeoning"}}],
["Mantle of Spell Resistance","R","ADV on saves vs. spells."],
["Necklace of Fireballs","R","Throw beads as Fireballs (DC 15); beads are the charges.",{ch:6}],
["Periapt of Proof against Poison","R","Immune to poison damage and the Poisoned condition."],
["Portable Hole","R","Cloth unfolds into a 10-ft-deep extradimensional pit."],
["Quaal's Feather Token","R","Single-use token: anchor, tree, whip, fan, or swan boat.",{c:1}],
["Ring of Evasion","R","3 charges: turn a failed DEX save into a success.",{ch:3}],
["Ring of Feather Falling","R","Fall slowly; no fall damage."],
["Ring of Free Action","R","Ignore difficult terrain; immune to magical speed reduction, Paralyzed, Restrained."],
["Ring of Protection","R","+1 AC and saving throws.",{acB:1}],
["Ring of Resistance","R","Resistance to one damage type."],
["Ring of Spell Storing","R","Stores up to 5 levels of spells for the wearer to cast."],
["Ring of the Ram","R","Charges: spectral ram attack, 2d10 force per charge (3 charges).",{ch:3}],
["Ring of X-ray Vision","R","See through solid matter, 30 ft."],
["Robe of Eyes","R","See all directions, Darkvision 120 ft, see invisible."],
["Rope of Entanglement","R","Command: DC 15 DEX or Restrained."],
["Shield, +2","R","+2 bonus to AC.",{acB:4}],
["Staff of Fire","R","Burning Hands, Fireball, Wall of Fire (10 charges, DC 15).",{ch:10}],
["Staff of Healing","R","Cure Wounds, Lesser Restoration, Mass Cure Wounds (10 charges).",{ch:10}],
["Staff of the Python","R","Throw: becomes a giant constrictor snake."],
["Sun Blade","R","+2 sunlight longsword, radiant damage, +1d8 vs. undead.",{wpn:{dmg:"1d8",dtype:"radiant",fin:1,b:2}}],
["Sword of Life Stealing","R","Crits: target takes 3d6 extra necrotic; you gain 10 temp HP.",{wpn:{dmg:"1d8",dtype:"slashing"}}],
["Sword of Wounding","R","Wounds can't heal while it sticks; ongoing 1d4 bleed.",{wpn:{dmg:"1d8",dtype:"slashing"}}],
["Vicious Weapon","R","Crits deal +7 damage.",{wpn:{dmg:"1d8",dtype:"slashing"}}],
["Wand of Binding","R","Hold Monster / Hold Person, DC 17 (7 charges).",{ch:7}],
["Wand of Enemy Detection","R","Sense hostile creatures within 60 ft (7 charges).",{ch:7}],
["Wand of Fear","R","Command or fear cone, DC 15 (7 charges).",{ch:7}],
["Wand of Fireballs","R","Cast Fireball, DC 15; extra charges upcast (7 charges).",{ch:7}],
["Wand of Lightning Bolts","R","Cast Lightning Bolt, DC 15 (7 charges).",{ch:7}],
["Wand of Paralysis","R","Ray: DC 15 CON or Paralyzed 1 min (7 charges).",{ch:7}],
["Wand of Wonder","R","Random chaotic effect (7 charges).",{ch:7}],
["Weapon, +2","R","+2 to attack and damage rolls.",{wpn:{dmg:"1d8",dtype:"slashing",b:2}}],
["Wings of Flying","R","Cloak becomes wings: fly 60 ft for 1 hour per dawn."],
["Potion of Healing (Supreme)","V","Drink: regain 10d4+20 HP.",{heal:"10d4+20",c:1}],
["Potion of Cloud Giant Strength","V","Drink: Strength 27 for 1 hour.",{c:1}],
["Potion of Flying","V","Drink: fly speed for 1 hour.",{c:1}],
["Potion of Invulnerability","V","Drink: resistance to all damage for 1 minute.",{c:1}],
["Potion of Speed","V","Drink: Haste for 1 minute, no concentration.",{c:1}],
["Potion of Vitality","V","Drink: removes exhaustion, disease, poison; max HP from Hit Dice 24 hrs.",{c:1}],
["Oil of Sharpness","V","Coat a weapon: +3 attack and damage for 1 hour.",{c:1}],
["Spell Scroll (6th/7th Level)","V","Cast the inscribed spell (DC 18/19).",{c:1}],
["Amulet of the Planes","V","Cast Plane Shift (DC 15 INT to arrive on target)."],
["Animated Shield","V","Bonus action: shield floats and guards you hands-free.",{acB:2}],
["Armor, +2","V","+2 bonus to AC."],
["Belt of Fire Giant Strength","V","Strength becomes 25."],
["Carpet of Flying","V","Flying carpet, up to 80 ft speed."],
["Cloak of Arachnida","V","Spider climb, resist poison, cast Web, immune to webs."],
["Crystal Ball","V","Cast Scrying (DC 17) while touching it."],
["Dancing Sword","V","Bonus action: sword fights on its own nearby.",{wpn:{dmg:"1d8",dtype:"slashing"}}],
["Dragon Scale Mail","V","+1 scale mail; ADV vs. dragon fear/breath; resist one element."],
["Dwarven Plate","V","+2 plate; reduce forced movement by 10 ft."],
["Dwarven Thrower","V","+3 warhammer; thrown 20/60, returns; +1d8 (2d8 vs. giants).",{wpn:{dmg:"1d8",dtype:"bludgeoning",b:3}}],
["Frost Brand","V","+1d6 cold sword; resist fire; extinguishes flames.",{wpn:{dmg:"1d8",dtype:"slashing",extra:"1d6",extraType:"cold"}}],
["Helm of Brilliance","V","Gem-studded: fire/daylight spells until gems are spent.",{ch:10}],
["Horn of Valhalla (Bronze)","V","Blow: summons 4d4+4 berserker spirits (once per week)."],
["Ioun Stone (Mastery)","V","Orbits head: +1 proficiency bonus."],
["Manual of Bodily Health","V","Read over 6 days: CON +2 permanently.",{c:1}],
["Mirror of Life Trapping","V","Traps beholders of the mirror in extradimensional cells."],
["Nine Lives Stealer","V","+2 sword; crit vs. low-HP target: DC 15 CON or die (9 charges).",{ch:9,ch:9,wpn:{dmg:"1d8",dtype:"slashing",b:2}}],
["Oathbow","V","Sworn enemy: ADV, +3d6 piercing, ignore cover/range.",{wpn:{dmg:"1d8",dtype:"piercing",rng:1}}],
["Ring of Regeneration","V","Regain 1d6 HP every 10 min; regrow lost limbs."],
["Ring of Shooting Stars","V","Faerie fire, ball lightning, shooting stars (6 charges).",{ch:6}],
["Ring of Telekinesis","V","Cast Telekinesis at will."],
["Robe of Stars","V","+1 saves; pluck stars as 5d4 force bolts (6/day); enter Astral Plane.",{ch:6}],
["Rod of Absorption","V","Absorb targeted spells into stored levels (max 50)."],
["Rod of Alertness","V","+1 initiative and Perception; detect and protective auras."],
["Scimitar of Speed","V","+2 scimitar; attack with it as a bonus action.",{wpn:{dmg:"1d6",dtype:"slashing",fin:1,b:2}}],
["Spellguard Shield","V","ADV on saves vs. spells; spell attacks vs. you have DIS."],
["Staff of Frost","V","Ice Storm, Cone of Cold, Wall of Ice (10 charges, DC 15).",{ch:10}],
["Staff of Power","V","+2 quarterstaff & spell attacks; blast spells; retributive strike (20 charges).",{ch:20}],
["Staff of Thunder and Lightning","V","Thunderbolt strikes and storm powers (10 charges).",{ch:10}],
["Sword of Sharpness","V","Max weapon dice vs. objects; crits can sever limbs.",{wpn:{dmg:"1d8",dtype:"slashing"}}],
["Wand of Polymorph","V","Cast Polymorph, DC 15 (7 charges).",{ch:7}],
["Weapon, +3","V","+3 to attack and damage rolls.",{wpn:{dmg:"1d8",dtype:"slashing",b:3}}],
["Shield, +3","V","+3 bonus to AC.",{acB:5}],
["Armor, +3","L","+3 bonus to AC."],
["Cloak of Invisibility","L","Hood up: Invisible (2 hours of use per day)."],
["Defender","L","+3 sword; shift up to +3 between attack and AC each turn.",{wpn:{dmg:"1d8",dtype:"slashing",b:3}}],
["Hammer of Thunderbolts","L","+1 (or +3 attuned w/ giant items); giant's bane, thunder crack.",{wpn:{dmg:"2d6",dtype:"bludgeoning",b:1}}],
["Holy Avenger","L","+3 sword; +2d10 radiant vs. fiends/undead; aura of saves.",{wpn:{dmg:"1d8",dtype:"slashing",b:3}}],
["Iron Flask","L","Trap an extraplanar creature inside; command it when released."],
["Luck Blade","L","+1 sword, +1 saves; reroll one d20 per dawn; wishes.",{ch:3,ch:3,wpn:{dmg:"1d8",dtype:"slashing",b:1}}],
["Plate Armor of Etherealness","L","Cast Etherealness once per dawn (10 min)."],
["Ring of Djinni Summoning","L","Summon a friendly djinni for 1 hour per dawn."],
["Ring of Invisibility","L","Turn Invisible at will."],
["Ring of Three Wishes","L","Cast Wish (3 charges, not replenished).",{ch:3}],
["Robe of the Archmagi","L","AC 15+DEX; ADV vs. spells; +2 spell DC and attacks."],
["Rod of Lordly Might","L","+3 mace that transforms: flame tongue, axe, spear, ram, ladder.",{ch:6}],
["Sphere of Annihilation","L","2-ft void that obliterates all matter it touches."],
["Staff of the Magi","L","+2 quarterstaff; spell absorption; huge spell list (50 charges).",{ch:50}],
["Talisman of Pure Good","L","Holy talisman; consecrated strikes vs. evil (7 charges).",{ch:7}],
["Vorpal Sword","L","+3 sword; ignores slashing resistance; crits can behead.",{wpn:{dmg:"1d8",dtype:"slashing",b:3}}],
["Well of Many Worlds","L","Cloth opens a portal to another random plane."],
];
const RARITY_NAME = { G: "Gear", C: "Common", U: "Uncommon", R: "Rare", V: "Very rare", L: "Legendary" };
const rarityLabel = (it) => (it.rarity === "G" ? (it.wpn ? "Weapon" : "Armor") : RARITY_NAME[it.rarity] || "");
const ITEMS = ITEMS_RAW.map(([n, r, d, x]) => ({ n, rarity: r, d, ...(x || {}) }))
  .sort((a, b) => "GCURVL".indexOf(a.rarity) - "GCURVL".indexOf(b.rarity) || a.n.localeCompare(b.n));
const lookupItem = (name) => {
  const s = String(name).trim().toLowerCase();
  const hit = ITEMS.find((i) => i.n.toLowerCase() === s) || ITEMS.find((i) => i.n.toLowerCase().includes(s) && s.length > 3);
  return hit ? JSON.parse(JSON.stringify(hit)) : null;
};
const lootObj = (x) => (typeof x === "string" ? { n: x } : x);
const lootName = (x) => { const it = lootObj(x); return it.n + (it.ch != null ? ` (${it.ch} charge${it.ch === 1 ? "" : "s"})` : ""); };

/* weapon items in a monster's loot become real attacks; removed items take their attack with them */
function syncWeaponAttacks(c, logs) {
  if (c.type !== "monster") return;
  const items = (c.loot || []).map(lootObj);
  const wantNames = items.filter((i) => i.wpn).map((i) => i.n);
  const removed = (c.actions || []).filter((a) => a.fromItem && !wantNames.includes(a.fromItem));
  removed.forEach((a) => logs.push(`<b>${c.name}</b> no longer wields <b>${a.fromItem}</b> — attack removed.`));
  c.actions = (c.actions || []).filter((a) => !a.fromItem || wantNames.includes(a.fromItem));
  for (const it of items) {
    if (!it.wpn || c.actions.some((a) => a.fromItem === it.n)) continue;
    const str = c.mods?.str ?? 0, dex = c.mods?.dex ?? 0;
    const mod = it.wpn.rng ? dex : it.wpn.fin ? Math.max(str, dex) : str;
    const prof = Math.max(2, 2 + Math.floor((crToNum(c.cr) - 1) / 4));
    const b = it.wpn.b || 0;
    const dm = mod + b;
    c.actions.push({
      n: it.n, kind: "atk", hit: prof + mod + b,
      dmg: `${it.wpn.dmg}${dm ? (dm > 0 ? `+${dm}` : `${dm}`) : ""}`,
      dtype: it.wpn.dtype, extra: it.wpn.extra, extraType: it.wpn.extraType,
      d: it.d, fromItem: it.n, ready: true,
    });
    logs.push(`<b>${c.name}</b> wields <b>${it.n}</b> — added to attacks (${fmtMod(prof + mod + b)} to hit).`);
  }
  syncArmor(c, logs);
}

function equipArmorAt(c, idx, logs) {
  const it = lootObj(c.loot[idx]);
  if (!it.armor) return;
  if (c.acPreArmor == null) c.acPreArmor = c.ac;
  const dex = c.mods?.dex ?? 0;
  const part = it.armor.cat === "light" ? dex : it.armor.cat === "medium" ? Math.min(dex, 2) : 0;
  const newAc = it.armor.ac + (it.armor.b || 0) + part;
  c.loot = c.loot.map((x, i) => {
    const o = lootObj(x);
    if (i === idx) return { ...o, eq: true };
    if (o.armor && o.eq) return { ...o, eq: false };
    return x;
  });
  logs.push(`<b>${c.name}</b> dons <b>${it.n}</b> — AC ${c.ac}→${newAc}.`);
  c.ac = newAc;
}

/* keeps AC honest: auto-equips carried body armor only when it IMPROVES AC (a monster
   won't swap plate for leather); restores AC if worn armor is taken away */
function syncArmor(c, logs) {
  const items = (c.loot || []).map(lootObj);
  if (items.some((i) => i.armor && i.eq)) return;
  const dex = c.mods?.dex ?? 0;
  const acOf = (it) => it.armor.ac + (it.armor.b || 0) + (it.armor.cat === "light" ? dex : it.armor.cat === "medium" ? Math.min(dex, 2) : 0);
  let bestIdx = -1, bestAc = -1;
  items.forEach((it, i) => { if (it.armor && !it.stowed && acOf(it) > bestAc) { bestAc = acOf(it); bestIdx = i; } });
  if (bestIdx !== -1) {
    if (bestAc > c.ac) { equipArmorAt(c, bestIdx, logs); return; }
    // decline the downgrade, once per item
    c.loot = c.loot.map((x) => {
      const o = lootObj(x);
      if (o.armor && !o.eq && !o.stowed) {
        logs.push(`<b>${c.name}</b> stows the ${o.n} (wearing it would drop AC ${c.ac}→${acOf(o)}) — Equip manually to override.`);
        return { ...o, stowed: true };
      }
      return x;
    });
    return;
  }
  if (!items.some((i) => i.armor) && c.acPreArmor != null) {
    logs.push(`<b>${c.name}</b>'s armor is gone — AC ${c.ac}→${c.acPreArmor}.`);
    c.ac = c.acPreArmor;
    c.acPreArmor = null;
  }
}

/* ---------------- combatant construction ---------------- */
let UID = 1;
const newUid = () => `c${UID++}_${Date.now().toString(36)}`;

function autoName(base, list) {
  const same = list.filter((c) => c.baseName === base);
  if (same.length === 0) return { name: base, renumber: false };
  return { name: `${base} ${same.length + 1}`, renumber: same.length === 1 };
}

function makeMonster(sb, state, opts = {}) {
  const list = state.combatants;
  const base = sb.name;
  let name = opts.name;
  let renumber = false;
  if (!name) { const r = autoName(base, list); name = r.name; renumber = r.renumber; }
  if (renumber) {
    // first duplicate: rename the existing one to "Base 1"
    const first = list.find((c) => c.baseName === base && c.name === base);
    if (first) first.name = `${base} 1`;
  }
  const dexMod = sb.mods?.dex ?? 0;
  const init = d20(dexMod, opts.advMode || "none");
  const m = {
    uid: newUid(), type: "monster", side: opts.side || "enemy",
    baseName: base, name, cr: sb.cr || null,
    ac: sb.ac, acReaction: (sb.reactions || []).find((r) => r.acBonus) || null, acBoost: 0,
    hp: opts.hp ?? sb.hp, maxHp: opts.hp ?? sb.hp, hpF: sb.hpF || null, spd: sb.spd || "30 ft",
    mods: sb.mods || {}, saves: sb.saves || {},
    resist: sb.resist || [], immune: sb.immune || [], vuln: sb.vuln || [], condImmune: sb.condImmune || [],
    traits: sb.traits || [], multi: sb.multi || null,
    actions: (sb.actions || []).map((a) => normalizeAction({ ...a, ready: true })),
    bonus: sb.bonus || [], reactions: sb.reactions || [],
    legendary: sb.legendary ? { max: sb.legendary.count, rem: sb.legendary.count, options: sb.legendary.options || [] } : null,
    legRes: sb.legRes ? { max: sb.legRes, rem: sb.legRes } : null,
    init: init.total, initText: `Initiative ${init.text}`,
    conditions: [], concentration: null, reaction: true, advMode: "none", advVs: "none",
    dead: false, unconscious: false, ds: { s: 0, f: 0 }, stable: false, notes: opts.notes || "", loot: sb.loot ? sb.loot.map((x) => (typeof x === "string" ? x : { ...x })) : [],
  };
  {
    const blob = ["traits", "actions", "bonus", "reactions"].flatMap((s2) => (m[s2] || []).map((x) => x.d || "")).join(" ");
    const mdc = blob.match(/spell save DC (\d+)/);
    const mat = blob.match(/([+-]\d+) to hit with spell attacks/);
    m.spellDC = mdc ? +mdc[1] : null;
    m.spellAtk = mat ? +mat[1] : null;
    const isCaster = ["traits", "actions", "bonus"].some((s2) => (m[s2] || []).some((x) => /Spellcasting/.test(x.n || "")));
    m.spellStyle = !isCaster ? null
      : /replace (?:one|two|any|a|an|\d+) (?:of (?:its|these) )?attacks? with a use of Spellcasting/i.test(m.multi || "") ? "replace"
      : "action";
  }
  m.uses = buildUses(m);
  m.spellUses = buildSpellUses(m);
  const ab = parseAtkBudget(m.multi, m.actions);
  m.atkMax = ab.max; m.atkCaps = ab.caps;
  m.atkUsed = 0; m.atkUsedBy = {}; m.atkGrant = 0;
  return m;
}

function makePlayer({ name, init, ac, side, hp, pp }) {
  const hpN = hp != null && hp !== "" ? Number(hp) : null;
  const initN = init == null || init === "" || isNaN(Number(init)) ? null : Number(init);
  const ppN = pp != null && pp !== "" ? Number(pp) : null;
  return {
    uid: newUid(), type: "player", side: side || "ally", baseName: name, name,
    ac: ac ?? null, acBoost: 0, acReaction: null, pp: ppN,
    hp: hpN, maxHp: hpN, init: initN, initText: null,
    conditions: [], concentration: null, reaction: true, advMode: "none", advVs: "none",
    dead: false, unconscious: false, ds: { s: 0, f: 0 }, stable: false,
    mods: {}, saves: {},
    resist: [], immune: [], vuln: [], loot: [],
    traits: [], actions: [], reactions: [], legendary: null, legRes: null, notes: "",
  };
}

function makeEffect({ name, init, rounds, desc }) {
  return {
    uid: newUid(), type: "effect", side: "effect", baseName: name, name,
    init: Number(init) || 20, rounds: rounds ?? null, desc: desc || "",
    conditions: [], dead: false, unconscious: false, reaction: false, advMode: "none", advVs: "none",
    ac: null, hp: null, maxHp: null, acBoost: 0, acReaction: null, concentration: null,
    mods: {}, saves: {}, resist: [], immune: [], vuln: [], traits: [], actions: [], reactions: [],
    legendary: null, legRes: null, notes: "", loot: [],
  };
}

function makeObject({ name, ac, hp }) {
  const hpN = hp != null && hp !== "" ? Number(hp) : null;
  return {
    uid: newUid(), type: "object", side: "effect", baseName: name, name,
    ac: ac != null && ac !== "" ? Number(ac) : null, acBoost: 0, acReaction: null, pp: null,
    hp: hpN, maxHp: hpN, init: null, initText: null,
    conditions: [], concentration: null, reaction: false, advMode: "none", advVs: "none",
    dead: false, unconscious: false, ds: { s: 0, f: 0 }, stable: false,
    mods: {}, saves: {}, resist: [], immune: ["poison", "psychic"], vuln: [], condImmune: [],
    traits: [], actions: [], bonus: [], reactions: [], legendary: null, legRes: null, notes: "", loot: [],
  };
}

const USES_RE = /\((\d+)\/Day(?: Each)?\)/i;
function buildUses(m) {
  const u = {};
  for (const [tag, arr] of [["t", m.traits], ["a", m.actions], ["b", m.bonus], ["r", m.reactions]]) {
    (arr || []).forEach((x, i) => { const mm = USES_RE.exec(x.n || ""); if (mm) u[tag + i] = { max: +mm[1], rem: +mm[1], n: x.n }; });
  }
  return Object.keys(u).length ? u : null;
}

function buildSpellUses(m) {
  const u = {};
  const scan = (txt) => {
    if (!txt) return;
    const re = /(\d+)\/Day Each:\s*([^]*?)(?=\d+\/Day Each:|At Will:|$)/gi;
    let mm;
    while ((mm = re.exec(txt))) {
      const n = +mm[1];
      mm[2].split(",").forEach((raw) => {
        const name = raw.replace(/\([^)]*\)/g, "").trim().replace(/\.$/, "");
        const k = name.toLowerCase();
        if (SPELL_REF[k]) u[k] = { max: n, rem: n };
      });
    }
  };
  for (const arr of [m.traits, m.actions, m.bonus, m.reactions]) (arr || []).forEach((x) => scan(x.d));
  return Object.keys(u).length ? u : null;
}

const NUMW = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 };
function parseAtkBudget(multi, actions) {
  const atkNames = (actions || []).filter((a) => a.kind === "atk" && a.hit != null).map((a) => a.n);
  const mkCaps = (n) => { const o = {}; atkNames.forEach((nm) => (o[nm] = n)); return o; };
  if (!multi) return { max: 1, caps: mkCaps(1) };
  if (/as many .* attacks/i.test(multi)) return { max: 6, caps: mkCaps(6) };
  multi = multi.replace(/replace (?:one|two|three|four|\d+) (?:of (?:its|these) )?attacks?/gi, "replace");
  const namesIn = (seg) => {
    const out = [];
    seg.split(/\s+or\s+|\s+and\s+|,\s*/i).forEach((tok) => {
      tok = tok.trim();
      const hit = atkNames.find((an) => tok === an || tok.startsWith(an) || an.startsWith(tok));
      if (hit && !out.includes(hit)) out.push(hit);
    });
    return out;
  };
  const branches = multi.split(/,?\s*or (?:it )?makes\b/i);
  let best = 0; const caps = {};
  const bump = (nm, n) => { caps[nm] = Math.max(caps[nm] || 0, n); };
  branches.forEach((br, bi) => {
    if (bi > 0) br = "makes " + br;
    let n = 0; const seen = new Set();
    const direct = br.match(/\bmakes? (one|two|three|four|five|six|\d+) attacks?\b(?:,? using ([^.]*?) in any combination)?/i);
    if (direct) {
      n = NUMW[direct[1].toLowerCase()] || parseInt(direct[1], 10);
      const nms = direct[2] ? namesIn(direct[2]) : atkNames;
      nms.forEach((nm) => { bump(nm, n); seen.add(nm); });
    } else {
      for (const mm of br.matchAll(/\b(one|two|three|four|five|six|\d+) ([\w'\u2019 ]{0,45}?)attacks?\b(?:,? using ([^.]*?) in any combination)?/g)) {
        const k = NUMW[mm[1].toLowerCase()] || parseInt(mm[1], 10);
        n += k;
        let nms;
        if (/\bother\b/.test(mm[2]) || !mm[2].trim()) nms = mm[3] ? namesIn(mm[3]) : atkNames.filter((x) => !seen.has(x));
        else nms = namesIn(mm[2]);
        nms.forEach((nm) => { bump(nm, k); seen.add(nm); });
      }
    }
    for (const mm of br.matchAll(/\buses ([A-Z][\w'\u2019 ]+?)( twice| three times)?(?=[,.]|$| and | or )/g)) {
      const nm2 = mm[1].trim();
      const hit = atkNames.find((an) => an === nm2 || nm2.startsWith(an));
      if (hit) { const k = mm[2] ? (/twice/.test(mm[2]) ? 2 : 3) : 1; n += k; bump(hit, (caps[hit] || 0) + k); seen.add(hit); }
    }
    best = Math.max(best, n);
  });
  const max = best || 1;
  atkNames.forEach((nm) => { if (caps[nm] == null) caps[nm] = max; });
  return { max, caps };
}

const vsState = (t) => (t.advVs && t.advVs !== "none" ? t.advVs : (condAdvVs(t) || {}).mode || "none");
const combineAdv = (aMode, tMode) => {
  const adv = aMode === "adv" || tMode === "adv";
  const dis = aMode === "dis" || tMode === "dis";
  return adv && dis ? "none" : adv ? "adv" : dis ? "dis" : "none";
};
const atkMaxOf = (c) => c.atkMax ?? parseAtkBudget(c.multi, c.actions).max;
const atkLeft = (c) => atkMaxOf(c) + (c.atkGrant || 0) - (c.atkUsed || 0);
const atkNameLeft = (c, name) => {
  const caps = c.atkCaps || parseAtkBudget(c.multi, c.actions).caps;
  const cap = (caps[name] != null ? caps[name] : atkMaxOf(c)) + (c.atkGrant || 0);
  return cap - ((c.atkUsedBy || {})[name] || 0);
};

const targetWorth = (t) => t.maxHp != null || vsState(t) !== "none";
const targetCands = (state, attacker) =>
  state.combatants.filter((x) => !x.dead && x.uid !== attacker.uid && x.type !== "effect" && x.type !== "object");

const sideRank = (c) => (c.side === "ally" ? 0 : c.side === "effect" ? 1 : 2);
function sortOrder(list) {
  return [...list].sort((a, b) => ((b.init ?? -999) - (a.init ?? -999)) || (sideRank(a) - sideRank(b)) || 0);
}

/* convert a live combatant back into a reusable statblock */
function statblockFromCombatant(c) {
  const sb = {
    name: c.baseName || c.name, cr: c.cr || undefined, ac: c.ac, hp: c.maxHp, hpF: c.hpF || undefined,
    spd: c.spd || undefined, mods: c.mods || {}, saves: Object.keys(c.saves || {}).length ? c.saves : undefined,
    resist: c.resist?.length ? c.resist : undefined, immune: c.immune?.length ? c.immune : undefined,
    vuln: c.vuln?.length ? c.vuln : undefined, condImmune: c.condImmune?.length ? c.condImmune : undefined,
    traits: c.traits?.length ? c.traits : undefined, multi: c.multi || undefined,
    actions: (c.actions || []).map(({ ready, ...a }) => a),
    bonus: c.bonus?.length ? c.bonus : undefined,
    reactions: c.reactions?.length ? c.reactions : undefined,
    legendary: c.legendary ? { count: c.legendary.max, options: c.legendary.options } : undefined,
    legRes: c.legRes ? c.legRes.max : undefined,
    loot: c.loot?.length ? c.loot : undefined,
  };
  return JSON.parse(JSON.stringify(sb)); // strip undefined
}

/* ---------------- core combat logic (pure-ish helpers) ---------------- */
const DTYPES = ["slashing","piercing","bludgeoning","fire","cold","lightning","thunder","acid","poison","necrotic","radiant","psychic","force"];

function conMod(c) { return c.saves?.con ?? c.mods?.con ?? 0; }
function saveMod(c, ab) { const k = ab.toLowerCase(); return c.saves?.[k] ?? c.mods?.[k] ?? 0; }

// returns {finalDmg, tag} applying resist/immune/vuln; tag describes the adjustment
function adjustDamage(c, amt, dtype) {
  if (!dtype) return { finalDmg: amt, tag: null };
  const t = dtype.toLowerCase();
  if ((c.immune || []).some((x) => x.toLowerCase() === t)) return { finalDmg: 0, tag: "immune" };
  if ((c.resist || []).some((x) => x.toLowerCase() === t)) return { finalDmg: Math.floor(amt / 2), tag: "resist, ½" };
  if ((c.vuln || []).some((x) => x.toLowerCase() === t)) return { finalDmg: amt * 2, tag: "vulnerable, ×2" };
  return { finalDmg: amt, tag: null };
}

/* death saving throws (2024 rules) — kind: success | fail | crit | nat20 | stabilize | reset */
function applyDeathSave(c, kind, logs, toasts) {
  c.ds = c.ds || { s: 0, f: 0 };
  if (kind === "reset") { c.ds = { s: 0, f: 0 }; c.stable = false; logs.push(`<b>${c.name}</b> death saves reset.`); return; }
  if (kind === "stabilize") { c.stable = true; c.ds = { s: 0, f: 0 }; logs.push(`<b>${c.name}</b> is <b>stable</b> (unconscious at 0 HP, no more death saves).`); toasts.push({ kind: "good", text: `${c.name} is stable.` }); return; }
  if (kind === "nat20") {
    c.hp = 1; c.unconscious = false; c.stable = false; c.ds = { s: 0, f: 0 };
    logs.push(`<b>${c.name}</b> rolls a NAT 20 on a death save — back up with 1 HP!`);
    toasts.push({ kind: "good", text: `${c.name} is back up with 1 HP!` });
    return;
  }
  if (kind === "success") {
    c.ds.s += 1;
    if (c.ds.s >= 3) { c.stable = true; c.ds = { s: 0, f: 0 }; logs.push(`<b>${c.name}</b>: 3 successes — <b>stable</b>.`); toasts.push({ kind: "good", text: `${c.name} is stable.` }); }
    else logs.push(`<b>${c.name}</b> death save success (${c.ds.s}✓ ${c.ds.f}✗).`);
    return;
  }
  const n = kind === "crit" ? 2 : 1;
  c.stable = false;
  c.ds.f += n;
  if (c.ds.f >= 3) {
    c.dead = true;
    logs.push(`<b>${c.name}</b>: 3 death save failures — <b>dies</b>.`);
    toasts.push({ kind: "bad", text: `${c.name} has died.` });
  } else logs.push(`<b>${c.name}</b> death save failure${n === 2 ? " ×2 (crit)" : ""} (${c.ds.s}✓ ${c.ds.f}✗).`);
}

/* Applies damage to combatant IN PLACE (on a cloned state). Returns log lines + toasts. */
/* 2024 rules: temp HP doesn't stack — keep the higher value; healing never restores it */
function grantTempHp(c, amt, logs) {
  if (c.hp == null || amt <= 0) return;
  if ((c.thp || 0) >= amt) {
    logs.push(`<b>${c.name}</b> keeps existing ${c.thp} temp HP (higher than ${amt} offered — temp HP doesn't stack).`);
  } else {
    logs.push(`<b>${c.name}</b> gains <b>${amt} temp HP</b>${c.thp ? ` (replacing ${c.thp})` : ""}.`);
    c.thp = amt;
  }
}

function applyDamage(c, amt, dtype, logs, toasts) {
  if (c.type === "player" && c.hp == null) {
    logs.push(`${amt}${dtype ? " " + dtype : ""} → <b>${c.name}</b> — players track their own HP.`);
    if (c.concentration) {
      const dc = Math.max(10, Math.floor(amt / 2));
      toasts.push({ kind: "bad", text: `${c.name}: DC ${dc} CON save to keep concentrating on ${concLabel(c)}!` });
      logs.push(`<b>${c.name}</b>: concentration check needed — DC ${dc} CON save (${concLabel(c)}).`);
    }
    return;
  }
  const { finalDmg, tag } = adjustDamage(c, amt, dtype);
  // temp HP shell absorbs first (after resist/vuln, per RAW)
  let absorbed = 0;
  if ((c.thp || 0) > 0 && finalDmg > 0) {
    absorbed = Math.min(c.thp, finalDmg);
    c.thp -= absorbed;
  }
  const through = finalDmg - absorbed;
  const absTag = absorbed ? ` (${absorbed} absorbed${c.thp ? `, ${c.thp} temp left` : ", shell gone"})` : "";
  const before = c.hp;
  if (before === 0 && c.unconscious && !c.dead) {
    if (through > 0) {
      logs.push(`${amt} ${dtype || "dmg"} → <b>${c.name}</b> (already at 0 HP)${tag ? ` (${tag})` : ""}${absTag} — damage while down = death save failure.`);
      applyDeathSave(c, "fail", logs, toasts);
      toasts.push({ kind: "bad", text: `${c.name} took damage while down — 1 death save failure (make it 2 if it was a crit).` });
    } else if (finalDmg > 0) {
      logs.push(`${amt} ${dtype || "dmg"} → <b>${c.name}</b>${absTag} — temp HP held; no death save failure.`);
    }
    return;
  }
  c.hp = Math.max(0, c.hp - through);
  logs.push(`${amt} ${dtype || "dmg"} → <b>${c.name}</b>${tag ? ` (${tag})` : ""}${absTag} = ${finalDmg} · HP ${before}→${c.hp}`);
  const half = Math.floor(c.maxHp / 2);
  if (before > half && c.hp <= half && c.hp > 0) logs.push(`<b>${c.name}</b> is <b>Bloodied</b>.`);
  if (c.hp === 0 && before > 0) {
    if (c.type === "object") { c.dead = true; logs.push(`<b>${c.name}</b> is <b>destroyed</b>!`); toasts.push({ kind: "good", text: `${c.name} is destroyed!` }); return; }
    if (c.side === "enemy") { c.dead = true; c.thp = 0; c.concentration = null; logs.push(`<b>${c.name}</b> dies.`); toasts.push({ kind: "bad", text: `${c.name} is dead.` }); }
    else { c.unconscious = true; c.concentration = null; c.ds = { s: 0, f: 0 }; c.stable = false; logs.push(`<b>${c.name}</b> falls unconscious.`); toasts.push({ kind: "bad", text: `${c.name} is unconscious — death saves!` }); }
    return;
  }
  if (finalDmg > 0 && c.concentration) {
    const dc = Math.max(10, Math.floor(finalDmg / 2));
    if (c.type === "player" && c.mods?.con == null) {
      toasts.push({ kind: "bad", text: `${c.name}: DC ${dc} CON save to keep concentrating on ${concLabel(c)}!` });
      logs.push(`<b>${c.name}</b>: concentration check needed — DC ${dc} CON save (${concLabel(c)}).`);
      return;
    }
    const r = d20(conMod(c), c.advMode);
    const pass = r.total >= dc;
    logs.push(`<b>${c.name}</b> concentration check (DC ${dc}): ${r.text} — <b>${pass ? "HOLDS" : "FAILS"}</b>${pass ? "" : ` — loses ${c.concentration}`}`);
    toasts.push({ kind: pass ? "good" : "bad", text: `${c.name}: concentration on ${concLabel(c)} ${pass ? "holds" : "BROKEN"} (${r.text} vs DC ${dc})` });
    if (!pass) c.concentration = null;
  }
}

function applyHeal(c, amt, logs) {
  if (c.type === "player" && c.hp == null) { logs.push(`${amt} healing → <b>${c.name}</b> — players track their own HP.`); return; }
  const before = c.hp;
  c.hp = Math.min(c.maxHp, c.hp + amt);
  if (c.dead && c.hp > 0) { c.dead = false; c.ds = { s: 0, f: 0 }; c.stable = false; logs.push(`<b>${c.name}</b> healed ${amt} — back up! HP ${before}→${c.hp}`); return; }
  if (c.unconscious && c.hp > 0) { c.unconscious = false; c.ds = { s: 0, f: 0 }; c.stable = false; logs.push(`<b>${c.name}</b> healed ${amt} — conscious again. HP ${before}→${c.hp}`); return; }
  logs.push(`${amt} healing → <b>${c.name}</b> · HP ${before}→${c.hp}`);
}

/* Turn-start bookkeeping for combatant entering its turn. Mutates. */
/* --- advantage-trigger helpers --- */
function normalizeAction(a) {
  // Rescue attacks that failed to parse into rollable form (e.g. Roper's Tentacle).
  if ((!a.kind || a.kind === "text") && a.d) {
    const m = a.d.match(/(?:Melee|Ranged) Attack Roll:\s*\+?(\d+)/i);
    if (m) { a.kind = "atk"; a.hit = Number(m[1]); }
  }
  // Fold unconditional "plus N (XdY) Type damage" riders stuck in text into the auto-rolled extra.
  if (a.kind === "atk" && !a.extra && a.d) {
    let m = a.d.match(/plus \d+ \((\d+d\d+(?:\s*[+-]\s*\d+)?)\) (\w+) damage/i);
    if (m && m[2].toLowerCase() !== "damage") { a.extra = m[1].replace(/\s+/g, ""); a.extraType = m[2].toLowerCase(); }
    else {
      m = a.d.match(/plus \d+ \((\d+d\d+(?:\s*[+-]\s*\d+)?)\) damage of the type chosen/i);
      if (m) { a.extra = m[1].replace(/\s+/g, ""); a.extraType = "chosen type"; }
    }
  }
  return a;
}

function condDamage(a) {
  // Conditional/alternate damage trapped in description text (charge riders, bloodied bonuses, swarm alt dice).
  if (a.kind !== "atk" || !a.d) return [];
  const out = []; const seen = new Set();
  const norm = (s) => s.replace(/\s+/g, "");
  const push = (dice, dtype, alt) => {
    dice = norm(dice); dtype = dtype.toLowerCase();
    const key = `${dice}:${dtype}:${alt}`;
    if (seen.has(key)) return;
    if (!alt && a.extra && norm(a.extra) === dice && (a.extraType || "").toLowerCase() === dtype) return;
    seen.add(key); out.push({ dice, dtype, alt });
  };
  let m;
  const exRe = /extra \d+ \((\d+d\d+(?:\s*[+-]\s*\d+)?)\) (\w+) damage/gi;
  while ((m = exRe.exec(a.d))) push(m[1], m[2], false);
  const altRe = /or \d+ \((\d+d\d+(?:\s*[+-]\s*\d+)?)\) (\w+) damage (?:if|when)\b/gi;
  while ((m = altRe.exec(a.d))) push(m[1], m[2], true);
  return out;
}

function extraNeedsAdv(a) {
  return !!(a && a.extra && a.d && /if the attack roll (?:had|has) Advantage/i.test(a.d));
}
function advHints(c, a) {
  const hints = [];
  if (a && a.d) {
    const m = a.d.match(/with Advantage if ([^).]+)/i);
    if (m) hints.push({ t: `⊕ ADV if ${m[1].trim()}`, desc: `This attack is made with Advantage if ${m[1].trim()}. Set the creature's ADV toggle before rolling.` });
  }
  if (extraNeedsAdv(a)) hints.push({ t: `⊕ +${a.extra} ${a.extraType || ""} only if ADV`.trim(), desc: `The extra ${a.extra} ${a.extraType || ""} damage is rolled automatically only when the attack is made with Advantage — otherwise it's left off.` });
  (c && c.traits || []).forEach((t) => {
    if (t.d && /Advantage on (?:an )?attack roll/i.test(t.d)) hints.push({ t: `⊕ ${t.n}`, desc: t.d });
  });
  return hints;
}

/* ---- SPELL COMPENDIUM: all 339 spells from SRD 5.2.1.
   Keyed by lowercase name. Fields: n name, m level/school/classes, ct/rg/cp/du stat lines, d full text.
   spellRefsIn() lights up every spell named in any scanned text. ---- */
const SPELL_MATCHER = new RegExp("\\b(" + Object.values(SPELL_REF).map((s) => s.n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).sort((a, b) => b.length - a.length).join("|") + ")\\b", "g");
function spellRefsIn(text, { requireCast = true } = {}) {
  if (!text) return [];
  if (requireCast && !/\bcasts?\b|\bSpellcasting\b/i.test(text)) return [];
  const found = []; const seen = new Set();
  text.replace(SPELL_MATCHER, (m, name, off) => {
    if (name === "Light" && /(Bright|Dim|Sun)\s*$/.test(text.slice(Math.max(0, off - 7), off))) return m;
    if (name === "Fly" && /^\s*Speed/.test(text.slice(off + 3, off + 10))) return m;
    const k = name.toLowerCase();
    if (!seen.has(k)) { seen.add(k); found.push(k); }
    return m;
  });
  return found;
}
const XP_BY_CR = { 0: 10, 0.125: 25, 0.25: 50, 0.5: 100, 1: 200, 2: 450, 3: 700, 4: 1100, 5: 1800, 6: 2300, 7: 2900, 8: 3900, 9: 5000, 10: 5900, 11: 7200, 12: 8400, 13: 10000, 14: 11500, 15: 13000, 16: 15000, 17: 18000, 18: 20000, 19: 22000, 20: 25000, 21: 33000, 22: 41000, 23: 50000, 24: 62000, 25: 75000, 26: 90000, 30: 155000 };
const XP_BUDGET_PER_CHAR = { 1: 75, 2: 150, 3: 225, 4: 375, 5: 750, 6: 1000, 7: 1300, 8: 1700, 9: 2000, 10: 2300, 11: 2900, 12: 3700, 13: 4200, 14: 5000, 15: 5400, 16: 6100, 17: 7200, 18: 8700, 19: 10700, 20: 13200 };
const crNumOf = (cr) => { cr = String(cr || "0").split(" ")[0]; if (cr.includes("/")) { const [a, b] = cr.split("/"); return +a / +b; } return +cr || 0; };
const ENC_TEMPLATE_DESC = {
  "Horde": "Six-ish weak monsters. Action-economy pressure — players feel powerful cutting through them, but can get swarmed if they split up.",
  "Skirmish": "A few weak monsters led by something mid-tier. The classic mixed patrol — varied threats without overwhelming anyone.",
  "Elites": "Two heavy hitters. Fewer enemy turns but bigger swings — positioning and focus-fire decisions matter.",
  "Boss + minions": "One strong monster screened by expendables. The minions soak attacks and protect the boss from being focus-fired down turn one.",
  "Pyramid": "A full warband — one leader, two lieutenants, three grunts. The most varied mix: lots of turns, threats at every tier, something for everyone to fight.",
  "Solo boss": "One big creature, legendary if the lair has one. Showcases legendary actions and resistances — dramatic, but swingy.",
};
const ENC_TEMPLATES = {
  "Horde": [["weak", 6]],
  "Skirmish": [["weak", 3], ["mid", 1]],
  "Elites": [["strong", 2]],
  "Boss + minions": [["strong", 1], ["weak", 4]],
  "Pyramid": [["strong", 1], ["mid", 2], ["weak", 3]],
  "Solo boss": [["solo", 1]],
};
function suggestEncounter({ biome, level, size, difficulty, template, balanced, rng }) {
  const R = rng || Math.random;
  const pool = (ENCOUNTER_POOLS[biome] || []).map((n) => {
    const sb = BESTIARY.find((b) => b.name === n);
    return sb ? { name: n, cr: crNumOf(sb.cr), leg: !!sb.legendary, xp: XP_BY_CR[crNumOf(sb.cr)] || 10 } : null;
  }).filter(Boolean);
  if (!pool.length) return { picks: [], note: "No pool for this lair." };
  const L = Math.max(1, Math.min(20, level));
  const bands = balanced
    ? { weak: (c) => c.cr <= Math.max(0.5, L / 3), mid: (c) => c.cr > L / 4 && c.cr <= L, strong: (c) => c.cr > L / 3 && c.cr <= L * 1.6 + 2, solo: (c) => c.cr >= L * 0.8 && c.cr <= L * 2 + 4 }
    : null;
  const budget = (XP_BUDGET_PER_CHAR[L] || 225) * size * ({ low: 0.5, moderate: 1, high: 1.5 }[difficulty] || 1);
  const strict = { weak: [0.02, 0.16], mid: [0.14, 0.4], strong: [0.3, 0.75], solo: [0.6, 1.15] };
  const picks = []; let spent = 0; let note = "";
  const slots = ENC_TEMPLATES[template] || ENC_TEMPLATES["Skirmish"];
  for (const [band, count] of slots) {
    for (let i = 0; i < count; i++) {
      let cands;
      if (balanced) {
        cands = pool.filter(bands[band]);
        if (band === "solo") { const legs = cands.filter((c) => c.leg); if (legs.length) cands = legs; }
        if (!cands.length) cands = pool.filter((c) => band === "weak" ? c.cr <= L : c.cr >= L / 4);
      } else {
        const [lo, hi] = strict[band];
        cands = pool.filter((c) => c.xp >= budget * lo && c.xp <= budget * hi && spent + c.xp <= budget * 1.2);
        if (band === "solo") { const legs = cands.filter((c) => c.leg); if (legs.length) cands = legs; }
        if (!cands.length) cands = pool.filter((c) => c.xp <= budget * hi * 1.5 && spent + c.xp <= budget * 1.25);
        if (!cands.length) { note = "Budget too tight for more — lineup trimmed."; continue; }
      }
      if (!cands.length) continue;
      const prev = picks.length && band === "weak" ? picks.find((p) => p.band === "weak") : null;
      const c = prev && cands.some((x) => x.name === prev.name) && R() < 0.7
        ? cands.find((x) => x.name === prev.name)
        : cands[Math.floor(R() * cands.length)];
      picks.push({ name: c.name, cr: c.cr, xp: c.xp, band });
      spent += c.xp;
    }
  }
  return { picks, budget: balanced ? null : Math.round(budget), spent: balanced ? null : spent, note };
}

function spellSaveDmg(text, ratio) {
  const TYPES = ["acid","bludgeoning","cold","fire","force","lightning","necrotic","piercing","poison","psychic","radiant","slashing","thunder"];
  let dice = null, dtype = "";
  for (const mm of (text || "").matchAll(/(\d+d\d+(?:\s*[+-]\s*\d+)?) (\w+) damage/g)) {
    if (TYPES.includes(mm[2].toLowerCase())) { dice = mm[1]; dtype = mm[2].toLowerCase(); break; }
  }
  if (!dice) {
    const mm = (text || "").match(/(\d+d\d+(?:\s*[+-]\s*\d+)?) damage of the chosen type/);
    if (mm) dice = mm[1];
  }
  if (!dice) return null;
  return {
    dmg: scaleDice(dice.replace(/\s/g, ""), ratio || 1),
    dtype,
    half: /half as much damage on a successful/i.test(text || ""),
  };
}

function spellCondFrom(text, du) {
  const m = (text || "").match(/ha(?:s|ve) the (\w+) condition/);
  if (!m || !CONDITIONS[m[1]]) return null;
  let condR = null;
  if (/until the end of its next turn/i.test(text)) condR = 1;
  else if (/Concentration/i.test(du || "")) condR = 10;
  else { const mm = (du || "").match(/(\d+) minute/); if (mm) condR = +mm[1] * 10; else if (/1 round/i.test(du || "")) condR = 1; }
  return { cond: m[1], condR };
}

const singleTargetText = (t) => /\b(?:one|a|an) (?:willing )?(?:creature|target|humanoid|beast|person|giant)\b|creature (?:that )?(?:you|it) (?:can see|touch)/i.test(t || "") && !/each creature/i.test(t || "");

function legSaveRef(o) {
  if (!o.d) return null;
  const m = o.d.match(/(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma) Saving Throw:\s*DC (\d+)/);
  if (!m) return null;
  const dm = o.d.match(/Failure:\s*\d+ \(([d\d+ ]+)\) (\w+) damage/);
  return {
    ab: m[1].slice(0, 3).toLowerCase(), dc: +m[2],
    dmg: dm ? dm[1].replace(/\s/g, "") : "", dtype: dm ? dm[2].toLowerCase() : "",
    half: /Success:\s*Half/i.test(o.d), single: singleTargetText(o.d), rpt: /repeats the save/i.test(o.d),
    ...(spellCondFrom(o.d, /until the end of its next turn/i.test(o.d) ? "1 round" : "") || {}),
  };
}

function legAttackRefs(c, o) {
  const out = [];
  (c.actions || []).forEach((a, ai) => {
    if (a.kind === "atk" && a.hit != null && o.d &&
        new RegExp(`\\b${a.n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(o.d)) out.push({ ai, name: a.n });
  });
  return out;
}

const concLabel = (c) => (c.concentration === "CONC" ? "their spell" : c.concentration);

function onTurnStart(c, state, logs, toasts) {
  if (c.type === "effect") {
    if (c.rounds != null) {
      c.rounds -= 1;
      if (c.rounds <= 0) {
        logs.push(`Effect <b>${c.name}</b> expires.`);
        toasts.push({ kind: "good", text: `${c.name} has expired.` });
        c._expired = true;
      } else logs.push(`Effect <b>${c.name}</b>: ${c.rounds} round${c.rounds === 1 ? "" : "s"} remaining.`);
    }
    return;
  }
  c.reaction = true;
  c.acBoost = 0;
  c.atkUsed = 0; c.atkUsedBy = {}; c.atkGrant = 0;
  if (c.legendary) c.legendary.rem = c.legendary.max;
  // hazards fire before durations tick (players get a popup instead — handled in the UI)
  if (c.type === "monster" && !c.dead && c.conditions.some((x) => x.name === "Burning")) {
    const r = ri(4);
    logs.push(`🔥 <b>${c.name}</b> is Burning (${r}(d4) fire):`);
    applyDamage(c, r, "fire", logs, toasts);
  }
  if (c.type === "monster" && !c.dead && c.conditions.some((x) => x.name === "Suffocating")) {
    logs.push(`🫁 <b>${c.name}</b> is Suffocating — +1 Exhaustion level at the end of this turn.`);
    toasts.push({ kind: "bad", text: `${c.name} is suffocating — +1 Exhaustion at end of turn.` });
  }
  // recharge rolls (results recorded for the UI to render as dice)
  state.rechargeRolls = [];
  (c.actions || []).forEach((a, ai) => {
    if (a.rech && !a.ready) {
      const r = ri(6);
      a.ready = r >= a.rech;
      state.rechargeRolls.push({ uid: c.uid, ai, v: r, ok: a.ready, need: a.rech });
      logs.push(`<b>${c.name}</b> — ${a.n} recharge (${r}(d6)) — <b>${a.ready ? "RECHARGED" : "failed"}</b>`);
      toasts.push({ kind: a.ready ? "good" : "bad", text: `${a.n} recharge (${r}(d6)) — ${a.ready ? "recharged!" : "failed"}` });
    }
  });
}

/* advance turn; skips dead. Returns new state fields. Mutates state clone. */
function tickConditionsAtTurnEnd(c, logs) {
  if (!c || !c.conditions) return;
  c.conditions = c.conditions.filter((cd) => {
    if (cd.rounds == null) return true;
    cd.rounds -= 1;
    if (cd.rounds <= 0) { logs.push(`<b>${c.name}</b>: ${cd.name} ends (end of turn).`); return false; }
    return true;
  });
}

function advanceTurn(state, logs, toasts, dir = 1) {
  const order = sortOrder(state.combatants);
  if (order.length === 0) return;
  let idx = order.findIndex((c) => c.uid === state.activeUid);
  if (idx === -1) idx = 0;
  if (dir === 1) tickConditionsAtTurnEnd(order[idx], logs);
  for (let hop = 0; hop < order.length + 1; hop++) {
    idx += dir;
    if (idx >= order.length) { idx = 0; if (dir === 1) { state.round += 1; logs.push(`— <b>Round ${state.round}</b> —`); } }
    if (idx < 0) { idx = order.length - 1; state.round = Math.max(1, state.round - 1); }
    const c = order[idx];
    if (c.dead || c.type === "object") continue;
    state.activeUid = c.uid;
    if (dir === 1) {
      onTurnStart(c, state, logs, toasts);
      if (c._expired) { state.combatants = state.combatants.filter((x) => x.uid !== c.uid); advanceTurnFrom(state, order, idx, logs, toasts); return; }
      logs.push(`▶ <b>${c.name}</b>'s turn.`);
    }
    return;
  }
}
function advanceTurnFrom(state, order, idx, logs, toasts) {
  // called after an effect expired mid-advance: continue to next living combatant
  for (let hop = 0; hop < order.length + 1; hop++) {
    idx += 1;
    if (idx >= order.length) { idx = 0; state.round += 1; logs.push(`— <b>Round ${state.round}</b> —`); }
    const c = order[idx];
    if (!c || c.dead || c._expired || c.type === "object") continue;
    state.activeUid = c.uid;
    onTurnStart(c, state, logs, toasts);
    logs.push(`▶ <b>${c.name}</b>'s turn.`);
    return;
  }
}

/* ---------------- name resolution ---------------- */
function findTargets(state, ref) {
  if (!ref) return [];
  if (Array.isArray(ref)) return ref.flatMap((r) => findTargets(state, r));
  const s = String(ref).trim().toLowerCase();
  let hit = state.combatants.filter((c) => c.uid === ref || c.name.toLowerCase() === s);
  if (hit.length) return hit;
  hit = state.combatants.filter((c) => c.name.toLowerCase().startsWith(s));
  if (hit.length) return hit;
  return state.combatants.filter((c) => c.name.toLowerCase().includes(s));
}

/* ---------------- AI command executor ---------------- */

/* ---------------- AI chat ---------------- */

/* ---------------- encounter balancing (offline, 2024 DMG math) ---------------- */
/* XP budget per character: [low, moderate, high] (2024 DMG) */
const XP_BUDGET = {
  1:[50,75,100], 2:[100,150,200], 3:[150,225,400], 4:[250,375,500], 5:[500,750,1100],
  6:[600,1000,1400], 7:[750,1300,1700], 8:[1000,1700,2100], 9:[1300,2000,2600], 10:[1600,2300,3100],
  11:[1900,2900,4100], 12:[2200,3700,4700], 13:[2600,4200,5400], 14:[2900,4900,6200], 15:[3300,5400,7800],
  16:[3800,6100,9800], 17:[4500,7200,11700], 18:[5000,8700,14200], 19:[5500,10700,17200], 20:[6400,13200,22000],
};
const CR_STEPS = [
  ["0",0.0625,10],["1/8",0.125,25],["1/4",0.25,50],["1/2",0.5,100],["1",1,200],["2",2,450],["3",3,700],
  ["4",4,1100],["5",5,1800],["6",6,2300],["7",7,2900],["8",8,3900],["9",9,5000],["10",10,5900],
  ["11",11,7200],["12",12,8400],["13",13,10000],["14",14,11500],["15",15,13000],["16",16,15000],
  ["17",17,18000],["18",18,20000],["19",19,22000],["20",20,25000],["21",21,33000],
];
function crToNum(cr) {
  const s = String(cr ?? "1").trim();
  const hit = CR_STEPS.find(([label]) => label === s);
  if (hit) return hit[1];
  const n = parseFloat(s);
  return isNaN(n) ? 1 : n;
}
function xpToCr(xp) {
  let best = CR_STEPS[0];
  for (const step of CR_STEPS) if (Math.abs(step[2] - xp) < Math.abs(best[2] - xp)) best = step;
  return best; // [label, num, xp]
}
const avgOfFormula = (f) => {
  const s = String(f ?? "").replace(/\s/g, "");
  if (/^-?\d+$/.test(s)) return parseInt(s, 10);
  const m = s.match(/^(\d*)d(\d+)([+-]\d+)?$/i);
  if (!m) return 0;
  const n = parseInt(m[1] || "1", 10), d = parseInt(m[2], 10), mod = parseInt(m[3] || "0", 10);
  return n * (d + 1) / 2 + mod;
};
function scaleDice(f, ratio) {
  const s = String(f ?? "").replace(/\s/g, "");
  if (/^-?\d+$/.test(s)) return String(Math.max(1, Math.round(parseInt(s, 10) * ratio)));
  const m = s.match(/^(\d*)d(\d+)([+-]\d+)?$/i);
  if (!m) return f;
  const n = parseInt(m[1] || "1", 10), d = parseInt(m[2], 10), mod = parseInt(m[3] || "0", 10);
  const n2 = Math.max(1, Math.round(n * ratio));
  const mod2 = Math.round(mod * ratio);
  return `${n2}d${d}${mod2 ? (mod2 > 0 ? `+${mod2}` : `${mod2}`) : ""}`;
}
const attackCount = (multi) => {
  if (!multi) return 1;
  if (/four|4/i.test(multi)) return 4;
  if (/three|3/i.test(multi)) return 3;
  if (/two|2/i.test(multi)) return 2;
  return 2;
};
const ROLE_WEIGHT = { weak: 0.6, avg: 1, strong: 2.2 };

/* Deterministic proposal: distribute the party's XP budget across monsters by role,
   map each share to a target CR, then scale each monster's own stats toward it. */
function computeBalance(state, party, roles) {
  const monsters = state.combatants.filter((c) => c.type === "monster" && c.side === "enemy" && !c.dead);
  if (monsters.length === 0) return { note: "No living enemies to balance.", proposal: [] };
  const lvl = Math.min(20, Math.max(1, party.level));
  const diffIx = party.difficulty === "low" ? 0 : party.difficulty === "high" ? 2 : 1;
  const budget = XP_BUDGET[lvl][diffIx] * Math.max(1, party.size);
  const wsum = monsters.reduce((a, c) => a + (ROLE_WEIGHT[roles[c.uid]] || 1), 0);
  const proposal = [];
  let spent = 0;
  for (const c of monsters) {
    const share = budget * (ROLE_WEIGHT[roles[c.uid]] || 1) / wsum;
    const [tLabel, tNum] = xpToCr(share);
    spent += xpToCr(share)[2];
    const cNum = crToNum(c.cr);
    const k = (tNum + 0.75) / (cNum + 0.75); // HP & damage scale ~linearly with CR
    const hpRatio = k, dprRatio = k;
    const newHp = Math.max(1, Math.round(c.maxHp * hpRatio));
    const dAtk = Math.round((tNum - cNum) * 0.5);
    const dAc = Math.max(-3, Math.min(3, Math.round((tNum - cNum) * 0.4)));
    const newAc = c.ac + dAc;
    // strong loners get multiattack once they hit CR 2+
    const atkActions = (c.actions || []).filter((a) => a.kind === "atk");
    let newMulti = c.multi;
    let addedMulti = false;
    let atkN = attackCount(c.multi);
    if (roles[c.uid] === "strong" && !c.multi && atkActions.length > 0 && tNum >= 2) {
      newMulti = `Makes two ${atkActions[0].n} attacks.`;
      addedMulti = true; atkN = 2;
    }
    const perAtkRatio = dprRatio / (addedMulti ? 2 : 1);
    const trivial = Math.abs(hpRatio - 1) < 0.13 && Math.abs(perAtkRatio - 1) < 0.13 && dAtk === 0 && dAc === 0 && !addedMulti;
    if (trivial) { proposal.push({ uid: c.uid, target: c.name, ok: true, summary: `already on target (~CR ${tLabel})` }); continue; }
    const bits = [];
    const newActions = (c.actions || []).map((a) => {
      const na = { ...a };
      if (a.kind === "atk") {
        na.hit = a.hit + dAtk;
        na.dmg = scaleDice(a.dmg, perAtkRatio);
        if (a.extra) na.extra = scaleDice(a.extra, perAtkRatio);
        if (na.dmg !== a.dmg || na.hit !== a.hit)
          bits.push(`${a.n} ${fmtMod(a.hit)}→${fmtMod(na.hit)} (${a.dmg}→${na.dmg}${a.extra ? ` +${a.extra}→${na.extra} ${a.extraType}` : ""})`);
      }
      if (a.save?.dc) {
        na.save = { ...a.save, dc: a.save.dc + dAtk };
        if (a.dmg) na.dmg = scaleDice(a.dmg, dprRatio);
        if (na.save.dc !== a.save.dc) bits.push(`${a.n} DC ${a.save.dc}→${na.save.dc}`);
      }
      return na;
    });
    const patch = { ac: newAc, hp: newHp, maxHp: newHp, actions: newActions, cr: tLabel };
    if (dAtk !== 0) {
      const shiftText = (txt) => (txt || "")
        .replace(/spell save DC (\d+)/g, (_, n) => `spell save DC ${+n + dAtk}`)
        .replace(/([+-])(\d+) to hit with spell attacks/g, (_, sg, n) => `${fmtMod((sg === "-" ? -+n : +n) + dAtk)} to hit with spell attacks`);
      const retext = (arr) => (arr || []).map((x) => ({ ...x, d: shiftText(x.d) }));
      if (c.spellDC != null) {
        patch.spellDC = c.spellDC + dAtk;
        patch.spellAtk = c.spellAtk != null ? c.spellAtk + dAtk : null;
        patch.traits = retext(c.traits);
        patch.actions = retext(patch.actions);
        patch.bonus = c.bonus ? retext(c.bonus) : c.bonus;
        patch.reactions = c.reactions ? retext(c.reactions) : c.reactions;
        bits.push(`spell save DC ${c.spellDC}→${patch.spellDC}${c.spellAtk != null ? `, spell attack ${fmtMod(c.spellAtk)}→${fmtMod(patch.spellAtk)}` : ""}`);
      }
      if (c.spellDC != null && Math.abs(dprRatio - 1) >= 0.13) {
        patch.spellDmgRatio = (c.spellDmgRatio || 1) * dprRatio;
        bits.push(`spell damage ×${dprRatio.toFixed(1)}`);
        if (dprRatio < 0.6) bits.push(`(consider skipping its highest-level spells)`);
      }
      if (c.legendary && c.legendary.options?.some((o) => /Saving Throw:\s*DC \d+/.test(o.d || ""))) {
        patch.legendary = { ...c.legendary, options: c.legendary.options.map((o) => ({
          ...o, d: (o.d || "").replace(/Saving Throw:\s*DC (\d+)/g, (_, n) => `Saving Throw: DC ${+n + dAtk}`),
        })) };
        bits.push(`legendary save DCs ${dAtk > 0 ? "+" : ""}${dAtk}`);
      }
    }
    if (addedMulti) { patch.multi = newMulti; bits.push("adds Multiattack (two attacks)"); }
    const summary = [
      `CR ${c.cr ?? "?"}→${tLabel}`,
      newAc !== c.ac ? `AC ${c.ac}→${newAc}` : null,
      newHp !== c.maxHp ? `HP ${c.maxHp}→${newHp}` : null,
      ...bits,
    ].filter(Boolean).join(", ");
    proposal.push({ uid: c.uid, target: c.name, summary, patch });
  }
  const pct = Math.round((spent / budget) * 100);
  const note = `Budget: ${budget.toLocaleString()} XP (${party.size} × level ${lvl}, ${party.difficulty}). Proposed roster ≈ ${pct}% of budget. DMG guidelines, not gospel — eyeball anything odd.`;
  return { note, proposal };
}

/* ================= components ================= */

function Toasts({ toasts }) {
  return (
    <div className="toastwrap">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.kind || ""}`}>{t.text}</div>
      ))}
    </div>
  );
}

function CondBadge({ cond, onTap }) {
  return (
    <span className="cond" title={`${CONDITIONS[cond.name] || "Custom effect"} (tap for details)`} onClick={onTap}>
      {cond.name}{cond.rounds != null && <span className="rt"> {cond.rounds}r</span>}
    </span>
  );
}

function Pips({ label, cur, max, onSpend, onReset, color }) {
  return (
    <span className="pips" title={`${label}: ${cur}/${max} — click a pip to spend, label to reset`}>
      <span onClick={onReset} style={{ cursor: "pointer" }}>{label}</span>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={`pip ${i < cur ? "full" : ""}`} onClick={onSpend} />
      ))}
    </span>
  );
}

const DIE_SHAPES = {
  4:  { pts: "12,2.5 22,20.5 2,20.5", ty: 16.5, facets: [["12,2.5", "12,12"], ["2,20.5", "9,14"], ["22,20.5", "15,14"]] },
  6:  { rect: true, ty: 15 },
  8:  { pts: "12,1 22,12 12,23 2,12", ty: 15, facets: [["2,12", "22,12"]] },
  10: { pts: "12,1 21.5,9.5 12,23 2.5,9.5", ty: 15.5, facets: [["2.5,9.5", "21.5,9.5"]] },
  12: { pts: "12,1.5 22,9.3 18.2,21.5 5.8,21.5 2,9.3", ty: 15, facets: [["12,1.5", "12,6.5"], ["2,9.3", "7,10.8"], ["22,9.3", "17,10.8"]] },
  20: { pts: "12,1 21.5,6.5 21.5,17.5 12,23 2.5,17.5 2.5,6.5", ty: 14.8,
        facets: [["12,4.6", "18.6,15.6"], ["18.6,15.6", "5.4,15.6"], ["5.4,15.6", "12,4.6"],
                 ["12,1", "12,4.6"], ["21.5,6.5", "18.6,15.6"], ["2.5,6.5", "5.4,15.6"],
                 ["21.5,17.5", "18.6,15.6"], ["2.5,17.5", "5.4,15.6"], ["12,23", "12,19.5"]] },
};

function DieFace({ sides, val, flick, cls, dropped, size }) {
  const sh = DIE_SHAPES[sides] || DIE_SHAPES[6];
  const shown = flick != null ? ((val * 7 + flick * 13) % sides) + 1 : val;
  const px = size || 30;
  return (
    <svg className={`die ${dropped ? "dropped" : ""} ${cls || "plain"}`} viewBox="0 0 24 24" width={px} height={px * 0.95} aria-hidden="true">
      {sh.rect
        ? <rect className="shell" x="3.5" y="3.5" width="17" height="17" rx="2.5" strokeWidth="1.3" />
        : <polygon className="shell" points={sh.pts} strokeWidth="1.3" />}
      {(sh.facets || []).map(([a, b], i) => {
        const [x1, y1] = a.split(","), [x2, y2] = b.split(",");
        return <line key={i} className="facet" x1={x1} y1={y1} x2={x2} y2={y2} />;
      })}
      <text x="12" y={sh.ty} textAnchor="middle" fontSize={String(shown).length > 1 ? 8.5 : 10} className={flick != null ? "flick" : ""}>{shown}</text>
      {dropped && <line x1="4" y1="20" x2="20" y2="4" stroke="#8a7f96" strokeWidth="1.4" />}
    </svg>
  );
}

/* one synchronized flicker for a whole roll — no slot-machine chaos */
function DiceGroup({ dice, size }) {
  const [flick, setFlick] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setFlick(1), 140);
    const t2 = setTimeout(() => setFlick(null), 300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  return (
    <>
      {dice.map((d, i) => (
        <DieFace key={i} sides={d.s} val={d.v} flick={flick} cls={d.cls} dropped={d.dropped} size={size} />
      ))}
    </>
  );
}

function HeartGauge({ pct, title }) {
  const d = "M12 21C5.2 15.2 1 11 1 6.6 1 3.4 3.4 1 6.4 1 8.7 1 10.8 2.3 12 4.3 13.2 2.3 15.3 1 17.6 1 20.6 1 23 3.4 23 6.6 23 11 18.8 15.2 12 21Z";
  return (
    <svg className="hpheart" viewBox="0 0 24 22" aria-hidden="false">
      <title>{title}</title>
      <path d={d} fill="#463743" />
      {pct > 0 && <path d={d} fill="#e0645a" style={{ clipPath: `inset(${100 - pct}% 0 0 0)`, transition: "clip-path .8s ease" }} />}
    </svg>
  );
}

function Row({ c, active, isTop, isBottom, api, saveBadge, flash }) {
  const [menu, setMenu] = useState(false);
  const menuRef = useRef(null);
  const prevHp = useRef(c.hp);
  const [pulse, setPulse] = useState(null);
  const prevActive = useRef(active);
  const [spot, setSpot] = useState(false);
  useEffect(() => {
    if (active && !prevActive.current) {
      setSpot(true);
      const t = setTimeout(() => setSpot(false), 1150);
      prevActive.current = active;
      return () => clearTimeout(t);
    }
    prevActive.current = active;
  }, [active]);
  const prevDead = useRef(c.dead);
  const [skull, setSkull] = useState(null);
  useEffect(() => {
    if (c.dead && !prevDead.current) {
      setSkull({ id: Math.random() });
      const t = setTimeout(() => setSkull(null), 1550);
      prevDead.current = c.dead;
      return () => clearTimeout(t);
    }
    prevDead.current = c.dead;
  }, [c.dead]);
  const prevThp = useRef(c.thp || 0);
  const [shatter, setShatter] = useState(null);
  useEffect(() => {
    const now = c.thp || 0;
    if (prevThp.current > 0 && now === 0) {
      setShatter({ amt: prevThp.current, id: Math.random() });
      const t = setTimeout(() => setShatter(null), 750);
      prevThp.current = now;
      return () => clearTimeout(t);
    }
    prevThp.current = now;
  }, [c.thp]);
  const prevConds = useRef(c.conditions.map((x) => x.name));
  const [condGhost, setCondGhost] = useState(null);
  useEffect(() => {
    const now = c.conditions.map((x) => x.name);
    const gone = prevConds.current.find((n) => !now.includes(n));
    prevConds.current = now;
    if (gone) {
      setCondGhost({ name: gone, id: Math.random() });
      const t = setTimeout(() => setCondGhost(null), 550);
      return () => clearTimeout(t);
    }
  }, [c.conditions]);
  useEffect(() => {
    if (c.hp != null && prevHp.current != null && c.hp !== prevHp.current) {
      setPulse({ delta: c.hp - prevHp.current, id: Math.random() });
      prevHp.current = c.hp;
      const t = setTimeout(() => setPulse(null), 1550);
      return () => clearTimeout(t);
    }
    prevHp.current = c.hp;
  }, [c.hp]);
  useEffect(() => {
    if (!menu) return;
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [menu]);

  const cov = coverBonus(c);
  const effAc = c.ac != null ? c.ac + (c.acBoost || 0) + cov : null;
  const derived = condAdvVs(c);
  const manual = c.advVs || "none";
  const shown = manual !== "none" ? manual : derived ? derived.mode : "none";
  const vsTitle =
    shown === "none" ? "Attacks against this creature — click to cycle ADV / DIS"
    : shown === "adv*" ? "Prone: melee attacks within 5 ft have ADVANTAGE; ranged attacks have DISADVANTAGE (click to override)"
    : `Attacks against ${c.name} have ${shown === "adv" ? "ADVANTAGE" : "DISADVANTAGE"}` +
      (manual !== "none" ? " (manual — click to cycle)" : ` (from ${derived.from} — click to override)`);
  const bloody = isBloodied(c);

  return (
    <div className={`row ${active ? "active" : ""} ${spot ? "spot" : ""} ${c.dead ? "dead" : ""} ${skull ? "dying" : ""} ${bloody ? "bloody" : ""} ${!c.dead && c.type !== "effect" && shown === "adv" ? "vs-adv" : ""} ${!c.dead && c.type !== "effect" && shown === "dis" ? "vs-dis" : ""} ${!c.dead && c.type !== "effect" && shown === "adv*" ? "vs-mix" : ""}`}>
      {!c.dead && c.concentration && <span className="concring" />}
      <span className="initmark" title={c.initText || (c.init != null ? `Initiative ${c.init}` : "No initiative yet")}>{c.init ?? "—"}</span>
      <span className={`sidebar-dot side-${c.side === "ally" ? "ally" : c.side === "effect" ? "effect" : "enemy"}`} />
      <span className="nm" style={c.type === "monster" || c.type === "player" ? { cursor: "pointer" } : undefined}
        title={c.type === "monster" || c.type === "player" ? "Tap to peek at this creature's card" : undefined}
        onClick={(c.type === "monster" || c.type === "player") ? () => api.peek(c.uid) : undefined}>
        {c.name}
        {c.dead && <span className="sub">({c.type === "object" ? "destroyed" : "dead"})</span>}
        {c.unconscious && !c.dead && <span className="sub">(unconscious)</span>}
        {bloody && <span className="bloodtag" title="At or below half HP">Bloodied</span>}
        {c.type === "effect" && c.rounds != null && <span className="sub">{c.rounds}r left</span>}
        {flash && <span className="rowflash" key={flash.id}>{flash.text}</span>}
        {saveBadge && !c.dead && (
          <span className={`savetag ${saveBadge.ok === true ? "good" : saveBadge.ok === false ? "bad" : ""}`}
            title="Save result — tap to dismiss"
            onClick={(e) => { e.stopPropagation(); api.dismissSave(c.uid); }}>
            {saveBadge.ab}{saveBadge.total != null ? ` ${saveBadge.total}` : ""}{saveBadge.ok === true ? " ✓" : saveBadge.ok === false ? " ✗" : ""}
          </span>
        )}
      </span>

      {c.hp != null && c.type !== "effect" && (
        <span className="hpbox">
          <span key={pulse ? pulse.id : "still"}
            className={`hpval ${pulse ? (pulse.delta < 0 ? "pd" : "ph") : ""}`}
            onClick={() => api.openDamage(c.uid)} title="Tap for damage/heal with type">
            {c.hp}<span className="max">/{c.maxHp}</span>
          </span>
          {pulse && (
            <span key={`g${pulse.id}`} className={`hpghost ${pulse.delta < 0 ? "d" : "h"}`}>
              {pulse.delta > 0 ? `+${pulse.delta}` : pulse.delta}
            </span>
          )}
          <HeartGauge
            pct={c.hp <= 0 ? 0 : c.hp >= c.maxHp ? 100 : Math.min(9, Math.max(1, Math.round((c.hp / c.maxHp) * 10))) * 10}
            title={c.hp <= 0 ? "Down" : c.hp >= c.maxHp ? "Unhurt" : `About ${Math.min(9, Math.max(1, Math.round((c.hp / c.maxHp) * 10))) * 10}% health`} />
          {(c.thp || 0) > 0 && (
            <button className="thpchip" title={`${c.thp} temporary HP — tap to edit`}
              onClick={() => api.openThp(c.uid)}>+{c.thp}</button>
          )}
          {shatter && <span key={shatter.id} className="thpchip shattering">+{shatter.amt}</span>}
          {skull && <span key={skull.id} className="skullghost">💀</span>}
        </span>
      )}

      {c.type === "player" && c.pp != null && (
        <span className="acbox" title="Passive Perception">👁 {c.pp}</span>
      )}

      {(c.loot || []).length > 0 && (
        <span className="lootico" style={{ cursor: "pointer" }} title={`Carrying: ${c.loot.map(lootName).join(", ")} — tap to view/edit`}
          onClick={() => api.openLoot(c.uid)}>💰</span>
      )}

      {effAc != null && (
        <span className="acbox" title={[c.acBoost ? `+${c.acBoost} reaction` : "", cov ? `+${cov} cover` : ""].filter(Boolean).length ? `Base AC ${c.ac} ${[c.acBoost ? `+${c.acBoost} reaction` : "", cov ? `+${cov} cover` : ""].filter(Boolean).join(" ")}` : "Armor Class"}>
          AC {effAc}{(c.acBoost || cov) ? "*" : ""}
          {c.acReaction && (
            <span
              className={`shield ${c.acBoost ? "on" : ""}`}
              title={c.acBoost ? `${c.acReaction.n} active — tap to remove` : `${c.acReaction.n}: tap to preview`}
              onClick={() => (c.acBoost ? api.toggleShield(c.uid) : api.openShieldInfo(c.uid))}
            >🛡</span>
          )}
        </span>
      )}

      <span className="badges">
        {c.conditions.map((cd, i) => (
          <CondBadge key={i} cond={cd} onTap={() => api.openCondInfo(c.uid, cd.name)} />
        ))}
        {condGhost && <span key={condGhost.id} className="cond condghost">{condGhost.name}</span>}
        {c.concentration && (
          <span className="conc" title="Concentrating — tap for details" onClick={() => api.concInfo(c.uid)}>
            ◈ {c.concentration}
          </span>
        )}
        {c.unconscious && !c.dead && (
          <span className="cond" style={{ borderColor: "var(--danger)" }} title="Death saves — tap to record"
            onClick={() => api.openDeathSaves(c.uid)}>
            💀 {c.stable ? "stable" : `${c.ds?.s ?? 0}✓ ${c.ds?.f ?? 0}✗`}
          </span>
        )}
      </span>

      {c.type !== "effect" && c.type !== "object" && !c.dead && (
        <button className={`vschip ${shown === "adv" ? "adv" : shown === "dis" ? "dis" : shown === "adv*" ? "mix" : ""}`}
          title={vsTitle} onClick={() => api.cycleAdvVs(c.uid)}>
          ⊕{shown === "none" ? "vs" : shown === "adv" ? "ADV" : shown === "dis" ? "DIS" : "ADV/DIS"}
        </button>
      )}

      {c.legRes && <Pips label="LR" cur={c.legRes.rem} max={c.legRes.max} onSpend={() => api.confirmUse(c.uid, "lr")} onReset={() => api.confirmUse(c.uid, "lr")} />}
      {c.legendary && <Pips label="LA" cur={c.legendary.rem} max={c.legendary.max} onSpend={() => api.confirmUse(c.uid, "la")} onReset={() => api.confirmUse(c.uid, "la")} />}
      {c.uses && !c.dead && Object.keys(c.uses).filter((k) => k[0] === "r").map((k) => (
        <Pips key={k} label={c.uses[k].n.replace(USES_RE, "").trim().split(" ").map((w) => w[0]).join("")}
          cur={c.uses[k].rem} max={c.uses[k].max}
          onSpend={() => api.confirmUse(c.uid, "use", k)} onReset={() => api.confirmUse(c.uid, "use", k)} />
      ))}

      {c.type !== "effect" && c.type !== "object" && !c.dead && (
        <span className={`advtag selfadv ${c.advMode}`} style={{ cursor: "pointer" }}
          title={`${c.name}'s own rolls: ${c.advMode === "none" ? "normal" : c.advMode.toUpperCase()} — tap to cycle`}
          onClick={() => api.cycleAdv(c.uid)}>
          {c.advMode === "adv" ? "ADV" : c.advMode === "dis" ? "DIS" : "A/D"}
        </span>
      )}

      {c.type !== "effect" && c.type !== "object" && !c.dead && (
        <button className={`rtog ${c.reaction ? "on" : ""}`} title="Reaction available (click to toggle)" onClick={() => api.toggleReaction(c.uid)}>
          R{c.reaction ? "1" : "0"}
        </button>
      )}

      <span className="menu-anchor" ref={menuRef}>
        <button className="btn small ghost" onClick={() => setMenu(!menu)}>⋮</button>
        {menu && (
          <div className="menu" onClick={() => setMenu(false)}>
            {c.type !== "effect" && c.type !== "object" && <button onClick={() => api.openSaveRoll(c.uid)}>Roll save…</button>}
            {c.hp != null && c.type !== "effect" && <button onClick={() => api.openDamage(c.uid)}>Damage / heal…</button>}
            <button onClick={() => api.rename(c.uid)}>Rename…</button>
            {c.type !== "effect" && <button onClick={() => api.openDefenses(c.uid)}>Edit defenses…</button>}
            {c.type === "monster" && <button onClick={() => api.openAddAttack(c.uid)}>Add attack…</button>}
            {c.type !== "effect" && <button onClick={() => api.openLoot(c.uid)}>Give loot…</button>}
            {c.type !== "effect" && c.type !== "object" && <button onClick={() => api.cycleAdv(c.uid)}>Adv/dis on rolls (cycle)</button>}
            {c.type !== "effect" && c.type !== "object" && <button onClick={() => api.setConc(c.uid)}>Set concentration…</button>}
            <button onClick={() => api.addCondition(c.uid)}>Add condition…</button>
            {c.type !== "object" && <button onClick={() => api.setInit(c.uid)}>Set initiative…</button>}
            {!isTop && <button onClick={() => api.nudge(c.uid, +1)}>Move up (init +1)</button>}
            {!isBottom && <button onClick={() => api.nudge(c.uid, -1)}>Move down (init −1)</button>}
            {c.type === "monster" && <button onClick={() => api.saveToBestiary(c.uid)}>Save to my bestiary</button>}
            {c.type !== "effect" && c.type !== "object" && <button onClick={() => api.switchSide(c.uid)}>{c.side === "ally" ? "Make enemy" : "Make ally"}</button>}
            {c.type === "monster" && !c.dead && <button className="warn" onClick={() => api.kill(c.uid)}>Mark dead</button>}
            {c.type === "object" && !c.dead && <button className="warn" onClick={() => api.kill(c.uid)}>Mark destroyed</button>}
            {(c.dead || c.unconscious) && <button onClick={() => api.revive(c.uid)}>Revive (1 HP)</button>}
            <button className="warn" onClick={() => api.remove(c.uid)}>Remove from combat</button>
          </div>
        )}
      </span>
    </div>
  );
}

/* -------- active turn cards -------- */

function UsePips({ c, k, api, withBtn = true, turnOnly = false }) {
  const u = c.uses?.[k];
  if (!u) return null;
  return (
    <>
      <span className={`usepips ${u.rem <= 0 ? "spent" : ""}`} title={`${u.rem}/${u.max} uses left`}>
        {Array.from({ length: u.max }, (_, j) => <span key={j} className={j < u.rem ? "" : "off"}>{j < u.rem ? "●" : "○"}</span>)}
      </span>
      {withBtn && (
        <button className="btn small" disabled={u.rem <= 0 || (k[0] === "r" && !c.reaction) || turnOnly}
          title={turnOnly ? "Bonus actions happen on the creature's own turn" : k[0] === "r" && !c.reaction ? "Reaction already used this round — toggle R on the roster to re-arm" : undefined}
          onClick={() => api.spendUse(c.uid, k)}>Use</button>
      )}
    </>
  );
}


const LAIR_TIERS = { "Low (1–4)": { mult: 0.5, dc: -1 }, "Mid (5–10)": { mult: 1, dc: 0 }, "High (11–16)": { mult: 2, dc: 2 }, "Epic (17+)": { mult: 3, dc: 3 } };
function scaleSug(s, tierKey) {
  const t = LAIR_TIERS[tierKey] || LAIR_TIERS["Mid (5–10)"];
  const out = { ...s };
  if (s.dc != null) out.dc = s.dc + t.dc;
  if (s.dmg) out.dmg = s.dmg.replace(/(\d+)(d\d+)/g, (_, n, die) => `${Math.max(1, Math.round(+n * t.mult))}${die}`)
                         .replace(/^(\d+)$/, (_, n) => String(Math.max(1, Math.round(+n * t.mult))));
  return out;
}

function EffectBuilderModal({ onClose, onAdd }) {
  const [f, setF] = useState({ name: "", init: "20", rounds: "", desc: "", mech: "note", ab: "dex", dc: "", dmg: "", dtype: "", half: true, cond: "", condR: "" });
  const [theme, setTheme] = useState(null);
  const [tier, setTier] = useState("Mid (5–10)");
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const applySug = (raw) => {
    const s = scaleSug(raw, tier);
    setF((p) => ({
      ...p, name: s.n, desc: s.desc, mech: s.mech,
      ab: s.ab || "dex", dc: s.dc != null ? String(s.dc) : "", dmg: s.dmg || "", dtype: s.dtype || "",
      half: s.half !== false, cond: s.cond || "", condR: s.condR != null ? String(s.condR) : "",
    }));
  };
  const FIELD = { margin: 0, color: "var(--text)", WebkitTextFillColor: "var(--text)", background: "var(--panel)", caretColor: "var(--gold)" };
  const inp = (k, ph, style = {}) => (
    <input className="sbook-search" style={{ ...FIELD, ...style }} placeholder={ph} value={f[k]} onChange={(e) => set(k, e.target.value)} />
  );
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal peekmodal" onClick={(e) => e.stopPropagation()}>
        <h3>Add effect / lair action</h3>
        <div style={{ display: "flex", gap: 6, margin: "8px 0" }}>
          {inp("name", "Name (Lair Actions, Wall of Fire…)", { flex: 1 })}
        </div>
        <div style={{ display: "flex", gap: 6, margin: "0 0 8px" }}>
          <label className="ad" style={{ display: "flex", alignItems: "center", gap: 5 }}>Init {inp("init", "20", { width: 54, textAlign: "center" })}</label>
          <label className="ad" style={{ display: "flex", alignItems: "center", gap: 5 }}>Rounds {inp("rounds", "∞", { width: 54, textAlign: "center" })}</label>
        </div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
          {[["note", "📝 Reminder"], ["save", "🎲 Save effect"], ["dmg", "💥 Damage only"]].map(([k, lbl]) => (
            <button key={k} className={`lvlchip ${f.mech === k ? "on" : ""}`} onClick={() => set("mech", k)}>{lbl}</button>
          ))}
        </div>
        {f.mech === "save" && (
          <>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 6 }}>
              {["str", "dex", "con", "int", "wis", "cha"].map((x) => (
                <button key={x} className={`lvlchip ${f.ab === x ? "on" : ""}`} onClick={() => set("ab", x)}>{x.toUpperCase()}</button>
              ))}
              <label className="ad" style={{ display: "flex", alignItems: "center", gap: 5 }}>DC {inp("dc", "13", { width: 52, textAlign: "center" })}</label>
            </div>
          </>
        )}
        {(f.mech === "save" || f.mech === "dmg") && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
            {inp("dmg", f.mech === "save" ? "Damage (4d6 or 12) — optional" : "Damage (4d6 or 12)", { flex: 1, minWidth: 120 })}
            <select className="sbook-search" style={{ width: 128, margin: 0, color: f.dtype ? "var(--text)" : "var(--faint)", WebkitTextFillColor: f.dtype ? "var(--text)" : "var(--faint)", background: "var(--panel)", WebkitAppearance: "none", appearance: "none" }} value={f.dtype} onChange={(e) => set("dtype", e.target.value)}>
              <option value="">type (optional)</option>
              {["acid", "bludgeoning", "cold", "fire", "force", "lightning", "necrotic", "piercing", "poison", "psychic", "radiant", "slashing", "thunder"].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        )}
        {f.mech === "save" && (
          <>
            {f.dmg.trim() !== "" && (
              <label className="ad" style={{ display: "block", marginBottom: 6 }}>
                <input type="checkbox" checked={f.half} onChange={(e) => set("half", e.target.checked)} /> half damage on a successful save
              </label>
            )}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginBottom: 6 }}>
              <select className="sbook-search" style={{ width: 170, margin: 0, color: f.cond ? "var(--text)" : "var(--faint)", WebkitTextFillColor: f.cond ? "var(--text)" : "var(--faint)", background: "var(--panel)", WebkitAppearance: "none", appearance: "none" }} value={f.cond} onChange={(e) => set("cond", e.target.value)}>
                <option value="">condition on fail (optional)</option>
                {Object.keys(CONDITIONS).map((cn) => <option key={cn} value={cn}>{cn}</option>)}
              </select>
              {f.cond && <label className="ad" style={{ display: "flex", alignItems: "center", gap: 5 }}>for {inp("condR", "∞", { width: 46, textAlign: "center" })} rd</label>}
            </div>
          </>
        )}
        <textarea className="sbook-search" rows={2} style={{ width: "100%", boxSizing: "border-box", resize: "vertical", marginBottom: 8, color: "var(--text)", WebkitTextFillColor: "var(--text)", background: "var(--panel)", caretColor: "var(--gold)" }} placeholder="Flavor / notes — what happens on this count" value={f.desc} onChange={(e) => set("desc", e.target.value)} />
        <div className="lbl" style={{ marginBottom: 4 }}>Ideas by lair</div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 6, alignItems: "center" }}>
          <span className="ad" style={{ fontSize: 11 }}>Party tier:</span>
          {Object.keys(LAIR_TIERS).map((t) => (
            <button key={t} className={`lvlchip ${tier === t ? "on" : ""}`} onClick={() => setTier(t)}>{t}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 6 }}>
          {Object.keys(LAIR_THEMES).map((t) => (
            <button key={t} className={`lvlchip ${theme === t ? "on" : ""}`} onClick={() => setTheme(theme === t ? null : t)}>{t}</button>
          ))}
        </div>
        {theme && LAIR_THEMES[theme].map((raw) => {
          const s = scaleSug(raw, tier);
          return (
            <div key={s.n} className="gs-target" style={{ cursor: "pointer" }} onClick={() => applySug(raw)}>
              <b>{s.n}</b>
              <span className="ad">{s.mech === "note" ? "reminder" : s.mech === "dmg" ? `${s.dmg} ${s.dtype}, no save` : `DC ${s.dc} ${s.ab.toUpperCase()}${s.dmg ? `, ${s.dmg} ${s.dtype || ""}${s.half !== false ? ", half" : ""}` : ""}${s.cond ? `, ${s.cond}` : ""}`}</span>
            </div>
          );
        })}
        <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center" }}>
          <button className="btn primary" disabled={!f.name.trim()} onClick={() => onAdd(f)}>Add</button>
          <span className="spacer" />
          <button className="btn small" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function TargetPickModal({ attacker, action, list, la, opp, onResolve, onClose }) {
  const isEnemy = attacker.side !== "ally";
  const primary = list.filter((x) => (isEnemy ? x.side === "ally" : x.side !== "ally"));
  const others = list.filter((x) => !primary.includes(x));
  const charmed = (attacker.conditions || []).some((cd) => /Charm/i.test(cd.name));
  const [showOthers, setShowOthers] = useState(charmed);
  const [proneFor, setProneFor] = useState(null);
  const pick = (t, vsOverride) => onResolve({ uid: attacker.uid, ai: action.i, targetUid: t ? t.uid : null, vsOverride, la, opp });
  const row = (t) => {
    const vs = vsState(t);
    const prone = vs === "adv*";
    return (
      <div key={t.uid} className="gs-target" style={{ cursor: "pointer", flexWrap: "wrap" }}
        onClick={() => (prone ? setProneFor(proneFor === t.uid ? null : t.uid) : pick(t))}>
        <b>{t.name}</b>
        <span className="ad">
          {t.ac != null ? `AC ${t.ac + (t.acBoost || 0) + coverBonus(t)}` : "AC ?"}
          {t.maxHp != null ? ` · HP ${t.hp}/${t.maxHp}` : ""}
          {t.unconscious ? " · down" : ""}
        </span>
        {vs !== "none" && <span className={`advtag ${prone ? "adv" : vs}`}>{prone ? "PRONE" : vs === "adv" ? "vs ADV" : "vs DIS"}</span>}
        {prone && proneFor === t.uid && (
          <span style={{ flexBasis: "100%", display: "flex", gap: 6, paddingTop: 4 }} onClick={(e) => e.stopPropagation()}>
            <button className="btn small cond" onClick={() => pick(t, "adv")}>within 5 ft — ADV</button>
            <button className="btn small" onClick={() => pick(t, "dis")}>ranged — DIS</button>
          </span>
        )}
      </div>
    );
  };
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{attacker.name} — {action.n} <span style={{ color: "var(--faint)", fontSize: 12, fontWeight: 400 }}>{fmtMod(action.hit)} to hit</span></h3>
        <div className="gs-target" style={{ cursor: "pointer" }} onClick={() => pick(null)}>
          <span className="ad">No target — just roll</span>
        </div>
        <div className="gs-targets" style={{ marginTop: 4 }}>
          {primary.map(row)}
          {others.length > 0 && !showOthers && (
            <div className="gs-target" style={{ cursor: "pointer", opacity: 0.5, fontSize: 11, padding: "2px 0" }} onClick={() => setShowOthers(true)}>
              <span className="ad" style={{ fontSize: 11 }}>other targets ({others.length})…</span>
            </div>
          )}
          {showOthers && others.map(row)}
        </div>
        <div style={{ display: "flex", marginTop: 10 }}>
          <span className="spacer" />
          <button className="btn small" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function EncounterSuggestModal({ party, onAdd, onClose }) {
  const [biome, setBiome] = useState("Forest");
  const [level, setLevel] = useState("");
  const [size, setSize] = useState("");
  const [difficulty, setDifficulty] = useState(party.difficulty || "moderate");
  const [template, setTemplate] = useState("Skirmish");
  const [balanced, setBalanced] = useState(true);
  const [addLair, setAddLair] = useState(false);
  const [sugg, setSugg] = useState(null);
  const roll = () => setSugg(suggestEncounter({ biome, level: parseInt(level, 10) || 3, size: parseInt(size, 10) || 4, difficulty, template, balanced }));
  const FIELD = { margin: 0, width: 58, textAlign: "center", color: "var(--text)", WebkitTextFillColor: "var(--text)", background: "var(--panel)", caretColor: "var(--gold)" };
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal peekmodal" onClick={(e) => e.stopPropagation()}>
        <h3>Suggest an encounter</h3>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", margin: "8px 0" }}>
          {Object.keys(ENCOUNTER_POOLS).map((b) => (
            <button key={b} className={`lvlchip ${biome === b ? "on" : ""}`} onClick={() => { setBiome(b); setSugg(null); }}>{b}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginBottom: 6 }}>
          <span className="ad" style={{ fontSize: 11 }}>Party:</span>
          <select className="sbook-search" style={{ width: 108, margin: 0, color: size ? "var(--text)" : "var(--faint)", WebkitTextFillColor: size ? "var(--text)" : "var(--faint)", background: "var(--panel)", WebkitAppearance: "none", appearance: "none" }}
            value={size} onChange={(e) => { setSize(e.target.value); setSugg(null); }}>
            <option value="">players…</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => <option key={n} value={String(n)}>{n} player{n === 1 ? "" : "s"}</option>)}
          </select>
          <select className="sbook-search" style={{ width: 96, margin: 0, color: level ? "var(--text)" : "var(--faint)", WebkitTextFillColor: level ? "var(--text)" : "var(--faint)", background: "var(--panel)", WebkitAppearance: "none", appearance: "none" }}
            value={level} onChange={(e) => { setLevel(e.target.value); setSugg(null); }}>
            <option value="">level…</option>
            {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => <option key={n} value={String(n)}>Level {n}</option>)}
          </select>
          {["low", "moderate", "high"].map((d) => (
            <button key={d} className={`lvlchip ${difficulty === d ? "on" : ""}`} onClick={() => { setDifficulty(d); setSugg(null); }}>{d}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 2 }}>
          {Object.keys(ENC_TEMPLATES).map((t) => (
            <button key={t} className={`lvlchip ${template === t ? "on" : ""}`} onClick={() => { setTemplate(t); setSugg(null); }}>{t}</button>
          ))}
        </div>
        <div className="ad" style={{ margin: "0 0 8px", fontSize: 11.5 }}>{ENC_TEMPLATE_DESC[template]}</div>
        <label className="ad" style={{ display: "block", marginBottom: 4 }}>
          <input type="checkbox" checked={balanced} onChange={(e) => { setBalanced(e.target.checked); setSugg(null); }} /> ⚖ Use balancing — wider monster pool, stats auto-tuned to the party. Unchecked: CR-appropriate stat blocks exactly as printed.
        </label>
        <label className="ad" style={{ display: "block", marginBottom: 8 }}>
          <input type="checkbox" checked={addLair} onChange={(e) => setAddLair(e.target.checked)} /> ✦ Include a lair action from this biome (initiative 20)
        </label>
        {!sugg && <button className="btn primary" disabled={!(parseInt(size, 10) > 0) || !(parseInt(level, 10) > 0)} title={!(parseInt(size, 10) > 0) || !(parseInt(level, 10) > 0) ? "Pick player count and level first" : undefined} onClick={roll}>Suggest lineup</button>}
        {sugg && (
          <>
            {sugg.picks.length === 0 && <div className="ad">Couldn't fit a lineup — try another shape or difficulty.</div>}
            {sugg.picks.map((p, i) => (
              <div key={i} className="gs-row">
                <b>{p.name}</b>
                <span className="ad">CR {p.cr < 1 ? (p.cr === 0.125 ? "1/8" : p.cr === 0.25 ? "1/4" : p.cr === 0.5 ? "1/2" : p.cr) : p.cr}{!balanced ? ` · ${p.xp} XP` : ""} · {p.band}</span>
              </div>
            ))}
            {!balanced && sugg.budget && <div className="ad" style={{ marginTop: 4 }}>XP: {sugg.spent} of {sugg.budget} budget ({difficulty}){sugg.note ? ` — ${sugg.note}` : ""}</div>}
            {balanced && <div className="ad" style={{ marginTop: 4 }}>Stats will be auto-balanced to the party on add.</div>}
            <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center" }}>
              <button className="btn primary" disabled={!sugg.picks.length}
                onClick={() => onAdd({ picks: sugg.picks, biome, level: parseInt(level, 10) || 3, size: parseInt(size, 10) || 4, difficulty, balanced, addLair })}>
                Add{balanced ? " & balance" : ""}
              </button>
              <button className="btn small" onClick={roll}>↻ Reroll</button>
              <span className="spacer" />
              <button className="btn small" onClick={onClose}>Cancel</button>
            </div>
          </>
        )}
        {!sugg && <div style={{ display: "flex", marginTop: 10 }}><span className="spacer" /><button className="btn small" onClick={onClose}>Cancel</button></div>}
      </div>
    </div>
  );
}

function BuffTargetModal({ spec, state, api, onClose }) {
  const cs = state.combatants.find((x) => x.uid === spec.casterUid);
  if (!cs) return null;
  const s = SPELL_REF[spec.k];
  const cands = targetCands(state, cs);
  const same = cands.filter((x) => x.side === cs.side);
  const others = cands.filter((x) => x.side !== cs.side);
  const [showOthers, setShowOthers] = useState(false);
  const row = (t, self) => (
    <div key={t.uid} className="gs-target" style={{ cursor: "pointer" }}
      onClick={() => api.castBuff({ casterUid: cs.uid, targetUid: t.uid, laUid: spec.laUid, cond: spec.cond, condR: spec.condR, conc: spec.conc, spellName: s.n })}>
      <b>{t.name}</b>{self && <span className="ad">(self)</span>}
      <span className="ad">{t.side === "ally" ? "ally" : "enemy"}</span>
    </div>
  );
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Cast {s.n} — choose target</h3>
        <div className="ad" style={{ marginBottom: 6 }}>Applies <b>{spec.cond}</b>{spec.condR ? ` (${spec.condR} rd)` : spec.conc ? " (until concentration ends)" : ""}{spec.conc ? ` — ${cs.name} concentrates` : ""}.</div>
        <div className="gs-targets">
          {row(cs, true)}
          {same.map((t) => row(t))}
          {others.length > 0 && !showOthers && (
            <div className="gs-target" style={{ cursor: "pointer", opacity: 0.5, fontSize: 11, padding: "2px 0" }} onClick={() => setShowOthers(true)}>
              <span className="ad" style={{ fontSize: 11 }}>other targets ({others.length})…</span>
            </div>
          )}
          {showOthers && others.map((t) => row(t))}
        </div>
        <div style={{ display: "flex", marginTop: 10 }}>
          <span className="spacer" />
          <button className="btn small" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function RepeatSaveModal({ c, done, api, onContinue, onClose, warnConds, title, continueLabel }) {
  const rpts = (c.conditions || []).filter((cd) => cd.rpt);
  const allDone = rpts.every((cd) => done[cd.name]);
  return (
    <div className="overlay">
      <div className="modal" onClick={(e) => e.stopPropagation()} style={warnConds ? { borderColor: "var(--danger)" } : undefined}>
        <h3>{title || `End of ${c.name}'s turn — repeat saves`}</h3>
        {warnConds && warnConds.map((cd) => (
          <div key={"w" + cd.name} className="gs-row" style={{ flexWrap: "wrap" }}>
            <b>{cd.name}</b>{cd.spell && <span className="ad">from {cd.spell}</span>}
            <span className="ad" style={{ flexBasis: "100%" }}>
              {cd.name.startsWith("Command:")
                ? `Must spend this turn obeying — ${cd.name.slice(9).trim()}. The effect ends when this turn does.`
                : CONDITIONS[cd.name] || ""}
            </span>
          </div>
        ))}
        {warnConds && rpts.length > 0 && <div className="lbl" style={{ margin: "8px 0 4px" }}>They repeat these saves at the end of this turn</div>}
        {rpts.length === 0 && <div className="ad">All conditions resolved.</div>}
        {rpts.map((cd) => {
          const r = done[cd.name];
          return (
            <div key={cd.name} className="gs-row" style={{ flexWrap: "wrap" }}>
              <b>{cd.name}</b>
              <span className="ad">{cd.spell ? `${cd.spell} — ` : ""}{cd.rpt.ab.toUpperCase()} save DC {cd.rpt.dc}{cd.rpt.note ? ` (${cd.rpt.note})` : ""}</span>
              {!r && (
                <span style={{ marginLeft: "auto", display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {c.type === "player"
                    ? <>
                        <button className="btn small cond" onClick={() => api.markRepeatSave(c.uid, cd.name, true)}>✓ saved</button>
                        <button className="btn small" onClick={() => api.markRepeatSave(c.uid, cd.name, false)}>✗ failed</button>
                      </>
                    : <button className="btn small primary" onClick={() => api.rollRepeatSave(c.uid, cd.name)}>🎲 Roll</button>}
                  <button className="btn small ghost" onClick={() => api.skipRepeatSave(cd.name)}>Skip</button>
                </span>
              )}
              {r && (
                <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                  {r.dice && <DiceGroup dice={r.dice} size={30} />}
                  {r.skipped ? <span className="ad">skipped</span> : (
                    <>
                      {r.total != null && <span className={`rolltotal ${r.ok ? "good" : "bad"}`}>{r.total}</span>}
                      <span className={`verdict small ${r.ok ? "good" : "bad"}`}>{r.ok ? "FREED" : "HELD"}</span>
                    </>
                  )}
                </span>
              )}
            </div>
          );
        })}
        <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center" }}>
          <button className="btn primary" disabled={!allDone && rpts.length > 0} onClick={onContinue}>{continueLabel || "Continue to next turn ▶"}</button>
          <span className="spacer" />
          <button className="btn small ghost" onClick={onClose}>Stay on this turn</button>
        </div>
      </div>
    </div>
  );
}

function GroupSaveModal({ list, preset, resolved, onClose, onResolve, onPlayerResult, onCommandWord }) {
  const [ab, setAb] = useState(preset?.ability?.toLowerCase() || "dex");
  const [dc, setDc] = useState(preset?.dc != null ? String(preset.dc) : "");
  const [dmg, setDmg] = useState(preset?.dmg || "");
  const [dtype, setDtype] = useState((preset?.dtype || "").toLowerCase());
  const [halfOn, setHalfOn] = useState(preset?.half !== false);
  const noSave = !!preset?.noSave;
  const single = !!preset?.single;
  const noDmg = !!preset?.noDmg;
  const caster = preset?.casterUid ? list.find((x) => x.uid === preset.casterUid) : null;
  const base = caster ? list.filter((x) => x.uid !== caster.uid) : list;
  const primary = caster ? base.filter((x) => (caster.side === "ally" ? x.side !== "ally" : x.side === "ally")) : base;
  const others = caster ? base.filter((x) => !primary.includes(x)) : [];
  const casterCharmed = caster ? (caster.conditions || []).some((cd) => /Charm/i.test(cd.name)) : false;
  const [showOthers, setShowOthers] = useState(casterCharmed);
  const [sel, setSel] = useState(() => new Set(preset?.targets || []));
  const togg = (uid) => setSel((s) => { if (single) return s.has(uid) ? new Set() : new Set([uid]); const n = new Set(s); n.has(uid) ? n.delete(uid) : n.add(uid); return n; });
  const pick = (fn) => setSel(new Set(base.filter(fn).map((c) => c.uid)));
  if (resolved) {
    return (
      <div className="overlay" onClick={onClose}>
        <div className="modal" onClick={resolved.pending && resolved.pending.length ? (e) => e.stopPropagation() : onClose} style={{ cursor: resolved.pending && resolved.pending.length ? undefined : "pointer" }}>
          <h3>{resolved.title}</h3>
          {resolved.dmgChip && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", margin: "6px 0" }}>
              {resolved.dmgChip.dice && <DiceGroup dice={resolved.dmgChip.dice} size={26} />}
              <b>{resolved.dmgChip.t}</b>
            </div>
          )}
          {resolved.pending && resolved.pending.map((p) => (
            <div key={p.uid} className="gs-row" onClick={(e) => e.stopPropagation()}>
              <b>{p.name}</b>
              <span className="ad">reports their roll…</span>
              <span style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                <button className="btn small cond" onClick={() => onPlayerResult(p.uid, true)}>✓ saved</button>
                <button className="btn small" onClick={() => onPlayerResult(p.uid, false)}>✗ failed</button>
              </span>
            </div>
          ))}
          {resolved.rows.map((r, i) => (
            <div key={i} className="gs-row" style={{ flexWrap: "wrap" }} onClick={(e) => (resolved.ctx?.cmdPick && r.ok === false && !r.cmdDone ? e.stopPropagation() : null)}>
              <span className={`verdict small ${r.ok == null ? "" : r.ok ? "good" : "bad"}`}>{r.ok == null ? "💥" : r.ok ? "✓" : "✗"}</span>
              <b>{r.name}</b>
              {r.dice && <DiceGroup dice={r.dice} size={26} />}
              <span className="ad">{r.total != null && r.dice && <>{fmtMod(r.mod || 0)} = <span className={`rolltotal ${r.ok ? "good" : "bad"}`}>{r.total}</span></>}{r.total != null && !r.dice && `rolled ${r.total}`}{r.dmg != null ? `${r.total != null ? " — " : ""}takes ${r.dmg}` : ""}{r.note ? ` ${r.note}` : ""}{r.cmdDone ? ` — commanded: ${r.cmdDone}` : ""}</span>
              {resolved.ctx?.cmdPick && r.ok === false && !r.cmdDone && r.uid && (
                <span style={{ flexBasis: "100%", display: "flex", gap: 5, flexWrap: "wrap", padding: "3px 0 2px" }}>
                  {["Approach", "Drop", "Flee", "Grovel", "Halt"].map((w) => (
                    <button key={w} className="btn small cond" onClick={() => onCommandWord(r.uid, w)}>{w}</button>
                  ))}
                </span>
              )}
            </div>
          ))}
          <div className="ad" style={{ marginTop: 8 }}>{resolved.pending && resolved.pending.length ? "mark each player as they report — then tap outside to close" : "tap anywhere to dismiss — results are recorded in the log"}</div>
        </div>
      </div>
    );
  }
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{single ? "Saving throw" : noSave ? "Apply damage" : "Group save"}{preset?.name ? ` — ${preset.name}` : ""}</h3>
        {preset?.cond && !noSave && <div className="ad" style={{ marginBottom: 4 }}>On a failed save: <b>{preset.cond}</b>{preset.condR ? ` (${preset.condR} rd)` : ""}</div>}
        <div style={{ display: noSave ? "none" : "flex", gap: 5, flexWrap: "wrap", margin: "8px 0 6px" }}>
          {["str","dex","con","int","wis","cha"].map((x) => (
            <button key={x} className={`lvlchip ${ab === x ? "on" : ""}`} onClick={() => setAb(x)}>{x.toUpperCase()}</button>
          ))}
        </div>
        <div style={{ display: noSave ? "none" : "flex", gap: 8, alignItems: "center", margin: "0 0 8px" }}>
          <span style={{ fontSize: 13, color: "var(--dim)", fontWeight: 600 }}>Save DC</span>
          <input className="sbook-search" style={{ width: 76, margin: 0, fontSize: 16, textAlign: "center", color: "var(--text)", WebkitTextFillColor: "var(--text)", background: "var(--panel)", caretColor: "var(--gold)" }} placeholder="15" inputMode="numeric" value={dc} onChange={(e) => setDc(e.target.value)} />
        </div>
        <div style={{ display: noDmg ? "none" : "flex", gap: 6, flexWrap: "wrap", margin: "0 0 8px" }}>
          <input className="sbook-search" style={{ flex: 1, minWidth: 110, margin: 0, color: "var(--text)", WebkitTextFillColor: "var(--text)", background: "var(--panel)", caretColor: "var(--gold)" }} placeholder="Damage (e.g. 8d6) — optional" value={dmg} onChange={(e) => setDmg(e.target.value)} />
          <select className="sbook-search" style={{ width: 130, margin: 0, color: dtype ? "var(--text)" : "var(--faint)", WebkitTextFillColor: dtype ? "var(--text)" : "var(--faint)", background: "var(--panel)", WebkitAppearance: "none", appearance: "none" }} value={dtype} onChange={(e) => setDtype(e.target.value)}>
            <option value="">type (optional)</option>
            {["acid","bludgeoning","cold","fire","force","lightning","necrotic","piercing","poison","psychic","radiant","slashing","thunder"].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        {!noSave && !noDmg && (
          <label className="ad" style={{ display: "block", marginBottom: 8 }}>
            <input type="checkbox" checked={halfOn} onChange={(e) => setHalfOn(e.target.checked)} /> half damage on a successful save
          </label>
        )}
        {single && <div className="ad" style={{ marginBottom: 4 }}>Single target — pick one creature.</div>}
        <div style={{ display: single ? "none" : "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
          <button className="btn small ghost" onClick={() => pick(() => true)}>Everyone</button>
          <button className="btn small ghost" onClick={() => pick((c) => c.side === "enemy")}>All enemies</button>
          <button className="btn small ghost" onClick={() => pick((c) => c.side === "ally")}>All allies</button>
          <button className="btn small ghost" onClick={() => setSel(new Set())}>None</button>
        </div>
        <div className="gs-targets">
          {primary.map((c) => (
            <label key={c.uid} className="gs-target">
              <input type="checkbox" checked={sel.has(c.uid)} onChange={() => togg(c.uid)} />
              <span>{c.name}</span>
              <span className="ad">{c.side === "ally" ? "ally" : "enemy"}{c.unconscious ? " · unconscious" : ""}</span>
            </label>
          ))}
          {others.length > 0 && !showOthers && (
            <div className="gs-target" style={{ cursor: "pointer", opacity: 0.5, fontSize: 11, padding: "2px 0" }} onClick={() => setShowOthers(true)}>
              <span className="ad" style={{ fontSize: 11 }}>other targets ({others.length})…</span>
            </div>
          )}
          {showOthers && others.map((c) => (
            <label key={c.uid} className="gs-target">
              <input type="checkbox" checked={sel.has(c.uid)} onChange={() => togg(c.uid)} />
              <span>{c.name}</span>
              <span className="ad">{c.side === "ally" ? "ally" : "enemy"}{c.unconscious ? " · unconscious" : ""}</span>
            </label>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center" }}>
          <button className="btn primary" disabled={!sel.size || (!noSave && !parseInt(dc, 10)) || (noSave && !dmg.trim())}
            onClick={() => onResolve({ ability: ab, dc: noSave ? null : parseInt(dc, 10), dmg: dmg.trim(), dtype: dtype.trim(), halfOn, targets: [...sel], noSave, cond: preset?.cond || null, condR: preset?.condR || null, effectUid: preset?.effectUid || null, laUid: preset?.laUid || null, cmdPick: !!preset?.cmdPick, concSrc: preset?.concSrc || null, concCast: preset?.concCast || null, rpt: !!preset?.rpt, rptNote: preset?.rptNote || null, spellCastUid: preset?.spellCastUid || null })}>
            {noSave ? `Apply to ${sel.size}` : `Roll ${sel.size} save${sel.size === 1 ? "" : "s"}`}
          </button>
          <span className="spacer" />
          <button className="btn small" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function UseConfirmModal({ c, kind, k, api, onClose }) {
  const [spellOpen, setSpellOpen] = useState(null);
  let title, body, rem, max, doUse;
  if (kind === "lr" && c.legRes) {
    title = "Legendary Resistance";
    const tr = (c.traits || []).find((t) => /^Legendary Resistance/.test(t.n));
    body = tr ? tr.d : "If the creature fails a saving throw, it can choose to succeed instead.";
    rem = c.legRes.rem; max = c.legRes.max;
    doUse = () => api.spendLegRes(c.uid);
  } else if (kind === "la" && c.legendary) {
    title = "Legendary Actions";
    body = `At the end of another creature's turn, ${c.name} can spend a use on one option: ${(c.legendary.options || []).map((o) => o.n).join(" · ")}. Tip: the 👑 banner between turns lets you spend & roll specific options.`;
    rem = c.legendary.rem; max = c.legendary.max;
    doUse = () => api.spendLA(c.uid);
  } else if (kind === "use" && c.uses?.[k]) {
    const u = c.uses[k];
    title = u.n.replace(USES_RE, "").trim().replace(/\.$/, "");
    const arr = { t: c.traits, a: c.actions, b: c.bonus, r: c.reactions }[k[0]] || [];
    const item = arr[+k.slice(1)];
    body = (item && item.d) || "";
    rem = u.rem; max = u.max;
    doUse = () => api.spendUse(c.uid, k);
  } else return null;
  const needsReaction = kind === "use" && k && k[0] === "r";
  const reactionBlocked = needsReaction && !c.reaction;
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{c.name} — {title} <span style={{ color: "var(--faint)", fontSize: 12, fontWeight: 400 }}>{rem}/{max} left</span></h3>
        <div className="trait" style={{ margin: "6px 0 12px" }}>
          {body} <SpellBits turnKey={typeof turnKey === "undefined" ? null : turnKey} text={title + ". " + body} rowKey="u" open={spellOpen} setOpen={setSpellOpen} c={c} api={api} />
        </div>
        {reactionBlocked && (
          <div className="ad" style={{ marginBottom: 8 }}>⚠ Reaction already used this round — it refreshes at the start of {c.name}'s turn, or toggle R on the roster to re-arm.</div>
        )}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <button className="btn primary" disabled={rem <= 0 || reactionBlocked} onClick={() => { doUse(); onClose(); }}>Use{needsReaction && !reactionBlocked ? " (spends reaction)" : ""}</button>
          <span className="spacer" />
          <button className="btn small" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function SpellBook({ onClose, activeC, onConc }) {
  const [q, setQ] = useState("");
  const [lvl, setLvl] = useState(null); // null all, 0 cantrip, 1-9
  const [open, setOpen] = useState(null);
  const keys = useMemo(() => Object.keys(SPELL_REF).sort((a, b) => SPELL_REF[a].n.localeCompare(SPELL_REF[b].n)), []);
  const lvlOf = (s) => { const m = s.m.match(/^Level (\d+)/); return m ? +m[1] : 0; };
  const list = keys.filter((k) => {
    const s = SPELL_REF[k];
    if (q && !s.n.toLowerCase().includes(q.toLowerCase())) return false;
    if (lvl != null && lvlOf(s) !== lvl) return false;
    return true;
  });
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal sbook" onClick={(e) => e.stopPropagation()}>
        <div className="sbook-head">
          <h3 style={{ margin: 0 }}>Spell Compendium <span style={{ color: "var(--faint)", fontSize: 11, fontWeight: 400 }}>{list.length} of {keys.length}</span></h3>
          <button className="btn small ghost" onClick={onClose}>✕</button>
        </div>
        <input className="sbook-search" autoFocus style={{ color: "var(--text)", WebkitTextFillColor: "var(--text)", background: "var(--panel)", caretColor: "var(--gold)" }} placeholder="Search spells…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="sbook-lvls">
          <button className={`lvlchip ${lvl == null ? "on" : ""}`} onClick={() => setLvl(null)}>All</button>
          <button className={`lvlchip ${lvl === 0 ? "on" : ""}`} onClick={() => setLvl(lvl === 0 ? null : 0)}>Cantrip</button>
          {[1,2,3,4,5,6,7,8,9].map((n) => (
            <button key={n} className={`lvlchip ${lvl === n ? "on" : ""}`} onClick={() => setLvl(lvl === n ? null : n)}>{n}</button>
          ))}
        </div>
        <div className="sbook-list">
          {list.length === 0 && <div className="ad" style={{ padding: 12 }}>No spells match.</div>}
          {list.map((k) => {
            const s = SPELL_REF[k];
            const conc = /Concentration/i.test(s.du), rit = /Ritual/i.test(s.ct);
            return (
              <div key={k} className="sbook-row">
                <div className="sbook-name" onClick={() => setOpen(open === k ? null : k)}>
                  <b>{s.n}</b>
                  {conc && <span className="sbadge">C</span>}
                  {rit && <span className="sbadge">R</span>}
                  <span className="sbook-meta">{s.m}</span>
                </div>
                {open === k && (
                  <>
                    <SpellInfo k={k} />
                    {conc && activeC && (
                      <button className="btn small cond" style={{ margin: "4px 0 6px" }}
                        onClick={() => onConc(activeC.uid, s.n)}>◈ Mark {activeC.name} concentrating on this</button>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SpellInfo({ k, c, api, laUid, laLocked, turnKey }) {
  const ownTurn = !!(c && turnKey && turnKey.endsWith(`:${c.uid}`));
  const latched = ownTurn && c.spellCastTurn === turnKey;
  const econBlock = !ownTurn || laUid ? null
    : latched ? "Already cast a spell this turn"
    : c.spellStyle === "replace" && atkLeft(c) <= 0 ? "No attacks left to replace with Spellcasting"
    : c.spellStyle === "action" && (c.atkUsed || 0) > 0 ? "Already used its action to attack this turn"
    : null;
  const s = SPELL_REF[k];
  if (!s) return null;
  const saveAb = (s.d.match(/(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma) saving throw/i) || [])[1];
  return (
    <div className="reminder spellinfo">
      {c && api && !saveAb && (() => {
        const buff = spellCondFrom(s.d, s.du);
        if (!buff || !["Invisible"].includes(buff.cond)) return null;
        const conc = /Concentration/i.test(s.du);
        const condR = conc && /hour/i.test(s.du) ? null : buff.condR;
        return (
          <div className="casterline">
            🪄 <b>{c.name}</b> can cast this
            <button className="btn small primary" style={{ marginLeft: 8 }}
              disabled={laUid ? (laLocked || c.legendary?.rem <= 0) : !!econBlock}
              title={laUid && laLocked ? "Legendary action already used this turn" : econBlock ? `${econBlock} — Undo or tap +1 to override` : c.spellStyle === "replace" ? "Casting replaces one attack" : "Casting uses this creature's action"}
              onClick={() => api.openBuffCast({ k, casterUid: c.uid, laUid: laUid || null, cond: buff.cond, condR, conc: conc ? s.n : null })}>
              🪄 Cast — {buff.cond}
            </button>
            {econBlock === "Already cast a spell this turn" && (
              <button className="btn tiny ghost" title="Allow an additional spell this turn (DM override)" onClick={() => api.grantSpell(c.uid)}>+1</button>
            )}
          </div>
        );
      })()}
      {c && c.spellDC != null && (
        <div className="casterline">
          ⚑ <b>{c.name}</b> — spell save DC <b>{c.spellDC}</b>{c.spellAtk != null ? <> · <b>{fmtMod(c.spellAtk)}</b> spell attack</> : null}
          {saveAb && api && (
            <button className="btn small primary" style={{ marginLeft: 8 }}
              disabled={laUid ? (laLocked || c.legendary?.rem <= 0) : !!econBlock}
              title={laUid && laLocked ? "Legendary action already used this turn" : laUid ? "Resolving spends a legendary action" : econBlock ? `${econBlock} — Undo or tap +1 to override` : ownTurn ? (c.spellStyle === "replace" ? "Casting replaces one attack" : "Casting uses this creature's action") : undefined}
              onClick={() => { const sd = spellSaveDmg(s.d, c.spellDmgRatio); api.openGroupSave({ name: `${c.name} — ${s.n}`, ability: saveAb.slice(0, 3).toLowerCase(), dmg: sd ? sd.dmg : "", dtype: sd ? sd.dtype : "", half: sd ? sd.half : true, dc: c.spellDC, single: singleTargetText(s.d), casterUid: c.uid, laUid: laUid || null, noDmg: !/damage/i.test(s.d), ...(k === "command" ? {} : (spellCondFrom(s.d, s.du) || {})), cmdPick: k === "command", rpt: /repeats the save/i.test(s.d), rptNote: /line of sight/i.test(s.d) ? "only if it can\u2019t see the caster" : null, spellCastUid: !laUid && ownTurn ? c.uid : null, ...(/Concentration/i.test(s.du) ? { concSrc: c.uid, concCast: s.n } : {}) }); }}>
              ⭗ Roll this save{laUid ? " (spends LA)" : ""}
            </button>
          )}
          {latched && !laUid && api && (
            <button className="btn tiny ghost" title="Allow an additional spell this turn (DM override)" onClick={() => api.grantSpell(c.uid)}>+1</button>
          )}
        </div>
      )}
      <b>{s.n}</b> <span style={{ color: "var(--faint)" }}>({s.m})</span>
      <div className="spellstats">Casting: {s.ct} · Range: {s.rg} · {s.cp} · Duration: {s.du}</div>
      {s.d}
    </div>
  );
}

function SpellBits({ text, rowKey, open, setOpen, c, api, turnKey }) {
  const refs = spellRefsIn(text);
  if (!refs.length) return null;
  return (
    <>
      {refs.map((k) => {
        const su = c && api && c.spellUses ? c.spellUses[k] : null;
        return (
          <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
            <button className="advhint" onClick={() => setOpen(open === `${rowKey}:${k}` ? null : `${rowKey}:${k}`)}>✦ {SPELL_REF[k].n}</button>
            {su && (
              <button className={`usepips spellpips ${su.rem <= 0 ? "spent" : ""}`} disabled={su.rem <= 0}
                title={`${SPELL_REF[k].n}: ${su.rem}/${su.max} casts left today — tap to spend`}
                onClick={() => api.spendSpellUse(c.uid, k)}>
                {Array.from({ length: su.max }, (_, j) => (j < su.rem ? "●" : "○")).join("")}
              </button>
            )}
          </span>
        );
      })}
      {refs.map((k) => (open === `${rowKey}:${k}` ? <SpellInfo key={"i" + k} k={k} c={c} api={api} turnKey={turnKey} /> : null))}
    </>
  );
}

function LegendaryOptions({ c, api, results, turnKey }) {
  const laLocked = turnKey != null && c.laTurnKey === turnKey;
  const [openInfo, setOpenInfo] = useState(null); // `${i}:a:${ai}` or `${i}:s:${key}`
  if (!c.legendary) return null;
  const toggle = (key) => setOpenInfo(openInfo === key ? null : key);
  return (
    <>
      {c.legendary.options.length === 0 && <div className="ad">No legendary options recorded for this creature.</div>}
      {laLocked && <div className="ad" style={{ padding: "2px 0 4px" }}>👑 Legendary action used — available again after the next creature's turn ends.</div>}
      {c.legendary.options.map((o, i) => {
        const atks = legAttackRefs(c, o);
        const spells = spellRefsIn(o.d);
        return (
          <div className="actrow" key={i}>
            <span className="an">{o.n}</span>
            <button className="btn small primary" disabled={c.legendary.rem <= 0 || laLocked} onClick={() => api.spendLA(c.uid)}>Spend</button>
            {atks.map((ar) => {
              const a = c.actions[ar.ai];
              return (
                <React.Fragment key={ar.ai}>
                  <button className="btn small primary" disabled={c.legendary.rem <= 0 || laLocked} onClick={() => api.spendLARoll(c.uid, ar.ai)}>⚔ Spend & roll {ar.name}</button>
                  <button className="statchip" title="Tap for full attack description" onClick={() => toggle(`${i}:a:${ar.ai}`)}>
                    {fmtMod(a.hit)} to hit{a.dmg ? ` · ${a.dmg} ${a.dtype}` : ""}{a.extra ? ` + ${a.extra} ${a.extraType}` : ""}
                  </button>
                </React.Fragment>
              );
            })}
            {(() => {
              const sr = legSaveRef(o);
              return sr ? (
                <button className="btn small primary" disabled={c.legendary.rem <= 0 || laLocked}
                  onClick={() => api.spendLAGroupSave(c.uid, sr, o.n)}>
                  🎲 Spend & roll — DC {sr.dc} {sr.ab.toUpperCase()}{sr.dmg ? ` · ${sr.dmg} ${sr.dtype}` : ""}
                </button>
              ) : null;
            })()}
            {spells.map((k) => (
              <button key={k} className="advhint" onClick={() => toggle(`${i}:s:${k}`)}>✦ {SPELL_REF[k].n}</button>
            ))}
            <span className="ad">{o.d}</span>
            {atks.map((ar) => results && results[`${c.uid}:${ar.ai}`] ? (
              <span className="results" key={"r" + ar.ai}>
                {results[`${c.uid}:${ar.ai}`].map((chip, j) => (
                  <span key={chip.id || j} className={`chip ${chip.k || ""}`}>{chip.dice && <DiceGroup dice={chip.dice} size={chip.dieSize} />}{chip.t}</span>
                ))}
              </span>
            ) : null)}
            {atks.map((ar) => openInfo === `${i}:a:${ar.ai}` ? (
              <div className="reminder" style={{ flexBasis: "100%", marginTop: 2, fontSize: 12 }} key={"ai" + ar.ai}>
                <b>{ar.name}.</b> {fmtMod(c.actions[ar.ai].hit)} to hit{c.actions[ar.ai].dmg ? `, ${c.actions[ar.ai].dmg} ${c.actions[ar.ai].dtype}` : ""}{c.actions[ar.ai].extra ? ` + ${c.actions[ar.ai].extra} ${c.actions[ar.ai].extraType}` : ""}. {c.actions[ar.ai].d}
              </div>
            ) : null)}
            {spells.map((k) => (openInfo === `${i}:s:${k}` ? <SpellInfo key={"s" + k} k={k} c={c} api={api} laUid={c.uid} laLocked={laLocked} turnKey={turnKey} /> : null))}
          </div>
        );
      })}
    </>
  );
}

function MonsterCard({ c, api, results, peek, turnKey }) {
  const [hintOpen, setHintOpen] = useState(null); // [actionIndex, hintIndex] of expanded advantage-hint chip
  const [spellOpen, setSpellOpen] = useState(null); // `${rowKey}:${spellKey}` of expanded spell chip
  const cov = coverBonus(c);
  const effAc = c.ac + (c.acBoost || 0) + cov;
  return (
    <div className="card torch">
      <h3>{c.name}{c.cr ? <span style={{ color: "var(--faint)", marginLeft: 8, fontSize: 11 }}>CR {c.cr}</span> : null}</h3>
      <div className="statline">
        <b>AC</b> {effAc}{(c.acBoost || cov) ? ` (base ${c.ac}${cov ? `, +${cov} cover` : ""})` : ""} · <b>HP</b> {c.hp}/{c.maxHp}{isBloodied(c) && <span className="bloodtag">Bloodied</span>} · <b>Speed</b> {c.spd}
        {c.resist?.length > 0 && <> · <b>Resist</b> {c.resist.join(", ")}</>}
        {c.immune?.length > 0 && <> · <b>Immune</b> {c.immune.join(", ")}</>}
        {c.vuln?.length > 0 && <> · <b>Vulnerable</b> {c.vuln.join(", ")}</>}
      </div>
      {c.notes && <div className="trait"><b>Notes:</b> {c.notes}</div>}
      {c.unconscious && !c.dead && (
        <div className="reminder" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
          <span style={{ flex: 1 }}>💀 {c.stable ? "Unconscious but stable." : `Unconscious — death saves! ${c.ds?.s ?? 0}✓ ${c.ds?.f ?? 0}✗`}</span>
          <button className="btn small" onClick={() => api.openDeathSaves(c.uid)}>Record save…</button>
        </div>
      )}
      {c.conditions.length > 0 && (
        <div className="reminder" style={{ marginBottom: 6 }}>
          {c.conditions.map((cd, i) => (
            <div key={i} style={{ fontSize: 12 }}>
              <b>{cd.name}{cd.rounds != null ? ` (${cd.rounds} round${cd.rounds === 1 ? "" : "s"} left)` : ""}.</b>{" "}
              {CONDITIONS[cd.name] || "Custom effect — as the DM decreed."}
            </div>
          ))}
        </div>
      )}
      {c.traits.map((t, i) => (
        <div key={i} className="trait"><b>{t.n}.</b> <UsePips c={c} k={"t" + i} api={api} /> {t.d} <SpellBits turnKey={typeof turnKey === "undefined" ? null : turnKey} text={t.n + ". " + t.d} rowKey={"t" + i} open={spellOpen} setOpen={setSpellOpen} c={c} api={api} /></div>
      ))}

      {results[`${c.uid}:save`] && (
        <div className="savestrip">
          {results[`${c.uid}:save`].map((chip, j) => (
            <span key={chip.id || j} className={`chip ${chip.k || ""}`}>{chip.dice && <DiceGroup dice={chip.dice} size={chip.dieSize} />}{chip.t}</span>
          ))}
        </div>
      )}
      {c.multi && <div className="reminder" style={{ marginTop: 8 }}>⚔ <b>Multiattack:</b> {c.multi}</div>}
      {c.legendary && <div className="reminder" style={{ marginTop: 8 }}>👑 Legendary actions: {c.legendary.rem}/{c.legendary.max} available (spend between other creatures' turns)</div>}

      <div className="sect">
        <div className="lbl">Actions
          {!peek && atkMaxOf(c) > 0 && (
            <span className="atkbudget" title={`Attack rolls left this turn (Multiattack allows ${atkMaxOf(c)})`}>
              ⚔ {Math.max(atkLeft(c), 0)}/{atkMaxOf(c)}
              <button className="btn tiny ghost" title="Grant an extra attack this turn (Haste, etc.)" onClick={() => api.grantAttack(c.uid)}>+1</button>
            </span>
          )}
        </div>
        {c.actions.map((a, i) => (
          <div className="actrow" key={i}>
            <span className="an">{a.n}{a.rech ? <span style={{ color: "var(--faint)", fontSize: 11 }}> (Recharge {a.rech}–6)</span> : null}</span>
            {a.kind === "atk" && (
              <button className="btn small primary" disabled={(a.rech && !a.ready) || (peek && !c.reaction) || (!peek && (atkLeft(c) <= 0 || atkNameLeft(c, a.n) <= 0))}
                title={peek ? (c.reaction ? "Off-turn attack — spends this creature's reaction" : "Reaction already used this round") : atkLeft(c) <= 0 ? "No attacks left this turn — tap +1 above to grant one (or Undo a misclick)" : atkNameLeft(c, a.n) <= 0 ? `${a.n} has no uses left this turn (Multiattack caps it) — +1 or Undo if needed` : undefined}
                onClick={() => (peek ? api.rollOppAttack(c.uid, i) : api.rollAttack(c.uid, i))}>
                {peek ? "⚔ Opportunity attack" : "Attack"} {fmtMod(a.hit)}
              </button>
            )}
            {a.kind === "save" && (
              <button className="btn small primary" disabled={(a.rech && !a.ready) || peek} title={peek ? "Actions happen on the creature's own turn" : undefined} onClick={() => api.useSaveAction(c.uid, i)}>
                Use — DC {a.save?.dc} {a.save?.ability}
              </button>
            )}
            {a.kind === "save" && a.save?.dc && (
              <button className="btn small cond" disabled={a.rech && !a.ready} title="Roll this save for multiple targets and apply damage"
                onClick={() => api.openGroupSave({ name: `${c.name} — ${a.n}`, ability: a.save.ability, dc: a.save.dc, dmg: a.dmg || (a.d && (a.d.match(/(\d+d\d+(?:[+-]\d+)?)/) || [])[1]) || "", dtype: a.dtype || "", casterUid: c.uid })}>
                ⭗ Group
              </button>
            )}
            {a.kind !== "atk" && a.kind !== "save" && (
              <button className="btn small" disabled={peek} title={peek ? "Actions happen on the creature's own turn" : undefined} onClick={() => api.useTextAction(c.uid, i)}>Use</button>
            )}
            {a.conc && <span className="chip" title="Concentration spell">conc</span>}
            {a.rech && !a.ready && <span className="chip bad">not recharged</span>}
            {a.kind === "atk" && advHints(c, a).map((h, hi) => (
              <button key={hi} className="advhint" onClick={() => setHintOpen(hintOpen && hintOpen[0] === i && hintOpen[1] === hi ? null : [i, hi])}>{h.t}</button>
            ))}
            {a.kind === "atk" && condDamage(a).map((cd, ci) => (
              <button key={"cd" + ci} className="btn small cond" title={a.d} onClick={() => api.rollBonus(c.uid, i, cd.dice, cd.dtype, cd.alt)}>
                ⚡ {cd.alt ? `${cd.dice} ${cd.dtype} alt` : `+${cd.dice} ${cd.dtype}`}
              </button>
            ))}
            <span className="ad">
              {a.kind === "atk" && <>{fmtMod(a.hit)} to hit{a.dmg ? <>, {a.dmg} {a.dtype}</> : null}{a.extra ? ` + ${a.extra} ${a.extraType}` : ""}. </>}
              {a.d}
            </span>
            {results[`${c.uid}:${i}`] && (
              <span className="results">
                {results[`${c.uid}:${i}`].map((chip, j) => (
                  chip.applyTo
                    ? <button key={chip.id || j} className="chip cond" style={{ cursor: "pointer" }} onClick={() => api.applyChipParts(chip.resKey, chip.id, chip.applyTo, chip.parts)}>⚔ {chip.t}</button>
                    : <span key={chip.id || j} className={`chip ${chip.k || ""}`}>{chip.dice && <DiceGroup dice={chip.dice} size={chip.dieSize} />}{chip.t}</span>
                ))}
              </span>
            )}
            <UsePips c={c} k={"a" + i} api={api} />
            <SpellBits turnKey={typeof turnKey === "undefined" ? null : turnKey} text={(a.n || "") + ". " + (a.d || "")} rowKey={"a" + i} open={spellOpen} setOpen={setSpellOpen} c={c} api={api} />
            {a.kind === "atk" && hintOpen && hintOpen[0] === i && (() => {
              const h = advHints(c, a)[hintOpen[1]];
              return h ? (
                <div className="reminder" style={{ flexBasis: "100%", marginTop: 2, fontSize: 12 }}>
                  <b>{h.t.replace("⊕ ", "")}.</b> {h.desc}
                </div>
              ) : null;
            })()}
          </div>
        ))}
      </div>

      {c.legendary && c.legendary.options.length > 0 && (
        <div className="sect">
          <div className="lbl">Legendary Actions ({c.legendary.rem} left)</div>
          <LegendaryOptions c={c} api={api} results={results} turnKey={turnKey} />
        </div>
      )}

      {(c.loot || []).length > 0 && (
        <div className="sect">
          <div className="lbl">Items carried</div>
          {c.loot.map((raw, i) => {
            const it = lootObj(raw);
            const usable = it.heal || it.ch != null || (it.c && !it.wpn) || (it.d && !it.wpn && !it.armor && !it.acB);
            return (
              <div className="actrow" key={i}>
                <span className="an">{it.n}{it.ch != null && <span style={{ color: "var(--faint)", fontSize: 11 }}> ({it.ch} ch)</span>}</span>
                {it.wpn && <span className="chip ok" title="This weapon appears as an attack above">⚔ in attacks</span>}
                {(it.armor || it.acB) && (
                  <button className="btn small" onClick={() => api.equipItem(c.uid, i)}>
                    {it.eq ? "Unequip" : "Equip"}
                  </button>
                )}
                {usable && (
                  <button className="btn small" disabled={it.ch === 0}
                    onClick={() => api.useItem(c.uid, i)}>
                    {it.heal ? "Drink" : it.ch != null ? "Use charge" : it.c ? "Consume" : "Use"}
                  </button>
                )}
                <span className="ad">{it.d || ""}{it.heal ? ` (${it.heal})` : ""}</span>
              </div>
            );
          })}
        </div>
      )}

      {c.bonus?.length > 0 && (
        <div className="sect">
          <div className="lbl">Bonus Actions</div>
          {c.bonus.map((b, i) => (
            <div className="trait" key={i}><b>{b.n}.</b> <UsePips c={c} k={"b" + i} api={api} turnOnly={peek} /> {b.d} <SpellBits turnKey={typeof turnKey === "undefined" ? null : turnKey} text={(b.n || "") + ". " + (b.d || "")} rowKey={"b" + i} open={spellOpen} setOpen={setSpellOpen} c={c} api={api} /></div>
          ))}
        </div>
      )}

      {c.reactions?.length > 0 && (
        <div className="sect">
          <div className="lbl">Reactions {c.reaction ? "(available)" : "(used)"}</div>
          {c.reactions.map((r, i) => (
            <div className="trait" key={i}><b>{r.n}.</b> <UsePips c={c} k={"r" + i} api={api} /> {r.d} <SpellBits turnKey={typeof turnKey === "undefined" ? null : turnKey} text={(r.n || "") + ". " + (r.d || "")} rowKey={"r" + i} open={spellOpen} setOpen={setSpellOpen} c={c} api={api} /></div>
          ))}
        </div>
      )}

      <div className="sect" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button className="btn small" onClick={() => api.openSaveRoll(c.uid)}>Roll save…</button>
        <button className="btn small" onClick={() => api.openDamage(c.uid)}>Damage / heal…</button>
        <button className="btn small" onClick={() => api.cycleAdv(c.uid)}>
          Rolls: {c.advMode === "none" ? "normal" : c.advMode === "adv" ? "ADVANTAGE" : "DISADVANTAGE"}
        </button>
        <button className="btn small" onClick={() => api.rename(c.uid)}>Rename…</button>
      </div>
    </div>
  );
}

function PlayerCard({ c, api, results }) {
  const hints = c.conditions.map((cd) => ({ n: cd.name, r: cd.rounds, d: CONDITIONS[cd.name] || null }));
  return (
    <div className="card torch">
      <h3>{c.name} <span style={{ color: "var(--faint)", fontSize: 11 }}>{c.side === "ally" ? "player / ally" : "npc"}</span></h3>
      {results && results[`${c.uid}:save`] && (
        <div className="savestrip">
          {results[`${c.uid}:save`].map((chip, j) => (
            <span key={chip.id || j} className={`chip ${chip.k || ""}`}>{chip.dice && <DiceGroup dice={chip.dice} size={chip.dieSize} />}{chip.t}</span>
          ))}
        </div>
      )}
      <div className="statline">
        {c.hp != null && <><b>HP</b> {c.hp}/{c.maxHp}{isBloodied(c) && <span className="bloodtag">Bloodied</span>} · </>}
        {c.ac != null && <><b>AC</b> {c.ac + (c.acBoost || 0)} · </>}
        {c.pp != null && <><b>PP</b> {c.pp} · </>}
        <b>Initiative</b> {c.init ?? "—"}
        {c.concentration && <> · <b>Concentrating:</b> {c.concentration}</>}
      </div>
      {c.unconscious && !c.dead && (
        <div className="reminder" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ flex: 1 }}>💀 {c.stable ? "Unconscious but stable." : `Unconscious — death saves! ${c.ds?.s ?? 0}✓ ${c.ds?.f ?? 0}✗`}</span>
          <button className="btn small" onClick={() => api.openDeathSaves(c.uid)}>Record save…</button>
        </div>
      )}
      {c.advMode !== "none" && (
        <div className="reminder" style={{ marginTop: 6 }}>
          {c.advMode === "adv" ? "⬆ Rolls at ADVANTAGE" : "⬇ Rolls at DISADVANTAGE"}
        </div>
      )}
      {hints.length > 0 && (
        <div className="sect">
          <div className="lbl">Active conditions — roll reminders</div>
          {hints.map((h, i) => (<div className="trait" key={i}><b>{h.n}{h.r != null ? ` (${h.r} round${h.r === 1 ? "" : "s"} left)` : ""}.</b> {h.d || "Custom effect — as the DM decreed."}</div>))}
        </div>
      )}
      {hints.length === 0 && !c.unconscious && <div className="trait" style={{ marginTop: 6 }}>No conditions. The floor is theirs.</div>}
      <div className="sect" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button className="btn small" onClick={() => api.addCondition(c.uid)}>Add condition…</button>
        <button className="btn small" onClick={() => api.setConc(c.uid)}>Set concentration…</button>
        <button className="btn small" onClick={() => api.cycleAdv(c.uid)}>Adv/dis on rolls</button>
      </div>
    </div>
  );
}

function EffectCard({ c, api, round }) {
  const fx = c.fx;
  return (
    <div className="card torch">
      <h3>✦ {c.name}</h3>
      <div className="statline">
        <b>Initiative</b> {c.init ?? "—"}
        {c.rounds != null && <> · <b>{c.rounds}</b> round{c.rounds === 1 ? "" : "s"} remaining</>}
      </div>
      {fx && api && (
        <div className="actrow" style={{ marginTop: 6 }}>
          <button className="btn small primary" disabled={c.fxUsedRound === round}
            title={c.fxUsedRound === round ? "Already used this round — refreshes next round" : undefined}
            onClick={() => api.resolveEffect(c.uid)}>
            {c.fxUsedRound === round ? "✓ Used this round" : <>⚡ Resolve — {fx.mech === "dmg" ? `${fx.dmg} ${fx.dtype || "damage"}, no save` : `DC ${fx.dc} ${fx.ab.toUpperCase()}${fx.dmg ? `, ${fx.dmg} ${fx.dtype || ""}` : ""}${fx.cond ? `, ${fx.cond} on fail` : ""}`}</>}
          </button>
        </div>
      )}
      {c.desc && <div className="trait">{c.desc}</div>}
      {c.rounds == null && <div className="trait" style={{ color: "var(--faint)" }}>No duration set — persists until removed.</div>}
    </div>
  );
}

/* -------- modals -------- */

function DamageModal({ state, presetUid, onApply, onClose }) {
  const targets = state.combatants.filter((c) => c.type !== "effect");
  const [amt, setAmt] = useState("");
  const [dtype, setDtype] = useState("");
  const [mode, setMode] = useState("dmg"); // dmg | heal | thp
  const heal = mode === "heal";
  const [sel, setSel] = useState(() => new Set(presetUid ? [presetUid] : []));
  const [half, setHalf] = useState(() => new Set());
  const [more, setMore] = useState(!presetUid);
  const visibleTargets = more ? targets : targets.filter((t) => t.uid === presetUid);
  const toggle = (s, uid, setter) => { const n = new Set(s); n.has(uid) ? n.delete(uid) : n.add(uid); setter(n); };
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{mode === "heal" ? "Heal" : mode === "thp" ? "Temp HP" : "Damage"}</h3>
        <div className="tabs" style={{ marginBottom: 8 }}>
          {[["dmg", "Damage"], ["heal", "Heal"], ["thp", "Temp HP"]].map(([k, lbl]) => (
            <button key={k} className="btn small"
              style={mode === k ? { borderColor: "var(--gold)", background: "var(--gold-soft)" } : {}}
              onClick={() => setMode(k)}>{lbl}</button>
          ))}
        </div>
        {mode === "thp" && (
          <div className="trait" style={{ fontSize: 12, color: "var(--faint)", marginBottom: 6 }}>
            Doesn't stack — targets keep the higher value. Healing won't restore it.
          </div>
        )}
        <div className="frow">
          <label>Amount</label>
          <input type="number" autoFocus value={amt} onChange={(e) => setAmt(e.target.value)} />
        </div>
        {mode === "dmg" && (
          <div className="frow">
            <label>Damage type</label>
            <select value={dtype} onChange={(e) => setDtype(e.target.value)}>
              <option value="">(untyped / quick)</option>
              {DTYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
            </select>
          </div>
        )}
        <div className="lbl" style={{ fontSize: 11, color: "var(--faint)", margin: "8px 0 4px" }}>
          {more ? <>Targets {mode === "dmg" ? "— check “½” for creatures that saved" : ""}</> : <>Target {mode === "dmg" ? "— “½” if they saved" : ""}</>}
        </div>
        {visibleTargets.map((m) => (
          <div className="targetline" key={m.uid}>
            <input type="checkbox" checked={sel.has(m.uid)} onChange={() => toggle(sel, m.uid, setSel)} />
            <span style={{ flex: 1, opacity: m.dead ? 0.5 : 1 }}>
              {m.name} {m.dead ? "(dead)" : m.hp != null ? `· ${m.hp}/${m.maxHp}${m.thp ? ` (+${m.thp})` : ""}` : "· self-tracked (no temp HP tracking)"}
            </span>
            {mode === "dmg" && <label style={{ fontSize: 12, color: "var(--dim)" }}><input type="checkbox" checked={half.has(m.uid)} onChange={() => toggle(half, m.uid, setHalf)} /> ½</label>}
          </div>
        ))}
        {targets.length === 0 && <div className="trait">No creatures in combat yet.</div>}
        {!more && targets.length > 1 && (
          <button className="btn small ghost" onClick={() => setMore(true)}>{mode === "heal" ? "Heal" : mode === "thp" ? "Grant to" : "Damage"} more combatants ▼</button>
        )}
        <div className="frow" style={{ marginTop: 12, justifyContent: "flex-end" }}>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={!amt || sel.size === 0}
            onClick={() => onApply({ amount: parseInt(amt, 10), dtype: dtype || null, mode, targets: [...sel], half: [...half] })}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

function SaveRollModal({ c, onRoll, onClose, rolled }) {
  if (rolled) {
    return (
      <div className="overlay" onClick={onClose}>
        <div className="modal" onClick={onClose} style={{ cursor: "pointer" }}>
          <h3>{c.name} — {rolled.badge.ab} save{rolled.dc ? ` vs DC ${rolled.dc}` : ""}</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", margin: "10px 0" }}>
            <DiceGroup dice={rolled.dice} size={46} />
            <span style={{ fontFamily: "var(--mono)", fontSize: 15, color: "var(--dim)" }}>{fmtMod(rolled.mod)}</span>
            <span style={{ fontSize: 28, fontWeight: 700 }}>= {rolled.badge.total}</span>
            {rolled.badge.ok != null && (
              <span className={`verdict ${rolled.badge.ok ? "good" : "bad"}`}>{rolled.badge.ok ? "SUCCESS" : "FAIL"}</span>
            )}
          </div>
          <div className="ad">tap anywhere to dismiss — result stays on the card & roster</div>
        </div>
      </div>
    );
  }

  const [dc, setDc] = useState("");
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Saving throw — {c.name}</h3>
        <div className="frow">
          <label>DC (optional)</label>
          <input type="number" value={dc} onChange={(e) => setDc(e.target.value)} autoFocus />
          {c.advMode !== "none" && <span className={`advtag ${c.advMode}`}>{c.advMode === "adv" ? "ADV" : "DIS"}</span>}
        </div>
        <div className="pick">
          {["str", "dex", "con", "int", "wis", "cha"].map((ab) => (
            <button key={ab} className="btn" onClick={() => onRoll(ab, dc ? parseInt(dc, 10) : null)}>
              {ab.toUpperCase()} {fmtMod(saveMod(c, ab) + (ab === "dex" ? coverBonus(c) : 0))}{ab === "dex" && coverBonus(c) ? "*" : ""}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ConditionModal({ state, presetUid, onAdd, onClose }) {
  const [name, setName] = useState("Prone");
  const [custom, setCustom] = useState("");
  const [rounds, setRounds] = useState("");
  const targets = state.combatants.filter((c) => c.type !== "effect" && !c.dead);
  const [sel, setSel] = useState(() => new Set(presetUid ? [presetUid] : []));
  const toggle = (uid) => { const n = new Set(sel); n.has(uid) ? n.delete(uid) : n.add(uid); setSel(n); };
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Add condition</h3>
        <div className="frow">
          <label>Condition</label>
          <select value={name} onChange={(e) => setName(e.target.value)}>
            {Object.keys(CONDITIONS).sort().map((k) => (<option key={k}>{k}</option>))}
            <option value="__custom">Custom…</option>
          </select>
        </div>
        {name === "__custom" && (
          <div className="frow"><label>Name</label><input type="text" value={custom} onChange={(e) => setCustom(e.target.value)} autoFocus /></div>
        )}
        <div className="frow">
          <label>Duration (rounds)</label>
          <input type="number" value={rounds} onChange={(e) => setRounds(e.target.value)} placeholder="∞" />
        </div>
        {CONDITIONS[name] && <div className="trait" style={{ marginBottom: 8 }}>{CONDITIONS[name]}</div>}
        <div className="lbl" style={{ fontSize: 11, color: "var(--faint)", margin: "4px 0" }}>Targets — check everyone caught in it</div>
        {targets.map((t) => (
          <div className="targetline" key={t.uid}>
            <input type="checkbox" checked={sel.has(t.uid)} onChange={() => toggle(t.uid)} />
            <span style={{ flex: 1 }}>{t.name}</span>
          </div>
        ))}
        <div className="frow" style={{ justifyContent: "flex-end", marginTop: 8 }}>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={sel.size === 0}
            onClick={() => onAdd(name === "__custom" ? (custom || "Effect") : name, rounds ? parseInt(rounds, 10) : null, [...sel])}>
            Apply to {sel.size}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeathSavesModal({ c, onRecord, onClose }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Death saves — {c.name}</h3>
        <div className="statline" style={{ fontSize: 14 }}>
          {c.stable ? <b>Stable</b> : (<>
            Successes: <b>{"●".repeat(c.ds?.s ?? 0)}{"○".repeat(3 - (c.ds?.s ?? 0))}</b> ·
            Failures: <b style={{ color: "var(--danger)" }}> {"●".repeat(c.ds?.f ?? 0)}{"○".repeat(3 - (c.ds?.f ?? 0))}</b>
          </>)}
        </div>
        <div className="trait" style={{ marginBottom: 10 }}>
          Player rolls a d20: 10+ is a success, 9 or less a failure. Nat 1 = two failures. Nat 20 = back up with 1 HP. Three successes = stable; three failures = death. Damage while down = one failure (two if it was a crit).
        </div>
        <div className="pick">
          <button className="btn" onClick={() => onRecord("success")}>✓ Success</button>
          <button className="btn" onClick={() => onRecord("fail")}>✗ Failure</button>
          <button className="btn" onClick={() => onRecord("crit")}>✗✗ Nat 1</button>
          <button className="btn primary" onClick={() => onRecord("nat20")}>Nat 20 — up at 1 HP!</button>
          <button className="btn" onClick={() => onRecord("stabilize")}>Stabilized (magic/medicine)</button>
          <button className="btn ghost" onClick={() => onRecord("reset")}>Reset</button>
        </div>
      </div>
    </div>
  );
}

const ABIL_FULL = { STR: "Strength", DEX: "Dexterity", CON: "Constitution", INT: "Intelligence", WIS: "Wisdom", CHA: "Charisma" };
const ABILS = Object.keys(ABIL_FULL);
const CR_LABELS = [...CR_STEPS.map(([l]) => l), "22", "23", "24", "25", "26", "28", "30"];

/* Prefill helpers: pull form-editable fields out of an existing statblock's save action,
   falling back to parsing its description text the same way the resolvers do. */
function saveRowFrom(a) {
  const d = a.d || "";
  const cond = (d.match(/ha(?:s|ve) the (\w+) condition/) || [])[1];
  return {
    orig: a, n: a.n,
    ability: (a.save?.ability || "DEX").toUpperCase(), dc: a.save?.dc ?? 13,
    dmg: a.dmg || (d.match(/(\d+d\d+(?:[+-]\d+)?)/) || [])[1] || "",
    dtype: a.dtype || (d.match(/\)\s*(\w+) damage/) || [, ""])[1].toLowerCase(),
    half: /Success:\s*Half/i.test(d), cond: CONDITIONS[cond] ? cond : "",
    rech: !!a.rech,
  };
}

function synthSaveText(r, dc) {
  const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
  let d = `${ABIL_FULL[r.ability]} Saving Throw: DC ${dc}, each creature in the area.`;
  const parts = [];
  if (r.dmg.trim()) parts.push(`${Math.max(1, Math.round(avgOfFormula(r.dmg)))} (${r.dmg.trim()}) ${cap(r.dtype)} damage`);
  if (r.cond) parts.push(`The target has the ${r.cond} condition until the end of its next turn`);
  if (parts.length) d += ` Failure: ${parts.join(", and ")}.`;
  if (r.dmg.trim() && r.half) d += " Success: Half damage.";
  return d;
}

function CustomMonsterForm({ onAdd, onSaveEdit, onClose, initial, mode = "create" }) {
  const src = initial || null;
  const editing = mode === "edit";
  const initAtkN = src ? parseAtkBudget(src.multi, src.actions || []).max : 1;
  const [f, setF] = useState({
    name: src?.name || "", count: 1, side: "enemy", notes: "",
    ac: src?.ac ?? 12, hp: src?.hp ?? 10, cr: src?.cr || "", atkN: initAtkN,
    str: src?.mods?.str ?? 0, dex: src?.mods?.dex ?? 0, con: src?.mods?.con ?? 0,
    int: src?.mods?.int ?? 0, wis: src?.mods?.wis ?? 0, cha: src?.mods?.cha ?? 0,
    resist: (src?.resist || []).join(", "), immune: (src?.immune || []).join(", "), vuln: (src?.vuln || []).join(", "),
  });
  const [acts, setActs] = useState(() => {
    const rows = (src?.actions || []).filter((a) => a.kind === "atk").map((a) => ({ orig: a, n: a.n, hit: a.hit ?? 0, dmg: a.dmg || "", dtype: a.dtype || "slashing" }));
    return rows.length ? rows : [{ n: "", hit: 4, dmg: "1d6+2", dtype: "slashing" }];
  });
  const [svActs, setSvActs] = useState(() => (src?.actions || []).filter((a) => a.kind === "save").map(saveRowFrom));
  const [saveToo, setSaveToo] = useState(true);
  const set = (k, v) => setF({ ...f, [k]: v });
  const setAct = (i, k, v) => setActs(acts.map((a, j) => (j === i ? { ...a, [k]: v } : a)));
  const setSv = (i, k, v) => setSvActs(svActs.map((a, j) => (j === i ? { ...a, [k]: v } : a)));
  const csv = (s) => s.split(",").map((x) => x.trim()).filter(Boolean);
  const num = (v, d = 0) => { const n = parseInt(v, 10); return isNaN(n) ? d : n; };
  const otherActs = (src?.actions || []).filter((a) => a.kind !== "atk" && a.kind !== "save");

  const buildSb = () => {
    const name = f.name.trim();
    const atkActions = acts.filter((a) => a.n.trim()).map((a) => ({ ...(a.orig || {}), n: a.n.trim(), kind: "atk", hit: num(a.hit), dmg: a.dmg, dtype: a.dtype }));
    const saveActions = svActs.filter((r) => r.n.trim()).map((r) => {
      const dc = num(r.dc, 13);
      const a = { ...(r.orig || {}), n: r.n.trim(), kind: "save", save: { ability: r.ability, dc } };
      if (r.dmg.trim()) { a.dmg = r.dmg.trim(); a.dtype = r.dtype; } else { delete a.dmg; delete a.dtype; }
      if (r.rech) a.rech = r.orig?.rech || 5; else delete a.rech;
      if (!r.orig) a.d = synthSaveText(r, dc);
      return a;
    });
    const n = Math.max(1, Math.min(6, num(f.atkN, 1)));
    let multi = src?.multi || null;
    if (n !== initAtkN) multi = n > 1 ? `The ${name.toLowerCase() || "creature"} makes ${n} attacks.` : null;
    const sb = {
      ...(src || {}), name, cr: f.cr || null, ac: num(f.ac, 10), hp: Math.max(1, num(f.hp, 1)),
      mods: { str: num(f.str), dex: num(f.dex), con: num(f.con), int: num(f.int), wis: num(f.wis), cha: num(f.cha) },
      resist: csv(f.resist), immune: csv(f.immune), vuln: csv(f.vuln),
      actions: [...atkActions, ...saveActions, ...otherActs], multi,
    };
    if (src && sb.hp !== src.hp) delete sb.hpF; // edited flat HP invalidates the roll formula
    return sb;
  };

  const carried = [];
  if (src?.traits?.length) carried.push(`${src.traits.length} trait${src.traits.length > 1 ? "s" : ""}`);
  if (src?.bonus?.length) carried.push("bonus actions");
  if (src?.reactions?.length) carried.push("reactions");
  if (src?.legendary) carried.push("legendary actions");
  if (otherActs.length) carried.push(otherActs.map((a) => a.n).join(", "));

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{editing ? "Edit monster" : mode === "clone" ? "Clone & tweak" : "Custom monster"}</h3>
        <div className="frow"><label>Name</label><input type="text" value={f.name} onChange={(e) => set("name", e.target.value)} autoFocus /></div>
        <div className="grid2">
          {!editing && (<>
            <div className="frow"><label>Count</label><input type="number" value={f.count} min={1} max={20} onChange={(e) => set("count", e.target.value)} /></div>
            <div className="frow"><label>Side</label>
              <select value={f.side} onChange={(e) => set("side", e.target.value)}>
                <option value="enemy">Enemy</option><option value="ally">Ally / NPC</option>
              </select></div>
          </>)}
          <div className="frow"><label>AC</label><input type="number" value={f.ac} onChange={(e) => set("ac", e.target.value)} /></div>
          <div className="frow"><label>HP</label><input type="number" value={f.hp} onChange={(e) => set("hp", e.target.value)} /></div>
          <div className="frow"><label title="Used by encounter balancing and XP math">CR</label>
            <select value={f.cr} onChange={(e) => set("cr", e.target.value)}>
              <option value="">—</option>
              {CR_LABELS.map((l) => (<option key={l} value={l}>{l}</option>))}
            </select></div>
          <div className="frow"><label title="How many attack rolls it gets per turn (Multiattack)">Attacks/turn</label><input type="number" min={1} max={6} value={f.atkN} onChange={(e) => set("atkN", e.target.value)} /></div>
        </div>
        <div className="lbl" style={{ fontSize: 11, color: "var(--faint)", margin: "8px 0 4px" }}>Ability modifiers (drive saves & initiative)</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 6, marginBottom: 6 }}>
          {["str", "dex", "con", "int", "wis", "cha"].map((k) => (
            <label key={k} style={{ fontSize: 10, color: "var(--faint)", textTransform: "uppercase", textAlign: "center", letterSpacing: ".06em" }}>
              {k}
              <input type="number" value={f[k]} onChange={(e) => set(k, e.target.value)} style={{ width: "100%", padding: "6px 2px", textAlign: "center", display: "block", marginTop: 2 }} />
            </label>
          ))}
        </div>
        <div className="frow"><label>Resistances</label><input type="text" placeholder="fire, cold…" value={f.resist} onChange={(e) => set("resist", e.target.value)} /></div>
        <div className="frow"><label>Immunities</label><input type="text" placeholder="poison…" value={f.immune} onChange={(e) => set("immune", e.target.value)} /></div>
        <div className="frow"><label>Vulnerabilities</label><input type="text" placeholder="bludgeoning…" value={f.vuln} onChange={(e) => set("vuln", e.target.value)} /></div>
        <div className="lbl" style={{ fontSize: 11, color: "var(--faint)", margin: "8px 0 4px" }}>Attacks (optional)</div>
        {acts.map((a, i) => (
          <div className="frow" key={i}>
            <input type="text" placeholder="Name" style={{ width: 110, flex: "none" }} value={a.n} onChange={(e) => setAct(i, "n", e.target.value)} />
            <input type="number" placeholder="+hit" value={a.hit} onChange={(e) => setAct(i, "hit", e.target.value)} />
            <input type="text" placeholder="2d6+3" style={{ width: 80, flex: "none" }} value={a.dmg} onChange={(e) => setAct(i, "dmg", e.target.value)} />
            <select value={a.dtype} onChange={(e) => setAct(i, "dtype", e.target.value)}>
              {DTYPES.map((t) => (<option key={t}>{t}</option>))}
            </select>
            <button className="btn small ghost" title="Remove attack" onClick={() => setActs(acts.filter((_, j) => j !== i))}>✕</button>
          </div>
        ))}
        <button className="btn small ghost" onClick={() => setActs([...acts, { n: "", hit: 4, dmg: "1d6+2", dtype: "slashing" }])}>+ another attack</button>
        <div className="lbl" style={{ fontSize: 11, color: "var(--faint)", margin: "8px 0 4px" }}>Save abilities — breath weapons, auras, stings (optional)</div>
        {svActs.map((r, i) => (
          <div key={i} style={{ border: "1px solid var(--line)", borderRadius: 8, padding: "6px 8px", marginBottom: 6 }}>
            <div className="frow">
              <input type="text" placeholder="Name (e.g. Fire Breath)" style={{ flex: 1 }} value={r.n} onChange={(e) => setSv(i, "n", e.target.value)} />
              <button className="btn small ghost" title="Remove ability" onClick={() => setSvActs(svActs.filter((_, j) => j !== i))}>✕</button>
            </div>
            <div className="frow" style={{ flexWrap: "wrap" }}>
              <label style={{ minWidth: 0 }}>DC</label>
              <input type="number" value={r.dc} onChange={(e) => setSv(i, "dc", e.target.value)} />
              <select value={r.ability} onChange={(e) => setSv(i, "ability", e.target.value)}>
                {ABILS.map((a2) => (<option key={a2}>{a2}</option>))}
              </select>
              <input type="text" placeholder="4d6 (blank = none)" style={{ width: 92, flex: "none" }} value={r.dmg} onChange={(e) => setSv(i, "dmg", e.target.value)} />
              <select value={r.dtype} onChange={(e) => setSv(i, "dtype", e.target.value)}>
                {DTYPES.map((t) => (<option key={t}>{t}</option>))}
              </select>
            </div>
            <div className="frow" style={{ flexWrap: "wrap" }}>
              <select value={r.cond} onChange={(e) => setSv(i, "cond", e.target.value)}>
                <option value="">no condition on fail</option>
                {Object.keys(CONDITIONS).map((cn) => (<option key={cn} value={cn}>{cn} on fail</option>))}
              </select>
              <label style={{ minWidth: 0 }}><input type="checkbox" checked={r.half} onChange={(e) => setSv(i, "half", e.target.checked)} /> half on save</label>
              <label style={{ minWidth: 0 }}><input type="checkbox" checked={r.rech} onChange={(e) => setSv(i, "rech", e.target.checked)} /> recharge 5–6</label>
            </div>
          </div>
        ))}
        <button className="btn small ghost" onClick={() => setSvActs([...svActs, { n: "", ability: "DEX", dc: 13, dmg: "", dtype: "fire", half: true, cond: "", rech: false }])}>+ save ability</button>
        {carried.length > 0 && (
          <div className="trait" style={{ marginTop: 8, color: "var(--faint)", fontSize: 11 }}>
            Carried over unchanged: {carried.join(" · ")}.
          </div>
        )}
        {!editing && (<>
          <div className="frow" style={{ marginTop: 6 }}><label>Notes</label><input type="text" value={f.notes} onChange={(e) => set("notes", e.target.value)} /></div>
          <div className="frow"><label style={{ minWidth: 0 }}><input type="checkbox" checked={saveToo} onChange={(e) => setSaveToo(e.target.checked)} /> Save to my bestiary</label></div>
        </>)}
        <div className="frow" style={{ justifyContent: "flex-end", marginTop: 8 }}>
          <button className="btn" onClick={onClose}>Cancel</button>
          {editing
            ? <button className="btn primary" disabled={!f.name.trim()} onClick={() => onSaveEdit(buildSb())}>Save changes</button>
            : <button className="btn primary" disabled={!f.name.trim()} onClick={() => onAdd(buildSb(), num(f.count, 1), f.side, f.notes, saveToo)}>Add</button>}
        </div>
      </div>
    </div>
  );
}

function BestiaryModal({ custom, onAdd, onDeleteCustom, onImport, onEdit, onClone, onClose }) {
  const [q, setQ] = useState("");
  const [count, setCount] = useState(1);
  const [rollHp, setRollHp] = useState(false);
  const [openCats, setOpenCats] = useState(() => new Set());
  const [showIO, setShowIO] = useState(false);
  const [ioText, setIoText] = useState("");
  const [ioMsg, setIoMsg] = useState("");
  const ql = q.toLowerCase();
  const mine = (custom || []).filter((b) => b.name.toLowerCase().includes(ql));
  const builtIn = BESTIARY.filter((b) => b.name.toLowerCase().includes(ql));

  const doImport = () => {
    try {
      let data = JSON.parse(ioText);
      if (!Array.isArray(data)) data = [data];
      const good = data.filter((sb) => sb && typeof sb.name === "string" && sb.name.trim() && !isNaN(parseInt(sb.ac, 10)) && !isNaN(parseInt(sb.hp, 10)));
      if (good.length === 0) { setIoMsg("No valid statblocks found — each needs at least name, ac, and hp."); return; }
      const res = onImport(good.map((sb) => ({ ...sb, ac: parseInt(sb.ac, 10), hp: parseInt(sb.hp, 10) })));
      setIoMsg(`Imported ${res.added} new, updated ${res.updated}.${data.length > good.length ? ` Skipped ${data.length - good.length} invalid.` : ""}`);
      setIoText("");
    } catch (e) { setIoMsg(`Couldn't parse JSON: ${e.message}`); }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Add from bestiary</h3>
        <div className="frow">
          <input type="text" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} autoFocus style={{ flex: 1 }} />
          <label>×</label>
          <input type="number" min={1} max={20} value={count} onChange={(e) => setCount(parseInt(e.target.value, 10) || 1)} />
        </div>
        <div className="frow">
          <label style={{ minWidth: 0 }}>
            <input type="checkbox" checked={rollHp} onChange={(e) => setRollHp(e.target.checked)} /> Roll HP from formula (varied HP per monster)
          </label>
        </div>

        {mine.length > 0 && (<>
          <div className="lbl" style={{ fontSize: 11, color: "var(--gold)", margin: "10px 0 2px", letterSpacing: ".1em", textTransform: "uppercase" }}>My bestiary</div>
          <div className="mlist">
            {mine.map((b) => (
              <span key={b.name} style={{ position: "relative" }}>
                <button className="btn" style={{ width: "100%" }} onClick={() => onAdd(b, count, rollHp)}>
                  {b.name}<br /><span className="cr">{b.cr ? `CR ${b.cr} · ` : ""}AC {b.ac} · {b.hp} HP</span>
                </button>
                <button className="btn small ghost" style={{ position: "absolute", top: 2, right: 2, padding: "0 5px" }}
                  title="Delete from my bestiary"
                  onClick={(e) => { e.stopPropagation(); onDeleteCustom(b.name); }}>✕</button>
                <button className="btn small ghost" style={{ position: "absolute", bottom: 2, right: 2, padding: "0 5px" }}
                  title="Edit this monster"
                  onClick={(e) => { e.stopPropagation(); onEdit(b); }}>✎</button>
              </span>
            ))}
          </div>
        </>)}

        {q.trim() ? (
          <>
            <div className="lbl" style={{ fontSize: 11, color: "var(--faint)", margin: "10px 0 2px", letterSpacing: ".1em", textTransform: "uppercase" }}>SRD — {builtIn.length} match{builtIn.length === 1 ? "" : "es"}</div>
            <div className="mlist">
              {builtIn.map((b) => (
                <span key={b.name} style={{ position: "relative" }}>
                  <button className="btn" style={{ width: "100%" }} onClick={() => onAdd(b, count, rollHp)}>
                    {b.name}<br /><span className="cr">CR {b.cr} · AC {b.ac} · {b.hp} HP{bestiaryBadges(b) ? " " : ""}{bestiaryBadges(b)}</span>
                  </button>
                  <button className="btn small ghost" style={{ position: "absolute", top: 2, right: 2, padding: "0 5px" }}
                    title="Clone & tweak — start a custom monster from this statblock"
                    onClick={(e) => { e.stopPropagation(); onClone(b); }}>⧉</button>
                </span>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="lbl" style={{ fontSize: 11, color: "var(--faint)", margin: "10px 0 2px", letterSpacing: ".1em", textTransform: "uppercase" }}>SRD bestiary — {BESTIARY.length} monsters</div>
            {BESTIARY_CATS.map(([key, label]) => {
              const members = BESTIARY.filter((b) => b.cat === key);
              const open = openCats.has(key);
              return (
                <div key={key}>
                  <button className="btn small" style={{ width: "100%", textAlign: "left", margin: "3px 0", ...(open ? { borderColor: "var(--gold)" } : {}) }}
                    onClick={() => { const n = new Set(openCats); n.has(key) ? n.delete(key) : n.add(key); setOpenCats(n); }}>
                    {open ? "▾" : "▸"} {label} <span className="cr">({members.length})</span>
                  </button>
                  {open && (
                    <div className="mlist" style={{ marginBottom: 6 }}>
                      {members.sort((a, b2) => crToNum(a.cr) - crToNum(b2.cr) || a.name.localeCompare(b2.name)).map((b) => (
                        <span key={b.name} style={{ position: "relative" }}>
                          <button className="btn" style={{ width: "100%" }} onClick={() => onAdd(b, count, rollHp)}>
                            {b.name}<br /><span className="cr">CR {b.cr} · AC {b.ac} · {b.hp} HP{bestiaryBadges(b) ? " " : ""}{bestiaryBadges(b)}</span>
                          </button>
                          <button className="btn small ghost" style={{ position: "absolute", top: 2, right: 2, padding: "0 5px" }}
                            title="Clone & tweak — start a custom monster from this statblock"
                            onClick={(e) => { e.stopPropagation(); onClone(b); }}>⧉</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}

        <div className="trait" style={{ marginTop: 10, color: "var(--faint)" }}>
          Any monster in combat can be kept via its row menu → "Save to my bestiary".
          Badges: 👑 legendary boss · 🪽 flies · 🕳 burrows · 🌊 aquatic. Groups sort by CR; search covers everything at once.
        </div>
        <div className="trait" style={{ marginTop: 6, color: "var(--faint)", fontSize: 11 }}>
          Includes content from the System Reference Document 5.2.1 by Wizards of the Coast LLC,
          licensed under the Creative Commons Attribution 4.0 International License.
        </div>

        <button className="btn small ghost" style={{ marginTop: 8 }} onClick={() => { setShowIO(!showIO); setIoMsg(""); }}>
          {showIO ? "Hide import / export ▲" : "Import / export JSON ▼"}
        </button>
        {showIO && (
          <div style={{ marginTop: 8 }}>
            <textarea rows={6} style={{ width: "100%", fontFamily: "var(--mono)", fontSize: 11 }}
              placeholder='Paste one statblock {…} or a list [{…},{…}] — same format the app uses. Minimum: {"name":"…","ac":13,"hp":22}. Add "mods","actions", etc. as needed.'
              value={ioText} onChange={(e) => setIoText(e.target.value)} />
            <div className="frow" style={{ marginTop: 6 }}>
              <button className="btn small primary" disabled={!ioText.trim()} onClick={doImport}>Import</button>
              <button className="btn small" disabled={!custom || custom.length === 0}
                onClick={() => { setIoText(JSON.stringify(custom, null, 1)); setIoMsg(`${custom.length} statblock${custom.length === 1 ? "" : "s"} exported below — copy the text to back it up.`); }}>
                Export my bestiary
              </button>
              {ioMsg && <span style={{ fontSize: 12, color: "var(--dim)" }}>{ioMsg}</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SlotsModal({ hasEnemies, onSave, onLoad, onDelete, onSaveGroup, onAddGroup, onDeleteGroup, onExportAll, onImportAll, onClose }) {
  const [slots, setSlots] = useState(null);
  const [groups, setGroups] = useState(null);
  const [name, setName] = useState("");
  const [showBk, setShowBk] = useState(false);
  const [showBkText, setShowBkText] = useState(false);
  const [bkText, setBkText] = useState("");
  const [bkMsg, setBkMsg] = useState("");
  const fileRef = useRef(null);
  const downloadBackup = async () => {
    const obj = await onExportAll();
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `dm-screen-backup-${obj.exported.slice(0, 10)}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    setBkMsg(`Backup saved: ${obj.bestiary.length} bestiary monster${obj.bestiary.length === 1 ? "" : "s"}, ${Object.keys(obj.slots).length} encounter${Object.keys(obj.slots).length === 1 ? "" : "s"}, ${Object.keys(obj.groups).length} group${Object.keys(obj.groups).length === 1 ? "" : "s"}.`);
  };
  const restoreFromFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const obj = JSON.parse(await file.text());
      if (obj.app !== "dm5e") throw new Error("Not a DM Screen backup file.");
      const r = await onImportAll(obj);
      setBkMsg(`Restored: ${r.bestiary} bestiary, ${r.slots} encounters, ${r.groups} groups (merged into what's here).`);
      refresh();
    } catch (err) { setBkMsg(`Restore failed: ${err.message}`); }
  };
  const refresh = useCallback(async () => {
    setSlots((await stList("dm5e:slot:")).map((k) => k.replace("dm5e:slot:", "")));
    setGroups((await stList("dm5e:group:")).map((k) => k.replace("dm5e:group:", "")));
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  const clean = () => name.trim().replace(/[\s/\\'"]+/g, "_");
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Save / load</h3>
        {!hasStorage() && <div className="trait" style={{ color: "var(--danger)" }}>Storage isn't available in this environment — saves only work inside Claude.</div>}
        <div className="frow">
          <input type="text" placeholder="Name…" value={name} onChange={(e) => setName(e.target.value)} style={{ flex: 1 }} />
        </div>
        <div className="frow">
          <button className="btn small primary" disabled={!name.trim()} onClick={async () => { await onSave(clean()); refresh(); setName(""); }}>Save full encounter</button>
          <button className="btn small" disabled={!name.trim() || !hasEnemies} title={hasEnemies ? "Save just the enemy monsters, for reuse in later rooms" : "No enemy monsters to save"}
            onClick={async () => { await onSaveGroup(clean()); refresh(); setName(""); }}>Save monsters as group</button>
        </div>

        <div className="lbl" style={{ fontSize: 11, color: "var(--faint)", margin: "10px 0 4px", letterSpacing: ".1em", textTransform: "uppercase" }}>Encounters (full snapshot)</div>
        {slots === null && <div className="trait">Loading…</div>}
        {slots && slots.length === 0 && <div className="trait">Nothing saved yet.</div>}
        {slots && slots.map((s) => (
          <div className="targetline" key={s}>
            <span style={{ flex: 1 }}>{s.replace(/_/g, " ")}</span>
            <button className="btn small" title="Replaces everything on screen" onClick={() => onLoad(s)}>Load</button>
            <button className="btn small danger" onClick={async () => { await onDelete(s); refresh(); }}>✕</button>
          </div>
        ))}

        <div className="lbl" style={{ fontSize: 11, color: "var(--gold)", margin: "12px 0 4px", letterSpacing: ".1em", textTransform: "uppercase" }}>Monster groups (merge into current)</div>
        {groups && groups.length === 0 && <div className="trait">No groups yet — prep a room's monsters, then save them as a group.</div>}
        {groups && groups.map((s) => (
          <div className="targetline" key={s}>
            <span style={{ flex: 1 }}>{s.replace(/_/g, " ")}</span>
            <button className="btn small primary" title="Adds these monsters to the current roster with fresh initiative" onClick={() => onAddGroup(s)}>Add to current</button>
            <button className="btn small danger" onClick={async () => { await onDeleteGroup(s); refresh(); }}>✕</button>
          </div>
        ))}
        <div className="trait" style={{ marginTop: 8, color: "var(--faint)" }}>
          Groups drop monsters on top of whatever's on screen — your surviving party included. Perfect for room-to-room dungeon crawls.
        </div>

        <button className="btn small ghost" style={{ marginTop: 8 }} onClick={() => { setShowBk(!showBk); setBkMsg(""); }}>
          {showBk ? "Hide backup ▲" : "Backup everything ▼"}
        </button>
        {showBk && (
          <div style={{ marginTop: 8 }}>
            <div className="trait" style={{ marginBottom: 6 }}>
              Backs up your entire collection — bestiary, saved encounters, monster groups, and party settings — to a file.
              Everything lives only in this browser on this device, so keep a backup somewhere safe (Files, iCloud Drive, email it to yourself).
              Restoring merges the file into what's already here; it never deletes anything.
            </div>
            <div className="frow">
              <button className="btn small primary" onClick={downloadBackup}>⬇ Save backup file</button>
              <button className="btn small" onClick={() => fileRef.current && fileRef.current.click()}>⬆ Restore from file</button>
              <input ref={fileRef} type="file" accept=".json,application/json,text/plain" style={{ display: "none" }} onChange={restoreFromFile} />
            </div>
            {bkMsg && <div style={{ fontSize: 12, color: "var(--dim)", marginTop: 6 }}>{bkMsg}</div>}
            <button className="btn small ghost" style={{ marginTop: 8 }} onClick={() => setShowBkText(!showBkText)}>
              {showBkText ? "Hide copy/paste ▲" : "Copy / paste as text instead ▼"}
            </button>
            {showBkText && (<>
              <textarea rows={6} style={{ width: "100%", fontFamily: "var(--mono)", fontSize: 11, marginTop: 6 }}
                placeholder="Export fills this box — copy it out. Or paste a backup here and Import." value={bkText} onChange={(e) => setBkText(e.target.value)} />
              <div className="frow" style={{ marginTop: 6 }}>
                <button className="btn small" onClick={async () => {
                  const obj = await onExportAll();
                  setBkText(JSON.stringify(obj));
                  setBkMsg(`Exported ${obj.bestiary.length} bestiary, ${Object.keys(obj.slots).length} encounters, ${Object.keys(obj.groups).length} groups. Copy the text!`);
                }}>Export as text</button>
                <button className="btn small primary" disabled={!bkText.trim()} onClick={async () => {
                  try {
                    const obj = JSON.parse(bkText);
                    if (obj.app !== "dm5e") throw new Error("Not a DM Screen backup.");
                    const r = await onImportAll(obj);
                    setBkMsg(`Imported: ${r.bestiary} bestiary, ${r.slots} encounters, ${r.groups} groups.`);
                    setBkText(""); refresh();
                  } catch (e) { setBkMsg(`Import failed: ${e.message}`); }
                }}>Import</button>
              </div>
            </>)}
          </div>
        )}
      </div>
    </div>
  );
}

function RollInitModal({ list, onStart, onClose }) {
  const [vals, setVals] = useState(() => Object.fromEntries(list.map((c) => [c.uid, ""])));
  const ready = list.every((c) => String(vals[c.uid]).trim() !== "");
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Roll initiative!</h3>
        <div className="trait" style={{ marginBottom: 8 }}>Enter everyone's initiative as they call it out, then start.</div>
        {list.map((c, i) => (
          <div className="frow" key={c.uid}>
            <label style={{ minWidth: 120 }}>{c.name}</label>
            <input type="number" autoFocus={i === 0} value={vals[c.uid]}
              onChange={(e) => setVals({ ...vals, [c.uid]: e.target.value })} />
          </div>
        ))}
        <div className="frow" style={{ justifyContent: "flex-end" }}>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={!ready} onClick={() => onStart(vals)}>Start combat</button>
        </div>
      </div>
    </div>
  );
}

function PromptModal({ title, fields, submitLabel, onSubmit, onClose, extraButtons }) {
  const [vals, setVals] = useState(() => Object.fromEntries(fields.map((f) => [f.key, f.value ?? ""])));
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        {fields.map((f, i) => (
          <div className="frow" key={f.key}>
            <label>{f.label}</label>
            <input
              type={f.type || "text"} autoFocus={i === 0} placeholder={f.placeholder || ""}
              value={vals[f.key]} onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && onSubmit(vals)}
              style={f.type === "number" ? {} : { flex: 1 }}
            />
          </div>
        ))}
        <div className="frow" style={{ justifyContent: "flex-end" }}>
          {(extraButtons || []).map((b, i) => (
            <button key={i} className="btn" style={{ marginRight: "auto" }} onClick={() => b.onClick(vals)}>{b.label}</button>
          ))}
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={() => onSubmit(vals)}>{submitLabel || "OK"}</button>
        </div>
      </div>
    </div>
  );
}

function DefensesModal({ c, onSave, onClose }) {
  const [res, setRes] = useState((c.resist || []).join(", "));
  const [imm, setImm] = useState((c.immune || []).join(", "));
  const [vul, setVul] = useState((c.vuln || []).join(", "));
  const csv = (s) => s.split(",").map((x) => x.trim().toLowerCase()).filter(Boolean);
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Defenses — {c.name}</h3>
        <div className="frow"><label>Resistances</label><input type="text" placeholder="fire, cold, slashing…" value={res} onChange={(e) => setRes(e.target.value)} autoFocus /></div>
        <div className="frow"><label>Immunities</label><input type="text" placeholder="poison, necrotic…" value={imm} onChange={(e) => setImm(e.target.value)} /></div>
        <div className="frow"><label>Vulnerabilities</label><input type="text" placeholder="bludgeoning…" value={vul} onChange={(e) => setVul(e.target.value)} /></div>
        <div className="trait" style={{ marginBottom: 8 }}>Comma-separated damage types. Applied automatically to typed damage: resist ½ · immune 0 · vulnerable ×2.</div>
        <div className="frow" style={{ justifyContent: "flex-end" }}>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={() => onSave(csv(res), csv(imm), csv(vul))}>Save</button>
        </div>
      </div>
    </div>
  );
}

function AddAttackModal({ c, onAdd, onClose }) {
  const [a, setA] = useState({ n: "", hit: 4, dmg: "1d6+2", dtype: "slashing", extra: "", extraType: "fire", d: "" });
  const set = (k, v) => setA({ ...a, [k]: v });
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>New attack — {c.name}</h3>
        <div className="frow"><label>Name</label><input type="text" placeholder="Silvered Spear" value={a.n} onChange={(e) => set("n", e.target.value)} autoFocus /></div>
        <div className="grid2">
          <div className="frow"><label>To hit</label><input type="number" value={a.hit} onChange={(e) => set("hit", e.target.value)} /></div>
          <div className="frow"><label>Damage</label><input type="text" style={{ width: 80 }} value={a.dmg} onChange={(e) => set("dmg", e.target.value)} /></div>
        </div>
        <div className="frow"><label>Type</label>
          <select value={a.dtype} onChange={(e) => set("dtype", e.target.value)}>
            {DTYPES.map((t) => (<option key={t}>{t}</option>))}
          </select>
        </div>
        <div className="frow"><label>Bonus dmg</label>
          <input type="text" placeholder="1d6 (optional)" style={{ width: 90, flex: "none" }} value={a.extra} onChange={(e) => set("extra", e.target.value)} />
          <select value={a.extraType} onChange={(e) => set("extraType", e.target.value)}>
            {DTYPES.map((t) => (<option key={t}>{t}</option>))}
          </select>
        </div>
        <div className="frow"><label>Notes</label><input type="text" placeholder="reach 10 ft, thrown 20/60…" value={a.d} onChange={(e) => set("d", e.target.value)} /></div>
        <div className="frow" style={{ justifyContent: "flex-end" }}>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={!a.n.trim()}
            onClick={() => onAdd({ n: a.n.trim(), kind: "atk", hit: parseInt(a.hit, 10) || 0, dmg: a.dmg, dtype: a.dtype, extra: a.extra.trim() || undefined, extraType: a.extra.trim() ? a.extraType : undefined, d: a.d.trim() || undefined })}>
            Add attack
          </button>
        </div>
      </div>
    </div>
  );
}

function LootGiveModal({ c, onSave, onClose }) {
  const [items, setItems] = useState(() => (c.loot || []).map(lootObj));
  const [custom, setCustom] = useState("");
  const [browse, setBrowse] = useState(false);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("all");
  const filtered = ITEMS.filter((i) =>
    (tab === "all" || (tab === "W" ? i.rarity === "G" && i.wpn : tab === "A" ? i.rarity === "G" && !i.wpn : i.rarity === tab))
    && i.n.toLowerCase().includes(q.toLowerCase()));
  const addCustomLine = () => {
    const t = custom.trim(); if (!t) return;
    setItems([...items, lookupItem(t) || { n: t }]);
    setCustom("");
  };
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Loot — {c.name}</h3>
        {items.length === 0 && <div className="trait">Nothing carried yet.</div>}
        {items.map((it, i) => (
          <div className="targetline" key={i}>
            <span style={{ flex: 1 }}>
              {lootName(it)}
              {it.rarity && <span style={{ color: "var(--faint)", fontSize: 11 }}> · {rarityLabel(it)}</span>}
              {it.d && <div style={{ fontSize: 11, color: "var(--faint)" }}>{it.d}</div>}
            </span>
            <button className="btn small danger" onClick={() => setItems(items.filter((_, j) => j !== i))}>✕</button>
          </div>
        ))}
        <div className="frow" style={{ marginTop: 8 }}>
          <input type="text" placeholder="Custom item or gold — e.g. 23 gp" value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCustomLine()} style={{ flex: 1 }} />
          <button className="btn small" disabled={!custom.trim()} onClick={addCustomLine}>+ Add</button>
        </div>
        <button className="btn small ghost" style={{ marginTop: 6 }} onClick={() => setBrowse(!browse)}>
          {browse ? "Hide catalog ▲" : "Browse magic items (SRD) ▼"}
        </button>
        {browse && (
          <div style={{ marginTop: 8 }}>
            <div className="frow">
              <input type="text" placeholder="Search items…" value={q} onChange={(e) => setQ(e.target.value)} style={{ flex: 1 }} />
            </div>
            <div className="tabs" style={{ marginBottom: 6 }}>
              {["all", "W", "A", "C", "U", "R", "V", "L"].map((t) => (
                <button key={t} className="btn small"
                  style={tab === t ? { borderColor: "var(--gold)", background: "var(--gold-soft)" } : {}}
                  onClick={() => setTab(t)}>
                  {t === "all" ? "All" : t === "W" ? "Weapons" : t === "A" ? "Armor" : RARITY_NAME[t]}
                </button>
              ))}
            </div>
            <div style={{ maxHeight: 220, overflowY: "auto" }}>
              {filtered.map((it) => (
                <div className="targetline" key={it.n}>
                  <span style={{ flex: 1 }}>
                    {it.n} <span style={{ color: "var(--faint)", fontSize: 11 }}>· {rarityLabel(it)}</span>
                    <div style={{ fontSize: 11, color: "var(--faint)" }}>{it.d}</div>
                  </span>
                  <button className="btn small" onClick={() => setItems([...items, JSON.parse(JSON.stringify(it))])}>+ Give</button>
                </div>
              ))}
              {filtered.length === 0 && <div className="trait">No matches.</div>}
            </div>
          </div>
        )}
        <div className="trait" style={{ marginTop: 8, color: "var(--faint)" }}>
          Usable items (potions, wands…) show on the creature's turn card with a Use button. Consumed items drop off the loot list; the rest await the players in "Loot the fallen."
        </div>
        <div className="frow" style={{ justifyContent: "flex-end", marginTop: 8 }}>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={() => onSave(items)}>Save</button>
        </div>
      </div>
    </div>
  );
}

function LootFallenModal({ state, onTake, onClose }) {
  const fallen = state.combatants.filter((c) => c.dead && (c.loot || []).length > 0);
  const carrying = state.combatants.filter((c) => !c.dead && (c.loot || []).length > 0);
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Loot the fallen</h3>
        {fallen.length === 0 && <div className="trait">No lootable corpses yet. Give it time.</div>}
        {fallen.map((c) => (
          <div key={c.uid} style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>{c.name} <span style={{ color: "var(--faint)", fontWeight: 400, fontSize: 11 }}>(dead)</span></div>
            {c.loot.map((item, i) => (
              <div className="targetline" key={i}>
                <span style={{ flex: 1 }}>{lootName(item)}{lootObj(item).rarity && <span style={{ color: "var(--faint)", fontSize: 11 }}> · {rarityLabel(lootObj(item))}</span>}</span>
                <button className="btn small" onClick={() => onTake(c.uid, i)}>Taken ✓</button>
              </div>
            ))}
          </div>
        ))}
        {carrying.length > 0 && (
          <div className="trait" style={{ marginTop: 6, color: "var(--faint)" }}>
            Still breathing and holding loot: {carrying.map((c) => c.name).join(", ")}
          </div>
        )}
      </div>
    </div>
  );
}

function BalanceModal({ state, party, onSaveParty, onApply, onClose }) {
  const [size, setSize] = useState(party.set ? String(party.size) : "");
  const [level, setLevel] = useState(party.set ? String(party.level) : "");
  const [difficulty, setDifficulty] = useState(party.difficulty || "moderate");
  const monsters = state.combatants.filter((c) => c.type === "monster" && c.side === "enemy" && !c.dead);
  const [roles, setRoles] = useState(() => Object.fromEntries(monsters.map((c) => [c.uid, "avg"])));
  const [phase, setPhase] = useState("setup"); // setup | review
  const [result, setResult] = useState(null);
  const [checked, setChecked] = useState(new Set());

  const propose = () => {
    const p = { size: parseInt(size, 10) || 4, level: parseInt(level, 10) || 1, difficulty };
    onSaveParty({ ...party, ...p, set: true });
    const res = computeBalance(state, p, roles);
    setResult(res);
    setChecked(new Set(res.proposal.filter((pr) => pr.patch).map((pr) => pr.uid)));
    setPhase("review");
  };
  const toggle = (uid) => { const n = new Set(checked); n.has(uid) ? n.delete(uid) : n.add(uid); setChecked(n); };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>⚖ Balance encounter</h3>
        {phase === "setup" && (<>
          <div className="grid2">
            <div className="frow"><label>Party size</label>
              <select className="sbook-search" style={{ width: 130, margin: 0, color: size ? "var(--text)" : "var(--faint)", WebkitTextFillColor: size ? "var(--text)" : "var(--faint)", background: "var(--panel)", WebkitAppearance: "none", appearance: "none" }}
                value={size} onChange={(e) => setSize(e.target.value)}>
                <option value="">players…</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => <option key={n} value={String(n)}>{n} player{n === 1 ? "" : "s"}</option>)}
              </select></div>
            <div className="frow"><label>Party level</label>
              <select className="sbook-search" style={{ width: 130, margin: 0, color: level ? "var(--text)" : "var(--faint)", WebkitTextFillColor: level ? "var(--text)" : "var(--faint)", background: "var(--panel)", WebkitAppearance: "none", appearance: "none" }}
                value={level} onChange={(e) => setLevel(e.target.value)}>
                <option value="">level…</option>
                {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => <option key={n} value={String(n)}>Level {n}</option>)}
              </select></div>
          </div>
          <div className="frow"><label>Difficulty</label>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="low">Low</option><option value="moderate">Moderate</option><option value="high">High</option>
            </select>
          </div>
          <div className="lbl" style={{ fontSize: 11, color: "var(--faint)", margin: "8px 0 4px", letterSpacing: ".1em", textTransform: "uppercase" }}>
            Roles — who's the muscle?
          </div>
          {monsters.map((c) => (
            <div className="targetline" key={c.uid}>
              <span style={{ flex: 1 }}>{c.name} <span style={{ color: "var(--faint)", fontSize: 11 }}>CR {c.cr ?? "?"}</span></span>
              {["weak", "avg", "strong"].map((r) => (
                <button key={r} className={`btn small ${roles[c.uid] === r ? "sel" : "ghost"}`}
                  style={roles[c.uid] === r ? { borderColor: "var(--gold)", background: "var(--gold-soft)" } : {}}
                  onClick={() => setRoles({ ...roles, [c.uid]: r })}>
                  {r === "avg" ? "Average" : r === "weak" ? "Weak" : "Strong"}
                </button>
              ))}
            </div>
          ))}
          {monsters.length === 0 && <div className="trait">No living enemies to balance.</div>}
          <div className="trait" style={{ marginTop: 6, color: "var(--faint)" }}>
            Pure math from the 2024 DMG XP budgets — no AI needed, works offline. Strong takes the lion's share of the budget; Weak stays fodder.
          </div>
          <div className="frow" style={{ justifyContent: "flex-end", marginTop: 8 }}>
            <button className="btn" onClick={onClose}>Cancel</button>
            <button className="btn primary" disabled={monsters.length === 0 || !(parseInt(size, 10) > 0) || !(parseInt(level, 10) > 0)} title={!(parseInt(size, 10) > 0) || !(parseInt(level, 10) > 0) ? "Pick player count and level first" : undefined} onClick={propose}>Propose changes</button>
          </div>
        </>)}
        {phase === "review" && result && (<>
          {result.note && <div className="trait" style={{ marginBottom: 8 }}>{result.note}</div>}
          {result.proposal.map((pr) => (
            <div className="targetline" key={pr.uid} style={{ alignItems: "flex-start" }}>
              {pr.patch
                ? <input type="checkbox" checked={checked.has(pr.uid)} onChange={() => toggle(pr.uid)} style={{ marginTop: 3 }} />
                : <span style={{ width: 13, textAlign: "center", color: "var(--ok)" }}>✓</span>}
              <span style={{ flex: 1 }}>
                <b>{pr.target}</b>
                <div style={{ fontSize: 12, color: "var(--dim)" }}>{pr.summary}</div>
              </span>
            </div>
          ))}
          <div className="frow" style={{ justifyContent: "flex-end", marginTop: 10 }}>
            <button className="btn" onClick={() => setPhase("setup")}>Back</button>
            <button className="btn primary" disabled={checked.size === 0}
              onClick={() => onApply(result.proposal.filter((pr) => pr.patch && checked.has(pr.uid)))}>
              Apply {checked.size} change{checked.size === 1 ? "" : "s"}
            </button>
          </div>
        </>)}
      </div>
    </div>
  );
}

function HazardModal({ c, onApplyFire, onRemoveCond, onClose }) {
  const [amt, setAmt] = useState("");
  const burning = c.conditions.some((cd) => cd.name === "Burning");
  const suff = c.conditions.some((cd) => cd.name === "Suffocating");
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Start of {c.name}'s turn</h3>
        {burning && (<>
          <div className="reminder" style={{ marginBottom: 8 }}>🔥 <b>{c.name} is Burning</b> — they roll <b>1d4 fire damage</b> now (dousing takes an action).</div>
          {c.hp != null && (
            <div className="frow">
              <label>Damage rolled</label>
              <input type="number" autoFocus value={amt} onChange={(e) => setAmt(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && amt) { onApplyFire(parseInt(amt, 10)); setAmt(""); } }} />
              <button className="btn small primary" disabled={!amt} onClick={() => { onApplyFire(parseInt(amt, 10)); setAmt(""); }}>Apply as fire</button>
            </div>
          )}
          <div className="frow">
            <button className="btn small" onClick={() => onRemoveCond("Burning")}>Doused — remove Burning</button>
          </div>
        </>)}
        {suff && (<>
          <div className="reminder" style={{ marginBottom: 8 }}>🫁 <b>{c.name} is Suffocating</b> — +1 Exhaustion level at the end of this turn.</div>
          <div className="frow">
            <button className="btn small" onClick={() => onRemoveCond("Suffocating")}>Can breathe — remove Suffocating</button>
          </div>
        </>)}
        <div className="frow" style={{ justifyContent: "flex-end", marginTop: 6 }}>
          <button className="btn" onClick={onClose}>✕ Dismiss</button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ text, confirmLabel, onYes, onClose }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Are you sure?</h3>
        <div className="trait" style={{ fontSize: 13, marginBottom: 12 }}>{text}</div>
        <div className="frow" style={{ justifyContent: "flex-end" }}>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn danger" onClick={onYes}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

/* ================= App ================= */

export default function App() {
  const [state, setState] = useState({ mode: "setup", round: 0, activeUid: null, combatants: [], log: [] });
  const [toasts, setToasts] = useState([]);
  const [results, setResults] = useState({});
  const [modal, setModal] = useState(null); // {type, uid?}
  const [showLog, setShowLog] = useState(false);
  const [logCollapsed, setLogCollapsed] = useState(false);
  const logRef = useRef(null);
  const botPad = "calc(24px + env(safe-area-inset-bottom, 0px))";
  const scrollLog = () => setTimeout(() => logRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  const openLog = () => { setLogCollapsed(false); setShowLog(true); scrollLog(); };
  const toggleLog = () => { if (showLog) setShowLog(false); else openLog(); };
  // the Actions Log appears (collapsed) the moment the first loggable action happens
  const logAutoShown = useRef(false);
  useEffect(() => {
    if (state.log.length > 0 && !logAutoShown.current) { logAutoShown.current = true; setShowLog(true); setLogCollapsed(true); }
    if (state.log.length === 0) logAutoShown.current = false; // a cleared log re-arms the auto-show
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.log.length]);
  const [logArm, setLogArm] = useState(false);
  const [railOpen, setRailOpen] = useState(true);
  const [addMenu, setAddMenu] = useState(false);
  const [spellBook, setSpellBook] = useState(false);
  const [peek, setPeek] = useState(null);
  const [rowFlash, setRowFlash] = useState(null);
  const warnedTurn = useRef(null);
  useEffect(() => {
    if (state.mode !== "combat" || !state.activeUid) return;
    const key = `${state.round}:${state.activeUid}`;
    if (warnedTurn.current === key) return;
    warnedTurn.current = key;
    const c = state.combatants.find((x) => x.uid === state.activeUid);
    if (!c || c.dead) return;
    const INCAP = ["Paralyzed", "Stunned", "Petrified", "Incapacitated", "Unconscious"];
    const bad = (c.conditions || []).filter((cd) => cd.name.startsWith("Command:") || INCAP.includes(cd.name));
    if (bad.length) setModal({ type: "turn-warn", uid: c.uid, conds: bad.map((cd) => ({ name: cd.name, spell: cd.spell || null })) });
  }, [state.activeUid, state.round, state.mode]);
  useEffect(() => {
    if (!rowFlash) return;
    const t = setTimeout(() => setRowFlash((f) => (f && f.id === rowFlash.id ? null : f)), 3100);
    return () => clearTimeout(t);
  }, [rowFlash]);
  useEffect(() => { setPeek(null); }, [state.activeUid]);
  const [clearMenu, setClearMenu] = useState(false);
  const [moreMenu, setMoreMenu] = useState(false);
  const [restoreBanner, setRestoreBanner] = useState(null);
  const [myBestiary, setMyBestiary] = useState([]);
  const [party, setParty] = useState({ size: 4, level: 3, difficulty: "moderate", elites: 1 });
  const [pName, setPName] = useState(""); const [pInit, setPInit] = useState(""); const [pAc, setPAc] = useState("");
  const [pHp, setPHp] = useState(""); const [pPp, setPPp] = useState("");
  const stateRef = useRef(state); stateRef.current = state;
  const bestRef = useRef(myBestiary); bestRef.current = myBestiary;
  const partyRef = useRef(party); partyRef.current = party;
  const undoRef = useRef([]);
  const [undoN, setUndoN] = useState(0);
  const pushUndo = (snap) => {
    if (undoRef.current[undoRef.current.length - 1] === snap) return;
    undoRef.current.push(snap);
    if (undoRef.current.length > 20) undoRef.current.shift();
    setUndoN(undoRef.current.length);
  };
  const undo = () => {
    const s = undoRef.current.pop();
    setUndoN(undoRef.current.length);
    if (s) { setState(s); setResults({}); }
  };

  const saveMyBestiary = (list) => { setMyBestiary(list); stSet("dm5e:bestiary", list); };
  const upsertBestiary = (sbs) => {
    let list = [...bestRef.current];
    let added = 0, updated = 0;
    for (const sb of sbs) {
      const i = list.findIndex((x) => x.name.toLowerCase() === sb.name.toLowerCase());
      if (i >= 0) { list[i] = sb; updated++; } else { list.push(sb); added++; }
    }
    list.sort((a, b) => a.name.localeCompare(b.name));
    saveMyBestiary(list);
    return { added, updated };
  };

  const pushToasts = (arr) => {
    if (!arr.length) return;
    const withIds = arr.map((t) => ({ ...t, id: Math.random().toString(36) }));
    setToasts((ts) => [...ts, ...withIds]);
    withIds.forEach((t) => setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== t.id)), 6000));
  };

  /* central mutation: clone, run fn(draft, logs, toastsArr), commit */
  const mutate = useCallback((fn) => {
    pushUndo(stateRef.current);
    setState((prev) => {
      const draft = structuredClone(prev);
      const logs = [], tst = [];
      fn(draft, logs, tst);
      draft.combatants.forEach((t) => {
        if (!t.conditions || !t.conditions.some((cd) => cd.src)) return;
        const keep = [], drop = [];
        t.conditions.forEach((cd) => {
          if (!cd.src) return keep.push(cd);
          const cs = draft.combatants.find((x) => x.uid === cd.src);
          const alive = cs && !cs.dead && cs.concentration && (!cd.spell || cs.concentration === cd.spell);
          (alive ? keep : drop).push(cd);
        });
        if (drop.length) {
          t.conditions = keep;
          drop.forEach((cd) => logs.push(`<b>${t.name}</b> is no longer <b>${cd.name}</b> — ${cd.spell || "the spell"} ended.`));
        }
      });
      if (logs.length) draft.log = [...draft.log, ...logs.map((t) => ({ r: draft.round, t }))].slice(-400);
      if (tst.length) setTimeout(() => pushToasts(tst), 0);
      return draft;
    });
  }, []);

  /* autosave + restore */
  useEffect(() => {
    (async () => {
      const saved = await stGet("dm5e:auto");
      if (saved && saved.combatants && saved.combatants.length > 0) setRestoreBanner(saved);
      const best = await stGet("dm5e:bestiary");
      if (Array.isArray(best)) setMyBestiary(best);
      const pt = await stGet("dm5e:party");
      if (pt) setParty(pt);
    })();
  }, []);
  useEffect(() => {
    const t = setTimeout(() => { if (state.combatants.length > 0 || state.log.length > 0) stSet("dm5e:auto", state); }, 800);
    return () => clearTimeout(t);
  }, [state]);

  useEffect(() => {
    if (state.mode !== "combat") return;
    const a = state.combatants.find((c) => c.uid === state.activeUid);
    if (a && a.type === "player" && !a.dead &&
        a.conditions.some((cd) => cd.name === "Burning" || cd.name === "Suffocating")) {
      setModal({ type: "hazard", uid: a.uid });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.activeUid, state.mode]);

  const order = useMemo(() => sortOrder(state.combatants), [state.combatants]);
  const active = state.combatants.find((c) => c.uid === state.activeUid) || null;
  const [legOpen, setLegOpen] = useState(null); // uid of expanded legendary banner
  useEffect(() => { setLegOpen(null); }, [state.activeUid]);
  const legendaryWatch = state.mode === "combat"
    ? state.combatants.filter((c) => c.legendary && !c.dead && c.uid !== state.activeUid && c.legendary.rem > 0)
    : [];

  const attackRollCore = (d, L, uid, ai, opts = {}) => {
      const c = d.combatants.find((x) => x.uid === uid); if (!c) return;
      const a = c.actions[ai];
      const t = opts.targetUid ? d.combatants.find((x) => x.uid === opts.targetUid) : null;
      const tMode0 = t ? (opts.vsOverride || vsState(t)) : "none";
      const tMode = tMode0 === "adv*" ? "adv" : tMode0;
      const mode = t ? combineAdv(c.advMode, tMode) : c.advMode;
      if (opts.countAtk) {
        c.atkUsed = (c.atkUsed || 0) + 1;
        c.atkUsedBy = c.atkUsedBy || {};
        c.atkUsedBy[a.n] = (c.atkUsedBy[a.n] || 0) + 1;
      }
      const atk = d20(a.hit, mode);
      const both = atk.adv !== "none";
      const d20dice = both
        ? [{ s: 20, v: atk.a, cls: atk.a === 20 ? "critd" : atk.a === 1 ? "fumbled" : "plain", dropped: atk.a !== atk.nat },
           { s: 20, v: atk.b, cls: atk.b === 20 ? "critd" : atk.b === 1 ? "fumbled" : "plain", dropped: atk.b !== atk.nat && atk.a === atk.nat }]
        : [{ s: 20, v: atk.nat, cls: atk.crit ? "critd" : atk.fumble ? "fumbled" : "plain" }];
      const chips = [{ id: Math.random(), dice: d20dice, dieSize: 30, t: ` ${fmtMod(a.hit)} = ${atk.total} to hit`, k: "hit" }];
      if (atk.crit) chips.push({ t: "NAT 20 — CRIT!", k: "crit" });
      if (atk.fumble) chips.push({ t: "nat 1…", k: "fumble" });
      let effAc = null, isHit = null;
      if (t) {
        effAc = t.ac != null ? t.ac + (t.acBoost || 0) + coverBonus(t) : null;
        if (effAc != null) isHit = atk.crit || (!atk.fumble && atk.total >= effAc);
        if (isHit != null) chips.push({ t: `${isHit ? "HIT" : "MISS"} — ${t.name} AC ${effAc}`, k: isHit ? "sgood" : "sbad" });
      }
      const dmgChip = (roll, critRoll, dtype) => {
        const total = roll.total + (critRoll ? critRoll.total : 0);
        const allDice = [...roll.dice, ...(critRoll ? critRoll.dice : [])].map((x) => ({ ...x, cls: "dmgd" }));
        const modTxt = roll.mod ? ` ${fmtMod(roll.mod)}` : "";
        if (allDice.length > 0 && allDice.length <= 6) {
          return { id: Math.random(), dice: allDice, dieSize: 24, t: `${modTxt} = ${total} ${dtype}${critRoll ? " (crit dice incl.)" : ""}`, k: "dmg", total };
        }
        return { t: `${dtype} ${total} [${roll.text}${critRoll ? ` + crit ${critRoll.text}` : ""}]`, k: "dmg", total };
      };
      let dmgTxt = "";
      const parts = [];
      const dmgRoll = isHit === false ? null : rollFormula(a.dmg);
      if (dmgRoll) {
        const critRoll = atk.crit ? rollFormula(String(a.dmg).replace(/([+-]\d+)\s*$/, "")) : null;
        const chip = dmgChip(dmgRoll, critRoll, a.dtype || "damage");
        chips.push(chip);
        parts.push({ amt: chip.total, dtype: a.dtype || null });
        dmgTxt = `${chip.total} ${a.dtype || ""}`;
        if (a.extra && (!extraNeedsAdv(a) || atk.adv === "adv")) {
          const ex = rollFormula(a.extra);
          if (ex) {
            const exCrit = atk.crit ? rollFormula(a.extra) : null;
            const echip = dmgChip(ex, exCrit, a.extraType);
            chips.push(echip);
            parts.push({ amt: echip.total, dtype: a.extraType || null });
            dmgTxt += ` + ${echip.total} ${a.extraType}`;
          }
        }
      }
      if (t && parts.length) {
        if (isHit === true) {
          parts.forEach((p) => applyDamage(t, p.amt, p.dtype, L, opts.T || []));
          const dmgStr = parts.map((p) => `${p.amt} ${p.dtype || "damage"}`).join(" + ");
          chips.push({ t: `${dmgStr} applied to ${t.name}${t.dead ? " ☠" : t.unconscious ? " (down)" : ""}`, k: "sgood" });
          const ftxt = `${atk.total} to hit — HIT · ${dmgStr} → ${t.name}${t.dead ? " ☠" : ""}`;
          setTimeout(() => setRowFlash({ uid: t.uid, text: ftxt, id: Math.random() }), 0);
        } else if (isHit == null && t.maxHp != null) {
          chips.push({ id: Math.random(), applyTo: t.uid, parts, resKey: `${uid}:${ai}`, t: `Apply ${parts.reduce((s, p) => s + p.amt, 0)} to ${t.name}`, k: "cond" });
        }
      }
      setTimeout(() => setResults((r) => ({ ...r, [`${uid}:${ai}`]: chips })), 0);
      L.push(`<b>${c.name}</b> — ${a.n}${t ? ` vs <b>${t.name}</b>` : ""}${mode !== c.advMode ? ` (${mode === "none" ? "adv+dis cancel" : mode.toUpperCase()})` : ""}: ${atk.text} to hit${atk.crit ? " (CRIT)" : ""}${isHit != null ? ` — <b>${isHit ? "HIT" : "MISS"}</b> vs AC ${effAc}` : ""}${dmgTxt ? `, damage ${dmgTxt}` : ""}`);
  };

  /* ---------- api passed to components ---------- */
  const api = {
    quickDamage: (uid, n) => mutate((d, L, T) => { const c = d.combatants.find((x) => x.uid === uid); if (c) applyDamage(c, n, null, L, T); }),
    quickHeal: (uid, n) => mutate((d, L) => { const c = d.combatants.find((x) => x.uid === uid); if (c) applyHeal(c, n, L); }),
    openDamage: (uid) => setModal({ type: "damage", uid }),
    openSaveRoll: (uid) => setModal({ type: "save", uid }),
    openGroupSave: (preset) => setModal({ type: "group-save", preset }),
    spendLAGroupSave: (uid, ref, label) => {
      const c = stateRef.current.combatants.find((x) => x.uid === uid);
      if (!c) return;
      setModal({ type: "group-save", preset: {
        name: `${c.name} — ${label}`, ability: ref.ab, dc: ref.dc, dmg: ref.dmg ? scaleDice(ref.dmg, c.spellDmgRatio || 1) : "", dtype: ref.dtype,
        half: ref.half, laUid: uid, single: ref.single, casterUid: uid, noDmg: !ref.dmg, rpt: ref.rpt, cond: ref.cond || null, condR: ref.condR ?? null,
      } });
    },
    openBuffCast: (spec) => setModal({ type: "buff-cast", ...spec }),
    concInfo: (uid) => setModal({ type: "conc-info", uid }),
    castBuff: ({ casterUid, targetUid, laUid, cond, condR, conc, spellName }) => {
      setModal(null);
      mutate((d, L) => {
        const cs = d.combatants.find((x) => x.uid === casterUid); if (!cs || cs.dead) return;
        const t = d.combatants.find((x) => x.uid === targetUid); if (!t || t.dead) return;
        const tk = `${d.round}:${d.activeUid}`;
        if (laUid) {
          if (!cs.legendary || cs.legendary.rem <= 0 || cs.laTurnKey === tk) return;
          cs.legendary.rem -= 1; cs.laTurnKey = tk;
          L.push(`<b>${cs.name}</b> spends a legendary action (${cs.legendary.rem} left this round).`);
        } else if (d.activeUid === cs.uid) {
          if (cs.spellCastTurn === tk) return;
          if (cs.spellStyle === "replace") {
            if (atkLeft(cs) <= 0) return;
            cs.atkUsed = (cs.atkUsed || 0) + 1;
            L.push(`<b>${cs.name}</b> replaces one attack with a use of Spellcasting.`);
          } else if (cs.spellStyle === "action") {
            if ((cs.atkUsed || 0) > 0) return;
            cs.atkUsed = Math.max(cs.atkUsed || 0, atkMaxOf(cs));
            L.push(`<b>${cs.name}</b> uses its action to cast a spell.`);
          }
          cs.spellCastTurn = tk;
        }
        if (conc) { cs.concentration = conc; L.push(`<b>${cs.name}</b> is now concentrating on <b>${conc}</b>.`); }
        if (!t.conditions.some((cd) => cd.name === cond)) {
          t.conditions.push({ name: cond, rounds: condR ?? null, src: conc ? cs.uid : null, spell: conc || null });
        }
        L.push(`<b>${cs.name}</b> casts <b>${spellName}</b>${t.uid === cs.uid ? " on itself" : ` on <b>${t.name}</b>`} — <b>${cond}</b>${condR ? ` (${condR} rd)` : conc ? " (until concentration ends)" : ""}.`);
      });
    },
    rollRepeatSave: (uid, condName) => {
      mutate((d, L) => {
        const c = d.combatants.find((x) => x.uid === uid); if (!c) return;
        const cd = c.conditions.find((x) => x.name === condName && x.rpt); if (!cd) return;
        const cov = cd.rpt.ab === "dex" ? coverBonus(c) : 0;
        const r = d20(saveMod(c, cd.rpt.ab) + cov, c.advMode);
        const ok = r.total >= cd.rpt.dc;
        L.push(`<b>${c.name}</b> repeats the ${cd.rpt.ab.toUpperCase()} save vs DC ${cd.rpt.dc} (${cd.spell || cd.name}): ${r.text} — <b>${ok ? "SUCCESS" : "FAIL"}</b>`);
        cd.rptDone = `${d.round}:${d.activeUid}`;
        if (ok) removeRptCondition(d, L, c, cd);
        const both = r.adv !== "none";
        const dice = both
          ? [{ s: 20, v: r.a, cls: r.a === 20 ? "critd" : r.a === 1 ? "fumbled" : "plain", dropped: r.a !== r.nat },
             { s: 20, v: r.b, cls: r.b === 20 ? "critd" : r.b === 1 ? "fumbled" : "plain", dropped: r.b !== r.nat && r.a === r.nat }]
          : [{ s: 20, v: r.nat, cls: r.crit ? "critd" : r.fumble ? "fumbled" : "plain" }];
        setTimeout(() => setModal((mm) => (mm && (mm.type === "repeat-save" || mm.type === "turn-warn") ? { ...mm, done: { ...(mm.done || {}), [condName]: { total: r.total, ok, dice } } } : mm)), 0);
      });
    },
    markRepeatSave: (uid, condName, ok) => {
      mutate((d, L) => {
        const c = d.combatants.find((x) => x.uid === uid); if (!c) return;
        const cd = c.conditions.find((x) => x.name === condName && x.rpt); if (!cd) return;
        L.push(`<b>${c.name}</b> reports the repeat ${cd.rpt.ab.toUpperCase()} save vs DC ${cd.rpt.dc} (${cd.spell || cd.name}) — <b>${ok ? "SUCCESS" : "FAIL"}</b>`);
        cd.rptDone = `${d.round}:${d.activeUid}`;
        if (ok) removeRptCondition(d, L, c, cd);
      });
      setModal((mm) => (mm && (mm.type === "repeat-save" || mm.type === "turn-warn") ? { ...mm, done: { ...(mm.done || {}), [condName]: { total: null, ok } } } : mm));
    },
    skipRepeatSave: (condName) => setModal((mm) => (mm && (mm.type === "repeat-save" || mm.type === "turn-warn") ? { ...mm, done: { ...(mm.done || {}), [condName]: { skipped: true } } } : mm)),
    setCommandWord: (uid, word) => {
      mutate((d, L) => {
        const c = d.combatants.find((x) => x.uid === uid); if (!c || c.dead) return;
        const nm = `Command: ${word}`;
        if (!c.conditions.some((cd) => cd.name === nm)) c.conditions.push({ name: nm, rounds: 1 });
        L.push(`<b>${c.name}</b> must obey — <b>${word}</b> — on their next turn.`);
      });
      setModal((mm) => {
        if (!mm || mm.type !== "group-save" || !mm.resolved) return mm;
        return { ...mm, resolved: { ...mm.resolved, rows: mm.resolved.rows.map((r) => (r.uid === uid ? { ...r, cmdDone: word } : r)) } };
      });
    },
    markPlayerSave: (uid, ok) => {
      const mm = modal;
      if (!mm || mm.type !== "group-save" || !mm.resolved) return;
      const ctx = mm.resolved.ctx;
      let rowOut = null;
      mutate((d, L, T) => {
        const c = d.combatants.find((x) => x.uid === uid); if (!c || c.dead) return;
        let amt = null, note = "";
        if (ctx.dmgTotal != null) {
          amt = ok ? (ctx.halfOn ? Math.floor(ctx.dmgTotal / 2) : 0) : ctx.dmgTotal;
          if (amt > 0 && c.maxHp != null) { applyDamage(c, amt, ctx.dtype || null, L, T); if (c.dead) note = "☠"; else if (c.unconscious) note = "(down)"; }
          else if (amt > 0) note = "(HP untracked — apply at table)";
        }
        if (ctx.cond && !ok && !c.dead && !c.conditions.some((cd) => cd.name === ctx.cond)) {
          c.conditions.push({ name: ctx.cond, rounds: ctx.condR ?? null, src: ctx.concSrc || null, spell: ctx.concCast || null, rpt: ctx.rpt ? { ab: ctx.ability, dc: ctx.dc, note: ctx.rptNote || null } : null });
          note = (note ? note + " " : "") + `+${ctx.cond}`;
        }
        L.push(`<b>${c.name}</b> reports ${ctx.ability.toUpperCase()} save vs DC ${ctx.dc} — <b>${ok ? "SUCCESS" : "FAIL"}</b>${amt != null ? `, takes ${amt}` : ""}${note ? ` ${note}` : ""}`);
        rowOut = { uid: c.uid, name: c.name, total: null, ok, dmg: amt, note };
        setTimeout(() => setResults((res) => ({ ...res, [`${uid}:save`]: [{
          id: Math.random(), t: ` ${ctx.ability.toUpperCase()} save vs DC ${ctx.dc} — ${ok ? "SUCCESS" : "FAIL"} (reported)${amt != null ? ` · takes ${amt}` : ""}`,
          k: ok ? "sgood" : "sbad",
        }] })), 0);
      });
      setModal((m2) => {
        if (!m2 || m2.type !== "group-save" || !m2.resolved) return m2;
        const r = m2.resolved;
        return { ...m2, resolved: { ...r, pending: r.pending.filter((p) => p.uid !== uid), rows: rowOut ? [...r.rows, rowOut] : r.rows } };
      });
    },
    resolveEffect: (uid) => {
      const e = stateRef.current.combatants.find((x) => x.uid === uid);
      if (!e || !e.fx) return;
      setModal({ type: "group-save", preset: {
        name: e.name, ability: e.fx.ab, dc: e.fx.dc, dmg: e.fx.dmg, dtype: e.fx.dtype,
        half: e.fx.half, cond: e.fx.cond, condR: e.fx.condR, noSave: e.fx.mech === "dmg",
        effectUid: e.uid,
      } });
    },
    peek: (uid) => setPeek(uid),
    grantSpell: (uid) => mutate((d, L) => {
      const c = d.combatants.find((x) => x.uid === uid); if (!c) return;
      c.spellCastTurn = null;
      L.push(`<b>${c.name}</b> may cast an additional spell this turn (DM override).`);
    }),
    grantAttack: (uid) => mutate((d, L) => {
      const c = d.combatants.find((x) => x.uid === uid); if (!c) return;
      c.atkGrant = (c.atkGrant || 0) + 1;
      L.push(`<b>${c.name}</b> gains an extra attack this turn (${Math.max(atkLeft(c), 0)} left).`);
    }),
    rollOppAttack: (uid, ai) => {
      const st = stateRef.current;
      const c = st.combatants.find((x) => x.uid === uid);
      if (!c || !c.reaction) return;
      const opp = targetCands(st, c).filter((x) => (c.side === "ally" ? x.side !== "ally" : x.side === "ally"));
      if (opp.some(targetWorth)) setModal({ type: "target-pick", uid, ai, opp: true });
      else mutate((d, L, T) => {
        const cc = d.combatants.find((x) => x.uid === uid);
        if (!cc || !cc.reaction) return;
        cc.reaction = false;
        L.push(`<b>${cc.name}</b> takes an <b>opportunity attack</b> (reaction spent):`);
        attackRollCore(d, L, uid, ai, { T });
      });
    },
    confirmUse: (uid, kind, key) => setModal({ type: "use-confirm", uid, kind, key }),
    spendSpellUse: (uid, k) => mutate((d, L) => {
      const c = d.combatants.find((x) => x.uid === uid);
      const u = c?.spellUses?.[k];
      if (!u || u.rem <= 0) return;
      u.rem -= 1;
      L.push(`<b>${c.name}</b> casts <b>${SPELL_REF[k]?.n || k}</b> (${u.rem}/${u.max} left today).`);
    }),
    resetUse: (uid, key) => mutate((d, L) => {
      const c = d.combatants.find((x) => x.uid === uid);
      const u = c?.uses?.[key];
      if (!u || u.rem >= u.max) return;
      u.rem = u.max;
      L.push(`<b>${c.name}</b>: <b>${u.n.replace(USES_RE, "").trim().replace(/\.$/, "")}</b> uses reset to ${u.max}.`);
    }),
    spendUse: (uid, key) => mutate((d, L) => {
      const c = d.combatants.find((x) => x.uid === uid);
      const u = c?.uses?.[key];
      if (!u || u.rem <= 0) return;
      const isReaction = key[0] === "r";
      if (isReaction && !c.reaction) return;
      u.rem -= 1;
      if (isReaction) c.reaction = false;
      L.push(`<b>${c.name}</b> uses <b>${u.n.replace(USES_RE, "").trim().replace(/\.$/, "")}</b> (${u.rem}/${u.max} left)${isReaction ? " — reaction spent" : ""}.`);
    }),
    dismissSave: (uid) => setResults((res) => { const r = { ...res }; delete r[`${uid}:save`]; return r; }),
    openDefenses: (uid) => setModal({ type: "defenses", uid }),
    openAddAttack: (uid) => setModal({ type: "addattack", uid }),
    openLoot: (uid) => setModal({ type: "loot-give", uid }),
    openDeathSaves: (uid) => setModal({ type: "deathsaves", uid }),
    openCondInfo: (uid, condName) => setModal({ type: "cond-info", uid, condName }),
    openThp: (uid) => setModal({ type: "thp-edit", uid }),
    openShieldInfo: (uid) => setModal({ type: "shield-info", uid }),
    switchSide: (uid) => mutate((d, L, T) => {
      const c = d.combatants.find((x) => x.uid === uid); if (!c || c.type === "effect") return;
      c.side = c.side === "ally" ? "enemy" : "ally";
      if (c.hp === 0) {
        if (c.side === "ally" && c.dead) { c.dead = false; c.unconscious = true; c.ds = { s: 0, f: 0 }; c.stable = false; }
        if (c.side === "enemy" && c.unconscious) { c.unconscious = false; c.dead = true; }
      }
      L.push(`<b>${c.name}</b> is now ${c.side === "ally" ? "an <b>ally</b> — fights with the party and survives End Combat" : "an <b>enemy</b>"}.`);
      T.push({ kind: c.side === "ally" ? "good" : "bad", text: `${c.name} ${c.side === "ally" ? "joins the party!" : "turns against the party!"}` });
    }),
    equipItem: (uid, idx) => mutate((d, L) => {
      const c = d.combatants.find((x) => x.uid === uid); if (!c) return;
      const it = lootObj((c.loot || [])[idx]); if (!it) return;
      if (it.armor) {
        if (it.eq) {
          const restored = c.acPreArmor ?? it.prevAc ?? c.ac;
          L.push(`<b>${c.name}</b> removes <b>${it.n}</b> — AC ${c.ac}→${restored}.`);
          c.ac = restored; c.acPreArmor = null;
          c.loot = c.loot.map((x, i) => (i === idx ? { ...it, eq: false, prevAc: undefined } : x));
        } else equipArmorAt(c, idx, L);
        return;
      }
      if (it.acB) {
        if (it.eq) {
          L.push(`<b>${c.name}</b> unequips <b>${it.n}</b> — AC ${c.ac}→${c.ac - it.acB}.`);
          c.ac -= it.acB;
          c.loot = c.loot.map((x, i) => (i === idx ? { ...it, eq: false } : x));
        } else {
          L.push(`<b>${c.name}</b> equips <b>${it.n}</b> — AC ${c.ac}→${c.ac + it.acB}.`);
          c.ac += it.acB;
          c.loot = c.loot.map((x, i) => (i === idx ? { ...it, eq: true } : x));
        }
      }
    }),
    useItem: (uid, idx) => mutate((d, L, T) => {
      const c = d.combatants.find((x) => x.uid === uid); if (!c) return;
      const it = lootObj((c.loot || [])[idx]); if (!it) return;
      if (it.heal) {
        const r = rollFormula(it.heal);
        applyHeal(c, r.total, L);
        c.loot = c.loot.filter((_, i) => i !== idx);
        L.push(`<b>${c.name}</b> uses <b>${it.n}</b> — ${r.total} [${r.text}] — consumed.`);
        T.push({ kind: "good", text: `${c.name}: ${it.n} → ${r.total} HP.` });
        return;
      }
      if (it.ch != null) {
        if (it.ch <= 0) { L.push(`<b>${it.n}</b> is out of charges.`); return; }
        const nl = c.loot.map((x, i) => (i === idx ? { ...lootObj(x), ch: it.ch - 1 } : x));
        c.loot = nl;
        L.push(`<b>${c.name}</b> uses <b>${it.n}</b> (${it.ch - 1} left) — ${it.d}`);
        return;
      }
      if (it.c) {
        c.loot = c.loot.filter((_, i) => i !== idx);
        L.push(`<b>${c.name}</b> uses <b>${it.n}</b> — ${it.d || "consumed."}`);
        return;
      }
      L.push(`<b>${c.name}</b> uses <b>${it.n}</b>${it.d ? ` — ${it.d}` : ""}`);
    }),
    addCondition: (uid) => setModal({ type: "cond", uid }),
    removeCondition: (uid, name) => mutate((d, L) => {
      const c = d.combatants.find((x) => x.uid === uid); if (!c) return;
      c.conditions = c.conditions.filter((x) => x.name !== name);
      L.push(`<b>${c.name}</b>: ${name} removed`);
    }),
    breakConc: (uid) => mutate((d, L) => { const c = d.combatants.find((x) => x.uid === uid); if (c) { L.push(`<b>${c.name}</b> stops concentrating on ${c.concentration}`); c.concentration = null; } }),
    setConc: (uid) => setModal({ type: "conc-prompt", uid }),
    toggleReaction: (uid) => mutate((d) => { const c = d.combatants.find((x) => x.uid === uid); if (c) c.reaction = !c.reaction; }),
    toggleShield: (uid) => mutate((d, L) => {
      const c = d.combatants.find((x) => x.uid === uid); if (!c || !c.acReaction) return;
      if (!c.acBoost) { c.acBoost = c.acReaction.acBonus; c.reaction = false; L.push(`<b>${c.name}</b> uses <b>${c.acReaction.n}</b> — AC ${c.ac} → ${c.ac + c.acBoost} until its next turn`); }
      else { c.acBoost = 0; L.push(`<b>${c.name}</b>: ${c.acReaction.n} AC boost cleared`); }
    }),
    cycleAdv: (uid) => mutate((d, L) => {
      const c = d.combatants.find((x) => x.uid === uid); if (!c) return;
      c.advMode = c.advMode === "none" ? "adv" : c.advMode === "adv" ? "dis" : "none";
      L.push(`<b>${c.name}</b> now rolls at ${c.advMode === "none" ? "normal" : c.advMode === "adv" ? "ADVANTAGE" : "DISADVANTAGE"}`);
    }),
    cycleAdvVs: (uid) => mutate((d, L) => {
      const c = d.combatants.find((x) => x.uid === uid); if (!c) return;
      const cur = c.advVs || "none";
      c.advVs = cur === "none" ? "adv" : cur === "adv" ? "dis" : "none";
      L.push(`Attacks against <b>${c.name}</b>: ${c.advVs === "adv" ? "ADVANTAGE" : c.advVs === "dis" ? "DISADVANTAGE" : "normal (manual flag cleared)"}`);
    }),
    saveToBestiary: (uid) => {
      const c = stateRef.current.combatants.find((x) => x.uid === uid);
      if (!c || c.type !== "monster") return;
      const sb = statblockFromCombatant(c);
      const { updated } = upsertBestiary([sb]);
      pushToasts([{ kind: "good", text: `${updated ? "Updated" : "Saved"} "${sb.name}" in your bestiary.` }]);
    },
    rename: (uid) => setModal({ type: "rename-prompt", uid }),
    setInit: (uid) => setModal({ type: "init-prompt", uid }),
    nudge: (uid, dir) => mutate((d) => { const c = d.combatants.find((x) => x.uid === uid); if (c) c.init += dir; }),
    kill: (uid) => mutate((d, L, T) => { const c = d.combatants.find((x) => x.uid === uid); if (c) { c.dead = true; c.hp = 0; c.concentration = null; L.push(`<b>${c.name}</b> marked dead.`); } }),
    revive: (uid) => mutate((d, L) => { const c = d.combatants.find((x) => x.uid === uid); if (c) { c.dead = false; c.unconscious = false; c.ds = { s: 0, f: 0 }; c.stable = false; if (c.hp === 0) c.hp = 1; L.push(`<b>${c.name}</b> is back up (${c.hp} HP).`); } }),
    remove: (uid) => mutate((d, L) => { const c = d.combatants.find((x) => x.uid === uid); if (c) { L.push(`<b>${c.name}</b> removed.`); d.combatants = d.combatants.filter((x) => x.uid !== uid); } }),
    spendLA: (uid) => mutate((d, L) => { const c = d.combatants.find((x) => x.uid === uid); const tk = `${d.round}:${d.activeUid}`; if (c?.legendary && c.legendary.rem > 0 && c.laTurnKey !== tk) { c.legendary.rem -= 1; c.laTurnKey = tk; L.push(`<b>${c.name}</b> spends a legendary action (${c.legendary.rem} left this round).`); } }),
    resetLA: (uid) => mutate((d) => { const c = d.combatants.find((x) => x.uid === uid); if (c?.legendary) c.legendary.rem = c.legendary.max; }),
    spendLegRes: (uid) => mutate((d, L, T) => { const c = d.combatants.find((x) => x.uid === uid); if (c?.legRes && c.legRes.rem > 0) { c.legRes.rem -= 1; L.push(`<b>${c.name}</b> uses a Legendary Resistance (${c.legRes.rem} left) — the save succeeds instead.`); T.push({ kind: "bad", text: `${c.name} burns a Legendary Resistance (${c.legRes.rem} left).` }); } }),
    resetLegRes: (uid) => mutate((d) => { const c = d.combatants.find((x) => x.uid === uid); if (c?.legRes) c.legRes.rem = c.legRes.max; }),

    rollAttack: (uid, ai) => {
      const st = stateRef.current;
      const c = st.combatants.find((x) => x.uid === uid);
      const cands = c ? targetCands(st, c) : [];
      const opp = cands.filter((x) => (c.side === "ally" ? x.side !== "ally" : x.side === "ally"));
      if (c.type === "monster" && (atkLeft(c) <= 0 || atkNameLeft(c, c.actions[ai].n) <= 0)) return;
      if (opp.some(targetWorth)) setModal({ type: "target-pick", uid, ai });
      else mutate((d, L, T) => attackRollCore(d, L, uid, ai, { T, countAtk: c.type === "monster" }));
    },
    resolveAttack: ({ uid, ai, targetUid, vsOverride, la, opp }) => {
      setModal(null);
      mutate((d, L, T) => {
        const c = d.combatants.find((x) => x.uid === uid); if (!c) return;
        if (la) {
          const tk = `${d.round}:${d.activeUid}`;
          if (!c.legendary || c.legendary.rem <= 0 || c.laTurnKey === tk) return;
          c.legendary.rem -= 1; c.laTurnKey = tk;
          L.push(`<b>${c.name}</b> spends a legendary action (${c.legendary.rem} left this round).`);
        }
        if (opp) {
          if (!c.reaction) return;
          c.reaction = false;
          L.push(`<b>${c.name}</b> takes an <b>opportunity attack</b> (reaction spent):`);
        }
        attackRollCore(d, L, uid, ai, { targetUid, vsOverride, T, countAtk: !la && !opp && c.type === "monster" });
      });
    },
    applyChipParts: (resKey, chipId, targetUid, parts) => {
      mutate((d, L, T) => {
        const t = d.combatants.find((x) => x.uid === targetUid); if (!t || t.dead) return;
        parts.forEach((p) => applyDamage(t, p.amt, p.dtype, L, T));
        const dmgStr = parts.map((p) => `${p.amt} ${p.dtype || "damage"}`).join(" + ");
        setTimeout(() => setRowFlash({ uid: targetUid, text: `${dmgStr} → ${t.name}${t.dead ? " ☠" : ""}`, id: Math.random() }), 0);
      });
      setResults((r) => {
        const arr = (r[resKey] || []).map((ch) => (ch.id === chipId ? { t: "✓ applied", k: "sgood" } : ch));
        return { ...r, [resKey]: arr };
      });
    },

    spendLARoll: (uid, ai) => {
      const st = stateRef.current;
      const c = st.combatants.find((x) => x.uid === uid);
      if (!c?.legendary || c.legendary.rem <= 0) return;
      const opp = targetCands(st, c).filter((x) => (c.side === "ally" ? x.side !== "ally" : x.side === "ally"));
      if (opp.some(targetWorth)) setModal({ type: "target-pick", uid, ai, la: true });
      else mutate((d, L, T) => {
        const cc = d.combatants.find((x) => x.uid === uid);
        const tk = `${d.round}:${d.activeUid}`;
        if (!cc?.legendary || cc.legendary.rem <= 0 || cc.laTurnKey === tk) return;
        cc.legendary.rem -= 1; cc.laTurnKey = tk;
        L.push(`<b>${cc.name}</b> spends a legendary action (${cc.legendary.rem} left this round).`);
        attackRollCore(d, L, uid, ai, { T });
      });
    },


    rollBonus: (uid, ai, dice, dtype, alt) => mutate((d, L, T) => {
      const c = d.combatants.find((x) => x.uid === uid); if (!c) return;
      const a = c.actions[ai];
      const r = rollFormula(dice); if (!r) return;
      const tag = alt ? " (alt)" : " (conditional)";
      const modTxt = r.mod ? ` ${fmtMod(r.mod)}` : "";
      const chip = r.dice && r.dice.length <= 6
        ? { id: Math.random(), dice: r.dice.map((x) => ({ ...x, cls: "dmgd" })), dieSize: 24, t: `${modTxt} = ${r.total} ${dtype}${tag}`, k: "dmg" }
        : { t: `${dtype} ${r.total} [${r.text}]${tag}`, k: "dmg" };
      setTimeout(() => setResults((res) => ({ ...res, [`${uid}:${ai}`]: [...(res[`${uid}:${ai}`] || []), chip] })), 0);
      L.push(`<b>${c.name}</b> — ${a.n} ${alt ? "alternate" : "conditional"} damage: ${r.total} ${dtype} [${r.text}]`);
    }),

    useSaveAction: (uid, ai) => mutate((d, L, T) => {
      const c = d.combatants.find((x) => x.uid === uid); if (!c) return;
      const a = c.actions[ai];
      const chips = [{ t: `DC ${a.save?.dc} ${a.save?.ability} save`, k: "hit" }];
      const dice = a.dmg || (a.d && (a.d.match(/(\d+d\d+(?:[+-]\d+)?)/) || [])[1]);
      if (dice) {
        const r = rollFormula(dice);
        if (r && r.dice && r.dice.length <= 6) {
          chips.push({ id: Math.random(), dice: r.dice.map((x) => ({ ...x, cls: "dmgd" })), dieSize: 24, t: `${r.mod ? ` ${fmtMod(r.mod)}` : ""} = ${r.total} · half ${Math.floor(r.total / 2)}`, k: "dmg" });
        } else if (r) chips.push({ t: `damage ${r.total} [${r.text}] · half ${Math.floor(r.total / 2)}`, k: "dmg" });
      }
      if (a.rech) a.ready = false;
      if (a.conc) { c.concentration = a.n.replace(/\s*\((spell|bonus)\)\s*/i, ""); chips.push({ t: "concentrating", k: "ok" }); }
      setTimeout(() => setResults((r) => ({ ...r, [`${uid}:${ai}`]: chips })), 0);
      L.push(`<b>${c.name}</b> uses <b>${a.n}</b> — ${chips.map((x) => x.t).join("; ")}`);
    }),

    useTextAction: (uid, ai) => mutate((d, L) => {
      const c = d.combatants.find((x) => x.uid === uid); if (!c) return;
      const a = c.actions[ai];
      if (a.conc) c.concentration = a.n.replace(/\s*\((spell|bonus)\)\s*/i, "");
      L.push(`<b>${c.name}</b> uses <b>${a.n}</b>${a.conc ? " (concentrating)" : ""}.`);
    }),
  };

  /* ---------- adders ---------- */
  const addFromBestiary = (sb, count, rollHp) => mutate((d, L) => {
    for (let i = 0; i < count; i++) {
      let hp;
      if (rollHp && sb.hpF) { const r = rollFormula(sb.hpF); if (r) hp = Math.max(1, r.total); }
      const m = makeMonster(sb, d, hp != null ? { hp } : {});
      d.combatants.push(m);
      L.push(`Added <b>${m.name}</b> — ${m.initText}${hp != null ? `, HP ${m.maxHp} [${sb.hpF}]` : ""}`);
    }
  });
  const addCustom = (sb, count, side, notes, saveToo) => {
    mutate((d, L) => {
      for (let i = 0; i < count; i++) { const m = makeMonster(sb, d, { side, notes }); d.combatants.push(m); L.push(`Added <b>${m.name}</b> — ${m.initText}`); }
    });
    if (saveToo) { upsertBestiary([sb]); pushToasts([{ kind: "good", text: `"${sb.name}" saved to your bestiary.` }]); }
  };
  const saveEditedMonster = (sb, originalName) => {
    const list = bestRef.current.filter((x) => x.name.toLowerCase() !== originalName.toLowerCase());
    const i = list.findIndex((x) => x.name.toLowerCase() === sb.name.toLowerCase());
    if (i >= 0) list[i] = sb; else list.push(sb);
    list.sort((a, b) => a.name.localeCompare(b.name));
    saveMyBestiary(list);
    pushToasts([{ kind: "good", text: `"${sb.name}" updated in your bestiary.` }]);
  };
  const addPlaytest = () => mutate((d, L) => {
    [{ name: "Player", init: 11, ac: 15, hp: 45 }, { name: "Player 2", init: 14, ac: 17, hp: 52 }].forEach((pp) => {
      const p = makePlayer(pp);
      d.combatants.push(p);
      L.push(`Added <b>${p.name}</b> (initiative ${pp.init}, AC ${pp.ac}, ${pp.hp} HP tracked)`);
    });
    const scale = (m, { hp, hitDelta = 0, dcDelta = 0, legRes = null, label }) => {
      m.hp = m.maxHp = hp;
      m.actions.forEach((a) => {
        if (a.hit != null) a.hit += hitDelta;
        if (a.save && a.save.dc) a.save.dc += dcDelta;
      });
      const shift = (txt) => (txt || "")
        .replace(/spell save DC (\d+)/g, (_, n) => `spell save DC ${+n + dcDelta}`)
        .replace(/Saving Throw:\s*DC (\d+)/g, (_, n) => `Saving Throw: DC ${+n + dcDelta}`);
      ["traits", "actions", "bonus", "reactions"].forEach((s2) => (m[s2] || []).forEach((x) => { x.d = shift(x.d); }));
      if (m.legendary) m.legendary.options.forEach((o) => { o.d = shift(o.d); });
      if (m.spellDC != null) m.spellDC += dcDelta;
      if (m.spellAtk != null) m.spellAtk += hitDelta;
      if (m.spellDC != null) m.spellDmgRatio = 0.5;
      if (legRes != null && m.legRes) { m.legRes.max = legRes; m.legRes.rem = legRes; }
      m.notes = (m.notes ? m.notes + " " : "") + "⚖ pre-scaled for playtest party";
      L.push(`⚖ <b>${m.name}</b>: ${label}`);
      return m;
    };
    const gw = makeMonster(BESTIARY.find((b) => b.name === "Goblin Warrior"), d);
    d.combatants.push(gw);
    L.push(`Added <b>${gw.name}</b> — ${gw.initText}`);
    const am = makeMonster(BESTIARY.find((b) => b.name === "Archmage"), d);
    d.combatants.push(scale(am, { hp: 50, hitDelta: -2, dcDelta: -2, label: "HP 99→50, attacks −2, save DCs −2 (balanced to party)" }));
    L.push(`Added <b>${am.name}</b> — ${am.initText}`);
    const dr = makeMonster(BESTIARY.find((b) => b.name === "Adult Black Dragon"), d);
    d.combatants.push(scale(dr, { hp: 90, hitDelta: -3, dcDelta: -3, legRes: 2, label: "HP 195→90, attacks −3, save DCs −3, Legendary Resistance 3→2 (balanced to party)" }));
    L.push(`Added <b>${dr.name}</b> — ${dr.initText}`);
    L.push(`🧪 Playtest encounter loaded — 2 players vs goblin + scaled Archmage + scaled dragon.`);
  });

  const addPlayerNow = () => {
    if (!pName.trim()) return;
    mutate((d, L) => {
      const p = makePlayer({ name: pName.trim(), init: pInit, ac: pAc ? parseInt(pAc, 10) : null, hp: pHp !== "" ? parseInt(pHp, 10) : null, pp: pPp !== "" ? parseInt(pPp, 10) : null });
      d.combatants.push(p);
      L.push(`Added <b>${p.name}</b> (initiative ${p.init ?? "—"}${p.ac ? `, AC ${p.ac}` : ""}${p.hp != null ? `, ${p.hp} HP tracked` : ""})`);
    });
    setPName(""); setPInit(""); setPAc(""); setPHp(""); setPPp("");
  };

  const applyBalance = (items) => {
    setModal(null);
    mutate((d, L) => {
      items.forEach((pr) => {
        const c = d.combatants.find((x) => x.uid === pr.uid);
        if (!c || !pr.patch) return;
        const p = { ...pr.patch };
        if (p.actions) p.actions = p.actions.map((a) => ({ ...a, ready: true }));
        if (p.hp != null && p.maxHp == null) p.maxHp = p.hp;
        Object.assign(c, p);
        L.push(`⚖ <b>${pr.target}</b>${p.name && p.name !== pr.target ? ` → <b>${p.name}</b>` : ""}: ${pr.summary}`);
      });
    });
    pushToasts([{ kind: "good", text: `Applied ${items.length} balance change${items.length === 1 ? "" : "s"}.` }]);
  };
  const addEffectPrompt = () => setModal({ type: "effect-prompt" });

  const reallyStart = () => mutate((d, L, T) => {
    if (d.combatants.length === 0) return;
    d.mode = "combat"; d.round = 1;
    const first = sortOrder(d.combatants).find((c) => !c.dead && c.type !== "object");
    if (first) { d.activeUid = first.uid; L.push(`— <b>Combat begins! Round 1</b> —`); onTurnStart(first, d, L, T); L.push(`▶ <b>${first.name}</b>'s turn.`); }
  });
  const startCombat = () => {
    const cur = stateRef.current;
    // monsters/allies without initiative (e.g. kept through "End combat") auto-roll
    if (cur.combatants.some((c) => !c.dead && c.init == null && c.type === "monster")) {
      mutate((d, L) => {
        d.combatants.forEach((c) => {
          if (!c.dead && c.init == null && c.type === "monster") {
            const r = d20(c.mods?.dex ?? 0, "none");
            c.init = r.total; c.initText = `Initiative ${r.text}`;
            L.push(`<b>${c.name}</b> rolls initiative: ${r.text}`);
          }
        });
      });
    }
    if (cur.combatants.some((c) => !c.dead && c.init == null && c.type === "player")) { setModal({ type: "roll-init" }); return; }
    reallyStart();
  };
  const doEndCombat = () => {
    setModal(null); setResults({});
    mutate((d, L) => {
      const kept = d.combatants.filter((c) => c.side === "ally" && c.type !== "effect");
      kept.forEach((c) => {
        c.init = null; c.initText = null; c.conditions = []; c.concentration = null;
        c.reaction = true; c.acBoost = 0; c.atkUsed = 0; c.atkUsedBy = {}; c.atkGrant = 0; c.advMode = "none"; c.advVs = "none";
      });
      d.combatants = kept;
      d.mode = "setup"; d.round = 0; d.activeUid = null;
      L.push(`— <b>Combat ends.</b> The party presses on${kept.some((c) => c.unconscious) ? " (someone's being carried…)" : ""}. —`);
    });
  };
  const showRechargeDice = (d) => {
    const rr = d.rechargeRolls || [];
    if (!rr.length) return null;
    const entries = Object.fromEntries(rr.map((x) => [
      `${x.uid}:${x.ai}`,
      [{ id: Math.random(),
         dice: [{ s: 6, v: x.v, cls: x.ok ? "plain" : "fumbled" }],
         dieSize: 24,
         t: x.ok ? " — recharged!" : ` — still spent (needs ${x.need}+)`,
         k: x.ok ? "crit" : "fumble" }],
    ]));
    return entries;
  };
  const clearActiveResults = (d, extra) => {
    // A creature starting its fresh turn shouldn't still display last round's rolls.
    const prefix = `${d.activeUid}:`;
    setTimeout(() => setResults((r) => {
      const clean = {};
      for (const k in r) if (!k.startsWith(prefix)) clean[k] = r[k];
      return extra ? { ...clean, ...extra } : clean;
    }), 0);
  };
  const requestNext = () => {
    const act = stateRef.current.combatants.find((x) => x.uid === stateRef.current.activeUid);
    const tk = `${stateRef.current.round}:${stateRef.current.activeUid}`;
    const rpts = act && !act.dead ? (act.conditions || []).filter((cd) => cd.rpt && cd.rptDone !== tk) : [];
    if (stateRef.current.mode === "combat" && rpts.length) { setModal({ type: "repeat-save", uid: act.uid, done: {} }); return; }
    next();
  };
  const next = () => mutate((d, L, T) => { advanceTurn(d, L, T, 1); clearActiveResults(d, showRechargeDice(d)); });
  const prev = () => mutate((d, L, T) => { advanceTurn(d, L, T, -1); clearActiveResults(d); });

  const doReset = (keepMonsters) => {
    setModal(null); setResults({}); setChat([]);
    mutate((d, L) => {
      if (keepMonsters) {
        d.combatants = d.combatants.filter((c) => c.type === "monster").map((c) => {
          const sb = { ...c, hp: c.maxHp };
          const fresh = makeMonster({ ...c, hp: c.maxHp, hpF: c.hpF, legendary: c.legendary ? { count: c.legendary.max, options: c.legendary.options } : null, legRes: c.legRes ? c.legRes.max : null }, { combatants: [] }, { name: c.name, side: c.side, notes: c.notes });
          fresh.baseName = c.baseName;
          return fresh;
        });
        d.mode = "setup"; d.round = 0; d.activeUid = null; d.log = [];
        L.push("Combat reset — monsters kept with fresh HP and rerolled initiative.");
      } else {
        d.combatants = []; d.mode = "setup"; d.round = 0; d.activeUid = null; d.log = [];
        L.push("Combat cleared.");
      }
    });
  };

  /* ---------- modal apply handlers ---------- */
  const applyDamageModal = ({ amount, dtype, mode, targets, half }) => {
    setModal(null);
    mutate((d, L, T) => {
      targets.forEach((uid) => {
        const c = d.combatants.find((x) => x.uid === uid); if (!c) return;
        const amt = half.includes(uid) ? Math.floor(amount / 2) : amount;
        if (mode === "heal") applyHeal(c, amt, L);
        else if (mode === "thp") grantTempHp(c, amt, L);
        else applyDamage(c, amt, dtype, L, T);
      });
    });
  };
  const removeRptCondition = (d, L, c, cd) => {
    c.conditions = c.conditions.filter((x) => x !== cd);
    L.push(`<b>${c.name}</b> shakes off <b>${cd.name}</b>.`);
    if (cd.src && cd.spell) {
      const others = d.combatants.some((t) => t !== c && (t.conditions || []).some((x) => x.src === cd.src && x.spell === cd.spell));
      if (!others) {
        const cs = d.combatants.find((x) => x.uid === cd.src);
        if (cs && cs.concentration === cd.spell) { cs.concentration = null; L.push(`<b>${cd.spell}</b> ends — <b>${cs.name}</b> is no longer concentrating.`); }
      }
    }
  };

  const resolveGroupSave = ({ ability, dc, dmg, dtype, halfOn, targets, noSave, cond, condR, effectUid, laUid, cmdPick, concSrc, concCast, rpt, rptNote, spellCastUid }) => {
    mutate((d, L, T) => {
      if (effectUid) {
        const eff = d.combatants.find((x) => x.uid === effectUid);
        if (eff) {
          if (eff.fxUsedRound === d.round) return;
          eff.fxUsedRound = d.round;
        }
      }
      if (laUid) {
        const lc = d.combatants.find((x) => x.uid === laUid);
        const tk = `${d.round}:${d.activeUid}`;
        if (!lc?.legendary || lc.legendary.rem <= 0 || lc.laTurnKey === tk) return;
        lc.legendary.rem -= 1; lc.laTurnKey = tk;
        L.push(`<b>${lc.name}</b> spends a legendary action (${lc.legendary.rem} left this round).`);
      }
      if (spellCastUid) {
        const sc = d.combatants.find((x) => x.uid === spellCastUid);
        const tk = `${d.round}:${d.activeUid}`;
        if (sc && d.activeUid === sc.uid) {
          if (sc.spellCastTurn === tk) return;
          if (sc.spellStyle === "replace") {
            if (atkLeft(sc) <= 0) return;
            sc.atkUsed = (sc.atkUsed || 0) + 1;
            L.push(`<b>${sc.name}</b> replaces one attack with a use of Spellcasting.`);
          } else if (sc.spellStyle === "action") {
            if ((sc.atkUsed || 0) > 0) return;
            sc.atkUsed = Math.max(sc.atkUsed || 0, atkMaxOf(sc));
            L.push(`<b>${sc.name}</b> uses its action to cast a spell.`);
          }
          sc.spellCastTurn = tk;
        }
      }
      if (concSrc && concCast) {
        const cs = d.combatants.find((x) => x.uid === concSrc);
        if (cs && !cs.dead) { cs.concentration = concCast; L.push(`<b>${cs.name}</b> is now concentrating on <b>${concCast}</b>.`); }
      }
      let dmgRoll = null;
      if (dmg) {
        dmgRoll = rollFormula(dmg) || (parseInt(dmg, 10) ? { total: parseInt(dmg, 10), text: dmg, dice: null, mod: 0 } : null);
      }
      L.push(noSave
        ? `<b>Area damage</b>: ${dmgRoll ? `${dmgRoll.total} [${dmgRoll.text}]${dtype ? ` ${dtype}` : ""}` : ""} — ${targets.length} target${targets.length === 1 ? "" : "s"}, no save.`
        : `<b>Group save</b>: DC ${dc} ${ability.toUpperCase()}${dmgRoll ? `, damage ${dmgRoll.total} [${dmgRoll.text}]${dtype ? ` ${dtype}` : ""}${halfOn ? ", half on success" : ""}` : ""}${cond ? `, ${cond} on fail` : ""} — ${targets.length} target${targets.length === 1 ? "" : "s"}.`);
      const rows = [];
      const chipUpdates = {};
      const pending = [];
      targets.forEach((uid) => {
        const c = d.combatants.find((x) => x.uid === uid); if (!c || c.dead) return;
        if (!noSave && c.type === "player") {
          pending.push({ uid: c.uid, name: c.name, untracked: c.maxHp == null });
          return;
        }
        if (noSave) {
          let amt = dmgRoll ? dmgRoll.total : 0;
          if (amt > 0) applyDamage(c, amt, dtype || null, L, T);
          L.push(`<b>${c.name}</b> takes ${amt}${dtype ? ` ${dtype}` : ""} (no save)${c.dead ? " ☠" : c.unconscious ? " (down)" : ""}`);
          rows.push({ uid: c.uid, name: c.name, total: null, ok: null, dmg: amt, note: c.dead ? "☠" : c.unconscious ? "(down)" : "" });
          return;
        }
        const cov = ability === "dex" ? coverBonus(c) : 0;
        const mod = saveMod(c, ability) + cov;
        const r = d20(mod, c.advMode);
        const ok = r.total >= dc;
        let amt = null, note = "";
        if (dmgRoll) {
          amt = ok ? (halfOn ? Math.floor(dmgRoll.total / 2) : 0) : dmgRoll.total;
          if (amt > 0) applyDamage(c, amt, dtype || null, L, T);
          if (c.dead) note = "☠"; else if (c.unconscious) note = "(down)";
        }
        if (cond && !ok && !c.dead && !c.conditions.some((cd) => cd.name === cond)) {
          c.conditions.push({ name: cond, rounds: condR ?? null, src: concSrc || null, spell: concCast || null, rpt: rpt ? { ab: ability, dc, note: rptNote || null } : null });
          note = (note ? note + " " : "") + `+${cond}`;
          L.push(`<b>${c.name}</b> gains <b>${cond}</b>${condR ? ` (${condR} rd)` : ""} from the failed save.`);
        }
        L.push(`<b>${c.name}</b> ${ability.toUpperCase()} save ${r.text} vs DC ${dc} — <b>${ok ? "SUCCESS" : "FAIL"}</b>${amt != null ? `, takes ${amt}` : ""}`);
        const both = r.adv !== "none";
        const dice = both
          ? [{ s: 20, v: r.a, cls: r.a === 20 ? "critd" : r.a === 1 ? "fumbled" : "plain", dropped: r.a !== r.nat },
             { s: 20, v: r.b, cls: r.b === 20 ? "critd" : r.b === 1 ? "fumbled" : "plain", dropped: r.b !== r.nat && r.a === r.nat }]
          : [{ s: 20, v: r.nat, cls: r.crit ? "critd" : r.fumble ? "fumbled" : "plain" }];
        chipUpdates[`${uid}:save`] = [{
          id: Math.random(), dice, dieSize: 30,
          t: ` ${ability.toUpperCase()} save ${fmtMod(mod)} = ${r.total} vs DC ${dc} — ${ok ? "SUCCESS" : "FAIL"}${amt != null ? ` · takes ${amt}` : ""}`,
          k: ok ? "sgood" : "sbad", mod, dc,
        }];
        const rowDice = (r.adv !== "none")
          ? [{ s: 20, v: r.a, cls: r.a === 20 ? "critd" : r.a === 1 ? "fumbled" : "plain", dropped: r.a !== r.nat },
             { s: 20, v: r.b, cls: r.b === 20 ? "critd" : r.b === 1 ? "fumbled" : "plain", dropped: r.b !== r.nat && r.a === r.nat }]
          : [{ s: 20, v: r.nat, cls: r.crit ? "critd" : r.fumble ? "fumbled" : "plain" }];
        rows.push({ uid: c.uid, name: c.name, total: r.total, mod, ok, dmg: amt, note, dice: rowDice });
      });
      const resolved = {
        pending,
        ctx: { ability, dc, dtype, halfOn, cond, condR, dmgTotal: dmgRoll ? dmgRoll.total : null, cmdPick, concSrc, concCast, rpt, rptNote },
        title: noSave ? `Area damage — ${rows.length} hit` : `DC ${dc} ${ability.toUpperCase()}${pending.length ? ` — players roll now!` : ` — ${rows.filter((x) => x.ok).length}/${rows.length} saved`}`,
        dmgChip: dmgRoll ? { dice: dmgRoll.dice && dmgRoll.dice.length <= 8 ? dmgRoll.dice.map((x) => ({ ...x, cls: "dmgd" })) : null, t: `${dmgRoll.total}${dtype ? ` ${dtype}` : ""} damage [${dmgRoll.text}]${halfOn ? ` · half ${Math.floor(dmgRoll.total / 2)}` : ""}` } : null,
        rows,
      };
      setTimeout(() => {
        setResults((res) => ({ ...res, ...chipUpdates }));
        setModal((mm) => (mm && mm.type === "group-save" ? { ...mm, resolved } : mm));
      }, 0);
    });
  };

  const applySaveRoll = (ab, dc) => {
    const uid = modal.uid;
    mutate((d, L) => {
      const c = d.combatants.find((x) => x.uid === uid); if (!c) return;
      const cov = ab === "dex" ? coverBonus(c) : 0;
      const mod = saveMod(c, ab) + cov;
      const r = d20(mod, c.advMode);
      const dcTxt = dc ? ` vs DC ${dc} — <b>${r.total >= dc ? "SUCCESS" : "FAIL"}</b>` : "";
      L.push(`<b>${c.name}</b> ${ab.toUpperCase()} save ${r.text}${cov ? ` (incl. +${cov} cover)` : ""}${dcTxt}`);
      const both = r.adv !== "none";
      const dice = both
        ? [{ s: 20, v: r.a, cls: r.a === 20 ? "critd" : r.a === 1 ? "fumbled" : "plain", dropped: r.a !== r.nat },
           { s: 20, v: r.b, cls: r.b === 20 ? "critd" : r.b === 1 ? "fumbled" : "plain", dropped: r.b !== r.nat && r.a === r.nat }]
        : [{ s: 20, v: r.nat, cls: r.crit ? "critd" : r.fumble ? "fumbled" : "plain" }];
      const ok = dc ? r.total >= dc : null;
      const chip = {
        id: Math.random(), dice, dieSize: 30,
        t: ` ${ab.toUpperCase()} save ${fmtMod(mod)} = ${r.total}${cov ? ` (incl. +${cov} cover)` : ""}${dc ? ` vs DC ${dc} — ${ok ? "SUCCESS" : "FAIL"}` : ""}`,
        k: ok == null ? "hit" : ok ? "sgood" : "sbad",
        badge: { ab: ab.toUpperCase(), total: r.total, ok },
        mod, dc,
      };
      setTimeout(() => {
        setResults((res) => ({ ...res, [`${uid}:save`]: [chip] }));
        setModal((mm) => (mm && mm.type === "save" && mm.uid === uid ? { ...mm, rolled: chip } : mm));
      }, 0);
    });
  };
  const applyCondModal = (name, rounds, uids) => {
    setModal(null);
    mutate((d, L) => {
      uids.forEach((uid) => {
        const c = d.combatants.find((x) => x.uid === uid); if (!c) return;
        if ((c.condImmune || []).some((x) => x.toLowerCase() === name.toLowerCase())) { L.push(`<b>${c.name}</b> is immune to ${name}.`); return; }
        c.conditions.push({ name, rounds });
        L.push(`<b>${c.name}</b> gains <b>${name}</b>${rounds ? ` (${rounds} rounds)` : ""}`);
      });
    });
  };

  /* ---------- save slots ---------- */
  const saveSlot = async (name) => { await stSet(`dm5e:slot:${name}`, stateRef.current); pushToasts([{ kind: "good", text: `Saved "${name.replace(/_/g, " ")}".` }]); };
  const loadSlot = async (name) => {
    const s = await stGet(`dm5e:slot:${name}`);
    if (s) { pushUndo(stateRef.current); setState(s); setModal(null); setResults({}); pushToasts([{ kind: "good", text: `Loaded "${name.replace(/_/g, " ")}".` }]); }
  };
  const deleteSlot = async (name) => stDel(`dm5e:slot:${name}`);
  const saveGroup = async (name) => {
    const enemies = stateRef.current.combatants.filter((c) => c.type === "monster" && c.side === "enemy");
    if (enemies.length === 0) return;
    await stSet(`dm5e:group:${name}`, enemies.map(statblockFromCombatant));
    pushToasts([{ kind: "good", text: `Saved ${enemies.length} monsters as "${name.replace(/_/g, " ")}".` }]);
  };
  const addGroup = async (name) => {
    const sbs = await stGet(`dm5e:group:${name}`);
    if (!Array.isArray(sbs)) return;
    mutate((d, L) => {
      sbs.forEach((sb) => { const m = makeMonster(sb, d, { side: "enemy" }); d.combatants.push(m); L.push(`Added <b>${m.name}</b> — ${m.initText}`); });
    });
    setModal(null);
    pushToasts([{ kind: "good", text: `Added ${sbs.length} monster${sbs.length === 1 ? "" : "s"} from "${name.replace(/_/g, " ")}".` }]);
  };
  const deleteGroup = async (name) => stDel(`dm5e:group:${name}`);
  const exportAll = async () => {
    const slotKeys = await stList("dm5e:slot:");
    const groupKeys = await stList("dm5e:group:");
    const slots = {}, groups = {};
    for (const k of slotKeys) slots[k.replace("dm5e:slot:", "")] = await stGet(k);
    for (const k of groupKeys) groups[k.replace("dm5e:group:", "")] = await stGet(k);
    return { app: "dm5e", version: 1, exported: new Date().toISOString(), bestiary: bestRef.current, party: partyRef.current, slots, groups };
  };
  const importAll = async (obj) => {
    const r = { bestiary: 0, slots: 0, groups: 0 };
    if (Array.isArray(obj.bestiary) && obj.bestiary.length) { const { added, updated } = upsertBestiary(obj.bestiary); r.bestiary = added + updated; }
    for (const [k, v] of Object.entries(obj.slots || {})) { if (v) { await stSet(`dm5e:slot:${k}`, v); r.slots++; } }
    for (const [k, v] of Object.entries(obj.groups || {})) { if (Array.isArray(v)) { await stSet(`dm5e:group:${k}`, v); r.groups++; } }
    if (obj.party) { setParty(obj.party); stSet("dm5e:party", obj.party); }
    return r;
  };


  const modalC = modal?.uid ? state.combatants.find((x) => x.uid === modal.uid) : null;

  /* ================= render ================= */
  return (
    <div className="dm-app" style={{ paddingBottom: botPad }}>
      <style>{CSS}</style>
      <Toasts toasts={toasts} />

      <div className="hdr">
        <span className={`title ${state.mode === "combat" ? "incombat" : ""}`}>DM Screen</span>
        {state.mode === "combat" && <span key={state.round} className="round roundpulse"><span className="roundword">Round </span><span className="roundabbr">R</span>{state.round}</span>}
        {state.mode === "combat" && (<>
          <button className="btn small ghost" onClick={prev} title="Back one turn">◀</button>
          <button className="btn primary" onClick={requestNext}>Next ▶</button>
        </>)}
        {state.mode === "setup" && state.combatants.length > 0 && (
          <button className="btn primary" onClick={startCombat}>Start combat</button>
        )}
        <span className="spacer" />
        <button className="btn small ghost" title="Undo last change" disabled={undoN === 0} onClick={undo}>↩</button>
        <span className="menu-anchor">
          <button className="btn small" onClick={() => { setAddMenu(!addMenu); setClearMenu(false); setMoreMenu(false); }}>+ Add</button>
          {addMenu && (
            <div className="menu" onClick={() => setAddMenu(false)}>
              <button onClick={() => setModal({ type: "bestiary" })}>Monster from bestiary…</button>
              <button onClick={() => setModal({ type: "custom" })}>Custom monster…</button>
              <button onClick={() => setModal({ type: "player" })}>Player / ally…</button>
              <button onClick={() => setModal({ type: "suggest-enc" })}>🎲 Suggest encounter…</button>
              <button onClick={addEffectPrompt}>Effect / lair actions…</button>
              <button onClick={() => setModal({ type: "object-prompt" })}>Object (pillar, door…)…</button>
              <button onClick={addPlaytest} style={{ color: "var(--fx)" }}>🧪 Playtest encounter</button>
            </div>
          )}
        </span>
        <button className="btn small ghost" title="Spell compendium" onClick={() => setSpellBook(true)}>📖</button>
        <button className="btn small ghost" title="Group save / AoE" onClick={() => setModal({ type: "group-save" })}>⭗</button>
        <span className="hdr-wide">
          <button className="btn small ghost" onClick={toggleLog}>Log</button>
          {state.combatants.some((c) => c.type === "monster" && !c.dead) && (
            <button className="btn small ghost" title="Balance encounter to your party" onClick={() => setModal({ type: "balance" })}>⚖</button>
          )}
          <button className="btn small ghost" onClick={() => setModal({ type: "slots" })}>Saves</button>
          <span className="menu-anchor">
            <button className="btn small ghost" onClick={() => { setClearMenu(!clearMenu); setAddMenu(false); }}>Clear</button>
            {clearMenu && (
              <div className="menu" onClick={() => setClearMenu(false)}>
                {state.combatants.some((c) => c.side === "ally") && (
                  <button onClick={() => setModal({ type: "confirm-end" })}>End combat (keep party)</button>
                )}
                <button onClick={() => setModal({ type: "confirm-reset" })}>New combat (keep monsters)</button>
                <button className="warn" onClick={() => setModal({ type: "confirm-clear" })}>Clear everything</button>
              </div>
            )}
          </span>
        </span>
        <span className="menu-anchor hdr-narrow">
          <button className="btn small ghost" onClick={() => { setMoreMenu(!moreMenu); setAddMenu(false); }}>⋯</button>
          {moreMenu && (
            <div className="menu" onClick={() => setMoreMenu(false)}>
              <button onClick={() => setSpellBook(true)}>📖 Spell compendium…</button>
              <button onClick={() => setModal({ type: "group-save" })}>⭗ Group save / AoE…</button>
              <button onClick={toggleLog}>{showLog ? "Hide log" : "Show log"}</button>
              {state.combatants.some((c) => c.type === "monster" && !c.dead) && (
                <button onClick={() => setModal({ type: "balance" })}>⚖ Balance encounter…</button>
              )}
              <button onClick={() => setModal({ type: "slots" })}>Saves & groups…</button>
              {state.combatants.some((c) => c.side === "ally") && (
                <button onClick={() => setModal({ type: "confirm-end" })}>End combat (keep party)</button>
              )}
              <button onClick={() => setModal({ type: "confirm-reset" })}>New combat (keep monsters)</button>
              <button className="warn" onClick={() => setModal({ type: "confirm-clear" })}>Clear everything</button>
            </div>
          )}
        </span>
      </div>

      {restoreBanner && (
        <div className="main" style={{ paddingBottom: 0 }}>
          <div className="notice" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ flex: 1 }}>Found an autosaved combat ({restoreBanner.combatants.length} combatants{restoreBanner.mode === "combat" ? `, round ${restoreBanner.round}` : ""}).</span>
            <button className="btn small primary" onClick={() => { setState(restoreBanner); setRestoreBanner(null); }}>Restore</button>
            <button className="btn small" onClick={() => { setRestoreBanner(null); stDel("dm5e:auto"); }}>Discard</button>
          </div>
        </div>
      )}

      {order.length > 0 && (
        <>
          <div className="railbar">
            <span>Initiative order</span>
            <span className="spacer" style={{ flex: 1 }} />
            {state.combatants.some((c) => c.dead && (c.loot || []).length > 0) && (
              <button className="btn small ghost" onClick={() => setModal({ type: "loot-fallen" })}>💰 Loot the fallen</button>
            )}
            <button className="btn small ghost" onClick={() => setRailOpen(!railOpen)}>{railOpen ? "collapse ▲" : "expand ▼"}</button>
          </div>
          <div className={`rail ${railOpen ? "" : "collapsed"}`}>
            {order.map((c, i) => (
              <Row key={c.uid} flash={rowFlash && rowFlash.uid === c.uid ? rowFlash : null} saveBadge={results[`${c.uid}:save`]?.[0]?.badge} c={c} active={c.uid === state.activeUid && state.mode === "combat"} isTop={i === 0} isBottom={i === order.length - 1} api={api} />
            ))}
          </div>
        </>
      )}

      <div className="main" style={{ flex: "1 0 auto", paddingTop: toasts.length ? Math.min(12 + toasts.length * 44, 108) : undefined, transition: "padding-top .3s ease" }}>
        {order.length === 0 && !restoreBanner && (
          <div className="card">
            <h3>New encounter</h3>
            <div className="trait" style={{ fontSize: 13 }}>
              Build the fight with <b>+ Add</b> above — pick monsters from the bestiary, craft custom ones,
              or drop in a saved monster group. Add your party below (initiative can wait until the table),
              tap <b>⚖</b> to balance the encounter to your players, then hit <b>Start combat</b>.
            </div>
          </div>
        )}

        {state.mode === "setup" && (
          <div className="card">
            <h3>Add player</h3>
            <div className="frow">
              <input type="text" placeholder="Name" value={pName} onChange={(e) => setPName(e.target.value)} style={{ flex: 1, minWidth: 100 }} />
              <input type="number" placeholder="Init (opt.)" value={pInit} onChange={(e) => setPInit(e.target.value)} title="Leave blank to enter initiative later, when combat starts" />
              <input type="number" placeholder="AC (opt.)" style={{ width: 80 }} value={pAc} onChange={(e) => setPAc(e.target.value)} />
              <input type="number" placeholder="HP (opt.)" style={{ width: 80 }} value={pHp} onChange={(e) => setPHp(e.target.value)} title="Fill in to track this player's HP in the app" />
              <input type="number" placeholder="PP (opt.)" style={{ width: 80 }} value={pPp} onChange={(e) => setPPp(e.target.value)} title="Passive Perception — shown on their row for quick reference" />
              <button className="btn primary" disabled={!pName.trim()} onClick={addPlayerNow}>Add</button>
            </div>
            <div className="trait" style={{ color: "var(--faint)" }}>Everything but the name is optional — blank initiative gets asked for when you start combat; blank HP means the player tracks their own. PP is passive Perception, shown on their row for quick stealth/ambush reference. With HP filled in, the app handles their damage, healing, and Bloodied like a monster.</div>
          </div>
        )}

        {legendaryWatch.map((c) => (
          <div className="reminder legbanner" key={c.uid}>
            <div className="legbanner-head" onClick={() => setLegOpen(legOpen === c.uid ? null : c.uid)}>
              {c.laTurnKey === `${state.round}:${state.activeUid}`
                ? <>👑 <b>{c.name}</b> has used its legendary action this turn ({c.legendary.rem} left this round).</>
                : <>👑 <b>{c.name}</b> can take a legendary action ({c.legendary.rem} left) at the end of this turn.</>}
              <span className="legcaret">{legOpen === c.uid ? "▲" : "▼"}</span>
            </div>
            {legOpen === c.uid && (
              <div className="legpanel">
                <LegendaryOptions c={c} api={api} results={results} turnKey={`${state.round}:${state.activeUid}`} />
              </div>
            )}
          </div>
        ))}

        {state.mode === "combat" && active && (
          active.type === "monster" ? <MonsterCard c={active} api={api} results={results} turnKey={`${state.round}:${state.activeUid}`} />
          : active.type === "player" ? <PlayerCard c={active} api={api} results={results} />
          : <EffectCard c={active} api={api} round={state.round} />
        )}

        {showLog && (
          <div className="card" ref={logRef}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <h3 style={{ marginBottom: 0 }}>Actions Log</h3>
              <span style={{ flex: 1 }} />
              <button className="btn small ghost" disabled={state.log.length === 0} onClick={async () => {
                const txt = state.log.map((l) => `[R${l.r}] ${l.t.replace(/<[^>]+>/g, "")}`).join("\n");
                try { await navigator.clipboard.writeText(txt); pushToasts([{ kind: "good", text: "Log copied to clipboard." }]); }
                catch (e) { setModal({ type: "log-text" }); }
              }}>Copy</button>
              <button className="btn small ghost" onClick={() => {
                if (!logArm) { setLogArm(true); setTimeout(() => setLogArm(false), 3000); return; }
                setLogArm(false);
                mutate((d) => { d.log = []; });
              }}>{logArm ? "Really clear?" : "Clear"}</button>
              <button className="btn small ghost" onClick={() => setLogCollapsed(!logCollapsed)}>{logCollapsed ? "expand ▼" : "collapse ▲"}</button>
              <button className="btn small ghost" title="Close (reopen anytime via Log in the header or ⋯ menu)" onClick={() => setShowLog(false)}>✕</button>
            </div>
            {!logCollapsed && <div className="logpane">
              {[...state.log].reverse().map((l, i) => (
                <div className="logline" key={i}><span className="rn">R{l.r}</span><span dangerouslySetInnerHTML={{ __html: l.t }} /></div>
              ))}
              {state.log.length === 0 && <div className="logline">Nothing yet.</div>}
            </div>}
          </div>
        )}
      </div>


      <div className="srd-attrib">
        This work includes material from the System Reference Document 5.2.1 ("SRD 5.2.1") by Wizards of the Coast LLC,
        available at <a href="https://www.dndbeyond.com/srd" target="_blank" rel="noreferrer">dndbeyond.com/srd</a>. The
        SRD 5.2.1 is licensed under the <a href="https://creativecommons.org/licenses/by/4.0/legalcode" target="_blank" rel="noreferrer">Creative
        Commons Attribution 4.0 International License</a>.
      </div>

      {/* modals */}
      {modal?.type === "damage" && <DamageModal state={state} presetUid={modal.uid} onApply={applyDamageModal} onClose={() => setModal(null)} />}
      {modal?.type === "save" && modalC && <SaveRollModal c={modalC} rolled={modal.rolled} onRoll={applySaveRoll} onClose={() => setModal(null)} />}
      {modal?.type === "cond" && <ConditionModal state={state} presetUid={modal.uid} onAdd={applyCondModal} onClose={() => setModal(null)} />}
      {modal?.type === "custom" && <CustomMonsterForm
        initial={modal.edit || modal.from || null}
        mode={modal.edit ? "edit" : modal.from ? "clone" : "create"}
        onAdd={(sb, count, side, notes, saveToo) => { addCustom(sb, count, side, notes, saveToo); setModal(null); }}
        onSaveEdit={(sb) => { saveEditedMonster(sb, modal.edit.name); setModal({ type: "bestiary" }); }}
        onClose={() => setModal(modal.edit || modal.from ? { type: "bestiary" } : null)} />}
      {modal?.type === "bestiary" && (
        <BestiaryModal custom={myBestiary} onAdd={(sb, count, rollHp) => { addFromBestiary(sb, count, rollHp); setModal(null); }}
          onDeleteCustom={(name) => saveMyBestiary(myBestiary.filter((x) => x.name !== name))}
          onImport={(arr) => upsertBestiary(arr)}
          onEdit={(b) => setModal({ type: "custom", edit: b })}
          onClone={(b) => setModal({ type: "custom", from: b })}
          onClose={() => setModal(null)} />
      )}
      {modal?.type === "slots" && (
        <SlotsModal hasEnemies={state.combatants.some((c) => c.type === "monster" && c.side === "enemy")}
          onSave={saveSlot} onLoad={loadSlot} onDelete={deleteSlot}
          onSaveGroup={saveGroup} onAddGroup={addGroup} onDeleteGroup={deleteGroup}
          onExportAll={exportAll} onImportAll={importAll}
          onClose={() => setModal(null)} />
      )}
      {modal?.type === "confirm-end" && (
        <ConfirmModal
          text={`Enemies and effects are removed; players and allies keep their current HP (and unconsciousness) into the next fight. Initiative resets. Conditions and concentration clear.${(() => { const n = state.combatants.filter((c) => c.side === "enemy").reduce((a, c) => a + (c.loot || []).length, 0); return n ? ` ⚠ ${n} unlooted item${n === 1 ? "" : "s"} will vanish with the enemies — loot first if you want them!` : ""; })()}`}
          confirmLabel="End combat" onYes={doEndCombat} onClose={() => setModal(null)} />
      )}
      {modal?.type === "roll-init" && (
        <RollInitModal list={state.combatants.filter((c) => !c.dead && c.init == null && c.type === "player")}
          onClose={() => setModal(null)}
          onStart={(vals) => {
            setModal(null);
            mutate((d, L) => {
              Object.entries(vals).forEach(([uid, v]) => {
                const c = d.combatants.find((x) => x.uid === uid);
                if (c) { c.init = parseInt(v, 10) || 0; L.push(`<b>${c.name}</b> initiative: ${c.init}`); }
              });
            });
            reallyStart();
          }} />
      )}
      {modal?.type === "defenses" && modalC && (
        <DefensesModal c={modalC} onClose={() => setModal(null)}
          onSave={(resist, immune, vuln) => {
            mutate((d, L) => {
              const c = d.combatants.find((x) => x.uid === modal.uid); if (!c) return;
              c.resist = resist; c.immune = immune; c.vuln = vuln;
              const parts = [];
              if (resist.length) parts.push(`resist ${resist.join("/")}`);
              if (immune.length) parts.push(`immune ${immune.join("/")}`);
              if (vuln.length) parts.push(`vulnerable ${vuln.join("/")}`);
              L.push(`<b>${c.name}</b> defenses: ${parts.length ? parts.join(" · ") : "none"}`);
            });
            setModal(null);
          }} />
      )}
      {modal?.type === "addattack" && modalC && (
        <AddAttackModal c={modalC} onClose={() => setModal(null)}
          onAdd={(action) => {
            mutate((d, L) => {
              const c = d.combatants.find((x) => x.uid === modal.uid); if (!c) return;
              c.actions = [...(c.actions || []), { ...action, ready: true }];
              L.push(`<b>${c.name}</b> gains attack: <b>${action.n}</b> (${fmtMod(action.hit)}, ${action.dmg} ${action.dtype}${action.extra ? ` + ${action.extra} ${action.extraType}` : ""})`);
            });
            setModal(null);
          }} />
      )}
      {modal?.type === "loot-give" && modalC && (
        <LootGiveModal c={modalC} onClose={() => setModal(null)}
          onSave={(items) => {
            mutate((d, L) => {
              const c = d.combatants.find((x) => x.uid === modal.uid); if (!c) return;
              c.loot = items;
              L.push(items.length ? `<b>${c.name}</b> now carries: ${items.map(lootName).join(", ")}` : `<b>${c.name}</b>'s loot cleared.`);
              syncWeaponAttacks(c, L);
            });
            setModal(null);
          }} />
      )}
      {modal?.type === "loot-fallen" && (
        <LootFallenModal state={state} onClose={() => setModal(null)}
          onTake={(uid, idx) => {
            mutate((d, L) => {
              const c = d.combatants.find((x) => x.uid === uid); if (!c) return;
              const item = lootName(c.loot[idx]);
              c.loot = c.loot.filter((_, i) => i !== idx);
              L.push(`💰 Looted <b>${item}</b> from ${c.name}.`);
              syncWeaponAttacks(c, L);
            });
          }} />
      )}
      {modal?.type === "balance" && (
        <BalanceModal state={state} party={party} onClose={() => setModal(null)}
          onSaveParty={(p) => { setParty(p); stSet("dm5e:party", p); }}
          onApply={applyBalance} />
      )}
      {modal?.type === "player" && (
        <div className="overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add player / ally</h3>
            <div className="frow"><label>Name</label><input type="text" value={pName} onChange={(e) => setPName(e.target.value)} autoFocus /></div>
            <div className="frow"><label>Initiative (opt.)</label><input type="number" value={pInit} onChange={(e) => setPInit(e.target.value)} placeholder="later is fine" /></div>
            <div className="frow"><label>AC (optional)</label><input type="number" value={pAc} onChange={(e) => setPAc(e.target.value)} /></div>
            <div className="frow"><label>HP (optional)</label><input type="number" value={pHp} onChange={(e) => setPHp(e.target.value)} /></div>
            <div className="frow"><label>Passive Perception</label><input type="number" value={pPp} onChange={(e) => setPPp(e.target.value)} placeholder="opt." /></div>
            <div className="trait" style={{ marginBottom: 8 }}>With HP filled in, the app tracks this character's damage and healing (concentration prompts them to roll their own save). PP shows on their row for quick reference.</div>
            <div className="frow" style={{ justifyContent: "flex-end" }}>
              <button className="btn" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn primary" disabled={!pName.trim()} onClick={() => { addPlayerNow(); setModal(null); }}>Add</button>
            </div>
          </div>
        </div>
      )}
      {modal?.type === "rename-prompt" && modalC && (
        <PromptModal title={`Rename ${modalC.name}`} fields={[{ key: "name", label: "Name", value: modalC.name }]} submitLabel="Rename"
          onSubmit={({ name }) => { if (name.trim()) mutate((d, L) => { const cc = d.combatants.find((x) => x.uid === modal.uid); L.push(`<b>${cc.name}</b> → <b>${name.trim()}</b>`); cc.name = name.trim(); }); setModal(null); }}
          onClose={() => setModal(null)} />
      )}
      {modal?.type === "init-prompt" && modalC && (
        <PromptModal title={`Initiative — ${modalC.name}`} fields={[{ key: "v", label: "Initiative", type: "number", value: modalC.init }]} submitLabel="Set"
          onSubmit={({ v }) => { mutate((d, L) => { const cc = d.combatants.find((x) => x.uid === modal.uid); cc.init = parseInt(v, 10) || 0; L.push(`<b>${cc.name}</b> initiative set to ${cc.init}`); }); setModal(null); }}
          onClose={() => setModal(null)} />
      )}
      {spellBook && (
        <SpellBook onClose={() => setSpellBook(false)}
          activeC={state.mode === "combat" ? state.combatants.find((x) => x.uid === state.activeUid && !x.dead && x.type !== "effect" && x.type !== "object") : null}
          onConc={(uid, spell) => { mutate((d, L) => { const cc = d.combatants.find((x) => x.uid === uid); if (!cc) return; cc.concentration = spell; L.push(`<b>${cc.name}</b> concentrating on <b>${spell}</b>`); }); setSpellBook(false); }} />
      )}
      {peek && (() => {
        const pc = state.combatants.find((x) => x.uid === peek);
        if (!pc) return null;
        const alive = order.filter((x) => !x.dead && x.type !== "effect" && x.type !== "object");
        const ai2 = alive.findIndex((x) => x.uid === state.activeUid);
        const pi = alive.findIndex((x) => x.uid === peek);
        const dist = state.mode === "combat" && ai2 >= 0 && pi >= 0 ? (pi - ai2 + alive.length) % alive.length : null;
        return (
          <div className="overlay" onClick={() => setPeek(null)}>
            <div className="modal peekmodal" onClick={(e) => e.stopPropagation()}>
              <div className="peekbanner">
                👁 Peeking — {pc.dead ? "dead" : dist == null ? "combat not running" : dist === 0 ? "acting NOW" : `acts in ${dist} turn${dist === 1 ? "" : "s"}`}
                <button className="btn small ghost" style={{ marginLeft: "auto" }} onClick={() => setPeek(null)}>Close</button>
              </div>
              {pc.type === "player" ? <PlayerCard c={pc} api={api} results={results} /> : <MonsterCard c={pc} api={api} results={results} peek={pc.uid !== state.activeUid || state.mode !== "combat"} turnKey={`${state.round}:${state.activeUid}`} />}
            </div>
          </div>
        );
      })()}
      {modal?.type === "target-pick" && (() => {
        const atkC = state.combatants.find((x) => x.uid === modal.uid);
        const a = atkC && atkC.actions[modal.ai];
        if (!atkC || !a) return null;
        return (
          <TargetPickModal attacker={atkC} action={{ ...a, i: modal.ai }}
            list={targetCands(state, atkC)} la={modal.la} opp={modal.opp}
            onResolve={api.resolveAttack} onClose={() => setModal(null)} />
        );
      })()}
      {modal?.type === "turn-warn" && modalC && (
        (modalC.conditions || []).some((cd) => cd.rpt) ? (
          <RepeatSaveModal c={modalC} done={modal.done || {}} api={api}
            warnConds={modal.conds}
            title={`⚠ ${modalC.name} starts their turn…`}
            continueLabel="End their turn ▶"
            onContinue={() => { setModal(null); next(); }}
            onClose={() => setModal(null)} />
        ) : (
          <div className="overlay" onClick={() => setModal(null)}>
            <div className="modal" onClick={() => setModal(null)} style={{ cursor: "pointer", borderColor: "var(--danger)" }}>
              <h3>⚠ {modalC.name} starts their turn…</h3>
              {modal.conds.map((cd) => (
                <div key={cd.name} className="gs-row" style={{ flexWrap: "wrap" }}>
                  <b>{cd.name}</b>{cd.spell && <span className="ad">from {cd.spell}</span>}
                  <span className="ad" style={{ flexBasis: "100%" }}>
                    {cd.name.startsWith("Command:")
                      ? `Must spend this turn obeying — ${cd.name.slice(9).trim()}. The effect ends when this turn does.`
                      : CONDITIONS[cd.name] || ""}
                  </span>
                </div>
              ))}
              <div className="ad" style={{ marginTop: 8 }}>tap anywhere to dismiss</div>
            </div>
          </div>
        )
      )}
      {modal?.type === "conc-info" && modalC && modalC.concentration && (() => {
        const spellKey = (modalC.concentration || "").toLowerCase();
        const linked = state.combatants.filter((t) => t.uid !== modalC.uid && (t.conditions || []).some((cd) => cd.src === modalC.uid));
        return (
          <div className="overlay" onClick={() => setModal(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3>◎ {modalC.name} — concentrating on {modalC.concentration}</h3>
              {SPELL_REF[spellKey] ? <SpellInfo k={spellKey} /> : <div className="ad" style={{ marginBottom: 6 }}>No compendium entry for this effect.</div>}
              {linked.length > 0 && (
                <>
                  <div className="lbl" style={{ margin: "6px 0 4px" }}>Linked effects (end if concentration breaks)</div>
                  {linked.map((t) => (
                    <div key={t.uid} className="gs-row">
                      <b>{t.name}</b>
                      <span className="ad">{(t.conditions || []).filter((cd) => cd.src === modalC.uid).map((cd) => cd.name).join(", ")}</span>
                    </div>
                  ))}
                </>
              )}
              <div className="ad" style={{ margin: "6px 0" }}>Reminder: taking damage forces a CON save (DC 10 or half the damage, whichever is higher) to maintain concentration — the app rolls this automatically when damage is applied.</div>
              <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center" }}>
                <button className="btn small danger" onClick={() => { api.breakConc(modalC.uid); setModal(null); }}>✕ Break concentration</button>
                <span className="spacer" />
                <button className="btn small" onClick={() => setModal(null)}>Cancel</button>
              </div>
            </div>
          </div>
        );
      })()}
      {modal?.type === "suggest-enc" && (
        <EncounterSuggestModal party={party} onClose={() => setModal(null)} onAdd={({ picks, biome, level, size, difficulty, balanced, addLair }) => {
          setModal(null);
          setParty((p) => ({ ...p, level, size, difficulty, set: true }));
          mutate((d, L, T) => {
            const added = [];
            picks.forEach((p) => {
              const sb = BESTIARY.find((b) => b.name === p.name); if (!sb) return;
              const m = makeMonster(sb, d);
              d.combatants.push(m);
              added.push({ m, band: p.band });
              L.push(`Added <b>${m.name}</b> — ${m.initText}`);
            });
            if (balanced && added.length) {
              const roles = {};
              added.forEach(({ m, band }) => { roles[m.uid] = band === "strong" || band === "solo" ? "strong" : band === "mid" ? "standard" : "weak"; });
              const res = computeBalance({ combatants: added.map((x) => x.m) }, { level, size, difficulty }, roles);
              (res.proposal || []).forEach((pr) => {
                const c = d.combatants.find((x) => x.uid === pr.uid);
                if (!c || !pr.patch) return;
                const patch = { ...pr.patch };
                if (patch.actions) patch.actions = patch.actions.map((a) => ({ ...a, ready: true }));
                if (patch.hp != null && patch.maxHp == null) patch.maxHp = patch.hp;
                Object.assign(c, patch);
                L.push(`⚖ <b>${pr.target}</b>${patch.name && patch.name !== pr.target ? ` → <b>${patch.name}</b>` : ""}: ${pr.summary}`);
              });
            }
            if (addLair) {
              const tier = level <= 4 ? "Low (1–4)" : level <= 10 ? "Mid (5–10)" : level <= 16 ? "High (11–16)" : "Epic (17+)";
              const raw = (LAIR_THEMES[biome] || [])[Math.floor(Math.random() * (LAIR_THEMES[biome] || []).length)];
              if (raw) {
                const s = scaleSug(raw, tier);
                const e = makeEffect({ name: s.n, init: 20, rounds: null, desc: s.desc });
                if (s.mech !== "note") e.fx = { mech: s.mech, ab: s.ab || "dex", dc: s.dc || null, dmg: s.dmg || "", dtype: s.dtype || "", half: s.half !== false, cond: s.cond || null, condR: s.condR ?? null };
                d.combatants.push(e);
                L.push(`Added lair action <b>${e.name}</b> (initiative 20, ${tier.split(" ")[0].toLowerCase()} tier).`);
              }
            }
            L.push(`🎲 <b>${biome}</b> encounter suggested for ${size} level-${level} player${size === 1 ? "" : "s"} (${difficulty}${balanced ? ", balanced" : ", as printed"}).`);
          });
        }} />
      )}
      {modal?.type === "buff-cast" && (
        <BuffTargetModal spec={modal} state={state} api={api} onClose={() => setModal(null)} />
      )}
      {modal?.type === "repeat-save" && modalC && (
        <RepeatSaveModal c={modalC} done={modal.done || {}} api={api}
          onContinue={() => { setModal(null); next(); }}
          onClose={() => setModal(null)} />
      )}
      {modal?.type === "group-save" && (
        <GroupSaveModal
          list={state.combatants.filter((c) => !c.dead && c.type !== "effect" && c.type !== "object")}
          preset={modal.preset} resolved={modal.resolved}
          onClose={() => setModal(null)} onResolve={resolveGroupSave} onPlayerResult={api.markPlayerSave} onCommandWord={api.setCommandWord} />
      )}
      {modal?.type === "use-confirm" && modalC && <UseConfirmModal c={modalC} kind={modal.kind} k={modal.key} api={api} onClose={() => setModal(null)} />}
      {modal?.type === "conc-prompt" && modalC && (
        <PromptModal title={`Concentration — ${modalC.name}`} fields={[{ key: "spell", label: "Spell (optional)", value: modalC.concentration === "CONC" ? "" : modalC.concentration || "", placeholder: "leave blank for generic CONC" }]} submitLabel="Set"
          onSubmit={({ spell }) => { mutate((d, L) => { const cc = d.combatants.find((x) => x.uid === modal.uid); const nm = spell.trim() || "CONC"; cc.concentration = nm; L.push(nm === "CONC" ? `<b>${cc.name}</b> is concentrating` : `<b>${cc.name}</b> concentrating on <b>${nm}</b>`); }); setModal(null); }}
          extraButtons={modalC.concentration ? [{ label: "Clear", onClick: () => { mutate((d, L) => { const cc = d.combatants.find((x) => x.uid === modal.uid); cc.concentration = null; L.push(`<b>${cc.name}</b> concentration cleared`); }); setModal(null); } }] : []}
          onClose={() => setModal(null)} />
      )}
      {modal?.type === "object-prompt" && (
        <PromptModal title="Add object" submitLabel="Add"
          fields={[
            { key: "name", label: "Name", placeholder: "Stone Pillar, Locked Door…" },
            { key: "ac", label: "AC (opt.)", type: "number" },
            { key: "hp", label: "HP (opt.)", type: "number" },
          ]}
          onSubmit={({ name, ac, hp }) => {
            if (!name.trim()) return;
            mutate((d, L) => {
              const o = makeObject({ name: name.trim(), ac, hp });
              d.combatants.push(o);
              L.push(`Added object <b>${o.name}</b>${o.ac != null ? ` (AC ${o.ac}` : ""}${o.hp != null ? `${o.ac != null ? ", " : " ("}${o.hp} HP` : ""}${o.ac != null || o.hp != null ? ")" : ""} — immune to poison & psychic, takes no turns.`);
            });
            setModal(null);
          }}
          onClose={() => setModal(null)} />
      )}
      {modal?.type === "effect-prompt" && (
        <EffectBuilderModal onClose={() => setModal(null)} onAdd={(f) => {
          setModal(null);
          mutate((d, L) => {
            const e = makeEffect({ name: f.name.trim(), init: parseInt(f.init, 10) || 20, rounds: f.rounds ? parseInt(f.rounds, 10) : null, desc: f.desc.trim() });
            if (f.mech !== "note") {
              e.fx = { mech: f.mech, ab: f.ab, dc: parseInt(f.dc, 10) || null, dmg: f.dmg.trim(), dtype: f.dtype, half: !!f.half, cond: f.cond || null, condR: f.cond && f.condR ? parseInt(f.condR, 10) : null };
            }
            d.combatants.push(e);
            L.push(`Added effect <b>${e.name}</b> (initiative ${e.init}${e.rounds != null ? `, ${e.rounds} rounds` : ""})${e.fx ? ` — ${e.fx.mech === "dmg" ? `${e.fx.dmg} ${e.fx.dtype || ""} auto damage` : `DC ${e.fx.dc} ${e.fx.ab.toUpperCase()} save`}` : ""}`);
          });
        }} />
      )}
      {modal?.type === "hazard" && modalC && (
        <HazardModal c={modalC} onClose={() => setModal(null)}
          onApplyFire={(amt) => {
            mutate((d, L, T) => { const c = d.combatants.find((x) => x.uid === modal.uid); if (c) applyDamage(c, Math.max(0, amt), "fire", L, T); });
          }}
          onRemoveCond={(name) => {
            const c = stateRef.current.combatants.find((x) => x.uid === modal.uid);
            const remaining = c ? c.conditions.filter((cd) => (cd.name === "Burning" || cd.name === "Suffocating") && cd.name !== name).length : 0;
            mutate((d, L) => {
              const cc = d.combatants.find((x) => x.uid === modal.uid); if (!cc) return;
              cc.conditions = cc.conditions.filter((x) => x.name !== name);
              L.push(`<b>${cc.name}</b>: ${name} removed`);
            });
            if (remaining === 0) setModal(null);
          }} />
      )}
      {modal?.type === "thp-edit" && modalC && (
        <PromptModal title={`Temp HP — ${modalC.name}`} submitLabel="Set"
          fields={[{ key: "v", label: "Temp HP (0 clears)", type: "number", initial: String(modalC.thp || 0) }]}
          onSubmit={({ v }) => {
            mutate((d, L) => {
              const c = d.combatants.find((x) => x.uid === modal.uid); if (!c) return;
              const nv = Math.max(0, parseInt(v || "0", 10) || 0);
              L.push(nv ? `<b>${c.name}</b> temp HP set to <b>${nv}</b>.` : `<b>${c.name}</b>'s temp HP cleared.`);
              c.thp = nv;
            });
            setModal(null);
          }}
          onClose={() => setModal(null)} />
      )}
      {modal?.type === "cond-info" && modalC && (() => {
        const cond = modalC.conditions.find((x) => x.name === modal.condName);
        if (!cond) { return null; }
        return (
          <div className="overlay" onClick={() => setModal(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3>{cond.name} — {modalC.name}</h3>
              {cond.rounds != null && <div className="statline"><b>{cond.rounds}</b> round{cond.rounds === 1 ? "" : "s"} remaining (ticks at the start of their turn)</div>}
              <div className="trait" style={{ fontSize: 13, marginBottom: 12 }}>
                {CONDITIONS[cond.name] || "Custom effect — as the DM decreed."}
              </div>
              <div className="frow" style={{ justifyContent: "flex-end" }}>
                <button className="btn" onClick={() => setModal(null)}>✕ Close</button>
                <button className="btn danger" onClick={() => { api.removeCondition(modal.uid, cond.name); setModal(null); }}>Remove condition</button>
              </div>
            </div>
          </div>
        );
      })()}
      {modal?.type === "shield-info" && modalC && modalC.acReaction && (
        <div className="overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>🛡 {modalC.acReaction.n} — {modalC.name}</h3>
            <div className="statline" style={{ fontSize: 14 }}>
              AC <b>{modalC.ac + coverBonus(modalC)}</b> → <b>{modalC.ac + coverBonus(modalC) + modalC.acReaction.acBonus}</b> until the start of their next turn
            </div>
            <div className="trait" style={{ fontSize: 13, marginBottom: 6 }}>{modalC.acReaction.d}</div>
            <div className="trait" style={{ color: "var(--faint)", marginBottom: 10 }}>Uses their reaction{modalC.reaction ? " (available)" : " — ⚠ already used this round!"}</div>
            <div className="frow" style={{ justifyContent: "flex-end" }}>
              <button className="btn" onClick={() => setModal(null)}>✕ Close</button>
              <button className="btn primary" onClick={() => { api.toggleShield(modal.uid); setModal(null); }}>Apply (+{modalC.acReaction.acBonus} AC)</button>
            </div>
          </div>
        </div>
      )}
      {modal?.type === "deathsaves" && modalC && (
        <DeathSavesModal c={modalC} onClose={() => setModal(null)}
          onRecord={(kind) => {
            mutate((d, L, T) => { const c = d.combatants.find((x) => x.uid === modal.uid); if (c) applyDeathSave(c, kind, L, T); });
            if (kind === "nat20") setModal(null);
          }} />
      )}
      {modal?.type === "log-text" && (
        <div className="overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Actions Log — copy below</h3>
            <textarea readOnly rows={12} style={{ width: "100%", fontFamily: "var(--mono)", fontSize: 11 }}
              value={state.log.map((l) => `[R${l.r}] ${l.t.replace(/<[^>]+>/g, "")}`).join("\n")}
              onFocus={(e) => e.target.select()} />
          </div>
        </div>
      )}
      {modal?.type === "confirm-clear" && (
        <ConfirmModal text="This removes every combatant, the log, and the round counter. Saved encounters are untouched." confirmLabel="Clear everything"
          onYes={() => doReset(false)} onClose={() => setModal(null)} />
      )}
      {modal?.type === "confirm-reset" && (
        <ConfirmModal text="Players and effects are removed; monsters stay with fresh HP, cleared conditions, and rerolled initiative. Back to setup." confirmLabel="Reset combat"
          onYes={() => doReset(true)} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
