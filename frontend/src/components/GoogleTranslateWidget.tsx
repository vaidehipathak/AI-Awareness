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

    if (!document.getElementById('google-translate-script')) {
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
            gap: 6px;
            background: #233554; /* same tone as mail icon */
            border-radius: 6px;
            border: 1px solid #64FFDA;
            padding: 6px 12px;
            height: 32px;
            overflow: hidden;
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

          /* Core Google element */
          #google_translate_element {
            display: inline-block !important;
            line-height: 1 !important;
            height: 20px !important;
            max-height: 20px !important;
            overflow: hidden !important;
          }

          .goog-te-gadget {
            font-family: 'Inter', sans-serif !important;
            font-size: 0 !important;
            line-height: 1 !important;
            height: auto !important;
          }

          .goog-te-gadget-simple {
            background: none !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            color: #E6F1FF !important;
            display: inline-flex !important;
            align-items: center !important;
            gap: 0 !important;
            height: 20px !important;
            white-space: nowrap !important;
          }

          .goog-te-gadget-simple:hover {
            color: #64FFDA !important;
          }

          /* Hide Google icon */
          .goog-te-gadget-icon {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
          }

          /* Keep only language text */
          .goog-te-menu-value {
            font-family: 'Fira Code', monospace !important;
            font-size: 13px !important;
            line-height: 1 !important;
            display: inline-flex !important;
            align-items: center !important;
            color: #E6F1FF !important;
            padding: 0 !important;
            margin: 0 !important;
            white-space: nowrap !important;
            overflow: hidden !important;
          }

          /* Remove divider and arrow ▼ */
          .goog-te-menu-value > span:first-child {
            display: inline !important;
            color: inherit !important;
            font-size: 13px !important;
            line-height: 1 !important;
            padding: 0 !important;
            margin: 0 !important;
            vertical-align: middle !important;
          }

          .goog-te-menu-value > span:nth-child(2),
          .goog-te-menu-value > span:last-child,
          .goog-te-menu-value span[style*="border-left"],
          .goog-te-menu-value span[style*="inline-block"],
          .goog-te-menu-value span > img,
          .goog-te-menu-value img {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
            visibility: hidden !important;
          }

          /* Dropdown menu styling */
          .goog-te-menu2 {
            background-color: #0a192f !important;
            border: 1px solid #64FFDA !important;
            border-radius: 7px !important;
            box-shadow: 0 10px 24px rgba(0,0,0,0.3) !important;
          }

          .goog-te-menu2-item div,
          .goog-te-menu2-item span {
            color: #E6F1FF !important;
            font-family: 'Inter', sans-serif !important;
            font-size: 13px !important;
            padding: 6px 12px !important;
          }

          .goog-te-menu2-item:hover {
            background-color: #112240 !important;
          }

          .goog-te-menu2-item-selected div,
          .goog-te-menu2-item-selected span {
            color: #64FFDA !important;
          }

          /* Dropdown positioning */
          .goog-te-menu-frame {
            z-index: 9999 !important;
            position: absolute !important;
            top: 40px !important;
            right: 0 !important;
          }
        `}</style>
      </Helmet>

      <div className="translate-container">
        <Languages className="google-logo" />
        <div id="google_translate_element"></div>
      </div>
    </>
  )
}

export default GoogleTranslateWidget
