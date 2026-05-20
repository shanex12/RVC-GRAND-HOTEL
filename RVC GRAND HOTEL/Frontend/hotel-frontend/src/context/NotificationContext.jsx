import { createContext, useContext, useState } from "react";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {

  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = "info") => {

    const newNotification = {
      id: Date.now(),
      message,
      type,
      time: new Date(),
      read: false,
    };

    setNotifications((prev) => [
      newNotification,
      ...prev,
    ]);
  };

  const markAsRead = (id) => {

    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, read: true }
          : n
      )
    );

  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () =>
  useContext(NotificationContext);