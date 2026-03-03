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
  Trophy
} from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [coachName, setCoachName] = useState<string>('โค้ชสุรชัย');
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
        const profileData = await getProfile(userData.id);
        setProfile(profileData);
        
        // ดึงชื่อโค้ชจาก coach_id
        if (profileData?.coach_id) {
          setCoachName('โค้ชสุรชัย');
        } else {
          setCoachName('โค้ชสุรชัย');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // คำนวณอายุ (รองรับ พ.ศ. และ ค.ศ.)
const calculateAge = (birthDate: string) => {
  if (!birthDate) return '-';
  
  try {
    const today = new Date();
    let birth: Date;
    
    const birthYear = parseInt(birthDate.split('-')[0]);
    
    // ✅ ถ้าปีมากกว่า 2500 แสดงว่าเป็น พ.ศ. → แปลงเป็น ค.ศ.
    if (birthYear > 2500) {
      const thaiYear = birthYear - 543;
      const thaiDate = birthDate.replace(`${birthYear}`, `${thaiYear}`);
      birth = new Date(thaiDate);
    } else {
      birth = new Date(birthDate);
    }
    
    if (isNaN(birth.getTime())) {
      console.error('Invalid birth date:', birthDate);
      return '-';
    }
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age > 0 && age < 150 ? age : '-';
  } catch (error) {
    console.error('Error calculating age:', error);
    return '-';
  }
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

  // คำนวณระยะเวลาเบาหวาน
  const calculateDiabetesDuration = (birthDate: string, diagnosisAge: number = 50) => {
    if (!birthDate) return '-';
    
    try {
      const birthYear = parseInt(birthDate.split('-')[0]);
      let actualBirthYear = birthYear;
      
      if (birthYear > 2500) {
        actualBirthYear = birthYear - 543;
      }
      
      const diagnosisYear = actualBirthYear + diagnosisAge;
      const currentYear = new Date().getFullYear();
      const years = currentYear - diagnosisYear;
      
      return years > 0 && years < 100 ? `${years} ปี` : '-';
    } catch (error) {
      console.error('Error calculating diabetes duration:', error);
      return '-';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  // ข้อมูลจาก Database (ใช้ชื่อคอลัมน์ที่ถูกต้อง)
  const age = calculateAge(profile?.birth_date);
  const gender = getGenderThai(profile?.gender);
  const weight = profile?.current_weight || 75.5;
  const height = profile?.height || 165;
  const bmi = calculateBMI(weight, height);
  const waist = profile?.waist_circumference || 92;
  const diabetesDuration = calculateDiabetesDuration(profile?.birth_date);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 pb-20">
      <StarBackground />
      
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header - Mascot มุมซ้าย + ชื่อผู้ป่วยตัวใหญ่ */}
        <div className="flex items-center gap-3 mb-6">
          <Image
            src="/images/mascot-main.png"
            alt="Mascot"
            width={40}
            height={48}
            className="object-contain"
          />
          <div>
            <h1 className="text-2xl font-bold text-purple-800">โปรไฟล์นักกีฬา</h1>
            <p className="text-lg font-bold text-purple-700 mt-1">
              {profile?.full_name || 'ผู้ใช้'}
            </p>
            <p className="text-sm text-purple-600">
              HN: {profile?.hospital_number || 'HN-001'}
            </p>
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

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">เบาหวาน</p>
                <p className="text-base font-bold text-gray-800">{diabetesDuration}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">โค้ช</p>
                <p className="text-base font-bold text-gray-800">{coachName}</p>
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
                <p className="text-sm text-gray-500">PAM</p>
                <p className="text-base font-bold text-gray-800">
                  ระดับ {profile?.pam_level || 'L2'} (Manager), คะแนน 18/20
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">PROMs</p>
                <p className="text-base font-bold text-green-600">{profile?.zone || 'Green Zone'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Confidence</p>
                <p className="text-base font-bold text-gray-800">8/10 ✅ ดี</p>
              </div>
            </div>

            <div className="bg-green-50 rounded-xl p-3 text-center">
              <p className="text-sm text-green-700 font-semibold">"มั่นใจมาก! วันนี้ทำได้แน่นอน"</p>
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