<template>
  <cdr-skeleton>
    <h2><cdr-skeleton-bone type="line" style="width: 45%; height: 5rem" /></h2>
    <cdr-skeleton-bone type="line" style="width:30%" />
    <h3>Features</h3>
    <cdr-skeleton-bone class="item-bone" type="line" style="width:80%" />
    <div style="padding: 1rem 0">
      <div class="flex-bone">
        <cdr-skeleton-bone class="item-bone" type="line" style="width:20%; margin-right: 1rem" /> :
        <cdr-skeleton-bone class="item-bone" type="line"
          style="margin-left: 1rem; height:80%; width:80%; height: 2rem" />
      </div>
      <cdr-skeleton-bone class="item-bone" type="line" style="width: 95%; margin-top: 0" />
      <cdr-skeleton-bone class="item-bone" type="line" style="width: 85%" />
      <cdr-skeleton-bone class="item-bone" type="line" style="width: 75%" />
    </div>
    <div style="padding: 1rem 0">
      <div class="flex-bone">
        <cdr-skeleton-bone class="item-bone" type="line" style="width:20%; margin-right: 1rem" /> :
        <cdr-skeleton-bone class="item-bone" type="line"
          style="margin-left: 1rem; height:80%; width:80%; height: 2rem" />
      </div>
      <cdr-skeleton-bone class="item-bone" type="line" style="width: 95%; margin-top: 0" />
      <cdr-skeleton-bone class="item-bone" type="line" style="width: 85%" />
      <cdr-skeleton-bone class="item-bone" type="line" style="width: 75%" />
    </div>

    <div class="read-aloud">
      <p class="body-text">
        <cdr-skeleton-bone class="item-bone" type="line" style="width: 95%" />
        <cdr-skeleton-bone class="item-bone" type="line" style="width: 75%" />
        <cdr-skeleton-bone class="item-bone" type="line" style="width: 85%" />
        <cdr-skeleton-bone class="item-bone" type="line" style="width: 95%" />
        <cdr-skeleton-bone class="item-bone" type="line" style="width: 75%" />
      </p>
      <p class="body-text">
        <cdr-skeleton-bone class="item-bone" type="line" style="width: 95%" />
        <cdr-skeleton-bone class="item-bone" type="line" style="width: 75%" />
        <cdr-skeleton-bone class="item-bone" type="line" style="width: 85%" />
        <cdr-skeleton-bone class="item-bone" type="line" style="width: 95%" />
        <cdr-skeleton-bone class="item-bone" type="line" style="width: 75%" />
      </p>
    </div>
  </cdr-skeleton>
</template>

<script setup>
import { CdrSkeleton, CdrSkeletonBone } from "@rei/cedar";
</script>

<style scoped lang="scss">
.item-bone {
  height: 2rem;
}

.flex-bone {
  display: flex;
  align-items: center;
  margin-bottom: 0;
}

.read-aloud {
  background-color: #f4f2ed;
  color: #423b2fbf;
  padding: 1rem 2rem;
  font-style: italic;
}
</style>
