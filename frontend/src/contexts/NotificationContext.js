import React, { createContext, useState, useContext, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [notificationSettings, setNotificationSettings] = useState({
    dailyReminders: true,
    achievementAlerts: true,
    friendActivity: true,
    weeklyReports: true,
    crisisSupport: true,
    soundEnabled: true,
    timeRange: { start: '09:00', end: '21:00' }
  });

  // Load notifications from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('moodverse_notifications');
    if (saved) {
      setNotifications(JSON.parse(saved));
    }
  }, []);

  // Save notifications to localStorage
  useEffect(() => {
    localStorage.setItem('moodverse_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Show browser notification if permission granted
    if (notification.showBrowser && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.body,
        icon: '/favicon.ico',
        tag: notification.type || 'general'
      });
    }
    
    return newNotification;
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  const requestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };

  const scheduleDailyReminder = () => {
    const now = new Date();
    const reminder = new Date();
    const [hours, minutes] = notificationSettings.timeRange.end.split(':');
    reminder.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    if (reminder < now) {
      reminder.setDate(reminder.getDate() + 1);
    }
    
    const timeUntilReminder = reminder.getTime() - now.getTime();
    
    setTimeout(() => {
      if (notificationSettings.dailyReminders) {
        addNotification({
          type: 'daily_reminder',
          title: 'Daily Mood Check 🌟',
          body: 'How are you feeling today? Take a moment to record your mood.',
          showBrowser: true,
          priority: 'normal'
        });
      }
      
      // Schedule next day's reminder
      scheduleDailyReminder();
    }, timeUntilReminder);
  };

  const sendAchievementNotification = (achievement) => {
    if (notificationSettings.achievementAlerts) {
      addNotification({
        type: 'achievement',
        title: '🎉 Achievement Unlocked!',
        body: `You've earned: ${achievement.name}`,
        showBrowser: true,
        priority: 'high',
        data: { achievementId: achievement.id }
      });
    }
  };

  const sendFriendActivityNotification = (friend, activity) => {
    if (notificationSettings.friendActivity) {
      addNotification({
        type: 'friend_activity',
        title: `${friend.name} shared a mood`,
        body: `${friend.name} is feeling ${activity.mood} today`,
        showBrowser: false,
        priority: 'low',
        data: { friendId: friend.id, activityId: activity.id }
      });
    }
  };

  const sendCrisisAlert = () => {
    if (notificationSettings.crisisSupport) {
      addNotification({
        type: 'crisis_support',
        title: '🆘 Support Available',
        body: 'We noticed you might need support. Help is available 24/7.',
        showBrowser: true,
        priority: 'urgent',
        persistent: true
      });
    }
  };

  const sendWeeklyReport = (stats) => {
    if (notificationSettings.weeklyReports) {
      addNotification({
        type: 'weekly_report',
        title: '📊 Your Weekly Mood Report',
        body: `This week: ${stats.totalEntries} entries, ${stats.streakDays} day streak!`,
        showBrowser: true,
        priority: 'normal'
      });
    }
  };

  const updateSettings = (newSettings) => {
    setNotificationSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Initialize daily reminders
  useEffect(() => {
    if (notificationSettings.dailyReminders) {
      scheduleDailyReminder();
    }
  }, [notificationSettings.dailyReminders]);

  const value = {
    notifications,
    notificationSettings,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    getUnreadCount,
    requestPermission,
    sendAchievementNotification,
    sendFriendActivityNotification,
    sendCrisisAlert,
    sendWeeklyReport,
    updateSettings
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export { NotificationContext };