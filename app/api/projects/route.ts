import {currentMember,err,reply,active} from '@/lib/db';import {projectSchema} from '@/lib/validation';import {cloud} from '@/lib/cloud';
export async function GET(req:Request){const ctx=await currentMember(req);if(!ctx)return err('Unauthorized',401);const {data,error}=await ctx.client.from('projects').select('*,photos(*)').eq('tenant_id',ctx.tenant.id).order('sort_order');return error?err(error):reply({projects:data})}
export async function POST(req:Request){const ctx=await currentMember(req);if(!ctx)return err('Unauthorized',401);if(!active(ctx.tenant))return err('Workspace inactive',403);try{const input=projectSchema.parse(await req.json());const {data,error}=await ctx.client.from('projects').insert({...input,tenant_id:ctx.tenant.id}).select().single();if(error)throw error;return reply({project:data})}catch(e){return err(e)}}
export async function PATCH(req:Request){const ctx=await currentMember(req);if(!ctx)return err('Unauthorized',401);if(!active(ctx.tenant))return err('Workspace inactive',403);try{const body=await req.json();const id=String(body.id||'');const input=projectSchema.partial().parse(body);const {error}=await ctx.client.from('projects').update(input).eq('id',id).eq('tenant_id',ctx.tenant.id);if(error)throw error;return reply({ok:true})}catch(e){return err(e)}}
export async function DELETE(req:Request){const ctx=await currentMember(req);if(!ctx)return err('Unauthorized',401);const id=new URL(req.url).searchParams.get('id');if(!id)return err('Missing id');try{if(!active(ctx.tenant))return err('Workspace inactive',403);
 const {data:photos,error:photoError}=await ctx.client.from('photos').select('cloud_public_id,before_public_id').eq('project_id',id).eq('tenant_id',ctx.tenant.id);
 if(photoError)throw photoError;
 for(const photo of photos||[])for(const publicId of [photo.cloud_public_id,photo.before_public_id])if(publicId){
  const result=await cloud().uploader.destroy(publicId);
  if(result.result!=='ok'&&result.result!=='not found')throw new Error('Could not remove Cloudinary asset');
 }
 const {error}=await ctx.client.from('projects').delete().eq('id',id).eq('tenant_id',ctx.tenant.id);
 return error?err(error):reply({ok:true});
 }catch(e){return err(e,502)}}
