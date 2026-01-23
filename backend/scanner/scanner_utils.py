"""
Simplified vulnerability scanner utilities for Django integration.
Core scanning functions extracted from the original scanner.
"""

import requests
from urllib.parse import urlparse, urljoin
from bs4 import BeautifulSoup
import ssl
import socket
from typing import Dict, Any


def normalize_url(url: str) -> str:
    """Ensure URL has a scheme"""
    url = (url or "").strip()
    if not url:
        return url
    if not url.startswith(("http://", "https://")):
        url = "https://" + url
    return url.rstrip("/")


def check_ssl_certificate(url: str) -> Dict[str, Any]:
    """Check SSL/TLS certificate"""
    try:
        parsed = urlparse(url)
        hostname = parsed.hostname
        port = parsed.port or 443
        
        context = ssl.create_default_context()
        with socket.create_connection((hostname, port), timeout=10) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                cert = ssock.getpeercert()
                return {
                    "test": "SSL Certificate",
                    "vulnerable": False,
                    "details": f"Valid SSL certificate for {hostname}",
                    "issuer": dict(x[0] for x in cert['issuer']),
                }
    except Exception as e:
        return {
            "test": "SSL Certificate",
            "vulnerable": True,
            "details": f"SSL Error: {str(e)}",
        }


def check_security_headers(url: str) -> Dict[str, Any]:
    """Check for security headers"""
    try:
        headers_ua = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
        response = requests.get(url, timeout=10, verify=False, headers=headers_ua)
        headers = response.headers
        
        required_headers = {
            'X-Frame-Options': 'Protects against clickjacking',
            'X-Content-Type-Options': 'Prevents MIME sniffing',
            'Strict-Transport-Security': 'Enforces HTTPS',
            'Content-Security-Policy': 'Prevents XSS attacks',
            'X-XSS-Protection': 'XSS filter',
        }
        
        missing = []
        present = []
        
        for header, description in required_headers.items():
            if header.lower() in [h.lower() for h in headers.keys()]:
                present.append(f"{header}: {headers.get(header)}")
            else:
                missing.append(f"{header} ({description})")
        
        return {
            "test": "Security Headers",
            "vulnerable": len(missing) > 0,
            "details": f"Missing {len(missing)} security headers",
            "missing_headers": missing,
            "present_headers": present,
            "severity": "low" if "Strict-Transport-Security" in [h.split(':')[0] for h in present] else "medium"
        }
    except Exception as e:
        return {
            "test": "Security Headers",
            "vulnerable": True,
            "details": f"Error: {str(e)}",
        }


def check_xss_reflection(url: str) -> Dict[str, Any]:
    """Basic XSS reflection test"""
    try:
        test_payload = "<script>alert('XSS')</script>"
        test_url = f"{url}?test={test_payload}"
        
        response = requests.get(test_url, timeout=10)
        
        if test_payload in response.text:
            return {
                "test": "XSS Reflection",
                "vulnerable": True,
                "details": "Payload reflected in response - potential XSS vulnerability",
            }
        else:
            return {
                "test": "XSS Reflection",
                "vulnerable": False,
                "details": "No XSS reflection detected",
            }
    except Exception as e:
        return {
            "test": "XSS Reflection",
            "vulnerable": False,
            "details": f"Test completed: {str(e)}",
        }


def check_directory_listing(url: str) -> Dict[str, Any]:
    """Check for directory listing"""
    try:
        common_paths = ['/', '/admin/', '/backup/', '/uploads/', '/files/']
        findings = []
        
        for path in common_paths:
            test_url = urljoin(url, path)
            try:
                response = requests.get(test_url, timeout=5)
                if response.status_code == 200:
                    if 'Index of' in response.text or 'Directory listing' in response.text:
                        findings.append(f"{path} - Directory listing enabled")
            except:
                pass
        
        return {
            "test": "Directory Listing",
            "vulnerable": len(findings) > 0,
            "details": f"Found {len(findings)} exposed directories" if findings else "No directory listings found",
            "findings": findings,
        }
    except Exception as e:
        return {
            "test": "Directory Listing",
            "vulnerable": False,
            "details": f"Test completed: {str(e)}",
        }


