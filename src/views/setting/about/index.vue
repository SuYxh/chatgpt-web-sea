<script setup lang='ts'>

</script>

<template>
  <div class="p-4 space-y-4 px-6 py-6">
    <h2 class="text-xl font-bold">
      Hello friend!
    </h2>
    <div class="p-2 space-y-2 rounded-md bg-neutral-100 dark:bg-neutral-700">
      <p>
        {{ $t("setting.openSource") }}
        <a
          class="text-blue-600 dark:text-blue-500"
          href="https://github.com/SuYxh/chatgpt-web-sea"
          target="_blank"
        >
          GitHub
        </a>
        {{ $t("setting.freeMIT") }}
      </p>
      <p>
        {{ $t("setting.stars") }}
      </p>
    </div>
  </div>
</template>
