# AI-Powered Smart Rasoi System 🥗💳
### Health-Aware Food Selection & Seamless Payments

[![Real-time Sync](https://img.shields.io/badge/Real--time-Supabase-blueviolet)](https://supabase.com)
[![Payments](https://img.shields.io/badge/Payments-Stripe-6772e5)](https://stripe.com)
[![Framework](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61dafb)](https://vitejs.dev)

## 📌 1. Use Case Title
**AI-Powered Smart Rasoi System for Health-Aware Food Selection and Seamless Payments.**

## 🚀 2. Problem Statement
University students frequently make quick food purchases at campus cafeterias without access to clear nutritional or calorie information. This lack of visibility often leads to unhealthy food choices, poor energy management, and reduced academic focus over time. 

Current cafeteria systems mainly focus on billing and payment transactions, with little or no intelligence to guide students toward healthier dietary decisions. There is a need for an AI-driven solution that integrates food recognition, nutritional analysis, personalization, and digital payments into a single, seamless experience.

## 🎯 3. Objectives
Our Smart Rasoi System is designed to:
*   **Informed Choices**: Help students make healthier food decisions through transparent data.
*   **Real-time Insights**: Provide instant calorie and nutrition breakdowns for every menu item.
*   **Cashless Workflow**: Integrate fast, secure digital payments (Stripe/UPI).
*   **Student Wellbeing**: Enhance academic performance through better dietary management.
*   **Operational Efficiency**: Improve cafeteria planning and food waste management through data.
*   **Health Analytics**: Generate data-driven insights for campus wellness initiatives.

---

## 🏗️ 4. System Architecture
The project is built on a modern, decoupled architecture ensuring scalability and real-time performance.

*   **Frontend (Admin Dashboard)**: A React + Vite powerhouse for cafeteria managers to track orders, manage menu health data, and view waste analytics in real-time.
*   **Mobile App (Student Portal)**: A responsive mobile experience for students to plan meals, track their calorie intake, and make one-click payments.
*   **Backend Services**: Node.js microservices handling order simulations, local data fallbacks, and integration with external APIs.
*   **Database & Real-time**: Fully powered by **Supabase**. We use Supabase Realtime (PostgreSQL hooks) to ensure that when a student place an order, the Admin Dashboard reflects it instantly without a refresh.
*   **Payments**: Integrated with **Stripe** for secure, institutional-grade transaction handling.

---

## ✨ 5. Key Features

### 🍏 Health-Aware Selection
*   **Detailed Nutrition Profiles**: Every food item tracks Calories, Protein, Carbs, and Fats.
*   **AI Meal Planner**: Personalized recommendations based on student preferences and nutritional goals.
*   **Specific Imagery**: Visual recognition support with unique, specific images for every food entry.

### ⚡ Seamless Operations
*   **Real-time Order Tracking**: Live dashboard for staff to manage "Recent Order Requests" with zero latency.
*   **Smart Menu Management**: Dynamic menu updates that sync across all student devices instantly.
*   **Automated Simulations**: Built-in order simulators to test cafeteria load and demand forecasting.

### 📊 Reporting & Analytics
*   **Consumption Trends**: Visualizing which healthy options are most popular.
*   **Demand Forecasting**: Predicting cafeteria load to reduce food wastage.
*   **Wellness Insights**: Reports for university administrators to monitor campus-wide health trends.

---

## 🛠️ 6. Tech Stack
| Component | Technology |
| :--- | :--- |
| **Frontend** | React, Vite, Vanilla CSS |
| **Mobile** | React Native / PWA (Ionic Inspired) |
| **Database** | Supabase (PostgreSQL) |
| **Real-time** | Supabase Realtime Subscriptions |
| **Payments** | Stripe API |
| **Backend** | Node.js, Express |
| **Local Storage** | SQLite (for offline fallback) |

---

## 🧪 7. Non-Functional Requirements
*   **Accuracy**: High-fidelity nutrition data and reliable calorie estimation.
*   **Speed**: < 200ms latency for real-time order updates.
*   **Security**: SSL encryption and secure profile data handling via Supabase Auth.
*   **Scalability**: Built to support thousands of daily transactions through optimized Postgres indexing.

---

## 🏆 8. Expected Benefits
*   **For Students**: Better energy levels, focus, and faster, transparent transactions.
*   **For University**: Optimized inventory, reduced queues, and data-driven wellness initiatives.

---

## 📦 9. Deliverables
- [x] **Full-stack working prototype** (Admin + Mobile + Landing)
- [x] **Real-time Database Schema** (Postgres/Supabase)
- [x] **Stripe Payment Integration**
- [x] **Dynamic AI-enhanced Menu System**
- [x] **Project Documentation & User Journey Walkthrough**

---
*Created for the NMIMS Hackathon - Smart Rasoi Challenge.*
