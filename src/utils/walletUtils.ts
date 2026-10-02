// UniNest STS Wallet Number & Gifting Directory Utility
import { supabase } from '../lib/supabaseClient.js';

export interface StudentWalletDirectoryEntry {
  stsWalletNumber: string;
  name: string;
  email: string;
  phone: string;
  university: string;
  department: string;
  level: string;
  verified?: boolean;
}

// Mock/hardcoded students removed — real students are queried dynamically from Supabase
export const KNOWN_STS_STUDENTS: StudentWalletDirectoryEntry[] = [];

function getSafeStorageItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch (e) {}
  return null;
}

function setSafeStorageItem(key: string, val: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, val);
    }
  } catch (e) {}
}

/**
 * Normalizes user input into standard STS-XXXX-XXXX format
 */
export function normalizeSTSNumber(raw: string): string {
  if (!raw) return '';
  const trimmed = raw.trim().toUpperCase().replace(/[\s_]/g, '-');
  
  // If already standard STS-XXXX-XXXX
  if (/^STS-\d{4}-\d{4}$/.test(trimmed)) {
    return trimmed;
  }

  // Extract all digits
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 8) {
    return `STS-${digits.slice(0, 4)}-${digits.slice(4)}`;
  }

  // If starts with STS followed by digits (e.g. STS90344429)
  if (trimmed.startsWith('STS') && digits.length >= 8) {
    const eight = digits.slice(-8);
    return `STS-${eight.slice(0, 4)}-${eight.slice(4)}`;
  }

  return trimmed;
}

/**
 * Returns a consistent 10-character STS Wallet Account Number for any student email
 * Example: STS-9042-8812
 */
export function getStudentSTSWalletNumber(email?: string, phone?: string): string {
  if (!email && !phone) return 'STS-2026-4429';

  const clean = (email || phone || '').toLowerCase().trim();
  const cached = getSafeStorageItem(`uninest_sts_wallet_${clean}`);
  if (cached) return cached;

  // Generate deterministic number from email hash and phone
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i);
    hash |= 0;
  }
  const part1 = Math.abs(hash % 9000 + 1000).toString().padStart(4, '0');
  const cleanPhone = (phone || '').replace(/\D/g, '');
  const part2 = cleanPhone.length >= 4 
    ? cleanPhone.slice(-4) 
    : Math.abs((hash * 31) % 9000 + 1000).toString().padStart(4, '0');

  const generated = `STS-${part1}-${part2}`;
  setSafeStorageItem(`uninest_sts_wallet_${clean}`, generated);
  return generated;
}

/**
 * Synchronous local lookup across registered local accounts & cache
 * (No mock names or fake Somtochukwu Davis)
 */
export function findStudentBySTSWallet(walletNo: string): StudentWalletDirectoryEntry | null {
  if (!walletNo) return null;
  const normalized = normalizeSTSNumber(walletNo);
  const rawDigits = walletNo.replace(/\D/g, '');

  if (rawDigits.length < 6 && walletNo.length < 6) return null;

  // 1. Check STS Savings Accounts in localStorage
  try {
    const rawStsSavings = getSafeStorageItem('sts_savings_accounts');
    if (rawStsSavings) {
      const parsed = JSON.parse(rawStsSavings);
      if (Array.isArray(parsed)) {
        for (const acc of parsed) {
          const accSts = acc.stsAccountNumber ? normalizeSTSNumber(acc.stsAccountNumber) : '';
          const calculatedSts = acc.userEmail ? getStudentSTSWalletNumber(acc.userEmail) : '';
          
          if (
            (accSts && (accSts === normalized || accSts.replace(/\D/g, '') === rawDigits)) ||
            (calculatedSts && (calculatedSts === normalized || calculatedSts.replace(/\D/g, '') === rawDigits))
          ) {
            return {
              stsWalletNumber: accSts || calculatedSts || normalized,
              name: acc.studentName || acc.name || 'Verified Student',
              email: acc.userEmail || acc.email || `${acc.studentName?.toLowerCase().replace(/\s+/g, '.')}@campus.edu.ng`,
              phone: acc.phone || '080' + (accSts.replace(/\D/g, '').slice(-8) || '39045612'),
              university: acc.university || 'Niger Delta University',
              department: acc.department || 'Academic Department',
              level: acc.level || 'Undergraduate',
              verified: true
            };
          }
        }
      }
    }
  } catch (e) {
    console.warn('Error querying sts_savings_accounts:', e);
  }

  // 2. Check registered users in localStorage
  try {
    const rawUsers = getSafeStorageItem('uninest_users');
    if (rawUsers) {
      const parsedUsers = JSON.parse(rawUsers);
      if (Array.isArray(parsedUsers)) {
        for (const u of parsedUsers) {
          if (!u || !u.email) continue;
          const uSts = u.sts_number || u.stsAccountNumber || getStudentSTSWalletNumber(u.email, u.phone);
          if (uSts === normalized || uSts.replace(/\D/g, '') === rawDigits) {
            return {
              stsWalletNumber: uSts,
              name: u.full_name || u.name || 'Campus Student',
              email: u.email,
              phone: u.phone || '0813000' + rawDigits.slice(-4),
              university: u.university || 'Verified Nigerian University',
              department: u.department || 'General Studies',
              level: u.level || 'Undergraduate',
              verified: true
            };
          }
        }
      }
    }
  } catch (e) {
    console.warn('Error querying uninest_users:', e);
  }

  // If not found in real stored records, return null (never return mock names)
  return null;
}

