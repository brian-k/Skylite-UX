<script setup lang="ts">
interface HaShoppingItem {
  id: string;
  name: string;
  complete: boolean;
}

const items = ref<HaShoppingItem[]>([]);
const loading = ref(true);
const newItemName = ref("");
const adding = ref(false);

async function fetchItems() {
  try {
    items.value = await $fetch<HaShoppingItem[]>("/api/ha/shopping-list");
  }
  catch (e) {
    console.error("Failed to fetch HA shopping list", e);
  }
  finally {
    loading.value = false;
  }
}

async function toggleItem(item: HaShoppingItem) {
  const prev = item.complete;
  item.complete = !item.complete;
  try {
    await $fetch(`/api/ha/item/${item.id}`, {
      method: "POST",
      body: { complete: item.complete, name: item.name },
    });
  }
  catch {
    item.complete = prev;
  }
}

async function addItem() {
  const name = newItemName.value.trim();
  if (!name)
    return;
  adding.value = true;
  try {
    const created = await $fetch<HaShoppingItem>("/api/ha/shopping-list", {
      method: "POST",
      body: { name },
    });
    items.value.push(created);
    newItemName.value = "";
  }
  catch (e) {
    console.error("Failed to add item", e);
  }
  finally {
    adding.value = false;
  }
}

async function clearCompleted() {
  await $fetch("/api/ha/shopping-list-clear", { method: "DELETE" });
  items.value = items.value.filter(i => !i.complete);
}

const incomplete = computed(() => items.value.filter(i => !i.complete));
const completed = computed(() => items.value.filter(i => i.complete));

onMounted(() => {
  fetchItems();
  const interval = setInterval(fetchItems, 30000);
  onUnmounted(() => clearInterval(interval));
});
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-80px)] overflow-y-auto px-6 py-4 max-w-xl mx-auto w-full">
    <h1 class="text-2xl font-semibold mb-4 text-highlighted">
      Alexa Shopping List
    </h1>

    <!-- Add item -->
    <div class="flex gap-2 mb-6">
      <UInput
        v-model="newItemName"
        placeholder="Add item..."
        class="flex-1"
        @keyup.enter="addItem"
      />
      <UButton
        :loading="adding"
        icon="i-lucide-plus"
        @click="addItem"
      >
        Add
      </UButton>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <UIcon name="i-lucide-loader-circle" class="animate-spin text-dimmed w-8 h-8" />
    </div>

    <template v-else>
      <!-- Incomplete items -->
      <ul class="space-y-2 mb-4">
        <li
          v-for="item in incomplete"
          :key="item.id"
          class="flex items-center gap-3 py-2 border-b border-default"
        >
          <UCheckbox
            :model-value="item.complete"
            @update:model-value="toggleItem(item)"
          />
          <span class="text-base text-default flex-1">{{ item.name }}</span>
        </li>
      </ul>

      <!-- Completed section -->
      <template v-if="completed.length">
        <div class="flex items-center justify-between mb-2 mt-4">
          <span class="text-sm text-dimmed">Completed ({{ completed.length }})</span>
          <UButton variant="ghost" size="xs" @click="clearCompleted">
            Clear
          </UButton>
        </div>
        <ul class="space-y-2">
          <li
            v-for="item in completed"
            :key="item.id"
            class="flex items-center gap-3 py-2 border-b border-default opacity-50"
          >
            <UCheckbox
              :model-value="item.complete"
              @update:model-value="toggleItem(item)"
            />
            <span class="text-base line-through text-dimmed flex-1">{{ item.name }}</span>
          </li>
        </ul>
      </template>

      <div v-if="!incomplete.length && !completed.length" class="text-center text-dimmed py-12">
        List is empty
      </div>
    </template>
  </div>
</template>
