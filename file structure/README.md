# Employee Rating System (ERS) - Complete Documentation

## 📋 Overview

Dokumentasi lengkap untuk membangun **Employee Rating System Website** yang terintegrasi dengan Google Sheets. Dokumentasi ini dirancang sedemikian detail sehingga AI model atau developer apapun dapat membuat kode **tanpa error sedikitpun**.

---

## 📁 Dokumen dalam Paket

### 1. **PRD_Employee_Rating_System.md** (54 KB)
**Product Requirements Document - Dokumentasi lengkap spesifikasi produk**

Berisi:
- ✅ Project Overview & Tech Stack
- ✅ Data Structure & Architecture (Google Sheets Schema)
- ✅ Business Rules & Authorization
- ✅ Page 1: Halaman Penilaian (Rating Page)
- ✅ Page 2: Halaman Rekapan Nilai (Recap Page)
- ✅ Page 3: Halaman Leaderboard (Public Leaderboard)
- ✅ Authentication & Login
- ✅ Google Sheets Integration
- ✅ UI/UX Specifications
- ✅ Error Handling & Validation
- ✅ Testing Requirements
- ✅ Deployment Guide
- ✅ Appendix: Detailed Category Descriptions

**Gunakan file ini untuk:**
- Memahami business logic dan requirements
- Mengetahui UI layout dan flow
- Memahami rules dan authorization
- Mengerti bagaimana data disimpan dan dikelola

### 2. **TECHNICAL_SPECIFICATION.md** (30 KB)
**Technical Specification & Code Standards - Dokumentasi teknis implementation**

Berisi:
- ✅ Project Structure (folder organization)
- ✅ TypeScript Interfaces & Types (lengkap)
- ✅ Constants & Configuration
- ✅ Utility Functions (calculations, validators, transformers, helpers)
- ✅ API Routes Implementation Guide
- ✅ Next.js & Environment Setup
- ✅ Key Implementation Notes

**Gunakan file ini untuk:**
- Memahami project structure
- Copy-paste TypeScript types
- Implement calculation & validation logic
- Setup API routes dengan benar
- Configure environment variables

---

## 🚀 Cara Menggunakan Dokumentasi

### Workflow untuk Developer atau AI Code Generator:

#### **Step 1: Baca PRD (Pahami Requirements)**
1. Baca section 1-3: Overview, Data Structure, Business Rules
2. Baca section 4-6: Understand 3 halaman utama
3. Baca section 7: Authentication logic
4. Baca section 9: UI/UX specs

**Output:** Anda memahami apa yang harus dibangun

#### **Step 2: Baca Technical Specification (Pahami Implementation)**
1. Baca section 1: Project Structure
2. Baca section 2-4: Copy TypeScript types dan constants
3. Baca section 5-7: Implement utility functions dan API routes
4. Baca section 7: Key notes untuk avoid mistakes

**Output:** Anda tahu bagaimana cara membangun dan apa yang harus di-copy

#### **Step 3: Code Generation**
1. Setup Next.js project dengan struktur dari TECHNICAL_SPECIFICATION
2. Copy TypeScript types dari section 2
3. Copy constants dari section 3
4. Implement utility functions dari section 4
5. Implement API routes dari section 5
6. Build components sesuai PRD section 4-6
7. Follow UI specs dari PRD section 9

---

## 🎯 Key Information Ringkasan

### Tech Stack
```
Frontend: Next.js 15.x + React 19.x + Tailwind CSS 4.x
Backend: Next.js API Routes
Database: Google Sheets (via API)
Auth: Simple JWT (username/password)
Deployment: Vercel
```

### 3 Halaman Utama

| Halaman | Access | Fungsi | Key Features |
|---------|--------|--------|--------------|
| **Penilaian** | Manager + Supervisor | Rate karyawan | Draft saving, card expansion, validation |
| **Rekapan Nilai** | Manager only (password) | View recap & stats | Grouping, detail expansion, export |
| **Leaderboard** | Public (shareable link) | Show rankings | Normalized scores, outlet stats |

