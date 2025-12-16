import type { StateCreator } from 'zustand';

import type { SoundState } from './sound.state';

import { pickMany, random } from '@/helpers/random';

export interface SoundActions {
  lock: () => void;
  override: (sounds: Record<string, number>) => void;
  pause: () => void;
  play: () => void;
  restoreHistory: () => void;
  select: (id: string) => void;
  setGlobalVolume: (volume: number) => void;
  setVolume: (id: string, volume: number) => void;
  shuffle: () => void;
  toggleFavorite: (id: string) => void;
  togglePlay: () => void;
  unlock: () => void;
  unselect: (id: string) => void;
  unselectAll: (pushToHistory?: boolean) => void;
}

export const createActions: StateCreator<
  SoundActions & SoundState,
  [['zustand/immer', never]],
  [],
  SoundActions
> = (set, get) => {
  return {
    lock() {
      set(state => {
        state.locked = true;
      });
    },

    override(newSounds) {
      get().unselectAll();

      set(state => {
        Object.keys(newSounds).forEach(soundId => {
          if (state.sounds[soundId]) {
            state.sounds[soundId].isSelected = true;
            state.sounds[soundId].volume = newSounds[soundId];
          }
        });
        state.history = null;
      });
    },

    pause() {
      set(state => {
        state.isPlaying = false;
      });
    },

    play() {
      set(state => {
        state.isPlaying = true;
      });
    },

    restoreHistory() {
      const history = get().history;

      if (!history) return;

      set(state => {
        state.history = null;
        state.sounds = history;
      });
    },

    select(id) {
      set(state => {
        state.history = null;
        state.sounds[id].isSelected = true;
      });
    },

    setGlobalVolume(volume) {
      set(state => {
        state.globalVolume = volume;
      });
    },

    setVolume(id, volume) {
      set(state => {
        state.sounds[id].volume = volume;
      });
    },

    shuffle() {
      set(state => {
        const ids = Object.keys(state.sounds);

        ids.forEach(id => {
          state.sounds[id].isSelected = false;
          state.sounds[id].volume = 0.5;
        });

        const randomIDs = pickMany(ids, 4);

        randomIDs.forEach(id => {
          state.sounds[id].isSelected = true;
          state.sounds[id].volume = random(0.2, 1);
        });

        state.history = null;
        state.isPlaying = true;
      });
    },

    toggleFavorite(id) {
      set(state => {
        state.history = null;
        state.sounds[id].isFavorite = !state.sounds[id].isFavorite;
      });
    },

    togglePlay() {
      set(state => {
        state.isPlaying = !state.isPlaying;
      });
    },

    unlock() {
      set(state => {
        state.locked = false;
      });
    },

    unselect(id) {
      set(state => {
        state.sounds[id].isSelected = false;
      });
    },

    unselectAll(pushToHistory = false) {
      const noSelected = get().noSelected();

      if (noSelected) return;

      set(state => {
        if (pushToHistory) {
          // Use structuredClone instead of JSON.parse(JSON.stringify())
          state.history = structuredClone(state.sounds);
        }

        const ids = Object.keys(state.sounds);

        ids.forEach(id => {
          state.sounds[id].isSelected = false;
          state.sounds[id].volume = 0.5;
        });
      });
    },
  };
};
