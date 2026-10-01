import { defineAgent } from 'eve';

export default defineAgent({
  description:
    "Investigate a topic on the open web and return a concise written brief with sources. Use when the parent needs fresh external information like recent announcements, product launches, or industry trends that is not already in the parent's tools or context.",
  model: 'anthropic/claude-sonnet-4.6',
});
