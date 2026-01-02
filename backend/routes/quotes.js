const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs').promises;

const router = express.Router();

// Rate limiting for quote submissions
const quoteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 quote requests per hour
  message: {
    error: 'Too many quote requests from this IP, please try again after an hour.'
  }
});

// Validation middleware for quote form
const validateQuote = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('mobile')
    .trim()
    .isMobilePhone('any')
    .withMessage('Please enter a valid mobile number'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  
  body('company')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Company name must be between 2 and 200 characters'),
  
  body('requirements')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Requirements must be between 10 and 2000 characters')
];

// Helper function to save quote data
async function saveQuoteData(quoteData) {
  try {
    const dataDir = path.join(__dirname, '..', 'data');
    const quotesFile = path.join(dataDir, 'quotes.json');
    
    // Ensure data directory exists
    await fs.mkdir(dataDir, { recursive: true });
    
    // Read existing quotes
    let quotes = [];
    try {
      const existingData = await fs.readFile(quotesFile, 'utf8');
      quotes = JSON.parse(existingData);
    } catch (err) {
      // File doesn't exist yet, start with empty array
      quotes = [];
    }
    
    // Add new quote with timestamp and ID
    const newQuote = {
      id: Date.now().toString(),
      ...quoteData,
      timestamp: new Date().toISOString(),
      status: 'new'
    };
    
    quotes.push(newQuote);
    
    // Save back to file
    await fs.writeFile(quotesFile, JSON.stringify(quotes, null, 2));
    
    return newQuote;
  } catch (error) {
    console.error('Error saving quote data:', error);
    throw new Error('Failed to save quote data');
  }
}

// Helper function to send email notification
async function sendEmailNotification(quoteData) {
  // This is a placeholder - in a real implementation, you would use nodemailer
  // to send actual emails. For now, we'll just log the quote data.
  console.log('📧 Email notification for new quote:');
  console.log('=====================================');
  console.log('Name:', quoteData.name);
  console.log('Email:', quoteData.email);
  console.log('Mobile:', quoteData.mobile);
  console.log('Company:', quoteData.company);
  console.log('Requirements:', quoteData.requirements);
  console.log('Timestamp:', quoteData.timestamp);
  console.log('=====================================');
  
  // TODO: Implement actual email sending with nodemailer
  // const nodemailer = require('nodemailer');
  // const transporter = nodemailer.createTransporter({
  //   host: process.env.SMTP_HOST,
  //   port: process.env.SMTP_PORT,
  //   secure: process.env.SMTP_SECURE === 'true',
  //   auth: {
  //     user: process.env.SMTP_USER,
  //     pass: process.env.SMTP_PASS
  //   }
  // });
  
  // await transporter.sendMail({
  //   from: process.env.FROM_EMAIL,
  //   to: process.env.TO_EMAIL,
  //   subject: 'New Quote Request - Advantech Engineering',
  //   html: `
  //     <h2>New Quote Request Received</h2>
  //     <p><strong>Name:</strong> ${quoteData.name}</p>
  //     <p><strong>Email:</strong> ${quoteData.email}</p>
  //     <p><strong>Mobile:</strong> ${quoteData.mobile}</p>
  //     <p><strong>Company:</strong> ${quoteData.company}</p>
  //     <p><strong>Requirements:</strong></p>
  //     <p>${quoteData.requirements}</p>
  //     <hr>
  //     <p><em>Submitted at: ${quoteData.timestamp}</em></p>
  //   `
  // });
}

// POST /api/quotes - Submit a new quote request
router.post('/', quoteLimiter, validateQuote, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { name, mobile, email, company, requirements } = req.body;

    // Prepare quote data
    const quoteData = {
      name: name.trim(),
      mobile: mobile.trim(),
      email: email.trim().toLowerCase(),
      company: company.trim(),
      requirements: requirements.trim(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    };

    // Save quote data
    const savedQuote = await saveQuoteData(quoteData);
    
    // Send email notification (async, don't wait for it)
    sendEmailNotification(savedQuote).catch(error => {
      console.error('Email notification failed:', error);
    });

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Quote request submitted successfully',
      quoteId: savedQuote.id,
      timestamp: savedQuote.timestamp
    });

  } catch (error) {
    console.error('Quote submission error:', error);
    res.status(500).json({
      error: 'Failed to submit quote request',
      message: 'Please try again later or contact us directly'
    });
  }
});

// GET /api/quotes - Get all quotes (for admin purposes)
router.get('/', async (req, res) => {
  try {
    const dataDir = path.join(__dirname, '..', 'data');
    const quotesFile = path.join(dataDir, 'quotes.json');
    
    try {
      const quotesData = await fs.readFile(quotesFile, 'utf8');
      const quotes = JSON.parse(quotesData);
      
      // Remove sensitive information for public access
      const sanitizedQuotes = quotes.map(quote => ({
        id: quote.id,
        name: quote.name,
        company: quote.company,
        timestamp: quote.timestamp,
        status: quote.status
      }));
      
      res.json({
        success: true,
        count: sanitizedQuotes.length,
        quotes: sanitizedQuotes
      });
    } catch (err) {
      res.json({
        success: true,
        count: 0,
        quotes: []
      });
    }
  } catch (error) {
    console.error('Error fetching quotes:', error);
    res.status(500).json({
      error: 'Failed to fetch quotes'
    });
  }
});

// GET /api/quotes/:id - Get specific quote by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const dataDir = path.join(__dirname, '..', 'data');
    const quotesFile = path.join(dataDir, 'quotes.json');
    
    try {
      const quotesData = await fs.readFile(quotesFile, 'utf8');
      const quotes = JSON.parse(quotesData);
      
      const quote = quotes.find(q => q.id === id);
      
      if (!quote) {
        return res.status(404).json({
          error: 'Quote not found'
        });
      }
      
      res.json({
        success: true,
        quote: {
          id: quote.id,
          name: quote.name,
          email: quote.email,
          mobile: quote.mobile,
          company: quote.company,
          requirements: quote.requirements,
          timestamp: quote.timestamp,
          status: quote.status
        }
      });
    } catch (err) {
      res.status(404).json({
        error: 'Quote not found'
      });
    }
  } catch (error) {
    console.error('Error fetching quote:', error);
    res.status(500).json({
      error: 'Failed to fetch quote'
    });
  }
});

module.exports = router;