### Authorization Rules

```
Manager (MGR-*):
  ✅ Can access all 3 pages
  ✅ Can rate SVP & karyawan (outlet BTM, BTMF, TSF)
  ✅ Password: EGG2026

Supervisor (SPV-*):
  ✅ Can access Penilaian & Leaderboard
  ❌ Cannot access Rekapan
  ✅ Can only rate karyawan di outlet mereka
  ✅ Password: EGG2026

Public:
  ✅ Can access Leaderboard only (via public link)
  ❌ Cannot access other pages
```

### Rating Scale
```
A = 5 points (Excellent)
B = 4 points (Good)
C = 3 points (Satisfactory)
D = 2 points (Poor)
E = 1 point (Very Poor)

Total Points = (Average Score) × 5
Predikat = Round(Average Score) → A/B/C/D/E
```

### Rating Categories (15 total)

**SOFT SKILL (4):**
- Komunikasi dengan rekan & atasan
- Kerja sama tim
- Tangung jawab & manajemen waktu
- Inisiatif & penyelesaian masalah

**HARD SKILL (4):**
- Penguasaan tugas dan SOP
- Ketelitian & kecepatan kerja
- Kemampuan menggunakan alat dan sistem
- Konsistensi Hasil kerja

**ATTITUDE (5):**
- Kedisiplinan dan kehadiran
- Kepatuhan aturan & arahan
- Etika & Profesionalitas
- Tanggung jawab lingkungan
- Ramah terhadap pelanggan

**IBADAH (2, Ramadan only):**
- Melaksanakan sholat
- Melaksanakan Puasa

### Google Sheets Schema

**Sheet 1: Master_List**
```
Columns: A | B | C | D | E
A: ID Karyawan (BTM-001, TSF-005, etc)
B: Nama Lengkap
C: Posisi Spesifik
D: Outlet Asal (BTM, BTMF, TSF, etc)
E: Status (Aktif, Tidak Aktif)
```

**Sheet 2: DB_Penilaian New**
```
Columns: A-W
A: Tanggal (auto-generated timestamp)
B: Nama Penilai (employee ID)
C: Karyawan yang dinilai (employee ID)
D: Posisi (auto-populated)
E: Outlet (auto-populated)
F: Status (hardcoded "Aktif")
G-T: Rating values (A/B/C/D/E)
U: Total Point (auto-calculated)
V: Predikat (auto-calculated)
```

---

## 📝 Important Notes

### 1. Draft Saving
- User bisa save draft per karyawan secara lokal (localStorage)
- Draft key: `rating_draft_${penilaiId}_${karyawanId}`
- Ketika data disubmit ke spreadsheet, timestamp diambil saat submit (bukan draft)
- Setelah submit, data tidak bisa diedit lagi untuk periode bulan yang sama

### 2. Data Fairness (Leaderboard Normalization)
- Problem: Jumlah penilai berbeda per outlet
- Solution: Normalize scores berdasarkan outlet average
- Formula: `normalizedScore = (rawAverage - outletAverage) + globalAverage`
- Lihat TECHNICAL_SPECIFICATION section 4.1 untuk code

### 3. Authentication
- Password sama untuk semua user: `EGG2026`
- Username = Employee ID (contoh: MGR-001, BTM-003)
- Token expiry: 24 hours
- Protected routes: check auth token di middleware

### 4. Error Handling
- JANGAN expose technical errors
- SELALU translate ke user-friendly messages dalam Bahasa Indonesia
- Implement retry logic untuk API calls (3 attempts dengan exponential backoff)

### 5. Performance Optimization
- Implement React.memo untuk RatingCard component (akan dirender banyak kali)
- Lazy load halaman dengan next/dynamic
- Cache API responses di client (5 min) dan server (1 hour)
- Batch Google Sheets API calls

---

## 🔄 Data Flow Diagram

