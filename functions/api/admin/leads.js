function isAuthorized(request, env) {
  const auth = request.headers.get("Authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  return Boolean(token) && token === env.ADMIN_TOKEN;
}

export async function onRequestGet({ request, env }) {
  if (!isAuthorized(request, env)) {
    return json({ error: "Não autorizado" }, 401);
  }

  const { results } = await env.DB
    .prepare(
      "SELECT id, nome, email, whatsapp, nicho, mensagem, status, created_at FROM leads ORDER BY created_at DESC"
    )
    .all();

  return json({ leads: results });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
