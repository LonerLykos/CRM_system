from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('crm', '0005_alter_ordersmodel_phone'),
    ]

    operations = [
        migrations.AlterField(
            model_name='ordersmodel',
            name='email',
            field=models.EmailField(blank=True, max_length=150, null=True),
        ),
    ]
