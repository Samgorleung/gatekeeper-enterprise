import type { AppProps } from 'next/app';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { HelpOutline as HelpIcon, Business as BusinessIcon } from '@mui/icons-material';
import { SearchProvider } from '@/context/SearchContext';
import { CompanyProvider, useCompany } from '@/context/CompanyContext';
import { GlobalLoadingProvider } from '@/components/LoadingSystem';
import { ConnectivityProvider, ConnectivityHeaderBadge, OfflineNoticeBanner } from '@/components/ConnectivityStatus';
import { GlobalHeaderSearch } from '@/components/GlobalHeaderSearch';
import { AuditFindingsSummaryCard } from '@/components/AuditFindingsSummaryCard';
import { UserGuideModal } from '@/components/UserGuideModal';
import { CompanyOnboardingSetupModal } from '@/components/CompanyOnboardingSetupModal';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { logger } from '@/utils/logger';
import '../public/styles/index.css';
import '../public/styles/App.css';
import '../public/styles/FileViewer.css';

function CompanyHeaderBadge() {
  const { companyProfile, setIsSetupModalOpen } = useCompany();
  return (
    <button
      type="button"
      onClick={() => setIsSetupModalOpen(true)}
      aria-label="Manage Company Profile and Data Setup"
      title="GateKeeper Enterprise - Organization Profile & Setup"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 11px',
        backgroundColor: companyProfile.isConfigured ? 'rgba(59, 130, 246, 0.18)' : 'rgba(234, 179, 8, 0.22)',
        border: '1px solid ' + (companyProfile.isConfigured ? 'rgba(96, 165, 250, 0.45)' : 'rgba(250, 204, 21, 0.6)'),
        borderRadius: '9999px',
        color: '#ffffff',
        fontSize: '0.75rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.15s ease'
      }}
    >
      <BusinessIcon style={{ fontSize: '0.95rem', color: companyProfile.isConfigured ? '#93c5fd' : '#fde047' }} />
      <span>{companyProfile.isConfigured ? (companyProfile.companyName || 'Company Profile') : 'Setup Company Data'}</span>
    </button>
  );
}

