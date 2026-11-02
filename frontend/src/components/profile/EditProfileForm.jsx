import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import AvatarUploader from './AvatarUploader';
import SkillsSection from './SkillsSection';
import {
  AlertCircle,
  Check,
  User,
  GraduationCap,
  Calendar,
  ShieldCheck,
  Terminal,
  Code2,
  Laptop,
  Hash,
} from 'lucide-react';
import { validateProfileData } from '../../services/userService';

const DEPARTMENT_OPTIONS = [
  { value: 'Computer Science & Engineering', label: 'Computer Science & Engineering (CSE)' },
  { value: 'Information Technology', label: 'Information Technology (IT)' },
  { value: 'Electronics & Communication Engineering', label: 'Electronics & Communication (ECE)' },
  { value: 'Electrical Engineering', label: 'Electrical Engineering (EE)' },
  { value: 'Mechanical Engineering', label: 'Mechanical Engineering (ME)' },
  { value: 'Civil Engineering', label: 'Civil Engineering (CE)' },
  { value: 'Data Science & AI', label: 'Data Science & AI (DSAI)' },
];

const SEMESTER_OPTIONS = [
  { value: '1st Semester', label: '1st Semester (Freshman)' },
  { value: '2nd Semester', label: '2nd Semester (Freshman)' },
  { value: '3rd Semester', label: '3rd Semester (Sophomore)' },
  { value: '4th Semester', label: '4th Semester (Sophomore)' },
  { value: '5th Semester', label: '5th Semester (Junior)' },
  { value: '6th Semester', label: '6th Semester (Junior)' },
  { value: '7th Semester', label: '7th Semester (Senior)' },
  { value: '8th Semester', label: '8th Semester (Senior)' },
];

const CSE_SPECIALIZATION_OPTIONS = [
  { value: 'Software Systems & Distributed Computing', label: 'Software Systems & Distributed Computing' },
  { value: 'Artificial Intelligence & Machine Learning', label: 'Artificial Intelligence & Machine Learning' },
  { value: 'Cybersecurity & Information Assurance', label: 'Cybersecurity & Information Assurance' },
  { value: 'Data Engineering & Cloud Computing', label: 'Data Engineering & Cloud Computing' },
  { value: 'Full Stack Web & Mobile Engineering', label: 'Full Stack Web & Mobile Engineering' },
  { value: 'Core Computer Science & Algorithms', label: 'Core Computer Science & Algorithms' },
];

const CSE_SECTION_OPTIONS = [
  { value: 'Section A (CSE-A)', label: 'Section A (CSE-A)' },
  { value: 'Section B (CSE-B)', label: 'Section B (CSE-B)' },
  { value: 'Section C (CSE-C / Honors)', label: 'Section C (CSE-C / Honors)' },
];

/**
 * EditProfileForm Component
 * Allows students to edit Full Name, Student ID, Department, CSE Department details,
 * Semester, Bio, Skills, and Photo.
 */
