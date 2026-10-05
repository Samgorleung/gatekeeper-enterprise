"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/router';
import {
  activeInfrastructureProjects,
  InfrastructureProject
} from '@/lib/seedData';
import { db, saveUserSession } from '@/lib/firebase';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';

export interface ProjectSessionContextType {
  activeProjectId: string;
  activeProject: InfrastructureProject | null;
  availableProjects: InfrastructureProject[];
  recentProjects: InfrastructureProject[];
  previousProject: InfrastructureProject | null;
  isLiveSynced: boolean;
  switchProject: (projectId: string, navigateToConsole?: boolean) => void;
  reloadPreviousProject: () => void;
  saveNewProject: (project: InfrastructureProject) => Promise<void>;
  isIngestModalOpen: boolean;
  setIsIngestModalOpen: (open: boolean) => void;
}

const ProjectSessionContext = createContext<ProjectSessionContextType | undefined>(undefined);

const LOCAL_STORAGE_ACTIVE_KEY = 'gatekeeper_active_project_id';
const LOCAL_STORAGE_RECENT_KEY = 'gatekeeper_recent_projects';
const DEFAULT_USER_ID = 'samgorleung1224@gmail.com';
const FALLBACK_PROJECT_ID = 'proj_001';

export const ProjectSessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const router = useRouter();

  // State: projects collection
  const [availableProjects, setAvailableProjects] = useState<InfrastructureProject[]>(
    activeInfrastructureProjects.map(p => ({ ...p, isSampleData: true }))
  );

  // State: active project ID and recent history
  const [activeProjectId, setActiveProjectId] = useState<string>(FALLBACK_PROJECT_ID);
  const [recentProjectIds, setRecentProjectIds] = useState<string[]>([]);
  const [isLiveSynced, setIsLiveSynced] = useState<boolean>(false);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState<boolean>(false);
  const [hasHydrated, setHasHydrated] = useState<boolean>(false);

  // 1. Initial Client-side Hydration from localStorage and URL
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      // Check router query first
      const urlProjectId = typeof router.query.projectId === 'string'
        ? router.query.projectId
        : typeof router.query.id === 'string'
        ? router.query.id
        : null;

      const storedActiveId = localStorage.getItem(LOCAL_STORAGE_ACTIVE_KEY);
      const storedRecent = localStorage.getItem(LOCAL_STORAGE_RECENT_KEY);

      if (urlProjectId) {
        setActiveProjectId(urlProjectId);
      } else if (storedActiveId) {
        setActiveProjectId(storedActiveId);
      }

      if (storedRecent) {
        try {
          const parsed = JSON.parse(storedRecent);
          if (Array.isArray(parsed)) {
            setRecentProjectIds(parsed);
          }
        } catch {}
      }
    } catch (e) {
      console.warn('[ProjectSession] Local storage hydration warning:', e);
    } finally {
      setHasHydrated(true);
    }
  }, []);

  // 2. Real-time Cloud Firestore subscription for all projects
  useEffect(() => {
    let unsub: (() => void) | null = null;
    try {
      const colRef = collection(db, 'projects');
      unsub = onSnapshot(colRef, (snapshot) => {
        const loaded: InfrastructureProject[] = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data() as any;
          loaded.push({
            id: docSnap.id,
            ...data,
            isCompanyProject: data.isCompanyProject !== false
          });
        });

        // Merge custom projects with seed baseline
        const loadedIds = new Set(loaded.map(p => p.id));
        const remainingSeeds = activeInfrastructureProjects
          .filter(p => !loadedIds.has(p.id))
          .map(p => ({ ...p, isSampleData: true }));

        setAvailableProjects([...loaded, ...remainingSeeds]);
        setIsLiveSynced(true);
      }, (err) => {
        console.warn('[ProjectSession] Firestore projects sync fallback:', err);
      });
    } catch (err) {
      console.warn('[ProjectSession] Failed to initialize projects listener:', err);
    }

    return () => {
      if (unsub) unsub();
    };
  }, []);

  // 3. Real-time Cloud Firestore subscription for user active session
  useEffect(() => {
    let unsubSession: (() => void) | null = null;
    try {
      const sessionDocRef = doc(db, 'user_sessions', DEFAULT_USER_ID);
      unsubSession = onSnapshot(sessionDocRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data?.lastActiveProjectId) {
            // Only update if not already set from explicit URL query
            const urlProjectId = typeof router.query.projectId === 'string' ? router.query.projectId : null;
            if (!urlProjectId && data.lastActiveProjectId !== activeProjectId) {
              setActiveProjectId(data.lastActiveProjectId);
            }
          }
          if (Array.isArray(data?.recentProjectIds) && data.recentProjectIds.length > 0) {
            setRecentProjectIds(prev => {
              const merged = Array.from(new Set([...data.recentProjectIds, ...prev])).slice(0, 8);
              return merged;
            });
          }
        }
      }, (err) => {
        console.warn('[ProjectSession] Session sync notice:', err);
      });
    } catch (err) {
      console.warn('[ProjectSession] Failed to attach session listener:', err);
    }

    return () => {
      if (unsubSession) unsubSession();
    };
  }, [activeProjectId, router.query.projectId]);

  // Derived: Current active project object
  const activeProject = useMemo(() => {
    const found = availableProjects.find(p => p.id === activeProjectId);
    if (found) return found;
    return availableProjects[0] || null;
  }, [availableProjects, activeProjectId]);

  // Derived: List of recent projects (resolved objects)
  const recentProjects = useMemo(() => {
    return recentProjectIds
      .map(id => availableProjects.find(p => p.id === id))
      .filter((p): p is InfrastructureProject => Boolean(p));
  }, [availableProjects, recentProjectIds]);

  // Derived: Previous project (the one accessed right before the current one)
  const previousProject = useMemo(() => {
    const candidate = recentProjects.find(p => p.id !== activeProjectId);
    return candidate || null;
  }, [recentProjects, activeProjectId]);

  // Handler: Switch active project
  const switchProject = useCallback((projectId: string, navigateToConsole: boolean = false) => {
    if (!projectId) return;

    setActiveProjectId(projectId);

    // Update recents list
    setRecentProjectIds(prev => {
      const updated = [projectId, ...prev.filter(id => id !== projectId)].slice(0, 8);
      try {
        localStorage.setItem(LOCAL_STORAGE_RECENT_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Save to localStorage for instant hydration
    try {
      localStorage.setItem(LOCAL_STORAGE_ACTIVE_KEY, projectId);
    } catch {}

    // Persist to Cloud Firestore session
    const targetProject = availableProjects.find(p => p.id === projectId);
    saveUserSession({
      userId: DEFAULT_USER_ID,
      lastActiveProjectId: projectId,
      lastActiveProjectName: targetProject?.name || 'Assurance Initiative',
      recentProjectIds: [projectId, ...recentProjectIds.filter(id => id !== projectId)].slice(0, 8)
    }).catch(e => console.warn('[ProjectSession] Error persisting session to Firestore:', e));

    // Optional navigation to project console
    if (navigateToConsole || router.pathname === '/project-dashboard') {
      router.push(`/project-dashboard?projectId=${encodeURIComponent(projectId)}`, undefined, { shallow: true });
    }
  }, [availableProjects, recentProjectIds, router]);

  // Handler: Reload previous project
  const reloadPreviousProject = useCallback(() => {
    if (previousProject) {
      switchProject(previousProject.id, true);
    }
  }, [previousProject, switchProject]);

  // Handler: Save newly created project
  const saveNewProject = useCallback(async (project: InfrastructureProject) => {
    setAvailableProjects(prev => [project, ...prev.filter(p => p.id !== project.id)]);
    switchProject(project.id, true);
  }, [switchProject]);

  return (
    <ProjectSessionContext.Provider
      value={{
        activeProjectId,
        activeProject,
        availableProjects,
        recentProjects,
        previousProject,
        isLiveSynced,
        switchProject,
        reloadPreviousProject,
        saveNewProject,
        isIngestModalOpen,
        setIsIngestModalOpen
      }}
    >
      {children}
    </ProjectSessionContext.Provider>
  );
};

export const useProjectSession = (): ProjectSessionContextType => {
  const context = useContext(ProjectSessionContext);
  if (!context) {
    throw new Error('useProjectSession must be used within a ProjectSessionProvider');
  }
  return context;
};

export default ProjectSessionContext;
