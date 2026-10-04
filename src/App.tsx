import { useEffect, useState } from 'react';
import { Layout, PAGES } from './components/Layout';
import { DEFAULT_NAV_ORDER } from './lib/config';
import type { PageId } from './lib/types';
import { DashboardPage } from './pages/DashboardPage';
import { InventoryPage } from './pages/InventoryPage';
import { MonthlyPage } from './pages/MonthlyPage';
import { PricingPage } from './pages/PricingPage';
import { useModelStore } from './store/useModelStore';

const readHash = (): PageId | null => {
  const h = window.location.hash.replace('#/', '') as PageId;
  return DEFAULT_NAV_ORDER.includes(h) ? h : null;
};

/** Hash routing keeps every page deep-linkable (e.g. #/inventory). With no hash, the first sidebar item opens. */
export default function App() {
  const firstPage = useModelStore((s) => s.navOrder[0]);
  const [page, setPage] = useState<PageId>(() => readHash() ?? firstPage);

  useEffect(() => {
    const onHash = () => setPage(readHash() ?? useModelStore.getState().navOrder[0]);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    document.title = `${PAGES[page].label} · DIC Financial Model`;
    window.scrollTo({ top: 0 });
  }, [page]);

  const navigate = (p: PageId) => {
    window.location.hash = `/${p}`;
  };

  // key={page} remounts the page so counters, gauges and charts replay their entry animation on every visit.
  return (
    <Layout page={page} onNavigate={navigate}>
      <div key={page} className="animate-page space-y-6">
        {page === 'dashboard' && <DashboardPage />}
        {page === 'inventory' && <InventoryPage />}
        {page === 'pricing' && <PricingPage />}
        {page === 'monthly' && <MonthlyPage />}
      </div>
    </Layout>
  );
}
