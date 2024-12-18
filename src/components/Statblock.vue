<template>
    <div :style="widthStyle" :class="`container ${columns}`" @mouseover="showEditButton = true"
        @mouseleave="showEditButton = false">
        <div v-if="!loadingPart1" class="statblock">
            <div class="creature-heading" :class="{ 'editing': isEditing }">
                <h1 v-if="!isEditing">{{ monster.name }}</h1>
                <input v-else v-model="editedMonster.name" class="input-name" />

                <h2 v-if="!isEditing">{{ monster.type_and_alignment }}</h2>
                <input v-else v-model="editedMonster.type_and_alignment" class="input-type" />
            </div>


            <svg height="5" width="100%" class="tapered-rule">
                <polyline points="0,0 400,2.5 0,5"></polyline>
            </svg>

            <!-- Property Block -->
            <div class="property-block">
                <div :class="propertyLineClass" v-if="!isEditing">
                    <h4>Armor Class</h4>
                    <p>{{ monster.armor_class }}</p>
                </div>
                <div :class="propertyLineClass" v-else>
                    <h4>Armor Class</h4>
                    <input v-model="editedMonster.armor_class" />
                </div>
                <div :class="propertyLineClass" v-if="!isEditing">
                    <h4>Hit Points: </h4>
                    <p>{{ monster.hit_points }}</p>
                </div>
                <div :class="propertyLineClass" v-else>
                    <h4>Hit Points: </h4>
                    <input v-model="editedMonster.hit_points" />
                </div>
                <div :class="propertyLineClass" v-if="!isEditing">
                    <h4>Speed: </h4>
                    <p>{{ monster.speed }}</p>
                </div>
                <div :class="propertyLineClass" v-else>
                    <h4>Speed: </h4>
                    <input v-model="editedMonster.speed" />
                </div>

                <table class="scores">
                    <thead>
                        <tr>
                            <th v-for="(stat, key) in editedAttributes" :key="key">
                                <h4>{{ stat.stat }}</h4>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td v-for="(stat, key) in editedAttributes" :key="key" :class="{ 'editing': isEditing }">
                                <p v-if="!isEditing">{{ statDisplay(stat.base) }}</p>
                                <div v-else>
                                    <input type="number" v-model.number="stat.base" />
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div v-if="monster.skills && monster.skills.length > 0 && monster.skills !== 'None'"
                    :class="propertyLineClass">
                    <h4>Skills: </h4>
                    <p v-if="!isEditing">{{ monster.skills }}</p>
                    <input v-else v-model="editedMonster.skills" />
                </div>
                <div v-if="monster.saving_throws && monster.saving_throws.length > 0 && monster.saving_throws !== 'None'"
                    :class="propertyLineClass">
                    <h4>Saving Throws: </h4>
                    <p v-if="!isEditing">{{ monster.saving_throws }}</p>
                    <input v-else v-model="editedMonster.saving_throws" />
                </div>
                <div v-if="monster.damage_resistances && monster.damage_resistances.length > 0 && monster.damage_resistances !== 'None'"
                    :class="propertyLineClass">
                    <h4>Damage Resistances: </h4>
                    <p v-if="!isEditing">{{ monster.damage_resistances }}</p>
                    <input v-else v-model="editedMonster.damage_resistances" />
                </div>
                <div v-if="monster.damage_immunities && monster.damage_immunities.length > 0 && monster.damage_immunities !== 'None'"
                    :class="propertyLineClass">
                    <h4>Damage Immunities: </h4>
                    <p v-if="!isEditing">{{ monster.damage_immunities }}</p>
                    <input v-else v-model="editedMonster.damage_immunities" />
                </div>
                <div v-if="monster.condition_immunities && monster.condition_immunities.length > 0 && monster.condition_immunities !== 'None'"
                    :class="propertyLineClass">
                    <h4>Condition Immunities: </h4>
                    <p v-if="!isEditing">{{ monster.condition_immunities }}</p>
                    <input v-else v-model="editedMonster.condition_immunities" />
                </div>
                <div :class="propertyLineClass">
                    <h4>Senses: </h4>
                    <p v-if="!isEditing">{{ monster.senses }}</p>
                    <input v-else v-model="editedMonster.senses" />
                </div>
                <div :class="propertyLineClass">
                    <h4>Languages: </h4>
                    <p v-if="!isEditing">{{ monster.languages }}</p>
                    <input v-else v-model="editedMonster.languages" />
                </div>
                <div :class="propertyLineClass">
                    <h4>CR:</h4>
                    <p v-if="!isEditing">{{ monster.challenge_rating }}</p>
                    <select style="flex-grow: 1;" v-if="isEditing" v-model="editedMonster.challenge_rating">
                        <option v-for="cr in formattedArray" :key="cr" :value="cr">{{ cr }}</option>
                    </select>
                </div>
                <div :class="propertyLineClass">
                    <h4>Proficiency Bonus:</h4>
                    <p v-if="!isEditing">{{ monster.proficiency_bonus }}</p>
                    <input v-else v-model="editedMonster.proficiency_bonus" />
                </div>
            </div>

            <svg height="5" width="100%" class="tapered-rule">
                <polyline points="0,0 400,2.5 0,5"></polyline>
            </svg>

            <ul class="abilities">
                <div v-if="!isEditing">
                    <li v-for="(ability, index) in editedAbilities" :key="index">
                        <strong>{{ ability.name }}. </strong>
                        <span>{{ ability.description }}</span>
                    </li>
                </div>
                <div v-if="isEditing && !loadingAbilities" class="ability-forms">
                    <cdr-button class="regenerate-button" size="small" :full-width="true" modifier="secondary"
                        @click="generateAbilities(editedMonster, userSuggestion)">{{
                            monster.abilities.length > 0 ? 'Re-Generate Abilities' :
                                'Generate Abilities' }}</cdr-button>
                    <li v-for="(ability, index) in editedAbilities" :key="index">
                        <input v-model="ability.name" />
                        <textarea v-model="ability.description"></textarea>
                        <button class="remove-button" @click="removeAbility(index)">Remove</button>
                    </li>
                    <button class="add-button" size="small" :full-width="true" modifier="secondary"
                        @click="addAbility">Add
                        Ability</button>
                </div>
                <div v-if="loadingAbilities">
                    <StatblockAbilitiesSkeleton />
                </div>
            </ul>

            <div class="edit-save-buttons">
                <cdr-button size="small" modifier="secondary" v-if="showEditButton && !isEditing"
                    @click="enterEditMode">Edit</cdr-button>
                <cdr-button style="margin-right: 1rem" size="small" modifier="secondary" v-if="isEditing"
                    @click="saveChanges">Save</cdr-button>
                <cdr-button style="margin-right: 1.5rem" size="small" modifier="secondary" v-if="isEditing"
                    @click="cancelChanges">Cancel</cdr-button>
            </div>
        </div>

        <div v-if="loadingPart1" class="statblock">
            <StatblockSkeletonPtOne />
        </div>

        <div v-if="!loadingPart1 && !loadingPart2" class="statblock">
            <h3>Actions</h3>
            <ul class="abilities">
                <div v-if="!isEditing">
                    <li v-for="(action, index) in monster.actions" :key="'action-' + index">
                        <strong>{{ action.name }}: </strong>
                        <span>{{ action.description }}</span>
                    </li>
                </div>
                <div v-if="isEditing && !loadingActions" class="ability-forms">
                    <cdr-button class="regenerate-button" size="small" :full-width="true" modifier="secondary"
                        v-if="isEditing" @click="generateActions(editedMonster, userSuggestion)">{{ editedActions.length
                            > 0 ?
                            'Re-Generate Actions' : 'Generate Actions' }}</cdr-button>
                    <li v-for="(action, index) in editedActions" :key="'action-' + index">
                        <input v-model="action.name" />
                        <textarea v-model="action.description"></textarea>
                        <button class="remove-button" @click="removeAction(index)">Remove</button>
                    </li>
                </div>
                <div v-if="loadingActions">
                    <StatblockAbilitiesSkeleton />
                </div>
            </ul>
            <button class="add-button" v-if="isEditing && !loadingActions" @click="addAction">Add Action</button>
            <div>
                <h3 v-if="editedLegendaryActions.length > 0 || isEditing">Legendary Actions</h3>
                <p class="statblock-p" v-if="editedLegendaryActions.length > 0">The monster can take {{
                    editedLegendaryActions.length }}
                    legendary {{ editedLegendaryActions.length === 1 ? 'action' : 'actions' }}{{
                        editedLegendaryActions.length > 1 ? ', choosing from the options below' : '' }}. Only one legendary
                    action
                    option can be used at a time and only at the end of another creature's turn. The monster regains
                    spent legendary actions at the start of its turn.</p>
                <p class="statblock-p" v-if="isEditing && editedLegendaryActions.length === 0">Add some legendary
                    actions to the monster.
                    You can either add them one at at time manually or click "Generate Legendary Actions" to
                    generate actions for you. Please note that that adding legendary actions will make this creature
                    stronger than the CR provided.</p>
                <cdr-button class="regenerate-button" v-if="isEditing && !loadingLegendaryActions" size="small"
                    :full-width="true" modifier="secondary"
                    @click="generateLegendaryActions(editedMonster, userSuggestion)">{{
                        editedLegendaryActions.length > 0 ? 'Re-Generate Legendary Actions' :
                            'Generate Legendary Actions' }}</cdr-button>
                <ul class="abilities" v-if="editedLegendaryActions.length > 0 || isEditing">
                    <template v-if="!isEditing">
                        <li v-for="(action, index) in editedLegendaryActions" :key="'legendary-' + index">
                            <strong>{{ action.name }}: </strong>
                            <span>{{ action.description }}</span>
                        </li>
                    </template>
                    <template v-if="isEditing && !loadingLegendaryActions">
                        <div class="ability-forms">
                            <li v-for="(action, index) in editedLegendaryActions" :key="'legendary-' + index">
                                <input v-model="action.name" />
                                <textarea v-model="action.description"></textarea>
                                <button class="remove-button" @click="removeLegendaryAction(index)">Remove</button>
                            </li>
                            <button class="add-button" size="small" :full-width="true" modifier="secondary"
                                @click="addLegendaryAction">Add
                                Legendary Action</button>
                        </div>
                        <cdr-button style="margin-top: .5rem" size="small" :full-width="true" modifier="secondary"
                            v-if="editedLegendaryActions.length > 0" @click="clearLegendaryActions">Remove
                            All Legendary Actions</cdr-button>

                    </template>
                    <div v-if="loadingLegendaryActions">
                        <StatblockAbilitiesSkeleton />
                    </div>
                </ul>
            </div>
        </div>

        <div v-if="loadingPart2" class="statblock">
            <StatblockSkeletonPtTwo />
        </div>
    </div>
