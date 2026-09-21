export type UserRole = 'student' | 'admin' | 'guest' | 'vendor';

export interface UniNestUser {
  id?: string;
  email: string;
  phone: string;
  password: string;
  role?: UserRole;
  verified: boolean;
  createdAt: string;
  name?: string;
  university?: string;
  department?: string;
  avatarUrl?: string;
  pictures?: string[];
  isVerifiedVendor?: boolean;
  vendorVerifiedByHead?: boolean;
  hasSTSVendorAccount?: boolean;
  stsVendorAccountNumber?: string;
  businessName?: string;
  vendorCategory?: string;
  vendorConfirmedViaWhatsapp?: boolean;
  walletBalance?: number;
  giftBalance?: number;
}

// 1. STS: Save Till Sign-out & Student Gifting Account
export interface StudentGift {
  id: string;
  senderEmail: string;
  senderName: string;
  senderPhone?: string;
  senderSchool?: string;
  recipientEmail: string;
  recipientName: string;
  recipientPhone?: string;
  recipientSchool?: string;
  amount: number;
  occasion: string; // e.g. 'Exam Handouts & Books', 'Campus Lunch & Feeding', 'Sign-out Celebration', 'Birthday Blessing', 'Data & Project Support'
  message: string;
  date: string;
  fundingMethod?: 'balance' | 'bank_escrow';
  escrowReference?: string;
  escrowStatus?: 'pending' | 'cleared';
  senderBankName?: string;
  payerAccountName?: string;
  paymentProofUrl?: string;
  stsPinVerified?: boolean;
  senderStsNumber?: string;
  recipientStsNumber?: string;
}

export interface UniNestRewardToken {
  id: string;
  title: string;
  category: 'graduation_bonus' | 'exam_grant' | 'airtime_data' | 'convocation_hamper';
  valueNgn: number;
  description: string;
  unlockedAtPercent: number; // e.g. 70
  isClaimed: boolean;
  claimedDate?: string;
  tokenCode: string;
}

export interface STSSavingsAccount {
  id: string;
  userEmail: string;
  stsAccountNumber?: string; // Unique STS Account Number (e.g. 'STS-9034-4429') - used to receive gifts directly into the Gift Account!
  studentName?: string;
  university?: string;
  department?: string;
  currentLevel?: string;
  expectedSignOutYear?: string;
  startDate?: string;
  targetYear?: string; // e.g. '2026', '2027', '2028'
  targetGoalName?: string; // e.g. 'Final Year Project + Clearance + Convocation'
  targetAmount: number; // in NGN e.g. 200000
  currentBalance: number; // in NGN e.g. 45000 - STS Locked Savings (strictly locked till graduation sign-out clearance)
  giftAccountBalance?: number; // in NGN e.g. 15000 - Separate Gift Account (funds received via STS account number arrive here, withdrawable/spendable)
  giftBalance?: number; // Backwards compatible alias for giftAccountBalance
  walletBalance?: number; // Master wallet balance carrying total amount (locked STS savings + spendable gift account). Deducted whenever money leaves the account.
  stsPin?: string; // 4-digit security PIN for authorizing transfers from STS gift number to another gift number (default '1234')
  isPinCustomized?: boolean; // Whether first-time user has created their customized 4-digit PIN
  stsPinCreated?: boolean; // Alias for whether customized PIN has been established
  withdrawalDate?: string; // e.g. '2026-11-30' - funds strictly locked till this date!
  minSavingsLimit?: number; // Minimum deposit threshold (default 200 NGN)
  savingsFrequency?: 'daily' | 'weekly' | 'monthly' | 'flexible';
  frequency?: 'daily' | 'weekly' | 'monthly' | 'flexible';
  monthlyContribution?: number;
  autoSaveAmount?: number;
  status?: string;
  isActivated?: boolean; // Activated with 500 NGN one-time fee
  activationFeePaid?: boolean; // 500 NGN fee
  isSTSVendorAccount?: boolean; // Granted exclusively to verified vendors confirmed by Head of Marketplace
  stsAccountType?: 'student_graduation' | 'vendor_sts';
  giftsSent?: StudentGift[];
  giftsReceived?: StudentGift[];
  uninestRewardTokens?: UniNestRewardToken[];
  transactions: {
    id: string;
    type: 'deposit' | 'gift_sent' | 'gift_received' | 'interest' | 'signout_payout' | 'emergency_withdrawal' | 'sts_activation_fee' | 'loan_disbursed' | 'loan_repaid' | 'escrow_vendor_payout';
    amount: number;
    date: string;
    description: string;
    balanceAfter?: number;
    signOutPhotoUrl?: string;
    faceVerified?: boolean;
    recipientOrSender?: string;
  }[];
  activeLoan?: {
    id: string;
    amount?: number;
    amountRequested?: number;
    requestedAt?: string;
    requestDate?: string;
    dueDate: string;
    repaidAmount?: number;
    collateralSavingsLocked?: number;
    recoupCondition?: string;
    status: 'active' | 'repaid' | 'recouped_from_savings' | 'Approved & Disbursed' | 'Partially Repaid' | 'Pending Approval';
    purpose?: string;
    note?: string;
  } | null;
}

