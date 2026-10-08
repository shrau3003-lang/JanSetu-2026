import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Upload, AlertCircle, CheckCircle2, Image as ImageIcon, FileText } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Textarea } from '../../components/common/Textarea';
import { LocationPickerMap } from '../../components/common/LocationPickerMap';
import { useAuth } from '../../context/AuthContext';
import { ProblemCategory, PriorityLevel } from '../../types';
import { problemsService } from '../../services/problemsService';

export const SubmitReportPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ProblemCategory>('Water & Sanitation');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [locationStr, setLocationStr] = useState('');
  const [description, setDescription] = useState('');
  const [evidenceNotes, setEvidenceNotes] = useState('');
  
  // Pinpoint Coordinates State
  const [latitude, setLatitude] = useState<number | null>(23.3441);
  const [longitude, setLongitude] = useState<number | null>(85.3096);

  // File Upload State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleLocationMapChange = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    if (!locationStr) {
      setLocationStr(`Pinned Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!title.trim() || title.length < 5) {
      setError('Title must be at least 5 characters long.');
      return;
    }
    if (!description.trim() || description.length < 15) {
      setError('Description must be at least 15 characters long to provide sufficient detail.');
      return;
    }
    if (!locationStr.trim()) {
      setError('Please provide a location address or landmark.');
      return;
    }
    if (latitude === null || longitude === null) {
      setError('Please pinpoint your issue location on the map.');
      return;
    }
    if (!imageFile) {
      setError('An image file is required as visual evidence for civic verification.');
      return;
    }

    setSubmitting(true);
    try {
      // Complete Stage 5 Flow: Upload to Supabase Storage -> Insert Row with status PENDING_VERIFICATION -> Redirect
      const createdReport = await problemsService.createFullProblemReport(
        {
          title,
          description,
          category,
          priority,
          location: locationStr,
          latitude,
          longitude,
          imageFile,
          evidenceNotes
        },
        user?.id
      );

      setSubmitting(false);
      // Redirect to Problem Details page
      navigate(`/citizen/problem/${createdReport.id}`);
    } catch (err: any) {
      console.error('Error submitting report:', err);
      setError(err?.message || 'Failed to submit report. Please check your network and try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Navigation Back */}
      <Link to="/citizen" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Citizen Feed
      </Link>

      <Card className="p-6 md:p-8 border-slate-200/80 space-y-6">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block mb-2">
            Step-by-Step Reporting
          </span>
          <h1 className="text-2xl font-black text-slate-900">Report a Civic Problem</h1>
          <p className="text-xs text-slate-500 mt-1">
            Provide accurate details, pinpoint your location on the map, and upload visual proof. Your submission will be routed with status <strong className="text-amber-600 font-mono">PENDING_VERIFICATION</strong>.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-800">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold">Submission Error</h4>
              <p>{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">1. Issue Details</h3>
            
            <Input
              label="Issue Title"
              placeholder="e.g. Garbage collection hasn't happened in Sector 4 for 10 days"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={5}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ProblemCategory)}
                options={[
                  { label: 'Water & Sanitation', value: 'Water & Sanitation' },
                  { label: 'Waste Management', value: 'Waste Management' },
                  { label: 'Infrastructure', value: 'Infrastructure' },
                  { label: 'Education', value: 'Education' },
                  { label: 'Healthcare', value: 'Healthcare' },
                  { label: 'Environment', value: 'Environment' },
                ]}
              />

              <Select
                label="Estimated Priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                options={[
                  { label: 'Low Priority', value: 'low' },
                  { label: 'Medium Priority', value: 'medium' },
                  { label: 'High Priority', value: 'high' },
                  { label: 'Critical Priority', value: 'critical' },
                ]}
              />
            </div>

            <Textarea
              label="Full Description"
              rows={4}
              placeholder="Explain the problem in detail (cause, duration, immediate hazards to residents)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              minLength={15}
            />
          </div>

          {/* Section 2: Location & Leaflet Map Picker */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">2. Location & Pinpoint Coordinates</h3>
            
            <Input
              label="Address / Landmark"
              placeholder="e.g. Near St. Mary School, Main Road, Ranchi"
              value={locationStr}
              onChange={(e) => setLocationStr(e.target.value)}
              leftIcon={<MapPin className="w-4 h-4 text-emerald-600" />}
              required
            />

            {/* Leaflet OpenStreetMap Interactive Location Picker */}
            <LocationPickerMap
              latitude={latitude}
              longitude={longitude}
              onChange={handleLocationMapChange}
            />
          </div>

          {/* Section 3: Supabase Storage File Upload */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">3. Visual Proof & Supabase Storage Upload</h3>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Upload Photo Evidence (Required)
              </label>

              {imagePreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200">
                  <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                    className="absolute top-2 right-2 px-3 py-1 bg-slate-900/80 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold"
                  >
                    Change Photo
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/50 hover:bg-emerald-50/20 rounded-2xl p-6 text-center flex flex-col items-center justify-center cursor-pointer transition-all">
                  <Upload className="w-8 h-8 text-emerald-600 mb-2" />
                  <span className="text-xs font-bold text-slate-800">Click to Select Photo for Supabase Storage</span>
                  <span className="text-[10px] text-slate-400 mt-1">PNG, JPG, WEBP up to 10MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    required
                  />
                </label>
              )}
            </div>

            <Textarea
              label="Optional Additional Evidence / Notes"
              rows={2}
              placeholder="e.g. Previous complaint numbers, contact details of local community representative..."
              value={evidenceNotes}
              onChange={(e) => setEvidenceNotes(e.target.value)}
            />
          </div>

          {/* Submission Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => navigate('/citizen')}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={submitting}
              leftIcon={<CheckCircle2 className="w-5 h-5" />}
            >
              Submit Report to Supabase
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
