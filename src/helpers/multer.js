const multer = require("multer");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
    },
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' || 
        file.mimetype === 'image/jpg' || 
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true);
    } else {
        cb(new Error('File type not accepted'), false);
    }
};

const upload = multer({
    storage,
    limits: {
        fileSize: 1024 * 1024 * 5,
    },
    fileFilter,
});

module.exports = upload; 
