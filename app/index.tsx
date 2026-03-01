import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Animated,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const DAILY_GOAL = 2500;

const getStorage = async () => {
  const module = await import('@react-native-async-storage/async-storage');
  return module.default;
};

export default function HomeScreen() {
  const [waterAmount, setWaterAmount] = useState(0);
  const [points, setPoints] = useState(0);
  const [fillAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    Animated.timing(fillAnim, {
      toValue: waterAmount / DAILY_GOAL,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [waterAmount]);

  const loadData = async () => {
    try {
      const storage = await getStorage();
      const today = new Date().toDateString();
      const savedDate = await storage.getItem('date');
      if (savedDate !== today) {
        await storage.setItem('date', today);
        await storage.setItem('water', '0');
        setWaterAmount(0);
      } else {
        const saved = await storage.getItem('water');
        if (saved) setWaterAmount(parseInt(saved));
      }
      const savedPoints = await storage.getItem('points');
      if (savedPoints) setPoints(parseInt(savedPoints));
    } catch {}
  };

  const addWater = async (amount: number) => {
    const storage = await getStorage();
    const newAmount = Math.min(waterAmount + amount, DAILY_GOAL);
    setWaterAmount(newAmount);
    await storage.setItem('water', newAmount.toString());

    if (newAmount >= DAILY_GOAL && waterAmount < DAILY_GOAL) {
      const newPoints = points + 100;
      setPoints(newPoints);
      await storage.setItem('points', newPoints.toString());
      Alert.alert('🎉 Tebrikler!', 'Günlük hedefini tamamladın! +100 puan kazandın!');
    }
  };

  const fillHeight = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const percentage = Math.round((waterAmount / DAILY_GOAL) * 100);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>💧 Hydration Motivation</Text>
        <View style={styles.pointsBadge}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.pointsText}>{points} puan</Text>
        </View>
      </View>

      <View style={styles.bottleContainer}>
        <View style={styles.bottle}>
          <Animated.View style={[styles.water, { height: fillHeight }]} />
          <Text style={styles.percentageText}>{percentage}%</Text>
        </View>
      </View>

      <Text style={styles.amountText}>
        {waterAmount} / {DAILY_GOAL} ml
      </Text>
      <Text style={styles.remainingText}>
        {waterAmount >= DAILY_GOAL
          ? '✅ Hedef tamamlandı!'
          : `${DAILY_GOAL - waterAmount} ml kaldı`}
      </Text>

      <View style={styles.buttons}>
        {[200, 300, 500].map((amount) => (
          <TouchableOpacity
            key={amount}
            style={styles.button}
            onPress={() => addWater(amount)}
          >
            <Ionicons name="water-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>+{amount}ml</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.resetButton}
        onPress={async () => {
          const storage = await getStorage();
          setWaterAmount(0);
          await storage.setItem('water', '0');
        }}
      >
        <Text style={styles.resetText}>Sıfırla</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#03045E' },
  content: { alignItems: 'center', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 30 },
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  pointsBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0077B6', padding: 8, borderRadius: 20, gap: 4 },
  pointsText: { color: '#FFD700', fontWeight: 'bold' },
  bottleContainer: { marginVertical: 30 },
  bottle: {
    width: 150, height: 300, borderRadius: 75,
    borderWidth: 4, borderColor: '#00B4D8',
    overflow: 'hidden', justifyContent: 'flex-end',
    alignItems: 'center', backgroundColor: '#023E8A',
  },
  water: { width: '100%', backgroundColor: '#00B4D8', position: 'absolute', bottom: 0, opacity: 0.8 },
  percentageText: { color: '#fff', fontSize: 32, fontWeight: 'bold', zIndex: 1 },
  amountText: { color: '#90E0EF', fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  remainingText: { color: '#ADE8F4', fontSize: 16, marginBottom: 30 },
  buttons: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  button: {
    backgroundColor: '#0077B6', padding: 16, borderRadius: 16,
    alignItems: 'center', gap: 6, minWidth: 90,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  resetButton: { marginTop: 10, padding: 12 },
  resetText: { color: '#90E0EF', fontSize: 14 },
});