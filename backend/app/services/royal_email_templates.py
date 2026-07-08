"""Premium royal-invitation HTML emails for The Royal Passage."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from html import escape
from urllib.parse import quote

from app.config import settings

# Site-matched palette (src/styles.css — dark burgundy + molten gold)
EMAIL_BG = "#1a0c10"
EMAIL_CARD = "#261218"
EMAIL_CARD_INNER = "#2e161e"
EMAIL_BORDER = "rgba(200, 162, 90, 0.32)"
EMAIL_PAGE_BG = "#ffffff"
EMAIL_INK = "#f7f1e8"
EMAIL_INK_SOFT = "#c4b5a5"
EMAIL_INK_MUTED = "#9a8a78"
EMAIL_GOLD = "#c8a25a"
EMAIL_GOLD_BRIGHT = "#d4af6a"
EMAIL_BURGUNDY = "#5c1a24"
EMAIL_BTN_TEXT = "#2d0000"


def _e(value: object) -> str:
    return escape(str(value or ""), quote=True)


def _logo_url() -> str:
    custom = (settings.email_logo_url or "").strip()
    if custom:
        return custom
    return f"{settings.site_url.rstrip('/')}/brand/logo.png"


def _is_brand_logo_url(url: str) -> bool:
    """Skip brand crest URLs when rendering experience hero photos."""
    u = (url or "").strip().lower()
    if not u:
        return True
    if u == _logo_url().lower():
        return True
    return any(marker in u for marker in ("/brand/logo", "logo.png", "logo.svg"))


def _site(path: str) -> str:
    return f"{settings.site_url.rstrip('/')}{path}"


def format_duration_label(minutes: int | None) -> str:
    if not minutes or minutes <= 0:
        return "—"
    hours, mins = divmod(int(minutes), 60)
    if hours and mins:
        return f"{hours} Hour{'s' if hours != 1 else ''} {mins} min"
    if hours:
        return f"{hours} Hour{'s' if hours != 1 else ''}"
    return f"{mins} Minutes"


def _booking_reference(booking_id: str) -> str:
    short = (booking_id or "").replace("-", "")[:4].upper() or "0000"
    day = datetime.now(timezone.utc).strftime("%Y%m%d")
    return f"RP-{day}-{short}"


def _qr_url(data: str) -> str:
    return (
        "https://api.qrserver.com/v1/create-qr-code/?size=140x140"
        f"&color=5C1D1D&bgcolor=FFFDF8&margin=8&data={quote(data, safe='')}"
    )


@dataclass
class RoyalBookingInvitationContext:
    guest_name: str
    experience_name: str
    booking_id: str
    booking_date: str
    booking_time: str
    booking_time_end: str
    guests: int
    venue: str
    host_name: str
    price: str
    status: str = "Pending Confirmation"
    experience_description: str = ""
    experience_image_url: str = ""
    map_link: str = ""
    duration_label: str = ""
    reservation_date: str = ""
    payment_method: str = "Pay at Venue"
    support_email: str = ""
    support_phone: str = ""
    website: str = ""


def _royal_divider() -> str:
    return f"""
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 26px auto;">
      <tr>
        <td style="width: 42%; height: 1px; background: linear-gradient(90deg, transparent, {EMAIL_GOLD}); font-size: 0; line-height: 0;">&nbsp;</td>
        <td align="center" style="width: 16%; padding: 0 6px; font-family: Cinzel, Georgia, serif; font-size: 11px; color: {EMAIL_GOLD_BRIGHT}; letter-spacing: 0.2em;">&#10022;</td>
        <td style="width: 42%; height: 1px; background: linear-gradient(90deg, {EMAIL_GOLD}, transparent); font-size: 0; line-height: 0;">&nbsp;</td>
      </tr>
    </table>"""


def _royal_ornament_header() -> str:
    return f"""
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 6px;">
      <tr>
        <td align="center" style="font-family: Cinzel, Georgia, serif; font-size: 10px; letter-spacing: 0.42em; text-transform: uppercase; color: {EMAIL_GOLD};">&#10022;&nbsp;&nbsp;Royal Invitation&nbsp;&nbsp;&#10022;</td>
      </tr>
    </table>"""


def _royal_cta_button(label: str, url: str) -> str:
    return f"""
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 28px auto 0;">
      <tr>
        <td align="center">
          <a href="{_e(url)}" style="display: inline-block; background: linear-gradient(135deg, {EMAIL_GOLD} 0%, {EMAIL_GOLD_BRIGHT} 50%, {EMAIL_GOLD} 100%); color: {EMAIL_BTN_TEXT}; font-family: Cinzel, Georgia, serif; font-size: 11px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; text-decoration: none; padding: 17px 42px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.12); box-shadow: 0 4px 24px rgba(200, 162, 90, 0.4), inset 0 1px 0 rgba(255,255,255,0.2);">{_e(label)}</a>
        </td>
      </tr>
    </table>"""


def royal_link(url: str, label: str) -> str:
    return (
        f'<a href="{_e(url)}" style="color: {EMAIL_GOLD_BRIGHT}; text-decoration: none; '
        f'border-bottom: 1px solid rgba(200, 162, 90, 0.45);">{_e(label)}</a>'
    )


def royal_list(items: list[str]) -> str:
    rows = "".join(
        f'<li style="margin: 0 0 8px; color: {EMAIL_INK_SOFT};">{_e(item)}</li>' for item in items
    )
    return (
        f'<ul style="margin: 18px 0; padding-left: 20px; line-height: 1.75; '
        f'font-family: \'Cormorant Garamond\', Georgia, serif; font-size: 16px;">{rows}</ul>'
    )


def royal_paragraph(html: str) -> str:
    return (
        f'<p style="margin: 0 0 16px; font-family: \'Cormorant Garamond\', Georgia, serif; '
        f'font-size: 17px; line-height: 1.75; color: {EMAIL_INK_SOFT};">{html}</p>'
    )


def render_royal_transactional_email(
    *,
    title: str,
    body_html: str,
    cta_label: str | None = None,
    cta_url: str | None = None,
    preheader: str = "",
) -> str:
    """Dark burgundy + gold shell for welcome, booking updates, host alerts, etc."""
    logo = _logo_url()
    website = settings.site_url.rstrip("/")
    year = datetime.now(timezone.utc).year
    cta_block = _royal_cta_button(cta_label, cta_url) if cta_label and cta_url else ""
    hidden = _e(preheader or title)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="dark" />
  <title>{_e(title)} — The Royal Passage</title>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;600&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet" />
</head>
<body style="margin: 0; padding: 0; background-color: {EMAIL_PAGE_BG}; -webkit-text-size-adjust: 100%;">
  <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">{hidden}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: {EMAIL_PAGE_BG}; padding: 48px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width: 600px; max-width: 600px; border: 1px solid rgba(200, 162, 90, 0.22); border-radius: 12px; padding: 1px; background: linear-gradient(145deg, rgba(200,162,90,0.35), rgba(92,26,36,0.2), rgba(200,162,90,0.25)); box-shadow: 0 28px 64px rgba(0,0,0,0.5);">
          <tr>
            <td style="background-color: {EMAIL_CARD}; border-radius: 11px; overflow: hidden;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="height: 4px; background: linear-gradient(90deg, {EMAIL_BURGUNDY}, {EMAIL_GOLD}, {EMAIL_GOLD_BRIGHT}, {EMAIL_GOLD}, {EMAIL_BURGUNDY}); font-size: 0; line-height: 0;">&nbsp;</td>
                </tr>
                <tr>
                  <td style="padding: 44px 44px 36px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding-bottom: 8px;">
                          <a href="{_e(website)}" style="text-decoration: none;">
                            <img src="{_e(logo)}" alt="The Royal Passage" height="150" style="display: block; margin: 0 auto; max-height: 150px; width: auto; border: 0; opacity: 0.96;" />
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="padding: 12px 0 4px;">
                          <p style="margin: 0; font-family: Cinzel, Georgia, serif; font-size: 9px; letter-spacing: 0.42em; text-transform: uppercase; color: {EMAIL_GOLD};">Mysuru &middot; Curated Royal Journeys</p>
                        </td>
                      </tr>
                      <tr><td>{_royal_divider()}</td></tr>
                      <tr>
                        <td align="center" style="padding: 20px 0 24px;">
                          <h1 style="margin: 0; font-family: 'Cinzel Decorative', Cinzel, Georgia, serif; font-size: 24px; font-weight: 400; color: {EMAIL_INK}; letter-spacing: 0.06em; line-height: 1.35;">{_e(title)}</h1>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 8px;">
                          {body_html}
                          {cta_block}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top: 20px;">
                          {_royal_divider()}
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding-top: 22px;">
                            <tr>
                              <td align="center">
                                <p style="margin: 0 0 6px; font-family: Cinzel, Georgia, serif; font-size: 11px; letter-spacing: 0.24em; color: {EMAIL_GOLD};">THE ROYAL PASSAGE</p>
                                <p style="margin: 0 0 10px; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 15px; font-style: italic; color: {EMAIL_INK_MUTED};">Curated Heritage Experiences Across Mysuru</p>
                                <p style="margin: 0; font-family: Cinzel, Georgia, serif; font-size: 9px; letter-spacing: 0.12em; color: {EMAIL_INK_MUTED};">&copy; {year} The Royal Passage</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def _detail_row(icon: str, label: str, value: str) -> str:
    return f"""
    <tr>
      <td style="padding: 11px 0; border-bottom: 1px solid #EDE4D4; vertical-align: top; width: 36px; font-size: 16px;">{icon}</td>
      <td style="padding: 11px 0 11px 10px; border-bottom: 1px solid #EDE4D4; vertical-align: top; width: 38%;">
        <span style="font-family: Inter, Arial, sans-serif; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: #9A8A78;">{_e(label)}</span>
      </td>
      <td style="padding: 11px 0; border-bottom: 1px solid #EDE4D4; vertical-align: top; text-align: right;">
        <span style="font-family: 'Libre Baskerville', Georgia, serif; font-size: 14px; color: #4A2323;">{_e(value)}</span>
      </td>
    </tr>"""


def render_royal_booking_invitation_email(ctx: RoyalBookingInvitationContext) -> str:
    logo = _logo_url()
    website = ctx.website or settings.site_url.rstrip("/")
    support_email = ctx.support_email or settings.resend_from_email or "noreplay@theroyalpassage.com"
    booking_url = _site(f"/bookings/{ctx.booking_id}")
    ref = _booking_reference(ctx.booking_id)
    reserved = ctx.reservation_date or datetime.now(timezone.utc).strftime("%d %b %Y")
    time_range = ctx.booking_time
    if ctx.booking_time_end:
        time_range = f"{ctx.booking_time} – {ctx.booking_time_end}"
    maps_href = ctx.map_link or booking_url
    desc = (
        ctx.experience_description.strip()
        or "Immerse yourself in one of Mysuru's finest handcrafted cultural experiences."
    )
    hero_img = ctx.experience_image_url.strip() or f"{website}/brand/logo.png"
    host = ctx.host_name or "Heritage Host"
    duration = ctx.duration_label or "—"

    experience_block = ""
    if ctx.experience_image_url:
        experience_block = f"""
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0 0;">
          <tr>
            <td style="border-radius: 12px; overflow: hidden; border: 1px solid #D8C9AF;">
              <img src="{_e(hero_img)}" alt="{_e(ctx.experience_name)}" width="520" style="display: block; width: 100%; max-width: 520px; height: auto; border: 0;" />
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 22px 8px 0;">
              <p style="margin: 0 0 6px; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 24px; color: #4A2323;">{_e(ctx.experience_name)}</p>
              <p style="margin: 0 0 8px; font-size: 13px; color: #C79A42; letter-spacing: 0.12em;">&#9733;&#9733;&#9733;&#9733;&#9733;</p>
              <p style="margin: 0 0 10px; font-family: Inter, Arial, sans-serif; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: #9A8A78;">Authentic Heritage Experience</p>
              <p style="margin: 0; font-family: 'Libre Baskerville', Georgia, serif; font-size: 14px; line-height: 1.7; color: #5B4A3B; max-width: 460px;">{_e(desc)}</p>
            </td>
          </tr>
        </table>"""

    return f"""<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>Your Royal Journey Begins — The Royal Passage</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;600&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
  <style>
    @media only screen and (max-width: 620px) {{
      .shell {{ width: 100% !important; }}
      .pad {{ padding-left: 20px !important; padding-right: 20px !important; }}
      .hero-title {{ font-size: 26px !important; }}
    }}
    @media (prefers-color-scheme: dark) {{
      .bg-outer {{ background-color: #1a1410 !important; }}
      .bg-card {{ background-color: #2a221c !important; }}
      .text-body {{ color: #e8dfd0 !important; }}
    }}
    .btn-primary:hover {{ background-color: #b88732 !important; box-shadow: 0 8px 24px rgba(199, 154, 66, 0.45) !important; }}
    .btn-secondary:hover {{ background-color: rgba(199, 154, 66, 0.08) !important; }}
  </style>
</head>
<body class="bg-outer" style="margin: 0; padding: 0; background-color: #F7F2E8; -webkit-text-size-adjust: 100%;">
  <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">
    Your royal invitation awaits — {_e(ctx.experience_name)} · {_e(ref)}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="bg-outer" style="background-color: #F7F2E8; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" class="shell bg-card" style="width: 600px; max-width: 600px; background-color: #FFFDF8; border: 1px solid #D8C9AF; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(74, 35, 35, 0.08);">
          <!-- Watermark -->
          <tr>
            <td style="background-image: url('{_e(logo)}'); background-repeat: no-repeat; background-position: center 120px; background-size: 280px auto; opacity: 1;">
              <div style="background: rgba(255, 253, 248, 0.97);">
                <!-- Gold top bar -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr><td style="height: 4px; background: linear-gradient(90deg, #5C1D1D 0%, #C79A42 50%, #5C1D1D 100%); font-size: 0; line-height: 0;">&nbsp;</td></tr>
                </table>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="pad" style="padding: 40px 36px 0;">
                  <!-- Hero -->
                  <tr>
                    <td align="center" style="padding-bottom: 8px;">
                      <a href="{_e(website)}" style="text-decoration: none;">
                        <img src="{_e(logo)}" alt="The Royal Passage royal crest logo" height="120" style="display: block; margin: 0 auto; max-height: 120px; width: auto; border: 0;" />
                      </a>
                      <p style="margin: 20px 0 4px; font-family: Inter, Arial, sans-serif; font-size: 9px; letter-spacing: 0.55em; color: #9A8A78;">M Y S U R U</p>
                      <p style="margin: 0; font-family: Inter, Arial, sans-serif; font-size: 9px; letter-spacing: 0.28em; text-transform: uppercase; color: #C79A42;">Curated Royal Journeys</p>
                    </td>
                  </tr>
                  <tr><td>{_royal_divider()}</td></tr>
                  <tr>
                    <td align="center" style="padding: 8px 0 4px;">
                      <h1 class="hero-title" style="margin: 0; font-family: Cinzel, Georgia, serif; font-size: 30px; font-weight: 600; letter-spacing: 0.12em; color: #C79A42; text-transform: uppercase;">Your Royal Journey Begins</h1>
                      <p style="margin: 14px 0 0; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 22px; font-style: italic; color: #5C1D1D;">Booking Request Received</p>
                    </td>
                  </tr>

                  <!-- Welcome -->
                  <tr>
                    <td style="padding: 32px 0 0;">
                      <p class="text-body" style="margin: 0 0 14px; font-family: 'Libre Baskerville', Georgia, serif; font-size: 15px; color: #5B4A3B; line-height: 1.75;">Dear {_e(ctx.guest_name)},</p>
                      <p class="text-body" style="margin: 0 0 14px; font-family: 'Libre Baskerville', Georgia, serif; font-size: 15px; color: #5B4A3B; line-height: 1.75;">Thank you for choosing <strong style="color: #4A2323;">The Royal Passage</strong>.</p>
                      <p class="text-body" style="margin: 0 0 14px; font-family: 'Libre Baskerville', Georgia, serif; font-size: 15px; color: #5B4A3B; line-height: 1.75;">Your request has been received and forwarded to our heritage host.</p>
                      <p class="text-body" style="margin: 0; font-family: 'Libre Baskerville', Georgia, serif; font-size: 15px; color: #5B4A3B; line-height: 1.75;">Every experience is personally reviewed to ensure exceptional hospitality worthy of royalty.</p>
                    </td>
                  </tr>

                  <!-- Status badge -->
                  <tr>
                    <td align="center" style="padding: 32px 0 0;">
                      <table role="presentation" cellpadding="0" cellspacing="0" style="border: 1px solid #C79A42; border-radius: 999px; background: #FFFDF8; padding: 14px 28px;">
                        <tr>
                          <td style="font-size: 14px; padding-right: 10px; vertical-align: middle;">&#9679;</td>
                          <td style="vertical-align: middle;">
                            <p style="margin: 0; font-family: Inter, Arial, sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: #5C1D1D;">Awaiting Host Confirmation</p>
                            <p style="margin: 4px 0 0; font-family: 'Libre Baskerville', Georgia, serif; font-size: 12px; color: #9A8A78;">Estimated confirmation within 12 hours</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Booking details -->
                  <tr>
                    <td style="padding: 36px 0 0;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #D8C9AF; border-radius: 12px; background: #FFFCF6; padding: 24px 22px;">
                        <tr>
                          <td>
                            <p style="margin: 0 0 18px; font-family: Cinzel, Georgia, serif; font-size: 13px; letter-spacing: 0.2em; text-align: center; color: #C79A42;">ROYAL BOOKING DETAILS</p>
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                              {_detail_row("&#128197;", "Date", ctx.booking_date)}
                              {_detail_row("&#128339;", "Time", time_range)}
                              {_detail_row("&#128100;", "Guests", str(ctx.guests))}
                              {_detail_row("&#128205;", "Experience", ctx.experience_name)}
                              {_detail_row("&#127963;", "Venue", ctx.venue or "—")}
                              {_detail_row("&#128179;", "Payment", ctx.payment_method)}
                              {_detail_row("&#8377;", "Total", ctx.price)}
                              {_detail_row("&#127915;", "Booking ID", ref)}
                              {_detail_row("&#128197;", "Reserved", reserved)}
                              {_detail_row("&#9679;", "Status", ctx.status)}
                              {_detail_row("&#128100;", "Host", host)}
                              {_detail_row("&#127760;", "Language", "English")}
                              {_detail_row("&#9201;", "Duration", duration)}
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                {experience_block}

                <!-- Host -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="pad" style="padding: 32px 36px 0;">
                  <tr>
                    <td>
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #D8C9AF; border-radius: 12px; padding: 22px;">
                        <tr>
                          <td width="72" valign="top" style="padding-right: 16px;">
                            <div style="width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #5C1D1D, #C79A42); color: #FFFDF8; font-family: Cinzel, Georgia, serif; font-size: 20px; line-height: 56px; text-align: center;">{_e(host[:1].upper())}</div>
                          </td>
                          <td valign="top">
                            <p style="margin: 0 0 4px; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 20px; color: #4A2323;">{_e(host)}</p>
                            <p style="margin: 0 0 6px; font-family: Inter, Arial, sans-serif; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: #C79A42;">Heritage Expert</p>
                            <p style="margin: 0 0 4px; font-size: 12px; color: #C79A42;">&#9733;&#9733;&#9733;&#9733;&#9733; <span style="color: #5B4A3B;">4.9</span></p>
                            <p style="margin: 0; font-family: 'Libre Baskerville', Georgia, serif; font-size: 12px; color: #9A8A78;">Verified Host &middot; English</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Timeline -->
                  <tr>
                    <td style="padding: 32px 0 0;">
                      <p style="margin: 0 0 20px; font-family: Cinzel, Georgia, serif; font-size: 12px; letter-spacing: 0.18em; text-align: center; color: #C79A42;">ROYAL TIMELINE</p>
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                        <tr><td style="padding: 6px 0; font-family: 'Libre Baskerville', Georgia, serif; font-size: 13px; color: #5C1D1D;">&#10003; Booking Request Received</td></tr>
                        <tr><td style="padding: 6px 0 6px 18px; border-left: 2px solid #C79A42; font-family: 'Libre Baskerville', Georgia, serif; font-size: 13px; color: #4A2323; font-weight: bold;">&#9679; Host Reviewing</td></tr>
                        <tr><td style="padding: 6px 0 6px 18px; border-left: 2px solid #E8DCC8; font-family: 'Libre Baskerville', Georgia, serif; font-size: 13px; color: #9A8A78;">&#9675; Booking Confirmed</td></tr>
                        <tr><td style="padding: 6px 0 6px 18px; border-left: 2px solid #E8DCC8; font-family: 'Libre Baskerville', Georgia, serif; font-size: 13px; color: #9A8A78;">&#9675; Arrival Instructions</td></tr>
                        <tr><td style="padding: 6px 0 6px 18px; border-left: 2px solid #E8DCC8; font-family: 'Libre Baskerville', Georgia, serif; font-size: 13px; color: #9A8A78;">&#9675; Experience Begins</td></tr>
                      </table>
                    </td>
                  </tr>

                  <!-- What happens next -->
                  <tr>
                    <td style="padding: 32px 0 0;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #FFFCF6; border: 1px solid #D8C9AF; border-radius: 12px; padding: 24px 22px;">
                        <tr><td>
                          <p style="margin: 0 0 16px; font-family: Cinzel, Georgia, serif; font-size: 12px; letter-spacing: 0.16em; color: #C79A42;">WHAT HAPPENS NEXT</p>
                          <p style="margin: 0 0 10px; font-family: 'Libre Baskerville', Georgia, serif; font-size: 14px; color: #5B4A3B; line-height: 1.65;"><span style="color: #C79A42;">1.</span> Your host reviews your booking.</p>
                          <p style="margin: 0 0 10px; font-family: 'Libre Baskerville', Georgia, serif; font-size: 14px; color: #5B4A3B; line-height: 1.65;"><span style="color: #C79A42;">2.</span> A confirmation invitation arrives by email.</p>
                          <p style="margin: 0 0 10px; font-family: 'Libre Baskerville', Georgia, serif; font-size: 14px; color: #5B4A3B; line-height: 1.65;"><span style="color: #C79A42;">3.</span> Arrival instructions are shared with you.</p>
                          <p style="margin: 0 0 10px; font-family: 'Libre Baskerville', Georgia, serif; font-size: 14px; color: #5B4A3B; line-height: 1.65;"><span style="color: #C79A42;">4.</span> A gentle reminder one day before.</p>
                          <p style="margin: 0; font-family: 'Libre Baskerville', Georgia, serif; font-size: 14px; color: #5B4A3B; line-height: 1.65;"><span style="color: #C79A42;">5.</span> Enjoy your royal experience.</p>
                        </td></tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Before you arrive -->
                  <tr>
                    <td style="padding: 24px 0 0;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #EDE4D4; border-radius: 10px; padding: 18px 20px;">
                        <tr><td>
                          <p style="margin: 0 0 12px; font-family: Inter, Arial, sans-serif; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: #9A8A78;">Before You Arrive</p>
                          <p style="margin: 0 0 6px; font-family: 'Libre Baskerville', Georgia, serif; font-size: 13px; color: #5B4A3B;">&#10003; Arrive 15 minutes early</p>
                          <p style="margin: 0 0 6px; font-family: 'Libre Baskerville', Georgia, serif; font-size: 13px; color: #5B4A3B;">&#10003; Carry valid ID</p>
                          <p style="margin: 0 0 6px; font-family: 'Libre Baskerville', Georgia, serif; font-size: 13px; color: #5B4A3B;">&#10003; Comfortable clothing recommended</p>
                          <p style="margin: 0 0 6px; font-family: 'Libre Baskerville', Georgia, serif; font-size: 13px; color: #5B4A3B;">&#10003; Photography allowed</p>
                          <p style="margin: 0; font-family: 'Libre Baskerville', Georgia, serif; font-size: 13px; color: #5B4A3B;">&#10003; Free parking available</p>
                        </td></tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Location -->
                  <tr>
                    <td style="padding: 24px 0 0;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #D8C9AF; border-radius: 12px; padding: 20px 22px;">
                        <tr><td>
                          <p style="margin: 0 0 8px; font-family: Inter, Arial, sans-serif; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: #9A8A78;">Meeting Location</p>
                          <p style="margin: 0 0 4px; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 18px; color: #4A2323;">{_e(ctx.venue or ctx.experience_name)}</p>
                          <p style="margin: 0 0 16px; font-family: 'Libre Baskerville', Georgia, serif; font-size: 13px; line-height: 1.6; color: #5B4A3B;">{_e(ctx.venue)}</p>
                          <a href="{_e(maps_href)}" style="display: inline-block; font-family: Inter, Arial, sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #5C1D1D; text-decoration: none; border: 1px solid #C79A42; border-radius: 6px; padding: 10px 18px;">Open in Maps</a>
                        </td></tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Payment -->
                  <tr>
                    <td style="padding: 24px 0 0;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(180deg, #FFFCF6 0%, #FFFDF8 100%); border: 1px solid #D8C9AF; border-radius: 12px; padding: 22px;">
                        <tr><td>
                          <p style="margin: 0 0 14px; font-family: Cinzel, Georgia, serif; font-size: 11px; letter-spacing: 0.16em; color: #C79A42;">PAYMENT SUMMARY</p>
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                            <tr><td style="padding: 6px 0; font-family: 'Libre Baskerville', Georgia, serif; font-size: 14px; color: #5B4A3B;">Subtotal</td><td align="right" style="padding: 6px 0; font-family: 'Libre Baskerville', Georgia, serif; font-size: 14px; color: #4A2323;">{_e(ctx.price)}</td></tr>
                            <tr><td style="padding: 6px 0; font-family: 'Libre Baskerville', Georgia, serif; font-size: 14px; color: #5B4A3B;">Taxes &amp; fees</td><td align="right" style="padding: 6px 0; font-family: 'Libre Baskerville', Georgia, serif; font-size: 14px; color: #9A8A78;">Included</td></tr>
                            <tr><td colspan="2" style="padding: 10px 0 6px; border-top: 1px solid #D8C9AF; font-family: Cinzel, Georgia, serif; font-size: 14px; color: #4A2323;">Total</td></tr>
                            <tr><td colspan="2" align="right" style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 26px; color: #C79A42;">{_e(ctx.price)}</td></tr>
                            <tr><td colspan="2" style="padding-top: 8px; font-family: Inter, Arial, sans-serif; font-size: 11px; letter-spacing: 0.08em; color: #9A8A78;">{_e(ctx.payment_method)}</td></tr>
                          </table>
                        </td></tr>
                      </table>
                    </td>
                  </tr>

                  <!-- QR -->
                  <tr>
                    <td align="center" style="padding: 32px 0 0;">
                      <img src="{_e(_qr_url(booking_url))}" alt="Booking QR code for check-in" width="140" height="140" style="display: block; margin: 0 auto; border: 1px solid #D8C9AF; border-radius: 8px;" />
                      <p style="margin: 12px 0 0; font-family: Inter, Arial, sans-serif; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: #9A8A78;">Show this at check-in</p>
                    </td>
                  </tr>

                  <!-- Buttons -->
                  <tr>
                    <td align="center" style="padding: 32px 0 8px;">
                      <a href="{_e(booking_url)}" class="btn-primary" style="display: inline-block; background-color: #C79A42; color: #FFFDF8; font-family: Inter, Arial, sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; text-decoration: none; padding: 16px 36px; border-radius: 8px; box-shadow: 0 6px 20px rgba(199, 154, 66, 0.35);">View My Royal Booking</a>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding: 12px 0 0;">
                      <a href="mailto:{_e(support_email)}" class="btn-secondary" style="display: inline-block; background: transparent; color: #5C1D1D; font-family: Inter, Arial, sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; text-decoration: none; padding: 14px 28px; border-radius: 8px; border: 1px solid #C79A42;">Contact Concierge</a>
                    </td>
                  </tr>

                  <!-- Concierge -->
                  <tr>
                    <td style="padding: 32px 0 0;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="text-align: center; padding: 20px; border-top: 1px solid #EDE4D4;">
                        <tr><td>
                          <p style="margin: 0 0 6px; font-family: Cinzel, Georgia, serif; font-size: 11px; letter-spacing: 0.14em; color: #C79A42;">ROYAL CONCIERGE</p>
                          <p style="margin: 0 0 12px; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 18px; color: #4A2323;">Need assistance?</p>
                          <p style="margin: 0 0 4px; font-family: 'Libre Baskerville', Georgia, serif; font-size: 13px; color: #5B4A3B;"><a href="mailto:{_e(support_email)}" style="color: #5C1D1D; text-decoration: none;">{_e(support_email)}</a></p>
                          <p style="margin: 0; font-family: Inter, Arial, sans-serif; font-size: 11px; color: #9A8A78;">Support hours: 9 AM – 9 PM IST</p>
                        </td></tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Cancellation -->
                  <tr>
                    <td style="padding: 16px 0 0;">
                      <p style="margin: 0; font-family: 'Libre Baskerville', Georgia, serif; font-size: 12px; line-height: 1.7; color: #9A8A78; text-align: center;">Free cancellation up to 24 hours before your experience. Late cancellations may incur charges. Host approval required for modifications.</p>
                    </td>
                  </tr>

                  <!-- Quote -->
                  <tr>
                    <td align="center" style="padding: 32px 0 0;">
                      <p style="margin: 0; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 18px; font-style: italic; line-height: 1.65; color: #5C1D1D; max-width: 420px;">&ldquo;Every journey tells a story.<br/>Thank you for allowing us to craft yours.&rdquo;</p>
                    </td>
                  </tr>
                </table>

                <!-- Footer -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="pad" style="padding: 28px 36px 36px;">
                  <tr><td>{_royal_divider()}</td></tr>
                  <tr>
                    <td align="center" style="padding-top: 8px;">
                      <img src="{_e(logo)}" alt="The Royal Passage" height="150" style="display: block; margin: 0 auto 12px; max-height: 150px; width: auto; border: 0; opacity: 0.96;" />
                      <p style="margin: 0 0 4px; font-family: Cinzel, Georgia, serif; font-size: 11px; letter-spacing: 0.2em; color: #4A2323;">THE ROYAL PASSAGE</p>
                      <p style="margin: 0 0 20px; font-family: 'Libre Baskerville', Georgia, serif; font-size: 12px; color: #9A8A78;">Curated Heritage Experiences Across Mysuru</p>
                      <p style="margin: 0 0 16px; font-family: Inter, Arial, sans-serif; font-size: 10px; letter-spacing: 0.08em;">
                        <a href="{_e(website)}" style="color: #5C1D1D; text-decoration: none; margin: 0 8px;">Website</a>
                        <a href="{_e(website)}/privacy" style="color: #5C1D1D; text-decoration: none; margin: 0 8px;">Privacy</a>
                        <a href="{_e(website)}/terms" style="color: #5C1D1D; text-decoration: none; margin: 0 8px;">Terms</a>
                        <a href="mailto:{_e(support_email)}" style="color: #5C1D1D; text-decoration: none; margin: 0 8px;">Support</a>
                      </p>
                      <p style="margin: 0; font-family: Inter, Arial, sans-serif; font-size: 10px; color: #9A8A78;">&copy; {datetime.now(timezone.utc).year} The Royal Passage. All rights reserved.</p>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


@dataclass
class RoyalBookingRequestContext:
    guest_name: str
    experience_name: str
    booking_id: str
    booking_date: str
    booking_time: str
    booking_time_end: str
    guests: int
    venue: str
    price: str
    payment_method: str = "Pay at Venue"
    host_name: str = ""
    duration_label: str = ""
    experience_description: str = ""
    experience_image_url: str = ""
    support_email: str = ""
    support_phone: str = ""
    website: str = ""


def _royal_corner_ornaments() -> str:
    corner = f"color: {EMAIL_GOLD}; font-family: Cinzel, Georgia, serif; font-size: 14px; line-height: 1; opacity: 0.55;"
    return f"""
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 -8px;">
      <tr>
        <td align="left" style="{corner}">&#10070;</td>
        <td align="right" style="{corner}">&#10070;</td>
      </tr>
    </table>"""


def _minimal_detail_row(label: str, value: str, *, highlight: bool = False) -> str:
    value_color = EMAIL_GOLD_BRIGHT if highlight else EMAIL_INK
    value_font = "17px" if highlight else "15px"
    border = "none" if highlight else f"1px solid rgba(200, 162, 90, 0.14)"
    padding_top = "18px" if highlight else "13px"
    return f"""
    <tr>
      <td style="padding: {padding_top} 0 13px; border-bottom: {border}; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: {EMAIL_INK_MUTED}; vertical-align: top; width: 40%;">{_e(label)}</td>
      <td style="padding: {padding_top} 0 13px; border-bottom: {border}; font-family: Cinzel, Georgia, serif; font-size: {value_font}; color: {value_color}; text-align: right; vertical-align: top; font-weight: {'600' if highlight else '400'};">{_e(value)}</td>
    </tr>"""


def render_royal_booking_request_email(ctx: RoyalBookingRequestContext) -> str:
    """Minimal luxury booking-request email — royal invitation, not a standard receipt."""
    logo = _logo_url()
    website = ctx.website or settings.site_url.rstrip("/")
    booking_url = _site(f"/bookings/{ctx.booking_id}")
    ref = _booking_reference(ctx.booking_id)
    time_range = ctx.booking_time
    if ctx.booking_time_end:
        time_range = f"{ctx.booking_time} – {ctx.booking_time_end}"

    hero_image = (ctx.experience_image_url or "").strip()
    has_photo = bool(hero_image) and not _is_brand_logo_url(hero_image)
    show_experience_card = has_photo or bool((ctx.experience_description or "").strip())
    hero_block = ""
    if show_experience_card:
        image_row = ""
        if has_photo:
            image_row = f"""
                            <tr>
                              <td style="padding: 0; line-height: 0;">
                                <img src="{_e(hero_image)}" alt="{_e(ctx.experience_name)}" width="512" style="display: block; width: 100%; max-width: 512px; max-height: 180px; height: auto; object-fit: cover; border: 0;" />
                              </td>
                            </tr>"""
        hero_block = f"""
                      <tr>
                        <td style="padding-bottom: 28px;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid {EMAIL_BORDER}; border-radius: 10px; overflow: hidden;">
                            {image_row}
                            <tr>
                              <td style="padding: 16px 22px; background: linear-gradient(180deg, {EMAIL_CARD_INNER}, {EMAIL_CARD});">
                                <p style="margin: 0 0 6px; font-family: Cinzel, Georgia, serif; font-size: 11px; letter-spacing: 0.2em; color: {EMAIL_GOLD};">Your Chosen Experience</p>
                                <p style="margin: 0; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 22px; font-weight: 600; line-height: 1.35; color: {EMAIL_INK};">{_e(ctx.experience_name)}</p>
                                {f'<p style="margin: 10px 0 0; font-family: &quot;Cormorant Garamond&quot;, Georgia, serif; font-size: 15px; font-style: italic; line-height: 1.6; color: {EMAIL_INK_MUTED};">{_e(ctx.experience_description[:160])}{"…" if len(ctx.experience_description) > 160 else ""}</p>' if ctx.experience_description else ""}
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>"""

    host_line = ""
    if ctx.host_name:
        host_line = f"""
                          <p style="margin: 14px 0 0; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 15px; color: {EMAIL_INK_MUTED};">
                            Your heritage host: <span style="color: {EMAIL_GOLD_BRIGHT}; font-style: italic;">{_e(ctx.host_name)}</span>
                          </p>"""

    duration_row = ""
    if ctx.duration_label:
        duration_row = _minimal_detail_row("Duration", ctx.duration_label)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="dark" />
  <title>Booking Request Received — The Royal Passage</title>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;600&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet" />
  <style>
    @media only screen and (max-width: 620px) {{
      .shell {{ width: 100% !important; }}
      .pad {{ padding-left: 22px !important; padding-right: 22px !important; }}
      .hero-title {{ font-size: 22px !important; }}
    }}
    .btn-gold:hover {{ filter: brightness(1.08); }}
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: {EMAIL_PAGE_BG}; -webkit-text-size-adjust: 100%;">
  <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">Your royal booking request — {_e(ctx.experience_name)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: {EMAIL_PAGE_BG}; padding: 48px 16px;">
    <tr>
      <td align="center">
        <!-- Outer gold frame -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" class="shell" style="width: 600px; max-width: 600px; border: 1px solid rgba(200, 162, 90, 0.22); border-radius: 12px; padding: 1px; background: linear-gradient(145deg, rgba(200,162,90,0.35), rgba(92,26,36,0.2), rgba(200,162,90,0.25)); box-shadow: 0 28px 64px rgba(0,0,0,0.5), 0 0 60px rgba(200,162,90,0.06);">
          <tr>
            <td style="background-color: {EMAIL_CARD}; border-radius: 11px; overflow: hidden;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="height: 4px; background: linear-gradient(90deg, {EMAIL_BURGUNDY}, {EMAIL_GOLD}, {EMAIL_GOLD_BRIGHT}, {EMAIL_GOLD}, {EMAIL_BURGUNDY}); font-size: 0; line-height: 0;">&nbsp;</td>
                </tr>
                <tr>
                  <td>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="pad" style="padding: 48px 44px 40px;">
                      <!-- Logo -->
                      <tr>
                        <td align="center" style="padding-bottom: 4px;">
                          <a href="{_e(website)}" style="text-decoration: none; display: inline-block;">
                            <img src="{_e(logo)}" alt="The Royal Passage" height="150" style="display: block; margin: 0 auto; max-height: 150px; width: auto; border: 0; opacity: 0.96;" />
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="padding: 16px 0 8px;">
                          <p style="margin: 0; font-family: Cinzel, Georgia, serif; font-size: 9px; letter-spacing: 0.42em; text-transform: uppercase; color: {EMAIL_GOLD};">Mysuru &middot; Curated Royal Journeys</p>
                        </td>
                      </tr>
                      <tr><td>{_royal_divider()}</td></tr>

                      <!-- Title block -->
                      <tr>
                        <td align="center" style="padding: 24px 0 8px;">
                          {_royal_ornament_header()}
                          <h1 class="hero-title" style="margin: 12px 0 0; font-family: 'Cinzel Decorative', Cinzel, Georgia, serif; font-size: 26px; font-weight: 400; color: {EMAIL_INK}; letter-spacing: 0.06em; line-height: 1.35;">Booking Request<br/><span style="color: {EMAIL_GOLD_BRIGHT}; font-size: 22px;">Received</span></h1>
                        </td>
                      </tr>

                      <!-- Status badge -->
                      <tr>
                        <td align="center" style="padding: 20px 0 28px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" style="border: 1px solid rgba(200, 162, 90, 0.45); border-radius: 999px; background: rgba(200, 162, 90, 0.06);">
                            <tr>
                              <td style="padding: 10px 22px; font-family: Cinzel, Georgia, serif; font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: {EMAIL_GOLD_BRIGHT};">Awaiting Host Confirmation</td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- Message -->
                      <tr>
                        <td style="padding-bottom: 32px;">
                          <p style="margin: 0; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 18px; line-height: 1.8; color: {EMAIL_INK_SOFT}; text-align: center;">
                            Dear <span style="color: {EMAIL_INK}; font-style: italic;">{_e(ctx.guest_name)}</span>,<br/>
                            thank you for choosing <strong style="font-weight: 600; color: {EMAIL_GOLD_BRIGHT};">The Royal Passage</strong>.<br/>
                            <span style="font-size: 16px; color: {EMAIL_INK_MUTED};">Your request has been received and forwarded to our heritage host.</span>
                            {host_line}
                          </p>
                        </td>
                      </tr>

                      {hero_block}

                      <!-- Details card -->
                      <tr>
                        <td style="padding-bottom: 28px;">
                          {_royal_corner_ornaments()}
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid {EMAIL_BORDER}; border-radius: 10px; background: linear-gradient(180deg, {EMAIL_CARD_INNER} 0%, rgba(38,18,24,0.95) 100%); box-shadow: inset 0 0 0 1px rgba(200, 162, 90, 0.08);">
                            <tr>
                              <td style="padding: 18px 24px 6px; text-align: center;">
                                <p style="margin: 0; font-family: Cinzel, Georgia, serif; font-size: 10px; letter-spacing: 0.24em; color: {EMAIL_GOLD};">&#10022; Royal Booking Details &#10022;</p>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 4px 24px 16px;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                  {_minimal_detail_row("Booking ID", ref)}
                                  {_minimal_detail_row("Experience", ctx.experience_name) if not show_experience_card else ""}
                                  {_minimal_detail_row("Date", ctx.booking_date)}
                                  {_minimal_detail_row("Time", time_range)}
                                  {duration_row}
                                  {_minimal_detail_row("Guests", str(ctx.guests))}
                                  {_minimal_detail_row("Venue", ctx.venue)}
                                  {_minimal_detail_row("Payment", ctx.payment_method)}
                                  {_minimal_detail_row("Total", ctx.price, highlight=True)}
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- CTA -->
                      <tr>
                        <td align="center" style="padding-bottom: 12px;">
                          <a href="{_e(booking_url)}" class="btn-gold" style="display: inline-block; background: linear-gradient(135deg, {EMAIL_GOLD} 0%, {EMAIL_GOLD_BRIGHT} 50%, {EMAIL_GOLD} 100%); color: {EMAIL_BTN_TEXT}; font-family: Cinzel, Georgia, serif; font-size: 11px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; text-decoration: none; padding: 17px 42px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.12); box-shadow: 0 4px 24px rgba(200, 162, 90, 0.4), inset 0 1px 0 rgba(255,255,255,0.2);">View My Royal Booking</a>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="padding-bottom: 32px;">
                          <p style="margin: 0; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 14px; font-style: italic; color: {EMAIL_INK_MUTED};">We shall write to you once your host confirms.</p>
                        </td>
                      </tr>

                      <!-- Footer -->
                      <tr>
                        <td style="padding-top: 4px;">
                          {_royal_divider()}
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding-top: 24px;">
                            <tr>
                              <td align="center">
                                <p style="margin: 0 0 6px; font-family: Cinzel, Georgia, serif; font-size: 11px; letter-spacing: 0.24em; color: {EMAIL_GOLD};">THE ROYAL PASSAGE</p>
                                <p style="margin: 0 0 14px; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 15px; font-style: italic; color: {EMAIL_INK_MUTED};">Curated Heritage Experiences Across Mysuru</p>
                                <p style="margin: 0 0 10px; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 13px; font-style: italic; color: rgba(200, 162, 90, 0.55);">&ldquo;Every journey tells a story.&rdquo;</p>
                                <p style="margin: 0; font-family: Cinzel, Georgia, serif; font-size: 9px; letter-spacing: 0.12em; color: {EMAIL_INK_MUTED};">&copy; {datetime.now(timezone.utc).year} The Royal Passage</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""
