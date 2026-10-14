import {
  OerLessonPlanData,
  OerActivityStage,
  OerResourceItem,
  LessonPlan,
} from '../types/lessonPlan';
import { getCurrentSemesterName } from '../utils/academicYear';

export interface OerCurriculumEntry {
  id: string;
  subject: string;
  grade: string;
  unitTitle: string;
  lessonTitle: string;
  generalCompetency: string;
  specificCompetency: string;
  observableIndicators: string[];
  suggestedActivities: {
    title: string;
    stageType: 'induction' | 'step' | 'closure';
    allocatedTimeMinutes: number;
    description: string;
    studentRoles: 'individual' | 'pairs' | 'groups' | 'collective';
    studentRolesDetails: string;
    expectedProducts: string;
    primaryResource: OerResourceItem;
    alternativeResource1: OerResourceItem;
    alternativeResource2: OerResourceItem;
    formativeAssessment: string;
    productAssessment: string;
  }[];
  summativeAssessment: {
    description: string;
    alignmentWithIndicators: string;
    assessmentTool: string;
  };
  contingencies: {
    sourceContingencies: string;
    postLessonReflection: string;
    followUpActions: string;
  };
}

export const OER_PALESTINIAN_DATABASE: OerCurriculumEntry[] = [
  // ===================== رياضيات - الصف الثالث =====================
  {
    id: 'math-grade3-placevalue',
    subject: 'الرياضيات',
    grade: 'الصف الثالث الأساسي',
    unitTitle: 'الوحدة الأولى: الأعداد حتى ٩٩٩٩ والقيمة المنزلية',
    lessonTitle: 'القيمة المنزلية للأعداد ضمن ٩٩٩٩ والتمثيل بالمحسوسات والمعداد',
    generalCompetency: 'التفكير الرياضي والحس العددي وتوظيف الأعداد في حل مشكلات حياتية واقعية.',
    specificCompetency: 'تحديد القيمة المنزلية لكل رقم في عدد مكون من ٤ منازل، وتمثيله بطرق متعددة (المحسوس، شبه المجرد، المجرد، والمعداد).',
    observableIndicators: [
      'يسمي المنازل الرياضية الأربع (آحاد، عشرات، مئات، ألوف) بدقة عند قراءة أي عدد ضمن ٩٩٩٩.',
      'يمثل عدداً معطى باستخدام قطع دينز أو المعداد أو لوحة المنازل بدون أخطاء.',
      'يكتب العدد بالصورة الموسعة (مثلاً: ٧٥٣٢ = ٢ + ٣٠ + ٥٠٠ + ٧٠٠٠).',
      'يقارن بين قيم الأرقام بحسب مواقعها في أعداد مستمدة من معالم جغرافية وتاريخية فلسطينية.',
    ],
    suggestedActivities: [
      {
        title: 'التهيئة والتمهيد: استكشاف أرقام من البيئة الفلسطينية',
        stageType: 'induction',
        allocatedTimeMinutes: 7,
        description: 'عرض صورة لجبل الجرمق (أعلى قمة في فلسطين ١٢٠٨م) وتساؤل تحفيزي حول قراءة هذا الارتفاع وتحليل أرقامه.',
        studentRoles: 'collective',
        studentRolesDetails: 'حوار صفي مفتوح وقراءة فردية للعدد مع تمييز دلالة كل منزلة.',
        expectedProducts: 'بطاقات لفظية وسريعة على السبورة لقراءة العدد ١٢٠٨م وتسمية منازله.',
        primaryResource: {
          title: 'كتاب الرياضيات - الصف الثالث - الجزء الأول (ص ١٠-١٤) - بوابة elearn.edu.ps',
          type: 'book',
          directUrl: 'https://elearn.edu.ps/ebooks/math-g3-p1',
          licenseType: 'ministry_elearn',
          notes: 'الكتاب الوزاري المعتمد والمتاح إلكترونياً مجاناً.',
        },
        alternativeResource1: {
          title: 'فيديو تفاعلي: رحلة إلى قمم جبال فلسطين ومفهوم الآلاف - منصة روافد التعليمية',
          type: 'video',
          directUrl: 'https://rawafed.edu.ps/oer/math/g3-mountains-placevalue',
          licenseType: 'creative_commons',
          notes: 'مقطع فيديو قصير (٣ دقائق) يربط الرياضيات بالجغرافيا.',
        },
        alternativeResource2: {
          title: 'بطاقات صور محسوسة لقمم جبال فلسطين ومنازل الأرقام',
          type: 'image',
          licenseType: 'local_teacher',
          notes: 'بطاقات ورقية ملونة مطبوعة مسبقاً تعمل أوفلاين دون إنترنت.',
        },
        formativeAssessment: 'الملاحظة المباشرة لطلاقة الطلبة في قراءة العدد المكون من ٤ منازل والتغذية الراجعة الفورية.',
        productAssessment: 'بطاقة الدخول: كتابة اسم المنزلة للرقم المحدد في بطاقة الاستهلال.',
      },
      {
        title: 'النشاط الأول: النمذجة بالمحسوسات والمعداد ومصادر OER',
        stageType: 'step',
        allocatedTimeMinutes: 15,
        description: 'توزيع الطلبة في مجموعات رباعية غير متجانسة لتمثيل أعداد محددة على لوحة المنازل والمعداد اليدوي والرقمي.',
        studentRoles: 'groups',
        studentRolesDetails: 'كل طالب يتولى منزلة محددة داخل المجموعة (مسؤول الآحاد، العشرات، المئات، الألوف) ويتعاونون لتمثيل العدد.',
        expectedProducts: 'نموذج تمثيل كامل على المعداد ولوحة المنازل وسجل كتابة الصورة الموسعة.',
        primaryResource: {
          title: 'برمجية محاكاة المعداد ولوحة المنازل التفاعلية (Interactive Abacus) - بوابة elearn',
          type: 'link',
          directUrl: 'https://elearn.edu.ps/simulations/abacus-math-g3',
          licenseType: 'ministry_elearn',
          notes: 'برمجية تفاعلية مفتوحة معتمدة من الإشراف التربوي.',
        },
        alternativeResource1: {
          title: 'معداد مدرسي خشبي ومجسمات قطع دينز الحسابية الملموسة',
          type: 'environmental',
          licenseType: 'public_domain',
          notes: 'أدوات ملموسة متاحة في غرفة الصف والمختبر.',
        },
        alternativeResource2: {
          title: 'أزرار وحصى ملونة وعلب كرتونية مقسمة لمنازل الأعداد (خامات بيئية فلسطينية)',
          type: 'environmental',
          licenseType: 'local_teacher',
          notes: 'خامات بيئية بديلة لا تتطلب أي تكلفة ومعدة من خامات محلية.',
        },
        formativeAssessment: 'قائمة شطب لملاحظة تعاون المجموعة وصحة تركيب حبات المعداد وتمثيل قطع الآحاد والآلاف.',
        productAssessment: 'ورقة عمل الفريق التشاركية لتمثيل ٣ أعداد مختلفة بالصورة الموسعة.',
      },
      {
        title: 'النشاط الثاني: مهمة أصيلة - إحصاء أشجار الزيتون في القرية',
        stageType: 'step',
        allocatedTimeMinutes: 12,
        description: 'مسألة تطبيقية واقعية: بلغ عدد أشجار الزيتون في حقول قرية فلسطينية ٤٨٥٦ شجرة. على الطلبة تفكيك هذا العدد وتحديد قيم كل رقم.',
        studentRoles: 'pairs',
        studentRolesDetails: 'عمل ثنائي؛ زميل يحدد القيمة وزميل يكتب التبرير الرياضي ثم يتبادلان الأدوار.',
        expectedProducts: 'ملصق ثنائي ملون يوضح القيمة المنزلية لأشجار الزيتون وربطها برمزية الصمود.',
        primaryResource: {
          title: 'بطاقة التعلم الذاتي رقم (٢): القيمة المنزلية في مواسم الخير - منصة روافد OER',
          type: 'link',
          directUrl: 'https://rawafed.edu.ps/cards/math-g3-olive-placevalue.pdf',
          licenseType: 'creative_commons',
          notes: 'بطاقة تعلم استدراكي وتطبيقي مرخصة للمشاع الإبداعي CC-BY-SA.',
        },
        alternativeResource1: {
          title: 'مسألة تدريبية من الكتاب المدرسي المقرر ص ١٢ تمرين (٤)',
          type: 'book',
          directUrl: 'https://elearn.edu.ps/ebooks/math-g3-p1#page=12',
          licenseType: 'ministry_elearn',
          notes: 'التدريب الورقي المقابل في الكتاب.',
        },
        alternativeResource2: {
          title: 'حبات زيتون حقيقية وأوراق شجر في علب زجاجية للعد والتمثيل البيئي',
          type: 'environmental',
          licenseType: 'local_teacher',
          notes: 'وسيلة محسوسة من موسم قطاف الزيتون في فلسطين.',
        },
        formativeAssessment: 'طرح أسئلة سابرة أثناء تجول المعلم بين الثنائيات: ما الفرق بين قيمة الرقم ٨ وقيمة الرقم ٤ هنا؟',
        productAssessment: 'سلم تقدير لفظي مصغر (Rubric) من ٣ مستويات لتقويم دقة الحل والتبرير.',
      },
      {
        title: 'الختام والغلق: بطاقة الخروج والتأمل الختامي',
        stageType: 'closure',
        allocatedTimeMinutes: 6,
        description: 'حل تحدي بطاقة الخروج وتلخيص المفاهيم الأساسية، وربطها بنشاط الاستكشاف المنزلي بمساعدة الأسرة.',
        studentRoles: 'individual',
        studentRolesDetails: 'إجابة فردية مستقلة لكل طالب للتأكد من تحقق المؤشرات لدى الجميع.',
        expectedProducts: 'بطاقة خروج فردية تتضمن كتابة عددين بالصورة الموسعة وقراءتهما جهرياً للمعلم.',
        primaryResource: {
          title: 'بطاقة الخروج الرقمية المعتمدة - بوابة التعليم الإلكتروني elearn.edu.ps',
          type: 'link',
          directUrl: 'https://elearn.edu.ps/exit-tickets/math-placevalue-g3',
          licenseType: 'ministry_elearn',
          notes: 'نموذج سريع قابل للعرض على الشاشة أو الطباعة.',
        },
        alternativeResource1: {
          title: 'قوالب بطاقات خروج مطبوعة مسبقاً (A5)',
          type: 'book',
          licenseType: 'public_domain',
          notes: 'أوراق مطبوعة باللونين الأبيض والأسود.',
        },
        alternativeResource2: {
          title: 'دفتر الحصة المدرسي واللوح الفردي الصغير (Whiteboard mini)',
          type: 'environmental',
          licenseType: 'local_teacher',
          notes: 'استخدام الألواح الفردية الصغيرة وكتابة الإجابة ورفعها بإشارة المعلم.',
        },
        formativeAssessment: 'رصد إجابات الألواح الفردية بنظرة شمولية وحصر الطلبة الذين يحتاجون إلى تثبيت.',
        productAssessment: 'جمع بطاقات الخروج ومراجعتها لتحديد خطة الدعم الفردية.',
      },
    ],
    summativeAssessment: {
      description: 'مهمة تقويم ختامية لقياس تحقق الكفاية الخاصة من خلال حل اختبار قصير يتضمن: كتابة القيمة المنزلية لأرقام محددة، كتابة الصورة الموسعة، وتمثيل عدد على المعداد.',
      alignmentWithIndicators: 'يقيس السؤال الأول والثاني مؤشري تسمية المنازل وكتابة الصورة الموسعة، ويقيس السؤال الثالث مؤشر التمثيل المادي والمقارنة.',
      assessmentTool: 'مقياس تقدير لفظي (Rubric) محدد المعايير: (متميز ٤، كفء ٣، نامٍ ٢، مبتدئ ١) مرفق بسجل الملاحظة الصفي.',
    },
    contingencies: {
      sourceContingencies: 'في حال انقطاع التيار الكهربائي أو شبكة الإنترنت، يتم الاستغناء كلياً عن برمجية المحاكاة والشاشة التفاعلية، والاعتماد الفوري على معداد الصف الخشبي، والبطاقات الورقية المطبوعة مسبقاً، والمحسوسات البيئية (الحصى والأزرار).',
      postLessonReflection: 'أظهر الطلبة حماساً ملحوظاً عند استخدام المعداد والمحسوسات، وأسهم ربط الأعداد بجبال فلسطين في إثارة الفضول والانتماء؛ يحتاج ٣ طلبة لمتابعة فردية في منزلة الألوف عند وجود الصفر.',
      followUpActions: 'تخصيص ورقة عمل داعمة للطلبة الثلاثة خلال حصة الأنشطة، وتكليف الطلبة المتميزين بتصميم بطاقات ألغاز رياضية للأقران.',
    },
  },

  // ===================== لغة عربية - الصف الثاني =====================
  {
    id: 'arabic-grade2-reading',
    subject: 'اللغة العربية',
    grade: 'الصف الثاني الأساسي',
    unitTitle: 'الوحدة الثانية: في حديقة بيتنا',
    lessonTitle: 'القراءة الجهرية المعبرة وتحليل الكلمات إلى مقاطع وصوتيات',
    generalCompetency: 'القرائية والتواصل اللغوي السليم والتعبير الشفوي والكتابي بلغة عربية فصيحة ميسرة.',
    specificCompetency: 'قراءة نص الدرس قراءة جهرية سليمة ومعبرة، وتحليل الكلمات المشددة والممدودة إلى مقاطعها الصوتية.',
    observableIndicators: [
      'يقرأ النص قراءة جهرية صحيحة بالحركات وبطلاقة تناسب الصف الثاني.',
      'يميز بين اللام الشمسية واللام القمرية نطقاً وكتابة.',
      'يحلل كلمات تحتوي حروف مد وتضعيف إلى مقاطع صوتية صحيحة.',
      'يعبر شفوياً بجمل تامة عن فكرة الدرس الرئيسية المرتبطة بجمال الطبيعة في فلسطين.',
    ],
    suggestedActivities: [
      {
        title: 'التمهيد: صندوق الاستكشاف البصري وحكاية العصفور',
        stageType: 'induction',
        allocatedTimeMinutes: 8,
        description: 'عرض مجسم عصفور صغير وصوت تغريد من تطبيق الهاتف لإثارة الخيال، ثم سؤال: أين تبني العصافير أعشاشها في بلادنا؟',
        studentRoles: 'collective',
        studentRolesDetails: 'محادثة شفوية معبرة وتوقع موضوع الدرس.',
        expectedProducts: 'جمل شفوية معبرة تسجل بعض مفرداتها على شجرة الكلمات.',
        primaryResource: {
          title: 'كتاب لغتنا الجميلة - الصف الثاني - الجزء الأول (ص ٢٤-٢٨) - بوابة elearn.edu.ps',
          type: 'book',
          directUrl: 'https://elearn.edu.ps/ebooks/arabic-g2-p1',
          licenseType: 'ministry_elearn',
          notes: 'الكتاب المدرسي المعتمد من وزارة التربية والتعليم.',
        },
        alternativeResource1: {
          title: 'تسجيل صوتي معبر لنص الدرس بصوت إذاعي ميسر للأطفال - منصة روافد',
          type: 'video',
          directUrl: 'https://rawafed.edu.ps/audio/arabic-g2-story',
          licenseType: 'creative_commons',
          notes: 'تسجيل تعليمي مرخص بالمشاع الإبداعي.',
        },
        alternativeResource2: {
          title: 'لوحة الحائط المصورة (بوستر ملون) للمشهد القصصي في حديقة البيت',
          type: 'image',
          licenseType: 'public_domain',
          notes: 'وسيلة بصرية مطبوعة مكبرة تعلق على السبورة.',
        },
        formativeAssessment: 'ملاحظة نطق مخارج الحروف أثناء الحديث الشفوي.',
        productAssessment: 'إلقاء جملة تمهيدية معبرة من قبل ٣ طلاب ممثلين عن الصف.',
      },
      {
        title: 'النشاط الأول: قطار المقاطع الصوتية والحروف الملونة',
        stageType: 'step',
        allocatedTimeMinutes: 16,
        description: 'تطبيق إستراتيجية قطار المقاطع؛ تركيب بطاقات الحروف على عربات القطار لتحليل الكلمات المشددة.',
        studentRoles: 'groups',
        studentRolesDetails: 'مجموعات صغيرة (٤ طلاب) يركبون عربات قطار الكلمات ثم يقرأونها بصوت جماعي متناغم.',
        expectedProducts: 'تركيب ٥ كلمات جديدة على عربات القطار وتحليلها بالصفق الإيقاعي.',
        primaryResource: {
          title: 'لعبة قطار المقاطع الصوتية التفاعلية - بوابة التعليم الإلكتروني elearn.edu.ps',
          type: 'link',
          directUrl: 'https://elearn.edu.ps/games/arabic-syllables-g2',
          licenseType: 'ministry_elearn',
          notes: 'نشاط تفاعلي مصمم وفق منهاج الصف الثاني الفلسطيني.',
        },
        alternativeResource1: {
          title: 'بطاقات كرتونية ملونة ومغناطيسية للمقاطع الصوتية والحركات',
          type: 'image',
          licenseType: 'local_teacher',
          notes: 'بطاقات حسية ملموسة تثبت على السبورة المغناطيسية.',
        },
        alternativeResource2: {
          title: 'أغطية قوارير ماء ملونة كتب عليها حروف المد والحركات للتركيب اليدوي',
          type: 'environmental',
          licenseType: 'local_teacher',
          notes: 'خامات بيئية معاد تدويرها لتحفيز التعلم النشط والملموس.',
        },
        formativeAssessment: 'الملاحظة والتدخل السريع لتصويب تفكيك الحرف المشدد إلى ساكن ومتحرك.',
        productAssessment: 'قائمة رصد (Checklist) لصحة تفكيك الكلمات وتركيبها.',
      },
      {
        title: 'الختام والتقويم: مسرح الدمى وبطاقة الكفاية القرائية',
        stageType: 'closure',
        allocatedTimeMinutes: 16,
        description: 'قراءة فقرة النص باستخدام دمية اليد المسرحية، ثم تنفيذ بطاقة الكفاية القرائية الختامية.',
        studentRoles: 'individual',
        studentRolesDetails: 'كل طالب يقرأ سطراً ممثلاً المعنى بصوته ثم يحلل كلمة واحدة كتابياً.',
        expectedProducts: 'بطاقة قراءة معيارية مدون عليها ملاحظات الإتقان.',
        primaryResource: {
          title: 'نموذج سلم التقدير اللفظي للقرائية للصف الثاني - بوابة elearn.edu.ps',
          type: 'link',
          directUrl: 'https://elearn.edu.ps/rubrics/arabic-reading-g2',
          licenseType: 'ministry_elearn',
          notes: 'أداة تقويم رسمية معتمدة لقياس المؤشرات القرائية.',
        },
        alternativeResource1: {
          title: 'بطاقة ورقية للتقويم الذاتي (أنا أقرأ بطلاقة وأراعي الحركات)',
          type: 'book',
          licenseType: 'creative_commons',
          notes: 'استمارة تقويم ذاتي للأطفال مع وجوه تعبيرية.',
        },
        alternativeResource2: {
          title: 'دمى يدوية مصنوعة من أكياس ورقية وقماش بيئي محلي',
          type: 'environmental',
          licenseType: 'local_teacher',
          notes: 'وسيلة تعبيرية تشجع الطلبة الخجولين على القراءة الجهرية.',
        },
        formativeAssessment: 'تقويم الأقران: طالب يستمع لزميله ويبدي ملاحظة إيجابية على نبرة الصوت.',
        productAssessment: 'درجة سلم التقدير اللفظي وفق معايير (الضبط، الطلاقة، مراعاة علامات الترقيم).',
      },
    ],
    summativeAssessment: {
      description: 'قراءة جهرية لفصل قصير لم يسبق التدرب عليه بنفس المستوى التركيبي، مع تحليل ثلاث كلمات متنوعة (شمسية، قمرية، ممدودة).',
      alignmentWithIndicators: 'يرتبط مباشرة بمؤشرات نطق الحركات والتمييز بين اللامين الشمسية والقمرية والتحليل الصوتي.',
      assessmentTool: 'استمارة رصد القرائية الفردية التراكمية المعتمدة في مديريات التربية والتعليم.',
    },
    contingencies: {
      sourceContingencies: 'في حال عدم توفر اتصال بالإنترنت لتشغيل اللعبة التفاعلية، يتم توزيع بطاقات أغطية القوارير الملونة وصناديق الحروف والسبورات الصغيرة فوراً دون أي هدر في وقت الحصة.',
      postLessonReflection: 'أثبت الصفق الإيقاعي فاعلية عالية في استيعاب التقطيع الصوتي؛ يحتاج طفلان لتدريبات إضافية على اللام الشمسية وكتابة الشدة.',
      followUpActions: 'تزويد ولي الأمر ببطاقة متابعة منزلية مبسطة تحتوي ٣ كلمات مشددة للقراءة والتحليل الصوتي التشاركي.',
    },
  },

  // ===================== علوم وحياة - الصف الرابع =====================
  {
    id: 'science-grade4-plants',
    subject: 'العلوم والحياة',
    grade: 'الصف الرابع الأساسي',
    unitTitle: 'الوحدة الأولى: النباتات والبيئة المحيطة',
    lessonTitle: 'أجزاء النبات الزهري ووظائفها وتكيفها مع البيئة الفلسطينية',
    generalCompetency: 'الاستقصاء العلمي واكتشاف خصائص الكائنات الحية وتقدير البيئة والتنوع الحيوي الفلسطيني.',
    specificCompetency: 'استقصاء أجزاء النبات الزهري (الجذر، الساق، الأوراق، الأزهار، الثمار) ومقارنة وظائفها وعوامل تكيفها مع قلة المياه.',
    observableIndicators: [
      'يشير إلى أجزاء نبات حقيقي مأخوذ من حديقة المدرسة ويسميها بمصطلحات علمية دقيقة.',
      'يستنتج وظيفة كل جزء من أجزاء النبات من خلال تجربة بسيطة أو ملاحظة مباشرة.',
      'يقارن بين أنواع الجذور (وتدية، ليفية) في نباتات فلسطينية شائعة (كالبصل والقمح والزيتون).',
      'يوضح دور أشجار الزيتون والتين في الحفاظ على خصوبة التربة ومقاومة الجفاف.',
    ],
    suggestedActivities: [
      {
        title: 'التهيئة والتمهيد: جولة في حديقة المدرسة أو استكشاف عينات حية',
        stageType: 'induction',
        allocatedTimeMinutes: 8,
        description: 'جولة استكشافية سريعة لمدة ٥ دقائق في حديقة المدرسة لجمع نباتات عشبية صغيرة كاملة الجذور، أو فحص نبتة حقيقية داخل الصف.',
        studentRoles: 'groups',
        studentRolesDetails: 'كل مجموعة تفحص نبتة بعدسة مكبرة وتدون ملاحظاتها حول شكل الجذور والأوراق.',
        expectedProducts: 'رسم تخطيطي أولي سريع للنبتة مع كتابة الأسماء على الأجزاء.',
        primaryResource: {
          title: 'كتاب العلوم والحياة - الصف الرابع - الجزء الأول (ص ٦-١١) - بوابة elearn.edu.ps',
          type: 'book',
          directUrl: 'https://elearn.edu.ps/ebooks/science-g4-p1',
          licenseType: 'ministry_elearn',
          notes: 'الكتاب المدرسي المعتمد والمنشور على البوابة التعليمية.',
        },
        alternativeResource1: {
          title: 'محاكاة تفاعلية: استكشاف أجزاء النبات ووظائفها - PhET / روافد OER',
          type: 'link',
          directUrl: 'https://rawafed.edu.ps/oer/science/g4-plant-parts-sim',
          licenseType: 'creative_commons',
          notes: 'برمجية محاكاة علمية ثلاثية الأبعاد مرخصة للمشاع الإبداعي.',
        },
        alternativeResource2: {
          title: 'عينات نباتية حية من حديقة المدرسة (أعشاب خبيزة ونعناع بري وجذور بصل)',
          type: 'environmental',
          licenseType: 'public_domain',
          notes: 'عينات طبيعية حقيقية ملموسة من البيئة المحيطة.',
        },
        formativeAssessment: 'ملاحظة طريقة فحص الطلبة للنبات ومناقشتهم في سبب وجود الجذر تحت التراب.',
        productAssessment: 'المخطط البصري الأولي لأجزاء النبات المسجل في دفتر الاستكشاف.',
      },
      {
        title: 'النشاط الاستقصائي: تجربة انتقال الماء عبر الساق الملون',
        stageType: 'step',
        allocatedTimeMinutes: 18,
        description: 'ملاحظة نتائج نقع ساق كرفس أو زهرة بيضاء في ماء ملون بحبر أحمر منذ الصباح، لاكتشاف وظيفة الساق والأوعية الناقلة.',
        studentRoles: 'pairs',
        studentRolesDetails: 'ثنائيات؛ طالب يقص مقطعاً عرضياً بمقص بلاستيكي آمن والآخر يفحصه بالعدسة ويسجل الملاحظة.',
        expectedProducts: 'تقرير استقصائي مصغر: استنتاج أن الساق ينقل الماء والأملاح من الجذور إلى الأوراق.',
        primaryResource: {
          title: 'فيديو تجربة انتقال السوائل في النبات - القناة التعليمية لوزارة التربية',
          type: 'video',
          directUrl: 'https://elearn.edu.ps/videos/science-g4-stem-transport',
          licenseType: 'ministry_elearn',
          notes: 'فيديو عملي موثق معتمد من وزارة التربية والتعليم.',
        },
        alternativeResource1: {
          title: 'بطاقة نشاط استقصائي: كيف يشرب النبات؟ - منصة مصادر التعلم المفتوحة OER',
          type: 'link',
          directUrl: 'https://rawafed.edu.ps/cards/science-g4-stem-experiment.pdf',
          licenseType: 'creative_commons',
          notes: 'دليل خطوات التجربة بصيغة PDF مرخصة للطبع وإعادة الاستخدام.',
        },
        alternativeResource2: {
          title: 'أكواب بلاستيكية شفافة، ماء، صبغة طعام، سيقان كرفس وأزهار برية محلية',
          type: 'environmental',
          licenseType: 'local_teacher',
          notes: 'أدوات مخبرية ومحلية متوفرة في كل مدرسة ومنزل.',
        },
        formativeAssessment: 'توجيه أسئلة تفكير عليا: ماذا تتوقع أن يحدث للزهرة إذا قطعنا ساقها وتركناها في الهواء؟',
        productAssessment: 'سجل الملاحظة والاستنتاج العلمي في ورقة العمل التفاعلية.',
      },
      {
        title: 'الختام والغلق: مسابقة مطابقة الوظائف وتحدي شجرة الزيتون',
        stageType: 'closure',
        allocatedTimeMinutes: 14,
        description: 'لعبة بطاقات الوظائف: كل طالب يحمل بطاقة وظيفة (مثلاً: تثبيت النبات، صنع الغذاء، امتصاص الماء) ويطابقها مع الجزء المناسب.',
        studentRoles: 'individual',
        studentRolesDetails: 'كل طالب يحل لغز بطاقة التحدي بمفرده ثم يتحقق ذاتياً.',
        expectedProducts: 'مخطط شجري مكتمل يربط كل جزء بوظيفته وتكيفه في البيئة الفلسطينية الجافة.',
        primaryResource: {
          title: 'لعبة مطابقة أجزاء النبات الرقمية - بوابة elearn.edu.ps',
          type: 'link',
          directUrl: 'https://elearn.edu.ps/games/science-g4-plant-match',
          licenseType: 'ministry_elearn',
          notes: 'لعبة ختامية تفاعلية تعطي تغذية راجعة فورية للدرجات.',
        },
        alternativeResource1: {
          title: 'بطاقات دومينو العلوم: الأجزاء والوظائف والتكيف',
          type: 'image',
          licenseType: 'creative_commons',
          notes: 'أوراق لعب تعليمية مطبوعة ومغلفة حرارياً.',
        },
        alternativeResource2: {
          title: 'لوحة جدارية من الكرتون المقوى مع قطع فيلكرو لصق وتثبيت يدوية',
          type: 'environmental',
          licenseType: 'local_teacher',
          notes: 'لوحة صفية دائمة تفاعلية قابلة لإعادة الاستخدام.',
        },
        formativeAssessment: 'رصد سرعة ودقة مطابقة الجزء بالوظيفة والتصويب التشاركي الفوري.',
        productAssessment: 'سلم تقدير المهمة الأصيلة ونتائج بطاقة المطابقة الختامية.',
      },
    ],
    summativeAssessment: {
      description: 'مهمة أداء تقويمية ختامية: رسم نبتة زهرية كاملة وتسمية أجزائها ووظائفها بدقة، وتفسير سبب عمق جذور شجرة الزيتون في الأرض الفلسطينية.',
      alignmentWithIndicators: 'يرتبط بمؤشرات التسمية العلمية، استنتاج الوظائف، وربط التكيف ببيئة فلسطين الجبلية.',
      assessmentTool: 'مقياس متدرج لتقويم الأداء العملي والرسم العلمي من ٤ معايير (الدقة، الوظيفة، التكيف، الترتيب).',
    },
    contingencies: {
      sourceContingencies: 'في حال عدم توفر شاشة تفاعلية أو عينات كرفس، يتم الاعتماد على أوراق شجر وزهور برية من ساحة المدرسة، مع عرض لوحة الحائط الملونة وتشريح الزهرة يدوياً أمام الطلبة.',
      postLessonReflection: 'أثارت التجربة العملية دهشة الطلبة عند رؤية الحبر داخل الأوعية الخشبية في الساق؛ يحتاج التمييز بين أنواع الجذور لنشاط إضافي.',
      followUpActions: 'تكليف الطلبة بوضع بذور عدس أو فول على قطن مبلل في المنزل لمراقبة نمو الجذور والساق وتوثيق ذلك في سجل أسبوعي.',
    },
  },

  // ===================== تنشئة وطنية واجتماعية - الصف الثالث =====================
  {
    id: 'social-grade3-heritage',
    subject: 'التنشئة الوطنية والاجتماعية',
    grade: 'الصف الثالث الأساسي',
    unitTitle: 'الوحدة الثانية: تراثنا وهويتنا الوطنية',
    lessonTitle: 'التراث الشعبي الفلسطيني: معالم وقيم وأزياء وأهازيج الأجداد',
    generalCompetency: 'تعزيز الهوية الوطنية الفلسطينية وتقدير التراث المادي والمعنوي والمواطنة الصالحة.',
    specificCompetency: 'التعرف إلى عناصر التراث الشعبي الفلسطيني (الثوب، الكوفية، الدبكة، الأكلات الشعبية، الأدوات القديمة) والاعتزاز بها وحمايتها.',
    observableIndicators: [
      'يسمي ثلاثة من عناصر التراث الشعبي الفلسطيني المعروضة أمامه بالاسم الشعبي الصحيح.',
      'يميز بين أثواب المدن والقرى الفلسطينية من خلال التطريز والرموز التراثية.',
      'يوضح أهمية المحافظة على التراث كرمز للتمسك بالأرض والهوية.',
      'يشارك في إنتاج بطاقة أو لوحة فنية تعبر عن التراث الشعبي الفلسطيني.',
    ],
    suggestedActivities: [
      {
        title: 'التهيئة والتمهيد: صندوق العروس التراثي والمقتنيات القديمة',
        stageType: 'induction',
        allocatedTimeMinutes: 8,
        description: 'فتح صندوق تراثي قديم يحتوي كوفية فلسطينية، إبريق فخار، مهباش قهوة، وثوب مطرز، وتخمين استخدامات هذه الأدوات.',
        studentRoles: 'collective',
        studentRolesDetails: 'ملاحظة ولمس المحسوسات وطرح أسئلة حول ذكريات الأجداد.',
        expectedProducts: 'قائمة بالمفردات التراثية الفلسطينية على لوحة المفاهيم.',
        primaryResource: {
          title: 'كتاب التنشئة الوطنية والاجتماعية - الصف الثالث (ص ٣٢-٣٧) - بوابة elearn.edu.ps',
          type: 'book',
          directUrl: 'https://elearn.edu.ps/ebooks/social-g3',
          licenseType: 'ministry_elearn',
          notes: 'الكتاب المدرسي المعتمد من وزارة التربية والتعليم العالي.',
        },
        alternativeResource1: {
          title: 'معرض افتراضي متحفي: مقتنيات التراث الفلسطيني - منصة روافد OER',
          type: 'link',
          directUrl: 'https://rawafed.edu.ps/museum/palestinian-heritage-virtual',
          licenseType: 'creative_commons',
          notes: 'جولة افتراضية تفاعلية ثلاثية الأبعاد في المتحف التراثي.',
        },
        alternativeResource2: {
          title: 'مقتنيات حقيقية من بيوت المعلم والطلبة (كوفية، مطرزات، أوانٍ نحاسية وفخارية)',
          type: 'environmental',
          licenseType: 'local_teacher',
          notes: 'أدوات تراثية حية وملموسة من البيئة المنزلية للطلبة.',
        },
        formativeAssessment: 'ملاحظة تفاعل الطلبة ومشاعر الاعتزاز التي يبدونها تجاه الأدوات القديمة.',
        productAssessment: 'تسمية الأدوات الشفوية وتسجيل أسمائها في بطاقة الاستهلال.',
      },
      {
        title: 'النشاط الأول: محطات التراث التعاونية (محطة الثوب، الأكلات، الأهازيج، الأدوات)',
        stageType: 'step',
        allocatedTimeMinutes: 18,
        description: 'تقسيم الصف إلى ٤ محطات استكشافية؛ محطة تفحص التطريز، محطة الأدوات الزراعية، محطة الأهازيج الشعبية، ومحطة الأكلات.',
        studentRoles: 'groups',
        studentRolesDetails: 'كل مجموعة تمضي ٤ دقائق في محطة ثم تنتقل للأخرى لتدوين أبرز المكتشفات.',
        expectedProducts: 'ملصق تراثي لكل مجموعة يجمع عناصر المحطات الأربع.',
        primaryResource: {
          title: 'ألبوم صور وأفلام التراث الرقمي المعتمد - البوابة التعليمية elearn.edu.ps',
          type: 'video',
          directUrl: 'https://elearn.edu.ps/heritage/multimedia-archive',
          licenseType: 'ministry_elearn',
          notes: 'أرشيف صوتي ومرئي رسمي لحفظ التراث والأهازيج الوطنية.',
        },
        alternativeResource1: {
          title: 'بطاقات التراث المصورة OER: عاداتنا وتقاليدنا في قرانا ومدننا',
          type: 'image',
          directUrl: 'https://rawafed.edu.ps/oer/heritage-cards-g3.pdf',
          licenseType: 'creative_commons',
          notes: 'بطاقات ملونة عالية الدقة بصيغة PDF مرخصة للطباعة.',
        },
        alternativeResource2: {
          title: 'أقمشة كنعانية وخيوط تطريز وقش قمح لصنع أطباق القش التقليدية',
          type: 'environmental',
          licenseType: 'local_teacher',
          notes: 'خامات بيئية تمكن الطلبة من لمس خيوط الحرير وتجربة غرزة التطريز.',
        },
        formativeAssessment: 'التجول بين المحطات والاستماع لحوارات الطلبة وتوجيههم لتقدير تعب الأجداد.',
        productAssessment: 'لوحة المحطات التعاونية ومحتوى بطاقة الاستكشاف.',
      },
      {
        title: 'الختام والتقويم: رسالة فخر وتحدي بطاقة الخروج التراثية',
        stageType: 'closure',
        allocatedTimeMinutes: 14,
        description: 'كتابة جملة فخر بالتراث الفلسطيني على بطاقة على شكل خريطة فلسطين أو ثوب مطرز وتعليقها على جدارية الصف.',
        studentRoles: 'individual',
        studentRolesDetails: 'تعبير فردي يعكس الانتماء والقيم المكتسبة في الحصة.',
        expectedProducts: 'جدارية تراثية صفية متكاملة تتضمن بطاقات الطلبة ورسائلهم.',
        primaryResource: {
          title: 'بطاقة التقييم القيمي والوجداني - بوابة elearn.edu.ps',
          type: 'link',
          directUrl: 'https://elearn.edu.ps/values/heritage-pride-rubric',
          licenseType: 'ministry_elearn',
          notes: 'استمارة تقييم نواتج التعلم الوجدانية والقيم الوطنية.',
        },
        alternativeResource1: {
          title: 'قوالب بطاقات ورقية مفرغة على شكل مفتاح العودة والثوب الفلسطيني',
          type: 'image',
          licenseType: 'public_domain',
          notes: 'بطاقات جاهزة للتلوين والكتابة.',
        },
        alternativeResource2: {
          title: 'ورق كرتون مقوى معاد تدويره ملون بألوان العلم الفلسطيني الأربعة',
          type: 'environmental',
          licenseType: 'local_teacher',
          notes: 'خامات صفية بسيطة متاحة دائماً.',
        },
        formativeAssessment: 'ملاحظة المعاني الوطنية والقيم المعبر عنها في كتابات الطلبة.',
        productAssessment: 'جودة البطاقة الفردية وإتقان مطابقة الرموز التراثية بمعانيها.',
      },
    ],
    summativeAssessment: {
      description: 'مهمة أداء نهائية: تقديم فقرة إذاعية صفية أو كتابة فقرة تعبيرية من ٣ أسطر توضح لماذا نعتز بثوبنا وتراثنا وكيف نحميه من التزييف.',
      alignmentWithIndicators: 'يرتبط بمؤشرات تسمية عناصر التراث، إدراك أهمية حمايته، والتعبير الفني واللغوي السليم.',
      assessmentTool: 'سلم تقدير الكفايات القيمية والوطنية (Rubric) ذو المعايير الثلاثة: المعرفة، الاعتزاز، والمشاركة.',
    },
    contingencies: {
      sourceContingencies: 'في حال تعذر الدخول للمتحف الافتراضي، يتم الاعتماد الكامل على المعرض الصفي الحسي من المقتنيات الحقيقية التي أحضرها المعلم والطلبة، مع إنشاد أهزوجة تراثية من الذاكرة الشفوية الحية.',
      postLessonReflection: 'تفاعل استثنائي من الطلبة مع مقتنيات التراث الحية، وروى بعض الطلبة قصصاً سمعوها من أجدادهم؛ أضافت الحصة بعداً وجدانياً عميقاً.',
      followUpActions: 'دعوة إحدى الجدات أو الحرفيين في القرية في حصة النشاط القادمة لرواية قصة شعبية أو تعليم الطلبة صناعة أطباق القش.',
    },
  },

  // ===================== تربية إسلامية - الصف الأول =====================
  {
    id: 'islamic-grade1-cleanliness',
    subject: 'التربية الإسلامية',
    grade: 'الصف الأول الأساسي',
    unitTitle: 'الوحدة الثالثة: آداب وأخلاق إسلامية',
    lessonTitle: 'النظافة من الإيمان والوضوء الصغير ورعاية البيئة',
    generalCompetency: 'تمثل القيم الإسلامية السمحة والآداب السلوكية في النظافة الشخصية ورعاية البيئة المحيطة.',
    specificCompetency: 'تطبيق خطوات الوضوء بالترتيب والمحافظة على نظافة البدن والصف، وإدراك قيمة النظافة في الإسلام.',
    observableIndicators: [
      'يردد الحديث النبوي الشريف: (الطهور شطر الإيمان) أو (النظافة من الإيمان) بفهم لمعناه.',
      'يحاكي خطوات الوضوء عملياً بالترتيب الصحيح أمام المعلم والزملاء.',
      'يمارس سلوك النظافة بوضع المهملات في سلتها المخصصة وترتيب مقعده.',
      'يذكر طريقتين لترشيد استهلاك الماء أثناء غسل اليدين والوضوء.',
    ],
    suggestedActivities: [
      {
        title: 'التهيئة: قصة الصابونة والقطرة والطفل النظيف',
        stageType: 'induction',
        allocatedTimeMinutes: 7,
        description: 'قصة تمثيلية مشوقة بدمية الصابونة وقطرة الماء، وحوار حول شعور الإنسان عندما يكون نظيفاً وطاهراً.',
        studentRoles: 'collective',
        studentRolesDetails: 'الاستماع والمشاركة في ترديد أنشودة النظافة بحركات الأيدي.',
        expectedProducts: 'ترديد نشيد النظافة وحفظ معنى الحديث النبوي الشريف.',
        primaryResource: {
          title: 'كتاب التربية الإسلامية - الصف الأول - الجزء الأول (ص ٤٠-٤٥) - بوابة elearn.edu.ps',
          type: 'book',
          directUrl: 'https://elearn.edu.ps/ebooks/islamic-g1-p1',
          licenseType: 'ministry_elearn',
          notes: 'الكتاب الوزاري المعتمد والمصور للصف الأول.',
        },
        alternativeResource1: {
          title: 'أنشودة الوضوء والنظافة الكرتونية الهادفة للأطفال - منصة روافد OER',
          type: 'video',
          directUrl: 'https://rawafed.edu.ps/video/islamic-g1-ablution-song',
          licenseType: 'creative_commons',
          notes: 'مقطع فيديو كرتوني تربوي مرخص.',
        },
        alternativeResource2: {
          title: 'لوحة صور كرتونية مكبرة لخطوات الوضوء والنظافة الشخصية',
          type: 'image',
          licenseType: 'public_domain',
          notes: 'وسيلة بصرية ملونة تعلق على لوحة الإعلانات.',
        },
        formativeAssessment: 'ملاحظة انتباه الأطفال وترديدهم للحديث الشريف وعبارات الشكر.',
        productAssessment: 'الإجابة الشفوية عن سؤال: ماذا تفعل قبل أن تأكل طعامك؟',
      },
      {
        title: 'النشاط العملي: محاكاة الوضوء وترشيد قطرات الماء',
        stageType: 'step',
        allocatedTimeMinutes: 18,
        description: 'تطبيق عملي لمحاكاة حركات الوضوء بدون إهدار للماء باستخدام كوب ماء صغير ووعاء نظيف.',
        studentRoles: 'pairs',
        studentRolesDetails: 'طالب يحاكي الحركة وزميله يوجهه ويشجعه بابتسامة، ثم التبديل.',
        expectedProducts: 'أداء عملي صحيح لحركات الوضوء وترديد البسملة والدعاء.',
        primaryResource: {
          title: 'دليل المعلم التفاعلي للتربية الإسلامية للصف الأول - بوابة elearn.edu.ps',
          type: 'link',
          directUrl: 'https://elearn.edu.ps/guides/islamic-g1-teacher-guide',
          licenseType: 'ministry_elearn',
          notes: 'دليل إرشادات الأنشطة العملية من وزارة التربية والتعليم.',
        },
        alternativeResource1: {
          title: 'بطاقات الترتيب المصورة لخطوات الوضوء السبعة',
          type: 'image',
          licenseType: 'creative_commons',
          notes: 'بطاقات ترتيب متسلسل يرتبها الطفل بيده.',
        },
        alternativeResource2: {
          title: 'أكواب كرتونية، وعاء بلاستيكي، منشفة قطنية قطرات ماء حقيقية',
          type: 'environmental',
          licenseType: 'local_teacher',
          notes: 'أدوات صفية آمنة للمحاكاة الملموسة.',
        },
        formativeAssessment: 'التوجيه اللطيف والمباشر للأطفال أثناء غسل اليدين والمسح على الرأس.',
        productAssessment: 'قائمة رصد مصورة لإتقان خطوات الوضوء بالترتيب.',
      },
      {
        title: 'الختام والغلق: حملة حماة النظافة في الصف وميدالية النظافة',
        stageType: 'closure',
        allocatedTimeMinutes: 15,
        description: 'تنفيذ دقيقة النظافة الذهبية؛ كل طالب ينظف تحت مقعده ويرتب أدواته، ثم يتقلد شارة حامي النظافة.',
        studentRoles: 'individual',
        studentRolesDetails: 'ممارسة سلوك عملي مباشر للنظافة الصرفية والمسؤولية الفردية.',
        expectedProducts: 'غرفة صفية نظيفة تماماً وشارة ميدالية النظافة على صدر كل طالب.',
        primaryResource: {
          title: 'شارة (أنا طفل نظيف ومسلم) المعتمدة - بوابة elearn.edu.ps',
          type: 'image',
          directUrl: 'https://elearn.edu.ps/badges/islamic-cleanliness-badge',
          licenseType: 'ministry_elearn',
          notes: 'ملصقات تحفيزية معتمدة من الإرشاد التربوي.',
        },
        alternativeResource1: {
          title: 'أوراق تلوين بطاقة الوضوء والنظافة OER',
          type: 'book',
          licenseType: 'creative_commons',
          notes: 'ورقة عمل تلوين ممتعة للأطفال في سن السادسة.',
        },
        alternativeResource2: {
          title: 'أشرطة قماشية ملونة وميداليات ورقية مصنوعة من الكرتون المقوى',
          type: 'environmental',
          licenseType: 'local_teacher',
          notes: 'ميداليات تشجيعية بسيطة ومبهجة.',
        },
        formativeAssessment: 'ملاحظة فرحة الأطفال واستجابتهم الفورية لتنظيف محيطهم.',
        productAssessment: 'التأكد من خلو الصف من أي أوراق والتزام الطلبة بوضعها في السلة.',
      },
    ],
    summativeAssessment: {
      description: 'تقويم عملي شفهي: يطلب المعلم من كل طفل بشكل فردي أو ثنائي تمثيل حركات الوضوء وترديد الحديث الشريف، وفحص نظافة يديه ومقعده.',
      alignmentWithIndicators: 'يقيس مؤشر الترتيب العملي للوضوء، ومؤشر ترديد الحديث، ومؤشر الممارسة السلوكية الصادقة.',
      assessmentTool: 'مقياس ملاحظة بسيط بالوجوه الضاحكة (ممتاز 🌟🌟🌟، جيد جداً 🌟🌟، أحتاج للتدرب 🌟).',
    },
    contingencies: {
      sourceContingencies: 'في حال عدم توفر ماء أو شاشة، يتم تطبيق الوضوء التخيلي الحركي في الهواء، وترديد النشيد جماعياً مع تصفيق الأطفال.',
      postLessonReflection: 'أحب الأطفال التمثيل العملي بالماء المحدود جداً وتعلموا مفهوم عدم الإسراف، وتغير شكل الصف فوراً بعد تطبيق دقيقة النظافة.',
      followUpActions: 'تزويد الأهل ببطاقة تشجيعية بعنوان (نجم النظافة والوضوء في البيت) للمتابعة المشتركة.',
    },
  },
];

