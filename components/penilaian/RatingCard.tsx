'use client';

import React, { useState, useEffect } from 'react';
import { RatingCategory, RatingGrade, RATING_SCALE } from '@/lib/types';
import { RATING_CATEGORIES } from '@/lib/utils/constants';

interface RatingCardProps {
  employee: any;
  isExpanded: boolean;
  isLocked: boolean;
  isRamadan: boolean;
  draftRatings: Record<RatingCategory, RatingGrade> | null;
  onToggleExpand: (id: string) => void;
  onSaveDraft: (id: string, ratings: Record<RatingCategory, RatingGrade>) => void;
}

export function RatingCard({
  employee,
  isExpanded,
  isLocked,
  isRamadan,
  draftRatings,
  onToggleExpand,
  onSaveDraft
}: RatingCardProps) {
  // Initialize rating state with draft or defaults
  const [ratings, setRatings] = useState<Record<string, RatingGrade>>(() => {
    if (draftRatings) return draftRatings;
    const initial: any = {};
    RATING_CATEGORIES.forEach(c => initial[c.id] = '');
    return initial;
  });

  const handleRatingChange = (categoryId: string, value: RatingGrade) => {
    if (isLocked) return;
    const newRatings = { ...ratings, [categoryId]: value };
    setRatings(newRatings);
    // Note: A real app would debounce this save to standard draft storage
  };

  const handleSaveDraftClick = () => {
    onSaveDraft(employee.id, ratings as Record<RatingCategory, RatingGrade>);
  };

  // Calculate local average for preview
  const values = Object.entries(ratings)
    .filter(([id, val]) => {
      const isReq = (RATING_CATEGORIES.find(c => c.id === id)?.required) || 
                    (isRamadan && ['sholat', 'puasa'].includes(id));
      return isReq && val !== '';
    })
    .map(([, val]) => RATING_SCALE[val] || 0);

  const rawAvg = values.length > 0 ? (values.reduce((a, b) => a + b, 0) / values.length) : 0;
  const gradeMapping: any = { 5: 'A', 4: 'B', 3: 'C', 2: 'D', 1: 'E' };
  const avgGrade = gradeMapping[Math.round(rawAvg)] || '-';

  return (
    <div className={`border rounded-lg overflow-hidden my-4 ${isExpanded ? 'border-primary ring-1 ring-primary' : 'border-neutral-200'}`}>
      <div 
        className={`p-4 cursor-pointer flex justify-between items-center transition-colors ${isExpanded ? 'bg-primary/5' : 'bg-white hover:bg-neutral-50'}`}
        onClick={() => onToggleExpand(employee.id)}
      >
        <div>
          <h3 className="font-extrabold text-[#1a1a1a] text-lg">{employee.name}</h3>
          <p className="text-sm text-neutral-500">{employee.outlet} - {employee.position}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-xs font-bold text-neutral-500">Rata-rata</div>
            <div className="font-extrabold text-[#1a1a1a] text-lg">{rawAvg.toFixed(1)} | {avgGrade}</div>
          </div>
          <div className="p-2">
            {isExpanded ? '▲' : '▼'}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 bg-white border-t border-neutral-100">
          {isLocked && (
            <div className="mb-4 bg-yellow-50 text-yellow-800 p-3 rounded-md text-sm border border-yellow-200">
              Karyawan ini sudah Anda nilai pada periode ini.
            </div>
          )}

          <div className="space-y-6">
            {['SOFT_SKILL', 'HARD_SKILL', 'ATTITUDE'].map(section => (
              <div key={section}>
                <h4 className="font-semibold text-primary mb-3">
                  {section === 'SOFT_SKILL' ? 'Soft Skill' : section.replace('_', ' ')}
                </h4>
                <div className="space-y-3">
                  {RATING_CATEGORIES.filter(c => c.section === section).map(cat => (
                    <div key={cat.id} className="flex flex-col sm:flex-row justify-between sm:items-center">
                      <label className="text-sm font-bold text-neutral-700 mb-1 sm:mb-0 w-full sm:w-1/2">{cat.label}</label>
                      <select 
                        value={ratings[cat.id]} 
                        onChange={e => handleRatingChange(cat.id, e.target.value as RatingGrade)}
                        disabled={isLocked}
                        className="border border-neutral-200 rounded-xl p-2.5 text-sm font-bold text-[#1a1a1a] bg-white w-full sm:w-auto min-w-[200px] focus:ring-2 focus:ring-[#1a1a1a] outline-none"
                      >
                        <option value="" disabled>Pilih Nilai</option>
                        <option value="A">A - Excellent (5)</option>
                        <option value="B">B - Good (4)</option>
                        <option value="C">C - Satisfactory (3)</option>
                        <option value="D">D - Poor (2)</option>
                        <option value="E">E - Very Poor (1)</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div>
              <h4 className="font-semibold text-primary mb-3">Ibadah</h4>
              <div className="space-y-3">
                {RATING_CATEGORIES.filter(c => c.section === 'IBADAH').map(cat => (
                  <div key={cat.id} className="flex flex-col sm:flex-row justify-between sm:items-center">
                    <label className="text-sm font-bold text-neutral-700 mb-1 sm:mb-0 w-full sm:w-1/2">
                      {cat.label} {!isRamadan && <span className="text-neutral-400 font-normal text-xs ml-1">(Opsional)</span>}
                    </label>
                    <select 
                      value={ratings[cat.id]} 
                      onChange={e => handleRatingChange(cat.id, e.target.value as RatingGrade)}
                      disabled={isLocked}
                      className="border border-neutral-200 rounded-xl p-2.5 text-sm font-bold text-[#1a1a1a] bg-white w-full sm:w-auto min-w-[200px] focus:ring-2 focus:ring-[#1a1a1a] outline-none"
                    >
                      <option value="" disabled>Pilih Nilai</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                      <option value="E">E</option>
                      <option value="-">-</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
            
            {!isLocked && (
              <div className="mt-6 pt-4 border-t flex justify-end">
                <button 
                  onClick={handleSaveDraftClick}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-md text-sm font-medium transition"
                >
                  Simpan Draft Lokal
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
