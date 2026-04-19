interface HATodoItem {
  uid: string;
  summary: string;
  status: "needs_action" | "completed";
  description?: string;
}

interface HAEntityState {
  state: string;
  attributes: {
    items?: HATodoItem[];
    [key: string]: unknown;
  };
}

export default defineEventHandler(async (event) => {
  const child = getRouterParam(event, "child");
  if (!child || !/^[a-z]+$/.test(child)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid child name" });
  }

  const config = useRuntimeConfig();
  const headers = { Authorization: `Bearer ${config.haToken}` };

  const [todosResponse, bankResponse] = await Promise.all([
    $fetch<HATodoItem[]>(
      `${config.haUrl}/api/services/todo/get_items`,
      {
        method: "POST",
        headers,
        body: { entity_id: `todo.${child}_chores`, status: "needs_action" },
      }
    ).catch(() => null),
    $fetch<HAEntityState>(
      `${config.haUrl}/api/states/input_number.${child}_screen_time_bank`,
      { headers }
    ).catch(() => null),
  ]);

  const items: HATodoItem[] = (todosResponse as unknown as Record<string, { items: HATodoItem[] }>)?.[`todo.${child}_chores`]?.items ?? [];

  return {
    child,
    bankMinutes: bankResponse ? parseFloat(bankResponse.state) || 0 : 0,
    chores: items.map((item) => ({
      uid: item.uid,
      title: item.summary,
      screenTimeMinutes: parseInt(item.description ?? "0", 10) || 0,
      status: item.status,
    })),
  };
});
