from rest_framework.negotiation import BaseContentNegotiation


class IgnoreClientContentNegotiation(BaseContentNegotiation):
    """
    Content negotiation that ignores the client's Accept header and always
    selects the first configured renderer.

    The orders-export endpoints return a raw .xlsx file (HttpResponse /
    FileResponse) on the success path and JSON (task id / status / errors)
    otherwise, while the frontend proxy sends ``Accept: <xlsx mime>``. DRF's
    default negotiation matches that Accept against the JSON-only renderer set,
    fails, and raises 406 in ``initial()`` before the view runs. Ignoring the
    Accept header lets the file responses pass through untouched and the JSON
    responses render as JSON.
    """

    def select_parser(self, request, parsers):
        return next(iter(parsers))

    def select_renderer(self, request, renderers, format_suffix=None):
        renderer = next(iter(renderers))
        return renderer, renderer.media_type

