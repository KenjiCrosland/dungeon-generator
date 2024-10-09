<template>
  <CdrSkeletonBone type="heading" style="width: 40%; height: 30px; margin-bottom: 2rem" />
  <div class="focus-text">
    <div class="skeleton-line">
      <CdrSkeletonBone type="line" style="width:15%" />:
      <CdrSkeletonBone type="line" style="width:35%" />
    </div>
    <div class="skeleton-line">
      <CdrSkeletonBone type="line" style="width:15%" />:
      <CdrSkeletonBone type="line" style="width:85%" />
    </div>
    <CdrSkeletonBone type="line" style="width:95%" />
    <div class="skeleton-line">
      <CdrSkeletonBone type="line" style="width:15%" />:
      <CdrSkeletonBone type="line" style="width:85%" />
    </div>
    <CdrSkeletonBone type="line" style="width:95%" />
  </div>
  <div v-for="i in 3" :key="'group-' + i" style="margin: 2rem 0">
    <CdrSkeletonBone type="line" style="width:85%" />
    <CdrSkeletonBone type="line" style="width:90%" />
    <CdrSkeletonBone type="line" style="width:75%" />
    <CdrSkeletonBone type="line" style="width:95%" />
    <CdrSkeletonBone type="line" style="width:80%" />
    <CdrSkeletonBone type="line" style="width:85%" />
  </div>
</template>

<script setup>
import { CdrSkeletonBone } from "@rei/cedar";
</script>

<style scoped lang="scss">
@import '@rei/cdr-tokens/dist/scss/cdr-tokens.scss';

.focus-text {
  background-color: $cdr-color-background-secondary;
  color: $cdr-color-text-secondary;
  padding: 1rem 2rem;
  font-style: italic;
}

.skeleton-line {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.bone-list-item {
  margin: 4rem 0;
}
</style>
