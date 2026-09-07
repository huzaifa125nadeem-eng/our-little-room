import { roomDb } from '@/db/room';
import { initialRoom, changeRoom, actions } from '@/lib/room';
const headers={'Cache-Control':'no-store'};
const json=(body:any,status=200)=>Response.json(body,{status,headers});
function key(req:Request){const id=req.headers.get('x-room-key');if(!id||!/^[a-f0-9]{64}$/.test(id))throw Error('A valid room key is required.');return id;}
export async function GET(req:Request){try{const id=key(req);const row=await roomDb().prepare('SELECT state FROM rooms WHERE id = ?').bind(id).first<{state:string}>();return json({state:row?JSON.parse(row.state):initialRoom});}catch(e){return json({error:(e as Error).message},400);}}
export async function POST(req:Request){
 try{
 if(req.headers.get('origin') && req.headers.get('origin')!==new URL(req.url).origin)return json({error:'Invalid origin.'},403);
 const id=key(req);const raw=await req.text();if(raw.length>3000)return json({error:'Request too large.'},413);
 const data=JSON.parse(raw);if(!actions.includes(data.action)||!['boy','girl'].includes(data.person))return json({error:'Invalid action.'},400);
 const db=roomDb();await db.prepare('INSERT OR IGNORE INTO rooms (id,state,revision) VALUES (?,?,0)').bind(id,JSON.stringify(initialRoom)).run();
 for(let attempt=0;attempt<4;attempt++){
 const row=await db.prepare('SELECT state,revision FROM rooms WHERE id=?').bind(id).first<{state:string;revision:number}>();
 if(!row)throw Error('Room could not be loaded.');
 const state=changeRoom(JSON.parse(row.state),data.action,data.payload,data.person);
 const result=await db.prepare('UPDATE rooms SET state=?,revision=? WHERE id=? AND revision=?').bind(JSON.stringify(state),state.revision,id,row.revision).run();
 if(result.meta.changes)return json({state});
 }return json({error:'The room changed. Please try again.'},409);
 }catch(e){return json({error:(e as Error).message},400);}
}
