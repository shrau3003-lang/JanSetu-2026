import React from 'react';
import { Award, ShieldCheck, QrCode, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface CertificateData {
  certificateNumber: string;
  recipientName: string;
  projectTitle: string;
  instituteName: string;
  projectId: string;
  issueDate: string;
  location?: string;
  category?: string;
}

export const CertificateView: React.FC<{ data: CertificateData }> = ({ data }) => {
  const verifyUrl = `/verify/certificate/${data.certificateNumber}`;

  return (
    <div className="max-w-4xl mx-auto p-2 sm:p-6">
      {/* Official Certificate Border Frame */}
      <div className="relative bg-gradient-to-br from-amber-500/20 via-slate-900 to-indigo-950 p-3 sm:p-6 rounded-3xl shadow-2xl">
        <div className="bg-white rounded-2xl p-6 sm:p-10 border-4 border-amber-400/80 space-y-8 relative overflow-hidden shadow-inner">
          
          {/* Decorative Corner Filigree Stamps */}
          <div className="absolute top-0 left-0 w-16 h-16 border-t-8 border-l-8 border-amber-500 rounded-tl-2xl pointer-events-none" />
          <div className="absolute top-0 right-0 w-16 h-16 border-t-8 border-r-8 border-amber-500 rounded-tr-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-16 h-16 border-b-8 border-l-8 border-amber-500 rounded-bl-2xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-8 border-r-8 border-amber-500 rounded-br-2xl pointer-events-none" />

          {/* Header Seal & Title */}
          <div className="text-center space-y-3 border-b border-amber-100 pb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-white flex items-center justify-center mx-auto shadow-md shadow-amber-300">
              <Award className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-widest text-amber-700 block">
                JanSetu National Portal • Government of Jharkhand
              </span>
              <h1 className="text-2xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight">
                Certificate of Social Innovation
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Recognizing Academic Excellence & Verified Civic R&D Impact
              </p>
            </div>
          </div>

          {/* Body Content */}
          <div className="text-center space-y-6 max-w-2xl mx-auto py-2">
            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
              This certificate is proudly awarded to
            </p>

            <h2 className="text-2xl sm:text-3xl font-serif font-black text-indigo-950 underline decoration-amber-400 decoration-2 underline-offset-8">
              {data.recipientName}
            </h2>

            <p className="text-xs text-slate-600 leading-relaxed max-w-xl mx-auto">
              In recognition of successful research, development, and government-verified field deployment of the project:
            </p>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">{data.projectTitle}</h3>
              <p className="text-xs text-amber-800 font-semibold">{data.instituteName} • Location: {data.location || 'Ranchi, Jharkhand'}</p>
            </div>
          </div>

          {/* Metadata & Signatures Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100 items-end">
            
            {/* Left: Certificate Details */}
            <div className="space-y-1 text-left text-xs text-slate-500 font-medium">
              <div><strong className="text-slate-900">Project ID:</strong> {data.projectId}</div>
              <div><strong className="text-slate-900">Certificate No:</strong> <span className="font-mono text-amber-700 font-bold">{data.certificateNumber}</span></div>
              <div><strong className="text-slate-900">Issue Date:</strong> {data.issueDate}</div>
            </div>

            {/* Middle: Signature Blocks */}
            <div className="flex justify-around items-center gap-4 text-center">
              <div className="space-y-1">
                <div className="h-10 flex items-end justify-center font-serif text-slate-800 italic font-bold border-b border-slate-300 px-3">
                  Dr. R. K. Das
                </div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">State Nodal Officer</span>
              </div>

              <div className="space-y-1">
                <div className="h-10 flex items-end justify-center font-serif text-slate-800 italic font-bold border-b border-slate-300 px-3">
                  Prof. S. Mehta
                </div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Dean of Research</span>
              </div>
            </div>

            {/* Right: SVG QR Code & Verification Link */}
            <div className="text-center md:text-right flex flex-col items-center md:items-end space-y-1.5">
              <Link to={verifyUrl} className="group p-2 bg-slate-50 rounded-xl border border-slate-200 inline-block hover:border-amber-400 transition-all">
                {/* SVG QR Code */}
                <svg className="w-16 h-16" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="100" height="100" fill="white" />
                  <path d="M10 10H40V40H10V10ZM20 20V30H30V20H20Z" fill="#0f172a" />
                  <path d="M60 10H90V40H60V10ZM70 20V30H80V20H70Z" fill="#0f172a" />
                  <path d="M10 60H40V90H10V60ZM20 70V80H30V70H20Z" fill="#0f172a" />
                  <rect x="50" y="50" width="10" height="10" fill="#2563eb" />
                  <rect x="70" y="50" width="20" height="10" fill="#0f172a" />
                  <rect x="50" y="70" width="20" height="20" fill="#0f172a" />
                  <rect x="80" y="80" width="10" height="10" fill="#2563eb" />
                </svg>
              </Link>
              <Link to={verifyUrl} className="text-[10px] font-bold text-blue-600 hover:underline block">
                Verify Authenticity &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