### Page 1: Penilaian (Rating)
```
1. User login (Auth)
2. Load Master_List dari Sheets (fetch employee data)
3. Filter berdasarkan role & outlet
4. Load existing ratings dari DB_Penilaian (check sudah dinilai apa belum)
5. Render rating cards
6. User rating (save draft ke localStorage setiap changes)
7. User click "Save All" → validate → append rows ke DB_Penilaian
8. Clear draft, show success toast
```

### Page 2: Rekapan (Recap)
```
1. Manager login
2. Load DB_Penilaian dari Sheets
3. Group by employee (handle duplicates dari multiple raters)
4. Calculate averages per employee
5. Apply filter (date range, outlet, status)
6. Render table dengan expand detail
7. User dapat export CSV/PDF
```

### Page 3: Leaderboard
```
1. Load DB_Penilaian dari Sheets (no auth required)
2. Group by employee
3. Calculate raw average per employee
4. Calculate outlet averages
5. Normalize scores
6. Sort dan assign ranks
7. Render leaderboard table
8. Show outlet stats di bottom
```

---

## ✅ Checklist untuk AI Code Generator

Sebelum mulai coding:

- [ ] Baca lengkap PRD section 1-7
- [ ] Baca lengkap TECHNICAL_SPECIFICATION section 1-5
- [ ] Setup Next.js 15 project dengan TypeScript
- [ ] Setup Tailwind CSS
- [ ] Create folder structure sesuai TECHNICAL_SPECIFICATION section 1
- [ ] Copy semua types dari TECHNICAL_SPECIFICATION section 2
- [ ] Copy semua constants dari TECHNICAL_SPECIFICATION section 3
- [ ] Implement utils (calculations, validators, transformers, helpers)
- [ ] Implement API routes
- [ ] Build components (Login, Header, Filter, Cards, Table, etc)
- [ ] Setup Google Sheets API integration
- [ ] Test semua flows (happy path + error scenarios)
- [ ] Setup .env variables
- [ ] Deploy ke Vercel

---

## 🆘 Troubleshooting Common Issues

### Issue: Data tidak tersimpan ke Google Sheets
**Solution:**
- Check Google Sheets API key & permissions
- Verify sheet ID di .env
- Check range format (A:W vs A1:W1000)
- Ensure data types match (dates harus ISO format)

### Issue: Leaderboard ranking tidak fair
**Solution:**
- Implement normalization algorithm (lihat calculation.ts)
- Test dengan sample data dari multiple outlets
- Verify outlet average calculation

### Issue: Draft tidak disimpan
**Solution:**
- Check localStorage quota (5-10MB limit)
- Verify localStorage key format
- Test di browser DevTools > Application > Local Storage

### Issue: Form validation tidak bekerja
**Solution:**
- Check validators.ts - ensure all required fields validasi
- Test dengan form kosong, incomplete, invalid data
- Verify error messages display correctly

---

## 📞 Questions & Support

Jika ada yang kurang jelas atau ada error di dokumentasi:

1. **Baca kembali** relevant section di PRD atau TECHNICAL_SPECIFICATION
2. **Cross-check** dengan appendix dan sample data structure
3. **Trace data flow** untuk understand logic
4. **Check constants** untuk valid values

---

## 📊 File Statistics

| File | Size | Lines | Sections |
|------|------|-------|----------|
| PRD_Employee_Rating_System.md | 54 KB | ~1200 | 13 + Appendix |
| TECHNICAL_SPECIFICATION.md | 30 KB | ~900 | 7 |
| **Total** | **84 KB** | **~2100** | **Complete** |

---

**Last Updated:** April 17, 2026  
**Status:** ✅ Ready for Development  
**Quality:** Production-grade, AI-proof documentation

---

## 🎓 Learning Path

Jika Anda baru dengan project ini:

1. **Day 1:** Baca PRD section 1-3 (understand business)
2. **Day 2:** Baca PRD section 4-6 (understand pages)
3. **Day 3:** Baca TECHNICAL_SPECIFICATION (understand code)
4. **Day 4:** Setup project & implement types/constants
5. **Day 5+:** Implement features sesuai checklist

---

Selamat membangun! 🚀
