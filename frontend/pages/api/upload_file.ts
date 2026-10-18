import { NextApiRequest, NextApiResponse } from 'next';
import { storage, saveFirestoreFile } from '@/lib/firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    return;
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      body = JSON.parse(body);
    }

    const { name, cleanName, summary, fileType, dataUrl, contentBase64 } = body || {};

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ error: 'Valid document name is required.' });
      return;
    }

    const allowedMimeTypes = ['application/pdf', 'text/plain', 'text/markdown', 'application/json'];
    const safeMimeType = allowedMimeTypes.includes(fileType) ? fileType : 'application/pdf';

    const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const sanitizedName = name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);
    const storagePath = `documents/${fileId}_${sanitizedName}`;

    let downloadUrl = `/api/get_items/${fileId}`;

    // If file content is provided, upload directly to Firebase Storage
    const uploadPayload =
      typeof dataUrl === 'string' && dataUrl.startsWith('data:')
        ? dataUrl
        : typeof contentBase64 === 'string' && contentBase64.length > 0
        ? `data:${safeMimeType};base64,${contentBase64}`
        : null;

    if (uploadPayload && storage) {
      try {
        const storageRef = ref(storage, storagePath);
        await uploadString(storageRef, uploadPayload, 'data_url');
        downloadUrl = await getDownloadURL(storageRef);
      } catch (storageErr) {
        console.warn('[Firebase Storage] Upload warning, falling back to local proxy:', storageErr);
      }
    }

    const fileRecord = {
      id: fileId,
      name: sanitizedName,
      clean_name: (typeof cleanName === 'string' && cleanName.trim() ? cleanName.trim() : name.replace(/\.[^/.]+$/, '')).slice(0, 120),
      type: safeMimeType,
      summary: (typeof summary === 'string' && summary.trim() ? summary.trim() : `Uploaded assurance document bundle: ${sanitizedName}`).slice(0, 1000),
      storage_path: storagePath,
      url: downloadUrl
    };

    await saveFirestoreFile(fileRecord);

    res.status(200).json({
      message: 'Document uploaded and registered in Firebase successfully.',
      file: fileRecord
    });
  } catch (error) {
    console.error('[API /api/upload_file] Error:', error);
    const message = error instanceof Error ? error.message : 'Upload failed';
    res.status(500).json({ error: message });
  }
}
