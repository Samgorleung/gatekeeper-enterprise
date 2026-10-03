import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { TrackerSkeleton } from '@/components/LoadingSystem';

const ProjectDashboard = dynamic(() => import('@/components/ProjectDashboard'), {
  ssr: false,
  loading: () => (
    <div style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto' }}>
      <TrackerSkeleton />
    </div>
  )
});

export default function ComplianceTrackerPage() {
  const router = useRouter();
  const initialProjectId = typeof router.query.projectId === 'string'
    ? router.query.projectId
    : typeof router.query.id === 'string'
    ? router.query.id
    : 'proj_001';

  return (
    <>
      <Head>
        <title>Compliance Requirements Checklist | GateKeeper Enterprise Assurance</title>
        <meta
          name="description"
          content="Audit and check off project compliance requirements across GateKeeper stage-gate governance frameworks."
        />
        <meta property="og:title" content="Compliance Requirements Checklist | GateKeeper Enterprise" />
        <meta
          property="og:description"
          content="Audit and check off project compliance requirements across GateKeeper stage-gate governance frameworks."
        />
      </Head>

      <ProjectDashboard
        initialProjectId={initialProjectId}
        defaultTab="checklist"
      />
    </>
  );
}
