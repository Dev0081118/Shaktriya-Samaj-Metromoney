import mongoose from 'mongoose';
import Counter from './Counter.js';
const privacy = {
  photoVisibility: {
    type: String,
    enum: ['Everyone', 'RegisteredMembers', 'AcceptedInterests', 'Private'],
    default: 'RegisteredMembers'
  },
  contactVisibility: {
    type: String,
    enum: ['AcceptedInterests', 'MutualMatches', 'Private'],
    default: 'MutualMatches'
  },
  incomeVisibility: {
    type: String,
    enum: ['Everyone', 'RegisteredMembers', 'AcceptedInterests', 'Private'],
    default: 'Private'
  },
  familyVisibility: {
    type: String,
    enum: ['RegisteredMembers', 'AcceptedInterests', 'Private'],
    default: 'RegisteredMembers'
  },
  familyOverviewVisibility: {
    type: String,
    enum: ['RegisteredMembers', 'AcceptedInterests', 'MutualMatches', 'Private'],
    default: 'AcceptedInterests'
  },
  maternalFamilyVisibility: {
    type: String,
    enum: ['AcceptedInterests', 'MutualMatches', 'Private'],
    default: 'AcceptedInterests'
  },
  siblingDetailsVisibility: {
    type: String,
    enum: ['AcceptedInterests', 'MutualMatches', 'Private'],
    default: 'AcceptedInterests'
  },
  assetVisibility: {
    type: String,
    enum: ['AcceptedInterests', 'MutualMatches', 'Private'],
    default: 'Private'
  },
  fullNameVisibility: {
    type: String,
    enum: ['Everyone', 'RegisteredMembers'],
    default: 'RegisteredMembers'
  }
};
const schema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    profileFor: {
      type: String,
      enum: ['Self', 'Son', 'Daughter', 'Brother', 'Sister', 'Relative'],
      required: true
    },
    profileId: { type: String, unique: true, index: true },
    firstName: { type: String, trim: true, required: true },
    middleName: String,
    lastName: String,
    gender: { type: String, enum: ['Male', 'Female'] },
    dateOfBirth: Date,
    height: Number,
    maritalStatus: {
      type: String,
      enum: ['Never Married', 'Divorced', 'Widowed', 'Annulled', 'Separated']
    },
    maritalHistory: {
      status: {
        type: String,
        enum: ['Never Married', 'Divorced', 'Widowed', 'Annulled', 'Separated']
      },
      isRemarriage: Boolean,
      previousMarriageEndedAt: Date,
      divorceFinalized: Boolean,
      childrenFromPreviousMarriage: Boolean,
      childrenCount: { type: Number, min: 0, max: 20 },
      childrenLivingWith: { type: String, maxlength: 120 },
      notes: { type: String, maxlength: 600 }
    },
    location: {
      city: String,
      district: String,
      state: String,
      country: { type: String, default: 'India' },
      nativePlace: String
    },
    community: {
      name: String,
      subCommunity: String,
      clan: String,
      familyOrigin: String
    },
    education: {
      highestEducation: String,
      degree: String,
      specialization: String,
      college: String,
      educationDetails: String
    },
    career: {
      occupationType: String,
      occupation: String,
      designation: String,
      companyName: String,
      businessName: String,
      annualIncome: Number,
      incomeVisibility: Boolean
    },
    lifestyle: {
      diet: String,
      smoking: String,
      drinking: String,
      interests: [String]
    },
    family: {
      fatherName: String,
      fatherOccupation: String,
      motherName: String,
      motherOccupation: String,
      siblings: String,
      siblingDetails: {
        type: [{
          name: { type: String, maxlength: 100 },
          gender: { type: String, enum: ['Male', 'Female', 'Other'] },
          relation: { type: String, enum: ['Brother', 'Sister'] },
          age: { type: Number, min: 0, max: 120 },
          maritalStatus: { type: String, maxlength: 60 },
          occupation: { type: String, maxlength: 120 },
          education: { type: String, maxlength: 120 },
          spouseName: { type: String, maxlength: 100 },
          spouseFamilySurname: { type: String, maxlength: 100 },
          spouseNativePlace: { type: String, maxlength: 120 },
          spouseVillage: { type: String, maxlength: 120 },
          spouseDistrict: { type: String, maxlength: 120 },
          spouseState: { type: String, maxlength: 120 },
          spouseFamilyDetails: { type: String, maxlength: 400 },
          notes: { type: String, maxlength: 400 }
        }],
        validate: [value => value.length <= 12, 'A maximum of 12 siblings is supported.']
      },
      familyType: String,
      familyLocation: String,
      familyDescription: String
    },
    paternalFamily: {
      ancestralVillage: { type: String, maxlength: 120 },
      nativePlace: { type: String, maxlength: 120 },
      district: { type: String, maxlength: 120 },
      state: { type: String, maxlength: 120 },
      familySurname: { type: String, maxlength: 100 },
      clan: { type: String, maxlength: 100 },
      notes: { type: String, maxlength: 600 }
    },
    maternalFamily: {
      maternalGrandfatherName: { type: String, maxlength: 120 },
      maternalFamilySurname: { type: String, maxlength: 100 },
      maternalNativePlace: { type: String, maxlength: 120 },
      maternalVillage: { type: String, maxlength: 120 },
      maternalDistrict: { type: String, maxlength: 120 },
      maternalState: { type: String, maxlength: 120 },
      maternalClan: { type: String, maxlength: 100 },
      notes: { type: String, maxlength: 600 }
    },
    familyAssets: {
      agricultureLand: {
        hasLand: Boolean,
        approximateArea: { type: Number, min: 0, max: 1000000 },
        unit: { type: String, enum: ['Vigha', 'Acre', 'Hectare'] }
      },
      propertySummary: { type: String, maxlength: 500 },
      primaryResidenceType: { type: String, maxlength: 100 },
      businessAssetsSummary: { type: String, maxlength: 500 }
    },
    biodataPrivacy: {
      includeSensitiveFamilyDetailsInBiodata: { type: Boolean, default: false }
    },
    marriageTimeline: String,
    aboutMe: String,
    profilePhoto: String,
    profilePhotoPublicId: String,
    gallery: [String],
    galleryAssets: [{ url: String, publicId: String }],
    boostedUntil: Date,
    lastBoostAt: Date,
    verification: {
      mobileVerified: Boolean,
      emailVerified: Boolean,
      photoVerified: Boolean,
      adminVerified: Boolean
    },
    privacy,
    visibility: {
      type: String,
      enum: [
        'draft',
        'pending_review',
        'active',
        'changes_required',
        'rejected',
        'paused',
        'hidden'
      ],
      default: 'draft'
    },
    lifecycleStatus: {
      type: String,
      enum: ['Active', 'Paused', 'Married', 'Deleted'],
      default: 'Active'
    },
    completionPercentage: { type: Number, default: 0 },
    moderationNotes: String,
    moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    moderatedAt: Date,
    lastActiveAt: Date
  },
  { timestamps: true }
);
schema.index({ visibility: 1, createdAt: -1 });
schema.index({ lastActiveAt: -1 });
schema.pre('validate', async function () {
  if (!this.profileId) {
    let counter = await Counter.findById('profileId');
    if (!counter) {
      const last = await this.constructor
        .findOne({ profileId: /^KSM\d+$/ }, 'profileId')
        .sort({ profileId: -1 })
        .lean();
      try {
        await Counter.create({
          _id: 'profileId',
          sequence: Number(last?.profileId?.slice(3)) || 100000
        });
      } catch {
        /* another request created the counter */
      }
    }
    counter = await Counter.findByIdAndUpdate(
      'profileId',
      { $inc: { sequence: 1 } },
      { returnDocument: 'after' }
    );
    this.profileId = `KSM${counter.sequence}`;
  }
});
export default mongoose.model('MatrimonialProfile', schema);
