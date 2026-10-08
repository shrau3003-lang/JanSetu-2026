import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, AlertCircle, CheckCircle2, ShieldCheck, Users, Wrench, Lightbulb, Info } from 'lucide-react';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { aiService, AIAnalysisResult } from '../../services/aiService';
import { cn } from '../../lib/utils';

export interface AIAnalysisCardProps {
  problemId: string;
  title: string;
  description: string;
  category: string;
  location: string;
  initialAnalysis?: AIAnalysisResult | null;
  className?: string;
}

export const AIAnalysisCard: React.FC<AIAnalysisCardProps> = ({
  problemId,
  title,
  description,
  category,
  location,
  initialAnalysis,
  className
}) => {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(initialAnalysis || null);
  const [loading, setLoading] = useState<boolean>(!initialAnalysis);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await aiService.analyzeProblem(problemId, title, description, category, location);
      setAnalysis(result);
    } catch (err: any) {
      console.error('Error running AI analysis:', err);
      setError('AI Analysis failed to process. Click retry to run analysis again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialAnalysis) {
      runAnalysis();
    }
  }, [problemId]);

  return (
    <Card className={cn('p-6 border-indigo-200/80 bg-gradient-to-br from-indigo-50/40 via-purple-50/20 to-white space-y-4 shadow-sm', className)}>
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">AI-Assisted Analysis</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
                Advisory Only
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Powered by Gemini AI • Structured Civic Evaluation</p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          isLoading={loading}
          leftIcon={<RefreshCw className="w-3.5 h-3.5 text-indigo-600" />}
          onClick={runAnalysis}
          className="text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50 shrink-0"
        >
          Re-analyze with Gemini
        </Button>
      </div>

      {/* Official Advisory Disclaimer Notice */}
      <div className="p-3 bg-indigo-100/60 rounded-xl border border-indigo-200/70 flex items-start gap-2.5 text-xs text-indigo-900">
        <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <p className="leading-snug">
          <strong className="font-semibold">Notice:</strong> AI recommendations are generated automatically to assist municipal routing. Government administration retains final decision-making authority.
        </p>
      </div>

      {/* Loading Skeleton State */}
      {loading ? (
        <div className="space-y-3 py-2">
          <div className="h-4 bg-indigo-100/70 rounded w-3/4 animate-pulse" />
          <div className="h-12 bg-indigo-100/50 rounded w-full animate-pulse" />
          <div className="h-4 bg-indigo-100/70 rounded w-1/2 animate-pulse" />
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 text-xs flex items-center justify-between">
          <span>{error}</span>
          <Button variant="danger" size="sm" onClick={runAnalysis}>
            Retry
          </Button>
        </div>
      ) : analysis ? (
        <div className="space-y-4 text-xs">
          {/* Metrics summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div className="p-2.5 bg-white rounded-xl border border-indigo-100">
              <span className="text-[10px] font-medium text-slate-400 block">AI Assessed Severity</span>
              <span className={`font-bold ${analysis.severity === 'High' ? 'text-rose-600' : 'text-amber-600'}`}>
                {analysis.severity} Severity
              </span>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-indigo-100">
              <span className="text-[10px] font-medium text-slate-400 block">AI Assessed Urgency</span>
              <span className={`font-bold ${analysis.urgency === 'High' ? 'text-rose-600' : 'text-amber-600'}`}>
                {analysis.urgency} Urgency
              </span>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-indigo-100 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-medium text-slate-400 block">Affected Population</span>
              <span className="font-bold text-slate-800 flex items-center gap-1">
                <Users className="w-3 h-3 text-indigo-600" /> {analysis.affectedPopulation}
              </span>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">AI Summary</span>
            <p className="text-slate-700 bg-white p-3 rounded-xl border border-indigo-100 leading-relaxed">
              {analysis.summary}
            </p>
          </div>

          {/* Required Skills */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
              <Wrench className="w-3.5 h-3.5 text-indigo-600" /> Required Skills & Expertise
            </span>
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              {analysis.requiredSkills.map((skill) => (
                <span key={skill} className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200/70 text-[11px] font-semibold text-indigo-700">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Suggested Solution */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Suggested Solution & Action Plan
            </span>
            <p className="text-slate-700 bg-white p-3.5 rounded-xl border border-indigo-100 leading-relaxed font-medium">
              {analysis.suggestedSolution}
            </p>
          </div>
        </div>
      ) : null}
    </Card>
  );
};
