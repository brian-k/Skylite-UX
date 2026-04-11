export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);
  const response = await $fetch(`${config.haUrl}/api/shopping_list/item`, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.haToken}` },
    body,
  });
  return response;
});
