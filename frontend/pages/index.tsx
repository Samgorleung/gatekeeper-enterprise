import React from 'react';
import Head from 'next/head';
import PortfolioDashboard from '@/components/PortfolioDashboard';

export default function Home() {
  return (
    <>
      <Head>
        <title>Portfolio Hub | GateKeeper Enterprise Assurance</title>
        <meta
          name="description"
          content="Centralized enterprise portfolio assurance hub summarizing active compliance reviews, risk distributions, governance frameworks, and upcoming audit checkpoints."
        />
        <meta property="og:title" content="Portfolio Hub | GateKeeper Enterprise Assurance" />
        <meta
          property="og:description"
          content="Centralized enterprise portfolio assurance hub summarizing active compliance reviews, risk distributions, governance frameworks, and upcoming audit checkpoints."
        />
      </Head>

      <PortfolioDashboard />
    </>
  );
}