</template>

<script setup>
import { ref, computed, defineProps, onMounted, onBeforeUnmount, watch } from 'vue';
import { CdrButton } from '@rei/cedar';
import CRtoXP from '../data/cr-to-xp.json';
import { generateGptResponse } from "../util/open-ai.mjs";
import { legendaryActionsPrompt, actionsPrompt, monsterAbilitiesPrompt } from "../prompts/statblock-edit-prompts.mjs";
import StatblockSkeletonPtOne from './StatblockSkeletonPtOne.vue';
import StatblockSkeletonPtTwo from './StatblockSkeletonPtTwo.vue';
import StatblockAbilitiesSkeleton from './skeletons/StatblockAbilitiesSkeleton.vue';

const props = defineProps({
    monster: {
        type: Object,
        default: () => ({})
    },
    columns: {
        type: String,
        default: 'two_columns'
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
    },
    width: {
        type: Number,
        default: 0,
    },
    premium: {
        type: Boolean,
        default: false,
    },
});

const widthStyle = computed(() => props.width === 0 ? 'width: auto' : `width: ${props.width}px`);
const emit = defineEmits(['update-monster']);

const showEditButton = ref(false);
const isEditing = ref(false);
const editedMonster = ref({});
const editedActions = ref([]);
const editedAbilities = ref([]);
const editedLegendaryActions = ref([]);
const propertyLineClass = computed(() => isEditing.value ? 'property-line editing' : 'property-line');
const loadingAbilities = ref(false);
const loadingActions = ref(false);
const loadingLegendaryActions = ref(false);

