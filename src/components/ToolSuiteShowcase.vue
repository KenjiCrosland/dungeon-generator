<template>
  <div class="tool-suite-wrapper">
    <!-- Collapsible Banner Version -->
    <div class="tool-suite-banner" :class="{ 'expanded': isExpanded }">
      <div class="banner-header" @click="toggleExpanded">
        <div class="banner-title">
          <span class="material-symbols-outlined suite-icon">explore</span>
          <span class="suite-label">Kenji's RPG Tool Suite</span>
          <span v-if="!isMobile" class="tool-count">{{ currentTools.length }} Tools Available</span>
        </div>

        <div class="banner-actions">
          <span v-if="!isMobile" class="current-tool">{{ currentToolName }}</span>
          <button class="expand-button" @click.stop="toggleExpanded" aria-label="Toggle tools">
            <span class="material-symbols-outlined">
              {{ isExpanded ? 'expand_less' : 'expand_more' }}
            </span>
            <span>{{ isExpanded ? 'Hide' : (isMobile ? 'See More Tools' : 'See More Tools') }}</span>
          </button>
        </div>
      </div>

      <transition name="slide">
        <div v-if="isExpanded" class="banner-content">
          <!-- Blog Link in corner -->
          <div class="top-corner-links">
            <a href="https://cros.land/" class="blog-link">
              <span class="material-symbols-outlined">home</span>
              <span>Blog & Resources</span>
            </a>
          </div>

          <!-- Premium Toggle -->
          <div class="premium-toggle">
            <span :class="{ 'active': !showPremium }">Free Tools</span>
            <label class="toggle-switch">
              <input type="checkbox" v-model="showPremium" />
              <span class="slider"></span>
            </label>
            <span :class="{ 'active': showPremium }">
              <span class="material-symbols-outlined premium-icon">star</span>
              Premium Tools
            </span>
          </div>

          <!-- Tools Grid -->
          <div class="tools-grid">
            <a v-for="tool in currentTools" :key="tool.url" :href="tool.url" class="tool-card"
              :class="{ current: isCurrentTool(tool.url), premium: tool.premium }">
              <div class="tool-icon">
                <span class="material-symbols-outlined">{{ tool.icon }}</span>
              </div>
              <div class="tool-info">
                <h4>{{ tool.name }}</h4>
                <p>{{ tool.description }}</p>
                <span v-if="tool.premium" class="premium-badge">
                  <span class="material-symbols-outlined">star</span> Premium
                </span>
              </div>
              <div v-if="isCurrentTool(tool.url)" class="current-indicator">
                Current Tool
              </div>
            </a>
          </div>

          <!-- Premium Features Info -->
          <div v-if="showPremium" class="premium-features-info">
            <p class="features-note">
              <strong>Premium features:</strong> Unlimited generations • Save & export • Cross-browser access •
              Additional features per tool
            </p>
          </div>

          <!-- Premium CTA (only when NOT a supporter) -->
          <div v-if="!showPremium && premiumTools.length > 0 && !isSupporter" class="premium-cta">
            <div class="cta-content">
              <span class="material-symbols-outlined cta-icon">workspace_premium</span>
              <div>
                <strong>Unlock {{ premiumTools.length }} Premium Tools</strong>
                <p>Get access to advanced features and exclusive generators</p>
              </div>
              <button class="cta-button primary" @click="showPremium = true">
                View Premium Tools
              </button>
            </div>
          </div>

          <!-- Supporter Thank-You (replaces Patreon CTA when premium=true) -->
          <div v-if="isSupporter && showPremium" class="supporter-thanks" role="status" aria-live="polite">
            <div class="cta-content">
              <span class="material-symbols-outlined cta-icon">favorite</span>
              <div>
                <strong>Thank you for supporting my work ❤️</strong>
                <p>Your patronage enables ongoing development and improvements.</p>
              </div>
            </div>
          </div>

          <!-- Patreon CTA (only when NOT a supporter) -->
          <div v-if="showPremium && !isSupporter" class="patreon-cta">
            <div class="cta-content">
              <span class="material-symbols-outlined cta-icon">favorite</span>
              <div>
                <strong>Become a Patron</strong>
                <p>Support development and unlock all premium features for $5/month</p>
              </div>
              <a class="cta-button primary" href="https://patreon.com/ai_rpg_tookit" target="_blank" rel="noopener">
                Join on Patreon
              </a>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- Floating Widget Version (Alternative) -->
    <div v-if="showFloatingWidget" class="floating-widget" :class="{ open: widgetOpen }">
      <button class="widget-trigger" @click="widgetOpen = !widgetOpen">
        <span class="material-symbols-outlined widget-icon">apps</span>
        <span class="widget-label">Tool Suite</span>
        <span class="widget-badge">{{ currentTools.length }}</span>
      </button>

      <transition name="fade-scale">
        <div v-if="widgetOpen" class="widget-menu">
          <div class="widget-header">
            <h3>RPG Tool Suite</h3>
            <button @click="widgetOpen = false" class="close-btn" aria-label="Close">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <div class="widget-tools">
            <a v-for="tool in currentTools.slice(0, 5)" :key="tool.url" :href="tool.url" class="widget-tool">
              <span class="material-symbols-outlined tool-mini-icon">{{ tool.icon }}</span>
              <span>{{ tool.shortName || tool.name }}</span>
            </a>
          </div>
          <div class="widget-footer">
            <button @click="isExpanded = true; widgetOpen = false" class="view-all">
              View All Tools →
            </button>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  displayMode: { type: String, default: 'banner' }, // 'banner' or 'widget'
  premium: { type: Boolean, default: false },       // supporter flag
  currentToolUrl: { type: String, default: '' }
});

