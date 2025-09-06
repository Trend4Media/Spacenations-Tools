const fs = require('fs');
const p = '/workspace/main/assets/index-B5B8HTkB.js';
let s = fs.readFileSync(p, 'utf8');
// 1) "Jetzt Spielen" -> Weiterleitung
s = s.replace(/x\.jsx\(Ge,\{variant:\"orange\",className:\"animate-float\",/, 'x.jsx(Ge,{variant:"orange",className:"animate-float",onClick:()=>window.location.href="https://www.spacenations.eu",');
// 2) Light Mode Button -> Toggle
s = s.replace(/x\.jsxs\(Ge,\{variant:\"outline\",className:\"animate-float\",/, 'x.jsxs(Ge,{variant:"outline",className:"animate-float",onClick:()=>window.toggleLightMode&&window.toggleLightMode(),');
// 3) RE auf die drei Public-Tools reduzieren
s = s.replace(/const RE=\[.*?\],jE=/s,
  'const RE=[{icon:lw,label:"AS-Counter",description:"Angriff & Sabotage Counter"},{icon:gm,label:"Sabo-Counter",description:"Sabotage Aktivitäten"},{icon:fw,label:"Raid-Counter",description:"Raid Planungen"}],jE='
);
// 4) Counter-Klicks verlinken (Index-basiert)
s = s.replace(
  /x\.jsxs\(Ge,\{variant:\"glass\",className:\"w-full justify-start h-12 group-hover:bg-primary\/10 group-hover:border-primary\/50 transition-all duration-300\",/,
  'x.jsxs(Ge,{variant:"glass",className:"w-full justify-start h-12 group-hover:bg-primary/10 group-hover:border-primary/50 transition-all duration-300",onClick:()=>window.location.href=["../as-counter.html","../sabo-counter.html","../raid-counter.html"][t],'
);
// 5) Allianz-Administration Block verstecken
s = s.replace(
  /x\.jsxs\(\"div\",\{className:\"inline-block p-6 glass-card border border-accent\\/30 rounded-lg mb-6\",/,
  'x.jsxs("div",{className:"inline-block p-6 glass-card border border-accent/30 rounded-lg mb-6",style:{display:"none"},'
);
// 6) Login Button -> vorhandener Login (DB-gebunden) in main/
s = s.replace(
  /const AE=\(\)=>\{const\[e,t\]=w\.useState\(\"\"\),\[n,r\]=w\.useState\(\"\"\),o=\(\)=>\{[^}]*\};/,
  'const AE=()=>{const[e,t]=w.useState(""),[n,r]=w.useState("");const o=()=>{window.location.href="../debug-login.html"};'
);
// 7) Light-Theme Implementierung global einfügen (vor render)
s = s.replace(
  /Fh\(document\.getElementById\(\"root\"\)\)\.render\(x\.jsx\(zE,\{\}\)\);/,
  'window.__applyLightTheme||(window.__applyLightTheme=function(l){var id="light-theme-override",el=document.getElementById(id);if(l&&!el){el=document.createElement("style");el.id=id;el.textContent=":root{--background:0 0% 100%;--foreground:220 15% 10%;--card:0 0% 98%;--card-foreground:220 15% 10%;--popover:0 0% 100%;--popover-foreground:220 15% 10%;--primary:210 100% 50%;--primary-foreground:0 0% 100%;--secondary:220 15% 92%;--secondary-foreground:220 15% 10%;--muted:220 15% 92%;--muted-foreground:220 10% 35%;--accent:25 95% 53%;--accent-foreground:0 0% 100%;--destructive:0 75% 45%;--destructive-foreground:0 0% 100%;--border:220 15% 85%;--input:220 15% 85%;--ring:210 100% 50%}";document.head.appendChild(el)}if(!l&&el){el.remove()}try{localStorage.setItem("theme",l?"light":"dark")}catch(e){}});window.toggleLightMode||(window.toggleLightMode=function(){var isLight;try{isLight=localStorage.getItem("theme")!=="light"}catch(e){isLight=true}window.__applyLightTheme(isLight)});(function(){try{if(localStorage.getItem("theme")==="light"){window.__applyLightTheme(true)}}catch(e){}});$&'
);
fs.writeFileSync(p, s);
console.log('OK');
