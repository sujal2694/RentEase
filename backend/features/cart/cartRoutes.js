import express from 'express'
import { addTocart, getCart, removeFromcart, setRentalTerm } from './cartController.js'
import authMiddleware from '../../middleware/nameAuth.js';



export const cartRouter = express.Router();

cartRouter.post("/add", authMiddleware, addTocart);
cartRouter.post("/remove", authMiddleware, removeFromcart);
cartRouter.post("/get",authMiddleware,getCart);
cartRouter.post("/rental-term",authMiddleware,setRentalTerm);