const isExpanded = ref(false);
const showPremium = ref(false);
const widgetOpen = ref(false);
const showFloatingWidget = ref(false);
const isMobile = ref(false);

const isSupporter = computed(() => !!props.premium);

const mq = typeof window !== 'undefined' ? window.matchMedia('(max-width: 768px)') : null;
const setMobile = () => (isMobile.value = mq ? mq.matches : false);

const tools = [
  // Free
  { name: 'Monster Statblock Generator', shortName: 'Monsters', description: 'Create balanced D&D 5e monster statblocks', url: 'https://cros.land/ai-powered-dnd-5e-monster-statblock-generator/', icon: 'pest_control', premium: false, category: 'combat' },
  { name: 'Dungeon Generator 2.0', shortName: 'Dungeons', description: 'Generate complete dungeons with rooms, encounters, and boss battles', url: 'https://cros.land/kenjis-dungeon-generator-2-0/', icon: 'map', premium: false, category: 'exploration' },
  { name: 'Magic Item Generator', shortName: 'Items', description: 'Create unique magic items with lore and balanced mechanics.', url: 'https://cros.land/dnd-5e-magic-item-generator/', icon: 'auto_fix_high', premium: false, category: 'items' },
  { name: 'Encounter Generator', shortName: 'Encounters', description: 'Build balanced combat encounters for any party composition', url: 'https://cros.land/dnd-5e-encounter-generator/', icon: 'sports_kabaddi', premium: false, category: 'combat' },
  { name: 'Setting Generator', shortName: 'Settings', description: 'World-building tool for creating rich campaign settings.', url: 'https://cros.land/rpg-setting-generator-and-world-building-tool/', icon: 'public', premium: false, category: 'worldbuilding' },
  { name: 'Location Description Generator', shortName: 'Locations', description: 'Generate detailed location descriptions for immediate use in your campaign', url: 'https://cros.land/ai-rpg-location-generator/', icon: 'fort', premium: false, category: 'worldbuilding' },
  { name: 'NPC Generator', shortName: 'NPCs', description: 'Create memorable NPCs with personalities and backstories', url: 'https://cros.land/rpg-ai-npc-generator/', icon: 'person', premium: false, category: 'roleplaying' },
  // Premium
  { name: 'Bookshelf Generator', shortName: 'Books', description: 'Generate libraries full of books with titles and contents', url: 'https://cros.land/ai-powered-bookshelf-generator/', icon: 'menu_book', premium: true, category: 'roleplaying' },
  { name: 'Lore & Timeline Generator', shortName: 'Lore', description: 'Create detailed histories and timelines for your world', url: 'https://cros.land/ai-powered-lore-and-timeline-generator/', icon: 'history', premium: true, category: 'worldbuilding' },
  { name: 'Dungeon Generator Premium', shortName: 'Dungeons+', description: 'Generate complete dungeons with rooms, encounters, and boss battles. Includes save/export features and unlimited statblock generations.', url: 'https://cros.land/dungeon-generator-2-0-premium-version/', icon: 'map', premium: true, category: 'exploration' },
  { name: 'Monster Generator Premium', shortName: 'Monsters+', description: 'Unlimited D&D 5e statblock generation with save/export features', url: 'https://cros.land/ai-powered-dnd-5e-monster-statblock-generator-premium/', icon: 'pest_control', premium: true, category: 'combat' },
  { name: 'Setting Generator Premium', shortName: 'Settings+', description: 'World-building tool for creating rich campaign settings.', url: 'https://cros.land/rpg-setting-generator-and-world-building-tool-premium-version/', icon: 'public', premium: true, category: 'worldbuilding' },
  { name: 'Magic Item Generator Premium', shortName: 'Items+', description: 'D&D 5e magic item generator. Create unique magic items with lore and balanced mechanics. Includes unlimited generations of quest hooks and lore events for each item timeline. Save/export features included.', url: 'https://cros.land/dnd-5e-magic-item-generator-premium-version/', icon: 'auto_fix_high', premium: true, category: 'items' },
  { name: 'Encounter Generator Premium', shortName: 'Encounters+', description: 'Unlimited encounter generation with save/export features', url: 'https://cros.land/dnd-5e-encounter-generator-premium/', icon: 'sports_kabaddi', premium: true, category: 'combat' },
  { name: 'Town Generator (Legacy)', shortName: 'GM Dashboard', description: "This town generator is the first iteration of the setting generator tool. It allows you to create detailed towns and kingdoms for your RPG campaigns. It focuses on location descriptions so it's great for building out a town quickly.", url: 'https://cros.land/ai-powered-game-master-dashboard/', icon: 'dashboard', premium: true, category: 'management' }
];

