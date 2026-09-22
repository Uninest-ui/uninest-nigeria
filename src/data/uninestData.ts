import { 
  UniNestUser, 
  STSAccount, 
  STSSavingsAccount, 
  NewsItem, 
  BayelsaRoommateProfile, 
  AccommodationListing, 
  AcademicAssistRequest, 
  MarketplaceItem, 
  EscrowTransaction, 
  DataPlan, 
  DataOrder,
  VerifiedBusiness,
  StudentTestimonial,
  PhoneNotificationItem,
  FAQItem,
  StudentGift,
  StudentQuestion,
  QuestionAnswer,
  CrowdfundingCampaign
} from '../types';

export const DEFAULT_ADMIN: UniNestUser = {
  email: 'amaechihellis@gmail.com',
  phone: '08000000000',
  password: 'Admin@123',
  role: 'admin',
  verified: true,
  createdAt: '2025-01-01',
  name: 'UniNest Administration Team',
  university: 'National Universities Commission (NUC)',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
};

export const INITIAL_USERS: UniNestUser[] = [
  DEFAULT_ADMIN
];

// 1. STS: Save Till Sign-Out & Student Gifting Initial Accounts
export const INITIAL_STS_SAVINGS: STSSavingsAccount[] = [];

export const INITIAL_STS_SAVINGS_ACCOUNTS = INITIAL_STS_SAVINGS;

export const INITIAL_STS_ACCOUNTS: STSAccount[] = [];

// 2. Roommate & Accommodation Matching (Coverage: Bayelsa, Abia - ABSU, Rivers, and Delta)
export const ROOMMATE_COVERED_STATES: { id: 'Bayelsa' | 'Abia' | 'Rivers' | 'Delta'; name: string; slogan: string }[] = [
  { id: 'Bayelsa', name: 'Bayelsa State', slogan: 'BMU, NDU, FUOTUOKE, BYSPOLY, UAT' },
  { id: 'Abia', name: 'Abia State (ABSU)', slogan: 'ABSU Uturu, MOUAU Umudike, Abia Poly' },
  { id: 'Rivers', name: 'Rivers State', slogan: 'UNIPORT, RSU, IAUE, Elechi Amadi Poly, PAMO' },
  { id: 'Delta', name: 'Delta State', slogan: 'DELSU, FUPRE, DOU, UNIDEL, Ogwashi-Uku Poly' },
];

export const STATE_UNIVERSITIES_MAP: Record<'Bayelsa' | 'Abia' | 'Rivers' | 'Delta', string[]> = {
  Bayelsa: [
    'Bayelsa Medical University (BMU, Yenagoa)',
    'Niger Delta University (NDU, Amassoma & Wilberforce Island)',
    'Federal University Otuoke (FUOTUOKE)',
    'Bayelsa State Polytechnic (BYSPOLY, Aleibiri)',
    'Federal Polytechnic, Ekowe',
    'University of Africa, Toru-Orua (UAT)',
    'Bayelsa State College of Health Technology (BYCOHTECH, Otuogidi)',
    'International Institute of Tourism and Hospitality (IITH, Yenagoa)'
  ],
  Abia: [
    'Abia State University (ABSU, Uturu)',
    'Michael Okpara University of Agriculture (MOUAU, Umudike)',
    'Abia State Polytechnic (Aba)',
    'Rhema University (Aba)',
    'Gregory University (Uturu)'
  ],
  Rivers: [
    'University of Port Harcourt (UNIPORT, Choba)',
    'Rivers State University (RSU, Port Harcourt)',
    'Ignatius Ajuru University of Education (IAUE, Rumuolumeni)',
    'Captain Elechi Amadi Polytechnic (Rumuola, Port Harcourt)',
    'Ken Saro-Wiwa Polytechnic (Bori)',
    'PAMO University of Medical Sciences (Port Harcourt)'
  ],
  Delta: [
    'Delta State University (DELSU, Abraka)',
    'Federal University of Petroleum Resources (FUPRE, Effurun)',
    'Dennis Osadebay University (DOU, Asaba)',
    'University of Delta (UNIDEL, Agbor)',
    'Delta State Polytechnic (Ogwashi-Uku)',
    'Delta State Polytechnic (Otefe-Oghara)',
    'Delta State College of Health Technology (Ofuoma-Ughelli)'
  ]
};

export const BAYELSA_UNIVERSITIES = STATE_UNIVERSITIES_MAP.Bayelsa;

export const INITIAL_BAYELSA_ROOMMATES: BayelsaRoommateProfile[] = [];

export const INITIAL_BAYELSA_ACCOMMODATIONS: AccommodationListing[] = [];

// 3. Academic Assist Initial Data
export const INITIAL_ACADEMIC_ASSIST_REQUESTS: AcademicAssistRequest[] = [];

// 4. UniNest Marketplace & Escrow
export const INITIAL_MARKETPLACE_ITEMS: MarketplaceItem[] = [];

export const INITIAL_ESCROW_TRANSACTIONS: EscrowTransaction[] = [];

