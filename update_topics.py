import re

file_path = r"c:\Users\pooja\OneDrive\Desktop\AI-Awareness\frontend\src\pages\AwarenessHub.tsx"
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = [
    (
        r'title: "Signals of misuse",\s*summary: "[^"]*",\s*points: \[\s*\{[^\}]*\},\s*\{[^\}]*\},\s*\{[^\}]*\}\s*\]',
        '''title: "Signals of misuse",
          summary: "High-volume, repetitive, or adversarial prompts often signal scraping or abuse attempts.",
          points: [
            { title: "Volume anomalies", detail: "Spikes from a single key or IP are high-risk indicators of automated abuse or scraping.\\n\\n• Monitor for unusually high request volumes over short periods\\n• Implement dynamic rate limiting that scales with suspicious activity\\n• Alert administrators when usage thresholds are dramatically exceeded" },
            { title: "Repeated probes", detail: "Similar prompts aiming to bypass filters are red flags indicating adversarial probing.\\n\\n• Track repetitive patterns of blocked requests\\n• Implement cumulative penalties for repeated policy violations\\n• Use anomaly detection to spot subtle prompt injection attempts" },
            { title: "Mitigations", detail: "Employing multiple layers of friction can significantly deter both automated bots and attackers.\\n\\n• Deploy CAPTCHAs for suspicious or high-velocity traffic\\n• Maintain dynamic blocklists for known malicious IP addresses\\n• Require re-authentication for sensitive actions when anomalies are detected" }
          ]'''
    ),
    (
        r'title: "When to keep a human in the loop",\s*summary: "[^"]*",\s*points: \[\s*\{[^\}]*\},\s*\{[^\}]*\},\s*\{[^\}]*\}\s*\]',
        '''title: "When to keep a human in the loop",
          summary: "High-stakes tasks (sending, publishing, deleting) benefit from human oversight.",
          points: [
            { title: "Critical scope", detail: "High-impact actions that affect external users or core systems should never be fully automated without human oversight.\\n\\n• Require manual approval before sending mass communications\\n• Establish review gates for automated code deployments\\n• Ensure financial transactions trigger a human verification step" },
            { title: "Context gaps", detail: "AI models operate purely on data and lack human intuition to understand complex cultural, emotional, or strategic nuances.\\n\\n• Have humans review AI decisions in highly sensitive contexts\\n• Establish feedback loops where human reviewers correct model errors\\n• Use AI to suggest actions, but let humans make the final call" },
            { title: "Clear UX", detail: "Transparency in the user interface helps manage expectations and builds trust in AI-assisted processes.\\n\\n• Clearly label system actions that are pending human review\\n• Provide estimated review times for automated requests\\n• Explain the specific safety reasons behind the required approval" }
          ]'''
    ),
    (
        r'title: "Common bias signals",\s*summary: "[^"]*",\s*points: \[\s*\{[^\}]*\},\s*\{[^\}]*\},\s*\{[^\}]*\}\s*\]',
        '''title: "Common bias signals",
          summary: "Underrepresented groups or missing scenarios create skewed predictions.",
          points: [
            { title: "Representation", detail: "A large dataset is not necessarily a diverse one; over-representation of certain groups can skew the model's understanding.\\n\\n• Audit datasets to ensure balanced representation across all demographics\\n• Define minimum threshold counts for minority classes before training\\n• Use stratified sampling techniques to correct severe imbalances" },
            { title: "Label quality", detail: "Labeling errors disproportionately affect smaller groups because the model has fewer examples to learn from.\\n\\n• Implement multi-annotator consensus for data regarding minority groups\\n• Regularly audit labels for cultural or historical biases\\n• Provide clear, objective guidelines to human annotators" },
            { title: "Context", detail: "Models trained heavily on data from one geographic or cultural context often fail when deployed globally.\\n\\n• Test model performance across diverse geographic slices\\n• Localize training data to reflect the target deployment region\\n• Avoid assuming that behavioral patterns are universal" }
          ]'''
    ),
    (
        r'title: "Metrics that matter",\s*summary: "[^"]*",\s*points: \[\s*\{[^\}]*\},\s*\{[^\}]*\},\s*\{[^\}]*\}\s*\]',
        '''title: "Metrics that matter",
          summary: "Accuracy can hide disparities—use precision/recall per group.",
          points: [
            { title: "Slice metrics", detail: "Aggregated performance scores can obscure critical failures affecting specific subgroups within your user base.\\n\\n• Break down accuracy, precision, and recall by demographic slices\\n• Establish minimum acceptable performance thresholds for all groups\\n• Report systematically on performance disparities between subgroups" },
            { title: "Thresholds", detail: "A single global decision boundary may result in unequal outcomes; localized adjustments can improve fairness.\\n\\n• Optimize probability thresholds independently for different subgroups\\n• Focus on equalizing false positive rates across critical demographics\\n• Document the ethical reasoning behind any threshold adjustments" },
            { title: "Re-check", detail: "Fairness is not a one-time achievement; continuous monitoring is required as both models and user behavior evolve.\\n\\n• Automate fairness regression tests in your CI/CD pipeline\\n• Trigger re-evaluation whenever training data is significantly updated\\n• Establish alerting based on unexpected drift in fairness metrics" }
          ]'''
    ),
    (
        r'title: "Prompting for fairness",\s*summary: "[^"]*",\s*points: \[\s*\{[^\}]*\},\s*\{[^\}]*\},\s*\{[^\}]*\}\s*\]',
        '''title: "Prompting for fairness",
          summary: "Explicitly ask for neutral, respectful language and balanced examples.",
          points: [
            { title: "Avoid leading cues", detail: "Explicitly or implicitly embedding demographic assumptions into prompts can force the model to generate stereotypical content.\\n\\n• Structure prompts to focus on skills and roles rather than identity\\n• Remove unnecessary demographic markers from system instructions\\n• Test prompts against known bias benchmarks before deployment" },
            { title: "Add balance", detail: "Intentionally requesting diverse viewpoints helps counteract the model’s natural tendency to output the most statistically common narrative.\\n\\n• Ask models to provide multiple distinct approaches to a problem\\n• Prompt for counter-arguments to ensure a balanced response\\n• Specify that examples should cover a range of cultures and backgrounds" },
            { title: "Review outputs", detail: "Even carefully crafted prompts can yield biased results, necessitating continuous human evaluation of the outputs.\\n\\n• Implement routine audits of AI-generated content for subtle bias\\n• Create a standardized rubric for evaluating prompt fairness\\n• Adjust system instructions based on output quality reviews" }
          ]'''
    ),
    (
        r'title: "Common tells",\s*summary: "[^"]*",\s*points: \[\s*\{[^\}]*\},\s*\{[^\}]*\},\s*\{[^\}]*\}\s*\]',
        '''title: "Common tells",
          summary: "Lighting glitches, odd blinks, and mismatched shadows often reveal synthetic media.",
          points: [
            { title: "Edges & lighting", detail: "Inconsistencies in lighting and blending around the edges of a subject often reveal synthetic manipulation.\\n\\n• Look for unnatural haloing or blurriness around the subject's silhouette\\n• Check if the shadows cast misalign with the apparent light sources\\n• Pay attention to artifacts around hair, glasses, and jewelry" },
            { title: "Audio sync", detail: "Deepfake audio often struggles to perfectly synchronize with the subtle muscle movements of a speaker's mouth.\\n\\n• Watch closely for mouth shapes that lag behind or precede the spoken words\\n• Notice if the emotional tone of the voice mismatches the facial expression\\n• Listen for unnatural cadence, robotic phrasing, or missing breaths" },
            { title: "Source check", detail: "Verifying the origin of a media piece is often faster and more reliable than forensic analysis of the content itself.\\n\\n• Confirm if the original publisher is a known, reputable source\\n• Check the creation metadata and upload dates where available\\n• Cross-reference claims in the media with established news outlets" }
          ]'''
    ),
    (
        r'title: "Quick verification steps",\s*summary: "[^"]*",\s*points: \[\s*\{[^\}]*\},\s*\{[^\}]*\},\s*\{[^\}]*\}\s*\]',
        '''title: "Quick verification steps",
          summary: "Reverse searches and official statements help confirm authenticity.",
          points: [
            { title: "Reverse search", detail: "Taking a moment to research an image or video can quickly reveal if it has been taken out of context.\\n\\n• Use reverse image search tools to find earlier instances of the media\\n• Check if the image has been debunked on fact-checking websites\\n• Examine the context surrounding the original, earliest upload" },
            { title: "Date check", detail: "Recycling old footage and claiming it represents a current event is a prevalent and effective misinformation tactic.\\n\\n• Verify the visual clues in the video (e.g., weather, seasons, construction)\\n• Look for anachronisms that contradict the claimed timeline\\n• Use metadata analysis tools to check for creation timestamps" },
            { title: "Trusted sources", detail: "Before amplifying shocking content, corroborate the story with established journalistic organizations.\\n\\n• Cross-check urgent claims with at least two reputable news outlets\\n• Look for official statements from the organizations or individuals involved\\n• Be wary of information available exclusively on anonymous social media accounts" }
          ]'''
    ),
    (
        r'title: "Prevent impersonation",\s*summary: "[^"]*",\s*points: \[\s*\{[^\}]*\},\s*\{[^\}]*\},\s*\{[^\}]*\}\s*\]',
        '''title: "Prevent impersonation",
          summary: "Voice alone is weak authentication. Add shared secrets or callback steps.",
          points: [
            { title: "No voice-only approvals", detail: "Voice synthesis technology is highly accessible, meaning voice alone is no longer a reliable biometric identifier.\\n\\n• Require written or in-app confirmation for all financial transactions\\n• Mandate multi-factor authentication (MFA) for accessing sensitive data\\n• Never authorize password resets based solely on a phone call" },
            { title: "Safe words", detail: "Establishing shared secrets ahead of time provides a low-tech, highly effective defense against impersonation.\\n\\n• Agree on verification phrases or challenges for urgent requests\\n• Ensure the safe word is known only to the necessary parties\\n• Periodically rotate the chosen safe word, especially after incidents" },
            { title: "Educate teams", detail: "Awareness is the first line of defense; teams must know that high-quality voice cloning is actively used by attackers.\\n\\n• Conduct regular training on spotting AI-enabled social engineering\\n• Run simulated vishing (voice phishing) campaigns to test readiness\\n• Establish a clear, blame-free reporting process for suspected scams" }
          ]'''
    ),
    (
        r'title: "Handle PII carefully",\s*summary: "[^"]*",\s*points: \[\s*\{[^\}]*\},\s*\{[^\}]*\},\s*\{[^\}]*\}\s*\]',
        '''title: "Handle PII carefully",
          summary: "Names, emails, IDs, and biometrics need protection in transit and at rest.",
          points: [
            { title: "Mask early", detail: "Replacing Sensitive Information with tokens or redactions before it leaves the origin system prevents accidental exposure downstream.\\n\\n• Replace PII with tokens before making external model calls\\n• Implement automated redaction pipelines at data entry points\\n• Ensure masked data retains enough structure for analytical tasks" },
            { title: "Access control", detail: "Limiting access to raw PII strictly to authorized personnel reduces the risk of insider threats and lateral movement.\\n\\n• Enforce the principle of least privilege across all databases\\n• Implement role-based access control (RBAC) tied to job functions\\n• Require justification and temporary access for viewing raw data" },
            { title: "Retention", detail: "Data that no longer exists cannot be breached; aggressive deletion timelines minimize liability and compliance risks.\\n\\n• Set automated expiration dates for records containing PII\\n• Delete sensitive data immediately when its primary purpose is fulfilled\\n• Regularly audit storage volumes to ensure retention policies are followed" }
          ]'''
    ),
    (
        r'title: "Less is safer",\s*summary: "[^"]*",\s*points: \[\s*\{[^\}]*\},\s*\{[^\}]*\},\s*\{[^\}]*\}\s*\]',
        '''title: "Less is safer",
          summary: "Storing extra sensitive data increases breach impact and compliance risk.",
          points: [
            { title: "Purpose first", detail: "Collecting data 'just in case' expands the attack surface; every piece of PII must have a legally and practically justified purpose.\\n\\n• Tie every collected field directly to a documented business process\\n• Regularly review forms to eliminate unnecessary data requests\\n• Default to anonymized metrics rather than identifiable user data" },
            { title: "Short retention", detail: "Holding onto data indefinitely increases the fallout of a breach and complicates compliance with privacy regulations.\\n\\n• Enforce strict deletion policies based on data categories\\n• Automate the archiving and purging of inactive user accounts\\n• Implement secure deletion protocols to prevent data recovery" },
            { title: "User consent", detail: "Transparent data practices build user trust and ensure adherence to frameworks like GDPR and CCPA.\\n\\n• Clearly explain why specific data points are being requested\\n• Make consent granular, allowing users to opt into specific scopes\\n• Provide easy-to-use mechanisms for users to revoke consent and delete their data" }
          ]'''
    ),
    (
        r'title: "Transport matters",\s*summary: "[^"]*",\s*points: \[\s*\{[^\}]*\},\s*\{[^\}]*\},\s*\{[^\}]*\}\s*\]',
        '''title: "Transport matters",
          summary: "HTTPS, VPNs, and access controls keep data safer in transit.",
          points: [
            { title: "Channel choice", detail: "Standard communication tools are often insecure and leave permanent trails; raw PII requires specialized handling.\\n\\n• Strictly avoid sending PII via unencrypted email or public chat channels\\n• Use end-to-end encrypted file transfer services for sensitive documents\\n• Never log raw PII into centralized, easily accessible observability tools" },
            { title: "Access scope", detail: "When sharing data, restricting what recipients can do with it prevents unauthorized downstream redistribution.\\n\\n• Send view-only links rather than downloadable file attachments\\n• Limit the duration of access, expiring links automatically\\n• Restrict the ability to copy, print, or export sensitive documents" },
            { title: "Audit", detail: "Maintaining detailed logs of data sharing establishes accountability and facilitates rapid incident response.\\n\\n• Log the identity of users who access, modify, or download sensitive files\\n• Track the time, location, and device used for PII access\\n• Configure alerts for anomalous access patterns, such as mass downloads" }
          ]'''
    ),
    (
        r'title: "Use assistants safely",\s*summary: "[^"]*",\s*points: \[\s*\{[^\}]*\},\s*\{[^\}]*\},\s*\{[^\}]*\}\s*\]',
        '''title: "Use assistants safely",
          summary: "Convenience is high; so is the chance of misfires—keep confirmations on.",
          points: [
            { title: "Check summaries", detail: "Smart assistants often misinterpret intent; verifying their understanding prevents executing unwanted actions.\\n\\n• Always have the assistant repeat back complex or sensitive commands\\n• Ensure visual confirmation is required on a screen for high-stakes actions\\n• Review the history log periodically to catch transcription errors" },
            { title: "Mute when private", detail: "Always-listening devices pose ambient recording risks, potentially capturing sensitive conversations or audio.\\n\\n• Utilize physical mute toggles during confidential meetings or discussions\\n• Disconnect devices located in highly secure or private areas\\n• Regularly review and delete saved voice recordings from the provider's server" },
            { title: "Permissions", detail: "Over-permissioned assistants can become vectors for data exposure or unauthorized remote actions.\\n\\n• Strictly limit what apps and services the assistant is allowed to control\\n• Revoke the ability of the assistant to read personal emails or messages\\n• Disable 'drop-in' or automatic answering features to maintain privacy" }
          ]'''
    ),
    (
        r'title: "Control your feed",\s*summary: "[^"]*",\s*points: \[\s*\{[^\}]*\},\s*\{[^\}]*\},\s*\{[^\}]*\}\s*\]',
        '''title: "Control your feed",
          summary: "Feedback, blocking, and resets improve recommendation quality.",
          points: [
            { title: "Downvote noise", detail: "Recommendation algorithms learn from engagement; actively signaling what you dislike helps retrain the feed away from low-quality content.\\n\\n• Consistently use the 'not interested' or 'hide' features on irrelevant posts\\n• Avoid hate-watching, as negative engagement still signals interest to algorithms\\n• Block accounts that consistently produce inflammatory or low-value content" },
            { title: "Reset", detail: "When a feed becomes too polarized or hyper-fixated on past interests, clearing historical signals provides a clean slate.\\n\\n• Periodically clear watch histories and search logs on major platforms\\n• Use 'reset feed' options if available in your application settings\\n• Regularly review and purge inferred interests from ad preference dashboards" },
            { title: "Time limits", detail: "Infinite scrolls are designed to exploit psychological vulnerabilities; setting boundaries preserves attention and mental well-being.\\n\\n• Enforce daily app timers to break the endless scrolling loop\\n• Utilize 'focus mode' features to block distracting algorithmic feeds during work\\n• Be mindful of engaging when emotionally vulnerable, as feeds may amplify negativity" }
          ]'''
    ),
    (
        r'title: "Co-pilot, not autopilot",\s*summary: "[^"]*",\s*points: \[\s*\{[^\}]*\},\s*\{[^\}]*\},\s*\{[^\}]*\}\s*\]',
        '''title: "Co-pilot, not autopilot",
          summary: "Use AI to draft, then apply human judgment for correctness and tone.",
          points: [
            { title: "Fact-check", detail: "Large Language Models are prone to hallucinating plausible-sounding but entirely fictitious information and statistics.\\n\\n• Always independently verify specific claims, quotes, and numbers\\n• Cross-reference legal or medical advice with qualified professionals\\n• Never attribute AI-generated facts in professional communication without a source" },
            { title: "Tone check", detail: "AI often adopts a repetitive, overly formal, or subtly inappropriate tone that can alienate your intended audience.\\n\\n• Edit AI drafts aggressively to match your natural voice and company style\\n• Ensure the response demonstrates appropriate empathy when handling sensitive topics\\n• Watch out for repetitive phrasing and overly complex vocabulary" },
            { title: "Sensitive info", detail: "Pasting confidential data into public AI tools can result in proprietary information being leaked or used for training.\\n\\n• Never paste customer PII, trade secrets, or unreleased code into public LLMs\\n• Use approved, enterprise-tier AI solutions that guarantee data non-retention\\n• Anonymize documents by replacing names and project codenames before summarizing" }
          ]'''
    ),
    (
        r'title: "Augment, don’t replace",\s*summary: "[^"]*",\s*points: \[\s*\{[^\}]*\},\s*\{[^\}]*\},\s*\{[^\}]*\}\s*\]',
        '''title: "Augment, don’t replace",
          summary: "AI helps summarize and rank alerts; humans decide containment.",
          points: [
            { title: "Summaries", detail: "Security logs are overwhelmingly noisy; AI excels at condensing hundreds of discrete events into a coherent narrative.\\n\\n• Use AI to automatically summarize the context of complex security alerts\\n• Generate plain-language briefs explaining the likely impact of an indicator\\n• Use models to translate dense error codes into actionable investigative steps" },
            { title: "Cluster", detail: "Grouping related alerts reduces analyst fatigue and exposes broader, coordinated attack campaigns.\\n\\n• Employ ML clustering techniques to group disparate alerts by related entities\\n• Correlate seemingly unrelated anomalies that occur within similar time windows\\n• Use AI to identify patterns that match known advanced persistent threat (APT) tactics" },
            { title: "Human decision", detail: "Containment actions, such as isolating servers or locking accounts, carry business impact and require human judgment.\\n\\n• Never allow AI to automatically block critical infrastructure IP addresses\\n• Keep security analysts as the final approvers on all active containment actions\\n• Clearly separate AI-driven detection systems from automated remediation scripts" }
          ]'''
    ),
    (
        r'title: "Faster reviews",\s*summary: "[^"]*",\s*points: \[\s*\{[^\}]*\},\s*\{[^\}]*\},\s*\{[^\}]*\}\s*\]',
        '''title: "Faster reviews",
          summary: "AI spots suspicious language, mismatched domains, and urgent requests.",
          points: [
            { title: "URL checks", detail: "Phishing campaigns often use subtle typosquats; models can flag minor deviations from trusted domains.\\n\\n• Use AI to detect visually similar homoglyph attacks in URLs\\n• Flag newly registered domains mimicking internal corporate infrastructure\\n• Automatically analyze the destination of obfuscated or shortened links" },
            { title: "Tone analysis", detail: "Social engineering heavily relies on creating a sense of urgency or fear; AI is highly effective at detecting these linguistic patterns.\\n\\n• Flag emails demanding urgent financial action or strict confidentiality\\n• Detect coercive language patterns typical in business email compromise (BEC)\\n• Warn users when the tone profile of an email mismatches the supposed sender" },
            { title: "Containment", detail: "AI can rapidly identify potential threats, allowing security teams to quickly quarantine suspect communications before users interact.\\n\\n• Use AI detection confidence to automatically route risky emails to quarantine\\n• Require human verification before executing tenant-wide message purges\\n• Monitor for false positives to avoid blocking legitimate time-sensitive business" }
          ]'''
    ),
    (
        r'title: "Better communication",\s*summary: "[^"]*",\s*points: \[\s*\{[^\}]*\},\s*\{[^\}]*\},\s*\{[^\}]*\}\s*\]',
        '''title: "Better communication",
          summary: "Consistent briefs help leadership decide; accuracy still needs humans.",
          points: [
            { title: "Standard fields", detail: "Consistent communication ensures all stakeholders rapidly understand the severity and status of an ongoing incident.\\n\\n• Use AI to automatically extract impact, scope, and timeline from analyst notes\\n• Standardize the format of executive summaries for rapid consumption\\n• Clearly demarcate confirmed facts from ongoing investigations or hypotheses" },
            { title: "Source links", detail: "An AI summary is only as good as its verifiability; linking to primary sources establishes trust and aids deep dives.\\n\\n• Require the AI to cite the specific log entries or alerts used to generate the brief\\n• Include direct links to relevant dashboards and communication channels\\n• Embed specific hashes and IOCs rather than generic descriptions" },
            { title: "Human review", detail: "AI may misinterpret technical nuances or hallucinate details, which can cause panic or misdirect response efforts.\\n\\n• Mandate a senior analyst review of the brief prior to leadership distribution\\n• Double-check timelines constructed by AI for chronological accuracy\\n• Ensure the proposed severity level accurately reflects the business context" }
          ]'''
    ),
    (
        r'title: "Set expectations",\s*summary: "[^"]*",\s*points: \[\s*\{[^\}]*\},\s*\{[^\}]*\},\s*\{[^\}]*\}\s*\]',
        '''title: "Set expectations",
          summary: "Disclosures build trust and reduce misuse by clarifying capabilities.",
          points: [
            { title: "Label AI", detail: "Users must be informed when they are interacting with an AI system or consuming AI-generated media to maintain critical trust.\\n\\n• Apply distinct, unavoidable watermarks or labels to synthetic text and images\\n• Introduce chatbots clearly as AI assistants rather than human agents\\n• Provide users with an easy way to switch to a human operator if available" },
            { title: "Limits", detail: "Overestimating an AI’s capabilities leads to dangerous reliance; clearly demarcating where the system struggles is essential.\\n\\n• Explicitly state in the UI that the system may confidently output incorrect facts\\n• Clarify the date cutoff for the model's training data to prevent temporal errors\\n• Advise users that the AI is not a substitute for professional legal or medical counsel" },
            { title: "Verification", detail: "Encouraging a 'trust but verify' mindset protects both the user and the deploying organization from the fallout of hallucinations.\\n\\n• Prompt users to independently verify critical numbers or citations generated\\n• Build UI affordances (like hover-states) that show the sources behind AI claims\\n• Provide immediate feedback mechanisms for users to report incorrect outputs" }
          ]'''
    ),
    (
        r'title: "Who is responsible\?",\s*summary: "[^"]*",\s*points: \[\s*\{[^\}]*\},\s*\{[^\}]*\},\s*\{[^\}]*\}\s*\]',
        '''title: "Who is responsible?",
          summary: "Clear ownership avoids blame shifting and ensures fixes happen.",
          points: [
            { title: "Define owners", detail: "When a system fails, lack of clear ownership results in delayed remediation and organizational blame-shifting.\\n\\n• Assign specific teams to be accountable for the performance of distinct AI workflows\\n• Ensure ownership covers both technical uptime and the ethical quality of outputs\\n• Document the final accountable executive for high-impact AI systems" },
            { title: "Escalation", detail: "AI systems will inevitably encounter edge cases or policy conflicts; a clear path to human resolution is mandatory.\\n\\n• Establish clear SLAs for human review when the AI flags a high-risk request\\n• Provide users with an accessible appeals process for automated decisions\\n• Define procedures for when to fully disable the AI in favor of manual processing" },
            { title: "Review loops", detail: "Continuous oversight identifies creeping biases and degrading performance before they cause significant harm.\\n\\n• Schedule routine audits of randomly sampled AI-driven decisions and interactions\\n• Incorporate diverse perspectives into the committees reviewing AI performance\\n• Mandate post-mortems for any AI interactions that resulted in user harm or complaints" }
          ]'''
    ),
    (
        r'title: "Use policy",\s*summary: "[^"]*",\s*points: \[\s*\{[^\}]*\},\s*\{[^\}]*\},\s*\{[^\}]*\}\s*\]',
        '''title: "Use policy",
          summary: "Clear acceptable-use policies guide users and simplify enforcement.",
          points: [
            { title: "List disallowed", detail: "An explicit list of prohibited use cases provides a firm foundation for moderation and protects the system from abuse.\\n\\n• Explicitly ban generating malware, hate speech, or non-consensual explicit material\\n• Restrict the AI from providing decisive advice in heavily regulated domains (e.g., medical, financial)\\n• Document these prohibited uses comprehensively in the Terms of Service" },
            { title: "Communicate", detail: "Tucking policies away in lengthy legal documents leads to unintentional violations; policies must be visible within the workflow.\\n\\n• Display concise usage guidelines directly on the primary interface\\n• Present contextual warnings when a user prompts in a bordering sensitive area\\n• Provide clear, plain-language explanations when a request is blocked" },
            { title: "Enforce", detail: "A policy without enforcement is useless; security controls must technically prevent what the guidelines forbid.\\n\\n• Implement robust input and output filters tuned precisely to the disallowed checklist\\n• Automate account suspension or rate limiting for users who repeatedly violate policies\\n• Regularly update the enforcement rules to counter novel prompt injection techniques" }
          ]'''
    ),
    (
        r'title: "Trust but verify",\s*summary: "[^"]*",\s*points: \[\s*\{[^\}]*\},\s*\{[^\}]*\},\s*\{[^\}]*\}\s*\]',
        '''title: "Trust but verify",
          summary: "Unusual requests, even from familiar voices, need second-channel verification.",
          points: [
            { title: "Unexpected asks", detail: "Social engineering relies on disruption; an anomalous request is the primary indicator of an impersonation attempt.\\n\\n• Treat requests that bypass standard operational procedures as highly suspicious\\n• Scrutinize sudden changes to payment details, even from known contacts\\n• Pause and reassess if a contact uncharacteristically demands secrecy or bypasses rules" },
            { title: "Known channels", detail: "Attackers control the medium they initiate; breaking that control is the best way to verify authenticity.\\n\\n• Hang up and call the person back using an internally directory-listed phone number\\n• Verify email requests by contacting the sender through an established chat platform\\n• Never use contact numbers or links provided within the suspicious message itself" },
            { title: "No secrets", detail: "Multi-factor codes are the final barrier against account takeover and should never be communicated to another human.\\n\\n• Understand that legitimate support staff will never ask for your MFA code or password\\n• Never type MFA codes into a chat window or read them aloud over the phone\\n• Report immediately if you are pressured to relay a 2FA code to a 'colleague'" }
          ]'''
    ),
    (
        r'title: "Pause on pressure",\s*summary: "[^"]*",\s*points: \[\s*\{[^\}]*\},\s*\{[^\}]*\},\s*\{[^\}]*\}\s*\]',
        '''title: "Pause on pressure",
          summary: "Time pressure is a warning sign—use checklists and second approvals.",
          points: [
            { title: "Timeout", detail: "Scammers artificially compress timelines to trigger panic and prevent logical assessment of the situation.\\n\\n• Step away from the request for a few minutes to evaluate it objectively\\n• Recognize deadlines like 'within the hour' or 'immediate wire' as massive red flags\\n• Remember that internal emergencies rarely require bypassing all security protocols" },
            { title: "Two-person rule", detail: "Requiring a separate, independent individual to authorize an action drastically reduces the success rate of social engineering.\\n\\n• Implement mandatory secondary approvals for all fund transfers over a specific amount\\n• Require cross-departmental verification for changes to critical vendor banking info\\n• Encourage a culture where employees feel supported in seeking a second opinion" },
            { title: "Document", detail: "Keeping records of anomalous interactions aids in post-incident analysis and helps protect others from similar attacks.\\n\\n• Log the exact nature of the unusual request, including timestamp and method\\n• Capture screenshots of suspicious chats or emails before reporting them\\n• Submit the recorded details directly to the internal security or IT team for review" }
          ]'''
    ),
    (
        r'title: "Keep secrets safe",\s*summary: "[^"]*",\s*points: \[\s*\{[^\}]*\},\s*\{[^\}]*\},\s*\{[^\}]*\}\s*\]',
        '''title: "Keep secrets safe",
          summary: "Passwords, codes, and payment details belong only in verified systems.",
          points: [
            { title: "No sharing", detail: "The core principle of credential safety is absolute restriction: your passwords and MFA codes are yours alone.\\n\\n• Never share login credentials with IT, contractors, or management under any circumstances\\n• Treat requests for access tokens or single sign-on (SSO) cookies as hostile\\n• Avoid using shared team accounts for accessing sensitive or privileged infrastructure" },
            { title: "Official forms", detail: "Phishing attacks simulate legitimate infrastructure; ensuring you are on the correct, verified system is critical.\\n\\n• Navigate to services via bookmarks or manual typing rather than clicking emailed links\\n• Scrutinize the URL bar for typosquats or missing HTTPS indicators before logging in\\n• Beware of embedded login forms within documents or unexpected third-party pages" },
            { title: "Report quickly", detail: "The window for an attacker to act is small; reporting a mistake rapidly can often prevent serious damage.\\n\\n• Inform the security team immediately if you suspect you entered credentials on a fake site\\n• Initiate an immediate password reset on the compromised account and related systems\\n• Do not fear disciplinary action; speed of reporting is critical to containment" }
          ]'''
    )
]

for old_pattern, new_content in replacements:
    content, count = re.subn(old_pattern, new_content, content, count=1)
    if count == 0:
        print(f"Warning: pattern not found: {old_pattern}")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
