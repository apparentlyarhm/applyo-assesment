import type { NextApiRequest, NextApiResponse } from 'next';
import UserData from '@/config/db-schema-and-stuff';
import dbConnect from '@/lib/db-con';
import { getUserIdFromRequest } from '@/utils/auth-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = getUserIdFromRequest(req);

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await dbConnect();

  // --- HANDLE SAVING DATA (UPLOADING) ---
  if (req.method === 'PUT') {
    try {
      const { boards, clientUpdatedAt } = req.body;
      console.log(req.body)
      const existing = await UserData.findOne({ userId });

      if (existing && clientUpdatedAt && new Date(existing.updatedAt) > new Date(clientUpdatedAt)) {
        return res.status(409).json({
          success: false,
          message: 'Remote data is newer. Please fetch first.'
        });
      }

      const updatedData = await UserData.findOneAndUpdate(
        { userId: userId },
        { $set: { boards: boards } }, // Overwrite the boards array
        {
          new: true,    // Return the new, updated document
          upsert: true  // IMPORTANT: Create the document if it doesn't exist
        }
      );

      return res.status(200).json({ success: true, data: updatedData });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Server error during sync.' });

    }
  }

  // --- HANDLE FETCHING DATA (DOWNLOADING) ---
  if (req.method === 'GET') {
    try {
      const userData = await UserData.findOne({ userId: userId });

      if (!userData) {
        return res.status(404).json({ success: false, message: 'No saved data found for this user.' });
      }

      return res.status(200).json({ success: true, data: userData });

    } catch (error) {
      return res.status(500).json({ success: false, message: 'Server error during fetch.' });

    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}