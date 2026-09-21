import { LiveSupportMessage, LiveSupportConversation } from '../types';

const CONVERSATIONS_KEY = 'uninest_support_conversations';
const MESSAGES_KEY = 'uninest_support_messages';

const INITIAL_CONVERSATIONS: LiveSupportConversation[] = [
  {
    id: 'conv-01',
    studentEmail: 'student@campus.edu',
    studentName: 'Tariere Ebimobowei',
    studentPhone: '08123456789',
    university: 'Niger Delta University (NDU)',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    lastMessage: 'Good afternoon, please when is my withdrawal request going to be processed?',
    lastMessageTime: '10 mins ago',
    unreadAdminCount: 1,
    status: 'open'
  },
  {
    id: 'conv-02',
    studentEmail: 'ebi.preye@bmu.edu.ng',
    studentName: 'Ebiere Preye',
    studentPhone: '08098765432',
    university: 'Bayelsa Medical University (BMU)',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    lastMessage: 'How do I activate my STS Save Till Sign-Out account with the ₦500 charge?',
    lastMessageTime: '35 mins ago',
    unreadAdminCount: 0,
    status: 'open'
  },
  {
    id: 'conv-03',
    studentEmail: 'chukwuma.eze@fuotuoke.edu.ng',
    studentName: 'Chukwuma Eze',
    studentPhone: '08144556677',
    university: 'Federal University Otuoke (FUOTUOKE)',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    lastMessage: 'I would like to hire a student POS operator for my campus shop.',
    lastMessageTime: '1 hour ago',
    unreadAdminCount: 0,
    status: 'resolved'
  }
];

const INITIAL_MESSAGES: Record<string, LiveSupportMessage[]> = {
  'conv-01': [
    {
      id: 'msg-01',
      conversationId: 'conv-01',
      senderRole: 'student',
      senderEmail: 'student@campus.edu',
      senderName: 'Tariere Ebimobowei',
      text: 'Good afternoon, please when is my withdrawal request going to be processed?',
      timestamp: 'Today, 2:15 PM',
      isReadByAdmin: false,
      isReadByStudent: true
    }
  ],
  'conv-02': [
    {
      id: 'msg-02',
      conversationId: 'conv-02',
      senderRole: 'student',
      senderEmail: 'ebi.preye@bmu.edu.ng',
      senderName: 'Ebiere Preye',
      text: 'How do I activate my STS Save Till Sign-Out account with the ₦500 charge?',
      timestamp: 'Today, 1:40 PM',
      isReadByAdmin: true,
      isReadByStudent: true
    },
    {
      id: 'msg-03',
      conversationId: 'conv-02',
      senderRole: 'admin',
      senderEmail: 'admin@uninest.com',
      senderName: 'UniNest Official Support',
      text: 'Hello Ebiere! You can activate your STS Vault directly in the Save Till Sign-Out tab by clicking "Activate STS (₦500)". It is a one-time enrollment charge.',
      timestamp: 'Today, 1:45 PM',
      isReadByAdmin: true,
      isReadByStudent: true
    }
  ]
};

const safeDispatchSupportUpdate = () => {
  try {
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('uninest_support_update'));
    }
  } catch {
    // fallback or ignore in restricted environments
  }
};

