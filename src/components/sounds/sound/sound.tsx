import { useCallback, useEffect, forwardRef, useMemo, memo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { ImSpinner9 } from 'react-icons/im/index';

import { Range } from './range';
import { Favorite } from './favorite';

import { useSound } from '@/hooks/use-sound';
import { useSoundStore } from '@/stores/sound';
import { useLoadingStore } from '@/stores/loading';
import { cn } from '@/helpers/styles';

import styles from './sound.module.css';

import type { Sound as SoundType } from '@/data/types';

import { useKeyboardButton } from '@/hooks/use-keyboard-button';

interface SoundProps extends SoundType {
  functional: boolean;
  hidden: boolean;
  selectHidden: (key: string) => void;
  unselectHidden: (key: string) => void;
}

export const Sound = memo(forwardRef<HTMLDivElement, SoundProps>(function Sound(
  { functional, hidden, icon, id, label, selectHidden, src, unselectHidden },
  ref,
) {
  // Combine all Zustand selectors using useShallow to reduce subscriptions from 9 to 1
  const { isPlaying, play, selectSound, unselectSound, setVolume, isSelected, locked, volume, globalVolume } =
    useSoundStore(useShallow(state => ({
      isPlaying: state.isPlaying,
      play: state.play,
      selectSound: state.select,
      unselectSound: state.unselect,
      setVolume: state.setVolume,
      isSelected: state.sounds[id].isSelected,
      locked: state.locked,
      volume: state.sounds[id].volume,
      globalVolume: state.globalVolume,
    })));

  const adjustedVolume = useMemo(
    () => volume * globalVolume,
    [volume, globalVolume],
  );

  const isLoading = useLoadingStore(state => state.loaders[src]);

  // Only preload sound when it's visible (not hidden) to reduce memory usage
  // Force HTML5 audio mode for better iOS background playback compatibility
  const sound = useSound(
    src,
    { loop: true, volume: adjustedVolume, preload: !hidden || isSelected },
    true // Force HTML5 audio mode instead of Web Audio API for iOS compatibility
  );

  useEffect(() => {
    if (locked) return;

    if (isSelected && isPlaying && functional) {
      sound?.play();
    } else {
      sound?.pause();
    }
  }, [isSelected, sound, isPlaying, functional, locked]);

  useEffect(() => {
    if (hidden && isSelected) selectHidden(label);
    else if (hidden && !isSelected) unselectHidden(label);
  }, [label, isSelected, hidden, selectHidden, unselectHidden]);

  const select = useCallback(() => {
    if (locked) return;
    selectSound(id);
    play();
  }, [selectSound, play, id, locked]);

  const unselect = useCallback(() => {
    if (locked) return;
    unselectSound(id);
    setVolume(id, 0.5);
  }, [unselectSound, setVolume, id, locked]);

  const toggle = useCallback(() => {
    if (locked) return;
    if (isSelected) unselect();
    else select();
  }, [isSelected, select, unselect, locked]);

  const handleClick = useCallback(() => {
    toggle();
  }, [toggle]);

  const handleKeyDown = useKeyboardButton(() => {
    toggle();
  });

  return (
    <div
      aria-label={`${label} sound`}
      ref={ref}
      role="button"
      tabIndex={0}
      className={cn(
        styles.sound,
        isSelected && styles.selected,
        hidden && styles.hidden,
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <Favorite id={id} label={label} />
      <div className={styles.icon}>
        {isLoading ? (
          <span aria-hidden="true" className={styles.spinner}>
            <ImSpinner9 />
          </span>
        ) : (
          <span aria-hidden="true">{icon}</span>
        )}
      </div>
      <div className={styles.label} id={id}>
        {label}
      </div>
      <Range id={id} label={label} />
    </div>
  );
}));
