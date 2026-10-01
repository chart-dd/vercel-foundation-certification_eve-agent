import { defineTool } from 'eve/tools';
import { z } from 'zod';
import { getProductDetails } from '../../lib/api.js';

export default defineTool({
  description:
    'Get details for a single product in the Vercel Swag Store catalog by its ID or slug.',
  inputSchema: z.object({
    idOrSlug: z.string().describe('Product ID (e.g. tshirt_001) or slug'),
  }),
  async execute(input) {
    return getProductDetails(input.idOrSlug);
  },
});
