import mongoose from 'mongoose';
const schema = new mongoose.Schema(
  {
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MatrimonialProfile',
      required: true,
      unique: true
    },
    preferredGender: { type: String, enum: ['Male', 'Female'] },
    ageMin: Number,
    ageMax: Number,
    heightMin: Number,
    heightMax: Number,
    maritalStatus: [{
      type: String,
      enum: ['Never Married', 'Divorced', 'Widowed', 'Annulled', 'Separated']
    }],
    acceptedMaritalStatuses: [{
      type: String,
      enum: ['Never Married', 'Divorced', 'Widowed', 'Annulled', 'Separated']
    }],
    willingForRemarriage: {
      type: String,
      enum: ['Yes', 'No', 'Open to Discuss'],
      default: 'Open to Discuss'
    },
    locations: [String],
    states: [String],
    countries: [String],
    educationPreferences: [String],
    occupationPreferences: [String],
    incomePreferences: { min: Number, max: Number },
    dietPreferences: [String],
    communityPreferences: [String],
    marriageTimeline: [String],
    additionalPreferences: String
  },
  { timestamps: true }
);
export default mongoose.model('PartnerPreference', schema);
