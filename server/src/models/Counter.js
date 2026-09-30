import mongoose from 'mongoose';const schema=new mongoose.Schema({_id:String,sequence:{type:Number,default:100000}});export default mongoose.model('Counter',schema);
