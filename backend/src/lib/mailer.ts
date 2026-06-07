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

function emailFooter(disclaimer?: string): string {
  const year = new Date().getFullYear();
  const frontendUrl = process.env.FRONTEND_URL ?? 'https://zombiezone.fr';
  const disclaimerHtml = disclaimer ? `<p style="font-size:12px;color:#aaa;margin:0 0 12px;">${disclaimer}</p>` : '';
  return `
          <tr><td style="border-top:1px solid #333;padding:24px 40px 32px;">
            ${disclaimerHtml}
            <p style="font-size:12px;color:#555;margin:0 0 4px;">
              E-mail envoyé par le site
              <a href="${frontendUrl}" style="color:#f1c40f;text-decoration:none;">${frontendUrl}</a>.
              zØmbie zØne respecte votre
              <a href="${frontendUrl}/confidentialite" style="color:#f1c40f;text-decoration:none;">Confidentialité</a>.
            </p>
            <p style="font-size:12px;color:#555;margin:0;">© ${year} the zØmbie zØne. Tous droits réservés.</p>
          </td></tr>`;
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? 'noreply@sharo.fr',
    to,
    subject: 'zØmbie zØne — Réinitialisation de votre mot de passe',
    html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8" /><title>Réinitialisation mot de passe</title></head>
<body style="background:#ffffff;color:#e0e0e0;font-family:sans-serif;padding:40px 20px;margin:0;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid #c0392b;border-radius:8px;">
          <tr><td style="padding:40px;">
            <h1 style="color:#c0392b;font-size:24px;margin-bottom:8px;">zØmbie zØne</h1>
            <p style="color:#aaa;margin-bottom:24px;">Réinitialisation de votre mot de passe</p>
            <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
            <p>Ce lien est valable <strong>30 minutes</strong>. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
            <p style="margin:32px 0;text-align:center;">
              <a href="${resetUrl}" style="background:#f1c40f;color:#111;padding:12px 28px;border-radius:4px;text-decoration:none;font-weight:bold;display:inline-block;">
                Réinitialiser mon mot de passe
              </a>
            </p>
            <p style="font-size:12px;">Ou cliquez, ou copiez, ce lien : <a href="${resetUrl}" style="color:#f1c40f;">${resetUrl}</a></p>
          </td></tr>
          ${emailFooter('Si cet e-mail ne vous concerne pas, veuillez ne pas en tenir compte.')}
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
<body style="background:#ffffff;color:#e0e0e0;font-family:sans-serif;padding:40px 20px;margin:0;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid #c0392b;border-radius:8px;">
          <tr><td style="padding:40px;">
            <h1 style="color:#c0392b;font-size:24px;margin-bottom:8px;">zØmbie zØne</h1>
            <p style="color:#aaa;margin-bottom:24px;">Confirmation de votre adresse email</p>
            <p>Cliquez sur le bouton ci-dessous pour confirmer votre adresse email.</p>
            <p>Ce lien est valable <strong>24 heures</strong>. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
            <p style="margin:32px 0;text-align:center;">
              <a href="${verifyUrl}" style="background:#f1c40f;color:#111;padding:12px 28px;border-radius:4px;text-decoration:none;font-weight:bold;display:inline-block;">
                Confirmer mon adresse email
              </a>
            </p>
            <p style="font-size:12px;">Ou cliquez, ou copiez, ce lien : <a href="${verifyUrl}" style="color:#f1c40f;">${verifyUrl}</a></p>
          </td></tr>
          ${emailFooter('Si cet e-mail ne vous concerne pas, veuillez ne pas en tenir compte.')}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  });
}

export async function sendNewUserEmail(
  id: number,
  firstname: string,
  lastname: string,
  email: string,
  roleId: number,
  ip: string,
  registeredAt: Date,
): Promise<void> {
  const dateStr = registeredAt.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });
  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? 'z0mbiez0ne@sharo.fr',
    to: process.env.SMTP_FROM ?? 'z0mbiez0ne@sharo.fr',
    subject: `[Inscription] ${firstname} ${lastname} <${email}>`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8" /><title>Nouvelle inscription</title></head>
