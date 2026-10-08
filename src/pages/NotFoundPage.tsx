import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-black text-slate-900">404 — Page Not Found</h1>
      <p className="text-sm text-slate-500 max-w-md">
        The page or route you are looking for does not exist in the JanSetu portal.
      </p>
      <Link to="/">
        <Button variant="primary" leftIcon={<Home className="w-4 h-4" />}>
          Back to Portal Home
        </Button>
      </Link>
    </div>
  );
};
