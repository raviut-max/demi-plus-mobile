// app/admin/progress/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { checkSession, getProfile, getActivities, getProgress, getWeeklyGoals } from '@/lib/supabase/queries';
import { StarBackground } from '@/components/star-background';
import Image from 'next/image';
import { CheckCircle, Trophy, TrendingUp } from 'lucide-react';

interface Activity {
  id: string;
  activity_code: string;
  activity_name_th: string;
  description_th: string | null;
  activity_type: string;
  pam_level: string;
  sort_order: number;
}

interface RecordData {
  id: string;
  activity_id: string;
  record_date: string;
  is_completed: boolean;
  weight?: number;
  blood_sugar?: number;
  sweet_type?: string[];
}

interface WeeklyGoal {
  id: string;
  activity_id: string;
  target_days: number;
  target_value?: number;
}

interface SweetTypeCount {
  sweetType: string;
  count: number;
  icon: string;
}

interface ActivityStats {
  activity: Activity;
  completedDays: number;
  targetDays: number;
  percentage: number;
  status: 'เก่ง' | 'ดี' | 'ต้องปรับปรุง';
  latestWeight?: number;
  latestBloodSugar?: number;
  sweetTypeCounts: SweetTypeCount[];
}

const sweetOptions = [
  { value: 'ผลไม้หวาน', icon: '🍈' },
  { value: 'ปรุงเติมน้ำตาล', icon: '🍜' },
  { value: 'กับข้าวหวาน', icon: '🍳' },
  { value: 'น้ำหวาน', icon: '🥤' },
  { value: 'ขนมไทย', icon: '🍮' },
  { value: 'ขนมฝรั่ง', icon: '🍰' },
  { value: 'อื่นๆ', icon: '🍪' },
];

