<template>
  <CdrSkeleton>
    <p>
      <CdrSkeletonBone type="heading" style="width: 35%; height: 30px" />
    </p>

    <div class="read-aloud-box">
      <CdrSkeletonBone type="line" style="width:85%" />
      <CdrSkeletonBone type="line" style="width:90%" />
      <CdrSkeletonBone type="line" style="width:75%" />
    </div>

    <div style="margin-top: 1.5rem;">
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
    </div>

    <h3>Relationships</h3>
    <div class="relationship-box">
      <CdrSkeletonBone type="line" style="width:20%; margin-bottom: 0.5rem;" />
      <CdrSkeletonBone type="line" style="width:100%;" />
      <CdrSkeletonBone type="line" style="width:90%;" />
    </div>

    <div class="relationship-box">
      <CdrSkeletonBone type="line" style="width:25%; margin-bottom: 0.5rem;" />
      <CdrSkeletonBone type="line" style="width:100%;" />
      <CdrSkeletonBone type="line" style="width:85%;" />
    </div>

    <div class="relationship-box">
      <CdrSkeletonBone type="line" style="width:18%; margin-bottom: 0.5rem;" />
      <CdrSkeletonBone type="line" style="width:100%;" />
      <CdrSkeletonBone type="line" style="width:95%;" />
    </div>
  </CdrSkeleton>
</template>

<script setup>
import { CdrSkeleton, CdrSkeletonBone } from "@rei/cedar";
</script>

<style scoped lang="scss">
@import '@rei/cdr-tokens/dist/rei-dot-com/scss/cdr-tokens.scss';

.read-aloud-box {
  background-color: #fafaf6;
  padding: 1rem 2rem;
  margin: 1rem 0;
}

.relationship-box {
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f4f2ed;
  border-radius: 4px;
}
</style>
