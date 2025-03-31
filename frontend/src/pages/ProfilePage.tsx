import { UserProfileForm } from '../components/user/UserProfileForm';
import styles from './ProfilePage.module.css';

export const ProfilePage = () => {
    return (
        <div className={styles.container}>
            <h1 className={styles.pageTitle}>Profile Settings</h1>

            <div className={styles.content}>
                <UserProfileForm />
            </div>
        </div>
    );
};
