import {currentMember,err,reply,active} from '@/lib/db';
import {cloud,uploadWebp} from '@/lib/cloud';
export const runtime='nodejs';
export async function POST(req:Request){
 const ctx=await currentMember(req);if(!ctx)return err('Unauthorized',401);
 if(!active(ctx.tenant))return err('Workspace inactive',403);
 let reservedId:string|undefined;let uploadedPublicId:string|undefined;
 try{
 const form=await req.formData();const file=form.get('file');const projectId=String(form.get('project_id')||'');
 const beforeId=String(form.get('before_photo_id')||'');const caption=String(form.get('caption')||'').slice(0,200);
 if(!(file instanceof File)||file.type!=='image/webp'||file.size>2_000_000)return err('Optimized WebP under 2MB required');
 const bytes=Buffer.from(await file.arrayBuffer());
 if(bytes.subarray(0,4).toString()!=='RIFF'||bytes.subarray(8,12).toString()!=='WEBP')return err('Invalid WebP');
 const {data:project}=await ctx.client.from('projects').select('id').eq('id',projectId).eq('tenant_id',ctx.tenant.id).maybeSingle();
 if(!project)return err('Project not found',404);
 let existing:any=null;
 if(beforeId){const q=await ctx.client.from('photos').select('id,before_public_id').eq('id',beforeId).eq('project_id',projectId).eq('tenant_id',ctx.tenant.id).eq('status','ready').maybeSingle();existing=q.data;if(!existing)return err('After photo does not exist',404)}
 else {const {data:id,error}=await ctx.client.rpc('reserve_photo_slot',{p_tenant:ctx.tenant.id,p_project:projectId,p_caption:caption});if(error)throw error;reservedId=id;}
 const uploaded=await uploadWebp(bytes,`portfolios/${ctx.tenant.id}`);uploadedPublicId=uploaded.public_id;
 if(existing){const {error}=await ctx.client.from('photos').update({before_public_id:uploaded.public_id,before_url:uploaded.secure_url}).eq('id',existing.id).eq('tenant_id',ctx.tenant.id);if(error)throw error;if(existing.before_public_id)await cloud().uploader.destroy(existing.before_public_id).catch(()=>{});}
 else {const {error}=await ctx.client.from('photos').update({cloud_public_id:uploaded.public_id,image_url:uploaded.secure_url,status:'ready'}).eq('id',reservedId).eq('tenant_id',ctx.tenant.id);if(error)throw error;}
 uploadedPublicId=undefined;return reply({ok:true,id:existing?.id||reservedId});
 }catch(e){if(uploadedPublicId)await cloud().uploader.destroy(uploadedPublicId).catch(()=>{});if(reservedId)await ctx.client.from('photos').delete().eq('id',reservedId).eq('tenant_id',ctx.tenant.id);return err(e)}
}
export async function PATCH(req:Request){const ctx=await currentMember(req);if(!ctx)return err('Unauthorized',401);if(!active(ctx.tenant))return err('Workspace inactive',403);try{const {id,caption,sort_order}=await req.json();const values:any={};if(typeof caption==='string')values.caption=caption.slice(0,200);if(Number.isInteger(sort_order))values.sort_order=sort_order;const {error}=await ctx.client.from('photos').update(values).eq('id',id).eq('tenant_id',ctx.tenant.id);return error?err(error):reply({ok:true})}catch(e){return err(e)}}
export async function DELETE(req:Request){const ctx=await currentMember(req);if(!ctx)return err('Unauthorized',401);if(!active(ctx.tenant))return err('Workspace inactive',403);const params=new URL(req.url).searchParams;const id=params.get('id'),beforeId=params.get('before_id');const {data:photo}=await ctx.client.from('photos').select('id,cloud_public_id,before_public_id').eq('id',id||beforeId).eq('tenant_id',ctx.tenant.id).maybeSingle();if(!photo)return err('Not found',404);try{if(beforeId){if(photo.before_public_id)await cloud().uploader.destroy(photo.before_public_id);const {error}=await ctx.client.from('photos').update({before_public_id:null,before_url:null}).eq('id',photo.id);return error?err(error):reply({ok:true})}for(const publicId of [photo.cloud_public_id,photo.before_public_id])if(publicId)await cloud().uploader.destroy(publicId);const {error}=await ctx.client.from('photos').delete().eq('id',photo.id).eq('tenant_id',ctx.tenant.id);return error?err(error):reply({ok:true})}catch(e){return err(e,502)}}
