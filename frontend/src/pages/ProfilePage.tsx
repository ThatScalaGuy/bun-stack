import { UserProfileForm } from '../components/user/UserProfileForm';
import styles from './ProfilePage.module.css';

export const ProfilePage = () => {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Profile Settings</h1>
                    <p className={styles.subtitle}>Manage your personal information</p>
                </div>
            </header>

            <div className={styles.grid}>
                <div className={styles.mainSection}>
                    <UserProfileForm />
                </div>

                <div className={styles.sideSection}>
                    <div className={styles.tipsCard}>
                        <h3 className={styles.tipsTitle}>Profile Tips</h3>
                        <ul className={styles.tipsList}>
                            <li className={styles.tipItem}>
                                <strong>Username:</strong> Choose a username that represents you professionally.
                            </li>
                            <li className={styles.tipItem}>
                                <strong>Bio:</strong> A good bio helps others understand who you are and what you do.
                            </li>
                            <li className={styles.tipItem}>
                                <strong>Email:</strong> Keep your email verified to receive important notifications.
                            </li>
                        </ul>
                    </div>

                    <div className={styles.tipsCard}>
                        <h3 className={styles.tipsTitle}>Privacy Note</h3>
                        <p className={styles.tipsText}>
                            Your profile information is only visible to other users according to your privacy settings.
                            You can manage these settings in the Security section.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
