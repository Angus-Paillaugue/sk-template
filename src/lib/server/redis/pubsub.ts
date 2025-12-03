import redis from '.';

export class PubSub {
  static async publish(channel: string, message: string) {
    await redis.publish(channel, message);
  }

  static async subscribe(channel: string, callback: (message: string) => void) {
    const subscriber = redis.duplicate();
    await subscriber.connect();
    await subscriber.subscribe(channel, (message) => {
      callback(message);
    });
    return subscriber;
  }
}