/**
 * Creates default OER Lesson Plan Data if none exists on the plan,
 * populated with realistic Palestinian curriculum standards.
 */
export function createDefaultOerData(plan?: Partial<LessonPlan>): OerLessonPlanData {
  const h = plan?.header;
  const autoSemester = getCurrentSemesterName();
  const todayStr = new Date().toISOString().split('T')[0];

  // Try matching with preset database
  const matchedPreset = OER_PALESTINIAN_DATABASE.find(
    (e) => (h?.subject && e.subject.includes(h.subject)) || (h?.grade && e.grade.includes(h.grade))
  ) || OER_PALESTINIAN_DATABASE[0];

  return {
    lessonInfo: {
      subject: h?.subject || matchedPreset.subject,
      grade: h?.grade || matchedPreset.grade,
      section: h?.section || 'أ',
      date: h?.date || todayStr,
      durationMinutes: h?.periodDurationMinutes || 40,
      totalPeriods: h?.totalPeriods || 1,
      teacherName: h?.teacherName || 'أ. عبد الرحمن دويكات',
      school: h?.school || 'مدرسة التميز النموذجية للبنين',
      directorate: h?.directorate || 'مديرية التربية والتعليم - نابلس',
      lessonTitle: h?.lessonTitle || matchedPreset.lessonTitle,
      unitTitle: h?.unitTitle || matchedPreset.unitTitle,
      semester: h?.semester || autoSemester,
    },
    targetCompetencies: {
      generalCompetency: matchedPreset.generalCompetency,
      specificCompetency: matchedPreset.specificCompetency,
      observableIndicators: [...matchedPreset.observableIndicators],
    },
    activities: matchedPreset.suggestedActivities.map((act, index) => ({
      id: `oer-act-${Date.now()}-${index}`,
      stageType: act.stageType,
      title: act.title,
      allocatedTimeMinutes: act.allocatedTimeMinutes,
      description: act.description,
      studentRoles: act.studentRoles,
      studentRolesDetails: act.studentRolesDetails,
      expectedProducts: act.expectedProducts,
      primaryResource: { ...act.primaryResource },
      alternativeResource1: { ...act.alternativeResource1 },
      alternativeResource2: { ...act.alternativeResource2 },
      formativeAssessment: act.formativeAssessment,
      productAssessment: act.productAssessment,
    })),
    summativeAssessment: {
      description: matchedPreset.summativeAssessment.description,
      alignmentWithIndicators: matchedPreset.summativeAssessment.alignmentWithIndicators,
      assessmentTool: matchedPreset.summativeAssessment.assessmentTool,
    },
    contingenciesAndNotes: {
      sourceContingencies: matchedPreset.contingencies.sourceContingencies,
      postLessonReflection: matchedPreset.contingencies.postLessonReflection,
      followUpActions: matchedPreset.contingencies.followUpActions,
    },
  };
}

/**
 * Ensures a lesson plan has valid OER Data attached.
 */
export function ensureOerData(plan: LessonPlan): LessonPlan {
  if (plan.oerData) {
    return plan;
  }
  return {
    ...plan,
    oerData: createDefaultOerData(plan),
  };
}
