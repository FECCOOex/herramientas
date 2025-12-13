export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const { nombre, correo, telefono, tema, centro, mensaje, website } = req.body || {};

    // Honeypot anti-spam
    if (website && String(website).trim().length > 0) {
      return res.status(200).json({ ok: true });
    }

    if (![nombre, correo, tema, mensaje].every(v => v && String(v).trim())) {
      return res.status(400).json({ ok: false, error: "Faltan campos obligatorios" });
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const TO_EMAIL = process.env.TO_EMAIL || "educacion@extremadura.ccoo.es";
    const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@resend.dev";

    if (!RESEND_API_KEY) {
      return res.status(500).json({ ok: false, error: "Falta RESEND_API_KEY" });
    }

    const subject = `[Consulta] ${String(tema).trim()} · ${String(nombre).trim()}`;

    const text =
`Nombre: ${nombre}
Correo: ${correo}
${telefono ? `Teléfono: ${telefono}\n` : ""}${centro ? `Centro / localidad: ${centro}\n` : ""}Tema: ${tema}

Consulta:
${mensaje}
`;

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [TO_EMAIL],
        reply_to: correo,
        subject,
        text
      })
    });

    if (!r.ok) {
      const detail = await r.text();
      return res.status(502).json({ ok: false, error: "Error enviando email", detail });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, error: "Error interno", detail: String(e) });
  }
}
