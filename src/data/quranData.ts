import { Reciter, Surah } from '../types';

export const RECITERS: Reciter[] = [
  {
    id: 'ar.jaber_alqaitan',
    name: 'جابر القيطان (Jaber Al-Qaitan)',
    style: 'Heartfelt, reverent & melodic Murattal recitation',
    cdnPath: 'https://everyayah.com/data/Ali_Jaber_64kbps'
  },
  {
    id: 'ar.alafasy',
    name: 'Mishary Rashid Alafasy',
    style: 'Murattal with resonant cadence',
    cdnPath: 'https://everyayah.com/data/Alafasy_128kbps'
  },
  {
    id: 'ar.alijaber',
    name: 'Ali Jaber (علي جابر)',
    style: 'Legendary Imam of Masjid Al-Haram, emotive cadence',
    cdnPath: 'https://everyayah.com/data/Ali_Jaber_64kbps'
  },
  {
    id: 'ar.qatami',
    name: 'Nasser Al-Qatami (ناصر القطامي)',
    style: 'Deep & touching contemporary Murattal',
    cdnPath: 'https://everyayah.com/data/Nasser_Alqatami_128kbps'
  },
  {
    id: 'ar.muaiqly',
    name: 'Maher Al-Muaiqly (ماهر المعيقلي)',
    style: 'Imam of Masjid Al-Haram, steady & melodic',
    cdnPath: 'https://everyayah.com/data/MaherAlMuaiqly128kbps'
  },
  {
    id: 'ar.dossari',
    name: 'Yasser Al-Dossari (ياسر الدوسري)',
    style: 'Inspiring & powerful Hijazi recitation',
    cdnPath: 'https://everyayah.com/data/Yasser_Ad-Dussary_128kbps'
  },
  {
    id: 'ar.husary',
    name: 'Mahmoud Khalil Al-Husary',
    style: 'Tajweed reference & measured speed',
    cdnPath: 'https://everyayah.com/data/Husary_128kbps'
  },
  {
    id: 'ar.minshawi',
    name: 'Mohamed Siddiq Al-Minshawi',
    style: 'Soulful & contemplative Murattal',
    cdnPath: 'https://everyayah.com/data/Minshawi_Murattal_128kbps'
  },
  {
    id: 'ar.abdulbasit',
    name: 'Abdul Basit Abdul Samad',
    style: 'Majestic & classic Murattal',
    cdnPath: 'https://everyayah.com/data/Abdul_Basit_Murattal_192kbps'
  }
];

