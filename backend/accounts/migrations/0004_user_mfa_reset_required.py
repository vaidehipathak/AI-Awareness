from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0003_passwordresettoken'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='mfa_reset_required',
            field=models.BooleanField(default=False, help_text='If true, user must re-enroll MFA on next login; set when admin resets MFA.'),
        ),
    ]
