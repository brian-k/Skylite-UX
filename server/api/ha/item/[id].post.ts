export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  const response = await $fetch(`${config.haUrl}/api/shopping_list/item/${id}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.haToken}` },
    body,
  });
  return response;
});
