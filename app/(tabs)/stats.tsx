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
      const saved = await AsyncStorage.getItem('weeklyData');
      if (saved) setWeeklyData(JSON.parse(saved));

      const goal = await AsyncStorage.getItem('dailyGoal');
      if (goal) setDailyGoal(parseInt(goal));

      const s = await AsyncStorage.getItem('streak');
      if (s) setStreak(parseInt(s));

      const td = await AsyncStorage.getItem('totalDays');
      if (td) setTotalDays(parseInt(td));

      const bd = await AsyncStorage.getItem('bestDay');
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
  const chartHeight = 200;
  const barWidth = 32;
  const chartWidth = DAYS.length * (barWidth + 16);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>📊 İstatistikler</Text>

      {/* ─── Streak Banner ────────────────────────── */}
      <View style={styles.streakCard}>
        <View style={styles.streakLeft}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <View>
            <Text style={styles.streakValue}>{streak} Gün</Text>
            <Text style={styles.streakLabel}>Aktif Seri</Text>
          </View>
        </View>
        <View style={styles.streakRight}>
          <Text style={styles.streakMotivation}>
            {streak === 0
              ? 'Bugün başla!'
              : streak < 3
                ? 'Devam et!'
                : streak < 7
                  ? 'Harika gidiyorsun!'
                  : 'Efsanesin! 🏆'}
          </Text>
        </View>
      </View>

      {/* ─── Overview Cards ──────────────────────── */}
      <View style={styles.cardGrid}>
        <View style={styles.statCard}>
          <Text style={styles.cardEmoji}>🎯</Text>
          <Text style={styles.cardValue}>{goalsReached}/7</Text>
          <Text style={styles.cardLabel}>Hedef Tamamlanan</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.cardEmoji}>📈</Text>
          <Text style={styles.cardValue}>{average}ml</Text>
          <Text style={styles.cardLabel}>Günlük Ortalama</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.cardEmoji}>🏅</Text>
          <Text style={styles.cardValue}>{Math.max(...weeklyData, bestDay)}ml</Text>
          <Text style={styles.cardLabel}>En İyi Gün</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.cardEmoji}>📅</Text>
          <Text style={styles.cardValue}>{totalDays}</Text>
          <Text style={styles.cardLabel}>Toplam Gün</Text>
        </View>
      </View>

      {/* ─── Weekly Chart ────────────────────────── */}
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Haftalık Özet</Text>
        <View style={styles.chartCard}>
          {/* Goal line label */}
          <View style={styles.goalLineRow}>
            <View style={styles.goalLine} />
            <Text style={styles.goalLineLabel}>{dailyGoal}ml hedef</Text>
          </View>

          {/* Chart */}
          <View style={styles.chartContainer}>
            <Svg width={chartWidth} height={chartHeight}>
              {weeklyData.map((value, index) => {
                const barHeight = maxValue > 0 ? (value / maxValue) * (chartHeight - 20) : 0;
                const x = index * (barWidth + 16) + 8;
                const y = chartHeight - barHeight;
                const isGoalReached = value >= dailyGoal;
                return (
                  <React.Fragment key={index}>
                    {/* Background bar */}
                    <Rect
                      x={x}
                      y={20}
                      width={barWidth}
                      height={chartHeight - 20}
                      rx={8}
                      fill="#0D2137"
                    />
                    {/* Value bar */}
                    <Rect
                      x={x}
                      y={Math.max(y, 20)}
                      width={barWidth}
                      height={Math.max(barHeight, 4)}
                      rx={8}
                      fill={isGoalReached ? '#10B981' : '#0077B6'}
                    />
                  </React.Fragment>
                );
              })}
            </Svg>
          </View>

          {/* Day labels */}
          <View style={styles.dayLabels}>
            {DAYS.map((day, i) => (
              <View key={day} style={styles.dayLabelItem}>
                <Text style={styles.dayValue}>
                  {weeklyData[i] > 0 ? `${weeklyData[i]}` : '-'}
                </Text>
                <Text
                  style={[
                    styles.dayLabel,
                    weeklyData[i] >= dailyGoal && styles.dayLabelActive,
                  ]}
                >
                  {day}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* ─── Insights ────────────────────────────── */}
      <View style={styles.insightsSection}>
        <Text style={styles.sectionTitle}>💡 Analiz</Text>

        <View style={styles.insightCard}>
          <Text style={styles.insightEmoji}>💧</Text>
          <View style={styles.insightInfo}>
            <Text style={styles.insightTitle}>Günlük Hedef</Text>
            <Text style={styles.insightValue}>{dailyGoal} ml</Text>
          </View>
          <View style={styles.insightBar}>
            <View style={[styles.insightFill, { width: `${Math.min((average / dailyGoal) * 100, 100)}%` }]} />
          </View>
        </View>

        <View style={styles.insightCard}>
          <Text style={styles.insightEmoji}>🏋️</Text>
          <View style={styles.insightInfo}>
            <Text style={styles.insightTitle}>Haftalık Başarı</Text>
            <Text style={styles.insightValue}>%{Math.round((goalsReached / 7) * 100)}</Text>
          </View>
          <View style={styles.insightBar}>
            <View style={[styles.insightFill, { width: `${(goalsReached / 7) * 100}%`, backgroundColor: '#10B981' }]} />
          </View>
        </View>

        <View style={styles.insightCard}>
          <Text style={styles.insightEmoji}>📊</Text>
          <View style={styles.insightInfo}>
            <Text style={styles.insightTitle}>Bu Hafta Toplam</Text>
            <Text style={styles.insightValue}>
              {(weeklyData.reduce((a, b) => a + b, 0) / 1000).toFixed(1)} litre
            </Text>
          </View>
        </View>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#03045E' },
  content: { padding: 20, paddingTop: 60 },
  title: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 20 },

  // Streak
  streakCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#1A0A00', borderRadius: 20, padding: 20, marginBottom: 20,
    borderWidth: 1, borderColor: '#FF6B00',
  },
  streakLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  streakEmoji: { fontSize: 40 },
  streakValue: { color: '#FF6B00', fontSize: 28, fontWeight: 'bold' },
  streakLabel: { color: '#CC5500', fontSize: 13 },
  streakRight: { flex: 1, alignItems: 'flex-end' },
  streakMotivation: { color: '#FFB366', fontSize: 13, textAlign: 'right' },

  // Card Grid
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: {
    width: '47%', backgroundColor: '#0A1929', borderRadius: 18,
    padding: 18, alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: '#0D2137',
  },
  cardEmoji: { fontSize: 28 },
  cardValue: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  cardLabel: { color: '#5A7A9A', fontSize: 12, textAlign: 'center' },

  // Chart
  chartSection: { marginBottom: 24 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 14 },
  chartCard: {
    backgroundColor: '#0A1929', borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: '#0D2137',
  },
  goalLineRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  goalLine: { flex: 1, height: 1, backgroundColor: '#10B981', borderStyle: 'dashed' },
  goalLineLabel: { color: '#10B981', fontSize: 11 },
  chartContainer: { alignItems: 'center', marginVertical: 12 },
  dayLabels: { flexDirection: 'row', justifyContent: 'space-around' },
  dayLabelItem: { alignItems: 'center', width: 48, gap: 4 },
  dayValue: { color: '#5A7A9A', fontSize: 11 },
  dayLabel: { color: '#5A7A9A', fontSize: 13, fontWeight: '600' },
  dayLabelActive: { color: '#10B981' },

  // Insights
  insightsSection: { marginBottom: 20 },
  insightCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#0A1929',
    borderRadius: 16, padding: 16, gap: 14, marginBottom: 10,
    borderWidth: 1, borderColor: '#0D2137',
  },
  insightEmoji: { fontSize: 28 },
  insightInfo: { flex: 1 },
  insightTitle: { color: '#5A7A9A', fontSize: 13 },
  insightValue: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginTop: 2 },
  insightBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: '#0D2137', borderBottomLeftRadius: 16, borderBottomRightRadius: 16, overflow: 'hidden' },
  insightFill: { height: '100%', backgroundColor: '#0077B6', borderRadius: 3 },
});
