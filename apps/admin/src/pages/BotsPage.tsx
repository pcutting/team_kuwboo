import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { listBots } from '../api/client';

interface BotRecord {
  id: string;
  displayPersona: string;
  simulationStatus: string;
  totalActions: number;
  roamRadiusKm: number;
  lastSimulatedAt?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
    onlineStatus: string;
  };
}

export function BotsPage() {
  const { accessToken } = useAuth();
  const [bots, setBots] = useState<BotRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!accessToken) return;

    const params: Record<string, string> = { page: String(page), limit: '20' };
    if (statusFilter) params.simulationStatus = statusFilter;

    listBots(accessToken, params)
      .then((res) => {
        setBots(res.data.items as unknown as BotRecord[]);
        setTotal(res.data.total);
      })
      .catch((err) => setError(err.message));
  }, [accessToken, page, statusFilter]);

  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Agent Bots</h1>
          <p className="mt-1 text-sm text-stone-500">
            {total} bot{total !== 1 ? 's' : ''} configured
          </p>
        </div>
        <div className="flex gap-1 bg-stone-100 p-1 rounded-lg">
          {[
            { value: '', label: 'All' },
            { value: 'RUNNING', label: 'Running' },
            { value: 'PAUSED', label: 'Paused' },
            { value: 'IDLE', label: 'Idle' },
            { value: 'ERROR', label: 'Error' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => {
                setStatusFilter(f.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                statusFilter === f.value
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 grid gap-4">
        {bots.map((bot) => (
          <div
            key={bot.id}
            className="bg-white rounded-xl border border-stone-200 p-5 flex items-center gap-5"
          >
            {/* Avatar */}
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-sm font-bold text-purple-600 shrink-0">
              {bot.user.name.charAt(0)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Link
                  to={`/dashboard/bots/${bot.id}`}
                  className="font-medium text-stone-900 hover:text-amber-700 transition-colors"
                >
                  {bot.user.name}
                </Link>
                <SimStatusBadge status={bot.simulationStatus} />
              </div>
              <p className="text-sm text-stone-500 mt-0.5">
                {bot.displayPersona.replace(/_/g, ' ')} &middot;{' '}
                {bot.roamRadiusKm}km radius &middot;{' '}
                {bot.totalActions.toLocaleString()} actions
              </p>
            </div>

            {/* Last active */}
            <div className="text-right shrink-0">
              <p className="text-xs text-stone-400">Last action</p>
              <p className="text-sm text-stone-600">
                {bot.lastSimulatedAt
                  ? timeAgo(new Date(bot.lastSimulatedAt))
                  : 'Never'}
              </p>
            </div>
          </div>
        ))}

        {bots.length === 0 && (
          <div className="bg-white rounded-xl border border-stone-200 p-12 text-center text-sm text-stone-400">
            No bots found
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-stone-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 text-sm border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 text-sm border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SimStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    RUNNING: 'bg-green-50 text-green-700',
    PAUSED: 'bg-yellow-50 text-yellow-700',
    IDLE: 'bg-stone-100 text-stone-500',
    ERROR: 'bg-red-50 text-red-700',
  };
  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[status] || 'bg-stone-100 text-stone-600'}`}
    >
      {status}
    </span>
  );
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
