import { FlagDAO } from '$lib/server/db/flag';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PubSub } from '$lib/server/redis/pubsub';

export const POST: RequestHandler = async ({ request }) => {
  const { flagKey, value } = await request.json();

  const flag = await FlagDAO.getFlag(flagKey);
  if (!flag) {
    return json({ success: false, error: 'Flag not found' }, { status: 404 });
  }
  await FlagDAO.overrideFlag(flagKey, value);

  PubSub.publish('flags:update', JSON.stringify({ flagKey, value }));

  return json({ success: true });
};
