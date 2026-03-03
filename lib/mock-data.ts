export const mockUser = {
  name: "คุณสมชาย",
  hn: "12345",
  nationalId: "1234567890123",
  password: "01-01",
  age: 62,
  gender: "ชาย",
  weight: 75.5,
  height: 165,
  bmi: 27.7,
  waist: 92,
  diabetesYears: 3,
  coach: "โค้ชสมชาย",
  pamLevel: "L3",
  pamLabel: "Manager",
  pamScore: "18/20",
  promsZone: "Green Zone",
  promsNote: "ทุกข้อ > 2",
  confidence: "8/10",
  confidenceStatus: "ดี",
  confidenceQuote: "มั่นใจมาก! วันนี้ทำได้แน่นอน",
  nextAppointment: "15 มีนาคม 2569 เวลา 10:00",
  targetWeight: 72.0,
  currentBloodSugar: 98,
  hba1c: 6.8,
}

export type Activity = {
  id: string
  category: "food" | "exercise" | "sleep"
  label: string
  description?: string
  icon: string
  completed: boolean
}

export const defaultActivities: Activity[] = [
  {
    id: "carb",
    category: "food",
    label: "กินคาร์โบไฮเดรด <5 คาร์บ/วัน",
    description: "ตัวอย่างเช่น ผัก, โปรตีนไขมันต่ำ, ถั่ว, ธัญพืชบางชนิด",
    icon: "rice",
    completed: false,
  },
  {
    id: "protein",
    category: "food",
    label: "กินโปรตีน >3 หน่วย",
    description: "ตัวอย่างเช่น เนื้อ, ไข่, เต้าหู้, ถั่ว, ผลิตภัณฑ์นม, โยเกิร์ต",
    icon: "meat",
    completed: false,
  },
  {
    id: "water",
    category: "food",
    label: "ดื่มน้ำ >1 ลิตร",
    description: "พกขวดน้ำส่วนตัวไว้ข้างตัว ดื่มบ่อยๆ",
    icon: "water",
    completed: false,
  },
  {
    id: "stretching",
    category: "exercise",
    label: "Stretching",
    icon: "stretching",
    completed: false,
  },
  {
    id: "cardio",
    category: "exercise",
    label: "Cardio",
    icon: "cardio",
    completed: false,
  },
  {
    id: "strengthening",
    category: "exercise",
    label: "Strengthening",
    icon: "strengthening",
    completed: false,
  },
  {
    id: "hiit",
    category: "exercise",
    label: "HIIT",
    icon: "hiit",
    completed: false,
  },
  {
    id: "sleep",
    category: "sleep",
    label: "นอนหลับเพียงพอ",
    icon: "sleep",
    completed: false,
  },
]

export type ProgressData = {
  id: string
  label: string
  category: "food" | "exercise" | "sleep"
  daysCompleted: number
  totalDays: number
  percentage: number
  status: "excellent" | "good" | "needs-improvement"
}

export const mockProgress: ProgressData[] = [
  { id: "carb", label: "กินคาร์โบไฮเดรด <5 คาร์บ/วัน", category: "food", daysCompleted: 5, totalDays: 7, percentage: 71, status: "needs-improvement" },
  { id: "protein", label: "กินโปรตีน >3 หน่วย", category: "food", daysCompleted: 6, totalDays: 7, percentage: 86, status: "good" },
  { id: "water", label: "ดื่มน้ำ >1 ลิตร", category: "food", daysCompleted: 7, totalDays: 7, percentage: 100, status: "needs-improvement" },
  { id: "stretching", label: "Stretching", category: "exercise", daysCompleted: 5, totalDays: 7, percentage: 71, status: "needs-improvement" },
  { id: "cardio", label: "Cardio", category: "exercise", daysCompleted: 3, totalDays: 7, percentage: 43, status: "needs-improvement" },
  { id: "strengthening", label: "Strengthening", category: "exercise", daysCompleted: 3, totalDays: 7, percentage: 43, status: "needs-improvement" },
  { id: "hiit", label: "HIIT", category: "exercise", daysCompleted: 0, totalDays: 7, percentage: 0, status: "good" },
  { id: "sleep", label: "นอนหลับเพียงพอ", category: "sleep", daysCompleted: 7, totalDays: 7, percentage: 100, status: "excellent" },
]

export type KnowledgeArticle = {
  id: string
  title: string
  description: string
  hasVideo: boolean
  hasArticle: boolean
  icon: string
}

export const knowledgeArticles: KnowledgeArticle[] = [
  {
    id: "1",
    title: "หยุดกินหวาน",
    description: "เริ่มรู้วิธีลดหวาน เพื่อสุขภาพน้ำตาลที่ดี",
    hasVideo: true,
    hasArticle: true,
    icon: "candy",
  },
  {
    id: "2",
    title: "ลดข้าวลง",
    description: "ลดปริมาณข้าว ลดต่อบาทางในเลือดได้",
    hasVideo: true,
    hasArticle: true,
    icon: "rice",
  },
  {
    id: "3",
    title: "โปรตีนทุกมื้อ",
    description: "การกินโปรตีนช่วยสร้างกล้ามเนื้อ",
    hasVideo: false,
    hasArticle: false,
    icon: "protein",
  },
  {
    id: "4",
    title: "เดินทุกวัน",
    description: "การเดินช่วยเผาผลาญน้ำตาลในร่างกาย",
    hasVideo: false,
    hasArticle: false,
    icon: "walking",
  },
  {
    id: "5",
    title: "บันทึกน้ำหนัก/น้ำตาล",
    description: "ใช้เช็กลิสต์ ติดตามผลลัพธ์อย่างต่อเนื่อง",
    hasVideo: false,
    hasArticle: false,
    icon: "chart",
  },
  {
    id: "6",
    title: "สำหรับ Champion: 8 กิจกรรม",
    description: "ดูเพลย์ลิสต์ที่รวบกวดกิจกรรมสุขภาพประจำวัน",
    hasVideo: true,
    hasArticle: false,
    icon: "champion",
  },
]
