const jwt = require('jsonwebtoken');
const User = require('../model/userModel'); // Adjust path if user model is elsewhere

const authMiddleware = async (req, res, next) => {
  try {
   const authHeader = req.headers.authorization;
if (!authHeader || !authHeader.startsWith('Bearer ')) {
  return res.status(401).json({ message: 'Unauthorized: No token provided' });
}

const token = authHeader.split(' ')[1];
const decoded = jwt.verify(token, process.env.JWT_SECRET);


    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

module.exports = authMiddleware;
