// app/layout.js
import "./global.css";

export const metadata = {
  title: 'ResuMind',
  description: 'AI-powered Resume Analyzer',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}
