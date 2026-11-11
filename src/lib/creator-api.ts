import { apiClient } from './api-client';

export interface CreatorProfileUpdatePayload {
  name?: string;
  display_name?: string;
  bio?: string;
  about?: string;
  currency?: string;
  primary_currency?: string;
  creator_type?: string;
  experience_years?: number;
  previous_collaborations?: string;
  achievements?: string;
  location_text?: string;
  is_accepting_offers?: boolean;
  is_travel_ready?: boolean;
  photo_url?: string;
  cover_url?: string;
  preferences?: Record<string, any>;
}

export interface PortfolioCreatePayload {
  title: string;
  brand?: string | undefined;
  brand_name?: string | undefined;
  format?: string | undefined;
  format_tag?: string | undefined;
  image?: string | undefined;
  media_url?: string | undefined;
  description?: string | undefined;
  category?: string | undefined;
  deliverable_date?: string | undefined;
  views_count?: number | undefined;
}

export interface ServiceCreatePayload {
  name: string;
  description?: string | undefined;
  deliverables?: string | undefined;
  deliverables_spec?: string | undefined;
  price_cents?: number | undefined;
  starting_price_cents?: number | undefined;
  currency?: string | undefined;
  turnaround_days?: number | undefined;
  is_active?: boolean | undefined;
}

export interface OpportunityApplyPayload {
  proposed_fee_cents: number;
  pitch_text: string;
}

export interface InquiryReplyPayload {
  body: string;
  offer_price_cents?: number | undefined;
}

export interface CreatorRegisterPayload {
  email: string;
  username: string;
  password?: string | undefined;
  handle?: string | undefined;
  display_name?: string | undefined;
}

export interface SocialPlatformItem {
  id: string;
  name: string;
  slug: string;
  icon_name: string;
  color_code: string;
  is_active: boolean;
  supports_oauth: boolean;
  supports_api: boolean;
}

export interface SocialAccountItem {
  id: string;
  platform: string;
  platform_name: string;
  platform_slug: string;
  platform_icon: string;
  platform_color: string;
  username: string;
  profile_url: string;
  followers_count: number;
  following_count: number;
  engagement_rate: string | number;
  is_verified: boolean;
  last_synced_at?: string | null | undefined;
  created_at: string;
}

export interface ConnectSocialAccountPayload {
  platform: string;
  username: string;
  profile_url: string;
  followers_count?: number | undefined;
  following_count?: number | undefined;
  engagement_rate?: number | undefined;
}

export interface RequestPlatformPayload {
  platform_name: string;
  profile_url?: string | undefined;
  note?: string | undefined;
}

