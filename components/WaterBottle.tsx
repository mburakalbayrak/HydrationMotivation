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

interface WaterBottleProps {
  /** 0–1 fill ratio */
  progress: number;
  /** total component width; height = width × 2.2 */
  width?: number;
  children?: React.ReactNode;
}

export default function WaterBottle({
  progress,
  width = 160,
  children,
}: WaterBottleProps) {
  const height = width * 2.2;
  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  // ── animated fill ───────────────────────────
  const fillAnim = useRef(new Animated.Value(0)).current;
  const wave1 = useRef(new Animated.Value(0)).current;
  const wave2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(fillAnim, {
      toValue: clampedProgress,
      damping: 14,
      stiffness: 60,
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
  }, []);

  // ── SVG dimensions / metrics ────────────────
  const svgW = width;
  const svgH = height;

  // Bottle body region (where water shows)
  const bodyTop = svgH * 0.28; // where neck meets body
  const bodyBottom = svgH * 0.92; // bottom of bottle
  const bodyHeight = bodyBottom - bodyTop;

  // Water Y: interpolate from bodyBottom (empty) → bodyTop (full)
  const waterY = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [bodyBottom, bodyTop],
  });

  // Small wave offsets
  const waveOffset1 = wave1.interpolate({
    inputRange: [0, 1],
    outputRange: [-3, 3],
  });
  const waveOffset2 = wave2.interpolate({
    inputRange: [0, 1],
    outputRange: [2, -2],
  });

  // Water rect height = bodyBottom - waterY
  const waterHeight = Animated.subtract(bodyBottom, waterY);

  // ── Bottle Path ─────────────────────────────
  // A nice flat-design bottle with rounded bottom and a narrow neck.
  // All values are relative to svgW / svgH.
  const capW = svgW * 0.22;
  const capH = svgH * 0.05;
  const capX = (svgW - capW) / 2;
  const capY = svgH * 0.04;
  const capR = capH * 0.4;

  const neckW = svgW * 0.18;
  const neckX = (svgW - neckW) / 2;
  const neckTop = capY + capH;
  const neckBot = bodyTop;

  const bodyW = svgW * 0.56;
  const bodyX = (svgW - bodyW) / 2;
  const bodyR = bodyW * 0.14; // corner radius

  // Bottle outline path (neck → body → rounded bottom)
  const bottlePath = `
    M ${neckX} ${neckTop}
    L ${neckX} ${neckBot - 6}
    Q ${neckX} ${neckBot}  ${bodyX + bodyR} ${neckBot + 12}
    L ${bodyX + bodyR} ${neckBot + 12}
    Q ${bodyX} ${neckBot + 14}  ${bodyX} ${bodyTop + bodyR + 14}
    L ${bodyX} ${bodyBottom - bodyR}
    Q ${bodyX} ${bodyBottom}  ${bodyX + bodyR} ${bodyBottom}
    L ${bodyX + bodyW - bodyR} ${bodyBottom}
    Q ${bodyX + bodyW} ${bodyBottom}  ${bodyX + bodyW} ${bodyBottom - bodyR}
    L ${bodyX + bodyW} ${bodyTop + bodyR + 14}
    Q ${bodyX + bodyW} ${neckBot + 14}  ${bodyX + bodyW - bodyR} ${neckBot + 12}
    L ${neckX + neckW - (neckX - bodyX) + bodyR} ${neckBot + 12}
    Q ${neckX + neckW} ${neckBot}  ${neckX + neckW} ${neckBot - 6}
    L ${neckX + neckW} ${neckTop}
    Z
  `;

  // Water color based on progress
  const isComplete = clampedProgress >= 1;

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
            <Stop offset="0" stopColor={isComplete ? '#34D399' : '#38BDF8'} stopOpacity="0.9" />
            <Stop offset="1" stopColor={isComplete ? '#059669' : '#0284C7'} stopOpacity="1" />
          </LinearGradient>

          {/* Glass highlight */}
          <LinearGradient id="glassHighlight" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#ffffff" stopOpacity="0.08" />
            <Stop offset="0.3" stopColor="#ffffff" stopOpacity="0.02" />
            <Stop offset="0.7" stopColor="#ffffff" stopOpacity="0" />
            <Stop offset="1" stopColor="#ffffff" stopOpacity="0.04" />
          </LinearGradient>

          {/* Bottle border gradient */}
          <LinearGradient id="bottleBorder" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#475569" stopOpacity="0.6" />
            <Stop offset="1" stopColor="#334155" stopOpacity="0.3" />
          </LinearGradient>
        </Defs>

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
          fill="rgba(255,255,255,0.04)"
          stroke="url(#bottleBorder)"
          strokeWidth={1.5}
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
            y={Animated.add(waterY, waveOffset1)}
            width={svgW}
            height={4}
            rx={2}
            fill="rgba(255,255,255,0.15)"
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
  wrapper: { alignItems: 'center', justifyContent: 'center' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '25%',
  },
});
