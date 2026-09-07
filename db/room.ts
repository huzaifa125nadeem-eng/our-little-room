import { env } from 'cloudflare:workers';
export function roomDb(){ if(!env.DB) throw Error('Room storage is unavailable.');return env.DB; }
