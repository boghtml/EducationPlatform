# Generated by Django 5.0.6 on 2024-10-28 09:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('materials', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='materialfile',
            name='file_type',
            field=models.CharField(max_length=100),
        ),
    ]
