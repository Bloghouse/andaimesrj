import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: z.string().optional(),
	}),
});

const servicos = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		description: z.string(),
		icon: z.string().optional(),
		heroImage: z.string().optional(),
		order: z.number().default(0),
		characteristics: z.array(z.string()).optional(),
		specs: z.record(z.string(), z.string()).optional(),
	}),
});

export const collections = { blog, servicos };
