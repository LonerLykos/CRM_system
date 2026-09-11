from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('crm', '0006_alter_ordersmodel_email'),
    ]

    operations = [
        migrations.AlterField(
            model_name='ordersmodel',
            name='surname',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
    ]
