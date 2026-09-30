import 'dotenv/config';
import mongoose from 'mongoose';
import {connectDatabase} from '../config/database.js';
import {Subscription,Notification} from '../models/Platform.js';
import {emailUser} from '../services/notificationEmailService.js';

await connectDatabase();
const now=new Date();
const expired=await Subscription.find({status:'Active',endsAt:{$lte:now}});
for(const subscription of expired){subscription.status='Expired';await subscription.save();await Notification.create({user:subscription.user,type:'SUBSCRIPTION',title:'Membership expired',message:'Your paid membership has expired. Your account continues on Free access.',relatedRecord:subscription._id});await emailUser(subscription.user,{category:'payment',subject:'Your membership has expired',template:'subscription-expired',data:{endedAt:subscription.endsAt.toISOString()}})}
const upcoming=await Subscription.find({status:'Active',endsAt:{$gt:now,$lte:new Date(now.getTime()+7*864e5)}});
let reminders=0;
for(const subscription of upcoming){const days=Math.max(1,Math.ceil((subscription.endsAt-now)/864e5)),threshold=days<=1?1:7;if(subscription.expiryRemindersSent.includes(threshold))continue;subscription.expiryRemindersSent.addToSet(threshold);await subscription.save();await Notification.create({user:subscription.user,type:'SUBSCRIPTION',title:'Membership expiry reminder',message:`Your membership expires in ${days} day${days===1?'':'s'}.`,relatedRecord:subscription._id});await emailUser(subscription.user,{category:'payment',subject:`Your membership expires in ${days} day${days===1?'':'s'}`,template:'subscription-expiry-reminder',data:{days,endsAt:subscription.endsAt.toISOString()}});reminders++}
console.log(JSON.stringify({event:'subscription_expiry_complete',expired:expired.length,reminders,at:now.toISOString()}));
await mongoose.disconnect();
