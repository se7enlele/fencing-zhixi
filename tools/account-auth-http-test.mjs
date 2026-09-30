import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, writeFile, unlink, rmdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { digest } from './account-security.mjs';
const dir=await mkdtemp(path.join(tmpdir(),'fencing-account-'));
const file=path.join(dir,'users.json');
await writeFile(file,'{}');
const port=5213, base=`http://127.0.0.1:${port}`;
const server=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),USER_FOLLOWS_PATH:file,RESEND_API_KEY:'',AUTH_EMAIL_FROM:''},stdio:['ignore','pipe','pipe']});
async function api(route, body, token) {
 const r=await fetch(base+route,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},...(body?{body:JSON.stringify(body)}:{})});
 return {status:r.status,...await r.json()};
}
async function seedCode(purpose) {
 const data=JSON.parse(await readFile(file,'utf8'));data.authCodes ||= {};
 data.authCodes[`auth-code:${purpose}:${await digest('email:test@example.com')}`]={hash:await digest(`email:test@example.com:${purpose}:12345678`),attempts:0,used:false,sentAt:Date.now(),expiresAt:Date.now()+600000};
 await writeFile(file,JSON.stringify(data));
}
try {
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('server timeout')),10000);server.stdout.on('data',chunk=>{if(String(chunk).includes(base)){clearTimeout(timer);resolve();}});server.once('exit',()=>{clearTimeout(timer);reject(Error('server exited'));});});
 assert.equal((await api('/api/auth/config')).emailVerification,false);
 assert.equal((await api('/api/auth/login',{identifier:'missing@example.com',code:'123456'})).status,400);
 const fields={identifier:'test@example.com',password:'a-long-password',confirmPassword:'a-long-password',verificationCode:'12345678'};
 assert.equal((await api('/api/auth/register',fields)).status,400);
 await seedCode('register');
 assert.equal((await api('/api/auth/register',fields)).status,200);
 const login=await api('/api/auth/login',{identifier:fields.identifier,code:fields.password});assert.equal(login.status,200);assert.ok(login.token);
 assert.equal((await api('/api/auth/me',null,login.token)).status,200);
 await api('/api/me/profile',{follows:[{id:'preserved'}]},login.token);
 await seedCode('reset');
 assert.equal((await api('/api/auth/reset-password',{...fields,password:'a-new-password',confirmPassword:'a-new-password'})).status,200);
 assert.equal((await api('/api/auth/me',null,login.token)).status,401);
 assert.equal((await api('/api/auth/login',{identifier:fields.identifier,code:fields.password})).status,400);
 const next=await api('/api/auth/login',{identifier:fields.identifier,code:'a-new-password'});assert.equal(next.status,200);
 assert.equal(next.profile.follows[0].id,'preserved');
 assert.equal((await api('/api/auth/logout',{},next.token)).status,200);
 assert.equal((await api('/api/auth/me',null,next.token)).status,401);
 console.log('local HTTP: explicit verified registration, login, recovery, profile preservation, old-session rejection and logout passed');
} finally {
 server.kill();
 await new Promise(resolve=>server.exitCode!==null?resolve():server.once('exit',resolve));
 await unlink(file);await rmdir(dir);
}
