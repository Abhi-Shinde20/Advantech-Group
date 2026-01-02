# Advantech Engineering Backend API

A robust Node.js/Express backend API for the Advantech Engineering automotive components website.

## Features

- 📧 **Quote Request Management** - Handle quote submissions with validation
- 📞 **Contact Form Processing** - Process general contact inquiries  
- 🔒 **Security** - Rate limiting, input validation, CORS protection
- 📊 **Data Storage** - JSON-based storage with backup capabilities
- 🚀 **Performance** - Optimized for speed and reliability
- 📱 **CORS Enabled** - Ready for frontend integration

## Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone and setup:**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the server:**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

4. **Test the API:**
   ```bash
   curl http://localhost:3001/api/health
   ```

## API Endpoints

### Health Check
- **GET** `/api/health` - Server health status

### Quote Management
- **POST** `/api/quotes` - Submit new quote request
- **GET** `/api/quotes` - Get all quotes (admin)
- **GET** `/api/quotes/:id` - Get specific quote

### Contact Management  
- **POST** `/api/contact` - Submit contact message
- **GET** `/api/contact` - Get all contacts (admin)
- **GET** `/api/contact/:id` - Get specific contact

## API Documentation

### Submit Quote Request

**Endpoint:** `POST /api/quotes`

**Request Body:**
```json
{
  "name": "John Doe",
  "mobile": "+91 9876543210",
  "email": "john@company.com",
  "company": "ABC Motors",
  "requirements": "Need 1000 brake levers for two-wheeler assembly"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Quote request submitted successfully",
  "quoteId": "1640995200000",
  "timestamp": "2025-01-02T12:00:00.000Z"
}
```

### Submit Contact Message

**Endpoint:** `POST /api/contact`

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "subject": "Partnership Inquiry",
  "message": "We are interested in discussing a long-term partnership for automotive components supply."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Contact message sent successfully",
  "contactId": "1640995200001",
  "timestamp": "2025-01-02T12:00:01.000Z"
}
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment mode | development |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 |
| `SMTP_HOST` | Email server host | smtp.gmail.com |
| `SMTP_PORT` | Email server port | 587 |
| `SMTP_USER` | Email username | - |
| `SMTP_PASS` | Email password/app password | - |
| `FROM_EMAIL` | From email address | - |
| `TO_EMAIL` | To email address | - |

### Email Setup

To enable email notifications:

1. Create a `.env` file from `.env.example`
2. Configure SMTP settings (Gmail example):
   - Enable 2-factor authentication
   - Generate app password
   - Use app password in `SMTP_PASS`
3. Set `FROM_EMAIL` and `TO_EMAIL`

### Rate Limiting

- **Quotes:** 5 requests per hour per IP
- **Contact:** 10 requests per hour per IP  
- **General API:** 100 requests per 15 minutes per IP

## Data Storage

### JSON File Storage
- Quotes: `backend/data/quotes.json`
- Contacts: `backend/data/contacts.json`
- Automatic backup and error handling
- Data structure with timestamps and IDs

### Sample Data Structure
```json
[
  {
    "id": "1640995200000",
    "name": "John Doe",
    "email": "john@company.com",
    "mobile": "+91 9876543210",
    "company": "ABC Motors",
    "requirements": "Need brake levers...",
    "timestamp": "2025-01-02T12:00:00.000Z",
    "status": "new"
  }
]
```

## Security Features

- **Input Validation** - All inputs validated and sanitized
- **Rate Limiting** - Prevents spam and abuse
- **CORS Protection** - Configurable cross-origin policies
- **Helmet.js** - Security headers protection
- **Request Logging** - Comprehensive audit trail

## Development

### Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests (placeholder)
```

### Project Structure
```
backend/
├── server.js           # Main server file
├── routes/             # API route handlers
│   ├── quotes.js       # Quote management routes
│   └── contact.js      # Contact form routes
├── data/               # JSON data storage
├── package.json        # Dependencies and scripts
├── .env.example        # Environment template
└── README.md          # This file
```

### Adding New Features

1. **Create Route Handler:**
   ```javascript
   // routes/newfeature.js
   const express = require('express');
   const router = express.Router();
   
   router.get('/', (req, res) => {
     res.json({ message: 'New feature endpoint' });
   });
   
   module.exports = router;
   ```

2. **Register Route:**
   ```javascript
   // server.js
   const newFeatureRoutes = require('./routes/newfeature');
   app.use('/api/newfeature', newFeatureRoutes);
   ```

## Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure production database (optional)
3. Set up proper email credentials
4. Configure firewall and security

### Production Considerations
- Use PM2 for process management
- Set up log rotation
- Configure SSL/HTTPS
- Set up monitoring and alerts
- Regular data backups

## Troubleshooting

### Common Issues

**Port Already in Use:**
```bash
# Find process using port 3001
lsof -i :3001
# Kill process
kill -9 <PID>
```

**Email Not Sending:**
- Check SMTP credentials
- Verify app passwords (Gmail)
- Check firewall settings
- Review error logs

**CORS Errors:**
- Verify `FRONTEND_URL` in `.env`
- Check browser network tab
- Ensure proper HTTP headers

### Logs
Check console output and log files for detailed error information.

## Support

For technical support or questions:
- Check API health: `GET /api/health`
- Review error messages in response
- Check server console for detailed logs

## License

MIT License - see LICENSE file for details.