import { defineTool } from 'eve/tools';
import { z } from 'zod';
import { salesTotalsByProduct } from '../../lib/api.js';

export default defineTool({
  description:
    'Sales totals for a date range, broken down by product. Sorted by units sold descending so bestsellers appear first. Available for ~180 days.',
  inputSchema: z.object({
    from: z.string().optional(),
    to: z.string().optional(),
    productId: z.string().optional(),
  }),
  async execute(input) {
    return salesTotalsByProduct(input);
  },
});
