import { supabase } from './client';

// =====================================================
// Authentication & Session
// =====================================================
export async function login(idCard: string, password: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, id_card, password_hash, role, is_active')
      .eq('id_card', idCard)
      .eq('password_hash', password)
      .eq('is_active', true)
      .single();

    if (error || !data) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, pam_level, pam_score, current_step, hospital_number, zone')
      .eq('id', data.id)
      .single();

    return {
      id: data.id,
      id_card: data.id_card,
      full_name_th: profile?.full_name || 'ผู้ใช้',
      pam_level: profile?.pam_level || 'L2',
      pam_score: profile?.pam_score || 18,
      current_step: profile?.current_step || 'Starter',
      hospital_number: profile?.hospital_number || '',
      zone: profile?.zone || 'Green Zone',
      role: data.role,
    };
  } catch (err) {
    console.error('Login error:', err);
    return null;
  }
}

export async function logout() {
  localStorage.removeItem('user_id');
  localStorage.removeItem('user_data');
  localStorage.removeItem('login_time');
}

export function checkSession() {
  const userId = localStorage.getItem('user_id');
  const userData = localStorage.getItem('user_data');
  const loginTime = localStorage.getItem('login_time');

  if (!userId || !userData) return null;

  if (loginTime) {
    const loginDate = new Date(loginTime);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - loginDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 7) {
      logout();
      return null;
    }
  }

  return JSON.parse(userData);
}

// =====================================================
// Profile
// =====================================================
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return null;
  return data;
}

// =====================================================
// Activities
// =====================================================
export async function getActivities(pamLevel: string) {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .or(`pam_level.eq.${pamLevel},pam_level.eq.ALL`)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching activities:', error);
    return [];
  }

  return data || [];
}

// =====================================================
// Records
// =====================================================
export async function saveRecord(data: {
  user_id: string;
  activity_id: string;
  record_date: string;
  is_completed: boolean;
  weight?: number;
  blood_sugar?: number;
  sweet_type?: string[];
  exercise_minutes?: number;
  exercise_type?: string;
}) {
  try {
    const { data: result, error } = await supabase
      .from('records')
      .upsert({
        user_id: data.user_id,
        activity_id: data.activity_id,
        record_date: data.record_date,
        is_completed: data.is_completed,
        updated_at: new Date().toISOString(),
        ...(data.weight !== undefined && { weight: data.weight }),
        ...(data.blood_sugar !== undefined && { blood_sugar: data.blood_sugar }),
        ...(data.sweet_type !== undefined && { sweet_type: data.sweet_type }),
        ...(data.exercise_minutes !== undefined && { exercise_minutes: data.exercise_minutes }),
        ...(data.exercise_type !== undefined && { exercise_type: data.exercise_type }),
      }, {
        onConflict: 'user_id,activity_id,record_date',
      })
      .select();

    if (error) {
      console.error('Upsert error:', error);
      return null;
    }

    return result;
  } catch (err) {
    console.error('Save record error:', err);
    return null;
  }
}

export async function getTodayRecords(userId: string) {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('records')
      .select(`
        id, 
        activity_id, 
        is_completed, 
        record_date, 
        sweet_type, 
        weight, 
        blood_sugar,
        exercise_minutes,
        exercise_type
      `)
      .eq('user_id', userId)
      .eq('record_date', today);

    if (error) {
      console.error('Error fetching today records:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Get today records error:', err);
    return [];
  }
}

// =====================================================
// Goals - ✅ เพิ่มฟังก์ชันจัดการรอบการบันทึก
// =====================================================

// ✅ ฟังก์ชันนับจำนวนรอบการบันทึกเป้าหมาย
export async function getGoalRoundCount(userId: string) {
  try {
    const { count, error } = await supabase
      .from('goals')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('goal_type', 'weekly_activity')
      .eq('status', 'archived');

    if (error) {
      console.error('Error counting goal rounds:', error);
      return 0;
    }

    // จำนวนรอบ = จำนวน archived + 1 (รอบปัจจุบัน)
    return (count || 0) + 1;
  } catch (err) {
    console.error('Get goal round count error:', err);
    return 1;
  }
}

