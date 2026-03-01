import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { calculateDailyWater } from '@/constants/waterData';

const GENDERS = [
  { id: 'male', label: 'Erkek', emoji: '👨' },
  { id: 'female', label: 'Kadın', emoji: '👩' },
];

const ACTIVITIES = [
  { id: 'sedentary', label: 'Hareketsiz', emoji: '🧘', desc: 'Masa başı, az hareket' },
  { id: 'active', label: 'Aktif', emoji: '🏃', desc: 'Düzenli egzersiz' },
  { id: 'very_active', label: 'Çok Aktif', emoji: '🏋️', desc: 'Yoğun spor / fiziksel iş' },
];

const TOTAL_STEPS = 5;

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [activity, setActivity] = useState('');
  const [fadeAnim] = useState(new Animated.Value(1));

  const animateTransition = (next: number) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    setTimeout(() => setStep(next), 150);
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) {
      animateTransition(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      animateTransition(step - 1);
    }
  };

  const handleFinish = async () => {
    const dailyGoal = calculateDailyWater(
      parseInt(weight) || 70,
      parseInt(height) || 170,
      gender || 'male',
      activity || 'active',
    );

    await AsyncStorage.setItem('onboarded', 'true');
    await AsyncStorage.setItem('userName', name || 'Kullanıcı');
    await AsyncStorage.setItem('gender', gender);
    await AsyncStorage.setItem('weight', weight);
    await AsyncStorage.setItem('height', height);
    await AsyncStorage.setItem('activity', activity);
    await AsyncStorage.setItem('dailyGoal', dailyGoal.toString());
    await AsyncStorage.setItem('points', '0');
    await AsyncStorage.setItem('unlockedBottles', JSON.stringify([1]));
    await AsyncStorage.setItem('selectedBottle', '1');

    router.replace('/(tabs)');
  };

  const isNextDisabled = () => {
    if (step === 1 && !name.trim()) return true;
    if (step === 2 && !gender) return true;
    if (step === 3 && (!weight || !height)) return true;
    if (step === 4 && !activity) return true;
    return false;
  };

  const dailyGoal = calculateDailyWater(
    parseInt(weight) || 70,
    parseInt(height) || 170,
    gender || 'male',
    activity || 'active',
  );

  const renderStep = () => {
    switch (step) {
      // ─── Hoş Geldin ───────────────────────────────
      case 0:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.welcomeEmoji}>💧</Text>
            <Text style={styles.welcomeTitle}>Hydration{'\n'}Motivation</Text>
            <Text style={styles.welcomeSubtitle}>
              Su içme alışkanlığını{'\n'}eğlenceli hale getir!
            </Text>
            <View style={styles.featureList}>
              {[
                { emoji: '🎯', text: 'Kişisel su hedefi belirleme' },
                { emoji: '🏆', text: 'Şişe koleksiyonu ve ödüller' },
                { emoji: '📊', text: 'Detaylı istatistikler' },
                { emoji: '🔔', text: 'Akıllı hatırlatıcılar' },
              ].map((item) => (
                <View key={item.text} style={styles.featureItem}>
                  <Text style={styles.featureEmoji}>{item.emoji}</Text>
                  <Text style={styles.featureText}>{item.text}</Text>
                </View>
              ))}
            </View>
          </View>
        );

      // ─── İsim ─────────────────────────────────────
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepEmoji}>👋</Text>
            <Text style={styles.stepTitle}>Merhaba!</Text>
            <Text style={styles.stepSubtitle}>Sana nasıl hitap edelim?</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="Adını gir..."
              placeholderTextColor="#5A7A9A"
              autoFocus
            />
          </View>
        );

      // ─── Cinsiyet ─────────────────────────────────
      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepEmoji}>⚡</Text>
            <Text style={styles.stepTitle}>Cinsiyetin</Text>
            <Text style={styles.stepSubtitle}>Su ihtiyacını doğru hesaplamak için</Text>
            <View style={styles.optionRow}>
              {GENDERS.map((g) => (
                <TouchableOpacity
                  key={g.id}
                  style={[styles.genderCard, gender === g.id && styles.selectedCard]}
                  onPress={() => setGender(g.id)}
                >
                  <Text style={styles.genderEmoji}>{g.emoji}</Text>
                  <Text style={[styles.genderLabel, gender === g.id && styles.selectedLabel]}>
                    {g.label}
                  </Text>
                  {gender === g.id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color="#00B4D8"
                      style={styles.checkIcon}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      // ─── Boy / Kilo ───────────────────────────────
      case 3:
        return (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.stepContainer}
          >
            <Text style={styles.stepEmoji}>📏</Text>
            <Text style={styles.stepTitle}>Boy & Kilo</Text>
            <Text style={styles.stepSubtitle}>Günlük su miktarını hesaplayalım</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Boy (cm)</Text>
              <TextInput
                style={styles.textInput}
                value={height}
                onChangeText={setHeight}
                placeholder="Örn: 175"
                placeholderTextColor="#5A7A9A"
                keyboardType="numeric"
                maxLength={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Kilo (kg)</Text>
              <TextInput
                style={styles.textInput}
                value={weight}
                onChangeText={setWeight}
                placeholder="Örn: 70"
                placeholderTextColor="#5A7A9A"
                keyboardType="numeric"
                maxLength={3}
              />
            </View>
          </KeyboardAvoidingView>
        );

      // ─── Aktivite Seviyesi ────────────────────────
      case 4:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepEmoji}>🏅</Text>
            <Text style={styles.stepTitle}>Aktivite Seviyesi</Text>
            <Text style={styles.stepSubtitle}>Günlük hareket düzeyin</Text>

            {ACTIVITIES.map((a) => (
              <TouchableOpacity
                key={a.id}
                style={[styles.activityCard, activity === a.id && styles.selectedCard]}
                onPress={() => setActivity(a.id)}
              >
                <Text style={styles.activityEmoji}>{a.emoji}</Text>
                <View style={styles.activityInfo}>
                  <Text style={[styles.activityLabel, activity === a.id && styles.selectedLabel]}>
                    {a.label}
                  </Text>
                  <Text style={styles.activityDesc}>{a.desc}</Text>
                </View>
                {activity === a.id && (
                  <Ionicons name="checkmark-circle" size={22} color="#00B4D8" />
                )}
              </TouchableOpacity>
            ))}

            {activity ? (
              <View style={styles.resultCard}>
                <Text style={styles.resultLabel}>Senin günlük hedefin</Text>
                <Text style={styles.resultValue}>{dailyGoal} ml</Text>
                <Text style={styles.resultHint}>💧 Günde ~{Math.round(dailyGoal / 250)} bardak</Text>
              </View>
            ) : null}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Dots */}
        <View style={styles.dotsContainer}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === step && styles.dotActive,
                i < step && styles.dotCompleted,
              ]}
            />
          ))}
        </View>

        {/* Step Content */}
        <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>{renderStep()}</Animated.View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomBar}>
        {step > 0 ? (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={20} color="#90E0EF" />
            <Text style={styles.backText}>Geri</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 80 }} />
        )}

        {step < TOTAL_STEPS - 1 ? (
          <TouchableOpacity
            style={[styles.nextButton, isNextDisabled() && styles.disabledButton]}
            onPress={handleNext}
            disabled={isNextDisabled()}
          >
            <Text style={styles.nextText}>{step === 0 ? 'Başla' : 'İleri'}</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.nextButton, styles.finishButton, isNextDisabled() && styles.disabledButton]}
            onPress={handleFinish}
            disabled={isNextDisabled()}
          >
            <Text style={styles.nextText}>Hazırım! 🚀</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#03045E' },
  scrollContent: { flexGrow: 1, padding: 24, paddingTop: 60 },

  // Dots
  dotsContainer: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 30 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#023E8A' },
  dotActive: { backgroundColor: '#00B4D8', width: 28 },
  dotCompleted: { backgroundColor: '#0077B6' },

  // Steps
  stepContainer: { flex: 1, alignItems: 'center', paddingTop: 20 },
  stepEmoji: { fontSize: 64, marginBottom: 16 },
  stepTitle: { color: '#fff', fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  stepSubtitle: { color: '#90E0EF', fontSize: 16, textAlign: 'center', marginBottom: 32 },

  // Welcome
  welcomeEmoji: { fontSize: 80, marginBottom: 16 },
  welcomeTitle: { color: '#fff', fontSize: 36, fontWeight: 'bold', textAlign: 'center', marginBottom: 12, lineHeight: 44 },
  welcomeSubtitle: { color: '#90E0EF', fontSize: 18, textAlign: 'center', marginBottom: 40, lineHeight: 26 },
  featureList: { width: '100%', gap: 16 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#023E8A', padding: 16, borderRadius: 16 },
  featureEmoji: { fontSize: 28 },
  featureText: { color: '#ADE8F4', fontSize: 16, flex: 1 },

  // Inputs
  textInput: {
    width: '100%', backgroundColor: '#023E8A', color: '#fff',
    borderRadius: 16, padding: 18, fontSize: 18, borderWidth: 2,
    borderColor: '#0077B6', textAlign: 'center',
  },
  inputGroup: { width: '100%', marginBottom: 16 },
  inputLabel: { color: '#90E0EF', fontSize: 14, marginBottom: 8, marginLeft: 4 },

  // Gender
  optionRow: { flexDirection: 'row', gap: 16, width: '100%' },
  genderCard: {
    flex: 1, backgroundColor: '#023E8A', borderRadius: 20, padding: 24,
    alignItems: 'center', gap: 12, borderWidth: 2, borderColor: '#0077B6',
  },
  genderEmoji: { fontSize: 48 },
  genderLabel: { color: '#90E0EF', fontSize: 16, fontWeight: '600' },
  selectedCard: { borderColor: '#00B4D8', backgroundColor: '#0A3D6B' },
  selectedLabel: { color: '#00B4D8' },
  checkIcon: { position: 'absolute', top: 10, right: 10 },

  // Activity
  activityCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#023E8A',
    borderRadius: 16, padding: 18, gap: 14, width: '100%',
    borderWidth: 2, borderColor: '#0077B6', marginBottom: 12,
  },
  activityEmoji: { fontSize: 36 },
  activityInfo: { flex: 1 },
  activityLabel: { color: '#fff', fontSize: 16, fontWeight: '600' },
  activityDesc: { color: '#90E0EF', fontSize: 13, marginTop: 2 },

  // Result
  resultCard: {
    backgroundColor: '#0077B6', borderRadius: 20, padding: 24,
    alignItems: 'center', width: '100%', marginTop: 12,
  },
  resultLabel: { color: '#ADE8F4', fontSize: 14 },
  resultValue: { color: '#fff', fontSize: 42, fontWeight: 'bold', marginVertical: 4 },
  resultHint: { color: '#CAF0F8', fontSize: 14 },

  // Bottom
  bottomBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 20, paddingBottom: 40,
    borderTopWidth: 1, borderTopColor: '#023E8A',
  },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 12 },
  backText: { color: '#90E0EF', fontSize: 16 },
  nextButton: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#0077B6', paddingHorizontal: 28, paddingVertical: 16,
    borderRadius: 16,
  },
  nextText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  finishButton: { backgroundColor: '#00B4D8' },
  disabledButton: { opacity: 0.4 },
});
