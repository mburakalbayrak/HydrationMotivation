import ThermosSVG from '@/components/ThermosSVG';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, {
    ClipPath,
    Defs,
    G,
    LinearGradient,
    Path,
    Rect,
    Stop,
} from 'react-native-svg';

const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedPath = Animated.createAnimatedComponent(Path);

interface WaterBottleProps {
  /** 0–1 fill ratio */
  progress: number;
  /** total component width; height = width × 2.2 */
  width?: number;
  /** selected bottle id from collection */
  bottleType?: string;
  /** optional theme tint color */
  tintColor?: string;
  /** show side level gauge */
  showGauge?: boolean;
  children?: React.ReactNode;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const hexToRgb = (hex: string) => {
  const normalized = hex.replace('#', '');
  const value =
    normalized.length === 3
      ? normalized
          .split('')
          .map((c) => c + c)
          .join('')
      : normalized;
  const int = parseInt(value, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
};

const rgbToHex = (r: number, g: number, b: number) =>
  `#${[r, g, b]
    .map((n) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0'))
    .join('')}`;

const mixHex = (a: string, b: string, ratio: number) => {
  const rr = clamp(ratio, 0, 1);
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  return rgbToHex(
    ca.r + (cb.r - ca.r) * rr,
    ca.g + (cb.g - ca.g) * rr,
    ca.b + (cb.b - ca.b) * rr,
  );
};

const withAlpha = (hex: string, alpha: number) => {
  const c = hexToRgb(hex);
  return `rgba(${c.r},${c.g},${c.b},${clamp(alpha, 0, 1)})`;
};

const getBottleShape = (bottleType: string) => {
  if (bottleType === 'glass') return 'glass' as const;
  if (bottleType === 'bamboo') return 'bamboo' as const;
  if (bottleType === 'sport') return 'sport' as const;
  if (bottleType === 'thermos') return 'thermos' as const;
  if (bottleType === 'crystal') return 'crystal' as const;
  if (bottleType === 'gold') return 'gold' as const;
  if (bottleType === 'titan') return 'titan' as const;
  return 'classic' as const;
};

const getBottlePalette = (bottleType: string, tintColor: string, isComplete: boolean) => {
  const presets: Record<string, { top: string; bottom: string; glow: string }> = {
    classic: { top: '#7DD3FC', bottom: '#0284C7', glow: '#38BDF8' },
    glass: { top: '#67E8F9', bottom: '#0891B2', glow: '#22D3EE' },
    thermos: { top: '#A5B4FC', bottom: '#6366F1', glow: '#818CF8' },
    bamboo: { top: '#86EFAC', bottom: '#16A34A', glow: '#22C55E' },
    sport: { top: '#FDBA74', bottom: '#EA580C', glow: '#FB923C' },
    crystal: { top: '#C4B5FD', bottom: '#8B5CF6', glow: '#A78BFA' },
    gold: { top: '#FDE68A', bottom: '#D97706', glow: '#FBBF24' },
    titan: { top: '#F9A8D4', bottom: '#DB2777', glow: '#F472B6' },
  };

  const preset = presets[bottleType] || presets.classic;
  const top = mixHex(preset.top, tintColor, 0.35);
  const bottom = mixHex(preset.bottom, tintColor, 0.25);

  return {
    waterTop: isComplete ? mixHex(top, '#34D399', 0.25) : top,
    waterBottom: isComplete ? mixHex(bottom, '#059669', 0.2) : bottom,
    borderTop: mixHex('#E2E8F0', tintColor, 0.2),
    borderBottom: mixHex('#334155', tintColor, 0.35),
    glow: withAlpha(mixHex(preset.glow, tintColor, 0.5), 0.32),
    shell: withAlpha('#FFFFFF', 0.08),
    shellLight: withAlpha('#FFFFFF', 0.16),
    shellDeep: withAlpha('#CBD5E1', 0.08),
    marker: withAlpha(mixHex(preset.glow, tintColor, 0.3), 0.9),
  };
};

export default function WaterBottle({
  progress,
  width = 160,
  bottleType = 'classic',
  tintColor = '#38BDF8',
  showGauge = false,
  children,
}: WaterBottleProps) {
  const height = width * 2.2;
  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  if (bottleType === 'thermos') {
    return (
      <View style={[styles.wrapper, { width, height }]}> 
        <ThermosSVG fillPercent={clampedProgress} width={width} height={width * 1.9} />
        {children && <View style={styles.overlay}>{children}</View>}
      </View>
    );
  }

  const shape = getBottleShape(bottleType);

  // ── animated fill ───────────────────────────
  const fillAnim = useRef(new Animated.Value(0)).current;
  const wave1 = useRef(new Animated.Value(0)).current;
  const wave2 = useRef(new Animated.Value(0)).current;
  const surfaceAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fillAnim, {
      toValue: clampedProgress,
      duration: 750,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [clampedProgress]);

  // subtle continuous wave
  useEffect(() => {
    const loopWave = (anim: Animated.Value, duration: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false,
          }),
        ]),
      );
    loopWave(wave1, 2400).start();
    loopWave(wave2, 3200).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(surfaceAnim, {
          toValue: 1,
          duration: 1900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(surfaceAnim, {
          toValue: 0,
          duration: 1900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1700,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1700,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ]),
    ).start();
  }, []);

  // ── SVG dimensions / metrics ────────────────
  const svgW = width;
  const svgH = height;

  // Bottle body region (where water shows)
  const bodyTop =
    shape === 'thermos'
      ? svgH * 0.24
      : shape === 'glass'
        ? svgH * 0.32
        : shape === 'crystal'
          ? svgH * 0.27
          : shape === 'sport'
            ? svgH * 0.26
            : shape === 'bamboo'
              ? svgH * 0.29
              : svgH * 0.28;
  const bodyBottom = svgH * 0.92;
  const bodyHeight = bodyBottom - bodyTop;

  // Water Y: interpolate from bodyBottom (empty) → bodyTop (full)
  const waterY = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [bodyBottom, bodyTop + 2],
  });

  // Small wave offsets
  const waveOffset1 = wave1.interpolate({
    inputRange: [0, 1],
    outputRange: [-4, 4],
  });
  const waveOffset2 = wave2.interpolate({
    inputRange: [0, 1],
    outputRange: [3, -3],
  });
  const waveSurface = surfaceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-2, 2],
  });
  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.12, 0.22],
  });

  // Water rect height = bodyBottom - waterY
  const waterHeight = Animated.subtract(bodyBottom, waterY);

  // ── Bottle Path ─────────────────────────────
  const capW =
    shape === 'sport'
      ? svgW * 0.2
      : shape === 'thermos' || shape === 'gold' || shape === 'titan'
        ? svgW * 0.34
        : shape === 'glass'
          ? svgW * 0.18
          : svgW * 0.22;
  const capH = shape === 'thermos' || shape === 'gold' || shape === 'titan' ? svgH * 0.07 : svgH * 0.05;
  const capX = (svgW - capW) / 2;
  const capY = svgH * 0.04;
  const capR = capH * 0.42;

  const neckW =
    shape === 'sport'
      ? svgW * 0.16
      : shape === 'thermos' || shape === 'gold' || shape === 'titan'
        ? svgW * 0.36
        : shape === 'glass'
          ? svgW * 0.14
          : svgW * 0.18;
  const neckX = (svgW - neckW) / 2;
  const neckTop = capY + capH;
  const neckBot = bodyTop;

  const bodyW =
    shape === 'sport'
      ? svgW * 0.62
      : shape === 'thermos' || shape === 'gold' || shape === 'titan'
        ? svgW * 0.5
        : shape === 'glass'
          ? svgW * 0.46
          : shape === 'bamboo'
            ? svgW * 0.54
            : shape === 'crystal'
              ? svgW * 0.58
              : svgW * 0.56;
  const bodyX = (svgW - bodyW) / 2;
  const bodyR = bodyW * (shape === 'thermos' ? 0.12 : 0.14);
  const gaugeX = bodyX - 12;
  const gaugeHeight = bodyHeight;

  const bottlePath =
    shape === 'glass'
      ? `
        M ${neckX} ${neckTop}
        L ${neckX} ${neckBot - 10}
        Q ${neckX} ${neckBot} ${bodyX + bodyW * 0.32} ${neckBot + 8}
        L ${bodyX + bodyW * 0.14} ${bodyBottom - bodyR - 10}
        Q ${bodyX + bodyW * 0.1} ${bodyBottom} ${bodyX + bodyW * 0.24} ${bodyBottom}
        L ${bodyX + bodyW * 0.76} ${bodyBottom}
        Q ${bodyX + bodyW * 0.9} ${bodyBottom} ${bodyX + bodyW * 0.86} ${bodyBottom - bodyR - 10}
        L ${bodyX + bodyW * 0.68} ${neckBot + 8}
        Q ${neckX + neckW} ${neckBot} ${neckX + neckW} ${neckBot - 10}
        L ${neckX + neckW} ${neckTop}
        Z
      `
      : shape === 'bamboo'
        ? `
          M ${neckX} ${neckTop}
          L ${neckX} ${neckBot - 8}
          Q ${neckX} ${neckBot + 2} ${bodyX + bodyR} ${neckBot + 12}
          L ${bodyX + bodyW - bodyR} ${neckBot + 12}
          Q ${bodyX + bodyW} ${neckBot + 2} ${bodyX + bodyW} ${neckBot - 8}
          L ${bodyX + bodyW} ${bodyBottom - bodyR}
          Q ${bodyX + bodyW} ${bodyBottom} ${bodyX + bodyW - bodyR} ${bodyBottom}
          L ${bodyX + bodyR} ${bodyBottom}
          Q ${bodyX} ${bodyBottom} ${bodyX} ${bodyBottom - bodyR}
          L ${bodyX} ${neckBot - 8}
          Z
        `
      : shape === 'sport'
      ? `
        M ${neckX} ${neckTop}
        L ${neckX} ${neckBot - 10}
        Q ${neckX} ${neckBot + 2} ${bodyX + bodyR} ${neckBot + 12}
        L ${bodyX + bodyW - bodyR} ${neckBot + 12}
        Q ${bodyX + bodyW} ${neckBot + 2} ${bodyX + bodyW} ${neckBot - 10}
        L ${bodyX + bodyW} ${bodyBottom - bodyR}
        Q ${bodyX + bodyW} ${bodyBottom} ${bodyX + bodyW - bodyR} ${bodyBottom}
        L ${bodyX + bodyR} ${bodyBottom}
        Q ${bodyX} ${bodyBottom} ${bodyX} ${bodyBottom - bodyR}
        L ${bodyX} ${neckBot - 10}
        Z
      `
      : shape === 'thermos' || shape === 'gold' || shape === 'titan'
        ? `
          M ${neckX} ${neckTop}
          L ${neckX} ${bodyTop + 2}
          Q ${neckX} ${bodyTop + 12} ${bodyX + bodyR} ${bodyTop + 12}
          L ${bodyX + bodyW - bodyR} ${bodyTop + 12}
          Q ${bodyX + bodyW} ${bodyTop + 12} ${bodyX + bodyW} ${bodyTop + 2}
          L ${bodyX + bodyW} ${bodyBottom - bodyR}
          Q ${bodyX + bodyW} ${bodyBottom} ${bodyX + bodyW - bodyR} ${bodyBottom}
          L ${bodyX + bodyR} ${bodyBottom}
          Q ${bodyX} ${bodyBottom} ${bodyX} ${bodyBottom - bodyR}
          L ${bodyX} ${bodyTop + 2}
          Q ${bodyX} ${bodyTop - 8} ${neckX} ${bodyTop - 2}
          L ${neckX} ${neckTop}
          Z
        `
        : shape === 'crystal'
          ? `
            M ${neckX} ${neckTop}
            L ${neckX} ${neckBot - 8}
            L ${bodyX + bodyW * 0.18} ${neckBot + 8}
            L ${bodyX + bodyW * 0.08} ${bodyBottom - bodyR - 6}
            L ${bodyX + bodyW * 0.22} ${bodyBottom}
            L ${bodyX + bodyW * 0.78} ${bodyBottom}
            L ${bodyX + bodyW * 0.92} ${bodyBottom - bodyR - 6}
            L ${bodyX + bodyW * 0.82} ${neckBot + 8}
            L ${neckX + neckW} ${neckBot - 8}
            L ${neckX + neckW} ${neckTop}
            Z
          `
          : `
            M ${neckX} ${neckTop}
            L ${neckX} ${neckBot - 6}
            Q ${neckX} ${neckBot} ${bodyX + bodyR} ${neckBot + 12}
            L ${bodyX + bodyR} ${neckBot + 12}
            Q ${bodyX} ${neckBot + 14} ${bodyX} ${bodyTop + bodyR + 14}
            L ${bodyX} ${bodyBottom - bodyR}
            Q ${bodyX} ${bodyBottom} ${bodyX + bodyR} ${bodyBottom}
            L ${bodyX + bodyW - bodyR} ${bodyBottom}
            Q ${bodyX + bodyW} ${bodyBottom} ${bodyX + bodyW} ${bodyBottom - bodyR}
            L ${bodyX + bodyW} ${bodyTop + bodyR + 14}
            Q ${bodyX + bodyW} ${neckBot + 14} ${bodyX + bodyW - bodyR} ${neckBot + 12}
            L ${neckX + neckW - (neckX - bodyX) + bodyR} ${neckBot + 12}
            Q ${neckX + neckW} ${neckBot} ${neckX + neckW} ${neckBot - 6}
            L ${neckX + neckW} ${neckTop}
            Z
          `;

  // Water color based on progress
  const isComplete = clampedProgress >= 1;
  const palette = getBottlePalette(bottleType, tintColor, isComplete);

  return (
    <View style={[styles.wrapper, { width: svgW, height: svgH }]}>
      <Svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
        <Defs>
          {/* Clip to bottle shape */}
          <ClipPath id="bottleClip">
            <Path d={bottlePath} />
          </ClipPath>

          {/* Water gradient */}
          <LinearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={palette.waterTop} stopOpacity="0.95" />
            <Stop offset="1" stopColor={palette.waterBottom} stopOpacity="1" />
          </LinearGradient>

          <LinearGradient id="waterFoam" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#ffffff" stopOpacity="0.35" />
            <Stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </LinearGradient>

          {/* Glass highlight */}
          <LinearGradient id="glassHighlight" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#ffffff" stopOpacity="0.12" />
            <Stop offset="0.3" stopColor="#ffffff" stopOpacity="0.04" />
            <Stop offset="0.7" stopColor="#ffffff" stopOpacity="0" />
            <Stop offset="1" stopColor="#ffffff" stopOpacity="0.07" />
          </LinearGradient>

          {/* Bottle border gradient */}
          <LinearGradient id="bottleBorder" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={palette.borderTop} stopOpacity="0.75" />
            <Stop offset="1" stopColor={palette.borderBottom} stopOpacity="0.5" />
          </LinearGradient>

          <LinearGradient id="shellGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={palette.shellLight} />
            <Stop offset="1" stopColor={palette.shellDeep} />
          </LinearGradient>
        </Defs>

        {showGauge && (
          <>
            {/* side level gauge */}
            <Rect
              x={gaugeX}
              y={bodyTop}
              width={2}
              height={gaugeHeight}
              rx={1}
              fill="rgba(203,213,225,0.18)"
            />
            <AnimatedRect
              x={gaugeX}
              y={waterY}
              width={2}
              height={waterHeight}
              rx={1}
              fill={palette.marker}
            />
            <AnimatedRect
              x={gaugeX - 3}
              y={Animated.add(waterY, -4)}
              width={8}
              height={8}
              rx={4}
              fill={palette.marker}
            />
          </>
        )}

        <AnimatedPath d={bottlePath} fill={palette.glow} opacity={glowOpacity} />

        {/* ── Cap ── */}
        <Rect
          x={capX}
          y={capY}
          width={capW}
          height={capH}
          rx={capR}
          ry={capR}
          fill="url(#bottleBorder)"
        />

        {/* ── Bottle Glass (bg) ── */}
        <Path
          d={bottlePath}
          fill="url(#shellGrad)"
          stroke="url(#bottleBorder)"
          strokeWidth={2}
        />

        {/* ── Animated Water ── */}
        <G clipPath="url(#bottleClip)">
          <AnimatedRect
            x={0}
            y={waterY}
            width={svgW}
            height={waterHeight}
            fill="url(#waterGrad)"
          />
          {/* Wave highlights */}
          <AnimatedRect
            x={0}
            y={Animated.add(Animated.add(waterY, waveOffset1), waveSurface)}
            width={svgW}
            height={6}
            rx={2}
            fill="url(#waterFoam)"
          />
          <AnimatedRect
            x={svgW * 0.1}
            y={Animated.add(Animated.add(waterY, waveOffset2), 8)}
            width={svgW * 0.8}
            height={2.5}
            rx={1.25}
            fill="rgba(255,255,255,0.08)"
          />
        </G>

        {/* ── Glass shine overlay ── */}
        <Path d={bottlePath} fill="url(#glassHighlight)" />
        <Path d={bottlePath} stroke="rgba(255,255,255,0.16)" strokeWidth={0.9} fill="transparent" />

        {/* ── Bubble accents (only when > 10%) ── */}
        {clampedProgress > 0.1 && (
          <G clipPath="url(#bottleClip)" opacity={0.3}>
            <Rect x={bodyX + bodyW * 0.2} y={bodyBottom - bodyHeight * 0.25} width={5} height={5} rx={2.5} fill="#fff" />
            <Rect x={bodyX + bodyW * 0.6} y={bodyBottom - bodyHeight * 0.4} width={3.5} height={3.5} rx={1.75} fill="#fff" />
            <Rect x={bodyX + bodyW * 0.35} y={bodyBottom - bodyHeight * 0.55} width={4} height={4} rx={2} fill="#fff" />
            <Rect x={bodyX + bodyW * 0.75} y={bodyBottom - bodyHeight * 0.15} width={3} height={3} rx={1.5} fill="#fff" />
          </G>
        )}

        {/* Scale marks */}
        {[0.25, 0.5, 0.75].map((mark) => {
          const markY = bodyBottom - bodyHeight * mark;
          return (
            <G key={mark} clipPath="url(#bottleClip)">
              <Rect
                x={bodyX + 4}
                y={markY}
                width={8}
                height={1}
                fill="rgba(255,255,255,0.1)"
                rx={0.5}
              />
              <Rect
                x={bodyX + bodyW - 12}
                y={markY}
                width={8}
                height={1}
                fill="rgba(255,255,255,0.1)"
                rx={0.5}
              />
            </G>
          );
        })}
      </Svg>

      {/* Children overlay (text, etc.) */}
      {children && <View style={styles.overlay}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#22D3EE',
    shadowOpacity: 0.24,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '25%',
  },
});
