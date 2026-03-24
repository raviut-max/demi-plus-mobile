// app/goals/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { checkSession, getProfile, getWeeklyGoals } from '@/lib/supabase/queries';
import { StarBackground } from '@/components/star-background';
import Image from 'next/image';
import { Trophy } from 'lucide-react';

// ✅ Long-term Goals 4 ข้อ (Core Performance Goals)
const LONG_TERM_GOALS = [
  { code: 'weight', name_th: 'น้ำหนักลด', description: 'ลดลงอย่างน้อย 5-10% และลด Visceral Fat' },
  { code: 'glucose', name_th: 'น้ำตาลลง', description: 'ควบคุมระดับน้ำตาลในเลือดให้เข้าสู่เกณฑ์ปกติ' },
  { code: 'medication', name_th: 'ลดยาได้', description: 'ปรับลดหรือหยุดยาภายใต้การกำกับของแพทย์' },
  { code: 'remission', name_th: 'ภาวะเบาหวานสงบ', description: 'บรรลุ HbA1c < 6.5% โดยไม่ต้องใช้ยาต่อเนื่อง' },
];

interface WeeklyGoal {
  id: string;
  goal_name: string;
  goal_name_th: string;
  target_days: number;
  target_value?: number;
  target_unit?: string;
  primary_goal_note?: string;
  weekly_goal_note?: string;
}