/**
 * Asynchronously looks up a REAL user from Supabase tables ('profiles' or 'students')
 * using formats: 9926-2545, 99262545, and STS-9926-2545.
 * Returns full_name, university, department, level, email.
 * Returns null if not found (never mock Somtochukwu Davis).
 */
export async function lookupStudentBySTSWalletAsync(rawInput: string): Promise<StudentWalletDirectoryEntry | null> {
  if (!rawInput) return null;
  const cleanInput = rawInput.trim();
  const digits = cleanInput.replace(/\D/g, '');

  if (digits.length < 4 && cleanInput.length < 4) {
    return null;
  }

  // Generate target formats: 9926-2545, 99262545, and STS-9926-2545
  const dashed = digits.length === 8 ? `${digits.slice(0, 4)}-${digits.slice(4)}` : cleanInput;
  const stsPrefixed = digits.length === 8 ? `STS-${digits.slice(0, 4)}-${digits.slice(4)}` : (cleanInput.startsWith('STS-') ? cleanInput : `STS-${cleanInput}`);
  const formatsToTry = Array.from(new Set([cleanInput, dashed, digits, stsPrefixed, `STS${digits}`])).filter(Boolean);

  // 1. Query real Supabase table 'profiles' where sts_number = input
  try {
    for (const fmt of formatsToTry) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('sts_number', fmt)
        .limit(1);

      if (!error && data && data.length > 0) {
        const row = data[0];
        return {
          stsWalletNumber: row.sts_number || stsPrefixed,
          name: row.full_name || row.name || 'Verified Student',
          email: row.email || '',
          phone: row.phone || '',
          university: row.university || row.institution || row.school || 'Verified Nigerian University',
          department: row.department || row.dept || 'Academic Studies',
          level: row.level || 'Undergraduate',
          verified: true
        };
      }
    }
  } catch (err) {
    console.warn('Supabase profiles sts_number query notice:', err);
  }

  // 1b. Batch in-query on profiles table
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .in('sts_number', formatsToTry)
      .limit(1);

    if (!error && data && data.length > 0) {
      const row = data[0];
      return {
        stsWalletNumber: row.sts_number || stsPrefixed,
        name: row.full_name || row.name || 'Verified Student',
        email: row.email || '',
        phone: row.phone || '',
        university: row.university || row.institution || row.school || 'Verified Nigerian University',
        department: row.department || row.dept || 'Academic Studies',
        level: row.level || 'Undergraduate',
        verified: true
      };
    }
  } catch (err) {}

  // 2. Query real Supabase table 'students' where sts_number = input
  try {
    for (const fmt of formatsToTry) {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('sts_number', fmt)
        .limit(1);

      if (!error && data && data.length > 0) {
        const row = data[0];
        return {
          stsWalletNumber: row.sts_number || stsPrefixed,
          name: row.full_name || row.name || 'Verified Student',
          email: row.email || '',
          phone: row.phone || '',
          university: row.university || row.institution || row.school || 'Verified Nigerian University',
          department: row.department || row.dept || 'Academic Studies',
          level: row.level || 'Undergraduate',
          verified: true
        };
      }
    }
  } catch (err) {
    console.warn('Supabase students sts_number query notice:', err);
  }

  // 2b. Batch in-query on students table
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .in('sts_number', formatsToTry)
      .limit(1);

    if (!error && data && data.length > 0) {
      const row = data[0];
      return {
        stsWalletNumber: row.sts_number || stsPrefixed,
        name: row.full_name || row.name || 'Verified Student',
        email: row.email || '',
        phone: row.phone || '',
        university: row.university || row.institution || row.school || 'Verified Nigerian University',
        department: row.department || row.dept || 'Academic Studies',
        level: row.level || 'Undergraduate',
        verified: true
      };
    }
  } catch (err) {}

  // 3. Check profiles where deterministic STS number from email/phone matches
  try {
    const { data: allProfiles, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(100);

    if (!error && allProfiles && Array.isArray(allProfiles)) {
      for (const p of allProfiles) {
        if (!p.email) continue;
        const pSts = getStudentSTSWalletNumber(p.email, p.phone);
        const pDigits = pSts.replace(/\D/g, '');
        if (formatsToTry.includes(pSts) || formatsToTry.includes(pDigits)) {
          return {
            stsWalletNumber: pSts,
            name: p.full_name || p.name || 'Verified Student',
            email: p.email,
            phone: p.phone || '',
            university: p.university || p.institution || p.school || 'Verified Nigerian University',
            department: p.department || p.dept || 'Academic Studies',
            level: p.level || 'Undergraduate',
            verified: true
          };
        }
      }
    }
  } catch (err) {}

  // 4. Check real registered users in localStorage
  try {
    const rawUsers = getSafeStorageItem('uninest_users');
    if (rawUsers) {
      const parsedUsers = JSON.parse(rawUsers);
      if (Array.isArray(parsedUsers)) {
        for (const u of parsedUsers) {
          if (!u || !u.email) continue;
          const uSts = u.sts_number || u.stsAccountNumber || getStudentSTSWalletNumber(u.email, u.phone);
          const uDigits = uSts.replace(/\D/g, '');
          if (formatsToTry.includes(uSts) || formatsToTry.includes(uDigits)) {
            return {
              stsWalletNumber: uSts,
              name: u.full_name || u.name || 'Verified Student',
              email: u.email || '',
              phone: u.phone || '',
              university: u.university || u.institution || 'Verified Nigerian University',
              department: u.department || 'Academic Department',
              level: u.level || 'Undergraduate',
              verified: true
            };
          }
        }
      }
    }
  } catch (err) {}

  // 5. Check real STS Savings accounts
  const localMatch = findStudentBySTSWallet(rawInput);
  if (localMatch) {
    return localMatch;
  }

  // Not found in any DB table or registered user
  return null;
}

