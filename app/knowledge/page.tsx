'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { checkSession, getProfile, getKnowledge } from '@/lib/supabase/queries';
import { StarBackground } from '@/components/star-background';
import Image from 'next/image';
import { Play, FileText, Globe, ExternalLink } from 'lucide-react';

interface Knowledge {
  id: string;
  title: string;
  description: string | null;
  link_type: string;
  link_url: string;
  thumbnail_url: string | null;
  category: string | null;
  pam_level: string | null;
  duration_minutes: number | null;
  file_size: string | null;
  is_active: boolean;
  sort_order: number;
}

export default function KnowledgePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [knowledge, setKnowledge] = useState<Knowledge[]>([]);
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
      console.log('📚 [KnowledgePage] User PAM Level:', userData.pam_level);
      
      const [profileData, knowledgeData] = await Promise.all([
        getProfile(userData.id),
        getKnowledge(userData.pam_level || 'L2')
      ]);
      
      console.log('📚 [KnowledgePage] Profile:', profileData);
      console.log('📚 [KnowledgePage] Knowledge count:', knowledgeData?.length);
      console.log('📚 [KnowledgePage] Knowledge data:', knowledgeData);
      
      setProfile(profileData);
      setKnowledge(knowledgeData);
    } catch (error) {
      console.error('❌ [KnowledgePage] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [router]);

  const getLinkIcon = (linkType: string) => {
    switch (linkType) {
      case 'video':
        return <Play className="w-5 h-5" />;
      case 'document':
        return <FileText className="w-5 h-5" />;
      case 'website':
        return <Globe className="w-5 h-5" />;
      default:
        return <ExternalLink className="w-5 h-5" />;
    }
  };

  const getLinkColor = (linkType: string) => {
    switch (linkType) {
      case 'video':
        return 'bg-red-100 text-red-600';
      case 'document':
        return 'bg-blue-100 text-blue-600';
      case 'website':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getDurationText = (item: Knowledge) => {
    if (item.link_type === 'video' && item.duration_minutes) {
      return `${item.duration_minutes} นาที`;
    }
    if (item.link_type === 'document' && item.file_size) {
      return item.file_size;
    }
    return null;
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

  // จัดกลุ่มตาม category
// จัดกลุ่มตาม category (กำจัดข้อมูลซ้ำ)
const groupedKnowledge = knowledge.reduce((acc, item) => {
  const category = item.category || 'general';
  if (!acc[category]) {
    acc[category] = [];
  }
  
  // ✅ ตรวจสอบว่า item นี้มีแล้วหรือไม่ (กันซ้ำ)
  const exists = acc[category].some(
    (existing: Knowledge) => 
      existing.id === item.id || 
      (existing.title === item.title && existing.pam_level === item.pam_level)
  );
  
  if (!exists) {
    acc[category].push(item);
  }
  
  return acc;
}, {} as Record<string, Knowledge[]>);

  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      food: '🍚 อาหาร',
      exercise: '🧘 ออกกำลังกาย',
      health: '❤️ สุขภาพ',
      general: '📚 ทั่วไป'
    };
    return names[category] || category;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-100 to-cyan-50 pb-20">
      <StarBackground />
      
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">ความรู้สำหรับนักกีฬา</h1>
            <p className="text-sm text-gray-600 mt-1">
              {profile?.pam_level === 'L4' ? 'L4 Champion' : profile?.pam_level || 'L2'}
            </p>
          </div>
          <Image
            src="/images/mascot-main.png"
            alt="Mascot"
            width={50}
            height={60}
            className="object-contain"
          />
        </div>

        {/* Knowledge List */}
        {Object.keys(groupedKnowledge).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedKnowledge).map(([category, items]) => (
              <div key={category}>
                <h2 className="text-lg font-bold text-gray-800 mb-3">
                  {getCategoryName(category)}
                </h2>
                
                <div className="space-y-3">
                  {items.map((item) => (
                    <a
                      key={item.id}
                      href={item.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/50 hover:shadow-xl transition-all"
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getLinkColor(item.link_type)}`}>
                          {getLinkIcon(item.link_type)}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-gray-800 truncate">
                              {item.title}
                            </h3>
                            <ExternalLink className="w-3 h-3 text-gray-400" />
                          </div>
                          
                          {item.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getLinkColor(item.link_type)}`}>
                              {item.link_type === 'video' && '🎬 วิดีโอ'}
                              {item.link_type === 'document' && '📄 เอกสาร'}
                              {item.link_type === 'website' && '🌐 เว็บไซต์'}
                            </span>
                            
                            {getDurationText(item) && (
                              <span className="text-xs text-gray-400">
                                {getDurationText(item)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 text-center">
            <p className="text-gray-500">ยังไม่มีเนื้อหา</p>
            <p className="text-xs text-gray-400 mt-1">โค้ชจะเพิ่มเนื้อหาให้เร็วๆ นี้</p>
          </div>
        )}
      </div>
    </div>
  );
}