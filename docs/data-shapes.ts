type ObjectId = string;

interface TermsConditions {
  desc: string;
}

interface Category {
  id: string;
  creativesCounter: number; //default:0
  title: string;
  image: string;
  tags: string[];
}

interface User {
  id: string;
  name: string;
  phoneNumber: { key: string; number: string };
  username: string;
  password: string;
  verificationCode: { code: string; expireAt: Date };
  token: string;
  // version: ;
  profileImage: string;
  coverImage: string;
  location: { lat: number; lng: number };
  categroy: ObjectId;
  acceptedProjectsCounter: number; // default: 0
  profileViews: number; // default: 0, virtualField
  about: string;
  isOnline: boolean; // default: false
  isAvaliableToInstantProjects: boolean; // default: false
  pricePerHour: number;
  plan: ObjectId;
  hasVerificationPadge: boolean;
  avaliableContracts: number; // default:5
  rate: { ratersCounter: number /* default:0 */; totalRates: number /* default:0 */ };
}

interface Rate {
  // index([sourceUSer, project], 'unique')
  sourceUser: ObjectId;
  project: ObjectId;
  rate: number;
  desc: string;
}

interface Like {
  // index([sourceUser, targetUser], 'unique')
  sourceUser: ObjectId;
  targetUser: ObjectId;
}

interface Follow {
  // index([sourceUser, targetUser], 'unique')
  sourceUser: ObjectId;
  targetUser: ObjectId;
}

interface Chat {
  sourceUser: ObjectId;
  targetUser: ObjectId;
  isWatched: boolean; // default: false
  attachments: string;
  message: string;
}

interface savedProject {
  userId: ObjectId;
  title: string;
  projects: [ObjectId];
}

// contact-us
interface Ticket {
  userId: ObjectId; // not-required
  name: string;
  phoneNumber: { key: string; number: string };
  message: string;
}

interface TeamProject {
  user: ObjectId;
  cover: string;
  name: string;
  category: string;
  budget: number;
  details: string;
  location: { lat: number; lang: number };
  attachments: [string];
  relatedDocuments: [string];
  shootingDays: number;
  startDate: Date;
  deadline: Date;
  projectTags: [
    {
      tagName: string;
      list: [
        { creative: ObjectId; workHours: number; status: "accepted" | "pending" | "rejected" }
      ];
    }
  ];
  state: "canceled" | "pending" | "ongoing" | "completed" | "rejected";
  submitFiles: { link: string; notes: string };
}

interface Report {
  sourceUser: ObjectId;
  targetUser: ObjectId;
  project: ObjectId;
  desc: string;
  attachments: [string];
}

interface Notification {
  targetUserId: string;
  sourceUserId: string;
  action: "follow" | "saved";
}

interface Plans {
  role: ObjectId;
}

interface Roles {
  permissions: [string];
}

interface Permissions {
  key: string;
}

interface PortfolioPost {
  user: ObjectId;
  attachments: [string];
  title: string;
  desc: string;
  address: string;
  tools: [{ name: string; fees: number }];
  equipment: [{ name: string; fees: number }];
  creatives: [{ user: ObjectId; fees: number }];
  tags: [string]; // keywords
  projectBudget: number;
  category: ObjectId;
  projectScale: { scale: number; time: "minutes" | "hours" };
  showOnHome: boolean; // default:true
  cover: [string];
}

interface PortfolioPostBooking {
  sourceUser: ObjectId;
  targetUser: ObjectId;
  portfolioPost: ObjectId;
  projectDetals: string;
  location: { lat: number; lang: number };
  attachments: [string];
  customRequirement: string;
  shootingDays: number;
  appointmentDate: Date;
  deadline: Date;
  projectDate: Date;
  isInstant: boolean;
  totalPrice: number;
  state: "canceled" | "pending" | "ongoing" | "completed" | "rejected";
  submitFiles: { link: string; notes: string };
}

interface Studio {
  user: ObjectId;
  attachments: [string];
  name: string;
  number: string;
  email: string;
  desc: string;
  equipment: [{ name: string; fees: number }];
  location: { lat: number; lang: number };
  tags: [string]; // keywords
  pricePerHour: number;
  insurance: number;
  showOnHome: boolean; // default:true
  cover: [string];
}

interface StudioBooking {
  sourceUser: ObjectId;
  targetUser: ObjectId;
  studio: ObjectId;
  equipment: [{ name: string; fees: number }];
  desc: string;
  insurrance: number;
  numberOfHours: number;
  appointmentDate: Date;
  isInstant: boolean;
  state: "canceled" | "pending" | "ongoing" | "completed";
  submit: { token: string; isScanned: boolean; scanedAt: Date };
}

interface equipmentRental {
  user: ObjectId;
  attachments: [string];
  name: string;
  number: string;
  desc: string;
  equipment: [{ name: string; fees: number }];
  location: { lat: number; lang: number };
  clientCanChooseDifferentLocation: boolean;
  tags: [string]; // keywords
  pricePerHour: number;
  insurance: number;
  showOnHome: boolean; // default:true
  cover: [string];
}

interface EquipmentRentalBooking {
  sourceUser: ObjectId;
  targetUser: ObjectId;
  equipmentRental: ObjectId;
  equipment: [{ name: string; fees: number }];
  desc: string;
  insurrance: number;
  location: { lat: number; lang: number };
  numberOfDays: number;
  appointmentDate: Date;
  isInstant: boolean;
  state: "canceled" | "pending" | "ongoing" | "completed";
  submit: { token: string; isScanned: boolean; scanedAt: Date };
}

interface Copyright {
  category: ObjectId;
  price: number;
  duration: Date;
  address: string;
  tags: [string]; // keywords
}

interface CopyRightBooking {
  sourceUser: ObjectId;
  targetUser: ObjectId;
  copyRight: ObjectId;
  desc: string;
  date: Date;
  deadline: Date;
  location: { lat: number; lang: number };
  attachments: [string];
  isInstant: boolean;
  state: "canceled" | "pending" | "ongoing" | "completed" | "rejected";
  submitFiles: { link: string; notes: string };
}

interface ProcedureBooking {
  sourceUser: ObjectId;
  targetUser: ObjectId;
  tagName: string;
  platform: string;
  projectDetails: string;
  episods: number;
  episodsDuration: number;
  expectedBudget: number;
  expectedProfit: number;
  attachments: [string];
  status: "pending" | "accepted" | "rejected" | "completed";
  selectedDate: Date;
  directoryLocation: { lat: number; lang: number };
  submit: { token: string; isScanned: boolean; scanedAt: Date };
}
