import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { CertificateView } from '../../components/certificate/CertificateView';
import { EmptyState } from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { instituteService } from '../../services/instituteService';
import { InstituteProject } from '../../types';

export const CertificatesListPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [completed, setCompleted] = useState<InstituteProject[]>([]);

  useEffect(() => {
    let mounted = true;
    instituteService
      .getInstituteProjects(user?.id)
      .then((projects) => {
        if (mounted) {
          setCompleted(projects.filter((p) => p.status === 'Completed' || p.status === 'COMPLETED'));
        }
      })
      .catch((err) => console.error('Could not load certificates:', err));
    return () => { mounted = false; };
  }, [user?.id]);

  const instituteName = profile?.full_name || 'Your Institute';

  // Illustrative certificate shown when the institute has no completed projects yet.
  const sampleCertificate = {
    certificateNumber: 'JS-CERT-2026-9814',
    recipientName: `${instituteName} Student Research Team`,
    projectTitle: 'Automated Water Quality Monitoring System',
    instituteName,
    projectId: 'JS-2026-001',
    issueDate: 'Sept 18, 2026',
    location: 'Ranchi, Ward 12, Jharkhand',
    category: 'Water & Sanitation'
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Social Innovation Certificates"
        subtitle="Government-issued certificates of achievement for completed civic R&D research projects."
        role="INSTITUTE"
      />

      {completed.length === 0 ? (
        <>
          <EmptyState
            title="No certificates issued yet"
            description="Certificates are issued automatically once a project is marked COMPLETED and verified by the government. Below is a preview of how yours will look."
          />
          <CertificateView data={sampleCertificate} />
        </>
      ) : (
        <div className="space-y-8">
          {completed.map((project) => (
            <CertificateView
              key={project.id}
              data={{
                certificateNumber: `JS-CERT-${String(project.id).slice(0, 8).toUpperCase()}`,
                recipientName: project.leadName,
                projectTitle: project.title,
                instituteName: project.guideInstitute || instituteName,
                projectId: project.id,
                issueDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
                location: project.location,
                category: 'Civic Innovation'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
