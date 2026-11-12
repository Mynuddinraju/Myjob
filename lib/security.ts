import bcrypt from 'bcryptjs';import {SignJWT,jwtVerify} from 'jose';import {cookies} from 'next/headers';
const key=()=>new TextEncoder().encode(process.env.SUPER_ADMIN_SESSION_SECRET||'');
export async function checkSuperPassword(email:string,password:string){const configured=process.env.SUPER_ADMIN_EMAIL||'';const hash=process.env.SUPER_ADMIN_PASSWORD_HASH||'';if(!configured||!hash||!process.env.SUPER_ADMIN_SESSION_SECRET||key().length<32)return false;return email.toLowerCase()===configured.toLowerCase()&&await bcrypt.compare(password,hash)}
export async function signSuper(){return new SignJWT({role:'super'}).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('8h').sign(key())}
export async function isSuper(){try{const cookie=(await cookies()).get('hst_super')?.value;if(!cookie)return false;const {payload}=await jwtVerify(cookie,key());return payload.role==='super'}catch{return false}}
