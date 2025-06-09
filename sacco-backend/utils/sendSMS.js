const AfricasTalking = require('africastalking');

// Initialize Africa's Talking
const africastalking = AfricasTalking({
    apiKey: process.env.AFRICASTALKING_API_KEY,
    username: process.env.AFRICASTALKING_USERNAME
});

// Get the SMS service
const sms = africastalking.SMS;

/**
 * Format phone number to Africa's Talking format
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
const formatPhoneNumber = (phone) => {
    if (!phone) return null;
    
    console.log('Formatting phone number:', phone);
    
    // Remove any non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    console.log('After removing non-digits:', cleaned);
    
    // If number starts with 0, replace with 254
    if (cleaned.startsWith('0')) {
        cleaned = '254' + cleaned.substring(1);
        console.log('After replacing 0:', cleaned);
    }
    
    // If number starts with +, remove it
    if (cleaned.startsWith('+')) {
        cleaned = cleaned.substring(1);
        console.log('After removing +:', cleaned);
    }
    
    // If number doesn't start with 254, add it
    if (!cleaned.startsWith('254')) {
        cleaned = '254' + cleaned;
        console.log('After adding 254:', cleaned);
    }
    
    // Ensure the number is exactly 12 digits (254 + 9 digits)
    if (cleaned.length !== 12) {
        console.log('Invalid length:', cleaned.length);
        return null;
    }
    
    // Add the + prefix as required by Africa's Talking
    const formatted = '+' + cleaned;
    console.log('Final formatted number:', formatted);
    return formatted;
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Whether the phone number is valid
 */
const isValidPhoneNumber = (phone) => {
    const formatted = formatPhoneNumber(phone);
    if (!formatted) return false;
    
    // Kenya phone numbers should be 13 digits (+254 + 9 digits)
    const isValid = formatted.length === 13 && formatted.startsWith('+254');
    console.log('Validation result for', phone, ':', isValid);
    return isValid;
};

/**
 * Send SMS to multiple recipients
 * @param {string[]} recipients - Array of phone numbers
 * @param {string} message - Message to send
 * @returns {Promise} - Promise resolving to the API response
 */
const sendBulkSMS = async (recipients, message) => {
    try {
        // Convert single recipient to array if needed
        const recipientsArray = Array.isArray(recipients) ? recipients : [recipients];
        console.log('Input recipients:', recipientsArray);

        if (!message || typeof message !== 'string') {
            throw new Error('Message is required and must be a string');
        }

        // Format and validate phone numbers
        const formattedRecipients = recipientsArray
            .map(phone => {
                console.log('Processing phone number:', phone);
                return formatPhoneNumber(phone);
            })
            .filter(phone => {
                const isValid = phone !== null && isValidPhoneNumber(phone);
                console.log('Filter result for', phone, ':', isValid);
                return isValid;
            });

        console.log('Final formatted recipients:', formattedRecipients);

        if (formattedRecipients.length === 0) {
            throw new Error('No valid phone numbers found');
        }

        const options = {
            to: formattedRecipients,
            message: message
        };

        console.log('Sending SMS with options:', {
            ...options,
            to: options.to,
            toType: typeof options.to,
            isArray: Array.isArray(options.to)
        });

        const response = await sms.send(options);
        console.log('SMS sent successfully:', response);
        return response;
    } catch (error) {
        console.error('Error sending SMS:', error);
        throw error;
    }
};

module.exports = {
    sendBulkSMS,
    formatPhoneNumber,
    isValidPhoneNumber
}; 