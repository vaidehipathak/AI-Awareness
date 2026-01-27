import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from scanner.models import SecurityScan
from accounts.models import User

print(f"Total Scans: {SecurityScan.objects.count()}")
print(f"Anonymous Scans (user=None): {SecurityScan.objects.filter(user__isnull=True).count()}")
print(f"Authenticated Scans (user!=None): {SecurityScan.objects.filter(user__isnull=False).count()}")

print("\n--- User Breakdown ---")
for user in User.objects.all():
    count = SecurityScan.objects.filter(user=user).count()
    if count > 0:
        print(f"User: {user.email} (ID: {user.id}) - Scans: {count}")
