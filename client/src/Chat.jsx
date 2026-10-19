import {useState,useRef,useEffect,useContext} from 'react';import {Ctx} from './ctx.js';import {api} from './api.js';
export default function Chat(){
 const {t,lang,user}=useContext(Ctx),[open,setOpen]=useState(false),[msgs,setMsgs]=useState([]),[v,setV]=useState(''),[busy,setBusy]=useState(false),end=useRef();
 useEffect(()=>{end.current&&end.current.scrollIntoView()},[msgs,open]);
 const send=async()=>{const text=v.trim();if(!text||busy)return;const m=[...msgs,{role:'user',content:text}];setMsgs(m);setV('');setBusy(true);
  try{const d=await api('/chat',{method:'POST',body:{messages:m,lang,role:user?user.role:'customer'}});setMsgs([...m,{role:'assistant',content:d.reply}])}catch(e){setMsgs([...m,{role:'assistant',content:e.message}])}setBusy(false)};
 return <>
  <button className="btn or fab" onClick={()=>setOpen(!open)} aria-expanded={open}>💬<span className="fabtxt"> {t('help')}</span></button>
  {open&&<div className="panel" role="dialog" aria-label={t('help')}><b>{t('help')}</b>
   <div className="msgs"><div className="ans">{t('welcome')}</div>{msgs.map((m,i)=><div key={i} className={'ans '+m.role}>{m.content}</div>)}{busy&&<div className="ans">…</div>}<div ref={end}/></div>
   <div className="row"><input value={v} placeholder={t('ph')} onChange={e=>setV(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()}/><button className="btn" onClick={send} aria-label={t('send')}>➤</button></div></div>}</>}
