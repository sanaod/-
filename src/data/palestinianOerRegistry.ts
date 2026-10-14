import { PalestinianOerItem, OerCustomGroup } from '../types/palestinianOer';

/**
 * قاعدة البيانات الرسمية للمصادر التعليمية المفتوحة المعتمدة في فلسطين OER
 * مرتبة حسب معايير الأولوية الوطنية:
 * ١. البوابة التعليمية الفلسطينية (elearn.edu.ps) - وزارة التربية والتعليم العالي
 * ٢. منصة منهاجي التعليمية الفلسطينية (minhaji.net)
 * ٣. منصة روافد التعليمية (rawafed.edu.ps)
 * ٤. مكتبة المحتوى الفلسطيني (palestine-curriculum)
 */
export const PALESTINIAN_OER_DATABASE: PalestinianOerItem[] = [
  // =========================================================================
  // 1. الرياضيات - الصف الثالث الأساسي (الوحدة الأولى: القيمة المنزلية والآلاف)
  // =========================================================================
  {
    id: 'oer-math-g3-book-elearn',
    title: 'كتاب الرياضيات - الصف الثالث - الجزء الأول (المنهاج الرسمي المعتمد)',
    subject: 'الرياضيات',
    grade: 'الصف الثالث الأساسي',
    topic: 'القيمة المنزلية للأعداد ضمن ٩٩٩٩',
    unitTitle: 'الوحدة الأولى: الأعداد حتى ٩٩٩٩',
    type: 'book',
    publisher: 'elearn_edu_ps',
    publisherNameAr: 'البوابة التعليمية الفلسطينية - وزارة التربية والتعليم العالي (elearn.edu.ps)',
    priority: 1,
    directUrl: 'https://elearn.edu.ps/ebooks/math-g3-p1',
    officialBadge: {
      text: 'معتمد رسمياً - وزارة التربية والتعليم العالي',
      subText: 'بوابة المناهج الإلكترونية elearn.edu.ps',
      tier: 'ministry_gold',
    },
    license: 'ترخيص وزارة التربية والتعليم العالي - دولة فلسطين (متاح مجاناً لجميع الطلبة)',
    description: 'النسخة الرقمية الرسمية لكتاب الرياضيات متضمنة دروس قراءة الأعداد، كتابة الصورة الموسعة، وتمثيل الأعداد حتى ٩٩٩٩ على لوحة المنازل.',
    suggestedUseInLesson: 'المرجع الصفي الأساسي للقراءة وحل التدريبات الفردية والأنشطة المقررة.',
    durationOrPages: 'ص ١٠ - ص ١٥',
    tags: ['رياضيات', 'الصف الثالث', 'قيمة منزلية', 'أعداد', 'كتاب وزاري'],
  },
  {
    id: 'oer-math-g3-guide-elearn',
    title: 'دليل المعلم في الرياضيات - الصف الثالث الأساسي (استراتيجيات التدريس والتقويم)',
    subject: 'الرياضيات',
    grade: 'الصف الثالث الأساسي',
    topic: 'القيمة المنزلية للأعداد ضمن ٩٩٩٩',
    unitTitle: 'الوحدة الأولى: الأعداد حتى ٩٩٩٩',
    type: 'teacher_guide',
    publisher: 'elearn_edu_ps',
    publisherNameAr: 'البوابة التعليمية الفلسطينية - وزارة التربية والتعليم العالي (elearn.edu.ps)',
    priority: 1,
    directUrl: 'https://elearn.edu.ps/teachers-guides/math-g3-tg.pdf',
    officialBadge: {
      text: 'دليل المعلم المعتمد - وزارة التربية والتعليم',
      subText: 'الإشراف والتأهيل التربوي elearn.edu.ps',
      tier: 'ministry_gold',
    },
    license: 'ترخيص وزارة التربية والتعليم العالي الفلسطينية',
    description: 'خطة تدريس تفصيلية وإرشادات للمفاهيم الرياضية، معالجة الصعوبات النمائية في قراءة منزلة الآلاف، وأدوات تقويم تكويني مرافقة.',
    suggestedUseInLesson: 'توجيه خطوات الموقف التعليمي وصياغة المؤشرات القابلة للقياس.',
    durationOrPages: 'دليل إرشادي شامل',
    tags: ['دليل معلم', 'رياضيات', 'إشراف تربوي', 'استراتيجيات'],
  },
  {
    id: 'oer-math-g3-abacus-sim-elearn',
    title: 'محاكي المعداد ولوحة المنازل الرقمية التفاعلية (Interactive Digital Abacus)',
    subject: 'الرياضيات',
    grade: 'الصف الثالث الأساسي',
    topic: 'القيمة المنزلية للأعداد ضمن ٩٩٩٩',
    unitTitle: 'الوحدة الأولى: الأعداد حتى ٩٩٩٩',
    type: 'interactive_activity',
    publisher: 'elearn_edu_ps',
    publisherNameAr: 'البوابة التعليمية الفلسطينية - وزارة التربية والتعليم العالي (elearn.edu.ps)',
    priority: 1,
    directUrl: 'https://elearn.edu.ps/simulations/abacus-math-g3',
    officialBadge: {
      text: 'برمجية تعليمية معتمدة - elearn.edu.ps',
      subText: 'الإدارة العامة للتقنيات التربوية وتكنولوجيا المعلومات',
      tier: 'ministry_gold',
    },
    license: 'مشاع إبداعي متاح للبيئة المدرسية (CC-BY-NC 4.0)',
    description: 'أداة رقمية حية تتيح للطلبة سحب وإسقاط خرزات الآحاد والعشرات والمئات والألوف، ومقارنة العدد بالصورة اللفظية والموسعة.',
    suggestedUseInLesson: 'توظيفها في مرحلة النمذجة شبه المجردة والعمل في مجموعات صغيرة.',
    durationOrPages: 'تفاعلي فوري أونلاين',
    tags: ['محاكاة', 'معداد', 'تفاعلي', 'تكنولوجيا التعليم'],
  },
  {
    id: 'oer-math-g3-minhaji-video',
    title: 'شرح مرئي متحرك: القيمة المنزلية والصورة الموسعة للأعداد - منصة منهاجي',
    subject: 'الرياضيات',
    grade: 'الصف الثالث الأساسي',
    topic: 'القيمة المنزلية للأعداد ضمن ٩٩٩٩',
    unitTitle: 'الوحدة الأولى: الأعداد حتى ٩٩٩٩',
    type: 'video',
    publisher: 'minhaji',
    publisherNameAr: 'منصة منهاجي التعليمية الفلسطينية (minhaji.net)',
    priority: 2,
    directUrl: 'https://minhaji.net/lesson/palestine-math-g3-placevalue',
    officialBadge: {
      text: 'منهاجي معتمد - المنهاج الفلسطيني',
      subText: 'سلسلة شروحات المناهج الوطنية minhaji.net',
      tier: 'minhaji_blue',
    },
    license: 'متاح مجاناً للمدارس والمعلمين والطلبة الفلسطينيين',
    description: 'فيديو عالي الجودة مدعوم برسوم توضيحية لربط منازل الأعداد بأمثلة حسية من البيئة الفلسطينية مع حل تدريبات الكتاب خطوة بخطوة.',
    suggestedUseInLesson: 'عرض في بداية الحصة لمدة ٤ دقائق لتعزيز الفهم البصري أو للمراجعة المنزلية.',
    durationOrPages: '٥:١٢ دقيقة',
    tags: ['فيديو', 'منهاجي', 'رياضيات', 'شرح مرئي'],
  },
  {
    id: 'oer-math-g3-minhaji-worksheet',
    title: 'بنك أسئلة وتدريبات تفاعلية: منازل الأعداد والآلاف - منصة منهاجي',
    subject: 'الرياضيات',
    grade: 'الصف الثالث الأساسي',
    topic: 'القيمة المنزلية للأعداد ضمن ٩٩٩٩',
    unitTitle: 'الوحدة الأولى: الأعداد حتى ٩٩٩٩',
    type: 'worksheet',
    publisher: 'minhaji',
    publisherNameAr: 'منصة منهاجي التعليمية الفلسطينية (minhaji.net)',
    priority: 2,
    directUrl: 'https://minhaji.net/worksheets/math-g3-unit1-tests.pdf',
    officialBadge: {
      text: 'أوراق عمل منهاجي المعتمدة',
      subText: 'تقويم مستمر وتدريبات علاجية وإثرائية',
      tier: 'minhaji_blue',
    },
    license: 'ترخيص الاستخدام التعليمي المفتوح للمدارس',
    description: 'مجموعة من التمارين المصنفة حسب مستويات بلوم تشمل أسئلة الاختيار من متعدد، الإكمال، ومسائل كلامية مستقاة من المدن الفلسطينية.',
    suggestedUseInLesson: 'ورقة عمل ختامية للتقويم الفردي أو بطاقة خروج.',
    durationOrPages: 'صفحتان A4 جاهزة للطباعة',
    tags: ['ورقة عمل', 'تمارين', 'منهاجي', 'تقويم'],
  },
  {
    id: 'oer-math-g3-rawafed-card',
    title: 'بطاقة التعلم الذاتي رقم (٢): الأعداد ضمن ٩٩٩٩ والقيمة المكانية - منصة روافد',
    subject: 'الرياضيات',
    grade: 'الصف الثالث الأساسي',
    topic: 'القيمة المنزلية للأعداد ضمن ٩٩٩٩',
    unitTitle: 'الوحدة الأولى: الأعداد حتى ٩٩٩٩',
    type: 'worksheet',
    publisher: 'rawafed',
    publisherNameAr: 'بوابة روافد التعليمية - وزارة التربية والتعليم (rawafed.edu.ps)',
    priority: 3,
    directUrl: 'https://rawafed.edu.ps/cards/math-g3-placevalue-card2.pdf',
    officialBadge: {
      text: 'بطاقة تعلم ذاتي معتمدة - بوابة روافد',
      subText: 'برنامج التعليم المساند والاستدراكي الفلسطيني',
      tier: 'rawafed_green',
    },
    license: 'رخصة المشاع الإبداعي (CC BY-NC-SA 3.0 IGO)',
    description: 'بطاقة تعليمية متكاملة تبدأ بملخص معرفي مبسط، تليها أنشطة متدرجة مع مفتاح إجابة ذاتي لتعزيز استقلالية المتعلم.',
    suggestedUseInLesson: 'مناسبة للتعلم الذاتي، التعلم في أوقات الطوارئ، أو المجموعات العلاجية في الحصة.',
    durationOrPages: 'ورقة تعلم ذاتي مكثفة',
    tags: ['روافد', 'تعلم ذاتي', 'بطاقة', 'استدراك'],
  },
  {
    id: 'oer-math-g3-rawafed-video',
    title: 'درس مصور: تمثيل الأعداد على المعداد ولوحة المنازل - قناة روافد التعليمية',
    subject: 'الرياضيات',
    grade: 'الصف الثالث الأساسي',
    topic: 'القيمة المنزلية للأعداد ضمن ٩٩٩٩',
    unitTitle: 'الوحدة الأولى: الأعداد حتى ٩٩٩٩',
    type: 'video',
    publisher: 'rawafed',
    publisherNameAr: 'بوابة روافد التعليمية - وزارة التربية والتعليم (rawafed.edu.ps)',
    priority: 3,
    directUrl: 'https://rawafed.edu.ps/videos/math-g3-abacus-lesson',
    officialBadge: {
      text: 'فيديو تربوي مصادق عليه - روافd',
      subText: 'إشراف لجنة الرياضيات الوزارية',
      tier: 'rawafed_green',
    },
    license: 'ترخيص الوزارة التربوي المفتوح',
    description: 'معلم متميز يشرح كيفية انتقال الخرزات من منزلة إلى أخرى عند امتلاء منزلة المئات وكيف تتشكل الألوف بطريقة محسوسة.',
    suggestedUseInLesson: 'عرض في خطوة التدريس المباشر ونمذجة المعلم.',
    durationOrPages: '٦:٣٠ دقيقة',
    tags: ['فيديو', 'روافد', 'شرح', 'معداد'],
  },
  {
    id: 'oer-math-g3-contentlib-flashcards',
    title: 'بطاقات بصرية ملونة: معالم فلسطين وأرقامها (جبل الجرمق، بحيرة طبريا، أسوار القدس)',
    subject: 'الرياضيات',
    grade: 'الصف الثالث الأساسي',
    topic: 'القيمة المنزلية للأعداد ضمن ٩٩٩٩',
    unitTitle: 'الوحدة الأولى: الأعداد حتى ٩٩٩٩',
    type: 'visual_card',
    publisher: 'palestine_content_library',
    publisherNameAr: 'مكتبة المحتوى الفلسطيني الرقمي (palestine-curriculum.edu.ps)',
    priority: 4,
    directUrl: 'https://palestine-curriculum.edu.ps/resources/g3-math-palestine-landmarks-cards.pdf',
    officialBadge: {
      text: 'المحتوى الرقمي الفلسطيني المعتمد',
      subText: 'مركز المناهج والوسائط التربوية',
      tier: 'content_purple',
    },
    license: 'رخصة المشاع الإبداعي (CC BY-NC 4.0)',
    description: 'حزمة بطاقات صور عالية الدقة تتضمن معالم فلسطينية طبيعية وتاريخية مرفقة بأعداد من ٤ منازل لقراءتها وتفكيكها صفياً.',
    suggestedUseInLesson: 'نشاط استهلالي تفاعلي أو مسابقات بين المجموعات التعاونية.',
    durationOrPages: '١٢ بطاقة ملونة قابلة للطباعة والتغليف',
    tags: ['بطاقات', 'معالم فلسطين', 'محسوسات', 'مكتبة المحتوى'],
  },

  // =========================================================================
  // 2. الرياضيات - الصف الرابع الأساسي (الكسور العادية والعمليات عليها)
  // =========================================================================
  {
    id: 'oer-math-g4-book-elearn',
    title: 'كتاب الرياضيات - الصف الرابع - الجزء الثاني (وحدة الكسور العادية)',
    subject: 'الرياضيات',
    grade: 'الصف الرابع الأساسي',
    topic: 'مفهوم الكسر العادي والكسور المتكافئة',
    unitTitle: 'الوحدة السابعة: الكسور العادية والعشرية',
    type: 'book',
    publisher: 'elearn_edu_ps',
    publisherNameAr: 'البوابة التعليمية الفلسطينية - وزارة التربية والتعليم العالي (elearn.edu.ps)',
    priority: 1,
    directUrl: 'https://elearn.edu.ps/ebooks/math-g4-p2#fractions',
    officialBadge: {
      text: 'معتمد رسمياً - وزارة التربية والتعليم العالي',
      subText: 'بوابة المناهج الإلكترونية elearn.edu.ps',
      tier: 'ministry_gold',
    },
    license: 'ترخيص وزارة التربية والتعليم العالي - دولة فلسطين',
    description: 'دروس الكسور المتكافئة، جمع وطرح الكسور المتشابهة، وتطبيقات واقعية من اقتسام المحاصيل الزراعية في القرى الفلسطينية.',
    suggestedUseInLesson: 'المرجع الرئيسي لتدريبات الدرس وحل الأنشطة الصفية.',
    durationOrPages: 'ص ٤٥ - ص ٥٨',
    tags: ['رياضيات', 'الصف الرابع', 'كسور', 'كتاب وزاري'],
  },
  {
    id: 'oer-math-g4-minhaji-fractions',
    title: 'محاكاة الكسور التفاعلية ومخططات البيتزا والخبز الفلسطيني - منصة منهاجي',
    subject: 'الرياضيات',
    grade: 'الصف الرابع الأساسي',
    topic: 'مفهوم الكسر العادي والكسور المتكافئة',
    unitTitle: 'الوحدة السابعة: الكسور العادية والعشرية',
    type: 'interactive_activity',
    publisher: 'minhaji',
    publisherNameAr: 'منصة منهاجي التعليمية الفلسطينية (minhaji.net)',
    priority: 2,
    directUrl: 'https://minhaji.net/interactive/math-g4-fractions-bars',
    officialBadge: {
      text: 'منهاجي معتمد - المنهاج الفلسطيني',
      subText: 'أدوات تفاعلية داعمة لمنهاجي',
      tier: 'minhaji_blue',
    },
    license: 'ترخيص مجاني مفتوح للمدارس الفلسطينية',
    description: 'أشرطة كسور تفاعلية تمكن التلميذ من مقارنة النصف مع الربعين والثمانية أعشار بنقرة واحدة مع ملاحظة التكافؤ بصرياً.',
    suggestedUseInLesson: 'استكشاف التكافؤ في مرحلة العمل التشاركي في مجموعات.',
    durationOrPages: 'برمجية ويب خفيفة تعمل على الهاتف والكمبيوتر',
    tags: ['أشرطة كسور', 'تفاعلي', 'منهاجي', 'رياضيات'],
  },
  {
    id: 'oer-math-g4-rawafed-fractions-card',
    title: 'بطاقة التعلم الذاتي رقم (١٤): الكسور المتكافئة وتبسيط الكسور - روافد',
    subject: 'الرياضيات',
    grade: 'الصف الرابع الأساسي',
    topic: 'مفهوم الكسر العادي والكسور المتكافئة',
    unitTitle: 'الوحدة السابعة: الكسور العادية والعشرية',
    type: 'worksheet',
    publisher: 'rawafed',
    publisherNameAr: 'بوابة روافد التعليمية - وزارة التربية والتعليم (rawafed.edu.ps)',
    priority: 3,
    directUrl: 'https://rawafed.edu.ps/cards/math-g4-fractions-card14.pdf',
    officialBadge: {
      text: 'بطاقة تعلم ذاتي معتمدة - بوابة روافد',
      subText: 'برنامج التعليم المساند والاستدراكي',
      tier: 'rawafed_green',
    },
    license: 'مشاع إبداعي مفتوح CC-BY-NC-SA',
    description: 'بطاقة عمل تحوي تمارين إتقان لتوليد كسور متكافئة بضرب أو قسمة حدي الكسر على نفس العدد، مع رسومات ونماذج تلوين.',
    suggestedUseInLesson: 'مهمة فردية للتحقق من الفهم والتطبيق المستقل.',
    durationOrPages: 'صفحتان مع سلم تقويم ذاتي',
    tags: ['روافد', 'كسور', 'بطاقة تعلم', 'تقويم'],
  },

  // =========================================================================
  // 3. اللغة العربية - الصف الثاني الأساسي (لغتنا الجميلة - اللام الشمسية والقمرية)
  // =========================================================================
  {
    id: 'oer-arabic-g2-book-elearn',
    title: 'كتاب لغتنا الجميلة - الصف الثاني - الجزء الأول (المنهاج الرسمي الوزاري)',
    subject: 'اللغة العربية',
    grade: 'الصف الثاني الأساسي',
    topic: 'اللام الشمسية واللام القمرية والتمييز الصوتي والكتابي',
    unitTitle: 'الوحدة الثالثة: مدرستي الجميلة',
    type: 'book',
    publisher: 'elearn_edu_ps',
    publisherNameAr: 'البوابة التعليمية الفلسطينية - وزارة التربية والتعليم العالي (elearn.edu.ps)',
    priority: 1,
    directUrl: 'https://elearn.edu.ps/ebooks/arabic-g2-p1',
    officialBadge: {
      text: 'معتمد رسمياً - وزارة التربية والتعليم العالي',
      subText: 'بوابة المناهج الإلكترونية elearn.edu.ps',
      tier: 'ministry_gold',
    },
    license: 'ترخيص وزارة التربية والتعليم العالي الفلسطينية',
    description: 'النصوص القرائية المعتمدة وتدريبات التمييز بين الحروف الشمسية والقمرية، وقواعد ضبط الشدة وحركة السكون.',
    suggestedUseInLesson: 'القراءة الجهرية النموذجية وتحليل الكلمات واستخراج الظواهر الإملائية.',
    durationOrPages: 'ص ٢٤ - ص ٢٨',
    tags: ['عربي', 'الصف الثاني', 'كتاب وزاري', 'لام شمسية وقمرية'],
  },
  {
    id: 'oer-arabic-g2-guide-elearn',
    title: 'دليل المعلم للغة العربية - الصف الثاني (دليل التدريس المرتكز إلى OER)',
    subject: 'اللغة العربية',
    grade: 'الصف الثاني الأساسي',
    topic: 'اللام الشمسية واللام القمرية والتمييز الصوتي والكتابي',
    unitTitle: 'الوحدة الثالثة: مدرستي الجميلة',
    type: 'teacher_guide',
    publisher: 'elearn_edu_ps',
    publisherNameAr: 'البوابة التعليمية الفلسطينية - وزارة التربية والتعليم العالي (elearn.edu.ps)',
    priority: 1,
    directUrl: 'https://elearn.edu.ps/teachers-guides/arabic-g2-tg.pdf',
    officialBadge: {
      text: 'دليل المعلم المعتمد - وزارة التربية والتعليم',
      subText: 'الإشراف والتأهيل التربوي elearn.edu.ps',
      tier: 'ministry_gold',
    },
    license: 'ترخيص وزارة التربية والتعليم العالي الفلسطينية',
    description: 'خطوات تدريس الوعي الصوتي، ألعاب تعليمية حركية لتمييز نطق اللام، وسلالم تقدير لفظية للطلاقة والإملاء المنظور.',
    suggestedUseInLesson: 'بناء الأنشطة التفاعلية وتحديد أدوار الطلبة التشاركية.',
    durationOrPages: 'إرشادات تفصيلية للوحدة',
    tags: ['دليل معلم', 'لغة عربية', 'وعي صوتي', 'إشراف'],
  },
  {
    id: 'oer-arabic-g2-minhaji-video',
    title: 'أنشودة وقصة اللام الشمسية واللام القمرية - منصة منهاجي للأطفال',
    subject: 'اللغة العربية',
    grade: 'الصف الثاني الأساسي',
    topic: 'اللام الشمسية واللام القمرية والتمييز الصوتي والكتابي',
    unitTitle: 'الوحدة الثالثة: مدرستي الجميلة',
    type: 'video',
    publisher: 'minhaji',
    publisherNameAr: 'منصة منهاجي التعليمية الفلسطينية (minhaji.net)',
    priority: 2,
    directUrl: 'https://minhaji.net/kids/solar-lunar-arabic-g2',
    officialBadge: {
      text: 'منهاجي معتمد - المنهاج الفلسطيني',
      subText: 'سلسلة الإنتاج المرئي منهاجي للأطفال',
      tier: 'minhaji_blue',
    },
    license: 'متاح مجاناً لكافة رياض الأطفال ومدارس فلسطين',
    description: 'فيديو كرتوني غنائي مرح يقص حكاية الأخوين شمس وقمر وتوزيعهما لحروف الهجاء الثمانية والعشرين بالتساوي.',
    suggestedUseInLesson: 'التهيئة الحافزة وإثارة الدافعية في الدقائق الخمس الأولى من الدرس.',
    durationOrPages: '٣:٤٠ دقيقة',
    tags: ['فيديو', 'أنشودة', 'قصة', 'منهاجي', 'صوتيات'],
  },
  {
    id: 'oer-arabic-g2-rawafed-selflearning',
    title: 'بطاقة التعلم الذاتي رقم (٥): فرز كلمات اللام الشمسية واللام القمرية - روافد',
    subject: 'اللغة العربية',
    grade: 'الصف الثاني الأساسي',
    topic: 'اللام الشمسية واللام القمرية والتمييز الصوتي والكتابي',
    unitTitle: 'الوحدة الثالثة: مدرستي الجميلة',
    type: 'worksheet',
    publisher: 'rawafed',
    publisherNameAr: 'بوابة روافد التعليمية - وزارة التربية والتعليم (rawafed.edu.ps)',
    priority: 3,
    directUrl: 'https://rawafed.edu.ps/cards/arabic-g2-lam-card5.pdf',
    officialBadge: {
      text: 'بطاقة تعلم ذاتي معتمدة - بوابة روافد',
      subText: 'برنامج رعاية المهارات اللغوية الأساسية',
      tier: 'rawafed_green',
    },
    license: 'مشاع إبداعي CC-BY-NC-SA 4.0',
    description: 'ورقة نشاط تحتوي على سلة شمسية وسلة قمرية وكلمات مستمدة من البيئة الفلسطينية (الزيتون، البرتقال، الصقر، القدس) لفرزها وكتابتها بالحركات.',
    suggestedUseInLesson: 'نشاط تدريبي فردي وثنائي لقياس مؤشر الكتابة الصحيحة.',
    durationOrPages: 'صفحة ملونة واضحة الخط',
    tags: ['روافد', 'عربي', 'فرز', 'بطاقة تعلم'],
  },
  {
    id: 'oer-arabic-g2-contentlib-box',
    title: 'حقيبة محسوسات وبطاقات الأحرف الشمسية والقمرية المجسمة - مكتبة المحتوى',
    subject: 'اللغة العربية',
    grade: 'الصف الثاني الأساسي',
    topic: 'اللام الشمسية واللام القمرية والتمييز الصوتي والكتابي',
    unitTitle: 'الوحدة الثالثة: مدرستي الجميلة',
    type: 'visual_card',
    publisher: 'palestine_content_library',
    publisherNameAr: 'مكتبة المحتوى الفلسطيني الرقمي (palestine-curriculum.edu.ps)',
    priority: 4,
    directUrl: 'https://palestine-curriculum.edu.ps/kits/arabic-g2-lam-flashcards.pdf',
    officialBadge: {
      text: 'المحتوى الرقمي الفلسطيني المعتمد',
      subText: 'الوسائط التعليمية المساندة',
      tier: 'content_purple',
    },
    license: 'مفتوح المصدر للمؤسسات المدرسية',
    description: 'بطاقات حروف ملونة كبيرة تعلق في الصف وفي زاوية اللغة العربية، مع تاج الشمس الذهبي وتاج القمر الفضي لتمثيل الأدوار.',
    suggestedUseInLesson: 'مسرحة المناهج والتعلم باللعب في الغرفة الصفية.',
    durationOrPages: '٢٨ بطاقة حرف مع شارات التعليق',
    tags: ['بطاقات', 'محسوسات', 'لعب وأدوار', 'مكتبة المحتوى'],
  },

  // =========================================================================
  // 4. العلوم والحياة - الصف الثالث الأساسي (أجزاء النبات ووظائفها)
  // =========================================================================
  {
    id: 'oer-science-g3-book-elearn',
    title: 'كتاب العلوم والحياة - الصف الثالث - الجزء الأول (المنهاج الفلسطيني الرسمي)',
    subject: 'العلوم والحياة',
    grade: 'الصف الثالث الأساسي',
    topic: 'أجزاء النبات ووظيفة كل جزء (الجذر، الساق، الأوراق، الزهرة)',
    unitTitle: 'الوحدة الثانية: عالم النباتات والبيئة من حولنا',
    type: 'book',
    publisher: 'elearn_edu_ps',
    publisherNameAr: 'البوابة التعليمية الفلسطينية - وزارة التربية والتعليم العالي (elearn.edu.ps)',
    priority: 1,
    directUrl: 'https://elearn.edu.ps/ebooks/science-g3-p1',
    officialBadge: {
      text: 'معتمد رسمياً - وزارة التربية والتعليم العالي',
      subText: 'بوابة المناهج الإلكترونية elearn.edu.ps',
      tier: 'ministry_gold',
    },
    license: 'ترخيص وزارة التربية والتعليم العالي - دولة فلسطين',
    description: 'الصور التوضيحية النباتية من البيئة الطبيعية الفلسطينية، التجارب العلمية المقترحة لفحص امتصاص الماء ونقل الغذاء عبر الساق.',
    suggestedUseInLesson: 'متابعة التجارب الصفيّة وتوثيق المشاهدات في دفتر التلميذ.',
    durationOrPages: 'ص ٣٠ - ص ٤٢',
    tags: ['علوم', 'الصف الثالث', 'أجزاء النبات', 'كتاب وزاري'],
  },
  {
    id: 'oer-science-g3-elearn-sim',
    title: 'محاكاة تفاعلية: مسار الماء والأملاح من الجذور إلى الأوراق في شجرة الزيتون',
    subject: 'العلوم والحياة',
    grade: 'الصف الثالث الأساسي',
    topic: 'أجزاء النبات ووظيفة كل جزء (الجذر، الساق، الأوراق، الزهرة)',
    unitTitle: 'الوحدة الثانية: عالم النباتات والبيئة من حولنا',
    type: 'interactive_activity',
    publisher: 'elearn_edu_ps',
    publisherNameAr: 'البوابة التعليمية الفلسطينية - وزارة التربية والتعليم العالي (elearn.edu.ps)',
    priority: 1,
    directUrl: 'https://elearn.edu.ps/simulations/plant-organs-water-transport',
    officialBadge: {
      text: 'محاكاة رقمية معتمدة - elearn.edu.ps',
      subText: 'الإدارة العامة للتقنيات والعلوم التربوية',
      tier: 'ministry_gold',
    },
    license: 'مشاع إبداعي متاح للبيئة المدرسية (CC-BY-NC 4.0)',
    description: 'محاكاة علمية ثلاثية الأبعاد تمكن الطالب من زيادة ري النبات وملاحظة حركة الماء تحت المجهر وتلوين الأوراق بمحلول ملون.',
    suggestedUseInLesson: 'نشاط استكشافي وتفسير الظاهرة العلمية في المختبر أو الصف الذكي.',
    durationOrPages: 'محاكاة رقمية حية',
    tags: ['محاكاة', 'علوم', 'شجرة الزيتون', 'مختبر افتراضي'],
  },
  {
    id: 'oer-science-g3-minhaji-video',
    title: 'فيلم وثائقي قصير: رحلة في حقول فلسطين لاستكشاف أنواع الجذور والسيقان والأوراق',
    subject: 'العلوم والحياة',
    grade: 'الصف الثالث الأساسي',
    topic: 'أجزاء النبات ووظيفة كل جزء (الجذر، الساق، الأوراق، الزهرة)',
    unitTitle: 'الوحدة الثانية: عالم النباتات والبيئة من حولنا',
    type: 'video',
    publisher: 'minhaji',
    publisherNameAr: 'منصة منهاجي التعليمية الفلسطينية (minhaji.net)',
    priority: 2,
    directUrl: 'https://minhaji.net/science/palestine-flora-plant-parts-g3',
    officialBadge: {
      text: 'منهاجي معتمد - المنهاج الفلسطيني',
      subText: 'سلسلة العلوم الاستكشافية minhaji.net',
      tier: 'minhaji_blue',
    },
    license: 'متاح مجاناً للمدارس والمعلمين',
    description: 'تصوير ميداني عالي النقاء لأشجار التين والزيتون والزعتر البري مع شروحات علمية مبسطة تناسب طلبة المرحلة الأساسية الأولى.',
    suggestedUseInLesson: 'عرض بعد التجربة الصفية لربط المفهوم بالبيئة المحلية الحقيقية.',
    durationOrPages: '٤:٤٥ دقيقة',
    tags: ['فيديو', 'نباتات فلسطين', 'علوم', 'منهاجي'],
  },
  {
    id: 'oer-science-g3-rawafed-experiment',
    title: 'دليل التجارب البسيطة وبطاقة الاستقصاء الصفي: استنبات البذور في أوعية منزلية',
    subject: 'العلوم والحياة',
    grade: 'الصف الثالث الأساسي',
    topic: 'أجزاء النبات ووظيفة كل جزء (الجذر، الساق، الأوراق، الزهرة)',
    unitTitle: 'الوحدة الثانية: عالم النباتات والبيئة من حولنا',
    type: 'worksheet',
    publisher: 'rawafed',
    publisherNameAr: 'بوابة روافد التعليمية - وزارة التربية والتعليم (rawafed.edu.ps)',
    priority: 3,
    directUrl: 'https://rawafed.edu.ps/experiments/science-g3-seeds-sprouting.pdf',
    officialBadge: {
      text: 'دليل استقصاء علمي معتمد - روافد',
      subText: 'أنشطة التجارب البديلة خفيفة التكلفة',
      tier: 'rawafed_green',
    },
    license: 'رخصة المشاع الإبداعي (CC BY-NC-SA)',
    description: 'خطوات تجربة إنبات حبوب العدس والفاصولياء في القطن ومتابعة نمو الجذير والسويقة يوماً بيوم مع جدول تسجيل الملاحظات ورسم الأطوار.',
    suggestedUseInLesson: 'مشروع صفي وبيتي يمتد لأسبوعين مع تقويم عبر ملف الإنجاز.',
    durationOrPages: 'بطاقة مشروع واستقصاء صفي',
    tags: ['استقصاء', 'تجربة', 'روافد', 'علوم'],
  },

  // =========================================================================
  // 5. التنشئة الوطنية والاجتماعية - الصف الرابع (القدس عاصمة فلسطين)
  // =========================================================================
  {
    id: 'oer-social-g4-book-elearn',
    title: 'كتاب التنشئة الوطنية والاجتماعية - الصف الرابع - الجزء الأول (المنهاج الرسمي)',
    subject: 'التنشئة الوطنية والاجتماعية',
    grade: 'الصف الرابع الأساسي',
    topic: 'القدس عاصمة فلسطين الأبدية (معالمها وتاريخها ومكانتها)',
    unitTitle: 'الوحدة الأولى: وطني فلسطين وعاصمته القدس',
    type: 'book',
    publisher: 'elearn_edu_ps',
    publisherNameAr: 'البوابة التعليمية الفلسطينية - وزارة التربية والتعليم العالي (elearn.edu.ps)',
    priority: 1,
    directUrl: 'https://elearn.edu.ps/ebooks/national-g4-p1#jerusalem',
    officialBadge: {
      text: 'معتمد رسمياً - وزارة التربية والتعليم العالي',
      subText: 'بوابة المناهج الإلكترونية elearn.edu.ps',
      tier: 'ministry_gold',
    },
    license: 'ترخيص وزارة التربية والتعليم العالي الفلسطينية',
    description: 'النصوص الوطنية والصور التاريخية لمدينة القدس، المسجد الأقصى المبارك وقبة الصخرة المشرفة وكنيسة القيامة وأبواب البلدة القديمة.',
    suggestedUseInLesson: 'القراءة التحليلية واستثارة الاعتزاز بالهوية الوطنية الفلسطينية.',
    durationOrPages: 'ص ٨ - ص ١٨',
    tags: ['تنشئة وطنية', 'الصف الرابع', 'القدس', 'كتاب وزاري', 'هوية'],
  },
  {
    id: 'oer-social-g4-contentlib-vr-tour',
    title: 'جولة افتراضية بانورامية ٣٦٠ درجة: أبواب القدس والمسجد الأقصى وكنيسة القيامة',
    subject: 'التنشئة الوطنية والاجتماعية',
    grade: 'الصف الرابع الأساسي',
    topic: 'القدس عاصمة فلسطين الأبدية (معالمها وتاريخها ومكانتها)',
    unitTitle: 'الوحدة الأولى: وطني فلسطين وعاصمته القدس',
    type: 'interactive_activity',
    publisher: 'palestine_content_library',
    publisherNameAr: 'مكتبة المحتوى الفلسطيني الرقمي (palestine-curriculum.edu.ps)',
    priority: 4,
    directUrl: 'https://palestine-curriculum.edu.ps/virtual-tours/jerusalem-old-city-360',
    officialBadge: {
      text: 'المحتوى الرقمي الفلسطيني المعتمد',
      subText: 'مشروع التوثيق التفاعلي لمعالم القدس',
      tier: 'content_purple',
    },
    license: 'متاح مجاناً للتعليم والتوعية الوطنية',
    description: 'تقنية تجوال افتراضي تفاعلي تتيح للطلبة الوقوف عند باب العمود والبلدة القديمة والتجول في أروقة القدس بوضوح عالٍ وصوت طبيعي حي.',
    suggestedUseInLesson: 'مهمة استكشافية افتراضية في الصف لمشاهدة المعالم الواقعية.',
    durationOrPages: 'جولة تفاعلية مفتوحة',
    tags: ['جولة افتراضية', 'القدس', 'مكتبة المحتوى', 'تراث'],
  },
  {
    id: 'oer-social-g4-rawafed-worksheet',
    title: 'خريطة فلسطين الصامتة ومعالم القدس: بطاقة تدريبية للتحديد المكاني - روافد',
    subject: 'التنشئة الوطنية والاجتماعية',
    grade: 'الصف الرابع الأساسي',
    topic: 'القدس عاصمة فلسطين الأبدية (معالمها وتاريخها ومكانتها)',
    unitTitle: 'الوحدة الأولى: وطني فلسطين وعاصمته القدس',
    type: 'worksheet',
    publisher: 'rawafed',
    publisherNameAr: 'بوابة روافد التعليمية - وزارة التربية والتعليم (rawafed.edu.ps)',
    priority: 3,
    directUrl: 'https://rawafed.edu.ps/cards/social-g4-jerusalem-map.pdf',
    officialBadge: {
      text: 'بطاقة تعلم ذاتي معتمدة - بوابة روافد',
      subText: 'الخرائط والأنشطة الجغرافية الوطنية',
      tier: 'rawafed_green',
    },
    license: 'مشاع إبداعي CC-BY-NC-SA',
    description: 'خريطة فلسطين مع رموز بصرية واضحة للقدس والمدن المحيطة، وتمرين إدراج أسماء أبواب القدس في مواقعها الصحيحة.',
    suggestedUseInLesson: 'تطبيق فردي في الحصة ومهمة أطلس مدرسي صغيرة.',
    durationOrPages: 'صفحة نشاط خريطة ملونة',
    tags: ['خريطة', 'القدس', 'روافد', 'تنشئة'],
  },

  // =========================================================================
  // 6. التربية الإسلامية - الصف الثالث الأساسي (آداب التكافل وأخلاق المسلم)
  // =========================================================================
  {
    id: 'oer-islamic-g3-book-elearn',
    title: 'كتاب التربية الإسلامية - الصف الثالث - الجزء الأول (المنهاج المعتمد)',
    subject: 'التربية الإسلامية',
    grade: 'الصف الثالث الأساسي',
    topic: 'الصدق والأمانة والتكافل في المجتمع',
    unitTitle: 'الوحدة الرابعة: من الأخلاق والآداب الإسلامية',
    type: 'book',
    publisher: 'elearn_edu_ps',
    publisherNameAr: 'البوابة التعليمية الفلسطينية - وزارة التربية والتعليم العالي (elearn.edu.ps)',
    priority: 1,
    directUrl: 'https://elearn.edu.ps/ebooks/islamic-g3-p1',
    officialBadge: {
      text: 'معتمد رسمياً - وزارة التربية والتعليم العالي',
      subText: 'بوابة المناهج الإلكترونية elearn.edu.ps',
      tier: 'ministry_gold',
    },
    license: 'ترخيص وزارة التربية والتعليم العالي الفلسطينية',
    description: 'النصوص القرآنية والأحاديث النبوية الشريفة المقررة، وقصص القدوة الحسنة للصحابة الكرام، وتطبيقات سلوكية يومية في المدرسة والبيت.',
    suggestedUseInLesson: 'تلاوة الأحاديث واستنباط القيم الخلقية وتطبيقها في مواقف عملية.',
    durationOrPages: 'ص ٤٢ - ص ٥٠',
    tags: ['تربية إسلامية', 'الصف الثالث', 'الصدق', 'أمانة', 'كتاب وزاري'],
  },
  {
    id: 'oer-islamic-g3-minhaji-story',
    title: 'قصة كرتونية هادفة: الصدق منجاة وصانع الثقة في القرية - منصة منهاجي',
    subject: 'التربية الإسلامية',
    grade: 'الصف الثالث الأساسي',
    topic: 'الصدق والأمانة والتكافل في المجتمع',
    unitTitle: 'الوحدة الرابعة: من الأخلاق والآداب الإسلامية',
    type: 'video',
    publisher: 'minhaji',
    publisherNameAr: 'منصة منهاجي التعليمية الفلسطينية (minhaji.net)',
    priority: 2,
    directUrl: 'https://minhaji.net/islamic/honesty-story-g3',
    officialBadge: {
      text: 'منهاجي معتمد - المنهاج الفلسطيني',
      subText: 'سلسلة القيم والأخلاق للأطفال',
      tier: 'minhaji_blue',
    },
    license: 'متاح مجاناً للمدارس والمربين',
    description: 'قصة تفاعلية تجسد موقفاً صفياً يواجه فيه طفل خيار الاعتراف بالخطأ أو إخفائه، وكيف ينال ثقة معلمه وزملائه بالصدق.',
    suggestedUseInLesson: 'عرض في التمهيد لإثارة الحوار القيمي والمناقشة الأخلاقية.',
    durationOrPages: '٤:١٠ دقيقة',
    tags: ['قصة', 'فيديو', 'منهاجي', 'قيم'],
  },

  // =========================================================================
  // 7. اللغة الإنجليزية - الصف الثالث (English for Palestine - Grade 3)
  // =========================================================================
  {
    id: 'oer-english-g3-book-elearn',
    title: 'English for Palestine - Grade 3 (Pupil\'s Book & Activity Book)',
    subject: 'اللغة الإنجليزية',
    grade: 'الصف الثالث الأساسي',
    topic: 'Family, School, and Everyday Actions (Unit 1 & 2)',
    unitTitle: 'Unit 1: Hello Again! & Unit 2: In the Classroom',
    type: 'book',
    publisher: 'elearn_edu_ps',
    publisherNameAr: 'البوابة التعليمية الفلسطينية - وزارة التربية والتعليم العالي (elearn.edu.ps)',
    priority: 1,
    directUrl: 'https://elearn.edu.ps/ebooks/english-for-palestine-g3',
    officialBadge: {
      text: 'معتمد رسمياً - وزارة التربية والتعليم العالي',
      subText: 'English for Palestine Official Curriculum',
      tier: 'ministry_gold',
    },
    license: 'Ministry of Education and Higher Education - State of Palestine',
    description: 'الكتاب الرسمي لسلسلة English for Palestine، متضمناً أنشطة الاستماع والمحادثة والمفردات الصوتية (Phonics) والتمارين الصفية.',
    suggestedUseInLesson: 'قراءة حوارات الدروس وتنفيذ تدريبات الاستماع والكتابة المقررة.',
    durationOrPages: 'Pages 4 - 16',
    tags: ['English', 'Grade 3', 'Pupils Book', 'elearn'],
  },
  {
    id: 'oer-english-g3-audio-minhaji',
    title: 'التسجيلات الصوتية الرسمية للنصوص والأناشيد - English for Palestine G3 - منهاجي',
    subject: 'اللغة الإنجليزية',
    grade: 'الصف الثالث الأساسي',
    topic: 'Family, School, and Everyday Actions (Unit 1 & 2)',
    unitTitle: 'Unit 1: Hello Again! & Unit 2: In the Classroom',
    type: 'audio_story',
    publisher: 'minhaji',
    publisherNameAr: 'منصة منهاجي التعليمية الفلسطينية (minhaji.net)',
    priority: 2,
    directUrl: 'https://minhaji.net/audio/english-for-palestine-g3-tracks',
    officialBadge: {
      text: 'منهاجي معتمد - تسجيلات English for Palestine',
      subText: 'المسارات الصوتية الرسمية عالية الوضوح',
      tier: 'minhaji_blue',
    },
    license: 'مرخص للاستخدام الصفي المدرسي',
    description: 'تسجيلات صوتية بنطق بريطاني سليم للنصوص الحوارية وأغاني الدروس، لمساعدة التلاميذ على إتقان اللفظ والوعي الصوتي.',
    suggestedUseInLesson: 'تدريب الاستماع والترديد الجماعي والفردي.',
    durationOrPages: 'ملفات MP3 خفيفة التحميل',
    tags: ['صوتيات', 'English', 'استماع', 'منهاجي'],
  },
  {
    id: 'oer-english-g3-rawafed-flashcards',
    title: 'Classroom Objects & Actions Flashcards (بطاقات مصورة ملونة - روافد)',
    subject: 'اللغة الإنجليزية',
    grade: 'الصف الثالث الأساسي',
    topic: 'Family, School, and Everyday Actions (Unit 1 & 2)',
    unitTitle: 'Unit 1: Hello Again! & Unit 2: In the Classroom',
    type: 'visual_card',
    publisher: 'rawafed',
    publisherNameAr: 'بوابة روافد التعليمية - وزارة التربية والتعليم (rawafed.edu.ps)',
    priority: 3,
    directUrl: 'https://rawafed.edu.ps/cards/english-g3-flashcards.pdf',
    officialBadge: {
      text: 'بطاقات بصرية معتمدة - بوابة روافد',
      subText: 'وسائل الإدراك البصري التفاعلية',
      tier: 'rawafed_green',
    },
    license: 'Creative Commons CC-BY-NC-SA 4.0',
    description: 'حزمة بطاقات صور للكلمات الإنجليزية الشائعة في الصف (Desk, Chair, Board, Bag, Pencil) مع الكلمة المكتوبة بحجم كبير.',
    suggestedUseInLesson: 'ألعاب الذاكرة، مطابقة الكلمة بالصورة، والتعلم الحركي (Total Physical Response).',
    durationOrPages: '١٦ بطاقة ملونة قياس A5',
    tags: ['Flashcards', 'English', 'روافد', 'بطاقات'],
  },

  // =========================================================================
  // 8. اللغة العربية - الصف الأول الأساسي (تجريد الحروف والقراءة المبكرة)
  // =========================================================================
  {
    id: 'oer-arabic-g1-book-elearn',
    title: 'كتاب لغتنا الجميلة - الصف الأول الأساسي - الجزء الأول (التهيئة وتجريد الحروف)',
    subject: 'اللغة العربية',
    grade: 'الصف الأول الأساسي',
    topic: 'تجريد حروف الهجاء وقراءة الكلمات البسيطة بالحركات القصيرة',
    unitTitle: 'الوحدة الأولى: أهلاً بمدرستي',
    type: 'book',
    publisher: 'elearn_edu_ps',
    publisherNameAr: 'البوابة التعليمية الفلسطينية - وزارة التربية والتعليم العالي (elearn.edu.ps)',
    priority: 1,
    directUrl: 'https://elearn.edu.ps/ebooks/arabic-g1-p1',
    officialBadge: {
      text: 'معتمد رسمياً - وزارة التربية والتعليم العالي',
      subText: 'بوابة المناهج الإلكترونية elearn.edu.ps',
      tier: 'ministry_gold',
    },
    license: 'ترخيص وزارة التربية والتعليم العالي - دولة فلسطين',
    description: 'منهاج القراءة والكتابة المبكرة، لوحات المحادثة الملونة المستوحاة من القرية والمدينة والبيت الفلسطيني، وتمارين التتبع والتجريد.',
    suggestedUseInLesson: 'اللوحة الصفيّة الرئيسية للتهيئة وتجريد الحرف وتدريب الأصابع على الرسم.',
    durationOrPages: 'ص ٦ - ص ٢٠',
    tags: ['لغة عربية', 'الصف الأول', 'تجريد حروف', 'كتاب وزاري'],
  },
  {
    id: 'oer-arabic-g1-minhaji-letters',
    title: 'سلسلة قطار الحروف والأصوات التفاعلية - منصة منهاجي',
    subject: 'اللغة العربية',
    grade: 'الصف الأول الأساسي',
    topic: 'تجريد حروف الهجاء وقراءة الكلمات البسيطة بالحركات القصيرة',
    unitTitle: 'الوحدة الأولى: أهلاً بمدرستي',
    type: 'interactive_activity',
    publisher: 'minhaji',
    publisherNameAr: 'منصة منهاجي التعليمية الفلسطينية (minhaji.net)',
    priority: 2,
    directUrl: 'https://minhaji.net/interactive/arabic-alphabet-train-g1',
    officialBadge: {
      text: 'منهاجي معتمد - المنهاج الفلسطيني',
      subText: 'برمجيات القراءة التفاعلية للأطفال',
      tier: 'minhaji_blue',
    },
    license: 'متاح مجاناً للمدارس والطلبة',
    description: 'تطبيق ألعاب تفاعلية ينقر فيه التلميذ على الحرف لسماع صوته مع الفتحة والضمة والكسرة، وتجميع الحروف لتركيب كلمة كاملة.',
    suggestedUseInLesson: 'محطة تعلم رقمية للطلبة في الصفوف الأولى أثناء العمل المتبادل.',
    durationOrPages: 'برمجية ويب تفاعلية',
    tags: ['تفاعلي', 'حروف', 'الصف الأول', 'منهاجي'],
  },
  {
    id: 'oer-arabic-g1-rawafed-tracing',
    title: 'كراسة الخط والتتبع لمهارات اليد الدقيقة - بوابة روافد التعليمية',
    subject: 'اللغة العربية',
    grade: 'الصف الأول الأساسي',
    topic: 'تجريد حروف الهجاء وقراءة الكلمات البسيطة بالحركات القصيرة',
    unitTitle: 'الوحدة الأولى: أهلاً بمدرستي',
    type: 'worksheet',
    publisher: 'rawafed',
    publisherNameAr: 'بوابة روافد التعليمية - وزارة التربية والتعليم (rawafed.edu.ps)',
    priority: 3,
    directUrl: 'https://rawafed.edu.ps/cards/arabic-g1-handwriting-tracing.pdf',
    officialBadge: {
      text: 'كراسة خط معتمدة - بوابة روافد',
      subText: 'التأسيس اللغوي السليم',
      tier: 'rawafed_green',
    },
    license: 'مشاع إبداعي CC-BY-NC-SA 4.0',
    description: 'خطوط منقطة لتدريب اليد على كتابة الحرف بأشكاله المختلفة (أول الكلمة، وسطها، آخرها)، مع أسهم توجيهية لحركة القلم.',
    suggestedUseInLesson: 'تدريب الكتابة المستقلة والملاحظة الفردية من المعلم.',
    durationOrPages: '١٠ صفحات تدريبية مجانية للطباعة',
    tags: ['خط', 'تتبع', 'كتابة', 'روافد'],
  },

  // =========================================================================
  // 9. الرياضيات - الصف الأول الأساسي (الأعداد حتى ٢٠ والجمع والطرح البسيط)
  // =========================================================================
  {
    id: 'oer-math-g1-book-elearn',
    title: 'كتاب الرياضيات - الصف الأول الأساسي - الجزء الأول (المنهاج الرسمي الوزاري)',
    subject: 'الرياضيات',
    grade: 'الصف الأول الأساسي',
    topic: 'الأعداد حتى ٢٠ والمقارنة والجمع والطرح المحسوس',
    unitTitle: 'الوحدة الأولى: الأعداد حتى ٩ والوحدة الثانية: الأعداد حتى ٢٠',
    type: 'book',
    publisher: 'elearn_edu_ps',
    publisherNameAr: 'البوابة التعليمية الفلسطينية - وزارة التربية والتعليم العالي (elearn.edu.ps)',
    priority: 1,
    directUrl: 'https://elearn.edu.ps/ebooks/math-g1-p1',
    officialBadge: {
      text: 'معتمد رسمياً - وزارة التربية والتعليم العالي',
      subText: 'بوابة المناهج الإلكترونية elearn.edu.ps',
      tier: 'ministry_gold',
    },
    license: 'ترخيص وزارة التربية والتعليم العالي - دولة فلسطين',
    description: 'الرسومات المحسوسة لحبات الزيتون والبرتقال والطيور لتعليم العد الفطري، المقارنة بأكبر وأصغر، وإطار العشرة التأسيسي.',
    suggestedUseInLesson: 'التدريس المباشر ونمذجة الحل واستخدام الصور المحسوسة.',
    durationOrPages: 'ص ١٢ - ص ٢٥',
    tags: ['رياضيات', 'الصف الأول', 'عد', 'إطار العشرة', 'كتاب وزاري'],
  },
  {
    id: 'oer-math-g1-elearn-tenframe',
    title: 'أداة إطار العشرة الرقمي التفاعلي (Interactive Ten-Frame Counter)',
    subject: 'الرياضيات',
    grade: 'الصف الأول الأساسي',
    topic: 'الأعداد حتى ٢٠ والمقارنة والجمع والطرح المحسوس',
    unitTitle: 'الوحدة الأولى: الأعداد حتى ٩ والوحدة الثانية: الأعداد حتى ٢٠',
    type: 'interactive_activity',
    publisher: 'elearn_edu_ps',
    publisherNameAr: 'البوابة التعليمية الفلسطينية - وزارة التربية والتعليم العالي (elearn.edu.ps)',
    priority: 1,
    directUrl: 'https://elearn.edu.ps/simulations/ten-frame-counter-g1',
    officialBadge: {
      text: 'أداة تعليمية تفاعلية معتمدة - elearn',
      subText: 'التقنيات التعليمية لصفوف المرحلة الأولى',
      tier: 'ministry_gold',
    },
    license: 'مشاع إبداعي متاح للبيئة المدرسية (CC-BY-NC 4.0)',
    description: 'لوحة تفاعلية لإطار العشرة يضع فيها التلميذ نقاطاً ملونة لتكوين العدد ٥ و١٠ والجمع التلقائي بدون أصابع.',
    suggestedUseInLesson: 'تطوير الحس العددي والاستكشاف الفردي أو في أزواج.',
    durationOrPages: 'محاكاة فورية باللمس',
    tags: ['إطار العشرة', 'رياضيات', 'تفاعلي', 'محاكاة'],
  },
];

