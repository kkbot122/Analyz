export default function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center justify-center h-64 bg-white border rounded-lg">
      <div className="text-center max-w-sm">
        <div className="text-sm font-medium text-gray-900">
          {title}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {description}
        </div>
      </div>
    </div>
  );
}