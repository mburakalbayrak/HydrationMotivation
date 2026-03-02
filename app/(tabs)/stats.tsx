import { STORAGE_KEYS } from '@/constants/storageKeys';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

const DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

export default function StatsScreen() {
  const [weeklyData, setWeeklyData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [dailyGoal, setDailyGoal] = useState(2500);
  const [streak, setStreak] = useState(0);
  const [totalDays, setTotalDays] = useState(0);
  const [bestDay, setBestDay] = useState(0);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEYS.WEEKLY_DATA);
      if (saved) setWeeklyData(JSON.parse(saved));
      const goal = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_GOAL);
      if (goal) setDailyGoal(parseInt(goal));
      const s = await AsyncStorage.getItem(STORAGE_KEYS.STREAK);
      if (s) setStreak(parseInt(s));
      const td = await AsyncStorage.getItem(STORAGE_KEYS.TOTAL_DAYS);
      if (td) setTotalDays(parseInt(td));
      const bd = await AsyncStorage.getItem(STORAGE_KEYS.BEST_DAY);
      if (bd) setBestDay(parseInt(bd));
    } catch {
      /* ignore */
    }
  };

  const maxValue = Math.max(...weeklyData, dailyGoal);
  const average = weeklyData.length > 0
    ? Math.round(weeklyData.reduce((a, b) => a + b, 0) / weeklyData.length)
    : 0;
  const goalsReached = weeklyData.filter((d) => d >= dailyGoal).length;
  const weekTotal = weeklyData.reduce((a, b) => a + b, 0);
  const chartHeight = 160;
  const barWidth = 28;
  const gap = 14;
  const chartWidth = DAYS.length * (barWidth + gap);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>İstatistikler</Text>

      {/* Streak */}
      <View style={styles.streakCard}>
        <View style={styles.streakIconWrap}>
          <Ionicons name="flame" size={24} color="#FB923C" />
        </View>
        <View style={styles.streakInfo}>
          <Text style={styles.streakValue}>{streak} gün</Text>
          <Text style={styles.streakLabel}>aktif seri</Text>
        </View>
        <Text style={styles.streakHint}>
          {streak === 0 ? 'Bugün başla' : streak < 7 ? 'Devam et!' : 'Harika!'}
        </Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        {[
          { icon: 'flag-outline' as const, value: `${goalsReached}/7`, label: 'Hedef', color: '#38BDF8' },
          { icon: 'trending-up-outline' as const, value: `${average}`, label: 'Ort. ml', color: '#34D399' },
          { icon: 'medal-outline' as const, value: `${Math.max(...weeklyData, bestDay)}`, label: 'En İyi', color: '#FBBF24' },
          { icon: 'calendar-outline' as const, value: `${totalDays}`, label: 'Toplam', color: '#A78BFA' },
        ].map((stat) => (
          <View key={stat.label} style={styles.miniCard}>
            <Ionicons name={stat.icon} size={18} color={stat.color} />
            <Text style={styles.miniValue}>{stat.value}</Text>
            <Text style={styles.miniLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Weekly Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Haftalık Özet</Text>
        <View style={styles.chartCard}>
          <View style={styles.chartContainer}>
            <Svg width={chartWidth} height={chartHeight}>
              {weeklyData.map((value, index) => {
                const barHeight = maxValue > 0 ? (value / maxValue) * (chartHeight - 24) : 0;
                const x = index * (barWidth + gap);
                const y = chartHeight - barHeight;
                const reached = value >= dailyGoal;
                return (
                  <React.Fragment key={index}>
                    <Rect x={x} y={0} width={barWidth} height={chartHeight} rx={8} fill="rgba(255,255,255,0.03)" />
                    <Rect
                      x={x}
                      y={Math.max(y, 0)}
                      width={barWidth}
                      height={Math.max(barHeight, 3)}
                      rx={8}
                      fill={reached ? '#34D399' : '#38BDF8'}
                      opacity={value > 0 ? 1 : 0.2}
                    />
                  </React.Fragment>
                );
              })}
            </Svg>
          </View>
          <View style={styles.dayLabelsRow}>
            {DAYS.map((day, i) => (
              <Text key={day} style={[styles.dayLabel, weeklyData[i] >= dailyGoal && styles.dayLabelDone]}>
                {day}
              </Text>
            ))}
          </View>
        </View>
      </View>

      {/* Insights */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Analiz</Text>

        <View style={styles.insightRow}>
          <View style={styles.insightIconWrap}>
            <Ionicons name="water-outline" size={18} color="#38BDF8" />
          </View>
          <View style={styles.insightInfo}>
            <Text style={styles.insightLabel}>Günlük Hedef</Text>
            <Text style={styles.insightValue}>{dailyGoal} ml</Text>
          </View>
          <View style={styles.insightBarBg}>
            <View style={[styles.insightBarFill, { width: `${Math.min((average / dailyGoal) * 100, 100)}%` }]} />
          </View>
        </View>

        <View style={styles.insightRow}>
          <View style={styles.insightIconWrap}>
            <Ionicons name="checkmark-done-outline" size={18} color="#34D399" />
          </View>
          <View style={styles.insightInfo}>
            <Text style={styles.insightLabel}>Haftalık Başarı</Text>
            <Text style={styles.insightValue}>%{Math.round((goalsReached / 7) * 100)}</Text>
          </View>
          <View style={styles.insightBarBg}>
            <View style={[styles.insightBarFill, { width: `${(goalsReached / 7) * 100}%`, backgroundColor: '#34D399' }]} />
          </View>
        </View>

        <View style={styles.insightRow}>
          <View style={styles.insightIconWrap}>
            <Ionicons name="beaker-outline" size={18} color="#A78BFA" />
          </View>
          <View style={styles.insightInfo}>
            <Text style={styles.insightLabel}>Bu Hafta Toplam</Text>
            <Text style={styles.insightValue}>{(weekTotal / 1000).toFixed(1)} L</Text>
          </View>
        </View>
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#15294A' },
  content: { padding: 20, paddingTop: 60 },
  title: { color: '#F1F5F9', fontSize: 26, fontWeight: '700', marginBottom: 20, letterSpacing: -0.5 },

  // Streak
  streakCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: 'rgba(251,146,60,0.08)', borderRadius: 16, padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: 'rgba(251,146,60,0.15)',
  },
  streakIconWrap: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(251,146,60,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  streakInfo: { flex: 1 },
  streakValue: { color: '#F1F5F9', fontSize: 18, fontWeight: '700' },
  streakLabel: { color: '#64748B', fontSize: 12 },
  streakHint: { color: '#FB923C', fontSize: 13, fontWeight: '600' },

  // Stats Grid
  statsGrid: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  miniCard: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14,
    padding: 14, alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  miniValue: { color: '#F1F5F9', fontSize: 16, fontWeight: '700' },
  miniLabel: { color: '#475569', fontSize: 11, fontWeight: '500' },

  // Section
  section: { marginBottom: 24 },
  sectionLabel: { color: '#94A3B8', fontSize: 13, fontWeight: '600', marginBottom: 12, letterSpacing: 0.5, textTransform: 'uppercase' },

  // Chart
  chartCard: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', alignItems: 'center',
  },
  chartContainer: { marginBottom: 12 },
  dayLabelsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  dayLabel: { color: '#475569', fontSize: 12, fontWeight: '600', width: 28, textAlign: 'center' },
  dayLabelDone: { color: '#34D399' },

  // Insights
  insightRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)',
  },
  insightIconWrap: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center',
  },
  insightInfo: { flex: 1 },
  insightLabel: { color: '#64748B', fontSize: 12 },
  insightValue: { color: '#F1F5F9', fontSize: 15, fontWeight: '700', marginTop: 1 },
  insightBarBg: {
    width: 60, height: 4, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden',
  },
  insightBarFill: { height: '100%', backgroundColor: '#38BDF8', borderRadius: 2 },
});
