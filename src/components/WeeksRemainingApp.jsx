import React, { useState, useEffect } from 'react';
import { Clock, Calendar, AlertTriangle, Settings, Bell } from 'lucide-react';

// Custom hook for localStorage
function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  const setStoredValue = (newValue) => {
    try {
      setValue(newValue);
      window.localStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [value, setStoredValue];
}

export default function WeeksRemainingApp() {
    const [age, setAge] = useLocalStorage('userAge', '');
    const [notificationsEnabled, setNotificationsEnabled] = useLocalStorage('notificationsEnabled', false);
    const [lastNotificationDate, setLastNotificationDate] = useLocalStorage('lastNotificationDate', '');
    
    const [isSetup, setIsSetup] = useState(false);
    const [remainingWeeks, setRemainingWeeks] = useState(0);
  
    // Check if user is already set up on component mount
    useEffect(() => {
      if (age && parseInt(age) > 0) {
        const weeks = calculateWeeks(parseInt(age));
        setRemainingWeeks(weeks);
        setIsSetup(true);
      }
    }, []); // Empty dependency array - only run on mount
  
    // Calculate remaining weeks
    const calculateWeeks = (userAge) => {
      const lifeExpectancy = 70;
      const weeksPerYear = 52;
      return Math.max(0, (lifeExpectancy - userAge) * weeksPerYear);
    };
  
    // Request notification permission
    const requestNotificationPermission = async () => {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        const enabled = permission === 'granted';
        setNotificationsEnabled(enabled);
        return enabled;
      }
      return false;
    };
  
    // Send notification with duplicate prevention
    const sendNotification = (title, body, tag = 'life-timer') => {
      if (notificationsEnabled && 'Notification' in window) {
        const today = new Date().toDateString();
        const notificationKey = `${tag}-${today}`;
        
        // Prevent duplicate notifications on the same day
        if (lastNotificationDate !== notificationKey) {
          new Notification(title, {
            body: body,
            icon: '/favicon.ico',
            requireInteraction: false,
            tag: tag,
            silent: false
          });
          setLastNotificationDate(notificationKey);
        }
      }
    };
  
    // Setup daily and weekly notifications
    useEffect(() => {
      if (!isSetup || !notificationsEnabled || !remainingWeeks) return;
  
      const notifications = [
        {
          time: 9, // 9 AM
          title: "⏰ Morning Reality Check",
          body: `You have ${remainingWeeks.toLocaleString()} weeks left. Make today count!`,
          tag: 'morning-reminder'
        },
        {
          time: 13, // 1 PM
          title: "🎯 Midday Focus",
          body: `Half the day is gone. Are you being productive with your remaining ${remainingWeeks.toLocaleString()} weeks?`,
          tag: 'midday-reminder'
        },
        {
          time: 18, // 6 PM
          title: "🌅 Evening Reflection",
          body: `Another day closer to the end. ${remainingWeeks.toLocaleString()} weeks remaining. What did you accomplish?`,
          tag: 'evening-reminder'
        },
        {
          time: 21, // 9 PM
          title: "🌙 Night Reminder",
          body: `Time is finite. You have ${remainingWeeks.toLocaleString()} weeks left. Plan tomorrow wisely.`,
          tag: 'night-reminder'
        }
      ];
  
      const checkTime = () => {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        
        // Check if it's time for any notification (within 1 minute window)
        notifications.forEach(notif => {
          if (currentHour === notif.time && currentMinute === 0) {
            sendNotification(notif.title, notif.body, notif.tag);
          }
        });
  
        // Weekly reminder (Sunday at 8 PM)
        if (now.getDay() === 0 && currentHour === 20 && currentMinute === 0) {
          sendNotification(
            "📅 Week Over - Time Vanishing",
            `Another week gone forever. Only ${(remainingWeeks - 1).toLocaleString()} weeks left in your life. What will you do differently next week?`,
            'weekly-reminder'
          );
        }
      };
  
      const interval = setInterval(checkTime, 60000); // Check every minute
      return () => clearInterval(interval);
    }, [isSetup, notificationsEnabled, remainingWeeks, sendNotification]);
  
    const handleSetup = async () => {
      const userAge = parseInt(age);
      if (userAge > 0 && userAge < 100) {
        const weeks = calculateWeeks(userAge);
        setRemainingWeeks(weeks);
        
        // Request notification permission
        const permissionGranted = await requestNotificationPermission();
        
        setIsSetup(true);
        
        // Send welcome notification
        if (permissionGranted) {
          setTimeout(() => {
            sendNotification(
              "⚠️ Reality Check Activated",
              `You have ${weeks.toLocaleString()} weeks left to live. Make them count!`,
              'welcome-notification'
            );
          }, 1000);
        }
      }
    };
  
    const reset = () => {
      if (window.confirm('Are you sure you want to reset all data? This will clear your age and notification settings.')) {
        setIsSetup(false);
        setAge('');
        setRemainingWeeks(0);
        setNotificationsEnabled(false);
        setLastNotificationDate('');
      }
    };
  
    const getMotivationalMessage = () => {
      if (remainingWeeks > 2000) {
        return "You still have time, but don't waste it!";
      } else if (remainingWeeks > 1000) {
        return "Time is running out faster than you think.";
      } else if (remainingWeeks > 500) {
        return "Less than 500 weeks left. Every moment matters.";
      } else {
        return "Time is critically short. Act with extreme urgency!";
      }
    };
  
    const getUrgencyColor = () => {
      if (remainingWeeks > 2000) return "text-yellow-600";
      if (remainingWeeks > 1000) return "text-orange-600";
      if (remainingWeeks > 500) return "text-red-500";
      return "text-red-700";
    };
  
    if (!isSetup) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full border border-white/20 shadow-2xl">
            <div className="text-center mb-8">
              <Clock className="mx-auto h-16 w-16 text-red-400 mb-4" />
              <h1 className="text-3xl font-bold text-white mb-2">Life Timer</h1>
              <p className="text-gray-300">Inspired by "4000 Weeks" - Your finite time visualized</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">
                  What's your current age?
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Enter your age"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                  min="1"
                  max="99"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSetup();
                    }
                  }}
                />
              </div>
              
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-200">
                    <p className="font-medium mb-1">Warning: Harsh Reality Ahead</p>
                    <p>This app will send you daily reminders about your remaining time. It's designed to create urgency and motivation.</p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleSetup}
                disabled={!age || parseInt(age) < 1 || parseInt(age) > 99}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg disabled:transform-none"
              >
                Calculate My Remaining Time
              </button>
            </div>
          </div>
        </div>
      );
    }
  
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <button
              onClick={reset}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
              title="Reset all data"
            >
              <Settings className="h-5 w-5" />
            </button>
            
            <Calendar className="mx-auto h-16 w-16 text-red-400 mb-4" />
            <h1 className="text-4xl font-bold mb-2">Your Life Timer</h1>
            <p className="text-gray-300">Based on 70-year life expectancy • Age: {age}</p>
          </div>
  
          <div className="max-w-4xl mx-auto">
            {/* Main Counter */}
            <div className="bg-gradient-to-r from-red-600/20 to-red-800/20 backdrop-blur-lg rounded-3xl p-8 mb-8 border border-red-500/30 shadow-2xl">
              <div className="text-center">
                <div className={`text-8xl font-bold mb-4 ${getUrgencyColor()}`}>
                  {remainingWeeks.toLocaleString()}
                </div>
                <div className="text-2xl font-semibold text-white mb-2">
                  WEEKS REMAINING
                </div>
                <div className="text-lg text-gray-300 mb-4">
                  That's approximately {Math.floor(remainingWeeks / 52)} years left
                </div>
                <div className={`text-xl font-bold ${getUrgencyColor()}`}>
                  {getMotivationalMessage()}
                </div>
              </div>
            </div>
  
            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold mb-4 text-red-400">Time Breakdown</h3>
                <div className="space-y-3 text-gray-300">
                  <div className="flex justify-between">
                    <span>Days remaining:</span>
                    <span className="font-bold text-white">{(remainingWeeks * 7).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hours remaining:</span>
                    <span className="font-bold text-white">{(remainingWeeks * 7 * 24).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Weekends left:</span>
                    <span className="font-bold text-white">{remainingWeeks.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current age:</span>
                    <span className="font-bold text-white">{age} years old</span>
                  </div>
                </div>
              </div>
  
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold mb-4 text-yellow-400">Notification Status</h3>
                <div className="flex items-center space-x-3 mb-4">
                  <Bell className={`h-5 w-5 ${notificationsEnabled ? 'text-green-400' : 'text-red-400'}`} />
                  <span className={notificationsEnabled ? 'text-green-400' : 'text-red-400'}>
                    {notificationsEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mb-3">
                  {notificationsEnabled 
                    ? 'You\'ll receive 4 daily reality checks about your remaining time.'
                    : 'Enable browser notifications for daily reminders.'
                  }
                </p>
                {!notificationsEnabled && (
                  <button
                    onClick={requestNotificationPermission}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Enable Notifications
                  </button>
                )}
              </div>
            </div>
  
            {/* Motivational Messages */}
            <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 backdrop-blur-lg rounded-2xl p-6 border border-orange-500/30">
              <h3 className="text-xl font-bold mb-4 text-orange-400">Remember</h3>
              <div className="grid md:grid-cols-2 gap-4 text-gray-300">
                <div>
                  <p className="mb-2">• Every week that passes is gone forever</p>
                  <p className="mb-2">• You can't buy more time with money</p>
                  <p className="mb-2">• Procrastination is stealing from your finite supply</p>
                </div>
                <div>
                  <p className="mb-2">• Focus on what truly matters</p>
                  <p className="mb-2">• Say no to time-wasting activities</p>
                  <p className="mb-2">• Make each week count toward your goals</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}