const Member = require('../models/Member');

// Helper function to validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper function to validate password
const isValidPassword = (password) => {
  return password.length >= 8;
};

// Helper function to parse full name
const parseFullName = (fullName) => {
  const parts = fullName.trim().split(' ');
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' ')
  };
};

// Store active sessions
const activeSessions = new Map();

// Valid service code
const VALID_SERVICE_CODE = '*384*36679#';

const handleUSSD = async (req, res) => {
  console.log('\n=== USSD Request Debug ===');
  console.log('Time:', new Date().toISOString());
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  
  const { sessionId, phoneNumber, serviceCode, text } = req.body;
  
  // Validate service code
  if (serviceCode !== VALID_SERVICE_CODE) {
    console.log('Invalid service code:', serviceCode);
    return res.send('END Invalid service code. Please use *384*36679#');
  }
  
  console.log('Session:', {
    sessionId,
    phoneNumber,
    serviceCode,
    text,
    currentStep: activeSessions.get(sessionId) || 'initial'
  });
  
  // Set response content type
  res.set('Content-Type', 'text/plain');

  try {
    // Initial menu
    if (!text) {
      console.log('Sending initial menu');
      activeSessions.set(sessionId, 'initial');
      const response = 'CON Welcome to SaccoSmart\n' +
        '1. Register\n' +
        '2. Check Balance\n' +
        '3. Apply for Loan\n' +
        '4. Make Contribution\n' +
        '5. Check Dividends';
      console.log('Response:', response);
      return res.send(response);
    }

    const textArray = text.split('*');
    const currentStep = textArray.length;
    const userInput = textArray[currentStep - 1];

    // Registration flow
    if (textArray[0] === '1') {
      switch (currentStep) {
        case 1: // After selecting Register
          activeSessions.set(sessionId, 'register_name');
          return res.send('CON Enter your full name:');

        case 2: // After entering name
          activeSessions.set(sessionId, 'register_email');
          return res.send('CON Enter your email:');

        case 3: // After entering email
          if (!isValidEmail(userInput)) {
            activeSessions.delete(sessionId);
            return res.send('END Invalid email format. Please try again.');
          }
          activeSessions.set(sessionId, 'register_role');
          return res.send('CON Select role:\n1. Member\n2. Treasurer\n3. Admin');

        case 4: // After selecting role
          const roleMap = { '1': 'member', '2': 'treasurer', '3': 'admin' };
          if (!roleMap[userInput]) {
            activeSessions.delete(sessionId);
            return res.send('END Invalid role selection. Please try again.');
          }
          activeSessions.set(sessionId, 'register_password');
          return res.send('CON Create a password (min 8 chars):');

        case 5: // After entering password
          if (!isValidPassword(userInput)) {
            activeSessions.delete(sessionId);
            return res.send('END Password must be at least 8 characters. Please try again.');
          }

          // Create new member
          const { firstName, lastName } = parseFullName(textArray[1]);
          const newMember = new Member({
            firstName,
            lastName,
            email: textArray[2],
            phoneNumber,
            role: roleMap[textArray[3]],
            password: userInput
          });

          await newMember.save();
          activeSessions.delete(sessionId);
          return res.send(`END Registration complete! Welcome to SaccoSmart.\nYour member code is: ${newMember.memberCode}`);

        default:
          activeSessions.delete(sessionId);
          return res.send('END Invalid input. Please start over.');
      }
    }

    // Check balance flow
    if (textArray[0] === '2') {
      const member = await Member.findOne({ phoneNumber });
      if (!member) {
        activeSessions.delete(sessionId);
        return res.send('END You are not registered. Please register first.');
      }
      activeSessions.delete(sessionId);
      return res.send(`END Your current balance is: KES ${member.balance.toFixed(2)}`);
    }

    // Invalid input
    activeSessions.delete(sessionId);
    return res.send('END Invalid selection. Please try again.');

  } catch (error) {
    console.error('USSD Error:', error);
    activeSessions.delete(sessionId);
    return res.send('END An error occurred. Please try again later.');
  }
};

module.exports = {
  handleUSSD
}; 