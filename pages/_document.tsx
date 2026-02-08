
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="UTF-8" />
        {/* Tailwind CDN is used here for MVP simplicity, but standard Tailwind is recommended for production */}
        <script src="https://cdn.tailwindcss.com" strategy="beforeInteractive"></script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <style>{`
          body { font-family: 'Inter', sans-serif; background-color: #f9fafb; margin: 0; }
          .fade-in { animation: fadeIn 0.4s ease-out; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          /* Ensure hydration spinner is always available */
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </Head>
      <body className="bg-gray-50 text-gray-900 overflow-x-hidden">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
