/* eslint-disable @next/next/no-head-element, @next/next/no-img-element */
import { getSiteUrl } from "../lib/site-url";

type MealPreferenceEmailProps = {
  inviteCode: string;
  mealPreferenceUrl: string;
  assetBaseUrl?: string;
};

const previewText = "Please submit your selection by 28 August 2026.";

const colors = {
  background: "#ffffff",
  card: "#f8f5f2",
  foreground: "#1b7a50",
  border: "#1b7a50",
};

export function MealPreferenceEmail({
  inviteCode,
  mealPreferenceUrl,
  assetBaseUrl,
}: MealPreferenceEmailProps) {
  const imageBaseUrl = (assetBaseUrl ?? getSiteUrl()).replace(/\/$/, "");
  const detailsUrl = new URL("/#details", imageBaseUrl).toString();
  const headerImageSrc = `${imageBaseUrl}/email/email-header-meals.png`;

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

                {/* Replace this paragraph with the meal-preference email copy. */}
                <p
                  style={{
                    margin: "0 auto 30px",
                    maxWidth: "420px",
                    fontSize: "20px",
                    lineHeight: 1.45,
                    color: colors.foreground,
                  }}
                >
                  We&apos;re so excited to celebrate with you&nbsp;in&nbsp;October.
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
                  It&apos;s time to select your meal. Please submit your selection by <strong>28&nbsp;August&nbsp;2026</strong>.
                </p>

                <p
                  style={{
                    margin: "0 auto 30px",
                    maxWidth: "420px",
                    fontSize: "20px",
                    lineHeight: 1.45,
                    color: colors.foreground,
                    fontStyle: "italic"
                  }}
                >
                  While you&apos;re there, take a peek at{" "}
                  <a
                    href={detailsUrl}
                    style={{
                      color: colors.foreground,
                      fontWeight: 700,
                      textDecoration: "underline",
                    }}
                  >
                    The Details
                  </a>{" "}
                  for venue info, dress code, and more.
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
                          href={mealPreferenceUrl}
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
                          Select Meal
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}
