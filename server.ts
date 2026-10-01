import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint: Generate Full Pedagogical Lesson Plan
app.post('/api/generate-lesson-plan', async (req, res) => {
  try {
    const {
      subject,
      grade,
      lessonTitle,
      periodDurationMinutes = 40,
      totalPeriods = 2,
      currentPeriod = 1,
      country = 'دولة فلسطين',
      ministry = 'وزارة التربية والتعليم',
      school = 'مدرسة التميز النموذجية',
      directorate = 'مديرية التربية والتعليم',
      teacherName = 'معلم المبحث المتميز',
      customNotes = '',
    } = req.body;

    if (!subject || !lessonTitle || !grade) {
      return res.status(400).json({ error: 'المادة والصف وعنوان الدرس حقول إلزامية' });
    }

    const systemInstruction = `أنت خبير تربوي رفيع المستوى، ومصمم مناهج تعليمية وموجه أول، مهمتك إعداد خطط دروس تفصيلية ومنظمة بدقة بالغة وفق النموذج التربوي التكيفي الشامل الصادر عن وزارة التربية والتعليم (وفق معايير إطار تقييم أداء المعلم من الدرجة 4 - التميز).
يجب استخدام الأرقام العربية المشرقية (٠، ١، ٢، ٣، ٤، ٥، ٦، ٧، ٨، ٩) في كتابة كافة الأعداد، والتواريخ، والأزمنة، والنسب المئوية، وترتيب منازل الأعداد الرياضية بحيث تبدأ من اليمين: منزلة الآحاد أولاً، ثم منزلة العشرات، ثم منزلة المئات، ثم منزلة آحاد الآلاف.
يجب أن تغطي الخطة 6 محاور رئيسية إلزامية بأسلوب علمي تربوي رصين وعملي قابل للتطبيق:
1. أولاً: التحليل والتخطيط التكيفي (الكفايات التكاملية الأربعة: كفاية المادة، التفكير الناقد وحل المشكلات، القرائية والتعبير، كفاية المواطنة والانتماء والربط بمعالم وهوية وجغرافية الوطن؛ تحليل خصائص الطلبة والفروق الفردية وذوي الاحتياجات؛ مصادر التعلم المفتوحة OER والوسائط الملموسة والجاهزية الرقمية غير المعتمدة على الإنترنت المستمر؛ أخلاقيات التكنولوجيا والسلامة اللغوية؛ الأسئلة التأملية السابرة).
2. ثانياً: مخطط سير الحصة والأنشطة المتمركزة حول المتعلم (مقسم بدقة إلى 4 مراحل زمنية: 1. التمهيد والتهيئة 5 د، 2. العرض والاستكشاف 15 د، 3. التطبيق والتعميق 12 د، 4. الخاتمة والتقويم الختامي 8 د، مع تفصيل إجراءات المعلم، واستراتيجيات التعلم، والتقويم والتغذية الراجعة).
3. ثالثاً: المتابعة والتقويم المستمر والأنشطة العلاجية والبديلة (مهمة تقويم أصيل GRASPS واقعية وسياقية؛ سلم تقدير لفظي Rubric تحليلي 4 مستويات؛ أنشطة علاجية ملموسة؛ أنشطة إثرائية ولغز تحدٍ؛ وتغذية راجعة فورية).
4. رابعاً: إدارة بيئة التعلم ومناخه والتواصل مع الأسرة (روتينات صفية؛ بيئة آمنة محفزة؛ بطاقة شراكة وتواصل منزلي تفاعلية "مهمة الطالب ودور ولي الأمر").
5. خامساً: التأمل الذاتي والتطور المهني (نقاط القوة والأثر الملموس بنسب مئوية؛ فرص التحسين؛ ومجتمعات التعلم المهني).
6. سادساً: التوقيع والاعتماد الرسمي (توقيع المعلم، المدير، والمشرف التربوي مع توجيهات نموذجية).

اجعل المحتوى ثرياً وغنياً وتطبيقياً وموافقاً للمرحلة العمرية، مع تعزيز الانتماء الوطني والربط بالحياة اليومية.`;

    const prompt = `قم بإعداد خطة درس تفصيلية مكتملة التطبيق ومحكمة تربوياً للمعلومات التالية:
- المبحث / المادة: ${subject}
- الصف والشعبة: ${grade}
- عنوان الدرس: ${lessonTitle}
- عدد الحصص والفترة: ${totalPeriods} حصص (الحصة المستهدفة ${currentPeriod} من ${totalPeriods})، مدة الحصة: ${periodDurationMinutes} دقيقة.
- الدولة والوزارة: ${country} - ${ministry}
- المدرسة والمديرية: ${school} - ${directorate}
- اسم المعلم/ة: ${teacherName}
- ملاحظات أو إرشادات إضافية من المعلم: ${customNotes || 'لا توجد، استخدم أفضل الممارسات التربوية الحديثة والربط بالهوية والواقع المعاش.'}

أرجع النتيجة بصيغة JSON مطابقة تماماً للمخطط المطلوب.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            header: {
              type: Type.OBJECT,
              properties: {
                country: { type: Type.STRING },
                ministry: { type: Type.STRING },
                school: { type: Type.STRING },
                directorate: { type: Type.STRING },
                teacherName: { type: Type.STRING },
                subject: { type: Type.STRING },
                grade: { type: Type.STRING },
                section: { type: Type.STRING },
                lessonTitle: { type: Type.STRING },
                totalPeriods: { type: Type.INTEGER },
                currentPeriod: { type: Type.INTEGER },
                periodDurationMinutes: { type: Type.INTEGER },
                date: { type: Type.STRING },
                semester: { type: Type.STRING },
              },
              required: ['country', 'ministry', 'school', 'teacherName', 'subject', 'grade', 'lessonTitle', 'totalPeriods', 'currentPeriod', 'periodDurationMinutes'],
            },
            section1: {
              type: Type.OBJECT,
              properties: {
                integrativeCompetencies: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                    },
                    required: ['title', 'description'],
                  },
                },
                studentCharacteristics: {
                  type: Type.OBJECT,
                  properties: {
                    individualDifferences: { type: Type.STRING },
                    specialNeeds: { type: Type.STRING },
                    environmentalAdaptation: { type: Type.STRING },
                  },
                  required: ['individualDifferences', 'specialNeeds', 'environmentalAdaptation'],
                },
                learningResources: {
                  type: Type.OBJECT,
                  properties: {
                    textbook: { type: Type.STRING },
                    tangibleMedia: { type: Type.STRING },
                    digitalReadiness: { type: Type.STRING },
                  },
                  required: ['textbook', 'tangibleMedia', 'digitalReadiness'],
                },
                ethicsAndSafety: {
                  type: Type.OBJECT,
                  properties: {
                    digitalSafety: { type: Type.STRING },
                    contentAccuracyAndLanguage: { type: Type.STRING },
                  },
                  required: ['digitalSafety', 'contentAccuracyAndLanguage'],
                },
                reflectiveQuestions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['integrativeCompetencies', 'studentCharacteristics', 'learningResources', 'ethicsAndSafety', 'reflectiveQuestions'],
            },
            section2Timeline: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  phaseName: { type: Type.STRING },
                  durationMinutes: { type: Type.INTEGER },
                  teacherAndStudentActions: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  strategiesAndResources: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  assessmentAndFeedback: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['id', 'phaseName', 'durationMinutes', 'teacherAndStudentActions', 'strategiesAndResources', 'assessmentAndFeedback'],
              },
            },
            section3Assessment: {
              type: Type.OBJECT,
              properties: {
                graspsTask: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    role: { type: Type.STRING },
                    audience: { type: Type.STRING },
                    situation: { type: Type.STRING },
                    product: { type: Type.STRING },
                    standards: { type: Type.STRING },
                    fullDescription: { type: Type.STRING },
                  },
                  required: ['title', 'role', 'audience', 'situation', 'product', 'standards', 'fullDescription'],
                },
                rubric: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      criterion: { type: Type.STRING },
                      level1: { type: Type.STRING },
                      level2: { type: Type.STRING },
                      level3: { type: Type.STRING },
                      level4: { type: Type.STRING },
                    },
                    required: ['criterion', 'level1', 'level2', 'level3', 'level4'],
                  },
                },
                remedialActivities: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                    },
                    required: ['title', 'description'],
                  },
                },
                enrichmentActivities: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    puzzleOrChallenge: { type: Type.STRING },
                    peerTutoring: { type: Type.STRING },
                  },
                  required: ['title', 'puzzleOrChallenge', 'peerTutoring'],
                },
                immediateFeedback: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['graspsTask', 'rubric', 'remedialActivities', 'enrichmentActivities', 'immediateFeedback'],
            },
            section4Environment: {
              type: Type.OBJECT,
              properties: {
                classroomRoutines: { type: Type.STRING },
                safeAndMotifyingClimate: { type: Type.STRING },
                familyPartnership: {
                  type: Type.OBJECT,
                  properties: {
                    cardTitle: { type: Type.STRING },
                    instructions: { type: Type.STRING },
                    studentTask: { type: Type.STRING },
                    parentRole: { type: Type.STRING },
                  },
                  required: ['cardTitle', 'instructions', 'studentTask', 'parentRole'],
                },
              },
              required: ['classroomRoutines', 'safeAndMotifyingClimate', 'familyPartnership'],
            },
            section5SelfReflection: {
              type: Type.OBJECT,
              properties: {
                strengthsAndImpact: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                improvementOpportunities: { type: Type.STRING },
                professionalLearningCommunities: { type: Type.STRING },
              },
              required: ['strengthsAndImpact', 'improvementOpportunities', 'professionalLearningCommunities'],
            },
            section6Signatures: {
              type: Type.OBJECT,
              properties: {
                teacher: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    date: { type: Type.STRING },
                    notes: { type: Type.STRING },
                  },
                  required: ['name', 'date', 'notes'],
                },
                schoolPrincipal: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    date: { type: Type.STRING },
                    directives: { type: Type.STRING },
                  },
                  required: ['name', 'date', 'directives'],
                },
                educationalSupervisor: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    date: { type: Type.STRING },
                    directives: { type: Type.STRING },
                  },
                  required: ['name', 'date', 'directives'],
                },
              },
              required: ['teacher', 'schoolPrincipal', 'educationalSupervisor'],
            },
          },
          required: [
            'id',
            'title',
            'header',
            'section1',
            'section2Timeline',
            'section3Assessment',
            'section4Environment',
            'section5Reflection',
            'section6Signatures',
          ],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('لم يتم استلام نص من نموذج الذكاء الاصطناعي');
    }

    const plan = JSON.parse(text);
    // Ensure id exists
    if (!plan.id) {
      plan.id = `plan-${Date.now()}`;
    }
    // Fix field key typo if needed
    if (plan.section4Environment?.safeAndMotifyingClimate && !plan.section4Environment.safeAndMotivatingClimate) {
      plan.section4Environment.safeAndMotivatingClimate = plan.section4Environment.safeAndMotifyingClimate;
    }

    return res.json({ success: true, plan });
  } catch (err: any) {
    console.error('Error generating lesson plan:', err);
    return res.status(500).json({
      error: 'فشل في توليد خطة الدرس: ' + (err.message || 'خطأ غير متوقع'),
    });
  }
});

// Endpoint: AI Section Refinement / Enhancer
app.post('/api/refine-section', async (req, res) => {
  try {
    const { sectionName, currentContent, instruction, lessonContext } = req.body;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `أنت خبير تربوي ومصمم مناهج متخصص. قم بتحسين وإعادة صياغة القسم التالي من خطة الدرس وفق التوجيه المحدد:
عنوان الدرس وسياقه: ${JSON.stringify(lessonContext || {})}
اسم القسم: ${sectionName}
المحتوى الحالي:
${JSON.stringify(currentContent, null, 2)}

التوجيه المطلوب من المعلم:
${instruction}

أعد المحتوى المحسّن فقط باللغة العربية بأسلوب تربوي متميز وعملي يلبي أعلى معايير الجودة والتقويم الأصيل.`,
    });

    return res.json({ success: true, refinedText: response.text });
  } catch (err: any) {
    console.error('Error refining section:', err);
    return res.status(500).json({ error: 'فشل تحسين القسم: ' + err.message });
  }
});

// Dev server with Vite middleware vs Production static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
