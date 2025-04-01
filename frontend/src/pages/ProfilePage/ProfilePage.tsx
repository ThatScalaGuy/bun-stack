import { InfoCard, InfoList, PageHeader } from '../../design-system';
import { UserProfileForm } from '../../components/user/UserProfileForm';
import styles from './ProfilePage.module.css';

export const ProfilePage = () => {
    return (
        <div className={styles.container}>
            <PageHeader
                title="Profile Settings"
                subtitle="Manage your personal information"
            />
            <div className={styles.grid}>
                <div className={styles.mainSection}>
                    <UserProfileForm />
                </div>

                <div className={styles.sideSection}>

                    <InfoCard title='Profile Tips'>
                        <InfoList items={[
                            <><strong>Username:</strong> Choose a username that represents you professionally.</>,
                            <><strong>Bio:</strong> A good bio helps others understand who you are and what you do.</>,
                            <><strong>Email:</strong> Keep your email verified to receive important notifications.</>
                        ]} /> 
                    </InfoCard>

                    <InfoCard title='Security Tips'>
                        <p className={styles.tipsText}>
                            Your profile information is only visible to other users according to your privacy settings.
                            You can manage these settings in the Security section.
                        </p>
                    </InfoCard>
                </div>
            </div>
        </div>
    );
};
