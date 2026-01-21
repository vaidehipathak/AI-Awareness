import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Languages } from 'lucide-react'

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

const GoogleTranslateWidget = () => {
  useEffect(() => {
    // Define the initialization function globally
    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages:
              'en,hi,es,fr,de,ja,ko,zh-CN,ar,pt,ru,it',
            layout:
              window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          'google_translate_element'
        )
      }
    }

    // Check if script is already loaded
    if (window.google && window.google.translate) {
      window.googleTranslateElementInit();
    } else if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script')
      script.id = 'google-translate-script'
      script.src =
        'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  return (
    <>
      <Helmet>
        <style>{`
          /* Hide Google banner */
          .goog-te-banner-frame.skiptranslate {
            display: none !important;
          }
          body {
            top: 0 !important;
          }

          /* Container style */
          .translate-container {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 8px 12px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative; /* Crucial for overlay */
            overflow: hidden;
            border: 1px solid transparent; /* Prevent layout shift */
          }
          
           .translate-container:hover {
            background-color: rgba(0, 0, 0, 0.05);
          }
           .dark .translate-container:hover {
             background-color: rgba(255, 255, 255, 0.1);
          }

          /* The visual content */
          .translate-content {
            display: flex;
            align-items: center;
            gap: 8px;
            pointer-events: none; /* Let clicks pass through to the google element if it's on top, or just purely visual */
            color: #64748b; /* slate-500 */
          }
          .dark .translate-content {
            color: #94a3b8; /* slate-400 */
          }
          
          .translate-container:hover .translate-content {
             color: #0f172a; /* slate-900 */
          }
          .dark .translate-container:hover .translate-content {
             color: #f8fafc; /* slate-50 */
          }

          /* Core Google element - Hidden Overlay */
          #google_translate_element {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0; /* Invisible but clickable */
            z-index: 10;
            cursor: pointer;
            overflow: hidden;
          }

          /* Ensure the google gadget inside fills the space so clicks register */
          .goog-te-gadget {
            width: 100% !important;
            height: 100% !important;
          }
          .goog-te-gadget-simple {
            width: 100% !important;
            height: 100% !important;
          }
          
          /* Dropdown Positioning - Try to make it appear reasonably relative to the container */
           .goog-te-menu-frame {
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
            border-radius: 0.5rem !important;
            border: 1px solid rgba(226, 232, 240, 1) !important; /* slate-200 */
          }
           .dark .goog-te-menu-frame {
             border: 1px solid rgba(30, 41, 59, 1) !important; /* slate-800 */
           }

        `}</style>
      </Helmet>

      <div className="translate-container" title="Change Language">
        {/* Visual Layer */}
        <div className="translate-content">
          <Languages className="w-4 h-4" />
          <span className="text-sm font-medium">Languages</span>
        </div>

        {/* Functional Layer (Hidden) */}
        <div id="google_translate_element"></div>
      </div>
    </>
  )
}

export default GoogleTranslateWidget
