export interface ZKATTPhase {
  phase: 'Attacker Action' | 'Victim Perspective' | 'Consequence' | 'Warning Signs' | 'Prevention Tips';
  content: string;
  details: string[];
}

export interface ZKATTSenario {
  id: string;
  category: string;
  description: string;
  icon: string;
  phases: ZKATTPhase[];
}

export const ZKATT_SCENARIOS: ZKATTSenario[] = [
  {
    id: 'phishing',
    category: 'Phishing Attack',
    description: 'A deceptive email designed to steal login credentials.',
    icon: 'Mail',
    phases: [
      {
        phase: 'Attacker Action',
        content: 'The attacker crafts a pixel-perfect replica of a Microsoft 365 login alert and sends it to 5,000 corporate employees.',
        details: ['Registers "microsoft-security-alert.net"', 'Clones official CSS/Images', 'Bypasses spam filters with legitimate SMTP relay']
      },
      {
        phase: 'Victim Perspective',
        content: 'You receive an email: "Urgent: Your account was accessed from Moscow. Verify your identity immediately."',
        details: ['Sender: Security Team <noreply@microsoft-security-alert.net>', 'Button: "Review Recent Activity"', 'Sense of urgency and fear']
      },
      {
        phase: 'Consequence',
        content: 'After clicking and "Logging in", the attacker captures your plain-text password and MFA session token.',
        details: ['Full mailbox access', 'Installation of a ghost redirect rule', 'Business Email Compromise (BEC) initiated']
      },
      {
        phase: 'Warning Signs',
        content: 'Look closer: The sender domain is not "microsoft.com". The link resolves to a suspicious external IP.',
        details: ['Domain mismatch: alert.net vs .com', 'Hover the link before clicking', 'Generic greeting: "Dear User"']
      },
      {
        phase: 'Prevention Tips',
        content: 'Never click links in urgent identity alerts. Always navigate directly to the official portal.',
        details: ['Enable Hardware Security Keys (U2F)', 'Check the "From" address carefully', 'Report phishing internally immediately']
      }
    ]
  },
  {
    id: 'malware',
    category: 'Malware Infection',
    description: 'A hidden "dropper" that infects systems via an invoice.',
    icon: 'FileWarning',
    phases: [
      {
        phase: 'Attacker Action',
        content: 'The hacker hides a Cobalt Strike beacon inside a macros-enabled Excel document named "Invoice_2024_Q1.xlsm".',
        details: ['Obfuscates VBA code', 'Packaged inside a ZIP to evade AV', 'Targeting Finance Department']
      },
      {
        phase: 'Victim Perspective',
        content: 'An invoice arrives from a known vendor. When opened, it asks: "To view this document, please Enable Content."',
        details: ['Fake "Protected Document" warning', 'Yellow banner at the top', 'Lure: "View $45,000 payment details"']
      },
      {
        phase: 'Consequence',
        content: 'Enabling macros executes a silent PowerShell script that connects back to the attacker\'s Command & Control server.',
        details: ['Keyboard logging active', 'Screenshots being taken', 'Lateral movement to Server Room']
      },
      {
        phase: 'Warning Signs',
        content: 'A vendor invoice should never require "Enabling Content" or Macros to be readable.',
        details: ['Extension was .xlsm (Macro) not .pdf', 'Sudden CPU spike/Terminal flash', 'Suspicious request for system permissions']
      },
      {
        phase: 'Prevention Tips',
        content: 'Disable Office Macros globally. Use sandboxes like Browser Isolation for untrusted files.',
        details: ['Verify invoices via phone call', 'Use Cloud file previewers', 'Keep EDR/Antivirus definitions updated']
      }
    ]
  },
  {
    id: 'financial',
    category: 'Bank/Financial Scam',
    description: 'A social engineering call to "secure" your bank account.',
    icon: 'Wallet',
    phases: [
      {
        phase: 'Attacker Action',
        content: 'The scammer uses VoIP spoofing to make their caller ID show as "HDFC Bank Fraud Dept".',
        details: ['Spoken script using victim\'s full name', 'Fake background office noise', 'Spoofed ID matches real bank number']
      },
      {
        phase: 'Victim Perspective',
        content: '"Sir, there is a suspicious transfer of ₹50,000 on your card. We need to move your funds to a secure wallet."',
        details: ['Extremely urgent and authoritative tone', 'Claims to be a Senior Manager', 'Request for "Security Code" (OTP)']
      },
      {
        phase: 'Consequence',
        content: 'You provide the "Verification Code" which is actually the OTP to authorize a real transfer to the scammer.',
        details: ['Account drained immediately', 'Phone line kept active to block real alerts', 'Funds moved to crypto/money mules']
      },
      {
        phase: 'Warning Signs',
        content: 'Real banks NEVER ask for OTPs or PINs over the phone, and never ask you to move money.',
        details: ['Authoritative pressure tactics', 'Request for sensitive secret codes', 'Urging to act before "the bank shuts down"']
      },
      {
        phase: 'Prevention Tips',
        content: 'If someone claims to be from your bank, hang up and call the official number on your card.',
        details: ['Never share OTPs with anyone', 'Set daily transfer limits', 'Use official Bank Apps for alerts']
      }
    ]
  }
];
