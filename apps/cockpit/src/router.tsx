import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from './components/layout';
import { CockpitPage } from './pages/CockpitPage';
import { KanbanPage } from './pages/KanbanPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { QualityGatesPage } from './pages/QualityGatesPage';
import { ScorecardPage } from './pages/ScorecardPage';
import { AcquisitionPage } from './pages/AcquisitionPage';
import { ExplorationPage } from './pages/ExplorationPage';
import { ContentReaderPage } from './pages/ContentReaderPage';
import { UploadsPage } from './pages/UploadsPage';
import { ReviewPage } from './pages/ReviewPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <CockpitPage /> },
      { path: 'kanban', element: <KanbanPage /> },
      { path: 'roadmap', element: <RoadmapPage /> },
      { path: 'quality', element: <QualityGatesPage /> },
      { path: 'revue', element: <ReviewPage /> },
      { path: 'scorecard', element: <ScorecardPage /> },
      { path: 'acquisition', element: <AcquisitionPage /> },
      { path: 'exploration', element: <ExplorationPage /> },
      { path: 'lire/:type/:slug', element: <ContentReaderPage /> },
      { path: 'depots', element: <UploadsPage /> },
    ],
  },
]);
