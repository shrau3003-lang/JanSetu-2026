import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Lock, Mail, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const { signIn, switchMockRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: err, role: signedInRole } = await signIn(email, password);
    setLoading(false);

    if (err) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } else {
      // Redirect using the role returned by signIn, not the stale context value.
      const dest =
        from || (signedInRole === 'ADMIN' ? '/admin' : signedInRole === 'INSTITUTE' ? '/institute' : '/citizen');
      navigate(dest, { replace: true });
    }
  };

  const handleQuickDemoRoleSelect = (selectedRole: UserRole) => {
    switchMockRole(selectedRole);
    const dest = selectedRole === 'ADMIN' ? '/admin' : selectedRole === 'INSTITUTE' ? '/institute' : '/citizen';
    navigate(dest, { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Header */}
      <header className="px-8 py-6 max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-900 flex items-center justify-center font-black text-xl shadow-lg shadow-emerald-500/20">
            JS
          </div>
          <span className="text-xl font-bold tracking-tight">JanSetu</span>
        </Link>
        <Link to="/signup" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300">
          Create Account →
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-md mx-auto w-full px-6 flex flex-col items-center justify-center my-8 space-y-6">
        <Card className="w-full bg-slate-800/90 border-slate-700/80 p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-white">Sign In to JanSetu</h1>
            <p className="text-xs text-slate-400">Enter your credentials to access your portal</p>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              required
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          {/* Quick Role Tester Bar */}
          <div className="pt-4 border-t border-slate-700/80 text-center space-y-3">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick Test Role Login (Stage 2 Demo):</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemoRoleSelect('CITIZEN')}
                className="py-2 px-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl hover:bg-emerald-500/20 font-bold transition-all"
              >
                Citizen
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoRoleSelect('ADMIN')}
                className="py-2 px-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl hover:bg-blue-500/20 font-bold transition-all"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoRoleSelect('INSTITUTE')}
                className="py-2 px-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-xl hover:bg-indigo-500/20 font-bold transition-all"
              >
                Institute
              </button>
            </div>
          </div>
        </Card>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-500">
        © 2026 JanSetu Platform • Supabase Auth Integrated
      </footer>
    </div>
  );
};
