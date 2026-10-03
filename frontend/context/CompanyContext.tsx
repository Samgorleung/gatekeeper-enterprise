import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GovernanceFramework } from '@/lib/seedData';

export interface CompanyProfile {
  companyName: string;
  industry: string;
  primaryFramework: GovernanceFramework;
  dpoOrSroName: string;
  dpoOrSroEmail: string;
  isConfigured: boolean;
  configuredAt?: string;
}

export const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
  companyName: '',
  industry: 'Enterprise Software & Cloud Platforms',
  primaryFramework: 'SECURITY_GDPR',
  dpoOrSroName: '',
  dpoOrSroEmail: '',
  isConfigured: false
};

export const DEMO_COMPANY_PROFILE: CompanyProfile = {
  companyName: 'Acme Cloud Technologies',
  industry: 'FinTech & Cloud Infrastructure',
  primaryFramework: 'SECURITY_GDPR',
  dpoOrSroName: 'Dr. Sarah Vance, CISSP / CIPP/E',
  dpoOrSroEmail: 'governance@acme-cloud.internal',
  isConfigured: true,
  configuredAt: new Date().toISOString()
};

interface CompanyContextType {
  companyProfile: CompanyProfile;
  updateCompanyProfile: (profile: Partial<CompanyProfile>) => void;
  isSetupModalOpen: boolean;
  setIsSetupModalOpen: (open: boolean) => void;
  loadDemoCompany: () => void;
  resetCompanyProfile: () => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

const STORAGE_KEY = 'gatekeeper_company_profile';

export const CompanyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(DEFAULT_COMPANY_PROFILE);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          setCompanyProfile(parsed);
          setIsLoaded(true);
          return;
        }
      }
      // If no company data is configured yet, open the setup wizard on first visit
      setIsSetupModalOpen(true);
    } catch (e) {
      console.warn('Failed to load company profile from storage', e);
      setIsSetupModalOpen(true);
    }
    setIsLoaded(true);
  }, []);

  const updateCompanyProfile = (updates: Partial<CompanyProfile>) => {
    setCompanyProfile((prev) => {
      const updated: CompanyProfile = {
        ...prev,
        ...updates,
        isConfigured: true,
        configuredAt: prev.configuredAt || new Date().toISOString()
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to persist company profile', e);
      }
      return updated;
    });
  };

  const loadDemoCompany = () => {
    setCompanyProfile(DEMO_COMPANY_PROFILE);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_COMPANY_PROFILE));
    } catch (e) {
      console.warn('Failed to persist demo company profile', e);
    }
    setIsSetupModalOpen(false);
  };

  const resetCompanyProfile = () => {
    setCompanyProfile(DEFAULT_COMPANY_PROFILE);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setIsSetupModalOpen(true);
  };

  return (
    <CompanyContext.Provider
      value={{
        companyProfile,
        updateCompanyProfile,
        isSetupModalOpen,
        setIsSetupModalOpen,
        loadDemoCompany,
        resetCompanyProfile
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = (): CompanyContextType => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};

export default CompanyContext;