// ✅ ฟังก์ชันดึงรอบล่าสุดที่บันทึก
export async function getLatestGoalRound(userId: string) {
  try {
    const { data, error } = await supabase
      .from('goals')
      .select('round_number, created_at')
      .eq('user_id', userId)
      .eq('goal_type', 'weekly_activity')
      .order('round_number', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching latest goal round:', error);
      return null;
    }

    return data?.[0] || null;
  } catch (err) {
    console.error('Get latest goal round error:', err);
    return null;
  }
}

// ✅ ฟังก์ชันดึงเป้าหมายรายสัปดาห์ (รอบปัจจุบันเท่านั้น)
export async function getWeeklyGoals(userId: string) {
  try {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .eq('goal_type', 'weekly_activity')
      .eq('is_current', true)
      .order('goal_name')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching weekly goals:', error);
      return [];
    }

    console.log('🎯 [getWeeklyGoals] Fetched:', data?.length || 0, 'goals');
    return data || [];
  } catch (err) {
    console.error('Get weekly goals error:', err);
    return [];
  }
}

// ✅ ฟังก์ชันดึงประวัติการปรับเปลี่ยนเป้าหมาย (ทุก รอบ)
export async function getGoalHistory(userId: string) {
  try {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .eq('goal_type', 'weekly_activity')
      .in('status', ['active', 'archived'])
      .order('round_number', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching goal history:', error);
      return [];
    }

    // จัดกลุ่มตาม round_number
    const roundsMap = new Map<number, any[]>();
    (data || []).forEach((goal: any) => {
      const round = goal.round_number || 1;
      if (!roundsMap.has(round)) {
        roundsMap.set(round, []);
      }
      roundsMap.get(round)!.push(goal);
    });

    const history = Array.from(roundsMap.entries()).map(([round, goals]) => ({
      round_number: round,
      goals: goals,
      created_at: goals[0]?.created_at,
      is_current: goals[0]?.is_current || false,
    }));

    console.log('📚 [getGoalHistory] Fetched:', history.length, 'rounds');
    return history;
  } catch (err) {
    console.error('Get goal history error:', err);
    return [];
  }
}

