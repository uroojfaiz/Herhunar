import {useState,useEffect} from 'react';
// Tiny "sweet alert" helper: swal.confirm(text) -> Promise<boolean>, swal.toast(text,type)
let push=null;
export const swal={
 confirm:(text,o={})=>new Promise(res=>push?push({kind:'confirm',text,icon:o.icon||'?',yes:o.yes,no:o.no,res}):res(window.confirm(text))),
 info:(text,o={})=>new Promise(res=>push?push({kind:'info',text,icon:o.icon||'✓',yes:o.yes,res}):res(true)),
 toast:(text,icon='✓')=>push&&push({kind:'toast',text,icon,id:Math.random()})
};
export function SwalHost({t}){
 const [dlg,setDlg]=useState(null),[toasts,setToasts]=useState([]);
 useEffect(()=>{push=x=>{if(x.kind==='toast'){setToasts(a=>[...a,x]);setTimeout(()=>setToasts(a=>a.filter(y=>y.id!==x.id)),2600)}else setDlg(x)};return()=>{push=null}},[]);
 const close=v=>{if(dlg)dlg.res(v);setDlg(null)};
 useEffect(()=>{if(!dlg)return;const k=e=>{if(e.key==='Escape')close(false)};window.addEventListener('keydown',k);return()=>window.removeEventListener('keydown',k)},[dlg]);
 return <>
  {dlg&&<div className="swal-back" onClick={()=>close(false)}><div className="swal" role="alertdialog" aria-modal="true" onClick={e=>e.stopPropagation()}>
   <div className={'swal-ic '+(dlg.kind==='confirm'?'warn':'ok')}><span>{dlg.icon}</span></div>
   <h3>{dlg.text}</h3>
   <div className="swal-acts">{dlg.kind==='confirm'&&<button className="btn ghost" onClick={()=>close(false)}>{dlg.no||t('cancel')}</button>}
    <button className="btn" autoFocus onClick={()=>close(true)}>{dlg.yes||t('ok')}</button></div></div></div>}
  <div className="swal-toasts" aria-live="polite">{toasts.map(x=><div key={x.id} className="swal-toast"><span className="swal-tic">{x.icon}</span>{x.text}</div>)}</div></>}
