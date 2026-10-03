import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI, Type } from '@google/genai';
import { saveFirestoreEvaluation } from '@/lib/firebase';

let aiInstance: GoogleGenAI | null = null;

// Resolve API keys sequentially: process.env.GEMINI_API_KEY, process.env.GOOGLE_GENAI_API_KEY, process.env.API_KEY
function getApiKey(): string | undefined {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENAI_API_KEY ||
    process.env.API_KEY
  );
}

function getAIClient(): GoogleGenAI | null {
  const apiKey = getApiKey();
  if (!apiKey) {
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    return;
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        res.status(400).json({ error: 'Invalid JSON body provided' });
        return;
      }
    }

    const {
      companyNumber,
      projectName,
      reviewType,
      framework = 'SECURITY_GDPR',
      specText,
      deepAnalysis
    } = body || {};

    const targetInput = String(specText || companyNumber || '').trim();
    if (!targetInput) {
      res.status(400).json({ error: 'Project specification text, architecture overview, or Entity identifier is required for compliance evaluation.' });
      return;
    }

    const targetModel = 'gemini-3.8-flash';
    const targetEntity = targetInput;
    const targetProject = projectName ? String(projectName).trim() : 'Enterprise System Architecture';
    const targetGate = reviewType ? String(reviewType).trim() : 'GATE_2';
    const targetFramework = String(framework).trim().toUpperCase();

    const apiKey = getApiKey();
    if (!apiKey) {
      res.status(500).json({
        error: 'Gemini API credential not detected. Please configure GEMINI_API_KEY in environment secrets to execute live compliance evaluations.'
      });
      return;
    }

    const ai = getAIClient();
    if (!ai) {
      res.status(500).json({
        error: 'Failed to initialize Google Gen AI SDK with provided credentials.'
      });
      return;
    }

    // System instructions enforce GuardianAI compliance rules and regulatory standards strictly
    let frameworkRules = '';
    if (targetFramework === 'AI_GOVERNANCE') {
      frameworkRules = `Evaluate against EU AI Act conformity, prompt injection defense, PII sanitization in RAG embeddings, model hallucination boundaries, and transparent user notification.`;
    } else if (targetFramework === 'ENTERPRISE_PMO') {
      frameworkRules = `Evaluate against Enterprise PMO delivery standards, capital expenditure burn rate, critical path milestone health, change management, and disaster recovery multi-region RTO/RPO SLAs.`;
    } else {
      frameworkRules = `Evaluate against GDPR regulatory framework (Article 5 Principles, Article 6 Lawfulness, Article 17 Right to Erasure, Article 25 Privacy by Design, Article 32 Security of Processing), SOC 2 Type II controls, and ISO 27001 encryption standards. Flag missing encryption at rest/in transit, unmasked logging, missing retention limits, or improper cross-border transfers.`;
    }

    const systemInstruction = `You are "GuardianAI," an autonomous Enterprise Project Compliance & Audit Agent.
Your mission is to systematically evaluate project documentation, software architectures, database schemas, and data pipelines against regulatory frameworks to flag privacy & security risks and generate actionable remediation tasks.
Focus framework: ${targetFramework}.
${frameworkRules}

Operational Constraints:
1. Formulate analytical evaluations, risk profiles, and compliance cross-mappings in comprehensive third-person paragraphs.
2. Rely on verified legal principles cited from GDPR Articles, EU AI Act clauses, or industry standards (SOC 2, ISO 27001).
3. Always assume non-compliance if retention limits, encryption standards, or consent mechanisms are not explicitly documented.
4. Output exclusively a valid JSON object matching the requested schema.`;

    const contents = `Perform rigorous enterprise compliance and assurance evaluation for project/entity: "${targetEntity}", mapped to project: "${targetProject}" under review level: "${targetGate}" and governance framework: "${targetFramework}". Provide detailed findings, identified PII elements, cited legal/control articles, and concrete remediation tasks.`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        entityName: { type: Type.STRING },
        registrationNumber: { type: Type.STRING },
        jurisdiction: { type: Type.STRING },
        framework: { type: Type.STRING },
        complianceScore: { type: Type.INTEGER },
        riskLevel: { type: Type.STRING },
        legalStandingStatus: { type: Type.STRING },
        riskProfileSummary: { type: Type.STRING },
        analyticalEvaluation: { type: Type.STRING },
        identifiedPiiElements: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        citedRegulations: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        crossMappingFindings: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              status: { type: Type.STRING },
              question: { type: Type.STRING },
              analyticalJustification: { type: Type.STRING },
              remediationAction: { type: Type.STRING }
            },
            required: ['category', 'status', 'question', 'analyticalJustification']
          }
        },
        remediationTasks: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              priority: { type: Type.STRING },
              owner: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ['id', 'title', 'priority', 'description']
          }
        }
      },
      required: [
        'entityName',
        'registrationNumber',
        'jurisdiction',
        'framework',
        'complianceScore',
        'riskLevel',
        'legalStandingStatus',
        'riskProfileSummary',
        'analyticalEvaluation',
        'crossMappingFindings',
        'remediationTasks'
      ]
    };

    const config: any = {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema
    };

    // If deepAnalysis is enabled, configure thinking level without legacy parameters
    if (deepAnalysis) {
      config.thinkingConfig = {
        thinkingLevel: 'HIGH'
      };
    }

    const response = await ai.models.generateContent({
      model: targetModel,
      contents,
      config
    });

    const responseText = response.text?.trim();
    if (!responseText) {
      res.status(502).json({ error: 'Gemini 3.8 Flash returned an empty response. Please retry.' });
      return;
    }

    let parsedResult: any;
    try {
      parsedResult = JSON.parse(responseText);
    } catch (parseErr) {
      console.error('[Gemini API] Failed to parse model output as JSON:', responseText, parseErr);
      res.status(502).json({
        error: 'Evaluation response from Gemini model could not be parsed as valid JSON.',
        raw: responseText
      });
      return;
    }

    // Persist evaluation to Cloud Firestore
    try {
      await saveFirestoreEvaluation({
        companyNumber: targetEntity,
        projectName: targetProject,
        reviewType: targetGate,
        model: targetModel,
        evaluation: parsedResult
      });
    } catch (firestoreErr) {
      console.warn('[Firestore] Note: Could not persist evaluation record to Firestore:', firestoreErr);
    }

    res.status(200).json(parsedResult);
  } catch (error: any) {
    console.error('[API /api/evaluate] Error:', error);
    let errorMessage = error?.message || 'An unexpected error occurred during compliance evaluation.';
    try {
      const parsedErr = JSON.parse(errorMessage);
      if (parsedErr?.error?.message) {
        errorMessage = parsedErr.error.message;
      }
    } catch {
      // not JSON, retain original error message string
    }
    res.status(500).json({ error: errorMessage });
  }
}
