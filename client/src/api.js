export const tk=()=>localStorage.getItem('hh_token');
export async function api(p,o={}){
 const r=await fetch('/api'+p,{method:o.method||'GET',headers:{'Content-Type':'application/json',...(tk()?{Authorization:'Bearer '+tk()}:{})},body:o.body?JSON.stringify(o.body):undefined});
 const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||'Something went wrong');return d}
