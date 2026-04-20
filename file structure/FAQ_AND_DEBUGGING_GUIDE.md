# FAQ, COMMON MISTAKES & DEBUGGING GUIDE
**Employee Rating System - Quick Reference**

---

## 🔴 TOP 10 COMMON MISTAKES TO AVOID

### 1. ❌ Wrong Sheet Range Format
**Mistake:**
```typescript
range: 'Master_List'  // WRONG - incomplete
range: 'Master_List!A:E'  // WRONG - may include empty rows
```

**Correct:**
```typescript
range: 'Master_List!A1:E1000'  // RIGHT - explicit range
range: 'DB_Penilaian New!A1:W1000'  // RIGHT - exact range
```

---

### 2. ❌ Forgetting to Handle Empty Values in Ratings
**Mistake:**
```typescript
function calculateAverage(ratings) {
  const values = Object.values(ratings);  // Includes empty strings!
  return values.map(gradeToPoint).reduce((a,b) => a+b) / values.length;
}
```

**Correct:**
```typescript
function calculateAverage(ratings, isRamadan = false) {
  const values = Object.values(ratings)
    .filter(grade => grade && grade !== '')  // Filter empties
    .map(grade => RATING_SCALE[grade]);
  
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}
```

---

### 3. ❌ Not Checking for Duplicate Ratings Before Append
**Mistake:**
```typescript
async function saveRatings(rows) {
  await appendRatings(rows);  // What if user submitted twice?
}
```

**Correct:**
```typescript
async function saveRatings(rows) {
  // Check for duplicates first
  for (const row of rows) {
    const existing = await checkIfAlreadyRated(
      row.namaPenilai,
      row.karyawanDinilai,
      getMonth(row.tanggal),
      getYear(row.tanggal)
    );
    
    if (existing) {
      throw new Error(`${row.karyawanDinilai} sudah dinilai bulan ini`);
    }
  }
  
  // Then append
  await appendRatings(rows);
}
```

---

### 4. ❌ Wrong Timestamp Format
**Mistake:**
```typescript
const timestamp = new Date().toString();  // Wrong format
// Output: "Thu Apr 17 2026 15:30:45 GMT+0700 (WIB)"
```

**Correct:**
```typescript
const timestamp = new Date().toISOString();  // Right format
// Output: "2026-04-17T15:30:45.123Z"

// Or with timezone handling:
const timestamp = new Date().toLocaleString('sv-SE');
// Output: "2026-04-17 15:30:45"
```

---

### 5. ❌ Not Handling Ramadan Month Correctly
**Mistake:**
```typescript
function isRamadan() {
  return new Date().getMonth() === 8;  // Assuming March is Ramadan (WRONG!)
}
```

**Correct:**
```typescript
import HijriDate from 'hijri-converter';

function isRamadan() {
  const hijri = new HijriDate(new Date());
  return hijri.getMonthEnglish() === 'Ramadan';
}

// OR for MVP (hardcode for 2026):
function isRamadan() {
  const now = new Date();
  // Ramadan 2026: Feb 28 - Mar 29
  return (now.getMonth() === 1 && now.getDate() >= 28) ||
         (now.getMonth() === 2 && now.getDate() <= 29);
}
```

---

### 6. ❌ Incorrect Normalization Algorithm
**Mistake:**
```typescript
// Simply averaging outlet scores (UNFAIR!)
const normalizedScore = (rawAverage + outletAverage) / 2;
```

**Correct:**
```typescript
// PRD-specified algorithm
const normalizedScore = (rawAverage - outletAverage) + globalAverage;

// Example:
// outlet BTM avg: 4.0, employee raw: 4.5
// outlet TSF avg: 4.2, employee raw: 4.5
// global avg: 4.1

// BTM employee: (4.5 - 4.0) + 4.1 = 4.6
// TSF employee: (4.5 - 4.2) + 4.1 = 4.4
// Now fair even though both raw 4.5!
```

---

### 7. ❌ Wrong Column Index for Sheet Data
**Mistake:**
```typescript
// Assuming wrong column order
const posisi = row[2];  // What if it's col 3?
const outlet = row[3];  // What if it's col 4?
```

**Correct:**
```typescript
// Always use explicit mapping based on headers
const headers = rows[0];
const posisiIndex = headers.indexOf('Posisi Spesifik');  // Get from headers
const outletIndex = headers.indexOf('Outlet Asal');

// Or hardcode based on PRD:
// Master_List: A=ID, B=Nama, C=Posisi, D=Outlet, E=Status
const id = row[0];
const nama = row[1];
const posisi = row[2];
const outlet = row[3];
const status = row[4];
```

---

### 8. ❌ Not Clearing Draft After Submit
**Mistake:**
```typescript
async function handleSave() {
  await submitRatings();
  // Draft still in localStorage - can cause re-submission!
}
```

**Correct:**
```typescript
async function handleSave() {
  const rows = prepareDraftRows();
  await submitRatings(rows);
  
  // Clear draft immediately after success
  localStorage.removeItem(`rating_draft_${userId}_*`);
  clearState();
  
  // Show success message
  showToast('Penilaian berhasil disimpan', 'success');
}
```

