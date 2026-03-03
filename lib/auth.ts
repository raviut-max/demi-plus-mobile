'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { checkSession } from '@/lib/supabase/queries';

export function useAuth() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // หน้าที่ไม่ต้อง Login
    const publicPages = ['/login'];

    if (publicPages.includes(pathname)) {
      return;
    }

    // ตรวจสอบ Session
    const user = checkSession();

    if (!user) {
      router.push('/login');
    }
  }, [pathname, router]);

  return checkSession();
}