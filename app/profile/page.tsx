// app/profile/page.tsx
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
  Award
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
    // ✅ ส่ง userData เข้าไปโดยตรง
    fetchData(userData);
  }, [router]);

  // ✅ แก้ไข: รับ userData เป็น parameter
  const fetchData = async (userData: any) => {
    try {
      // ✅ ตรวจสอบว่า userData มี id หรือไม่
      if (!userData || !userData.id) {
        console.error('❌ User data is invalid:', userData);
        router.push('/login');
        return;
      }

      console.log('📊 Fetching profile for user:', userData.id);
      
      const profileData = await getProfile(userData.id);
      setProfile(profileData);
      
      console.log('✅ Profile loaded:', profileData);
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      alert('เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + (error as Error).message);
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

  // แปลง gender
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

  // แสดงชื่อ Level
  const getPAMLevelName = (pamLevel: string) => {
    switch (pamLevel) {
      case 'L4':
        return { thai: 'กลุ่มแชมเปี้ยน', en: 'Champion', desc: 'PAM 80%+' };
      case 'L3':
        return { thai: 'กลุ่มรักสุขภาพ', en: 'Intensive', desc: 'PAM 41-79%' };
      case 'L2':
        return { thai: 'กลุ่มทั่วไป', en: 'General', desc: 'PAM 21-40%' };
      default:
        return { thai: 'ไม่พร้อม', en: 'Uncontrolled', desc: 'PAM 0-20%' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const age = calculateAge(profile?.birth_date);
  const gender = getGenderThai(profile?.gender);
  const weight = profile?.current_weight || 75.5;
  const height = profile?.height || 165;
  const bmi = calculateBMI(weight, height);
  const waist = profile?.waist_circumference || 92;
  const pamLevelName = getPAMLevelName(profile?.pam_level || 'L2');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-100 to-cyan-50 pb-20">
      <StarBackground />

      <div className="max-w-md mx-auto px-4 py-6">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Image
            src="/images/mascot-main.png"
            alt="Mascot"
            width={40}
            height={48}
            className="object-contain"
          />
          <div>
            <h1 className="text-2xl font-bold text-purple-800">
              โปรไฟล์นักกีฬา
            </h1>
            <p className="text-lg font-bold text-purple-700 mt-1">
              {profile?.full_name || 'ผู้ใช้'}
            </p>
            <p className="text-sm text-purple-600">
              HN: {profile?.hospital_number || 'HN-001'}
            </p>
          </div>
        </div>

        {/* PAM Level Badge */}
        <div className={`mb-4 p-4 rounded-2xl border-2 ${
          profile?.pam_level === 'L4' ? 'bg-green-100 text-green-700 border-green-300' :
          profile?.pam_level === 'L3' ? 'bg-blue-100 text-blue-700 border-blue-300' :
          profile?.pam_level === 'L2' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
          'bg-red-100 text-red-700 border-red-300'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8" />
              <div>
                <p className="text-2xl font-bold">
                  {profile?.pam_level || 'L2'}
                </p>
                <p className="text-sm font-semibold">
                  {pamLevelName.thai} ({pamLevelName.en})
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">
                {profile?.pam_score || 0}/20
              </p>
              <p className="text-xs opacity-75">
                {pamLevelName.desc}
              </p>
            </div>
          </div>
        </div>

        {/* Basic Info Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-purple-200 overflow-hidden mb-4">
          <div className="bg-gradient-to-r from-purple-400 to-pink-400 px-4 py-3">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">✨</span>
              <h2 className="text-lg font-bold text-white">ข้อมูลพื้นฐาน</h2>
              <span className="text-2xl">✨</span>
            </div>
          </div>
          
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">อายุ</p>
                <p className="text-base font-bold text-gray-800">{age} ปี</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">เพศ</p>
                <p className="text-base font-bold text-gray-800">{gender}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Scale className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">น้ำหนัก</p>
                <p className="text-base font-bold text-gray-800">{weight} kg</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Ruler className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">ส่วนสูง</p>
                <p className="text-base font-bold text-gray-800">{height} cm</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">BMI</p>
                <p className="text-base font-bold text-gray-800">{bmi}</p>
              </div>
            </div>

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

        {/* Assessment Results Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-yellow-200 overflow-hidden mb-4">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 px-4 py-3">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">✨</span>
              <h2 className="text-lg font-bold text-white">ผลการประเมิน</h2>
              <span className="text-2xl">✨</span>
            </div>
          </div>
          
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Trophy className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">PAM Level</p>
                <p className="text-base font-bold text-gray-800">
                  {profile?.pam_level || 'L2'} - {pamLevelName.thai}
                </p>
                <p className="text-xs text-gray-500">
                  {pamLevelName.en} • {pamLevelName.desc}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">PROMs Zone</p>
                <p className="text-base font-bold text-green-600">
                  {profile?.zone || 'Green Zone'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Award className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Confidence</p>
                <p className="text-base font-bold text-gray-800">8/10 ✅ ดี</p>
              </div>
            </div>

            <div className="bg-green-50 rounded-xl p-3 text-center border border-green-200">
              <p className="text-sm text-green-700 font-semibold">
                "มั่นใจมาก! วันนี้ทำได้แน่นอน"
              </p>
            </div>
          </div>
        </div>

        {/* Logout Button */}
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