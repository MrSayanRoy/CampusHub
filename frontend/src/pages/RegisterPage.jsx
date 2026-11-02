import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Building2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Check,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout';
import Input from '../components/ui/Input';
import PasswordInput from '../components/ui/PasswordInput';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import Captcha from '../components/ui/Captcha';
import { useToast } from '../components/ui/Toast';
import { registerApi } from '../services/authService';

// Pre-defined college departments (easily replaceable with institution data)
const COLLEGE_DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Other',
];

const SEMESTERS = [
  { value: '1', label: 'Semester 1' },
  { value: '2', label: 'Semester 2' },
  { value: '3', label: 'Semester 3' },
  { value: '4', label: 'Semester 4' },
  { value: '5', label: 'Semester 5' },
  { value: '6', label: 'Semester 6' },
  { value: '7', label: 'Semester 7' },
  { value: '8', label: 'Semester 8' },
];

/**
 * CampusHub Registration Page
 * Split-screen authentication layout matching Login Page,
 * with comprehensive inline validation, live password strength rules,
 * clean error banners, and seamless success state redirecting to /login.
 */
export default function RegisterPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Form input states
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    semester: '',
  });

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleCaptchaVerify = (token) => {
    setCaptchaVerified(true);
    setCaptchaToken(typeof token === 'string' ? token : 'cf-verified-token');
    if (errors.captcha) {
      setErrors((prev) => ({ ...prev, captcha: undefined }));
    }
    if (generalError === 'Please complete the CAPTCHA verification.') {
      setGeneralError('');
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

  // Live password requirement checks
  const passwordHasMinLength = formData.password.length >= 8;
  const passwordHasUppercase = /[A-Z]/.test(formData.password);
  const passwordHasNumber = /[0-9]/.test(formData.password);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear specific field error when student starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (generalError) {
      setGeneralError('');
    }
  };

  // Comprehensive validation function
  const validate = () => {
    const newErrors = {};

    // 1. Full Name
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must contain at least 2 characters.';
    }

    // 2. College Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'College email is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid college email.';
    }

    // 3. Password
    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (!passwordHasMinLength) {
      newErrors.password = 'Password must contain at least 8 characters.';
    } else if (!passwordHasUppercase) {
      newErrors.password = 'Password must contain at least one uppercase letter.';
    } else if (!passwordHasNumber) {
      newErrors.password = 'Password must contain at least one number.';
    }

    // 4. Confirm Password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    // 5. Department
    if (!formData.department) {
      newErrors.department = 'Please select your department.';
    }

    // 6. Semester
    if (!formData.semester) {
      newErrors.semester = 'Please select your semester.';
    }

    // 7. CAPTCHA verification
    if (!captchaVerified || !captchaToken) {
      newErrors.captcha = 'Please complete the CAPTCHA verification.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Structured submission to POST /api/auth/register
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    if (!validate()) {
      if (!captchaVerified || !captchaToken) {
        setGeneralError('Please complete the CAPTCHA verification.');
      }
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerApi({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        department: formData.department,
        semester: formData.semester,
        captchaToken,
      });

      if (result.success) {
        setIsSuccess(true);
        addToast({
          title: 'Registration Successful',
          message: 'Account created successfully. Redirecting to login...',
          type: 'success',
        });

        // Redirect after showing clear success confirmation
        setTimeout(() => {
          navigate('/login', {
            state: { registeredEmail: formData.email.trim() },
          });
        }, 1200);
      } else {
        if (result.error?.includes('already exists')) {
          setErrors((prev) => ({
            ...prev,
            email: 'An account with this email already exists.',
          }));
          setGeneralError('An account with this email already exists.');
        } else {
          setGeneralError(result.error || 'Registration failed. Please try again.');
        }
      }
    } catch (err) {
      setGeneralError('An error occurred during registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      headline="Join your campus community."
      supportingText="Create your account and discover projects, events, campus information, and more."
      mobileTitle="Create your account"
      mobileSubtitle="Use your college details to get started."
    >
      <div className="w-full">
        {/* Header */}
        <div className="mb-2 text-center md:text-left">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#171717]">
            Create your account
          </h1>
          <p className="mt-0.5 text-xs text-[#525252]">
            Enter your college details to get started
          </p>
        </div>

        {/* Success Alert Banner */}
        {isSuccess ? (
          <div
            role="status"
            className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-emerald-900">
              Account created successfully.
            </h3>
            <p className="mt-1 text-xs text-emerald-700">
              Redirecting you to the login page to sign in to CampusHub...
            </p>
            <div className="mt-2.5">
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/login')}
                rightIcon={ArrowRight}
              >
                Go to Log In
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Top Error Alert if duplicate email or server rejection */}
            {generalError && (
              <div
                role="alert"
                className="mb-2 p-2 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] flex items-start gap-2 text-xs animate-in fade-in duration-200"
              >
                <AlertCircle className="h-4 w-4 text-[#DC2626] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-[#DC2626]">Registration issue</p>
                  <p className="text-[11px] text-[#B91C1C] mt-0.5">{generalError}</p>
                </div>
              </div>
            )}

            {/* Compact Registration Form (2-Column Paired Rows) */}
            <form onSubmit={handleSubmit} noValidate className="space-y-2">
              {/* Row 1: Full Name & College Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <Input
                  id="register-fullname"
                  label="Full Name"
                  type="text"
                  icon={User}
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  placeholder="Alex Morgan"
                  error={errors.fullName}
                  disabled={isLoading}
                  required
                  autoComplete="name"
                  autoFocus
                />

                <Input
                  id="register-email"
                  label="College Email"
                  type="email"
                  icon={Mail}
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="you@college.edu"
                  error={errors.email}
                  disabled={isLoading}
                  required
                  autoComplete="email"
                />
              </div>

              {/* Row 2: Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <PasswordInput
                    id="register-password"
                    label="Password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="••••••••"
                    error={errors.password}
                    disabled={isLoading}
                    required
                    autoComplete="new-password"
                  />
                  {/* Subtle Compact Password Requirement Indicators */}
                  <div className="flex items-center gap-1.5 mt-1 text-[10px] text-neutral-400 select-none">
                    <span className={passwordHasMinLength ? 'text-emerald-600 font-medium' : ''}>8+ chars</span>
                    <span>•</span>
                    <span className={passwordHasUppercase ? 'text-emerald-600 font-medium' : ''}>1 uppercase</span>
                    <span>•</span>
                    <span className={passwordHasNumber ? 'text-emerald-600 font-medium' : ''}>1 number</span>
                  </div>
                </div>

                <div>
                  <PasswordInput
                    id="register-confirm-password"
                    label="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    placeholder="••••••••"
                    error={errors.confirmPassword}
                    disabled={isLoading}
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {/* Row 3: Department & Semester Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <Select
                  id="register-department"
                  label="Department"
                  icon={Building2}
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  placeholder="Select department"
                  options={COLLEGE_DEPARTMENTS}
                  error={errors.department}
                  disabled={isLoading}
                  required
                />

                <Select
                  id="register-semester"
                  label="Semester"
                  icon={Calendar}
                  value={formData.semester}
                  onChange={(e) => handleChange('semester', e.target.value)}
                  placeholder="Select semester"
                  options={SEMESTERS}
                  error={errors.semester}
                  disabled={isLoading}
                  required
                />
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

              {/* Pill-shaped Create Account Button */}
              <div className="pt-0.5">
                <button
                  type="submit"
                  disabled={!captchaVerified || isLoading}
                  className={`w-full h-10 px-5 rounded-full font-medium text-xs sm:text-sm text-white bg-black hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer shadow-xs hover:shadow`}
                >
                  <span>{isLoading ? 'Creating account...' : 'Create Account'}</span>
                  {!isLoading && (
                    <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
                      →
                    </span>
                  )}
                </button>
                {!captchaVerified && (
                  <p className="text-[10px] text-center text-[#737373] mt-1 font-medium">
                    Verify human check above to enable account creation.
                  </p>
                )}
              </div>
            </form>

            {/* Login Link */}
            <div className="mt-2 text-center text-xs text-[#737373]">
              <span>Already have an account? </span>
              <Link
                to="/login"
                className="font-semibold text-[#DC2626] hover:text-[#B91C1C] hover:underline transition-colors ml-1"
              >
                Log in →
              </Link>
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
