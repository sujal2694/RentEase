import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
    userId:{type:String,required:true},
    items:{type:Array,required:true},
    amount:{type:Number,required:true},
    rentalSubtotal:{type:Number,required:true},
    depositAmount:{type:Number,required:true},
    address:{type:Object,required:true},
    rentalMonths:{type:Number},
    status:{type:String,enum:["Awaiting payment","Booked","Out for delivery","Active","Returned","Cancelled"],default:"Awaiting payment"},
    stripeSessionId:{type:String},
    cartCleared:{type:Boolean,default:false},
    date:{type:Date,default:Date.now},
    payment:{type:Boolean,default:false},
})

export const orderModel = mongoose.models.order || mongoose.model("order",orderSchema);