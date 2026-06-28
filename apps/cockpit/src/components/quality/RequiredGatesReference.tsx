import type { DeliverableType } from '@ag/schema/cockpit';
import { useCockpit } from '@/store';
import { typeLabel } from '@/lib/display';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

/** Reference card listing the gates required per type; scoped to one type when `typeFilter` is set. */
export function RequiredGatesReference({ typeFilter }: { typeFilter?: DeliverableType }) {
  const { state } = useCockpit();
  if (!state) return null;
  const specs = typeFilter
    ? state.quality_gates.filter((s) => s.type === typeFilter)
    : state.quality_gates;
  if (specs.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gates requis par type (référence)</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {specs.map((spec) => (
          <div key={spec.type}>
            <div className="mb-1 text-sm font-semibold">{typeLabel[spec.type] ?? spec.type}</div>
            <ul className="space-y-1 text-xs text-muted">
              {spec.required_gates.map((g) => (
                <li key={g.id}>
                  <span className="font-medium text-ink">{g.label}</span> — {g.description}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
