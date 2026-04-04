# 🚀 Complete Setup & Deployment Guide

## Table of Contents
1. [Local Development Setup](#local-development-setup)
2. [Production Deployment](#production-deployment)
3. [Making it Mobile-Friendly](#making-it-mobile-friendly)
4. [QR Scanner Integration](#qr-scanner-integration)
5. [Backup & Migration](#backup--migration)
6. [Troubleshooting](#troubleshooting)

---

## Local Development Setup

### Step 1: Prerequisites
Ensure you have the following installed:
- **Node.js** 18+ (check: `node --version`)
- **npm** 9+ (check: `npm --version`)
- **Git** (optional, for version control)

### Step 2: Initial Setup

```bash
# Navigate to project directory
cd /home/zamine/PauseDejCaffe

# Install all dependencies
npm install

# Create the data directory for SQLite
mkdir -p data

# Build the application
npm run build
```

### Step 3: Start Development Server

```bash
# Start with hot reload (best for development)
npm run dev
```

**Output:**
```
  ▲ Next.js 16.2.2

  - Local:        http://localhost:3000/
  - Environments: .env.local
```

Open your browser to **http://localhost:3000** 🎉

### Step 4: Add Example Data (Optional)

To populate the database with sample participants:

```bash
# Add 8 example participants to the database
npm run ts-node scripts/seed.ts
```

This adds:
- Alice Johnson (Pasta Carbonara, Espresso)
- Bob Smith (Caesar Salad, Cappuccino)
- Charlie Brown (Grilled Cheese, Latte)
- Diana Prince (Quinoa Bowl, Macchiato)
- Eve Wilson (Burger & Fries, Americano)
- Frank Miller (Chicken Wings, Cappuccino)
- Grace Lee (Vegetarian Pizza, Flat White)
- Henry Davis (Sous Vide Steak, Espresso Con Panna)

---

## Production Deployment

### Option 1: Run on Same Machine

```bash
# Exit development server (Ctrl+C)

# Build for production
npm run build

# Start production server
npm start

# Application runs on http://localhost:3000
```

### Option 2: Use Process Manager (Recommended)

Install PM2 for automatic restarts:

```bash
# Install PM2 globally
npm install -g pm2

# Start application with PM2
pm2 start npm --name "event-manager" -- start

# View logs
pm2 logs event-manager

# Stop application
pm2 stop event-manager

# Restart on reboot
pm2 startup
pm2 save
```

### Option 3: Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t event-manager .
docker run -p 3000:3000 -v $(pwd)/data:/app/data event-manager
```

### Option 4: Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

**Note:** SQLite won't persist on Vercel. Use their PostgreSQL add-on instead.

---

## Making it Mobile-Friendly

### 1. Create QR Codes at Scale

```bash
# Generate QR codes for all participants
```

Steps in UI:
1. Open admin dashboard
2. Add all participants first
3. Click "📱 Generate QR Codes"
4. Click "👁️ View QR Codes"
5. Download each QR code
6. Print on label paper or display on screens

### 2. Printing QR Codes

**Option A: Label Printer**
- Print on 1" x 1" adhesive labels
- Stick to cups, bags, or badges

**Option B: Large Format**
- Print on A4 (8.5" x 11") paper
- Display on tables or screens
- Participants scan with phone

**Option C: Digital Display**
- Display QR codes on projector
- Staff scan with tablets/phones

### 3. Mobile Scanning Workflow

For staff using phones:

1. **Setup:**
   - Install any standard QR code reader app
   - Or use built-in camera app (iOS 15+, Android 8+)

2. **Scanning:**
   - Point camera at QR code
   - Tap notification/link
   - Scanner page opens automatically
   - Click button to mark as taken

3. **Tips:**
   - Use larger QR codes (3"x3" minimum)
   - Good lighting essential
   - Slightly curved surfaces can affect scanning

### 4. Optimize for Tablets

The scanner page is responsive. For best experience on tablets:

```css
/* Already optimized in code:
   - Portrait & Landscape
   - Large tap targets
   - Full-screen display
   - Minimal scrolling
*/
```

---

## QR Scanner Integration

### Using Device Camera (Recommended)

Modern phones can scan QR codes with the built-in camera:

**iOS 15+:**
1. Open Camera app
2. Point at QR code
3. Tap notification
4. Opens link automatically

**Android 8+:**
1. Open Google Lens or camera
2. Point at QR code
3. Tap notification
4. Opens link automatically

### Install QR Scanner App (Fallback)

If device doesn't have built-in scanner:

**iOS:**
- Download "QR Code Reader" by Scan (free)

**Android:**
- Download "QR Code Scanner" by AppCraft (free)

Both apps can scan and open URLs automatically.

---

## Backup & Migration

### Backup Database

```bash
# Copy the SQLite database
cp data/event.db data/event.db.backup

# Or schedule automatic backups
# (Mac/Linux)
* 0 * * * cp /path/to/PauseDejCaffe/data/event.db /backups/event.db.$(date +\%Y\%m\%d)
```

### Export Data to CSV

1. Open admin dashboard
2. Click "📥 Export CSV"
3. File downloads: `participants-YYYY-MM-DD.csv`
4. Can be imported in Excel, Google Sheets, etc.

### Migrate to Another Machine

```bash
# On original machine:
# Copy the entire project folder
scp -r /home/zamine/PauseDejCaffe user@newmachine:/home/user/

# On new machine:
cd /home/user/PauseDejCaffe
npm install
npm run build
npm start
```

---

## Configuring Custom Domain

### If Running on Network

Get your machine's IP:

```bash
# Mac/Linux:
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows:
ipconfig
```

Access from other devices:

```
http://YOUR_IP:3000
```

Example:
- Admin: `http://192.168.1.100:3000`
- Scanner: `http://192.168.1.100:3000/scan/abc123`

### Using nginx as Reverse Proxy

Setup on port 80 (no :3000):

```nginx
server {
    listen 80;
    server_name event.local;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
```

Then access at `http://event.local`

---

## Troubleshooting

### Issue: "Port 3000 already in use"

```bash
# On Mac/Linux:
lsof -i :3000
kill -9 <PID>

# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port:
PORT=3001 npm run dev
```

### Issue: "Database locked"

Happens during concurrent access.

```bash
# Solution 1: Restart the server
npm run dev  # (Ctrl+C then retry)

# Solution 2: Delete WAL files
rm data/event.db-wal
rm data/event.db-shm
npm run dev
```

### Issue: QR Code Scanner Not Opening Link

```bash
# Check your NEXT_PUBLIC_APP_URL in .env.local
# If local network, use:
NEXT_PUBLIC_APP_URL=http://192.168.1.100:3000

# Restart server after changing
```

### Issue: Slow Performance on Large Datasets

For 10,000+ participants:

```bash
# Add database index (edit src/db/init.ts)
database.exec(`
  CREATE INDEX IF NOT EXISTS idx_food_taken ON participants(food_taken);
  CREATE INDEX IF NOT EXISTS idx_coffee_taken ON participants(coffee_taken);
`);
```

### Issue: Changes Not Showing in Browser

```bash
# Hard refresh browser:
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

### Issue: "Cannot find module" errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## Performance Tips

### For Events with 1000+ Participants

1. **Add search filters**
   - Already implemented ✓
   - Use it to find participants faster

2. **Use CSV import**
   - Export from Excel/Google Sheets format:
     ```
     Name,Food Order,Coffee Order
     John,Pasta,Espresso
     Jane,Salad,Cappuccino
     ```
   - Copy to database (implement in admin panel)

3. **Archive old events**
   ```bash
   # Backup current database
   cp data/event.db data/event-2024-04-04.db
   
   # Delete all participants
   rm data/event.db  # Deletes all data
   npm run dev       # Creates fresh database
   ```

4. **Use tablets for scanning**
   - Larger screens, less errors
   - Better battery life than phones
   - Can support multiple staff

---

## Security Hardening

### For Public/Multi-User Events

1. **Add simple authentication** (not implemented yet)
2. **Change database location**
   ```bash
   mv data/event.db ~/.event-manager/data.db
   ```
3. **Set read-only permissions on data**
   ```bash
   chmod 600 data/event.db
   ```

---

## Next Steps

1. ✅ Install and run locally
2. ✅ Add first batch of participants
3. ✅ Generate QR codes
4. ✅ Print or display codes
5. ✅ Test scanner on mobile device
6. 🎉 Run your event!

---

## Getting Help

- Check [README.md](./README.md) for feature overview
- Review [Troubleshooting](#troubleshooting) section above
- Check browser console for errors (F12)
- Check terminal output for server errors

Happy event organizing! 🎉
