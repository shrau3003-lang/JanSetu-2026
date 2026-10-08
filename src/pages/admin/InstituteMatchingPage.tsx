import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Sparkles, 
  CheckCircle2, 
  MapPin, 
  ShieldAlert, 
  Search, 
  Filter, 
  ChevronRight,
  ArrowRight,
  FileCheck
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { PageHeader } from '../../components/common/PageHeader';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { InstituteMatchModal } from '../../components/admin/InstituteMatchModal';
import { 
  instituteMatchingService, 
  ProblemMatchGroup 
} from '../../services/instituteMatchingService';
import { MatchResult } from '../../lib/instituteMatchEngine';
import { ProblemCategory } from '../../types';

export const InstituteMatchingPage: React.FC = () => {
  const [matchGroups, setMatchGroups] = useState<ProblemMatchGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Modal State
  const [activeProblem, setActiveProblem] = useState<any | null>(null);
  const [activeMatch, setActiveMatch] = useState<MatchResult | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadMatchingData();
  }, []);

  const loadMatchingData = async () => {
    setLoading(true);
    const groups = await instituteMatchingService.getMatchingGroups();
    setMatchGroups(groups);
    setLoading(false);
  };

  const handleApproveMatch = async (problemId: string, match: MatchResult) => {
    await instituteMatchingService.approveMatch(problemId, match.institute, match.matchScore);
    // Refresh local list state
    setMatchGroups(prev => prev.map(g => {
      if (g.problem.id === problemId) {
        return {
          ...g,
          approvedMatch: {
            instituteId: match.institute.id,
            instituteName: match.institute.name,
            matchScore: match.matchScore,
            approvedAt: new Date().toISOString()
          }
        };
      }
      return g;
    }));
  };

  const openReviewModal = (problem: any, match: MatchResult) => {
    setActiveProblem(problem);
    setActiveMatch(match);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loading size="lg" text="Calculating AI & Rule-based Institute Capability Matches..." />
      </div>
    );
  }

  // Filter match groups by search and category
  const filteredGroups = matchGroups.filter(g => {
    const matchesSearch = 
      g.problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.problem.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.problem.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCat = selectedCategory === 'all' || g.problem.category === selectedCategory;

    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <PageHeader
        title="Institute Matching Engine"
        subtitle="Match verified civic issues with academic R&D departments based on transparent capability formulas."
        role="ADMIN"
      />

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800 text-white shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search problems by title, location, category..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-800 text-xs text-white border border-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="Water & Sanitation">Water & Sanitation</option>
            <option value="Waste Management">Waste Management</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Environment">Environment</option>
          </select>
        </div>
      </div>

      {/* Matching Groups List */}
      {filteredGroups.length === 0 ? (
        <EmptyState
          title="No verified matching problems found"
          description="Try adjusting your search query or category filter."
          actionLabel="Reset Filters"
          onAction={() => { setSearchQuery(''); setSelectedCategory('all'); }}
        />
      ) : (
        <div className="space-y-6">
          {filteredGroups.map(({ problem, matches, approvedMatch }) => (
            <Card key={problem.id} className="p-6 border-slate-200 space-y-5 hover:border-slate-300 transition-all shadow-2xs">
              
              {/* Problem Header Summary */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge priority={problem.priority} size="sm" />
                    <span className="text-xs font-semibold text-slate-500">{problem.category}</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {problem.location}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{problem.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2">{problem.description}</p>
                </div>

                {approvedMatch ? (
                  <div className="shrink-0 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="block text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Approved Match</span>
                      <span>{approvedMatch.instituteName} ({approvedMatch.matchScore}%)</span>
                    </div>
                  </div>
                ) : (
                  <div className="shrink-0 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-amber-800 text-xs font-semibold">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    <span>Government Review Required</span>
                  </div>
                )}
              </div>

              {/* Matched Candidate Institutes List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Top Institute Capability Matches (Formula Ranked)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {matches.map((m) => {
                    const isSelectedMatch = approvedMatch?.instituteId === m.institute.id;
                    return (
                      <div 
                        key={m.institute.id}
                        className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                          isSelectedMatch 
                            ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-200' 
                            : 'bg-white border-slate-200/90 hover:border-blue-300 hover:shadow-2xs'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <span className="inline-flex items-center gap-1 text-xs font-extrabold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
                              <Sparkles className="w-3 h-3 text-blue-600" /> {m.matchScore}% Match
                            </span>

                            {isSelectedMatch && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                                Approved
                              </span>
                            )}
                          </div>

                          <div>
                            <h5 className="text-sm font-bold text-slate-900 leading-snug">{m.institute.name}</h5>
                            <p className="text-[11px] text-blue-600 font-medium">{m.institute.department}</p>
                          </div>

                          {/* Top Matched Skills Pill List */}
                          <div className="space-y-1 pt-1 text-[11px]">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Skill Verification:</span>
                            {m.matchedSkillsChecklist.slice(0, 3).map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between text-slate-700">
                                <span className="flex items-center gap-1.5">
                                  <span className={item.matched ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                                    {item.matched ? '✓' : '✕'}
                                  </span>
                                  {item.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openReviewModal(problem, m)}
                            className="text-xs border-blue-200 hover:bg-blue-50 text-blue-700 w-full justify-center"
                          >
                            Review & Assign
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Review & Approve Modal */}
      <InstituteMatchModal
        problem={activeProblem}
        matchResult={activeMatch}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onApprove={handleApproveMatch}
        isApproved={activeProblem && activeMatch ? approvedMatchMapCheck(activeProblem.id, activeMatch.institute.id) : false}
      />
    </div>
  );

  function approvedMatchMapCheck(problemId: string, instituteId: string): boolean {
    const g = matchGroups.find(x => x.problem.id === problemId);
    return g?.approvedMatch?.instituteId === instituteId;
  }
};
