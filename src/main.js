import { createApp } from 'vue';
import { createPinia } from 'pinia';

import './style.css';
import App from './App.vue';
import '@rei/cedar/dist/cdr-fonts.css';
import '@rei/cedar/dist/cdr-reset.css';

/* import each component used in your project  */
import '@rei/cedar/dist/style/cdr-text.css';
import '@rei/cedar/dist/style/cdr-button.css';
import '@rei/cedar/dist/style/cdr-link.css';
import '@rei/cedar/dist/style/cdr-list.css';
import '@rei/cedar/dist/style/cdr-select.css';
import '@rei/cedar/dist/style/cdr-tooltip.css';
import '@rei/cedar/dist/style/cdr-toggle-group.css';
import '@rei/cedar/dist/style/cdr-toggle-button.css';
import '@rei/cedar/dist/style/cdr-accordion.css';
import '@rei/cedar/dist/style/cdr-accordion-group.css';
import '@rei/cedar/dist/style/cdr-input.css';
import '@rei/cedar/dist/style/cdr-grid.css';
import '@rei/cedar/dist/style/cdr-card.css';
import '@rei/cedar/dist/style/cdr-form-group.css';
import '@rei/cedar/dist/style/cdr-body.css';
import '@rei/cedar/dist/style/cdr-skeleton.css';
import '@rei/cedar/dist/style/cdr-skeleton-bone.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.mount('#app');