/**
 * المجموعات الافتراضية للمعلم لتصنيف مصادره المفضلة
 */
export const DEFAULT_TEACHER_GROUPS: OerCustomGroup[] = [
  {
    id: 'group-default-math-primary',
    name: 'رياضيات الصفوف الأولى (١-٤)',
    description: 'مصادري المعتمدة وأدوات المحاكاة والمعداد وأوراق العمل التفاعلية',
    color: 'emerald',
    icon: 'Calculator',
    createdAt: '٢٠٢٦/١٠/٠١م',
    resourceIds: ['oer-math-g3-book-elearn', 'oer-math-g3-abacus-sim-elearn', 'oer-math-g3-minhaji-video'],
    isShared: true,
    shareCode: 'OER-GRP-MATH-PAL',
  },
  {
    id: 'group-default-arabic-foundations',
    name: 'التأسيس واللغة العربية والوعي الصوتي',
    description: 'قصص، بطاقات شمسية وقمرية، وفيديوهات منهاجي وروافد',
    color: 'blue',
    icon: 'BookOpen',
    createdAt: '٢٠٢٦/١٠/٠٥م',
    resourceIds: ['oer-arabic-g2-book-elearn', 'oer-arabic-g2-minhaji-video', 'oer-arabic-g1-minhaji-letters'],
    isShared: false,
  },
  {
    id: 'group-default-national-identity',
    name: 'الهوية الوطنية والقدس ومعالم فلسطين',
    description: 'جولات افتراضية ٣٦٠ درجة وخرائط صامتة وبطاقات معالم الوطن',
    color: 'amber',
    icon: 'Compass',
    createdAt: '٢٠٢٦/١٠/١٠م',
    resourceIds: ['oer-social-g4-book-elearn', 'oer-social-g4-contentlib-vr-tour', 'oer-math-g3-contentlib-flashcards'],
    isShared: true,
    shareCode: 'OER-GRP-PAL-JERUSALEM',
  },
];

