<template>
    <div>
    <div :class="`container ${columns}`">
        <div v-if="!loadingPart1 && monster" class="statblock">
            <div class="creature-heading">
                <h1>{{ monster.name }}</h1>
                <h2>{{ monster.type_and_alignment }}</h2>
            </div>
            <svg height="5" width="100%" class="tapered-rule">
                <polyline points="0,0 400,2.5 0,5"></polyline>
            </svg>
            <div class="property-block">
                <div class="property-line">
                    <h4>Armor Class</h4>
                    <p>{{ monster.armor_class }}</p>
                </div>
                <div class="property-line">
                    <h4>Hit Points: </h4>
                    <p>{{ monster.hit_points }}</p>
                </div>
                <div class="property-line">
                    <h4>Speed: </h4>
                    <p>{{ monster.speed }}</p>
                </div>
                <table class="scores">
                    <tr>
                        <th v-for="attribute in parsedAttributes" :key="attribute.stat">
                            <h4>{{ attribute.stat }}</h4>
                        </th>
                    </tr>
                    <tr>
                        <td v-for="attribute in parsedAttributes" :key="attribute.stat">
                            <p>{{ attribute.value }}</p>
                        </td>
                    </tr>
                </table>
                <div v-if="monster.skills && monster.skills.length > 0 && monster.skills !== 'None'" class="property-line">
                    <h4>Skills: </h4>
                    <p> {{ monster.skills }}</p>
                </div>
                <div v-if="monster.saving_throws && monster.saving_throws.length > 0 && monster.saving_throws !== 'None'"
                    class="property-line">
                    <h4>Saving Throws: </h4>
                    <p> {{ monster.saving_throws }}</p>
                </div>
                <div v-if="monster.damage_resistances && monster.damage_resistances.length > 0 && monster.damage_resistances !== 'None'"
                    class="property-line">
                    <h4>Damage Resistances: </h4>
                    <p>{{ monster.damage_resistances }}</p>
                </div>
                <div v-if="monster.damage_immunities && monster.damage_immunities.length > 0 && monster.damage_immunities !== 'None'"
                    class="property-line">
                    <h4>Damage Immunities: </h4>
                    <p>{{ monster.damage_immunities }}</p>
                </div>
                <div v-if="monster.condition_immunities && monster.condition_immunities.length > 0 && monster.condition_immunities !== 'None'"
                    class="property-line">
                    <h4>Condition Immunities: </h4>
                    <p>{{ monster.condition_immunities }}</p>
                </div>
                <div class="property-line">
                    <h4>Senses: </h4>
                    <p>{{ monster.senses }}</p>
                </div>
                <div class="property-line">
                    <h4>Languages: </h4>
                    <p>{{ monster.languages }}</p>
                </div>
                <div class="property-line">
                    <h4>CR:</h4>
                    <p>{{ monster.challenge_rating }}</p>
                </div>
                <div class="property-line">
                    <h4>Proficiency Bonus:</h4>
                    <p>{{ monster.proficiency_bonus }}</p>
                </div>
            </div>
            <svg height="5" width="100%" class="tapered-rule">
                <polyline points="0,0 400,2.5 0,5"></polyline>
            </svg>
            <ul class="abilities">
                <li v-for="(ability, index) in monster.abilities" :key="index">
                    <strong>{{ ability.name }}. </strong>{{ ability.description }}
                </li>
            </ul>
        </div>
        <div v-if="loadingPart1" class="statblock">
            <StatblockSkeletonPtOne />
        </div>
        <div v-if="!loadingPart2 && monster" class="statblock">
            <h3>Actions</h3>
            <ul class="abilities">
                <li v-for="(action, index) in monster.actions" :key="index">
                    <strong>{{ action.name }}: </strong>{{ action.description }}
                </li>
            </ul>
            <div v-if="monster.legendary_actions && monster.legendary_actions.length > 0">
                <h3>Legendary Actions</h3>
                <p>The monster can take 3 legendary actions, choosing from the options below. Only one legendary action
                    option can be used at a time and only at the end of another creature's turn. The monster regains spent
                    legendary actions at the start of its turn.</p>
                <ul class="abilities">
                    <li v-for="(action, index) in monster.legendary_actions" :key="index">
                        <strong>{{ action.name }}: </strong>{{ action.description }}
                    </li>
                </ul>
            </div>
        </div>
        <div v-if="loadingPart2" class="statblock">
            <StatblockSkeletonPtTwo />
        </div>
    </div>
    <div class="copy-statblock-buttons" v-if="copyButtons && !loadingPart1 && !loadingPart2 && monster">
        <strong>Export:</strong>
        <cdr-button modifier="secondary" size="small" @click="copyAsMarkdown">Homebrewery Markdown</cdr-button>
        <cdr-button modifier="secondary" size="small" @click="copyAsVTT">Foundry VTT</cdr-button>
        <cdr-button modifier="secondary" size="small" @click="copyAsImprovedInitiative">Improved Initiative</cdr-button>
    </div>
