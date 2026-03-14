/* eslint-disable @next/next/no-head-element, @next/next/no-img-element */
import { getSiteUrl } from "../lib/site-url";

type WeddingInviteProps = {
  firstName?: string | null;
  inviteCode: string;
  rsvpUrl: string;
  assetBaseUrl?: string;
};

const previewText = "You're invited to celebrate Mac and CJ.";

const colors = {
  background: "#ffffff",
  card: "#f8f5f2",
  foreground: "#1b7a50",
  border: "#1b7a50",
};

export function WeddingInvite({
  inviteCode,
  rsvpUrl,
  assetBaseUrl,
}: WeddingInviteProps) {
  const imageBaseUrl = (assetBaseUrl ?? getSiteUrl()).replace(/\/$/, "");
  const headerImageSrc = `${imageBaseUrl}/email/email-header.png`;
  const footerImageSrc = `${imageBaseUrl}/email/email-footer.png`;

  return (
    <html>
      <head>
        <meta name="color-scheme" content="light only" />
        <meta name="supported-color-schemes" content="light only" />
      </head>
      <body
        style={{
          margin: 0,
          padding: "24px 12px",
          backgroundColor: colors.background,
          color: colors.foreground,
          fontFamily: "Arial, Helvetica, sans-serif",
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
          style={{ width: "100%", maxWidth: "620px", margin: "0 auto" }}
        >
          <tbody>
            <tr>
              <td
                style={{
                  backgroundColor: colors.card,
                  padding: "42px 32px 36px",
                  textAlign: "center",
                  width: "100%",
                  maxWidth: "620px",
                  boxSizing: "border-box",
                }}
              >
                <img
                  src={headerImageSrc}
                  alt="Mac and CJ wedding logo"
                  width="360"
                  height="169"
                  style={{
                    display: "block",
                    width: "360px",
                    maxWidth: "100%",
                    height: "auto",
                    margin: "0 auto 34px",
                    border: 0,
                    outline: "none",
                    textDecoration: "none",
                  }}
                />

                <p
                  style={{
                    margin: "0 auto 34px",
                    maxWidth: "420px",
                    fontSize: "20px",
                    lineHeight: 1.45,
                    color: colors.foreground,
                  }}
                >
                  We joyfully invite you to celebrate the wedding&nbsp;of&nbsp;Mac&nbsp;&amp;&nbsp;CJ.
                </p>

                <p
                  style={{
                    margin: "0 auto 34px",
                    maxWidth: "360px",
                    fontSize: "20px",
                    lineHeight: 1.45,
                    fontWeight: 700,
                    color: colors.foreground,
                  }}
                >
                  Friday 16 October 2026
                  <br />
                  The Broadview Hotel
                  <br />
                  Toronto, Ontario
                </p>

                <p
                  style={{
                    margin: "0 auto 26px",
                    maxWidth: "420px",
                    fontSize: "20px",
                    lineHeight: 1.45,
                    color: colors.foreground,
                  }}
                >
                  For event details and to RSVP, please visit&nbsp;our&nbsp;website.
                </p>

                <p
                  style={{
                    margin: "0 auto 34px",
                    maxWidth: "360px",
                    fontSize: "20px",
                    lineHeight: 1.45,
                    fontWeight: 700,
                    color: colors.foreground,
                  }}
                >
                  Please RSVP by 16 April 2026.
                </p>

                <p
                  style={{
                    margin: "0 auto 30px",
                    maxWidth: "420px",
                    fontSize: "20px",
                    lineHeight: 1.45,
                    color: colors.foreground,
                  }}
                >
                  Your invite code:{" "}
                  <span style={{ fontWeight: 700 }}>{inviteCode}</span>
                </p>

                <table
                  role="presentation"
                  cellPadding="0"
                  cellSpacing="0"
                  width="100%"
                  style={{ width: "100%", maxWidth: "420px", margin: "0 auto 42px" }}
                >
                  <tbody>
                    <tr>
                      <td
                        style={{
                          width: "100%",
                          borderRadius: "4px",
                          border: `2px solid ${colors.border}`,
                          backgroundColor: "transparent",
                        }}
                      >
                        <a
                          href={rsvpUrl}
                          style={{
                            display: "inline-block",
                            width: "100%",
                            maxWidth: "420px",
                            padding: "15px 28px",
                            boxSizing: "border-box",
                            fontSize: "20px",
                            letterSpacing: "0.18em",
                            textTransform: "uppercase",
                            color: colors.foreground,
                            textDecoration: "none",
                          }}
                        >
                          RSVP
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <img
                  src={footerImageSrc}
                  alt="Illustration of The Broadview Hotel"
                  width="304"
                  height="376"
                  style={{
                    display: "block",
                    width: "430px",
                    maxWidth: "100%",
                    height: "auto",
                    margin: "0 auto 34px",
                    border: 0,
                    outline: "none",
                    textDecoration: "none",
                  }}
                />

                <p
                  style={{
                    margin: 0,
                    fontSize: "19px",
                    lineHeight: 1.5,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: colors.foreground,
                  }}
                >
                  We can&apos;t wait to celebrate&nbsp;with&nbsp;you.
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}
