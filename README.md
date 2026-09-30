# Creator Hub

Build a production-quality, highly attractive **Influencer/Creator Dashboard** for the Influencers.com SaaS platform.

This is the private application used by influencers/creators to manage their professional profile, portfolio, social media, services, website, inquiries, and collaboration opportunities.

The public marketplace is **Influencers.com**. This app is the creator's private workspace.

## Design Direction

Create a premium, modern interface inspired by the visual quality and simplicity of Instagram, but DO NOT copy Instagram's exact UI, branding, logo, or proprietary design.

The app should feel like:

* Creator Studio
* Social media profile manager
* Portfolio builder
* Influencer business dashboard

Use:

* Clean light interface
* White backgrounds
* Black/dark typography
* Subtle gradients
* Rounded cards
* Large creator imagery
* Modern typography
* Smooth transitions
* Elegant micro-interactions
* High-quality visual hierarchy

The interface must feel attractive to influencers and creators rather than like a traditional corporate admin panel.

Use realistic Kerala-focused influencer mock data throughout the app.

Do not ask me to provide mock data. Generate appropriate mock data yourself.

---

# Main Navigation

Create a responsive sidebar on desktop and suitable mobile navigation.

Navigation:

* Dashboard
* My Profile
* Social Media
* Portfolio
* Services & Pricing
* My Website
* Media Kit
* Opportunities
* Inquiries
* Analytics
* Settings

Top navigation:

* Search
* Notifications
* Profile menu

Profile menu:

* View Public Profile
* View Website
* Account Settings
* Logout

---

# Dashboard

Create a visually impressive creator dashboard.

Top section:

Greeting:

**Good morning, [Creator Name]**

Show profile completion:

**Profile 85% complete**

CTA:
**Complete Profile**

Statistics cards:

* Profile Views
* Website Visitors
* Social Followers
* Collaboration Requests

Create a profile preview card containing:

* Profile photo
* Name
* Category
* Location
* Verification status
* Public profile link
* View Profile button

---

# Website Creation Flow

This is a major feature.

When a creator has not created a website, prominently show:

**Create your professional influencer website**

Supporting text:

Turn your profile, portfolio, social media, and services into a professional website.

CTA:

**Create My Website**

When clicked, show a multi-step website creation flow.

## Step 1

Ask:

**Do you already have a website?**

Options:

### I already have a website

Allow the creator to enter:

* Existing website URL

### Create a website with Influencers.com

Continue to website creation.

---

# Website Builder Setup

If they choose to create a website:

Step 1:
Choose template

Show several attractive creator templates.

Examples:

* Minimal Creator
* Fashion
* Travel
* Food
* Lifestyle
* Professional
* Photography
* Gaming

Step 2:
Choose visual style

* Typography
* Accent style
* Layout preference

Step 3:
Choose website sections

* About
* Social Media
* Portfolio
* Services
* Collaborations
* Testimonials
* Contact

Step 4:
Preview

Show a realistic website preview.

CTA:

**Publish Website**

---

# Website Management

After a website exists, show:

**Your website is live**

Display:

* Website URL
* Website status
* Visitors
* Last updated
* Template

Actions:

* View Website
* Edit Website
* Change Template
* Domain Settings
* SEO Settings
* Unpublish

Allow custom domain setup UI.

Example states:

**Using Influencers.com domain**

and

**Connect your custom domain**

Do not implement real DNS/backend functionality yet.

---

# My Profile

Create a complete creator profile management page.

Sections:

## Basic Information

* Full name
* Display name
* Profile photo
* Cover image
* Bio
* Location
* Languages
* Categories

## Professional Information

* About
* Creator type
* Services
* Experience
* Previous collaborations
* Achievements

Include:

**Save Changes**

and profile preview.

---

# Social Media

Create a highly visual social media management page.

Show connected platforms as cards.

Each card should contain:

* Platform icon
* Username
* Profile URL
* Followers
* Following
* Engagement rate
* Verification status
* Last updated
* Connected status

Possible platforms:

* Instagram
* YouTube
* Facebook
* TikTok
* X
* LinkedIn
* Snapchat
* Threads
* Pinterest
* Twitch
* Website
* Other

Do not assume these are the only platforms permanently.

Add:

**+ Add Social Platform**

If a platform is not available:

**Request a Social Platform**

Open a modal with:

* Platform name
* Platform URL
* Profile URL
* Reason / notes

Show:

**Request submitted**

This should be a frontend mock interaction for now.

---

# Portfolio

Create a beautiful creator portfolio manager.

Use an Instagram-inspired visual media grid.

Support:

