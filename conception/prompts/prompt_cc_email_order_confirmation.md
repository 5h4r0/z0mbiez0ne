# CC — Email de confirmation de commande

## Contexte

Branche : `emails/order-confirmation`

L'infra email (nodemailer, transporter, template HTML fond `#111` / bordure `#c0392b`) est opérationnelle dans `backend/src/lib/mailer.ts`. Le pattern est identique aux emails existants (`sendVerificationEmail`, `sendNewUserEmail`) : appel async dans un try/catch silencieux après l'action principale, pour ne jamais bloquer l'utilisateur en cas d'échec SMTP.

`createOrder` dans `backend/src/controllers/orders.controller.ts` crée la commande dans une transaction Prisma et renvoie le résultat. C'est là qu'il faut déclencher l'email.

---

## 1. `backend/src/lib/mailer.ts` — ajouter `sendOrderConfirmationEmail`

Ajouter à la fin du fichier, après les imports existants (pas besoin de nouveaux imports — `format` de `date-fns` est déjà utilisé dans le controller, mais dans `mailer.ts` on utilisera `toLocaleDateString` pour rester sans dépendance) :

```typescript
interface OrderConfirmationLine {
  activity_title: string | null;
  session_date: string;        // déjà formaté (ex: "Friday, June 7, 2025, 2:00 PM")
  tickets_qty: number;
  unit_price: number;          // HT par ticket
  amount: number;              // HT total de la ligne
}

interface OrderConfirmationData {
  orderId: number;
  userFirstname: string;
  userEmail: string;
  lines: OrderConfirmationLine[];
  subtotalHT: number;          // somme des lines.amount
  taxes: number;               // taux TVA (ex: 0.2)
  totalTTC: number;            // total_amount
  createdAt: Date;
}

export async function sendOrderConfirmationEmail(data: OrderConfirmationData): Promise<void> {
  const { orderId, userFirstname, userEmail, lines, subtotalHT, taxes, totalTTC, createdAt } = data;

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
            <p style="color:#555;font-size:12px;margin-top:0;">Commande #${orderId} — ${dateStr}</p>

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
              <a href="${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/dashboard" style="color:#c0392b;">espace personnel</a>.
            </p>
            <p style="font-size:12px;color:#555;margin-top:16px;">
              Cet email a été envoyé automatiquement. Ne pas répondre directement.
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

## 2. `backend/src/controllers/orders.controller.ts` — appeler `sendOrderConfirmationEmail` dans `createOrder`

### 2a. Ajouter l'import

En haut du fichier, ajouter `sendOrderConfirmationEmail` à l'import existant de `mailer.ts` :

```typescript
import { sendOrderConfirmationEmail } from '../lib/mailer.js';
```

### 2b. Récupérer le prénom et l'email de l'utilisateur

Dans `createOrder`, juste avant la transaction Prisma (`const result = await prisma.$transaction(...)`), la requête `userRecord` récupère déjà `email_verified_at`. Étendre cette requête pour récupérer aussi `firstname` et `email` :

```typescript
const userRecord = await prisma.users.findUnique({
  where: { id: req.user.id },
  select: { email_verified_at: true, firstname: true, email: true },
});
```

### 2c. Récupérer le titre des activités dans la transaction

Dans la transaction, la requête `sessions.findUnique` récupère la session mais pas le titre de l'activité. Étendre le `include` :

```typescript
const session = await tx.sessions.findUnique({
  where: { id: session_id },
  include: { activity: { select: { title: true } } },
});
```

Mettre à jour le type du tableau `createdLines` pour inclure le titre :

```typescript
const createdLines: {
  amount: Prisma.Decimal;
  id: number;
  order_id: number;
  session_id: number;
  tickets_qty: number;
  unit_price: Prisma.Decimal;
  session_date: Date;
  activity_title: string | null;
}[] = [];
```

Dans la boucle, après la création de `orderLine`, push avec les données enrichies :

```typescript
createdLines.push({
  ...orderLine,
  unit_price: session.unit_price,
  session_date: session.date,
  activity_title: session.activity?.title ?? null,
});
```

### 2d. Appel email après `res.status(201).json(...)`

Après l'envoi de la réponse HTTP (après `res.status(201).json({...})`), ajouter en try/catch silencieux :

```typescript
try {
  const subtotalHT = createdLines.reduce((s, l) => s + Number(l.amount), 0);
  await sendOrderConfirmationEmail({
    orderId: result.id,
    userFirstname: userRecord.firstname,
    userEmail: userRecord.email,
    lines: createdLines.map((l) => ({
      activity_title: l.activity_title,
      session_date: formatDate(l.session_date),
      tickets_qty: l.tickets_qty,
      unit_price: Number(l.unit_price),
      amount: Number(l.amount),
    })),
    subtotalHT,
    taxes: TAXES_RATE,
    totalTTC: Number(result.total_amount),
    createdAt: result.created_at,
  });
} catch (err) {
  console.error('sendOrderConfirmationEmail failed:', err);
}
```

---

## Vérification

```bash
# Depuis la racine du monorepo
npm run dev

# Créer une commande via le frontend (panier → checkout)
# → Vérifier réception email sur l'adresse du compte utilisateur
# → Email doit contenir : lignes détaillées (activité, date session, qty, prix HT),
#   sous-total HT, TVA 20%, total TTC en rouge

# Vérifier que le lint passe
cd backend && npm run lint
```
