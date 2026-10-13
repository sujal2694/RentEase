import { productModel } from "./productModel.js";
import fs from 'node:fs/promises';
import path from 'node:path';

const uploadsDirectory = path.resolve('uploads');
const validId = (id) => typeof id === 'string' && /^[a-f\d]{24}$/i.test(id);

const parseProductFields = (body) => {
    const numericFields = ['price', 'monthlyRent', 'dailyRent', 'securityDeposit'];
    if (numericFields.some(field => body[field] === undefined || body[field] === null || String(body[field]).trim() === '')) {
        return { error: 'Enter the item value, daily and monthly rent, and refundable deposit' };
    }
    const fields = {
        name: typeof body.name === 'string' ? body.name.trim() : '',
        description: typeof body.description === 'string' ? body.description.trim() : '',
        category: typeof body.category === 'string' ? body.category.trim() : '',
        price: Number(body.price),
        monthlyRent: Number(body.monthlyRent),
        dailyRent: Number(body.dailyRent),
        securityDeposit: Number(body.securityDeposit),
    };
    if (!fields.name || !fields.category || fields.name.length > 160 || fields.category.length > 80) {
        return { error: 'Enter a product name and category within the allowed length' };
    }
    if (!Number.isFinite(fields.price) || fields.price < 1 ||
        !Number.isFinite(fields.monthlyRent) || fields.monthlyRent < 1 ||
        !Number.isFinite(fields.dailyRent) || fields.dailyRent < 1 ||
        !Number.isFinite(fields.securityDeposit) || fields.securityDeposit < 0) {
        return { error: 'Enter a valid item value, daily and monthly rent, and refundable deposit' };
    }
    return { fields };
};

const removeUploadedImage = async (filename) => {
    if (!filename || path.basename(filename) !== filename) return;
    try {
        await fs.unlink(path.join(uploadsDirectory, filename));
    } catch (error) {
        if (error.code !== 'ENOENT') console.error('Unable to remove rental image file', error);
    }
};

export const addProduct = async (req, res) => {
    const { fields, error } = parseProductFields(req.body);
    if (error || !req.file) {
        await removeUploadedImage(req.file?.filename);
        return res.status(400).json({ success: false, message: error || 'Upload a product image' });
    }

    try {
        await productModel.create({ ...fields, image: req.file.filename });
        return res.status(201).json({ success: true, message: 'Rental item added' });
    } catch (saveError) {
        await removeUploadedImage(req.file.filename);
        console.error('Unable to add rental item', saveError);
        return res.status(500).json({ success: false, message: 'Unable to add rental item' });
    }
};

export const updateProduct = async (req, res) => {
    if (!validId(req.body.id)) {
        await removeUploadedImage(req.file?.filename);
        return res.status(400).json({ success: false, message: 'Invalid rental item' });
    }
    const { fields, error } = parseProductFields(req.body);
    if (error) {
        await removeUploadedImage(req.file?.filename);
        return res.status(400).json({ success: false, message: error });
    }

    try {
        const product = await productModel.findById(req.body.id);
        if (!product) {
            await removeUploadedImage(req.file?.filename);
            return res.status(404).json({ success: false, message: 'Rental item not found' });
        }
        const previousImage = product.image;
        Object.assign(product, fields);
        if (req.file) product.image = req.file.filename;
        await product.save();
        if (req.file) await removeUploadedImage(previousImage);
        return res.json({ success: true, message: 'Rental item updated' });
    } catch (saveError) {
        await removeUploadedImage(req.file?.filename);
        console.error('Unable to update rental item', saveError);
        return res.status(500).json({ success: false, message: 'Unable to update rental item' });
    }
};

export const productList = async (req, res) => {
    try {
        const products = await productModel.find({}).sort({ name: 1 });
        const rentalProducts = products.map((product) => {
            const item = product.toObject();
            const monthlyRent = Math.max(1, Math.round(Number(item.monthlyRent ?? item.price * 0.05)));
            return {
                ...item,
                monthlyRent,
                dailyRent: Math.max(1, Math.round(Number(item.dailyRent ?? monthlyRent / 30))),
                securityDeposit: Math.max(0, Math.round(Number(item.securityDeposit ?? item.price * 0.15))),
            };
        });
        return res.json({ success: true, data: rentalProducts });
    } catch (error) {
        console.error('Unable to list rental items', error);
        return res.status(500).json({ success: false, message: 'Unable to load rental catalog' });
    }
};

export const removeProduct = async (req, res) => {
    if (!validId(req.body.id)) {
        return res.status(400).json({ success: false, message: 'Invalid rental item' });
    }
    try {
        const product = await productModel.findByIdAndDelete(req.body.id);
        if (!product) return res.status(404).json({ success: false, message: 'Rental item not found' });
        await removeUploadedImage(product.image);
        return res.json({ success: true, message: 'Rental item removed' });
    } catch (error) {
        console.error('Unable to remove rental item', error);
        return res.status(500).json({ success: false, message: 'Unable to remove rental item' });
    }
};
