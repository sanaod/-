export type PalestinianOerPublisher =
  | 'elearn_edu_ps'               // البوابة التعليمية الفلسطينية (الأولوية الأولى)
  | 'minhaji'                     // منصة منهاجي التعليمية الفلسطينية (الأولوية الثانية)
  | 'rawafed'                     // منصة روافد التعليمية (الأولوية الثالثة)
  | 'palestine_content_library'   // مكتبة المحتوى الفلسطيني (الأولوية الرابعة)
  | 'moe_palestine'               // مركز المناهج - وزارة التربية والتعليم العالي
  | 'unrwa_oer'                   // برنامج التعليم المفتوح - فلسطين
  | 'teacher_community';          // مجتمع المعلمين المعتمد

export type PalestinianOerType =
  | 'book'                  // كتاب مدرسي مقرر
  | 'teacher_guide'         // دليل المعلم
  | 'video'                 // فيديو مرئي تفاعلي
  | 'interactive_activity'  // نشاط تفاعلي / محاكاة
  | 'worksheet'             // ورقة عمل / بطاقة تعلم ذاتي
  | 'visual_card'           // بطاقة صور ومحسوسات
  | 'audio_story'           // قصة صوتية / نشيد
  | 'portal_link';          // منصة / رابط تعليمي

export interface PalestinianOfficialBadge {
  text: string;
  subText?: string;
  tier: 'ministry_gold' | 'minhaji_blue' | 'rawafed_green' | 'content_purple' | 'community_teal';
}

export interface PalestinianOerItem {
  id: string;
  title: string;
  subject: string;
  grade: string;
  topic: string;
  unitTitle?: string;
  type: PalestinianOerType;
  publisher: PalestinianOerPublisher;
  publisherNameAr: string;
  priority: number; // 1 = elearn, 2 = minhaji, 3 = rawafed, 4 = content_library, 5+ = others
  directUrl: string;
  officialBadge: PalestinianOfficialBadge;
  license: string;
  description: string;
  suggestedUseInLesson?: string;
  durationOrPages?: string;
  tags: string[];
}

export type ReviewStatus = 'pending_review' | 'approved_endorsed' | 'revision_requested';

export interface TeacherSuggestedOerResource {
  id: string;
  title: string;
  subject: string;
  grade: string;
  topic: string;
  type: PalestinianOerType;
  directUrl: string;
  licenseType: string;
  pedagogicalJustification: string;
  teacherName: string;
  school: string;
  directorate: string;
  submissionDate: string;
  referenceNumber: string;
  reviewStatus: ReviewStatus;
  reviewNotes?: string;
  reviewedByCommitteeAt?: string;
  committeeDecisionNote?: string;
}

export interface OerCustomGroup {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  createdAt: string;
  resourceIds: string[];
  isShared?: boolean;
  shareCode?: string;
}

export interface TeacherPersonalOerLibrary {
  savedResourceIds: string[];
  groups: OerCustomGroup[];
  personalNotes: Record<string, string>; // resourceId -> teacher note
  suggestedResources: TeacherSuggestedOerResource[];
}