// Legacy / Physical Temporary Stay
export interface STSAccount {
  id: string;
  userEmail: string;
  name: string;
  phone: string;
  school: string;
  department: string;
  duration: string; // e.g. '1 Month Exam Stay', '3 Months SIWES/IT', '1 Semester Extension', 'Full Academic Year'
  roomType: string; // 'Self-Contain', 'Single Room', 'Shared 2-in-1', 'Hostel Bedspace'
  budget: string; // e.g. '₦150,000'
  location: string; // e.g. 'Amassoma (NDU Campus Gate)'
  status: 'active' | 'pending_approval' | 'completed';
  lodgeName?: string;
  pictures?: string[];
  createdAt: string;
}

// 2. Roommate & Accommodation Matching (Expanded across Nigeria with State & University search)
export type MatchingState = 'Bayelsa' | 'Rivers' | 'Delta' | 'Lagos' | 'Edo' | 'Oyo' | 'Abuja' | 'Enugu' | 'Imo' | 'Akwa Ibom' | 'Ogun' | 'Anambra' | 'Kwara' | string;

export interface BayelsaRoommateProfile {
  id: string;
  name: string;
  state?: MatchingState | string; // 'Bayelsa' | 'Rivers' | 'Delta'
  gender: 'male' | 'female' | 'any';
  institution: string; // 'Niger Delta University (NDU)', 'University of Port Harcourt (UNIPORT)', 'Delta State University (DELSU)', etc.
  department: string;
  level: string; // '100L', '200L', '300L', '400L', '500L', 'HND1', 'HND2'
  campusArea: string; // 'Amassoma', 'Choba Gate', 'Abraka Site 3', 'Otuoke', 'Yenagoa (Onopa)'
  budgetRange: string; // '₦60,000 - ₦120,000'
  roomTypeNeeded: string; // 'Self-Contain Shared', 'Two-Bedroom Flat (1 Room Mate)', 'Single Room with Toilet'
  lifestyle: {
    sleepSchedule: 'Early Bird' | 'Night Owl' | 'Balanced';
    studyHabit: 'Quiet / Serious' | 'Group Study' | 'Music in background';
    cleanliness: 'Very Strict & Tidy' | 'Moderate' | 'Relaxed';
    cooking: 'Cook Daily' | 'Buy food mostly' | 'Share cooking';
    guestPolicy: 'No overnight guests' | 'Weekends only' | 'Flexible / Allowed';
    religionValues: 'Christian' | 'Muslim' | 'Open-minded / Any';
  };
  aboutMe: string;
  lookingFor: string;
  contactPhone: string;
  verifiedStudent: boolean;
  avatarUrl: string;
  facePhotoUrl?: string;
  faceVerified?: boolean;
}

export type RoommateProfile = BayelsaRoommateProfile;

export interface AccommodationAvailabilityComment {
  id: string;
  authorName: string;
  authorEmail?: string;
  university?: string;
  text: string;
  date: string;
  isAvailableReport: boolean; // true = reported as still available, false = reported as taken/full
}

export interface AccommodationListing {
  id: string;
  title: string;
  institution: string;
  location: string;
  pricePerSession: number;
  roomType: string;
  amenities: string[];
  images: string[];
  contactPhone: string;
  landlordVerified: boolean;
  electricityRating: '24/7 Solar/Gen' | 'Good' | 'Fair';
  waterSupply: 'Constant Borehole' | 'Well & Tap';
  isAvailable?: boolean; // Still available for rent or taken
  availabilityComments?: AccommodationAvailabilityComment[];
  uploadedBy?: string;
  state?: string;
  description?: string;
}

