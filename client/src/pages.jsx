import {useState,useEffect,useContext,useRef} from 'react';import {Link,useNavigate,useParams,useLocation} from 'react-router-dom';
import {MapContainer,TileLayer,CircleMarker,Marker,useMap,useMapEvents} from 'react-leaflet';import L from 'leaflet';import {Icon,CatIcon} from './icons.jsx';
import {api} from './api.js';import {Ctx} from './ctx.js';
const CATS=['tailor','food','beauty','tutor','online'],IC={tailor:'🧵',food:'🍲',beauty:'💄',tutor:'📚',online:'💻'};
const wa=n=>{n=String(n||'').replace(/\D/g,'');return n.startsWith('0')?'92'+n.slice(1):n};
const km=(a,b)=>{const r=x=>x*Math.PI/180,h=Math.sin(r(b[0]-a[0])/2)**2+Math.cos(r(a[0]))*Math.cos(r(b[0]))*Math.sin(r(b[1]-a[1])/2)**2;return 12742*Math.asin(Math.sqrt(h))};
const readImg=(f,mx=800,ql=.7)=>new Promise((res,rej)=>{if(!f)return rej(new Error('No file'));const r=new FileReader();r.onload=()=>{const i=new Image();i.onload=()=>{const k=Math.min(1,mx/Math.max(i.width,i.height)),c=document.createElement('canvas');c.width=i.width*k;c.height=i.height*k;c.getContext('2d').drawImage(i,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',ql))};i.onerror=()=>rej(new Error('Not an image'));i.src=r.result};r.readAsDataURL(f)});
const Av=({u,big})=>u&&u.avatar?<img className={'av'+(big?' big':'')} src={u.avatar} alt=""/>:<div className={'av'+(big?' big':'')}>{((u&&u.name)||'?')[0]}</div>;

function AIMatch(){
 const {t,lang,user}=useContext(Ctx),[need,setNeed]=useState(''),[res,setRes]=useState(null),[busy,setBusy]=useState(false),[e,setE]=useState(''),[live,setLive]=useState(false),[open,setOpen]=useState(false);
 const voice=()=>{const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR)return setE(t('novoice'));const r=new SR();r.lang=lang==='en'?'en-US':'ur-PK';setLive(true);r.onresult=x=>setNeed(x.results[0][0].transcript);r.onerror=r.onend=()=>setLive(false);r.start()};
 const go=async()=>{if(!user)return setE(t('loginfirst'));setBusy(true);setE('');try{setRes(await api('/ai/match',{method:'POST',body:{need,lang}}))}catch(x){setE(x.message)}setBusy(false)};
 const wide=()=>window.matchMedia('(min-width:900px)').matches,ready=open||wide();
 return <><section className={'aic'+(open?' open':'')}><div className="aihead"><div><span className="aibadge"><Icon n="spark"/> {t('h_ai')}</span><h2>{t('h_aiq')}</h2></div><span className="aiorb" aria-hidden="true"><Icon n="spark"/></span></div>
  <div className="abody"><textarea rows={3} value={need} onChange={x=>setNeed(x.target.value)} placeholder={t('aiPh')} aria-label={t('aiTitle')}/>
   <div className="chips">{['ex1','ex2','ex3'].map(k=><button key={k} type="button" className="chip" onClick={()=>setNeed(t(k))}>{t(k)}</button>)}</div></div>
  <div className="row aiact"><button className="btn white" disabled={busy||(ready&&!need.trim())} onClick={()=>ready?go():setOpen(true)}>{busy?'…':t('h_match')}</button>
   <button className={'btn outw abody'+(live?' live':'')} onClick={voice}><Icon n="mic"/> {live?t('listening'):t('speak')}</button></div>
  {e&&<div className="note" role="alert">{e}</div>}</section>
  {res&&<div className="aires"><span className="tag">{res.ai?'AI':'Basic'}</span>{!res.matches.length&&<p className="mut">{t('none')}</p>}
   <div className="grid">{res.matches.map(m=><Link key={m.id} to={'/s/'+m.id} className="card lnk"><b>{m.service.title}</b><p className="mut">{m.service.owner.name} · {m.service.owner.area||''}</p><p>{m.reason}</p><span className="tag">Rs {m.price}</span></Link>)}</div></div>}</>}

function MapCtl({pts,pos,fly,setC}){const m=useMap(),done=useRef(false);
 useEffect(()=>{if(pos){m.setView(pos,13);done.current=true}},[pos]);
 useEffect(()=>{if(done.current||!pts.length)return;done.current=true;pts.length===1?m.setView(pts[0],13):m.fitBounds(pts,{padding:[40,40],maxZoom:14})},[pts.length]);
 useEffect(()=>{if(fly)m.flyTo(fly,14)},[fly]);
 useMapEvents({moveend:()=>{const c=m.getCenter();setC([c.lat,c.lng])}});return null}

function MapView({rows,pos,near,q,setQ,cat,setCat,back,voice,live}){
 const {t}=useContext(Ctx),[sel,setSel]=useState(null),[fly,setFly]=useState(null),[c,setC]=useState(null);
 const loc=rows.filter(s=>s.owner.lat!=null),pts=loc.map(s=>[s.owner.lat,s.owner.lng]),ref=c||pos;
 const nearby=loc.map(s=>({...s,d:ref?km(ref,[s.owner.lat,s.owner.lng]):null})).sort((a,b)=>(a.d??0)-(b.d??0)).slice(0,20);
 const cur=nearby.find(s=>s._id===sel)||nearby[0];
 const pick=s=>{setSel(s._id);setFly([s.owner.lat,s.owner.lng])};
 const dir=s=>window.open(`https://www.google.com/maps/dir/?api=1&destination=${s.owner.lat},${s.owner.lng}`,'_blank','noopener');
 const pin=(s,on)=>L.divIcon({className:'',html:`<span class="pricepin${on?' sel':''}">${s.price>0?'Rs '+s.price:'●'}</span>`,iconSize:[0,0]});
 const sub=s=>`${s.owner.name}${s.owner.area?' · '+s.owner.area:''}${s.d!=null?' · '+s.d.toFixed(1)+' '+t('h_km'):''}`;
 return <div className="mapscreen"><div className="mapfull"><MapContainer center={[30.37,69.35]} zoom={5} className="map" zoomControl={false}><TileLayer attribution='&copy; OpenStreetMap' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"/><MapCtl pts={pts} pos={pos} fly={fly} setC={setC}/>
   {pos&&<><CircleMarker center={pos} radius={16} pathOptions={{stroke:false,fillColor:'#2563eb',fillOpacity:.2}}/><CircleMarker center={pos} radius={8} pathOptions={{color:'#fff',weight:3,fillColor:'#2563eb',fillOpacity:1}}/></>}
   {loc.map(s=><Marker key={s._id} position={[s.owner.lat,s.owner.lng]} icon={pin(s,cur&&cur._id===s._id)} eventHandlers={{click:()=>setSel(s._id)}}/>)}</MapContainer>
  <div className="mtop"><div className="msearch"><button className="iconbtn" onClick={back} aria-label="Back"><Icon n="back"/></button><input type="search" value={q} onChange={e=>setQ(e.target.value)} placeholder={t('h_searcharea')} aria-label={t('h_searcharea')}/><button className={'mic'+(live?' live':'')} onClick={voice} aria-label={t('speak')}><Icon n="mic"/></button></div>
   <div className="mchips">{['all',...CATS].map(k=><button key={k} className={'chip'+(cat===k?' on':'')} onClick={()=>setCat(k)}>{t(k)}</button>)}</div></div>
  <button className="locate" onClick={near} aria-label={t('useLoc')}><Icon n="locate"/></button></div>
  <aside className="msheet"><span className="grab"/><div className="sh"><b>{t('h_n').replace('{n}',nearby.length)}</b><button className="lnkbtn" onClick={back}><Icon n="list"/> {t('h_list')}</button></div>
   {cur&&<div className="selcard"><div className="sc-top"><span className={'pimg mini cat-'+cur.category}><CatIcon n={cur.category}/></span><div><b>{cur.title}</b><br/><span className="mut">{sub(cur)}</span><br/><b>{cur.price>0?`Rs ${cur.price}`:''}</b>{cur.owner.rating&&<span className="rate"> ★ {cur.owner.rating.avg}</span>}</div></div>
    <div className="row"><Link className="btn" to={'/s/'+cur._id}>{t('open')}</Link><button className="btn ghost" onClick={()=>dir(cur)}><Icon n="nav"/> {t('h_dir')}</button></div></div>}
   {nearby.filter(s=>!cur||s._id!==cur._id).map(s=><button key={s._id} className="mrow" onClick={()=>pick(s)}><span className={'pimg mini cat-'+s.category}><CatIcon n={s.category}/></span><span className="grow"><b>{s.title}</b><br/><span className="mut">{sub(s)}</span></span><b>{s.price>0?`Rs ${s.price}`:''}</b></button>)}
   {!nearby.length&&<p className="mut">{t('none')}</p>}</aside></div>}

function MiniMap({pts,open}){
 const {t}=useContext(Ctx);
 return <div className="minimap"><MapContainer center={[30.37,69.35]} zoom={5} zoomControl={false} dragging={false} scrollWheelZoom={false} doubleClickZoom={false} touchZoom={false} keyboard={false} className="mini"><TileLayer attribution='&copy; OpenStreetMap' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"/><MapCtl pts={pts} pos={null} fly={null} setC={()=>{}}/>
  {pts.map((p,i)=><CircleMarker key={i} center={p} radius={7} pathOptions={{color:'#fff',weight:2,fillColor:'#B83A6E',fillOpacity:1}}/>)}</MapContainer>
  <button className="seeall" onClick={open}><Icon n="map"/> {t('h_all').replace('{n}',pts.length)}</button></div>}

export function Home(){
 const {t,user,lang}=useContext(Ctx),[q,setQ]=useState(''),[cat,setCat]=useState('all'),[wo,setWo]=useState(false),[view,setView]=useState('list'),[list,setList]=useState([]),[pos,setPos]=useState(null),[err,setErr]=useState(''),[busy,setBusy]=useState(true),[live,setLive]=useState(false);
 useEffect(()=>{setBusy(true);const id=setTimeout(()=>api(`/services?q=${encodeURIComponent(q)}&category=${cat}&women=${wo?1:0}`).then(l=>{setList(l);setErr('')}).catch(e=>setErr(e.message)).finally(()=>setBusy(false)),250);return()=>clearTimeout(id)},[q,cat,wo]);
 const near=()=>navigator.geolocation?navigator.geolocation.getCurrentPosition(p=>setPos([p.coords.latitude,p.coords.longitude]),()=>setErr(t('locfail'))):setErr(t('locfail'));
 const voice=()=>{const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR)return setErr(t('novoice'));const r=new SR();r.lang=lang==='en'?'en-US':'ur-PK';setLive(true);r.onresult=x=>setQ(x.results[0][0].transcript);r.onerror=r.onend=()=>setLive(false);r.start()};
 let rows=list.map(s=>({...s,d:pos&&s.owner.lat!=null?km(pos,[s.owner.lat,s.owner.lng]):null}));if(pos&&view==='list')rows.sort((a,b)=>(a.d??1e9)-(b.d??1e9));
 const filt=q||cat!=='all'||wo,clear=()=>{setQ('');setCat('all');setWo(false)};
 if(view==='map')return <MapView {...{rows,pos,near,q,setQ,cat,setCat,voice,live}} back={()=>setView('list')}/>;
 const pts=rows.filter(s=>s.owner.lat!=null).map(s=>[s.owner.lat,s.owner.lng]);
 const card=s=><Link to={'/s/'+s._id} key={s._id} className="pcard"><div className={'pimg cat-'+s.category}>{s.images[0]?<img src={s.images[0]} alt=""/>:<CatIcon n={s.category}/>}<span className="dpill">{s.d!=null?`${s.d.toFixed(1)} ${t('h_km')}`:(s.owner.area||t(s.category))}</span></div>
  <b className="ptitle">{s.title}</b><span className="mut pown">{s.owner.name}{s.owner.area?` · ${s.owner.area}`:''}{s.owner.vouch>=3&&<span className="vok" title={t('ver')}> ✓</span>}</span>
  <div className="pfoot"><b>{s.price>0?`Rs ${s.price}`:''}</b>{s.owner.rating&&<span className="rate">★ {s.owner.rating.avg} ({s.owner.rating.n})</span>}</div></Link>;
 const items=rows.map(card);if(pts.length)items.splice(Math.min(3,items.length),0,<MiniMap key="mini" pts={pts} open={()=>setView('map')}/>);
 return <>
  {!user&&<section className="welcome"><h1>{t('tag')}</h1><p>{t('sub')}</p><div className="steps">{[1,2,3].map(n=><div key={n}>{t('st'+n)}</div>)}</div>
   <div className="cta"><Link className="btn" to="/login?signup=1">{t('signup')}</Link><Link className="btn ghost" to="/login">{t('login')}</Link></div></section>}
  <section className="hero2"><div className="hleft"><h1 className="h-m">{t('h_need')}</h1><h1 className="h-d">{t('h_find')}</h1><p className="mut h-d hsub">{t('h_sub')}</p>
   <form className="psearch" onSubmit={e=>e.preventDefault()}><Icon n="search"/><input type="search" value={q} onChange={e=>setQ(e.target.value)} placeholder={t('h_ph')} aria-label={t('search')}/><button type="button" className={'mic'+(live?' live':'')} onClick={voice} aria-label={t('speak')}><Icon n="mic"/></button><button className="btn sm sbtn">{t('h_searchbtn')}</button></form>
   <div className="cats">{CATS.map(c=><button key={c} className={'cat cat-'+c+(cat===c?' on':'')} onClick={()=>setCat(cat===c?'all':c)} aria-pressed={cat===c}><span className="ctile"><CatIcon n={c}/></span><small>{t(c)}</small></button>)}</div>
   <div className="chips small"><button className={'chip'+(wo?' on':'')} onClick={()=>setWo(!wo)}>♀ {t('women')}</button><button className={'chip'+(pos?' on':'')} onClick={near}>📍 {t('near')}</button>{filt&&<button className="chip" onClick={clear}>✕ {t('clearAll')}</button>}</div></div>
   <div className="hai"><AIMatch/></div></section>
  {err&&<div className="note" role="alert">{err}</div>}
  <div className="sech"><h2>{t('h_near')}</h2><button className="lnkbtn" onClick={()=>setView('map')}><Icon n="map"/> <span className="h-m">{t('h_seemap')}</span><span className="h-d">{t('h_openmap')}</span></button></div>
  <p className="mut count" aria-live="polite">{busy?'…':`${rows.length} ${t('results')}`}</p>
  <div className="hscroll">{items}</div>
  {!rows.length&&!busy&&!err&&<div className="card empty"><p>{t('none')}</p>{filt&&<button className="btn ghost" onClick={clear}>{t('clearAll')}</button>}</div>}
  <button className="mapfab" onClick={()=>setView('map')}><Icon n="map"/> {t('map')}</button></>}

export function Auth(){
 const {t,setUser}=useContext(Ctx),nav=useNavigate(),loc=useLocation(),[up,setUp]=useState(new URLSearchParams(loc.search).get('signup')==='1'),[f,setF]=useState({role:'customer',gender:'f'}),[e,setE]=useState('');
 const set=k=>v=>setF({...f,[k]:v.target.value});
 const go=async ev=>{ev.preventDefault();setE('');try{const d=await api(up?'/auth/signup':'/auth/login',{method:'POST',body:f});localStorage.setItem('hh_token',d.token);setUser(d.user);nav(d.user.role==='hunarmand'?'/work':'/')}catch(x){setE(x.message)}};
 return <form className="card narrow auth" onSubmit={go}><h2>{up?t('signup'):t('login')}</h2>
  {up&&<div className="roles">{[['customer','🛍️',t('roleCust')],['hunarmand','🧵',t('roleHun')]].map(([k,i,l])=><button type="button" key={k} className={'role'+(f.role===k?' on':'')} onClick={()=>setF({...f,role:k})}><span>{i}</span>{l}</button>)}</div>}
  {up&&<><label>{t('name')}<input required onChange={set('name')}/></label>
   <label>{t('gender')}<select value={f.gender} onChange={set('gender')}><option value="f">{t('f')}</option><option value="m">{t('m')}</option></select></label></>}
  <label>{t('phone')}<input required inputMode="numeric" maxLength={11} onChange={set('phone')}/></label>
  <label>{t('pass')}<input required type="password" minLength={6} onChange={set('password')}/></label>
  {e&&<div className="note" role="alert">{e}</div>}<button className="btn or full">{up?t('signup'):t('login')}</button>
  <p className="mut center">{up?t('haveAcc'):t('noAcc')} <button type="button" className="linkbtn" onClick={()=>setUp(!up)}>{up?t('login'):t('signup')}</button></p></form>}

export function Profile(){
 const {t,user,setUser}=useContext(Ctx),nav=useNavigate(),[f,setF]=useState(user),[m,setM]=useState('');
 const set=k=>e=>setF({...f,[k]:e.target.value});
 const save=async e=>{e.preventDefault();try{setUser(await api('/me',{method:'PUT',body:f}));setM(t('saved'))}catch(x){setM(x.message)}};
 const pic=async e=>{try{setF({...f,avatar:await readImg(e.target.files[0])})}catch(x){setM(x.message)}};
 const loc=()=>navigator.geolocation&&navigator.geolocation.getCurrentPosition(p=>setF({...f,lat:p.coords.latitude,lng:p.coords.longitude}),()=>setM(t('locfail')));
 const del=async()=>{if(!confirm(t('sure')))return;await api('/me',{method:'DELETE'});localStorage.removeItem('hh_token');setUser(null);nav('/')};
 return <form className="card narrow" onSubmit={save}><h2>{t('profile')}</h2><Link to={'/u/'+user.id}>{t('viewPage')}</Link><div className="row ctr"><Av u={f}/><input type="file" accept="image/*" onChange={pic}/></div>
  <label>{t('name')}<input value={f.name||''} onChange={set('name')}/></label><label>{t('area')}<input value={f.area||''} onChange={set('area')}/></label>
  <label>{t('wa')}<input value={f.whatsapp||''} inputMode="numeric" onChange={set('whatsapp')}/></label>
  <label>{t('bio')}<textarea rows={3} value={f.bio||''} onChange={set('bio')}/></label>
  <label>{t('gender')}<select value={f.gender||'f'} onChange={set('gender')}><option value="f">{t('f')}</option><option value="m">{t('m')}</option></select></label>
  <button type="button" className="btn ghost" onClick={loc}>📍 {t('loc')} {f.lat!=null&&'✓'}</button><p className="mut"><small>{t('safe')}</small></p>
  {m&&<div className="note" role="status">{m}</div>}<div className="row"><button className="btn or">{t('save')}</button><button type="button" className="btn ghost" onClick={del}>{t('delacct')}</button></div></form>}

const E0={title:'',category:'tailor',price:'',description:'',online:false,days:[0,1,2,3,4],images:[]};
export function MyWork(){
 const {t,user}=useContext(Ctx),[list,setList]=useState([]),[f,setF]=useState(E0),[show,setShow]=useState(false),[m,setM]=useState(''),[live,setLive]=useState(false),[hint,setHint]=useState(null);
 const sug=async()=>{try{setHint(await api('/ai/price',{method:'POST',body:{...f,area:user.area}}))}catch(x){setM(x.message)}};
 const load=()=>api('/services/mine').then(setList).catch(e=>setM(e.message));useEffect(()=>{load()},[]);
 const set=k=>e=>setF({...f,[k]:e.target.type==='checkbox'?e.target.checked:e.target.value});
 const open=s=>{setF(s||E0);setHint(null);setShow(true);window.scrollTo(0,0)};
 const save=async e=>{e.preventDefault();try{await api(f._id?'/services/'+f._id:'/services',{method:f._id?'PUT':'POST',body:f});setF(E0);setShow(false);setM(t('saved'));load()}catch(x){setM(x.message)}};
 const del=async id=>{if(confirm(t('sure'))){await api('/services/'+id,{method:'DELETE'});load()}};
 const pics=async e=>{try{const n=[];for(const x of [...e.target.files].slice(0,4))n.push(await readImg(x));setF({...f,images:[...f.images,...n].slice(0,4)})}catch(x){setM(x.message)}};
 const listen=()=>{const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR)return setM(t('novoice'));const r=new SR();r.lang='ur-PK';setLive(true);
  r.onresult=async e=>{try{const a=await api('/ai/profile',{method:'POST',body:{text:e.results[0][0].transcript}});setF(o=>({...o,...a}))}catch(x){setM(x.message)}};r.onerror=r.onend=()=>setLive(false);r.start()};
 return <><div className="row ctr between"><h2>{t('myServices')}</h2>{!show&&<button className="btn" onClick={()=>open()}>＋ {t('addService')}</button>}</div>
  {m&&!show&&<div className="note" role="status">{m}</div>}
  {show&&<form className="card" onSubmit={save}><div className="row ctr between"><b>{f._id?t('edit'):t('addService')}</b><button type="button" className="chip" onClick={()=>setShow(false)} aria-label={t('cancel')}>✕</button></div>
   <button type="button" className={'btn ghost full'+(live?' live':'')} onClick={listen}>🎤 {live?t('listening'):t('voice')}</button>
   <label>{t('title')}<input required value={f.title} onChange={set('title')}/></label>
   <div className="row"><label>{t('add')}<select value={f.category} onChange={set('category')}>{CATS.map(c=><option key={c} value={c}>{t(c)}</option>)}</select></label>
    <label>{t('price')}<input type="number" min="0" value={f.price} onChange={set('price')}/></label></div>
   <button type="button" className="chip" onClick={sug}>💡 {t('sugg')}</button>{hint&&<div className="note">Rs {hint.min} to {hint.max}: {hint.reason} {hint.ai?'(AI)':''}</div>}
   <label>{t('desc')}<textarea rows={3} value={f.description} onChange={set('description')}/></label>
   <label className="chk"><input type="checkbox" checked={f.online} onChange={set('online')}/> {t('onl')}</label>
   <div><b>{t('days')}</b><div className="chips">{t('dn').map((d,i)=><button type="button" key={i} className={'chip'+(f.days.includes(i)?' on':'')} onClick={()=>setF({...f,days:f.days.includes(i)?f.days.filter(x=>x!==i):[...f.days,i]})}>{d}</button>)}</div></div>
   <label>{t('photos')}<input type="file" accept="image/*" multiple onChange={pics}/></label>
   <div className="gal">{f.images.map((s,i)=><img key={i} src={s} alt="" onClick={()=>setF({...f,images:f.images.filter((_,j)=>j!==i)})}/>)}</div>
   {m&&<div className="note" role="status">{m}</div>}<button className="btn or full">{t('save')}</button></form>}
  <div className="grid">{list.map(s=><div key={s._id} className="card">{s.images[0]?<img className="thumb" src={s.images[0]} alt=""/>:<div className="thumb ph">{IC[s.category]}</div>}<b>{s.title}</b><p className="mut">{IC[s.category]} {t(s.category)} · Rs {s.price}</p>
   <div className="cta"><button className="btn ghost sm" onClick={()=>open(s)}>{t('edit')}</button><button className="btn ghost sm" onClick={()=>del(s._id)}>{t('del')}</button></div></div>)}</div>
  {!list.length&&!show&&<div className="card empty"><p>{t('noWork')}</p><button className="btn" onClick={()=>open()}>＋ {t('addService')}</button></div>}</>}

export function Detail(){
 const {t,user}=useContext(Ctx),{id}=useParams(),[s,setS]=useState(null),[o,setO]=useState({qty:1,mode:'pickup'}),[m,setM]=useState(''),[vc,setVc]=useState(0),[offer,setOffer]=useState(false);
 useEffect(()=>{api('/services/'+id).then(x=>{setS(x);setVc(x.owner.vouch||0);setO(v=>({...v,price:x.price}))}).catch(e=>setM(e.message))},[id]);
 if(!s)return <p className="mut">{m||'…'}</p>;
 const own=s.owner.id===user.id,cust=user.role==='customer';
 const send=async e=>{e.preventDefault();try{await api('/orders',{method:'POST',body:{...o,service:s._id}});setM(t('sent'));setOffer(false)}catch(x){setM(x.message)}};
 const vouch=async()=>{try{setVc((await api('/users/'+s.owner.id+'/vouch',{method:'POST'})).vouch)}catch(x){setM(x.message)}};
 const report=async()=>{const reason=prompt(t('rep'));if(reason)try{await api('/reports',{method:'POST',body:{target:s.owner.id,reason}});setM(t('repd'))}catch(x){setM(x.message)}};
 const text=`Assalam o Alaikum ${s.owner.name}, I saw "${s.title}" on HerHunar and would like to know more.`;
 return <article className="card detail">
  <Link to={'/u/'+s.owner.id} className="row ctr vhead"><Av u={s.owner}/><span><b>{s.owner.name}</b>{vc>=3&&<span className="vok"> ✓</span>}<br/><small className="mut">{s.owner.area||''}{s.owner.rating?` · ★ ${s.owner.rating.avg} (${s.owner.rating.n})`:''}</small></span></Link>
  {s.images.length>0?<div className="carousel">{s.images.map((x,i)=><img key={i} src={x} alt=""/>)}</div>:<div className="thumb ph big">{IC[s.category]}</div>}
  <h2>{s.title}</h2>
  <div className="vmeta">{s.price>0&&<span className="price">Rs {s.price}</span>}<span className="tag">{IC[s.category]} {t(s.category)}</span>{s.online&&<span className="tag">{t('onl')}</span>}{vc>=3&&<span className="tag">✓ {t('ver')}</span>}</div>
  <p>{s.description}</p>{(s.days||[]).length>0&&<p className="mut"><small>{t('days')}: {s.days.map(d=>t('dn')[d]).join(', ')}</small></p>}
  {own?<div className="cta"><Link className="btn ghost" to="/work">{t('edit')}</Link><span className="mut">{t('yourService')}</span></div>
   :<div className="cta">{cust&&<button className="btn or" onClick={()=>setOffer(!offer)}>💰 {t('offer')}</button>}<Link className="btn ghost" to={'/chat/'+s.owner.id}>✉ {t('msg')}</Link><a className="btn ghost" target="_blank" rel="noopener noreferrer" href={`https://wa.me/${wa(s.owner.whatsapp)}?text=${encodeURIComponent(text)}`}>💬 WhatsApp</a></div>}
  {offer&&cust&&<form onSubmit={send} className="offer"><div className="row">
   <label>{t('price')}<input type="number" min="1" value={o.price||''} onChange={e=>setO({...o,price:e.target.value})}/></label>
   <label>{t('qty')}<input type="number" min="1" value={o.qty} onChange={e=>setO({...o,qty:e.target.value})}/></label></div><div className="row">
   <label>{t('when')}<input type="datetime-local" onChange={e=>setO({...o,when:e.target.value})}/></label>
   <label>{t('pu')} / {t('dl')}<select value={o.mode} onChange={e=>setO({...o,mode:e.target.value})}><option value="pickup">{t('pu')}</option><option value="delivery">{t('dl')}</option></select></label></div>
   <button className="btn or full">{t('send')}</button></form>}
  {m&&<div className="note" role="status">{m}</div>}
  {!own&&<details className="more"><summary>⋯ {t('more')}</summary><div className="cta"><button className="btn ghost sm" onClick={vouch}>🤝 {t('vouch')} ({vc})</button><button className="btn ghost sm" onClick={report}>🚨 {t('rep')}</button></div></details>}
  <p className="mut"><small>{t('safe')}</small></p></article>}

const Stars=({v,set})=><span className="stars" role={set?'radiogroup':undefined}>{[1,2,3,4,5].map(n=>set?<button type="button" key={n} className={'star'+(n<=v?' on':'')} onClick={()=>set(n)} aria-label={n+' / 5'}>★</button>:<span key={n} className={'star'+(n<=v?' on':'')}>★</span>)}</span>;
const dayLab=(s,t)=>{const d=new Date(s),n=new Date();if(d.toDateString()===n.toDateString())return t('today');if(d.toDateString()===new Date(n-864e5).toDateString())return t('yesterday');return d.toLocaleDateString([],{day:'numeric',month:'short',year:'numeric'})};
const pickImgs=async(e,old,max,setM)=>{try{const n=[];for(const x of [...e.target.files].slice(0,max))n.push(await readImg(x,640,.6));return [...old,...n].slice(0,max)}catch(x){setM(x.message);return old}finally{e.target.value=''}};
function ReviewForm({o,done,setM}){
 const {t}=useContext(Ctx),[open,setOpen]=useState(false),[r,setR]=useState(0),[txt,setTxt]=useState(''),[im,setIm]=useState([]),[busy,setBusy]=useState(false);
 const go=async()=>{if(!r)return setM(t('pickStars'));setBusy(true);try{await api('/orders/'+o._id,{method:'PATCH',body:{rating:r,review:txt,images:im}});setM('');done()}catch(x){setM(x.message)}setBusy(false)};
 if(!open)return <button className="btn or" onClick={()=>setOpen(true)}>★ {t('writeReview')}</button>;
 return <div className="review-form"><Stars v={r} set={setR}/><textarea rows={3} maxLength={500} value={txt} placeholder={t('reviewPh')} onChange={e=>setTxt(e.target.value)}/>
  <label>{t('addPhotos')}<input type="file" accept="image/*" multiple onChange={async e=>setIm(await pickImgs(e,im,3,setM))}/></label>
  <div className="gal">{im.map((x,i)=><img key={i} src={x} alt="" onClick={()=>setIm(im.filter((_,j)=>j!==i))}/>)}</div>
  <div className="row"><button className="btn or" disabled={busy} onClick={go}>{busy?'…':t('submit')}</button><button className="btn ghost" onClick={()=>setOpen(false)}>{t('cancel')}</button></div></div>}

export function Orders(){
 const {t,user}=useContext(Ctx),[l,setL]=useState([]),[m,setM]=useState('');
 const load=()=>api('/orders').then(setL).catch(e=>setM(e.message));useEffect(()=>{load()},[]);
 const act=async(o,b)=>{try{await api('/orders/'+o._id,{method:'PATCH',body:b});load()}catch(x){setM(x.message)}};
 return <><h2>{t('orders')}</h2>{m&&<div className="note" role="alert">{m}</div>}<div className="grid">{l.map(o=>{const H=user.role==='hunarmand';return <div className="card" key={o._id}>
  <b>{o.service?o.service.title:'—'}</b><p className="mut">{H?o.customer&&o.customer.name:o.hunarmand&&o.hunarmand.name} · Rs {o.price} × {o.qty}<br/>{[o.when&&!isNaN(new Date(o.when))?new Date(o.when).toLocaleString([],{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):o.when,t(o.mode==='delivery'?'dl':'pu')].filter(Boolean).join(' · ')}</p>
  <span className={'tag st-'+o.status}>{t('s_'+o.status)}</span>
  {o.rating>0&&<div><Stars v={o.rating}/>{o.review&&<p>{o.review}</p>}<div className="gal">{(o.reviewImages||[]).map((x,i)=><img key={i} src={x} alt=""/>)}</div></div>}
  <div className="row">{H&&o.status==='offered'&&<><button className="btn" onClick={()=>act(o,{status:'accepted'})}>{t('accept')}</button><button className="btn ghost" onClick={()=>{const p=prompt(t('price'),o.price);if(p)act(o,{status:'countered',price:p})}}>{t('counter')}</button></>}
   {!H&&o.status==='countered'&&<button className="btn" onClick={()=>act(o,{status:'accepted'})}>{t('accept')}</button>}
   {H&&o.status==='accepted'&&<button className="btn or" onClick={()=>act(o,{status:'done'})}>{t('done')}</button>}</div>
  {!H&&o.status==='done'&&!o.rating&&<ReviewForm o={o} done={load} setM={setM}/>}</div>})}</div>
  {!l.length&&<div className="card empty"><p>{t('noOrders')}</p></div>}</>}

export function UserPage(){
 const {t,user,logout}=useContext(Ctx),{id}=useParams(),[d,setD]=useState(null),[sel,setSel]=useState(null),[zoom,setZoom]=useState(null),[tab,setTab]=useState('work'),[comp,setComp]=useState(false),[cap,setCap]=useState(''),[im,setIm]=useState([]),[busy,setBusy]=useState(false),[m,setM]=useState('');
 const load=()=>api('/users/'+id).then(setD).catch(e=>setM(e.message));useEffect(()=>{setD(null);setTab('work');setComp(false);load()},[id]);
 if(!d)return <p className="mut">{m||'…'}</p>;
 const u=d.user,mine=user.id===u.id,hun=u.role==='hunarmand';
 const post=async()=>{if(!im.length)return setM(t('up4'));setBusy(true);try{await api('/posts',{method:'POST',body:{images:im,caption:cap}});setCap('');setIm([]);setM('');setComp(false);load()}catch(x){setM(x.message)}setBusy(false)};
 const like=async p=>{try{const r=await api('/posts/'+p._id+'/like',{method:'POST'});setD({...d,posts:d.posts.map(x=>x._id===p._id?{...x,likes:r.likes,liked:r.liked}:x)});setSel({...p,likes:r.likes,liked:r.liked})}catch(x){setM(x.message)}};
 const del=async p=>{if(confirm(t('sure'))){await api('/posts/'+p._id,{method:'DELETE'});setSel(null);load()}};
 const open=async p=>{setSel(p);if(p.n>1){try{const x=await api('/posts/'+p._id);setSel(s=>s&&s._id===p._id?{...s,images:x.images}:s)}catch{}}};
 const editCap=async p=>{const c=prompt(t('editCaption'),p.caption||'');if(c===null)return;try{await api('/posts/'+p._id,{method:'PATCH',body:{caption:c}});setSel({...p,caption:c});load()}catch(x){setM(x.message)}};
 const days=[];d.posts.forEach(p=>{const k=new Date(p.at).toDateString();let g=days[days.length-1];if(!g||g.k!==k){g={k,at:p.at,list:[]};days.push(g)}g.list.push(p)});
 return <div className="page640"><div className="profile"><div className="ptop"><Av u={u} big/>
   <div className="pstats">{hun?<><div><b>{d.posts.length}</b><small>{t('posts')}</small></div><div><b>{u.rating?u.rating.avg:'–'}</b><small>★ {t('rev')}</small></div><div><b>{u.vouch||0}</b><small>{t('vouch')}</small></div></>:<div><b>{u.vouch||0}</b><small>{t('vouch')}</small></div>}</div></div>
  <h2 className="pname">{u.name}{u.vouch>=3&&<span className="vok"> ✓</span>}</h2>{(u.area||u.vouch>=3)&&<div className="mut">{u.area&&`📍 ${u.area} `}{u.vouch>=3&&<span className="tag">✓ {t('ver')}</span>}</div>}{u.bio&&<p>{u.bio}</p>}
  <div className="cta">{mine?<><Link className="btn ghost" to="/me">✎ {t('editProfile')}</Link>{hun&&<Link className="btn ghost" to="/work">🛠 {t('myWork')}</Link>}<button className="btn ghost" onClick={logout}>{t('logout')}</button></>
   :<><Link className="btn" to={'/chat/'+u.id}>✉ {t('msg')}</Link><a className="btn ghost" target="_blank" rel="noopener noreferrer" href={`https://wa.me/${wa(u.whatsapp)}`}>💬 WhatsApp</a></>}</div></div>
  {m&&<div className="note" role="alert">{m}</div>}
  {hun&&<div className="utabs"><button className={'utab'+(tab==='work'?' on':'')} onClick={()=>setTab('work')}>▦ {t('dailyWork')}</button><button className={'utab'+(tab==='reviews'?' on':'')} onClick={()=>setTab('reviews')}>★ {t('reviews')} ({d.reviews.length})</button><button className={'utab'+(tab==='svc'?' on':'')} onClick={()=>setTab('svc')}>🛠 {t('services')} ({d.services.length})</button></div>}
  {hun&&tab==='work'&&<>{mine&&!comp&&<button className="btn or full" onClick={()=>setComp(true)}>＋ {t('postWork')}</button>}
   {mine&&comp&&<div className="card composer"><div className="row ctr between"><b>{t('postWork')}</b><button className="chip" onClick={()=>setComp(false)} aria-label={t('cancel')}>✕</button></div><input placeholder={t('postPh')} maxLength={300} value={cap} onChange={e=>setCap(e.target.value)}/>
    <label>{t('up4')}<input type="file" accept="image/*" multiple onChange={async e=>setIm(await pickImgs(e,im,4,setM))}/></label>
    <div className="gal">{im.map((x,i)=><img key={i} src={x} alt="" onClick={()=>setIm(im.filter((_,j)=>j!==i))}/>)}</div>
    <button className="btn or full" disabled={busy||!im.length} onClick={post}>{busy?'…':t('postBtn')}</button></div>}
   {days.map(g=><div key={g.k}><div className="day">{dayLab(g.at,t)}</div><div className="posts">{g.list.map(p=><button key={p._id} className="post" onClick={()=>open(p)}><img src={p.images[0]} alt={p.caption||''}/>{p.n>1&&<span className="multi">⧉ {p.n}</span>}</button>)}</div></div>)}{!d.posts.length&&!comp&&<p className="mut center">{t('none')}</p>}</>}
  {hun&&tab==='reviews'&&<div className="card">{d.reviews.map(r=><div key={r._id} className="rcard"><div className="row ctr"><Av u={r.customer}/><div><b>{r.customer&&r.customer.name}</b><br/><Stars v={r.rating}/> <small className="mut">{new Date(r.at).toLocaleDateString()}{r.service&&` · ${r.service}`}</small></div></div>
    {r.review&&<p>{r.review}</p>}{r.images.length>0&&<div className="gal">{r.images.map((x,i)=><img key={i} src={x} alt="" onClick={()=>setZoom(x)}/>)}</div>}</div>)}{!d.reviews.length&&<p className="mut center">{t('noReviews')}</p>}</div>}
  {hun&&tab==='svc'&&<div className="grid">{d.services.map(s=><Link key={s._id} to={'/s/'+s._id} className="card lnk"><b>{IC[s.category]} {s.title}</b><p className="mut">Rs {s.price}</p></Link>)}{!d.services.length&&<p className="mut center">{t('none')}</p>}</div>}
  {sel&&<div className="modal" onClick={()=>setSel(null)}><div className="card" onClick={e=>e.stopPropagation()}><div className="slides">{sel.images.map((x,i)=><img key={i} className="full" src={x} alt=""/>)}</div><p className="cap">{sel.caption}</p><small className="mut">{dayLab(sel.at,t)}</small>
   <div className="cta"><button className="btn ghost sm" onClick={()=>like(sel)}>{sel.liked?'♥':'♡'} {sel.likes}</button>{mine&&<button className="btn ghost sm" onClick={()=>editCap(sel)}>✎ {t('editCaption')}</button>}{mine&&<button className="btn ghost sm" onClick={()=>del(sel)}>{t('del')}</button>}<button className="btn ghost sm" onClick={()=>setSel(null)}>✕</button></div></div></div>}
  {zoom&&<div className="modal" onClick={()=>setZoom(null)}><img className="full" style={{maxWidth:520}} src={zoom} alt=""/></div>}</div>}

export function Inbox(){
 const {t}=useContext(Ctx),[l,setL]=useState([]),[ok,setOk]=useState(false);
 useEffect(()=>{const f=()=>api('/chats').then(x=>{setL(x);setOk(true)}).catch(()=>{});f();const i=setInterval(f,6000);return()=>clearInterval(i)},[]);
 const hm=s=>{const d=new Date(s),n=new Date();return d.toDateString()===n.toDateString()?d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):d.toLocaleDateString([],{day:'numeric',month:'short'})};
 return <><h2>{t('msgs')}</h2><div className="card list">{l.map(c=><Link key={c.user.id} to={'/chat/'+c.user.id} className={'inrow'+(c.unread>0?' unread':'')}><Av u={c.user}/><div className="grow"><b>{c.user.name}</b><br/><span className="mut clip">{c.gone?t('deletedMsg'):c.last}</span></div><div className="nside"><small className="mut">{hm(c.at)}</small>{c.unread>0&&<span className="badge static">{c.unread}</span>}</div></Link>)}
  {!l.length&&ok&&<p className="mut center pad">{t('noMsgs')}</p>}</div></>}

const EMOJI=['😊','😂','😍','🙏','👍','❤️','🔥','🎉','😢','😮','👏','✨','🌸','🧵','🍲','💄','📚','💻','🤝','✅','🙌','😅','🥰','💐'];
export function Thread(){
 const {t}=useContext(Ctx),{id}=useParams(),[d,setD]=useState(null),[v,setV]=useState(''),[m,setM]=useState(''),[act,setAct]=useState(null),[edit,setEdit]=useState(null),[emo,setEmo]=useState(false),end=useRef();
 const load=()=>api('/chats/'+id).then(setD).catch(e=>setM(e.message));
 useEffect(()=>{load();const i=setInterval(load,4000);return()=>clearInterval(i)},[id]);
 useEffect(()=>{end.current&&end.current.scrollIntoView()},[d&&d.messages.length]);
 const send=async e=>{e.preventDefault();if(!v.trim())return;setM('');try{if(edit)await api('/messages/'+edit,{method:'PATCH',body:{text:v}});else await api('/chats/'+id,{method:'POST',body:{text:v}});setV('');setEdit(null);setEmo(false);load()}catch(x){setM(x.message)}};
 const del=async x=>{if(!confirm(t('sure')))return;try{await api('/messages/'+x._id,{method:'DELETE'});setAct(null);load()}catch(y){setM(y.message)}};
 if(!d)return <p className="mut">{m||'…'}</p>;
 const lastMine=[...d.messages].reverse().find(x=>x.mine&&!x.deleted),hm=s=>new Date(s).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
 return <div className="card"><div className="row ctr thead"><Link to="/chat" className="back" aria-label={t('back')}>←</Link><Av u={d.user}/><Link to={'/u/'+d.user.id}><b>{d.user.name}</b></Link></div>
  <div className="bubbles">{d.messages.map(x=>{const can=x.mine&&!x.deleted;return <div key={x._id} className={'msg'+(x.mine?' me':'')}>
   <div className={'bub'+(x.mine?' me':'')+(x.deleted?' gone':'')} onClick={()=>can&&setAct(act===x._id?null:x._id)} role={can?'button':undefined} tabIndex={can?0:undefined}>{x.deleted?t('deletedMsg'):x.text}</div>
   <small className="mut">{hm(x.at)}{x.edited&&!x.deleted&&` · ${t('edited')}`}{can&&` · ${x.read?'✓✓':'✓'}${lastMine&&lastMine._id===x._id?' '+(x.read?t('seen'):t('sent')):''}`}</small>
   {act===x._id&&<div className="row acts"><button className="chip" onClick={()=>{setEdit(x._id);setV(x.text);setAct(null)}}>✎ {t('editMsg')}</button><button className="chip" onClick={()=>del(x)}>🗑 {t('delMsg')}</button></div>}</div>})}<div ref={end}/></div>
  {m&&<div className="note" role="alert">{m}</div>}
  {edit&&<div className="note">✎ {t('editMsg')} <button className="chip" onClick={()=>{setEdit(null);setV('')}}>{t('cancel')}</button></div>}
  {emo&&<div className="emojis">{EMOJI.map(e=><button key={e} type="button" className="chip" onClick={()=>setV(v+e)}>{e}</button>)}</div>}
  <form className="row send" onSubmit={send}><button type="button" className="chip" onClick={()=>setEmo(!emo)} aria-label={t('emojiTitle')}>😊</button><input value={v} onChange={e=>setV(e.target.value)} placeholder={t('msg')} aria-label={t('msg')}/><button className="btn or">{edit?t('save'):t('send')}</button></form></div>}
