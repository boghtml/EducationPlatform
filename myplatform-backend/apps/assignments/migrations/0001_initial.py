# Generated by Django 5.0.6 on 2024-10-20 05:54

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('courses', '0003_course_intro_video_url'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Assignment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True)),
                ('due_date', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('course', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='assignments', to='courses.course')),
                ('teacher', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='created_assignments', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='AssignmentFile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file_url', models.URLField(max_length=500)),
                ('file_type', models.CharField(choices=[('pdf', 'PDF'), ('video', 'Video'), ('docx', 'Docx'), ('link', 'Link')], max_length=10)),
                ('file_size', models.PositiveIntegerField()),
                ('is_temp', models.BooleanField(default=True)),
                ('assignment', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='files', to='assignments.assignment')),
            ],
        ),
        migrations.CreateModel(
            name='AssignmentLink',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('link_url', models.URLField(max_length=500)),
                ('description', models.CharField(blank=True, max_length=255)),
                ('assignment', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='links', to='assignments.assignment')),
            ],
        ),
        migrations.CreateModel(
            name='Submission',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('comment', models.TextField(blank=True)),
                ('status', models.CharField(choices=[('assigned', 'Assigned'), ('submitted', 'Submitted'), ('graded', 'Graded'), ('returned', 'Returned')], default='assigned', max_length=10)),
                ('grade', models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True)),
                ('feedback', models.TextField(blank=True)),
                ('submission_date', models.DateTimeField(auto_now_add=True)),
                ('returned_at', models.DateTimeField(blank=True, null=True)),
                ('assignment', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='submissions', to='assignments.assignment')),
                ('student', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='submissions', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('student', 'assignment')},
            },
        ),
        migrations.CreateModel(
            name='SubmissionFile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file_url', models.URLField(max_length=500)),
                ('file_type', models.CharField(choices=[('pdf', 'PDF'), ('video', 'Video'), ('docx', 'Docx'), ('link', 'Link')], max_length=10)),
                ('file_size', models.PositiveIntegerField()),
                ('submission', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='files', to='assignments.submission')),
            ],
        ),
    ]