// 3. Academic Assist
export interface AcademicAssistRequest {
  id: string;
  userEmail: string;
  studentName: string;
  phone: string;
  serviceType: 'Assignment Assistance' | 'Final Year Project (Ch 1-5)' | 'Data Analysis (SPSS/Python)' | 'Plagiarism & Turnitin Reduction' | 'Seminar & Term Paper';
  topicOrCourse: string;
  department: string;
  institution: string;
  deadline: string;
  additionalDetails: string;
  status: 'Received' | 'Assigned to Expert' | 'In Progress' | 'Completed / Ready';
  createdAt: string;
  estimatedPrice?: string;
}

// 4. UniNest Marketplace & Escrow
export interface MarketplaceItem {
  id: string;
  sellerEmail: string;
  sellerName: string;
  sellerPhone: string;
  sellerRole?: 'student' | 'vendor'; // Both students and vendors can list
  hasVerifiedVendorTick?: boolean; // ONLY verified vendors confirmed by Head of Marketplace have a tick
  isVendorListing?: boolean;
  title: string;
  category: 'Laptops & Tech' | 'Textbooks & Materials' | 'Hostel Appliances' | 'Furniture & Mattress' | 'Cooking & Kitchen';
  price: number;
  condition: 'Brand New' | 'Gently Used (Like New)' | 'Fairly Used';
  campus: string;
  description: string;
  image: string;
  isEscrowProtected: boolean;
  status: 'available' | 'in_escrow' | 'sold' | 'expired';
  postedAt: string;
  expiresAt?: string; // Automatically expires after 1 month (30 days)
}

export interface EscrowTransaction {
  id: string;
  itemId?: string;
  buyerEmail: string;
  buyerPhone?: string;
  sellerEmail: string;
  sellerPhone?: string;
  itemTitle: string;
  amount: number;
  escrowFee?: number; // Exactly 5% escrow protection charge
  totalAmount?: number; // Principal + 5% Escrow fee
  campus: string;
  escrowAccountNumber?: string; // e.g. '2150445461' (UBA - UniNest Escrow Account)
  autoReleaseDays?: number; // 3 working days policy
  autoReleaseDate?: string;
  releasePolicy?: string; // 'Released after confirmation or within three working days'
  status: 'Pending' | 'Pending Vendor Confirmation' | 'Pending Buyer Confirmation' | 'Fund Deposited to UniNest Escrow' | 'Item In Transit / Inspection' | 'Payment Released to Seller' | 'Disputed / Refunded' | 'Escrow Vault Funded (Awaiting Inspection)' | string;
  createdAt: string;
}

// 5. Cheap Student Data
export interface DataPlan {
  id: string;
  network: 'MTN' | 'AIRTEL' | 'GLO' | '9MOBILE';
  size: string; // e.g. '1GB', '2GB', '5GB', '10GB'
  price: number; // e.g. 280
  validity: string; // e.g. '30 Days'
  type: 'SME' | 'Gifting' | 'Corporate';
}

export interface DataOrder {
  id: string;
  userEmail: string;
  network: 'MTN' | 'AIRTEL' | 'GLO' | '9MOBILE';
  dataPlan: string;
  phone: string;
  amount: number;
  status: 'Delivered Instantly' | 'Processing';
  transactionDate: string;
}

export interface NewsItem {
  id: string;
  title: string;
  type: 'scholarship' | 'strike' | 'school' | 'service';
  description: string;
  school?: string;
  date: string;
  author?: string;
  link?: string;
  sourceName?: string;
  sourceUrl?: string;
  category?: string;
}

export interface AdminLog {
  id: string;
  action: string;
  email: string;
  date: string;
  details?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  text: string;
  time: string;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: string;
  attachmentSize?: string;
  isAutoReply?: boolean;
}

// 6. Verified Agents, Vendors & Academic Assistants Directory with 5-Star Reviews
export interface BusinessReview {
  id: string;
  studentName: string;
  studentSchool: string;
  studentAvatar?: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
}

export type BusinessAccountType = 'house_agent' | 'vendor' | 'academic_assistant' | 'verified_agent' | 'verified_seller';

