'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { RatingCard } from '@/components/penilaian/RatingCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { canUserRate } from '@/lib/utils/validators';
import { isRamadan } from '@/lib/utils/calculations';

export default function PenilaianPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [alreadyRatedIds, setAlreadyRatedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, any>>({});

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    // 1. Simulating auth check since we're using cookies. For a proper app, 
    // we'd probably have an /api/auth/me route. We'll extract basic user info from localStorage if present
    // For now, assume MGR-001 is hardcoded fallback if needed, or redirect
    
    // In real flow, fetch user info from API
    // Setting up a mockup flow to test UI
    const mockUser = {
      id: 'MGR-001',
      name: 'Manager Operasional',
      role: 'manager',
      outlet: 'BTM'
    };
    setCurrentUser(mockUser);

    try {
      // Fetch Master List
      const resMaster = await fetch('/api/sheets/master-list');
      const dataMaster = await resMaster.json();
      
      // Fetch existing Penilaian to lock cards
      const resPenilaian = await fetch('/api/sheets/penilaian');
      const dataPenilaian = await resPenilaian.json();

      if (dataMaster.success) {
        // Filter out employees we can't rate
        let rateable = dataMaster.data.filter((emp: any) => 
          canUserRate(mockUser.role, mockUser.outlet, mockUser.id, emp.id, emp.outlet).canRate
        );

        // Deduplicate employee IDs in case the Google Sheet has accidental duplicates
        rateable = rateable.filter((value: any, index: number, self: any[]) => 
          index === self.findIndex((t) => t.id === value.id)
        );

        setEmployees(rateable);

        // Pre-load drafts from localstorage
        const localDrafts: Record<string, any> = {};
        rateable.forEach((emp: any) => {
          const stored = localStorage.getItem(`rating_draft_${mockUser.id}_${emp.id}`);
          if (stored) {
            try { localDrafts[emp.id] = JSON.parse(stored); } catch(e){}
          }
        });
        setDrafts(localDrafts);
      }

      if (dataPenilaian.success) {
        // Find who the current user has already rated THIS month
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        const ratedSet = new Set<string>();
        dataPenilaian.data.forEach((row: any) => {
          if (row.namaPenilai === mockUser.id) {
            const date = new Date(row.tanggal);
            if (date.getMonth() === thisMonth && date.getFullYear() === thisYear) {
              ratedSet.add(row.karyawanDinilai);
            }
          }
        });
        setAlreadyRatedIds(ratedSet);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = (employeeId: string, ratings: any) => {
    if (!currentUser) return;
    localStorage.setItem(`rating_draft_${currentUser.id}_${employeeId}`, JSON.stringify(ratings));
    setDrafts(prev => ({...prev, [employeeId]: ratings}));
    alert('Draft disimpan!');
  };

  const handleSubmitAll = async () => {
    // Process submission logic (validate all drafts, prepare payload, POST /append)
    // Placeholder alert
    alert('Fitur Submit All sedang dalam pengembangan!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#e8ecf1] flex flex-col md:flex-row p-4 sm:p-6 gap-4 md:gap-6 font-sans overflow-hidden">
      <Sidebar currentUser={currentUser} />
      
      <main className="flex-1 overflow-y-auto bg-white/70 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full pointer-events-none"></div>
        
        <div className="p-8 sm:p-12 h-full flex flex-col">
          <div className="mb-10 flex justify-between items-end relative z-10">
            <div>
              <h2 className="text-3xl font-extrabold text-[#1a1a1a] tracking-tight mb-2">Penilaian Karyawan</h2>
              <p className="text-sm text-neutral-500 font-medium">Beri penilaian kinerja bulanan secara objektif dan akurat.</p>
            </div>
            {/* Quick Stats or Right Addons can go here */}
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4 relative z-10 custom-scrollbar">
            {employees.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white border border-dashed border-neutral-300 rounded-2xl">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4 text-2xl">🎉</div>
                <h3 className="text-lg font-bold text-neutral-900 mb-1">Semua Selesai!</h3>
                <p className="text-neutral-500 text-sm">Tidak ada karyawan yang perlu Anda nilai saat ini.</p>
              </div>
            ) : (
              employees.map(emp => (
                <RatingCard 
                  key={emp.id}
                  employee={emp}
                  isExpanded={expandedId === emp.id}
                  isLocked={alreadyRatedIds.has(emp.id)}
                  isRamadan={isRamadan()}
                  draftRatings={drafts[emp.id] || null}
                  onToggleExpand={(id) => setExpandedId(expandedId === id ? null : id)}
                  onSaveDraft={handleSaveDraft}
                />
              ))
            )}
          </div>

          {employees.length > 0 && (
            <div className="mt-6 pt-6 border-t border-neutral-200/50 flex justify-between items-center relative z-10">
              <button className="px-5 py-2.5 text-sm font-bold text-red-600 bg-white hover:bg-red-50 border border-red-100 rounded-xl transition-all shadow-sm">
                Reset Semua Draft
              </button>
              <button 
                onClick={handleSubmitAll}
                className="px-6 py-3 text-sm font-bold text-white bg-[#1a1a1a] hover:bg-black rounded-xl shadow-lg hover:-translate-y-0.5 transition-all"
              >
                Simpan & Submit ke Server
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
