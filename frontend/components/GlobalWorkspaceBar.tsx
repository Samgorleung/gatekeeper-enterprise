"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Business as ProjectIcon,
  SwapHoriz as SwitchIcon,
  RestartAlt as ReloadIcon,
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
  CloudDone as CloudDoneIcon,
  Speed as AuditSpeedIcon
} from '@mui/icons-material';
import { useProjectSession } from '@/context/ProjectSessionContext';
import { ProjectSwitcherModal } from './ProjectSwitcherModal';
import { IngestCompanyProjectModal } from './IngestCompanyProjectModal';
import { FRAMEWORK_CONFIGS } from '@/lib/seedData';

export const GlobalWorkspaceBar: React.FC = () => {
  const router = useRouter();
  const {
    activeProject,
    activeProjectId,
    previousProject,
    reloadPreviousProject,
    saveNewProject,
    isIngestModalOpen,
    setIsIngestModalOpen,
    isLiveSynced
  } = useProjectSession();

  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  if (!activeProject) return null;

  const frameworkConfig = activeProject.framework ? FRAMEWORK_CONFIGS[activeProject.framework] : null;
  const isAlreadyOnProjectDashboard = router.pathname === '/project-dashboard' &&
    (!router.query.projectId || router.query.projectId === activeProjectId);

  return (
    <>
      <div
        className="global-workspace-command-bar"
        style={{
          width: '100%',
          backgroundColor: '#ffffff',
          border: '1px solid #cbd5e1',
          borderLeft: '5px solid #1d70b8',
          borderRadius: '10px',
          color: '#0f172a',
          padding: '12px 18px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}
      >
        {/* Left: Active Project Identification */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: '1 1 auto' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: '#eff6ff',
            border: '1px solid #dbeafe',
            color: '#1d70b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <ProjectIcon style={{ fontSize: '1.15rem' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', minWidth: 0 }}>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#1d70b8'
            }}>
              Current Workspace:
            </span>

            <span style={{
              fontSize: '0.95rem',
              fontWeight: 700,
              color: '#0f172a',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '360px'
            }} title={activeProject.name}>
              {activeProject.name}
            </span>

            <span style={{
              fontSize: '0.72rem',
              fontFamily: 'monospace',
              padding: '2px 6px',
              backgroundColor: '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              color: '#475569'
            }}>
              {activeProject.code}
            </span>

            {frameworkConfig && (
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                padding: '2px 8px',
                backgroundColor: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe',
                borderRadius: '6px'
              }}>
                {frameworkConfig.badge || frameworkConfig.shortLabel}
              </span>
            )}

            <span style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              padding: '2px 8px',
              backgroundColor: '#ecfdf5',
              color: '#065f46',
              border: '1px solid #a7f3d0',
              borderRadius: '6px'
            }}>
              {activeProject.currentGate}
            </span>

            {isLiveSynced && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                fontSize: '0.68rem',
                color: '#059669',
                padding: '2px 6px',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '4px'
              }} title="Real-time Cloud Firestore synchronization active">
                <CloudDoneIcon style={{ fontSize: '0.8rem' }} />
                <span>Synced</span>
              </span>
            )}
          </div>
        </div>

        {/* Right: Quick Command Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>
          {/* Quick Reload Previous Project Chip */}
          {previousProject && (
            <button
              type="button"
              onClick={reloadPreviousProject}
              title={`Switch back to previously audited initiative: ${previousProject.name}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                backgroundColor: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '6px',
                color: '#b45309',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <ReloadIcon style={{ fontSize: '0.9rem', color: '#d97706' }} />
              <span>Reload Prev ({previousProject.code})</span>
            </button>
          )}

          {/* Switch Project Button */}
          <button
            type="button"
            onClick={() => setIsSwitcherOpen(true)}
            aria-label="Switch Audit Project"
            title="Browse all projects and switch active workspace"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 12px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              color: '#1e293b',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <SwitchIcon style={{ fontSize: '0.95rem', color: '#1d70b8' }} />
            <span>Switch Project ▾</span>
          </button>

          {/* Ingest / New Project Button */}
          <button
            type="button"
            onClick={() => setIsIngestModalOpen(true)}
            aria-label="Create New Audit Project"
            title="Ingest new project specifications into Cloud Firestore"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              color: '#0f172a',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <AddIcon style={{ fontSize: '0.95rem', color: '#1d70b8' }} />
            <span>+ New Project</span>
          </button>

          {/* Resume / Open Project Audit Console Action */}
          {!isAlreadyOnProjectDashboard ? (
            <Link
              href={`/project-dashboard?projectId=${encodeURIComponent(activeProjectId)}`}
              prefetch={false}
              passHref
              legacyBehavior
            >
              <a style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 14px',
                backgroundColor: '#1d70b8',
                border: 'none',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '0.75rem',
                fontWeight: 700,
                textDecoration: 'none',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(29, 112, 184, 0.25)'
              }}>
                <AuditSpeedIcon style={{ fontSize: '0.9rem' }} />
                <span>Resume Audit Console</span>
                <ArrowForwardIcon style={{ fontSize: '0.9rem' }} />
              </a>
            </Link>
          ) : (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 10px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '6px',
              color: '#1d4ed8',
              fontSize: '0.72rem',
              fontWeight: 600
            }}>
              Active in Console
            </span>
          )}
        </div>
      </div>

      {/* Global Project Switcher Modal */}
      <ProjectSwitcherModal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
      />

      {/* Ingest / Create New Project Modal */}
      <IngestCompanyProjectModal
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
        onProjectCreated={saveNewProject}
      />
    </>
  );
};
