import React from 'react';
import PagePlaceholder from '@/components/shared/PagePlaceholder';

import { BarChart2 } from 'lucide-react';

export default function ReportsPage() {
  return (
    <PagePlaceholder 
      title="Astrology Reports" 
      description="Deep dive into specialized reports like Kaal Sarp Yoga, Gemstone recommendations, and Sade Sati analysis."
      icon={<BarChart2 size={48} />}
    />
  );
}
