const express=require('express'),mongoose=require('mongoose'),jwt=require('jsonwebtoken'),bcrypt=require('bcryptjs'),cors=require('cors');
const {Schema,model,models}=mongoose,OID=Schema.Types.ObjectId;
const User=models.User||model('User',new Schema({name:String,phone:{type:String,unique:true},pass:String,role:{type:String,enum:['customer','hunarmand']},gender:{type:String,default:'f'},whatsapp:String,bio:String,area:String,lat:Number,lng:Number,avatar:String,endorse:[OID]},{timestamps:true}));
const Service=models.Service||model('Service',new Schema({owner:{type:OID,ref:'User',index:true},title:String,category:String,description:String,price:Number,images:[String],online:{type:Boolean,default:false},days:[Number]},{timestamps:true}));
const Order=models.Order||model('Order',new Schema({service:{type:OID,ref:'Service'},customer:{type:OID,ref:'User'},hunarmand:{type:OID,ref:'User'},price:Number,qty:{type:Number,default:1},when:String,mode:String,status:{type:String,default:'offered'},rating:Number,review:String,reviewImages:[String],reviewedAt:Date},{timestamps:true}));

const Report=models.Report||model('Report',new Schema({by:OID,target:OID,reason:String},{timestamps:true}));
const Post=models.Post||model('Post',new Schema({owner:{type:OID,ref:'User',index:true},image:String,images:[String],caption:String,likes:[OID]},{timestamps:true}));
const Msg=models.Msg||model('Msg',new Schema({from:{type:OID,index:true},to:{type:OID,index:true},text:String,read:{type:Boolean,default:false},readAt:Date,edited:{type:Boolean,default:false},deleted:{type:Boolean,default:false}},{timestamps:true}));
const Notif=models.Notif||model('Notif',(()=>{const s=new Schema({user:{type:OID,index:true},type:String,from:OID,meta:Schema.Types.Mixed,link:String,read:{type:Boolean,default:false}},{timestamps:true});s.index({createdAt:1},{expireAfterSeconds:2592000});return s})());
const notify=(user,type,from,meta,link)=>Notif.create({user,type,from,meta,link}).catch(()=>{});
const imgs=(a,n)=>(Array.isArray(a)?a:[]).filter(i=>typeof i==='string'&&i.startsWith('data:image/')&&i.length<400000).slice(0,n);
const app=express();app.use(cors(),express.json({limit:'6mb'}));
let conn;app.use(async(q,r,n)=>{try{if(!conn)conn=mongoose.connect(process.env.MONGODB_URI);await conn;n()}catch(e){conn=null;r.status(500).json({error:'Database connection failed. Check MONGODB_URI.'})}});

const esc=s=>String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const tok=u=>jwt.sign({id:String(u._id),role:u.role},process.env.JWT_SECRET,{expiresIn:'30d'});
const rd=n=>typeof n==='number'?Math.round(n*100)/100:undefined; // public location is rounded (~1 km), exact address is never stored
const pub=u=>({id:u._id,name:u.name,role:u.role,gender:u.gender,area:u.area,bio:u.bio,avatar:u.avatar,lat:rd(u.lat),lng:rd(u.lng),vouch:(u.endorse||[]).length});
const own=u=>({...pub(u),phone:u.phone,whatsapp:u.whatsapp,lat:u.lat,lng:u.lng});
const auth=role=>(q,r,n)=>{try{q.u=jwt.verify((q.headers.authorization||'').slice(7),process.env.JWT_SECRET);if(role&&q.u.role!==role)return r.status(403).json({error:'Not allowed'});n()}catch(e){r.status(401).json({error:'Please log in'})}};
const h=f=>(q,r)=>f(q,r).catch(e=>r.status(400).json({error:e.message}));
const ratings=async()=>Object.fromEntries((await Order.aggregate([{$match:{rating:{$gt:0}}},{$group:{_id:'$hunarmand',avg:{$avg:'$rating'},n:{$sum:1}}}])).map(x=>[String(x._id),{avg:+x.avg.toFixed(1),n:x.n}]));
const hits=new Map();const limit=n=>(q,r,x)=>{const k=(q.headers['x-forwarded-for']||q.ip)+q.baseUrl+q.path,now=Date.now(),a=(hits.get(k)||[]).filter(t=>now-t<60000);if(a.length>=n)return r.status(429).json({error:'Too many requests. Please wait a minute.'});a.push(now);hits.set(k,a);x()};
const R=express.Router();

