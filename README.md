# 📸 Framez

**Framez** is a mobile social application built with **React Native**, **Expo**, **Clerk**, and **Convex**.  
It allows users to share posts, explore others’ content, and view their profile activity — all in real time with smooth authentication and a clean modern UI.

---

## 🚀 Overview

Framez demonstrates the integration of **real-time data**, **user authentication**, and **structured UI** in a mobile environment.  
Each user can log in securely, create posts, and view their activity from their profile. The app focuses on performance, simplicity, and a polished interface.

---

## 🧠 Tech Stack

- **React Native (Expo)** – UI framework for cross-platform mobile apps
- **Clerk** – Authentication and user management
- **Convex** – Real-time backend and data handling
- **Cloudinary** – Image upload and hosting 
- **EAS Build** – For app deployment and testing
- **React Navigation** – For routing and navigation
- **TypeScript** – Type safety and better developer experience

---

## ✨ Features

- 🔐 Secure authentication via Clerk
- 🧍‍♂️ User profiles with activity tracking
- 🖼️ Create and share posts easily
- 🖼️ Create and share posts with Cloudinary image uploads 
- 💬 Real-time data updates using Convex
- 🎨 Clean, responsive, and modern design
- 📱 Works seamlessly on Android

---

## 🧩 Project Structure

```bash
Framez/
├── app/
│   ├── (auth)/         # Authentication screens
│   ├── (tabs)/         # Main tab navigation (Home, Profile, etc.)
│   ├── components/     # Reusable UI components
│   └── utils/          # Clerk + Convex + Cloudinary integration logic
├── convex/             # Convex backend functions
├── assets/             # Images, icons, etc.
├── package.json
└── README.md

```

## ⚙️ Setup & Installation

Follow these steps to run the project locally:

1. Clone the repository

   ```bash
   git clone https://github.com/stephany247/Framezz.git
   cd framez
   ```

2. Install dependencies

   ```bash
   npm install
   # or
   yarn install
   ```

3. Setup Convex

   ```bash
   npx convex dev
   ```

   Create your Convex project and link it with:

   ```bash
   npx convex deploy
   ```

4. Setup Clerk

   Create a Clerk project at https://clerk.com

   Add your Frontend API Key and Publishable Key to .env

   ```ini
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key_here
   ```

5. Start the app

   ```bash
   npx expo start
   ```

---

## Live Preview

You can view and test the project online at:

👉 **[Run on Appetize](https://appetize.io/app/b_hd3ittb7gwsjrwnwgobv43s35m)**

---

## 🧾 License

This project is licensed under the **MIT License**.  
Feel free to use or modify for learning and portfolio purposes.

## 💡 Author

Developed by Stephanie Oguocha.

Built with ❤️ using React Native, Convex, and Clerk.