const freeTools = computed(() => tools.filter(t => !t.premium));
const premiumTools = computed(() => tools.filter(t => t.premium));
const currentTools = computed(() => (showPremium.value ? premiumTools.value : freeTools.value));

const currentToolName = computed(() => {
  const currentUrl = window.location.href.toLowerCase();
  const sortedTools = [...tools].sort((a, b) => b.url.length - a.url.length);
  const tool = sortedTools.find(t => {
    const parts = t.url.split('/');
    const slug = parts[parts.length - 1] || parts[parts.length - 2];
    return slug && currentUrl.includes(slug);
  });
  return tool ? tool.name : 'Tool Suite';
});

const isCurrentTool = (url) => {
  const currentUrl = window.location.href.toLowerCase();
  const parts = url.split('/');
  const slug = parts[parts.length - 1] || parts[parts.length - 2];
  if (!slug) return false;
  const inUrl = currentUrl.includes(slug);
  if (inUrl && !slug.includes('premium')) {
    if (currentUrl.includes(slug + '-premium')) return false;
  }
  return inUrl;
};

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
  if (isExpanded.value) widgetOpen.value = false;
};

onMounted(() => {
  showPremium.value = !!props.premium;              // default to Premium for supporters
  if (props.displayMode === 'widget') showFloatingWidget.value = true;
  setMobile();
  mq && mq.addEventListener('change', setMobile);
});

onBeforeUnmount(() => {
  mq && mq.removeEventListener('change', setMobile);
});
</script>

<style scoped lang="scss">
@use 'sass:color';
@import '@rei/cdr-tokens/dist/rei-dot-com/scss/cdr-tokens.scss';

/* ---------- Buttons (larger) ---------- */
.expand-button,
.cta-button {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.6rem 1rem;
  border-radius: 6px;
  border: 1px solid;
  font-size: 1.125rem;
  /* larger */
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .material-symbols-outlined {
    font-size: 22px;
    line-height: 1;
  }

  span:not(.material-symbols-outlined) {
    line-height: 1;
  }
}

.expand-button {
  background: #FF991C;
  color: #fff;
  border-color: #d78119;

  &:hover,
  &:focus {
    background: #fc8b00;

    border-color: #d78119;
  }
}

.cta-button.primary {
  background: $cdr-color-text-brand;
  color: #fff;
  border-color: $cdr-color-text-brand;

  &:hover {
    background: color.adjust($cdr-color-text-brand, $lightness: -10%);
    border-color: color.adjust($cdr-color-text-brand, $lightness: -10%);
  }
}

.tool-suite-wrapper {
  position: relative;
  z-index: 100;
}

