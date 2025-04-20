'use client';

import { AppearanceData, defaultAppearanceData } from './AppearanceSettings';
import {
  CategoryColorsData,
  defaultCategoryColors,
} from './CategoryColorsSettings';
import {
  NotificationData,
  defaultNotificationData,
} from './NotificationSettings';
import {
  SmartSchedulingData,
  defaultSmartSchedulingData,
} from './SmartSchedulingSettings';
import { TaskSettingsData, defaultTaskSettings } from './TaskSettings';
import { WeekTimeRanges, defaultWeekTimeRanges } from './TimeRangePicker';
import { TimezoneData, defaultTimezoneData } from './TimezoneSettings';
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

export type CalendarSettings = {
  firstDayOfWeek: number;
  showWeekends: boolean;
  showWeekNumbers: boolean;
  use24HourFormat: boolean;
  defaultView: 'day' | 'week' | '4day';
  categoryColors: CategoryColorsData;
  personalHours: WeekTimeRanges;
  workHours: WeekTimeRanges;
  meetingHours: WeekTimeRanges;
  timezone: TimezoneData;
  appearance: AppearanceData;
  notifications: NotificationData;
  smartScheduling: SmartSchedulingData;
  taskSettings: TaskSettingsData;
};

export const defaultCalendarSettings: CalendarSettings = {
  firstDayOfWeek: 1, // Monday
  showWeekends: true,
  showWeekNumbers: false,
  use24HourFormat: false,
  defaultView: 'week',
  personalHours: defaultWeekTimeRanges,
  meetingHours: defaultWeekTimeRanges,
  workHours: defaultWeekTimeRanges,
  timezone: defaultTimezoneData,
  appearance: defaultAppearanceData,
  notifications: defaultNotificationData,
  categoryColors: defaultCategoryColors,
  smartScheduling: defaultSmartSchedulingData,
  taskSettings: defaultTaskSettings,
};

// Helper function to load settings from localStorage
const loadSettingsFromStorage = (): Partial<CalendarSettings> | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const storedSettings = localStorage.getItem('calendarSettings');
    if (storedSettings) {
      console.log('Loading settings from localStorage');
      return JSON.parse(storedSettings) as Partial<CalendarSettings>;
    }
  } catch (error) {
    console.error('Failed to load settings from localStorage:', error);
  }
  return null;
};

type CalendarSettingsContextType = {
  settings: CalendarSettings;
  updateSettings: <K extends keyof CalendarSettings>(
    section: K,
    value: CalendarSettings[K]
  ) => void;
  saveSettings: () => Promise<void>;
  resetSettings: () => void;
  hasChanges: boolean;
};

const CalendarSettingsContext = createContext<
  CalendarSettingsContextType | undefined
>(undefined);

export function CalendarSettingsProvider({
  children,
  initialSettings,
  onSave,
}: {
  children: ReactNode;
  initialSettings?: Partial<CalendarSettings>;
  onSave?: (settings: CalendarSettings) => Promise<void>;
}) {
  const storedSettings = loadSettingsFromStorage();

  const [settings, setSettings] = useState<CalendarSettings>({
    ...defaultCalendarSettings,
    ...(storedSettings || {}),
    ...initialSettings,
  });

  const [originalSettings, setOriginalSettings] = useState<CalendarSettings>({
    ...defaultCalendarSettings,
    ...(storedSettings || {}),
    ...initialSettings,
  });

  const [hasChanges, setHasChanges] = useState(false);

  // Update hasChanges when settings change
  useEffect(() => {
    const settingsChanged =
      JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasChanges(settingsChanged);
  }, [settings, originalSettings]);

  const updateSettings = <K extends keyof CalendarSettings>(
    section: K,
    value: CalendarSettings[K]
  ) => {
    setSettings((prev) => ({
      ...prev,
      [section]: value,
    }));
  };

  const saveSettings = async () => {
    // Save to localStorage
    try {
      localStorage.setItem('calendarSettings', JSON.stringify(settings));
      console.log('Settings saved to localStorage from dialog');
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
    }

    // Call the parent's onSave if provided
    if (onSave) {
      await onSave(settings);
    }

    setOriginalSettings({ ...settings });
    setHasChanges(false);
  };

  const resetSettings = () => {
    setSettings({ ...originalSettings });
    setHasChanges(false);
  };

  return (
    <CalendarSettingsContext.Provider
      value={{
        settings,
        updateSettings,
        saveSettings,
        resetSettings,
        hasChanges,
      }}
    >
      {children}
    </CalendarSettingsContext.Provider>
  );
}

export function useCalendarSettings() {
  const context = useContext(CalendarSettingsContext);
  if (context === undefined) {
    throw new Error(
      'useCalendarSettings must be used within a CalendarSettingsProvider'
    );
  }
  return context;
}
