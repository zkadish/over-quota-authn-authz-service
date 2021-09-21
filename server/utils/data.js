const { v4: uuidv4 } = require('uuid');

const uuid = () => uuidv4().toString().replace(/-/g, '');

module.exports = {
  uuid,
}
