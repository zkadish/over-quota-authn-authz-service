const { getTemplateOrder } = require('../services/frameWorks');


const provisionUser = async (user) => {
  try {
    const res = await getTemplateOrder(user);
    console.log(res);
  } catch (err) {
    console.log(err);
  }

  return user;
};

module.exports = provisionUser;
