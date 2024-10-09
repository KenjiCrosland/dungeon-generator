<template>
  <CdrSkeleton>
    <div class="property-line-skeleton" style="margin-top: 1rem;">
      <CdrSkeletonBone type="line" class="skeleton-line-item statblock-bone" style="width: 20%" />
      <CdrSkeletonBone type="line" class="skeleton-line-item statblock-bone" style="width: 75%" />
    </div>
    <CdrSkeletonBone type="line" class="skeleton-line-item statblock-bone" style="width: 94%; margin-top: 3px;" />
    <CdrSkeletonBone type="line" class="skeleton-line-item statblock-bone" style="width: 95%" />
    <CdrSkeletonBone type="line" class="skeleton-line-item statblock-bone" style="width: 45%" />
    <div class="property-line-skeleton" style="margin-top: 1rem;">
      <CdrSkeletonBone type="line" class="skeleton-line-item statblock-bone" style="width: 20%" />
      <CdrSkeletonBone type="line" class="skeleton-line-item statblock-bone" style="width: 75%" />
    </div>
    <CdrSkeletonBone type="line" class="skeleton-line-item statblock-bone" style="width: 94%; margin-top: 3px;" />
    <CdrSkeletonBone type="line" class="skeleton-line-item statblock-bone" style="width: 95%" />
    <CdrSkeletonBone type="line" class="skeleton-line-item statblock-bone" style="width: 45%" />
    <div class="property-line-skeleton" style="margin-top: 1rem;">
      <CdrSkeletonBone type="line" class="skeleton-line-item statblock-bone" style="width: 20%" />
      <CdrSkeletonBone type="line" class="skeleton-line-item statblock-bone" style="width: 75%" />
    </div>
    <CdrSkeletonBone type="line" class="skeleton-line-item statblock-bone" style="width: 94%; margin-top: 3px;" />
    <CdrSkeletonBone type="line" class="skeleton-line-item statblock-bone" style="width: 95%" />
    <CdrSkeletonBone type="line" class="skeleton-line-item statblock-bone" style="width: 45%" />
  </CdrSkeleton>
</template>

<script setup>
import { ref } from 'vue';
import { CdrSkeleton, CdrSkeletonBone } from "@rei/cedar";

import "@rei/cedar/dist/style/cdr-skeleton.css";
import "@rei/cedar/dist/style/cdr-skeleton-bone.css";
</script>

<style scoped>
.statblock-bone {
  background-image: linear-gradient(90deg, #efdfc2 0%, #FDF4E3 15%, #efdfc2 30%);
}

.property-line-skeleton {
  display: flex;
  justify-content: flex-start;
  gap: .5rem;
}

.skeleton-line-item {
  height: 1em;
  flex-grow: 0;
}
</style>
