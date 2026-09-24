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

  return json({ ok: true }, 201);
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
