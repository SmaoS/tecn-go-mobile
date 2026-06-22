import type {
  Category,
  ServiceQuote,
  ServiceRequest,
  Session,
  TechnicianProfile,
  UserNotification,
  UserProfile,
} from '../types'

export const fixedNow = '2026-06-22T15:00:00Z'

export function sessionFixture(overrides: Partial<Session> = {}): Session {
  return {
    token: 'test-jwt-token',
    userId: 'user-client-1',
    fullName: 'Cliente TecnGo',
    email: 'cliente@tecngo.test',
    roles: ['CLIENT'],
    activeMode: 'CLIENT',
    role: 'CLIENT',
    verificationStatus: 'VERIFIED',
    emailVerified: true,
    phoneVerified: true,
    documentsVerified: true,
    onboardingCompleted: true,
    ...overrides,
  }
}

export function categoryFixture(overrides: Partial<Category> = {}): Category {
  return {
    id: 'category-electrician',
    name: 'Electricista',
    slug: 'electricista',
    description: 'Servicios eléctricos',
    active: true,
    ...overrides,
  }
}

export function serviceRequestFixture(
  overrides: Partial<ServiceRequest> = {},
): ServiceRequest {
  return {
    id: 'request-1',
    clientId: 'user-client-1',
    clientName: 'Cliente TecnGo',
    clientAverageRating: 5,
    clientPaidServicesCount: 2,
    technicianCompletedServicesCount: 0,
    technicianCategories: [],
    categoryId: 'category-electrician',
    categoryName: 'Electricista',
    description: 'Revisión de instalación eléctrica',
    address: 'Zona Centro, Villavicencio',
    latitude: 4.142,
    longitude: -73.626,
    locationPrecision: 'APPROXIMATE',
    distanceKm: 2.4,
    estimatedPrice: 100000,
    requestedPaymentMethod: 'CASH',
    status: 'QUOTE_PENDING',
    createdAt: fixedNow,
    serviceImagesCount: 0,
    images: [],
    cityId: 'city-villavicencio',
    cityName: 'Villavicencio',
    ...overrides,
  }
}

export function quoteFixture(overrides: Partial<ServiceQuote> = {}): ServiceQuote {
  return {
    id: 'quote-1',
    serviceRequestId: 'request-1',
    technicianId: 'user-technician-1',
    technicianName: 'Técnico TecnGo',
    technicianAverageRating: 4.9,
    technicianCompletedServicesCount: 18,
    technicianExperienceDescription: 'Experiencia en instalaciones residenciales.',
    technicianCategories: [],
    certifiedTechnician: true,
    price: 120000,
    description: 'Incluye diagnóstico y mano de obra.',
    status: 'PENDING',
    createdAt: fixedNow,
    updatedAt: fixedNow,
    expiresAt: '2026-06-22T15:10:00Z',
    ...overrides,
  }
}

export function notificationFixture(
  overrides: Partial<UserNotification> = {},
): UserNotification {
  return {
    id: 'notification-1',
    title: 'Nueva cotización recibida',
    message: 'Técnico TecnGo cotizó $120.000 COP para tu solicitud Electricista',
    type: 'NEW_QUOTE',
    read: false,
    createdAt: fixedNow,
    route: 'RequestDetail',
    requestId: 'request-1',
    ...overrides,
  }
}

export function userProfileFixture(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    id: 'user-client-1',
    fullName: 'Cliente TecnGo',
    email: 'cliente@tecngo.test',
    role: 'CLIENT',
    averageRating: 5,
    completedServicesCount: 2,
    paidServicesCount: 2,
    verificationStatus: 'VERIFIED',
    emailVerified: true,
    phoneVerified: true,
    documentsVerified: true,
    accountStatus: 'ACTIVE',
    ...overrides,
  }
}

export function technicianProfileFixture(
  overrides: Partial<TechnicianProfile> = {},
): TechnicianProfile {
  return {
    id: 'technician-profile-1',
    fullName: 'Técnico TecnGo',
    email: 'tecnico@tecngo.test',
    documentNumber: '123456789',
    phone: '3001234567',
    categories: [categoryFixture()],
    description: 'Experiencia en instalaciones residenciales.',
    status: 'APPROVED',
    documentPhotoUrl: '/v1/files/document-1',
    workExperienceDescription: 'Cinco años de experiencia técnica comprobada.',
    averageRating: 4.9,
    completedServicesCount: 18,
    paidServicesCount: 17,
    verificationStatus: 'VERIFIED',
    phoneVerified: true,
    homeAddress: 'Calle 10 # 20-30',
    homeLatitude: 4.142,
    homeLongitude: -73.626,
    cityId: 'city-villavicencio',
    cityName: 'Villavicencio',
    ...overrides,
  }
}
