import { STORAGE_KEYS } from '@/constants/storageKeys';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import WaterBackground from '@/components/WaterBackground';
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from 'react-native';
import { BADGES, getLevel } from '../../constants/waterData';

export default function ProfileScreen() {
  const [userName, setUserName] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [waterAmount, setWaterAmount] = useState(0);
  const [activity, setActivity] = useState('');
  const [dailyGoal, setDailyGoal] = useState(2500);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalDays, setTotalDays] = useState(0);

  const [notificationsOn, setNotificationsOn] = useState(true);
  const [interval, setInterval] = useState(60);

  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [editWeight, setEditWeight] = useState('');
  const [editHeight, setEditHeight] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const n = await AsyncStorage.getItem(STORAGE_KEYS.USER_NAME);
      if (n) { setUserName(n); setEditName(n); }
      const w = await AsyncStorage.getItem(STORAGE_KEYS.WEIGHT);
      if (w) { setWeight(w); setEditWeight(w); }
      const h = await AsyncStorage.getItem(STORAGE_KEYS.HEIGHT);
      if (h) { setHeight(h); setEditHeight(h); }
      const a = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVITY);
      if (a) setActivity(a);
      const g = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_GOAL);
      if (g) setDailyGoal(parseInt(g));
      const p = await AsyncStorage.getItem(STORAGE_KEYS.POINTS);
      if (p) setPoints(parseInt(p));
      const s = await AsyncStorage.getItem(STORAGE_KEYS.STREAK);
      if (s) setStreak(parseInt(s));
      const td = await AsyncStorage.getItem(STORAGE_KEYS.TOTAL_DAYS);
      if (td) setTotalDays(parseInt(td));
      const waterRaw = await AsyncStorage.getItem(STORAGE_KEYS.WATER);
      if (waterRaw) setWaterAmount(parseInt(waterRaw));
    } catch {
      /* ignore */
    }
  };

  const saveProfile = async () => {
    try {
      if (editName) { await AsyncStorage.setItem(STORAGE_KEYS.USER_NAME, editName); setUserName(editName); }
      if (editWeight) { await AsyncStorage.setItem(STORAGE_KEYS.WEIGHT, editWeight); setWeight(editWeight); }
      if (editHeight) { await AsyncStorage.setItem(STORAGE_KEYS.HEIGHT, editHeight); setHeight(editHeight); }
      setEditMode(false);
    } catch {
      /* ignore */
    }
  };

  const resetData = () => {
    Alert.alert(
      'Verileri Sıfırla',
      'Tüm ilerleme ve veriler silinecek. Emin misin?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sıfırla',
          style: 'destructive',
          onPress: async () => {
            const keysToRemove = [
              STORAGE_KEYS.WATER,
              STORAGE_KEYS.WEEKLY_DATA,
              STORAGE_KEYS.STREAK,
              STORAGE_KEYS.TOTAL_DAYS,
              STORAGE_KEYS.BEST_DAY,
              STORAGE_KEYS.POINTS,
              STORAGE_KEYS.PREV_DAY_WATER,
              STORAGE_KEYS.COMPLETED_TASKS,
              STORAGE_KEYS.DRINK_COUNT,
            ];
            await AsyncStorage.multiRemove(keysToRemove);
            setPoints(0); setStreak(0); setTotalDays(0);
          },
        },
      ],
    );
  };

  const level = getLevel(points);
  const unlockedBadges = BADGES.filter((b) => {
    if (b.condition === 'streak3') return streak >= 3;
    if (b.condition === 'streak7') return streak >= 7;
    if (b.condition === 'streak30') return streak >= 30;
    if (b.condition === 'days7') return totalDays >= 7;
    if (b.condition === 'days30') return totalDays >= 30;
    if (b.condition === 'points500') return points >= 500;
    if (b.condition === 'points2000') return points >= 2000;
    return false;
  });

  const activityLabels: Record<string, string> = {
    sedentary: 'Hareketsiz', light: 'Hafif', moderate: 'Orta', active: 'Aktif',
  };

  const progress = Math.min(waterAmount / Math.max(dailyGoal, 1), 1);

  return (
    <View style={styles.container}>
      <WaterBackground progress={progress} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Profil</Text>

      {/* Avatar & Level */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarCircle}>
          <Ionicons name="person" size={32} color="#38BDF8" />
        </View>
        <Text style={styles.avatarName}>{userName || 'Kullanıcı'}</Text>
        <View style={styles.levelBadge}>
          <Ionicons name="star" size={12} color="#FBBF24" />
          <Text style={styles.levelText}>{level.name}</Text>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        {[
          { label: 'Puan', value: `${points}`, icon: 'diamond' as const, color: '#FBBF24' },
          { label: 'Seri', value: `${streak}`, icon: 'flame' as const, color: '#FB923C' },
          { label: 'Gün', value: `${totalDays}`, icon: 'calendar' as const, color: '#A78BFA' },
        ].map((s) => (
          <View key={s.label} style={styles.statItem}>
            <Ionicons name={s.icon} size={16} color={s.color} />
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Badges */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Rozetler</Text>
          <Text style={styles.sectionCount}>{unlockedBadges.length}/{BADGES.length}</Text>
        </View>
        <View style={styles.badgeGrid}>
          {BADGES.map((badge) => {
            const earned = unlockedBadges.some((b) => b.id === badge.id);
            return (
              <View key={badge.id} style={[styles.badgeItem, earned && styles.badgeEarned]}>
                <Ionicons
                  name={badge.icon as keyof typeof Ionicons.glyphMap}
                  size={20}
                  color={earned ? '#FBBF24' : '#334155'}
                />
                <Text style={[styles.badgeName, !earned && styles.badgeNameLocked]} numberOfLines={1}>
                  {badge.name}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Personal Info */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Kişisel Bilgiler</Text>
          <Pressable onPress={() => editMode ? saveProfile() : setEditMode(true)}>
            <Text style={styles.editBtn}>{editMode ? 'Kaydet' : 'Düzenle'}</Text>
          </Pressable>
        </View>
        <View style={styles.infoCard}>
          {editMode ? (
            <View style={styles.editGroup}>
              <View style={styles.editRow}>
                <Text style={styles.editLabel}>İsim</Text>
                <TextInput
                  style={styles.editInput} value={editName}
                  onChangeText={setEditName} placeholder="İsim" placeholderTextColor="#475569"
                />
              </View>
              <View style={styles.editRow}>
                <Text style={styles.editLabel}>Kilo (kg)</Text>
                <TextInput
                  style={styles.editInput} value={editWeight}
                  onChangeText={setEditWeight} keyboardType="numeric" placeholder="70" placeholderTextColor="#475569"
                />
              </View>
              <View style={styles.editRow}>
                <Text style={styles.editLabel}>Boy (cm)</Text>
                <TextInput
                  style={styles.editInput} value={editHeight}
                  onChangeText={setEditHeight} keyboardType="numeric" placeholder="170" placeholderTextColor="#475569"
                />
              </View>
            </View>
          ) : (
            <>
              <InfoRow icon="person-outline" label="İsim" value={userName || '—'} />
              <InfoRow icon="fitness-outline" label="Kilo" value={weight ? `${weight} kg` : '—'} />
              <InfoRow icon="resize-outline" label="Boy" value={height ? `${height} cm` : '—'} />
              <InfoRow icon="walk-outline" label="Aktivite" value={activityLabels[activity] || '—'} />
              <InfoRow icon="water-outline" label="Hedef" value={`${dailyGoal} ml`} last />
            </>
          )}
        </View>
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Bildirimler</Text>
        <View style={styles.infoCard}>
          <View style={styles.switchRow}>
            <View style={styles.switchLeft}>
              <Ionicons name="notifications-outline" size={18} color="#38BDF8" />
              <Text style={styles.switchLabel}>Hatırlatmalar</Text>
            </View>
            <Switch
              value={notificationsOn}
              onValueChange={setNotificationsOn}
              trackColor={{ false: '#1E293B', true: 'rgba(56,189,248,0.3)' }}
              thumbColor={notificationsOn ? '#38BDF8' : '#475569'}
            />
          </View>
          {notificationsOn && (
            <>
              <View style={styles.divider} />
              <Text style={styles.intervalLabel}>Hatırlatma Sıklığı</Text>
              <View style={styles.intervalRow}>
                {[30, 60, 90, 120].map((min) => (
                  <Pressable
                    key={min}
                    style={[styles.intervalBtn, interval === min && styles.intervalBtnActive]}
                    onPress={() => setInterval(min)}
                  >
                    <Text style={[styles.intervalText, interval === min && styles.intervalTextActive]}>
                      {min} dk
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}
        </View>
      </View>

      {/* Reset */}
      <Pressable style={styles.resetBtn} onPress={resetData}>
        <Ionicons name="trash-outline" size={16} color="#F87171" />
        <Text style={styles.resetText}>Verileri Sıfırla</Text>
      </Pressable>

      <Text style={styles.versionText}>HydrationMotivation v1.0</Text>
      <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

function InfoRow({ icon, label, value, last }: { icon: string; label: string; value: string; last?: boolean }) {
  return (
    <View style={[rowStyles.row, !last && rowStyles.rowBorder]}>
      <View style={rowStyles.left}>
        <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={16} color="#64748B" />
        <Text style={rowStyles.label}>{label}</Text>
      </View>
      <Text style={rowStyles.value}>{value}</Text>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 13 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  left: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: { color: '#94A3B8', fontSize: 14 },
  value: { color: '#F1F5F9', fontSize: 14, fontWeight: '600' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1E3A5F' },
  scrollView: { flex: 1 },
  content: { padding: 20, paddingTop: 60 },
  title: { color: '#F1F5F9', fontSize: 26, fontWeight: '700', marginBottom: 20, letterSpacing: -0.5 },

  // Avatar
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(56,189,248,0.1)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(56,189,248,0.2)', marginBottom: 12,
  },
  avatarName: { color: '#F1F5F9', fontSize: 20, fontWeight: '700', marginBottom: 6 },
  levelBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(251,191,36,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
  },
  levelText: { color: '#FBBF24', fontSize: 12, fontWeight: '600' },

  // Stats Row
  statsRow: {
    flexDirection: 'row', gap: 10, marginBottom: 24,
  },
  statItem: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14,
    padding: 14, alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  statValue: { color: '#F1F5F9', fontSize: 18, fontWeight: '700' },
  statLabel: { color: '#475569', fontSize: 11, fontWeight: '500' },

  // Section
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionLabel: { color: '#94A3B8', fontSize: 13, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  sectionCount: { color: '#475569', fontSize: 12 },
  editBtn: { color: '#38BDF8', fontSize: 13, fontWeight: '600' },

  // Badges
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badgeItem: {
    width: '30%' as unknown as number, flexGrow: 1, flexBasis: '28%',
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 12, alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)',
  },
  badgeEarned: {
    backgroundColor: 'rgba(251,191,36,0.06)', borderColor: 'rgba(251,191,36,0.12)',
  },
  badgeName: { color: '#F1F5F9', fontSize: 10, fontWeight: '600', textAlign: 'center' },
  badgeNameLocked: { color: '#334155' },

  // Info Card
  infoCard: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, paddingHorizontal: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },

  // Edit
  editGroup: { paddingVertical: 12, gap: 12 },
  editRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  editLabel: { color: '#94A3B8', fontSize: 14 },
  editInput: {
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10, color: '#F1F5F9', fontSize: 14,
    width: 180, textAlign: 'right',
  },

  // Switch
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  switchLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  switchLabel: { color: '#F1F5F9', fontSize: 14, fontWeight: '500' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.04)' },
  intervalLabel: { color: '#64748B', fontSize: 12, marginTop: 12, marginBottom: 8 },
  intervalRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  intervalBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.04)', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  intervalBtnActive: {
    backgroundColor: 'rgba(56,189,248,0.12)', borderColor: '#38BDF8',
  },
  intervalText: { color: '#64748B', fontSize: 13, fontWeight: '600' },
  intervalTextActive: { color: '#38BDF8' },

  // Reset
  resetBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: 14, backgroundColor: 'rgba(248,113,113,0.08)',
    borderWidth: 1, borderColor: 'rgba(248,113,113,0.15)', marginBottom: 16,
  },
  resetText: { color: '#F87171', fontSize: 14, fontWeight: '600' },

  versionText: { color: '#334155', fontSize: 12, textAlign: 'center', marginBottom: 8 },
});
