import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  BookOpen,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Plus,
  Trash2,
  FolderPlus,
  Share2,
  Download,
  Upload,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Search,
  Filter,
  Layers,
  Award,
  Link as LinkIcon,
  Video,
  FileText,
  Image as ImageIcon,
  Compass,
  Calculator,
  RefreshCw,
  QrCode,
  Copy,
  Check,
  AlertCircle,
  Clock,
  Send,
  MessageCircle,
  Folder,
  Tag,
  GraduationCap,
  FileCheck2,
  Info,
  ChevronDown,
  ArrowRight,
  Globe,
  Star,
} from 'lucide-react';
import {
  PalestinianOerItem,
  PalestinianOerPublisher,
  PalestinianOerType,
  TeacherSuggestedOerResource,
  OerCustomGroup,
  TeacherPersonalOerLibrary,
  CustomAddedOerLink,
} from '../types/palestinianOer';
import {
  PALESTINIAN_OER_DATABASE,
  DEFAULT_TEACHER_GROUPS,
  queryPalestinianOerResources,
  getAvailableOerSubjects,
  getAvailableOerGrades,
  getTopicsForSubjectAndGrade,
} from '../data/palestinianOerRegistry';
import { LessonPlan, OerResourceItem } from '../types/lessonPlan';
import { toArabicDigits, formatDateDMY } from '../utils/arabicNumerals';

interface PalestinianOerHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan?: LessonPlan;
  onApplyOerResourceToPlan?: (
    resource: PalestinianOerItem,
    targetType: 'as_primary' | 'as_induction' | 'as_step' | 'as_alternative'
  ) => void;
}

const STORAGE_PERSONAL_LIB_KEY = 'abqoor_palestinian_personal_library_v1';

