# Generated by Django 5.0.6 on 2024-10-28 08:11

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('courses', '0003_course_intro_video_url'),
    ]

    operations = [
        migrations.CreateModel(
            name='Material',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('course', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='materials', to='courses.course')),
            ],
        ),
        migrations.CreateModel(
            name='MaterialFile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file_url', models.URLField()),
                ('file_type', models.CharField(max_length=50)),
                ('file_size', models.PositiveIntegerField()),
                ('uploaded_at', models.DateTimeField(auto_now_add=True)),
                ('material', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='files', to='materials.material')),
            ],
        ),
    ]