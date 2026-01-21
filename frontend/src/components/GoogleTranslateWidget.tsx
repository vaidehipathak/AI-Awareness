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
    // Function to initialize the Google Translate Element
    const initGoogleTranslate = () => {
      if (window.google && window.google.translate) {
        // Clear previous instance if it seemingly exists (though hard to clear Google's DOM mess)
        const target = document.getElementById('google_translate_element');
        if (target) target.innerHTML = '';

        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,hi,es,fr,de,ja,ko,zh-CN,ar,pt,ru,it',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          'google_translate_element'
        )
      }
    }

    // Assign to window for the callback to find
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
            gap: 6px;
            background: #233554; /* same tone as mail icon */
            border-radius: 6px;
            border: 1px solid #64FFDA;
            padding: 6px 12px;
            height: 32px;
            /* overflow: hidden; Removed to ensure dropdown isn't clipped */
            cursor: pointer;
            transition: background 0.2s ease;
            margin-left: 10px; /* add spacing after mail icon */
          }

          .translate-container:hover {
            background: #112240;
          }

          .google-logo {
            width: 18px;
            height: 18px;
            flex-shrink: 0;
            margin-right: 4px;
            color: #64FFDA;
          }

          /* Core Google element - Overlay Mode */
          #google_translate_element {
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

      <div className="translate-container relative group">
        <Languages className="google-logo z-10" />
        <span className="text-sm font-medium text-gray-200 group-hover:text-[#64FFDA] transition-colors relative z-10">Language</span>
        <div id="google_translate_element"></div>
      </div>
    </>
  )
}

export default GoogleTranslateWidget