export interface VerifiedBusiness {
  id: string;
  ownerEmail: string;
  ownerName: string;
  businessName: string;
  accountType: BusinessAccountType;
  category: string;
  state: string; // e.g. 'Bayelsa', 'Rivers', 'Delta', 'Lagos', etc.
  campus: string; // e.g. 'Niger Delta University (NDU, Amassoma)'
  locationAddress: string; // e.g. 'Amassoma Main Gate, Opposite Campus Canteen'
  phone: string;
  whatsapp: string;
  description: string;
  priceRange?: string;
  pictures: string[];
  isVerified: boolean;
  rating: number; // e.g. 5.0
  reviewsCount: number;
  reviews: BusinessReview[];
  createdAt: string;
  // ₦1,000 Monthly Verification Payment
  monthlyFeePaid: boolean;
  monthlyFeeAmount: number; // 1000
  subscriptionExpiry: string;
  // Specific role attributes
  agentDetails?: {
    agencyRegNumber?: string;
    inspectionFeePolicy: string; // e.g., 'Free Inspection' or '₦1,000 Standard Escrow'
    coverageZones: string; // e.g., 'Main Gate, New Site, Health Sciences Campus'
    availableRoomTypes: string[]; // e.g., ['Self-Contain', 'Single Room', 'Two Bedroom Flat']
  };
  vendorDetails?: {
    storeCategory: string; // e.g., 'Food & Meals', 'Gadgets & Phones', 'Thrift & Fashion'
    deliveryToHostels: boolean;
    deliveryEstimatedTime: string; // e.g., '15-30 minutes'
    shopPhysicalLocation: string;
  };
  assistantDetails?: {
    qualification: string; // e.g., 'B.Sc First Class Graduate', '400L Pharmacy Finalist'
    subjectSpecializations: string[]; // e.g., ['Engineering Math', 'GST Courses', 'SPSS Data Analysis']
    turnaroundTime: string; // e.g., 'Same Day (6 hrs)', '24 Hours'
    startingRate: string; // e.g., '₦2,000 / assignment'
  };
}

// 7. Cross-University Q&A (Type or Picture format)
export interface QuestionDiscussionComment {
  id: string;
  questionId: string;
  authorEmail: string;
  authorName: string;
  authorUniversity: string;
  authorAvatar?: string;
  text: string;
  createdAt: string;
  replyToAnswerId?: string;
  giftReceived?: {
    amount: number;
    fee: number; // 2% UniNest charge
    netAmount: number;
    senderName: string;
    senderEmail: string;
    timestamp: string;
  };
}

export interface QuestionAnswer {
  id: string;
  questionId: string;
  authorEmail: string;
  authorName: string;
  authorUniversity: string;
  authorDepartment?: string;
  authorAvatar?: string;
  answerText: string;
  solutionPictureUrl?: string; // Solution photo / diagram
  isAccepted?: boolean;
  upvotes: number;
  upvotedBy?: string[];
  createdAt: string;
  giftReceived?: {
    amount: number;
    fee: number; // 2% UniNest charge
    netAmount: number;
    senderName: string;
    senderEmail: string;
    timestamp: string;
  };
}

export interface StudentQuestion {
  id: string;
  authorEmail: string;
  authorName: string;
  authorUniversity: string;
  authorDepartment?: string;
  authorAvatar?: string;
  state?: string;
  title: string;
  questionText: string;
  questionPictureUrl?: string; // Picture format
  courseCode: string; // e.g. 'MTH 102', 'GST 111', 'CHM 101'
  subjectCategory: 'Mathematics & Engineering' | 'Natural & Physical Sciences' | 'Medical & Health' | 'Law & Humanities' | 'Management & Social Sciences' | 'General Studies (GST)';
  urgency: 'Immediate (Within 1 hour)' | 'Today' | 'Standard (24-48 hrs)';
  targetUniversity: string; // 'All Nigerian Universities' or specific institution
  bountyTip?: number; // e.g. 500, 1000 from STS balance
  answers: QuestionAnswer[];
  comments?: QuestionDiscussionComment[];
  status: 'Open' | 'Answered' | 'Solved';
  createdAt: string;
  viewsCount?: number;
}

// 8. Testimonials
export interface StudentTestimonial {
  id: string;
  studentName: string;
  school: string;
  department: string;
  level: string;
  avatarUrl: string;
  rating: number; // 5
  serviceTag: string; // 'Roommate Match' | 'Student Gifting' | 'Verified Lodge Agent' | 'Academic Assist' | 'Cheap Data'
  quote: string;
  date: string;
  verifiedStudent: boolean;
}

// 8. Campus Phone Notifications & Flash News
export interface PhoneNotificationItem {
  id: string;
  title: string;
  message: string;
  campusTag: string; // e.g. 'NDU Amassoma', 'BMU Yenagoa', 'FUOTUOKE', 'UNIPORT', 'DELSU', 'General'
  category: 'Scholarship Alert' | 'Hostel Release' | 'Academic Calendar' | 'Exam Clearance' | 'Campus Safety' | 'Student Gifting';
  timeAgo: string;
  date: string;
  priority: 'high' | 'normal';
  isRead?: boolean;
  linkUrl?: string;
  sentToEmail?: boolean; // Delivered directly to student subscribers' emails
  emailRecipientCount?: number;
}

