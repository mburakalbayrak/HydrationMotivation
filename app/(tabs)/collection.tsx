import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BOTTLES } from '../../constants/waterData';

export default function CollectionScreen() {
  const [points, setPoints] = useState(0);
  const [unlockedBottles, setUnlockedBottles] = useState<string[]>(['classic']);
  const [selectedBottle, setSelectedBottle] = useState('classic');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const p = await AsyncStorage.getItem('points');
      if (p) setPoints(parseInt(p));
      const ub = await AsyncStorage.getItem('unlockedBottles');
      if (ub) setUnlockedBottles(JSON.parse(ub));
      const sb = await AsyncStorage.getItem('selectedBottle');
      if (sb) setSelectedBottle(sb);
    } catch {
      /* ignore */
    }
  };

  const unlockBottle = async (bottleId: string, cost: number) => {
    if (points < cost) {
      Alert.alert('Yetersiz Puan', `Bu şişeyi açmak için ${cost - points} puan daha kazanmalısın.`);
      return;
    }
    Alert.alert('Şişeyi Aç', `${cost} puan harcamak istiyor musun?`, [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Aç',
        onPress: async () => {
          const newPoints = points - cost;
          const newUnlocked = [...unlockedBottles, bottleId];
          setPoints(newPoints);
          setUnlockedBottles(newUnlocked);
          await AsyncStorage.setItem('points', newPoints.toString());
          await AsyncStorage.setItem('unlockedBottles', JSON.stringify(newUnlocked));
        },
      },
    ]);
  };

  const selectBottle = async (bottleId: string) => {
    setSelectedBottle(bottleId);
    await AsyncStorage.setItem('selectedBottle', bottleId);
  };

  const isUnlocked = (id: string) => unlockedBottles.includes(id);
  const isSelected = (id: string) => selectedBottle === id;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Koleksiyon</Text>

      {/* Points */}
      <View style={styles.pointsBar}>
        <View style={styles.pointsLeft}>
          <Ionicons name="diamond" size={18} color="#FBBF24" />
          <Text style={styles.pointsValue}>{points}</Text>
          <Text style={styles.pointsUnit}>puan</Text>
        </View>
        <Text style={styles.pointsHint}>
          {unlockedBottles.length}/{BOTTLES.length} açıldı
        </Text>
      </View>

      {/* Grid */}
      <View style={styles.grid}>
        {BOTTLES.map((bottle) => {
          const unlocked = isUnlocked(bottle.id);
          const selected = isSelected(bottle.id);
          return (
            <Pressable
              key={bottle.id}
              style={[
                styles.bottleCard,
                unlocked && styles.bottleUnlocked,
                selected && styles.bottleSelected,
              ]}
              onPress={() => {
                if (unlocked) selectBottle(bottle.id);
                else unlockBottle(bottle.id, bottle.cost);
              }}
            >
              {/* Lock / Check */}
              {selected && (
                <View style={styles.badgeCheck}>
                  <Ionicons name="checkmark" size={10} color="#0F172A" />
                </View>
              )}
              {!unlocked && (
                <View style={styles.badgeLock}>
                  <Ionicons name="lock-closed" size={10} color="#64748B" />
                </View>
              )}

              {/* Icon */}
              <View style={[styles.bottleIconWrap, { backgroundColor: unlocked ? `${bottle.color}18` : 'rgba(255,255,255,0.04)' }]}>
                <Ionicons
                  name={bottle.icon as keyof typeof Ionicons.glyphMap}
                  size={28}
                  color={unlocked ? bottle.color : '#334155'}
                />
              </View>

              {/* Label */}
              <Text style={[styles.bottleName, !unlocked && styles.bottleNameLocked]} numberOfLines={1}>
                {bottle.name}
              </Text>

              {/* Cost or Selected */}
              {selected ? (
                <Text style={styles.bottleStatus}>Seçili</Text>
              ) : unlocked ? (
                <Text style={styles.bottleStatusUnlocked}>Kullanılabilir</Text>
              ) : (
                <View style={styles.costRow}>
                  <Ionicons name="diamond" size={10} color="#FBBF24" />
                  <Text style={styles.costText}>{bottle.cost}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Tips */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Puan Nasıl Kazanılır?</Text>
        {[
          { icon: 'water-outline' as const, text: 'Su iç → her bardak 10 puan', color: '#38BDF8' },
          { icon: 'flag-outline' as const, text: 'Günlük hedefi tamamla → 50 puan', color: '#34D399' },
          { icon: 'flame-outline' as const, text: 'Seri sürdür → günde 20 bonus', color: '#FB923C' },
          { icon: 'checkbox-outline' as const, text: 'Görevleri bitir → görev başına 30', color: '#A78BFA' },
        ].map((tip) => (
          <View key={tip.text} style={styles.tipRow}>
            <Ionicons name={tip.icon} size={16} color={tip.color} />
            <Text style={styles.tipText}>{tip.text}</Text>
          </View>
        ))}
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  content: { padding: 20, paddingTop: 60 },
  title: { color: '#F1F5F9', fontSize: 26, fontWeight: '700', marginBottom: 20, letterSpacing: -0.5 },

  // Points Bar
  pointsBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(251,191,36,0.08)', borderRadius: 14, padding: 14,
    marginBottom: 24, borderWidth: 1, borderColor: 'rgba(251,191,36,0.12)',
  },
  pointsLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pointsValue: { color: '#F1F5F9', fontSize: 20, fontWeight: '700' },
  pointsUnit: { color: '#64748B', fontSize: 13 },
  pointsHint: { color: '#94A3B8', fontSize: 13, fontWeight: '500' },

  // Grid
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28,
  },
  bottleCard: {
    width: '47%' as unknown as number, // roughly half minus gap
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16, padding: 16, alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    position: 'relative', flexGrow: 1, flexBasis: '45%',
  },
  bottleUnlocked: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  bottleSelected: {
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(56,189,248,0.06)',
  },
  badgeCheck: {
    position: 'absolute', top: 10, right: 10,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#38BDF8', alignItems: 'center', justifyContent: 'center',
  },
  badgeLock: {
    position: 'absolute', top: 10, right: 10,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center',
  },
  bottleIconWrap: {
    width: 56, height: 56, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  bottleName: { color: '#F1F5F9', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  bottleNameLocked: { color: '#475569' },
  bottleStatus: { color: '#38BDF8', fontSize: 11, fontWeight: '600' },
  bottleStatusUnlocked: { color: '#34D399', fontSize: 11, fontWeight: '600' },
  costRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  costText: { color: '#FBBF24', fontSize: 12, fontWeight: '600' },

  // Tips
  section: { marginBottom: 24 },
  sectionLabel: { color: '#94A3B8', fontSize: 13, fontWeight: '600', marginBottom: 12, letterSpacing: 0.5, textTransform: 'uppercase' },
  tipRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10, paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 10, marginBottom: 6,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)',
  },
  tipText: { color: '#94A3B8', fontSize: 13 },
});
