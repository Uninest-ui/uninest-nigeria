import React, { useState } from 'react';
import { 
  HelpCircle, 
  Search, 
  Plus, 
  Image as ImageIcon, 
  Send, 
  Clock, 
  Building2, 
  GraduationCap, 
  ThumbsUp, 
  MessageSquare, 
  CheckCircle2, 
  ExternalLink, 
  X, 
  Upload, 
  Sparkles, 
  Filter,
  Check,
  ChevronDown,
  ChevronUp,
  Share2,
  BookOpen,
  Camera,
  Gift,
  MessageCircle,
  Heart,
  UserCheck,
  ShieldCheck,
  Trash2,
  ShieldAlert,
  AlertTriangle
} from 'lucide-react';
import { StudentQuestion, QuestionAnswer, QuestionDiscussionComment, UniNestUser } from '../types';
import { NIGERIA_CAMPUS_REGIONS, getUniversitiesByState } from '../data/nigeriaUniversities';

interface InterUniversityQAHubProps {
  questions: StudentQuestion[];
  onAddQuestion: (q: Omit<StudentQuestion, 'id' | 'createdAt' | 'status' | 'answers'>) => void;
  onAddAnswer: (questionId: string, answer: Omit<QuestionAnswer, 'id' | 'createdAt' | 'upvotes'>) => void;
  onUpvoteAnswer: (questionId: string, answerId: string) => void;
  currentUser: UniNestUser;
}

