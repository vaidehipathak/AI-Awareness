"""
Django management command to seed interactive games
Run with: python manage.py seed_interactive_games
"""

from django.core.management.base import BaseCommand
from content.models import Game


class Command(BaseCommand):
    help = 'Seeds interactive AI-awareness games'

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding interactive games...")

        # Delete old games of these types if they exist
        Game.objects.filter(game_type__in=['DEEPFAKE_DETECTOR', 'BIAS_SPOTTER', 'PHISHING_SORTER']).delete()

        # 1. Deepfake Detector Game
        Game.objects.create(
            title="Deepfake Detective Challenge",
            game_type='DEEPFAKE_DETECTOR',
            description="Can you spot AI-generated faces? Use clues and zoom to identify deepfakes!",
            is_active=True,
            game_data={
                "rounds": [
                    {
                        "image_a": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
                        "image_b": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
                        "clues": [
                            "Look at the eyes - AI-generated faces often have unnatural reflections",
                            "Check the background - AI struggles with complex backgrounds",
                            "Examine hair details - AI-generated hair can look too perfect or blurry"
                        ],
                        "correct_answer": "b",
                        "explanation": "Image B is AI-generated! Notice the subtle artifacts in the skin texture and background blur pattern typical of AI generation. Image A is a real photo from Unsplash."
                    },
                    {
                        "image_a": "https://randomuser.me/api/portraits/women/44.jpg",
                        "image_b": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
                        "clues": [
                            "AI faces often have perfect symmetry that real faces lack",
                            "Look for artifacts around the ears and hairline",
                            "Check if accessories like earrings look realistic"
                        ],
                        "correct_answer": "a",
                        "explanation": "Image A is AI-generated from RandomUser API! The background and lighting are too perfect, and the facial features show telltale AI smoothing. Image B is a real photo."
                    },
                    {
                        "image_a": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
                        "image_b": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
                        "clues": [
                            "AI struggles with teeth - look for unnatural dental features",
                            "Check for consistent lighting across the face",
                            "Look at the transition between face and background"
                        ],
                        "correct_answer": "b",
                        "explanation": "Image B is AI-generated! Notice the overly processed look and unnatural skin smoothing. Image A is a real photo with natural skin texture."
                    }
                ]
            }
        )

        # 2. AI Bias Spotter Game
        Game.objects.create(
            title="AI Bias Investigation",
            game_type='BIAS_SPOTTER',
            description="Investigate AI decisions and uncover hidden biases in algorithms!",
            is_active=True,
            game_data={
                "scenarios": [
                    {
                        "title": "Hiring Algorithm Audit",
                        "ai_decision": "Rejected 75% of female applicants for engineering roles",
                        "visible_data": [
                            "All applicants had similar qualifications",
                            "Job descriptions were gender-neutral",
                            "Applicants had comparable years of experience"
                        ],
                        "hidden_data": [
                            {"clue": "Training data consisted of 90% male resumes from past 10 years", "is_bias": True},
                            {"clue": "Algorithm weighted 'leadership' keywords heavily", "is_bias": False},
                            {"clue": "Historical hiring data showed male preference", "is_bias": True},
                            {"clue": "Blind resume review process was used", "is_bias": False},
                            {"clue": "Algorithm learned from biased historical decisions", "is_bias": True}
                        ],
                        "bias_type": "Gender bias from historical training data - the AI learned to replicate past discriminatory hiring patterns"
                    },
                    {
                        "title": "Loan Approval System",
                        "ai_decision": "Denied loans to 60% of applicants from certain zip codes",
                        "visible_data": [
                            "Credit scores were similar across all applicants",
                            "Income levels were comparable",
                            "Loan amounts requested were similar"
                        ],
                        "hidden_data": [
                            {"clue": "Zip codes correlated with racial demographics", "is_bias": True},
                            {"clue": "System used debt-to-income ratio", "is_bias": False},
                            {"clue": "Historical default rates varied by location", "is_bias": True},
                            {"clue": "Employment verification was required", "is_bias": False},
                            {"clue": "Redlining patterns from past decades influenced data", "is_bias": True}
                        ],
                        "bias_type": "Racial bias through geographic proxies - using zip codes as a proxy for race, perpetuating historical discrimination"
                    }
                ]
            }
        )

        # 3. Phishing Email Sorter Game
        Game.objects.create(
            title="Phishing Email Sorter",
            game_type='PHISHING_SORTER',
            description="Sort emails as phishing or legitimate under time pressure. Build combos for bonus points!",
            is_active=True,
            game_data={
                "emails": [
                    {
                        "subject": "URGENT: Verify your account immediately",
                        "sender": "security@paypa1-secure.com",
                        "body": "Dear valued customer,\\n\\nYour account has been compromised! Click here NOW to verify your identity or your account will be permanently suspended within 24 hours.\\n\\nClick here: http://paypa1-verify.ru/login\\n\\nPayPal Security Team",
                        "headers": {
                            "from": "suspicious-server.ru",
                            "reply_to": "phisher@gmail.com"
                        },
                        "red_flags": [
                            "Misspelled domain (paypa1 vs paypal)",
                            "Urgent threatening language",
                            "Suspicious server origin (.ru)",
                            "Mismatched reply-to address"
                        ],
                        "is_phishing": True
                    },
                    {
                        "subject": "Your monthly statement is ready",
                        "sender": "statements@chase.com",
                        "body": "Hello,\\n\\nYour Chase credit card statement for December is now available. You can view it by logging into your account at chase.com.\\n\\nThank you for being a valued customer.\\n\\nChase Bank",
                        "headers": {
                            "from": "mail.chase.com",
                            "reply_to": "customerservice@chase.com"
                        },
                        "red_flags": [],
                        "is_phishing": False
                    },
                    {
                        "subject": "You've won $1,000,000!",
                        "sender": "lottery@official-prizes.biz",
                        "body": "CONGRATULATIONS!!!\\n\\nYou have been selected as the winner of our international lottery! To claim your $1,000,000 prize, please send us your bank account details and social security number.\\n\\nACT NOW - offer expires in 48 hours!",
                        "headers": {
                            "from": "sketchy-server.biz",
                            "reply_to": "scammer123@yahoo.com"
                        },
                        "red_flags": [
                            "Too good to be true offer",
                            "Requests sensitive information",
                            "Suspicious domain (.biz)",
                            "Pressure tactics (time limit)"
                        ],
                        "is_phishing": True
                    },
                    {
                        "subject": "Meeting reminder: Team sync tomorrow at 2PM",
                        "sender": "calendar@company.com",
                        "body": "Hi team,\\n\\nThis is a reminder about our weekly team sync tomorrow (Tuesday) at 2:00 PM in Conference Room B.\\n\\nAgenda:\\n- Project updates\\n- Q1 planning\\n- Team announcements\\n\\nSee you there!",
                        "headers": {
                            "from": "mail.company.com",
                            "reply_to": "noreply@company.com"
                        },
                        "red_flags": [],
                        "is_phishing": False
                    },
                    {
                        "subject": "Your package delivery failed",
                        "sender": "deliveries@fedex-tracking.net",
                        "body": "Dear customer,\\n\\nWe attempted to deliver your package but no one was home. Click the link below to reschedule delivery and pay a $3.99 redelivery fee.\\n\\nTracking: http://fedex-track.net/redeliver\\n\\nFedEx Delivery Services",
                        "headers": {
                            "from": "unknown-server.net",
                            "reply_to": "donotreply@gmail.com"
                        },
                        "red_flags": [
                            "Suspicious domain (.net instead of .com)",
                            "Requests payment for redelivery",
                            "Generic greeting",
                            "Mismatched reply-to (gmail)"
                        ],
                        "is_phishing": True
                    },
                    {
                        "subject": "Password reset confirmation",
                        "sender": "security@microsoft.com",
                        "body": "Hello,\\n\\nYour Microsoft account password was successfully reset on Dec 28, 2025 at 3:45 PM EST.\\n\\nIf you did not make this change, please visit account.microsoft.com immediately to secure your account.\\n\\nMicrosoft Account Team",
                        "headers": {
                            "from": "account-security.microsoft.com",
                            "reply_to": "no-reply@microsoft.com"
                        },
                        "red_flags": [],
                        "is_phishing": False
                    },
                    {
                        "subject": "IRS Tax Refund Notification",
                        "sender": "refunds@irs-gov.us",
                        "body": "IMPORTANT TAX NOTICE\\n\\nYou are eligible for a tax refund of $1,847.32. To process your refund, we need you to verify your identity by providing your SSN and bank account information.\\n\\nClick here to claim: http://irs-refund.us/claim\\n\\nInternal Revenue Service",
                        "headers": {
                            "from": "foreign-server.us",
                            "reply_to": "taxrefund@hotmail.com"
                        },
                        "red_flags": [
                            "IRS never emails about refunds",
                            "Requests SSN via email",
                            "Wrong domain (.us instead of .gov)",
                            "Suspicious reply-to (hotmail)"
                        ],
                        "is_phishing": True
                    },
                    {
                        "subject": "Your order #12345 has shipped",
                        "sender": "orders@amazon.com",
                        "body": "Hello,\\n\\nYour order #12345 has shipped and will arrive by Friday, Dec 30.\\n\\nTrack your package: amazon.com/orders\\n\\nItems in this shipment:\\n- Wireless Mouse\\n\\nThank you for shopping with Amazon!",
                        "headers": {
                            "from": "ship-confirm@amazon.com",
                            "reply_to": "no-reply@amazon.com"
                        },
                        "red_flags": [],
                        "is_phishing": False
                    }
                ]
            }
        )

        self.stdout.write(self.style.SUCCESS("✓ Successfully seeded 3 interactive games!"))
        self.stdout.write("  - Deepfake Detective Challenge")
        self.stdout.write("  - AI Bias Investigation")
        self.stdout.write("  - Phishing Email Sorter")