<body style="background:#ffffff;color:#e0e0e0;font-family:sans-serif;padding:40px 20px;margin:0;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid #c0392b;border-radius:8px;">
          <tr><td style="padding:40px;">
            <h1 style="color:#c0392b;font-size:24px;margin-bottom:8px;">zØmbie zØne</h1>
            <p style="color:#aaa;margin-bottom:24px;">Nouvelle inscription</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td style="color:#aaa;font-size:13px;padding:6px 0;width:110px;">ID</td>
                <td style="color:#e0e0e0;font-size:13px;padding:6px 0;">#${id}</td>
              </tr>
              <tr>
                <td style="color:#aaa;font-size:13px;padding:6px 0;">Prénom</td>
                <td style="color:#e0e0e0;font-size:13px;padding:6px 0;">${firstname}</td>
              </tr>
              <tr>
                <td style="color:#aaa;font-size:13px;padding:6px 0;">Nom</td>
                <td style="color:#e0e0e0;font-size:13px;padding:6px 0;">${lastname}</td>
              </tr>
              <tr>
                <td style="color:#aaa;font-size:13px;padding:6px 0;">Email</td>
                <td style="color:#e0e0e0;font-size:13px;padding:6px 0;">
                  <a href="mailto:${email}" style="color:#f1c40f;">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="color:#aaa;font-size:13px;padding:6px 0;">Rôle (id)</td>
                <td style="color:#e0e0e0;font-size:13px;padding:6px 0;">${roleId}</td>
              </tr>
              <tr>
                <td style="color:#aaa;font-size:13px;padding:6px 0;">Adresse IP</td>
                <td style="color:#e0e0e0;font-size:13px;padding:6px 0;">${ip}</td>
              </tr>
              <tr>
                <td style="color:#aaa;font-size:13px;padding:6px 0;">Date / Heure</td>
                <td style="color:#e0e0e0;font-size:13px;padding:6px 0;">${dateStr}</td>
              </tr>
            </table>
          </td></tr>
          ${emailFooter()}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  });
}

const SUJET_LABELS: Record<string, string> = {
  reservation: 'Réservation de groupe',
  annulation: 'Annulation / Remboursement',
  info: 'Informations générales',
  presse: 'Presse & Partenariats',
  zombie: 'Signalement zombie (urgent)',
  autre: 'Autre',
};

export async function sendContactEmail(nom: string, email: string, sujet: string, message: string): Promise<void> {
  const sujetLabel = SUJET_LABELS[sujet] ?? sujet;
  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? 'z0mbiez0ne@sharo.fr',
    to: process.env.SMTP_FROM ?? 'z0mbiez0ne@sharo.fr',
    replyTo: email,
    subject: `[Contact] ${sujetLabel} — ${nom}`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8" /><title>Message de contact</title></head>
<body style="background:#ffffff;color:#e0e0e0;font-family:sans-serif;padding:40px 20px;margin:0;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid #c0392b;border-radius:8px;">
          <tr><td style="padding:40px;">
            <h1 style="color:#c0392b;font-size:24px;margin-bottom:8px;">zØmbie zØne</h1>
            <p style="color:#aaa;margin-bottom:24px;">Nouveau message de contact</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td style="color:#aaa;font-size:13px;padding:6px 0;width:90px;">Nom</td>
                <td style="color:#e0e0e0;font-size:13px;padding:6px 0;">${nom}</td>
              </tr>
              <tr>
                <td style="color:#aaa;font-size:13px;padding:6px 0;">Email</td>
                <td style="color:#e0e0e0;font-size:13px;padding:6px 0;">
                  <a href="mailto:${email}" style="color:#f1c40f;">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="color:#aaa;font-size:13px;padding:6px 0;">Sujet</td>
                <td style="color:#e0e0e0;font-size:13px;padding:6px 0;">${sujetLabel}</td>
              </tr>
            </table>
            <div style="background:#1a1a1a;border-left:3px solid #c0392b;padding:16px;border-radius:4px;">
              <p style="margin:0;font-size:14px;line-height:1.6;white-space:pre-wrap;">${message}</p>
            </div>
            <p style="font-size:12px;color:#555;margin-top:24px;">
              Répondre directement à cet email pour contacter l'expéditeur.
            </p>
          </td></tr>
          ${emailFooter()}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  });
}

