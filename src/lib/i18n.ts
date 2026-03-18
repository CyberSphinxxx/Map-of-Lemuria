export type LanguageStyle = 'fantasy' | 'standard';

export const translations = {
  fantasy: {
    nav: {
      home: 'Home',
      world: 'World',
      characters: 'Characters',
      mobs: 'Bestiary',
      items: 'Artifacts',
      forge: 'THE FORGE',
      login: 'LOG IN',
      logout: 'SIGN OUT',
      sealing: 'SEALING...',
    },
    sidebar: {
      archives: 'Archives',
      chronicles: 'Chronicles',
      system: 'System',
      world: 'Territories of the Realm',
      characters: 'Inhabitants of Note',
      mobs: 'The Ancient Bestiary',
      bestiary: 'The Ancient Bestiary',
      items: 'Relics & Treasures',
      rules: 'World Systems',
      about: 'Project Lore'
    },
    settings: {
      title: 'Archive Settings',
      description: 'Calibrate your connection to the eternal records of Lemuria.',
      account: 'Guardian Profile',
      appearance: 'Visual Manifestation',
      preferences: 'Archive Navigation',
      danger: 'Rites of Sealing',
      theme: 'Realm Theme',
      themeDesc: 'Choose the illumination of the archives.',
      density: 'Chronicle Density',
      densityDesc: 'Display more legends on a single manifest.',
      ai: 'Lorekeeper Guidance',
      aiDesc: 'Keep the AI Chronicler active during research.',
      purge: 'Purge Local Echoes',
      purgeDesc: 'Clear temporary vision and local preferences.',
      logoutAction: 'Sever Link',
      logoutDesc: 'Safely disconnect from the eternal archives.',
      purgeButton: 'Purge',
      logoutButton: 'Disconnect',
      langStyle: 'Speech Pattern',
      langStyleDesc: 'Toggle between archaic archive prose and standard speech.',
      fantasyLabel: 'Fantasy',
      standardLabel: 'Standard'
    }
  },
  standard: {
    nav: {
      home: 'Home',
      world: 'World',
      characters: 'Characters',
      mobs: 'Creatures',
      items: 'Items',
      forge: 'DASHBOARD',
      login: 'SIGN IN',
      logout: 'LOG OUT',
      sealing: 'SIGNING OUT...',
    },
    sidebar: {
      archives: 'Navigation',
      chronicles: 'Categories',
      system: 'Settings',
      world: 'World Map',
      characters: 'Characters',
      mobs: 'Creatures & Enemies',
      bestiary: 'Creatures & Enemies',
      items: 'Items & Gear',
      rules: 'Game Rules',
      about: 'Project Info'
    },
    settings: {
      title: 'Settings',
      description: 'Manage your account and application preferences.',
      account: 'Account',
      appearance: 'Appearance',
      preferences: 'Preferences',
      danger: 'Danger Zone',
      theme: 'Interface Theme',
      themeDesc: 'Select the visual theme for the application.',
      density: 'High Density View',
      densityDesc: 'Show more items per row in lists.',
      ai: 'Assistant AI',
      aiDesc: 'Enable the AI assistant for research.',
      purge: 'Clear Local Cache',
      purgeDesc: 'Reset local preferences and clear cached data.',
      logoutAction: 'Sign Out',
      logoutDesc: 'Securely end your current session.',
      purgeButton: 'Clear',
      logoutButton: 'Sign Out',
      langStyle: 'Language Style',
      langStyleDesc: 'Switch between immersive fantasy terms and plain English.',
      fantasyLabel: 'Fantasy',
      standardLabel: 'Standard'
    }
  }
};

export function t(style: LanguageStyle = 'fantasy') {
  return translations[style] || translations.fantasy;
}
