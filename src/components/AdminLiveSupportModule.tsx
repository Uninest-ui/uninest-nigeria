import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Search, 
  CheckCircle2, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Building, 
  ShieldCheck, 
  RefreshCw, 
  ToggleLeft, 
  ToggleRight,
  ExternalLink,
  Sparkles,
  Smile,
  AlertCircle,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Download,
  Maximize2,
  X,
  Bot
} from 'lucide-react';
import { LiveSupportConversation, LiveSupportMessage } from '../types';
import { supportChatService } from '../utils/supportChatService';

interface AdminLiveSupportModuleProps {
  adminEmail: string;
  adminName: string;
  onAddLog: (action: string, details?: string) => void;
}

export const AdminLiveSupportModule: React.FC<AdminLiveSupportModuleProps> = ({
  adminEmail,
  adminName,
  onAddLog
}) => {
  const [conversations, setConversations] = useState<LiveSupportConversation[]>(() => supportChatService.getConversations());
  const [selectedConvId, setSelectedConvId] = useState<string>(() => {
    const list = supportChatService.getConversations();
    return list.length > 0 ? list[0].id : '';
  });
  const [messages, setMessages] = useState<LiveSupportMessage[]>(() => {
    const list = supportChatService.getConversations();
    return list.length > 0 ? supportChatService.getMessages(list[0].id) : [];
  });
  const [inputMessage, setInputMessage] = useState('');
  const [isOnline, setIsOnline] = useState<boolean>(() => supportChatService.getOnlineStatus());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [selectedAttachment, setSelectedAttachment] = useState<{ url: string; name: string; type: string; size: string } | null>(null);
  const [activeImageModal, setActiveImageModal] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync messages when selected conversation changes
  useEffect(() => {
    if (selectedConvId) {
      const msgs = supportChatService.getMessages(selectedConvId);
      const seen = new Set<string>();
      const uniqueMsgs = msgs.filter(m => {
        if (!m.id || seen.has(m.id)) return false;
        seen.add(m.id);
        return true;
      });
      setMessages(uniqueMsgs);
      // Mark as read
      supportChatService.markAsRead(selectedConvId);
      setConversations(supportChatService.getConversations());
    }
  }, [selectedConvId]);

  // Listen to cross-tab / service support updates
  useEffect(() => {
    const handleSupportUpdate = () => {
      const updatedConvs = supportChatService.getConversations();
      setConversations(updatedConvs);
      if (selectedConvId) {
        const msgs = supportChatService.getMessages(selectedConvId);
        const seen = new Set<string>();
        const uniqueMsgs = msgs.filter(m => {
          if (!m.id || seen.has(m.id)) return false;
          seen.add(m.id);
          return true;
        });
        setMessages(uniqueMsgs);
      }
      setIsOnline(supportChatService.getOnlineStatus());
    };

    window.addEventListener('uninest_support_update', handleSupportUpdate);
    return () => {
      window.removeEventListener('uninest_support_update', handleSupportUpdate);
    };
  }, [selectedConvId]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const refreshAll = () => {
    const updatedConvs = supportChatService.getConversations();
    setConversations(updatedConvs);
    if (selectedConvId) {
      setMessages(supportChatService.getMessages(selectedConvId));
    }
    setIsOnline(supportChatService.getOnlineStatus());
  };

  const handleToggleOnline = () => {
    const newStatus = !isOnline;
    supportChatService.setOnlineStatus(newStatus);
    setIsOnline(newStatus);
    onAddLog(
      `Support Desk Status Changed`,
      `Customer Support is now ${newStatus ? 'ONLINE' : 'OFFLINE'}`
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 6 * 1024 * 1024) {
      alert('File size exceeds 6MB. Please choose a smaller file.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedAttachment({
        url: reader.result as string,
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: formatFileSize(file.size)
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAttachment = () => {
    setSelectedAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputMessage.trim() && !selectedAttachment) || !selectedConvId) return;

    const newMsg = supportChatService.sendAdminReply(
      selectedConvId,
      adminEmail,
      adminName || 'UniNest Support Officer',
      inputMessage.trim(),
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
      setInputMessage('');
      handleRemoveAttachment();
      setConversations(supportChatService.getConversations());
      onAddLog(
        `Support Chat Reply`,
        `Replied to student ticket (${selectedConvId})${selectedAttachment ? ` with file ${selectedAttachment.name}` : ''}`
      );
    }
  };

  const handleQuickTemplate = (text: string) => {
    setInputMessage(text);
  };

  const handleToggleStatus = (newStatus: 'open' | 'resolved') => {
    if (!selectedConvId) return;
    supportChatService.toggleStatus(selectedConvId, newStatus);
    setConversations(supportChatService.getConversations());
    onAddLog(
      `Ticket Status Updated`,
      `Marked conversation ${selectedConvId} as ${newStatus}`
    );
  };

  const selectedConv = conversations.find(c => c.id === selectedConvId);

  const filteredConversations = conversations.filter(c => {
    const matchesStatus = statusFilter === 'all' ? true : c.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      c.studentName.toLowerCase().includes(q) ||
      c.studentEmail.toLowerCase().includes(q) ||
      c.university.toLowerCase().includes(q) ||
      c.lastMessage.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const totalUnreadCount = conversations.reduce((acc, c) => acc + c.unreadAdminCount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner with Online / Offline Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-black text-white">Live Customer Support Desk</h2>
            {totalUnreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white font-black text-xs">
                {totalUnreadCount} New
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Real-time multi-agent live chat with students asking about deposits, STS gifting, Bayelsa housing, and academic assist.
          </p>
        </div>

        {/* Online Status Toggle */}
        <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Agent Status</span>
            <span className={`text-xs font-black flex items-center gap-1.5 ${
              isOnline ? 'text-emerald-400' : 'text-slate-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
              {isOnline ? 'ONLINE & ACTIVE' : 'OFFLINE'}
            </span>
          </div>

          <button
            onClick={handleToggleOnline}
            className={`p-1.5 rounded-xl transition cursor-pointer ${
              isOnline ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-500 hover:text-slate-300'
            }`}
            title={isOnline ? 'Click to go offline' : 'Click to go online'}
          >
            {isOnline ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
          </button>

          <button
            onClick={refreshAll}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            title="Refresh conversations"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Support Chat Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl min-h-[620px]">
        {/* Left Column: Student Conversations List (4 Cols) */}
        <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col bg-slate-950/50">
          {/* Search and Filters */}
          <div className="p-4 border-b border-slate-800 space-y-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student or chat..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-amber-500"
              />
            </div>

            <div className="flex items-center gap-1.5">
              {(['all', 'open', 'resolved'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold transition capitalize cursor-pointer ${
                    statusFilter === tab
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 max-h-[500px] lg:max-h-[600px]">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No conversations found.
              </div>
            ) : (
              filteredConversations.map(conv => {
                const isSelected = conv.id === selectedConvId;

                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={`w-full p-4 text-left transition flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800/90 border-l-4 border-amber-500'
                        : 'hover:bg-slate-900/80'
                    }`}
                  >
                    <img
                      src={conv.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={conv.studentName}
                      className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-700"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className="text-xs font-black text-slate-100 truncate">{conv.studentName}</h4>
                        <span className="text-[10px] text-slate-500 shrink-0">{conv.lastMessageTime}</span>
                      </div>

                      <p className="text-[11px] text-amber-400/90 truncate font-medium mb-1">
                        {conv.university}
                      </p>

                      <p className="text-xs text-slate-400 truncate">
                        {conv.lastMessage}
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/40">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                          conv.status === 'open' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {conv.status.toUpperCase()}
                        </span>

                        {conv.unreadAdminCount > 0 && (
                          <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center animate-bounce">
                            {conv.unreadAdminCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat History & Reply Composer (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col justify-between bg-slate-900/60">
          {selectedConv ? (
            <>
              {/* Active Conversation Header */}
              <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedConv.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={selectedConv.studentName}
                    className="w-11 h-11 rounded-2xl object-cover border border-amber-500/40"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-white">{selectedConv.studentName}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        selectedConv.status === 'open' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {selectedConv.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {selectedConv.university} • <span className="text-amber-400 font-mono">{selectedConv.studentPhone}</span>
                    </p>
                  </div>
                </div>

                {/* Quick actions for student */}
                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/234${selectedConv.studentPhone.replace(/^0/, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>WhatsApp</span>
                  </a>

                  {selectedConv.status === 'open' ? (
                    <button
                      onClick={() => handleToggleStatus('resolved')}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Mark Resolved</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleStatus('open')}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reopen Ticket</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[420px]">
                {messages.map((msg, idx) => {
                  const isAdmin = msg.senderRole === 'admin';
                  const isAutoReply = msg.isAutoReply;
                  const isImage = msg.attachmentType?.startsWith('image/') || 
                    (msg.attachmentName && /\.(jpg|jpeg|png|webp|gif)$/i.test(msg.attachmentName));

                  return (
                    <div
                      key={`${msg.id || 'msg'}-${idx}`}
                      className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-slate-400">{msg.senderName}</span>
                        {isAutoReply ? (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                            <Bot className="w-2.5 h-2.5" />
                            Auto-Reply
                          </span>
                        ) : isAdmin ? (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            Support Agent
                          </span>
                        ) : null}
                        <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                      </div>

                      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed space-y-2 ${
                        isAdmin
                          ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-xs shadow-md'
                          : isAutoReply
                          ? 'bg-blue-950/60 text-blue-200 rounded-tl-xs border border-blue-800'
                          : 'bg-slate-800 text-slate-100 rounded-tl-xs border border-slate-700'
                      }`}>
                        {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}

                        {/* Attached file/image rendering */}
                        {msg.attachmentUrl && (
                          <div className="pt-2 border-t border-black/10 dark:border-white/10">
                            {isImage ? (
                              <div className="space-y-1">
                                <div
                                  onClick={() => setActiveImageModal(msg.attachmentUrl!)}
                                  className="relative group rounded-xl overflow-hidden max-h-48 cursor-pointer border border-black/20 bg-slate-950"
                                >
                                  <img
                                    src={msg.attachmentUrl}
                                    alt={msg.attachmentName || 'Attachment image'}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-auto max-h-48 object-contain transition group-hover:scale-105"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                                    <span className="px-2 py-1 rounded bg-black/70 text-[10px] font-bold flex items-center gap-1">
                                      <Maximize2 className="w-3 h-3" /> Click to Zoom
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between text-[10px] opacity-80 pt-0.5">
                                  <span className="truncate max-w-[160px] font-mono">{msg.attachmentName}</span>
                                  {msg.attachmentSize && <span>{msg.attachmentSize}</span>}
                                  <a
                                    href={msg.attachmentUrl}
                                    download={msg.attachmentName || 'attachment'}
                                    className="font-bold underline flex items-center gap-0.5 ml-2"
                                  >
                                    <Download className="w-3 h-3" /> Save
                                  </a>
                                </div>
                              </div>
                            ) : (
                              <div className="p-2.5 rounded-xl bg-black/10 border border-black/15 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 truncate">
                                  <FileText className="w-5 h-5 shrink-0" />
                                  <div className="truncate text-left">
                                    <p className="font-bold text-xs truncate">{msg.attachmentName || 'Document'}</p>
                                    <p className="text-[10px] opacity-75">{msg.attachmentSize || 'File attachment'}</p>
                                  </div>
                                </div>
                                <a
                                  href={msg.attachmentUrl}
                                  download={msg.attachmentName || 'document'}
                                  className="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-bold hover:bg-slate-800 transition flex items-center gap-1 shrink-0"
                                >
                                  <Download className="w-3 h-3" />
                                  <span>Download</span>
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Canned Quick Templates */}
              <div className="p-2.5 px-4 bg-slate-950/40 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-[11px]">
                <span className="text-slate-500 font-bold shrink-0">Quick Templates:</span>
                <button
                  type="button"
                  onClick={() => handleQuickTemplate("Hello! Your deposit has been verified by the finance desk and credited to your wallet balance.")}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap cursor-pointer"
                >
                  ✓ Deposit Credited
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickTemplate("Your 1-time emergency withdrawal request is currently being processed to your nominated bank account.")}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap cursor-pointer"
                >
                  ⏱ Withdrawal In-Progress
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickTemplate("Please upload a clear screenshot of your bank transfer receipt or matriculation card.")}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap cursor-pointer"
                >
                  📷 Request Proof
                </button>
              </div>

              {/* Pre-Send Attachment Preview */}
              {selectedAttachment && (
                <div className="p-2 px-4 bg-amber-500/10 border-t border-amber-500/30 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <Paperclip className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-white font-bold truncate max-w-xs">{selectedAttachment.name}</span>
                    <span className="text-amber-400 text-[10px] font-mono">({selectedAttachment.size})</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveAttachment}
                    className="p-1 rounded-md hover:bg-rose-500/20 text-rose-400 transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Reply Input Bar */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center gap-2 sm:gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-amber-400 border border-slate-700 transition cursor-pointer flex items-center justify-center shrink-0"
                  title="Attach file or proof"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.accept = 'image/*';
                      fileInputRef.current.click();
                    }
                  }}
                  className="hidden sm:flex p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-amber-400 border border-slate-700 transition cursor-pointer items-center justify-center shrink-0"
                  title="Attach image"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={`Reply to ${selectedConv.studentName}...`}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-amber-500 font-medium"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() && !selectedAttachment}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-black shadow-md transition flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="p-12 text-center text-slate-500 my-auto">
              Select a student conversation to start messaging.
            </div>
          )}
        </div>
      </div>
      {/* Image Full-Size Lightbox Modal */}
      {activeImageModal && (
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
                <ImageIcon className="w-4 h-4 text-amber-400" />
                Attached Image / Proof
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={activeImageModal}
                  download="attachment"
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1 text-xs font-bold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
                <button
                  onClick={() => setActiveImageModal(null)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-rose-600 text-white transition cursor-pointer"
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
