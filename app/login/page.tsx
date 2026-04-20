'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Lock, User, ChevronDown } from 'lucide-react';
import { VALID_CREDENTIALS } from '@/lib/utils/constants';

export default function LoginPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Array<{ id: string; name: string; outlet: string }>>([]);
  const [selectedUsername, setSelectedUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await fetch('/api/sheets/master-list');
        const data = await res.json();
        if (data.success && data.data) {
          // Hanya ambil karyawan yang memiliki kredensial valid (Manager & Supervisor)
          const validUsers = data.data.filter((emp: any) => 
            Object.keys(VALID_CREDENTIALS).includes(emp.id)
          );
          
          // Tambahkan akun admin secara manual jika belum ada di masterlist
          if (!validUsers.find((u: any) => u.id === 'admin.media@easygoing.id')) {
            validUsers.push({
              id: 'admin.media@easygoing.id',
              name: 'Admin Media',
              outlet: 'BTM'
            });
          }

          setEmployees(validUsers);
        }
      } catch (err) {
        console.error('Failed to load users:', err);
      } finally {
        setFetchingUsers(false);
      }
    }
    loadUsers();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUsername) {
      setError('Silakan pilih Pengguna terlebih dahulu.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: selectedUsername, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push('/penilaian');
        router.refresh();
      } else {
        setError(data.message || 'Gagal login. Periksa password.');
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi server. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e8ecf1] relative flex items-center justify-center p-4 sm:p-8 font-sans overflow-hidden">
      
      {/* Decorative blurred backgrounds to mimic glassmorphism backdrop */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-white/40 blur-3xl rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-neutral-200/50 blur-3xl rounded-full pointer-events-none"></div>

      <div className="max-w-md w-full relative z-10">
        
        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-white/50 p-8 sm:p-10">
          
          <div className="text-center mb-10">
            <div className="mx-auto w-16 h-16 bg-[#1a1a1a] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-neutral-900/20 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#1a1a1a] mb-2">Login ERS</h1>
            <p className="text-neutral-500 font-medium text-sm">Masuk untuk memulai penilaian</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-800" htmlFor="username">
                Pilih Pengguna
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-neutral-400" />
                </div>
                
                {fetchingUsers ? (
                  <div className="pl-12 w-full px-4 py-3.5 bg-white/60 border border-neutral-200 rounded-2xl text-sm text-neutral-400 flex items-center shadow-inner">
                    <span className="w-4 h-4 mr-2 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin"></span>
                    Memuat data pengguna...
                  </div>
                ) : (
                  <>
                    <select
                      id="username"
                      required
                      value={selectedUsername}
                      onChange={(e) => setSelectedUsername(e.target.value)}
                      className="pl-12 pr-10 w-full px-4 py-3.5 bg-white border border-neutral-200 rounded-2xl text-sm font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#1a1a1a] focus:border-[#1a1a1a] transition-all duration-200 appearance-none shadow-sm cursor-pointer"
                    >
                      <option value="" disabled>-- Pilih Akun Anda --</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} ({emp.outlet} - {emp.id})
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <ChevronDown className="h-5 w-5 text-neutral-400" />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-800" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 w-full px-4 py-3.5 bg-white border border-neutral-200 rounded-2xl text-sm font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#1a1a1a] focus:border-[#1a1a1a] transition-all duration-200 shadow-sm"
                  placeholder="Masukkan Password"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl border border-red-100 flex items-start animate-fade-in">
                <span className="mr-2">🚨</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || fetchingUsers || !selectedUsername}
              className="w-full flex justify-center items-center py-4 rounded-2xl shadow-[0_8px_20px_-8px_rgba(0,0,0,0.5)] text-sm font-bold text-white bg-[#1a1a1a] hover:bg-black hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 mt-8"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 mr-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Memverifikasi...
                </>
              ) : (
                'Masuk ke Sistem'
              )}
            </button>
          </form>
          
        </div>
      </div>
    </div>
  );
}
