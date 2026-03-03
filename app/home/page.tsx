'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { checkSession, getProfile, getNextAppointment } from '@/lib/supabase/queries';
import Link from 'next/link';

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userData = checkSession();
    if (!userData) {
      router.push('/login');
      return;
    }

    setUser(userData);

    const fetchData = async () => {
      try {
        const [profileData, appointmentData] = await Promise.all([
          getProfile(userData.id),
          getNextAppointment(userData.id)
        ]);

        setProfile(profileData);
        setAppointment(appointmentData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-sky-100 to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-100 to-cyan-50 pb-20">
      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-blue-800">
                {profile?.full_name || user?.full_name_th || 'ผู้ใช้'}
              </h1>
              <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                <span>🛡️</span>
                <span>Green Zone</span>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {profile?.pam_level ? `นักกีฬาเบาหวาน ${profile.pam_level}` : 'L2'} 
              {profile?.current_step && ` | ${profile.current_step}`}
            </p>
          </div>
        </div>

        {/* Green Zone Description */}
        <p className="text-xs text-gray-600 text-center -mt-2">สุขภาพดี ควบคุมได้ดีมาก!</p>

        {/* Menu Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/record" className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/50 hover:shadow-xl transition-shadow text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">📝</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1 text-sm">บันทึกรายวัน</h3>
            <p className="text-xs text-gray-500">ทำตามกฎทอง 5 ข้อ</p>
          </Link>

          <Link href="/progress" className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/50 hover:shadow-xl transition-shadow text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1 text-sm">ดูความคืบหน้า</h3>
            <p className="text-xs text-gray-500">ผลลัพธ์ 7 วันล่าสุด</p>
          </Link>

          <Link href="/goals" className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/50 hover:shadow-xl transition-shadow text-center">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1 text-sm">เป้าหมายของฉัน</h3>
            <p className="text-xs text-gray-500">สัปดาห์นี้ & ระยะยาว</p>
          </Link>

          <Link href="/knowledge" className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/50 hover:shadow-xl transition-shadow text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">📚</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1 text-sm">ความรู้สำหรับนักกีฬา</h3>
            <p className="text-xs text-gray-500">เคล็ดลับง่ายๆ ทุกวัน</p>
          </Link>
        </div>

        {/* Appointment Banner */}
        {appointment ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 shadow-lg border border-white/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-lg">📅</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  นัดพบ{appointment.doctors?.full_name_th || 'โค้ช'}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(appointment.appointment_date).toLocaleDateString('th-TH', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}{' '}
                  เวลา {new Date(appointment.appointment_date).toLocaleTimeString('th-TH', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 shadow-lg border border-white/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-lg">📅</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">นัดพบโค้ชสมชาย</p>
                <p className="text-xs text-gray-500">15 มี.ค. 2569 เวลา 10:00</p>
              </div>
            </div>
          </div>
        )}

        {/* Motivation Message */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 shadow-lg border border-white/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lg">✨</span>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700">คุณทำได้ดีมาก! วันนี้ลองเพิ่มผัก 1 จาน ได้ไหม?</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-4 pb-4">
          <div className="flex items-center justify-center gap-3">
            <img
              src="/images/mascot-main.png"
              alt="DeMi+ Mascot"
              className="w-20 h-20 object-contain"
            />
            <img
              src="/images/logo-full.png"
              alt="DeMi+ Logo"
              className="h-14 w-auto"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">Development for Mind & health</p>
        </div>
      </div>
    </div>
  );
}