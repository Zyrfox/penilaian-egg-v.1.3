'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { groupByEmployeeForRecap, transformToEmployees, transformToRatingRecords } from '@/lib/utils/transformers';
import { Employee, RatingRecord, RecapRow } from '@/lib/types';

export default function RekapanPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recapData, setRecapData] = useState<RecapRow[]>([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    // 1. Auth check: Only manager can access
    const mockUser = {
      id: 'MGR-001',
      name: 'Manager Operasional',
      role: 'manager'
    };
    
    if (mockUser.role !== 'manager') {
      alert('Akses Ditolak: Hanya manager yang bisa mengakses halaman rekapan.');
      router.push('/penilaian');
      return;
    }
    
    setCurrentUser(mockUser);
    loadData();
  }, []);

  const loadData = async (start?: string, end?: string) => {
    setLoading(true);
    try {
      // Build query string
      let query = '';
      if (start && end) {
        query = `?startDate=${start}&endDate=${end}`;
      }

      // Fetch master list and penilaian concurrently
      const [resMaster, resPenilaian] = await Promise.all([
        fetch('/api/sheets/master-list'),
        fetch(`/api/sheets/penilaian${query}`)
      ]);
      
      const dataMaster = await resMaster.json();
      const dataPenilaian = await resPenilaian.json();

      if (dataMaster.success && dataPenilaian.success) {
        // We already transformed on the server side using the DB schema,
        // so dataPenilaian.data is RatingRecord[]
        
        const grouped = groupByEmployeeForRecap(
          dataPenilaian.data as RatingRecord[], 
          dataMaster.data as Employee[]
        );
        
        setRecapData(grouped);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (employeeId: string) => {
    setRecapData(prev => prev.map(row => 
      row.employeeId === employeeId ? { ...row, isExpanded: !row.isExpanded } : row
    ));
  };

  if (loading && !recapData.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <LoadingSpinner />
      </div>
    );
  }

  const totalDinilai = recapData.length;

  return (
    <div className="h-screen bg-[#e8ecf1] flex flex-col md:flex-row p-4 sm:p-6 gap-4 md:gap-6 font-sans overflow-hidden">
      <Sidebar currentUser={currentUser} />
      
      <main className="flex-1 overflow-y-auto bg-white/70 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full pointer-events-none"></div>

        <div className="p-8 sm:p-12 h-full flex flex-col relative z-10">
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-[#1a1a1a] tracking-tight mb-2">Rekapan Nilai Karyawan</h1>
              <p className="text-sm text-neutral-500 font-medium">Lihat dan ekspor hasil penilaian karyawan dari semua penilai.</p>
            </div>
            <div className="flex gap-3">
              <button className="px-5 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm font-bold text-neutral-700 shadow-sm hover:bg-neutral-50 transition-all">
                Ekspor CSV
              </button>
              <button className="px-5 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm font-bold text-neutral-700 shadow-sm hover:bg-neutral-50 transition-all">
                Ekspor PDF
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-white/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)]">
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">Total Dinilai</p>
              <p className="text-3xl font-extrabold text-[#1a1a1a]">{totalDinilai}</p>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] overflow-hidden flex-1 flex flex-col">
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#f8fafc] border-b border-neutral-100">
                  <tr>
                    <th className="px-6 py-4 font-bold text-neutral-500 w-16">No</th>
                    <th className="px-6 py-4 font-bold text-neutral-500">Nama</th>
                    <th className="px-6 py-4 font-bold text-neutral-500">Outlet</th>
                    <th className="px-6 py-4 font-bold text-neutral-500">Posisi</th>
                    <th className="px-6 py-4 font-bold text-neutral-500 text-center w-24">Rata²</th>
                    <th className="px-6 py-4 font-bold text-neutral-500 text-center w-24">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {recapData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-neutral-400 font-medium">
                        Tidak ada data penilaian untuk periode ini.
                      </td>
                    </tr>
                  ) : (
                    recapData.map((row) => (
                      <React.Fragment key={row.employeeId}>
                        <tr 
                          className={`hover:bg-neutral-50 transition-colors cursor-pointer ${row.isExpanded ? 'bg-primary/5' : 'bg-white'}`}
                          onClick={() => toggleExpand(row.employeeId)}
                        >
                          <td className="px-6 py-4 font-medium text-neutral-500">{row.no}</td>
                          <td className="px-6 py-4 font-bold text-[#1a1a1a] flex items-center justify-between">
                            <span>{row.employeeName}</span>
                            <span className="text-neutral-300 text-xs ml-2">{row.isExpanded ? '▼' : '▶'}</span>
                          </td>
                          <td className="px-6 py-4 font-medium text-neutral-600">{row.outlet}</td>
                          <td className="px-6 py-4 text-neutral-500">{row.position}</td>
                          <td className={`px-6 py-4 text-center font-bold ${row.averageScore >= 4 ? 'text-green-600' : row.averageScore < 3 ? 'text-red-500' : 'text-[#1a1a1a]'}`}>
                            {row.averageScore.toFixed(1)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center justify-center px-3 py-1 rounded-xl text-xs font-bold bg-[#f1f5f9] text-neutral-700">
                              {row.totalPoints}
                            </span>
                          </td>
                        </tr>
                        {row.isExpanded && (
                          <tr>
                            <td colSpan={6} className="px-0 py-0 bg-[#f8fafc] border-b border-neutral-200">
                              <div className="py-4 px-8 pl-16">
                                <h4 className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest mb-3">Detail Penilai</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {row.raters.map((rater, idx) => (
                                    <div key={idx} className="bg-white p-4 rounded-xl border border-neutral-100 shadow-sm flex justify-between items-center text-sm">
                                      <div>
                                        <p className="font-bold text-neutral-800">{rater.raterName}</p>
                                        <p className="text-xs font-medium text-neutral-400 mt-0.5">{rater.submittedDate.split(' ')[0]}</p>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-extrabold text-lg text-[#1a1a1a]">{rater.averageScore.toFixed(1)}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
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
