import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? 'noreply@sharo.fr',
    to,
    subject: 'zØmbie zØne — Réinitialisation de votre mot de passe',
    html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8" /><title>Réinitialisation mot de passe</title></head>
<body style="background:#1a1a1a;color:#e0e0e0;font-family:sans-serif;padding:40px 20px;margin:0;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid #c0392b;border-radius:8px;padding:40px;">
          <tr><td>
            <h1 style="color:#c0392b;font-size:24px;margin-bottom:8px;">zØmbie zØne</h1>
            <p style="color:#aaa;margin-bottom:24px;">Réinitialisation de votre mot de passe</p>
            <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
            <p>Ce lien est valable <strong>30 minutes</strong>. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
            <p style="margin:32px 0;text-align:center;">
              <a href="${resetUrl}" style="background:#c0392b;color:#fff;padding:12px 28px;border-radius:4px;text-decoration:none;font-weight:bold;display:inline-block;">
                Réinitialiser mon mot de passe
              </a>
            </p>
            <p style="font-size:12px;color:#666;">Ou copiez ce lien : ${resetUrl}</p>
          </td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  });
}

export async function sendVerificationEmail(to: string, verifyUrl: string): Promise<void> {
  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? 'noreply@sharo.fr',
    to,
    subject: 'zØmbie zØne — Confirmez votre adresse email',
    html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8" /><title>Confirmation email</title></head>
<body style="background:#1a1a1a;color:#e0e0e0;font-family:sans-serif;padding:40px 20px;margin:0;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid #c0392b;border-radius:8px;padding:40px;">
          <tr><td>
            <h1 style="color:#c0392b;font-size:24px;margin-bottom:8px;">zØmbie zØne</h1>
            <p style="color:#aaa;margin-bottom:24px;">Confirmation de votre adresse email</p>
            <p>Cliquez sur le bouton ci-dessous pour confirmer votre adresse email.</p>
            <p>Ce lien est valable <strong>24 heures</strong>. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
            <p style="margin:32px 0;text-align:center;">
              <a href="${verifyUrl}" style="background:#c0392b;color:#fff;padding:12px 28px;border-radius:4px;text-decoration:none;font-weight:bold;display:inline-block;">
                Confirmer mon adresse email
              </a>
            </p>
            <p style="font-size:12px;color:#666;">Ou copiez ce lien : ${verifyUrl}</p>
          </td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  });
}
