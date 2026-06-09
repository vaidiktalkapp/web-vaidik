import React from 'react';
import PagePlaceholder from '@/components/shared/PagePlaceholder';

import { Book } from 'lucide-react';

export default function LearnAstrologyPage() {
  return (
    <PagePlaceholder 
      title="Learn Astrology" 
      description="Access beginner-friendly guides and in-depth tutorials to understand the language of the stars."
      icon={<Book size={48} />}
    />
  );
}
