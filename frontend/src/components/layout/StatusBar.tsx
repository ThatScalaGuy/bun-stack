import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import styles from './StatusBar.module.css';

export const StatusBar = () => {
  const [date, setDate] = useState(new Date());
  const { user } = useAuth();
  
  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={styles.statusBar}>
      <div className={styles.statusBarLeft}>
        <div className={styles.statusItem}>
          <span>Ready</span>
        </div>
      </div>
      <div className={styles.statusBarRight}>
        {user && (
          <div className={styles.statusItem}>
            <span>
              {user.roles?.includes('admin') ? 'Admin' : 'User'}
            </span>
          </div>
        )}
        <div className={styles.statusItem}>
          <span>
            {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};
