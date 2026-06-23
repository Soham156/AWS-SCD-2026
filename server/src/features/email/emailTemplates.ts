interface ConfirmationEmailData {
  full_name: string;
  email: string;
  ticket_number: string;
  pass_name: string;
  download_url: string;
  ticket_page_url: string;
}

export function buildRegistrationConfirmationEmail(data: ConfirmationEmailData): { subject: string; html: string; text: string } {
  const { full_name, email, ticket_number, pass_name, download_url, ticket_page_url } = data;

  const subject = `🎟️ Your Ticket is Confirmed — AWS Student Community Day Dhule 2026`;

  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Ticket is Confirmed — AWS Student Community Day Dhule 2026</title>
</head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0f2f5;padding:32px 16px;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="600" cellpadding="0" cellspacing="0" border="0"
               style="background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- ═══ HEADER ═══ -->
          <tr>
            <td align="center" style="background:#0f1923;padding:32px 30px 28px;">

              <!-- Logo centered -->
              <img
                src="https://aws-scd-dhule.tech/scd-dhule-logo.avif"
                alt="AWS Student Community Day Dhule"
                width="180"
                style="display:block;margin:0 auto 16px;max-width:180px;"
              />

              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.3px;">
                AWS Student Community Day
              </h1>
              <p style="margin:6px 0 0;color:#FF9900;font-size:15px;font-weight:600;letter-spacing:1px;text-transform:uppercase;">
                Dhule &nbsp;·&nbsp; 2026
              </p>
            </td>
          </tr>

          <!-- ═══ SUCCESS BANNER ═══ -->
          <tr>
            <td style="background:#fff7ed;border-top:3px solid #FF9900;border-bottom:1px solid #fed7aa;padding:16px 30px;text-align:center;">
              <span style="font-size:17px;font-weight:700;color:#c2410c;">
                🎉 &nbsp;Registration Successful
              </span>
            </td>
          </tr>

          <!-- ═══ BODY ═══ -->
          <tr>
            <td style="padding:36px 36px 28px;">

              <p style="margin:0 0 12px;font-size:16px;line-height:1.6;color:#374151;">
                Hello <strong>${esc(full_name)}</strong>,
              </p>

              <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#4b5563;">
                Thank you for registering for <strong>AWS Student Community Day Dhule 2026</strong>.
                Your registration has been confirmed and your event ticket is ready below.
              </p>

              <p style="margin:0 0 28px;font-size:15px;line-height:1.8;color:#4b5563;">
                Join hundreds of students, developers, and cloud enthusiasts for a full day of
                technical sessions, hands-on learning, networking, and insights into modern cloud
                technologies and AI.
              </p>

              <!-- ═══ TICKET CARD ═══ -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                     style="border:2px dashed #FF9900;border-radius:10px;background:#fffbeb;margin-bottom:28px;">
                <tr>
                  <td style="padding:24px 28px;">

                    <!-- Ticket header -->
                    <h2 style="margin:0 0 18px;color:#92400e;font-size:18px;font-weight:700;">
                      🎟️ &nbsp;Event Ticket
                    </h2>

                    <!-- Divider -->
                    <hr style="border:none;border-top:1px dashed #f59e0b;margin:0 0 18px;" />

                    <!-- Ticket fields -->
                    <table width="100%" cellpadding="7" cellspacing="0" border="0">
                      <tr style="background:rgba(255,153,0,0.08);border-radius:6px;">
                        <td width="38%" style="font-size:13px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.5px;border-radius:6px 0 0 6px;">
                          Ticket ID
                        </td>
                        <td style="font-size:14px;color:#1f2937;font-weight:600;font-family:monospace;border-radius:0 6px 6px 0;">
                          ${esc(ticket_number)}
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size:13px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.5px;">
                          Name
                        </td>
                        <td style="font-size:14px;color:#374151;">
                          ${esc(full_name)}
                        </td>
                      </tr>
                      <tr style="background:rgba(255,153,0,0.08);">
                        <td style="font-size:13px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.5px;">
                          Email
                        </td>
                        <td style="font-size:14px;color:#374151;">
                          ${esc(email)}
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size:13px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.5px;">
                          Category
                        </td>
                        <td style="font-size:14px;color:#374151;">
                          ${esc(pass_name)}
                        </td>
                      </tr>
                      <tr style="background:rgba(255,153,0,0.08);">
                        <td style="font-size:13px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.5px;">
                          Date
                        </td>
                        <td style="font-size:14px;color:#374151;">
                          14 August 2026
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size:13px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.5px;">
                          Time
                        </td>
                        <td style="font-size:14px;color:#374151;">
                          9:00 AM Onwards
                        </td>
                      </tr>
                      <tr style="background:rgba(255,153,0,0.08);">
                        <td style="font-size:13px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.5px;">
                          Venue
                        </td>
                        <td style="font-size:14px;color:#374151;">
                          SVKM's Institute of Technology, Dhule
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

              <!-- ═══ VENUE LOCATION ═══ -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                     style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 14px;font-size:14px;font-weight:700;color:#0c4a6e;">
                      📍 &nbsp;Venue Location
                    </p>

                    <!-- Venue name + address -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;">
                      <tr>
                        <td>
                          <p style="margin:0;font-size:15px;font-weight:700;color:#0f172a;">
                            SVKM's Institute of Technology, Dhule
                          </p>
                          <p style="margin:4px 0 0;font-size:13px;color:#475569;line-height:1.6;">
                            SVKM's Institute of Technology, Nardana Road,<br>
                            Dhule, Maharashtra 424 001, India
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Static map preview (Removed as requested) -->

                    <!-- Direction buttons -->
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding-right:10px;">
                          <a href="https://maps.google.com/?q=SVKM+Institute+of+Technology+Dhule"
                             target="_blank"
                             style="background:#ffffff;color:#374151;text-decoration:none;padding:9px 16px;border-radius:6px;font-size:13px;font-weight:600;display:inline-block;border:1px solid #e5e7eb;vertical-align:middle;">
                            <img src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png"
                                 alt="Google" width="16" height="16"
                                 style="vertical-align:middle;margin-right:6px;display:inline-block;" />
                            <span style="vertical-align:middle;">Google Maps</span>
                          </a>
                        </td>
                        <td>
                          <a href="https://maps.apple/p/yY~~WHcrydco3q"
                             target="_blank"
                             style="background:#ffffff;color:#374151;text-decoration:none;padding:9px 16px;border-radius:6px;font-size:13px;font-weight:600;display:inline-block;border:1px solid #e5e7eb;vertical-align:middle;">
                            <img src="https://img.icons8.com/?size=100&id=95294&format=png&color=000000"
                                 alt="Apple Maps" width="16" height="16"
                                 style="vertical-align:middle;margin-right:6px;display:inline-block;border-radius:3px;" />
                            <span style="vertical-align:middle;">Apple Maps</span>
                          </a>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

              <!-- ═══ CTA BUTTONS ═══ -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;">
                <tr>
                  <td align="center">
                    <a href="${esc(download_url)}"
                       style="background:#FF9900;color:#111827;text-decoration:none;padding:14px 36px;border-radius:8px;font-weight:700;font-size:15px;display:inline-block;letter-spacing:0.2px;">
                      ⬇ Download Ticket &nbsp;
                    </a>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <a href="${esc(ticket_page_url)}"
                       style="background:#0f1923;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-weight:700;font-size:15px;display:inline-block;letter-spacing:0.2px;">
                      View My Ticket &nbsp;→
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:13px;color:#9ca3af;text-align:center;margin:0 0 32px;line-height:1.6;">
                If the buttons don't work, open:<br>
                <a href="${esc(ticket_page_url)}" style="color:#FF9900;word-break:break-all;">
                  ${esc(ticket_page_url)}
                </a>
              </p>

              <!-- ═══ IMPORTANT INFO ═══ -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                     style="background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#111827;">
                      📋 &nbsp;Important Information
                    </p>
                    <table cellpadding="5" cellspacing="0" border="0">
                      <tr>
                        <td style="font-size:13px;color:#6b7280;vertical-align:top;padding-right:6px;">✅</td>
                        <td style="font-size:13px;color:#4b5563;line-height:1.7;">Carry a valid Government ID or College ID for verification.</td>
                      </tr>
                      <tr>
                        <td style="font-size:13px;color:#6b7280;vertical-align:top;padding-right:6px;">✅</td>
                        <td style="font-size:13px;color:#4b5563;line-height:1.7;">Please arrive at least 30 minutes before the event starts.</td>
                      </tr>
                      <tr>
                        <td style="font-size:13px;color:#6b7280;vertical-align:top;padding-right:6px;">✅</td>
                        <td style="font-size:13px;color:#4b5563;line-height:1.7;">Your ticket contains a unique QR code required for check-in.</td>
                      </tr>
                      <tr>
                        <td style="font-size:13px;color:#6b7280;vertical-align:top;padding-right:6px;">✅</td>
                        <td style="font-size:13px;color:#4b5563;line-height:1.7;">Tickets are non-transferable unless approved by the organizing team.</td>
                      </tr>
                      <tr>
                        <td style="font-size:13px;color:#6b7280;vertical-align:top;padding-right:6px;">✅</td>
                        <td style="font-size:13px;color:#4b5563;line-height:1.7;">Keep this email accessible on the event day.</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- ═══ TAGLINE BAR ═══ -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;">
                <tr>
                  <td style="background:#fff7ed;border-left:4px solid #FF9900;border-radius:0 6px 6px 0;padding:14px 18px;">
                    <strong style="font-size:13px;color:#92400e;">AWS Student Community Day Dhule 2026</strong><br>
                    <span style="font-size:13px;color:#6b7280;line-height:1.7;">
                      A student-driven conference on Cloud Computing, AI, DevOps, Serverless, Security, and Innovation.
                    </span>
                  </td>
                </tr>
              </table>

              <!-- ═══ CONTACT ═══ -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;">
                <tr>
                  <td style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px 20px;text-align:center;">
                    <p style="margin:0;font-size:13px;color:#6b7280;">
                      Questions? Reach us at
                      <a href="mailto:info@aws-scd-dhule.tech"
                         style="color:#FF9900;font-weight:700;text-decoration:none;">
                        info@aws-scd-dhule.tech
                      </a>
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- ═══ FOOTER ═══ -->
          <tr>
            <td style="background:#0f1923;padding:28px 30px;text-align:center;">

              <img
                src="https://aws-scd-2026.vercel.app/AWS_Builder.png"
                alt="AWS Student Community Day"
                width="250"
                style="display:block;margin:0 auto 14px;max-width:250px;"
              />

              <p style="margin:0;color:#d1d5db;font-size:13px;font-weight:600;">
                AWS Student Community Day Dhule 2026
              </p>
              <p style="margin:6px 0 0;color:#9ca3af;font-size:12px;">
                Building the next generation of cloud innovators.
              </p>
              <p style="margin:16px 0 0;color:#4b5563;font-size:11px;">
                © 2026 AWS Student Community Day Dhule. All rights reserved.
              </p>

            </td>
          </tr>

        </table>
        <!-- /Card -->

      </td>
    </tr>
  </table>

</body>
</html>`;

  const text = `Your Ticket is Confirmed!
Hello ${full_name},

Thank you for registering for AWS Student Community Day Dhule 2026.
Your registration has been confirmed and your event ticket is ready.

Ticket ID: ${ticket_number}
Name: ${full_name}
Category: ${pass_name}

View your ticket online:
${ticket_page_url}

Download your ticket:
${download_url}

📋 Important Information:
- Carry a valid Government ID or College ID for verification.
- Please arrive at least 30 minutes before the event starts.
- Your ticket contains a unique QR code required for check-in.
- Keep this email accessible on the event day.

📍 Venue:
SVKM's Institute of Technology, Nardana Road, Dhule, Maharashtra 424 001, India

Questions? Reach us at info@aws-scd-dhule.tech`;

  return { subject, html, text };
}
