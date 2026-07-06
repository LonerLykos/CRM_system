import openpyxl


def _text(value):
    return value or ''


def _passthrough(value):
    return value


def _created_at(value):
    return value.strftime('%Y-%m-%d %H:%M:%S') if value else ''


EXPORT_COLUMNS = [
    ('ID',              'id',               _passthrough),
    ('Name',            'name',             _text),
    ('Surname',         'surname',          _text),
    ('Email',           'email',            _text),
    ('Phone',           'phone',            _text),
    ('Age',             'age',              _passthrough),
    ('Course',          'course',           _text),
    ('Course format',   'course_format',    _text),
    ('Course type',     'course_type',      _text),
    ('Status',          'status',           _text),
    ('Sum',             'sum',              _passthrough),
    ('Already paid',    'already_paid',     _passthrough),
    ('Created at',      'created_at',       _created_at),
    ('Group',           'group__name',      _text),
    ('Manager',         'manager__surname', _text),
]


class OrderExportService:

    @staticmethod
    def build_workbook(queryset, total, progress_callback=None, report_every=500):
        wb = openpyxl.Workbook(write_only=True)
        ws = wb.create_sheet('Orders')

        ws.append([col[0] for col in EXPORT_COLUMNS])

        field_paths = [col[1] for col in EXPORT_COLUMNS]
        formatters = [col[2] for col in EXPORT_COLUMNS]

        rows = queryset.values_list(*field_paths).iterator(chunk_size=2000)

        processed = 0
        for row in rows:
            ws.append([fmt(value) for fmt, value in zip(formatters, row)])
            processed += 1
            if progress_callback and processed % report_every == 0:
                progress_callback(processed, total)

        if progress_callback:
            progress_callback(processed, total)

        return wb
