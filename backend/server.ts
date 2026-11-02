import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { verifyTurnstileToken } from './src/services/captchaVerify.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// In-memory mock database of registered students for the backend
interface StudentRecord {
  id: string;
  name: string;
  email: string;
  department: string;
  semester: string | number;
  role: string;
}

const registeredStudents: Map<string, StudentRecord> = new Map([
  [
    'demo@campushub.com',
    {
      id: 'u-demo',
      name: 'Demo Student',
      email: 'demo@campushub.com',
      department: 'Computer Science & Engineering',
      semester: 5,
      role: 'Student',
    },
  ],
  [
    'alex.morgan@university.edu',
    {
      id: 'u-1',
      name: 'Alex Morgan',
      email: 'alex.morgan@university.edu',
      department: 'Computer Science & Engineering',
      semester: 6,
      role: 'Student',
    },
  ],
  [
    'dr.chen@faculty.university.edu',
    {
      id: 'u-faculty-1',
      name: 'Dr. Sarah Chen, Ph.D.',
      email: 'dr.chen@faculty.university.edu',
      department: 'Computer Science & Engineering',
      semester: 'Faculty Member',
      role: 'Faculty',
    },
  ],
]);

/**
 * CAPTCHA Verification Middleware for Express
 * Rejects requests with:
 * - Missing CAPTCHA token (400 Bad Request)
 * - Invalid CAPTCHA token (403 Forbidden)
 * - Expired CAPTCHA token (403 Forbidden)
 */
async function enforceCaptchaVerification(req: Request, res: Response, next: () => void) {
  const token = req.body?.captchaToken;
  const remoteIp = req.ip || req.socket.remoteAddress;

  if (!token || typeof token !== 'string' || !token.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Missing CAPTCHA token.',
      code: 'MISSING_CAPTCHA_TOKEN',
    });
  }

  const result = await verifyTurnstileToken(token, remoteIp);

  if (!result.success) {
    const isExpired = result.message?.toLowerCase().includes('expired') || result.errorCodes?.includes('timeout-or-duplicate');
    const statusCode = 403;
    const errorMessage = isExpired ? 'Expired CAPTCHA token.' : (result.message || 'Invalid CAPTCHA token.');

    return res.status(statusCode).json({
      success: false,
      message: errorMessage,
      code: isExpired ? 'EXPIRED_CAPTCHA_TOKEN' : 'INVALID_CAPTCHA_TOKEN',
      errorCodes: result.errorCodes,
    });
  }

  next();
}

/**
 * POST /api/auth/verify-captcha
 * Dedicated verification endpoint for testing and validating CAPTCHA tokens directly
 */
app.post('/api/auth/verify-captcha', async (req: Request, res: Response) => {
  const { captchaToken } = req.body || {};
  const remoteIp = req.ip || req.socket.remoteAddress;

  if (!captchaToken || typeof captchaToken !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Missing CAPTCHA token.',
    });
  }

  const result = await verifyTurnstileToken(captchaToken, remoteIp);
  if (!result.success) {
    const isExpired = result.message?.toLowerCase().includes('expired') || result.errorCodes?.includes('timeout-or-duplicate');
    return res.status(403).json({
      success: false,
      message: isExpired ? 'Expired CAPTCHA token.' : 'Invalid CAPTCHA token.',
      errorCodes: result.errorCodes,
    });
  }

  return res.json({
    success: true,
    message: 'CAPTCHA token verified successfully.',
  });
});

/**
 * POST /api/auth/login
 * Validates credentials after verifying Cloudflare Turnstile token with provider
 */
app.post('/api/auth/login', enforceCaptchaVerification, (req: Request, res: Response) => {
  const { email, password } = req.body || {};
  const normalizedEmail = (email || '').trim().toLowerCase();
  const trimmedPassword = (password || '').trim();

  if (!normalizedEmail || !trimmedPassword) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required.',
    });
  }

  // Pre-configured demo student credentials
  const isDemo = normalizedEmail === 'demo@campushub.com' && trimmedPassword === 'Demo1234';
  const isAlex = normalizedEmail === 'alex.morgan@university.edu' && trimmedPassword.length >= 8;
  const isExisting = registeredStudents.has(normalizedEmail) && trimmedPassword.length >= 8;

  if (isDemo || isAlex || isExisting) {
    const student = registeredStudents.get(normalizedEmail) || {
      id: `u-${Date.now()}`,
      name: normalizedEmail.split('@')[0],
      email: normalizedEmail,
      department: 'Computer Science',
      semester: 1,
      role: 'Student',
    };

    return res.json({
      success: true,
      message: 'Login successful.',
      user: student,
      token: `auth-token-${Date.now()}`,
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Invalid email or password.',
  });
});

/**
 * POST /api/auth/register
 * Creates a new student account after verifying Turnstile CAPTCHA token
 */
app.post('/api/auth/register', enforceCaptchaVerification, (req: Request, res: Response) => {
  const { fullName, email, password, department, semester } = req.body || {};
  const normalizedEmail = (email || '').trim().toLowerCase();

  if (!fullName || !normalizedEmail || !password || !department || !semester) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required.',
    });
  }

  if (registeredStudents.has(normalizedEmail)) {
    return res.status(409).json({
      success: false,
      message: 'An account with this email already exists.',
    });
  }

  const newStudent: StudentRecord = {
    id: `u-${Date.now()}`,
    name: fullName.trim(),
    email: normalizedEmail,
    department,
    semester,
    role: 'Student',
  };

  registeredStudents.set(normalizedEmail, newStudent);

  return res.status(201).json({
    success: true,
    message: 'Account created successfully.',
    user: newStudent,
  });
});

// Mount Vite in dev mode or serve static files in production
async function bootstrap() {
  if (process.env.NODE_ENV !== 'production') {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch {
      // If Vite middlewareMode cannot be loaded, serve dist
      app.use(express.static(path.resolve(__dirname, 'dist')));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
      });
    }
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CampusHub server with Turnstile CAPTCHA protection running on port ${PORT}`);
  });
}

bootstrap();
