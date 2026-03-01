import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const BOTTLES = [
  { id: 1, name: 'Plastik Şişe', emoji: '🧴', cost: 0, description: 'Başlangıç şişen' },
  { id: 2, name: 'Cam Şişe', emoji: '🫙', cost: 100, description: 'Şık ve çevreci' },
  { id: 3, name: 'Termos', emoji: '🧊', cost: 250, description: 'Soğuk tutar 24 saat' },
  { id: 4, name: 'Bambu Şişe', emoji: '🎋', cost: 400, description: 'Doğa dostu' },
  { id: 5, name: 'Uzay Şişesi', emoji: '🚀', cost: 600, description: 'Galaktik hidrasyon' },
  { id: 6, name: 'Kristal Şişe', emoji: '💎', cost: 900, description: 'Efsanevi koleksiyon' },
  { id: 7, name: 'Altın Şişe', emoji: '👑', cost: 1500, description: 'Sadece şampiyonlar için' },
  { id: 8, name: 'Gökkuşağı', emoji: '🌈', cost: 2000, description: 'Ultra nadir' },
];

export default function CollectionScreen() {
  const [points, setPoints] = useState(0);
  const [unlockedBottles, setUnlockedBottles] = useState<number[]>([1]);
  const [selectedBottle, setSelectedBottle] = useState(1);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedPoints = await AsyncStorage.getItem('points');
      if (savedPoints) setPoints(parseInt(savedPoints));
      const savedBottles = await AsyncStorage.getItem('unlockedBottles');
      if (savedBottles) setUnlockedBottles(JSON.parse(savedBottles));
      const savedSelected = await AsyncStorage.getItem('selectedBottle');
      if (savedSelected) setSelectedBottle(parseInt(savedSelected));
    } catch {}
  };

  const unlockBottle = async (bottle: typeof BOTTLES[0]) => {
    if (points < bottle.cost) {
      Alert.alert('Yetersiz Puan', `Bu şişe için ${bottle.cost} puan gerekiyor. Şu an ${points} puanın var.`);
      return;
    }
    const newPoints = points - bottle.cost;
    const newUnlocked = [...unlockedBottles, bottle.id];
    setPoints(newPoints);
    setUnlockedBottles(newUnlocked);
    await AsyncStorage.setItem('points', newPoints.toString());
    await AsyncStorage.setItem('unlockedBottles', JSON.stringify(newUnlocked));
    Alert.alert('🎉 Tebrikler!', `${bottle.name} koleksiyonuna eklendi!`);
  };

  const selectBottle = async (id: number) => {
    setSelectedBottle(id);
    await AsyncStorage.setItem('selectedBottle', id.toString());
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>🏆 Şişe Koleksiyonu</Text>

      <View style={styles.pointsBadge}>
        <Text style={styles.pointsText}>⭐ {points} puan</Text>
      </View>

      <View style={styles.grid}>
        {BOTTLES.map((bottle) => {
          const isUnlocked = unlockedBottles.includes(bottle.id);
          const isSelected = selectedBottle === bottle.id;
          return (
            <TouchableOpacity
              key={bottle.id}
              style={[
                styles.bottleCard,
                isUnlocked && styles.unlockedCard,
                isSelected && styles.selectedCard,
              ]}
              onPress={() => {
                if (isUnlocked) {
                  selectBottle(bottle.id);
                } else {
                  unlockBottle(bottle);
                }
              }}
            >
              <Text style={styles.bottleEmoji}>{isUnlocked ? bottle.emoji : '🔒'}</Text>
              <Text style={styles.bottleName}>{bottle.name}</Text>
              <Text style={styles.bottleDesc}>{bottle.description}</Text>
              {!isUnlocked && (
                <View style={styles.costBadge}>
                  <Text style={styles.costText}>⭐ {bottle.cost}</Text>
                </View>
              )}
              {isSelected && (
                <View style={styles.selectedBadge}>
                  <Text style={styles.selectedText}>Aktif</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#03045E' },
  content: { padding: 20, alignItems: 'center' },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  pointsBadge: { backgroundColor: '#0077B6', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginBottom: 24 },
  pointsText: { color: '#FFD700', fontSize: 18, fontWeight: 'bold' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  bottleCard: {
    width: '45%', backgroundColor: '#023E8A', borderRadius: 16,
    padding: 16, alignItems: 'center', borderWidth: 2, borderColor: '#0077B6',
  },
  unlockedCard: { borderColor: '#00B4D8' },
  selectedCard: { borderColor: '#FFD700', backgroundColor: '#0077B6' },
  bottleEmoji: { fontSize: 48, marginBottom: 8 },
  bottleName: { color: '#fff', fontWeight: 'bold', fontSize: 14, textAlign: 'center' },
  bottleDesc: { color: '#90E0EF', fontSize: 11, textAlign: 'center', marginTop: 4 },
  costBadge: { marginTop: 8, backgroundColor: '#03045E', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  costText: { color: '#FFD700', fontSize: 12, fontWeight: 'bold' },
  selectedBadge: { marginTop: 8, backgroundColor: '#FFD700', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  selectedText: { color: '#03045E', fontSize: 12, fontWeight: 'bold' },
});