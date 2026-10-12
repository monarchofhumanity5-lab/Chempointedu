const fs = require('fs');
const tus = require('tus-js-client');
const { createClient } = require('@supabase/supabase-js');

const rawUrl = process.env.SUPABASE_URL || '';
const url = rawUrl.replace(/\/rest\/v1\/?$/, '');
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(url, serviceKey);

async function main() {
  const filePath = `test_uploads/tus_37mb_${Date.now()}.pdf`;
  console.log('Requesting signed upload URL for:', filePath);

  const { data: signedData, error: signedError } = await supabase.storage
    .from('study-materials')
    .createSignedUploadUrl(filePath);

  if (signedError) {
    console.error('Sign error:', signedError);
    process.exit(1);
  }

  console.log('Signed token obtained. Initializing 37MB buffer...');
  const size = 37 * 1024 * 1024;
  const buf = Buffer.alloc(size, '%PDF-1.4 37MB Organic Chemistry Reference Manual Data Stream\n');

  const projectId = 'lrhsiwxcvdwhfzcecjek';
  const endpoint = `https://${projectId}.storage.supabase.co/storage/v1/upload/resumable/sign`;

  const startTime = Date.now();
  const upload = new tus.Upload(buf, {
    endpoint: endpoint,
    retryDelays: [0, 1000, 3000, 5000],
    headers: {
      apikey: anonKey,
      'x-signature': signedData.token,
    },
    uploadDataDuringCreation: true,
    removeFingerprintOnSuccess: true,
    metadata: {
      bucketName: 'study-materials',
      objectName: filePath,
      contentType: 'application/pdf',
      cacheControl: '3600',
    },
    chunkSize: 6 * 1024 * 1024,
    onError: (err) => {
      console.error('TUS Upload FAILED:', err);
      process.exit(1);
    },
    onProgress: (bytesUploaded, bytesTotal) => {
      const pct = ((bytesUploaded / bytesTotal) * 100).toFixed(1);
      console.log(`Progress: ${(bytesUploaded / (1024*1024)).toFixed(1)}MB / ${(bytesTotal / (1024*1024)).toFixed(1)}MB (${pct}%)`);
    },
    onSuccess: async () => {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`SUCCESS: 37MB uploaded in ${elapsed}s!`);
      const { data } = supabase.storage.from('study-materials').getPublicUrl(filePath);
      console.log('File URL:', data.publicUrl);
      process.exit(0);
    }
  });

  upload.start();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
