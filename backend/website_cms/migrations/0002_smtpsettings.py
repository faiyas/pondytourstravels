from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('website_cms', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='SMTPSettings',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_active', models.BooleanField(default=True, help_text='Enable automated email dispatch')),
                ('smtp_host', models.CharField(default='smtp.gmail.com', max_length=255)),
                ('smtp_port', models.IntegerField(default=587)),
                ('smtp_user', models.CharField(blank=True, help_text='Sender Email / SMTP Username', max_length=255, null=True)),
                ('smtp_password', models.CharField(blank=True, help_text='App Password', max_length=255, null=True)),
                ('use_tls', models.BooleanField(default=True)),
                ('use_ssl', models.BooleanField(default=False)),
                ('from_name', models.CharField(default='Pondy Tours & Travels', max_length=150)),
                ('from_email', models.CharField(default='pondytourstravels@gmail.com', max_length=255)),
                ('admin_notification_email', models.EmailField(default='pondytourstravels@gmail.com', help_text='Receiver email where admin receives new enquiry alerts', max_length=254)),
                ('notify_admin_on_new_enquiry', models.BooleanField(default=True)),
                ('notify_customer_on_confirmed', models.BooleanField(default=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'SMTP & Email Configuration',
                'verbose_name_plural': 'SMTP & Email Configurations',
            },
        ),
    ]

