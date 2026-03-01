import { BOTTLES } from '@/constants/waterData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function CollectionScreen() {
  const [points, setPoints] = useState(0);
  const [unlockedBottles, setUnlockedBottles] = useState<number[]>([1]);
  const [selectedBottle, setSelectedBottle] = useState(1);
  const [scaleAnims] = useState(() => BOTTLES.map(() => new Animated.Value(1)));

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
      if (sb) setSelectedBottle(parseInt(sb));
    } catch {
      /* ignore */
    }
  };

  const handleUnlock = async (bottle: (typeof BOTTLES)[0], index: number) => {
    if (unlockedBottles.includes(bottle.id)) {
      // Select bottle
      setSelectedBottle(bottle.id);
      await AsyncStorage.setItem('selectedBottle', bottle.id.toString());

      Animated.sequence([
        Animated.timing(scaleAnims[index], { toValue: 1.15, duration: 120, useNativeDriver: true }),
        Animated.timing(scaleAnims[index], { toValue: 1, duration: 120, useNativeDriver: true }),
      ]).start();
      return;
    }

    if (points < bottle.cost) {
      Alert.alert(
        'Yetersiz Puan 😢',
        `${bottle.name} için ${bottle.cost} puan gerekiyor.\nSenin puanın: ${points}`,
        [{ text: 'Tamam', style: 'cancel' }]
      );
      return;
    }

    Alert.alert(
      `${bottle.emoji} ${bottle.name}`,
      `${bottle.cost} puan harcayarak açmak ister misin?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Aç!',
          onPress: async () => {
            const newPoints = points - bottle.cost;
            const newUnlocked = [...unlockedBottles, bottle.id];

            setPoints(newPoints);
            setUnlockedBottles(newUnlocked);
            setSelectedBottle(bottle.id);

            await AsyncStorage.setItem('points', newPoints.toString());
            await AsyncStorage.setItem('unlockedBottles', JSON.stringify(newUnlocked));
            await AsyncStorage.setItem('selectedBottle', bottle.id.toString());

            // Bounce animation
            Animated.sequence([
              Animated.timing(scaleAnims[index], { toValue: 1.3, duration: 200, useNativeDriver: true }),
              Animated.timing(scaleAnims[index], { toValue: 0.9, duration: 100, useNativeDriver: true }),
              Animated.timing(scaleAnims[index], { toValue: 1.05, duration: 100, useNativeDriver: true }),
              Animated.timing(scaleAnims[index], { toValue: 1, duration: 100, useNativeDriver: true }),
            ]).start();

            Alert.alert(
              `${bottle.emoji} ${bottle.unlockMessage ?? 'Tebrikler!'}`,
              `${bottle.name} artık senin!`,
              [{ text: '🎉 Harika!' }]
            );
          },
        },
      ]
    );
  };

  const unlockedCount = unlockedBottles.length;
  const totalCount = BOTTLES.length;
  const progress = unlockedCount / totalCount;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>🏆 Koleksiyon</Text>

      {/* ─── Points & Progress ───────────────────── */}
      <View style={styles.headerCard}>
        <View style={styles.pointsRow}>
          <View style={styles.pointsLeft}>
            <Text style={styles.pointsLabel}>Puanların</Text>
            <Text style={styles.pointsValue}>⭐ {points}</Text>
          </View>
          <View style={styles.pointsRight}>
            <Text style={styles.collectionCount}>
              {unlockedCount}/{totalCount}
            </Text>
            <Text style={styles.collectionLabel}>Şişe Açıldı</Text>
          </View>
        </View>
        {/* Progress bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressLabel}>
          {unlockedCount === totalCount
            ? '🎉 Tüm koleksiyon tamamlandı!'
            : `${totalCount - unlockedCount} şişe daha aç`}
        </Text>
      </View>

      {/* ─── Bottle Grid ─────────────────────────── */}
      <View style={styles.grid}>
        {BOTTLES.map((bottle, index) => {
          const isUnlocked = unlockedBottles.includes(bottle.id);
          const isSelected = selectedBottle === bottle.id;

          return (
            <Animated.View
              key={bottle.id}
              style={[{ transform: [{ scale: scaleAnims[index] }] }]}
            >
              <TouchableOpacity
                style={[
                  styles.bottleCard,
                  isUnlocked && styles.bottleUnlocked,
                  isSelected && styles.bottleSelected,
                ]}
                onPress={() => handleUnlock(bottle, index)}
                activeOpacity={0.7}
              >
                {/* Selected indicator */}
                {isSelected && (
                  <View style={styles.selectedBadge}>
                    <Text style={styles.selectedBadgeText}>✓</Text>
                  </View>
                )}

                {/* Lock overlay */}
                {!isUnlocked && (
                  <View style={styles.lockOverlay}>
                    <Text style={styles.lockIcon}>🔒</Text>
                  </View>
                )}

                <Text style={[styles.bottleEmoji, !isUnlocked && styles.bottleEmojiLocked]}>
                  {bottle.emoji}
                </Text>
                <Text style={[styles.bottleName, !isUnlocked && styles.bottleNameLocked]}>
                  {bottle.name}
                </Text>
                <Text style={styles.bottleDesc} numberOfLines={1}>
                  {bottle.description}
                </Text>

                {/* Cost */}
                {!isUnlocked && (
                  <View style={[styles.costBadge, points >= bottle.cost && styles.costBadgeAffordable]}>
                    <Text style={[styles.costText, points >= bottle.cost && styles.costTextAffordable]}>
                      ⭐ {bottle.cost}
                    </Text>
                  </View>
                )}

                {isUnlocked && !isSelected && (
                  <View style={styles.ownedBadge}>
                    <Text style={styles.ownedText}>Seç</Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

      {/* ─── Tips ─────────────────────────────────── */}
      <View style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>💡 Puan Nasıl Kazanılır?</Text>
        <View style={styles.tipRow}>
          <Text style={styles.tipEmoji}>🎯</Text>
          <Text style={styles.tipText}>Günlük hedefi tamamla → +100 puan</Text>
        </View>
        <View style={styles.tipRow}>
          <Text style={styles.tipEmoji}>📋</Text>
          <Text style={styles.tipText}>Günlük görevleri yap → +10-50 puan</Text>
        </View>
        <View style={styles.tipRow}>
          <Text style={styles.tipEmoji}>🔥</Text>
          <Text style={styles.tipText}>Seri devam ettir → Bonus puan</Text>
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

  // Header Card
  headerCard: {
    backgroundColor: '#0A1929', borderRadius: 20, padding: 20, marginBottom: 24,
    borderWidth: 1, borderColor: '#0D2137',
  },
  pointsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  pointsLeft: {},
  pointsLabel: { color: '#5A7A9A', fontSize: 13 },
  pointsValue: { color: '#FFD700', fontSize: 28, fontWeight: 'bold', marginTop: 2 },
  pointsRight: { alignItems: 'flex-end' },
  collectionCount: { color: '#00B4D8', fontSize: 24, fontWeight: 'bold' },
  collectionLabel: { color: '#5A7A9A', fontSize: 13 },
  progressBar: {
    height: 8, backgroundColor: '#0D2137', borderRadius: 4, overflow: 'hidden', marginBottom: 8,
  },
  progressFill: { height: '100%', backgroundColor: '#00B4D8', borderRadius: 4 },
  progressLabel: { color: '#5A7A9A', fontSize: 12, textAlign: 'center' },

  // Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },

  // Bottle Card
  bottleCard: {
    width: 165, backgroundColor: '#0A1929', borderRadius: 20, padding: 18,
    alignItems: 'center', gap: 8,
    borderWidth: 1.5, borderColor: '#0D2137',
  },
  bottleUnlocked: { borderColor: '#023E8A' },
  bottleSelected: {
    borderColor: '#00B4D8', backgroundColor: '#0D2137',
    shadowColor: '#00B4D8', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 12,
  },
  selectedBadge: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: '#00B4D8', width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  selectedBadgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  lockOverlay: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 12, padding: 4,
  },
  lockIcon: { fontSize: 14 },
  bottleEmoji: { fontSize: 44 },
  bottleEmojiLocked: { opacity: 0.4 },
  bottleName: { color: '#fff', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  bottleNameLocked: { color: '#5A7A9A' },
  bottleDesc: { color: '#5A7A9A', fontSize: 11, textAlign: 'center' },
  costBadge: {
    backgroundColor: '#1A0A00', paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 10, marginTop: 4,
  },
  costBadgeAffordable: { backgroundColor: '#002A00' },
  costText: { color: '#CC5500', fontSize: 12, fontWeight: 'bold' },
  costTextAffordable: { color: '#10B981' },
  ownedBadge: {
    backgroundColor: '#023E8A', paddingHorizontal: 14, paddingVertical: 5,
    borderRadius: 10, marginTop: 4,
  },
  ownedText: { color: '#00B4D8', fontSize: 12, fontWeight: '600' },

  // Tips
  tipsCard: {
    backgroundColor: '#0A1929', borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: '#0D2137',
  },
  tipsTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 14 },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  tipEmoji: { fontSize: 20 },
  tipText: { color: '#90CAF9', fontSize: 13, flex: 1 },
});