export const supportChatService = {
  getConversations: (): LiveSupportConversation[] => {
    try {
      const saved = localStorage.getItem(CONVERSATIONS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(INITIAL_CONVERSATIONS));
    return INITIAL_CONVERSATIONS;
  },

  getMessages: (conversationId: string): LiveSupportMessage[] => {
    try {
      const saved = localStorage.getItem(`${MESSAGES_KEY}_${conversationId}`);
      if (saved) {
        const raw: LiveSupportMessage[] = JSON.parse(saved);
        if (Array.isArray(raw)) {
          const seen = new Set<string>();
          const deduped: LiveSupportMessage[] = [];
          for (const m of raw) {
            if (m && m.id && !seen.has(m.id)) {
              seen.add(m.id);
              deduped.push(m);
            }
          }
          if (deduped.length !== raw.length) {
            localStorage.setItem(`${MESSAGES_KEY}_${conversationId}`, JSON.stringify(deduped));
          }
          return deduped;
        }
      }
      if (INITIAL_MESSAGES[conversationId]) {
        localStorage.setItem(`${MESSAGES_KEY}_${conversationId}`, JSON.stringify(INITIAL_MESSAGES[conversationId]));
        return INITIAL_MESSAGES[conversationId];
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  },

  getOrCreateConversationForStudent: (student: {
    email: string;
    name: string;
    phone?: string;
    university?: string;
    avatarUrl?: string;
  }): LiveSupportConversation => {
    const convs = supportChatService.getConversations();
    const existing = convs.find(c => c.studentEmail.toLowerCase() === student.email.toLowerCase());
    if (existing) return existing;

    const newConv: LiveSupportConversation = {
      id: `conv-${Date.now()}`,
      studentEmail: student.email,
      studentName: student.name || 'Student',
      studentPhone: student.phone || '08000000000',
      university: student.university || 'Nigerian University',
      avatarUrl: student.avatarUrl || '',
      lastMessage: 'Started new chat with customer support',
      lastMessageTime: 'Just now',
      unreadAdminCount: 0,
      status: 'open'
    };

    const updated = [newConv, ...convs];
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(updated));
    return newConv;
  },

  sendMessage: (
    conversationId: string,
    senderRole: 'student' | 'admin',
    senderEmail: string,
    senderName: string,
    text: string,
    attachment?: {
      url: string;
      name: string;
      type: string;
      size?: string;
    },
    isAutoReply?: boolean
  ): LiveSupportMessage => {
    const messages = supportChatService.getMessages(conversationId);
    const newMsg: LiveSupportMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}-${Math.random().toString(36).slice(2, 9)}`,
      conversationId,
      senderRole,
      senderEmail,
      senderName,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isReadByAdmin: senderRole === 'admin',
      isReadByStudent: senderRole === 'student',
      attachmentUrl: attachment?.url,
      attachmentName: attachment?.name,
      attachmentType: attachment?.type,
      attachmentSize: attachment?.size,
      isAutoReply
    };

    const existingIds = new Set(messages.map(m => m.id));
    const updatedMessages = existingIds.has(newMsg.id) ? messages : [...messages, newMsg];
    localStorage.setItem(`${MESSAGES_KEY}_${conversationId}`, JSON.stringify(updatedMessages));

    // Update conversation metadata
    const convs = supportChatService.getConversations();
    const lastPreview = text.trim() 
      ? text 
      : (attachment ? `📎 [File] ${attachment.name}` : 'New message');

    const updatedConvs = convs.map(c => {
      if (c.id === conversationId) {
        return {
          ...c,
          lastMessage: lastPreview,
          lastMessageTime: 'Just now',
          unreadAdminCount: senderRole === 'student' ? c.unreadAdminCount + 1 : 0
        };
      }
      return c;
    });
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(updatedConvs));

    // Dispatch window storage event for real-time reactivity in tab
    safeDispatchSupportUpdate();

    // Trigger automatic customer care connecting reply for student queries
    if (senderRole === 'student' && !isAutoReply) {
      setTimeout(() => {
        supportChatService.sendMessage(
          conversationId,
          'admin',
          'support@uninest.com',
          'UniNest Customer Care Bot',
          'We are connecting you to our UniNest customer care. For quick answers, check the FAQ.',
          undefined,
          true
        );
      }, 400);
    }

    return newMsg;
  },

  markConversationRead: (conversationId: string, role: 'admin' | 'student') => {
    const convs = supportChatService.getConversations();
    const updatedConvs = convs.map(c => {
      if (c.id === conversationId && role === 'admin') {
        return { ...c, unreadAdminCount: 0 };
      }
      return c;
    });
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(updatedConvs));
    safeDispatchSupportUpdate();
  },

  toggleConversationStatus: (conversationId: string): 'open' | 'resolved' => {
    const convs = supportChatService.getConversations();
    let nextStatus: 'open' | 'resolved' = 'open';
    const updatedConvs = convs.map(c => {
      if (c.id === conversationId) {
        nextStatus = c.status === 'open' ? 'resolved' : 'open';
        return { ...c, status: nextStatus };
      }
      return c;
    });
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(updatedConvs));
    safeDispatchSupportUpdate();
    return nextStatus;
  },

  getOnlineStatus: (): boolean => {
    try {
      const stored = localStorage.getItem('uninest_support_online');
      return stored !== null ? JSON.parse(stored) : true;
    } catch {
      return true;
    }
  },

  setOnlineStatus: (isOnline: boolean) => {
    localStorage.setItem('uninest_support_online', JSON.stringify(isOnline));
    safeDispatchSupportUpdate();
  },

  sendAdminReply: (
    conversationId: string,
    adminEmail: string,
    adminName: string,
    text: string,
    attachment?: {
      url: string;
      name: string;
      type: string;
      size?: string;
    }
  ): LiveSupportMessage => {
    return supportChatService.sendMessage(conversationId, 'admin', adminEmail, adminName, text, attachment);
  },

  sendStudentMessage: (
    conversationId: string,
    studentEmail: string,
    studentName: string,
    text: string,
    attachment?: {
      url: string;
      name: string;
      type: string;
      size?: string;
    }
  ): LiveSupportMessage => {
    return supportChatService.sendMessage(conversationId, 'student', studentEmail, studentName, text, attachment);
  },

  markAsRead: (conversationId: string) => {
    supportChatService.markConversationRead(conversationId, 'admin');
  },

  toggleStatus: (conversationId: string, status?: 'open' | 'resolved') => {
    if (status) {
      const convs = supportChatService.getConversations();
      const updatedConvs = convs.map(c => c.id === conversationId ? { ...c, status } : c);
      localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(updatedConvs));
      safeDispatchSupportUpdate();
    } else {
      supportChatService.toggleConversationStatus(conversationId);
    }
  }
};
