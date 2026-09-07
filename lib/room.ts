export type Person = 'boy' | 'girl';
export type Room = { lights:boolean; fairy:boolean; rain:boolean; music:boolean; candles:boolean; tea:boolean; plant:number; mode:string; boy:{x:number;y:number}; girl:{x:number;y:number}; names:{boy:string;girl:string}; notes:{text:string;by:string;at:number}[]; memories:{text:string;at:number}[]; updated:number; revision:number };
export const initialRoom:Room = {lights:true,fairy:true,rain:false,music:false,candles:false,tea:false,plant:0,mode:'idle',boy:{x:48,y:66},girl:{x:57,y:66},names:{boy:'Huzaifa',girl:'Rabia'},notes:[],memories:[],updated:0,revision:0};
export const actions=['hug','kiss','cuddle','dance','sleep','wake','lights','fairy','rain','music','candles','tea','plant','move','note','names'];
export function changeRoom(old:Room, action:string, payload:any, person:Person):Room {
 const s:Room=structuredClone(old); let memory='';
 if (['lights','fairy','rain','music','candles','tea'].includes(action)) { (s as any)[action]=!(s as any)[action]; if(action==='tea' && s.tea){s.mode='tea';s.boy={x:42,y:70};s.girl={x:50,y:70};memory='Tea for two. Nothing else to do.';} }
 else if(action==='plant'){s.plant++;memory='A little love for our plant.';}
 else if(action==='move'){if(!payload || !Number.isFinite(payload.x)||!Number.isFinite(payload.y)||payload.x<24||payload.x>76||payload.y<53||payload.y>82)throw Error('Choose a spot on the floor.');s[person]={x:payload.x,y:payload.y};s.mode='idle';}
 else if(action==='note'){const text=String(payload?.text??'').trim();if(!text||text.length>500)throw Error('Write a note between 1 and 500 characters.');s.notes=[{text,by:s.names[person],at:Date.now()},...s.notes].slice(0,30);memory='A little note was left in the room.';}
 else if(action==='names'){for(const p of ['boy','girl'] as const){const v=String(payload?.[p]??'').trim();if(!v||v.length>24)throw Error('Names must be 1–24 characters.');s.names[p]=v;}}
 else if(['hug','kiss','cuddle','dance','sleep','wake'].includes(action)){
 s.mode=action==='wake'?'idle':action;
 const points:Record<string,number[]>={hug:[47.5,66,53.5,66],kiss:[49.5,66,52.5,65.6],cuddle:[22,64,28,66],dance:[46,68,55,68],sleep:[66,44,73,46],wake:[48,66,57,66]};
 const p=points[action];s.boy={x:p[0],y:p[1]};s.girl={x:p[2],y:p[3]};
 if(action==='sleep')s.lights=false;
 if(action==='wake')s.lights=true;
 memory=({hug:'A hug that lasts as long as you need.',kiss:'One little kiss, across the distance.',cuddle:'Curled up together on the sofa.',dance:'A little dance in our living room.',sleep:'Goodnight. Right here, together.',wake:'Another day in our little room.'} as any)[action];
 }else throw Error('Unknown room action.');
 if(memory)s.memories=[{text:memory,at:Date.now()},...s.memories].slice(0,40);
 s.updated=Date.now();s.revision=old.revision+1;return s;
}


export function normalizeRoom(s:Room):Room {if(s.names.boy==='Him')s.names.boy='Huzaifa';if(s.names.girl==='Her')s.names.girl='Rabia';return s;}