export const SURAHS_DATA: Record<number, Surah> = {
  1: {
    number: 1,
    name: 'الفاتحة',
    englishName: 'Al-Fatihah',
    numberOfAyahs: 7,
    ayahs: [
      { number: 1, surahNumber: 1, surahName: 'Al-Fatihah', text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.' },
      { number: 2, surahNumber: 1, surahName: 'Al-Fatihah', text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', translation: '[All] praise is [due] to Allah, Lord of the worlds -' },
      { number: 3, surahNumber: 1, surahName: 'Al-Fatihah', text: 'الرَّحْمَٰنِ الرَّحِيمِ', translation: 'The Entirely Merciful, the Especially Merciful,' },
      { number: 4, surahNumber: 1, surahName: 'Al-Fatihah', text: 'مَالِكِ يَوْمِ الدِّينِ', translation: 'Sovereign of the Day of Recompense.' },
      { number: 5, surahNumber: 1, surahName: 'Al-Fatihah', text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', translation: 'It is You we worship and You we ask for help.' },
      { number: 6, surahNumber: 1, surahName: 'Al-Fatihah', text: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', translation: 'Guide us to the straight path -' },
      { number: 7, surahNumber: 1, surahName: 'Al-Fatihah', text: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ', translation: 'The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.' }
    ]
  },
  67: {
    number: 67,
    name: 'الملك',
    englishName: 'Al-Mulk',
    numberOfAyahs: 30,
    ayahs: [
      { number: 1, surahNumber: 67, surahName: 'Al-Mulk', text: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ', translation: 'Blessed is He in whose hand is dominion, and He is over all things competent -',
        mutashabihat: [
          { surahNumber: 25, surahName: 'Al-Furqan', ayahNumber: 1, text: 'تَبَارَكَ الَّذِي نَزَّلَ الْفُرْقَانَ عَلَىٰ عَبْدِهِ لِيَكُونَ لِلْعَالَمِينَ نَذِيرًا', differenceNote: 'Starts with تَبَارَكَ الَّذِي - difference: بِيَدِهِ الْمُلْكُ vs نَزَّلَ الْفُرْقَانَ' }
        ]
      },
      { number: 2, surahNumber: 67, surahName: 'Al-Mulk', text: 'الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا وَهُوَ الْعَزِيزُ الْغَفُورُ', translation: '[He] who created death and life to test you [as to] which of you is best in deed - and He is the Exalted in Might, the Forgiving -',
        mutashabihat: [
          { surahNumber: 11, surahName: 'Hud', ayahNumber: 7, text: 'لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا وَلَئِن قُلْتَ إِنَّكُم مَّبْعُوثُونَ', differenceNote: 'Shared phrase لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا' }
        ]
      },
      { number: 3, surahNumber: 67, surahName: 'Al-Mulk', text: 'الَّذِي خَلَقَ سَبْعَ سَمَاوَاتٍ طِبَاقًا مَّا تَرَىٰ فِي خَلْقِ الرَّحْمَٰنِ مِن تَفَاوُتٍ فَارْجِعِ الْبَصَرَ هَلْ تَرَىٰ مِن فُطُورٍ', translation: '[And] who created seven heavens in layers. You do not see in the creation of the Most Merciful any inconsistency. So return [your] vision; do you see any breaks?' },
      { number: 4, surahNumber: 67, surahName: 'Al-Mulk', text: 'ثُمَّ ارْجِعِ الْبَصَرَ كَرَّتَيْنِ يَنقَلِبْ إِلَيْكَ الْبَصَرُ خَاسِئًا وَهُوَ حَسِيرٌ', translation: 'Then return [your] vision twice again. [Your] vision will return to you humbled while it is fatigued.' },
      { number: 5, surahNumber: 67, surahName: 'Al-Mulk', text: 'وَلَقَدْ زَيَّنَّا السَّمَاءَ الدُّنْيَا بِمَصَابِيحَ وَجَعَلْنَاهَا رُجُومًا لِّلشَّيَاطِينِ وَأَعْتَدْنَا لَهُمْ عَذَابَ السَّعِيرِ', translation: 'And We have certainly beautified the nearest heaven with lamps and have made [from] them what is thrown at the devils and have prepared for them the punishment of the Blaze.',
        mutashabihat: [
          { surahNumber: 41, surahName: 'Fussilat', ayahNumber: 12, text: 'وَزَيَّنَّا السَّمَاءَ الدُّنْيَا بِمَصَابِيحَ وَحِفْظًا', differenceNote: 'Al-Mulk: وَلَقَدْ زَيَّنَّا vs Fussilat: وَزَيَّنَّا' }
        ]
      },
      { number: 6, surahNumber: 67, surahName: 'Al-Mulk', text: 'وَلِلَّذِينَ كَفَرُوا بِرَبِّهِمْ عَذَابُ جَهَنَّمَ وَبِئْسَ الْمَصِيرُ', translation: 'And for those who disbelieved in their Lord is the punishment of Hell, and wretched is the destination.' },
      { number: 7, surahNumber: 67, surahName: 'Al-Mulk', text: 'إِذَا أُلْقُوا فِيهَا سَمِعُوا لَهَا شَهِيقًا وَهِيَ تَفُورُ', translation: 'When they are thrown into it, they hear from it a dreadful inhaling while it boils up.' },
      { number: 8, surahNumber: 67, surahName: 'Al-Mulk', text: 'تَكَادُ تَمَيَّزُ مِنَ الْغَيْظِ كُلَّمَا أُلْقِيَ فِيهَا فَوْجٌ سَأَلَهُمْ خَزَنَتُهَا أَلَمْ يَأْتِكُمْ نَذِيرٌ', translation: 'It almost bursts with rage. Every time a company is thrown into it, its keepers ask them, "Did there not come to you a warner?"' },
      { number: 9, surahNumber: 67, surahName: 'Al-Mulk', text: 'قَالُوا بَلَىٰ قَدْ جَاءَنَا نَذِيرٌ فَكَذَّبْنَا وَقُلْنَا مَا نَزَّلَ اللَّهُ مِن شَيْءٍ إِنْ أَنتُمْ إِلَّا فِي ضَلَالٍ كَبِيرٍ', translation: 'They will say,"Yes, a warner had come to us, but we denied and said, \'Allah has not sent down anything. You are not but in great error.\'"' },
      { number: 10, surahNumber: 67, surahName: 'Al-Mulk', text: 'وَقَالُوا لَوْ كُنَّا نَسْمَعُ أَوْ نَعْقِلُ مَا كُنَّا فِي أَصْحَابِ السَّعِيرِ', translation: 'And they will say, "If only we had been listening or reasoning, we would not be among the companions of the Blaze."' },
      { number: 11, surahNumber: 67, surahName: 'Al-Mulk', text: 'فَاعْتَرَفُوا بِذَنبِهِمْ فَسُحْقًا لِّأَصْحَابِ السَّعِيرِ', translation: 'And they will admit their sin, so [it is] alienation for the companions of the Blaze.' },
      { number: 12, surahNumber: 67, surahName: 'Al-Mulk', text: 'إِنَّ الَّذِينَ يَخْشَوْنَ رَبَّهُم بِالْغَيْبِ لَهُم مَّغْفِرَةٌ وَأَجْرٌ كَبِيرٌ', translation: 'Indeed, those who fear their Lord unseen will have forgiveness and great reward.',
        mutashabihat: [
          { surahNumber: 35, surahName: 'Fatir', ayahNumber: 18, text: 'إِنَّمَا تُنذِرُ الَّذِينَ يَخْشَوْنَ رَبَّهُم بِالْغَيْبِ وَأَقَامُوا الصَّلَاةَ', differenceNote: 'Shared beginning: الَّذِينَ يَخْشَوْنَ رَبَّهُم بِالْغَيْبِ' }
        ]
      },
      { number: 13, surahNumber: 67, surahName: 'Al-Mulk', text: 'وَأَسِرُّوا قَوْلَكُمْ أَوِ اجْهَرُوا بِهِ إِنَّهُ عَلِيمٌ بِذَاتِ الصُّدُورِ', translation: 'And conceal your speech or publicize it; indeed, He is Knowing of that within the breasts.' },
      { number: 14, surahNumber: 67, surahName: 'Al-Mulk', text: 'أَلَا يَعْلَمُ مَنْ خَلَقَ وَهُوَ اللَّطِيفُ الْخَبِيرُ', translation: 'Does He who created not know, while He is the Subtle, the Acquainted?' },
      { number: 15, surahNumber: 67, surahName: 'Al-Mulk', text: 'هُوَ الَّذِي جَعَلَ لَكُمُ الْأَرْضَ ذَلُولًا فَامْشُوا فِي مَنَاكِبِهَا وَكُلُوا مِن رِّزْقِهِ وَإِلَيْهِ النُّشُورُ', translation: 'It is He who made the earth tame for you - so walk among its slopes and eat of His provision - and to Him is the resurrection.' },
      { number: 23, surahNumber: 67, surahName: 'Al-Mulk', text: 'قُلْ هُوَ الَّذِي أَنشَأَكُمْ وَجَعَلَ لَكُمُ السَّمْعَ وَالْأَبْصَارَ وَالْأَفْئِدَةَ قَلِيلًا مَّا تَشْكُرُونَ', translation: 'Say, "It is He who has produced you and made for you hearing and vision and hearts; little are you grateful."' },
      { number: 24, surahNumber: 67, surahName: 'Al-Mulk', text: 'قُلْ هُوَ الَّذِي ذَرَأَكُمْ فِي الْأَرْضِ وَإِلَيْهِ تُحْشَرُونَ', translation: 'Say, "It is He who has multiplied you throughout the earth, and to Him you will be gathered."' },
      { number: 25, surahNumber: 67, surahName: 'Al-Mulk', text: 'وَيَقُولُونَ مَتَىٰ هَٰذَا الْوَعْدُ إِن كُنتُمْ صَادِقِينَ', translation: 'And they say, "When is this promise, if you should be truthful?"',
        mutashabihat: [
          { surahNumber: 36, surahName: 'Ya-Sin', ayahNumber: 48, text: 'وَيَقُولُونَ مَتَىٰ هَٰذَا الْوَعْدُ إِن كُنتُمْ صَادِقِينَ', differenceNote: 'Identical across 6 Surahs: Yunus 48, Al-Anbiya 38, An-Naml 71, Saba 29, Ya-Sin 48, Al-Mulk 25' },
          { surahNumber: 10, surahName: 'Yunus', ayahNumber: 48, text: 'وَيَقُولُونَ مَتَىٰ هَٰذَا الْوَعْدُ إِن كُنتُمْ صَادِقِينَ', differenceNote: 'Identical phrasing - remember next verse starts with قُلْ لَّا أَمْلِكُ in Yunus vs قُلْ إِنَّمَا الْعِلْمُ in Al-Mulk' }
        ]
      },
      { number: 26, surahNumber: 67, surahName: 'Al-Mulk', text: 'قُلْ إِنَّمَا الْعِلْمُ عِندَ اللَّهِ وَإِنَّمَا أَنَا نَذِيرٌ مُّبِينٌ', translation: 'Say, "The knowledge is only with Allah, and I am only a clear warner."' },
      { number: 29, surahNumber: 67, surahName: 'Al-Mulk', text: 'قُلْ هُوَ الرَّحْمَٰنُ آمَنَّا بِهِ وَعَلَيْهِ تَوَكَّلْنَا فَسَتَعْلَمُونَ مَنْ هُوَ فِي ضَلَالٍ مُّبِينٍ', translation: 'Say, "He is the Most Merciful; we have believed in Him, and upon Him we have relied. And you will know who it is that is in clear error."' },
      { number: 30, surahNumber: 67, surahName: 'Al-Mulk', text: 'قُلْ أَرَأَيْتُمْ إِنْ أَصْبَحَ مَاؤُكُمْ غَوْرًا فَمَن يَأْتِيكُم بِمَاءٍ مَّعِينٍ', translation: 'Say, "Have you considered: if your water was to become sunken [into the earth], then who could bring you flowing water?"' }
    ]
  },
  112: {
    number: 112,
    name: 'الإخلاص',
    englishName: 'Al-Ikhlas',
    numberOfAyahs: 4,
    ayahs: [
      { number: 1, surahNumber: 112, surahName: 'Al-Ikhlas', text: 'قُلْ هُوَ اللَّهُ أَحَدٌ', translation: 'Say, "He is Allah, [who is] One,' },
      { number: 2, surahNumber: 112, surahName: 'Al-Ikhlas', text: 'اللَّهُ الصَّمَدُ', translation: 'Allah, the Eternal Refuge.' },
      { number: 3, surahNumber: 112, surahName: 'Al-Ikhlas', text: 'لَمْ يَلِدْ وَلَمْ يُولَدْ', translation: 'He neither begets nor is born,' },
      { number: 4, surahNumber: 112, surahName: 'Al-Ikhlas', text: 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ', translation: 'Nor is there to Him any equivalent."' }
    ]
  },
  113: {
    number: 113,
    name: 'الفلق',
    englishName: 'Al-Falaq',
    numberOfAyahs: 5,
    ayahs: [
      { number: 1, surahNumber: 113, surahName: 'Al-Falaq', text: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ', translation: 'Say, "I seek refuge in the Lord of daybreak' },
      { number: 2, surahNumber: 113, surahName: 'Al-Falaq', text: 'مِن شَرِّ مَا خَلَقَ', translation: 'From the evil of that which He created' },
      { number: 3, surahNumber: 113, surahName: 'Al-Falaq', text: 'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ', translation: 'And from the evil of darkness when it settles' },
      { number: 4, surahNumber: 113, surahName: 'Al-Falaq', text: 'وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ', translation: 'And from the evil of the blowers in knots' },
      { number: 5, surahNumber: 113, surahName: 'Al-Falaq', text: 'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ', translation: 'And from the evil of an envier when he envies."' }
    ]
  },
  114: {
    number: 114,
    name: 'الناس',
    englishName: 'An-Nas',
    numberOfAyahs: 6,
    ayahs: [
      { number: 1, surahNumber: 114, surahName: 'An-Nas', text: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ', translation: 'Say, "I seek refuge in the Lord of mankind,' },
      { number: 2, surahNumber: 114, surahName: 'An-Nas', text: 'مَلِكِ النَّاسِ', translation: 'The Sovereign of mankind,' },
      { number: 3, surahNumber: 114, surahName: 'An-Nas', text: 'إِلَٰهِ النَّاسِ', translation: 'The God of mankind,' },
      { number: 4, surahNumber: 114, surahName: 'An-Nas', text: 'مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ', translation: 'From the evil of the retreating whisperer -' },
      { number: 5, surahNumber: 114, surahName: 'An-Nas', text: 'الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ', translation: 'Who whispers into the breasts of mankind -' },
      { number: 6, surahNumber: 114, surahName: 'An-Nas', text: 'مِنَ الْجِنَّةِ وَالنَّاسِ', translation: 'From among the jinn and mankind."' }
    ]
  }
};

export function normalizeArabic(text: string): string {
  return text
    .replace(/[\u064B-\u065F\u0670]/g, '') // Remove harakat / tashkeel
    .replace(/[أإآء]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[^\u0621-\u064A\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function searchQuranByVoiceOrText(query: string) {
  if (!query || query.trim().length === 0) return [];
  const cleanQ = normalizeArabic(query);
  const qLower = query.toLowerCase().trim();
  const results: Array<{
    surahNumber: number;
    surahName: string;
    ayahNumber: number;
    text: string;
    translation: string;
    confidence: number;
  }> = [];

  for (const surah of Object.values(SURAHS_DATA)) {
    for (const ayah of surah.ayahs) {
      const cleanAyah = normalizeArabic(ayah.text);
      const transLower = ayah.translation.toLowerCase();

      let matchScore = 0;
      if (cleanQ.length > 2 && cleanAyah.includes(cleanQ)) {
        matchScore = Math.round(90 + (cleanQ.length / cleanAyah.length) * 10);
      } else if (cleanQ.length > 2) {
        const qWords = cleanQ.split(' ');
        const matches = qWords.filter(w => w.length > 1 && cleanAyah.includes(w)).length;
        if (matches > 0) {
          matchScore = Math.round((matches / qWords.length) * 85);
        }
      }

      // Check translation or English query
      if (matchScore === 0 && transLower.includes(qLower)) {
        matchScore = 75;
      }

      if (matchScore >= 40) {
        results.push({
          surahNumber: ayah.surahNumber,
          surahName: ayah.surahName,
          ayahNumber: ayah.number,
          text: ayah.text,
          translation: ayah.translation,
          confidence: Math.min(matchScore, 100)
        });
      }
    }
  }

  return results.sort((a, b) => b.confidence - a.confidence);
}
