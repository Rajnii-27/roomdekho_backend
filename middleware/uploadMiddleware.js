const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ⬇️ Allowed MIME types
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'video/mp4'];

// ⬇️ File filter
const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname), false);
  }
};

// ⬇️ Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  },
});

// ⬇️ Multer instance with corrected field names
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
}).fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'roomPhotos', maxCount: 5 },  // ✅ fixed name
  { name: 'roomVideo', maxCount: 1 }    // ✅ fixed name
]);

module.exports = upload;
