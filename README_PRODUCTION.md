
# AonePrimeFX - Production Deployment

## Quick Start for Production

### 1. Environment Setup
```bash
# Clone and install
git clone <your-repo>
cd aoneprimefx-platform
npm install

# Build for production
npm run build
```

### 2. Required Environment Variables
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your-key
VITE_ALPHA_VANTAGE_API_KEY=your-alpha-vantage-key
```

### 3. Database Setup
1. Create Supabase project
2. Run `supabase_schema.sql`
3. Run `supabase_admin_setup.sql`
4. Configure RLS policies

### 4. Production Checklist
- [ ] SSL certificate configured
- [ ] Environment variables secured
- [ ] Database migrations applied
- [ ] Admin user created
- [ ] API keys configured
- [ ] Error tracking enabled
- [ ] Performance monitoring active

### 5. Deployment Options

#### Vercel (Recommended)
```bash
npm i -g vercel
vercel --prod
```

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

#### Traditional Hosting
1. Build: `npm run build`
2. Upload `dist/` folder
3. Configure web server (Apache/Nginx)

### 6. Post-Deployment
1. Test all critical user journeys
2. Monitor error logs
3. Verify API integrations
4. Check performance metrics
5. Set up monitoring alerts

### 7. Maintenance
- Regular security updates
- Database backups (automatic with Supabase)
- API quota monitoring
- Performance optimization
- User feedback monitoring

For detailed instructions, see `DEPLOYMENT_GUIDE.md`.