---

### 9. ❌ Wrong Authorization Check
**Mistake:**
```typescript
// Not checking if user has permission
if (user.role === 'manager') {
  return <RecapPage />;
}
// What if Supervisor tries to access?
```

**Correct:**
```typescript
if (user.role !== 'manager') {
  return <UnauthorizedPage message="Hanya manager yang bisa akses halaman ini" />;
}

return <RecapPage />;
```

---

### 10. ❌ Not Handling API Errors
**Mistake:**
```typescript
const data = await fetch('/api/sheets/master-list').then(r => r.json());
setEmployees(data.data);  // What if request failed?
```

**Correct:**
```typescript
try {
  const response = await fetch('/api/sheets/master-list');
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Unknown error');
  }
  
  setEmployees(result.data);
} catch (error) {
  console.error('Failed to load employees:', error);
  showError('Gagal memuat data karyawan. Coba refresh halaman.');
}
```

---

## 🟡 COMMON MISTAKES IN UI/UX

### 11. ❌ Not Showing Loading States
**Issue:** User doesn't know if page is loading or stuck
**Fix:**
```typescript
const [isLoading, setIsLoading] = useState(true);

return (
  <>
    {isLoading && <LoadingSpinner />}
    {!isLoading && <MainContent />}
  </>
);
```

---

### 12. ❌ Not Disabling Submit Button During Loading
**Issue:** User can click multiple times, causing duplicate submissions
**Fix:**
```typescript
<button 
  onClick={handleSave} 
  disabled={isLoading}  // Disable during submit
>
  {isLoading ? 'Menyimpan...' : 'Simpan'}
</button>
```

---

### 13. ❌ Not Showing Validation Errors
**Issue:** User doesn't know what's wrong with their input
**Fix:**
```typescript
{errors.map(error => (
  <div key={error.field} className="text-red-500 text-sm mt-1">
    ❌ {error.message}
  </div>
))}
```

---

### 14. ❌ Cards Not Grouped by Section Header
**Issue:** Hard to read 15 rating categories
**Fix:**
```typescript
<div className="mb-6">
  <h4 className="font-bold text-blue-600 mb-3">SOFT SKILL</h4>
  {softSkillCategories.map(cat => <RatingRow key={cat.id} {...cat} />)}
</div>

<div className="mb-6">
  <h4 className="font-bold text-blue-600 mb-3">HARD SKILL</h4>
  {hardSkillCategories.map(cat => <RatingRow key={cat.id} {...cat} />)}
</div>

{/* ... etc */}
```

---

## 🔵 DEBUGGING CHECKLIST

### Issue: Ratings not saving to Sheets

**Step 1: Check Network**
```javascript
// In browser console:
fetch('/api/sheets/append', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({rows: [[data]]})
})
.then(r => r.json())
.then(d => console.log('Response:', d))
.catch(e => console.error('Error:', e))
```

**Step 2: Check Request Body**
```javascript
// Log what you're sending
console.log('Sending rows:', JSON.stringify(rows, null, 2));
```

**Step 3: Check Google Sheets API**
- Open Google Cloud Console
- Check if Sheets API is enabled
- Check service account has access to sheet
- Check quotas not exceeded

**Step 4: Check Sheet Range**
- Verify sheet name exactly matches (case-sensitive)
- Verify columns A-W exist
- Try manual append via API Explorer

---

### Issue: Leaderboard ranking is wrong

**Debug:**
```javascript
// Add logging to normalization function
function normalizeScores(employees) {
  console.group('Normalization Debug');
  
  const byOutlet = groupByOutlet(employees);
  console.log('By Outlet:', byOutlet);
  
  const outletAvgs = calculateOutletAverage(byOutlet);
  console.log('Outlet Averages:', outletAvgs);
  
  const globalAvg = calculateGlobalAverage(outletAvgs);
  console.log('Global Average:', globalAvg);
  
  const normalized = employees.map(emp => ({
    ...emp,
    raw: emp.rawAverage,
    outletAvg: outletAvgs[emp.outlet],
    normalized: (emp.rawAverage - outletAvgs[emp.outlet]) + globalAvg
  }));
  
  console.table(normalized);
  console.groupEnd();
  
  return normalized.sort((a,b) => b.normalized - a.normalized);
}
```

---

### Issue: Draft not persisting

**Check localStorage:**
```javascript
// In browser console:
// 1. Check if localStorage is enabled
console.log(typeof localStorage);

// 2. Check what's stored
console.log(localStorage);

// 3. Check specific key
console.log(localStorage.getItem('rating_draft_USER_EMP'));

// 4. Try to store something
localStorage.setItem('test', 'value');
console.log(localStorage.getItem('test'));
```

---

### Issue: User can't login

**Debug:**
```javascript
// 1. Check if credentials match
console.log('Username input:', username);
console.log('Password input:', password);
console.log('Valid creds:', VALID_CREDENTIALS);

// 2. Check trimming
console.log('Username trimmed:', username.trim() === 'MGR-001');

// 3. Check API response
fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({username, password})
})
.then(r => r.json())
.then(d => console.log('Login response:', d))
```

