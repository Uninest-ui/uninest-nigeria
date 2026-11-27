import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  increment,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { onAuthStateChanged, type User } from 'firebase/auth';
import {
  auth,
  db,
  OperationType,
  handleFirestoreError,
  signInWithGoogle,
  signOutGoogle,
  testConnection,
} from './firebase';
import blueprint from '../firebase-blueprint.json';

type EntityMap = typeof blueprint.entities;

function strMax<K extends keyof EntityMap>(entity: K, prop: string, fallback: number): number {
  const props = blueprint.entities[entity]?.properties as Record<string, { maxLength?: number }> | undefined;
  return props?.[prop]?.maxLength ?? fallback;
}

function clampStr(val: unknown, maxLen: number, fallback = ''): string {
  const s = String(val ?? fallback).trim();
  return s.length > maxLen ? s.slice(0, maxLen) : s;
}

function sanitizeId(val: unknown, maxLen = 128): string {
  const cleaned = String(val ?? '')
    .replace(/[^a-zA-Z0-9_\-]/g, '_')
    .slice(0, maxLen);
  return cleaned || `id_${Date.now()}`;
}

function posNum(val: unknown, fallback = 1): number {
  const n = Number(val);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function nonNegNum(val: unknown, fallback = 0): number {
  const n = Number(val);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

async function sha256Hex(input: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const bytes = new TextEncoder().encode(input);
    const hashBuf = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(hashBuf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // Deterministic fallback if subtle is unavailable in insecure context
  let h1 = 0xdeadbeef ^ input.length;
  let h2 = 0x41c6ce57 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(16, '0');
}

export interface UniNestCloudSnapshot {
  connected: boolean;
  authReady: boolean;
  user: {
    uid: string;
    email: string;
    displayName: string;
    emailVerified: boolean;
    isAdmin: boolean;
  } | null;
  vendors: Record<string, any>[];
  products: Record<string, any>[];
  projectHelpers: Record<string, any>[];
  helperContacts: Record<string, Record<string, any>>;
  helperReviews: Record<string, Record<string, any>[]>;
  scouts: Record<string, any>[];
  scoutContacts: Record<string, Record<string, any>>;
  scoutReviews: Record<string, Record<string, any>[]>;
  scoutLedgers: Record<string, Record<string, any>[]>;
  orders: Record<string, any>[];
  featuredRequests: Record<string, any>[];
  withdrawals: Record<string, any>[];
  helperUnlocks: Record<string, any>[];
  scoutUnlocks: Record<string, any>[];
  scoutBookings: Record<string, any>[];
  partnerAccounts: Record<string, any>[];
  serviceSubmissions: Record<string, any>[];
  vendorAdminBalance: number;
}

class UniNestFirebaseEngine {
  private unsubs: Unsubscribe[] = [];
  private authUnsubs: Unsubscribe[] = [];
  private subscribers = new Set<(snap: UniNestCloudSnapshot) => void>();
  private seededThisSession = false;

  public snapshot: UniNestCloudSnapshot = {
    connected: false,
    authReady: false,
    user: null,
    vendors: [],
    products: [],
    projectHelpers: [],
    helperContacts: {},
    helperReviews: {},
    scouts: [],
    scoutContacts: {},
    scoutReviews: {},
    scoutLedgers: {},
    orders: [],
    featuredRequests: [],
    withdrawals: [],
    helperUnlocks: [],
    scoutUnlocks: [],
    scoutBookings: [],
    partnerAccounts: [],
    serviceSubmissions: [],
    vendorAdminBalance: 0,
  };

  private emit() {
    this.subscribers.forEach((cb) => {
      try {
        cb(this.snapshot);
      } catch (err) {
        console.error('UniNestFirebase subscriber error:', err);
      }
    });
  }

  public subscribe(cb: (snap: UniNestCloudSnapshot) => void): () => void {
    this.subscribers.add(cb);
    cb(this.snapshot);
    return () => this.subscribers.delete(cb);
  }

  public async init() {
    this.snapshot.connected = await testConnection();
    this.attachPublicListeners();
    onAuthStateChanged(auth, async (fbUser: User | null) => {
      this.clearAuthListeners();
      if (!fbUser) {
        this.snapshot.user = null;
        this.snapshot.helperContacts = {};
        this.snapshot.scoutContacts = {};
        this.snapshot.orders = [];
        this.snapshot.featuredRequests = [];
        this.snapshot.withdrawals = [];
        this.snapshot.helperUnlocks = [];
        this.snapshot.scoutUnlocks = [];
        this.snapshot.scoutBookings = [];
        this.snapshot.partnerAccounts = [];
        this.snapshot.serviceSubmissions = [];
        this.snapshot.authReady = true;
        this.emit();
        return;
      }

      const isAdmin = await this.checkIsAdmin(fbUser);
      this.snapshot.user = {
        uid: fbUser.uid,
        email: fbUser.email || '',
        displayName: fbUser.displayName || fbUser.email || 'UniNest User',
        emailVerified: Boolean(fbUser.emailVerified),
        isAdmin,
      };
      this.snapshot.authReady = true;
      this.attachAuthenticatedListeners(fbUser.uid, isAdmin);
      this.emit();
    });
  }

  private async checkIsAdmin(fbUser: User): Promise<boolean> {
    if (fbUser.email === 'amaechihellis@gmail.com' && fbUser.emailVerified) {
      return true;
    }
    try {
      const adminDoc = await getDoc(doc(db, 'admins', fbUser.uid));
      return adminDoc.exists();
    } catch {
      return false;
    }
  }

  private clearAuthListeners() {
    this.authUnsubs.forEach((u) => u());
    this.authUnsubs = [];
  }

  private attachPublicListeners() {
    this.unsubs.forEach((u) => u());
    this.unsubs = [];

    this.unsubs.push(
      onSnapshot(
        collection(db, 'vendors'),
        (snap) => {
          this.snapshot.vendors = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
          this.emit();
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'vendors')
      )
    );

    this.unsubs.push(
      onSnapshot(
        collection(db, 'products'),
        (snap) => {
          this.snapshot.products = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
          this.emit();
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'products')
      )
    );

    this.unsubs.push(
      onSnapshot(
        collection(db, 'project_helpers'),
        (snap) => {
          const list = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
          this.snapshot.projectHelpers = list;
          list.forEach((h) => this.listenReviews('helper', h.id));
          this.emit();
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'project_helpers')
      )
    );

    this.unsubs.push(
      onSnapshot(
        collection(db, 'scouts'),
        (snap) => {
          const list = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
          this.snapshot.scouts = list;
          list.forEach((s) => this.listenReviews('scout', s.id));
          this.emit();
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'scouts')
      )
    );
  }

  private reviewListening = new Set<string>();
  private listenReviews(kind: 'helper' | 'scout', targetId: string) {
    const key = `${kind}:${targetId}`;
    if (this.reviewListening.has(key)) return;
    this.reviewListening.add(key);

    const parentCol = kind === 'helper' ? 'project_helpers' : 'scouts';
    const path = `${parentCol}/${targetId}/reviews`;
    this.unsubs.push(
      onSnapshot(
        collection(db, parentCol, targetId, 'reviews'),
        (snap) => {
          const revs = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
          if (kind === 'helper') {
            this.snapshot.helperReviews[targetId] = revs;
          } else {
            this.snapshot.scoutReviews[targetId] = revs;
          }
          this.emit();
        },
        (err) => handleFirestoreError(err, OperationType.LIST, path)
      )
    );
  }

  private attachAuthenticatedListeners(uid: string, isAdmin: boolean) {
    // Platform Stats Summary
    this.authUnsubs.push(
      onSnapshot(
        doc(db, 'platform_stats', 'summary'),
        (snap) => {
          if (snap.exists()) {
            this.snapshot.vendorAdminBalance = Number(snap.data().vendorAdminBalance || 0);
            this.emit();
          }
        },
        (err) => handleFirestoreError(err, OperationType.GET, 'platform_stats/summary')
      )
    );

    // Orders (Admins see all; buyers see their own; linked vendors see theirs)
    if (isAdmin) {
      this.authUnsubs.push(
        onSnapshot(
          collection(db, 'orders'),
          (snap) => {
            this.snapshot.orders = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
            this.emit();
          },
          (err) => handleFirestoreError(err, OperationType.LIST, 'orders')
        )
      );
    } else {
      let buyerOrders: Record<string, any>[] = [];
      let vendorOrders: Record<string, any>[] = [];
      const mergeOrders = () => {
        const map = new Map<string, Record<string, any>>();
        [...buyerOrders, ...vendorOrders].forEach((o) => map.set(o.id, o));
        this.snapshot.orders = Array.from(map.values());
        this.emit();
      };
      this.authUnsubs.push(
        onSnapshot(
          query(collection(db, 'orders'), where('buyerUid', '==', uid)),
          (snap) => {
            buyerOrders = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
            mergeOrders();
          },
          (err) => handleFirestoreError(err, OperationType.LIST, 'orders')
        )
      );
      this.authUnsubs.push(
        onSnapshot(
          query(collection(db, 'orders'), where('vendorOwnerUid', '==', uid)),
          (snap) => {
            vendorOrders = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
            mergeOrders();
          },
          (err) => handleFirestoreError(err, OperationType.LIST, 'orders')
        )
      );
    }

    // Featured Requests
    const featQ = isAdmin
      ? collection(db, 'featured_requests')
      : query(collection(db, 'featured_requests'), where('requesterUid', '==', uid));
    this.authUnsubs.push(
      onSnapshot(
        featQ,
        (snap) => {
          this.snapshot.featuredRequests = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
          this.emit();
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'featured_requests')
      )
    );

    // Withdrawals
    const wdQ = isAdmin
      ? collection(db, 'withdrawals')
      : query(collection(db, 'withdrawals'), where('requesterUid', '==', uid));
    this.authUnsubs.push(
      onSnapshot(
        wdQ,
        (snap) => {
          this.snapshot.withdrawals = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
          this.emit();
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'withdrawals')
      )
    );

    // Helper Unlocks (+ auto fetch unlocked private contact!)
    const huQ = isAdmin
      ? collection(db, 'helper_unlocks')
      : query(collection(db, 'helper_unlocks'), where('studentUid', '==', uid));
    this.authUnsubs.push(
      onSnapshot(
        huQ,
        async (snap) => {
          const unlocks = snap.docs.map((d) => ({ ...d.data(), id: d.id })) as Record<string, any>[];
          this.snapshot.helperUnlocks = unlocks;
          for (const u of unlocks) {
            if (u.status === 'confirmed' && u.helperId && !this.snapshot.helperContacts[u.helperId]) {
              await this.fetchPrivateContact('helper', u.helperId);
            }
          }
          this.emit();
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'helper_unlocks')
      )
    );

    // Scout Unlocks (+ auto fetch unlocked private contact!)
    const suQ = isAdmin
      ? collection(db, 'scout_unlocks')
      : query(collection(db, 'scout_unlocks'), where('studentUid', '==', uid));
    this.authUnsubs.push(
      onSnapshot(
        suQ,
        async (snap) => {
          const unlocks = snap.docs.map((d) => ({ ...d.data(), id: d.id })) as Record<string, any>[];
          this.snapshot.scoutUnlocks = unlocks;
          for (const u of unlocks) {
            if (u.status === 'confirmed' && u.scoutId && !this.snapshot.scoutContacts[u.scoutId]) {
              await this.fetchPrivateContact('scout', u.scoutId);
            }
          }
          this.emit();
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'scout_unlocks')
      )
    );

    // Scout Bookings (Admins see all; freshers see own; assigned scouts see theirs)
    if (isAdmin) {
      this.authUnsubs.push(
        onSnapshot(
          collection(db, 'scout_bookings'),
          (snap) => {
            this.snapshot.scoutBookings = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
            this.emit();
          },
          (err) => handleFirestoreError(err, OperationType.LIST, 'scout_bookings')
        )
      );
    } else {
      let fresherBookings: Record<string, any>[] = [];
      let assignedBookings: Record<string, any>[] = [];
      const mergeBookings = () => {
        const map = new Map<string, Record<string, any>>();
        [...fresherBookings, ...assignedBookings].forEach((b) => map.set(b.id, b));
        this.snapshot.scoutBookings = Array.from(map.values());
        this.emit();
      };
      this.authUnsubs.push(
        onSnapshot(
          query(collection(db, 'scout_bookings'), where('fresherUid', '==', uid)),
          (snap) => {
            fresherBookings = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
            mergeBookings();
          },
          (err) => handleFirestoreError(err, OperationType.LIST, 'scout_bookings')
        )
      );
      this.authUnsubs.push(
        onSnapshot(
          query(collection(db, 'scout_bookings'), where('assignedScoutOwnerUid', '==', uid)),
          (snap) => {
            assignedBookings = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
            mergeBookings();
          },
          (err) => handleFirestoreError(err, OperationType.LIST, 'scout_bookings')
        )
      );
    }

    // Partner Accounts
    const paQ = isAdmin
      ? collection(db, 'partner_accounts')
      : query(collection(db, 'partner_accounts'), where('ownerUid', '==', uid));
    this.authUnsubs.push(
      onSnapshot(
        paQ,
        (snap) => {
          this.snapshot.partnerAccounts = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
          this.emit();
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'partner_accounts')
      )
    );

    // Service Submissions
    const subQ = isAdmin
      ? collection(db, 'service_submissions')
      : query(collection(db, 'service_submissions'), where('submitterUid', '==', uid));
    this.authUnsubs.push(
      onSnapshot(
        subQ,
        (snap) => {
          this.snapshot.serviceSubmissions = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
          this.emit();
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'service_submissions')
      )
    );

    if (isAdmin) {
      // Load private contacts & scout ledgers for admin dashboards
      this.snapshot.projectHelpers.forEach((h) => void this.fetchPrivateContact('helper', h.id));
      this.snapshot.scouts.forEach((s) => {
        void this.fetchPrivateContact('scout', s.id);
        this.listenScoutLedger(s.id);
      });
    }
  }

  private ledgerListening = new Set<string>();
  private listenScoutLedger(scoutId: string) {
    if (this.ledgerListening.has(scoutId)) return;
    this.ledgerListening.add(scoutId);
    const path = `scouts/${scoutId}/ledger`;
    this.authUnsubs.push(
      onSnapshot(
        collection(db, 'scouts', scoutId, 'ledger'),
        (snap) => {
          this.snapshot.scoutLedgers[scoutId] = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
          this.emit();
        },
        (err) => handleFirestoreError(err, OperationType.LIST, path)
      )
    );
  }

  public async fetchPrivateContact(kind: 'helper' | 'scout', entityId: string) {
    const col = kind === 'helper' ? 'project_helpers' : 'scouts';
    const path = `${col}/${entityId}/private/contact`;
    try {
      const snap = await getDoc(doc(db, col, entityId, 'private', 'contact'));
      if (snap.exists()) {
        if (kind === 'helper') {
          this.snapshot.helperContacts[entityId] = snap.data();
        } else {
          this.snapshot.scoutContacts[entityId] = snap.data();
        }
        this.emit();
      }
    } catch (err) {
      // Expected if user is not yet confirmed for unlock; still report non-permission issues
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes('permission') && !msg.includes('PERMISSION_DENIED')) {
        handleFirestoreError(err, OperationType.GET, path);
      }
    }
  }

  public async ensureGoogleAuth(): Promise<User> {
    if (auth.currentUser && auth.currentUser.emailVerified) {
      return auth.currentUser;
    }
    const u = await signInWithGoogle();
    return u;
  }

  public async signInGoogle(): Promise<User> {
    return signInWithGoogle();
  }

  public async signOutGoogle(): Promise<void> {
    return signOutGoogle();
  }

  // Idempotent Admin Seed if Firestore collections are empty
  public async seedDefaultDataIfEmpty(defaultState: any): Promise<boolean> {
    if (this.seededThisSession || !auth.currentUser || !this.snapshot.user?.isAdmin) {
      return false;
    }
    this.seededThisSession = true;
    try {
      const existingVendors = await getDocs(collection(db, 'vendors'));
      if (!existingVendors.empty) {
        // Ensure department admin credential docs exist if added later, without overwriting rotated codes
        const deptAdmins = (defaultState.accounts || []).filter((a: any) =>
          ['vendor_admin', 'scout_admin', 'project_helper_admin'].includes(a.role)
        );
        for (const acc of deptAdmins) {
          const accId = sanitizeId(acc.id);
          const accRef = doc(db, 'partner_accounts', accId);
          const existingAcc = await getDoc(accRef);
          if (!existingAcc.exists()) {
            const b = writeBatch(db);
            b.set(accRef, {
              id: accId,
              ownerUid: '',
              role: acc.role,
              name: clampStr(acc.name, strMax('PartnerAccount', 'name', 120), 'Admin'),
              loginName: clampStr(acc.loginName, 60, 'admin'),
              code: clampStr(acc.code, 60, 'ADMIN-01'),
              location: clampStr(acc.location || '', 160),
              university: clampStr(acc.university || '', 120),
              helperId: '',
              avatar: clampStr(acc.avatar || '', 250000),
              balance: 0,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            const hash = await sha256Hex(`${String(acc.loginName || '').trim().toLowerCase()}:${String(acc.code || '').trim()}`);
            b.set(doc(db, 'partner_auth', hash), {
              id: hash,
              accountId: accId,
              role: acc.role,
              name: clampStr(acc.name, 120, 'Admin'),
              location: clampStr(acc.location || '', 160),
              university: clampStr(acc.university || '', 120),
              helperId: '',
              updatedAt: serverTimestamp(),
            });
            await b.commit();
          }
        }
        return false;
      }

      const batch = writeBatch(db);

      // Stats
      batch.set(doc(db, 'platform_stats', 'summary'), {
        id: 'summary',
        vendorAdminBalance: nonNegNum(defaultState.vendorAdminBalance, 0),
        totalConfirmedOrders: 0,
        updatedAt: serverTimestamp(),
      });

      // Partner accounts + vendors + scouts + partner_auth
      for (const acc of defaultState.accounts || []) {
        const accId = sanitizeId(acc.id);
        batch.set(doc(db, 'partner_accounts', accId), {
          id: accId,
          ownerUid: '',
          role: acc.role,
          name: clampStr(acc.name, strMax('PartnerAccount', 'name', 120), 'Partner'),
          loginName: clampStr(acc.loginName, 60, 'partner'),
          code: clampStr(acc.code, 60, 'CODE-0000'),
          location: clampStr(acc.location || '', 160),
          university: clampStr(acc.university || '', 120),
          helperId: clampStr(acc.helperId || '', 128),
          avatar: clampStr(acc.avatar || '', 250000),
          balance: nonNegNum(acc.balance, 0),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        const hash = await sha256Hex(`${String(acc.loginName || '').trim().toLowerCase()}:${String(acc.code || '').trim()}`);
        batch.set(doc(db, 'partner_auth', hash), {
          id: hash,
          accountId: accId,
          role: acc.role,
          name: clampStr(acc.name, 120, 'Partner'),
          location: clampStr(acc.location || '', 160),
          university: clampStr(acc.university || '', 120),
          helperId: clampStr(acc.helperId || '', 128),
          updatedAt: serverTimestamp(),
        });

        if (acc.role === 'vendor') {
          batch.set(doc(db, 'vendors', accId), {
            id: accId,
            ownerUid: '',
            name: clampStr(acc.name, 120, 'Vendor'),
            university: clampStr(acc.university || acc.location || 'Nigerian University', 120),
            location: clampStr(acc.location || 'Campus', 160),
            shopTagline: clampStr(acc.shopTagline || 'Verified UniNest Marketplace vendor shop.', 300),
            avatar: clampStr(acc.avatar || '', 250000),
            isFeatured: Boolean(acc.isFeatured),
            featuredPlan: clampStr(acc.featuredPlan || '', 80),
            featuredUntil: clampStr(acc.featuredUntil || '', 60),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }

        if (acc.role === 'scout') {
          const phone = clampStr(acc.phone || '+234 903 984 7154', 40);
          const masked = phone.length >= 8 ? `${phone.slice(0, 8)} ••• ••${phone.slice(-2)}` : '+234 *** ****';
          batch.set(doc(db, 'scouts', accId), {
            id: accId,
            ownerUid: '',
            name: clampStr(acc.name, 120, 'Campus Scout'),
            location: clampStr(acc.location || 'UniNest Campus', 120),
            specialty: clampStr(acc.specialty || 'Clearance & Campus Support', 200),
            photo: clampStr(acc.avatar || '/images/uninest_brand_ambassador_1788917779386.jpg', 250000),
            bio: clampStr(acc.bio || 'Verified UniNest Campus Scout.', 600),
            maskedPhone: masked,
            unlockFee: posNum(acc.unlockFee, 3000),
            jobsCompleted: nonNegNum(acc.jobsCompleted, 0),
            active: acc.active !== false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          batch.set(doc(db, 'scouts', accId, 'private', 'contact'), {
            id: 'contact',
            phone,
            whatsapp: clampStr(String(acc.whatsapp || phone).replace(/\D/g, '') || '2349039847154', 30),
            updatedAt: serverTimestamp(),
          });
          for (const r of acc.reviews || []) {
            const revId = sanitizeId(r.id);
            batch.set(doc(db, 'scouts', accId, 'reviews', revId), {
              id: revId,
              targetId: accId,
              authorUid: auth.currentUser.uid,
              author: clampStr(r.author, 80, 'Student'),
              rating: Math.min(5, Math.max(1, Number(r.rating || 5))),
              text: clampStr(r.text, 1000, 'Verified guide.'),
              dateLabel: clampStr(r.date || 'Nov 2026', 40),
              createdAt: serverTimestamp(),
            });
          }
          for (const tx of acc.history || []) {
            const txId = sanitizeId(tx.id);
            batch.set(doc(db, 'scouts', accId, 'ledger', txId), {
              id: txId,
              scoutId: accId,
              dateLabel: clampStr(tx.date || 'Recent', 40),
              amount: posNum(tx.amount, 1),
              balanceAfter: nonNegNum(tx.balanceAfter, 0),
              channel: clampStr(tx.channel || 'UBA · 2150445461', 80),
              note: clampStr(tx.note || 'Scout Earnings', 200),
              type: tx.type === 'debit' ? 'debit' : 'credit',
              createdAt: serverTimestamp(),
            });
          }
        }
      }

      // Products
      for (const p of defaultState.products || []) {
        const pid = sanitizeId(p.id);
        batch.set(doc(db, 'products', pid), {
          id: pid,
          vendorId: sanitizeId(p.vendorId),
          vendorOwnerUid: '',
          title: clampStr(p.title, 140, 'Product'),
          category: p.category || 'Food',
          vendorPrice: posNum(p.vendorPrice, 500),
          price: posNum(p.price, 550),
          image: clampStr(p.image || '/images/market_phone_gadget_1795463098991.jpg', 250000),
          description: clampStr(p.description || '', 600),
          status: p.status === 'removed' ? 'removed' : 'published',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      // Project Helpers
      for (const h of defaultState.projectHelpers || []) {
        const hid = sanitizeId(h.id);
        const phone = clampStr(h.phone || '+234 903 984 7154', 40);
        const masked = phone.length >= 8 ? `${phone.slice(0, 8)} ••• ••${phone.slice(-2)}` : '+234 *** ****';
        batch.set(doc(db, 'project_helpers', hid), {
          id: hid,
          ownerUid: '',
          name: clampStr(h.name, 120, 'Project Helper'),
          specialty: clampStr(h.specialty, 200, 'Academic Research'),
          campus: clampStr(h.campus, 120, 'Nigerian University'),
          photo: clampStr(h.photo || '/images/uninest_brand_rep_1789411622796.jpg', 250000),
          bio: clampStr(h.bio || '', 600),
          maskedPhone: masked,
          unlockFee: posNum(h.unlockFee, 5000),
          active: h.active !== false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        batch.set(doc(db, 'project_helpers', hid, 'private', 'contact'), {
          id: 'contact',
          phone,
          whatsapp: clampStr(String(h.whatsapp || phone).replace(/\D/g, '') || '2349039847154', 30),
          email: clampStr(h.email || 'academicdesk@uninestnigeria.com', 150),
          updatedAt: serverTimestamp(),
        });
        for (const r of h.reviews || []) {
          const rid = sanitizeId(r.id);
          batch.set(doc(db, 'project_helpers', hid, 'reviews', rid), {
            id: rid,
            targetId: hid,
            authorUid: auth.currentUser.uid,
            author: clampStr(r.author, 80, 'Student'),
            rating: Math.min(5, Math.max(1, Number(r.rating || 5))),
            text: clampStr(r.text, 1000, 'Verified guidance.'),
            dateLabel: clampStr(r.date || 'Nov 2026', 40),
            createdAt: serverTimestamp(),
          });
        }
      }

      // Withdrawals
      for (const w of defaultState.withdrawals || []) {
        const wid = sanitizeId(w.id);
        batch.set(doc(db, 'withdrawals', wid), {
          id: wid,
          requesterUid: auth.currentUser.uid,
          vendorId: sanitizeId(w.vendorId),
          vendorName: clampStr(w.vendorName, 120, 'Vendor'),
          location: clampStr(w.location || '', 160),
          amount: posNum(w.amount, 1000),
          bank: clampStr(w.bank, 180, 'Bank Account'),
          status: w.status || 'pending',
          createdDateLabel: clampStr(w.createdAt || 'Today', 40),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      // Scout Requests
      for (const sr of defaultState.scoutRequests || []) {
        const srid = sanitizeId(sr.id);
        batch.set(doc(db, 'scout_bookings', srid), {
          id: srid,
          fresherUid: auth.currentUser.uid,
          fresherName: clampStr(sr.fresherName, 120, 'Fresher'),
          phone: clampStr(sr.phone, 40, '08000000000'),
          university: clampStr(sr.university, 120, 'University'),
          faculty: clampStr(sr.faculty, 160, '100L'),
          task: clampStr(sr.task, 200, 'Campus Clearance'),
          preferredDate: clampStr(sr.preferredDate, 80, 'Morning'),
          notes: clampStr(sr.notes || '', 500),
          paymentRef: clampStr(sr.paymentRef, 160, 'UBA Transfer'),
          amount: posNum(sr.amount, 3000),
          assignedScoutId: sr.assignedScoutId ? sanitizeId(sr.assignedScoutId) : '',
          assignedScoutOwnerUid: '',
          paymentStatus: sr.status === 'paid_pending' ? 'pending_confirmation' : 'confirmed',
          status: sr.status || 'pending_confirmation',
          createdDateLabel: clampStr(sr.createdAt || 'Today', 40),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      await batch.commit();
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'seed_initial_state');
    }
  }

  public async verifyPartnerCredentials(loginName: string, code: string) {
    if (!auth.currentUser) return null;
    const hash = await sha256Hex(`${loginName.trim().toLowerCase()}:${code.trim()}`);
    const path = `partner_auth/${hash}`;
    try {
      const snap = await getDoc(doc(db, 'partner_auth', hash));
      return snap.exists() ? snap.data() : null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
    }
  }

  // ---------------- CUSTOMER SUBMISSIONS (ALL ENTER PENDING ADMIN CONFIRMATION) ----------------
  public async submitOrders(orders: any[]): Promise<void> {
    const u = auth.currentUser;
    if (!u) return;
    const batch = writeBatch(db);
    for (const o of orders) {
      const oid = sanitizeId(o.id);
      batch.set(doc(db, 'orders', oid), {
        id: oid,
        batchId: clampStr(o.batchId || '', 128),
        buyerUid: u.uid,
        productId: sanitizeId(o.productId || 'prod_item'),
        productTitle: clampStr(o.productTitle, strMax('Order', 'productTitle', 140), 'Product'),
        vendorId: sanitizeId(o.vendorId),
        vendorName: clampStr(o.vendorName, 120, 'UniNest Vendor'),
        vendorOwnerUid: clampStr(o.vendorOwnerUid || '', 128),
        qty: posNum(o.qty, 1),
        total: posNum(o.total, 1),
        vendorShare: nonNegNum(o.vendorShare, 0),
        adminCommission: nonNegNum(o.adminCommission, 0),
        customerName: clampStr(o.customerName, 120, 'Customer'),
        customerPhone: clampStr(o.customerPhone, 40, '08000000000'),
        customerLocation: clampStr(o.customerLocation, 200, 'Campus'),
        deliveryWindow: clampStr(o.deliveryWindow, 80, '2 - 3 Days Delivery'),
        paymentRef: clampStr(o.paymentRef, 160, 'Transfer'),
        paymentStatus: 'pending_confirmation',
        createdDateLabel: clampStr(o.createdAt || 'Today', 40),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    try {
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'orders');
    }
  }

  public async submitHelperUnlock(payload: {
    helperId: string;
    helperName: string;
    studentName: string;
    studentPhone: string;
    paymentRef: string;
    amount: number;
    createdDateLabel: string;
  }): Promise<void> {
    const u = auth.currentUser;
    if (!u) return;
    const hid = sanitizeId(payload.helperId);
    const unlockId = `${u.uid}__${hid}`;
    const path = `helper_unlocks/${unlockId}`;
    const ref = doc(db, 'helper_unlocks', unlockId);
    try {
      const existingSnap = await getDoc(ref);
      if (existingSnap.exists()) {
        if (existingSnap.data().status === 'rejected') {
          await updateDoc(ref, {
            paymentRef: clampStr(payload.paymentRef, 160, 'Transfer'),
            status: 'pending_confirmation',
            updatedAt: serverTimestamp(),
          });
        }
        return;
      }
      await setDoc(ref, {
        id: unlockId,
        studentUid: u.uid,
        helperId: hid,
        helperName: clampStr(payload.helperName, 120, 'Helper'),
        studentName: clampStr(payload.studentName, 120, 'Student'),
        studentPhone: clampStr(payload.studentPhone, 40, '08000000000'),
        paymentRef: clampStr(payload.paymentRef, 160, 'Transfer'),
        amount: posNum(payload.amount, 5000),
        status: 'pending_confirmation',
        createdDateLabel: clampStr(payload.createdDateLabel || 'Today', 40),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  }

  public async submitScoutUnlockAndBooking(payload: {
    scoutId: string;
    scoutName: string;
    scoutLocation: string;
    scoutOwnerUid?: string;
    studentName: string;
    studentPhone: string;
    task: string;
    paymentRef: string;
    amount: number;
    bookingId: string;
    createdDateLabel: string;
  }): Promise<void> {
    const u = auth.currentUser;
    if (!u) return;
    const sid = sanitizeId(payload.scoutId);
    const unlockId = `${u.uid}__${sid}`;
    const bid = sanitizeId(payload.bookingId);
    const unlockRef = doc(db, 'scout_unlocks', unlockId);
    try {
      const existingUnlock = await getDoc(unlockRef);
      const batch = writeBatch(db);
      if (existingUnlock.exists()) {
        if (existingUnlock.data().status === 'rejected') {
          batch.update(unlockRef, {
            paymentRef: clampStr(payload.paymentRef, 160, 'Transfer'),
            task: clampStr(payload.task, 240, 'School Clearance'),
            status: 'pending_confirmation',
            updatedAt: serverTimestamp(),
          });
        }
      } else {
        batch.set(unlockRef, {
          id: unlockId,
          studentUid: u.uid,
          scoutId: sid,
          scoutName: clampStr(payload.scoutName, 120, 'Campus Scout'),
          studentName: clampStr(payload.studentName, 120, 'Fresher'),
          studentPhone: clampStr(payload.studentPhone, 40, '08000000000'),
          task: clampStr(payload.task, 240, 'School Clearance'),
          paymentRef: clampStr(payload.paymentRef, 160, 'Transfer'),
          amount: posNum(payload.amount, 3000),
          status: 'pending_confirmation',
          createdDateLabel: clampStr(payload.createdDateLabel || 'Today', 40),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      batch.set(doc(db, 'scout_bookings', bid), {
        id: bid,
        fresherUid: u.uid,
        fresherName: clampStr(payload.studentName, 120, 'Fresher'),
        phone: clampStr(payload.studentPhone, 40, '08000000000'),
        university: clampStr(payload.scoutLocation || 'UniNest Campus', 120),
        faculty: clampStr(payload.task, 160, 'Clearance'),
        task: clampStr(`Direct Scout Unlock (${payload.scoutName.split(' ')[0]})`, 200),
        preferredDate: 'Direct Schedule',
        notes: clampStr(payload.task, 500),
        paymentRef: clampStr(payload.paymentRef, 160, 'Transfer'),
        amount: posNum(payload.amount, 3000),
        assignedScoutId: sid,
        assignedScoutOwnerUid: clampStr(payload.scoutOwnerUid || '', 128),
        paymentStatus: 'pending_confirmation',
        status: 'pending_confirmation',
        createdDateLabel: clampStr(payload.createdDateLabel || 'Today', 40),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'scout_unlocks_and_bookings');
    }
  }

  public async submitCustomScoutBooking(booking: any): Promise<void> {
    const u = auth.currentUser;
    if (!u) return;
    const bid = sanitizeId(booking.id);
    const path = `scout_bookings/${bid}`;
    try {
      await setDoc(doc(db, 'scout_bookings', bid), {
        id: bid,
        fresherUid: u.uid,
        fresherName: clampStr(booking.fresherName, 120, 'Fresher'),
        phone: clampStr(booking.phone, 40, '08000000000'),
        university: clampStr(booking.university, 120, 'University'),
        faculty: clampStr(booking.faculty, 160, 'Faculty'),
        task: clampStr(booking.task, 200, 'Clearance'),
        preferredDate: clampStr(booking.preferredDate, 80, 'Morning'),
        notes: clampStr(booking.notes || '', 500),
        paymentRef: clampStr(booking.paymentRef, 160, 'Transfer'),
        amount: posNum(booking.amount, 3000),
        assignedScoutId: '',
        assignedScoutOwnerUid: '',
        paymentStatus: 'pending_confirmation',
        status: 'pending_confirmation',
        createdDateLabel: clampStr(booking.createdAt || 'Today', 40),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  }

  public async submitReview(
    kind: 'helper' | 'scout',
    targetId: string,
    review: { id: string; author: string; rating: number; text: string; date: string }
  ): Promise<void> {
    const u = auth.currentUser;
    if (!u) return;
    const parentCol = kind === 'helper' ? 'project_helpers' : 'scouts';
    const tid = sanitizeId(targetId);
    const rid = sanitizeId(review.id);
    const path = `${parentCol}/${tid}/reviews/${rid}`;
    try {
      await setDoc(doc(db, parentCol, tid, 'reviews', rid), {
        id: rid,
        targetId: tid,
        authorUid: u.uid,
        author: clampStr(review.author, 80, 'Student'),
        rating: Math.min(5, Math.max(1, Number(review.rating || 5))),
        text: clampStr(review.text, 1000, 'Helpful guidance.'),
        dateLabel: clampStr(review.date || 'Recent', 40),
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  }

  public async submitServiceForm(payload: {
    id: string;
    serviceType: 'sts' | 'project-work' | 'student-jobs' | 'market-orders' | 'inquiry';
    studentName: string;
    phone: string;
    school: string;
    departmentOrLevel: string;
    summary: string;
    createdDateLabel: string;
  }): Promise<void> {
    const u = auth.currentUser;
    if (!u) return;
    const sid = sanitizeId(payload.id);
    const assignedAdminRole =
      payload.serviceType === 'project-work'
        ? 'project_helper_admin'
        : payload.serviceType === 'market-orders'
          ? 'vendor_admin'
          : 'scout_admin';
    const path = `service_submissions/${sid}`;
    try {
      await setDoc(doc(db, 'service_submissions', sid), {
        id: sid,
        submitterUid: u.uid,
        serviceType: payload.serviceType,
        assignedAdminRole,
        studentName: clampStr(payload.studentName, 120, 'Student'),
        phone: clampStr(payload.phone, 40, '08000000000'),
        school: clampStr(payload.school, 120, 'Campus'),
        departmentOrLevel: clampStr(payload.departmentOrLevel || '', 160),
        summary: clampStr(payload.summary, 800, 'Submitted online.'),
        status: 'pending_review',
        createdDateLabel: clampStr(payload.createdDateLabel || 'Today', 40),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  }

  // ---------------- RESPONSIBLE ADMIN CONFIRMATION ACTIONS ----------------
  public async confirmOrderPayment(order: any, nextStatus: 'confirmed' | 'rejected'): Promise<void> {
    if (!auth.currentUser) return;
    const oid = sanitizeId(order.id);
    const vid = sanitizeId(order.vendorId);
    const batch = writeBatch(db);
    batch.update(doc(db, 'orders', oid), {
      paymentStatus: nextStatus,
      updatedAt: serverTimestamp(),
    });
    if (nextStatus === 'confirmed') {
      const vShare = nonNegNum(order.vendorShare, 0);
      const aFee = nonNegNum(order.adminCommission, 0);
      if (vShare > 0) {
        batch.update(doc(db, 'partner_accounts', vid), {
          balance: increment(vShare),
          updatedAt: serverTimestamp(),
        });
      }
      batch.set(
        doc(db, 'platform_stats', 'summary'),
        {
          id: 'summary',
          vendorAdminBalance: increment(aFee),
          totalConfirmedOrders: increment(1),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
    try {
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${oid}`);
    }
  }

  public async submitFeaturedRequest(req: any): Promise<void> {
    const u = auth.currentUser;
    if (!u) return;
    const rid = sanitizeId(req.id);
    const path = `featured_requests/${rid}`;
    try {
      await setDoc(doc(db, 'featured_requests', rid), {
        id: rid,
        requesterUid: u.uid,
        vendorId: sanitizeId(req.vendorId),
        vendorName: clampStr(req.vendorName, 120, 'Vendor'),
        plan: clampStr(req.plan, 80, '7-Day Top Vendor'),
        amount: posNum(req.amount, 3500),
        method: clampStr(req.method, 80, 'UBA 2150445461 Transfer'),
        paymentRef: clampStr(req.paymentRef || '', 160),
        status: 'pending_confirmation',
        dateLabel: clampStr(req.date || 'Today', 40),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  }

  public async confirmFeaturedRequest(req: any, nextStatus: 'confirmed' | 'rejected'): Promise<void> {
    if (!auth.currentUser) return;
    const rid = sanitizeId(req.id);
    const vid = sanitizeId(req.vendorId);
    const batch = writeBatch(db);
    batch.update(doc(db, 'featured_requests', rid), {
      status: nextStatus,
      updatedAt: serverTimestamp(),
    });
    if (nextStatus === 'confirmed') {
      const days = Number(req.amount || 0) >= 10000 ? 30 : 7;
      const until = new Date(Date.now() + days * 86400000).toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      batch.update(doc(db, 'vendors', vid), {
        isFeatured: true,
        featuredPlan: clampStr(req.plan, 80),
        featuredUntil: until,
        updatedAt: serverTimestamp(),
      });
      if (String(req.method || '').toLowerCase().includes('wallet')) {
        batch.update(doc(db, 'partner_accounts', vid), {
          balance: increment(-Math.abs(Number(req.amount || 0))),
          updatedAt: serverTimestamp(),
        });
      }
    }
    try {
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `featured_requests/${rid}`);
    }
  }

  public async submitWithdrawal(wd: any): Promise<void> {
    const u = auth.currentUser;
    if (!u) return;
    const wid = sanitizeId(wd.id);
    const path = `withdrawals/${wid}`;
    try {
      await setDoc(doc(db, 'withdrawals', wid), {
        id: wid,
        requesterUid: u.uid,
        vendorId: sanitizeId(wd.vendorId),
        vendorName: clampStr(wd.vendorName, 120, 'Vendor'),
        location: clampStr(wd.location || '', 160),
        amount: posNum(wd.amount, 1000),
        bank: clampStr(wd.bank, 180, 'Bank'),
        status: 'pending',
        createdDateLabel: clampStr(wd.createdAt || 'Just now', 40),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  }

  public async decideWithdrawal(wd: any, decision: 'approved' | 'rejected'): Promise<void> {
    if (!auth.currentUser) return;
    const wid = sanitizeId(wd.id);
    const vid = sanitizeId(wd.vendorId);
    const batch = writeBatch(db);
    batch.update(doc(db, 'withdrawals', wid), {
      status: decision,
      updatedAt: serverTimestamp(),
    });
    if (decision === 'approved') {
      batch.update(doc(db, 'partner_accounts', vid), {
        balance: increment(-Math.abs(Number(wd.amount || 0))),
        updatedAt: serverTimestamp(),
      });
    }
    try {
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `withdrawals/${wid}`);
    }
  }

  public async confirmHelperUnlock(unlock: any, nextStatus: 'confirmed' | 'rejected'): Promise<void> {
    if (!auth.currentUser) return;
    const uid = sanitizeId(unlock.id);
    const path = `helper_unlocks/${uid}`;
    try {
      await updateDoc(doc(db, 'helper_unlocks', uid), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  }

  public async confirmScoutUnlock(unlock: any, nextStatus: 'confirmed' | 'rejected'): Promise<void> {
    if (!auth.currentUser) return;
    const uid = sanitizeId(unlock.id);
    const path = `scout_unlocks/${uid}`;
    try {
      await updateDoc(doc(db, 'scout_unlocks', uid), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  }

  public async confirmScoutBookingPayment(booking: any, nextStatus: 'confirmed' | 'rejected'): Promise<void> {
    if (!auth.currentUser) return;
    const bid = sanitizeId(booking.id);
    const path = `scout_bookings/${bid}`;
    try {
      const nextBookingStatus =
        nextStatus === 'rejected'
          ? 'rejected'
          : booking.assignedScoutId
            ? 'assigned'
            : 'paid_pending';
      await updateDoc(doc(db, 'scout_bookings', bid), {
        paymentStatus: nextStatus,
        status: nextBookingStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  }

  public async assignScoutBooking(bookingId: string, scout: any): Promise<void> {
    if (!auth.currentUser) return;
    const bid = sanitizeId(bookingId);
    const path = `scout_bookings/${bid}`;
    try {
      await updateDoc(doc(db, 'scout_bookings', bid), {
        assignedScoutId: scout ? sanitizeId(scout.id) : '',
        assignedScoutOwnerUid: scout ? clampStr(scout.ownerUid || '', 128) : '',
        status: scout ? 'assigned' : 'paid_pending',
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  }

  public async completeScoutBooking(booking: any, scoutAccount: any): Promise<void> {
    if (!auth.currentUser) return;
    const bid = sanitizeId(booking.id);
    const sid = sanitizeId(scoutAccount.id);
    const payout = 2500;
    const nextBal = nonNegNum(scoutAccount.balance, 0) + payout;
    const txId = sanitizeId(`stx-${Date.now()}`);
    const batch = writeBatch(db);
    batch.update(doc(db, 'scout_bookings', bid), {
      status: 'completed',
      assignedScoutId: sid,
      updatedAt: serverTimestamp(),
    });
    batch.update(doc(db, 'scouts', sid), {
      jobsCompleted: increment(1),
      updatedAt: serverTimestamp(),
    });
    batch.update(doc(db, 'partner_accounts', sid), {
      balance: nextBal,
      updatedAt: serverTimestamp(),
    });
    batch.set(doc(db, 'scouts', sid, 'ledger', txId), {
      id: txId,
      scoutId: sid,
      dateLabel: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      amount: payout,
      balanceAfter: nextBal,
      channel: 'On-site Fresher Escort',
      note: clampStr(`Completed clearance help for ${booking.fresherName}`, 200),
      type: 'credit',
      createdAt: serverTimestamp(),
    });
    try {
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `scout_bookings/${bid}`);
    }
  }

  public async updateServiceSubmissionStatus(subId: string, status: 'confirmed' | 'rejected'): Promise<void> {
    if (!auth.currentUser) return;
    const sid = sanitizeId(subId);
    try {
      await updateDoc(doc(db, 'service_submissions', sid), {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `service_submissions/${sid}`);
    }
  }

  // ---------------- CATALOG & ACCOUNT MUTATIONS ----------------
  public async addProduct(prod: any): Promise<void> {
    if (!auth.currentUser) return;
    const pid = sanitizeId(prod.id);
    const path = `products/${pid}`;
    try {
      await setDoc(doc(db, 'products', pid), {
        id: pid,
        vendorId: sanitizeId(prod.vendorId),
        vendorOwnerUid: clampStr(prod.vendorOwnerUid || '', 128),
        title: clampStr(prod.title, 140, 'Product'),
        category: prod.category || 'Food',
        vendorPrice: posNum(prod.vendorPrice, 500),
        price: posNum(prod.price, 550),
        image: clampStr(prod.image || '/images/market_phone_gadget_1795463098991.jpg', 250000),
        description: clampStr(prod.description || '', 600),
        status: 'published',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  }

  public async toggleProductStatus(prodId: string, nextStatus: 'published' | 'removed'): Promise<void> {
    if (!auth.currentUser) return;
    const pid = sanitizeId(prodId);
    try {
      await updateDoc(doc(db, 'products', pid), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `products/${pid}`);
    }
  }

  public async removeProduct(prodId: string): Promise<void> {
    if (!auth.currentUser) return;
    const pid = sanitizeId(prodId);
    try {
      await deleteDoc(doc(db, 'products', pid));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `products/${pid}`);
    }
  }

  public async addVendor(account: any): Promise<void> {
    if (!auth.currentUser) return;
    const vid = sanitizeId(account.id);
    const batch = writeBatch(db);
    batch.set(doc(db, 'vendors', vid), {
      id: vid,
      ownerUid: '',
      name: clampStr(account.name, 120, 'Vendor'),
      university: clampStr(account.university || account.location, 120, 'Campus'),
      location: clampStr(account.location, 160, 'Campus'),
      shopTagline: clampStr(account.shopTagline || `Verified shop serving ${account.university}.`, 300),
      avatar: clampStr(account.avatar || '/images/market_phone_gadget_1795463098991.jpg', 250000),
      isFeatured: false,
      featuredPlan: '',
      featuredUntil: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    batch.set(doc(db, 'partner_accounts', vid), {
      id: vid,
      ownerUid: '',
      role: 'vendor',
      name: clampStr(account.name, 120, 'Vendor'),
      loginName: clampStr(account.loginName, 60),
      code: clampStr(account.code, 60),
      location: clampStr(account.location, 160),
      university: clampStr(account.university, 120),
      helperId: '',
      avatar: clampStr(account.avatar || '/images/market_phone_gadget_1795463098991.jpg', 250000),
      balance: nonNegNum(account.balance, 0),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    const hash = await sha256Hex(`${String(account.loginName).trim().toLowerCase()}:${String(account.code).trim()}`);
    batch.set(doc(db, 'partner_auth', hash), {
      id: hash,
      accountId: vid,
      role: 'vendor',
      name: clampStr(account.name, 120, 'Vendor'),
      location: clampStr(account.location, 160),
      university: clampStr(account.university, 120),
      helperId: '',
      updatedAt: serverTimestamp(),
    });
    try {
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `vendors/${vid}`);
    }
  }

  public async rotatePartnerCode(account: any, oldCode: string, newCode: string): Promise<void> {
    if (!auth.currentUser) return;
    const aid = sanitizeId(account.id);
    const loginLower = String(account.loginName || '').trim().toLowerCase();
    const trimmedNew = clampStr(newCode, 60);
    if (!loginLower || trimmedNew.length < 4) {
      throw new Error('Password / access code must be at least 4 characters.');
    }
    try {
      const accRef = doc(db, 'partner_accounts', aid);
      const existingSnap = await getDoc(accRef);
      const authoritativeOldCode = existingSnap.exists()
        ? String(existingSnap.data().code || oldCode || '')
        : String(oldCode || '');

      const oldHash = authoritativeOldCode
        ? await sha256Hex(`${loginLower}:${authoritativeOldCode.trim()}`)
        : '';
      const passedOldHash = oldCode
        ? await sha256Hex(`${loginLower}:${String(oldCode).trim()}`)
        : '';
      const newHash = await sha256Hex(`${loginLower}:${trimmedNew}`);

      const batch = writeBatch(db);
      if (existingSnap.exists()) {
        batch.update(accRef, {
          code: trimmedNew,
          updatedAt: serverTimestamp(),
        });
      } else {
        batch.set(accRef, {
          id: aid,
          ownerUid: clampStr(account.ownerUid || '', 128),
          role: account.role,
          name: clampStr(account.name, 120, 'Partner'),
          loginName: clampStr(loginLower, 60),
          code: trimmedNew,
          location: clampStr(account.location || '', 160),
          university: clampStr(account.university || '', 120),
          helperId: clampStr(account.helperId || '', 128),
          avatar: clampStr(account.avatar || '', 250000),
          balance: nonNegNum(account.balance, 0),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      if (oldHash && oldHash !== newHash) {
        batch.delete(doc(db, 'partner_auth', oldHash));
      }
      if (passedOldHash && passedOldHash !== oldHash && passedOldHash !== newHash) {
        batch.delete(doc(db, 'partner_auth', passedOldHash));
      }
      batch.set(doc(db, 'partner_auth', newHash), {
        id: newHash,
        accountId: aid,
        role: account.role,
        name: clampStr(account.name, 120),
        location: clampStr(account.location || '', 160),
        university: clampStr(account.university || '', 120),
        helperId: clampStr(account.helperId || '', 128),
        updatedAt: serverTimestamp(),
      });
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `partner_accounts/${aid}`);
    }
  }

  public async addProjectHelper(helper: any, account: any): Promise<void> {
    if (!auth.currentUser) return;
    const hid = sanitizeId(helper.id);
    const accId = sanitizeId(account.id);
    const phone = clampStr(helper.phone || '+234 903 984 7154', 40);
    const masked = phone.length >= 8 ? `${phone.slice(0, 8)} ••• ••${phone.slice(-2)}` : '+234 *** ****';
    const batch = writeBatch(db);
    batch.set(doc(db, 'project_helpers', hid), {
      id: hid,
      ownerUid: '',
      name: clampStr(helper.name, 120, 'Helper'),
      specialty: clampStr(helper.specialty, 200, 'Academic Support'),
      campus: clampStr(helper.campus, 120, 'Campus'),
      photo: clampStr(helper.photo, 250000),
      bio: clampStr(helper.bio, 600),
      maskedPhone: masked,
      unlockFee: posNum(helper.unlockFee, 5000),
      active: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    batch.set(doc(db, 'project_helpers', hid, 'private', 'contact'), {
      id: 'contact',
      phone,
      whatsapp: clampStr(helper.whatsapp || phone.replace(/\D/g, ''), 30),
      email: clampStr(helper.email || 'academicdesk@uninestnigeria.com', 150),
      updatedAt: serverTimestamp(),
    });
    batch.set(doc(db, 'partner_accounts', accId), {
      id: accId,
      ownerUid: '',
      role: 'project_helper',
      name: clampStr(account.name, 120),
      loginName: clampStr(account.loginName, 60),
      code: clampStr(account.code, 60),
      location: clampStr(account.location, 160),
      university: '',
      helperId: hid,
      avatar: clampStr(account.avatar, 250000),
      balance: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    const hash = await sha256Hex(`${String(account.loginName).trim().toLowerCase()}:${String(account.code).trim()}`);
    batch.set(doc(db, 'partner_auth', hash), {
      id: hash,
      accountId: accId,
      role: 'project_helper',
      name: clampStr(account.name, 120),
      location: clampStr(account.location, 160),
      university: '',
      helperId: hid,
      updatedAt: serverTimestamp(),
    });
    try {
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `project_helpers/${hid}`);
    }
  }

  public async toggleHelperActive(helperId: string, active: boolean): Promise<void> {
    if (!auth.currentUser) return;
    const hid = sanitizeId(helperId);
    try {
      await updateDoc(doc(db, 'project_helpers', hid), {
        active,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `project_helpers/${hid}`);
    }
  }

  public async updateHelperProfile(helperId: string, specialty: string, bio: string): Promise<void> {
    if (!auth.currentUser) return;
    const hid = sanitizeId(helperId);
    try {
      await updateDoc(doc(db, 'project_helpers', hid), {
        specialty: clampStr(specialty, 200, 'Academic Research'),
        bio: clampStr(bio, 600),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `project_helpers/${hid}`);
    }
  }

  public async addCampusScout(scout: any, initialTx?: any): Promise<void> {
    if (!auth.currentUser) return;
    const sid = sanitizeId(scout.id);
    const phone = clampStr(scout.phone || '+234 903 984 7154', 40);
    const masked = phone.length >= 8 ? `${phone.slice(0, 8)} ••• ••${phone.slice(-2)}` : '+234 *** ****';
    const batch = writeBatch(db);
    batch.set(doc(db, 'scouts', sid), {
      id: sid,
      ownerUid: '',
      name: clampStr(scout.name, 120, 'Campus Scout'),
      location: clampStr(scout.location, 120, 'Campus'),
      specialty: clampStr(scout.specialty, 200, 'Clearance & Campus Support'),
      photo: clampStr(scout.avatar, 250000),
      bio: clampStr(scout.bio, 600),
      maskedPhone: masked,
      unlockFee: posNum(scout.unlockFee, 3000),
      jobsCompleted: 0,
      active: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    batch.set(doc(db, 'scouts', sid, 'private', 'contact'), {
      id: 'contact',
      phone,
      whatsapp: clampStr(scout.whatsapp || phone.replace(/\D/g, ''), 30),
      updatedAt: serverTimestamp(),
    });
    batch.set(doc(db, 'partner_accounts', sid), {
      id: sid,
      ownerUid: '',
      role: 'scout',
      name: clampStr(scout.name, 120),
      loginName: clampStr(scout.loginName, 60),
      code: clampStr(scout.code, 60),
      location: clampStr(scout.location, 160),
      university: clampStr(scout.location, 120),
      helperId: '',
      avatar: clampStr(scout.avatar, 250000),
      balance: nonNegNum(scout.balance, 0),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    const hash = await sha256Hex(`${String(scout.loginName).trim().toLowerCase()}:${String(scout.code).trim()}`);
    batch.set(doc(db, 'partner_auth', hash), {
      id: hash,
      accountId: sid,
      role: 'scout',
      name: clampStr(scout.name, 120),
      location: clampStr(scout.location, 160),
      university: clampStr(scout.location, 120),
      helperId: '',
      updatedAt: serverTimestamp(),
    });
    if (initialTx) {
      const txId = sanitizeId(initialTx.id);
      batch.set(doc(db, 'scouts', sid, 'ledger', txId), {
        id: txId,
        scoutId: sid,
        dateLabel: clampStr(initialTx.date, 40),
        amount: posNum(initialTx.amount, 1),
        balanceAfter: nonNegNum(initialTx.balanceAfter, 0),
        channel: clampStr(initialTx.channel, 80),
        note: clampStr(initialTx.note, 200),
        type: initialTx.type === 'debit' ? 'debit' : 'credit',
        createdAt: serverTimestamp(),
      });
    }
    try {
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `scouts/${sid}`);
    }
  }

  public async toggleScoutActive(scoutId: string, active: boolean): Promise<void> {
    if (!auth.currentUser) return;
    const sid = sanitizeId(scoutId);
    try {
      await updateDoc(doc(db, 'scouts', sid), {
        active,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `scouts/${sid}`);
    }
  }

  public async updateScoutBalance(scoutId: string, nextBal: number, tx?: any): Promise<void> {
    if (!auth.currentUser) return;
    const sid = sanitizeId(scoutId);
    const batch = writeBatch(db);
    batch.update(doc(db, 'partner_accounts', sid), {
      balance: nonNegNum(nextBal, 0),
      updatedAt: serverTimestamp(),
    });
    if (tx) {
      const txId = sanitizeId(tx.id);
      batch.set(doc(db, 'scouts', sid, 'ledger', txId), {
        id: txId,
        scoutId: sid,
        dateLabel: clampStr(tx.date, 40),
        amount: posNum(tx.amount, 1),
        balanceAfter: nonNegNum(tx.balanceAfter, 0),
        channel: clampStr(tx.channel, 80),
        note: clampStr(tx.note, 200),
        type: tx.type === 'debit' ? 'debit' : 'credit',
        createdAt: serverTimestamp(),
      });
    }
    try {
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `scouts/${sid}`);
    }
  }

  public async updatePartnerAvatar(account: any, avatar: string): Promise<void> {
    if (!auth.currentUser) return;
    const aid = sanitizeId(account.id);
    const batch = writeBatch(db);
    batch.update(doc(db, 'partner_accounts', aid), {
      avatar: clampStr(avatar, 250000),
      updatedAt: serverTimestamp(),
    });
    if (account.role === 'vendor') {
      batch.update(doc(db, 'vendors', aid), {
        avatar: clampStr(avatar, 250000),
        updatedAt: serverTimestamp(),
      });
    } else if (account.role === 'scout') {
      batch.update(doc(db, 'scouts', aid), {
        photo: clampStr(avatar, 250000),
        updatedAt: serverTimestamp(),
      });
    } else if (account.role === 'project_helper' && account.helperId) {
      batch.update(doc(db, 'project_helpers', sanitizeId(account.helperId)), {
        photo: clampStr(avatar, 250000),
        updatedAt: serverTimestamp(),
      });
    }
    try {
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `partner_accounts/${aid}`);
    }
  }
}

export const uniNestFirebase = new UniNestFirebaseEngine();
if (typeof window !== 'undefined') {
  (window as any).UniNestFirebase = uniNestFirebase;
}
void uniNestFirebase.init();

declare global {
  interface Window {
    UniNestFirebase?: UniNestFirebaseEngine;
  }
}

window.UniNestFirebase = uniNestFirebase;
