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

export default function ProjectDashboardPage() {
  const router = useRouter();
  const initialProjectId = typeof router.query.projectId === 'string'
    ? router.query.projectId
    : typeof router.query.id === 'string'
    ? router.query.id
    : 'proj_001';

  return (
    <>
      <Head>
        <title>Project Dashboard | GateKeeper Enterprise Assurance</title>
        <meta
          name="description"
          content="Interactive project-level dashboard summarizing initiative review status, key risk metrics, stage-gate assurance profile, and compliance velocity."
        />
        <meta property="og:title" content="Project Dashboard | GateKeeper Enterprise Assurance" />
        <meta
          property="og:description"
          content="Interactive project-level dashboard summarizing initiative review status, key risk metrics, stage-gate assurance profile, and compliance velocity."
        />
      </Head>

      <ProjectDashboard initialProjectId={initialProjectId} />
    </>
  );
}
