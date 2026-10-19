import {useState,useEffect,useRef,useContext} from 'react';import {useNavigate,useLocation} from 'react-router-dom';import {api} from './api.js';import {Ctx} from './ctx.js';import {Icon} from './icons.jsx';
// Live notifications: polls /api/notifs every 4 s (Vercel serverless has no websockets).
// New chat message or event -> toast + short beep + bell badge + tab title count + system notification when the tab is hidden.
const beep=()=>{try{const c=new(window.AudioContext||window.webkitAudioContext)(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.frequency.value=880;g.gain.setValueAtTime(.08,c.currentTime);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.25);o.start();o.stop(c.currentTime+.25);setTimeout(()=>c.close(),500)}catch{}};
const canSys=()=>typeof Notification!=='undefined';
export default function Notify(){
 const {t,user,lang,setUnread}=useContext(Ctx),nav=useNavigate(),loc=useLocation(),[d,setD]=useState({msgUnread:0,msgs:[],unread:0,items:[]}),[toasts,setToasts]=useState([]),[open,setOpen]=useState(false),[perm,setPerm]=useState(canSys()?Notification.permission:'denied'),
  seen=useRef(null),path=useRef(''),tr=useRef(t);path.current=loc.pathname;tr.current=t;
 const text=n=>tr.current('n_'+n.type).replace('{name}',n.meta.name||'').replace('{title}',n.meta.title||'').replace('{price}',n.meta.price??'').replace('{rating}',n.meta.rating??'');
 const uid=user&&user.id;
 useEffect(()=>{if(!uid)return;let dead=false;seen.current=null;
  const tick=async()=>{try{const x=await api('/notifs');if(dead)return;setD(x);setUnread(x.msgUnread);
   const keys=new Set([...x.msgs.map(m=>'m'+m.id),...x.items.map(i=>'n'+i._id)]);
   if(seen.current){const fresh=[
    ...x.msgs.filter(m=>!seen.current.has('m'+m.id)&&path.current!=='/chat/'+m.from).map(m=>({k:'m'+m.id,title:m.name||'HerHunar',body:m.text,link:'/chat/'+m.from})),
    ...x.items.filter(i=>!i.read&&!seen.current.has('n'+i._id)).map(i=>({k:'n'+i._id,title:'HerHunar',body:text(i),link:i.link||'/'}))];
    if(fresh.length){beep();setToasts(a=>[...a,...fresh].slice(-3));fresh.forEach(f=>setTimeout(()=>setToasts(a=>a.filter(y=>y.k!==f.k)),7000));
     if(document.hidden&&canSys()&&Notification.permission==='granted')fresh.forEach(f=>{try{const n=new Notification(f.title,{body:f.body,tag:f.k});n.onclick=()=>{window.focus();nav(f.link);n.close()}}catch{}})}}
   seen.current=keys}catch{}};
  tick();const i=setInterval(tick,4000);return()=>{dead=true;clearInterval(i)}},[uid]);
 const total=d.msgUnread+d.unread;
 useEffect(()=>{document.title=(total?`(${total}) `:'')+'HerHunar'},[total]);
 if(!user)return null;
 const go=async(link,mark)=>{setOpen(false);setToasts([]);if(mark&&d.unread){api('/notifs/read',{method:'POST'}).then(()=>setD(x=>({...x,unread:0,items:x.items.map(i=>({...i,read:true}))}))).catch(()=>{})}nav(link)};
 const markAll=async()=>{try{await api('/notifs/read',{method:'POST'});setD(x=>({...x,unread:0,items:x.items.map(i=>({...i,read:true}))}))}catch{}};
 const ask=async()=>{if(canSys())setPerm(await Notification.requestPermission())};
 return <>
  <button className="chip bell" onClick={()=>setOpen(!open)} aria-label={t('notifs')} aria-expanded={open}><Icon n="bell"/>{total>0&&<span className="badge">{total>9?'9+':total}</span>}</button>
  {open&&<div className="npanel" role="dialog" aria-label={t('notifs')}>
   <div className="row ctr nhead"><b>{t('notifs')}</b>{d.unread>0&&<button className="chip" onClick={markAll}>{t('markRead')}</button>}</div>
   {d.msgs.map(m=><button key={m.id} className="nitem unread" onClick={()=>go('/chat/'+m.from)}><b>✉ {m.name}</b>{m.count>1&&<span className="tag">{m.count}</span>}<br/><span className="mut">{m.text}</span></button>)}
   {d.items.map(i=><button key={i._id} className={'nitem'+(i.read?'':' unread')} onClick={()=>go(i.link||'/',true)}>{text(i)}<br/><small className="mut">{new Date(i.at).toLocaleString(({en:'en-PK',ur:'ur-PK',sd:'sd-PK'})[lang]||'en-PK',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</small></button>)}
   {!d.msgs.length&&!d.items.length&&<p className="mut">{t('noNotifs')}</p>}
   {canSys()&&perm==='default'&&<button className="btn ghost" onClick={ask}>🔔 {t('enableAlerts')}</button>}
   {perm==='denied'&&canSys()&&<p className="mut"><small>{t('alertsBlocked')}</small></p>}</div>}
  <div className="toasts" aria-live="polite">{toasts.map(x=><button key={x.k} className="toast" onClick={()=>go(x.link)}><b>{x.title}</b><br/>{x.body}</button>)}</div></>}