// 9. Frequently Asked Questions
export interface FAQItem {
  id: string;
  category: 'Gifting & STS' | 'Housing & Roommates' | 'Verified Agents & Sellers' | 'Academic Assist' | 'Earn as Scout & Assistant';
  question: string;
  answer: string;
}

// 10. Student Crowdfunding & Escrow Aid Module
export type CrowdfundingCategory = 
  | 'School Fees & Tuition'
  | 'Final Year Project'
  | 'Medical & Emergency'
  | 'Hostel & Accommodation'
  | 'Laptop & Study Equipment'
  | 'Exam Handouts & Clearance';

export type CrowdfundingStatus = 'pending' | 'approved' | 'rejected' | 'paid_out';

export interface CrowdfundingDonation {
  id: string;
  campaignId: string;
  donorName: string;
  donorEmail?: string;
  amount: number; // in NGN
  paystackRef: string;
  escrowStatus: 'held_in_escrow' | 'disbursed_to_beneficiary' | 'refunded';
  message?: string;
  date: string;
  isAnonymous?: boolean;
}

export interface CrowdfundingCampaign {
  id: string;
  studentEmail: string;
  studentName: string;
  studentPhone: string;
  studentAvatar?: string;
  institution: string;
  department: string;
  level: string; // e.g. '300L', 'Final Year (400L)'
  matricNumber?: string;

  title: string;
  category: CrowdfundingCategory;
  targetAmount: number; // in NGN
  currentRaised: number; // in NGN
  story: string;

  // STS Link & Commitment Proof
  hasSTSAccount: boolean;
  stsSavingsBalance?: number;
  stsTargetGoal?: string;
  stsProofNote?: string;
  stsProofUrl?: string; // proof image / statement

  // Uploaded Proof Documents (e.g. fee invoice, medical report, project supervisor clearance)
  proofDocumentName?: string;
  proofDocumentUrl?: string; // image or preview
  proofDocumentType?: string; // e.g. 'School Fee Assessment Invoice', 'Medical Bill', 'Project Topic Approval'

  // Beneficiary Bank Account for disbursement
  bankName?: string;
  accountNumber?: string;
  accountName?: string;

  // Admin Approval State
  status: CrowdfundingStatus;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;

  // Mark as Paid / Disbursed with Proof
  isPaidOut?: boolean;
  paidOutAt?: string;
  paidOutAmount?: number;
  payoutProofUrl?: string; // payment receipt / bank transfer slip uploaded by admin
  payoutProofName?: string;
  payoutReference?: string;
  payoutDestinationNote?: string;

  donations: CrowdfundingDonation[];
  donorsCount: number;
  createdAt: string;
  deadline?: string;
}

// 7. Campus Scouts & 5% Referral Commission System
export type ScoutServiceType = 
  | 'Marketplace Escrow'
  | 'Academic Assist'
  | 'STS Gifting'
  | 'Crowdfunding Donation'
  | 'Cheap Student Data'
  | 'Lodge & Hostel Verification'
  | 'General Campus Service';

export interface ScoutCommissionTransaction {
  id: string;
  scoutCode: string;
  scoutEmail: string;
  scoutName: string;
  clientName: string;
  clientEmail: string;
  clientUniversity?: string;
  serviceType: ScoutServiceType;
  serviceDescription: string;
  grossAmount: number; // in NGN
  commissionRate: number; // e.g. 0.05 (5%)
  commissionAmount: number; // grossAmount * 0.05
  status: 'cleared' | 'escrow_pending' | 'paid_out';
  date: string;
  paymentReference: string;
  channel?: 'dedicated_link' | 'referral_code_input' | 'direct_checkout';
}

export interface ScoutPayoutRequest {
  id: string;
  scoutCode: string;
  scoutEmail: string;
  scoutName: string;
  amount: number; // in NGN
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: 'pending' | 'completed' | 'rejected';
  requestedAt: string;
  paidAt?: string;
  transferReference?: string;
  notes?: string;
}

