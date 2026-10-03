import { NextApiRequest, NextApiResponse } from 'next';
import { getFirestoreById, getFirestoreAll } from '@/lib/firebase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const {
    query: { table, uuid },
    method
  } = req;

  switch (method) {
    case 'GET':
      try {
        if (!table || typeof table !== 'string') {
          res.status(400).json({ error: 'Table parameter is required' });
          return;
        }

        if (uuid && typeof uuid === 'string') {
          const item = await getFirestoreById(table, uuid);
          if (!item) {
            res.status(404).json({ error: 'Item not found in Firestore' });
            return;
          }
          res.status(200).json(item);
        } else {
          const items = await getFirestoreAll(table);
          res.status(200).json(items);
        }
      } catch (error) {
        console.error(`[API /api/item/${table}] Error querying Firestore:`, error);
        const message = error instanceof Error ? error.message : 'Database error';
        res.status(500).json({ error: message });
      }
      break;
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
