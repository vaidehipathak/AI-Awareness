import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'

// Add types for window.google
declare global {
    interface Window {
        google: any;
        googleTranslateElementInit: any;
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
                <svg className="google-logo" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <div id="google_translate_element"></div>
            </div>
        </>
    )
}

export default GoogleTranslateWidget
