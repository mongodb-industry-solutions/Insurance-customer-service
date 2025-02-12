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
                  body: "This solution illustrates how MongoDB can transform call center operations. By converting call recordings into searchable vectors (numerical representations of data points in a multi-dimensional space), businesses can quickly access relevant information and improve customer service. We'll dig into how the integration of Amazon Transcribe, Cohere, and MongoDB Atlas Vector Search is achieving this transformation.",
                },
                {
                  heading: "How to Use the Demo",
                  body: [
                    "Accept the call by clicking on 'Accept'.",
                    "Click on the red button with the microphone icon, this will trigger the transcription service to start listening to what the user is saying.",
                    "Ask one of the suggested questions.",
                    "Click again on the microphone icon to stop recording.",
                    "Makes sure the transcription is correct and it displays exactly the sentence you uttered.",
                    "The suggested answer will appear on the right",
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
                    src: "/architecture.png", // Ensure this image is in the public folder
                    alt: "Architecture",
                  },
                },
              ],
            },
            {
              heading: "Why MongoDB?",
              content: [
                {
                  heading: "Integration",
                  body: "MongoDB is easy to integrate with AI services such as Amazon Bedrock and Transcribe.",
                },
                {
                  heading: "OLTP alongside Vectors",
                  body: "MongoDB integrates the transactional and vector data in the same platform.",
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