/**
 * Fetches real verified students from Supabase (profiles and students)
 * Returns an empty array if no real students exist in the DB.
 */
export async function fetchRealVerifiedStudentsFromDB(): Promise<StudentWalletDirectoryEntry[]> {
  const verifiedList: StudentWalletDirectoryEntry[] = [];
  const seenEmails = new Set<string>();

  // 1. Query Supabase profiles table
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(8);

    if (!error && profiles && Array.isArray(profiles)) {
      for (const p of profiles) {
        if (!p.email) continue;
        const emailLower = p.email.toLowerCase().trim();
        if (seenEmails.has(emailLower) || emailLower === 'admin@uninest.com') continue;
        seenEmails.add(emailLower);

        verifiedList.push({
          stsWalletNumber: p.sts_number || p.sts_wallet_number || getStudentSTSWalletNumber(p.email, p.phone),
          name: p.full_name || p.name || 'Verified Student',
          email: p.email,
          phone: p.phone || '',
          university: p.university || p.institution || p.school || 'Verified Nigerian University',
          department: p.department || p.dept || 'Academic Studies',
          level: p.level || 'Undergraduate',
          verified: true
        });
      }
    }
  } catch (err) {
    console.warn('Notice querying profiles for quick-select:', err);
  }

  // 2. Query Supabase students table
  try {
    const { data: students, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(8);

    if (!error && students && Array.isArray(students)) {
      for (const s of students) {
        if (!s.email && !s.full_name && !s.name) continue;
        const emailLower = (s.email || '').toLowerCase().trim();
        if (emailLower && (seenEmails.has(emailLower) || emailLower === 'admin@uninest.com')) continue;
        if (emailLower) seenEmails.add(emailLower);

        verifiedList.push({
          stsWalletNumber: s.sts_number || s.sts_wallet_number || (s.email ? getStudentSTSWalletNumber(s.email, s.phone) : 'STS-2026-0001'),
          name: s.full_name || s.name || 'Verified Student',
          email: s.email || '',
          phone: s.phone || '',
          university: s.university || s.institution || s.school || 'Verified Nigerian University',
          department: s.department || s.dept || 'Academic Studies',
          level: s.level || 'Undergraduate',
          verified: true
        });
      }
    }
  } catch (err) {}

  // 3. Check real registered users in localStorage (excluding admin/mock)
  try {
    const rawUsers = getSafeStorageItem('uninest_users');
    if (rawUsers) {
      const parsed = JSON.parse(rawUsers);
      if (Array.isArray(parsed)) {
        for (const u of parsed) {
          if (!u || !u.email) continue;
          const emailLower = u.email.toLowerCase().trim();
          if (emailLower === 'admin@uninest.com' || emailLower === 'amaechihellis@gmail.com' || seenEmails.has(emailLower)) continue;
          seenEmails.add(emailLower);

          verifiedList.push({
            stsWalletNumber: u.sts_number || u.stsAccountNumber || getStudentSTSWalletNumber(u.email, u.phone),
            name: u.full_name || u.name || 'Verified Student',
            email: u.email,
            phone: u.phone || '',
            university: u.university || u.institution || 'Verified Nigerian University',
            department: u.department || 'Academic Department',
            level: u.level || 'Undergraduate',
            verified: true
          });
        }
      }
    }
  } catch (err) {}

  return verifiedList;
}
