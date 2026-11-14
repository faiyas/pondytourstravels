# Pondy Tours & Travels

Official web application, lead generation platform, and booking management system for **Pondy Tours & Travels** (Pondicherry Outstation Taxi Service).

---

## Repository Structure

```
pondytourstravels/
├── frontend/                   # React 18 + Vite 5 + Tailwind CSS web client
│   ├── src/                    # Components, pages, routing, API client
│   ├── public/                 # Static assets, sitemap, icons
│   ├── scripts/                # Static SEO canonical prerendering scripts
│   ├── package.json            # Node dependencies
│   ├── vite.config.js          # Vite build configuration
│   └── .env.example            # Frontend environment template
│
├── backend/                    # Django 5+ & Django REST Framework backend
│   ├── config/                 # Root settings, URLs, WSGI
│   ├── leads/                  # Enquiry capture & WhatsApp click tracking
│   ├── bookings/               # Booking lifecycle & driver dispatch
│   ├── pricing/                # Dynamic vehicle rate matrix & fare rules
│   ├── analytics/              # Click & conversion telemetry
│   ├── website_cms/            # Site contact info & banner announcements
│   ├── manage.py               # Django management script
│   ├── requirements.txt        # Python production dependencies
│   ├── setup.sh                # Automated server deployment script
│   └── .env.example            # Backend environment template
│
└── README.md                   # Project overview & documentation
```

---

## Quick Start

### 1. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
To build for production with canonical SEO page generation:
```bash
npm run build
```

### 2. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your PostgreSQL credentials
python manage.py migrate
python manage.py runserver 8001
```

---

## License & Proprietary Notice
© 2026 Pondy Tours & Travels. All rights reserved.
