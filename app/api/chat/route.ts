import { env } from 'cloudflare:workers';
import { roomDb } from '@/db/room';
import { chatPayload,MODEL,type ChatMessage } from '@/lib/chat';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
function key(req:Request){const k=req.headers.get('x-room-key');if(!k||!/^[a-f0-9]{64}$/.test(k))throw Error('Invalid room');return k;}
export async function GET(req:Request){try{const id=key(req);const row=await roomDb().prepare('SELECT messages FROM chats WHERE id=?').bind(id).first<{messages:string}>();return json({configured:!!env.GEMINI_API_KEY,messages:row?JSON.parse(row.messages):[]});}catch{return json({error:'Could not load chat. Please try again.'},400)}}
export async function POST(req:Request){
 let locked=false,id='',db:ReturnType<typeof roomDb>|undefined;
 try{
 if(req.headers.get('origin')&&req.headers.get('origin')!==new URL(req.url).origin)return json({error:'Invalid origin.'},403);
 id=key(req);const raw=await req.text();if(raw.length>2500)return json({error:'Message too long.'},413);
 const data=JSON.parse(raw);const text=typeof data.text==='string'?data.text.trim():'';const requestId=typeof data.requestId==='string'?data.requestId:'';
 if(!text||text.length>500||!/^[a-zA-Z0-9-]{20,64}$/.test(requestId))return json({error:'Write between 1 and 500 characters.'},400);
 if(!env.GEMINI_API_KEY)return json({error:'AI Huzaifa is not connected yet.'},503);
 db=roomDb();await db.prepare('INSERT OR IGNORE INTO chats (id) VALUES (?)').bind(id).run();
 const lock=await db.prepare('UPDATE chats SET busy_until=? WHERE id=? AND busy_until<?').bind(Date.now()+45000,id,Date.now()).run();
 if(!lock.meta.changes)return json({error:'A reply is already on its way. Try again in a moment.'},429);locked=true;
 const row=await db.prepare('SELECT messages,request_id FROM chats WHERE id=?').bind(id).first<{messages:string;request_id:string}>();
 if(row && row.request_id===requestId)return json({messages:JSON.parse(row.messages)});
 const quota=await db.prepare('INSERT INTO chat_budget (id,day,count) VALUES (?,?,1) ON CONFLICT(id) DO UPDATE SET day=excluded.day,count=CASE WHEN chat_budget.day=excluded.day THEN chat_budget.count+1 ELSE 1 END WHERE chat_budget.day!=excluded.day OR chat_budget.count<100').bind('site',new Date().toISOString().slice(0,10)).run();
 if(!quota.meta.changes)return json({error:'Today’s 100-message limit is reached. It resets at midnight UTC.'},429);
 const messages:ChatMessage[]=row?JSON.parse(row.messages):[];
 const response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,{method:'POST',headers:{'x-goog-api-key':env.GEMINI_API_KEY,'Content-Type':'application/json'},body:JSON.stringify(chatPayload(messages,text)),signal:AbortSignal.timeout(25000)});
 if(!response.ok)return json({error:response.status===429?'Gemini’s quota is reached. Please try later.':response.status===503?'Gemini is busy right now. Your message is still here—try again shortly.':'AI Huzaifa could not reply. Please try again later.'},502);
 const result=await response.json() as {candidates?:{content?:{parts?:{text?:string;thought?:boolean}[]};finishReason?:string}[]};
 const reply=result.candidates?.[0]?.content?.parts?.filter(p=>!p.thought).map(p=>p.text||'').join('').trim();
 if(!reply)return json({error:'No reply came through. Try rephrasing your message.'},502);
 const next:ChatMessage[]=[...messages,{role:'user',text},{role:'model',text:reply}].slice(-60) as ChatMessage[];
 await db.prepare('UPDATE chats SET messages=?,request_id=? WHERE id=?').bind(JSON.stringify(next),requestId,id).run();return json({messages:next});
 }catch{return json({error:'The reply timed out or could not be saved. Please try again.'},502)}finally{if(locked&&db)await db.prepare('UPDATE chats SET busy_until=0 WHERE id=?').bind(id).run();}
}

