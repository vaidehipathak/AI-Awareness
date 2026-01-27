import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Languages } from 'lucide-react'

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
    googleTranslateRegistrations: Set<string>; // Registry for tracking all widget IDs
  }
}

// Initialize registry if it doesn't exist
if (typeof window !== 'undefined') {
  window.googleTranslateRegistrations = window.googleTranslateRegistrations || new Set();
}

interface GoogleTranslateWidgetProps {
  elementId?: string; // Optional custom ID for the widget container
}

const GoogleTranslateWidget = ({ elementId = 'google_translate_element' }: GoogleTranslateWidgetProps) => {

  useEffect(() => {
    // Add this instance's ID to the global registry
    window.googleTranslateRegistrations.add(elementId);

    // Function to initialize ALL registered Google Translate Elements
    // This is the global callback Google expects, but we make it smart enough to init everything
    const initGoogleTranslate = () => {
      if (window.google && window.google.translate) {
        window.googleTranslateRegistrations.forEach((id) => {
          const target = document.getElementById(id);

          // Only initialize if target exists and is empty (to prevent double init)
          // Google sometimes leaves garbage, so we can also check if it has child nodes
          if (target && target.childElementCount === 0) {
            new window.google.translate.TranslateElement(
              {
                pageLanguage: 'en',
                includedLanguages: 'en,hi,es,fr,de,ja,ko,zh-CN,ar,pt,ru,it',
                layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                autoDisplay: false,
              },
              id
            )
          }
        });
      }
    }

    // Assign/Update the global callback
    window.googleTranslateElementInit = initGoogleTranslate;

    // Check if script is already present
    if (document.getElementById('google-translate-script')) {
      // If script is loaded, try initializing manually
      // Use a small timeout to ensure DOM is ready or previous cleanup is done
      setTimeout(initGoogleTranslate, 100);
    } else {
      // Load script if not present
      const script = document.createElement('script')
      script.id = 'google-translate-script'
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
      script.async = true
      document.body.appendChild(script)
    }

    // Cleanup: we don't remove the script, but we could remove from registry if we needed perfectly clean unmounts.
    // However, for navbars, persistence is usually fine.

  }, [elementId])

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

          /* Container style - moved to Tailwind classes */
          
          /* Core Google element - Overlay Mode */
          #${elementId} {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            opacity: 0 !important;
            z-index: 20 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            cursor: pointer !important;
          }

          .goog-te-gadget {
            width: 100% !important;
            height: 100% !important;
            display: block !important;
          }

          .goog-te-gadget-simple {
            width: 100% !important;
            height: 100% !important;
            display: block !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          /* Dropdown menu positioning */
          .goog-te-menu-frame {
            z-index: 9999 !important;
            position: absolute !important;
            top: 40px !important;
            right: 0 !important;
          }
        `}</style>
      </Helmet>

      <div className="relative group inline-flex items-center gap-1.5 ml-2.5 px-3 py-1.5 h-8 rounded-md border border-gray-300 dark:border-[#64FFDA] bg-transparent hover:bg-gray-100 dark:hover:bg-[#112240] transition-colors duration-200 cursor-pointer">
        <Languages className="w-4 h-4 shrink-0 mr-1 text-gray-600 dark:text-[#64FFDA]" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-[#64FFDA] transition-colors relative z-10">Language</span>
        <div id={elementId}></div>
      </div>
    </>
  )
}

export default GoogleTranslateWidget