export interface CampusScoutProfile {
  id: string;
  scoutCode: string; // e.g. 'SCOUT-NDU-TARIERE'
  name: string;
  email: string;
  phone: string;
  university: string;
  department: string;
  level: string; // e.g. '300L'
  avatarUrl?: string;
  commissionRate: number; // default 0.05
  totalEarnings: number; // in NGN
  availableBalance: number; // in NGN
  pendingBalance: number; // in NGN
  totalWithdrawn: number; // in NGN
  totalReferralsCount: number;
  paidTransactionsCount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: 'active' | 'pending_verification' | 'suspended';
  joinedDate: string;
  bio?: string;
}

export interface WalletTransaction {
  id: string;
  reference: string;
  type: 'deposit' | 'gift_sent' | 'gift_received' | 'interest' | 'signout_payout' | 'loan_disbursed' | 'loan_repaid' | 'data_purchase' | 'marketplace_escrow' | 'withdrawal';
  amount: number;
  date: string;
  description: string;
  category: 'savings' | 'gifting' | 'campus_orders' | 'utilities' | 'payout';
  balanceAfter: number;
  status: 'successful' | 'pending' | 'reversed';
  paymentMethod?: 'Paystack' | 'Bank Transfer' | 'STS Balance' | 'Campus Escrow' | 'USSD';
  receiptUrl?: string;
  recipientOrSender?: string;
  notes?: string;
}

export interface CampusHotspot {
  id: string;
  name: string;
  category: 'lodge' | 'faculty' | 'transit' | 'food' | 'scout' | 'library';
  location: string;
  distanceFromGate: string;
  walkingMinutes: number;
  rating: number;
  verified: boolean;
  waterLightScore?: string;
  priceRange?: string;
  description: string;
  coordinates?: { x: number; y: number }; // percentage on campus schematic 0-100
  phone?: string;
  contactPerson?: string;
}

export interface CampusInfo {
  id: string;
  name: string;
  shortName: string;
  state: string;
  city: string;
  region: string;
  latitude: number;
  longitude: number;
  studentPopulation: string;
  mainGateName: string;
  description: string;
  landmarks: string[];
  hotspots: CampusHotspot[];
  transitGuide: {
    fromMainCity: string;
    kekeFare: string;
    safeHours: string;
    tips: string;
  };
}

// 9. Campus Jobs & Student Employment Service
export interface CampusJob {
  id: string;
  title: string;
  businessName: string;
  businessOwnerName: string;
  businessOwnerPhone?: string;
  businessOwnerEmail?: string;
  category: 'graphics_tech' | 'retail_pos' | 'laundry_hostel' | 'tutoring' | 'food_bar' | 'delivery' | 'event_usher' | 'general';
  jobType: 'part_time' | 'full_time' | 'weekend_only' | 'flexible';
  location: string;
  campus: string;
  stipend: string;
  payFrequency: 'monthly' | 'weekly' | 'per_task' | 'daily';
  description: string;
  requirements: string[];
  slotsAvailable: number;
  postedDate: string;
  deadline?: string;
  status: 'open' | 'filled';
}

export interface WorkerApplicationRequest {
  id: string;
  businessName: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  campus: string;
  roleNeeded: string;
  jobType: 'part_time' | 'full_time';
  workersNeeded: number;
  payOffer: string;
  workHours: string;
  skillsRequired: string;
  submittedAt: string;
  status: 'pending' | 'routed_to_head_of_jobs' | 'matched';
}

// 10. Admin Approvals for Deposits and Withdrawals
export interface DepositWithdrawalApproval {
  id: string;
  type: 'deposit' | 'withdrawal';
  userEmail: string;
  userName: string;
  userPhone?: string;
  university: string;
  amount: number;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  method?: string; // e.g. Paystack, Bank Transfer, Direct NUBAN
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  reason?: string;
  reference: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  proofImage?: string; // Base64 data URL or image path of payment slip
  senderBankName?: string;
  senderAccountName?: string;
  paymentCategory?: string; // e.g. 'wallet_deposit' | 'sts_savings' | 'marketplace_escrow' | 'cheap_data' | 'hostel_booking' | 'crowdfunding'
}

// 11. Live Support Chat Messages & Conversations
export interface LiveSupportMessage {
  id: string;
  conversationId: string;
  senderRole: 'student' | 'admin';
  senderEmail: string;
  senderName: string;
  text: string;
  timestamp: string;
  isReadByAdmin?: boolean;
  isReadByStudent?: boolean;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: string;
  attachmentSize?: string;
  isAutoReply?: boolean;
}

export interface LiveSupportConversation {
  id: string;
  studentEmail: string;
  studentName: string;
  studentPhone?: string;
  university: string;
  avatarUrl?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadAdminCount: number;
  status: 'open' | 'resolved';
}


