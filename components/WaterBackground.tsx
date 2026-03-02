import { Accelerometer } from 'expo-sensors';
import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

const { width: SW, height: SH } = Dimensions.get('window');

// 3 screen-widths wide → 3 identical wave cycles → seamless loop
const TOTAL_W = SW * 3;
const WAVE_AMP = 22; // amplitude in px
const FULL_H = SH + WAVE_AMP * 5; // SVG fills well below screen

/** Pre-compute a smooth sine-wave closed SVG path. */
const generateWave = (
  w: number,
  h: number,
  amp: number,
  cycles: number,
  phase: number,
): string => {
  const N = cycles * 48; // points per wave (smooth enough)
  const pts: string[] = [];
  for (let i = 0; i <= N; i++) {
    const x = (i / N) * w;
    const y = amp + amp * Math.sin((i / N) * cycles * Math.PI * 2 + phase);
    pts.push(i === 0 ? `M${x.toFixed(1)},${y.toFixed(1)}` : `L${x.toFixed(1)},${y.toFixed(1)}`);
  }
  pts.push(`L${w.toFixed(1)},${h.toFixed(1)}`, `L0,${h.toFixed(1)}`, 'Z');
  return pts.join(' ');
};

// Computed once at module load (not on each render)
const BACK_PATH = generateWave(TOTAL_W, FULL_H, WAVE_AMP * 0.55, 3, Math.PI * 0.7);
const FRONT_PATH = generateWave(TOTAL_W, FULL_H, WAVE_AMP, 3, 0);

interface WaterBackgroundProps {
  /** Current water intake / daily goal, 0..1 */
  progress: number;
}

export default function WaterBackground({ progress }: WaterBackgroundProps) {
  const p = Math.min(Math.max(progress, 0), 1);

  const waterLevelAnim = useRef(new Animated.Value(p)).current;
  const waveFront = useRef(new Animated.Value(0)).current;
  const waveBack = useRef(new Animated.Value(0)).current;
  const tilt = useRef(new Animated.Value(0)).current;

  // ── Water level spring (triggers on progress changes) ──────────────────
  useEffect(() => {
    Animated.spring(waterLevelAnim, {
      toValue: p,
      tension: 12,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [p, waterLevelAnim]);

  // ── Front wave: continuous scroll at 4.5 s/screen ──────────────────────
  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(waveFront, {
        toValue: 1,
        duration: 4500,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    anim.start();
    return () => anim.stop();
  }, [waveFront]);

  // ── Back wave: slower scroll at 8 s/screen ─────────────────────────────
  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(waveBack, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    anim.start();
    return () => anim.stop();
  }, [waveBack]);

  // ── Accelerometer: phone tilt shifts front wave horizontally ───────────
  useEffect(() => {
    let sub: { remove: () => void } | null = null;
    try {
      Accelerometer.setUpdateInterval(50);
      sub = Accelerometer.addListener(({ x }: { x: number }) => {
        Animated.spring(tilt, {
          toValue: -x * 30,
          tension: 28,
          friction: 8,
          useNativeDriver: true,
        }).start();
      });
    } catch {
      /* accelerometer unavailable – gracefully skip */
    }
    return () => sub?.remove();
  }, [tilt]);

  // ── Derived animated values ─────────────────────────────────────────────
  // waveY:  p=0 → wave sits below screen,  p=1 → wave peaks above screen
  const waveY = useMemo(
    () =>
      waterLevelAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [SH + WAVE_AMP, -WAVE_AMP * 2],
      }),
    [waterLevelAnim],
  );

  // Back wave scrolls left (no tilt)
  const backX = useMemo(
    () => waveBack.interpolate({ inputRange: [0, 1], outputRange: [0, -SW] }),
    [waveBack],
  );

  // Front wave scrolls left + device tilt offset
  const frontX = useMemo(
    () =>
      Animated.add(
        waveFront.interpolate({ inputRange: [0, 1], outputRange: [0, -SW] }),
        tilt,
      ),
    [waveFront, tilt],
  );

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Back wave: subtle, slower */}
      <Animated.View style={[styles.layer, { transform: [{ translateY: waveY }] }]}>
        <Animated.View style={{ transform: [{ translateX: backX }] }}>
          <Svg width={TOTAL_W} height={FULL_H}>
            <Path d={BACK_PATH} fill="rgba(56,189,248,0.09)" />
          </Svg>
        </Animated.View>
      </Animated.View>

      {/* Front wave: gradient fill, tilt-responsive */}
      <Animated.View style={[styles.layer, { transform: [{ translateY: waveY }] }]}>
        <Animated.View style={{ transform: [{ translateX: frontX }] }}>
          <Svg width={TOTAL_W} height={FULL_H}>
            <Defs>
              <LinearGradient id="wbGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#38BDF8" stopOpacity="0.30" />
                <Stop offset="0.4" stopColor="#0EA5E9" stopOpacity="0.20" />
                <Stop offset="0.75" stopColor="#0284C7" stopOpacity="0.14" />
                <Stop offset="1" stopColor="#1D4ED8" stopOpacity="0.09" />
              </LinearGradient>
            </Defs>
            <Path d={FRONT_PATH} fill="url(#wbGrad)" />
          </Svg>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  layer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SW,
    height: SH,
    overflow: 'hidden',
  },
});
