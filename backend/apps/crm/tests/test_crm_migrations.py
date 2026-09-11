"""
Tests for migration 0008 (case-sensitive groups.name).

The migration only acts on MySQL, while the suite runs on SQLite, so the MySQL
branch is checked against a stub schema editor: the exact SQL matters there
(GROUPS is a reserved word in MySQL 8 and must be quoted).
"""
import importlib
from unittest.mock import Mock

migration = importlib.import_module('apps.crm.migrations.0008_groups_name_case_sensitive')


def _schema_editor(vendor):
    editor = Mock()
    editor.connection.vendor = vendor
    editor.quote_name.side_effect = lambda name: f'`{name}`'
    return editor


def test_mysql_column_gets_binary_collation():
    editor = _schema_editor('mysql')

    migration.make_case_sensitive(None, editor)

    editor.execute.assert_called_once_with(
        'ALTER TABLE `groups` MODIFY `name` VARCHAR(100) '
        'CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL'
    )


def test_mysql_reverse_restores_table_default_collation():
    editor = _schema_editor('mysql')

    migration.restore_default_collation(None, editor)

    editor.execute.assert_called_once_with(
        'ALTER TABLE `groups` MODIFY `name` VARCHAR(100) NOT NULL'
    )


def test_runs_outside_a_transaction():
    # MySQL can't roll back DDL, so Django refuses ALTER inside an atomic block.
    assert migration.Migration.operations[0].atomic is False


def test_other_databases_are_left_alone():
    editor = _schema_editor('sqlite')

    migration.make_case_sensitive(None, editor)
    migration.restore_default_collation(None, editor)

    editor.execute.assert_not_called()
