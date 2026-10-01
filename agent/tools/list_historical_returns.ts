import { defineTool } from 'eve/tools';
import { z } from 'zod';
import { listHistoricalReturns } from '../../lib/api.js';

export default defineTool({
  description:
    'List historical customer returns within a date range. Includes items, decision, refund amount, and order summary. History available for ~180 days.',
  inputSchema: z.object({
    from: z.string().optional().describe('ISO 8601 or YYYY-MM-DD'),
    to: z.string().optional().describe('ISO 8601 or YYYY-MM-DD'),
    status: z.enum(['pending', 'processing', 'completed']).optional(),
    decision: z.enum(['approved', 'rejected', 'needs_info']).optional(),
    limit: z.number().int().min(1).max(500).optional(),
  }),
  async execute(input) {
    return listHistoricalReturns(input);
  },
});
