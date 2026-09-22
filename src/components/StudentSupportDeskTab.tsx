import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  FileText, 
  File, 
  Download, 
  Maximize2, 
  X, 
  ExternalLink, 
  Bot, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  HelpCircle, 
  ShieldCheck, 
  ChevronRight, 
  AlertCircle,
  Eye,
  RefreshCw,
  Phone
} from 'lucide-react';
import { UniNestUser, LiveSupportConversation, LiveSupportMessage, FAQItem } from '../types';
import { supportChatService } from '../utils/supportChatService';

interface StudentSupportDeskTabProps {
  user: UniNestUser;
  onNavigateToFaq?: () => void;
  faqs?: FAQItem[];
}

interface FileAttachmentPreview {
  url: string; // Base64 Data URL or blob
  name: string;
  type: string;
  size: string;
}

export const StudentSupportDeskTab: React.FC<StudentSupportDeskTabProps> = ({
  user,
  onNavigateToFaq,
  faqs = []
}) => {
  const [conversation, setConversation] = useState<LiveSupportConversation | null>(null);
  const [messages, setMessages] = useState<LiveSupportMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedAttachment, setSelectedAttachment] = useState<FileAttachmentPreview | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [activeImageModal, setActiveImageModal] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(() => supportChatService.getOnlineStatus());
  const [quickFaqDrawerOpen, setQuickFaqDrawerOpen] = useState(false);
  const [selectedFaqCategory, setSelectedFaqCategory] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize or fetch the conversation for this student
  useEffect(() => {
    const studentEmail = user.email || 'student@campus.edu';
    const conv = supportChatService.getOrCreateConversationForStudent({
      email: studentEmail,
      name: user.name || 'UniNest Student',
      phone: user.phone || '08000000000',
      university: user.university || 'Bayelsa Medical University (BMU)',
      avatarUrl: user.avatarUrl
    });

    setConversation(conv);
    const initialMsgs = supportChatService.getMessages(conv.id);
    setMessages(initialMsgs);
    setIsOnline(supportChatService.getOnlineStatus());

    // Mark as read by student
    supportChatService.markConversationRead(conv.id, 'student');
  }, [user.email, user.name, user.phone, user.university, user.avatarUrl]);

  // Listen to support chat events
  useEffect(() => {
    const handleUpdate = () => {
      if (conversation?.id) {
        const msgs = supportChatService.getMessages(conversation.id);
        const seen = new Set<string>();
        const uniqueMsgs = msgs.filter((m) => {
          if (!m.id || seen.has(m.id)) return false;
          seen.add(m.id);
          return true;
        });
        setMessages(uniqueMsgs);
        setIsOnline(supportChatService.getOnlineStatus());
      }
    };

    window.addEventListener('uninest_support_update', handleUpdate);
    return () => {
      window.removeEventListener('uninest_support_update', handleUpdate);
    };
  }, [conversation?.id]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedAttachment]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Limit to 6MB for smooth client-side storage
    if (file.size > 6 * 1024 * 1024) {
      setUploadError('File exceeds 6MB. Please choose a smaller photo or document.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedAttachment({
        url: reader.result as string,
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: formatFileSize(file.size)
      });
      setIsUploading(false);
    };

    reader.onerror = () => {
      setUploadError('Failed to read selected file. Please try again.');
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveAttachment = () => {
    setSelectedAttachment(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversation) return;

    const trimmed = inputText.trim();
    if (!trimmed && !selectedAttachment) return;

    // Send student message with optional attachment
    const newMsg = supportChatService.sendMessage(
      conversation.id,
      'student',
      user.email || 'student@campus.edu',
      user.name || 'Student',
      trimmed,
      selectedAttachment ? {
        url: selectedAttachment.url,
        name: selectedAttachment.name,
        type: selectedAttachment.type,
        size: selectedAttachment.size
      } : undefined
    );

    if (newMsg) {
      setMessages(prev => {
        if (prev.some(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    }
    setInputText('');
    handleRemoveAttachment();

    // The supportChatService will automatically dispatch an auto-reply:
    // "We are connecting you to our UniNest customer care. For quick answers, check the FAQ."
  };

  const handleQuickQuestion = (question: string) => {
    setInputText(question);
  };

  const isImageFile = (type?: string, name?: string): boolean => {
    if (type && type.startsWith('image/')) return true;
    if (name) {
      const lower = name.toLowerCase();
      return lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.endsWith('.webp') || lower.endsWith('.gif');
    }
    return false;
  };

  // Pre-configured Quick FAQ cards for instant self-help
  const QUICK_TOPICS = [
    {
      title: 'STS Savings & Gifting',
      category: 'sts',
      answer: 'STS (Save Till Sign-Out) locks your savings safely toward convocation or graduation. 1-time emergency early withdrawals are permitted with zero penalty after approval.'
    },
    {
      title: 'Bayelsa Hostels & Roommates',
      category: 'housing',
      answer: 'Browse verified lodges in Amassoma (NDU), Yenagoa (BMU), and Otuoke (FUOTUOKE). Roommate matching connects you by study and sleeping habits with direct WhatsApp chat.'
    },
    {
      title: 'Escrow Account (2150445461 UBA)',
      category: 'escrow',
      answer: 'Official UniNest Escrow Account is 2150445461 (United Bank for Africa - UBA). Funds are released to sellers only after student inspection or within 3 working days.'
    },
    {
      title: 'Cheap Data Delivery',
      category: 'data',
      answer: 'MTN, Airtel, Glo, and 9mobile student data bundles are credited automatically within 60 seconds after submitting payment proof.'
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col min-h-[640px] max-h-[820px] relative">
      {/* Header Bar */}
      <div className="p-4 bg-[#0A1931] text-white flex items-center justify-between border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FF6A00] flex items-center justify-center font-black text-white text-sm shadow-md">
            UN
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-white">UniNest 24/7 Customer Care &amp; Support Desk</h3>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                <ShieldCheck className="w-3 h-3" />
                Verified Campus Desk
              </span>
            </div>
            <p className="text-[11px] text-slate-300 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
              <span>{isOnline ? 'Active Customer Care Online' : 'Offline • Automatic FAQ Active'}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300">Fast file &amp; text inquiries</span>
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {onNavigateToFaq && (
            <button
              onClick={onNavigateToFaq}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="Open full FAQ Tab"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#FF6A00]" />
              <span className="hidden md:inline">Check Campus FAQ</span>
            </button>
          )}

          <a
            href="https://wa.me/2349039847154?text=Hello%20UniNest%20Customer%20Care!%20I%20am%20chatting%20from%20the%20Campus%20Support%20Desk."
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Chat directly on WhatsApp"
          >
            <Phone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">WhatsApp Desk</span>
          </a>
        </div>
      </div>

      {/* Suggested Quick Inquiries Header Bar */}
      <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-[11px] shrink-0">
        <span className="text-slate-500 dark:text-slate-400 font-bold shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#FF6A00]" />
          Quick Ask:
        </span>
        <button
          onClick={() => handleQuickQuestion("Good day, I would like to verify my STS deposit proof and activate my account.")}
          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-[#FF6A00] whitespace-nowrap cursor-pointer transition"
        >
          Verify STS Deposit
        </button>
        <button
          onClick={() => handleQuickQuestion("Hello, how does the 1-time emergency withdrawal work on Save Till Sign-Out?")}
          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-[#FF6A00] whitespace-nowrap cursor-pointer transition"
        >
          Emergency Withdrawal
        </button>
        <button
          onClick={() => handleQuickQuestion("I need assistance finding an inspected self-contain lodge in Yenagoa near BMU.")}
          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-[#FF6A00] whitespace-nowrap cursor-pointer transition"
        >
          Bayelsa Hostel Inquiry
        </button>
        <button
          onClick={() => handleQuickQuestion("Please confirm the official UniNest Escrow account number before I send money.")}
          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-[#FF6A00] whitespace-nowrap cursor-pointer transition"
        >
          Escrow Account Info
        </button>
      </div>

      {/* Message Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/70 dark:bg-slate-900/60">
        {messages.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-[#FF6A00] mx-auto flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              Welcome to UniNest Live Support Desk
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Send questions or attach payment slips, matric cards, or documents. Our customer care team is here to help!
            </p>
          </div>
        ) : (
          messages.map((m, idx) => {
            const isUser = m.senderRole === 'student';
            const isAutoReply = m.isAutoReply;

            return (
              <div
                key={`${m.id || 'msg'}-${idx}`}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                {/* Sender Tag */}
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  {isAutoReply ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-[#FF6A00] bg-orange-500/10 dark:bg-orange-500/20 px-2 py-0.5 rounded-full border border-orange-500/30">
                      <Bot className="w-3 h-3" />
                      Auto Customer Care
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      {m.senderName || (isUser ? 'You' : 'Support Officer')}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400 font-mono">{m.timestamp}</span>
                </div>

                {/* Message Box */}
                <div
                  className={`max-w-[88%] sm:max-w-[78%] rounded-2xl text-xs leading-relaxed overflow-hidden shadow-xs ${
                    isUser
                      ? 'bg-[#0A1931] text-white rounded-br-xs p-3.5'
                      : isAutoReply
                      ? 'bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-slate-900 dark:text-slate-100 rounded-bl-xs p-4 shadow-sm'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-xs p-3.5'
                  }`}
                >
                  {/* Text Content */}
                  {m.text && (
                    <p className="whitespace-pre-wrap font-normal">{m.text}</p>
                  )}

                  {/* Attachment Rendering (Image or File) */}
                  {m.attachmentUrl && (
                    <div className={`${m.text ? 'mt-3 pt-2.5 border-t border-slate-200/40 dark:border-slate-700/40' : ''}`}>
                      {isImageFile(m.attachmentType, m.attachmentName) && m.attachmentUrl && m.attachmentUrl.trim() !== '' ? (
                        <div className="space-y-1.5">
                          <div 
                            onClick={() => setActiveImageModal(m.attachmentUrl!)}
                            className="relative group rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 max-h-56 cursor-pointer bg-slate-950"
                          >
                            <img
                              src={m.attachmentUrl}
                              alt={m.attachmentName || 'Attachment image'}
                              referrerPolicy="no-referrer"
                              className="w-full h-auto max-h-56 object-contain transition group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 text-white">
                              <span className="px-2.5 py-1 rounded-lg bg-black/60 text-[11px] font-bold flex items-center gap-1">
                                <Maximize2 className="w-3.5 h-3.5" />
                                Click to View Full Size
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[10px] opacity-90 px-0.5">
                            <span className="truncate max-w-[180px] font-medium flex items-center gap-1">
                              <ImageIcon className="w-3 h-3 text-[#FF6A00]" />
                              {m.attachmentName || 'Image'}
                            </span>
                            {m.attachmentSize && <span className="font-mono">{m.attachmentSize}</span>}
                            <a
                              href={m.attachmentUrl}
                              download={m.attachmentName || 'uninest-attachment'}
                              className="inline-flex items-center gap-1 hover:underline text-[#FF6A00] font-bold"
                            >
                              <Download className="w-3 h-3" />
                              Save
                            </a>
                          </div>
                        </div>
                      ) : (
                        /* Document or other file */
                        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 truncate">
                            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-[#FF6A00] flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="truncate">
                              <p className="font-bold text-xs truncate text-slate-900 dark:text-white">
                                {m.attachmentName || 'Document file'}
                              </p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                {m.attachmentSize || 'Attached file'}
                              </p>
                            </div>
                          </div>

                          <a
                            href={m.attachmentUrl}
                            download={m.attachmentName || 'uninest-document'}
                            className="px-3 py-1.5 rounded-lg bg-[#FF6A00] hover:bg-[#E05D00] text-white text-[11px] font-bold shrink-0 transition flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download</span>
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Special Auto-Reply Interactive FAQ Box */}
                  {isAutoReply && (
                    <div className="mt-3 pt-3 border-t border-amber-300 dark:border-amber-800/80 space-y-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {onNavigateToFaq && (
                          <button
                            type="button"
                            onClick={onNavigateToFaq}
                            className="px-3 py-1.5 rounded-xl bg-[#0A1931] hover:bg-[#142A4D] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <HelpCircle className="w-3.5 h-3.5 text-[#FF6A00]" />
                            <span>Check the Campus FAQ Tab</span>
                            <ChevronRight className="w-3 h-3 text-[#FF6A00]" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setQuickFaqDrawerOpen(!quickFaqDrawerOpen)}
                          className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>{quickFaqDrawerOpen ? 'Hide Quick Answers' : 'View Quick Answers Here'}</span>
                        </button>
                      </div>

                      {/* Expandable Quick Answers inside the chat */}
                      {quickFaqDrawerOpen && (
                        <div className="mt-2 p-3 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800 space-y-2.5">
                          <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            Instant Verified Answers:
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {QUICK_TOPICS.map(item => (
                              <div
                                key={item.category}
                                className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] space-y-1"
                              >
                                <h5 className="font-extrabold text-[#0A1931] dark:text-amber-400 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                  {item.title}
                                </h5>
                                <p className="text-slate-600 dark:text-slate-300 text-[10px] leading-relaxed">
                                  {item.answer}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Selected File Preview Drawer before sending */}
      {selectedAttachment && (
        <div className="p-3 px-4 bg-orange-50 dark:bg-slate-800 border-t border-orange-200 dark:border-slate-700 flex items-center justify-between gap-3 animate-fadeIn shrink-0">
          <div className="flex items-center gap-3 truncate">
            {isImageFile(selectedAttachment.type, selectedAttachment.name) && selectedAttachment.url && selectedAttachment.url.trim() !== '' ? (
              <img
                src={selectedAttachment.url}
                alt="Upload preview"
                className="w-10 h-10 rounded-lg object-cover border border-orange-300 dark:border-slate-600 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 text-[#FF6A00] flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
            )}
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">
                  {selectedAttachment.name}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-[#FF6A00] font-mono font-bold">
                  {selectedAttachment.size}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Ready to send • Add a message or tap Send
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRemoveAttachment}
            className="p-1.5 rounded-lg bg-white dark:bg-slate-700 hover:bg-rose-50 dark:hover:bg-rose-900/40 text-slate-500 hover:text-rose-600 transition cursor-pointer"
            title="Remove attachment"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="px-4 py-2 bg-rose-50 dark:bg-rose-950/40 border-t border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" />
            {uploadError}
          </span>
          <button onClick={() => setUploadError(null)} className="font-bold text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Composer Form: Text Input + File Attachment Controls */}
      <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0">
        {/* Hidden Native File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*,.pdf,.doc,.docx,.txt,.zip"
          className="hidden"
          id="student-support-file-input"
        />

        {/* Paperclip / File Attachment Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-[#FF6A00] transition cursor-pointer flex items-center justify-center shrink-0"
          title="Attach photo, screenshot, payment receipt or document"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        {/* Camera / Photo Button */}
        <button
          type="button"
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.accept = 'image/*';
              fileInputRef.current.click();
            }
          }}
          disabled={isUploading}
          className="hidden sm:flex p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-[#FF6A00] transition cursor-pointer items-center justify-center shrink-0"
          title="Attach image or photo"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        {/* Text Message Field */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={selectedAttachment ? "Add caption or message..." : "Type your message or attach a receipt / file..."}
          className="flex-1 h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!inputText.trim() && !selectedAttachment}
          className="px-5 h-11 rounded-xl bg-[#FF6A00] hover:bg-[#E05D00] disabled:opacity-40 disabled:hover:bg-[#FF6A00] text-white font-black text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0 shadow-md"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>

      {/* Image Full-Size Lightbox Modal */}
      {activeImageModal && activeImageModal.trim() !== '' && (
        <div 
          onClick={() => setActiveImageModal(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="max-w-3xl w-full max-h-[90vh] bg-slate-900 rounded-3xl overflow-hidden border border-white/20 shadow-2xl flex flex-col"
          >
            <div className="p-4 bg-slate-950 flex items-center justify-between border-b border-white/10 text-white">
              <span className="text-xs font-bold flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#FF6A00]" />
                Attached Image Preview
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={activeImageModal}
                  download="uninest-attachment"
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1 text-xs font-bold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
                <button
                  onClick={() => setActiveImageModal(null)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-rose-600 text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 p-4 flex items-center justify-center overflow-auto bg-black/60">
              <img
                src={activeImageModal}
                alt="Full size attachment"
                referrerPolicy="no-referrer"
                className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
