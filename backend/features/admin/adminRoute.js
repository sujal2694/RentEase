import express from 'express'
import { loginUser, registerUser, setupStatus } from './adminController.js';

export const adminRouter = express.Router();

adminRouter.get("/setup-status", setupStatus);
adminRouter.post("/login",loginUser);
adminRouter.post("/register",registerUser);