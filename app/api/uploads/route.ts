import { createRouter, expressWrapper } from 'next-connect';
import type { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// ------------------------------------
// 1) Prepare the upload folder
// ------------------------------------
const uploadDirectory = path.join(process.cwd(), 'public/uploads');
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

// ------------------------------------
// 2) Configure Multer
// ------------------------------------
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueSuffix);
  },
});
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only .pdf, .jpg, and .png files are allowed!'));
  }
};
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// ------------------------------------
// 3) Create the router
// ------------------------------------
const router = createRouter<NextApiRequest, NextApiResponse>();

// Optional: Provide a top-level error-handling middleware
router.use((req, res, next) => {
  try {
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong!' });
  }
});

// ------------------------------------
// 4) Wrap Multer with `expressWrapper`
// ------------------------------------
router.use(expressWrapper(upload.single('file') as any));
// Casting to `any` because Multer is typed for Express  -- you can also do a custom approach below

// ------------------------------------
// 5) POST route for file upload
// ------------------------------------
router.post((req, res) => {
  const file = (req as any).file; // Because `req` is a NextApiRequest, not an Express Request
  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const fileUrl = `/uploads/${file.filename}`;
  res.status(200).json({ url: fileUrl, name: file.originalname });
});

// ------------------------------------
// 6) "No match" fallback
// ------------------------------------
router.all((req, res) => {
  // This will catch any other methods like PUT, DELETE, etc.
  res.status(405).json({ error: 'Method not allowed' });
});

// ------------------------------------
// 7) Export final handler
// ------------------------------------
export default router.handler();

// Important for Next.js to let Multer handle the body:
export const config = {
  api: {
    bodyParser: false,
  },
};
