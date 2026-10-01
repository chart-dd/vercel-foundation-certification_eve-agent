import { defineTool } from 'eve/tools';
import { z } from 'zod';
import { listProducts } from '../../lib/api.js';

export default defineTool({
  description:
    'List products from the Vercel Swag Store catalog. Supports pagination, filtering by category, search term, and featured status.',
  inputSchema: z.object({
    page: z.number().int().min(1).optional(),
    limit: z.number().int().min(1).max(100).optional(),
    category: z.string().optional(),
    search: z.string().optional(),
    featured: z.enum(['true', 'false']).optional(),
  }),
  async execute(input) {
    return listProducts(input);
  },
});
