const sanitizeUser = u => {
  const user = { ...u };
  delete user.password;

  return user;
};

module.exports = {
  sanitizeUser,
};
