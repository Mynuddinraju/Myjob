import {headers} from 'next/headers';
import {active,db} from './db';

export async function getTenant(slug?:string){
 const h=await headers();
 const hostname=(h.get('host')||'').split(':')[0].toLowerCase();
 const q=db().from('tenants').select('id,slug,name,tagline,logo_url,phone,email,address,whatsapp,hero_url,status,trial_ends_at,custom_domain');
 const {data}=await (slug?q.eq('slug',slug):q.eq('custom_domain',hostname)).maybeSingle();
 return active(data)?data:null;
}

/**
 * The platform domain is a PUBLIC viewer website, never an auth landing page.
 * Match a verified custom-domain mapping first; then the configured homepage
 * tenant. For fresh installs with precisely one active tenant, use that tenant
 * automatically so the owner need not configure another environment variable.
 */
export async function getHomepageTenant(){
 const domainTenant=await getTenant();
 if(domainTenant)return domainTenant;
 const defaultSlug=process.env.DEFAULT_TENANT_SLUG?.trim();
 if(defaultSlug)return getTenant(defaultSlug);
 const {data,error}=await db().from('tenants')
  .select('id,slug,name,tagline,logo_url,phone,email,address,whatsapp,hero_url,status,trial_ends_at,custom_domain')
  .in('status',['active','trial']).order('created_at',{ascending:true}).limit(3);
 if(error)return null;
 const eligible=(data||[]).filter(active);
 // Multiple tenants must not be arbitrarily promoted to the platform homepage.
 return eligible.length===1?eligible[0]:null;
}
