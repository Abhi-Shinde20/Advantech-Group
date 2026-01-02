# Advantech Engineering - Deployment Guide

This guide will help you deploy the Advantech Engineering website to Netlify with a proper backend API.

## 🚀 Frontend Deployment (Netlify)

### Prerequisites
- GitHub account with your code
- Netlify account (free tier available)

### Steps

1. **Connect GitHub to Netlify:**
   - Go to [netlify.com](https://netlify.com) and sign up/login
   - Click "New site from Git"
   - Choose GitHub and authorize Netlify
   - Select your Advantech repository

2. **Configure Build Settings:**
   - **Build command:** Leave empty (static site)
   - **Publish directory:** Leave empty (use root)
   - **Branch to deploy:** `main`

3. **Environment Variables (Optional):**
   If you want to use environment variables for API URLs:
   - Go to Site settings > Environment variables
   - Add `NODE_ENV` = `production`
   - Add `API_BASE_URL` = `your-backend-url` (you'll set this later)

4. **Deploy:**
   - Click "Deploy site"
   - Netlify will automatically build and deploy your site
   - You'll get a URL like `https://amazing-site-123456.netlify.app`

### Custom Domain (Optional)
- Go to Site settings > Domain management
- Add custom domain if you have one
- Follow Netlify's DNS configuration instructions

## 🔧 Backend Deployment Options

### Option 1: Netlify + Neon Database (Recommended)

#### Set up Neon Database:
1. **Install Neon Extension in Netlify:**
   - Go to your Netlify site dashboard
   - Navigate to "Extensions" in the sidebar
   - Search for "Neon" and install it
   - Create a new database or connect existing one
   - Copy the connection string

2. **Get Connection String:**
   - In your Neon dashboard, go to your database
   - Click on "Connection Details"
   - Copy the "Connection String" (URI format)
   - It will look like: `postgresql://username:password@ep-example-12345.us-east-1.aws.neon.tech/advantech?sslmode=require`

3. **Update Backend Configuration:**
   - Add the connection string to your backend environment variables
   - The backend will automatically create the necessary tables on startup

4. **Database Tables Created Automatically:**
   - `quotes` table for quote requests
   - `contacts` table for contact form submissions
   - Proper indexes for performance

2. **Configure Backend Environment:**
   ```bash
   # In your backend/.env file
   DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
   NODE_ENV=production
   PORT=3001
   ```

3. **Deploy Backend to Railway/DigitalOcean:**
   - Set the DATABASE_URL environment variable with your Neon connection string
   - Deploy as usual

### Option 2: Heroku (Recommended for beginners)

1. **Install Heroku CLI:**
   - Download from [heroku.com](https://heroku.com)

2. **Prepare for deployment:**
   ```bash
   cd backend
   git init
   git add .
   git commit -m "Backend for Advantech"
   ```

3. **Create Heroku app:**
   ```bash
   heroku create advantech-backend-api
   ```

4. **Set environment variables:**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set PORT=3001
   heroku config:set DATABASE_URL=your-neon-connection-string
   # Add your email settings
   heroku config:set SMTP_HOST=smtp.gmail.com
   heroku config:set SMTP_USER=your-email@gmail.com
   heroku config:set SMTP_PASS=your-app-password
   heroku config:set FROM_EMAIL=noreply@advantech.com
   heroku config:set TO_EMAIL=info@advantech.com
   ```

5. **Deploy:**
   ```bash
   git push heroku main
   ```

6. **Your backend will be available at:**
   `https://advantech-backend-api.herokuapp.com`

### Option 2: Railway

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and deploy:**
   ```bash
   railway login
   railway init
   railway up
   ```

### Option 3: DigitalOcean App Platform

1. **Connect your GitHub repo**
2. **Create new app**
3. **Configure:**
   - **Source directory:** `backend`
   - **Run command:** `npm start`
   - **Environment:** Node.js

## 🗄️ Database Upgrade: Neon PostgreSQL

### What's New with Neon Integration:
✅ **Professional Database** - Replaced JSON file storage with PostgreSQL
✅ **Scalable Architecture** - Handle thousands of requests efficiently
✅ **Data Integrity** - ACID compliance and data consistency
✅ **Better Performance** - Indexed queries and connection pooling
✅ **Backup & Recovery** - Automatic backups with point-in-time recovery
✅ **Real-time Features** - Ready for future real-time functionality
✅ **Production Ready** - Enterprise-grade database infrastructure

### Database Features:
- **Automatic Table Creation** - Tables created automatically on first startup
- **Connection Pooling** - Efficient database connection management
- **Query Optimization** - Proper indexing for fast searches
- **SSL Security** - Encrypted connections for data protection
- **Health Monitoring** - Database health checks in API responses

##  Connecting Frontend to Backend

### Update Frontend API Configuration

After deploying your backend, update the frontend to use the correct API URL:

**Option 1: Environment Variable (Recommended)**
Update your Netlify site settings:
- Go to Site settings > Environment variables
- Add `VITE_API_BASE_URL` = `https://your-backend-url.herokuapp.com`

Then update your JavaScript:
```javascript
// In js/script.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (process.env.NODE_ENV === 'production' ? 'https://your-backend-url.herokuapp.com' : 'http://localhost:3001');
```

**Option 2: Direct URL Update**
Update the API_BASE_URL in your JavaScript file:
```javascript
// In js/script.js
const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://advantech-backend-api.herokuapp.com' // Your production backend URL
    : 'http://localhost:3001';
```

### Update CORS Settings
Make sure your backend allows requests from your Netlify domain:

**In backend/server.js:**
```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:8080',
    'https://your-site.netlify.app', // Add your Netlify URL
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## 🧪 Testing Your Deployment

### Test Backend API
1. **Start your backend locally first:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Run the test suite:**
   ```bash
   npm test
   ```

3. **Test the deployed backend:**
   ```bash
   curl https://your-backend-url.herokuapp.com/api/health
   ```

### Test Frontend
1. **Visit your Netlify site**
2. **Click "Request a Quote" button**
3. **Fill and submit the form**
4. **Check browser console for any errors**
5. **Verify form submission works**

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env` files to Git
- Use Netlify/Heroku environment variables for sensitive data
- Rotate passwords and API keys regularly

### CORS Configuration
- Only allow requests from your actual domain
- Don't use wildcard (*) in production

### Rate Limiting
- The backend includes rate limiting by default
- Monitor for unusual traffic patterns

### Input Validation
- All inputs are validated on the backend
- Additional client-side validation is included

## 📊 Monitoring and Maintenance

### Backend Monitoring
- **Heroku:** Use `heroku logs --tail` to view logs
- **Railway:** Use Railway dashboard for logs and metrics
- **DigitalOcean:** Use App Platform dashboard

### Frontend Monitoring
- **Netlify:** Use Netlify dashboard for deploy logs
- **Analytics:** Consider adding Google Analytics
- **Error Tracking:** Consider Sentry for error monitoring

### Regular Maintenance
1. **Update dependencies regularly:**
   ```bash
   npm update
   ```

2. **Monitor disk space** (JSON files accumulate data)
3. **Backup data regularly** (export JSON files)
4. **Monitor API usage** and rate limits

## 🆘 Troubleshooting

### Common Issues

**CORS Errors:**
- Check backend CORS configuration
- Verify frontend URL is correct
- Check browser network tab for details

**API Not Responding:**
- Check backend logs for errors
- Verify environment variables are set
- Test with curl or Postman

**Form Submission Fails:**
- Check browser console for errors
- Verify API endpoint is correct
- Check backend logs for validation errors

**Deployment Fails:**
- Check build logs in Netlify/Heroku
- Verify all dependencies are listed in package.json
- Check for syntax errors in code

### Getting Help

1. **Check logs first** - they usually contain the error message
2. **Test locally first** - make sure everything works locally
3. **Check environment variables** - missing or incorrect values
4. **Verify network connectivity** - can your backend reach external services?

## 🎯 Next Steps

After successful deployment:

1. **Set up monitoring** and alerts
2. **Configure backup** for your data
3. **Set up SSL** if using custom domain
4. **Configure email** for notifications
5. **Add analytics** to track usage
6. **Set up CI/CD** for automated deployments

Your Advantech Engineering website is now ready for production! 🚀