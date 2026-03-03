import { supabase } from './client';

// =====================================================
// ฟังก์ชัน Login
// =====================================================
export async function login(idCard: string, password: string) {
  try {
    console.log('Login attempt:', { idCard, passwordLength: password.length });

    const { data, error } = await supabase
      .from('users')
      .select('id, id_card, password_hash, role, is_active')
      .eq('id_card', idCard)
      .eq('password_hash', password)
      .eq('is_active', true)
      .single();

    console.log('Query result:', { data, error });

    if (error || !data) {
      console.error('Login failed:', error);
      return null;
    }

    const {  profile } = await supabase
      .from('profiles')
      .select('full_name, pam_level, current_step, hospital_number')
      .eq('id', data.id)
      .single();

    return {
      id: data.id,
      id_card: data.id_card,
      full_name_th: profile?.full_name || 'ผู้ใช้',
      pam_level: profile?.pam_level || 'L2',
      current_step: profile?.current_step || 'Starter',
      hospital_number: profile?.hospital_number || '',
      zone: 'green',
      role: data.role,
    };
  } catch (err) {
    console.error('Login error:', err);
    return null;
  }
}

// =====================================================
// ฟังก์ชัน Logout
// =====================================================
export async function logout() {
  localStorage.removeItem('user_id');
  localStorage.removeItem('user_data');
  localStorage.removeItem('login_time');
}

// =====================================================
// ฟังก์ชันตรวจสอบ Session
// =====================================================
export function checkSession() {
  const userId = localStorage.getItem('user_id');
  const userData = localStorage.getItem('user_data');
  const loginTime = localStorage.getItem('login_time');

  if (!userId || !userData) {
    return null;
  }

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
// ฟังก์ชันดึงข้อมูลผู้ใช้
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
// ฟังก์ชันดึงกิจกรรมตาม PAM Level
// =====================================================
export async function getActivities(pamLevel: string) {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .or(`pam_level.eq.${pamLevel},pam_level.eq.ALL`)
    .eq('is_active', true)
    .order('sort_order');

  if (error) return [];
  return data;
}

// =====================================================
// ฟังก์ชันบันทึกกิจกรรม (ใช้ upsert)
// =====================================================
export async function saveRecord(data: {
  user_id: string;
  activity_id: string;
  record_date: string;
  is_completed: boolean;
  [key: string]: any;
}) {
  try {
    console.log('Saving record:', {
      user_id: data.user_id,
      activity_id: data.activity_id,
      record_date: data.record_date,
      is_completed: data.is_completed,
      sweet_type: data.sweet_type,
      weight: data.weight,
      blood_sugar: data.blood_sugar,
    });

    // ตรวจสอบว่า activity_id มีจริง
    const { data: activityCheck } = await supabase
      .from('activities')
      .select('id')
      .eq('id', data.activity_id)
      .single();

    if (!activityCheck) {
      console.error('Activity not found:', data.activity_id);
      return null;
    }

    const { data: result, error } = await supabase
      .from('records')
      .upsert({
        user_id: data.user_id,
        activity_id: data.activity_id,
        record_date: data.record_date,
        is_completed: data.is_completed,
        updated_at: new Date().toISOString(),
        ...(data.walking_minutes !== undefined && { walking_minutes: data.walking_minutes }),
        ...(data.weight !== undefined && { weight: parseFloat(data.weight.toString()) }),
        ...(data.blood_sugar !== undefined && { blood_sugar: parseFloat(data.blood_sugar.toString()) }),
        ...(data.sleep_hours !== undefined && { sleep_hours: data.sleep_hours }),
        ...(data.carb_count !== undefined && { carb_count: data.carb_count }),
        ...(data.protein_units !== undefined && { protein_units: data.protein_units }),
        ...(data.water_liters !== undefined && { water_liters: data.water_liters }),
        ...(data.stretching_minutes !== undefined && { stretching_minutes: data.stretching_minutes }),
        ...(data.cardio_minutes !== undefined && { cardio_minutes: data.cardio_minutes }),
        ...(data.strengthening_minutes !== undefined && { strengthening_minutes: data.strengthening_minutes }),
        ...(data.hiit_minutes !== undefined && { hiit_minutes: data.hiit_minutes }),
        ...(data.sweet_type !== undefined && { sweet_type: data.sweet_type }),
        ...(data.rice_before !== undefined && { rice_before: data.rice_before }),
        ...(data.rice_current !== undefined && { rice_current: data.rice_current }),
      }, {
        onConflict: 'user_id,activity_id,record_date',
      })
      .select();

    if (error) {
      console.error('Upsert error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return null;
    }

    console.log('Record saved successfully:', result);
    return result;
  } catch (err) {
    console.error('Save record error:', err);
    return null;
  }
}

// =====================================================
// ฟังก์ชันดึงบันทึกวันนี้
// =====================================================
export async function getTodayRecords(userId: string) {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('records')
      .select('id, activity_id, is_completed, record_date, sweet_type, weight, blood_sugar')
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
// ฟังก์ชันดึง Progress 7 วัน
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
// ฟังก์ชันดึงเป้าหมาย
// =====================================================
export async function getGoals(userId: string) {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('priority');

  if (error) return [];
  return data;
}

// =====================================================
// ฟังก์ชันดึงนัดหมายครั้งถัดไป
// =====================================================
export async function getNextAppointment(userId: string) {
  try {
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
      .in('status', ['scheduled', 'confirmed'])
      .gte('appointment_date', new Date().toISOString())
      .order('appointment_date', { ascending: true })
      .single();

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
// ฟังก์ชันดึงสถิติรายสัปดาห์
// =====================================================
export async function getWeeklyStats(userId: string) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);

  const { data, error } = await supabase
    .from('records')
    .select('is_completed, record_date')
    .eq('user_id', userId)
    .gte('record_date', startDate.toISOString());

  if (error) return { completed: 0, total: 0, percentage: 0 };

  const completed = data.filter(r => r.is_completed).length;
  const total = data.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { completed, total, percentage };
}