const sensitive = /password|otp|token|secret|authorization/i;
const copy = {
  welcome: 'Welcome to Kshatriya Matrimonial Society',
  'profile-approved': 'Your profile has been approved',
  'changes-requested': 'Changes requested for your profile',
  'interest-received': 'A family expressed interest',
  'interest-accepted': 'Your interest was accepted',
  'payment-receipt': 'Payment received',
  'subscription-activated': 'Your membership is active',
  'password-changed': 'Your password was changed',
  'password-reset': 'Your password reset code'
};
const localizedCopy = {
  gu: {
    welcome: 'ક્ષત્રિય મેટ્રિમોનિયલ સોસાયટીમાં આપનું સ્વાગત છે',
    'profile-approved': 'તમારી પ્રોફાઇલ મંજૂર થઈ છે',
    'changes-requested': 'તમારી પ્રોફાઇલમાં ફેરફાર જરૂરી છે',
    'interest-received': 'એક પરિવારે રસ દર્શાવ્યો છે',
    'interest-accepted': 'તમારો રસ સ્વીકારાયો છે',
    'payment-receipt': 'ચુકવણી મળી છે',
    'subscription-activated': 'તમારું સભ્યપદ સક્રિય છે',
    'password-changed': 'તમારો પાસવર્ડ બદલાયો છે',
    'password-reset': 'તમારો પાસવર્ડ રીસેટ કોડ'
  },
  hi: {
    welcome: 'क्षत्रिय मैट्रिमोनियल सोसाइटी में आपका स्वागत है',
    'profile-approved': 'आपकी प्रोफ़ाइल स्वीकृत हो गई है',
    'changes-requested': 'आपकी प्रोफ़ाइल में बदलाव आवश्यक हैं',
    'interest-received': 'एक परिवार ने रुचि भेजी है',
    'interest-accepted': 'आपकी रुचि स्वीकार हुई है',
    'payment-receipt': 'भुगतान प्राप्त हुआ',
    'subscription-activated': 'आपकी सदस्यता सक्रिय है',
    'password-changed': 'आपका पासवर्ड बदल गया है',
    'password-reset': 'आपका पासवर्ड रीसेट कोड'
  }
};
const render = (template, data, language = 'en') =>
  `<div lang="${language}" style="font-family:Arial,sans-serif;color:#191614"><h1 style="color:#681d25">${localizedCopy[language]?.[template] || copy[template] || 'Kshatriya Matrimonial Society'}</h1><p>${Object.entries(
    data
  )
    .map(([key, value]) => `${key}: ${value}`)
    .join(
      '<br>'
    )}</p><p style="color:#756a60">Please do not reply with passwords, OTPs or payment details.</p></div>`;
export const emailService = {
  async send({ to, subject, template, data = {}, language = 'en' }) {
    const safe = Object.fromEntries(
        Object.entries(data).filter(([key]) => !sensitive.test(key))
      ),
      provider = process.env.EMAIL_PROVIDER || 'development';
    if (provider === 'development') {
      console.info('[email:development]', {
        to,
        subject,
        template,
        data: safe
      });
      return { provider };
    }
    if (provider === 'resend') {
      if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM)
        throw new Error('Resend email credentials are incomplete.');
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM,
          to: [to],
          subject,
          html: render(template, safe, language)
        })
      });
      if (!response.ok) throw new Error('Email provider rejected the message.');
      return { provider, id: (await response.json()).id };
    }
    throw new Error(`Unsupported email provider: ${provider}`);
  }
};
export function sendEmailSafely(message) {
  queueMicrotask(() =>
    emailService
      .send(message)
      .catch((error) => console.error('Email delivery failed:', error.message))
  );
}
