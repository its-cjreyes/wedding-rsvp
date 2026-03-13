type WeddingInviteProps = {
  firstName?: string | null;
  inviteCode: string;
  rsvpUrl: string;
};

const previewText = "You're invited to celebrate Mac and CJ.";

const colors = {
  background: "#f7f1ec",
  card: "#fffdfb",
  foreground: "#1b7a50",
  muted: "#5f6d64",
  border: "#dfe8e1",
};

export function WeddingInvite({
  firstName,
  inviteCode,
  rsvpUrl,
}: WeddingInviteProps) {
  const greetingName = firstName?.trim() || "there";

  return (
    <html>
      <body
        style={{
          margin: 0,
          padding: "24px 12px",
          backgroundColor: colors.background,
          color: colors.foreground,
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        <div style={{ display: "none", maxHeight: 0, overflow: "hidden", opacity: 0 }}>
          {previewText}
        </div>

        <table
          role="presentation"
          cellPadding="0"
          cellSpacing="0"
          width="100%"
          style={{ maxWidth: "640px", margin: "0 auto" }}
        >
          <tbody>
            <tr>
              <td
                style={{
                  backgroundColor: colors.card,
                  border: `1px solid ${colors.border}`,
                  borderRadius: "18px",
                  padding: "40px 32px",
                }}
              >
                <p
                  style={{
                    margin: "0 0 12px",
                    fontFamily: "Arial, Helvetica, sans-serif",
                    fontSize: "12px",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: colors.muted,
                  }}
                >
                  Wedding Invitation
                </p>

                <h1 style={{ margin: "0 0 20px", fontSize: "40px", fontWeight: 500 }}>
                  Mac and CJ
                </h1>

                <p
                  style={{
                    margin: "0 0 16px",
                    fontFamily: "Arial, Helvetica, sans-serif",
                    fontSize: "16px",
                    lineHeight: 1.6,
                    color: colors.foreground,
                  }}
                >
                  Hi {greetingName},
                </p>

                <p
                  style={{
                    margin: "0 0 16px",
                    fontFamily: "Arial, Helvetica, sans-serif",
                    fontSize: "16px",
                    lineHeight: 1.6,
                    color: colors.foreground,
                  }}
                >
                  We&apos;re so happy to invite you to celebrate our wedding.
                </p>

                <p
                  style={{
                    margin: "0 0 24px",
                    fontFamily: "Arial, Helvetica, sans-serif",
                    fontSize: "16px",
                    lineHeight: 1.6,
                    color: colors.foreground,
                  }}
                >
                  Friday, October 16, 2026
                  <br />
                  The Broadview Hotel
                  <br />
                  Toronto, Ontario
                </p>

                <div
                  style={{
                    margin: "0 0 24px",
                    padding: "18px 20px",
                    borderRadius: "14px",
                    backgroundColor: "#f2f7f4",
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 8px",
                      fontFamily: "Arial, Helvetica, sans-serif",
                      fontSize: "13px",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: colors.muted,
                    }}
                  >
                    Your Invite Code
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontFamily: "Arial, Helvetica, sans-serif",
                      fontSize: "28px",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      color: colors.foreground,
                    }}
                  >
                    {inviteCode}
                  </p>
                </div>

                <table
                  role="presentation"
                  cellPadding="0"
                  cellSpacing="0"
                  style={{ marginBottom: "20px" }}
                >
                  <tbody>
                    <tr>
                      <td style={{ borderRadius: "999px", backgroundColor: colors.foreground }}>
                        <a
                          href={rsvpUrl}
                          style={{
                            display: "inline-block",
                            padding: "14px 24px",
                            fontFamily: "Arial, Helvetica, sans-serif",
                            fontSize: "15px",
                            fontWeight: 600,
                            color: "#fffdfb",
                            textDecoration: "none",
                          }}
                        >
                          RSVP on our website
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <p
                  style={{
                    margin: "0 0 12px",
                    fontFamily: "Arial, Helvetica, sans-serif",
                    fontSize: "14px",
                    lineHeight: 1.6,
                    color: colors.muted,
                  }}
                >
                  The RSVP page will open with your invite code filled in, but you&apos;ll still
                  need to review it and click Continue yourself.
                </p>

                <p
                  style={{
                    margin: 0,
                    fontFamily: "Arial, Helvetica, sans-serif",
                    fontSize: "14px",
                    lineHeight: 1.6,
                    color: colors.muted,
                  }}
                >
                  If the button does not work, copy and paste this link into your browser:
                  <br />
                  <a href={rsvpUrl} style={{ color: colors.foreground, wordBreak: "break-all" }}>
                    {rsvpUrl}
                  </a>
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}
