/**
 * 
 * @param {*} u | user object directly from database
 * @returns | a modified user object to the client
 */

const sanitizeUser = u => {
  const user = { ...u._doc };
  delete user.password;

  return user;
};

module.exports = {
  sanitizeUser,
};
