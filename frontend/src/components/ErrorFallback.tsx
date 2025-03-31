import { FallbackProps } from 'react-error-boundary';
import styles from './ErrorFallback.module.css';

export const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
    return (
        <div className={styles.container}>
            <div className={styles.errorContent}>
                <h1>Something went wrong</h1>
                <p className={styles.errorMessage}>{error.message || 'An unexpected error occurred'}</p>

                {process.env.NODE_ENV === 'development' && (
                    <pre className={styles.errorStack}>{error.stack}</pre>
                )}

                <div className={styles.actions}>
                    <button
                        className={styles.resetButton}
                        onClick={resetErrorBoundary}
                    >
                        Try Again
                    </button>
                    <button
                        className={styles.homeButton}
                        onClick={() => window.location.href = '/'}
                    >
                        Go to Home Page
                    </button>
                </div>
            </div>
        </div>
    );
};
