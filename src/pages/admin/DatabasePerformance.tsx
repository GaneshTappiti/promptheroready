import React from 'react';
import DatabasePerformancePanel from '@/components/admin/DatabasePerformancePanel';

const DatabasePerformance: React.FC = () => {
  return (
    <div className="space-y-6">
      <DatabasePerformancePanel />
    </div>
  );
};

export default DatabasePerformance;
