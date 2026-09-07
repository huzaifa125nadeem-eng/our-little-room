import assert from 'node:assert/strict';
const url='http://localhost:3000/api/room';
const key=crypto.randomUUID().replaceAll('-','').repeat(2);
const headers={'content-type':'application/json','x-room-key':key};
async function get(k=key){const r=await fetch(url,{headers:{'x-room-key':k}});assert.equal(r.status,200);return (await r.json()).state;}
async function action(action,payload,person='boy'){const r=await fetch(url,{method:'POST',headers,body:JSON.stringify({action,payload,person})});assert.equal(r.status,200,await r.clone().text());return(await r.json()).state;}
const start=await get();assert.equal(start.revision,0);
await action('names',{boy:'Test A',girl:'Test B'});
await action('hug');assert.equal((await get()).mode,'hug');
await action('sleep');let state=await get();assert.equal(state.mode,'sleep');assert.equal(state.lights,false);
await action('note',{text:'Still here tomorrow.'},'girl');state=await get();assert.equal(state.notes[0].by,'Test B');assert.equal(state.notes[0].text,'Still here tomorrow.');assert.equal(state.mode,'sleep');
const before=state.revision;await Promise.all([action('rain'),action('candles')]);state=await get();assert.equal(state.revision,before+2);assert.equal(state.rain,true);assert.equal(state.candles,true);
await action('wake');await action('move',{x:54,y:73},'girl');assert.deepEqual((await get()).girl,{x:54,y:73});
const invalid=await fetch(url,{method:'POST',headers,body:JSON.stringify({action:'move',person:'boy',payload:{x:300,y:-1}})});assert.equal(invalid.status,400);
const empty=await fetch(url,{method:'POST',headers,body:JSON.stringify({action:'note',person:'boy',payload:{text:''}})});assert.equal(empty.status,400);
assert.equal((await get('b'.repeat(64))).revision,0);
assert.equal((await fetch(url)).status,400);
console.log('PASS: saved state, sleep restoration, notes, concurrent writes, movement, validation, room isolation.');
