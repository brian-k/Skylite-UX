export default defineEventHandler(async () => {
  const config = useRuntimeConfig();
  const response = await $fetch(`${config.haUrl}/api/shopping_list/clear_completed`, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.haToken}` },
  });
  return response;
});
