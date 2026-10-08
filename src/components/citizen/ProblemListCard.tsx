import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, MessageSquare, ThumbsUp } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ProblemReport } from '../../types';

export interface ProblemListCardProps {
  problem: ProblemReport;
  /** Optional support toggle. Omitted on read-only listings. */
  onToggleSupport?: (problemId: string) => void;
  supported?: boolean;
}

/**
 * Feed-style problem card reused by My Reports and Supported so those screens
 * match the existing citizen dashboard styling exactly.
 */
export const ProblemListCard: React.FC<ProblemListCardProps> = ({
  problem,
  onToggleSupport,
  supported = false
}) => {
  return (
    <Card hoverable className="p-4 border-slate-200/80">
      <div className="flex flex-col sm:flex-row gap-4">
        {problem.imageUrl && (
          <img
            src={problem.imageUrl}
            alt={problem.title}
            className="w-full sm:w-36 h-28 object-cover rounded-xl shrink-0"
          />
        )}

        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {problem.category}
              </span>
              <span className="text-slate-300">•</span>
              <Badge priority={problem.priority} size="sm" />
            </div>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {problem.createdAt}
            </span>
          </div>

          <Link to={`/citizen/problem/${problem.id}`}>
            <h3 className="text-base font-bold text-slate-900 hover:text-emerald-600 transition-colors leading-snug line-clamp-2">
              {problem.title}
            </h3>
          </Link>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> {problem.location}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 uppercase tracking-wider">
              {problem.status}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-4">
              {onToggleSupport ? (
                <button
                  onClick={() => onToggleSupport(problem.id)}
                  className="flex items-center gap-1.5 hover:text-emerald-600 font-medium transition-colors"
                >
                  <ThumbsUp
                    className={`w-3.5 h-3.5 text-emerald-600 ${supported ? 'fill-emerald-600' : ''}`}
                  />
                  <span>
                    {problem.supportersCount} {supported ? 'Supported' : 'Supporters'}
                  </span>
                </button>
              ) : (
                <span className="flex items-center gap-1.5 font-medium">
                  <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{problem.supportersCount} Supporters</span>
                </span>
              )}

              <Link
                to={`/citizen/problem/${problem.id}`}
                className="flex items-center gap-1.5 hover:text-emerald-600 font-medium"
              >
                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                <span>{problem.commentsCount} Comments</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