R.use('/auth',limit(20));R.use('/ai',limit(20));R.use('/chats',limit(90));R.use('/messages',limit(90));R.use('/notifs',limit(60));
R.post('/auth/signup',h(async(q,r)=>{const {name,phone,password,role,gender}=q.body;
 if(!name||!/^03\d{9}$/.test(phone||'')||(password||'').length<6)return r.status(400).json({error:'Enter your name, a 03XXXXXXXXX number and a 6+ character password'});
 if(await User.findOne({phone}))return r.status(409).json({error:'This number already has an account'});
 const u=await User.create({name:String(name).trim().slice(0,60),phone,pass:await bcrypt.hash(password,10),role:role==='hunarmand'?'hunarmand':'customer',gender:gender==='m'?'m':'f',whatsapp:phone});
 r.json({token:tok(u),user:own(u)})}));
R.post('/auth/login',h(async(q,r)=>{const u=await User.findOne({phone:String(q.body.phone||'')});
 if(!u||!(await bcrypt.compare(String(q.body.password||''),u.pass)))return r.status(401).json({error:'Wrong number or password'});
 r.json({token:tok(u),user:own(u)})}));

// Profile CRUD
R.get('/me',auth(),h(async(q,r)=>r.json(own(await User.findById(q.u.id)))));
R.put('/me',auth(),h(async(q,r)=>{const d={};['name','bio','area','whatsapp','avatar','gender','lat','lng'].forEach(k=>{if(k in q.body)d[k]=q.body[k]});
 if(d.avatar&&d.avatar.length>400000)return r.status(400).json({error:'Photo too large'});
 r.json(own(await User.findByIdAndUpdate(q.u.id,d,{new:true})))}));
R.delete('/me',auth(),h(async(q,r)=>{await Service.deleteMany({owner:q.u.id});await Post.deleteMany({owner:q.u.id});await Msg.deleteMany({$or:[{from:q.u.id},{to:q.u.id}]});await Notif.deleteMany({$or:[{user:q.u.id},{from:q.u.id}]});await User.deleteOne({_id:q.u.id});r.json({ok:1})}));

// Services (hunarmand work) + search
const sv=b=>({title:String(b.title||'').slice(0,80),category:String(b.category||'tailor').trim().slice(0,40)||'tailor',description:String(b.description||'').slice(0,1000),price:Math.max(0,+b.price||0),images:(b.images||[]).slice(0,4).filter(i=>typeof i==='string'&&i.length<400000),online:!!b.online,days:(b.days||[]).filter(d=>d>=0&&d<7)});
R.get('/services',h(async(q,r)=>{const {q:s,category,women}=q.query,f={};
 if(category&&category!=='all')f.category=category;
 if(s){const rx=new RegExp(esc(s),'i'),ids=(await User.find({$or:[{name:rx},{area:rx}]}).select('_id')).map(x=>x._id);f.$or=[{title:rx},{description:rx},{category:rx},{owner:{$in:ids}}]}
 let l=(await Service.find(f).sort('-createdAt').limit(100).populate('owner')).filter(x=>x.owner);
 if(women==='1')l=l.filter(x=>x.owner.gender==='f');
 const rt=await ratings();r.json(l.map(x=>({...x.toObject(),owner:{...pub(x.owner),rating:rt[String(x.owner._id)]}})))}));
