const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs').promises;

const router = express.Router();

// Rate limiting for contact submissions
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 contact requests per hour
  message: {
    error: 'Too many contact requests from this IP, please try again after an hour.'
  }
});

// Validation middleware for contact form
const validateContact = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  
  body('subject')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Subject must be less than 200 characters'),
  
  body('message')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters')
];

// Helper function to save contact data
async function saveContactData(contactData) {
  try {
    const dataDir = path.join(__dirname, '..', 'data');
    const contactsFile = path.join(dataDir, 'contacts.json');
    
    // Ensure data directory exists
    await fs.mkdir(dataDir, { recursive: true });
    
    // Read existing contacts
    let contacts = [];
    try {
      const existingData = await fs.readFile(contactsFile, 'utf8');
      contacts = JSON.parse(existingData);
    } catch (err) {
      // File doesn't exist yet, start with empty array
      contacts = [];
    }
    
    // Add new contact with timestamp and ID
    const newContact = {
      id: Date.now().toString(),
      ...contactData,
      timestamp: new Date().toISOString(),
      status: 'new'
    };
    
    contacts.push(newContact);
    
    // Save back to file
    await fs.writeFile(contactsFile, JSON.stringify(contacts, null, 2));
    
    return newContact;
  } catch (error) {
    console.error('Error saving contact data:', error);
    throw new Error('Failed to save contact data');
  }
}

// Helper function to send email notification
async function sendContactEmailNotification(contactData) {
  console.log('📧 Email notification for new contact message:');
  console.log('========================================');
  console.log('Name:', contactData.name);
  console.log('Email:', contactData.email);
  console.log('Subject:', contactData.subject || 'General Inquiry');
  console.log('Message:', contactData.message);
  console.log('Timestamp:', contactData.timestamp);
  console.log('========================================');
  
  // TODO: Implement actual email sending with nodemailer
  // Similar to the quote email function
}

// POST /api/contact - Submit a new contact message
router.post('/', contactLimiter, validateContact, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { name, email, subject, message } = req.body;

    // Prepare contact data
    const contactData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject ? subject.trim() : 'General Inquiry',
      message: message.trim(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    };

    // Save contact data
    const savedContact = await saveContactData(contactData);
    
    // Send email notification (async, don't wait for it)
    sendContactEmailNotification(savedContact).catch(error => {
      console.error('Contact email notification failed:', error);
    });

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Contact message sent successfully',
      contactId: savedContact.id,
      timestamp: savedContact.timestamp
    });

  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({
      error: 'Failed to send contact message',
      message: 'Please try again later or contact us directly'
    });
  }
});

// GET /api/contact - Get all contacts (for admin purposes)
router.get('/', async (req, res) => {
  try {
    const dataDir = path.join(__dirname, '..', 'data');
    const contactsFile = path.join(dataDir, 'contacts.json');
    
    try {
      const contactsData = await fs.readFile(contactsFile, 'utf8');
      const contacts = JSON.parse(contactsData);
      
      // Remove sensitive information for public access
      const sanitizedContacts = contacts.map(contact => ({
        id: contact.id,
        name: contact.name,
        subject: contact.subject,
        timestamp: contact.timestamp,
        status: contact.status
      }));
      
      res.json({
        success: true,
        count: sanitizedContacts.length,
        contacts: sanitizedContacts
      });
    } catch (err) {
      res.json({
        success: true,
        count: 0,
        contacts: []
      });
    }
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({
      error: 'Failed to fetch contacts'
    });
  }
});

// GET /api/contact/:id - Get specific contact by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const dataDir = path.join(__dirname, '..', 'data');
    const contactsFile = path.join(dataDir, 'contacts.json');
    
    try {
      const contactsData = await fs.readFile(contactsFile, 'utf8');
      const contacts = JSON.parse(contactsData);
      
      const contact = contacts.find(c => c.id === id);
      
      if (!contact) {
        return res.status(404).json({
          error: 'Contact not found'
        });
      }
      
      res.json({
        success: true,
        contact: {
          id: contact.id,
          name: contact.name,
          email: contact.email,
          subject: contact.subject,
          message: contact.message,
          timestamp: contact.timestamp,
          status: contact.status
        }
      });
    } catch (err) {
      res.status(404).json({
        error: 'Contact not found'
      });
    }
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({
      error: 'Failed to fetch contact'
    });
  }
});

module.exports = router;