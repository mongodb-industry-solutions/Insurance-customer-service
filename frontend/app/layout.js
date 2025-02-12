// layout.js

// This metadata is automatically applied to the head of your page.
export const metadata = {
  title: "Leafy Insurance",
  description: "Provide real-time suggestions to customer service operators with Vector Search."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" >
      <body>
        {children}
      </body>
    </html>
  );
}
