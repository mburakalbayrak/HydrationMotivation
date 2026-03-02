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
import WaterBottle from '@/components/WaterBottle';
import { DAILY_TASKS, GLASS_SIZES, getDailyQuote, getLevel } from '@/constants/waterData';

export default function HomeScreen() {
  const [waterAmount, setWaterAmount] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(2500);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [userName, setUserName] = useState('');
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
      const savedName = await AsyncStorage.getItem('userName');
      if (savedName) setUserName(savedName);
    } catch {
      /* ignore */
    }
  };

  const animatePulse = useCallback(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1.08, useNativeDriver: true }),
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
      Alert.alert('Tebrikler!', 'Günlük hedefini tamamladın! +100 puan kazandın.');
    }
  };

  const progress = Math.min(waterAmount / dailyGoal, 1);
  const percentage = Math.round(progress * 100);
  const level = getLevel(points);
  const quote = getDailyQuote();
  const remaining = Math.max(dailyGoal - waterAmount, 0);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'İyi Günler';
    return 'İyi Akşamlar';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.userName}>{userName || 'Kullanıcı'}</Text>
        </View>
        <View style={styles.headerBadges}>
          {streak > 0 && (
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={14} color="#FB923C" />
              <Text style={styles.streakText}>{streak}</Text>
            </View>
          )}
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Lv.{level.level}</Text>
          </View>
        </View>
      </View>

      {/* Main Bottle */}
      <View style={styles.progressSection}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <WaterBottle progress={progress} width={150}>
            <Text style={styles.percentText}>{percentage}%</Text>
            <Text style={styles.amountText}>{waterAmount} ml</Text>
            <Text style={styles.goalText}>/ {dailyGoal} ml</Text>
          </WaterBottle>
        </Animated.View>
      </View>

      {/* Status */}
      <Text style={styles.statusText}>
        {waterAmount >= dailyGoal
          ? 'Hedef tamamlandı! 🎉'
          : `${remaining} ml daha içmelisin`}
      </Text>

      {/* Quick Add */}
      <View style={styles.addSection}>
        <Text style={styles.sectionLabel}>Su Ekle (ml)</Text>
        <View style={styles.glassRow}>
          {GLASS_SIZES.map((glass) => (
            <TouchableOpacity
              key={glass.amount}
              style={styles.glassButton}
              onPress={() => addWater(glass.amount)}
              activeOpacity={0.6}
            >
              <Text style={styles.glassAmount}>+{glass.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Ionicons name="star" size={18} color="#FBBF24" />
          <Text style={styles.statValue}>{points}</Text>
          <Text style={styles.statLabel}>Puan</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="trophy" size={18} color="#A78BFA" />
          <Text style={styles.statValue}>{level.name}</Text>
          <Text style={styles.statLabel}>Seviye</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="flame" size={18} color="#FB923C" />
          <Text style={styles.statValue}>{streak}</Text>
          <Text style={styles.statLabel}>Seri</Text>
        </View>
      </View>

      {/* Daily Tasks */}
      <View style={styles.tasksSection}>
        <Text style={styles.sectionLabel}>Günlük Görevler</Text>
        {DAILY_TASKS.slice(0, 3).map((task) => {
          const done = completedTasks.includes(task.id);
          return (
            <View key={task.id} style={[styles.taskRow, done && styles.taskRowDone]}>
              <View style={[styles.taskIcon, done && styles.taskIconDone]}>
                <Ionicons
                  name={done ? 'checkmark' : (task.icon as keyof typeof Ionicons.glyphMap)}
                  size={16}
                  color={done ? '#fff' : '#64748B'}
                />
              </View>
              <View style={styles.taskInfo}>
                <Text style={[styles.taskName, done && styles.taskNameDone]}>{task.name}</Text>
                <Text style={styles.taskDesc}>{task.description}</Text>
              </View>
              <Text style={[styles.taskReward, done && styles.taskRewardDone]}>+{task.reward}</Text>
            </View>
          );
        })}
      </View>

      {/* Quote */}
      <View style={styles.quoteCard}>
        <Ionicons name="chatbubble-outline" size={16} color="#475569" />
        <Text style={styles.quoteText}>{quote}</Text>
      </View>

      {/* Reset */}
      <TouchableOpacity
        style={styles.resetButton}
        onPress={async () => {
          setWaterAmount(0);
          await AsyncStorage.setItem('water', '0');
        }}
      >
        <Ionicons name="refresh-outline" size={15} color="#475569" />
        <Text style={styles.resetText}>Bugünü Sıfırla</Text>
      </TouchableOpacity>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  content: { padding: 20, paddingTop: 60 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  greeting: { color: '#475569', fontSize: 14, fontWeight: '500' },
  userName: { color: '#F1F5F9', fontSize: 22, fontWeight: '700', marginTop: 2, letterSpacing: -0.5 },
  headerBadges: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  streakBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(251,146,60,0.12)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10,
  },
  streakText: { color: '#FB923C', fontSize: 13, fontWeight: '700' },
  levelBadge: {
    backgroundColor: 'rgba(56,189,248,0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10,
  },
  levelText: { color: '#38BDF8', fontSize: 13, fontWeight: '700' },

  // Progress
  progressSection: { alignItems: 'center', marginVertical: 16 },
  percentText: { color: '#F1F5F9', fontSize: 38, fontWeight: '800', letterSpacing: -2, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  amountText: { color: '#E2E8F0', fontSize: 15, fontWeight: '600', marginTop: 2, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  goalText: { color: '#94A3B8', fontSize: 13, marginTop: 1, textShadowColor: 'rgba(0,0,0,0.4)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },

  // Status
  statusText: { color: '#64748B', fontSize: 14, textAlign: 'center', marginBottom: 24, fontWeight: '500' },

  // Glass buttons
  addSection: { marginBottom: 20 },
  sectionLabel: { color: '#94A3B8', fontSize: 13, fontWeight: '600', marginBottom: 12, letterSpacing: 0.5, textTransform: 'uppercase' },
  glassRow: { flexDirection: 'row', gap: 8 },
  glassButton: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  glassAmount: { color: '#38BDF8', fontSize: 14, fontWeight: '700' },

  // Stats
  statsCard: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16,
    padding: 18, marginBottom: 24, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { color: '#F1F5F9', fontSize: 15, fontWeight: '700' },
  statLabel: { color: '#475569', fontSize: 11, fontWeight: '500' },
  statDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.06)' },

  // Tasks
  tasksSection: { marginBottom: 20 },
  taskRow: {
    flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12,
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, marginBottom: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)',
  },
  taskRowDone: { opacity: 0.5 },
  taskIcon: {
    width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center',
  },
  taskIconDone: { backgroundColor: '#34D399' },
  taskInfo: { flex: 1 },
  taskName: { color: '#E2E8F0', fontSize: 14, fontWeight: '600' },
  taskNameDone: { textDecorationLine: 'line-through', color: '#64748B' },
  taskDesc: { color: '#475569', fontSize: 12, marginTop: 1 },
  taskReward: { color: '#FBBF24', fontSize: 13, fontWeight: '700' },
  taskRewardDone: { color: '#475569' },

  // Quote
  quoteCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)',
  },
  quoteText: { color: '#64748B', fontSize: 14, fontStyle: 'italic', lineHeight: 20, flex: 1 },

  // Reset
  resetButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12 },
  resetText: { color: '#475569', fontSize: 13, fontWeight: '500' },
});
