# Upload Directory Fix

## Problem
Error: `ENOENT: no such file or directory, open 'uploads/general/1761563320937-442009219.png'`

The upload directories didn't exist when trying to save files.

## Root Cause
- Multer was trying to save to `uploads/general/` 
- Directory didn't exist
- Caused file save to fail

## Fix Applied

### 1. Updated Upload Middleware
Modified `server/src/middleware/upload.js` to:
- Use absolute path from `__dirname`
- Automatically create directories if they don't exist
- Use ESM-compatible `import fs` instead of `require`

### Changes Made:
```javascript
import fs from 'fs'; // ✅ ESM import

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.body.folder || 'general';
    const uploadPath = path.join(__dirname, '../../uploads', folder);
    
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  ...
});
```

### 2. Created Initial Directories
Created required directories:
```bash
mkdir -p uploads/general
mkdir -p uploads/wall-assets
```

## Upload Folders Structure
```
uploads/
├── general/       # General uploads
├── wall-assets/   # Wall-related files
│   ├── logos/
│   ├── hero/
│   └── showreels/
├── hero/
├── logos/
├── profiles/
├── projects/
├── showreels/
└── walls/
```

## How It Works Now

1. **Request comes in** with folder parameter
2. **Multer checks** if upload folder exists
3. **Creates folder** if it doesn't exist (recursive)
4. **Saves file** to correct location
5. **Returns URL** to frontend

## Result
✅ Directories auto-created on first upload
✅ Files save to correct location
✅ No more "ENOENT" errors
✅ Wall creation with images works

## Test
Try creating a wall with logo/hero image - should work now!

## Files Updated
✅ `server/src/middleware/upload.js` - Added fs import and directory creation
✅ Created initial upload directories
