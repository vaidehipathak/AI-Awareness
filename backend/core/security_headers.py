"""
core/security_headers.py

Middleware that injects Content-Security-Policy and Permissions-Policy
response headers on every request.  Runs in both dev and production.
"""


class SecurityHeadersMiddleware:
    """
    Adds security-relevant HTTP response headers that Django does not set by default:
      - Content-Security-Policy
      - Permissions-Policy
      - Referrer-Policy
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # ------------------------------------------------------------------ #
        # Content-Security-Policy
        # Restricts sources for scripts, styles, images, fonts, and API calls.
        # Adjust 'connect-src' when deploying behind a real domain.
        # ------------------------------------------------------------------ #
        csp_directives = "; ".join([
            "default-src 'self'",
            # Scripts: allow self + inline (React dev HMR) + blob: (PDF.js workers)
            "script-src 'self' 'unsafe-inline' blob:",
            # Styles: allow self + inline (styled-components / inline React styles)
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            # Fonts
            "font-src 'self' https://fonts.gstatic.com data:",
            # Images: allow self, data URIs, and external news article thumbnails
            "img-src 'self' data: blob: https:",
            # API calls: allow same origin + Supabase + Groq
            "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.groq.com",
            # Media files served from /media/
            "media-src 'self'",
            # Workers (PDF.js, service workers)
            "worker-src 'self' blob:",
            # Frames: disallow completely
            "frame-ancestors 'none'",
            # Base URI: prevent base tag injection
            "base-uri 'self'",
            # Form action: prevent form redirect attacks
            "form-action 'self'",
        ])
        response["Content-Security-Policy"] = csp_directives

        # ------------------------------------------------------------------ #
        # Permissions-Policy
        # Disables browser features the app does not use.
        # ------------------------------------------------------------------ #
        response["Permissions-Policy"] = (
            "camera=(), microphone=(), geolocation=(), "
            "payment=(), usb=(), interest-cohort=()"
        )

        # ------------------------------------------------------------------ #
        # Referrer-Policy
        # Prevents leaking the full URL in Referer headers to third parties.
        # ------------------------------------------------------------------ #
        response["Referrer-Policy"] = "strict-origin-when-cross-origin"

        return response