//create a formatted array of CRs but make sure that they're sorted in ascending order. It should have 0, the fractions, and the whole numbers
function parseCR(cr) {
    if (cr.includes('/')) {
        const parts = cr.split('/');
        return parseInt(parts[0], 10) / parseInt(parts[1], 10);
    }
    return parseInt(cr, 10);
}

// Sorting the CR values
const formattedArray = Object.entries(CRtoXP)
    .sort((a, b) => parseCR(a[0]) - parseCR(b[0]))
    .map(([cr, xp]) => {
        const formattedXp = xp.toLocaleString();
        return `${cr} (${formattedXp} XP)`;
    });

// Helper function to calculate modifier
const calculateModifier = (stat) => Math.floor((stat - 10) / 2);

// Helper function to display stat with modifier
const statDisplay = (base) => {
    const modifier = calculateModifier(base);
    return `${base} (${modifier >= 0 ? '+' : ''}${modifier})`;
};

// Editable attributes based on parsedAttributes
const editedAttributes = ref([]);

// Watch for changes to the monster prop and update editedAttributes accordingly
watch(() => props.monster, (newMonster) => {
    if (newMonster) {
        editedMonster.value = { ...newMonster };
        editedActions.value = newMonster.actions ? [...newMonster.actions] : [];
        editedAbilities.value = newMonster.abilities ? [...newMonster.abilities] : [];
        editedLegendaryActions.value = newMonster.legendary_actions ? [...newMonster.legendary_actions] : [];

        const attrString = (newMonster.attributes || '').trim();
        if (!attrString) {
            // No attributes, just set empty
            editedAttributes.value = [];
        } else {
            editedAttributes.value = attrString
                .split(',')
                .map(a => a.trim())
                .filter(a => a !== '') // remove empty entries
                .map(attr => {
                    const parts = attr.split(' ').filter(Boolean);
                    const stat = parts[0] || '';
                    const baseString = parts[1] || '';
                    const baseMatch = baseString.match(/\d+/);
                    const baseValue = baseMatch ? parseInt(baseMatch[0], 10) : 10;
                    return { stat, base: baseValue };
                });
        }
    } else {
        editedMonster.value = {};
        editedActions.value = [];
        editedAbilities.value = [];
        editedLegendaryActions.value = [];
        editedAttributes.value = [];
    }
}, { immediate: true });


