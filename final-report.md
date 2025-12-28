# Facebook Pixel & CAPI Implementation Walkthrough

This document outlines the complete implementation of the Facebook Pixel and Conversion API (CAPI) tracking system in the Next.js application.

## 1. Features Implemented

### ✅ Core Tracking
- **Dual Tracking:** Events are sent to both:
  - **Browser (Pixel):** Using `fbq('track')`
  - **Server (CAPI):** Using `facebook-nodejs-business-sdk`
- **Deduplication:** A unique `eventID` is generated for every event and shared between Browser and Server to ensure Facebook counts the event only once.
- **Advanced Matching:** User data (Email, Phone, Name, City, etc.) is hashed and sent with `Purchase` and `InitiateCheckout` events.

### ✅ Supported Events
| Event Name | Trigger | Custom Parameters |
| :--- | :--- | :--- |
| **PageView** | On every page load | `page_title`, `event_day`, `time`, `traffic_source` |
| **ViewContent** | Landing Page load | `content_ids`, `content_type`, `value`, `tags`, `post_id` |
| **TimeOnPage** | 5s, 10s, 30s, 60s, 120s | `seconds`, `event_url` |
| **PageScroll** | 10%, 25%, 50%, 75%, 90% | `scroll_percent` |
| **AddToCart** | Button Click | `value`, `currency`, `content_ids` |
| **InitiateCheckout** | Checkout Page load | `subtotal`, `num_items`, `user_role` |
| **AddPaymentInfo** | Form Submit | `value`, `content_ids` |
| **Purchase** | Thank You Page load | `order_id`, `ltv`, `average_order`, `transactions_count` |

### ✅ Custom "PixelYourSite" Events
- **ReturningCustomer:** Fires if the user has a previous order history.
- **VIPClient:** Fires if LTV > 5000 or Order Count > 3.
- **BigWhale:** Fires if LTV > 10000.
- **FrequentShopper:** Fires if Order Count > 2.

### ✅ Device & Context Data
- **Frame:** Detects `Windows`, `Mac`, `Android`, `iOS` etc.
- **Time Data:** `event_day`, `event_month`, `event_hour`.
- **Plugin Signature:** Includes mimic parameters to match PixelYourSite structure.

## 2. Architecture

### Client-Side
- **`lib/tracker.js`:** The brain of the operation. It generates the `eventID`, gathers device info (`getDeviceFrame`), handles `localStorage` config, and dispatches events to both `fbq` and the API.
- **`components/FacebookPixel.js`:** Handles the initialization of the Pixel script.
- **`AdminContext`:** Manages the Pixel ID and Access Token state.

### Server-Side
- **`app/api/track/route.js`:** Receives event data from the client, initializes the Facebook SDK with the Access Token, and securely communicates with Facebook's Conversion API.

## 3. Configuration
1. Go to `/admin`.
2. Enter **Pixel ID** and **Access Token**.
3. (Optional) Enter **Test Event Code** to verify events in Facebook Events Manager.
4. Settings are saved in `localStorage` for this demo.

## 4. Production Checklist (Important)
- [ ] **Security:** Move the Access Token from the "Admin Dashboard" (Frontend) to a server-side **Environment Variable** (`process.env.FB_ACCESS_TOKEN`) to prevent it from being exposed to public users.
- [ ] **Database:** Replace `localStorage` with a real database (PostgreSQL/MySQL) for storing Orders and User LTV stats.
- [ ] **Domain Verification:** Verify your domain in Facebook Business Manager.
