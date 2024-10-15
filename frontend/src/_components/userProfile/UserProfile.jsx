import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // Import useLocation from react-router-dom
import styles from "./userProfile.module.css";

const UserProfile = () => {
    const location = useLocation(); // Get the current URL
    const [showAdditionalProfiles, setShowAdditionalProfiles] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState({
        name: "Eddie Grant",
        role: "Claim Adjuster",
        image: "/eddie.png"
    });

    // UseEffect to update default profile based on the URL
    useEffect(() => {
        if (location.pathname === "/CustomerService") {
            setSelectedProfile({
                name: "Rob Smith",
                role: "Customer Service",
                image: "/rob.png"
            });
        } else {
            setSelectedProfile({
                name: "Eddie Grant",
                role: "Claim Adjuster",
                image: "/eddie.png"
            });
        }
    }, [location.pathname]); // Runs every time the pathname changes

    const toggleAdditionalProfiles = () => {
        setShowAdditionalProfiles(!showAdditionalProfiles);
    };

    const switchProfile = (name, role, image) => {
        setSelectedProfile({ name, role, image });
        setShowAdditionalProfiles(false); // Hide additional profiles container after selecting
    };

    return (
        <div>
            <div className={styles.profile} onClick={toggleAdditionalProfiles}>
                <div className={styles.imageContainer}>
                    <img
                        className={styles.image}
                        src={selectedProfile.image}
                        alt="User Profile"
                    />
                </div>
                <div className={styles.details}>
                    <div className={styles.name}>{selectedProfile.name}</div>
                    <div className={styles.role}>{selectedProfile.role}</div>
                </div>
            </div>
            {showAdditionalProfiles && (
                <div className={styles.additionalProfilesContainer}>
                    <p>Switch user to:</p>
                    {selectedProfile.name !== "Jane Tree" && (
                        <AdditionalProfile
                            name="Jane Tree"
                            role="Underwriter"
                            image="/jane.png"
                            onClick={() => switchProfile("Jane Tree", "Underwriter", "/jane.png")}
                        />
                    )}
                    {selectedProfile.name !== "Rob Smith" && (
                        <AdditionalProfile
                            name="Rob Smith"
                            role="Customer Service"
                            image="/rob.png"
                            onClick={() => switchProfile("Rob Smith", "Customer Service", "/rob.png")}
                        />
                    )}
                    {selectedProfile.name !== "Eddie Grant" && (
                        <AdditionalProfile
                            name="Eddie Grant"
                            role="Claim Adjuster"
                            image="/eddie.png"
                            onClick={() => switchProfile("Eddie Grant", "Claim Adjuster", "/eddie.png")}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

const AdditionalProfile = ({ name, role, image, onClick }) => {
    return (
        <div className={styles.additionalProfile} onClick={onClick}>
            <div className={styles.imageContainer}>
                <img
                    className={styles.image}
                    src={image}
                    alt="User Profile"
                />
            </div>
            <div className={styles.details}>
                <div className={styles.name}>{name}</div>
                <div className={styles.role}>{role}</div>
            </div>
        </div>
    );
};

export default UserProfile;