export const PalestinianOerHubModal: React.FC<PalestinianOerHubModalProps> = ({
  isOpen,
  onClose,
  currentPlan,
  onApplyOerResourceToPlan,
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'browser' | 'personal_library' | 'suggest_resource' | 'custom_added'>('browser');

  // Custom added link modal state
  const [isCustomLinkModalOpen, setIsCustomLinkModalOpen] = useState(false);
  const [editingCustomLinkId, setEditingCustomLinkId] = useState<string | null>(null);
  const [customLinkTitle, setCustomLinkTitle] = useState('');
  const [customLinkUrl, setCustomLinkUrl] = useState('');
  const [customLinkType, setCustomLinkType] = useState('موقع تعليمي');
  const [customLinkNote, setCustomLinkNote] = useState('');

  // Filters for Explorer
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedPublisher, setSelectedPublisher] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Personal Library state loaded from localStorage
  const [libraryData, setLibraryData] = useState<TeacherPersonalOerLibrary>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PERSONAL_LIB_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          savedResourceIds: Array.isArray(parsed.savedResourceIds) ? parsed.savedResourceIds : [
            'oer-math-g3-book-elearn',
            'oer-math-g3-abacus-sim-elearn',
            'oer-arabic-g2-book-elearn',
          ],
          groups: Array.isArray(parsed.groups) && parsed.groups.length > 0 ? parsed.groups : DEFAULT_TEACHER_GROUPS,
          personalNotes: parsed.personalNotes || {},
          suggestedResources: Array.isArray(parsed.suggestedResources) ? parsed.suggestedResources : [
            {
              id: 'sug-sample-1',
              title: 'دليل الأنشطة البيئية التطبيقية لزيتون فلسطين في الحساب والعلوم',
              subject: 'العلوم والحياة',
              grade: 'الصف الثالث الأساسي',
              topic: 'عالم النباتات والبيئة من حولنا',
              type: 'worksheet',
              directUrl: 'https://rawafed.edu.ps/community/olive-trees-activities.pdf',
              licenseType: 'Creative Commons CC-BY-SA 4.0',
              pedagogicalJustification: 'يربط مفاهيم العلوم بالتراث الوطني الفلسطيني ويحفز العمل التعاوني في الحقول المدرسية.',
              teacherName: 'أ. إبراهيم الخليل',
              school: 'مدرسة ذكور الفجر الأساسية',
              directorate: 'مديرية التربية والتعليم - رام الله والبيرة',
              submissionDate: '٢٠٢٦/١٠/٠٨م',
              referenceNumber: 'OER-PAL-2026-X812',
              reviewStatus: 'approved_endorsed',
              reviewNotes: 'تمت المصادقة من قبل قسم الإشراف التربوي - مصدر معتمد في بنك المبادرات المفتوحة.',
              reviewedByCommitteeAt: '٢٠٢٦/١٠/١٠م',
              committeeDecisionNote: 'مجاز ومدرج ضمن قائمة المصادر الوطنية المعززة للمنهاج.',
            },
          ],
        };
      }
    } catch (e) {
      console.error('Error loading library data from storage:', e);
    }
    return {
      savedResourceIds: [
        'oer-math-g3-book-elearn',
        'oer-math-g3-abacus-sim-elearn',
        'oer-arabic-g2-book-elearn',
      ],
      groups: DEFAULT_TEACHER_GROUPS,
      personalNotes: {},
      suggestedResources: [],
    };
  });

  // Save to localStorage whenever libraryData changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PERSONAL_LIB_KEY, JSON.stringify(libraryData));
    } catch (e) {
      console.error('Error saving library data:', e);
    }
  }, [libraryData]);

  // Selected group filter in Personal Library
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all');

  // New Collection Form state
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupColor, setNewGroupColor] = useState('emerald');

  // Suggest Resource Form state
  const [suggestTitle, setSuggestTitle] = useState('');
  const [suggestSubject, setSuggestSubject] = useState('الرياضيات');
  const [suggestGrade, setSuggestGrade] = useState('الصف الثالث الأساسي');
  const [suggestTopic, setSuggestTopic] = useState('');
  const [suggestType, setSuggestType] = useState<PalestinianOerType>('interactive_activity');
  const [suggestUrl, setSuggestUrl] = useState('');
  const [suggestLicense, setSuggestLicense] = useState('Creative Commons CC-BY-NC-SA 4.0 (مشاع إبداعي)');
  const [suggestJustification, setSuggestJustification] = useState('');
  const [suggestTeacherName, setSuggestTeacherName] = useState(currentPlan?.header?.teacherName || 'معلم مبدع');
  const [suggestSchool, setSuggestSchool] = useState(currentPlan?.header?.school || 'مدرسة أساسية فلسطينية');
  const [suggestDirectorate, setSuggestDirectorate] = useState(currentPlan?.header?.directorate || 'مديرية التربية والتعليم');

  // Quick notices and action feedback
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);
  const [copiedShareCode, setCopiedShareCode] = useState<string | null>(null);
  const [showQrModalForGroup, setShowQrModalForGroup] = useState<OerCustomGroup | null>(null);

  // Group add selector for a specific resource card
  const [activeGroupSelectorResourceId, setActiveGroupSelectorResourceId] = useState<string | null>(null);

  // Custom Link Handlers
  const handleSaveCustomLinkModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customLinkTitle.trim() || !customLinkUrl.trim()) {
      alert('يرجى إدخال اسم المصدر ورابط الموقع على الأقل.');
      return;
    }

    setLibraryData((prev) => {
      const existing = prev.customAddedResources || [];
      if (editingCustomLinkId) {
        const updated = existing.map((item) =>
          item.id === editingCustomLinkId
            ? {
                ...item,
                title: customLinkTitle.trim(),
                url: customLinkUrl.trim(),
                type: customLinkType,
                note: customLinkNote.trim(),
              }
            : item
        );
        return { ...prev, customAddedResources: updated };
      } else {
        const newItem: CustomAddedOerLink = {
          id: `custom-link-${Date.now()}`,
          title: customLinkTitle.trim(),
          url: customLinkUrl.trim(),
          type: customLinkType,
          note: customLinkNote.trim(),
          createdAt: formatDateDMY(new Date().toISOString()),
        };
        return { ...prev, customAddedResources: [newItem, ...existing] };
      }
    });

    setFeedbackNotice(
      editingCustomLinkId
        ? 'تم تحديث المصدر المضاف بنجاح! ✏️'
        : 'تمت إضافة المصدر المفتوح برابط بنجاح إلى مصادري المضافة! ✅'
    );
    setTimeout(() => setFeedbackNotice(null), 3500);

    setIsCustomLinkModalOpen(false);
    setEditingCustomLinkId(null);
    setCustomLinkTitle('');
    setCustomLinkUrl('');
    setCustomLinkType('موقع تعليمي');
    setCustomLinkNote('');
  };

  const handleEditCustomLink = (item: CustomAddedOerLink) => {
    setEditingCustomLinkId(item.id);
    setCustomLinkTitle(item.title);
    setCustomLinkUrl(item.url);
    setCustomLinkType(item.type);
    setCustomLinkNote(item.note);
    setIsCustomLinkModalOpen(true);
  };

  const handleDeleteCustomLink = (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المصدر المضاف؟')) return;
    setLibraryData((prev) => ({
      ...prev,
      customAddedResources: (prev.customAddedResources || []).filter((item) => item.id !== id),
    }));
    setFeedbackNotice('تمت إزالة المصدر بنجاح.');
    setTimeout(() => setFeedbackNotice(null), 2500);
  };

  const handleShareCustomLinkWhatsApp = (item: CustomAddedOerLink) => {
    const text = [
      `🇵🇸 *مصدر تعليمي مفتوح موصى به*`,
      `📌 *الاسم:* ${item.title}`,
      `🏷️ *النوع:* ${item.type}`,
      `🔗 *الرابط:* ${item.url}`,
      item.note ? `📝 *ملاحظة:* ${item.note}` : '',
      `---------------------------------`,
      `منظومة «عبقور» للتخطيط التربوي - فلسطين`,
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard.writeText(text);
    setFeedbackNotice(`تم نسخ بطاقة المصدر «${item.title}» الجاهزة للواتساب! 📋`);
    setTimeout(() => setFeedbackNotice(null), 3500);
  };

  const handleExportCustomLinksJson = () => {
    const links = libraryData.customAddedResources || [];
    const blob = new Blob(
      [JSON.stringify({ version: '1.0', exportedAt: new Date().toISOString(), customLinks: links }, null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `abqoor-my-added-oer-resources.json`;
    a.click();
    URL.revokeObjectURL(url);
    setFeedbackNotice('تم تصدير مصادري المضافة بنجاح كملف JSON! 💾');
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  // Auto-sync filters with current active plan if available
  const handleSyncWithCurrentPlan = () => {
    if (!currentPlan) return;
    const subj = currentPlan.header.subject.split('-')[0].trim();
    const gr = currentPlan.header.grade.trim();
    const title = currentPlan.header.lessonTitle || currentPlan.title;

    setSelectedSubject(subj || 'all');
    setSelectedGrade(gr || 'all');
    setSelectedTopic(title || '');
    setFeedbackNotice('تمت المزامنة تلقائياً مع مادة وصف وموضوع الخطة المفتوحة! 🎯');
    setTimeout(() => setFeedbackNotice(null), 3500);
  };

  // Filtered resources for the browser
  const filteredBrowserResources = useMemo(() => {
    if (selectedPublisher === 'custom_open_source') {
      const items: PalestinianOerItem[] = (libraryData.customAddedResources || []).map((c) => ({
        id: c.id,
        title: c.title,
        subject: selectedSubject !== 'all' ? selectedSubject : 'الرياضيات والعلوم',
        grade: selectedGrade !== 'all' ? selectedGrade : 'الصف الأساسي',
        topic: c.note || 'مصدر مفتوح برابط مباشر',
        unitTitle: 'مصادر مفتوحة مخصصة',
        type: (c.type === 'فيديو' ? 'video' : c.type === 'كتاب' ? 'book' : c.type === 'صورة' ? 'image' : c.type === 'نشاط' ? 'interactive_activity' : 'link') as any,
        publisher: 'custom_open_source' as any,
        publisherNameAr: 'مصدري المضاف برابط مباشر (Open Source OER)',
        priority: 5,
        directUrl: c.url,
        officialBadge: {
          text: 'مصدر مفتوح برابط مباشر',
          subText: c.createdAt,
          tier: 'community_teal',
        },
        license: 'مفتوح - مشاركة حرة',
        description: c.note || 'مصدر تعليمي مفتوح أضافه المعلم برابط مباشر.',
        suggestedUseInLesson: 'توظيف مباشر في الأنشطة الصفية.',
        tags: ['مصدر مفتوح', c.type],
      }));
      let results = items;
      if (selectedType !== 'all') {
        results = results.filter((i) => i.type === selectedType);
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        results = results.filter((i) => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
      }
      return results;
    }

    return queryPalestinianOerResources({
      subject: selectedSubject,
      grade: selectedGrade,
      topic: selectedTopic,
      publisher: selectedPublisher,
      type: selectedType,
      searchQuery: searchQuery,
    });
  }, [selectedSubject, selectedGrade, selectedTopic, selectedPublisher, selectedType, searchQuery, libraryData.customAddedResources]);

  // Saved resources items for teacher's library
  const savedOerItems = useMemo(() => {
    const map = new Map<string, PalestinianOerItem>();
    PALESTINIAN_OER_DATABASE.forEach((item) => map.set(item.id, item));
    // Also include any approved teacher suggested resources
    libraryData.suggestedResources
      .filter((s) => s.reviewStatus === 'approved_endorsed')
      .forEach((s) => {
        map.set(s.id, {
          id: s.id,
          title: s.title,
          subject: s.subject,
          grade: s.grade,
          topic: s.topic,
          type: s.type,
          publisher: 'teacher_community',
          publisherNameAr: `مساهمة معتمدة - ${s.teacherName} (${s.school})`,
          priority: 5,
          directUrl: s.directUrl,
          officialBadge: {
            text: 'معتمد تربوياً - مساهمة المعلم',
            subText: s.referenceNumber,
            tier: 'community_teal',
          },
          license: s.licenseType,
          description: s.pedagogicalJustification,
          suggestedUseInLesson: 'موظف كمبادرة إثرائية معتمدة.',
          tags: ['مبادرة معلم', s.subject, s.grade],
        });
      });

    return libraryData.savedResourceIds
      .map((id) => map.get(id))
      .filter((item): item is PalestinianOerItem => Boolean(item));
  }, [libraryData.savedResourceIds, libraryData.suggestedResources]);

  // Filtered personal library items by group
  const displayPersonalLibraryItems = useMemo(() => {
    if (selectedGroupFilter === 'all') return savedOerItems;
    const group = libraryData.groups.find((g) => g.id === selectedGroupFilter);
    if (!group) return savedOerItems;
    return savedOerItems.filter((item) => group.resourceIds.includes(item.id));
  }, [savedOerItems, selectedGroupFilter, libraryData.groups]);

  // Toggle Save / Unsave resource in personal library
  const handleToggleSaveToLibrary = (resourceId: string) => {
    setLibraryData((prev) => {
      const exists = prev.savedResourceIds.includes(resourceId);
      let updatedIds = exists
        ? prev.savedResourceIds.filter((id) => id !== resourceId)
        : [resourceId, ...prev.savedResourceIds];

      // If removed, also remove from all groups
      let updatedGroups = prev.groups;
      if (exists) {
        updatedGroups = prev.groups.map((g) => ({
          ...g,
          resourceIds: g.resourceIds.filter((id) => id !== resourceId),
        }));
      }

      const msg = exists
        ? 'تمت إزالة المصدر من مكتبتك الشخصية'
        : 'تم حفظ المصدر في مكتبتك الشخصية بنجاح! ⭐';
      setFeedbackNotice(msg);
      setTimeout(() => setFeedbackNotice(null), 3000);

      return {
        ...prev,
        savedResourceIds: updatedIds,
        groups: updatedGroups,
      };
    });
  };

  // Add resource to a specific custom group
  const handleAddResourceToGroup = (resourceId: string, groupId: string) => {
    setLibraryData((prev) => {
      // Ensure it is in savedResourceIds
      const updatedSaved = prev.savedResourceIds.includes(resourceId)
        ? prev.savedResourceIds
        : [resourceId, ...prev.savedResourceIds];

      const updatedGroups = prev.groups.map((g) => {
        if (g.id === groupId) {
          const hasIt = g.resourceIds.includes(resourceId);
          return {
            ...g,
            resourceIds: hasIt ? g.resourceIds : [...g.resourceIds, resourceId],
          };
        }
        return g;
      });

      const groupName = prev.groups.find((g) => g.id === groupId)?.name || '';
      setFeedbackNotice(`أُضيف المصدر إلى مجموعة «${groupName}» بنجاح! 📁`);
      setTimeout(() => setFeedbackNotice(null), 3000);
      setActiveGroupSelectorResourceId(null);

      return {
        ...prev,
        savedResourceIds: updatedSaved,
        groups: updatedGroups,
      };
    });
  };

  // Remove resource from a specific custom group
  const handleRemoveFromGroup = (resourceId: string, groupId: string) => {
    setLibraryData((prev) => {
      const updatedGroups = prev.groups.map((g) => {
        if (g.id === groupId) {
          return {
            ...g,
            resourceIds: g.resourceIds.filter((id) => id !== resourceId),
          };
        }
        return g;
      });

      setFeedbackNotice('تمت إزالة المصدر من المجموعة.');
      setTimeout(() => setFeedbackNotice(null), 2500);

      return {
        ...prev,
        groups: updatedGroups,
      };
    });
  };

  // Create new custom group
  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const newGroup: OerCustomGroup = {
      id: `group-${Date.now()}`,
      name: newGroupName.trim(),
      description: newGroupDesc.trim() || undefined,
      color: newGroupColor,
      icon: 'Folder',
      createdAt: formatDateDMY(new Date().toISOString()),
      resourceIds: [],
      isShared: true,
      shareCode: `OER-GRP-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
    };

    setLibraryData((prev) => ({
      ...prev,
      groups: [...prev.groups, newGroup],
    }));

    setNewGroupName('');
    setNewGroupDesc('');
    setIsCreatingGroup(false);
    setSelectedGroupFilter(newGroup.id);
    setFeedbackNotice(`تم إنشاء المجموعة الجديدة «${newGroup.name}» بنجاح! 🎉`);
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  // Delete custom group
  const handleDeleteGroup = (groupId: string) => {
    const grp = libraryData.groups.find((g) => g.id === groupId);
    if (!confirm(`هل أنت متأكد من حذف المجموعة «${grp?.name}»؟ لن يتم حذف المصادر المحفوظة.`)) {
      return;
    }

    setLibraryData((prev) => ({
      ...prev,
      groups: prev.groups.filter((g) => g.id !== groupId),
    }));
    if (selectedGroupFilter === groupId) {
      setSelectedGroupFilter('all');
    }
  };

  // Submit Teacher Suggestion
  const handleSubmitSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestTitle.trim() || !suggestUrl.trim()) {
      alert('يرجى ملء عنوان المصدر والرابط المباشر على الأقل.');
      return;
    }

    const refNumber = `OER-PAL-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newSug: TeacherSuggestedOerResource = {
      id: `sug-${Date.now()}`,
      title: suggestTitle.trim(),
      subject: suggestSubject,
      grade: suggestGrade,
      topic: suggestTopic.trim() || 'عام في المنهاج',
      type: suggestType,
      directUrl: suggestUrl.trim(),
      licenseType: suggestLicense,
      pedagogicalJustification: suggestJustification.trim() || 'مصدر مساند ومثري للمنهاج الفلسطيني.',
      teacherName: suggestTeacherName.trim(),
      school: suggestSchool.trim(),
      directorate: suggestDirectorate.trim(),
      submissionDate: formatDateDMY(new Date().toISOString()),
      referenceNumber: refNumber,
      reviewStatus: 'pending_review',
    };

    setLibraryData((prev) => ({
      ...prev,
      suggestedResources: [newSug, ...prev.suggestedResources],
    }));

    setSuggestTitle('');
    setSuggestUrl('');
    setSuggestTopic('');
    setSuggestJustification('');

    setFeedbackNotice(`تم تقديم المقترح برقم طلب رسمي: (${refNumber}) إلى لجنة الإشراف التربوي! 📝`);
    setTimeout(() => setFeedbackNotice(null), 5000);
  };

  // Simulate Committee Endorsement
  const handleSimulateCommitteeDecision = (sugId: string, newStatus: 'approved_endorsed' | 'revision_requested') => {
    setLibraryData((prev) => {
      const updated = prev.suggestedResources.map((s) => {
        if (s.id === sugId) {
          return {
            ...s,
            reviewStatus: newStatus,
            reviewedByCommitteeAt: formatDateDMY(new Date().toISOString()),
            committeeDecisionNote:
              newStatus === 'approved_endorsed'
                ? 'تم فحص المصدر والتأكد من توافقه الكامل مع الإطار العام للمنهاج الفلسطيني. مجاز ومدرج رسمياً في بنك المصادر.'
                : 'يحتاج المصدر لتوضيح إضافي حول حقوق الملكية الفكرية وتحديث بعض الروابط.',
          };
        }
        return s;
      });

      // If approved, automatically save it to teacher's saved resources too!
      let updatedSaved = prev.savedResourceIds;
      if (newStatus === 'approved_endorsed' && !updatedSaved.includes(sugId)) {
        updatedSaved = [sugId, ...updatedSaved];
      }

      return {
        ...prev,
        suggestedResources: updated,
        savedResourceIds: updatedSaved,
      };
    });

    const statusText = newStatus === 'approved_endorsed' ? 'تم اعتماد المصدر رسمياً ومصادقته! 🏅' : 'تم إرسال طلب التعديل.';
    setFeedbackNotice(statusText);
    setTimeout(() => setFeedbackNotice(null), 4000);
  };

  // Share Group with Colleagues (Format ready WhatsApp card)
  const handleCopyGroupWhatsAppShare = (group: OerCustomGroup) => {
    const groupItems = PALESTINIAN_OER_DATABASE.filter((i) => group.resourceIds.includes(i.id));

    const lines = [
      `🇵🇸 *مجموعة مصادر التعليم المفتوح (OER) المعتمدة في فلسطين*`,
      `📁 *اسم المجموعة:* ${group.name}`,
      group.description ? `📝 *الوصف:* ${group.description}` : '',
      `👤 *مُعدّة بواسطة:* المعلم/ـة عبر منظومة «عبقور» للتخطيط التربوي`,
      `📅 *التاريخ:* ${group.createdAt}`,
      `🔗 *رمز المشاركة:* ${group.shareCode || 'OER-PAL'}`,
      `---------------------------------`,
      `📚 *المصادر المرفقة (${toArabicDigits(groupItems.length)}):*`,
      ...groupItems.map(
        (item, idx) =>
          `${toArabicDigits(idx + 1)}. *${item.title}*\n   • الجهة: ${item.publisherNameAr}\n   • الرابط المباشر: ${item.directUrl}`
      ),
      `---------------------------------`,
      `منظومة «عبقور» - متوافقة مع دليل التعليم المستند لمصادر التعليم المفتوحة OER`,
    ].filter(Boolean);

    const shareText = lines.join('\n');
    navigator.clipboard.writeText(shareText);
    setCopiedShareCode(group.id);
    setFeedbackNotice(`تم نسخ بطاقة المشاركة لمجموعة «${group.name}» الجاهزة للواتساب! 📋`);
    setTimeout(() => {
      setCopiedShareCode(null);
      setFeedbackNotice(null);
    }, 4000);
  };

  // Export Group as JSON
  const handleExportGroupJson = (group: OerCustomGroup) => {
    const groupItems = PALESTINIAN_OER_DATABASE.filter((i) => group.resourceIds.includes(i.id));
    const dataToExport = {
      abqoorOerGroupVersion: '1.0',
      groupInfo: group,
      exportedAt: new Date().toISOString(),
      items: groupItems,
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `abqoor-oer-group-${group.name.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setFeedbackNotice(`تم تصدير ملف المجموعة «${group.name}» كملف JSON بنجاح! 💾`);
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/75 backdrop-blur-xs font-sans text-right rtl">
      <div className="relative w-full max-w-6xl max-h-[95vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-emerald-700/20 animate-in fade-in zoom-in-95 duration-200">
        
        {/* ========================================================================= */}
        {/* Header with Palestinian Official Identity & Badges */}
        {/* ========================================================================= */}
        <div className="bg-linear-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-4 sm:p-5 shrink-0 relative overflow-hidden border-b-4 border-amber-400">
          {/* Subtle Palestinian Flag Accent Bar in corner */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-black via-white to-emerald-600 flex">
            <div className="w-1/3 bg-black"></div>
            <div className="w-1/3 bg-white"></div>
            <div className="w-1/3 bg-emerald-600"></div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner text-amber-300">
                <Globe className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
                    <span>وحدة الربط المباشر بمصادر التعليم المفتوحة OER</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black">
                      دولة فلسطين 🇵🇸
                    </span>
                  </h2>
                </div>
                <p className="text-xs text-emerald-200/90 mt-0.5 font-medium flex items-center gap-1.5">
                  <span>مرتبطة رسمياً بـ: elearn.edu.ps • منصة منهاجي • منصة روافد • مكتبة المحتوى الفلسطيني</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Quick Plan Sync Button */}
              {currentPlan && (
                <button
                  type="button"
                  onClick={handleSyncWithCurrentPlan}
                  className="px-3 py-1.5 bg-emerald-700/60 hover:bg-emerald-600 text-emerald-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-emerald-500/40 cursor-pointer shadow-2xs"
                  title="تعبئة المادة والصف والموضوع من الخطة الحالية فوراً"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden sm:inline">مزامنة مع الخطة الحالية:</span>
                  <span className="font-bold text-white underline underline-offset-2">
                    {currentPlan.header.lessonTitle || currentPlan.title}
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer border border-white/10"
                aria-label="إغلاق النافذة"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Sub Navigation Bar & Custom Add Button */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-white/10">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('browser')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-2xs ${
                  activeTab === 'browser'
                    ? 'bg-amber-400 text-slate-950 shadow-md scale-102'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>المستكشف الذكي للمصادر المعتمدة</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'browser' ? 'bg-slate-950 text-amber-400' : 'bg-white/20 text-white'
                }`}>
                  {toArabicDigits(filteredBrowserResources.length)}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('personal_library')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-2xs ${
                  activeTab === 'personal_library'
                    ? 'bg-amber-400 text-slate-950 shadow-md scale-102'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>مكتبتي الشخصية ومجموعاتي</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'personal_library' ? 'bg-slate-950 text-amber-400' : 'bg-white/20 text-white'
                }`}>
                  {toArabicDigits(savedOerItems.length)}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('custom_added')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-2xs ${
                  activeTab === 'custom_added'
                    ? 'bg-amber-400 text-slate-950 shadow-md scale-102'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <LinkIcon className="w-4 h-4" />
                <span>📂 مصادري المضافة</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'custom_added' ? 'bg-slate-950 text-amber-400' : 'bg-emerald-600 text-white'
                }`}>
                  {toArabicDigits(libraryData.customAddedResources?.length || 0)}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('suggest_resource')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-2xs ${
                  activeTab === 'suggest_resource'
                    ? 'bg-amber-400 text-slate-950 shadow-md scale-102'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>اقتراح مصدر واعتماده تربوياً</span>
                {libraryData.suggestedResources.length > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeTab === 'suggest_resource' ? 'bg-slate-950 text-amber-400' : 'bg-emerald-500 text-white'
                  }`}>
                    {toArabicDigits(libraryData.suggestedResources.length)}
                  </span>
                )}
              </button>
            </div>

            {/* Quick Add Custom Link Button */}
            <button
              type="button"
              onClick={() => {
                setEditingCustomLinkId(null);
                setCustomLinkTitle('');
                setCustomLinkUrl('');
                setCustomLinkType('موقع تعليمي');
                setCustomLinkNote('');
                setIsCustomLinkModalOpen(true);
              }}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-97"
              title="إضافة مصدر مفتوح جديد برابط مباشر"
            >
              <Plus className="w-4 h-4" />
              <span>➕ إضافة مصدر مفتوح برابط</span>
            </button>
          </div>
        </div>

        {/* Global Floating Feedback Notice */}
        {feedbackNotice && (
          <div className="bg-emerald-600 text-white text-xs px-4 py-2 font-bold flex items-center justify-between gap-2 shadow-sm animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{feedbackNotice}</span>
            </div>
            <button
              onClick={() => setFeedbackNotice(null)}
              className="text-white/80 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: Smart OER Explorer & Automatic Filter */}
        {/* ========================================================================= */}
        {activeTab === 'browser' && (
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
            
            {/* Filter Bar */}
            <div className="p-3 sm:p-4 bg-white border-b border-slate-200 shrink-0 shadow-2xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                
                {/* Subject Selector */}
                <div>
                  <label className="block text-[11px] font-black text-slate-600 mb-1">المادة الدراسية:</label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => {
                      setSelectedSubject(e.target.value);
                      setSelectedTopic('');
                    }}
                    className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-300 focus:border-emerald-600 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-hidden transition-all"
                  >
                    <option value="all">كافة المواد الدراسية</option>
                    {getAvailableOerSubjects().map((subj) => (
                      <option key={subj} value={subj}>{subj}</option>
                    ))}
                  </select>
                </div>

                {/* Grade Selector */}
                <div>
                  <label className="block text-[11px] font-black text-slate-600 mb-1">الصف الدراسي (الأساسي):</label>
                  <select
                    value={selectedGrade}
                    onChange={(e) => {
                      setSelectedGrade(e.target.value);
                      setSelectedTopic('');
                    }}
                    className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-300 focus:border-emerald-600 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-hidden transition-all"
                  >
                    <option value="all">كافة الصفوف (١–٤ فما فوق)</option>
                    {getAvailableOerGrades().map((gr) => (
                      <option key={gr} value={gr}>{gr}</option>
                    ))}
                  </select>
                </div>

                {/* Topic / Unit Selector or Input */}
                <div>
                  <label className="block text-[11px] font-black text-slate-600 mb-1">الموضوع أو الوحدة:</label>
                  <input
                    type="text"
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    placeholder="مثال: القيمة المنزلية، اللام الشمسية..."
                    className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-hidden transition-all"
                  />
                </div>

                {/* Free Search */}
                <div>
                  <label className="block text-[11px] font-black text-slate-600 mb-1">بحث حر بالكلمات المفتاحية:</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="كلمة بحث، مفهوم، مؤشر..."
                      className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 rounded-xl pr-8 pl-2.5 py-1.5 text-xs font-bold text-slate-800 outline-hidden transition-all"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
                  </div>
                </div>

              </div>

              {/* Priority Publisher Filter Badges */}
              <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-100">
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-[11px] font-bold text-slate-500 ml-1">سلم الأولويات:</span>

                  <button
                    type="button"
                    onClick={() => setSelectedPublisher('all')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                      selectedPublisher === 'all'
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    الكل
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPublisher('elearn_edu_ps')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all flex items-center gap-1 cursor-pointer border ${
                      selectedPublisher === 'elearn_edu_ps'
                        ? 'bg-amber-100 text-amber-950 border-amber-400 shadow-2xs'
                        : 'bg-amber-50/70 hover:bg-amber-100 text-amber-900 border-amber-200'
                    }`}
                  >
                    <span className="text-amber-600">🥇</span>
                    <span>elearn.edu.ps (أولوية 1)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPublisher('minhaji')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all flex items-center gap-1 cursor-pointer border ${
                      selectedPublisher === 'minhaji'
                        ? 'bg-blue-100 text-blue-950 border-blue-400 shadow-2xs'
                        : 'bg-blue-50/70 hover:bg-blue-100 text-blue-900 border-blue-200'
                    }`}
                  >
                    <span className="text-blue-600">🥈</span>
                    <span>منصة منهاجي (أولوية 2)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPublisher('rawafed')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all flex items-center gap-1 cursor-pointer border ${
                      selectedPublisher === 'rawafed'
                        ? 'bg-emerald-100 text-emerald-950 border-emerald-400 shadow-2xs'
                        : 'bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900 border-emerald-200'
                    }`}
                  >
                    <span className="text-emerald-600">🥉</span>
                    <span>منصة روافد (أولوية 3)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPublisher('palestine_content_library');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all flex items-center gap-1 cursor-pointer border ${
                      selectedPublisher === 'palestine_content_library'
                        ? 'bg-purple-100 text-purple-950 border-purple-400 shadow-2xs'
                        : 'bg-purple-50/70 hover:bg-purple-100 text-purple-900 border-purple-200'
                    }`}
                  >
                    <span className="text-purple-600">🏅</span>
                    <span>مكتبة المحتوى الفلسطيني (أولوية 4)</span>
                  </button>

                  {/* Open Source with Link Priority Item */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPublisher('custom_open_source');
                      setIsCustomLinkModalOpen(true);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all flex items-center gap-1.5 cursor-pointer border ${
                      selectedPublisher === 'custom_open_source'
                        ? 'bg-emerald-100 text-emerald-950 border-emerald-500 shadow-2xs scale-102'
                        : 'bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900 border-emerald-200'
                    }`}
                    title="اختر مصدر مفتوح برابط ضمن سلم الأولويات وأضف رابطه"
                  >
                    <span className="text-emerald-600">🌐</span>
                    <span>مصدر مفتوح برابط (أولوية مخصصة)</span>
                    <input
                      type="hidden"
                      name="customOpenSourceUrl"
                      value={libraryData.customAddedResources?.[0]?.url || ''}
                    />
                  </button>
                </div>

                {/* Filter by Type */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-500">النوع:</span>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-700 outline-hidden"
                  >
                    <option value="all">كافة الأنواع</option>
                    <option value="book">كتب وزارية</option>
                    <option value="teacher_guide">أدلة المعلم</option>
                    <option value="video">فيديوهات تفاعلية</option>
                    <option value="interactive_activity">محاكاة وألعاب</option>
                    <option value="worksheet">بطاقات وأوراق عمل</option>
                    <option value="visual_card">بطاقات محسوسة</option>
                    <option value="audio_story">تسجيلات صوتية</option>
                  </select>
                </div>
              </div>
            </div>

            {/* List of Resources */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-5">
              {filteredBrowserResources.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center max-w-lg mx-auto my-8">
                  <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
                    <Filter className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm mb-1">لم يتم العثور على مصادر مطابقة لمعايير البحث الحالية</h3>
                  <p className="text-xs text-slate-500 mb-4">
                    جرب إلغاء بعض الفلاتر أو البحث عن مادة أو صف آخر، أو اقترح مصدراً جديداً ليتم اعتماده وإدراجه في البنك.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSubject('all');
                      setSelectedGrade('all');
                      setSelectedTopic('');
                      setSelectedPublisher('all');
                      setSelectedType('all');
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
                  >
                    إعادة ضبط الفلاتر وعرض كافة المصادر
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredBrowserResources.map((item) => {
                    const isSaved = libraryData.savedResourceIds.includes(item.id);
                    const isOfficialElearn = item.publisher === 'elearn_edu_ps';
                    const isMinhaji = item.publisher === 'minhaji';
                    const isRawafed = item.publisher === 'rawafed';

                    return (
                      <div
                        key={item.id}
                        className={`bg-white rounded-2xl border p-4 transition-all flex flex-col justify-between shadow-xs hover:shadow-md ${
                          isOfficialElearn
                            ? 'border-amber-300 hover:border-amber-400 bg-linear-to-b from-amber-50/30 to-white'
                            : isMinhaji
                            ? 'border-blue-200 hover:border-blue-300'
                            : isRawafed
                            ? 'border-emerald-200 hover:border-emerald-300'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          {/* Official Badge & Priority Rank */}
                          <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2.5">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black border ${
                                item.officialBadge.tier === 'ministry_gold'
                                  ? 'bg-amber-100 text-amber-950 border-amber-300 shadow-2xs'
                                  : item.officialBadge.tier === 'minhaji_blue'
                                  ? 'bg-blue-100 text-blue-950 border-blue-300'
                                  : item.officialBadge.tier === 'rawafed_green'
                                  ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                                  : 'bg-purple-100 text-purple-950 border-purple-300'
                              }`}
                            >
                              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                              <span>{item.officialBadge.text}</span>
                            </span>

                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                              الأولوية: {item.priority === 1 ? '🥇 أولوية 1' : item.priority === 2 ? '🥈 أولوية 2' : item.priority === 3 ? '🥉 أولوية 3' : '🏅 أولوية 4'}
                            </span>
                          </div>

                          {/* Title */}
                          <h4 className="font-black text-slate-900 text-sm leading-snug mb-1.5">
                            {item.title}
                          </h4>

                          {/* Publisher info */}
                          <p className="text-[11px] font-bold text-emerald-800 flex items-center gap-1 mb-2">
                            <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                            <span>{item.publisherNameAr}</span>
                          </p>

                          {/* Subject, Grade, Topic Tags */}
                          <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-bold">
                              {item.subject}
                            </span>
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-bold">
                              {item.grade}
                            </span>
                            <span className="px-2 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 rounded-md text-[10px] font-bold">
                              {item.topic}
                            </span>
                          </div>

                          {/* Description */}
                          <p className="text-xs text-slate-600 leading-relaxed mb-2 line-clamp-2">
                            {item.description}
                          </p>

                          {/* Suggested Use in Lesson */}
                          {item.suggestedUseInLesson && (
                            <div className="bg-slate-50 border-r-2 border-amber-400 p-2 rounded-r-none rounded-l-lg mb-3 text-[11px] text-slate-700">
                              <span className="font-black text-slate-900">توظيف المصدر في الحصة: </span>
                              <span>{item.suggestedUseInLesson}</span>
                            </div>
                          )}
                        </div>

                        {/* Action Toolbar */}
                        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                          
                          {/* Direct URL button */}
                          <a
                            href={item.directUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer"
                            title="فتح الرابط المباشر للمصدر في نافذة خارجية"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>الرابط المباشر للمصدر</span>
                          </a>

                          <div className="flex items-center gap-1.5">
                            
                            {/* Save to personal library toggle */}
                            <button
                              type="button"
                              onClick={() => handleToggleSaveToLibrary(item.id)}
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer border ${
                                isSaved
                                  ? 'bg-amber-100 text-amber-900 border-amber-300 font-black'
                                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                              }`}
                              title={isSaved ? 'المصدر محفوظ في مكتبتك (انقر للإلغاء)' : 'حفظ المصدر في مكتبتي الشخصية'}
                            >
                              {isSaved ? (
                                <>
                                  <BookmarkCheck className="w-3.5 h-3.5 text-amber-600" />
                                  <span>محفوظ في مكتبتي ✓</span>
                                </>
                              ) : (
                                <>
                                  <Bookmark className="w-3.5 h-3.5 text-slate-500" />
                                  <span>حفظ في مكتبتي</span>
                                </>
                              )}
                            </button>

                            {/* Add to current plan dropdown/action */}
                            {onApplyOerResourceToPlan && (
                              <div className="relative inline-block">
                                <button
                                  type="button"
                                  onClick={() => onApplyOerResourceToPlan(item, 'as_primary')}
                                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black flex items-center gap-1 transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-97"
                                  title="إدراج هذا المصدر فوراً في خطة الدرس المفتوحة حالياً"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>إضافة إلى خطتي</span>
                                </button>
                              </div>
                            )}

                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: Teacher's Personal OER Library & Custom Groups */}
        {/* ========================================================================= */}
        {activeTab === 'personal_library' && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-50">
            
            {/* Sidebar: Custom Groups / Folders */}
            <div className="w-full md:w-72 bg-white border-b md:border-b-0 md:border-l border-slate-200 flex flex-col shrink-0">
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-black text-xs text-slate-800">
                  <Folder className="w-4 h-4 text-emerald-700" />
                  <span>مجموعاتي وتصنيفاتي ({toArabicDigits(libraryData.groups.length)})</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreatingGroup(!isCreatingGroup)}
                  className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>مجموعة جديدة</span>
                </button>
              </div>

              {/* Create Group Form */}
              {isCreatingGroup && (
                <form onSubmit={handleCreateGroup} className="p-3 bg-emerald-50/60 border-b border-emerald-200">
                  <h4 className="text-[11px] font-black text-emerald-950 mb-1.5">إنشاء مجموعة مصادر خاصة:</h4>
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="اسم المجموعة (مثلاً: رياضيات الوحدة 1)"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 mb-2 outline-hidden focus:border-emerald-600"
                    required
                  />
                  <input
                    type="text"
                    value={newGroupDesc}
                    onChange={(e) => setNewGroupDesc(e.target.value)}
                    placeholder="وصف مختصر لمحتوى المجموعة (اختياري)"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 mb-2 outline-hidden focus:border-emerald-600"
                  />
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsCreatingGroup(false)}
                      className="px-2.5 py-1 text-slate-600 hover:text-slate-800 text-[11px] font-bold cursor-pointer"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                    >
                      حفظ المجموعة
                    </button>
                  </div>
                </form>
              )}

              {/* Group list */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                <button
                  type="button"
                  onClick={() => setSelectedGroupFilter('all')}
                  className={`w-full text-right p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                    selectedGroupFilter === 'all'
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 shrink-0" />
                    <span>كافة المصادر المحفوظة</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedGroupFilter === 'all' ? 'bg-emerald-900 text-emerald-100' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {toArabicDigits(savedOerItems.length)}
                  </span>
                </button>

                {libraryData.groups.map((group) => {
                  const isSelected = selectedGroupFilter === group.id;
                  return (
                    <div
                      key={group.id}
                      className={`p-2.5 rounded-xl text-xs transition-all flex flex-col gap-1 border ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold shadow-2xs'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div
                        onClick={() => setSelectedGroupFilter(group.id)}
                        className="flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Folder className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-black truncate max-w-[150px]">{group.name}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {toArabicDigits(group.resourceIds.length)}
                        </span>
                      </div>

                      {group.description && (
                        <p className="text-[10px] text-slate-500 line-clamp-1">{group.description}</p>
                      )}

                      {/* Group Share & Export Bar */}
                      <div className="pt-1.5 mt-1 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleCopyGroupWhatsAppShare(group)}
                            className="p-1 rounded-md hover:bg-emerald-100 text-emerald-800 transition-all cursor-pointer"
                            title="مشاركة المجموعة كبطاقة واتساب منسقة للمعلمين"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setShowQrModalForGroup(group)}
                            className="p-1 rounded-md hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                            title="عرض رمز QR لمسح المجموعة بالهاتف"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleExportGroupJson(group)}
                            className="p-1 rounded-md hover:bg-blue-100 text-blue-700 transition-all cursor-pointer"
                            title="تصدير المجموعة كملف JSON لتبادلها مع الزملاء"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteGroup(group.id)}
                          className="p-1 rounded-md hover:bg-rose-100 text-rose-600 transition-all cursor-pointer"
                          title="حذف المجموعة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

            {/* Main Area: Resources in this Collection */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-3.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
                <div>
                  <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                    <BookmarkCheck className="w-4 h-4 text-emerald-600" />
                    <span>
                      {selectedGroupFilter === 'all'
                        ? 'كافة مصادري المفضلة'
                        : `مجموعة: ${libraryData.groups.find((g) => g.id === selectedGroupFilter)?.name}`}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold">
                      {toArabicDigits(displayPersonalLibraryItems.length)} مصادر
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    يمكنك مشاركة مجموعتك، تصديرها، أو إدراج أي مصدر مباشرة في خطة درسك.
                  </p>
                </div>

                {selectedGroupFilter !== 'all' && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const grp = libraryData.groups.find((g) => g.id === selectedGroupFilter);
                        if (grp) handleCopyGroupWhatsAppShare(grp);
                      }}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>مشاركة المجموعة مع الزملاء</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Items in Library */}
              <div className="flex-1 overflow-y-auto p-4">
                {displayPersonalLibraryItems.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center max-w-md mx-auto my-12">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                      <Bookmark className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1">لا توجد مصادر محفوظة في هذه المجموعة بعد</h4>
                    <p className="text-xs text-slate-500 mb-4">
                      استكشف المصادر المعتمدة من تبويب «المستكشف الذكي» واضغط «حفظ في مكتبتي» لجمعها هنا.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('browser')}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      الانتقال إلى المستكشف الذكي
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {displayPersonalLibraryItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 p-3.5 shadow-2xs flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-2">
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                              {item.officialBadge.text}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500">{item.subject} • {item.grade}</span>
                          </div>

                          <h4 className="font-black text-slate-900 text-xs sm:text-sm leading-snug mb-1">
                            {item.title}
                          </h4>

                          <p className="text-[11px] text-emerald-800 font-bold mb-2">
                            {item.publisherNameAr}
                          </p>

                          <p className="text-[11px] text-slate-600 line-clamp-2 mb-2">
                            {item.description}
                          </p>
                        </div>

                        <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                          <a
                            href={item.directUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>فتح المصدر</span>
                          </a>

                          <div className="flex items-center gap-1.5">
                            {/* Group selector popup trigger */}
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() =>
                                  setActiveGroupSelectorResourceId(
                                    activeGroupSelectorResourceId === item.id ? null : item.id
                                  )
                                }
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                                title="إضافة المصدر إلى إحدى مجموعاتي"
                              >
                                <FolderPlus className="w-3 h-3 text-emerald-700" />
                                <span>تصنيف في مجموعة</span>
                              </button>

                              {activeGroupSelectorResourceId === item.id && (
                                <div className="absolute left-0 bottom-full mb-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-20 text-right animate-in fade-in duration-150">
                                  <div className="text-[10px] font-black text-slate-500 mb-1.5 pb-1 border-b border-slate-100">
                                    اختر المجموعة للإضافة:
                                  </div>
                                  <div className="space-y-1 max-h-36 overflow-y-auto">
                                    {libraryData.groups.map((grp) => {
                                      const inGroup = grp.resourceIds.includes(item.id);
                                      return (
                                        <button
                                          key={grp.id}
                                          type="button"
                                          onClick={() => {
                                            if (inGroup) {
                                              handleRemoveFromGroup(item.id, grp.id);
                                            } else {
                                              handleAddResourceToGroup(item.id, grp.id);
                                            }
                                          }}
                                          className={`w-full text-right px-2 py-1 rounded-md text-[11px] font-bold flex items-center justify-between transition-all cursor-pointer ${
                                            inGroup
                                              ? 'bg-emerald-50 text-emerald-800'
                                              : 'hover:bg-slate-100 text-slate-700'
                                          }`}
                                        >
                                          <span className="truncate">{grp.name}</span>
                                          {inGroup && <Check className="w-3 h-3 text-emerald-600 shrink-0" />}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Add to plan */}
                            {onApplyOerResourceToPlan && (
                              <button
                                type="button"
                                onClick={() => onApplyOerResourceToPlan(item, 'as_primary')}
                                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-black flex items-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                                <span>للخطة</span>
                              </button>
                            )}

                            {/* Remove from library */}
                            <button
                              type="button"
                              onClick={() => handleToggleSaveToLibrary(item.id)}
                              className="p-1 rounded-lg hover:bg-rose-50 text-rose-500 hover:text-rose-700 cursor-pointer"
                              title="إزالة من المكتبة"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: Suggest Resource & Pedagogical Review Workflow */}
        {/* ========================================================================= */}
        {activeTab === 'suggest_resource' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* Submission Form Card */}
              <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm sm:text-base">
                      اقتراح مصدر تعليمي مفتوح للمراجعة والاعتماد التربوي
                    </h3>
                    <p className="text-xs text-slate-500">
                      ساهم في إثراء بنك المناهج الفلسطيني المعتمد عبر تقديم روابط وأدوات مفتوحة تخضع للتدقيق من قبل اللجنة التربوية.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmitSuggestion} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    
                    {/* Title */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-black text-slate-700 mb-1">
                        عنوان المصدر المقترح <span className="text-rose-600">*</span>:
                      </label>
                      <input
                        type="text"
                        value={suggestTitle}
                        onChange={(e) => setSuggestTitle(e.target.value)}
                        placeholder="مثال: محاكاة تفاعلية لحركة الصفائح الأرضية والزلازل في فلسطين"
                        className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-hidden"
                        required
                      />
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1">المادة الدراسية:</label>
                      <select
                        value={suggestSubject}
                        onChange={(e) => setSuggestSubject(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-hidden"
                      >
                        {getAvailableOerSubjects().map((subj) => (
                          <option key={subj} value={subj}>{subj}</option>
                        ))}
                      </select>
                    </div>

                    {/* Grade */}
                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1">الصف الدراسي المستهدف:</label>
                      <select
                        value={suggestGrade}
                        onChange={(e) => setSuggestGrade(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-hidden"
                      >
                        {getAvailableOerGrades().map((gr) => (
                          <option key={gr} value={gr}>{gr}</option>
                        ))}
                      </select>
                    </div>

                    {/* Topic */}
                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1">الموضوع أو المفهوم في المنهاج:</label>
                      <input
                        type="text"
                        value={suggestTopic}
                        onChange={(e) => setSuggestTopic(e.target.value)}
                        placeholder="اسم الدرس أو الوحدة المقررة"
                        className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 rounded-xl px-3 py-2 text-xs text-slate-800 outline-hidden"
                      />
                    </div>

                    {/* Type */}
                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1">نوع المصدر:</label>
                      <select
                        value={suggestType}
                        onChange={(e) => setSuggestType(e.target.value as PalestinianOerType)}
                        className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-hidden"
                      >
                        <option value="interactive_activity">برمجية ومحاكاة تفاعلية</option>
                        <option value="video">فيديو مرئي وشرح تفاعلي</option>
                        <option value="worksheet">بطاقة تعلم ذاتي / ورقة عمل</option>
                        <option value="visual_card">بطاقات محسوسة وصور</option>
                        <option value="audio_story">تسجيل صوتي وقصة</option>
                        <option value="portal_link">رابط منصة / موقع تعليمي</option>
                        <option value="book">كتاب / وثيقة مساندة</option>
                      </select>
                    </div>

                    {/* Direct URL */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-black text-slate-700 mb-1">
                        الرابط المباشر للمصدر (URL) <span className="text-rose-600">*</span>:
                      </label>
                      <input
                        type="url"
                        value={suggestUrl}
                        onChange={(e) => setSuggestUrl(e.target.value)}
                        placeholder="https://example.com/palestine-oer-resource"
                        className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-hidden text-left ltr"
                        required
                      />
                    </div>

                    {/* License */}
                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1">نوع الترخيص / الملكية الفكرية:</label>
                      <select
                        value={suggestLicense}
                        onChange={(e) => setSuggestLicense(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-hidden"
                      >
                        <option value="Creative Commons CC-BY-NC-SA 4.0 (مشاع إبداعي)">Creative Commons CC-BY-NC-SA 4.0 (مشاع إبداعي)</option>
                        <option value="ترخيص وزارة التربية والتعليم العالي الفلسطينية">ترخيص وزارة التربية والتعليم العالي الفلسطينية</option>
                        <option value="ملكية عامة مفتوحة للتعليم (Public Domain)">ملكية عامة مفتوحة للتعليم (Public Domain)</option>
                        <option value="إنتاج ذاتي حر من إعداد المعلم">إنتاج ذاتي حر من إعداد المعلم</option>
                      </select>
                    </div>

                    {/* Teacher Info */}
                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1">اسم المعلم / مقدم الاقتراح:</label>
                      <input
                        type="text"
                        value={suggestTeacherName}
                        onChange={(e) => setSuggestTeacherName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-hidden"
                      />
                    </div>

                    {/* School & Directorate */}
                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1">المدرسة:</label>
                      <input
                        type="text"
                        value={suggestSchool}
                        onChange={(e) => setSuggestSchool(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 rounded-xl px-3 py-2 text-xs text-slate-800 outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1">المديرية:</label>
                      <input
                        type="text"
                        value={suggestDirectorate}
                        onChange={(e) => setSuggestDirectorate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 rounded-xl px-3 py-2 text-xs text-slate-800 outline-hidden"
                      />
                    </div>

                    {/* Pedagogical Justification */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-black text-slate-700 mb-1">
                        مبررات الاختيار والقيمة التربوية المضافة للمنهاج:
                      </label>
                      <textarea
                        value={suggestJustification}
                        onChange={(e) => setSuggestJustification(e.target.value)}
                        rows={3}
                        placeholder="اشرح كيف يخدم هذا المصدر الكفايات المستهدفة ويساند الطلبة..."
                        className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 rounded-xl p-3 text-xs text-slate-800 outline-hidden"
                      />
                    </div>

                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-linear-to-r from-emerald-800 via-teal-800 to-slate-900 hover:from-emerald-900 hover:to-slate-950 text-white rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all active:scale-97"
                    >
                      <Send className="w-4 h-4 text-amber-300" />
                      <span>إرسال الاقتراح إلى لجنة المراجعة والاعتماد التربوي</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Submissions Tracking & Pedagogical Review Simulation */}
              <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs">
                <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
                    <FileCheck2 className="w-4 h-4 text-emerald-700" />
                    <span>سجل متابعة المصادر المقترحة وقرارات اللجنة التربوية</span>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold">
                    {toArabicDigits(libraryData.suggestedResources.length)} طلبات
                  </span>
                </div>

                {libraryData.suggestedResources.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">
                    لم تقم بتقديم أي مقترحات مصادر حتى الآن. المقترحات تمنحك شارات إيداع تربوية وتتاح للزملاء فور اعتمادها.
                  </p>
                ) : (
                  <div className="space-y-3.5">
                    {libraryData.suggestedResources.map((sug) => {
                      const isApproved = sug.reviewStatus === 'approved_endorsed';
                      const isPending = sug.reviewStatus === 'pending_review';

                      return (
                        <div
                          key={sug.id}
                          className={`rounded-2xl border p-4 transition-all ${
                            isApproved
                              ? 'bg-emerald-50/50 border-emerald-300'
                              : isPending
                              ? 'bg-amber-50/40 border-amber-300'
                              : 'bg-rose-50/40 border-rose-300'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                                  isApproved
                                    ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                                    : isPending
                                    ? 'bg-amber-100 text-amber-950 border-amber-300'
                                    : 'bg-rose-100 text-rose-950 border-rose-300'
                                }`}
                              >
                                {isApproved
                                  ? '✅ معتمد ومجاز في بنك المصادر الوطنية'
                                  : isPending
                                  ? '⏳ قيد المراجعة والتدقيق التربوي'
                                  : '⚠️ مطلوب استكمال بيانات'}
                              </span>

                              <span className="text-[10px] font-mono text-slate-500 font-bold">
                                {sug.referenceNumber}
                              </span>
                            </div>

                            <span className="text-[10px] text-slate-500 font-bold">
                              تاريخ التقديم: {sug.submissionDate}
                            </span>
                          </div>

                          <h4 className="font-black text-slate-900 text-sm mb-1">{sug.title}</h4>

                          <p className="text-xs text-slate-600 mb-2">
                            {sug.subject} • {sug.grade} • {sug.topic} • مقدم من: {sug.teacherName} ({sug.school})
                          </p>

                          {sug.pedagogicalJustification && (
                            <p className="text-[11px] text-slate-500 italic mb-2">
                              «{sug.pedagogicalJustification}»
                            </p>
                          )}

                          {sug.committeeDecisionNote && (
                            <div className="bg-white/80 border border-emerald-200 rounded-xl p-2.5 mb-2.5 text-xs text-emerald-950">
                              <span className="font-black">قرار اللجنة التربوية: </span>
                              <span>{sug.committeeDecisionNote}</span>
                              {sug.reviewedByCommitteeAt && (
                                <span className="text-[10px] text-emerald-800 mr-2">
                                  ({sug.reviewedByCommitteeAt})
                                </span>
                              )}
                            </div>
                          )}

                          {/* Committee Actions Simulator */}
                          <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2">
                            <a
                              href={sug.directUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>فحص رابط المصدر المباشر</span>
                            </a>

                            <div className="flex items-center gap-1.5">
                              {/* Committee simulation button */}
                              {isPending && (
                                <button
                                  type="button"
                                  onClick={() => handleSimulateCommitteeDecision(sug.id, 'approved_endorsed')}
                                  className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-black flex items-center gap-1 cursor-pointer shadow-2xs"
                                  title="محاكاة قرار اللجنة التربوية: اعتماد فوري ومصادقة"
                                >
                                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                                  <span>محاكاة: اعتماد ومصادقة اللجنة ✓</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  setLibraryData((prev) => ({
                                    ...prev,
                                    suggestedResources: prev.suggestedResources.filter((r) => r.id !== sug.id),
                                  }));
                                }}
                                className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                                title="حذف الطلب"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}

              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: My Custom Added OER Links */}
        {/* ========================================================================= */}
        {activeTab === 'custom_added' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-emerald-700" />
                    <span>قائمة «مصادري المضافة» بروابط مباشرة</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    جميع المصادر المفتوحة التي أضفتها يدوياً مع روابطها وملاحظاتها؛ يمكنك تعديلها، حذفها، مشاركتها أو تصديرها.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportCustomLinksJson}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-700" />
                    <span>تصدير المصادر (JSON)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCustomLinkId(null);
                      setCustomLinkTitle('');
                      setCustomLinkUrl('');
                      setCustomLinkType('موقع تعليمي');
                      setCustomLinkNote('');
                      setIsCustomLinkModalOpen(true);
                    }}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>➕ إضافة مصدر مفتوح برابط</span>
                  </button>
                </div>
              </div>

              {!libraryData.customAddedResources || libraryData.customAddedResources.length === 0 ? (
                <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-10 text-center max-w-lg mx-auto my-8">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                    <LinkIcon className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1">لا توجد مصادر مضافة بروابط خاصة بعد</h4>
                  <p className="text-xs text-slate-500 mb-4">
                    انقر على زر «➕ إضافة مصدر مفتوح برابط» في الأعلى لإضافة أول رابط تعليمي لمصادرك الخاصة.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCustomLinkId(null);
                      setCustomLinkTitle('');
                      setCustomLinkUrl('');
                      setCustomLinkType('موقع تعليمي');
                      setCustomLinkNote('');
                      setIsCustomLinkModalOpen(true);
                    }}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    ➕ إضافة مصدر مفتوح برابط الآن
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {libraryData.customAddedResources.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 p-4 shadow-2xs flex flex-col justify-between transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-black border border-emerald-300">
                            {item.type}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 font-bold">
                            {item.createdAt}
                          </span>
                        </div>

                        <h4 className="font-black text-slate-900 text-sm mb-1.5">{item.title}</h4>

                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-mono font-bold text-emerald-700 hover:underline flex items-center gap-1.5 mb-2.5 break-all bg-emerald-50/60 p-2 rounded-xl border border-emerald-100"
                        >
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{item.url}</span>
                        </a>

                        {item.note && (
                          <p className="text-xs text-slate-600 mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <span className="font-bold text-slate-800">ملاحظة الموضوع: </span>
                            {item.note}
                          </p>
                        )}
                      </div>

                      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleShareCustomLinkWhatsApp(item)}
                          className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>مشاركة واتساب</span>
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleEditCustomLink(item)}
                            className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg cursor-pointer"
                            title="تعديل المصدر"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomLink(item.id)}
                            className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg cursor-pointer"
                            title="حذف المصدر"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* Modal: Add or Edit Custom OER Link */}
        {/* ========================================================================= */}
        {isCustomLinkModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm sm:text-base">
                      {editingCustomLinkId ? 'تعديل المصدر المفتوح' : 'إضافة مصدر مفتوح برابط'}
                    </h3>
                    <p className="text-[11px] text-slate-500">أدخل بيانات المصدر والرابط المباشر للوصول السريع</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCustomLinkModalOpen(false)}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveCustomLinkModal} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    اسم المصدر <span className="text-rose-600">*</span>:
                  </label>
                  <input
                    type="text"
                    value={customLinkTitle}
                    onChange={(e) => setCustomLinkTitle(e.target.value)}
                    placeholder="مثال: موقع الأنشطة الرياضية التفاعلية فلسطين"
                    className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    الرابط (الموقع) <span className="text-rose-600">*</span>:
                  </label>
                  <input
                    type="url"
                    value={customLinkUrl}
                    onChange={(e) => setCustomLinkUrl(e.target.value)}
                    placeholder="أدخل رابط الموقع هنا (https://...)"
                    className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">النوع:</label>
                  <select
                    value={customLinkType}
                    onChange={(e) => setCustomLinkType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-hidden"
                  >
                    <option value="موقع تعليمي">موقع تعليمي</option>
                    <option value="فيديو">فيديو</option>
                    <option value="ملف">ملف (PDF / Doc)</option>
                    <option value="نشاط">نشاط تفاعلي</option>
                    <option value="آخر">آخر</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">ملاحظة قصيرة:</label>
                  <textarea
                    value={customLinkNote}
                    onChange={(e) => setCustomLinkNote(e.target.value)}
                    rows={2}
                    placeholder="ما موضوع هذا المصدر وكيف يخدم الدرس؟"
                    className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 rounded-xl p-3 text-xs text-slate-800 outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCustomLinkModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1"
                  >
                    <span>⬅️ إلغاء</span>
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    <span>✅ حفظ وإضافة</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showQrModalForGroup && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="font-black text-slate-900 text-base mb-1">
                رمز مشاركة المجموعة
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                «{showQrModalForGroup.name}»
              </p>

              {/* Simulated QR Visual */}
              <div className="bg-slate-50 border-2 border-dashed border-emerald-300 rounded-2xl p-4 flex flex-col items-center justify-center mb-4">
                <div className="w-40 h-40 bg-white p-2 rounded-xl shadow-inner flex items-center justify-center border border-slate-200">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                      `https://kabeer-expert.ai.studio/oer-group/${showQrModalForGroup.shareCode || 'palestine'}`
                    )}`}
                    alt="QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-[11px] font-mono font-bold text-slate-700 mt-2">
                  رمز المشاركة: {showQrModalForGroup.shareCode || 'OER-PAL-2026'}
                </span>
              </div>

              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyGroupWhatsAppShare(showQrModalForGroup)}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ بطاقة الواتساب</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowQrModalForGroup(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
