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
.activecard-anchor{scroll-margin-top:calc(54px + env(safe-area-inset-top,0px))}
.dmgline{font-family:var(--mono);color:var(--gold);font-size:11.5px}
.tobtag{font-size:9px;color:var(--faint);border:1px solid var(--line2);border-radius:4px;padding:0 4px;margin-left:6px;vertical-align:2px;letter-spacing:.05em}
.partygrid{display:flex;flex-direction:column;gap:5px}
.pgh,.pgr{display:grid;grid-template-columns:22px minmax(0,1fr) 46px 46px 58px;gap:4px;align-items:center}
.pgh span{font-size:10px;color:var(--faint);letter-spacing:.05em;text-transform:uppercase;text-align:center}
.pgh span:nth-child(2){text-align:left;padding-left:2px}
.pgh .opt{display:block;font-size:8px;font-style:italic;text-transform:none;letter-spacing:0;opacity:.65;white-space:nowrap}
.pgh .opt.req{color:var(--gold);opacity:.85;font-style:normal}
.morestats{margin-top:4px;padding:6px 8px;border:1px solid var(--line2);border-radius:10px;background:var(--panel)}
.mstat-row{display:flex;flex-direction:column;gap:3px;padding:5px 0}
.mstat-row+.mstat-row{border-top:1px solid var(--line)}
.mstat-name{font-size:12px;font-weight:600;color:var(--dim)}
.mstat-fields{display:flex;flex-wrap:wrap;gap:5px}
.mstat-fields label{display:inline-flex;flex-direction:column;align-items:center;font-size:9px;color:var(--faint);text-transform:uppercase;gap:1px}
.mstat-fields input{width:42px;text-align:center;box-sizing:border-box;background:var(--raised);border:1px solid var(--line2);border-radius:7px;color:var(--text);-webkit-text-fill-color:var(--text);caret-color:var(--gold);padding:5px 3px;font-size:16px;-moz-appearance:textfield}
.mstat-fields input::-webkit-outer-spin-button,.mstat-fields input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
.chgrid{display:flex;flex-wrap:wrap;gap:6px}
.chstat{display:inline-flex;flex-direction:column;align-items:center;font-size:10px;color:var(--faint);text-transform:uppercase;gap:2px}
.chstat input{width:56px;text-align:center;box-sizing:border-box;background:var(--panel);border:1px solid var(--line2);border-radius:8px;color:var(--text);-webkit-text-fill-color:var(--text);caret-color:var(--gold);padding:6px 4px;font-size:16px;-moz-appearance:textfield}
.chstat input::-webkit-outer-spin-button,.chstat input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
.pgr input[type="text"],.pgr input[type="number"]{width:100%;box-sizing:border-box;min-width:0;background:var(--panel);border:1px solid var(--line2);border-radius:8px;color:var(--text);-webkit-text-fill-color:var(--text);caret-color:var(--gold);padding:6px 6px;font-size:16px}
.pgr input[type="number"]{text-align:center;-moz-appearance:textfield}
.pgr input::-webkit-outer-spin-button,.pgr input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
.pgr input[type="checkbox"]{width:17px;height:17px;accent-color:var(--gold);margin:0 auto}
/* damage-type effects: quick contained flourishes over the hit row, a beat before the HP drops */
.dmgfx{position:absolute;inset:0;pointer-events:none;overflow:hidden;border-radius:2px;z-index:3}
.dmgfx i,.dmgfx svg{position:absolute}
.dmgfx .fxflash{inset:0;opacity:0;animation:fxflash .5s ease forwards}
@keyframes fxflash{12%{opacity:.8}100%{opacity:0}}
.dmgfx .fxsweep{inset:0;transform:translateX(-105%);animation:fxsweep .55s ease-in forwards}
@keyframes fxsweep{100%{transform:translateX(105%)}}
.dmgfx .fxring{left:50%;top:50%;width:12px;height:12px;border-radius:50%;transform:translate(-50%,-50%) scale(.15);animation:fxring .55s cubic-bezier(.2,.7,.3,1) forwards}
@keyframes fxring{0%{opacity:1}100%{transform:translate(-50%,-50%) scale(16);opacity:0}}
.dmgfx .fxslash{top:46%;left:-45%;width:70%;height:3px;border-radius:2px;background:linear-gradient(90deg,transparent,#fff 45%,#fff 55%,transparent);box-shadow:0 0 8px rgba(255,255,255,.8);transform:rotate(-16deg);animation:fxslash .34s ease-in forwards}
@keyframes fxslash{100%{left:110%}}
.dmgfx .fxbolt{inset:0;width:100%;height:100%;filter:drop-shadow(0 0 6px rgba(140,200,255,.9));animation:fxbolt .5s steps(1) forwards;opacity:0}
@keyframes fxbolt{0%{opacity:1}18%{opacity:.25}30%{opacity:1}55%{opacity:.4}70%{opacity:.9}100%{opacity:0}}
.dmgfx .fxbub{bottom:-6px;border-radius:50%;opacity:0;animation:fxbub .7s ease-out forwards}
@keyframes fxbub{10%{opacity:.9}100%{transform:translateY(-46px);opacity:0}}
.dmgfx .fxflame{bottom:0;height:100%;border-radius:50% 50% 0 0;filter:blur(1px);transform:translateY(105%);
  background:linear-gradient(0deg,rgba(255,110,30,.65),rgba(255,190,70,.35) 55%,transparent);animation:fxflame .9s ease-in-out forwards}
@keyframes fxflame{0%{transform:translateY(105%)}30%{transform:translateY(22%)}55%{transform:translateY(44%)}80%{transform:translateY(0)}100%{transform:translateY(0);opacity:0}}
.dmgfx .fxfireall{inset:0;opacity:0;background:linear-gradient(0deg,rgba(255,85,20,.8),rgba(255,165,50,.6));animation:fxfireall .95s ease forwards}
@keyframes fxfireall{0%{opacity:0}50%{opacity:.12}78%{opacity:.92}88%{opacity:.85}100%{opacity:0}}
.dmgfx .fxfrost{top:0;bottom:0;width:51%;transform:scaleX(0);animation:fxfrost .9s ease-in forwards}
.dmgfx .fxfrost.l{left:0;transform-origin:left center;background:linear-gradient(90deg,rgba(165,218,255,.62) 65%,rgba(165,218,255,.2))}
.dmgfx .fxfrost.r{right:0;transform-origin:right center;background:linear-gradient(270deg,rgba(165,218,255,.62) 65%,rgba(165,218,255,.2))}
@keyframes fxfrost{0%{opacity:.95}55%{transform:scaleX(1);opacity:.95}88%{transform:scaleX(1);opacity:.95}100%{transform:scaleX(1);opacity:0}}
.dmgfx .fxcoldall{inset:0;opacity:0;background:rgba(168,220,255,.75);animation:fxcoldall .9s ease forwards}
@keyframes fxcoldall{55%{opacity:0}75%{opacity:.9}88%{opacity:.9}100%{opacity:0}}
.dmgfx .fxdot{opacity:0;filter:blur(.5px);box-shadow:0 0 10px rgba(140,220,90,.6);animation:fxdot .7s ease forwards}
@keyframes fxdot{20%{opacity:.95;transform:scale(1.15) rotate(8deg)}100%{opacity:0;transform:scale(.7) rotate(-6deg)}}
.dmgfx .fxskull{opacity:0;font-size:12px;line-height:1;filter:drop-shadow(0 0 5px rgba(150,90,220,.95));animation:fxskullk .8s ease forwards}
@keyframes fxskullk{20%{opacity:1;transform:translateY(-2px) scale(1.15)}100%{opacity:0;transform:translateY(-11px) scale(.8)}}
.dmgfx .fxrays{top:-40%;bottom:-40%;left:-20%;right:-20%;opacity:0;transform:translateX(-18%);filter:blur(1px);animation:fxrays .85s ease forwards}
.dmgfx .fxspokes{left:50%;top:50%;width:240%;aspect-ratio:1/1;opacity:0;filter:blur(1px) brightness(1);
  transform:translate(-50%,-50%) rotate(0deg);animation:fxspokes .95s ease-in-out forwards}
@keyframes fxspokes{10%{opacity:.9}65%{opacity:1;filter:blur(1px) brightness(1.6)}88%{opacity:1;filter:blur(2.5px) brightness(2.8)}100%{transform:translate(-50%,-50%) rotate(90deg);opacity:0;filter:blur(3px) brightness(3)}}
.dmgfx .fxblowout{inset:0;opacity:0;background:radial-gradient(circle, rgba(255,250,230,.98), rgba(255,235,170,.92));animation:fxblowout .95s ease forwards}
@keyframes fxblowout{50%{opacity:0}77%{opacity:.85}82%{opacity:1}90%{opacity:1}96%{opacity:0}100%{opacity:0}}
@keyframes fxrays{18%{opacity:.95}80%{opacity:.55}100%{opacity:0;transform:translateX(18%)}}
.dmgfx .fxringsm{width:10px;height:10px;border-radius:50%;transform:scale(.2);animation:fxringsm .6s cubic-bezier(.2,.7,.3,1) forwards}
@keyframes fxringsm{0%{opacity:1}100%{transform:scale(5);opacity:0}}
.dmgfx .fxringbig{left:50%;top:50%;width:12px;height:12px;border-radius:50%;transform:translate(-50%,-50%) scale(.2);animation:fxringbig .5s ease-out forwards}
@keyframes fxringbig{0%{opacity:1}100%{transform:translate(-50%,-50%) scale(46);opacity:0}}
.dmgfx .fxriser{left:4%;right:4%;bottom:-6%;height:3px;border-radius:2px;box-shadow:0 0 8px rgba(190,150,255,.8);
  background:linear-gradient(90deg,transparent,rgba(205,175,255,.95) 45%,rgba(235,225,255,.95) 55%,transparent);animation:fxriser .42s ease-in forwards}
@keyframes fxriser{100%{bottom:108%}}
.dmgfx .fxspark{opacity:0;font-size:13px;line-height:1;color:#ffe9a8;text-shadow:0 0 8px rgba(255,230,150,.9);animation:fxspark .75s ease forwards}
@keyframes fxspark{15%{opacity:1;transform:scale(1.3) rotate(20deg)}100%{opacity:0;transform:scale(.4) rotate(50deg)}}
.sfx{position:fixed;inset:0;z-index:185;pointer-events:none;overflow:hidden}
.sfx .sfx-vig{position:absolute;inset:0;opacity:0;box-shadow:inset 0 0 100px 25px rgba(170,25,25,.5);animation:sfxvig .55s ease forwards}
@keyframes sfxvig{38%{opacity:1}68%{opacity:.5}100%{opacity:0}}
.sfx .jaw{position:absolute;left:-3%;right:-3%;height:34%;filter:drop-shadow(0 0 10px rgba(255,70,70,.45))}
.sfx .jaw svg{width:100%;height:100%;display:block}
.sfx .jaw.t{top:0;animation:sfxjaw-t .55s cubic-bezier(.45,0,.35,1) forwards}
.sfx .jaw.b{bottom:0;animation:sfxjaw-b .55s cubic-bezier(.45,0,.35,1) forwards}
@keyframes sfxjaw-t{0%{transform:translateY(-101%)}44%{transform:translateY(28%)}60%{transform:translateY(28%)}100%{transform:translateY(-101%)}}
@keyframes sfxjaw-b{0%{transform:translateY(101%)}44%{transform:translateY(-28%)}60%{transform:translateY(-28%)}100%{transform:translateY(101%)}}
/* claw: three parallel gashes raking across on a diagonal */
.sfx .claw{position:absolute;top:-25%;height:150%;width:6px;border-radius:4px;
  background:linear-gradient(180deg,transparent,rgba(255,240,240,.95) 22%,rgba(255,110,110,.92) 50%,rgba(255,240,240,.95) 78%,transparent);
  box-shadow:0 0 14px rgba(255,80,80,.85);animation:sfxclaw .5s cubic-bezier(.3,.5,.2,1) forwards}
@keyframes sfxclaw{0%{opacity:0;transform:rotate(20deg) translateX(-62vw)}18%{opacity:1}100%{opacity:0;transform:rotate(20deg) translateX(62vw)}}
/* slam: shockwave ring + flash + edge punch */
.sfx .slam-ring{position:absolute;left:50%;top:50%;width:20px;height:20px;border-radius:50%;border:6px solid rgba(255,235,200,.9);transform:translate(-50%,-50%) scale(.2);animation:sfxslamring .5s cubic-bezier(.15,.7,.3,1) forwards}
@keyframes sfxslamring{0%{opacity:1}100%{transform:translate(-50%,-50%) scale(34);opacity:0}}
.sfx .slam-flash{position:absolute;inset:0;opacity:0;background:radial-gradient(circle,rgba(255,240,220,.55),transparent 62%);animation:sfxslamflash .45s ease forwards}
@keyframes sfxslamflash{0%{opacity:.9}100%{opacity:0}}
.sfx .slam-vig{position:absolute;inset:0;opacity:0;box-shadow:inset 0 0 120px 42px rgba(70,45,22,.72);animation:sfxslamvig .5s ease forwards}
@keyframes sfxslamvig{18%{opacity:1}100%{opacity:0}}
/* gore: bone horns thrusting up from the bottom edge */
.sfx .gore{position:absolute;bottom:-12%;width:15px;height:72%;border-radius:9px 9px 0 0;
  background:linear-gradient(0deg,rgba(224,214,194,.96),rgba(224,214,194,.3) 68%,transparent);box-shadow:0 0 16px rgba(255,110,80,.6);
  transform:translateY(106%);animation:sfxgore .52s cubic-bezier(.2,.8,.3,1) forwards}
@keyframes sfxgore{0%{opacity:0;transform:translateY(106%) rotate(var(--gr,0deg))}30%{opacity:1}62%{transform:translateY(-8%) rotate(var(--gr,0deg))}100%{opacity:0;transform:translateY(-8%) rotate(var(--gr,0deg))}}
.sfx .gore-vig{position:absolute;inset:0;opacity:0;box-shadow:inset 0 -80px 70px -20px rgba(170,25,25,.5);animation:sfxvig .52s ease forwards}
/* sting: a fast venom-green whip snapping across */
.sfx .sting{position:absolute;top:-12%;left:50%;height:124%;width:4px;border-radius:3px;
  background:linear-gradient(180deg,transparent,rgba(205,255,165,.96),rgba(120,220,90,.92),transparent);box-shadow:0 0 12px rgba(140,240,100,.9);
  animation:sfxsting .42s ease-in forwards}
@keyframes sfxsting{0%{opacity:0;transform:rotate(34deg) translateX(-42vw)}25%{opacity:1}100%{opacity:0;transform:rotate(34deg) translateX(42vw)}}
/* ranged: a projectile streaking across */
.sfx .arrow{position:absolute;top:44%;left:-16%;width:130px;height:3px;border-radius:2px;
  background:linear-gradient(90deg,transparent,rgba(255,240,210,.9) 78%,#fff);box-shadow:0 0 9px rgba(255,220,160,.85);
  animation:sfxarrow .4s cubic-bezier(.4,0,.7,1) forwards}
@keyframes sfxarrow{0%{opacity:0;left:-16%}16%{opacity:1}100%{opacity:.85;left:112%}}
/* generic hit: a soft neutral edge pulse — every landed attack registers */
.sfx .hit-vig{position:absolute;inset:0;opacity:0;box-shadow:inset 0 0 60px 10px rgba(232,224,196,.42);animation:sfxhit .36s ease forwards}
@keyframes sfxhit{32%{opacity:1}100%{opacity:0}}
/* spell/breath — colored by damage type via --sc */
.sfx .cone{position:absolute;left:-6%;top:50%;width:118%;height:150%;transform:translateY(-50%) scaleX(.08);transform-origin:left center;
  opacity:0;filter:blur(2px);clip-path:polygon(0 47%,100% -6%,100% 106%,0 53%);
  background:linear-gradient(90deg,var(--sc),transparent 82%);animation:sfxcone .62s ease-out forwards}
@keyframes sfxcone{0%{opacity:0;transform:translateY(-50%) scaleX(.08)}22%{opacity:.92}68%{opacity:.85}100%{opacity:0;transform:translateY(-50%) scaleX(1)}}
.sfx .sbolt{position:absolute;inset:0;opacity:0;filter:drop-shadow(0 0 14px var(--sc));animation:sfxsbolt .52s steps(1) forwards}
@keyframes sfxsbolt{0%{opacity:1}20%{opacity:.3}34%{opacity:1}58%{opacity:.4}74%{opacity:.95}100%{opacity:0}}
.sfx .burst{position:absolute;left:50%;top:50%;width:30px;height:30px;border-radius:50%;transform:translate(-50%,-50%) scale(.15);
  background:radial-gradient(circle,var(--sc),transparent 66%);opacity:0;animation:sfxburst .55s cubic-bezier(.15,.7,.3,1) forwards}
@keyframes sfxburst{0%{opacity:.98}18%{opacity:1}100%{transform:translate(-50%,-50%) scale(42);opacity:0}}
.sfx .burst-ring{position:absolute;left:50%;top:50%;width:20px;height:20px;border-radius:50%;border:5px solid var(--sc);
  transform:translate(-50%,-50%) scale(.2);animation:sfxburstring .55s cubic-bezier(.15,.7,.3,1) forwards}
@keyframes sfxburstring{0%{opacity:1}100%{transform:translate(-50%,-50%) scale(36);opacity:0}}
/* missiles: a volley of darts streaking in and converging */
.sfx .msl{position:absolute;left:50%;top:50%;width:32px;height:3px;border-radius:2px;
  background:linear-gradient(90deg,transparent,#fff);box-shadow:0 0 9px var(--sc);opacity:0;animation:sfxmsl .55s cubic-bezier(.3,0,.45,1) forwards}
@keyframes sfxmsl{0%{opacity:0;transform:translate(var(--fx),var(--fy)) rotate(var(--mr))}22%{opacity:1}80%{opacity:1;transform:translate(-12px,0) rotate(var(--mr))}100%{opacity:0;transform:translate(-12px,0) rotate(var(--mr))}}
/* storm: streaks raining down from the top edge */
.sfx .drop{position:absolute;top:-14%;width:3px;height:42px;border-radius:2px;
  background:linear-gradient(180deg,transparent,var(--sc));box-shadow:0 0 6px var(--sc);opacity:0;animation:sfxdrop .6s ease-in forwards}
@keyframes sfxdrop{12%{opacity:.9}100%{opacity:0;transform:translateY(125vh)}}
/* beam: a clean straight ray lancing across */
.sfx .beam{position:absolute;top:47%;left:-8%;width:116%;height:8px;border-radius:5px;transform:scaleX(0);transform-origin:left center;
  background:linear-gradient(90deg,var(--sc),#fff 50%,var(--sc));box-shadow:0 0 22px var(--sc);opacity:0;animation:sfxbeam .5s ease-out forwards}
@keyframes sfxbeam{0%{opacity:0;transform:scaleX(0)}26%{opacity:1;transform:scaleX(1)}70%{opacity:.9}100%{opacity:0;transform:scaleX(1)}}
/* column: a pillar slamming down from above */
.sfx .column{position:absolute;left:50%;top:-10%;width:34%;height:130%;transform:translateX(-50%) scaleY(0);transform-origin:top center;filter:blur(1px);
  background:linear-gradient(180deg,var(--sc),rgba(255,255,255,.4) 42%,var(--sc) 72%,transparent);box-shadow:0 0 34px var(--sc);opacity:0;animation:sfxcolumn .55s ease-out forwards}
@keyframes sfxcolumn{0%{opacity:0;transform:translateX(-50%) scaleY(0)}24%{opacity:.95;transform:translateX(-50%) scaleY(1)}70%{opacity:.85}100%{opacity:0;transform:translateX(-50%) scaleY(1)}}
/* wave: concentric shove rippling outward */
.sfx .wave-r{position:absolute;left:50%;top:50%;width:24px;height:24px;border-radius:50%;border:4px solid var(--sc);
  transform:translate(-50%,-50%) scale(.2);opacity:0;animation:sfxwave .58s ease-out forwards}
@keyframes sfxwave{0%{opacity:.9}100%{transform:translate(-50%,-50%) scale(32);opacity:0}}
.demorow{position:relative;display:flex;align-items:center;gap:8px;background:var(--panel);border:1px solid var(--line2);
  border-radius:8px;padding:8px 10px;overflow:hidden;margin:4px 0;font-size:13px}
.row.fxshake{animation:fxshake .45s ease}
.demorow.fxshake{animation:fxshake .45s ease}
@keyframes fxshake{0%,100%{transform:translateX(0)}20%{transform:translateX(-3px)}40%{transform:translateX(3px)}60%{transform:translateX(-2px)}80%{transform:translateX(2px)}}
.vic-overlay{position:fixed;inset:0;z-index:190;display:flex;align-items:center;justify-content:center;cursor:pointer;
  background:radial-gradient(ellipse at center, rgba(64,48,10,.5), rgba(10,8,4,.8));animation:vicfade .5s ease}
.vic-overlay.out{animation:vicout .32s ease forwards}
@keyframes vicfade{0%{opacity:0}100%{opacity:1}}
@keyframes vicout{100%{opacity:0}}
.vic-inner{text-align:center}
.vic-row{display:flex;align-items:center;justify-content:center;gap:14px}
.vic-pop{position:relative;display:inline-block}
.vic-pop-e{display:inline-block;font-size:42px;line-height:1;animation:vicpop .55s ease .25s both}
.vic-pop.r .vic-pop-e{transform:scaleX(-1)}
@keyframes vicpop{0%{opacity:0;transform:scale(.3) rotate(-20deg)}60%{opacity:1;transform:scale(1.3) rotate(9deg)}100%{opacity:1;transform:scale(1)}}
.vic-pop.r .vic-pop-e{animation-name:vicpopr}
@keyframes vicpopr{0%{opacity:0;transform:scaleX(-1) scale(.3) rotate(20deg)}60%{opacity:1;transform:scaleX(-1) scale(1.3) rotate(-9deg)}100%{opacity:1;transform:scaleX(-1) scale(1)}}
.vic-cf{position:absolute;left:50%;top:36%;width:7px;height:11px;border-radius:2px;opacity:0;pointer-events:none;
  animation:viccf 1.15s ease forwards}
@keyframes viccf{0%{opacity:0;transform:translate(0,0) rotate(0deg)}12%{opacity:1}100%{opacity:0;transform:translate(var(--cx),var(--cy)) rotate(var(--cr))}}
.vic-word{font-family:var(--disp);font-weight:800;font-size:46px;letter-spacing:.12em;color:var(--gold);
  text-shadow:0 0 28px rgba(217,164,65,.55);display:inline-flex}
.vic-l{opacity:0;display:inline-block;animation:vicl .6s ease both}
@keyframes vicl{0%{opacity:0;transform:translateY(16px) scale(.7)}60%{opacity:1;transform:translateY(-3px) scale(1.08)}100%{opacity:1;transform:translateY(0) scale(1)}}
.vic-sub{margin-top:16px;font-family:var(--disp);font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:rgba(233,226,214,.6);animation:vicl .5s ease 1.15s both}
.tpk-overlay{position:fixed;inset:0;z-index:200;pointer-events:none;display:flex;align-items:center;justify-content:center;
  background:radial-gradient(ellipse at center, rgba(70,4,4,.55), rgba(12,2,2,.85));animation:tpkfade 5s ease forwards}
.tpk-inner{text-align:center;animation:tpkrise 5s ease forwards}
.tpk-skull{font-size:100px;line-height:1;filter:drop-shadow(0 0 26px rgba(224,100,90,.65))}
.tpk-text{font-family:var(--disp);font-weight:800;font-size:68px;letter-spacing:.18em;color:var(--danger);
  text-shadow:0 0 34px rgba(224,100,90,.55);margin-top:4px}
.tpk-sub{font-family:var(--disp);font-size:13px;letter-spacing:.32em;text-transform:uppercase;color:rgba(233,226,214,.78);margin-top:10px}
@keyframes tpkfade{0%{opacity:0}12%{opacity:1}80%{opacity:1}100%{opacity:0}}
@keyframes tpkrise{0%{transform:scale(.72);opacity:0}14%{transform:scale(1.05);opacity:1}20%{transform:scale(1)}80%{transform:scale(1);opacity:1}100%{transform:scale(1.1);opacity:0}}
.ghostrail{position:fixed;top:calc(52px + env(safe-area-inset-top,0px));left:8px;right:8px;z-index:95;
  display:flex;flex-direction:column;gap:6px;pointer-events:none}
.ghostrow{background:var(--panel);border:1px solid var(--line2);border-radius:10px;
  box-shadow:0 8px 22px rgba(0,0,0,.55);animation:grin .3s ease}
.ghostrow.out{animation:grout .35s ease forwards}
.ghostrow .row{border-bottom:none}
@keyframes grin{0%{opacity:0;transform:translateY(-110%)}100%{opacity:1;transform:translateY(0)}}
@keyframes grout{100%{opacity:0;transform:translateY(-110%)}}
.turnbar{position:fixed;left:0;right:0;bottom:0;z-index:50;display:flex;align-items:center;gap:10px;
  padding:10px 14px;padding-bottom:calc(10px + env(safe-area-inset-bottom,0px));
  background:var(--ink);border-top:1px solid var(--line)}
.turnbar .tb-round{font-family:var(--disp);font-size:12px;letter-spacing:.08em;color:var(--text);
  border:1px solid var(--line2);border-radius:6px;padding:3px 8px;white-space:nowrap}
.turnbar .tb-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  font-family:var(--disp);font-weight:700;font-size:13px;letter-spacing:.06em;color:var(--gold)}
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
.chip{display:inline-flex;align-items:center;gap:3px;flex-wrap:wrap;font-family:var(--mono);font-size:12px;background:var(--ink);
  border:1px solid var(--line);border-radius:5px;padding:1px 6px;white-space:nowrap}
.die{flex-shrink:0;transform-origin:50% 50%}
.die.rolling{animation:dietumble .95s cubic-bezier(.3,.7,.3,1)}
@keyframes dietumble{
  0%{transform:rotate(0deg) scale(.8)}
  20%{transform:rotate(160deg) scale(1.1)}
  35%{transform:rotate(128deg) scale(1)}
  60%{transform:rotate(-150deg) scale(1.07)}
  75%{transform:rotate(-116deg) scale(1)}
  100%{transform:rotate(0deg) scale(1)}
}
@media (prefers-reduced-motion: reduce){.die.rolling{animation:none}}
.touchlayer{position:fixed;inset:0;pointer-events:none;z-index:999}
.touchring{position:absolute;left:0;top:0;will-change:transform}
.touchdot{width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;
  border:2.5px solid var(--gold);background:rgba(217,164,65,.2);
  box-shadow:0 0 14px 3px rgba(217,164,65,.45);animation:touchin .1s ease}
.touchring.pop .touchdot{animation:touchpop .38s ease forwards}
@keyframes touchin{0%{transform:scale(.5);opacity:.4}100%{transform:scale(1);opacity:1}}
@keyframes touchpop{0%{transform:scale(1);opacity:1}100%{transform:scale(1.7);opacity:0}}
.chip-reveal{animation:chipdrop .28s ease both}
@keyframes chipdrop{0%{opacity:0;transform:translateY(-7px)}65%{opacity:1;transform:translateY(2px)}100%{opacity:1;transform:translateY(0)}}
@media (prefers-reduced-motion: reduce){.chip-reveal{animation:none}}
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
.azbar{display:flex;flex-wrap:wrap;gap:3px;margin-bottom:8px}
.azkey{font-family:var(--mono);font-size:12px;min-width:22px;flex:1 0 auto;padding:3px 0;text-align:center;background:var(--panel);border:1px solid var(--line2);border-radius:5px;color:var(--dim);cursor:pointer}
.azkey.on{color:var(--gold);border-color:var(--gold);background:var(--gold-soft)}
.azkey:disabled{opacity:.28;cursor:default}
.pickgrid{display:flex;flex-wrap:wrap;gap:5px;margin:2px 0 6px}
.dchip{cursor:pointer;font-size:11px;border-radius:8px;padding:3px 9px;font-weight:600;text-transform:capitalize;
  color:var(--dc);border:1px solid var(--dc);background:none;opacity:.68}
.dchip.on{opacity:1;background:var(--dc);color:var(--ink);border-color:var(--dc)}
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
.btn.hitv{background:var(--ok);border-color:var(--ok);color:#14251a;font-weight:600}
.btn.missv{background:var(--danger);border-color:var(--danger);color:#2b0f0c;font-weight:600}
.chip.hit{border-color:var(--gold);color:var(--gold)}
.chip.dmg{border-color:var(--enemy);color:#e8a49b}
.chip.ok{border-color:var(--ok);color:var(--ok)}
.chip.bad{border-color:var(--danger);color:var(--danger)}

/* initiative rail */
.rail{background:var(--panel);border-bottom:1px solid var(--line)}
.rail.collapsed{display:none}
.railbar{display:flex;align-items:center;gap:8px;padding:4px 14px;background:var(--panel);
  border-bottom:1px solid var(--line);position:sticky;top:49px;z-index:31;font-size:12px;color:var(--dim)}
.row{display:flex;flex-direction:column;align-items:stretch;gap:0;padding:3px 10px 4px;border-bottom:1px solid var(--line);
  min-height:38px}
.rline{display:flex;align-items:center;gap:8px;min-width:0}
.rline.r2{padding-left:45px;gap:6px 8px;flex-wrap:wrap;margin-top:1px}
.row:last-child{border-bottom:none}
.row.active{background:var(--gold-soft);box-shadow:inset 3px 0 0 var(--gold)}
.row.dead > *:not(.lootico){opacity:.42}
.row.dead .nm{text-decoration:line-through}
.row.dead .lootico{opacity:1;filter:drop-shadow(0 0 4px rgba(217,164,65,.7))}
.initmark{font-family:var(--mono);font-size:13px;font-weight:600;width:30px;text-align:center;
  flex-shrink:0;position:relative}
.initmark.turn{color:var(--gold)}
.sidebar-dot{width:7px;height:7px;transform:rotate(45deg);flex-shrink:0}
.side-enemy{background:var(--enemy)} .side-ally{background:var(--ally)} .side-effect{background:var(--fx)}
.nm{font-weight:600;min-width:0;flex:1}
.nm .sub{font-weight:400;color:var(--faint);font-size:11px;margin-left:4px}
.hpbox{display:flex;align-items:center;gap:2px;flex-shrink:0;position:relative}
@keyframes hp-punch{0%{transform:scale(1)}30%{transform:scale(1.35)}100%{transform:scale(1)}}
@keyframes hp-float{0%{opacity:1;transform:translate(-50%,0)}100%{opacity:0;transform:translate(-50%,-16px)}}
.hpval.pd{animation:hp-punch .7s ease;color:#e0645a}
.hpval.ph{animation:hp-punch .7s ease;color:#7fbf8e}
.hpghost{position:absolute;left:50%;top:-6px;transform:translate(-50%,0);font-family:var(--mono);
  font-size:11px;font-weight:700;pointer-events:none;animation:hp-float 1.5s ease-out forwards;z-index:7;
  background:rgba(18,14,26,.92);padding:0 5px;border-radius:7px}
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
.rowconds{display:inline-flex;gap:4px;align-items:center;flex-wrap:wrap;margin-left:8px;vertical-align:middle}
.cond .condicon,.cond .condsvg{margin-right:3px}
.condicon{font-size:13px;line-height:1;cursor:pointer}
.condsvg{width:14px;height:14px;color:var(--dim);cursor:pointer;flex:none}
.pgr-icon,.lvlchip .condicon,.lvlchip .condsvg{margin-right:3px;vertical-align:-2px}
.lvlchip .condsvg{width:13px;height:13px}
@keyframes badgefade{0%{opacity:.9;transform:scale(1)}100%{opacity:0;transform:scale(.65)}}
.condghost{animation:badgefade .5s ease forwards;pointer-events:none}
@keyframes critburst{0%{box-shadow:0 0 0 0 rgba(217,164,65,.7);transform:scale(.9)}45%{box-shadow:0 0 14px 4px rgba(217,164,65,.55);transform:scale(1.12)}100%{box-shadow:0 0 0 0 rgba(217,164,65,0);transform:scale(1)}}
.chip.crit{color:var(--gold);border-color:var(--gold);background:var(--gold-soft);animation:chipdrop .28s ease both,critburst .9s ease}
@keyframes fumblethud{0%{transform:translateY(-4px);opacity:.4}55%{transform:translateY(1px)}100%{transform:translateY(0);opacity:1}}
.chip.fumble{color:var(--faint);border-color:var(--line2);animation:chipdrop .28s ease both,fumblethud .55s ease}
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
.cond{display:inline-flex;align-items:center;font-size:11px;background:var(--raised);border:1px solid var(--line2);border-radius:10px;
  padding:0 7px;line-height:18px;min-height:18px;cursor:pointer;white-space:nowrap;vertical-align:middle}
.cond:hover{border-color:var(--danger)}
.cond .rt{color:var(--gold);font-family:var(--mono)}
.conc{font-size:11px;border:1px solid var(--fx);color:#aab8e0;border-radius:10px;padding:0 7px;
  line-height:18px;cursor:pointer;white-space:nowrap}
.rtog{font-family:var(--mono);font-size:11px;border:1px solid var(--line2);border-radius:5px;
  padding:1px 6px;color:var(--faint);flex-shrink:0}
.rtog.on{border-color:var(--ok);color:var(--ok)}
.rtog.readied{border-color:var(--gold);color:var(--gold);background:var(--gold-soft);animation:badgepop .35s ease}
.advcallouts{display:flex;flex-direction:column;gap:6px;margin:8px 0 12px}
.advcallout{font-size:13px;line-height:1.55;background:var(--raised);border:1px solid var(--line2);border-left-width:3px;border-radius:8px;padding:8px 11px}
.advcallout.adv{border-left-color:#7fbf8e}
.advcallout.dis{border-left-color:#e0645a}
.advcallout .subj{color:var(--dim)}
.advkw{font-family:var(--disp);font-weight:700;letter-spacing:.6px;color:var(--dim)}
.advkw.adv{color:#9fd3ab}
.advkw.dis{color:#e8a49c}
.advfrom{color:var(--gold);font-weight:700}
.readied-modal{max-height:88vh;overflow-y:auto}
.readied-banner{font-size:12.5px;color:var(--gold);background:var(--gold-soft);border:1px solid var(--line2);border-radius:10px;padding:7px 10px;margin-bottom:8px;text-align:center}
.advchip{font-family:var(--mono);font-size:11px;border-radius:5px;padding:1px 6px;flex-shrink:0;background:none;
  border:1px dashed var(--line);color:var(--faint);opacity:.75;display:inline-flex;gap:5px;align-items:center;cursor:pointer}
.advchip.on{opacity:1;border-style:solid;border-color:var(--line2);color:var(--text)}
.advchip b{font-weight:600}
.advchip b.adv{color:var(--ok)}
.advchip b.dis{color:var(--danger)}
.advchip b.mix{color:var(--gold)}
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
.rxlist{display:flex;flex-direction:column;gap:6px}
.rxrow{display:flex;align-items:flex-start;gap:8px;padding:8px 10px;border:1px solid var(--line2);border-radius:10px;background:var(--panel);cursor:pointer}
.rxrow.on{border-color:var(--gold);background:var(--gold-soft)}
.rxrow input[type=checkbox]{margin-top:2px;width:18px;height:18px;flex:0 0 auto}
.rxico{font-size:18px;flex:0 0 auto;line-height:1.2}
.rxbody{display:flex;flex-direction:column;gap:2px;min-width:0}
.rxbody b{font-size:13px;color:var(--text)}
.rxdesc{font-size:11.5px;color:var(--faint);line-height:1.35}
.rxparam{display:inline-flex;align-items:center;gap:3px;font-size:12px;color:var(--dim);margin-left:8px}
.rxparam input{width:62px;font-size:16px;padding:1px 5px;color:var(--text);-webkit-text-fill-color:var(--text);background:var(--raised);border:1px solid var(--line2);border-radius:6px}
.rxchoices{display:flex;flex-direction:column;gap:7px;margin:4px 0 2px}
.rxpick{text-align:left;font-size:13px;padding:10px 12px;border-color:var(--gold);background:var(--gold-soft);color:var(--text)}
.rxpick:active{background:var(--gold)}
.spellchips{display:flex;flex-wrap:wrap;gap:5px;max-height:168px;overflow-y:auto;padding:2px 1px}
.spellchip{display:inline-flex;align-items:center;gap:5px;font-size:12.5px;padding:3px 6px 3px 10px;border:1px solid var(--line2);border-radius:13px;background:var(--panel);color:var(--text);cursor:pointer;white-space:nowrap}
.spellchip:hover{border-color:var(--gold)}
.spellchip .x{color:var(--faint);font-size:14px;line-height:1;cursor:pointer}
.spellchip .x:hover{color:var(--danger)}
.pcactions{display:flex;gap:8px;flex-wrap:wrap}
.pcactions .btn{font-size:14px;padding:9px 14px}
.atktarget{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 12px;border:1px solid var(--line2);border-radius:10px;background:var(--panel)}
.atktarget b{font-size:15px;color:var(--text)}
.atkac{font-family:var(--disp);font-size:20px;font-weight:700;color:var(--dim);letter-spacing:.5px}
.atkac.good{color:#9fd3ab}
.hitbtn{border-color:rgba(127,191,142,.6);background:rgba(127,191,142,.14);color:#bfe6c8;font-size:15px;font-weight:700;padding:12px 0}
.hitbtn:active{background:rgba(127,191,142,.3)}
.missbtn{border-color:rgba(224,100,90,.55);background:rgba(224,100,90,.12);color:#eba99f;font-size:15px;font-weight:700;padding:12px 0}
.missbtn:active{background:rgba(224,100,90,.28)}
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
  .hdr{gap:4px;padding:8px 6px;padding-top:calc(8px + env(safe-area-inset-top,0px))}
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

/* Build a roll result from DM-entered die values (manual dice mode) —
   same shape rollFormula returns, so everything downstream is identical. */
function valuesRoll(formula, values) {
  const s = String(formula ?? "").replace(/\s/g, "");
  if (/^-?\d+$/.test(s)) return { total: parseInt(s, 10), text: `${s}` };
  const m = s.match(/^(\d*)d(\d+)([+-]\d+)?$/i);
  if (!m) return null;
  const d = parseInt(m[2], 10), mod = parseInt(m[3] || "0", 10);
  const rolls = values || [];
  const sum = rolls.reduce((a2, b) => a2 + b, 0) + mod;
  const modTxt = mod ? (mod > 0 ? `+${mod}` : `${mod}`) : "";
  return { total: Math.max(0, sum), mod, dice: rolls.map((v) => ({ s: d, v })), text: `${rolls.join("+")}(${rolls.length}d${d})${modTxt} = ${sum}` };
}
function diceSpec(f) {
  const m = String(f ?? "").replace(/\s/g, "").match(/^(\d*)d(\d+)([+-]\d+)?$/i);
  return m ? { n: parseInt(m[1] || "1", 10), d: parseInt(m[2], 10), mod: parseInt(m[3] || "0", 10) } : null;
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
  Silenced: "In a Silence field: Deafened and can't cast spells with a Verbal (V) component. Apply to everyone inside the area.",
  "Half Cover": "+2 to AC and DEX saving throws.",
  "Three-Quarters Cover": "+5 to AC and DEX saving throws.",
  "Total Cover": "Can't be targeted directly by an attack or spell.",
};
const COVER_AC = { "Half Cover": 2, "Three-Quarters Cover": 5 };
// roster icons (DM-picked). "svg:*" values are drawn by CondIcon; the rest are emoji.
const CONDITION_ICONS = {
  Blinded: "svg:blind", Charmed: "💘", Deafened: "🔕", Frightened: "😱",
  Grappled: "🤼", Incapacitated: "🚫", Invisible: "🫥", Paralyzed: "⚡",
  Petrified: "🗿", Poisoned: "🤢", Prone: "svg:prone", Restrained: "🪢",
  Stunned: "😵‍💫", Unconscious: "🚫", Exhaustion: "🪫", Burning: "🔥", Silenced: "🤫",
  Suffocating: "🫁", Hiding: "🥷",
  "Half Cover": "🌗", "Three-Quarters Cover": "🌘", "Total Cover": "🌑",
};
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
  if (c.dodging) return { mode: "dis", from: "Dodging" };
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
/* Optional expanded bestiary (Tome of Beasts, OGL) — lazy-loaded so the main
   bundle stays lean. App assigns .on from the persisted setting during render;
   fullBestiary() is the one lookup every consumer goes through. */
const EXPANDED = { on: false, list: [], pools: {} };

/* Curated playtest encounters, balanced for the two-hero test party (~2× level 5,
   moderate budget ≈1500 XP unless noted). 'showcase' is the bespoke scaled trio. */
const PLAYTEST_ENCOUNTERS = [
  { key: "showcase", name: "Legendary Showcase", blurb: "Goblin chaff, a spellcaster, and a legendary dragon — exercises every system at once.", special: true },
  { key: "hobgoblins", name: "Hobgoblin Patrol", blurb: "Three disciplined warriors and their worg — a fair stand-up fight for two players. Moderate.", list: [["Hobgoblin Warrior", 3], ["Worg", 1]] },
  { key: "crypt", name: "Crypt of the Restless", blurb: "A wight commanding ghouls and skeletons — paralysis and life drain. Moderate.", list: [["Wight", 1], ["Ghoul", 2], ["Skeleton", 4]] },
  { key: "wolves", name: "Wolf Pack", blurb: "Two dire wolves and two wolves — pack tactics and knockdowns, sized for two players. Hard.", list: [["Dire Wolf", 2], ["Wolf", 2]] },
  { key: "spiders", name: "Spider Hollow", blurb: "A giant spider and her wolf-spider brood — webs, poison, restrained checks. Moderate for two players.", list: [["Giant Spider", 1], ["Giant Wolf Spider", 3]] },
  { key: "troll", name: "Bridge Troll", blurb: "One regenerating troll with scout archers on the banks. Hard.", list: [["Troll", 1], ["Scout", 2]] },
  { key: "dragon", name: "Young White Dragon", blurb: "Solo boss — cold breath, flight, and a bad attitude. Hard, expect blood.", list: [["Young White Dragon", 1]] },
  { key: "allgoblins", name: "All Goblins", blurb: "Goblin civil war — four warriors, two on each side, no players. Great for testing ally-side monsters.", noPlayers: true, list: [["Goblin Warrior", 2, null, "Enemy Goblin"], ["Goblin Warrior", 2, "ally", "Ally Goblin"]] },
];
const fullBestiary = () => (EXPANDED.on && EXPANDED.list.length ? BESTIARY.concat(EXPANDED.list) : BESTIARY);

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
// Opportunistically spend a matching item from a creature's loot when it's used (charges tick down; otherwise the entry is removed). No-op when nothing matches — player loot usually isn't tracked here.
function consumeLootInDraft(c, terms, L) {
  if (!c || !c.loot || !c.loot.length || !terms || !terms.length) return;
  const lc = terms.map((t) => String(t).toLowerCase()).filter(Boolean);
  const idx = c.loot.findIndex((x) => { const n = lootObj(x).n.toLowerCase(); return lc.every((t) => n.includes(t)); });
  if (idx < 0) return;
  const o = lootObj(c.loot[idx]);
  if (o.ch != null && o.ch > 1) { c.loot = c.loot.map((x, i) => (i === idx ? { ...o, ch: o.ch - 1 } : x)); L.push(`<b>${c.name}</b> expends a charge of <b>${o.n}</b> (${o.ch - 1} left).`); }
  else { c.loot = c.loot.filter((_, i) => i !== idx); L.push(`<b>${c.name}</b> uses up <b>${o.n}</b>.`); }
}
const HEAL_POTIONS = [
  { n: "Potion of Healing", f: "2d4+2" },
  { n: "Potion of Greater Healing", f: "4d4+4" },
  { n: "Potion of Superior Healing", f: "8d4+8" },
  { n: "Potion of Supreme Healing", f: "10d4+20" },
];
const ALCH_ITEMS = [
  { n: "Alchemist's Fire", f: "1d4", dt: "fire", cond: "Burning" },
  { n: "Acid (vial)", f: "2d6", dt: "acid" },
  { n: "Holy Water", f: "2d6", dt: "radiant" },
  { n: "Oil (flask, lit)", f: "5", dt: "fire", cond: "Burning" },
];

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
    const flat = /^-?\d+$/.test(String(it.wpn.dmg).trim()); // "6"-style flat damage: fold the modifier in, "6-1" won't parse
    c.actions.push({
      n: it.n, kind: "atk", hit: prof + mod + b,
      dmg: flat ? String(Math.max(1, parseInt(it.wpn.dmg, 10) + dm)) : `${it.wpn.dmg}${dm ? (dm > 0 ? `+${dm}` : `${dm}`) : ""}`,
      dtype: it.wpn.dtype, extra: it.wpn.extra, extraType: it.wpn.extraType,
      d: it.d, fromItem: it.n, ready: true, ...(it.wpn.ls ? { ls: 1 } : {}),
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
    conditions: [], concentration: null, reaction: true, advMode: "none", advVs: "none", rx: {},
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
  m.replaceActs = parseReplaceActs(m.multi, m.actions);
  m.atkUsed = 0; m.atkUsedBy = {}; m.atkGrant = 0;
  return m;
}

function makePlayer({ name, init, ac, side, hp, pp, dex, spells, memberId, spellDC, mods }) {
  const hpN = hp != null && hp !== "" ? Number(hp) : null;
  const initN = init == null || init === "" || isNaN(Number(init)) ? null : Number(init);
  const ppN = pp != null && pp !== "" ? Number(pp) : null;
  const dexN = dex == null || dex === "" || isNaN(Number(dex)) ? null : Number(dex);
  const modObj = mods && Object.keys(mods).length ? { ...mods } : (dexN != null ? { dex: dexN } : {}); // players never auto-roll saves; mods are reference (dex still breaks init ties)
  return {
    uid: newUid(), type: "player", side: side || "ally", baseName: name, name,
    ac: ac ?? null, acBoost: 0, acReaction: null, pp: ppN,
    hp: hpN, maxHp: hpN, init: initN, initText: null,
    conditions: [], concentration: null, reaction: true, advMode: "none", advVs: "none", rx: {}, atkCount: 0, dodging: false, readied: false, hidTurn: false,
    spellDC: spellDC == null || spellDC === "" ? null : Number(spellDC), // optional — auto-fills the save box when this player casts (players roll their own attacks, so no attack bonus needed)
    spells: Array.isArray(spells) ? [...spells] : [], // this player's spellbook (compendium keys); persists to their saved party member
    memberId: memberId || null, // links back to the stored party member so spellbook/DC edits survive across sessions
    dead: false, unconscious: false, ds: { s: 0, f: 0 }, stable: false,
    mods: modObj, saves: {},
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

// Some creatures roll their own attacks AND saves at advantage from an aura/trait
// (Hobgoblin's Aura of Authority; Berserker's Bloodied Frenzy while bloodied). We
// derive it live so it turns off when the gating condition (Bloodied, Incapacitated) changes.
const INCAP_CONDS = new Set(["Incapacitated", "Stunned", "Paralyzed", "Unconscious", "Petrified"]);
function selfAdvTrait(c) {
  if (!c || c.type !== "monster" || c.dead || c.unconscious) return null;
  if ((c.conditions || []).some((cd) => INCAP_CONDS.has(cd.name))) return null;
  for (const t of c.traits || []) {
    if (/Advantage on attack rolls and (?:on )?saving throws/i.test(t.d || "")) {
      if (/\bBloodied\b/i.test(t.d)) { if (isBloodied(c)) return t.n; }
      else return t.n;
    }
  }
  return null;
}
const selfAdv = (c) => (selfAdvTrait(c) ? "adv" : "none");
// What conditions/traits do to the creature's OWN attack rolls (Poisoned/Frightened/
// Blinded/Prone/Restrained → DIS, Invisible → ADV, self-advantage aura → ADV). Net of
// any that cancel. Returns {mode, from, cancel} or null.
function condOwnAdv(c) {
  let adv = false, dis = false; const froms = [];
  const aura = selfAdvTrait(c);
  if (aura) { adv = true; froms.push(aura); }
  for (const cd of c.conditions || []) {
    const v = ADV_HINT[cd.name] || cd.ownAdv; // cd.ownAdv: a buff item can grant advantage on own rolls
    if (v === "adv" && !froms.includes(cd.name)) { adv = true; froms.push(cd.name); }
    if (v === "dis" && !froms.includes(cd.name)) { dis = true; froms.push(cd.name); }
  }
  if (!adv && !dis) return null;
  return { mode: adv && dis ? "none" : adv ? "adv" : "dis", from: froms.join(", "), cancel: adv && dis };
}
const ownAdv = (c) => combineAdv(c.advMode, selfAdv(c)); // the creature's effective advantage on its own d20s
const vsState = (t) => (t.advVs && t.advVs !== "none" ? t.advVs : (condAdvVs(t) || {}).mode || "none");
const combineAdv = (aMode, tMode) => {
  const adv = aMode === "adv" || tMode === "adv";
  const dis = aMode === "dis" || tMode === "dis";
  return adv && dis ? "none" : adv ? "adv" : dis ? "dis" : "none";
};
// Non-attack actions a Multiattack lets the creature substitute for an attack
// ("It can replace one attack with a use of Life Drain") — these draw from the
// attack budget so a creature can't both use its full Multiattack AND this.
function parseReplaceActs(multi, actions) {
  if (!multi) return [];
  const names = (actions || []).filter((a) => a.kind !== "atk").map((a) => a.n);
  const out = [];
  const re = /replace\s+(?:one|two|three|four|\d+|an|its|one of its)?\s*(?:of (?:its|these) )?attacks?\s+with\s+(?:a use of |a |an |the )?([A-Z][\w'’ ]+?)(?=[.,;]|$| and | or | to )/gi;
  let m;
  while ((m = re.exec(multi))) {
    const cand = m[1].trim();
    const hit = names.find((nm) => cand === nm || cand.startsWith(nm) || nm.startsWith(cand));
    if (hit && hit !== "Spellcasting" && !out.includes(hit)) out.push(hit);
  }
  return out;
}
const atkMaxOf = (c) => c.atkMax ?? parseAtkBudget(c.multi, c.actions).max;
const atkLeft = (c) => atkMaxOf(c) + (c.atkGrant || 0) - (c.atkUsed || 0);
const replacesAttack = (c, a) => !!(a && a.kind !== "atk" && (c.replaceActs || []).includes(a.n));
const atkNameLeft = (c, name) => {
  const caps = c.atkCaps || parseAtkBudget(c.multi, c.actions).caps;
  const cap = (caps[name] != null ? caps[name] : atkMaxOf(c)) + (c.atkGrant || 0);
  return cap - ((c.atkUsedBy || {})[name] || 0);
};

const targetWorth = (t) => t.maxHp != null || vsState(t) !== "none";
const targetCands = (state, attacker) =>
  state.combatants.filter((x) => !x.dead && x.uid !== attacker.uid && x.type !== "effect" && x.type !== "object");

const sideRank = (c) => (c.side === "ally" ? 0 : c.side === "effect" ? 1 : 2);
const tieRank = (c) => (TIES.playersWin && c.type === "player" ? 0 : 1);
function sortOrder(list) {
  return [...list].sort((a, b) =>
    ((a.dead ? 1 : 0) - (b.dead ? 1 : 0)) ||             // the fallen sink to the bottom of the rail
    ((b.init ?? -999) - (a.init ?? -999)) ||
    ((a.tb ?? 0) - (b.tb ?? 0)) ||                       // explicit tie order chosen by the DM
    (tieRank(a) - tieRank(b)) ||                          // players act first on ties (setting, default on)
    ((b.mods?.dex ?? 0) - (a.mods?.dex ?? 0)) ||          // RAW: higher DEX acts first on ties
    (sideRank(a) - sideRank(b)) || 0);
}

/* Initiative ties that include a player get a DM prompt only when the app can't
   settle them fairly: players auto-win vs monsters when that setting is on, and a
   player's tracked DEX breaks ties silently (RAW). Monster-only ties always
   resolve by DEX via sortOrder. */
function playerTieGroups(list) {
  const live = list.filter((c) => !c.dead && c.init != null && c.type !== "object");
  const by = {};
  live.forEach((c) => { (by[c.init] = by[c.init] || []).push(c); });
  const dexKnown = (c) => c.type !== "player" || c.mods?.dex != null;
  // g comes sorted by sortOrder — a group needs the DM only if some adjacent pair
  // involving a player can't be separated by anything better than arbitrary order
  const ambiguous = (g) => {
    for (let i = 0; i < g.length - 1; i++) {
      const a = g[i], b = g[i + 1];
      if (a.type !== "player" && b.type !== "player") continue; // monster-only pair — DEX order stands
      if ((a.tb ?? 0) !== (b.tb ?? 0)) continue;                 // resolved by an earlier prompt
      if (TIES.playersWin && (a.type === "player") !== (b.type === "player")) continue; // players-first separates them
      if (dexKnown(a) && dexKnown(b) && (a.mods?.dex ?? 0) !== (b.mods?.dex ?? 0)) continue; // DEX separates them
      return true;
    }
    return false;
  };
  return Object.entries(by)
    .filter(([, g]) => g.length > 1 && g.some((c) => c.type === "player"))
    .sort((a, b) => b[0] - a[0])
    .map(([init, g]) => ({ init: +init, members: sortOrder(g) }))
    .filter((g) => ambiguous(g.members));
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
// chip colors echo each type's hit-row effect
const DTYPE_COLORS = {
  slashing: "#d8d3c8", piercing: "#e9e2d6", bludgeoning: "#c8beb4",
  fire: "#ff9a4d", cold: "#a8dcff", lightning: "#cfe8ff", thunder: "#f0eee8",
  acid: "#a6e06b", poison: "#78dc64", necrotic: "#a06ad2", radiant: "#ffdc82",
  psychic: "#e08cdc", force: "#b48ae0",
};

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
// Attacking gives a hidden creature away — the Hide (Invisible) ends once they attack.
function revealHidden(c, logs) {
  if (!c || !(c.conditions || []).some((cd) => cd.name === "Hiding")) return;
  c.conditions = c.conditions.filter((cd) => cd.name !== "Hiding");
  logs.push(`<b>${c.name}</b> is no longer <b>Hiding</b> — attacking gives their position away.`);
}
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
    if (c.type === "player") { // players always roll their own saves — never auto-rolled, even if CON is tracked
      toasts.push({ kind: "bad", text: `${c.name}: DC ${dc} CON save to keep concentrating on ${concLabel(c)}!` });
      logs.push(`<b>${c.name}</b>: concentration check needed — DC ${dc} CON save (${concLabel(c)}). Roll it, then tap ◈ to drop it on a fail.`);
      return;
    }
    const r = d20(conMod(c), ownAdv(c));
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
  if (c.dead && c.hp > 0) { c.dead = false; c.unconscious = false; c.ds = { s: 0, f: 0 }; c.stable = false; logs.push(`<b>${c.name}</b> healed ${amt} — back up! HP ${before}→${c.hp}`); return; }
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
  const all = fullBestiary();
  const names = (ENCOUNTER_POOLS[biome] || []).concat(EXPANDED.on && EXPANDED.list.length ? EXPANDED.pools[biome] || [] : []);
  const pool = names.map((n) => {
    const sb = all.find((b) => b.name === n);
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

// Whether a spell has a Verbal component — derived from the components field (cp),
// which already encodes "V, S, M …" for every spell. Used to snap a hidden caster
// out of Hiding (a verbal spell gives you away), and available for Silence later.
const spellHasVerbal = (s) => /\bV\b/.test(s?.cp || "");
// Spells that blanket an area with a condition and no saving throw — cast them by marking
// who's inside (keyed by SPELL_REF key → condition name). Concentration-linked, so the
// condition clears when the caster drops concentration.
const ZONE_COND_SPELLS = { silence: { cond: "Silenced", also: "Deafened" } };
// No-save spells that grant a condition to a chosen creature (or self) — cast them via the
// buff target picker so the condition is actually applied (and linked to concentration).
const BUFF_COND_SPELLS = { invisibility: "Invisible", "greater invisibility": "Invisible", mislead: "Invisible", sequester: "Invisible" };
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
  c.atkCount = 0; c.dodging = false; c.readied = false; c.hidTurn = false; // player-turn helpers: attack tally, Dodge, readied action, and the once-per-turn Hide all reset when this creature acts again
  if (c.legendary) c.legendary.rem = c.legendary.max;
  state.burnFx = []; // creatures that took Burning damage this turn-start, for the roster fire animation
  // hazards fire before durations tick (players get a popup instead — handled in the UI)
  if (c.type === "monster" && !c.dead && c.conditions.some((x) => x.name === "Burning")) {
    const r = ri(4);
    const snap = { hp: c.hp, thp: c.thp, dead: c.dead, unconscious: c.unconscious, stable: c.stable, id: Math.random() };
    logs.push(`🔥 <b>${c.name}</b> is Burning (${r}(d4) fire):`);
    applyDamage(c, r, "fire", logs, toasts);
    state.burnFx.push({ uid: c.uid, snap });
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

/* Small condition icon shown after the name on the roster and in the picker.
   Three are hand-drawn (eye/ear with a strike, a fallen figure); the rest are emoji. */
function CondIcon({ name, onTap, plain }) {
  const v = CONDITION_ICONS[name];
  if (!v) return null;
  const tap = plain ? undefined : onTap; // inside a badge the parent chip handles the click
  const svg = (paths) => (
    <svg className="condsvg" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      onClick={tap} title={name}>{paths}</svg>
  );
  if (v === "svg:blind") return svg(<>
    <path d="M2.5 10 C5 5.5 15 5.5 17.5 10 C15 14.5 5 14.5 2.5 10 Z" />
    <circle cx="10" cy="10" r="1.9" fill="currentColor" stroke="none" />
    <path d="M3.5 16.5 L16.5 3.5" strokeWidth="1.7" />
  </>);
  if (v === "svg:prone") return svg(<>
    <circle cx="5" cy="13" r="2.3" fill="currentColor" stroke="none" />
    <path d="M7.4 13.6 H16" />
    <path d="M10.5 13.6 l2.2 3.2 M14 13.6 l2.2 3.2 M9 13.4 l2.4 -3" />
    <path d="M4 8.5 v-2.2 M7.5 7.2 l1.2 -1.8" strokeWidth="1.2" opacity="0.7" />
  </>);
  return <span className="condicon" onClick={tap} title={name}>{v}</span>;
}

function CondBadge({ cond, onTap }) {
  const known = !!CONDITION_ICONS[cond.name];
  return (
    <span className="cond" title={`${CONDITIONS[cond.name] || (cond.boon ? "Boon" : "Custom effect")} (tap for details)`} onClick={onTap}>
      {cond.boon && !known && <span className="condicon">✨</span>}
      <CondIcon name={cond.name} plain />{cond.name}{cond.rounds != null && <span className="rt"> {cond.rounds}r</span>}
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

function DieFace({ sides, val, flick, cls, dropped, size, rolling }) {
  const sh = DIE_SHAPES[sides] || DIE_SHAPES[6];
  const shown = flick != null ? ((val * 7 + flick * 13) % sides) + 1 : val;
  const px = size || 30;
  return (
    <svg className={`die ${dropped ? "dropped" : ""} ${cls || "plain"} ${rolling ? "rolling" : ""}`} viewBox="0 0 24 24" width={px} height={px * 0.95} aria-hidden="true">
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

/* one synchronized flicker + tumble for a whole roll — no slot-machine chaos.
   The number lands as the die's rotation settles (~.95s animation). */
function DiceGroup({ dice, size, delayMs = 0 }) {
  const [flick, setFlick] = useState(ANIM.on ? 0 : null);
  const [rolling, setRolling] = useState(ANIM.on && delayMs === 0);
  useEffect(() => {
    if (!ANIM.on) return undefined;
    const ts = [setTimeout(() => setRolling(true), delayMs),
                setTimeout(() => setFlick(1), delayMs + 150), setTimeout(() => setFlick(2), delayMs + 330),
                setTimeout(() => setFlick(3), delayMs + 520), setTimeout(() => setFlick(null), delayMs + 720),
                setTimeout(() => setRolling(false), delayMs + 1000)]; // outlives the .95s tumble so the class never cuts it short
    return () => ts.forEach(clearTimeout);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <>
      {dice.map((d, i) => (
        <DieFace key={i} sides={d.s} val={d.v} flick={flick} cls={d.cls} dropped={d.dropped} size={size} rolling={rolling} />
      ))}
    </>
  );
}

/* Staged reveal for a roll's result chips: dice tumble first, then the modifier,
   then the total, then verdict/damage chips — one element per beat.
   ANIM is module-level so the render-time helpers below can read it; App assigns
   it from the persisted animation-speed setting during render, before children. */
const ANIM_SPEEDS = { fast: 0.5, medium: 1.5, slow: 2.3 };
const ANIM = { beat: ANIM_SPEEDS.medium, on: true };
const MANUAL = { on: false }; // DM rolls physical dice for monster attacks; App assigns from the setting
const TIES = { playersWin: true }; // players act before monsters on initiative ties; App assigns from the setting
const FX = { on: true, all: true }; // damage-type effects over the hit row; App assigns from the settings
const SFX = { on: true }; // whole-screen attack effects (edge-framed) on a hit; App assigns from the setting
const SPFX = { on: true }; // whole-screen spell/breath effects on AoE resolve; App assigns from the setting
// attack-name → whole-screen archetype (keyword match; falls back to no screen effect)
const ATTACK_FX = [
  { fx: "bite", re: /\b(bite|bites|beak|maw|jaws?|chomp|snap)\b/i },
  { fx: "claw", re: /\b(claws?|rend|talons?|scratch|rake|rip)\b/i },
  { fx: "gore", re: /\b(gore|gores|horns?|tusks?|antlers?)\b/i },
  { fx: "sting", re: /\b(sting|stinger|tail)\b/i },
  { fx: "ranged", re: /\b(bow|longbow|shortbow|crossbow|sling|javelin|arrow|dart|bolt|blowgun|harpoon|spit)\b/i },
  { fx: "slam", re: /\b(slam|fist|hooves?|hoof|ram|stomp|smash|punch|pound|club)\b/i },
];
const attackArchetype = (name) => { for (const a of ATTACK_FX) if (a.re.test(name || "")) return a.fx; return null; };

/* ---- defensive reactions (Shield, Uncanny Dodge, …) ----
   A creature's c.rx flags which of these it can use. When an attack hits, the
   attacker's turn pauses and the DM is asked whether the target reacts. AC-flip
   reactions turn the hit into a miss; damage reactions reduce the rolled damage.
   All of them spend the creature's one reaction (c.reaction). */
const DEF_REACTIONS = [
  { id: "shield", n: "Shield", icon: "🛡", kind: "ac", bonus: 5, persist: true,
    d: "Cast as a reaction when hit: +5 AC until the start of your next turn, including against the triggering attack." },
  { id: "defDuelist", n: "Defensive Duelist", icon: "🤺", kind: "ac", param: "ddBonus", persist: false, meleeOnly: true,
    d: "Wielding a finesse weapon, add your proficiency bonus to AC against one melee attack that would hit you." },
  { id: "uncannyDodge", n: "Uncanny Dodge", icon: "🌀", kind: "halve",
    d: "When an attacker you can see hits you, halve that attack's damage." },
  { id: "absorbElem", n: "Absorb Elements", icon: "🔥", kind: "resistType",
    d: "When you take acid, cold, fire, lightning, or thunder damage: resistance to that type — halve it." },
  { id: "deflectMissiles", n: "Deflect Missiles", icon: "🏹", kind: "reduceRoll", param: "dmDice", rangedOnly: true,
    d: "When hit by a ranged weapon attack, reduce the damage by the rolled amount (Monk: 1d10 + Dex + level)." },
];
const ABSORB_TYPES = new Set(["acid", "cold", "fire", "lightning", "thunder"]);
const attackRange = (a) => {
  const d = a?.d || "";
  if (/Ranged Attack Roll/i.test(d)) return "ranged";
  if (/Melee Attack Roll/i.test(d)) return "melee";
  if (attackArchetype(a?.n) === "ranged") return "ranged";
  return null; // unknown — treat permissively for melee-only reactions
};
// Reduce a set of damage parts in place; returns a short note for the log/chip.
function applyReduction(parts, red) {
  if (!red || !parts.length) return "";
  if (red.kind === "halve") { parts.forEach((p) => (p.amt = Math.floor(p.amt / 2))); return " (halved)"; }
  if (red.kind === "resistType") { parts.forEach((p) => { if ((p.dtype || "").toLowerCase() === red.elem) p.amt = Math.floor(p.amt / 2); }); return ` (${red.elem} halved)`; }
  if (red.kind === "reduceRoll") {
    const r = rollFormula(red.formula || "1d10"); let rem = r.total;
    parts.forEach((p) => { const cut = Math.min(p.amt, rem); p.amt -= cut; rem -= cut; });
    return ` (−${r.total})`;
  }
  return "";
}
// Which reactions can the target use against this specific attack? (label-carrying options)
function eligibleReactions(t, a, atk, effAc) {
  if (!t || !t.reaction || !t.rx || effAc == null) return [];
  const rng = attackRange(a);
  const out = [];
  if (!atk.crit) { // a natural 20 always hits — an AC boost can't save you
    if (t.rx.shield && atk.total >= effAc && atk.total < effAc + 5)
      out.push({ id: "shield", n: "Shield", kind: "ac", bonus: 5, persist: true, label: `🛡 Cast Shield — +5 AC (${effAc}→${effAc + 5}); this hit misses` });
    if (t.rx.defDuelist && rng !== "ranged") {
      const pb = Number(t.rx.ddBonus) || 2;
      if (atk.total >= effAc && atk.total < effAc + pb)
        out.push({ id: "defDuelist", n: "Defensive Duelist", kind: "ac", bonus: pb, persist: false, label: `🤺 Defensive Duelist — +${pb} AC; this hit misses` });
    }
  }
  if (t.rx.uncannyDodge)
    out.push({ id: "uncannyDodge", n: "Uncanny Dodge", kind: "reduce", reduction: { kind: "halve" }, label: "🌀 Uncanny Dodge — halve the damage" });
  if (t.rx.deflectMissiles && rng === "ranged") {
    const f = (t.rx.dmDice && String(t.rx.dmDice).trim()) || "1d10";
    out.push({ id: "deflectMissiles", n: "Deflect Missiles", kind: "reduce", reduction: { kind: "reduceRoll", formula: f }, label: `🏹 Deflect Missiles — reduce by ${f}` });
  }
  if (t.rx.absorbElem) {
    const elem = [a.dtype, a.extraType].filter(Boolean).map((s) => s.toLowerCase()).find((ty) => ABSORB_TYPES.has(ty));
    if (elem) out.push({ id: "absorbElem", n: "Absorb Elements", kind: "reduce", reduction: { kind: "resistType", elem }, label: `🔥 Absorb Elements — halve ${elem} damage` });
  }
  return out;
}
// spell/breath name → delivery shape (order matters: more specific shapes first;
// lightning stays a jagged bolt while focused rays get a clean straight beam)
const SPELL_FX = [
  { fx: "missiles", re: /\b(magic missile|missile|dart)\b/i },
  { fx: "storm", re: /(storm|cloud|meteor|hail|sleet|blizzard|plague|swarm)/i },
  { fx: "column", re: /\b(flame strike|sacred flame|pillar|column)\b/i },
  { fx: "wave", re: /(thunderwave|\bwave\b)/i },
  { fx: "bolt", re: /\b(lightning|arc)\b/i },
  { fx: "beam", re: /(\bray\b|beam|guiding bolt|fire bolt|eldritch|scorching|disintegrate)/i },
  { fx: "burst", re: /\b(fireball|blast|nova|explos|shatter|burst|eruption|detonat|boulder|rock)\b/i },
  { fx: "cone", re: /\b(breath|cone|burning hands|spray|exhal|gout|glare|roar|visage)\b/i },
];
const SPELL_KINDS = new Set(["cone", "bolt", "burst", "missiles", "storm", "beam", "column", "wave"]);
const spellShape = (name) => { for (const s of SPELL_FX) if (s.re.test(name || "")) return s.fx; return "burst"; };
const dtypeColor = (dtype) => DTYPE_COLORS[String(dtype || "").toLowerCase()] || "#cdd6e0";
function diceTextStages(chip) {
  if (!chip.t) return 0;
  const s = String(chip.t);
  const k = s.indexOf("= ");
  if (k < 0) return 1;
  return s.slice(0, k).trim() ? 2 : 1; // modifier + total, or just total
}
function chipDelays(chips) {
  const out = []; let t = 0;
  for (const ch of chips) { out.push(t); if (ANIM.on) t += (ch.dice ? 1 + diceTextStages(ch) : 1) * ANIM.beat; }
  return out;
}
function ChipText({ chip, base }) {
  if (!chip.t) return null;
  if (!chip.dice || !ANIM.on) return chip.t; // container's own reveal covers plain text chips
  const s = String(chip.t);
  const k = s.indexOf("= ");
  if (k < 0) return <span className="chip-reveal" style={{ animationDelay: `${base + ANIM.beat}s` }}>{s}</span>;
  const hasMod = !!s.slice(0, k).trim();
  return (<>
    {hasMod && <span className="chip-reveal" style={{ animationDelay: `${base + ANIM.beat}s` }}>{s.slice(0, k)}</span>}
    <span className="chip-reveal" style={{ animationDelay: `${base + (hasMod ? 2 : 1) * ANIM.beat}s` }}>{s.slice(k)}</span>
  </>);
}
function ResultChips({ chips, onApply, onMiss }) {
  const D = chipDelays(chips);
  const rev = ANIM.on ? "chip-reveal" : "";
  return chips.map((chip, j) => (
    chip.verdict && onApply && onMiss
      // unknown AC: the DM asks the table, then answers with a verdict — hit
      // applies the damage in one tap, miss locks it out
      ? <span key={chip.id || j} className={`chip cond ${rev}`} style={{ animationDelay: `${D[j]}s`, display: "inline-flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          Does {chip.atkTotal} hit {chip.tName}?
          <button className="btn small hitv" onClick={() => onApply(chip)}>✓ Hit — apply {chip.total}</button>
          <button className="btn small missv" onClick={() => onMiss(chip)}>✗ Miss</button>
        </span>
      : chip.applyTo && onApply
      ? <button key={chip.id || j} className={`chip cond ${rev}`} style={{ cursor: "pointer", animationDelay: `${D[j]}s` }} onClick={() => onApply(chip)}>⚔ {chip.t}</button>
      : <span key={chip.id || j} className={`chip ${rev} ${chip.k || ""}`} style={{ animationDelay: `${D[j]}s` }}>
          {chip.dice && <DiceGroup dice={chip.dice} size={chip.dieSize} delayMs={Math.round(D[j] * 1000)} />}
          <ChipText chip={chip} base={D[j]} />
        </span>
  ));
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

/* Victory popper: a 🎉 that punches in, then throws a fixed spray of confetti.
   flip mirrors it for the left/right sides of the word. */
const VIC_CONFETTI = [
  { x: -52, y: -86, r: "220deg", c: "#e0645a", d: 0.45 },
  { x: -22, y: -102, r: "160deg", c: "#d9a441", d: 0.5 },
  { x: 16, y: -94, r: "-200deg", c: "#7fbf8e", d: 0.47 },
  { x: 46, y: -72, r: "260deg", c: "#7fa7d9", d: 0.53 },
  { x: -62, y: -44, r: "-150deg", c: "#d9a441", d: 0.56 },
  { x: 58, y: -38, r: "190deg", c: "#e0645a", d: 0.58 },
  { x: -34, y: -64, r: "-240deg", c: "#e9e2d6", d: 0.49 },
  { x: 32, y: -58, r: "210deg", c: "#b58ae0", d: 0.52 },
];
function VicPopper({ flip }) {
  return (
    <span className={`vic-pop ${flip ? "r" : "l"}`}>
      <span className="vic-pop-e">🎉</span>
      {VIC_CONFETTI.map((p, i) => (
        <i key={i} className="vic-cf" style={{ background: p.c, animationDelay: `${p.d}s`, "--cx": `${flip ? -p.x : p.x}px`, "--cy": `${p.y}px`, "--cr": p.r }} />
      ))}
    </span>
  );
}

/* Ghost rows: when damage lands, the target's actual roster line slides down
   into view (a display-only clone — pointer-events off), the hit plays out in
   it live — HP bar, −N pulse, skull, THP shatter — then it slides back up.
   Skipped for combatants whose HP isn't tracked. */
function GhostRows({ rows, combatants, holds, fxs, api }) {
  if (!rows.length) return null;
  return (
    <div className="ghostrail">
      {rows.map((g) => {
        const c = combatants.find((x) => x.uid === g.uid);
        if (!c) return null;
        return (
          <div key={g.id} className={`ghostrow ${g.out ? "out" : ""}`}>
            <Row c={c} api={api} hold={holds[g.uid]} fx={fxs[g.uid]} />
          </div>
        );
      })}
    </div>
  );
}

/* Whole-screen attack effects: edge-framed flourishes that play where the DM is
   looking (the active card) the instant a hit lands — the first of the two beats,
   with the damage-type roster effect following at the HP drop. */
function ScreenFx({ kind, color }) {
  if (kind === "cone") {
    return <span className="sfx" aria-hidden><i className="cone" style={{ "--sc": color || "#cdd6e0" }} /></span>;
  }
  if (kind === "bolt") {
    const sc = color || "#cfe8ff";
    return (
      <span className="sfx" aria-hidden>
        <i className="sbolt" style={{ "--sc": sc }}>
          <svg viewBox="0 0 100 60" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
            <polyline points="0,20 20,26 34,10 50,34 64,14 80,30 100,22" fill="none" stroke={sc} strokeWidth="2.2" />
            <polyline points="34,10 30,2 38,6" fill="none" stroke={sc} strokeWidth="1" />
            <polyline points="50,34 54,46 46,44" fill="none" stroke={sc} strokeWidth="1" />
            <polyline points="80,30 86,40 92,36" fill="none" stroke={sc} strokeWidth="1" />
          </svg>
        </i>
      </span>
    );
  }
  if (kind === "burst") {
    return <span className="sfx" aria-hidden><i className="burst" style={{ "--sc": color || "#ff9a4d" }} /><i className="burst-ring" style={{ "--sc": color || "#ff9a4d" }} /></span>;
  }
  if (kind === "missiles") {
    const sc = color || "#b48ae0";
    const darts = [["-46vw", "16vh", "-18deg"], ["-42vw", "-20vh", "16deg"], ["-52vw", "-2vh", "0deg"], ["-36vw", "30vh", "-30deg"]];
    return <span className="sfx" aria-hidden>{darts.map(([fx, fy, mr], i) => <i key={i} className="msl" style={{ "--sc": sc, "--fx": fx, "--fy": fy, "--mr": mr, animationDelay: `${i * 0.06}s` }} />)}</span>;
  }
  if (kind === "storm") {
    const sc = color || "#a8dcff";
    return <span className="sfx" aria-hidden>{Array.from({ length: 13 }, (_, i) => <i key={i} className="drop" style={{ "--sc": sc, left: `${(i * 31 + 5) % 100}%`, animationDelay: `${((i * 7) % 10) / 22}s`, height: 30 + ((i * 11) % 24) }} />)}</span>;
  }
  if (kind === "beam") {
    return <span className="sfx" aria-hidden><i className="beam" style={{ "--sc": color || "#ffe0a0" }} /></span>;
  }
  if (kind === "column") {
    return <span className="sfx" aria-hidden><i className="column" style={{ "--sc": color || "#ff9a4d" }} /></span>;
  }
  if (kind === "wave") {
    const sc = color || "#f0eee8";
    return <span className="sfx" aria-hidden>{[0, 0.12, 0.24].map((d, i) => <i key={i} className="wave-r" style={{ "--sc": sc, animationDelay: `${d}s` }} />)}</span>;
  }
  if (kind === "bite") {
    const tp = ["0,0", "100,0"]; // top jaw: straight top edge, sawtooth teeth below
    for (let x = 100; x >= -4; x -= 7) { tp.push(`${x},54`, `${(x - 3.5).toFixed(1)},100`); }
    const bt = ["0,100", "100,100"]; // bottom jaw: straight bottom, teeth above
    for (let x = 100; x >= -4; x -= 7) { bt.push(`${x},46`, `${(x - 3.5).toFixed(1)},0`); }
    const fill = "rgba(233,228,218,.94)";
    return (
      <span className="sfx" aria-hidden>
        <i className="sfx-vig" />
        <span className="jaw t"><svg viewBox="0 0 100 100" preserveAspectRatio="none"><polygon points={tp.join(" ")} fill={fill} /></svg></span>
        <span className="jaw b"><svg viewBox="0 0 100 100" preserveAspectRatio="none"><polygon points={bt.join(" ")} fill={fill} /></svg></span>
      </span>
    );
  }
  if (kind === "claw") {
    return (
      <span className="sfx" aria-hidden>
        <i className="sfx-vig" />
        {[40, 48, 56].map((x, i) => <i key={i} className="claw" style={{ left: `${x}%`, animationDelay: `${i * 0.05}s` }} />)}
      </span>
    );
  }
  if (kind === "slam") {
    return (
      <span className="sfx" aria-hidden>
        <i className="slam-vig" />
        <i className="slam-flash" />
        <i className="slam-ring" />
      </span>
    );
  }
  if (kind === "gore") {
    return (
      <span className="sfx" aria-hidden>
        <i className="gore-vig" />
        <i className="gore" style={{ left: "40%", "--gr": "-11deg" }} />
        <i className="gore" style={{ left: "56%", "--gr": "11deg" }} />
      </span>
    );
  }
  if (kind === "sting") {
    return (
      <span className="sfx" aria-hidden>
        <i className="sfx-vig" style={{ boxShadow: "inset 0 0 90px 20px rgba(90,180,40,.35)" }} />
        <i className="sting" />
      </span>
    );
  }
  if (kind === "ranged") {
    return (
      <span className="sfx" aria-hidden>
        <i className="arrow" />
      </span>
    );
  }
  if (kind === "hit") {
    return <span className="sfx" aria-hidden><i className="hit-vig" /></span>;
  }
  return null;
}

/* Damage-type effects: pure CSS/SVG flourishes that play over the hit row —
   real roster row and ghost clone alike — a beat before the HP drops. */
const SHAKE_FX = new Set(["bludgeoning", "thunder"]);
function DmgFx({ type }) {
  const t = String(type || "").toLowerCase();
  const flash = (c) => <i key="f" className="fxflash" style={{ background: c }} />;
  const ring = (c, w = 2) => <i key="r" className="fxring" style={{ border: `${w}px solid ${c}` }} />;
  const BOLT = "#cfe8ff";
  const inner = {
    // thin main bolt with small branches forking off
    lightning: [flash("rgba(170,215,255,.3)"),
      <svg key="bolt" className="fxbolt" viewBox="0 0 100 24" preserveAspectRatio="none">
        <polyline points="0,12 16,7 28,16 44,4 57,18 71,8 84,14 100,10" fill="none" stroke={BOLT} strokeWidth="1.3" />
        <polyline points="28,16 33,22 38,20" fill="none" stroke={BOLT} strokeWidth="0.8" />
        <polyline points="44,4 48,1 53,4" fill="none" stroke={BOLT} strokeWidth="0.8" />
        <polyline points="57,18 61,23" fill="none" stroke={BOLT} strokeWidth="0.7" />
        <polyline points="71,8 75,3 80,6" fill="none" stroke={BOLT} strokeWidth="0.8" />
      </svg>],
    // dancing flames rising from the bottom, engulfing the row in a flash fire
    fire: [flash("rgba(255,140,50,.2)"), <i key="fa" className="fxfireall" />,
      ...[[1, 26, 0, 0.9], [19, 22, 0.12, 1.0], [37, 30, 0.05, 0.82], [56, 24, 0.18, 1.05], [73, 28, 0.1, 0.9], [88, 20, 0.22, 0.98]].map(([x, w, d, dur], i) => (
        <i key={`fl${i}`} className="fxflame" style={{ left: `${x}%`, width: `${w}%`, animationDelay: `${d}s`, animationDuration: `${dur}s` }} />
      ))],
    // frost creeping in from both edges toward the center
    cold: [flash("rgba(170,215,255,.18)"), <i key="fl" className="fxfrost l" />, <i key="fr" className="fxfrost r" />, <i key="fa" className="fxcoldall" />],
    slashing: [flash("rgba(255,255,255,.14)"), <i key="sl" className="fxslash" />],
    piercing: [flash("rgba(255,255,255,.2)"), ring("#fff", 2)],
    // one hard white flash; the row shake does the rest
    bludgeoning: [flash("rgba(255,255,255,.55)")],
    // big irregular splotches of acid splattering across the row
    acid: [flash("rgba(140,220,90,.2)"),
      ...[[6, 10, 0, 44, "58% 42% 63% 37% / 45% 62% 38% 55%"], [26, 45, 0.08, 36, "38% 62% 45% 55% / 60% 40% 58% 42%"],
         [44, 5, 0.14, 40, "52% 48% 35% 65% / 42% 55% 45% 58%"], [60, 40, 0.05, 48, "63% 37% 55% 45% / 38% 58% 42% 62%"],
         [78, 15, 0.2, 34, "45% 55% 60% 40% / 55% 42% 58% 45%"], [88, 50, 0.12, 42, "40% 60% 48% 52% / 62% 38% 55% 45%"]].map(([x, y, d, sz, br], i) => (
        <i key={`ad${i}`} className="fxdot" style={{ left: `${x}%`, top: `${y}%`, width: sz, height: sz, borderRadius: br, background: ["#a6e06b", "#7fbf5a", "#5a9e46", "#c4ef8a"][i % 4], animationDelay: `${d}s` }} />
      ))],
    // a properly bubbling cauldron — 40 bubbles, one fixed random scatter
    poison: [flash("rgba(120,210,90,.2)"),
      ...[[3.1, 5, 0.2, 0.53], [4.5, 3, 0.08, 0.57], [8.3, 6, 0.02, 0.54], [12.1, 8, 0.24, 0.75], [13.4, 3, 0.34, 0.9], [13.7, 4, 0.12, 0.75], [15.5, 9, 0.46, 0.91], [16.4, 8, 0.12, 0.71], [21.9, 5, 0.49, 0.88], [22.3, 7, 0.01, 0.59], [23.1, 7, 0.47, 0.54], [25.2, 7, 0.21, 0.76], [25.9, 8, 0.34, 0.6], [26.7, 9, 0.0, 0.86], [28.2, 4, 0.23, 0.93], [31.1, 9, 0.39, 0.6], [34.7, 4, 0.35, 0.52], [34.8, 4, 0.25, 0.54], [35.0, 5, 0.18, 0.8], [44.1, 3, 0.49, 0.67], [46.7, 3, 0.49, 0.74], [48.7, 3, 0.44, 0.63], [51.5, 5, 0.38, 0.65], [53.0, 9, 0.31, 0.9], [57.5, 6, 0.01, 0.92], [61.3, 7, 0.1, 0.67], [61.4, 3, 0.37, 0.61], [62.4, 7, 0.21, 0.7], [62.9, 6, 0.44, 0.79], [65.3, 7, 0.03, 0.67], [67.0, 5, 0.14, 0.6], [67.4, 8, 0.32, 0.77], [73.3, 3, 0.05, 0.54], [81.4, 7, 0.13, 0.52], [83.2, 6, 0.14, 0.79], [84.1, 5, 0.49, 0.84], [84.4, 9, 0.4, 0.61], [87.7, 7, 0.44, 0.64], [90.5, 8, 0.36, 0.81], [95.6, 7, 0.13, 0.75]].map(([x, sz, d, o], i) => (
        <i key={`b${i}`} className="fxbub" style={{ left: `${x}%`, width: sz, height: sz, background: `rgba(130,220,100,${o})`, animationDelay: `${d}s` }} />
      ))],
    // like the slash, but a violet line rising bottom → top
    force: [flash("rgba(180,140,255,.25)"), <i key="fr" className="fxriser" />],
    // god rays like radiant, but purple with lime green streaks — trippy
    psychic: [flash("rgba(190,120,255,.25)"),
      <i key="pr" className="fxrays" style={{ background: "repeating-linear-gradient(70deg,transparent 0 9px,rgba(200,120,255,.5) 9px 13px,transparent 13px 22px,rgba(180,240,80,.45) 22px 25px,transparent 25px 34px,rgba(200,120,255,.5) 34px 38px)" }} />],
    // turning spokes of light that build until they blow everything out
    radiant: [flash("rgba(255,215,120,.3)"),
      <i key="rr" className="fxspokes" style={{ background: "repeating-linear-gradient(90deg,transparent 0 14px,rgba(255,230,150,.5) 14px 22px)" }} />,
      <i key="rb" className="fxblowout" />],
    // dark drain sweep plus a haunting of little skulls
    necrotic: [flash("rgba(80,40,110,.3)"),
      <i key="s" className="fxsweep" style={{ background: "linear-gradient(90deg,transparent,rgba(70,30,100,.65),rgba(20,10,30,.5),transparent)" }} />,
      ...[[10, 20, 0], [30, 55, 0.12], [50, 14, 0.06], [70, 55, 0.18], [87, 25, 0.24]].map(([x, y, d], i) => (
        <i key={`sk${i}`} className="fxskull" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${d}s` }}>💀</i>
      ))],
    // a much bigger pulse of light than bludgeoning, plus the shake
    thunder: [flash("radial-gradient(circle, rgba(255,255,255,.7), rgba(255,255,255,.12))"),
      <i key="rb" className="fxringbig" style={{ border: "4px solid rgba(255,255,255,.95)" }} />],
    heal: [flash("rgba(150,230,140,.16)"),
      ...[[5, 15, 0], [16, 55, 0.1], [27, 20, 0.16], [38, 60, 0.06], [49, 12, 0.2], [60, 55, 0.12], [71, 25, 0.02], [82, 60, 0.22], [92, 30, 0.26], [22, 35, 0.28], [56, 38, 0.24]].map(([x, y, d], i) => (
        <i key={`sp${i}`} className="fxspark" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${d}s` }}>✦</i>
      ))],
  }[t] || [flash("rgba(255,255,255,.2)")];
  return <span className={`dmgfx fx-${t || "plain"}`} aria-hidden>{inner}</span>;
}

function Row({ c, active, isTop, isBottom, api, saveBadge, flash, hold, fx, inCombat }) {
  // Reveal-sync mask: display pre-hit values until the roll animation announces
  // the damage, so the roster doesn't spoil the result. Game state is already real.
  if (hold) c = { ...c, hp: hold.hp, thp: hold.thp, dead: hold.dead, unconscious: hold.unconscious, stable: hold.stable };
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
    // revived mid-animation: the cleanup above cancels the timer, which would
    // strand the skull (and the row's dying styling) forever — clear it here
    if (!c.dead) setSkull((s) => (s ? null : s));
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
  // the creature's OWN attacks & saves: manual override combined with derived adv/dis
  // (Aura of Authority / Bloodied Frenzy, Poisoned, Prone, Invisible, …) so the chip
  // shows advantage that comes from a trait or condition, not just a manual toggle.
  const derivedOwn = condOwnAdv(c);
  const ownShown = combineAdv(c.advMode || "none", derivedOwn ? derivedOwn.mode : "none");
  const advParts = [];
  if (ownShown !== "none")
    advParts.push(`${c.name}'s attacks & saves: ${ownShown === "adv" ? "ADVANTAGE" : "DISADVANTAGE"}` +
      ((c.advMode || "none") !== "none" ? " (manual)" : derivedOwn ? ` (from ${derivedOwn.from})` : ""));
  if (shown !== "none")
    advParts.push(`Attacks against ${c.name}: ${shown === "adv*" ? "melee ADVANTAGE / ranged DISADVANTAGE" : shown === "adv" ? "ADVANTAGE" : "DISADVANTAGE"}` +
      (manual !== "none" ? " (manual)" : derived ? ` (from ${derived.from})` : ""));
  const vsTitle = advParts.length ? advParts.join(" · ") + " — tap to adjust"
    : "Advantage — tap to set this creature's own rolls and attacks against it";
  const bloody = isBloodied(c);

  return (
    <div data-uid={c.uid} className={`row ${active ? "active" : ""} ${spot ? "spot" : ""} ${c.dead ? "dead" : ""} ${skull ? "dying" : ""} ${bloody ? "bloody" : ""} ${fx && SHAKE_FX.has(String(fx.dtype || "").toLowerCase()) ? "fxshake" : ""} ${!c.dead && c.type !== "effect" && shown === "adv" ? "vs-adv" : ""} ${!c.dead && c.type !== "effect" && shown === "dis" ? "vs-dis" : ""} ${!c.dead && c.type !== "effect" && shown === "adv*" ? "vs-mix" : ""}`}>
      {!c.dead && c.concentration && <span className="concring" />}
      {fx && <DmgFx key={fx.id} type={fx.dtype} />}
      <div className="rline r1">
      <span className={`initmark ${active ? "turn" : ""}`} title={active ? `${c.name}'s turn (initiative ${c.init})` : c.initText || (c.init != null ? `Initiative ${c.init}` : "No initiative yet")}>{active ? "▶" : (c.init ?? "—")}</span>
      <span className={`sidebar-dot side-${c.side === "ally" ? "ally" : c.side === "effect" ? "effect" : "enemy"}`} />
      <span className="nm" style={c.type === "monster" || c.type === "player" ? { cursor: "pointer" } : undefined}
        title={c.type === "monster" || c.type === "player" ? "Tap to peek at this creature's card" : undefined}
        onClick={(c.type === "monster" || c.type === "player") ? () => api.peek(c.uid) : undefined}>
        {c.name}
        {c.dead && <span className="sub">({c.type === "object" ? "destroyed" : "dead"})</span>}
        {c.unconscious && !c.dead && <span className="sub">(unconscious)</span>}
        {bloody && <span className="bloodtag" title="At or below half HP">Bloodied</span>}
        {c.type === "effect" && c.rounds != null && <span className="sub">{c.rounds}r left</span>}
        {!c.dead && (c.conditions.length > 0 || condGhost) && (
          <span className="rowconds">
            {c.conditions.map((cd, i) => (
              <CondBadge key={i} cond={cd} onTap={(e) => { e.stopPropagation(); api.openCondInfo(c.uid, cd.name); }} />
            ))}
            {condGhost && <span key={condGhost.id} className="cond condghost"><CondIcon name={condGhost.name} plain />{condGhost.name}</span>}
          </span>
        )}
        {flash && <span className="rowflash" key={flash.id}>{flash.text}</span>}
        {saveBadge && !c.dead && (
          <span className={`savetag ${saveBadge.ok === true ? "good" : saveBadge.ok === false ? "bad" : ""}`}
            title="Save result — tap to dismiss"
            onClick={(e) => { e.stopPropagation(); api.dismissSave(c.uid); }}>
            {saveBadge.ab}{saveBadge.total != null ? ` ${saveBadge.total}` : ""}{saveBadge.ok === true ? " ✓" : saveBadge.ok === false ? " ✗" : ""}
          </span>
        )}
      </span>
      </div>

      <div className="rline r2">
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

      {c.type === "player" && c.pp != null && !inCombat && (
        <span className="acbox" title="Passive Perception (shown outside battle)">👁 {c.pp}</span>
      )}

      {c.type !== "player" && (c.loot || []).length > 0 && (
        <span className="lootico" style={{ cursor: "pointer" }} title={`Carrying: ${c.loot.map(lootName).join(", ")} — tap to view/edit`}
          onClick={() => api.openLoot(c.uid)}>💰</span>
      )}

      <span className="badges">
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
        <button className={`advchip ${(ownShown !== "none" || shown !== "none") ? "on" : ""}`}
          title={vsTitle} onClick={() => api.openAdv(c.uid)}>
          {ownShown === "none" && shown === "none" ? "A/D" : (<>
            {ownShown !== "none" && <b className={ownShown}>{ownShown.toUpperCase()}</b>}
            {shown !== "none" && <b className={shown === "adv*" ? "mix" : shown}>⊕{shown === "adv*" ? "A/D" : shown.toUpperCase()}</b>}
          </>)}
        </button>
      )}

      {c.legRes && <Pips label="LR" cur={c.legRes.rem} max={c.legRes.max} onSpend={() => api.confirmUse(c.uid, "lr")} onReset={() => api.confirmUse(c.uid, "lr")} />}
      {c.legendary && <Pips label="LA" cur={c.legendary.rem} max={c.legendary.max} onSpend={() => api.confirmUse(c.uid, "la")} onReset={() => api.confirmUse(c.uid, "la")} />}
      {c.uses && !c.dead && Object.keys(c.uses).filter((k) => k[0] === "r").map((k) => (
        <Pips key={k} label={c.uses[k].n.replace(USES_RE, "").trim().split(" ").map((w) => w[0]).join("")}
          cur={c.uses[k].rem} max={c.uses[k].max}
          onSpend={() => api.confirmUse(c.uid, "use", k)} onReset={() => api.confirmUse(c.uid, "use", k)} />
      ))}

      {c.type === "player" && c.readied && !c.dead && (
        <button className="rtog readied" title="Readied action — tap to resolve it now (even off-turn)" onClick={() => api.openReadied(c.uid)}>
          ⏳ Readied
        </button>
      )}
      {c.type !== "effect" && c.type !== "object" && !c.dead && (
        <button className={`rtog ${c.reaction ? "on" : ""}`} title={`Reaction ${c.reaction ? "available" : "spent"} — tap to toggle`} onClick={() => api.toggleReaction(c.uid)}>
          React
        </button>
      )}


      <span className="menu-anchor" ref={menuRef}>
        <button className="btn small ghost" onClick={() => setMenu(!menu)}>⋮</button>
        {menu && (
          <div className="menu" onClick={() => setMenu(false)}>
            {c.type === "monster" && <button onClick={() => api.openSaveRoll(c.uid)}>Roll save…</button>}
            {c.hp != null && c.type !== "effect" && <button onClick={() => api.openDamage(c.uid)}>Damage / heal…</button>}
            <button onClick={() => api.rename(c.uid)}>Rename…</button>
            {c.type !== "effect" && <button onClick={() => api.openDefenses(c.uid)}>Edit defenses…</button>}
            {c.type === "monster" && <button onClick={() => api.openAddAttack(c.uid)}>Add attack…</button>}
            {c.type === "monster" && atkMaxOf(c) > 0 && <button onClick={() => api.grantAttack(c.uid)}>Grant +1 attack this turn</button>}
            {c.type !== "effect" && <button onClick={() => api.openLoot(c.uid)}>{c.type === "player" ? "🎒 Bag / items…" : "Give loot…"}</button>}
            {c.type !== "effect" && c.type !== "object" && <button onClick={() => api.openAdv(c.uid)}>Advantage…</button>}
            {c.type !== "effect" && c.type !== "object" && <button onClick={() => api.setConc(c.uid)}>Set concentration…</button>}
            {c.type !== "effect" && c.type !== "object" && <button onClick={() => api.openReactions(c.uid)}>Reactions…</button>}
            {c.type === "player" && <button onClick={() => api.openCharacter(c.uid)}>🎭 Character…</button>}
            {c.type === "player" && <button onClick={() => api.openSpellbook(c.uid)}>📖 Spellbook…</button>}
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
  // Phone taps bounce: the tap that opened this modal can echo ~100ms later and
  // land on the overlay (instant dismiss) or a target row (attack nobody chose).
  // Ignore picks and backdrop-dismissal for the first beat after opening.
  const openedAt = useRef(Date.now());
  const armed = () => Date.now() - openedAt.current > 300;
  const safeClose = () => { if (armed()) onClose(); };
  const pick = (t, vsOverride) => { if (!armed()) return; onResolve({ uid: attacker.uid, ai: action.i, targetUid: t ? t.uid : null, vsOverride, la, opp }); };
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
    <div className="overlay" onClick={safeClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Choose target</h3>
        <div className="trait" style={{ marginBottom: 6 }}>{attacker.name} — {action.n} · {fmtMod(action.hit)} to hit</div>
        <div className="gs-targets" style={{ marginTop: 4 }}>
          {primary.map(row)}
          {others.length > 0 && !showOthers && (
            <div className="gs-target" style={{ cursor: "pointer", opacity: 0.5, fontSize: 11, padding: "2px 0" }} onClick={() => setShowOthers(true)}>
              <span className="ad" style={{ fontSize: 11 }}>other targets ({others.length})…</span>
            </div>
          )}
          {showOthers && others.map(row)}
        </div>
        <div style={{ display: "flex", marginTop: 10, gap: 8, alignItems: "center" }}>
          <button className="btn small ghost" onClick={() => pick(null)} title="Roll the attack with no target — resolve it at the table">No target — just roll</button>
          <span style={{ flex: 1 }} />
          <button className="btn small" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function EncounterSuggestModal({ party, playerCount, onAdd, onClose }) {
  const [biome, setBiome] = useState("Forest");
  const [level, setLevel] = useState(party.set ? String(party.level) : "");
  const [size, setSize] = useState(party.set ? String(party.size) : playerCount ? String(playerCount) : "");
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
          <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
            <span className="ad" style={{ flex: 1 }}>{resolved.pending && resolved.pending.length ? "mark each player as they report" : "results are recorded in the log"}</span>
            <button className="btn small" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{single ? "Saving throw" : noSave ? (noDmg ? "Apply effect" : "Apply damage") : "Group save"}{preset?.name ? ` — ${preset.name}` : ""}</h3>
        {preset?.cond && <div className="ad" style={{ marginBottom: 4 }}>{noSave ? "Applies" : "On a failed save:"} <b>{[preset.cond, preset.cond2].filter(Boolean).join(" & ")}</b>{preset.condR ? ` (${preset.condR} rd)` : preset.concCast ? " (until concentration ends)" : ""}</div>}
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
          <button className="btn primary" disabled={!sel.size || (!noSave && !parseInt(dc, 10)) || (noSave && !noDmg && !dmg.trim())}
            onClick={() => onResolve({ name: preset?.name || null, ability: ab, dc: noSave ? null : parseInt(dc, 10), dmg: dmg.trim(), dtype: dtype.trim(), halfOn, targets: [...sel], noSave, cond: preset?.cond || null, cond2: preset?.cond2 || null, condR: preset?.condR || null, effectUid: preset?.effectUid || null, laUid: preset?.laUid || null, cmdPick: !!preset?.cmdPick, concSrc: preset?.concSrc || null, concCast: preset?.concCast || null, rpt: !!preset?.rpt, rptNote: preset?.rptNote || null, spellCastUid: preset?.spellCastUid || null })}>
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

const AZ_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
// A–Z browse strip — keyboard-free way to jump to spells by first letter. `enabled`
// (a Set of uppercase first letters) dims letters that have no spells.
function AzBar({ value, onPick, enabled }) {
  return (
    <div className="azbar">
      {AZ_LETTERS.map((L) => {
        const off = enabled ? !enabled.has(L) : false;
        return (
          <button key={L} className={`azkey ${value === L ? "on" : ""}`} disabled={off}
            onClick={() => onPick(value === L ? null : L)}>{L}</button>
        );
      })}
    </div>
  );
}
const SPELL_FIRST_LETTERS = new Set(Object.keys(SPELL_REF).map((k) => (SPELL_REF[k].n[0] || "").toUpperCase()));

function SpellBook({ onClose, activeC, onConc }) {
  const [q, setQ] = useState("");
  const [lvl, setLvl] = useState(null); // null all, 0 cantrip, 1-9
  const [letter, setLetter] = useState(null); // A–Z browse
  const [open, setOpen] = useState(null);
  const keys = useMemo(() => Object.keys(SPELL_REF).sort((a, b) => SPELL_REF[a].n.localeCompare(SPELL_REF[b].n)), []);
  const lvlOf = (s) => { const m = s.m.match(/^Level (\d+)/); return m ? +m[1] : 0; };
  const list = keys.filter((k) => {
    const s = SPELL_REF[k];
    if (q && !s.n.toLowerCase().includes(q.toLowerCase())) return false;
    if (letter && !s.n.toUpperCase().startsWith(letter)) return false;
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
        <input className="sbook-search" autoFocus style={{ color: "var(--text)", WebkitTextFillColor: "var(--text)", background: "var(--panel)", caretColor: "var(--gold)" }} placeholder="Search spells…" value={q} onChange={(e) => { setQ(e.target.value); if (e.target.value) setLetter(null); }} />
        <AzBar value={letter} enabled={SPELL_FIRST_LETTERS} onPick={(L) => { setLetter(L); if (L) setQ(""); }} />
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
                <ResultChips chips={results[`${c.uid}:${ar.ai}`]} onApply={(chip) => api.applyChipParts(chip.resKey, chip.id, chip.applyTo, chip.parts, chip.arch)} onMiss={(chip) => api.markAttackMiss(chip.resKey, chip.id, chip.tName)} />
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
          <ResultChips chips={results[`${c.uid}:save`]} />
        </div>
      )}
      {selfAdvTrait(c) && <div className="reminder" style={{ marginTop: 8 }}>⬆ <b>{selfAdvTrait(c)}:</b> rolling attacks & saving throws at ADVANTAGE.</div>}
      {c.multi && <div className="reminder" style={{ marginTop: 8 }}>⚔ <b>Multiattack:</b> {c.multi}</div>}
      {c.legendary && <div className="reminder" style={{ marginTop: 8 }}>👑 Legendary actions: {c.legendary.rem}/{c.legendary.max} available (spend between other creatures' turns)</div>}

      <div className="sect">
        <div className="lbl">Actions
          {!peek && atkMaxOf(c) > 0 && (
            <span className="atkbudget" title={`Attack rolls left this turn (Multiattack allows ${atkMaxOf(c)}). Grant an extra one from the roster ⋮ menu.`}>
              ⚔ {Math.max(atkLeft(c), 0)}/{atkMaxOf(c)}
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
              <button className="btn small primary" disabled={(a.rech && !a.ready) || peek || (!peek && replacesAttack(c, a) && atkLeft(c) <= 0)}
                title={peek ? "Actions happen on the creature's own turn" : replacesAttack(c, a) && atkLeft(c) <= 0 ? "No attacks left to replace — this uses one of the Multiattack's attacks" : replacesAttack(c, a) ? "Replaces one of the Multiattack's attacks" : undefined}
                onClick={() => api.useSaveAction(c.uid, i)}>
                Use — DC {a.save?.dc} {a.save?.ability}{replacesAttack(c, a) ? " (⚔−1)" : ""}
              </button>
            )}
            {a.kind === "save" && a.save?.dc && !replacesAttack(c, a) && (
              <button className="btn small cond" disabled={a.rech && !a.ready} title="Roll this save for multiple targets and apply damage"
                onClick={() => api.openGroupSave({ name: `${c.name} — ${a.n}`, ability: a.save.ability, dc: a.save.dc, dmg: a.dmg || (a.d && (a.d.match(/(\d+d\d+(?:[+-]\d+)?)/) || [])[1]) || "", dtype: a.dtype || "", casterUid: c.uid })}>
                ⭗ Group
              </button>
            )}
            {a.kind !== "atk" && a.kind !== "save" && (
              <button className="btn small" disabled={peek || (!peek && replacesAttack(c, a) && atkLeft(c) <= 0)}
                title={peek ? "Actions happen on the creature's own turn" : replacesAttack(c, a) && atkLeft(c) <= 0 ? "No attacks left to replace" : undefined}
                onClick={() => api.useTextAction(c.uid, i)}>Use{replacesAttack(c, a) ? " (⚔−1)" : ""}</button>
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
              {a.kind === "atk" && <span className="dmgline">{fmtMod(a.hit)} to hit{a.dmg ? <>, {a.dmg} {a.dtype}</> : null}{a.extra ? ` + ${a.extra} ${a.extraType}` : ""}. </span>}
              {a.d}
            </span>
            {results[`${c.uid}:${i}`] && (
              <span className="results">
                <ResultChips chips={results[`${c.uid}:${i}`]} onApply={(chip) => api.applyChipParts(chip.resKey, chip.id, chip.applyTo, chip.parts, chip.arch)} onMiss={(chip) => api.markAttackMiss(chip.resKey, chip.id, chip.tName)} />
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
        <button className="btn small" onClick={() => api.openUseItem(c.uid)}>🎒 Use item…</button>
        <button className="btn small" onClick={() => api.cycleAdv(c.uid)}>
          Rolls: {c.advMode === "none" ? "normal" : c.advMode === "adv" ? "ADVANTAGE" : "DISADVANTAGE"}
        </button>
        <button className="btn small" onClick={() => api.rename(c.uid)}>Rename…</button>
      </div>
    </div>
  );
}

const ATK_ORD = ["", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth", "Ninth", "Tenth"];
function PlayerCard({ c, api, results, inCombat }) {
  const hints = c.conditions.map((cd) => ({ n: cd.name, r: cd.rounds, d: CONDITIONS[cd.name] || null }));
  return (
    <div className="card torch">
      <h3>{c.name} <span style={{ color: "var(--faint)", fontSize: 11 }}>{c.side === "ally" ? "player / ally" : "npc"}</span></h3>
      {results && results[`${c.uid}:save`] && (
        <div className="savestrip">
          <ResultChips chips={results[`${c.uid}:save`]} />
        </div>
      )}
      <div className="statline">
        {c.hp != null && <><b>HP</b> {c.hp}/{c.maxHp}{isBloodied(c) && <span className="bloodtag">Bloodied</span>} · </>}
        {c.ac != null && <><b>AC</b> {c.ac + (c.acBoost || 0)} · </>}
        {c.pp != null && !inCombat && <><b>PP</b> {c.pp} · </>}
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
      {c.dodging && (
        <div className="reminder" style={{ marginTop: 6 }}>🛡 Dodging — attacks against them have DISADVANTAGE until their next turn.</div>
      )}
      {hints.length > 0 && (
        <div className="sect">
          <div className="lbl">Active conditions — roll reminders</div>
          {hints.map((h, i) => (<div className="trait" key={i}><b>{h.n}{h.r != null ? ` (${h.r} round${h.r === 1 ? "" : "s"} left)` : ""}.</b> {h.d || "Custom effect — as the DM decreed."}</div>))}
        </div>
      )}
      {hints.length === 0 && !c.unconscious && <div className="trait" style={{ marginTop: 6 }}>No conditions. The floor is theirs.</div>}
      {!c.dead && !c.unconscious && (
        <div className="sect">
          <div className="lbl">Actions{c.atkCount > 0 ? ` — attacked ${c.atkCount}×` : ""}</div>
          <div className="pcactions">
            {c.atkCount < 10
              ? <button className="btn primary" onClick={() => api.playerAttack(c.uid)}>⚔ {c.atkCount === 0 ? "Attack" : `${ATK_ORD[c.atkCount]} attack?`}</button>
              : <button className="btn" disabled title="Ten attacks logged this turn — apply any further hits by tapping the target's HP in the roster">⚔ Apply further manually</button>}
            <button className="btn" disabled={c.hidTurn} onClick={() => api.openHide(c.uid)}>🥷 {c.hidTurn ? "Hid" : "Hide"}</button>
            <button className="btn" onClick={() => api.openCast(c.uid)}>✨ Cast a spell</button>
            <button className="btn" onClick={() => api.openUseItem(c.uid)}>🎒 Use item</button>
            <button className="btn" disabled={c.dodging} onClick={() => api.dodge(c.uid)}>🛡 Dodge</button>
            <button className="btn" onClick={() => api.dash(c.uid)}>💨 Dash</button>
            <button className="btn" disabled={c.readied} onClick={() => api.readyAction(c.uid)}>⏳ {c.readied ? "Action readied" : "Ready action"}</button>
          </div>
        </div>
      )}
      <div className="sect" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button className="btn small" onClick={() => api.openHeal(c.uid)}>💊 Heal…</button>
        <button className="btn small" onClick={() => api.addCondition(c.uid)}>Add condition…</button>
        <button className="btn small" onClick={() => api.openAdv(c.uid)}>Advantage…</button>
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

function DamageModal({ state, presetUid, initMode, onApply, onClose }) {
  const targets = state.combatants.filter((c) => c.type !== "effect");
  const [amt, setAmt] = useState("");
  const [dtype, setDtype] = useState("");
  const [mode, setMode] = useState(initMode || "dmg"); // dmg | heal | thp | set
  const heal = mode === "heal";
  const [sel, setSel] = useState(() => new Set(presetUid ? [presetUid] : []));
  const [half, setHalf] = useState(() => new Set());
  const [more, setMore] = useState(!presetUid);
  const visibleTargets = more ? targets : targets.filter((t) => t.uid === presetUid);
  const toggle = (s, uid, setter) => { const n = new Set(s); n.has(uid) ? n.delete(uid) : n.add(uid); setter(n); };
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{mode === "heal" ? "Heal" : mode === "thp" ? "Temp HP" : mode === "set" ? "Set HP" : "Damage"}</h3>
        <div className="tabs" style={{ marginBottom: 8 }}>
          {[["dmg", "Damage"], ["heal", "Heal"], ["thp", "Temp HP"], ["set", "Set"]].map(([k, lbl]) => (
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
        {mode === "set" && (
          <div className="trait" style={{ fontSize: 12, color: "var(--faint)", marginBottom: 6 }}>
            Corrects the HP directly to this value — no damage or heal animation. Use it when the tracked number was wrong.
          </div>
        )}
        <div className="frow">
          <label>{mode === "set" ? "Set HP" : "Amount"}</label>
          <input type="number" value={amt} onChange={(e) => setAmt(e.target.value)} />
        </div>
        {mode === "dmg" && (
          <>
            <div className="lbl" style={{ fontSize: 11, color: "var(--faint)", margin: "6px 0 2px" }}>Damage type</div>
            <div className="pickgrid">
              <span className={`dchip ${dtype === "" ? "on" : ""}`} style={{ "--dc": "#8f8a99" }} onClick={() => setDtype("")}>untyped</span>
              {DTYPES.map((t) => (
                <span key={t} className={`dchip ${dtype === t ? "on" : ""}`} style={{ "--dc": DTYPE_COLORS[t] }} onClick={() => setDtype(t)}>{t}</span>
              ))}
            </div>
          </>
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
          <button className="btn small ghost" onClick={() => setMore(true)}>{mode === "heal" ? "Heal" : mode === "thp" ? "Grant to" : mode === "set" ? "Set HP on" : "Damage"} more combatants ▼</button>
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
        <div className="lbl" style={{ fontSize: 11, color: "var(--faint)", margin: "2px 0" }}>Condition</div>
        <div className="pickgrid">
          {Object.keys(CONDITIONS).sort().map((k) => (
            <span key={k} className={`lvlchip ${name === k ? "on" : ""}`} onClick={() => setName(k)}><CondIcon name={k} />{k}</span>
          ))}
          <span className={`lvlchip ${name === "__custom" ? "on" : ""}`} onClick={() => setName("__custom")}>Custom…</span>
        </div>
        {name === "__custom" && (
          <div className="frow"><label>Name</label><input type="text" autoComplete="off" autoCorrect="off" spellCheck={false} value={custom} onChange={(e) => setCustom(e.target.value)} autoFocus /></div>
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
  // this modal auto-opens under the DM's Next tap — swallow tap echoes for the
  // first beat so a bounced tap can't record a result (or dismiss) by accident
  const openedAt = useRef(Date.now());
  const armed = () => Date.now() - openedAt.current > 300;
  const record = (kind) => { if (armed()) onRecord(kind); };
  return (
    <div className="overlay" onClick={() => { if (armed()) onClose(); }}>
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
          <button className="btn" onClick={() => record("success")}>✓ Success</button>
          <button className="btn" onClick={() => record("fail")}>✗ Failure</button>
          <button className="btn" onClick={() => record("crit")}>✗✗ Nat 1</button>
          <button className="btn primary" onClick={() => record("nat20")}>Nat 20 — up at 1 HP!</button>
          <button className="btn" onClick={() => record("stabilize")}>Stabilized (magic/medicine)</button>
          <button className="btn ghost" onClick={() => record("reset")}>Reset</button>
        </div>
        <div className="frow" style={{ justifyContent: "flex-end", marginTop: 8 }}>
          <button className="btn small" onClick={onClose}>Done</button>
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
        <div className="frow"><label>Name</label><input type="text" autoComplete="off" autoCorrect="off" spellCheck={false} value={f.name} onChange={(e) => set("name", e.target.value)} autoFocus /></div>
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
            <input type="text" placeholder="Name" autoComplete="off" autoCorrect="off" spellCheck={false} style={{ width: 110, flex: "none" }} value={a.n} onChange={(e) => setAct(i, "n", e.target.value)} />
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
              <input type="text" placeholder="Name (e.g. Fire Breath)" autoComplete="off" autoCorrect="off" spellCheck={false} style={{ flex: 1 }} value={r.n} onChange={(e) => setSv(i, "n", e.target.value)} />
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

/* Read-only statblock sheet for browsing — flavor text, full stats, no engine. */
function FlavorText({ text }) {
  const [open, setOpen] = useState(false);
  const long = text.length > 220;
  const shown = open || !long ? text : text.slice(0, 200).replace(/\s+\S*$/, "") + "…";
  return (
    <div className="trait" style={{ fontStyle: "italic", whiteSpace: "pre-wrap", marginBottom: 8, color: "var(--dim)" }}>
      {shown}
      {long && <button className="btn tiny ghost" style={{ marginLeft: 6 }} onClick={() => setOpen(!open)}>{open ? "less ▴" : "read more ▾"}</button>}
    </div>
  );
}

function StatblockView({ sb, count, rollHp, onAdd, onClone, onBack }) {
  const mods = sb.mods || {};
  return (
    <div>
      <div className="frow"><button className="btn small ghost" onClick={onBack}>← Back to list</button></div>
      <h3 style={{ marginTop: 6 }}>{sb.name} <span style={{ color: "var(--faint)", fontSize: 11 }}>{sb.cr ? `CR ${sb.cr}` : ""}{sb.src === "tob" ? " · Tome of Beasts" : ""}</span></h3>
      {sb.fl && <FlavorText text={sb.fl} />}
      <div className="statline">
        <b>AC</b> {sb.ac} · <b>HP</b> {sb.hp}{sb.hpF ? ` (${sb.hpF})` : ""} · <b>Speed</b> {sb.spd || "30 ft."}
        {sb.senses ? <> · <b>Senses</b> {sb.senses}</> : null}
        {sb.langs ? <> · <b>Languages</b> {sb.langs}</> : null}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 4, margin: "8px 0", textAlign: "center" }}>
        {["str", "dex", "con", "int", "wis", "cha"].map((k) => (
          <div key={k} style={{ border: "1px solid var(--line)", borderRadius: 6, padding: "4px 0" }}>
            <div style={{ fontSize: 9, color: "var(--faint)", textTransform: "uppercase", letterSpacing: ".08em" }}>{k}</div>
            <div className="mono" style={{ fontSize: 13 }}>{fmtMod(mods[k] ?? 0)}</div>
          </div>
        ))}
      </div>
      {sb.saves && Object.keys(sb.saves).length > 0 && <div className="trait"><b>Saves</b> {Object.entries(sb.saves).map(([k, v]) => `${k.toUpperCase()} ${fmtMod(v)}`).join(", ")}</div>}
      {sb.resist?.length ? <div className="trait"><b>Resistances</b> {sb.resist.join(", ")}</div> : null}
      {sb.immune?.length ? <div className="trait"><b>Immunities</b> {sb.immune.join(", ")}</div> : null}
      {sb.vuln?.length ? <div className="trait"><b>Vulnerabilities</b> {sb.vuln.join(", ")}</div> : null}
      {sb.condImmune?.length ? <div className="trait"><b>Condition immunities</b> {sb.condImmune.join(", ")}</div> : null}
      {sb.traits?.length ? (<div className="sect"><div className="lbl">Traits</div>{sb.traits.map((t, i) => (<div className="trait" key={i}><b>{t.n}.</b> {t.d}</div>))}</div>) : null}
      {sb.multi && <div className="reminder" style={{ marginTop: 6 }}>⚔ <b>Multiattack:</b> {sb.multi}</div>}
      {sb.actions?.length ? (<div className="sect"><div className="lbl">Actions</div>{sb.actions.map((a, i) => (
        <div className="trait" key={i}><b>{a.n}{a.rech ? ` (Recharge ${a.rech}–6)` : ""}.</b>{" "}
          {a.kind === "atk" ? <span className="dmgline">{fmtMod(a.hit)} to hit{a.dmg ? `, ${a.dmg} ${a.dtype || ""}` : ""}. </span>
            : a.kind === "save" ? <span className="dmgline">DC {a.save?.dc} {a.save?.ability} save{a.dmg ? `, ${a.dmg} ${a.dtype || ""}` : ""}. </span> : ""}
          {a.d}</div>
      ))}</div>) : null}
      {sb.bonus?.length ? (<div className="sect"><div className="lbl">Bonus Actions</div>{sb.bonus.map((t, i) => (<div className="trait" key={i}><b>{t.n}.</b> {t.d}</div>))}</div>) : null}
      {sb.reactions?.length ? (<div className="sect"><div className="lbl">Reactions</div>{sb.reactions.map((t, i) => (<div className="trait" key={i}><b>{t.n}.</b> {t.d}</div>))}</div>) : null}
      {sb.legendary ? (<div className="sect"><div className="lbl">Legendary Actions ({sb.legendary.count}/round)</div>{(sb.legendary.options || []).map((t, i) => (<div className="trait" key={i}><b>{t.n}.</b> {t.d}</div>))}</div>) : null}
      <div className="frow" style={{ justifyContent: "flex-end", marginTop: 10 }}>
        <button className="btn" onClick={onBack}>← Back</button>
        <button className="btn" onClick={() => onClone(sb)}>⧉ Clone & tweak</button>
        <button className="btn primary" onClick={() => onAdd(sb, count, rollHp)}>Add to combat{count > 1 ? ` ×${count}` : ""}</button>
      </div>
    </div>
  );
}

/* Compact confirm card for the add-monster flow: enough to recognize the pick,
   small enough to keep the table moving. */
function MiniStatCard({ sb, count, rollHp, onAdd, onCancel, onFull }) {
  return (
    <div>
      <h3 style={{ marginTop: 4 }}>{sb.name} <span style={{ color: "var(--faint)", fontSize: 11 }}>{sb.cr ? `CR ${sb.cr}` : ""}{sb.src === "tob" ? " · ToB" : ""}</span></h3>
      <div className="statline"><b>AC</b> {sb.ac} · <b>HP</b> {sb.hp} · <b>Speed</b> {sb.spd || "30 ft."}</div>
      {sb.multi && <div className="trait" style={{ marginTop: 4 }}>⚔ {sb.multi}</div>}
      {(sb.actions || []).slice(0, 5).map((a, i) => (
        <div className="trait" key={i}>
          <b>{a.n}.</b>{" "}
          {a.kind === "atk" ? <span className="dmgline">{fmtMod(a.hit)} to hit{a.dmg ? `, ${a.dmg} ${a.dtype || ""}` : ""}</span>
            : a.kind === "save" ? <span className="dmgline">DC {a.save?.dc} {a.save?.ability}{a.dmg ? `, ${a.dmg} ${a.dtype || ""}` : ""}</span>
            : <span style={{ color: "var(--faint)" }}>{(a.d || "").slice(0, 70)}{(a.d || "").length > 70 ? "…" : ""}</span>}
        </div>
      ))}
      {(sb.actions || []).length > 5 && <div className="trait" style={{ color: "var(--faint)" }}>+{sb.actions.length - 5} more action{sb.actions.length - 5 === 1 ? "" : "s"}…</div>}
      {sb.legendary && <div className="trait">👑 Legendary ({sb.legendary.count}/round)</div>}
      <div className="frow" style={{ marginTop: 8 }}>
        <button className="btn small ghost" onClick={onFull}>Full statblock ▸</button>
        <span style={{ flex: 1 }} />
        <button className="btn" onClick={onCancel}>Cancel</button>
        <button className="btn primary" onClick={() => onAdd(sb, count, rollHp)}>Add{count > 1 ? ` ×${count}` : ""}</button>
      </div>
    </div>
  );
}

function BestiaryModal({ custom, browse, expanded, expandedReady, onToggleExpanded, onAdd, onDeleteCustom, onImport, onEdit, onClone, onClose }) {
  const [q, setQ] = useState("");
  const [count, setCount] = useState(1);
  const [rollHp, setRollHp] = useState(false);
  const [openCats, setOpenCats] = useState(() => new Set());
  const [showIO, setShowIO] = useState(false);
  const [ioText, setIoText] = useState("");
  const [ioMsg, setIoMsg] = useState("");
  const ql = q.toLowerCase();
  const mine = (custom || []).filter((b) => b.name.toLowerCase().includes(ql));
  const all = fullBestiary();
  const builtIn = all.filter((b) => b.name.toLowerCase().includes(ql));
  const [view, setView] = useState("type");
  const biomeNames = Object.keys(ENCOUNTER_POOLS);
  const biomePool = (bio) => new Set((ENCOUNTER_POOLS[bio] || []).concat(expanded && EXPANDED.list.length ? EXPANDED.pools[bio] || [] : []));
  const groups = view === "type"
    ? BESTIARY_CATS
    : [...biomeNames.map((b) => ["b:" + b, b]), ["b:misc", "Miscellaneous"]];
  const groupMembers = (key) => {
    if (!String(key).startsWith("b:")) return all.filter((b) => b.cat === key);
    if (key === "b:misc") { // everything that lives in no biome pool
      const used = new Set();
      biomeNames.forEach((bio) => biomePool(bio).forEach((n) => used.add(n)));
      return all.filter((b) => !used.has(b.name));
    }
    const names = biomePool(key.slice(2));
    return all.filter((b) => names.has(b.name));
  };
  const [detail, setDetail] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const pick = (b) => (browse ? setDetail(b) : setConfirm(b));

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
        {detail ? <StatblockView sb={detail} count={count} rollHp={rollHp} onAdd={onAdd} onClone={onClone} onBack={() => setDetail(null)} />
        : confirm ? <MiniStatCard sb={confirm} count={count} rollHp={rollHp} onAdd={onAdd} onCancel={() => setConfirm(null)} onFull={() => setDetail(confirm)} />
        : (<>
        <h3>{browse ? "🐉 Bestiary" : "Add from bestiary"}</h3>
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
        <div className="frow">
          <label style={{ minWidth: 0 }}>
            <input type="checkbox" checked={!!expanded} onChange={(e) => onToggleExpanded(e.target.checked)} /> Include <b>Tome of Beasts</b> (Kobold Press, OGL) — 391 more monsters, here and in suggested encounters
          </label>
        </div>
        {expanded && !expandedReady && <div className="trait">Loading Tome of Beasts…</div>}

        {mine.length > 0 && (<>
          <div className="lbl" style={{ fontSize: 11, color: "var(--gold)", margin: "10px 0 2px", letterSpacing: ".1em", textTransform: "uppercase" }}>My bestiary</div>
          <div className="mlist">
            {mine.map((b) => (
              <span key={b.name} style={{ position: "relative" }}>
                <button className="btn" style={{ width: "100%" }} onClick={() => pick(b)}>
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
            <div className="lbl" style={{ fontSize: 11, color: "var(--faint)", margin: "10px 0 2px", letterSpacing: ".1em", textTransform: "uppercase" }}>{expanded ? "SRD + Tome of Beasts" : "SRD"} — {builtIn.length} match{builtIn.length === 1 ? "" : "es"}</div>
            <div className="mlist">
              {builtIn.map((b) => (
                <span key={b.name} style={{ position: "relative" }}>
                  <button className="btn" style={{ width: "100%" }} onClick={() => pick(b)}>
                    {b.name}{b.src === "tob" ? <span className="tobtag">ToB</span> : null}<br /><span className="cr">CR {b.cr} · AC {b.ac} · {b.hp} HP{bestiaryBadges(b) ? " " : ""}{bestiaryBadges(b)}</span>
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
            <div className="lbl" style={{ fontSize: 11, color: "var(--faint)", margin: "10px 0 2px", letterSpacing: ".1em", textTransform: "uppercase" }}>{expanded ? `Bestiary — ${all.length} monsters (SRD + Tome of Beasts)` : `SRD bestiary — ${all.length} monsters`}</div>
            <div className="frow" style={{ margin: "2px 0 4px" }}>
              {[["type", "By type"], ["biome", "By biome"]].map(([v, lbl2]) => (
                <button key={v} className="btn small" style={view === v ? { borderColor: "var(--gold)", background: "var(--gold-soft)" } : {}} onClick={() => setView(v)}>{lbl2}</button>
              ))}
              {view === "biome" && <span style={{ fontSize: 11, color: "var(--faint)" }}>creatures can roam several biomes</span>}
            </div>
            {groups.map(([key, label]) => {
              const members = groupMembers(key);
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
                          <button className="btn" style={{ width: "100%" }} onClick={() => pick(b)}>
                            {b.name}{b.src === "tob" ? <span className="tobtag">ToB</span> : null}<br /><span className="cr">CR {b.cr} · AC {b.ac} · {b.hp} HP{bestiaryBadges(b) ? " " : ""}{bestiaryBadges(b)}</span>
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
        <div className="frow" style={{ justifyContent: "flex-end", marginTop: 10 }}>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
        </>)}
      </div>
    </div>
  );
}

function SlotsModal({ hasEnemies, initialShowBk, onSave, onLoad, onDelete, onSaveGroup, onAddGroup, onDeleteGroup, onExportAll, onImportAll, onClose }) {
  const [slots, setSlots] = useState(null);
  const [groups, setGroups] = useState(null);
  const [name, setName] = useState("");
  const [showBk, setShowBk] = useState(!!initialShowBk);
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
    setBkMsg(`Backup saved: ${obj.bestiary.length} bestiary monster${obj.bestiary.length === 1 ? "" : "s"}, ${(obj.items || []).length} item${(obj.items || []).length === 1 ? "" : "s"}, ${Object.keys(obj.slots).length} encounter${Object.keys(obj.slots).length === 1 ? "" : "s"}, ${Object.keys(obj.groups).length} group${Object.keys(obj.groups).length === 1 ? "" : "s"}.`);
  };
  const restoreFromFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const obj = JSON.parse(await file.text());
      if (obj.app !== "dm5e") throw new Error("Not a DM Screen backup file.");
      const r = await onImportAll(obj);
      setBkMsg(`Restored: ${r.bestiary} bestiary, ${r.items || 0} items, ${r.slots} encounters, ${r.groups} groups (merged into what's here).`);
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
          <input type="text" placeholder="Name…" autoComplete="off" autoCorrect="off" spellCheck={false} value={name} onChange={(e) => setName(e.target.value)} style={{ flex: 1 }} />
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

/* Manual dice mode: the DM rolled physical dice — collect the results with one
   tap per die and feed them through the normal attack pipeline. */
function ManualRollModal({ c, a, t, onConfirm, onClose }) {
  const [d20v, setD20v] = useState(null);
  const [vals, setVals] = useState([]);
  const dmgSpec = diceSpec(a.dmg);
  const extraSpec = a.extra && !extraNeedsAdv(a) ? diceSpec(a.extra) : null;
  const crit = d20v === 20;
  const effAc = t && t.ac != null ? t.ac + (t.acBoost || 0) + coverBonus(t) : null;
  const miss = d20v != null && effAc != null && d20v !== 20 && (d20v === 1 || d20v + (a.hit || 0) < effAc);
  const need = [];
  if (d20v != null && !miss) {
    if (dmgSpec) for (let i = 0; i < dmgSpec.n * (crit ? 2 : 1); i++) need.push({ s: dmgSpec.d, lbl: `damage d${dmgSpec.d}`, extra: false, critDie: i >= dmgSpec.n });
    if (extraSpec) for (let i = 0; i < extraSpec.n * (crit ? 2 : 1); i++) need.push({ s: extraSpec.d, lbl: `${a.extraType || "extra"} d${extraSpec.d}`, extra: true, critDie: i >= extraSpec.n });
  }
  const cur = need[vals.length];
  const done = d20v != null && (miss || vals.length >= need.length);
  const grid = (sides, onPick) => (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${sides > 12 ? 5 : sides > 8 ? 4 : sides}, 1fr)`, gap: 6, margin: "6px 0" }}>
      {Array.from({ length: sides }, (_, i) => i + 1).map((v) => (
        <button key={v} className="btn small" style={{ padding: "9px 0", textAlign: "center", fontFamily: "var(--mono)" }} onClick={() => onPick(v)}>{v}</button>
      ))}
    </div>
  );
  const confirm = () => {
    const nd = dmgSpec ? dmgSpec.n : 0;
    const ndc = crit && dmgSpec ? dmgSpec.n : 0;
    const ne = extraSpec ? extraSpec.n : 0;
    onConfirm({
      d20: d20v,
      dmg: vals.slice(0, nd),
      dmgCrit: vals.slice(nd, nd + ndc),
      extra: vals.slice(nd + ndc, nd + ndc + ne),
      extraCrit: vals.slice(nd + ndc + ne),
    });
  };
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>🎲 Your roll — {a.n}{t ? ` vs ${t.name}` : ""}</h3>
        <div className="trait" style={{ marginBottom: 4 }}>
          d20 to hit ({fmtMod(a.hit || 0)}{effAc != null ? ` vs AC ${effAc}` : ""}). If you rolled with advantage or disadvantage, enter the die you kept.
        </div>
        {d20v == null
          ? grid(20, (v) => { setD20v(v); setVals([]); })
          : <div className="frow">
              <span className={`chip ${d20v === 20 ? "crit" : d20v === 1 ? "fumble" : ""}`}>{d20v === 20 ? "NAT 20 — CRIT!" : d20v === 1 ? "nat 1…" : `d20: ${d20v} → ${d20v + (a.hit || 0)} to hit`}</span>
              <button className="btn small ghost" onClick={() => { setD20v(null); setVals([]); }}>change</button>
            </div>}
        {miss && <div className="trait" style={{ marginTop: 6 }}>Miss vs AC {effAc} — no damage dice needed.</div>}
        {cur && (<>
          <div className="lbl" style={{ fontSize: 11, color: "var(--gold)", margin: "8px 0 0" }}>
            {cur.lbl}{cur.critDie ? " — crit bonus die" : ""} · die {vals.length + 1} of {need.length}
          </div>
          {grid(cur.s, (v) => setVals([...vals, v]))}
        </>)}
        {vals.length > 0 && (
          <div className="frow" style={{ flexWrap: "wrap" }}>
            {vals.map((v, i) => (<span key={i} className="chip">{v}</span>))}
            <button className="btn small ghost" onClick={() => setVals(vals.slice(0, -1))}>⌫ undo</button>
          </div>
        )}
        <div className="frow" style={{ justifyContent: "flex-end", marginTop: 8 }}>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={!done} onClick={confirm}>Roll it</button>
        </div>
      </div>
    </div>
  );
}

/* Touch highlight for screen recordings: a glowing ring follows each finger and
   ripple-fades on release. Direct DOM updates (no React state) keep tracking at
   60fps for free; the layer is pointer-events:none so it can't affect the app. */
function TouchViz() {
  const layerRef = useRef(null);
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return undefined;
    const rings = new Map();
    const place = (el, e) => { el.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`; };
    const down = (e) => {
      let el = rings.get(e.pointerId);
      if (!el) {
        el = document.createElement("div");
        el.className = "touchring";
        el.innerHTML = '<div class="touchdot"></div>';
        layer.appendChild(el);
        rings.set(e.pointerId, el);
      }
      place(el, e);
    };
    const move = (e) => { const el = rings.get(e.pointerId); if (el) place(el, e); };
    const up = (e) => {
      const el = rings.get(e.pointerId); if (!el) return;
      rings.delete(e.pointerId);
      el.classList.add("pop");
      setTimeout(() => el.remove(), 420);
    };
    window.addEventListener("pointerdown", down, true);
    window.addEventListener("pointermove", move, true);
    window.addEventListener("pointerup", up, true);
    window.addEventListener("pointercancel", up, true);
    return () => {
      window.removeEventListener("pointerdown", down, true);
      window.removeEventListener("pointermove", move, true);
      window.removeEventListener("pointerup", up, true);
      window.removeEventListener("pointercancel", up, true);
      rings.forEach((el) => el.remove());
    };
  }, []);
  return <div ref={layerRef} className="touchlayer" />;
}

function LicensesModal({ onClose }) {
  const [tob, setTob] = useState(null);
  useEffect(() => { let live = true; import("./data/bestiaryTob.js").then((m) => { if (live) setTob(m.TOB_META); }); return () => { live = false; }; }, []);
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Licenses</h3>
        <div className="lbl" style={{ fontSize: 11, color: "var(--gold)", margin: "4px 0" }}>SRD 5.2.1</div>
        <div className="trait">
          This work includes material from the System Reference Document 5.2.1 ("SRD 5.2.1") by Wizards of the Coast LLC, available at
          https://www.dndbeyond.com/srd. The SRD 5.2.1 is licensed under the Creative Commons Attribution 4.0 International License.
        </div>
        <div className="lbl" style={{ fontSize: 11, color: "var(--gold)", margin: "10px 0 4px" }}>Tome of Beasts (optional expanded bestiary)</div>
        {!tob ? <div className="trait">Loading…</div> : (<>
          <div className="trait">{tob.copyright} Used under the {tob.licenseName}. Converted via the Open5e project.</div>
          <div className="trait" style={{ marginTop: 6 }}><b>Section 15 — Copyright Notice:</b> {tob.s15.join(" ")}</div>
          <div className="lbl" style={{ fontSize: 11, color: "var(--faint)", margin: "8px 0 2px" }}>{tob.licenseName}</div>
          <div style={{ maxHeight: 240, overflowY: "auto", fontSize: 11, color: "var(--dim)", whiteSpace: "pre-wrap", border: "1px solid var(--line)", borderRadius: 8, padding: "8px 10px" }}>
            {tob.licenseText}
          </div>
        </>)}
        <div className="frow" style={{ justifyContent: "flex-end", marginTop: 8 }}>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function InitTieModal({ groups, onConfirm }) {
  const [order, setOrder] = useState(() => groups.map((g) => g.members.map((m) => ({ uid: m.uid, name: m.name, type: m.type }))));
  const move = (gi, i, dir) => setOrder(order.map((g, j) => {
    if (j !== gi) return g;
    const n = [...g]; const k = i + dir;
    if (k < 0 || k >= n.length) return g;
    [n[i], n[k]] = [n[k], n[i]];
    return n;
  }));
  return (
    <div className="overlay">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Initiative ties</h3>
        <div className="trait" style={{ marginBottom: 8 }}>
          Who acts first? The app settles what it can on its own — monster ties by DEX, players before monsters (if that setting is on), player ties by tracked DEX. These are the leftovers, so it's your table's call.
        </div>
        {order.map((g, gi) => (
          <div key={gi} style={{ border: "1px solid var(--line)", borderRadius: 8, padding: "6px 8px", marginBottom: 8 }}>
            <div className="lbl" style={{ fontSize: 11, color: "var(--gold)", marginBottom: 4 }}>Tied at initiative {groups[gi].init}</div>
            {g.map((m, i) => (
              <div className="frow" key={m.uid}>
                <span style={{ width: 18, textAlign: "right", color: "var(--faint)", fontFamily: "var(--mono)", fontSize: 12 }}>{i + 1}.</span>
                <span style={{ flex: 1 }}>{m.name}{m.type === "player" ? <span style={{ color: "var(--faint)", fontSize: 11 }}> (player)</span> : null}</span>
                <button className="btn small ghost" disabled={i === 0} onClick={() => move(gi, i, -1)}>▲</button>
                <button className="btn small ghost" disabled={i === g.length - 1} onClick={() => move(gi, i, 1)}>▼</button>
              </div>
            ))}
          </div>
        ))}
        <div className="frow" style={{ justifyContent: "flex-end", marginTop: 8 }}>
          <button className="btn primary" onClick={() => onConfirm(order.map((g) => g.map((m) => m.uid)))}>Start combat</button>
        </div>
      </div>
    </div>
  );
}

/* Party opener: lives on the setup screen until the roster has a player, then
   gets out of the way. The party is remembered (dm5e:partyRoster, included in
   file backups) so every later session is one tap. Only names are required;
   the optional level prefills the encounter balancer, the optional team name
   labels the card (for DMs juggling multiple tables). */
const PARTY_BLANK_ROW = { name: "", ac: "", hp: "", spellDC: "", pp: "", str: "", dex: "", con: "", int: "", wis: "", cha: "", here: true };
const PARTY_MODS = ["str", "dex", "con", "int", "wis", "cha"];
const memberMods = (m) => { const o = {}; for (const k of PARTY_MODS) { const v = m[k]; if (v != null && v !== "" && !isNaN(Number(v))) o[k] = Number(v); } return o; };
const partyRowsFrom = (saved) =>
  (saved?.members?.length ? saved.members.map((m) => ({ ...PARTY_BLANK_ROW, ...m })) : [{ ...PARTY_BLANK_ROW }]); // one slot to start — "+ Add player" grows it
const partyRosterOf = (teamName, level, rows) => ({
  name: teamName.trim() || null,
  level: level !== "" && !isNaN(parseInt(level, 10)) ? parseInt(level, 10) : null,
  members: rows.filter((r) => r.name.trim()).map((r) => ({ ...r, name: r.name.trim(), id: r.id || newUid(), spells: Array.isArray(r.spells) ? r.spells : [] })),
});

function PartyFields({ rows, setRows, level, setLevel, teamName, setTeamName }) {
  const set = (i, k, v) => setRows(rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  const [moreOpen, setMoreOpen] = useState(false);
  const FIELD = { background: "var(--panel)", border: "1px solid var(--line2)", borderRadius: 8, color: "var(--text)", WebkitTextFillColor: "var(--text)", caretColor: "var(--gold)", padding: "6px 8px", fontSize: 16 };
  const named = rows.map((r, i) => ({ r, i })).filter(({ r }) => r.name.trim());
  return (
    <>
      <div className="partygrid">
        <div className="pgh"><span title="Here tonight">✓</span><span>Name<i className="opt req">*required</i></span><span>AC<i className="opt">opt · rec.</i></span><span>HP<i className="opt">opt · rec.</i></span><span>Spell&nbsp;DC<i className="opt">opt · casters</i></span></div>
        {rows.map((r, i) => (
          <div className="pgr" key={i}>
            <input type="checkbox" checked={r.here} onChange={(e) => set(i, "here", e.target.checked)} title="Here tonight — unchecked members are remembered but not added" />
            <input type="text" placeholder="Character *" autoComplete="off" autoCorrect="off" spellCheck={false} value={r.name} onChange={(e) => set(i, "name", e.target.value)} />
            <input type="number" placeholder="–" title="Armor Class — recommended so the app can adjudicate attacks on them" value={r.ac} onChange={(e) => set(i, "ac", e.target.value)} />
            <input type="number" placeholder="–" title="Max HP — recommended so the app tracks their damage" value={r.hp} onChange={(e) => set(i, "hp", e.target.value)} />
            <input type="number" placeholder="–" title="Spell save DC — recommended for spellcasters; auto-fills when they cast" value={r.spellDC} onChange={(e) => set(i, "spellDC", e.target.value)} />
          </div>
        ))}
      </div>
      <button className="btn small ghost" style={{ marginTop: 6 }} onClick={() => setMoreOpen(!moreOpen)}>{moreOpen ? "▾ Hide extra stats" : "▸ Track more stats (optional)"}</button>
      {moreOpen && (
        <div className="morestats">
          <div className="trait" style={{ fontSize: 11, color: "var(--faint)", margin: "0 0 6px" }}>Reference only — the app never rolls a player's saves for them. PP shows on the roster outside battle; DEX breaks initiative ties.</div>
          {named.length === 0
            ? <div className="trait" style={{ fontSize: 12 }}>Name a player above first.</div>
            : named.map(({ r, i }) => (
                <div className="mstat-row" key={i}>
                  <div className="mstat-name">{r.name.trim()}</div>
                  <div className="mstat-fields">
                    <label>PP<input type="number" value={r.pp} onChange={(e) => set(i, "pp", e.target.value)} /></label>
                    {PARTY_MODS.map((k) => <label key={k}>{k}<input type="number" value={r[k]} onChange={(e) => set(i, k, e.target.value)} /></label>)}
                  </div>
                </div>))}
        </div>
      )}
      <div className="frow" style={{ marginTop: 8 }}>
        <button className="btn small primary" onClick={() => setRows([...rows, { ...PARTY_BLANK_ROW }])}>＋ Add player</button>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 13, color: "var(--dim)", fontWeight: 600 }}>Party level</span>
        <input type="number" placeholder="opt." value={level} onChange={(e) => setLevel(e.target.value)} title="Optional — prefills the encounter balancer" style={{ ...FIELD, width: 64 }} />
      </div>
      <div className="frow" style={{ marginTop: 6 }}>
        <input type="text" placeholder="Team name (optional — e.g. Tuesday group)" autoComplete="off" autoCorrect="off" spellCheck={false} value={teamName} onChange={(e) => setTeamName(e.target.value)} title="Handy if you run more than one table" style={{ ...FIELD, flex: 1, minWidth: 0, boxSizing: "border-box" }} />
      </div>
    </>
  );
}

const partyLabel = (p, i) => (p.name && String(p.name).trim()) || (p.teamName && p.teamName.trim()) || `Party ${i + 1}`;

/* Setup opener: always a clean blank grid — saved parties live behind the Load
   party button, which expands into a list with one-tap Load and an edit link
   that prefills the grid. Adding from a blank grid creates a NEW remembered
   party; adding after "edit" updates that one. */
function PartySetupCard({ parties, onPick, onAdd, onSave }) {
  const [rows, setRows] = useState([{ ...PARTY_BLANK_ROW }]);
  const [level, setLevel] = useState("");
  const [teamName, setTeamName] = useState("");
  const [loadOpen, setLoadOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const going = rows.filter((r) => r.name.trim() && r.here);
  const editingParty = editingId ? parties.find((p) => p.id === editingId) : null;
  const resetBlank = () => { setRows([{ ...PARTY_BLANK_ROW }]); setLevel(""); setTeamName(""); setEditingId(null); };
  const beginEdit = (p) => { setEditingId(p.id); setRows(partyRowsFrom(p)); setLevel(p.level ?? ""); setTeamName(p.name ?? ""); setLoadOpen(false); };
  const add = () => {
    const roster = partyRosterOf(teamName, level, rows);
    onSave(roster, editingId); // null id → remember as a new party
    onAdd(roster.members.filter((r) => r.here), roster.level);
  };
  return (
    <div className="card">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <h3 style={{ margin: 0, flex: 1 }}>{editingParty ? `Edit ${partyLabel(editingParty, parties.indexOf(editingParty))}` : "Add your party"}</h3>
        {parties.length > 0 && !editingParty && (
          <button className="btn small primary" onClick={() => setLoadOpen(!loadOpen)}>📂 Load party {loadOpen ? "▴" : "▾"}</button>
        )}
      </div>
      {loadOpen && (
        <div style={{ marginBottom: 8 }}>
          {parties.map((p, i) => (
            <div className="gs-row" key={p.id} style={{ alignItems: "center", flexWrap: "wrap" }}>
              <b>{partyLabel(p, i)}</b>
              {p.level ? <span className="ad">lvl {p.level}</span> : null}
              <span className="ad" style={{ flex: 1, minWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {p.members.map((m) => m.name).join(", ")}
              </span>
              <button className="btn small ghost" onClick={() => beginEdit(p)}>edit</button>
              <button className="btn small primary" disabled={!p.members.some((m) => m.here)} onClick={() => { onPick(p.id); onAdd(p.members.filter((m) => m.here), p.level ?? null); }}>Load</button>
            </div>
          ))}
        </div>
      )}
      <PartyFields rows={rows} setRows={setRows} level={level} setLevel={setLevel} teamName={teamName} setTeamName={setTeamName} />
      <div className="trait" style={{ color: "var(--faint)" }}>
        {editingParty
          ? "Add party saves your changes to this party and puts them on screen. Only names are required."
          : `Only names are required — ✓ marks who's here tonight. Initiative is collected when combat starts. HP (if filled) lets the app track their damage; PP shows on their row; DEX only breaks initiative ties and is never shown.${parties.length ? " Adding remembers this group as a new party." : " Your party is remembered for next session."}`}
      </div>
      <div className="frow" style={{ justifyContent: "flex-end" }}>
        {editingParty ? <button className="btn" onClick={resetBlank}>Cancel edit</button> : null}
        <button className="btn primary" disabled={!going.length} onClick={add}>Add party{going.length ? ` (${going.length})` : ""}</button>
      </div>
    </div>
  );
}

/* ⋯ menu → Edit parties: manage every remembered party any time — level-ups,
   new HP, roster changes, team names, whole new tables. Never touches whoever
   is currently in the fight. Edits are local until Save; empty parties (no
   named members) are discarded on save. */
function PartyEditModal({ parties, activeId, onSaveAll, onClose }) {
  const toDraft = (p) => ({ id: p.id, teamName: p.name ?? "", level: p.level ?? "", rows: partyRowsFrom(p) });
  const newDraft = () => ({ id: newUid(), teamName: "", level: "", rows: partyRowsFrom(null) });
  const [st, setSt] = useState(() => {
    const list = parties.length ? parties.map(toDraft) : [newDraft()];
    const sel = list.some((d) => d.id === activeId) ? activeId : list[0].id;
    return { list, sel };
  });
  const d = st.list.find((x) => x.id === st.sel);
  const upd = (patch) => setSt((s) => ({ ...s, list: s.list.map((x) => (x.id === s.sel ? { ...x, ...patch } : x)) }));
  const addParty = () => setSt((s) => { const nd = newDraft(); return { list: [...s.list, nd], sel: nd.id }; });
  const deleteParty = () => setSt((s) => {
    const list = s.list.filter((x) => x.id !== s.sel);
    if (!list.length) list.push(newDraft());
    return { list, sel: list[0].id };
  });
  const anyNamed = st.list.some((x) => x.rows.some((r) => r.name.trim()));
  const save = () => {
    const clean = st.list
      .map((x) => ({ id: x.id, ...partyRosterOf(x.teamName, x.level, x.rows) }))
      .filter((p) => p.members.length);
    onSaveAll(clean, clean.some((p) => p.id === st.sel) ? st.sel : (clean[0]?.id ?? null));
    onClose();
  };
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Edit parties</h3>
        <div className="sbook-lvls" style={{ marginBottom: 8 }}>
          {st.list.map((x, i) => (
            <span key={x.id} className={`lvlchip ${x.id === st.sel ? "on" : ""}`} onClick={() => setSt((s) => ({ ...s, sel: x.id }))}>{partyLabel(x, i)}</span>
          ))}
          <span className="lvlchip" onClick={addParty} title="Start another party — handy for DMs running more than one table">＋ New party</span>
        </div>
        <PartyFields rows={d.rows} setRows={(rows) => upd({ rows })} level={d.level} setLevel={(v) => upd({ level: v })} teamName={d.teamName} setTeamName={(v) => upd({ teamName: v })} />
        <div className="trait" style={{ margin: "8px 0" }}>Changes apply the next time a party is added to the screen — players already in the fight aren't modified. Only names are required; a party with no named members is discarded when you save.</div>
        <div className="frow">
          <button className="btn small danger" onClick={deleteParty}>Delete this party</button>
          <span style={{ flex: 1 }} />
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={!anyNamed && parties.length === 0} onClick={save}>Save parties</button>
        </div>
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
              type={f.type || "text"} autoFocus={i === 0} placeholder={f.placeholder || ""} autoComplete="off" autoCorrect="off" spellCheck={false}
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
        <div className="frow"><label>Name</label><input type="text" placeholder="Silvered Spear" autoComplete="off" autoCorrect="off" spellCheck={false} value={a.n} onChange={(e) => set("n", e.target.value)} autoFocus /></div>
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

/* Item types keep the builder honest: the engine consumes any healing item whole
   (potion semantics), so heal never combines with weapon/charge mechanics. */
const ITEM_KINDS = [
  ["weapon", "⚔ Weapon", "Becomes an attack on whoever holds it, using their stats."],
  ["potion", "🧪 Potion / consumable", "One use, then it's gone. Can heal."],
  ["thrown", "💥 Thrown / grenade", "One use — throw it for damage, maybe a condition or an area burst."],
  ["boon", "✨ Boon / self-buff", "One use — temp HP, advantage on your rolls, or a condition on yourself for a few rounds."],
  ["wand", "✨ Charged item", "Tracks charges; describe what a charge does."],
  ["armor", "🛡 Armor / shield", "Grants an AC bonus while equipped."],
  ["other", "📜 Trinket / other", "Descriptive item — no mechanics."],
];
// Conditions a thrown / boon item can impart (the cover pseudo-conditions aren't relevant here).
const THROW_CONDS = Object.keys(CONDITIONS).filter((n) => !/Cover/.test(n));
const BLANK_ITEM_FORM = { origN: null, kind: null, n: "", rarity: "C", d: "", dmg: "1d6", dtype: "slashing", fin: false, rng: false, ls: false, b: "0", heal: "", ch: "", c: false, acB: "", cond: "", aoe: false, bthp: "", badv: false, bdur: "" };
function itemKindOf(it) {
  if (it.wpn) return "weapon";
  if (it.thrown) return "thrown";
  if (it.boon) return "boon";
  if (it.acB != null || it.armor) return "armor";
  if (it.heal || (it.c && it.ch == null)) return "potion";
  if (it.ch != null) return "wand";
  return "other";
}
function itemToForm(it) {
  return {
    origN: it.n, kind: itemKindOf(it), n: it.n, rarity: "CURVL".includes(it.rarity) ? it.rarity : "C", d: it.d || "",
    dmg: it.wpn?.dmg || it.thrown?.dmg || "1d6", dtype: it.wpn?.dtype || it.thrown?.dtype || "slashing",
    fin: !!it.wpn?.fin, rng: !!it.wpn?.rng, ls: !!it.wpn?.ls, b: String(it.wpn?.b || 0),
    heal: it.heal || "", ch: it.ch != null ? String(it.ch) : "", c: !!it.c, acB: it.acB != null ? String(it.acB) : "",
    cond: it.thrown?.cond || it.boon?.cond || "", aoe: !!it.thrown?.aoe,
    bthp: it.boon?.thp || "", badv: !!it.boon?.adv, bdur: it.boon?.dur != null ? String(it.boon.dur) : "",
  };
}
function formToItem(f) {
  const it = { n: f.n.trim(), rarity: f.rarity, custom: 1 };
  if (f.d.trim()) it.d = f.d.trim();
  const chN = f.ch.trim() !== "" && !isNaN(parseInt(f.ch, 10)) ? Math.max(0, parseInt(f.ch, 10)) : null;
  if (f.kind === "weapon" && f.dmg.trim()) {
    it.wpn = { dmg: f.dmg.trim(), dtype: f.dtype };
    if (f.fin) it.wpn.fin = 1;
    if (f.rng) it.wpn.rng = 1;
    if (f.ls) it.wpn.ls = 1;
    if (parseInt(f.b, 10)) it.wpn.b = parseInt(f.b, 10);
    if (chN != null) it.ch = chN; // e.g. a mace with a 3-charge fear burst
  } else if (f.kind === "thrown") {
    it.thrown = { dmg: f.dmg.trim() || "1d6", dtype: f.dtype };
    if (f.cond) it.thrown.cond = f.cond;
    if (f.aoe) it.thrown.aoe = 1;
    it.c = 1; // consumed on use
  } else if (f.kind === "boon") {
    const boon = {};
    if (f.bthp.trim()) boon.thp = f.bthp.trim();
    if (f.badv) boon.adv = 1;
    if (f.cond) boon.cond = f.cond;
    const durN = f.bdur.trim() !== "" && !isNaN(parseInt(f.bdur, 10)) ? Math.max(1, parseInt(f.bdur, 10)) : null;
    if (durN != null) boon.dur = durN;
    it.boon = boon;
    it.c = 1; // consumed on use
  } else if (f.kind === "potion") {
    if (f.heal.trim()) it.heal = f.heal.trim();
    it.c = 1;
  } else if (f.kind === "wand") {
    it.ch = chN != null ? chN : 3;
  } else if (f.kind === "armor") {
    if (parseInt(f.acB, 10)) it.acB = parseInt(f.acB, 10);
  }
  return it;
}

function LootGiveModal({ c, customItems = [], compendium, onSaveCustomItem, onDeleteCustomItem, onSave, onClose }) {
  const [items, setItems] = useState(() => (c?.loot || []).map(lootObj));
  const [custom, setCustom] = useState("");
  const [browse, setBrowse] = useState(!!compendium); // the compendium is a browse-first view
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("all");
  const [form, setForm] = useState(null); // null = builder closed
  const filtered = ITEMS.filter((i) =>
    (tab === "all" || (tab === "W" ? i.rarity === "G" && i.wpn : tab === "A" ? i.rarity === "G" && !i.wpn : i.rarity === tab))
    && i.n.toLowerCase().includes(q.toLowerCase()));
  const mineFiltered = customItems.filter((i) => (tab === "all" || i.rarity === tab) && i.n.toLowerCase().includes(q.toLowerCase()));
  const addCustomLine = () => {
    const t = custom.trim(); if (!t) return;
    const mine = customItems.find((i) => i.n.toLowerCase() === t.toLowerCase());
    setItems([...items, mine ? JSON.parse(JSON.stringify(mine)) : lookupItem(t) || { n: t }]);
    setCustom("");
  };
  const setF = (k, v) => setForm({ ...form, [k]: v });
  const saveForm = () => {
    const it = formToItem(form);
    onSaveCustomItem(it, form.origN);
    if (!form.origN && !compendium) setItems([...items, JSON.parse(JSON.stringify(it))]); // creating from this creature's loot screen: hand it over too
    setForm(null);
  };
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{compendium ? "📦 Item Compendium" : c.type === "player" ? `🎒 ${c.name}'s bag` : `Loot — ${c.name}`}</h3>
        {!compendium && (<>
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
        </>)}
        {compendium && <div className="trait" style={{ color: "var(--faint)", marginBottom: 4 }}>Build custom items here — they're offered to players via Use item → Other and in the give-loot screens.</div>}
        <div className="frow" style={{ marginTop: 6 }}>
          {!compendium && (
            <button className="btn small ghost" onClick={() => setBrowse(!browse)}>
              {browse ? "Hide catalog ▲" : "Browse magic items (SRD) ▼"}
            </button>
          )}
          <button className="btn small ghost" onClick={() => setForm(form ? null : { ...BLANK_ITEM_FORM })}>
            {form && !form.origN ? "Close builder ▲" : "＋ New custom item…"}
          </button>
        </div>
        {form && (
          <div style={{ border: "1px solid var(--line)", borderRadius: 8, padding: "8px 10px", marginTop: 8 }}>
            <div className="lbl" style={{ fontSize: 11, color: "var(--gold)", marginBottom: 6 }}>
              {form.origN ? `Edit item — ${form.origN}` : "New custom item"}
              {form.kind && (
                <button className="btn tiny ghost" style={{ marginLeft: 8 }} onClick={() => setF("kind", null)}>
                  {ITEM_KINDS.find(([k]) => k === form.kind)?.[1]} — change type
                </button>
              )}
            </div>
            {!form.kind && (
              <div>
                <div className="trait" style={{ marginBottom: 6 }}>What kind of item is it?</div>
                {ITEM_KINDS.map(([k, label, hint]) => (
                  <button key={k} className="btn" style={{ width: "100%", textAlign: "left", margin: "3px 0" }} onClick={() => setF("kind", k)}>
                    {label}<br /><span style={{ fontSize: 11, color: "var(--faint)" }}>{hint}</span>
                  </button>
                ))}
              </div>
            )}
            {form.kind && (<>
              <div className="frow">
                <input type="text" placeholder="Item name" style={{ flex: 1 }} value={form.n} onChange={(e) => setF("n", e.target.value)} autoFocus />
                <select value={form.rarity} onChange={(e) => setF("rarity", e.target.value)}>
                  {["C", "U", "R", "V", "L"].map((r) => (<option key={r} value={r}>{RARITY_NAME[r]}</option>))}
                </select>
              </div>
              <div className="frow"><input type="text" placeholder="What it does (shown wherever the item appears)" style={{ flex: 1 }} value={form.d} onChange={(e) => setF("d", e.target.value)} /></div>
              {form.kind === "weapon" && (<>
                <div className="frow" style={{ flexWrap: "wrap" }}>
                  <label style={{ minWidth: 0 }}>Damage</label>
                  <input type="text" placeholder="1d8" style={{ width: 70, flex: "none" }} value={form.dmg} onChange={(e) => setF("dmg", e.target.value)} />
                  <select value={form.dtype} onChange={(e) => setF("dtype", e.target.value)}>
                    {DTYPES.map((t) => (<option key={t}>{t}</option>))}
                  </select>
                  <select value={form.b} onChange={(e) => setF("b", e.target.value)} title="Magic bonus to hit and damage">
                    {["0", "1", "2", "3"].map((n) => (<option key={n} value={n}>{n === "0" ? "no bonus" : `+${n}`}</option>))}
                  </select>
                </div>
                <div className="frow" style={{ flexWrap: "wrap" }}>
                  <label style={{ minWidth: 0 }}><input type="checkbox" checked={form.fin} onChange={(e) => setF("fin", e.target.checked)} /> finesse</label>
                  <label style={{ minWidth: 0 }}><input type="checkbox" checked={form.rng} onChange={(e) => setF("rng", e.target.checked)} /> ranged</label>
                  <label style={{ minWidth: 0 }} title="On a hit, the wielder regains HP equal to half the damage dealt"><input type="checkbox" checked={form.ls} onChange={(e) => setF("ls", e.target.checked)} /> 🩸 lifesteal</label>
                  <label style={{ minWidth: 0 }}>Charges</label>
                  <input type="number" min={0} placeholder="—" style={{ width: 56 }} value={form.ch} onChange={(e) => setF("ch", e.target.value)} title="Optional — for a weapon with a limited-use power described above" />
                </div>
                <div className="trait" style={{ color: "var(--faint)", fontSize: 11 }}>Holder attacks with their own stats (+ the magic bonus). Lifesteal heals the wielder for half the damage dealt. Charges are optional, for a limited-use power described above.</div>
              </>)}
              {form.kind === "thrown" && (<>
                <div className="frow" style={{ flexWrap: "wrap" }}>
                  <label style={{ minWidth: 0 }}>Damage</label>
                  <input type="text" placeholder="3d6" style={{ width: 70, flex: "none" }} value={form.dmg} onChange={(e) => setF("dmg", e.target.value)} />
                  <select value={form.dtype} onChange={(e) => setF("dtype", e.target.value)}>
                    {DTYPES.map((t) => (<option key={t}>{t}</option>))}
                  </select>
                </div>
                <div className="frow" style={{ flexWrap: "wrap" }}>
                  <label style={{ minWidth: 0 }}>Condition</label>
                  <select value={form.cond} onChange={(e) => setF("cond", e.target.value)} title="Optional — inflicted on a hit / failed save">
                    <option value="">none</option>
                    {THROW_CONDS.map((cn) => (<option key={cn} value={cn}>{cn}</option>))}
                  </select>
                </div>
                <div className="frow" style={{ flexWrap: "wrap" }}>
                  <label style={{ minWidth: 0 }} title="Hits everyone in an area — opens the group-save / AoE screen when used"><input type="checkbox" checked={form.aoe} onChange={(e) => setF("aoe", e.target.checked)} /> 💥 Area burst (save for each target)</label>
                </div>
                <div className="trait" style={{ color: "var(--faint)", fontSize: 11 }}>Single use. When used it rolls damage against a target (or, for an area burst, opens the group-save screen). A condition applies on a hit or failed save.</div>
              </>)}
              {form.kind === "boon" && (<>
                <div className="frow" style={{ flexWrap: "wrap" }}>
                  <label style={{ minWidth: 0 }}>Temp HP</label>
                  <input type="text" placeholder="e.g. 10 or 2d4+2" style={{ width: 120, flex: "none" }} value={form.bthp} onChange={(e) => setF("bthp", e.target.value)} />
                </div>
                <div className="frow" style={{ flexWrap: "wrap" }}>
                  <label style={{ minWidth: 0 }} title="Grants advantage on the user's own attack rolls and saving throws while it lasts"><input type="checkbox" checked={form.badv} onChange={(e) => setF("badv", e.target.checked)} /> ✨ Advantage on your attacks &amp; saves</label>
                </div>
                <div className="frow" style={{ flexWrap: "wrap" }}>
                  <label style={{ minWidth: 0 }}>Condition</label>
                  <select value={form.cond} onChange={(e) => setF("cond", e.target.value)} title="Optional — a condition applied to yourself (e.g. Invisible)">
                    <option value="">none</option>
                    {THROW_CONDS.map((cn) => (<option key={cn} value={cn}>{cn}</option>))}
                  </select>
                  <label style={{ minWidth: 0 }}>Rounds</label>
                  <input type="number" min={1} placeholder="—" style={{ width: 56 }} value={form.bdur} onChange={(e) => setF("bdur", e.target.value)} title="How long the advantage / condition lasts, in rounds. Blank = until removed." />
                </div>
                <div className="trait" style={{ color: "var(--faint)", fontSize: 11 }}>Single use, applied to whoever uses it. Advantage and the condition tick down each round and drop off on their own; temp HP has no timer. Leave rounds blank for an effect you'll end manually.</div>
              </>)}
              {form.kind === "potion" && (<>
                <div className="frow" style={{ flexWrap: "wrap" }}>
                  <label style={{ minWidth: 0 }}>Heals</label>
                  <input type="text" placeholder="2d4+2 (blank = no healing)" style={{ width: 170, flex: "none" }} value={form.heal} onChange={(e) => setF("heal", e.target.value)} />
                </div>
                <div className="trait" style={{ color: "var(--faint)", fontSize: 11 }}>Single use — it's consumed when used, healing if dice are set.</div>
              </>)}
              {form.kind === "wand" && (<>
                <div className="frow" style={{ flexWrap: "wrap" }}>
                  <label style={{ minWidth: 0 }}>Charges</label>
                  <input type="number" min={0} placeholder="3" style={{ width: 64 }} value={form.ch} onChange={(e) => setF("ch", e.target.value)} />
                </div>
                <div className="trait" style={{ color: "var(--faint)", fontSize: 11 }}>Each Use spends a charge — the description above says what a charge does.</div>
              </>)}
              {form.kind === "armor" && (<>
                <div className="frow" style={{ flexWrap: "wrap" }}>
                  <label style={{ minWidth: 0 }}>+AC</label>
                  <input type="number" min={0} placeholder="1" style={{ width: 64 }} value={form.acB} onChange={(e) => setF("acB", e.target.value)} />
                </div>
                <div className="trait" style={{ color: "var(--faint)", fontSize: 11 }}>The holder gets an Equip button; the bonus applies while equipped.</div>
              </>)}
              <div className="frow" style={{ justifyContent: "flex-end", marginTop: 6 }}>
                <button className="btn small" onClick={() => setForm(null)}>Cancel</button>
                <button className="btn small primary" disabled={!form.n.trim()} onClick={saveForm}>{form.origN ? "Save changes" : "Save item"}</button>
              </div>
            </>)}
          </div>
        )}
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
              {mineFiltered.length > 0 && (<>
                <div className="lbl" style={{ fontSize: 11, color: "var(--gold)", margin: "2px 0", letterSpacing: ".1em", textTransform: "uppercase" }}>My items</div>
                {mineFiltered.map((it) => (
                  <div className="targetline" key={"mine:" + it.n}>
                    <span style={{ flex: 1 }}>
                      {it.n} <span style={{ color: "var(--faint)", fontSize: 11 }}>· {rarityLabel(it)} · custom</span>
                      <div style={{ fontSize: 11, color: "var(--faint)" }}>{it.d}</div>
                    </span>
                    <button className="btn small ghost" title="Edit this item" onClick={() => setForm(itemToForm(it))}>✎</button>
                    <button className="btn small ghost" title="Delete from my items" onClick={() => onDeleteCustomItem(it.n)}>✕</button>
                    {!compendium && <button className="btn small" onClick={() => setItems([...items, JSON.parse(JSON.stringify(it))])}>+ Give</button>}
                  </div>
                ))}
                <div className="lbl" style={{ fontSize: 11, color: "var(--faint)", margin: "6px 0 2px", letterSpacing: ".1em", textTransform: "uppercase" }}>SRD catalog</div>
              </>)}
              {filtered.map((it) => (
                <div className="targetline" key={it.n}>
                  <span style={{ flex: 1 }}>
                    {it.n} <span style={{ color: "var(--faint)", fontSize: 11 }}>· {rarityLabel(it)}</span>
                    <div style={{ fontSize: 11, color: "var(--faint)" }}>{it.d}</div>
                  </span>
                  {!compendium && <button className="btn small" onClick={() => setItems([...items, JSON.parse(JSON.stringify(it))])}>+ Give</button>}
                </div>
              ))}
              {filtered.length === 0 && mineFiltered.length === 0 && <div className="trait">No matches.</div>}
            </div>
          </div>
        )}
        {!compendium && (
          <div className="trait" style={{ marginTop: 8, color: "var(--faint)" }}>
            Usable items (potions, wands…) show on the creature's turn card with a Use button. Consumed items drop off the loot list; the rest await the players in "Loot the fallen."
          </div>
        )}
        <div className="frow" style={{ justifyContent: "flex-end", marginTop: 8 }}>
          {compendium
            ? <button className="btn primary" onClick={onClose}>Done</button>
            : <><button className="btn" onClick={onClose}>Cancel</button>
                <button className="btn primary" onClick={() => onSave(items)}>Save</button></>}
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
  const [fireDone, setFireDone] = useState(false); // once applied this turn, hide the Burning block so it can't be re-applied
  const applyFire = (n) => { onApplyFire(n); setFireDone(true); };
  const burning = c.conditions.some((cd) => cd.name === "Burning");
  const suff = c.conditions.some((cd) => cd.name === "Suffocating");
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Start of {c.name}'s turn</h3>
        {burning && !fireDone && (<>
          <div className="reminder" style={{ marginBottom: 8 }}>🔥 <b>{c.name} is Burning</b> — apply <b>1d4 fire damage</b> now (their roll, or tap 🎲 to roll it). Dousing takes an action.</div>
          {c.hp != null && (
            <div className="frow" style={{ gap: 6 }}>
              <label style={{ minWidth: 0 }}>Damage rolled</label>
              <input type="number" style={{ width: 60 }} value={amt} onChange={(e) => setAmt(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && amt) applyFire(parseInt(amt, 10)); }} />
              <button className="btn small ghost" onClick={() => setAmt(String(ri(4)))}>🎲 roll</button>
              <button className="btn small primary" disabled={!amt} onClick={() => applyFire(parseInt(amt, 10))}>Apply as fire</button>
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

/* One dialog for both directions of advantage: the creature's own rolls and
   attacks made against it. Segmented pickers instead of blind three-state
   cycling; shows what conditions already derive. */
function AdvKw({ mode }) {
  if (mode === "adv") return <b className="advkw adv">ADVANTAGE</b>;
  if (mode === "dis") return <b className="advkw dis">DISADVANTAGE</b>;
  return <b className="advkw">Normal</b>;
}
function AdvCallout({ info, subject, overridden }) {
  if (!info) return null;
  return (
    <div className={`advcallout ${info.cancel ? "" : info.mode}`}>
      <span className="subj">{subject} </span>
      {info.mode === "adv*"
        ? <><AdvKw mode="adv" /> <span className="subj">in melee (≤5 ft),</span> <AdvKw mode="dis" /> <span className="subj">at range</span></>
        : info.cancel
        ? <><AdvKw mode="adv" /> <span className="subj">&</span> <AdvKw mode="dis" /> <span className="subj">cancel → Normal</span></>
        : <AdvKw mode={info.mode} />}
      {" "}<span className="subj">from</span> <span className="advfrom">{info.from}</span>
      {overridden && <span className="subj"> — overridden by your setting below</span>}
    </div>
  );
}
function AdvSetModal({ c, onSetOwn, onSetVs, onClose }) {
  const openedAt = useRef(Date.now());
  const armed = () => Date.now() - openedAt.current > 300;
  const own = condOwnAdv(c);
  const vs = condAdvVs(c);
  const seg = (cur, onPick) => (
    <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
      {[["none", "Normal"], ["adv", "ADV"], ["dis", "DIS"]].map(([v, lb]) => (
        <button key={v} className={`btn small ${cur === v ? (v === "adv" ? "hitv" : v === "dis" ? "missv" : "primary") : ""}`}
          style={{ flex: 1 }} onClick={() => { if (armed()) onPick(v); }}>{lb}{cur === v ? " ✓" : ""}</button>
      ))}
    </div>
  );
  return (
    <div className="overlay" onClick={() => { if (armed()) onClose(); }}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Advantage — {c.name}</h3>
        {(own || vs) && (
          <div className="advcallouts">
            <AdvCallout info={own} subject={`${c.name}'s attacks & saves:`} overridden={(c.advMode || "none") !== "none"} />
            <AdvCallout info={vs} subject={`Attacks against ${c.name}:`} overridden={(c.advVs || "none") !== "none"} />
          </div>
        )}
        <div className="lbl" style={{ fontSize: 11, color: "var(--gold)", margin: "6px 0 4px" }}>{c.name}'s own rolls (attacks & saves)</div>
        {seg(c.advMode || "none", onSetOwn)}
        <div className="lbl" style={{ fontSize: 11, color: "var(--gold)", margin: "6px 0 4px" }}>Attacks against {c.name}</div>
        {seg(c.advVs || "none", onSetVs)}
        <div className="frow" style={{ justifyContent: "flex-end" }}>
          <button className="btn primary" onClick={() => { if (armed()) onClose(); }}>Done</button>
        </div>
      </div>
    </div>
  );
}

function PlayerAttackModal({ c, state, api, onSave, spellAtk, presetDtype, spellName, onClose }) {
  const openedAt = useRef(Date.now());
  const armed = () => Date.now() - openedAt.current > 300;
  const isEnemy = c.side !== "ally";
  const cands = targetCands(state, c);
  const primary = cands.filter((x) => (isEnemy ? x.side === "ally" : x.side !== "ally"));
  const others = cands.filter((x) => !primary.includes(x));
  const [showOthers, setShowOthers] = useState(false);
  const [tab, setTab] = useState("single");
  const [picked, setPicked] = useState(null);
  const [phase, setPhase] = useState("pick"); // pick → resolve → damage
  const [amt, setAmt] = useState("");
  // spell attacks carry their own damage type (Fire Bolt → fire); weapons default to the player's last type
  const [dtype, setDtype] = useState(spellAtk ? (presetDtype || "") : (c.lastDtype || ""));
  const t = picked ? state.combatants.find((x) => x.uid === picked) : null;
  const effAc = t && t.ac != null ? t.ac + (t.acBoost || 0) + coverBonus(t) : null;
  const targetRow = (x) => (
    <div key={x.uid} className="gs-target" style={{ cursor: "pointer" }} onClick={() => { if (armed()) { setPicked(x.uid); setPhase("resolve"); } }}>
      <b>{x.name}</b>
      <span className="ad">
        {x.ac != null ? `AC ${x.ac + (x.acBoost || 0) + coverBonus(x)}` : "AC ?"}
        {x.maxHp != null ? ` · HP ${x.hp}/${x.maxHp}` : ""}
        {vsState(x) === "dis" ? " · vs DIS" : vsState(x) === "adv" ? " · vs ADV" : ""}
      </span>
    </div>
  );
  return (
    <div className="overlay" onClick={() => { if (armed()) onClose(); }}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>⚔ {c.name}{spellAtk && spellName ? ` casts ${spellName}` : " attacks"}</h3>
        {!spellAtk && (
          <div className="tabs" style={{ marginBottom: 8 }}>
            {[["single", "🎯 One target"], ["aoe", "✦ AoE / save"]].map(([k, lbl]) => (
              <button key={k} className="btn small" style={tab === k ? { borderColor: "var(--gold)", background: "var(--gold-soft)" } : {}}
                onClick={() => setTab(k)}>{lbl}</button>
            ))}
          </div>
        )}
        {tab === "aoe" && (
          <div>
            <div className="trait" style={{ fontSize: 12.5, color: "var(--faint)", marginBottom: 10 }}>
              For a fireball, a breath-like effect, or anything the targets roll a saving throw against — set the DC, damage, and who's caught, and the app rolls each monster's save (players get marked ✓/✗).
            </div>
            <button className="btn primary" style={{ width: "100%" }} onClick={onSave}>Set up AoE / save →</button>
          </div>
        )}
        {tab === "single" && phase === "pick" && (
          <>
            <div className="lbl" style={{ fontSize: 11, color: "var(--faint)", margin: "2px 0 4px" }}>Choose target</div>
            <div className="gs-targets">
              {primary.map(targetRow)}
              {others.length > 0 && !showOthers && (
                <div className="gs-target" style={{ cursor: "pointer", opacity: 0.5, fontSize: 11, padding: "2px 0" }} onClick={() => setShowOthers(true)}>
                  <span className="ad" style={{ fontSize: 11 }}>other targets ({others.length})…</span>
                </div>
              )}
              {showOthers && others.map(targetRow)}
              {cands.length === 0 && <div className="trait" style={{ fontSize: 12 }}>No one to attack.</div>}
            </div>
          </>
        )}
        {tab === "single" && phase === "resolve" && t && (
          <>
            <div className="atkresolve">
              <div className="atktarget"><b>{t.name}</b><span className="atkac">AC {effAc != null ? effAc : "?"}</span></div>
              <div className="trait" style={{ fontSize: 12, color: "var(--faint)", margin: "2px 0 10px" }}>
                {c.name} rolled their attack{effAc != null ? ` — did they reach AC ${effAc}?` : " — did it hit?"}
              </div>
              <div className="frow" style={{ gap: 8 }}>
                <button className="btn hitbtn" style={{ flex: 1 }} onClick={() => setPhase("damage")}>✓ Hit</button>
                <button className="btn missbtn" style={{ flex: 1 }} onClick={() => { api.playerMiss(c.uid, t.uid); onClose(); }}>✗ Miss</button>
              </div>
              {!spellAtk && <button className="btn small ghost" style={{ marginTop: 10 }} onClick={onSave}>…actually it needs a save →</button>}
            </div>
            <div className="frow" style={{ justifyContent: "space-between", marginTop: 10 }}>
              <button className="btn small ghost" onClick={() => { setPicked(null); setPhase("pick"); }}>← back</button>
            </div>
          </>
        )}
        {tab === "single" && phase === "damage" && t && (
          <>
            <div className="atktarget" style={{ marginBottom: 8 }}><b>{t.name}</b><span className="atkac good">✓ Hit</span></div>
            <div className="frow">
              <label>Damage</label>
              <input type="number" inputMode="numeric" autoFocus value={amt} onChange={(e) => setAmt(e.target.value)}
                placeholder="the total they rolled" />
            </div>
            <div className="lbl" style={{ fontSize: 11, color: "var(--faint)", margin: "6px 0 2px" }}>Damage type (optional)</div>
            <div className="pickgrid">
              <span className={`dchip ${dtype === "" ? "on" : ""}`} style={{ "--dc": "#8f8a99" }} onClick={() => setDtype("")}>untyped</span>
              {DTYPES.map((ty) => (
                <span key={ty} className={`dchip ${dtype === ty ? "on" : ""}`} style={{ "--dc": DTYPE_COLORS[ty] }} onClick={() => setDtype(ty)}>{ty}</span>
              ))}
            </div>
            <div className="frow" style={{ justifyContent: "space-between", marginTop: 12 }}>
              <button className="btn small ghost" onClick={() => setPhase("resolve")}>← back</button>
              <button className="btn primary" disabled={amt === "" || Number(amt) < 0} onClick={() => { api.playerHit(c.uid, t.uid, amt, dtype, spellAtk); onClose(); }}>
                Apply {amt !== "" ? `${amt}${dtype ? ` ${dtype}` : ""}` : "damage"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ReadiedOverlay({ c, api, results, onClose }) {
  const openedAt = useRef(Date.now());
  const armed = () => Date.now() - openedAt.current > 300;
  return (
    <div className="overlay" onClick={() => { if (armed()) onClose(); }}>
      <div className="modal readied-modal" onClick={(e) => e.stopPropagation()}>
        <div className="readied-banner">⏳ Readied action — {c.name} acts off-turn{c.reaction ? "" : " · ⚠ their reaction is already spent"}</div>
        <PlayerCard c={c} api={api} results={results} inCombat />
        <div className="frow" style={{ justifyContent: "space-between", marginTop: 6 }}>
          <button className="btn ghost" onClick={() => { if (armed()) onClose(); }}>Close (stay readied)</button>
          <button className="btn primary" onClick={() => { if (armed()) api.resolveReadied(c.uid); }}>Done — reaction spent</button>
        </div>
      </div>
    </div>
  );
}

function PlayerCastModal({ c, api, fromItem, onBack, onClose }) {
  const openedAt = useRef(Date.now());
  const armed = () => Date.now() - openedAt.current > 300;
  const [q, setQ] = useState("");
  const [letter, setLetter] = useState(null); // A–Z browse (keyboard-free)
  const [pick, setPick] = useState(null);
  const [dc, setDc] = useState(c.spellDC ?? "");
  const [noLearn, setNoLearn] = useState(!!fromItem); // scroll/wand casts never join the spellbook
  const [castAnyway, setCastAnyway] = useState(false); // Subtle Spell / DM override for a Silenced caster
  const silenced = (c.conditions || []).some((cd) => cd.name === "Silenced");
  useEffect(() => { setCastAnyway(false); }, [pick]); // re-block each newly picked spell
  const commit = () => api.setSpellDC(c.uid, dc);
  const consumeScroll = () => { if (fromItem && pick) api.consumeItem(c.uid, ["scroll", SPELL_REF[pick].n]); };
  const byName = (a, b) => SPELL_REF[a].n.localeCompare(SPELL_REF[b].n);
  const searching = q.trim().length >= 2;
  const browsing = searching || !!letter;
  const matches = searching
    ? Object.keys(SPELL_REF).filter((k) => SPELL_REF[k].n.toLowerCase().includes(q.trim().toLowerCase())).sort(byName).slice(0, 40)
    : letter
    ? Object.keys(SPELL_REF).filter((k) => SPELL_REF[k].n.toUpperCase().startsWith(letter)).sort(byName)
    : [];
  const s = pick ? SPELL_REF[pick] : null;
  const saveAb = s ? (s.d.match(/(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma) saving throw/i) || [])[1] : null;
  const isAttack = s ? /spell attack/i.test(s.d) : false;
  const conc = s ? /Concentration/i.test(s.du || "") : false;
  const sd = s ? spellSaveDmg(s.d, 1) : null;
  const verbal = s ? spellHasVerbal(s) : false; // a verbal spell reveals a hidden caster
  const blocked = silenced && verbal && !castAnyway; // Silenced casters can't use spells with a Verbal component
  const zoneCond = pick ? ZONE_COND_SPELLS[pick] : null; // e.g. Silence → mark who's inside
  const buffCond = pick ? BUFF_COND_SPELLS[pick] : null; // e.g. Invisibility → apply to a chosen creature
  const learn = () => { if (!noLearn) api.learnSpell(c.uid, pick); };
  const castSave = () => {
    commit(); learn(); consumeScroll();
    if (verbal) api.revealCaster(c.uid);
    api.openGroupSave({
      name: `${c.name} — ${s.n}`, ability: saveAb.slice(0, 3).toLowerCase(),
      dmg: sd ? sd.dmg : "", dtype: sd ? sd.dtype : "", half: sd ? sd.half : true,
      dc: dc === "" ? null : Number(dc), single: singleTargetText(s.d), casterUid: c.uid,
      noDmg: !/damage/i.test(s.d), ...(spellCondFrom(s.d, s.du) || {}),
      ...(conc ? { concSrc: c.uid, concCast: s.n } : {}),
    });
  };
  return (
    <div className="overlay" onClick={() => { if (armed()) onClose(); }}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{fromItem ? `📜 ${c.name} casts from a scroll` : `✨ ${c.name} casts a spell`}</h3>
        {silenced && (
          <div className="trait" style={{ fontSize: 12, color: "var(--danger)", margin: "0 0 6px" }}>
            🤫 <b>{c.name} is Silenced</b> — no spells with a Verbal (V) component. Spells without a V (e.g. Minor Illusion) still work.
          </div>
        )}
        {(!pick || saveAb) && (
          <div className="frow" style={{ gap: 6, fontSize: 12 }}>
            <label style={{ minWidth: 0 }}>Spell save DC</label>
            <input type="number" inputMode="numeric" style={{ width: 56 }} value={dc} placeholder="—" onChange={(e) => setDc(e.target.value)} onBlur={commit} />
            <span style={{ fontSize: 11, color: "var(--faint)" }}>optional — saved on {c.name}, auto-fills saves</span>
          </div>
        )}
        {!pick ? (
          <>
            <input className="sbook-search" placeholder="Search spells…" value={q} onChange={(e) => { setQ(e.target.value); if (e.target.value) setLetter(null); }} />
            <AzBar value={letter} enabled={SPELL_FIRST_LETTERS} onPick={(L) => { setLetter(L); if (L) setQ(""); }} />
            {browsing
              ? (matches.length === 0 ? <div className="trait" style={{ fontSize: 12 }}>{searching ? `No spells match “${q.trim()}”.` : `No spells start with ${letter}.`}</div>
                : <div className="mlist">{matches.map((k) => (
                    <button key={k} className="btn" style={{ width: "100%" }} onClick={() => { if (armed()) setPick(k); }}>
                      {SPELL_REF[k].n}<br /><span className="cr">{SPELL_REF[k].m}</span>
                    </button>))}</div>)
              : (c.spells || []).filter((k) => SPELL_REF[k]).length ? (
                <>
                  <div className="lbl" style={{ fontSize: 11, color: "var(--gold)", margin: "8px 0 3px" }}>{c.name}'s spells — tap to cast</div>
                  <div className="spellchips">
                    {(c.spells || []).filter((k) => SPELL_REF[k]).sort((a, b) => SPELL_REF[a].n.localeCompare(SPELL_REF[b].n)).map((k) => (
                      <span key={k} className="spellchip" title={SPELL_REF[k].m} onClick={() => { if (armed()) setPick(k); }}>
                        {SPELL_REF[k].n}
                        <span className="x" title="Remove from spellbook" onClick={(e) => { e.stopPropagation(); api.forgetSpell(c.uid, k); }}>×</span>
                      </span>))}
                  </div>
                  <div className="trait" style={{ fontSize: 11.5, color: "var(--faint)", marginTop: 4 }}>Or search the full compendium above — anything cast is saved here.</div>
                </>
              ) : <div className="trait" style={{ fontSize: 12 }}>Search the compendium — spells {c.name} casts are saved to their spellbook for next time.</div>}
            {onBack && (
              <div className="frow" style={{ justifyContent: "flex-start", marginTop: 10 }}>
                <button className="btn small ghost" onClick={() => { if (armed()) onBack(); }}>← Back to items</button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="statline" style={{ fontSize: 14, marginTop: 4 }}><b>{s.n}</b> — {s.m}{verbal ? " · V" : ""}</div>
            <div className="spellstats">Casting: {s.ct} · Range: {s.rg} · Duration: {s.du}{conc ? " · ◈ Concentration" : ""}</div>
            {blocked ? (
              <div style={{ marginTop: 10 }}>
                <div className="trait" style={{ fontSize: 12.5, color: "var(--danger)" }}>🤫 <b>{c.name} is Silenced</b> — {s.n} has a Verbal component, so it can't be cast here.</div>
                <button className="btn small ghost" style={{ marginTop: 8 }} onClick={() => setCastAnyway(true)}>Cast anyway (Subtle Spell / DM override) →</button>
              </div>
            ) : (
              <div className="pcactions" style={{ marginTop: 10 }}>
                {zoneCond
                  ? <button className="btn primary" onClick={() => { commit(); learn(); consumeScroll(); api.openGroupSave({ name: `${c.name} — ${s.n}`, noSave: true, noDmg: true, cond: zoneCond.cond, cond2: zoneCond.also || null, condR: null, casterUid: c.uid, ...(conc ? { concSrc: c.uid, concCast: s.n } : {}) }); }}>✦ Cast — mark who's inside the area →</button>
                  : buffCond
                  ? <button className="btn primary" onClick={() => { commit(); learn(); consumeScroll(); api.openBuffCast({ k: pick, casterUid: c.uid, cond: buffCond, condR: conc && /hour/i.test(s.du) ? null : (spellCondFrom(s.d, s.du)?.condR ?? null), conc: conc ? s.n : null }); }}>✨ Cast — apply {buffCond} to a creature →</button>
                  : saveAb
                  ? <button className="btn primary" onClick={castSave}>⭗ Resolve {saveAb.slice(0, 3).toUpperCase()} save{sd ? ` — ${sd.dmg} ${sd.dtype}` : ""}</button>
                  : isAttack
                  ? <button className="btn primary" onClick={() => { commit(); learn(); consumeScroll(); api.castSpellAttack(c.uid, s.n, conc, sd ? sd.dtype : "", verbal); }}>⚔ Spell attack — you roll to hit</button>
                  : <button className="btn primary" onClick={() => { commit(); learn(); consumeScroll(); api.castUtility(c.uid, s.n, conc, verbal); onClose(); }}>✓ Cast{conc ? " & concentrate" : ""}</button>}
              </div>
            )}
            {saveAb && dc === "" && <div className="trait" style={{ fontSize: 11.5, color: "var(--faint)", marginTop: 6 }}>No DC set — enter it on the next screen, or above to remember it for {c.name}.</div>}
            {conc && c.concentration && c.concentration !== s.n && <div className="trait" style={{ fontSize: 11.5, color: "var(--danger)", marginTop: 6 }}>⚠ Replaces concentration on {c.concentration}.</div>}
            {fromItem
              ? <div className="trait" style={{ fontSize: 11.5, color: "var(--faint)", marginTop: 8 }}>Cast from a scroll — not added to {c.name}'s spellbook.</div>
              : <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--faint)", marginTop: 8, cursor: "pointer" }}>
                  <input type="checkbox" checked={noLearn} onChange={(e) => setNoLearn(e.target.checked)} style={{ width: 15, height: 15 }} />
                  Don't save to spellbook (scroll / one-off)
                </label>}
            <div className="frow" style={{ justifyContent: "flex-start", marginTop: 8 }}>
              <button className="btn small ghost" onClick={() => setPick(null)}>← back to search</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function UseItemModal({ c, state, api, customItems = [], onScroll, onAoe, onClose }) {
  const openedAt = useRef(Date.now());
  const armed = () => Date.now() - openedAt.current > 300;
  const isMonster = c.type === "monster";
  const [cat, setCat] = useState(null);
  const [pot, setPot] = useState(null); const [pf, setPf] = useState(""); const [pamt, setPamt] = useState(""); const [ptar, setPtar] = useState(c.uid);
  const [alch, setAlch] = useState(null); const [af, setAf] = useState(""); const [adt, setAdt] = useState(""); const [atar, setAtar] = useState(""); const [aphase, setAphase] = useState("pick"); const [aamt, setAamt] = useState("");
  const [oNote, setONote] = useState("");
  const [boon, setBoon] = useState(null); const [bthp, setBthp] = useState("");
  // DM-made consumables that a player might reach for: thrown/grenades, boons, custom potions, plain trinkets
  const usableCustom = (customItems || []).filter((it) => it.thrown || it.boon || it.heal || it.c || (!it.wpn && it.acB == null && it.ch == null));
  const useCustomItem = (it) => {
    if (it.thrown && it.thrown.aoe) {
      onAoe({ name: it.n, dmg: it.thrown.dmg, dtype: it.thrown.dtype, half: true, casterUid: c.uid,
        ...(it.thrown.cond ? { cond: it.thrown.cond, condR: null } : {}) });
      return;
    }
    if (it.thrown) { setAlch({ n: it.n, f: it.thrown.dmg, dt: it.thrown.dtype, cond: it.thrown.cond || null, custom: false }); setAf(it.thrown.dmg); setAdt(it.thrown.dtype); if (isMonster) setAamt(String(rollFormula(it.thrown.dmg || "0").total)); setAphase("pick"); setCat("alch"); return; }
    if (it.boon) { setBoon(it); setBthp(it.boon.thp ? (isMonster ? String(rollFormula(it.boon.thp).total) : "") : ""); setCat("boon"); return; }
    if (it.heal) { setPot({ n: it.n, f: it.heal }); setPf(it.heal); if (isMonster) setPamt(String(rollFormula(it.heal).total)); setCat("potion"); return; }
    setONote(it.n); // plain trinket — log it
  };
  const boonSummary = (b) => [b.thp ? `${b.thp} temp HP` : null, b.adv ? "advantage on your rolls" : null, b.cond || null, (b.adv || b.cond) && b.dur ? `${b.dur} rd` : null].filter(Boolean).join(" · ");
  const healTargets = state.combatants.filter((x) => !x.dead && x.maxHp != null && (x.uid === c.uid || x.side === c.side));
  const enemies = state.combatants.filter((x) => !x.dead && x.type !== "effect" && x.type !== "object" && x.uid !== c.uid && (c.side === "ally" ? x.side !== "ally" : x.side === "ally"));
  const t = atar ? state.combatants.find((x) => x.uid === atar) : null;
  const tAc = t && t.ac != null ? t.ac + (t.acBoost || 0) + coverBonus(t) : null;
  const term1 = (n) => n.replace(/[^a-z ]/gi, "").trim().split(" ")[0].toLowerCase();
  const amtRow = (label, formula, val, setVal) => (
    <div className="frow" style={{ gap: 6 }}>
      <label style={{ minWidth: 0 }}>{label}</label>
      <input type="number" inputMode="numeric" style={{ width: 70 }} value={val} onChange={(e) => setVal(e.target.value)} placeholder={isMonster ? "" : "your roll"} />
      {formula && <button className="btn small ghost" onClick={() => setVal(String(rollFormula(formula).total))}>🎲 {isMonster ? "roll" : "roll it"}</button>}
      {formula && <span style={{ fontSize: 11, color: "var(--faint)" }}>{formula}</span>}
    </div>
  );
  return (
    <div className="overlay" onClick={() => { if (armed()) onClose(); }}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>🎒 {c.name} uses an item</h3>
        {cat && <button className="btn small ghost" style={{ marginBottom: 6 }} onClick={() => { setCat(null); setPot(null); setAlch(null); setBoon(null); setAphase("pick"); }}>← item types</button>}
        {!cat && (
          <div className="pcactions">
            <button className="btn" onClick={() => setCat("potion")}>🧪 Healing potion</button>
            <button className="btn" onClick={onScroll}>📜 Spell scroll / wand</button>
            <button className="btn" onClick={() => setCat("alch")}>💥 Thrown / alchemical</button>
            <button className="btn" onClick={() => setCat("other")}>📦 Other{usableCustom.length > 0 ? <span className="cr"> {usableCustom.length} custom item{usableCustom.length === 1 ? "" : "s"}</span> : ""}</button>
          </div>
        )}
        {cat === "potion" && (!pot ? (
          <div className="pcactions">
            {HEAL_POTIONS.map((tp) => (
              <button key={tp.n} className="btn" onClick={() => { setPot(tp); setPf(tp.f); if (isMonster) setPamt(String(rollFormula(tp.f).total)); }}>{tp.n} <span className="cr">{tp.f}</span></button>))}
            <button className="btn" onClick={() => { setPot({ n: "Potion", f: "" }); setPf(""); }}>Custom…</button>
          </div>
        ) : (
          <>
            <div className="statline" style={{ fontSize: 13 }}><b>{pot.n}</b></div>
            {pot.f === "" && <div className="frow" style={{ gap: 6 }}><label style={{ minWidth: 0 }}>Formula</label><input type="text" style={{ width: 90 }} value={pf} onChange={(e) => setPf(e.target.value)} placeholder="2d4+2" /></div>}
            {amtRow("Healed", pf, pamt, setPamt)}
            <div className="frow" style={{ gap: 6 }}><label style={{ minWidth: 0 }}>Target</label>
              <select className="sbook-search" style={{ width: "auto", margin: 0, flex: 1 }} value={ptar} onChange={(e) => setPtar(e.target.value)}>
                {healTargets.map((x) => <option key={x.uid} value={x.uid}>{x.uid === c.uid ? "Self" : x.name}</option>)}
              </select></div>
            <div className="frow" style={{ justifyContent: "flex-end", marginTop: 8 }}>
              <button className="btn primary" disabled={pamt === ""} onClick={() => { api.itemHeal(c.uid, ptar, pamt, pot.n, ["potion", "healing"]); onClose(); }}>Apply {pamt !== "" ? `+${pamt}` : "heal"}</button>
            </div>
          </>
        ))}
        {cat === "alch" && (!alch ? (
          <div className="pcactions">
            {ALCH_ITEMS.map((a) => (
              <button key={a.n} className="btn" onClick={() => { setAlch(a); setAf(a.f); setAdt(a.dt); if (isMonster) setAamt(String(rollFormula(a.f).total)); }}>{a.n} <span className="cr">{a.f} {a.dt}{a.cond ? ` +${a.cond}` : ""}</span></button>))}
            <button className="btn" onClick={() => { setAlch({ n: "Thrown item", f: "", dt: "", custom: true }); setAf(""); setAdt(""); }}>Custom…</button>
          </div>
        ) : (
          <>
            <div className="statline" style={{ fontSize: 13 }}><b>{alch.n}</b>{alch.cond ? ` — inflicts ${alch.cond} on a hit` : ""}</div>
            {alch.custom && (
              <div className="frow" style={{ gap: 6 }}>
                <label style={{ minWidth: 0 }}>Dmg</label><input type="text" style={{ width: 78 }} value={af} onChange={(e) => setAf(e.target.value)} placeholder="2d6" />
                <select className="sbook-search" style={{ width: 110, margin: 0 }} value={adt} onChange={(e) => setAdt(e.target.value)}><option value="">type…</option>{DTYPES.map((d) => <option key={d} value={d}>{d}</option>)}</select>
              </div>
            )}
            <div className="frow" style={{ gap: 6 }}><label style={{ minWidth: 0 }}>Target</label>
              <select className="sbook-search" style={{ width: "auto", margin: 0, flex: 1 }} value={atar} onChange={(e) => setAtar(e.target.value)}>
                <option value="">— choose —</option>
                {enemies.map((x) => <option key={x.uid} value={x.uid}>{x.name}{x.ac != null ? ` (AC ${x.ac + (x.acBoost || 0) + coverBonus(x)})` : ""}</option>)}
              </select></div>
            {atar && aphase === "pick" && (
              <>
                <div className="trait" style={{ fontSize: 12, color: "var(--faint)", margin: "2px 0 8px" }}>{c.name} rolls the attack{tAc != null ? ` — did they reach AC ${tAc}?` : " — did it hit?"}</div>
                <div className="frow" style={{ gap: 8 }}>
                  <button className="btn hitbtn" style={{ flex: 1 }} onClick={() => { if (isMonster && aamt === "") setAamt(String(rollFormula(af || "0").total)); setAphase("dmg"); }}>✓ Hit</button>
                  <button className="btn missbtn" style={{ flex: 1 }} onClick={() => { api.itemMiss(c.uid, atar, alch.n, [term1(alch.n)]); onClose(); }}>✗ Miss</button>
                </div>
              </>
            )}
            {atar && aphase === "dmg" && (
              <>
                {amtRow("Damage", af, aamt, setAamt)}
                <div className="frow" style={{ justifyContent: "space-between", marginTop: 8 }}>
                  <button className="btn small ghost" onClick={() => setAphase("pick")}>← back</button>
                  <button className="btn primary" disabled={aamt === ""} onClick={() => { api.itemDamage(c.uid, atar, aamt, adt, alch.n, alch.cond || null, [term1(alch.n)]); onClose(); }}>Apply {aamt !== "" ? `${aamt}${adt ? ` ${adt}` : ""}` : "damage"}</button>
                </div>
              </>
            )}
          </>
        ))}
        {cat === "boon" && boon && (
          <>
            <div className="statline" style={{ fontSize: 13 }}><b>{boon.n}</b></div>
            <div className="trait" style={{ fontSize: 12, color: "var(--faint)", margin: "2px 0 8px" }}>Applied to {c.name}: {boonSummary(boon.boon) || "no effect set"}.</div>
            {boon.boon.thp && amtRow("Temp HP", boon.boon.thp, bthp, setBthp)}
            <div className="frow" style={{ justifyContent: "flex-end", marginTop: 8 }}>
              <button className="btn primary" disabled={!!boon.boon.thp && bthp === ""}
                onClick={() => { api.itemBoon(c.uid, { ...boon.boon, thpAmt: bthp }, boon.n, [term1(boon.n)]); onClose(); }}>Use on {c.name}</button>
            </div>
          </>
        )}
        {cat === "other" && (
          <>
            {usableCustom.length > 0 && (
              <>
                <div className="lbl" style={{ fontSize: 11, color: "var(--gold)", margin: "2px 0 4px", letterSpacing: ".08em", textTransform: "uppercase" }}>My items</div>
                <div className="pcactions">
                  {usableCustom.map((it) => (
                    <button key={it.n} className="btn" style={{ textAlign: "left" }} onClick={() => { if (armed()) useCustomItem(it); }}>
                      {it.n}
                      <span className="cr">{it.thrown ? `${it.thrown.dmg} ${it.thrown.dtype}${it.thrown.cond ? ` +${it.thrown.cond}` : ""}${it.thrown.aoe ? " · area" : ""}` : it.boon ? (boonSummary(it.boon) || "buff") : it.heal ? `heals ${it.heal}` : rarityLabel(it)}</span>
                    </button>
                  ))}
                </div>
                <div className="lbl" style={{ fontSize: 11, color: "var(--faint)", margin: "10px 0 4px", letterSpacing: ".08em", textTransform: "uppercase" }}>Something else</div>
              </>
            )}
            <div className="frow" style={{ gap: 6 }}><label style={{ minWidth: 0 }}>Item</label><input type="text" style={{ flex: 1 }} value={oNote} onChange={(e) => setONote(e.target.value)} placeholder="e.g. Thunderstone, Antitoxin…" /></div>
            <div className="frow" style={{ justifyContent: "flex-end", marginTop: 6 }}>
              <button className="btn primary" disabled={!oNote.trim()} onClick={() => { api.itemLog(c.uid, oNote.trim(), [term1(oNote)]); onClose(); }}>Log it</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CharacterSheetModal({ c, api, onSpellbook, onClose }) {
  const [d, setD] = useState(() => ({ spellDC: c.spellDC ?? "", pp: c.pp ?? "", ...Object.fromEntries(PARTY_MODS.map((k) => [k, c.mods?.[k] ?? ""])) }));
  const commit = (key) => api.setCharStat(c.uid, key, d[key]);
  const stat = (label, key) => (
    <label className="chstat">{label}<input type="number" inputMode="numeric" value={d[key]} onChange={(e) => setD({ ...d, [key]: e.target.value })} onBlur={() => commit(key)} /></label>
  );
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>🎭 {c.name}</h3>
        <div className="statline" style={{ fontSize: 13 }}>
          {c.hp != null && <><b>HP</b> {c.hp}/{c.maxHp} · </>}
          {c.ac != null && <><b>AC</b> {c.ac + (c.acBoost || 0)} · </>}
          <b>Init</b> {c.init ?? "—"}
          {c.concentration && <> · <b>Conc:</b> {c.concentration}</>}
        </div>
        <div className="trait" style={{ fontSize: 11, color: "var(--faint)", marginBottom: 8 }}>AC & HP are edited from the ⋮ menu (Edit defenses / Damage). The stats below are reference only — the app never rolls a player's saves for them.</div>
        <div className="lbl" style={{ fontSize: 11, color: "var(--gold)", margin: "4px 0 2px" }}>Spellcasting</div>
        <div className="chgrid">{stat("Spell DC", "spellDC")}</div>
        <button className="btn small" style={{ marginTop: 6 }} onClick={onSpellbook}>📖 Spellbook ({(c.spells || []).length})</button>
        <div className="lbl" style={{ fontSize: 11, color: "var(--gold)", margin: "10px 0 2px" }}>Perception & ability mods</div>
        <div className="chgrid">
          {stat("PP", "pp")}
          {PARTY_MODS.map((k) => stat(k.toUpperCase(), k))}
        </div>
        <div className="frow" style={{ justifyContent: "flex-end", marginTop: 12 }}>
          <button className="btn primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}

function SpellbookModal({ c, api, onClose }) {
  const [q, setQ] = useState("");
  const have = (c.spells || []).filter((k) => SPELL_REF[k]);
  const matches = q.trim().length >= 2
    ? Object.keys(SPELL_REF).filter((k) => SPELL_REF[k].n.toLowerCase().includes(q.trim().toLowerCase()) && !have.includes(k)).sort((a, b) => SPELL_REF[a].n.localeCompare(SPELL_REF[b].n)).slice(0, 30)
    : [];
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>📖 {c.name}'s spellbook</h3>
        <div className="trait" style={{ fontSize: 12, color: "var(--faint)", marginBottom: 8 }}>
          Add spells here or just by casting them. Saved to {c.name}{c.memberId ? " across sessions" : " for this session (add them to a saved party to keep them)"}.
        </div>
        {have.length
          ? <div className="lbl" style={{ fontSize: 11, color: "var(--gold)", margin: "2px 0 4px" }}>Known — {have.length}</div>
          : <div className="trait" style={{ fontSize: 12 }}>No spells yet.</div>}
        {have.length > 0 && (
          <div className="spellchips">
            {have.slice().sort((a, b) => SPELL_REF[a].n.localeCompare(SPELL_REF[b].n)).map((k) => (
              <span key={k} className="spellchip" title={SPELL_REF[k].m}>
                {SPELL_REF[k].n}
                <span className="x" title="Remove" onClick={() => api.forgetSpell(c.uid, k)}>×</span>
              </span>))}
          </div>
        )}
        <div className="lbl" style={{ fontSize: 11, color: "var(--faint)", margin: "10px 0 2px" }}>Add a spell</div>
        <input className="sbook-search" placeholder="Search the compendium…" value={q} onChange={(e) => setQ(e.target.value)} />
        {q.trim().length >= 2 && (
          matches.length === 0 ? <div className="trait" style={{ fontSize: 12 }}>No new matches for “{q.trim()}”.</div>
          : <div className="mlist">{matches.map((k) => (
              <button key={k} className="btn" style={{ width: "100%" }} onClick={() => { api.learnSpell(c.uid, k); setQ(""); }}>
                ＋ {SPELL_REF[k].n}<br /><span className="cr">{SPELL_REF[k].m}</span>
              </button>))}</div>
        )}
        <div className="frow" style={{ justifyContent: "flex-end", marginTop: 10 }}>
          <button className="btn primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}

function HideCheckModal({ c, api, onClose }) {
  const openedAt = useRef(Date.now());
  const armed = () => Date.now() - openedAt.current > 300;
  return (
    <div className="overlay" onClick={() => { if (armed()) onClose(); }}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>🥷 {c.name} hides</h3>
        <div className="trait" style={{ fontSize: 13, marginBottom: 12 }}>
          Did their Dexterity (Stealth) check beat the passive Perception of anyone who could notice them?
        </div>
        <div className="frow" style={{ justifyContent: "flex-end" }}>
          <button className="btn" onClick={() => { if (armed()) { api.hide(c.uid, false); onClose(); } }}>✗ Spotted</button>
          <button className="btn primary" onClick={() => { if (armed()) { api.hide(c.uid, true); onClose(); } }}>✓ Hidden</button>
        </div>
      </div>
    </div>
  );
}

function ReactionsConfigModal({ c, onSave, onClose }) {
  const [rx, setRx] = useState(() => ({ ...(c.rx || {}) }));
  const set = (k, v) => setRx((r) => ({ ...r, [k]: v }));
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Reactions — {c.name}</h3>
        <div className="trait" style={{ fontSize: 12.5, color: "var(--faint)", marginBottom: 10 }}>
          Flag which defensive reactions {c.name} can use. When an attack hits{c.ac == null ? " (needs a tracked AC for the AC ones)" : ""}, you'll be asked whether to spend their reaction.
        </div>
        <div className="rxlist">
          {DEF_REACTIONS.map((r) => (
            <label key={r.id} className={`rxrow ${rx[r.id] ? "on" : ""}`}>
              <input type="checkbox" checked={!!rx[r.id]} onChange={(e) => set(r.id, e.target.checked)} />
              <span className="rxico">{r.icon}</span>
              <span className="rxbody">
                <b>{r.n}</b>
                {r.param === "ddBonus" && rx[r.id] && (
                  <span className="rxparam">+<input type="number" inputMode="numeric" value={rx.ddBonus ?? ""} placeholder="prof"
                    onChange={(e) => set("ddBonus", e.target.value)} onClick={(e) => e.preventDefault()} /> AC</span>
                )}
                {r.param === "dmDice" && rx[r.id] && (
                  <span className="rxparam"><input type="text" style={{ width: 68 }} value={rx.dmDice ?? ""} placeholder="1d10+3"
                    onChange={(e) => set("dmDice", e.target.value)} onClick={(e) => e.preventDefault()} /></span>
                )}
                <span className="rxdesc">{r.d}</span>
              </span>
            </label>
          ))}
        </div>
        <div className="frow" style={{ justifyContent: "flex-end", marginTop: 12 }}>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={() => onSave(rx)}>Save</button>
        </div>
      </div>
    </div>
  );
}

function ReactionPromptModal({ data, onChoose }) {
  // opens under the attack tap — swallow the echo so a reaction can't be picked unseen
  const openedAt = useRef(Date.now());
  const armed = () => Date.now() - openedAt.current > 300;
  return (
    <div className="overlay">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>⚡ Reaction? — {data.tName}</h3>
        <div className="statline" style={{ fontSize: 14 }}>
          <b>{data.cName}</b>'s {data.aName} hits ({data.total} vs AC {data.effAc}).
        </div>
        {!data.reactAvail && <div className="trait" style={{ color: "var(--danger)", fontSize: 12.5, marginBottom: 4 }}>⚠ reaction already used this round</div>}
        <div className="rxchoices">
          {data.options.map((o) => (
            <button key={o.id} className="btn rxpick" onClick={() => { if (armed()) onChoose(o.id); }}>{o.label}</button>
          ))}
        </div>
        <div className="frow" style={{ justifyContent: "flex-end", marginTop: 10 }}>
          <button className="btn danger" onClick={() => { if (armed()) onChoose(null); }}>Take the hit</button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ text, confirmLabel, onYes, onClose }) {
  // opens under the tap that chose the menu item — swallow the tap echo so it
  // can't dismiss the confirmation (or worse, confirm it) unseen
  const openedAt = useRef(Date.now());
  const armed = () => Date.now() - openedAt.current > 300;
  return (
    <div className="overlay" onClick={() => { if (armed()) onClose(); }}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Are you sure?</h3>
        <div className="trait" style={{ fontSize: 13, marginBottom: 12 }}>{text}</div>
        <div className="frow" style={{ justifyContent: "flex-end" }}>
          <button className="btn" onClick={() => { if (armed()) onClose(); }}>Cancel</button>
          <button className="btn danger" onClick={() => { if (armed()) onYes(); }}>{confirmLabel}</button>
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
  const [readiedUid, setReadiedUid] = useState(null); // a readied player's card, surfaced off-turn (independent of `modal` so the attack picker can stack on top)
  const [showLog, setShowLog] = useState(false);
  const [logCollapsed, setLogCollapsed] = useState(false);
  const logRef = useRef(null);
  const botPad = state.mode === "combat"
    ? "calc(92px + env(safe-area-inset-bottom, 0px))" // clears the fixed bottom turn bar
    : "calc(24px + env(safe-area-inset-bottom, 0px))";
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
  // Victory: every enemy dead (and the party not wiped — mutual destruction is
  // a TPK, not a win). Tap to dismiss; auto-fades after 12s as a fallback.
  const [victory, setVictory] = useState(null);
  const vicArmedRef = useRef(true);
  useEffect(() => {
    if (state.mode !== "combat") { vicArmedRef.current = true; setVictory(null); return; }
    const foes = state.combatants.filter((c) => c.side === "enemy" && c.type !== "effect" && c.type !== "object");
    const party = tpkParty(state);
    const wipedParty = party.length > 0 && party.every((c) => c.dead);
    const won = foes.length > 0 && foes.every((c) => c.dead) && !wipedParty;
    if (won && vicArmedRef.current) { vicArmedRef.current = false; setVictory({ id: Math.random() }); }
    if (!won) vicArmedRef.current = true; // new enemies (or a revived one) re-arm it
  }, [state.combatants, state.mode]);
  const dismissVictory = () => setVictory((v) => (v && !v.out ? { ...v, out: true } : v));
  useEffect(() => {
    if (!victory) return undefined;
    if (victory.out) { const t = setTimeout(() => setVictory(null), 340); return () => clearTimeout(t); }
    const t = setTimeout(() => setVictory((v) => (v && v.id === victory.id ? { ...v, out: true } : v)), 12000);
    return () => clearTimeout(t);
  }, [victory]);

  // The "party" for win/loss purposes: ally players — or, in a fight with no
  // players at all (arena tests like All Goblins), the ally-side monsters.
  const tpkParty = (st) => {
    const players = st.combatants.filter((c) => c.type === "player" && c.side === "ally");
    return players.length ? players : st.combatants.filter((c) => c.side === "ally" && c.type !== "effect" && c.type !== "object");
  };
  // TPK: when every party member is dead (not just down), one big skull moment.
  // Re-arms if anyone comes back (undo, revivify) so a later wipe still plays.
  const [tpk, setTpk] = useState(null);
  const tpkArmedRef = useRef(true);
  useEffect(() => {
    if (state.mode !== "combat") { tpkArmedRef.current = true; return undefined; }
    const party = tpkParty(state);
    const wiped = party.length > 0 && party.every((c) => c.dead);
    if (wiped && tpkArmedRef.current) {
      tpkArmedRef.current = false;
      setTpk({ id: Math.random() });
      const t = setTimeout(() => setTpk(null), 5100);
      return () => clearTimeout(t);
    }
    if (!wiped) tpkArmedRef.current = true;
    return undefined;
  }, [state.combatants, state.mode]);

  const warnedTurn = useRef(null);
  useEffect(() => {
    if (state.mode !== "combat" || !state.activeUid) return;
    const key = `${state.round}:${state.activeUid}`;
    if (warnedTurn.current === key) return;
    warnedTurn.current = key;
    const c = state.combatants.find((x) => x.uid === state.activeUid);
    if (!c || c.dead) return;
    // downed and dying: their turn IS the death save — surface the recorder
    if (c.unconscious && !c.stable) { setModal({ type: "deathsaves", uid: c.uid }); return; }
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
  const [myItems, setMyItems] = useState([]);
  const [animSpeed, setAnimSpeedState] = useState("medium");
  const setAnimSpeed = (v) => { setAnimSpeedState(v); stSet("dm5e:animSpeed", v); };
  const [manualDice, setManualDiceState] = useState(false);
  const setManualDice = (v) => { setManualDiceState(v); stSet("dm5e:manualDice", v ? 1 : 0); };
  const [playersWinTies, setPlayersWinTiesState] = useState(true);
  const setPlayersWinTies = (v) => { setPlayersWinTiesState(v); stSet("dm5e:playersWinTies", v ? 1 : 0); };
  const [dmgFx, setDmgFxState] = useState(true);
  const setDmgFx = (v) => { setDmgFxState(v); stSet("dm5e:dmgFx", v ? 1 : 0); };
  const [dmgFxAll, setDmgFxAllState] = useState(true);
  const setDmgFxAll = (v) => { setDmgFxAllState(v); stSet("dm5e:dmgFxAll", v ? 1 : 0); };
  const [dmgSfx, setDmgSfxState] = useState(true);
  const setDmgSfx = (v) => { setDmgSfxState(v); stSet("dm5e:dmgSfx", v ? 1 : 0); };
  const [spellSfx, setSpellSfxState] = useState(true);
  const setSpellSfx = (v) => { setSpellSfxState(v); stSet("dm5e:spellSfx", v ? 1 : 0); };
  const [screenFx, setScreenFx] = useState(null);
  const [previewRowFx, setPreviewRowFx] = useState(null);
  const fireScreenFx = (kind, delayMs = 0, force = false, color = null) => {
    if (!kind) return;
    const gate = SPELL_KINDS.has(kind) ? SPFX.on : SFX.on;
    if (!force && (!gate || !ANIM.on)) return;
    const id = Math.random();
    setTimeout(() => setScreenFx({ kind, id, color }), Math.max(0, delayMs));
    setTimeout(() => setScreenFx((s) => (s && s.id === id ? null : s)), Math.max(0, delayMs) + 650);
  };
  const previewRow = (type) => { // settings preview — plays regardless of the toggles
    const id = Math.random();
    setPreviewRowFx({ dtype: type, id });
    setTimeout(() => setPreviewRowFx((f) => (f && f.id === id ? null : f)), 1600);
  };
  const [showTouches, setShowTouchesState] = useState(false);
  const setShowTouches = (v) => { setShowTouchesState(v); stSet("dm5e:showTouches", v ? 1 : 0); };
  const [expandedOn, setExpandedOnState] = useState(false);
  const [expReady, setExpReady] = useState(false);
  const setExpandedOn = (v) => { setExpandedOnState(v); stSet("dm5e:expandedBestiary", v ? 1 : 0); };
  useEffect(() => {
    if (!expandedOn || EXPANDED.list.length) { setExpReady(EXPANDED.list.length > 0); return undefined; }
    let live = true;
    import("./data/bestiaryTob.js").then((m) => {
      if (!live) return;
      EXPANDED.list = m.BESTIARY_TOB;
      EXPANDED.pools = m.TOB_POOLS;
      setExpReady(true);
    });
    return () => { live = false; };
  }, [expandedOn]);
  // assign during render so components created in this same pass read the fresh values
  ANIM.beat = ANIM_SPEEDS[animSpeed] ?? ANIM_SPEEDS.medium;
  ANIM.on = animSpeed !== "off";
  MANUAL.on = manualDice;
  TIES.playersWin = playersWinTies;
  FX.on = dmgFx;
  FX.all = dmgFxAll;
  SFX.on = dmgSfx;
  SPFX.on = spellSfx;
  EXPANDED.on = expandedOn;
  const [party, setParty] = useState({ size: 4, level: 3, difficulty: "moderate", elites: 1 });
  const [parties, setPartiesState] = useState([]); // remembered parties for the one-tap opener
  const [activePartyId, setActivePartyIdState] = useState(null);
  const [partyBoot, setPartyBoot] = useState(false); // don't render the opener until storage has answered
  const activeRoster = parties.find((p) => p.id === activePartyId) || parties[0] || null;
  const savePartiesAll = (list, activeId) => {
    setPartiesState(list); stSet("dm5e:parties", list);
    setActivePartyIdState(activeId); stSet("dm5e:activeParty", activeId);
  };
  const pickParty = (id) => { setActivePartyIdState(id); stSet("dm5e:activeParty", id); };
  // Write a live player's caster data (spellbook, DC) back onto its saved party member so it survives across sessions.
  const persistMember = (memberId, patch) => {
    if (!memberId) return;
    const cur = partiesRef.current; let changed = false;
    const list = cur.map((p) => ({ ...p, members: p.members.map((m) => (m.id === memberId ? (changed = true, { ...m, ...patch }) : m)) }));
    if (changed) savePartiesAll(list, activePartyId);
  };
  // save from the setup card: targetId updates that party, null remembers a new one
  const savePartyRoster = (roster, targetId = null) => {
    const id = targetId ?? newUid();
    const withId = { id, ...roster };
    savePartiesAll(parties.some((p) => p.id === id) ? parties.map((p) => (p.id === id ? withId : p)) : [...parties, withId], id);
  };
  // periodic backup reminder stamps: {first, last, snooze} (ms epochs)
  const [bkStamps, setBkStamps] = useState(null);
  const snoozeBackup = () => { const until = Date.now() + 14 * 864e5; setBkStamps((s) => ({ ...s, snooze: until })); stSet("dm5e:backupSnooze", until); };
  const [pName, setPName] = useState(""); const [pInit, setPInit] = useState(""); const [pAc, setPAc] = useState("");
  const [pHp, setPHp] = useState(""); const [pPp, setPPp] = useState(""); const [pDex, setPDex] = useState("");
  const stateRef = useRef(state); stateRef.current = state;
  const activeCardRef = useRef(null);
  useEffect(() => {
    if (state.mode !== "combat" || !state.activeUid) return;
    const t = setTimeout(() => activeCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    return () => clearTimeout(t);
  }, [state.activeUid, state.mode]);
  const bestRef = useRef(myBestiary); bestRef.current = myBestiary;
  const itemsRef = useRef(myItems); itemsRef.current = myItems;
  const partyRef = useRef(party); partyRef.current = party;
  const partiesRef = useRef(parties); partiesRef.current = parties;
  const undoRef = useRef([]);
  const [undoN, setUndoN] = useState(0);
  const redoRef = useRef([]);
  const [redoN, setRedoN] = useState(0);
  const pushUndo = (snap) => {
    if (undoRef.current[undoRef.current.length - 1] === snap) return;
    undoRef.current.push(snap);
    if (undoRef.current.length > 20) undoRef.current.shift();
    setUndoN(undoRef.current.length);
    redoRef.current = []; setRedoN(0); // a fresh change branches history — the redo path is gone
  };
  const undo = () => {
    const s = undoRef.current.pop();
    setUndoN(undoRef.current.length);
    if (s) {
      redoRef.current.push(stateRef.current);
      if (redoRef.current.length > 20) redoRef.current.shift();
      setRedoN(redoRef.current.length);
      setState(s); setResults({});
    }
  };
  const redo = () => {
    const s = redoRef.current.pop();
    setRedoN(redoRef.current.length);
    if (s) {
      undoRef.current.push(stateRef.current); // straight back — not via pushUndo, which would clear redo
      if (undoRef.current.length > 20) undoRef.current.shift();
      setUndoN(undoRef.current.length);
      setState(s); setResults({});
    }
  };

  const saveMyBestiary = (list) => { setMyBestiary(list); stSet("dm5e:bestiary", list); };
  /* One-time nudge after the first custom save: data lives only in this browser,
     so point at the backup file feature before a big collection builds up. */
  const backupSeenRef = useRef(true); // assume seen until the stored flag loads, so early saves can't double-fire
  const noticePendingRef = useRef(false);
  const tryShowBackupNotice = () => {
    if (backupSeenRef.current || !noticePendingRef.current) return;
    setModal((m) => {
      if (m != null) return m; // another dialog is up — stay pending, retry on the next save or modal close
      backupSeenRef.current = true;
      noticePendingRef.current = false;
      stSet("dm5e:backupNoticeSeen", 1);
      return { type: "backup-notice" };
    });
  };
  const maybeShowBackupNotice = () => {
    if (backupSeenRef.current) return;
    noticePendingRef.current = true;
    setTimeout(tryShowBackupNotice, 450);
  };
  useEffect(() => {
    if (modal != null) return;
    const t = setTimeout(tryShowBackupNotice, 350);
    return () => clearTimeout(t);
  }, [modal]); // eslint-disable-line react-hooks/exhaustive-deps
  const upsertBestiary = (sbs) => {
    let list = [...bestRef.current];
    let added = 0, updated = 0;
    for (const sb of sbs) {
      const i = list.findIndex((x) => x.name.toLowerCase() === sb.name.toLowerCase());
      if (i >= 0) { list[i] = sb; updated++; } else { list.push(sb); added++; }
    }
    list.sort((a, b) => a.name.localeCompare(b.name));
    saveMyBestiary(list);
    maybeShowBackupNotice();
    return { added, updated };
  };
  /* ---------- custom items ---------- */
  const saveMyItems = (list) => { setMyItems(list); stSet("dm5e:items", list); };
  const saveCustomItem = (item, origName) => {
    const drop = new Set([item.n.toLowerCase(), (origName || item.n).toLowerCase()]);
    const list = [...itemsRef.current.filter((x) => !drop.has(x.n.toLowerCase())), item]
      .sort((a, b) => a.n.localeCompare(b.n));
    saveMyItems(list);
    pushToasts([{ kind: "good", text: `"${item.n}" ${origName ? "updated in" : "saved to"} your items.` }]);
    maybeShowBackupNotice();
  };
  const deleteCustomItem = (name) => saveMyItems(itemsRef.current.filter((x) => x.n.toLowerCase() !== name.toLowerCase()));
  const upsertItems = (arr) => {
    const good = arr.filter((y) => y && typeof y.n === "string" && y.n.trim());
    const names = new Set(good.map((y) => y.n.toLowerCase()));
    saveMyItems([...itemsRef.current.filter((x) => !names.has(x.n.toLowerCase())), ...good].sort((a, b) => a.n.localeCompare(b.n)));
    return good.length;
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
      const its = await stGet("dm5e:items");
      if (Array.isArray(its)) setMyItems(its);
      const asp = await stGet("dm5e:animSpeed");
      if (asp && (ANIM_SPEEDS[asp] || asp === "off")) setAnimSpeedState(asp);
      setManualDiceState(!!(await stGet("dm5e:manualDice")));
      const pwt = await stGet("dm5e:playersWinTies");
      if (pwt != null) setPlayersWinTiesState(!!pwt); // default stays ON until the DM says otherwise
      const dfx = await stGet("dm5e:dmgFx");
      if (dfx != null) setDmgFxState(!!dfx); // damage-type effects default ON
      const dfxa = await stGet("dm5e:dmgFxAll");
      if (dfxa != null) setDmgFxAllState(!!dfxa); // mixed-type sequence default ON
      const dsx = await stGet("dm5e:dmgSfx");
      if (dsx != null) setDmgSfxState(!!dsx); // whole-screen attack effects default ON
      const spx = await stGet("dm5e:spellSfx");
      if (spx != null) setSpellSfxState(!!spx); // whole-screen spell/breath effects default ON
      setShowTouchesState(!!(await stGet("dm5e:showTouches")));
      setExpandedOnState(!!(await stGet("dm5e:expandedBestiary")));
      let pl = await stGet("dm5e:parties");
      if (!Array.isArray(pl)) { // migrate the single-party era
        const legacy = await stGet("dm5e:partyRoster");
        pl = legacy && Array.isArray(legacy.members) && legacy.members.length ? [{ id: newUid(), ...legacy }] : [];
        if (pl.length) stSet("dm5e:parties", pl);
      }
      const clean = pl.filter((p) => p && p.id && Array.isArray(p.members) && p.members.length);
      let migrated = false;
      const withIds = clean.map((p) => ({
        ...p,
        members: p.members.map((m) => {
          if (m.id && Array.isArray(m.spells)) return m;
          migrated = true;
          return { ...m, id: m.id || newUid(), spells: Array.isArray(m.spells) ? m.spells : [] };
        }),
      }));
      setPartiesState(withIds);
      if (migrated) stSet("dm5e:parties", withIds); // stabilize member ids so spellbooks stay linked across sessions
      const ap = await stGet("dm5e:activeParty");
      if (ap) setActivePartyIdState(ap);
      setPartyBoot(true);
      // backup-reminder stamps; first-seen anchors the grace period for new installs
      let first = await stGet("dm5e:firstSeen");
      if (!first) { first = Date.now(); stSet("dm5e:firstSeen", first); }
      setBkStamps({ first, last: (await stGet("dm5e:lastBackup")) || null, snooze: (await stGet("dm5e:backupSnooze")) || null });
      backupSeenRef.current = !!(await stGet("dm5e:backupNoticeSeen"));
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

  const [ghostRows, setGhostRows] = useState([]);
  // hp holds live in a ref, written synchronously inside the mutate updater, so the
  // hold is present in the SAME commit that applies the damage. Routing this through
  // setState + setTimeout(0) painted one unmasked frame: the roster dipped, bounced
  // back up (a phantom "+N" heal pulse), then dropped again at the reveal.
  const hpHoldsRef = useRef({});
  const reactPendingRef = useRef(null); // a hit paused mid-resolution, awaiting the target's reaction choice
  const [, setHoldTick] = useState(0); // re-render trigger for hold release
  // Damage presentation: the target's roster row slides down as a ghost 450ms
  // before revealAt so the drop plays out live inside it, lingers, slides away.
  // Skipped when the real row is already fully on screen (checked at slide-in
  // time, not schedule time — the DM may scroll during the dice animation);
  // the reveal-synced hold still makes the drop play out in the real row.
  const rowOnScreen = (uid) => {
    // note: can't use CSS.escape here — the app's CSS style-string constant shadows the global
    const el = [...document.querySelectorAll(".rail .row[data-uid]")].find((x) => x.getAttribute("data-uid") === String(uid));
    if (!el) return false;
    const r = el.getBoundingClientRect();
    if (r.height < 8) return false; // rail collapsed
    const top = document.querySelector(".hdr")?.getBoundingClientRect().bottom || 0;
    const turnbar = document.querySelector(".turnbar");
    const bot = turnbar ? turnbar.getBoundingClientRect().top : window.innerHeight;
    return r.top >= top - 2 && r.bottom <= bot + 2;
  };
  const pushGhostRow = (uid, revealAt = 0) => {
    const id = Math.random();
    setTimeout(() => {
      if (rowOnScreen(uid)) return;
      setGhostRows((gs) => [...gs.filter((g) => g.uid !== uid).slice(-1), { id, uid }]);
    }, Math.max(0, revealAt - 450));
    setTimeout(() => setGhostRows((gs) => gs.map((g) => (g.id === id ? { ...g, out: true } : g))), revealAt + 2400);
    setTimeout(() => setGhostRows((gs) => gs.filter((g) => g.id !== id)), revealAt + 2750);
  };
  // Call inside a mutate updater right after damage applies; snap must be taken
  // BEFORE the damage. Masks roster + ghost at pre-hit values until revealAt,
  // then both drop together (one −N pulse each, skull/shatter if it comes to that).
  // dtype (optional): plays that damage type's effect over the row ~350ms before
  // the drop, so it reads as cause → effect.
  const [rowFxs, setRowFxs] = useState({});
  const holdGhost = (t, snap, revealAt = 0, dtype = null) => {
    if (t.maxHp == null || snap.hp == null) return; // HP untracked — nothing to show
    if (snap.hp === t.hp && (snap.thp || 0) === (t.thp || 0) && !!snap.dead === !!t.dead) return; // fully resisted — no visible change
    const huid = t.uid;
    hpHoldsRef.current = { ...hpHoldsRef.current, [huid]: snap };
    setTimeout(() => {
      if (hpHoldsRef.current[huid]?.id !== snap.id) return; // a newer hit re-held this row
      const n = { ...hpHoldsRef.current }; delete n[huid];
      hpHoldsRef.current = n;
      setHoldTick((k) => k + 1);
    }, revealAt);
    pushGhostRow(huid, revealAt);
    const types = (Array.isArray(dtype) ? dtype : dtype ? [dtype] : []).filter(Boolean);
    const play = FX.all ? types : types.slice(0, 1);
    if (play.length && FX.on && ANIM.on) {
      const id0 = Math.random();
      play.forEach((ty, i) => {
        setTimeout(() => setRowFxs((m) => ({ ...m, [huid]: { dtype: ty, id: id0 + i } })), Math.max(0, revealAt - 350) + i * 650);
      });
      const lastId = id0 + play.length - 1;
      setTimeout(() => setRowFxs((m) => {
        if (m[huid]?.id !== lastId) return m;
        const n = { ...m }; delete n[huid]; return n;
      }), revealAt + 1350 + (play.length - 1) * 650);
    }
  };
  // mixed-type hits (dragon bite: slashing + acid): types ordered by how much of the total they dealt
  const fxTypesOf = (parts) => {
    if (!parts || !parts.length) return null;
    const sums = {};
    parts.forEach((p) => { if (p.dtype) sums[p.dtype] = (sums[p.dtype] || 0) + p.amt; });
    const list = Object.keys(sums).sort((a, b) => sums[b] - sums[a]);
    return list.length ? list : null;
  };

  const attackRollCore = (d, L, uid, ai, opts = {}) => {
      const c = d.combatants.find((x) => x.uid === uid); if (!c) return;
      const a = c.actions[ai];
      const t = opts.targetUid ? d.combatants.find((x) => x.uid === opts.targetUid) : null;
      const tMode0 = t ? (opts.vsOverride || vsState(t)) : "none";
      const tMode = tMode0 === "adv*" ? "adv" : tMode0;
      const mode = t ? combineAdv(ownAdv(c), tMode) : ownAdv(c);
      if (opts.countAtk) {
        c.atkUsed = (c.atkUsed || 0) + 1;
        c.atkUsedBy = c.atkUsedBy || {};
        c.atkUsedBy[a.n] = (c.atkUsedBy[a.n] || 0) + 1;
      }
      const manual = opts.manual || null;
      const atk = opts.preRolled // a reaction resolution re-runs this attack with the same to-hit roll
        ? opts.preRolled
        : manual
        ? { nat: manual.d20, total: manual.d20 + (a.hit || 0), crit: manual.d20 === 20, fumble: manual.d20 === 1, adv: "none", text: `${manual.d20}(d20)${a.hit ? fmtMod(a.hit) : ""} = ${manual.d20 + (a.hit || 0)} (your roll)` }
        : d20(a.hit, mode);
      revealHidden(c, L); // the attack roll above keeps any hidden bonus; the Hide ends now
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
        if (isHit != null) chips.push({ t: `${!isHit && opts.reactedBy ? `${opts.reactedBy}! ` : ""}${isHit ? "HIT" : "MISS"} — ${t.name} AC ${effAc}`, k: isHit ? "sgood" : "sbad" });
        // tracked-HP targets get the hit/miss verdict row below instead; this ask-chip
        // covers untracked targets, where damage is relayed verbally
        else if (!atk.fumble && t.maxHp == null) chips.push({ t: `${t.name}'s AC unknown — ask if ${atk.total} hits`, k: "cond" });
      }
      // A landed hit on a creature flagged with a defensive reaction pauses here: show
      // the hit, ask the DM whether the target reacts, then resume (miss, reduce, or full).
      if (t && isHit === true && !opts.skipReact) {
        const reactOpts = eligibleReactions(t, a, atk, effAc);
        if (reactOpts.length) {
          setTimeout(() => setResults((r) => ({ ...r, [`${uid}:${ai}`]: chips })), 0);
          reactPendingRef.current = { uid, ai, targetUid: t.uid, atk, effAc, options: reactOpts, manual: opts.manual || null };
          setTimeout(() => setModal({ type: "reaction", data: { cName: c.name, aName: a.n, tName: t.name, total: atk.total, effAc, reactAvail: t.reaction, options: reactOpts.map((o) => ({ id: o.id, label: o.label })) } }), 0);
          L.push(`<b>${c.name}</b> — ${a.n} vs <b>${t.name}</b>: ${atk.text} to hit — <b>HIT</b> vs AC ${effAc} · awaiting ${t.name}'s reaction…`);
          return;
        }
      }
      const dmgChip = (roll, critRoll, dtype) => {
        const total = roll.total + (critRoll ? critRoll.total : 0);
        const allDice = [...(roll.dice || []), ...(critRoll ? critRoll.dice || [] : [])].map((x) => ({ ...x, cls: "dmgd" })); // flat damage rolls carry no dice
        const modTxt = roll.mod ? ` ${fmtMod(roll.mod)}` : "";
        if (allDice.length > 0 && allDice.length <= 20) { // >20 dice smells like a formula typo — fall back to text
          return { id: Math.random(), dice: allDice, dieSize: 24, t: `${modTxt} = ${total} ${dtype}${critRoll ? " (crit dice incl.)" : ""}`, k: "dmg", total };
        }
        return { t: `${dtype} ${total} [${roll.text}${critRoll ? ` + crit ${critRoll.text}` : ""}]`, k: "dmg", total };
      };
      let dmgTxt = "";
      const parts = [];
      const dmgRoll = isHit === false ? null : manual ? valuesRoll(a.dmg, manual.dmg) : rollFormula(a.dmg);
      if (dmgRoll) {
        const critRoll = !atk.crit ? null
          : manual ? (manual.dmgCrit?.length ? valuesRoll(String(a.dmg).replace(/([+-]\d+)\s*$/, ""), manual.dmgCrit) : null)
          : rollFormula(String(a.dmg).replace(/([+-]\d+)\s*$/, ""));
        const chip = dmgChip(dmgRoll, critRoll, a.dtype || "damage");
        chips.push(chip);
        parts.push({ amt: chip.total, dtype: a.dtype || null });
        dmgTxt = `${chip.total} ${a.dtype || ""}`;
        if (a.extra && (!extraNeedsAdv(a) || atk.adv === "adv")) {
          const ex = manual ? (manual.extra?.length ? valuesRoll(a.extra, manual.extra) : null) : rollFormula(a.extra);
          if (ex) {
            const exCrit = !atk.crit ? null
              : manual ? (manual.extraCrit?.length ? valuesRoll(a.extra, manual.extraCrit) : null)
              : rollFormula(a.extra);
            const echip = dmgChip(ex, exCrit, a.extraType);
            chips.push(echip);
            parts.push({ amt: echip.total, dtype: a.extraType || null });
            dmgTxt += ` + ${echip.total} ${a.extraType}`;
          }
        }
      }
      if (t && parts.length) {
        if (isHit === true) {
          if (opts.reduction) { // a damage-reduction reaction (Uncanny Dodge, Absorb Elements, Deflect Missiles)
            const before = parts.reduce((s, p) => s + p.amt, 0);
            const note = applyReduction(parts, opts.reduction);
            const after = parts.reduce((s, p) => s + p.amt, 0);
            chips.push({ t: `${opts.reactedBy ? `${opts.reactedBy}: ` : ""}${before} → ${after}${note}`, k: "sgood" });
          }
          const hpBefore = t.hp;
          const snap = { hp: t.hp, thp: t.thp, dead: t.dead, unconscious: t.unconscious, stable: t.stable, id: Math.random() };
          parts.forEach((p) => applyDamage(t, p.amt, p.dtype, L, opts.T || []));
          const dmgStr = parts.map((p) => `${p.amt} ${p.dtype || "damage"}`).join(" + ");
          chips.push({ t: `${dmgStr} applied to ${t.name}${t.dead ? " ☠" : t.unconscious ? " (down)" : ""}`, k: "sgood" });
          if (a.ls) {
            // lifesteal: half the damage actually dealt (post-resistance when the target tracks HP)
            const dealt = t.maxHp != null && hpBefore != null ? Math.max(0, hpBefore - t.hp) : parts.reduce((s, p) => s + p.amt, 0);
            const gain = Math.floor(dealt / 2);
            if (gain > 0 && c.maxHp != null) { applyHeal(c, gain, L); chips.push({ t: `🩸 lifesteal — ${c.name} regains ${gain}`, k: "sgood" }); }
          }
          const flashAt = Math.round((chipDelays(chips).at(-1) + 0.5) * 1000); // after the last chip reveals — don't spoil the staged result
          if (t.maxHp == null) { // untracked HP: no hold/pulse/ghost plays, so the text flash is the only roster feedback
            const ftxt = `${atk.total} to hit — HIT · ${dmgStr} → ${t.name}`;
            setTimeout(() => setRowFlash({ uid: t.uid, text: ftxt, id: Math.random() }), flashAt);
          }
          holdGhost(t, snap, flashAt, fxTypesOf(parts));
          // beat one: whole-screen attack effect the instant the HIT chip reveals (during the damage roll).
          // signature attacks get their archetype; every other landed hit gets the generic pulse.
          const hitIdx = chips.findIndex((ch) => ch.k === "sgood" && /^HIT/.test(ch.t || ""));
          fireScreenFx(attackArchetype(a.n) || "hit", hitIdx >= 0 ? Math.round(chipDelays(chips)[hitIdx] * 1000) : 0);
        } else if (isHit == null && t.maxHp != null) {
          chips.push({ id: Math.random(), verdict: true, applyTo: t.uid, parts, resKey: `${uid}:${ai}`, atkTotal: atk.total, total: parts.reduce((s, p) => s + p.amt, 0), tName: t.name, arch: attackArchetype(a.n) || "hit", k: "cond" });
        }
      }
      setTimeout(() => setResults((r) => ({ ...r, [`${uid}:${ai}`]: chips })), 0);
      L.push(`<b>${c.name}</b> — ${a.n}${t ? ` vs <b>${t.name}</b>` : ""}${mode !== c.advMode ? ` (${mode === "none" ? "adv+dis cancel" : mode.toUpperCase()})` : ""}: ${atk.text} to hit${atk.crit ? " (CRIT)" : ""}${isHit != null ? ` — <b>${isHit ? "HIT" : "MISS"}</b> vs AC ${effAc}` : ""}${dmgTxt ? `, damage ${dmgTxt}` : ""}`);
  };

  /* All attack paths funnel here. Resource spends (legendary action, reaction)
     happen at roll time, so cancelling the manual-dice dialog costs nothing. */
  const performAttack = (p, manual) => {
    mutate((d, L, T) => {
      const c = d.combatants.find((x) => x.uid === p.uid); if (!c) return;
      if (p.la) {
        const tk = `${d.round}:${d.activeUid}`;
        if (!c.legendary || c.legendary.rem <= 0 || c.laTurnKey === tk) return;
        c.legendary.rem -= 1; c.laTurnKey = tk;
        L.push(`<b>${c.name}</b> spends a legendary action (${c.legendary.rem} left this round).`);
      }
      if (p.opp) {
        if (!c.reaction) return;
        c.reaction = false;
        L.push(`<b>${c.name}</b> takes an <b>opportunity attack</b> (reaction spent):`);
      }
      attackRollCore(d, L, p.uid, p.ai, { targetUid: p.targetUid, vsOverride: p.vsOverride, T, countAtk: !p.la && !p.opp && c.type === "monster", manual });
    });
  };
  const maybeManualAttack = (p) => {
    const c = stateRef.current.combatants.find((x) => x.uid === p.uid);
    if (MANUAL.on && c?.type === "monster") setModal({ type: "manual-roll", p });
    else performAttack(p);
  };
  /* The DM answered the reaction prompt. Resume the paused attack with the same
     to-hit roll: AC-flip reactions turn it into a miss (Shield's boost persists),
     damage reactions re-run the hit with a reduction, "take it" re-runs at full. */
  const resolveReaction = (choiceId) => {
    const p = reactPendingRef.current;
    reactPendingRef.current = null;
    setModal(null);
    if (!p) return;
    const opt = p.options.find((o) => o.id === choiceId) || null;
    mutate((d, L, T) => {
      const t = d.combatants.find((x) => x.uid === p.targetUid);
      const c = d.combatants.find((x) => x.uid === p.uid);
      if (!c || !t) return;
      if (opt && opt.kind === "ac") {
        // temporarily raise AC so the re-run reads as a miss; Shield keeps the boost
        t.reaction = false;
        const prevBoost = t.acBoost || 0;
        t.acBoost = prevBoost + opt.bonus;
        attackRollCore(d, L, p.uid, p.ai, { targetUid: p.targetUid, preRolled: p.atk, skipReact: true, manual: p.manual, T, reactedBy: opt.n });
        if (!opt.persist) t.acBoost = prevBoost; // Defensive Duelist only negates this one attack
      } else if (opt && opt.kind === "reduce") {
        t.reaction = false;
        attackRollCore(d, L, p.uid, p.ai, { targetUid: p.targetUid, preRolled: p.atk, skipReact: true, manual: p.manual, T, reduction: opt.reduction, reactedBy: opt.n });
      } else {
        attackRollCore(d, L, p.uid, p.ai, { targetUid: p.targetUid, preRolled: p.atk, skipReact: true, manual: p.manual, T });
      }
    });
  };

  /* ---------- api passed to components ---------- */
  const api = {
    quickDamage: (uid, n) => mutate((d, L, T) => { const c = d.combatants.find((x) => x.uid === uid); if (c) applyDamage(c, n, null, L, T); }),
    quickHeal: (uid, n) => mutate((d, L) => { const c = d.combatants.find((x) => x.uid === uid); if (c) { const snap = { hp: c.hp, thp: c.thp, dead: c.dead, unconscious: c.unconscious, stable: c.stable, id: Math.random() }; applyHeal(c, n, L); holdGhost(c, snap, 600, "heal"); } }),
    openDamage: (uid) => setModal({ type: "damage", uid }),
    openSaveRoll: (uid) => setModal({ type: "save", uid }),
    openGroupSave: (preset) => setModal({ type: "group-save", preset }),
    // ---- player turn helpers (players roll their own dice; the DM records the outcome) ----
    playerAttack: (uid) => setModal({ type: "player-attack", uid }),
    playerHit: (attackerUid, targetUid, amt, dtype, spellAtk) => mutate((d, L, T) => {
      const c = d.combatants.find((x) => x.uid === attackerUid);
      const t = d.combatants.find((x) => x.uid === targetUid);
      if (!c || !t) return;
      c.atkCount = (c.atkCount || 0) + 1;
      revealHidden(c, L);
      if (!spellAtk) c.lastDtype = dtype || ""; // remember this player's weapon type — the picker defaults to it next attack (spells carry their own type)
      const n = Math.max(0, Math.round(Number(amt) || 0));
      const snap = { hp: t.hp, thp: t.thp, dead: t.dead, unconscious: t.unconscious, stable: t.stable, id: Math.random() };
      if (n > 0 && t.maxHp != null) { applyDamage(t, n, dtype || null, L, T); holdGhost(t, snap, 600, dtype || null); }
      else if (n > 0) { setTimeout(() => setRowFlash({ uid: t.uid, text: `HIT · ${n}${dtype ? ` ${dtype}` : ""} → ${t.name}`, id: Math.random() }), 0); }
      L.push(`<b>${c.name}</b> hits <b>${t.name}</b>${n > 0 ? ` for ${n}${dtype ? ` ${dtype}` : " damage"}` : ""}${t.dead ? " ☠" : t.unconscious ? " (down)" : ""}.`);
    }),
    playerMiss: (attackerUid, targetUid) => mutate((d, L) => {
      const c = d.combatants.find((x) => x.uid === attackerUid);
      const t = d.combatants.find((x) => x.uid === targetUid);
      if (!c) return;
      c.atkCount = (c.atkCount || 0) + 1;
      revealHidden(c, L);
      L.push(`<b>${c.name}</b> misses${t ? ` <b>${t.name}</b>` : ""}.`);
    }),
    dodge: (uid) => mutate((d, L) => { const c = d.combatants.find((x) => x.uid === uid); if (!c) return; c.dodging = true; L.push(`<b>${c.name}</b> takes the <b>Dodge</b> action — attacks against them have DISADVANTAGE until their next turn.`); }),
    dash: (uid) => mutate((d, L) => { const c = d.combatants.find((x) => x.uid === uid); if (c) L.push(`<b>${c.name}</b> takes the <b>Dash</b> action.`); }),
    readyAction: (uid) => mutate((d, L) => { const c = d.combatants.find((x) => x.uid === uid); if (!c) return; c.readied = true; L.push(`<b>${c.name}</b> <b>readies</b> an action (triggers on their reaction).`); }),
    openReadied: (uid) => setReadiedUid(uid),
    clearReadied: (uid) => mutate((d, L) => { const c = d.combatants.find((x) => x.uid === uid); if (!c) return; c.readied = false; L.push(`<b>${c.name}</b> drops their readied action.`); }),
    resolveReadied: (uid) => { mutate((d, L) => { const c = d.combatants.find((x) => x.uid === uid); if (!c) return; c.readied = false; c.reaction = false; L.push(`<b>${c.name}</b> takes their <b>readied action</b> (reaction spent).`); }); setReadiedUid(null); },
    openHeal: (uid) => setModal({ type: "damage", uid, mode: "heal" }),
    openCast: (uid) => setModal({ type: "player-cast", uid }),
    setSpellDC: (uid, dc) => {
      const c = stateRef.current.combatants.find((x) => x.uid === uid); if (!c) return;
      const val = dc === "" || dc == null ? null : Number(dc);
      mutate((d) => { const cc = d.combatants.find((x) => x.uid === uid); if (cc) cc.spellDC = val; });
      persistMember(c.memberId, { spellDC: val });
    },
    learnSpell: (uid, key) => {
      const c = stateRef.current.combatants.find((x) => x.uid === uid); if (!c) return;
      if ((c.spells || []).includes(key)) return;
      const list = [...(c.spells || []), key];
      mutate((d) => { const cc = d.combatants.find((x) => x.uid === uid); if (cc) cc.spells = list; });
      persistMember(c.memberId, { spells: list });
    },
    forgetSpell: (uid, key) => {
      const c = stateRef.current.combatants.find((x) => x.uid === uid); if (!c) return;
      const list = (c.spells || []).filter((k) => k !== key);
      mutate((d) => { const cc = d.combatants.find((x) => x.uid === uid); if (cc) cc.spells = list; });
      persistMember(c.memberId, { spells: list });
    },
    openSpellbook: (uid) => setModal({ type: "spellbook", uid }),
    openCharacter: (uid) => setModal({ type: "character", uid }),
    setCharStat: (uid, key, value) => {
      const c = stateRef.current.combatants.find((x) => x.uid === uid); if (!c) return;
      const num = value === "" || value == null || isNaN(Number(value)) ? null : Number(value);
      mutate((d) => {
        const cc = d.combatants.find((x) => x.uid === uid); if (!cc) return;
        if (key === "pp") cc.pp = num;
        else if (key === "spellDC") cc.spellDC = num;
        else { cc.mods = { ...(cc.mods || {}) }; if (num == null) delete cc.mods[key]; else cc.mods[key] = num; }
      });
      persistMember(c.memberId, { [key]: num });
    },
    openUseItem: (uid) => setModal({ type: "use-item", uid }),
    consumeItem: (uid, terms) => mutate((d, L) => { const c = d.combatants.find((x) => x.uid === uid); if (c) consumeLootInDraft(c, terms, L); }),
    itemHeal: (uid, targetUid, amt, itemName, terms) => mutate((d, L, T) => {
      const c = d.combatants.find((x) => x.uid === uid);
      const t = d.combatants.find((x) => x.uid === targetUid) || c;
      if (!c || !t) return;
      const n = Math.max(0, Math.round(Number(amt) || 0));
      if (n > 0 && t.maxHp != null) { const snap = { hp: t.hp, thp: t.thp, dead: t.dead, unconscious: t.unconscious, stable: t.stable, id: Math.random() }; applyHeal(t, n, L); holdGhost(t, snap, 600, "heal"); }
      L.push(`<b>${c.name}</b> uses <b>${itemName}</b>${t.uid === c.uid ? "" : ` on <b>${t.name}</b>`}${n > 0 ? ` — heals ${n}` : ""}.`);
      consumeLootInDraft(c, terms, L);
    }),
    itemDamage: (uid, targetUid, amt, dtype, itemName, cond, terms) => mutate((d, L, T) => {
      const c = d.combatants.find((x) => x.uid === uid);
      const t = d.combatants.find((x) => x.uid === targetUid);
      if (!c || !t) return;
      const n = Math.max(0, Math.round(Number(amt) || 0));
      revealHidden(c, L);
      const snap = { hp: t.hp, thp: t.thp, dead: t.dead, unconscious: t.unconscious, stable: t.stable, id: Math.random() };
      if (n > 0 && t.maxHp != null) { applyDamage(t, n, dtype || null, L, T); holdGhost(t, snap, 600, dtype || null); }
      if (cond && !t.dead && !t.conditions.some((cd) => cd.name === cond)) t.conditions.push({ name: cond, rounds: null });
      L.push(`<b>${c.name}</b> hits <b>${t.name}</b> with <b>${itemName}</b>${n > 0 ? ` — ${n}${dtype ? ` ${dtype}` : ""}` : ""}${cond ? ` + ${cond}` : ""}${t.dead ? " ☠" : t.unconscious ? " (down)" : ""}.`);
      consumeLootInDraft(c, terms, L);
    }),
    itemMiss: (uid, targetUid, itemName, terms) => mutate((d, L) => {
      const c = d.combatants.find((x) => x.uid === uid); const t = d.combatants.find((x) => x.uid === targetUid);
      if (!c) return;
      revealHidden(c, L);
      L.push(`<b>${c.name}</b> misses${t ? ` <b>${t.name}</b>` : ""} with <b>${itemName}</b>.`);
      consumeLootInDraft(c, terms, L);
    }),
    itemLog: (uid, note, terms) => mutate((d, L) => {
      const c = d.combatants.find((x) => x.uid === uid); if (!c) return;
      L.push(`<b>${c.name}</b> uses <b>${note || "an item"}</b>.`);
      consumeLootInDraft(c, terms, L);
    }),
    itemBoon: (uid, boon, itemName, terms) => mutate((d, L) => {
      const c = d.combatants.find((x) => x.uid === uid); if (!c) return;
      const bits = [];
      if (boon.thp) {
        const amt = Math.max(0, Math.round(Number(boon.thpAmt) || rollFormula(boon.thp).total || 0));
        if (amt > 0) { grantTempHp(c, amt, L); bits.push(`${amt} temp HP`); }
      }
      // advantage and/or a condition ride on one self-condition so it shows as a single chip that auto-expires
      const condName = boon.cond || (boon.adv ? itemName : null);
      if (condName) {
        const existing = (c.conditions || []).find((cd) => cd.name === condName);
        if (existing) { existing.rounds = boon.dur || null; if (boon.adv) existing.ownAdv = "adv"; existing.boon = 1; }
        else c.conditions.push({ name: condName, rounds: boon.dur || null, ...(boon.adv ? { ownAdv: "adv" } : {}), boon: 1 });
        bits.push(`${condName}${boon.adv ? " (advantage)" : ""}${boon.dur ? ` for ${boon.dur} rd` : ""}`);
      }
      L.push(`<b>${c.name}</b> uses <b>${itemName}</b>${bits.length ? ` — ${bits.join(", ")}` : ""}.`);
      consumeLootInDraft(c, terms, L);
    }),
    revealCaster: (uid) => mutate((d, L) => { const c = d.combatants.find((x) => x.uid === uid); if (c) revealHidden(c, L); }),
    castUtility: (uid, name, conc, verbal) => mutate((d, L) => {
      const c = d.combatants.find((x) => x.uid === uid); if (!c) return;
      L.push(`<b>${c.name}</b> casts <b>${name}</b>${conc ? " (concentrating)" : ""}.`);
      if (conc) c.concentration = name;
      if (verbal) revealHidden(c, L);
    }),
    castSpellAttack: (uid, name, conc, dtype, verbal) => {
      mutate((d, L) => { const c = d.combatants.find((x) => x.uid === uid); if (!c) return; L.push(`<b>${c.name}</b> casts <b>${name}</b> — spell attack${conc ? " (concentrating)" : ""}.`); if (conc) c.concentration = name; if (verbal) revealHidden(c, L); });
      setModal({ type: "player-attack", uid, spellAtk: true, dtype: dtype || "", spellName: name });
    },
    openHide: (uid) => setModal({ type: "hide-check", uid }),
    hide: (uid, success) => mutate((d, L) => {
      const c = d.combatants.find((x) => x.uid === uid); if (!c) return;
      c.hidTurn = true; // Hide is an action — once per turn (attempting counts, hit or miss)
      if (success) {
        if (!c.conditions.some((cd) => cd.name === "Hiding")) c.conditions.push({ name: "Hiding", rounds: null });
        L.push(`<b>${c.name}</b> takes the <b>Hide</b> action and is now <b>Hiding</b> — attacks against them have DIS; their attacks have ADV.`);
      } else L.push(`<b>${c.name}</b> tries to <b>Hide</b> but is spotted.`);
    }),
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
        const r = d20(saveMod(c, cd.rpt.ab) + cov, ownAdv(c));
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
          if (amt > 0 && c.maxHp != null) {
            const snap = { hp: c.hp, thp: c.thp, dead: c.dead, unconscious: c.unconscious, stable: c.stable, id: Math.random() };
            applyDamage(c, amt, ctx.dtype || null, L, T);
            holdGhost(c, snap, 600, ctx.dtype || null);
            if (c.dead) note = "☠"; else if (c.unconscious) note = "(down)";
          } else if (amt > 0) note = "(HP untracked — apply at table)";
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
      else maybeManualAttack({ uid, ai, opp: true });
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
        const snap = { hp: c.hp, thp: c.thp, dead: c.dead, unconscious: c.unconscious, stable: c.stable, id: Math.random() };
        applyHeal(c, r.total, L);
        holdGhost(c, snap, 600, "heal");
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
    openReactions: (uid) => setModal({ type: "reactions-config", uid }),
    setReactions: (uid, rx) => mutate((d, L) => {
      const c = d.combatants.find((x) => x.uid === uid); if (!c) return;
      c.rx = rx;
      const on = DEF_REACTIONS.filter((r) => rx[r.id]).map((r) => r.n);
      L.push(`<b>${c.name}</b> defensive reactions: ${on.length ? on.join(", ") : "none"}`);
    }),
    resolveReaction,
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
    openAdv: (uid) => setModal({ type: "adv-set", uid }),
    setAdvMode: (uid, v) => {
      const cc = stateRef.current.combatants.find((x) => x.uid === uid);
      if (!cc || cc.advMode === v) return; // no-op taps shouldn't burn an undo slot
      mutate((d, L) => {
        const c = d.combatants.find((x) => x.uid === uid); if (!c) return;
        c.advMode = v;
        L.push(`<b>${c.name}</b> now rolls at ${v === "none" ? "normal" : v === "adv" ? "ADVANTAGE" : "DISADVANTAGE"}`);
      });
    },
    setAdvVs: (uid, v) => {
      const cc = stateRef.current.combatants.find((x) => x.uid === uid);
      if (!cc || (cc.advVs || "none") === v) return;
      mutate((d, L) => {
        const c = d.combatants.find((x) => x.uid === uid); if (!c) return;
        c.advVs = v;
        L.push(`Attacks against <b>${c.name}</b>: ${v === "adv" ? "ADVANTAGE" : v === "dis" ? "DISADVANTAGE" : "normal (manual flag cleared)"}`);
      });
    },
    saveToBestiary: (uid) => {
      const c = stateRef.current.combatants.find((x) => x.uid === uid);
      if (!c || c.type !== "monster") return;
      const sb = statblockFromCombatant(c);
      const { updated } = upsertBestiary([sb]);
      pushToasts([{ kind: "good", text: `${updated ? "Updated" : "Saved"} "${sb.name}" in your bestiary.` }]);
    },
    rename: (uid) => setModal({ type: "rename-prompt", uid }),
    setInit: (uid) => setModal({ type: "init-prompt", uid }),
    setDex: (uid) => setModal({ type: "dex-prompt", uid }),
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
      else maybeManualAttack({ uid, ai });
    },
    resolveAttack: (p) => {
      setModal(null);
      maybeManualAttack(p);
    },
    applyChipParts: (resKey, chipId, targetUid, parts, arch) => {
      fireScreenFx(arch, 0); // beat one: hit confirmed by the DM (unknown-AC path)
      mutate((d, L, T) => {
        const t = d.combatants.find((x) => x.uid === targetUid); if (!t || t.dead) return;
        const hpBefore = t.hp;
        const snap = { hp: t.hp, thp: t.thp, dead: t.dead, unconscious: t.unconscious, stable: t.stable, id: Math.random() };
        parts.forEach((p) => applyDamage(t, p.amt, p.dtype, L, T));
        const dmgStr = parts.map((p) => `${p.amt} ${p.dtype || "damage"}`).join(" + ");
        // deferred-hit path (DM confirmed vs unknown AC): honor lifesteal here too
        const [auid, ai] = String(resKey).split(":");
        const atkC = d.combatants.find((x) => x.uid === auid);
        const act = atkC?.actions?.[+ai];
        if (act?.ls && atkC.maxHp != null) {
          const dealt = t.maxHp != null && hpBefore != null ? Math.max(0, hpBefore - t.hp) : parts.reduce((s, p) => s + p.amt, 0);
          const gain = Math.floor(dealt / 2);
          if (gain > 0) applyHeal(atkC, gain, L);
        }
        if (t.maxHp == null) setTimeout(() => setRowFlash({ uid: targetUid, text: `${dmgStr} → ${t.name}`, id: Math.random() }), 0);
        holdGhost(t, snap, 600, fxTypesOf(parts));
      });
      setResults((r) => {
        const arr = (r[resKey] || []).map((ch) => (ch.id === chipId ? { t: "✓ HIT — applied", k: "sgood" } : ch));
        return { ...r, [resKey]: arr };
      });
    },
    markAttackMiss: (resKey, chipId, tName) => {
      mutate((d, L) => {
        const [auid] = String(resKey).split(":");
        const c = d.combatants.find((x) => x.uid === auid);
        L.push(`<b>${c ? c.name : "The attack"}</b> vs <b>${tName}</b> — reported <b>MISS</b>, no damage.`);
      });
      setResults((r) => {
        const arr = (r[resKey] || []).map((ch) => (ch.id === chipId ? { t: `✗ MISS — no damage to ${tName}`, k: "sbad" } : ch));
        return { ...r, [resKey]: arr };
      });
    },

    spendLARoll: (uid, ai) => {
      const st = stateRef.current;
      const c = st.combatants.find((x) => x.uid === uid);
      if (!c?.legendary || c.legendary.rem <= 0) return;
      const opp = targetCands(st, c).filter((x) => (c.side === "ally" ? x.side !== "ally" : x.side === "ally"));
      if (opp.some(targetWorth)) setModal({ type: "target-pick", uid, ai, la: true });
      else maybeManualAttack({ uid, ai, la: true });
    },


    rollBonus: (uid, ai, dice, dtype, alt) => mutate((d, L, T) => {
      const c = d.combatants.find((x) => x.uid === uid); if (!c) return;
      const a = c.actions[ai];
      const r = rollFormula(dice); if (!r) return;
      const tag = alt ? " (alt)" : " (conditional)";
      const modTxt = r.mod ? ` ${fmtMod(r.mod)}` : "";
      const chip = r.dice && r.dice.length <= 20
        ? { id: Math.random(), dice: r.dice.map((x) => ({ ...x, cls: "dmgd" })), dieSize: 24, t: `${modTxt} = ${r.total} ${dtype}${tag}`, k: "dmg" }
        : { t: `${dtype} ${r.total} [${r.text}]${tag}`, k: "dmg" };
      setTimeout(() => setResults((res) => ({ ...res, [`${uid}:${ai}`]: [...(res[`${uid}:${ai}`] || []), chip] })), 0);
      L.push(`<b>${c.name}</b> — ${a.n} ${alt ? "alternate" : "conditional"} damage: ${r.total} ${dtype} [${r.text}]`);
    }),

    useSaveAction: (uid, ai) => mutate((d, L, T) => {
      const c = d.combatants.find((x) => x.uid === uid); if (!c) return;
      const a = c.actions[ai];
      if (replacesAttack(c, a) && d.activeUid === c.uid) {
        if (atkLeft(c) <= 0) return; // no attack left to substitute
        c.atkUsed = (c.atkUsed || 0) + 1;
        L.push(`<b>${c.name}</b> replaces one attack with <b>${a.n}</b>.`);
      }
      const chips = [{ t: `DC ${a.save?.dc} ${a.save?.ability} save`, k: "hit" }];
      const dice = a.dmg || (a.d && (a.d.match(/(\d+d\d+(?:[+-]\d+)?)/) || [])[1]);
      if (dice) {
        const r = rollFormula(dice);
        if (r && r.dice && r.dice.length <= 20) {
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
      if (replacesAttack(c, a) && d.activeUid === c.uid) {
        if (atkLeft(c) <= 0) return;
        c.atkUsed = (c.atkUsed || 0) + 1;
        L.push(`<b>${c.name}</b> replaces one attack with <b>${a.n}</b>.`);
      }
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
    maybeShowBackupNotice();
  };
  const loadPlaytest = (enc) => {
    setModal(null);
    mutate((d, L) => {
      d.combatants = []; d.log = []; d.mode = "setup"; d.round = 0; d.activeUid = null;
      L.push(`— 🧪 Playtest: <b>${enc.name}</b> —`);
    });
    if (enc.special) { addPlaytest(); pushToasts([{ kind: "good", text: `Playtest loaded: ${enc.name}` }]); return; }
    mutate((d, L) => {
      if (!enc.noPlayers) [{ name: "Player", init: 11, ac: 15, hp: 45 }, { name: "Player 2", init: 14, ac: 17, hp: 52 }].forEach((pp) => {
        const p = makePlayer(pp);
        d.combatants.push(p);
        L.push(`Added <b>${p.name}</b> (initiative ${pp.init}, AC ${pp.ac}, ${pp.hp} HP tracked)`);
      });
      enc.list.forEach(([nm, n, side, label]) => {
        const sb = BESTIARY.find((b) => b.name === nm); if (!sb) return;
        for (let i = 0; i < n; i++) d.combatants.push(makeMonster(sb, d, { ...(side ? { side } : {}), ...(label ? { name: n > 1 ? `${label} ${i + 1}` : label } : {}) }));
        L.push(`Added <b>${n}× ${label || nm}</b>${side === "ally" ? " (allies)" : ""}`);
      });
    });
    pushToasts([{ kind: "good", text: `Playtest loaded: ${enc.name}` }]);
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
      const p = makePlayer({ name: pName.trim(), init: pInit, ac: pAc ? parseInt(pAc, 10) : null, hp: pHp !== "" ? parseInt(pHp, 10) : null, pp: pPp !== "" ? parseInt(pPp, 10) : null, dex: pDex });
      d.combatants.push(p);
      L.push(`Added <b>${p.name}</b> (initiative ${p.init ?? "—"}${p.ac ? `, AC ${p.ac}` : ""}${p.hp != null ? `, ${p.hp} HP tracked` : ""})`);
    });
    setPName(""); setPInit(""); setPAc(""); setPHp(""); setPPp(""); setPDex("");
  };

  const addPartyNow = (members, level) => {
    if (!members.length) return;
    mutate((d, L) => {
      members.forEach((m) => {
        const p = makePlayer({ name: m.name, init: "", ac: m.ac !== "" && m.ac != null ? parseInt(m.ac, 10) : null, hp: m.hp !== "" && m.hp != null ? m.hp : null, pp: m.pp !== "" && m.pp != null ? m.pp : null, spells: m.spells, memberId: m.id, spellDC: m.spellDC, mods: memberMods(m) });
        d.combatants.push(p);
      });
      L.push(`Party assembled: ${members.map((m) => `<b>${m.name}</b>`).join(", ")}${level ? ` (level ${level})` : ""}`);
    });
    // prefill the encounter balancer with tonight's headcount (and level when known)
    setParty((pp) => { const np = { ...pp, size: members.length, ...(level ? { level } : {}) }; stSet("dm5e:party", np); return np; });
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
    if (first) { d.activeUid = first.uid; L.push(`— <b>Combat begins! Round 1</b> —`); onTurnStart(first, d, L, T); playBurnFx(d); L.push(`▶ <b>${first.name}</b>'s turn.`); }
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
    setModal({ type: "init-ties-check" });
  };
  useEffect(() => {
    if (modal?.type !== "init-ties-check") return;
    const groups = playerTieGroups(stateRef.current.combatants);
    if (groups.length) setModal({ type: "init-ties", groups });
    else { setModal(null); reallyStart(); }
  }, [modal]); // eslint-disable-line react-hooks/exhaustive-deps
  const resolveTies = (uidLists) => {
    setModal(null);
    mutate((d, L) => {
      uidLists.forEach((uids) => {
        const names = [];
        uids.forEach((uid, idx) => { const c = d.combatants.find((x) => x.uid === uid); if (c) { c.tb = idx; names.push(c.name); } });
        if (names.length > 1) L.push(`Initiative tie resolved: ${names.join(" → ")}.`);
      });
    });
    reallyStart();
  };
  const doEndCombat = () => {
    setModal(null); setResults({});
    mutate((d, L) => {
      const kept = d.combatants.filter((c) => c.side === "ally" && c.type !== "effect");
      kept.forEach((c) => {
        c.init = null; c.initText = null; c.tb = 0; c.conditions = []; c.concentration = null;
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
  const playBurnFx = (d) => (d.burnFx || []).forEach(({ uid, snap }) => { const t = d.combatants.find((x) => x.uid === uid); if (t) holdGhost(t, snap, 600, "fire"); });
  const next = () => mutate((d, L, T) => { advanceTurn(d, L, T, 1); playBurnFx(d); clearActiveResults(d, showRechargeDice(d)); });
  const prev = () => mutate((d, L, T) => { advanceTurn(d, L, T, -1); clearActiveResults(d); });

  const doReset = (keepMonsters) => {
    setModal(null); setResults({});
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
        if (mode === "heal") { const snap = { hp: c.hp, thp: c.thp, dead: c.dead, unconscious: c.unconscious, stable: c.stable, id: Math.random() }; applyHeal(c, amt, L); holdGhost(c, snap, 600, "heal"); }
        else if (mode === "thp") grantTempHp(c, amt, L);
        else if (mode === "set") {
          // reconcile: correct the HP directly to a value, no damage/heal math or animation
          if (c.type === "player" && c.maxHp == null) { L.push(`<b>${c.name}</b> — players track their own HP; nothing to set.`); return; }
          const before = c.hp;
          const nv = c.maxHp != null ? Math.max(0, Math.min(c.maxHp, amt)) : Math.max(0, amt);
          c.hp = nv;
          if (nv > 0) {
            c.dead = false; c.unconscious = false; c.stable = false; c.ds = { s: 0, f: 0 };
          } else if (c.side === "enemy" || c.type === "object") {
            c.dead = true; c.thp = 0; c.concentration = null;
          } else {
            c.unconscious = true; c.concentration = null; c.stable = false; c.ds = { s: 0, f: 0 };
          }
          L.push(`<b>${c.name}</b> HP corrected to ${nv}${c.maxHp != null ? `/${c.maxHp}` : ""} (was ${before}).`);
        }
        else {
          const snap = { hp: c.hp, thp: c.thp, dead: c.dead, unconscious: c.unconscious, stable: c.stable, id: Math.random() };
          applyDamage(c, amt, dtype, L, T);
          holdGhost(c, snap, 600, dtype || null); // manual damage gets the same presentation as attacks
        }
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

  const resolveGroupSave = ({ name, ability, dc, dmg, dtype, halfOn, targets, noSave, cond, cond2, condR, effectUid, laUid, cmdPick, concSrc, concCast, rpt, rptNote, spellCastUid }) => {
    // beat one: the breath/spell goes off — a whole-screen shape by delivery, colored by type
    if (targets && targets.length) fireScreenFx(spellShape(name), 0, false, dtypeColor(dtype));
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
        const snap = { hp: c.hp, thp: c.thp, dead: c.dead, unconscious: c.unconscious, stable: c.stable, id: Math.random() };
        if (noSave) {
          let amt = dmgRoll ? dmgRoll.total : 0;
          if (amt > 0) { applyDamage(c, amt, dtype || null, L, T); holdGhost(c, snap, 600, dtype || null); }
          let note = c.dead ? "☠" : c.unconscious ? "(down)" : "";
          // no-save area effects (e.g. Silence) can also impose one or two conditions on everyone caught
          [cond, cond2].forEach((cn) => {
            if (cn && !c.dead && !c.conditions.some((cd) => cd.name === cn)) {
              c.conditions.push({ name: cn, rounds: condR ?? null, src: concSrc || null, spell: concCast || null, rpt: rpt ? { ab: ability, dc, note: rptNote || null } : null });
              note = (note ? note + " " : "") + `+${cn}`;
            }
          });
          const condLbl = [cond, cond2].filter(Boolean).join(" & ");
          if (amt > 0 || condLbl) L.push(`<b>${c.name}</b>${amt > 0 ? ` takes ${amt}${dtype ? ` ${dtype}` : ""}` : ""}${condLbl ? `${amt > 0 ? " and is" : " is"} <b>${condLbl}</b>` : ""} (no save)${c.dead ? " ☠" : ""}`);
          rows.push({ uid: c.uid, name: c.name, total: null, ok: null, dmg: dmgRoll ? amt : null, note });
          return;
        }
        const cov = ability === "dex" ? coverBonus(c) : 0;
        const mod = saveMod(c, ability) + cov;
        const r = d20(mod, ownAdv(c));
        const ok = r.total >= dc;
        let amt = null, note = "";
        if (dmgRoll) {
          amt = ok ? (halfOn ? Math.floor(dmgRoll.total / 2) : 0) : dmgRoll.total;
          if (amt > 0) { applyDamage(c, amt, dtype || null, L, T); holdGhost(c, snap, 600, dtype || null); }
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
        title: noSave ? (dmgRoll ? `Area damage — ${rows.length} hit` : `${[cond, cond2].filter(Boolean).join(" & ") || "Effect"} — ${rows.length} affected`) : `DC ${dc} ${ability.toUpperCase()}${pending.length ? ` — players roll now!` : ` — ${rows.filter((x) => x.ok).length}/${rows.length} saved`}`,
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
      const r = d20(mod, ownAdv(c));
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
    const now = Date.now(); // producing an export counts as a backup — quiets the periodic reminder
    setBkStamps((s) => ({ ...(s || { first: now }), last: now }));
    stSet("dm5e:lastBackup", now);
    return { app: "dm5e", version: 1, exported: new Date().toISOString(), bestiary: bestRef.current, items: itemsRef.current, party: partyRef.current, parties: partiesRef.current, slots, groups };
  };
  const importAll = async (obj) => {
    // whoever restores a backup already knows about backups — never show them the nudge
    backupSeenRef.current = true;
    stSet("dm5e:backupNoticeSeen", 1);
    const r = { bestiary: 0, items: 0, slots: 0, groups: 0 };
    if (Array.isArray(obj.bestiary) && obj.bestiary.length) { const { added, updated } = upsertBestiary(obj.bestiary); r.bestiary = added + updated; }
    if (Array.isArray(obj.items) && obj.items.length) r.items = upsertItems(obj.items);
    for (const [k, v] of Object.entries(obj.slots || {})) { if (v) { await stSet(`dm5e:slot:${k}`, v); r.slots++; } }
    for (const [k, v] of Object.entries(obj.groups || {})) { if (Array.isArray(v)) { await stSet(`dm5e:group:${k}`, v); r.groups++; } }
    if (obj.party) { setParty(obj.party); stSet("dm5e:party", obj.party); }
    // parties: current backups carry an array; single-party-era backups carry partyRoster
    const incoming = Array.isArray(obj.parties) ? obj.parties : (obj.partyRoster && Array.isArray(obj.partyRoster.members) && obj.partyRoster.members.length ? [obj.partyRoster] : []);
    const good = incoming.filter((p) => p && Array.isArray(p.members) && p.members.length).map((p) => ({ ...p, id: p.id || newUid() }));
    if (good.length) {
      const merged = [...partiesRef.current];
      good.forEach((p) => {
        const byId = merged.findIndex((x) => x.id === p.id);
        const byName = p.name ? merged.findIndex((x) => x.name === p.name) : -1;
        const at = byId >= 0 ? byId : byName;
        if (at >= 0) merged[at] = { ...p, id: merged[at].id }; else merged.push(p);
        r.parties = (r.parties || 0) + 1;
      });
      savePartiesAll(merged, activePartyId ?? merged[0].id);
    }
    return r;
  };


  const modalC = modal?.uid ? state.combatants.find((x) => x.uid === modal.uid) : null;

  /* ================= render ================= */
  return (
    <div className="dm-app" style={{ paddingBottom: botPad }}>
      <style>{CSS}</style>
      <Toasts toasts={toasts} />
      <GhostRows rows={ghostRows} combatants={state.combatants} holds={hpHoldsRef.current} fxs={rowFxs} api={api} />
      {screenFx && <ScreenFx key={screenFx.id} kind={screenFx.kind} color={screenFx.color} />}
      {victory && (
        <div className={`vic-overlay ${victory.out ? "out" : ""}`} key={victory.id} onClick={dismissVictory}>
          <div className="vic-inner">
            <div className="vic-row">
              <VicPopper flip />
              <span className="vic-word">
                {"VICTORY".split("").map((ch, i) => (
                  <span key={i} className="vic-l" style={{ animationDelay: `${0.15 + i * 0.07}s` }}>{ch}</span>
                ))}
              </span>
              <VicPopper />
            </div>
            <div className="vic-sub">tap to continue</div>
          </div>
        </div>
      )}
      {tpk && (
        <div className="tpk-overlay" key={tpk.id}>
          <div className="tpk-inner">
            <div className="tpk-skull">💀</div>
            <div className="tpk-text">TPK</div>
            <div className="tpk-sub">Total Party Kill</div>
          </div>
        </div>
      )}

      <div className="hdr">
        <span className={`title ${state.mode === "combat" ? "incombat" : ""}`}>Combatkeeper</span>
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
        {redoN > 0 && <button className="btn small ghost" title="Redo — reapply what you just undid" onClick={redo}>↪</button>}
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
              <button onClick={() => setModal({ type: "playtest" })} style={{ color: "var(--fx)" }}>🧪 Playtest encounters…</button>
            </div>
          )}
        </span>
        {/* the 📖 shortcut lends redo its header slot (390px has no spare room); the compendium stays in the ⋯ menu */}
        {redoN === 0 && <button className="btn small ghost" title="Spell compendium" onClick={() => setSpellBook(true)}>📖</button>}
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
              <button onClick={() => setModal({ type: "bestiary", browse: true })}>🐉 Bestiary…</button>
              <button onClick={() => setSpellBook(true)}>📖 Spell compendium…</button>
              <button onClick={() => setModal({ type: "item-compendium" })}>📦 Item compendium…</button>
              <button onClick={() => setModal({ type: "group-save" })}>⭗ Group save / AoE…</button>
              <button onClick={toggleLog}>{showLog ? "Hide log" : "Show log"}</button>
              {state.combatants.some((c) => c.type === "monster" && !c.dead) && (
                <button onClick={() => setModal({ type: "balance" })}>⚖ Balance encounter…</button>
              )}
              <button onClick={() => setModal({ type: "slots" })}>Saves & groups…</button>
              <button onClick={() => setModal({ type: "party-edit" })}>👥 Edit parties…</button>
              <button onClick={() => setModal({ type: "anim" })}>🎲 Dice & animations…</button>
              <button onClick={() => setPlayersWinTies(!playersWinTies)} title="When on, players act before monsters on tied initiative. Tracked player DEX breaks the remaining ties.">{playersWinTies ? "✓" : "✗"} Players win init ties</button>
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

      {/* periodic backup reminder: only in setup, only when there's data worth losing,
          21 days after install or the last export, snoozed 14 days by "Later" */}
      {state.mode === "setup" && !restoreBanner && bkStamps
        && (parties.length > 0 || myBestiary.length > 0 || myItems.length > 0)
        && Date.now() > (bkStamps.last ?? bkStamps.first) + 21 * 864e5
        && Date.now() > (bkStamps.snooze ?? 0) && (
        <div className="main" style={{ paddingBottom: 0 }}>
          <div className="notice" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ flex: 1 }}>
              {bkStamps.last ? `It's been ${Math.round((Date.now() - bkStamps.last) / 864e5)} days since your last backup` : "You haven't made a backup file yet"} — parties, custom monsters, and saved encounters live only in this browser.
            </span>
            <button className="btn small primary" onClick={() => setModal({ type: "slots", showBackup: true })}>⬇ Back up now</button>
            <button className="btn small" onClick={snoozeBackup}>Later</button>
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
              <Row key={c.uid} flash={rowFlash && rowFlash.uid === c.uid ? rowFlash : null} saveBadge={results[`${c.uid}:save`]?.[0]?.badge} c={c} hold={hpHoldsRef.current[c.uid]} fx={rowFxs[c.uid]} active={c.uid === state.activeUid && state.mode === "combat"} inCombat={state.mode === "combat"} isTop={i === 0} isBottom={i === order.length - 1} api={api} />
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

        {state.mode === "setup" && partyBoot && !state.combatants.some((c) => c.type === "player") && (
          <PartySetupCard parties={parties} onPick={pickParty} onAdd={addPartyNow} onSave={savePartyRoster} />
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
          <div ref={activeCardRef} className="activecard-anchor">
            {active.type === "monster" ? <MonsterCard c={active} api={api} results={results} turnKey={`${state.round}:${state.activeUid}`} />
            : active.type === "player" ? <PlayerCard c={active} api={api} results={results} inCombat={state.mode === "combat"} />
            : <EffectCard c={active} api={api} round={state.round} />}
          </div>
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
        {" "}Optional expanded bestiary content from <b>Tome of Beasts</b> © Kobold Press, used under the Open Game License v 1.0a —{" "}
        <a href="#licenses" onClick={(e) => { e.preventDefault(); setModal({ type: "licenses" }); }}>full licenses</a>.
      </div>

      {showTouches && <TouchViz />}
      {state.mode === "combat" && (
        <div className="turnbar">
          <span className="tb-round">R{state.round}</span>
          <span className="tb-name">{active ? active.name : ""}</span>
          <button className="btn small ghost" onClick={prev} title="Back one turn">◀</button>
          <button className="btn primary" onClick={requestNext}>Next ▶</button>
        </div>
      )}

      {/* readied-action overlay — rendered before the modals so the attack picker / group-save stack on top */}
      {readiedUid && (() => {
        const rc = state.combatants.find((x) => x.uid === readiedUid);
        return rc && !rc.dead ? <ReadiedOverlay c={rc} api={api} results={results} onClose={() => setReadiedUid(null)} /> : null;
      })()}

      {/* modals */}
      {modal?.type === "damage" && <DamageModal state={state} presetUid={modal.uid} initMode={modal.mode} onApply={applyDamageModal} onClose={() => setModal(null)} />}
      {modal?.type === "save" && modalC && <SaveRollModal c={modalC} rolled={modal.rolled} onRoll={applySaveRoll} onClose={() => setModal(null)} />}
      {modal?.type === "cond" && <ConditionModal state={state} presetUid={modal.uid} onAdd={applyCondModal} onClose={() => setModal(null)} />}
      {modal?.type === "custom" && <CustomMonsterForm
        initial={modal.edit || modal.from || null}
        mode={modal.edit ? "edit" : modal.from ? "clone" : "create"}
        onAdd={(sb, count, side, notes, saveToo) => { addCustom(sb, count, side, notes, saveToo); setModal(null); }}
        onSaveEdit={(sb) => { saveEditedMonster(sb, modal.edit.name); setModal({ type: "bestiary" }); }}
        onClose={() => setModal(modal.edit || modal.from ? { type: "bestiary" } : null)} />}
      {modal?.type === "bestiary" && (
        <BestiaryModal custom={myBestiary} browse={!!modal.browse} onAdd={(sb, count, rollHp) => { addFromBestiary(sb, count, rollHp); setModal(null); }}
          onDeleteCustom={(name) => saveMyBestiary(myBestiary.filter((x) => x.name !== name))}
          onImport={(arr) => upsertBestiary(arr)}
          onEdit={(b) => setModal({ type: "custom", edit: b })}
          onClone={(b) => setModal({ type: "custom", from: b })}
          expanded={expandedOn} expandedReady={expReady} onToggleExpanded={setExpandedOn}
          onClose={() => setModal(null)} />
      )}
      {modal?.type === "slots" && (
        <SlotsModal hasEnemies={state.combatants.some((c) => c.type === "monster" && c.side === "enemy")}
          initialShowBk={!!modal.showBackup}
          onSave={saveSlot} onLoad={loadSlot} onDelete={deleteSlot}
          onSaveGroup={saveGroup} onAddGroup={addGroup} onDeleteGroup={deleteGroup}
          onExportAll={exportAll} onImportAll={importAll}
          onClose={() => setModal(null)} />
      )}
      {modal?.type === "backup-notice" && (
        <div className="overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>💾 Saved! One thing worth knowing…</h3>
            <div className="trait" style={{ marginBottom: 8 }}>
              Everything you save — custom monsters, encounters, groups — lives <b>only in this browser, on this device</b>.
              There's no account or cloud behind it. If the browser's website data gets cleared, or the home-screen app is
              deleted, your collection goes with it.
            </div>
            <div className="trait" style={{ marginBottom: 8 }}>
              The fix takes ten seconds: every so often (especially after a big prep session), save a backup file —
              <b> ⋯ menu → Saves &amp; groups → Backup everything</b>. Stash the file in iCloud Drive, Files, or email it to
              yourself. Restoring merges into what's here and never deletes anything.
            </div>
            <div className="trait" style={{ marginBottom: 8, color: "var(--faint)" }}>
              This is a one-time note — you won't see it again.
            </div>
            <div className="frow" style={{ justifyContent: "flex-end", marginTop: 8 }}>
              <button className="btn" onClick={() => setModal(null)}>Got it</button>
              <button className="btn primary" onClick={() => setModal({ type: "slots", showBackup: true })}>Back up now</button>
            </div>
          </div>
        </div>
      )}
      {modal?.type === "confirm-end" && (
        <ConfirmModal
          text={`Enemies and effects are removed; players and allies keep their current HP (and unconsciousness) into the next fight. Initiative resets. Conditions and concentration clear.${(() => { const n = state.combatants.filter((c) => c.side === "enemy").reduce((a, c) => a + (c.loot || []).length, 0); return n ? ` ⚠ ${n} unlooted item${n === 1 ? "" : "s"} will vanish with the enemies — loot first if you want them!` : ""; })()}`}
          confirmLabel="End combat" onYes={doEndCombat} onClose={() => setModal(null)} />
      )}
      {modal?.type === "init-ties" && (
        <InitTieModal groups={modal.groups} onConfirm={resolveTies} />
      )}
      {modal?.type === "licenses" && <LicensesModal onClose={() => setModal(null)} />}
      {modal?.type === "playtest" && (
        <div className="overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>🧪 Playtest encounters</h3>
            <div className="trait" style={{ marginBottom: 8 }}>
              Each loads a fresh test party (two level-5 heroes with HP tracked) plus a balanced enemy lineup —
              <b> replacing whatever's on screen</b>. Saved encounters are untouched.
            </div>
            {PLAYTEST_ENCOUNTERS.map((e) => (
              <button key={e.key} className="btn" style={{ width: "100%", textAlign: "left", margin: "3px 0" }} onClick={() => loadPlaytest(e)}>
                {e.name}<br /><span style={{ fontSize: 11, color: "var(--faint)" }}>{e.blurb}</span>
              </button>
            ))}
            <div className="frow" style={{ justifyContent: "flex-end", marginTop: 8 }}>
              <button className="btn" onClick={() => setModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {modal?.type === "manual-roll" && (() => {
        const mc = state.combatants.find((x) => x.uid === modal.p.uid);
        const ma = mc?.actions?.[modal.p.ai];
        const mt = modal.p.targetUid ? state.combatants.find((x) => x.uid === modal.p.targetUid) : null;
        if (!mc || !ma) return null;
        return <ManualRollModal c={mc} a={ma} t={mt}
          onConfirm={(manual) => { setModal(null); performAttack(modal.p, manual); }}
          onClose={() => setModal(null)} />;
      })()}
      {modal?.type === "anim" && (
        <div className="overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>🎲 Dice & animations</h3>
            <div className="lbl" style={{ fontSize: 11, color: "var(--gold)", margin: "4px 0" }}>Who rolls for the monsters?</div>
            {[[false, "The app rolls", "Attacks resolve instantly with animated dice"],
              [true, "I roll my own dice", "Attack buttons ask what you rolled — one tap per die — then play it out"]].map(([v, label, hint]) => (
              <button key={String(v)} className={`btn ${manualDice === v ? "primary" : ""}`} style={{ width: "100%", textAlign: "left", margin: "3px 0" }}
                onClick={() => setManualDice(v)}>
                {label}{manualDice === v ? " ✓" : ""}<br /><span style={{ fontSize: 11, color: manualDice === v ? "inherit" : "var(--faint)" }}>{hint}</span>
              </button>
            ))}
            <div className="lbl" style={{ fontSize: 11, color: "var(--gold)", margin: "10px 0 4px" }}>Damage effects</div>
            <button className={`btn ${dmgFx ? "primary" : ""}`} style={{ width: "100%", textAlign: "left", margin: "3px 0" }}
              onClick={() => setDmgFx(!dmgFx)}>
              ⚡ Damage type effects{dmgFx ? " ✓" : ""}<br />
              <span style={{ fontSize: 11, color: dmgFx ? "inherit" : "var(--faint)" }}>Lightning, fire, slashes and more flare over the hit row just before the HP drops. (Also off when reveal speed is Off.)</span>
            </button>
            <button className={`btn ${dmgFxAll ? "primary" : ""}`} style={{ width: "100%", textAlign: "left", margin: "3px 0", opacity: dmgFx ? 1 : 0.5 }}
              disabled={!dmgFx} onClick={() => setDmgFxAll(!dmgFxAll)}>
              🌈 Mixed damage plays every type{dmgFxAll ? " ✓" : ""}<br />
              <span style={{ fontSize: 11, color: dmgFxAll ? "inherit" : "var(--faint)" }}>A slashing + acid bite plays both effects back-to-back. Off: only the biggest chunk's effect plays.</span>
            </button>
            <button className={`btn ${dmgSfx ? "primary" : ""}`} style={{ width: "100%", textAlign: "left", margin: "3px 0" }}
              onClick={() => setDmgSfx(!dmgSfx)}>
              🦷 Attack effects on screen{dmgSfx ? " ✓" : ""}<br />
              <span style={{ fontSize: 11, color: dmgSfx ? "inherit" : "var(--faint)" }}>Every landed hit flashes the screen edge — signature attacks (bite, claw, gore…) get their own flair, everything else a soft pulse. Nothing on a miss.</span>
            </button>
            <button className={`btn ${spellSfx ? "primary" : ""}`} style={{ width: "100%", textAlign: "left", margin: "3px 0" }}
              onClick={() => setSpellSfx(!spellSfx)}>
              🐉 Spell &amp; breath effects{spellSfx ? " ✓" : ""}<br />
              <span style={{ fontSize: 11, color: spellSfx ? "inherit" : "var(--faint)" }}>Breath weapons and AoE spells flash a full-screen shape — a cone, a bolt, or a burst — colored by damage type when they go off.</span>
            </button>
            <div className="lbl" style={{ fontSize: 11, color: "var(--gold)", margin: "10px 0 4px" }}>Preview</div>
            <div className="trait" style={{ marginBottom: 4 }}>Tap to see an effect. Damage types &amp; heal play over the sample row; attack styles flash the screen.</div>
            <div className={`demorow ${previewRowFx && SHAKE_FX.has(previewRowFx.dtype) ? "fxshake" : ""}`}>
              {previewRowFx && <DmgFx key={previewRowFx.id} type={previewRowFx.dtype} />}
              <span className="sidebar-dot side-enemy" style={{ position: "relative", zIndex: 4 }} />
              <b style={{ position: "relative", zIndex: 4 }}>Sample</b>
              <span className="ad" style={{ position: "relative", zIndex: 4 }}>28/40 · AC 15</span>
            </div>
            <div className="pickgrid">
              {DTYPES.map((t) => (
                <span key={t} className="dchip" style={{ "--dc": DTYPE_COLORS[t] }} onClick={() => previewRow(t)}>{t}</span>
              ))}
              <span className="dchip" style={{ "--dc": "#8fd6a0" }} onClick={() => previewRow("heal")}>heal ✦</span>
            </div>
            <div className="pickgrid">
              {[["bite", "🦷 Bite"], ["claw", "🐾 Claw"], ["slam", "💥 Slam"], ["gore", "🐗 Gore"], ["sting", "🦂 Sting"], ["ranged", "🏹 Ranged"], ["hit", "⚔ Any hit"]].map(([k, lbl]) => (
                <span key={k} className="lvlchip" onClick={() => fireScreenFx(k, 0, true)}>{lbl}</span>
              ))}
            </div>
            <div className="pickgrid">
              {[["cone", "🔥 Cone", "fire"], ["bolt", "⚡ Bolt", "lightning"], ["burst", "💥 Burst", "fire"], ["cone", "❄ Cone", "cold"], ["burst", "☣ Burst", "acid"],
                ["missiles", "🌟 Missiles", "force"], ["storm", "🌧 Storm", "cold"], ["beam", "☀ Beam", "radiant"], ["column", "🔆 Column", "fire"], ["wave", "〰 Wave", "thunder"]].map(([k, lbl, ty], i) => (
                <span key={i} className="lvlchip" onClick={() => fireScreenFx(k, 0, true, DTYPE_COLORS[ty])}>{lbl}</span>
              ))}
            </div>
            <div className="lbl" style={{ fontSize: 11, color: "var(--gold)", margin: "10px 0 4px" }}>Screen recording</div>
            <button className={`btn ${showTouches ? "primary" : ""}`} style={{ width: "100%", textAlign: "left", margin: "3px 0" }}
              onClick={() => setShowTouches(!showTouches)}>
              👆 Show my taps{showTouches ? " ✓" : ""}<br />
              <span style={{ fontSize: 11, color: showTouches ? "inherit" : "var(--faint)" }}>A glowing ring follows your finger — for demo videos. Doesn't change how anything works.</span>
            </button>
            <div className="lbl" style={{ fontSize: 11, color: "var(--gold)", margin: "10px 0 4px" }}>Reveal speed</div>
            <div className="trait" style={{ marginBottom: 8 }}>
              How roll results reveal: the die tumbles, then the modifier, total, hit/miss, and damage drop in one at a time.
            </div>
            {[["fast", "Fast", "0.5s between elements"],
              ["medium", "Medium", "1.5s between elements"],
              ["slow", "Slow", "2.3s between elements"],
              ["off", "Off", "No dice tumble — everything appears instantly"]].map(([k, label, hint]) => (
              <button key={k} className={`btn ${animSpeed === k ? "primary" : ""}`} style={{ width: "100%", textAlign: "left", margin: "3px 0" }}
                onClick={() => setAnimSpeed(k)}>
                {label}{animSpeed === k ? " ✓" : ""}<br /><span style={{ fontSize: 11, color: animSpeed === k ? "inherit" : "var(--faint)" }}>{hint}</span>
              </button>
            ))}
            <div className="frow" style={{ justifyContent: "flex-end", marginTop: 8 }}>
              <button className="btn" onClick={() => setModal(null)}>Done</button>
            </div>
          </div>
        </div>
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
            setModal({ type: "init-ties-check" });
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
        <LootGiveModal c={modalC} customItems={myItems} onSaveCustomItem={saveCustomItem} onDeleteCustomItem={deleteCustomItem} onClose={() => setModal(null)}
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
      {modal?.type === "item-compendium" && (
        <LootGiveModal compendium customItems={myItems} onSaveCustomItem={saveCustomItem} onDeleteCustomItem={deleteCustomItem} onClose={() => setModal(null)} />
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
      {modal?.type === "party-edit" && (
        <PartyEditModal parties={parties} activeId={activeRoster?.id ?? null} onSaveAll={savePartiesAll} onClose={() => setModal(null)} />
      )}
      {modal?.type === "player" && (
        <div className="overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add player / ally</h3>
            <div className="frow"><label>Character</label><input type="text" autoComplete="off" autoCorrect="off" spellCheck={false} value={pName} onChange={(e) => setPName(e.target.value)} autoFocus /></div>
            <div className="frow"><label>Initiative (opt.)</label><input type="number" value={pInit} onChange={(e) => setPInit(e.target.value)} placeholder="later is fine" /></div>
            <div className="frow"><label>AC (optional)</label><input type="number" value={pAc} onChange={(e) => setPAc(e.target.value)} /></div>
            <div className="frow"><label>HP (optional)</label><input type="number" value={pHp} onChange={(e) => setPHp(e.target.value)} /></div>
            <div className="frow"><label>Passive Perception</label><input type="number" value={pPp} onChange={(e) => setPPp(e.target.value)} placeholder="opt." /></div>
            <div className="frow"><label>DEX modifier</label><input type="number" value={pDex} onChange={(e) => setPDex(e.target.value)} placeholder="opt. — breaks init ties" /></div>
            <div className="trait" style={{ marginBottom: 8 }}>With HP filled in, the app tracks this character's damage and healing (concentration prompts them to roll their own save). PP shows on their row for quick reference. DEX is only used to break initiative ties — it's never shown.</div>
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
      {modal?.type === "adv-set" && modalC && (
        <AdvSetModal c={modalC} onSetOwn={(v) => api.setAdvMode(modal.uid, v)} onSetVs={(v) => api.setAdvVs(modal.uid, v)} onClose={() => setModal(null)} />
      )}
      {modal?.type === "dex-prompt" && modalC && (
        <PromptModal title={`DEX tiebreaker — ${modalC.name}`} fields={[{ key: "v", label: "DEX modifier (blank to clear)", type: "number", value: modalC.mods?.dex }]} submitLabel="Set"
          onSubmit={({ v }) => { mutate((d, L) => { const cc = d.combatants.find((x) => x.uid === modal.uid); if (!cc) return; const n = parseInt(v, 10); cc.mods = { ...(cc.mods || {}) }; if (isNaN(n)) { delete cc.mods.dex; L.push(`<b>${cc.name}</b> DEX tiebreaker cleared`); } else { cc.mods.dex = n; L.push(`<b>${cc.name}</b> DEX tiebreaker set to ${fmtMod(n)}`); } }); setModal(null); }}
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
              {pc.type === "player" ? <PlayerCard c={pc} api={api} results={results} inCombat={state.mode === "combat"} /> : <MonsterCard c={pc} api={api} results={results} peek={pc.uid !== state.activeUid || state.mode !== "combat"} turnKey={`${state.round}:${state.activeUid}`} />}
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
        <EncounterSuggestModal party={party} playerCount={state.combatants.filter((c) => c.type === "player" && !c.dead).length}
          onClose={() => setModal(null)} onAdd={({ picks, biome, level, size, difficulty, balanced, addLair }) => {
          setModal(null);
          setParty((p) => ({ ...p, level, size, difficulty, set: true }));
          mutate((d, L, T) => {
            const added = [];
            picks.forEach((p) => {
              const sb = fullBestiary().find((b) => b.name === p.name); if (!sb) return;
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
            const c = stateRef.current.combatants.find((x) => x.uid === modal.uid);
            const alsoSuff = !!c && c.conditions.some((cd) => cd.name === "Suffocating");
            mutate((d, L, T) => {
              const cc = d.combatants.find((x) => x.uid === modal.uid); if (!cc) return;
              const snap = { hp: cc.hp, thp: cc.thp, dead: cc.dead, unconscious: cc.unconscious, stable: cc.stable, id: Math.random() };
              applyDamage(cc, Math.max(0, amt), "fire", L, T);
              holdGhost(cc, snap, 600, "fire");
            });
            if (!alsoSuff) setModal(null); // damage entered → dismiss (unless the Suffocating reminder still needs showing)
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
      {modal?.type === "reactions-config" && modalC && (
        <ReactionsConfigModal c={modalC} onClose={() => setModal(null)}
          onSave={(rx) => { api.setReactions(modal.uid, rx); setModal(null); }} />
      )}
      {modal?.type === "reaction" && modal.data && (
        <ReactionPromptModal data={modal.data} onChoose={(id) => api.resolveReaction(id)} />
      )}
      {modal?.type === "player-attack" && modalC && (
        <PlayerAttackModal c={modalC} state={state} api={api} spellAtk={modal.spellAtk} presetDtype={modal.dtype} spellName={modal.spellName} onClose={() => setModal(null)}
          onSave={() => setModal({ type: "group-save" })} />
      )}
      {modal?.type === "hide-check" && modalC && (
        <HideCheckModal c={modalC} api={api} onClose={() => setModal(null)} />
      )}
      {modal?.type === "player-cast" && modalC && (
        <PlayerCastModal c={modalC} api={api} fromItem={modal.fromItem}
          onBack={modal.fromItem ? () => setModal({ type: "use-item", uid: modal.uid }) : null}
          onClose={() => setModal(null)} />
      )}
      {modal?.type === "spellbook" && modalC && (
        <SpellbookModal c={modalC} api={api} onClose={() => setModal(null)} />
      )}
      {modal?.type === "character" && modalC && (
        <CharacterSheetModal c={modalC} api={api} onSpellbook={() => setModal({ type: "spellbook", uid: modal.uid })} onClose={() => setModal(null)} />
      )}
      {modal?.type === "use-item" && modalC && (
        <UseItemModal c={modalC} state={state} api={api} customItems={myItems}
          onScroll={() => setModal({ type: "player-cast", uid: modal.uid, fromItem: "scroll" })}
          onAoe={(preset) => setModal({ type: "group-save", preset })}
          onClose={() => setModal(null)} />
      )}
      {modal?.type === "deathsaves" && modalC && (
        <DeathSavesModal c={modalC} onClose={() => setModal(null)}
          onRecord={(kind) => {
            mutate((d, L, T) => { const c = d.combatants.find((x) => x.uid === modal.uid); if (c) applyDeathSave(c, kind, L, T); });
            if (kind !== "reset") setModal(null); // one save per turn — recording it is the whole interaction
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
