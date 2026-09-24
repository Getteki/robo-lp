export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "JSON inválido" }, 400);
  }

  const nome = clean(body.nome);
  const email = clean(body.email);
  const whatsapp = clean(body.whatsapp);
  const nicho = clean(body.nicho) || null;
  const mensagem = clean(body.mensagem) || null;

  if (!nome || !email || !whatsapp) {
    return json({ error: "Nome, email e WhatsApp são obrigatórios" }, 400);
  }

  await env.DB
    .prepare(
      "INSERT INTO leads (nome, email, whatsapp, nicho, mensagem) VALUES (?, ?, ?, ?, ?)"
    )
    .bind(nome, email, whatsapp, nicho, mensagem)
    .run();

  try {
    await notifyByEmail(env, { nome, email, whatsapp, nicho, mensagem });
  } catch (err) {
    console.error("Falha ao enviar notificação por e-mail", err);
  }

  return json({ ok: true }, 201);
}

async function notifyByEmail(env, lead) {
  if (!env.RESEND_API_KEY) return;

  const html = `
    <p><strong>Nome:</strong> ${lead.nome}</p>
    <p><strong>Email:</strong> ${lead.email}</p>
    <p><strong>WhatsApp:</strong> ${lead.whatsapp}</p>
    <p><strong>Nicho:</strong> ${lead.nicho || "-"}</p>
    <p><strong>Mensagem:</strong> ${lead.mensagem || "-"}</p>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "gerencIA <onboarding@resend.dev>",
      to: "jovanio.santanati@gmail.com",
      subject: `Novo lead: ${lead.nome}`,
      html,
    }),
  });

  if (!res.ok) {
    throw new Error(`Resend respondeu ${res.status}: ${await res.text()}`);
  }
}

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
