// app/record/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { checkSession, getProfile, getActivities, saveRecord, getTodayRecords, saveDailyNote, getDailyNote } from '@/lib/supabase/queries';
import { StarBackground } from '@/components/star-background';
import Image from 'next/image';

const sweetOptions = [
  { value: 'ผลไม้หวาน', label: '🍈 ผลไม้หวาน', icon: '🍈' },
  { value: 'ปรุงเติมน้ำตาล', label: '🍜 ปรุง เติมน้ำตาล เช่น ก๋วยเตี๋ยว', icon: '🍜' },
  { value: 'กับข้าวหวาน', label: '🍳 กับข้าวหวานๆ เช่น ไข่ลูกเขย หมูหวาน', icon: '🍳' },
  { value: 'น้ำหวาน', label: '🥤 น้ำหวาน ชา กาแฟ น้ำอัดลม', icon: '🥤' },
  { value: 'ขนมไทย', label: '🍮 ขนมไทย', icon: '🍮' },
  { value: 'ขนมฝรั่ง', label: '🍰 ขนมฝรั่ง เบเกอรี่ เค้ก', icon: '🍰' },
  { value: 'อื่นๆ', label: '🍪 อื่นๆ', icon: '🍪' },
];

interface Activity {
  id: string;
  activity_code: string;
  activity_name_th: string;
  description_th: string | null;
  activity_type: string;
  pam_level: string;
  is_completed: boolean;
  record_id?: string;
  weight?: number;
  blood_sugar?: number;
  sweet_type?: string[];
  exercise_minutes?: number;
  target_minutes?: number;
}

