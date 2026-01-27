import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from scanner.models import SecurityScan
from accounts.models import User

# Configuration
USER_EMAIL = "om.mehta24@sakec.ac.in"

try:
    user = User.objects.get(email=USER_EMAIL)
    print(f"Found target user: {user.email} (ID: {user.id})")
    
    # Update anonymous scans
    updated_count = SecurityScan.objects.filter(user__isnull=True).update(user=user)
    
    print(f"✅ Successfully assigned {updated_count} anonymous scans to {user.email}")
    print("Run 'python manage.py runserver' again to see them on the dashboard!")

except User.DoesNotExist:
    print(f"❌ User with email {USER_EMAIL} not found!")
except Exception as e:
    print(f"❌ Error: {e}")
