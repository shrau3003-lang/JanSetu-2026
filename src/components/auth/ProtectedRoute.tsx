import React from 'react';
import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { ShieldAlert, ArrowLeft, Home, Lock } from 'lucide-react';
import { Loading } from '../common/Loading';
import { Button } from '../common/Button';
import { Card } from '../common/Card';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { user, profile, loading, role } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading fullScreen text="Verifying credentials & session..." />;
  }

  // Not authenticated fallback
  if (!user && !profile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Normalize current role to uppercase
  const userRoleUpper = (role || profile?.role || 'CITIZEN').toString().toUpperCase();

  // Role checking
  if (allowedRoles && allowedRoles.length > 0) {
    const normalizedAllowed = allowedRoles.map((r) => r.toString().toUpperCase());

    if (!normalizedAllowed.includes(userRoleUpper)) {
      // Access Denied Screen (Citizens cannot access Admin, Institutes cannot access Government Admin)
      const getDefaultHome = () => {
        if (userRoleUpper === 'ADMIN') return '/admin';
        if (userRoleUpper === 'INSTITUTE') return '/institute';
        return '/citizen';
      };

      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
          <Card className="max-w-md w-full bg-slate-800/90 border-rose-500/40 p-8 space-y-6 text-center shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 inline-block">
                403 Forbidden
              </span>
              <h1 className="text-2xl font-black text-white">Access Denied</h1>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your account role (<span className="font-bold text-amber-400">{userRoleUpper}</span>) does not have authorization to view this area.
              </p>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/80 text-left text-xs text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Attempted Route:</span>
                <span className="font-mono text-slate-200">{location.pathname}</span>
              </div>
              <div className="flex justify-between">
                <span>Your Role:</span>
                <span className="font-semibold text-emerald-400">{userRoleUpper}</span>
              </div>
              <div className="flex justify-between">
                <span>Required Role:</span>
                <span className="font-semibold text-rose-400">{normalizedAllowed.join(' or ')}</span>
              </div>
            </div>

            <div className="pt-2">
              <Link to={getDefaultHome()}>
                <Button variant="primary" fullWidth leftIcon={<Home className="w-4 h-4" />}>
                  Go to {userRoleUpper} Portal
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      );
    }
  }

  return children ? <>{children}</> : <Outlet />;
};
