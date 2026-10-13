import express from 'express'
import { listOrders, placeOrder, updateStatus, userOrders, verifyOrder } from './orderController.js';
import authMiddleware from '../../middleware/nameAuth.js';
import adminAuth from '../../middleware/adminAuth.js';

export const orderRouter = express.Router();

orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.post("/verify", verifyOrder);
orderRouter.post("/userOrders", authMiddleware, userOrders);
orderRouter.get("/list", adminAuth, listOrders);
orderRouter.put("/status", adminAuth, updateStatus);