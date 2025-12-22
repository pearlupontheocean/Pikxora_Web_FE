import{c as a,a as x,as as y,j as s,L as e,u as t}from"./index-CSY5YgiJ.js";import{B as r}from"./card-dyY2Qvrr.js";import{z as i}from"./proxy-BCkhZuQv.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const n=a("LayoutGrid",[["rect",{width:"7",height:"7",x:"3",y:"3",rx:"1",key:"1g98yp"}],["rect",{width:"7",height:"7",x:"14",y:"3",rx:"1",key:"6d4xhi"}],["rect",{width:"7",height:"7",x:"14",y:"14",rx:"1",key:"nxv5o0"}],["rect",{width:"7",height:"7",x:"3",y:"14",rx:"1",key:"1bb6yr"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const d=a("LogIn",[["path",{d:"M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4",key:"u53s6r"}],["polyline",{points:"10 17 15 12 10 7",key:"1ail0h"}],["line",{x1:"15",x2:"3",y1:"12",y2:"12",key:"v6grx8"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=a("LogOut",[["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}],["polyline",{points:"16 17 21 12 16 7",key:"1gabdz"}],["line",{x1:"21",x2:"9",y1:"12",y2:"12",key:"1uyos4"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const u=a("UserPlus",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["line",{x1:"19",x2:"19",y1:"8",y2:"14",key:"1bvyxn"}],["line",{x1:"22",x2:"16",y1:"11",y2:"11",key:"1shjgl"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=a("User",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]),w=({user:o,profile:j})=>{const c=x(),l=y(),h=async()=>{try{await l.mutateAsync(),t.success("Signed out successfully"),c("/auth")}catch{t.error("Error signing out")}};return s.jsx(i.nav,{initial:{y:-100},animate:{y:0},className:"fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",children:s.jsxs("div",{className:"container mx-auto px-4 py-4 flex items-center justify-between",children:[s.jsx(e,{to:"/",className:"flex items-center gap-2",children:s.jsx(i.h1,{className:"text-2xl font-bold red-glow-intense",whileHover:{scale:1.05},children:"PIKXORA"})}),s.jsx("div",{className:"flex items-center gap-4",children:o?s.jsxs(s.Fragment,{children:[s.jsx(e,{to:"/browse",children:s.jsxs(r,{variant:"ghost",size:"sm",children:[s.jsx(n,{className:"h-4 w-4 mr-2"}),"Browse"]})}),s.jsx(e,{to:"/dashboard",children:s.jsxs(r,{variant:"ghost",size:"sm",children:[s.jsx(g,{className:"h-4 w-4 mr-2"}),"Dashboard"]})}),s.jsxs(r,{variant:"outline",size:"sm",onClick:h,children:[s.jsx(m,{className:"h-4 w-4 mr-2"}),"Sign Out"]})]}):s.jsxs(s.Fragment,{children:[s.jsx(e,{to:"/browse",children:s.jsxs(r,{variant:"ghost",size:"sm",children:[s.jsx(n,{className:"h-4 w-4 mr-2"}),"Browse"]})}),s.jsx(e,{to:"/auth",children:s.jsxs(r,{variant:"outline",size:"sm",className:"hover:bg-primary/10",children:[s.jsx(d,{className:"h-4 w-4 mr-2"}),"Sign In"]})}),s.jsx(e,{to:"/auth",children:s.jsxs(r,{size:"sm",className:"bg-primary hover:bg-primary/90",children:[s.jsx(u,{className:"h-4 w-4 mr-2"}),"Sign Up"]})})]})})]})})};export{w as N,g as U};
