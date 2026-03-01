// ─── Şişe Koleksiyonu ─────────────────────────────────────
export const BOTTLES = [
  { id: 1, name: 'Plastik Şişe', emoji: '🧴', cost: 0, description: 'Başlangıç şişen' },
  { id: 2, name: 'Cam Şişe', emoji: '🫙', cost: 100, description: 'Şık ve çevreci' },
  { id: 3, name: 'Termos', emoji: '🧊', cost: 250, description: 'Soğuk tutar 24 saat' },
  { id: 4, name: 'Bambu Şişe', emoji: '🎋', cost: 400, description: 'Doğa dostu' },
  { id: 5, name: 'Uzay Şişesi', emoji: '🚀', cost: 600, description: 'Galaktik hidrasyon' },
  { id: 6, name: 'Kristal Şişe', emoji: '💎', cost: 900, description: 'Efsanevi koleksiyon' },
  { id: 7, name: 'Altın Şişe', emoji: '👑', cost: 1500, description: 'Sadece şampiyonlar için' },
  { id: 8, name: 'Gökkuşağı', emoji: '🌈', cost: 2000, description: 'Ultra nadir' },
];

// ─── Rozet Sistemi ────────────────────────────────────────
export const BADGES = [
  { id: 'first_glass', name: 'İlk Yudum', emoji: '🥤', description: 'İlk bardak suyu iç' },
  { id: 'first_goal', name: 'Hedef Avcısı', emoji: '🎯', description: 'İlk günlük hedefini tamamla' },
  { id: 'streak_3', name: '3 Gün Seri', emoji: '🔥', description: '3 gün üst üste hedef tamamla' },
  { id: 'streak_7', name: 'Haftalık Savaşçı', emoji: '⚔️', description: '7 gün üst üste hedef tamamla' },
  { id: 'streak_30', name: 'Ay Tanrısı', emoji: '🌙', description: '30 gün üst üste hedef tamamla' },
  { id: 'early_bird', name: 'Erken Kuş', emoji: '🐦', description: "Sabah 7'den önce su iç" },
  { id: 'night_owl', name: 'Gece Kuşu', emoji: '🦉', description: "Gece 11'den sonra su iç" },
  { id: 'liter_club', name: 'Litre Kulübü', emoji: '💧', description: 'Bir günde 3 litreden fazla iç' },
  { id: 'collector', name: 'Koleksiyoncu', emoji: '🏆', description: 'Tüm şişeleri aç' },
  { id: 'points_1000', name: 'Bin Yıldız', emoji: '⭐', description: '1000 puan kazan' },
];

// ─── Seviye Sistemi ───────────────────────────────────────
export const LEVELS = [
  { level: 1, name: 'Çaylak', emoji: '🌱', minPoints: 0, maxPoints: 99 },
  { level: 2, name: 'Su Avcısı', emoji: '💦', minPoints: 100, maxPoints: 299 },
  { level: 3, name: 'Hidrasyon Kahramanı', emoji: '🦸', minPoints: 300, maxPoints: 599 },
  { level: 4, name: 'Su Ustası', emoji: '🧙', minPoints: 600, maxPoints: 999 },
  { level: 5, name: 'Okyanus Lideri', emoji: '🌊', minPoints: 1000, maxPoints: 1999 },
  { level: 6, name: 'Efsane', emoji: '👑', minPoints: 2000, maxPoints: Infinity },
];

// ─── Günlük Görevler ──────────────────────────────────────
export const DAILY_TASKS = [
  { id: 'morning_water', name: 'Sabah Suyu', emoji: '🌅', description: "Sabah 9'dan önce 250ml iç", reward: 20 },
  { id: 'half_goal', name: 'Yarı Yol', emoji: '🏃', description: 'Günlük hedefinin yarısına ulaş', reward: 15 },
  { id: 'full_goal', name: 'Tam Hedef', emoji: '🎯', description: 'Günlük hedefini tamamla', reward: 50 },
  { id: 'three_times', name: 'Üçlü Kombo', emoji: '3️⃣', description: 'En az 3 kez su ekle', reward: 10 },
  { id: 'evening_water', name: 'Akşam Suyu', emoji: '🌙', description: "Akşam 8'den sonra 200ml iç", reward: 15 },
];

// ─── Motivasyon Sözleri ───────────────────────────────────
export const MOTIVATIONAL_QUOTES = [
  'Su hayattır, her yudum seni güçlendirir! 💪',
  "Vücudunun %60'ı su. Onu mutlu et! 😊",
  'Bugün de hedefine bir adım daha yakınsın! 🎯',
  'Su içmek en basit sağlık yatırımıdır 🏥',
  'Her damla önemli, tıpkı senin gibi! ✨',
  'Susuzluk hissediyorsan çoktan geç kaldın! ⏰',
  'Bugün kendine iyi bak, su iç! 💧',
  'Hedefler büyük, yudumlar küçük ama etkili! 🚀',
];

// ─── Bardak Boyutları ─────────────────────────────────────
export const GLASS_SIZES = [
  { amount: 150, label: '150ml', emoji: '🥃' },
  { amount: 200, label: '200ml', emoji: '🥛' },
  { amount: 250, label: '250ml', emoji: '🫗' },
  { amount: 330, label: '330ml', emoji: '🧃' },
  { amount: 500, label: '500ml', emoji: '🍶' },
];

// ─── Su İhtiyacı Hesaplama ────────────────────────────────
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

// ─── Seviye Hesaplama ─────────────────────────────────────
export const getLevel = (points: number) => {
  return LEVELS.reduce((prev, curr) => (points >= curr.minPoints ? curr : prev), LEVELS[0]);
};

// ─── Günlük Söz ──────────────────────────────────────────
export const getDailyQuote = () => {
  const index = new Date().getDate() % MOTIVATIONAL_QUOTES.length;
  return MOTIVATIONAL_QUOTES[index];
};
