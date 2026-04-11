export default defineEventHandler(async () => {
  const config = useRuntimeConfig();
  const response = await $fetch<unknown[]>(`${config.haUrl}/api/shopping_list`, {
    headers: { Authorization: `Bearer ${config.haToken}` },
  });
  return response;
});
