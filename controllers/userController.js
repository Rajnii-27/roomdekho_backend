const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sendEmail = require('../utils/sendEmail');
const { validationResult } = require('express-validator');
const HomeOwner = require('../model/userModel');

const fs = require('fs');



// ✅ Optional: OTP store (in-memory)
const otpStore = {};

// ✅ Signup
const signupUser = async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const existingUser = await HomeOwner.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await HomeOwner.create({
    name,
    email,
    phone,
    password: hashedPassword,
  });

  res.status(201).json({ message: 'Signup successful' });
};

// ✅ Login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const user = await HomeOwner.findOne({ email });
    if (!user) return res.status(401).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Send OTP
const sendOTP = async (req, res) => {
  const { email } = req.body;
  const user = await HomeOwner.findOne({ email });
  if (!user) return res.status(404).json({ message: 'Email not registered' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };

  try {
    await sendEmail(email, `Your OTP is: ${otp}`, 'RoomDekho Password Reset OTP');
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send OTP', error: err.message });
  }
};

// GET /api/HomeOwners/rooms/filter
const filterRoomsController = async (req, res) => {
  try {
    const { state, pincode, minCost, maxCost, distance, lat, lng } = req.query;

    const filter = {};

    if (state) filter.state = state;
    if (pincode) filter.pincode = pincode;

    // Room cost filter
    if (minCost || maxCost) {
      filter['roomDetails.cost'] = {};
      if (minCost) filter['roomDetails.cost'].$gte = minCost;
      if (maxCost) filter['roomDetails.cost'].$lte = maxCost;
    }

    // Location filter (Geo query)
    if (lat && lng && distance) {
      filter.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseFloat(distance) * 1000, // in meters
        },
      };
    }

    const filteredRooms = await HomeOwner.find(filter).select('-password');

    res.json(filteredRooms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error filtering rooms' });
  }
};


// ✅ Verify OTP
const verifyOTPAndReset = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const record = otpStore[email];

  if (!record) return res.status(400).json({ message: 'No OTP sent to this email' });
  if (record.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
  if (Date.now() > record.expiresAt) return res.status(400).json({ message: 'OTP expired' });

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await HomeOwner.findOneAndUpdate({ email }, { password: hashedPassword });

  delete otpStore[email];
  res.status(200).json({ message: 'Password reset successful' });
};


// ✅ updateHomeOwnerProfile Controller
const updateHomeOwnerProfile = async (req, res) => {
  try {
    // 1️⃣ Validate request body first
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    console.log('Updating profile for user:', userId);

    // 2️⃣ Fetch existing user
    const user = await HomeOwner.findById(userId);
    if (!user) {
      console.log('User not found!');
      return res.status(404).json({ message: 'User not found' });
    }

    // 3️⃣ Prepare updated fields
    const {
      name,
      email,
      phone,
      address,
      pincode,
      state,
      country,
      resourcesAvailable,
      otherBills,
      cost
    } = req.body;

    // 4️⃣ Update fields (trim strings)
    user.name = name?.trim() || user.name;
    user.email = email?.trim() || user.email;
    user.phone = phone?.trim() || user.phone;
    user.address = address?.trim() || user.address;
    user.pincode = pincode?.trim() || user.pincode;
    user.state = state?.trim() || user.state;
    user.country = country?.trim() || user.country;
    user.roomDetails.resourcesAvailable = resourcesAvailable?.trim() || user.roomDetails.resourcesAvailable;
user.roomDetails.otherBills = otherBills?.trim() || user.roomDetails.otherBills;
user.roomDetails.cost = cost !== undefined ? cost : user.roomDetails.cost;


    // 5️⃣ Handle media files
   // 5️⃣ Handle media files
if (req.files) {
  if (req.files.profileImage && req.files.profileImage.length > 0) {
    console.log('Uploading profile image...');
    user.profileImage = `/uploads/${req.files.profileImage[0].filename}`; // ✅ add path
  }

  if (req.files.roomPhotos && req.files.roomPhotos.length > 0) {
    console.log('Uploading room photos...');
    user.roomPhotos = req.files.roomPhotos.map(file => `/uploads/${file.filename}`); // ✅ add path
  }

  if (req.files.roomVideo && req.files.roomVideo.length > 0) {
    console.log('Uploading room video...');
    user.roomVideo = `/uploads/${req.files.roomVideo[0].filename}`; // ✅ add path
  }
}


    // 6️⃣ Save the updated user
    await user.save();

    console.log('Profile updated successfully:', user);

    return res.status(200).json({
      message: 'Profile updated successfully',
      data: user
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  updateHomeOwnerProfile
};

// ✅ Get self profile
const getHomeOwnerProfile = async (req, res) => {
  try {
    const user = await HomeOwner.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Discover profiles
const getAllHomeOwnerProfiles = async (req, res) => {
  try {
    const HomeOwners = await HomeOwner.find().select("-password");
    res.status(200).json({ HomeOwners }); // ✅ KEY CHANGE HERE
  } catch (error) {
    console.error("Error fetching HomeOwners:", error);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = {
  signupUser,
  loginUser,
  sendOTP,
  verifyOTPAndReset,
  updateHomeOwnerProfile,
  getHomeOwnerProfile,
  getAllHomeOwnerProfiles,
  filterRoomsController
};
