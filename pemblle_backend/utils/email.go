package utils

import (
	"fmt"
	"log"
	"net/smtp"
	"os"
)

// Modern email template wrapper with beautiful design
func getEmailTemplate(title, content, buttonText, buttonLink, footerText string) string {
	fromName := os.Getenv("SMTP_FROM_NAME")
	if fromName == "" {
		fromName = "PemBlle"
	}

	return fmt.Sprintf(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>%s</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f0f14; color: #ffffff;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%%" style="background-color: #0f0f14;">
        <tr>
            <td style="padding: 40px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%%" style="max-width: 500px; margin: 0 auto;">
                    <!-- Logo Header -->
                    <tr>
                        <td style="text-align: center; padding-bottom: 30px;">
                            <div style="display: inline-block; background: linear-gradient(135deg, #667eea 0%%, #764ba2 50%%, #f093fb 100%%); padding: 15px 30px; border-radius: 16px;">
                                <span style="font-size: 28px; font-weight: 800; color: white; letter-spacing: -0.5px;">%s</span>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Main Card -->
                    <tr>
                        <td>
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%%" style="background: linear-gradient(180deg, #1a1a24 0%%, #13131a 100%%); border-radius: 24px; border: 1px solid #2a2a3a; overflow: hidden;">
                                <!-- Gradient Header Bar -->
                                <tr>
                                    <td style="height: 6px; background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);"></td>
                                </tr>
                                
                                <!-- Content -->
                                <tr>
                                    <td style="padding: 40px 35px;">
                                        <!-- Title -->
                                        <h1 style="margin: 0 0 20px 0; font-size: 26px; font-weight: 700; color: #ffffff; text-align: center;">%s</h1>
                                        
                                        <!-- Body Content -->
                                        <div style="color: #a0a0b0; font-size: 16px; line-height: 1.7; text-align: center; margin-bottom: 30px;">
                                            %s
                                        </div>
                                        
                                        <!-- CTA Button -->
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%%">
                                            <tr>
                                                <td style="text-align: center;">
                                                    <a href="%s" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 12px; box-shadow: 0 8px 20px rgba(102, 126, 234, 0.35);">
                                                        %s
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 20px; text-align: center;">
                            <p style="margin: 0 0 10px 0; color: #606070; font-size: 13px;">%s</p>
                            <p style="margin: 0; color: #404050; font-size: 12px;">
                                © 2024 %s. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`, title, fromName, title, content, buttonLink, buttonText, footerText, fromName)
}

func SendEmail(toEmail, subjectText, bodyContent string) error {
	from := os.Getenv("SMTP_USER")
	password := os.Getenv("SMTP_PASS")
	host := os.Getenv("SMTP_HOST")
	port := os.Getenv("SMTP_PORT")
	fromName := os.Getenv("SMTP_FROM_NAME")

	if host == "" || port == "" || from == "" || password == "" {
		return fmt.Errorf("SMTP configuration incomplete")
	}

	addr := fmt.Sprintf("%s:%s", host, port)

	header := fmt.Sprintf("From: %s <%s>\r\nTo: %s\r\nSubject: %s\r\n", fromName, from, toEmail, subjectText)
	mime := "MIME-version: 1.0;\r\nContent-Type: text/html; charset=\"UTF-8\";\r\n\r\n"

	msg := []byte(header + mime + bodyContent)

	auth := smtp.PlainAuth("", from, password, host)

	log.Printf("📧 Sending email to %s subject: %s", toEmail, subjectText)
	return smtp.SendMail(addr, auth, from, []string{toEmail}, msg)
}

func SendVerificationEmail(toEmail, token string) error {
	fromName := os.Getenv("SMTP_FROM_NAME")
	if fromName == "" {
		fromName = "PemBlle"
	}
	baseURL := os.Getenv("FRONTEND_URL")
	if baseURL == "" {
		baseURL = "http://localhost:5173"
	}
	verificationLink := fmt.Sprintf("%s/verify?token=%s", baseURL, token)

	content := `
		<p style="margin: 0 0 15px 0;">Welcome to the community! 🎉</p>
		<p style="margin: 0 0 15px 0;">We're excited to have you on board. Please verify your email address to unlock all features and start receiving anonymous messages.</p>
		<p style="margin: 0; color: #808090; font-size: 14px;">This link will expire in 24 hours.</p>
	`

	body := getEmailTemplate(
		"Verify Your Email ✨",
		content,
		"Verify Email Address",
		verificationLink,
		"If you didn't create an account, you can safely ignore this email.",
	)

	return SendEmail(toEmail, "Verify your Email - "+fromName, body)
}

func SendNewTellEmail(toEmail string) error {
	fromName := os.Getenv("SMTP_FROM_NAME")
	if fromName == "" {
		fromName = "PemBlle"
	}
	baseURL := os.Getenv("FRONTEND_URL")
	if baseURL == "" {
		baseURL = "http://localhost:5173"
	}

	content := `
		<p style="margin: 0 0 15px 0;">🎁 Someone sent you an anonymous message!</p>
		<p style="margin: 0 0 15px 0;">You have a new Tell waiting for you. Log in to read it and share your answer with your followers.</p>
		<p style="margin: 0; color: #808090; font-size: 14px;">Who could it be? 🤔</p>
	`

	body := getEmailTemplate(
		"New Anonymous Tell! 💬",
		content,
		"View Your Tell",
		baseURL,
		"You received this email because someone sent you a message.",
	)

	return SendEmail(toEmail, "You have a new Tell! - "+fromName, body)
}

func SendTellAnsweredEmail(toEmail string) error {
	fromName := os.Getenv("SMTP_FROM_NAME")
	if fromName == "" {
		fromName = "PemBlle"
	}
	baseURL := os.Getenv("FRONTEND_URL")
	if baseURL == "" {
		baseURL = "http://localhost:5173"
	}

	content := `
		<p style="margin: 0 0 15px 0;">Great news! 🎉</p>
		<p style="margin: 0 0 15px 0;">Your anonymous message has been answered! Check out what they had to say.</p>
		<p style="margin: 0; color: #808090; font-size: 14px;">Keep the conversation going!</p>
	`

	body := getEmailTemplate(
		"Your Tell Was Answered! ✅",
		content,
		"See The Answer",
		baseURL,
		"You received this because your message was answered.",
	)

	return SendEmail(toEmail, "Your Tell was answered! - "+fromName, body)
}

func SendNewReplyEmail(toEmail string) error {
	fromName := os.Getenv("SMTP_FROM_NAME")
	if fromName == "" {
		fromName = "PemBlle"
	}
	baseURL := os.Getenv("FRONTEND_URL")
	if baseURL == "" {
		baseURL = "http://localhost:5173"
	}

	content := `
		<p style="margin: 0 0 15px 0;">The conversation continues! 💬</p>
		<p style="margin: 0 0 15px 0;">Someone replied to your answer. Check it out and keep the discussion going.</p>
		<p style="margin: 0; color: #808090; font-size: 14px;">Your community is engaging with you!</p>
	`

	body := getEmailTemplate(
		"New Reply to Your Answer 🔔",
		content,
		"View Reply",
		baseURL,
		"You received this because there's a new reply to your answer.",
	)

	return SendEmail(toEmail, "New reply to your answer - "+fromName, body)
}