/**
 * دالة استرجاع المصادر المعتمدة تلقائياً بفرز الأولوية الرسمية:
 * 1. elearn.edu.ps (أولوية 1)
 * 2. minhaji (أولوية 2)
 * 3. rawafed (أولوية 3)
 * 4. palestine_content_library (أولوية 4)
 * 5. الجهات الأخرى
 */
export function queryPalestinianOerResources(params: {
  subject?: string;
  grade?: string;
  topic?: string;
  publisher?: string;
  type?: string;
  searchQuery?: string;
}): PalestinianOerItem[] {
  let results = [...PALESTINIAN_OER_DATABASE];

  if (params.subject && params.subject !== 'all') {
    const cleanSub = params.subject.trim();
    results = results.filter((item) =>
      item.subject.includes(cleanSub) || cleanSub.includes(item.subject)
    );
  }

  if (params.grade && params.grade !== 'all') {
    const cleanGrade = params.grade.trim();
    results = results.filter((item) =>
      item.grade.includes(cleanGrade) || cleanGrade.includes(item.grade)
    );
  }

  if (params.topic && params.topic.trim()) {
    const q = params.topic.trim().toLowerCase();
    results = results.filter(
      (item) =>
        item.topic.toLowerCase().includes(q) ||
        (item.unitTitle && item.unitTitle.toLowerCase().includes(q)) ||
        item.title.toLowerCase().includes(q)
    );
  }

  if (params.publisher && params.publisher !== 'all') {
    results = results.filter((item) => item.publisher === params.publisher);
  }

  if (params.type && params.type !== 'all') {
    results = results.filter((item) => item.type === params.type);
  }

  if (params.searchQuery && params.searchQuery.trim()) {
    const terms = params.searchQuery.trim().toLowerCase().split(/\s+/);
    results = results.filter((item) => {
      const fullText = `${item.title} ${item.description} ${item.subject} ${item.grade} ${item.topic} ${item.publisherNameAr} ${item.tags.join(' ')}`.toLowerCase();
      return terms.every((t) => fullText.includes(t));
    });
  }

  // فرز صارم دائماً حسب أولوية الاعتماد الوطنية الرسمية
  return results.sort((a, b) => a.priority - b.priority);
}

