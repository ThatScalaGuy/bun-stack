import { RegisterForm } from '../../components/auth/RegisterForm';
import styles from './AuthPage.module.css';

export const RegisterPage = () => {
    return (
        <div className={styles.container}>
            <div className={styles.formContainer}>
                <RegisterForm />
            </div>
            <div className={styles.imageContainer}>
                <div className={styles.overlay}>
                    <h1>Join Us</h1>
                    <p>Create an account to get started with our services.</p>
                </div>
            </div>
        </div>
    );
};
