import { PasswordResetRequest } from '../../components/auth/PasswordResetRequest';
import styles from './AuthPage.module.css';

export const ForgotPasswordPage = () => {
    return (
        <div className={styles.container}>
            <div className={styles.formContainer}>
                <PasswordResetRequest />
            </div>
            <div className={styles.imageContainer}>
                <div className={styles.overlay}>
                    <h1>Forgot Password?</h1>
                    <p>Don't worry, we'll help you recover your account.</p>
                </div>
            </div>
        </div>
    );
};
