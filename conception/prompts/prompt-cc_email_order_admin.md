# CC — Email de notification admin à chaque nouvelle commande

## Contexte

Branche : `emails/order-confirmation`

`sendOrderConfirmationEmail` vient d'être ajoutée dans `backend/src/lib/mailer.ts` et appelée dans `createOrder`. Le pattern est identique : ajouter `sendOrderAdminEmail` dans `mailer.ts`, l'appeler dans `createOrder` dans le même bloc try/catch silencieux existant (ou un second juste après).

L'email part à `z0mbiez0ne@sharo.fr` (= `process.env.SMTP_FROM`), de `z0mbiez0ne@sharo.fr`.

---

## 1. `backend/src/lib/mailer.ts` — ajouter `sendOrderAdminEmail`

L'interface `OrderConfirmationLine` et `OrderConfirmationData` existent déjà. Créer une interface étendue pour l'admin qui ajoute l'IP :

```typescript
interface OrderAdminData extends OrderConfirmationData {
  userLastname: string;
  ip: string;
}

export async function sendOrderAdminEmail(data: OrderAdminData): Promise<void> {
  const { orderId, userFirstname, userLastname, userEmail, lines, subtotalHT, taxes, totalTTC, createdAt, ip } = data;

  const fmt = (n: number) =>
    n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });

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
            <span style="color:#888;font-size:11px;">${l.session_date} — ${l.tickets_qty} billet(s) × ${fmt(l.unit_price)} HT</span>
          </td>
          <td style="padding:8px 4px;color:#e0e0e0;font-size:13px;border-bottom:1px solid #2a2a2a;text-align:right;white-space:nowrap;">
            ${fmt(l.amount)}
          </td>
        </tr>`,
    )
    .join('');

  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? 'z0mbiez0ne@sharo.fr',
    to: process.env.SMTP_FROM ?? 'z0mbiez0ne@sharo.fr',
    subject: `[Admin] Nouvelle commande #${orderId} — ${userFirstname} ${userLastname}`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8" /><title>Nouvelle commande</title></head>
<body style="background:#ffffff;color:#e0e0e0;font-family:sans-serif;padding:40px 20px;margin:0;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid #c0392b;border-radius:8px;">
          <tr><td style="padding:40px;">
            <h1 style="color:#c0392b;font-size:24px;margin-bottom:8px;">zØmbie zØne</h1>
            <p style="color:#aaa;margin-bottom:4px;">Nouvelle commande reçue</p>
            <p style="color:#555;font-size:12px;margin-top:0;">Commande #${orderId} — ${dateStr}</p>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td style="color:#aaa;font-size:13px;padding:5px 0;width:100px;">Client</td>
                <td style="color:#e0e0e0;font-size:13px;padding:5px 0;">${userFirstname} ${userLastname}</td>
              </tr>
              <tr>
                <td style="color:#aaa;font-size:13px;padding:5px 0;">Email</td>
                <td style="color:#e0e0e0;font-size:13px;padding:5px 0;">
                  <a href="mailto:${userEmail}" style="color:#c0392b;">${userEmail}</a>
                </td>
              </tr>
              <tr>
                <td style="color:#aaa;font-size:13px;padding:5px 0;">IP</td>
                <td style="color:#e0e0e0;font-size:13px;padding:5px 0;">${ip}</td>
              </tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0">
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

            <p style="margin-top:28px;text-align:center;">
              <a href="${frontendUrl}/manage/orders/${orderId}" style="background:#c0392b;color:#fff;padding:10px 24px;border-radius:4px;text-decoration:none;font-weight:bold;font-size:13px;display:inline-block;">
                Voir la commande dans le backoffice
              </a>
            </p>
          </td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  });
}
```

---

## 2. `backend/src/controllers/orders.controller.ts` — appeler `sendOrderAdminEmail`

### 2a. Ajouter `sendOrderAdminEmail` à l'import existant de `mailer.ts`

```typescript
import { sendOrderConfirmationEmail, sendOrderAdminEmail } from '../lib/mailer.js';
```

### 2b. Récupérer `lastname` dans `userRecord`

La requête `userRecord` récupère déjà `firstname` et `email` (ajoutés lors du premier prompt). Ajouter `lastname` :

```typescript
const userRecord = await prisma.users.findUnique({
  where: { id: req.user.id },
  select: { email_verified_at: true, firstname: true, lastname: true, email: true },
});
```

### 2c. Récupérer l'IP

L'IP est déjà extraite dans `registerUser` avec ce pattern. Ajouter la même ligne dans `createOrder`, juste avant la transaction :

```typescript
const ip =
  (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ??
  req.ip ??
  'inconnue';
```

### 2d. Appel `sendOrderAdminEmail` dans le bloc try/catch silencieux existant

Dans le bloc try/catch silencieux (après `res.status(201).json({...})`), ajouter l'appel à `sendOrderAdminEmail` après `sendOrderConfirmationEmail` :

```typescript
try {
  const subtotalHT = createdLines.reduce((s, l) => s + Number(l.amount), 0);
  const emailLines = createdLines.map((l) => ({
    activity_title: l.activity_title,
    session_date: formatDate(l.session_date),
    tickets_qty: l.tickets_qty,
    unit_price: Number(l.unit_price),
    amount: Number(l.amount),
  }));

  await sendOrderConfirmationEmail({
    orderId: result.id,
    userFirstname: userRecord.firstname,
    userEmail: userRecord.email,
    lines: emailLines,
    subtotalHT,
    taxes: TAXES_RATE,
    totalTTC: Number(result.total_amount),
    createdAt: result.created_at,
  });

  await sendOrderAdminEmail({
    orderId: result.id,
    userFirstname: userRecord.firstname,
    userLastname: userRecord.lastname,
    userEmail: userRecord.email,
    lines: emailLines,
    subtotalHT,
    taxes: TAXES_RATE,
    totalTTC: Number(result.total_amount),
    createdAt: result.created_at,
    ip,
  });
} catch (err) {
  console.error('order emails failed:', err);
}
```

---

## Vérification

```bash
npm run dev

# Créer une commande via le frontend
# → Vérifier réception de DEUX emails sur z0mbiez0ne@sharo.fr :
#   1. L'email client (déjà testé au prompt précédent)
#   2. L'email admin [Admin] avec nom complet, email, IP, tableau lignes, lien backoffice

cd backend && npm run lint
```
