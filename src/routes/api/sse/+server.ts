import { PubSub } from '$lib/server/redis/pubsub';
import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
  const channel = url.searchParams.get('channel');
  if (!channel) {
    return new Response('Missing channel parameter', { status: 400 });
  }

  let subscriber: Awaited<ReturnType<typeof PubSub.subscribe>> | null = null;
  let heartbeat: ReturnType<typeof setInterval>;

  const stream = new ReadableStream({
    async start(controller) {
      // Heartbeat to keep connection alive
      heartbeat = setInterval(() => {
        controller.enqueue(':\n\n');
      }, 15000);

      subscriber = await PubSub.subscribe(channel, (message) => {
        try {
          controller.enqueue(`data: ${message}\n\n`);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          // Ignore if controller is closed
        }
      });
    },
    async cancel() {
      clearInterval(heartbeat);
      if (subscriber && typeof subscriber.unsubscribe === 'function') {
        await subscriber.unsubscribe();
      } else if (subscriber && typeof subscriber.quit === 'function') {
        await subscriber.quit();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
};

export const POST = async ({ request }) => {
  const { channel, message } = await request.json();
  try {
    await PubSub.publish(channel, message);
    return json({ status: 'ok' });
  } catch (e) {
    return json({ status: 'error', msg: e instanceof Error ? e.message : 'Unknown error' });
  }
};