R.get('/services/mine',auth('hunarmand'),h(async(q,r)=>r.json(await Service.find({owner:q.u.id}).sort('-createdAt'))));
R.get('/services/:id',auth(),h(async(q,r)=>{const x=await Service.findById(q.params.id).populate('owner');if(!x)return r.status(404).json({error:'Not found'});const rt=await ratings();r.json({...x.toObject(),owner:{...pub(x.owner),whatsapp:x.owner.whatsapp,rating:rt[String(x.owner._id)]}})}));
R.post('/services',auth('hunarmand'),h(async(q,r)=>{const b=sv(q.body);if(!b.title)return r.status(400).json({error:'Title is required'});r.json(await Service.create({...b,owner:q.u.id}))}));
R.put('/services/:id',auth('hunarmand'),h(async(q,r)=>{const x=await Service.findOneAndUpdate({_id:q.params.id,owner:q.u.id},sv(q.body),{new:true});x?r.json(x):r.status(404).json({error:'Not found'})}));
R.delete('/services/:id',auth('hunarmand'),h(async(q,r)=>{await Service.deleteOne({_id:q.params.id,owner:q.u.id});r.json({ok:1})}));

// Price offers: customer offers, hunarmand accepts or counters, then done and rating
R.post('/orders',auth('customer'),h(async(q,r)=>{const s=await Service.findById(q.body.service);if(!s)return r.status(404).json({error:'Service not found'});
 const o=await Order.create({service:s._id,customer:q.u.id,hunarmand:s.owner,price:+q.body.price||s.price,qty:Math.max(1,+q.body.qty||1),when:String(q.body.when||'').slice(0,40),mode:q.body.mode==='delivery'?'delivery':'pickup'});
 const me=await User.findById(q.u.id).select('name');await notify(s.owner,'offer',q.u.id,{name:me&&me.name,title:s.title,price:o.price},'/orders');r.json(o)}));
R.get('/orders',auth(),h(async(q,r)=>r.json(await Order.find({$or:[{customer:q.u.id},{hunarmand:q.u.id}]}).sort('-createdAt').limit(60).populate('service','title').populate('customer','name').populate('hunarmand','name'))));
R.patch('/orders/:id',auth(),h(async(q,r)=>{const o=await Order.findById(q.params.id).populate('service','title');if(!o)return r.status(404).json({error:'Not found'});
 const b=q.body,H=String(o.hunarmand)===q.u.id,C=String(o.customer)===q.u.id;if(!H&&!C)return r.status(403).json({error:'Not allowed'});
 const me=await User.findById(q.u.id).select('name'),meta={name:me&&me.name,title:o.service&&o.service.title,price:o.price};let ev=null;
 if(H&&b.status==='accepted'&&o.status==='offered'){o.status='accepted';ev=['accepted',o.customer]}
 if(H&&b.status==='countered'&&o.status==='offered'){o.status='countered';o.price=+b.price||o.price;meta.price=o.price;ev=['countered',o.customer]}
 if(C&&b.status==='accepted'&&o.status==='countered'){o.status='accepted';ev=['accepted',o.hunarmand]}
 if(H&&b.status==='done'&&o.status==='accepted'){o.status='done';ev=['done',o.customer]}
 if(C&&o.status==='done'&&b.rating&&!o.rating){o.rating=Math.min(5,Math.max(1,Math.round(+b.rating)||1));o.review=String(b.review||'').trim().slice(0,500);o.reviewImages=imgs(b.images,3);o.reviewedAt=new Date();meta.rating=o.rating;ev=['review',o.hunarmand]}
 await o.save();if(ev)await notify(ev[1],ev[0],q.u.id,meta,ev[0]==='review'?'/u/'+o.hunarmand:'/orders');r.json(o)}));

// AI: voice-to-profile (needs ANTHROPIC_API_KEY, otherwise a friendly fallback)
async function ask(system,messages){const k=process.env.ANTHROPIC_API_KEY;if(!k)return null;
 const x=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'content-type':'application/json','x-api-key':k,'anthropic-version':'2023-06-01'},body:JSON.stringify({model:process.env.AI_MODEL||'claude-haiku-4-5-20251001',max_tokens:400,system,messages})});
 const d=await x.json();return d.content&&d.content[0]&&d.content[0].text||null}
R.post('/ai/profile',auth('hunarmand'),h(async(q,r)=>{const t=String(q.body.text||'').slice(0,800);
 const a=await ask('Turn the spoken text into JSON only: {"title":"short service title","category":"tailor|food|beauty|tutor|online, or a concise new skill category if needed","description":"two friendly sentences in the speaker language","price":number}. Output nothing else.',[{role:'user',content:t}]).catch(()=>null);
 try{r.json(JSON.parse(a.replace(/```json|```/g,'')))}catch(e){r.json({title:t.slice(0,40),category:'tailor',description:t,price:0})}}));
