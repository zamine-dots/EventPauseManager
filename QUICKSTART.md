# ⚡ Quick Start (5 minutes)

## 1️⃣ Install & Run

```bash
# Navigate to project
cd /home/zamine/PauseDejCaffe

# Install dependencies
npm install

# Create data folder
mkdir -p data

# Start the app
npm run dev
```

**App opens at:** http://localhost:3000

## 2️⃣ Add Participants

1. Click **"➕ Add Participant"**
2. Enter:
   - Name: `John Doe`
   - Food: `Pasta Carbonara`
   - Coffee: `Espresso`
3. Click **"Add"**
4. Repeat for all guests

## 3️⃣ Generate QR Codes

1. Click **"📱 Generate QR Codes"**
2. Wait for completion
3. Click **"👁️ View QR Codes"**
4. Download or print QR codes

## 4️⃣ Scan & Distribute

1. **Staff uses phone camera** to scan QR code
2. Opens **Scanner Page** automatically
3. Click **"🍽️ Mark Food Taken"** → Green ✅
4. Click **"☕ Mark Coffee Taken"** → Green ✅

## 5️⃣ Monitor on Dashboard

- **Watch real-time stats** at the top
- **See status** of each person in table
- **Export CSV** when done
- **Reset** for next round

---

## 🎯 Key URLs

| Page | URL |
|------|-----|
| Admin Dashboard | http://localhost:3000 |
| Scanner (with QR) | http://localhost:3000/scan/{id} |

## 💡 Tips

- 📱 Use modern smartphones (iPhone 15+, Android 8+)
- 📊 Export CSV before closing
- 🔄 Reset status for new round
- 🖨️ Print QR codes A4 size for best scanning

---

## 🆘 Help

**Port already in use?**
```bash
PORT=3001 npm run dev  # Use different port
```

**Database error?**
```bash
mkdir -p data
npm run dev
```

**Need example data?**
```bash
npm run ts-node scripts/seed.ts
```

---

**You're ready! 🎉**
