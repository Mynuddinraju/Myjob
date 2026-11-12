import Portfolio from '@/components/portfolio';
import {getHomepageTenant} from '@/lib/tenant';
import {db} from '@/lib/db';
import {fallbackTenant,fallbackServices} from '@/lib/public-fallback';
export const dynamic='force-dynamic';

export default async function Services(){
 const tenant=await getHomepageTenant();
 if(!tenant)return <Portfolio tenant={fallbackTenant} projects={[]} services={fallbackServices} page="services" root/>;
 const {data:services}=await db().from('services').select('*').eq('tenant_id',tenant.id).order('sort_order');
 return <Portfolio tenant={tenant} projects={[]} services={services||[]} page="services" root/>;
}
