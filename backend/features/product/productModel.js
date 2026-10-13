import mongoose from 'mongoose'

export const productSchema = new mongoose.Schema({
    name: {type:String, required:true},
    discount: {type:Number, default:0},
    description: {type:String, required:false},
    price: {type:Number, required:true},
    monthlyRent: {type:Number, min:0},
    dailyRent: {type:Number, min:0},
    securityDeposit: {type:Number, min:0},
    image: {type:String, required:true},
    category: {type:String, required:true},
})

export const productModel = mongoose.models.products || mongoose.model("products",productSchema);