/**
 * استخراج قائمة المواد المتاحة بدون تكرار
 */
export function getAvailableOerSubjects(): string[] {
  const set = new Set<string>();
  PALESTINIAN_OER_DATABASE.forEach((item) => set.add(item.subject));
  return Array.from(set);
}

/**
 * استخراج قائمة الصفوف المتاحة بدون تكرار
 */
export function getAvailableOerGrades(): string[] {
  const set = new Set<string>();
  PALESTINIAN_OER_DATABASE.forEach((item) => set.add(item.grade));
  return Array.from(set);
}

/**
 * استخراج قائمة الموضوعات المرتبطة بمادة وصف محددين
 */
export function getTopicsForSubjectAndGrade(subject?: string, grade?: string): string[] {
  const set = new Set<string>();
  PALESTINIAN_OER_DATABASE.forEach((item) => {
    const matchSubject = !subject || subject === 'all' || item.subject.includes(subject);
    const matchGrade = !grade || grade === 'all' || item.grade.includes(grade);
    if (matchSubject && matchGrade) {
      set.add(item.topic);
    }
  });
  return Array.from(set);
}

/**
 * استخراج ثلاثي المصادر التعليمية المعتمدة (رئيسي وبديلين) وفق السياق التعليمي
 */
export function getApprovedOerResourcesByContext({
  subject,
  grade,
  topic,
}: {
  subject: string;
  grade: string;
  topic?: string;
}): PalestinianOerItem[] {
  // First try direct match
  const directMatches = queryPalestinianOerResources({
    subject,
    grade,
    topic,
  });

  if (directMatches.length >= 3) {
    return directMatches;
  }

  // Fallback: match by subject and grade
  const subjectGradeMatches = queryPalestinianOerResources({
    subject,
    grade,
  });

  const combined: PalestinianOerItem[] = [...directMatches];
  subjectGradeMatches.forEach((item: PalestinianOerItem) => {
    if (!combined.some((c) => c.id === item.id)) {
      combined.push(item);
    }
  });

  if (combined.length >= 3) {
    return combined;
  }

  // Fallback: match by subject only
  const subjectOnlyMatches = queryPalestinianOerResources({
    subject,
  });

  subjectOnlyMatches.forEach((item: PalestinianOerItem) => {
    if (!combined.some((c) => c.id === item.id)) {
      combined.push(item);
    }
  });

  // If still less than 3, add top prioritized items
  if (combined.length < 3) {
    PALESTINIAN_OER_DATABASE.slice(0, 3).forEach((item: PalestinianOerItem) => {
      if (!combined.some((c) => c.id === item.id)) {
        combined.push(item);
      }
    });
  }

  // Ensure priority sort (Priority 1 first, Priority 2 second, Priority 3 third)
  return combined.sort((a, b) => a.priority - b.priority);
}
