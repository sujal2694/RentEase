import jwt from 'jsonwebtoken'

const authMiddleware = async(req,res,next)=>{
    const {token} = req.headers;
    if(!token){
        return res.status(401).json({success:false,message:'Not authorised. Please sign in.'})
    }
    try {
        const token_decode = jwt.verify(token,process.env.JWT_SECRET);
        req.body.userId = token_decode.id;
        next();
    } catch (error) {
        console.error("Authentication token validation failed", error);
        return res.status(401).json({success:false,message:"Invalid or expired session. Please sign in again."});
    }

}

export default authMiddleware;