const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.verified = user.verified;
    this.from = `'Kurt <${process.env.EMAIL_FROM}>'`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Send in Blue
      nodemailer.createTransport({
        service: 'SendinBlue',
        host: process.env.SENDIN_BLUE_HOST,
        port: process.env.SENDIN_BLUE_PORT,
        auth: {
          user: process.env.SENDIN_BLUE_USERNAME,
          pass: process.env.SENDIN_BLUE_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // SEND THE ACTUAL EMAIL
  async sendEmail(template, subject) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    //  2) Define Email Options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html, { wordwrap: 130 }),
    };
    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.sendEmail('welcome', 'Welcome to the natours family');
  }

  async sendPasswordReset() {
    await this.sendEmail(
      'passwordReset',
      'Your password reset token (valid for 10mins)'
    );
  }
};