export default function RecordPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showWeightForm, setShowWeightForm] = useState(false);
  const [showSweetForm, setShowSweetForm] = useState(false);
  const [showExerciseForm, setShowExerciseForm] = useState(false);

  // Form States
  const [selectedSweets, setSelectedSweets] = useState<string[]>([]);
  const [weight, setWeight] = useState('');
  const [bloodSugar, setBloodSugar] = useState('');

  // Exercise Form States
  const [selectedExerciseType, setSelectedExerciseType] = useState('');
  const [exerciseMinutes, setExerciseMinutes] = useState('');
  const [currentExerciseActivity, setCurrentExerciseActivity] = useState<Activity | null>(null);

  // Daily Note States
  const [dailyNote, setDailyNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

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

      console.log('📊 Fetching data for user:', userData.id);
      console.log('📊 User PAM Level:', userData.pam_level);

      const [profileData, activitiesData, recordsData] = await Promise.all([
        getProfile(userData.id),
        getActivities(userData.pam_level || 'L2'),
        getTodayRecords(userData.id)
      ]);

      setProfile(profileData);

      const activitiesWithRecords = activitiesData.map((activity: any) => {
        const existingRecord = recordsData.find((r: any) => r.activity_id === activity.id);
        return {
          ...activity,
          is_completed: existingRecord?.is_completed ?? false,
          record_id: existingRecord?.id,
          weight: existingRecord?.weight,
          blood_sugar: existingRecord?.blood_sugar,
          sweet_type: existingRecord?.sweet_type ?? [],
          exercise_minutes: existingRecord?.exercise_minutes,
          target_minutes: activity.activity_type === 'exercise' ? (activity.target_value || 30) : undefined,
        };
      });

      setActivities(activitiesWithRecords);

      // โหลดหมายเหตุรายวัน
      const noteData = await getDailyNote(userData.id);
      if (noteData?.note_text) {
        setDailyNote(noteData.note_text);
      }

      console.log('✅ Data loaded successfully');
      console.log('📋 Activities count:', activitiesWithRecords.length);
      console.log('📋 Activity codes:', activitiesWithRecords.map(a => a.activity_code));
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      alert('เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const toggleActivity = async (id: string) => {
    if (!user || !user.id) {
      alert('กรุณาเข้าสู่ระบบอีกครั้ง');
      router.push('/login');
      return;
    }

    setActivities((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const newCompleted = !a.is_completed;

          // น้ำหนักและน้ำตาล
          if (a.activity_code === 'record_weight_sugar' && newCompleted) {
            setShowWeightForm(true);
            return { ...a, is_completed: false };
          }

          // ความหวาน
          if (a.activity_code === 'stop_sweet') {
            if (!newCompleted) {
              setShowSweetForm(true);
              return { ...a, is_completed: true };
            }
            if (newCompleted && user) {
              saveRecord({
                user_id: user.id,
                activity_id: id,
                record_date: new Date().toISOString().split('T')[0],
                is_completed: true,
                sweet_type: [],
              });
              return { ...a, is_completed: true, sweet_type: [] };
            }
          }

          // ออกกำลังกาย - เปิดฟอร์ม
          if (a.activity_type === 'exercise' && newCompleted) {
            setCurrentExerciseActivity(a);
            setSelectedExerciseType('');
            setExerciseMinutes(a.exercise_minutes?.toString() || '');
            setShowExerciseForm(true);
            return { ...a, is_completed: false };
          }

          // กิจกรรมทั่วไป
          if (user && newCompleted) {
            saveRecord({
              user_id: user.id,
              activity_id: id,
              record_date: new Date().toISOString().split('T')[0],
              is_completed: true,
            });
          }

          return { ...a, is_completed: newCompleted };
        }
        return a;
      })
    );
  };

  // ... (ฟังก์ชัน handleOpenSweetForm, handleSaveSweet, handleOpenWeightForm, handleSaveWeight, handleSaveExercise, handleSaveDailyNote เดิม)

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const foodActivities = activities.filter((a) => a.activity_type === 'food');
  const exerciseActivities = activities.filter((a) => a.activity_type === 'exercise');
  const measurementActivities = activities.filter((a) => a.activity_type === 'measurement');
  const sleepActivities = activities.filter((a) => a.activity_type === 'rest');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-100 to-cyan-50 pb-20">
      <StarBackground />

      {/* Header */}
      <div className="relative z-10 max-w-md mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              กิจกรรมสำหรับนักกีฬา {profile?.pam_level === 'L4' ? 'Champion' : profile?.pam_level || 'L2'}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {new Date().toLocaleDateString('th-TH', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
          <Image src="/images/mascot-main.png" alt="Mascot" width={56} height={56} className="object-contain" />
        </div>

        {/* Food Section */}
        {foodActivities.length > 0 && (
          <div className="mb-4">
            <ActivitySection
              title="อาหาร"
              icon="🍚"
              activities={foodActivities}
              onToggle={toggleActivity}
              onOpenSweetForm={handleOpenSweetForm}
              headerBg="bg-[#ECFDF5]"
              iconMap={{
                stop_sweet: '🚫🍬',
                reduce_rice: '🍚',
                protein_vegetable: '🥦🍖',
                carb_control: '🍚',
                protein_intake: '🥩',
                water_intake: '💧'
              }}
              showSweetType={true}
            />
          </div>
        )}

        {/* Exercise Section */}
        {exerciseActivities.length > 0 && (
          <div className="mb-4">
            <ActivitySection
              title="ออกกำลังกาย"
              icon="🧘"
              activities={exerciseActivities}
              onToggle={toggleActivity}
              headerBg="bg-[#EFF6FF]"
              iconMap={{
                exercise_walk: '🚶',
                stretching: '🧘',
                cardio: '🏃',
                strengthening: '🏋️',
                hiit: '🔥'
              }}
              showExerciseInfo={true}
            />
          </div>
        )}

        {/* Measurement Section */}
        {measurementActivities.length > 0 && (
          <div className="mb-4">
            <ActivitySection
              title="วัดและบันทึก"
              icon="📊"
              activities={measurementActivities}
              onToggle={toggleActivity}
              onOpenWeightForm={handleOpenWeightForm}
              headerBg="bg-[#FDF4FF]"
              iconMap={{ record_weight_sugar: '⚖️💉' }}
              showValue={true}
            />
          </div>
        )}

        {/* Sleep Section */}
        {sleepActivities.length > 0 && (
          <div className="mb-4">
            <ActivitySection
              title="พักผ่อน"
              icon="🌙"
              activities={sleepActivities}
              onToggle={toggleActivity}
              headerBg="bg-[#EDE9FE]"
              iconMap={{ sleep: '🌙' }}
            />
          </div>
        )}

        {/* หมายเหตุรายวัน */}
        <div className="mb-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-4">
            <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-xl">📝</span>
              หมายเหตุรายวัน
            </h3>
            <textarea
              value={dailyNote}
              onChange={(e) => setDailyNote(e.target.value)}
              placeholder="บันทึกหมายเหตุหรือคำแนะนำเพิ่มเติมสำหรับวันนี้..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
            />
            <div className="flex justify-end mt-3">
              <button
                onClick={handleSaveDailyNote}
                disabled={!dailyNote.trim() || savingNote}
                className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingNote ? 'กำลังบันทึก...' : 'บันทึกหมายเหตุ'}
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8">
          <button
            onClick={handleSave}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all"
          >
            {saved ? 'บันทึกแล้ว! ✅' : 'บันทึกกิจกรรมวันนี้'}
          </button>
        </div>
      </div>

      {/* ... (Modal ทั้งหมดเดิม) */}
    </div>
  );
}

// ... (ActivitySection และ ToggleSwitch Component เดิม)