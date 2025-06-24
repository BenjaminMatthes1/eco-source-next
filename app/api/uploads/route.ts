// --- app/api/uploads/route.ts (replace all) ---
import { NextRequest, NextResponse } from 'next/server';
import { uploadFileToS3 } from '@/lib/s3Upload';
import crypto from 'crypto';
import mime from 'mime-types'; 

export async function POST(req: NextRequest) {
  /* 1) multipart guard */
  const cType = req.headers.get('content-type') ?? '';
  if (!cType.startsWith('multipart/form-data'))
    return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 });

  /* 2) grab file  context */
  const form   = await req.formData();
  const rawFile = form.get('file');                     // unknown
  if (!(rawFile && rawFile instanceof File))
    return NextResponse.json({ error: 'No file' }, { status: 400 });

  const file = rawFile as File;                         // <─ now always File


  /* NEW:  where (entity)  and  what (kind) are we uploading?  */
  const entity = (form.get('entity') as string | null)?.toLowerCase(); // "product" | "service" | "user"
  const kind   = (form.get('kind')   as string | null)?.toLowerCase(); // "photo" | "document" | "reviewphoto"

  if (!entity || !kind)
    return NextResponse.json({ error: 'entity and kind required' }, { status: 400 });
  const ok = ['image/jpeg', 'image/png'];
  if (!ok.includes(file.type))
    return NextResponse.json({ error: 'Only JPEG/PNG allowed' }, { status: 415 });

  /* 3) pick bucket */
  /* map => env bucket name ------------------------------------ */
  const folderMap: Record<string, string> = {
  'product:document'    : 'ProductDocuments',
  'product:photo'       : 'ProductPhotos',
  'product:reviewphoto' : 'ProductReviewPhotos',
  'service:document'    : 'ServiceDocuments',
  'service:photo'       : 'ServicePhotos',
  'service:reviewphoto' : 'ServiceReviewPhotos',
  'user:document'       : 'UserDocuments',
  'user:photo'          : 'UserPictures',
  'post:photo'          : 'PostPhotos',
  'post:document'       : 'PostDocuments',   // (future use)
};

const folder = folderMap[`${entity}:${kind}`];
if (!folder)
  return NextResponse.json({ error: 'Invalid entity/kind' }, { status: 400 });

const key = `${folder}/${Date.now()}-${crypto.randomUUID()}-${file.name}`;
const buffer    = Buffer.from(await file.arrayBuffer());
const mimeType =
  file.type ||                                   // browser-supplied
  mime.lookup(file.name) ||                      // fallback by extension
  'application/octet-stream';

const url = await uploadFileToS3(buffer, key, mimeType);   // ← now 3 args

  /* 5) respond */
  return NextResponse.json({ url, key, name: file.name }, { status: 200 });
}
