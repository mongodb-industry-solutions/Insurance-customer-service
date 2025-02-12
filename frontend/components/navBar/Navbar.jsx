"use client";

// Navbar.jsx

import React, { useState } from "react";
import Image from "next/image"; // Optimized image handling
import styles from "./Navbar.module.css";
import UserProfile from "@/components/userProfile/UserProfile";
import InfoWizard from "@/components/InfoWizard/InfoWizard";

const Navbar = () => {
  const [openHelpModal, setOpenHelpModal] = useState(false);

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        {/* Use Next.js Image for optimized loading */}
        <Image src="/logo.png" alt="Logo" width={200} height={50} priority />
      </div>

      <div className={styles["wizard-container"]}>
        <InfoWizard
          open={openHelpModal}
          setOpen={setOpenHelpModal}
          tooltipText="Tell me more!"
          iconGlyph="Wizard"
          sections={[
            {
              heading: "Instructions and Talk Track",
              content: [
                {
                  heading: "What is the Purpose of this Demo?",
                  body: "Provide real-time suggestions to customer service operators with Vector Search.",
                },
                {
                  heading: "How to Use the Demo",
                  body: [
                    "XXXXXXXXXX",
                    "XXXXXXXXXX",
                    "XXXXXXXXXX",
                    "XXXXXXXXXX.",
                    "XXXXXXXXXX.",
                    "XXXXXXXXXX",
                  ],
                },
              ],
            },
            {
              heading: "Behind the Scenes",
              content: [
                {
                  heading: "Data Flow",
                  body: "",
                },
                {
                  image: {
                    src: "/info.png", // Ensure this image is in the public folder
                    alt: "Architecture",
                  },
                },
              ],
            },
            {
              heading: "Why MongoDB?",
              content: [
                {
                  heading: "Heading 1",
                  body: "XXXXXXXXXX.",
                },
                {
                  heading: "Heading 2",
                  body: "XXXXXXXXXX.",
                },
                {
                  heading: "Heading 3",
                  body: "XXXXXXXXXX.",
                },
              ],
            },
          ]}
        />
      </div>

      <div className={styles.user}>
        <UserProfile />
      </div>
    </nav>
  );
};

export default Navbar;