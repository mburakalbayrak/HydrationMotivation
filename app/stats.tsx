import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const DAILY_GOAL = 2500;
const DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

export default function StatsScreen() {
  const [weeklyData, setWeeklyData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    loadWeeklyData();
  }, []);

  const loadWeeklyData = async () => {
    try {
      const saved = await AsyncStorage.getItem('weeklyData');
      if (saved) setWeeklyData(JSON.parse(saved));
    } catch {}
  };

  const maxValue = Math.max(...weeklyData, DAILY_GOAL);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>📊 Haftalık İstatistik</Text>

      <View style={styles.chartContainer}>
        {weeklyData.map((value, index) => {
          const height = Math.max((value / maxValue) * 200, 4);
          const isGoalReached = value >= DAILY_GOAL;
          return (
            <View key={index} style={styles.barWrapper}>
              <Text style={styles.barValue}>{value > 0 ? `${value}` : ''}</Text>
              <View style={styles.barBackground}>
                <View
                  style={[
                    styles.bar,
                    { height, backgroundColor: isGoalReached ? '#00B4D8' : '#0077B6' },
                  ]}
                />
              </View>
              <Text style={styles.barLabel}>{DAYS[index]}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {weeklyData.filter((d) => d >= DAILY_GOAL).length}
          </Text>
          <Text style={styles.statLabel}>Hedef Tamamlanan Gün</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {Math.round(weeklyData.reduce((a, b) => a + b, 0) / 7)}ml
          </Text>
          <Text style={styles.statLabel}>Günlük Ortalama</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {Math.max(...weeklyData)}ml
          </Text>
          <Text style={styles.statLabel}>En İyi Gün</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{DAILY_GOAL}ml</Text>
          <Text style={styles.statLabel}>Günlük Hedef</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#03045E' },
  content: { padding: 20, alignItems: 'center' },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 30 },
  chartContainer: {
    flexDirection: 'row', alignItems: 'flex-end',
    justifyContent: 'space-between', width: '100%',
    backgroundColor: '#023E8A', borderRadius: 16,
    padding: 16, marginBottom: 30, height: 280,
  },
  barWrapper: { alignItems: 'center', flex: 1 },
  barValue: { color: '#90E0EF', fontSize: 10, marginBottom: 4 },
  barBackground: { width: 28, height: 200, justifyContent: 'flex-end', borderRadius: 8, backgroundColor: '#03045E' },
  bar: { width: '100%', borderRadius: 8 },
  barLabel: { color: '#90E0EF', fontSize: 12, marginTop: 6 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, width: '100%' },
  statCard: {
    backgroundColor: '#023E8A', borderRadius: 16,
    padding: 16, alignItems: 'center',
    width: '47%',
  },
  statValue: { color: '#00B4D8', fontSize: 22, fontWeight: 'bold' },
  statLabel: { color: '#90E0EF', fontSize: 12, marginTop: 4, textAlign: 'center' },
});