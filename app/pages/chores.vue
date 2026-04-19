<script setup lang="ts">
interface Chore {
  uid: string;
  title: string;
  screenTimeMinutes: number;
  status: "needs_action" | "completed";
}

interface ChildChores {
  child: string;
  bankMinutes: number;
  chores: Chore[];
}

const CHILDREN = ["luke", "noah"] as const;

const data = ref<Record<string, ChildChores>>({});
const loading = ref(true);

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function childLabel(child: string): string {
  return child.charAt(0).toUpperCase() + child.slice(1);
}

async function fetchAll() {
  await Promise.all(
    CHILDREN.map(async (child) => {
      try {
        const result = await $fetch<ChildChores>(`/api/ha/chores/${child}`);
        data.value[child] = result;
      }
      catch (e) {
        console.error(`Failed to fetch chores for ${child}`, e);
      }
    }),
  );
  loading.value = false;
}

onMounted(() => {
  fetchAll();
  const interval = setInterval(fetchAll, 60000);
  onUnmounted(() => clearInterval(interval));
});
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-80px)] overflow-y-auto px-6 py-4 w-full">
    <h1 class="text-2xl font-semibold mb-6 text-highlighted">
      Chores
    </h1>

    <div v-if="loading" class="flex justify-center py-12">
      <UIcon name="i-lucide-loader-circle" class="animate-spin text-dimmed w-8 h-8" />
    </div>

    <div v-else class="grid grid-cols-2 gap-6">
      <div
        v-for="child in CHILDREN"
        :key="child"
        class="flex flex-col gap-4"
      >
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-default pb-2">
          <h2 class="text-xl font-semibold text-default">
            {{ childLabel(child) }}
          </h2>
          <div class="flex items-center gap-2 text-sm font-medium text-highlighted bg-elevated rounded-full px-3 py-1">
            <UIcon name="i-lucide-tv" class="w-4 h-4" />
            <span>{{ formatMinutes(data[child]?.bankMinutes ?? 0) }}</span>
          </div>
        </div>

        <!-- Chore list -->
        <ul
          v-if="data[child]?.chores.length"
          class="space-y-2"
        >
          <li
            v-for="chore in data[child].chores"
            :key="chore.uid"
            class="flex items-center justify-between py-2 border-b border-default"
          >
            <span class="text-base text-default">{{ chore.title }}</span>
            <span
              v-if="chore.screenTimeMinutes > 0"
              class="text-xs font-medium text-toned bg-elevated rounded-full px-2 py-0.5"
            >
              +{{ chore.screenTimeMinutes }} min
            </span>
          </li>
        </ul>

        <div
          v-else
          class="text-center text-dimmed py-8"
        >
          No chores
        </div>
      </div>
    </div>
  </div>
</template>
