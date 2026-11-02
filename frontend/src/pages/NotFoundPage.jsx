import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <div className="h-16 w-16 rounded-full bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] flex items-center justify-center mb-4">
        <Compass className="h-8 w-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-[#171717] tracking-tight">404</h1>
      <h2 className="text-base font-bold text-[#171717] mt-1">Campus Route Not Found</h2>
      <p className="text-xs text-[#737373] mt-1.5 max-w-sm leading-relaxed">
        The college directory or page you are trying to reach does not exist or has been relocated.
      </p>
      <div className="mt-6">
        <Button
          variant="primary"
          leftIcon={Home}
          onClick={() => navigate('/')}
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
}
