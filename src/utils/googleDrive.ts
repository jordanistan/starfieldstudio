import { google } from 'googleapis';
import { authenticate } from '@google-cloud/local-auth';

const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];

export async function getPhotos(folderId: string) {
  try {
    const auth = await authenticate({
      scopes: SCOPES,
      keyfilePath: 'path/to/your/credentials.json',
    });

    const drive = google.drive({ version: 'v3', auth });
    
    const response = await drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'image/'`,
      fields: 'files(id, name, thumbnailLink, webContentLink)',
      pageSize: 100,
    });

    return response.data.files;
  } catch (error) {
    console.error('Error fetching photos:', error);
    throw error;
  }
}