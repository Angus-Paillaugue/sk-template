import { Flag, Flags } from './flags';

export const flags = new Flags();

flags.addFlag(
  new Flag({
    key: 'appActionButtons',
    description: 'Wether to show the secondary nav buttons',
    decide(visitorId) {
      let hash = 0;
      for (let i = 0; i < visitorId.length; i++)
        hash = (hash << 5) - hash + visitorId.charCodeAt(i);
      return Math.abs(hash) % 2 === 0;
    },
  })
);
