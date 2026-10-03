"use client";

import React, { useState } from 'react';
import {
  Business as BusinessIcon,
  ShieldOutlined as ShieldIcon
} from '@mui/icons-material';
import { AiEvaluationSkeleton } from './LoadingSystem';

export interface ComplianceOfficerWidgetProps {
  projectName?: string;
  reviewType?: string;
  className?: string;
  defaultFramework?: 'SECURITY_GDPR' | 'AI_GOVERNANCE' | 'ENTERPRISE_PMO';
}

const TEMPLATES = {
  SECURITY_GDPR: {
    title: 'CIAM v2 Auth Microservice (GDPR Focus)',
    text: `Customer Identity Microservice with PostgreSQL, Kafka event streaming, and AWS S3 Glacier cold backups. Collects email addresses, IP addresses, hashed passwords, and phone numbers. Supports automated 24-hr deletion webhook for GDPR Article 17, but cold database backups retain user records for 30 days without cryptographic key shredding. Encryption AES-GCM-256 enabled at rest with AWS KMS. Lacks automated partition expiration for inactive session logs older than 180 days.`
  },
  AI_GOVERNANCE: {
    title: 'Enterprise Knowledge Copilot RAG (AI Safety Focus)',
    text: `Internal enterprise conversational agent retrieving Confluence and Jira engineering archives using Pinecone vector embeddings. Uses Llama-Guard for prompt injection defense. A regex sanitization pipeline strips customer credit card tokens and SSNs prior to embedding. Model outputs citation links with grounded confidence scores. Complies with EU AI Act Article 52 transparent AI disclosures.`
  },
  ENTERPRISE_PMO: {
    title: 'NextGen Cloud Billing & SAP S/4HANA (PMO Focus)',
    text: `Global financial ledger consolidation replacing legacy billing infrastructure with automated revenue recognition under ASC 606. Multi-region disaster recovery architecture targeting RTO < 15 mins and RPO < 1 min with automated DNS failover. Pilot phase completed with 99.4% user acceptance testing pass rate across 5 business units. Dual-ledger parallel run scheduled for 60 days before final cutover.`
  }
};