// Instagram-style public page: profile, photo posts (portfolio), likes
R.get('/users/:id',auth(),h(async(q,r)=>{const u=await User.findById(q.params.id);if(!u)return r.status(404).json({error:'Not found'});
 const rt=(await ratings())[String(u._id)],posts=await Post.find({owner:u._id}).sort('-createdAt').limit(30),services=await Service.find({owner:u._id}).sort('-createdAt');
 const reviews=await Order.find({hunarmand:u._id,rating:{$gt:0}}).sort('-reviewedAt').limit(12).populate('customer','name').populate('service','title');
 r.json({user:{...pub(u),whatsapp:u.whatsapp,rating:rt},posts:posts.map(p=>({_id:p._id,images:[p.image||(p.images||[])[0]].filter(Boolean),n:Math.max(1,(p.images||[]).length),caption:p.caption,at:p.createdAt,likes:p.likes.length,liked:p.likes.map(String).includes(q.u.id)})),services,
  reviews:reviews.map(o=>({_id:o._id,rating:o.rating,review:o.review,images:o.reviewImages||[],at:o.reviewedAt||o.updatedAt,service:o.service&&o.service.title,customer:o.customer&&{id:o.customer._id,name:o.customer.name}}))})}));
R.get('/posts/:id',auth(),h(async(q,r)=>{const p=await Post.findById(q.params.id);if(!p)return r.status(404).json({error:'Not found'});r.json({images:p.images&&p.images.length?p.images:(p.image?[p.image]:[])})}));
R.post('/posts',auth('hunarmand'),h(async(q,r)=>{const images=imgs(q.body.images||[q.body.image],4);if(!images.length)return r.status(400).json({error:'Add a photo under 400 KB'});
 r.json(await Post.create({owner:q.u.id,images,image:images[0],caption:String(q.body.caption||'').slice(0,300)}))}));
R.patch('/posts/:id',auth('hunarmand'),h(async(q,r)=>{const p=await Post.findOneAndUpdate({_id:q.params.id,owner:q.u.id},{caption:String(q.body.caption||'').slice(0,300)},{new:true});p?r.json({ok:1}):r.status(404).json({error:'Not found'})}));
R.delete('/posts/:id',auth('hunarmand'),h(async(q,r)=>{await Post.deleteOne({_id:q.params.id,owner:q.u.id});r.json({ok:1})}));
R.post('/posts/:id/like',auth(),h(async(q,r)=>{const p=await Post.findById(q.params.id);if(!p)return r.status(404).json({error:'Not found'});const i=p.likes.map(String).indexOf(q.u.id);i<0?p.likes.push(q.u.id):p.likes.splice(i,1);await p.save();
 if(i<0&&String(p.owner)!==q.u.id&&!(await Notif.exists({user:p.owner,type:'like',from:q.u.id,read:false}))){const me=await User.findById(q.u.id).select('name');await notify(p.owner,'like',q.u.id,{name:me&&me.name},'/u/'+p.owner)}
 r.json({likes:p.likes.length,liked:i<0})}));

// In-app direct messages (inbox + thread, the client polls every few seconds)
R.get('/chats',auth(),h(async(q,r)=>{const m=await Msg.find({$or:[{from:q.u.id},{to:q.u.id}]}).sort('-createdAt').limit(300),seen=new Map();
 for(const x of m){const o=String(x.from)===q.u.id?String(x.to):String(x.from);if(!seen.has(o))seen.set(o,{last:x.deleted?'':x.text,gone:!!x.deleted,at:x.createdAt,unread:0});if(String(x.to)===q.u.id&&!x.read)seen.get(o).unread++}
 const us=await User.find({_id:{$in:[...seen.keys()]}});r.json(us.map(u=>({user:pub(u),...seen.get(String(u._id))})).sort((a,b)=>b.at-a.at))}));
