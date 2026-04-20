import { redirect } from 'next/navigation';

export default function HomePage() {
  // Directly point the root path to /penilaian
  redirect('/penilaian');
}
