import { BADGES, LEVELS, getLevel } from '@/constants/waterData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ProfileScreen() {
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('70');
  const [height, setHeight] = useState('170');
  const [gender, setGender] = useState('male');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [dailyGoal, setDailyGoal] = useState(2500);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // Notification Settings (UI Only)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [reminderInterval, setReminderInterval] = useState(60); // minutes
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(true);
  const [quietStart] = useState('23:00');
  const [quietEnd] = useState('07:00');
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const n = await AsyncStorage.getItem('userName');
      if (n) setName(n);

      const w = await AsyncStorage.getItem('weight');
      if (w) setWeight(w);

      const h = await AsyncStorage.getItem('height');
      if (h) setHeight(h);

      const g = await AsyncStorage.getItem('gender');
      if (g) setGender(g);

      const a = await AsyncStorage.getItem('activityLevel');
      if (a) setActivityLevel(a);

      const dg = await AsyncStorage.getItem('dailyGoal');
      if (dg) setDailyGoal(parseInt(dg));

      const p = await AsyncStorage.getItem('points');
      if (p) setPoints(parseInt(p));

      const s = await AsyncStorage.getItem('streak');
      if (s) setStreak(parseInt(s));

      const eb = await AsyncStorage.getItem('earnedBadges');
      if (eb) setEarnedBadges(JSON.parse(eb));
    } catch {
      /* ignore */
    }
  };

  const handleSaveProfile = async () => {
    try {
      await AsyncStorage.setItem('userName', name);
      await AsyncStorage.setItem('weight', weight);
      await AsyncStorage.setItem('height', height);
      await AsyncStorage.setItem('gender', gender);
      await AsyncStorage.setItem('activityLevel', activityLevel);
      setIsEditing(false);
      Alert.alert('✅ Kaydedildi', 'Profil bilgilerin güncellendi!');
    } catch {
      /* ignore */
    }
  };

  const handleResetOnboarding = () => {
    Alert.alert(
      '⚠️ Emin misin?',
      'Tüm veriler silinecek ve baştan başlayacaksın.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sıfırla',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            Alert.alert('🔄 Sıfırlandı', 'Uygulama yeniden başlatılacak.');
          },
        },
      ]
    );
  };

  const level = getLevel(points);
  const nextLevel = LEVELS.find((l) => l.level === level.level + 1);
  const levelProgress = nextLevel
    ? (points - level.minPoints) / (nextLevel.minPoints - level.minPoints)
    : 1;

  const intervals = [
    { value: 30, label: '30dk' },
    { value: 60, label: '1sa' },
    { value: 90, label: '1.5sa' },
    { value: 120, label: '2sa' },
  ];

  const activityLabels: Record<string, string> = {
    sedentary: 'Hareketsiz',
    light: 'Hafif',
    moderate: 'Orta',
    active: 'Aktif',
    very_active: 'Çok Aktif',
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>👤 Profil</Text>

      {/* ─── Profile Card ────────────────────────── */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>{gender === 'female' ? '👩' : '👨'}</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>{level.emoji}</Text>
          </View>
        </View>

        <Text style={styles.userName}>{name || 'Su İçici'}</Text>
        <Text style={styles.userLevel}>{level.emoji} {level.name} • Seviye {level.level}</Text>

        {/* Level Progress */}
        <View style={styles.levelProgressContainer}>
          <View style={styles.levelProgressBar}>
            <View style={[styles.levelProgressFill, { width: `${Math.min(levelProgress * 100, 100)}%` }]} />
          </View>
          <Text style={styles.levelProgressText}>
            {nextLevel
              ? `${points} / ${nextLevel.minPoints} puan`
              : 'Maksimum seviye! 👑'}
          </Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.profileStat}>
            <Text style={styles.profileStatValue}>⭐ {points}</Text>
            <Text style={styles.profileStatLabel}>Puan</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.profileStat}>
            <Text style={styles.profileStatValue}>🔥 {streak}</Text>
            <Text style={styles.profileStatLabel}>Seri</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.profileStat}>
            <Text style={styles.profileStatValue}>💧 {dailyGoal}ml</Text>
            <Text style={styles.profileStatLabel}>Hedef</Text>
          </View>
        </View>
      </View>

      {/* ─── Badges Section ──────────────────────── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🏅 Rozetler</Text>
          <Text style={styles.sectionCount}>
            {earnedBadges.length}/{BADGES.length}
          </Text>
        </View>

        <View style={styles.badgeGrid}>
          {BADGES.map((badge) => {
            const isEarned = earnedBadges.includes(badge.id);
            return (
              <View
                key={badge.id}
                style={[styles.badgeItem, isEarned && styles.badgeItemEarned]}
              >
                <Text style={[styles.badgeEmoji, !isEarned && styles.badgeEmojiLocked]}>
                  {isEarned ? badge.emoji : '🔒'}
                </Text>
                <Text style={[styles.badgeName, !isEarned && styles.badgeNameLocked]} numberOfLines={1}>
                  {badge.name}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* ─── Personal Info ───────────────────────── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📝 Kişisel Bilgiler</Text>
          <TouchableOpacity onPress={() => (isEditing ? handleSaveProfile() : setIsEditing(true))}>
            <Text style={styles.editButton}>{isEditing ? '✅ Kaydet' : '✏️ Düzenle'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>👤 İsim</Text>
            {isEditing ? (
              <TextInput
                style={styles.infoInput}
                value={name}
                onChangeText={setName}
                placeholder="İsmin"
                placeholderTextColor="#3A5A7A"
              />
            ) : (
              <Text style={styles.infoValue}>{name || '-'}</Text>
            )}
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>⚖️ Kilo</Text>
            {isEditing ? (
              <TextInput
                style={styles.infoInput}
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                placeholder="70"
                placeholderTextColor="#3A5A7A"
              />
            ) : (
              <Text style={styles.infoValue}>{weight} kg</Text>
            )}
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📏 Boy</Text>
            {isEditing ? (
              <TextInput
                style={styles.infoInput}
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
                placeholder="170"
                placeholderTextColor="#3A5A7A"
              />
            ) : (
              <Text style={styles.infoValue}>{height} cm</Text>
            )}
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{gender === 'female' ? '♀️' : '♂️'} Cinsiyet</Text>
            <Text style={styles.infoValue}>{gender === 'female' ? 'Kadın' : 'Erkek'}</Text>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>🏃 Aktivite</Text>
            <Text style={styles.infoValue}>{activityLabels[activityLevel] || activityLevel}</Text>
          </View>
        </View>
      </View>

      {/* ─── Notification Settings ───────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔔 Bildirim Ayarları</Text>

        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Hatırlatmalar</Text>
              <Text style={styles.settingDesc}>Su içme hatırlatmaları</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#0D2137', true: '#023E8A' }}
              thumbColor={notificationsEnabled ? '#00B4D8' : '#5A7A9A'}
            />
          </View>

          {notificationsEnabled && (
            <>
              <View style={styles.settingDivider} />

              {/* Interval selector */}
              <View style={styles.settingSection}>
                <Text style={styles.settingLabel}>⏰ Hatırlatma Aralığı</Text>
                <View style={styles.intervalRow}>
                  {intervals.map((item) => (
                    <TouchableOpacity
                      key={item.value}
                      style={[
                        styles.intervalButton,
                        reminderInterval === item.value && styles.intervalButtonActive,
                      ]}
                      onPress={() => setReminderInterval(item.value)}
                    >
                      <Text
                        style={[
                          styles.intervalText,
                          reminderInterval === item.value && styles.intervalTextActive,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.settingDivider} />

              {/* Quiet Hours */}
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>🌙 Sessiz Saatler</Text>
                  <Text style={styles.settingDesc}>{quietStart} - {quietEnd}</Text>
                </View>
                <Switch
                  value={quietHoursEnabled}
                  onValueChange={setQuietHoursEnabled}
                  trackColor={{ false: '#0D2137', true: '#023E8A' }}
                  thumbColor={quietHoursEnabled ? '#00B4D8' : '#5A7A9A'}
                />
              </View>

              <View style={styles.settingDivider} />

              {/* Sound */}
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>🔊 Ses</Text>
                  <Text style={styles.settingDesc}>Bildirim sesi</Text>
                </View>
                <Switch
                  value={soundEnabled}
                  onValueChange={setSoundEnabled}
                  trackColor={{ false: '#0D2137', true: '#023E8A' }}
                  thumbColor={soundEnabled ? '#00B4D8' : '#5A7A9A'}
                />
              </View>
            </>
          )}
        </View>
      </View>

      {/* ─── App Settings ────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚙️ Uygulama</Text>
        <View style={styles.settingsCard}>
          <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('📤 Yakında', 'Veri dışa aktarma özelliği yakında eklenecek.')}>
            <Text style={styles.menuEmoji}>📤</Text>
            <Text style={styles.menuText}>Verileri Dışa Aktar</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.settingDivider} />

          <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('☁️ Yakında', 'Bulut senkronizasyon özelliği yakında eklenecek.')}>
            <Text style={styles.menuEmoji}>☁️</Text>
            <Text style={styles.menuText}>Bulut Senkronizasyon</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.settingDivider} />

          <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('ℹ️ HydrationMotivation', 'Versiyon 1.0.0\n\nSu içme hatırlatıcı ve motivasyon uygulaması.\n\n💧 Sağlıklı kal!')}>
            <Text style={styles.menuEmoji}>ℹ️</Text>
            <Text style={styles.menuText}>Hakkında</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.settingDivider} />

          <TouchableOpacity style={[styles.menuItem]} onPress={handleResetOnboarding}>
            <Text style={styles.menuEmoji}>🗑️</Text>
            <Text style={[styles.menuText, { color: '#EF4444' }]}>Verileri Sıfırla</Text>
            <Text style={[styles.menuArrow, { color: '#EF4444' }]}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.version}>HydrationMotivation v1.0.0 💧</Text>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#03045E' },
  content: { padding: 20, paddingTop: 60 },
  title: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 20 },

  // Profile Card
  profileCard: {
    backgroundColor: '#0A1929', borderRadius: 24, padding: 24, alignItems: 'center',
    marginBottom: 24, borderWidth: 1, borderColor: '#0D2137',
  },
  avatarContainer: { position: 'relative', marginBottom: 12 },
  avatar: { fontSize: 64 },
  levelBadge: {
    position: 'absolute', bottom: -4, right: -4,
    backgroundColor: '#0D2137', borderRadius: 14, width: 28, height: 28,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#0A1929',
  },
  levelBadgeText: { fontSize: 14 },
  userName: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  userLevel: { color: '#5A7A9A', fontSize: 14, marginTop: 4, marginBottom: 16 },

  levelProgressContainer: { width: '100%', marginBottom: 20 },
  levelProgressBar: { height: 6, backgroundColor: '#0D2137', borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  levelProgressFill: { height: '100%', backgroundColor: '#00B4D8', borderRadius: 3 },
  levelProgressText: { color: '#5A7A9A', fontSize: 11, textAlign: 'center' },

  statsRow: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  profileStat: { flex: 1, alignItems: 'center' },
  profileStatValue: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  profileStatLabel: { color: '#5A7A9A', fontSize: 12, marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: '#0D2137' },

  // Section
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 14 },
  sectionCount: { color: '#5A7A9A', fontSize: 14 },
  editButton: { color: '#00B4D8', fontSize: 14 },

  // Badges
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badgeItem: {
    width: '18%', aspectRatio: 1, backgroundColor: '#0A1929', borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', padding: 4,
    borderWidth: 1, borderColor: '#0D2137',
  },
  badgeItemEarned: { borderColor: '#FFD700', backgroundColor: '#1A1A00' },
  badgeEmoji: { fontSize: 24, marginBottom: 2 },
  badgeEmojiLocked: { opacity: 0.4 },
  badgeName: { color: '#fff', fontSize: 8, textAlign: 'center' },
  badgeNameLocked: { color: '#3A5A7A' },

  // Info Card
  infoCard: {
    backgroundColor: '#0A1929', borderRadius: 20, padding: 4,
    borderWidth: 1, borderColor: '#0D2137',
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16,
  },
  infoLabel: { color: '#5A7A9A', fontSize: 14 },
  infoValue: { color: '#fff', fontSize: 14, fontWeight: '600' },
  infoInput: {
    color: '#fff', fontSize: 14, fontWeight: '600', textAlign: 'right',
    borderBottomWidth: 1, borderBottomColor: '#00B4D8', paddingVertical: 2, minWidth: 80,
  },
  infoDivider: { height: 1, backgroundColor: '#0D2137', marginHorizontal: 16 },

  // Settings
  settingsCard: {
    backgroundColor: '#0A1929', borderRadius: 20, padding: 4,
    borderWidth: 1, borderColor: '#0D2137',
  },
  settingRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16,
  },
  settingSection: { padding: 16 },
  settingInfo: { flex: 1 },
  settingLabel: { color: '#fff', fontSize: 14, fontWeight: '500' },
  settingDesc: { color: '#5A7A9A', fontSize: 12, marginTop: 2 },
  settingDivider: { height: 1, backgroundColor: '#0D2137', marginHorizontal: 16 },

  // Interval Buttons
  intervalRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  intervalButton: {
    flex: 1, paddingVertical: 10, borderRadius: 12,
    backgroundColor: '#0D2137', alignItems: 'center',
  },
  intervalButtonActive: { backgroundColor: '#023E8A', borderWidth: 1, borderColor: '#00B4D8' },
  intervalText: { color: '#5A7A9A', fontSize: 13, fontWeight: '600' },
  intervalTextActive: { color: '#00B4D8' },

  // Menu Items
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  menuEmoji: { fontSize: 20 },
  menuText: { color: '#fff', fontSize: 14, flex: 1 },
  menuArrow: { color: '#5A7A9A', fontSize: 20, fontWeight: '300' },

  version: { color: '#3A5A7A', fontSize: 12, textAlign: 'center', marginTop: 10 },
});