---

## 🟢 TESTING SCENARIOS

### Test Case 1: Complete Rating Flow
```
1. Login as MGR-001 / EGG2026
2. Should see list of employees (BTM, BTMF, TSF)
3. Click employee card to expand
4. Fill all ratings (A-E)
5. Click "Save Draft" - should show toast
6. Refresh page - draft should still be there
7. Change a rating
8. Click "Save All" - should validate & submit
9. Check Google Sheets - data should be there
10. Refresh page - card should show as "locked" (already rated this month)
```

### Test Case 2: Supervisor Flow
```
1. Login as TSF-001 / EGG2026
2. Should only see TSF employees
3. Should NOT see BTM/BTMF employees
4. Should NOT see rekapan page (403 error)
5. Can access leaderboard
```

### Test Case 3: Public Leaderboard
```
1. Access /leaderboard without login
2. Should load data
3. Should show rankings
4. Should show outlet stats
5. Click "Periode" dropdown - should filter by month
```

### Test Case 4: Ramadan Handling
```
1. During non-Ramadan: Ibadah section should be HIDDEN
2. During Ramadan: Ibadah section should be VISIBLE
3. Ramadan ratings should be required
4. Non-Ramadan ratings should be optional
5. Calculation should handle empty Ramadan ratings
```

### Test Case 5: Data Integrity
```
1. Submit same employee twice in same month
2. Should show error "Sudah dinilai"
3. Duplicate rows should NOT appear in sheet
4. Verify total points calculation
5. Verify predikat matches total points
```

---

## 📊 VERIFICATION CHECKLIST BEFORE DEPLOY

### Frontend
- [ ] All 3 pages load without errors
- [ ] Login works (correct & wrong credentials)
- [ ] Authorization works (can't access restricted pages)
- [ ] Ratings save to draft & persist after refresh
- [ ] Ratings submit to spreadsheet
- [ ] Leaderboard shows correct ranking
- [ ] Normalization works (test with multiple outlets)
- [ ] Responsive on mobile (320px - 1920px)
- [ ] All error messages in Indonesian
- [ ] No console errors

### Backend
- [ ] All API routes respond correctly
- [ ] Google Sheets API authenticated
- [ ] Data types match schema
- [ ] Timestamps in correct format
- [ ] No SQL injection (if using DB later)
- [ ] Rate limiting implemented
- [ ] Error responses have status codes

### Data
- [ ] Master_List sheet has correct structure
- [ ] DB_Penilaian New sheet has headers
- [ ] Sample data appended correctly
- [ ] No duplicates in sheet
- [ ] All calculation fields auto-calculated
- [ ] Date range queries work

### Deployment
- [ ] .env variables set correctly
- [ ] No hardcoded secrets in code
- [ ] Build completes without warnings
- [ ] Tests pass (if implemented)
- [ ] Vercel deployment successful
- [ ] Custom domain working (if applicable)

---

## 🆘 QUICK FIXES

### Login keeps failing
```typescript
// Check:
1. VALID_CREDENTIALS object exists
2. Username matches exactly (case-sensitive)
3. Password is exactly 'EGG2026'
4. Trim whitespace: username.trim()
```

### Spreadsheet data not updating
```typescript
// Check:
1. Google Sheets ID is correct
2. API key has access to sheet
3. Sheet name matches exactly (case-sensitive)
4. Range format is 'Sheet!A:Z' or 'Sheet!A1:Z1000'
5. Append range is A:Z (column wise)
```

### Ratings disappearing after refresh
```typescript
// Check:
1. localStorage key format is correct
2. JSON.stringify/parse works
3. Data structure matches RatingDraft interface
4. No quota exceeded (5-10MB limit)
```

### Leaderboard wrong numbers
```typescript
// Check:
1. normalize algorithm correctly implemented
2. outlet average calculated correctly
3. global average calculation correct
4. no division by zero errors
5. round numbers correctly
```

---

## 📚 REFERENCE TABLES

### Rating Scale Mapping
```
Grade | Points | Description
------|--------|-------------
  A   |   5    | Excellent
  B   |   4    | Good
  C   |   3    | Satisfactory
  D   |   2    | Poor
  E   |   1    | Very Poor
  -   |   0    | Not rated
```

### User IDs & Roles
```
ID Format: [OUTLET]-[NUMBER]
Example: BTM-001, TSF-005, MGR-001

Managers: MGR-001 to MGR-004
Supervisors: Varies per outlet
Staff: Varies per outlet
```

### Valid Outlets
```
BTM  = Back To Mie Kitchen
BTMF = Back To Mie Forest
TSF  = Taman Sari Forest
MBA  = Motoright Berkah Auto
EGC  = EGC (Engineering?)
HCP  = Healthopia Clinic
FRC  = Franchise
```

---

**Last Updated:** April 17, 2026
**Status:** Complete Quick Reference Guide
