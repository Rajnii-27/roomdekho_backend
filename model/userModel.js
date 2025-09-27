const mongoose = require('mongoose');

const roomDetailsSchema = new mongoose.Schema({
  resourcesAvailable: { type: String, default: '' },
  otherBills: { type: String, default: '' },
  cost: { type: String, default: '' }
}, { _id: false });

const homeownerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },

  address: { type: String, default: '' },
  pincode: { type: String, default: '' },
  state: { type: String, default: '' },
  country: { type: String, default: '' },

  profileImage: { type: String },
  roomPhotos: [{ type: String }],
  roomVideo: { type: String },

  roomDetails: {
    type: roomDetailsSchema,
    default: () => ({})
  },
isAvailable: { 
    type: Boolean, 
    default: true   // rooms will start as available
  },
  
 location: {
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    index: '2dsphere'
  }
}


}, { timestamps: true });

module.exports = mongoose.model('Homeowner', homeownerSchema);
