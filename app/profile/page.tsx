// =====================================================
// ไฟล์: app/profile/page.tsx
// หน้าโปรไฟล์ผู้ป่วย (Profile Page)
// =====================================================
// ฟีเจอร์:
// - แสดงชื่อผู้ป่วยชัดเจน
// - แสดง PAM Level (L2/L3/L4) พร้อมชื่อไทย
// - แสดง Zone และ Confidence
// - แสดงข้อมูลสุขภาพครบถ้วน
// =====================================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { checkSession, getProfile, logout } from '@/lib/supabase/queries';
import { StarBackground } from '@/components/star-background';
import Image from 'next/image';
import {
  Calendar,
  User,
  Scale,
  Ruler,
  Activity,
  Heart,
  Target,
  LogOut,
  Trophy,
  Award,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userData = checkSession();
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(userData);
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const profileData = await getProfile(user.id);
      setProfile(profileData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // คำนวณอายุ
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return '-';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age > 0 && age < 150 ? age : '-';
  };

  // แปลง gender เป็นภาษาไทย
  const getGenderThai = (gender: string) => {
    if (!gender) return '-';
    if (gender === 'male') return 'ชาย';
    if (gender === 'female') return 'หญิง';
    return 'อื่นๆ';
  };

  // คำนวณ BMI
  const calculateBMI = (weight: number, height: number) => {
    if (!weight || !height) return '-';
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  // ✅ แสดงชื่อ Level ตาม PAM Level ที่ถูกต้อง
  const getPAMLevelInfo = (pamLevel: string) => {
    switch (pamLevel) {
      case 'L4':
        return { 
          thai: 'กลุ่มแชมเปี้ยน', 
          en: 'Champion', 
          desc: 'PAM 80%+',
          color: 'bg-green-100 text-green-700 border-green-300',
          icon: '🏆'
        };
      case 'L3':
        return { 
          thai: 'กลุ่มรักสุขภาพ', 
          en: 'Intensive', 
          desc: 'PAM 41-79%',
          color: 'bg-blue-100 text-blue-700 border-blue-300',
          icon: '💪'
        };
      case 'L2':
        return { 
          thai: 'กลุ่มทั่วไป', 
          en: 'General', 
          desc: 'PAM 21-40%',
          color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
          icon: '📊'
        };
      default:
        return { 
          thai: 'ไม่พร้อม', 
          en: 'Uncontrolled', 
          desc: 'PAM 0-20%',
          color: 'bg-red-100 text-red-700 border-red-300',
          icon: '⚠️'
        };
    }
  };

  // ✅ แสดงชื่อ Zone
  const getZoneInfo = (zone: string) => {
    switch (zone) {
      case 'Green Zone':
        return { color: 'bg-green-100 text-green-700', icon: '💚' };
      case 'Yellow Zone':
        return { color: 'bg-yellow-100 text-yellow-700', icon: '💛' };
      case 'Red Zone':
        return { color: 'bg-red-100 text-red-700', icon: '❤️' };
      default:
        return { color: 'bg-gray-100 text-gray-700', icon: '🤍' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // ข้อมูลจาก Database
  const age = calculateAge(profile?.birth_date);
  const gender = getGenderThai(profile?.gender);
  const weight = profile?.current_weight || 75.5;
  const height = profile?.height || 165;
  const bmi = calculateBMI(weight, height);
  const waist = profile?.waist_circumference || 92;
  const pamLevelInfo = getPAMLevelInfo(profile?.pam_level || 'L2');
  const zoneInfo = getZoneInfo(profile?.zone || 'Green Zone');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-100 to-cyan-50 pb-20">
      <StarBackground />

      <div className="max-w-md mx-auto px-4 py-6">
        
        {/* =====================================================
            Header - แสดงชื่อผู้ป่วยชัดเจน
            ===================================================== */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Image
              src="/images/mascot-main.png"
              alt="Mascot"
              width={48}
              height={48}
              className="object-contain"
            />
            <div>
              {/* ✅ ชื่อผู้ป่วย - ตัวใหญ่ชัดเจน */}
              <h1 className="text-2xl font-bold text-purple-800">
                {profile?.full_name || 'ผู้ใช้'}
              </h1>
              {/* ✅ HN - เล็กกว่า */}
              <p className="text-sm text-purple-600 font-medium">
                HN: {profile?.hospital_number || 'HN-001'}
              </p>
            </div>
          </div>
          
          {/* ✅ ปุ่ม Logout */}
          <button
            onClick={handleLogout}
            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
            title="ออกจากระบบ"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* =====================================================
            PAM Level Badge - แสดงชัดเจนด้านบน
            ===================================================== */}
        <div className={`mb-4 p-4 rounded-2xl border-2 ${pamLevelInfo.color}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{pamLevelInfo.icon}</span>
              <div>
                {/* ✅ PAM Level Code (L2/L3/L4) */}
                <p className="text-2xl font-bold">
                  {profile?.pam_level || 'L2'}
                </p>
                {/* ✅ PAM Level Name (ไทย + อังกฤษ) */}
                <p className="text-sm font-semibold">
                  {pamLevelInfo.thai} ({pamLevelInfo.en})
                </p>
              </div>
            </div>
            <div className="text-right">
              {/* ✅ PAM Score */}
              <p className="text-lg font-bold">
                {profile?.pam_score || 0}/20
              </p>
              <p className="text-xs opacity-75">
                {pamLevelInfo.desc}
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            ข้อมูลพื้นฐาน Card
            ===================================================== */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-purple-200 overflow-hidden mb-4">
          <div className="bg-gradient-to-r from-purple-400 to-pink-400 px-4 py-3">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">✨</span>
              <h2 className="text-lg font-bold text-white">ข้อมูลพื้นฐาน</h2>
              <span className="text-2xl">✨</span>
            </div>
          </div>
          
          <div className="p-4 space-y-3">
            {/* อายุ */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">อายุ</p>
                <p className="text-base font-bold text-gray-800">{age} ปี</p>
              </div>
            </div>

            {/* เพศ */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">เพศ</p>
                <p className="text-base font-bold text-gray-800">{gender}</p>
              </div>
            </div>

            {/* น้ำหนัก */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Scale className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">น้ำหนัก</p>
                <p className="text-base font-bold text-gray-800">{weight} kg</p>
              </div>
            </div>

            {/* ส่วนสูง */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Ruler className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">ส่วนสูง</p>
                <p className="text-base font-bold text-gray-800">{height} cm</p>
              </div>
            </div>

            {/* BMI */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">BMI</p>
                <p className="text-base font-bold text-gray-800">{bmi}</p>
              </div>
            </div>

            {/* รอบเอว */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Target className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">รอบเอว</p>
                <p className="text-base font-bold text-gray-800">{waist} ซม.</p>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            ผลการประเมิน Card - แสดง PAM และ Zone ชัดเจน
            ===================================================== */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-yellow-200 overflow-hidden mb-4">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 px-4 py-3">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">✨</span>
              <h2 className="text-lg font-bold text-white">ผลการประเมิน</h2>
              <span className="text-2xl">✨</span>
            </div>
          </div>
          
          <div className="p-4 space-y-3">
            {/* ✅ PAM Level - แสดงชัดเจน */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">PAM Level</p>
                {/* ✅ แสดง L2/L3/L4 + ชื่อไทย + ชื่ออังกฤษ */}
                <p className="text-lg font-bold text-gray-800">
                  {profile?.pam_level || 'L2'} - {pamLevelInfo.thai}
                </p>
                <p className="text-xs text-gray-500">
                  {pamLevelInfo.en} • {pamLevelInfo.desc}
                </p>
              </div>
              <div className={`px-3 py-2 rounded-full text-sm font-bold ${pamLevelInfo.color}`}>
                {pamLevelInfo.icon}
              </div>
            </div>

            {/* ✅ PROMs Zone - แสดงชัดเจน */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">PROMs Zone</p>
                <p className="text-lg font-bold text-gray-800">
                  {profile?.zone || 'Green Zone'}
                </p>
              </div>
              <div className={`px-3 py-2 rounded-full text-sm font-bold ${zoneInfo.color}`}>
                {zoneInfo.icon}
              </div>
            </div>

            {/* Confidence */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">Confidence</p>
                <p className="text-lg font-bold text-gray-800">8/10 ✅ ดี</p>
              </div>
            </div>

            {/* Quote */}
            <div className="bg-green-50 rounded-xl p-3 text-center border border-green-200">
              <p className="text-sm text-green-700 font-semibold">
                "มั่นใจมาก! วันนี้ทำได้แน่นอน"
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            ข้อมูลเพิ่มเติม (ถ้ามี)
            ===================================================== */}
        {(profile?.phone || profile?.email || profile?.subdistrict) && (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-blue-200 overflow-hidden mb-4">
            <div className="bg-gradient-to-r from-blue-400 to-cyan-400 px-4 py-3">
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">📍</span>
                <h2 className="text-lg font-bold text-white">ข้อมูลติดต่อ</h2>
                <span className="text-2xl">📍</span>
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              {profile?.phone && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">เบอร์โทรศัพท์</p>
                    <p className="text-base font-bold text-gray-800">{profile.phone}</p>
                  </div>
                </div>
              )}
              
              {profile?.email && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">อีเมล</p>
                    <p className="text-base font-bold text-gray-800">{profile.email}</p>
                  </div>
                </div>
              )}
              
              {profile?.subdistrict && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">ที่อยู่</p>
                    <p className="text-base font-bold text-gray-800">
                      {profile.subdistrict}, {profile.district}, {profile.province}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =====================================================
            Logout Button - ขนาดใหญ่ชัดเจน
            ===================================================== */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold rounded-2xl hover:from-red-600 hover:to-pink-700 transition-all shadow-lg"
        >
          <LogOut className="w-5 h-5" />
          ออกจากระบบ
        </button>
      </div>
    </div>
  );
}