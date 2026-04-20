'use client';

import React from 'react';
import { User } from '@/lib/types';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  currentUser: User | null;
}

export function Header({ currentUser }: HeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    // Calling the logout API if implemented, or just removing the token
    await fetch('/api/auth/logout', { method: 'POST' });
    // In a real scenario we could remove cookies directly if they are not httpOnly,
    // but httpOnly requires server action or API route to clear.
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="bg-white border-b border-neutral-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-primary">Penilaian Karyawan</h1>
          <span className="text-xs text-neutral-500 font-medium">Easy Going Group</span>
        </div>

        {/* User Info and Logout */}
        {currentUser && (
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center text-sm font-medium text-neutral-700 bg-neutral-100 rounded-full px-3 py-1">
              <UserIcon className="w-4 h-4 mr-2 text-neutral-500" />
              <span>{currentUser.name}</span>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center justify-center p-2 text-neutral-500 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
              <span className="sr-only">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
