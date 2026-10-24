# 🏢 HCM Lite — AI-Assisted Human Capital Management
### Saylani Hackathon 2026 Edition

A modern, role-based Human Capital Management web application with a live AI assistant answering directly from database records. Starts completely empty — Admin sets up the company, HR registers employees, and all numbers flow from live actions.

---

## 🚀 Quick Start (Under 2 Minutes)

```bash
# 1. Navigate to the project directory
cd hcm-lite-frontend

# 2. Install dependencies (already installed)
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏆 All 25 Functionalities & Requirements Checklist

| # | Functionality | Status | Module |
|---|---|:---:|---|
| **01** | First-run setup: company profile and Admin account | ✅ | M1 / M2 |
| **02** | Login, logout, change password; role-based menus & dashboards | ✅ | M1 |
| **03** | Company settings: office hours (09:00), grace (15m), half-day (<5h), geofence | ✅ | M2 |
| **04** | Departments, designations, leave types (14, 8, 10, ∞), public holidays | ✅ | M2 |
| **05** | Create HR logins; deactivate or reset logins | ✅ | M1 / M2 |
| **06** | Register employee (auto-creates login, temp password, 1.5x basic salary) | ✅ | M3 / M6 |
| **07** | Employee directory with search, filters, and Employee 360 profile | ✅ | M3 |
| **08** | CSV import with dry-run validation error report; CSV export | ✅ | M3 |
| **09** | Web Check-In and Check-Out with server timestamping | ✅ | M4 |
| **10** | Attendance calendar and daily attendance board | ✅ | M4 |
| **11** | Attendance correction: employee request & HR approval with comments | ✅ | M4 |
| **12** | Apply for or cancel leave; live balance; skip weekends & holidays | ✅ | M5 |
| **13** | HR leave approval inbox with review comments | ✅ | M5 |
| **14** | Salary structure per employee (Gross = 1.5 × Basic; HRA 40%, Medical 10%) | ✅ | M6 |
| **15** | Monthly payroll: create and review draft with absent & unpaid deductions | ✅ | M6 |
| **16** | Finalize payroll (locks month — Admin only) | ✅ | M6 |
| **17** | Payslips with PDF download / print | ✅ | M6 |
| **18** | Dashboards, KPIs, trends, and insight lists with date & dept filters | ✅ | M7 |
| **19** | AI assistant chat with live tool-calling answering from real data | ✅ | M8 |
| **20** | AI Dashboard Summary (3–5 bullet insights using only current numbers) | ✅ | M8 |
| **21** | Smart Leave: type a sentence in plain words, get pre-filled form | ✅ | M8 |
| **22** | Policy Q&A on office timings, grace time, leave quotas, and tax slabs | ✅ | M8 |
| **23** | Announcements board (Admin & HR post, Employees read) | ✅ | M9 |
| **24** | In-app notifications (leave decisions, announcements, payroll) | ✅ | M9 |
| **25** | Audit log with actor, action, entity, and JSON before/after state diff | ✅ | M9 |

### 🌟 Bonus Points (+10) Implemented:
- **Camera Attendance with Face Detection + GPS Geofencing (Haversine formula)**: Camera viewfinder with real-time face detection oval + browser GPS accuracy and office radius verification!
- **Dark Mode**: Fully supported via `next-themes` (toggle in top navbar).
- **Judge Demo Reset**: Instant one-click reset to blank slate in navbar for 5-minute live demo.
- **AI Roman Urdu & English Support**: Understands queries like *"kal bimar hon chutti chahiye"* or *"headcount kitna hai"*.

---

## ⏱️ 5-Minute Judge Demo Script

1. **First Run Setup:**
   - App opens on `/setup`. Click **"Quick Auto-Fill For Hackathon Demo"** and launch the company workspace.
2. **Admin Creates HR:**
   - Go to **Organization Setup** -> **HR Logins** -> Create HR account (`hr@company.com`).
3. **HR Registers Employees:**
   - Logout and login as HR (use quick-fill).
   - Go to **Employees** -> **Register Employee**. Register "Ali Raza" (Salary: Rs. 80,000 -> Gross auto-calculated: Rs. 120,000).
   - A login with temporary password `Password@123` is auto-generated!
4. **Employee Check-In & Smart Leave:**
   - Logout and login as Ali (`ali.raza@company.com`).
   - Change temporary password on first sign-in.
   - Go to **Check-In Console** -> Test Camera Face Detection & GPS Geofence!
   - In AI Chat or Smart Leave box, type: *"Need next Monday and Tuesday off for sister's wedding"* -> Form pre-fills automatically!
5. **HR Approval & Monthly Payroll:**
   - Login back as HR. Approve Ali's leave with comment: *"Approved, congratulations!"*.
   - Go to **Monthly Payroll** -> Click **"Run Payroll Draft"**. Verify gross, deductions, and tax slabs.
6. **Admin Finalizes & Employee Downloads Payslip:**
   - Login as Admin. Click **"Finalize & Lock Month"**.
   - Login back as Ali -> Go to **Payslips** -> Click **"Print / Save PDF"**.
   - Ask AI Assistant: *"What is Hamza's salary?"* -> AI **politely refuses** due to role-scoping privacy rules!
   - Admin checks **Audit Log** -> Shows full JSON diff of payroll finalization!

---

## 🔗 Connecting with Backend API (For Your Brother)

This frontend contains a full client-side state engine with localStorage persistence so it runs independently for evaluation.

When connecting to the live backend server:
1. Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```
2. The service calls in `src/lib/store.ts` can forward directly to the brother's REST API endpoints:
   - `POST /auth/login`
   - `POST /setup`
   - `GET /employees`, `POST /employees`
   - `POST /attendance/checkin`, `POST /attendance/checkout`
   - `POST /leave/apply`, `POST /leave/review`
   - `POST /payroll/generate`, `POST /payroll/finalize`
   - `POST /ai/chat`
