import express from 'express'
import multer from 'multer'
import { addProduct, productList, removeProduct, updateProduct } from './productController.js';
import adminAuth from '../../middleware/adminAuth.js';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const imageExtensions = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
};

export const productRouter = express.Router();

//image storage engine
const storage = multer.diskStorage({
    destination: 'uploads',
    filename: (req, file, cb) => cb(null, `${Date.now()}-${randomUUID()}${imageExtensions[file.mimetype] || path.extname(file.originalname).toLowerCase()}`),
})

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype)) {
            return cb(new Error('Upload a JPEG, PNG, WEBP, or GIF image'));
        }
        return cb(null, true);
    },
});

const uploadProductImage = (req, res, next) => {
    upload.single("image")(req, res, (error) => {
        if (error) {
            const status = error instanceof multer.MulterError ? 400 : 415;
            return res.status(status).json({ success: false, message: error.message || "Unable to upload product image" });
        }
        return next();
    });
};

productRouter.post("/add", adminAuth, uploadProductImage, addProduct);
productRouter.put("/update", adminAuth, uploadProductImage, updateProduct);
productRouter.get("/list", productList);
productRouter.post("/remove", adminAuth, removeProduct);