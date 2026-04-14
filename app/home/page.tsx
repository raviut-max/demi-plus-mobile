// app/home/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { checkSession, getProfile, getNextAppointment, getRandomMotivationalMessage } from '@/lib/supabase/queries';
import { StarBackground } from '@/components/star-background';
import Image from 'next/image';
import { Calendar, TrendingUp, Target, BookOpen, MessageCircle } from 'lucide-react';

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [appointment, setAppointment] = useState<any>(null);
  const [motivationalMessage, setMotivationalMessage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // =====================================================
  // 🔍 DEBUG: useEffect - เริ่มต้นระบบ
  // =====================================================
  useEffect(() => {
    console.log('🏠 [HomePage] Component mounted');
    
    const userData = checkSession();
    console.log('🔐 [HomePage] Session check:', userData ? 'Valid' : 'Invalid');
    
    if (!userData) {
      console.log('⚠️ [HomePage] No session, redirecting to login');
      router.push('/login');
      return;
    }
    
    console.log('📋 [HomePage] User data:', {
      id: userData.id,
      pam_level: userData.pam_level,
      full_name: userData.full_name_th
    });
    
    setUser(userData);
    fetchData(userData);
  }, [router]);

  // =====================================================
  // 🔍 DEBUG: fetchData - โหลดข้อมูลทั้งหมด
  // =====================================================
  const fetchData = async (userData: any) => {
    console.log('🔄 [HomePage] Starting data fetch...');
    
    try {
      console.log('📦 [HomePage] Step 1: Loading profile...');
      const profileData = await getProfile(userData.id);
      console.log('✅ [HomePage] Profile loaded:', {
        id: profileData?.id,
        full_name: profileData?.full_name,
        pam_level: profileData?.pam_level,
        zone: profileData?.zone
      });
      
      console.log('📦 [HomePage] Step 2: Loading appointment...');
      const appointmentData = await getNextAppointment(userData.id);
      console.log('✅ [HomePage] Appointment:', appointmentData ? 'Found' : 'Not found');
      
      console.log('📦 [HomePage] Step 3: Loading motivational message...');
      console.log('🎯 [HomePage] PAM Level for message:', profileData?.pam_level || 'L2');
      const messageData = await getRandomMotivationalMessage(
        profileData?.pam_level || 'L2',
        userData.id
      );
      console.log('✅ [HomePage] Motivational message:', messageData ? 'Found' : 'Not found');
      if (messageData) {
        console.log('💬 [HomePage] Message text:', messageData.message_text);
      }
      
      setProfile(profileData);
      setAppointment(appointmentData);
      setMotivationalMessage(messageData);
      
      console.log('🎉 [HomePage] All data loaded successfully!');
    } catch (error) {
      console.error('❌ [HomePage] Error fetching data:', error);
    } finally {
      setLoading(false);
      console.log('✅ [HomePage] Loading complete');
    }
  };

  // =====================================================
  // 🔄 แสดงหน้าโหลด
  // =====================================================
  if (loading) {
    console.log('⏳ [HomePage] Showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // =====================================================
  // 🎨 แสดงหน้าหลัก
  // =====================================================
  console.log('🎨 [HomePage] Rendering with data:', {
    profile: profile?.full_name,
    pam_level: profile?.pam_level,
    has_message: !!motivationalMessage
  });

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

  const getZoneColor = (zone: string) => {
    switch (zone) {
      case 'Green Zone':
        return 'bg-green-100 text-green-700';
      case 'Yellow Zone':
        return 'bg-yellow-100 text-yellow-700';
      case 'Red Zone':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-green-100 text-green-700';
    }
  };

  const getPamLevelName = (level: string) => {
    switch (level) {
      case 'L4': return 'Champion';
      case 'L3': return 'Intensive';
      case 'L2': return 'General';
      default: return 'General';
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      
      {/* =====================================================
          Header - แสดงชื่อผู้ป่วยและ PAM Level
          ===================================================== */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          {/* ✅ แสดงชื่อผู้ป่วยจริง */}
          <h1 className="text-xl font-bold text-gray-800">
            {profile?.full_name || 'ผู้ใช้'}
          </h1>
          {/* ✅ แสดง Zone */}
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getZoneColor(profile?.zone || 'Green Zone')}`}>
            {profile?.zone || 'Green Zone'}
          </span>
        </div>
        
        {/* ✅ แสดง PAM Level และ Step */}
        <p className="text-sm text-gray-600">
          นักกีฬาเบาหวาน {getPamLevelName(profile?.pam_level || 'L2')} | {profile?.current_step || 'Starter'}
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
          ✅ Motivation Message - ข้อความสุ่มกระตุ้น (แก้ไขแล้ว)
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
                  📋 หมวด: {
                    motivationalMessage.category === 'food' ? 'อาหาร' :
                    motivationalMessage.category === 'exercise' ? 'ออกกำลังกาย' :
                    motivationalMessage.category === 'health' ? 'สุขภาพ' : 'ทั่วไป'
                  }
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
              <p className="text-xs text-gray-500 mt-1">
                ⚠️ ข้อความเริ่มต้น (ยังไม่มีข้อมูล)
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