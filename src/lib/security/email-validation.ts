const DISPOSABLE_DOMAINS = new Set([
  "tempmail.com", "temp-mail.org", "guerrillamail.com", "guerrillamail.net",
  "guerrillamailblock.com", "yopmail.com", "yopmail.fr", "mailinator.com",
  "sharklasers.com", "guerrillamail.info", "grr.la", "guerrillamail.de",
  "throwaway.email", "throwaway.com", "getnada.com", "trashmail.com",
  "trashmail.me", "trashmail.net", "dispostable.com", "mailnesia.com",
  "maildrop.cc", "fakeinbox.com", "tempail.com", "tempr.email",
  "discard.email", "mailcatch.com", "10minutemail.com", "10minutemail.net",
  "minutemail.com", "emailondeck.com", "33mail.com", "moakt.com",
  "mytemp.email", "mohmal.com", "burnermail.io", "inboxbear.com",
  "mailsac.com", "harakirimail.com", "crazymailing.com", "tmail.ws",
  "tempinbox.com", "spamgourmet.com", "mailexpire.com", "jetable.org",
  "filzmail.com", "mailnull.com", "nomail.xl.cx", "spamfree24.org",
  "trashymail.com", "devnullmail.com", "mailzilla.com", "letthemeatspam.com",
  "safetymail.info", "spam4.me", "binkmail.com", "bobmail.info",
  "chammy.info", "devnullmail.com", "dfgh.net", "dingbone.com",
  "dodgit.com", "e4ward.com", "emailigo.de", "emailwarden.com",
  "enterto.com", "gishpuppy.com", "imstations.com", "inboxalias.com",
  "koszmail.pl", "kurzepost.de", "objectmail.com", "proxymail.eu",
  "rcpt.at", "reallymymail.com", "recode.me", "regbypass.com",
  "rmqkr.net", "royal.net", "safersignup.de", "shortmail.net",
  "sneakemail.com", "sogetthis.com", "spamhereplease.com", "spaml.de",
  "teleworm.us", "thankyou2010.com", "thisisnotmyrealemail.com",
  "trash-mail.at", "trash-mail.com", "trashmailer.com", "wegwerfmail.de",
  "wegwerfmail.net", "wh4f.org", "wimsg.com", "emailfake.com",
  "emaillime.com", "tempmailo.com", "mailtemp.info", "temporarymail.com",
  "tmpmail.net", "tmpmail.org", "mail-temp.com", "one-time.email",
]);

/**
 * Validate an email address for spam/disposable patterns.
 */
export function validateEmail(email: string): { valid: boolean; reason?: string } {
  const lower = email.toLowerCase().trim();
  const domain = lower.split("@")[1];

  if (!domain) return { valid: false, reason: "invalid_format" };

  // Block disposable email domains
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { valid: false, reason: "disposable_email" };
  }

  const localPart = lower.split("@")[0];

  // Block local parts that are just numbers (e.g. 23847238@gmail.com)
  if (/^\d+$/.test(localPart)) {
    return { valid: false, reason: "spam_pattern" };
  }

  // Block local parts with 20+ random characters (no vowels = likely random)
  if (localPart.length >= 20 && !/[aeiou]/i.test(localPart)) {
    return { valid: false, reason: "spam_pattern" };
  }

  // Block extremely long local parts (>50 chars)
  if (localPart.length > 50) {
    return { valid: false, reason: "spam_pattern" };
  }

  return { valid: true };
}
