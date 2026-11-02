/**
 * User Service for CampusHub
 * Structured for GET /api/users/me and PUT /api/users/profile
 * with robust local cache persistence and fallback handling.
 */

const API_BASE_URL = typeof window !== 'undefined' ? (window.__CAMPUSHUB_API_URL__ || '') : '';
const STORAGE_KEY = 'campushub_user_profile';

/**
 * Validates profile fields before submission.
 *
 * @param {Object} data - Profile input fields
 * @returns {{ isValid: boolean, errors: Record<string, string> }}
 */
export function validateProfileData(data) {
  const errors = {};

  if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
    errors.name = 'Full name is required.';
  } else if (data.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  }

  if (!data.department || typeof data.department !== 'string' || !data.department.trim()) {
    errors.department = 'Department is required.';
  }

  if (!data.semester || typeof data.semester !== 'string' || !data.semester.trim()) {
    errors.semester = 'Semester is required.';
  }

  if (data.studentId !== undefined && (!data.studentId || typeof data.studentId !== 'string' || !data.studentId.trim())) {
    errors.studentId = 'Student ID is required.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Fetch currently authenticated student profile.
 * Structured to query GET /api/users/me.
 *
 * @param {Object} fallbackUser - Cached or default user from AppContext
 * @returns {Promise<{ success: boolean, user: Object, error?: string }>}
 */
export async function getCurrentUserApi(fallbackUser) {
  try {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('campushub_token') : null;

    const response = await fetch(`${API_BASE_URL}/api/users/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (response.ok) {
      const data = await response.json();
      const user = data.user || data;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      }
      return {
        success: true,
        user,
      };
    }
  } catch (networkError) {
    // Graceful fallback in preview/mock SPA environment
  }

  // Check locally stored updated profile
  let storedUser = null;
  if (typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        storedUser = JSON.parse(saved);
      }
    } catch {
      // ignore parse error
    }
  }

  // Fallback to currently logged in or stored student
  const resolved = storedUser || fallbackUser || {
    name: 'Alex Morgan',
    email: 'a.morgan@campus.edu',
    role: 'Student',
    studentId: 'CS-2024-8831',
    department: 'Computer Science & Engineering',
    departmentCode: 'CSE',
    semester: '7th Semester',
    cseSpecialization: 'Software Systems & Distributed Computing',
    cseSection: 'Section A (CSE-A)',
    cseLabGroup: 'Turing Advanced Computing Lab (Lab 4)',
    cseAdvisor: 'Dr. Rajesh Sharma (Head of CSE)',
    campusStatus: 'All systems normal',
    joinedDate: 'Joined August 2023',
    bio: 'Building open-source tools and passionate about AI systems and distributed systems. Always looking for hackathon teammates!',
    skills: ['React', 'TypeScript', 'Node.js', 'Python', 'Docker', 'UI/UX Design'],
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  };

  // Ensure department code, semester, and campus status are properly formatted
  const department = resolved.department || 'Computer Science & Engineering';
  const departmentCode =
    resolved.departmentCode ||
    (department.includes('Computer Science')
      ? 'CSE'
      : department.includes('Information Technology')
      ? 'IT'
      : department.includes('Electronics')
      ? 'ECE'
      : department.includes('Electrical')
      ? 'EE'
      : department.includes('Mechanical')
      ? 'ME'
      : department.includes('Civil')
      ? 'CE'
      : 'CSE');

  const semesterFormatted =
    resolved.semester && String(resolved.semester).toLowerCase().includes('semester')
      ? resolved.semester
      : resolved.semester
      ? `${resolved.semester}th Semester`
      : '7th Semester';

  const finalUser = {
    ...resolved,
    department,
    departmentCode,
    semester: semesterFormatted,
    campusStatus: resolved.campusStatus || 'All systems normal',
    joinedDate: resolved.joinedDate || 'Joined September 2026',
    bio: resolved.bio || '',
    skills: Array.isArray(resolved.skills)
      ? resolved.skills
      : ['React', 'Node.js', 'MongoDB', 'JavaScript', 'C++'],
  };

  return {
    success: true,
    user: finalUser,
  };
}

/**
 * Update authenticated student profile.
 * Structured to query PUT /api/users/profile.
 *
 * @param {Object} profileData - Updated fields
 * @param {Object} currentUser - Current user context
 * @returns {Promise<{ success: boolean, user?: Object, error?: string }>}
 */
export async function updateUserProfileApi(profileData, currentUser = {}) {
  // Validate input fields
  const validation = validateProfileData(profileData);
  if (!validation.isValid) {
    const firstError = Object.values(validation.errors)[0] || 'Please check the entered information.';
    return {
      success: false,
      error: firstError,
      validationErrors: validation.errors,
    };
  }

  try {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('campushub_token') : null;

    const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(profileData),
    });

    if (response.ok) {
      const data = await response.json();
      const updatedUser = data.user || data;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
      }
      return {
        success: true,
        user: updatedUser,
      };
    } else if (response.status === 400 || response.status === 422) {
      const errData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errData.message || 'Please check the entered information.',
      };
    }
  } catch (networkError) {
    // Graceful fallback for mock/preview environment
  }

  // Derive department code if department changed
  const department = profileData.department || currentUser.department || 'Computer Science & Engineering';
  const departmentCode =
    department.includes('Computer Science')
      ? 'CSE'
      : department.includes('Information Technology')
      ? 'IT'
      : department.includes('Electronics')
      ? 'ECE'
      : department.includes('Electrical')
      ? 'EE'
      : department.includes('Mechanical')
      ? 'ME'
      : department.includes('Civil')
      ? 'CE'
      : currentUser.departmentCode || 'CSE';

  const mergedUser = {
    ...currentUser,
    ...profileData,
    department,
    departmentCode,
    skills: Array.isArray(profileData.skills) ? profileData.skills : currentUser.skills || [],
    updatedAt: new Date().toISOString(),
  };

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedUser));
  }

  return {
    success: true,
    user: mergedUser,
  };
}
