import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Shield, Building, ArrowRight, CheckCircle2, Sparkles, Heart } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Navbar */}
      <header className="px-8 py-6 flex items-center justify-between border-b border-slate-800 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-900 flex items-center justify-center font-black text-xl shadow-lg shadow-emerald-500/20">
            JS
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">JanSetu</h1>
            <p className="text-[11px] text-emerald-400 font-medium tracking-wide">Civic Engagement & Action Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-400 font-medium">Select Portal:</span>
          <Link to="/citizen">
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800">
              Citizen
            </Button>
          </Link>
          <Link to="/admin">
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800">
              Admin
            </Button>
          </Link>
          <Link to="/institute">
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800">
              Institute
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-8 py-12 flex flex-col items-center justify-center text-center space-y-12">
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Stage 1 — Frontend Foundation Ready
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-100 leading-tight">
            Your Voice. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400">
              A Better Tomorrow.
            </span>
          </h2>
          <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Connecting citizens, government administration, and educational institutes to resolve real-world civic challenges with speed and transparency.
          </p>
        </div>

        {/* 3 Portal Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          {/* Citizen Card */}
          <Card className="bg-slate-800/80 border-slate-700/80 hover:border-emerald-500/50 text-left p-6 flex flex-col justify-between hover:scale-[1.02] transition-all group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                  Citizen Portal
                </h3>
                <p className="text-xs text-slate-400 mt-1">Light & Friendly Feed</p>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Report local issues, track resolution progress, support community causes, and explore problem maps.
              </p>
            </div>
            <div className="pt-6 border-t border-slate-700/60 mt-6">
              <Link to="/citizen">
                <Button variant="primary" fullWidth rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Enter Citizen Portal
                </Button>
              </Link>
            </div>
          </Card>

          {/* Admin Card */}
          <Card className="bg-slate-800/80 border-slate-700/80 hover:border-blue-500/50 text-left p-6 flex flex-col justify-between hover:scale-[1.02] transition-all group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                  Government Admin
                </h3>
                <p className="text-xs text-slate-400 mt-1">Official & Professional Control</p>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Verify submitted reports, manage priority queues, route issues to departments, and assign projects.
              </p>
            </div>
            <div className="pt-6 border-t border-slate-700/60 mt-6">
              <Link to="/admin">
                <Button variant="secondary" fullWidth rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Enter Admin Dashboard
                </Button>
              </Link>
            </div>
          </Card>

          {/* Institute Card */}
          <Card className="bg-slate-800/80 border-slate-700/80 hover:border-indigo-500/50 text-left p-6 flex flex-col justify-between hover:scale-[1.02] transition-all group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                  Institute Portal
                </h3>
                <p className="text-xs text-slate-400 mt-1">Modern & Insightful Workspace</p>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Accept innovation challenges, lead student projects, track milestones, and earn social impact certificates.
              </p>
            </div>
            <div className="pt-6 border-t border-slate-700/60 mt-6">
              <Link to="/institute">
                <Button variant="dark" className="border border-slate-600 hover:bg-slate-700" fullWidth rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Enter Institute Hub
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-6 border-t border-slate-800 text-center text-xs text-slate-500 max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-4">
        <p>© 2026 JanSetu Platform. All rights reserved.</p>
        <div className="flex items-center gap-1">
          <span>Crafted for social innovation with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
        </div>
      </footer>
    </div>
  );
};
