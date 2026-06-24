# Velora AI

Velora AI is a modern AI-powered customer support platform that enables businesses to provide intelligent customer assistance through an embeddable chat widget, human operator dashboard, AI agents, knowledge base integration, voice support, and subscription-based premium features.

The platform combines AI automation with human support, allowing organizations to seamlessly manage customer conversations while reducing response times and support costs.

---

## Features

### AI Customer Support

* AI-powered customer conversations using Gemini models
* Automated response generation
* Context-aware conversations
* Escalation to human operators when needed

### Human Operator Dashboard

* Real-time conversation management
* Operator messaging interface
* Conversation status management
* Escalation and resolution workflows

### Knowledge Base (RAG)

* File uploads and document management
* Vector embeddings generation
* Retrieval-Augmented Generation (RAG)
* AI responses grounded in uploaded knowledge

### Voice Support Integration

* Vapi integration
* AI voice assistants
* Phone number management
* Voice-based customer interactions

### Subscription & Billing

* Clerk Billing integration
* Free and Pro plans
* Premium feature protection
* Automatic subscription synchronization via webhooks

### Embeddable Widget

* One-line installation
* Website integration using a script tag
* Floating chat widget
* Iframe isolation architecture
* Configurable organization-specific deployment

---

# Architecture Overview

Velora AI consists of three major applications:

## 1. Dashboard Application (Web)

Location:

```text
apps/web
```

Purpose:

* Organization management
* Billing
* Knowledge base management
* Conversation management
* AI settings
* Plugin integrations

Technology:

* Next.js
* React
* TypeScript
* Clerk Authentication

---

## 2. Widget Application

Location:

```text
apps/widget
```

Purpose:

* Customer-facing chat interface
* AI conversations
* Human support communication
* Session management

Technology:

* Next.js
* React
* Convex
* TypeScript

---

## 3. Embed Application

Location:

```text
apps/embed
```

Purpose:

* Generates embeddable widget script
* Creates floating chat button
* Creates iframe container
* Loads widget application

Technology:

* Vite
* TypeScript

---

# High-Level Architecture

```text
Customer Website
        |
        | <script src="widget.js">
        v
Embed Script
        |
        | Creates iframe
        v
Widget Application
        |
        v
Convex Backend
        |
        v
Gemini AI / RAG / Voice Services
```

---

# AI Conversation Flow

```text
Customer Message
        ↓
Widget
        ↓
Convex Backend
        ↓
Session Validation
        ↓
Subscription Validation
        ↓
Knowledge Retrieval (Optional)
        ↓
Gemini AI
        ↓
AI Response
        ↓
Widget Display
```

---

# Subscription Flow

```text
User Upgrades
      ↓
Clerk Billing
      ↓
subscription.updated
      ↓
Clerk Webhook
      ↓
Convex HTTP Action
      ↓
Svix Verification
      ↓
Update Subscription
      ↓
Unlock Premium Features
```

---

# Session Management

Every customer receives a contact session.

A session stores:

* Name
* Email
* Organization ID
* Browser Metadata
* Expiration Timestamp

Features:

* 24-hour session duration
* Automatic refresh near expiration
* Activity-based renewal
* Secure session validation

---

# Premium Features

The following features require an active Pro subscription:

* AI Customer Support
* AI Message Enhancement
* Knowledge Base
* Voice Assistants
* Phone System
* Widget Customization
* Team Access

Free organizations can still:

* Receive human support
* Create conversations
* Use basic chat functionality

---

# Tech Stack

## Frontend

* Next.js 15
* React 19
* TypeScript
* Tailwind CSS
* Shadcn UI
* Radix UI
* React Hook Form
* Zod

## Backend

* Convex
* Convex Actions
* Convex Queries
* Convex Mutations
* Convex Agents

## Authentication & Billing

* Clerk
* Clerk Organizations
* Clerk Billing
* Clerk Webhooks

## AI

* Gemini 2.5 Flash
* Google Embeddings
* Convex Agent
* Convex RAG

## Voice

* Vapi

## Storage & Secrets

* AWS Secrets Manager

---

# Embedding the Widget

Example:

```html
<script
  src="https://your-domain.com/widget.js"
  data-organization-id="YOUR_ORGANIZATION_ID">
</script>
```

The embed script automatically:

* Creates a floating chat button
* Creates an iframe
* Loads the widget application
* Handles open/close functionality
* Supports resizing

---

# Local Development

## Install Dependencies

```bash
pnpm install
```

## Start Development Environment

```bash
turbo dev
```

Applications:

```text
Dashboard: http://localhost:3000
Widget:    http://localhost:3001
Embed:     http://localhost:3002
```

---

# Build

```bash
turbo build
```

---

# Environment Variables

Example:

```env
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=

CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=

GOOGLE_GENERATIVE_AI_API_KEY=

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=

CLERK_WEBHOOK_SECRET=
```

---

# Project Highlights

* AI-powered customer support platform
* Human + AI hybrid conversation model
* Knowledge Base with Retrieval-Augmented Generation (RAG)
* Voice assistant integration using Vapi
* Subscription-based monetization system
* Secure webhook synchronization
* Embeddable website widget
* Session lifecycle management
* Organization-based multi-tenant architecture
* Backend-enforced premium feature protection

---

# Future Improvements

* Multi-language AI support
* Advanced analytics dashboard
* Conversation sentiment analysis
* Workflow builder
* CRM integrations
* Slack integration
* Email automation
* Custom AI agents

---

# Project Goal

Velora AI aims to provide businesses with a complete AI-powered customer support solution that combines:

* AI Automation
* Human Support
* Knowledge Retrieval
* Voice Communication
* Subscription Monetization
* Easy Website Integration

into a single scalable SaaS platform.
