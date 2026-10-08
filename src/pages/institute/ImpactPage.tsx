import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { ImpactSection } from '../../components/impact/ImpactSection';

export const ImpactPage: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Social Impact Analytics"
        subtitle="Transparent measurements of civic community outcomes, citizens impacted, and verified R&D resolutions."
        role="INSTITUTE"
      />

      <ImpactSection showProjects={true} />
    </div>
  );
};
