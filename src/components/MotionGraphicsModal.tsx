import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  X,
  Clapperboard,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Download,
  Printer,
  Copy,
  Check,
  Film,
  Volume2,
  VolumeX,
  Tv,
  Layers,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Wand2,
  Loader2,
  CheckCircle2,
  FileText,
  MonitorPlay,
  Clock,
  Mic,
  Video,
} from 'lucide-react';
import { LessonPlan } from '../types/lessonPlan';
import { toArabicDigits } from '../utils/arabicNumerals';

interface MotionGraphicsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePlan: LessonPlan;
  savedPlans?: LessonPlan[];
  onSelectPlan?: (planId: string) => void;
}

export interface MotionScene {
  id: number;
  sceneTitle: string;
  durationSeconds: number;
  visualDescription: string;
  animationCues: string;
  voiceoverScript: string;
  onScreenText: string;
  bgmStyle: string;
}

export const MotionGraphicsModal: React.FC<MotionGraphicsModalProps> = ({
  isOpen,
  onClose,
  activePlan,
  savedPlans = [],
  onSelectPlan,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(activePlan.id);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeSceneIndex, setActiveSceneIndex] = useState<number>(0);
  const [playbackProgress, setPlaybackProgress] = useState<number>(0);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Real Video Generation & Recording State
  const [isGeneratingVideo, setIsGeneratingVideo] = useState<boolean>(false);
  const [videoProgressMsg, setVideoProgressMsg] = useState<string>('');
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentPlan = useMemo(() => {
    return savedPlans.find((p) => p.id === selectedPlanId) || activePlan;
  }, [selectedPlanId, savedPlans, activePlan]);

  const [activeTab, setActiveTab] = useState<'scenes' | 'chat'>('scenes');
  interface ChatMessage {
    id: string;
    sender: 'user' | 'ai';
    text: string;
    timestamp: string;
  }
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'ai',
      text: `أهلاً بك يا معلمنا الفاضل في لوحة دردسة تصميم الفيديو الذكي (صور وصوت). أنا مساعدك الإبداعي لتصميم موشن جرافيك درس "${currentPlan.header?.lessonTitle || currentPlan.title}". اسألني لتوليد وصف الصور لكل مشهد، أو هندسة الصوت والموسيقى التصويرية، أو تحسين سيناريو الفصحى!`,
      timestamp: 'الآن',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const handleSendChatMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userText = chatInput.trim();
    const newMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput('');
    setIsChatLoading(true);

    setTimeout(() => {
      let aiReply = `أشكرك على استفسارك. بالنسبة لدرس "${currentPlan.header?.lessonTitle || ''}", أقترح إضافة صور بصرية رقمية عالية الدقة تمثل المفاهيم المركزية للدرس، مع خلفية صوتية تعليمية هادئة ونبرة تعليق صوتي فصيحة ومعبرة.`;
      if (userText.includes('صورة') || userText.includes('صور') || userText.includes('بصري')) {
        aiReply = `🎨 **مقترحات الصور البصرية لكل مشهد (Image Prompts):**\n1. مشهد الاستهلال: رسم رقمي 3D ملون يوضح عنوان الدرس مع عناصر تفاعلية.\n2. مشهد العرض: مخطط بياني ورسوم توضيحية رقمية متحركة تبين الكفايات التكاملية.\n3. التطبيق العملي: لقطات تحاكي التجربة أو المهمة بحسب بيئة الطالب الفلسطيني.`;
      } else if (userText.includes('صوت') || userText.includes('موسيقى') || userText.includes('مؤثرات') || userText.includes('audio')) {
        aiReply = `🎵 **هندسة الصوت والموسيقى (Audio & Voiceover):**\n- التعليق الصوتي: لغة عربية فصحى فصيحة (MSA) بنبرة حماسية ومشجعة.\n- المؤثرات الصوتية: أصوات تنبيه إيجابية عند الإجابة الصحيحة، وموسيقى خلفية هادئة تحفز التركيز دون تشتيت.`;
      }
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, aiMsg]);
      setIsChatLoading(false);
    }, 900);
  };

  // Generate 4 motion graphics scenes in strict Modern Standard Arabic (اللغة العربية الفصحى الفصيحة)
  const motionScenes: MotionScene[] = useMemo(() => {
    const title = currentPlan.header?.lessonTitle || currentPlan.title || 'درس تعليمي';
    const subject = currentPlan.header?.subject || 'المبحث التعليمي';
    const grade = currentPlan.header?.grade || 'الصف الدراسي';
    const comp1 = currentPlan.section1?.integrativeCompetencies?.[0]?.description || 'اكتساب المفاهيم والمهارات المعرفية والعلمية بدقة.';

    return [
      {
        id: 1,
        sceneTitle: 'المشهد الأول: الاستهلال والتشويق (The Hook)',
        durationSeconds: 15,
        visualDescription: `مؤثرات بصرية حركية متقدمة تعرض عنوان الدرس "${title}" بخط عربي فصيح ثلاثي الأبعاد، مع ألوان متناسقة ورمز تعبيري يمثل مبحث ${subject}.`,
        animationCues: 'تدرج بصري سلس، حركة انسيابية للكلمات مع ظهور الشعار الوزاري بدولة فلسطين.',
        voiceoverScript: `أهلاً بكم يا أبنائي وبناتي طلاب ${grade} في رحلتنا التربوية الممتعة اليوم في مبحث ${subject}. هل تساءلتم وكيف نطبق مفهوم "${title}" في حياتنا العلمية والعملية؟ دعونا نستكشف ذلك معاً.`,
        onScreenText: `مبحث ${subject} | ${title}`,
        bgmStyle: 'موسيقى هادئة محفزة للتركيز والاستيعاب.',
      },
      {
        id: 2,
        sceneTitle: 'المشهد الثاني: العرض المفاهيمي والنمذجة (Core Concept)',
        durationSeconds: 30,
        visualDescription: `رسوم توضيحية رقمية متحركة تبين البنية المعرفية والمفاهيمية للدرس، مع إبراز العناصر الأساسية والرسوم البيانية تدريجياً.`,
        animationCues: 'ظهور تدريجي للعناصر، تمييز المصطلحات العلمية بدلالات لونية واضحة.',
        voiceoverScript: `يرتكز تعلمنا في هذا الدرس على ${comp1}. تأملوا معنا كيف تتفاعل المعطيات وتتدرج الأفكار لنبني فهماً عميقاً ومستداماً.`,
        onScreenText: `المفاهيم الأساسية والتعلم النشط`,
        bgmStyle: 'إيقاع تعليمي منتظم ومناسب للشرح.',
      },
      {
        id: 3,
        sceneTitle: 'المشهد الثالث: التطبيق العملي والمحاكاة (Interactive Activity)',
        durationSeconds: 25,
        visualDescription: `واجهة محاكاة رقمية تفاعلية تعرض تمثيلاً عملياً للمسألة أو التجربة، مع توجيه إرشادات دقيقة للحل والاستقصاء.`,
        animationCues: 'حركة تفاعلية للمؤشر، إبراز الإجابات الصحيحة بمؤثرات بصرية مشجعة.',
        voiceoverScript: `والآن حان دور التطبيق العملي. استخدموا مهارات التفكير الناقد وحل المشكلات للوصول إلى الإجابة الدقيقة وتوظيف المعرفة في سياقها الصحيح.`,
        onScreenText: `تحدي التطبيق وحل المشكلات 💡`,
        bgmStyle: 'موسيقى حماسية خفيفة مشجعة على التفاعل.',
      },
      {
        id: 4,
        sceneTitle: 'المشهد الرابع: الغلق المعرفي وبطاقة الخروج (Summary & Outro)',
        durationSeconds: 15,
        visualDescription: `شاشة ختامية تلخص أهم الأفكار والنقاط الرئيسة، يتبعها عرض "بطاقة الخروج (Exit Ticket)" كتقويم ختامي تفاعلي.`,
        animationCues: 'تجمع الملخص في وسط الشاشة، ظهور علامة التميز والنجاح.',
        voiceoverScript: `أبدعتم في لقائنا اليوم. تذكروا خلاصة درسنا ومهمتنا التطبيقية. نلقاكم في الدرس القادم بعون الله وحفظه. دمت في رعاية الله.`,
        onScreenText: `خلاصة الدرس وبطاقة الخروج 🌟`,
        bgmStyle: 'نغمة موسيقية ختامية مريحة.',
      },
    ];
  }, [currentPlan]);

  // Strict Modern Standard Arabic (الفصحى) Speech Synthesis
  const speakVoiceover = (text: string) => {
    if (!isSpeechEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA'; // Standard Arabic
      utterance.rate = 0.90; // Professional pedagogical pace
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis warning:', err);
      setIsSpeaking(false);
    }
  };

  const stopSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  useEffect(() => {
    if (isPlaying && isSpeechEnabled) {
      const scene = motionScenes[activeSceneIndex];
      if (scene) {
        speakVoiceover(scene.voiceoverScript);
      }
    }
    return () => {
      stopSpeech();
    };
  }, [activeSceneIndex, isPlaying]);

  useEffect(() => {
    if (!isOpen) {
      stopSpeech();
      setIsPlaying(false);
    }
    return () => {
      stopSpeech();
    };
  }, [isOpen]);

  // Playback timer effect
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlaybackProgress((prev) => {
          if (prev >= 100) {
            if (activeSceneIndex < motionScenes.length - 1) {
              setActiveSceneIndex((s) => s + 1);
              return 0;
            } else {
              setIsPlaying(false);
              return 100;
            }
          }
          return prev + 1.5;
        });
      }, 300);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, activeSceneIndex, motionScenes.length]);

  // Real Video Generation & Recording via Canvas + MediaRecorder
  const handleGenerateAndExportVideo = async () => {
    if (!canvasRef.current) return;
    setIsGeneratingVideo(true);
    setVideoProgressMsg('جاري تحضير محرك تسجيل وتوليد الفيديو...');

    try {
      const canvas = canvasRef.current;
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Check MediaRecorder support
      const stream = canvas.captureStream(30); // 30 FPS
      let mediaRecorder: MediaRecorder;
      let recordedChunks: Blob[] = [];

      try {
        mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
      } catch (e) {
        try {
          mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
        } catch (err) {
          mediaRecorder = new MediaRecorder(stream);
        }
      }

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        setIsGeneratingVideo(false);
        setVideoProgressMsg('تم توليد وتسجيل فيديو الموشن جرافيك بنجاح!');
      };

      mediaRecorder.start();
      setVideoProgressMsg('جاري رسم وتسجيل المشاهد تفاعلياً...');

      // Render scenes sequentially onto canvas
      for (let sIdx = 0; sIdx < motionScenes.length; sIdx++) {
        const scene = motionScenes[sIdx];
        setActiveSceneIndex(sIdx);
        setVideoProgressMsg(`جاري تسجيل المشهد ${toArabicDigits(sIdx + 1)} من ${toArabicDigits(motionScenes.length)}...`);
        
        // Speak voiceover for this scene during recording
        speakVoiceover(scene.voiceoverScript);

        // Render frames for this scene (~2 seconds per scene for export rendering)
        const frames = 40;
        for (let f = 0; f < frames; f++) {
          ctx.fillStyle = '#0f172a'; // Slate 950 background
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw gradient glow
          const gradient = ctx.createRadialGradient(640, 360, 50, 640, 360, 600);
          gradient.addColorStop(0, 'rgba(124, 58, 237, 0.25)');
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw Header Badge
          ctx.fillStyle = 'rgba(147, 51, 235, 0.3)';
          ctx.beginPath();
          ctx.roundRect(440, 80, 400, 50, 25);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 22px "Cairo", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`${currentPlan.header.subject} - ${currentPlan.header.grade}`, 640, 112);

          // Draw Lesson Title
          ctx.fillStyle = '#f8fafc';
          ctx.font = '900 42px "Cairo", sans-serif';
          ctx.fillText(currentPlan.header.lessonTitle || currentPlan.title, 640, 220);

          // Draw Scene Title Box
          ctx.fillStyle = '#7c3aed';
          ctx.beginPath();
          ctx.roundRect(240, 280, 800, 60, 16);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 26px "Cairo", sans-serif';
          ctx.fillText(scene.sceneTitle, 640, 320);

          // Draw Visual Description
          ctx.fillStyle = '#e2e8f0';
          ctx.font = '20px "Cairo", sans-serif';
          ctx.fillText(scene.visualDescription.substring(0, 75) + '...', 640, 420);
          ctx.fillText(scene.visualDescription.substring(75, 150), 640, 460);

          // Draw Voiceover Script Box
          ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(180, 520, 920, 100, 16);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#fde68a';
          ctx.font = 'bold 18px "Cairo", sans-serif';
          ctx.fillText(`🎙️ التعليق الصوتي (بالفصحى):`, 640, 555);
          ctx.fillStyle = '#ffffff';
          ctx.font = '16px "Cairo", sans-serif';
          ctx.fillText(`"${scene.voiceoverScript.substring(0, 85)}"`, 640, 590);

          await new Promise((r) => setTimeout(r, 50));
        }
      }

      mediaRecorder.stop();
      stopSpeech();
    } catch (err) {
      console.error('Video generation error:', err);
      alert('حدث خطأ أثناء توليد الفيديو. يمكنك استخدام معاينة الفيديو والصوت التفاعلية المباشرة.');
      setIsGeneratingVideo(false);
      setVideoProgressMsg('');
    }
  };

  if (!isOpen) return null;

  const handleDownloadTxt = () => {
    let text = `=== سيناريو فيديو موشن جرافيك تعليمي (باللغة العربية الفصحى) ===\n`;
    text += `عنوان الدرس: ${currentPlan.header?.lessonTitle || currentPlan.title}\n`;
    text += `المبحث: ${currentPlan.header?.subject} | الصف: ${currentPlan.header?.grade}\n\n`;

    motionScenes.forEach((scene) => {
      text += `[${scene.sceneTitle}] - المدة: ${scene.durationSeconds} ثانية\n`;
      text += `• التعليق الصوتي بالفصحى: "${scene.voiceoverScript}"\n\n`;
    });

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Motion_Graphics_${currentPlan.header?.lessonTitle || 'lesson'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyScript = () => {
    let text = `=== سيناريو فيديو موشن جرافيك تعليمي (باللغة العربية الفصحى) ===\n`;
    text += `عنوان الدرس: ${currentPlan.header?.lessonTitle || currentPlan.title}\n`;
    text += `المبحث: ${currentPlan.header?.subject} | الصف: ${currentPlan.header?.grade}\n\n`;

    motionScenes.forEach((scene) => {
      text += `[${scene.sceneTitle}] - المدة: ${toArabicDigits(scene.durationSeconds)} ثانية\n`;
      text += `• وصف الرسوم البصرية: ${scene.visualDescription}\n`;
      text += `• نص التعليق الصوتي بالفصحى: "${scene.voiceoverScript}"\n\n`;
    });

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const activeScene = motionScenes[activeSceneIndex] || motionScenes[0];

  return (
    <div
      dir="rtl"
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200 text-right overflow-y-auto"
    >
      <div className="relative w-full max-w-5xl max-h-[94vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto">
        {/* Hidden canvas for video recording */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Top Header */}
        <div className="bg-linear-to-r from-purple-950 via-indigo-900 to-slate-900 text-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 shrink-0 border-b border-purple-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-purple-500 to-indigo-700 text-white flex items-center justify-center shadow-md border border-white/20">
              <Clapperboard className="w-6 h-6 text-purple-100" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-black font-['Tajawal'] tracking-wide">
                  مولد ومحاكي فيديو الموشن جرافيك (بالعربية الفصحى) 🎙️🎬
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-amber-950 shadow-2xs">
                  تعليق صوتي فصيح (TTS)
                </span>
              </div>
              <p className="text-xs text-purple-100/90 mt-0.5">
                توليد وتشغيل وتسجيل فيديو موشن جرافيك متكامل مع قراءة التعليق الصوتي باللغة العربية الفصحى
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {savedPlans.length > 0 && (
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="text-xs bg-white/10 text-white border border-white/20 rounded-xl px-3 py-2 focus:outline-hidden"
              >
                {savedPlans.map((p) => (
                  <option key={p.id} value={p.id} className="text-slate-900">
                    {p.header.lessonTitle || p.title} ({p.header.subject})
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => {
                stopSpeech();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[80vh]">
          {/* Tab Switcher: Scenes vs Video Design Chat */}
          <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('scenes')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'scenes'
                  ? 'bg-purple-700 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <Clapperboard className="w-4 h-4" />
              <span>مشاهد الموشن جرافيك والسيناريو</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-purple-700 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>💬 لوحة دردسة تصميم الفيديو (صور وصوت)</span>
            </button>
          </div>

          {activeTab === 'chat' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-black">
                    🤖
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 font-['Tajawal']">
                      مساعد تصميم فيديو الموشن جرافيك (صور وصوت)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      اسأل الذكاء الاصطناعي لاقتراح الصور البصرية لكل مشهد، وهندسة الصوت والمؤثرات، وتعديل التعليق الصوتي
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Prompt Chips */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  '🎨 اقترح صوراً بصرية لكل مشهد',
                  '🎵 اقترح الخلفية الصوتية والمؤثرات',
                  '🎙️ تحسين نبرة التعليق الصوتي بالفصحى',
                  '💡 كيف أجعل المشهد الأول أكثر تشويقاً؟',
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setChatInput(chip.replace(/^[^\s]+\s/, ''))}
                    className="text-[11px] px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold border border-purple-200 transition-colors cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Messages Container */}
              <div className="h-80 overflow-y-auto space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-xs ${
                        msg.sender === 'user'
                          ? 'bg-purple-700 text-white rounded-br-xs'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                      }`}
                    >
                      <div className="whitespace-pre-wrap font-medium">{msg.text}</div>
                      <span className={`block text-[9px] mt-1.5 ${msg.sender === 'user' ? 'text-purple-200 text-left' : 'text-slate-400 text-right'}`}>
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex items-center gap-2 text-xs text-purple-700 bg-purple-50 p-3 rounded-2xl w-fit animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                    <span>المساعد الذكي يجهز اقتراحات الفيديو (صور وصوت)...</span>
                  </div>
                )}
              </div>

              {/* Chat Input Form */}
              <form onSubmit={handleSendChatMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="اكتب طلبك لتصميم الفيديو (مثل: اقترح صوراً للمشهد الثاني، أو هندسة الصوت)..."
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-right focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isChatLoading || !chatInput.trim()}
                  className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white rounded-xl text-xs font-black transition-all shadow-md cursor-pointer shrink-0"
                >
                  إرسال 🚀
                </button>
              </form>
            </div>
          )}

          {activeTab === 'scenes' && (
            <>
              {/* Animated Storyboard Preview Player Box */}
          <div className="bg-slate-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-800 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <MonitorPlay className="w-5 h-5 text-purple-400 animate-pulse" />
                <span className="text-xs font-bold text-slate-300">
                  شاشة المعاينة الحية: {activeScene.sceneTitle}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {isSpeaking && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                    <Mic className="w-3.5 h-3.5" />
                    <span>جاري التكلم بالفصحى...</span>
                  </span>
                )}
                <div className="flex items-center gap-2 text-xs font-bold text-purple-300 bg-purple-950/80 px-3 py-1 rounded-full border border-purple-800/60">
                  <Clock className="w-3.5 h-3.5" />
                  <span>المدة: {toArabicDigits(activeScene.durationSeconds)} ثانية</span>
                </div>
              </div>
            </div>

            {/* Video Player Visual Box */}
            <div className="relative aspect-video max-h-72 w-full bg-linear-to-tr from-slate-900 via-purple-950/40 to-slate-900 rounded-2xl border border-slate-800 flex flex-col items-center justify-center p-6 text-center space-y-4 shadow-inner overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(147,51,235,0.15)_0,transparent_70%)] pointer-events-none" />

              <div className="space-y-2 z-10 max-w-lg">
                <span className="inline-block px-3 py-1 rounded-full text-[11px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {currentPlan.header.subject} · {currentPlan.header.grade}
                </span>
                <h4 className="text-xl sm:text-2xl font-black font-['Tajawal'] text-white">
                  {currentPlan.header.lessonTitle || currentPlan.title}
                </h4>
                <p className="text-xs sm:text-sm text-purple-200 font-medium leading-relaxed bg-black/40 p-3 rounded-xl border border-white/10">
                  🎬 <strong>المشهد الحالي:</strong> {activeScene.visualDescription}
                </p>
                <div className="text-xs text-amber-300 font-bold bg-amber-950/50 px-3 py-2 rounded-xl border border-amber-500/30 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 shrink-0 animate-bounce text-amber-400" />
                    <span className="text-right">"{activeScene.voiceoverScript}"</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => speakVoiceover(activeScene.voiceoverScript)}
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-[11px] font-black shrink-0 transition-colors cursor-pointer"
                    title="استماع للتعليق الصوتي بالفصحى"
                  >
                    🔊 استماع
                  </button>
                </div>
              </div>

              {/* Playback Progress Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-800">
                <div
                  className="h-full bg-linear-to-r from-purple-500 to-indigo-500 transition-all duration-300"
                  style={{ width: `${playbackProgress}%` }}
                />
              </div>
            </div>

            {/* Generated Video Download Link if available */}
            {recordedVideoUrl && (
              <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl flex items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-2.5 text-xs text-emerald-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>تم بنجاح توليد وتسجيل فيديو الموشن جرافيك الرقمي!</span>
                </div>
                <a
                  href={recordedVideoUrl}
                  download={`MotionGraphics_${currentPlan.header?.lessonTitle || 'lesson'}.webm`}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>تحميل ملف الفيديو (WebM)</span>
                </a>
              </div>
            )}

            {/* Video Generation Progress Banner */}
            {isGeneratingVideo && (
              <div className="p-3 bg-purple-950/80 border border-purple-500/50 rounded-2xl flex items-center gap-3 text-xs text-purple-200">
                <Loader2 className="w-5 h-5 animate-spin text-purple-400 shrink-0" />
                <span className="font-semibold">{videoProgressMsg}</span>
              </div>
            )}

            {/* Player Controls & Video Generation Button */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const nextPlaying = !isPlaying;
                    setIsPlaying(nextPlaying);
                    if (nextPlaying) {
                      speakVoiceover(activeScene.voiceoverScript);
                    } else {
                      stopSpeech();
                    }
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>إيقاف مؤقت</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>تشغيل المعاينة</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleGenerateAndExportVideo}
                  disabled={isGeneratingVideo}
                  className="px-4 py-2 bg-linear-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                  title="توليد وتسجيل ملف فيديو رقمي للمنظومة"
                >
                  {isGeneratingVideo ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-200" />
                      <span>جاري توليد الفيديو...</span>
                    </>
                  ) : (
                    <>
                      <Video className="w-4 h-4 text-emerald-200" />
                      <span>🔴 توليد وتسجيل الفيديو (Video)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const nextState = !isSpeechEnabled;
                    setIsSpeechEnabled(nextState);
                    if (!nextState) stopSpeech();
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isSpeechEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                  title="تفعيل أو إيقاف التعليق الصوتي الفصيح"
                >
                  {isSpeechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  <span>{isSpeechEnabled ? 'فصحى مفعلة' : 'صامت'}</span>
                </button>
              </div>

              {/* Scene Navigation Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {motionScenes.map((scene, idx) => (
                  <button
                    key={scene.id}
                    onClick={() => {
                      setActiveSceneIndex(idx);
                      setPlaybackProgress(0);
                      setIsPlaying(true);
                      speakVoiceover(scene.voiceoverScript);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeSceneIndex === idx
                        ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-400/40'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    }`}
                  >
                    مشهد {toArabicDigits(scene.id)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Scene-by-Scene Storyboard Breakdown */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h4 className="text-sm font-black font-['Tajawal'] text-slate-900 flex items-center gap-2">
                <Film className="w-4 h-4 text-purple-700" />
                <span>تفاصيل مشاهد سيناريو الموشن جرافيك (باللغة العربية الفصحى)</span>
              </h4>
              <span className="text-xs font-bold text-slate-500 tabular-nums">
                إجمالي المدة: {toArabicDigits(motionScenes.reduce((acc, s) => acc + s.durationSeconds, 0))} ثانية
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {motionScenes.map((scene, idx) => (
                <div
                  key={scene.id}
                  onClick={() => {
                    setActiveSceneIndex(idx);
                    speakVoiceover(scene.voiceoverScript);
                  }}
                  className={`border rounded-2xl p-4 transition-all cursor-pointer space-y-3 ${
                    activeSceneIndex === idx
                      ? 'border-purple-500 bg-purple-50/50 shadow-sm ring-2 ring-purple-500/20'
                      : 'border-slate-200 bg-white hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900">
                      المشهد {toArabicDigits(scene.id)}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          speakVoiceover(scene.voiceoverScript);
                        }}
                        className="px-2 py-0.5 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-[10px] font-bold flex items-center gap-1 transition-colors"
                        title="استماع بالفصحى"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>استماع</span>
                      </button>
                      <span className="text-xs font-bold text-slate-500 tabular-nums">
                        ⏱️ {toArabicDigits(scene.durationSeconds)} ثانية
                      </span>
                    </div>
                  </div>

                  <h5 className="font-bold text-slate-900 text-sm font-['Tajawal']">
                    {scene.sceneTitle}
                  </h5>

                  <div className="space-y-2 text-xs text-slate-700">
                    <p className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      🎨 <strong>الرسوم البصرية:</strong> {scene.visualDescription}
                    </p>
                    <p className="bg-purple-50/70 p-2.5 rounded-xl border border-purple-200 text-purple-950 font-medium">
                      🎙️ <strong>التعليق الصوتي بالفصحى:</strong> "{scene.voiceoverScript}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons Hub */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={handleCopyScript}
              className="px-4 py-2.5 bg-linear-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>تم نسخ السيناريو!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-purple-200" />
                  <span>نسخ السيناريو الكامل</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadTxt}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-300" />
              <span>تحميل كملف نصي (TXT)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const printWindow = window.open('', '_blank');
                if (!printWindow) return;
                printWindow.document.write(`
                  <html lang="ar" dir="rtl">
                    <head><title>سيناريو الموشن جرافيك</title></head>
                    <body style="font-family: 'Cairo', sans-serif; padding: 20px; text-align: right;">
                      <h2>سيناريو فيديو موشن جرافيك - ${currentPlan.header.lessonTitle || currentPlan.title}</h2>
                      ${motionScenes.map(s => `<div><h3>${s.sceneTitle}</h3><p>${s.voiceoverScript}</p></div>`).join('')}
                      <script>window.print();</script>
                    </body>
                  </html>
                `);
                printWindow.document.close();
              }}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-emerald-200" />
              <span>طباعة السيناريو</span>
            </button>
          </div>
        </>
      )}
      </div>
      </div>
    </div>
  );
};
