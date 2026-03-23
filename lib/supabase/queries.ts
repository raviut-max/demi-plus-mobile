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
// Goals
// =====================================================
export async function getGoals(userId: string) {
  try {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('priority', { ascending: true });

    if (error) {
      console.error('Error fetching goals:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Get goals error:', err);
    return [];
  }
}

// =====================================================
// ฟังก์ชันดึงเป้าหมายรายสัปดาห์
// =====================================================
export async function getWeeklyGoals(userId: string) {
  try {
    // ✅ ดึง goals ทั้งหมดเรียงตาม created_at descending
    const { data: allGoals, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .eq('goal_type', 'weekly_activity')
      .order('goal_name')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching weekly goals:', error);
      return [];
    }

    // ✅ กรองให้เหลือเฉพาะ goal ล่าสุดของแต่ละ goal_name
    const uniqueGoalsMap = new Map<string, any>();
    (allGoals || []).forEach((goal) => {
      if (!uniqueGoalsMap.has(goal.goal_name)) {
        uniqueGoalsMap.set(goal.goal_name, goal);
      }
    });

    const uniqueGoals = Array.from(uniqueGoalsMap.values());
    
    console.log('🎯 [getWeeklyGoals] Total goals:', allGoals?.length || 0);
    console.log('🎯 [getWeeklyGoals] Unique goals:', uniqueGoals.length);
    console.log('🎯 [getWeeklyGoals] Goals:', uniqueGoals);

    return uniqueGoals;
  } catch (err) {
    console.error('Get weekly goals error:', err);
    return [];
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
    .select(`
      *,
      activities (
        activity_code,
        activity_name_th,
        activity_type
      )
    `)
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
// ✅ Daily Notes (goal_daily_notes) - ใหม่
// =====================================================
export async function saveDailyNote(data: {
  user_id: string;
  goal_id?: string;
  activity_id?: string;
  note_date: string;
  note_text: string;
  is_completed?: boolean;
  actual_value?: number;
  actual_unit?: string;
  exercise_minutes?: number;
  mood_level?: number;
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
        is_completed: data.is_completed,
        actual_value: data.actual_value,
        actual_unit: data.actual_unit,
        exercise_minutes: data.exercise_minutes,
        mood_level: data.mood_level,
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