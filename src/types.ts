export type Role = 'CLIENT' | 'TECHNICIAN' | 'VERIFIER' | 'ADMIN'
export type VerificationStatus = 'CREATED' | 'PENDING_VERIFICATION' | 'VERIFIED'

export interface Session {
  token: string
  userId: string
  fullName: string
  email: string
  role: Role
  verificationStatus: VerificationStatus
  emailVerified: boolean
  phoneVerified: boolean
  documentsVerified: boolean
  onboardingCompleted: boolean
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  active: boolean
}

export interface CatalogItem {
  id: string
  name: string
}

export interface ServiceRequest {
  id: string
  clientId: string
  clientName: string
  technicianId?: string
  technicianName?: string
  clientProfilePhotoUrl?: string
  clientAverageRating: number
  clientPaidServicesCount: number
  technicianProfilePhotoUrl?: string
  technicianAverageRating?: number
  technicianCompletedServicesCount: number
  technicianExperienceDescription?: string
  technicianCategories: string[]
  certifiedTechnician?: boolean
  categoryId: string
  categoryName: string
  description: string
  address: string
  latitude: number
  longitude: number
  distanceKm?: number
  estimatedPrice?: number
  technicianPrice?: number
  finalPrice?: number
  requestedPaymentMethod: 'CASH' | 'BREB' | 'NEQUI' | 'DAVIPLATA' | 'BANCOLOMBIA' | 'DAVIVIENDA' | 'WOMPI' | 'MERCADO_PAGO' | 'PAYU'
  status: RequestStatus
  createdAt: string
  serviceImagesCount: number
  firstServiceImageUrl?: string
  images: ServiceRequestImage[]
  cityId?: string
  cityName?: string
}

export interface ServiceRequestImage {
  id: string
  serviceRequestId: string
  imageUrl: string
  publicId: string
  contentAssetId?: string
  moderationStatus: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'FLAGGED'
  createdAt: string
}

export interface ServiceQuote {
  id: string
  serviceRequestId: string
  technicianId: string
  technicianName: string
  technicianProfilePhotoUrl?: string
  technicianAverageRating: number
  technicianCompletedServicesCount: number
  technicianExperienceDescription?: string
  technicianCategories: string[]
  certifiedTechnician?: boolean
  price: number
  description?: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED'
  createdAt: string
  updatedAt: string
  expiresAt: string
  respondedAt?: string
}

export type RequestStatus = 'QUOTE_PENDING' | 'QUOTED' | 'QUOTE_ACCEPTED' | 'ON_THE_WAY' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'PAID' | 'PAYMENT_DISPUTE' | 'CANCELLED'
export type TechnicianStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'BLOCKED'

export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  message: string
  moderationStatus: 'PENDING' | 'APPROVED' | 'FLAGGED' | 'BLOCKED'
  moderationReason?: string
  createdAt: string
  readAt?: string
}

export interface UserNotification {
  id: string
  title: string
  message: string
  type: 'NEW_REQUEST' | 'NEW_QUOTE' | 'QUOTE_ACCEPTED' | 'REQUEST_ACCEPTED'
    | 'QUOTE_REJECTED' | 'PAYMENT_PROOF_UPLOADED' | 'SERVICE_EVIDENCE_UPLOADED'
    | 'PAYMENT_PROOF_VERIFIED'
    | 'TECHNICIAN_ON_THE_WAY' | 'TECHNICIAN_ARRIVED' | 'SERVICE_STARTED'
    | 'SERVICE_COMPLETED' | 'NEW_CHAT_MESSAGE' | 'NEW_RATING' | 'SERVICE_STATUS_CHANGED'
    | 'LEGAL_ACCEPTANCE_REQUIRED' | 'CONTENT_MODERATION_ALERT' | 'CHAT_MODERATION_ALERT'
  read: boolean
  createdAt: string
  route?: string
  requestId?: string
}

export interface UnreadCount {
  count: number
}

export interface TechnicianProfile {
  id: string
  fullName: string
  email: string
  documentNumber: string
  phone: string
  categories: Category[]
  description: string
  latitude?: number
  longitude?: number
  status: TechnicianStatus
  profilePhotoUrl?: string
  documentPhotoUrl: string
  profilePhotoFaceValidated?: boolean
  certificatePhotoUrl?: string
  workExperienceDescription: string
  averageRating: number
  completedServicesCount: number
  paidServicesCount: number
  verificationStatus: VerificationStatus
  homeAddress: string
  homeLatitude: number
  homeLongitude: number
  homeCity?: string
  homeNeighborhood?: string
  countryId?: string
  countryName?: string
  departmentId?: string
  departmentName?: string
  cityId?: string
  cityName?: string
}

export interface UserProfile {
  id: string
  fullName: string
  email: string
  phone?: string
  role: Role
  profilePhotoUrl?: string
  documentPhotoUrl?: string
  documentType?: 'CC' | 'PASSPORT'
  documentNumber?: string
  documentFrontUrl?: string
  documentBackUrl?: string
  documentSingleUrl?: string
  faceDetectionStatus?: 'AUTO_VALIDATED' | 'MANUAL_REVIEW_REQUIRED' | 'FAILED'
  identityDocumentCaptureStatus?: 'AUTO_CAPTURED' | 'MANUAL_CAPTURED' | 'MANUAL_REVIEW_REQUIRED'
  certificatePhotoUrl?: string
  workExperienceDescription?: string
  averageRating: number
  completedServicesCount: number
  paidServicesCount: number
  verificationStatus: VerificationStatus
  emailVerified: boolean
  phoneVerified: boolean
  documentsVerified: boolean
  homeAddress?: string
  homeLatitude?: number
  homeLongitude?: number
  homeCity?: string
  homeNeighborhood?: string
  countryId?: string
  countryName?: string
  departmentId?: string
  departmentName?: string
  cityId?: string
  cityName?: string
  accountStatus?: 'ACTIVE' | 'INACTIVE_PAYMENT' | 'INACTIVE_REPORT' | 'INACTIVE_ADMIN' | 'BLOCKED' | 'DELETED_LOGICAL'
  inactiveReason?: string
  inactiveComment?: string
  profilePhotoFaceValidated?: boolean
}

