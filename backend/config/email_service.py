import logging
import threading
from django.core.mail import EmailMultiAlternatives
from django.core.mail.backends.smtp import EmailBackend
from website_cms.models import SMTPSettings

logger = logging.getLogger(__name__)

def get_smtp_backend(config):
    """
    Creates a dynamic Django SMTP EmailBackend using the parameters stored in PostgreSQL.
    """
    if not config.smtp_user or not config.smtp_password:
        return None

    return EmailBackend(
        host=config.smtp_host,
        port=config.smtp_port,
        username=config.smtp_user,
        password=config.smtp_password,
        use_tls=config.use_tls,
        use_ssl=config.use_ssl,
        timeout=12,
        fail_silently=False,
    )

def _send_async(email_message):
    """
    Executes sending in a separate thread so API requests respond instantly.
    """
    def run():
        try:
            email_message.send(fail_silently=False)
            logger.info("Automated email dispatched successfully.")
        except Exception as e:
            logger.error(f"Failed to dispatch automated email: {e}")

    thread = threading.Thread(target=run, daemon=True)
    thread.start()

def send_new_enquiry_admin_notification(lead, booking=None):
    """
    Automatically sends an email notification to the Admin receiver email
    whenever a new customer booking enquiry is submitted.
    """
    try:
        config = SMTPSettings.get_settings()
        if not config.is_active or not config.notify_admin_on_new_enquiry:
            return False

        backend = get_smtp_backend(config)
        if not backend:
            logger.warning("SMTP credentials not configured in SMTPSettings. Skipping admin email.")
            return False

        booking_id = booking.booking_id if booking else f"PTB-{lead.id + 1000}"
        recipient = config.admin_notification_email or config.from_email
        if not recipient:
            return False

        subject = f"🚖 [New Enquiry] {lead.customer_name} - {lead.pickup} to {lead.drop} ({booking_id})"
        from_email_str = f"{config.from_name} <{config.from_email}>"

        trip_type_label = "Round Trip" if lead.trip_type == "round" else "One-Way Trip"
        formatted_date = str(lead.travel_date)
        formatted_time = str(lead.preferred_time)

        # Plain text body
        text_content = f"""
New Taxi Booking Enquiry Received!
===================================
Booking ID: {booking_id}
Customer Name: {lead.customer_name}
Phone: {lead.customer_phone}
Email: {lead.customer_email or 'Not provided'}

Trip Details:
-------------
Route: {lead.pickup} -> {lead.drop}
Trip Type: {trip_type_label}
Travel Date & Time: {formatted_date} at {formatted_time}
Vehicle: {lead.vehicle_type.upper()}
Est. Distance: {lead.distance_km} km
Est. Fare: Rs. {lead.estimated_fare}
Special Requirements: {lead.requirements or 'None'}

Log in to the Dispatch Portal to confirm and assign a driver:
https://pondytourstravels.vercel.app/admin
        """.strip()

        # HTML body
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Booking Enquiry</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f6fc; color: #1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 24px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          <!-- Header -->
          <tr>
            <td style="background-color: #0066cc; padding: 24px 32px; text-align: left;">
              <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">
                PONDY TOURS &amp; TRAVELS
              </h1>
              <p style="margin: 4px 0 0; color: #dbeafe; font-size: 13px; font-weight: 600;">
                New Online Booking Enquiry Received
              </p>
            </td>
          </tr>

          <!-- Booking Voucher Ribbon -->
          <tr>
            <td style="padding: 16px 32px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
              <table width="100%">
                <tr>
                  <td style="font-size: 13px; color: #64748b; font-weight: 600;">VOUCHER / BOOKING ID</td>
                  <td align="right" style="font-size: 15px; color: #0066cc; font-weight: 800;">{booking_id}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Customer Info -->
          <tr>
            <td style="padding: 24px 32px;">
              <h2 style="margin: 0 0 16px; font-size: 15px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">Customer Contact</h2>
              <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse: collapse; background-color: #f8fafc; border-radius: 8px;">
                <tr>
                  <td width="35%" style="color: #64748b; font-size: 13px; font-weight: 600; border-bottom: 1px solid #e2e8f0;">Passenger Name</td>
                  <td style="color: #0f172a; font-size: 14px; font-weight: 700; border-bottom: 1px solid #e2e8f0;">{lead.customer_name}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-size: 13px; font-weight: 600; border-bottom: 1px solid #e2e8f0;">Contact Phone</td>
                  <td style="color: #0f172a; font-size: 14px; font-weight: 700; border-bottom: 1px solid #e2e8f0;">
                    <a href="tel:{lead.customer_phone}" style="color: #0066cc; text-decoration: none;">{lead.customer_phone}</a>
                  </td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-size: 13px; font-weight: 600;">Email Address</td>
                  <td style="color: #0f172a; font-size: 14px; font-weight: 600;">{lead.customer_email or 'Not provided'}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Journey Info -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <h2 style="margin: 0 0 16px; font-size: 15px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">Journey Details</h2>
              <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse: collapse; background-color: #f8fafc; border-radius: 8px;">
                <tr>
                  <td width="35%" style="color: #64748b; font-size: 13px; font-weight: 600; border-bottom: 1px solid #e2e8f0;">Pickup Location</td>
                  <td style="color: #0f172a; font-size: 14px; font-weight: 700; border-bottom: 1px solid #e2e8f0;">{lead.pickup}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-size: 13px; font-weight: 600; border-bottom: 1px solid #e2e8f0;">Drop Location</td>
                  <td style="color: #0f172a; font-size: 14px; font-weight: 700; border-bottom: 1px solid #e2e8f0;">{lead.drop}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-size: 13px; font-weight: 600; border-bottom: 1px solid #e2e8f0;">Trip Type</td>
                  <td style="color: #0f172a; font-size: 14px; font-weight: 700; border-bottom: 1px solid #e2e8f0;">{trip_type_label}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-size: 13px; font-weight: 600; border-bottom: 1px solid #e2e8f0;">Date &amp; Time</td>
                  <td style="color: #0f172a; font-size: 14px; font-weight: 700; border-bottom: 1px solid #e2e8f0;">{formatted_date} at {formatted_time}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-size: 13px; font-weight: 600; border-bottom: 1px solid #e2e8f0;">Vehicle Requested</td>
                  <td style="color: #0f172a; font-size: 14px; font-weight: 700; border-bottom: 1px solid #e2e8f0;">{lead.vehicle_type.upper()}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-size: 13px; font-weight: 600; border-bottom: 1px solid #e2e8f0;">Distance / Fare</td>
                  <td style="color: #16a34a; font-size: 15px; font-weight: 800; border-bottom: 1px solid #e2e8f0;">₹{lead.estimated_fare} <span style="font-size: 12px; color: #64748b; font-weight: normal;">({lead.distance_km} km)</span></td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-size: 13px; font-weight: 600;">Requirements</td>
                  <td style="color: #0f172a; font-size: 13px;">{lead.requirements or 'None'}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Action Button -->
          <tr>
            <td style="padding: 0 32px 32px; text-align: center;">
              <a href="https://pondytourstravels.vercel.app/admin" style="display: inline-block; background-color: #0066cc; color: #ffffff; padding: 14px 32px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,102,204,0.3);">
                Open Dispatch Portal to Assign Driver &rarr;
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
              Pondy Tours &amp; Travels Automated Dispatch Engine &bull; 123 Beach Road, White Town, Pondicherry
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        """.strip()

        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=from_email_str,
            to=[recipient],
            connection=backend
        )
        msg.attach_alternative(html_content, "text/html")
        _send_async(msg)
        return True
    except Exception as e:
        logger.error(f"Error preparing admin notification email: {e}")
        return False


def send_booking_confirmation_customer_email(booking):
    """
    Sends an automated booking confirmation email to the customer
    when the booking status is changed to 'confirmed' or 'driver_assigned'.
    """
    try:
        config = SMTPSettings.get_settings()
        if not config.is_active or not config.notify_customer_on_confirmed:
            return False

        lead = booking.lead
        if not lead.customer_email:
            logger.info(f"Booking {booking.booking_id} has no customer email. Skipping customer notification.")
            return False

        backend = get_smtp_backend(config)
        if not backend:
            logger.warning("SMTP credentials not configured in SMTPSettings. Skipping customer confirmation email.")
            return False

        subject = f"Booking Confirmed! 🚖 Pondy Tours & Travels — Voucher #{booking.booking_id}"
        from_email_str = f"{config.from_name} <{config.from_email}>"

        trip_type_label = "Round Trip" if lead.trip_type == "round" else "One-Way Trip"
        formatted_date = str(lead.travel_date)
        formatted_time = str(lead.preferred_time)

        fare = float(booking.actual_fare or lead.estimated_fare)
        advance = float(booking.advance_paid)
        balance = float(booking.balance_amount) if booking.balance_amount else max(0.0, fare - advance)

        driver_info_text = ""
        if booking.driver_name:
            driver_info_text = f"Driver Assigned: {booking.driver_name} ({booking.driver_phone or 'Phone on call'}) | Vehicle No: {booking.vehicle_number or 'Standard Cab'}"
        else:
            driver_info_text = "Driver & vehicle number will be shared via SMS/WhatsApp prior to pickup."

        text_content = f"""
