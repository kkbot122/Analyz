export default function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 text-gray-700 mb-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-gray-500 mt-1">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}
