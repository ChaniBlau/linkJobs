// import { ExpressAdapter } from '@bull-board/express';
// import { createBullBoard } from '@bull-board/api';
// import { scrapeQueue } from '../queue/scrapeQueue';

// import express from 'express';

// const serverAdapter = new ExpressAdapter();
// serverAdapter.setBasePath('/admin/queues');

// createBullBoard({
//   queues: [
//     {
//       type: 'bullmq',
//       queue: scrapeQueue,
//     },
//   ],
//   serverAdapter,
// });

// export const bullBoardRouter = serverAdapter.getRouter();


import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { scrapeQueue } from '../queue/scrapeQueue';

// 👇 מתאם Express
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

// ✅ הגדרה תקינה לפי הדרישות החדשות
createBullBoard({
  queues: [new BullMQAdapter(scrapeQueue)],
  serverAdapter,
});

export const bullBoardRouter = serverAdapter.getRouter();
