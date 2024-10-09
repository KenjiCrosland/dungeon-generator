<template>
  <CdrSkeleton>
    <cdr-skeleton-bone type="rectangle" />
  </CdrSkeleton>
</template>

<script setup>
import { CdrList, CdrSkeleton, CdrSkeletonBone } from "@rei/cedar";
</script>

<style scoped lang="scss">
.bone-list-item {
  margin: 4rem 0;
}
</style>
