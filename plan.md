

# Campus-Shelter - Student Housing Platform for FUTA

A comprehensive platform connecting FUTA students with verified landlords, featuring property search, online bookings, secure payments, and lease management.

---

## Phase 1: Foundation & Authentication

### User Registration & Login
- **Student registration** with FUTA email verification, student ID upload
- **Landlord registration** with identity verification (NIN/ID upload, property ownership docs)
- Secure password recovery via email
- Role-based access (Student, Landlord, Admin)

### User Profiles
- Student profile: Name, department, level, contact info, preferred areas
- Landlord profile: Name, verified badge, properties owned, contact info, bank details for payments

---

## Phase 2: Property Listings & Search

### Property Catalog
- Rich property pages with:
  - Photo gallery & video tours
  - Detailed descriptions (rooms, bathrooms, furnished status)
  - Rent pricing (weekly/monthly options)
  - Distance from FUTA main gate & landmarks
  - Amenities checklist (Wi-Fi, light, water, security, generator)
  - Availability calendar

### Advanced Search & Filters
- Filter by: Budget range, location (Ilesha Road, FUTA South Gate, etc.), room type (single room, self-con, mini flat)
- Filter by amenities: Wi-Fi, electricity backup, water supply, security
- Sort by: Price, rating, distance from FUTA, newest listings
- Map view showing property locations around FUTA

---

## Phase 3: Booking & Scheduling

### Property Tours
- Calendar showing available tour slots
- Students can request/schedule property visits
- Landlords confirm or suggest alternative times
- Tour reminders via notification

### Booking System
- Online booking with instant or approval-based confirmation
- Application form (student details, guarantor info)
- Document upload (student ID, guarantor letter)
- Booking status tracking

---

## Phase 4: Payments Integration (Paystack)

### Online Payments
- Secure payment via Paystack (cards, bank transfer, USSD)
- Pay booking deposits to secure properties
- Monthly rent payments
- Payment receipts & history
- Split payments (pay in installments where landlords allow)

### Landlord Payouts
- Automatic payouts to landlord bank accounts
- Transaction history & earnings dashboard

---

## Phase 5: Lease Management

### Digital Lease Agreements
- E-signature for lease contracts
- Pre-built lease templates
- Document storage for signed agreements
- Lease renewal reminders (30 days before expiry)

### Tenancy Records
- Active and past tenancies
- Rent payment history per tenancy
- Move-in/move-out dates

---

## Phase 6: Messaging & Notifications

### In-App Messaging
- Real-time chat between students and landlords
- Message history preserved
- Property inquiry quick-start messages

### Notifications
- Push notifications for new messages, booking updates
- Email alerts for lease renewals, payment due dates
- Price drop alerts for saved/favorited properties
- New listing alerts for saved search criteria

---

## Phase 7: Reviews & Ratings

### Review System
- Students rate properties and landlords (1-5 stars)
- Written reviews with pros/cons
- Photo reviews from tenants
- Landlords can respond to reviews

### Trust Indicators
- Verified landlord badges
- Property quality scores
- Response time indicators
- Sort/filter by ratings

---

## Phase 8: Maintenance & Support

### Maintenance Requests
- Submit maintenance issues with photos
- Category selection (plumbing, electrical, structural, etc.)
- Priority levels (urgent, normal, low)
- Status tracking (submitted → in progress → resolved)

### Landlord Response Portal
- View all maintenance requests
- Update status and add notes
- Resolution timeline tracking

---

## Phase 9: Admin Dashboard

### Property Management
- Approve/reject new property listings
- Verify landlord identities
- Remove policy-violating listings

### User Management
- Monitor user activity
- Handle disputes between students and landlords
- Suspend/ban accounts if needed

### Analytics & Reports
- Most viewed properties
- Booking trends
- Popular locations
- Revenue reports
- User growth metrics

---

## Phase 10: Resources & Community

### Guides & Resources
- Student housing safety tips
- Tenant rights information
- Community rules and guidelines
- FUTA area guide (transportation, landmarks, markets)
- FAQ section

---

## Design Direction

**Bold & Vibrant Theme:**
- Primary colors: Deep purple/blue with bright orange/yellow accents
- Modern card-based layouts with rounded corners
- Large, high-quality property images
- Student-friendly icons and illustrations
- Mobile-first responsive design
- Smooth animations and transitions

---

## Technical Architecture

- **Frontend:** React with TypeScript, Tailwind CSS
- **Backend:** Supabase (Lovable Cloud) for database, auth, storage
- **Payments:** Paystack integration for Nigerian payments
- **File Storage:** Supabase Storage for images, documents, videos
- **Real-time:** Supabase Realtime for messaging and notifications