export const INITIAL_ACCOMMODATIONS = INITIAL_BAYELSA_ACCOMMODATIONS;
export const INITIAL_ACADEMIC_REQUESTS = INITIAL_ACADEMIC_ASSIST_REQUESTS;
export const INITIAL_ESCROWS = INITIAL_ESCROW_TRANSACTIONS;

// 5. Cheap Student Data Plans & Initial Orders
export const DATA_PLANS: DataPlan[] = [
  // MTN
  { id: 'mtn-1', network: 'MTN', size: '1GB', price: 280, validity: '30 Days', type: 'SME' },
  { id: 'mtn-2', network: 'MTN', size: '2GB', price: 560, validity: '30 Days', type: 'SME' },
  { id: 'mtn-3', network: 'MTN', size: '3GB', price: 840, validity: '30 Days', type: 'SME' },
  { id: 'mtn-5', network: 'MTN', size: '5GB', price: 1400, validity: '30 Days', type: 'SME' },
  { id: 'mtn-10', network: 'MTN', size: '10GB', price: 2750, validity: '30 Days', type: 'Corporate' },
  { id: 'mtn-20', network: 'MTN', size: '20GB', price: 5400, validity: '30 Days', type: 'Corporate' },

  // AIRTEL
  { id: 'air-1', network: 'AIRTEL', size: '1GB', price: 300, validity: '30 Days', type: 'Gifting' },
  { id: 'air-2', network: 'AIRTEL', size: '2GB', price: 600, validity: '30 Days', type: 'Gifting' },
  { id: 'air-5', network: 'AIRTEL', size: '5GB', price: 1450, validity: '30 Days', type: 'Gifting' },
  { id: 'air-10', network: 'AIRTEL', size: '10GB', price: 2850, validity: '30 Days', type: 'Corporate' },

  // GLO
  { id: 'glo-1', network: 'GLO', size: '1GB', price: 270, validity: '30 Days', type: 'SME' },
  { id: 'glo-2', network: 'GLO', size: '2GB', price: 540, validity: '30 Days', type: 'SME' },
  { id: 'glo-3', network: 'GLO', size: '3GB', price: 810, validity: '30 Days', type: 'SME' },
  { id: 'glo-5', network: 'GLO', size: '5GB', price: 1350, validity: '30 Days', type: 'SME' },
  { id: 'glo-10', network: 'GLO', size: '10GB', price: 2650, validity: '30 Days', type: 'Corporate' },

  // 9MOBILE
  { id: '9mob-1', network: '9MOBILE', size: '1GB', price: 250, validity: '30 Days', type: 'Gifting' },
  { id: '9mob-2', network: '9MOBILE', size: '2GB', price: 500, validity: '30 Days', type: 'Gifting' },
  { id: '9mob-5', network: '9MOBILE', size: '5GB', price: 1250, validity: '30 Days', type: 'Gifting' }
];

export const INITIAL_DATA_ORDERS: DataOrder[] = [];

