'use client';

import React, { useState } from 'react';

interface NotificationPreferencesProps {
  preferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
  };
  onSave: (updatedPreferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
  }) => void;
}

const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({
  preferences,
  onSave,
}) => {
  const [emailNotifications, setEmailNotifications] = useState(preferences.emailNotifications);
  const [smsNotifications, setSmsNotifications] = useState(preferences.smsNotifications);
  const [pushNotifications, setPushNotifications] = useState(preferences.pushNotifications);

  const handleSave = () => {
    onSave({ emailNotifications, smsNotifications, pushNotifications });
  };

  return (
    <div className="p-6 bg-neutral-100 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-primary">Notification Preferences</h2>
      <div className="form-control mb-4">
        <label className="label cursor-pointer">
          <span className="label-text">Email Notifications</span>
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={emailNotifications}
            onChange={(e) => setEmailNotifications(e.target.checked)}
          />
        </label>
      </div>
      <div className="form-control mb-4">
        <label className="label cursor-pointer">
          <span className="label-text">SMS Notifications</span>
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={smsNotifications}
            onChange={(e) => setSmsNotifications(e.target.checked)}
          />
        </label>
      </div>
      <div className="form-control mb-4">
        <label className="label cursor-pointer">
          <span className="label-text">Push Notifications</span>
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={pushNotifications}
            onChange={(e) => setPushNotifications(e.target.checked)}
          />
        </label>
      </div>
      <button onClick={handleSave} className="btn btn-primary mt-4">
        Save Preferences
      </button>
    </div>
  );
};

export default NotificationPreferences;
