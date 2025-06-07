const express = require('express');
const router = express.Router();
const twilio = require('twilio');


const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioWhatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

if (!accountSid || !authToken || !twilioWhatsappNumber) {
  console.error('Missing required Twilio environment variables');
  process.exit(1);
}

const client = twilio(accountSid, authToken);


const { urlencoded } = require('body-parser');
const twilioWebhook = twilio.webhook(authToken);


const chatSessions = new Map();


const validatePhoneNumber = (number) => {
  
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(number.replace(/\D/g, ''));
};


router.post('/webhook/incoming', urlencoded({ extended: false }), twilioWebhook, async (req, res) => {
  try {
    console.log("Incoming WhatsApp message:", req.body);

    const incomingMessage = req.body.Body;
    const senderNumber = req.body.From;
    const messageId = req.body.MessageSid;

    // Validate incoming data
    if (!incomingMessage || !senderNumber) {
      console.error('Missing required message data');
      return res.status(400).send('Missing required message data');
    }

    // Log the message
    console.log(`Message from ${senderNumber}: ${incomingMessage}`);

    // Store message in chat session
    if (!chatSessions.has(senderNumber)) {
      chatSessions.set(senderNumber, []);
    }
    chatSessions.get(senderNumber).push({
      id: messageId,
      text: incomingMessage,
      timestamp: new Date(),
      direction: 'incoming'
    });

    // Process the message and generate response
    const replyMessage = await processIncomingMessage(incomingMessage);

    // Send response
    await client.messages.create({
      body: replyMessage,
      from: twilioWhatsappNumber,
      to: senderNumber,
    });

    // Store response in chat session
    chatSessions.get(senderNumber).push({
      id: `response-${Date.now()}`,
      text: replyMessage,
      timestamp: new Date(),
      direction: 'outgoing'
    });

    console.log("Response sent successfully");
    res.status(200).send();
  } catch (error) {
    console.error("Error processing incoming message:", error);
    res.status(500).send('Error processing message');
  }
});

// Process incoming message and generate appropriate response
async function processIncomingMessage(message) {
  // Convert message to lowercase for easier matching
  const lowerMessage = message.toLowerCase();

  // Simple response logic - can be enhanced with more sophisticated processing
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return 'Hello! How can I help you today?';
  } else if (lowerMessage.includes('help')) {
    return 'I can help you with:\n- Account information\n- Contribution details\n- Loan applications\n- General inquiries\nWhat would you like to know?';
  } else if (lowerMessage.includes('thank')) {
    return 'You\'re welcome! Is there anything else I can help you with?';
  }

  // Default response
  return 'Thank you for your message. Our team will respond shortly.';
}
     
// Endpoint to send a WhatsApp message
router.post('/send-message', async (req, res) => {
  try {
    const { to, body } = req.body;

    // Validate request
    if (!to || !body) {
      return res.status(400).json({
        error: "Missing required fields",
        details: "Both 'to' and 'body' are required"
      });
    }

    // Validate phone number
    if (!validatePhoneNumber(to)) {
      return res.status(400).json({
        error: "Invalid phone number",
        details: "Please provide a valid phone number"
      });
    }

    // Format phone number for WhatsApp
    const recipientWhatsappNumber = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

    // Send message
    const message = await client.messages.create({
      body: body,
      from: twilioWhatsappNumber,
      to: recipientWhatsappNumber,
    });

    // Store message in chat session
    if (!chatSessions.has(recipientWhatsappNumber)) {
      chatSessions.set(recipientWhatsappNumber, []);
    }
    chatSessions.get(recipientWhatsappNumber).push({
      id: message.sid,
      text: body,
      timestamp: new Date(),
      direction: 'outgoing'
    });

    console.log("Message sent successfully:", message.sid);
    res.json({
      success: true,
      sid: message.sid,
      timestamp: new Date()
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      error: "Failed to send message",
      details: error.message
    });
  }
});

// Get chat history for a number
router.get('/chat-history/:number', (req, res) => {
  const { number } = req.params;
  const formattedNumber = number.startsWith('whatsapp:') ? number : `whatsapp:${number}`;
  
  const history = chatSessions.get(formattedNumber) || [];
  res.json({ history });
});

module.exports = router;
