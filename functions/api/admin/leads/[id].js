const VALID_STATUS = ["novo", "contatado", "demo_enviada", "convertido", "descartado"];

function isAuthorized(request, env) {
  const auth = request.headers.get("Authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  return Boolean(token) && token === env.ADMIN_TOKEN;
}

export async function onRequestPatch({ request, env, params }) {
  if (!isAuthorized(request, env)) {
    return json({ error: "Não autorizado" }, 401);
  }

  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return json({ error: "Id inválido" }, 400);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "JSON inválido" }, 400);
  }

  if (!VALID_STATUS.includes(body.status)) {
    return json({ error: "Status inválido" }, 400);
  }

  await env.DB
    .prepare("UPDATE leads SET status = ? WHERE id = ?")
    .bind(body.status, id)
    .run();

  return json({ ok: true });
}

export async function onRequestDelete({ request, env, params }) {
  if (!isAuthorized(request, env)) {
    return json({ error: "Não autorizado" }, 401);
  }

  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return json({ error: "Id inválido" }, 400);
  }

  await env.DB.prepare("DELETE FROM leads WHERE id = ?").bind(id).run();

  return json({ ok: true });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
