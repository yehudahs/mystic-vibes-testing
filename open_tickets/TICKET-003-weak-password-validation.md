# TICKET-003: Weak Password Validation Not Working

**Status**: 🟡 Open  
**Priority**: Medium  
**Date**: 2025-10-23  
**Component**: Backend API - Authentication / Validation

## Summary

The password strength validation is not working as expected. Weak passwords (e.g., "weak") are being accepted when they should be rejected.

## Test Result

**TEST-BE-AUTH-001: User Registration**
```
✕ should reject registration with weak password (354 ms)

Expected status 400 (Bad Request)
Received status 201 (Created - Success)
```

## Current Behavior

The API accepts weak passwords like:
- "weak" (4 characters, no uppercase, no numbers, no special chars)
- Should be rejected but creates user successfully

## Expected Behavior

Passwords should meet minimum requirements:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter  
- At least one number
- At least one special character (optional but recommended)

Should return:
```json
{
  "status": 400,
  "error": "Password must be at least 8 characters and contain uppercase, lowercase, and numbers"
}
```

## Test Code

```javascript
test('should reject registration with weak password', async () => {
  const weakPasswords = [
    'weak',           // Too short
    'password',       // No numbers, no uppercase
    'Password',       // No numbers
    '12345678',       // No letters
    'pass123'         // Too short, no uppercase
  ];

  for (const password of weakPasswords) {
    const response = await api.register({
      name: 'Test User',
      email: `test_${Date.now()}@example.com`,
      password: password
    });

    expect(response.status).toBe(400);
    expect(response.data.error).toMatch(/password/i);
  }
});
```

## Root Cause

The password validation in the registration endpoint is either:
1. Missing entirely
2. Not configured properly
3. Using weak validation rules

## Affected File

```
mystic-vibes-api/routes/auth.js
  - POST /api/auth/register
  - Password validation logic
```

## Recommended Fix

Add password validation using a library like `joi` or custom validation:

```javascript
const passwordSchema = Joi.string()
  .min(8)
  .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])'))
  .required()
  .messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.pattern.base': 'Password must contain uppercase, lowercase, and numbers'
  });
```

Or custom validation:

```javascript
function validatePassword(password) {
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' };
  }
  
  return { valid: true };
}
```

## Security Impact

- **Severity**: Medium
- **Risk**: Users can create accounts with weak passwords
- **Impact**: Accounts vulnerable to brute force attacks
- **Recommendation**: Implement strong password policy

## Verification Steps

1. Apply password validation fix
2. Run test: `npm run test:backend -- auth-registration`
3. Verify weak password test passes
4. Manually test with weak passwords:
   ```bash
   curl -X POST http://localhost:3001/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","email":"test@example.com","password":"weak"}'
   ```
5. Should return 400 error

## Related Standards

- **OWASP**: Recommends minimum 8 characters with complexity
- **NIST**: Recommends minimum 8 characters, 12+ preferred
- **Industry Best Practice**: Enforce complexity rules

## Additional Recommendations

1. Consider adding password strength meter on frontend
2. Block common passwords (e.g., "password123")
3. Check against leaked password databases (haveibeenpwned API)
4. Add rate limiting on registration endpoint

---

**Ticket Created**: October 23, 2025  
**Discovered By**: TEST-BE-AUTH-001  
**Test Status**: 1 test failing  
**Priority**: Medium (security issue but not blocking other tests)
