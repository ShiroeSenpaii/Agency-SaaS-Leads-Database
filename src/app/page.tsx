import Link from 'next/link';

export default function HomePage() {
  return (
    <section className="space-y-4">
      <p className="text-slate-700">
        Manage opportunities, score them, and match them to clients. Everything is stored locally in your browser.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link className="rounded-lg bg-white p-4 shadow-sm hover:bg-slate-100" href="/dashboard">
          View Dashboard
        </Link>
        <Link className="rounded-lg bg-white p-4 shadow-sm hover:bg-slate-100" href="/opportunities">
          Browse Opportunities
        </Link>
        <Link className="rounded-lg bg-white p-4 shadow-sm hover:bg-slate-100" href="/clients">
          Manage Clients
        </Link>
        <Link className="rounded-lg bg-white p-4 shadow-sm hover:bg-slate-100" href="/settings">
          Import / Export Data
        </Link>
      </div>
    </section>
  );
}
