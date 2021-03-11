var express = require('express');
var router = express.Router();
const User = require('../model/User');
const verifyJWT = require('../middleware/verifyToken');

// get user info in a private route
/* GET users listing. */
router.get('/user-info', verifyJWT, async (req, res, next) => {
  try {
    const userInfo = await User.findById(req.userId);
    res.status(200).json({ userInfo });
  } catch (error) {
    throw error;
  }
});

router.delete('/delete/:email', async (req, res, next) => {
  try {
    const email = req.params.email;
    const user = await User.findOne({ email });
    const deleted = await user.remove();
    // User.findByIdAndDelete(user._id);
    res.status(200).json({ deleted });
  } catch (error) {
    throw error;
  }
});

router.delete('/delete-list', async (req, res, next) => {
  try {
    const deleted = await User.deleteMany({});
    res.status(200).json({ deleted });
  } catch (error) {
    throw error;
  }
});

router.get('/list', async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json({ users });
  } catch (error) {
    throw error;
  }
});

module.exports = router;
