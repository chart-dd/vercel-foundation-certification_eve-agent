import { defineTool } from 'eve/tools';
import { z } from 'zod';
import { listStockLevelForProducts } from '../../lib/api.js';

export default defineTool({
  description:
    'List current stock levels. Sorted by stock ascending so out-of-stock and low-stock items appear first, useful for restock prioritization.',
  inputSchema: z.object({
    productIds: z.string().optional().describe('Comma-separated product IDs'),
    lowStock: z.enum(['true', 'false']).optional(),
    inStock: z.enum(['true', 'false']).optional(),
    page: z.number().int().min(1).optional(),
    limit: z.number().int().min(1).max(200).optional(),
  }),
  async execute(input) {
    return listStockLevelForProducts(input);
  },
});