export const INITIAL_NEWS: NewsItem[] = [
  {
    id: 'news-punch-1',
    title: 'Punch Nigeria: FG Finalizes 2026 Student Loan & Maintenance Allowances for Public Universities',
    type: 'scholarship',
    description: 'The Federal Government through NELFUND has disbursed institutional fees and monthly student upkeep stipends directly to verified university bank portals nationwide.',
    school: 'All Federal & State Universities',
    date: 'Sep 04, 2026',
    author: 'Punch Metro & Education',
    sourceName: 'Punch Nigeria Education',
    sourceUrl: 'https://punchng.com/topics/education/',
    link: 'https://punchng.com/topics/education/',
    category: 'Student Loans & Welfare'
  },
  {
    id: 'news-ptdf-1',
    title: 'PTDF Nigeria: Official Portal Opens for 2026/2027 Undergraduate Scholarship Scheme',
    type: 'scholarship',
    description: 'The Petroleum Technology Development Fund announces national merit-based awards covering full undergraduate tuition, textbook stipends, and laptop provisions.',
    school: 'Federal / Public Universities',
    date: 'Sep 03, 2026',
    author: 'PTDF Official Bulletin',
    sourceName: 'Petroleum Technology Development Fund',
    sourceUrl: 'https://ptdf.gov.ng',
    link: 'https://ptdf.gov.ng',
    category: 'Scholarships & Grants'
  },
  {
    id: 'news-premium-times-1',
    title: 'Premium Times: ASUU and Federal Government Sign Historic 2026 Academic Revitalization Compact',
    type: 'strike',
    description: 'Academic Staff Union of Universities (ASUU) NEC concludes National Executive session in Abuja, confirming that university academic sessions will remain uninterrupted without strike disruptions.',
    school: 'National Universities Commission (NUC)',
    date: 'Sep 02, 2026',
    author: 'Premium Times Nigeria',
    sourceName: 'Premium Times News',
    sourceUrl: 'https://www.premiumtimesng.com/category/news/top-news',
    link: 'https://www.premiumtimesng.com/category/news/top-news',
    category: 'Academic Calendar & Strikes'
  },
  {
    id: 'news-vanguard-1',
    title: 'Vanguard Education: UNILAG, UNIBEN & UNIPORT Release 2026 Post-UTME Merit Admissions Lists',
    type: 'school',
    description: 'Management of Southern federal institutions publish primary merit cut-off scores and commence biometric clearance for newly admitted 100L freshmen.',
    school: 'UNILAG • UNIBEN • UNIPORT',
    date: 'Sep 01, 2026',
    author: 'Vanguard Education Bureau',
    sourceName: 'Vanguard Newspaper',
    sourceUrl: 'https://www.vanguardngr.com/category/education/',
    link: 'https://www.vanguardngr.com/category/education/',
    category: 'Admissions & Cut-Offs'
  },
  {
    id: 'news-cable-1',
    title: 'The Cable: NUC Grants Full Accreditation to New Tech & Computing Programmes in Bayelsa & Delta',
    type: 'school',
    description: 'Niger Delta University (NDU), BMU Yenagoa, and Delta State University receive full 5-year NUC accreditation status for Artificial Intelligence, Cybersecurity, and Nursing degrees.',
    school: 'NDU • BMU • DELSU',
    date: 'Aug 30, 2026',
    author: 'The Cable Nigeria',
    sourceName: 'The Cable Online',
    sourceUrl: 'https://www.thecable.ng/category/education',
    link: 'https://www.thecable.ng/category/education',
    category: 'Accreditation & Campuses'
  },
  {
    id: 'news-dailypost-1',
    title: 'Daily Post: Federal Scholarship Board (FSB) Bilateral Education Agreement Application Guidelines',
    type: 'scholarship',
    description: 'Federal Ministry of Education opens online submissions for the Bilateral Education Agreement (BEA) overseas and domestic university merit fellowships.',
    school: 'Federal Ministry of Education',
    date: 'Aug 28, 2026',
    author: 'Daily Post Education Desk',
    sourceName: 'Daily Post Nigeria',
    sourceUrl: 'https://dailypost.ng/education/',
    link: 'https://dailypost.ng/education/',
    category: 'Scholarships & Grants'
  },
  {
    id: 'news-service-1',
    title: 'UniNest Save-Till-Sign-out (STS) & Student Digital Wallet Activated Nationwide',
    type: 'service',
    description: 'Students across all Nigerian universities can now save systematically towards graduation expenses, earn +12.5% yield rewards, and gift fellow students with zero transfer fees.',
    school: 'All Nigerian Universities',
    date: 'Aug 27, 2026',
    author: 'UniNest Desk',
    sourceName: 'UniNest Official Portal',
    sourceUrl: 'https://uninest.ng',
    link: 'https://uninest.ng',
    category: 'Campus Services'
  }
];

export const NIGERIAN_UNIVERSITIES = [
  'Bayelsa Medical University (BMU, Yenagoa)',
  'Niger Delta University (NDU, Amassoma & Wilberforce Island)',
  'Federal University Otuoke (FUOTUOKE)',
  'Abia State University (ABSU, Uturu)',
  'Bayelsa State Polytechnic (BYSPOLY, Aleibiri)',
  'University of Africa, Toru-Orua (UAT)',
  'University of Lagos (UNILAG)',
  'University of Ibadan (UI)',
  'Obafemi Awolowo University (OAU)',
  'University of Nigeria, Nsukka (UNN)',
  'University of Benin (UNIBEN)',
  'Ahmadu Bello University (ABU Zaria)',
  'Federal University of Technology, Owerri (FUTO)',
  'Federal University of Technology, Akure (FUTA)',
  'Lagos State University (LASU)',
  'University of Ilorin (UNILORIN)',
  'University of Port Harcourt (UNIPORT)',
  'Covenant University',
  'Yaba College of Technology (YABATECH)',
  'Kaduna Polytechnic',
  'Federal Polytechnic, Nekede'
];

export interface NigerianCampusVideo {
  id: string;
  university: string;
  shortName: string;
  state: string;
  location: string;
  caption: string;
  tag: string;
  videoUrl: string;
  posterUrl: string;
  droneHighlight: string;
}

