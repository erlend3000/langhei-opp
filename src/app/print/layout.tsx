export default function PrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-white overflow-auto">{children}</div>;
}
