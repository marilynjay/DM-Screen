import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";

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
.dm-app{min-height:100vh;background:var(--ink);color:var(--text);
  font:14px/1.45 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
  padding-bottom:80px}
.dm-app ::selection{background:var(--gold-soft)}
button{font:inherit;color:inherit;background:none;border:none;cursor:pointer}
input,select,textarea{font:inherit;font-size:16px;color:var(--text);background:var(--ink);
  border:1px solid var(--line2);border-radius:6px;padding:6px 8px;outline:none}
input:focus,select:focus,textarea:focus{border-color:var(--gold)}
input[type=number]{width:64px}

.hdr{display:flex;align-items:center;gap:12px;padding:10px 14px;
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
.srd-attrib{max-width:860px;margin:110px auto 36px;padding:20px 14px 0;font-size:10.5px;line-height:1.5;color:var(--faint);
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
  align-items:center;justify-content:center;padding:16px}
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
.toastwrap{position:fixed;top:56px;right:14px;z-index:90;display:flex;flex-direction:column;gap:8px}
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
  .hdr{gap:6px;padding:8px 8px}
}
@media (max-width:560px){
  .nm{min-width:64px;font-size:13px}
  .actrow .an{min-width:90px}
  .hdr{gap:8px;padding:8px 10px}
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
const BESTIARY = [{"name":"Archmage","cr":"12","cat":"people","ac":17,"hp":170,"hpF":"31d8+31","spd":"30 ft.","mods":{"str":0,"dex":2,"con":1,"int":5,"wis":2,"cha":3},"saves":{"int":9,"wis":6},"immune":["psychic"],"condImmune":["Charmed (with Mind Blank)"],"traits":[{"n":"Magic Resistance","d":"The archmage has Advantage on saving throws against spells and other magical effects."}],"multi":"The archmage makes four Arcane Burst attacks.","actions":[{"n":"Arcane Burst","kind":"atk","hit":9,"dmg":"4d10+5","dtype":"force","d":"reach 5 ft. or range 150 ft"},{"n":"Spellcasting","kind":"text","d":"The archmage casts one of the following spells, using Intelligence as the spellcasting ability (spell save DC 17): At Will: Detect Magic, Detect Thoughts, Disguise Self, Invisibility, Light, Mage Armor (included in AC), Mage Hand, Prestidigitation 2/Day Each: Fly, Lightning Bolt (level 7 version) 1/Day Each: Cone of Cold (level 9 version), Mind Blank (cast before combat), Scrying, Teleport"}],"bonus":[{"n":"Misty Step (3/Day)","d":"The mage casts Misty Step, using the same spellcasting ability as Spellcasting."}],"reactions":[{"n":"Protective Magic (3/Day)","d":"The archmage casts Counterspell or Shield in response to the spell's trigger, using the same spellcasting ability as Spellcasting."}]},{"name":"Assassin","cr":"8","cat":"people","ac":16,"hp":97,"hpF":"15d8+30","spd":"30 ft.","mods":{"str":0,"dex":4,"con":2,"int":3,"wis":0,"cha":0},"saves":{"dex":7,"int":6},"resist":["poison"],"traits":[{"n":"Evasion","d":"If the assassin is subjected to an effect that allows it to make a Dexterity saving throw to take only half damage, the assassin instead takes no damage if it succeeds on the save and only half damage if it fails. It can't use this trait if it has the Incapacitated condition."}],"multi":"The assassin makes three attacks, using Shortsword or Light Crossbow in any combination.","actions":[{"n":"Shortsword","kind":"atk","hit":7,"dmg":"1d6+4","dtype":"piercing","extra":"5d6","extraType":"poison","d":"reach 5 ft. and the target has the Poisoned condition until the start of the assassin's next turn."},{"n":"Light Crossbow","kind":"atk","hit":7,"dmg":"1d8+4","dtype":"piercing","extra":"6d6","extraType":"poison","d":"range 80/320 ft"}],"bonus":[{"n":"Cunning Action","d":"The assassin takes the Dash, Disengage, or Hide action."}]},{"name":"Bandit","cr":"1/8","cat":"people","ac":12,"hp":11,"hpF":"2d8+2","spd":"30 ft.","mods":{"str":0,"dex":1,"con":1,"int":0,"wis":0,"cha":0},"actions":[{"n":"Scimitar","kind":"atk","hit":3,"dmg":"1d6+1","dtype":"slashing","d":"reach 5 ft"},{"n":"Light Crossbow","kind":"atk","hit":3,"dmg":"1d8+1","dtype":"piercing","d":"range 80/320 ft"}]},{"name":"Bandit Captain","cr":"2","cat":"people","ac":15,"hp":52,"hpF":"8d8+16","spd":"30 ft.","mods":{"str":2,"dex":3,"con":2,"int":2,"wis":0,"cha":2},"saves":{"str":4,"dex":5,"wis":2},"multi":"The bandit makes two attacks, using Scimitar and Pistol in any combination.","actions":[{"n":"Scimitar","kind":"atk","hit":5,"dmg":"1d6+3","dtype":"slashing","d":"reach 5 ft"},{"n":"Pistol","kind":"atk","hit":5,"dmg":"1d10+3","dtype":"piercing","d":"range 30/90 ft"}],"reactions":[{"n":"Parry","d":"Trigger: The bandit is hit by a melee attack roll while holding a weapon. Response: The bandit adds 2 to its AC against that attack, possibly causing it to miss.","acBonus":2}]},{"name":"Berserker","cr":"2","cat":"people","ac":13,"hp":67,"hpF":"9d8+27","spd":"30 ft.","mods":{"str":3,"dex":1,"con":3,"int":-1,"wis":0,"cha":-1},"traits":[{"n":"Bloodied Frenzy","d":"While Bloodied, the berserker has Advantage on attack rolls and saving throws."}],"actions":[{"n":"Greataxe","kind":"atk","hit":5,"dmg":"1d12+3","dtype":"slashing","d":"reach 5 ft"}]},{"name":"Commoner","cr":"0","cat":"people","ac":10,"hp":4,"hpF":"1d8","spd":"30 ft.","mods":{"str":0,"dex":0,"con":0,"int":0,"wis":0,"cha":0},"traits":[{"n":"Training","d":"The commoner has proficiency in one skill of the GM's choice and has Advantage whenever it makes an ability check using that skill."}],"actions":[{"n":"Club","kind":"atk","hit":2,"dmg":"1d4","dtype":"bludgeoning","d":"reach 5 ft"}]},{"name":"Cultist","cr":"1/8","cat":"people","ac":12,"hp":9,"hpF":"2d8","spd":"30 ft.","mods":{"str":0,"dex":1,"con":0,"int":0,"wis":0,"cha":0},"saves":{"wis":2},"actions":[{"n":"Ritual Sickle","kind":"atk","hit":3,"dmg":"1d4+1","dtype":"slashing","d":"reach 5 ft. plus 1 Necrotic damage."}]},{"name":"Cultist Fanatic","cr":"2","cat":"people","ac":13,"hp":44,"hpF":"8d8+8","spd":"30 ft.","mods":{"str":0,"dex":2,"con":1,"int":0,"wis":2,"cha":1},"saves":{"wis":4},"actions":[{"n":"Pact Blade","kind":"atk","hit":4,"dmg":"1d8+2","dtype":"slashing","extra":"2d6","extraType":"necrotic","d":"reach 5 ft"},{"n":"Spellcasting","kind":"text","d":"The cultist casts one of the following spells, using Wisdom as the spellcasting ability (spell save DC 12, +4 to hit with spell attacks):"}],"bonus":[{"n":"Spiritual Weapon (2/Day)","d":"The cultist casts the Spiritual Weapon spell, using the same spellcasting ability as Spellcasting."}]},{"name":"Druid","cr":"2","cat":"people","ac":13,"hp":44,"hpF":"8d8+8","spd":"30 ft.","mods":{"str":0,"dex":1,"con":1,"int":1,"wis":3,"cha":0},"multi":"The druid makes two attacks, using Vine Staff or Verdant Wisp in any combination.","actions":[{"n":"Vine Staff","kind":"atk","hit":5,"dmg":"1d8+3","dtype":"bludgeoning","extra":"1d4","extraType":"poison","d":"reach 5 ft"},{"n":"Verdant Wisp","kind":"atk","hit":5,"dmg":"3d6","dtype":"radiant","d":"range 90 ft"},{"n":"Spellcasting","kind":"text","d":"The druid casts one of the following spells, using Wisdom as the spellcasting ability (spell save DC 13): 1/Day Each: Animal Messenger, Longstrider, Moonbeam"}]},{"name":"Gladiator","cr":"5","cat":"people","ac":16,"hp":112,"hpF":"15d8+45","spd":"30 ft.","mods":{"str":4,"dex":2,"con":3,"int":0,"wis":1,"cha":2},"saves":{"str":7,"dex":5,"con":6,"wis":4},"multi":"The gladiator makes three Spear attacks. It can replace one attack with a use of Shield Bash.","actions":[{"n":"Spear","kind":"atk","hit":7,"dmg":"2d6+4","dtype":"piercing","d":"reach 5 ft. or range 20/60 ft"},{"n":"Shield Bash","kind":"save","save":{"ability":"STR","dc":15},"d":"Strength Saving Throw: DC 15, one creature within 5 feet that the gladiator can see. Failure: 9 (2d4 + 4) Bludgeoning damage. If the target is a Medium or smaller creature, it has the Prone condition."}],"reactions":[{"n":"Parry","d":"Trigger: The gladiator is hit by a melee attack roll while holding a weapon. Response: The gladiator adds 3 to its AC against that attack, possibly causing it to miss.","acBonus":3}]},{"name":"Guard","cr":"1/8","cat":"people","ac":16,"hp":11,"hpF":"2d8+2","spd":"30 ft.","mods":{"str":1,"dex":1,"con":1,"int":0,"wis":0,"cha":0},"actions":[{"n":"Spear","kind":"atk","hit":3,"dmg":"1d6+1","dtype":"piercing","d":"reach 5 ft. or range 20/60 ft"}]},{"name":"Guard Captain","cr":"4","cat":"people","ac":18,"hp":75,"hpF":"10d8+30","spd":"30 ft.","mods":{"str":4,"dex":2,"con":3,"int":1,"wis":2,"cha":1},"multi":"The guard makes two attacks, using Javelin or Longsword in any combination.","actions":[{"n":"Javelin","kind":"atk","hit":6,"dmg":"3d6+4","dtype":"piercing","d":"reach 5 ft. or range 30/120 ft"},{"n":"Longsword","kind":"atk","hit":6,"dmg":"2d10+4","dtype":"slashing","d":"reach 5 ft"}]},{"name":"Knight","cr":"3","cat":"people","ac":18,"hp":52,"hpF":"8d8+16","spd":"30 ft.","mods":{"str":3,"dex":0,"con":2,"int":0,"wis":0,"cha":2},"saves":{"con":4,"wis":2},"condImmune":["Frightened"],"multi":"The knight makes two attacks, using Greatsword or Heavy Crossbow in any combination.","actions":[{"n":"Greatsword","kind":"atk","hit":5,"dmg":"2d6+3","dtype":"slashing","extra":"1d8","extraType":"radiant","d":"reach 5 ft"},{"n":"Heavy Crossbow","kind":"atk","hit":2,"dmg":"2d10","dtype":"piercing","extra":"1d8","extraType":"radiant","d":"range 100/400 ft"}],"reactions":[{"n":"Parry","d":"Trigger: The knight is hit by a melee attack roll while holding a weapon. Response: The knight adds 2 to its AC against that attack, possibly causing it to miss.","acBonus":2}]},{"name":"Mage","cr":"6","cat":"people","ac":15,"hp":81,"hpF":"18d8","spd":"30 ft.","mods":{"str":-1,"dex":2,"con":0,"int":3,"wis":1,"cha":0},"saves":{"int":6,"wis":4},"multi":"The mage makes three Arcane Burst attacks.","actions":[{"n":"Arcane Burst","kind":"atk","hit":6,"dmg":"3d8+3","dtype":"force","d":"reach 5 ft. or range 120 ft"},{"n":"Spellcasting","kind":"text","d":"The mage casts one of the following spells, using Intelligence as the spellcasting ability (spell save DC 14): At Will: Detect Magic, Light, Mage Armor (included in AC), Mage Hand, Prestidigitation 2/Day Each: Fireball (level 4 version), Invisibility"}],"bonus":[{"n":"Misty Step (3/Day)","d":"The mage casts Misty Step, using the same spellcasting ability as Spellcasting."}],"reactions":[{"n":"Protective Magic (3/Day)","d":"The mage casts Counterspell or Shield in response to the spell's trigger, using the same spellcasting ability as Spellcasting."}]},{"name":"Noble","cr":"1/8","cat":"people","ac":15,"hp":9,"hpF":"2d8","spd":"30 ft.","mods":{"str":0,"dex":1,"con":0,"int":1,"wis":2,"cha":3},"actions":[{"n":"Rapier","kind":"atk","hit":3,"dmg":"1d8+1","dtype":"piercing","d":"reach 5 ft"}],"reactions":[{"n":"Parry","d":"Trigger: The noble is hit by a melee attack roll while holding a weapon. Response: The noble adds 2 to its AC against that attack, possibly causing it to miss.","acBonus":2}]},{"name":"Pirate","cr":"1","cat":"people","ac":14,"hp":33,"hpF":"6d8+6","spd":"30 ft.","mods":{"str":0,"dex":3,"con":1,"int":-1,"wis":1,"cha":2},"saves":{"dex":5,"cha":4},"multi":"The pirate makes two Dagger attacks. It can replace one attack with a use of Enthralling Panache.","actions":[{"n":"Dagger","kind":"atk","hit":5,"dmg":"1d4+3","dtype":"piercing","d":"reach 5 ft. or range 20/60 ft. 314 System Reference Document 5.2.1"},{"n":"Enthralling Panache","kind":"save","save":{"ability":"WIS","dc":12},"d":"Wisdom Saving Throw: DC 12, one creature the pirate can see within 30 feet. Failure: The target has the Charmed condition until the start of the pirate's next turn."}]},{"name":"Pirate Captain","cr":"6","cat":"people","ac":17,"hp":84,"hpF":"13d8+26","spd":"30 ft.","mods":{"str":0,"dex":4,"con":2,"int":0,"wis":2,"cha":3},"saves":{"str":3,"dex":7,"wis":5,"cha":6},"multi":"The pirate makes three attacks, using Rapier or Pistol in any combination.","actions":[{"n":"Rapier","kind":"atk","hit":7,"dmg":"2d8+4","dtype":"piercing","d":"reach 5 ft. and the pirate has Advantage on the next attack roll it makes before the end of this turn."},{"n":"Pistol","kind":"atk","hit":7,"dmg":"2d10+4","dtype":"piercing","d":"range 30/90 ft"}],"bonus":[{"n":"Captain's Charm","d":"Wisdom Saving Throw: DC 14, one creature the pirate can see within 30 feet. Failure: The target has the Charmed condition until the start of the pirate's next turn."}],"reactions":[{"n":"Riposte","d":"Trigger: The pirate is hit by a melee attack roll while holding a weapon. Response: The pirate adds 3 to its AC against that attack, possibly causing it to miss. On a miss, the pirate makes one Rapier attack against the triggering creature if within range.","acBonus":3}]},{"name":"Priest","cr":"2","cat":"people","ac":13,"hp":38,"hpF":"7d8+7","spd":"30 ft.","mods":{"str":3,"dex":0,"con":1,"int":1,"wis":3,"cha":1},"multi":"The priest makes two attacks, using Mace or Radiant Flame in any combination.","actions":[{"n":"Mace","kind":"atk","hit":5,"dmg":"1d6+3","dtype":"bludgeoning","extra":"2d4","extraType":"radiant","d":"reach 5 ft"},{"n":"Radiant Flame","kind":"atk","hit":5,"dmg":"2d10","dtype":"radiant","d":"range 60 ft. 316 System Reference Document 5.2.1"},{"n":"Spellcasting","kind":"text","d":"The priest casts one of the following spells, using Wisdom as the spellcasting ability (spell save DC 13):"}],"bonus":[{"n":"Divine Aid (3/Day)","d":"The priest casts Bless, Dispel Magic, Healing Word, or Lesser Restoration, using the same spellcasting ability as Spellcasting."}]},{"name":"Priest Acolyte","cr":"1/4","cat":"people","ac":13,"hp":11,"hpF":"2d8+2","spd":"30 ft.","mods":{"str":2,"dex":0,"con":1,"int":0,"wis":2,"cha":0},"actions":[{"n":"Mace","kind":"atk","hit":4,"dmg":"1d6+2","dtype":"bludgeoning","extra":"1d4","extraType":"radiant","d":"reach 5 ft"},{"n":"Radiant Flame","kind":"atk","hit":4,"dmg":"2d6","dtype":"radiant","d":"range 60 ft"},{"n":"Spellcasting","kind":"text","d":"The priest casts one of the following spells, using Wisdom as the spellcasting ability:"}],"bonus":[{"n":"Divine Aid (1/Day)","d":"The priest casts Bless, Healing Word, or Sanctuary, using the same spellcasting ability as Spellcasting."}]},{"name":"Scout","cr":"1/2","cat":"people","ac":13,"hp":16,"hpF":"3d8+3","spd":"30 ft.","mods":{"str":0,"dex":2,"con":1,"int":0,"wis":1,"cha":0},"multi":"The scout makes two attacks, using Shortsword and Longbow in any combination.","actions":[{"n":"Shortsword","kind":"atk","hit":4,"dmg":"1d6+2","dtype":"piercing","d":"reach 5 ft"},{"n":"Longbow","kind":"atk","hit":4,"dmg":"1d8+2","dtype":"piercing","d":"range 150/600 ft"}]},{"name":"Spy","cr":"1","cat":"people","ac":12,"hp":27,"hpF":"6d8","spd":"30 ft., Climb 30 ft.","mods":{"str":0,"dex":2,"con":0,"int":1,"wis":2,"cha":3},"actions":[{"n":"Shortsword","kind":"atk","hit":4,"dmg":"1d6+2","dtype":"piercing","extra":"2d6","extraType":"poison","d":"reach 5 ft"},{"n":"Hand Crossbow","kind":"atk","hit":4,"dmg":"1d6+2","dtype":"piercing","extra":"2d6","extraType":"poison","d":"range 30/120 ft"}],"bonus":[{"n":"Cunning Action","d":"The spy takes the Dash, Disengage, or Hide action."}]},{"name":"Tough","cr":"1/2","cat":"people","ac":12,"hp":32,"hpF":"5d8+10","spd":"30 ft.","mods":{"str":2,"dex":1,"con":2,"int":0,"wis":0,"cha":0},"traits":[{"n":"Pack Tactics","d":"The tough has Advantage on an attack roll against a creature if at least one of the tough's allies is within 5 feet of the creature and the ally doesn't have the Incapacitated condition."}],"actions":[{"n":"Mace","kind":"atk","hit":4,"dmg":"1d6+2","dtype":"bludgeoning","d":"reach 5 ft"},{"n":"Heavy Crossbow","kind":"atk","hit":3,"dmg":"1d10+1","dtype":"piercing","d":"range 100/400 ft"}]},{"name":"Tough Boss","cr":"4","cat":"people","ac":16,"hp":82,"hpF":"11d8+33","spd":"30 ft.","mods":{"str":3,"dex":2,"con":3,"int":0,"wis":0,"cha":0},"saves":{"str":5,"con":5,"cha":2},"traits":[{"n":"Pack Tactics","d":"The tough has Advantage on an attack roll against a creature if at least one of the tough's allies is within 5 feet of the creature and the ally doesn't have the Incapacitated condition."}],"multi":"The tough makes two attacks, using Warhammer or Heavy Crossbow in any combination.","actions":[{"n":"Warhammer","kind":"atk","hit":5,"dmg":"2d8+3","dtype":"bludgeoning","d":"reach 5 ft. If the target is a Large or smaller creature, the tough pushes the target up to 10 feet straight away from itself."},{"n":"Heavy Crossbow","kind":"atk","hit":4,"dmg":"2d10+2","dtype":"piercing","d":"range 100/400 ft"}]},{"name":"Vampire Familiar","cr":"3","cat":"people","ac":15,"hp":65,"hpF":"10d8+20","spd":"30 ft., Climb 30 ft.","mods":{"str":3,"dex":3,"con":2,"int":0,"wis":0,"cha":2},"saves":{"dex":5,"wis":2},"resist":["necrotic"],"traits":[{"n":"Vampiric Connection","d":"While the familiar and its vampire master are on the same plane of existence, the vampire can communicate with the familiar telepathically, and the vampire can perceive through the familiar's senses."}],"multi":"The familiar makes two Umbral Dagger attacks.","actions":[{"n":"Umbral Dagger","kind":"atk","hit":5,"dmg":"1d4+3","dtype":"piercing","extra":"3d4","extraType":"necrotic","d":"reach 5 ft. or range 20/60 ft. If the target is reduced to 0 Hit Points by this attack, the target becomes Stable but has the Poisoned condition for 1 hour. While it has the Poisoned condition, the target has the Paralyzed condition."}],"bonus":[{"n":"Deathless Agility","d":"The familiar takes the Dash or Disengage action."}]},{"name":"Warrior Infantry","cr":"1/8","cat":"people","ac":13,"hp":9,"hpF":"2d8","spd":"30 ft.","mods":{"str":1,"dex":0,"con":0,"int":-1,"wis":0,"cha":-1},"traits":[{"n":"Pack Tactics","d":"The warrior has Advantage on an attack roll against a creature if at least one of the warrior's allies is within 5 feet of the creature and the ally doesn't have the Incapacitated condition."}],"actions":[{"n":"Spear","kind":"atk","hit":3,"dmg":"1d6+1","dtype":"piercing","d":"reach 5 ft. or range 20/60 ft"}]},{"name":"Warrior Veteran","cr":"3","cat":"people","ac":17,"hp":65,"hpF":"10d8+20","spd":"30 ft.","mods":{"str":3,"dex":1,"con":2,"int":0,"wis":0,"cha":0},"multi":"The warrior makes two Greatsword or Heavy Crossbow attacks.","actions":[{"n":"Greatsword","kind":"atk","hit":5,"dmg":"2d6+3","dtype":"slashing","d":"reach 5 ft"},{"n":"Heavy Crossbow","kind":"atk","hit":3,"dmg":"2d10+1","dtype":"piercing","d":"range 100/400 ft"}],"reactions":[{"n":"Parry","d":"Trigger: The warrior is hit by a melee attack roll while holding a weapon. Response: The warrior adds 2 to its AC against that attack, possibly causing it to miss.","acBonus":2}]},{"name":"Bugbear Stalker","cr":"3","cat":"kin","ac":15,"hp":65,"hpF":"10d8+20","spd":"30 ft.","mods":{"str":3,"dex":2,"con":2,"int":0,"wis":1,"cha":0},"saves":{"con":4,"wis":3},"traits":[{"n":"Abduct","d":"The bugbear needn't spend extra movement to move a creature it is grappling."}],"multi":"The bugbear makes two Javelin or Morningstar attacks.","actions":[{"n":"Javelin","kind":"atk","hit":5,"dmg":"3d6+3","dtype":"piercing","d":"reach 10 ft. or range 30/120 ft"},{"n":"Morningstar","kind":"atk","hit":5,"dmg":"2d8+3","dtype":"piercing","d":"(with Advantage if the target is Grappled by the bugbear) reach 10 ft"}],"bonus":[{"n":"Quick Grapple","d":"Dexterity Saving Throw: DC 13, one Medium or smaller creature the bugbear can see within 10 feet. Failure: The target has the Grappled condition (escape DC 13)."}]},{"name":"Bugbear Warrior","cr":"1","cat":"kin","ac":14,"hp":33,"hpF":"6d8+6","spd":"30 ft.","mods":{"str":2,"dex":2,"con":1,"int":-1,"wis":0,"cha":-1},"traits":[{"n":"Abduct","d":"The bugbear needn't spend extra movement to move a creature it is grappling."}],"actions":[{"n":"Grab","kind":"atk","hit":4,"dmg":"2d6+2","dtype":"bludgeoning","d":"reach 10 ft. If the target is a Medium or smaller creature, it has the Grappled condition (escape DC 12)."},{"n":"Light Hammer","kind":"atk","hit":4,"dmg":"3d4+2","dtype":"bludgeoning","d":"(with Advantage if the target is Grappled by the bugbear) reach 10 ft. or range 20/60 ft"}]},{"name":"Gnoll Warrior","cr":"1/2","cat":"kin","ac":15,"hp":27,"hpF":"6d8","spd":"30 ft.","mods":{"str":2,"dex":1,"con":0,"int":-2,"wis":0,"cha":-2},"actions":[{"n":"Rend","kind":"atk","hit":4,"dmg":"1d6+2","dtype":"piercing","d":"reach 5 ft"},{"n":"Bone Bow","kind":"atk","hit":3,"dmg":"1d10+1","dtype":"piercing","d":"range 150/600 ft"}],"bonus":[{"n":"Rampage (1/Day)","d":"Immediately after dealing damage to a creature that is already Bloodied, the gnoll moves up to half its Speed, and it makes one Rend attack."}]},{"name":"Goblin Boss","cr":"1","cat":"kin","ac":17,"hp":21,"hpF":"6d6","spd":"30 ft.","mods":{"str":0,"dex":2,"con":0,"int":0,"wis":-1,"cha":0},"multi":"The goblin makes two attacks, using Scimitar or Shortbow in any combination.","actions":[{"n":"Scimitar","kind":"atk","hit":4,"dmg":"1d6+2","dtype":"slashing","extra":"1d4","extraType":"slashing","d":"reach 5 ft. if the attack roll had Advantage."},{"n":"Shortbow","kind":"atk","hit":4,"dmg":"1d6+2","dtype":"piercing","extra":"1d4","extraType":"piercing","d":"range 80/320 ft. if the attack roll had Advantage."}],"bonus":[{"n":"Nimble Escape","d":"The goblin takes the Disengage or Hide action."}],"reactions":[{"n":"Redirect Attack","d":"Trigger: A creature the goblin can see makes an attack roll against it. Response: The goblin chooses a Small or Medium ally within 5 feet of itself. The goblin and that ally swap places, and the ally becomes the target of the attack instead."}]},{"name":"Goblin Minion","cr":"1/8","cat":"kin","ac":12,"hp":7,"hpF":"2d6","spd":"30 ft.","mods":{"str":-1,"dex":2,"con":0,"int":0,"wis":-1,"cha":-1},"actions":[{"n":"Dagger","kind":"atk","hit":4,"dmg":"1d4+2","dtype":"piercing","d":"reach 5 ft. or range 20/60 ft"}],"bonus":[{"n":"Nimble Escape","d":"The goblin takes the Disengage or Hide action."}]},{"name":"Goblin Warrior","cr":"1/4","cat":"kin","ac":15,"hp":10,"hpF":"3d6","spd":"30 ft.","mods":{"str":-1,"dex":2,"con":0,"int":0,"wis":-1,"cha":-1},"actions":[{"n":"Scimitar","kind":"atk","hit":4,"dmg":"1d6+2","dtype":"slashing","extra":"1d4","extraType":"slashing","d":"reach 5 ft. if the attack roll had Advantage."},{"n":"Shortbow","kind":"atk","hit":4,"dmg":"1d6+2","dtype":"piercing","extra":"1d4","extraType":"piercing","d":"range 80/320 ft. if the attack roll had Advantage."}],"bonus":[{"n":"Nimble Escape","d":"The goblin takes the Disengage or Hide action. 290 System Reference Document 5.2.1"}]},{"name":"Hobgoblin Captain","cr":"3","cat":"kin","ac":17,"hp":58,"hpF":"9d8+18","spd":"30 ft.","mods":{"str":2,"dex":2,"con":2,"int":1,"wis":0,"cha":1},"traits":[{"n":"Aura of Authority","d":"While in a 10-foot Emanation originating from the hobgoblin, the hobgoblin and its allies have Advantage on attack rolls and saving throws, provided the hobgoblin doesn't have the Incapacitated condition."}],"multi":"The hobgoblin makes two attacks, using Greatsword or Longbow in any combination.","actions":[{"n":"Greatsword","kind":"atk","hit":4,"dmg":"2d6+2","dtype":"slashing","extra":"1d6","extraType":"poison","d":"reach 5 ft"},{"n":"Longbow","kind":"atk","hit":4,"dmg":"1d8+2","dtype":"piercing","extra":"2d4","extraType":"poison","d":"range 150/600 ft"}]},{"name":"Hobgoblin Warrior","cr":"1/2","cat":"kin","ac":18,"hp":11,"hpF":"2d8+2","spd":"30 ft.","mods":{"str":1,"dex":1,"con":1,"int":0,"wis":0,"cha":-1},"traits":[{"n":"Pack Tactics","d":"The hobgoblin has Advantage on an attack roll against a creature if at least one of the hobgoblin's allies is within 5 feet of the creature and the ally doesn't have the Incapacitated condition."}],"actions":[{"n":"Longsword","kind":"atk","hit":3,"dmg":"2d10+1","dtype":"slashing","d":"reach 5 ft"},{"n":"Longbow","kind":"atk","hit":3,"dmg":"1d8+1","dtype":"piercing","extra":"3d4","extraType":"poison","d":"range 150/600 ft"}]},{"name":"Kobold Warrior","cr":"1/8","cat":"kin","ac":14,"hp":7,"hpF":"3d6-3","spd":"30 ft.","mods":{"str":-2,"dex":2,"con":-1,"int":-1,"wis":-2,"cha":-1},"traits":[{"n":"Pack Tactics","d":"The kobold has Advantage on an attack roll against a creature if at least one of the kobold's allies is within 5 feet of the creature and the ally doesn't have the Incapacitated condition."},{"n":"Sunlight Sensitivity","d":"While in sunlight, the kobold has Disadvantage on ability checks and attack rolls."}],"actions":[{"n":"Dagger","kind":"atk","hit":4,"dmg":"1d4+2","dtype":"piercing","d":"reach 5 ft. or range 20/60 ft"}]},{"name":"Allosaurus","cr":"2","cat":"beast","ac":13,"hp":51,"hpF":"6d10+18","spd":"60 ft.","mods":{"str":4,"dex":1,"con":3,"int":-4,"wis":1,"cha":-3},"actions":[{"n":"Bite","kind":"atk","hit":6,"dmg":"2d10+4","dtype":"piercing","d":"reach 5 ft"},{"n":"Claws","kind":"atk","hit":6,"dmg":"1d8+4","dtype":"slashing","d":"reach 5 ft. If the target is a Large or smaller creature and the allosaurus moved 30+ feet straight toward it immediately before the hit, the target has the 344 System Reference Document 5.2.1 Prone condition, and the allosaurus can make one Bite attack against it."}]},{"name":"Ankylosaurus","cr":"3","cat":"beast","ac":15,"hp":68,"hpF":"8d12+16","spd":"30 ft.","mods":{"str":4,"dex":0,"con":2,"int":-4,"wis":1,"cha":-3},"saves":{"str":6},"multi":"The ankylosaurus makes two Tail attacks.","actions":[{"n":"Tail","kind":"atk","hit":6,"dmg":"1d10+4","dtype":"bludgeoning","d":"reach 10 ft. If the target is a Huge or smaller creature, it has the Prone condition."}]},{"name":"Ape","cr":"1/2","cat":"beast","ac":12,"hp":19,"hpF":"3d8+6","spd":"30 ft., Climb 30 ft.","mods":{"str":3,"dex":2,"con":2,"int":-2,"wis":1,"cha":-2},"multi":"The ape makes two Fist attacks.","actions":[{"n":"Fist","kind":"atk","hit":5,"dmg":"1d4+3","dtype":"bludgeoning","d":"reach 5 ft"},{"n":"Rock","kind":"atk","hit":5,"dmg":"2d6+3","dtype":"bludgeoning","rech":6,"d":"range 25/50 ft"}]},{"name":"Archelon","cr":"4","cat":"beast","ac":17,"hp":90,"hpF":"12d12+12","spd":"20 ft., Swim 80 ft.","mods":{"str":4,"dex":3,"con":1,"int":-3,"wis":2,"cha":-2},"traits":[{"n":"Amphibious","d":"The archelon can breathe air and water."}],"multi":"The archelon makes two Bite attacks.","actions":[{"n":"Bite","kind":"atk","hit":6,"dmg":"3d6+4","dtype":"piercing","d":"reach 5 ft"}]},{"name":"Baboon","cr":"0","cat":"beast","ac":12,"hp":3,"hpF":"1d6","spd":"30 ft., Climb 30 ft.","mods":{"str":-1,"dex":2,"con":0,"int":-3,"wis":1,"cha":-2},"traits":[{"n":"Pack Tactics","d":"The baboon has Advantage on an attack roll against a creature if at least one of the baboon's allies is within 5 feet of the creature and the ally doesn't have the Incapacitated condition."}],"actions":[{"n":"Bite","kind":"atk","hit":1,"dmg":"1d4-1","dtype":"piercing","d":"reach 5 ft"}]},{"name":"Badger","cr":"0","cat":"beast","ac":11,"hp":5,"hpF":"1d4+3","spd":"20 ft., Burrow 5 ft.","mods":{"str":0,"dex":0,"con":3,"int":-4,"wis":1,"cha":-3},"resist":["poison"],"actions":[{"n":"Bite","kind":"atk","hit":2,"dmg":"1","dtype":"piercing","d":"reach 5 ft."}]},{"name":"Bat","cr":"0","cat":"beast","ac":12,"hp":1,"hpF":"1d4-1","spd":"5 ft., Fly 30 ft.","mods":{"str":-4,"dex":2,"con":-1,"int":-4,"wis":1,"cha":-3},"actions":[{"n":"Bite","kind":"atk","hit":4,"dmg":"1","dtype":"piercing","d":"reach 5 ft."}]},{"name":"Black Bear","cr":"1/2","cat":"beast","ac":11,"hp":19,"hpF":"3d8+6","spd":"30 ft., Climb 30 ft., Swim 30 ft.","mods":{"str":2,"dex":1,"con":2,"int":-4,"wis":1,"cha":-2},"multi":"The bear makes two Rend attacks.","actions":[{"n":"Rend","kind":"atk","hit":4,"dmg":"1d6+2","dtype":"slashing","d":"reach 5 ft"}]},{"name":"Blood Hawk","cr":"1/8","cat":"beast","ac":12,"hp":7,"hpF":"2d6","spd":"10 ft., Fly 60 ft.","mods":{"str":-2,"dex":2,"con":0,"int":-4,"wis":2,"cha":-3},"traits":[{"n":"Pack Tactics","d":"The hawk has Advantage on an attack roll against a creature if at least one of the hawk's allies is within 5 feet of the creature and the ally doesn't have the Incapacitated condition."}],"actions":[{"n":"Beak","kind":"atk","hit":4,"dmg":"1d4+2","dtype":"piercing","d":"reach 5 ft. or 6 (1d8 + 2) Piercing damage if the target is Bloodied."}]},{"name":"Boar","cr":"1/4","cat":"beast","ac":11,"hp":13,"hpF":"2d8+4","spd":"40 ft.","mods":{"str":1,"dex":0,"con":2,"int":-4,"wis":-1,"cha":-3},"traits":[{"n":"Bloodied Fury","d":"While Bloodied, the boar has Advantage on attack rolls."}],"actions":[{"n":"Gore","kind":"atk","hit":3,"dmg":"1d6+1","dtype":"piercing","d":"reach 5 ft. If the target is a Medium or smaller creature and the boar moved 20+ feet straight toward it immediately before the hit, the target takes an extra 3 (1d6) Piercing damage and has the Prone condition."}]},{"name":"Brown Bear","cr":"1","cat":"beast","ac":11,"hp":22,"hpF":"3d10+6","spd":"40 ft., Climb 30 ft.","mods":{"str":3,"dex":1,"con":2,"int":-4,"wis":1,"cha":-2},"multi":"The bear makes one Bite attack and one Claw attack.","actions":[{"n":"Bite","kind":"atk","hit":5,"dmg":"1d8+3","dtype":"piercing","d":"reach 5 ft. 346 System Reference Document 5.2.1"},{"n":"Claw","kind":"atk","hit":5,"dmg":"1d4+3","dtype":"slashing","d":"reach 5 ft. If the target is a Large or smaller creature, it has the Prone condition."}]},{"name":"Camel","cr":"1/8","cat":"beast","ac":10,"hp":17,"hpF":"2d10+6","spd":"50 ft.","mods":{"str":2,"dex":-1,"con":3,"int":-4,"wis":0,"cha":-3},"saves":{"con":5},"actions":[{"n":"Bite","kind":"atk","hit":4,"dmg":"1d4+2","dtype":"bludgeoning","d":"reach 5 ft"}]},{"name":"Cat","cr":"0","cat":"beast","ac":12,"hp":2,"hpF":"1d4","spd":"40 ft., Climb 40 ft.","mods":{"str":-4,"dex":2,"con":0,"int":-4,"wis":1,"cha":-2},"saves":{"dex":4},"traits":[{"n":"Jumper","d":"The cat's jump distance is determined using its Dexterity rather than its Strength."}],"actions":[{"n":"Scratch","kind":"atk","hit":4,"dmg":"1","dtype":"slashing","d":"reach 5 ft."}]},{"name":"Constrictor Snake","cr":"1/4","cat":"beast","ac":13,"hp":13,"hpF":"2d10+2","spd":"30 ft., Swim 30 ft.","mods":{"str":2,"dex":2,"con":1,"int":-5,"wis":0,"cha":-4},"actions":[{"n":"Bite","kind":"atk","hit":4,"dmg":"1d8+2","dtype":"piercing","d":"reach 5 ft"},{"n":"Constrict","kind":"save","save":{"ability":"STR","dc":12},"d":"Strength Saving Throw: DC 12, one Medium or smaller creature the snake can see within 5 feet. Failure: 7 (3d4) Bludgeoning damage, and the target has the Grappled condition (escape DC 12)."}]},{"name":"Crab","cr":"0","cat":"beast","ac":11,"hp":3,"hpF":"1d4+1","spd":"20 ft., Swim 20 ft.","mods":{"str":-2,"dex":0,"con":1,"int":-5,"wis":-1,"cha":-4},"traits":[{"n":"Amphibious","d":"The crab can breathe air and water."}],"actions":[{"n":"Claw","kind":"atk","hit":2,"dmg":"1","dtype":"bludgeoning","d":"reach 5 ft."}]},{"name":"Crocodile","cr":"1/2","cat":"beast","ac":12,"hp":13,"hpF":"2d10+2","spd":"20 ft., Swim 30 ft.","mods":{"str":2,"dex":0,"con":1,"int":-4,"wis":0,"cha":-3},"saves":{"con":3},"traits":[{"n":"Hold Breath","d":"The crocodile can hold its breath for 1 hour."}],"actions":[{"n":"Bite","kind":"atk","hit":4,"dmg":"1d8+2","dtype":"piercing","d":"reach 5 ft. If the target is a Medium or smaller creature, it has the Grappled condition (escape DC 12). While Grappled, the target has the Restrained condition. 347 System Reference Document 5.2.1"}]},{"name":"Deer","cr":"0","cat":"beast","ac":13,"hp":4,"hpF":"1d8","spd":"50 ft.","mods":{"str":0,"dex":3,"con":0,"int":-4,"wis":2,"cha":-3},"traits":[{"n":"Agile","d":"The deer doesn't provoke an Opportunity Attack when it moves out of an enemy's reach."}],"actions":[{"n":"Ram","kind":"atk","hit":2,"dmg":"1d4","dtype":"bludgeoning","d":"reach 5 ft"}]},{"name":"Dire Wolf","cr":"1","cat":"beast","ac":14,"hp":22,"hpF":"3d10+6","spd":"50 ft.","mods":{"str":3,"dex":2,"con":2,"int":-4,"wis":1,"cha":-2},"traits":[{"n":"Pack Tactics","d":"The wolf has Advantage on an attack roll against a creature if at least one of the wolf's allies is within 5 feet of the creature and the ally doesn't have the Incapacitated condition."}],"actions":[{"n":"Bite","kind":"atk","hit":5,"dmg":"1d10+3","dtype":"piercing","d":"reach 5 ft. If the target is a Large or smaller creature, it has the Prone condition."}]},{"name":"Draft Horse","cr":"1/4","cat":"beast","ac":10,"hp":15,"hpF":"2d10+4","spd":"40 ft.","mods":{"str":4,"dex":0,"con":2,"int":-4,"wis":0,"cha":-2},"actions":[{"n":"Hooves","kind":"atk","hit":6,"dmg":"1d4+4","dtype":"bludgeoning","d":"reach 5 ft"}]},{"name":"Eagle","cr":"0","cat":"beast","ac":12,"hp":4,"hpF":"1d6+1","spd":"10 ft., Fly 60 ft.","mods":{"str":-2,"dex":2,"con":1,"int":-4,"wis":2,"cha":-2},"actions":[{"n":"Talons","kind":"atk","hit":4,"dmg":"1d4+2","dtype":"slashing","d":"reach 5 feet"}]},{"name":"Elephant","cr":"4","cat":"beast","ac":12,"hp":76,"hpF":"8d12+24","spd":"40 ft.","mods":{"str":6,"dex":-1,"con":3,"int":-4,"wis":0,"cha":-2},"multi":"The elephant makes two Gore attacks.","actions":[{"n":"Gore","kind":"atk","hit":8,"dmg":"2d8+6","dtype":"piercing","d":"reach 5 ft. If the target is a Huge or smaller creature and the elephant moved 20+ feet straight toward it immediately before the hit, the target has the Prone condition."}],"bonus":[{"n":"Trample","d":"Dexterity Saving Throw: DC 16, one creature within 5 feet that has the Prone condition. Failure: 17 (2d10 + 6) Bludgeoning damage. Success: Half damage. 348 System Reference Document 5.2.1"}]},{"name":"Elk","cr":"1/4","cat":"beast","ac":10,"hp":11,"hpF":"2d10","spd":"50 ft.","mods":{"str":3,"dex":0,"con":0,"int":-4,"wis":0,"cha":-2},"actions":[{"n":"Ram","kind":"atk","hit":5,"dmg":"1d6+3","dtype":"bludgeoning","d":"reach 5 ft. If the target is a Large or smaller creature and the elk moved 20+ feet straight toward it immediately before the hit, the target takes an extra 3 (1d6) Bludgeoning damage and has the Prone condition."}]},{"name":"Frog","cr":"0","cat":"beast","ac":11,"hp":1,"hpF":"1d4-1","spd":"20 ft., Swim 20 ft.","mods":{"str":-5,"dex":1,"con":-1,"int":-5,"wis":-1,"cha":-4},"traits":[{"n":"Amphibious","d":"The frog can breathe air and water."},{"n":"Standing Leap","d":"The frog's Long Jump is up to 10 feet and its High Jump is up to 5 feet with or without a running start."}],"actions":[{"n":"Bite","kind":"atk","hit":3,"dmg":"1","dtype":"piercing","d":"reach 5 ft."}]},{"name":"Giant Ape","cr":"7","cat":"beast","ac":12,"hp":168,"hpF":"16d12+64","spd":"40 ft., Climb 40 ft.","mods":{"str":6,"dex":2,"con":4,"int":-3,"wis":1,"cha":-2},"multi":"The ape makes two Fist attacks.","actions":[{"n":"Fist","kind":"atk","hit":9,"dmg":"3d10+6","dtype":"bludgeoning","d":"reach 10 ft"},{"n":"Boulder Toss","kind":"save","save":{"ability":"DEX","dc":17},"rech":6,"d":"The ape hurls a boulder at a point it can see within 90 feet. Dexterity Saving Throw: DC 17, each creature in a 5-foot-radius Sphere centered on that point. Failure: 24 (7d6) Bludgeoning damage. If the target is a Large or smaller creature, it has the Prone condition. Success: Half damage only."}],"bonus":[{"n":"Leap","d":"The ape jumps up to 30 feet by spending 10 feet of movement."}]},{"name":"Giant Badger","cr":"1/4","cat":"beast","ac":13,"hp":15,"hpF":"2d8+6","spd":"30 ft., Burrow 10 ft.","mods":{"str":1,"dex":0,"con":3,"int":-4,"wis":1,"cha":-3},"resist":["poison"],"actions":[{"n":"Bite","kind":"atk","hit":3,"dmg":"2d4+1","dtype":"piercing","d":"reach 5 ft"}]},{"name":"Giant Bat","cr":"1/4","cat":"beast","ac":13,"hp":22,"hpF":"4d10","spd":"10 ft., Fly 60 ft.","mods":{"str":2,"dex":3,"con":0,"int":-4,"wis":1,"cha":-2},"actions":[{"n":"Bite","kind":"atk","hit":5,"dmg":"1d6+3","dtype":"piercing","d":"reach 5 ft"}]},{"name":"Giant Boar","cr":"2","cat":"beast","ac":13,"hp":42,"hpF":"5d10+15","spd":"40 ft.","mods":{"str":3,"dex":0,"con":3,"int":-4,"wis":-2,"cha":-3},"saves":{"str":5},"traits":[{"n":"Bloodied Fury","d":"The boar has Advantage on melee attack rolls while it is Bloodied."}],"actions":[{"n":"Gore","kind":"atk","hit":5,"dmg":"2d6+3","dtype":"piercing","d":"reach 5 ft. If the target is a Large or smaller creature and the boar moved 20+ feet straight toward it immediately before the hit, the target takes an extra 7 (2d6) Piercing damage and has the Prone condition."}]},{"name":"Giant Centipede","cr":"1/4","cat":"beast","ac":14,"hp":9,"hpF":"2d6+2","spd":"30 ft., Climb 30 ft.","mods":{"str":-3,"dex":2,"con":1,"int":-5,"wis":-2,"cha":-4},"actions":[{"n":"Bite","kind":"atk","hit":4,"dmg":"1d4+2","dtype":"piercing","d":"reach 5 ft. and the target has the Poisoned condition until the start of the centipede's next turn."}]},{"name":"Giant Constrictor Snake","cr":"2","cat":"beast","ac":12,"hp":60,"hpF":"8d12+8","spd":"30 ft., Swim 30 ft.","mods":{"str":4,"dex":2,"con":1,"int":-5,"wis":0,"cha":-4},"multi":"The snake makes one Bite attack and uses Constrict.","actions":[{"n":"Bite","kind":"atk","hit":6,"dmg":"2d6+4","dtype":"piercing","d":"reach 10 ft"},{"n":"Constrict","kind":"save","save":{"ability":"STR","dc":14},"d":"Strength Saving Throw: DC 14, one Large or smaller creature the snake can see within 10 feet. Failure: 13 (2d8 + 4) Bludgeoning damage, and the target has the Grappled condition (escape DC 14)."}]},{"name":"Giant Crab","cr":"1/8","cat":"beast","ac":15,"hp":13,"hpF":"3d8","spd":"30 ft., Swim 30 ft.","mods":{"str":1,"dex":1,"con":0,"int":-5,"wis":-1,"cha":-4},"traits":[{"n":"Amphibious","d":"The crab can breathe air and water. 350 System Reference Document 5.2.1"}],"actions":[{"n":"Claw","kind":"atk","hit":3,"dmg":"1d6+1","dtype":"bludgeoning","d":"reach 5 ft. If the target is a Medium or smaller creature, it has the Grappled condition (escape DC 11) from one of two claws."}]},{"name":"Giant Crocodile","cr":"5","cat":"beast","ac":14,"hp":85,"hpF":"9d12+27","spd":"30 ft., Swim 50 ft.","mods":{"str":5,"dex":-1,"con":3,"int":-4,"wis":0,"cha":-2},"traits":[{"n":"Hold Breath","d":"The crocodile can hold its breath for 1 hour."}],"multi":"The crocodile makes one Bite attack and one Tail attack.","actions":[{"n":"Bite","kind":"atk","hit":8,"dmg":"3d10+5","dtype":"piercing","d":"reach 5 ft. If the target is a Large or smaller creature, it has the Grappled condition (escape DC 15). While Grappled, the target has the Restrained condition and can't be targeted by the crocodile's Tail."},{"n":"Tail","kind":"atk","hit":8,"dmg":"3d8+5","dtype":"bludgeoning","d":"reach 10 ft. If the target is a Large or smaller creature, it has the Prone condition."}]},{"name":"Giant Fire Beetle","cr":"0","cat":"beast","ac":13,"hp":4,"hpF":"1d6+1","spd":"30 ft., Climb 30 ft.","mods":{"str":-1,"dex":0,"con":1,"int":-5,"wis":-2,"cha":-4},"resist":["fire"],"traits":[{"n":"Illumination","d":"The beetle sheds Bright Light in a 10-foot radius and Dim Light for an additional 10 feet."}],"actions":[{"n":"Bite","kind":"atk","hit":1,"dmg":"1","dtype":"fire","d":"reach 5 ft."}]},{"name":"Giant Frog","cr":"1/4","cat":"beast","ac":11,"hp":18,"hpF":"4d8","spd":"30 ft., Swim 30 ft.","mods":{"str":1,"dex":1,"con":0,"int":-4,"wis":0,"cha":-4},"traits":[{"n":"Amphibious","d":"The frog can breathe air and water."},{"n":"Standing Leap","d":"The frog's Long Jump is up to 20 feet and its High Jump is up to 10 feet with or without a running start."}],"actions":[{"n":"Bite","kind":"atk","hit":3,"dmg":"1d6+2","dtype":"piercing","d":"reach 5 ft. If the target is a Medium or smaller creature, it has the Grappled condition (escape DC 11)."},{"n":"Swallow","kind":"text","d":"The frog swallows a Small or smaller target it is grappling. While swallowed, the target isn't Grappled but has the Blinded and Restrained conditions, and it has Total Cover against attacks and other effects outside the frog. While swallowing the target, the frog can't use Bite, and if the frog dies, the swallowed target is no longer Restrained and can escape from the corpse using 5 feet of movement, exiting with the Prone condition. At the end of the frog's next turn, the swallowed target takes 5 (2d4) Acid damage. If that damage doesn't kill it, the frog disgorges it, causing it to exit Prone."}]},{"name":"Giant Goat","cr":"1/2","cat":"beast","ac":11,"hp":19,"hpF":"3d10+3","spd":"40 ft., Climb 30 ft.","mods":{"str":3,"dex":1,"con":1,"int":-4,"wis":1,"cha":-2},"saves":{"str":5},"actions":[{"n":"Ram","kind":"atk","hit":5,"dmg":"1d6+3","dtype":"bludgeoning","d":"reach 5 ft. If the target is a Large or smaller creature and the goat moved 20+ feet straight toward it immediately before the hit, the target takes an extra 5 (2d4) Bludgeoning damage and has the Prone condition."}]},{"name":"Giant Hyena","cr":"1","cat":"beast","ac":12,"hp":45,"hpF":"6d10+12","spd":"50 ft.","mods":{"str":3,"dex":2,"con":2,"int":-4,"wis":1,"cha":-2},"actions":[{"n":"Bite","kind":"atk","hit":5,"dmg":"2d6+3","dtype":"piercing","d":"reach 5 ft"}],"bonus":[{"n":"Rampage (1/Day)","d":"Immediately after dealing damage to a creature that was already Bloodied, the hyena can move up to half its Speed, and it makes one Bite attack."}]},{"name":"Giant Lizard","cr":"1/4","cat":"beast","ac":12,"hp":19,"hpF":"3d10+3","spd":"40 ft., Climb 40 ft.","mods":{"str":2,"dex":1,"con":1,"int":-4,"wis":0,"cha":-3},"saves":{"dex":3},"traits":[{"n":"Spider Climb","d":"The lizard can climb difficult surfaces, including along ceilings, without needing to make an ability check."}],"actions":[{"n":"Bite","kind":"atk","hit":4,"dmg":"1d8+2","dtype":"piercing","d":"reach 5 ft"}]},{"name":"Giant Octopus","cr":"1","cat":"beast","ac":11,"hp":45,"hpF":"7d10+7","spd":"10 ft., Swim 60 ft.","mods":{"str":3,"dex":1,"con":1,"int":-3,"wis":0,"cha":-3},"traits":[{"n":"Water Breathing","d":"The octopus can breathe only underwater. It can hold its breath for 1 hour outside water."}],"actions":[{"n":"Tentacles","kind":"atk","hit":5,"dmg":"2d6+3","dtype":"bludgeoning","d":"reach 10 ft. If the target is a Medium or smaller creature, it has the Grappled condition (escape DC 13) from all eight tentacles. While Grappled, the target has the Restrained condition."}],"reactions":[{"n":"Ink Cloud (1/Day)","d":"Trigger: The octopus takes damage while underwater. Response: The octopus releases ink that fills a 10-foot Cube centered on itself, and the octopus moves up to its Swim Speed. The Cube is Heavily Obscured for 1 minute or until a strong current or similar effect disperses the ink."}]},{"name":"Giant Rat","cr":"1/8","cat":"beast","ac":13,"hp":7,"hpF":"2d6","spd":"30 ft., Climb 30 ft.","mods":{"str":-2,"dex":3,"con":0,"int":-4,"wis":0,"cha":-3},"saves":{"dex":5},"traits":[{"n":"Pack Tactics","d":"The rat has Advantage on an attack roll against a creature if at least one of the rat's allies is within 5 feet of the creature and the ally doesn't have the Incapacitated condition."}],"actions":[{"n":"Bite","kind":"atk","hit":5,"dmg":"1d4+3","dtype":"piercing","d":"reach 5 feet"}]},{"name":"Giant Scorpion","cr":"3","cat":"beast","ac":15,"hp":52,"hpF":"7d10+14","spd":"40 ft.","mods":{"str":3,"dex":1,"con":2,"int":-5,"wis":-1,"cha":-4},"multi":"The scorpion makes two Claw attacks and one Sting attack.","actions":[{"n":"Claw","kind":"atk","hit":5,"dmg":"1d6+3","dtype":"bludgeoning","d":"reach 5 ft. If the target is a Large or smaller creature, it has the Grappled condition (escape DC 13) from one of two claws."},{"n":"Sting","kind":"atk","hit":5,"dmg":"1d8+3","dtype":"piercing","extra":"2d10","extraType":"poison","d":"reach 5 ft"}]},{"name":"Giant Seahorse","cr":"1/2","cat":"beast","ac":14,"hp":16,"hpF":"3d10","spd":"5 ft., Swim 40 ft.","mods":{"str":2,"dex":1,"con":0,"int":-4,"wis":1,"cha":-3},"traits":[{"n":"Water Breathing","d":"The seahorse can breathe only underwater."}],"actions":[{"n":"Ram","kind":"atk","hit":4,"dmg":"2d6+2","dtype":"bludgeoning","d":"reach 5 ft. or 11 (2d8 + 2) Bludgeoning damage if the seahorse moved 20+ feet straight toward the target immediately before the hit."}],"bonus":[{"n":"Bubble Dash","d":"While underwater, the seahorse moves up to half its Swim Speed without provoking Opportunity Attacks."}]},{"name":"Giant Shark","cr":"5","cat":"beast","ac":13,"hp":92,"hpF":"8d12+40","spd":"5 ft., Swim 60 ft.","mods":{"str":6,"dex":0,"con":5,"int":-5,"wis":0,"cha":-3},"traits":[{"n":"Water Breathing","d":"The shark can breathe only underwater."}],"multi":"The shark makes two Bite attacks.","actions":[{"n":"Bite","kind":"atk","hit":9,"dmg":"3d10+6","dtype":"piercing","d":"(with Advantage if the target doesn't have all its Hit Points) reach 5 ft"}]},{"name":"Giant Spider","cr":"1","cat":"beast","ac":14,"hp":26,"hpF":"4d10+4","spd":"30 ft., Climb 30 ft.","mods":{"str":2,"dex":3,"con":1,"int":-4,"wis":0,"cha":-3},"traits":[{"n":"Spider Climb","d":"The spider can climb difficult surfaces, including along ceilings, without needing to make an ability check."},{"n":"Web Walker","d":"The spider ignores movement restrictions caused by webs, and it knows the location of any other creature in contact with the same web."}],"actions":[{"n":"Bite","kind":"atk","hit":5,"dmg":"1d8+3","dtype":"piercing","extra":"2d6","extraType":"poison","d":"reach 5 ft"},{"n":"Web","kind":"save","save":{"ability":"DEX","dc":13},"rech":5,"d":"Dexterity Saving Throw: DC 13, one creature the spider can see within 60 feet. Failure: The target has the Restrained condition until the web is destroyed (AC 10; HP 5; Vulnerability to Fire damage; Immunity to Poison and Psychic damage)."}]},{"name":"Giant Toad","cr":"1","cat":"beast","ac":11,"hp":39,"hpF":"6d10+6","spd":"30 ft., Swim 30 ft.","mods":{"str":2,"dex":1,"con":1,"int":-4,"wis":0,"cha":-4},"traits":[{"n":"Amphibious","d":"The toad can breathe air and water."},{"n":"Standing Leap","d":"The toad's Long Jump is up to 20 feet and its High Jump is up to 10 feet with or without a running start."}],"actions":[{"n":"Bite","kind":"atk","hit":4,"dmg":"1d6+2","dtype":"piercing","extra":"2d4","extraType":"poison","d":"reach 5 ft. If the target is a Medium or smaller creature, it has the Grappled condition (escape DC 12)."},{"n":"Swallow","kind":"text","d":"The toad swallows a Medium or smaller target it is grappling. While swallowed, the target isn't Grappled but has the Blinded and Restrained conditions, and it has Total Cover against attacks and other effects outside the toad. In addition, the target takes 10 (3d6) Acid damage at the end of each of the toad's turns. The 354 System Reference Document 5.2.1 toad can have only one target swallowed at a time, and it can't use Bite while it has a swallowed target. If the toad dies, a swallowed creature is no longer Restrained and can escape from the corpse using 5 feet of movement, exiting with the Prone condition."}]},{"name":"Giant Venomous Snake","cr":"1/4","cat":"beast","ac":14,"hp":11,"hpF":"2d8+2","spd":"40 ft., Swim 40 ft.","mods":{"str":0,"dex":4,"con":1,"int":-4,"wis":0,"cha":-4},"actions":[{"n":"Bite","kind":"atk","hit":6,"dmg":"1d4+4","dtype":"piercing","extra":"1d8","extraType":"poison","d":"reach 10 ft"}]},{"name":"Giant Wasp","cr":"1/2","cat":"beast","ac":13,"hp":22,"hpF":"5d8","spd":"10 ft., Fly 50 ft.","mods":{"str":0,"dex":2,"con":0,"int":-5,"wis":0,"cha":-4},"traits":[{"n":"Flyby","d":"The wasp doesn't provoke an Opportunity Attack when it flies out of an enemy's reach."}],"actions":[{"n":"Sting","kind":"atk","hit":4,"dmg":"1d6+2","dtype":"piercing","extra":"2d4","extraType":"poison","d":"reach 5 ft"}]},{"name":"Giant Weasel","cr":"1/8","cat":"beast","ac":13,"hp":9,"hpF":"2d8","spd":"40 ft., Climb 30 ft.","mods":{"str":0,"dex":3,"con":0,"int":-3,"wis":1,"cha":-3},"actions":[{"n":"Bite","kind":"atk","hit":5,"dmg":"1d4+3","dtype":"piercing","d":"reach 5 ft"}]},{"name":"Giant Wolf Spider","cr":"1/4","cat":"beast","ac":13,"hp":11,"hpF":"2d8+2","spd":"40 ft., Climb 40 ft.","mods":{"str":1,"dex":3,"con":1,"int":-4,"wis":1,"cha":-3},"traits":[{"n":"Spider Climb","d":"The spider can climb difficult surfaces, including along ceilings, without needing to make an ability check."}],"actions":[{"n":"Bite","kind":"atk","hit":5,"dmg":"1d4+3","dtype":"piercing","extra":"2d4","extraType":"poison","d":"reach 5 ft. 355 System Reference Document 5.2.1"}]},{"name":"Goat","cr":"0","cat":"beast","ac":10,"hp":4,"hpF":"1d8","spd":"40 ft., Climb 30 ft.","mods":{"str":0,"dex":0,"con":0,"int":-4,"wis":0,"cha":-3},"saves":{"str":2},"actions":[{"n":"Ram","kind":"atk","hit":2,"dmg":"1","dtype":"bludgeoning","d":"reach 5 ft. or 2 (1d4) Bludgeoning damage if the goat moved 20+ feet straight toward the target immediately before the hit."}]},{"name":"Hawk","cr":"0","cat":"beast","ac":13,"hp":1,"hpF":"1d4-1","spd":"10 ft., Fly 60 ft.","mods":{"str":-3,"dex":3,"con":-1,"int":-4,"wis":2,"cha":-2},"actions":[{"n":"Talons","kind":"atk","hit":5,"dmg":"1","dtype":"slashing","d":"reach 5 ft."}]},{"name":"Hippopotamus","cr":"4","cat":"beast","ac":14,"hp":82,"hpF":"11d10+22","spd":"30 ft., Swim 30 ft.","mods":{"str":5,"dex":-2,"con":2,"int":-4,"wis":1,"cha":-3},"saves":{"str":7},"traits":[{"n":"Hold Breath","d":"The hippopotamus can hold its breath for 10 minutes."}],"multi":"The hippopotamus makes two Bite attacks.","actions":[{"n":"Bite","kind":"atk","hit":7,"dmg":"2d10+5","dtype":"piercing","d":"reach 5 ft"}]},{"name":"Hunter Shark","cr":"2","cat":"beast","ac":12,"hp":45,"hpF":"6d10+12","spd":"5 ft., Swim 40 ft.","mods":{"str":4,"dex":2,"con":2,"int":-5,"wis":0,"cha":-3},"traits":[{"n":"Water Breathing","d":"The shark can breathe only underwater."}],"actions":[{"n":"Bite","kind":"atk","hit":6,"dmg":"3d6+4","dtype":"piercing","d":"(with Advantage if the target doesn't have all its Hit Points) reach 5 ft"}]},{"name":"Hyena","cr":"0","cat":"beast","ac":11,"hp":5,"hpF":"1d8+1","spd":"50 ft.","mods":{"str":0,"dex":1,"con":1,"int":-4,"wis":1,"cha":-3},"traits":[{"n":"Pack Tactics","d":"The hyena has Advantage on an attack roll against a creature if at least one of the hyena's allies is within 5 feet of the creature and the ally doesn't have the Incapacitated condition."}],"actions":[{"n":"Bite","kind":"atk","hit":2,"dmg":"1d6","dtype":"piercing","d":"reach 5 ft. 356 System Reference Document 5.2.1"}]},{"name":"Jackal","cr":"0","cat":"beast","ac":12,"hp":3,"hpF":"1d6","spd":"40 ft.","mods":{"str":-1,"dex":2,"con":0,"int":-4,"wis":1,"cha":-2},"actions":[{"n":"Bite","kind":"atk","hit":1,"dmg":"1d4-1","dtype":"piercing","d":"reach 5 ft"}]},{"name":"Killer Whale","cr":"3","cat":"beast","ac":12,"hp":90,"hpF":"12d12+12","spd":"5 ft., Swim 60 ft.","mods":{"str":4,"dex":2,"con":1,"int":-4,"wis":1,"cha":-2},"traits":[{"n":"Hold Breath","d":"The whale can hold its breath for 30 minutes."}],"actions":[{"n":"Bite","kind":"atk","hit":6,"dmg":"5d6+4","dtype":"piercing","d":"reach 5 ft"}]},{"name":"Lion","cr":"1","cat":"beast","ac":12,"hp":22,"hpF":"4d10","spd":"50 ft.","mods":{"str":3,"dex":2,"con":0,"int":-4,"wis":1,"cha":-1},"traits":[{"n":"Pack Tactics","d":"The lion has Advantage on an attack roll against a creature if at least one of the lion's allies is within 5 feet of the creature and the ally doesn't have the Incapacitated condition."},{"n":"Running Leap","d":"With a 10-foot running start, the lion can Long Jump up to 25 feet."}],"multi":"The lion makes two Rend attacks. It can replace one attack with a use of Roar.","actions":[{"n":"Rend","kind":"atk","hit":5,"dmg":"1d8+3","dtype":"slashing","d":"reach 5 ft"},{"n":"Roar","kind":"save","save":{"ability":"WIS","dc":11},"d":"Wisdom Saving Throw: DC 11, one creature within 15 feet. Failure: The target has the Frightened condition until the start of the lion's next turn."}]},{"name":"Lizard","cr":"0","cat":"beast","ac":10,"hp":2,"hpF":"1d4","spd":"20 ft., Climb 20 ft.","mods":{"str":-4,"dex":0,"con":0,"int":-5,"wis":-1,"cha":-4},"traits":[{"n":"Spider Climb","d":"The lizard can climb difficult surfaces, including along ceilings, without needing to make an ability check."}],"actions":[{"n":"Bite","kind":"atk","hit":2,"dmg":"1","dtype":"piercing","d":"reach 5 ft."}]},{"name":"Mammoth","cr":"6","cat":"beast","ac":13,"hp":126,"hpF":"11d12+55","spd":"50 ft.","mods":{"str":7,"dex":-1,"con":5,"int":-4,"wis":0,"cha":-2},"saves":{"str":10,"con":8},"multi":"The mammoth makes two Gore attacks. 357 System Reference Document 5.2.1","actions":[{"n":"Gore","kind":"atk","hit":10,"dmg":"2d10+7","dtype":"piercing","d":"reach 10 ft. If the target is a Huge or smaller creature and the mammoth moved 20+ feet straight toward it immediately before the hit, the target has the Prone condition."}],"bonus":[{"n":"Trample","d":"Dexterity Saving Throw: DC 18, one creature within 5 feet that has the Prone condition. Failure: 29 (4d10 + 7) Bludgeoning damage. Success: Half damage."}]},{"name":"Mastiff","cr":"1/8","cat":"beast","ac":12,"hp":5,"hpF":"1d8+1","spd":"40 ft.","mods":{"str":1,"dex":2,"con":1,"int":-4,"wis":1,"cha":-2},"saves":{"wis":3},"actions":[{"n":"Bite","kind":"atk","hit":3,"dmg":"1d6+1","dtype":"piercing","d":"reach 5 ft. If the target is a Medium or smaller creature, it has the Prone condition."}]},{"name":"Mule","cr":"1/8","cat":"beast","ac":10,"hp":11,"hpF":"2d8+2","spd":"40 ft.","mods":{"str":2,"dex":0,"con":1,"int":-4,"wis":0,"cha":-3},"saves":{"str":4},"traits":[{"n":"Beast of Burden","d":"The mule counts as one size larger for the purpose of determining its carrying capacity."}],"actions":[{"n":"Hooves","kind":"atk","hit":4,"dmg":"1d4+2","dtype":"bludgeoning","d":"reach 5 ft"}]},{"name":"Octopus","cr":"0","cat":"beast","ac":12,"hp":3,"hpF":"1d6","spd":"5 ft., Swim 30 ft.","mods":{"str":-3,"dex":2,"con":0,"int":-4,"wis":0,"cha":-3},"traits":[{"n":"Compression","d":"The octopus can move through a space as narrow as 1 inch without expending extra movement to do so."},{"n":"Water Breathing","d":"The octopus can breathe only underwater."}],"actions":[{"n":"Tentacles","kind":"atk","hit":4,"dmg":"1","dtype":"bludgeoning","d":"reach 5 ft."}],"reactions":[{"n":"Ink Cloud (1/Day)","d":"Trigger: A creature ends its turn within 5 feet of the octopus while underwater. Response: The octopus releases ink that fills a 5-foot Cube centered on itself, and the octopus moves up to its Swim Speed. The Cube is Heavily Obscured for 1 minute or until a strong current or similar effect disperses the ink."}]},{"name":"Owl","cr":"0","cat":"beast","ac":11,"hp":1,"hpF":"1d4-1","spd":"5 ft., Fly 60 ft.","mods":{"str":-4,"dex":1,"con":-1,"int":-4,"wis":1,"cha":-2},"traits":[{"n":"Flyby","d":"The owl doesn't provoke an Opportunity Attack when it flies out of an enemy's reach."}],"actions":[{"n":"Talons","kind":"atk","hit":3,"dmg":"1","dtype":"slashing","d":"reach 5 ft."}]},{"name":"Panther","cr":"1/4","cat":"beast","ac":13,"hp":13,"hpF":"3d8","spd":"50 ft., Climb 40 ft.","mods":{"str":2,"dex":3,"con":0,"int":-4,"wis":2,"cha":-2},"actions":[{"n":"Rend","kind":"atk","hit":5,"dmg":"1d6+3","dtype":"slashing","d":"reach 5 ft"}],"bonus":[{"n":"Nimble Escape","d":"The panther takes the Disengage or Hide action."}]},{"name":"Piranha","cr":"0","cat":"beast","ac":13,"hp":1,"hpF":"1d4-1","spd":"5 ft., Swim 40 ft.","mods":{"str":-4,"dex":3,"con":-1,"int":-5,"wis":-2,"cha":-4},"traits":[{"n":"Water Breathing","d":"The piranha can breathe only underwater."}],"actions":[{"n":"Bite","kind":"atk","hit":5,"dmg":"1","dtype":"piercing","d":"(with Advantage if the target doesn't have all its Hit Points) reach 5 ft."}]},{"name":"Plesiosaurus","cr":"2","cat":"beast","ac":13,"hp":68,"hpF":"8d10+24","spd":"20 ft., Swim 40 ft.","mods":{"str":4,"dex":2,"con":3,"int":-4,"wis":1,"cha":-3},"traits":[{"n":"Hold Breath","d":"The plesiosaurus can hold its breath for 1 hour."}],"actions":[{"n":"Bite","kind":"atk","hit":6,"dmg":"2d6+4","dtype":"piercing","d":"reach 10 ft"}]},{"name":"Polar Bear","cr":"2","cat":"beast","ac":12,"hp":42,"hpF":"5d10+15","spd":"40 ft., Swim 40 ft.","mods":{"str":5,"dex":2,"con":3,"int":-4,"wis":1,"cha":-2},"resist":["cold"],"multi":"The bear makes two Rend attacks.","actions":[{"n":"Rend","kind":"atk","hit":7,"dmg":"1d8+5","dtype":"slashing","d":"reach 5 ft"}]},{"name":"Pony","cr":"1/8","cat":"beast","ac":10,"hp":11,"hpF":"2d8+2","spd":"40 ft.","mods":{"str":2,"dex":0,"con":1,"int":-4,"wis":0,"cha":-2},"saves":{"str":4},"actions":[{"n":"Hooves","kind":"atk","hit":4,"dmg":"1d4+2","dtype":"bludgeoning","d":"reach 5 ft"}]},{"name":"Pteranodon","cr":"1/4","cat":"beast","ac":13,"hp":13,"hpF":"3d8","spd":"10 ft., Fly 60 ft.","mods":{"str":1,"dex":2,"con":0,"int":-4,"wis":-1,"cha":-3},"traits":[{"n":"Flyby","d":"The pteranodon doesn't provoke an Opportunity Attack when it flies out of an enemy's reach."}],"actions":[{"n":"Bite","kind":"atk","hit":4,"dmg":"1d8+2","dtype":"piercing","d":"reach 5 ft"}]},{"name":"Rat","cr":"0","cat":"beast","ac":10,"hp":1,"hpF":"1d4-1","spd":"20 ft., Climb 20 ft.","mods":{"str":-4,"dex":0,"con":-1,"int":-4,"wis":0,"cha":-3},"traits":[{"n":"Agile","d":"The rat doesn't provoke an Opportunity Attack when it moves out of an enemy's reach."}],"actions":[{"n":"Bite","kind":"atk","hit":2,"dmg":"1","dtype":"piercing","d":"reach 5 ft."}]},{"name":"Raven","cr":"0","cat":"beast","ac":12,"hp":2,"hpF":"1d4","spd":"10 ft., Fly 50 ft.","mods":{"str":-4,"dex":2,"con":0,"int":-3,"wis":1,"cha":-2},"traits":[{"n":"Mimicry","d":"The raven can mimic simple sounds it has heard, such as a whisper or chitter. A hearer can discern the sounds are imitations with a successful DC 10 Wisdom (Insight) check."}],"actions":[{"n":"Beak","kind":"atk","hit":4,"dmg":"1","dtype":"piercing","d":"reach 5 ft."}]},{"name":"Reef Shark","cr":"1/2","cat":"beast","ac":12,"hp":22,"hpF":"4d8+4","spd":"5 ft., Swim 30 ft.","mods":{"str":2,"dex":2,"con":1,"int":-5,"wis":0,"cha":-3},"traits":[{"n":"Pack Tactics","d":"The shark has Advantage on an attack roll against a creature if at least one of the shark's allies is within 5 feet of the creature and the ally doesn't have the Incapacitated condition."},{"n":"Water Breathing","d":"The shark can breathe only underwater."}],"actions":[{"n":"Bite","kind":"atk","hit":4,"dmg":"2d4+2","dtype":"piercing","d":"reach 5 ft"}]},{"name":"Rhinoceros","cr":"2","cat":"beast","ac":13,"hp":45,"hpF":"6d10+12","spd":"40 ft.","mods":{"str":5,"dex":-1,"con":2,"int":-4,"wis":1,"cha":-2},"actions":[{"n":"Gore","kind":"atk","hit":7,"dmg":"2d8+5","dtype":"piercing","d":"reach 5 ft. If target is a Large or smaller creature and the rhinoceros moved 20+ feet straight toward it immediately before the hit, the target takes an extra 9 (2d8) Piercing damage and has the Prone condition."}]},{"name":"Riding Horse","cr":"1/4","cat":"beast","ac":11,"hp":13,"hpF":"2d10+2","spd":"60 ft.","mods":{"str":3,"dex":1,"con":1,"int":-4,"wis":0,"cha":-2},"actions":[{"n":"Hooves","kind":"atk","hit":5,"dmg":"1d8+3","dtype":"bludgeoning","d":"reach 5 ft"}]},{"name":"Saber-Toothed Tiger","cr":"2","cat":"beast","ac":13,"hp":52,"hpF":"7d10+14","spd":"40 ft.","mods":{"str":4,"dex":3,"con":2,"int":-4,"wis":1,"cha":-1},"saves":{"str":6,"dex":5},"traits":[{"n":"Running Leap","d":"With a 10-foot running start, the tiger can Long Jump up to 25 feet."}],"multi":"The tiger makes two Rend attacks.","actions":[{"n":"Rend","kind":"atk","hit":6,"dmg":"2d6+4","dtype":"slashing","d":"reach 5 ft"}],"bonus":[{"n":"Nimble Escape","d":"The tiger takes the Disengage or Hide action."}]},{"name":"Scorpion","cr":"0","cat":"beast","ac":11,"hp":1,"hpF":"1d4-1","spd":"10 ft.","mods":{"str":-4,"dex":0,"con":-1,"int":-5,"wis":-1,"cha":-4},"actions":[{"n":"Sting","kind":"atk","hit":2,"dmg":"1","dtype":"piercing","d":"reach 5 ft. plus 3 (1d6) Poison damage."}]},{"name":"Seahorse","cr":"0","cat":"beast","ac":12,"hp":1,"hpF":"1d4-1","spd":"5 ft., Swim 20 ft.","mods":{"str":-5,"dex":1,"con":-1,"int":-5,"wis":0,"cha":-4},"traits":[{"n":"Water Breathing","d":"The seahorse can breathe only underwater."}],"actions":[{"n":"Bubble Dash","kind":"text","d":"While underwater, the seahorse moves up to its Swim Speed without provoking Opportunity Attacks."}]},{"name":"Spider","cr":"0","cat":"beast","ac":12,"hp":1,"hpF":"1d4-1","spd":"20 ft., Climb 20 ft.","mods":{"str":-4,"dex":2,"con":-1,"int":-5,"wis":0,"cha":-4},"traits":[{"n":"Spider Climb","d":"The spider can climb difficult surfaces, including along ceilings, without needing to make an ability check."},{"n":"Web Walker","d":"The spider ignores movement restrictions caused by webs, and the spider knows the location of any other creature in contact with the same web."}],"actions":[{"n":"Bite","kind":"atk","hit":4,"dmg":"1","dtype":"piercing","d":"reach 5 ft. plus 2 (1d4) Poison damage."}]},{"name":"Tiger","cr":"1","cat":"beast","ac":13,"hp":30,"hpF":"4d10+8","spd":"40 ft.","mods":{"str":3,"dex":3,"con":2,"int":-4,"wis":1,"cha":-1},"actions":[{"n":"Rend","kind":"atk","hit":5,"dmg":"2d6+3","dtype":"slashing","d":"reach 5 ft. If the target is a Large or smaller creature, it has the Prone condition."}],"bonus":[{"n":"Nimble Escape","d":"The tiger takes the Disengage or Hide action."}]},{"name":"Triceratops","cr":"5","cat":"beast","ac":14,"hp":114,"hpF":"12d12+36","spd":"50 ft.","mods":{"str":6,"dex":-1,"con":3,"int":-4,"wis":0,"cha":-3},"multi":"The triceratops makes two Gore attacks.","actions":[{"n":"Gore","kind":"atk","hit":9,"dmg":"2d12+6","dtype":"piercing","d":"reach 5 ft. If the target is Huge or smaller and the triceratops moved 20+ feet straight toward it immediately before the hit, the target takes an extra 9 (2d8) Piercing damage and has the Prone condition. 363 System Reference Document 5.2.1"}]},{"name":"Tyrannosaurus Rex","cr":"8","cat":"beast","ac":13,"hp":136,"hpF":"13d12+52","spd":"50 ft.","mods":{"str":7,"dex":0,"con":4,"int":-4,"wis":1,"cha":-1},"saves":{"str":10,"wis":4},"multi":"The tyrannosaurus makes one Bite attack and one Tail attack.","actions":[{"n":"Bite","kind":"atk","hit":10,"dmg":"4d12+7","dtype":"piercing","d":"reach 10 ft. If the target is a Large or smaller creature, it has the Grappled condition (escape DC 17). While Grappled, the target has the Restrained condition and can't be targeted by the tyrannosaurus's Tail."},{"n":"Tail","kind":"atk","hit":10,"dmg":"4d8+7","dtype":"bludgeoning","d":"reach 15 ft. If the target is a Huge or smaller creature, it has the Prone condition."}]},{"name":"Venomous Snake","cr":"1/8","cat":"beast","ac":12,"hp":5,"hpF":"2d4","spd":"30 ft., Swim 30 ft.","mods":{"str":-4,"dex":2,"con":0,"int":-5,"wis":0,"cha":-4},"actions":[{"n":"Bite","kind":"atk","hit":4,"dmg":"1d4+2","dtype":"piercing","extra":"1d6","extraType":"poison","d":"reach 5 ft"}]},{"name":"Vulture","cr":"0","cat":"beast","ac":10,"hp":5,"hpF":"1d8+1","spd":"10 ft., Fly 50 ft.","mods":{"str":-2,"dex":0,"con":1,"int":-4,"wis":1,"cha":-3},"traits":[{"n":"Pack Tactics","d":"The vulture has Advantage on an attack roll against a creature if at least one of the vulture's allies is within 5 feet of the creature and the ally doesn't have the Incapacitated condition."}],"actions":[{"n":"Beak","kind":"atk","hit":2,"dmg":"1d4","dtype":"piercing","d":"reach 5 ft"}]},{"name":"Warhorse","cr":"1/2","cat":"beast","ac":11,"hp":19,"hpF":"3d10+3","spd":"60 ft.","mods":{"str":4,"dex":1,"con":1,"int":-4,"wis":1,"cha":-2},"saves":{"wis":3},"actions":[{"n":"Hooves","kind":"atk","hit":6,"dmg":"2d4+4","dtype":"bludgeoning","d":"reach 5 ft. If the target is a Large or smaller creature and the horse moved 20+ feet straight toward it immediately before the hit, the target takes an extra 5 (2d4) Bludgeoning damage and has the Prone condition."}]},{"name":"Weasel","cr":"0","cat":"beast","ac":13,"hp":1,"hpF":"1d4-1","spd":"30 ft., Climb 30 ft.","mods":{"str":-4,"dex":3,"con":-1,"int":-4,"wis":1,"cha":-4},"actions":[{"n":"Bite","kind":"atk","hit":5,"dmg":"1","dtype":"piercing","d":"reach 5 ft. 364 System Reference Document 5.2.1"}]},{"name":"Wolf","cr":"1/4","cat":"beast","ac":12,"hp":11,"hpF":"2d8+2","spd":"40 ft.","mods":{"str":2,"dex":2,"con":1,"int":-4,"wis":1,"cha":-2},"traits":[{"n":"Pack Tactics","d":"The wolf has Advantage on attack rolls against a creature if at least one of the wolf's allies is within 5 feet of the creature and the ally doesn't have the Incapacitated condition."}],"actions":[{"n":"Bite","kind":"atk","hit":4,"dmg":"1d6+2","dtype":"piercing","d":"reach 5 ft. If the target is a Medium or smaller creature, it has the Prone condition."}]},{"name":"Adult Black Dragon","cr":"14","cat":"dragon","ac":19,"hp":195,"hpF":"17d12+85","spd":"40 ft., Fly 80 ft., Swim 40 ft.","mods":{"str":6,"dex":2,"con":5,"int":2,"wis":1,"cha":4},"saves":{"dex":7,"wis":6},"immune":["acid"],"traits":[{"n":"Amphibious","d":"The dragon can breathe air and water."},{"n":"Legendary Resistance (3/Day, or 4/Day in Lair)","d":"If the dragon fails a saving throw, it can choose to succeed instead."}],"multi":"The dragon makes three Rend attacks. It can replace one attack with a use of Spellcasting to cast Acid Arrow (level 3 version).","actions":[{"n":"Rend","kind":"atk","hit":11,"dmg":"2d6+6","dtype":"slashing","extra":"1d8","extraType":"acid","d":"reach 10 ft"},{"n":"Acid Breath","kind":"save","save":{"ability":"DEX","dc":18},"rech":5,"d":"Dexterity Saving Throw: DC 18, each creature in a 60-foot-long, 5-footwide Line. Failure: 54 (12d8) Acid damage. Success: Half damage."},{"n":"Spellcasting","kind":"text","d":"The dragon casts one of the following spells, requiring no Material components and using Charisma as the spellcasting ability (spell save DC 17, +9 to hit with spell attacks): At Will: Acid Arrow (level 3 version), Detect Magic, Fear 1/Day Each: Speak with Dead, Vitriolic Sphere"}],"legendary":{"count":3,"options":[{"n":"Cloud of Insects","d":"Dexterity Saving Throw: DC 17, one creature the dragon can see within 120 feet. Failure: 22 (4d10) Poison damage, and the target has Disadvantage on saving throws to maintain Concentration until the end of its next turn. Failure or Success: The dragon can't take this action again until the start of its next turn."},{"n":"Frightful Presence","d":"The dragon uses Spellcasting to cast Fear. The dragon can't take this action again until the start of its next turn."},{"n":"Pounce","d":"The dragon moves up to half its Speed, and it makes one Rend attack."}]},"legRes":3},{"name":"Adult Blue Dragon","cr":"16","cat":"dragon","ac":19,"hp":212,"hpF":"17d12+102","spd":"40 ft., Burrow 30 ft., Fly 80 ft.","mods":{"str":7,"dex":0,"con":6,"int":3,"wis":2,"cha":5},"saves":{"dex":5,"wis":7},"immune":["lightning"],"traits":[{"n":"Legendary Resistance (3/Day, or 4/Day in Lair)","d":"If the dragon fails a saving throw, it can choose to succeed instead."}],"multi":"The dragon makes three Rend attacks. It can replace one attack with a use of Spellcasting to cast Shatter.","actions":[{"n":"Rend","kind":"atk","hit":12,"dmg":"2d8+7","dtype":"slashing","extra":"1d10","extraType":"lightning","d":"reach 10 ft"},{"n":"Lightning Breath","kind":"save","save":{"ability":"DEX","dc":19},"rech":5,"d":"Dexterity Saving Throw: DC 19, each creature in a 90-foot-long, 5-footwide Line. Failure: 60 (11d10) Lightning damage. Success: Half damage."},{"n":"Spellcasting","kind":"text","d":"The dragon casts one of the following spells, requiring no Material components and using Charisma as the spellcasting ability (spell save DC 18): At Will: Detect Magic, Invisibility, Mage Hand, Shatter"}],"legendary":{"count":3,"options":[{"n":"Cloaked Flight","d":"The dragon uses Spellcasting to cast Invisibility on itself, and it can fly up to half its Fly Speed. The dragon can't take this action again until the start of its next turn."},{"n":"Sonic Boom","d":"The dragon uses Spellcasting to cast Shatter. The dragon can't take this action again until the start of its next turn."},{"n":"Tail Swipe","d":"The dragon makes one Rend attack."}]},"legRes":3},{"name":"Adult Brass Dragon","cr":"13","cat":"dragon","ac":18,"hp":172,"hpF":"15d12+75","spd":"40 ft., Burrow 30 ft., Fly 80 ft.","mods":{"str":6,"dex":0,"con":5,"int":2,"wis":1,"cha":3},"saves":{"dex":5,"wis":6},"immune":["fire"],"traits":[{"n":"Legendary Resistance (3/Day, or 4/Day in Lair)","d":"If the dragon fails a saving throw, it can choose to succeed instead."}],"multi":"The dragon makes three Rend attacks. It can replace one attack with a use of (A) Sleep Breath or (B) Spellcasting to cast Scorching Ray.","actions":[{"n":"Rend","kind":"atk","hit":11,"dmg":"2d10+6","dtype":"slashing","extra":"1d8","extraType":"fire","d":"reach 10 ft"},{"n":"Fire Breath","kind":"save","save":{"ability":"DEX","dc":18},"rech":5,"d":"Dexterity Saving Throw: DC 18, each creature in a 60-foot-long, 5-footwide Line. Failure: 45 (10d8) Fire damage. Success: Half damage."},{"n":"Sleep Breath","kind":"save","save":{"ability":"CON","dc":18},"d":"Constitution Saving Throw: DC 18, each creature in a 60-foot Cone. Failure: The target has the Incapacitated condition until the end of its next turn, at which point it repeats the save. Second Failure: The target has the Unconscious condition for 10 minutes. This effect ends for the target if it takes damage or a creature within 5 feet of it takes an action to wake it."},{"n":"Spellcasting","kind":"text","conc":true,"d":"The dragon casts one of the following spells, requiring no Material components and using Charisma as the spellcasting ability (spell save DC 16): At Will: Detect Magic, Minor Illusion, Scorching Ray, Shapechange (Beast or Humanoid form only, no Temporary Hit Points gained from the spell, and no Concentration or Temporary Hit Points required to maintain the spell), Speak with Animals 1/Day Each: Detect Thoughts, Control Weather"}],"legendary":{"count":3,"options":[{"n":"Blazing Light","d":"The dragon uses Spellcasting to cast Scorching Ray."},{"n":"Pounce","d":"The dragon moves up to half its Speed, and it makes one Rend attack."},{"n":"Scorching Sands","d":"Dexterity Saving Throw: DC 16, one creature the dragon can see within 120 feet. Failure: 27 (6d8) Fire damage, and the target's Speed is halved until the end of its next turn. Failure or Success: The dragon can't take this action again until the start of its next turn."}]},"legRes":3},{"name":"Adult Bronze Dragon","cr":"15","cat":"dragon","ac":18,"hp":212,"hpF":"17d12+102","spd":"40 ft., Fly 80 ft., Swim 40 ft.","mods":{"str":7,"dex":0,"con":6,"int":3,"wis":2,"cha":5},"saves":{"dex":5,"wis":7},"immune":["lightning"],"traits":[{"n":"Amphibious","d":"The dragon can breathe air and water."},{"n":"Legendary Resistance (3/Day, or 4/Day in Lair)","d":"If the dragon fails a saving throw, it can choose to succeed instead."}],"multi":"The dragon makes three Rend attacks. It can replace one attack with a use of (A) Repulsion Breath or (B) Spellcasting to cast Guiding Bolt (level 2 version).","actions":[{"n":"Rend","kind":"atk","hit":12,"dmg":"2d8+7","dtype":"slashing","extra":"1d10","extraType":"lightning","d":"reach 10 ft"},{"n":"Lightning Breath","kind":"save","save":{"ability":"DEX","dc":19},"rech":5,"d":"Dexterity Saving Throw: DC 19, each creature in a 90-foot-long, 5-footwide Line. Failure: 55 (10d10) Lightning damage. Success: Half damage."},{"n":"Repulsion Breath","kind":"save","save":{"ability":"STR","dc":19},"d":"Strength Saving Throw: DC 19, each creature in a 30-foot Cone. Failure: The target is pushed up to 60 feet straight away from the dragon and has the Prone condition."},{"n":"Spellcasting","kind":"text","conc":true,"d":"The dragon casts one of the following spells, requiring no Material components and using Charisma as the spellcasting ability (spell save DC 17, +10 to hit with spell attacks): At Will: Detect Magic, Guiding Bolt (level 2 version), Shapechange (Beast or Humanoid form only, no Temporary Hit Points gained from the spell, and no Concentration or Temporary Hit Points required to maintain the spell), Speak with Animals, Thaumaturgy 1/Day Each: Detect Thoughts, Water Breathing"}],"legendary":{"count":3,"options":[{"n":"Guiding Light","d":"The dragon uses Spellcasting to cast Guiding Bolt (level 2 version)."},{"n":"Pounce","d":"The dragon moves up to half its Speed, and it makes one Rend attack."},{"n":"Thunderclap","d":"Constitution Saving Throw: DC 17, each creature in a 20-foot-radius Sphere centered on a point the dragon can see within 90 feet. Failure: 10 (3d6) Thunder damage, and the target has the Deafened condition until the end of its next turn."}]},"legRes":3},{"name":"Adult Copper Dragon","cr":"14","cat":"dragon","ac":18,"hp":184,"hpF":"16d12+80","spd":"40 ft., Climb 40 ft., Fly 80 ft.","mods":{"str":6,"dex":1,"con":5,"int":4,"wis":2,"cha":4},"saves":{"dex":6,"wis":7},"immune":["acid"],"traits":[{"n":"Legendary Resistance (3/Day, or 4/Day in Lair)","d":"If the dragon fails a saving throw, it can choose to succeed instead."}],"multi":"The dragon makes three Rend attacks. It can replace one attack with a use of (A) Slowing Breath or (B) Spellcasting to cast Mind Spike (level 4 version).","actions":[{"n":"Rend","kind":"atk","hit":11,"dmg":"2d10+6","dtype":"slashing","extra":"1d8","extraType":"acid","d":"reach 10 ft"},{"n":"Acid Breath","kind":"save","save":{"ability":"DEX","dc":18},"rech":5,"d":"Dexterity Saving Throw: DC 18, each creature in an 60-foot-long, 5-footwide Line. Failure: 54 (12d8) Acid damage. Success: Half damage."},{"n":"Slowing Breath","kind":"save","save":{"ability":"CON","dc":18},"d":"Constitution Saving Throw: DC 18, each creature in a 60-foot Cone. Failure: The target can't take Reactions; its Speed is halved; and it can take either an action or a Bonus Action on its turn, not both. This effect lasts until the end of its next turn."},{"n":"Spellcasting","kind":"text","conc":true,"d":"The dragon casts one of the following spells, requiring no Material components and using Charisma as the spellcasting ability (spell save DC 17): At Will: Detect Magic, Mind Spike (level 4 version), Minor Illusion, Shapechange (Beast or Humanoid form only, no Temporary Hit Points gained from the spell, and no Concentration or Temporary Hit Points required to maintain the spell) 1/Day Each: Greater Restoration, Major Image"}],"legendary":{"count":3,"options":[{"n":"Giggling Magic","d":"Charisma Saving Throw: DC 17, one creature the dragon can see within 90 feet. Failure: 24 (7d6) Psychic damage. Until the end of its next turn, the target rolls 1d6 whenever it makes an ability check or attack roll and subtracts the number rolled from the D20 Test. Failure or Success: The dragon can't take this action again until the start of its next turn."},{"n":"Mind Jolt","d":"The dragon uses Spellcasting to cast Mind Spike (level 4 version). The dragon can't take this action again until the start of its next turn."},{"n":"Pounce","d":"The dragon moves up to half its Speed, and it makes one Rend attack."}]},"legRes":3},{"name":"Adult Gold Dragon","cr":"17","cat":"dragon","ac":19,"hp":243,"hpF":"18d12+126","spd":"40 ft., Fly 80 ft., Swim 40 ft.","mods":{"str":8,"dex":2,"con":7,"int":3,"wis":2,"cha":7},"saves":{"dex":8,"wis":8},"immune":["fire"],"traits":[{"n":"Amphibious","d":"The dragon can breathe air and water."},{"n":"Legendary Resistance (3/Day, or 4/Day in Lair)","d":"If the dragon fails a saving throw, it can choose to succeed instead."}],"multi":"The dragon makes three Rend attacks. It can replace one attack with a use of (A) Spellcasting to cast Guiding Bolt (level 2 version) or (B) Weakening Breath.","actions":[{"n":"Rend","kind":"atk","hit":14,"dmg":"2d8+8","dtype":"slashing","extra":"1d8","extraType":"fire","d":"reach 10 ft"},{"n":"Fire Breath","kind":"save","save":{"ability":"DEX","dc":21},"rech":5,"d":"Dexterity Saving Throw: DC 21, each creature in a 60-foot Cone. Failure: 66 (12d10) Fire damage. Success: Half damage."},{"n":"Spellcasting","kind":"text","conc":true,"d":"The dragon casts one of the following spells, requiring no Material components and using Charisma as the spellcasting ability (spell save DC 21, +13 to hit with spell attacks): At Will: Detect Magic, Guiding Bolt (level 2 version), Shapechange (Beast or Humanoid form only, no Temporary Hit Points gained from the spell, and no Concentration or Temporary Hit Points required to maintain the spell)"},{"n":"Weakening Breath","kind":"save","save":{"ability":"STR","dc":21},"d":"Strength Saving Throw: DC 21, each creature that isn't currently affected by this breath in a 60-foot Cone. Failure: The target has Disadvantage on Strength-based D20 Tests and subtracts 3 (1d6) from its damage rolls. It repeats the save at the end of each of its turns, ending the effect on itself on a success. After 1 minute, it succeeds automatically."}],"legendary":{"count":3,"options":[{"n":"Banish","d":"Charisma Saving Throw: DC 21, one creature the dragon can see within 120 feet. Failure: 10 (3d6) Force damage, and the target has the Incapacitated condition and is transported to a harmless demiplane until the start of the dragon's next turn, at which point it re appears in an unoccupied space of the dragon's choice within 120 feet of the dragon. Failure or Success: The dragon can't take this action again until the start of its next turn."},{"n":"Guiding Light","d":"The dragon uses Spellcasting to cast Guiding Bolt (level 2 version)."},{"n":"Pounce","d":"The dragon moves up to half its Speed, and it makes one Rend attack."}]},"legRes":3},{"name":"Adult Green Dragon","cr":"15","cat":"dragon","ac":19,"hp":207,"hpF":"18d12+90","spd":"40 ft., Fly 80 ft., Swim 40 ft.","mods":{"str":6,"dex":1,"con":5,"int":4,"wis":2,"cha":4},"saves":{"dex":6,"wis":7},"immune":["poison"],"condImmune":["Poisoned"],"traits":[{"n":"Amphibious","d":"The dragon can breathe air and water."},{"n":"Legendary Resistance (3/Day, or 4/Day in Lair)","d":"If the dragon fails a saving throw, it can choose to succeed instead."}],"multi":"The dragon makes three Rend attacks. It can replace one attack with a use of Spellcasting to cast Mind Spike (level 3 version).","actions":[{"n":"Rend","kind":"atk","hit":11,"dmg":"2d8+6","dtype":"slashing","extra":"2d6","extraType":"poison","d":"reach 10 ft"},{"n":"Poison Breath","kind":"save","save":{"ability":"CON","dc":18},"rech":5,"d":"Constitution Saving Throw: DC 18, each creature in a 60-foot Cone. Failure: 56 (16d6) Poison damage. Success: Half damage."},{"n":"Spellcasting","kind":"text","d":"The dragon casts one of the following spells, requiring no Material components and using Charisma as the spellcasting ability (spell save DC 17): At Will: Detect Magic, Mind Spike (level 3 version)"}],"legendary":{"count":3,"options":[{"n":"Mind Invasion","d":"The dragon uses Spellcasting to cast Mind Spike (level 3 version). 294 System Reference Document 5.2.1"},{"n":"Noxious Miasma","d":"Constitution Saving Throw: DC 17, each creature in a 20-foot-radius Sphere centered on a point the dragon can see within 90 feet. Failure: 7 (2d6) Poison damage, and the target takes a -2 penalty to AC until the end of its next turn. Failure or Success: The dragon can't take this action again until the start of its next turn."},{"n":"Pounce","d":"The dragon moves up to half its Speed, and it makes one Rend attack."}]},"legRes":3},{"name":"Adult Red Dragon","cr":"17","cat":"dragon","ac":19,"hp":256,"hpF":"19d12+133","spd":"40 ft., Climb 40 ft., Fly 80 ft.","mods":{"str":8,"dex":0,"con":7,"int":3,"wis":1,"cha":6},"saves":{"dex":6,"wis":7},"immune":["fire"],"traits":[{"n":"Legendary Resistance (3/Day, or 4/Day in Lair)","d":"If the dragon fails a saving throw, it can choose to succeed instead."}],"multi":"The dragon makes three Rend attacks. It can replace one attack with a use of Spellcasting to cast Scorching Ray.","actions":[{"n":"Rend","kind":"atk","hit":14,"dmg":"1d10+8","dtype":"slashing","extra":"2d4","extraType":"fire","d":"reach 10 ft"},{"n":"Fire Breath","kind":"save","save":{"ability":"DEX","dc":21},"rech":5,"d":"Dexterity Saving Throw: DC 21, each creature in a 60-foot Cone. Failure: 59 (17d6) Fire damage. Success: Half damage."},{"n":"Spellcasting","kind":"text","d":"The dragon casts one of the following spells, requiring no Material components and using Charisma as the spellcasting ability (spell save DC 20, +12 to hit with spell attacks): At Will: Command (level 2 version), Detect Magic, Scorching Ray"}],"legendary":{"count":3,"options":[{"n":"Commanding Presence","d":"The dragon uses Spellcasting to cast Command (level 2 version). The dragon can't take this action again until the start of its next turn."},{"n":"Fiery Rays","d":"The dragon uses Spellcasting to cast Scorching Ray. The dragon can't take this action again until the start of its next turn."},{"n":"Pounce","d":"The dragon moves up to half its Speed, and it makes one Rend attack."}]},"legRes":3},{"name":"Adult Silver Dragon","cr":"16","cat":"dragon","ac":19,"hp":216,"hpF":"16d12+112","spd":"40 ft., Fly 80 ft.","mods":{"str":8,"dex":0,"con":7,"int":3,"wis":1,"cha":6},"saves":{"dex":5,"wis":6},"immune":["cold"],"traits":[{"n":"Legendary Resistance (3/Day, or 4/Day in Lair)","d":"If the dragon fails a saving throw, it can choose to succeed instead."}],"multi":"The dragon makes three Rend attacks. It can replace one attack with a use of (A) Paralyzing Breath or (B) Spellcasting to cast Ice Knife.","actions":[{"n":"Rend","kind":"atk","hit":13,"dmg":"2d8+8","dtype":"slashing","extra":"1d8","extraType":"cold","d":"reach 10 ft"},{"n":"Cold Breath","kind":"save","save":{"ability":"CON","dc":20},"rech":5,"d":"Constitution Saving Throw: DC 20, each creature in a 60-foot Cone. Failure: 54 (12d8) Cold damage. Success: Half damage."},{"n":"Paralyzing Breath","kind":"save","save":{"ability":"CON","dc":20},"d":"Constitution Saving Throw: DC 20, each creature in a 60-foot Cone. First Failure: The target has the Incapacitated condition until the end of its next turn, when it repeats the save. Second Failure: The target has the Paralyzed condition, and it repeats the save at the end of each of its turns, ending the effect on itself on a success. After 1 minute, it succeeds automatically."},{"n":"Spellcasting","kind":"text","conc":true,"d":"The dragon casts one of the following spells, requiring no Material components and using Charisma as the spellcasting ability (spell save DC 19, +11 to hit with spell attacks): At Will: Detect Magic, Hold Monster, Ice Knife, Shapechange (Beast or Humanoid form only, no Temporary Hit Points gained from the spell, and no Concentration or Temporary Hit Points required to maintain the spell) 1/Day Each: Ice Storm (level 5 version), Zone of Truth"}],"legendary":{"count":3,"options":[{"n":"Chill","d":"The dragon uses Spellcasting to cast Hold Monster. The dragon can't take this action again until the start of its next turn."},{"n":"Cold Gale","d":"Dexterity Saving Throw: DC 19, each creature in a 60-foot-long, 10-foot-wide Line. Failure: 14 (4d6) Cold damage, and the target is pushed up to 30 feet straight away from the dragon. Success: Half damage only. Failure or Success: The dragon can't take this action again until the start of its next turn."},{"n":"Pounce","d":"The dragon moves up to half its Speed, and it makes one Rend attack."}]},"legRes":3},{"name":"Adult White Dragon","cr":"13","cat":"dragon","ac":18,"hp":200,"hpF":"16d12+96","spd":"40 ft., Burrow 30 ft., Fly 80 ft., Swim 40 ft.","mods":{"str":6,"dex":0,"con":6,"int":-1,"wis":1,"cha":1},"saves":{"dex":5,"wis":6},"immune":["cold"],"traits":[{"n":"Ice Walk","d":"The dragon can move across and climb icy surfaces without needing to make an ability check. Additionally, Difficult Terrain composed of ice or snow doesn't cost it extra movement."},{"n":"Legendary Resistance (3/Day, or 4/Day in Lair)","d":"If the dragon fails a saving throw, it can choose to succeed instead."}],"multi":"The dragon makes three Rend attacks.","actions":[{"n":"Rend","kind":"atk","hit":11,"dmg":"2d6+6","dtype":"slashing","extra":"1d8","extraType":"cold","d":"reach 10 ft"},{"n":"Cold Breath","kind":"save","save":{"ability":"CON","dc":19},"rech":5,"d":"Constitution Saving Throw: DC 19, each creature in a 60-foot Cone. Failure: 54 (12d8) Cold damage. Success: Half damage."}],"legendary":{"count":3,"options":[{"n":"Freezing Burst","d":"Constitution Saving Throw: DC 14, each creature in a 30-foot-radius Sphere centered on a point the dragon can see within 120 feet. Failure: 7 (2d6) Cold damage, and the target's Speed is 0 until the end of the target's next turn. Failure or Success: The dragon can't take this action again until the start of its next turn."},{"n":"Frightful Presence","d":"The dragon casts Fear, requiring no Material components and using Charisma as the spellcasting ability (spell save DC 14). The dragon can't take this action again until the start of its next turn."},{"n":"Pounce","d":"The dragon moves up to half its Speed, and it makes one Rend attack."}]},"legRes":3},{"name":"Ancient Black Dragon","cr":"21","cat":"dragon","ac":22,"hp":367,"hpF":"21d20+147","spd":"40 ft., Fly 80 ft., Swim 40 ft.","mods":{"str":8,"dex":2,"con":7,"int":3,"wis":2,"cha":6},"saves":{"dex":9,"wis":9},"immune":["acid"],"traits":[{"n":"Amphibious","d":"The dragon can breathe air and water."},{"n":"Legendary Resistance (4/Day, or 5/Day in Lair)","d":"If the dragon fails a saving throw, it can choose to succeed instead."}],"multi":"The dragon makes three Rend attacks. It can replace one attack with a use of Spellcasting to cast Acid Arrow (level 4 version).","actions":[{"n":"Rend","kind":"atk","hit":15,"dmg":"2d8+8","dtype":"slashing","extra":"2d8","extraType":"acid","d":"reach 15 ft"},{"n":"Acid Breath","kind":"save","save":{"ability":"DEX","dc":22},"rech":5,"d":"Dexterity Saving Throw: DC 22, each creature in a 90-foot-long, 10-footwide Line. Failure: 67 (15d8) Acid damage. Success: Half damage."},{"n":"Spellcasting","kind":"text","d":"The dragon casts one of the following spells, requiring no Material components and using Charisma as the spellcasting ability (spell save DC 21, +13 to hit with spell attacks): At Will: Acid Arrow (level 4 version), Detect Magic, Fear 1/Day Each: Create Undead, Speak with Dead, Vitriolic Sphere (level 5 version)"}],"legendary":{"count":3,"options":[{"n":"Cloud of Insects","d":"Dexterity Saving Throw: DC 21, one creature the dragon can see within 120 feet. Failure: 33 (6d10) Poison damage, and the target has Disadvantage on saving throws to maintain Concentration until the end of its next turn. Failure or Success: The dragon can't take this action again until the start of its next turn."},{"n":"Frightful Presence","d":"The dragon uses Spellcasting to cast Fear. The dragon can't take this action again until the start of its next turn. 265 System Reference Document 5.2.1"},{"n":"Pounce","d":"The dragon moves up to half its Speed, and it makes one Rend attack."}]},"legRes":4},{"name":"Ancient Blue Dragon","cr":"23","cat":"dragon","ac":22,"hp":481,"hpF":"26d20+208","spd":"40 ft., Burrow 40 ft., Fly 80 ft.","mods":{"str":9,"dex":0,"con":8,"int":4,"wis":3,"cha":7},"saves":{"dex":7,"wis":10},"immune":["lightning"],"traits":[{"n":"Legendary Resistance (4/Day, or 5/Day in Lair)","d":"If the dragon fails a saving throw, it can choose to succeed instead."}],"multi":"The dragon makes three Rend attacks. It can replace one attack with a use of Spellcasting to cast Shatter (level 3 version).","actions":[{"n":"Rend","kind":"atk","hit":16,"dmg":"2d8+9","dtype":"slashing","extra":"2d10","extraType":"lightning","d":"reach 15 ft"},{"n":"Lightning Breath","kind":"save","save":{"ability":"DEX","dc":23},"rech":5,"d":"Dexterity Saving Throw: DC 23, each creature in a 120-foot-long, 10-foot-wide Line. Failure: 88 (16d10) Lightning damage. Success: Half damage. 267 System Reference Document 5.2.1"},{"n":"Spellcasting","kind":"text","d":"The dragon casts one of the following spells, requiring no Material components and using Charisma as the spellcasting ability (spell save DC 22): At Will: Detect Magic, Invisibility, Mage Hand, Shatter (level 3 version)"}],"legendary":{"count":3,"options":[{"n":"Cloaked Flight","d":"The dragon uses Spellcasting to cast Invisibility on itself, and it can fly up to half its Fly Speed. The dragon can't take this action again until the start of its next turn."},{"n":"Sonic Boom","d":"The dragon uses Spellcasting to cast Shatter (level 3 version). The dragon can't take this action again until the start of its next turn."},{"n":"Tail Swipe","d":"The dragon makes one Rend attack."}]},"legRes":4},{"name":"Ancient Brass Dragon","cr":"20","cat":"dragon","ac":20,"hp":332,"hpF":"19d20+133","spd":"40 ft., Burrow 40 ft., Fly 80 ft.","mods":{"str":8,"dex":0,"con":7,"int":3,"wis":2,"cha":6},"saves":{"dex":6,"wis":8},"immune":["fire"],"traits":[{"n":"Legendary Resistance (4/Day, or 5/Day in Lair)","d":"If the dragon fails a saving throw, it can choose to succeed instead."}],"multi":"The dragon makes three Rend attacks. It can replace one attack with a use of (A) Sleep Breath or (B) Spellcasting to cast Scorching Ray (level 3 version).","actions":[{"n":"Rend","kind":"atk","hit":14,"dmg":"2d10+8","dtype":"slashing","extra":"2d6","extraType":"fire","d":"reach 15 ft. 269 System Reference Document 5.2.1"},{"n":"Fire Breath","kind":"save","save":{"ability":"DEX","dc":21},"rech":5,"d":"Dexterity Saving Throw: DC 21, each creature in a 90-foot-long, 5-footwide Line. Failure: 58 (13d8) Fire damage. Success: Half damage."},{"n":"Sleep Breath","kind":"save","save":{"ability":"CON","dc":21},"d":"Constitution Saving Throw: DC 21, each creature in a 90-foot Cone. Failure: The target has the Incapacitated condition until the end of its next turn, at which point it repeats the save. Second Failure: The target has the Unconscious condition for 10 minutes. This effect ends for the target if it takes damage or a creature within 5 feet of it takes an action to wake it."},{"n":"Spellcasting","kind":"text","conc":true,"d":"The dragon casts one of the following spells, requiring no Material components and using Charisma as the spellcasting ability (spell save DC 20): At Will: Detect Magic, Minor Illusion, Scorching Ray (level 3 version), Shapechange (Beast or Humanoid form only, no Temporary Hit Points gained from the spell, and no Concentration or Temporary Hit Points required to maintain the spell), Speak with Animals 1/Day Each: Control Weather, Detect Thoughts"}],"legendary":{"count":3,"options":[{"n":"Blazing Light","d":"The dragon uses Spellcasting to cast Scorching Ray (level 3 version)."},{"n":"Pounce","d":"The dragon moves up to half its Speed, and it makes one Rend attack."},{"n":"Scorching Sands","d":"Dexterity Saving Throw: DC 20, one creature the dragon can see within 120 feet. Failure: 36 (8d8) Fire damage, and the target's Speed is halved until the end of its next turn. Failure or Success: The dragon can't take this action again until the start of its next turn."}]},"legRes":4},{"name":"Ancient Bronze Dragon","cr":"22","cat":"dragon","ac":22,"hp":444,"hpF":"24d20+192","spd":"40 ft., Fly 80 ft., Swim 40 ft.","mods":{"str":9,"dex":0,"con":8,"int":4,"wis":3,"cha":7},"saves":{"dex":7,"wis":10},"immune":["lightning"],"traits":[{"n":"Amphibious","d":"The dragon can breathe air and water."},{"n":"Legendary Resistance (4/Day, or 5/Day in Lair)","d":"If the dragon fails a saving throw, it can choose to succeed instead."}],"multi":"The dragon makes three Rend attacks. It can replace one attack with a use of (A) Repulsion Breath or (B) Spellcasting to cast Guiding Bolt (level 2 version).","actions":[{"n":"Rend","kind":"atk","hit":16,"dmg":"2d8+9","dtype":"slashing","extra":"2d8","extraType":"lightning","d":"reach 15 ft"},{"n":"Lightning Breath","kind":"save","save":{"ability":"DEX","dc":23},"rech":5,"d":"Dexterity Saving Throw: DC 23, each creature in a 120-foot-long, 10-foot-wide Line. Failure: 82 (15d10) Lightning damage. Success: Half damage."},{"n":"Repulsion Breath","kind":"save","save":{"ability":"STR","dc":23},"d":"Strength Saving Throw: DC 23, each creature in a 30-foot Cone. Failure: The target is pushed up to 60 feet straight away from the dragon and has the Prone condition."},{"n":"Spellcasting","kind":"text","conc":true,"d":"The dragon casts one of the following spells, requiring no Material components and using Charisma as the spellcasting ability (spell save DC 22, +14 to hit with spell attacks): At Will: Detect Magic, Guiding Bolt (level 2 version), Shapechange (Beast or Humanoid form only, no Temporary Hit Points gained from the spell, and no Concentration or Temporary Hit Points required to maintain the spell), Speak with Animals, Thaumaturgy 1/Day Each: Detect Thoughts, Control Water, Scrying, Water Breathing 271 System Reference Document 5.2.1"}],"legendary":{"count":3,"options":[{"n":"Guiding Light","d":"The dragon uses Spellcasting to cast Guiding Bolt (level 2 version)."},{"n":"Pounce","d":"The dragon moves up to half its Speed, and it makes one Rend attack."},{"n":"Thunderclap","d":"Constitution Saving Throw: DC 22, each creature in a 20-foot-radius Sphere centered on a point the dragon can see within 120 feet. Failure: 13 (3d8) Thunder damage, and the target has the Deafened condition until the end of its next turn."}]},"legRes":4},{"name":"Ancient Copper Dragon","cr":"21","cat":"dragon","ac":21,"hp":367,"hpF":"21d20+147","spd":"40 ft., Climb 40 ft., Fly 80 ft.","mods":{"str":8,"dex":1,"con":7,"int":5,"wis":3,"cha":6},"saves":{"dex":8,"wis":10},"immune":["acid"],"traits":[{"n":"Legendary Resistance (4/Day, or 5/Day in Lair)","d":"If the dragon fails a saving throw, it can choose to succeed instead."}],"multi":"The dragon makes three Rend attacks. It can replace one attack with a use of (A) Slowing Breath or (B) Spellcasting to cast Mind Spike (level 5 version).","actions":[{"n":"Rend","kind":"atk","hit":15,"dmg":"2d10+8","dtype":"slashing","extra":"2d8","extraType":"acid","d":"reach 15 ft"},{"n":"Acid Breath","kind":"save","save":{"ability":"DEX","dc":22},"rech":5,"d":"Dexterity Saving Throw: DC 22, each creature in an 90-foot-long, 10-footwide Line. Failure: 63 (14d8) Acid damage. Success: Half damage."},{"n":"Slowing Breath","kind":"save","save":{"ability":"CON","dc":22},"d":"Constitution Saving Throw: DC 22, each creature in a 90-foot Cone. Failure: The target can't take Reactions; its Speed is halved; and it can take either an action or a Bonus Action on its turn, not both. This effect lasts until the end of its next turn."},{"n":"Spellcasting","kind":"text","conc":true,"d":"The dragon casts one of the following spells, requiring no Material components and using Charisma as the spellcasting ability (spell save DC 21): At Will: Detect Magic, Mind Spike (level 5 version), Minor Illusion, Shapechange (Beast or Humanoid form only, no Temporary Hit Points gained from the spell, and no Concentration or Temporary Hit Points required to maintain the spell) 1/Day Each: Greater Restoration, Major Image, Project Image 277 System Reference Document 5.2.1"}],"legendary":{"count":3,"options":[{"n":"Giggling Magic","d":"Charisma Saving Throw: DC 21, one creature the dragon can see within 120 feet. Failure: 31 (9d6) Psychic damage. Until the end of its next turn, the target rolls 1d8 whenever it makes an ability check or attack roll and subtracts the number rolled from the D20 Test. Failure or Success: The dragon can't take this action again until the start of its next turn."},{"n":"Mind Jolt","d":"The dragon uses Spellcasting to cast Mind Spike (level 5 version). The dragon can't take this action again until the start of its next turn."},{"n":"Pounce","d":"The dragon moves up to half its Speed, and it makes one Rend attack."}]},"legRes":4},{"name":"Ancient Gold Dragon","cr":"24","cat":"dragon","ac":22,"hp":546,"hpF":"28d20+252","spd":"40 ft., Fly 80 ft., Swim 40 ft.","mods":{"str":10,"dex":2,"con":9,"int":4,"wis":3,"cha":9},"saves":{"dex":9,"wis":10},"immune":["fire"],"traits":[{"n":"Amphibious","d":"The dragon can breathe air and water."},{"n":"Legendary Resistance (4/Day, or 5/Day in Lair)","d":"If the dragon fails a saving throw, it can choose to succeed instead."}],"multi":"The dragon makes three Rend attacks. It can replace one attack with a use of (A) Spellcasting to cast Guiding Bolt (level 4 version) or (B) Weakening Breath.","actions":[{"n":"Rend","kind":"atk","hit":17,"dmg":"2d8+10","dtype":"slashing","extra":"2d8","extraType":"fire","d":"to hit, reach 15 ft"},{"n":"Fire Breath","kind":"save","save":{"ability":"DEX","dc":24},"rech":5,"d":"Dexterity Saving Throw: DC 24, each creature in a 90-foot Cone. Failure: 71 (13d10) Fire damage. Success: Half damage."},{"n":"Spellcasting","kind":"text","conc":true,"d":"The dragon casts one of the following spells, requiring no Material components and using 292 System Reference Document 5.2.1 Charisma as the spellcasting ability (spell save DC 24, +16 to hit with spell attacks): At Will: Detect Magic, Guiding Bolt (level 4 version), Shapechange (Beast or Humanoid form only, no Temporary Hit Points gained from the spell, and no Concentration or Temporary Hit Points required to maintain the spell) 1/Day Each: Flame Strike (level 6 version), Word of Recall, Zone of Truth"},{"n":"Weakening Breath","kind":"save","save":{"ability":"STR","dc":24},"d":"Strength Saving Throw: DC 24, each creature that isn't currently affected by this breath in a 90-foot Cone. Failure: The target has Disadvantage on Strength-based D20 Tests and subtracts 5 (1d10) from its damage rolls. It repeats the save at the end of each of its turns, ending the effect on itself on a success. After 1 minute, it succeeds automatically."}],"legendary":{"count":3,"options":[{"n":"Banish","d":"Charisma Saving Throw: DC 24, one creature the dragon can see within 120 feet. Failure: 24 (7d6) Force damage, and the target has the Incapacitated condition and is transported to a harmless demiplane until the start of the dragon's next turn, at which point it reappears in an unoccupied space of the dragon's choice within 120 feet of the dragon. Failure or Success: The dragon can't take this action again until the start of its next turn."},{"n":"Guiding Light","d":"The dragon uses Spellcasting to cast Guiding Bolt (level 4 version)."},{"n":"Pounce","d":"The dragon moves up to half its Speed, and it makes one Rend attack."}]},"legRes":4},{"name":"Ancient Green Dragon","cr":"22","cat":"dragon","ac":21,"hp":402,"hpF":"23d20+161","spd":"40 ft., Fly 80 ft., Swim 40 ft.","mods":{"str":8,"dex":1,"con":7,"int":5,"wis":3,"cha":6},"saves":{"dex":8,"wis":10},"immune":["poison"],"condImmune":["Poisoned"],"traits":[{"n":"Amphibious","d":"The dragon can breathe air and water."},{"n":"Legendary Resistance (4/Day, or 5/Day in Lair)","d":"If the dragon fails a saving throw, it can choose to succeed instead."}],"multi":"The dragon makes three Rend attacks. It can replace one attack with a use of Spellcasting to cast Mind Spike (level 5 version).","actions":[{"n":"Rend","kind":"atk","hit":15,"dmg":"2d8+8","dtype":"slashing","extra":"3d6","extraType":"poison","d":"reach 15 ft"},{"n":"Poison Breath","kind":"save","save":{"ability":"CON","dc":22},"rech":5,"d":"Constitution Saving Throw: DC 22, each creature in a 90-foot Cone. Failure: 77 (22d6) Poison damage. Success: Half damage."},{"n":"Spellcasting","kind":"text","d":"The dragon casts one of the following spells, requiring no Material components and using Charisma as the spellcasting ability (spell save DC 21): At Will: Detect Magic, Mind Spike (level 5 version)"}],"legendary":{"count":3,"options":[{"n":"Mind Invasion","d":"The dragon uses Spellcasting to cast Mind Spike (level 5 version)."},{"n":"Noxious Miasma","d":"Constitution Saving Throw: DC 21, each creature in a 30-foot-radius Sphere centered on a point the dragon can see within 90 feet. Failure: 17 (5d6) Poison damage, and the target takes a -2 penalty to AC until the end of its next turn. Failure or Success: The dragon can't take this action again until the start of its next turn."},{"n":"Pounce","d":"The dragon moves up to half its Speed, and it makes one Rend attack."}]},"legRes":4},{"name":"Ancient Red Dragon","cr":"24","cat":"dragon","ac":22,"hp":507,"hpF":"26d20+234","spd":"40 ft., Climb 40 ft., Fly 80 ft.","mods":{"str":10,"dex":0,"con":9,"int":4,"wis":2,"cha":8},"saves":{"dex":7,"wis":9},"immune":["fire"],"traits":[{"n":"Legendary Resistance (4/Day, or 5/Day in Lair)","d":"If the dragon fails a saving throw, it can choose to succeed instead."}],"multi":"The dragon makes three Rend attacks. It can replace one attack with a use of Spellcasting to cast Scorching Ray (level 3 version).","actions":[{"n":"Rend","kind":"atk","hit":17,"dmg":"2d8+10","dtype":"slashing","extra":"3d6","extraType":"fire","d":"reach 15 ft"},{"n":"Fire Breath","kind":"save","save":{"ability":"DEX","dc":24},"rech":5,"d":"Dexterity Saving Throw: DC 24, each creature in a 90-foot Cone. Failure: 91 (26d6) Fire damage. Success: Half damage. 319 System Reference Document 5.2.1"},{"n":"Spellcasting","kind":"text","d":"The dragon casts one of the following spells, requiring no Material components and using Charisma as the spellcasting ability (spell save DC 23, +15 to hit with spell attacks): At Will: Command (level 2 version), Detect Magic, Scorching Ray (level 3 version) 1/Day Each: Fireball (level 6 version), Scrying"}],"legendary":{"count":3,"options":[{"n":"Commanding Presence","d":"The dragon uses Spellcasting to cast Command (level 2 version). The dragon can't take this action again until the start of its next turn."},{"n":"Fiery Rays","d":"The dragon uses Spellcasting to cast Scorching Ray (level 3 version). The dragon can't take this action again until the start of its next turn."},{"n":"Pounce","d":"The dragon moves up to half its Speed, and it makes one Rend attack."}]},"legRes":4},{"name":"Ancient Silver Dragon","cr":"23","cat":"dragon","ac":22,"hp":468,"hpF":"24d20+216","spd":"40 ft., Fly 80 ft.","mods":{"str":10,"dex":0,"con":9,"int":4,"wis":2,"cha":8},"saves":{"dex":7,"wis":9},"immune":["cold"],"traits":[{"n":"Legendary Resistance (4/Day, or 5/Day in Lair)","d":"If the dragon fails a saving throw, it can choose to succeed instead."}],"multi":"The dragon makes three Rend attacks. It can replace one attack with a use of (A) Paralyzing Breath or (B) Spellcasting to cast Ice Knife (level 2 version).","actions":[{"n":"Rend","kind":"atk","hit":17,"dmg":"2d8+10","dtype":"slashing","extra":"2d8","extraType":"cold","d":"reach 15 ft"},{"n":"Cold Breath","kind":"save","save":{"ability":"CON","dc":24},"rech":5,"d":"Constitution Saving Throw: DC 24, each creature in a 90-foot Cone. Failure: 67 (15d8) Cold damage. Success: Half damage. 325 System Reference Document 5.2.1"},{"n":"Paralyzing Breath","kind":"save","save":{"ability":"CON","dc":24},"d":"Constitution Saving Throw: DC 24, each creature in a 90-foot Cone. First Failure: The target has the Incapacitated condition until the end of its next turn, when it repeats the save. Second Failure: The target has the Paralyzed condition, and it repeats the save at the end of each of its turns, ending the effect on itself on a success. After 1 minute, it succeeds automatically."},{"n":"Spellcasting","kind":"text","conc":true,"d":"The dragon casts one of the following spells, requiring no Material components and using Charisma as the spellcasting ability (spell save DC 23, +15 to hit with spell attacks): At Will: Detect Magic, Hold Monster, Ice Knife (level 2 version), Shapechange (Beast or Humanoid form only, no Temporary Hit Points gained from the spell, and no Concentration or Temporary Hit Points required to maintain the spell) 1/Day Each: Control Weather, Ice Storm (level 7 version), Teleport, Zone of Truth"}],"legendary":{"count":3,"options":[{"n":"Chill","d":"The dragon uses Spellcasting to cast Hold Monster. The dragon can't take this action again until the start of its next turn."},{"n":"Cold Gale","d":"Dexterity Saving Throw: DC 23, each creature in a 60-foot-long, 10-foot-wide Line. Failure: 14 (4d6) Cold damage, and the target is pushed up to 30 feet straight away from the dragon. Success: Half damage only. Failure or Success: The dragon can't take this action again until the start of its next turn."},{"n":"Pounce","d":"The dragon moves up to half its Speed, and it makes one Rend attack."}]},"legRes":4},{"name":"Ancient White Dragon","cr":"20","cat":"dragon","ac":20,"hp":333,"hpF":"18d20+144","spd":"40 ft., Burrow 40 ft., Fly 80 ft., Swim 40 ft.","mods":{"str":8,"dex":0,"con":8,"int":0,"wis":1,"cha":4},"saves":{"dex":6,"wis":7},"immune":["cold"],"traits":[{"n":"Ice Walk","d":"The dragon can move across and climb icy surfaces without needing to make an ability check. Additionally, Difficult Terrain composed of ice or snow doesn't cost it extra movement."},{"n":"Legendary Resistance (4/Day, or 5/Day in Lair)","d":"If the dragon fails a saving throw, it can choose to succeed instead."}],"multi":"The dragon makes three Rend attacks.","actions":[{"n":"Rend","kind":"atk","hit":14,"dmg":"2d8+8","dtype":"slashing","extra":"2d6","extraType":"cold","d":"reach 15 ft"},{"n":"Cold Breath","kind":"save","save":{"ability":"CON","dc":22},"rech":5,"d":"Constitution Saving Throw: DC 22, each creature in a 90-foot Cone. Failure: 63 (14d8) Cold damage. Success: Half damage."}],"legendary":{"count":3,"options":[{"n":"Freezing Burst","d":"Constitution Saving Throw: DC 20, each creature in a 30-foot-radius Sphere centered on a point the dragon can see within 120 feet. Failure: 14 (4d6) Cold damage, and the target's Speed is 0 until the end of the target's next turn. Failure or Success: The dragon can't take this action again until the start of its next turn."},{"n":"Frightful Presence","d":"The dragon casts Fear, requiring no Material components and using Charisma as the spellcasting ability (spell save DC 18). The dragon can't take this action again until the start of its next turn."},{"n":"Pounce","d":"The dragon moves up to half its Speed, and it makes one Rend attack. 341 System Reference Document 5.2.1"}]},"legRes":4},{"name":"Black Dragon Wyrmling","cr":"2","cat":"dragon","ac":17,"hp":33,"hpF":"6d8+6","spd":"30 ft., Fly 60 ft., Swim 30 ft.","mods":{"str":2,"dex":2,"con":1,"int":0,"wis":0,"cha":1},"saves":{"dex":4,"wis":2},"immune":["acid"],"traits":[{"n":"Amphibious","d":"The dragon can breathe air and water."}],"multi":"The dragon makes two Rend attacks.","actions":[{"n":"Rend","kind":"atk","hit":4,"dmg":"1d6+2","dtype":"slashing","extra":"1d4","extraType":"acid","d":"reach 5 ft"},{"n":"Acid Breath","kind":"save","save":{"ability":"DEX","dc":11},"rech":5,"d":"Dexterity Saving Throw: DC 11, each creature in a 15-foot-long, 5-footwide Line. Failure: 22 (5d8) Acid damage. Success: Half damage."}]},{"name":"Blue Dragon Wyrmling","cr":"3","cat":"dragon","ac":17,"hp":65,"hpF":"10d8+20","spd":"30 ft., Burrow 15 ft., Fly 60 ft.","mods":{"str":3,"dex":0,"con":2,"int":1,"wis":0,"cha":2},"saves":{"dex":2,"wis":2},"immune":["lightning"],"multi":"The dragon makes two Rend attacks.","actions":[{"n":"Rend","kind":"atk","hit":5,"dmg":"1d10+3","dtype":"slashing","extra":"1d6","extraType":"lightning","d":"reach 5 ft"},{"n":"Lightning Breath","kind":"save","save":{"ability":"DEX","dc":12},"rech":5,"d":"Dexterity Saving Throw: DC 12, each creature in a 30-foot-long, 5-footwide Line. Failure: 21 (6d6) Lightning damage. Success: Half damage. 266 System Reference Document 5.2.1"}]},{"name":"Brass Dragon Wyrmling","cr":"1","cat":"dragon","ac":15,"hp":22,"hpF":"4d8+4","spd":"30 ft., Burrow 15 ft., Fly 60 ft.","mods":{"str":2,"dex":0,"con":1,"int":0,"wis":0,"cha":1},"saves":{"dex":2,"wis":2},"immune":["fire"],"actions":[{"n":"Rend","kind":"atk","hit":4,"dmg":"1d10+2","dtype":"slashing","d":"reach 5 ft"},{"n":"Fire Breath","kind":"save","save":{"ability":"DEX","dc":11},"rech":5,"d":"Dexterity Saving Throw: DC 11, each creature in a 20-foot-long, 5-footwide Line. Failure: 14 (4d6) Fire damage. Success: Half damage."},{"n":"Sleep Breath","kind":"save","save":{"ability":"CON","dc":11},"d":"Constitution Saving Throw: DC 11, each creature in a 15-foot Cone. Failure: The target has the Incapacitated condition until the end of its next turn, at which point it repeats the save. Second Failure: The target has the Unconscious condition for 1 minute. This effect ends for the target if it takes damage or a creature within 5 feet of it takes an action to wake it."}]},{"name":"Bronze Dragon Wyrmling","cr":"2","cat":"dragon","ac":15,"hp":39,"hpF":"6d8+12","spd":"30 ft., Fly 60 ft., Swim 30 ft.","mods":{"str":3,"dex":0,"con":2,"int":1,"wis":0,"cha":2},"saves":{"dex":2,"wis":2},"immune":["lightning"],"traits":[{"n":"Amphibious","d":"The dragon can breathe air and water."}],"multi":"The dragon makes two Rend attacks.","actions":[{"n":"Rend","kind":"atk","hit":5,"dmg":"1d10+3","dtype":"slashing","d":"reach 5 ft"},{"n":"Lightning Breath","kind":"save","save":{"ability":"DEX","dc":12},"rech":5,"d":"Dexterity Saving Throw: DC 12, each creature in a 40-foot-long, 5-footwide Line. Failure: 16 (3d10) Lightning damage. Success: Half damage."},{"n":"Repulsion Breath","kind":"save","save":{"ability":"STR","dc":12},"d":"Strength Saving Throw: DC 12, each creature in a 30-foot Cone. Failure: The target is pushed up to 30 feet straight away from the dragon and has the Prone condition."}]},{"name":"Copper Dragon Wyrmling","cr":"1","cat":"dragon","ac":16,"hp":22,"hpF":"4d8+4","spd":"30 ft., Climb 30 ft., Fly 60 ft.","mods":{"str":2,"dex":1,"con":1,"int":2,"wis":0,"cha":1},"saves":{"dex":3,"wis":2},"immune":["acid"],"actions":[{"n":"Rend","kind":"atk","hit":4,"dmg":"1d10+2","dtype":"slashing","d":"reach 5 ft"},{"n":"Acid Breath","kind":"save","save":{"ability":"DEX","dc":11},"rech":5,"d":"Dexterity Saving Throw: DC 11, each creature in a 20-foot-long, 5-footwide Line. Failure: 18 (4d8) Acid damage. Success: Half damage."},{"n":"Slowing Breath","kind":"save","save":{"ability":"CON","dc":11},"d":"Constitution Saving Throw: DC 11, each creature in a 15-foot Cone. Failure: The target can't take Reactions; its Speed is halved; and it can take either an action or a Bonus Action on its turn, not both. This effect lasts until the end of its next turn."}]},{"name":"Dragon Turtle","cr":"17","cat":"dragon","ac":20,"hp":356,"hpF":"23d20+115","spd":"20 ft., Swim 50 ft.","mods":{"str":7,"dex":0,"con":5,"int":0,"wis":1,"cha":1},"saves":{"con":11,"wis":7},"resist":["fire"],"traits":[{"n":"Amphibious","d":"The dragon can breathe air and water."}],"multi":"The dragon makes three Bite attacks. It can replace one attack with a Tail attack.","actions":[{"n":"Bite","kind":"atk","hit":13,"dmg":"3d10+7","dtype":"piercing","extra":"2d6","extraType":"fire","d":"reach 15 ft. Being underwater doesn't grant Resistance to this Fire damage."},{"n":"Tail","kind":"atk","hit":13,"dmg":"2d10+7","dtype":"bludgeoning","d":"reach 15 ft. If the target is a Huge or smaller creature, it has the Prone condition."},{"n":"Steam Breath","kind":"save","save":{"ability":"CON","dc":19},"rech":5,"d":"Constitution Saving Throw: DC 19, each creature in a 60-foot Cone. Failure: 56 (16d6) Fire damage. Success: Half damage. Failure or Success: Being underwater doesn't grant Resistance to this Fire damage."}]},{"name":"Gold Dragon Wyrmling","cr":"3","cat":"dragon","ac":17,"hp":60,"hpF":"8d8+24","spd":"30 ft., Fly 60 ft., Swim 30 ft.","mods":{"str":4,"dex":2,"con":3,"int":2,"wis":0,"cha":3},"saves":{"dex":4,"wis":2},"immune":["fire"],"traits":[{"n":"Amphibious","d":"The dragon can breathe air and water."}],"multi":"The dragon makes two Rend attacks.","actions":[{"n":"Rend","kind":"atk","hit":6,"dmg":"1d10+4","dtype":"slashing","d":"reach 5 ft"},{"n":"Fire Breath","kind":"save","save":{"ability":"DEX","dc":13},"rech":5,"d":"Dexterity Saving Throw: DC 13, each creature in a 15-foot Cone. Failure: 22 (4d10) Fire damage. Success: Half damage."},{"n":"Weakening Breath","kind":"save","save":{"ability":"STR","dc":13},"d":"Strength Saving Throw: DC 13, each creature that isn't currently affected by this breath in a 15-foot Cone. Failure: The target has Disadvantage on Strength-based D20 Tests and subtracts 2 (1d4) from its damage rolls. It repeats the save at the end of each of its turns, ending the effect on itself on a success. After 1 minute, it succeeds automatically."}]},{"name":"Green Dragon Wyrmling","cr":"2","cat":"dragon","ac":17,"hp":38,"hpF":"7d8+7","spd":"30 ft., Fly 60 ft., Swim 30 ft.","mods":{"str":2,"dex":1,"con":1,"int":2,"wis":0,"cha":1},"saves":{"dex":3,"wis":2},"immune":["poison"],"condImmune":["Poisoned"],"traits":[{"n":"Amphibious","d":"The dragon can breathe air and water."}],"multi":"The dragon makes two Rend attacks.","actions":[{"n":"Rend","kind":"atk","hit":4,"dmg":"1d10+2","dtype":"slashing","extra":"1d6","extraType":"poison","d":"reach 5 ft"},{"n":"Poison Breath","kind":"save","save":{"ability":"CON","dc":11},"rech":5,"d":"Constitution Saving Throw: DC 11, each creature in a 15-foot Cone. Failure: 21 (6d6) Poison damage. Success: Half damage."}]},{"name":"Half-Dragon","cr":"5","cat":"dragon","ac":18,"hp":105,"hpF":"14d8+42","spd":"40 ft.","mods":{"str":4,"dex":2,"con":3,"int":0,"wis":2,"cha":2},"saves":{"dex":5,"wis":5},"traits":[{"n":"Draconic Origin","d":"The half-dragon is related to a type of dragon associated with one of the following damage types (GM's choice): Acid, Cold, Fire, Lightning, or Poison. This choice affects other aspects of the stat block."}],"multi":"The half-dragon makes two Claw attacks.","actions":[{"n":"Claw","kind":"atk","hit":7,"dmg":"1d4+4","dtype":"slashing","d":"reach 10 ft. plus 7 (2d6) damage of the type chosen for the Draconic Origin trait."},{"n":"Dragon's Breath","kind":"save","save":{"ability":"DEX","dc":14},"rech":5,"d":"Dexterity Saving Throw: DC 14, each creature in a 30-foot Cone. Failure: 28 (8d6) damage of the type chosen for the Draconic Origin trait. Success: Half damage."}],"bonus":[{"n":"Leap","d":"The half-dragon jumps up to 30 feet by spending 10 feet of movement."}]},{"name":"Pseudodragon","cr":"1/4","cat":"dragon","ac":14,"hp":10,"hpF":"3d4+3","spd":"15 ft., Fly 60 ft.","mods":{"str":-2,"dex":2,"con":1,"int":0,"wis":1,"cha":0},"traits":[{"n":"Magic Resistance","d":"The pseudodragon has Advantage on saving throws against spells and other magical effects."}],"multi":"The pseudodragon makes two Bite attacks.","actions":[{"n":"Bite","kind":"atk","hit":4,"dmg":"1d4+2","dtype":"piercing","d":"reach 5 ft"},{"n":"Sting","kind":"save","save":{"ability":"CON","dc":12},"d":"Constitution Saving Throw: DC 12, one creature the pseudodragon can see within 5 feet. Failure: 5 (2d4) Poison damage, and the target has the Poisoned condition for 1 hour. Failure by 5 or More: While Poisoned, the target also has the Unconscious condition, which ends early if the target takes damage or a creature within 5 feet of it takes an action to wake it."}]},{"name":"Red Dragon Wyrmling","cr":"4","cat":"dragon","ac":17,"hp":75,"hpF":"10d8+30","spd":"30 ft., Climb 30 ft., Fly 60 ft.","mods":{"str":4,"dex":0,"con":3,"int":1,"wis":0,"cha":2},"saves":{"dex":2,"wis":2},"immune":["fire"],"multi":"The dragon makes two Rend attacks.","actions":[{"n":"Rend","kind":"atk","hit":6,"dmg":"1d10+4","dtype":"slashing","extra":"1d6","extraType":"fire","d":"reach 5 ft. 318 System Reference Document 5.2.1"},{"n":"Fire Breath","kind":"save","save":{"ability":"DEX","dc":13},"rech":5,"d":"Dexterity Saving Throw: DC 13, each creature in a 15-foot Cone. Failure: 24 (7d6) Fire damage. Success: Half damage."}]},{"name":"Silver Dragon Wyrmling","cr":"2","cat":"dragon","ac":17,"hp":45,"hpF":"6d8+18","spd":"30 ft., Fly 60 ft.","mods":{"str":4,"dex":0,"con":3,"int":1,"wis":0,"cha":2},"saves":{"dex":2,"wis":2},"immune":["cold"],"multi":"The dragon makes two Rend attacks.","actions":[{"n":"Rend","kind":"atk","hit":6,"dmg":"1d10+4","dtype":"piercing","d":"reach 5 ft"},{"n":"Cold Breath","kind":"save","save":{"ability":"CON","dc":13},"rech":5,"d":"Constitution Saving Throw: DC 13, each creature in a 15-foot Cone. Failure: 18 (4d8) Cold damage. Success: Half damage."},{"n":"Paralyzing Breath","kind":"save","save":{"ability":"CON","dc":13},"d":"Constitution Saving Throw: DC 13, each creature in a 15-foot Cone. First Failure: The target has the Incapacitated condition until the end of its next turn, when it repeats the save. Second Failure: The target has the Paralyzed condition, and it repeats the save at the end of each of its turns, ending the effect on itself on a success. After 1 minute, it succeeds automatically."}]},{"name":"White Dragon Wyrmling","cr":"2","cat":"dragon","ac":16,"hp":32,"hpF":"5d8+10","spd":"30 ft., Burrow 15 ft., Fly 60 ft., Swim 30 ft.","mods":{"str":2,"dex":0,"con":2,"int":-3,"wis":0,"cha":0},"saves":{"dex":2,"wis":2},"immune":["cold"],"traits":[{"n":"Ice Walk","d":"The dragon can move across and climb icy surfaces without needing to make an ability check. Additionally, Difficult Terrain composed of ice or snow doesn't cost it extra movement."}],"multi":"The dragon makes two Rend attacks.","actions":[{"n":"Rend","kind":"atk","hit":4,"dmg":"1d8+2","dtype":"slashing","extra":"1d4","extraType":"cold","d":"reach 5 ft"},{"n":"Cold Breath","kind":"save","save":{"ability":"CON","dc":12},"rech":5,"d":"Constitution Saving Throw: DC 12, each creature in a 15-foot Cone. Failure: 22 (5d8) Cold damage. Success: Half damage."}]},{"name":"Wyvern","cr":"6","cat":"dragon","ac":14,"hp":127,"hpF":"15d10+45","spd":"30 ft., Fly 80 ft.","mods":{"str":4,"dex":0,"con":3,"int":-3,"wis":1,"cha":-2},"multi":"The wyvern makes one Bite attack and one Sting attack.","actions":[{"n":"Bite","kind":"atk","hit":7,"dmg":"2d8+4","dtype":"piercing","d":"reach 5 ft"},{"n":"Sting","kind":"atk","hit":7,"dmg":"2d6+4","dtype":"piercing","extra":"7d6","extraType":"poison","d":"reach 10 ft. and the target has the Poisoned condition until the start of the wyvern's next turn."}]},{"name":"Young Black Dragon","cr":"7","cat":"dragon","ac":18,"hp":127,"hpF":"15d10+45","spd":"40 ft., Fly 80 ft., Swim 40 ft.","mods":{"str":4,"dex":2,"con":3,"int":1,"wis":0,"cha":2},"saves":{"dex":5,"wis":3},"immune":["acid"],"traits":[{"n":"Amphibious","d":"The dragon can breathe air and water."}],"multi":"The dragon makes three Rend attacks.","actions":[{"n":"Rend","kind":"atk","hit":7,"dmg":"2d4+4","dtype":"slashing","extra":"1d6","extraType":"acid","d":"reach 10 ft"},{"n":"Acid Breath","kind":"save","save":{"ability":"DEX","dc":14},"rech":5,"d":"Dexterity Saving Throw: DC 14, each creature in a 30-foot-long, 5-footwide Line. Failure: 49 (14d6) Acid damage. Success: Half damage. 264 System Reference Document 5.2.1"}]},{"name":"Young Blue Dragon","cr":"9","cat":"dragon","ac":18,"hp":152,"hpF":"16d10+64","spd":"40 ft., Burrow 20 ft., Fly 80 ft.","mods":{"str":5,"dex":0,"con":4,"int":2,"wis":1,"cha":3},"saves":{"dex":4,"wis":5},"immune":["lightning"],"multi":"The dragon makes three Rend attacks.","actions":[{"n":"Rend","kind":"atk","hit":9,"dmg":"2d6+5","dtype":"slashing","extra":"1d10","extraType":"lightning","d":"reach 10 ft"},{"n":"Lightning Breath","kind":"save","save":{"ability":"DEX","dc":16},"rech":5,"d":"Dexterity Saving Throw: DC 16, each creature in a 60-foot-long, 5-footwide Line. Failure: 55 (10d10) Lightning damage. Success: Half damage."}]},{"name":"Young Brass Dragon","cr":"6","cat":"dragon","ac":17,"hp":110,"hpF":"13d10+39","spd":"40 ft., Burrow 20 ft., Fly 80 ft.","mods":{"str":4,"dex":0,"con":3,"int":1,"wis":0,"cha":2},"saves":{"dex":3,"wis":3},"immune":["fire"],"multi":"The dragon makes three Rend attacks. It can replace two attacks with a use of Sleep Breath. 268 System Reference Document 5.2.1","actions":[{"n":"Rend","kind":"atk","hit":7,"dmg":"2d10+4","dtype":"slashing","d":"reach 10 ft"},{"n":"Fire Breath","kind":"save","save":{"ability":"DEX","dc":14},"rech":5,"d":"Dexterity Saving Throw: DC 14, each creature in a 40-foot-long, 5-footwide Line. Failure: 38 (11d6) Fire damage. Success: Half damage."},{"n":"Sleep Breath","kind":"save","save":{"ability":"CON","dc":14},"d":"Constitution Saving Throw: DC 14, each creature in a 30-foot Cone. Failure: The target has the Incapacitated condition until the end of its next turn, at which point it repeats the save. Second Failure: The target has the Unconscious condition for 1 minute. This effect ends for the target if it takes damage or a creature within 5 feet of it takes an action to wake it."}]},{"name":"Young Bronze Dragon","cr":"8","cat":"dragon","ac":17,"hp":142,"hpF":"15d10+60","spd":"40 ft., Fly 80 ft., Swim 40 ft.","mods":{"str":5,"dex":0,"con":4,"int":2,"wis":1,"cha":3},"saves":{"dex":3,"wis":4},"immune":["lightning"],"traits":[{"n":"Amphibious","d":"The dragon can breathe air and water."}],"multi":"The dragon makes three Rend attacks. It can replace one attack with a use of Repulsion Breath.","actions":[{"n":"Rend","kind":"atk","hit":8,"dmg":"2d10+5","dtype":"slashing","d":"reach 10 ft"},{"n":"Lightning Breath","kind":"save","save":{"ability":"DEX","dc":15},"rech":5,"d":"Dexterity Saving Throw: DC 15, each creature in a 60-foot-long, 5-footwide Line. Failure: 49 (9d10) Lightning damage. Success: Half damage."},{"n":"Repulsion Breath","kind":"save","save":{"ability":"STR","dc":15},"d":"Strength Saving Throw: DC 15, each creature in a 30-foot Cone. Failure: The target is pushed up to 40 feet straight away from the dragon and has the Prone condition."}]},{"name":"Young Copper Dragon","cr":"7","cat":"dragon","ac":17,"hp":119,"hpF":"14d10+42","spd":"40 ft., Climb 40 ft., Fly 80 ft.","mods":{"str":4,"dex":1,"con":3,"int":3,"wis":1,"cha":2},"saves":{"dex":4,"wis":4},"immune":["acid"],"multi":"The dragon makes three Rend attacks. It can replace one attack with a use of Slowing Breath.","actions":[{"n":"Rend","kind":"atk","hit":7,"dmg":"2d10+4","dtype":"slashing","d":"reach 10 ft"},{"n":"Acid Breath","kind":"save","save":{"ability":"DEX","dc":14},"rech":5,"d":"Dexterity Saving Throw: DC 14, each creature in a 40-foot-long, 5-footwide Line. Failure: 40 (9d8) Acid damage. Success: Half damage."},{"n":"Slowing Breath","kind":"save","save":{"ability":"CON","dc":14},"d":"Constitution Saving Throw: DC 14, each creature in a 30-foot Cone. Failure: The target can't take Reactions; its Speed is halved; and it can take either an action or a Bonus Action on its turn, not both. This effect lasts until the end of its next turn."}]},{"name":"Young Gold Dragon","cr":"10","cat":"dragon","ac":18,"hp":178,"hpF":"17d10+85","spd":"40 ft., Fly 80 ft., Swim 40 ft.","mods":{"str":6,"dex":2,"con":5,"int":3,"wis":1,"cha":5},"saves":{"dex":6,"wis":5},"immune":["fire"],"traits":[{"n":"Amphibious","d":"The dragon can breathe air and water."}],"multi":"The dragon makes three Rend attacks. It can replace one attack with a use of Weakening Breath.","actions":[{"n":"Rend","kind":"atk","hit":10,"dmg":"2d10+6","dtype":"slashing","d":"reach 10 ft"},{"n":"Fire Breath","kind":"save","save":{"ability":"DEX","dc":17},"rech":5,"d":"Dexterity Saving Throw: DC 17, each creature in a 30-foot Cone. Failure: 55 (10d10) Fire damage. Success: Half damage."},{"n":"Weakening Breath","kind":"save","save":{"ability":"STR","dc":17},"d":"Strength Saving Throw: DC 17, each creature that isn't currently affected by this breath in a 30-foot Cone. Failure: The target has Disadvantage on Strength-based D20 Tests and subtracts 3 (1d6) from its damage rolls. It repeats the save at the end of each of its turns, ending the effect on itself on a success. After 1 minute, it succeeds automatically. 291 System Reference Document 5.2.1"}]},{"name":"Young Green Dragon","cr":"8","cat":"dragon","ac":18,"hp":136,"hpF":"16d10+48","spd":"40 ft., Fly 80 ft., Swim 40 ft.","mods":{"str":4,"dex":1,"con":3,"int":3,"wis":1,"cha":2},"saves":{"dex":4,"wis":4},"immune":["poison"],"condImmune":["Poisoned"],"traits":[{"n":"Amphibious","d":"The dragon can breathe air and water."}],"multi":"The dragon makes three Rend attacks.","actions":[{"n":"Rend","kind":"atk","hit":7,"dmg":"2d6+4","dtype":"slashing","extra":"2d6","extraType":"poison","d":"reach 10 ft"},{"n":"Poison Breath","kind":"save","save":{"ability":"CON","dc":14},"rech":5,"d":"Constitution Saving Throw: DC 14, each creature in a 30-foot Cone. Failure: 42 (12d6) Poison damage. Success: Half damage."}]},{"name":"Young Red Dragon","cr":"10","cat":"dragon","ac":18,"hp":178,"hpF":"17d10+85","spd":"40 ft., Climb 40 ft., Fly 80 ft.","mods":{"str":6,"dex":0,"con":5,"int":2,"wis":0,"cha":4},"saves":{"dex":4,"wis":4},"immune":["fire"],"multi":"The dragon makes three Rend attacks.","actions":[{"n":"Rend","kind":"atk","hit":10,"dmg":"2d6+6","dtype":"slashing","extra":"1d6","extraType":"fire","d":"reach 10 ft"},{"n":"Fire Breath","kind":"save","save":{"ability":"DEX","dc":17},"rech":5,"d":"Dexterity Saving Throw: DC 17, each creature in a 30-foot Cone. Failure: 56 (16d6) Fire damage. Success: Half damage."}]},{"name":"Young Silver Dragon","cr":"9","cat":"dragon","ac":18,"hp":168,"hpF":"16d10+80","spd":"40 ft., Fly 80 ft.","mods":{"str":6,"dex":0,"con":5,"int":2,"wis":0,"cha":4},"saves":{"dex":4,"wis":4},"immune":["cold"],"multi":"The dragon makes three Rend attacks. It can replace one attack with a use of Paralyzing Breath. 324 System Reference Document 5.2.1","actions":[{"n":"Rend","kind":"atk","hit":10,"dmg":"2d8+6","dtype":"slashing","d":"reach 10 ft"},{"n":"Cold Breath","kind":"save","save":{"ability":"CON","dc":17},"rech":5,"d":"Constitution Saving Throw: DC 17, each creature in a 30-foot Cone. Failure: 49 (11d8) Cold damage. Success: Half damage."},{"n":"Paralyzing Breath","kind":"save","save":{"ability":"CON","dc":17},"d":"Constitution Saving Throw: DC 17, each creature in a 30-foot Cone. First Failure: The target has the Incapacitated condition until the end of its next turn, when it repeats the save. Second Failure: The target has the Paralyzed condition, and it repeats the save at the end of each of its turns, ending the effect on itself on a success. After 1 minute, it succeeds automatically."}]},{"name":"Young White Dragon","cr":"6","cat":"dragon","ac":17,"hp":123,"hpF":"13d10+52","spd":"40 ft., Burrow 20 ft., Fly 80 ft., Swim 40 ft.","mods":{"str":4,"dex":0,"con":4,"int":-2,"wis":0,"cha":1},"saves":{"dex":3,"wis":3},"immune":["cold"],"traits":[{"n":"Ice Walk","d":"The dragon can move across and climb icy surfaces without needing to make an ability check. Additionally, Difficult Terrain composed of ice or snow doesn't cost it extra movement."}],"multi":"The dragon makes three Rend attacks.","actions":[{"n":"Rend","kind":"atk","hit":7,"dmg":"2d4+4","dtype":"slashing","extra":"1d4","extraType":"cold","d":"reach 10 ft"},{"n":"Cold Breath","kind":"save","save":{"ability":"CON","dc":15},"rech":5,"d":"Constitution Saving Throw: DC 15, each creature in a 30-foot Cone. Failure: 40 (9d8) Cold damage. Success: Half damage. 340 System Reference Document 5.2.1"}]},{"name":"Ghast","cr":"2","cat":"undead","ac":13,"hp":36,"hpF":"8d8","spd":"30 ft.","mods":{"str":3,"dex":3,"con":0,"int":0,"wis":0,"cha":-1},"saves":{"wis":2},"resist":["necrotic"],"immune":["poison"],"condImmune":["Charmed","Exhaustion","Poisoned"],"traits":[{"n":"Stench","d":"Constitution Saving Throw: DC 10, any creature that starts its turn in a 5-foot Emanation originating from the ghast. Failure: The target has the Poisoned condition until the start of its next turn. Success: The target is immune to this ghast's Stench for 24 hours."}],"actions":[{"n":"Bite","kind":"atk","hit":5,"dmg":"1d8+3","dtype":"piercing","extra":"2d8","extraType":"necrotic","d":"reach 5 ft"},{"n":"Claw","kind":"atk","hit":5,"dmg":"2d6+3","dtype":"slashing","d":"reach 5 ft. If the target is a non-Undead creature, it is subjected to the following effect. Constitution Saving Throw: DC 10. Failure: The target has the Paralyzed condition until the end of its next turn."}]},{"name":"Ghost","cr":"4","cat":"undead","ac":11,"hp":45,"hpF":"10d8","spd":"5 ft., Fly 40 ft. (hover)","mods":{"str":-2,"dex":1,"con":0,"int":0,"wis":1,"cha":3},"resist":["acid","bludgeoning","cold","fire","lightning","piercing","slashing","thunder"],"immune":["necrotic","poison"],"condImmune":["Charmed","Exhaustion","Frightened","Grappled","Paralyzed","Petrified","Poisoned","Prone","Restrained"],"traits":[{"n":"Ethereal Sight","d":"The ghost can see 60 feet into the Ethereal Plane when it is on the Material Plane."},{"n":"Incorporeal Movement","d":"The ghost can move through other creatures and objects as if they were Difficult Terrain. It takes 5 (1d10) Force damage if it ends its turn inside an object."}],"multi":"The ghost makes two Withering Touch attacks.","actions":[{"n":"Withering Touch","kind":"atk","hit":5,"dmg":"3d10+3","dtype":"necrotic","d":"reach 5 ft"},{"n":"Etherealness","kind":"text","d":"The ghost casts the Etherealness spell, requiring no spell components and using Charisma as the spellcasting ability. The ghost is visible on the Material Plane while on the Border Ethereal and vice versa, but it can't affect or be affected by anything on the other plane."},{"n":"Horrific Visage","kind":"save","save":{"ability":"WIS","dc":13},"d":"Wisdom Saving Throw: DC 13, each creature in a 60-foot Cone that can see the ghost and isn't an Undead. Failure: 10 (2d6 + 3) Psychic damage, and the target has the Frightened condition until the start of the ghost's next turn. Success: The target is immune to this ghost's Horrific Visage for 24 hours."},{"n":"Possession","kind":"save","save":{"ability":"CHA","dc":13},"rech":6,"d":"Charisma Saving Throw: DC 13, one Humanoid the ghost can see within 5 feet. Failure: The target is possessed by the ghost; the ghost disappears, and the target has the Incapacitated condition and loses control of its body. The ghost now controls the body, but the target retains awareness. The ghost can't be targeted by any attack, spell, or other effect, except ones that specifically target Undead. The ghost's game statistics are the same, except it uses the possessed target's Speed, as well as the target's Strength, Dexterity, and Constitution modifiers. The possession lasts until the body drops to 0 Hit Points or the ghost leaves as a Bonus Action. When the possession ends, the ghost appears in an unoccupied space within 5 feet of the target, and the target is immune to this ghost's Possession for 24 hours. Success: The target is immune to this ghost's Possession for 24 hours."}]},{"name":"Ghoul","cr":"1","cat":"undead","ac":12,"hp":22,"hpF":"5d8","spd":"30 ft.","mods":{"str":1,"dex":2,"con":0,"int":-2,"wis":0,"cha":-2},"immune":["poison"],"condImmune":["Charmed","Exhaustion","Poisoned"],"multi":"The ghoul makes two Bite attacks. 288 System Reference Document 5.2.1","actions":[{"n":"Bite","kind":"atk","hit":4,"dmg":"1d6+2","dtype":"piercing","extra":"1d6","extraType":"necrotic","d":"reach 5 ft"},{"n":"Claw","kind":"atk","hit":4,"dmg":"1d4+2","dtype":"slashing","d":"reach 5 ft. If the target is a creature that isn't an Undead or elf, it is subjected to the following effect. Constitution Saving Throw: DC 10. Failure: The target has the Paralyzed condition until the end of its next turn."}]},{"name":"Lich","cr":"21","cat":"undead","ac":20,"hp":315,"hpF":"42d8+126","spd":"30 ft.","mods":{"str":0,"dex":3,"con":3,"int":5,"wis":2,"cha":3},"saves":{"dex":10,"con":10,"int":12,"wis":9},"resist":["cold","lightning"],"immune":["necrotic","poison"],"condImmune":["Charmed","Exhaustion","Frightened","Paralyzed","Poisoned"],"traits":[{"n":"Legendary Resistance (4/Day, or 5/Day in Lair)","d":"If the lich fails a saving throw, it can choose to succeed instead. 304 System Reference Document 5.2.1"},{"n":"Spirit Jar","d":"If destroyed, the lich reforms in 1d10 days if it has a spirit jar, reviving with all its Hit Points. The new body appears in an unoccupied space within the lich's lair."}],"multi":"The lich makes three attacks, using Eldritch Burst or Paralyzing Touch in any combination.","actions":[{"n":"Eldritch Burst","kind":"atk","hit":12,"dmg":"4d12+5","dtype":"force","d":"reach 5 ft. or range 120 ft"},{"n":"Paralyzing Touch","kind":"atk","hit":12,"dmg":"3d6+5","dtype":"cold","d":"reach 5 ft. and the target has the Paralyzed condition until the start of the lich's next turn."},{"n":"Spellcasting","kind":"text","d":"The lich casts one of the following spells, using Intelligence as the spellcasting ability (spell save DC 20): At Will: Detect Magic, Detect Thoughts, Dispel Magic, Fireball (level 5 version), Invisibility, Lightning Bolt (level 5 version), Mage Hand, Prestidigitation 2/Day Each: Animate Dead, Dimension Door, Plane Shift 1/Day Each: Chain Lightning, Finger of Death, Power Word Kill, Scrying"}],"reactions":[{"n":"Protective Magic","d":"The lich casts Counterspell or Shield in response to the spell's trigger, using the same spellcasting ability as Spellcasting."}],"legendary":{"count":3,"options":[{"n":"Deathly Teleport","d":"The lich teleports up to 60 feet to an unoccupied space it can see, and each creature within 10 feet of the space it left takes 11 (2d10) Necrotic damage."},{"n":"Disrupt Life","d":"Constitution Saving Throw: DC 20, each creature that isn't an Undead in a 20-foot Emanation originating from the lich. Failure: 31 (9d6) Necrotic damage. Success: Half damage. Failure or Success: The lich can't take this action again until the start of its next turn."},{"n":"Frightening Gaze","d":"The lich casts Fear, using the same spellcasting ability as Spellcasting. The lich can't take this action again until the start of its next turn."}]},"legRes":4},{"name":"Minotaur Skeleton","cr":"2","cat":"undead","ac":12,"hp":45,"hpF":"6d10+12","spd":"40 ft.","mods":{"str":4,"dex":0,"con":2,"int":-2,"wis":-1,"cha":-3},"immune":["poison"],"vuln":["bludgeoning"],"condImmune":["Exhaustion","Poisoned"],"actions":[{"n":"Gore","kind":"atk","hit":6,"dmg":"2d6+4","dtype":"piercing","d":"reach 5 ft. If the target is a Large or smaller creature and the skeleton moved 20+ feet straight toward it immediately before the hit, the target takes an extra 9 (2d8) Piercing damage and has the Prone condition."},{"n":"Slam","kind":"atk","hit":6,"dmg":"2d10+4","dtype":"bludgeoning","d":"reach 5 ft. 326 System Reference Document 5.2.1"}]},{"name":"Mummy","cr":"3","cat":"undead","ac":11,"hp":58,"hpF":"9d8+18","spd":"20 ft.","mods":{"str":3,"dex":-1,"con":2,"int":-2,"wis":1,"cha":1},"saves":{"wis":3},"immune":["necrotic","poison"],"vuln":["fire"],"condImmune":["Charmed","Exhaustion","Frightened","Paralyzed","Poisoned"],"multi":"The mummy makes two Rotting Fist attacks and uses Dreadful Glare.","actions":[{"n":"Rotting Fist","kind":"atk","hit":5,"dmg":"1d10+3","dtype":"bludgeoning","extra":"3d6","extraType":"necrotic","d":"reach 5 ft. If the target is a creature, it is cursed. While cursed, the target can't regain Hit Points, its Hit Point maximum doesn't return to normal when finishing a Long Rest, and its Hit Point maximum decreases by 10 (3d6) every 24 hours that elapse. A creature dies and turns to dust if reduced to 0 Hit Points by this attack."},{"n":"Dreadful Glare","kind":"save","save":{"ability":"WIS","dc":11},"d":"Wisdom Saving Throw: DC 11, one creature the mummy can see within 60 feet. Failure: The target has the Frightened condition until the end of the mummy's next turn. Success: The target is immune to this mummy's Dreadful Glare for 24 hours."}]},{"name":"Mummy Lord","cr":"15","cat":"undead","ac":17,"hp":187,"hpF":"25d8+75","spd":"30 ft.","mods":{"str":4,"dex":0,"con":3,"int":0,"wis":4,"cha":3},"saves":{"int":5,"wis":9},"immune":["necrotic","poison"],"vuln":["fire"],"condImmune":["Charmed","Exhaustion","Frightened","Paralyzed","Poisoned"],"traits":[{"n":"Legendary Resistance (3/Day, or 4/Day in Lair)","d":"If the mummy fails a saving throw, it can choose to succeed instead."},{"n":"Magic Resistance","d":"The mummy has Advantage on saving throws against spells and other magical effects."},{"n":"Undead Restoration","d":"If destroyed, the mummy gains a new body in 24 hours if its heart is intact, reviving with all its Hit Points. The new body appears in an unoccupied space within the mummy's lair. The heart is a Tiny object that has AC 17, HP 10, and Immunity to all damage except Fire."}],"multi":"The mummy makes one Rotting Fist or Channel Negative Energy attack, and it uses Dreadful Glare.","actions":[{"n":"Rotting Fist","kind":"atk","hit":9,"dmg":"2d10+4","dtype":"bludgeoning","extra":"3d6","extraType":"necrotic","d":"reach 5 ft. If the target is a creature, it is cursed. While cursed, the target can't regain Hit Points, it gains no benefit from finishing a Long Rest, and its Hit Point maximum decreases by 10 (3d6) every 24 hours that elapse. A creature dies and turns to dust if reduced to 0 Hit Points by this attack."},{"n":"Channel Negative Energy","kind":"atk","hit":9,"dmg":"6d6+4","dtype":"necrotic","d":"range 60 ft"},{"n":"Dreadful Glare","kind":"save","save":{"ability":"WIS","dc":17},"d":"Wisdom Saving Throw: DC 17, one creature the mummy can see within 60 feet. Failure: 25 (6d6 + 4) Psychic damage, and the target has the Paralyzed condition until the end of the mummy's next turn."},{"n":"Spellcasting","kind":"text","d":"The mummy casts one of the following spells, requiring no Material components and using Wisdom as the spellcasting ability (spell save DC 17, +9 to hit with spell attacks): 1/Day Each: Animate Dead, Harm, Insect Plague (level 7 version)"}],"reactions":[{"n":"Whirlwind of Sand","d":"Trigger: The mummy is hit by an attack roll. Response: The mummy adds 2 to its AC against the attack, possibly causing the attack to miss, and the mummy teleports up to 60 feet to an unoccupied space it can see. Each creature of its choice that it can see within 5 feet of its destination space has the Blinded condition until the end of the mummy's next turn. 310 System Reference Document 5.2.1","acBonus":2}],"legendary":{"count":3,"options":[{"n":"Dread Command","d":"The mummy casts Command (level 2 version), using the same spellcasting ability as Spellcasting. The mummy can't take this action again until the start of its next turn."},{"n":"Glare","d":"The mummy uses Dreadful Glare. The mummy can't take this action again until the start of its next turn."},{"n":"Necrotic Strike","d":"The mummy makes one Rotting Fist or Channel Negative Energy attack."}]},"legRes":3},{"name":"Ogre Zombie","cr":"2","cat":"undead","ac":8,"hp":85,"hpF":"9d10+36","spd":"30 ft.","mods":{"str":4,"dex":-2,"con":4,"int":-4,"wis":-2,"cha":-3},"saves":{"wis":0},"immune":["poison"],"condImmune":["Exhaustion","Poisoned"],"traits":[{"n":"Undead Fortitude","d":"If damage reduces the zombie to 0 Hit Points, it makes a Constitution saving throw (DC 5 plus the damage taken) unless the damage is Radiant or from a Critical Hit. On a successful save, the zombie drops to 1 Hit Point instead."}],"actions":[{"n":"Slam","kind":"atk","hit":6,"dmg":"2d8+4","dtype":"bludgeoning","d":"reach 5 ft"}]},{"name":"Shadow","cr":"1/2","cat":"undead","ac":12,"hp":27,"hpF":"5d8+5","spd":"40 ft.","mods":{"str":-2,"dex":2,"con":1,"int":-2,"wis":0,"cha":-1},"resist":["acid","cold","fire","lightning","thunder"],"immune":["necrotic","poison"],"vuln":["radiant"],"condImmune":["Exhaustion","Frightened","Grappled","Paralyzed","Petrified","Poisoned","Prone","Restrained","Unconscious"],"traits":[{"n":"Amorphous","d":"The shadow can move through a space as narrow as 1 inch without expending extra movement to do so."},{"n":"Sunlight Weakness","d":"While in sunlight, the shadow has Disadvantage on D20 Tests."}],"actions":[{"n":"Draining Swipe","kind":"atk","hit":4,"dmg":"1d6+2","dtype":"necrotic","d":"reach 5 ft. and the target's Strength score decreases by 1d4. The target dies if this reduces that score to 0. If a Humanoid is slain by this attack, a"},{"n":"Shadow rises from the corpse 1d4 hours later","kind":"text"}],"bonus":[{"n":"Shadow Stealth","d":"While in Dim Light or Darkness, the shadow takes the Hide action."}]},{"name":"Skeleton","cr":"1/4","cat":"undead","ac":14,"hp":13,"hpF":"2d8+4","spd":"30 ft.","mods":{"str":0,"dex":3,"con":2,"int":-2,"wis":-1,"cha":-3},"immune":["poison"],"vuln":["bludgeoning"],"condImmune":["Exhaustion","Poisoned"],"actions":[{"n":"Shortsword","kind":"atk","hit":5,"dmg":"1d6+3","dtype":"piercing","d":"reach 5 ft"},{"n":"Shortbow","kind":"atk","hit":5,"dmg":"1d6+3","dtype":"piercing","d":"range 80/320 ft"}]},{"name":"Specter","cr":"1","cat":"undead","ac":12,"hp":22,"hpF":"5d8","spd":"30 ft., Fly 50 ft. (hover)","mods":{"str":-5,"dex":2,"con":0,"int":0,"wis":0,"cha":0},"resist":["acid","bludgeoning","cold","fire","lightning","piercing","slashing","thunder"],"immune":["necrotic","poison"],"condImmune":["Charmed","Exhaustion","Grappled","Paralyzed","Petrified","Poisoned","Prone","Restrained","Unconscious"],"traits":[{"n":"Incorporeal Movement","d":"The specter can move through other creatures and objects as if they were Difficult Terrain. It takes 5 (1d10) Force damage if it ends its turn inside an object."},{"n":"Sunlight Sensitivity","d":"While in sunlight, the specter has Disadvantage on ability checks and attack rolls."}],"actions":[{"n":"Life Drain","kind":"atk","hit":4,"dmg":"2d6","dtype":"necrotic","d":"reach 5 ft. If the target is a creature, its Hit Point maximum decreases by an amount equal to the damage taken. 327 System Reference Document 5.2.1"}]},{"name":"Vampire","cr":"13","cat":"undead","ac":16,"hp":195,"hpF":"23d8+92","spd":"40 ft., Climb 40 ft.","mods":{"str":4,"dex":4,"con":4,"int":3,"wis":2,"cha":4},"saves":{"dex":9,"con":9,"wis":7,"cha":9},"resist":["necrotic"],"traits":[{"n":"Legendary Resistance (3/Day, or 4/Day in Lair)","d":"If the vampire fails a saving throw, it can choose to succeed instead."},{"n":"Misty Escape","d":"If the vampire drops to 0 Hit Points outside its resting place, the vampire uses Shape-Shift to become mist (no action required). If it can't use ShapeShift, it is destroyed. While it has 0 Hit Points in mist form, it can't return to its vampire form, and it must reach its resting place within 2 hours or be destroyed. Once in its resting place, it returns to its vampire form and has the Paralyzed condition until it regains any Hit Points, and it regains 1 Hit Point after spending 1 hour there."},{"n":"Spider Climb","d":"The vampire can climb difficult surfaces, including along ceilings, without needing to make an ability check."},{"n":"Vampire Weakness","d":"The vampire has these weaknesses:"},{"n":"Forbiddance","d":"The vampire can't enter a residence without an invitation from an occupant."},{"n":"Running Water","d":"The vampire takes 20 Acid damage if it ends its turn in running water."},{"n":"Stake to the Heart","d":"If a weapon that deals Piercing damage is driven into the vampire's heart while the vampire has the Incapacitated condition in its resting place, the vampire has the Paralyzed condition until the weapon is removed."},{"n":"Sunlight","d":"The vampire takes 20 Radiant damage if it starts its turn in sunlight. While in sunlight, it has Disadvantage on attack rolls and ability checks."}],"multi":"The vampire makes two Grave Strike attacks and uses Bite.","actions":[{"n":"Grave Strike (Vampire Form Only)","kind":"atk","hit":9,"dmg":"1d8+4","dtype":"bludgeoning","extra":"2d6","extraType":"necrotic","d":"reach 5 ft. If the target is a Large or smaller creature, it has the Grappled condition (escape DC 14) from one of two hands."},{"n":"Bite (Bat or Vampire Form Only)","kind":"save","save":{"ability":"CON","dc":17},"d":"Constitution Saving Throw: DC 17, one creature within 5 feet that is willing or that has the Grappled, Incapacitated, or Restrained condition. Failure: 6 (1d4 + 4) Piercing damage plus 13 (3d8) Necrotic damage. The target's Hit Point maximum decreases by an amount equal to the Necrotic damage taken, and the vampire regains Hit Points equal to that amount. A Humanoid reduced to 0 Hit Points by this damage and then buried rises the following sunset as a"},{"n":"Vampire Spawn under the vampire's control","kind":"text"}],"bonus":[{"n":"Charm (Recharge 5-6)","d":"The vampire casts Charm Person, requiring no spell components and using Charisma as the spellcasting ability (spell save DC 17), and the duration is 24 hours. The Charmed target is a willing recipient of the vampire's Bite, the damage of which doesn't end the spell. When the spell ends, the target is unaware it was Charmed by the vampire."},{"n":"Shape-Shift","d":"If the vampire isn't in sunlight or running water, it shape-shifts into a Tiny bat (Speed 5 ft., Fly Speed 30 ft.) or a Medium cloud of mist (Speed 5 ft., Fly Speed 20 ft. [hover]), or it returns to its vampire form. Anything it is wearing transforms with it. While in bat form, the vampire can't speak. Its game statistics, other than its size and Speed, are unchanged. While in mist form, the vampire can't take any actions, speak, or manipulate objects. It is weightless and can enter an enemy's space and stop there. If air can pass through a space, the mist can do so, but it can't pass through liquid. It has Resistance to all damage, except the damage it takes from sunlight."}],"legendary":{"count":3,"options":[{"n":"Beguile","d":"The vampire casts Command, requiring no spell components and using Charisma as the spellcasting ability (spell save DC 17). The vampire can't take this action again until the start of its next turn."},{"n":"Deathless Strike","d":"The vampire moves up to half its Speed, and it makes one Grave Strike attack."}]},"legRes":3},{"name":"Vampire Spawn","cr":"5","cat":"undead","ac":16,"hp":90,"hpF":"12d8+36","spd":"30 ft.","mods":{"str":3,"dex":3,"con":3,"int":0,"wis":0,"cha":1},"saves":{"dex":6,"wis":3},"resist":["necrotic"],"traits":[{"n":"Spider Climb","d":"The vampire can climb difficult surfaces, including along ceilings, without needing to make an ability check."},{"n":"Vampire Weakness","d":"The vampire has these weaknesses:"},{"n":"Forbiddance","d":"The vampire can't enter a residence without an invitation from an occupant."},{"n":"Running Water","d":"The vampire takes 20 Acid damage if it ends its turn in running water."},{"n":"Stake to the Heart","d":"The vampire is destroyed if a weapon that deals Piercing damage is driven into the vampire's heart while the vampire has the Incapacitated condition."},{"n":"Sunlight","d":"The vampire takes 20 Radiant damage if it starts its turn in sunlight. While in sunlight, it has Disadvantage on attack rolls and ability checks."}],"multi":"The vampire makes two Claw attacks and uses Bite.","actions":[{"n":"Claw","kind":"atk","hit":6,"dmg":"2d4+3","dtype":"slashing","d":"reach 5 ft. If the target is a Medium or smaller creature, it has the Grappled condition (escape DC 13) from one of two claws."},{"n":"Bite","kind":"save","save":{"ability":"CON","dc":14},"d":"Constitution Saving Throw: DC 14, one creature within 5 feet that is willing or that has the Grappled, Incapacitated, or Restrained condition. Failure: 5 (1d4 + 3) Piercing damage plus 10 (3d6) Necrotic damage. The target's Hit Point maximum decreases by an amount equal to the Necrotic damage taken, and the vampire regains Hit Points equal to that amount."}],"bonus":[{"n":"Deathless Agility","d":"The vampire takes the Dash or Disengage action."}]},{"name":"Warhorse Skeleton","cr":"1/2","cat":"undead","ac":13,"hp":22,"hpF":"3d10+6","spd":"60 ft.","mods":{"str":4,"dex":1,"con":2,"int":-4,"wis":-1,"cha":-3},"immune":["poison"],"vuln":["bludgeoning"],"condImmune":["Exhaustion","Poisoned"],"actions":[{"n":"Hooves","kind":"atk","hit":6,"dmg":"1d6+4","dtype":"bludgeoning","d":"reach 5 ft. If the target is a Large or smaller creature and the skeleton moved 20+ feet straight toward it immediately before the hit, the target has the Prone condition."}]},{"name":"Wight","cr":"3","cat":"undead","ac":14,"hp":82,"hpF":"11d8+33","spd":"30 ft.","mods":{"str":2,"dex":2,"con":3,"int":0,"wis":1,"cha":2},"resist":["necrotic"],"immune":["poison"],"condImmune":["Exhaustion","Poisoned"],"traits":[{"n":"Sunlight Sensitivity","d":"While in sunlight, the wight has Disadvantage on ability checks and attack rolls."}],"multi":"The wight makes two attacks, using Necrotic Sword or Necrotic Bow in any combination. It can replace one attack with a use of Life Drain.","actions":[{"n":"Necrotic Sword","kind":"atk","hit":4,"dmg":"1d8+2","dtype":"slashing","extra":"1d8","extraType":"necrotic","d":"reach 5 ft"},{"n":"Necrotic Bow","kind":"atk","hit":4,"dmg":"1d8+2","dtype":"piercing","extra":"1d8","extraType":"necrotic","d":"range 150/600 ft"},{"n":"Life Drain","kind":"save","save":{"ability":"CON","dc":13},"d":"Constitution Saving Throw: DC 13, one creature within 5 feet. Failure: 6 (1d8 + 2) Necrotic damage, and the target's Hit Point maximum decreases by an amount equal to the damage taken. A Humanoid slain by this attack rises 24 hours later as a Zombie under the wight's control, unless the Humanoid is restored to life or its body is destroyed. The wight can have no more than twelve zombies under its control at a time."}]},{"name":"Will-o'-Wisp","cr":"2","cat":"undead","ac":19,"hp":27,"hpF":"11d4","spd":"5 ft., Fly 50 ft. (hover)","mods":{"str":-5,"dex":9,"con":0,"int":1,"wis":2,"cha":0},"resist":["acid","bludgeoning","cold","fire","necrotic","piercing","slashing"],"immune":["lightning","poison"],"condImmune":["Exhaustion","Grappled","Paralyzed","Petrified","Poisoned","Prone","Restrained","Unconscious"],"traits":[{"n":"Ephemeral","d":"The wisp can't wear or carry anything."},{"n":"Illumination","d":"The wisp sheds Bright Light in a 20-foot radius and Dim Light for an additional 20 feet."},{"n":"Incorporeal Movement","d":"The wisp can move through other creatures and objects as if they were Difficult Terrain. It takes 5 (1d10) Force damage if it ends its turn inside an object."}],"actions":[{"n":"Shock","kind":"atk","hit":4,"dmg":"2d8+2","dtype":"lightning","d":"reach 5 ft"}],"bonus":[{"n":"Consume Life","d":"Constitution Saving Throw: DC 10, one living creature the wisp can see within 5 feet that has 0 Hit Points. Failure: The target dies, and the wisp regains 10 (3d6) Hit Points."},{"n":"Vanish","d":"The wisp and its light have the Invisible condition until the wisp's Concentration ends on this effect, which ends early immediately after the wisp makes an attack roll or uses Consume Life."}]},{"name":"Wraith","cr":"5","cat":"undead","ac":13,"hp":67,"hpF":"9d8+27","spd":"5 ft., Fly 60 ft. (hover)","mods":{"str":-2,"dex":3,"con":3,"int":1,"wis":2,"cha":2},"resist":["acid","bludgeoning","cold","fire","piercing","slashing"],"immune":["necrotic","poison"],"condImmune":["Charmed","Exhaustion","Grappled","Paralyzed","Petrified","Poisoned","Prone","Restrained","Unconscious"],"traits":[{"n":"Incorporeal Movement","d":"The wraith can move through other creatures and objects as if they were Difficult Terrain. It takes 5 (1d10) Force damage if it ends its turn inside an object."},{"n":"Sunlight Sensitivity","d":"While in sunlight, the wraith has Disadvantage on ability checks and attack rolls."}],"actions":[{"n":"Life Drain","kind":"atk","hit":6,"dmg":"4d8+3","dtype":"necrotic","d":"reach 5 ft. If the target is a creature, its Hit Point maximum decreases by an amount equal to the damage taken."},{"n":"Create Specter","kind":"text","d":"The wraith targets a Humanoid corpse within 10 feet of itself that has been dead for no longer than 1 minute. The target's spirit rises as a Specter in the space of its corpse or in the nearest unoccupied space. The specter is under the wraith's control. The wraith can have no more than seven specters under its control at a time."}]},{"name":"Zombie","cr":"1/4","cat":"undead","ac":8,"hp":15,"hpF":"2d8+6","spd":"20 ft.","mods":{"str":1,"dex":-2,"con":3,"int":-4,"wis":-2,"cha":-3},"saves":{"wis":0},"immune":["poison"],"condImmune":["Exhaustion","Poisoned"],"traits":[{"n":"Undead Fortitude","d":"If damage reduces the zombie to 0 Hit Points, it makes a Constitution saving throw (DC 5 plus the damage taken) unless the damage is Radiant or from a Critical Hit. On a successful save, the zombie drops to 1 Hit Point instead."}],"actions":[{"n":"Slam","kind":"atk","hit":3,"dmg":"1d8+1","dtype":"bludgeoning","d":"reach 5 ft"}]},{"name":"Balor","cr":"19","cat":"fiend","ac":19,"hp":287,"hpF":"23d12+138","spd":"40 ft., Fly 80 ft.","mods":{"str":8,"dex":2,"con":6,"int":5,"wis":3,"cha":6},"saves":{"con":12,"wis":9},"resist":["cold","lightning"],"immune":["fire","poison"],"condImmune":["Charmed","Frightened","Poisoned"],"traits":[{"n":"Death Throes","d":"The balor explodes when it dies. Dexterity Saving Throw: DC 20, each creature in a 30-foot Emanation originating from the balor. Failure: 31 (9d6) Fire damage plus 31 (9d6) Force damage. Success: Half damage. Failure or Success: If the balor dies outside the Abyss, it gains a new body instantly, reviving with all its Hit Points somewhere in the Abyss. 261 System Reference Document 5.2.1"},{"n":"Fire Aura","d":"At the end of each of the balor's turns, each creature in a 5-foot Emanation originating from the balor takes 13 (3d8) Fire damage."},{"n":"Legendary Resistance (3/Day)","d":"If the balor fails a saving throw, it can choose to succeed instead."},{"n":"Magic Resistance","d":"The balor has Advantage on saving throws against spells and other magical effects."}],"multi":"The balor makes one Flame Whip attack and one Lightning Blade attack.","actions":[{"n":"Flame Whip","kind":"atk","hit":14,"dmg":"3d6+8","dtype":"force","extra":"5d6","extraType":"fire","d":"reach 30 ft. If the target is a Huge or smaller creature, the balor pulls the target up to 25 feet straight toward itself, and the target has the Prone condition."},{"n":"Lightning Blade","kind":"atk","hit":14,"dmg":"3d8+8","dtype":"force","extra":"4d10","extraType":"lightning","d":"reach 10 ft. and the target can't take Reactions until the start of the balor's next turn."}],"bonus":[{"n":"Teleport","d":"The balor teleports itself or a willing demon within 10 feet of itself up to 60 feet to an unoccupied space the balor can see."}],"legRes":3},{"name":"Barbed Devil","cr":"5","cat":"fiend","ac":15,"hp":110,"hpF":"13d8+52","spd":"30 ft., Climb 30 ft.","mods":{"str":3,"dex":3,"con":4,"int":1,"wis":2,"cha":2},"saves":{"str":6,"con":7,"wis":5,"cha":5},"resist":["cold"],"immune":["fire","poison"],"condImmune":["Poisoned"],"traits":[{"n":"Barbed Hide","d":"At the start of each of its turns, the devil deals 5 (1d10) Piercing damage to any creature it is grappling or any creature grappling it."},{"n":"Diabolical Restoration","d":"If the devil dies outside the Nine Hells, its body disappears in sulfurous smoke, and it gains a new body instantly, reviving with all its Hit Points somewhere in the Nine Hells."},{"n":"Magic Resistance","d":"The devil has Advantage on saving throws against spells and other magical effects."}],"multi":"The devil makes one Claws attack and one Tail attack, or it makes two Hurl Flame attacks. 262 System Reference Document 5.2.1","actions":[{"n":"Claws","kind":"atk","hit":6,"dmg":"2d6+3","dtype":"piercing","d":"reach 5 ft. If the target is a Large or smaller creature, it has the Grappled condition (escape DC 13) from both claws."},{"n":"Tail","kind":"atk","hit":6,"dmg":"2d10+3","dtype":"slashing","d":"reach 10 ft"},{"n":"Hurl Flame","kind":"atk","hit":5,"dmg":"5d6","dtype":"fire","d":"range 150 ft. If the target is a flammable object that isn't being worn or carried, it starts burning."}]},{"name":"Bearded Devil","cr":"3","cat":"fiend","ac":13,"hp":58,"hpF":"9d8+18","spd":"30 ft.","mods":{"str":3,"dex":2,"con":2,"int":-1,"wis":0,"cha":2},"saves":{"str":5,"con":4,"cha":4},"resist":["cold"],"immune":["fire","poison"],"condImmune":["Frightened","Poisoned"],"traits":[{"n":"Magic Resistance","d":"The devil has Advantage on saving throws against spells and other magical effects."}],"multi":"The devil makes one Beard attack and one Infernal Glaive attack.","actions":[{"n":"Beard","kind":"atk","hit":5,"dmg":"1d8+3","dtype":"piercing","d":"reach 5 ft. and the target has the Poisoned condition until the start of the devil's next turn. Until this poison ends, the target can't regain Hit Points."},{"n":"Infernal Glaive","kind":"atk","hit":5,"dmg":"1d10+3","dtype":"slashing","d":"reach 10 ft. If the target is a creature and doesn't already have an infernal wound, it is subjected to the following effect. Constitution Saving Throw: DC 12. Failure: The target receives an infernal wound. While wounded, the target loses 5 (1d10) Hit Points at the start of each of its turns. The wound closes after 1 minute, after a spell restores Hit Points to the target, or after the target or a creature within 5 feet of it takes an action to stanch the wound, doing so by succeeding on a DC 12 Wisdom (Medicine) check."}]},{"name":"Bone Devil","cr":"9","cat":"fiend","ac":16,"hp":161,"hpF":"17d10+68","spd":"40 ft., Fly 40 ft.","mods":{"str":4,"dex":3,"con":4,"int":1,"wis":2,"cha":3},"saves":{"str":8,"int":5,"wis":6,"cha":7},"resist":["cold"],"immune":["fire","poison"],"condImmune":["Poisoned"],"traits":[{"n":"Diabolical Restoration","d":"If the devil dies outside the Nine Hells, its body disappears in sulfurous smoke, and it gains a new body instantly, reviving with all its Hit Points somewhere in the Nine Hells."},{"n":"Magic Resistance","d":"The devil has Advantage on saving throws against spells and other magical effects."}],"multi":"The devil makes two Claw attacks and one Infernal Sting attack.","actions":[{"n":"Claw","kind":"atk","hit":8,"dmg":"2d8+4","dtype":"slashing","d":"reach 10 ft"},{"n":"Infernal Sting","kind":"atk","hit":8,"dmg":"2d10+4","dtype":"piercing","extra":"4d8","extraType":"poison","d":"reach 10 ft. and the target has the Poisoned condition until the start of the devil's next turn. While Poisoned, the target can't regain Hit Points."}]},{"name":"Chain Devil","cr":"8","cat":"fiend","ac":15,"hp":85,"hpF":"10d8+40","spd":"30 ft.","mods":{"str":4,"dex":2,"con":4,"int":0,"wis":1,"cha":2},"saves":{"con":7,"wis":4},"resist":["bludgeoning","cold","piercing","slashing"],"immune":["fire","poison"],"condImmune":["Poisoned"],"traits":[{"n":"Diabolical Restoration","d":"If the devil dies outside the Nine Hells, its body disappears in sulfurous smoke, and it gains a new body instantly, reviving with all its Hit Points somewhere in the Nine Hells."},{"n":"Magic Resistance","d":"The devil has Advantage on saving throws against spells and other magical effects."}],"multi":"The devil makes two Chain attacks and uses Conjure Infernal Chain.","actions":[{"n":"Chain","kind":"atk","hit":7,"dmg":"2d6+4","dtype":"slashing","d":"reach 10 ft. If the target is a Large or smaller creature, it has the Grappled condition (escape DC 14) from one of two chains, and it has the Restrained condition until the grapple ends."},{"n":"Conjure Infernal Chain","kind":"save","save":{"ability":"DEX","dc":15},"d":"The devil conjures a fiery chain to bind a creature. Dexterity Saving Throw: DC 15, one creature the devil can see within 60 feet. Failure: 9 (2d4 + 4) Fire damage, and the target has the Restrained condition until the end of the devil's next turn, at which point the chain disappears. If the target is Large or smaller, the devil moves the target up to 30 feet straight toward itself. Success: The chain disappears."}],"reactions":[{"n":"Unnerving Gaze","d":"Trigger: A creature the devil can see starts its turn within 30 feet of the devil and can see the devil. Response-Wisdom Saving Throw: DC 15, the triggering creature. Failure: The target has the Frightened condition until the end of its turn. Success: The target is immune to this devil's Unnerving Gaze for 24 hours."}]},{"name":"Couatl","cr":"4","cat":"fiend","ac":19,"hp":60,"hpF":"8d8+24","spd":"30 ft., Fly 90 ft.","mods":{"str":3,"dex":5,"con":3,"int":4,"wis":5,"cha":4},"saves":{"con":5,"wis":7},"resist":["bludgeoning","piercing","slashing"],"immune":["psychic","radiant"],"traits":[{"n":"Shielded Mind","d":"The couatl's thoughts can't be read by any means, and other creatures can communicate with it telepathically only if it allows them."}],"actions":[{"n":"Bite","kind":"atk","hit":7,"dmg":"1d12+5","dtype":"piercing","d":"reach 5 ft. and the target has the Poisoned condition until the end of the couatl's next turn."},{"n":"Constrict","kind":"save","save":{"ability":"STR","dc":15},"d":"Strength Saving Throw: DC 15, one Medium or smaller creature the couatl can see within 5 feet. Failure: 8 (1d6 + 5) Bludgeoning damage. The target has the Grappled condition (escape DC 13), and it has the Restrained condition until the grapple ends."},{"n":"Spellcasting","kind":"text","conc":true,"d":"The couatl casts one of the following spells, requiring no spell components and using Wisdom as the spellcasting ability (spell save DC 15): At Will: Detect Evil and Good, Detect Magic, Detect Thoughts, Shapechange (Beast or Humanoid form only, no Temporary Hit Points gained from the spell, and no Concentration or Temporary Hit Points required to maintain the spell) 1/Day Each: Create Food and Water, Dream, Greater Restoration, Scrying, Sleep"}],"bonus":[{"n":"Divine Aid (2/Day)","d":"The couatl casts Bless, Lesser Restoration, or Sanctuary, requiring no spell components and using the same spellcasting ability as Spellcasting."}]},{"name":"Deva","cr":"10","cat":"fiend","ac":17,"hp":229,"hpF":"27d8+108","spd":"30 ft., Fly 90 ft. (hover)","mods":{"str":4,"dex":4,"con":4,"int":3,"wis":5,"cha":5},"saves":{"wis":9,"cha":9},"resist":["radiant"],"condImmune":["Charmed","Exhaustion","Frightened"],"traits":[{"n":"Exalted Restoration","d":"If the deva dies outside Mount Celestia, its body disappears, and it gains a new body instantly, reviving with all its Hit Points somewhere in Mount Celestia."},{"n":"Magic Resistance","d":"The deva has Advantage on saving throws against spells and other magical effects."}],"multi":"The deva makes two Holy Mace attacks.","actions":[{"n":"Holy Mace","kind":"atk","hit":8,"dmg":"1d6+4","dtype":"bludgeoning","extra":"4d8","extraType":"radiant","d":"reach 5 ft"},{"n":"Spellcasting","kind":"text","conc":true,"d":"The deva casts one of the following spells, requiring no Material components and using Charisma as the spellcasting ability (spell save DC 17): At Will: Detect Evil and Good, Shapechange (Beast or Humanoid form only, no Temporary Hit Points gained from the spell, and no Concentration or Temporary Hit Points required to maintain the spell)"}],"bonus":[{"n":"Divine Aid (2/Day)","d":"The deva casts Cure Wounds, Lesser Restoration, or Remove Curse, using the same spellcasting ability as Spellcasting."}]},{"name":"Dretch","cr":"1/4","cat":"fiend","ac":11,"hp":18,"hpF":"4d6+4","spd":"20 ft.","mods":{"str":1,"dex":0,"con":1,"int":-3,"wis":-1,"cha":-4},"resist":["cold","fire","lightning"],"immune":["poison"],"condImmune":["Poisoned"],"actions":[{"n":"Rend","kind":"atk","hit":3,"dmg":"1d6+1","dtype":"slashing","d":"reach 5 ft"},{"n":"Fetid Cloud (1/Day)","kind":"save","save":{"ability":"CON","dc":11},"d":"Constitution Saving Throw: DC 11, each creature in a 10-foot Emanation originating from the dretch. Failure: The target has the Poisoned condition until the end of its next turn. While Poisoned, the creature can take either an action or a Bonus Action on its turn, not both, and it can't take Reactions."}]},{"name":"Erinyes","cr":"12","cat":"fiend","ac":18,"hp":178,"hpF":"21d8+84","spd":"30 ft., Fly 60 ft.","mods":{"str":4,"dex":3,"con":4,"int":2,"wis":2,"cha":4},"saves":{"dex":7,"con":8,"cha":8},"resist":["cold"],"immune":["fire","poison"],"condImmune":["Poisoned"],"traits":[{"n":"Diabolical Restoration","d":"If the erinyes dies outside the Nine Hells, its body disappears in sulfurous smoke, and it gains a new body instantly, reviving with all its Hit Points somewhere in the Nine Hells."},{"n":"Magic Resistance","d":"The erinyes has Advantage on saving throws against spells and other magical effects."},{"n":"Magic Rope","d":"The erinyes has a magic rope. While bearing it, the erinyes can use the Entangling Rope action. The rope has AC 20, HP 90, and Immunity to Poison and Psychic damage. The rope turns to dust if reduced to 0 Hit Points, if it is 5+ feet away from the erinyes for 1 hour or more, or if the erinyes dies. If the rope is damaged or destroyed, the erinyes can fully restore it when finishing a Short or Long Rest."}],"multi":"The erinyes makes three Withering Sword attacks and can use Entangling Rope.","actions":[{"n":"Withering Sword","kind":"atk","hit":8,"dmg":"2d8+4","dtype":"slashing","extra":"2d10","extraType":"necrotic","d":"reach 5 ft"},{"n":"Entangling Rope (Requires Magic Rope)","kind":"save","save":{"ability":"STR","dc":16},"d":"Strength Saving Throw: DC 16, one creature the erinyes can see within 120 feet. Failure: 14 (4d6) Force damage, and the target has the Restrained condition until the rope is destroyed, the erinyes uses a Bonus Action to release the target, or the erinyes uses Entangling Rope again."}],"reactions":[{"n":"Parry","d":"Trigger: The erinyes is hit by a melee attack roll while holding a weapon. Response: The erinyes adds 4 to its AC against that attack, possibly causing it to miss.","acBonus":4}]},{"name":"Giant Eagle","cr":"1","cat":"fiend","ac":13,"hp":26,"hpF":"4d10+4","spd":"10 ft., Fly 80 ft.","mods":{"str":3,"dex":3,"con":1,"int":-1,"wis":2,"cha":0},"resist":["necrotic","radiant"],"multi":"The eagle makes two Rend attacks.","actions":[{"n":"Rend","kind":"atk","hit":5,"dmg":"1d4+3","dtype":"slashing","extra":"1d6","extraType":"radiant","d":"reach 5 ft"}]},{"name":"Giant Elk","cr":"2","cat":"fiend","ac":14,"hp":42,"hpF":"5d12+10","spd":"60 ft.","mods":{"str":4,"dex":4,"con":2,"int":-2,"wis":2,"cha":0},"saves":{"str":6,"dex":6},"resist":["necrotic","radiant"],"actions":[{"n":"Ram","kind":"atk","hit":6,"dmg":"2d6+4","dtype":"bludgeoning","extra":"2d4","extraType":"radiant","d":"reach 10 ft. If the target is a Huge or smaller creature and the elk moved 20+ feet straight toward it immediately before the hit, the target takes an extra 5 (2d4) Bludgeoning damage and has the Prone condition."}]},{"name":"Giant Owl","cr":"1/4","cat":"fiend","ac":12,"hp":19,"hpF":"3d10+3","spd":"5 ft., Fly 60 ft.","mods":{"str":1,"dex":2,"con":1,"int":0,"wis":2,"cha":0},"saves":{"wis":4},"resist":["necrotic","radiant"],"traits":[{"n":"Flyby","d":"The owl doesn't provoke an Opportunity Attack when it flies out of an enemy's reach."}],"actions":[{"n":"Talons","kind":"atk","hit":4,"dmg":"1d10+2","dtype":"slashing","d":"reach 5 ft"},{"n":"Spellcasting","kind":"text","d":"The owl casts one of the following spells, requiring no spell components and using Wisdom as the spellcasting ability: At Will: Detect Evil and Good, Detect Magic"}]},{"name":"Glabrezu","cr":"9","cat":"fiend","ac":17,"hp":189,"hpF":"18d10+90","spd":"40 ft.","mods":{"str":5,"dex":2,"con":5,"int":4,"wis":3,"cha":3},"saves":{"str":9,"con":9,"wis":7,"cha":7},"resist":["cold","fire","lightning"],"immune":["poison"],"condImmune":["Poisoned"],"traits":[{"n":"Demonic Restoration","d":"If the glabrezu dies outside the Abyss, its body dissolves into ichor, and it gains a new body instantly, reviving with all its Hit Points somewhere in the Abyss."},{"n":"Magic Resistance","d":"The glabrezu has Advantage on saving throws against spells and other magical effects."}],"multi":"The glabrezu makes two Pincer attacks and uses Pummel or Spellcasting.","actions":[{"n":"Pincer","kind":"atk","hit":9,"dmg":"2d10+5","dtype":"slashing","d":"reach 10 ft. If the target is a Medium or smaller creature, it has the Grappled condition (escape DC 15) from one of two pincers."},{"n":"Pummel","kind":"save","save":{"ability":"DEX","dc":17},"d":"Dexterity Saving Throw: DC 17, one creature Grappled by the glabrezu. Failure: 15 (3d6 + 5) Bludgeoning damage. Success: Half damage."},{"n":"Spellcasting","kind":"text","d":"The glabrezu casts one of the following spells, requiring no Material components and using Intelligence as the spellcasting ability (spell save DC 16): At Will: Darkness, Detect Magic, Dispel Magic 1/Day Each: Confusion, Fly, Power Word Stun"}]},{"name":"Guardian Naga","cr":"10","cat":"fiend","ac":18,"hp":136,"hpF":"16d10+48","spd":"40 ft., Climb 40 ft., Swim 40 ft.","mods":{"str":4,"dex":4,"con":3,"int":3,"wis":4,"cha":4},"saves":{"dex":8,"con":7,"int":7,"wis":8,"cha":8},"immune":["poison"],"condImmune":["Charmed","Paralyzed","Poisoned","Restrained"],"traits":[{"n":"Celestial Restoration","d":"If the naga dies, it returns to life in 1d6 days and regains all its Hit Points unless Dispel Evil and Good is cast on its remains."}],"multi":"The naga makes two Bite attacks. It can replace any attack with a use of Poisonous Spittle.","actions":[{"n":"Bite","kind":"atk","hit":8,"dmg":"2d12+4","dtype":"piercing","extra":"4d10","extraType":"poison","d":"reach 10 ft"},{"n":"Poisonous Spittle","kind":"save","save":{"ability":"CON","dc":16},"d":"Constitution Saving Throw: DC 16, one creature the naga can see within 60 feet. Failure: 31 (7d8) Poison damage, and the target has the Blinded condition until the start of the naga's next turn. Success: Half damage only. 296 System Reference Document 5.2.1"},{"n":"Spellcasting","kind":"text","d":"The naga casts one of the following spells, requiring no Somatic or Material components and using Wisdom as the spellcasting ability (spell save DC 16): 1/Day Each: Clairvoyance, Cure Wounds (level 6 version), Flame Strike (level 6 version), Geas, True Seeing"}]},{"name":"Hell Hound","cr":"3","cat":"fiend","ac":15,"hp":58,"hpF":"9d8+18","spd":"50 ft.","mods":{"str":3,"dex":1,"con":2,"int":-2,"wis":1,"cha":-2},"immune":["fire"],"traits":[{"n":"Pack Tactics","d":"The hound has Advantage on an attack roll against a creature if at least one of the hound's allies is within 5 feet of the creature and the ally doesn't have the Incapacitated condition."}],"multi":"The hound makes two Bite attacks.","actions":[{"n":"Bite","kind":"atk","hit":5,"dmg":"1d8+3","dtype":"piercing","extra":"1d6","extraType":"fire","d":"reach 5 ft"},{"n":"Fire Breath","kind":"save","save":{"ability":"DEX","dc":12},"rech":5,"d":"Dexterity Saving Throw: DC 12, each creature in a 15-foot Cone. Failure: 17 (5d6) Fire damage. Success: Half damage."}]},{"name":"Hezrou","cr":"8","cat":"fiend","ac":18,"hp":157,"hpF":"15d10+75","spd":"30 ft.","mods":{"str":4,"dex":3,"con":5,"int":-3,"wis":1,"cha":1},"saves":{"str":7,"con":8,"wis":4},"resist":["cold","fire","lightning"],"immune":["poison"],"condImmune":["Poisoned"],"traits":[{"n":"Demonic Restoration","d":"If the hezrou dies outside the Abyss, its body dissolves into ichor, and it gains a new body instantly, reviving with all its Hit Points somewhere in the Abyss."},{"n":"Magic Resistance","d":"The hezrou has Advantage on saving throws against spells and other magical effects."},{"n":"Stench","d":"Constitution Saving Throw: DC 16, any creature that starts its turn in a 10-foot Emanation originating from the hezrou. Failure: The target has the Poisoned condition until the start of its next turn."}],"multi":"The hezrou makes three Rend attacks.","actions":[{"n":"Rend","kind":"atk","hit":7,"dmg":"1d4+4","dtype":"slashing","extra":"2d8","extraType":"poison","d":"reach 5 ft"}],"bonus":[{"n":"Leap","d":"The hezrou jumps up to 30 feet by spending 10 feet of movement."}]},{"name":"Horned Devil","cr":"11","cat":"fiend","ac":18,"hp":199,"hpF":"19d10+95","spd":"30 ft., Fly 60 ft.","mods":{"str":6,"dex":3,"con":5,"int":1,"wis":3,"cha":4},"saves":{"str":10,"dex":7,"wis":7,"cha":8},"resist":["cold"],"immune":["fire","poison"],"condImmune":["Poisoned"],"traits":[{"n":"Diabolical Restoration","d":"If the devil dies outside the Nine Hells, its body disappears in sulfurous smoke, and it gains a new body instantly, reviving with all its Hit Points somewhere in the Nine Hells."},{"n":"Magic Resistance","d":"The devil has Advantage on saving throws against spells and other magical effects."}],"multi":"The devil makes three attacks, using Searing Fork or Hurl Flame in any combination. It can replace one attack with a use of Infernal Tail.","actions":[{"n":"Searing Fork","kind":"atk","hit":10,"dmg":"2d8+6","dtype":"piercing","extra":"2d8","extraType":"fire","d":"reach 10 ft"},{"n":"Hurl Flame","kind":"atk","hit":8,"dmg":"5d8+4","dtype":"fire","d":"range 150 ft. If the target is a flammable object that isn't being worn or carried, it starts burning."},{"n":"Infernal Tail","kind":"save","save":{"ability":"DEX","dc":17},"d":"Dexterity Saving Throw: DC 17, one creature the devil can see within 10 feet. Failure: 10 (1d8 + 6) Necrotic damage, and the target receives an infernal wound if it doesn't have one. While wounded, the target loses 10 (3d6) Hit Points at the start of each of its turns. The wound closes after 1 minute, after a spell restores Hit Points to the target, or after the target or a creature within 5 feet of it takes an action to stanch the wound, doing so by succeeding on a DC 17 Wisdom (Medicine) check."}]},{"name":"Ice Devil","cr":"14","cat":"fiend","ac":18,"hp":228,"hpF":"24d10+96","spd":"40 ft.","mods":{"str":5,"dex":2,"con":4,"int":4,"wis":2,"cha":4},"saves":{"dex":7,"con":9,"wis":7,"cha":9},"immune":["cold","fire","poison"],"condImmune":["Poisoned"],"traits":[{"n":"Diabolical Restoration","d":"If the devil dies outside the Nine Hells, its body disappears in sulfurous smoke, and it gains a new body instantly, reviving with all its Hit Points somewhere in the Nine Hells."},{"n":"Magic Resistance","d":"The devil has Advantage on saving throws against spells and other magical effects."}],"multi":"The devil makes three Ice Spear attacks. It can replace one attack with a Tail attack.","actions":[{"n":"Ice Spear","kind":"atk","hit":10,"dmg":"2d8+5","dtype":"piercing","extra":"3d6","extraType":"cold","d":"reach 5 ft. or range 30/120 ft. Until the end of its next turn, the target can't take a Bonus Action or Reaction, its Speed decreases by 10 feet, and it can move or take one action on its turn, not both. Hit or Miss: The spear magically returns to the devil's hand immediately after a ranged attack."},{"n":"Tail","kind":"atk","hit":10,"dmg":"3d6+5","dtype":"bludgeoning","extra":"4d8","extraType":"cold","d":"reach 10 ft"},{"n":"Ice Wall","kind":"text","rech":6,"d":"The devil casts Wall of Ice (level 8 version), requiring no spell components and using Intelligence as the spellcasting ability (spell save DC 17)."}]},{"name":"Imp","cr":"1","cat":"fiend","ac":13,"hp":21,"hpF":"6d4+6","spd":"20 ft., Fly 40 ft.","mods":{"str":-2,"dex":3,"con":1,"int":0,"wis":1,"cha":2},"resist":["cold"],"immune":["fire","poison"],"condImmune":["Poisoned"],"traits":[{"n":"Magic Resistance","d":"The imp has Advantage on saving throws against spells and other magical effects."}],"actions":[{"n":"Sting","kind":"atk","hit":5,"dmg":"1d6+3","dtype":"piercing","extra":"2d6","extraType":"poison","d":"reach 5 ft"},{"n":"Invisibility","kind":"text","d":"The imp casts Invisibility on itself, requiring no spell components and using Charisma as the spellcasting ability."},{"n":"Shape-Shift","kind":"text","d":"The imp shape-shifts to resemble a rat (Speed 20 ft.), a raven (20 ft., Fly 60 ft.), or a spider (20 ft., Climb 20 ft.), or it returns to its true form. Its game statistics are the same in each form, except for its Speed. Any equipment it is wearing or carrying isn't transformed."}]},{"name":"Incubus","cr":"4","cat":"fiend","ac":15,"hp":66,"hpF":"12d8+12","spd":"30 ft., Fly 60 ft.","mods":{"str":-1,"dex":3,"con":1,"int":2,"wis":1,"cha":5},"resist":["cold","fire","poison","psychic"],"traits":[{"n":"Succubus Form","d":"When the incubus finishes a Long Rest, it can shape-shift into a Succubus, using that stat block instead of this one. Any equipment it is wearing or carrying isn't transformed."}],"multi":"The incubus makes two Restless Touch attacks. 301 System Reference Document 5.2.1","actions":[{"n":"Restless Touch","kind":"atk","hit":7,"dmg":"3d6+5","dtype":"psychic","d":"reach 5 ft. and the target is cursed for 24 hours or until the incubus dies. Until the curse ends, the target gains no benefit from finishing Short Rests."},{"n":"Spellcasting","kind":"text","d":"The incubus casts one of the following spells, requiring no Material components and using Charisma as the spellcasting ability (spell save DC 15):"}],"bonus":[{"n":"Nightmare (Recharge 6)","d":"Wisdom Saving Throw: DC 15, one creature the incubus can see within 60 feet. Failure: If the target has 20 Hit Points or fewer, it has the Unconscious condition for 1 hour, until it takes damage, or until a creature within 5 feet of it takes an action to wake it. Otherwise, the target takes 18 (4d8) Psychic damage."}]},{"name":"Lamia","cr":"4","cat":"fiend","ac":13,"hp":97,"hpF":"13d10+26","spd":"40 ft.","mods":{"str":3,"dex":1,"con":2,"int":2,"wis":2,"cha":3},"multi":"The lamia makes two Claw attacks. It can replace one attack with a use of Corrupting Touch.","actions":[{"n":"Claw","kind":"atk","hit":5,"dmg":"1d8+3","dtype":"slashing","extra":"2d6","extraType":"psychic","d":"reach 5 ft"},{"n":"Corrupting Touch","kind":"save","save":{"ability":"WIS","dc":13},"d":"Wisdom Saving Throw: DC 13, one creature the lamia can see within 5 feet. Failure: 13 (3d8) Psychic damage, and the target is cursed for 1 hour. Until the curse ends, the target has the Charmed and Poisoned conditions."},{"n":"Spellcasting","kind":"text","d":"The lamia casts one of the following spells, requiring no Material components and using Charisma as the spellcasting ability (spell save DC 13): At Will: Disguise Self (can appear as a Large or Medium biped), Minor Illusion"}],"bonus":[{"n":"Leap","d":"The lamia jumps up to 30 feet by spending 10 feet of movement."}]},{"name":"Lemure","cr":"0","cat":"fiend","ac":9,"hp":9,"hpF":"2d8","spd":"20 ft.","mods":{"str":0,"dex":-3,"con":0,"int":-5,"wis":0,"cha":-4},"resist":["cold"],"immune":["fire","poison"],"condImmune":["Charmed","Frightened","Poisoned"],"traits":[{"n":"Hellish Restoration","d":"If the lemure dies in the Nine Hells, it revives with all its Hit Points in 1d10 days unless it is killed by a creature under the effects of a Bless spell or its remains are sprinkled with Holy Water."}],"actions":[{"n":"Vile Slime","kind":"atk","hit":2,"dmg":"1d4","dtype":"poison","d":"reach 5 ft"}]},{"name":"Marilith","cr":"16","cat":"fiend","ac":16,"hp":220,"hpF":"21d10+105","spd":"40 ft., Climb 40 ft.","mods":{"str":4,"dex":5,"con":5,"int":4,"wis":3,"cha":5},"saves":{"str":9,"con":10,"wis":8,"cha":10},"resist":["cold","fire","lightning"],"immune":["poison"],"condImmune":["Poisoned"],"traits":[{"n":"Demonic Restoration","d":"If the marilith dies outside the Abyss, its body dissolves into ichor, and it gains a new body instantly, reviving with all its Hit Points somewhere in the Abyss."},{"n":"Magic Resistance","d":"The marilith has Advantage on saving throws against spells and other magical effects. 306 System Reference Document 5.2.1"},{"n":"Reactive","d":"The marilith can take one Reaction on every turn of combat."}],"multi":"The marilith makes six Pact Blade attacks and uses Constrict.","actions":[{"n":"Pact Blade","kind":"atk","hit":10,"dmg":"1d10+5","dtype":"slashing","extra":"2d6","extraType":"necrotic","d":"reach 5 ft"},{"n":"Constrict","kind":"save","save":{"ability":"STR","dc":17},"d":"Strength Saving Throw: DC 17, one Medium or smaller creature the marilith can see within 5 feet. Failure: 15 (2d10 + 4) Bludgeoning damage. The target has the Grappled condition (escape DC 14), and it has the Restrained condition until the grapple ends."}],"bonus":[{"n":"Teleport (Recharge 5-6)","d":"The marilith teleports up to 120 feet to an unoccupied space it can see."}],"reactions":[{"n":"Parry","d":"Trigger: The marilith is hit by a melee attack roll while holding a weapon. Response: The marilith adds 5 to its AC against that attack, possibly causing it to miss.","acBonus":5}]},{"name":"Nalfeshnee","cr":"13","cat":"fiend","ac":18,"hp":184,"hpF":"16d10+96","spd":"20 ft., Fly 30 ft.","mods":{"str":5,"dex":0,"con":6,"int":4,"wis":1,"cha":2},"saves":{"con":11,"int":9,"wis":6,"cha":7},"resist":["cold","fire","lightning"],"immune":["poison"],"condImmune":["Frightened","Poisoned"],"traits":[{"n":"Demonic Restoration","d":"If the nalfeshnee dies outside the Abyss, its body dissolves into ichor, and it gains a new body instantly, reviving with all its Hit Points somewhere in the Abyss."},{"n":"Magic Resistance","d":"The nalfeshnee has Advantage on saving throws against spells and other magical effects."}],"multi":"The nalfeshnee makes three Rend attacks.","actions":[{"n":"Rend","kind":"atk","hit":10,"dmg":"2d10+5","dtype":"slashing","extra":"2d10","extraType":"force","d":"reach 10 ft"},{"n":"Teleport","kind":"text","d":"The nalfeshnee teleports up to 120 feet to an unoccupied space it can see."}],"bonus":[{"n":"Horror Nimbus (Recharge 5-6)","d":"Wisdom Saving Throw: DC 15, each creature in a 15-foot Emanation originating from the nalfeshnee. Failure: 28 (8d6) Psychic damage, and the target has the Frightened condition for 1 minute, until it takes damage, or until it ends its turn with the nalfeshnee out of line of sight. Success: The target is immune to this nalfeshnee's Horror Nimbus for 24 hours."}],"reactions":[{"n":"Pursuit","d":"Trigger: Another creature the nalfeshnee can see ends its move within 120 feet of the nalfeshnee. Response: The nalfeshnee uses Teleport, but its destination space must be within 10 feet of the triggering creature."}]},{"name":"Night Hag","cr":"5","cat":"fiend","ac":17,"hp":112,"hpF":"15d8+45","spd":"30 ft.","mods":{"str":4,"dex":2,"con":3,"int":3,"wis":2,"cha":3},"resist":["cold","fire"],"condImmune":["Charmed"],"traits":[{"n":"Coven Magic","d":"While within 30 feet of at least two hag allies, the hag can cast one of the following spells, requiring no Material components, using the spell's normal casting time, and using Intelligence as the spellcasting ability (spell save DC 14): Augury, Find Familiar, Identify, Locate Object, Scrying, or Unseen Servant. The hag must finish a Long Rest before using this trait to cast that spell again."},{"n":"Magic Resistance","d":"The hag has Advantage on saving throws against spells and other magical effects."},{"n":"Soul Bag","d":"The hag has a soul bag. While holding or carrying the bag, the hag can use its Nightmare Haunting action. The bag has AC 15, HP 20, and Resistance to all damage. The bag turns to dust if reduced to 0 Hit Points. If the bag is destroyed, any souls the bag is holding are released. The hag can create a new bag after 7 days."}],"multi":"The hag makes two Claw attacks.","actions":[{"n":"Claw","kind":"atk","hit":7,"dmg":"2d8+4","dtype":"slashing","d":"reach 5 ft"},{"n":"Nightmare Haunting (1/Day; Requires Soul Bag)","kind":"text","d":"While on the Ethereal Plane, the hag casts Dream, using the same spellcasting ability as Spellcasting. Only the hag can serve as the spell's messenger, and the tar- 311 System Reference Document 5.2.1 get must be a creature the hag can see on the Material Plane. The spell fails and is wasted if the target is under the effect of the Protection from Evil and Good spell or within a Magic Circle spell. If the target takes damage from the Dream spell, the target's Hit Point maximum decreases by an amount equal to that damage. If the spell kills the target, its soul is trapped in the hag's soul bag, and the target can't be raised from the dead until its soul is released."},{"n":"Spellcasting","kind":"text","d":"The hag casts one of the following spells, requiring no Material components and using Intelligence as the spellcasting ability (spell save DC 14): At Will: Detect Magic, Etherealness, Magic Missile (level 4 version) 2/Day Each: Phantasmal Killer, Plane Shift (self only)"}],"bonus":[{"n":"Shape-Shift","d":"The hag shape-shifts into a Small or Medium Humanoid, or it returns to its true form. Other than its size, its game statistics are the same in each form. Any equipment it is wearing or carrying isn't transformed."}]},{"name":"Nightmare","cr":"3","cat":"fiend","ac":13,"hp":68,"hpF":"8d10+24","spd":"60 ft., Fly 90 ft. (hover)","mods":{"str":4,"dex":2,"con":3,"int":0,"wis":1,"cha":2},"immune":["fire"],"traits":[{"n":"Confer Fire Resistance","d":"The nightmare can grant Resistance to Fire damage to a rider while it is on the nightmare."},{"n":"Illumination","d":"The nightmare sheds Bright Light in a 10foot radius and Dim Light for an additional 10 feet."}],"actions":[{"n":"Hooves","kind":"atk","hit":6,"dmg":"2d8+4","dtype":"bludgeoning","extra":"3d6","extraType":"fire","d":"reach 5 ft"},{"n":"Ethereal Stride","kind":"text","d":"The nightmare and up to three willing creatures within 5 feet of it teleport to the Ethereal Plane from the Material Plane or vice versa."}]},{"name":"Oni","cr":"7","cat":"fiend","ac":17,"hp":119,"hpF":"14d10+42","spd":"30 ft., Fly 30 ft. (hover)","mods":{"str":4,"dex":0,"con":3,"int":2,"wis":1,"cha":2},"saves":{"dex":3,"con":6,"wis":4,"cha":5},"resist":["cold"],"traits":[{"n":"Regeneration","d":"The oni regains 10 Hit Points at the start of each of its turns if it has at least 1 Hit Point."}],"multi":"The oni makes two Claw or Nightmare Ray attacks. It can replace one attack with a use of Spellcasting.","actions":[{"n":"Claw","kind":"atk","hit":7,"dmg":"1d12+4","dtype":"slashing","extra":"2d8","extraType":"necrotic","d":"reach 10 ft"},{"n":"Nightmare Ray","kind":"atk","hit":5,"dmg":"2d6+2","dtype":"psychic","d":"range 60 ft. and the target has the Frightened condition until the start of the oni's next turn."},{"n":"Shape-Shift","kind":"text","d":"The oni shape-shifts into a Small or Medium Humanoid or a Large Giant, or it returns to its true form. Other than its size, its game statistics are the same in each form. Any equipment it is wearing or carrying isn't transformed."},{"n":"Spellcasting","kind":"text","d":"The oni casts one of the following spells, requiring no Material components and using Charisma as the spellcasting ability (spell save DC 13): 1/Day Each: Charm Person (level 2 version), Darkness, Gaseous Form, Sleep"}],"bonus":[{"n":"Invisibility","d":"The oni casts Invisibility on itself, requiring no spell components and using the same spellcasting ability as Spellcasting."}]},{"name":"Pegasus","cr":"2","cat":"fiend","ac":12,"hp":59,"hpF":"7d10+21","spd":"60 ft., Fly 90 ft.","mods":{"str":4,"dex":2,"con":3,"int":0,"wis":2,"cha":1},"saves":{"dex":4,"con":5,"wis":4,"cha":3},"actions":[{"n":"Hooves","kind":"atk","hit":6,"dmg":"1d6+4","dtype":"bludgeoning","extra":"2d4","extraType":"radiant","d":"reach 5 ft"}]},{"name":"Pit Fiend","cr":"20","cat":"fiend","ac":21,"hp":337,"hpF":"27d10+189","spd":"30 ft., Fly 60 ft.","mods":{"str":8,"dex":2,"con":7,"int":6,"wis":4,"cha":7},"saves":{"dex":8,"wis":10},"resist":["cold"],"immune":["fire","poison"],"condImmune":["Poisoned"],"traits":[{"n":"Diabolical Restoration","d":"If the pit fiend dies outside the Nine Hells, its body disappears in sulfurous smoke, and it gains a new body instantly, reviving with all its Hit Points somewhere in the Nine Hells."},{"n":"Fear Aura","d":"The pit fiend emanates an aura in a 20foot Emanation while it doesn't have the Incapacitated condition. Wisdom Saving Throw: DC 21, any enemy that starts its turn in the aura. Failure: The target has the Frightened condition until the start of its next turn. Success: The target is immune to this pit fiend's aura for 24 hours."},{"n":"Legendary Resistance (4/Day)","d":"If the pit fiend fails a saving throw, it can choose to succeed instead."},{"n":"Magic Resistance","d":"The pit fiend has Advantage on saving throws against spells and other magical effects."}],"multi":"The pit fiend makes one Bite attack, two Devilish Claw attacks, and one Fiery Mace attack.","actions":[{"n":"Bite","kind":"atk","hit":14,"dmg":"3d6+8","dtype":"piercing","d":"reach 10 ft. If the target is a creature, it must make the following saving throw. Constitution Saving Throw: DC 21. Failure: The target has the Poisoned condition. While Poisoned, the target can't regain Hit Points and takes 21 (6d6) Poison damage at the start of each of its turns, and it repeats the save at the end of each of its turns, ending the effect on itself on a success. After 1 minute, it succeeds automatically."},{"n":"Devilish Claw","kind":"atk","hit":14,"dmg":"4d8+8","dtype":"necrotic","d":"reach 10 ft"},{"n":"Fiery Mace","kind":"atk","hit":14,"dmg":"4d6+8","dtype":"force","extra":"6d6","extraType":"fire","d":"reach 10 ft"},{"n":"Hellfire Spellcasting","kind":"text","rech":4,"d":"The pit fiend casts Fireball (level 5 version) twice, requiring no Material components and using Charisma as the spellcasting ability (spell save DC 21). It can replace one Fireball with Hold Monster (level 7 version) or Wall of Fire. 315 System Reference Document 5.2.1"}],"legRes":4},{"name":"Planetar","cr":"16","cat":"fiend","ac":19,"hp":262,"hpF":"21d10+147","spd":"40 ft., Fly 120 ft. (hover)","mods":{"str":7,"dex":5,"con":7,"int":4,"wis":6,"cha":7},"saves":{"str":12,"con":12,"wis":11,"cha":12},"resist":["radiant"],"condImmune":["Charmed","Exhaustion","Frightened"],"traits":[{"n":"Divine Awareness","d":"The planetar knows if it hears a lie."},{"n":"Exalted Restoration","d":"If the planetar dies outside Mount Celestia, its body disappears, and it gains a new body instantly, reviving with all its Hit Points somewhere in Mount Celestia."},{"n":"Magic Resistance","d":"The planetar has Advantage on saving throws against spells and other magical effects."}],"multi":"The planetar makes three Radiant Sword attacks or uses Holy Burst twice.","actions":[{"n":"Radiant Sword","kind":"atk","hit":12,"dmg":"2d6+7","dtype":"slashing","extra":"4d8","extraType":"radiant","d":"reach 10 ft"},{"n":"Holy Burst","kind":"save","save":{"ability":"DEX","dc":20},"d":"Dexterity Saving Throw: DC 20, each enemy in a 20-foot-radius Sphere centered on a point the planetar can see within 120 feet. Failure: 24 (7d6) Radiant damage. Success: Half damage."},{"n":"Spellcasting","kind":"text","d":"The planetar casts one of the following spells, requiring no Material components and using Charisma as spellcasting ability (spell save DC 20): 1/Day Each: Commune, Control Weather, Dispel Evil and Good, Raise Dead"}],"bonus":[{"n":"Divine Aid (2/Day)","d":"The planetar casts Cure Wounds, Invisibility, Lesser Restoration, or Remove Curse, using the same spellcasting ability as Spellcasting."}]},{"name":"Quasit","cr":"1","cat":"fiend","ac":13,"hp":25,"hpF":"10d4","spd":"40 ft.","mods":{"str":-3,"dex":3,"con":0,"int":-2,"wis":0,"cha":0},"resist":["cold","fire","lightning"],"immune":["poison"],"condImmune":["Poisoned"],"traits":[{"n":"Magic Resistance","d":"The quasit has Advantage on saving throws against spells and other magical effects."}],"actions":[{"n":"Rend","kind":"atk","hit":5,"dmg":"1d4+3","dtype":"slashing","d":"reach 5 ft. and the target has the Poisoned condition until the start of the quasit's next turn."},{"n":"Invisibility","kind":"text","d":"The quasit casts Invisibility on itself, requiring no spell components and using Charisma as the spellcasting ability."},{"n":"Scare (1/Day)","kind":"save","save":{"ability":"WIS","dc":10},"d":"Wisdom Saving Throw: DC 10, one creature within 20 feet. Failure: The target has the Frightened condition. At the end of each of its turns, the target repeats the save, ending the effect on itself on a success. After 1 minute, it succeeds automatically."},{"n":"Shape-Shift","kind":"text","d":"The quasit shape-shifts to resemble a bat (Speed 10 ft., Fly 40 ft.), a centipede (40 ft., Climb 40 ft.), or a toad (40 ft., Swim 40 ft.), or it returns to its true form. Its game statistics are the same in each form, except for its Speed. Any equipment it is wearing or carrying isn't transformed."}]},{"name":"Rakshasa","cr":"13","cat":"fiend","ac":17,"hp":221,"hpF":"26d8+104","spd":"40 ft.","mods":{"str":2,"dex":3,"con":4,"int":1,"wis":3,"cha":5},"condImmune":["Charmed","Frightened"],"traits":[{"n":"Greater Magic Resistance","d":"The rakshasa automatically succeeds on saving throws against spells and other magical effects, and the attack rolls of spells automatically miss it. Without the rakshasa's permission, no spell can observe the rakshasa remotely or detect its thoughts, creature type, or alignment."},{"n":"Fiendish Restoration","d":"If the rakshasa dies outside the Nine Hells, its body turns to ichor, and it gains a new body instantly, reviving with all its Hit Points somewhere in the Nine Hells."}],"multi":"The rakshasa makes three Cursed Touch attacks.","actions":[{"n":"Cursed Touch","kind":"atk","hit":10,"dmg":"2d6+5","dtype":"slashing","extra":"3d12","extraType":"necrotic","d":"reach 5 ft. If the target is a creature, it is cursed. While cursed, the target gains no benefit from finishing a Short or Long Rest."},{"n":"Baleful Command","kind":"save","save":{"ability":"WIS","dc":18},"rech":5,"d":"Wisdom Saving Throw: DC 18, each enemy in a 30-foot Emanation originating from the rakshasa. Failure: 28 (8d6) Psychic damage, and the target has the Frightened and Incapacitated conditions until the start of the rakshasa's next turn."},{"n":"Spellcasting","kind":"text","d":"The rakshasa casts one of the following spells, requiring no Material components and using Charisma as the spellcasting ability (spell save DC 18): At Will: Detect Magic, Detect Thoughts, Disguise Self, Mage Hand, Minor Illusion 1/Day Each: Fly, Invisibility, Major Image, Plane Shift"}]},{"name":"Sahuagin Warrior","cr":"1/2","cat":"fiend","ac":12,"hp":22,"hpF":"4d8+4","spd":"30 ft., Swim 40 ft.","mods":{"str":1,"dex":0,"con":1,"int":1,"wis":1,"cha":-1},"resist":["acid","cold"],"traits":[{"n":"Blood Frenzy","d":"The sahuagin has Advantage on attack rolls against any creature that doesn't have all its Hit Points."},{"n":"Limited Amphibiousness","d":"The sahuagin can breathe air and water, but it must be submerged at least once every 4 hours to avoid suffocating outside water."},{"n":"Shark Telepathy","d":"The sahuagin can magically control sharks within 120 feet of itself, using a special telepathy."}],"multi":"The sahuagin makes two Claw attacks.","actions":[{"n":"Claw","kind":"atk","hit":3,"dmg":"1d6+1","dtype":"slashing","d":"reach 5 ft"}],"bonus":[{"n":"Aquatic Charge","d":"The sahuagin swims up to its Swim Speed straight toward an enemy it can see. 321 System Reference Document 5.2.1"}]},{"name":"Solar","cr":"21","cat":"fiend","ac":21,"hp":297,"hpF":"22d10+176","spd":"50 ft., Fly 150 ft. (hover)","mods":{"str":8,"dex":6,"con":8,"int":7,"wis":7,"cha":10},"immune":["poison","radiant"],"condImmune":["Charmed","Exhaustion","Frightened","Poisoned"],"traits":[{"n":"Divine Awareness","d":"The solar knows if it hears a lie."},{"n":"Exalted Restoration","d":"If the solar dies outside Mount Celestia, its body disappears, and it gains a new body instantly, reviving with all its Hit Points somewhere in Mount Celestia."},{"n":"Legendary Resistance (4/Day)","d":"If the solar fails a saving throw, it can choose to succeed instead."},{"n":"Magic Resistance","d":"The solar has Advantage on saving throws against spells and other magical effects."}],"multi":"The solar makes two Flying Sword attacks. It can replace one attack with a use of Slaying Bow.","actions":[{"n":"Flying Sword","kind":"atk","hit":15,"dmg":"4d6+8","dtype":"slashing","extra":"8d8","extraType":"radiant","d":"reach 10 ft. or range 120 ft. Hit or Miss: The sword magically returns to the solar's hand or hovers within 5 feet of the solar immediately after a ranged attack."},{"n":"Slaying Bow","kind":"save","save":{"ability":"DEX","dc":21},"d":"Dexterity Saving Throw: DC 21, one creature the solar can see within 600 feet. Failure: If the creature has 100 Hit Points or fewer, it dies. It otherwise takes 24 (4d8 + 6) Piercing damage plus 36 (8d8) Radiant damage."},{"n":"Spellcasting","kind":"text","d":"The solar casts one of the following spells, requiring no Material components and using Charisma as the spellcasting ability (spell save DC 25): 1/Day Each: Commune, Control Weather, Dispel Evil and Good, Resurrection"}],"bonus":[{"n":"Divine Aid (3/Day)","d":"The solar casts Cure Wounds (level 2 version), Lesser Restoration, or Remove Curse, using the same spellcasting ability as Spellcasting."}],"legendary":{"count":3,"options":[{"n":"Blinding Gaze","d":"Constitution Saving Throw: DC 25, one creature the solar can see within 120 feet. Failure: The target has the Blinded condition for 1 minute. Failure or Success: The solar can't take this action again until the start of its next turn."},{"n":"Radiant Teleport","d":"The solar teleports up to 60 feet to an unoccupied space it can see. Dexterity Saving Throw: DC 25, each creature in a 10-foot Emanation originating from the solar at its destination space. Failure: 11 (2d10) Radiant damage. Success: Half damage."}]},"legRes":4},{"name":"Sphinx of Lore","cr":"11","cat":"fiend","ac":17,"hp":170,"hpF":"20d10+60","spd":"40 ft., Fly 60 ft.","mods":{"str":4,"dex":2,"con":3,"int":4,"wis":4,"cha":4},"resist":["necrotic","radiant"],"immune":["psychic"],"condImmune":["Charmed","Frightened"],"traits":[{"n":"Inscrutable","d":"No magic can observe the sphinx remotely or detect its thoughts without its permission. Wisdom (Insight) checks made to ascertain its intentions or sincerity are made with Disadvantage."},{"n":"Legendary Resistance (3/Day, or 4/Day in Lair)","d":"If the sphinx fails a saving throw, it can choose to succeed instead."}],"multi":"The sphinx makes three Claw attacks.","actions":[{"n":"Claw","kind":"atk","hit":8,"dmg":"3d6+4","dtype":"slashing","d":"reach 5 ft"},{"n":"Mind-Rending Roar","kind":"save","save":{"ability":"WIS","dc":16},"rech":5,"d":"Wisdom Saving Throw: DC 16, each enemy in a 300-foot Emanation originating from the sphinx. Failure: 35 (10d6) Psychic damage, and the target has the Incapacitated condition until the start of the sphinx's next turn."},{"n":"Spellcasting","kind":"text","d":"The sphinx casts one of the following spells, requiring no Material components and using Intelligence as the spellcasting ability (spell save DC 16): At Will: Detect Magic, Identify, Mage Hand, Minor Illusion, Prestidigitation 1/Day Each: Dispel Magic, Legend Lore, Locate Object, Plane Shift, Remove Curse, Tongues"}],"legendary":{"count":3,"options":[{"n":"Arcane Prowl","d":"The sphinx can teleport up to 30 feet to an unoccupied space it can see, and it makes one Claw attack."},{"n":"Weight of Years","d":"Constitution Saving Throw: DC 16, one creature the sphinx can see within 120 feet. Failure: The target gains 1 Exhaustion level. While the target has any Exhaustion levels, it appears 3d10 years older. Failure or Success: The sphinx can't take this action again until the start of its next turn."}]},"legRes":3},{"name":"Sphinx of Valor","cr":"17","cat":"fiend","ac":17,"hp":199,"hpF":"19d10+95","spd":"40 ft., Fly 60 ft.","mods":{"str":6,"dex":0,"con":5,"int":3,"wis":6,"cha":4},"saves":{"dex":6,"con":11,"int":9,"wis":12},"resist":["necrotic","radiant"],"immune":["psychic"],"condImmune":["Charmed","Frightened"],"traits":[{"n":"Inscrutable","d":"No magic can observe the sphinx remotely or detect its thoughts without its permission. Wisdom (Insight) checks made to ascertain its intentions or sincerity are made with Disadvantage. 328 System Reference Document 5.2.1"},{"n":"Legendary Resistance (3/Day, or 4/Day in Lair)","d":"If the sphinx fails a saving throw, it can choose to succeed instead."}],"multi":"The sphinx makes two Claw attacks and uses Roar.","actions":[{"n":"Claw","kind":"atk","hit":12,"dmg":"4d6+6","dtype":"slashing","d":"reach 5 ft"},{"n":"Roar (3/Day)","kind":"text","d":"The sphinx emits a magical roar. Whenever it roars, the roar has a different effect, as detailed below (the sequence resets when it takes a Long Rest):"},{"n":"First Roar","kind":"save","save":{"ability":"WIS","dc":20},"d":"Wisdom Saving Throw: DC 20, each enemy in a 500-foot Emanation originating from the sphinx. Failure: The target has the Frightened condition for 1 minute."},{"n":"Second Roar","kind":"save","save":{"ability":"WIS","dc":20},"d":"Wisdom Saving Throw: DC 20, each enemy in a 500-foot Emanation originating from the sphinx. Failure: The target has the Paralyzed condition, and it repeats the save at the end of each of its turns, ending the effect on itself on a success. After 1 minute, it succeeds automatically."},{"n":"Third Roar","kind":"save","save":{"ability":"CON","dc":20},"d":"Constitution Saving Throw: DC 20, each enemy in a 500-foot Emanation originating from the sphinx. Failure: 44 (8d10) Thunder damage, and the target has the Prone condition. Success: Half damage only."},{"n":"Spellcasting","kind":"text","d":"The sphinx casts one of the following spells, requiring no Material components and using Wisdom as the spellcasting ability (spell save DC 20): At Will: Detect Evil and Good, Thaumaturgy 1/Day Each: Detect Magic, Dispel Magic, Greater Restoration, Heroes' Feast, Zone of Truth"}],"legendary":{"count":3,"options":[{"n":"Arcane Prowl","d":"The sphinx can teleport up to 30 feet to an unoccupied space it can see, and it makes one Claw attack."},{"n":"Weight of Years","d":"Constitution Saving Throw: DC 16, one creature the sphinx can see within 120 feet. Failure: The target gains 1 Exhaustion level. While the target has any Exhaustion levels, it appears 3d10 years older. Failure or Success: The sphinx can't take this action again until the start of its next turn."}]},"legRes":3},{"name":"Sphinx of Wonder","cr":"1","cat":"fiend","ac":13,"hp":24,"hpF":"7d4+7","spd":"20 ft., Fly 40 ft.","mods":{"str":-2,"dex":3,"con":1,"int":2,"wis":1,"cha":0},"resist":["necrotic","psychic","radiant"],"traits":[{"n":"Magic Resistance","d":"The sphinx has Advantage on saving throws against spells and other magical effects."}],"actions":[{"n":"Rend","kind":"atk","hit":5,"dmg":"1d4+3","dtype":"slashing","extra":"2d6","extraType":"radiant","d":"reach 5 ft"}],"reactions":[{"n":"Burst of Ingenuity (2/Day)","d":"Trigger: The sphinx or another creature within 30 feet makes an ability check or a saving throw. Response: The sphinx adds 2 to the roll."}]},{"name":"Spirit Naga","cr":"8","cat":"fiend","ac":17,"hp":135,"hpF":"18d10+36","spd":"40 ft.","mods":{"str":4,"dex":3,"con":2,"int":3,"wis":2,"cha":3},"saves":{"dex":6,"con":5,"wis":5,"cha":6},"immune":["poison"],"condImmune":["Charmed","Poisoned"],"traits":[{"n":"Fiendish Restoration","d":"If it dies, the naga returns to life in 1d6 days and regains all its Hit Points. Only a Wish spell can prevent this trait from functioning."}],"multi":"The naga makes three attacks, using Bite or Necrotic Ray in any combination.","actions":[{"n":"Bite","kind":"atk","hit":7,"dmg":"1d6+4","dtype":"piercing","extra":"4d6","extraType":"poison","d":"reach 10 ft"},{"n":"Necrotic Ray","kind":"atk","hit":6,"dmg":"6d6","dtype":"necrotic","d":"range 60 ft"},{"n":"Spellcasting","kind":"text","d":"The naga casts one of the following spells, requiring no Somatic or Material components and using Intelligence as the spellcasting ability (spell save DC 14): At Will: Detect Magic, Mage Hand, Minor Illusion, Water Breathing 2/Day Each: Detect Thoughts, Dimension Door, Hold Person (level 3 version), Lightning Bolt (level 4 version)"}]},{"name":"Succubus","cr":"4","cat":"fiend","ac":15,"hp":71,"hpF":"13d8+13","spd":"30 ft., Fly 60 ft.","mods":{"str":-1,"dex":3,"con":1,"int":2,"wis":1,"cha":5},"resist":["cold","fire","poison","psychic"],"traits":[{"n":"Incubus Form","d":"When the succubus finishes a Long Rest, it can shape-shift into an Incubus, using that stat block instead of this one."}],"multi":"The succubus makes one Fiendish Touch attack and uses Charm or Draining Kiss.","actions":[{"n":"Fiendish Touch","kind":"atk","hit":7,"dmg":"2d10+5","dtype":"psychic","d":"reach 5 ft. 331 System Reference Document 5.2.1"},{"n":"Charm","kind":"text","d":"The succubus casts Dominate Person (level 8 version), requiring no spell components and using Charisma as the spellcasting ability (spell save DC 15)."},{"n":"Draining Kiss","kind":"save","save":{"ability":"CON","dc":15},"d":"Constitution Saving Throw: DC 15, one creature Charmed by the succubus within 5 feet. Failure: 13 (3d8) Psychic damage. Success: Half damage. Failure or Success: The target's Hit Point maximum decreases by an amount equal to the damage taken."}],"bonus":[{"n":"Shape-Shift","d":"The succubus shape-shifts into a Medium or Small Humanoid, or it returns to its true form. Its game statistics are the same in each form, except its Fly Speed is available only in its true form. Any equipment it is wearing or carrying isn't transformed."}]},{"name":"Unicorn","cr":"5","cat":"fiend","ac":12,"hp":97,"hpF":"13d10+26","spd":"50 ft.","mods":{"str":4,"dex":2,"con":2,"int":0,"wis":3,"cha":3},"immune":["poison"],"condImmune":["Charmed","Paralyzed","Poisoned"],"traits":[{"n":"Legendary Resistance (3/Day)","d":"If the unicorn fails a saving throw, it can choose to succeed instead."},{"n":"Magic Resistance","d":"The unicorn has Advantage on saving throws against spells and other magical effects."}],"multi":"The unicorn makes one Hooves attack and one Radiant Horn attack.","actions":[{"n":"Hooves","kind":"atk","hit":7,"dmg":"2d6+4","dtype":"bludgeoning","d":"reach 5 ft"},{"n":"Radiant Horn","kind":"atk","hit":7,"dmg":"1d10+4","dtype":"radiant","d":"reach 5 ft"},{"n":"Spellcasting","kind":"text","d":"The unicorn casts one of the following spells, requiring no spell components and using Charisma as the spellcasting ability (spell save DC 14): At Will: Detect Evil and Good, Druidcraft 1/Day Each: Calm Emotions, Dispel Evil and Good, Entangle, Pass without Trace, Word of Recall"}],"bonus":[{"n":"Unicorn's Blessing (3/Day)","d":"The unicorn touches another creature with its horn and casts Cure Wounds or Lesser Restoration on that creature, using the same spellcasting ability as Spellcasting."}],"legendary":{"count":3,"options":[{"n":"Charging Horn","d":"The unicorn moves up to half its Speed without provoking Opportunity Attacks, and it makes one Radiant Horn attack."},{"n":"Shimmering Shield","d":"The unicorn targets itself or one creature it can see within 60 feet of itself. The target gains 10 (3d6) Temporary Hit Points, and its AC increases by 2 until the end of the unicorn's next turn. 334 System Reference Document 5.2.1 The unicorn can't take this action again until the start of its next turn."}]},"legRes":3},{"name":"Vrock","cr":"6","cat":"fiend","ac":15,"hp":152,"hpF":"16d10+64","spd":"40 ft., Fly 60 ft.","mods":{"str":3,"dex":2,"con":4,"int":-1,"wis":1,"cha":-1},"saves":{"dex":5,"wis":4,"cha":2},"resist":["cold","fire","lightning"],"immune":["poison"],"condImmune":["Poisoned"],"traits":[{"n":"Demonic Restoration","d":"If the vrock dies outside the Abyss, its body dissolves into ichor, and it gains a new body instantly, reviving with all its Hit Points somewhere in the Abyss."},{"n":"Magic Resistance","d":"The vrock has Advantage on saving throws against spells and other magical effects."}],"multi":"The vrock makes two Shred attacks.","actions":[{"n":"Shred","kind":"atk","hit":6,"dmg":"2d6+3","dtype":"piercing","extra":"3d6","extraType":"poison","d":"reach 5 ft"},{"n":"Spores","kind":"save","save":{"ability":"CON","dc":15},"rech":6,"d":"Constitution Saving Throw: DC 15, each creature in a 20-foot Emanation originating from the vrock. Failure: The target has the Poisoned condition and repeats the save at the end of each of its turns, ending the effect on itself on a success. While Poisoned, the target takes 5 (1d10) Poison damage at the start of each of its turns. Emptying a flask of Holy Water on the target ends the effect early."},{"n":"Stunning Screech (1/Day)","kind":"save","save":{"ability":"CON","dc":15},"d":"Constitution Saving Throw: DC 15, each creature in a 20-foot Emanation originating from the vrock (demons succeed automatically). Failure: 10 (3d6) Thunder damage, and the target has the Stunned condition until the end of the vrock's next turn."}]},{"name":"Cloud Giant","cr":"9","cat":"giant","ac":14,"hp":200,"hpF":"16d12+96","spd":"40 ft., Fly 20 ft. (hover)","mods":{"str":8,"dex":0,"con":6,"int":1,"wis":3,"cha":3},"saves":{"con":10,"wis":7},"multi":"The giant makes two attacks, using Thunderous Mace or Thundercloud in any combination. It can replace one attack with a use of Spellcasting to cast Fog Cloud.","actions":[{"n":"Thunderous Mace","kind":"atk","hit":12,"dmg":"3d8+8","dtype":"bludgeoning","extra":"2d6","extraType":"thunder","d":"reach 10 ft"},{"n":"Thundercloud","kind":"atk","hit":12,"dmg":"3d6+8","dtype":"thunder","d":"range 240 ft. and the target has the Incapacitated condition until the end of its next turn."},{"n":"Spellcasting","kind":"text","d":"The giant casts one of the following spells, requiring no Material components and using Charisma as the spellcasting ability (spell save DC 15): 1/Day Each: Control Weather, Gaseous Form, Telekinesis"}],"bonus":[{"n":"Misty Step","d":"The giant casts the Misty Step spell, using the same spellcasting ability as Spellcasting."}]},{"name":"Ettin","cr":"4","cat":"giant","ac":12,"hp":85,"hpF":"10d10+30","spd":"40 ft.","mods":{"str":5,"dex":-1,"con":3,"int":-2,"wis":0,"cha":-1},"condImmune":["Blinded","Charmed","Deafened","Frightened","Stunned","Unconscious"],"multi":"The ettin makes one Battleaxe attack and one Morningstar attack.","actions":[{"n":"Battleaxe","kind":"atk","hit":7,"dmg":"2d8+5","dtype":"slashing","d":"reach 5 ft. If the target is a Large or smaller creature, it has the Prone condition."},{"n":"Morningstar","kind":"atk","hit":7,"dmg":"2d8+5","dtype":"piercing","d":"reach 5 ft. and the target has Disadvantage on the next attack roll it makes before the end of its next turn."}]},{"name":"Fire Giant","cr":"9","cat":"giant","ac":18,"hp":162,"hpF":"13d12+78","spd":"30 ft.","mods":{"str":7,"dex":-1,"con":6,"int":0,"wis":2,"cha":1},"saves":{"dex":3,"con":10,"cha":5},"immune":["fire"],"multi":"The giant makes two attacks, using Flame Sword or Hammer Throw in any combination.","actions":[{"n":"Flame Sword","kind":"atk","hit":11,"dmg":"4d6+7","dtype":"slashing","extra":"3d6","extraType":"fire","d":"reach 10 ft"},{"n":"Hammer Throw","kind":"atk","hit":11,"dmg":"3d10+7","dtype":"bludgeoning","extra":"1d8","extraType":"fire","d":"range 60/240 ft. and the target is pushed up to 15 feet straight away from the giant and has Disadvantage on the next attack roll it makes before the end of its next turn."}]},{"name":"Frost Giant","cr":"8","cat":"giant","ac":15,"hp":149,"hpF":"13d12+65","spd":"40 ft.","mods":{"str":6,"dex":-1,"con":5,"int":-1,"wis":0,"cha":1},"saves":{"con":8,"wis":3,"cha":4},"immune":["cold"],"multi":"The giant makes two attacks, using Frost Axe or Great Bow in any combination.","actions":[{"n":"Frost Axe","kind":"atk","hit":9,"dmg":"2d12+6","dtype":"slashing","extra":"2d8","extraType":"cold","d":"reach 10 ft"},{"n":"Great Bow","kind":"atk","hit":9,"dmg":"2d10+6","dtype":"piercing","extra":"2d6","extraType":"cold","d":"range 150/600 ft. and the target's Speed decreases by 10 feet until the end of its next turn."}],"bonus":[{"n":"War Cry (Recharge 5-6)","d":"The giant or one creature of its choice that can see or hear it gains 16 (2d10 + 5) Temporary Hit Points and has Advantage on attack rolls until the start of the giant's next turn."}]},{"name":"Hill Giant","cr":"5","cat":"giant","ac":13,"hp":105,"hpF":"10d12+40","spd":"40 ft.","mods":{"str":5,"dex":-1,"con":4,"int":-3,"wis":-1,"cha":-2},"multi":"The giant makes two attacks, using Tree Club or Trash Lob in any combination.","actions":[{"n":"Tree Club","kind":"atk","hit":8,"dmg":"3d8+5","dtype":"bludgeoning","d":"reach 10 ft. If the target is a Large or smaller creature, it has the Prone condition."},{"n":"Trash Lob","kind":"atk","hit":8,"dmg":"2d10+5","dtype":"bludgeoning","d":"range 60/240 ft. and the target has the Poisoned condition until the end of its next turn."}]},{"name":"Ogre","cr":"2","cat":"giant","ac":11,"hp":68,"hpF":"8d10+24","spd":"40 ft.","mods":{"str":4,"dex":-1,"con":3,"int":-3,"wis":-2,"cha":-2},"actions":[{"n":"Greatclub","kind":"atk","hit":6,"dmg":"2d8+4","dtype":"bludgeoning","d":"reach 5 ft"},{"n":"Javelin","kind":"atk","hit":6,"dmg":"2d6+4","dtype":"piercing","d":"reach 5 ft. or range 30/120 ft"}]},{"name":"Stone Giant","cr":"7","cat":"giant","ac":17,"hp":126,"hpF":"11d12+55","spd":"40 ft.","mods":{"str":6,"dex":2,"con":5,"int":0,"wis":1,"cha":-1},"saves":{"dex":5,"con":8,"wis":4},"multi":"The giant makes two attacks, using Stone Club or Boulder in any combination.","actions":[{"n":"Stone Club","kind":"atk","hit":9,"dmg":"3d10+6","dtype":"bludgeoning","d":"reach 15 ft"},{"n":"Boulder","kind":"atk","hit":9,"dmg":"2d8+6","dtype":"bludgeoning","d":"range 60/240 ft. If the target is a Large or smaller creature, it has the Prone condition."}],"reactions":[{"n":"Deflect Missile (Recharge 5-6)","d":"Trigger: The giant is hit by a ranged attack roll and takes Bludgeoning, Piercing, or Slashing damage from it. Response: The giant reduces the damage it takes from the attack by 11 (1d10 + 6), and if that damage is reduced to 0, the giant can redirect some of the attack's force. Dexterity Saving Throw: DC 17, one creature the giant can see within 60 feet. Failure: 11 (1d10 + 6) Force damage. 330 System Reference Document 5.2.1"}]},{"name":"Storm Giant","cr":"13","cat":"giant","ac":16,"hp":230,"hpF":"20d12+100","spd":"50 ft., Fly 25 ft. (hover), Swim 50 ft.","mods":{"str":9,"dex":2,"con":5,"int":3,"wis":5,"cha":4},"saves":{"str":14,"con":10,"wis":10,"cha":9},"resist":["cold"],"immune":["lightning","thunder"],"traits":[{"n":"Amphibious","d":"The giant can breathe air and water."}],"multi":"The giant makes two attacks, using Storm Sword or Thunderbolt in any combination.","actions":[{"n":"Storm Sword","kind":"atk","hit":14,"dmg":"4d6+9","dtype":"slashing","extra":"3d8","extraType":"lightning","d":"reach 10 ft"},{"n":"Thunderbolt","kind":"atk","hit":14,"dmg":"2d12+9","dtype":"lightning","d":"range 500 ft. and the target has the Blinded and Deafened conditions until the start of the giant's next turn."},{"n":"Lightning Storm","kind":"save","save":{"ability":"DEX","dc":18},"rech":5,"d":"Dexterity Saving Throw: DC 18, each creature in a 10-foot-radius, 40-foot-high Cylinder originating from a point the giant can see within 500 feet. Failure: 55 (10d10) Lightning damage. Success: Half damage."},{"n":"Spellcasting","kind":"text","d":"The giant casts one of the following spells, requiring no Material components and using Wisdom as the spellcasting ability (spell save DC 18):"}]},{"name":"Troll","cr":"5","cat":"giant","ac":15,"hp":94,"hpF":"9d10+45","spd":"30 ft.","mods":{"str":4,"dex":1,"con":5,"int":-2,"wis":-1,"cha":-2},"traits":[{"n":"Loathsome Limbs (4/Day)","d":"If the troll ends any turn Bloodied and took 15+ Slashing damage during that turn, one of the troll's limbs is severed, falls into the troll's space, and becomes a Troll Limb. The limb acts immediately after the troll's turn. The troll has 1 Exhaustion level for each missing limb, and it grows replacement limbs the next time it regains Hit Points."},{"n":"Regeneration","d":"The troll regains 15 Hit Points at the start of each of its turns. If the troll takes Acid or Fire damage, this trait doesn't function on the troll's next turn. The troll dies only if it starts its turn with 0 Hit Points and doesn't regenerate."}],"multi":"The troll makes three Rend attacks.","actions":[{"n":"Rend","kind":"atk","hit":7,"dmg":"2d6+4","dtype":"slashing","d":"reach 10 ft"}],"bonus":[{"n":"Charge","d":"The troll moves up to half its Speed straight toward an enemy it can see."}]},{"name":"Troll Limb","cr":"1/2","cat":"giant","ac":13,"hp":14,"hpF":"4d6","spd":"20 ft.","mods":{"str":4,"dex":1,"con":0,"int":-5,"wis":-1,"cha":-5},"traits":[{"n":"Regeneration","d":"The limb regains 5 Hit Points at the start of each of its turns. If the limb takes Acid or Fire damage, this trait doesn't function on the limb's next turn. The limb dies only if it starts its turn with 0 Hit Points and doesn't regenerate."},{"n":"Troll Spawn","d":"The limb uncannily has the same senses as a whole troll. If the limb isn't destroyed within 24 hours, roll 1d12. On a 12, the limb turns into a Troll. Otherwise, the limb withers away."}],"actions":[{"n":"Rend","kind":"atk","hit":6,"dmg":"2d4+4","dtype":"slashing","d":"reach 5 ft"}]},{"name":"Air Elemental","cr":"5","cat":"elem","ac":15,"hp":90,"hpF":"12d10+24","spd":"10 ft., Fly 90 ft. (hover)","mods":{"str":2,"dex":5,"con":2,"int":-2,"wis":0,"cha":-2},"resist":["bludgeoning","lightning","piercing","slashing"],"immune":["poison","thunder"],"condImmune":["Exhaustion","Grappled","Paralyzed","Petrified","Poisoned","Prone","Restrained","Unconscious"],"traits":[{"n":"Air Form","d":"The elemental can enter a creature's space and stop there. It can move through a space as narrow as 1 inch without expending extra movement to do so."}],"multi":"The elemental makes two Thunderous Slam attacks.","actions":[{"n":"Thunderous Slam","kind":"atk","hit":8,"dmg":"2d8+5","dtype":"thunder","d":"reach 10 ft"},{"n":"Whirlwind","kind":"save","save":{"ability":"STR","dc":13},"rech":4,"d":"Strength Saving Throw: DC 13, one Medium or smaller creature in the elemental's space. Failure: 24 (4d10 + 2) Thunder damage, and the target is pushed up to 20 feet straight away from the elemental and has the Prone condition. Success: Half damage only."}]},{"name":"Animated Armor","cr":"1","cat":"elem","ac":18,"hp":33,"hpF":"6d8+6","spd":"25 ft.","mods":{"str":2,"dex":0,"con":1,"int":-5,"wis":-4,"cha":-5},"immune":["poison","psychic"],"condImmune":["Charmed","Deafened","Exhaustion","Frightened","Paralyzed","Petrified","Poisoned"],"multi":"The armor makes two Slam attacks.","actions":[{"n":"Slam","kind":"atk","hit":4,"dmg":"1d6+2","dtype":"bludgeoning","d":"reach 5 ft"}]},{"name":"Animated Flying Sword","cr":"1/4","cat":"elem","ac":17,"hp":14,"hpF":"4d6","spd":"5 ft., Fly 50 ft. (hover)","mods":{"str":1,"dex":2,"con":0,"int":-5,"wis":-3,"cha":-5},"saves":{"dex":4},"immune":["poison","psychic"],"condImmune":["Charmed","Deafened","Exhaustion","Frightened","Paralyzed","Petrified","Poisoned"],"actions":[{"n":"Slash","kind":"atk","hit":4,"dmg":"1d8+2","dtype":"slashing","d":"reach 5 ft"}]},{"name":"Animated Rug of Smothering","cr":"2","cat":"elem","ac":12,"hp":27,"hpF":"5d10","spd":"10 ft.","mods":{"str":3,"dex":2,"con":0,"int":-5,"wis":-4,"cha":-5},"immune":["poison","psychic"],"condImmune":["Charmed","Deafened","Exhaustion","Frightened","Paralyzed","Petrified","Poisoned"],"actions":[{"n":"Smother","kind":"atk","hit":5,"dmg":"2d6+3","dtype":"bludgeoning","d":"reach 5 ft. If the target is a Medium or smaller creature, the rug can give it the Grappled condition (escape DC 13) instead of dealing damage. Until the grapple ends, the target has the Blinded and Restrained conditions, is suffocating, and takes 10 (2d6 + 3) Bludgeoning damage at the start of each of its turns. The rug can smother only one creature at a time. While grappling the target, the rug can't take this action, the rug halves the damage it takes (round down), and the target takes the same amount of damage."}]},{"name":"Azer Sentinel","cr":"2","cat":"elem","ac":17,"hp":39,"hpF":"6d8+12","spd":"30 ft.","mods":{"str":3,"dex":1,"con":2,"int":1,"wis":1,"cha":0},"saves":{"con":4},"immune":["fire","poison"],"condImmune":["Poisoned"],"traits":[{"n":"Fire Aura","d":"At the end of each of the azer's turns, each creature of the azer's choice in a 5-foot Emanation originating from the azer takes 5 (1d10) Fire damage unless the azer has the Incapacitated condition."},{"n":"Illumination","d":"The azer sheds Bright Light in a 10-foot radius and Dim Light for an additional 10 feet."}],"actions":[{"n":"Burning Hammer","kind":"atk","hit":5,"dmg":"1d10+3","dtype":"bludgeoning","extra":"1d6","extraType":"fire","d":"reach 5 ft"}]},{"name":"Clay Golem","cr":"9","cat":"elem","ac":14,"hp":123,"hpF":"13d10+52","spd":"30 ft.","mods":{"str":5,"dex":-1,"con":4,"int":-4,"wis":-1,"cha":-5},"resist":["bludgeoning","piercing","slashing"],"immune":["acid","poison","psychic"],"condImmune":["Charmed","Exhaustion","Frightened","Paralyzed","Petrified","Poisoned"],"traits":[{"n":"Acid Absorption","d":"Whenever the golem is subjected to Acid damage, it takes no damage and instead regains a number of Hit Points equal to the Acid damage dealt."},{"n":"Berserk","d":"Whenever the golem starts its turn Bloodied, roll 1d6. On a 6, the golem goes berserk. On each of its turns while berserk, the golem attacks the nearest creature it can see. If no creature is near enough to move to and attack, the golem attacks an object. Once the golem goes berserk, it continues to be berserk until it is destroyed or it is no longer Bloodied."},{"n":"Immutable Form","d":"The golem can't shape-shift."},{"n":"Magic Resistance","d":"The golem has Advantage on saving throws against spells and other magical effects."}],"multi":"The golem makes two Slam attacks, or it makes three Slam attacks if it used Hasten this turn.","actions":[{"n":"Slam","kind":"atk","hit":9,"dmg":"1d10+5","dtype":"bludgeoning","extra":"1d12","extraType":"acid","d":"reach 5 ft. and the target's Hit Point maximum decreases by an amount equal to the Acid damage taken."}],"bonus":[{"n":"Hasten (Recharge 5-6)","d":"The golem takes the Dash and Disengage actions. 274 System Reference Document 5.2.1"}]},{"name":"Djinni","cr":"11","cat":"elem","ac":17,"hp":218,"hpF":"19d10+114","spd":"30 ft., Fly 90 ft. (hover)","mods":{"str":5,"dex":2,"con":6,"int":2,"wis":3,"cha":5},"saves":{"dex":6,"wis":7},"immune":["lightning","thunder"],"traits":[{"n":"Elemental Restoration","d":"If the djinni dies outside the Elemental Plane of Air, its body dissolves into mist, and it gains a new body in 1d4 days, reviving with all its Hit Points somewhere on the Plane of Air."},{"n":"Magic Resistance","d":"The djinni has Advantage on saving throws against spells and other magical effects."},{"n":"Wishes","d":"The djinni has a 30 percent chance of knowing the Wish spell. If the djinni knows it, the djinni can cast it only on behalf of a non-genie creature who communicates a wish in a way the djinni can understand. If the djinni casts the spell for the creature, the djinni suffers none of the spell's stress. Once the djinni has cast it three times, the djinni can't do so again for 365 days."}],"multi":"The djinni makes three attacks, using Storm Blade or Storm Bolt in any combination.","actions":[{"n":"Storm Blade","kind":"atk","hit":9,"dmg":"2d6+5","dtype":"slashing","extra":"2d6","extraType":"lightning","d":"reach 5 feet"},{"n":"Storm Bolt","kind":"atk","hit":9,"dmg":"3d8","dtype":"thunder","d":"range 120 feet. If the target is a Large or smaller creature, it has the Prone condition."},{"n":"Create Whirlwind","kind":"save","save":{"ability":"STR","dc":17},"conc":true,"d":"The djinni conjures a whirlwind at a point it can see within 120 feet. The whirlwind fills a 20-foot-radius, 60-foot-high Cylinder centered on that point. The whirlwind lasts until the djinni's Concentration on it ends. The djinni can move the whirlwind up to 20 feet at the start of each of its turns. Whenever the whirlwind enters a creature's space or a creature enters the whirlwind, that creature is subjected to the following effect. Strength Saving Throw: DC 17 (a creature makes this save only once per turn, and the djinni is unaffected). Failure: While in the whirlwind, the target has the Restrained condition and moves with the whirlwind. At the start of each of its turns, the Restrained target takes 21 (6d6) Thunder 280 System Reference Document 5.2.1 damage. At the end of each of its turns, the target repeats the save, ending the effect on itself on a success."},{"n":"Spellcasting","kind":"text","d":"The djinni casts one of the following spells, requiring no Material components and using Charisma as the spellcasting ability (spell save DC 17): At Will: Detect Evil and Good, Detect Magic 2/Day Each: Create Food and Water (can create wine instead of water), Tongues, Wind Walk 1/Day Each: Creation, Gaseous Form, Invisibility, Major Image, Plane Shift"}]},{"name":"Dust Mephit","cr":"1/2","cat":"elem","ac":12,"hp":17,"hpF":"5d6","spd":"30 ft., Fly 30 ft.","mods":{"str":-3,"dex":2,"con":0,"int":-1,"wis":0,"cha":0},"immune":["poison"],"vuln":["fire"],"condImmune":["Exhaustion","Poisoned"],"traits":[{"n":"Death Burst","d":"The mephit explodes when it dies. Dexterity Saving Throw: DC 10, each creature in a 5-foot Emanation originating from the mephit. Failure: 5 (2d4) Bludgeoning damage. Success: Half damage."}],"actions":[{"n":"Claw","kind":"atk","hit":4,"dmg":"1d4+2","dtype":"slashing","d":"reach 5 ft"},{"n":"Blinding Breath","kind":"save","save":{"ability":"DEX","dc":10},"rech":6,"d":"Dexterity Saving Throw: DC 10, each creature in a 15-foot Cone. Failure: The target has the Blinded condition until the end of the mephit's next turn."},{"n":"Sleep (1/Day)","kind":"text","d":"The mephit casts the Sleep spell, requiring no spell components and using Charisma as the spellcasting ability (spell save DC 10)."}]},{"name":"Earth Elemental","cr":"5","cat":"elem","ac":17,"hp":147,"hpF":"14d10+70","spd":"30 ft., Burrow 30 ft.","mods":{"str":5,"dex":-1,"con":5,"int":-3,"wis":0,"cha":-3},"immune":["poison"],"vuln":["thunder"],"condImmune":["Exhaustion","Paralyzed","Petrified","Poisoned","Unconscious"],"traits":[{"n":"Earth Glide","d":"The elemental can burrow through nonmagical, unworked earth and stone. While doing so, the elemental doesn't disturb the material it moves through."},{"n":"Siege Monster","d":"The elemental deals double damage to objects and structures."}],"multi":"The elemental makes two attacks, using Slam or Rock Launch in any combination.","actions":[{"n":"Slam","kind":"atk","hit":8,"dmg":"2d8+5","dtype":"bludgeoning","d":"reach 10 ft"},{"n":"Rock Launch","kind":"atk","hit":8,"dmg":"1d6+5","dtype":"bludgeoning","d":"range 60 ft. If the target is a Large or smaller creature, it has the Prone condition."}]},{"name":"Efreeti","cr":"11","cat":"elem","ac":17,"hp":212,"hpF":"17d10+119","spd":"40 ft., Fly 60 ft. (hover)","mods":{"str":6,"dex":1,"con":7,"int":3,"wis":2,"cha":4},"saves":{"wis":6,"cha":8},"immune":["fire"],"traits":[{"n":"Elemental Restoration","d":"If the efreeti dies outside the Elemental Plane of Fire, its body dissolves into ash, and it gains a new body in 1d4 days, reviving with all its Hit Points somewhere on the Plane of Fire."},{"n":"Magic Resistance","d":"The efreeti has Advantage on saving throws against spells and other magical effects."},{"n":"Wishes","d":"The efreeti has a 30 percent chance of knowing the Wish spell. If the efreeti knows it, the efreeti can cast it only on behalf of a non-genie creature who communicates a wish in a way the efreeti can understand. If the efreeti casts the spell for the creature, the efreeti suffers none of the spell's stress. Once the efreeti has cast it three times, the efreeti can't do so again for 365 days."}],"multi":"The efreeti makes three attacks, using Heated Blade or Hurl Flame in any combination.","actions":[{"n":"Heated Blade","kind":"atk","hit":10,"dmg":"2d6+6","dtype":"slashing","extra":"2d12","extraType":"fire","d":"reach 5 ft"},{"n":"Hurl Flame","kind":"atk","hit":8,"dmg":"7d6","dtype":"fire","d":"range 120 ft"},{"n":"Spellcasting","kind":"text","d":"The efreeti casts one of the following spells, requiring no Material components and using Charisma as the spellcasting ability (spell save DC 16): 1/Day Each: Gaseous Form, Invisibility, Major Image, Plane Shift, Tongues, Wall of Fire (level 7 version) 283 System Reference Document 5.2.1"}]},{"name":"Fire Elemental","cr":"5","cat":"elem","ac":13,"hp":93,"hpF":"11d10+33","spd":"50 ft.","mods":{"str":0,"dex":3,"con":3,"int":-2,"wis":0,"cha":-2},"resist":["bludgeoning","piercing","slashing"],"immune":["fire","poison"],"condImmune":["Exhaustion","Grappled","Paralyzed","Petrified","Poisoned","Prone","Restrained","Unconscious"],"traits":[{"n":"Fire Aura","d":"At the end of each of the elemental's turns, each creature in a 10-foot Emanation originating from the elemental takes 5 (1d10) Fire damage. Creatures and flammable objects in the Emanation start burning."},{"n":"Fire Form","d":"The elemental can move through a space as narrow as 1 inch without expending extra movement to do so, and it can enter a creature's space and stop there. The first time it enters a creature's space on a turn, that creature takes 5 (1d10) Fire damage."},{"n":"Illumination","d":"The elemental sheds Bright Light in a 30foot radius and Dim Light for an additional 30 feet."},{"n":"Water Susceptibility","d":"The elemental takes 3 (1d6) Cold damage for every 5 feet the elemental moves in water or for every gallon of water splashed on it."}],"multi":"The elemental makes two Burn attacks.","actions":[{"n":"Burn","kind":"atk","hit":6,"dmg":"2d6+3","dtype":"fire","d":"reach 5 ft. If the target is a creature or a flammable object, it starts burning."}]},{"name":"Flesh Golem","cr":"5","cat":"elem","ac":9,"hp":127,"hpF":"15d8+60","spd":"30 ft.","mods":{"str":4,"dex":-1,"con":4,"int":-2,"wis":0,"cha":-3},"immune":["lightning","poison"],"condImmune":["Charmed","Exhaustion","Frightened","Paralyzed","Petrified","Poisoned"],"traits":[{"n":"Aversion to Fire","d":"If the golem takes Fire damage, it has Disadvantage on attack rolls and ability checks until the end of its next turn."},{"n":"Berserk","d":"Whenever the golem starts its turn Bloodied, roll 1d6. On a 6, the golem goes berserk. On each of its turns while berserk, the golem attacks the nearest creature it can see. If no creature is near enough to move to and attack, the golem attacks an object. Once the golem goes berserk, it remains so until it is destroyed or it is no longer Bloodied. The golem's creator, if within 60 feet of the berserk golem, can try to calm it by taking an action to make a DC 15 Charisma (Persuasion) check; the golem must be able to hear its creator. If this check succeeds, the golem ceases being berserk until the start of its next turn, at which point it resumes rolling for the Berserk trait again if it is still Bloodied."},{"n":"Immutable Form","d":"The golem can't shape-shift."},{"n":"Lightning Absorption","d":"Whenever the golem is subjected to Lightning damage, it regains a number of Hit Points equal to the Lightning damage dealt."},{"n":"Magic Resistance","d":"The golem has Advantage on saving throws against spells and other magical effects."}],"multi":"The golem makes two Slam attacks.","actions":[{"n":"Slam","kind":"atk","hit":7,"dmg":"2d8+4","dtype":"bludgeoning","extra":"1d8","extraType":"lightning","d":"reach 5 ft"}]},{"name":"Gargoyle","cr":"2","cat":"elem","ac":15,"hp":67,"hpF":"9d8+27","spd":"30 ft., Fly 60 ft.","mods":{"str":2,"dex":0,"con":3,"int":-2,"wis":0,"cha":-2},"immune":["poison"],"condImmune":["Exhaustion","Petrified","Poisoned"],"traits":[{"n":"Flyby","d":"The gargoyle doesn't provoke an Opportunity Attack when it flies out of an enemy's reach."}],"multi":"The gargoyle makes two Claw attacks.","actions":[{"n":"Claw","kind":"atk","hit":4,"dmg":"2d4+2","dtype":"slashing","d":"reach 5 ft"}]},{"name":"Gorgon","cr":"5","cat":"elem","ac":19,"hp":114,"hpF":"12d10+48","spd":"40 ft.","mods":{"str":5,"dex":0,"con":4,"int":-4,"wis":1,"cha":-2},"condImmune":["Exhaustion","Petrified"],"actions":[{"n":"Gore","kind":"atk","hit":8,"dmg":"2d12+5","dtype":"piercing","d":"reach 5 ft. If the target is a Large or smaller creature and the gorgon moved 20+ feet straight toward it immediately before the hit, the target has the Prone condition."},{"n":"Petrifying Breath","kind":"save","save":{"ability":"CON","dc":15},"rech":5,"d":"Constitution Saving Throw: DC 15, each creature in a 30-foot Cone. First Failure: The target has the Restrained condition and repeats the save at the end of its next turn if it is still Restrained, ending the effect on itself on a success. Second Failure: The target has the Petrified condition instead of the Restrained condition."}],"bonus":[{"n":"Trample","d":"Dexterity Saving Throw: DC 16, one creature within 5 feet that has the Prone condition. Failure: 16 (2d10 + 5) Bludgeoning damage. Success: Half damage."}]},{"name":"Homunculus","cr":"0","cat":"elem","ac":13,"hp":4,"hpF":"1d4+2","spd":"20 ft., Fly 40 ft.","mods":{"str":-3,"dex":2,"con":2,"int":0,"wis":0,"cha":-2},"saves":{"wis":2,"cha":0},"immune":["poison"],"condImmune":["Charmed","Poisoned"],"traits":[{"n":"Telepathic Bond","d":"While the homunculus is on the same plane of existence as its master, the two of them can communicate telepathically with each other."}],"actions":[{"n":"Bite","kind":"atk","hit":4,"dmg":"1","dtype":"piercing","d":"reach 5 ft. and the target is subjected to the following effect. Constitution Saving Throw: DC 12. Failure: The target has the Poisoned condition until the end of the homunculus's next turn. Failure by 5 or More: The target has the Poisoned condition for 1 minute. While Poisoned, the target has the Unconscious condition, which ends early if the target takes any damage."}]},{"name":"Ice Mephit","cr":"1/2","cat":"elem","ac":11,"hp":21,"hpF":"6d6","spd":"30 ft., Fly 30 ft.","mods":{"str":-2,"dex":1,"con":0,"int":-1,"wis":0,"cha":1},"immune":["cold","poison"],"vuln":["fire"],"condImmune":["Exhaustion","Poisoned"],"traits":[{"n":"Death Burst","d":"The mephit explodes when it dies. Constitution Saving Throw: DC 10, each creature in a 5-foot Emanation originating from the mephit. Failure: 5 (2d4) Cold damage. Success: Half damage."}],"actions":[{"n":"Claw","kind":"atk","hit":3,"dmg":"1d4+1","dtype":"slashing","extra":"1d4","extraType":"cold","d":"reach 5 ft"},{"n":"Fog Cloud (1/Day)","kind":"text","d":"The mephit casts Fog Cloud, requiring no spell components and using Charisma as the spellcasting ability."},{"n":"Frost Breath","kind":"save","save":{"ability":"CON","dc":10},"rech":6,"d":"Constitution Saving Throw: DC 10, each creature in a 15-foot Cone. Failure: 7 (3d4) Cold damage. Success: Half damage."}]},{"name":"Invisible Stalker","cr":"6","cat":"elem","ac":14,"hp":97,"hpF":"13d10+26","spd":"50 ft., Fly 50 ft. (hover)","mods":{"str":3,"dex":4,"con":2,"int":0,"wis":2,"cha":0},"resist":["bludgeoning","piercing","slashing"],"immune":["poison"],"condImmune":["Exhaustion","Grappled","Paralyzed","Petrified","Poisoned","Prone","Restrained","Unconscious"],"traits":[{"n":"Air Form","d":"The stalker can enter an enemy's space and stop there. It can move through a space as narrow as 1 inch without expending extra movement to do so."},{"n":"Invisibility","d":"The stalker has the Invisible condition."}],"multi":"The stalker makes three Wind Swipe attacks. It can replace one attack with a use of Vortex.","actions":[{"n":"Wind Swipe","kind":"atk","hit":7,"dmg":"2d6+4","dtype":"force","d":"reach 5 ft"},{"n":"Vortex","kind":"save","save":{"ability":"CON","dc":14},"d":"Constitution Saving Throw: DC 14, one Large or smaller creature in the stalker's space. Failure: 7 (1d8 + 3) Thunder damage, and the target has the Grappled condition (escape DC 13). Until the grapple ends, the target can't cast spells with a Verbal component and takes 7 (2d6) Thunder damage at the start of each of the stalker's turns."}]},{"name":"Iron Golem","cr":"16","cat":"elem","ac":20,"hp":252,"hpF":"24d10+120","spd":"30 ft.","mods":{"str":7,"dex":-1,"con":5,"int":-4,"wis":0,"cha":-5},"immune":["fire","poison","psychic"],"condImmune":["Charmed","Exhaustion","Frightened","Paralyzed","Petrified","Poisoned"],"traits":[{"n":"Fire Absorption","d":"Whenever the golem is subjected to Fire damage, it regains a number of Hit Points equal to the Fire damage dealt."},{"n":"Immutable Form","d":"The golem can't shape-shift."},{"n":"Magic Resistance","d":"The golem has Advantage on saving throws against spells and other magical effects."}],"multi":"The golem makes two attacks, using Bladed Arm or Fiery Bolt in any combination.","actions":[{"n":"Bladed Arm","kind":"atk","hit":12,"dmg":"3d8+7","dtype":"slashing","extra":"3d6","extraType":"fire","d":"reach 10 ft"},{"n":"Fiery Bolt","kind":"atk","hit":10,"dmg":"8d8","dtype":"fire","d":"range 120 ft"},{"n":"Poison Breath","kind":"save","save":{"ability":"CON","dc":18},"rech":6,"d":"Constitution Saving Throw: DC 18, each creature in a 60-foot Cone. Failure: 55 (10d10) Poison damage. Success: Half damage."}]},{"name":"Magma Mephit","cr":"1/2","cat":"elem","ac":11,"hp":18,"hpF":"4d6+4","spd":"30 ft., Fly 30 ft.","mods":{"str":-1,"dex":1,"con":1,"int":-2,"wis":0,"cha":0},"immune":["fire","poison"],"vuln":["cold"],"condImmune":["Exhaustion","Poisoned"],"traits":[{"n":"Death Burst","d":"The mephit explodes when it dies. Dexterity Saving Throw: DC 11, each creature in a 5-foot Emanation originating from the mephit. Failure: 7 (2d6) Fire damage. Success: Half damage."}],"actions":[{"n":"Claw","kind":"atk","hit":3,"dmg":"1d4+1","dtype":"slashing","extra":"1d6","extraType":"fire","d":"reach 5 ft"},{"n":"Fire Breath","kind":"save","save":{"ability":"DEX","dc":11},"rech":6,"d":"Dexterity Saving Throw: DC 11, each creature in a 15-foot Cone. Failure: 7 (2d6) Fire damage. Success: Half damage."}]},{"name":"Magmin","cr":"1/2","cat":"elem","ac":14,"hp":13,"hpF":"3d6+3","spd":"30 ft.","mods":{"str":-2,"dex":2,"con":1,"int":-1,"wis":0,"cha":0},"immune":["fire"],"traits":[{"n":"Death Burst","d":"The magmin explodes when it dies. Dexterity Saving Throw: DC 11, each creature in a 10-foot Emanation originating from the magmin. Failure: 7 (2d6) Fire damage. Success: Half damage."}],"actions":[{"n":"Touch","kind":"atk","hit":4,"dmg":"2d4+2","dtype":"fire","d":"reach 5 ft. If the target is a creature or a flammable object that isn't being worn or carried, it starts burning."}],"bonus":[{"n":"Ignited Illumination","d":"The magmin sets itself ablaze or extinguishes its flames. While ablaze, the magmin sheds Bright Light in a 10-foot radius and Dim Light for an additional 10 feet."}]},{"name":"Merfolk Skirmisher","cr":"1/8","cat":"elem","ac":11,"hp":11,"hpF":"2d8+2","spd":"10 ft., Swim 40 ft.","mods":{"str":0,"dex":1,"con":1,"int":0,"wis":2,"cha":1},"traits":[{"n":"Amphibious","d":"The merfolk can breathe air and water. 308 System Reference Document 5.2.1"}],"actions":[{"n":"Ocean Spear","kind":"atk","hit":2,"dmg":"1d6","dtype":"piercing","extra":"1d4","extraType":"cold","d":"reach 5 ft. or range 20/60 ft. If the target is a creature, its Speed decreases by 10 feet until the end of its next turn. Hit or Miss: The spear magically returns to the merfolk's hand immediately after a ranged attack."}]},{"name":"Salamander","cr":"5","cat":"elem","ac":15,"hp":90,"hpF":"12d10+24","spd":"30 ft., Climb 30 ft.","mods":{"str":4,"dex":2,"con":2,"int":0,"wis":0,"cha":1},"immune":["fire"],"vuln":["cold"],"traits":[{"n":"Fire Aura","d":"At the end of each of the salamander's turns, each creature of the salamander's choice in a 5-foot Emanation originating from the salamander takes 7 (2d6) Fire damage."}],"multi":"The salamander makes two Flame Spear attacks. It can replace one attack with a use of Constrict.","actions":[{"n":"Flame Spear","kind":"atk","hit":7,"dmg":"2d8+4","dtype":"piercing","extra":"2d6","extraType":"fire","d":"reach 5 ft. or range 20/60 ft. Hit or Miss: The spear magically returns to the salamander's hand immediately after a ranged attack."},{"n":"Constrict","kind":"save","save":{"ability":"STR","dc":15},"d":"Strength Saving Throw: DC 15, one Large or smaller creature the salamander can see within 10 feet. Failure: 11 (2d6 + 4) Bludgeoning damage plus 7 (2d6) Fire damage. The target has the Grappled condition (escape DC 14), and it has the Restrained condition until the grapple ends."}]},{"name":"Shield Guardian","cr":"7","cat":"elem","ac":17,"hp":142,"hpF":"15d10+60","spd":"30 ft.","mods":{"str":4,"dex":-1,"con":4,"int":-2,"wis":0,"cha":-4},"immune":["poison"],"condImmune":["Charmed","Exhaustion","Frightened","Paralyzed","Petrified","Poisoned"],"traits":[{"n":"Bound","d":"The guardian is magically bound to an amulet. While the guardian and its amulet are on the same plane of existence, the amulet's wearer can telepathically call the guardian to travel to it, and the guardian knows the distance and direction to the amulet. If the guardian is within 60 feet of the amulet's wearer, half of any damage the wearer takes (round up) is transferred to the guardian."},{"n":"Regeneration","d":"The guardian regains 10 Hit Points at the start of each of its turns if it has at least 1 Hit Point."},{"n":"Spell Storing","d":"A spellcaster who wears the guardian's amulet can cause the guardian to store one spell of level 4 or lower. To do so, the wearer must cast the spell on the guardian while within 5 feet of it. The spell has no effect but is stored within the guardian. Any previously stored spell is lost when a new spell is stored. The guardian can cast the spell stored with any parameters set by the original caster, requiring no spell components and using the caster's spellcasting ability. The stored spell is then lost."}],"multi":"The guardian makes two Fist attacks.","actions":[{"n":"Fist","kind":"atk","hit":7,"dmg":"2d6+4","dtype":"bludgeoning","extra":"2d6","extraType":"force","d":"reach 10 ft"}],"reactions":[{"n":"Protection","d":"Trigger: An attack roll hits the wearer of the guardian's amulet while the wearer is within 5 feet of the guardian. Response: The wearer gains a +5 bonus to AC, including against the triggering attack and possibly causing it to miss, until the start of the guardian's next turn.","acBonus":5}]},{"name":"Steam Mephit","cr":"1/4","cat":"elem","ac":10,"hp":17,"hpF":"5d6","spd":"30 ft., Fly 30 ft.","mods":{"str":-3,"dex":0,"con":0,"int":0,"wis":0,"cha":1},"immune":["fire","poison"],"condImmune":["Exhaustion","Poisoned"],"traits":[{"n":"Blurred Form","d":"Attack rolls against the mephit are made with Disadvantage unless the mephit has the Incapacitated condition."},{"n":"Death Burst","d":"The mephit explodes when it dies. Dexterity Saving Throw: DC 10, each creature in a 5-foot Emanation originating from the mephit. Failure: 5 (2d4) Fire damage. Success: Half damage."}],"actions":[{"n":"Claw","kind":"atk","hit":2,"dmg":"1d4","dtype":"slashing","extra":"1d4","extraType":"fire","d":"reach 5 ft"},{"n":"Steam Breath","kind":"save","save":{"ability":"CON","dc":10},"rech":6,"d":"Constitution Saving Throw: DC 10, each creature in a 15-foot Cone. Failure: 5 (2d4) Fire damage, and the target's Speed decreases by 10 feet until the end of the mephit's next turn. Success: Half damage only. Failure or Success: Being underwater doesn't grant Resistance to this Fire damage."}]},{"name":"Stone Golem","cr":"10","cat":"elem","ac":18,"hp":220,"hpF":"21d10+105","spd":"30 ft.","mods":{"str":6,"dex":-1,"con":5,"int":-4,"wis":0,"cha":-5},"immune":["poison","psychic"],"condImmune":["Charmed","Exhaustion","Frightened","Paralyzed","Petrified","Poisoned"],"traits":[{"n":"Immutable Form","d":"The golem can't shape-shift."},{"n":"Magic Resistance","d":"The golem has Advantage on saving throws against spells and other magical effects."}],"multi":"The golem makes two attacks, using Slam or Force Bolt in any combination.","actions":[{"n":"Slam","kind":"atk","hit":10,"dmg":"2d8+6","dtype":"bludgeoning","extra":"2d8","extraType":"force","d":"reach 5 ft"},{"n":"Force Bolt","kind":"atk","hit":9,"dmg":"4d10","dtype":"force","d":"range 120 ft"}],"bonus":[{"n":"Slow (Recharge 5-6)","d":"The golem casts the Slow spell, requiring no spell components and using Constitution as the spellcasting ability (spell save DC 17)."}]},{"name":"Water Elemental","cr":"5","cat":"elem","ac":14,"hp":114,"hpF":"12d10+48","spd":"30 ft., Swim 90 ft.","mods":{"str":4,"dex":2,"con":4,"int":-3,"wis":0,"cha":-1},"resist":["acid","fire"],"immune":["poison"],"condImmune":["Exhaustion","Grappled","Paralyzed","Petrified","Poisoned","Prone","Restrained","Unconscious"],"traits":[{"n":"Freeze","d":"If the elemental takes Cold damage, its Speed decreases by 20 feet until the end of its next turn."},{"n":"Water Form","d":"The elemental can enter an enemy's space and stop there. It can move through a space as narrow as 1 inch without expending extra movement to do so."}],"multi":"The elemental makes two Slam attacks.","actions":[{"n":"Slam","kind":"atk","hit":7,"dmg":"2d8+4","dtype":"bludgeoning","d":"reach 5 ft. If the target is a Medium or smaller creature, it has the Prone condition."},{"n":"Whelm","kind":"save","save":{"ability":"STR","dc":15},"rech":4,"d":"Strength Saving Throw: DC 15, each creature in the elemental's space. Failure: 22 (4d8 + 4) Bludgeoning damage. If the target is a Large or smaller creature, it has the Grappled condition (escape DC 14). Until the grapple ends, the target has the Restrained condition, is suffocating unless it can breathe water, and takes 9 (2d8) Bludgeoning damage at the start of each of the elemental's turns. The elemental can grapple one Large creature or up to two Medium or smaller creatures at a time with Whelm. As an action, a creature within 5 feet of the elemental can pull a creature out of it by succeeding on a DC 14 Strength (Athletics) check. Success: Half damage only."}]},{"name":"Xorn","cr":"5","cat":"elem","ac":19,"hp":84,"hpF":"8d8+48","spd":"20 ft., Burrow 20 ft.","mods":{"str":3,"dex":0,"con":6,"int":0,"wis":0,"cha":0},"immune":["poison"],"condImmune":["Paralyzed","Petrified","Poisoned"],"traits":[{"n":"Earth Glide","d":"The xorn can burrow through nonmagical, unworked earth and stone. While doing so, the xorn doesn't disturb the material it moves through."},{"n":"Treasure Sense","d":"The xorn can pinpoint the location of precious metals and stones within 60 feet of itself."}],"multi":"The xorn makes one Bite attack and three Claw attacks.","actions":[{"n":"Bite","kind":"atk","hit":6,"dmg":"4d6+3","dtype":"piercing","d":"reach 5 ft"},{"n":"Claw","kind":"atk","hit":6,"dmg":"1d10+3","dtype":"slashing","d":"reach 5 ft"}],"bonus":[{"n":"Charge","d":"The xorn moves up to its Speed or Burrow Speed straight toward an enemy it can sense."}]},{"name":"Aboleth","cr":"10","cat":"aber","ac":17,"hp":150,"hpF":"20d10+40","spd":"10 ft., Swim 40 ft.","mods":{"str":5,"dex":-1,"con":2,"int":4,"wis":2,"cha":4},"saves":{"dex":3,"con":6,"int":8,"wis":6},"traits":[{"n":"Amphibious","d":"The aboleth can breathe air and water."},{"n":"Eldritch Restoration","d":"If destroyed, the aboleth gains a new body in 5d10 days, reviving with all its Hit Points in the Far Realm or another location chosen by the GM."},{"n":"Legendary Resistance (3/Day, or 4/Day in Lair)","d":"If the aboleth fails a saving throw, it can choose to succeed instead."},{"n":"Mucus Cloud","d":"While underwater, the aboleth is surrounded by mucus. Constitution Saving Throw: DC 14, each creature in a 5-foot Emanation originating from the aboleth at the end of the aboleth's turn. Failure: The target is cursed. Until the curse ends, the target's skin becomes slimy, the target can breathe air and water, and it can't regain Hit Points unless it is underwater. While the cursed creature is outside a body of water, the creature takes 6 (1d12) Acid damage at the end of every 10 minutes unless moisture is applied to its skin before those minutes have passed."},{"n":"Probing Telepathy","d":"If a creature the aboleth can see communicates telepathically with the aboleth, the aboleth learns the creature's greatest desires."}],"multi":"The aboleth makes two Tentacle attacks and uses either Consume Memories or Dominate Mind if available.","actions":[{"n":"Tentacle","kind":"atk","hit":9,"dmg":"2d6+5","dtype":"bludgeoning","d":"reach 15 ft. If the target is a Large or smaller creature, it has the Grappled condition (escape DC 14) from one of four tentacles."},{"n":"Consume Memories","kind":"save","save":{"ability":"INT","dc":16},"d":"Intelligence Saving Throw: DC 16, one creature within 30 feet that is Charmed or Grappled by the aboleth. Failure: 10 (3d6) Psychic damage. 258 System Reference Document 5.2.1 Success: Half damage. Failure or Success: The aboleth gains the target's memories if the target is a Humanoid and is reduced to 0 Hit Points by this action."},{"n":"Dominate Mind (2/Day)","kind":"save","save":{"ability":"WIS","dc":16},"d":"Wisdom Saving Throw: DC 16, one creature the aboleth can see within 30 feet. Failure: The target has the Charmed condition until the aboleth dies or is on a different plane of existence from the target. While Charmed, the target acts as an ally to the aboleth and is under its control while within 60 feet of it. In addition, the aboleth and the target can communicate telepathically with each other over any distance. The target repeats the save whenever it takes damage as well as after every 24 hours it spends at least 1 mile away from the aboleth, ending the effect on itself on a success."}],"legendary":{"count":3,"options":[{"n":"Lash","d":"The aboleth makes one Tentacle attack."},{"n":"Psychic Drain","d":"If the aboleth has at least one creature Charmed or Grappled, it uses Consume Memories and regains 5 (1d10) Hit Points."}]},"legRes":3},{"name":"Black Pudding","cr":"4","cat":"aber","ac":7,"hp":68,"hpF":"8d10+24","spd":"20 ft., Climb 20 ft.","mods":{"str":3,"dex":-3,"con":3,"int":-5,"wis":-2,"cha":-5},"immune":["acid","cold","lightning","slashing"],"condImmune":["Charmed","Deafened","Exhaustion","Frightened","Grappled","Prone","Restrained"],"traits":[{"n":"Amorphous","d":"The pudding can move through a space as narrow as 1 inch without expending extra movement to do so."},{"n":"Corrosive Form","d":"A creature that hits the pudding with a melee attack roll takes 4 (1d8) Acid damage. Nonmagical ammunition is destroyed immediately after hitting the pudding and dealing any damage. Any nonmagical weapon takes a cumulative -1 penalty to attack rolls immediately after dealing damage to the pudding and coming into contact with it. The weapon is destroyed if the penalty reaches -5. The penalty can be removed by casting the Mending spell on the weapon. In 1 minute, the pudding can eat through 2 feet of nonmagical wood or metal."},{"n":"Spider Climb","d":"The pudding can climb difficult surfaces, including along ceilings, without needing to make an ability check."}],"actions":[{"n":"Dissolving Pseudopod","kind":"atk","hit":5,"dmg":"4d6+3","dtype":"acid","d":"reach 10 ft. Nonmagical armor worn by the target takes a -1 penalty to the AC it offers. The armor is destroyed if the penalty reduces its AC to 10. The penalty can be removed by casting the Mending spell on the armor."}],"reactions":[{"n":"Split","d":"Trigger: While the pudding is Large or Medium and has 10+ Hit Points, it becomes Bloodied or is subjected to Lightning or Slashing damage. Response: The pudding splits into two new Black Puddings. Each new pudding is one size smaller than the original pudding and acts on its Initiative. The original pudding's Hit Points are divided evenly between the new puddings (round down)."}]},{"name":"Chuul","cr":"4","cat":"aber","ac":16,"hp":76,"hpF":"9d10+27","spd":"30 ft., Swim 30 ft.","mods":{"str":4,"dex":0,"con":3,"int":-3,"wis":0,"cha":-3},"immune":["poison"],"condImmune":["Poisoned"],"traits":[{"n":"Amphibious","d":"The chuul can breathe air and water."},{"n":"Sense Magic","d":"The chuul senses magic within 120 feet of itself. This trait otherwise works like the Detect Magic spell but isn't itself magical."}],"multi":"The chuul makes two Pincer attacks and uses Paralyzing Tentacles.","actions":[{"n":"Pincer","kind":"atk","hit":6,"dmg":"1d10+4","dtype":"bludgeoning","d":"reach 10 ft. If the target is a Large or smaller creature, it has the Grappled condition (escape DC 14) from one of two pincers."},{"n":"Paralyzing Tentacles","kind":"save","save":{"ability":"CON","dc":13},"d":"Constitution Saving Throw: DC 13, one creature Grappled by the chuul. Failure: The target has the Poisoned condition and repeats the save at the end of each of its turns, ending the effect on itself on a success. After 1 minute, it succeeds automatically. While Poisoned, the target has the Paralyzed condition."}]},{"name":"Cloaker","cr":"8","cat":"aber","ac":14,"hp":91,"hpF":"14d10+14","spd":"10 ft., Fly 40 ft.","mods":{"str":3,"dex":2,"con":1,"int":1,"wis":2,"cha":-2},"condImmune":["Frightened"],"traits":[{"n":"Light Sensitivity","d":"While in Bright Light, the cloaker has Disadvantage on attack rolls."}],"multi":"The cloaker makes one Attach attack and two Tail attacks.","actions":[{"n":"Attach","kind":"atk","hit":6,"dmg":"3d6+3","dtype":"piercing","d":"reach 5 ft. If the target is a Large or smaller creature, the cloaker attaches to it. While the cloaker is attached, the target has the Blinded condition, and the cloaker can't make Attach attacks against other targets. In addition, the cloaker halves the damage it takes (round down), and the target takes the same amount of damage. The cloaker can detach itself by spending 5 feet of movement. The target or a creature within 5 feet of it can take an action to try to detach the cloaker, doing so by succeeding on a DC 14 Strength (Athletics) check."},{"n":"Tail","kind":"atk","hit":6,"dmg":"1d10+3","dtype":"slashing","d":"reach 10 ft"}],"bonus":[{"n":"Moan","d":"Wisdom Saving Throw: DC 13, each creature in a 60-foot Emanation originating from the cloaker. Failure: The target has the Frightened condition until the end of the cloaker's next turn. Success: The target is immune to this cloaker's Moan for the next 24 hours."},{"n":"Phantasms (Recharge after a Short or Long Rest)","d":"The cloaker casts the Mirror Image spell, requiring no spell components and using Wisdom as the spellcasting ability. The spell ends early if the cloaker starts or ends its turn in Bright Light."}]},{"name":"Darkmantle","cr":"1/2","cat":"aber","ac":11,"hp":22,"hpF":"5d6+5","spd":"10 ft., Fly 30 ft.","mods":{"str":3,"dex":1,"con":1,"int":-4,"wis":0,"cha":-3},"actions":[{"n":"Crush","kind":"atk","hit":5,"dmg":"1d6+3","dtype":"bludgeoning","d":"reach 5 ft. and the darkmantle attaches to the target. If the target is a Medium or smaller creature and the darkmantle had Advantage on the attack roll, it covers the target, which has the Blinded condition and is suffocating while the darkmantle is attached in this way. While attached to a target, the darkmantle can attack only the target but has Advantage on its attack rolls. Its Speed becomes 0, it can't benefit from any bonus to its Speed, and it moves with the target. A creature can take an action to try to detach the darkmantle from itself, doing so with a successful DC 13 Strength (Athletics) check. On its turn, the darkmantle can detach itself by using 5 feet of movement."},{"n":"Darkness Aura (1/Day)","kind":"text","conc":true,"d":"Magical Darkness fills a 15-foot Emanation originating from the darkmantle. This effect lasts while the darkmantle maintains Concentration on it, up to 10 minutes. Darkvision can't penetrate this area, and no light can illuminate it."}]},{"name":"Gelatinous Cube","cr":"2","cat":"aber","ac":6,"hp":63,"hpF":"6d10+30","spd":"15 ft.","mods":{"str":2,"dex":-4,"con":5,"int":-5,"wis":-2,"cha":-5},"immune":["acid"],"condImmune":["Blinded","Charmed","Deafened","Exhaustion","Frightened","Prone"],"traits":[{"n":"Ooze Cube","d":"The cube fills its entire space and is transparent. Other creatures can enter that space, but a creature that does so is subjected to the cube's Engulf and has Disadvantage on the saving throw. Creatures inside the cube have Total Cover, and the cube can hold one Large creature or up to four Medium or Small creatures inside itself at a time. As an action, a creature within 5 feet of the cube can pull a creature or an object out of the cube by succeeding on a DC 12 Strength (Athletics) check, and the puller takes 10 (3d6) Acid damage."},{"n":"Transparent","d":"Even when the cube is in plain sight, a creature must succeed on a DC 15 Wisdom (Perception) check to notice the cube if the creature hasn't witnessed the cube move or otherwise act."}],"actions":[{"n":"Pseudopod","kind":"atk","hit":4,"dmg":"3d6+2","dtype":"acid","d":"reach 5 ft"},{"n":"Engulf","kind":"save","save":{"ability":"DEX","dc":12},"d":"The cube moves up to its Speed without provoking Opportunity Attacks. The cube can move through the spaces of Large or smaller creatures if it has room inside itself to contain them (see the Ooze Cube trait). Dexterity Saving Throw: DC 12, each creature whose space the cube enters for the first time during this move. Failure: 10 (3d6) Acid damage, and the target is engulfed. An engulfed target is suffocating, can't cast spells with a Verbal component, has the Restrained condition, and takes 10 (3d6) Acid damage at the start of each of the cube's turns. When the cube moves, the engulfed target moves with it. An engulfed target can try to escape by taking an action to make a DC 12 Strength (Athletics) check. On a successful check, the target escapes and enters the nearest unoccupied space. Success: Half damage, and the target moves to an unoccupied space within 5 feet of the cube. If there is no unoccupied space, the target fails the save instead."}]},{"name":"Gibbering Mouther","cr":"2","cat":"aber","ac":9,"hp":52,"hpF":"7d8+21","spd":"20 ft., Swim 20 ft.","mods":{"str":0,"dex":-1,"con":3,"int":-4,"wis":0,"cha":-2},"condImmune":["Prone"],"traits":[{"n":"Aberrant Ground","d":"The ground in a 10-foot Emanation originating from the mouther is Difficult Terrain."},{"n":"Gibbering","d":"The mouther babbles incoherently while it doesn't have the Incapacitated condition. Wisdom Saving Throw: DC 10, any creature that starts its turn within 20 feet of the mouther while it is babbling. Failure: The target rolls 1d8 to determine what it does during the current turn: 1-4. The target does nothing. 5-6. The target takes no action or Bonus Action and uses all its movement to move in a random direction. 7-8. The target makes a melee attack against a randomly determined creature within its reach or does nothing if it can't make such an attack."}],"actions":[{"n":"Bite","kind":"atk","hit":2,"dmg":"2d6","dtype":"piercing","d":"reach 5 ft. If the target is a Medium or smaller creature, it has the Prone condition. The target dies if it is reduced to 0 Hit Points by this attack. Its body is then absorbed into the mouther, leaving only equipment behind."},{"n":"Blinding Spittle","kind":"save","save":{"ability":"DEX","dc":10},"rech":5,"d":"Dexterity Saving Throw: DC 10, each creature in a 10-foot-radius Sphere centered on a point within 30 feet. Failure: 7 (2d6) Radiant damage, and the target has the Blinded condition until the end of the mouther's next turn."}]},{"name":"Gray Ooze","cr":"1/2","cat":"aber","ac":9,"hp":22,"hpF":"3d8+9","spd":"10 ft., Climb 10 ft.","mods":{"str":1,"dex":-2,"con":3,"int":-5,"wis":-2,"cha":-4},"resist":["acid","cold","fire"],"condImmune":["Blinded","Charmed","Deafened","Exhaustion","Frightened","Grappled","Prone","Restrained"],"traits":[{"n":"Amorphous","d":"The ooze can move through a space as narrow as 1 inch without expending extra movement to do so."},{"n":"Corrosive Form","d":"Nonmagical ammunition is destroyed immediately after hitting the ooze and dealing any damage. Any nonmagical weapon takes a cumulative -1 penalty to attack rolls immediately after dealing damage to the ooze and coming into contact with it. The weapon is destroyed if the penalty reaches -5. The penalty can be removed by casting the Mending spell on the weapon. The ooze can eat through 2-inch-thick, nonmagical metal or wood in 1 round. 293 System Reference Document 5.2.1"}],"actions":[{"n":"Pseudopod","kind":"atk","hit":3,"dmg":"2d8+1","dtype":"acid","d":"reach 5 ft. Nonmagical armor worn by the target takes a -1 penalty to the AC it offers. The armor is destroyed if the penalty reduces its AC to 10. The penalty can be removed by casting the Mending spell on the armor."}]},{"name":"Grick","cr":"2","cat":"aber","ac":14,"hp":54,"hpF":"12d8","spd":"30 ft., Climb 30 ft.","mods":{"str":2,"dex":2,"con":0,"int":-4,"wis":2,"cha":-3},"multi":"The grick makes one Beak attack and one Tentacles attack.","actions":[{"n":"Beak","kind":"atk","hit":4,"dmg":"2d6+2","dtype":"piercing","d":"reach 5 ft"},{"n":"Tentacles","kind":"atk","hit":4,"dmg":"1d10+2","dtype":"slashing","d":"reach 5 ft. If the target is a Medium or smaller creature, it has the Grappled condition (escape DC 12) from all four tentacles."}]},{"name":"Grimlock","cr":"1/4","cat":"aber","ac":11,"hp":11,"hpF":"2d8+2","spd":"30 ft., Climb 30 ft.","mods":{"str":3,"dex":1,"con":1,"int":-1,"wis":-1,"cha":-2},"actions":[{"n":"Bone Cudgel","kind":"atk","hit":5,"dmg":"1d6+3","dtype":"bludgeoning","extra":"1d4","extraType":"psychic","d":"reach 5 ft"}]},{"name":"Ochre Jelly","cr":"2","cat":"aber","ac":8,"hp":52,"hpF":"7d10+14","spd":"20 ft., Climb 20 ft.","mods":{"str":2,"dex":-2,"con":2,"int":-4,"wis":-2,"cha":-5},"resist":["acid"],"immune":["lightning","slashing"],"condImmune":["Charmed","Deafened","Exhaustion","Frightened","Grappled","Prone","Restrained"],"traits":[{"n":"Amorphous","d":"The jelly can move through a space as narrow as 1 inch without expending extra movement to do so."},{"n":"Spider Climb","d":"The jelly can climb difficult surfaces, including along ceilings, without needing to make an ability check."}],"actions":[{"n":"Pseudopod","kind":"atk","hit":4,"dmg":"3d6+2","dtype":"acid","d":"reach 5 ft. 312 System Reference Document 5.2.1"}],"reactions":[{"n":"Split","d":"Trigger: While the jelly is Large or Medium and has 10+ Hit Points, it becomes Bloodied or is subjected to Lightning or Slashing damage. Response: The jelly splits into two new Ochre Jellies. Each new jelly is one size smaller than the original jelly and acts on its Initiative. The original jelly's Hit Points are divided evenly between the new jellies (round down)."}]},{"name":"Otyugh","cr":"5","cat":"aber","ac":14,"hp":104,"hpF":"11d10+44","spd":"30 ft.","mods":{"str":3,"dex":0,"con":4,"int":-2,"wis":1,"cha":-2},"saves":{"con":7},"multi":"The otyugh makes one Bite attack and two Tentacle attacks.","actions":[{"n":"Bite","kind":"atk","hit":6,"dmg":"2d8+3","dtype":"piercing","d":"reach 5 ft. and the target has the Poisoned condition. Whenever the Poisoned target finishes a Long Rest, it is subjected to the following effect. Constitution Saving Throw: DC 15. Failure: The target's Hit Point maximum decreases by 5 (1d10) and doesn't return to normal until the Poisoned condition ends on the target. Success: The Poisoned condition ends."},{"n":"Tentacle","kind":"atk","hit":6,"dmg":"2d8+3","dtype":"piercing","d":"reach 10 ft. If the target is a Medium or smaller creature, it has the Grappled condition (escape DC 13) from one of two tentacles. 313 System Reference Document 5.2.1"},{"n":"Tentacle Slam","kind":"save","save":{"ability":"CON","dc":14},"d":"Constitution Saving Throw: DC 14, each creature Grappled by the otyugh. Failure: 16 (3d8 + 3) Bludgeoning damage, and the target has the Stunned condition until the start of the otyugh's next turn. Success: Half damage only."}]},{"name":"Roper","cr":"5","cat":"aber","ac":20,"hp":93,"hpF":"11d10+33","spd":"10 ft., Climb 20 ft.","mods":{"str":4,"dex":-1,"con":3,"int":-2,"wis":3,"cha":-2},"traits":[{"n":"Spider Climb","d":"The roper can climb difficult surfaces, including along ceilings, without needing to make an ability check."}],"multi":"The roper makes two Tentacle attacks, uses Reel, and makes two Bite attacks.","actions":[{"n":"Bite","kind":"atk","hit":7,"dmg":"3d8+4","dtype":"piercing","d":"reach 5 ft"},{"n":"Tentacle","kind":"text","d":"Melee Attack Roll: +7, reach 60 ft. Hit: The target has the Grappled condition (escape DC 14) from one of six tentacles, and the target has the Poisoned condition until the grapple ends. The tentacle can be damaged, freeing a creature it has Grappled when destroyed (AC 20, HP 10, Immunity to Poison and Psychic damage). Damaging the tentacle deals no damage to the roper, and a destroyed tentacle regrows at the start of the roper's next turn."},{"n":"Reel","kind":"text","d":"The roper pulls each creature Grappled by it up to 30 feet straight toward it."}]},{"name":"Ankheg","cr":"2","cat":"monst","ac":14,"hp":45,"hpF":"6d10+12","spd":"30 ft., Burrow 10 ft.","mods":{"str":3,"dex":0,"con":2,"int":-5,"wis":1,"cha":-2},"traits":[{"n":"Tunneler","d":"The ankheg can burrow through solid rock at half its Burrow Speed and leaves a 10-foot-diameter tunnel in its wake."}],"actions":[{"n":"Bite","kind":"atk","hit":5,"dmg":"2d6+3","dtype":"slashing","extra":"1d6","extraType":"acid","d":"(with Advantage if the target is Grappled by the ankheg) reach 5 ft. If the target is a Large or smaller creature, it has the Grappled condition (escape DC 13)."},{"n":"Acid Spray","kind":"save","save":{"ability":"DEX","dc":12},"rech":6,"d":"Dexterity Saving Throw: DC 12, each creature in a 30-foot-long, 5-foot-wide Line. Failure: 14 (4d6) Acid damage. Success: Half damage."}]},{"name":"Axe Beak","cr":"1/4","cat":"monst","ac":11,"hp":19,"hpF":"3d10+3","spd":"50 ft.","mods":{"str":2,"dex":1,"con":1,"int":-4,"wis":0,"cha":-3},"actions":[{"n":"Beak","kind":"atk","hit":4,"dmg":"1d8+2","dtype":"slashing","d":"reach 5 ft"}]},{"name":"Basilisk","cr":"3","cat":"monst","ac":15,"hp":52,"hpF":"8d8+16","spd":"20 ft.","mods":{"str":3,"dex":-1,"con":2,"int":-4,"wis":-1,"cha":-2},"actions":[{"n":"Bite","kind":"atk","hit":5,"dmg":"2d6+3","dtype":"piercing","extra":"2d6","extraType":"poison","d":"reach 5 ft"}],"bonus":[{"n":"Petrifying Gaze (Recharge 4-6)","d":"Constitution Saving Throw: DC 12, each creature in a 30-foot Cone. If the basilisk sees its reflection in the Cone, the basilisk must make this save. First Failure: The target has the Restrained condition and repeats the save at the end of its next turn if it is still Restrained, ending the effect on itself on a success. Second Failure: The target has the Petrified condition instead of the Restrained condition."}]},{"name":"Behir","cr":"11","cat":"monst","ac":17,"hp":168,"hpF":"16d12+64","spd":"50 ft., Climb 50 ft.","mods":{"str":6,"dex":3,"con":4,"int":-2,"wis":2,"cha":1},"immune":["lightning"],"multi":"The behir makes one Bite attack and uses Constrict.","actions":[{"n":"Bite","kind":"atk","hit":10,"dmg":"2d12+6","dtype":"piercing","extra":"2d10","extraType":"lightning","d":"reach 10 ft"},{"n":"Constrict","kind":"save","save":{"ability":"STR","dc":18},"d":"Strength Saving Throw: DC 18, one Large or smaller creature the behir can see within 5 feet. Failure: 28 (5d8 + 6) Bludgeoning damage. The target has the Grappled condition (escape DC 16), and it has the Restrained condition until the grapple ends."},{"n":"Lightning Breath","kind":"save","save":{"ability":"DEX","dc":16},"rech":5,"d":"Dexterity Saving Throw: DC 16, each creature in a 90-foot-long, 5-footwide Line. Failure: 66 (12d10) Lightning damage. Success: Half damage. 263 System Reference Document 5.2.1"}],"bonus":[{"n":"Swallow","d":"Dexterity Saving Throw: DC 18, one Large or smaller creature Grappled by the behir (the behir can have only one creature swallowed at a time). Failure: The behir swallows the target, which is no longer Grappled. While swallowed, a creature has the Blinded and Restrained conditions, has Total Cover against attacks and other effects outside the behir, and takes 21 (6d6) Acid damage at the start of each of the behir's turns. If the behir takes 30 damage or more on a single turn from the swallowed creature, the behir must succeed on a DC 14 Constitution saving throw at the end of that turn or regurgitate the creature, which falls in a space within 10 feet of the behir and has the Prone condition. If the behir dies, a swallowed creature is no longer Restrained and can escape from the corpse by using 15 feet of movement, exiting Prone."}]},{"name":"Bulette","cr":"5","cat":"monst","ac":17,"hp":94,"hpF":"9d10+45","spd":"40 ft., Burrow 40 ft.","mods":{"str":4,"dex":0,"con":5,"int":-4,"wis":0,"cha":-3},"multi":"The bulette makes two Bite attacks.","actions":[{"n":"Bite","kind":"atk","hit":7,"dmg":"2d12+4","dtype":"piercing","d":"reach 5 ft"},{"n":"Deadly Leap","kind":"save","save":{"ability":"DEX","dc":15},"d":"The bulette spends 5 feet of movement to jump to a space within 15 feet that contains one or more Large or smaller creatures. Dexterity Saving Throw: DC 15, each creature in the bulette's destination space. Failure: 19 (3d12) Bludgeoning damage, and 272 System Reference Document 5.2.1 the target has the Prone condition. Success: Half damage, and the target is pushed 5 feet straight away from the bulette."}],"bonus":[{"n":"Leap","d":"The bulette jumps up to 30 feet by spending 10 feet of movement."}]},{"name":"Chimera","cr":"6","cat":"monst","ac":14,"hp":114,"hpF":"12d10+48","spd":"30 ft., Fly 60 ft.","mods":{"str":4,"dex":0,"con":4,"int":-4,"wis":2,"cha":0},"multi":"The chimera makes one Ram attack, one Bite attack, and one Claw attack. It can replace the Claw attack with a use of Fire Breath if available.","actions":[{"n":"Bite","kind":"atk","hit":7,"dmg":"2d6+4","dtype":"piercing","d":"reach 5 ft. or 18 (4d6 + 4) Piercing damage if the chimera had Advantage on the attack roll."},{"n":"Claw","kind":"atk","hit":7,"dmg":"1d6+4","dtype":"slashing","d":"reach 5 ft"},{"n":"Ram","kind":"atk","hit":7,"dmg":"1d12+4","dtype":"bludgeoning","d":"reach 5 ft. If the target is a Medium or smaller creature, it has the Prone condition."},{"n":"Fire Breath","kind":"save","save":{"ability":"DEX","dc":15},"rech":5,"d":"Dexterity Saving Throw: DC 15, each creature in a 15-foot Cone. Failure: 31 (7d8) Fire damage. Success: Half damage."}]},{"name":"Cockatrice","cr":"1/2","cat":"monst","ac":11,"hp":22,"hpF":"5d6+5","spd":"20 ft., Fly 40 ft.","mods":{"str":-2,"dex":1,"con":1,"int":-4,"wis":1,"cha":-3},"condImmune":["Petrified"],"actions":[{"n":"Petrifying Bite","kind":"atk","hit":3,"dmg":"1d4+1","dtype":"piercing","d":"reach 5 ft. If the target is a creature, it is subjected to the following effect. Constitution Saving Throw: DC 11. First Failure: The target has the Restrained condition. The target repeats the save at the end of its next turn if it is still Restrained, ending the effect on itself on a success. Second Failure: The target has the Petrified condition, instead of the Restrained condition, for 24 hours."}]},{"name":"Death Dog","cr":"1","cat":"monst","ac":12,"hp":39,"hpF":"6d8+12","spd":"40 ft.","mods":{"str":2,"dex":2,"con":2,"int":-4,"wis":1,"cha":-2},"condImmune":["Blinded","Charmed","Deafened","Frightened","Stunned","Unconscious"],"multi":"The death dog makes two Bite attacks.","actions":[{"n":"Bite","kind":"atk","hit":4,"dmg":"1d4+2","dtype":"piercing","d":"reach 5 ft. If the target is a creature, it is subjected to the following effect. Constitution Saving Throw: DC 12. First Failure: The target has the Poisoned condition. While Poisoned, the target's Hit Point max- 279 System Reference Document 5.2.1 imum doesn't return to normal when finishing a Long Rest, and it repeats the save every 24 hours that elapse, ending the effect on itself on a success. Subsequent Failures: The Poisoned target's Hit Point maximum decreases by 5 (1d10)."}]},{"name":"Doppelganger","cr":"3","cat":"monst","ac":14,"hp":52,"hpF":"8d8+16","spd":"30 ft.","mods":{"str":0,"dex":4,"con":2,"int":0,"wis":1,"cha":2},"condImmune":["Charmed"],"multi":"The doppelganger makes two Slam attacks and uses Unsettling Visage if available.","actions":[{"n":"Slam","kind":"atk","hit":6,"dmg":"2d6+4","dtype":"bludgeoning","d":"(with Advantage during the first round of each combat) reach 5 ft"},{"n":"Read Thoughts","kind":"text","d":"The doppelganger casts Detect Thoughts, requiring no spell components and using Charisma as the spellcasting ability (spell save DC 12)."},{"n":"Unsettling Visage","kind":"save","save":{"ability":"WIS","dc":12},"rech":6,"d":"Wisdom Saving Throw: DC 12, each creature in a 15-foot Emanation originating from the doppelganger that can see the doppelganger. Failure: The target has the Frightened condition and repeats the save at the end of each of its turns, ending the effect on itself on a success. After 1 minute, it succeeds automatically."}],"bonus":[{"n":"Shape-Shift","d":"The doppelganger shape-shifts into a Medium or Small Humanoid, or it returns to its true form. Its game statistics, other than its size, are the same in each form. Any equipment it is wearing or carrying isn't transformed."}]},{"name":"Drider","cr":"6","cat":"monst","ac":19,"hp":123,"hpF":"13d10+52","spd":"30 ft., Climb 30 ft.","mods":{"str":3,"dex":4,"con":4,"int":1,"wis":3,"cha":1},"traits":[{"n":"Spider Climb","d":"The drider can climb difficult surfaces, including along ceilings, without needing to make an ability check."},{"n":"Sunlight Sensitivity","d":"While in sunlight, the drider has Disadvantage on ability checks and attack rolls."},{"n":"Web Walker","d":"The drider ignores movement restrictions caused by webs, and the drider knows the location of any other creature in contact with the same web."}],"multi":"The drider makes three attacks, using Foreleg or Poison Burst in any combination.","actions":[{"n":"Foreleg","kind":"atk","hit":7,"dmg":"2d8+4","dtype":"piercing","d":"reach 10 ft"},{"n":"Poison Burst","kind":"atk","hit":6,"dmg":"3d6+3","dtype":"poison","d":"range 120 ft"}],"bonus":[{"n":"Magic of the Spider Queen (Recharge 5-6)","d":"The drider casts Darkness, Faerie Fire, or Web, requiring no Material components and using Wisdom as the spellcasting ability (spell save DC 14)."}]},{"name":"Ettercap","cr":"2","cat":"monst","ac":13,"hp":44,"hpF":"8d8+8","spd":"30 ft., Climb 30 ft.","mods":{"str":2,"dex":2,"con":1,"int":-2,"wis":1,"cha":-1},"traits":[{"n":"Spider Climb","d":"The ettercap can climb difficult surfaces, including along ceilings, without needing to make an ability check."},{"n":"Web Walker","d":"The ettercap ignores movement restrictions caused by webs, and the ettercap knows the location of any other creature in contact with the same web."}],"multi":"The ettercap makes one Bite attack and one Claw attack.","actions":[{"n":"Bite","kind":"atk","hit":4,"dmg":"1d6+2","dtype":"piercing","extra":"1d4","extraType":"poison","d":"reach 5 ft. and the target has the Poisoned condition until the start of the ettercap's next turn."},{"n":"Claw","kind":"atk","hit":4,"dmg":"2d4+2","dtype":"slashing","d":"reach 5 ft"},{"n":"Web Strand","kind":"save","save":{"ability":"DEX","dc":12},"rech":5,"d":"Dexterity Saving Throw: DC 12, one Large or smaller creature the ettercap can see within 30 feet. Failure: The target has the Restrained condition until the web is destroyed (AC 10; HP 5; Vulnerability to Fire damage; Immunity to Bludgeoning, Poison, and Psychic damage)."}],"bonus":[{"n":"Reel","d":"The ettercap pulls one creature within 30 feet of itself that is Restrained by its Web Strand up to 25 feet straight toward itself."}]},{"name":"Flying Snake","cr":"1/8","cat":"monst","ac":14,"hp":5,"hpF":"2d4","spd":"30 ft., Fly 60 ft., Swim 30 ft.","mods":{"str":-3,"dex":2,"con":0,"int":-4,"wis":1,"cha":-3},"traits":[{"n":"Flyby","d":"The snake doesn't provoke an Opportunity Attack when it flies out of an enemy's reach."}],"actions":[{"n":"Bite","kind":"atk","hit":4,"dmg":"1","dtype":"piercing","d":"reach 5 ft. plus 5 (2d4) Poison damage."}]},{"name":"Giant Vulture","cr":"1","cat":"monst","ac":10,"hp":25,"hpF":"3d10+9","spd":"10 ft., Fly 60 ft.","mods":{"str":2,"dex":0,"con":3,"int":-2,"wis":1,"cha":-2},"resist":["necrotic"],"traits":[{"n":"Pack Tactics","d":"The vulture has Advantage on an attack roll against a creature if at least one of the vulture's allies is within 5 feet of the creature and the ally doesn't have the Incapacitated condition."}],"actions":[{"n":"Gouge","kind":"atk","hit":4,"dmg":"2d6+2","dtype":"piercing","d":"reach 5 ft. and the target has the Poisoned condition until the end of its next turn."}]},{"name":"Griffon","cr":"2","cat":"monst","ac":12,"hp":59,"hpF":"7d10+21","spd":"30 ft., Fly 80 ft.","mods":{"str":4,"dex":2,"con":3,"int":-4,"wis":1,"cha":-1},"multi":"The griffon makes two Rend attacks.","actions":[{"n":"Rend","kind":"atk","hit":6,"dmg":"1d8+4","dtype":"piercing","d":"reach 5 ft. If the target is a Medium or smaller creature, it has the Grappled condition (escape DC 14) from both of the griffon's front claws."}]},{"name":"Harpy","cr":"1","cat":"monst","ac":11,"hp":38,"hpF":"7d8+7","spd":"20 ft., Fly 40 ft.","mods":{"str":1,"dex":1,"con":1,"int":-2,"wis":0,"cha":1},"actions":[{"n":"Claw","kind":"atk","hit":3,"dmg":"2d4+1","dtype":"slashing","d":"reach 5 ft"},{"n":"Luring Song","kind":"save","save":{"ability":"WIS","dc":11},"conc":true,"d":"The harpy sings a magical melody, which lasts until the harpy's Concentration ends on it. Wisdom Saving Throw: DC 11, each Humanoid and Giant in a 300-foot Emanation originating from the harpy when the song starts. Failure: The target has the Charmed condition until the song ends and repeats the save at the end of each of its turns. While Charmed, the target has the Incapacitated condition and ignores the Luring Song of other harpies. If the target is more than 5 feet from the harpy, the target moves on its turn toward the harpy by the most direct route, trying to get within 5 feet of the harpy. It doesn't avoid Opportunity Attacks; however, before moving into damaging terrain (such as lava or a pit) and whenever it takes damage from a source other than the harpy, the target repeats the save. Success: The target is immune to this harpy's Luring Song for 24 hours."}]},{"name":"Hippogriff","cr":"1","cat":"monst","ac":11,"hp":26,"hpF":"4d10+4","spd":"40 ft., Fly 60 ft.","mods":{"str":3,"dex":1,"con":1,"int":-4,"wis":1,"cha":-1},"traits":[{"n":"Flyby","d":"The hippogriff doesn't provoke an Opportunity Attack when it flies out of an enemy's reach."}],"multi":"The hippogriff makes two Rend attacks.","actions":[{"n":"Rend","kind":"atk","hit":5,"dmg":"1d8+3","dtype":"slashing","d":"reach 5 ft"}]},{"name":"Hydra","cr":"8","cat":"monst","ac":15,"hp":184,"hpF":"16d12+80","spd":"40 ft., Swim 40 ft.","mods":{"str":5,"dex":1,"con":5,"int":-4,"wis":0,"cha":-2},"condImmune":["Blinded","Charmed","Deafened","Frightened","Stunned","Unconscious"],"traits":[{"n":"Hold Breath","d":"The hydra can hold its breath for 1 hour."},{"n":"Multiple Heads","d":"The hydra has five heads. Whenever the hydra takes 25 damage or more on a single turn, one of its heads dies. The hydra dies if all its heads are dead. At the end of each of its turns when it has at least one living head, the hydra grows two heads for each of its heads that died since its last turn, unless it has taken Fire damage since its last turn. The hydra regains 20 Hit Points when it grows new heads."},{"n":"Reactive Heads","d":"For each head the hydra has beyond one, it gets an extra Reaction that can be used only for Opportunity Attacks."}],"multi":"The hydra makes as many Bite attacks as it has heads.","actions":[{"n":"Bite","kind":"atk","hit":8,"dmg":"1d10+5","dtype":"piercing","d":"reach 10 ft. 300 System Reference Document 5.2.1"}]},{"name":"Kraken","cr":"23","cat":"monst","ac":18,"hp":481,"hpF":"26d20+208","spd":"30 ft., Swim 120 ft.","mods":{"str":10,"dex":0,"con":8,"int":6,"wis":4,"cha":5},"saves":{"str":17,"dex":7,"con":15,"wis":11},"immune":["cold","lightning"],"condImmune":["Frightened","Grappled","Paralyzed","Restrained"],"traits":[{"n":"Amphibious","d":"The kraken can breathe air and water."},{"n":"Legendary Resistance (4/Day, or 5/Day in Lair)","d":"If the kraken fails a saving throw, it can choose to succeed instead."},{"n":"Siege Monster","d":"The kraken deals double damage to objects and structures."}],"multi":"The kraken makes two Tentacle attacks and uses Fling, Lightning Strike, or Swallow.","actions":[{"n":"Tentacle","kind":"atk","hit":17,"dmg":"4d6+10","dtype":"bludgeoning","d":"reach 30 ft. The target has the Grappled condition (escape DC 20) from one of ten tentacles, and it has the Restrained condition until the grapple ends."},{"n":"Fling","kind":"save","save":{"ability":"DEX","dc":25},"d":"The kraken throws a Large or smaller creature Grappled by it to a space it can see within 60 feet of itself that isn't in the air. Dexterity Saving Throw: DC 25, the creature thrown and each creature in the destination space. Failure: 18 (4d8) Bludgeoning damage, and the target has the Prone condition. Success: Half damage only."},{"n":"Lightning Strike","kind":"save","save":{"ability":"DEX","dc":23},"d":"Dexterity Saving Throw: DC 23, one creature the kraken can see within 120 feet. Failure: 33 (6d10) Lightning damage. Success: Half damage."},{"n":"Swallow","kind":"save","save":{"ability":"DEX","dc":25},"d":"Dexterity Saving Throw: DC 25, one creature Grappled by the kraken (it can have up to four creatures swallowed at a time). Failure: 23 (3d8 + 10) Piercing damage. If the target is Large or smaller, it is swallowed and no longer Grappled. A swallowed creature has the Restrained condition, has Total Cover against attacks and other effects outside the kraken, and takes 24 (7d6) Acid damage at the start of each of its turns. If the kraken takes 50 damage or more on a single 303 System Reference Document 5.2.1 turn from a creature inside it, the kraken must succeed on a DC 25 Constitution saving throw at the end of that turn or regurgitate all swallowed creatures, each of which falls in a space within 10 feet of the kraken with the Prone condition. If the kraken dies, any swallowed creature no longer has the Restrained condition and can escape from the corpse using 15 feet of movement, exiting Prone."}],"legendary":{"count":3,"options":[{"n":"Storm Bolt","d":"The kraken uses Lightning Strike."},{"n":"Toxic Ink","d":"Constitution Saving Throw: DC 23, each creature in a 15-foot Emanation originating from the kraken while it is underwater. Failure: The target has the Blinded and Poisoned conditions until the end of the kraken's next turn. The kraken then moves up to its Speed. Failure or Success: The kraken can't take this action again until the start of its next turn."}]},"legRes":4},{"name":"Manticore","cr":"3","cat":"monst","ac":14,"hp":68,"hpF":"8d10+24","spd":"30 ft., Fly 50 ft.","mods":{"str":3,"dex":3,"con":3,"int":-2,"wis":1,"cha":-1},"multi":"The manticore makes three attacks, using Rend or Tail Spike in any combination.","actions":[{"n":"Rend","kind":"atk","hit":5,"dmg":"1d8+3","dtype":"slashing","d":"reach 5 ft"},{"n":"Tail Spike","kind":"atk","hit":5,"dmg":"1d8+3","dtype":"piercing","d":"range 100/200 ft"}]},{"name":"Medusa","cr":"6","cat":"monst","ac":15,"hp":127,"hpF":"17d8+51","spd":"30 ft.","mods":{"str":0,"dex":3,"con":3,"int":1,"wis":1,"cha":2},"saves":{"wis":4},"multi":"The medusa makes two Claw attacks and one Snake Hair attack, or it makes three Poison Ray attacks.","actions":[{"n":"Claw","kind":"atk","hit":6,"dmg":"2d6+3","dtype":"slashing","d":"reach 5 ft"},{"n":"Snake Hair","kind":"atk","hit":6,"dmg":"1d4+3","dtype":"piercing","extra":"4d6","extraType":"poison","d":"reach 5 ft"},{"n":"Poison Ray","kind":"atk","hit":5,"dmg":"2d8+2","dtype":"poison","d":"range 150 ft"}],"bonus":[{"n":"Petrifying Gaze (Recharge 5-6)","d":"Constitution Saving Throw: DC 13, each creature in a 30-foot Cone. If the medusa sees its reflection in the Cone, the medusa must make this save. First Failure: The target has the Restrained condition and repeats the save at the end of its next turn if it is still Restrained, ending the effect on itself on a success. Second Failure: The target has the Petrified condition instead of the Restrained condition."}]},{"name":"Merrow","cr":"2","cat":"monst","ac":13,"hp":45,"hpF":"6d10+12","spd":"10 ft., Swim 40 ft.","mods":{"str":4,"dex":2,"con":2,"int":-1,"wis":0,"cha":-1},"traits":[{"n":"Amphibious","d":"The merrow can breathe air and water."}],"multi":"The merrow makes two attacks, using Bite, Claw, or Harpoon in any combination.","actions":[{"n":"Bite","kind":"atk","hit":6,"dmg":"1d4+4","dtype":"piercing","d":"reach 5 ft. and the target has the Poisoned condition until the end of the merrow's next turn."},{"n":"Claw","kind":"atk","hit":6,"dmg":"2d4+4","dtype":"slashing","d":"reach 5 ft"},{"n":"Harpoon","kind":"atk","hit":6,"dmg":"2d6+4","dtype":"piercing","d":"reach 5 ft. or range 20/60 ft. If the target is a Large or smaller creature, the merrow pulls the target up to 15 feet straight toward itself."}]},{"name":"Mimic","cr":"2","cat":"monst","ac":12,"hp":58,"hpF":"9d8+18","spd":"20 ft.","mods":{"str":3,"dex":1,"con":2,"int":-3,"wis":1,"cha":-1},"immune":["acid"],"condImmune":["Prone"],"traits":[{"n":"Adhesive (Object Form Only)","d":"The mimic adheres to anything that touches it. A Huge or smaller creature adhered to the mimic has the Grappled condition (escape DC 13). Ability checks made to escape this grapple have Disadvantage."}],"actions":[{"n":"Bite","kind":"atk","hit":5,"dmg":"1d8+3","dtype":"piercing","d":"(with Advantage if the target is Grappled by the mimic) reach 5 ft. -or 12 (2d8 + 3) Piercing damage if the target is Grappled by the mimic-plus 4 (1d8) Acid damage."},{"n":"Pseudopod","kind":"atk","hit":5,"dmg":"1d8+3","dtype":"bludgeoning","extra":"1d8","extraType":"acid","d":"reach 5 ft. If the target is a Large or smaller creature, it has the Grappled condition (escape DC 13). Ability checks made to escape this grapple have Disadvantage."}],"bonus":[{"n":"Shape-Shift","d":"The mimic shape-shifts to resemble a Medium or Small object while retaining its game statistics, or it returns to its true blob form. Any equipment it is wearing or carrying isn't transformed."}]},{"name":"Minotaur of Baphomet","cr":"3","cat":"monst","ac":14,"hp":85,"hpF":"10d10+30","spd":"40 ft.","mods":{"str":4,"dex":0,"con":3,"int":-2,"wis":3,"cha":-1},"actions":[{"n":"Abyssal Glaive","kind":"atk","hit":6,"dmg":"1d12+4","dtype":"slashing","extra":"3d6","extraType":"necrotic","d":"reach 10 ft"},{"n":"Gore","kind":"atk","hit":6,"dmg":"4d6+4","dtype":"piercing","rech":5,"d":"reach 5 ft. If the target is a Large or smaller creature and the minotaur moved 10+ feet straight toward it immediately before the hit, the target takes an extra 10 (3d6) Piercing damage and has the Prone condition. 309 System Reference Document 5.2.1"}]},{"name":"Owlbear","cr":"3","cat":"monst","ac":13,"hp":59,"hpF":"7d10+21","spd":"40 ft., Climb 40 ft.","mods":{"str":5,"dex":1,"con":3,"int":-4,"wis":1,"cha":-2},"multi":"The owlbear makes two Rend attacks.","actions":[{"n":"Rend","kind":"atk","hit":7,"dmg":"2d8+5","dtype":"slashing","d":"reach 5 ft"}]},{"name":"Phase Spider","cr":"3","cat":"monst","ac":14,"hp":45,"hpF":"7d10+7","spd":"30 ft., Climb 30 ft.","mods":{"str":2,"dex":3,"con":1,"int":-2,"wis":0,"cha":-2},"traits":[{"n":"Ethereal Sight","d":"The spider can see 60 feet into the Ethereal Plane while on the Material Plane and vice versa."},{"n":"Spider Climb","d":"The spider can climb difficult surfaces, including along ceilings, without needing to make an ability check."},{"n":"Web Walker","d":"The spider ignores movement restrictions caused by webs, and the spider knows the location of any other creature in contact with the same web."}],"multi":"The spider makes two Bite attacks.","actions":[{"n":"Bite","kind":"atk","hit":5,"dmg":"1d10+3","dtype":"piercing","extra":"2d8","extraType":"poison","d":"reach 5 ft. If this damage reduces the target to 0 Hit Points, the target becomes Stable, and it has the Poisoned condition for 1 hour. While Poisoned, the target also has the Paralyzed condition."}],"bonus":[{"n":"Ethereal Jaunt","d":"The spider teleports from the Material Plane to the Ethereal Plane or vice versa."}]},{"name":"Purple Worm","cr":"15","cat":"monst","ac":18,"hp":247,"hpF":"15d20+90","spd":"50 ft., Burrow 50 ft.","mods":{"str":9,"dex":-2,"con":6,"int":-5,"wis":-1,"cha":-3},"saves":{"con":11,"wis":4},"traits":[{"n":"Tunneler","d":"The worm can burrow through solid rock at half its Burrow Speed and leaves a 10-foot-diameter tunnel in its wake."}],"multi":"The worm makes one Bite attack and one Tail Stinger attack.","actions":[{"n":"Bite","kind":"atk","hit":14,"dmg":"3d8+9","dtype":"piercing","d":"reach 10 ft. If the target is a Large or smaller creature, it has the Grappled condition (escape DC 19), and it has the Restrained condition until the grapple ends."},{"n":"Tail Stinger","kind":"atk","hit":14,"dmg":"2d6+9","dtype":"piercing","extra":"10d6","extraType":"poison","d":"reach 10 ft"}],"bonus":[{"n":"Swallow","d":"Strength Saving Throw: DC 19, one Large or smaller creature Grappled by the worm (it can have up to three creatures swallowed at a time). Failure: The target is swallowed by the worm, and the Grappled condition ends. A swallowed creature has the Blinded and Restrained conditions, has Total Cover against attacks and other effects outside the worm, and takes 17 (5d6) Acid damage at the start of each of the worm's turns. If the worm takes 30 damage or more on a single turn from a creature inside it, the worm must succeed on a DC 21 Constitution saving throw at the end of that turn or regurgitate all swallowed creatures, each of which falls in a space within 5 feet of the worm and has the Prone condition. If the worm dies, any swallowed creature no longer has the Restrained condition and can escape from the corpse using 20 feet of movement, exiting Prone."}]},{"name":"Remorhaz","cr":"11","cat":"monst","ac":17,"hp":195,"hpF":"17d12+85","spd":"40 ft., Burrow 30 ft.","mods":{"str":7,"dex":1,"con":5,"int":-3,"wis":0,"cha":-3},"immune":["cold","fire"],"traits":[{"n":"Heat Aura","d":"At the end of each of the remorhaz's turns, each creature in a 5-foot Emanation originating from the remorhaz takes 16 (3d10) Fire damage."}],"actions":[{"n":"Bite","kind":"atk","hit":11,"dmg":"2d10+7","dtype":"piercing","extra":"4d6","extraType":"fire","d":"reach 10 ft. If the target is a Large or smaller creature, it has the Grappled condition (escape DC 17), and it has the Restrained condition until the grapple ends."}],"bonus":[{"n":"Swallow","d":"Strength Saving Throw: DC 19, one Large or smaller creature Grappled by the remorhaz (it can have up to two creatures swallowed at a time). Failure: The target is swallowed by the remorhaz, and the Grappled condition ends. A swallowed creature has the Blinded and Restrained conditions, it has Total Cover against attacks and other effects outside the remorhaz, and it takes 10 (3d6) Acid damage plus 10 (3d6) Fire damage at the start of each of the remorhaz's turns. If the remorhaz takes 30 damage or more on a single turn from a creature inside it, the remorhaz must succeed on a DC 15 Constitution saving throw at the end of that turn or regurgitate all swallowed creatures, each of which falls in a space within 5 feet of the remorhaz and has the Prone condition. If the remorhaz dies, any swallowed creature no longer has the Restrained condition and can escape from the corpse by using 15 feet of movement, exiting Prone."}]},{"name":"Roc","cr":"11","cat":"monst","ac":15,"hp":248,"hpF":"16d20+80","spd":"20 ft., Fly 120 ft.","mods":{"str":9,"dex":0,"con":5,"int":-4,"wis":0,"cha":-1},"saves":{"dex":4,"wis":4},"multi":"The roc makes two Beak attacks. It can replace one attack with a Talons attack.","actions":[{"n":"Beak","kind":"atk","hit":13,"dmg":"3d12+9","dtype":"piercing","d":"reach 10 ft"},{"n":"Talons","kind":"atk","hit":13,"dmg":"4d6+9","dtype":"slashing","d":"reach 5 ft. If the target is a Huge or smaller creature, it has the Grappled condition (escape DC 19) from both talons, and it has the Restrained condition until the grapple ends."}],"bonus":[{"n":"Swoop (Recharge 5-6)","d":"If the roc has a creature Grappled, the roc flies up to half its Fly Speed without provoking Opportunity Attacks and drops that creature."}]},{"name":"Rust Monster","cr":"1/2","cat":"monst","ac":14,"hp":33,"hpF":"6d8+6","spd":"40 ft.","mods":{"str":1,"dex":1,"con":1,"int":-4,"wis":1,"cha":-2},"traits":[{"n":"Iron Scent","d":"The rust monster can pinpoint the location of ferrous metal within 30 feet of itself."}],"multi":"The rust monster makes one Bite attack and uses Antennae twice.","actions":[{"n":"Bite","kind":"atk","hit":3,"dmg":"1d8+1","dtype":"piercing","d":"reach 5 ft"},{"n":"Antennae","kind":"save","save":{"ability":"DEX","dc":11},"d":"The rust monster targets one nonmagical metal object-armor or a weapon-worn or carried by a creature within 5 feet of itself. Dexterity Saving Throw: DC 11, the creature with the object. Failure: The object takes a -1 penalty to the AC it offers (armor) or to its attack rolls (weapon). Armor is destroyed if the penalty reduces its AC to 10, and a weapon is destroyed if its penalty reaches -5. The penalty can be removed by casting the Mending spell on the armor or weapon."},{"n":"Destroy Metal","kind":"text","d":"The rust monster touches a nonmagical metal object within 5 feet of itself that isn't being worn or carried. The touch destroys a 1-foot Cube of the object."}],"reactions":[{"n":"Reflexive Antennae","d":"Trigger: An attack roll hits the rust monster. Response: The rust monster uses Antennae."}]},{"name":"Stirge","cr":"1/8","cat":"monst","ac":13,"hp":5,"hpF":"2d4","spd":"10 ft., Fly 40 ft.","mods":{"str":-3,"dex":3,"con":0,"int":-4,"wis":-1,"cha":-2},"actions":[{"n":"Proboscis","kind":"atk","hit":5,"dmg":"1d6+3","dtype":"piercing","d":"reach 5 ft. and the stirge attaches to the target. While attached, the stirge can't make Proboscis attacks, and the target takes 5 (2d4) Necrotic damage at the start of each of the stirge's turns. The stirge can detach itself by spending 5 feet of its movement. The target or a creature within 5 feet of it can detach the stirge as an action."}]},{"name":"Tarrasque","cr":"30","cat":"monst","ac":25,"hp":697,"hpF":"34d20+340","spd":"60 ft., Burrow 40 ft., Climb 60 ft.","mods":{"str":10,"dex":0,"con":10,"int":-4,"wis":0,"cha":0},"saves":{"dex":9,"int":5,"wis":9,"cha":9},"resist":["bludgeoning","piercing","slashing"],"immune":["fire","poison"],"condImmune":["Charmed","Deafened","Frightened","Paralyzed","Poisoned"],"traits":[{"n":"Legendary Resistance (6/Day)","d":"If the tarrasque fails a saving throw, it can choose to succeed instead."},{"n":"Magic Resistance","d":"The tarrasque has Advantage on saving throws against spells and other magical effects."},{"n":"Reflective Carapace","d":"If the tarrasque is targeted by a Magic Missile spell or a spell that requires a ranged attack roll, roll 1d6. On a 1-5, the tarrasque is unaffected. On a 6, the tarrasque is unaffected and reflects the spell, turning the caster into the target."},{"n":"Siege Monster","d":"The tarrasque deals double damage to objects and structures."}],"multi":"The tarrasque makes one Bite attack and three other attacks, using Claw or Tail in any combination.","actions":[{"n":"Bite","kind":"atk","hit":19,"dmg":"4d12+10","dtype":"piercing","d":"reach 15 ft. and the target has the Grappled condition (escape DC 20). Until the grapple ends, the target has the Restrained condition and can't teleport."},{"n":"Claw","kind":"atk","hit":19,"dmg":"4d8+10","dtype":"slashing","d":"reach 15 ft"},{"n":"Tail","kind":"atk","hit":19,"dmg":"3d8+10","dtype":"bludgeoning","d":"reach 30 ft. If the target is a Huge or smaller creature, it has the Prone condition."},{"n":"Thunderous Bellow","kind":"save","save":{"ability":"CON","dc":27},"rech":5,"d":"Constitution Saving Throw: DC 27, each creature and each object that isn't being worn or carried in a 150-foot Cone. Failure: 78 (12d12) Thunder damage, and the target has the Deafened and Frightened conditions until the end of its next turn. Success: Half damage only."}],"bonus":[{"n":"Swallow","d":"Strength Saving Throw: DC 27, one Large or smaller creature Grappled by the tarrasque (it can have up to six creatures swallowed at a time). Failure: The target is swallowed, and the Grappled condition ends. A swallowed creature has the Blinded and Restrained conditions and can't teleport, it has Total Cover against attacks and other effects outside the tarrasque, and it takes 56 (16d6) Acid damage at the start of each of the tarrasque's turns. If the tarrasque takes 60 damage or more on a single turn from a creature inside it, the tarrasque must succeed on a DC 20 Constitution saving throw at the end of that turn or regurgitate all swallowed creatures, each of which falls in a space within 10 feet of the tarrasque and has the Prone condition. If the tarrasque dies, any swallowed creature no longer has the Restrained condition and can escape from the corpse using 20 feet of movement, exiting Prone."}],"legendary":{"count":3,"options":[{"n":"Onslaught","d":"The tarrasque moves up to half its Speed, and it makes one Claw or Tail attack."},{"n":"World-Shaking Movement","d":"The tarrasque moves up to its Speed. At the end of this movement, the tarrasque creates an instantaneous shock wave in a 60-foot Emanation originating from itself. Creatures in that area lose Concentration and, if Medium or smaller, have the Prone condition. The tarrasque can't take this action again until the start of its next turn."}]},"legRes":6},{"name":"Werebear","cr":"5","cat":"monst","ac":15,"hp":135,"hpF":"18d8+54","spd":"30 ft., 40 ft. (bear form only), Climb 30 ft. (bear","mods":{"str":4,"dex":0,"con":3,"int":0,"wis":1,"cha":1},"multi":"The werebear makes two attacks, using Handaxe or Rend in any combination. It can replace one attack with a Bite attack.","actions":[{"n":"Bite (Bear or Hybrid Form Only)","kind":"atk","hit":7,"dmg":"2d12+4","dtype":"piercing","d":"reach 5 ft. If the target is a Humanoid, it is subjected to the following effect. Constitution Saving Throw: DC 14. Failure: The target is cursed. If the cursed target drops to 0 Hit Points, it instead becomes a Werebear under the GM's control and has 10 Hit Points. Success: The target is immune to this werebear's curse for 24 hours."},{"n":"Handaxe (Humanoid or Hybrid Form Only)","kind":"atk","hit":7,"dmg":"3d6+4","dtype":"slashing","d":"reach 5 ft or range 20/60 ft"},{"n":"Rend (Bear or Hybrid Form Only)","kind":"atk","hit":7,"dmg":"2d8+4","dtype":"slashing","d":"reach 5 ft"}],"bonus":[{"n":"Shape-Shift","d":"The werebear shape-shifts into a Large bear-humanoid hybrid form or a Large bear, or it returns to its true humanoid form. Its game statistics, other than its size, are the same in each form. Any equipment it is wearing or carrying isn't transformed."}]},{"name":"Wereboar","cr":"4","cat":"monst","ac":15,"hp":97,"hpF":"15d8+30","spd":"30 ft., 40 ft. (boar form only)","mods":{"str":3,"dex":0,"con":2,"int":0,"wis":0,"cha":-1},"multi":"The wereboar makes two attacks, using Javelin or Tusk in any combination. It can replace one attack with a Gore attack.","actions":[{"n":"Gore (Boar or Hybrid Form Only)","kind":"atk","hit":5,"dmg":"2d8+3","dtype":"piercing","d":"reach 5 ft. If the target is a Humanoid, it is subjected to the following effect. Constitution Saving Throw: DC 12. Failure: The target is cursed. If the cursed target drops to 0 Hit Points, it instead becomes a Wereboar under the GM's control and has 10 Hit Points. Success: The target is immune to this wereboar's curse for 24 hours."},{"n":"Javelin (Humanoid or Hybrid Form Only)","kind":"atk","hit":5,"dmg":"3d6+3","dtype":"piercing","d":"reach 5 ft. or range 30/120 ft"},{"n":"Tusk (Boar or Hybrid Form Only)","kind":"atk","hit":5,"dmg":"2d6+3","dtype":"piercing","d":"reach 5 ft. If the target is a Medium or smaller creature and the wereboar moved 20+ feet straight toward it immediately before the hit, the target takes an extra 7 (2d6) Piercing damage and has the Prone condition. 338 System Reference Document 5.2.1"}],"bonus":[{"n":"Shape-Shift","d":"The wereboar shape-shifts into a Medium boar-humanoid hybrid or a Small boar, or it returns to its true humanoid form. Its game statistics, other than its size, are the same in each form. Any equipment it is wearing or carrying isn't transformed."}]},{"name":"Wererat","cr":"2","cat":"monst","ac":13,"hp":60,"hpF":"11d8+11","spd":"30 ft., Climb 30 ft.","mods":{"str":0,"dex":3,"con":1,"int":0,"wis":0,"cha":-1},"multi":"The wererat makes two attacks, using Scratch or Hand Crossbow in any combination. It can replace one attack with a Bite attack.","actions":[{"n":"Bite (Rat or Hybrid Form Only)","kind":"atk","hit":5,"dmg":"2d4+3","dtype":"piercing","d":"reach 5 ft. If the target is a Humanoid, it is subjected to the following effect. Constitution Saving Throw: DC 11. Failure: The target is cursed. If the cursed target drops to 0 Hit Points, it instead becomes a Wererat under the GM's control and has 10 Hit Points. Success: The target is immune to this wererat's curse for 24 hours."},{"n":"Scratch","kind":"atk","hit":5,"dmg":"1d6+3","dtype":"slashing","d":"reach 5 ft"},{"n":"Hand Crossbow (Humanoid or Hybrid Form Only)","kind":"atk","hit":5,"dmg":"1d6+3","dtype":"piercing","d":"range 30/120 ft"}],"bonus":[{"n":"Shape-Shift","d":"The wererat shape-shifts into a Medium rat-humanoid hybrid or a Small rat, or it returns to its true humanoid form. Its game statistics, other than its size, are the same in each form. Any equipment it is wearing or carrying isn't transformed."}]},{"name":"Weretiger","cr":"4","cat":"monst","ac":12,"hp":120,"hpF":"16d8+48","spd":"30 ft., 40 ft. (tiger form only)","mods":{"str":3,"dex":2,"con":3,"int":0,"wis":1,"cha":0},"multi":"The weretiger makes two attacks, using Scratch or Longbow in any combination. It can replace one attack with a Bite attack.","actions":[{"n":"Bite (Tiger or Hybrid Form Only)","kind":"atk","hit":5,"dmg":"2d8+3","dtype":"piercing","d":"reach 5 ft. If the target is a Humanoid, it is subjected to the following effect. Constitution Saving Throw: DC 13. Failure: The target is cursed. If the cursed target drops to 0 Hit Points, it instead becomes a Weretiger under the GM's control and has 10 Hit Points. Success: The target is immune to this weretiger's curse for 24 hours."},{"n":"Scratch","kind":"atk","hit":5,"dmg":"2d6+3","dtype":"slashing","d":"reach 5 ft"},{"n":"Longbow (Humanoid or Hybrid Form Only)","kind":"atk","hit":4,"dmg":"2d8+2","dtype":"piercing","d":"range 150/600 ft"}],"bonus":[{"n":"Prowl (Tiger or Hybrid Form Only)","d":"The weretiger moves up to its Speed without provoking Opportunity Attacks. At the end of this movement, the weretiger can take the Hide action."},{"n":"Shape-Shift","d":"The weretiger shape-shifts into a Large tiger-humanoid hybrid or a Large tiger, or it returns to its true humanoid form. Its game statistics, other than its size, are the same in each form. Any equipment it is wearing or carrying isn't transformed."}]},{"name":"Werewolf","cr":"3","cat":"monst","ac":15,"hp":71,"hpF":"11d8+22","spd":"30 ft., 40 ft. (wolf form only)","mods":{"str":3,"dex":2,"con":2,"int":0,"wis":0,"cha":0},"traits":[{"n":"Pack Tactics","d":"The werewolf has Advantage on an attack roll against a creature if at least one of the werewolf's allies is within 5 feet of the creature and the ally doesn't have the Incapacitated condition."}],"multi":"The werewolf makes two attacks, using Scratch or Longbow in any combination. It can replace one attack with a Bite attack.","actions":[{"n":"Bite (Wolf or Hybrid Form Only)","kind":"atk","hit":5,"dmg":"2d8+3","dtype":"piercing","d":"reach 5 ft. If the target is a Humanoid, it is subjected to the following effect. Constitution Saving Throw: DC 12. Failure: The target is cursed. If the cursed target drops to 0 Hit Points, it instead becomes a Werewolf under the GM's control and has 10 Hit Points. Success: The target is immune to this werewolf's curse for 24 hours."},{"n":"Scratch","kind":"atk","hit":5,"dmg":"2d6+3","dtype":"slashing","d":"reach 5 ft"},{"n":"Longbow (Humanoid or Hybrid Form Only)","kind":"atk","hit":4,"dmg":"2d8+2","dtype":"piercing","d":"range 150/600 ft"}],"bonus":[{"n":"Shape-Shift","d":"The werewolf shape-shifts into a Large wolf-humanoid hybrid or a Medium wolf, or it returns to its true humanoid form. Its game statistics, other than its size, are the same in each form. Any equipment it is wearing or carrying isn't transformed."}]},{"name":"Winter Wolf","cr":"3","cat":"monst","ac":13,"hp":75,"hpF":"10d10+20","spd":"50 ft.","mods":{"str":4,"dex":1,"con":2,"int":-2,"wis":1,"cha":-1},"immune":["cold"],"traits":[{"n":"Pack Tactics","d":"The wolf has Advantage on an attack roll against a creature if at least one of the wolf's allies is within 5 feet of the creature and the ally doesn't have the Incapacitated condition."}],"actions":[{"n":"Bite","kind":"atk","hit":6,"dmg":"2d6+4","dtype":"piercing","d":"reach 5 ft. If the target is a Large or smaller creature, it has the Prone condition."},{"n":"Cold Breath","kind":"save","save":{"ability":"CON","dc":12},"rech":5,"d":"Constitution Saving Throw: DC 12, each creature in a 15-foot Cone. Failure: 18 (4d8) Cold damage. Success: Half damage."}]},{"name":"Awakened Shrub","cr":"0","cat":"crawl","ac":9,"hp":10,"hpF":"3d6","spd":"20 ft.","mods":{"str":-4,"dex":-1,"con":0,"int":0,"wis":0,"cha":-2},"resist":["piercing"],"vuln":["fire"],"actions":[{"n":"Rake","kind":"atk","hit":1,"dmg":"1","dtype":"slashing","d":"reach 5 ft."}]},{"name":"Awakened Tree","cr":"2","cat":"crawl","ac":13,"hp":59,"hpF":"7d12+14","spd":"20 ft.","mods":{"str":4,"dex":-2,"con":2,"int":0,"wis":0,"cha":-2},"resist":["bludgeoning","piercing"],"vuln":["fire"],"actions":[{"n":"Slam","kind":"atk","hit":6,"dmg":"3d6+4","dtype":"bludgeoning","d":"reach 10 ft"}]},{"name":"Blink Dog","cr":"1/4","cat":"crawl","ac":13,"hp":22,"hpF":"4d8+4","spd":"40 ft.","mods":{"str":1,"dex":3,"con":1,"int":0,"wis":1,"cha":0},"actions":[{"n":"Bite","kind":"atk","hit":5,"dmg":"1d4+3","dtype":"piercing","d":"reach 5 ft"}],"bonus":[{"n":"Teleport (Recharge 4-6)","d":"The dog teleports up to 40 feet to an unoccupied space it can see."}]},{"name":"Centaur Trooper","cr":"2","cat":"crawl","ac":16,"hp":45,"hpF":"6d10+12","spd":"50 ft.","mods":{"str":4,"dex":2,"con":2,"int":-1,"wis":1,"cha":0},"multi":"The centaur makes two attacks, using Pike or Longbow in any combination.","actions":[{"n":"Pike","kind":"atk","hit":6,"dmg":"1d10+4","dtype":"piercing","d":"reach 10 ft"},{"n":"Longbow","kind":"atk","hit":4,"dmg":"1d8+2","dtype":"piercing","d":"range 150/600 ft"}],"bonus":[{"n":"Trampling Charge (Recharge 5-6)","d":"The centaur moves up to its Speed without provoking Opportunity Attacks and can move through the spaces of Medium or smaller creatures. Each creature whose space the centaur enters is targeted once by the following effect. Strength Saving Throw: DC 14. Failure: 7 (1d6 + 4) Bludgeoning damage, and the target has the Prone condition."}]},{"name":"Dryad","cr":"1","cat":"crawl","ac":16,"hp":22,"hpF":"5d8","spd":"30 ft.","mods":{"str":0,"dex":1,"con":0,"int":2,"wis":2,"cha":4},"traits":[{"n":"Magic Resistance","d":"The dryad has Advantage on saving throws against spells and other magical effects."},{"n":"Speak with Beasts and Plants","d":"The dryad can communicate with Beasts and Plants as if they shared a language. 282 System Reference Document 5.2.1"}],"multi":"The dryad makes one Vine Lash or Thorn Burst attack, and it can use Spellcasting to cast Charm Monster.","actions":[{"n":"Vine Lash","kind":"atk","hit":6,"dmg":"1d8+4","dtype":"slashing","d":"reach 10 ft"},{"n":"Thorn Burst","kind":"atk","hit":6,"dmg":"1d6+4","dtype":"piercing","d":"range 60 ft"},{"n":"Spellcasting","kind":"text","d":"The dryad casts one of the following spells, requiring no Material components and using Charisma as the spellcasting ability (spell save DC 14): At Will: Animal Friendship, Charm Monster (lasts 24 hours; ends early if the dryad casts the spell again), Druidcraft 1/Day Each: Entangle, Pass without Trace"}],"bonus":[{"n":"Tree Stride","d":"If within 5 feet of a Large or bigger tree, the dryad teleports to an unoccupied space within 5 feet of a second Large or bigger tree that is within 60 feet of the previous tree."}]},{"name":"Green Hag","cr":"3","cat":"crawl","ac":17,"hp":82,"hpF":"11d8+33","spd":"30 ft., Swim 30 ft.","mods":{"str":4,"dex":1,"con":3,"int":1,"wis":2,"cha":2},"traits":[{"n":"Amphibious","d":"The hag can breathe air and water."},{"n":"Coven Magic","d":"While within 30 feet of at least two hag allies, the hag can cast one of the following spells, requiring no Material components, using the spell's normal casting time, and using Intelligence as the spellcasting ability (spell save DC 11): Augury, Find Familiar, Identify, Locate Object, Scrying, or Unseen Servant. The hag must finish a Long Rest before using this trait to cast that spell again."},{"n":"Mimicry","d":"The hag can mimic animal sounds and humanoid voices. A creature that hears the sounds can tell they are imitations only with a successful DC 14 Wisdom (Insight) check."}],"multi":"The hag makes two Claw attacks.","actions":[{"n":"Claw","kind":"atk","hit":6,"dmg":"1d8+4","dtype":"slashing","extra":"1d6","extraType":"poison","d":"reach 5 ft"},{"n":"Spellcasting","kind":"text","d":"The hag casts one of the following spells, requiring no Material components and using Wisdom 295 System Reference Document 5.2.1 as the spellcasting ability (spell save DC 12, +4 to hit with spell attacks): At Will: Dancing Lights, Disguise Self (24-hour duration), Invisibility (self only, and the hag leaves no tracks while Invisible), Minor Illusion, Ray of Sickness (level 3 version)"}]},{"name":"Satyr","cr":"1/2","cat":"crawl","ac":13,"hp":31,"hpF":"7d8","spd":"40 ft.","mods":{"str":1,"dex":3,"con":0,"int":1,"wis":0,"cha":2},"traits":[{"n":"Magic Resistance","d":"The satyr has Advantage on saving throws against spells and other magical effects."}],"actions":[{"n":"Hooves","kind":"atk","hit":5,"dmg":"1d4+3","dtype":"bludgeoning","d":"reach 5 ft. If the target is a Medium or smaller creature, the satyr pushes the target up to 10 feet straight away from itself."},{"n":"Mockery","kind":"save","save":{"ability":"WIS","dc":12},"d":"Wisdom Saving Throw: DC 12, one creature the satyr can see within 90 feet. Failure: 5 (1d6 + 2) Psychic damage."}]},{"name":"Sea Hag","cr":"2","cat":"crawl","ac":14,"hp":52,"hpF":"7d8+21","spd":"30 ft., Swim 40 ft.","mods":{"str":3,"dex":1,"con":3,"int":1,"wis":1,"cha":1},"traits":[{"n":"Amphibious","d":"The hag can breathe air and water. 322 System Reference Document 5.2.1"},{"n":"Coven Magic","d":"While within 30 feet of at least two hag allies, the hag can cast one of the following spells, requiring no Material components, using the spell's normal casting time, and using Intelligence as the spellcasting ability (spell save DC 11): Augury, Find Familiar, Identify, Locate Object, Scrying, or Unseen Servant. The hag must finish a Long Rest before using this trait to cast that spell again."},{"n":"Vile Appearance","d":"Wisdom Saving Throw: DC 11, any Beast or Humanoid that starts its turn within 30 feet of the hag and can see the hag's true form. Failure: The target has the Frightened condition until the start of its next turn. Success: The target is immune to this hag's Vile Appearance for 24 hours."}],"actions":[{"n":"Claw","kind":"atk","hit":5,"dmg":"2d6+3","dtype":"slashing","d":"reach 5 ft"},{"n":"Death Glare","kind":"save","save":{"ability":"WIS","dc":11},"rech":5,"d":"Wisdom Saving Throw: DC 11, one Frightened creature the hag can see within 30 feet. Failure: If the target has 20 Hit Points or fewer, it drops to 0 Hit Points. Otherwise, the target takes 13 (3d8) Psychic damage."},{"n":"Illusory Appearance","kind":"text","d":"The hag casts Disguise Self, using Constitution as the spellcasting ability (spell save DC 13). The spell's duration is 24 hours."}]},{"name":"Shambling Mound","cr":"5","cat":"crawl","ac":15,"hp":110,"hpF":"13d10+39","spd":"30 ft., Swim 20 ft.","mods":{"str":4,"dex":-1,"con":3,"int":-3,"wis":0,"cha":-3},"resist":["cold","fire"],"immune":["lightning"],"condImmune":["Deafened","Exhaustion"],"traits":[{"n":"Lightning Absorption","d":"Whenever the shambling mound is subjected to Lightning damage, it regains a number of Hit Points equal to the Lightning damage dealt."}],"multi":"The shambling mound makes three Charged Tendril attacks. It can replace one attack with a use of Engulf.","actions":[{"n":"Charged Tendril","kind":"atk","hit":7,"dmg":"1d6+4","dtype":"bludgeoning","extra":"2d4","extraType":"lightning","d":"reach 10 ft. If the target is a Medium or smaller creature, the shambling mound pulls the target 5 feet straight toward itself."},{"n":"Engulf","kind":"save","save":{"ability":"STR","dc":15},"d":"Strength Saving Throw: DC 15, one Medium or smaller creature within 5 feet. Failure: The target is pulled into the shambling mound's space and has the Grappled condition (escape DC 14). Until the grapple ends, the target has the Blinded and Restrained conditions, and it takes 10 (3d6) Lightning damage at the start of each of its turns. When the shambling mound moves, the Grappled target moves with it, costing it no extra movement. The shambling mound can have only one creature Grappled by this action at a time. 323 System Reference Document 5.2.1"}]},{"name":"Shrieker Fungus","cr":"0","cat":"crawl","ac":5,"hp":13,"hpF":"3d8","spd":"5 ft.","mods":{"str":-5,"dex":-5,"con":0,"int":-5,"wis":-4,"cha":-5},"condImmune":["Blinded","Charmed","Deafened","Frightened"],"actions":[],"reactions":[{"n":"Shriek","d":"Trigger: A creature or a source of Bright Light moves within 30 feet of the shrieker. Response: The shrieker emits a shriek audible within 300 feet of itself for 1 minute or until the shrieker dies."}]},{"name":"Sprite","cr":"1/4","cat":"crawl","ac":15,"hp":10,"hpF":"4d4","spd":"10 ft., Fly 40 ft.","mods":{"str":-4,"dex":4,"con":0,"int":2,"wis":1,"cha":0},"actions":[{"n":"Needle Sword","kind":"atk","hit":6,"dmg":"1d4+4","dtype":"piercing","d":"reach 5 ft"},{"n":"Enchanting Bow","kind":"atk","hit":6,"dmg":"1","dtype":"piercing","d":"range 40/160 ft. and the target has the Charmed condition until the start of the sprite's next turn."},{"n":"Heart Sight","kind":"save","save":{"ability":"CHA","dc":10},"d":"Charisma Saving Throw: DC 10, one creature within 5 feet the sprite can see (Celestials, Fiends, and Undead automatically fail the save). Failure: The sprite knows the target's emotions and alignment."},{"n":"Invisibility","kind":"text","d":"The sprite casts Invisibility on itself, requiring no spell components and using Charisma as the spellcasting ability."}]},{"name":"Swarm of Bats","cr":"1/4","cat":"crawl","ac":12,"hp":11,"hpF":"2d10","spd":"5 ft., Fly 30 ft.","mods":{"str":-3,"dex":2,"con":0,"int":-4,"wis":1,"cha":-3},"resist":["bludgeoning","piercing","slashing"],"condImmune":["Charmed","Frightened","Grappled","Paralyzed","Petrified","Prone","Restrained","Stunned"],"traits":[{"n":"Swarm","d":"The swarm can occupy another creature's space and vice versa, and the swarm can move through any opening large enough for a Tiny bat. The swarm can't regain Hit Points or gain Temporary Hit Points."}],"actions":[{"n":"Bites","kind":"atk","hit":4,"dmg":"2d4","dtype":"piercing","d":"reach 5 ft. or 2 (1d4) Piercing damage if the swarm is Bloodied."}]},{"name":"Swarm of Crawling Claws","cr":"3","cat":"crawl","ac":12,"hp":49,"hpF":"11d8","spd":"30 ft., Climb 30 ft.","mods":{"str":2,"dex":2,"con":0,"int":-3,"wis":0,"cha":-3},"resist":["bludgeoning","piercing","slashing"],"immune":["necrotic","poison"],"condImmune":["Charmed","Exhaustion","Frightened","Grappled","Incapacitated","Paralyzed","Petrified","Poisoned","Prone","Restrained","Stunned"],"traits":[{"n":"Swarm","d":"The swarm can occupy another creature's space and vice versa, and the swarm can move through any opening large enough for a Tiny creature. The swarm can't regain Hit Points or gain Temporary Hit Points."}],"actions":[{"n":"Swarm of Grasping Hands","kind":"atk","hit":4,"dmg":"4d8+2","dtype":"necrotic","d":"reach 5 ft. or 11 (2d8 + 2) Necrotic damage if the swarm is Bloodied. If the target is a Medium or smaller creature, it has the Prone condition."}]},{"name":"Swarm of Insects","cr":"1/2","cat":"crawl","ac":11,"hp":19,"hpF":"3d8+6","spd":"20 ft., Climb or Fly 20 ft. (GM's choice)","mods":{"str":-4,"dex":1,"con":2,"int":-5,"wis":-2,"cha":-5},"resist":["bludgeoning","piercing","slashing"],"condImmune":["Charmed","Frightened","Grappled","Paralyzed","Petrified","Prone","Restrained","Stunned"],"traits":[{"n":"Spider Climb","d":"If the swarm has a Climb Speed, the swarm can climb difficult surfaces, including along ceilings, without needing to make an ability check."},{"n":"Swarm","d":"The swarm can occupy another creature's space and vice versa, and the swarm can move through any opening large enough for a Tiny insect. The swarm can't regain Hit Points or gain Temporary Hit Points."}],"actions":[{"n":"Bites","kind":"atk","hit":3,"dmg":"2d4+1","dtype":"poison","d":"reach 5 ft. or 3 (1d4 + 1) Poison damage if the swarm is Bloodied."}]},{"name":"Swarm of Piranhas","cr":"1","cat":"crawl","ac":13,"hp":28,"hpF":"8d8-8","spd":"5 ft., Swim 40 ft.","mods":{"str":1,"dex":3,"con":-1,"int":-5,"wis":-2,"cha":-4},"resist":["bludgeoning","piercing","slashing"],"condImmune":["Charmed","Frightened","Grappled","Paralyzed","Petrified","Prone","Restrained","Stunned"],"traits":[{"n":"Swarm","d":"The swarm can occupy another creature's space and vice versa, and the swarm can move through any opening large enough for a Tiny piranha. The swarm can't regain Hit Points or gain Temporary Hit Points."},{"n":"Water Breathing","d":"The swarm can breathe only underwater."}],"actions":[{"n":"Bites","kind":"atk","hit":5,"dmg":"2d4+3","dtype":"piercing","d":"(with Advantage if the target doesn't have all its Hit Points) reach 5 ft. or 5 (1d4 + 3) Piercing damage if the swarm is Bloodied."}]},{"name":"Swarm of Rats","cr":"1/4","cat":"crawl","ac":10,"hp":14,"hpF":"4d8-4","spd":"30 ft., Climb 30 ft.","mods":{"str":-1,"dex":0,"con":-1,"int":-4,"wis":0,"cha":-4},"saves":{"dex":2},"resist":["bludgeoning","piercing","slashing"],"condImmune":["Charmed","Frightened","Grappled","Paralyzed","Petrified","Prone","Restrained","Stunned"],"traits":[{"n":"Swarm","d":"The swarm can occupy another creature's space and vice versa, and the swarm can move through any opening large enough for a Tiny rat. The swarm can't regain Hit Points or gain Temporary Hit Points. 362 System Reference Document 5.2.1"}],"actions":[{"n":"Bites","kind":"atk","hit":2,"dmg":"2d4","dtype":"piercing","d":"reach 5 ft. or 2 (1d4) Piercing damage if the swarm is Bloodied."}]},{"name":"Swarm of Ravens","cr":"1/4","cat":"crawl","ac":12,"hp":11,"hpF":"2d8+2","spd":"10 ft., Fly 50 ft.","mods":{"str":-2,"dex":2,"con":1,"int":-3,"wis":1,"cha":-2},"resist":["bludgeoning","piercing","slashing"],"condImmune":["Charmed","Frightened","Grappled","Paralyzed","Petrified","Prone","Restrained","Stunned"],"traits":[{"n":"Swarm","d":"The swarm can occupy another creature's space and vice versa, and the swarm can move through any opening large enough for a Tiny raven. The swarm can't regain Hit Points or gain Temporary Hit Points."}],"actions":[{"n":"Beaks","kind":"atk","hit":4,"dmg":"1d6+2","dtype":"piercing","d":"reach 5 ft. or 2 (1d4) Piercing damage if the swarm is Bloodied."},{"n":"Cacophony","kind":"save","save":{"ability":"WIS","dc":10},"rech":6,"d":"Wisdom Saving Throw: DC 10, one creature in the swarm's space. Failure: The target has the Deafened condition until the start of the swarm's next turn. While Deafened, the target also has Disadvantage on ability checks and attack rolls."}]},{"name":"Swarm of Venomous Snakes","cr":"2","cat":"crawl","ac":14,"hp":36,"hpF":"8d8","spd":"30 ft., Swim 30 ft.","mods":{"str":-1,"dex":4,"con":0,"int":-5,"wis":0,"cha":-4},"resist":["bludgeoning","piercing","slashing"],"condImmune":["Charmed","Frightened","Grappled","Paralyzed","Petrified","Prone","Restrained","Stunned"],"traits":[{"n":"Swarm","d":"The swarm can occupy another creature's space and vice versa, and the swarm can move through any opening large enough for a Tiny snake. The swarm can't regain Hit Points or gain Temporary Hit Points."}],"actions":[{"n":"Bites","kind":"atk","hit":6,"dmg":"1d8+4","dtype":"piercing","d":"reach 5 ft. -or 6 (1d4 + 4) Piercing damage if the swarm is Bloodied-plus 10 (3d6) Poison damage."}]},{"name":"Treant","cr":"9","cat":"crawl","ac":16,"hp":138,"hpF":"12d12+60","spd":"30 ft.","mods":{"str":6,"dex":-1,"con":5,"int":1,"wis":3,"cha":1},"resist":["bludgeoning","piercing"],"vuln":["fire"],"traits":[{"n":"Siege Monster","d":"The treant deals double damage to objects and structures."}],"multi":"The treant makes two Slam attacks.","actions":[{"n":"Slam","kind":"atk","hit":10,"dmg":"3d6+6","dtype":"bludgeoning","d":"reach 5 ft"},{"n":"Hail of Bark","kind":"atk","hit":10,"dmg":"4d10+6","dtype":"piercing","d":"range 180 ft"},{"n":"Animate Trees (1/Day)","kind":"text","d":"The treant magically animates up to two trees it can see within 60 feet of itself. Each tree uses the Treant stat block, except it has Intelligence and Charisma scores of 1, it can't speak, and it lacks this action. The tree takes its turn immediately after the treant on the same Initiative count, and it obeys the treant. A tree remains animate for 1 day or until it dies, the treant dies, or it is more than 120 feet from the treant. The tree then takes root if possible."}]},{"name":"Violet Fungus","cr":"1/4","cat":"crawl","ac":5,"hp":18,"hpF":"4d8","spd":"5 ft.","mods":{"str":-4,"dex":-5,"con":0,"int":-5,"wis":-4,"cha":-5},"condImmune":["Blinded","Charmed","Deafened","Frightened"],"multi":"The fungus makes two Rotting Touch attacks.","actions":[{"n":"Rotting Touch","kind":"atk","hit":2,"dmg":"1d8","dtype":"necrotic","d":"reach 10 ft"}]},{"name":"Worg","cr":"1/2","cat":"crawl","ac":13,"hp":26,"hpF":"4d10+4","spd":"50 ft.","mods":{"str":3,"dex":1,"con":1,"int":-2,"wis":0,"cha":-1},"actions":[{"n":"Bite","kind":"atk","hit":5,"dmg":"1d8+3","dtype":"piercing","d":"reach 5 ft. and the next attack roll made against the target before the start of the worg's next turn has Advantage."}]}];
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
const SPELL_REF = {"acid arrow":{"n":"Acid Arrow","m":"Level 2 Evocation (Wizard)","ct":"Action","rg":"90 feet","cp":"V, S, M (powdered rhubarb leaf)","du":"Instantaneous","d":"A shimmering green arrow streaks toward a target within range and bursts in a spray of acid. Make a ranged spell attack against the target. On a hit, the target takes 4d4 Acid damage and 2d4 Acid damage at the end of its next turn. On a miss, the arrow splashes the target with acid for half as much of the initial damage only. Using a Higher-Level Spell Slot. The damage (both initial and later) increases by 1d4 for each spell slot level above 2."},"acid splash":{"n":"Acid Splash","m":"Evocation Cantrip (Sorcerer, Wizard)","ct":"Action","rg":"60 feet","cp":"V, S","du":"Instantaneous","d":"You create an acidic bubble at a point within range, where it explodes in a 5-foot-radius Sphere. Each creature in that Sphere must succeed on a Dexterity Cantrip Upgrade. saving throw or take 1d6 Acid damage. The damage increases by 1d6 when you reach levels 5 (2d6), 11 (3d6), and 17 (4d6)."},"aid":{"n":"Aid","m":"Level 2 Abjuration (Bard, Cleric, Druid, Paladin, Ranger)","ct":"Action","rg":"30 feet","cp":"V, S, M (a strip of white cloth)","du":"8 hours","d":"Choose up to three creatures within range. Each target’s Hit Point maximum and current Hit Points increase by 5 for the duration. Using a Higher-Level Spell Slot. Each target’s Hit Points increase by 5 for each spell slot level above 2."},"alarm":{"n":"Alarm","m":"Level 1 Abjuration (Ranger, Wizard)","ct":"1 minute or Ritual","rg":"30 feet","cp":"V, S, M (a bell and silver wire)","du":"8 hours","d":"Points increase by 5 for each spell slot level above 2. You set an alarm against intrusion. Choose a door, a window, or an area within range that is no larger than a 20-foot Cube. Until the spell ends, an alarm alerts you whenever a creature touches or enters the warded area. When you cast the spell, you can designate creatures that won’t set off the alarm. You Audible Alarm. also choose whether the alarm is audible or mental: The alarm produces the sound of a handbell for 10 seconds within 60 feet of the Mental Alarm. warded area. You are alerted by a mental ping if you are within 1 mile of the warded area. This ping awakens you if you’re asleep."},"alter self":{"n":"Alter Self","m":"Level 2 Transmutation (Sorcerer, Wizard)","ct":"Action","rg":"Self","cp":"V, S","du":"Concentration, up to 1 hour","d":"You alter your physical form. Choose one of the following options. Its effects last for the duration, during which you can take a Magic action to replace the option you chose with a different one. Aquatic Adaptation. You sprout gills and grow webs between your fingers. You can breathe underwater and gain a Swim Speed equal to your Speed. Change Appearance. You alter your appearance. You decide what you look like, including your height, weight, facial features, sound of your voice, hair length, coloration, and other distinguishing characteristics. You can make yourself appear as a member of another species, though none of your statistics change. You can’t appear as a creature of a different size, and your basic shape stays the same; if you’re bipedal, you can’t use this spell to become quadrupedal, for instance. For the duration, you can take a Magic action to change your appearance in this way again. Natural Weapons. You grow claws (Slashing), fangs (Piercing), horns (Piercing), or hooves (Bludgeoning). When you use your Unarmed Strike to deal damage with that new growth, it deals 1d6 damage of the type in parentheses instead of dealing the normal damage for your Unarmed Strike, and you use your spellcasting ability modifier for the attack and damage rolls rather than using Strength."},"animal friendship":{"n":"Animal Friendship","m":"Level 1 Enchantment (Bard, Druid, Ranger)","ct":"Action 30 feet","rg":"","cp":"V, S, M (a morsel of food)","du":"24 hours","d":"Strength. Target a Beast that you can see within range. The target must succeed on a Wisdom saving throw or have the Charmed condition for the duration. If you or one of your allies deals damage to the target, the spells ends. Using a Higher-Level Spell Slot. You can target one additional Beast for each spell slot level above 1."},"animal messenger":{"n":"Animal Messenger","m":"Level 2 Enchantment (Bard, Druid, Ranger)","ct":"Action or Ritual","rg":"30 feet","cp":"V, S, M (a morsel of food)","du":"24 hours","d":"A Tiny Beast of your choice that you can see within range must succeed on a Charisma saving throw, or it attempts to deliver a message for you (if the target’s Challenge Rating isn’t 0, it automatically succeeds). You specify a location you have visited and a recipient who matches a general description, such as “a person dressed in the uniform of the town guard” or “a red-haired dwarf wearing a pointed hat.” You also communicate a message of up to twenty-five words. The Beast travels for the duration toward the specified location, covering about 25 miles per 24 hours or 50 miles if the Beast can fly. When the Beast arrives, it delivers your message to the creature that you described, mimicking your communication. If the Beast doesn’t reach its destination before the spell ends, the message is lost, and the Beast returns to where you cast the spell. Using a Higher-Level Spell Slot. The spell’s duration increases by 48 hours for each spell slot level above 2."},"animal shapes":{"n":"Animal Shapes","m":"Level 8 Transmutation (Druid)","ct":"Action","rg":"30 feet","cp":"V, S","du":"24 hours","d":"Choose any number of willing creatures that you can see within range. Each target shape-shifts into a Large or smaller Beast of your choice that has a Challenge Rating of 4 or lower. You can choose a different form for each target. On later turns, you can take a Magic action to transform the targets again. A target’s game statistics are replaced by the chosen Beast’s statistics, but the target retains its creature type; Hit Points; Hit Point Dice; alignment; ability to communicate; and Intelligence, Wisdom, and Charisma scores. The target’s actions are limited by the Beast form’s anatomy, and it can’t cast spells. The target’s equipment melds into the new form, and the target can’t use any of that equipment while in that form. The target gains a number of Temporary Hit Points equal to the Hit Points of the first form into which it shape-shifts. These Temporary Hit Points vanish if any remain when the spell ends. The transformation lasts for the duration or until the target ends it as a Bonus Action."},"animate dead":{"n":"Animate Dead","m":"Level 3 Necromancy (Cleric, Wizard)","ct":"1 minute","rg":"10 feet","cp":"V, S, M (a drop of blood, a piece of flesh, and a pinch of bone dust)","du":"Instantaneous","d":"Choose a pile of bones or a corpse of a Medium or Skeleton Small Humanoid within range. The target becomes Zombie an Undead creature: a if you chose bones or a if you chose a corpse (see “Monsters” for the stat blocks). On each of your turns, you can take a Bonus Action to mentally command any creature you made with this spell if the creature is within 60 feet of you (if you control multiple creatures, you can command any of them at the same time, issuing the same command to each one). You decide what action the creature will take and where it will move on its next turn, or you can issue a general command, such as to guard a chamber or corridor. If you issue no commands, the creature takes the Dodge action and moves only to avoid harm. Once given an order, the creature continues to follow it until its task is complete. The creature is under your control for 24 hours, after which it stops obeying any command you’ve given it. To maintain control of the creature for another 24 hours, you must cast this spell on the creature again before the current 24-hour period ends. This use of the spell reasserts your control over up to four creatures you have animated with this spell Using a Higher-Level Spell Slot. rather than animating a new creature. You animate or reassert control over two additional Undead creatures for each spell slot level above 3. Each of the creatures must come from a different corpse or pile of bones."},"animate objects":{"n":"Animate Objects","m":"Level 5 Transmutation (Bard, Sorcerer, Wizard)","ct":"Action","rg":"120 feet","cp":"V, S","du":"Concentration, up to 1 minute Slam. Melee Attack Roll: Bonus equals your spell attack modifier, reach 5 ft. Hit: Force damage equal to 1d4 + 3 (Medium or smaller), 2d6 + 3 + your spellcasting ability modifier (Large), or 2d12 + 3 + your spellcasting ability modifier (Huge).","d":"Objects animate at your command. Choose a number of nonmagical objects within range that aren’t being worn or carried, aren’t fixed to a surface, and aren’t Gargantuan. The maximum number of objects is equal to your spellcasting ability modifier; for this number, a Medium or smaller target counts as one object, a Large target counts as two, and a Huge target counts as three. Each target animates, sprouts legs, and becomes a Construct that uses the Animated Object stat block; this creature is under your control until the spell ends or until it is reduced to 0 Hit Points. Each creature you make with this spell is an ally to you and your allies. In combat, it shares your Initiative count and takes its turn immediately after yours. Until the spell ends, you can take a Bonus Action to mentally command any creature you made with this spell if the creature is within 500 feet of you (if you control multiple creatures, you can command any of them at the same time, issuing the same command to each one). If you issue no commands, the creature takes the Dodge action and moves only to avoid harm. When the creature drops to 0 Hit Points, it reverts to its object form, and any remaining damage carries over to that form. Using a Higher-Level Spell Slot. The creature’s Slam damage increases by 1d4 (Medium or smaller), 1d6 (Large), or 1d12 (Huge) for each spell slot level above 5. Animated Object Huge or Smaller Construct, Unaligned AC 15 HP 10 (Medium or smaller), 20 (Large), 40 (Huge) Speed 30 ft. MOD SAVE MOD SAVE Str 16 +3 +3 Int 3 −4 −4 Dex 10 +0 +0 Wis 3 −4 −4 Con 10 +0 +0 Cha 1 −5 −5 Actions Slam. Melee Attack Roll: Bonus equals your spell attack modifier, reach 5 ft. Hit: Force damage equal to 1d4 + 3 (Medium or smaller), 2d6 + 3 + your spellcasting ability modifier (Large), or 2d12 + 3 + your spellcasting ability modifier (Huge)."},"antilife shell":{"n":"Antilife Shell","m":"Level 5 Abjuration (Druid)","ct":"Action","rg":"Self","cp":"V, S","du":"Concentration, up to 1 hour","d":"An aura extends from you in a 10-foot Emanation for the duration. The aura prevents creatures other than Constructs and Undead from passing or reaching through it. An affected creature can cast spells or make attacks with Ranged or Reach weapons through the barrier. If you move so that an affected creature is forced to pass through the barrier, the spell ends."},"antimagic field":{"n":"Antimagic Field","m":"Level 8 Abjuration (Cleric, Wizard) Dispel Magic Antimagic Field","ct":"Action","rg":"Self","cp":"V, S, M (iron filings)","du":"Concentration, up to 1 hour","d":"An aura of antimagic surrounds you in 10-foot Emanation. No one can cast spells, take Magic actions, or create other magical effects inside the aura, and those things can’t target or otherwise affect anything inside it. Magical properties of magic items don’t work inside the aura or on anything inside it. Areas of effect created by spells or other magic can’t extend into the aura, and no one can teleport into or out of it or use planar travel there. Portals close temporarily while in the aura. Ongoing spells, except those cast by an Artifact or a deity, are suppressed in the area. While an effect is suppressed, it doesn’t function, but the time it spends suppressed counts against its duration. has no effect on the aura, and the auras created by different spells don’t nullify each other."},"antipathy/sympathy":{"n":"Antipathy/Sympathy","m":"Level 8 Enchantment (Bard, Druid, Wizard)","ct":"1 hour","rg":"60 feet","cp":"V, S, M (a mix of vinegar and honey)","du":"10 days","d":"As you cast the spell, choose whether it creates antipathy or sympathy, and target one creature or object that is Huge or smaller. Then specify a kind of creature, such as red dragons, goblins, or vampires. A creature of the chosen kind makes a Wisdom saving throw when it comes within 120 feet of the target. Your choice of antipathy or sympathy determines what happens to a creature when it fails that Antipathy. save: The creature has the Frightened condition. The Frightened creature must use its movement on its turns to get as far away as possible from the target, moving by the safest route. Sympathy. The creature has the Charmed condition. The Charmed creature must use its movement on its turns to get as close as possible to the target, moving by the safest route. If the creature is within 5 feet of the target, the creature can’t willingly move away. If the target damages the Charmed creature, that creature can make a Wisdom saving throw to end the effect, as described below. Ending the Effect. If the Frightened or Charmed creature ends its turn more than 120 feet away from the target, the creature makes a Wisdom saving throw. On a successful save, the creature is no longer affected by the target. A creature that successfully saves against this effect is immune to it for 1 minute, after which it can be affected again."},"arcane eye":{"n":"Arcane Eye","m":"Level 4 Divination (Wizard)","ct":"Action","rg":"30 feet","cp":"V, S, M (a bit of bat fur)","du":"Concentration, up to 1 hour","d":"You create an Invisible, invulnerable eye within range that hovers for the duration. You mentally receive visual information from the eye, which can see in every direction. It also has Darkvision with a range of 30 feet. As a Bonus Action, you can move the eye up to 30 feet in any direction. A solid barrier blocks the eye’s movement, but the eye can pass through an opening as small as 1 inch in diameter."},"arcane hand":{"n":"Arcane Hand","m":"Level 5 Evocation (Sorcerer, Wizard)","ct":"Action 120 feet","rg":"","cp":"V, S, M (an eggshell and a glove)","du":"Concentration, up to 1 minute","d":"You create a Large hand of shimmering magical energy in an unoccupied space that you can see within range. The hand lasts for the duration, and it moves at your command, mimicking the movements of your own hand. The hand is an object that has AC 20 and Hit Points equal to your Hit Point maximum. If it drops to 0 Hit Points, the spell ends. The hand doesn’t occupy its space. When you cast the spell and as a Bonus Action on your later turns, you can move the hand up to 60 Clenched Fist. feet and then cause one of the following effects: The hand strikes a target within 5 feet of it. Make a melee spell attack. On a hit, the Forceful Hand. target takes 5d8 Force damage. The hand attempts to push a Huge or smaller creature within 5 feet of it. The target must succeed on a Strength saving throw, or the hand pushes the target up to 5 feet plus a number of feet equal to five times your spellcasting ability modifier. The hand moves with the target, remaining within 5 feet of it. Grasping Hand. The hand attempts to grapple a Huge or smaller creature within 5 feet of it. The target must succeed on a Dexterity saving throw, or the target has the Grappled condition, with an escape DC equal to your spell save DC. While the hand grapples the target, you can take a Bonus Action to cause the hand to crush it, dealing Bludgeoning damage to the target equal to 4d6 plus Interposing Hand. your spellcasting ability modifier. The hand grants you Half Cover against attacks and other effects that originate from its space or that pass through it. In addition, its space counts as Difficult Terrain for your enemies. Using a Higher-Level Spell Slot. The damage of the Clenched Fist increases by 2d8 and the damage of the Grasping Hand increases by 2d6 for each spell slot level above 5."},"arcane lock":{"n":"Arcane Lock","m":"Level 2 Abjuration (Wizard)","ct":"Action","rg":"Touch","cp":"V, S, M (gold dust worth 25+ GP, which the spell consumes)","du":"Until dispelled","d":"You touch a closed door, window, gate, container, or hatch and magically lock it for the duration. This lock can’t be unlocked by any nonmagical means. You and any creatures you designate when you cast the spell can open and close the object despite the lock. You can also set a password that, when spoken within 5 feet of the object, unlocks it for 1 minute."},"arcane sword":{"n":"Arcane Sword","m":"Level 7 Evocation (Bard, Wizard)","ct":"Action","rg":"90 feet","cp":"V, S, M (a miniature sword worth 250+ GP)","du":"Concentration, up to 1 minute","d":"You create a spectral sword that hovers within range. It lasts for the duration. When the sword appears, you make a melee spell attack against a target within 5 feet of the sword. On a hit, the target takes Force damage equal to 4d12 plus your spellcasting ability modifier. On your later turns, you can take a Bonus Action to move the sword up to 30 feet to a spot you can see and repeat the attack against the same target or a different one."},"arcanist’s magic aura":{"n":"Arcanist’s Magic Aura","m":"Level 2 Illusion (Wizard) Detect Magic","ct":"Action Touch","rg":"","cp":"V, S, M (a small square of silk)","du":"24 hours","d":"With a touch, you place an illusion on a willing creature or an object that isn’t being worn or carried. A creature gains the Mask effect below, and an object gains the False Aura effect below. The effect lasts for the duration. If you cast the spell on the same target every day for 30 days, the illusion lasts until Mask (Creature). dispelled. Choose a creature type other than the target’s actual type. Spells and other magical effects treat the target as if it were a creature of False Aura (Object). the chosen type. You change the way the target appears to spells and magical effects that detect magical auras, such as . You can make a nonmagical object appear magical, make a magic item appear nonmagical, or change the object’s aura so that it appears to belong to a school of magic you choose."},"astral projection":{"n":"Astral Projection","m":"Level 9 Necromancy (Cleric, Warlock, Wizard)","ct":"1 hour","rg":"10 feet","cp":"V, S, M (for each of the spell’s targets, one jacinth worth 1,000+ GP and one silver bar worth 100+ GP, all of which the spell consumes)","du":"Until dispelled","d":"You and up to eight willing creatures within range project your astral bodies into the Astral Plane (the spell ends instantly if you are already on that plane). Each target’s body is left behind in a state of suspended animation; it has the Unconscious condition, doesn’t need food or air, and doesn’t age. A target’s astral form resembles its body in almost every way, replicating its game statistics and possessions. The principal difference is the addition of a silvery cord that trails from between the shoulder blades of the astral form. The cord fades from view after 1 foot. If the cord is cut—which happens only when an effect states that it does so—the target’s body and astral form both die. A target’s astral form can travel through the Astral Plane. The moment an astral form leaves that plane, the target’s body and possessions travel along the silver cord, causing the target to re-enter its body on the new plane. Any damage or other effects that apply to an astral form have no effect on the target’s body and vice versa. If a target’s body or astral form drops to 0 Hit Points, the spell ends for that target. The spell ends for all the targets if you take a Magic action to dismiss it. When the spell ends for a target who isn’t dead, the target reappears in its body and exits the state of suspended animation."},"augury":{"n":"Augury","m":"Level 2 Divination (Cleric, Druid, Wizard)","ct":"1 minute or Ritual","rg":"Self","cp":"V, S, M (specially marked sticks, bones, cards, or other divinatory tokens worth 25+ GP)","du":"Instantaneous Weal Good Woe Bad Weal and woe Good and bad Indifference Neither good nor bad","d":"You receive an omen from an otherworldly entity about the results of a course of action that you plan to take within the next 30 minutes. The GM chooses the Omens omen from the Omens table. The spell doesn’t account for circumstances, such as other spells, that might change the results. If you cast the spell more than once before finishing a Long Rest, there is a cumulative 25 percent chance for each casting after the first that you get no answer."},"aura of life":{"n":"Aura of Life","m":"Level 4 Abjuration (Cleric, Paladin)","ct":"Action","rg":"Self V","cp":"","du":"Concentration, up to 10 minutes","d":"An aura radiates from you in a 30-foot Emanation for the duration. While in the aura, you and your allies have Resistance to Necrotic damage, and your Hit Point maximums can’t be reduced. If an ally with 0 Hit Points starts its turn in the aura, that ally re- gains 1 Hit Point."},"awaken":{"n":"Awaken","m":"Level 5 Transmutation (Bard, Druid)","ct":"8 hours","rg":"Touch","cp":"V, S, M (an agate worth 1,000+ GP, which the spell consumes)","du":"Instantaneous","d":"You spend the casting time tracing magical pathways within a precious gemstone, and then touch the target. The target must be either a Beast or Plant creature with an Intelligence of 3 or less or a natural plant that isn’t a creature. The target gains an Intelligence of 10 and the ability to speak one language you know. If the target is a natural plant, it becomes a Plant creature and gains the ability to move its limbs, roots, vines, creepers, and so forth, and it gains senses similar to a human’s. The GM Awakened chooses statistics appropriate for the awakened Shrub Awakened Tree Plant, such as the statistics for the or in “Monsters.” The awakened target has the Charmed condition for 30 days or until you or your allies deal damage to it. When that condition ends, the awakened crea- ture chooses its attitude toward you."},"bane":{"n":"Bane","m":"Level 1 Enchantment (Bard, Cleric, Warlock)","ct":"Action","rg":"30 feet","cp":"V, S, M (a drop of blood)","du":"Concentration, up to 1 minute","d":"Up to three creatures of your choice that you can see within range must each make a Charisma saving throw. Whenever a target that fails this save makes an attack roll or a saving throw before the spell ends, the target must subtract 1d4 from the attack Using a Higher-Level Spell Slot. roll or save. You can target one additional creature for each spell slot level above 1."},"banishment":{"n":"Banishment","m":"Level 4 Abjuration (Cleric, Paladin, Sorcerer, Warlock, Wizard)","ct":"Action","rg":"30 feet","cp":"V, S, M (a pentacle)","du":"Concentration, up to 1 minute","d":"One creature that you can see within range must succeed on a Charisma saving throw or be transported to a harmless demiplane for the duration. While there, the target has the Incapacitated condition. When the spell ends, the target reappears in the space it left or in the nearest unoccupied space if that space is occupied. If the target is an Aberration, a Celestial, an Elemental, a Fey, or a Fiend, the target doesn’t return if the spell lasts for 1 minute. The target is instead transported to a random location on a plane (GM’s Using a Higher-Level Spell Slot. choice) associated with its creature type. You can target one additional creature for each spell slot level above 4."},"barkskin":{"n":"Barkskin","m":"Level 2 Transmutation (Druid, Ranger)","ct":"Bonus Action","rg":"Touch Component: V, S, M (a handful of bark)","cp":"","du":"1 hour","d":"You touch a willing creature. Until the spell ends, the target’s skin assumes a bark-like appearance, and the target has an Armor Class of 17 if its AC is lower than that."},"beacon of hope":{"n":"Beacon of Hope","m":"Level 3 Abjuration (Cleric)","ct":"Action","rg":"30 feet","cp":"V, S","du":"Concentration, up to 1 minute","d":"Choose any number of creatures within range. For the duration, each target has Advantage on Wisdom saving throws and Death Saving Throws and regains the maximum number of Hit Points possible from any healing."},"befuddlement":{"n":"Befuddlement","m":"Level 8 Enchantment (Bard, Druid, Warlock, Wizard)","ct":"Action","rg":"150 feet","cp":"V, S, M (a key ring with no keys)","du":"Instantaneous","d":"You blast the mind of a creature that you can see within range. The target makes an Intelligence saving throw. On a failed save, the target takes 10d12 Psychic damage and can’t cast spells or take the Magic action. At the end of every 30 Greater days, Restoration the target repeats Heal the Wish save, ending the effect on a success. The effect can also be ended by the , , or spell. On a successful save, the target takes half as much damage only."},"bestow curse":{"n":"Bestow Curse","m":"Level 3 Necromancy (Bard, Cleric, Wizard)","ct":"Action","rg":"Touch","cp":"V, S","du":"Concentration, up to 1 minute","d":"You touch a creature, which must succeed on a Wisdom saving throw or become cursed for the duration. Until the curse ends, the target suffers one of the following effects of your choice: • Choose one ability. The target has Disadvantage on ability checks and saving throws made with that ability. • The target has Disadvantage on attack rolls against you. • In combat, the target must succeed on a Wisdom saving throw at the start of each of its turns or be forced to take the Dodge action on that turn. • If you deal damage to the target with an attack roll or a spell, the target takes an extra 1d8 Necrotic damage. Using a Higher-Level Spell Slot. If you cast this spell using a level 4 spell slot, you can maintain Concentration on it for up to 10 minutes. If you use a level 5+ spell slot, the spell doesn’t require Concentration, and the duration becomes 8 hours (level 5–6 slot) or 24 hours (level 7–8 slot). If you use a level 9 spell slot, the spell lasts until dispelled. Black Tentacles You bless up to three creatures within range. Whenever a target makes an attack roll or a saving throw before the spell ends, the target adds 1d4 to the attack roll or save. Using a Higher-Level Spell Slot. You can target one additional creature for each spell slot level above 1. Blight"},"black tentacles":{"n":"Black Tentacles","m":"Level 4 Conjuration (Wizard)","ct":"Action","rg":"90 feet","cp":"V, S, M (a tentacle)","du":"Concentration, up to 1 minute","d":"Squirming, ebony tentacles fill a 20-foot square on ground that you can see within range. For the duration, these tentacles turn the ground in that area into Difficult Terrain. Each creature in that area makes a Strength saving throw. On a failed save, it takes 3d6 Bludgeoning damage, and it has the Restrained condition until the spell ends. A creature also makes that save if it enters the area or ends it turn there. A creature makes that save only once per turn. A Restrained creature can take an action to make a Strength (Athletics) check against your spell save ends its turn there. A creature makes that save only once per turn. A Restrained creature can take an action to make a Strength (Athletics) check against your spell save DC, ending the condition on itself on a success."},"blade barrier":{"n":"Blade Barrier","m":"Level 6 Evocation (Cleric)","ct":"Action 90 feet","rg":"","cp":"V, S","du":"Concentration, up to 10 minutes","d":"DC, ending the condition on itself on a success. You create a wall of whirling blades made of magical energy. The wall appears within range and lasts for the duration. You make a straight wall up to 100 feet long, 20 feet high, and 5 feet thick, or a ringed wall up to 60 feet in diameter, 20 feet high, and 5 feet thick. The wall provides Three-Quarters Cover, and its space is Difficult Terrain. Any creature in the wall’s space makes a Dexterity saving throw, taking 6d10 Force damage on a failed save or half as much damage on a successful one. A creature also makes that save if it enters the wall’s space or ends it turn there. A creature makes that save only once per turn."},"bless":{"n":"Bless","m":"Level 1 Enchantment (Cleric, Paladin)","ct":"Action","rg":"30 feet","cp":"V, S, M (a Holy Symbol worth 5+ GP)","du":"Concentration, up to 1 minute","d":"You bless up to three creatures within range. Whenever a target makes an attack roll or a saving throw before the spell ends, the target adds 1d4 to the attack roll or save. Using a Higher-Level Spell Slot. You can target one additional creature for each spell slot level above 1."},"blight":{"n":"Blight","m":"Level 4 Necromancy (Druid, Sorcerer, Warlock, Wizard)","ct":"Action","rg":"30 feet","cp":"V, S","du":"Instantaneous","d":"A creature that you can see within range makes a Constitution saving throw, taking 8d8 Necrotic damage on a failed save or half as much damage on a successful one. A Plant creature automatically fails the save. Alternatively, target a nonmagical plant that isn’t a creature, such as a tree or shrub. It doesn’t make a save; it simply withers and dies. Using a Higher-Level Spell Slot. The damage in- creases by 1d8 for each spell slot level above 4."},"blindness/deafness":{"n":"Blindness/Deafness","m":"Level 2 Transmutation (Bard, Cleric, Sorcerer, Wizard)","ct":"Action","rg":"120 feet","cp":"V","du":"1 minute","d":"One creature that you can see within range must succeed on a Constitution saving throw, or it has the Blinded or Deafened condition (your choice) for the duration. At the end of each of its turns, the target repeats the save, ending Using a Higher-Level Spell Slot. the spell on itself on a success. You can target one additional creature for each spell slot level above 2."},"blink":{"n":"Blink","m":"Level 3 Transmutation (Sorcerer, Wizard)","ct":"Action","rg":"Self","cp":"V, S","du":"1 minute","d":"Roll 1d6 at the end of each of your turns for the duration. On a roll of 4–6, you vanish from your current plane of existence and appear in the Ethereal Plane (the spell ends instantly if you are already on that plane). While on the Ethereal Plane, you can perceive the plane you left, which is cast in shades of gray, but you can’t see anything there more than 60 feet away. You can affect and be affected only by other creatures on the Ethereal Plane, and creatures on the other plane can’t perceive you unless they have a special ability that lets them perceive things on the Ethereal Plane. You return to the other plane at the start of your next turn and when the spell ends if you are on the Ethereal Plane. You return to an unoccupied space of your choice that you can see within 10 feet of the space you left. If no unoccupied space is available within that range, you appear in the nearest unoc- cupied space."},"blur":{"n":"Blur","m":"Level 2 Illusion (Sorcerer, Wizard)","ct":"Action","rg":"Self","cp":"V","du":"Concentration, up to 1 minute","d":"Your body becomes blurred. For the duration, any creature has Disadvantage on attack rolls against you. An attacker is immune to this effect if it per- ceives you with Blindsight or Truesight."},"burning hands":{"n":"Burning Hands","m":"Level 1 Evocation (Sorcerer, Wizard)","ct":"Action","rg":"Self","cp":"V, S","du":"Instantaneous","d":"A thin sheet of flames shoots forth from you. Each creature in a 15-foot Cone makes a Dexterity saving throw, taking 3d6 Fire damage on a failed save or half as much damage on a successful one. Flammable objects in the Cone that aren’t being Using a Higher-Level Spell Slot. worn or carried start burning. The damage in- creases by 1d6 for each spell slot level above 1."},"call lightning":{"n":"Call Lightning","m":"Level 3 Conjuration (Druid)","ct":"Action","rg":"120 feet","cp":"V, S","du":"Concentration, up to 10 minutes","d":"A storm cloud appears at a point within range that you can see above yourself. It takes the shape of a Cylinder that is 10 feet tall with a 60-foot radius. When you cast the spell, choose a point you can see under the cloud. A lightning bolt shoots from the cloud to that point. Each creature within 5 feet of that point makes a Dexterity saving throw, taking 3d10 Lightning damage on a failed save or half as much damage on a successful one. Until the spell ends, you can take a Magic action to call down lightning in that way again, targeting the same point or a different one. If you’re outdoors in a storm when you cast this spell, the spell gives you control over that storm instead of creating a new one. Under such conditions, Using a Higher-Level Spell Slot. the spell’s damage increases by 1d10. The damage in- creases by 1d10 for each spell slot level above 3."},"calm emotions":{"n":"Calm Emotions","m":"Level 2 Enchantment (Bard, Cleric)","ct":"Action","rg":"60 feet","cp":"V, S","du":"Concentration, up to 1 minute","d":"Each Humanoid in a 20-foot-radius Sphere centered on a point you choose within range must succeed on a Charisma saving throw or be affected by one of the following effects (choose for each creature): • The creature has Immunity to the Charmed and Frightened conditions until the spell ends. If the creature was already Charmed or Frightened, those conditions are suppressed for the duration. • The creature becomes Indifferent about creatures of your choice that it’s Hostile toward. This indifference ends if the target takes damage or witnesses its allies taking damage. When the spell ends, the creature’s attitude returns to normal."},"chain lightning":{"n":"Chain Lightning","m":"Level 6 Evocation (Sorcerer, Wizard)","ct":"Action 150 feet","rg":"","cp":"V, S, M (three silver pins)","du":"Instantaneous","d":"You launch a lightning bolt toward a target you can see within range. Three bolts then leap from that target to as many as three other targets of your choice, each of which must be within 30 feet of the first target. A target can be a creature or an object and can be targeted by only one of the bolts. Each target makes a Dexterity saving throw, taking 10d8 Lightning damage on Using a Higher-Level Spell Slot. a failed save or half as much damage on a successful one. One additional bolt leaps from the first target to another target for each spell slot level above 6."},"charm monster":{"n":"Charm Monster","m":"Level 4 Enchantment (Bard, Druid, Sorcerer, Warlock, Wizard)","ct":"Action","rg":"30 feet","cp":"V, S","du":"1 hour","d":"One creature you can see within range makes a Wisdom saving throw. It does so with Advantage if you or your allies are fighting it. On a failed save, the target has the Charmed condition until the spell ends or until you or your allies damage it. The Charmed creature is Friendly to you. When the spell Using a Higher-Level Spell Slot. ends, the target knows it was Charmed by you. You can target one additional creature for each spell slot level above 4."},"charm person":{"n":"Charm Person","m":"Level 1 Enchantment (Bard, Druid, Sorcerer, Warlock, Wizard)","ct":"Action","rg":"30 feet","cp":"V, S","du":"1 hour","d":"One Humanoid you can see within range makes a Wisdom saving throw. It does so with Advantage if you or your allies are fighting it. On a failed save, the target has the Charmed condition until the spell ends or until you or your allies damage it. The Charmed creature is Friendly to you. When the spell Using a Higher-Level Spell Slot. ends, the target knows it was Charmed by you. You can target one additional creature for each spell slot level above 1."},"chill touch":{"n":"Chill Touch","m":"Necromancy Cantrip (Sorcerer, Warlock, Wizard)","ct":"Action","rg":"Touch","cp":"V, S","du":"Instantaneous","d":"Channeling the chill of the grave, make a melee spell attack against a target within reach. On a hit, the target takes 1d10 Necrotic damage, and it can’t regain Hit Points until the end of your next turn. Cantrip Upgrade. The damage increases by 1d10 when you reach levels 5 (2d10), 11 (3d10), and 17 (4d10)."},"chromatic orb":{"n":"Chromatic Orb","m":"Level 1 Evocation (Sorcerer, Wizard)","ct":"Action","rg":"90 feet","cp":"V, S, M (a diamond worth 50+ GP)","du":"Instantaneous","d":"You hurl an orb of energy at a target within range. Choose Acid, Cold, Fire, Lightning, Poison, or Thunder for the type of orb you create, and then make a ranged spell attack against the target. On a hit, the target takes 3d8 damage of the chosen type. If you roll the same number on two or more of the d8s, the orb leaps to a different target of your choice within 30 feet of the target. Make an attack roll against the new target, and make a new damage roll. The orb can’t leap again unless you cast the spell with a level 2+ spell slot. Using a Higher-Level Spell Slot. The damage increases by 1d8 for each spell slot level above 1. The orb can leap a maximum number of times equal to the level of the slot expended, and a creature can be targeted only once by each casting of this spell."},"circle of death":{"n":"Circle of Death","m":"Level 6 Necromancy (Sorcerer, Warlock, Wizard)","ct":"Action","rg":"150 feet","cp":"V, S, M (the powder of a crushed black pearl worth 500+ GP)","du":"Instantaneous","d":"Negative energy ripples out in a 60-foot-radius Sphere from a point you choose within range. Each creature in that area makes a Constitution saving throw, taking 8d8 Necrotic damage on a failed save Using a Higher-Level Spell Slot. or half as much damage on a successful one. The damage in- creases by 2d8 for each spell slot level above 6."},"clairvoyance":{"n":"Clairvoyance","m":"Level 3 Divination (Bard, Cleric, Sorcerer, Wizard) See Invisibility","ct":"10 minutes","rg":"1 mile","cp":"V, S, M (a focus worth 100+ GP, either a jeweled horn for hearing or a glass eye for seeing)","du":"Concentration, up to 10 minutes","d":"You create an Invisible sensor within range in a location familiar to you (a place you have visited or seen before) or in an obvious location that is unfamiliar to you (such as behind a door, around a corner, or in a grove of trees). The intangible, invulnerable sensor remains in place for the duration. When you cast the spell, choose seeing or hearing. You can use the chosen sense through the sensor as if you were in its space. As a Bonus Action, you can switch between seeing and hearing. A creature that sees the sensor (such as a creature benefiting from or Truesight) sees a luminous orb about the size of your fist."},"clone":{"n":"Clone","m":"Level 8 Necromancy (Wizard)","ct":"1 hour","rg":"Touch","cp":"V, S, M (a diamond worth 1,000+ GP, which the spell consumes, and a sealable vessel worth 2,000+ GP that is large enough to hold the creature being cloned)","du":"Instantaneous","d":"You touch a creature or at least 1 cubic inch of its flesh. An inert duplicate of that creature forms inside the vessel used in the spell’s casting and finishes growing after 120 days; you choose whether the finished clone is the same age as the creature or younger. The clone remains inert and endures indefinitely while its vessel remains undisturbed. If the original creature dies after the clone finishes forming, the creature’s soul transfers to the clone if the soul is free and willing to return. The clone is physically identical to the original and has the same personality, memories, and abilities, but none of the original’s equipment. The creature’s original remains, if any, become inert and can’t be revived, since the creature’s soul is elsewhere."},"cloudkill":{"n":"Cloudkill","m":"Level 5 Conjuration (Sorcerer, Wizard) Gust of Wind","ct":"Action","rg":"120 feet","cp":"V, S","du":"Concentration, up to 10 minutes","d":"You create a 20-foot-radius Sphere of yellow-green fog centered on a point within range. The fog lasts for the duration or until strong wind (such as the one created by ) disperses it, ending the spell. Its area is Heavily Obscured. Each creature in the Sphere makes a Constitution saving throw, taking 5d8 Poison damage on a failed save or half as much damage on a successful one. A creature must also make this save when the Sphere moves into its space and when it enters the Sphere or ends its turn there. A creature makes this save only once per turn. The Sphere moves 10 feet away from you at the start of each of your turns. Using a Higher-Level Spell Slot. The damage in- creases by 1d8 for each spell slot level above 5."},"color spray":{"n":"Color Spray","m":"Level 1 Illusion (Bard, Sorcerer, Wizard)","ct":"Action","rg":"Self","cp":"V, S, M (a pinch of colorful sand)","du":"Instantaneous","d":"You launch a dazzling array of flashing, colorful light. Each creature in a 15-foot Cone originating from you must succeed on a Constitution saving throw or have the Blinded condition until the end of your next turn."},"command":{"n":"Command","m":"Level 1 Enchantment (Bard, Cleric, Paladin)","ct":"Action","rg":"60 feet","cp":"V","du":"Instantaneous","d":"You speak a one-word command to a creature you can see within range. The target must succeed on a Wisdom saving throw or follow the command on its Approach. next turn. Choose the command from these options: The target moves toward you by the shortest and most direct route, ending its turn if it Drop. moves within 5 feet of you. The target drops whatever it is holding and Flee. then ends its turn. The target spends its turn moving away from Grovel. you by the fastest available means. The target has the Prone condition and then Halt. ends its turn. On its turn, the target doesn’t move and takes Using a Higher-Level Spell Slot. no action or Bonus Action. You can affect one additional creature for each spell slot level above 1."},"commune":{"n":"Commune","m":"Level 5 Divination (Cleric)","ct":"1 minute or Ritual","rg":"Self","cp":"V, S, M (incense)","du":"1 minute","d":"You contact a deity or a divine proxy and ask up to three questions that can be answered with yes or no. You must ask your questions before the spell ends. You receive a correct answer for each question. Divine beings aren’t necessarily omniscient, so you might receive “unclear” as an answer if a question pertains to information that lies beyond the deity’s knowledge. In a case where a one-word answer could be misleading or contrary to the deity’s interests, the GM might offer a short phrase as an answer instead. If you cast the spell more than once before finishing a Long Rest, there is a cumulative 25 percent chance for each casting after the first that you get no answer."},"commune with nature":{"n":"Commune with Nature","m":"Level 5 Divination (Druid, Ranger)","ct":"1 minute or Ritual","rg":"Self","cp":"V, S","du":"Instantaneous","d":"You commune with nature spirits and gain knowledge of the surrounding area. In the outdoors, the spell gives you knowledge of the area within 3 miles of you. In caves and other natural underground settings, the radius is limited to 300 feet. The spell doesn’t function where nature has been replaced by construction, such as in castles and settlements. Choose three of the following facts; you learn those facts as they pertain to the spell’s area: • Locations of settlements • Locations of portals to other planes of existence • Location of one Challenge Rating 10+ creature (GM’s choice) that is a Celestial, an Elemental, a Fey, a Fiend, or an Undead • The most prevalent kind of plant, mineral, or Beast (you choose which to learn) • Locations of bodies of water For example, you could determine the location of a powerful monster in the area, the locations of bod- ies of water, and the locations of any towns."},"comprehend languages":{"n":"Comprehend Languages","m":"Level 1 Divination (Bard, Sorcerer, Warlock, Wizard)","ct":"Action or Ritual","rg":"Self","cp":"V, S, M (a pinch of soot and salt)","du":"1 hour","d":"For the duration, you understand the literal meaning of any language that you hear or see signed. You also understand any written language that you see, but you must be touching the surface on which the words are written. It takes about 1 minute to read one page of text. This spell doesn’t decode symbols or secret messages."},"compulsion":{"n":"Compulsion","m":"Level 4 Enchantment (Bard)","ct":"Action","rg":"30 feet","cp":"V, S","du":"Concentration, up to 1 minute","d":"Each creature of your choice that you can see within range must succeed on a Wisdom saving throw or have the Charmed condition until the spell ends. For the duration, you can take a Bonus Action to designate a direction that is horizontal to you. Each Charmed target must use as much of its movement as possible to move in that direction on its next turn, taking the safest route. After moving in this way, a target repeats the save, ending the spell on itself on a success."},"cone of cold":{"n":"Cone of Cold","m":"Level 5 Evocation (Druid, Sorcerer, Wizard)","ct":"Action","rg":"Self","cp":"V, S, M (a small crystal or glass cone)","du":"Instantaneous","d":"You unleash a blast of cold air. Each creature in a 60-foot Cone originating from you makes a Constitution saving throw, taking 8d8 Cold damage on a failed save or half as much damage on a successful one. A creature killed by this spell becomes Using a Higher-Level Spell Slot. a frozen statue until it thaws. The damage in- creases by 1d8 for each spell slot level above 5."},"confusion":{"n":"Confusion","m":"Level 4 Enchantment (Bard, Druid, Sorcerer, Wizard)","ct":"Action","rg":"90 feet","cp":"V, S, M (three nut shells)","du":"Concentration, up to 1 minute 1 The target doesn’t take an action, and it uses all its movement to move. Roll 1d4 for the direc - tion: 1, north; 2, east; 3, south; or 4, west. 2–6 The target doesn’t move or take actions. 7–8 The target doesn’t move, and it takes the At- tack action to make one melee attack against a random creature within reach. If none are within reach, the target takes no action. 9–10 The target chooses its behavior.","d":"Each creature in a 10-foot-radius Sphere centered on a point you choose within range must succeed on a Wisdom saving throw, or that target can’t take Bonus Actions or Reactions and must roll 1d10 at the start of each of its turns to determine its behavior for that turn, consulting the table below. 1: The target doesn’t take an action, and it uses all its movement to move; roll 1d4 for the direction — 1 north, 2 east, 3 south, 4 west. 2–6: The target doesn’t move or take actions. 7–8: The target doesn’t move, and it takes the Attack action to make one melee attack against a randomly determined creature within reach; if none is within reach, it does nothing this turn. 9–10: The target can act and move normally. At the end of each of its turns, an affected target repeats the save, ending the spell on itself on a success. Using a Higher-Level Spell Slot. The Sphere’s radius increases by 5 feet for each spell slot level above 4."},"conjure animals":{"n":"Conjure Animals","m":"Level 3 Conjuration (Druid, Ranger)","ct":"Action","rg":"60 feet","cp":"V, S","du":"Concentration, up to 10 minutes","d":"You conjure nature spirits that appear as a Large pack of spectral, intangible animals in an unoccupied space you can see within range. The pack lasts for the duration, and you choose the spirits’ animal form, such as wolves, serpents, or birds. You have Advantage on Strength saving throws while you’re within 5 feet of the pack, and when you move on your turn, you can also move the pack up to 30 feet to an unoccupied space you can see. Whenever the pack moves within 10 feet of a creature you can see and whenever a creature you can see enters a space within 10 feet of the pack or ends its turn there, you can force that creature to make a Dexterity saving throw. On a failed save, the creature takes 3d10 Slashing damage. A creature makes Using a Higher-Level Spell Slot. this save only once per turn. The damage in- creases by 1d10 for each spell slot level above 3."},"conjure celestial":{"n":"Conjure Celestial","m":"Level 7 Conjuration (Cleric)","ct":"Action","rg":"90 feet","cp":"V, S","du":"Concentration, up to 10 minutes","d":"You conjure a spirit from the Upper Planes, which manifests as a pillar of light in a 10-foot-radius, 40-foot-high Cylinder centered on a point within range. For each creature you can see in the Cylinder, Healing Light. choose which of these lights shines on it: The target regains Hit Points equal Searing Light. to 4d12 plus your spellcasting ability modifier. The target makes a Dexterity saving throw, taking 6d12 Radiant damage on a failed save or half as much damage on a successful one. Until the spell ends, Bright Light fills the Cylinder, and when you move on your turn, you can also move the Cylinder up to 30 feet. Whenever the Cylinder moves into the space of a creature you can see and whenever a creature you can see enters the Cylinder or ends its turn there, you can bathe it in one of the lights. A creature can Using a Higher-Level Spell Slot. be affected by this spell only once per turn. The healing and damage increase by 1d12 for each spell slot level above 7."},"conjure elemental":{"n":"Conjure Elemental","m":"Level 5 Conjuration (Druid, Wizard)","ct":"Action","rg":"60 feet","cp":"V, S","du":"Concentration, up to 10 minutes","d":"You conjure a Large, intangible spirit from the Elemental Planes that appears in an unoccupied space within range. Choose the spirit’s element, which determines its damage type: air (Lightning), earth (Thunder), fire (Fire), or water (Cold). The spirit lasts for the duration. Whenever a creature you can see enters the spirit’s space or starts its turn within 5 feet of the spirit, you can force that creature to make a Dexterity saving throw if the spirit has no creature Restrained. On failed save, the target takes 8d8 damage of the spirit’s type, and the target has the Restrained condition until the spell ends. At the start of each of its turns, the Restrained target repeats the save. On a failed save, the target takes 4d8 damage of the spirit’s type. On a successful save, the target isn’t Using a Higher-Level Spell Slot. Restrained by the spirit. The damage in- creases by 1d8 for each spell slot level above 5."},"conjure fey":{"n":"Conjure Fey","m":"Level 6 Conjuration (Druid)","ct":"Action","rg":"60 feet","cp":"V, S","du":"Concentration, up to 10 minutes","d":"You conjure a Medium spirit from the Feywild in an unoccupied space you can see within range. The spirit lasts for the duration, and it looks like a Fey creature of your choice. When the spirit appears, you can make one melee spell attack against a creature within 5 feet of it. On a hit, the target takes Psychic damage equal to 3d12 plus your spellcasting ability modifier, and the target has the Frightened condition until the start of your next turn, with both you and the spirit as the source of the fear. As a Bonus Action on your later turns, you can teleport the spirit to an unoccupied space you can see within 30 feet of the space it left and make the attack against a creature within 5 feet of it. Using a Higher-Level Spell Slot. The damage in- creases by 1d12 for each spell slot level above 6."},"conjure minor elementals":{"n":"Conjure Minor Elementals","m":"Level 4 Conjuration (Druid, Wizard)","ct":"Action","rg":"Self","cp":"V, S","du":"Concentration, up to 10 minutes","d":"You conjure spirits from the Elemental Planes that flit around you in a 15-foot Emanation for the duration. Until the spell ends, any attack you make deals an extra 2d8 damage when you hit a creature in the Emanation. This damage is Acid, Cold, Fire, or Lightning (your choice when you make the attack). In addition, the ground in the Emanation is Difficult Terrain for your enemies. Using a Higher-Level Spell Slot. The damage increases by 1d8 for each spell slot level above 4."},"conjure woodland beings":{"n":"Conjure Woodland Beings","m":"Level 4 Conjuration (Druid, Ranger)","ct":"Action","rg":"Self","cp":"V, S","du":"Concentration, up to 10 minutes","d":"You conjure nature spirits that flit around you in a 10-foot Emanation for the duration. Whenever the Emanation enters the space of a creature you can see and whenever a creature you can see enters the Emanation or ends its turn there, you can force that creature to make a Wisdom saving throw. The creature takes 5d8 Force damage on a failed save or half as much damage on a successful one. A creature makes this save only once per turn. In addition, you can take the Disengage action as a Using a Higher-Level Spell Slot. Bonus Action for the spell’s duration. The damage in- creases by 1d8 for each spell slot level above 4."},"contact other plane":{"n":"Contact Other Plane","m":"Level 5 Divination (Warlock, Wizard) Greater Restoration","ct":"1 minute or Ritual","rg":"Self","cp":"V","du":"1 minute","d":"You mentally contact a demigod, the spirit of a longdead sage, or some other knowledgeable entity from another plane. Contacting this otherworldly intelligence can break your mind. When you cast this spell, make a DC 15 Intelligence saving throw. On a successful save, you can ask the entity up to five questions. You must ask your questions before the spell ends. The GM answers each question with one word, such as “yes,” “no,” “maybe,” “never,” “irrelevant,” or “unclear” (if the entity doesn’t know the answer to the question). If a one-word answer would be misleading, the GM might instead offer a short phrase as an answer. On a failed save, you take 6d6 Psychic damage and have the Incapacitated condition until you finish a Long Rest. A spell cast on you ends this effect."},"contagion":{"n":"Contagion","m":"Level 5 Necromancy (Cleric, Druid)","ct":"Action","rg":"Touch Component: V, S","cp":"","du":"7 days","d":"Your touch inflicts a magical contagion. The target must succeed on a Constitution saving throw or take 11d8 Necrotic damage and have the Poisoned condition. Also, choose one ability when you cast the spell. While Poisoned, the target has Disadvantage on saving throws made with the chosen ability. The target must repeat the saving throw at the end of each of its turns until it gets three successes or failures. If the target succeeds on three of these saves, the spell ends on the target. If the target fails three of the saves, the spell lasts for 7 days on it. Whenever the Poisoned target receives an effect that would end the Poisoned condition, the target must succeed on a Constitution saving throw, or the Poisoned condition doesn’t end on it."},"contingency":{"n":"Contingency","m":"Level 6 Abjuration (Wizard) Contingency Contingency Water Breathing Water Breathing Contingency Contingency Contingency Contingency","ct":"10 minutes","rg":"Self","cp":"V, S, M (a gem-encrusted statuette of yourself worth 1,500+ GP)","du":"10 days","d":"Choose a spell of level 5 or lower that you can cast, that has a casting time of an action, and that can target you. You cast that spell—called the contingent spell—as part of casting , expending spell slots for both, but the contingent spell doesn’t come into effect. Instead, it takes effect when a certain trigger occurs. You describe that trigger when you cast the two spells. For example, a cast with might stipulate that comes into effect when you are engulfed in water or a similar liquid. The contingent spell takes effect immediately after the trigger occurs for the first time, whether or not you want it to, and then ends. The contingent spell takes effect only on you, even if it can normally target others. You can use only one spell at a time. If you cast this spell again, the effect of another spell on you ends. Also, ends on you if its material component is ever not on your person."},"continual flame":{"n":"Continual Flame","m":"Level 2 Evocation (Cleric, Druid, Wizard)","ct":"Action","rg":"Touch","cp":"V, S, M (ruby dust worth 50+ GP, which the spell consumes)","du":"Until dispelled","d":"A flame springs from an object that you touch. The effect casts Bright Light in a 20-foot radius and Dim Light for an additional 20 feet. It looks like a regular flame, but it creates no heat and consumes no fuel. The flame can be covered or hidden but not smoth- ered or quenched."},"control water":{"n":"Control Water","m":"Level 4 Transmutation (Cleric, Druid, Wizard)","ct":"Action","rg":"300 feet","cp":"V, S, M (a mixture of water and dust)","du":"Concentration, up to 10 minutes","d":"Until the spell ends, you control any water inside an area you choose that is a Cube up to 100 feet on a side, using one of the following effects. As a Magic action on your later turns, you can repeat the same Flood. effect or choose a different one. You cause the water level of all standing water in the area to rise by as much as 20 feet. If you choose an area in a large body of water, you instead create a 20-foot tall wave that travels from one side of the area to the other and then crashes. Any Huge or smaller vehicles in the wave’s path are carried with it to the other side. Any Huge or smaller vehicles struck by the wave have a 25 percent chance of capsizing. The water level remains elevated until the spell ends or you choose a different effect. If this effect produced a wave, the wave repeats on the start of Part Water. your next turn while the flood effect lasts. You part water in the area and create a trench. The trench extends across the spell’s area, and the separated water forms a wall to either side. The trench remains until the spell ends or you choose a different effect. The water then slowly fills in the trench over the course of the next round until Redirect Flow. the normal water level is restored. You cause flowing water in the area to move in a direction you choose, even if the water has to flow over obstacles, up walls, or in other unlikely directions. The water in the area moves as you direct it, but once it moves beyond the spell’s area, it resumes its flow based on the terrain. The water continues to move in the direction you chose until the spell ends or you choose a different Whirlpool. effect. You cause a whirlpool to form in the center of the area, which must be at least 50 feet square and 25 feet deep. The whirlpool lasts until you choose a different effect or the spell ends. The whirlpool is 5 feet wide at the base, up to 50 feet wide at the top, and 25 feet tall. Any creature in the water and within 25 feet of the whirlpool is pulled 10 feet toward it. When a creature enters the whirlpool for the first time on a turn or ends its turn there, it makes a Strength saving throw. On a failed save, the creature takes 2d8 Bludgeoning damage. On a successful save, the creature takes half as much damage. A creature can swim away from the whirlpool only if it first takes an action to pull away and succeeds on a Strength (Athletics) check against your spell save DC."},"control weather":{"n":"Control Weather","m":"Level 8 Transmutation (Cleric, Druid, Wizard)","ct":"10 minutes","rg":"Self","cp":"V, S, M (burning incense)","du":"Concentration, up to 8 hours 1 Clear 2 Light clouds 3 Overcast or ground fog 4 Rain, hail, or snow 5 Torrential rain, driving hail, or blizzard 1 Heat wave 1 Calm 2 Hot 2 Moderate wind 3 Warm 3 Strong wind 4 Cool 4 Gale 5 Cold 5 Storm 6 Freezing","d":"You take control of the weather within 5 miles of you for the duration. You must be outdoors to cast this spell, and it ends early if you go indoors. When you cast the spell, you change the current weather conditions, which are determined by the GM. You can change precipitation, temperature, and wind. It takes 1d4 × 10 minutes for the new conditions to take effect. Once they do so, you can change the conditions again. When the spell ends, the weather gradually returns to normal. When you change the weather conditions, find a current condition on the following tables and change its stage by one, up or down. When changing the wind, you can change its direction. Precipitation stages — 1 Clear; 2 Light clouds; 3 Overcast or ground fog; 4 Rain, hail, or snow; 5 Torrential rain, driving hail, or blizzard. Temperature stages — 1 Heat wave; 2 Hot; 3 Warm; 4 Cool; 5 Cold; 6 Arctic cold. Wind stages — 1 Calm; 2 Moderate wind; 3 Strong wind; 4 Gale; 5 Storm."},"counterspell":{"n":"Counterspell","m":"Level 3 Abjuration (Sorcerer, Warlock, Wizard)","ct":"Reaction, which you take when you see a creature within 60 feet of yourself casting a spell with Verbal, Somatic, or Material components","rg":"60 feet","cp":"S","du":"Instantaneous","d":"You attempt to interrupt a creature in the process of casting a spell. The creature makes a Constitution saving throw. On a failed save, the spell dissipates with no effect, and the action, Bonus Action, or Reaction used to cast it is wasted. If that spell was cast with a spell slot, the slot isn’t expended."},"create food and water":{"n":"Create Food and Water","m":"Level 3 Conjuration (Cleric, Paladin)","ct":"Action","rg":"30 feet","cp":"V, S","du":"Instantaneous","d":"You create 45 pounds of food and 30 gallons of fresh water on the ground or in containers within range—both useful in fending off the hazards of malnutrition and dehydration. The food is bland but nourishing and looks like a food of your choice, and the water is clean. The food spoils after 24 hours if uneaten."},"create or destroy water":{"n":"Create or Destroy Water","m":"Level 1 Transmutation (Cleric, Druid)","ct":"Action","rg":"30 feet","cp":"V, S, M (a mix of water and sand)","du":"Instantaneous","d":"Create Water. You do one of the following: You create up to 10 gallons of clean water within range in an open container. Alternatively, the water falls as rain in a 30-foot Cube Destroy Water. within range, extinguishing exposed flames there. You destroy up to 10 gallons of water in an open container within range. Alternatively, you destroy fog in a 30-foot Cube within Using a Higher-Level Spell Slot. range. You create or destroy 10 additional gallons of water, or the size of the Cube increases by 5 feet, for each spell slot level above 1."},"create undead":{"n":"Create Undead","m":"Level 6 Necromancy (Cleric, Warlock, Wizard)","ct":"1 minute","rg":"10 feet","cp":"V, S, M (one 150+ GP black onyx stone for each corpse)","du":"Instantaneous","d":"You can cast this spell only at night. Choose up Ghoul to three corpses of Medium or Small Humanoids within range. Each one becomes a under your control (see “Monsters” for its stat block). As a Bonus Action on each of your turns, you can mentally command any creature you animated with this spell if the creature is within 120 feet of you (if you control multiple creatures, you can command any of them at the same time, issuing the same command to them). You decide what action the creature will take and where it will move on its next turn, or you can issue a general command, such as to guard a particular place. If you issue no commands, the creature takes the Dodge action and moves only to avoid harm. Once given an order, the creature continues to follow the order until its task is complete. The creature is under your control for 24 hours, after which it stops obeying any command you’ve given it. To maintain control of the creature for another 24 hours, you must cast this spell on the creature before the current 24-hour period ends. This use of the spell reasserts your control over up to three creatures you have animated with this spell Using a Higher-Level Spell Slot. rather than animating new ones. If you use a level Ghouls 7 spell slot, you can animate or reassert control Ghouls over four . If you use a level 8 spell slot, you can animate or reassert control over five Ghasts Wights or two or . If you use a level 9 spell Ghouls Ghasts Wights Mummies slot, you can animate or reassert control over six , three or , or two ."},"creation":{"n":"Creation","m":"Level 5 Illusion (Sorcerer, Wizard)","ct":"1 minute","rg":"30 feet","cp":"V, S, M (a paintbrush)","du":"Special Vegetable matter 24 hours Stone or crystal 12 hours Precious metals 1 hour Gems 10 minutes Adamantine or mithral 1 minute","d":"See “Monsters” for these stat blocks. You pull wisps of shadow material from the Shadowfell to create an object within range. It is either an object of vegetable matter (soft goods, rope, wood, and the like) or mineral matter (stone, crystal, metal, and the like). The object must be no larger than a 5-foot Cube, and the object must be of a form and material that you have seen. The spell’s duration depends on the object’s material, as shown in the Materials table. If the object is composed of multiple materials, use the shortest duration. Using any object created by this spell as another spell’s Material component causes the other Materials spell to fail. Using a Higher-Level Spell Slot. The Cube in- creases by 5 feet for each spell slot level above 5."},"cure wounds":{"n":"Cure Wounds","m":"Level 1 Abjuration (Bard, Cleric, Druid, Paladin, Ranger)","ct":"Action","rg":"Touch","cp":"V, S","du":"Instantaneous","d":"A creature you touch regains a number of Hit Points Using a Higher-Level Spell Slot. equal to 2d8 plus your spellcasting ability modifier. The healing in- creases by 2d8 for each spell slot level above 1."},"dancing lights":{"n":"Dancing Lights","m":"Illusion Cantrip (Bard, Sorcerer, Wizard)","ct":"Action","rg":"120 feet","cp":"V, S, M (a bit of phosphorus)","du":"Concentration, up to 1 minute","d":"You create up to four torch-size lights within range, making them appear as torches, lanterns, or glowing orbs that hover for the duration. Alternatively, you combine the four lights into one glowing Medium form that is vaguely humanlike. Whichever form you choose, each light sheds Dim Light in a 10foot radius. As a Bonus Action, you can move the lights up to 60 feet to a space within range. A light must be within 20 feet of another light created by this spell, and a light vanishes if it exceeds the spell’s range."},"darkness":{"n":"Darkness","m":"Level 2 Evocation (Sorcerer, Warlock, Wizard)","ct":"Action","rg":"60 feet","cp":"V, M (bat fur and a piece of coal)","du":"Concentration, up to 10 minutes","d":"For the duration, magical Darkness spreads from a point within range and fills a 15-foot-radius Sphere. Darkvision can’t see through it, and nonmagical light can’t illuminate it. Alternatively, you cast the spell on an object that isn’t being worn or carried, causing the Darkness to fill a 15-foot Emanation originating from that object. Covering that object with something opaque, such as a bowl or helm, blocks the Darkness. If any of this spell’s area overlaps with an area of Bright Light or Dim Light created by a spell of level 2 or lower, that other spell is dispelled."},"darkvision":{"n":"Darkvision","m":"Level 2 Transmutation (Druid, Ranger, Sorcerer, Wizard)","ct":"Action","rg":"Touch","cp":"V, S, M (a dried carrot)","du":"8 hours","d":"For the duration, a willing creature you touch has Darkvision with a range of 150 feet."},"daylight":{"n":"Daylight","m":"Level 3 Evocation (Cleric, Druid, Paladin, Ranger, Sorcerer)","ct":"Action","rg":"60 feet","cp":"V, S","du":"1 hour","d":"Darkvision with a range of 150 feet. For the duration, sunlight spreads from a point within range and fills a 60-foot-radius Sphere. The sunlight’s area is Bright Light and sheds Dim Light for an additional 60 feet. Alternatively, you cast the spell on an object that isn’t being worn or carried, causing the sunlight to fill a 60-foot Emanation originating from that object. Covering that object with something opaque, such as a bowl or helm, blocks the sunlight. If any of this spell’s area overlaps with an area of Darkness created by a spell of level 3 or lower, that other spell is dispelled."},"death ward":{"n":"Death Ward","m":"Level 4 Abjuration (Cleric, Paladin)","ct":"Action","rg":"Touch","cp":"V, S","du":"8 hours","d":"You touch a creature and grant it a measure of protection from death. The first time the target would drop to 0 Hit Points before the spell ends, the target instead drops to 1 Hit Point, and the spell ends. If the spell is still in effect when the target is subjected to an effect that would kill it instantly without dealing damage, that effect is negated against the target, and the spell ends."},"delayed blast fireball":{"n":"Delayed Blast Fireball","m":"Level 7 Evocation (Sorcerer, Wizard)","ct":"Action","rg":"150 feet","cp":"V, S, M (a ball of bat guano and sulfur)","du":"Concentration, up to 1 minute","d":"A beam of yellow light flashes from you, then condenses at a chosen point within range as a glowing bead for the duration. When the spell ends, the bead explodes, and each creature in a 20-foot-radius Sphere centered on that point makes a Dexterity saving throw. A creature takes Fire damage equal to the total accumulated damage on a failed save or half as much damage on a successful one. The spell’s base damage is 12d6, and the damage increases by 1d6 whenever your turn ends and the spell hasn’t ended. If a creature touches the glowing bead before the spell ends, that creature makes a Dexterity saving throw. On a failed save, the spell ends, causing the bead to explode. On a successful save, the creature can throw the bead up to 40 feet. If the thrown bead enters a creature’s space or collides with a solid object, the spell ends, and the bead explodes. When the bead explodes, flammable objects in the explosion that aren’t being worn or carried start Using a Higher-Level Spell Slot. burning. The base damage increases by 1d6 for each spell slot level above 7."},"demiplane":{"n":"Demiplane","m":"Level 8 Conjuration (Sorcerer, Warlock, Wizard)","ct":"Action","rg":"60 feet","cp":"S","du":"1 hour","d":"You create a shadowy Medium door on a flat solid surface that you can see within range. This door can be opened and closed, and it leads to a demiplane that is an empty room 30 feet in each dimension, made of wood or stone (your choice). When the spell ends, the door vanishes, and any objects inside the demiplane remain there. Any creatures inside also remain unless they opt to be shunted through the door as it vanishes, landing with the Prone condition in the unoccupied spaces closest to the door’s former space. Each time you cast this spell, you can create a new demiplane or connect the shadowy door to a demiplane you created with a previous casting of this spell. Additionally, if you know the nature and contents of a demiplane created by a casting of this spell by another creature, you can connect the shad- owy door to that demiplane instead."},"detect evil and good":{"n":"Detect Evil and Good","m":"Level 1 Divination (Cleric, Paladin) Hallow","ct":"Action","rg":"Self","cp":"V, S","du":"Concentration, up to 10 minutes","d":"For the duration, you sense the location of any Aberration, Celestial, Elemental, Fey, Fiend, or Undead within 30 feet of yourself. You also sense whether the spell is active there and, if so, where. The spell is blocked by 1 foot of stone, dirt, or wood; 1 inch of metal; or a thin sheet of lead."},"detect magic":{"n":"Detect Magic","m":"Level 1 Divination (Bard, Cleric, Druid, Paladin, Ranger, Sorcerer, Warlock, Wizard)","ct":"Action or Ritual","rg":"Self","cp":"V, S","du":"Concentration, up to 10 minutes","d":"For the duration, you sense the presence of magical effects within 30 feet of yourself. If you sense such effects, you can take the Magic action to see a faint aura around any visible creature or object in the area that bears the magic, and if an effect was created by a spell, you learn the spell’s school of magic. The spell is blocked by 1 foot of stone, dirt, or wood; 1 inch of metal; or a thin sheet of lead."},"detect poison and disease":{"n":"Detect Poison and Disease","m":"Level 1 Divination (Cleric, Druid, Paladin, Ranger)","ct":"Action or Ritual","rg":"Self","cp":"V, S, M (a yew leaf)","du":"Concentration, up to 10 minutes","d":"For the duration, you sense the location of poisons, poisonous or venomous creatures, and magical contagions within 30 feet of yourself. You sense the kind of poison, creature, or contagion in each case. The spell is blocked by 1 foot of stone, dirt, or wood; 1 inch of metal; or a thin sheet of lead."},"detect thoughts":{"n":"Detect Thoughts","m":"Level 2 Divination (Bard, Sorcerer, Wizard)","ct":"Action","rg":"Self","cp":"V, S, M (1 Copper Piece)","du":"Concentration, up to 1 minute","d":"You activate one of the effects below. Until the spell ends, you can activate either effect as a Magic action on your later turns. Sense Thoughts. You sense the presence of thoughts within 30 feet of yourself that belong to creatures that know languages or are telepathic. You don’t read the thoughts, but you know that a thinking creature is present. The spell is blocked by 1 foot of stone, dirt, or wood; 1 inch of metal; or a thin sheet of lead. Read Thoughts. Target one creature you can see within 30 feet of yourself or one creature within 30 feet of yourself that you detected with the Sense Thoughts option. You learn what is most on the target’s mind right now. If the target doesn’t know any languages and isn’t telepathic, you learn nothing. As a Magic action on your next turn, you can try to probe deeper into the target’s mind. If you probe deeper, the target makes a Wisdom saving throw. On a failed save, you discern the target’s reasoning, emotions, and something that looms large in its mind (such as a worry, love, or hate). On a successful save, the spell ends. Either way, the target knows that you are probing into its mind, and until you shift your attention away from the target’s mind, the target can take an action on its turn to make an Intelligence (Arcana) check against your spell save DC, ending the spell on a success."},"dimension door":{"n":"Dimension Door","m":"Level 4 Conjuration (Bard, Sorcerer, Warlock, Wizard)","ct":"Action","rg":"500 feet","cp":"V","du":"Instantaneous","d":"DC, ending the spell on a success. You teleport to a location within range. You arrive at exactly the spot desired. It can be a place you can see, one you can visualize, or one you can describe by stating distance and direction, such as “200 feet straight downward” or “300 feet upward to the northwest at a 45-degree angle.” You can also teleport one willing creature. The creature must be within 5 feet of you when you teleport, and it teleports to a space within 5 feet of your destination space. If you, the other creature, or both would arrive in a space occupied by a creature or completely filled by one or more objects, you and any creature traveling with you each take 4d6 Force damage, and the teleportation fails."},"disguise self":{"n":"Disguise Self","m":"Level 1 Illusion (Bard, Sorcerer, Wizard)","ct":"Action","rg":"Self","cp":"V, S","du":"1 hour","d":"You make yourself—including your clothing, armor, weapons, and other belongings on your person— look different until the spell ends. You can seem 1 foot shorter or taller and can appear heavier or lighter. You must adopt a form that has the same basic arrangement of limbs as you have. Otherwise, the extent of the illusion is up to you. The changes wrought by this spell fail to hold up to physical inspection. For example, if you use this spell to add a hat to your outfit, objects pass through the hat, and anyone who touches it would feel nothing. To discern that you are disguised, a creature must take the Study action to inspect your appearance and succeed on an Intelligence (Investigation) check against your spell save DC."},"disintegrate":{"n":"Disintegrate","m":"Level 6 Transmutation (Sorcerer, Wizard)","ct":"Action","rg":"60 feet","cp":"V, S, M (a lodestone and dust)","du":"Instantaneous","d":"You launch a green ray at a target you can see within range. The target Wall can of be Force. a creature, a nonmagical object, or a creation of magical force, such as the wall created by A creature targeted by this spell makes a Dexterity saving throw. On a failed save, the target takes 10d6 + 40 Force damage. If this damage reduces it to 0 Hit Points, it and everything nonmagical True it Resis urrection wearing and carrying Wish are disintegrated into gray dust. The target can be revived only by a or a spell. This spell automatically disintegrates a Large or smaller nonmagical object or a creation of magical force. If such a target is Huge or larger, this spell Using a Higher-Level Spell Slot. disintegrates a 10-foot-Cube portion of it. The damage in- creases by 3d6 for each spell slot level above 6."},"dispel evil and good":{"n":"Dispel Evil and Good","m":"Level 5 Abjuration (Cleric, Paladin)","ct":"Action","rg":"Self","cp":"V, S, M (powdered silver and iron)","du":"Concentration, up to 1 minute","d":"For the duration, Celestials, Elementals, Fey, Fiends, and Undead have Disadvantage on attack rolls against you. You can end the spell early by using either of the following special functions. Break Enchantment. As a Magic action, you touch a creature that is possessed by or has the Charmed or Frightened condition from one or more creatures of the types above. The target is no longer possessed, Charmed, or Frightened by such creatures. Dismissal. As a Magic action, you target one creature you can see within 5 feet of you that has one of the creature types above. The target must succeed on a Charisma saving throw or be sent back to its home plane if it isn’t there already. If they aren’t on their home plane, Undead are sent to the Shadowfell, and Fey are sent to the Feywild."},"dispel magic":{"n":"Dispel Magic","m":"Level 3 Abjuration (Bard, Cleric, Druid, Paladin, Ranger, Sorcerer, Warlock, Wizard)","ct":"Action","rg":"120 feet","cp":"V, S","du":"Instantaneous","d":"Choose one creature, object, or magical effect within range. Any ongoing spell of level 3 or lower on the target ends. For each ongoing spell of level 4 or higher on the target, make an ability check using your spellcasting ability (DC 10 plus that spell’s Using a Higher-Level Spell Slot. level). On a successful check, the spell ends. You automatically end a spell on the target if the spell’s level is equal to or less than the level of the spell slot you use."},"dissonant whispers":{"n":"Dissonant Whispers","m":"Level 1 Enchantment (Bard)","ct":"Action","rg":"60 feet","cp":"V","du":"Instantaneous","d":"One creature of your choice that you can see within range hears a discordant melody in its mind. The target makes a Wisdom saving throw. On a failed save, it takes 3d6 Psychic damage and must immediately use its Reaction, if available, to move as far away from you as it can, using the safest route. On a successful save, the target takes Using a Higher-Level Spell Slot. half as much damage only. The damage increases by 1d6 for each spell slot level above 1."},"divination":{"n":"Divination","m":"Level 4 Divination (Cleric, Druid, Wizard)","ct":"Action or Ritual","rg":"Self","cp":"V, S, M (incense worth 25+ GP, which the spell consumes)","du":"Instantaneous","d":"This spell puts you in contact with a god or a god’s servants. You ask one question about a specific goal, event, or activity to occur within 7 days. The GM offers a truthful reply, which might be a short phrase or cryptic rhyme. The spell doesn’t account for circumstances that might change the answer, such as the casting of other spells. If you cast the spell more than once before finishing a Long Rest, there is a cumulative 25 percent chance for each casting after the first that you get no answer."},"divine favor":{"n":"Divine Favor","m":"Level 1 Transmutation (Paladin)","ct":"Bonus Action","rg":"Self","cp":"V, S","du":"1 minute","d":"Until the spell ends, your attacks with weapons deal an extra 1d4 Radiant damage on a hit."},"divine smite":{"n":"Divine Smite","m":"Level 1 Evocation (Paladin)","ct":"Bonus Action, which you take immedi- ately after hitting a target with a Melee weapon or an Unarmed Strike","rg":"Self Component: V","cp":"","du":"Instantaneous","d":"The target takes an extra 2d8 Radiant damage from the attack. The damage increases Using a Higher-Level Spell Slot. by 1d8 if the target is a Fiend or an Undead. The damage in- creases by 1d8 for each spell slot level above 1."},"divine word":{"n":"Divine Word","m":"Level 7 Evocation (Cleric) Wish","ct":"Bonus Action","rg":"30 feet","cp":"V","du":"Instantaneous 0–20 The target dies. 21–30 The target has the Blinded, Deafened, and Stunned conditions for 1 hour. 31–40 The target has the Blinded and Deafened conditions for 10 minutes. 41–50 The target has the Deafened condition for 1 minute.","d":"You utter a word imbued with power from the Upper Planes. Each creature of your choice in range makes a Charisma saving throw. On a failed save, a target that has 50 Hit Points or fewer suffers an effect based on its current Hit Points, as shown in the Divine Word Effects table. Regardless of its Hit Points, a Celestial, an Elemental, a Fey, or a Fiend target that fails its save is forced back to its plane of origin (if it isn’t there already) and can’t return to the current plane for 24 hours by any means short of a Wish spell. Divine Word Effects Hit Points Effect 0–20 The target dies. 21–30 The target has the Blinded, Deafened, and Stunned conditions for 1 hour. 31–40 The target has the Blinded and Deafened conditions for 10 minutes. 41–50 The target has the Deafened condition for 1 minute."},"dominate beast":{"n":"Dominate Beast","m":"Level 4 Enchantment (Druid, Ranger, Sorcerer)","ct":"Action","rg":"60 feet","cp":"V, S","du":"Concentration, up to 1 minute","d":"One Beast you can see within range must succeed on a Wisdom saving throw or have the Charmed condition for the duration. The target has Advantage on the save if you or your allies are fighting it. Whenever the target takes damage, it repeats the save, ending the spell on itself on a success. You have a telepathic link with the Charmed target while the two of you are on the same plane of existence. On your turn, you can use this link to issue commands to the target (no action required), such as “Attack that creature,” “Move over there,” or “Fetch that object.” The target does its best to obey on its turn. If it completes an order and doesn’t receive further direction from you, it acts and moves as it likes, focusing on protecting itself. You can command the target to take a Reaction Using a Higher-Level Spell Slot. but must take your own Reaction to do so. Your Concentration can last longer with a spell slot of level 5 (up to 10 minutes), 6 (up to 1 hour), or 7+ (up to 8 hours)."},"dominate monster":{"n":"Dominate Monster","m":"Level 8 Enchantment (Bard, Sorcerer, Warlock, Wizard)","ct":"Action","rg":"60 feet","cp":"V, S","du":"Concentration, up to 1 hour","d":"One creature you can see within range must succeed on a Wisdom saving throw or have the Charmed condition for the duration. The target has Advantage on the save if you or your allies are fighting it. Whenever the target takes damage, it repeats the save, ending the spell on itself on a success. You have a telepathic link with the Charmed target while the two of you are on the same plane of existence. On your turn, you can use this link to issue commands to the target (no action required), such as “Attack that creature,” “Move over there,” or “Fetch that object.” The target does its best to obey on its turn. If it completes an order and doesn’t receive further direction from you, it acts and moves as it likes, focusing on protecting itself. You can command the target to take a Reaction Using a Higher-Level Spell Slot. but must take your own Reaction to do so. Your Concentration can last longer with a level 9 spell slot (up to 8 hours)."},"dominate person":{"n":"Dominate Person","m":"Level 5 Enchantment (Bard, Sorcerer, Wizard)","ct":"Action","rg":"60 feet","cp":"V, S","du":"Concentration, up to 1 minute","d":"One Humanoid you can see within range must succeed on a Wisdom saving throw or have the Charmed condition for the duration. The target has Advantage on the save if you or your allies are fighting it. Whenever the target takes damage, it repeats the save, ending the spell on itself on a success. You have a telepathic link with the Charmed target while the two of you are on the same plane of existence. On your turn, you can use this link to issue commands to the target (no action required), such as “Attack that creature,” “Move over there,” or “Fetch that object.” The target does its best to obey on its turn. If it completes an order and doesn’t receive further direction from you, it acts and moves as it likes, focusing on protecting itself. You can command the target to take a Reaction Using a Higher-Level Spell Slot. but must take your own Reaction to do so. Your Concentration can last longer with a spell slot of level 6 (up to 10 minutes), 7 (up to 1 hour), or 8+ (up to 8 hours)."},"dragon’s breath":{"n":"Dragon’s Breath","m":"Level 2 Transmutation (Sorcerer, Wizard)","ct":"Bonus Action","rg":"Touch","cp":"V, S, M (a hot pepper)","du":"Concentration, up to 1 minute","d":"You touch one willing creature, and choose Acid, Cold, Fire, Lightning, or Poison. Until the spell ends, the target can take a Magic action to exhale a 15-foot Cone. Each creature in that area makes a Dexterity saving throw, taking 3d6 damage of the chosen type on a failed save or half as much damage on a successful one. Using a Higher-Level Spell Slot. The damage in- creases by 1d6 for each spell slot level above 2."},"dream":{"n":"Dream","m":"Level 5 Illusion (Bard, Warlock, Wizard)","ct":"1 minute","rg":"Special","cp":"V, S, M (a handful of sand)","du":"8 hours","d":"You target a creature you know on the same plane of existence. You or a willing creature you touch enters a trance state to act as a dream messenger. While in the trance, the messenger is Incapacitated and has a Speed of 0. If the target is asleep, the messenger appears in the target’s dreams and can converse with the target as long as it remains asleep, through the spell’s duration. The messenger can also shape the dream’s environment, creating landscapes, objects, and other images. The messenger can emerge from the trance at any time, ending the spell. The target recalls the dream perfectly upon waking. If the target is awake when you cast the spell, the messenger knows it and can either end the trance (and the spell) or wait for the target to sleep, at which point the messenger enters its dreams. You can make the messenger terrifying to the target. If you do so, the messenger can deliver a message of no more than ten words, and then the target makes a Wisdom saving throw. On a failed save, the target gains no benefit from its rest, and it takes 3d6 Psychic damage when it wakes up."},"druidcraft":{"n":"Druidcraft","m":"Transmutation Cantrip (Druid)","ct":"Action","rg":"30 feet","cp":"V, S","du":"Instantaneous","d":"Whispering to the spirits of nature, you create one Weather Sensor. of the following effects within range. You create a Tiny, harmless sensory effect that predicts what the weather will be at your location for the next 24 hours. The effect might manifest as a golden orb for clear skies, a cloud for rain, falling snowflakes for snow, and so on. This Bloom. effect persists for 1 round. You instantly make a flower blossom, a Sensory Effect. seed pod open, or a leaf bud bloom. You create a harmless sensory effect, such as falling leaves, spectral dancing fairies, a gentle breeze, the sound of an animal, or the faint Fire Play. odor of skunk. The effect must fit in a 5-foot Cube. You light or snuff out a candle, a torch, or a campfire."},"earthquake":{"n":"Earthquake","m":"Level 8 Transmutation (Cleric, Druid, Sorcerer)","ct":"Action","rg":"500 feet","cp":"V, S, M (a fractured rock)","du":"Concentration, up to 1 minute","d":"Choose a point on the ground that you can see within range. For the duration, an intense tremor rips through the ground in a 100-foot-radius circle centered on that point. The ground there is Difficult Terrain. When you cast this spell and at the end of each of your turns for the duration, each creature on the ground in the area makes a Dexterity saving throw. On a failed save, a creature has the Prone condition, and its Concentration is broken. Fissures. You can also cause the effects below. A total of 1d6 fissures open in the spell’s area at the end of the turn you cast it. You choose the fissures’ locations, which can’t be under structures. Each fissure is 1d10 × 10 feet deep and 10 feet wide, and it extends from one edge of the spell’s area to another edge. A creature in the same space as a fissure must succeed on a Dexterity saving throw or fall in. A creature that successfully saves Structures. moves with the fissure’s edge as it opens. The tremor deals 50 Bludgeoning damage to any structure in contact with the ground in the area when you cast the spell and at the end of each of your turns until the spell ends. If a structure drops to 0 Hit Points, it collapses. A creature within a distance from a collapsing structure equal to half the structure’s height makes a Dexterity saving throw. On a failed save, the creature takes 12d6 Bludgeoning damage, has the Prone condition, and is buried in the rubble, requiring a DC 20 Strength (Athletics) check as an action to escape. On a successful save, the creature takes half as much damage only."},"eldritch blast":{"n":"Eldritch Blast","m":"Evocation Cantrip (Warlock)","ct":"Action","rg":"120 feet","cp":"V, S","du":"Instantaneous","d":"You hurl a beam of crackling energy. Make a ranged spell attack against one creature or object in range. Cantrip Upgrade. On a hit, the target takes 1d10 Force damage. The spell creates two beams at level 5, three beams at level 11, and four beams at level 17. You can direct the beams at the same target or at different ones. Make a separate attack roll for each beam."},"elementalism":{"n":"Elementalism","m":"Transmutation Cantrip (Druid, Sorcerer, Wizard)","ct":"Action","rg":"30 feet","cp":"V, S","du":"Instantaneous","d":"You exert control over the elements, creating one of the following effects within range. Beckon Air. You create a breeze strong enough to ripple cloth, stir dust, rustle leaves, and close open doors and shutters, all in a 5-foot Cube. Doors and shutters being held open by someone or something Beckon Earth. aren’t affected. You create a thin shroud of dust or sand that covers surfaces in a 5-foot-square area, or you cause a single word to appear in your handwriting in a patch of dirt or sand. Beckon Fire. You create a thin cloud of harmless embers and colored, scented smoke in a 5-foot Cube. You choose the color and scent, and the embers can light candles, torches, or lamps in that area. The Beckon Water. smoke’s scent lingers for 1 minute. You create a spray of cool mist that lightly dampens creatures and objects in a 5-foot Cube. Alternatively, you create 1 cup of clean water either in an open container or on a surface, and the Sculpt Element. water evaporates in 1 minute. You cause dirt, sand, fire, smoke, mist, or water that can fit in a 1-foot Cube to assume a crude shape (such as that of a creature) for 1 hour."},"enhance ability":{"n":"Enhance Ability","m":"Level 2 Transmutation (Bard, Cleric, Druid, Ranger, Sorcerer, Wizard)","ct":"Action","rg":"Touch","cp":"V, S, M (fur or a feather)","du":"Concentration, up to 1 hour","d":"You touch a creature and choose Strength, Dexterity, Intelligence, Wisdom, or Charisma. For the duration, the target has Advantage on ability checks Using a Higher-Level Spell Slot. using the chosen ability. You can target one additional creature for each spell slot level above 2. You can choose a different ability for each target."},"enlarge/reduce":{"n":"Enlarge/Reduce","m":"Level 2 Transmutation (Bard, Druid, Sorcerer, Wizard)","ct":"Action","rg":"30 feet","cp":"V, S, M (a pinch of powdered iron)","du":"Concentration, up to 1 minute","d":"For the duration, the spell enlarges or reduces a creature or an object you can see within range (see the chosen effect below). A targeted object must be neither worn nor carried. If the target is an unwilling creature, it can make a Constitution saving throw. On a successful save, the spell has no effect. Everything that a targeted creature is wearing and carrying changes size with it. Any item it drops returns to normal size at once. A thrown weapon or piece of ammunition returns to normal size immediately after it hits or misses a target. Enlarge. The target’s size increases by one category—from Medium to Large, for example. The target also has Advantage on Strength checks and Strength saving throws. The target’s attacks with its enlarged weapons or Unarmed Strikes deal an extra 1d4 damage on a hit. Reduce. The target’s size decreases by one category—from Medium to Small, for example. The target also has Disadvantage on Strength checks and Strength saving throws. The target’s attacks with its reduced weapons or Unarmed Strikes deal 1d4 less damage on a hit (this can’t reduce the damage below 1)."},"ensnaring strike":{"n":"Ensnaring Strike","m":"Level 1 Conjuration (Ranger)","ct":"Bonus Action, which you take immedi- ately after hitting a creature with a weapon","rg":"Self","cp":"V","du":"Concentration, up to 1 minute","d":"As you hit the target, grasping vines appear on it, and it makes a Strength saving throw. A Large or larger creature has Advantage on this save. On a failed save, the target has the Restrained condition until the spell ends. On a successful save, the vines shrivel away, and the spell ends. While Restrained, the target takes 1d6 Piercing damage at the start of each of its turns. The target or a creature within reach of it can take an action to make a Strength (Athletics) check against your spell Using a Higher-Level Spell Slot. save DC. On a success, the spell ends. The damage in- creases by 1d6 for each spell slot level above 1."},"entangle":{"n":"Entangle","m":"Level 1 Conjuration (Druid, Ranger)","ct":"Action","rg":"90 feet","cp":"V, S","du":"Concentration, up to 1 minute","d":"Grasping plants sprout from the ground in a 20-foot square within range. For the duration, these plants turn the ground in the area into Difficult Terrain. They disappear when the spell ends. Each creature (other than you) in the area when you cast the spell must succeed on a Strength saving throw or have the Restrained condition until the spell ends. A Restrained creature can take an action to make a Strength (Athletics) check against your spell save DC. On a success, it frees itself from the grasping plants and is no longer Restrained by them."},"enthrall":{"n":"Enthrall","m":"Level 2 Enchantment (Bard, Warlock)","ct":"Action","rg":"60 feet","cp":"V, S","du":"Concentration, up to 1 minute","d":"You weave a distracting string of words, causing creatures of your choice that you can see within range to make a Wisdom saving throw. Any creature you or your companions are fighting automatically succeeds on this save. On a failed save, a target has a −10 penalty to Wisdom (Perception) checks and Passive Perception until the spell ends."},"etherealness":{"n":"Etherealness","m":"Level 7 Conjuration (Bard, Cleric, Sorcerer, Warlock, Wizard)","ct":"Action","rg":"Self","cp":"V, S","du":"Up to 8 hours","d":"You step into the border regions of the Ethereal Plane, where it overlaps with your current plane. You remain in the Border Ethereal for the duration. During this time, you can move in any direction. If you move up or down, every foot of movement costs an extra foot. You can perceive the plane you left, which looks gray, and you can’t see anything there more than 60 feet away. While on the Ethereal Plane, you can affect and be affected only by creatures, objects, and effects on that plane. Creatures that aren’t on the Ethereal Plane can’t perceive or interact with you unless a feature gives them the ability to do so. When the spell ends, you return to the plane you left in the spot that corresponds to your space in the Border Ethereal. If you appear in an occupied space, you are shunted to the nearest unoccupied space and take Force damage equal to twice the number of feet you are moved. This spell ends instantly if you cast it while you are on the Ethereal Plane or a plane that doesn’t Using a Higher-Level Spell Slot. border it, such as one of the Outer Planes. You can target up to three willing creatures (including yourself) for each spell slot level above 7. The creatures must be within 10 feet of you when you cast the spell."},"expeditious retreat":{"n":"Expeditious Retreat","m":"Level 1 Transmutation (Sorcerer, Warlock, Wizard)","ct":"Bonus Action","rg":"Self","cp":"V, S","du":"Concentration, up to 10 minutes","d":"You take the Dash action, and until the spell ends, you can take that action again as a Bonus Action."},"eyebite":{"n":"Eyebite","m":"Level 6 Necromancy (Bard, Sorcerer, Warlock, Wizard)","ct":"Action","rg":"Self","cp":"V, S","du":"Concentration, up to 1 minute","d":"For the duration, your eyes become an inky void. One creature of your choice within 60 feet of you that you can see must succeed on a Wisdom saving throw or be affected by one of the following effects of your choice for the duration. On each of your turns until the spell ends, you can take a Magic action to target another creature but can’t target a creature again if it has succeeded on a Asleep. save against this casting of the spell. The target has the Unconscious condition. It wakes up if it takes any damage or if another Panicked. creature takes an action to shake it awake. The target has the Frightened condition. On each of its turns, the Frightened target must take the Dash action and move away from you by the safest and shortest route available. If the target moves to a space at least 60 feet away from you Sickened. where it can’t see you, this effect ends."},"fabricate":{"n":"Fabricate","m":"Level 4 Transmutation (Wizard)","ct":"10 minutes","rg":"120 feet","cp":"V, S","du":"Instantaneous","d":"The target has the Poisoned condition. You convert raw materials into products of the same material. For example, you can fabricate a wooden bridge from a clump of trees, a rope from a patch of hemp, or clothes from flax or wool. Choose raw materials that you can see within range. You can fabricate a Large or smaller object (contained within a 10-foot Cube or eight connected 5-foot Cubes) given a sufficient quantity of material. If you’re working with metal, stone, or another mineral substance, however, the fabricated object can be no larger than Medium (contained within a 5-foot Cube). The quality of any fabricated objects is based on the quality of the raw materials. Creatures and magic items can’t be created by this spell. You also can’t use it to create items that require a high degree of skill—such as weapons and armor—unless you have proficiency with the type of Artisan’s Tools used to craft such objects."},"faerie fire":{"n":"Faerie Fire","m":"Level 1 Evocation (Bard, Druid)","ct":"Action","rg":"60 feet","cp":"V","du":"Concentration, up to 1 minute","d":"Objects in a 20-foot Cube within range are outlined in blue, green, or violet light (your choice). Each creature in the Cube is also outlined if it fails a Dexterity saving throw. For the duration, objects and affected creatures shed Dim Light in a 10-foot radius and can’t benefit from the Invisible condition. Attack rolls against an affected creature or object have Advantage if the attacker can see it."},"faithful hound":{"n":"Faithful Hound","m":"Level 4 Conjuration (Wizard)","ct":"Action","rg":"30 feet","cp":"V, S, M (a silver whistle)","du":"8 hours","d":"You conjure a phantom watchdog in an unoccupied space that you can see within range. The hound remains for the duration or until the two of you are more than 300 feet apart from each other. No one but you can see the hound, and it is intangible and invulnerable. When a Small or larger creature comes within 30 feet of it without first speaking the password that you specify when you cast this spell, the hound starts barking loudly. The hound has Truesight with a range of 30 feet. At the start of each of your turns, the hound attempts to bite one enemy within 5 feet of it. That enemy must succeed on a Dexterity saving throw or take 4d8 Force damage. On your later turns, you can take a Magic action to move the hound up to 30 feet."},"false life":{"n":"False Life","m":"Level 1 Necromancy (Sorcerer, Wizard)","ct":"Action","rg":"Self","cp":"V, S, M (a drop of alcohol)","du":"Instantaneous","d":"Using a Higher-Level Spell Slot. You gain 2d4 + 4 Temporary Hit Points. You gain 5 additional Temporary Hit Points for each spell slot level above 1."},"fear":{"n":"Fear","m":"Level 3 Illusion (Bard, Sorcerer, Warlock, Wizard)","ct":"Action","rg":"Self","cp":"V, S, M (a white feather)","du":"Concentration, up to 1 minute","d":"Each creature in a 30-foot Cone must succeed on a Wisdom saving throw or drop whatever it is holding and have the Frightened condition for the duration. A Frightened creature takes the Dash action and moves away from you by the safest route on each of its turns unless there is nowhere to move. If the creature ends its turn in a space where it doesn’t have line of sight to you, the creature makes a Wisdom saving throw. On a successful save, the spell ends on that creature."},"feather fall":{"n":"Feather Fall","m":"Level 1 Transmutation (Bard, Sorcerer, Wizard)","ct":"Reaction, which you take when you or a creature you can see within 60 feet of you falls","rg":"60 feet","cp":"V, M (a small feather or piece of down)","du":"1 minute","d":"Choose up to five falling creatures within range. A falling creature’s rate of descent slows to 60 feet per round until the spell ends. If a creature lands before the spell ends, the creature takes no damage from the fall, and the spell ends for that creature."},"find familiar":{"n":"Find Familiar","m":"Level 1 Conjuration (Wizard)","ct":"1 hour or Ritual","rg":"10 feet","cp":"V, S, M (burning incense worth 10+ GP, which the spell consumes)","du":"Instantaneous","d":"Bat, Cat, Frog, Hawk, You gain the service of a familiar, a spirit that takes Lizard, Octopus, Owl, Rat, Raven, Spider, Weasel, an animal form you choose: or another Beast that has a Challenge Rating of 0. Appearing in an unoccupied space within range, the familiar has the statistics of the chosen form (see “Monsters”), though it is a Celestial, Fey, or Fiend (your choice) instead of a Beast. Your familiar acts Telepathic Connection. independently of you, but it obeys your commands. While your familiar is within 100 feet of you, you can communicate with it telepathically. Additionally, as a Bonus Action, you can see through the familiar’s eyes and hear what it hears until the start of your next turn, gaining the benefits of any special senses it has. Finally, when you cast a spell with a range of touch, your familiar can deliver the touch. Your familiar must be within 100 feet of you, and it must take a Reaction to deliver the touch when you cast Combat. the spell. The familiar is an ally to you and your allies. It rolls its own Initiative and acts on its own turn. A familiar can’t attack, but it can take other Disappearance of the Familiar. actions as normal. When the familiar drops to 0 Hit Points, it disappears. It reappears after you cast this spell again. As a Magic action, you can temporarily dismiss the familiar to a pocket dimension. Alternatively, you can dismiss it forever. As a Magic action while it is temporarily dismissed, you can cause it to reappear in an unoccupied space within 30 feet of you. Whenever the familiar drops to 0 Hit Points or disappears into the pocket dimension, it leaves behind in its space anything it was One Familiar Only. wearing or carrying. You can’t have more than one familiar at a time. If you cast this spell while you have a familiar, you instead cause it to adopt a new eligible form."},"find steed":{"n":"Find Steed","m":"Level 2 Conjuration (Paladin)","ct":"Action","rg":"30 feet Component: V, S","cp":"","du":"Instantaneous Life Bond. When you regain Hit Points from a level 1+ spell, the steed regains the same number of Hit Points if you’re within 5 feet of it. Otherworldly Slam. Melee Attack Roll: Bonus equals your spell attack modifier, reach 5 ft. Hit: 1d8 plus the spell’s level of Radiant (Celestial), Psychic (Fey), or Ne- crotic (Fiend) damage. Fell Glare (Fiend Only; Recharges after a Long Rest). Wisdom Saving Throw: DC equals your spell save DC, one creature within 60 feet the steed can see. Failure: The target has the Frightened condition until the end of your next turn. Fey Step (Fey Only; Recharges after a Long Rest). The steed teleports, along with its rider, to an unoccupied space of your choice up to 60 feet away from itself. Healing Touch (Celestial Only; Recharges after a Long Rest). One creature within 5 feet of the steed regains a number of Hit Points equal to 2d8 plus the spell’s level.","d":"You summon an otherworldly being that appears as a loyal steed in an unoccupied space of your choice within range. This creature uses the Otherworldly Steed stat block. If you already have a steed from this spell, the steed is replaced by the new one. The steed resembles a Large, rideable animal of your choice, such as a horse, a camel, a dire wolf, or an elk. Whenever you cast the spell, choose the steed’s creature type—Celestial, Fey, or Fiend— Combat. which determines certain traits in the stat block. The steed is an ally to you and your allies. In combat, it shares your Initiative count, and it functions as a controlled mount while you ride it (as defined in the rules on mounted combat). If you have the Incapacitated condition, the steed takes its turn immediately after yours and acts independently, focusing on protecting you. Disappearance of the Steed. The steed disappears if it drops to 0 Hit Points or if you die. When it disappears, it leaves behind anything it was wearing or carrying. If you cast this spell again, you decide whether you summon the steed that disappeared or a different one. Using a Higher-Level Spell Slot. Use the spell slot’s level for the spell’s level in the stat block."},"find the path":{"n":"Find the Path","m":"Level 6 Divination (Bard, Cleric, Druid)","ct":"1 minute","rg":"Self","cp":"V, S, M (a set of divination tools—such as cards or runes—worth 100+ GP)","du":"Concentration, up to 1 day","d":"You magically sense the most direct physical route to a location you name. You must be familiar with the location, and the spell fails if you name a destination on another plane of existence, a moving destination (such as a mobile fortress), or an unspecific destination (such as “a green dragon’s lair”). For the duration, as long as you are on the same plane of existence as the destination, you know how far it is and in what direction it lies. Whenever you face a choice of paths along the way there, you know which path is the most direct."},"find traps":{"n":"Find Traps","m":"Level 2 Divination (Cleric, Druid, Ranger) Alarm Glyph of Warding","ct":"Action","rg":"120 feet","cp":"V, S","du":"Instantaneous","d":"You sense any trap within range that is within line of sight. A trap, for the purpose of this spell, includes any object or mechanism that was created to cause damage or other danger. Thus, the spell would sense the or spell or a mechanical pit trap, but it wouldn’t reveal a natural weakness in the floor, an unstable ceiling, or a hidden sinkhole. This spell reveals that a trap is present but not its location. You do learn the general nature of the dan- ger posed by a trap you sense."},"finger of death":{"n":"Finger of Death","m":"Level 7 Necromancy (Sorcerer, Warlock, Wizard)","ct":"Action","rg":"60 feet","cp":"V, S","du":"Instantaneous","d":"You unleash negative energy toward a creature you can see within range. The target makes a Constitution saving throw, taking 7d8 + 30 Necrotic damage on a failed save or half as much damage on a successful one. Zombie A Humanoid killed by this spell rises at the start of your next turn as a (see “Monsters”) that follows your verbal orders."},"fireball":{"n":"Fireball","m":"Level 3 Evocation (Sorcerer, Wizard)","ct":"Action","rg":"150 feet","cp":"V, S, M (a ball of bat guano and sulfur)","du":"Instantaneous","d":"A bright streak flashes from you to a point you choose within range and then blossoms with a low roar into a fiery explosion. Each creature in a 20-foot-radius Sphere centered on that point makes a Dexterity saving throw, taking 8d6 Fire damage on a failed save or half as much damage on a successful one. Flammable objects in the area that aren’t being Using a Higher-Level Spell Slot. worn or carried start burning. The damage increases by 1d6 for each spell slot level above 3."},"fire bolt":{"n":"Fire Bolt","m":"Evocation Cantrip (Sorcerer, Wizard)","ct":"Action","rg":"120 feet","cp":"V, S","du":"Instantaneous","d":"You hurl a mote of fire at a creature or an object within range. Make a ranged spell attack against the target. On a hit, the target takes 1d10 Fire damage. A flammable object hit by this spell starts burning if Cantrip Upgrade. it isn’t being worn or carried. The damage increases by 1d10 when you reach levels 5 (2d10), 11 (3d10), and 17 (4d10)."},"fire shield":{"n":"Fire Shield","m":"Level 4 Evocation (Druid, Sorcerer, Wizard)","ct":"Action","rg":"Self","cp":"V, S, M (a bit of phosphorus or a firefly)","du":"10 minutes","d":"Wispy flames wreathe your body for the duration, shedding Bright Light in a 10-foot radius and Dim Light for an additional 10 feet. The flames provide you with a warm shield or a chill shield, as you choose. The warm shield grants you Resistance to Cold damage, and the chill shield grants you Resistance to Fire damage. In addition, whenever a creature within 5 feet of you hits you with a melee attack roll, the shield erupts with flame. The attacker takes 2d8 Fire damage from a warm shield or 2d8 Cold damage from a chill shield."},"fire storm":{"n":"Fire Storm","m":"Level 7 Evocation (Cleric, Druid, Sorcerer)","ct":"Action","rg":"150 feet","cp":"V, S","du":"Instantaneous","d":"A storm of fire appears within range. The area of the storm consists of up to ten 10-foot Cubes, which you arrange as you like. Each Cube must be contiguous with at least one other Cube. Each creature in the area makes a Dexterity saving throw, taking 7d10 Fire damage on a failed save or half as much damage on a successful one. Flammable objects in the area that aren’t being worn or carried start burning."},"flame blade":{"n":"Flame Blade","m":"Level 2 Evocation (Druid, Sorcerer)","ct":"Bonus Action","rg":"Self","cp":"V, S, M (a sumac leaf)","du":"Concentration, up to 10 minutes","d":"You evoke a fiery blade in your free hand. The blade is similar in size and shape to a scimitar, and it lasts for the duration. If you let go of the blade, it disappears, but you can evoke it again as a Bonus Action. As a Magic action, you can make a melee spell attack with the fiery blade. On a hit, the target takes Fire damage equal to 3d6 plus your spellcasting ability modifier. The flaming blade sheds Bright Light in a 10-foot Using a Higher-Level Spell Slot. radius and Dim Light for an additional 10 feet. The damage in- creases by 1d6 for each spell slot level above 2."},"flame strike":{"n":"Flame Strike","m":"Level 5 Evocation (Cleric)","ct":"Action","rg":"60 feet","cp":"V, S, M (a pinch of sulfur)","du":"Instantaneous","d":"A vertical column of brilliant fire roars down from above. Each creature in a 10-foot-radius, 40-foothigh Cylinder centered on a point within range makes a Dexterity saving throw, taking 5d6 Fire damage and 5d6 Radiant damage on a failed save or half as much damage on a successful one. Using a Higher-Level Spell Slot. The Fire damage and the Radiant damage increase by 1d6 for each spell slot level above 5."},"flaming sphere":{"n":"Flaming Sphere","m":"Level 2 Conjuration (Druid, Sorcerer, Wizard)","ct":"Action","rg":"60 feet","cp":"V, S, M (a ball of wax)","du":"Concentration, up to 1 minute","d":"You create a 5-foot-diameter sphere of fire in an unoccupied space on the ground within range. It lasts for the duration. Any creature that ends its turn within 5 feet of the sphere makes a Dexterity saving throw, taking 2d6 Fire damage on a failed save or half as much damage on a successful one. As a Bonus Action, you can move the sphere up to 30 feet, rolling it along the ground. If you move the sphere into a creature’s space, that creature makes the save against the sphere, and the sphere stops moving for the turn. When you move the sphere, you can direct it over barriers up to 5 feet tall and jump it across pits up to 10 feet wide. Flammable objects that aren’t being worn or carried start burning if touched by the sphere, and it sheds Bright Light in a 20-foot radius Using a Higher-Level Spell Slot. and Dim Light for an additional 20 feet. The damage increases by 1d6 for each spell slot level above 2."},"flesh to stone":{"n":"Flesh to Stone","m":"Level 6 Transmutation (Druid, Sorcerer, Wizard) Greater Resto- ration","ct":"Action","rg":"60 feet","cp":"V, S, M (a cockatrice feather)","du":"Concentration, up to 1 minute","d":"You attempt to turn one creature that you can see within range into stone. The target makes a Constitution saving throw. On a failed save, it has the Restrained condition for the duration. On a successful save, its Speed is 0 until the start of your next turn. Constructs automatically succeed on the save. A Restrained target makes another Constitution saving throw at the end of each of its turns. If it successfully saves against this spell three times, the spell ends. If it fails its saves three times, it is turned to stone and has the Petrified condition for the duration. The successes and failures needn’t be consecutive; keep track of both until the target collects three of a kind. If you maintain your Concentration on this spell for the entire possible duration, the target is Petrified until the condition is ended by or similar magic."},"floating disk":{"n":"Floating Disk","m":"Level 1 Conjuration (Wizard)","ct":"Action or Ritual","rg":"30 feet","cp":"V, S, M (a drop of mercury)","du":"1 hour","d":"This spell creates a circular, horizontal plane of force, 3 feet in diameter and 1 inch thick, that floats 3 feet above the ground in an unoccupied space of your choice that you can see within range. The disk remains for the duration and can hold up to 500 pounds. If more weight is placed on it, the spell ends, and everything on the disk falls to the ground. The disk is immobile while you are within 20 feet of it. If you move more than 20 feet away from it, the disk follows you so that it remains within 20 feet of you. It can move across uneven terrain, up or down stairs, slopes and the like, but it can’t cross an elevation change of 10 feet or more. For example, the disk can’t move across a 10-foot-deep pit, nor could it leave such a pit if it was created at the bottom. If you move more than 100 feet from the disk (typically because it can’t move around an obstacle to follow you), the spell ends."},"fly":{"n":"Fly","m":"Level 3 Transmutation (Sorcerer, Warlock, Wizard)","ct":"Action","rg":"Touch","cp":"V, S, M (a feather)","du":"Concentration, up to 10 minutes","d":"You touch a willing creature. For the duration, the target gains a Fly Speed of 60 feet and can hover. When the spell ends, the target falls if it is still aloft Using a Higher-Level Spell Slot. unless it can stop the fall. You can target one additional creature for each spell slot level above 3."},"fog cloud":{"n":"Fog Cloud","m":"Level 1 Conjuration (Druid, Ranger, Sorcerer, Wizard) Gust of Wind","ct":"Action","rg":"120 feet","cp":"V, S","du":"Concentration, up to 1 hour","d":"You create a 20-foot-radius Sphere of fog centered on a point within range. The Sphere is Heavily Obscured. It lasts for the duration or until a strong wind (such as one created by Gust of Wind) disperses it. Using a Higher-Level Spell Slot. The fog’s radius increases by 20 feet for each spell slot level above 1."},"forbiddance":{"n":"Forbiddance","m":"Level 6 Abjuration (Cleric)","ct":"10 minutes or Ritual","rg":"Touch","cp":"V, S, M (ruby dust worth 1,000+ GP)","du":"1 day","d":"You create a ward against magical travel that protects up to 40,000 square feet of floor space to a height of 30 feet above the floor. Gate For the duration, creatures can’t teleport into the area or use portals, such as those created by the spell, to enter the area. The spell proofs the area against planar travel, and therefore prevents creatures from accessing Plane Shift the area by way of the Astral Plane, the Ethereal Plane, the Feywild, the Shadowfell, or the spell. In addition, the spell damages types of creatures that you choose when you cast it. Choose one or more of the following: Aberrations, Celestials, Elementals, Fey, Fiends, and Undead. When a creature of a chosen type enters the spell’s area for the first time on a turn or ends its turn there, the creature takes 5d10 Radiant or Necrotic damage (your choice when you cast this spell). You can designate a password when you cast the spell. A creature that speaks the password as it enters the area Forbiddance takes no damage from the Forbiddance spell. The spell’s area can’t overlap with the area of another spell. If you cast every day for 30 days in the same location, the spell lasts until it is dispelled, and the Material components are consumed on the last casting."},"forcecage":{"n":"Forcecage","m":"Level 7 Evocation (Bard, Warlock, Wizard) Dispel Magic","ct":"Action","rg":"100 feet","cp":"V, S, M (ruby dust worth 1,500+ GP, which the spell consumes)","du":"Concentration, up to 1 hour","d":"An immobile, Invisible, Cube-shaped prison composed of magical force springs into existence around an area you choose within range. The prison can be a cage or a solid box, as you choose. A prison in the shape of a cage can be up to 20 feet on a side and is made from 1/2-inch diameter bars spaced 1/2 inch apart. A prison in the shape of a box can be up to 10 feet on a side, creating a solid barrier that prevents any matter from passing through it and blocking any spells cast into or out from the area. When you cast the spell, any creature that is completely inside the cage’s area is trapped. Creatures only partially within the area, or those too large to fit inside it, are pushed away from the center of the area until they are completely outside it. A creature inside the cage can’t leave it by nonmagical means. If the creature tries to use teleportation or interplanar travel to leave, it must first make a Charisma saving throw. On a successful save, the creature can use that magic to exit the cage. On a failed save, the creature doesn’t exit the cage and wastes the spell or effect. The cage also extends into the Ethereal Plane, blocking ethereal travel."},"foresight":{"n":"Foresight","m":"Level 9 Divination (Bard, Druid, Warlock, Wizard)","ct":"1 minute","rg":"Touch","cp":"V, S, M (a hummingbird feather)","du":"8 hours","d":"This spell can’t be dispelled by . You touch a willing creature and bestow a limited ability to see into the immediate future. For the duration, the target has Advantage on D20 Tests, and other creatures have Disadvantage on attack rolls against it."},"freedom of movement":{"n":"Freedom of Movement","m":"Level 4 Abjuration (Bard, Cleric, Druid, Ranger)","ct":"Action","rg":"Touch","cp":"V, S, M (a leather strap)","du":"1 hour","d":"The spell ends early if you cast it again. You touch a willing creature. For the duration, the target’s movement is unaffected by Difficult Terrain, and spells and other magical effects can neither reduce the target’s Speed nor cause the target to have the Paralyzed or Restrained conditions. The target also has a Swim Speed equal to its Speed. In addition, the target can spend 5 feet of movement to automatically escape from nonmagical restraints, such as manacles or a creature imposing Using a Higher-Level Spell Slot. the Grappled condition on it. You can target one additional creature for each spell slot level above 4."},"freezing sphere":{"n":"Freezing Sphere","m":"Level 6 Evocation (Sorcerer, Wizard)","ct":"Action","rg":"300 feet","cp":"V, S, M (a miniature crystal sphere)","du":"Instantaneous","d":"A frigid globe streaks from you to a point of your choice within range, where it explodes in a 60-foot-radius Sphere. Each creature in that area makes a Constitution saving throw, taking 10d6 Cold damage on failed save or half as much damage on a successful one. If the globe strikes a body of water, it freezes the water to a depth of 6 inches over an area 30 feet square. This ice lasts for 1 minute. Creatures that were swimming on the surface of frozen water are trapped in the ice and have the Restrained condition. A trapped creature can take an action to make a Strength (Athletics) check against your spell save DC to break free. You can refrain from firing the globe after completing the spell’s casting. If you do so, a globe about the size of a sling bullet, cool to the touch, appears in your hand. At any time, you or a creature you give the globe to can throw the globe (to a range of 40 feet) or hurl it with a sling (to the sling’s normal range). It shatters on impact, with the same effect as a normal casting of the spell. You can also set the globe down without shattering it. After 1 minute, if Using a Higher-Level Spell Slot. the globe hasn’t already shattered, it explodes. The damage in- creases by 1d6 for each spell slot level above 6."},"gaseous form":{"n":"Gaseous Form","m":"Level 3 Transmutation (Sorcerer, Warlock, Wizard)","ct":"Action","rg":"Touch","cp":"V, S, M (a bit of gauze)","du":"Concentration, up to 1 hour","d":"A willing creature you touch shape-shifts, along with everything it’s wearing and carrying, into a misty cloud for the duration. The spell ends on the target if it drops to 0 Hit Points or if it takes a Magic action to end the spell on itself. While in this form, the target’s only method of movement is a Fly Speed of 10 feet, and it can hover. The target can enter and occupy the space of another creature. The target has Resistance to Bludgeoning, Piercing, and Slashing damage; it has Immunity to the Prone condition; and it has Advantage on Strength, Dexterity, and Constitution saving throws. The target can pass through narrow openings, but it treats liquids as though they were solid surfaces. The target can’t talk or manipulate objects, and any objects it was carrying or holding can’t be dropped, used, or otherwise interacted with. Finally, the target can’t attack or cast spells. Using a Higher-Level Spell Slot. You can target one additional creature for each spell slot level above 3."},"gate":{"n":"Gate","m":"Level 9 Conjuration (Cleric, Sorcerer, Warlock, Wizard)","ct":"Action","rg":"60 feet","cp":"V, S, M (a diamond worth 5,000+ GP)","du":"Concentration, up to 1 minute","d":"You conjure a portal linking an unoccupied space you can see within range to a precise location on a different plane of existence. The portal is a circular opening, which you can make 5 to 20 feet in diameter. You can orient the portal in any direction you choose. The portal lasts for the duration, and the portal’s destination is visible through it. The portal has a front and a back on each plane where it appears. Travel through the portal is possible only by moving through its front. Anything that does so is instantly transported to the other plane, appearing in the unoccupied space nearest to the portal. Deities and other planar rulers can prevent portals created by this spell from opening in their presence or anywhere within their domains. When you cast this spell, you can speak the name of a specific creature (a pseudonym, title, or nickname doesn’t work). If that creature is on a plane other than the one you are on, the portal opens next to the named creature and transports it to the nearest unoccupied space on your side of the portal. You gain no special power over the creature, and it is free to act as the GM deems appropriate. It might leave, attack you, or help you."},"geas":{"n":"Geas","m":"Level 5 Enchantment (Bard, Cleric, Druid, Paladin, Wizard) Remove Curse Greater Restoration Wish","ct":"1 minute","rg":"60 feet","cp":"V","du":"30 days","d":"You give a verbal command to a creature that you can see within range, ordering it to carry out some service or refrain from an action or a course of activity as you decide. The target must succeed on a Wisdom saving throw or have the Charmed condition for the duration. The target automatically succeeds if it can’t understand your command. While Charmed, the creature takes 5d10 Psychic damage if it acts in a manner directly counter to your command. It takes this damage no more than once each day. You can issue any command you choose, short of an activity that would result in certain death. Should you issue a suicidal command, the spell ends. A , , or spell Using a Higher-Level Spell Slot. ends this spell. If you use a level 7 or 8 spell slot, the duration is 365 days. If you use a level 9 spell slot, the spell lasts until it is ended by one of the spells mentioned above."},"gentle repose":{"n":"Gentle Repose","m":"Level 2 Necromancy (Cleric, Paladin, Wizard) Raise Dead","ct":"Action or Ritual","rg":"Touch","cp":"V, S, M (2 Copper Pieces, which the spell consumes)","du":"10 days","d":"You touch a corpse or other remains. For the duration, the target is protected from decay and can’t become Undead. The spell also effectively extends the time limit on raising the target from the dead, since days spent under the influence of this spell don’t count against the time limit of spells such as ."},"giant insect":{"n":"Giant Insect","m":"Level 4 Conjuration (Druid)","ct":"Action","rg":"60 feet","cp":"V, S","du":"Concentration, up to 10 minutes Spider Climb. The insect can climb difficult surfaces, including along ceilings, without needing to make an ability check. Multiattack. The insect makes a number of attacks equal to half this spell’s level (round down). Poison Jab. Melee Attack Roll: Bonus equals your spell attack modifier, reach 10 ft. Hit: 1d6 + 3 plus the spell’s level Piercing damage plus 1d4 Poison damage. Web Bolt (Spider Only). Ranged Attack Roll: Bonus equals your spell attack modifier, range 60 ft. Hit: 1d10 + 3 plus the spell’s level Bludgeoning damage, and the target’s Speed is reduced to 0 until the start of the in- sect’s next turn. Venomous Spew (Centipede Only). Constitution Saving Throw: Your spell save DC, one creature the insect can see within 10 feet. Failure: The target has the Poisoned condition until the start of the insect’s next turn.","d":"You summon a giant centipede, spider, or wasp (chosen Giant when you Insect cast the spell). It manifests in an unoccupied space you can see within range and uses the stat block. The form you choose determines certain details in its stat block. The creature disappears when it drops to 0 Hit Points or when the spell ends. The creature is an ally to you and your allies. In combat, the creature shares your Initiative count, but it takes its turn immediately after yours. It obeys your verbal commands (no action required by you). If you don’t issue any, it takes the Dodge action and uses its movement to avoid danger. Using a Higher-Level Spell Slot. Use the spell slot’s level for the spell’s level in the stat block."},"glibness":{"n":"Glibness","m":"Level 8 Enchantment (Bard, Warlock)","ct":"Action","rg":"Self","cp":"V","du":"1 hour","d":"Until the spell ends, when you make a Charisma check, you can replace the number you roll with a 15. Additionally, no matter what you say, magic that would determine if you are telling the truth indi- cates that you are being truthful."},"globe of invulnerability":{"n":"Globe of Invulnerability","m":"Level 6 Abjuration (Sorcerer, Wizard)","ct":"Action","rg":"Self","cp":"V, S, M (a glass bead)","du":"Concentration, up to 1 minute","d":"An immobile, shimmering barrier appears in a 10foot Emanation around you and remains for the duration. Any spell of level 5 or lower cast from outside the barrier can’t affect anything within it. Such a spell can target creatures and objects within the barrier, but the spell has no effect on them. Similarly, the area within the barrier is excluded from areas of effect created by such spells. Using a Higher-Level Spell Slot. The barrier blocks spells of 1 level higher for each spell slot level above 6."},"glyph of warding":{"n":"Glyph of Warding","m":"Level 3 Abjuration (Bard, Cleric, Wizard) Glyph of Warding","ct":"1 hour","rg":"Touch","cp":"V, S, M (powdered diamond worth 200+ GP, which the spell consumes)","du":"Until dispelled or triggered","d":"You inscribe a glyph that later unleashes a magical effect. You inscribe it either on a surface (such as a table or a section of floor) or within an object that can be closed (such as a book or chest) to conceal the glyph. The glyph can cover an area no larger than 10 feet in diameter. If the surface or object is moved more than 10 feet from where you cast this spell, the glyph is broken, and the spell ends without being triggered. The glyph is nearly imperceptible and requires a successful Wisdom (Perception) check against your spell save DC to notice. When you inscribe the glyph, you set its trigger and choose whether it’s an explosive rune or a spell glyph, as explained below. Set the Trigger. You decide what triggers the glyph when you cast the spell. For glyphs inscribed on a surface, common triggers include touching or stepping on the glyph, removing another object covering it, or approaching within a certain distance of it. For glyphs inscribed within an object, common triggers include opening that object or seeing the glyph. Once a glyph is triggered, this spell ends. You can refine the trigger so that only creatures of certain types activate it (for example, the glyph could be set to affect Aberrations). You can also set conditions for creatures that don’t trigger the glyph, such as those who say a certain password. Explosive Rune. When triggered, the glyph erupts with magical energy in a 20-foot-radius Sphere centered on the glyph. Each creature in the area makes a Dexterity saving throw. A creature takes 5d8 Acid, Cold, Fire, Lightning, or Thunder damage (your choice when you create the glyph) on a failed save or half as much damage on a successful one. Spell Glyph. You can store a prepared spell of level 3 or lower in the glyph by casting it as part of creating the glyph. The spell must target a single creature or an area. The spell being stored has no immediate effect when cast in this way. When the glyph is triggered, the stored spell takes effect. If the spell has a target, it targets the creature that triggered the glyph. If the spell affects an area, the area is centered on that creature. If the spell summons Hostile creatures or creates harmful objects or traps, they appear as close as possible to the intruder and attack it. If the spell requires Concentration, it lasts until the end of its full duration. Using a Higher-Level Spell Slot. The damage of an explosive rune increases by 1d8 for each spell slot level above 3. If you create a spell glyph, you can store any spell of up to the same level as the spell slot you use for the Glyph of Warding. A creature you touch has the Invisible condition until the spell ends. Goodberry • 1 Exhaustion level • The Charmed or Petrified condition • A curse, including the target’s Attunement to a cursed magic item • Any reduction to one of the target’s ability scores • Any reduction to the target’s Hit Point maximum"},"goodberry":{"n":"Goodberry","m":"Level 1 Conjuration (Druid, Ranger)","ct":"Action","rg":"Self","cp":"V, S, M (a sprig of mistletoe)","du":"24 hours","d":"Ten berries appear in your hand and are infused with magic for the duration. A creature can take a Bonus Action to eat one berry. Eating a berry restores 1 Hit Point, and the berry provides enough nourishment to sustain a creature for one day."},"grease":{"n":"Grease","m":"Level 1 Conjuration (Sorcerer, Wizard)","ct":"Action","rg":"60 feet","cp":"V, S, M (a bit of pork rind or butter)","du":"1 minute","d":"Uneaten berries disappear when the spell ends. Nonflammable grease covers the ground in a 10foot square centered on a point within range and turns it into Difficult Terrain for the duration. When the grease appears, each creature standing in its area must succeed on a Dexterity saving throw or have the Prone condition. A creature that enters the area or ends its turn there must also suc- ceed on that save or fall Prone."},"greater invisibility":{"n":"Greater Invisibility","m":"Level 4 Illusion (Bard, Sorcerer, Wizard)","ct":"Action","rg":"Touch","cp":"V, S","du":"Concentration, up to 1 minute","d":"A creature you touch has the Invisible condition un- til the spell ends."},"greater restoration":{"n":"Greater Restoration","m":"Level 5 Abjuration (Bard, Cleric, Druid, Paladin, Ranger)","ct":"Action","rg":"Touch","cp":"V, S, M (diamond dust worth 100+ GP, which the spell consumes)","du":"Instantaneous","d":"You touch a creature and magically remove one of the following effects from it: • 1 Exhaustion level • The Charmed or Petrified condition • A curse, including the target’s Attunement to a cursed magic item • Any reduction to one of the target’s ability scores • Any reduction to the target’s Hit Point maximum"},"guardian of faith":{"n":"Guardian of Faith","m":"Level 4 Conjuration (Cleric)","ct":"Action","rg":"30 feet","cp":"V","du":"8 hours","d":"A Large spectral guardian appears and hovers for the duration in an unoccupied space that you can see within range. The guardian occupies that space and is invulnerable, and it appears in a form appropriate for your deity or pantheon. Any enemy that moves to a space within 10 feet of the guardian for the first time on a turn or starts its turn there makes a Dexterity saving throw, taking 20 Radiant damage on a failed save or half as much damage on a successful one. The guardian vanishes when it has dealt a total of 60 damage."},"guards and wards":{"n":"Guards and Wards","m":"Level 6 Abjuration (Bard, Wizard) Dispel Magic Guards and Wards Guards and Wards Arcane Lock Web Guards and Wards Dancing Lights Guards and Wards Magic Mouth Stinking Cloud Guards and Wards Gust of Wind Suggestion","ct":"1 hour","rg":"Touch V, S, M (a silver rod worth 10+ GP)","cp":"","du":"24 hours","d":"You create a ward that protects up to 2,500 square feet of floor space. The warded area can be up to 20 feet tall, and you shape it as one 50-foot square, one hundred 5-foot squares that are contiguous, or twenty-five 10-foot squares that are contiguous. When you cast this spell, you can specify individuals that are unaffected by the spell’s effects. You can also specify a password that, when spoken aloud within 5 feet of the warded area, makes the speaker immune to its effects. The spell creates the effects below within the warded area. Dispel Magic has no effect on Guards and Wards itself, but each of the following effects can be dispelled. If all four are dispelled, Guards and Wards ends. If you cast the spell every day for 365 days on the same area, the spell thereafter lasts until all its effects are dispelled. Corridors. Fog fills all the warded corridors, making them Heavily Obscured. In addition, at each intersection or branching passage offering a choice of direction, there is a 50 percent chance that a creature other than you believes it is going in the opposite direction from the one it chooses. Doors. All doors in the warded area are magically locked, as if sealed by the Arcane Lock spell. In addition, you can cover up to ten doors with an illusion to make them appear as plain sections of wall. Stairs. Webs fill all stairs in the warded area from top to bottom, as in the Web spell. These strands regrow in 10 minutes if they are destroyed while Guards and Wards lasts. Other Spell Effect. Place one of the following magical effects within the warded area: • Dancing Lights in four corridors, with a simple program that the lights repeat as long as Guards and Wards lasts • Magic Mouth in two locations • Stinking Cloud in two locations (the vapors return within 10 minutes if dispersed while Guards and Wards lasts) • Gust of Wind in one corridor or room (the wind blows continuously while the spell lasts) • Suggestion in one 5-foot square; any creature that enters that square receives the suggestion mentally"},"guidance":{"n":"Guidance","m":"Divination Cantrip (Cleric, Druid)","ct":"Action","rg":"Touch Component: V, S","cp":"","du":"Concentration, up to 1 minute","d":"Until the spell ends, the creature adds 1d4 to any ability check using the chosen skill."},"guiding bolt":{"n":"Guiding Bolt","m":"Level 1 Evocation (Cleric)","ct":"Action 120 feet","rg":"","cp":"V, S","du":"1 round","d":"You hurl a bolt of light toward a creature within range. Make a ranged spell attack against the target. On a hit, it takes 4d6 Radiant damage, and the next attack roll made against it before the end of your next turn has Advantage. Using a Higher-Level Spell Slot. The damage in- creases by 1d6 for each spell slot level above 1."},"gust of wind":{"n":"Gust of Wind","m":"Level 2 Evocation (Druid, Ranger, Sorcerer, Wizard)","ct":"Action","rg":"Self","cp":"V, S, M (a legume seed)","du":"Concentration, up to 1 minute","d":"A Line of strong wind 60 feet long and 10 feet wide blasts from you in a direction you choose for the duration. Each creature in the Line must succeed on a Strength saving throw or be pushed 15 feet away from you in a direction following the Line. A creature that ends its turn in the Line must make the same save. Any creature in the Line must spend 2 feet of movement for every 1 foot it moves when moving closer to you. The gust disperses gas or vapor, and it extinguishes candles and similar unprotected flames in the area. It causes protected flames, such as those of lanterns, to dance wildly and has a 50 percent chance to extinguish them. As a Bonus Action on your later turns, you can change the direction in which the Line blasts from you."},"hallow":{"n":"Hallow","m":"Level 5 Abjuration (Cleric)","ct":"24 hours","rg":"Touch","cp":"V, S, M (incense worth 1,000+ GP, which the spell consumes)","du":"Until dispelled","d":"You touch a point and infuse an area around it with holy or unholy power. The area can Hallow have a radius up to 60 feet, and the spell fails if the radius includes an Hallowed area already Ward. under the effect of . The affected area has the following effects. Choose any of these creature types: Aberration, Celestial, Elemental, Fey, Fiend, or Undead. Creatures of the chosen types can’t willingly enter the area, and any creature that is possessed by or that has the Charmed or Frightened Extra condition Effect. from such creatures isn’t possessed, Charmed, or Frightened by them while in the area. You bind an extra effect to the area Courage. from the list below: Creatures of any types you choose can’t Darkness. gain the Frightened condition while in the area. Darkness fills the area. Normal light, as well as magical light created by spells of a level lower than this spell, can’t illuminate the area. Daylight. Bright light fills the area. Magical Darkness created by spells of a level lower than this Peaceful Rest. spell can’t extinguish the light. Dead bodies interred in the area Extradimensional Interference. can’t be turned into Undead. Creatures of any types you choose can’t enter or exit the area using Fear. teleportation or interplanar travel. Creatures of any types you choose have the Resistance. Frightened condition while in the area. Creatures of any types you choose have Resistance to one damage type of your choice Silence. while in the area. No sound can emanate from within the Tongues. area, and no sound can reach into it. Creatures of any types you choose can communicate with any other creature in the area Vulnerability. even if they don’t share a common language. Creatures of any types you choose have Vulnerability to one damage type of your choice while in the area."},"hallucinatory terrain":{"n":"Hallucinatory Terrain","m":"Level 4 Illusion (Bard, Druid, Warlock, Wizard)","ct":"10 minutes","rg":"300 feet","cp":"V, S, M (a mushroom)","du":"24 hours","d":"You make natural terrain in a 150-foot Cube in range look, sound, and smell like another sort of natural terrain. Thus, open fields or a road can be made to resemble a swamp, hill, crevasse, or some other difficult or impassable terrain. A pond can be made to seem like a grassy meadow, a precipice like a gentle slope, or a rock-strewn gully like a wide and smooth road. Manufactured structures, equipment, and creatures within the area aren’t changed. The tactile characteristics of the terrain are unchanged, so creatures entering the area are likely to notice the illusion. If the difference isn’t obvious by touch, a creature examining the illusion can take the Study action to make an Intelligence (Investigation) check against your spell save DC to disbelieve it. If a creature discerns that the terrain is illusory, the creature sees a vague image superimposed on the real terrain."},"harm":{"n":"Harm","m":"Level 6 Necromancy (Cleric)","ct":"Action","rg":"60 feet","cp":"V, S","du":"Instantaneous","d":"You unleash virulent magic on a creature you can see within range. The target makes a Constitution saving throw. On a failed save, it takes 14d6 Necrotic damage, and its Hit Point maximum is reduced by an amount equal to the Necrotic damage it took. On a successful save, it takes half as much damage only. This spell can’t reduce a target’s Hit Point maximum below 1."},"haste":{"n":"Haste","m":"Level 3 Transmutation (Sorcerer, Wizard)","ct":"Action","rg":"30 feet","cp":"V, S, M (a shaving of licorice root)","du":"Concentration, up to 1 minute","d":"Point maximum below 1. Choose a willing creature that you can see within range. Until the spell ends, the target’s Speed is doubled, it gains a +2 bonus to Armor Class, it has Advantage on Dexterity saving throws, and it gains an additional action on each of its turns. That action can be used to take only the Attack (one attack only), Dash, Disengage, Hide, or Utilize action. When the spell ends, the target is Incapacitated and has a Speed of 0 until the end of its next turn, as a wave of lethargy washes over it."},"heal":{"n":"Heal","m":"Level 6 Abjuration (Cleric, Druid)","ct":"Action","rg":"60 feet","cp":"V, S","du":"Instantaneous","d":"Choose a creature that you can see within range. Positive energy washes through the target, restoring 70 Hit Points. This spell also ends the Blinded, Using a Higher-Level Spell Slot. Deafened, and Poisoned conditions on the target. The healing in- creases by 10 for each spell slot level above 6."},"healing word":{"n":"Healing Word","m":"Level 1 Abjuration (Bard, Cleric, Druid)","ct":"Bonus Action","rg":"60 feet","cp":"V","du":"Instantaneous","d":"A creature of your choice that you can see within range regains Hit Points equal to 2d4 plus your spellcasting ability modifier. Using a Higher-Level Spell Slot. The healing in- creases by 2d4 for each spell slot level above 1."},"heat metal":{"n":"Heat Metal","m":"Level 2 Transmutation (Bard, Druid)","ct":"Action","rg":"60 feet","cp":"V, S, M (a piece of iron and a flame)","du":"Concentration, up to 1 minute","d":"Choose a manufactured metal object, such as a metal weapon or a suit of Heavy or Medium metal armor, that you can see within range. You cause the object to glow red-hot. Any creature in physical contact with the object takes 2d8 Fire damage when you cast the spell. Until the spell ends, you can take a Bonus Action on each of your later turns to deal this damage again if the object is within range. If a creature is holding or wearing the object and takes the damage from it, the creature must succeed on a Constitution saving throw or drop the object if it can. If it doesn’t drop the object, it has Disadvantage on attack rolls and ability checks until the start of your next turn. Using a Higher-Level Spell Slot. The damage increases by 1d8 for each spell slot level above 2."},"hellish rebuke":{"n":"Hellish Rebuke","m":"Level 1 Evocation (Warlock)","ct":"Reaction, which you take in response to taking damage from a creature that you can see within 60 feet of yourself","rg":"60 feet","cp":"V, S","du":"Instantaneous","d":"The creature that damaged you is momentarily surrounded by green flames. It makes a Dexterity saving throw, taking 2d10 Fire damage on a failed save Using a Higher-Level Spell Slot. or half as much damage on a successful one. The damage in- creases by 1d10 for each spell slot level above 1."},"heroes’ feast":{"n":"Heroes’ Feast","m":"Level 6 Conjuration (Bard, Cleric, Druid)","ct":"10 minutes","rg":"Self","cp":"V, S, M (a gem-encrusted bowl worth 1,000+ GP, which the spell consumes)","du":"Instantaneous","d":"You conjure a feast that appears on a surface in an unoccupied 10-foot Cube next to you. The feast takes 1 hour to consume and disappears at the end of that time, and the beneficial effects don’t set in until this hour is over. Up to twelve creatures can partake of the feast. A creature that partakes gains several benefits, which last for 24 hours. The creature has Resistance to Poison damage, and it has Immunity to the Frightened and Poisoned conditions. Its Hit Point maximum also increases by 2d10, and it gains the same number of Hit Points."},"heroism":{"n":"Heroism","m":"Level 1 Enchantment (Bard, Paladin)","ct":"Action","rg":"Touch","cp":"V, S","du":"Concentration, up to 1 minute","d":"A willing creature you touch is imbued with bravery. Until the spell ends, the creature is immune to the Frightened condition and gains Temporary Hit Points equal to your spellcasting ability modifier at Using a Higher-Level Spell Slot. the start of each of its turns. You can target one additional creature for each spell slot level above 1."},"hex":{"n":"Hex","m":"Level 1 Enchantment (Warlock)","ct":"Bonus Action","rg":"90 feet","cp":"V, S, M (the petrified eye of a newt)","du":"Concentration, up to 1 hour","d":"You place a curse on a creature that you can see within range. Until the spell ends, you deal an extra 1d6 Necrotic damage to the target whenever you hit it with an attack roll. Also, choose one ability when you cast the spell. The target has Disadvantage on ability checks made with the chosen ability. If the target drops to 0 Hit Points before this spell ends, you can take a Bonus Action on a later turn to curse a new creature. Using a Higher-Level Spell Slot. Your Concentration can last longer with a spell slot of level 2 (up to 4 hours), 3–4 (up to 8 hours), or 5+ (24 hours)."},"hideous laughter":{"n":"Hideous Laughter","m":"Level 1 Enchantment (Bard, Warlock, Wizard)","ct":"Action","rg":"30 feet","cp":"V, S, M (a tart and a feather)","du":"Concentration, up to 1 minute","d":"One creature of your choice that you can see within range makes a Wisdom saving throw. On a failed save, it has the Prone and Incapacitated conditions for the duration. During that time, it laughs uncontrollably if it’s capable of laughter, and it can’t end the Prone condition on itself. At the end of each of its turns and each time it takes damage, it makes another Wisdom saving throw. The target has Advantage on the save if the save is triggered by damage. On Using a Higher-Level Spell Slot. a successful save, the spell ends. You can target one additional creature for each spell slot level above 1."},"hold monster":{"n":"Hold Monster","m":"Level 5 Enchantment (Bard, Sorcerer, Warlock, Wizard)","ct":"Action","rg":"90 feet","cp":"V, S, M (a straight piece of iron)","du":"Concentration, up to 1 minute","d":"Choose a creature that you can see within range. The target must succeed on a Wisdom saving throw or have the Paralyzed condition for the duration. At the end of each of its turns, the target repeats the save, ending the spell on itself on a success. Using a Higher-Level Spell Slot. You can target one additional creature for each spell slot level above 5."},"hold person":{"n":"Hold Person","m":"Level 2 Enchantment (Bard, Cleric, Druid, Sorcerer, Warlock, Wizard)","ct":"Action","rg":"60 feet","cp":"V, S, M (a straight piece of iron)","du":"Concentration, up to 1 minute","d":"Choose a Humanoid that you can see within range. The target must succeed on a Wisdom saving throw or have the Paralyzed condition for the duration. At the end of each of its turns, the target repeats the save, ending the spell on itself on a success. Using a Higher-Level Spell Slot. You can target one additional Humanoid for each spell slot level above 2."},"holy aura":{"n":"Holy Aura","m":"Level 8 Abjuration (Cleric)","ct":"Action","rg":"Self","cp":"V, S, M (a reliquary worth 1,000+ GP)","du":"Concentration, up to 1 minute","d":"For the duration, you emit an aura in a 30-foot Emanation. While in the aura, creatures of your choice have Advantage on all saving throws, and other creatures have Disadvantage on attack rolls against them. In addition, when a Fiend or an Undead hits an affected creature with a melee attack roll, the attacker must succeed on a Constitution saving throw or have the Blinded condition until the end of its next turn."},"hunter’s mark":{"n":"Hunter’s Mark","m":"Level 1 Divination (Ranger)","ct":"Bonus Action","rg":"90 feet","cp":"V","du":"Concentration, up to 1 hour","d":"You magically mark one creature you can see within range as your quarry. Until the spell ends, you deal an extra 1d6 Force damage to the target whenever you hit it with an attack roll. You also have Advantage on any Wisdom (Perception or Survival) check you make to find it. If the target drops to 0 Hit Points before this spell ends, you can take a Bonus Action to move the mark Using a Higher-Level Spell Slot. to a new creature you can see within range. Your Concentration can last longer with a spell slot of level 3–4 (up to 8 hours) or 5+ (up to 24 hours)."},"hypnotic pattern":{"n":"Hypnotic Pattern","m":"Level 3 Illusion (Bard, Sorcerer, Warlock, Wizard)","ct":"Action","rg":"120 feet","cp":"S, M (a pinch of confetti)","du":"Concentration, up to 1 minute","d":"You create a twisting pattern of colors in a 30-foot Cube within range. The pattern appears for a moment and vanishes. Each creature in the area who can see the pattern must succeed on a Wisdom saving throw or have the Charmed condition for the duration. While Charmed, the creature has the Incapacitated condition and a Speed of 0. The spell ends for an affected creature if it takes any damage or if someone else uses an action to shake the creature out of its stupor."},"ice knife":{"n":"Ice Knife","m":"Level 1 Conjuration (Druid, Sorcerer, Wizard)","ct":"Action","rg":"60 feet","cp":"S, M (a drop of water or a piece of ice)","du":"Instantaneous","d":"You create a shard of ice and fling it at one creature within range. Make a ranged spell attack against the target. On a hit, the target takes 1d10 Piercing damage. Hit or miss, the shard then explodes. The target and each creature within 5 feet of it must succeed on a Dexterity saving throw or take 2d6 Using a Higher-Level Spell Slot. Cold damage. The Cold damage increases by 1d6 for each spell slot level above 1."},"ice storm":{"n":"Ice Storm","m":"Level 4 Evocation (Druid, Sorcerer, Wizard)","ct":"Action","rg":"300 feet","cp":"V, S, M (a mitten)","du":"Instantaneous","d":"Hail falls in a 20-foot-radius, 40-foot-high Cylinder centered on a point within range. Each creature in the Cylinder makes a Dexterity saving throw. A creature takes 2d10 Bludgeoning damage and 4d6 Cold damage on a failed save or half as much damage on a successful one. Hailstones turn ground in the Cylinder into Difficult Terrain until the end of your next turn. Using a Higher-Level Spell Slot. The Bludgeoning damage increases by 1d10 for each spell slot level above 4."},"identify":{"n":"Identify","m":"Level 1 Divination (Bard, Wizard)","ct":"1 minute or Ritual","rg":"Touch","cp":"V, S, M (a pearl worth 100+ GP)","du":"Instantaneous","d":"You touch an object throughout the spell’s casting. If the object is a magic item or some other magical object, you learn its properties and how to use them, whether it requires Attunement, and how many charges it has, if any. You learn whether any ongoing spells are affecting the item and what they are. If the item was created by a spell, you learn that spell’s name. If you instead touch a creature throughout the casting, you learn which ongoing spells, if any, are currently affecting it."},"illusory script":{"n":"Illusory Script","m":"Level 1 Illusion (Bard, Warlock, Wizard)","ct":"1 minute or Ritual","rg":"Touch","cp":"S, M (ink worth 10+ GP, which the spell consumes)","du":"10 days","d":"You write on parchment, paper, or another suitable material and imbue it with an illusion that lasts for the duration. To you and any creatures you designate when you cast the spell, the writing appears normal, seems to be written in your hand, and conveys whatever meaning you intended when you wrote the text. To all others, the writing appears as if it were written in an unknown or magical script that is unintelligible. Alternatively, the illusion can alter the meaning, handwriting, and language of the text, though the language must be one you know. If the spell is dispelled, the original script and the illusion both disappear. A creature that has Truesight can read the hidden message."},"imprisonment":{"n":"Imprisonment","m":"Level 9 Abjuration (Warlock, Wizard)","ct":"1 minute","rg":"30 feet","cp":"V, S, M (a statuette of the target worth 5,000+ GP)","du":"Until dispelled","d":"You create a magical restraint to hold a creature that you can see within range. The target must make a Wisdom saving throw. On a successful save, the target is unaffected, and it is immune to this spell for the next 24 hours. On a failed save, the target is imprisoned. While imprisoned, the target doesn’t need to breathe, eat, or drink, and it doesn’t age. Divination spells can’t locate or perceive the imprisoned target, and the target can’t teleport. Until the spell ends, the target is also affected by Burial. one of the following effects of your choice: The target is entombed beneath the earth in a hollow globe of magical force that is just large enough to contain the target. Nothing can pass Chaining. into or out of the globe. Chains firmly rooted in the ground hold the target in place. The target has the Restrained Hedged Prison. condition and can’t be moved by any means. The target is trapped in a demiplane that is warded against teleportation and planar travel. The demiplane is your choice of a Minimus Containment. labyrinth, a cage, a tower, or the like. The target becomes 1 inch tall and is trapped inside an indestructible gemstone or a similar object. Light can pass through the gemstone (allowing the target to see out and other creatures to see in), but nothing else can Slumber. pass through by any means. The target has the Unconscious condition Ending the Spell. and can’t be awoken. When you cast the spell, specify a trigger that will end it. The trigger can be as simple or as elaborate as you choose, but the GM must agree that it has a high likelihood of happening within the next decade. The trigger must be an observable action, such as someone making a particular Dispel offering Magic at the temple of your god, saving your true love, or defeating a specific monster. A spell can end the spell only if it is cast with a level 9 spell slot, targeting either the prison or the component used to create it."},"incendiary cloud":{"n":"Incendiary Cloud","m":"Level 8 Conjuration (Druid, Sorcerer, Wizard) Gust of Wind","ct":"Action","rg":"150 feet","cp":"V, S","du":"Concentration, up to 1 minute","d":"A swirling cloud of embers and smoke fills a 20-foot-radius Sphere centered on a point within range. The cloud’s area is Heavily Obscured. It lasts for the duration or until a strong wind (like that created by ) disperses it. When the cloud appears, each creature in it makes a Dexterity saving throw, taking 10d8 Fire damage on a failed save or half as much damage on a successful one. A creature must also make this save when the Sphere moves into its space and when it enters the Sphere or ends its turn there. A creature makes this save only once per turn. The cloud moves 10 feet away from you in a direc- tion you choose at the start of each of your turns."},"inflict wounds":{"n":"Inflict Wounds","m":"Level 1 Necromancy (Cleric)","ct":"Action","rg":"Touch","cp":"V, S","du":"Instantaneous","d":"A creature you touch makes a Constitution saving throw, taking 2d10 Necrotic damage on a failed save Using a Higher-Level Spell Slot. or half as much damage on a successful one. The damage in- creases by 1d10 for each spell slot level above 1."},"insect plague":{"n":"Insect Plague","m":"Level 5 Conjuration (Cleric, Druid, Sorcerer)","ct":"Action","rg":"300 feet","cp":"V, S, M (a locust)","du":"Concentration, up to 10 minutes","d":"Swarming locusts fill a 20-foot-radius Sphere centered on a point you choose within range. The Sphere remains for the duration, and its area is Lightly Obscured and Difficult Terrain. When the swarm appears, each creature in it makes a Constitution saving throw, taking 4d10 Piercing damage on a failed save or half as much damage on a successful one. A creature also makes this save when it enters the spell’s area for the first time on a turn or ends its turn there. A creature Using a Higher-Level Spell Slot. makes this save only once per turn. The damage in- creases by 1d10 for each spell slot level above 5."},"instant summons":{"n":"Instant Summons","m":"Level 6 Conjuration (Wizard)","ct":" Touch","rg":"","cp":"V, S, M (a sapphire worth 1,000+ GP)","du":"Until dispelled","d":"You touch the sapphire used in the casting and an object weighing 10 pounds or less whose longest dimension is 6 feet or less. The spell leaves an Invisible mark on that object and invisibly inscribes the object’s name on the sapphire. Each time you cast this spell, you must use a different sapphire. Thereafter, you can take a Magic action to speak the object’s name and crush the sapphire. The object instantly appears in your hand regardless of physical or planar distances, and the spell ends. If another creature is holding or carrying the object, crushing the sapphire doesn’t transport it, but instead you learn who that creature is and where that creature is currently located."},"irresistible dance":{"n":"Irresistible Dance","m":"Level 6 Enchantment (Bard, Wizard)","ct":"Action","rg":"30 feet","cp":"V","du":"Concentration, up to 1 minute","d":"One creature that you can see within range must make a Wisdom saving throw. On a successful save, the target dances comically until the end of its next turn, during which it must spend all its movement to dance in place. On a failed save, the target has the Charmed condition for the duration. While Charmed, the target dances comically, must use all its movement to dance in place, and has Disadvantage on Dexterity saving throws and attack rolls, and other creatures have Advantage on attack rolls against it. On each of its turns, the target can take an action to collect itself and repeat the save, ending the spell on itself on a success."},"invisibility":{"n":"Invisibility","m":"Level 2 Illusion (Bard, Sorcerer, Warlock, Wizard)","ct":"Action","rg":"Touch","cp":"V, S, M (an eyelash in gum arabic)","du":"Concentration, up to 1 hour","d":"A creature you touch has the Invisible condition until the spell ends. The spell ends early immediately after the target makes an attack roll, deals damage, Using a Higher-Level Spell Slot. or casts a spell. You can target one additional creature for each spell slot level above 2."},"jump":{"n":"Jump","m":"Level 1 Transmutation (Druid, Ranger, Sorcerer, Wizard)","ct":"Bonus Action","rg":"Touch Component: V, S, M (a grasshopper’s hind leg)","cp":"","du":"1 minute","d":"You touch a willing creature. Once on each of its turns until the spell ends, that creature can jump up Using a Higher-Level Spell Slot. to 30 feet by spending 10 feet of movement. You can target one additional creature for each spell slot level above 1."},"knock":{"n":"Knock","m":"Level 2 Transmutation (Bard, Sorcerer, Wizard) Arcane Lock","ct":"Action","rg":"60 feet","cp":"V","du":"Instantaneous","d":"Choose an object that you can see within range. The object can be a door, a box, a chest, a set of manacles, a padlock, or another object that contains a mundane or magical means that prevents access. A target that is held shut by a mundane lock or that is stuck or barred becomes unlocked, unstuck, or unbarred. If the object has multiple locks, only one of them is unlocked. If the target is held shut by , that spell is suppressed for 10 minutes, during which time the target can be opened and closed. When you cast the spell, a loud knock, audible up to 300 feet away, emanates from the target."},"legend lore":{"n":"Legend Lore","m":"Level 5 Divination (Bard, Cleric, Wizard)","ct":"10 minutes","rg":"Self","cp":"V, S, M (incense worth 250+ GP, which the spell consumes, and four ivory strips worth 50+ GP each)","du":"Instantaneous","d":"Name or describe a famous person, place, or object. The spell brings to your mind a brief summary of the significant lore about that famous thing, as described by the GM. The lore might consist of important details, amusing revelations, or even secret lore that has never been widely known. The more information you already know about the thing, the more precise and detailed the information you receive is. That information is accurate but might be couched in figurative language or poetry, as determined by the GM. If the famous thing you chose isn’t actually famous, you hear sad musical notes played on a trom- bone, and the spell fails."},"lesser restoration":{"n":"Lesser Restoration","m":"Level 2 Abjuration (Bard, Cleric, Druid, Paladin, Ranger)","ct":"Bonus Action","rg":"Touch","cp":"V, S","du":"Instantaneous","d":"You touch a creature and end one condition on it: Blinded, Deafened, Paralyzed, or Poisoned."},"levitate":{"n":"Levitate","m":"Level 2 Transmutation (Sorcerer, Wizard)","ct":"Action","rg":"60 feet","cp":"V, S, M (a metal spring)","du":"Concentration, up to 10 minutes","d":"Blinded, Deafened, Paralyzed, or Poisoned. One creature or loose object of your choice that you can see within range rises vertically up to 20 feet and remains suspended there for the duration. The spell can levitate an object that weighs up to 500 pounds. An unwilling creature that succeeds on a Constitution saving throw is unaffected. The target can move only by pushing or pulling against a fixed object or surface within reach (such as a wall or a ceiling), which allows it to move as if it were climbing. You can change the target’s altitude by up to 20 feet in either direction on your turn. If you are the target, you can move up or down as part of your move. Otherwise, you can take a Magic action to move the target, which must remain within the spell’s range. When the spell ends, the target floats gently to the ground if it is still aloft."},"light":{"n":"Light","m":"Evocation Cantrip (Bard, Cleric, Sorcerer, Wizard)","ct":"Action","rg":"Touch","cp":"V, M (a firefly or phosphorescent moss)","du":"1 hour","d":"You touch one Large or smaller object that isn’t being worn or carried by someone else. Until the spell ends, the object sheds Bright Light in a 20-foot radius and Dim Light for an additional 20 feet. The light can be colored as you like. Covering the object with something opaque blocks the light."},"lightning bolt":{"n":"Lightning Bolt","m":"Level 3 Evocation (Sorcerer, Wizard)","ct":"Action","rg":"Self","cp":"V, S, M (a bit of fur and a crystal rod)","du":"Instantaneous","d":"A stroke of lightning forming a 100-foot-long, 5-foot-wide Line blasts out from you in a direction you choose. Each creature in the Line makes a Dexterity saving throw, taking 8d6 Lightning damage on a failed save or half as much damage on a successful one. Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 3."},"locate animals or plants":{"n":"Locate Animals or Plants","m":"Level 2 Divination (Bard, Druid, Ranger)","ct":"Action or Ritual","rg":"Self","cp":"V, S, M (fur from a bloodhound)","du":"Instantaneous","d":"Describe or name a specific kind of Beast, Plant creature, or nonmagical plant. You learn the direction and distance to the closest creature or plant of that kind within 5 miles, if any are present."},"locate creature":{"n":"Locate Creature","m":"Level 4 Divination (Bard, Cleric, Druid, Paladin, Ranger, Wizard) Flesh to Stone Polymorph","ct":"Action","rg":"Self","cp":"V, S, M (fur from a bloodhound)","du":"Concentration, up to 1 hour","d":"Describe or name a creature that is familiar to you. You sense the direction to the creature’s location if that creature is within 1,000 feet of you. If the creature is moving, you know the direction of its movement. The spell can locate a specific creature known to you or the nearest creature of a specific kind (such as a human or a unicorn) if you have seen such a creature up close—within 30 feet—at least once. If the creature you described or named is in a different form, such as under the effects of a or spell, this spell doesn’t locate the creature. This spell can’t locate a creature if any thickness of lead blocks a direct path between you and the creature."},"locate object":{"n":"Locate Object","m":"Level 2 Divination (Bard, Cleric, Druid, Paladin, Ranger, Wizard)","ct":"Action","rg":"Self","cp":"V, S, M (a forked twig)","du":"Concentration, up to 10 minutes","d":"Describe or name an object that is familiar to you. You sense the direction to the object’s location if that object is within 1,000 feet of you. If the object is in motion, you know the direction of its movement. The spell can locate a specific object known to you if you have seen it up close—within 30 feet—at least once. Alternatively, the spell can locate the nearest object of a particular kind, such as a certain kind of apparel, jewelry, furniture, tool, or weapon. This spell can’t locate an object if any thickness of lead blocks a direct path between you and the object."},"longstrider":{"n":"Longstrider","m":"Level 1 Transmutation (Bard, Druid, Ranger, Wizard)","ct":"Action","rg":"Touch","cp":"V, S, M (a pinch of dirt)","du":"1 hour","d":"You touch a creature. The target’s Speed increases Using a Higher-Level Spell Slot. by 10 feet until the spell ends. You can target one additional creature for each spell slot level above 1."},"mage armor":{"n":"Mage Armor","m":"Level 1 Abjuration (Sorcerer, Wizard)","ct":"Action","rg":"Touch","cp":"V, S, M (a piece of cured leather)","du":"8 hours","d":"You touch a willing creature who isn’t wearing armor. Until the spell ends, the target’s base AC becomes 13 plus its Dexterity modifier. The spell ends early if the target dons armor."},"mage hand":{"n":"Mage Hand","m":"Conjuration Cantrip (Bard, Sorcerer, Warlock, Wizard)","ct":"Action","rg":"30 feet","cp":"V, S","du":"1 minute","d":"A spectral, floating hand appears at a point you choose within range. The hand lasts for the duration. The hand vanishes if it is ever more than 30 feet away from you or if you cast this spell again. When you cast the spell, you can use the hand to manipulate an object, open an unlocked door or container, stow or retrieve an item from an open container, or pour the contents out of a vial. As a Magic action on your later turns, you can control the hand thus again. As part of that action, you can move the hand up to 30 feet. The hand can’t attack, activate magic items, or carry more than 10 pounds."},"magic circle":{"n":"Magic Circle","m":"Level 3 Abjuration (Cleric, Paladin, Warlock, Wizard)","ct":"1 minute","rg":"10 feet","cp":"V, S, M (salt and powdered silver worth 100+ GP, which the spell consumes)","du":"1 hour","d":"You create a 10-foot-radius, 20-foot-tall Cylinder of magical energy centered on a point on the ground that you can see within range. Glowing runes appear wherever the Cylinder intersects with the floor or other surface. Choose one or more of the following types of creatures: Celestials, Elementals, Fey, Fiends, or Undead. The circle affects a creature of the chosen type in the following ways: • The creature can’t willingly enter the Cylinder by nonmagical means. If the creature tries to use teleportation or interplanar travel to do so, it must first succeed on a Charisma saving throw. • The creature has Disadvantage on attack rolls against targets within the Cylinder. • Targets within the Cylinder can’t be possessed by or gain the Charmed or Frightened condition from the creature. Each time you cast this spell, you can cause its magic to operate in the reverse direction, preventing a creature of the specified type from leaving the Using a Higher-Level Spell Slot. Cylinder and protecting targets outside it. The duration in- creases by 1 hour for each spell slot level above 3."},"magic jar":{"n":"Magic Jar","m":"Level 6 Necromancy (Wizard) Protection from Evil and Good Magic Circle","ct":"1 minute","rg":"Self","cp":"V, S, M (a gem, crystal, or reliquary worth 500+ GP)","du":"Until dispelled","d":"Your body falls into a catatonic state as your soul leaves it and enters the container you used for the spell’s Material component. While your soul inhabits the container, you are aware of your surroundings as if you were in the container’s space. You can’t move or take Reactions. The only action you can take is to project your soul up to 100 feet out of the container, either returning to your living body (and ending the spell) or attempting to possess a Humanoid’s body. You can attempt to possess any Humanoid within 100 feet of you that you can see (creatures warded by a or spell can’t be possessed). The target makes a Charisma saving throw. On a failed save, your soul enters the target’s body, and the target’s soul becomes trapped in the container. On a successful save, the target resists your efforts to possess it, and you can’t attempt to possess it again for 24 hours. Once you possess a creature’s body, you control it. Your Hit Points, Hit Point Dice, Strength, Dexterity, Constitution, Speed, and senses are replaced by the creature’s. You otherwise keep your game statistics. Meanwhile, the possessed creature’s soul can perceive from the container using its own senses, but it can’t move and it is Incapacitated. While possessing a body, you can take a Magic action to return from the host body to the container if it is within 100 feet of you, returning the host creature’s soul to its body. If the host body dies while you’re in it, the creature dies, and you make a Charisma saving throw against your own spellcasting DC. On a success, you return to the container if it is within 100 feet of you. Otherwise, you die. If the container is destroyed or the spell ends, your soul returns to your body. If your body is more than 100 feet away from you or if your body is dead, you die. If another creature’s soul is in the container when it is destroyed, the creature’s soul returns to its body if the body is alive and within 100 feet. Otherwise, that creature dies."},"magic missile":{"n":"Magic Missile","m":"Level 1 Evocation (Sorcerer, Wizard)","ct":"Action","rg":"120 feet","cp":"V, S","du":"Instantaneous","d":"When the spell ends, the container is destroyed. You create three glowing darts of magical force. Each dart strikes a creature of your choice that you can see within range. A dart deals 1d4 + 1 Force damage to its target. The darts all strike simultaneously, and you can direct them to hit one creature or several. Using a Higher-Level Spell Slot. The spell creates one more dart for each spell slot level above 1."},"magic mouth":{"n":"Magic Mouth","m":"Level 2 Illusion (Bard, Wizard)","ct":"1 minute or Ritual","rg":"30 feet","cp":"V, S, M (jade dust worth 10+ GP, which the spell consumes)","du":"Until dispelled","d":"You implant a message within an object in range—a message that is uttered when a trigger condition is met. Choose an object that you can see and that isn’t being worn or carried by another creature. Then speak the message, which must be 25 words or fewer, though it can be delivered over as long as 10 minutes. Finally, determine the circumstance that will trigger the spell to deliver your message. When that trigger occurs, a magical mouth appears on the object and recites the message in your voice and at the same volume you spoke. If the object you chose has a mouth or something that looks like a mouth (for example, the mouth of a statue), the magical mouth appears there, so the words appear to come from the object’s mouth. When you cast this spell, you can have the spell end after it delivers its message, or it can remain and repeat its message whenever the trigger occurs. The trigger can be as general or as detailed as you like, though it must be based on visual or audible conditions that occur within 30 feet of the object. For example, you could instruct the mouth to speak when any creature moves within 30 feet of the ob- ject or when a silver bell rings within 30 feet of it."},"magic weapon":{"n":"Magic Weapon","m":"Level 2 Transmutation (Paladin, Ranger, Sorcerer, Wizard)","ct":"Bonus Action","rg":"Touch","cp":"V, S","du":"1 hour","d":"You touch a nonmagical weapon. Until the spell ends, that weapon becomes a magic weapon with a +1 bonus to attack rolls and damage rolls. The spell Using a Higher-Level Spell Slot. ends early if you cast it again. The bonus increases to +2 with a level 3–5 spell slot. The bonus increases to +3 with a level 6+ spell slot."},"magnificent mansion":{"n":"Magnificent Mansion","m":"Level 7 Conjuration (Bard, Wizard)","ct":"1 minute","rg":"300 feet","cp":"V, S, M (a miniature door worth 15+ GP)","du":"24 hours","d":"You conjure a shimmering door in range that lasts for the duration. The door leads to an extradimensional dwelling and is 5 feet wide and 10 feet tall. You and any creature you designate when you cast the spell can enter the extradimensional dwelling as long as the door remains open. You can open or close it (no action required) if you are within 30 feet of it. While closed, the door is imperceptible. Beyond the door is a magnificent foyer with numerous chambers beyond. The dwelling’s atmosphere is clean, fresh, and warm. You can create any floor plan you like for the dwelling, but it can’t exceed 50 contiguous 10-foot Cubes. The place is furnished and decorated as you choose. It contains sufficient food to serve a ninecourse banquet for up to 100 people. Furnishings and other objects created by this spell dissipate into smoke if removed from it. A staff of 100 near-transparent servants attends all who enter. You determine the appearance of these servants and their attire. They are invulnerable and obey your commands. Each servant can perform tasks that a human could perform, but they can’t attack or take any action that would directly harm another creature. Thus the servants can fetch things, clean, mend, fold clothes, light fires, serve food, pour wine, and so on. The servants can’t leave the dwelling. When the spell ends, any creatures or objects left inside the extradimensional space are expelled into the unoccupied spaces nearest to the entrance."},"major image":{"n":"Major Image","m":"Level 3 Illusion (Bard, Sorcerer, Warlock, Wizard)","ct":"Action","rg":"120 feet","cp":"V, S, M (a bit of fleece)","du":"Concentration, up to 10 minutes","d":"You create the image of an object, a creature, or some other visible phenomenon that is no larger than a 20-foot Cube. The image appears at a spot that you can see within range and lasts for the duration. It seems real, including sounds, smells, and temperature appropriate to the thing depicted, but it can’t deal damage or cause conditions. If you are within range of the illusion, you can take a Magic action to cause the image to move to any other spot within range. As the image changes location, you can alter its appearance so that its movements appear natural for the image. For example, if you create an image of a creature and move it, you can alter the image so that it appears to be walking. Similarly, you can cause the illusion to make different sounds at different times, even making it carry on a conversation, for example. Physical interaction with the image reveals it to be an illusion, for things can pass through it. A creature that takes a Study action to examine the image can determine that it is an illusion with a successful Intelligence (Investigation) check against your spell save DC. If a creature discerns the illusion for what it is, the creature can see through the image, and its other sensory qualities become faint to the creature. Using a Higher-Level Spell Slot. The spell lasts until dispelled, without requiring Concentration, if cast with a level 4+ spell slot."},"mass cure wounds":{"n":"Mass Cure Wounds","m":"Level 5 Abjuration (Bard, Cleric, Druid)","ct":"Action","rg":"60 feet","cp":"V, S","du":"Instantaneous","d":"A wave of healing energy washes out from a point you can see within range. Choose up to six creatures in a 30-foot-radius Sphere centered on that point. Each target regains Hit Points equal to 5d8 Using a Higher-Level Spell Slot. plus your spellcasting ability modifier. The healing in- creases by 1d8 for each spell slot level above 5."},"mass heal":{"n":"Mass Heal","m":"Level 9 Abjuration (Cleric)","ct":"Action","rg":"60 feet","cp":"V, S","du":"Instantaneous","d":"A flood of healing energy flows from you into creatures around you. You restore up to 700 Hit Points, divided as you choose among any number of creatures that you can see within range. Creatures healed by this spell also have the Blinded, Deafened, and Poisoned conditions removed from them."},"mass healing word":{"n":"Mass Healing Word","m":"Level 3 Abjuration (Bard, Cleric)","ct":"Bonus Action","rg":"60 feet","cp":"V","du":"Instantaneous","d":"Up to six creatures of your choice that you can see within range regain Hit Points equal to 2d4 plus Using a Higher-Level Spell Slot. your spellcasting ability modifier. The healing in- creases by 1d4 for each spell slot level above 3."},"mass suggestion":{"n":"Mass Suggestion","m":"Level 6 Enchantment (Bard, Sorcerer, Wizard)","ct":"Action","rg":"60 feet","cp":"V, M (a snake’s tongue)","du":"24 hours","d":"You suggest a course of activity—described in no more than 25 words—to twelve or fewer creatures you can see within range that can hear and understand you. The suggestion must sound achievable and not involve anything that would obviously deal damage to any of the targets or their allies. For example, you could say, “Walk to the village down that road, and help the villagers there harvest crops until sunset.” Or you could say, “Now is not the time for violence. Drop your weapons, and dance! Stop in an hour.” Each target must succeed on a Wisdom saving throw or have the Charmed condition for the duration or until you or your allies deal damage to the target. Each Charmed target pursues the suggestion to the best of its ability. The suggested activity can continue for the entire duration, but if the suggested activity can be completed in a shorter time, Using a Higher-Level Spell Slot. the spell ends for a target upon completing it. The duration is longer with a spell slot of level 7 (10 days), 8 (30 days), or 9 (366 days)."},"maze":{"n":"Maze","m":"Level 8 Conjuration (Wizard)","ct":"Action","rg":"60 feet","cp":"V, S","du":"Concentration, up to 10 minutes","d":"You banish a creature that you can see within range into a labyrinthine demiplane. The target remains there for the duration or until it escapes the maze. The target can take a Study action to try to escape. When it does so, it makes a DC 20 Intelligence (Investigation) check. If it succeeds, it escapes, and the spell ends. When the spell ends, the target reappears in the space it left or, if that space is occupied, in the near- est unoccupied space."},"meld into stone":{"n":"Meld into Stone","m":"Level 3 Transmutation (Cleric, Druid, Ranger)","ct":"Action or Ritual","rg":"Touch","cp":"V, S","du":"8 hours","d":"You step into a stone object or surface large enough to fully contain your body, merging yourself and your equipment with the stone for the duration. You must touch the stone to do so. Nothing of your presence remains visible or otherwise detectable by nonmagical senses. While merged with the stone, you can’t see what occurs outside it, and any Wisdom (Perception) checks you make to hear sounds outside it are made with Disadvantage. You remain aware of the passage of time and can cast spells on yourself while merged in the stone. You can use 5 feet of movement to leave the stone where you entered it, which ends the spell. You otherwise can’t move. Minor physical damage to the stone doesn’t harm you, but its partial destruction or a change in its shape (to the extent that you no longer fit within it) expels you and deals 6d6 Force damage to you. The stone’s complete destruction (or transmutation into a different substance) expels you and deals 50 Force damage to you. If expelled, you move into an unoccupied space closest to where you first entered and have the Prone condition."},"mending":{"n":"Mending","m":"Transmutation Cantrip (Bard, Cleric, Druid, Sorcerer, Wizard)","ct":"1 minute","rg":"Touch","cp":"V, S, M (two lodestones)","du":"Instantaneous","d":"This spell repairs a single break or tear in an object you touch, such as a broken chain link, two halves of a broken key, a torn cloak, or a leaking wineskin. As long as the break or tear is no larger than 1 foot in any dimension, you mend it, leaving no trace of the former damage. This spell can physically repair a magic item, but it can’t restore magic to such an object."},"message":{"n":"Message","m":"Transmutation Cantrip (Bard, Druid, Sorcerer, Wizard)","ct":"Action","rg":"120 feet","cp":"S, M (a copper wire)","du":"1 round","d":"You point toward a creature within range and whisper a message. The target (and only the target) hears the message and can reply in a whisper that only you can hear. You can cast this spell through solid objects if you are familiar with the target and know it is beyond the barrier. Magical silence; 1 foot of stone, metal, or wood; or a thin sheet of lead blocks the spell."},"meteor swarm":{"n":"Meteor Swarm","m":"Level 9 Evocation (Sorcerer, Wizard)","ct":"Action","rg":"1 mile","cp":"V, S","du":"Instantaneous","d":"Blazing orbs of fire plummet to the ground at four different points you can see within range. Each creature in a 40-foot-radius Sphere centered on each of those points makes a Dexterity saving throw. A creature takes 20d6 Fire damage and 20d6 Bludgeoning damage on a failed save or half as much damage on a successful one. A creature in the area of more than one fiery Sphere is affected only once. A nonmagical object that isn’t being worn or carried also takes the damage if it’s in the spell’s area, and the object starts burning if it’s flammable."},"mind blank":{"n":"Mind Blank","m":"Level 8 Abjuration (Bard, Wizard)","ct":"Action","rg":"Touch","cp":"V, S","du":"24 hours","d":"Until the spell ends, one willing creature you touch has Immunity to Psychic damage and the Charmed condition. The target is also unaffected by anything that would sense its Wish emotions or alignment, read its thoughts, or magically detect its location, and no spell—not even —can gather information about the target, observe it remotely, or control its mind."},"mind spike":{"n":"Mind Spike","m":"Level 2 Divination (Sorcerer, Warlock, Wizard)","ct":"Action","rg":"120 feet","cp":"S","du":"Concentration, up to 1 hour","d":"You drive a spike of psionic energy into the mind of one creature you can see within range. The target makes a Wisdom saving throw, taking 3d8 Psychic damage on a failed save or half as much damage on a successful one. On a failed save, you also always know the target’s location until the spell ends, but only while the two of you are on the same plane of existence. While you have this knowledge, the target can’t become hidden from you, and if it has the Invisible condition, it gains no benefit from that condition against you. Using a Higher-Level Spell Slot. The damage in- creases by 1d8 for each spell slot level above 2."},"minor illusion":{"n":"Minor Illusion","m":"Illusion Cantrip (Bard, Sorcerer, Warlock, Wizard)","ct":"Action","rg":"30 feet","cp":"S, M (a bit of fleece)","du":"1 minute","d":"You create a sound or an image of an object within range that lasts for the duration. See the descriptions below for the effects of each. The illusion ends if you cast this spell again. If a creature takes a Study action to examine the sound or image, the creature can determine that it is an illusion with a successful Intelligence (Investigation) check against your spell save DC. If a creature discerns the illusion for what it is, the illusion Sound. becomes faint to the creature. If you create a sound, its volume can range from a whisper to a scream. It can be your voice, someone else’s voice, a lion’s roar, a beating of drums, or any other sound you choose. The sound continues unabated throughout the duration, or you can make discrete sounds at different times before Image. the spell ends. If you create an image of an object—such as a chair, muddy footprints, or a small chest—it must be no larger than a 5-foot Cube. The image can’t create sound, light, smell, or any other sensory effect. Physical interaction with the image reveals it to be an illusion, since things can pass through it."},"mirage arcane":{"n":"Mirage Arcane","m":"Level 7 Illusion (Bard, Druid, Wizard)","ct":"10 minutes","rg":"Sight","cp":"V, S","du":"10 days","d":"You make terrain in an area up to 1 mile square look, sound, smell, and even feel like some other sort of terrain. Open fields or a road could be made to resemble a swamp, hill, crevasse, or some other rough or impassable terrain. A pond can be made to seem like a grassy meadow, a precipice like a gentle slope, or a rock-strewn gully like a wide and smooth road. Similarly, you can alter the appearance of structures or add them where none are present. The spell doesn’t disguise, conceal, or add creatures. The illusion includes audible, visual, tactile, and olfactory elements, so it can turn clear ground into Difficult Terrain (or vice versa) or otherwise impede movement through the area. Any piece of the illusory terrain (such as a rock or stick) that is removed from the spell’s area disappears immediately. Creatures with Truesight can see through the illusion to the terrain’s true form; however, all other elements of the illusion remain, so while the creature is aware of the illusion’s presence, the creature can still physically interact with the illusion."},"mirror image":{"n":"Mirror Image","m":"Level 2 Illusion (Bard, Sorcerer, Warlock, Wizard)","ct":"Action","rg":"Self","cp":"V, S","du":"1 minute","d":"Three illusory duplicates of yourself appear in your space. Until the spell ends, the duplicates move with you and mimic your actions, shifting position so it’s impossible to track which image is real. Each time a creature hits you with an attack roll during the spell’s duration, roll a d6 for each of your remaining duplicates. If any of the d6s rolls a 3 or higher, one of the duplicates is hit instead of you, and the duplicate is destroyed. The duplicates otherwise ignore all other damage and effects. The spell ends when all three duplicates are destroyed. A creature is unaffected by this spell if it has the Blinded condition, Blindsight, or Truesight."},"mislead":{"n":"Mislead","m":"Level 5 Illusion (Bard, Warlock, Wizard)","ct":"Action","rg":"Self","cp":"S","du":"Concentration, up to 1 hour","d":"Blinded condition, Blindsight, or Truesight. You gain the Invisible condition at the same time that an illusory double of you appears where you are standing. The double lasts for the duration, but the invisibility ends immediately after you make an attack roll, deal damage, or cast a spell. As a Magic action, you can move the illusory double up to twice your Speed and make it gesture, speak, and behave in whatever way you choose. It is intangible and invulnerable. You can see through its eyes and hear through its ears as if you were located where it is."},"misty step":{"n":"Misty Step","m":"Level 2 Conjuration (Sorcerer, Warlock, Wizard)","ct":"Bonus Action","rg":"Self","cp":"V","du":"Instantaneous","d":"Briefly surrounded by silvery mist, you teleport up to 30 feet to an unoccupied space you can see."},"modify memory":{"n":"Modify Memory","m":"Level 5 Enchantment (Bard, Wizard) Remove Curse Greater Restoration","ct":"Action","rg":"30 feet","cp":"V, S","du":"Concentration, up to 1 minute","d":"You attempt to reshape another creature’s memories. One creature that you can see within range makes a Wisdom saving throw. If you are fighting the creature, it has Advantage on the save. On a failed save, the target has the Charmed condition for the duration. While Charmed in this way, the target also has the Incapacitated condition and is unaware of its surroundings, though it can hear you. If it takes any damage or is targeted by another spell, this spell ends, and no memories are modified. While this charm lasts, you can affect the target’s memory of an event that it experienced within the last 24 hours and that lasted no more than 10 minutes. You can permanently eliminate all memory of the event, allow the target to recall the event with perfect clarity, change its memory of the event’s details, or create a memory of some other event. You must speak to the target to describe how its memories are affected, and it must be able to understand your language for the modified memories to take root. Its mind fills in any gaps in the details of your description. If the spell ends before you finish describing the modified memories, the creature’s memory isn’t altered. Otherwise, the modified memories take hold when the spell ends. A modified memory doesn’t necessarily affect how a creature behaves, particularly if the memory contradicts the creature’s natural inclinations, alignment, or beliefs. An illogical modified memory, such as a false memory of how much the creature enjoyed swimming in acid, is dismissed as a bad dream. The GM might deem a modified memory too nonsensical to affect a creature. A or spell cast Using a Higher-Level Spell Slot. on the target restores the creature’s true memory. You can alter the target’s memories of an event that took place up to 7 days ago (level 6 spell slot), 30 days ago (level 7 spell slot), 365 days ago (level 8 spell slot), or any time in the creature’s past (level 9 spell slot)."},"moonbeam":{"n":"Moonbeam","m":"Level 2 Evocation (Druid) Poly- morph","ct":"Action","rg":"120 feet","cp":"V, S, M (a moonseed leaf)","du":"Concentration, up to 1 minute","d":"A silvery beam of pale light shines down in a 5-foot-radius, 40-foot-high Cylinder centered on a point within range. Until the spell ends, Dim Light fills the Cylinder, and you can take a Magic action on later turns to move the Cylinder up to 60 feet. When the Cylinder appears, each creature in it makes a Constitution saving throw. On a failed save, a creature takes 2d10 Radiant damage, and if the creature is shape-shifted (as a result of the Polymorph spell, for example), it reverts to its true form and can’t shape-shift until it leaves the Cylinder. On a successful save, a creature takes half as much damage only. A creature also makes this save when the spell’s area moves into its space and when it enters the spell’s area or ends its turn there. A creature makes this save only once per turn. Using a Higher-Level Spell Slot. The damage increases by 1d10 for each spell slot level above 2."},"move earth":{"n":"Move Earth","m":"Level 6 Transmutation (Druid, Sorcerer, Wizard)","ct":"Action","rg":"120 feet","cp":"V, S, M (a miniature shovel)","du":"Concentration, up to 2 hours","d":"Choose an area of terrain no larger than 40 feet on a side within range. You can reshape dirt, sand, or clay in the area in any manner you choose for the duration. You can raise or lower the area’s elevation, create or fill in a trench, erect or flatten a wall, or form a pillar. The extent of any such changes can’t exceed half the area’s largest dimension. For example, if you affect a 40-foot square, you can create a pillar up to 20 feet high, raise or lower the square’s elevation by up to 20 feet, dig a trench up to 20 feet deep, and so on. It takes 10 minutes for these changes to complete. Because the terrain’s transformation occurs slowly, creatures in the area can’t usually be trapped or injured by the ground’s movement. At the end of every 10 minutes you spend concentrating on the spell, you can choose a new area of terrain to affect within range. This spell can’t manipulate natural stone or stone construction. Rocks and structures shift to accommodate the new terrain. If the way you shape the terrain would make a structure unstable, it might collapse. Similarly, this spell doesn’t directly affect plant growth. The moved earth carries any plants along with it."},"nondetection":{"n":"Nondetection","m":"Level 3 Abjuration (Bard, Ranger, Wizard)","ct":"Action","rg":"Touch","cp":"V, S, M (a pinch of diamond dust worth 25+ GP, which the spell consumes)","du":"8 hours","d":"For the duration, you hide a target that you touch from Divination spells. The target can be a willing creature, or it can be a place or an object no larger than 10 feet in any dimension. The target can’t be targeted by any Divination spell or perceived through magical scrying sensors."},"passwall":{"n":"Passwall","m":"Level 5 Transmutation (Wizard)","ct":"Action","rg":"30 feet","cp":"V, S, M (a pinch of sesame seeds)","du":"1 hour","d":"A passage appears at a point that you can see on a wooden, plaster, or stone surface (such as a wall, ceiling, or floor) within range and lasts for the duration. You choose the opening’s dimensions: up to 5 feet wide, 8 feet tall, and 20 feet deep. The passage creates no instability in a structure surrounding it. When the opening disappears, any creatures or objects still in the passage created by the spell are safely ejected to an unoccupied space nearest to the surface on which you cast the spell."},"pass without trace":{"n":"Pass without Trace","m":"Level 2 Abjuration (Druid, Ranger)","ct":"Action","rg":"Self","cp":"V, S, M (ashes from burned mistletoe)","du":"Concentration, up to 1 hour","d":"You radiate a concealing aura in a 30-foot Emanation for the duration. While in the aura, you and each creature you choose have a +10 bonus to Dex- terity (Stealth) checks and leave no tracks."},"phantasmal force":{"n":"Phantasmal Force","m":"Level 2 Illusion (Bard, Sorcerer, Wizard)","ct":"Action","rg":"60 feet","cp":"V, S, M (a bit of fleece)","du":"Concentration, up to 1 minute","d":"You attempt to craft an illusion in the mind of a creature you can see within range. The target makes an Intelligence saving throw. On a failed save, you create a phantasmal object, creature, or other phenomenon that is no larger than a 10-foot Cube and that is perceivable only to the target for the duration. The phantasm includes sound, temperature, and other stimuli. The target can take a Study action to examine the phantasm with an Intelligence (Investigation) check against your spell save DC. If the check succeeds, the target realizes that the phantasm is an illusion, and the spell ends. While affected by the spell, the target treats the phantasm as if it were real and rationalizes any illogical outcomes from interacting with it. For example, if the target steps through a phantasmal bridge and survives the fall, it believes the bridge exists and something else caused it to fall. An affected target can even take damage from the illusion if the phantasm represents a dangerous creature or hazard. On each of your turns, such a phantasm can deal 2d8 Psychic damage to the target if it is in the phantasm’s area or within 5 feet of the phantasm. The target perceives the damage as a type appropriate to the illusion."},"phantasmal killer":{"n":"Phantasmal Killer","m":"Level 4 Illusion (Bard, Wizard)","ct":"Action","rg":"120 feet","cp":"V, S","du":"Concentration, up to 1 minute","d":"You tap into the nightmares of a creature you can see within range and create an illusion of its deepest fears, visible only to that creature. The target makes a Wisdom saving throw. On a failed save, the target takes 4d10 Psychic damage and has Disadvantage on ability checks and attack rolls for the duration. On a successful save, the target takes half as much damage, and the spell ends. For the duration, the target makes a Wisdom saving throw at the end of each of its turns. On a failed save, it takes the Psychic damage again. On a successful save, the spell ends. Using a Higher-Level Spell Slot. The damage increases by 1d10 for each spell slot level above 4."},"phantom steed":{"n":"Phantom Steed","m":"Level 3 Illusion (Wizard)","ct":"1 minute or Ritual","rg":"30 feet","cp":"V, S","du":"1 hour","d":"A Large, quasi-real, horselike creature appears on the ground in an unoccupied space of your choice within range. You decide the creature’s appearance, and it is equipped with a saddle, bit, and bridle. Any of the equipment created by the spell vanishes in a puff of smoke if it is carried more than 10 feet away from the steed. Riding Horse For the duration, you or a creature you choose can ride the steed. The steed uses the stat block (see “Monsters”), except it has a Speed of 100 feet and can travel 13 miles in an hour. When the spell ends, the steed gradually fades, giving the rider 1 minute to dismount. The spell ends early if the steed takes any damage."},"planar ally":{"n":"Planar Ally","m":"Level 6 Conjuration (Cleric)","ct":"10 minutes","rg":"60 feet","cp":"V, S","du":"Instantaneous","d":"You beseech an otherworldly entity for aid. The being must be known to you: a god, a demon prince, or some other being of cosmic power. That entity sends a Celestial, an Elemental, or a Fiend loyal to it to aid you, making the creature appear in an unoccupied space within range. If you know a specific creature’s name, you can speak that name when you cast this spell to request that creature, though you might get a different creature anyway (GM’s choice). When the creature appears, it is under no compulsion to behave a particular way. You can ask it to perform a service in exchange for payment, but it isn’t obliged to do so. The requested task could range from simple (fly us across the chasm, or help us fight a battle) to complex (spy on our enemies, or protect us during our foray into the dungeon). You must be able to communicate with the creature to bargain for its services. Payment can take a variety of forms. A Celestial might require a sizable donation of gold or magic items to an allied temple, while a Fiend might demand a living sacrifice or a gift of treasure. Some creatures might exchange their service for a quest undertaken by you. A task that can be measured in minutes requires a payment worth 100 GP per minute. A task measured in hours requires 1,000 GP per hour. And a task measured in days (up to 10 days) requires 10,000 GP per day. The GM can adjust these payments based on the circumstances under which you cast the spell. If the task is aligned with the creature’s ethos, the payment might be halved or even waived. Nonhazardous tasks typically require only half the suggested payment, while especially dangerous tasks might require a greater gift. Creatures rarely accept tasks that seem suicidal. After the creature completes the task, or when the agreed-upon duration of service expires, the creature returns to its home plane after reporting back to you if possible. If you are unable to agree on a price for the creature’s service, the creature imme- diately returns to its home plane."},"planar binding":{"n":"Planar Binding","m":"Level 5 Abjuration (Bard, Cleric, Druid, Warlock, Wizard) Magic Circle","ct":"1 hour","rg":"60 feet","cp":"V, S, M (a jewel worth 1,000+ GP, which the spell consumes)","du":"24 hours","d":"You attempt to bind a Celestial, an Elemental, a Fey, or a Fiend to your service. The creature must be within range for the entire casting of the spell. (Typically, the creature is first summoned into the center of the inverted version of the spell to trap it while this spell is cast.) At the completion of the casting, the target must succeed on a Charisma saving throw or be bound to serve you for the duration. If the creature was summoned or created by another spell, that spell’s duration is extended to match the duration of this spell. A bound creature must follow your commands to the best of its ability. You might command the creature to accompany you on an adventure, to guard a location, or to deliver a message. If the creature is Hostile, it strives to twist your commands to achieve its own objectives. If the creature carries out your commands completely before the spell ends, it travels to you to report this fact if you are on the same plane of existence. If you are on a different plane, it returns to the place where you Using a Higher-Level Spell Slot. bound it and remains there until the spell ends. The duration increases with a spell slot of level 6 (10 days), 7 (30 days), 8 (180 days), and 9 (366 days)."},"plane shift":{"n":"Plane Shift","m":"Level 7 Conjuration (Cleric, Druid, Sorcerer, Warlock, Wizard)","ct":"Action","rg":"Touch","cp":"V, S, M (a forked, metal rod worth 250+ GP and attuned to a plane of existence)","du":"Instantaneous","d":"You and up to eight willing creatures who link hands in a circle are transported to a different plane of existence. You can specify a target destination in general terms, such as a specific city on the Elemental Plane of Fire or palace on the second level of the Nine Hells, and you appear in or near that destination, as determined by the GM. Alternatively, if you know the sigil sequence of a teleportation circle on another plane of existence, this spell can take you to that circle. If the teleportation circle is too small to hold all the creatures you transported, they appear in the closest unoccupied spaces next to the circle."},"plant growth":{"n":"Plant Growth","m":"Level 3 Transmutation (Bard, Druid, Ranger) Plant Growth","ct":"Action (Overgrowth) or 8 hours (Enrichment)","rg":"150 feet","cp":"V, S","du":"Instantaneous","d":"This spell channels vitality into plants. The casting time you use determines whether the spell has the Overgrowth. Overgrowth or the Enrichment effect below. Choose a point within range. All normal plants in a 100-foot-radius Sphere centered on that point become thick and overgrown. A creature moving through that area must spend 4 feet of movement for every 1 foot it moves. You can exclude one or more areas of any size within the spell’s area Enrichment. from being affected. All plants in a half-mile radius centered on a point within range become enriched for 365 days. The plants yield twice the normal amount of food when harvested. They can benefit from only one per year."},"poison spray":{"n":"Poison Spray","m":"Necromancy Cantrip (Druid, Sorcerer, Warlock, Wizard)","ct":"Action","rg":"30 feet","cp":"V, S","du":"Instantaneous","d":"You spray toxic mist at a creature within range. Make a ranged spell attack against the target. On a hit, the target takes 1d12 Poison damage. Cantrip Upgrade. The damage increases by 1d12 when you reach levels 5 (2d12), 11 (3d12), and 17 (4d12)."},"polymorph":{"n":"Polymorph","m":"Level 4 Transmutation (Bard, Druid, Sorcerer, Wizard)","ct":"Action","rg":"60 feet","cp":"V, S, M (a caterpillar cocoon)","du":"Concentration, up to 1 hour","d":"You attempt to transform a creature that you can see within range into a Beast. The target must succeed on a Wisdom saving throw or shape-shift into a Beast form for the duration. That form can be any Beast you choose that has a Challenge Rating equal to or less than the target’s (or the target’s level if it doesn’t have a Challenge Rating). The target’s game statistics are replaced by the stat block of the chosen Beast, but the target retains its alignment, personality, creature type, Hit Points, and Hit Point Dice. See the “Animals” section of “Monsters” for a sample of Beast stat blocks. The target gains a number of Temporary Hit Points equal to the Hit Points of the Beast form. These Temporary Hit Points vanish if any remain when the spell ends. The spell ends early on the target if it has no Temporary Hit Points left. The target is limited in the actions it can perform by the anatomy of its new form, and it can’t speak or cast spells. The target’s gear melds into the new form. The creature can’t use or otherwise benefit from any of that equipment."},"power word heal":{"n":"Power Word Heal","m":"Level 9 Enchantment (Bard, Cleric)","ct":"Action","rg":"60 feet Component: V","cp":"","du":"Instantaneous","d":"A wave of healing energy washes over one creature you can see within range. The target regains all its Hit Points. If the creature has the Charmed, Frightened, Paralyzed, Poisoned, or Stunned condition, the condition ends. If the creature has the Prone condition, it can use its Reaction to stand up."},"power word kill":{"n":"Power Word Kill","m":"Level 9 Enchantment (Bard, Sorcerer, Warlock, Wizard)","ct":"Action","rg":"60 feet Component: V","cp":"","du":"Instantaneous","d":"You compel one creature you can see within range to die. If the target has 100 Hit Points or fewer, it dies."},"power word stun":{"n":"Power Word Stun","m":"Level 8 Enchantment (Bard, Sorcerer, Warlock, Wizard)","ct":"Action","rg":"60 feet","cp":"V","du":"Instantaneous","d":"Otherwise, it takes 12d12 Psychic damage. You overwhelm the mind of one creature you can see within range. If the target has 150 Hit Points or fewer, it has the Stunned condition. Otherwise, its Speed is 0 until the start of your next turn. The Stunned target makes a Constitution saving throw at the end of each of its turns, ending the con- dition on itself on a success."},"prayer of healing":{"n":"Prayer of Healing","m":"Level 2 Abjuration (Cleric, Paladin)","ct":"10 minutes","rg":"30 feet","cp":"V","du":"Instantaneous","d":"Up to five creatures of your choice who remain within range for the spell’s entire casting gain the benefits of a Short Rest and also regain 2d8 Hit Points. A creature can’t be affected by this spell again until that creature finishes a Long Rest. Using a Higher-Level Spell Slot. The healing in- creases by 1d8 for each spell slot level above 2."},"prestidigitation":{"n":"Prestidigitation","m":"Transmutation Cantrip (Bard, Sorcerer, Warlock, Wizard)","ct":"Action","rg":"10 feet","cp":"V, S","du":"Up to 1 hour","d":"You create a magical effect within range. Choose the effect from the options below. If you cast this spell multiple times, you can have up to three of its Sensory Effect. non-instantaneous effects active at a time. You create an instantaneous, harmless sensory effect, such as a shower of sparks, Fire Play. a puff of wind, faint musical notes, or an odd odor. You instantaneously light or snuff out a Clean or Soil. candle, a torch, or a small campfire. You instantaneously clean or soil an Minor Sensation. object no larger than 1 cubic foot. You chill, warm, or flavor up to Magic Mark. 1 cubic foot of nonliving material for 1 hour. You make a color, a small mark, or a Minor Creation. symbol appear on an object or a surface for 1 hour. You create a nonmagical trinket or an illusory image that can fit in your hand. It lasts until the end of your next turn. A trinket can deal no damage and has no monetary worth."},"prismatic spray":{"n":"Prismatic Spray","m":"Level 7 Evocation (Bard, Sorcerer, Wizard)","ct":"Action","rg":"Self","cp":"V, S","du":"Instantaneous 1 Red. Failed Save: 12d6 Fire damage. Successful Save: Half as much damage. 2 Orange. Failed Save: 12d6 Acid damage. Successful Save: Half as much damage. 3 Yellow. Failed Save: 12d6 Lightning damage. Suc- cessful Save: Half as much damage. 4 Green. Failed Save: 12d6 Poison damage. Success- ful Save: Half as much damage. 5 Blue. Failed Save: 12d6 Cold damage. Successful Save: Half as much damage. 6 Indigo. Failed Save: The target has the Restrained condition and makes a Constitution saving throw at the end of each of its turns. If it successfully saves three times, the condition ends. If it fails three times, it has the Petrified condition until it is freed by an effect like the Greater Restoration spell. The successes and failures needn’t be con- secutive; keep track of both until the target col- lects three of a kind. 7 Violet. Failed Save: The target has the Blinded condition and makes a Wisdom saving throw at the start of your next turn. On a successful save, the condition ends. On a failed save, the condi- tion ends, and the creature teleports to another plane of existence (GM’s choice). 8 Special. The target is struck by two rays. Roll twice, rerolling any 8.","d":"Eight rays of light flash from you in a 60-foot Cone. Each creature in the Cone makes a Dexterity saving throw. For each target, roll 1d8 to determine which color ray affects it, consulting the Prismatic Rays table. Prismatic Rays 1d8 Ray Red. Failed Save: 12d6 Fire damage. Successful Save: Half as much damage. Orange. Failed Save: 12d6 Acid damage. Successful Save: Half as much damage. Yellow. Failed Save: 12d6 Lightning damage. Successful Save: Half as much damage. Green. Failed Save: 12d6 Poison damage. Successful Save: Half as much damage. 1d8 Ray Blue. Failed Save: 12d6 Cold damage. Successful Save: Half as much damage. Indigo. Failed Save: The target has the Restrained condition and makes a Constitution saving throw at the end of each of its turns. If it successfully saves three times, the condition ends. If it fails three times, it has the Petrified condition until it is freed by an effect like the Greater Restoration spell. The successes and failures needn’t be consecutive; keep track of both until the target collects three of a kind. Violet. Failed Save: The target has the Blinded condition and makes a Wisdom saving throw at the start of your next turn. On a successful save, the condition ends. On a failed save, the condition ends, and the creature teleports to another plane of existence (GM’s choice). Special. The target is struck by two rays. Roll twice, rerolling any 8."},"prismatic wall":{"n":"Prismatic Wall","m":"Level 9 Abjuration (Bard, Wizard) Antimagic Field Dispel Magic","ct":"Action","rg":"60 feet","cp":"V, S","du":"10 minutes 1 Red. Failed Save: 12d6 Fire damage. Successful Save: Half as much damage. Additional Effects : Nonmagical ranged attacks can’t pass through this layer, which is destroyed if it takes at least 25 Cold damage. 2 Orange. Failed Save: 12d6 Acid damage. Suc- cessful Save: Half as much damage. Additional Effects: Magical ranged attacks can’t pass through this layer, which is destroyed by a strong wind (such as the one created by Gust of Wind ). 3 Yellow. Failed Save: 12d6 Lightning damage. Successful Save: Half as much damage. Addi- tional Effects: The layer is destroyed if it takes at least 60 Force damage. 4 Green. Failed Save: 12d6 Poison damage. Suc- cessful Save: Half as much damage. Additional Effects: A Passwall spell, or another spell of equal or greater level that can open a portal on a solid surface, destroys this layer. 5 Blue. Failed Save: 12d6 Cold damage. Success- ful Save: Half as much damage. Additional Ef- fects: The layer is destroyed if it takes at least 25 Fire damage. 6 Indigo. Failed Save: The target has the Re- strained condition and makes a Constitution saving throw at the end of each of its turns. If it successfully saves three times, the condition ends. If it fails three times, it has the Petrified condition until it is freed by an effect like the Greater Restoration spell. The successes and failures needn’t be consecutive; keep track of both until the target collects three of a kind. Additional Effects: Spells can’t be cast through this layer, which is destroyed by Bright Light shed by the Daylight spell. 7 Violet. Failed Save: The target has the Blinded condition and makes a Wisdom saving throw at the start of your next turn. On a successful save, the condition ends. On a failed save, the condition ends, and the creature teleports to another plane of existence (GM’s choice). Additional Effects: This layer is destroyed by Dispel Magic .","d":"A shimmering, multicolored plane of light forms a vertical opaque wall—up to 90 feet long, 30 feet high, and 1 inch thick—centered on a point within range. Alternatively, you shape the wall into a globe up to 30 feet in diameter centered on a point within range. The wall lasts for the duration. If you position the wall in a space occupied by a creature, the spell ends instantly without effect. The wall sheds Bright Light within 100 feet and Dim Light for an additional 100 feet. You and creatures you designate when you cast the spell can pass through and be near the wall without harm. If another creature that can see the wall moves within 20 feet of it or starts its turn there, the creature must succeed on a Constitution saving throw or have the Blinded condition for 1 minute. The wall consists of seven layers, each with a different color. When a creature reaches into or passes through the wall, it does so one layer at a time through all the layers. Each layer forces the creature to make a Dexterity saving throw or be affected by that layer’s properties, below. The wall, which has AC 10, can be destroyed one layer at a time, in order from red to violet, by means specific to each layer. If a layer is destroyed, it is gone for the duration. Antimagic Field has no effect on the wall, and Dispel Magic can affect only the violet layer. 1 Red. Failed save: 12d6 Fire damage; success: half. Nonmagical ranged attacks can’t pass through; destroyed by 25 Cold damage. 2 Orange. Failed save: 12d6 Acid damage; success: half. Magical ranged attacks can’t pass through; destroyed by a strong wind (such as Gust of Wind). 3 Yellow. Failed save: 12d6 Lightning damage; success: half. Destroyed by 60 Force damage. 4 Green. Failed save: 12d6 Poison damage; success: half. Destroyed by a Passwall spell or another spell of equal or greater level that can open a portal on a solid surface. 5 Blue. Failed save: 12d6 Cold damage; success: half. Destroyed by 25 Fire damage. 6 Indigo. Failed save: the target has the Restrained condition and makes a Constitution saving throw at the end of each of its turns; three successes end the condition, three failures mean the Petrified condition until freed by an effect like Greater Restoration (successes and failures needn’t be consecutive). Spells can’t be cast through this layer; destroyed by Bright Light shed by the Daylight spell. 7 Violet. Failed save: the target has the Blinded condition and makes a Wisdom saving throw at the start of your next turn; on a success the condition ends, on a failure the condition ends and the creature teleports to another plane (DM’s choice). Destroyed by Dispel Magic or a similar spell of equal or greater level that can end spells and magical effects."},"private sanctum":{"n":"Private Sanctum","m":"Level 4 Abjuration (Wizard)","ct":"10 minutes","rg":"120 feet","cp":"V, S, M (a thin sheet of lead)","du":"24 hours","d":"You make an area within range magically secure. The area is a Cube that can be as small as 5 feet to as large as 100 feet on each side. The spell lasts for the duration. When you cast the spell, you decide what sort of security the spell provides, choosing any of the following properties: • Sound can’t pass through the barrier at the edge of the warded area. • The barrier of the warded area appears dark and foggy, preventing vision (including Darkvision) through it. • Sensors created by Divination spells can’t appear inside the protected area or pass through the barrier at its perimeter. • Creatures in the area can’t be targeted by Divination spells. • Nothing can teleport into or out of the warded area. • Planar travel is blocked within the warded area. Casting this spell on the same spot every day for Using a Higher-Level Spell Slot. 365 days makes the spell last until dispelled. You can increase the size of the Cube by 100 feet for each spell slot level above 4."},"produce flame":{"n":"Produce Flame","m":"Conjuration Cantrip (Druid)","ct":"Bonus Action","rg":"Self","cp":"V, S","du":"10 minutes","d":"A flickering flame appears in your hand and remains there for the duration. While there, the flame emits no heat and ignites nothing, and it sheds Bright Light in a 20-foot radius and Dim Light for an additional 20 feet. The spell ends if you cast it again. Until the spell ends, you can take a Magic action to hurl fire at a creature or an object within 60 feet of you. Make a ranged spell attack. On a hit, the target Cantrip Upgrade. takes 1d8 Fire damage. The damage increases by 1d8 when you reach levels 5 (2d8), 11 (3d8), and 17 (4d8)."},"programmed illusion":{"n":"Programmed Illusion","m":"Level 6 Illusion (Bard, Wizard)","ct":"Action","rg":"120 feet","cp":"V, S, M (jade dust worth 25+ GP)","du":"Until dispelled","d":"You create an illusion of an object, a creature, or some other visible phenomenon within range that activates when a specific trigger occurs. The illusion is imperceptible until then. It must be no larger than a 30-foot Cube, and you decide when you cast the spell how the illusion behaves and what sounds it makes. This scripted performance can last up to 5 minutes. When the trigger you specify occurs, the illusion springs into existence and performs in the manner you described. Once the illusion finishes performing, it disappears and remains dormant for 10 minutes, after which the illusion can be activated again. The trigger can be as general or as detailed as you like, though it must be based on visual or audible phenomena that occur within 30 feet of the area. For example, you could create an illusion of yourself to appear and warn off others who attempt to open a trapped door. Physical interaction with the image reveals it to be illusory, since things can pass through it. A creature that takes the Study action to examine the image can determine that it is an illusion with a successful Intelligence (Investigation) check against your spell save DC. If a creature discerns the illusion for what it is, the creature can see through the image, and any noise it makes sounds hollow to the creature."},"project image":{"n":"Project Image","m":"Level 7 Illusion (Bard, Wizard)","ct":"Action","rg":"500 miles","cp":"V, S, M (a statuette of yourself worth 5+ GP)","du":"Concentration, up to 1 day","d":"You create an illusory copy of yourself that lasts for the duration. The copy can appear at any location within range that you have seen before, regardless of intervening obstacles. The illusion looks and sounds like you, but it is intangible. If the illusion takes any damage, it disappears, and the spell ends. You can see through the illusion’s eyes and hear through its ears as if you were in its space. As a Magic action, you can move it up to 60 feet and make it gesture, speak, and behave in whatever way you choose. It mimics your mannerisms perfectly. Physical interaction with the image reveals it to be illusory, since things can pass through it. A creature that takes the Study action to examine the image can determine that it is an illusion with a successful Intelligence (Investigation) check against your spell save DC. If a creature discerns the illusion for what it is, the creature can see through the image, and any noise it makes sounds hollow to the creature."},"protection from energy":{"n":"Protection from Energy","m":"Level 3 Abjuration (Cleric, Druid, Ranger, Sorcerer, Wizard)","ct":"Action","rg":"Touch","cp":"V, S","du":"Concentration, up to 1 hour","d":"For the duration, the willing creature you touch has Resistance to one damage type of your choice: Acid, Cold, Fire, Lightning, or Thunder."},"protection from evil and good":{"n":"Protection from Evil and Good","m":"Level 1 Abjuration (Cleric, Druid, Paladin, Warlock, Wizard)","ct":"Action","rg":"Touch","cp":"V, S, M (a flask of Holy Water worth 25+ GP, which the spell consumes)","du":"Concentration up to 10 minutes","d":"Cold, Fire, Lightning, or Thunder. Until the spell ends, one willing creature you touch is protected against creatures that are Aberrations, Celestials, Elementals, Fey, Fiends, or Undead. The protection grants several benefits. Creatures of those types have Disadvantage on attack rolls against the target. The target also can’t be possessed by or gain the Charmed or Frightened conditions from them. If the target is already possessed, Charmed, or Frightened by such a creature, the target has Advantage on any new saving throw against the relevant effect."},"protection from poison":{"n":"Protection from Poison","m":"Level 2 Abjuration (Cleric, Druid, Paladin, Ranger)","ct":"Action","rg":"Touch","cp":"V, S","du":"1 hour","d":"You touch a creature and end the Poisoned condition on it. For the duration, the target has Advantage on saving throws to avoid or end the Poisoned condition, and it has Resistance to Poison damage."},"purify food and drink":{"n":"Purify Food and Drink","m":"Level 1 Transmutation (Cleric, Druid, Paladin)","ct":"Action or Ritual","rg":"10 feet","cp":"V, S","du":"Instantaneous","d":"You remove poison and rot from nonmagical food and drink in a 5-foot-radius Sphere centered on a point within range."},"raise dead":{"n":"Raise Dead","m":"Level 5 Necromancy (Bard, Cleric, Paladin)","ct":"1 hour","rg":"Touch","cp":"V, S, M (a diamond worth 500+ GP, which the spell consumes)","du":"Instantaneous","d":"With a touch, you revive a dead creature if it has been dead no longer than 10 days and it wasn’t Undead when it died. The creature returns to life with 1 Hit Point. This spell also neutralizes any poisons that affected the creature at the time of death. This spell closes all mortal wounds, but it doesn’t restore missing body parts. If the creature is lacking body parts or organs integral for its survival— its head, for instance—the spell automatically fails. Coming back from the dead is an ordeal. The target takes a −4 penalty to D20 Tests. Every time the target finishes a Long Rest, the penalty is reduced by 1 until it becomes 0."},"ray of enfeeblement":{"n":"Ray of Enfeeblement","m":"Level 2 Necromancy (Warlock, Wizard)","ct":"Action","rg":"60 feet","cp":"V, S","du":"Concentration, up to 1 minute","d":"A beam of enervating energy shoots from you toward a creature within range. The target must make a Constitution saving throw. On a successful save, the target has Disadvantage on the next attack roll it makes until the start of your next turn. On a failed save, the target has Disadvantage on Strength-based D20 Tests for the duration. During that time, it also subtracts 1d8 from all its damage rolls. The target repeats the save at the end of each of its turns, ending the spell on a success."},"ray of frost":{"n":"Ray of Frost","m":"Evocation Cantrip (Sorcerer, Wizard)","ct":"Action","rg":"60 feet","cp":"V, S","du":"Instantaneous","d":"A frigid beam of blue-white light streaks toward a creature within range. Make a ranged spell attack against the target. On a hit, it takes 1d8 Cold damage, and its Speed is reduced by 10 feet until the start of your next turn. Cantrip Upgrade. The damage increases by 1d8 when you reach levels 5 (2d8), 11 (3d8), and 17 (4d8)."},"regenerate":{"n":"Regenerate","m":"Level 7 Transmutation (Bard, Cleric, Druid)","ct":"1 minute","rg":"Touch","cp":"V, S, M (a prayer wheel)","du":"1 hour","d":"A creature you touch regains 4d8 + 15 Hit Points. For the duration, the target regains 1 Hit Point at the start of each of its turns, and any severed body parts regrow after 2 minutes."},"ray of sickness":{"n":"Ray of Sickness","m":"Level 1 Necromancy (Sorcerer, Wizard)","ct":"Action","rg":"60 feet","cp":"V, S","du":"Instantaneous","d":"You shoot a greenish ray at a creature within range. Make a ranged spell attack against the target. On a hit, the target takes 2d8 Poison damage and has the Using a Higher-Level Spell Slot. Poisoned condition until the end of your next turn. The damage in- creases by 1d8 for each spell slot level above 1."},"reincarnate":{"n":"Reincarnate","m":"Level 5 Necromancy (Druid)","ct":"1 hour","rg":"Touch","cp":"V, S, M (rare oils worth 1,000+ GP, which the spell consumes)","du":"Instantaneous 1 Roll again. 6 Goliath 2 Dragonborn 7 Halfling 3 Dwarf 8 Human 4 Elf 9 Orc 5 Gnome 10 Tiefling","d":"You touch a dead Humanoid or a piece of one. If the creature has been dead no longer than 10 days, the spell forms a new body for it and calls the soul to enter that body. Roll 1d10 and consult the table below to determine the body’s species, or the GM chooses another playable species. 1 Roll again; 2 Dragonborn; 3 Dwarf; 4 Elf; 5 Gnome; 6 Goliath; 7 Halfling; 8 Human; 9 Orc; 10 Tiefling. The reincarnated creature makes any choices that a species’ description offers, and the creature recalls its former life. It retains the capabilities it had in its original form, except it loses the traits of its previous species and gains the traits of its new one."},"remove curse":{"n":"Remove Curse","m":"Level 3 Abjuration (Cleric, Paladin, Warlock, Wizard)","ct":"Action","rg":"Touch","cp":"V, S","du":"Instantaneous","d":"At your touch, all curses affecting one creature or object end. If the object is a cursed magic item, its curse remains, but the spell breaks its owner’s Attunement to the object so it can be removed or discarded."},"resilient sphere":{"n":"Resilient Sphere","m":"Level 4 Abjuration (Wizard) Disintegrate","ct":"Action","rg":"30 feet","cp":"V, S, M (a glass sphere)","du":"Concentration, up to 1 minute","d":"A shimmering sphere encloses a Large or smaller creature or object within range. An unwilling creature must succeed on a Dexterity saving throw or be enclosed for the duration. Nothing—not physical objects, energy, or other spell effects—can pass through the barrier, in or out, though a creature in the sphere can breathe there. The sphere is immune to all damage, and a creature or object inside can’t be damaged by attacks or effects originating from outside, nor can a creature inside the sphere damage anything outside it. The sphere is weightless and just large enough to contain the creature or object inside. An enclosed creature can take an action to push against the sphere’s walls and thus roll the sphere at up to half the creature’s Speed. Similarly, the globe can be picked up and moved by other creatures. A spell targeting the globe destroys it without harming anything inside."},"resistance":{"n":"Resistance","m":"Abjuration Cantrip (Cleric, Druid)","ct":"Action","rg":"Touch Component: V, S","cp":"","du":"Concentration, up to 1 minute","d":"You touch a willing creature and choose a damage type: Acid, Bludgeoning, Cold, Fire, Lightning, Necrotic, Piercing, Poison, Radiant, Slashing, or Thunder. When the creature takes damage of the chosen type before the spell ends, the creature reduces the total damage taken by 1d4. A creature can benefit from this spell only once per turn."},"resurrection":{"n":"Resurrection","m":"Level 7 Necromancy (Bard, Cleric)","ct":"1 hour","rg":"Touch","cp":"V, S, M (a diamond worth 1,000+ GP, which the spell consumes)","du":"Instantaneous","d":"With a touch, you revive a dead creature that has been dead for no more than a century, didn’t die of old age, and wasn’t Undead when it died. The creature returns to life with all its Hit Points. This spell also neutralizes any poisons that affected the creature at the time of death. This spell closes all mortal wounds and restores any missing body parts. Coming back from the dead is an ordeal. The target takes a −4 penalty to D20 Tests. Every time the target finishes a Long Rest, the penalty is reduced by 1 until it becomes 0. Casting this spell to revive a creature that has been dead for 365 days or longer taxes you. Until you finish a Long Rest, you can’t cast spells again, and you have Disadvantage on D20 Tests."},"reverse gravity":{"n":"Reverse Gravity","m":"Level 7 Transmutation (Druid, Sorcerer, Wizard)","ct":"Action","rg":"100 feet","cp":"V, S, M (a lodestone and iron filings)","du":"Concentration, up to 1 minute","d":"This spell reverses gravity in a 50-foot-radius, 100foot high Cylinder centered on a point within range. All creatures and objects in that area that aren’t anchored to the ground fall upward and reach the top of the Cylinder. A creature can make a Dexterity saving throw to grab a fixed object it can reach, thus avoiding the fall upward. If a ceiling or an anchored object is encountered in this upward fall, creatures and objects strike it just as they would during a downward fall. If an affected creature or object reaches the Cylinder’s top without striking anything, it hovers there for the duration. When the spell ends, affected objects and creatures fall downward."},"revivify":{"n":"Revivify","m":"Level 3 Necromancy (Cleric, Druid, Paladin, Ranger)","ct":"Action","rg":"Touch","cp":"V, S, M (a diamond worth 300+ GP, which the spell consumes)","du":"Instantaneous","d":"You touch a creature that has died within the last minute. That creature revives with 1 Hit Point. This spell can’t revive a creature that has died of old age, nor does it restore any missing body parts."},"rope trick":{"n":"Rope Trick","m":"Level 2 Transmutation (Wizard)","ct":"Action","rg":"Touch","cp":"V, S, M (a segment of rope)","du":"1 hour","d":"You touch a rope. One end of it hovers upward until the rope hangs perpendicular to the ground or the rope reaches a ceiling. At the rope’s upper end, an Invisible 3-foot-by-5-foot portal opens to an extradimensional space that lasts until the spell ends. That space can be reached by climbing the rope, which can be pulled into or dropped out of it. The space can hold up to eight Medium or smaller creatures. Attacks, spells, and other effects can’t pass into or out of the space, but creatures inside it can see through the portal. Anything inside the space drops out when the spell ends."},"sacred flame":{"n":"Sacred Flame","m":"Evocation Cantrip (Cleric)","ct":"Action","rg":"60 feet","cp":"V, S","du":"Instantaneous","d":"Flame-like radiance descends on a creature that you can see within range. The target must succeed on a Dexterity saving throw or take 1d8 Radiant damage. The target gains no benefit from Half Cover or Cantrip Upgrade. Three-Quarters Cover for this save. The damage increases by 1d8 when you reach levels 5 (2d8), 11 (3d8), and 17 (4d8)."},"sanctuary":{"n":"Sanctuary","m":"Level 1 Abjuration (Cleric)","ct":"Bonus Action","rg":"30 feet","cp":"V, S, M (a shard of glass from a mirror)","du":"1 minute","d":"You ward a creature within range. Until the spell ends, any creature who targets the warded creature with an attack roll or a damaging spell must succeed on a Wisdom saving throw or either choose a new target or lose the attack or spell. This spell doesn’t protect the warded creature from areas of effect. The spell ends if the warded creature makes an attack roll, casts a spell, or deals damage."},"scorching ray":{"n":"Scorching Ray","m":"Level 2 Evocation (Sorcerer, Wizard)","ct":"Action","rg":"120 feet","cp":"V, S","du":"Instantaneous","d":"You hurl three fiery rays. You can hurl them at one target within range or at several. Make a ranged spell attack for each ray. On a hit, the target takes Using a Higher-Level Spell Slot. 2d6 Fire damage. You create one additional ray for each spell slot level above 2."},"scrying":{"n":"Scrying","m":"Level 5 Divination (Bard, Cleric, Druid, Warlock, Wizard)","ct":"10 minutes","rg":"Self","cp":"V, S, M (a focus worth 1,000+ GP, such as a crystal ball, mirror, or water-filled font)","du":"Concentration, up to 10 minutes Secondhand (heard of the target) +5 Firsthand (met the target) +0 Extensive (know the target well) −5 Picture or other likeness −2 Garment or other possession −4 Body part, lock of hair, or bit of nail −10","d":"You can see and hear a creature you choose that is on the same plane of existence as you. The target makes a Wisdom saving throw, which is modified (see the tables below) by how well you know the target and the sort of physical connection you have to it. The target doesn’t know what it is making the save against, only that it feels uneasy. On a successful save, the target isn’t affected, and you can’t use this spell on it again for 24 hours. On a failed save, the spell creates an Invisible, intangible sensor within 10 feet of the target. You can see and hear through the sensor as if you were there. The sensor moves with the target, remaining within 10 feet of it for the duration. If something can see the sensor, it appears as a luminous orb about the size of your fist. Instead of targeting a creature, you can target a location you have seen. When you do so, the sensor appears at that location and doesn’t move. Familiarity save modifiers: Secondhand (you have heard of the target) +5; Firsthand (you have met the target) +0; Extensive (you know the target well) −5. Connection save modifiers: Likeness or picture −2; Possession or garment −4; Body part, lock of hair, or bit of nail −10."},"searing smite":{"n":"Searing Smite","m":"Level 1 Evocation (Paladin)","ct":"Bonus Action, which you take immedi- ately after hitting a target with a Melee weapon or an Unarmed Strike","rg":"Self Component: V","cp":"","du":"1 minute","d":"As you hit the target, it takes an extra 1d6 Fire damage from the attack. At the start of each of its turns until the spell ends, the target takes 1d6 Fire damage and then makes a Constitution saving throw. On a failed save, the spell continues. On a successful Using a Higher-Level Spell Slot. save, the spell ends. All the damage increases by 1d6 for each spell slot level above 1."},"secret chest":{"n":"Secret Chest","m":"Level 4 Conjuration (Wizard)","ct":"Action","rg":"Touch","cp":"V, S, M (a chest, 3 feet by 2 feet by 2 feet, constructed from rare materials worth 5,000+ GP, and a Tiny replica of the chest made from the same materi- als worth 50+ GP)","du":"Until dispelled","d":"You hide a chest and all its contents on the Ethereal Plane. You must touch the chest and the miniature replica that serve as Material components for the spell. The chest can contain up to 12 cubic feet of nonliving material (3 feet by 2 feet by 2 feet). While the chest remains on the Ethereal Plane, you can take a Magic action and touch the replica to recall the chest. It appears in an unoccupied space on the ground within 5 feet of you. You can send the chest back to the Ethereal Plane by taking a Magic action to touch the chest and the replica. After 60 days, there is a cumulative 5 percent chance at the end of each day that the spell ends. The spell also ends if you cast this spell again or if the Tiny replica chest is destroyed. If the spell ends and the larger chest is on the Ethereal Plane, the chest remains there for you or someone else to find."},"see invisibility":{"n":"See Invisibility","m":"Level 2 Divination (Bard, Sorcerer, Wizard)","ct":"Action","rg":"Self","cp":"V, S, M (a pinch of talc)","du":"1 hour","d":"For the duration, you see creatures and objects that have the Invisible condition as if they were visible, and you can see into the Ethereal Plane. Creatures and objects there appear ghostly."},"seeming":{"n":"Seeming","m":"Level 5 Illusion (Bard, Sorcerer, Wizard)","ct":"Action","rg":"30 feet","cp":"V, S","du":"8 hours","d":"You give an illusory appearance to each creature of your choice that you can see within range. An unwilling target can make a Charisma saving throw, and if it succeeds, it is unaffected by this spell. You can give the same appearance or different ones to the targets. The spell can change the appearance of the targets’ bodies and equipment. You can make each creature seem 1 foot shorter or taller and appear heavier or lighter. A target’s new appearance must have the same basic arrangement of limbs as the target, but the extent of the illusion is otherwise up to you. The spell lasts for the duration. The changes wrought by this spell fail to hold up to physical inspection. For example, if you use this spell to add a hat to a creature’s outfit, objects pass through the hat. A creature that takes the Study action to examine a target can make an Intelligence (Investigation) check against your spell save DC. If it succeeds, it becomes aware that the target is disguised."},"sending":{"n":"Sending","m":"Level 3 Divination (Bard, Cleric, Wizard)","ct":"Action","rg":"Unlimited","cp":"V, S, M (a copper wire)","du":"Instantaneous","d":"You send a short message of 25 words or fewer to a creature you have met or a creature described to you by someone who has met it. The target hears the message in its mind, recognizes you as the sender if it knows you, and can answer in a like manner immediately. The spell enables targets to understand the meaning of your message. You can send the message across any distance and even to other planes of existence, but if the target is on a different plane than you, there is a 5 percent chance that the message doesn’t arrive. You know if the delivery fails. Upon receiving your message, a creature can block your ability to reach it again with this spell for 8 hours. If you try to send another message during that time, you learn that you are blocked, and the spell fails."},"sequester":{"n":"Sequester","m":"Level 7 Transmutation (Wizard)","ct":"Action","rg":"Touch","cp":"V, S, M (gem dust worth 5,000+ GP, which the spell consumes)","du":"Until dispelled","d":"With a touch, you magically sequester an object or a willing creature. For the duration, the target has the Invisible condition and can’t be targeted by Divination spells, detected by magic, or viewed remotely with magic. If the target is a creature, it enters a state of suspended animation; it has the Unconscious condition, doesn’t age, and doesn’t need food, water, or air. You can set a condition for the spell to end early. The condition can be anything you choose, but it must occur or be visible within 1 mile of the target. Examples include “after 1,000 years” or “when the tarrasque awakens.” This spell also ends if the target takes any damage."},"shapechange":{"n":"Shapechange","m":"Level 9 Transmutation (Druid, Wizard)","ct":"Action","rg":"Self","cp":"V, S, M (a jade circlet worth 1,500+ GP)","du":"Concentration, up to 1 hour","d":"You shape-shift into another creature for the duration or until you take a Magic action to shape-shift into a different eligible form. The new form must be of a creature that has a Challenge Rating no higher than your level or Challenge Rating. You must have seen the sort of creature before, and it can’t be a Construct or an Undead. When you cast the spell, you gain a number of Temporary Hit Points equal to the Hit Points of the first form into which you shape-shift. These Temporary Hit Points vanish if any remain when the spell ends. Your game statistics are replaced by the stat block of the chosen form, but you retain your creature type; alignment; personality; Intelligence, Wisdom, and Charisma scores; Hit Points; Hit Point Dice; proficiencies; and ability to communicate. If you have the Spellcasting feature, you retain it too. Upon shape-shifting, you determine whether your equipment drops to the ground or changes in size and shape to fit the new form while you’re in it."},"shatter":{"n":"Shatter","m":"Level 2 Evocation (Bard, Sorcerer, Wizard)","ct":"Action","rg":"60 feet","cp":"V, S, M (a chip of mica)","du":"Instantaneous","d":"A loud noise erupts from a point of your choice within range. Each creature in a 10-foot-radius Sphere centered there makes a Constitution saving throw, taking 3d8 Thunder damage on a failed save or half as much damage on a successful one. A Construct has Disadvantage on the save. A nonmagical object that isn’t being worn or carried also takes the damage if it’s in the spell’s area. Using a Higher-Level Spell Slot. The damage increases by 1d8 for each spell slot level above 2."},"shield":{"n":"Shield","m":"Level 1 Abjuration (Sorcerer, Wizard) Magic Missile","ct":"Reaction, which you take when you are hit by an attack roll or targeted by the Magic Missile spell","rg":"Self","cp":"V, S","du":"1 round","d":"An imperceptible barrier of magical force protects you. Until the start of your next turn, you have a +5 bonus to AC, including against the triggering attack, and you take no damage from ."},"shield of faith":{"n":"Shield of Faith","m":"Level 1 Abjuration (Cleric, Paladin)","ct":"Bonus Action","rg":"60 feet","cp":"V, S, M (a prayer scroll)","du":"Concentration, up to 10 minutes","d":"A shimmering field surrounds a creature of your choice within range, granting it a +2 bonus to AC for the duration."},"shillelagh":{"n":"Shillelagh","m":"Transmutation Cantrip (Druid)","ct":"Bonus Action","rg":"Self","cp":"V, S, M (mistletoe)","du":"1 minute","d":"A Club or Quarterstaff you are holding is imbued with nature’s power. For the duration, you can use your spellcasting ability instead of Strength for the attack and damage rolls of melee attacks using that weapon, and the weapon’s damage die becomes a d8. If the attack deals damage, it can be Force damage or the weapon’s normal damage type (your choice). The spell ends early if you cast it again or if you let Cantrip Upgrade. go of the weapon. The damage die changes when you reach levels 5 (d10), 11 (d12), and 17 (2d6)."},"shining smite":{"n":"Shining Smite","m":"Level 2 Transmutation (Paladin)","ct":"Bonus Action, which you take immedi- ately after hitting a creature with a Melee weapon or an Unarmed Strike","rg":"Self Component: V","cp":"","du":"Concentration, up to 1 minute","d":"The target hit by the strike takes an extra 2d6 Radiant damage from the attack. Until the spell ends, the target sheds Bright Light in a 5-foot radius, attack rolls against it have Advantage, and it can’t benefit Using a Higher-Level Spell Slot. from the Invisible condition. The damage in- creases by 1d6 for each spell slot level above 2."},"shocking grasp":{"n":"Shocking Grasp","m":"Evocation Cantrip (Sorcerer, Wizard)","ct":"Action","rg":"Touch","cp":"V, S","du":"Instantaneous","d":"Lightning springs from you to a creature that you try to touch. Make a melee spell attack against the target. On a hit, the target takes 1d8 Lightning damage, and it can’t make Opportunity Attacks until the start of its next turn. Cantrip Upgrade. The damage increases by 1d8 when you reach levels 5 (2d8), 11 (3d8), and 17 (4d8)."},"silence":{"n":"Silence","m":"Level 2 Illusion (Bard, Cleric, Ranger)","ct":"Action or Ritual","rg":"120 feet","cp":"V, S","du":"Concentration, up to 10 minutes","d":"For the duration, no sound can be created within or pass through a 20-foot-radius Sphere centered on a point you choose within range. Any creature or object entirely inside the Sphere has Immunity to Thunder damage, and creatures have the Deafened condition while entirely inside it. Casting a spell that includes a Verbal component is impossible there."},"silent image":{"n":"Silent Image","m":"Level 1 Illusion (Bard, Sorcerer, Wizard)","ct":"Action","rg":"60 feet","cp":"V, S, M (a bit of fleece)","du":"Concentration, up to 10 minutes","d":"You create the image of an object, a creature, or some other visible phenomenon that is no larger than a 15-foot Cube. The image appears at a spot within range and lasts for the duration. The image is purely visual; it isn’t accompanied by sound, smell, or other sensory effects. As a Magic action, you can cause the image to move to any spot within range. As the image changes location, you can alter its appearance so that its movements appear natural for the image. For example, if you create an image of a creature and move it, you can alter the image so that it appears to be walking. Physical interaction with the image reveals it to be an illusion, since things can pass through it. A creature that takes a Study action to examine the image can determine that it is an illusion with a successful Intelligence (Investigation) check against your spell save DC. If a creature discerns the illusion for what it is, the creature can see through the image."},"simulacrum":{"n":"Simulacrum","m":"Level 7 Illusion (Wizard)","ct":"12 hours","rg":"Touch","cp":"V, S, M (powdered ruby worth 1,500+ GP, which the spell consumes)","du":"Until dispelled","d":"You create a simulacrum of one Beast or Humanoid that is within 10 feet of you for the entire casting of the spell. You finish the casting by touching both the creature and a pile of ice or snow that is the same size as that creature, and the pile turns into the simulacrum, which is a creature. It uses the game statistics of the original creature at the time of casting, except it is a Construct, its Hit Point maximum is half as much, and it can’t cast this spell. The simulacrum is Friendly to you and creatures you designate. It obeys your commands and acts on your turn in combat. The simulacrum can’t gain levels, and it can’t take Short or Long Rests. If the simulacrum takes damage, the only way to restore its Hit Points is to repair it as you take a Long Rest, during which you expend components worth 100 GP per Hit Point restored. The simulacrum must stay within 5 feet of you for the repair. The simulacrum lasts until it drops to 0 Hit Points, at which point it reverts to snow and melts away. If you cast this spell again, any simulacrum you cre- ated with this spell is instantly destroyed."},"sleep":{"n":"Sleep","m":"Level 1 Enchantment (Bard, Sorcerer, Wizard)","ct":"Action","rg":"60 feet","cp":"V, S, M (a pinch of sand or rose petals)","du":"Concentration, up to 1 minute","d":"Each creature of your choice in a 5-foot-radius Sphere centered on a point within range must succeed on a Wisdom saving throw or have the Incapacitated condition until the end of its next turn, at which point it must repeat the save. If the target fails the second save, the target has the Unconscious condition for the duration. The spell ends on a target if it takes damage or someone within 5 feet of it takes an action to shake it out of the spell’s effect. Creatures that don’t sleep, such as elves, or that have Immunity to the Exhaustion condition auto- matically succeed on saves against this spell."},"sleet storm":{"n":"Sleet Storm","m":"Level 3 Conjuration (Druid, Sorcerer, Wizard)","ct":"Action","rg":"150 feet","cp":"V, S, M (a miniature umbrella)","du":"Concentration, up to 1 minute","d":"Until the spell ends, sleet falls in a 40-foot-tall, 20-foot-radius Cylinder centered on a point you choose within range. The area is Heavily Obscured, and exposed flames in the area are doused. Ground in the Cylinder is Difficult Terrain. When a creature enters the Cylinder for the first time on a turn or starts its turn there, it must succeed on a Dexterity saving throw or have the Prone condition and lose Concentration."},"slow":{"n":"Slow","m":"Level 3 Transmutation (Bard, Sorcerer, Wizard)","ct":"Action","rg":"120 feet","cp":"V, S, M (a drop of molasses)","du":"Concentration, up to 1 minute","d":"You alter time around up to six creatures of your choice in a 40-foot Cube within range. Each target must succeed on a Wisdom saving throw or be affected by this spell for the duration. An affected target’s Speed is halved, it takes a −2 penalty to AC and Dexterity saving throws, and it can’t take Reactions. On its turns, it can take either an action or a Bonus Action, not both, and it can make only one attack if it takes the Attack action. If it casts a spell with a Somatic component, there is a 25 percent chance the spell fails as a result of the target making the spell’s gestures too slowly. An affected target repeats the save at the end of each of its turns, ending the spell on itself on a success."},"sorcerous burst":{"n":"Sorcerous Burst","m":"Evocation Cantrip (Sorcerer)","ct":"Action","rg":"120 feet Component: V, S","cp":"","du":"Instantaneous","d":"You cast sorcerous energy at one creature or object within range. Make a ranged spell attack against the target. On a hit, the target takes 1d8 damage of a type you choose: Acid, Cold, Fire, Lightning, Poison, Psychic, or Thunder. If you roll an 8 on a d8 for this spell, you can roll another d8, and add it to the damage. When you cast this spell, the maximum number of these d8s you can add to the spell’s damage equals your spellcasting ability modifier. Cantrip Upgrade. The damage increases by 1d8 when you reach levels 5 (2d8), 11 (3d8), and 17 (4d8)."},"spare the dying":{"n":"Spare the Dying","m":"Necromancy Cantrip (Cleric, Druid)","ct":"Action","rg":"15 feet","cp":"V, S","du":"Instantaneous","d":"Choose a creature within range that has 0 Hit Points Cantrip Upgrade. and isn’t dead. The creature becomes Stable. The range doubles when you reach levels 5 (30 feet), 11 (60 feet), and 17 (120 feet)."},"speak with animals":{"n":"Speak with Animals","m":"Level 1 Divination (Bard, Druid, Ranger, Warlock)","ct":"Action or Ritual","rg":"Self","cp":"V, S","du":"10 minutes","d":"For the duration, you can comprehend and verbally communicate with Beasts, and you can use any of the Influence action’s skill options with them. Most Beasts have little to say about topics that don’t pertain to survival or companionship, but at minimum, a Beast can give you information about nearby locations and monsters, including whatever it has perceived within the past day."},"speak with dead":{"n":"Speak with Dead","m":"Level 3 Necromancy (Bard, Cleric, Wizard)","ct":"Action","rg":"10 feet","cp":"V, S, M (burning incense)","du":"10 minutes","d":"You grant the semblance of life to a corpse of your choice within range, allowing it to answer questions you pose. The corpse must have a mouth, and this spell fails if the deceased creature was Undead when it died. The spell also fails if the corpse was the target of this spell within the past 10 days. Until the spell ends, you can ask the corpse up to five questions. The corpse knows only what it knew in life, including the languages it knew. Answers are usually brief, cryptic, or repetitive, and the corpse is under no compulsion to offer a truthful answer if you are antagonistic toward it or it recognizes you as an enemy. This spell doesn’t return the creature’s soul to its body, only its animating spirit. Thus, the corpse can’t learn new information, doesn’t comprehend anything that has happened since it died, and can’t speculate about future events."},"speak with plants":{"n":"Speak with Plants","m":"Level 3 Transmutation (Bard, Druid, Ranger)","ct":"Action","rg":"Self","cp":"V, S","du":"10 minutes","d":"You imbue plants in an immobile 30-foot Emanation with limited sentience and animation, giving them the ability to communicate with you and follow your simple commands. You can question plants about events in the spell’s area within the past day, gaining information about creatures that have passed, weather, and other circumstances. You can also turn Difficult Terrain caused by plant growth (such as thickets and undergrowth) into ordinary terrain that lasts for the duration. Or you can turn ordinary terrain where plants are present into Difficult Terrain that lasts for the duration. The spell doesn’t enable plants to uproot themselves and move about, but they can move their branches, tendrils, and stalks for you. If a Plant creature is in the area, you can commu- nicate with it as if you shared a common language."},"spider climb":{"n":"Spider Climb","m":"Level 2 Transmutation (Sorcerer, Warlock, Wizard)","ct":"Action","rg":"Touch","cp":"V, S, M (a drop of bitumen and a spider)","du":"Concentration, up to 1 hour","d":"Until the spell ends, one willing creature you touch gains the ability to move up, down, and across vertical surfaces and along ceilings, while leaving its hands free. The target also gains a Climb Speed Using a Higher-Level Spell Slot. equal to its Speed. You can target one additional creature for each spell slot level above 2."},"spike growth":{"n":"Spike Growth","m":"Level 2 Transmutation (Druid, Ranger)","ct":"Action","rg":"150 feet","cp":"V, S, M (seven thorns)","du":"Concentration, up to 10 minutes","d":"The ground in a 20-foot-radius Sphere centered on a point within range sprouts hard spikes and thorns. The area becomes Difficult Terrain for the duration. When a creature moves into or within the area, it takes 2d4 Piercing damage for every 5 feet it travels. The transformation of the ground is camouflaged to look natural. Any creature that can’t see the area when the spell is cast must take a Search action and succeed on a Wisdom (Perception or Survival) check against your spell save DC to recognize the terrain as hazardous before entering it."},"spirit guardians":{"n":"Spirit Guardians","m":"Level 3 Conjuration (Cleric)","ct":"Action","rg":"Self","cp":"V, S, M (a prayer scroll)","du":"Concentration, up to 10 minutes","d":"Protective spirits flit around you in a 15-foot Emanation for the duration. If you are good or neutral, their spectral form appears angelic or fey (your choice). If you are evil, they appear fiendish. When you cast this spell, you can designate creatures to be unaffected by it. Any other creature’s Speed is halved in the Emanation, and whenever the Emanation enters a creature’s space and whenever a creature enters the Emanation or ends its turn there, the creature must make a Wisdom saving throw. On a failed save, the creature takes 3d8 Radiant damage (if you are good or neutral) or 3d8 Necrotic damage (if you are evil). On a successful save, the creature takes half as much damage. A creature Using a Higher-Level Spell Slot. makes this save only once per turn. The damage in- creases by 1d8 for each spell slot level above 3."},"spiritual weapon":{"n":"Spiritual Weapon","m":"Level 2 Evocation (Cleric)","ct":"Bonus Action","rg":"60 feet","cp":"V, S","du":"Concentration, up to 1 minute","d":"You create a floating, spectral force that resembles a weapon of your choice and lasts for the duration. The force appears within range in a space of your choice, and you can immediately make one melee spell attack against one creature within 5 feet of the force. On a hit, the target takes Force damage equal to 1d8 plus your spellcasting ability modifier. As a Bonus Action on your later turns, you can move the force up to 20 feet and repeat the attack Using a Higher-Level Spell Slot. against a creature within 5 feet of it. The damage in- creases by 1d8 for every slot level above 2."},"starry wisp":{"n":"Starry Wisp","m":"Evocation Cantrip (Bard, Druid)","ct":"Action","rg":"60 feet","cp":"V, S","du":"Instantaneous","d":"You launch a mote of light at one creature or object within range. Make a ranged spell attack against the target. On a hit, the target takes 1d8 Radiant damage, and until the end of your next turn, it emits Dim Light in a 10-foot radius and can’t benefit from the Cantrip Upgrade. Invisible condition. The damage increases by 1d8 when you reach levels 5 (2d8), 11 (3d8), and 17 (4d8)."},"stinking cloud":{"n":"Stinking Cloud","m":"Level 3 Conjuration (Bard, Sorcerer, Wizard) Gust of Wind","ct":"Action","rg":"90 feet","cp":"V, S, M (a rotten egg)","du":"Concentration, up to 1 minute","d":"You create a 20-foot-radius Sphere of yellow, nauseating gas centered on a point within range. The cloud is Heavily Obscured. The cloud lingers in the air for the duration or until a strong wind (such as the one created by ) disperses it. Each creature that starts its turn in the Sphere must succeed on a Constitution saving throw or have the Poisoned condition until the end of the current turn. While Poisoned in this way, the creature can’t take an action or a Bonus Action."},"stone shape":{"n":"Stone Shape","m":"Level 4 Transmutation (Cleric, Druid, Wizard)","ct":"Action","rg":"Touch","cp":"V, S, M (soft clay)","du":"Instantaneous","d":"You touch a stone object of Medium size or smaller or a section of stone no more than 5 feet in any dimension and form it into any shape you like. For example, you could shape a large rock into a weapon, statue, or coffer, or you could make a small passage through a wall that is 5 feet thick. You could also shape a stone door or its frame to seal the door shut. The object you create can have up to two hinges and a latch, but finer mechanical detail isn’t possible."},"stoneskin":{"n":"Stoneskin","m":"Level 4 Transmutation (Druid, Ranger, Sorcerer, Wizard)","ct":"Action","rg":"Touch","cp":"V, S, M (diamond dust worth 100+ GP, which the spell consumes)","du":"Concentration, up to 1 hour","d":"Until the spell ends, one willing creature you touch has Resistance to Bludgeoning, Piercing, and Slash- ing damage."},"storm of vengeance":{"n":"Storm of Vengeance","m":"Level 9 Conjuration (Druid)","ct":"Action","rg":"1 mile","cp":"V, S","du":"Concentration, up to 1 minute","d":"A churning storm cloud forms for the duration, centered on a point within range and spreading to a radius of 300 feet. Each creature under the cloud when it appears must succeed on a Constitution saving throw or take 2d6 Thunder damage and have the Deafened condition for the duration. At the start of each of your later turns, the storm produces different effects, as detailed below. Turn 2. Acidic rain falls. Each creature and object under the cloud takes 4d6 Acid damage. Turn 3. You call six bolts of lightning from the cloud to strike six different creatures or objects beneath it. Each target makes a Dexterity saving throw, taking 10d6 Lightning damage on a failed save or half as much damage on a successful one. Turn 4. Hailstones rain down. Each creature under the cloud takes 2d6 Bludgeoning damage. Turns 5–10. Gusts and freezing rain assail the area under the cloud. Each creature there takes 1d6 Cold damage. Until the spell ends, the area is Difficult Terrain and Heavily Obscured, ranged attacks with weapons are impossible there, and strong wind blows through the area."},"suggestion":{"n":"Suggestion","m":"Level 2 Enchantment (Bard, Sorcerer, Warlock, Wizard)","ct":"Action","rg":"30 feet","cp":"V, M (a drop of honey)","du":"Concentration, up to 8 hours","d":"You suggest a course of activity—described in no more than 25 words—to one creature you can see within range that can hear and understand you. The suggestion must sound achievable and not involve anything that would obviously deal damage to the target or its allies. For example, you could say, “Fetch the key to the cult’s treasure vault, and give the key to me.” Or you could say, “Stop fighting, leave this library peacefully, and don’t return.” The target must succeed on a Wisdom saving throw or have the Charmed condition for the duration or until you or your allies deal damage to the target. The Charmed target pursues the suggestion to the best of its ability. The suggested activity can continue for the entire duration, but if the suggested activity can be completed in a shorter time, the spell ends for the target upon completing it."},"summon dragon":{"n":"Summon Dragon","m":"Level 5 Conjuration (Wizard)","ct":"Action","rg":"60 feet","cp":"V, S, M (an object with the image of a dragon engraved on it worth 500+ GP)","du":"Concentration, up to 1 hour Shared Resistances. When you summon the spirit, choose one of its Resistances. You have Resistance to the chosen damage type until the spell ends. Multiattack. The spirit makes a number of Rend attacks equal to half the spell’s level (round down), and it uses Breath Weapon. Rend. Melee Attack Roll: Bonus equals your spell attack modifier, reach 10 feet. Hit: 1d6 + 4 + the spell’s level Piercing damage. Breath Weapon. Dexterity Saving Throw: DC equals your spell save DC, each creature in a 30-foot Cone. Failure: 2d6 damage of a type this spirit has Resistance to (your choice when you cast the spell). Success: Half damage.","d":"You call forth Draconic a Dragon Spirit spirit. It manifests in an unoccupied space that you can see within range and uses the stat block. The creature disappears when it drops to 0 Hit Points or when the spell ends. The creature is an ally to you and your allies. In combat, the creature shares your Initiative count, but it takes its turn immediately after yours. It obeys your verbal commands (no action required by you). If you don’t issue any, it takes Using a Higher-Level Spell Slot. the Dodge action and uses its movement to avoid danger. Use the spell slot’s level for the spell’s level in the stat block."},"sunbeam":{"n":"Sunbeam","m":"Level 6 Evocation (Cleric, Druid, Sorcerer, Wizard)","ct":"Action Self","rg":"","cp":"V, S, M (a magnifying glass)","du":"Concentration, up to 1 minute","d":"You launch a sunbeam in a 5-foot-wide, 60-foot-long Line. Each creature in the Line makes a Constitution saving throw. On a failed save, a creature takes 6d8 Radiant damage and has the Blinded condition until the start of your next turn. On a successful save, it takes half as much damage only. Until the spell ends, you can take a Magic action to create a new Line of radiance. For the duration, a mote of brilliant radiance shines above you. It sheds Bright Light in a 30-foot radius and Dim Light for an additional 30 feet. This light is sunlight."},"sunburst":{"n":"Sunburst","m":"Level 8 Evocation (Cleric, Druid, Sorcerer, Wizard)","ct":"Action","rg":"150 feet","cp":"V, S, M (a piece of sunstone)","du":"Instantaneous","d":"Brilliant sunlight flashes in a 60-foot-radius Sphere centered on a point you choose within range. Each creature in the Sphere makes a Constitution saving throw. On a failed save, a creature takes 12d6 Radiant damage and has the Blinded condition for 1 minute. On a successful save, it takes half as much damage only. A creature Blinded by this spell makes another Constitution saving throw at the end of each of its turns, ending the effect on itself on a success. This spell dispels Darkness in its area that was created by any spell."},"symbol":{"n":"Symbol","m":"Level 7 Abjuration (Bard, Cleric, Druid, Wizard)","ct":"1 minute","rg":"Touch","cp":"V, S, M (powdered diamond worth 1,000+ GP, which the spell consumes)","du":"Until dispelled or triggered","d":"You inscribe a harmful glyph either on a surface (such as a section of floor or wall) or within an object that can be closed (such as a book or chest). The glyph can cover an area no larger than 10 feet in diameter. If you choose an object, it must remain in place; if it is moved more than 10 feet from where you cast this spell, the glyph is broken, and the spell ends without being triggered. The glyph is nearly imperceptible and requires a successful Wisdom (Perception) check against your spell save DC to notice. When you inscribe the glyph, you set its trigger and choose which effect the symbol bears: Death, Discord, Fear, Pain, Sleep, or Stunning. Each one is explained below. Set the Trigger. You decide what triggers the glyph when you cast the spell. For glyphs inscribed on a surface, common triggers include touching or stepping on the glyph, removing another object covering it, or approaching within a certain distance of it. For glyphs inscribed within an object, common triggers include opening that object or seeing the glyph. You can refine the trigger so that only creatures of certain types activate it (for example, the glyph could be set to affect Aberrations). You can also set conditions for creatures that don’t trigger the glyph, such as those who say a certain password. Once triggered, the glyph glows, filling a 60-foot-radius Sphere with Dim Light for 10 minutes, after which time the spell ends. Each creature in the Sphere when the glyph activates is targeted by its effect, as is a creature that enters the Sphere for the first time on a turn or ends its turn there. A creature is targeted only once per turn. Death. Each target makes a Constitution saving throw, taking 10d10 Necrotic damage on a failed save or half as much damage on a successful save. Discord. Each target makes a Wisdom saving throw. On a failed save, a target argues with other creatures for 1 minute. During this time, it is incapable of meaningful communication and has Disadvantage on attack rolls and ability checks. Fear. Each target must succeed on a Wisdom saving throw or have the Frightened condition for 1 minute. While Frightened, the target must move at least 30 feet away from the glyph on each of its turns, if able. Pain. Each target must succeed on a Constitution saving throw or have the Incapacitated condition for 1 minute. Sleep. Each target must succeed on a Wisdom saving throw or have the Unconscious condition for 10 minutes. A creature awakens if it takes damage or if someone takes an action to shake it awake. Stunning. Each target must succeed on a Wisdom saving throw or have the Stunned condition for 1 minute."},"telekinesis":{"n":"Telekinesis","m":"Level 5 Transmutation (Sorcerer, Wizard)","ct":"Action","rg":"60 feet","cp":"V, S","du":"Concentration, up to 10 minutes","d":"You gain the ability to move or manipulate creatures or objects by thought. When you cast the spell and as a Magic action on your later turns before the spell ends, you can exert your will on one creature or object that you can see within range, causing the appropriate effect below. You can affect the same target round after round or choose a new one at any time. If you switch targets, the prior target is no longer affected by the spell. Creature. You can try to move a Huge or smaller creature. The target must succeed on a Strength saving throw, or you move it up to 30 feet in any direction within the spell’s range. Until the end of your next turn, the creature has the Restrained condition, and if you lift it into the air, it is suspended there. It falls at the end of your next turn unless you use this option on it again and it fails the save. Object. You can try to move a Huge or smaller object. If the object isn’t being worn or carried, you automatically move it up to 30 feet in any direction within the spell’s range. If the object is worn or carried by a creature, that creature must succeed on a Strength saving throw, or you pull the object away and move it up to 30 feet in any direction within the spell’s range. You can exert fine control on objects with your telekinetic grip, such as manipulating a simple tool, opening a door or a container, stowing or retrieving an item from an open container, or pouring the contents from a vial."},"telepathic bond":{"n":"Telepathic Bond","m":"Level 5 Divination (Bard, Wizard)","ct":"Action or Ritual","rg":"30 feet","cp":"V, S, M (two eggs)","du":"1 hour","d":"You forge a telepathic link among up to eight willing creatures of your choice within range, psychically linking each creature to all the others for the duration. Creatures that can’t communicate in any languages aren’t affected by this spell. Until the spell ends, the targets can communicate telepathically through the bond whether or not they share a language. The communication is possible over any distance, though it can’t extend to other planes of existence."},"teleport":{"n":"Teleport","m":"Level 7 Conjuration (Bard, Sorcerer, Wizard)","ct":"Action","rg":"10 feet","cp":"V","du":"Instantaneous Permanent circle — — — 01–00 Linked object — — — 01–00 Very familiar 01–05 06–13 14–24 25–00 Seen casually 01–33 34–43 44–53 54–00 Viewed once or 01–43 44–53 54–73 74–00 described False destination 01–50 51–00 — —","d":"This spell instantly transports you and up to eight willing creatures that you can see within range, or a single object that you can see within range, to a destination you select. If you target an object, it must be Large or smaller, and it can’t be held or carried by an unwilling creature. The destination you choose must be known to you, and it must be on the same plane of existence as you. Your familiarity with the destination determines whether you arrive there successfully. The GM rolls 1d100 and consults the Teleportation Outcome Teleportation table and the Outcome explanations after it. Familiarity. Here are the meanings of the terms in the table’s Familiarity column: • “Permanent circle” means a permanent teleportation circle whose sigil sequence you know. • “Linked object” means you possess an object taken from the desired destination within the last six months, such as a book from a wizard’s library. • “Very familiar” is a place you have visited often, a place you have carefully studied, or a place you can see when you cast the spell. • “Seen casually” is a place you have seen more than once but with which you aren’t very familiar. • “Viewed once or described” is a place you have seen once, possibly using magic, or a place you know through someone else’s description, perhaps from a map. • “False destination” is a place that doesn’t exist. Perhaps you tried to scry an enemy’s sanctum but instead viewed an illusion, or you are attempting Mishap. to teleport to a location that no longer exists. The spell’s unpredictable magic results in a difficult journey. Each teleporting creature (or the target object) takes 3d10 Force damage, and the GM rerolls Similar on Area. the table to see where you wind up (multiple mishaps can occur, dealing damage each time). You and your group (or the target object) appear in a different area that’s visually or thematically similar to the target area. You appear in the closest similar place. If you are heading for your Off home Target. laboratory, for example, you might appear in another person’s laboratory in the same city. You and your group (or the target object) appear 2d12 miles away from the destination in a random direction. Roll 1d8 for the direction: 1, east; On Target. 2, southeast; 3, south; 4, southwest; 5, west; 6, northwest; 7, north; or 8, northeast. You and your group (or the target ob- ject) appear where you intended."},"teleportation circle":{"n":"Teleportation Circle","m":"Level 5 Conjuration (Bard, Sorcerer, Warlock, Wizard)","ct":"1 minute","rg":"10 feet","cp":"V, M (rare inks worth 50+ GP, which the spell consumes)","du":"1 round","d":"As you cast the spell, you draw a 5-foot-radius circle on the ground inscribed with sigils that link your location to a permanent teleportation circle of your choice whose sigil sequence you know and that is on the same plane of existence as you. A shimmering portal opens within the circle you drew and remains open until the end of your next turn. Any creature that enters the portal instantly appears within 5 feet of the destination circle or in the nearest unoccupied space if that space is occupied. Many major temples, guildhalls, and other important places have permanent teleportation circles. Each circle includes a unique sigil sequence—a string of runes arranged in a particular pattern. When you first gain the ability to cast this spell, you learn the sigil sequences for two destinations on the Material Plane, determined by the GM. You might learn additional sigil sequences during your adventures. You can commit a new sigil sequence to memory after studying it for 1 minute. You can create a permanent teleportation circle by casting this spell in the same location every day for 365 days."},"thaumaturgy":{"n":"Thaumaturgy","m":"Transmutation Cantrip (Cleric)","ct":"Action","rg":"30 feet","cp":"V","du":"Up to 1 minute","d":"You manifest a minor wonder within range. You create one of the effects below within range. If you cast this spell multiple times, you can have up to three of its 1-minute effects active at a time. Altered Eyes. You alter the appearance of your eyes for 1 minute. Booming Voice. Your voice booms up to three times as loud as normal for 1 minute. For the duration, you have Advantage on Charisma (Intimidation) checks. Fire Play. You cause flames to flicker, brighten, dim, or change color for 1 minute. Invisible Hand. You instantaneously cause an unlocked door or window to fly open or slam shut. Phantom Sound. You create an instantaneous sound that originates from a point of your choice within range, such as a rumble of thunder, the cry of a raven, or ominous whispers. Tremors. You cause harmless tremors in the ground for 1 minute."},"thunderwave":{"n":"Thunderwave","m":"Level 1 Evocation (Bard, Druid, Sorcerer, Wizard)","ct":"Action","rg":"Self","cp":"V, S","du":"Instantaneous","d":"You unleash a wave of thunderous energy. Each creature in a 15-foot Cube originating from you makes a Constitution saving throw. On a failed save, a creature takes 2d8 Thunder damage and is pushed 10 feet away from you. On a successful save, a creature takes half as much damage only. In addition, unsecured objects that are entirely within the Cube are pushed 10 feet away from you, and a thunderous boom is audible within 300 feet. Using a Higher-Level Spell Slot. The damage in- creases by 1d8 for each spell slot level above 1."},"time stop":{"n":"Time Stop","m":"Level 9 Transmutation (Sorcerer, Wizard)","ct":"Action","rg":"Self","cp":"V","du":"Instantaneous","d":"You briefly stop the flow of time for everyone but yourself. No time passes for other creatures, while you take 1d4 + 1 turns in a row, during which you can use actions and move as normal. This spell ends if one of the actions you use during this period, or any effects that you create during it, affects a creature other than you or an object being worn or carried by someone other than you. In addition, the spell ends if you move to a place more than 1,000 feet from the location where you cast it."},"tiny hut":{"n":"Tiny Hut","m":"Level 3 Evocation (Bard, Wizard)","ct":"1 minute or Ritual","rg":"Self","cp":"V, S, M (a crystal bead)","du":"8 hours","d":"A 10-foot Emanation springs into existence around you and remains stationary for the duration. The spell fails when you cast it if the Emanation isn’t big enough to fully encapsulate all creatures in its area. Creatures and objects within the Emanation when you cast the spell can move through it freely. All other creatures and objects are barred from passing through it. Spells of level 3 or lower can’t be cast through it, and the effects of such spells can’t extend into it. The atmosphere inside the Emanation is comfortable and dry, regardless of the weather outside. Until the spell ends, you can command the interior to have Dim Light or Darkness (no action required). The Emanation is opaque from the outside and of any color you choose, but it’s transparent from the inside. The spell ends early if you leave the Emanation or if you cast it again."},"tongues":{"n":"Tongues","m":"Level 3 Divination (Bard, Cleric, Sorcerer, Warlock, Wizard)","ct":"Action","rg":"Touch","cp":"V, M (a miniature ziggurat)","du":"1 hour","d":"This spell grants the creature you touch the ability to understand any spoken or signed language that it hears or sees. Moreover, when the target communicates by speaking or signing, any creature that knows at least one language can understand it if that creature can hear the speech or see the signing."},"transport via plants":{"n":"Transport via Plants","m":"Level 6 Conjuration (Druid)","ct":"Action","rg":"10 feet","cp":"V, S","du":"1 minute","d":"This spell creates a magical link between a Large or larger inanimate plant within range and another plant, at any distance, on the same plane of existence. You must have seen or touched the destination plant at least once before. For the duration, any creature can step into the target plant and exit from the destination plant by using 5 feet of movement."},"tree stride":{"n":"Tree Stride","m":"Level 5 Conjuration (Druid, Ranger)","ct":"Action","rg":"Self","cp":"V, S","du":"Concentration, up to 1 minute","d":"You gain the ability to enter a tree and move from inside it to inside another tree of the same kind within 500 feet. Both trees must be living and at least the same size as you. You must use 5 feet of movement to enter a tree. You instantly know the location of all other trees of the same kind within 500 feet and, as part of the move used to enter the tree, can either pass into one of those trees or step out of the tree you’re in. You appear in a spot of your choice within 5 feet of the destination tree, using another 5 feet of movement. If you have no movement left, you appear within 5 feet of the tree you entered. You can use this transportation ability only once on each of your turns. You must end each turn out- side a tree."},"true polymorph":{"n":"True Polymorph","m":"Level 9 Transmutation (Bard, Warlock, Wizard)","ct":"Action","rg":"30 feet","cp":"V, S, M (a drop of mercury, a dollop of gum arabic, and a wisp of smoke)","du":"Concentration, up to 1 hour","d":"Choose one creature or nonmagical object that you can see within range. The creature shape-shifts into a different creature or a nonmagical object, or the object shape-shifts into a creature (the object must be neither worn nor carried). The transformation lasts for the duration or until the target dies or is destroyed, but if you maintain Concentration on this spell for the full duration, the spell lasts until dispelled. An unwilling creature can make a Wisdom saving Creature into Creature. throw, and if it succeeds, it isn’t affected by this spell. If you turn a creature into another kind of creature, the new form can be any kind you choose that has a Challenge Rating equal to or less than the target’s Challenge Rating or level. The target’s game statistics are replaced by the stat block of the new form, but it retains its Hit Points, Hit Point Dice, alignment, and personality. The target gains a number of Temporary Hit Points equal to the Hit Points of the new form. These Temporary Hit Points vanish if any remain when the spell ends. The target is limited in the actions it can perform by the anatomy of its new form, and it can’t speak or cast spells. The target’s gear melds into the new form. The creature can’t use or otherwise benefit from any of Object into Creature. that equipment. You can turn an object into any kind of creature, as long as the creature’s size is no larger than the object’s size and the creature has a Challenge Rating of 9 or lower. The creature is Friendly to you and your allies. In combat, it takes its turns immediately after yours, and it obeys your commands. If the spell lasts more than an hour, you no longer control the creature. It might remain Friendly to Creature into Object. you, depending on how you have treated it. If you turn a creature into an object, it transforms along with whatever it is wearing and carrying into that form, as long as the object’s size is no larger than the creature’s size. The creature’s statistics become those of the object, and the creature has no memory of time spent in this form after the spell ends and it returns to normal."},"true resurrection":{"n":"True Resurrection","m":"Level 9 Necromancy (Cleric, Druid)","ct":"1 hour","rg":"Touch","cp":"V, S, M (diamonds worth 25,000+ GP, which the spell consumes)","du":"Instantaneous","d":"You touch a creature that has been dead for no longer than 200 years and that died for any reason except old age. The creature is revived with all its Hit Points. This spell closes all wounds, neutralizes any poison, cures all magical contagions, and lifts any curses affecting the creature when it died. The spell replaces damaged or missing organs and limbs. If the creature was Undead, it is restored to its non-Undead form. The spell can provide a new body if the original no longer exists, in which case you must speak the creature’s name. The creature then appears in an unoccupied space you choose within 10 feet of you."},"true seeing":{"n":"True Seeing","m":"Level 6 Divination (Bard, Cleric, Sorcerer, Warlock, Wizard)","ct":"Action","rg":"Touch","cp":"V, S, M (mushroom powder worth 25+ GP, which the spell consumes)","du":"1 hour","d":"For the duration, the willing creature you touch has Truesight with a range of 120 feet."},"true strike":{"n":"True Strike","m":"Divination Cantrip (Bard, Sorcerer, Warlock, Wizard)","ct":"Action","rg":"Self","cp":"S, M (a weapon with which you have profi - ciency and that is worth 1+ CP)","du":"Instantaneous","d":"Truesight with a range of 120 feet. Guided by a flash of magical insight, you make one attack with the weapon used in the spell’s casting. The attack uses your spellcasting ability for the attack and damage rolls instead of using Strength or Dexterity. If the attack deals damage, it can be Radiant damage or the weapon’s normal damage type Cantrip Upgrade. (your choice). Whether you deal Radiant damage or the weapon’s normal damage type, the attack deals extra Radiant damage when you reach levels 5 (1d6), 11 (2d6), and 17 (3d6)."},"tsunami":{"n":"Tsunami","m":"Level 8 Conjuration (Druid)","ct":"1 minute","rg":"1 mile","cp":"V, S","du":"Concentration, up to 6 rounds","d":"A wall of water springs into existence at a point you choose within range. You can make the wall up to 300 feet long, 300 feet high, and 50 feet thick. The wall lasts for the duration. When the wall appears, each creature in its area makes a Strength saving throw, taking 6d10 Bludgeoning damage on a failed save or half as much damage on a successful one. At the start of each of your turns after the wall appears, the wall, along with any creatures in it, moves 50 feet away from you. Any Huge or smaller creature inside the wall or whose space the wall enters when it moves must succeed on a Strength saving throw or take 5d10 Bludgeoning damage. A creature can take this damage only once per round. At the end of the turn, the wall’s height is reduced by 50 feet, and the damage the wall deals on later rounds is reduced by 1d10. When the wall reaches 0 feet in height, the spell ends. A creature caught in the wall can move by swimming. Because of the wave’s force, though, the creature must succeed on a Strength (Athletics) check against your spell save DC to move at all. If it fails the check, it can’t move. A creature that moves out of the wall falls to the ground."},"unseen servant":{"n":"Unseen Servant","m":"Level 1 Conjuration (Bard, Warlock, Wizard)","ct":"Action or Ritual","rg":"60 feet","cp":"V, S, M (a bit of string and of wood)","du":"1 hour","d":"This spell creates an Invisible, mindless, shapeless, Medium force that performs simple tasks at your command until the spell ends. The servant springs into existence in an unoccupied space on the ground within range. It has AC 10, 1 Hit Point, and a Strength of 2, and it can’t attack. If it drops to 0 Hit Points, the spell ends. Once on each of your turns as a Bonus Action, you can mentally command the servant to move up to 15 feet and interact with an object. The servant can perform simple tasks that a human could do, such as fetching things, cleaning, mending, folding clothes, lighting fires, serving food, and pouring drinks. Once you give the command, the servant performs the task to the best of its ability until it completes the task, then waits for your next command. If you command the servant to perform a task that would move it more than 60 feet away from you, the spell ends."},"vampiric touch":{"n":"Vampiric Touch","m":"Level 3 Necromancy (Sorcerer, Warlock, Wizard)","ct":"Action","rg":"Self","cp":"V, S","du":"Concentration, up to 1 minute","d":"The touch of your shadow-wreathed hand can siphon life force from others to heal your wounds. Make a melee spell attack against one creature within reach. On a hit, the target takes 3d6 Necrotic damage, and you regain Hit Points equal to half the amount of Necrotic damage dealt. Until the spell ends, you can make the attack again on each of your turns as a Magic action, targeting Using a Higher-Level Spell Slot. the same creature or a different one. The damage in- creases by 1d6 for each spell slot level above 3."},"vicious mockery":{"n":"Vicious Mockery","m":"Enchantment Cantrip (Bard)","ct":"Action","rg":"60 feet","cp":"V","du":"Instantaneous","d":"You unleash a string of insults laced with subtle enchantments at one creature you can see or hear within range. The target must succeed on a Wisdom saving throw or take 1d6 Psychic damage and have Disadvantage on the next attack roll it makes before Cantrip Upgrade. the end of its next turn. The damage increases by 1d6 when you reach levels 5 (2d6), 11 (3d6), and 17 (4d6)."},"vitriolic sphere":{"n":"Vitriolic Sphere","m":"Level 4 Evocation (Sorcerer, Wizard)","ct":"Action","rg":"150 feet","cp":"V, S, M (a drop of bile)","du":"Instantaneous","d":"You point at a location within range, and a glowing, 1-foot-diameter ball of acid streaks there and explodes in a 20-foot-radius Sphere. Each creature in that area makes a Dexterity saving throw. On a failed save, a creature takes 10d4 Acid damage and another 5d4 Acid damage at the end of its next turn. On a successful save, a creature takes half the initial Using a Higher-Level Spell Slot. damage only. The initial damage increases by 2d4 for each spell slot level above 4."},"wall of fire":{"n":"Wall of Fire","m":"Level 4 Evocation (Druid, Sorcerer, Wizard)","ct":"Action","rg":"120 feet","cp":"V, S, M (a piece of charcoal)","du":"Concentration, up to 1 minute","d":"You create a wall of fire on a solid surface within range. You can make the wall up to 60 feet long, 20 feet high, and 1 foot thick, or a ringed wall up to 20 feet in diameter, 20 feet high, and 1 foot thick. The wall is opaque and lasts for the duration. When the wall appears, each creature in its area makes a Dexterity saving throw, taking 5d8 Fire damage on a failed save or half as much damage on a successful one. One side of the wall, selected by you when you cast this spell, deals 5d8 Fire damage to each creature that ends its turn within 10 feet of that side or inside the wall. A creature takes the same damage when it enters the wall for the first time on a turn or ends its turn there. The other Using a Higher-Level Spell Slot. side of the wall deals no damage. The damage increases by 1d8 for each spell slot level above 4."},"wall of force":{"n":"Wall of Force","m":"Level 5 Evocation (Wizard) Dispel Magic. Disintegrate","ct":"Action","rg":"120 feet","cp":"V, S, M (a shard of glass)","du":"Concentration, up to 10 minutes","d":"An Invisible wall of force springs into existence at a point you choose within range. The wall appears in any orientation you choose, as a horizontal or vertical barrier or at an angle. It can be free floating or resting on a solid surface. You can form it into a hemispherical dome or a globe with a radius of up to 10 feet, or you can shape a flat surface made up of ten 10-foot-by-10-foot panels. Each panel must be contiguous with another panel. In any form, the wall is 1/4 inch thick and lasts for the duration. If the wall cuts through a creature’s space when it appears, the creature is pushed to one side of the wall (you choose which side). Nothing can physically pass through the wall. It is immune to all damage and can’t be dispelled by A spell destroys the wall instantly, however. The wall also extends into the Ethereal Plane and blocks ethereal travel through the wall."},"wall of ice":{"n":"Wall of Ice","m":"Level 6 Evocation (Wizard)","ct":"Action","rg":"120 feet","cp":"V, S, M (a piece of quartz)","du":"Concentration, up to 10 minutes","d":"You create a wall of ice on a solid surface within range. You can form it into a hemispherical dome or a globe with a radius of up to 10 feet, or you can shape a flat surface made up of ten 10-foot-square panels. Each panel must be contiguous with another panel. In any form, the wall is 1 foot thick and lasts for the duration. If the wall cuts through a creature’s space when it appears, the creature is pushed to one side of the wall (you choose which side) and makes a Dexterity saving throw, taking 10d6 Cold damage on a failed save or half as much damage on a successful one. The wall is an object that can be damaged and thus breached. It has AC 12 and 30 Hit Points per 10-foot section, and it has Immunity to Cold, Poison, and Psychic damage and Vulnerability to Fire damage. Reducing a 10-foot section of wall to 0 Hit Points destroys it and leaves behind a sheet of frigid air in the space the wall occupied. A creature moving through the sheet of frigid air for the first time on a turn makes a Constitution saving throw, taking 5d6 Cold damage on a failed save or half as much damage on a successful one. Using a Higher-Level Spell Slot. The damage the wall deals when it appears increases by 2d6 and the damage from passing through the sheet of frigid air increases by 1d6 for each spell slot level above 6."},"wall of stone":{"n":"Wall of Stone","m":"Level 5 Evocation (Druid, Sorcerer, Wizard)","ct":"Action","rg":"120 feet","cp":"V, S, M (a cube of granite)","du":"Concentration, up to 10 minutes","d":"A nonmagical wall of solid stone springs into existence at a point you choose within range. The wall is 6 inches thick and is composed of ten 10-foot-by10-foot panels. Each panel must be contiguous with another panel. Alternatively, you can create 10-footby-20-foot panels that are only 3 inches thick. If the wall cuts through a creature’s space when it appears, the creature is pushed to one side of the wall (you choose which side). If a creature would be surrounded on all sides by the wall (or the wall and another solid surface), that creature can make a Dexterity saving throw. On a success, it can use its Reaction to move up to its Speed so that it is no longer enclosed by the wall. The wall can have any shape you desire, though it can’t occupy the same space as a creature or object. The wall doesn’t need to be vertical or rest on a firm foundation. It must, however, merge with and be solidly supported by existing stone. Thus, you can use this spell to bridge a chasm or create a ramp. If you create a span greater than 20 feet in length, you must halve the size of each panel to create supports. You can crudely shape the wall to create battlements and the like. The wall is an object made of stone that can be damaged and thus breached. Each panel has AC 15 and 30 Hit Points per inch of thickness, and it has Immunity to Poison and Psychic damage. Reducing a panel to 0 Hit Points destroys it and might cause connected panels to collapse at the GM’s discretion. If you maintain your Concentration on this spell for its full duration, the wall becomes permanent and can’t be dispelled. Otherwise, the wall disap- pears when the spell ends."},"wall of thorns":{"n":"Wall of Thorns","m":"Level 6 Conjuration (Druid)","ct":"Action","rg":"120 feet","cp":"V, S, M (a handful of thorns)","du":"Concentration, up to 10 minutes","d":"You create a wall of tangled brush bristling with needle-sharp thorns. The wall appears within range on a solid surface and lasts for the duration. You choose to make the wall up to 60 feet long, 10 feet high, and 5 feet thick or a circle that has a 20-foot diameter and is up to 20 feet high and 5 feet thick. The wall blocks line of sight. When the wall appears, each creature in its area makes a Dexterity saving throw, taking 7d8 Piercing damage on a failed save or half as much damage on a successful one. A creature can move through the wall, albeit slowly and painfully. For every 1 foot a creature moves through the wall, it must spend 4 feet of movement. Furthermore, the first time a creature enters a space in the wall on a turn or ends its turn there, the creature makes a Dexterity saving throw, taking 7d8 Slashing damage on a failed save or half as much damage on a successful one. A creature Using a Higher-Level Spell Slot. makes this save only once per turn. Both types of damage increase by 1d8 for each spell slot level above 6."},"warding bond":{"n":"Warding Bond","m":"Level 2 Abjuration (Cleric, Paladin)","ct":"Action","rg":"Touch","cp":"V, S, M (a pair of platinum rings worth 50+ GP each, which you and the target must wear for the duration)","du":"1 hour","d":"You touch another creature that is willing and create a mystic connection between you and the target until the spell ends. While the target is within 60 feet of you, it gains a +1 bonus to AC and saving throws, and it has Resistance to all damage. Also, each time it takes damage, you take the same amount of damage. The spell ends if you drop to 0 Hit Points or if you and the target become separated by more than 60 feet. It also ends if the spell is cast again on either of the connected creatures."},"water breathing":{"n":"Water Breathing","m":"Level 3 Transmutation (Druid, Ranger, Sorcerer, Wizard)","ct":"Action or Ritual","rg":"30 feet","cp":"V, S, M (a short reed)","du":"24 hours","d":"This spell grants up to ten willing creatures of your choice within range the ability to breathe underwater until the spell ends. Affected creatures also retain their normal mode of respiration."},"water walk":{"n":"Water Walk","m":"Level 3 Transmutation (Cleric, Druid, Ranger, Sorcerer)","ct":"Action or Ritual","rg":"30 feet","cp":"V, S, M (a piece of cork)","du":"1 hour","d":"This spell grants the ability to move across any liquid surface—such as water, acid, mud, snow, quicksand, or lava—as if it were harmless solid ground (creatures crossing molten lava can still take damage from the heat). Up to ten willing creatures of your choice within range gain this ability for the duration. An affected target must take a Bonus Action to pass from the liquid’s surface into the liquid itself and vice versa, but if the target falls into the liquid, the target passes through the surface into the liquid below."},"web":{"n":"Web","m":"Level 2 Conjuration (Sorcerer, Wizard)","ct":"Action","rg":"60 feet","cp":"V, S, M (a bit of spiderweb)","du":"Concentration, up to 1 hour","d":"You conjure a mass of sticky webbing at a point within range. The webs fill a 20-foot Cube there for the duration. The webs are Difficult Terrain, and the area within them is Lightly Obscured. If the webs aren’t anchored between two solid masses (such as walls or trees) or layered across a floor, wall, or ceiling, the web collapses on itself, and the spell ends at the start of your next turn. Webs layered over a flat surface have a depth of 5 feet. The first time a creature enters the webs on a turn or starts its turn there, it must succeed on a Dexterity saving throw or have the Restrained condition while in the webs or until it breaks free. A creature Restrained by the webs can take an action to make a Strength (Athletics) check against your spell save DC. If it succeeds, it is no longer Restrained. The webs are flammable. Any 5-foot Cube of webs exposed to fire burns away in 1 round, dealing 2d4 Fire damage to any creature that starts its turn in the fire."},"weird":{"n":"Weird","m":"Level 9 Illusion (Warlock, Wizard)","ct":"Action","rg":"120 feet","cp":"V, S","du":"Concentration, up to 1 minute","d":"You try to create illusory terrors in others’ minds. Each creature of your choice in a 30-foot-radius Sphere centered on a point within range makes a Wisdom saving throw. On a failed save, a target takes 10d10 Psychic damage and has the Frightened condition for the duration. On a successful save, a target takes half as much damage only. A Frightened target makes a Wisdom saving throw at the end of each of its turns. On a failed save, it takes 5d10 Psychic damage. On a successful save, the spell ends on that target."},"wind walk":{"n":"Wind Walk","m":"Level 6 Transmutation (Druid)","ct":"1 minute","rg":"30 feet","cp":"V, S, M (a candle)","du":"8 hours","d":"You and up to ten willing creatures of your choice within range assume gaseous forms for the duration, appearing as wisps of cloud. While in this cloud form, a target has a Fly Speed of 300 feet and can hover; it has Immunity to the Prone condition; and it has Resistance to Bludgeoning, Piercing, and Slashing damage. The only actions a target can take in this form are the Dash action or a Magic action to begin reverting to its normal form. Reverting takes 1 minute, during which the target has the Stunned condition. Until the spell ends, the target can revert to cloud form, which also requires a Magic action followed by a 1-minute transformation. If a target is in cloud form and flying when the effect ends, the target descends 60 feet per round for 1 minute until it lands, which it does safely. If it can’t land after 1 minute, it falls the remaining distance."},"wind wall":{"n":"Wind Wall","m":"Level 3 Evocation (Druid, Ranger)","ct":"Action","rg":"120 feet","cp":"V, S, M (a fan and a feather)","du":"Concentration, up to 1 minute","d":"A wall of strong wind rises from the ground at a point you choose within range. You can make the wall up to 50 feet long, 15 feet high, and 1 foot thick. You can shape the wall in any way you choose so long as it makes one continuous path along the ground. The wall lasts for the duration. When the wall appears, each creature in its area makes a Strength saving throw, taking 4d8 Bludgeoning damage on a failed save or half as much damage on a successful one. The strong wind keeps fog, smoke, and other gases at bay. Small or smaller flying creatures or objects can’t pass through the wall. Loose, lightweight materials brought into the wall fly upward. Arrows, bolts, and other ordinary projectiles launched at targets behind the wall are deflected upward and miss automatically. Boulders hurled by Giants or siege engines, and similar projectiles, are unaffected. Creatures in gaseous form can’t pass through it."},"wish":{"n":"Wish","m":"Level 9 Conjuration (Sorcerer, Wizard) Wish Greater Restoration Wish Wish Wish","ct":"Action","rg":"Self","cp":"V","du":"Instantaneous","d":"Wish is the mightiest spell a mortal can cast. By simply speaking aloud, you can alter reality itself. The basic use of this spell is to duplicate any other spell of level 8 or lower. If you use it this way, you don’t need to meet any requirements to cast that spell, including costly components. The spell simply takes effect. Alternatively, you can create one of the following effects of your choice: Object Creation. You create one object of up to 25,000 GP in value that isn’t a magic item. The object can be no more than 300 feet in any dimension, and it appears in an unoccupied space that you can see on the ground. Instant Health. You allow yourself and up to twenty creatures that you can see to regain all Hit Points, and you end all effects on them listed in the Greater Restoration spell. Resistance. You grant up to ten creatures that you can see Resistance to one damage type that you choose. This Resistance is permanent. Spell Immunity. You grant up to ten creatures you can see immunity to a single spell or other magical effect for 8 hours. Sudden Learning. You replace one of your feats with another feat for which you are eligible. You lose all the benefits of the old feat and gain the benefits of the new one. You can’t replace a feat that is a prerequisite for any of your other feats or features. Roll Redo. You undo a single recent event by forcing a reroll of any die roll made within the last round (including your last turn). Reality reshapes itself to accommodate the new result. For example, a Wish spell could undo an ally’s failed saving throw or a foe’s Critical Hit. You can force the reroll to be made with Advantage or Disadvantage, and you choose whether to use the reroll or the original roll. Reshape Reality. You may wish for something not included in any of the other effects. To do so, state your wish to the GM as precisely as possible. The GM has great latitude in ruling what occurs in such an instance; the greater the wish, the greater the likelihood that something goes wrong. This spell might simply fail, the effect you desire might be achieved only in part, or you might suffer an unforeseen consequence as a result of how you worded the wish. For example, wishing that a villain were dead might propel you forward in time to a period when that villain is no longer alive, effectively removing you from the game. Similarly, wishing for a Legendary magic item or an Artifact might instantly transport you to the presence of the item’s current owner. If your wish is granted and its effects have consequences for a whole community, region, or world, you are likely to attract powerful foes. If your wish would affect a god, the god’s divine servants might instantly intervene to prevent it or to encourage you to craft the wish in a particular way. If your wish would undo the multiverse itself, your wish fails. The stress of casting Wish to produce any effect other than duplicating another spell weakens you. After enduring that stress, each time you cast a spell until you finish a Long Rest, you take 1d10 Necrotic damage per level of that spell. This damage can’t be reduced or prevented in any way. In addition, your Strength score becomes 3 for 2d4 days. For each of those days that you spend resting and doing nothing more than light activity, your remaining recovery time decreases by 2 days. Finally, there is a 33 percent chance that you are unable to cast Wish ever again if you suffer this stress."},"word of recall":{"n":"Word of Recall","m":"Level 6 Conjuration (Cleric)","ct":"Action","rg":"5 feet","cp":"V","du":"Instantaneous","d":"You and up to five willing creatures within 5 feet of you instantly teleport to a previously designated sanctuary. You and any creatures that teleport with you appear in the nearest unoccupied space to the spot you designated when you prepared your sanctuary (see below). If you cast this spell without first preparing a sanctuary, the spell has no effect. You must designate a location, such as a temple, as a sanctuary by casting this spell there."},"zone of truth":{"n":"Zone of Truth","m":"Level 2 Enchantment (Bard, Cleric, Paladin)","ct":"Action 60 feet","rg":"","cp":"V, S","du":"10 minutes","d":"You create a magical zone that guards against deception in a 15-foot-radius Sphere centered on a point within range. Until the spell ends, a creature that enters the spell’s area for the first time on a turn or starts its turn there makes a Charisma saving throw. On a failed save, a creature can’t speak a deliberate lie while in the radius. You know whether a creature succeeds or fails on this save. An affected creature is aware of the spell and can avoid answering questions to which it would normally respond with a lie. Such a creature can be evasive yet must be truthful."}};
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
const ENCOUNTER_POOLS = {
  "Swamp": ["Giant Frog","Constrictor Snake","Giant Venomous Snake","Stirge","Swarm of Insects","Crocodile","Giant Toad","Ghoul","Will-o'-Wisp","Swarm of Venomous Snakes","Ochre Jelly","Green Hag","Giant Constrictor Snake","Shambling Mound","Giant Crocodile","Troll","Otyugh","Hydra","Black Dragon Wyrmling","Young Black Dragon","Adult Black Dragon","Ancient Black Dragon"],
  "Forest": ["Wolf","Boar","Giant Wolf Spider","Sprite","Blink Dog","Black Bear","Satyr","Dryad","Elk","Brown Bear","Dire Wolf","Giant Spider","Harpy","Awakened Tree","Ettercap","Giant Boar","Giant Elk","Werewolf","Owlbear","Phase Spider","Green Hag","Centaur Trooper","Gnoll Warrior","Treant","Young Green Dragon","Adult Green Dragon"],
  "Jungle": ["Baboon","Giant Frog","Giant Lizard","Swarm of Insects","Panther","Pteranodon","Ape","Constrictor Snake","Tiger","Giant Constrictor Snake","Allosaurus","Saber-Toothed Tiger","Ankylosaurus","Giant Scorpion","Couatl","Triceratops","Giant Ape","Tyrannosaurus Rex"],
  "Desert": ["Scorpion","Vulture","Jackal","Flying Snake","Camel","Hyena","Bandit","Dust Mephit","Giant Hyena","Giant Vulture","Giant Scorpion","Bandit Captain","Mummy","Lamia","Air Elemental","Brass Dragon Wyrmling","Blue Dragon Wyrmling","Young Brass Dragon","Efreeti","Young Blue Dragon","Adult Brass Dragon","Adult Blue Dragon","Purple Worm","Mummy Lord"],
  "Open Sea": ["Piranha","Merfolk Skirmisher","Reef Shark","Giant Crab","Sahuagin Warrior","Giant Seahorse","Swarm of Piranhas","Harpy","Hunter Shark","Sea Hag","Merrow","Pirate","Plesiosaurus","Killer Whale","Archelon","Giant Octopus","Water Elemental","Giant Shark","Pirate Captain","Young Bronze Dragon","Adult Bronze Dragon","Dragon Turtle","Kraken"],
  "Mountains": ["Goat","Eagle","Blood Hawk","Giant Goat","Giant Eagle","Hippogriff","Harpy","Griffon","Basilisk","Manticore","Ogre","Ettin","Wyvern","Chimera","Stone Giant","Hill Giant","Frost Giant","Cloud Giant","Roc","Young Copper Dragon","Adult Copper Dragon","Storm Giant"],
  "Roadside": ["Mastiff","Guard","Bandit","Goblin Minion","Warrior Infantry","Wolf","Goblin Warrior","Scout","Hobgoblin Warrior","Worg","Tough","Bugbear Warrior","Goblin Boss","Spy","Bandit Captain","Berserker","Wererat","Doppelganger","Hobgoblin Captain","Warrior Veteran","Knight","Guard Captain","Tough Boss","Ogre","Assassin"],
  "Cavern": ["Giant Bat","Swarm of Bats","Giant Centipede","Darkmantle","Grimlock","Gray Ooze","Grick","Rust Monster","Ochre Jelly","Gargoyle","Gelatinous Cube","Basilisk","Black Pudding","Bulette","Troll","Ettin","Cloaker","Roper","Xorn","Behir","Purple Worm"],
  "Dungeon": ["Rat","Giant Rat","Skeleton","Zombie","Animated Flying Sword","Animated Armor","Shadow","Ghoul","Mimic","Animated Rug of Smothering","Ghast","Gargoyle","Minotaur Skeleton","Specter","Wight","Doppelganger","Ghost","Flesh Golem","Otyugh","Assassin","Clay Golem","Stone Golem","Shield Guardian","Oni","Vampire Spawn","Iron Golem","Archmage","Vampire"],
  "Crypt": ["Skeleton","Zombie","Warhorse Skeleton","Shadow","Ghoul","Swarm of Crawling Claws","Ghast","Ogre Zombie","Specter","Minotaur Skeleton","Wight","Mummy","Will-o'-Wisp","Vampire Familiar","Ghost","Wraith","Vampire Spawn","Night Hag","Mummy Lord","Vampire","Lich"],
  "Volcanic": ["Magma Mephit","Steam Mephit","Magmin","Hell Hound","Azer Sentinel","Fire Elemental","Salamander","Nightmare","Half-Dragon","Red Dragon Wyrmling","Fire Giant","Efreeti","Young Red Dragon","Adult Red Dragon","Ancient Red Dragon"],
  "Storm Peak": ["Blood Hawk","Eagle","Giant Eagle","Hippogriff","Harpy","Griffon","Air Elemental","Wyvern","Manticore","Djinni","Behir","Cloud Giant","Roc","Young Blue Dragon","Storm Giant","Adult Blue Dragon"],
  "Feywild": ["Sprite","Pseudodragon","Blink Dog","Satyr","Awakened Shrub","Dryad","Giant Owl","Sphinx of Wonder","Pegasus","Will-o'-Wisp","Harpy","Awakened Tree","Owlbear","Green Hag","Unicorn","Night Hag","Treant","Couatl"],
  "Shadowfell": ["Shadow","Darkmantle","Death Dog","Specter","Ghast","Will-o'-Wisp","Wight","Ghost","Nightmare","Cloaker","Wraith","Night Hag","Vampire Spawn","Vampire","Lich"],
  "Fiendish Realm": ["Lemure","Imp","Quasit","Dretch","Hell Hound","Bearded Devil","Nightmare","Succubus","Incubus","Barbed Devil","Night Hag","Vrock","Salamander","Chain Devil","Hezrou","Bone Devil","Glabrezu","Horned Devil","Erinyes","Rakshasa","Nalfeshnee","Ice Devil","Marilith","Balor","Pit Fiend"],
  "Underdark": ["Shrieker Fungus","Violet Fungus","Grimlock","Darkmantle","Giant Centipede","Gray Ooze","Giant Spider","Grick","Rust Monster","Gelatinous Cube","Ochre Jelly","Gibbering Mouther","Phase Spider","Doppelganger","Black Pudding","Chuul","Minotaur of Baphomet","Medusa","Drider","Cloaker","Roper","Spirit Naga","Aboleth","Behir","Purple Worm"],
  "Arctic": ["Owl","Wolf","Giant Owl","Ice Mephit","Dire Wolf","Polar Bear","Winter Wolf","Giant Elk","Saber-Toothed Tiger","Werebear","Mammoth","Frost Giant","Remorhaz","White Dragon Wyrmling","Young White Dragon","Adult White Dragon","Ancient White Dragon"],
  "Urban": ["Cat","Rat","Commoner","Giant Rat","Swarm of Rats","Guard","Bandit","Cultist","Noble","Mastiff","Tough","Spy","Priest Acolyte","Pirate","Imp","Cultist Fanatic","Bandit Captain","Wererat","Doppelganger","Mimic","Ghost","Priest","Berserker","Knight","Warrior Veteran","Gargoyle","Guard Captain","Tough Boss","Assassin","Mage","Vampire Spawn","Archmage","Vampire"],
};
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

const LAIR_THEMES = {
  "Swamp": [
    { n: "Grasping Mud", mech: "save", ab: "str", dc: 13, dmg: "", half: false, cond: "Restrained", condR: 1, desc: "Sucking mud and tangled roots erupt, clutching at legs and dragging the unwary down." },
    { n: "Toxic Bubbles", mech: "save", ab: "con", dc: 13, dmg: "2d6", dtype: "poison", half: true, desc: "Fetid gas belches up from the murk in bursting, rainbow-slicked bubbles." },
    { n: "Biting Swarm", mech: "save", ab: "con", dc: 12, dmg: "2d4", dtype: "piercing", half: true, desc: "A whining cloud of stinging insects boils out of the reeds." },
    { n: "Rolling Fog", mech: "note", desc: "Thick grey fog crawls across the water — the area is heavily obscured until initiative 20 next round." },
  ],
  "Forest": [
    { n: "Lashing Branches", mech: "save", ab: "dex", dc: 13, dmg: "2d6", dtype: "bludgeoning", half: true, desc: "The canopy convulses — boughs whip down like flails." },
    { n: "Entangling Roots", mech: "save", ab: "str", dc: 13, dmg: "", half: false, cond: "Restrained", condR: 1, desc: "Roots shrug up out of the loam and coil around boots and greaves." },
    { n: "Hornet Burst", mech: "save", ab: "con", dc: 12, dmg: "2d4", dtype: "piercing", half: true, desc: "A papery nest splits open; the air turns to furious, glittering static." },
    { n: "Deepwood Gloom", mech: "note", desc: "The light dies between the trunks — the area is dim light and lightly obscured until initiative 20 next round." },
  ],
  "Jungle": [
    { n: "Strangler Vines", mech: "save", ab: "str", dc: 14, dmg: "", half: false, cond: "Restrained", condR: 1, desc: "Green cables drop soundlessly from the canopy and cinch tight." },
    { n: "Venom Drip", mech: "save", ab: "con", dc: 13, dmg: "2d6", dtype: "poison", half: true, desc: "The canopy shivers and sheds a rain of stinging, milky sap." },
    { n: "Screaming Canopy", mech: "save", ab: "wis", dc: 12, dmg: "", half: false, cond: "Frightened", condR: 1, desc: "A hundred unseen throats shriek at once from the green dark overhead." },
    { n: "Sudden Sinkhole", mech: "save", ab: "dex", dc: 13, dmg: "2d6", dtype: "bludgeoning", half: true, cond: "Prone", condR: null, desc: "The ground simply stops being there — a mouth of wet earth yawns open." },
  ],
  "Desert": [
    { n: "Sinking Sands", mech: "save", ab: "str", dc: 13, dmg: "", half: false, cond: "Restrained", condR: 1, desc: "The dune underfoot turns fluid, swallowing legs to the knee." },
    { n: "Sun's Hammer", mech: "save", ab: "con", dc: 13, dmg: "2d8", dtype: "radiant", half: true, desc: "The light sharpens to a white blade; the air itself seems to burn." },
    { n: "Scouring Wind", mech: "save", ab: "dex", dc: 13, dmg: "2d6", dtype: "slashing", half: true, desc: "A wall of wind-borne sand strips paint from shields and skin from knuckles." },
    { n: "Mirage Shift", mech: "note", desc: "The horizon doubles and swims — until initiative 20 next round, distances deceive and the terrain is difficult to judge." },
  ],
  "Open Sea": [
    { n: "Rogue Wave", mech: "save", ab: "str", dc: 14, dmg: "2d6", dtype: "bludgeoning", half: true, cond: "Prone", condR: null, desc: "A grey mountain of water heaves over the rail without warning." },
    { n: "Undertow", mech: "save", ab: "str", dc: 13, dmg: "", half: false, cond: "Restrained", condR: 1, desc: "Something colder than the sea wraps ankles and pulls straight down." },
    { n: "Lightning Squall", mech: "save", ab: "dex", dc: 14, dmg: "3d8", dtype: "lightning", half: true, desc: "The sky splits — forks of lightning walk across the water toward the ship." },
    { n: "Shrieking Gale", mech: "note", desc: "Wind screams through the rigging — ranged attacks are at disadvantage and flames gutter until initiative 20 next round." },
  ],
  "Mountains": [
    { n: "Rockslide", mech: "save", ab: "dex", dc: 14, dmg: "3d10", dtype: "bludgeoning", half: true, desc: "A shelf of scree lets go above with a sound like breaking teeth." },
    { n: "Sheer Gust", mech: "save", ab: "str", dc: 14, dmg: "", half: false, cond: "Prone", condR: null, desc: "The wind arrives sideways, solid as a shoulder-charge." },
    { n: "Ice Shear", mech: "dmg", dmg: "2d8", dtype: "slashing", desc: "A sheet of blue ice calves off the cliff face — no warning, no save." },
    { n: "Thin Air", mech: "note", desc: "Every breath comes up short — until initiative 20 next round, climbing and dashing feel twice as hard (DM's discretion on checks)." },
  ],
  "Roadside": [
    { n: "Runaway Cart", mech: "save", ab: "dex", dc: 13, dmg: "2d10", dtype: "bludgeoning", half: true, desc: "An ox-cart comes down the grade driverless, wheels shrieking." },
    { n: "Caltrop Scatter", mech: "save", ab: "dex", dc: 12, dmg: "1d4", dtype: "piercing", half: false, desc: "A fistful of black iron stars skitters across the cobbles underfoot." },
    { n: "Mud-slick Ruts", mech: "save", ab: "dex", dc: 12, dmg: "", half: false, cond: "Prone", condR: null, desc: "Yesterday's rain still owns the road — the wagon ruts are grease." },
    { n: "Ambush Whistle", mech: "note", desc: "Two sharp notes from the treeline, answered by a third — someone just signaled for reinforcements." },
  ],
  "Cavern": [
    { n: "Falling Rocks", mech: "save", ab: "dex", dc: 14, dmg: "3d10", dtype: "bludgeoning", half: true, desc: "The ceiling groans, then lets go — a curtain of stone crashes down." },
    { n: "Stalactite Crash", mech: "dmg", dmg: "2d10", dtype: "piercing", desc: "A spear of ancient stone shears loose from the dark overhead — no warning, no save." },
    { n: "Tremor", mech: "save", ab: "dex", dc: 13, dmg: "", half: false, cond: "Prone", condR: null, desc: "The cavern shudders; dust and gravel hiss down from the ceiling." },
    { n: "Swallowing Dark", mech: "note", desc: "The torches gutter — magical darkness floods the area until initiative 20 next round." },
  ],
  "Dungeon": [
    { n: "Scything Blades", mech: "save", ab: "dex", dc: 14, dmg: "2d8", dtype: "slashing", half: true, desc: "Slots in the walls exhale, and steel sweeps the corridor at waist height." },
    { n: "Dart Volley", mech: "save", ab: "dex", dc: 13, dmg: "2d4", dtype: "piercing", half: false, cond: "Poisoned", condR: 1, desc: "A rank of holes in the masonry spits needles slick with something green." },
    { n: "Portcullis Slam", mech: "note", desc: "Iron drops from the lintel with a clang that rings down the corridor — the way behind is sealed." },
    { n: "Flooding Chamber", mech: "note", desc: "Grates in the floor reverse themselves — dark water is rising an inch a heartbeat. Set a round countdown." },
  ],
  "Crypt": [
    { n: "Grave Chill", mech: "save", ab: "con", dc: 13, dmg: "3d6", dtype: "necrotic", half: true, desc: "The cold of the tomb sinks past armor, past skin, into the marrow." },
    { n: "Spectral Grasp", mech: "save", ab: "str", dc: 13, dmg: "", half: false, cond: "Restrained", condR: 1, desc: "Translucent hands rise from the flagstones, clutching at ankles and wrists." },
    { n: "Wailing Dead", mech: "save", ab: "wis", dc: 13, dmg: "", half: false, cond: "Frightened", condR: 1, desc: "A chorus of the entombed rises to a shriek that claws at the mind." },
    { n: "Bone-dust Cloud", mech: "note", desc: "A choking cloud of powdered bone fills the air — the area is lightly obscured." },
  ],
  "Volcanic": [
    { n: "Magma Eruption", mech: "save", ab: "dex", dc: 15, dmg: "4d6", dtype: "fire", half: true, desc: "A geyser of molten rock bursts from a fissure in the floor." },
    { n: "Tremor", mech: "save", ab: "dex", dc: 13, dmg: "", half: false, cond: "Prone", condR: null, desc: "The ground bucks and heaves — loose stone dances across the floor." },
    { n: "Choking Ash", mech: "save", ab: "con", dc: 13, dmg: "", half: false, cond: "Blinded", condR: 1, desc: "A blast of hot ash billows through the chamber, searing eyes and lungs." },
    { n: "Scalding Steam", mech: "save", ab: "con", dc: 14, dmg: "3d6", dtype: "fire", half: true, desc: "Water meets magma somewhere below — shrieking jets of steam knife up through cracks." },
  ],
  "Storm Peak": [
    { n: "Lightning Arc", mech: "save", ab: "dex", dc: 15, dmg: "4d6", dtype: "lightning", half: true, desc: "Lightning arcs from the ground itself, leaping between stone and steel." },
    { n: "Howling Winds", mech: "save", ab: "str", dc: 14, dmg: "", half: false, cond: "Prone", condR: null, desc: "A shrieking gust slams across the peak, hurling creatures from their feet." },
    { n: "Thunderclap", mech: "save", ab: "con", dc: 13, dmg: "2d8", dtype: "thunder", half: true, cond: "Deafened", condR: 1, desc: "The sky detonates — a wall of sound rolls over everything." },
    { n: "Freezing Squall", mech: "save", ab: "con", dc: 13, dmg: "2d6", dtype: "cold", half: true, desc: "Sleet rides the wind sideways, crusting armor with ice." },
  ],
  "Underdark": [
    { n: "Faerzress Surge", mech: "save", ab: "wis", dc: 13, dmg: "2d8", dtype: "psychic", half: true, desc: "The stone's ambient magic spikes — violet light crawls the walls and presses into every mind." },
    { n: "Spore Bloom", mech: "save", ab: "con", dc: 13, dmg: "", half: false, cond: "Poisoned", condR: 1, desc: "A ridge of puffball fungi detonates in sequence, filling the tunnel with drifting motes." },
    { n: "Tunnel Collapse", mech: "save", ab: "dex", dc: 14, dmg: "3d10", dtype: "bludgeoning", half: true, desc: "Something enormous shifts its weight far above — the passage ceiling follows." },
    { n: "Absolute Dark", mech: "note", desc: "Every flame and glowing fungus dies at once — magical darkness owns the tunnel until initiative 20 next round." },
  ],
  "Arctic": [
    { n: "Ice Slick", mech: "save", ab: "dex", dc: 12, dmg: "", half: false, cond: "Prone", condR: null, desc: "Meltwater refrozen to black glass — the floor gives no purchase at all." },
    { n: "Killing Cold", mech: "save", ab: "con", dc: 13, dmg: "2d8", dtype: "cold", half: true, desc: "The temperature plunges past cold into something that burns." },
    { n: "Crevasse Crack", mech: "save", ab: "dex", dc: 14, dmg: "2d10", dtype: "bludgeoning", half: true, desc: "The floe splits with a gunshot report, and the edges grind like millstones." },
    { n: "Whiteout", mech: "note", desc: "Wind lifts the snow into a spinning wall — the area is heavily obscured until initiative 20 next round." },
  ],
  "Urban": [
    { n: "Collapsing Scaffold", mech: "save", ab: "dex", dc: 13, dmg: "2d10", dtype: "bludgeoning", half: true, desc: "Rope parts somewhere overhead, and a builder's scaffold folds into the street." },
    { n: "Panicked Crowd", mech: "save", ab: "str", dc: 12, dmg: "", half: false, cond: "Prone", condR: null, desc: "The market breaks like a wave — a human stampede with nowhere to go but through." },
    { n: "Sewer Vent", mech: "save", ab: "con", dc: 12, dmg: "", half: false, cond: "Poisoned", condR: 1, desc: "A grate exhales something warm and sweet-rotten from the tunnels below." },
    { n: "Watch Whistle", mech: "note", desc: "Three shrill notes ring off the rooftops, answered from two streets over — the City Watch is coming. Set a round countdown." },
  ],
  "Shadowfell": [
    { n: "Despair's Weight", mech: "save", ab: "wis", dc: 13, dmg: "", half: false, cond: "Frightened", condR: 1, desc: "Hope drains out of the moment like heat — every certainty suddenly feels like a lie." },
    { n: "Hungry Shadows", mech: "save", ab: "con", dc: 13, dmg: "3d6", dtype: "necrotic", half: true, desc: "The shadows lean in and sip at warmth, at color, at life." },
    { n: "Grasping Gloom", mech: "save", ab: "str", dc: 13, dmg: "", half: false, cond: "Restrained", condR: 1, desc: "The gloom gains substance — cold, boneless limbs of dark wrap tight." },
    { n: "Light Death", mech: "note", desc: "Every nonmagical flame gutters out, and even magical light dims to half — until initiative 20 next round." },
  ],
  "Fiendish Realm": [
    { n: "Hellfire Geyser", mech: "save", ab: "dex", dc: 14, dmg: "3d8", dtype: "fire", half: true, desc: "A fissure vents flame the color of an open wound." },
    { n: "Brimstone Choke", mech: "save", ab: "con", dc: 13, dmg: "", half: false, cond: "Poisoned", condR: 1, desc: "Sulfurous smoke rolls low across the ground, acrid enough to strip a throat raw." },
    { n: "Wailing Damned", mech: "save", ab: "wis", dc: 13, dmg: "", half: false, cond: "Frightened", condR: 1, desc: "The ground itself moans — a thousand voices in one, and all of them know your name." },
    { n: "Blood Rain", mech: "note", desc: "A hot, red rain begins to fall, hissing where it lands — the area is lightly obscured and thoroughly unnerving." },
  ],
  "Feywild": [
    { n: "Beguiling Lights", mech: "save", ab: "wis", dc: 13, dmg: "", half: false, cond: "Charmed", condR: 1, desc: "Motes of dancing light spiral close, whispering half-heard invitations." },
    { n: "Thorned Vines", mech: "save", ab: "dex", dc: 13, dmg: "2d6", dtype: "piercing", half: true, desc: "Rose-briars whip from the earth in a lashing, blooming tangle." },
    { n: "Wild Laughter", mech: "save", ab: "wis", dc: 12, dmg: "", half: false, cond: "Charmed", condR: 1, desc: "Unseen voices erupt in laughter that tugs at the corners of every mind." },
    { n: "Blooming Spores", mech: "save", ab: "con", dc: 13, dmg: "", half: false, cond: "Poisoned", condR: 1, desc: "Flowers burst open in unison, dusting the air with glittering pollen." },
  ],
};

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

function CustomMonsterForm({ onAdd, onClose }) {
  const [f, setF] = useState({ name: "", count: 1, ac: 12, hp: 10, dex: 0, con: 0, side: "enemy", resist: "", immune: "", vuln: "", notes: "" });
  const [acts, setActs] = useState([{ n: "", hit: 4, dmg: "1d6+2", dtype: "slashing" }]);
  const [saveToo, setSaveToo] = useState(true);
  const set = (k, v) => setF({ ...f, [k]: v });
  const setAct = (i, k, v) => setActs(acts.map((a, j) => (j === i ? { ...a, [k]: v } : a)));
  const csv = (s) => s.split(",").map((x) => x.trim()).filter(Boolean);
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Custom monster</h3>
        <div className="frow"><label>Name</label><input type="text" value={f.name} onChange={(e) => set("name", e.target.value)} autoFocus /></div>
        <div className="grid2">
          <div className="frow"><label>Count</label><input type="number" value={f.count} min={1} max={20} onChange={(e) => set("count", e.target.value)} /></div>
          <div className="frow"><label>Side</label>
            <select value={f.side} onChange={(e) => set("side", e.target.value)}>
              <option value="enemy">Enemy</option><option value="ally">Ally / NPC</option>
            </select></div>
          <div className="frow"><label>AC</label><input type="number" value={f.ac} onChange={(e) => set("ac", e.target.value)} /></div>
          <div className="frow"><label>HP</label><input type="number" value={f.hp} onChange={(e) => set("hp", e.target.value)} /></div>
          <div className="frow"><label>DEX mod</label><input type="number" value={f.dex} onChange={(e) => set("dex", e.target.value)} /></div>
          <div className="frow"><label>CON mod</label><input type="number" value={f.con} onChange={(e) => set("con", e.target.value)} /></div>
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
          </div>
        ))}
        <button className="btn small ghost" onClick={() => setActs([...acts, { n: "", hit: 4, dmg: "1d6+2", dtype: "slashing" }])}>+ another attack</button>
        <div className="frow"><label>Notes</label><input type="text" value={f.notes} onChange={(e) => set("notes", e.target.value)} /></div>
        <div className="frow"><label style={{ minWidth: 0 }}><input type="checkbox" checked={saveToo} onChange={(e) => setSaveToo(e.target.checked)} /> Save to my bestiary</label></div>
        <div className="frow" style={{ justifyContent: "flex-end", marginTop: 8 }}>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={!f.name}
            onClick={() => onAdd({
              name: f.name, ac: parseInt(f.ac, 10) || 10, hp: parseInt(f.hp, 10) || 1,
              mods: { dex: parseInt(f.dex, 10) || 0, con: parseInt(f.con, 10) || 0 },
              resist: csv(f.resist), immune: csv(f.immune), vuln: csv(f.vuln),
              actions: acts.filter((a) => a.n).map((a) => ({ n: a.n, kind: "atk", hit: parseInt(a.hit, 10) || 0, dmg: a.dmg, dtype: a.dtype })),
            }, parseInt(f.count, 10) || 1, f.side, f.notes, saveToo)}>
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

function BestiaryModal({ custom, onAdd, onDeleteCustom, onImport, onClose }) {
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
              </span>
            ))}
          </div>
        </>)}

        {q.trim() ? (
          <>
            <div className="lbl" style={{ fontSize: 11, color: "var(--faint)", margin: "10px 0 2px", letterSpacing: ".1em", textTransform: "uppercase" }}>SRD — {builtIn.length} match{builtIn.length === 1 ? "" : "es"}</div>
            <div className="mlist">
              {builtIn.map((b) => (
                <button key={b.name} className="btn" onClick={() => onAdd(b, count, rollHp)}>
                  {b.name}<br /><span className="cr">CR {b.cr} · AC {b.ac} · {b.hp} HP{bestiaryBadges(b) ? " " : ""}{bestiaryBadges(b)}</span>
                </button>
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
                        <button key={b.name} className="btn" onClick={() => onAdd(b, count, rollHp)}>
                          {b.name}<br /><span className="cr">CR {b.cr} · AC {b.ac} · {b.hp} HP{bestiaryBadges(b) ? " " : ""}{bestiaryBadges(b)}</span>
                        </button>
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
  const [bkText, setBkText] = useState("");
  const [bkMsg, setBkMsg] = useState("");
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
              Exports your entire collection — bestiary, encounters, monster groups, and party settings — as text to copy somewhere safe. Storage only lives inside Claude, so back up anything you'd hate to lose.
            </div>
            <textarea rows={6} style={{ width: "100%", fontFamily: "var(--mono)", fontSize: 11 }}
              placeholder="Export fills this box — copy it out. Or paste a backup here and Import." value={bkText} onChange={(e) => setBkText(e.target.value)} />
            <div className="frow" style={{ marginTop: 6 }}>
              <button className="btn small" onClick={async () => {
                const obj = await onExportAll();
                setBkText(JSON.stringify(obj));
                setBkMsg(`Exported ${obj.bestiary.length} bestiary, ${Object.keys(obj.slots).length} encounters, ${Object.keys(obj.groups).length} groups. Copy the text!`);
              }}>Export everything</button>
              <button className="btn small primary" disabled={!bkText.trim()} onClick={async () => {
                try {
                  const obj = JSON.parse(bkText);
                  if (obj.app !== "dm5e") throw new Error("Not a DM Screen backup.");
                  const r = await onImportAll(obj);
                  setBkMsg(`Imported: ${r.bestiary} bestiary, ${r.slots} encounters, ${r.groups} groups.`);
                  setBkText(""); refresh();
                } catch (e) { setBkMsg(`Import failed: ${e.message}`); }
              }}>Import</button>
              {bkMsg && <span style={{ fontSize: 12, color: "var(--dim)" }}>{bkMsg}</span>}
            </div>
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
  const botPad = 24;
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

      <div className="main" style={{ paddingTop: toasts.length ? Math.min(12 + toasts.length * 44, 108) : undefined, transition: "padding-top .3s ease" }}>
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
      {modal?.type === "custom" && <CustomMonsterForm onAdd={(sb, count, side, notes, saveToo) => { addCustom(sb, count, side, notes, saveToo); setModal(null); }} onClose={() => setModal(null)} />}
      {modal?.type === "bestiary" && (
        <BestiaryModal custom={myBestiary} onAdd={(sb, count, rollHp) => { addFromBestiary(sb, count, rollHp); setModal(null); }}
          onDeleteCustom={(name) => saveMyBestiary(myBestiary.filter((x) => x.name !== name))}
          onImport={(arr) => upsertBestiary(arr)}
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
