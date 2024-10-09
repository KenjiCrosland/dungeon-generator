import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import '@rei/cedar/dist/cdr-fonts.css';
import '@rei/cedar/dist/cdr-reset.css';

/* import each component used in your project  */
import '@rei/cedar/dist/style/cdr-text.css';
import '@rei/cedar/dist/style/cdr-button.css';
import '@rei/cedar/dist/style/cdr-link.css';
import '@rei/cedar/dist/style/cdr-accordion.css';
import '@rei/cedar/dist/style/cdr-accordion-group.css';
import '@rei/cedar/dist/style/cdr-input.css';
import '@rei/cedar/dist/style/cdr-grid.css';
import '@rei/cedar/dist/style/cdr-card.css';
import '@rei/cedar/dist/style/cdr-form-group.css';
import '@rei/cedar/dist/style/cdr-body.css';
import '@rei/cedar/dist/style/cdr-skeleton.css';
import '@rei/cedar/dist/style/cdr-skeleton-bone.css';

createApp(App).mount('#app');