const removeAbility = (index) => {
    editedAbilities.value.splice(index, 1);
};

const removeAction = (index) => {
    editedActions.value.splice(index, 1);
};

const removeLegendaryAction = (index) => {
    editedLegendaryActions.value.splice(index, 1);
};

const addAbility = () => {
    editedAbilities.value.push({ name: '', description: '' });
};

const addAction = () => {
    editedActions.value.push({ name: '', description: '' });
};

const addLegendaryAction = () => {
    editedLegendaryActions.value.push({ name: '', description: '' });
};

const clearLegendaryActions = () => {
    editedLegendaryActions.value = []; // Clear all legendary actions
};

const enterEditMode = () => {
    isEditing.value = true;
};

const saveChanges = () => {
    // Filter out abilities, actions, and legendary actions with blank names or descriptions
    const filteredAbilities = editedAbilities.value.filter(ability => ability.name.trim() !== '' && ability.description.trim() !== '');
    const filteredActions = editedActions.value.filter(action => action.name.trim() !== '' && action.description.trim() !== '');
    const filteredLegendaryActions = editedLegendaryActions.value.filter(action => action.name.trim() !== '' && action.description.trim() !== '');

    // Convert attributes back to the string format before emitting
    editedMonster.value.attributes = editedAttributes.value.map(stat => {
        const modifier = calculateModifier(stat.base);
        return `${stat.stat} ${stat.base} (${modifier >= 0 ? '+' : ''}${modifier})`;
    }).join(', ');

    // Update the monster object with filtered lists
    editedMonster.value.abilities = filteredAbilities;
    editedMonster.value.actions = filteredActions;
    editedMonster.value.legendary_actions = filteredLegendaryActions;

    // Emit the updated monster object
    isEditing.value = false;
    emit('update-monster', editedMonster.value);
};

const cancelChanges = () => {
    isEditing.value = false;
    editedMonster.value = { ...props.monster };
    editedActions.value = [...props.monster.actions];
    editedLegendaryActions.value = props.monster.legendary_actions ? [...props.monster.legendary_actions] : [];
};
const editMonsterValidation = (json) => {
    try {
        const actions = JSON.parse(json);
        if (!Array.isArray(actions)) {
            return false;
        }

        for (const action of actions) {
            if (!action.name || !action.description) {
                return false;
            }
        }
        return true;
    } catch (e) {
        return false;
    }
};