export const creatorApi = {
  // Profile
  async getProfile() {
    const res = await apiClient.get('/creator/profile/');
    return res.data;
  },

  async updateProfile(data: CreatorProfileUpdatePayload) {
    const res = await apiClient.patch('/creator/profile/', data);
    return res.data;
  },

  // Media upload
  async uploadMedia(file: File, fileType: 'AVATAR' | 'COVER' = 'AVATAR') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_type', fileType);
    const res = await apiClient.post('/creator/media/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  // Portfolio
  async getPortfolio() {
    const res = await apiClient.get('/creator/portfolio/');
    return res.data;
  },

  async createPortfolioItem(data: PortfolioCreatePayload) {
    const res = await apiClient.post('/creator/portfolio/', data);
    return res.data;
  },

  async updatePortfolioItem(id: string, data: Partial<PortfolioCreatePayload>) {
    const res = await apiClient.patch(`/creator/portfolio/${id}/`, data);
    return res.data;
  },

  async deletePortfolioItem(id: string) {
    const res = await apiClient.delete(`/creator/portfolio/${id}/`);
    return res.data;
  },

  async reorderPortfolio(orders: Array<{ id: string; order: number }>) {
    const res = await apiClient.post('/creator/portfolio/reorder/', { orders });
    return res.data;
  },

  // Services
  async getServices() {
    const res = await apiClient.get('/creator/services/');
    return res.data;
  },

  async createService(data: ServiceCreatePayload) {
    const res = await apiClient.post('/creator/services/', data);
    return res.data;
  },

  async updateService(id: string, data: Partial<ServiceCreatePayload>) {
    const res = await apiClient.patch(`/creator/services/${id}/`, data);
    return res.data;
  },

  async deleteService(id: string) {
    const res = await apiClient.delete(`/creator/services/${id}/`);
    return res.data;
  },

  // Opportunities
  async getOpportunities(params?: Record<string, string | number>) {
    const res = await apiClient.get('/creator/opportunities/', { params });
    return res.data;
  },

  async applyToOpportunity(id: string, data: OpportunityApplyPayload) {
    const res = await apiClient.post(`/creator/opportunities/${id}/apply/`, data);
    return res.data;
  },

  async applyOpportunity(id: string, data: OpportunityApplyPayload) {
    return this.applyToOpportunity(id, data);
  },

  // Inquiries
  async getInquiries() {
    const res = await apiClient.get('/creator/inquiries/');
    return res.data;
  },

  async getInquiryMessages(id: string) {
    const res = await apiClient.get(`/creator/inquiries/${id}/messages/`);
    return res.data;
  },

  async sendInquiryReply(id: string, data: InquiryReplyPayload) {
    const res = await apiClient.post(`/creator/inquiries/${id}/messages/`, data);
    return res.data;
  },

  async sendInquiryMessage(id: string, text: string) {
    const res = await apiClient.post(`/creator/inquiries/${id}/messages/`, { body: text });
    return res.data;
  },

  async updateInquiryStatus(id: string, status: 'NEW' | 'RESPONDED' | 'NEGOTIATING' | 'ACCEPTED' | 'DECLINED') {
    const res = await apiClient.patch(`/creator/inquiries/${id}/`, { status });
    return res.data;
  },

  async markInquiryRead(id: string) {
    const res = await apiClient.post(`/creator/inquiries/${id}/read/`);
    return res.data;
  },

  // Website & Custom Domain
  async getWebsite() {
    const res = await apiClient.get('/creator/website/');
    return res.data;
  },

  async updateWebsite(data: Record<string, any>) {
    const res = await apiClient.patch('/creator/website/', data);
    return res.data;
  },

  async getDomainRecords() {
    const res = await apiClient.get('/creator/website/domain/');
    return res.data;
  },

  async connectCustomDomain(domain: string) {
    const res = await apiClient.post('/creator/website/domain/', { domain });
    return res.data;
  },

  async getAnalytics() {
    const res = await apiClient.get('/creator/analytics/');
    return res.data;
  },

  // Registration & Email Verification
  async registerCreator(data: CreatorRegisterPayload) {
    const res = await apiClient.post('/auth/creator/register/', data);
    return res.data;
  },

  async verifyEmail(token: string) {
    const res = await apiClient.post('/auth/verify-email/', { token });
    return res.data;
  },

  async revokeRegistration(token: string) {
    const res = await apiClient.post('/auth/revoke-registration/', { token });
    return res.data;
  },

  // Social Platforms & Connected Accounts
  async getSocialPlatforms(): Promise<SocialPlatformItem[]> {
    const res = await apiClient.get('/creator/social-platforms/');
    return res.data;
  },

  async getSocialAccounts(): Promise<SocialAccountItem[]> {
    const res = await apiClient.get('/creator/social-accounts/');
    return res.data;
  },

  async connectSocialAccount(data: ConnectSocialAccountPayload): Promise<SocialAccountItem> {
    const res = await apiClient.post('/creator/social-accounts/', data);
    return res.data;
  },

  async disconnectSocialAccount(id: string): Promise<{ detail: string }> {
    const res = await apiClient.delete(`/creator/social-accounts/${id}/`);
    return res.data;
  },

  async requestSocialPlatform(data: RequestPlatformPayload): Promise<any> {
    const res = await apiClient.post('/creator/social-platforms/request/', data);
    return res.data;
  },

  // Account & Security
  async changePassword(currentPassword: string, newPassword: string) {
    const res = await apiClient.post('/auth/password/change/', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return res.data;
  },

  async toggleMfa(mfaEnabled?: boolean) {
    const res = await apiClient.post('/auth/mfa/toggle/', {
      ...(mfaEnabled !== undefined ? { mfa_enabled: mfaEnabled } : {}),
    });
    return res.data;
  },

  async deleteAccount(password: string) {
    const res = await apiClient.post('/auth/account/delete/', { password });
    return res.data;
  },

  // Notifications
  async getNotifications() {
    const res = await apiClient.get('/creator/notifications/');
    return res.data;
  },

  async markNotificationRead(id: string) {
    const res = await apiClient.patch(`/creator/notifications/${id}/read/`);
    return res.data;
  },

  // Public Geographic Taxonomy
  async searchLocations(search: string) {
    if (!search || !search.trim()) return [];
    try {
      const res = await apiClient.get('/public/taxonomies/locations/', {
        params: { search: search.trim() },
      });
      return res.data?.results || res.data || [];
    } catch {
      return [];
    }
  },
};