R.get('/chats/:id',auth(),h(async(q,r)=>{const o=q.params.id,u=await User.findById(o);if(!u)return r.status(404).json({error:'Not found'});
 await Msg.updateMany({from:o,to:q.u.id,read:false},{read:true,readAt:new Date()});
 const m=await Msg.find({$or:[{from:q.u.id,to:o},{from:o,to:q.u.id}]}).sort('createdAt').limit(200);
 r.json({user:pub(u),messages:m.map(x=>({_id:x._id,mine:String(x.from)===q.u.id,text:x.deleted?'':x.text,at:x.createdAt,read:x.read,readAt:x.readAt,edited:x.edited,deleted:x.deleted}))})}));
R.post('/chats/:id',auth(),h(async(q,r)=>{const text=String(q.body.text||'').trim().slice(0,1000);if(!text)return r.status(400).json({error:'Write a message'});
 if(q.params.id===q.u.id)return r.status(400).json({error:'You cannot message yourself'});if(!(await User.exists({_id:q.params.id})))return r.status(404).json({error:'Not found'});
 r.json(await Msg.create({from:q.u.id,to:q.params.id,text}))}));

// Live notifications: the client polls this every few seconds (Vercel serverless has no websockets).
// Unread chat messages are grouped per sender; other events (offers, reviews, likes) come from the Notif collection.
R.get('/notifs',auth(),h(async(q,r)=>{
 const um=await Msg.find({to:q.u.id,read:false,deleted:false}).sort('-createdAt').limit(100),g=new Map();
 for(const x of um){const k=String(x.from);if(!g.has(k))g.set(k,{id:String(x._id),from:k,text:x.text.slice(0,80),at:x.createdAt,count:0});g.get(k).count++}
 const us=await User.find({_id:{$in:[...g.keys()]}}).select('name avatar'),nm=Object.fromEntries(us.map(u=>[String(u._id),u]));
 const msgs=[...g.values()].map(m=>({...m,name:nm[m.from]&&nm[m.from].name,avatar:nm[m.from]&&nm[m.from].avatar})).sort((a,b)=>b.at-a.at);
 const items=await Notif.find({user:q.u.id}).sort('-createdAt').limit(20);
 r.json({msgUnread:um.length,msgs,unread:items.filter(x=>!x.read).length,items:items.map(x=>({_id:x._id,type:x.type,meta:x.meta||{},link:x.link,read:x.read,at:x.createdAt}))})}));
R.post('/notifs/read',auth(),h(async(q,r)=>{await Notif.updateMany({user:q.u.id,read:false},{read:true});r.json({ok:1})}));

// Edit (within 15 minutes) and delete (unsend) your own messages
R.patch('/messages/:mid',auth(),h(async(q,r)=>{const m=await Msg.findOne({_id:q.params.mid,from:q.u.id});if(!m||m.deleted)return r.status(404).json({error:'Message not found'});
 if(Date.now()-m.createdAt>15*60*1000)return r.status(400).json({error:'You can edit a message only within 15 minutes'});
 const text=String(q.body.text||'').trim().slice(0,1000);if(!text)return r.status(400).json({error:'Write a message'});m.text=text;m.edited=true;await m.save();r.json({ok:1})}));
R.delete('/messages/:mid',auth(),h(async(q,r)=>{const m=await Msg.findOne({_id:q.params.mid,from:q.u.id});if(!m)return r.status(404).json({error:'Message not found'});m.deleted=true;m.text='';await m.save();r.json({ok:1})}));

// Trust and safety: neighbours vouch for a hunarmand (3 vouches = verified badge); users can report profiles
R.post('/users/:id/vouch',auth(),h(async(q,r)=>{if(q.params.id===q.u.id)return r.status(400).json({error:'You cannot vouch for yourself'});const u=await User.findById(q.params.id);if(!u)return r.status(404).json({error:'Not found'});const i=u.endorse.map(String).indexOf(q.u.id);i<0?u.endorse.push(q.u.id):u.endorse.splice(i,1);await u.save();r.json({vouch:u.endorse.length})}));
R.post('/reports',auth(),h(async(q,r)=>{await Report.create({by:q.u.id,target:q.body.target,reason:String(q.body.reason||'').slice(0,300)});r.json({ok:1})}));

