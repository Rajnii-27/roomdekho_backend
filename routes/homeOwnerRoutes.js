const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { body } = require('express-validator');
const HomeOwner = require('../model/userModel'); // adjust if your model path is different

// const authenticateToken = require('../middleware/authenticateToken');

// router.patch('/profile', authenticateToken, updateHomeOwnerProfile);


const {
  signupUser,
  loginUser,
  sendOTP,
  verifyOTPAndReset,
  updateHomeOwnerProfile,
  getHomeOwnerProfile,
  getAllHomeOwnerProfiles,
  filterRoomsController
} = require('../controllers/userController');

// ✅ Authentication routes
router.post('/signup', signupUser);
router.post('/login', loginUser);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTPAndReset);

// ✅ Profile validation middleware
const profileValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').isLength({ min: 10 }).withMessage('Phone must be at least 10 digits'),
  body('address').notEmpty().withMessage('Address is required'),
  body('pincode').isPostalCode('IN').withMessage('Valid pincode is required'),
  body('state').notEmpty().withMessage('State is required'),
  body('country').notEmpty().withMessage('Country is required'),
  body('resourcesAvailable').optional().isString(),
  body('otherBills').optional().isString(),
  body('cost').optional().isNumeric()
];

// ✅ Profile routes
router.get('/profile', authMiddleware, getHomeOwnerProfile);


router.put(
  '/profile',
  authMiddleware,
  upload,
  profileValidation,
  updateHomeOwnerProfile
);

router.get('/allrooms', getAllHomeOwnerProfiles);

router.get('/rooms/filter', filterRoomsController);

router.get('/getRoomDetails/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const profile = await HomeOwner.findById(id);

    if (!profile) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error('Error fetching room details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
