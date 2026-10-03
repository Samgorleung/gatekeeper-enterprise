import React from 'react';
import Head from 'next/head';
import PortfolioDashboard from '@/components/PortfolioDashboard';

export default function DashboardPage() {
  return (
    <>
      <Head>
        <title>Portfolio Dashboard | GateKeeper Enterprise Assurance</title>
        <meta
          name="description"
          content="Centralized enterprise project dashboard summarizing active compliance reviews, recent progress metrics, risk distributions, and upcoming audit deadlines."
        />
      </Head>

      <PortfolioDashboard />
    </>
  );
}
