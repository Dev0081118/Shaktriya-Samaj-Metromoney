import 'dotenv/config';
import {connectDatabase} from './config/database.js';
import User from './models/User.js';
import MatrimonialProfile from './models/MatrimonialProfile.js';
import PartnerPreference from './models/PartnerPreference.js';
import {Plan} from './models/Platform.js';

await connectDatabase();
const userDefs=[
  {email:'admin@ksm.dev',phone:'+919900000001',password:'Admin@123',role:'super_admin'},
  {email:'rajveer@ksm.dev',phone:'+919900000002',password:'Member@123'},
  {email:'devika@ksm.dev',phone:'+919900000003',password:'Member@123'},
  {email:'nandini@ksm.dev',phone:'+919900000004',password:'Member@123'},
];
const users=[];
for(const definition of userDefs){
  let user=await User.findOne({email:definition.email});
  if(!user) user=await User.create({...definition,phoneVerified:true});
  users.push(user);
}
const profileDefs=[
  ['Rajveer','Male','Rajkot','Entrepreneur','MBA','https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900'],
  ['Devika','Female','Ahmedabad','Architect','M.Arch','https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900'],
  ['Nandini','Female','Udaipur','Doctor','MD','https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900'],
];
for(let i=0;i<profileDefs.length;i++){
  const d=profileDefs[i];
  const values={userId:users[i+1].id,profileFor:'Self',firstName:d[0],gender:d[1],dateOfBirth:new Date(1997-i,4,10),height:165+i*5,maritalStatus:'Never Married',location:{city:d[2],state:i===2?'Rajasthan':'Gujarat',country:'India'},education:{highestEducation:d[4]},career:{occupation:d[3]},aboutMe:'Family-oriented, thoughtful and rooted in heritage.',profilePhoto:d[5],visibility:'active',completionPercentage:88,verification:{mobileVerified:true,adminVerified:true}};
  let profile=await MatrimonialProfile.findOne({userId:users[i+1].id});
  if(!profile) profile=await MatrimonialProfile.create(values); else { Object.assign(profile,values); await profile.save(); }
  await PartnerPreference.findOneAndUpdate({profileId:profile.id},{profileId:profile.id,ageMin:24,ageMax:33,states:['Gujarat','Rajasthan']},{upsert:true,new:true});
}
const planDefs=[
  {name:'Free',slug:'free',price:0,durationDays:365,features:{interestLimit:5}},
  {name:'Connect',slug:'connect',price:1999,durationDays:90,features:{interestLimit:20,advancedSearch:true}},
  {name:'Premium',slug:'premium',price:4999,durationDays:180,features:{interestLimit:999,advancedSearch:true,profileBoost:true,prioritySupport:true}},
  {name:'Assisted',slug:'assisted',price:14999,durationDays:180,features:{interestLimit:999,advancedSearch:true,relationshipManager:true}},
];
for(const plan of planDefs) await Plan.findOneAndUpdate({slug:plan.slug},plan,{upsert:true,new:true});
console.log('Seed complete. Development logins: admin@ksm.dev / Admin@123; member: rajveer@ksm.dev / Member@123');
process.exit(0);
