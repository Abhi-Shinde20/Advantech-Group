const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { query } = require('../config/database');

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

// Helper function to save contact data to PostgreSQL
async function saveContactData(contactData) {
  try {
    const result = await query(
      `INSERT INTO contacts (name, email, subject, message, ip_address, user_agent, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id, timestamp, status`,
      [
        contactData.name,
        contactData.email,
        contactData.subject,
        contactData.message,
        contactData.ipAddress,
        contactData.userAgent,
        'new'
      ]
    );
    
    return {
      id: result.rows[0].id.toString(),
      timestamp: result.rows[0].timestamp,
      status: result.rows[0].status
    };
  } catch (error) {
    console.error('Error saving contact data to database:', error);
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
    const result = await query(
      `SELECT id, name, subject, timestamp, status 
       FROM contacts 
       ORDER BY timestamp DESC 
       LIMIT 100`
    );
    
    res.json({
      success: true,
      count: result.rows.length,
      contacts: result.rows.map(row => ({
        id: row.id.toString(),
        name: row.name,
        subject: row.subject,
        timestamp: row.timestamp,
        status: row.status
      }))
    });
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
    const result = await query(
      `SELECT id, name, email, subject, message, timestamp, status 
       FROM contacts 
       WHERE id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Contact not found'
      });
    }
    
    const contact = result.rows[0];
    res.json({
      success: true,
      contact: {
        id: contact.id.toString(),
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        message: contact.message,
        timestamp: contact.timestamp,
        status: contact.status
      }
    });
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({
      error: 'Failed to fetch contact'
    });
  }
});

module.exports = router;