export interface UserVerification {
  id: string
  fullName: string
  email: string
  role: Role
  verificationStatus: VerificationStatus
  documentPhotoUrl: string
  certificatePhotoUrl?: string
  workExperienceDescription?: string
  createdAt: string
}

export type RootStackParamList = {
  Login: undefined
  Register: undefined
  ForgotPassword: undefined
  ResetPassword: { token?: string } | undefined
  Home: undefined
  EmailConfirmationRequired: undefined
  OnboardingRequired: {
    selfieUri?: string
    faceDetectionStatus?: 'AUTO_VALIDATED' | 'MANUAL_REVIEW_REQUIRED' | 'FAILED'
    documentFrontUri?: string
    documentBackUri?: string
    documentSingleUri?: string
    identityDocumentCaptureStatus?: 'AUTO_CAPTURED' | 'MANUAL_CAPTURED' | 'MANUAL_REVIEW_REQUIRED'
  } | undefined
  CaptureSelfie: undefined
  CaptureIdentityDocument: { documentType: 'CC' | 'PASSPORT' }
  ClientRequests: undefined
  ClientPayments: undefined
  RequestService: undefined
  NearbyTechnicians: undefined
  RequestDetail: { request: ServiceRequest }
  RequestHistory: undefined
  NotificationRequest: { requestId: string }
  Chat: { requestId: string }
  Notifications: undefined
  Rating: { requestId: string }
  Profile: undefined
  TechnicianHome: undefined
  TechnicianEntry: undefined
  TechnicianProfile: undefined
  AvailableRequests: undefined
  TechnicianHistory: undefined
  TechnicianEarnings: undefined
  ServiceSupport: { requestId: string }
  Legal: undefined
  CaptureProfilePhoto: undefined
  TechnicianReferrals: undefined
  ChatModeration: undefined
}

export interface Payment {
  paymentId: string
  serviceRequestId: string
  amount: number
  platformFee: number
  technicianAmount: number
  platformCommissionPercentage: number
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
  paymentMethod: 'CASH' | 'WOMPI' | 'MERCADO_PAGO' | 'PAYU'
  createdAt: string
}

export interface TechnicianLocation {
  technicianId: string
  technicianName: string
  latitude: number
  longitude: number
  accuracy?: number
  speed?: number
  heading?: number
  online: boolean
  updatedAt: string
}

export interface NearbyTechnician {
  technicianId: string
  technicianName: string
  profilePhotoUrl?: string
  averageRating: number
  completedServicesCount: number
  latitude: number
  longitude: number
  distanceKm: number
  updatedAt: string
}

export interface FinancialSummary {
  totalAmount: number
  totalPlatformFee: number
  totalTechnicianAmount: number
  paymentCount: number
  payments: Payment[]
}

export interface TechnicianWallet {
  walletId?: string
  technicianId: string
  technicianName: string
  technicianEmail: string
  technicianPhone?: string
  balance: number
  currency: string
  rechargeEnabled: boolean
  lowBalance: boolean
  blocked: boolean
  lowBalanceMinimum: number
  minRechargeAmount: number
  maxRechargeAmount: number
  totalApprovedRecharges: number
  totalCommissionDebits: number
  completedServicesCount: number
  updatedAt?: string
}

export interface TechnicianWalletTransaction {
  id: string
  type: 'RECHARGE_PENDING' | 'RECHARGE_APPROVED' | 'RECHARGE_REJECTED' | 'COMMISSION_DEBIT' | 'COMMISSION_REFUND' | 'ADMIN_ADJUSTMENT'
  amount: number
  balanceBefore: number
  balanceAfter: number
  reference?: string
  description?: string
  createdAt: string
}

export interface RechargeResponse {
  rechargeId: string
  reference: string
  amount: number
  currency: string
  paymentUrl: string
}

export interface ReferralCode {
  id: string
  technicianId: string
  technicianName: string
  code: string
  active: boolean
  createdAt: string
  registered: number
  qualified: number
  availableRewards: number
  usedRewards: number
}

export interface ReferralRegistration {
  id: string
  referredUserId: string
  referredUserName: string
  referredUserRole: 'CLIENT' | 'TECHNICIAN'
  status: 'REGISTERED' | 'QUALIFIED' | 'REWARD_GRANTED' | 'CANCELLED'
  createdAt: string
}

export interface ReferralReward {
  id: string
  rewardType: 'FREE_COMMISSION_SERVICE'
  status: 'AVAILABLE' | 'USED' | 'EXPIRED' | 'CANCELLED'
  createdAt: string
  usedAt?: string
  expiresAt?: string
}

export interface AppVersionCheck {
  platform: 'ANDROID' | 'IOS'
  currentVersion: string
  latestVersion: string
  minimumSupportedVersion: string
  updateRequired: boolean
  forceUpdate: boolean
  updateUrl: string
  message: string
}