export const ComplianceOfficerWidget: React.FC<ComplianceOfficerWidgetProps> = ({
  projectName = 'Enterprise System Architecture',
  reviewType = 'GATE_2',
  className = '',
  defaultFramework = 'SECURITY_GDPR'
}) => {
  const [framework, setFramework] = useState<'SECURITY_GDPR' | 'AI_GOVERNANCE' | 'ENTERPRISE_PMO'>(defaultFramework);
  const [specText, setSpecText] = useState<string>(TEMPLATES[defaultFramework].text);
  const [deepAnalysis, setDeepAnalysis] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelectTemplate = (fw: 'SECURITY_GDPR' | 'AI_GOVERNANCE' | 'ENTERPRISE_PMO') => {
    setFramework(fw);
    setSpecText(TEMPLATES[fw].text);
  };

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specText,
          framework,
          projectName,
          reviewType,
          deepAnalysis
        })
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const errMsg = data?.error || data?.message || `Compliance evaluation failed (HTTP ${res.status})`;
        throw new Error(errMsg);
      }
      if (data?.error) {
        throw new Error(data.error);
      }
      setEvaluationResult(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred during verification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`compliance-officer-widget ${className}`}
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderBottom: '1px solid #f1f5f9',
        paddingBottom: '16px',
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          backgroundColor: '#eff6ff',
          color: '#1d70b8'
        }}>
          <ShieldIcon style={{ fontSize: '1.4rem' }} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.01em' }}>
            Autonomous Project Compliance & Governance Evaluator
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '3px 0 0 0' }}>
            Powered by Gemini 3.8 Flash to evaluate project documentation, software architectures, database schemas, and AI pipelines against enterprise regulatory frameworks.
          </p>
        </div>
      </div>

      {/* Framework Preset Tabs */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.04em' }}>
          Select Evaluation Framework Mode:
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'SECURITY_GDPR' as const, label: '🛡️ Security & GDPR Architecture' },
            { id: 'AI_GOVERNANCE' as const, label: '🤖 AI & Data Launch Assurance' },
            { id: 'ENTERPRISE_PMO' as const, label: '📊 Enterprise PMO & Cutover' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleSelectTemplate(tab.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.8125rem',
                fontWeight: framework === tab.id ? 700 : 500,
                backgroundColor: framework === tab.id ? '#1e293b' : '#f1f5f9',
                color: framework === tab.id ? '#ffffff' : '#334155',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleEvaluate} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
            Project Specification, Architecture Overview, or Data Schema:
          </label>
          <textarea
            value={specText}
            onChange={(e) => setSpecText(e.target.value)}
            rows={4}
            required
            placeholder="Paste system architecture, API specification, database schema, or PRD text..."
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '0.85rem',
              lineHeight: 1.5,
              backgroundColor: '#ffffff',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#475569' }}>
              Reasoning Depth:
            </label>
            <select
              value={deepAnalysis ? 'deep' : 'flash'}
              onChange={(e) => setDeepAnalysis(e.target.value === 'deep')}
              style={{
                padding: '6px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                fontSize: '0.8125rem',
                backgroundColor: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <option value="flash">Standard Analysis (Fast)</option>
              <option value="deep">Deep Regulatory Reasoning (High Thinking)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 24px',
              backgroundColor: '#1d70b8',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.875rem',
              borderRadius: '6px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'background-color 0.15s ease',
              boxShadow: '0 1px 2px rgba(0,0,0,0.06)'
            }}
          >
            <ShieldIcon style={{ fontSize: '1.1rem' }} />
            {loading ? 'Evaluating Compliance...' : 'Run Autonomous Compliance Audit'}
          </button>
        </div>
      </form>

      {error && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#991b1b',
          borderRadius: '6px',
          marginBottom: '16px',
          fontSize: '0.875rem'
        }}>
          <strong>Verification Notice:</strong> {error}
        </div>
      )}

      {loading && (
        <div style={{ marginTop: '20px' }}>
          <AiEvaluationSkeleton
            prompt={`GuardianAI evaluating project specification against ${framework} regulatory standards and controls...`}
          />
        </div>
      )}

      {evaluationResult && (
        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
          {/* Header Result Strip */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Autonomous Compliance Audit Findings
              </h3>
              {evaluationResult.complianceScore !== undefined && (
                <span style={{
                  fontSize: '0.8125rem',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: '999px',
                  backgroundColor: evaluationResult.complianceScore >= 80 ? '#ecfdf5' : evaluationResult.complianceScore >= 60 ? '#fffbeb' : '#fef2f2',
                  color: evaluationResult.complianceScore >= 80 ? '#047857' : evaluationResult.complianceScore >= 60 ? '#b45309' : '#dc2626',
                  border: `1px solid ${evaluationResult.complianceScore >= 80 ? '#a7f3d0' : evaluationResult.complianceScore >= 60 ? '#fde68a' : '#fecaca'}`
                }}>
                  Score: {evaluationResult.complianceScore}%
                </span>
              )}
              {evaluationResult.riskLevel && (
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: evaluationResult.riskLevel === 'Low' ? '#ecfdf5' : evaluationResult.riskLevel === 'Medium' ? '#fffbeb' : '#fef2f2',
                  color: evaluationResult.riskLevel === 'Low' ? '#047857' : evaluationResult.riskLevel === 'Medium' ? '#b45309' : '#dc2626'
                }}>
                  Risk Level: {evaluationResult.riskLevel}
                </span>
              )}
            </div>

            <span style={{
              fontSize: '0.75rem',
              padding: '3px 10px',
              borderRadius: '9999px',
              backgroundColor: '#eff6ff',
              color: '#1d70b8',
              fontWeight: 600,
              border: '1px solid #bfdbfe'
            }}>
              GuardianAI · Gemini 3.8 Flash
            </span>
          </div>

          {/* Identified PII and Cited Regulations */}
          {(evaluationResult.identifiedPiiElements?.length > 0 || evaluationResult.citedRegulations?.length > 0) && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginBottom: '18px' }}>
              {evaluationResult.identifiedPiiElements?.length > 0 && (
                <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                    Identified PII Elements
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {evaluationResult.identifiedPiiElements.map((pii: string, i: number) => (
                      <span key={i} style={{ fontSize: '0.72rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#e2e8f0', color: '#1e293b', fontWeight: 600 }}>
                        {pii}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {evaluationResult.citedRegulations?.length > 0 && (
                <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                    Verified Regulatory Articles & Controls
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {evaluationResult.citedRegulations.map((reg: string, i: number) => (
                      <span key={i} style={{ fontSize: '0.72rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#dbeafe', color: '#1e40af', fontWeight: 600 }}>
                        {reg}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
              Risk Profile Evaluation
            </div>
            <p style={{ fontSize: '0.875rem', color: '#1e293b', margin: 0, lineHeight: 1.6 }}>
              {evaluationResult.riskProfileSummary}
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
              Analytical Assessment
            </div>
            <p style={{ fontSize: '0.875rem', color: '#1e293b', margin: 0, lineHeight: 1.6 }}>
              {evaluationResult.analyticalEvaluation}
            </p>
          </div>

          {/* Actionable Remediation Tasks */}
          {evaluationResult.remediationTasks?.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '10px' }}>
                Actionable Remediation Tasks Generated
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {evaluationResult.remediationTasks.map((task: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '12px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: task.priority === 'Critical' ? '#fee2e2' : task.priority === 'High' ? '#fef3c7' : '#ecfdf5',
                          color: task.priority === 'Critical' ? '#991b1b' : task.priority === 'High' ? '#92400e' : '#166534'
                        }}>
                          {task.priority || 'Medium'}
                        </span>
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                          {task.title}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.8125rem', color: '#475569', lineHeight: 1.4 }}>
                        {task.description}
                      </p>
                    </div>
                    {task.owner && (
                      <span style={{ fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap', fontWeight: 600 }}>
                        Assignee: {task.owner}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {evaluationResult.crossMappingFindings && (
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '10px' }}>
                Regulatory Cross-Mapping Findings
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {evaluationResult.crossMappingFindings.map((finding: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      backgroundColor:
                        finding.status === 'Positive' ? '#f0fdf4' : finding.status === 'Negative' ? '#fef2f2' : '#fffbeb'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                        Category: {finding.category}
                      </span>
                      <span style={{
                        fontSize: '0.725rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor:
                          finding.status === 'Positive' ? '#dcfce7' : finding.status === 'Negative' ? '#fee2e2' : '#fef3c7',
                        color:
                          finding.status === 'Positive' ? '#166534' : finding.status === 'Negative' ? '#991b1b' : '#92400e'
                      }}>
                        {finding.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>
                      {finding.question}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#334155', lineHeight: 1.5 }}>
                      {finding.analyticalJustification}
                    </div>
                    {finding.remediationAction && (
                      <div style={{ marginTop: '6px', fontSize: '0.78125rem', color: '#0369a1', fontWeight: 500 }}>
                        <strong>Remediation:</strong> {finding.remediationAction}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ComplianceOfficerWidget;
