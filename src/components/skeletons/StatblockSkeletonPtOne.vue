<template>
    <CdrSkeleton>
        <div class="creature-heading">
            <CdrSkeletonBone type="line" class="statblock-bone" style="width:65%; height: 22px;" />
            <CdrSkeletonBone type="line" class="statblock-bone" style="width:45%; height: 1.2em;" />
        </div>
        <svg height="5" width="100%" class="tapered-rule">
            <polyline points="0,0 400,2.5 0,5"></polyline>
        </svg>
        <div class="property-block">
            <div class="property-line-skeleton">
                <CdrSkeletonBone type="line" class="skeleton-line-item statblock-bone" style="width: 6rem" />
                <CdrSkeletonBone type="line" class="skeleton-line-item statblock-bone" style="width: 2rem" />
            </div>
            <div class="property-line-skeleton">
                <CdrSkeletonBone type="line" class="skeleton-line-item statblock-bone" style="width: 5rem" />
                <CdrSkeletonBone type="line" class="skeleton-line-item statblock-bone" style="width: 7rem" />
            </div>
            <div class="property-line-skeleton">
                <CdrSkeletonBone type="line" class="skeleton-line-item statblock-bone" style="width: 4rem" />
                <CdrSkeletonBone type="line" class="skeleton-line-item statblock-bone" style="width: 3rem" />
            </div>
            <div>
                <CdrSkeletonBone type="line" class="skeleton-line-item statblock-bone"
                    style="width: 75%; height: 3.5rem; margin: 1rem auto;" />
            </div>
            <div class="property-line-skeleton">
                <CdrSkeletonBone type="line" class="skeleton-line-item statblock-bone" style="width: 7rem" />
                <CdrSkeletonBone type="line" class="skeleton-line-item statblock-bone" style="width: 4rem" />
            </div>
            <div class="property-line-skeleton">
                <CdrSkeletonBone type="line" class="skeleton-line-item statblock-bone" style="width: 8rem" />
                <CdrSkeletonBone type="line" class="skeleton-line-item statblock-bone" style="width: 20rem" />
            </div>
            <div class="property-line-skeleton">
                <CdrSkeletonBone type="line" class="skeleton-line-item statblock-bone" style="width: 4rem" />
                <CdrSkeletonBone type="line" class="skeleton-line-item statblock-bone" style="width: 26rem" />
            </div>
            <div class="property-line-skeleton">
                <CdrSkeletonBone type="line" class="skeleton-line-item statblock-bone" style="width: 5rem" />
                <CdrSkeletonBone type="line" class="skeleton-line-item statblock-bone" style="width: 24rem" />
            </div>
            <div class="property-line-skeleton">
                <CdrSkeletonBone type="line" class="skeleton-line-item statblock-bone" style="width: 3rem" />
                <CdrSkeletonBone type="line" class="skeleton-line-item statblock-bone" style="width: 4rem" />
            </div>
            <div class="property-line-skeleton">
                <CdrSkeletonBone type="line" class="skeleton-line-item statblock-bone" style="width: 4rem" />
                <CdrSkeletonBone type="line" class="skeleton-line-item statblock-bone" style="width: 5rem" />
            </div>
        </div>

        <svg height="5" width="100%" class="tapered-rule">
            <polyline points="0,0 400,2.5 0,5"></polyline>
        </svg>
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
  // If you have any data properties or methods, define them here. For example:
  // const myProperty = ref('');
</script>
  
<style scoped>
.tapered-rule {
    display: block;
    width: 100%;
    height: .4rem;
    border: none;
    color: #922610;
    fill: #922610;
}

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
  