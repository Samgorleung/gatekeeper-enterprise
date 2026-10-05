"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Business as ProjectIcon,
  ArrowForward as ArrowIcon,
  RestartAlt as ReloadIcon,
  SwapHoriz as SwitchIcon,
  Add as AddIcon,
  CheckCircle as ActiveCheckIcon,
  CloudDone as CloudDoneIcon
} from '@mui/icons-material';
import { useProjectSession } from '@/context/ProjectSessionContext';
import { ProjectSwitcherModal } from './ProjectSwitcherModal';
import { IngestCompanyProjectModal } from './IngestCompanyProjectModal';
import { FRAMEWORK_CONFIGS } from '@/lib/seedData';

export const ActiveProjectResumeBanner: React.FC = () => {
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

  return (
    <>
      <div style={{
        margin: '0 0 24px 0',
        padding: '16px 20px',
        backgroundColor: '#ffffff',
        border: '1px solid #bfdbfe',
        borderLeft: '5px solid #1d70b8',
        borderRadius: '12px',
        boxShadow: '0 2px 8px -2px rgba(29, 112, 184, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Left: Active Project Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '280px', flex: '1 1 auto' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            backgroundColor: '#eff6ff',
            border: '1px solid #dbeafe',
            color: '#1d70b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <ProjectIcon style={{ fontSize: '1.4rem' }} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#1d70b8'
              }}>
                Current Audit Workspace
              </span>
              <span style={{ color: '#cbd5e1' }}>•</span>
              <span style={{
                fontSize: '0.7rem',
                fontFamily: 'monospace',
                backgroundColor: '#f1f5f9',
                padding: '1px 6px',
                borderRadius: '4px',
                color: '#475569'
              }}>
                {activeProject.code}
              </span>
              {isLiveSynced && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  color: '#059669',
                  backgroundColor: '#ecfdf5',
                  padding: '1px 6px',
                  borderRadius: '4px'
                }}>
                  <CloudDoneIcon style={{ fontSize: '0.75rem' }} />
                  Synced
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2px', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                {activeProject.name}
              </h2>
              {frameworkConfig && (
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  padding: '1px 8px',
                  backgroundColor: '#eff6ff',
                  color: '#1d4ed8',
                  border: '1px solid #bfdbfe',
                  borderRadius: '6px'
                }}>
                  {frameworkConfig.badge || frameworkConfig.shortLabel}
                </span>
              )}
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Phase: <strong>{activeProject.currentGate}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions (Resume Audit, Switch, Reload Previous, Ingest New) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {previousProject && (
            <button
              type="button"
              onClick={reloadPreviousProject}
              title={`Reload previous initiative: ${previousProject.name}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                color: '#334155',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <ReloadIcon style={{ fontSize: '0.95rem', color: '#f59e0b' }} />
              <span>Reload Prev ({previousProject.code})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsSwitcherOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              backgroundColor: '#ffffff',
              border: '1px solid #93c5fd',
              borderRadius: '8px',
              color: '#1d4ed8',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <SwitchIcon style={{ fontSize: '0.95rem' }} />
            <span>Switch Project</span>
          </button>

          <button
            type="button"
            onClick={() => setIsIngestModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              color: '#475569',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <AddIcon style={{ fontSize: '0.95rem' }} />
            <span>+ New Project</span>
          </button>

          <Link
            href={`/project-dashboard?projectId=${encodeURIComponent(activeProjectId)}`}
            prefetch={false}
            passHref
            legacyBehavior
          >
            <a style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              backgroundColor: '#1d70b8',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 700,
              textDecoration: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(29, 112, 184, 0.2)'
            }}>
              <span>Resume Project Audit</span>
              <ArrowIcon style={{ fontSize: '0.95rem' }} />
            </a>
          </Link>
        </div>
      </div>

      {/* Modals */}
      <ProjectSwitcherModal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
      />

      <IngestCompanyProjectModal
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
        onProjectCreated={saveNewProject}
      />
    </>
  );
};
