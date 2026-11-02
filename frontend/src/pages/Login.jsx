import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, AlertCircle, KeyRound, CheckCircle2, GraduationCap, Building2 } from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import PasswordInput from '../components/ui/PasswordInput';
import Captcha from '../components/ui/Captcha';
import { useToast } from '../components/ui/Toast';
import { useApp } from '../context/AppContext';
import { loginApi } from '../services/authService';

/**
 * CampusHub Login Page
 * Supports interactive segmented toggle for Student / Faculty portals,
 * Continue with Google SSO button with divider, caps-lock warning,
 * and compact layout fitting comfortably on desktop/laptop screens.
 */
export default function Login({ initialRole }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const { login, updateProfile } = useApp();

  const [role, setRole] = useState(() => {
    if (initialRole === 'faculty') return 'faculty';
    if (location.pathname.includes('/faculty')) return 'faculty';
    const queryRole = new URLSearchParams(location.search).get('role');
    if (queryRole === 'faculty') return 'faculty';
    return 'student';
  });

  const isFaculty = role === 'faculty';

  // Sync role if route changes
  useEffect(() => {
    if (initialRole) {
      setRole(initialRole);
    } else if (location.pathname.includes('/faculty')) {
      setRole('faculty');
    } else if (location.pathname.includes('/student')) {
      setRole('student');
    }
  }, [initialRole, location.pathname]);

  // Form states
  const [email, setEmail] = useState(location.state?.registeredEmail || '');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [registrationNotice, setRegistrationNotice] = useState(
    location.state?.registeredEmail ? 'Account created successfully. Enter your password to sign in.' : ''
  );
  const [isLoading, setIsLoading] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);

  const handleCaptchaVerify = (token) => {
    setCaptchaVerified(true);
    setCaptchaToken(typeof token === 'string' ? token : 'cf-verified-token');
    if (errors.captcha) {
      setErrors((prev) => ({ ...prev, captcha: undefined }));
    }
    if (authError === 'Please complete the CAPTCHA verification.') {
      setAuthError('');
    }
  };

  const handleCaptchaExpire = () => {
    setCaptchaVerified(false);
    setCaptchaToken('');
  };

  const handleCaptchaError = () => {
    setCaptchaVerified(false);
    setCaptchaToken('');
    setErrors((prev) => ({ ...prev, captcha: 'Please complete the CAPTCHA verification.' }));
  };
  const isValidEmail = (str) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str.trim());
  };

  const isEmailValid = email.trim().length > 0 && isValidEmail(email);
  const isPasswordValid = password.length >= 8;
  const isFormValid = isEmailValid && isPasswordValid && captchaVerified;

  // Field-level validator
  const validate = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!captchaVerified || !captchaToken) {
      newErrors.captcha = 'Please complete the CAPTCHA verification.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
    if (authError) setAuthError('');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: undefined }));
    }
    if (authError) setAuthError('');
  };

  // Structured submission to POST /api/auth/login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (!validate()) {
      if (!captchaVerified || !captchaToken) {
        setAuthError('Please complete the CAPTCHA verification.');
      }
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginApi({
        email,
        password,
        captchaToken,
        role: isFaculty ? 'faculty' : 'student',
      });

      if (result.success) {
        if (login) {
          login(result.user, result.token);
        } else if (result.user && updateProfile) {
          updateProfile(result.user);
        }

        addToast({
          title: isFaculty ? 'Welcome, Professor!' : 'Welcome to CampusHub!',
          message: `Logged in as ${result.user?.name || email} (${result.user?.role || (isFaculty ? 'Faculty' : 'Student')})`,
          type: 'success',
        });

        // Navigate to attempted route or student dashboard
        const redirectPath = location.state?.from?.pathname || '/app/dashboard';
        navigate(redirectPath, { replace: true });
      } else {
        setAuthError(result.error || 'Invalid email or password.');
      }
    } catch (err) {
      setAuthError('Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick helper to fill demo credentials for the active portal
  const handleUseDemoAccount = () => {
    if (isFaculty) {
      setEmail('dr.chen@faculty.university.edu');
      setPassword('Faculty2026!');
      setErrors({});
      setAuthError('');
      addToast({
        title: 'Faculty Demo Loaded',
        message: 'dr.chen@faculty.university.edu | Faculty2026!',
        type: 'info',
      });
    } else {
      setEmail('demo@campushub.com');
      setPassword('Demo1234');
      setErrors({});
      setAuthError('');
      addToast({
        title: 'Student Demo Loaded',
        message: 'demo@campushub.com | Demo1234',
        type: 'info',
      });
    }
  };

  // Google Single Sign-On handler
  const handleGoogleSignIn = () => {
    setIsLoading(true);
    setTimeout(() => {
      const googleUser = isFaculty
        ? {
            id: 'faculty-google',
            name: 'Dr. Sarah Chen',
            email: 'dr.chen@faculty.university.edu',
            role: 'faculty',
            department: 'Computer Science',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          }
        : {
            id: 'student-google',
            name: 'Alex Morgan',
            email: 'demo@campushub.com',
            role: 'student',
            department: 'Computer Science & Engineering',
            semester: '6',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          };

      if (login) {
        login(googleUser, 'google-sso-token');
      } else if (updateProfile) {
        updateProfile(googleUser);
      }

      addToast({
        title: 'Google Sign-In Successful',
        message: `Welcome, ${googleUser.name}!`,
        type: 'success',
      });

      setIsLoading(false);
      const redirectPath = location.state?.from?.pathname || '/app/dashboard';
      navigate(redirectPath, { replace: true });
    }, 450);
  };

  return (
    <AuthLayout
      headline={isFaculty ? 'Faculty & Institutional Portal.' : 'Your campus. Connected.'}
      supportingText={
        isFaculty
          ? 'Manage research laboratories, lecture syllabi, attendance records, and faculty department notices.'
          : 'Discover projects, events, campus information, and opportunities around you.'
      }
      mobileTitle={isFaculty ? 'Faculty & Staff Login 🎓' : 'Student Login 👋'}
      mobileSubtitle={isFaculty ? 'Sign in to faculty portal' : 'Sign in to your student account'}
    >
      <div className="w-full">
        {/* Header */}
        <div className="mb-2 text-center md:text-left">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#171717]">
            {isFaculty ? 'Faculty & Staff Login 🎓' : 'Student Login 👋'}
          </h1>
          <p className="text-xs text-[#525252] mt-0.5">
            {isFaculty
              ? 'Sign in to access lecture syllabi, gradebooks, and department rosters'
              : 'Sign in to access your student portal and campus tools'}
          </p>
        </div>

        {/* Segmented Toggle at the top of the form (Replaces previous bottom links) */}
        <div className="mb-2.5 p-1 rounded-xl bg-neutral-100 flex items-center gap-1 border border-neutral-200/70 select-none">
          <button
            type="button"
            onClick={() => {
              setRole('student');
              setErrors({});
              setAuthError('');
            }}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer ${
              !isFaculty
                ? 'bg-white text-neutral-900 shadow-2xs border border-black/5'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <GraduationCap className={`h-3.5 w-3.5 ${!isFaculty ? 'text-[#DC2626]' : 'text-neutral-400'}`} />
            <span>Student</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setRole('faculty');
              setErrors({});
              setAuthError('');
            }}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer ${
              isFaculty
                ? 'bg-white text-neutral-900 shadow-2xs border border-black/5'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Building2 className={`h-3.5 w-3.5 ${isFaculty ? 'text-[#DC2626]' : 'text-neutral-400'}`} />
            <span>Faculty & Staff</span>
          </button>
        </div>

        {/* Continue with Google button above the email form */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full h-9.5 px-4 rounded-xl border border-[#E5E5E5] bg-white hover:bg-neutral-50 active:bg-neutral-100 text-[#171717] font-medium text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all duration-150 shadow-2xs hover:border-[#D4D4D4] cursor-pointer"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="relative my-2.5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E5E5E5]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2.5 text-[11px] font-medium text-[#737373]">
              or continue with email
            </span>
          </div>
        </div>

        {/* Registration Success Alert if redirected from /register */}
        {registrationNotice && (
          <div
            role="status"
            className="mb-2.5 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-2 text-xs animate-in fade-in duration-200"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-emerald-900">Account ready!</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">{registrationNotice}</p>
            </div>
          </div>
        )}

        {/* Top Inline Authentication Error Alert */}
        {authError && (
          <div
            role="alert"
            className="mb-2.5 p-2 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] flex items-start gap-2 text-xs animate-in fade-in duration-200"
          >
            <AlertCircle className="h-4 w-4 text-[#DC2626] shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-[#DC2626]">Authentication failed</p>
              <p className="text-[11px] text-[#B91C1C] mt-0.5">{authError}</p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-2.5">
          {/* Email input tailored to role */}
          <Input
            id="login-email"
            label={isFaculty ? 'Institutional / Faculty Email' : 'College Email'}
            type="email"
            icon={Mail}
            value={email}
            onChange={handleEmailChange}
            placeholder={isFaculty ? 'dr.chen@faculty.university.edu' : 'student@college.edu or demo@campushub.com'}
            error={errors.email}
            disabled={isLoading}
            required
            autoComplete="email"
            autoFocus
          />

          {/* Password with Eye/EyeOff toggle and Caps Lock Warning */}
          <div>
            <PasswordInput
              id="login-password"
              label="Password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="••••••••"
              error={errors.password}
              disabled={isLoading}
              required
              autoComplete="current-password"
            />

            {/* Remember Me and Forgot Password row */}
            <div className="mt-1.5 flex items-center justify-between text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer select-none text-[#525252] hover:text-[#171717]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#D4D4D4] text-[#DC2626] focus:ring-[#DC2626] h-3.5 w-3.5"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => setForgotModalOpen(true)}
                className="font-medium text-[#DC2626] hover:text-[#B91C1C] hover:underline transition-colors cursor-pointer text-xs"
              >
                Forgot password?
              </button>
            </div>
          </div>

          {/* Cloudflare Turnstile CAPTCHA Protection */}
          <div className="pt-0.5">
            <Captcha
              onVerify={handleCaptchaVerify}
              onExpire={handleCaptchaExpire}
              onError={handleCaptchaError}
              error={errors.captcha}
            />
          </div>

          {/* Pill-shaped Primary Login Button */}
          <div className="pt-0.5">
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className={`w-full h-10 px-5 rounded-full font-medium text-xs sm:text-sm text-white bg-black hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer shadow-xs hover:shadow`}
            >
              <span>{isLoading ? 'Signing in...' : isFaculty ? 'Faculty Sign In' : 'Student Sign In'}</span>
              {!isLoading && (
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              )}
            </button>
            {!captchaVerified && isEmailValid && isPasswordValid && (
              <p className="text-[10px] text-center text-[#737373] mt-1 font-medium">
                Verify human check above to enable sign-in.
              </p>
            )}
          </div>
        </form>

        {/* Registration links - Student / Faculty links replaced by the segmented toggle at top */}
        <div className="mt-2 text-center text-xs text-[#737373]">
          {isFaculty ? (
            <div className="text-[11px] text-neutral-500">
              <span>Need faculty onboarding? </span>
              <button
                type="button"
                onClick={() => {
                  addToast({
                    title: 'Campus IT Directory',
                    message: 'Contact it-support@university.edu or visit Faculty Hall Rm 101.',
                    type: 'info',
                  });
                }}
                className="font-medium text-[#DC2626] hover:text-[#B91C1C] underline cursor-pointer"
              >
                Contact IT Support
              </button>
            </div>
          ) : (
            <div>
              <span>Don't have an account? </span>
              <Link
                to="/register"
                className="font-semibold text-[#DC2626] hover:text-[#B91C1C] hover:underline transition-colors ml-0.5"
              >
                Create your account →
              </Link>
            </div>
          )}
        </div>

        {/* Compact Demo Account Quick Fill Bar */}
        <div className="mt-2.5 pt-2 border-t border-[#F0F0F0] flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-neutral-500 text-[11px] truncate">
            <KeyRound className="h-3 w-3 text-[#DC2626] shrink-0" />
            <span className="truncate">
              Demo: <strong>{isFaculty ? 'dr.chen@faculty.university.edu' : 'demo@campushub.com'}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={handleUseDemoAccount}
            className="text-[11px] font-semibold text-[#DC2626] bg-[#FEF2F2] hover:bg-[#FEE2E2] px-2.5 py-0.5 rounded-full transition-colors cursor-pointer border border-[#FECACA] shrink-0"
          >
            {isFaculty ? 'Auto-fill Faculty Demo' : 'Auto-fill Student Demo'}
          </button>
        </div>
      </div>

      {/* Forgot Password Modal for Phase 1 */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl border border-[#E5E5E5]">
            <div className="h-10 w-10 rounded-full bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center mb-3">
              <KeyRound className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#171717]">Password Recovery</h3>
            <p className="mt-1 text-xs text-[#737373] leading-relaxed">
              In Phase 1, university student password recovery is managed via your college IT or Single Sign-On directory. You can use the instant <strong>Demo Account</strong> (demo@campushub.com / Demo1234) for full access.
            </p>
            <div className="mt-5 flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setForgotModalOpen(false)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setForgotModalOpen(false);
                  handleUseDemoAccount();
                }}
              >
                Fill Demo Credentials
              </Button>
            </div>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
