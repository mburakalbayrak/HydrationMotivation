import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function ProfileScreen() {
  const [weight, setWeight] = useState('');
  const [name, setName] = useState('');
  const [savedWeight, setSavedWeight] = useState(0);
  const [savedName, setSavedName] = useState('');
  const [points, setPoints] = useState(0);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const w = await AsyncStorage.getItem('weight');
      const n = await AsyncStorage.getItem('name');
      const p = await AsyncStorage.getItem('points');
      if (w) { setSavedWeight(parseInt(w)); setWeight(w); }
      if (n) { setSavedName(n); setName(n); }
      if (p) setPoints(parseInt(p));
    } catch {}
  };

  const saveProfile = async () => {
    if (!weight || parseInt(weight) < 30 || parseInt(weight) > 300) {
      Alert.alert('Hata', 'Lütfen geçerli bir kilo gir (30-300 kg)');
      return;
    }
    await AsyncStorage.setItem('weight', weight);
    await AsyncStorage.setItem('name', name);
    setSavedWeight(parseInt(weight));
    setSavedName(name);
    setEditing(false);
    Alert.alert('✅ Kaydedildi', 'Profilin güncellendi!');
  };

  const dailyGoal = savedWeight ? savedWeight * 33 : 2500;

  const getBadge = () => {
    if (points >= 2000) return { emoji: '👑', title: 'Efsane' };
    if (points >= 1000) return { emoji: '💎', title: 'Kristal' };
    if (points >= 500) return { emoji: '🥇', title: 'Altın' };
    if (points >= 200) return { emoji: '🥈', title: 'Gümüş' };
    if (points >= 100) return { emoji: '🥉', title: 'Bronz' };
    return { emoji: '🌱', title: 'Başlangıç' };
  };

  const badge = getBadge();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>👤 Profil</Text>

      <View style={styles.badgeCard}>
        <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
        <Text style={styles.badgeTitle}>{badge.title} Seviyesi</Text>
        <Text style={styles.badgePoints}>⭐ {points} puan</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Kişisel Bilgiler</Text>

        {editing ? (
          <>
            <Text style={styles.label}>Adın</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Adını gir"
              placeholderTextColor="#90E0EF"
            />
            <Text style={styles.label}>Kilonuz (kg)</Text>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              placeholder="Örn: 70"
              placeholderTextColor="#90E0EF"
            />
            <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ad</Text>
              <Text style={styles.infoValue}>{savedName || 'Belirtilmedi'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Kilo</Text>
              <Text style={styles.infoValue}>{savedWeight ? `${savedWeight} kg` : 'Belirtilmedi'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Günlük Hedef</Text>
              <Text style={styles.infoValue}>{dailyGoal} ml</Text>
            </View>
            <TouchableOpacity style={styles.editButton} onPress={() => setEditing(true)}>
              <Text style={styles.editButtonText}>Düzenle</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Rozet Sistemi</Text>
        {[
          { emoji: '🌱', title: 'Başlangıç', points: 0 },
          { emoji: '🥉', title: 'Bronz', points: 100 },
          { emoji: '🥈', title: 'Gümüş', points: 200 },
          { emoji: '🥇', title: 'Altın', points: 500 },
          { emoji: '💎', title: 'Kristal', points: 1000 },
          { emoji: '👑', title: 'Efsane', points: 2000 },
        ].map((b) => (
          <View key={b.title} style={[styles.badgeRow, points >= b.points && styles.activeBadgeRow]}>
            <Text style={styles.badgeRowEmoji}>{b.emoji}</Text>
            <Text style={styles.badgeRowTitle}>{b.title}</Text>
            <Text style={styles.badgeRowPoints}>{b.points} puan</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#03045E' },
  content: { padding: 20, alignItems: 'center' },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  badgeCard: {
    backgroundColor: '#0077B6', borderRadius: 20, padding: 24,
    alignItems: 'center', width: '100%', marginBottom: 20,
  },
  badgeEmoji: { fontSize: 60 },
  badgeTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginTop: 8 },
  badgePoints: { color: '#FFD700', fontSize: 16, marginTop: 4 },
  card: {
    backgroundColor: '#023E8A', borderRadius: 16, padding: 20,
    width: '100%', marginBottom: 16,
  },
  cardTitle: { color: '#00B4D8', fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  label: { color: '#90E0EF', fontSize: 14, marginBottom: 6 },
  input: {
    backgroundColor: '#03045E', color: '#fff', borderRadius: 10,
    padding: 12, marginBottom: 14, borderWidth: 1, borderColor: '#0077B6',
  },
  saveButton: { backgroundColor: '#00B4D8', padding: 14, borderRadius: 12, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  editButton: { backgroundColor: '#0077B6', padding: 12, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  editButtonText: { color: '#fff', fontWeight: 'bold' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#0077B6' },
  infoLabel: { color: '#90E0EF', fontSize: 14 },
  infoValue: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, opacity: 0.4 },
  activeBadgeRow: { opacity: 1 },
  badgeRowEmoji: { fontSize: 24, width: 40 },
  badgeRowTitle: { color: '#fff', fontSize: 14, flex: 1 },
  badgeRowPoints: { color: '#FFD700', fontSize: 12 },
});