/* ---------- Banner (larger) ---------- */
.tool-suite-banner {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 2px solid #dee2e6;
  margin-bottom: 2rem;
  transition: all 0.3s ease;

  &.expanded {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .banner-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.1rem 2rem;
    cursor: pointer;
    user-select: none;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .banner-title {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      min-width: 0;

      .suite-icon {
        color: $cdr-color-text-brand;
      }

      .suite-label {
        font-weight: 800;
        font-size: 1.375rem;
        /* larger */
        color: $cdr-color-text-primary;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 60vw;
      }

      .tool-count {
        background: #FF991C;
        color: #fff;
        padding: 0.35rem 0.9rem;
        border-radius: 20px;
        font-size: 1.125rem;
        /* larger */
        font-weight: 800;
        white-space: nowrap;
      }
    }

    .banner-actions {
      display: flex;
      align-items: center;
      gap: 1rem;

      .current-tool {
        color: $cdr-color-text-secondary;
        font-size: 1.0625rem;
        /* slightly larger */
        font-style: italic;
        opacity: 0;
        transition: opacity 0.3s ease;

        .expanded & {
          opacity: 1;
        }
      }
    }
  }

  .banner-content {
    padding: 2rem;
    background: #fff;
    border-top: 1px solid #e9ecef;
    position: relative;
  }
}

/* ---------- Corner link (larger) ---------- */
.top-corner-links {
  text-align: right;

  .blog-link {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.6rem 1.1rem;
    color: $cdr-color-text-secondary;
    text-decoration: none;
    /* larger */
    border-radius: 6px;
    transition: all 0.2s ease;

    &:hover {
      background: #f8f9fa;
      color: $cdr-color-text-primary;
    }

    .material-symbols-outlined {
      font-size: 20px;
    }
  }
}

/* ---------- Premium Toggle (medium) ---------- */
.premium-toggle {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;

  /* medium size per request */
  span {
    transition: color 0.3s;

    &.active {
      color: $cdr-color-text-primary;
      font-weight: 700;
    }
  }

  .premium-icon {
    font-size: 16px;
    color: gold;
    margin-right: 0.25rem;
  }

  .toggle-switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 28px;

    input {
      opacity: 0;
      width: 0;
      height: 0;

      &:checked+.slider {
        background: linear-gradient(135deg, #ffd700, #ffed4e);

        &:before {
          transform: translateX(32px);
        }
      }
    }

    .slider {
      position: absolute;
      cursor: pointer;
      inset: 0;
      background: #ccc;
      transition: 0.4s;
      border-radius: 28px;

      &:before {
        content: "";
        position: absolute;
        height: 20px;
        width: 20px;
        left: 4px;
        bottom: 4px;
        background: white;
        transition: 0.4s;
        border-radius: 50%;
      }
    }
  }
}

