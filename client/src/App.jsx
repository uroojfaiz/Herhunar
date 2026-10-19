import {useState,useEffect} from 'react';import {Routes,Route,Link,NavLink,Navigate,useLocation} from 'react-router-dom';
import {api,tk} from './api.js';import {D,LANGS} from './i18n.js';import {Ctx} from './ctx.js';
import {Home,Auth,Profile,MyWork,Detail,Orders,UserPage,Inbox,Thread} from './pages.jsx';import Chat from './Chat.jsx';import Notify from './Notify.jsx';import {Icon} from './icons.jsx';
const RTL=['ur','pa','sd','ps','bal'],PALS=[['rose','p_rose','#B83A6E'],['teal','p_teal','#0F766E'],['lav','p_lav','#6D4AA8'],['hc','p_hc','#0B3D91'],['dk','p_dk','#2A1A22']];
let P0={};try{P0=JSON.parse(localStorage.getItem('hh_pref'))||{}}catch{}
function Settings({t,user,logout,lang,setLang,pal,setPal,sz,setSz,easy,setEasy,close}){
 return <div className="modal sheetwrap" onClick={close}><div className="sheet" role="dialog" aria-label={t('settings')} onClick={e=>e.stopPropagation()}>
  <div className="row ctr nhead"><b>{t('settings')}</b><button className="chip" onClick={close} aria-label="Close">✕</button></div>
  <h4>{t('language')}</h4><div className="chips">{Object.entries(LANGS).map(([k,v])=><button key={k} className={'chip'+(lang===k?' on':'')} onClick={()=>setLang(k)}>{v}</button>)}</div>
  <h4>{t('theme')}</h4><div className="chips">{PALS.map(([k,l,c])=><button key={k} className={'chip'+(pal===k?' on':'')} onClick={()=>setPal(k)}><span className="dot" style={{background:c}}/> {t(l)}</button>)}</div>
  <h4>{t('textsize')}</h4><div className="chips"><button className="chip" onClick={()=>setSz(Math.max(0,sz-1))} aria-label="Smaller text">A−</button><button className="chip" onClick={()=>setSz(Math.min(3,sz+1))} aria-label="Larger text">A+</button><button className={'chip'+(easy?' on':'')} onClick={()=>setEasy(!easy)}>{t('easy')}</button></div>
  {user&&<button className="btn ghost full" onClick={()=>{close();logout()}}>{t('logout')}</button>}</div></div>}
export default function App(){
 const [user,setUser]=useState(null),[ready,setReady]=useState(false),[lang,setLang]=useState(P0.lang||'en'),[pal,setPal]=useState(P0.pal||'rose'),[sz,setSz]=useState(P0.sz||0),[easy,setEasy]=useState(!!P0.easy),[sets,setSets]=useState(false),[unread,setUnread]=useState(0);
 useEffect(()=>{if(tk())api('/me').then(setUser).catch(()=>localStorage.removeItem('hh_token')).finally(()=>setReady(true));else setReady(true)},[]);
 useEffect(()=>{const d=document.documentElement;d.lang=lang;d.dir=RTL.includes(lang)?'rtl':'ltr';d.dataset.pal=pal==='rose'?'':pal;
  document.body.style.fontSize=(easy?19:15)+sz*2+'px';document.body.classList.toggle('easy',easy);
  localStorage.setItem('hh_pref',JSON.stringify({lang,pal,sz,easy}))},[lang,pal,sz,easy]);
 const loc=useLocation();
 const t=k=>(lang==='en'?D.en[k]:(D[lang]&&D[lang][k])??D.ur[k]??D.en[k])??k;
 const logout=()=>{localStorage.removeItem('hh_token');setUser(null);setUnread(0)};
 if(!ready)return null;
 const hun=user&&user.role==='hunarmand';
 const items=user?[['/','home',t('home'),0],hun&&['/work','work',t('myWork'),0],['/orders','orders',t('orders'),0],['/chat','msg',t('msgs'),unread],['/u/'+user.id,'user',t('me'),0]].filter(Boolean):[];
 const tabs=cls=><nav className={'tabs '+cls} aria-label="Main">{items.map(([to,ic,l,b])=><NavLink key={to} to={to} end={to==='/'} className={({isActive})=>'tab'+(isActive?' on':'')}><span className="ti"><Icon n={ic}/>{b>0&&<span className="badge">{b>9?'9+':b}</span>}</span><span className="tl">{l}</span></NavLink>)}</nav>;
 return <Ctx.Provider value={{user,setUser,t,lang,logout,setUnread}}>
  <header className={loc.pathname==='/'?'home':''}><Link to="/" className="logo">Her<b>Hunar</b></Link><Link to={user?'/me':'/login'} className="area"><Icon n="pin"/><span><small>{t('h_area')}</small><b>{(user&&user.area)||t('h_setarea')}</b></span><Icon n="chev"/></Link>{tabs('top')}
   <div className="hright">{user?<Notify/>:<Link className="btn sm" to="/login">{t('login')}</Link>}<button className="chip gear" onClick={()=>setSets(true)} aria-label={t('settings')}><Icon n="gear"/></button></div></header>
  <main><Routes>
   <Route path="/" element={<Home/>}/><Route path="/login" element={<Auth/>}/>
   <Route path="/s/:id" element={user?<Detail/>:<Navigate to="/login"/>}/>
   <Route path="/me" element={user?<Profile/>:<Navigate to="/login"/>}/>
   <Route path="/work" element={hun?<MyWork/>:<Navigate to="/"/>}/>
   <Route path="/orders" element={user?<Orders/>:<Navigate to="/login"/>}/><Route path="/u/:id" element={user?<UserPage/>:<Navigate to="/login"/>}/><Route path="/chat" element={user?<Inbox/>:<Navigate to="/login"/>}/><Route path="/chat/:id" element={user?<Thread/>:<Navigate to="/login"/>}/>
   <Route path="*" element={<Navigate to="/"/>}/></Routes><p className="foot">HerHunar · AI by Claude (Anthropic) · {t('safe')}</p></main>
  {tabs('bottom')}<Chat/>
  {sets&&<Settings {...{t,user,logout,lang,setLang,pal,setPal,sz,setSz,easy,setEasy}} close={()=>setSets(false)}/>}</Ctx.Provider>}