function AppContent({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isUserGuideOpen, setIsUserGuideOpen] = useState(false);

  useEffect(() => {
    logger.info('GateKeeper Enterprise application mounted', { path: router.asPath }, 'lifecycle');

    const handleRouteChange = (url: string) => {
      logger.trackEvent('page_view', { path: url }, 'navigation');
    };

    const handleRouteError = (err: any) => {
      // Aborted or cancelled route transition (user navigated elsewhere, prefetch cancelled) is not an error
      if (err?.cancelled || (typeof err?.message === 'string' && err.message.includes('Abort fetching component'))) {
        return;
      }
      logger.error('Route change error', err, {}, 'navigation');
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event?.reason;
      if (
        reason?.cancelled ||
        (typeof reason?.message === 'string' && reason.message.includes('Abort fetching component'))
      ) {
        event.preventDefault();
      }
    };

    const handleOpenGuide = () => {
      setIsUserGuideOpen(true);
    };

    window.addEventListener('open-user-guide', handleOpenGuide);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    router.events.on('routeChangeComplete', handleRouteChange);
    router.events.on('routeChangeError', handleRouteError);

    return () => {
      window.removeEventListener('open-user-guide', handleOpenGuide);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      router.events.off('routeChangeComplete', handleRouteChange);
      router.events.off('routeChangeError', handleRouteError);
    };
  }, [router]);

  const isActive = (pathname: string) => {
    if (pathname === '/') {
      return router.pathname === '/' || router.pathname === '/dashboard';
    }
    if (pathname === '/project-dashboard') {
      return router.pathname === '/project-dashboard' || router.pathname === '/compliance-tracker';
    }
    return router.pathname.startsWith(pathname);
  };

  return (
    <>
      <Head>
        <title>GateKeeper Enterprise | Stage-Gate Project Assurance & Audit Hub</title>
        <meta
          name="description"
          content="Enterprise stage-gate project assurance and compliance intelligence platform across Security, Privacy, AI, and PMO initiatives."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className="App">
        {/* Modern Executive Top Navigation Bar */}
        <header className="App-header">
          <div className="header-content">
            {/* Zone 1: Brand Wordmark */}
            <Link href="/" prefetch={false} passHref legacyBehavior>
              <a className="header-brand" aria-label="GateKeeper Enterprise Home">
                <div className="header-brand-logo">
                  <span>GK</span>
                </div>
                <div className="header-brand-title">
                  <h1>GateKeeper</h1>
                  <span>Enterprise Assurance Console</span>
                </div>
              </a>
            </Link>

            {/* Zone 2: Navigation Links (4 Consolidated Pillars) */}
            <nav className="header-nav">
              <Link href="/" prefetch={false} passHref legacyBehavior>
                <a className={`nav-link ${isActive('/') ? 'active' : ''}`}>
                  Portfolio Hub
                </a>
              </Link>
              <Link href="/project-dashboard" prefetch={false} passHref legacyBehavior>
                <a className={`nav-link ${isActive('/project-dashboard') ? 'active' : ''}`}>
                  Project Assurance
                </a>
              </Link>
              <Link href="/results" prefetch={false} passHref legacyBehavior>
                <a className={`nav-link ${isActive('/results') ? 'active' : ''}`}>
                  Review Findings
                </a>
              </Link>
              <Link href="/file-viewer" prefetch={false} passHref legacyBehavior>
                <a className={`nav-link ${isActive('/file-viewer') ? 'active' : ''}`}>
                  Document Dossier
                </a>
              </Link>
            </nav>

            {/* Persistent Global Search Bar in Header */}
            <GlobalHeaderSearch />

            {/* Zone 3: Executive Session & Connectivity */}
            <div className="header-actions">
              {/* Company Profile / Data Setup Button */}
              <CompanyHeaderBadge />

              {/* User Guide & Playbook Trigger */}
              <button
                type="button"
                onClick={() => setIsUserGuideOpen(true)}
                aria-label="Open User Guide and Assurance Playbook"
                title="GateKeeper Enterprise Playbook & Guide"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  borderRadius: '9999px',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <HelpIcon style={{ fontSize: '0.95rem', color: '#93c5fd' }} />
                <span>Assurance Guide</span>
              </button>

              {/* Real-time Network & Cloud Firestore Status Indicator */}
              <ConnectivityHeaderBadge />

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                color: '#e2e8f0',
                letterSpacing: '0.01em'
              }}>
                <span style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  boxShadow: '0 0 6px #10b981'
                }} />
                <span style={{ fontWeight: 600, color: '#ffffff' }}>Gate 2: Architecture Review</span>
                <span style={{ color: '#64748b' }}>•</span>
                <span style={{ color: '#94a3b8' }}>Enterprise Reviewer</span>
              </div>
            </div>
          </div>
        </header>

        {/* Persistent Sticky Offline Warning / Reconnection Banner */}
        <OfflineNoticeBanner />

        {/* Main Content Viewport */}
        <main className="main-content">
          <ErrorBoundary
            componentName="Application Viewport"
            resetKeys={[router.asPath]}
          >
            {/* High-Level Summary Card displaying Passed, Failed, and Pending findings */}
            <AuditFindingsSummaryCard />
            <Component {...pageProps} />
          </ErrorBoundary>
        </main>

        {/* Modern Corporate Footer */}
        <footer className="App-footer">
          <div className="footer-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 600, color: '#334155' }}>GateKeeper Enterprise</span>
              <span style={{ color: '#cbd5e1' }}>—</span>
              <span>Stage-Gate Project Assurance & Cross-Framework Governance Hub</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                type="button"
                onClick={() => setIsUserGuideOpen(true)}
                style={{
                  border: 'none',
                  background: 'none',
                  padding: 0,
                  color: '#1d70b8',
                  fontSize: 'inherit',
                  fontFamily: 'inherit',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                User Guide & Playbook
              </button>
              <span className="footer-separator">·</span>
              <Link href="/project-dashboard" prefetch={false} passHref legacyBehavior>
                <a>Project Dashboard</a>
              </Link>
              <span className="footer-separator">·</span>
              <Link href="/compliance-tracker" prefetch={false} passHref legacyBehavior>
                <a>Tracker</a>
              </Link>
              <span className="footer-separator">·</span>
              <Link href="/results" prefetch={false} passHref legacyBehavior>
                <a>Findings</a>
              </Link>
              <span className="footer-separator">·</span>
              <Link href="/privacy-policy" prefetch={false} passHref legacyBehavior>
                <a>Privacy & GDPR</a>
              </Link>
              <span className="footer-separator">·</span>
              <a href="mailto:support@gatekeeper.internal">Enterprise Support</a>
            </div>
          </div>
        </footer>

        {/* Global Interactive User Guide & Assurance Playbook Modal */}
        <UserGuideModal
          isOpen={isUserGuideOpen}
          onClose={() => setIsUserGuideOpen(false)}
        />

        {/* Organization Setup & Company Data Onboarding Modal */}
        <CompanyOnboardingSetupModal />
      </div>
    </>
  );
}

export default function MyApp(props: AppProps) {
  return (
    <CompanyProvider>
      <SearchProvider>
        <GlobalLoadingProvider>
          <ConnectivityProvider>
            <AppContent {...props} />
          </ConnectivityProvider>
        </GlobalLoadingProvider>
      </SearchProvider>
    </CompanyProvider>
  );
}

