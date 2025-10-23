# 🥗 HealthCoach Web

Next.js frontend for the HealthCoach API. Track your nutrition with AI-powered food analysis.

## Features

- 🔐 **AWS Cognito Authentication** - Secure user signup/login
- 📱 **Responsive Design** - Works on all devices
- 🍔 **Food Logging** - Track meals throughout the day
- 📸 **Photo Upload** - Snap pics of your meals
- 🤖 **AI Analysis** - Get nutrition insights (coming soon)
- 📊 **Dashboard** - View your food history

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **AWS Amplify** - Cognito auth integration
- **Axios** - API client
- **Vercel** - Deployment platform

## Prerequisites

1. **Backend API deployed** - See `../healthcoach-api`
2. **Environment variables** from AWS deployment

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create `.env.local` file:

```bash
NEXT_PUBLIC_API_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/prod
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID=1234567890abcdefghijk
NEXT_PUBLIC_AWS_REGION=us-east-1
```

**Get these values** from your AWS deployment (see `ENV_SETUP.md`).

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Test the App

1. Go to `/signup` - Create an account
2. Check your email for verification code
3. Verify and login
4. Start logging food!

## Project Structure

```
healthcoach-web/
├── app/
│   ├── page.tsx           # Landing page
│   ├── login/page.tsx     # Login page
│   ├── signup/page.tsx    # Signup + verification
│   └── dashboard/         # Protected dashboard
├── components/
│   └── AuthProvider.tsx   # Amplify config
├── lib/
│   ├── api.ts            # API client
│   └── amplify.ts        # Amplify setup
├── .env.local            # Environment variables (create this!)
└── vercel.json           # Vercel config
```

## Deploy to Vercel

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for complete deployment guide.

### Quick Deploy

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Production
vercel --prod
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | API Gateway endpoint | `https://abc.execute-api.us-east-1.amazonaws.com/prod` |
| `NEXT_PUBLIC_COGNITO_USER_POOL_ID` | Cognito User Pool ID | `us-east-1_XXXXXXXXX` |
| `NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID` | Cognito Client ID | `1234567890abcdefghijk` |
| `NEXT_PUBLIC_AWS_REGION` | AWS Region | `us-east-1` |

## API Integration

The app integrates with the HealthCoach API:

```typescript
import { apiClient } from '@/lib/api';

// Get food logs
const logs = await apiClient.getFoodLogs();

// Create food log
const log = await apiClient.createFoodLog({
  mealType: 'breakfast',
  notes: 'Oatmeal with berries'
});
```

All requests automatically include JWT authentication token from Cognito.

## Development Tips

- **Hot Reload**: Changes auto-reload in development
- **TypeScript**: All files use TypeScript for type safety
- **Tailwind**: Use utility classes for styling
- **Client Components**: Use `'use client'` for interactive components

## Troubleshooting

### "Invalid auth state"
- Check `.env.local` variables are set
- Restart dev server after adding variables

### "Network request failed"
- Verify backend API is deployed
- Check API_URL is correct
- Test API endpoint directly

### "User pool does not exist"
- Verify Cognito User Pool ID
- Check AWS region matches

## Next Steps

- [ ] Add photo upload UI
- [ ] Integrate AI food analysis
- [ ] Add nutrition charts
- [ ] Implement habit tracking
- [ ] Add daily calorie goals
- [ ] Social features

## Documentation

- [ENV_SETUP.md](ENV_SETUP.md) - Environment setup guide
- [DEPLOYMENT.md](DEPLOYMENT.md) - Vercel deployment guide
- [Next.js Docs](https://nextjs.org/docs)
- [AWS Amplify Docs](https://docs.amplify.aws/)

## License

MIT
