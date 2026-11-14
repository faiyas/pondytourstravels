from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('website_cms', '0002_smtpsettings'),
    ]

    operations = [
        migrations.DeleteModel(
            name='SMTPSettings',
        ),
    ]
