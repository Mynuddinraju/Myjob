import {createClient} from '@supabase/supabase-js';
export function db(){return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!,{auth:{autoRefreshToken:false,persistSession:false}})}
export function browserDb(){return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)}
export function active(t:any){return t && ['active','trial'].includes(t.status) && (!t.trial_ends_at || new Date(t.trial_ends_at).getTime()>Date.now());}
export async function currentMember(req:Request){const token=req.headers.get('authorization')?.replace(/^Bearer /i,''); if(!token)return null;const client=db();const {data:{user},error}=await client.auth.getUser(token);if(error||!user)return null;const {data:member}=await client.from('tenant_users').select('tenant_id,role').eq('user_id',user.id).maybeSingle();if(!member)return null;const {data:tenant}=await client.from('tenants').select('*').eq('id',member.tenant_id).maybeSingle();return {user,member,tenant,client};}
export function reply(data:any,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store'}})}
export function err(e:any,status=400){return reply({error:typeof e==='string'?e:e?.message||'Request failed'},status)}