// ✅ ฟังก์ชัน Archive Goals เดิม + สร้าง Goals ใหม่พร้อม Round Number
export async function saveGoalsNewRound(data: {
  user_id: string;
  goals: Array<{
    goal_name: string;
    goal_name_th: string;
    target_days: number;
    target_value?: number;
    target_unit?: string;
    activity_id?: string;
    primary_goal_note?: string;
    weekly_goal_note?: string;
  }>;
  created_by: string;
}) {
  try {
    console.log('💾 [saveGoalsNewRound] Starting...');

    // 1. นับรอบถัดไป
    const currentRound = await getGoalRoundCount(data.user_id);
    const nextRound = currentRound;
    
    console.log('📊 [saveGoalsNewRound] Current round:', currentRound, '→ Next round:', nextRound);

    // 2. Archive goals เดิม (status = active → archived, is_current = true → false)
    const { error: archiveError } = await supabase
      .from('goals')
      .update({
        status: 'archived',
        is_current: false,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', data.user_id)
      .eq('goal_type', 'weekly_activity')
      .eq('status', 'active')
      .eq('is_current', true);

    if (archiveError) {
      console.error('Error archiving goals:', archiveError);
      return { success: false, error: archiveError.message };
    }

    console.log('✅ [saveGoalsNewRound] Archived old goals');

    // 3. สร้าง goals ใหม่
    const today = new Date().toISOString().split('T')[0];
    const newGoals = data.goals.map(goal => ({
      user_id: data.user_id,
      goal_type: 'weekly_activity' as const,
      goal_name: goal.goal_name,
      goal_name_th: goal.goal_name_th,
      target_days: goal.target_days,
      target_value: goal.target_value || null,
      target_unit: goal.target_unit || null,
      activity_id: goal.activity_id || null,
      status: 'active' as const,
      is_current: true,
      round_number: nextRound,
      start_date: today,
      priority: 1,
      is_core_goal: true,
      created_by: data.created_by,
      primary_goal_note: goal.primary_goal_note || null,
      weekly_goal_note: goal.weekly_goal_note || null,
      last_recorded_date: today,
    }));

    console.log('📝 [saveGoalsNewRound] Creating', newGoals.length, 'new goals');

    const { error: insertError } = await supabase
      .from('goals')
      .insert(newGoals);

    if (insertError) {
      console.error('Error creating new goals:', insertError);
      return { success: false, error: insertError.message };
    }

    console.log('✅ [saveGoalsNewRound] Created new goals successfully');

    return {
      success: true,
      round_number: nextRound,
      goals_count: newGoals.length,
    };
  } catch (err) {
    console.error('Save goals new round error:', err);
    return { success: false, error: 'เกิดข้อผิดพลาดในการบันทึกเป้าหมาย' };
  }
}

// =====================================================
// Progress
// =====================================================
export async function getProgress(userId: string, days: number = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('records')
    .select(`*, activities ( activity_code, activity_name_th, activity_type )`)
    .eq('user_id', userId)
    .gte('record_date', startDate.toISOString())
    .order('record_date', { ascending: false });

  if (error) return [];
  return data;
}

// =====================================================
// Exercise History
// =====================================================
export async function getExerciseHistory(userId: string, days: number = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: exerciseActivities } = await supabase
      .from('activities')
      .select('id')
      .eq('activity_type', 'exercise');

    const exerciseActivityIds = exerciseActivities?.map(a => a.id) || [];
    if (exerciseActivityIds.length === 0) return [];

    const { data, error } = await supabase
      .from('records')
      .select(`
        *,
        activities (
          activity_code,
          activity_name_th
        )
      `)
      .eq('user_id', userId)
      .in('activity_id', exerciseActivityIds)
      .gte('record_date', startDate.toISOString())
      .not('exercise_minutes', 'is', null)
      .order('record_date', { ascending: false });

    if (error) {
      console.error('Error fetching exercise history:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Get exercise history error:', err);
    return [];
  }
}

// =====================================================
// Appointments
// =====================================================
export async function getNextAppointment(userId: string) {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        doctors (
          id,
          full_name_th,
          specialization_th
        )
      `)
      .eq('user_id', userId)
      .in('status', ['scheduled', 'confirmed', 'pending'])
      .gte('appointment_date', startOfToday.toISOString())
      .order('appointment_date', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching appointment:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Appointment error:', err);
    return null;
  }
}

// =====================================================
// Knowledge
// =====================================================
export async function getKnowledge(pamLevel: string = 'ALL') {
  try {
    const { data, error } = await supabase
      .from('knowledge')
      .select('*')
      .or(`pam_level.eq.${pamLevel},pam_level.eq.ALL`)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching knowledge:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Get knowledge error:', err);
    return [];
  }
}

// =====================================================
// Daily Notes (goal_daily_notes)
// =====================================================
export async function saveDailyNote(data: {
  user_id: string;
  goal_id?: string;
  activity_id?: string;
  note_date: string;
  note_text: string;
}) {
  try {
    const { data: result, error } = await supabase
      .from('goal_daily_notes')
      .upsert({
        user_id: data.user_id,
        goal_id: data.goal_id,
        activity_id: data.activity_id,
        note_date: data.note_date,
        note_text: data.note_text,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,goal_id,note_date',
      })
      .select();

    if (error) {
      console.error('Error saving daily note:', error);
      return null;
    }

    return result;
  } catch (err) {
    console.error('Save daily note error:', err);
    return null;
  }
}

export async function getDailyNote(userId: string, noteDate?: string) {
  try {
    const date = noteDate || new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('goal_daily_notes')
      .select('*')
      .eq('user_id', userId)
      .eq('note_date', date)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching daily note:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Get daily note error:', err);
    return null;
  }
}