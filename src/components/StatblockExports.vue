<template>
  <div class="exports">
    <div v-if="!loading" class="instructions">
      <h4>Use Homebrewery to Make a Beautiful PDF of Your Statblock!</h4>
      <ol>
        <li>Click "Copy as Markdown" to copy the content.</li>
        <li>Visit <a href="https://homebrewery.naturalcrit.com/new" target="_blank"
            rel="noopener noreferrer">Homebrewery</a>.</li>
        <li>Paste the markdown and edit as you like.</li>
        <li>Enjoy the formatted content!</li>
      </ol>
      <cdr-button @click="copyAsMarkdown">Copy as Markdown</cdr-button>
    </div>
    <div v-if="!loading" class="instructions">
      <h4>Export Statblock to Improved Initiative App</h4>
      <ol>
        <li>Click "Copy as Improved Initiative JSON" to copy the content.</li>
        <li>Visit <a href="https://improvedinitiative.app/e/" target="_blank" rel="noopener noreferrer">The Improved
            Initiative App</a>.</li>
        <li>Click "Add New" and choose "JSON" mode.</li>
        <li>Paste your JSON and save the monster.</li>
        <li>Have fun!</li>
      </ol>
      <cdr-button @click="copyAsImprovedInitiative">Copy as Improved Initiative JSON</cdr-button>
    </div>
    <div v-if="!loading" class="instructions">
      <h4>Export this Monster to Foundry VTT!</h4>
      <ol>
        <li>Click "Copy as Foundry VTT text" to copy the content.</li>
        <li>Follow the <a href="https://foundryvtt.com/packages/5e-statblock-importer" target="_blank"
            rel="noopener noreferrer">Import Instructions</a>.</li>
        <li>Have Fun!</li>
      </ol>
      <cdr-button @click="copyAsVTT">Copy in Foundry VTT Text Format</cdr-button>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import { CdrButton } from "@rei/cedar";
import { statblockToMarkdown } from '../util/convertToMarkdown.mjs';
import { convertToImprovedInitiative } from '../util/convertToImprovedInitiative.mjs';
import { convertToFoundryVTT } from '../util/convertToFoundryVTT.mjs';

const props = defineProps({
  monster: Object,
  columns: { type: String, default: 'two_columns' },
  loading: { type: Boolean, default: false }
});

const copyAsMarkdown = () => {
  navigator.clipboard.writeText(statblockToMarkdown(props.monster, props.columns))
    .then(() => alert('Content copied as markdown!'))
    .catch(() => alert('Failed to copy content.'));
};

const copyAsVTT = () => {
  navigator.clipboard.writeText(convertToFoundryVTT(props.monster))
    .then(() => alert('Content copied in Foundry VTT Format!'))
    .catch(() => alert('Failed to copy content.'));
};

const copyAsImprovedInitiative = () => {
  navigator.clipboard.writeText(JSON.stringify(convertToImprovedInitiative(props.monster)))
    .then(() => alert('Copied as Improved Initiative JSON!'))
    .catch(() => alert('Failed to copy content.'));
};
</script>

<style scoped>
.exports {
  max-width: 850px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.instructions {
  padding: 0 3rem 1rem;
  margin: 0 auto;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
}

button {
  margin: 2rem auto 1rem;
}

@media screen and (max-width: 855px) {
  .exports {
    grid-template-columns: 1fr;
  }
}
</style>
