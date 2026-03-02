import { STORAGE_KEYS } from '@/constants/storageKeys';
import { calculateDailyWater } from '@/constants/waterData';
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

const GENDERS = [
  { id: 'male', label: 'Erkek', icon: 'man-outline' as const },
  { id: 'female', label: 'Kadın', icon: 'woman-outline' as const },
];

const ACTIVITIES = [
  { id: 'sedentary', label: 'Hareketsiz', icon: 'desktop-outline' as const, desc: 'Masa başı, az hareket' },
  { id: 'active', label: 'Aktif', icon: 'walk-outline' as const, desc: 'Düzenli egzersiz' },
  { id: 'very_active', label: 'Çok Aktif', icon: 'barbell-outline' as const, desc: 'Yoğun spor / fiziksel iş' },
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
      Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    setTimeout(() => setStep(next), 120);
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) animateTransition(step + 1);
  };

  const handleBack = () => {
    if (step > 0) animateTransition(step - 1);
  };

  const handleFinish = async () => {
    const dailyGoal = calculateDailyWater(
      parseInt(weight) || 70,
      parseInt(height) || 170,
      gender || 'male',
      activity || 'active',
    );

    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDED, 'true');
    await AsyncStorage.setItem(STORAGE_KEYS.USER_NAME, name || 'Kullanıcı');
    await AsyncStorage.setItem(STORAGE_KEYS.GENDER, gender);
    await AsyncStorage.setItem(STORAGE_KEYS.WEIGHT, weight);
    await AsyncStorage.setItem(STORAGE_KEYS.HEIGHT, height);
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVITY, activity);
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_GOAL, dailyGoal.toString());
    await AsyncStorage.setItem(STORAGE_KEYS.POINTS, '0');
    await AsyncStorage.setItem(STORAGE_KEYS.UNLOCKED_BOTTLES, JSON.stringify(['classic']));
    await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_BOTTLE, 'classic');

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
      case 0:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="water" size={48} color="#38BDF8" />
            </View>
            <Text style={styles.welcomeTitle}>Hydration{'\n'}Motivation</Text>
            <Text style={styles.welcomeSubtitle}>
              Sağlıklı su içme alışkanlığını{'\n'}birlikte oluşturalım.
            </Text>
            <View style={styles.featureList}>
              {[
                { icon: 'flag-outline' as const, text: 'Kişisel su hedefi belirleme' },
                { icon: 'grid-outline' as const, text: 'Şişe koleksiyonu ve ödüller' },
                { icon: 'stats-chart-outline' as const, text: 'Detaylı istatistikler' },
                { icon: 'notifications-outline' as const, text: 'Akıllı hatırlatıcılar' },
              ].map((item) => (
                <View key={item.text} style={styles.featureItem}>
                  <View style={styles.featureIconWrap}>
                    <Ionicons name={item.icon} size={18} color="#38BDF8" />
                  </View>
                  <Text style={styles.featureText}>{item.text}</Text>
                </View>
              ))}
            </View>
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="person-outline" size={40} color="#38BDF8" />
            </View>
            <Text style={styles.stepTitle}>Merhaba!</Text>
            <Text style={styles.stepSubtitle}>Sana nasıl hitap edelim?</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="Adını gir"
              placeholderTextColor="#475569"
              autoFocus
            />
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="people-outline" size={40} color="#38BDF8" />
            </View>
            <Text style={styles.stepTitle}>Cinsiyet</Text>
            <Text style={styles.stepSubtitle}>Su ihtiyacını doğru hesaplamak için</Text>
            <View style={styles.optionRow}>
              {GENDERS.map((g) => (
                <TouchableOpacity
                  key={g.id}
                  style={[styles.genderCard, gender === g.id && styles.selectedCard]}
                  onPress={() => setGender(g.id)}
                >
                  <Ionicons
                    name={g.icon}
                    size={36}
                    color={gender === g.id ? '#38BDF8' : '#64748B'}
                  />
                  <Text style={[styles.genderLabel, gender === g.id && styles.selectedLabel]}>
                    {g.label}
                  </Text>
                  {gender === g.id && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 3:
        return (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.stepContainer}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="resize-outline" size={40} color="#38BDF8" />
            </View>
            <Text style={styles.stepTitle}>Boy & Kilo</Text>
            <Text style={styles.stepSubtitle}>Günlük su hedefini hesaplayalım</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Boy (cm)</Text>
              <TextInput
                style={styles.textInput}
                value={height}
                onChangeText={setHeight}
                placeholder="175"
                placeholderTextColor="#475569"
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
                placeholder="70"
                placeholderTextColor="#475569"
                keyboardType="numeric"
                maxLength={3}
              />
            </View>
          </KeyboardAvoidingView>
        );

      case 4:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="pulse-outline" size={40} color="#38BDF8" />
            </View>
            <Text style={styles.stepTitle}>Aktivite Seviyesi</Text>
            <Text style={styles.stepSubtitle}>Günlük hareket düzeyin</Text>

            {ACTIVITIES.map((a) => (
              <TouchableOpacity
                key={a.id}
                style={[styles.activityCard, activity === a.id && styles.selectedCard]}
                onPress={() => setActivity(a.id)}
              >
                <View style={[styles.activityIconWrap, activity === a.id && styles.activityIconActive]}>
                  <Ionicons name={a.icon} size={22} color={activity === a.id ? '#38BDF8' : '#64748B'} />
                </View>
                <View style={styles.activityInfo}>
                  <Text style={[styles.activityLabel, activity === a.id && styles.selectedLabel]}>
                    {a.label}
                  </Text>
                  <Text style={styles.activityDesc}>{a.desc}</Text>
                </View>
                {activity === a.id && (
                  <Ionicons name="checkmark-circle" size={22} color="#38BDF8" />
                )}
              </TouchableOpacity>
            ))}

            {activity ? (
              <View style={styles.resultCard}>
                <Text style={styles.resultLabel}>Günlük su hedefin</Text>
                <Text style={styles.resultValue}>{dailyGoal} ml</Text>
                <Text style={styles.resultHint}>Günde yaklaşık {Math.round(dailyGoal / 250)} bardak</Text>
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
        {/* Progress */}
        <View style={styles.progressRow}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressSegment,
                i <= step && styles.progressSegmentActive,
              ]}
            />
          ))}
        </View>

        <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>{renderStep()}</Animated.View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomBar}>
        {step > 0 ? (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="chevron-back" size={20} color="#94A3B8" />
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
            <Text style={styles.nextText}>{step === 0 ? 'Başlayalım' : 'Devam'}</Text>
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.nextButton, isNextDisabled() && styles.disabledButton]}
            onPress={handleFinish}
            disabled={isNextDisabled()}
          >
            <Text style={styles.nextText}>Tamamla</Text>
            <Ionicons name="checkmark" size={18} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#15294A' },
  scrollContent: { flexGrow: 1, padding: 24, paddingTop: 64 },

  // Progress
  progressRow: { flexDirection: 'row', gap: 6, marginBottom: 40 },
  progressSegment: { flex: 1, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.08)' },
  progressSegmentActive: { backgroundColor: '#38BDF8' },

  // Steps
  stepContainer: { flex: 1, alignItems: 'center', paddingTop: 16 },
  iconCircle: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: 'rgba(56,189,248,0.1)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  stepTitle: { color: '#F1F5F9', fontSize: 26, fontWeight: '700', textAlign: 'center', marginBottom: 8, letterSpacing: -0.5 },
  stepSubtitle: { color: '#64748B', fontSize: 15, textAlign: 'center', marginBottom: 32, lineHeight: 22 },

  // Welcome
  welcomeTitle: { color: '#F1F5F9', fontSize: 32, fontWeight: '800', textAlign: 'center', marginBottom: 12, lineHeight: 40, letterSpacing: -1 },
  welcomeSubtitle: { color: '#64748B', fontSize: 16, textAlign: 'center', marginBottom: 40, lineHeight: 24 },
  featureList: { width: '100%', gap: 12 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: 'rgba(255,255,255,0.04)', padding: 16, borderRadius: 14 },
  featureIconWrap: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(56,189,248,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  featureText: { color: '#94A3B8', fontSize: 15, flex: 1 },

  // Inputs
  textInput: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', color: '#F1F5F9',
    borderRadius: 14, padding: 18, fontSize: 17, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)', textAlign: 'center', fontWeight: '600',
  },
  inputGroup: { width: '100%', marginBottom: 16 },
  inputLabel: { color: '#64748B', fontSize: 13, marginBottom: 8, marginLeft: 4, fontWeight: '500' },

  // Gender
  optionRow: { flexDirection: 'row', gap: 14, width: '100%' },
  genderCard: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 18, padding: 24,
    alignItems: 'center', gap: 10, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.06)',
  },
  genderLabel: { color: '#64748B', fontSize: 15, fontWeight: '600' },
  selectedCard: { borderColor: '#38BDF8', backgroundColor: 'rgba(56,189,248,0.08)' },
  selectedLabel: { color: '#38BDF8' },
  checkBadge: {
    position: 'absolute', top: 10, right: 10,
    width: 22, height: 22, borderRadius: 11, backgroundColor: '#38BDF8',
    alignItems: 'center', justifyContent: 'center',
  },

  // Activity
  activityCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14, padding: 16, gap: 14, width: '100%',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.06)', marginBottom: 10,
  },
  activityIconWrap: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center', justifyContent: 'center',
  },
  activityIconActive: { backgroundColor: 'rgba(56,189,248,0.12)' },
  activityInfo: { flex: 1 },
  activityLabel: { color: '#94A3B8', fontSize: 15, fontWeight: '600' },
  activityDesc: { color: '#475569', fontSize: 13, marginTop: 2 },

  // Result
  resultCard: {
    backgroundColor: 'rgba(56,189,248,0.1)', borderRadius: 18, padding: 24,
    alignItems: 'center', width: '100%', marginTop: 16,
    borderWidth: 1, borderColor: 'rgba(56,189,248,0.2)',
  },
  resultLabel: { color: '#64748B', fontSize: 13, fontWeight: '500' },
  resultValue: { color: '#F1F5F9', fontSize: 40, fontWeight: '800', marginVertical: 4, letterSpacing: -1 },
  resultHint: { color: '#64748B', fontSize: 13 },

  // Bottom
  bottomBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 16, paddingBottom: 40,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)',
  },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 12 },
  backText: { color: '#94A3B8', fontSize: 15, fontWeight: '500' },
  nextButton: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#38BDF8', paddingHorizontal: 24, paddingVertical: 14,
    borderRadius: 14,
  },
  nextText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  disabledButton: { opacity: 0.3 },
});
