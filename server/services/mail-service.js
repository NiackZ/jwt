import nodemailer from 'nodemailer'
import { google } from 'googleapis'

class MailService {

	async sendActivationMail(to, link) {
		console.log('Sending mail...');

		const REDIRECT_URI = 'https://developers.google.com/oauthplayground'
		const oAuth2Client = new google.auth.OAuth2(
			process.env.OAUTH_CLIENT_ID,
			process.env.OAUTH_CLIENT_SECRET,
			REDIRECT_URI
		)
		oAuth2Client.setCredentials({ refresh_token: process.env.OAUTH_REFRESH_TOKEN })
		const accessToken = await oAuth2Client.getAccessToken();

		const transport = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				type: "OAuth2",
				user: process.env.SMTP_USER,
				clientId: process.env.OAUTH_CLIENT_ID,
				clientSecret: process.env.OAUTH_CLIENT_SECRET,
				refreshToken: process.env.OAUTH_REFRESH_TOKEN,
				accessToken,
			}
		})
		await transport.sendMail({
			from: process.env.SMTP_USER,
			to,
			subject: 'Активация аккаунта ' + process.env.API_URL,
			text: '',
			html: `
			
				<div>
					<h1>Для активации перейдите по ссылке</h1>
					<a style="color:red" href=${link}>Активировать</a>
				</div>
			`
		})
		console.log('Sended!');
	}
}
export default new MailService()