const User = require('../models/User');

const generateMemberCode = async () => {
  // Generate a random 6-digit number
  const generateRandomCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  let isUnique = false;
  let memberCode;

  // Keep generating until we find a unique code
  while (!isUnique) {
    memberCode = generateRandomCode();
    const existingUser = await User.findOne({ memberCode });
    if (!existingUser) {
      isUnique = true;
    }
  }

  return memberCode;
};

module.exports = { generateMemberCode }; 