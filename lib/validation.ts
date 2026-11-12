import {z} from 'zod';
export const projectSchema=z.object({title:z.string().trim().min(1).max(140),description:z.string().max(500).default(''),category:z.string().max(60).default('Completed Work'),featured:z.boolean().default(false),sort_order:z.number().int().min(0).max(99999).default(0)});
export const serviceSchema=z.object({title:z.string().trim().min(1).max(100),description:z.string().max(2000).default(''),image_url:z.string().url().nullable().optional(),sort_order:z.number().int().default(0)});
