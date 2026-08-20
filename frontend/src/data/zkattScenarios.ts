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
  },
  {
    id: 'deepfake',
    category: 'Deepfake / CEO Fraud',
    description: 'An AI voice clone of company leadership demanding an emergency transfer.',
    icon: 'Video',
    phases: [
      {
        phase: 'Attacker Action',
        content: 'The attacker scrapes 45 seconds of the CEO speaking on YouTube to train a real-time AI voice cloning model.',
        details: ['Synthesizes realistic background cadence', 'Spoofs internal corporate caller ID', 'Calls the Senior Finance Controller directly']
      },
      {
        phase: 'Victim Perspective',
        content: '"Hi Alex, I am in a confidential board meeting. We need an urgent vendor deposit of ₹15,00,000 before market close."',
        details: ['Voice sounds 100% authentic', 'CEO uses realistic colloquial phrases and nicknames', 'High urgency: "Do not delay this acquisition"']
      },
      {
        phase: 'Consequence',
        content: 'The finance controller bypasses standard multi-sign authorization and executes the wire transfer to an offshore mule account.',
        details: ['Funds laundered through crypto within minutes', 'No clawback possible', 'Substantial financial and reputation loss']
      },
      {
        phase: 'Warning Signs',
        content: 'Requests to bypass standard purchase order or dual-approval workflows over the phone.',
        details: ['Refusal to join video conference or answer verbal code phrases', 'Extreme urgency and pressure', 'Odd timing (e.g. late Friday afternoon)']
      },
      {
        phase: 'Prevention Tips',
        content: 'Enforce strict out-of-band verification and verbal passphrase protocols for any executive financial requests.',
        details: ['Establish secret executive verification codes', 'Mandatory 4-eyes approval on large transfers', 'Employee awareness on AI voice cloning']
      }
    ]
  },
  {
    id: 'ransomware',
    category: 'Ransomware Extortion',
    description: 'Automated cryptolocker encrypting network files and exfiltrating databases.',
    icon: 'ShieldAlert',
    phases: [
      {
        phase: 'Attacker Action',
        content: 'Attackers purchase stolen employee VPN credentials from the dark web and deploy an automated LockBit ransomware script.',
        details: ['Disables local Volume Shadow Copies (backups)', 'Deploys encryption payloads across Active Directory', 'Exfiltrates confidential IP to mega.nz cloud']
      },
      {
        phase: 'Victim Perspective',
        content: 'At 8:00 AM, employees find all desktop files renamed to ".locked" and wallpaper replaced with a ransom countdown timer.',
        details: ['Desktop wallpaper changes to red skull', 'Text file "HOW_TO_DECRYPT_FILES.txt" on every directory', 'Demands $250,000 in Bitcoin within 48 hours']
      },
      {
        phase: 'Consequence',
        content: 'All operational databases and customer records are encrypted; critical enterprise services grind to a complete halt.',
        details: ['Daily operations paralyzed', 'Extortion double-threat: "Pay or we publish customer records"', 'Costly forensic recovery and regulatory fines']
      },
      {
        phase: 'Warning Signs',
        content: 'Suspicious off-hours VPN logins from unexpected geographic regions and spike in network write operations.',
        details: ['Disabled EDR/Antivirus alerts', 'Massive batch file renaming events', 'Unusual PowerShell child processes spawned by wscript']
      },
      {
        phase: 'Prevention Tips',
        content: 'Implement the 3-2-1 backup strategy with immutable offline storage and enforce MFA on all VPN and remote access gates.',
        details: ['Air-gapped immutable cloud backups', 'Enforce Phishing-Resistant MFA (FIDO2)', 'Regular endpoint patch management']
      }
    ]
  },
  {
    id: 'quishing',
    category: 'QR Code Attack (Quishing)',
    description: 'Malicious QR code sticker placed over legitimate payment terminals.',
    icon: 'QrCode',
    phases: [
      {
        phase: 'Attacker Action',
        content: 'The fraudster prints physical adhesive QR code stickers that redirect to a cloned payment phishing portal.',
        details: ['Sticks fake QR directly on parking meters and cafe payment stands', 'URL shortened to mask destination domain', 'Dynamic redirection based on mobile device OS']
      },
      {
        phase: 'Victim Perspective',
        content: 'You scan the QR code to pay for parking. The mobile browser opens what looks like the official municipal payment page.',
        details: ['Prompts for Card Number, Expiry, CVV, and OTP', 'Displays convincing local city council logos', 'Fake "Processing Payment" loading spinner']
      },
      {
        phase: 'Consequence',
        content: 'Your card credentials and live OTP are captured instantly by the attacker\'s relay server, executing fraudulent transactions.',
        details: ['Card used for unauthorized online purchases', 'Victim left with an unpaid parking fine', 'Identity data harvested for credential stuffing']
      },
      {
        phase: 'Warning Signs',
        content: 'A QR code that appears pasted or layered on top of another surface, or opens an unfamiliar URL domain.',
        details: ['Physical sticker peeling or misalignment', 'Browser address bar shows non-standard domain', 'Unusual request for unnecessary personal data']
      },
      {
        phase: 'Prevention Tips',
        content: 'Always check the domain name in your mobile browser before entering any payment details from a scanned QR code.',
        details: ['Use verified mobile apps rather than random QR links', 'Feel physical QR surfaces for stickers before scanning', 'Enable SMS transaction alerts with card lock']
      }
    ]
  }
];
