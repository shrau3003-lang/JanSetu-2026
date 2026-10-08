import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Building2, 
  Award, 
  Briefcase, 
  CheckCircle2, 
  ThumbsUp, 
  FileText,
  Sparkles,
  Cpu,
  GraduationCap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Avatar } from '../components/common/Avatar';
import { Alert } from '../components/common/Alert';
import { EmptyState } from '../components/common/EmptyState';
import { PageHeader } from '../components/common/PageHeader';
import { Loading } from '../components/common/Loading';
import { 
  profileService, 
  CitizenProfileDetails, 
  GovernmentProfileDetails, 
  InstituteProfileDetails 
} from '../services/profileService';

export const ProfilePage: React.FC = () => {
  const { user, role, profile } = useAuth();
  const normRole = (role || 'CITIZEN').toString().toLowerCase();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [citizenData, setCitizenData] = useState<CitizenProfileDetails | null>(null);
  const [govData, setGovData] = useState<GovernmentProfileDetails | null>(null);
  const [instData, setInstData] = useState<InstituteProfileDetails | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        // The signed-in identity always comes from AuthContext / the profiles table.
        if (normRole === 'admin') {
          const data = await profileService.getGovernmentProfile(user?.id, profile);
          if (isMounted) setGovData(data);
        } else if (normRole === 'institute') {
          const data = await profileService.getInstituteProfile(user?.id, profile);
          if (isMounted) setInstData(data);
        } else {
          const data = await profileService.getCitizenProfile(user?.id, profile);
          if (isMounted) setCitizenData(data);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        if (isMounted) setError('We could not load your profile details. Please try again.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProfile();
    return () => { isMounted = false; };
  }, [user?.id, normRole, profile?.full_name, profile?.email]);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loading size="lg" text="Loading Profile Credentials..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-10">
        <Alert variant="error" title="Profile unavailable" message={error} />
      </div>
    );
  }

  // 1. GOVERNMENT PROFILE VIEW
  if (normRole === 'admin' && govData) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        <PageHeader
          title="Government Official Profile"
          subtitle="Administrative credentials, municipal department overview, and governance jurisdiction."
          role="ADMIN"
        />

        {/* Profile Card Header */}
        <Card className="p-6 border-slate-800 bg-slate-900 text-white space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar
                name={govData.fullName}
                src={govData.avatarUrl}
                role="ADMIN"
                className="w-16 h-16 border-2 border-blue-500 shadow-md"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">{govData.fullName}</h2>
                  <span className="bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Verified Officer
                  </span>
                </div>
                <p className="text-xs text-blue-300 font-medium">{govData.roleTitle}</p>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" /> {govData.email}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono font-bold text-blue-400 block">{govData.badgeNumber}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Official Badge Number</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Department</span>
              <p className="font-bold text-slate-200">{govData.department}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Jurisdiction Region</span>
              <p className="font-bold text-slate-200 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-400" /> {govData.jurisdiction}
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // 2. INSTITUTE PROFILE VIEW
  if (normRole === 'institute' && instData) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        <PageHeader
          title="Institute Innovation Profile"
          subtitle="Academic accreditation, department expertise, research competencies, and impact record."
          role="INSTITUTE"
        />

        <Card className="p-6 border-slate-200 space-y-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-4">
              <Avatar
                name={instData.instituteName}
                src={instData.avatarUrl}
                role="INSTITUTE"
                className="w-16 h-16"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold text-slate-900">{instData.instituteName}</h2>
                  <span className="bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                    Verified R&D Hub
                  </span>
                </div>
                <p className="text-xs text-indigo-600 font-semibold">{instData.accreditation}</p>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {instData.location} • <Mail className="w-3.5 h-3.5 text-slate-400" /> {instData.email}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Institute Overview</h3>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              {instData.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" /> Academic Departments ({instData.departments.length})
              </h3>
              <div className="space-y-1.5 text-xs">
                {instData.departments.map(dept => (
                  <div key={dept} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 font-semibold text-slate-800">
                    {dept}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-indigo-600" /> Research Skill Competencies ({instData.skills.length})
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {instData.skills.map(skill => (
                  <span key={skill} className="px-3 py-1 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Impact Overview Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-center">
            <div className="p-3 bg-slate-50 rounded-xl">
              <Briefcase className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
              <span className="text-base font-black text-slate-900 block">{instData.activeProjectsCount}</span>
              <span className="text-[10px] text-slate-500">Active Projects</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <Award className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <span className="text-base font-black text-slate-900 block">{instData.completedProjectsCount}</span>
              <span className="text-[10px] text-slate-500">Completed Projects</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <Sparkles className="w-4 h-4 text-teal-600 mx-auto mb-1" />
              <span className="text-base font-black text-slate-900 block">{instData.citizensImpacted.toLocaleString()}</span>
              <span className="text-[10px] text-slate-500">Citizens Impacted</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-blue-600 mx-auto mb-1" />
              <span className="text-base font-black text-slate-900 block">100%</span>
              <span className="text-[10px] text-slate-500">Verified Audit Score</span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // 3. CITIZEN PROFILE VIEW (Default)
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="Citizen Profile"
        subtitle="Track reported community issues, supported civic causes, and verified resolutions."
        role="CITIZEN"
      />

      {citizenData && (
        <div className="space-y-6">
          {/* Profile Header */}
          <Card className="p-6 border-slate-200 space-y-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar
                  name={citizenData.fullName}
                  src={citizenData.avatarUrl}
                  role="CITIZEN"
                  className="w-16 h-16"
                />
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">{citizenData.fullName}</h2>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> {citizenData.email} • <MapPin className="w-3.5 h-3.5 text-slate-400" /> {citizenData.location}
                  </p>
                </div>
              </div>
            </div>

            {/* 3 Citizen Stats Counters */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-center">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <FileText className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <span className="text-xl font-black text-slate-900 block">{citizenData.reportsCount}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Reports</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <ThumbsUp className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                <span className="text-xl font-black text-slate-900 block">{citizenData.supportedCount}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Supported</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <CheckCircle2 className="w-4 h-4 text-teal-600 mx-auto mb-1" />
                <span className="text-xl font-black text-slate-900 block">{citizenData.resolvedCount}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Resolved</span>
              </div>
            </div>
          </Card>

          {/* User's Reported Problems List */}
          <Card className="p-5 border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              My Reported Community Problems ({citizenData.reportsList.length})
            </h3>

            {citizenData.reportsList.length === 0 ? (
              <EmptyState
                title="No reports submitted yet"
                description="Civic problems you report will be listed here so you can track their verification progress."
              />
            ) : (
              <div className="space-y-3">
                {citizenData.reportsList.map(item => (
                  <Link
                    key={item.id}
                    to={`/citizen/problem/${item.id}`}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-4 text-xs hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge priority={item.priority} size="sm" />
                        <span className="text-[11px] font-bold text-slate-500">{item.category}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                      <p className="text-slate-500">{item.location} • Supporters: {item.supportersCount}</p>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                      {item.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
