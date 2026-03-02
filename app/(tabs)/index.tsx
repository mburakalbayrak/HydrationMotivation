import CircularProgress from '@/components/CircularProgress';
import WaterBottle from '@/components/WaterBottle';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { BOTTLES, DAILY_TASKS, GLASS_SIZES, getDailyQuote, getLevel } from '@/constants/waterData';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Animated,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function HomeScreen() {
  const [waterAmount, setWaterAmount] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(2500);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [userName, setUserName] = useState('');
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [drinkCount, setDrinkCount] = useState(0);
  const [weeklyData, setWeeklyData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [selectedBottleId, setSelectedBottleId] = useState('classic');
  const [selectedAmount, setSelectedAmount] = useState(200);
  const [scaleAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const syncSelectedBottle = async () => {
        try {
          const savedBottle = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_BOTTLE);
          if (savedBottle) setSelectedBottleId(savedBottle);
          else setSelectedBottleId('classic');
        } catch {
          /* ignore */
        }
      };

      syncSelectedBottle();
    }, []),
  );

  const loadData = async () => {
    try {
      const today = new Date().toDateString();
      const savedDate = await AsyncStorage.getItem(STORAGE_KEYS.DATE);
      const savedWeekly = await AsyncStorage.getItem(STORAGE_KEYS.WEEKLY_DATA);
      let currentWeekly = savedWeekly ? JSON.parse(savedWeekly) : [0, 0, 0, 0, 0, 0, 0];

      if (savedDate !== today) {
        await AsyncStorage.setItem(STORAGE_KEYS.DATE, today);
        await AsyncStorage.setItem(STORAGE_KEYS.WATER, '0');
        await AsyncStorage.setItem(STORAGE_KEYS.DRINK_COUNT, '0');
        await AsyncStorage.setItem(STORAGE_KEYS.COMPLETED_TASKS, JSON.stringify([]));
        setWaterAmount(0);
        setDrinkCount(0);
        setCompletedTasks([]);

        if (savedDate) {
          const totalDays = parseInt((await AsyncStorage.getItem(STORAGE_KEYS.TOTAL_DAYS)) || '0') + 1;
          await AsyncStorage.setItem(STORAGE_KEYS.TOTAL_DAYS, totalDays.toString());
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (savedDate === yesterday.toDateString()) {
          const prevWater = parseInt((await AsyncStorage.getItem(STORAGE_KEYS.PREV_DAY_WATER)) || '0');
          const goal = parseInt((await AsyncStorage.getItem(STORAGE_KEYS.DAILY_GOAL)) || '2500');

          const yIndex = (yesterday.getDay() + 6) % 7;
          currentWeekly[yIndex] = prevWater;
          await AsyncStorage.setItem(STORAGE_KEYS.WEEKLY_DATA, JSON.stringify(currentWeekly));
          setWeeklyData(currentWeekly);

          const prevBest = parseInt((await AsyncStorage.getItem(STORAGE_KEYS.BEST_DAY)) || '0');
          const newBest = Math.max(prevBest, prevWater);
          await AsyncStorage.setItem(STORAGE_KEYS.BEST_DAY, newBest.toString());

          if (prevWater >= goal) {
            const newStreak = (parseInt((await AsyncStorage.getItem(STORAGE_KEYS.STREAK)) || '0')) + 1;
            setStreak(newStreak);
            await AsyncStorage.setItem(STORAGE_KEYS.STREAK, newStreak.toString());
          } else {
            setStreak(0);
            await AsyncStorage.setItem(STORAGE_KEYS.STREAK, '0');
          }
        } else if (savedDate) {
          setStreak(0);
          await AsyncStorage.setItem(STORAGE_KEYS.STREAK, '0');
        }
      } else {
        const saved = await AsyncStorage.getItem(STORAGE_KEYS.WATER);
        if (saved) setWaterAmount(parseInt(saved));
        const tasks = await AsyncStorage.getItem(STORAGE_KEYS.COMPLETED_TASKS);
        if (tasks) setCompletedTasks(JSON.parse(tasks));
        const count = await AsyncStorage.getItem(STORAGE_KEYS.DRINK_COUNT);
        if (count) setDrinkCount(parseInt(count));
        if (savedWeekly) setWeeklyData(JSON.parse(savedWeekly));
      }

      const goal = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_GOAL);
      if (goal) setDailyGoal(parseInt(goal));
      const savedPoints = await AsyncStorage.getItem(STORAGE_KEYS.POINTS);
      if (savedPoints) setPoints(parseInt(savedPoints));
      const savedStreak = await AsyncStorage.getItem(STORAGE_KEYS.STREAK);
      if (savedStreak) setStreak(parseInt(savedStreak));
      const savedName = await AsyncStorage.getItem(STORAGE_KEYS.USER_NAME);
      if (savedName) setUserName(savedName);
      const savedBottle = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_BOTTLE);
      if (savedBottle) setSelectedBottleId(savedBottle);
    } catch {
      /* ignore */
    }
  };

  const completeTask = async (taskId: string) => {
    if (completedTasks.includes(taskId)) return;
    const task = DAILY_TASKS.find((t) => t.id === taskId);
    if (!task) return;

    const updatedTasks = [...completedTasks, taskId];
    const newPoints = points + task.reward;

    setCompletedTasks(updatedTasks);
    setPoints(newPoints);

    await AsyncStorage.setItem(STORAGE_KEYS.COMPLETED_TASKS, JSON.stringify(updatedTasks));
    await AsyncStorage.setItem(STORAGE_KEYS.POINTS, newPoints.toString());
  };

  const evaluateTasks = async (newAmount: number, newDrinkCount: number) => {
    const hour = new Date().getHours();
    if (hour < 9 && newAmount >= 250) await completeTask('morning_water');
    if (newAmount >= dailyGoal / 2) await completeTask('half_goal');
    if (newAmount >= dailyGoal) await completeTask('full_goal');
    if (newDrinkCount >= 3) await completeTask('three_times');
    if (hour >= 20 && newAmount >= 200) await completeTask('evening_water');
  };

  const animatePulse = useCallback(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1.08, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
  }, [scaleAnim]);

  const addWater = async (amount: number) => {
    const newAmount = Math.min(waterAmount + amount, 5000);
    const newDrinkCount = drinkCount + 1;
    const dayIndex = (new Date().getDay() + 6) % 7;
    const updatedWeekly = [...weeklyData];
    updatedWeekly[dayIndex] = newAmount;

    setWaterAmount(newAmount);
    setDrinkCount(newDrinkCount);
    setWeeklyData(updatedWeekly);

    await AsyncStorage.setItem(STORAGE_KEYS.WATER, newAmount.toString());
    await AsyncStorage.setItem(STORAGE_KEYS.PREV_DAY_WATER, newAmount.toString());
    await AsyncStorage.setItem(STORAGE_KEYS.DRINK_COUNT, newDrinkCount.toString());
    await AsyncStorage.setItem(STORAGE_KEYS.WEEKLY_DATA, JSON.stringify(updatedWeekly));

    const best = parseInt((await AsyncStorage.getItem(STORAGE_KEYS.BEST_DAY)) || '0');
    if (newAmount > best) {
      await AsyncStorage.setItem(STORAGE_KEYS.BEST_DAY, newAmount.toString());
    }

    await evaluateTasks(newAmount, newDrinkCount);
    animatePulse();

    if (newAmount >= dailyGoal && waterAmount < dailyGoal) {
      const newPoints = points + 100;
      setPoints(newPoints);
      await AsyncStorage.setItem(STORAGE_KEYS.POINTS, newPoints.toString());
      Alert.alert('Tebrikler!', 'Günlük hedefini tamamladın! +100 puan kazandın.');
    }
  };

  const progress = Math.min(waterAmount / dailyGoal, 1);
  const percentage = Math.round(progress * 100);
  const level = getLevel(points);
  const quote = getDailyQuote();
  const remaining = Math.max(dailyGoal - waterAmount, 0);
  const selectedBottle = BOTTLES.find((b) => b.id === selectedBottleId) || BOTTLES[0];
  const weekBars = weeklyData.map((v) => Math.min(Math.max(v / Math.max(dailyGoal, 1), 0.08), 1));
  const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cts'];
  const now = new Date();
  const activeDay = now.getDay();
  const weekDays = useMemo(
    () =>
      dayNames.map((name, index) => {
        const offset = index - activeDay;
        const date = new Date(now);
        date.setDate(now.getDate() + offset);
        return { name, day: date.getDate(), isActive: index === activeDay };
      }),
    [activeDay],
  );

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
        <View style={styles.profileRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{(userName || 'K').slice(0, 1).toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{userName || 'Kullanıcı'}</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <View style={styles.headerIconBtn}>
            <Ionicons name="notifications-outline" size={18} color="#94A3B8" />
          </View>
          <View style={styles.headerIconBtn}>
            <Ionicons name="calendar-outline" size={18} color="#94A3B8" />
          </View>
        </View>
      </View>

      {/* Daily Drink Target */}
      <View style={styles.targetCard}>
        <View style={styles.targetTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.targetTitle}>Günlük Su Hedefi</Text>
            <Text style={styles.targetSubtitle}>{dailyGoal} ml hedef ({Math.round(dailyGoal / 200)} bardak)</Text>
            <View style={styles.targetStatusPill}>
              <Text style={styles.targetStatusText}>{remaining > 0 ? `${remaining} ml kaldı` : 'Hedef tamamlandı 🎉'}</Text>
            </View>
          </View>

          <CircularProgress size={132} strokeWidth={12} progress={progress}>
            <Text style={styles.ringValue}>{waterAmount}ml</Text>
            <Text style={styles.ringSub}>/{dailyGoal}ml</Text>
          </CircularProgress>
        </View>

        {/* Bottle Hero – ortalanmış büyük görsel */}
        <Animated.View style={[styles.bottleHero, { transform: [{ scale: scaleAnim }] }]}>
          <WaterBottle
            progress={progress}
            width={130}
            bottleType={selectedBottle.id}
            tintColor={selectedBottle.color}
            showGauge={false}
          />
          <Text style={styles.bottleName}>{selectedBottle.name}</Text>
        </Animated.View>

        <TouchableOpacity style={styles.primaryDrinkBtn} onPress={() => addWater(selectedAmount)} activeOpacity={0.85}>
          <Ionicons name="water" size={17} color="#F8FAFC" />
          <Text style={styles.primaryDrinkText}>{selectedAmount} ml İç</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Add */}
      <View style={styles.addSection}>
        <Text style={styles.sectionLabel}>Hızlı Ekle</Text>
        <View style={styles.glassRow}>
          {GLASS_SIZES.map((glass) => {
            const isActive = glass.amount === selectedAmount;
            return (
              <TouchableOpacity
                key={glass.amount}
                style={[styles.glassButton, isActive && styles.glassButtonActive]}
                onPress={() => setSelectedAmount(glass.amount)}
                activeOpacity={0.8}
              >
                <Text style={[styles.glassAmount, isActive && styles.glassAmountActive]}>+{glass.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Takvim ve Haftalık Durum */}
      <View style={styles.weekCard}>
        <Text style={styles.weekTitle}>Bugün, {now.toLocaleDateString('tr-TR')}</Text>
        <View style={styles.weekDaysRow}>
          {weekDays.map((item) => (
            <View key={`${item.name}-${item.day}`} style={[styles.dayChip, item.isActive && styles.dayChipActive]}>
              <Text style={[styles.dayName, item.isActive && styles.dayNameActive]}>{item.name}</Text>
              <Text style={[styles.dayNum, item.isActive && styles.dayNumActive]}>{item.day}</Text>
            </View>
          ))}
        </View>

        <View style={styles.metricRow}>
          <View style={styles.metricCard}>
            <Ionicons name="flame-outline" size={16} color="#38BDF8" />
            <Text style={styles.metricValue}>{Math.round(waterAmount * 0.04)} kcal</Text>
            <Text style={styles.metricLabel}>Yakılan Kalori</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="pulse-outline" size={16} color="#38BDF8" />
            <Text style={styles.metricValue}>{68 + Math.min(streak, 20)} bpm</Text>
            <Text style={styles.metricLabel}>Nabız</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="time-outline" size={16} color="#38BDF8" />
            <Text style={styles.metricValue}>{String(Math.max(streak, 1)).padStart(2, '0')}:00</Text>
            <Text style={styles.metricLabel}>Egzersiz Süresi</Text>
          </View>
        </View>
      </View>

      {/* Hydration Stats */}
      <View style={styles.statsCard}>
        <View style={styles.statsHeaderRow}>
          <Text style={styles.statsTitle}>Hidratasyon İstatistikleri</Text>
          <Text style={styles.statsRange}>Bu Hafta</Text>
        </View>

        <View style={styles.barChartRow}>
          {weekBars.map((bar, idx) => (
            <View key={idx} style={styles.barItem}>
              <View style={[styles.barFill, { height: `${Math.round(bar * 100)}%` }]} />
            </View>
          ))}
        </View>

        <View style={styles.statsFooterRow}>
          <Text style={styles.statsPill}>Lv.{level.level} • {level.name}</Text>
          <Text style={styles.statsPill}>{points} puan</Text>
          <Text style={styles.statsPill}>{streak} seri</Text>
        </View>
      </View>

      {/* Günlük Görevler */}
      <View style={styles.tasksCard}>
        <Text style={styles.tasksTitle}>Günlük Görevler</Text>
        {DAILY_TASKS.slice(0, 4).map((task) => {
          const done = completedTasks.includes(task.id);
          return (
            <View key={task.id} style={[styles.taskRow, done && styles.taskRowDone]}>
              <View style={[styles.taskIcon, done && styles.taskIconDone]}>
                <Ionicons
                  name={done ? 'checkmark' : (task.icon as keyof typeof Ionicons.glyphMap)}
                  size={14}
                  color={done ? '#fff' : '#7DD3FC'}
                />
              </View>
              <View style={styles.taskInfo}>
                <Text style={styles.taskName}>{task.name}</Text>
                <Text style={styles.taskDesc}>{task.description}</Text>
              </View>
              <Text style={styles.taskReward}>+{task.reward}</Text>
            </View>
          );
        })}
      </View>

      {/* Quote */}
      <View style={styles.quoteCard}>
        <Ionicons name="water-outline" size={16} color="#38BDF8" />
        <Text style={styles.quoteText}>{quote}</Text>
      </View>

      {/* Reset */}
      <TouchableOpacity
        style={styles.resetButton}
        onPress={async () => {
          setWaterAmount(0);
          setDrinkCount(0);
          setCompletedTasks([]);
          await AsyncStorage.setItem(STORAGE_KEYS.WATER, '0');
          await AsyncStorage.setItem(STORAGE_KEYS.DRINK_COUNT, '0');
          await AsyncStorage.setItem(STORAGE_KEYS.COMPLETED_TASKS, JSON.stringify([]));
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
  container: { flex: 1, backgroundColor: '#15294A' },
  content: { padding: 20, paddingTop: 56, paddingBottom: 26 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#E2E8F0', fontSize: 18, fontWeight: '800' },
  greeting: { color: '#94A3B8', fontSize: 13, fontWeight: '500' },
  userName: { color: '#F8FAFC', fontSize: 29, fontWeight: '800', marginTop: 1, letterSpacing: -0.8 },
  headerActions: { flexDirection: 'row', gap: 10 },
  headerIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#0F1B36',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.18)',
  },

  weekCard: {
    borderRadius: 26,
    backgroundColor: '#0F1B36',
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.18)',
  },
  weekTitle: { color: '#E2E8F0', fontSize: 21, fontWeight: '800', marginBottom: 14 },
  weekDaysRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  dayChip: {
    width: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(148,163,184,0.2)',
    paddingVertical: 8,
    alignItems: 'center',
    gap: 3,
  },
  dayChipActive: { backgroundColor: '#0284C7' },
  dayName: { color: '#CBD5E1', fontSize: 12, fontWeight: '600' },
  dayNameActive: { color: '#FFFFFF' },
  dayNum: { color: '#38BDF8', fontSize: 16, fontWeight: '800' },
  dayNumActive: { color: '#FFFFFF' },

  metricRow: { flexDirection: 'row', gap: 10 },
  metricCard: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: 'rgba(15,23,42,0.65)',
    padding: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.2)',
  },
  metricValue: { color: '#F8FAFC', fontSize: 22, fontWeight: '800' },
  metricLabel: { color: '#94A3B8', fontSize: 12, fontWeight: '500' },

  targetCard: {
    borderRadius: 26,
    backgroundColor: '#0F1B36',
    padding: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.18)',
  },
  targetTop: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  targetTitle: { color: '#E2E8F0', fontSize: 19, fontWeight: '800' },
  targetSubtitle: { color: '#94A3B8', fontSize: 13, marginTop: 4 },
  targetStatusPill: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(56,189,248,0.16)',
  },
  targetStatusText: { color: '#BAE6FD', fontSize: 12, fontWeight: '700' },
  ringValue: { color: '#E2E8F0', fontSize: 20, fontWeight: '800' },
  ringSub: { color: '#94A3B8', fontSize: 12, fontWeight: '600' },
  bottleHero: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  bottleName: {
    color: '#7DD3FC',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  primaryDrinkBtn: {
    backgroundColor: '#0284C7',
    borderRadius: 18,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  primaryDrinkText: { color: '#F8FAFC', fontSize: 17, fontWeight: '700' },

  addSection: { marginBottom: 16 },
  sectionLabel: { color: '#94A3B8', fontSize: 13, fontWeight: '700', marginBottom: 10, textTransform: 'uppercase' },
  glassRow: { flexDirection: 'row', gap: 8 },
  glassButton: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: '#0F1B36',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  glassButtonActive: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  glassAmount: { color: '#38BDF8', fontSize: 15, fontWeight: '800' },
  glassAmountActive: { color: '#F8FAFC' },

  statsCard: {
    borderRadius: 26,
    backgroundColor: '#0F1B36',
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.18)',
  },
  statsHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statsTitle: { color: '#E2E8F0', fontSize: 19, fontWeight: '800' },
  statsRange: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
  barChartRow: {
    height: 130,
    marginTop: 16,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  barItem: {
    width: 30,
    height: '100%',
    borderRadius: 10,
    backgroundColor: 'rgba(148,163,184,0.2)',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    backgroundColor: '#38BDF8',
    borderRadius: 10,
  },
  statsFooterRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  statsPill: {
    backgroundColor: 'rgba(56,189,248,0.14)',
    color: '#BAE6FD',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },

  tasksCard: {
    borderRadius: 20,
    backgroundColor: '#0F1B36',
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.16)',
  },
  tasksTitle: { color: '#E2E8F0', fontSize: 15, fontWeight: '700', marginBottom: 10 },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  taskRowDone: { opacity: 0.6 },
  taskIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(56,189,248,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskIconDone: { backgroundColor: '#059669' },
  taskInfo: { flex: 1 },
  taskName: { color: '#E2E8F0', fontSize: 13, fontWeight: '600' },
  taskDesc: { color: '#94A3B8', fontSize: 11 },
  taskReward: { color: '#FCD34D', fontSize: 12, fontWeight: '700' },

  quoteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0F1B36',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.14)',
  },
  quoteText: { color: '#CBD5E1', fontSize: 13, fontStyle: 'italic', flex: 1 },

  resetButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 10,
  },
  resetText: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
});