def check_robots_txt(url: str) -> Dict[str, Any]:
    """Check robots.txt for sensitive paths"""
    try:
        robots_url = urljoin(url, '/robots.txt')
        response = requests.get(robots_url, timeout=10)
        
        if response.status_code == 200:
            sensitive_keywords = ['admin', 'private', 'secret', 'backup', 'config']
            content = response.text.lower()
            found = [kw for kw in sensitive_keywords if kw in content]
            
            return {
                "test": "Robots.txt Analysis",
                "vulnerable": len(found) > 0,
                "details": f"Found {len(found)} sensitive paths in robots.txt" if found else "No sensitive paths disclosed",
                "keywords_found": found,
                "severity": "medium" if found else "info",
                "recommendation": "Remove sensitive paths from robots.txt or use proper access controls" if found else None,
            }
        else:
            return {
                "test": "Robots.txt Analysis",
                "vulnerable": False,
                "details": "No robots.txt found",
                "severity": "info",
            }
    except Exception as e:
        return {
            "test": "Robots.txt Analysis",
            "vulnerable": False,
            "details": f"Test completed: {str(e)}",
            "severity": "info",
        }


def check_cors_policy(url: str) -> Dict[str, Any]:
    """Check CORS policy configuration with context awareness"""
    try:
        response = requests.options(url, timeout=10, headers={'Origin': 'https://evil.com'})
        headers = {k.lower(): v for k, v in response.headers.items()}
        
        cors_headers = {
            'access-control-allow-origin': headers.get('access-control-allow-origin'),
            'access-control-allow-credentials': headers.get('access-control-allow-credentials'),
            'access-control-allow-methods': headers.get('access-control-allow-methods'),
        }
        
        issues = []
        is_public_api = '/api/' in url or 'api.' in urlparse(url).netloc
        
        severity = "info"
        vulnerable = False
        
        if cors_headers['access-control-allow-origin'] == '*':
            if is_public_api:
                # Acceptable for public APIs
                issues.append("Wildcard (*) origin used (Acceptable for Public API)")
            else:
                issues.append("Wildcard (*) origin allows any domain")
                vulnerable = True
                severity = "medium"

        if cors_headers['access-control-allow-credentials'] == 'true' and cors_headers['access-control-allow-origin'] == '*':
            issues.append("Critical: Credentials allowed with wildcard origin")
            vulnerable = True
            severity = "critical"
        
        return {
            "test": "CORS Policy",
            "vulnerable": vulnerable,
            "details": f"Found {len(issues)} configuration warnings" if issues else "CORS policy is secure",
            "issues": issues,
            "cors_headers": {k: v for k, v in cors_headers.items() if v},
            "severity": severity if vulnerable else "info",
            "recommendation": "Configure CORS to allow only trusted origins" if vulnerable else None,
        }
    except Exception as e:
        return {
            "test": "CORS Policy",
            "vulnerable": False,
            "details": f"CORS check completed: {str(e)}",
            "severity": "info",
        }


def check_cookie_security(url: str) -> Dict[str, Any]:
    """Check cookie security attributes with smart detection"""
    try:
        response = requests.get(url, timeout=10)
        cookies = response.cookies
        
        if not cookies:
            return {
                "test": "Cookie Security",
                "vulnerable": False,
                "details": "No cookies set",
                "severity": "info",
            }
        
        issues = []
        # Removed "id" and "user" which cause too many false positives on tracking cookies (e.g. 'uid', 'cuid')
        auth_keywords = ['session', 'auth', 'token', 'csrf', 'login', 'signin', 'account']
        
        critical_issues = False
        
        for cookie in cookies:
            name_lower = cookie.name.lower()
            # Stricter matching: exact match or clear prefix/suffix
            is_auth_cookie = any(kw in name_lower for kw in auth_keywords)
            
            if is_auth_cookie:
                if not cookie.secure:
                    issues.append(f"Auth cookie '{cookie.name}' missing Secure flag")
                    critical_issues = True
                if not cookie.has_nonstandard_attr('HttpOnly'):
                    issues.append(f"Auth cookie '{cookie.name}' missing HttpOnly flag")
                    critical_issues = True
            else:
                # Ignore non-auth cookies completely for High severity to reduce noise
                # Only flag as Low/Info if absolutely insecure
                if not cookie.secure:
                    pass # Common for tracking cookies, don't flag as vulnerability
        
        vulnerable = len(issues) > 0
        severity = "medium"
        if critical_issues:
            severity = "high"
        
        return {
            "test": "Cookie Security",
            "vulnerable": vulnerable,
            "details": f"Found {len(issues)} critical cookie issues" if issues else "Cookies securely configured",
            "issues": issues,
            "cookie_count": len(cookies),
            "severity": severity if vulnerable else "info",
            "recommendation": "Set Secure and HttpOnly flags on authentication cookies" if critical_issues else None,
        }
    except Exception as e:
        return {
            "test": "Cookie Security",
            "vulnerable": False,
            "details": f"Cookie check completed: {str(e)}",
            "severity": "info",
        }