</div>
</template>
  
<script setup>
import StatblockSkeletonPtOne from './StatblockSkeletonPtOne.vue';
import StatblockSkeletonPtTwo from './StatblockSkeletonPtTwo.vue';
import { ref, computed, defineProps, onMounted, onBeforeUnmount } from 'vue';
import { statblockToMarkdown } from '../util/convertToMarkdown.mjs';
import { convertToImprovedInitiative } from '../util/convertToImprovedInitiative.mjs';
import { convertToFoundryVTT } from '../util/convertToFoundryVTT.mjs';
import { CdrToggleButton, CdrToggleGroup, CdrButton, CdrList, CdrSkeleton, CdrSkeletonBone } from "@rei/cedar";
import "@rei/cedar/dist/style/cdr-toggle-group.css";
import "@rei/cedar/dist/style/cdr-toggle-button.css";
import "@rei/cedar/dist/style/cdr-list.css";
import "@rei/cedar/dist/style/cdr-button.css";
import "@rei/cedar/dist/style/cdr-skeleton.css";
import "@rei/cedar/dist/style/cdr-skeleton-bone.css";
// Props
const props = defineProps({
    monster: {
        type: Object,
        default: () => ({})
    },
    columns: {
        type: String,
        default: 'two_columns'
    },
    copyButtons: {
        type: Boolean,
        default: false,
    },
    loadingPart1: {
        type: Boolean,
        default: false,
    },
    loadingPart2: {
        type: Boolean,
        default: false,
    },
    errorMessage: {
        type: String,
        default: '',
    }
});

const windowWidth = ref(window.innerWidth);
const userColumnsPreference = ref(props.columns);
const onResize = () => {
    windowWidth.value = window.innerWidth;
};

onMounted(() => {
    window.addEventListener('resize', onResize);
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', onResize);
});


const columns = computed(() => {
    return windowWidth.value <= 855 ? 'one_column' : userColumnsPreference.value;
});

const shouldDisplayInterface = computed(() => {
    return windowWidth.value > 855;
});


// Computed properties
const parsedAttributes = computed(() => {
    return props.monster.attributes.split(',').map(attr => {
        const [stat, ...valueParts] = attr.trim().split(' ');
        const value = valueParts.join(' ');
        return { stat, value };
    });
});

const copyAsMarkdown = () => {

const markdownContent = statblockToMarkdown(props.monster, columns.value);

if (markdownContent) {
    const textarea = document.createElement('textarea');
    textarea.textContent = markdownContent;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    // Optionally, display a message that the content has been copied.
    alert('Content copied as markdown!');
} else {
    // If there is no content to copy, display a message to the user.
    alert('No content available to copy as markdown.');
}
}

const copyAsVTT = () => {

const VTTContent = convertToFoundryVTT(props.monster);

if (VTTContent) {
const textarea = document.createElement('textarea');
textarea.textContent = VTTContent;
document.body.appendChild(textarea);
textarea.select();
document.execCommand('copy');
document.body.removeChild(textarea);

// Optionally, display a message that the content has been copied.
alert('Content copied in Foundry VTT Format!');
} else {
// If there is no content to copy, display a message to the user.
alert('No content available to copy as markdown.');
}
}

