// ─── Şişe Koleksiyonu ─────────────────────────────────────
export const BOTTLES = [
  { id: 'classic', name: 'Plastik Şişe', icon: 'water-outline' as const, cost: 0, description: 'Başlangıç şişen', color: '#64748B' },
  { id: 'glass', name: 'Cam Şişe', icon: 'cafe-outline' as const, cost: 100, description: 'Şık ve çevreci', color: '#38BDF8' },
  { id: 'thermos', name: 'Termos', icon: 'flask-outline' as const, cost: 250, description: '24 saat soğuk tutar', color: '#818CF8' },
  { id: 'bamboo', name: 'Bambu Şişe', icon: 'leaf-outline' as const, cost: 400, description: 'Doğa dostu', color: '#34D399' },
  { id: 'sport', name: 'Spor Şişesi', icon: 'fitness-outline' as const, cost: 600, description: 'Aktif yaşam için', color: '#FB923C' },
  { id: 'crystal', name: 'Kristal Şişe', icon: 'diamond-outline' as const, cost: 900, description: 'Premium koleksiyon', color: '#A78BFA' },
  { id: 'gold', name: 'Altın Şişe', icon: 'trophy-outline' as const, cost: 1500, description: 'Şampiyonlar için', color: '#FBBF24' },
  { id: 'titan', name: 'Titan Şişe', icon: 'rocket-outline' as const, cost: 2000, description: 'Ultra nadir', color: '#F472B6' },
];

// ─── Rozet Sistemi ────────────────────────────────────────
export const BADGES = [
  { id: 'first_glass', name: 'İlk Yudum', icon: 'water-outline' as const, description: 'İlk bardak suyu iç', condition: 'first_glass' },
  { id: 'first_goal', name: 'Hedef Avcısı', icon: 'flag-outline' as const, description: 'İlk hedefini tamamla', condition: 'first_goal' },
  { id: 'streak_3', name: '3 Gün Seri', icon: 'flame-outline' as const, description: '3 gün üst üste', condition: 'streak3' },
  { id: 'streak_7', name: 'Haftalık', icon: 'calendar-outline' as const, description: '7 gün üst üste', condition: 'streak7' },
  { id: 'streak_30', name: 'Aylık', icon: 'medal-outline' as const, description: '30 gün üst üste', condition: 'streak30' },
  { id: 'early_bird', name: 'Erken Kuş', icon: 'sunny-outline' as const, description: "07:00'den önce", condition: 'early_bird' },
  { id: 'night_owl', name: 'Gece Kuşu', icon: 'moon-outline' as const, description: "23:00'den sonra", condition: 'night_owl' },
  { id: 'liter_club', name: 'Litre Kulübü', icon: 'beaker-outline' as const, description: 'Günde 3+ litre', condition: 'days7' },
  { id: 'collector', name: 'Koleksiyoncu', icon: 'grid-outline' as const, description: 'Tüm şişeleri aç', condition: 'days30' },
  { id: 'points_1000', name: 'Bin Puan', icon: 'star-outline' as const, description: '1000 puan kazan', condition: 'points500' },
];

// ─── Seviye Sistemi ───────────────────────────────────────
export const LEVELS = [
  { level: 1, name: 'Başlangıç', minPoints: 0, maxPoints: 99 },
  { level: 2, name: 'Su Avcısı', minPoints: 100, maxPoints: 299 },
  { level: 3, name: 'Kahraman', minPoints: 300, maxPoints: 599 },
  { level: 4, name: 'Usta', minPoints: 600, maxPoints: 999 },
  { level: 5, name: 'Lider', minPoints: 1000, maxPoints: 1999 },
  { level: 6, name: 'Efsane', minPoints: 2000, maxPoints: Infinity },
];

// ─── Günlük Görevler ──────────────────────────────────────
export const DAILY_TASKS = [
  { id: 'morning_water', name: 'Sabah Rutini', icon: 'sunny-outline' as const, description: "09:00'dan önce 250ml", reward: 20 },
  { id: 'half_goal', name: 'Yarı Yolda', icon: 'trending-up-outline' as const, description: 'Hedefin yarısına ulaş', reward: 15 },
  { id: 'full_goal', name: 'Tam Hedef', icon: 'checkmark-done-outline' as const, description: 'Günlük hedefe ulaş', reward: 50 },
  { id: 'three_times', name: 'Üçlü Kombo', icon: 'layers-outline' as const, description: '3 kez su ekle', reward: 10 },
  { id: 'evening_water', name: 'Akşam Rutini', icon: 'moon-outline' as const, description: "20:00'den sonra 200ml", reward: 15 },
];

// ─── Motivasyon Sözleri ───────────────────────────────────
export const MOTIVATIONAL_QUOTES = [
  'Su, vücudunun en değerli yakıtıdır.',
  "Vücudunun %60'ı sudan oluşur — onu mutlu et.",
  'Bugün de hedefine bir adım daha yakınsın.',
  'Su içmek en basit sağlık yatırımıdır.',
  'Küçük alışkanlıklar büyük değişimler yaratır.',
  'Susuzluk hissediyorsan çoktan geç kalmışsın.',
  'Bugün kendine iyi bak.',
  'Her yudum, daha sağlıklı bir adım.',
];

// ─── Bardak Boyutları ─────────────────────────────────────
export const GLASS_SIZES = [
  { amount: 150, label: '150' },
  { amount: 200, label: '200' },
  { amount: 250, label: '250' },
  { amount: 330, label: '330' },
  { amount: 500, label: '500' },
];

// ─── Yardımcı Fonksiyonlar ────────────────────────────────
export const calculateDailyWater = (
  weight: number,
  height: number,
  gender: string,
  activityLevel: string,
): number => {
  let base = weight * 33;
  if (height > 180) base += 200;
  else if (height > 170) base += 100;
  if (gender === 'male') base += 200;
  if (activityLevel === 'active') base += 400;
  else if (activityLevel === 'very_active') base += 700;
  return Math.round(base / 100) * 100;
};

export const getLevel = (points: number) => {
  return LEVELS.reduce((prev, curr) => (points >= curr.minPoints ? curr : prev), LEVELS[0]);
};

export const getDailyQuote = () => {
  const index = new Date().getDate() % MOTIVATIONAL_QUOTES.length;
  return MOTIVATIONAL_QUOTES[index];
};
