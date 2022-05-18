var express = require('express');
var router = express.Router();
const UserAccount = require('../model/UserAccount');
// See users.js for an example of how to use verifyJWT
// const verifyJWT = require('../middleware/verifyToken');

/* GET user account */
router.get('/account', async (req, res, next) => {
  try {
    const { headers } = req;

    const userAccount = await UserAccount.findOne({ account_id: headers['user-account-id'] });

    res.status(200).json({ userAccount });
  } catch (error) {
    throw error;
  }
});

/* PUT update user account */
router.put('/account', async (req, res, next) => {
  try {
    const { headers, body } = req;

    await UserAccount.updateOne(
      { account_id: headers['user-account-id'] },
      body,
      { runValidators: true },
    );

    const userAccount = await UserAccount.findOne({ account_id: headers['user-account-id'] });

    res.status(200).json({ userAccount });
  } catch (error) {
    throw error;
  }
});

module.exports = router;
