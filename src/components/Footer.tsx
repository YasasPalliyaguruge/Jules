export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 px-6 py-10 text-slate-300">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm leading-6 md:flex-row md:items-center md:justify-between">
        <p>&copy; {new Date().getFullYear()} Jules. A browser-local reflection project.</p>
        <p className="max-w-2xl text-slate-400">
          Check-ins stay in the current browser unless the user exports or clears them. Jules does not provide medical or crisis services.
        </p>
      </div>
    </footer>
  );
}
