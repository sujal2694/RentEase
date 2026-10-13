import jwt from 'jsonwebtoken'
import 'dotenv/config'
import bcrypt from 'bcrypt'
import validator from 'validator'
import { adminModel } from './adminModel.js'

export const setupStatus = async (req, res) => {
    try {
        const setupRequired = !(await adminModel.exists({}));
        return res.json({ success: true, setupRequired });
    } catch (error) {
        console.error("Unable to check admin setup status", error);
        return res.status(500).json({ success: false, message: "Unable to check admin setup status" });
    }
};


const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET);
}

export const registerUser = async (req, res) => {
    try {
        const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
        const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
        const password = typeof req.body.password === 'string' ? req.body.password : '';
        if (!name || !validator.isEmail(email) || password.length < 8) {
            return res.status(400).json({ success: false, message: "Enter an organization name, valid email, and password with at least 8 characters" });
        }
        if (await adminModel.exists({})) {
            return res.status(403).json({ success: false, message: "Admin registration is closed. Sign in with an existing admin account." });
        }
        const exists = await adminModel.findOne({ email });
        if (exists) {
            return res.status(409).json({ success: false, message: "An admin account with this email already exists" })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newAdmin = new adminModel({ name, email, password: hashedPassword });
        const admin = await newAdmin.save();
        const token = createToken(admin._id);
        return res.json({ success: true, token, name: admin.name, email: admin.email })

    } catch (error) {
        console.error("Admin registration failed", error);
        return res.status(500).json({ success: false, message: "Unable to create admin account" });
    }
}


export const loginUser = async (req,res)=>{
    try {
        const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
        const password = typeof req.body.password === 'string' ? req.body.password : '';
        if (!validator.isEmail(email) || !password) {
            return res.status(400).json({success:false,message:"Enter a valid email and password"});
        }
        const admin = await adminModel.findOne({ email })

        if (!admin) {
            return res.status(401).json({success:false,message:"Invalid email or password"})
        }

        const isMatch = await bcrypt.compare(password,admin.password)

        if (!isMatch) {
            return res.status(401).json({success:false,message:"Invalid email or password"})
        }
        
        const token = createToken(admin._id);
        return res.json({success:true,token,name:admin.name,email:admin.email})

    } catch (error) {
        console.error("Admin sign-in failed", error);
        return res.status(500).json({success:false,message:"Unable to sign in"});
    }
}