Dear {lead.customer_name},

Your taxi booking with Pondy Tours & Travels is CONFIRMED!

Booking ID: {booking.booking_id}
Status: Confirmed

Trip Summary:
-------------
From: {lead.pickup}
To: {lead.drop}
Date: {formatted_date}
Time: {formatted_time}
Trip Type: {trip_type_label}
Vehicle: {lead.vehicle_type.upper()}

Driver & Cab Details:
---------------------
{driver_info_text}

Fare & Payment:
---------------
Total Fare: Rs. {fare:.2f}
Advance Paid: Rs. {advance:.2f}
Balance Payable to Driver: Rs. {balance:.2f}

24/7 Customer Support: +91 63740 70342 | pondytourstravels@gmail.com
Thank you for choosing Pondy Tours & Travels!
        """.strip()

        html_content = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Booking Confirmed - Pondy Tours &amp; Travels</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f6fc; color: #1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 24px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          <!-- Header -->
          <tr>
            <td style="background-color: #0066cc; padding: 28px 32px; text-align: left;">
              <table width="100%">
                <tr>
                  <td>
                    <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">
                      PONDY TOURS &amp; TRAVELS
                    </h1>
                    <p style="margin: 4px 0 0; color: #dbeafe; font-size: 13px; font-weight: 600;">
                      Official Booking Confirmation Voucher
                    </p>
                  </td>
                  <td align="right">
                    <span style="background-color: #10b981; color: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase;">
                      CONFIRMED
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 24px 32px 16px;">
              <p style="margin: 0; font-size: 16px; color: #0f172a; font-weight: 700;">
                Dear {lead.customer_name},
              </p>
              <p style="margin: 8px 0 0; font-size: 14px; color: #475569; line-height: 1.6;">
                Thank you for choosing Pondy Tours &amp; Travels. Your outstation taxi booking has been successfully confirmed. Please review your itinerary below.
              </p>
            </td>
          </tr>

          <!-- Voucher Details -->
          <tr>
            <td style="padding: 0 32px 20px;">
              <table width="100%" cellpadding="10" cellspacing="0" style="border-collapse: collapse; background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0;">
                <tr>
                  <td width="35%" style="color: #64748b; font-size: 13px; font-weight: 600; border-bottom: 1px solid #e2e8f0;">Booking ID</td>
                  <td style="color: #0066cc; font-size: 15px; font-weight: 800; border-bottom: 1px solid #e2e8f0;">{booking.booking_id}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-size: 13px; font-weight: 600; border-bottom: 1px solid #e2e8f0;">Pickup Location</td>
                  <td style="color: #0f172a; font-size: 14px; font-weight: 700; border-bottom: 1px solid #e2e8f0;">{lead.pickup}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-size: 13px; font-weight: 600; border-bottom: 1px solid #e2e8f0;">Drop Destination</td>
                  <td style="color: #0f172a; font-size: 14px; font-weight: 700; border-bottom: 1px solid #e2e8f0;">{lead.drop}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-size: 13px; font-weight: 600; border-bottom: 1px solid #e2e8f0;">Travel Date &amp; Time</td>
                  <td style="color: #0f172a; font-size: 14px; font-weight: 700; border-bottom: 1px solid #e2e8f0;">{formatted_date} at {formatted_time}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-size: 13px; font-weight: 600; border-bottom: 1px solid #e2e8f0;">Trip Type</td>
                  <td style="color: #0f172a; font-size: 14px; font-weight: 700; border-bottom: 1px solid #e2e8f0;">{trip_type_label}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-size: 13px; font-weight: 600;">Vehicle Selected</td>
                  <td style="color: #0f172a; font-size: 14px; font-weight: 700;">{lead.vehicle_type.upper()}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Driver Assignment Box -->
          <tr>
            <td style="padding: 0 32px 20px;">
              <table width="100%" cellpadding="14" cellspacing="0" style="border-collapse: collapse; background-color: #eff6ff; border-radius: 10px; border: 1px solid #bfdbfe;">
                <tr>
                  <td>
                    <h3 style="margin: 0 0 8px; font-size: 13px; color: #1e40af; text-transform: uppercase; letter-spacing: 0.5px;">Driver &amp; Vehicle Allocation</h3>
                    {"<p style='margin: 0; font-size: 14px; color: #0f172a;'><strong>Driver:</strong> " + booking.driver_name + " &bull; <a href='tel:" + (booking.driver_phone or "") + "' style='color:#0066cc; font-weight:bold; text-decoration:none;'>" + (booking.driver_phone or "") + "</a><br><strong>Vehicle No:</strong> " + (booking.vehicle_number or "Standard Cab") + "</p>" if booking.driver_name else "<p style='margin: 0; font-size: 13px; color: #1e3a8a;'>Driver and vehicle details will be assigned and shared via WhatsApp/SMS prior to pickup.</p>"}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Fare Breakdown -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <h3 style="margin: 0 0 12px; font-size: 14px; color: #0f172a; text-transform: uppercase;">Payment Details</h3>
              <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse: collapse; background-color: #f8fafc; border-radius: 8px;">
                <tr>
                  <td style="color: #64748b; font-size: 13px; border-bottom: 1px solid #e2e8f0;">Agreed Total Fare</td>
                  <td align="right" style="color: #0f172a; font-size: 14px; font-weight: 700; border-bottom: 1px solid #e2e8f0;">₹{fare:.2f}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-size: 13px; border-bottom: 1px solid #e2e8f0;">Advance Paid</td>
                  <td align="right" style="color: #16a34a; font-size: 14px; font-weight: 700; border-bottom: 1px solid #e2e8f0;">₹{advance:.2f}</td>
                </tr>
                <tr>
                  <td style="color: #0f172a; font-size: 14px; font-weight: 800;">Balance Payable to Driver</td>
                  <td align="right" style="color: #0066cc; font-size: 16px; font-weight: 800;">₹{balance:.2f}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Contact Support -->
          <tr>
            <td style="padding: 0 32px 28px; text-align: center;">
              <div style="background-color: #f1f5f9; padding: 16px; border-radius: 10px;">
                <p style="margin: 0; font-size: 13px; color: #475569; font-weight: 600;">Need any assistance with your ride?</p>
                <p style="margin: 6px 0 0; font-size: 15px; color: #0f172a; font-weight: 800;">
                  Call 24/7 Helpline: <a href="tel:+916374070342" style="color: #0066cc; text-decoration: none;">+91 63740 70342</a>
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
              Pondy Tours &amp; Travels &bull; 123 Beach Road, White Town, Pondicherry 605001<br>
              Email: pondytourstravels@gmail.com
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        """.strip()

        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=from_email_str,
            to=[lead.customer_email],
            connection=backend
        )
        msg.attach_alternative(html_content, "text/html")
        _send_async(msg)
        return True
    except Exception as e:
        logger.error(f"Error preparing customer confirmation email: {e}")
        return False


