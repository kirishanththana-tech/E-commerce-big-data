import { useState } from 'react';
import { Sidebar, NAV_ITEMS, PageKey } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { DashboardPage } from '@/pages/DashboardPage';
import { SalesAnalyticsPage } from '@/pages/SalesAnalyticsPage';
import { CustomerBehaviourPage } from '@/pages/CustomerBehaviourPage';
import { CustomerSegmentationPage } from '@/pages/CustomerSegmentationPage';
import { ProductAnalyticsPage } from '@/pages/ProductAnalyticsPage';
import { BigDataProcessingPage } from '@/pages/BigDataProcessingPage';
import { PredictiveAnalyticsPage } from '@/pages/PredictiveAnalyticsPage';
import { DatasetManagementPage } from '@/pages/DatasetManagementPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { SettingsPage } from '@/pages/SettingsPage';

function App() {
  const [active, setActive] = useState<PageKey>('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  const page = NAV_ITEMS.find((n) => n.key === active);
  const title = page?.label ?? 'Dashboard';

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar active={active} onNavigate={setActive} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="lg:pl-64">
        <TopBar title={title} onMenu={() => setMobileOpen(true)} />
        <main className="px-4 py-6 lg:px-8 lg:py-8">
          {active === 'dashboard' && <DashboardPage />}
          {active === 'sales' && <SalesAnalyticsPage />}
          {active === 'customer-behaviour' && <CustomerBehaviourPage />}
          {active === 'segmentation' && <CustomerSegmentationPage />}
          {active === 'products' && <ProductAnalyticsPage />}
          {active === 'big-data' && <BigDataProcessingPage />}
          {active === 'predictive' && <PredictiveAnalyticsPage />}
          {active === 'datasets' && <DatasetManagementPage />}
          {active === 'reports' && <ReportsPage />}
          {active === 'settings' && <SettingsPage />}
        </main>
      </div>
    </div>
  );
}

export default App;
