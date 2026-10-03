import React, { useState } from 'react';
import {
  Close as CloseIcon,
  Business as BusinessIcon,
  CloudUpload as UploadIcon,
  Security as SecurityIcon,
  Psychology as AiIcon,
  Assessment as PmoIcon,
  CheckCircle as CheckCircleIcon,
  AutoAwesome as SparklesIcon,
  Description as DocumentIcon,
  InfoOutlined as InfoIcon
} from '@mui/icons-material';
import { useCompany } from '@/context/CompanyContext';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { InfrastructureProject, GovernanceFramework, ComplianceRequirementItem } from '@/lib/seedData';

interface CompanyOnboardingSetupModalProps {
  onProjectCreated?: (newProject: InfrastructureProject) => void;
}

export const CompanyOnboardingSetupModal: React.FC<CompanyOnboardingSetupModalProps> = ({
  onProjectCreated
}) => {
  const { companyProfile, updateCompanyProfile, isSetupModalOpen, setIsSetupModalOpen, loadDemoCompany } = useCompany();

  // Company details
  const [companyName, setCompanyName] = useState(companyProfile.companyName || '');
  const [industry, setIndustry] = useState(companyProfile.industry || 'Enterprise Software & Cloud Platforms');
  const [primaryFramework, setPrimaryFramework] = useState<GovernanceFramework>(companyProfile.primaryFramework || 'SECURITY_GDPR');
  const [dpoOrSroName, setDpoOrSroName] = useState(companyProfile.dpoOrSroName || '');
  const [dpoOrSroEmail, setDpoOrSroEmail] = useState(companyProfile.dpoOrSroEmail || '');

  // Initial project options
  const [createInitialProject, setCreateInitialProject] = useState(true);
  const [projectName, setProjectName] = useState('Customer Identity & Privacy Vault');
  const [projectCode, setProjectCode] = useState('VAULT-01');
  const [currentGate, setCurrentGate] = useState('GATE_2');
  const [projectBudget, setProjectBudget] = useState('$1.5M');
  const [specText, setSpecText] = useState(
    `SYSTEM ARCHITECTURE & PRIVACY SCOPE:
- Authentication: OAuth 2.1 / OIDC with PKCE and MFA enforcement.
- Data Storage: Customer PII (Email, Phone, Payment Tokens) in AES-256 encrypted database.
- GDPR Compliance: Automated Article 17 (Right to Erasure) shredding triggers and Article 32 security controls.
- Retention: 90-day cold storage purge policy enforced via TTL indices.`
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isSetupModalOpen) return null;

  const handleLoadSampleSpec = () => {
    if (primaryFramework === 'SECURITY_GDPR') {
      setProjectName('Global Data Lake & GDPR Erasure Service');
      setProjectCode('GDPR-LAKE');
      setSpecText(`TARGET ARCHITECTURE:
- Data Ingestion: Apache Kafka event stream with field-level encryption for EU personal data.
- Storage: Amazon S3 / GCP Cloud Storage with customer-managed encryption keys (CMEK).
- GDPR Article 17 Erasure: Automated cascade deletion workers honoring user DSAR erasure requests within 72 hours.
- Audit Logging: Immutable tamper-proof access logs retained for 365 days without recording plaintext PII.`);
    } else if (primaryFramework === 'AI_GOVERNANCE') {
      setProjectName('Enterprise GenAI Document Copilot');
      setProjectCode('COPILOT-01');
      setSpecText(`TARGET ARCHITECTURE:
- Models: Gemini 1.5 Pro / Flash within isolated corporate VPC perimeter.
- Guardrails: Real-time PII anonymization proxy prior to model tokenization.
- Evaluation: Automated factual grounding checks and human review audit trail for critical queries.`);
    } else {
      setProjectName('Core Billing & ERP Migration');
      setProjectCode('ERP-MIGRATE');
      setSpecText(`TARGET ARCHITECTURE:
- Infrastructure: Dual-region Kubernetes cluster with blue/green deployment strategy.
- Resilience: 99.99% SLA with RTO < 15 minutes, RPO < 1 minute.
- Financial Controls: Automated ledger reconciliations and SOX IT general control audits.`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setError('Please provide your Organization / Company Name.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Save company profile
      updateCompanyProfile({
        companyName: companyName.trim(),
        industry,
        primaryFramework,
        dpoOrSroName: dpoOrSroName.trim() || 'Chief Risk Officer',
        dpoOrSroEmail: dpoOrSroEmail.trim() || 'governance@enterprise.internal',
        isConfigured: true
      });

      // 2. Optionally create the initial project
      if (createInitialProject && projectName.trim()) {
        const generatedId = `proj_${Date.now()}`;
        const generatedCode = projectCode.trim() || `PRJ-${Math.floor(100 + Math.random() * 900)}`;

        const gateLabels: Record<string, string> = {
          GATE_1: 'Phase 1: Inception & Feasibility',
          GATE_2: 'Phase 2: Architecture & DPIA Review',
          GATE_3: 'Phase 3: Pre-Production Validation',
          GATE_4: 'Phase 4: Production Go-Live Gate',
          GATE_5: 'Phase 5: Post-Launch Recertification'
        };

        const newProject: InfrastructureProject = {
          id: generatedId,
          code: generatedCode,
          name: projectName.trim(),
          sector: industry,
          department: `${companyName.trim()} Governance & Engineering`,
          framework: primaryFramework,
          frameworkLabel:
            primaryFramework === 'SECURITY_GDPR'
              ? 'Security & GDPR'
              : primaryFramework === 'AI_GOVERNANCE'
              ? 'AI & Data Launch'
              : 'Strategic PMO',
          sro: dpoOrSroName.trim() || 'Senior Risk Owner',
          sponsor: companyName.trim(),
          techLead: 'Engineering Lead',
          leadAuditor: dpoOrSroName.trim() || 'Enterprise Reviewer',
          location: 'Corporate Infrastructure',
          currentGate,
          gateLabel: gateLabels[currentGate] || 'Phase 2: Architecture Review',
          reviewStatus: 'Active Assurance',
          assuranceScore: 82,
          deliveryConfidence: 'AMBER_GREEN',
          budgetFormatted: projectBudget.trim() || '$1.5M',
          budgetBillion: 0.0015,
          totalRequirements: 6,
          compliantCount: 3,
          inProgressCount: 2,
          flaggedCount: 1,
          criticalRisksCount: 0,
          nextReviewDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
          description: specText.trim() || `${companyName} core system under GateKeeper Enterprise assurance.`,
          isCompanyProject: true,
          isSampleData: false,
          createdAt: new Date().toISOString()
        };

        // Write project to Firestore
        try {
          await setDoc(doc(db, 'projects', generatedId), newProject);
        } catch (err) {
          console.warn('Firestore project write fallback:', err);
        }

        // Write initial compliance items
        const initialRequirements: Partial<ComplianceRequirementItem>[] = [
          {
            id: `req_${generatedId}_01`,
            code: `${generatedCode}-SEC-01`,
            title: 'Target Architecture & Threat Model Verification',
            description: `Audit ${projectName} boundaries, authentication mechanisms, and network security policies.`,
            gate: currentGate,
            category: 'Architecture & Technical Excellence',
            priority: 'Critical',
            status: 'Compliant',
            evidenceThreshold: 'Signed architectural design dossier with network topology diagram.',
            auditorNotes: 'Architectural specifications ingested and preliminary boundary scan completed.',
            projectId: generatedId
          },
          {
            id: `req_${generatedId}_02`,
            code: `${generatedCode}-PRIV-02`,
            title: 'Data Protection & PII Privacy Audit (GDPR)',
            description: 'Catalog personal data fields, encryption at rest (AES-256), and lawful basis for processing.',
            gate: currentGate,
            category: 'Data Privacy & Regulatory (GDPR)',
            priority: 'High',
            status: 'Compliant',
            evidenceThreshold: 'Data Protection Impact Assessment (DPIA) and GDPR Article 30 Records of Processing.',
            auditorNotes: 'DPIA verified with encryption standards in place.',
            projectId: generatedId
          },
          {
            id: `req_${generatedId}_03`,
            code: `${generatedCode}-OP-03`,
            title: 'Business Continuity, Backup & Disaster Recovery',
            description: 'Verify automated backup schedules, recovery point objective (RPO), and failover testing.',
            gate: currentGate,
            category: 'Delivery Capability & Resourcing',
            priority: 'Medium',
            status: 'In Progress',
            evidenceThreshold: 'Annual disaster recovery simulation runbook and drill outcome report.',
            auditorNotes: 'Drill scheduled for upcoming sprint.',
            projectId: generatedId
          }
        ];

        for (const req of initialRequirements) {
          try {
            await setDoc(doc(db, 'compliance_items', req.id!), req);
          } catch (err) {
            console.warn('Firestore compliance_items write fallback:', err);
          }
        }

        if (onProjectCreated) {
          onProjectCreated(newProject);
        }
      }

      setIsSetupModalOpen(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to save company information.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto'
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '720px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            borderBottom: '1px solid #1e293b'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#1d70b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}
            >
              <BusinessIcon style={{ fontSize: '1.5rem' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                  GateKeeper Enterprise
                </h2>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    backgroundColor: '#3b82f6',
                    color: '#ffffff',
                    letterSpacing: '0.04em'
                  }}
                >
                  ORGANIZATION SETUP
                </span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                Configure your company governance profile and initial project before starting stage-gate audits.
              </p>
            </div>
          </div>
          {companyProfile.isConfigured && (
            <button
              type="button"
              onClick={() => setIsSetupModalOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                borderRadius: '6px'
              }}
            >
              <CloseIcon />
            </button>
          )}
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '24px', flex: 1 }}>
          {error && (
            <div
              style={{
                marginBottom: '16px',
                padding: '12px 16px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#b91c1c',
                fontSize: '0.85rem'
              }}
            >
              {error}
            </div>
          )}

          {/* Section 1: Company Profile */}
          <div style={{ marginBottom: '24px' }}>
            <h3
              style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: '#0f172a',
                margin: '0 0 12px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>1. Organization & Governance Profile</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Company / Organization Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Technologies Inc."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Industry / Domain
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <option value="Enterprise Software & Cloud Platforms">Enterprise Software & Cloud Platforms</option>
                  <option value="Financial Services & FinTech">Financial Services & FinTech</option>
                  <option value="Healthcare & Life Sciences">Healthcare & Life Sciences</option>
                  <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                  <option value="Public Sector & Critical Infrastructure">Public Sector & Critical Infrastructure</option>
                  <option value="Telecom & Communications">Telecom & Communications</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Senior Risk Owner (SRO) / DPO
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jane Doe, Head of Compliance"
                  value={dpoOrSroName}
                  onChange={(e) => setDpoOrSroName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Governance Contact Email
                </label>
                <input
                  type="email"
                  placeholder="governance@company.com"
                  value={dpoOrSroEmail}
                  onChange={(e) => setDpoOrSroEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
            </div>

            {/* Framework Selector */}
            <div style={{ marginTop: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                Primary Regulatory & Compliance Focus
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                <div
                  onClick={() => setPrimaryFramework('SECURITY_GDPR')}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid ' + (primaryFramework === 'SECURITY_GDPR' ? '#1d70b8' : '#e2e8f0'),
                    backgroundColor: primaryFramework === 'SECURITY_GDPR' ? '#eff6ff' : '#f8fafc',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px'
                  }}
                >
                  <SecurityIcon style={{ color: '#1d70b8', marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>GDPR & Data Privacy</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Articles 5, 6, 17, 32, DPIA, Encryption</div>
                  </div>
                </div>

                <div
                  onClick={() => setPrimaryFramework('AI_GOVERNANCE')}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid ' + (primaryFramework === 'AI_GOVERNANCE' ? '#9333ea' : '#e2e8f0'),
                    backgroundColor: primaryFramework === 'AI_GOVERNANCE' ? '#faf5ff' : '#f8fafc',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px'
                  }}
                >
                  <AiIcon style={{ color: '#9333ea', marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>AI & Algorithmic Launch</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>EU AI Act, Guardrails, Model Safety</div>
                  </div>
                </div>

                <div
                  onClick={() => setPrimaryFramework('ENTERPRISE_PMO')}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid ' + (primaryFramework === 'ENTERPRISE_PMO' ? '#0d9488' : '#e2e8f0'),
                    backgroundColor: primaryFramework === 'ENTERPRISE_PMO' ? '#f0fdfa' : '#f8fafc',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px'
                  }}
                >
                  <PmoIcon style={{ color: '#0d9488', marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>Enterprise PMO & Gates</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Business Cases, Procurement & Delivery</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '20px 0' }} />

          {/* Section 2: Initial Project */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h3
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>2. First Company Project to Audit</span>
              </h3>

              <button
                type="button"
                onClick={handleLoadSampleSpec}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#f1f5f9',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <SparklesIcon style={{ fontSize: '0.85rem', color: '#3b82f6' }} />
                <span>Load Suggested Template</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Project Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Customer Data Lake Migration"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Project Code / Identifier
                </label>
                <input
                  type="text"
                  placeholder="e.g. CDL-01"
                  value={projectCode}
                  onChange={(e) => setProjectCode(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Current Review Gate
                </label>
                <select
                  value={currentGate}
                  onChange={(e) => setCurrentGate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <option value="GATE_1">Gate 1: Inception & Strategic Justification</option>
                  <option value="GATE_2">Gate 2: Architecture & DPIA Review (Recommended)</option>
                  <option value="GATE_3">Gate 3: Pre-Production & Pen Testing</option>
                  <option value="GATE_4">Gate 4: Production Go-Live</option>
                  <option value="GATE_5">Gate 5: Operational Recertification</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Allocated Capital / Cloud Budget
                </label>
                <input
                  type="text"
                  placeholder="e.g. $1.5M"
                  value={projectBudget}
                  onChange={(e) => setProjectBudget(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Architecture & Privacy Ingestion Notes
              </label>
              <textarea
                rows={4}
                value={specText}
                onChange={(e) => setSpecText(e.target.value)}
                placeholder="Paste key architecture notes, encryption controls, PII inventory, and data retention rules..."
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.82rem',
                  fontFamily: 'monospace',
                  lineHeight: '1.4'
                }}
              />
            </div>
          </div>

          {/* Quick Start with Sample Data Alternative */}
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px dashed #cbd5e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <InfoIcon style={{ fontSize: '1.1rem', color: '#64748b' }} />
              <span style={{ fontSize: '0.8rem', color: '#475569' }}>
                Want to evaluate the platform immediately with realistic corporate datasets?
              </span>
            </div>
            <button
              type="button"
              onClick={loadDemoCompany}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: '1px solid #94a3b8',
                backgroundColor: '#ffffff',
                color: '#334155',
                fontSize: '0.78125rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Load Enterprise Demo Mode
            </button>
          </div>

          {/* Submit Actions */}
          <div
            style={{
              marginTop: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px'
            }}
          >
            {companyProfile.isConfigured && (
              <button
                type="button"
                onClick={() => setIsSetupModalOpen(false)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#1d70b8',
                color: '#ffffff',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 4px rgba(29, 112, 184, 0.3)',
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              <CheckCircleIcon style={{ fontSize: '1.1rem' }} />
              <span>{isSubmitting ? 'Saving & Initializing...' : 'Save Company & Launch Initial Project'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyOnboardingSetupModal;
