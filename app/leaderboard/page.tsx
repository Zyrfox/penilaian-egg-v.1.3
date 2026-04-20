'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { LeaderboardEntry, RatingRecord, Employee } from '@/lib/types';
import { normalizeLeaderboardScores } from '@/lib/utils/calculations';

export default function LeaderboardPage() {
  const [loading, setLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Note: Leaderboard requires no auth check 
      // It should load public data
      const [resMaster, resPenilaian] = await Promise.all([
        fetch('/api/sheets/master-list'),
        fetch('/api/sheets/penilaian')
      ]);
      
      const dataMaster = await resMaster.json();
      const dataPenilaian = await resPenilaian.json();

      if (dataMaster.success && dataPenilaian.success) {
        // Run Normalization process! 
        const normalized = normalizeLeaderboardScores(
          dataPenilaian.data as RatingRecord[],
          dataMaster.data as Employee[]
        );
        
        setLeaderboardData(normalized);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRankMedal = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#e8ecf1] flex flex-col md:flex-row p-4 sm:p-6 gap-4 md:gap-6 font-sans overflow-hidden">
      <Sidebar currentUser={null} />
      
      <main className="flex-1 overflow-y-auto bg-white/70 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full pointer-events-none"></div>

        <div className="p-8 sm:p-12 h-full flex flex-col relative z-10">
          <div className="mb-10 text-center sm:text-left">
            <h1 className="text-3xl font-extrabold text-[#1a1a1a] tracking-tight mb-2">Leaderboard Karyawan</h1>
            <p className="text-sm text-neutral-500 font-medium">Penilaian Karyawan Terbaik - Fair Output Assessment</p>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] overflow-hidden flex-1 flex flex-col">
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-[#f8fafc] border-b border-neutral-100">
                  <tr>
                    <th className="px-6 py-4 font-extrabold text-neutral-400 uppercase tracking-widest text-xs w-20 text-center">Rank</th>
                    <th className="px-6 py-4 font-extrabold text-neutral-400 uppercase tracking-widest text-xs">Nama Karyawan</th>
                    <th className="px-6 py-4 font-extrabold text-neutral-400 uppercase tracking-widest text-xs hidden md:table-cell">Posisi</th>
                    <th className="px-6 py-4 font-extrabold text-neutral-400 uppercase tracking-widest text-xs text-center">Outlet</th>
                    <th className="px-6 py-4 font-extrabold text-neutral-400 uppercase tracking-widest text-xs text-center">Score (Normalized)</th>
                    <th className="px-6 py-4 font-extrabold text-neutral-400 uppercase tracking-widest text-xs text-center">Point</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {leaderboardData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-neutral-400 font-medium">
                        Belum ada data penilaian pada periode ini.
                      </td>
                    </tr>
                  ) : (
                    leaderboardData.map((row) => (
                      <tr 
                        key={row.employeeId}
                        className={`hover:bg-neutral-50 transition-colors ${row.rank <= 3 ? 'bg-yellow-50/30' : 'bg-white'}`}
                      >
                        <td className="px-6 py-5 text-center font-bold text-2xl text-[#1a1a1a]">
                          {getRankMedal(row.rank)}
                        </td>
                        <td className="px-6 py-5 pb-4">
                          <div className="font-extrabold text-[#1a1a1a] text-lg">{row.employeeName}</div>
                          <div className="md:hidden text-xs font-semibold text-neutral-400 mt-0.5">{row.position}</div>
                        </td>
                        <td className="px-6 py-5 text-neutral-500 font-medium hidden md:table-cell">{row.position}</td>
                        <td className="px-6 py-5 text-center">
                          <span className="px-3.5 py-1.5 bg-[#f1f5f9] text-neutral-700 rounded-xl text-xs font-bold border border-neutral-200">
                            {row.outlet}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-center flex-col items-center justify-center">
                          <div className="font-extrabold text-[#1a1a1a] text-xl">
                            {row.normalizedScore.toFixed(2)}
                          </div>
                          <div className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase mt-1">
                            Raw: {row.rawAverage.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="px-4 py-2 bg-green-50 text-green-700 rounded-xl text-sm font-extrabold border border-green-100">
                            {row.totalPoints}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