const copyAsImprovedInitiative = () => {

const improvedInitiativeJSON = convertToImprovedInitiative(props.monster);
if (improvedInitiativeJSON) {
    const textarea = document.createElement('textarea');
    textarea.textContent = JSON.stringify(improvedInitiativeJSON);
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    // Optionally, display a message that the content has been copied.
    alert('Copied as Improved Initiative JSON!');
} else {
    // If there is no content to copy, display a message to the user.
    alert('No content available to copy.');
}
}

</script>

<style lang="scss" scoped>
.container {
    display: grid;

    justify-content: center;
    background: #FDF1DC;
    background-image: url('https://cros.land/wp-content/uploads/2023/06/parchment-fee031d8.jpg');
    background-blend-mode: overlay;
    background-attachment: fixed;

    margin: 2rem auto;
    padding: 16px 24px;
    box-shadow: 1px 4px 14px #888;

    &.one_column {
        grid-template-columns: 1fr;
        width: 425px;
        max-width: calc(100vw - 2rem);
    }

    &.two_columns {
        grid-template-columns: 1fr 1fr;
        width: 700px;
        gap: 2rem;
    }
}

.copy-statblock-buttons {
    display: flex;
    gap: 1rem;
    height: 3.8rem;
    align-items: center;
    justify-content: center;
}
.exports {
    max-width: 740px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
}

.statblock {
    font-family: 'Noto Sans', 'Myriad Pro', Calibri, Helvetica, Arial, sans-serif;
    text-align: left;
    font-size: 14px;
    line-height: 1.2em;
    display: block;

    box-sizing: border-box;

    h3 {
        border-bottom: 2px solid #922610;
        color: #922610;
        font-size: 24px;
        font-variant: small-caps;
        font-weight: 400;
        letter-spacing: .1rem;
        margin: 20px 0 0;
        padding: 0 0 10px;
        text-indent: .5rem;
    }
}

.creature-heading {
    margin: 1rem 0;

    h1 {
        font-family: 'Libre Baskerville', 'Lora', 'Calisto MT', 'Bookman Old Style', Bookman, 'Goudy Old Style', Garamond, 'Hoefler Text', 'Bitstream Charter', Georgia, serif;
        color: #922610;
        font-size: 24px;
        line-height: 1.4em;
        margin: 10px 0 0;
        letter-spacing: 1px;
        font-variant: small-caps;
        font-weight: bold;
    }

    h2 {
        font-family: 'Noto Sans', 'Myriad Pro', Calibri, Helvetica, Arial, sans-serif;
        font-weight: normal;
        font-style: italic;
        font-size: 14px;
        line-height: 1.2em;
        margin: 0;
    }
}

.tapered-rule {
    display: block;
    width: 100%;
    height: .4rem;
    border: none;
    color: #922610;
    fill: #922610;
}

.property-block {
    padding: 1rem .2rem;

    h4,
    p {
        display: inline;
        font-size: 14px;
        line-height: 1.2em;
    }

    h4 {
        color: #7A200D;
    }

    p {
        color: #922610;
    }
}

.property-line {
    h4 {
        margin: 0;
    }

    p {
        margin: 0 .5rem;
    }
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

//linear-gradient(90deg, #e2d9ca 0%, #FDF4E3 15%, #e2d9ca 30%)
.scores {
    width: 90%;
    text-align: center;
    margin: 1rem auto;
}

.abilities {
    font-size: 14px;
    list-style-type: none;
    margin-left: -3.8rem;

    li {
        margin: 1rem 0;
    }

    strong {
        font-style: italic;
    }
}

.instructions {
    padding: 3rem;
    margin: 0 auto;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
}

.markdown-button {
    display: flex;

    button {
        margin: 2rem auto 1rem;
    }
}

@media screen and (max-width: 745px) {
    .exports {
    grid-template-columns: 1fr;
}
    .container {
        background-image: none;

        &.one_column {
            width: inherit;
        }
    }
}
</style>