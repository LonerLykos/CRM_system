from django.db import migrations

CASE_SENSITIVE = ('CHARACTER SET utf8mb4', 'COLLATE utf8mb4_bin')


def _modify_name_column(schema_editor, collation=()):
    if schema_editor.connection.vendor != 'mysql':
        return
    table = schema_editor.quote_name('groups')
    column = schema_editor.quote_name('name')
    schema_editor.execute(
        ' '.join(['ALTER TABLE', table, 'MODIFY', column, 'VARCHAR(100)', *collation, 'NOT NULL'])
    )


def make_case_sensitive(apps, schema_editor):
    _modify_name_column(schema_editor, CASE_SENSITIVE)


def restore_default_collation(apps, schema_editor):
    _modify_name_column(schema_editor)


class Migration(migrations.Migration):

    dependencies = [
        ('crm', '0007_alter_ordersmodel_surname'),
    ]

    operations = [
        migrations.RunPython(make_case_sensitive, restore_default_collation),
    ]