async function generateLegendaryActions(monster, userSuggestion) {
    if (!props.premium) {
        alert('Generation of abilities, actions, and legendary actions in edit mode is only available to $5 patrons. Please consider becoming a Patron to access the premium statblock generator');
        return;
    }
    const prompt = legendaryActionsPrompt(monster, userSuggestion);
    try {
        loadingLegendaryActions.value = true;
        const newActionsObject = await generateGptResponse(prompt, editMonsterValidation, 3);
        const actions = JSON.parse(newActionsObject);
        editedLegendaryActions.value = actions;
    } finally {
        loadingLegendaryActions.value = false;
    }
}
async function generateActions(monster, userSuggestion) {
    if (!props.premium) {
        alert('Generation of abilities, actions, and legendary actions in edit mode is only available to $5 patrons. Please consider becoming a Patron to access the premium statblock generator');
        return;
    }
    const prompt = actionsPrompt(monster, userSuggestion);
    try {
        loadingActions.value = true;
        const newActionsObject = await generateGptResponse(prompt, editMonsterValidation, 3);
        const actions = JSON.parse(newActionsObject);
        editedActions.value = actions;
    } finally {
        loadingActions.value = false;
    }
}
async function generateAbilities(monster, userSuggestion) {
    if (!props.premium) {
        alert('Generation of abilities, actions, and legendary actions in edit mode is only available to $5 patrons. Please consider becoming a Patron to access the premium statblock generator');
        return;
    }
    const prompt = monsterAbilitiesPrompt(monster, userSuggestion);
    try {
        loadingAbilities.value = true;
        const newAbilitiesObject = await generateGptResponse(prompt, editMonsterValidation, 3);
        const abilities = JSON.parse(newAbilitiesObject);
        editedAbilities.value = abilities;
    } finally {
        loadingAbilities.value = false;
    }
}

const windowWidth = ref(window.innerWidth);
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
    return windowWidth.value <= 855 ? 'one_column' : props.columns;
});
</script>


<style scoped lang="scss">
input,
textarea,
select {
    border: 1px solid #cbab77;
    background-color: #fefdf9;
    padding: .75rem;
    font-size: 14px;

    &:focus {
        outline: none;
        box-shadow: inset 0 0 0 0.1rem #facc81;
    }
}

.regenerate-button {
    margin: 1rem 0;
}

textarea {
    height: 75px;
}

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
    position: relative;

    &.one_column {
        grid-template-columns: 1fr;
        width: 425px;
        max-width: calc(100vw - 2rem);
    }

    &.two_columns {
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
    }
}

.edit-save-buttons {
    display: none;
    position: absolute;
    top: 10px;
    right: 10px;
}


.container:hover .edit-save-buttons {
    display: inline-block;
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

    .statblock-p {
        margin: 1rem 0;
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

    .editing {
        display: flex;
        flex-direction: column;
    }
}

.input-name {
    font-size: 1.5em;
    margin-bottom: 8px;
    padding: 10px;
    flex-grow: 1;
    width: 100%;
}

.input-type {
    width: 100%;
}

.remove-button,
.add-button {
    background-color: #fefdf9;
    color: #8d7349;
    font-weight: bold;
    border: 1px solid #cbab77;
    padding: .5rem;
    cursor: pointer;
    width: 10rem;
    border-radius: 3px;

    &:hover {
        background-color: #cbab77;
        color: #fefdf9;
        transition: .3s, color .3s;
    }

    &:focus {
        outline: 2px solid #facc81;
    }
}

.add-button {
    margin-bottom: 1rem;
    // letter-spacing: -0.008rem;
    // font-size: 1.4rem;
    // line-height: 1.8rem;
    // padding: 0.6rem 1.2rem;
    width: 100%;
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
        white-space: nowrap;
    }

    p {
        margin: 0 .5rem;
    }

    &.editing {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: .5rem;

        input {
            flex-grow: 1;
        }
    }
}

.scores {
    width: 90%;
    text-align: center;
    margin: 1rem auto;

    input {
        width: 50px;
        text-align: center;
    }

    td.editing {
        padding: 1px;
    }
}

.abilities {
    font-size: 14px;
    list-style-type: none;
    margin-left: -3.8rem;

    li {
        margin: 1rem 0;
        list-style-type: none;
    }

    strong {
        font-style: italic;
    }

    .ability-forms li {
        display: flex;
        flex-direction: column;
        gap: .75rem;
        margin-bottom: 2rem;
        list-style-type: none;
    }
}

@media screen and (max-width: 855px) {
    .container {
        background-image: none;

        &.one_column {
            width: inherit;
        }
    }
}
</style>