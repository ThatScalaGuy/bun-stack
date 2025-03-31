import { LoginForm } from '../../components/auth/LoginForm';
import styles from './AuthPage.module.css';

export const LoginPage = () => {
    return (
        <div className={styles.container}>
            <div className={styles.formContainer}>
                <LoginForm />
            </div>
            <div className={styles.imageContainer}>
                <div className={styles.overlay}>
                    <h1>Welcome Back</h1>
                    <p>Log in to access your account and manage your profile.</p>
                </div>
            </div>
        </div>
    );
};
