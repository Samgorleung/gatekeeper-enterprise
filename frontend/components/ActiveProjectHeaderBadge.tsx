"use client";

import React, { useState } from 'react';
import {
  Business as ProjectIcon,
  SwapHoriz as SwitchIcon,
  RestartAlt as ReloadIcon
} from '@mui/icons-material';
import { useProjectSession } from '@/context/ProjectSessionContext';
import { ProjectSwitcherModal } from './ProjectSwitcherModal';

export const ActiveProjectHeaderBadge: React.FC = () => {
  const { activeProject, previousProject, reloadPreviousProject } = useProjectSession();
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  return (
    <>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
        {/* Main active project button */}
        <button
          type="button"
          onClick={() => setIsSwitcherOpen(true)}
          aria-label="Active Audit Project. Click to switch or create new project"
          title={`Active Audit Initiative: ${activeProject?.name || 'Default Project'}. Click to switch project.`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 11px',
            backgroundColor: 'rgba(29, 112, 184, 0.25)',
            border: '1px solid rgba(96, 165, 250, 0.5)',
            borderRadius: '9999px',
            color: '#ffffff',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            maxWidth: '240px'
          }}
        >
          <ProjectIcon style={{ fontSize: '0.95rem', color: '#93c5fd' }} />
          <span style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {activeProject ? activeProject.name : 'Select Project'}
          </span>
          <SwitchIcon style={{ fontSize: '0.85rem', color: '#cbd5e1', marginLeft: '2px' }} />
        </button>

        {/* Quick Reload Previous Project chip (if available) */}
        {previousProject && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              reloadPreviousProject();
            }}
            aria-label={`Reload previous project: ${previousProject.name}`}
            title={`Reload Previous Project: ${previousProject.name}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '9999px',
              color: '#cbd5e1',
              fontSize: '0.7rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <ReloadIcon style={{ fontSize: '0.8rem', color: '#f59e0b' }} />
            <span>Reload Prev</span>
          </button>
        )}
      </div>

      <ProjectSwitcherModal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
      />
    </>
  );
};
