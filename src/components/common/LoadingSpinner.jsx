export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-8 sm:py-12">
      <div className="relative w-10 sm:w-12 h-10 sm:h-12">
        <div className="absolute inset-0 rounded-full border-4 border-slate-700"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
      </div>
    </div>
  );
}