export default function GoalsPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoal[]>([]);
  const [primaryGoal, setPrimaryGoal] = useState('');
  const [primaryGoalNote, setPrimaryGoalNote] = useState('');
  const [weeklyNote, setWeeklyNote] = useState('');
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
        const [profileData, goalsData] = await Promise.all([
          getProfile(userData.id),
          getWeeklyGoals(userData.id)
        ]);

        setProfile(profileData);

        // ✅ กรอง goals ไม่ให้ซ้ำ (ใช้ Map เพื่อเก็บ goal_name ที่ไม่ซ้ำ)
        const uniqueGoalsMap = new Map<string, WeeklyGoal>();
        goalsData.forEach((goal: WeeklyGoal) => {
          if (!uniqueGoalsMap.has(goal.goal_name)) {
            uniqueGoalsMap.set(goal.goal_name, goal);
          }
        });
        
        const uniqueGoals = Array.from(uniqueGoalsMap.values());
        setWeeklyGoals(uniqueGoals);

        // ✅ โหลด primary goal จาก profile
        if (profileData?.primary_goal_code) {
          setPrimaryGoal(profileData.primary_goal_code);
        }

        // ✅ หา goal แรกที่มี notes (ไม่ใช่แค่ goal แรก)
        const goalWithPrimaryNote = goalsData.find((g: WeeklyGoal) => 
          g.primary_goal_note && g.primary_goal_note.trim() !== ''
        );
        
        const goalWithWeeklyNote = goalsData.find((g: WeeklyGoal) => 
          g.weekly_goal_note && g.weekly_goal_note.trim() !== ''
        );

        if (goalWithPrimaryNote) {
          setPrimaryGoalNote(goalWithPrimaryNote.primary_goal_note || '');
        }

        if (goalWithWeeklyNote) {
          setWeeklyNote(goalWithWeeklyNote.weekly_goal_note || '');
        }

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
        <p className="text-gray-600">กำลังโหลด...</p>
      </div>
    );
  }

  // ✅ แยก goals ตามประเภท
  const foodGoals = weeklyGoals.filter(g => 
    ['stop_sweet', 'reduce_rice', 'protein_vegetable', 'carb_control', 'protein_intake', 'water_intake'].includes(g.goal_name)
  );
  
  const exerciseGoals = weeklyGoals.filter(g => 
    ['exercise_walk', 'stretching', 'cardio', 'strengthening', 'hiit'].includes(g.goal_name)
  );
  
  const measurementGoals = weeklyGoals.filter(g => 
    ['record_weight_sugar'].includes(g.goal_name)
  );
  
  const restGoals = weeklyGoals.filter(g => 
    ['sleep'].includes(g.goal_name)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-100 to-cyan-50 pb-20">
      <StarBackground />
      
      {/* Header */}
      <div className="relative z-10 max-w-md mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">เป้าหมายของฉัน</h1>
            <div className="flex items-center gap-2 mt-1">
              <Trophy className="w-4 h-4 text-yellow-600" />
              <p className="text-sm font-semibold text-gray-700">
                {profile?.pam_level === 'L4' ? 'Champion' : profile?.pam_level || 'L2'} 
                {' • '} 
                {profile?.zone || 'Green Zone'}
              </p>
            </div>
          </div>
          <Image src="/images/mascot-main.png" alt="Mascot" width={56} height={56} className="object-contain" />
        </div>

        {/* ✅ เป้าหมายหลัก 4 ประการ */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-4 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-purple-600" />
            เป้าหมายหลัก 4 ประการ
          </h2>
          
          <div className="space-y-3">
            {LONG_TERM_GOALS.map((goal) => {
              const isSelected = primaryGoal === goal.code;
              return (
                <div
                  key={goal.code}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {isSelected ? (
                        <span className="text-2xl">✅</span>
                      ) : (
                        <span className="text-2xl">⚪</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`font-bold text-sm ${
                        isSelected ? 'text-purple-900' : 'text-gray-700'
                      }`}>
                        {goal.name_th}
                      </p>
                      <p className={`text-xs mt-0.5 ${
                        isSelected ? 'text-purple-700' : 'text-gray-500'
                      }`}>
                        {goal.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ✅ แสดงหมายเหตุเป้าหมายหลัก */}
          {primaryGoalNote && (
            <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-xs font-semibold text-purple-900 mb-1">📝 หมายเหตุเป้าหมายหลัก:</p>
              <p className="text-xs text-purple-700">{primaryGoalNote}</p>
            </div>
          )}
        </div>

        {/* ✅ เป้าหมายรายสัปดาห์ - อาหาร */}
        {foodGoals.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden mb-6">
            <div className="flex items-center gap-2 px-4 py-3 bg-[#ECFDF5]">
              <span className="text-xl">🍚</span>
              <h2 className="text-base font-bold text-gray-800">เป้าหมายรายสัปดาห์ - อาหาร</h2>
            </div>
            
            <div className="p-4 space-y-3">
              {foodGoals.map((goal) => (
                <div key={goal.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-200">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800">{goal.goal_name_th}</p>
                  </div>
                  <div className="bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                    {goal.target_days} วัน/สัปดาห์
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ✅ เป้าหมายรายสัปดาห์ - ออกกำลังกาย */}
        {exerciseGoals.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden mb-6">
            <div className="flex items-center gap-2 px-4 py-3 bg-[#EFF6FF]">
              <span className="text-xl">🧘</span>
              <h2 className="text-base font-bold text-gray-800">เป้าหมายรายสัปดาห์ - ออกกำลังกาย</h2>
            </div>
            
            <div className="p-4 space-y-3">
              {exerciseGoals.map((goal) => (
                <div key={goal.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-200">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800">{goal.goal_name_th}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {goal.target_value && (
                      <span className="text-xs text-gray-500">{goal.target_value} {goal.target_unit}</span>
                    )}
                    <div className="bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                      {goal.target_days} วัน/สัปดาห์
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ✅ เป้าหมายรายสัปดาห์ - วัดและบันทึก */}
        {measurementGoals.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden mb-6">
            <div className="flex items-center gap-2 px-4 py-3 bg-[#FDF4FF]">
              <span className="text-xl">📊</span>
              <h2 className="text-base font-bold text-gray-800">เป้าหมายรายสัปดาห์ - วัดและบันทึก</h2>
            </div>
            
            <div className="p-4 space-y-3">
              {measurementGoals.map((goal) => (
                <div key={goal.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-200">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800">{goal.goal_name_th}</p>
                  </div>
                  <div className="bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                    {goal.target_days} วัน/สัปดาห์
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ✅ เป้าหมายรายสัปดาห์ - พักผ่อน */}
        {restGoals.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden mb-6">
            <div className="flex items-center gap-2 px-4 py-3 bg-[#EDE9FE]">
              <span className="text-xl">🌙</span>
              <h2 className="text-base font-bold text-gray-800">เป้าหมายรายสัปดาห์ - พักผ่อน</h2>
            </div>
            
            <div className="p-4 space-y-3">
              {restGoals.map((goal) => (
                <div key={goal.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-200">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800">{goal.goal_name_th}</p>
                  </div>
                  <div className="bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                    {goal.target_days} วัน/สัปดาห์
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ✅ แสดงหมายเหตุรายสัปดาห์ */}
        {weeklyNote && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <h3 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
              <span>📋</span> หมายเหตุรายสัปดาห์
            </h3>
            <p className="text-sm text-blue-700">{weeklyNote}</p>
          </div>
        )}

      </div>
    </div>
  );
}