import { SupabaseClient } from '@supabase/supabase-js';
import {
  createSupabaseAdminClient,
  supabaseAdminClient,
} from './supabase-client';
import { base64ToBuffer } from './utils/base64-to-buffer';
import { getBase64MimeType } from './utils/get-base64-mime-type';

export async function supabaseUploadAssest(
  fileName: string,
  base64: string,
  bucket: string = 'images',
  sbAdminClient?: SupabaseClient
): Promise<{
  path: string;
  fullPath: string;
  fileName: string;
}> {
  if (!fileName || !base64) {
    throw new Error('File name and base64 string are required');
  }

  sbAdminClient ??= supabaseAdminClient ?? createSupabaseAdminClient();

  const buffer = base64ToBuffer(base64);
  const mimetype = getBase64MimeType(base64);
  const fileExtension = mimetype ? mimetype.split('/')[1] : 'png'; // Default to png if no mimetype found
  fileName = `${fileName}.${fileExtension}`; // Ensure the file name has an extension

  const { data, error } = await sbAdminClient.storage
    .from(bucket)
    .upload(fileName, buffer, {
      contentType: mimetype ?? 'image/png', // Adjust content type as needed
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  return {
    path: data.path,
    fullPath: data.fullPath,
    fileName,
  };
}
