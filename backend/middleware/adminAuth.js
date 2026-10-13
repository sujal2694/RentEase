import jwt from 'jsonwebtoken';
import { adminModel } from '../features/admin/adminModel.js';

const adminAuth = async (req, res, next) => {
    const token = req.headers.token;
    if (!token) {
        return res.status(401).json({ success: false, message: 'Admin sign-in required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await adminModel.findById(decoded.id).select('_id');
        if (!admin) {
            return res.status(401).json({ success: false, message: 'Admin account not found' });
        }
        req.adminId = String(admin._id);
        return next();
    } catch (error) {
        console.error('Admin authentication failed', error);
        return res.status(401).json({ success: false, message: 'Invalid or expired admin session' });
    }
};

export default adminAuth;
