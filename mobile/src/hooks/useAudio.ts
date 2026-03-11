/* ─── Sesli İçerik Hook (expo-av) ─── */

import { useCallback, useRef, useEffect } from "react";
import { Audio } from "expo-av";
import { useAudioStore } from "../stores/audio-store";

export function useAudio() {
  const soundRef = useRef<Audio.Sound | null>(null);
  const {
    isPlaying,
    currentUrl,
    currentTitle,
    position,
    duration,
    play: playStore,
    pause: pauseStore,
    stop: stopStore,
    setPosition,
    setDuration,
  } = useAudioStore();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  const play = useCallback(
    async (url: string, title: string) => {
      // Eğer aynı ses çalıyorsa sadece resume
      if (currentUrl === url && soundRef.current) {
        await soundRef.current.playAsync();
        playStore(url, title);
        return;
      }

      // Yeni ses yükle
      await soundRef.current?.unloadAsync();
      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded) {
            setPosition(status.positionMillis);
            setDuration(status.durationMillis ?? 0);
            if (status.didJustFinish) {
              stopStore();
            }
          }
        }
      );
      soundRef.current = sound;
      playStore(url, title);
    },
    [currentUrl, playStore, stopStore, setPosition, setDuration]
  );

  const pause = useCallback(async () => {
    await soundRef.current?.pauseAsync();
    pauseStore();
  }, [pauseStore]);

  const stop = useCallback(async () => {
    await soundRef.current?.stopAsync();
    await soundRef.current?.unloadAsync();
    soundRef.current = null;
    stopStore();
  }, [stopStore]);

  const seekTo = useCallback(async (posMs: number) => {
    await soundRef.current?.setPositionAsync(posMs);
  }, []);

  return {
    play,
    pause,
    stop,
    seekTo,
    isPlaying,
    currentUrl,
    currentTitle,
    position,
    duration,
  };
}
