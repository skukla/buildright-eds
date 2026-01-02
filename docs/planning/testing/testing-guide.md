# BuildRight Project Builder - Testing Guide

## Quick Start Testing

### To See the Measurements Step (Step 2.5):

The measurements step only appears for projects that support visualization. Follow these steps:

1. **Go to:** http://localhost:8000/pages/project-builder.html

2. **Step 1 - Project Type:** Select one of these:
   - **Remodel** → Then choose: Bathroom, Kitchen, or Basement
   - **New Construction** → Then choose: Residential Home or Addition

3. **Step 2 - Details:** After selecting one of the above, you'll see **Step 3** appear as "Measurements" (this is actually Step 2.5 internally)

4. **Step 3 (Measurements):** You should see:
   - Input fields for Length, Width, Height, Doors, Windows
   - A real-time SVG visualization that updates as you change values
   - Material calculations displayed below
   - "Skip This Step" and "Continue" buttons

---

## Testing All New Features

### 1. Educational Tooltips ✅

**Where to test:**
- **Step 1:** Hover over the (?) icon next to "What type of project are you working on?"
- **Step 3 (Complexity):** Hover over the (?) icon next to "How complex is this project?"
- **Step 4 (Budget):** Hover over the (?) icon next to "What's your budget range?"

**Expected:** Tooltip appears on hover with helpful information

---

### 2. Project Tips Sidebar ✅

**How to test:**
1. Complete Steps 1-4 (select any project type, detail, complexity, budget)
2. Look at the **right sidebar** below the "Project Summary"
3. You should see a "💡 Project Tips" section with bullet points

**Expected:** Tips appear based on your project type and complexity selection

---

### 3. Measurements Step & Visualization ✅

**How to test:**
1. Select **Remodel → Bathroom** (or Kitchen/Basement)
2. After Step 2, you should see Step 3 labeled "Measurements"
3. Enter measurements:
   - Length: 10 ft
   - Width: 8 ft
   - Height: 8 ft
   - Doors: 1
   - Windows: 1
4. Watch the SVG visualization update in real-time
5. See material calculations below

**Expected:** 
- SVG floor plan or framing view appears
- Calculations show floor area, wall area, and (for framing projects) studs, plates, drywall sheets
- Visualization updates as you change inputs

---

### 4. Enhanced Bundle Display ✅

**How to test:**
1. Complete all steps to reach Step 5 (Results)
2. Look at the bundle table

**Expected to see:**
- **Product Images:** 60x60px thumbnails in the first column
- **Stock Indicators:** Green "✓ In Stock", Yellow "⚠ Low Stock", or Red "✗ Out of Stock" badges
- **"Why This Item" tooltips:** (?) icons next to product reasons

---

### 5. Component Category Toggles ✅

**How to test:**
1. Reach Step 5 (Results)
2. Look for "Customize Your Kit" section above the bundle table
3. Toggle checkboxes for:
   - Primary Materials
   - Fasteners & Hardware
   - Tools & Accessories
   - Finishing Materials

**Expected:**
- Unchecking a category hides those items from the table
- Total price updates dynamically
- Default: Primary Materials + Fasteners are ON, others OFF

---

### 6. Resource Links ✅

**How to test:**
1. Reach Step 5 (Results)
2. Scroll down below the bundle table
3. Look for "📚 Related Resources" section

**Expected:** Links appear based on your project type (e.g., "How to Frame a Bathroom Wall" for bathroom projects)

---

### 7. Copy Materials List ✅

**How to test:**
1. Reach Step 5 (Results)
2. Click the "📋 Copy Materials List" button
3. Open a text editor and paste (Cmd+V / Ctrl+V)

**Expected:**
- Toast notification: "Copied! Materials list copied to clipboard"
- Pasted text shows formatted materials list with:
  - Project name and date
  - Items grouped by category
  - Quantities, prices, and totals

---

### 8. Email Quote ✅

**How to test:**
1. Reach Step 5 (Results)
2. Click the "✉️ Email Quote" button

**Expected:**
- Email client opens (or default email handler)
- Subject: "BuildRight Quote - [Project Name]"
- Body: Formatted materials list

---

### 9. Project Notes ✅

**How to test:**
1. Reach Step 5 (Results)
2. Scroll to "Project Notes (Optional)" section
3. Type some notes (e.g., "Client prefers dark stain", "Check permits")
4. Refresh the page or navigate away and come back

**Expected:**
- Notes are saved in sessionStorage
- Notes persist when you return to the page
- Notes appear in printed quote (see #10)

---

### 10. Enhanced Printing ✅

**How to test:**
1. Reach Step 5 (Results)
2. Add some project notes (optional)
3. Click "🖨 Print Summary" button (in navigation) or use Cmd+P / Ctrl+P

**Expected:**
- Print preview shows:
  - **BuildRight Solutions** logo/header at top
  - Project details and generation date
  - Clean table without interactive elements
  - Project notes (if added) in a highlighted box
  - All materials visible (even if categories were toggled off)

---

## Test Scenarios

### Scenario 1: Bathroom Remodel (With Visualization)
1. Select: **Remodel → Bathroom**
2. See measurements step appear
3. Enter: 10ft x 8ft x 8ft, 1 door, 1 window
4. Select: **Moderate** complexity
5. Select: **$5,000 - $15,000** budget
6. Review bundle with images, stock indicators, tooltips
7. Toggle component categories
8. Copy materials list
9. Add project notes
10. Print quote

### Scenario 2: Plumbing Repair (Without Visualization)
1. Select: **Repair → Plumbing**
2. **No measurements step** - goes directly to Complexity
3. Select: **Basic** complexity
4. Select: **Under $5,000** budget
5. Review bundle (no visualization, but all other features work)

---

## Troubleshooting

### Measurements Step Not Appearing?
- **Check:** Did you select a project type that supports visualization?
  - ✅ **Shows:** Remodel (Bathroom, Kitchen, Basement), New Construction (Residential Home, Addition)
  - ❌ **Doesn't show:** Repair projects, Whole House, Exterior, Commercial, Other

### Tooltips Not Showing?
- Make sure you're hovering over the (?) icon, not just the heading
- Check browser console for JavaScript errors

### Project Tips Not Appearing?
- Make sure you've completed Steps 1-4 (selected project type, detail, complexity)
- Check the right sidebar below "Project Summary"

### Copy/Email Not Working?
- Check browser console for errors
- For copy: Make sure you're using a modern browser (Chrome, Firefox, Safari, Edge)
- For email: Make sure you have a default email client configured

---

## Quick Test Checklist

- [ ] Tooltips appear on Steps 1, 3, 4
- [ ] Project tips appear in sidebar after Step 4
- [ ] Measurements step appears for Bathroom/Kitchen/Basement/Residential/Addition
- [ ] Visualization updates in real-time
- [ ] Product images appear in bundle table
- [ ] Stock indicators show (In Stock/Low Stock/Out of Stock)
- [ ] Component toggles work and update price
- [ ] Resource links appear at Step 5
- [ ] Copy materials list works
- [ ] Email quote opens email client
- [ ] Project notes save and persist
- [ ] Print shows header, project details, and notes

