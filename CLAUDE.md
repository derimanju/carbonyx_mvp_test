# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the Carbonyx MVP - a carbon credit trading platform landing page for Korean solar power companies. The project helps solar power generators monetize their carbon credits (KCU - Korean Credit Units) before they expire.

## Architecture

### Frontend Structure
- **Single Page Application**: Vanilla HTML/CSS/JavaScript with no build process
- **External Dependencies**: Only Supabase client library loaded via CDN
- **Responsive Design**: Mobile-first approach with CSS Grid and Flexbox

### JavaScript Module System
The project uses a layered JavaScript architecture with clear separation of concerns:

1. **Configuration Layer** (`assets/js/config.js`)
   - Environment detection (development vs production)
   - Supabase credentials and API endpoints
   - Debug flags and timeouts

2. **Database Layer** (`assets/js/supabase-client.js`)
   - Supabase client initialization with retry logic
   - CRUD operations for all data tables
   - Real-time subscriptions for market prices
   - Comprehensive error handling

3. **Fallback Layer** (`assets/js/fallback-form.js`)
   - Offline-capable form submission
   - Local storage persistence for failed submissions
   - Korean phone number validation
   - Enhanced form processing with dual submission paths

4. **Application Layer** (`assets/js/script.js`)
   - Main UI interactions and animations
   - Countdown timer (targets 2025-12-31)
   - Revenue calculator (Generation → KCU conversion factor: ×0.459)
   - Form handling with enhanced error recovery

### Database Schema
The Supabase PostgreSQL database uses 4 main tables:
- `pre_registrations`: Customer pre-registration data
- `market_prices`: Real-time KCU pricing (min/avg/max/recommended)
- `calculator_usage`: Revenue calculator interaction logs
- `page_analytics`: Page visit and session tracking

Row Level Security (RLS) is enabled with public read access for market prices and public insert access for user-generated data.

## Development Workflow

### Local Development
```bash
# Simple static server (no build process required)
python -m http.server 8000
# or
npx serve .
```

### Testing Form Submission
The application has dual submission paths:
1. **Primary**: Supabase database storage
2. **Fallback**: localStorage with error recovery

To test both paths:
```javascript
// Check Supabase connection
CarbonyxApp.debug.checkSupabaseStatus()

// View local form submissions
getLocalFormSubmissions()

// Clear local storage
clearLocalFormSubmissions()
```

### Database Setup
Execute the complete schema in Supabase SQL Editor:
```bash
# File contains full schema with tables, indexes, RLS policies, and initial data
database-schema.sql
```

### Environment Configuration
- Development: Automatic detection via hostname
- Production: `carbonyx.co.kr` or `.vercel.app` domains
- Supabase credentials are in `assets/js/config.js` (should be moved to environment variables for production)

## Key Business Logic

### Revenue Calculator
Korean solar power revenue calculation:
- **Input**: Generation amount in MWh
- **Conversion**: Generation × 0.459 = KCU amount
- **Pricing**: KCU × market_price (₩3,000 - ₩15,000 range)
- **Output**: Revenue estimation in Korean Won

### Countdown Timer
Targets 2025-12-31 23:59:59 KST (Korean Standard Time) representing the deadline for 2025-issued carbon credits trading.

### Form Validation
Korean business context validation:
- Company name: minimum 2 characters
- Contact name: minimum 2 characters
- Phone: Korean phone number patterns (010-XXXX-XXXX format)
- Email: optional but validated if provided

## External Service Integration

The project includes comprehensive integration guides in `/docs/external-services/`:
- Vercel hosting deployment
- Supabase database setup
- Google Analytics 4 tracking
- EmailJS email notifications
- Cloudflare CDN and security

## Error Handling Strategy

### Form Submission Resilience
1. **Primary submission** via Supabase with connection testing
2. **Automatic fallback** to localStorage if Supabase fails
3. **User-friendly error messages** with direct contact information
4. **Retry logic** for transient network failures

### Debugging Tools
Global debugging interface available via `CarbonyxApp.debug`:
```javascript
// Check system status
CarbonyxApp.debug.checkSupabaseStatus()
CarbonyxApp.debug.checkFormHandler()
CarbonyxApp.debug.runConnectionTest()
```

## Security Considerations

- Supabase API keys are currently in source code (needs environment variable migration)
- RLS policies restrict data access appropriately
- Form validation prevents malicious input
- No sensitive data is logged to console in production mode

## File Structure Notes

- `/assets/css/style.css`: Complete responsive stylesheet, no CSS preprocessing
- `/assets/js/`: All JavaScript modules with clear separation of concerns
- `/assets/images/`: Image assets (logo, etc.)
- `/docs/external-services/`: Comprehensive integration guides for all external services
- `database-schema.sql`: Complete database schema ready for Supabase SQL Editor
- No package.json or build configuration - pure static site approach