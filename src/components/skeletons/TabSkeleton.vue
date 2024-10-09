<template>
  <CdrSkeleton>
    <cdr-list>
      <li style="margin-bottom: 3rem">
        <CdrSkeletonBone type="heading" style="width: 50%; height: 15px" />
        <p>
          <CdrSkeletonBone type="line" style="width:95%" />
          <CdrSkeletonBone type="line" style="width:90%" />
          <CdrSkeletonBone type="line" style="width:85%" />
        </p>
      </li>
      <li class="bone-list-item">
        <CdrSkeletonBone type="heading" style="width: 50%; height: 15px" />
        <p>
          <CdrSkeletonBone type="line" style="width:95%" />
          <CdrSkeletonBone type="line" style="width:90%" />
          <CdrSkeletonBone type="line" style="width:85%" />
        </p>
      </li>
      <li class="bone-list-item">
        <CdrSkeletonBone type="heading" style="width: 50%; height: 15px" />
        <p>
          <CdrSkeletonBone type="line" style="width:95%" />
          <CdrSkeletonBone type="line" style="width:90%" />
          <CdrSkeletonBone type="line" style="width:85%" />
        </p>
      </li>
      <li class="bone-list-item">
        <CdrSkeletonBone type="heading" style="width: 50%; height: 15px" />
        <p>
          <CdrSkeletonBone type="line" style="width:95%" />
          <CdrSkeletonBone type="line" style="width:90%" />
          <CdrSkeletonBone type="line" style="width:85%" />
        </p>
      </li>
      <li class="bone-list-item">
        <CdrSkeletonBone type="heading" style="width: 50%; height: 15px" />
        <p>
          <CdrSkeletonBone type="line" style="width:95%" />
          <CdrSkeletonBone type="line" style="width:85%" />
        </p>
      </li>
    </cdr-list>
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
