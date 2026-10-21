// StudyBuddy Widgets - Main Export
export * from "./config";
export * from "./sync";
export * from "./hooks";

// Widget integration guide:
//
// 1. iOS WidgetKit Extension:
//    - Create a Widget Extension target in Xcode
//    - Use App Groups to share data (group.com.studybuddy.widget)
//    - Implement TimelineProvider that reads from shared UserDefaults
//    - SwiftUI views for small/medium/large widget sizes
//
// 2. Android App Widget:
//    - Create AppWidgetProvider class
//    - Define widget layouts in XML (res/xml/widget_*.xml)
//    - Use SharedPreferences for data sharing
//    - Support multiple sizes: 1x1, 2x1, 4x1, 4x2
//
// 3. Data Flow:
//    App (React Native) → AsyncStorage/SharedPrefs/AppGroups → Widget Extension
//
// 4. Required Native Code:
//    iOS: Widget Extension target + App Groups capability
//    Android: AppWidgetProvider + widget XML layouts + AppWidgetManager
//
// 4. This JS layer provides:
//    - syncWidgetData(): Call after session complete, streak update, goal change
//    - refreshWidget(): Trigger native widget refresh
//    - useWidgetSync(): Auto-sync on app background
//    - useWidgetTrigger(): Manual sync after actions
