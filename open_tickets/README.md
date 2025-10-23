# Open Tickets

## Purpose
This folder is for test engineers to report issues, bugs, or blockers discovered during test implementation and execution that require fixes in the application code.

---

## How to Create a Ticket

### Option 1: Create a Markdown File
Create a new file: `TICKET-XXX.md` where XXX is the next ticket number (001, 002, etc.)

**Template:**
```markdown
# TICKET-XXX: [Brief Title]

**Status**: 🔴 Open | 🟡 In Progress | 🟢 Resolved | ⚫ Closed
**Priority**: Critical | High | Medium | Low
**Opened By**: [Your Name]
**Date Opened**: YYYY-MM-DD
**Related Test(s)**: TEST-XX-XXX

## Issue Description
Clear description of the issue discovered.

## Steps to Reproduce
1. Step one
2. Step two
3. ...

## Expected Behavior
What should happen.

## Actual Behavior
What actually happens.

## Evidence
- Screenshots: [if applicable]
- Logs: [paste relevant logs]
- Error messages: [paste exact error]

## Impact
How does this affect testing or functionality?
- [ ] Blocks test execution
- [ ] Test fails but can continue
- [ ] Minor issue, doesn't affect testing
- [ ] Security concern
- [ ] Performance issue

## Suggested Fix (Optional)
If you have ideas on how to fix this.

## Notes
Any additional context.

---

## Resolution (To be filled by developer)
**Resolved By**: [Developer Name]
**Date Resolved**: YYYY-MM-DD
**Fix Description**:
**Commit/PR**: [link]
**Verified By**: [Tester Name]
**Verification Date**: YYYY-MM-DD
```

### Option 2: Quick Issue Log
If you don't want to create individual files, you can add to `ISSUES_LOG.md`

---

## Ticket Status

### 🔴 Open Tickets
Tickets awaiting developer attention.

### 🟡 In Progress Tickets
Tickets currently being worked on by developers.

### 🟢 Resolved Tickets
Tickets that have been fixed and awaiting verification.

### ⚫ Closed Tickets
Tickets that have been verified as fixed and closed.

---

## Ticket Workflow

```
1. Tester discovers issue during test
   ↓
2. Tester creates ticket in open_tickets/
   ↓
3. Tester updates Status to 🔴 Open
   ↓
4. Developer reviews ticket
   ↓
5. Developer updates Status to 🟡 In Progress
   ↓
6. Developer fixes issue in codebase
   ↓
7. Developer updates ticket with fix details
   ↓
8. Developer updates Status to 🟢 Resolved
   ↓
9. Tester re-runs test to verify fix
   ↓
10. Tester updates Status to ⚫ Closed OR reopens if issue persists
```

---

## Priority Definitions

### Critical 🚨
- Application crashes or becomes unusable
- Security vulnerability
- Data loss or corruption
- Blocks multiple tests

### High ⚠️
- Major feature not working
- Significant performance issue
- Blocks one or more tests
- User-facing error

### Medium 📌
- Feature works but with issues
- Minor performance problem
- Workaround available
- Non-critical bug

### Low 📝
- Cosmetic issue
- Minor inconvenience
- Enhancement suggestion
- Documentation error

---

## Example Tickets

### Example 1: Backend API Error

**File**: `TICKET-001-palm-reading-500-error.md`

```markdown
# TICKET-001: Palm Reading API Returns 500 Error When Vision Model Not Available

**Status**: 🔴 Open
**Priority**: High
**Opened By**: Test Engineer
**Date Opened**: 2025-10-22
**Related Test(s)**: TEST-BE-AI-003, TEST-INT-002

## Issue Description
When executing TEST-BE-AI-003 (Generate Palm Reading), the API returns 500 Internal Server Error instead of a proper error message when the llama3.2-vision:11b model is not pulled in Ollama.

## Steps to Reproduce
1. Ensure llama3.2-vision:11b is NOT installed: `ollama list`
2. Send POST request to `/api/ai/palm/reading` with valid base64 image
3. Observe response

## Expected Behavior
API should return:
- Status: 500 or 503
- Error message: "Vision model llama3.2-vision:11b not found. Please pull the model first: ollama pull llama3.2-vision:11b"
- Helpful guidance for user

## Actual Behavior
API returns:
- Status: 500
- Error message: "Internal Server Error"
- No guidance on how to fix

## Evidence
```
Response:
{
  "error": "Failed to generate palm reading",
  "message": "Internal Server Error"
}

