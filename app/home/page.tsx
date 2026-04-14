// app/home/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { checkSession, getProfile, getNextAppointment, getRandomMotivationalMessage } from '@/lib/supabase/queries';
import { StarBackground } from '@/components/star-background';
import Image from 'next/image';
import { Calendar, TrendingUp, Target, BookOpen, MessageCircle } from 'lucide-react';

// =====================================================
// ข้อมูลเมนูหลัก
// =====================================================
const menuItems = [
  {
    icon: <Calendar className="w-8 h-8 text-yellow-600" />,
    title: 'บันทึกรายวัน',
    subtitle: 'ทำตามกฎทอง 5 ข้อ',
    color: 'bg-yellow-50',
    link: '/record',
  },
  {
    icon: <TrendingUp className="w-8 h-8 text-blue-600" />,
    title: 'ดูความคืบหน้า',
    subtitle: 'ผลลัพธ์ 7 วันล่าสุด',
    color: 'bg-blue-50',
    link: '/progress',
  },
  {
    icon: <Target className="w-8 h-8 text-green-600" />,
    title: 'เป้าหมายของฉัน',
    subtitle: 'สัปดาห์นี้ & ระยะยาว',
    color: 'bg-green-50',
    link: '/goals',
  },
  {
    icon: <BookOpen className="w-8 h-8 text-purple-600" />,
    title: 'ความรู้สำหรับนักกีฬา',
    subtitle: 'เคล็ดลับง่ายๆ ทุกวัน',
    color: 'bg-purple-50',
    link: '/knowledge',
  },
];

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [appointment, setAppointment] = useState(null);
  const [motivationalMessage, setMotivationalMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // =====================================================
  // 🔍 โหลดข้อมูลเมื่อเปิดหน้า
  // =====================================================
  useEffect(() => {
    const userData = checkSession();
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(userData);
    fetchData(userData);
  }, [router]);

  // =====================================================
  // 📦 ฟังก์ชันโหลดข้อมูลทั้งหมด
  // =====================================================
  const fetchData = async (userData: any) => {
    try {
      console.log('🏠 [HomePage] Fetching data for user:', userData.id);
      
      const [profileData, appointmentData, messageData] = await Promise.all([
        getProfile(userData.id),
        getNextAppointment(userData.id),
        getRandomMotivationalMessage(userData.pam_level || 'L2')
      ]);
      
      setProfile(profileData);
      setAppointment(appointmentData);
      setMotivationalMessage(messageData);
      
      console.log('✅ [HomePage] Data loaded:', {
        profile: profileData?.full_name,
        appointment: appointmentData ? 'Has appointment' : 'No appointment',
        message: messageData?.message_text?.substring(0, 50) + '...'
      });
    } catch (error) {
      console.error('❌ [HomePage] Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // 🎨 แสดงหน้าโหลด
  // =====================================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // =====================================================
  // 🎨 แสดงหน้าหลัก
  // =====================================================
  return (
    <div className="max-w-md mx-auto px-4 py-6">
      
      {/* =====================================================
          Header - แสดงข้อมูลผู้ป่วย
          ===================================================== */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-xl font-bold text-gray-800">{profile?.full_name || 'ผู้ใช้'}</h1>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            profile?.zone === 'Green Zone' ? 'bg-green-100 text-green-700' :
            profile?.zone === 'Yellow Zone' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {profile?.zone || 'Green Zone'}
          </span>
        </div>
        <p className="text-sm text-gray-600">
          นักกีฬาเบาหวาน {profile?.pam_level === 'L4' ? 'Champion' : profile?.pam_level || 'L2'} | {profile?.current_step || 'Starter'}
        </p>
        <p className="text-sm text-gray-500 mt-1">สุขภาพดี ควบคุมได้นั้น!</p>
      </div>

      {/* =====================================================
          Menu Grid - เมนูหลัก 4 รายการ
          ===================================================== */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => router.push(item.link)}
            className={`${item.color} rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all active:scale-95`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-2">{item.icon}</div>
              <p className="text-sm font-bold text-gray-800 mb-1">{item.title}</p>
              <p className="text-xs text-gray-600">{item.subtitle}</p>
            </div>
          </button>
        ))}
      </div>

      {/* =====================================================
          Appointment Card - นัดหมาย
          ===================================================== */}
      {appointment ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-800">
                นัดพบกับ{appointment.doctors?.full_name_th || 'โค้ช'}
              </p>
              <p className="text-xs text-gray-600">
                {new Date(appointment.appointment_date).toLocaleDateString('th-TH', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}{' '}
                เวลา{' '}
                {new Date(appointment.appointment_date).toLocaleTimeString('th-TH', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-800">ยังไม่มีนัดหมาย</p>
              <p className="text-xs text-gray-600">โค้ชจะติดต่อเพื่อนัดหมายเร็วๆ นี้</p>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          ✅ Motivation Message - ข้อความสุ่มกระตุ้น (ใหม่)
          ===================================================== */}
      {motivationalMessage ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-xl">✨</span>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700">
                {motivationalMessage.message_text}
              </p>
              {motivationalMessage.category && (
                <p className="text-xs text-gray-500 mt-1">
                  📋 หมวด: {motivationalMessage.category === 'food' ? 'อาหาร' : 
                             motivationalMessage.category === 'exercise' ? 'ออกกำลังกาย' :
                             motivationalMessage.category === 'health' ? 'สุขภาพ' : 'ทั่วไป'}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-xl">✨</span>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700">
                คุณทำได้ดีมาก! วันนี้ลองเพิ่มผัก 1 จาน ได้ไหม?
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          Footer - โลโก้
          ===================================================== */}
      <div className="text-center mt-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Image
            src="/images/mascot-main.png"
            alt="Mascot"
            width={48}
            height={48}
            className="object-contain"
          />
          <Image
            src="/images/logo-full.png"
            alt="DeMi+ Logo"
            width={80}
            height={40}
            className="object-contain"
          />
        </div>
        <p className="text-xs text-gray-500">Development for Mind & health</p>
      </div>

      {/* =====================================================
          Bottom Navigation - เมนูด้านล่าง
          ===================================================== */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200">
        <div className="max-w-md mx-auto px-4 py-2">
          <div className="flex justify-around">
            <NavItem icon="🏠" label="หน้าหลัก" active link="/home" />
            <NavItem icon="📝" label="บันทึก" link="/record" />
            <NavItem icon="📊" label="ความคืบหน้า" link="/progress" />
            <NavItem icon="🎯" label="เป้าหมาย" link="/goals" />
            <NavItem icon="👤" label="โปรไฟล์" link="/profile" />
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// 🧭 Bottom Navigation Item
// =====================================================
function NavItem({ icon, label, active = false, link }: { icon: string; label: string; active?: boolean; link: string }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(link)}
      className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all ${
        active ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
}