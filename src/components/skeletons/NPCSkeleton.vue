<template>
  <CdrSkeleton>
    <p>
      <CdrSkeletonBone type="heading" style="width: 35%; height: 30px" />
    </p>

    <div class="focus-text">
      <CdrSkeletonBone type="line" style="width:85%" />
      <CdrSkeletonBone type="line" style="width:90%" />
      <CdrSkeletonBone type="line" style="width:75%" />
    </div>
    <p>
      <CdrSkeletonBone type="line" style="width:95%" />
      <CdrSkeletonBone type="line" style="width:90%" />
      <CdrSkeletonBone type="line" style="width:85%" />
    </p>
    <p>
      <CdrSkeletonBone type="line" style="width:95%" />
      <CdrSkeletonBone type="line" style="width:90%" />
      <CdrSkeletonBone type="line" style="width:85%" />
    </p>
    <p>
      <CdrSkeletonBone type="line" style="width:95%" />
      <CdrSkeletonBone type="line" style="width:90%" />
      <CdrSkeletonBone type="line" style="width:85%" />
    </p>
    <p>
      <CdrSkeletonBone type="line" style="width:95%" />
      <CdrSkeletonBone type="line" style="width:90%" />
      <CdrSkeletonBone type="line" style="width:85%" />
    </p>
    <h3>Relationships</h3>
    <div>
      <div class="flex-bone">
        <CdrSkeletonBone type="line" style="width:10%;" /> :
        <CdrSkeletonBone type="line" style="width:80%;" />
      </div>
      <CdrSkeletonBone type="line" style="width:100%; margin-top: 0" />
      <CdrSkeletonBone type="line" style="width:90%;" />
      <CdrSkeletonBone type="line" style="width:85%;" />
    </div>

    <div>
      <div class="flex-bone">
        <CdrSkeletonBone type="line" style="width:10%;" /> :
        <CdrSkeletonBone type="line" style="width:80%;" />
      </div>
      <CdrSkeletonBone type="line" style="width:100%; margin-top: 0" />
      <CdrSkeletonBone type="line" style="width:90%;" />
      <CdrSkeletonBone type="line" style="width:85%;" />
    </div>

    <div>
      <div class="flex-bone">
        <CdrSkeletonBone type="line" style="width:10%;" /> :
        <CdrSkeletonBone type="line" style="width:80%;" />
      </div>
      <CdrSkeletonBone type="line" style="width:100%; margin-top: 0" />
      <CdrSkeletonBone type="line" style="width:90%;" />
      <CdrSkeletonBone type="line" style="width:85%;" />
    </div>

    <h3>Roleplaying Tips</h3>

    <p style="margin-top: 0">
      <CdrSkeletonBone type="line" style="width:95%" />
      <CdrSkeletonBone type="line" style="width:90%" />
      <CdrSkeletonBone type="line" style="width:85%" />
      <CdrSkeletonBone type="line" style="width:95%" />
      <CdrSkeletonBone type="line" style="width:60%" />
    </p>
  </CdrSkeleton>
</template>

<script setup>
import { CdrSkeleton, CdrSkeletonBone } from "@rei/cedar";
</script>

<style scoped lang="scss">
@import '@rei/cdr-tokens/dist/scss/cdr-tokens.scss';

.focus-text {
  background-color: $cdr-color-background-secondary;
  color: $cdr-color-text-secondary;
  padding: 1rem 2rem;
  font-style: italic;
}

.flex-bone {
  display: flex;
  gap: 10px;
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
