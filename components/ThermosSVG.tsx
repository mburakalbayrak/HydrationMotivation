import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import Svg, {
    Circle,
    ClipPath,
    Defs,
    Ellipse,
    G,
    Line,
    LinearGradient,
    Path,
    Rect,
    Stop,
} from 'react-native-svg';

interface ThermosProps {
  fillPercent: number; // 0..1
  width?: number;
  height?: number;
}

const AnimatedRect = Animated.createAnimatedComponent(Rect);

export default function ThermosSVG({ fillPercent, width = 180, height = 340 }: ThermosProps) {
  const clamped = Math.min(Math.max(fillPercent, 0), 1);
  const fillAnim = useRef(new Animated.Value(clamped)).current;

  useEffect(() => {
    Animated.spring(fillAnim, {
      toValue: clamped,
      useNativeDriver: false,
      tension: 40,
      friction: 8,
    }).start();
  }, [clamped, fillAnim]);

  const W = width;
  const H = height;

  const bodyX = W * 0.18;
  const bodyW = W * 0.58;
  const bodyY = H * 0.22;
  const bodyH = H * 0.68;
  const bodyRx = W * 0.12;

  const neckX = W * 0.28;
  const neckW = W * 0.38;
  const neckY = H * 0.1;
  const neckH = H * 0.14;

  const capX = W * 0.24;
  const capW = W * 0.46;
  const capY = H * 0.01;
  const capH = H * 0.11;

  const gaugeX = W * 0.4;
  const gaugeW = W * 0.12;
  const gaugeY = bodyY + bodyH * 0.08;
  const gaugeH = bodyH * 0.76;
  const gaugeRx = gaugeW * 0.5;

  const handleX = bodyX + bodyW + W * 0.02;
  const handleY = bodyY + bodyH * 0.18;
  const handleW = W * 0.14;
  const handleH = bodyH * 0.55;

  const waterY = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [gaugeY + gaugeH, gaugeY + gaugeH * 0.04],
  });
  const waterH = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, gaugeH * 0.96],
  });

  return (
    <View style={{ width: W, height: H }}>
      <Svg width={W} height={H}>
        <Defs>
          <LinearGradient id="thermosBodyGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#3a4a3a" stopOpacity="1" />
            <Stop offset="0.3" stopColor="#5a7a5a" stopOpacity="1" />
            <Stop offset="0.5" stopColor="#6e9068" stopOpacity="1" />
            <Stop offset="0.7" stopColor="#5a7a5a" stopOpacity="1" />
            <Stop offset="1" stopColor="#2a3a2a" stopOpacity="1" />
          </LinearGradient>

          <LinearGradient id="thermosCapGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#4a5a4a" stopOpacity="1" />
            <Stop offset="0.4" stopColor="#7a9a7a" stopOpacity="1" />
            <Stop offset="1" stopColor="#3a4a3a" stopOpacity="1" />
          </LinearGradient>

          <LinearGradient id="thermosWaterGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#60C8E8" stopOpacity="0.95" />
            <Stop offset="1" stopColor="#1a7aaa" stopOpacity="0.9" />
          </LinearGradient>

          <ClipPath id="thermosGaugeClip">
            <Rect x={gaugeX} y={gaugeY} width={gaugeW} height={gaugeH} rx={gaugeRx} />
          </ClipPath>

          <LinearGradient id="thermosHighlightGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#ffffff" stopOpacity="0" />
            <Stop offset="0.4" stopColor="#ffffff" stopOpacity="0.07" />
            <Stop offset="0.6" stopColor="#ffffff" stopOpacity="0.12" />
            <Stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </LinearGradient>

          <LinearGradient id="thermosRingGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#2a3a2a" stopOpacity="1" />
            <Stop offset="0.5" stopColor="#6a8a6a" stopOpacity="1" />
            <Stop offset="1" stopColor="#2a3a2a" stopOpacity="1" />
          </LinearGradient>
        </Defs>

        <Path
          d={`
            M ${handleX} ${handleY + handleH * 0.1}
            Q ${handleX + handleW * 1.5} ${handleY} ${handleX + handleW} ${handleY + handleH * 0.3}
            L ${handleX + handleW} ${handleY + handleH * 0.7}
            Q ${handleX + handleW * 1.5} ${handleY + handleH} ${handleX} ${handleY + handleH * 0.9}
          `}
          fill="none"
          stroke="#5a7a5a"
          strokeWidth={W * 0.03}
          strokeLinecap="round"
        />
        <Path
          d={`
            M ${handleX} ${handleY + handleH * 0.1}
            Q ${handleX + handleW * 1.5} ${handleY} ${handleX + handleW} ${handleY + handleH * 0.3}
            L ${handleX + handleW} ${handleY + handleH * 0.7}
            Q ${handleX + handleW * 1.5} ${handleY + handleH} ${handleX} ${handleY + handleH * 0.9}
          `}
          fill="none"
          stroke="#8aaa8a"
          strokeWidth={W * 0.015}
          strokeLinecap="round"
        />

        <Rect
          x={bodyX}
          y={bodyY + bodyH * 0.88}
          width={bodyW}
          height={bodyH * 0.12}
          rx={bodyRx}
          fill="url(#thermosRingGrad)"
        />

        <Rect x={bodyX} y={bodyY} width={bodyW} height={bodyH * 0.92} rx={bodyRx} fill="url(#thermosBodyGrad)" />

        <Rect
          x={bodyX}
          y={bodyY}
          width={bodyW}
          height={bodyH * 0.92}
          rx={bodyRx}
          fill="url(#thermosHighlightGrad)"
        />

        <Rect x={gaugeX} y={gaugeY} width={gaugeW} height={gaugeH} rx={gaugeRx} fill="#0a1a2a" opacity={0.85} />

        <G clipPath="url(#thermosGaugeClip)">
          <AnimatedRect
            x={gaugeX}
            y={waterY as unknown as number}
            width={gaugeW}
            height={waterH as unknown as number}
            fill="url(#thermosWaterGrad)"
          />
        </G>

        <Rect
          x={gaugeX + gaugeW * 0.15}
          y={gaugeY + gaugeH * 0.03}
          width={gaugeW * 0.25}
          height={gaugeH * 0.94}
          rx={gaugeW * 0.12}
          fill="#ffffff"
          opacity={0.12}
        />

        <Rect
          x={gaugeX}
          y={gaugeY}
          width={gaugeW}
          height={gaugeH}
          rx={gaugeRx}
          fill="none"
          stroke="#8ab08a"
          strokeWidth={1.5}
          opacity={0.7}
        />

        <Rect x={neckX} y={neckY} width={neckW} height={neckH + 10} rx={W * 0.05} fill="url(#thermosBodyGrad)" />

        {[0.2, 0.4, 0.6, 0.8].map((t, i) => (
          <Line
            key={i}
            x1={neckX}
            y1={neckY + neckH * t}
            x2={neckX + neckW}
            y2={neckY + neckH * t}
            stroke="#8aaa8a"
            strokeWidth={0.8}
            opacity={0.4}
          />
        ))}

        <Rect x={capX} y={capY} width={capW} height={capH} rx={W * 0.06} fill="url(#thermosCapGrad)" />

        {[0.15, 0.3, 0.45, 0.6, 0.75, 0.9].map((t, i) => (
          <Line
            key={i}
            x1={capX + W * 0.02}
            y1={capY + capH * t}
            x2={capX + capW - W * 0.02}
            y2={capY + capH * t}
            stroke="#9aba9a"
            strokeWidth={1}
            opacity={0.5}
          />
        ))}

        <Rect
          x={capX + capW * 0.1}
          y={capY + capH * 0.1}
          width={capW * 0.3}
          height={capH * 0.3}
          rx={W * 0.02}
          fill="#ffffff"
          opacity={0.15}
        />

        <Line
          x1={bodyX + bodyW * 0.5}
          y1={bodyY + bodyH * 0.05}
          x2={bodyX + bodyW * 0.5}
          y2={bodyY + bodyH * 0.85}
          stroke="#3a5a3a"
          strokeWidth={1}
          opacity={0.5}
        />

        <Ellipse
          cx={bodyX + bodyW / 2}
          cy={bodyY + bodyH}
          rx={(bodyW / 2) * 0.85}
          ry={H * 0.018}
          fill="#1a2a1a"
          opacity={0.8}
        />

        <Circle
          cx={capX + capW * 0.82}
          cy={capY + capH * 0.28}
          r={W * 0.015}
          fill="#b6d1b6"
          opacity={0.6}
        />
      </Svg>
    </View>
  );
}
