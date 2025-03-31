import { Link } from 'react-router';
import styles from './NotFoundPage.module.css';

export const NotFoundPage = () => {
    return (
        <div className={styles.container}>
            <h1>404</h1>
            <h2>Page Not Found</h2>
            <p>The page you are looking for doesn't exist or has been moved.</p>
            <Link to="/" className={styles.homeLink}>
                Go to Home Page
            </Link>
        </div>
    );
};
