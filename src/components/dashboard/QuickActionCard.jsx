import React from 'react';
import { ArrowRight } from 'lucide-react';
/**
 * Reusable QuickActionCard component
 * Contains: Lucide icon, Title, Short description, Arrow icon, and subtle Coming Soon badge
 */
export default function QuickActionCard({
  icon: Icon,
  title,
  description,
  badge = 'Coming Soon',
  onClick,
  disabled = false,
  className = '',
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full text-left bg-white rounded-xl border border-[#E5E5E5] p-4 sm:p-5
        shadow-xs hover:border-[#FCA5A5] hover:shadow-xs transition-all duration-150
        group cursor-pointer flex flex-col justify-between relative
        focus:outline-none focus:ring-2 focus:ring-[#DC2626]/20
        ${className}
      `}