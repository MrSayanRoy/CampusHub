import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Code, Plus, X } from 'lucide-react';
import Button from '../ui/Button';

/**
 * SkillsSection Component
 * Supports both view-only display with "+ Add Skill" trigger
 * and interactive edit mode with Enter-key submission and X remove icons.
 */
export default function SkillsSection({
  skills = [],
  isEditing = false,
  onSkillsChange,
  onAddSkillClick,
  className = '',
}) {
  const [newSkill, setNewSkill] = useState('');
  const [inputError, setInputError] = useState('');

  const handleAddSkill = (e) => {
    if (e) e.preventDefault();
    const trimmed = newSkill.trim();
    if (!trimmed) return;

    if (skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setInputError('This skill is already in your profile.');
      return;
    }

    const updated = [...skills, trimmed];
    if (typeof onSkillsChange === 'function') {
      onSkillsChange(updated);
    }
    setNewSkill('');
    setInputError('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    const updated = skills.filter((s) => s !== skillToRemove);
    if (typeof onSkillsChange === 'function') {
      onSkillsChange(updated);
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code className="h-4 w-4 text-[#525252]" />
          <CardTitle>Skills</CardTitle>
          <span className="text-xs font-semibold text-[#737373]">
            ({skills.length})
          </span>
        </div>

        {!isEditing && onAddSkillClick && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            leftIcon={Plus}
            onClick={onAddSkillClick}
            className="text-xs font-semibold text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
          >
            + Add Skill
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        {/* Interactive Add Skill Input (when editing) */}
        {isEditing && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => {
                  setNewSkill(e.target.value);
                  if (inputError) setInputError('');
                }}
                onKeyDown={handleKeyDown}
                placeholder="Add a skill (e.g., React, Python, C++)"
                className="flex-1 text-sm rounded-lg bg-white border border-[#E5E5E5] px-3.5 py-2 text-[#171717] placeholder:text-neutral-400 focus:outline-none focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626]"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                leftIcon={Plus}
                onClick={handleAddSkill}
                disabled={!newSkill.trim()}
              >
                Add
              </Button>
            </div>
            {inputError ? (
              <p className="text-xs text-[#DC2626]">{inputError}</p>
            ) : (
              <p className="text-[11px] text-[#737373]">
                Type a skill and press Enter to add.
              </p>
            )}
          </div>
        )}

        {/* Skill Pill Badges */}
        {skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium tracking-normal transition-colors duration-150 bg-[#F8F8F8] border border-[#E5E5E5] text-[#404040] hover:border-[#DC2626] hover:text-[#B91C1C]"
              >
                <span>{skill}</span>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="h-4 w-4 rounded-full flex items-center justify-center text-neutral-400 hover:text-[#DC2626] hover:bg-neutral-200 transition-colors cursor-pointer"
                    aria-label={`Remove ${skill}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </span>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-xs text-[#737373] italic">
              No skills added yet. Add relevant programming languages, tools, or domains.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