export default function EditProfileForm({
  initialUser = {},
  onSave,
  onCancel,
  isSaving = false,
  apiError = '',
}) {
  const [formData, setFormData] = useState({
    name: initialUser.name || initialUser.fullName || '',
    studentId: initialUser.studentId || 'CS-2024-8831',
    department: initialUser.department || 'Computer Science & Engineering',
    semester: initialUser.semester || '7th Semester',
    cseSpecialization: initialUser.cseSpecialization || 'Software Systems & Distributed Computing',
    cseSection: initialUser.cseSection || 'Section A (CSE-A)',
    cseLabGroup: initialUser.cseLabGroup || 'Turing Advanced Computing Lab (Lab 4)',
    cseAdvisor: initialUser.cseAdvisor || 'Dr. Rajesh Sharma (Head of CSE)',
    bio: initialUser.bio || '',
    avatar: initialUser.avatar || '',
    skills: Array.isArray(initialUser.skills) && initialUser.skills.length > 0
      ? [...initialUser.skills]
      : ['React', 'TypeScript', 'Node.js', 'Python', 'Docker', 'UI/UX Design'],
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validation = validateProfileData(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    if (typeof onSave === 'function') {
      onSave(formData);
    }
  };

  const isCseDepartment =
    formData.department === 'Computer Science & Engineering' ||
    formData.department.toLowerCase().includes('computer science');

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* General Error Banner */}
      {apiError && (
        <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] flex items-start gap-3 text-[#991B1B] animate-in fade-in duration-150">
          <AlertCircle className="h-5 w-5 text-[#DC2626] shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <p className="font-bold">Unable to update profile.</p>
            <p className="mt-0.5 text-[#B91C1C]">{apiError}</p>
          </div>
        </div>
      )}

      {/* Profile Photo Uploader Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Image</CardTitle>
          <CardDescription>
            Update your profile picture visible across CampusHub projects and community boards.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 sm:p-6">
          <AvatarUploader
            avatarSrc={formData.avatar}
            userName={formData.name || 'Student'}
            onAvatarChange={(newSrc) => handleChange('avatar', newSrc)}
            isEditing={true}
          />
        </CardContent>
      </Card>

      {/* Personal & Academic Details */}
      <Card>
        <CardHeader>
          <CardTitle>Personal & Academic Information</CardTitle>
          <CardDescription>
            Ensure your full name, student ID, and departmental credentials match university records.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <Input
              id="profile-fullname"
              label="Full Name"
              icon={User}
              required
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Alex Morgan"
              error={errors.name}
              helperText={errors.name}
            />

            {/* Student ID */}
            <Input
              id="profile-studentid"
              label="Student ID / Roll No."
              icon={ShieldCheck}
              required
              value={formData.studentId}
              onChange={(e) => handleChange('studentId', e.target.value)}
              placeholder="e.g., CS-2024-8831"
              error={errors.studentId}
              helperText={errors.studentId || 'Official university registration identifier'}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Department */}
            <Select
              id="profile-department"
              label="Department"
              icon={GraduationCap}
              required
              options={DEPARTMENT_OPTIONS}
              value={formData.department}
              onChange={(e) => handleChange('department', e.target.value)}
              error={errors.department}
              helperText={errors.department}
            />

            {/* Semester */}
            <Select
              id="profile-semester"
              label="Semester"
              icon={Calendar}
              required
              options={SEMESTER_OPTIONS}
              value={formData.semester}
              onChange={(e) => handleChange('semester', e.target.value)}
              error={errors.semester}
              helperText={errors.semester}
            />
          </div>

          {/* Dedicated CSE Department Section */}
          {isCseDepartment && (
            <div className="pt-4 border-t border-[#E5E5E5] space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-[#F5F5F5] border border-[#E5E5E5] text-[#525252]">
                    <Terminal className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#171717] uppercase tracking-wider">
                      CSE Department Section
                    </h4>
                    <p className="text-[11px] text-[#737373]">
                      Computer Science & Engineering specialization track, cohort, and lab
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F5F5F5] text-[#525252] border border-[#E5E5E5]">
                  Dept of CSE
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* CSE Specialization */}
                <Select
                  id="profile-cse-specialization"
                  label="CSE Specialization / Track"
                  icon={Code2}
                  options={CSE_SPECIALIZATION_OPTIONS}
                  value={formData.cseSpecialization}
                  onChange={(e) => handleChange('cseSpecialization', e.target.value)}
                  helperText="Primary academic concentration within CSE"
                />

                {/* Section / Division */}
                <Select
                  id="profile-cse-section"
                  label="Class Section & Division"
                  icon={Hash}
                  options={CSE_SECTION_OPTIONS}
                  value={formData.cseSection}
                  onChange={(e) => handleChange('cseSection', e.target.value)}
                  helperText="Assigned lecture and lab cohort"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Allocated Lab */}
                <Input
                  id="profile-cse-lab"
                  label="Allocated Computing Lab"
                  icon={Laptop}
                  value={formData.cseLabGroup}
                  onChange={(e) => handleChange('cseLabGroup', e.target.value)}
                  placeholder="e.g., Turing Advanced Computing Lab (Lab 4)"
                  helperText="Assigned project or practical workspace"
                />

                {/* Faculty Advisor / Mentor */}
                <Input
                  id="profile-cse-advisor"
                  label="Faculty Advisor / Mentor"
                  icon={User}
                  value={formData.cseAdvisor}
                  onChange={(e) => handleChange('cseAdvisor', e.target.value)}
                  placeholder="e.g., Dr. Rajesh Sharma (Head of CSE)"
                  helperText="Assigned academic mentor or project supervisor"
                />
              </div>
            </div>
          )}

          {/* Bio */}
          <div className="pt-2">
            <label
              htmlFor="profile-bio"
              className="block text-xs font-semibold text-[#171717] mb-1.5 flex items-center justify-between"
            >
              <span>About / Bio</span>
              <span className="text-[11px] font-normal text-[#737373]">
                {formData.bio.length}/300 characters
              </span>
            </label>
            <div className="relative">
              <textarea
                id="profile-bio"
                rows={4}
                maxLength={300}
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Tell your campus community a little about yourself, your interests, or what projects you are looking to build..."
                className="w-full text-sm rounded-lg bg-white border border-[#E5E5E5] p-3 text-[#171717] placeholder:text-neutral-400 focus:outline-none focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626] transition-all"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills Section (Interactive) */}
      <SkillsSection
        skills={formData.skills}
        isEditing={true}
        onSkillsChange={(newSkills) => handleChange('skills', newSkills)}
      />

      {/* Sticky or Bottom Action Bar */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-4 sm:p-5 flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-3 shadow-xs">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>

        <Button
          type="submit"
          variant="primary"
          isLoading={isSaving}
          leftIcon={Check}
          className="w-full sm:w-auto font-semibold"
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
}
