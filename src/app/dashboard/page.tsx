'use client';

import { useEffect, useState } from 'react';

type Ticket = {
  id: string;
  customerId: string;
  ticketBody: string;
  planTier: string;
  isPriority: boolean;
  createdAt: string;
  status: string;
  analysis: {
    category: string;
    sentiment: string;
    urgencyScore: number;
    summary: string;
    isPriorityFlagged: boolean;
  } | null;
};

const statusStyles: Record<string, string> = {
  ANALYZED: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  PENDING_ANALYSIS: 'bg-amber-50 text-amber-700 ring-amber-600/20',
};

const categories = ['ALL', 'BUG', 'BILLING', 'FEATURE_REQUEST', 'OUTAGE', 'GENERAL_INQUIRY'];
type SortOption = 'urgency' | 'sentiment' | 'created';
type SortDirection = 'asc' | 'desc';

const sentimentOrder = ['URGENT', 'NEGATIVE', 'NEUTRAL', 'POSITIVE'];

export default function Dashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('created');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [pageSize, setPageSize] = useState<5 | 10>(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const res = await fetch('/api/tickets');
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to load tickets.');
        }

        setTickets(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tickets.');
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, [refreshKey]);

  const analyzedCount = tickets.filter((ticket) => ticket.analysis).length;
  const priorityCount = tickets.filter(
    (ticket) => ticket.isPriority || ticket.analysis?.isPriorityFlagged
  ).length;
  const filteredTickets = tickets
    .filter((ticket) => categoryFilter === 'ALL' || ticket.analysis?.category === categoryFilter)
    .sort((first, second) => {
      let comparison = 0;

      if (sortBy === 'urgency') {
        comparison = (first.analysis?.urgencyScore ?? -1) - (second.analysis?.urgencyScore ?? -1);
      } else if (sortBy === 'sentiment') {
        comparison = sentimentOrder.indexOf(first.analysis?.sentiment ?? '') - sentimentOrder.indexOf(second.analysis?.sentiment ?? '');
      } else {
        comparison = new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime();
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / pageSize));
  const visiblePage = Math.min(currentPage, totalPages);
  const paginatedTickets = filteredTickets.slice(
    (visiblePage - 1) * pageSize,
    visiblePage * pageSize
  );

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
              Sentinel triage
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">Support queue</h1>
            <p className="mt-2 text-sm text-slate-500">
              THE FOLLOWING ARE TESTING TICKETS ONLY FOR DEV PURPOSES.
              Review incoming tickets and their automated analysis.
            </p>
          </div>
          <div className="flex gap-6 text-sm">
            <div>
              <p className="text-slate-500">Total tickets</p>
              <p className="mt-1 text-xl font-semibold">{tickets.length}</p>
            </div>
            <div>
              <p className="text-slate-500">Analyzed</p>
              <p className="mt-1 text-xl font-semibold text-emerald-700">{analyzedCount}</p>
            </div>
            <div>
              <p className="text-slate-500">Priority</p>
              <p className="mt-1 text-xl font-semibold text-rose-700">{priorityCount}</p>
            </div>
          </div>
        </header>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-semibold">Ticket activity</h2>
            <div className="flex flex-wrap items-center gap-2">
              <label className="sr-only" htmlFor="category-filter">Filter by category</label>
              <select
                id="category-filter"
                value={categoryFilter}
                onChange={(event) => {
                  setCategoryFilter(event.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'ALL' ? 'All categories' : category.replaceAll('_', ' ')}
                  </option>
                ))}
              </select>
              <label className="sr-only" htmlFor="sort-by">Sort tickets by</label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(event) => {
                  setSortBy(event.target.value as SortOption);
                  setCurrentPage(1);
                }}
                className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="created">Sort by: created</option>
                <option value="urgency">Sort by: urgency</option>
                <option value="sentiment">Sort by: sentiment</option>
              </select>
              <label className="sr-only" htmlFor="sort-direction">Sort direction</label>
              <select
                id="sort-direction"
                value={sortDirection}
                onChange={(event) => {
                  setSortDirection(event.target.value as SortDirection);
                  setCurrentPage(1);
                }}
                className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="desc">
                  {sortBy === 'created' ? 'Newest first' : sortBy === 'urgency' ? 'Highest first' : 'Urgent to positive'}
                </option>
                <option value="asc">
                  {sortBy === 'created' ? 'Oldest first' : sortBy === 'urgency' ? 'Lowest first' : 'Positive to urgent'}
                </option>
              </select>
              <label className="sr-only" htmlFor="page-size">Rows per page</label>
              <select
                id="page-size"
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value) as 5 | 10);
                  setCurrentPage(1);
                }}
                className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              >
                <option value={5}>5 rows</option>
                <option value={10}>10 rows</option>
              </select>
              <button
                type="button"
                onClick={() => setRefreshKey((key) => key + 1)}
                disabled={loading}
                className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          {loading && <p className="px-5 py-12 text-center text-sm text-slate-500">Loading tickets...</p>}
          {!loading && error && <p className="px-5 py-12 text-center text-sm text-rose-600">{error}</p>}
          {!loading && !error && tickets.length === 0 && (
            <p className="px-5 py-12 text-center text-sm text-slate-500">No tickets have been submitted yet.</p>
          )}
          {!loading && !error && tickets.length > 0 && filteredTickets.length === 0 && (
            <p className="px-5 py-12 text-center text-sm text-slate-500">No tickets match this category.</p>
          )}

          {!loading && !error && paginatedTickets.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">Ticket</th>
                    <th className="px-5 py-3 font-medium">Customer</th>
                    <th className="px-5 py-3 font-medium">Category</th>
                    <th className="px-5 py-3 font-medium">Sentiment</th>
                    <th className="px-5 py-3 font-medium">Urgency</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedTickets.map((ticket) => {
                    const analysis = ticket.analysis;
                    const statusClass = statusStyles[ticket.status] || 'bg-slate-100 text-slate-600 ring-slate-500/20';

                    return (
                      <tr key={ticket.id} className="align-top transition-colors hover:bg-slate-50">
                        <td className="max-w-sm px-5 py-4">
                          <p className="font-medium text-slate-900">{ticket.ticketBody}</p>
                          {analysis?.summary && <p className="mt-1 text-xs text-slate-500">{analysis.summary}</p>}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-slate-600">{ticket.customerId}</td>
                        <td className="whitespace-nowrap px-5 py-4 text-slate-600">{analysis?.category || '—'}</td>
                        <td className="whitespace-nowrap px-5 py-4 text-slate-600">{analysis?.sentiment || '—'}</td>
                        <td className="whitespace-nowrap px-5 py-4">
                          {analysis ? `${analysis.urgencyScore}/10` : '—'}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusClass}`}>
                            {ticket.status.replaceAll('_', ' ')}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && filteredTickets.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
              <span>
                Showing {(visiblePage - 1) * pageSize + 1}-{Math.min(visiblePage * pageSize, filteredTickets.length)} of {filteredTickets.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={visiblePage === 1}
                  className="rounded-md border border-slate-200 px-3 py-1.5 font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="min-w-16 text-center">Page {visiblePage} of {totalPages}</span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={visiblePage === totalPages}
                  className="rounded-md border border-slate-200 px-3 py-1.5 font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}