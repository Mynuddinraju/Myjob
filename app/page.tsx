import Portfolio from '@/components/portfolio';
import {getHomepageTenant} from '@/lib/tenant';
import {db} from '@/lib/db';
import {fallbackTenant,fallbackServices} from '@/lib/public-fallback';
export const dynamic='force-dynamic';

export default async function Home(){
 const tenant=await getHomepageTenant();
 if(!tenant)return <Portfolio tenant={fallbackTenant} projects={[]} services={fallbackServices} root/>;
 const client=db();
 const [{data:projects},{data:services}]=await Promise.all([
  client.from('projects').select('*,photos(*)').eq('tenant_id',tenant.id).order('sort_order'),
  client.from('services').select('*').eq('tenant_id',tenant.id).order('sort_order')
 ]);
 return <Portfolio tenant={tenant} projects={projects||[]} services={services||[]} root/>;
}
