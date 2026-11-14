from django.db import migrations, models

class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='SiteSetting',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('contact_phone', models.CharField(default='+91 63740 70342', max_length=30)),
                ('contact_whatsapp', models.CharField(default='+91 63740 70342', max_length=30)),
                ('contact_email', models.EmailField(default='pondytourstravels@gmail.com', max_length=254)),
                ('office_address', models.TextField(default='123 Beach Road, White Town, Pondicherry, 605001, India.')),
                ('announcement_banner_text', models.CharField(blank=True, max_length=255, null=True)),
                ('is_announcement_active', models.BooleanField(default=False)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Site Contact & Announcement Setting',
                'verbose_name_plural': 'Site Contact & Announcement Settings',
            },
        ),
    ]
