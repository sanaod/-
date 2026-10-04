export interface SemesterPlanRow {
  id: string;
  unitNumber: number;
  unitTitle: string; // الوحدة التعليمية
  unitCompetencyGoals: string[]; // أهداف الوحدة الكفائية
  lessonNumber: number;
  lessonTitle: string; // اسم الدرس والموضوع
  lessonPeriods: number; // عدد حصص الدرس
  unitTotalPeriods: number; // إجمالي حصص الوحدة
  timeframe: string; // المدة الزمنية باليوم والتاريخ أو بالأسابيع (مثال: الأسبوع الأول: ٥ - ٩ أيلول)
  timeframeWeekNumber?: number; // رقم الأسبوع
  startDate?: string;
  endDate?: string;
  learningResourcesOer: string[]; // مصادر التعلم (OER)
  teachingStrategies: string[]; // استراتيجيات التدريس
  assessmentMethods: string[]; // أدوات وأساليب التقويم
  notes?: string; // ملاحظات وتوجيهات
}

export interface SemesterPlanDocument {
  id: string;
  title: string;
  academicYear: string;
  semester: string; // الفصل الدراسي الأول / الثاني
  country: string;
  ministry: string;
  directorate: string;
  school: string;
  subject: string;
  grade: string;
  section: string;
  teacherName: string;
  supervisorName: string;
  principalName: string;
  weeklyPeriodsCount: number;
  totalSemesterWeeks: number;
  totalSemesterPeriods: number;
  semesterStartDate?: string; // تاريخ بداية الفصل (من تاريخ)
  semesterEndDate?: string; // تاريخ نهاية الفصل (إلى تاريخ)
  generalCompetencies: string[];
  rows: SemesterPlanRow[];
  createdAt: string;
  updatedAt: string;
}
