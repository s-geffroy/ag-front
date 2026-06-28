import { Navigate, useLocation } from 'react-router-dom';

/** Redirects the old `/depots?deliverable=…` to `/outils/depots`, preserving the query string. */
export function DepotsRedirect() {
  const { search } = useLocation();
  return <Navigate to={`/outils/depots${search}`} replace />;
}