Backend Log:
Error: Model "llama3.2-vision:11b" not found
    at OllamaProvider.analyzeImage (ollamaProvider.js:244)
```

## Impact
- [x] Blocks test execution (cannot test palm reading without model)
- [x] User experience issue (unhelpful error message)
- [ ] Security concern
- [ ] Performance issue

## Suggested Fix
In `services/ai/ollamaProvider.js`, catch 404 errors from Ollama and return user-friendly error:

```javascript
if (error.response?.status === 404) {
  throw new Error(`Vision model "${visionModel}" not found. Please pull the model first: ollama pull ${visionModel}`)
}
```

## Notes
This is a common issue when setting up the application for the first time.

---

## Resolution
**Resolved By**:
**Date Resolved**:
**Fix Description**:
**Commit/PR**:
**Verified By**:
**Verification Date**:
```

---

### Example 2: Frontend Component Issue

**File**: `TICKET-002-palm-upload-file-size-check.md`

```markdown
# TICKET-002: Palm Upload Doesn't Reject Files > 5MB

**Status**: 🔴 Open
**Priority**: Medium
**Opened By**: Test Engineer
**Date Opened**: 2025-10-22
**Related Test(s)**: TEST-FE-UNIT-004, TEST-FE-COMP-001

## Issue Description
During TEST-FE-UNIT-004 (Image Upload Validation), discovered that the 5MB file size limit is not enforced. Files larger than 5MB are accepted and uploaded.

## Steps to Reproduce
1. Navigate to Palm Reading page
2. Click upload button
3. Select image file of 6MB
4. Observe behavior

## Expected Behavior
- File upload rejected
- Error toast appears: "File too large. Please upload an image smaller than 5MB"
- Image not uploaded

## Actual Behavior
- File accepted
- Image preview appears
- Backend may timeout or fail during processing

## Evidence
Test image: `test-palm-large.jpg` (6.2 MB)
No error message displayed.
File uploaded to backend.

## Impact
- [ ] Blocks test execution
- [x] Test fails but can continue
- [ ] Minor issue, doesn't affect testing
- [ ] Security concern
- [x] Performance issue (large images take very long to process)

## Suggested Fix
In `PalmReading.tsx`, add file size validation in `handleImageSelect`:

```typescript
if (file.size > 5 * 1024 * 1024) {
  toast({
    title: "File Too Large",
    description: "Please upload an image smaller than 5MB",
    variant: "destructive",
  })
  return
}
```

## Notes
Currently validation only exists in the UI instructions but not enforced in code.
```

---

## Communication

### For Urgent Issues
If you discover a critical issue:
1. Create the ticket immediately
2. Notify the development team via Slack/email
3. Mark as **Priority: Critical**
4. Add 🚨 emoji to ticket title

### For Questions
If you're unsure whether something is a bug or expected behavior:
1. Create ticket with **Status: ❓ Question**
2. Describe what you're seeing
3. Ask for clarification
4. Developer will respond in ticket

---

## Ticket Statistics

Track metrics in this section:

- **Total Tickets Opened**: 1
- **Currently Open**: 0
- **In Progress**: 0
- **Resolved (Awaiting Verification)**: 0
- **Closed**: 1
- **Average Resolution Time**: < 24 hours

### Ticket History
1. TICKET-001: Session Token Column Too Short - ⚫ Closed (Critical, 1 day)

---

## Archive

Once tickets are closed and verified, they can be moved to `../closed_tickets/` folder (sibling folder to open_tickets) for historical reference.

```bash
# Move closed tickets to closed_tickets folder
mv TICKET-XXX.md ../closed_tickets/
```

---

**Last Updated**: October 22, 2025
