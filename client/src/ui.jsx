import {useState,useEffect,useRef,useCallback,useContext} from 'react';
import {Icon} from './icons.jsx';
import {Ctx} from './ctx.js';
// Opening intro: shown once per browser session.
export function Splash(){
 const {t}=useContext(Ctx);
 const [show,setShow]=useState(()=>{try{return !sessionStorage.getItem('hh_intro')}catch{return true}}),[out,setOut]=useState(false);
 useEffect(()=>{if(!show)return;try{sessionStorage.setItem('hh_intro','1')}catch{}
  const a=setTimeout(()=>setOut(true),2100),b=setTimeout(()=>setShow(false),2700);return()=>{clearTimeout(a);clearTimeout(b)}},[]);
 if(!show)return null;
 return <div className={'splash'+(out?' out':'')} onClick={()=>{setOut(true);setTimeout(()=>setShow(false),500)}}>
  <div className="sp-bg"><i/><i/><i/><i/><i/></div>
  <div className="sp-in"><div className="sp-logo"><Icon n="spark"/></div><h1>Her<b>Hunar</b></h1><p>{t('tag')}</p><div className="sp-bar"><span/></div></div></div>}

// Horizontal scroller with theme-coloured side buttons (only visible when content overflows).
export function ScrollRow({className='',children,step=.8}){
 const {t}=useContext(Ctx);
 const r=useRef(null),[st,setSt]=useState({l:false,r:false});
 const upd=useCallback(()=>{const e=r.current;if(!e)return;const max=e.scrollWidth-e.clientWidth,x=Math.abs(e.scrollLeft);setSt({l:x>4,r:max>4&&x<max-4})},[]);
 useEffect(()=>{upd();const e=r.current;if(!e)return;const ro=typeof ResizeObserver!=='undefined'?new ResizeObserver(upd):null;ro&&ro.observe(e);window.addEventListener('resize',upd);return()=>{ro&&ro.disconnect();window.removeEventListener('resize',upd)}});
 const go=d=>{const e=r.current,rtl=document.dir==='rtl';e.scrollBy({left:d*(rtl?-1:1)*e.clientWidth*step,behavior:'smooth'})};
 return <div className={'srow'+(st.l?' can-l':'')+(st.r?' can-r':'')}>
  <button type="button" className="sarrow sl" onClick={()=>go(-1)} aria-label={t('previous')} tabIndex={st.l?0:-1}><Icon n="back"/></button>
  <div ref={r} className={className} onScroll={upd}>{children}</div>
  <button type="button" className="sarrow sr" onClick={()=>go(1)} aria-label={t('next')} tabIndex={st.r?0:-1}><Icon n="back"/></button></div>}
