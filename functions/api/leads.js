import { EmailMessage } from "cloudflare:email";

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
  if (!env.SEND_EMAIL) return;

  const raw = [
    "From: gerencIA <notificacoes@usegerencia.com>",
    "To: jovanio.santanati@gmail.com",
    `Subject: Novo lead: ${lead.nome}`,
    "Content-Type: text/plain; charset=utf-8",
    "",
    `Nome: ${lead.nome}`,
    `Email: ${lead.email}`,
    `WhatsApp: ${lead.whatsapp}`,
    `Nicho: ${lead.nicho || "-"}`,
    `Mensagem: ${lead.mensagem || "-"}`,
  ].join("\r\n");

  const message = new EmailMessage(
    "notificacoes@usegerencia.com",
    "jovanio.santanati@gmail.com",
    raw
  );

  await env.SEND_EMAIL.send(message);
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