export default function ProgressPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [records, setRecords] = useState<RecordData[]>([]);
  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoal[]>([]);
  const [activityStats, setActivityStats] = useState<ActivityStats[]>([]);
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
        const [profileData, activitiesData, recordsData, goalsData] = await Promise.all([
          getProfile(userData.id),
          getActivities(userData.pam_level || 'L2'),
          getProgress(userData.id, 7),
          getWeeklyGoals(userData.id)
        ]);
        
        setProfile(profileData);
        setActivities(activitiesData);
        setRecords(recordsData);
        setWeeklyGoals(goalsData);
        
        const stats = calculateActivityStats(activitiesData, recordsData, goalsData);
        setActivityStats(stats);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const calculateActivityStats = (activities: Activity[], records: RecordData[], goals: WeeklyGoal[]): ActivityStats[] => {
    const stats: ActivityStats[] = [];
    
    activities.forEach(activity => {
      const activityRecords = records.filter(r => r.activity_id === activity.id);
      const uniqueDates = [...new Set(activityRecords.map(r => r.record_date))];
      const completedDays = activityRecords.filter(r => r.is_completed).length;
      
      const goal = goals.find(g => g.activity_id === activity.id);
      const targetDays = goal?.target_days || 7;
      
      const percentage = targetDays > 0 ? Math.round((completedDays / targetDays) * 100) : 0;
      
      let status: 'เก่ง' | 'ดี' | 'ต้องปรับปรุง' = 'ต้องปรับปรุง';
      if (percentage >= 80) status = 'เก่ง';
      else if (percentage >= 50) status = 'ดี';

      const sortedRecords = activityRecords.sort((a, b) => 
        new Date(b.record_date).getTime() - new Date(a.record_date).getTime()
      );
      const latestRecord = sortedRecords[0];
      
      const sweetTypeMap = new Map<string, number>();
      activityRecords.forEach(r => {
        if (r.sweet_type && Array.isArray(r.sweet_type)) {
          r.sweet_type.forEach(sweet => {
            const currentCount = sweetTypeMap.get(sweet) || 0;
            sweetTypeMap.set(sweet, currentCount + 1);
          });
        }
      });
      
      const sweetTypeCounts: SweetTypeCount[] = [];
      sweetTypeMap.forEach((count, sweetType) => {
        const option = sweetOptions.find(o => o.value === sweetType);
        sweetTypeCounts.push({
          sweetType,
          count,
          icon: option?.icon || '🍪',
        });
      });
      sweetTypeCounts.sort((a, b) => b.count - a.count);

      stats.push({
        activity,
        completedDays,
        targetDays,
        percentage,
        status,
        latestWeight: latestRecord?.weight,
        latestBloodSugar: latestRecord?.blood_sugar,
        sweetTypeCounts,
      });
    });

    return stats.sort((a, b) => a.activity.sort_order - b.activity.sort_order);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'เก่ง':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-300';
      case 'ดี':
        return 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-yellow-300';
      default:
        return 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white border-blue-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'เก่ง':
        return <CheckCircle className="w-4 h-4" />;
      case 'ดี':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <TrendingUp className="w-4 h-4" />;
    }
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 80) return 'from-green-500 to-emerald-500';
    if (percentage >= 50) return 'from-green-400 to-lime-400';
    return 'from-green-300 to-teal-300';
  };

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

  const foodStats = activityStats.filter(s => s.activity.activity_type === 'food');
  const exerciseStats = activityStats.filter(s => s.activity.activity_type === 'exercise');
  const measurementStats = activityStats.filter(s => s.activity.activity_type === 'measurement');
  const restStats = activityStats.filter(s => s.activity.activity_type === 'rest');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-100 to-cyan-50 pb-20">
      <StarBackground />
      
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              {profile?.full_name || 'ผู้ใช้'}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              {profile?.pam_level === 'L4' && (
                <Trophy className="w-4 h-4 text-yellow-600" />
              )}
              <p className="text-sm font-semibold text-gray-700">
                {profile?.pam_level === 'L4' ? 'Champion' : profile?.pam_level || 'L2'} 
                {' • '} 
                {profile?.current_step || 'Starter'}
              </p>
            </div>
          </div>
          <Image
            src="/images/mascot-main.png"
            alt="Mascot"
            width={56}
            height={56}
            className="object-contain"
          />
        </div>

        {/* L2: 5 Golden Rules */}
        {profile?.pam_level === 'L2' && (
          <div className="space-y-3">
            {/* Food Section */}
            {foodStats.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
                {/* ✅ แถบสีหัวข้อ - เขียวอ่อน */}
                <div className="flex items-center gap-2 px-4 py-3 bg-[#ECFDF5]">
                  <span className="text-xl">🍚</span>
                  <h2 className="text-base font-bold text-gray-800">อาหาร</h2>
                </div>
                
                <div className="p-4 space-y-4">
                  {foodStats.map((stat, index) => (
                    <div key={index} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-800">{stat.activity.activity_name_th}</p>
                          {stat.activity.description_th && (
                            <p className="text-xs text-gray-500 mt-0.5">{stat.activity.description_th}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {stat.completedDays}/{stat.targetDays} วัน - {stat.percentage}%
                          </p>
                        </div>
                        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-semibold ${getStatusColor(stat.status)}`}>
                          {getStatusIcon(stat.status)}
                          {stat.status}
                        </div>
                      </div>

                      <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${getProgressBarColor(stat.percentage)} transition-all`}
                          style={{ width: `${stat.percentage}%` }}
                        />
                      </div>

                      {stat.activity.activity_code === 'stop_sweet' && stat.sweetTypeCounts && stat.sweetTypeCounts.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 mb-1">กิน:</p>
                          <div className="flex flex-wrap gap-1">
                            {stat.sweetTypeCounts.map((item, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full"
                              >
                                {item.icon} {item.sweetType} {item.count} ครั้ง
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {stat.activity.activity_code === 'record_weight_sugar' && (
                        <div className="mt-2 flex gap-3">
                          {stat.latestWeight && (
                            <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-lg">
                              <span className="text-sm">⚖️</span>
                              <div>
                                <p className="text-[10px] text-gray-500">น้ำหนัก</p>
                                <p className="text-sm font-bold text-purple-700">{stat.latestWeight.toFixed(1)} kg</p>
                              </div>
                            </div>
                          )}
                          {stat.latestBloodSugar && (
                            <div className="flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg">
                              <span className="text-sm">💉</span>
                              <div>
                                <p className="text-[10px] text-gray-500">น้ำตาล</p>
                                <p className="text-sm font-bold text-red-700">{stat.latestBloodSugar.toFixed(0)} mg/dL</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Exercise Section */}
            {exerciseStats.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
                {/* ✅ แถบสีหัวข้อ - ฟ้าอ่อน */}
                <div className="flex items-center gap-2 px-4 py-3 bg-[#EFF6FF]">
                  <span className="text-xl">🧘</span>
                  <h2 className="text-base font-bold text-gray-800">ออกกำลังกาย</h2>
                </div>
                
                <div className="p-4 space-y-4">
                  {exerciseStats.map((stat, index) => (
                    <div key={index} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-800">{stat.activity.activity_name_th}</p>
                          {stat.activity.description_th && (
                            <p className="text-xs text-gray-500 mt-0.5">{stat.activity.description_th}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {stat.completedDays}/{stat.targetDays} วัน - {stat.percentage}%
                          </p>
                        </div>
                        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-semibold ${getStatusColor(stat.status)}`}>
                          {getStatusIcon(stat.status)}
                          {stat.status}
                        </div>
                      </div>

                      <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${getProgressBarColor(stat.percentage)} transition-all`}
                          style={{ width: `${stat.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Measurement Section */}
            {measurementStats.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
                {/* ✅ แถบสีหัวข้อ - ชมพูอ่อน */}
                <div className="flex items-center gap-2 px-4 py-3 bg-[#FDF4FF]">
                  <span className="text-xl">📊</span>
                  <h2 className="text-base font-bold text-gray-800">วัดและบันทึก</h2>
                </div>
                
                <div className="p-4 space-y-4">
                  {measurementStats.map((stat, index) => (
                    <div key={index} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-800">{stat.activity.activity_name_th}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {stat.completedDays}/{stat.targetDays} วัน - {stat.percentage}%
                          </p>
                        </div>
                        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-semibold ${getStatusColor(stat.status)}`}>
                          {getStatusIcon(stat.status)}
                          {stat.status}
                        </div>
                      </div>

                      <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${getProgressBarColor(stat.percentage)} transition-all`}
                          style={{ width: `${stat.percentage}%` }}
                        />
                      </div>

                      {stat.activity.activity_code === 'record_weight_sugar' && (
                        <div className="mt-2 flex gap-3">
                          {stat.latestWeight && (
                            <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-lg">
                              <span className="text-sm">⚖️</span>
                              <div>
                                <p className="text-[10px] text-gray-500">น้ำหนัก</p>
                                <p className="text-sm font-bold text-purple-700">{stat.latestWeight.toFixed(1)} kg</p>
                              </div>
                            </div>
                          )}
                          {stat.latestBloodSugar && (
                            <div className="flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg">
                              <span className="text-sm">💉</span>
                              <div>
                                <p className="text-[10px] text-gray-500">น้ำตาล</p>
                                <p className="text-sm font-bold text-red-700">{stat.latestBloodSugar.toFixed(0)} mg/dL</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rest Section */}
            {restStats.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
                {/* ✅ แถบสีหัวข้อ - ม่วงอ่อน */}
                <div className="flex items-center gap-2 px-4 py-3 bg-[#EDE9FE]">
                  <span className="text-xl">🌙</span>
                  <h2 className="text-base font-bold text-gray-800">พักผ่อน</h2>
                </div>
                
                <div className="p-4">
                  {restStats.map((stat, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-800">{stat.activity.activity_name_th}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {stat.completedDays}/{stat.targetDays} วัน - {stat.percentage}%
                          </p>
                        </div>
                        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-semibold ${getStatusColor(stat.status)}`}>
                          {getStatusIcon(stat.status)}
                          {stat.status}
                        </div>
                      </div>

                      <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${getProgressBarColor(stat.percentage)} transition-all`}
                          style={{ width: `${stat.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* L3: Intensive */}
        {profile?.pam_level === 'L3' && (
          <div className="space-y-3">
            {activityStats.map((stat, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800">{stat.activity.activity_name_th}</p>
                    {stat.activity.description_th && (
                      <p className="text-xs text-gray-500 mt-0.5">{stat.activity.description_th}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {stat.completedDays}/{stat.targetDays} วัน - {stat.percentage}%
                    </p>
                  </div>
                  <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-semibold ${getStatusColor(stat.status)}`}>
                    {getStatusIcon(stat.status)}
                    {stat.status}
                  </div>
                </div>

                <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${getProgressBarColor(stat.percentage)} transition-all`}
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>

                {stat.activity.activity_code === 'stop_sweet' && stat.sweetTypeCounts && stat.sweetTypeCounts.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">กิน:</p>
                    <div className="flex flex-wrap gap-1">
                      {stat.sweetTypeCounts.map((item, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full"
                        >
                          {item.icon} {item.sweetType} {item.count} ครั้ง
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {stat.activity.activity_code === 'record_weight_sugar' && (
                  <div className="mt-2 flex gap-3">
                    {stat.latestWeight && (
                      <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-lg">
                        <span className="text-sm">⚖️</span>
                        <div>
                          <p className="text-[10px] text-gray-500">น้ำหนัก</p>
                          <p className="text-sm font-bold text-purple-700">{stat.latestWeight.toFixed(1)} kg</p>
                        </div>
                      </div>
                    )}
                    {stat.latestBloodSugar && (
                      <div className="flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg">
                        <span className="text-sm">💉</span>
                        <div>
                          <p className="text-[10px] text-gray-500">น้ำตาล</p>
                          <p className="text-sm font-bold text-red-700">{stat.latestBloodSugar.toFixed(0)} mg/dL</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* L4: Champion Dashboard */}
        {profile?.pam_level === 'L4' && (
          <div className="space-y-3">
            {/* อาหาร Section */}
            {foodStats.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
                {/* ✅ แถบสีหัวข้อ - เขียวอ่อน */}
                <div className="flex items-center gap-2 px-4 py-3 bg-[#ECFDF5]">
                  <span className="text-xl">🍚</span>
                  <h2 className="text-base font-bold text-gray-800">อาหาร</h2>
                </div>
                
                <div className="p-4 space-y-4">
                  {foodStats.map((stat, idx) => (
                    <div key={idx} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <p className="text-sm font-semibold text-gray-800">{stat.activity.activity_name_th}</p>
                          </div>
                          {stat.activity.description_th && (
                            <p className="text-xs text-gray-500 mb-1">{stat.activity.description_th}</p>
                          )}
                          <p className="text-xs text-gray-500 mb-2">
                            {stat.completedDays}/{stat.targetDays} วัน - {stat.percentage}%
                          </p>
                          <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${getProgressBarColor(stat.percentage)}`}
                              style={{ width: `${stat.percentage}%` }}
                            />
                          </div>
                        </div>
                        <div className={`px-3 py-1.5 rounded-full border text-xs font-semibold ${getStatusColor(stat.status)}`}>
                          {stat.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ออกกำลังกาย Section */}
            {exerciseStats.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
                {/* ✅ แถบสีหัวข้อ - ฟ้าอ่อน */}
                <div className="flex items-center gap-2 px-4 py-3 bg-[#EFF6FF]">
                  <span className="text-xl">🧘</span>
                  <h2 className="text-base font-bold text-gray-800">ออกกำลังกาย</h2>
                </div>
                
                <div className="p-4 space-y-4">
                  {exerciseStats.map((stat, idx) => (
                    <div key={idx} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-800 mb-1">{stat.activity.activity_name_th}</p>
                          {stat.activity.description_th && (
                            <p className="text-xs text-gray-500 mb-1">{stat.activity.description_th}</p>
                          )}
                          <p className="text-xs text-gray-500 mb-2">
                            {stat.completedDays}/{stat.targetDays} วัน - {stat.percentage}%
                          </p>
                          <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${getProgressBarColor(stat.percentage)}`}
                              style={{ width: `${stat.percentage}%` }}
                            />
                          </div>
                        </div>
                        <div className={`px-3 py-1.5 rounded-full border text-xs font-semibold ${getStatusColor(stat.status)}`}>
                          {stat.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* นอนหลับ Section */}
            {restStats.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
                {/* ✅ แถบสีหัวข้อ - ม่วงอ่อน */}
                <div className="flex items-center gap-2 px-4 py-3 bg-[#EDE9FE]">
                  <span className="text-xl">🌙</span>
                  <h2 className="text-base font-bold text-gray-800">พักผ่อน</h2>
                </div>
                
                <div className="p-4">
                  {restStats.map((stat, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-800">นอนหลับเพียงพอ</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {stat.completedDays}/{stat.targetDays} วัน - {stat.percentage}%
                          </p>
                        </div>
                        <div className={`px-3 py-1.5 rounded-full border text-xs font-semibold ${getStatusColor(stat.status)}`}>
                          {stat.status === 'เก่ง' ? 'ยอดเยี่ยม!' : stat.status}
                        </div>
                      </div>
                      <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${getProgressBarColor(stat.percentage)}`}
                          style={{ width: `${stat.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}