def send_smtp_test_email(test_to_email=None, override_config=None):
    """
    Sends a test verification email using configured or overridden parameters.
    """
    config = SMTPSettings.get_settings()

    host = config.smtp_host
    port = config.smtp_port
    user = config.smtp_user
    password = config.smtp_password
    use_tls = config.use_tls
    use_ssl = config.use_ssl
    from_name = config.from_name
    from_email = config.from_email

    if override_config:
        if override_config.get('smtpHost'): host = override_config['smtpHost'].strip()
        if override_config.get('smtpPort'): port = int(override_config['smtpPort'])
        if override_config.get('smtpUser'): user = override_config['smtpUser'].strip()
        if override_config.get('smtpPassword'): password = override_config['smtpPassword'].strip()
        if 'useTls' in override_config: use_tls = bool(override_config['useTls'])
        if 'useSsl' in override_config: use_ssl = bool(override_config['useSsl'])
        if override_config.get('fromName'): from_name = override_config['fromName'].strip()
        if override_config.get('fromEmail'): from_email = override_config['fromEmail'].strip()

    if not user or not password:
        return False, "SMTP Username or App Password is missing. Please enter your email and App Password."

    recipient = test_to_email or (override_config and override_config.get('adminNotificationEmail')) or config.admin_notification_email or from_email
    if not recipient:
        return False, "No recipient email address specified for test."

    subject = "🧪 SMTP Test Verification - Pondy Tours & Travels"
    from_email_str = f"{from_name} <{from_email}>"
    body = f"""
Hello,

This is a test verification email from Pondy Tours & Travels Admin Dashboard.
Your SMTP connection ({host}:{port}) is working properly!

Timestamp: Automated Test Dispatched
Admin Alert Receiver: {recipient}
    """.strip()

    try:
        backend = EmailBackend(
            host=host,
            port=port,
            username=user,
            password=password,
            use_tls=use_tls,
            use_ssl=use_ssl,
            timeout=12,
            fail_silently=False,
        )
        msg = EmailMultiAlternatives(
            subject=subject,
            body=body,
            from_email=from_email_str,
            to=[recipient],
            connection=backend
        )
        msg.send(fail_silently=False)
        return True, f"Test email successfully sent to {recipient}!"
    except Exception as e:
        return False, str(e)