// AI Match: Claude reads the customer's need and the real service list, then picks the best 3 with a reason and a fair price.
// Method: keyword + rating pre-ranking (top 25) -> Claude re-ranks with reasoning -> ids are validated against the candidates -> fallback to keyword match if AI is off.
const words=s=>String(s).toLowerCase().split(/[^a-z0-9\u0600-\u06ff]+/).filter(w=>w.length>2);
R.post('/ai/match',auth(),h(async(q,r)=>{const need=String(q.body.need||'').slice(0,400);if(!need.trim())return r.status(400).json({error:'Tell us what you need'});
 const rt=await ratings(),all=(await Service.find().sort('-createdAt').limit(80).populate('owner')).filter(x=>x.owner),W=words(need),R_=x=>(rt[String(x.owner._id)]||{}).avg||0;
 const kw=x=>W.reduce((s,w)=>s+(`${x.title} ${x.description} ${x.category} ${x.owner.area||''}`.toLowerCase().includes(w)?1:0),0),score=x=>kw(x)+R_(x)/10;
 const cand=all.sort((a,b)=>score(b)-score(a)).slice(0,25),lst=cand.map(x=>({id:String(x._id),title:x.title,cat:x.category,price:x.price,area:x.owner.area||'',about:x.description.slice(0,120),rating:R_(x)||null,online:x.online}));
 const a=await ask('You are the matching engine of HerHunar, a marketplace of home-based women in Pakistan. Given a customer need and a list of services, pick the best 3 (fewer if few fit). Judge skill fit, rating, price and any place or time words in the need. Return JSON only: [{"id":"...","reason":"one short sentence in the same language as the need","price":number_fair_offer_in_PKR}].',[{role:'user',content:`Need: ${need}\nServices: ${JSON.stringify(lst)}`}]).catch(()=>null);
 let out=[];try{const ids=new Set(lst.map(x=>x.id));out=JSON.parse(a.replace(/```json|```/g,'')).filter(m=>ids.has(String(m.id))).slice(0,3)}catch(e){}
 const ai=out.length>0,fallbackReason=q.body.lang==='ur'?'آپ کے الفاظ سے مطابقت (بنیادی تلاش؛ AI دستیاب نہیں)۔':q.body.lang==='sd'?'توهان جي لفظن سان ملي ٿو (بنيادي ڳولا؛ AI موجود ناهي).':'Matches your words (basic matching, AI is off).';if(!ai)out=cand.filter(x=>kw(x)>0).slice(0,3).map(x=>({id:String(x._id),reason:fallbackReason,price:x.price}));
 const by=Object.fromEntries(cand.map(x=>[String(x._id),x]));
 r.json({ai,matches:out.filter(m=>by[m.id]).map(m=>({...m,service:{...by[m.id].toObject(),owner:{...pub(by[m.id].owner),rating:rt[String(by[m.id].owner._id)]}}}))})}));
R.post('/ai/price',auth('hunarmand'),h(async(q,r)=>{const b=sv(q.body),base={tailor:[700,1500],food:[300,800],beauty:[800,3000],tutor:[500,1500],online:[800,2500]}[b.category]||[500,1500],language=({en:'English',ur:'Urdu',sd:'Sindhi'})[q.body.lang]||'English';
 const a=await ask(`You advise home-based women in Pakistan on fair prices in PKR. Write the reason in ${language}. Return JSON only: {"min":number,"max":number,"reason":"one short sentence"}.`,[{role:'user',content:`Service: ${b.title}, category ${b.category}, area ${q.body.area||'unknown'}. ${b.description}`}]).catch(()=>null);
 try{r.json({...JSON.parse(a.replace(/```json|```/g,'')),ai:true})}catch(e){const reason=q.body.lang==='ur'?'اس ہنر کی عام قیمت کی حد (AI دستیاب نہیں ہے)۔':q.body.lang==='sd'?'هن هنر جي عام قيمت جي حد (AI موجود ناهي).':'Typical range for this category (AI is off).';r.json({min:base[0],max:base[1],reason,ai:false})}}));
app.use('/api',R);
app.models={User,Service,Order,Report,Post,Msg,Notif};module.exports=app;
