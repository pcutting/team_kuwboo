import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getStats, getBotStats } from '../api/client';

interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  totalMedia: number;
  totalNotifications: number;
  totalBots: number;
  activeBots: number;
}

interface BotStats {
  totalBots: number;
  runningBots: number;
  pausedBots: number;
  idleBots: number;
  errorBots: number;
  actionsToday: number;
}

export function DashboardPage() {
  const { accessToken } = useAuth();
  const [platform, setPlatform] = useState<PlatformStats | null>(null);
  const [bots, setBots] = useState<BotStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!accessToken) return;

    Promise.all([
      getStats(accessToken).catch(() => null),
      getBotStats(accessToken).catch(() => null),
    ]).then(([platformRes, botRes]) => {
      if (platformRes) setPlatform(platformRes.data as unknown as PlatformStats);
      if (botRes) setBots(botRes.data as unknown as BotStats);
      if (!platformRes && !botRes) setError('Failed to load stats');
    });
  }, [accessToken]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900">Dashboard</h1>
      <p className="mt-1 text-sm text-stone-500">Platform overview</p>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Platform stats */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider">
          Platform
        </h2>
        <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Users"
            value={platform?.totalUsers}
            accent="bg-blue-50 text-blue-700"
          />
          <StatCard
            label="Active Users"
            value={platform?.activeUsers}
            accent="bg-green-50 text-green-700"
          />
          <StatCard
            label="Media Items"
            value={platform?.totalMedia}
            accent="bg-purple-50 text-purple-700"
          />
          <StatCard
            label="Notifications"
            value={platform?.totalNotifications}
            accent="bg-amber-50 text-amber-700"
          />
        </div>
      </div>

      {/* Bot stats */}
      <div className="mt-10">
        <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider">
          Agent Bots
        </h2>
        <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            label="Total Bots"
            value={bots?.totalBots}
            accent="bg-stone-50 text-stone-700"
          />
          <StatCard
            label="Running"
            value={bots?.runningBots}
            accent="bg-green-50 text-green-700"
          />
          <StatCard
            label="Paused"
            value={bots?.pausedBots}
            accent="bg-yellow-50 text-yellow-700"
          />
          <StatCard
            label="Idle"
            value={bots?.idleBots}
            accent="bg-stone-50 text-stone-500"
          />
          <StatCard
            label="Errors"
            value={bots?.errorBots}
            accent="bg-red-50 text-red-700"
          />
          <StatCard
            label="Actions Today"
            value={bots?.actionsToday}
            accent="bg-blue-50 text-blue-700"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value?: number;
  accent: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5">
      <p className="text-sm text-stone-500">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${accent.split(' ')[1] || 'text-stone-900'}`}>
        {value !== undefined ? value.toLocaleString() : '\u2014'}
      </p>
    </div>
  );
}
