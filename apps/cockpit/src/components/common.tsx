import type { HealthState, MilestoneStatus, Priority, QualityGateStatus } from '@ag/schema/cockpit';
import type { ReactNode } from 'react';
import { Badge } from './ui';
import {
  gateLabel,
  gateTone,
  healthLabel,
  healthTone,
  milestoneLabel,
  milestoneTone,
  offerLabel,
  priorityTone,
  typeLabel,
} from '@/lib/display';

export const PriorityBadge = ({ priority }: { priority: Priority }) => (
  <Badge tone={priorityTone[priority]}>{priority}</Badge>
);
export const TypeBadge = ({ type }: { type: string }) => (
  <Badge tone="neutral">{typeLabel[type] ?? type}</Badge>
);
export const GateBadge = ({ status }: { status: QualityGateStatus }) => (
  <Badge tone={gateTone[status]}>{gateLabel[status]}</Badge>
);
export const HealthBadge = ({ status }: { status: HealthState }) => (
  <Badge tone={healthTone[status]}>{healthLabel[status]}</Badge>
);
export const MilestoneBadge = ({ status }: { status: MilestoneStatus }) => (
  <Badge tone={milestoneTone[status]}>{milestoneLabel[status]}</Badge>
);
export const OfferBadge = ({ offer }: { offer: string }) => (
  <Badge tone={offer === 'premium' ? 'accent' : 'neutral'}>{offerLabel[offer] ?? offer}</Badge>
);

export function PageHeader({ title, subtitle }: { title: string; subtitle?: ReactNode }) {
  return (
    <header className="mb-5">
      <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      {subtitle ? <p className="mt-0.5 text-sm text-muted">{subtitle}</p> : null}
    </header>
  );
}

export function EmptyHint({ children }: { children: ReactNode }) {
  return <p className="text-sm text-muted">{children}</p>;
}
