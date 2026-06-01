export default function StatusBadge({ estado }) {
  if (!estado) return null;
  const label = estado.replace(/_/g, ' ');
  return <span className={`badge badge-${estado}`}>{label}</span>;
}
