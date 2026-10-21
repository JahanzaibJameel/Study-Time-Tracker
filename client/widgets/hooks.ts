import { useEffect, useCallback } from "react";
import { AppState, AppStateStatus } from "react-native";
import { syncWidgetData, refreshWidget, initializeWidget } from "./sync";

/**
 * Hook to manage widget data synchronization
 * Automatically syncs widget data on:
 * - App initialization
 * - App backgrounding
 * - Manual refresh
 */
export function useWidgetSync() {
  const initialize = useCallback(async () => {
    await initializeWidget();
  }, []);

  const sync = useCallback(async () => {
    await syncWidgetData();
  }, []);

  const refresh = useCallback(async () => {
    await refreshWidget();
  }, []);

  // Sync on app background
  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === "background" || nextState === "inactive") {
        syncWidgetData();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );
    return () => subscription.remove();
  }, []);

  return { initialize, sync, refresh };
}

/**
 * Hook to manually trigger widget sync after specific actions
 * Usage:
 *   const { triggerSync } = useWidgetTrigger();
 *   // After saving session:
 *   triggerSync();
 */
export function useWidgetTrigger() {
  return useCallback(async () => {
    await syncWidgetData();
  }, []);
}
