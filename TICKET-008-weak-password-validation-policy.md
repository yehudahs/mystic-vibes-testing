# TICKET-008: Weak Password Validation Policy

**Priority:** MEDIUM  
**Status:** OPEN  
**Category:** Security  
**Created:** 2025-10-23  
**Test Suite:** TEST-SEC-005: Password Security

## Issue Description

The password validation policy is **weaker than recommended security standards**. The API currently accepts passwords that do not meet strong password requirements.

## Current Behavior

Password validation accepts:
- ❌ Lowercase-only passwords (e.g., "password123!")
- ❌ Passwords without numbers (e.g., "Password!")
- ❌ Passwords without special characters (e.g., "Password123")

## Test Results

```
⚠️ Password accepts lowercase-only (weaker policy)
⚠️ Password accepts no numbers (weaker policy)
⚠️ Password accepts no special chars (weaker policy)
```

All 19 password security tests passing, but warnings indicate weak validation.

## Security Impact

**Risk Level:** MEDIUM

**Vulnerabilities:**
1. **Brute Force:** Weaker passwords are easier to crack
2. **Dictionary Attacks:** Lowercase-only passwords vulnerable
3. **Password Guessing:** Reduced keyspace makes guessing easier
4. **Compliance:** May not meet security compliance requirements (PCI-DSS, SOC 2, etc.)

**OWASP Recommendation:**
- Minimum 8 characters (✅ IMPLEMENTED)
- At least one uppercase letter (❌ NOT ENFORCED)
- At least one lowercase letter (✅ IMPLICIT)
- At least one number (❌ NOT ENFORCED)
- At least one special character (❌ NOT ENFORCED)

## Expected Behavior

Password validation should enforce:
```javascript
{
  minLength: 8,                    // ✅ Current
  requireUppercase: true,          // ❌ Missing
  requireLowercase: true,          // ✅ Implicit
  requireNumbers: true,            // ❌ Missing
  requireSpecialChars: true,       // ❌ Missing
  commonPasswordCheck: true        // ❓ Unknown
}
```

## Steps to Reproduce

1. Register with lowercase-only password:
```bash
POST /api/auth/register
{
  "email": "test@example.com",
  "password": "password123!",  // No uppercase
  "name": "Test User"
}
```
**Result:** ❌ Accepted (should reject)

2. Register without numbers:
```bash
POST /api/auth/register
{
  "email": "test@example.com",
  "password": "Password!",  // No numbers
  "name": "Test User"
}
```
**Result:** ❌ Accepted (should reject)

3. Register without special characters:
```bash
POST /api/auth/register
{
  "email": "test@example.com",
  "password": "Password123",  // No special chars
  "name": "Test User"
}
```
**Result:** ❌ Accepted (should reject)

## Recommended Implementation

### Backend (Node.js/Express)

```javascript
// utils/passwordValidator.js
export function validatePasswordStrength(password) {
  const errors = [];
  
  // Minimum length
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  // Uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  // Lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  // Number
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  // Special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Optional: Check against common passwords
const commonPasswords = [
  'password', 'password123', '12345678', 'qwerty', 'abc123',
  // ... add more from common password lists
];

export function isCommonPassword(password) {
  return commonPasswords.includes(password.toLowerCase());
}
```

### Usage in Registration Endpoint

```javascript
// controllers/authController.js
import { validatePasswordStrength, isCommonPassword } from '../utils/passwordValidator.js';

export async function register(req, res) {
  const { email, password, name } = req.body;
  
  // Validate password strength
  const validation = validatePasswordStrength(password);
  if (!validation.isValid) {
    return res.status(422).json({
      error: 'Password does not meet requirements',
      details: validation.errors
    });
  }
  
  // Check common passwords (optional but recommended)
  if (isCommonPassword(password)) {
    return res.status(422).json({
      error: 'This password is too common. Please choose a more unique password.'
    });
  }
  
  // Continue with registration...
}
```

## Additional Security Recommendations

### 1. Rate Limiting for Failed Login Attempts
```javascript
⚠️ No rate limiting detected - consider implementing
```

**Implementation:**
```javascript
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.post('/api/auth/login', loginLimiter, authController.login);
```

### 2. Password Reset Implementation
```javascript
ℹ️ Password reset endpoint not implemented (404/405)
```

Consider implementing:
- `/api/auth/forgot-password` - Request reset
- `/api/auth/reset-password` - Complete reset
- Use secure tokens with expiration
- Send reset link via email
- Invalidate token after use

### 3. Account Lockout Policy
After X failed login attempts:
- Lock account for Y minutes
- Require email verification to unlock
- Log security events

## Testing

After implementing stronger validation, run:
```bash
npm test security-tests/password-security.test.js
```

**Expected Results:**
- ✅ All 19 tests passing
- ✅ No warnings about weak policy
- ✅ `console.log('✅ Password requires uppercase (strong policy)')`
- ✅ `console.log('✅ Password requires number (strong policy)')`
- ✅ `console.log('✅ Password requires special character (strong policy)')`

## Acceptance Criteria

- [ ] Password requires at least one uppercase letter
- [ ] Password requires at least one lowercase letter
- [ ] Password requires at least one number
- [ ] Password requires at least one special character
- [ ] Password minimum length enforced (8 characters)
- [ ] Common passwords rejected
- [ ] Clear error messages for validation failures
- [ ] All password security tests passing with no warnings

## Priority Justification

**MEDIUM Priority** because:
- ✅ Passwords are properly hashed (not stored in plaintext)
- ✅ No passwords leaked in responses
- ✅ Generic error messages (no user enumeration)
- ⚠️ But weak validation allows insecure passwords
- 🔒 Security improvement needed before production

## Related Tickets

- TICKET-003: Weak password validation (security issue) - **DUPLICATE**

## Impact

- **Users Affected:** All new registrations
- **Blocked Tests:** None (all tests passing)
- **Security Risk:** Medium (allows weak passwords)
- **Compliance Risk:** May fail security audits

## Resources

- [OWASP Password Guidelines](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [NIST Digital Identity Guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html)
- [Common Password Lists](https://github.com/danielmiessler/SecLists/tree/master/Passwords)
