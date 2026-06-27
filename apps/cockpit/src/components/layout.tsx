import {
  BarChart3,
  ClipboardCheck,
  Download,
  Globe2,
  KanbanSquare,
  LayoutDashboard,
  Map as MapIcon,
  Moon,
  ShieldCheck,
  Sun,
  Upload,
  Users,
} from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { CockpitProvider, useCockpit } from '@/store';
import { globalHealth } from '@/lib/calculations';
import { buildMarkdownSummary, downloadMarkdown } from '@/lib/export';
import { useTheme } from '@/lib/theme';
import { cn } from '@/lib/cn';
import { Button } from './ui';
import { HealthBadge } from './common';

const NAV = [
  { to: '/', label: 'Cockpit', icon: LayoutDashboard, end: true },
  { to: '/kanban', label: 'Kanban', icon: KanbanSquare, end: false },
  { to: '/roadmap', label: 'Roadmap', icon: MapIcon, end: false },
  { to: '/quality', label: 'Quality Gates', icon: ShieldCheck, end: false },
  { to: '/revue', label: 'Revue', icon: ClipboardCheck, end: false },
  { to: '/scorecard', label: 'Scorecard', icon: BarChart3, end: false },
  { to: '/acquisition', label: 'Acquisition', icon: Users, end: false },
  { to: '/exploration', label: 'Exploration', icon: Globe2, end: false },
  { to: '/depots', label: 'Dépôts', icon: Upload, end: false },
];

function Sidebar() {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-line bg-surface">
      <div className="border-b border-line px-4 py-4">
        <div className="text-sm font-semibold leading-tight">Applied Geopolitics</div>
        <div className="text-xs text-muted">Cockpit de déploiement</div>
      </div>
      <nav className="flex-1 space-y-0.5 p-2">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium',
                isActive ? 'bg-accent/10 text-accent' : 'text-muted hover:bg-subtle hover:text-ink',
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-line px-4 py-3 text-[11px] leading-snug text-muted">
        Interne · Tailscale uniquement.
        <br />
        Jamais exposé publiquement.
      </div>
    </aside>
  );
}

function TopBar() {
  const { state, saving } = useCockpit();
  const { theme, toggle } = useTheme();
  const health = state ? globalHealth(state.deliverables, new Date()) : null;

  const onExport = () => {
    if (!state) return;
    downloadMarkdown('cockpit-resume.md', buildMarkdownSummary(state));
  };

  return (
    <div className="flex h-12 shrink-0 items-center justify-between border-b border-line bg-surface px-5">
      <div className="flex items-center gap-2 text-sm text-muted">
        <span>Santé globale</span>
        {health ? <HealthBadge status={health} /> : <span>…</span>}
      </div>
      <div className="flex items-center gap-3">
        {saving ? <span className="text-xs text-muted">Enregistrement…</span> : null}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          aria-label={theme === 'dark' ? 'Passer en mode jour' : 'Passer en mode nuit'}
          title={theme === 'dark' ? 'Mode jour' : 'Mode nuit'}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button variant="outline" size="sm" onClick={onExport} disabled={!state}>
          <Download className="h-3.5 w-3.5" />
          Export Markdown
        </Button>
      </div>
    </div>
  );
}

function Shell() {
  const { error } = useCockpit();
  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        {error ? (
          <div className="border-b border-status-blocked/30 bg-status-blocked/10 px-5 py-2 text-xs text-status-blocked">
            Erreur API : {error}
          </div>
        ) : null}
        <main className="min-h-0 flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function AppShell() {
  return (
    <CockpitProvider>
      <Shell />
    </CockpitProvider>
  );
}
