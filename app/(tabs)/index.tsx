import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CircularProgress from '@/components/CircularProgress';
import {
  BOTTLES,
  DAILY_TASKS,
  GLASS_SIZES,
  getDailyQuote,
  getLevel,
} from '@/constants/waterData';

export default function HomeScreen() {
  const [waterAmount, setWaterAmount] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(2500);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [userName, setUserName] = useState('');
  const [selectedBottle, setSelectedBottle] = useState(1);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [scaleAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const today = new Date().toDateString();
      const savedDate = await AsyncStorage.getItem('date');

      if (savedDate !== today) {
        await AsyncStorage.setItem('date', today);
        await AsyncStorage.setItem('water', '0');
        await AsyncStorage.setItem('completedTasks', JSON.stringify([]));
        setWaterAmount(0);
        setCompletedTasks([]);

        // Streak check
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (savedDate === yesterday.toDateString()) {
          const prevWater = parseInt((await AsyncStorage.getItem('prevDayWater')) || '0');
          const goal = parseInt((await AsyncStorage.getItem('dailyGoal')) || '2500');
          if (prevWater >= goal) {
            const newStreak = (parseInt((await AsyncStorage.getItem('streak')) || '0')) + 1;
            setStreak(newStreak);
            await AsyncStorage.setItem('streak', newStreak.toString());
          } else {
            setStreak(0);
            await AsyncStorage.setItem('streak', '0');
          }
        } else if (savedDate) {
          setStreak(0);
          await AsyncStorage.setItem('streak', '0');
        }
      } else {
        const saved = await AsyncStorage.getItem('water');
        if (saved) setWaterAmount(parseInt(saved));
        const tasks = await AsyncStorage.getItem('completedTasks');
        if (tasks) setCompletedTasks(JSON.parse(tasks));
      }

      const goal = await AsyncStorage.getItem('dailyGoal');
      if (goal) setDailyGoal(parseInt(goal));

      const savedPoints = await AsyncStorage.getItem('points');
      if (savedPoints) setPoints(parseInt(savedPoints));

      const savedStreak = await AsyncStorage.getItem('streak');
      if (savedStreak) setStreak(parseInt(savedStreak));

      const name = await AsyncStorage.getItem('userName');
      if (name) setUserName(name);

      const bottle = await AsyncStorage.getItem('selectedBottle');
      if (bottle) setSelectedBottle(parseInt(bottle));
    } catch {
      /* ignore */
    }
  };

  const animatePulse = useCallback(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1.15, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
  }, [scaleAnim]);

  const addWater = async (amount: number) => {
    const newAmount = Math.min(waterAmount + amount, 5000);
    setWaterAmount(newAmount);
    await AsyncStorage.setItem('water', newAmount.toString());
    await AsyncStorage.setItem('prevDayWater', newAmount.toString());
    animatePulse();

    if (newAmount >= dailyGoal && waterAmount < dailyGoal) {
      const newPoints = points + 100;
      setPoints(newPoints);
      await AsyncStorage.setItem('points', newPoints.toString());
      Alert.alert('🎉 Tebrikler!', 'Günlük hedefini tamamladın! +100 puan kazandın!');
    }
  };

  const percentage = Math.round((waterAmount / dailyGoal) * 100);
  const progress = waterAmount / dailyGoal;
  const bottle = BOTTLES.find((b) => b.id === selectedBottle);
  const level = getLevel(points);
  const quote = getDailyQuote();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'İyi günler';
    return 'İyi akşamlar';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* ─── Header ──────────────────────────────── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()} 👋</Text>
          <Text style={styles.userName}>{userName || 'Kullanıcı'}</Text>
        </View>
        <View style={styles.headerRight}>
          {streak > 0 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>🔥 {streak}</Text>
            </View>
          )}
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{level.emoji} {level.name}</Text>
          </View>
        </View>
      </View>

      {/* ─── Circular Progress ───────────────────── */}
      <View style={styles.progressSection}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <CircularProgress
            size={240}
            strokeWidth={16}
            progress={progress}
            color={progress >= 1 ? '#10B981' : '#00B4D8'}
            bgColor="#0A1929"
          >
            <Text style={styles.bottleEmoji}>{bottle?.emoji || '🧴'}</Text>
            <Text style={styles.percentText}>{Math.min(percentage, 100)}%</Text>
            <Text style={styles.amountSmall}>
              {waterAmount} / {dailyGoal} ml
            </Text>
          </CircularProgress>
        </Animated.View>
      </View>

      {/* ─── Status Text ─────────────────────────── */}
      <Text style={styles.statusText}>
        {waterAmount >= dailyGoal
          ? '✅ Hedef tamamlandı! Harikasın!'
          : `💧 ${dailyGoal - waterAmount} ml daha içmen gerekiyor`}
      </Text>

      {/* ─── Glass Size Buttons ──────────────────── */}
      <View style={styles.glassSection}>
        <Text style={styles.sectionTitle}>Su Ekle</Text>
        <View style={styles.glassGrid}>
          {GLASS_SIZES.map((glass) => (
            <TouchableOpacity
              key={glass.amount}
              style={styles.glassButton}
              onPress={() => addWater(glass.amount)}
              activeOpacity={0.7}
            >
              <Text style={styles.glassEmoji}>{glass.emoji}</Text>
              <Text style={styles.glassLabel}>{glass.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ─── Points & Level ──────────────────────── */}
      <View style={styles.pointsCard}>
        <View style={styles.pointsRow}>
          <View style={styles.pointsInfo}>
            <Text style={styles.pointsLabel}>Toplam Puan</Text>
            <Text style={styles.pointsValue}>⭐ {points}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.pointsInfo}>
            <Text style={styles.pointsLabel}>Seviye</Text>
            <Text style={styles.pointsValue}>{level.emoji} {level.level}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.pointsInfo}>
            <Text style={styles.pointsLabel}>Seri</Text>
            <Text style={styles.pointsValue}>🔥 {streak} gün</Text>
          </View>
        </View>
      </View>

      {/* ─── Daily Tasks ─────────────────────────── */}
      <View style={styles.tasksSection}>
        <Text style={styles.sectionTitle}>Günlük Görevler</Text>
        {DAILY_TASKS.slice(0, 3).map((task) => {
          const done = completedTasks.includes(task.id);
          return (
            <View key={task.id} style={[styles.taskCard, done && styles.taskDone]}>
              <Text style={styles.taskEmoji}>{task.emoji}</Text>
              <View style={styles.taskInfo}>
                <Text style={[styles.taskName, done && styles.taskNameDone]}>{task.name}</Text>
                <Text style={styles.taskDesc}>{task.description}</Text>
              </View>
              <View style={[styles.taskReward, done && styles.taskRewardDone]}>
                <Text style={styles.taskRewardText}>+{task.reward}</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* ─── Motivation Quote ────────────────────── */}
      <View style={styles.quoteCard}>
        <Text style={styles.quoteText}>{quote}</Text>
      </View>

      {/* ─── Reset ───────────────────────────────── */}
      <TouchableOpacity
        style={styles.resetButton}
        onPress={async () => {
          setWaterAmount(0);
          await AsyncStorage.setItem('water', '0');
        }}
      >
        <Ionicons name="refresh" size={16} color="#5A7A9A" />
        <Text style={styles.resetText}>Bugünü Sıfırla</Text>
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#03045E' },
  content: { padding: 20, paddingTop: 60 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  greeting: { color: '#5A7A9A', fontSize: 14 },
  userName: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginTop: 2 },
  headerRight: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  streakBadge: { backgroundColor: '#1A0A00', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#FF6B00' },
  streakText: { color: '#FF6B00', fontSize: 13, fontWeight: 'bold' },
  levelBadge: { backgroundColor: '#0A1929', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#0077B6' },
  levelText: { color: '#00B4D8', fontSize: 13, fontWeight: '600' },

  // Progress
  progressSection: { alignItems: 'center', marginVertical: 16 },
  bottleEmoji: { fontSize: 40, marginBottom: 4 },
  percentText: { color: '#fff', fontSize: 36, fontWeight: 'bold' },
  amountSmall: { color: '#5A7A9A', fontSize: 13, marginTop: 2 },
  statusText: { color: '#90E0EF', fontSize: 15, textAlign: 'center', marginBottom: 24 },

  // Glass buttons
  glassSection: { marginBottom: 20 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 14 },
  glassGrid: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  glassButton: {
    flex: 1, minWidth: 60, backgroundColor: '#0A1929', borderRadius: 16,
    paddingVertical: 14, alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: '#0D2137',
  },
  glassEmoji: { fontSize: 24 },
  glassLabel: { color: '#90E0EF', fontSize: 12, fontWeight: '600' },

  // Points
  pointsCard: { backgroundColor: '#0A1929', borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#0D2137' },
  pointsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  pointsInfo: { alignItems: 'center' },
  pointsLabel: { color: '#5A7A9A', fontSize: 12, marginBottom: 6 },
  pointsValue: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  divider: { width: 1, height: 36, backgroundColor: '#0D2137' },

  // Tasks
  tasksSection: { marginBottom: 20 },
  taskCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#0A1929',
    borderRadius: 16, padding: 16, gap: 14, marginBottom: 10,
    borderWidth: 1, borderColor: '#0D2137',
  },
  taskDone: { borderColor: '#10B981', opacity: 0.7 },
  taskEmoji: { fontSize: 28 },
  taskInfo: { flex: 1 },
  taskName: { color: '#fff', fontSize: 15, fontWeight: '600' },
  taskNameDone: { textDecorationLine: 'line-through', color: '#5A7A9A' },
  taskDesc: { color: '#5A7A9A', fontSize: 12, marginTop: 2 },
  taskReward: { backgroundColor: '#0D2137', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  taskRewardDone: { backgroundColor: '#10B981' },
  taskRewardText: { color: '#FFD700', fontSize: 12, fontWeight: 'bold' },

  // Quote
  quoteCard: { backgroundColor: '#0A1929', borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#0D2137' },
  quoteText: { color: '#90E0EF', fontSize: 15, textAlign: 'center', fontStyle: 'italic', lineHeight: 22 },

  // Reset
  resetButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 14 },
  resetText: { color: '#5A7A9A', fontSize: 14 },
});