export const NIGERIAN_CAMPUS_VIDEOS: NigerianCampusVideo[] = [
  {
    id: 'ui-drone-1',
    university: 'University of Ibadan (UI)',
    shortName: 'UI Ibadan',
    state: 'Oyo State',
    location: 'Ibadan North, Oyo',
    caption: 'Premier University Aerial View & Kenneth Dike Quad',
    tag: 'The Premier University (Est. 1948)',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-large-university-campus-with-lush-greenery-42878-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=1600&auto=format&fit=crop&q=80',
    droneHighlight: 'Iconic Tower & Faculty Quads'
  },
  {
    id: 'unilag-drone-1',
    university: 'University of Lagos (UNILAG)',
    shortName: 'UNILAG Akoka',
    state: 'Lagos State',
    location: 'Akoka, Yaba, Lagos',
    caption: 'Senate High-Rise & Lagoon Front Waterfront Campus',
    tag: 'First Choice University (Akoka)',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-group-of-young-students-walking-in-a-university-corridor-42868-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=1600&auto=format&fit=crop&q=80',
    droneHighlight: 'Lagoon Front & Senate Tower'
  },
  {
    id: 'ndu-drone-1',
    university: 'Niger Delta University (NDU)',
    shortName: 'NDU Gloryland',
    state: 'Bayelsa State',
    location: 'Wilberforce Island, Amassoma',
    caption: 'Gloryland Main Campus, Engineering Labs & Senate Walk',
    tag: 'Niger Delta Flagship',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-students-walking-on-a-university-campus-42870-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1600&auto=format&fit=crop&q=80',
    droneHighlight: 'Wilberforce Island Campus Grounds'
  },
  {
    id: 'bmu-drone-1',
    university: 'Bayelsa Medical University (BMU)',
    shortName: 'BMU Yenagoa',
    state: 'Bayelsa State',
    location: 'Onopa, Yenagoa, Bayelsa',
    caption: 'Clinical Sciences Complex & Medical Lecture Halls',
    tag: 'Bayelsa Medical Pioneer',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-university-students-having-a-discussion-outdoors-42873-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1600&auto=format&fit=crop&q=80',
    droneHighlight: 'Onopa Medical & Healthcare Campus'
  },
  {
    id: 'oau-drone-1',
    university: 'Obafemi Awolowo University (OAU)',
    shortName: 'Great IFE (OAU)',
    state: 'Osun State',
    location: 'Ile-Ife, Osun',
    caption: 'Great Ife Amphitheatre, Spider Building & Senate Grounds',
    tag: 'Africa Most Beautiful Campus',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-diverse-students-studying-outdoors-on-a-university-campus-42874-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1568792923760-d70635a89fa8?w=1600&auto=format&fit=crop&q=80',
    droneHighlight: 'Amphitheatre & Historic Senate Quad'
  },
  {
    id: 'unn-drone-1',
    university: 'University of Nigeria, Nsukka (UNN)',
    shortName: 'UNN Lions',
    state: 'Enugu State',
    location: 'Nsukka, Enugu',
    caption: 'Princess Alexandra Auditorium & Green Valley Grounds',
    tag: 'To Restore Dignity of Man (Nsukka)',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-large-university-campus-with-lush-greenery-42878-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=1600&auto=format&fit=crop&q=80',
    droneHighlight: 'Lions Campus Green Hills'
  }
];

