# StudyBuddy - Study Time Tracker App

## Overview
StudyBuddy is a mobile app for students to plan and track their study time. Built with React Native and Expo, it features local data persistence using AsyncStorage.

## Features
- **Today's Progress**: View daily study time with a circular progress indicator
- **Study Subjects**: Add and manage study subjects
- **Study Timer**: Track study sessions with start/pause/stop controls
- **Daily Streak**: Track consecutive study days
- **Statistics**: View weekly charts and all-time study stats
- **Dark Mode**: Automatic dark mode support based on system settings
- **Motivational Messages**: Receive encouragement after completing sessions

## Navigation Structure
- **Tab Navigator**: 3 tabs (Today, Subjects, Stats)
- **Timer Screen**: Full-screen modal for study sessions
- **Add Subject Screen**: Modal for adding new subjects

## Data Storage
All data is stored locally using AsyncStorage:
- Subjects: @studybuddy_subjects
- Sessions: @studybuddy_sessions
- Streak: @studybuddy_streak
- Settings: @studybuddy_settings

## Color Palette
- Primary: #A8DADC (Soft Cyan)
- Secondary: #F1FAEE (Cream)
- Text Primary: #1D3557 (Deep Blue)
- Text Secondary: #457B9D (Medium Blue)
- Success: #90D5A5 (Soft Green)
- Warning: #FFC857 (Warm Yellow)

## Running the App
- Development: npm run expo:dev
- Web: Open http://localhost:8081
- Mobile: Scan QR code with Expo Go app

## Key Dependencies
- expo (React Native framework)
- react-navigation (navigation)
- async-storage (data persistence)
- react-native-reanimated (animations)
- expo-haptics (haptic feedback)
- react-native-svg (circular progress)
