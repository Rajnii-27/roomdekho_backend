const express = require('express');
const router = express.Router();
const auth = require('../controllers/userController');

// router.post('/signup', auth.signupUser);
// router.post('/login', auth.loginUser);
router.post('/send-otp', auth.sendOTP);
router.post('/verify-otp', auth.verifyOTPAndReset);

module.exports = router;
