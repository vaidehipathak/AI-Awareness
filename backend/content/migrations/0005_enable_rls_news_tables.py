# Generated for Supabase RLS compliance

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0004_cachednewsarticle_newsapirequestlog'),
    ]

    operations = [
        migrations.RunSQL(
            sql=[
                'ALTER TABLE "content_cachednewsarticle" ENABLE ROW LEVEL SECURITY;',
                'ALTER TABLE "content_newsapirequestlog" ENABLE ROW LEVEL SECURITY;',
            ],
            reverse_sql=[
                'ALTER TABLE "content_cachednewsarticle" DISABLE ROW LEVEL SECURITY;',
                'ALTER TABLE "content_newsapirequestlog" DISABLE ROW LEVEL SECURITY;',
            ]
        ),
    ]