def check_redirect_validation(url: str) -> Dict[str, Any]:
    """Check for open redirect vulnerabilities by following redirects"""
    try:
        test_urls = [
            f"{url}?redirect=https://evil.com",
            f"{url}?url=https://evil.com",
            f"{url}?next=https://evil.com",
        ]
        
        vulnerable_params = []
        for test_url in test_urls:
            try:
                # Follow redirects to see where we end up
                response = requests.get(test_url, timeout=5, allow_redirects=True)
                
                # Check actual final URL host
                final_host = urlparse(response.url).netloc
                if 'evil.com' in final_host:
                    param = test_url.split('?')[1].split('=')[0]
                    vulnerable_params.append(param)
            except:
                pass
        
        return {
            "test": "Open Redirect",
            "vulnerable": len(vulnerable_params) > 0,
            "details": f"Found {len(vulnerable_params)} vulnerable redirect parameters" if vulnerable_params else "No open redirect vulnerabilities detected",
            "vulnerable_params": vulnerable_params,
            "severity": "high" if vulnerable_params else "info",
            "recommendation": "Validate and whitelist redirect URLs" if vulnerable_params else None,
        }
    except Exception as e:
        return {
            "test": "Open Redirect",
            "vulnerable": False,
            "details": f"Redirect check completed: {str(e)}",
            "severity": "info",
        }


def check_https_enforcement(url: str) -> Dict[str, Any]:
    """Check if HTTPS is enforced via HSTS or redirects"""
    try:
        parsed = urlparse(url)
        # Force HTTP URL to test the redirect
        http_url = url.replace('https://', 'http://') if parsed.scheme == 'https' else url
        
        headers_ua = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }

        # 1. Check for HSTS first (Gold Standard)
        try:
            # We must use HTTPS to check for HSTS headers
            target_https = http_url.replace('http://', 'https://')
            resp = requests.get(target_https, timeout=5, headers=headers_ua)
            headers = {k.lower(): v for k, v in resp.headers.items()}
            
            if 'strict-transport-security' in headers:
                return {
                    "test": "HTTPS Enforcement",
                    "vulnerable": False,
                    "details": "HSTS Enabled - HTTPS is strictly enforced",
                    "severity": "info",
                }
        except:
            pass 

        # 2. Check Redirect Chain
        try:
            # We want to see if http:// eventually lands on https://
            # allow_redirects=True follows 301 -> 302 -> 200 chain
            response = requests.get(http_url, timeout=5, allow_redirects=True, headers=headers_ua)
            
            final_scheme = urlparse(response.url).scheme
            
            if final_scheme == 'https':
                return {
                    "test": "HTTPS Enforcement",
                    "vulnerable": False,
                    "details": f"HTTP redirects to HTTPS ({len(response.history)} hops)",
                    "severity": "info",
                }
            else:
                 return {
                    "test": "HTTPS Enforcement",
                    "vulnerable": True,
                    "details": "Site accessible via HTTP without redirect to HTTPS",
                    "severity": "critical",
                    "recommendation": "Force redirect all HTTP traffic to HTTPS",
                }
        except Exception as e:
            # If HTTP is unreachable, that's also technically secure (though bad UX)
             return {
                "test": "HTTPS Enforcement",
                "vulnerable": False,
                "details": "HTTP endpoint unreachable",
                "severity": "info",
            }

    except Exception as e:
        return {
            "test": "HTTPS Enforcement",
            "vulnerable": False,
            "details": f"HTTPS check completed: {str(e)}",
            "severity": "info",
        }


def run_basic_scan(url: str) -> Dict[str, Any]:
    """Run a comprehensive security scan with all tests"""
    url = normalize_url(url)
    
    results = {
        "target_url": url,
        "tests": []
    }
    
    # Run all security tests
    tests = [
        check_ssl_certificate,
        check_security_headers,
        check_xss_reflection,
        check_directory_listing,
        check_robots_txt,
        check_cors_policy,
        check_cookie_security,
        check_redirect_validation,
        check_https_enforcement,
    ]
    
    for test_func in tests:
        try:
            result = test_func(url)
            results["tests"].append(result)
        except Exception as e:
            results["tests"].append({
                "test": test_func.__name__,
                "vulnerable": True,
                "details": f"Test failed: {str(e)}",
                "severity": "info",
            })
    
    # Calculate summary with severity weighting
    vulnerability_count = sum(1 for t in results["tests"] if t.get("vulnerable"))
    
    # Weight by severity
    severity_weights = {"critical": 30, "high": 20, "medium": 10, "low": 5, "info": 0}
    risk_score = 0
    for test in results["tests"]:
        if test.get("vulnerable"):
            severity = test.get("severity", "medium")
            risk_score += severity_weights.get(severity, 10)
    
    results["vulnerability_count"] = vulnerability_count
    results["risk_score"] = min(risk_score, 100)  # Cap at 100
    
    return results
