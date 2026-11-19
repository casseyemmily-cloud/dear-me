/**
 * main.js — entry point aplikasi.
 *
 * Hanya melakukan tiga hal:
 * 1. menyiapkan data contoh saat first-run
 * 2. membangun shell UI
 * 3. mengatur navigasi antar tab
 *
 * Logika fitur akan dipasang lewat ui.js/store.js pada iterasi berikutnya.
 */

import './style.css';
import { TABS } from './constants.js';
import { seedIfEmpty } from './store.js';
import { renderShell, renderContent, setActiveTab } from './ui.js';

const root = document.getElementById('app');
const validTabs = TABS.map((tab) => tab.id);

function tabFromHash() {
  const hash = window.location.hash.replace('#', '');
  return validTabs.includes(hash) ? hash : 'beranda';
}

let activeTab = tabFromHash();

seedIfEmpty();

const shell = renderShell(root, {
  activeTab,
  onNavigate: (tabId) => navigate(tabId),
});

function navigate(tabId) {
  if (!validTabs.includes(tabId) || tabId === activeTab) return;

  activeTab = tabId;
  setActiveTab(shell.header, tabId);
  renderContent(shell.main, tabId);
  window.history.replaceState(null, '', `#${tabId}`);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  shell.main.focus({ preventScroll: true });
}

window.addEventListener('hashchange', () => {
  const tabId = tabFromHash();
  if (tabId === activeTab) return;
  activeTab = tabId;
  setActiveTab(shell.header, tabId);
  renderContent(shell.main, tabId);
  shell.main.focus({ preventScroll: true });
});