interface OrderConfirmationLine {
  activity_title: string | null;
  session_date: string;
  tickets_qty: number;
  unit_price: number;
  amount: number;
}

interface OrderConfirmationData {
  orderId: number;
  userFirstname: string;
  userEmail: string;
  lines: OrderConfirmationLine[];
  subtotalHT: number;
  taxes: number;
  totalTTC: number;
  createdAt: Date;
}

export async function sendOrderConfirmationEmail(data: OrderConfirmationData): Promise<void> {
  const { orderId, userFirstname, userEmail, lines, subtotalHT, taxes, totalTTC, createdAt } = data;

  const fmt = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });

  const dateStr = createdAt.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Paris',
  });

  const linesHtml = lines
    .map(
      (l) => `
        <tr>
          <td style="padding:8px 4px;color:#e0e0e0;font-size:13px;border-bottom:1px solid #2a2a2a;">
            ${l.activity_title ?? 'Activité'}<br/>
            <span style="color:#fff;font-size:11px;font-weight:bold">${l.session_date} — ${l.tickets_qty} billet(s) × ${fmt(l.unit_price)} HT</span>
          </td>
          <td style="padding:8px 4px;color:#e0e0e0;font-size:13px;border-bottom:1px solid #2a2a2a;text-align:right;white-space:nowrap;">
            ${fmt(l.amount)}
          </td>
        </tr>`,
    )
    .join('');

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? 'z0mbiez0ne@sharo.fr',
    to: userEmail,
    subject: `zØmbie zØne — Confirmation de commande #${orderId}`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8" /><title>Confirmation de commande</title></head>
<body style="background:#ffffff;color:#e0e0e0;font-family:sans-serif;padding:40px 20px;margin:0;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid #c0392b;border-radius:8px;">
          <tr><td style="padding:40px;">
            <h1 style="color:#c0392b;font-size:24px;margin-bottom:8px;">zØmbie zØne</h1>
            <p style="color:#aaa;margin-bottom:4px;">Confirmation de commande</p>
            <p style="color:#fff;font-size:12px;margin-top:0;">Commande #${orderId} — ${dateStr}</p>

            <p style="margin-top:24px;">Bonjour <strong>${userFirstname}</strong>,</p>
            <p style="color:#aaa;font-size:14px;">
              Votre commande a bien été enregistrée. Vous trouverez ci-dessous le récapitulatif.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
              <thead>
                <tr>
                  <th style="text-align:left;color:#888;font-size:11px;text-transform:uppercase;padding-bottom:8px;border-bottom:1px solid #333;">Activité / Session</th>
                  <th style="text-align:right;color:#888;font-size:11px;text-transform:uppercase;padding-bottom:8px;border-bottom:1px solid #333;">Montant HT</th>
                </tr>
              </thead>
              <tbody>
                ${linesHtml}
              </tbody>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
              <tr>
                <td style="color:#888;font-size:13px;padding:4px 0;">Sous-total HT</td>
                <td style="color:#e0e0e0;font-size:13px;padding:4px 0;text-align:right;">${fmt(subtotalHT)}</td>
              </tr>
              <tr>
                <td style="color:#888;font-size:13px;padding:4px 0;">TVA (${Math.round(taxes * 100)} %)</td>
                <td style="color:#e0e0e0;font-size:13px;padding:4px 0;text-align:right;">${fmt(totalTTC - subtotalHT)}</td>
              </tr>
              <tr>
                <td style="color:#fff;font-size:15px;font-weight:bold;padding:10px 0 4px;">Total TTC</td>
                <td style="color:#c0392b;font-size:15px;font-weight:bold;padding:10px 0 4px;text-align:right;">${fmt(totalTTC)}</td>
              </tr>
            </table>

            <p style="margin-top:28px;font-size:13px;color:#aaa;">
              Retrouvez le détail de vos commandes dans votre
              <a href="${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/dashboard" style="color:#f1c40f;">espace personnel</a>.
            </p>
          </td></tr>
          ${emailFooter()}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  });
}
