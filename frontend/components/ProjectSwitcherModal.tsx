"use client";

import React, { useState, useMemo } from 'react';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Business as ProjectIcon,
  CheckCircle as ActiveCheckIcon,
  History as HistoryIcon,
  Add as AddIcon,
  ArrowForward as ArrowIcon,
  RestartAlt as ReloadIcon,
  Security as SecurityIcon,
  Psychology as AiIcon,
  Assessment as PmoIcon,
  OpenInNew as OpenInNewIcon
} from '@mui/icons-material';
import { useProjectSession } from '@/context/ProjectSessionContext';
import { InfrastructureProject, FRAMEWORK_CONFIGS } from '@/lib/seedData';

interface ProjectSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectSwitcherModal: React.FC<ProjectSwitcherModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    activeProjectId,
    activeProject,
    availableProjects,
    recentProjects,
    previousProject,
    switchProject,
    reloadPreviousProject,
    setIsIngestModalOpen
  } = useProjectSession();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'COMPANY' | 'SAMPLE'>('ALL');

  // Filter and sort available projects
  const filteredProjects = useMemo(() => {
    return availableProjects.filter(p => {
      // Scope filter
      if (selectedFilter === 'COMPANY' && !p.isCompanyProject) return false;
      if (selectedFilter === 'SAMPLE' && p.isCompanyProject) return false;

      // Query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        (p.department && p.department.toLowerCase().includes(q)) ||
        (p.leadAuditor && p.leadAuditor.toLowerCase().includes(q)) ||
        (p.framework && p.framework.toLowerCase().includes(q))
      );
    });
  }, [availableProjects, searchQuery, selectedFilter]);

  if (!isOpen) return null;

  const handleSelect = (projectId: string) => {
    switchProject(projectId, true);
    onClose();
  };

  const handleOpenIngest = () => {
    onClose();
    setIsIngestModalOpen(true);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-switcher-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '85vh',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #e2e8f0'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: '#1d70b8',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ProjectIcon style={{ fontSize: '1.25rem' }} />
            </div>
            <div>
              <h2 id="project-switcher-title" style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                Select Active Audit Project
              </h2>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Switch between enterprise initiatives or reload previous project state from Cloud Firestore
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              border: 'none',
              background: 'transparent',
              color: '#64748b',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Quick Actions Bar (Reload Previous + Ingest New) */}
        <div style={{
          padding: '12px 24px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          {previousProject ? (
            <button
              type="button"
              onClick={() => {
                reloadPreviousProject();
                onClose();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                color: '#1d4ed8',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <ReloadIcon style={{ fontSize: '1rem' }} />
              <span>Reload Previous: <strong>{previousProject.name.slice(0, 30)}...</strong></span>
            </button>
          ) : (
            <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HistoryIcon style={{ fontSize: '0.95rem' }} />
              <span>Active: <strong>{activeProject?.name || 'Default Project'}</strong></span>
            </div>
          )}

          <button
            type="button"
            onClick={handleOpenIngest}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              backgroundColor: '#1d70b8',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <AddIcon style={{ fontSize: '1rem' }} />
            <span>+ Ingest New Project</span>
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div style={{ padding: '14px 24px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#fcfcfd' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{
              position: 'relative',
              flex: 1,
              display: 'flex',
              alignItems: 'center'
            }}>
              <SearchIcon style={{
                position: 'absolute',
                left: '12px',
                fontSize: '1.1rem',
                color: '#94a3b8'
              }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects by name, code, framework, or reviewer..."
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 38px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  outline: 'none',
                  backgroundColor: '#ffffff'
                }}
              />
            </div>

            {/* Scope tabs */}
            <div style={{ display: 'inline-flex', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
              {(['ALL', 'COMPANY', 'SAMPLE'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setSelectedFilter(tab)}
                  style={{
                    border: 'none',
                    padding: '5px 12px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    backgroundColor: selectedFilter === tab ? '#ffffff' : 'transparent',
                    color: selectedFilter === tab ? '#0f172a' : '#64748b',
                    boxShadow: selectedFilter === tab ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  {tab === 'ALL' ? 'All' : tab === 'COMPANY' ? 'Custom' : 'Benchmarks'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Project List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {filteredProjects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 16px', color: '#64748b' }}>
              <p style={{ margin: 0, fontWeight: 600 }}>No projects found matching &ldquo;{searchQuery}&rdquo;</p>
              <button
                type="button"
                onClick={handleOpenIngest}
                style={{
                  marginTop: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 16px',
                  backgroundColor: '#1d70b8',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <AddIcon style={{ fontSize: '0.95rem' }} />
                <span>Create New Project Now</span>
              </button>
            </div>
          ) : (
            filteredProjects.map(project => {
              const isCurrent = project.id === activeProjectId;
              const isPrev = previousProject?.id === project.id;
              const frameworkConfig = project.framework ? FRAMEWORK_CONFIGS[project.framework] : null;

              return (
                <div
                  key={project.id}
                  onClick={() => handleSelect(project.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: isCurrent ? '2px solid #1d70b8' : '1px solid #e2e8f0',
                    backgroundColor: isCurrent ? '#f0f7ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: isCurrent ? '#1d70b8' : '#f1f5f9',
                      color: isCurrent ? '#ffffff' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {isCurrent ? <ActiveCheckIcon style={{ fontSize: '1.2rem' }} /> : <ProjectIcon style={{ fontSize: '1.1rem' }} />}
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                          {project.name}
                        </span>
                        <span style={{
                          fontSize: '0.7rem',
                          fontFamily: 'monospace',
                          padding: '1px 6px',
                          backgroundColor: '#f1f5f9',
                          borderRadius: '4px',
                          color: '#475569'
                        }}>
                          {project.code}
                        </span>
                        {isCurrent && (
                          <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '1px 7px',
                            backgroundColor: '#1d70b8',
                            color: '#ffffff',
                            borderRadius: '9999px'
                          }}>
                            ACTIVE
                          </span>
                        )}
                        {isPrev && !isCurrent && (
                          <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '1px 7px',
                            backgroundColor: '#eff6ff',
                            color: '#1d4ed8',
                            border: '1px solid #bfdbfe',
                            borderRadius: '9999px'
                          }}>
                            PREVIOUS
                          </span>
                        )}
                        {project.isCompanyProject && (
                          <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '1px 6px',
                            backgroundColor: '#ecfdf5',
                            color: '#065f46',
                            border: '1px solid #a7f3d0',
                            borderRadius: '4px'
                          }}>
                            CUSTOM
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '0.75rem', color: '#64748b' }}>
                        <span>Gate: <strong>{project.currentGate}</strong></span>
                        <span>•</span>
                        <span>{project.department || project.sector}</span>
                        {project.leadAuditor && (
                          <>
                            <span>•</span>
                            <span>Reviewer: {project.leadAuditor}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
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

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: isCurrent ? '#1d70b8' : '#94a3b8',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}>
                      <span>{isCurrent ? 'Selected' : 'Switch'}</span>
                      <ArrowIcon style={{ fontSize: '1rem' }} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px',
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: '#64748b'
        }}>
          <span>
            Showing {filteredProjects.length} of {availableProjects.length} projects • Persisted in Cloud Firestore
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '6px 14px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
