import path from 'node:path';
import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middlewares/requireAuth.js';
import { requireRole } from '../middlewares/requireRole.js';

export const router = Router();

function makeStorage(subdir: 'banners' | 'thumbs') {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, path.resolve('..', 'vite-frontend', 'public', 'images', subdir));
    },
    filename: (req, _file, cb) => {
      const filename = (req.body.filename as string) || `upload-${Date.now()}.webp`;
      cb(null, filename);
    },
  });
}

const uploadBanner = multer({ storage: makeStorage('banners') });
const uploadThumb = multer({ storage: makeStorage('thumbs') });

router.post(
  '/upload/activity-banner',
  requireAuth,
  requireRole('admin'),
  uploadBanner.single('image'),
  (req, res) => {
    if (!req.file) { res.status(400).json({ success: false, message: 'No file' }); return; }
    res.json({ success: true, filename: req.file.filename });
  },
);

router.post(
  '/upload/activity-thumb',
  requireAuth,
  requireRole('admin'),
  uploadThumb.single('image'),
  (req, res) => {
    if (!req.file) { res.status(400).json({ success: false, message: 'No file' }); return; }
    res.json({ success: true, filename: req.file.filename });
  },
);
