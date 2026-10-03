import React, { useState } from 'react';
import {
  Close as CloseIcon,
  Security as SecurityIcon,
  Psychology as AiIcon,
  Assessment as PmoIcon,
  CheckCircle as CheckCircleIcon,
  AutoAwesome as SparklesIcon
} from '@mui/icons-material';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { InfrastructureProject, GovernanceFramework, ComplianceRequirementItem } from '@/lib/seedData';

interface IngestCompanyProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (newProject: InfrastructureProject) => void;
}

export const IngestCompanyProjectModal: React.FC<IngestCompanyProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [department, setDepartment] = useState('Core Platform Engineering');
  const [framework, setFramework] = useState<GovernanceFramework>('SECURITY_GDPR');
  const [currentGate, setCurrentGate] = useState('GATE_2');
  const [leadAuditor, setLeadAuditor] = useState('Enterprise Reviewer');
  const [budgetFormatted, setBudgetFormatted] = useState('$1.5M');
  const [nextReviewDate, setNextReviewDate] = useState('2026-11-30');
  const [specText, setSpecText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Quick preset template for convenience
  const handleLoadSampleSpec = () => {
    if (framework === 'SECURITY_GDPR') {
      setName('Customer Privacy & Identity Microservice (OAuth 2.1)');
      setCode('CPIM-01');
      setDepartment('Security & Privacy Platform');
      setCurrentGate('GATE_2');
      setSpecText(`TARGET ARCHITECTURE:
- Auth: Centralized OAuth 2.1 / OIDC token issuer with PKCE.
- Data Vault: Customer PII (Email, Phone, Payment Tokens) stored in AES-256 encrypted database with envelope encryption.
- GDPR Compliance: Automated Article 17 (Right to Erasure) shredding webhooks triggered upon user consent withdrawal.
- Data Retention: 90-day cold storage purge policy enforced via TTL index.`);
    } else if (framework === 'AI_GOVERNANCE') {
      setName('Enterprise Customer Copilot & RAG Pipeline');
      setCode('COPILOT-AI');
      setDepartment('Applied AI & Engineering');
      setCurrentGate('GATE_2');
      setSpecText(`TARGET ARCHITECTURE:
- Model Endpoint: Gemini 1.5 Pro / Flash deployed within private VPC boundary.
- Vector DB: Pinecone / pgvector with role-based document access filtering.
- Moderation & Guardrails: Automated output toxicity inspection and PII redactor.
- Telemetry: Latency budget < 800ms, token burn rate monitoring, and human review fallback.`);
    } else {
      setName('Enterprise ERP Cloud Modernization');
      setCode('ERP-CLOUD');
      setDepartment('Corporate Operations & PMO');
      setCurrentGate('GATE_1');
      setSpecText(`TARGET ARCHITECTURE:
- Migration: Legacy on-prem SAP ERP cutover to Cloud SaaS.
- Integrations: 24 upstream business systems via Kafka event bus.
- Dual-Run Cutover: 4-week parallel run with automated reconciliations.`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const generatedId = `proj_${Date.now()}`;
    const generatedCode = code.trim() || `PRJ-${Math.floor(100 + Math.random() * 900)}`;

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
      name: name.trim(),
      sector: department,
      department: department.trim(),
      framework,
      frameworkLabel:
        framework === 'SECURITY_GDPR'
          ? 'Security & GDPR'
          : framework === 'AI_GOVERNANCE'
          ? 'AI & Data Launch'
          : 'Strategic PMO',
      sro: leadAuditor,
      sponsor: leadAuditor,
      techLead: 'Internal Engineering Lead',
      leadAuditor: leadAuditor.trim() || 'Lead Reviewer',
      location: 'Enterprise Cloud Infrastructure',
      currentGate,
      gateLabel: gateLabels[currentGate] || 'Phase 2: Architecture Review',
      reviewStatus: 'Active Assurance',
      assuranceScore: 78,
      deliveryConfidence: 'GREEN',
      budgetFormatted: budgetFormatted.trim() || '$1.0M',
      budgetBillion: 0.001,
      totalRequirements: 8,
      compliantCount: 4,
      inProgressCount: 3,
      flaggedCount: 1,
      criticalRisksCount: 0,
      nextReviewDate: nextReviewDate || '2026-12-01',
      description: specText.trim() || 'Ingested internal enterprise project under GateKeeper stage-gate governance.',
      isCompanyProject: true,
      isSampleData: false,
      createdAt: new Date().toISOString()
    };

    try {
      // 1. Persist new project to Firestore
      try {
        await setDoc(doc(db, 'projects', generatedId), newProject);
      } catch (err) {
        console.warn('Firestore project write fallback:', err);
      }

      // 2. Synthesize initial compliance checklist requirements for this project
      const initialRequirements: Partial<ComplianceRequirementItem>[] = [
        {
          id: `req_${generatedId}_01`,
          code: `${generatedCode}-SEC-01`,
          title: 'Target Architecture & Threat Model Verification',
          description: `Formally audit ${name} system boundaries, ingress authentication, and least-privilege network policies.`,
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
          title: 'Data Protection Impact Assessment (DPIA) & PII Inventory',
          description: 'Catalog all Personally Identifiable Information, encryption at rest (AES-256), and lawful basis for processing.',
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

      onProjectCreated(newProject);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to ingest project');
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
        backdropFilter: 'blur(4px)',
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
          borderRadius: '12px',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
          border: '1px solid #cbd5e1',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #1e293b'
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
              Ingest Company Initiative for Stage-Gate Assurance
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.8125rem', color: '#94a3b8' }}>
              Add internal software systems, data platforms, or AI services to your GateKeeper workspace.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              borderRadius: '4px'
            }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '24px', flex: 1 }}>
          {error && (
            <div
              style={{
                marginBottom: '16px',
                padding: '10px 14px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                color: '#b91c1c',
                fontSize: '0.85rem'
              }}
            >
              {error}
            </div>
          )}

          {/* Quick preset banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              backgroundColor: '#eff6ff',
              borderRadius: '8px',
              border: '1px solid #bfdbfe',
              marginBottom: '18px'
            }}
          >
            <span style={{ fontSize: '0.8rem', color: '#1e40af', fontWeight: 600 }}>
              Need a quick starting point?
            </span>
            <button
              type="button"
              onClick={handleLoadSampleSpec}
              style={{
                padding: '4px 10px',
                backgroundColor: '#ffffff',
                border: '1px solid #93c5fd',
                borderRadius: '6px',
                color: '#1d4ed8',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <SparklesIcon style={{ fontSize: '0.85rem' }} />
              <span>Fill Example Template</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Project / System Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Payments Gateway v2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Project Code / ID
              </label>
              <input
                type="text"
                placeholder="e.g. PAY-02"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Department / Team
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Governance Framework
              </label>
              <select
                value={framework}
                onChange={(e) => setFramework(e.target.value as GovernanceFramework)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                  backgroundColor: '#ffffff'
                }}
              >
                <option value="SECURITY_GDPR">Security & GDPR Privacy Review</option>
                <option value="AI_GOVERNANCE">AI & Algorithmic Product Launch</option>
                <option value="ENTERPRISE_PMO">Enterprise PMO & Stage-Gate Delivery</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Current Stage-Gate Phase
              </label>
              <select
                value={currentGate}
                onChange={(e) => setCurrentGate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                  backgroundColor: '#ffffff'
                }}
              >
                <option value="GATE_1">Phase 1: Inception & Strategic Case</option>
                <option value="GATE_2">Phase 2: Solution Architecture & DPIA Review</option>
                <option value="GATE_3">Phase 3: Pre-Production & Pen Testing</option>
                <option value="GATE_4">Phase 4: Production Go-Live Readiness</option>
                <option value="GATE_5">Phase 5: Post-Launch Recertification</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Allocated Capital Budget
              </label>
              <input
                type="text"
                value={budgetFormatted}
                onChange={(e) => setBudgetFormatted(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Architecture / Data Privacy Specification
            </label>
            <textarea
              rows={4}
              value={specText}
              onChange={(e) => setSpecText(e.target.value)}
              placeholder="Paste architecture summary, database schemas, encryption algorithms, or retention policies..."
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.8125rem',
                fontFamily: 'monospace'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '8px 20px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#1d70b8',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              <CheckCircleIcon style={{ fontSize: '1rem' }} />
              <span>{isSubmitting ? 'Ingesting...' : 'Ingest Project'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IngestCompanyProjectModal;