export const NIGERIAN_CAMPUS_PHOTOS = [
  {
    id: 'bmu-1',
    university: 'Bayelsa Medical University (BMU)',
    shortName: 'BMU Yenagoa',
    state: 'Bayelsa State',
    location: 'Onopa, Yenagoa',
    caption: 'Faculty of Clinical Sciences & Medical Complex',
    tag: 'Medical Excellence',
    imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1600&auto=format&fit=crop&q=80'
  },
  {
    id: 'ndu-1',
    university: 'Niger Delta University (NDU)',
    shortName: 'NDU Gloryland',
    state: 'Bayelsa State',
    location: 'Wilberforce Island, Amassoma',
    caption: 'Faculty of Engineering & Main Senate Quad',
    tag: 'Niger Delta Flagship',
    imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1600&auto=format&fit=crop&q=80'
  },
  {
    id: 'fuotuoke-1',
    university: 'Federal University Otuoke (FUOTUOKE)',
    shortName: 'FUOTUOKE',
    state: 'Bayelsa State',
    location: 'Otuoke, Ogbia LGA',
    caption: 'Faculty of Humanities & Social Sciences Plaza',
    tag: 'Federal Innovation',
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&auto=format&fit=crop&q=80'
  },
  {
    id: 'unilag-1',
    university: 'University of Lagos (UNILAG)',
    shortName: 'UNILAG Akoka',
    state: 'Lagos State',
    location: 'Akoka, Yaba',
    caption: 'Iconic Senate High-Rise & Lagoon Front Campus',
    tag: 'First Choice University',
    imageUrl: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=1600&auto=format&fit=crop&q=80'
  },
  {
    id: 'ui-1',
    university: 'University of Ibadan (UI)',
    shortName: 'UI Ibadan',
    state: 'Oyo State',
    location: 'Ibadan North',
    caption: 'Kenneth Dike Library & Historic Premier Tower',
    tag: 'The Premier University',
    imageUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=1600&auto=format&fit=crop&q=80'
  },
  {
    id: 'oau-1',
    university: 'Obafemi Awolowo University (OAU)',
    shortName: 'Great IFE (OAU)',
    state: 'Osun State',
    location: 'Ile-Ife',
    caption: 'Architectural Heritage: Spider Building & Amphitheatre',
    tag: 'Great Ife Architecture',
    imageUrl: 'https://images.unsplash.com/photo-1568792923760-d70635a89fa8?w=1600&auto=format&fit=crop&q=80'
  },
  {
    id: 'unn-1',
    university: 'University of Nigeria, Nsukka (UNN)',
    shortName: 'UNN Lions',
    state: 'Enugu State',
    location: 'Nsukka',
    caption: 'Princess Alexandra Auditorium & Central Green',
    tag: 'To Restore Dignity of Man',
    imageUrl: 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=1600&auto=format&fit=crop&q=80'
  },
  {
    id: 'uniben-1',
    university: 'University of Benin (UNIBEN)',
    shortName: 'UNIBEN Ugbowo',
    state: 'Edo State',
    location: 'Ugbowo, Benin City',
    caption: 'Ugbowo Main Campus Complex & Hall of Residence Quad',
    tag: 'Knowledge and Character',
    imageUrl: 'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=1600&auto=format&fit=crop&q=80'
  },
  {
    id: 'uniport-1',
    university: 'University of Port Harcourt (UNIPORT)',
    shortName: 'UNIPORT Choba',
    state: 'Rivers State',
    location: 'Choba, Port Harcourt',
    caption: 'Donald Ekong Library & Abuja Campus Park',
    tag: 'Unique UNIPORT',
    imageUrl: 'https://images.unsplash.com/photo-1492538368677-f6e0afe31dcc?w=1600&auto=format&fit=crop&q=80'
  },
  {
    id: 'abu-1',
    university: 'Ahmadu Bello University (ABU Zaria)',
    shortName: 'ABU Zaria',
    state: 'Kaduna State',
    location: 'Samaru, Zaria',
    caption: 'Kashim Ibrahim Library & Senate Quadrangle',
    tag: 'Naturally Ahead',
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_SUBSCRIBERS: string[] = [];

// 6. Verified Scouts & Marketplace Profiles (Only 2 Official Profiles: Scout & UniNest Marketplace)
export const INITIAL_VERIFIED_BUSINESSES: VerifiedBusiness[] = [
  {
    id: 'biz-head-scouts',
    ownerEmail: 'scouts@uninest.ng',
    ownerName: 'UniNest Campus Scout',
    businessName: 'Campus Scout',
    accountType: 'house_agent',
    category: 'Lodge & Housing Scout',
    state: 'Bayelsa',
    campus: 'All Campuses (NDU, BMU, FUOTUOKE, UNIPORT, DELSU, UNILAG)',
    locationAddress: 'Campus Students Union Plaza & Verified Lodges Inspection Hub',
    phone: '09034648644',
    whatsapp: '2349034648644',
    description: 'Official UniNest Campus Scout. Get verified lodge inspections, off-campus accommodation bookings, roommate matching, and water/security audits with 0% agent extortion. Chat directly with the Head of Scouts on WhatsApp to inspect lodges or secure verified housing.',
    priceRange: 'Free Inspection • Verified Lodges',
    pictures: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop&q=80'
    ],
    isVerified: true,
    rating: 5.0,
    reviewsCount: 48,
    monthlyFeePaid: true,
    monthlyFeeAmount: 1000,
    subscriptionExpiry: '2027-12-31',
    agentDetails: {
      agencyRegNumber: 'UNINEST/SCOUT/OFFICIAL/01',
      inspectionFeePolicy: 'Free Inspection (Zero Agent Extortion)',
      coverageZones: 'Main Gates, New Sites, College of Health Sciences & Campus Hostels',
      availableRoomTypes: ['Self-Contain', 'Single Room', 'Two-Bedroom Flat', 'Bedspace Sharing', 'Lodge Inspection']
    },
    reviews: [
      {
        id: 'rev-scout-01',
        studentName: 'Tariere Ebimobowei',
        studentSchool: 'NDU Amassoma',
        studentAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80',
        rating: 5,
        comment: 'The Head of Scouts responded on WhatsApp immediately, did a video tour of the lodge, and verified the borehole water before I paid. 100% safe!',
        date: 'Today'
      },
      {
        id: 'rev-scout-02',
        studentName: 'Precious Alagoa',
        studentSchool: 'BMU Yenagoa',
        studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        rating: 5,
        comment: 'No double-agent extortion. Inspected the self-contain with the scout and everything was exactly as described.',
        date: 'Yesterday'
      }
    ],
    createdAt: '2026-07-15'
  },
  {
    id: 'biz-head-marketplace',
    ownerEmail: 'marketplace@uninest.ng',
    ownerName: 'Campus Orders Desk (Head of Marketplace)',
    businessName: 'UniNest Market Place — Place Your Order',
    accountType: 'vendor',
    category: 'Marketplace & Hostel Delivery',
    state: 'Bayelsa',
    campus: 'All Campuses (NDU, BMU, FUOTUOKE, UNIPORT, DELSU, UNILAG)',
    locationAddress: 'UniNest Central Campus Hub & Hostels Delivery Desk',
    phone: '09034648644',
    whatsapp: '2349034648644',
    description: 'Official UniNest Campus Marketplace. Place your order for student laptops, phones, power banks, chargers, textbooks, provisions, meals, and campus essentials. Express direct delivery to your hostel room with 100% Escrow buyer protection.',
    priceRange: 'Affordable Student Prices • Escrow Guaranteed',
    pictures: [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80'
    ],
    isVerified: true,
    rating: 5.0,
    reviewsCount: 62,
    monthlyFeePaid: true,
    monthlyFeeAmount: 1000,
    subscriptionExpiry: '2027-12-31',
    vendorDetails: {
      storeCategory: 'Laptops, Phones, Food, Provisions & Student Supplies',
      deliveryToHostels: true,
      deliveryEstimatedTime: '15-30 minutes direct hostel room delivery',
      shopPhysicalLocation: 'UniNest Central Campus Hub & Dispatch Office'
    },
    reviews: [
      {
        id: 'rev-market-01',
        studentName: 'Kemegha Ayiba',
        studentSchool: 'FUOTUOKE Computer Science',
        studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        rating: 5,
        comment: 'Placed my order directly on WhatsApp with the Head of Marketplace. Got my laptop charger and notebook delivered to my hostel in 20 minutes.',
        date: 'Today'
      },
      {
        id: 'rev-market-02',
        studentName: 'Tunde Bakare',
        studentSchool: 'UNILAG Law',
        studentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
        rating: 5,
        comment: 'Very reliable ordering desk. The WhatsApp team confirmed my specs and the delivery guy brought it right to my hall.',
        date: 'Yesterday'
      }
    ],
    createdAt: '2026-06-20'
  }
];

// 7. Cross-University Q&A Questions (Type or Picture format)
export const INITIAL_STUDENT_QUESTIONS: StudentQuestion[] = [
  {
    id: 'q-001',
    authorEmail: 'ebi.tonye@fuotuoke.edu.ng',
    authorName: 'Ebiere Tonye',
    authorUniversity: 'Federal University Otuoke (FUOTUOKE)',
    authorDepartment: 'Computer Science',
    authorAvatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80',
    state: 'Bayelsa',
    title: 'Solve MTH 102 Calculus integration by parts with boundary limits [0 to 1]',
    questionText: 'Evaluate the definite integral ∫ from 0 to 1 of x^2 * e^(2x) dx. I need the full step-by-step breakdown using integration by parts tabular method or UV formula for my continuous assessment test tomorrow morning.',
    questionPictureUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=700&auto=format&fit=crop&q=80',
    courseCode: 'MTH 102',
    subjectCategory: 'Mathematics & Engineering',
    urgency: 'Immediate (Within 1 hour)',
    targetUniversity: 'All Nigerian Universities',
    bountyTip: 500,
    status: 'Answered',
    createdAt: 'Today, 25 mins ago',
    viewsCount: 42,
    answers: [
      {
        id: 'ans-01',
        questionId: 'q-001',
        authorEmail: 'student@campus.edu',
        authorName: 'Tariere Ebimobowei',
        authorUniversity: 'Niger Delta University (NDU)',
        authorDepartment: 'Civil Engineering (400L)',
        authorAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80',
        answerText: 'Step 1: Use integration by parts ∫ u dv = uv - ∫ v du.\nLet u = x^2 => du = 2x dx.\nLet dv = e^(2x) dx => v = (1/2)e^(2x).\n\nStep 2: First application gives:\n[(x^2/2) * e^(2x)] - ∫ x * e^(2x) dx.\n\nStep 3: Integrate ∫ x * e^(2x) dx again by parts:\nLet u = x => du = dx; dv = e^(2x) dx => v = (1/2)e^(2x).\nSo ∫ x e^(2x) dx = (x/2)e^(2x) - (1/4)e^(2x).\n\nStep 4: Combine full indefinite integral:\n(x^2/2)e^(2x) - (x/2)e^(2x) + (1/4)e^(2x) = e^(2x) * [(2x^2 - 2x + 1)/4].\n\nStep 5: Plug in limits 0 to 1:\nAt x=1: e^2 * [(2(1) - 2(1) + 1)/4] = (1/4)e^2.\nAt x=0: e^0 * [1/4] = 1/4.\n\nFINAL EXACT ANSWER: (1/4)(e^2 - 1) ≈ 1.597. Check the attached handwritten photo for line-by-line verification!',
        solutionPictureUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=700&auto=format&fit=crop&q=80',
        isAccepted: true,
        upvotes: 8,
        createdAt: '15 mins ago'
      }
    ]
  },
  {
    id: 'q-002',
    authorEmail: 'precious.alagoa@ndu.edu.ng',
    authorName: 'Precious Alagoa',
    authorUniversity: 'Niger Delta University (NDU)',
    authorDepartment: 'Nursing Science',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    state: 'Bayelsa',
    title: 'Pharmacology dosage calculation for Pediatric Amoxicillin suspension',
    questionText: 'A child weighing 18 kg is prescribed Amoxicillin 25 mg/kg/day divided into three equal doses every 8 hours. The suspension available on the ward is 125 mg/5 mL. How many mL should the student nurse administer per dose?',
    courseCode: 'PHA 204',
    subjectCategory: 'Medical & Health',
    urgency: 'Immediate (Within 1 hour)',
    targetUniversity: 'All Nigerian Universities (BMU, UNIPORT, UNILAG)',
    bountyTip: 1000,
    status: 'Answered',
    createdAt: 'Today, 1 hour ago',
    viewsCount: 38,
    answers: [
      {
        id: 'ans-02',
        questionId: 'q-002',
        authorEmail: 'tariere.preye@bmu.edu.ng',
        authorName: 'Tariere Preye-Douglas',
        authorUniversity: 'Bayelsa Medical University (BMU)',
        authorDepartment: 'Medicine and Surgery (400L)',
        authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
        answerText: 'Here is the precise clinical calculation:\n1. Total daily dose = 18 kg × 25 mg/kg = 450 mg/day.\n2. Single dose (divided into 3 doses) = 450 mg ÷ 3 = 150 mg per dose.\n3. Using formula (Desired ÷ Available) × Volume:\n(150 mg ÷ 125 mg) × 5 mL = 1.2 × 5 mL = 6.0 mL per dose.\n\nAdminister exactly 6 mL orally every 8 hours.',
        isAccepted: true,
        upvotes: 12,
        createdAt: '45 mins ago'
      }
    ]
  },
  {
    id: 'q-003',
    authorEmail: 'oghene.k@delsu.edu.ng',
    authorName: 'Oghenekevwe O.',
    authorUniversity: 'Delta State University (DELSU, Abraka)',
    authorDepartment: 'Economics',
    state: 'Delta',
    title: 'GST 111 Logic: Identifying informal fallacy in politician statement',
    questionText: 'Attached is an image of our past question paper item 24 on Informal Fallacies. Can a philosophy or law student from UNILAG, UI, or UNN explain why the answer is Argumentum Ad Hominem rather than Straw Man?',
    questionPictureUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=700&auto=format&fit=crop&q=80',
    courseCode: 'GST 111',
    subjectCategory: 'General Studies (GST)',
    urgency: 'Today',
    targetUniversity: 'All Nigerian Universities',
    status: 'Open',
    createdAt: 'Today, 2 hours ago',
    viewsCount: 55,
    answers: []
  }
];

// 8. Real Nigerian Student Testimonials (5-Star Verified)
export const INITIAL_TESTIMONIALS: StudentTestimonial[] = [
  {
    id: 'test-01',
    studentName: 'Tariere Ebimobowei',
    school: 'Niger Delta University (NDU)',
    department: 'Civil Engineering',
    level: '400L',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    serviceTag: 'Student Gifting & STS',
    quote: 'Being able to gift my course mate ₦5,000 for exam handouts straight from my STS balance is a game changer! No bank transfer charges, and my savings towards graduation sign-out keeps growing safely.',
    date: 'Aug 28, 2026',
    verifiedStudent: true
  },
  {
    id: 'test-02',
    studentName: 'Precious Alagoa',
    school: 'Niger Delta University (NDU)',
    department: 'Nursing Science',
    level: '300L',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    serviceTag: 'Roommate Match',
    quote: 'Finding a clinical roommate at NDU who matched my night-reading and quiet study habits used to be impossible. Through UniNest, I connected with Tariere on WhatsApp and we split a self-contain smoothly!',
    date: 'Aug 22, 2026',
    verifiedStudent: true
  },
  {
    id: 'test-03',
    studentName: 'Tariere Preye-Douglas',
    school: 'Bayelsa Medical University (BMU)',
    department: 'Medicine and Surgery (MBBS)',
    level: '400L',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    serviceTag: 'Verified Lodge Agent',
    quote: 'I used UniNest Verified Agents to inspect a secure lodge near BMU hospital without any agent extortion or double commission. The facial identity verification on the platform makes you feel 100% secure.',
    date: 'Aug 19, 2026',
    verifiedStudent: true
  },
  {
    id: 'test-04',
    studentName: 'Kemegha Ayiba',
    school: 'Federal University Otuoke (FUOTUOKE)',
    department: 'Computer Science',
    level: '200L',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    serviceTag: 'Cheap Data & Marketplace',
    quote: 'I buy my 5GB and 10GB SME data here every month for coding tutorials. It arrives in under 5 seconds! Plus, I sold my mini-fridge through UniNest Escrow without any fear of campus scammers.',
    date: 'Aug 15, 2026',
    verifiedStudent: true
  }
];

// 8. Campus Phone Notifications & Flash Alerts (Student Gifting is exempt; delivered to student email)
export const INITIAL_PHONE_NOTIFICATIONS: PhoneNotificationItem[] = [
  {
    id: 'notif-01',
    title: '🎓 Federal Government Bilateral Education Scholarship Open',
    message: 'Federal Scholarship Board (FSB) 2026/2027 Bilateral Education Agreement (BEA) awards are now open for undergraduates in NDU, BMU, FUOTUOKE, UNIPORT & DELSU. CGPA 4.0+ required.',
    campusTag: 'All Campuses',
    category: 'Scholarship Alert',
    timeAgo: '12m ago',
    date: 'Sep 02, 2026',
    priority: 'high',
    isRead: false,
    sentToEmail: true,
    emailRecipientCount: 1420
  },
  {
    id: 'notif-02',
    title: '📢 ASUU & Senate Academic Calendar Harmonization Notice',
    message: 'Joint University Senate committee has ratified the 2026/2027 academic session harmonization. 1st semester Computer-Based Test (CBT) schedules and lecture timetables are confirmed.',
    campusTag: 'All Campuses',
    category: 'Academic Calendar',
    timeAgo: '45m ago',
    date: 'Sep 02, 2026',
    priority: 'normal',
    isRead: false,
    sentToEmail: true,
    emailRecipientCount: 1285
  },
  {
    id: 'notif-03',
    title: '🏠 New Verified Lodge Release in Amassoma (NDU Gate)',
    message: 'Comr. Preye just uploaded 4 brand new self-contain units at Peace Haven Lodge with constant borehole water and dedicated security light.',
    campusTag: 'NDU Amassoma',
    category: 'Hostel Release',
    timeAgo: '2h ago',
    date: 'Sep 02, 2026',
    priority: 'normal',
    isRead: true,
    sentToEmail: true,
    emailRecipientCount: 430
  },
  {
    id: 'notif-04',
    title: '⚡ 2nd Semester GST Exam Timetable Released',
    message: 'Senate committee has published the Computer-Based Test (CBT) batch schedules. Clear all departmental library and tuition receipts before Thursday.',
    campusTag: 'BMU Yenagoa',
    category: 'Exam Clearance',
    timeAgo: '4h ago',
    date: 'Sep 01, 2026',
    priority: 'high',
    isRead: true,
    sentToEmail: true,
    emailRecipientCount: 650
  },
  {
    id: 'notif-05',
    title: '💼 Campus Scout & Academic Assistant Application Window',
    message: 'UniNest is hiring verified campus scouts and academic research assistants. Get paid bi-weekly helping fellow students find verified lodges & study resources.',
    campusTag: 'All Campuses',
    category: 'Academic Calendar',
    timeAgo: '1d ago',
    date: 'Aug 31, 2026',
    priority: 'normal',
    isRead: true,
    sentToEmail: true,
    emailRecipientCount: 980
  }
];

// 9. Frequently Asked Questions (FAQ)
export const INITIAL_FAQS: FAQItem[] = [
  {
    id: 'faq-01',
    category: 'Gifting & STS',
    question: 'How does UniNest Student Gifting work?',
    answer: 'Student Gifting allows any student to send financial support, feeding allowance, or exam handout funds directly to another student using their saved STS balance. Enter your course mate\'s email or phone number, pick a heartwarming occasion (e.g. Exam Lunch, Birthday, Sign-out celebration), and the funds transfer instantly without inter-bank transaction fees!'
  },
  {
    id: 'faq-02',
    category: 'Gifting & STS',
    question: 'What is STS (Save Till Sign-Out) and how much does it cost to open an account?',
    answer: 'STS helps students build systematic savings towards their final year project, clearance fees, graduation gown, and post-campus life. Opening an STS account is ₦500 for first timers. The service is active for all Bayelsa State universities and Abia State University (ABSU). When your final sign-out exam is completed, simply upload your graduation sign-out celebration photo for face verification to unlock your accumulated sign-out payout directly to your bank account.'
  },
  {
    id: 'faq-03',
    category: 'Verified Agents & Sellers',
    question: 'How do agents and sellers become verified on UniNest?',
    answer: 'Verified campus agents and sellers submit their official business profile, registered physical location on campus, active WhatsApp contact, and high-resolution photos of their business or lodges. UniNest team checks the physical premises and student references before granting the official Verified Badge with 5-Star student reviews.'
  },
  {
    id: 'faq-04',
    category: 'Verified Agents & Sellers',
    question: 'Can students write 5-star reviews on campus businesses?',
    answer: 'Yes! Any registered student can leave a verified 5-star review, rating from 1 to 5 stars with detailed feedback on timeliness, honesty, and quality. This helps keep all campus lodge agents, gadget sellers, and food vendors accountable.'
  },
  {
    id: 'faq-05',
    category: 'Housing & Roommates',
    question: 'Which states and campuses are covered for Roommate Matching & Accommodations?',
    answer: 'Roommate Matching & campus services are active across Bayelsa State (BMU Yenagoa, NDU Amassoma, FUOTUOKE, BYSPOLY, UAT), Abia State (Abia State University - ABSU Uturu), Rivers State (UNIPORT, RSU, IAUE), and Delta State (DELSU Abraka, FUPRE, UNIDEL). Accommodations and lodge listings are active for Bayelsa and ABSU institutions.'
  },
  {
    id: 'faq-06',
    category: 'Earn as Scout & Assistant',
    question: 'How can I get paid as a Campus Scout or Academic Assistant?',
    answer: 'UniNest pays active students to scout verified off-campus lodges, verify campus sellers, or provide peer academic guidance on final year projects, data analysis, and assignments. Click the animated WhatsApp banner or contact our recruitment desk on WhatsApp (+234 813 904 5612) to get onboarded as an authorized UniNest Scout.'
  },
  {
    id: 'faq-07',
    category: 'Academic Assist',
    question: 'How does UniNest Escrow protect students when buying or selling on campus?',
    answer: 'When a student orders a laptop, textbook, or hostel appliance, their payment is safely locked in UniNest Escrow vault. The seller only receives the money after the buyer physically inspects and confirms the item in good working condition.'
  }
];

// 10. Crowdfunding Campaigns (Pending, Approved & Live, and Paid Out with Proof)
export const INITIAL_CROWDFUNDING_CAMPAIGNS: CrowdfundingCampaign[] = [];
