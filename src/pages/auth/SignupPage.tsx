import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { User, Mail, Lock, Users, Shield, Building, BookOpen, Award, ArrowRight } from 'lucide-react';
import { UserRole } from '../../types';

export const SignupPage: React.FC = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('CITIZEN');

  // Institute specific fields
  const [instituteName, setInstituteName] = useState('');
  const [department, setDepartment] = useState('');
  const [accreditation, setAccreditation] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (role === 'INSTITUTE' && !instituteName.trim()) {
      setError('Institute Name is required for institute registration.');
      return;
    }

    setLoading(true);

    const instituteDetails = role === 'INSTITUTE' ? {
      name: instituteName.trim(),
      department: department.trim() || undefined,
      accreditation: accreditation.trim() || undefined
    } : undefined;

    const { error: err } = await signUp(email, password, fullName, role, instituteDetails);
    setLoading(false);

    if (err) {
      setError(err.message || 'Failed to create account.');
    } else {
      // Redirect based on selected role
      const dest = role === 'ADMIN' ? '/admin' : role === 'INSTITUTE' ? '/institute' : '/citizen';
      navigate(dest, { replace: true });
    }
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
        <Link to="/login" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300">
          Already have an account? Sign In →
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-md mx-auto w-full px-6 flex flex-col items-center justify-center my-8 space-y-6">
        <Card className="w-full bg-slate-800/90 border-slate-700/80 p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-white">Create your Account</h1>
            <p className="text-xs text-slate-400">Join JanSetu to participate, govern, or innovate</p>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Role Selection Pills */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Select Your Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('CITIZEN')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                    role === 'CITIZEN'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 ring-2 ring-emerald-500/30'
                      : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Citizen
                </button>
                <button
                  type="button"
                  onClick={() => setRole('ADMIN')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                    role === 'ADMIN'
                      ? 'bg-blue-500/20 border-blue-500 text-blue-400 ring-2 ring-blue-500/30'
                      : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => setRole('INSTITUTE')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                    role === 'INSTITUTE'
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 ring-2 ring-indigo-500/30'
                      : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <Building className="w-4 h-4" />
                  Institute
                </button>
              </div>
            </div>

            <Input
              label="Full Name"
              placeholder="e.g. Khushi Verma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              leftIcon={<User className="w-4 h-4 text-slate-400" />}
              required
            />

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
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              required
              minLength={6}
            />

            {/* Institute Specific Fields */}
            {role === 'INSTITUTE' && (
              <div className="space-y-4 pt-2 border-t border-slate-700/60">
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  Institute Registration Details
                </div>

                <Input
                  label="Institute Name"
                  placeholder="e.g. ABC Institute of Technology"
                  value={instituteName}
                  onChange={(e) => setInstituteName(e.target.value)}
                  leftIcon={<Building className="w-4 h-4 text-slate-400" />}
                  required
                />

                <Input
                  label="Department (Optional)"
                  placeholder="e.g. School of Engineering & R&D"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  leftIcon={<BookOpen className="w-4 h-4 text-slate-400" />}
                />

                <Input
                  label="Accreditation (Optional)"
                  placeholder="e.g. NAAC A++ Accredited"
                  value={accreditation}
                  onChange={(e) => setAccreditation(e.target.value)}
                  leftIcon={<Award className="w-4 h-4 text-slate-400" />}
                />
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Complete Registration
            </Button>
          </form>
        </Card>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-500">
        © 2026 JanSetu Platform • Supabase Auth Integrated
      </footer>
    </div>
  );
};
