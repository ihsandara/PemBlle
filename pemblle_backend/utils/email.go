package utils

import (
	"fmt"
	"log"
	"net/smtp"
	"os"
)

// Modern email template wrapper with beautiful design
func getEmailTemplate(title, content, buttonText, buttonLink, footerText, icon string) string {
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
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0f; color: #ffffff; -webkit-font-smoothing: antialiased;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%%" style="background: linear-gradient(180deg, #0a0a0f 0%%, #12121a 100%%); min-height: 100vh;">
        <tr>
            <td style="padding: 60px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%%" style="max-width: 480px; margin: 0 auto;">
                    
                    <!-- Logo -->
                    <tr>
                        <td style="text-align: center; padding-bottom: 40px;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                                <tr>
                                    <td style="background: linear-gradient(135deg, #8b5cf6 0%%, #a855f7 50%%, #d946ef 100%%); padding: 16px 32px; border-radius: 20px; box-shadow: 0 20px 40px rgba(139, 92, 246, 0.3);">
                                        <span style="font-size: 26px; font-weight: 800; color: white; letter-spacing: -0.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">%s</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Main Card -->
                    <tr>
                        <td>
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%%" style="background: linear-gradient(145deg, #1a1a24 0%%, #141419 100%%); border-radius: 28px; border: 1px solid rgba(139, 92, 246, 0.2); overflow: hidden; box-shadow: 0 25px 50px rgba(0,0,0,0.5), 0 0 100px rgba(139, 92, 246, 0.1);">
                                
                                <!-- Animated Gradient Header -->
                                <tr>
                                    <td style="height: 5px; background: linear-gradient(90deg, #8b5cf6, #a855f7, #d946ef, #ec4899, #d946ef, #a855f7, #8b5cf6); background-size: 200%% 100%%;"></td>
                                </tr>
                                
                                <!-- Icon Circle -->
                                <tr>
                                    <td style="padding: 45px 40px 0 40px; text-align: center;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                                            <tr>
                                                <td style="width: 80px; height: 80px; background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%%, rgba(168, 85, 247, 0.1) 100%%); border-radius: 24px; border: 1px solid rgba(139, 92, 246, 0.3); text-align: center; vertical-align: middle;">
                                                    <span style="font-size: 36px; line-height: 80px;">%s</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                
                                <!-- Content -->
                                <tr>
                                    <td style="padding: 30px 40px 45px 40px;">
                                        <!-- Title -->
                                        <h1 style="margin: 0 0 20px 0; font-size: 28px; font-weight: 700; color: #ffffff; text-align: center; letter-spacing: -0.5px; line-height: 1.3;">%s</h1>
                                        
                                        <!-- Divider -->
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="60" style="margin: 0 auto 25px auto;">
                                            <tr>
                                                <td style="height: 3px; background: linear-gradient(90deg, #8b5cf6, #d946ef); border-radius: 2px;"></td>
                                            </tr>
                                        </table>
                                        
                                        <!-- Body Content -->
                                        <div style="color: #9ca3af; font-size: 16px; line-height: 1.8; text-align: center; margin-bottom: 35px;">
                                            %s
                                        </div>
                                        
                                        <!-- CTA Button -->
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%%">
                                            <tr>
                                                <td style="text-align: center;">
                                                    <a href="%s" style="display: inline-block; padding: 18px 48px; background: linear-gradient(135deg, #8b5cf6 0%%, #a855f7 50%%, #d946ef 100%%); color: #ffffff; text-decoration: none; font-weight: 700; font-size: 16px; border-radius: 16px; box-shadow: 0 10px 30px rgba(139, 92, 246, 0.4), 0 0 0 1px rgba(255,255,255,0.1) inset; letter-spacing: 0.3px;">
                                                        %s →
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                
                                <!-- Card Footer -->
                                <tr>
                                    <td style="padding: 20px 40px; background: rgba(139, 92, 246, 0.05); border-top: 1px solid rgba(139, 92, 246, 0.1);">
                                        <p style="margin: 0; color: #6b7280; font-size: 13px; text-align: center; line-height: 1.6;">%s</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 40px 20px 20px 20px; text-align: center;">
                            <p style="margin: 0 0 8px 0; color: #4b5563; font-size: 13px;">
                                Made with 💜 by the %s team
                            </p>
                            <p style="margin: 0; color: #374151; font-size: 12px;">
                                © %d %s. All rights reserved.
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`, title, fromName, icon, title, content, buttonLink, buttonText, footerText, fromName, 2024, fromName)
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
		"Verify Your Email",
		content,
		"Verify Email Address",
		verificationLink,
		"If you didn't create an account, you can safely ignore this email.",
		"✉️",
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
		"New Anonymous Tell!",
		content,
		"View Your Tell",
		baseURL,
		"You received this email because someone sent you a message.",
		"💬",
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
		"Your Tell Was Answered!",
		content,
		"See The Answer",
		baseURL,
		"You received this because your message was answered.",
		"✅",
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
		"New Reply to Your Answer",
		content,
		"View Reply",
		baseURL,
		"You received this because there's a new reply to your answer.",
		"🔔",
	)

	return SendEmail(toEmail, "New reply to your answer - "+fromName, body)
}

func SendNewFollowerEmail(toEmail string, followerName string, isAnonymous bool) error {
	fromName := os.Getenv("SMTP_FROM_NAME")
	if fromName == "" {
		fromName = "PemBlle"
	}
	baseURL := os.Getenv("FRONTEND_URL")
	if baseURL == "" {
		baseURL = "http://localhost:5173"
	}

	var content string
	var title string
	var icon string

	if isAnonymous {
		title = "Someone New is Following You!"
		icon = "👻"
		content = `
			<p style="margin: 0 0 15px 0;">You have a new anonymous follower! 🎭</p>
			<p style="margin: 0 0 15px 0;">Someone decided to follow you secretly. They'll see your public answers but chose to keep their identity hidden.</p>
			<p style="margin: 0; color: #808090; font-size: 14px;">Mystery adds excitement! 🔮</p>
		`
	} else {
		title = "You Have a New Follower!"
		icon = "🎉"
		content = fmt.Sprintf(`
			<p style="margin: 0 0 15px 0;">Great news! <strong style="color: #a855f7;">%s</strong> is now following you! 🌟</p>
			<p style="margin: 0 0 15px 0;">Your community is growing! Keep sharing amazing content and engaging with your followers.</p>
			<p style="margin: 0; color: #808090; font-size: 14px;">Your audience loves you! 💜</p>
		`, followerName)
	}

	body := getEmailTemplate(
		title,
		content,
		"View Your Profile",
		baseURL+"/profile",
		"You received this because someone started following you.",
		icon,
	)

	return SendEmail(toEmail, title+" - "+fromName, body)
}