/* ---------- Tools Grid (larger text) ---------- */
.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;

  .tool-card {
    display: flex;
    align-items: flex-start;
    padding: 1.1rem;
    background: #f8f9fa;
    border: 2px solid transparent;
    border-radius: 8px;
    text-decoration: none;
    color: inherit;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    &:hover {
      background: #fff;
      border-color: $cdr-color-text-brand;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    &.current {
      background: linear-gradient(135deg, #e3f2fd, #bbdefb);
      border-color: #2196f3;
    }

    &.premium {
      background: linear-gradient(135deg, #fff9e6, #fff3cd);

      &:hover {
        border-color: gold;
      }
    }

    .tool-icon {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fff;
      border-radius: 8px;
      margin-right: 1rem;
      flex-shrink: 0;

      .material-symbols-outlined {
        color: $cdr-color-text-brand;
        font-size: 28px;
      }
    }

    .tool-info {
      flex: 1;

      h4 {
        margin: 0 0 0.35rem 0;
        font-size: 1.25rem;
        font-weight: 800;
        color: $cdr-color-text-primary;
      }

      p {
        margin: 0;
        color: $cdr-color-text-secondary;
        line-height: 1.6;
      }

      .premium-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        margin-top: 0.55rem;
        padding: 0.3rem 0.65rem;
        background: linear-gradient(135deg, #ffd700, #ffed4e);
        color: #856404;
        border-radius: 4px;
        font-size: 0.95rem;
        font-weight: 800;

        .material-symbols-outlined {
          font-size: 14px;
        }
      }
    }

    .current-indicator {
      position: absolute;
      top: 0;
      right: 0;
      background: #2196f3;
      color: #fff;
      padding: 0.35rem 0.9rem;
      font-size: 0.95rem;
      border-bottom-left-radius: 8px;
      font-weight: 800;
    }
  }
}

/* ---------- Info & CTAs (larger) ---------- */
.premium-features-info {
  margin-top: 1rem;
  padding: 0;

  .features-note {
    margin: 0;
    color: $cdr-color-text-secondary;
    text-align: center;
    line-height: 1.6;

    strong {
      color: #856404;
      font-weight: 800;
    }
  }
}

.premium-cta,
.patreon-cta,
.supporter-thanks {
  margin-top: 2rem;
}

.premium-cta .cta-content,
.patreon-cta .cta-content,
.supporter-thanks .cta-content {
  display: flex;
  align-items: center;
  gap: 1.6rem;
  padding: 1.6rem;
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  border-radius: 8px;
  border: 2px solid #0ea5e9;

  .cta-icon {
    font-size: 52px;
    color: #0ea5e9;
    flex-shrink: 0;
  }

  div {
    flex: 1;

    strong {
      display: block;
      margin-bottom: 0.3rem;
      font-size: 1.375rem;
    }

    p {
      margin: 0;
      color: $cdr-color-text-secondary;
      font-size: 1.0625rem;
    }
  }
}

.patreon-cta .cta-content {
  background: linear-gradient(135deg, #fff0f5, #ffe4e1);
  border-color: #f43f5e;

  .cta-icon {
    color: #f43f5e;
  }
}

/* ---------- Floating Widget (larger) ---------- */
.floating-widget {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1000;

  .widget-trigger {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    padding: 0.95rem 1.5rem;
    background: $cdr-color-text-brand;
    color: #fff;
    border: none;
    border-radius: 50px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
    font-size: 1.125rem;

    &:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }

    .widget-icon {
      font-size: 24px;
    }

    .widget-badge {
      background: #fff;
      color: $cdr-color-text-brand;
      padding: 0.3rem 0.6rem;
      border-radius: 10px;
      font-size: 0.95rem;
      font-weight: 800;
    }
  }

  .widget-menu {
    position: absolute;
    bottom: calc(100% + 1rem);
    right: 0;
    width: 320px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    overflow: hidden;

    .widget-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      border-bottom: 1px solid #dee2e6;

      h3 {
        margin: 0;
        font-size: 1.25rem;
      }

      .close-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.25rem;
        color: $cdr-color-text-secondary;

        &:hover {
          color: $cdr-color-text-primary;
        }
      }
    }

    .widget-tools {
      padding: 0.6rem;

      .widget-tool {
        display: flex;
        align-items: center;
        gap: 0.9rem;
        padding: 0.9rem;
        text-decoration: none;
        color: $cdr-color-text-primary;
        border-radius: 8px;
        transition: background 0.2s;
        font-size: 1.0625rem;

        &:hover {
          background: #f8f9fa;
        }

        .tool-mini-icon {
          font-size: 22px;
          color: $cdr-color-text-brand;
        }
      }
    }

    .widget-footer {
      padding: 1rem;
      border-top: 1px solid #dee2e6;

      .view-all {
        width: 100%;
        padding: 0.7rem;
        background: none;
        border: 1px solid $cdr-color-text-brand;
        color: $cdr-color-text-brand;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 700;
        transition: all 0.2s;
        font-size: 1.0625rem;

        &:hover {
          background: $cdr-color-text-brand;
          color: #fff;
        }
      }
    }
  }
}

/* ---------- Transitions ---------- */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.slide-enter-from {
  max-height: 0;
  opacity: 0;
}

.slide-leave-to {
  max-height: 0;
  opacity: 0;
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.2s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* ---------- Responsive ---------- */
@media (max-width: 768px) {
  .tool-suite-banner {
    z-index: 150;

    .banner-header {
      flex-direction: row;
      align-items: center;
      gap: 0.6rem;
      padding: 0.8rem 1rem;

      .banner-title {
        flex: 1 1 auto;
        gap: 0.6rem;

        .suite-label {
          font-size: 1.25rem;
          max-width: 52vw;
        }
      }

      .banner-actions {
        flex: 0 0 auto;
        gap: 0.6rem;

        .current-tool {
          display: none;
        }

        .expand-button {
          padding: 0.5rem 0.8rem;
        }
      }
    }

    .banner-content {
      padding: 1rem;
    }
  }

  .tools-grid {
    grid-template-columns: 1fr;
  }

  .floating-widget {
    bottom: 1rem;
    right: 1rem;

    .widget-menu {
      width: calc(100vw - 2rem);
      right: -1rem;
    }
  }
}
</style>