* Images
* Videos
* Reels
* Campaign work
* Brand collaborations

Each portfolio item can contain:

* Title
* Description
* Media
* Category
* Brand/client
* Date
* Tags

Actions:

* Add Portfolio Item
* Edit
* Delete
* Reorder
* Preview

Allow drag-and-drop style visual reordering in the UI if practical.

---

# Services & Pricing

Create a professional services management page.

Example service categories:

* Instagram Reel
* Instagram Post
* Story
* YouTube Video
* YouTube Short
* Product Review
* UGC Content
* Event Appearance
* Brand Promotion
* Product Photography

Each service card should show:

* Service name
* Description
* Starting price
* Deliverables
* Typical turnaround
* Active/inactive

Allow:

**Add Service**

and

**Contact for Price**

option.

---

# Media Kit

Create a premium media kit section.

Show a live preview of the creator's media kit.

Include:

* Profile
* Bio
* Social statistics
* Audience
* Portfolio
* Services
* Previous collaborations
* Contact information

Buttons:

**Preview Media Kit**

**Generate Media Kit**

**Share Media Kit**

**Download PDF**

For this frontend prototype, downloading can be represented with a mock interaction.

---

# Opportunities

Create a creator opportunity marketplace.

Show campaigns/requirements posted by businesses.

Each opportunity card:

* Campaign name
* Business
* Category
* Location
* Platform
* Deliverables
* Budget
* Deadline
* Required creators

Actions:

**View Opportunity**

**Apply**

Add filters:

* Category
* Platform
* Location
* Budget
* Deadline

---

# Inquiries

Create an inbox for business collaboration requests.

Sections:

* New
* Responded
* Negotiating
* Accepted
* Declined

Each inquiry should show:

* Business
* Campaign
* Message
* Budget
* Date
* Status

Creator actions:

* View
* Reply
* Accept
* Decline

Make the messaging UI modern and clean.

---

# Analytics

Create a creator analytics dashboard.

Show:

* Profile views
* Website visitors
* Portfolio views
* Social clicks
* Contact clicks
* Collaboration inquiries

Use attractive charts.

Time filters:

* 7 days
* 30 days
* 3 months
* 1 year

Also show:

**Top Portfolio Content**

**Top Traffic Sources**

**Most Viewed Services**

Use realistic mock data.

---

# Notifications

Create notifications for:

* New collaboration inquiry
* Campaign invitation
* Profile verification
* Website activity
* Portfolio views
* Platform updates

Include read/unread states.

---

# Settings

Sections:

* Account
* Profile visibility
* Notification preferences
* Privacy
* Connected accounts
* Subscription
* Website
* Domain
* Security

Include appropriate confirmation dialogs for destructive actions.

---

# Mobile Experience

The app must be fully mobile responsive.

On mobile:

* Use compact navigation
* Bottom navigation where appropriate
* Swipeable cards
* Mobile-friendly forms
* Full-screen modals/drawers
* Touch-friendly buttons
* Responsive portfolio grid

The creator should be able to manage their entire profile from a phone.

---

# Mock Data

Generate realistic Kerala-focused influencer/creator mock data.

Use consistent data across:

* Dashboard
* Profile
* Social Media
* Portfolio
* Services
* Website
* Media Kit
* Opportunities
* Inquiries
* Analytics

Do not use private information of real people.

---

# Component Architecture

Create reusable components such as:

* CreatorSidebar
* MobileNavigation
* CreatorHeader
* ProfileCompletion
* StatCard
* SocialAccountCard
* PortfolioGrid
* PortfolioItem
* ServiceCard
* WebsitePreview
* WebsiteTemplateCard
* CampaignCard
* InquiryCard
* NotificationItem
* AnalyticsChart
* MediaKitPreview
* Modal
* Drawer
* Toast
* EmptyState
* LoadingSkeleton

Keep mock data in a centralized data layer.

Do not duplicate creator information throughout individual pages.

Structure the frontend so the mock data can later be replaced with APIs from the shared Django backend.

---

# Important Architecture Requirement

Do not build this as an isolated application.

The eventual system will have:

1. Public Website — Influencers.com
2. Influencer App
3. Business App
4. SaaS Manager

All applications will consume the same Django backend.

Therefore:

* Use stable entity-oriented data structures.
* Separate UI components from data.
* Avoid hardcoded creator information inside components.
* Keep routes organized.
* Keep API integration easy to introduce later.
* Do not implement the real backend now.

Focus on a polished, realistic, complete frontend prototype with excellent UX.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4cf2fee9-9006-449f-9bc6-afef483757d1).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
