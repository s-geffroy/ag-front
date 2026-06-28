import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout';
import { CockpitPage } from './pages/CockpitPage';
import { PipelinePage } from './pages/PipelinePage';
import { RoadmapPage } from './pages/RoadmapPage';
import { ProjectScorecardPage } from './pages/ProjectScorecardPage';
import { CommercialScorecardPage } from './pages/CommercialScorecardPage';
import { AcquisitionPage } from './pages/AcquisitionPage';
import { ExplorationPage } from './pages/ExplorationPage';
import { ContentReaderPage } from './pages/ContentReaderPage';
import { UploadsPage } from './pages/UploadsPage';
import { OutputWorkspacePage } from './pages/OutputWorkspacePage';
import { DepotsRedirect } from './components/redirects';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <CockpitPage /> },

      // Suivi du projet
      { path: 'suivi/pipeline', element: <PipelinePage /> },
      { path: 'suivi/roadmap', element: <RoadmapPage /> },
      { path: 'suivi/kpis', element: <ProjectScorecardPage /> },

      // Gestion commerciale
      { path: 'commercial/acquisition', element: <AcquisitionPage /> },
      { path: 'commercial/kpis', element: <CommercialScorecardPage /> },

      // Espaces de sortie (config-driven, single page)
      { path: 'sorties/:slug', element: <OutputWorkspacePage /> },

      // Outils
      { path: 'outils/exploration', element: <ExplorationPage /> },
      { path: 'outils/depots', element: <UploadsPage /> },

      // Lecteur (inchangé)
      { path: 'lire/:type/:slug', element: <ContentReaderPage /> },

      // Back-compat redirects (anciens favoris / liens internes)
      { path: 'kanban', element: <Navigate to="/suivi/pipeline" replace /> },
      { path: 'roadmap', element: <Navigate to="/suivi/roadmap" replace /> },
      { path: 'quality', element: <Navigate to="/suivi/pipeline" replace /> },
      { path: 'scorecard', element: <Navigate to="/suivi/kpis" replace /> },
      { path: 'revue', element: <Navigate to="/sorties/dossiers" replace /> },
      { path: 'acquisition', element: <Navigate to="/commercial/acquisition" replace /> },
      { path: 'exploration', element: <Navigate to="/outils/exploration" replace /> },
      // Preserve the ?deliverable=… query when redirecting the old Dépôts path.
      { path: 'depots', element: <DepotsRedirect /> },
    ],
  },
]);
