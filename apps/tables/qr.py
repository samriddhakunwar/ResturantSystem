"""
QR code rendering for table tents.

Modules are the kit's charcoal on pure white with a 4-module quiet zone,
as TableTent.md asks, so the code scans reliably.
"""
import io

import qrcode
import qrcode.image.svg
from django.conf import settings

CHARCOAL = "#444034"


def table_url(table) -> str:
    """The URL a table's QR code opens on the guest's phone."""
    return f"{settings.PUBLIC_BASE_URL}/t/{table.qr_token}"


def _qr(data: str) -> qrcode.QRCode:
    qr = qrcode.QRCode(
        error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=10, border=4
    )
    qr.add_data(data)
    qr.make(fit=True)
    return qr


def render_png(data: str) -> bytes:
    buf = io.BytesIO()
    _qr(data).make_image(fill_color=CHARCOAL, back_color="white").save(buf, format="PNG")
    return buf.getvalue()


def render_svg(data: str) -> bytes:
    image = _qr(data).make_image(image_factory=qrcode.image.svg.SvgPathFillImage)
    # The factory leaves the module path unfilled (black); paint it charcoal.
    svg = image.to_string(encoding="unicode").replace("<path ", f'<path fill="{CHARCOAL}" ', 1)
    return svg.encode("utf-8")