export const InterUniversityQAHub: React.FC<InterUniversityQAHubProps> = ({
  questions,
  onAddQuestion,
  onAddAnswer,
  onUpvoteAnswer,
  currentUser
}) => {
  const safeUser = currentUser || {
    email: 'student@uninest.ng',
    name: 'Student',
    university: 'Niger Delta University (NDU)',
    department: 'Undergraduate',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');
  const [formatFilter, setFormatFilter] = useState<'all' | 'with_picture' | 'text_only'>('all');
  const [showAskModal, setShowAskModal] = useState(false);
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // New Question Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCategory, setNewCategory] = useState<StudentQuestion['subjectCategory']>('Mathematics & Engineering');
  const [newUrgency, setNewUrgency] = useState<StudentQuestion['urgency']>('Immediate (Within 1 hour)');
  const [newTargetUni, setNewTargetUni] = useState('All Nigerian Universities');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newPictureUrl, setNewPictureUrl] = useState('');
  const [newBountyTip, setNewBountyTip] = useState<number>(500);

  // Answer Form State for currently active question
  const [answeringQuestionId, setAnsweringQuestionId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [answerPictureUrl, setAnswerPictureUrl] = useState('');
  const [contactingStudent, setContactingStudent] = useState<{ name: string; phone?: string; uni: string; role?: string; topic?: string } | null>(null);

  // Content Moderation Filters: Strict rule to delete every nude picture or any link in Q&A and comment section
  const URL_LINK_REGEX = /(https?:\/\/|ftp:\/\/|www\.[^\s]+|[a-zA-Z0-9-]+\.(com|ng|edu|org|net|io|me|app|link|site|xyz|info|biz|top|club|co|uk|us|gov|tv|online|store)(\/[^\s]*)?|wa\.me|t\.me)/i;
  const NUDE_EXPLICIT_REGEX = /\b(nude|naked|nudity|porn|xxx|nsfw|sex|boobs|penis|vagina|erotic|adult|onlyfans|stripper|bikini|topless|lingerie|blowjob|masturbat|explicit)\b/i;

  const validateAcademicContent = (content: string): { valid: boolean; error?: string } => {
    if (!content) return { valid: true };
    if (URL_LINK_REGEX.test(content)) {
      return {
        valid: false,
        error: 'Links and URLs are strictly prohibited in the Q&A comment and discussion section. All links are automatically deleted.'
      };
    }
    if (NUDE_EXPLICIT_REGEX.test(content)) {
      return {
        valid: false,
        error: 'Inappropriate or nude references/pictures are strictly forbidden in UniNest academic discussions.'
      };
    }
    return { valid: true };
  };

  const sanitizeComments = (list: QuestionDiscussionComment[]): QuestionDiscussionComment[] => {
    return (list || []).filter(c => {
      const hasLink = URL_LINK_REGEX.test(c.text);
      const hasNude = NUDE_EXPLICIT_REGEX.test(c.text);
      return !hasLink && !hasNude;
    });
  };

  const [moderationNotice, setModerationNotice] = useState<string | null>(null);

  // Discussion state per question (Strictly sanitized to remove any links or nude pictures)
  const [commentsByQuestion, setCommentsByQuestion] = useState<Record<string, QuestionDiscussionComment[]>>(() => {
    try {
      const saved = localStorage.getItem('uninest_qa_comments');
      if (saved) {
        const parsed = JSON.parse(saved);
        const cleaned: Record<string, QuestionDiscussionComment[]> = {};
        for (const [qid, comms] of Object.entries(parsed)) {
          cleaned[qid] = sanitizeComments(comms as QuestionDiscussionComment[]);
        }
        return cleaned;
      }
    } catch (e) {
      console.error(e);
    }
    return {
      'q-001': [
        {
          id: 'comm-1',
          questionId: 'q-001',
          authorEmail: 'preye.eng@ndu.edu.ng',
          authorName: 'Preye Alabo',
          authorUniversity: 'Niger Delta University (NDU)',
          text: 'Notice that in step 3, the integration by parts rule requires u = x and dv = e^(2x) dx. Do not confuse the coefficients!',
          createdAt: '2 hours ago'
        },
        {
          id: 'comm-2',
          questionId: 'q-001',
          authorEmail: 'kemi.math@bmu.edu.ng',
          authorName: 'Kemi Sanni',
          authorUniversity: 'Bayelsa Medical University (BMU)',
          text: 'This exact question appeared in our 2024 first semester GST exam at BMU. The answer given in Solution 1 is 100% correct.',
          createdAt: '1 hour ago'
        }
      ]
    };
  });

  const [newCommentInput, setNewCommentInput] = useState<Record<string, string>>({});

  // Gifting Good Reply State (UniNest 2% automatic fee)
  const [giftingTarget, setGiftingTarget] = useState<{
    id: string;
    questionId: string;
    type: 'answer' | 'comment';
    recipientName: string;
    recipientEmail: string;
    recipientUniversity: string;
    snippet: string;
  } | null>(null);

  const [giftAmount, setGiftAmount] = useState<string>('1000');
  const [giftOccasion, setGiftOccasion] = useState<string>('Accurate Solution & Handout Support 📚');
  const [giftSuccessMsg, setGiftSuccessMsg] = useState<string | null>(null);
  const [replyGifts, setReplyGifts] = useState<Record<string, {
    amount: number;
    fee: number;
    netAmount: number;
    senderName: string;
    date: string;
  }>>(() => {
    try {
      const saved = localStorage.getItem('uninest_qa_reply_gifts');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      'ans-01': {
        amount: 1000,
        fee: 20, // 2%
        netAmount: 980,
        senderName: 'Tariere Ebimobowei',
        date: 'Today'
      }
    };
  });

  const handleAddComment = (questionId: string) => {
    const text = (newCommentInput[questionId] || '').trim();
    if (!text) return;

    // Content Moderation check against links and nude pictures/content
    const check = validateAcademicContent(text);
    if (!check.valid) {
      setModerationNotice(check.error || 'Links and inappropriate content are strictly forbidden in discussion.');
      setTimeout(() => setModerationNotice(null), 6000);
      return;
    }

    const newComm: QuestionDiscussionComment = {
      id: `comm-${Date.now()}`,
      questionId,
      authorEmail: safeUser.email,
      authorName: safeUser.name || 'Student Scholar',
      authorUniversity: safeUser.university || 'Campus',
      authorAvatar: safeUser.avatarUrl,
      text,
      createdAt: 'Just now'
    };

    const updated = {
      ...commentsByQuestion,
      [questionId]: [...(commentsByQuestion[questionId] || []), newComm]
    };
    setCommentsByQuestion(updated);
    localStorage.setItem('uninest_qa_comments', JSON.stringify(updated));
    setNewCommentInput(prev => ({ ...prev, [questionId]: '' }));
    setModerationNotice('Comment published to campus discussion.');
    setTimeout(() => setModerationNotice(null), 3000);
  };

  // Direct Comment Deletion (Delete any unwanted comment or flagged remark)
  const handleDeleteComment = (questionId: string, commentId: string) => {
    const remaining = (commentsByQuestion[questionId] || []).filter(c => c.id !== commentId);
    const updated = {
      ...commentsByQuestion,
      [questionId]: remaining
    };
    setCommentsByQuestion(updated);
    localStorage.setItem('uninest_qa_comments', JSON.stringify(updated));
    setModerationNotice('Comment deleted from discussion.');
    setTimeout(() => setModerationNotice(null), 4000);
  };

  const handleSendReplyGift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftingTarget) return;

    const grossAmount = Number(giftAmount);
    if (grossAmount < 100) {
      alert('Minimum gift amount is ₦100');
      return;
    }

    const uninestFee = Math.round(grossAmount * 0.02); // 2% charge
    const netReceived = grossAmount - uninestFee;

    const newGift = {
      amount: grossAmount,
      fee: uninestFee,
      netAmount: netReceived,
      senderName: safeUser.name || 'Student Peer',
      date: 'Just now'
    };

    const updated = {
      ...replyGifts,
      [giftingTarget.id]: newGift
    };
    setReplyGifts(updated);
    localStorage.setItem('uninest_qa_reply_gifts', JSON.stringify(updated));

    setGiftSuccessMsg(
      `🎉 Gift of ₦${grossAmount.toLocaleString()} sent to ${giftingTarget.recipientName}! UniNest automatically charged 2% (₦${uninestFee.toLocaleString()}). Recipient gets ₦${netReceived.toLocaleString()} credited to their STS savings.`
    );
    setGiftingTarget(null);
    setTimeout(() => setGiftSuccessMsg(null), 8000);
  };

  // Sample presets for question photos
  const SAMPLE_PICTURES = [
    { label: 'Calculus / Math Proof', url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80' },
    { label: 'Physics Circuit / Diagram', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80' },
    { label: 'Handwritten Assignment Sheet', url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=80' },
    { label: 'Chemistry Organic Equation', url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isAnswer: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          if (isAnswer) {
            setAnswerPictureUrl(reader.result);
          } else {
            setNewPictureUrl(reader.result);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newQuestionText.trim()) return;

    // Content moderation against links and nude/inappropriate content
    const titleCheck = validateAcademicContent(newTitle);
    if (!titleCheck.valid) {
      setModerationNotice(titleCheck.error || 'Links are strictly forbidden.');
      setTimeout(() => setModerationNotice(null), 6000);
      return;
    }

    const bodyCheck = validateAcademicContent(newQuestionText);
    if (!bodyCheck.valid) {
      setModerationNotice(bodyCheck.error || 'Inappropriate content or links are forbidden.');
      setTimeout(() => setModerationNotice(null), 6000);
      return;
    }

    if (newPictureUrl) {
      const picCheck = validateAcademicContent(newPictureUrl);
      if (!picCheck.valid) {
        setModerationNotice('Prohibited picture URL: Links and adult/nude content are not permitted.');
        setTimeout(() => setModerationNotice(null), 6000);
        return;
      }
    }

    onAddQuestion({
      authorEmail: safeUser.email,
      authorName: safeUser.name || safeUser.email.split('@')[0],
      authorUniversity: safeUser.university || 'Niger Delta University (NDU)',
      authorDepartment: safeUser.department || 'Undergraduate',
      authorAvatar: safeUser.avatarUrl,
      title: newTitle.trim(),
      questionText: newQuestionText.trim(),
      questionPictureUrl: newPictureUrl || undefined,
      courseCode: newCourseCode.trim().toUpperCase() || 'GEN 101',
      subjectCategory: newCategory,
      urgency: newUrgency,
      targetUniversity: newTargetUni,
      bountyTip: newBountyTip > 0 ? newBountyTip : undefined,
    });

    // Reset Form
    setNewTitle('');
    setNewCourseCode('');
    setNewQuestionText('');
    setNewPictureUrl('');
    setShowAskModal(false);
    setModerationNotice('Question posted successfully to the Inter-University Q&A Hub.');
    setTimeout(() => setModerationNotice(null), 4000);
  };

  const handleAnswerSubmit = (questionId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!answerText.trim()) return;

    // Content moderation against links and nude content
    const ansCheck = validateAcademicContent(answerText);
    if (!ansCheck.valid) {
      setModerationNotice(ansCheck.error || 'Links and inappropriate content are prohibited.');
      setTimeout(() => setModerationNotice(null), 6000);
      return;
    }

    if (answerPictureUrl) {
      const picCheck = validateAcademicContent(answerPictureUrl);
      if (!picCheck.valid) {
        setModerationNotice('Prohibited picture URL: Links and adult/nude content are not permitted.');
        setTimeout(() => setModerationNotice(null), 6000);
        return;
      }
    }

    onAddAnswer(questionId, {
      questionId,
      authorEmail: safeUser.email,
      authorName: safeUser.name || safeUser.email.split('@')[0],
      authorUniversity: safeUser.university || 'UniNest Scholar',
      authorDepartment: safeUser.department || 'Student',
      authorAvatar: safeUser.avatarUrl,
      answerText: answerText.trim(),
      solutionPictureUrl: answerPictureUrl || undefined,
    });

    setAnswerText('');
    setAnswerPictureUrl('');
    setAnsweringQuestionId(null);
    setExpandedQuestionId(questionId); // Expand to see new answer
    setModerationNotice('Solution submitted successfully.');
    setTimeout(() => setModerationNotice(null), 4000);
  };

  // Filter questions
  const filteredQuestions = questions.filter(q => {
    const matchSearch = 
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.authorUniversity.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCategory = selectedCategory === 'all' || q.subjectCategory === selectedCategory;
    const matchUrgency = selectedUrgency === 'all' || q.urgency === selectedUrgency;
    const matchFormat = 
      formatFilter === 'all' ? true :
      formatFilter === 'with_picture' ? Boolean(q.questionPictureUrl) :
      !q.questionPictureUrl;

    return matchSearch && matchCategory && matchUrgency && matchFormat;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0f172a] via-[#1e1b4b] to-[#0f172a] text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Cross-Campus Student Knowledge Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Inter-University Q&amp;A Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Stuck on a tricky assignment, calculus proof, law case, or past exam question? Upload in typed text or camera picture format and get step-by-step immediate answers from brilliant students in other Nigerian universities.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAskModal(true)}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs shadow-lg transition flex items-center gap-2 cursor-pointer shrink-0 hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Ask a Question (Text or Photo)</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Course Code (e.g. MTH 102), topic, or University..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Format Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => setFormatFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                formatFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Formats
            </button>
            <button
              type="button"
              onClick={() => setFormatFilter('with_picture')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                formatFilter === 'with_picture' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-indigo-500" />
              <span>With Picture</span>
            </button>
            <button
              type="button"
              onClick={() => setFormatFilter('text_only')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                formatFilter === 'text_only' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Typed Only
            </button>
          </div>
        </div>

        {/* Category & Urgency Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600 whitespace-nowrap">Subject Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-indigo-500"
            >
              <option value="all">All Subject Categories</option>
              <option value="Mathematics & Engineering">Mathematics &amp; Engineering</option>
              <option value="Medical & Health">Medical &amp; Health Sciences</option>
              <option value="Natural & Physical Sciences">Natural &amp; Physical Sciences</option>
              <option value="Law & Humanities">Law &amp; Humanities</option>
              <option value="Management & Social Sciences">Management &amp; Social Sciences</option>
              <option value="General Studies (GST)">General Studies (GST)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600 whitespace-nowrap">Urgency:</label>
            <select
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-indigo-500"
            >
              <option value="all">Any Urgency</option>
              <option value="Immediate (Within 1 hour)">⚡ Immediate (Within 1 hour)</option>
              <option value="Today">🕒 Needed Today</option>
              <option value="Standard (24-48 hrs)">📅 Standard (24-48 hrs)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Questions Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
            {filteredQuestions.length} Student Questions Available
          </span>
          <span className="text-xs text-slate-500">
            Answers provided by peers from universities nationwide
          </span>
        </div>

        {filteredQuestions.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-sm">No Questions Found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Be the first to upload a question or adjust your filters. Students across Nigeria are active and ready to help!
            </p>
            <button
              onClick={() => setShowAskModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition"
            >
              Ask a Question Now
            </button>
          </div>
        ) : (
          filteredQuestions.map((q) => {
            const isExpanded = expandedQuestionId === q.id;
            const isAnswering = answeringQuestionId === q.id;

            return (
              <div 
                key={q.id}
                className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition space-y-4"
              >
                {/* Header: Author & Badges */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-3">
                    <img 
                      src={q.authorAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(q.authorName)}`} 
                      alt={q.authorName}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 bg-slate-50"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-xs">{q.authorName}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700">
                          {q.courseCode}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <GraduationCap className="w-3 h-3 text-orange-500" />
                        <span className="truncate max-w-[200px] sm:max-w-xs">{q.authorUniversity}</span>
                        {q.authorDepartment && <span>• {q.authorDepartment}</span>}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Urgency Badge */}
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                      q.urgency.includes('Immediate') 
                        ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse' 
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      <Clock className="w-3 h-3" />
                      <span>{q.urgency}</span>
                    </span>

                    {/* Bounty Tip Badge */}
                    {Boolean(q.bountyTip) && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ₦{Number(q.bountyTip || 0).toLocaleString()} Reward
                      </span>
                    )}

                    {/* Target Uni */}
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Target: {q.targetUniversity}
                    </span>
                  </div>
                </div>

                {/* Question Title & Content */}
                <div className="space-y-2">
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug">
                    {q.title}
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                    {q.questionText}
                  </p>
                </div>

                {/* Picture Upload Format (Click to Zoom) */}
                {q.questionPictureUrl && q.questionPictureUrl.trim() !== '' && (
                  <div className="pt-2">
                    <div className="inline-block relative rounded-2xl overflow-hidden border border-slate-200 group">
                      <img 
                        src={q.questionPictureUrl} 
                        alt="Question snapshot" 
                        className="max-h-64 object-cover cursor-pointer group-hover:scale-102 transition"
                        onClick={() => setLightboxImage(q.questionPictureUrl || null)}
                      />
                      <div 
                        onClick={() => setLightboxImage(q.questionPictureUrl || null)}
                        className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-slate-950/70 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Camera className="w-3 h-3" />
                        <span>Click to View Full Photo</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer Controls & Stats */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                      <strong>{q.answers.length}</strong> answers
                    </span>
                    <span>•</span>
                    <span>Posted {q.createdAt}</span>
                    <span>•</span>
                    <span className="text-slate-400">{q.subjectCategory}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Connect with Question Author */}
                    <button
                      type="button"
                      onClick={() => {
                        setContactingStudent({ 
                          name: q.authorName, 
                          uni: q.authorUniversity,
                          role: 'Question Author',
                          topic: q.title
                        });
                      }}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
                    >
                      Connect with Student
                    </button>

                    <button
                      type="button"
                      onClick={() => setAnsweringQuestionId(isAnswering ? null : q.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Provide Answer</span>
                    </button>

                    {q.answers.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                      >
                        <span>{isExpanded ? 'Hide' : 'View'} Solutions ({q.answers.length})</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Inline Provide Answer Box */}
                {isAnswering && (
                  <form 
                    onSubmit={(e) => handleAnswerSubmit(q.id, e)} 
                    className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-3 animate-in fade-in"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-indigo-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Submit Your Verified Solution for {q.authorName}</span>
                      </h4>
                      <button
                        type="button"
                        onClick={() => setAnsweringQuestionId(null)}
                        className="text-gray-400 hover:text-gray-700 text-xs font-bold"
                      >
                        Cancel
                      </button>
                    </div>

                    <textarea
                      rows={3}
                      required
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                      placeholder="Type your detailed step-by-step solution, theorem proof, formula breakdown, or explanation..."
                      className="w-full p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-indigo-500"
                    />

                    {/* Optional Solution Picture Upload */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <label className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Attach Solution Photo (Calculations/Diagram)</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleFileUpload(e, true)}
                          />
                        </label>

                        {answerPictureUrl && (
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Photo attached
                          </span>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Post Solution</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Answers List */}
                {isExpanded && q.answers.length > 0 && (
                  <div className="pt-2 space-y-3">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Solutions from Peers ({q.answers.length})</span>
                    </h4>

                    {q.answers.map((ans) => (
                      <div 
                        key={ans.id}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img 
                              src={ans.authorAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(ans.authorName)}`} 
                              alt={ans.authorName}
                              className="w-7 h-7 rounded-full object-cover border border-slate-200 bg-white"
                            />
                            <div>
                              <span className="font-extrabold text-slate-900 text-xs">{ans.authorName}</span>
                              <p className="text-[10px] text-slate-500">
                                {ans.authorUniversity} • {ans.createdAt}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Connect with Student (Answer Author) */}
                            <button
                              type="button"
                              onClick={() => {
                                setContactingStudent({
                                  name: ans.authorName,
                                  uni: ans.authorUniversity,
                                  role: 'Answer Contributor',
                                  topic: q.title
                                });
                              }}
                              className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                              title="Connect with this student after reviewing safety warnings"
                            >
                              <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Connect with Student</span>
                            </button>

                            {/* Gift Good Reply Button (UniNest 2% charge) */}
                            <button
                              type="button"
                              onClick={() => setGiftingTarget({
                                id: ans.id,
                                questionId: q.id,
                                type: 'answer',
                                recipientName: ans.authorName,
                                recipientEmail: ans.authorEmail,
                                recipientUniversity: ans.authorUniversity,
                                snippet: ans.answerText.slice(0, 80)
                              })}
                              className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border border-purple-200 text-purple-700 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                              title="Send a cash gift for this good solution (UniNest 2% fee)"
                            >
                              <Gift className="w-3.5 h-3.5 text-pink-500" />
                              <span>Gift Reply</span>
                            </button>

                            {/* Upvote Button */}
                            <button
                              type="button"
                              onClick={() => onUpvoteAnswer(q.id, ans.id)}
                              className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-600 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                              <span>{ans.upvotes}</span>
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                          {ans.answerText}
                        </p>

                        {/* Gift received notification pill on solution */}
                        {replyGifts[ans.id] && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                            <Gift className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>
                              Gifted ₦{(replyGifts[ans.id]?.amount || 0).toLocaleString()} by {replyGifts[ans.id]?.senderName || 'Anonymous'} (UniNest 2% automated charge applied)
                            </span>
                          </div>
                        )}

                        {/* Answer Photo/Diagram if present */}
                        {ans.solutionPictureUrl && ans.solutionPictureUrl.trim() !== '' && (
                          <div className="pt-1">
                            <img 
                              src={ans.solutionPictureUrl} 
                              alt="Solution calculation" 
                              className="max-h-48 rounded-xl border border-slate-200 cursor-pointer object-cover"
                              onClick={() => setLightboxImage(ans.solutionPictureUrl || null)}
                            />
                            <span className="text-[10px] text-gray-400 italic">Click image to enlarge</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Discussion Thread under Question */}
                {isExpanded && (
                  <div className="pt-4 border-t border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <MessageCircle className="w-4 h-4 text-indigo-600" />
                        <span>Question Discussion &amp; Remarks ({(commentsByQuestion[q.id] || []).length})</span>
                      </h4>
                      <span className="text-[10px] text-slate-500">Students can discuss, offer hints, or gift helpful comments</span>
                    </div>

                    {/* Strict Content Moderation Banner */}
                    <div className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-between gap-2 text-[11px] text-amber-900">
                      <div className="flex items-center gap-1.5 font-bold">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span>Clean Campus Discussion Policy:</span>
                        <span className="font-normal text-amber-800">All links, URLs, and nude/inappropriate pictures are strictly prohibited and deleted.</span>
                      </div>
                    </div>

                    {moderationNotice && (
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-bold text-xs flex items-center gap-2 animate-fade-in">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{moderationNotice}</span>
                      </div>
                    )}

                    {/* Comments list */}
                    <div className="space-y-2">
                      {(commentsByQuestion[q.id] || []).map((comm) => (
                        <div key={comm.id} className="p-3 rounded-2xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-black text-[10px] flex items-center justify-center">
                                {comm.authorName[0]}
                              </div>
                              <span className="text-xs font-bold text-slate-900">{comm.authorName}</span>
                              <span className="text-[10px] text-slate-400">• {comm.authorUniversity} • {comm.createdAt}</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setContactingStudent({
                                    name: comm.authorName,
                                    uni: comm.authorUniversity,
                                    role: 'Discussion Contributor',
                                    topic: q.title
                                  });
                                }}
                                className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition"
                                title="Connect with this student after reviewing campus safety warnings"
                              >
                                <UserCheck className="w-3 h-3 text-indigo-600" />
                                <span>Connect</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setGiftingTarget({
                                  id: comm.id,
                                  questionId: q.id,
                                  type: 'comment',
                                  recipientName: comm.authorName,
                                  recipientEmail: comm.authorEmail,
                                  recipientUniversity: comm.authorUniversity,
                                  snippet: comm.text.slice(0, 80)
                                })}
                                className="px-2 py-0.5 rounded-lg bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-700 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition"
                                title="Gift this comment (UniNest 2% fee)"
                              >
                                <Gift className="w-3 h-3 text-pink-500" />
                                <span>Gift Reply</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteComment(q.id, comm.id)}
                                className="px-2 py-0.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition"
                                title="Delete this comment from discussion"
                              >
                                <Trash2 className="w-3 h-3 text-rose-500" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>

                          <p className="text-xs text-slate-700 leading-relaxed pl-8">{comm.text}</p>

                          {replyGifts[comm.id] && (
                            <div className="ml-8 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                              <Gift className="w-3 h-3 text-emerald-600" />
                              <span>Gifted ₦{(replyGifts[comm.id]?.amount || 0).toLocaleString()} (UniNest 2% fee applied)</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add comment input */}
                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Discuss under this question, suggest formulas, or clarify..."
                        value={newCommentInput[q.id] || ''}
                        onChange={(e) => setNewCommentInput({ ...newCommentInput, [q.id]: e.target.value })}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(q.id); }}
                        className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddComment(q.id)}
                        className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Discuss</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ================= MODAL: ASK A QUESTION (TEXT OR PHOTO) ================= */}
      {showAskModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-indigo-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Upload Campus Question</h3>
                  <p className="text-[11px] text-slate-500">Get immediate answers from other university students</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAskModal(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAskSubmit} className="space-y-4">
              {/* Question Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Question Title / Short Summary *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. How to evaluate lim(x->0) (sin 3x)/x without L'Hopital rule?"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-indigo-500 font-medium"
                />
              </div>

              {/* Course Code & Subject Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Course Code *</label>
                  <input
                    type="text"
                    required
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    placeholder="e.g. MTH 102, GST 111"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-indigo-500 font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject Discipline *</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as StudentQuestion['subjectCategory'])}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-indigo-500 cursor-pointer"
                  >
                    <option value="Mathematics & Engineering">Mathematics &amp; Engineering</option>
                    <option value="Medical & Health">Medical &amp; Health Sciences</option>
                    <option value="Natural & Physical Sciences">Natural &amp; Physical Sciences</option>
                    <option value="Law & Humanities">Law &amp; Humanities</option>
                    <option value="Management & Social Sciences">Management &amp; Social Sciences</option>
                    <option value="General Studies (GST)">General Studies (GST)</option>
                  </select>
                </div>
              </div>

              {/* Detailed Question Text */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Question Text / Typed Problem *
                </label>
                <textarea
                  rows={4}
                  required
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  placeholder="Type the full question instructions, given values, parts (a), (b), or context..."
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-indigo-500"
                />
              </div>

              {/* Upload Picture Format (Camera / File) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Question Photo Format (Optional: Snap with Camera or Upload)
                </label>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <label className="flex-1 px-4 py-3 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-800 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition">
                    <Camera className="w-4 h-4 text-indigo-600" />
                    <span>Upload Question Snapshot / Past Exam</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleFileUpload(e, false)}
                    />
                  </label>
                </div>

                {/* Preset Quick Image Selection */}
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400 font-medium">Or pick an example assignment photo:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {SAMPLE_PICTURES.map((sample, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setNewPictureUrl(sample.url)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                          newPictureUrl === sample.url
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {sample.label}
                      </button>
                    ))}
                  </div>
                </div>

                {newPictureUrl && newPictureUrl.trim() !== '' && (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-h-36">
                    <img src={newPictureUrl} alt="Attached Preview" className="w-full h-36 object-cover" />
                    <button
                      type="button"
                      onClick={() => setNewPictureUrl('')}
                      className="absolute top-2 right-2 p-1 rounded-full bg-slate-900/80 text-white hover:bg-slate-900 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Urgency & Target University */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">When do you need the answer? *</label>
                  <select
                    value={newUrgency}
                    onChange={(e) => setNewUrgency(e.target.value as StudentQuestion['urgency'])}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-indigo-500 cursor-pointer"
                  >
                    <option value="Immediate (Within 1 hour)">⚡ Immediate (Within 1 hour)</option>
                    <option value="Today">🕒 Needed Today</option>
                    <option value="Standard (24-48 hrs)">📅 Standard (24-48 hrs)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target University</label>
                  <select
                    value={newTargetUni}
                    onChange={(e) => setNewTargetUni(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-indigo-500 cursor-pointer"
                  >
                    <option value="All Nigerian Universities">All Nigerian Universities (Recommended)</option>
                    <option value="Niger Delta University (NDU, Amassoma)">NDU Amassoma</option>
                    <option value="University of Port Harcourt (UNIPORT)">UNIPORT</option>
                    <option value="Delta State University (DELSU, Abraka)">DELSU Abraka</option>
                    <option value="University of Lagos (UNILAG)">UNILAG</option>
                    <option value="University of Ibadan (UI)">UI Ibadan</option>
                    <option value="Federal University of Petroleum Resources (FUPRE)">FUPRE Effurun</option>
                  </select>
                </div>
              </div>

              {/* Optional Bounty Reward */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Optional Solution Bounty Tip (From STS Balance)
                </label>
                <div className="flex items-center gap-2">
                  {[0, 500, 1000, 2000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setNewBountyTip(amt)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        newBountyTip === amt 
                          ? 'bg-emerald-600 text-white border-emerald-600' 
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {amt === 0 ? 'No Tip' : `₦${amt.toLocaleString()}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAskModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-indigo-600 hover:from-orange-600 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <Upload className="w-4 h-4" />
                  <span>Publish Question Nationwide</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: LIGHTBOX ENLARGE IMAGE ================= */}
      {lightboxImage && lightboxImage.trim() !== '' && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-white p-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-slate-900 cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={lightboxImage} alt="Full Question Details" className="w-full max-h-[85vh] object-contain rounded-xl" />
          </div>
        </div>
      )}

      {/* ================= MODAL: CONNECT WITH STUDENT SCHOLAR ================= */}
      {contactingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400">
                <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Connect with Student Scholar</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Connecting with {contactingStudent.name} • {contactingStudent.uni}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setContactingStudent(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target profile preview */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                  {contactingStudent.role || 'Campus Scholar'}
                </span>
                <div className="font-extrabold text-slate-900 dark:text-white text-sm">{contactingStudent.name}</div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px]">{contactingStudent.uni}</div>
              </div>
              {contactingStudent.topic && (
                <div className="max-w-[180px] text-right">
                  <span className="text-[10px] text-slate-400 block">Regarding:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] line-clamp-1">
                    {contactingStudent.topic}
                  </span>
                </div>
              )}
            </div>

            {/* Guidelines info */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 text-xs text-indigo-950 dark:text-indigo-200 space-y-1.5">
              <div className="font-bold text-xs flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Academic Collaboration Tips</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Connect directly on WhatsApp to exchange study solutions, past questions, and academic resources.
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setContactingStudent(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Go Back
              </button>

              <button
                type="button"
                onClick={() => {
                  const safeMsg = `Hello ${contactingStudent.name}! I am reaching out from UniNest Academic Hub regarding your ${contactingStudent.role || 'discussion'} on "${contactingStudent.topic || 'campus academics'}".`;
                  const waUrl = `https://wa.me/?text=${encodeURIComponent(safeMsg)}`;
                  window.open(waUrl, '_blank');
                  setContactingStudent(null);
                }}
                className="px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Open WhatsApp Chat</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: GIFT GOOD REPLY (2% UNINEST CHARGE) ================= */}
      {giftingTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-pink-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center font-bold">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Gift Good Solution</h3>
                  <p className="text-[11px] text-slate-500">UniNest automatically charges 2% for gifting</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGiftingTarget(null)}
                className="p-1.5 rounded-full text-gray-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Recipient Details */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Recipient Student</span>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900">{giftingTarget.recipientName}</span>
                <span className="text-[11px] text-slate-500">{giftingTarget.recipientUniversity}</span>
              </div>
              <p className="text-[11px] text-slate-600 italic line-clamp-2 mt-1">
                "{giftingTarget.snippet}..."
              </p>
            </div>

            <form onSubmit={handleSendReplyGift} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Gift Amount (₦)
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {['500', '1000', '2000', '5000'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setGiftAmount(preset)}
                      className={`py-2 rounded-xl text-xs font-black transition cursor-pointer border ${
                        giftAmount === preset
                          ? 'bg-pink-600 text-white border-pink-600 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      ₦{Number(preset).toLocaleString()}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={giftAmount}
                  onChange={(e) => setGiftAmount(e.target.value)}
                  placeholder="Or enter custom amount in ₦"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-pink-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Gift Purpose / Encouragement
                </label>
                <select
                  value={giftOccasion}
                  onChange={(e) => setGiftOccasion(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-pink-500 focus:outline-none bg-white"
                >
                  <option value="Accurate Solution & Handout Support 📚">Accurate Solution &amp; Handout Support 📚</option>
                  <option value="Exam Preparation Assistance ✍️">Exam Preparation Assistance ✍️</option>
                  <option value="Campus Peer Encouragement 🌟">Campus Peer Encouragement 🌟</option>
                  <option value="Lunch / Pocket Allowance 🥪">Lunch / Pocket Allowance 🥪</option>
                </select>
              </div>

              {/* 2% Fee Breakdown Display */}
              <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-700">
                  <span>Gross Gift:</span>
                  <strong className="font-mono">₦{Number(giftAmount || 0).toLocaleString()}</strong>
                </div>
                <div className="flex items-center justify-between text-amber-900">
                  <span>UniNest Gifting Fee (2%):</span>
                  <strong className="font-mono text-amber-700">-₦{Math.round(Number(giftAmount || 0) * 0.02).toLocaleString()}</strong>
                </div>
                <div className="border-t border-amber-200 pt-1.5 flex items-center justify-between text-emerald-800 font-bold">
                  <span>Recipient Receives:</span>
                  <span className="font-mono font-black text-emerald-600 text-sm">
                    ₦{(Number(giftAmount || 0) - Math.round(Number(giftAmount || 0) * 0.02)).toLocaleString()}
                  </span>
                </div>
                <p className="text-[10px] text-amber-800/80 pt-1">
                  💡 UniNest automatically charges 2% for gifting to cover transaction fees and platform infrastructure.
                </p>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setGiftingTarget(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Gift className="w-4 h-4" />
                  <span>Confirm &amp; Send Gift</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Notification Banner */}
      {giftSuccessMsg && (
        <div className="fixed bottom-5 right-5 z-50 p-4 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-700 text-xs flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 max-w-md">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Gift className="w-4 h-4" />
          </div>
          <p className="leading-snug">{giftSuccessMsg}</p>
          <button
            onClick={() => setGiftSuccessMsg(null)}
            className="p-1 text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
