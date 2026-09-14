import { Ayah, Surah } from '../types';
import { SURAH_LIST } from './surahList';
import { cleanAyahText } from '../utils/quranUtils';

export type DuelCategory = 'Twin Verse' | 'Next Ayah' | 'Missing Word' | 'Identify Surah' | 'Tadabbur & Meaning';
export type DuelDifficulty = 'talib' | 'hafiz' | 'mutqin';

export interface DuelQuestion {
  id: string;
  category: DuelCategory;
  difficulty: DuelDifficulty;
  surahNumber?: number;
  surahName?: string;
  ayahNumber?: number;
  prompt: string;
  arabicSnippet: string;
  surahReference: string;
  translation: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  tadabburPearl?: string;
  estimatedLetters?: number;
}

export interface SincereDua {
  id: string;
  title: string;
  arabic: string;
  translation: string;
  source: string;
  category: 'ilm' | 'hifz' | 'forgiveness' | 'steadfastness' | 'jannah';
}

export const SINCERE_DUAS: SincereDua[] = [
  {
    id: 'dua-1',
    category: 'ilm',
    title: 'Increase in Beneficial Knowledge & Understanding',
    arabic: 'رَّبِّ زِدْنِي عِلْمًا وَارْزُقْنِي فَهْمًا',
    translation: 'My Lord, increase me in knowledge and grant me deep understanding.',
    source: 'Surah Taha (20:114)'
  },
  {
    id: 'dua-2',
    category: 'hifz',
    title: 'Quran as Spring of the Heart & Light',
    arabic: 'اللَّهُمَّ اجْعَلِ الْقُرْآنَ رَبِيعَ قَلْبِي، وَنُورَ صَدْرِي، وَجَلَاءَ حُزْنِي، وَذَهَابَ هَمِّي',
    translation: 'O Allah, make the Quran the spring of my heart, the light of my chest, the banisher of my grief, and the reliever of my anxiety.',
    source: 'Musnad Ahmad (Hadith Sahih)'
  },
  {
    id: 'dua-3',
    category: 'forgiveness',
    title: 'Forgiveness & Mercy for Companion in Faith',
    arabic: 'رَبَّنَا اغْفِرْ لِي وَلِأَخِي وَأَدْخِلْنَا فِي رَحْمَتِكَ ۖ وَأَنتَ أَرْحَمُ الرَّاحِمِينَ',
    translation: 'My Lord, forgive me and my brother and admit us into Your mercy; and You are the most merciful of the merciful.',
    source: 'Surah Al-A\'raf (7:151)'
  },
  {
    id: 'dua-4',
    category: 'steadfastness',
    title: 'Steadfastness in Faith & Hifz',
    arabic: 'يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَىٰ دِينِكَ وَحِفْظِ كِتَابِكَ',
    translation: 'O Turner of the hearts, keep my heart firm upon Your religion and the memorization of Your Book.',
    source: 'Sunan At-Tirmidhi 2140'
  },
  {
    id: 'dua-5',
    category: 'jannah',
    title: 'Gathering Among the People of Quran in Jannah',
    arabic: 'اللَّهُمَّ اجْعَلْنَا وَإِيَّاهُمْ مِنْ أَهْلِ الْقُرْآنِ الَّذِينَ هُمْ أَهْلُكَ وَخَاصَّتُكَ',
    translation: 'O Allah, make us and them among the People of the Quran, who are Your people and Your chosen ones.',
    source: 'Sunan Ibn Majah 215'
  }
];

/**
 * Rich, Challenging Quran Question Bank Covering Surahs Across the Entire Quran
 * 
 * Rules:
 * - Pure Arabic text in options — NO English hints or giveaway descriptions.
 * - Rigorous distractors testing genuine memorization (Hifz), precision of Mutashabihat, and verse sequence.
 */
export const DUEL_QUESTIONS_POOL: DuelQuestion[] = [
  // -------------------------------------------------------------
  // 1. MUTASHABIHAT (Twin Verses) - High Precision & Rigorous Distinction
  // -------------------------------------------------------------
  {
    id: 'tv-1',
    category: 'Twin Verse',
    difficulty: 'mutqin',
    prompt: 'In Surah Al-Baqarah (Ayah 35), what is the precise Quranic wording commanded to Adam and his wife regarding Paradise?',
    arabicSnippet: 'وَقُلْنَا يَا آدَمُ اسْكُنْ أَنتَ وَزَوْجُكَ الْجَنَّةَ وَكُلَا مِنْهَا [...] حَيْثُ شِئْتُمَا',
    surahReference: 'Surah Al-Baqarah (2:35) vs Al-A\'raf (7:19)',
    translation: 'And eat from it bountifully wherever you wish...',
    options: [
      'رَغَدًا',
      'هَنِيئًا',
      'طَيِّبًا',
      'سَائِغًا',
    ],
    correctIndex: 0,
    explanation: 'Surah Al-Baqarah (2:35) specifically includes «رَغَدًا» ("bountifully"): «وَكُلَا مِنْهَا رَغَدًا حَيْثُ شِئْتُمَا», whereas Surah Al-A\'raf (7:19) states: «فَكُلَا مِنْ حَيْثُ شِئْتُمَا» without the word "raghadan".',
    tadabburPearl: 'The addition of «رَغَدًا» in Al-Baqarah honors the initial divine gift, underscoring Allah\'s boundless generosity before any prohibitions were given.',
    estimatedLetters: 42,
  },
  {
    id: 'tv-2',
    category: 'Twin Verse',
    difficulty: 'mutqin',
    prompt: "In Surah Ali 'Imran (Ayah 133), which word begins the command to hasten toward forgiveness and Paradise?",
    arabicSnippet: '[...] إِلَىٰ مَغْفِرَةٍ مِّن رَّبِّكُمْ وَجَنَّةٍ عَرْضُهَا السَّمَاوَاتُ وَالْأَرْضُ أُعِدَّتْ لِلْمُتَّقِينَ',
    surahReference: 'Surah Ali \'Imran (3:133) vs Al-Hadid (57:21)',
    translation: 'And hasten to forgiveness from your Lord...',
    options: [
      'وَسَارِعُوا',
      'سَابِقُوا',
      'فَاسْتَبِقُوا',
      'سَارِعُوا',
    ],
    correctIndex: 0,
    explanation: 'In Ali \'Imran (3:133) the verse opens with the conjunction Waw: «وَسَارِعُوا» ("And hasten"), whereas Surah Al-Hadid (57:21) opens with: «سَابِقُوا إِلَىٰ مَغْفِرَةٍ مِّن رَّبِّكُمْ» ("Race toward forgiveness").',
    tadabburPearl: 'Hastening («وَسَارِعُوا») was an urgent spiritual call following the trials of Uhud, whereas racing («سَابِقُوا») in Al-Hadid is a lifelong striving for the highest stations in the Hereafter.',
    estimatedLetters: 48,
  },
  {
    id: 'tv-3',
    category: 'Twin Verse',
    difficulty: 'mutqin',
    prompt: 'What is the precise Quranic closing for this verse in Surah Al-Anfal (Ayah 61)?',
    arabicSnippet: 'وَإِن جَنَحُوا لِلسَّلْمِ فَاجْنَحْ لَهَا وَتَوَكَّلْ عَلَى اللَّهِ ۚ إِنَّهُ هُوَ [...]',
    surahReference: 'Surah Al-Anfal (8:61)',
    translation: 'And if they incline to peace, then incline to it and rely upon Allah...',
    options: [
      'السَّمِيعُ الْعَلِيمُ',
      'الْعَلِيمُ الْحَكِيمُ',
      'الْغَفُورُ الرَّحِيمُ',
      'الْعَزِيزُ الْحَكِيمُ',
    ],
    correctIndex: 0,
    explanation: 'The closing in Surah Al-Anfal is: «إِنَّهُ هُوَ السَّمِيعُ الْعَلِيمُ» (Indeed, He is the Hearing, the Knowing) — He hears treaties spoken aloud and knows what chests conceal.',
    tadabburPearl: 'When forming covenants and treaties, the believer finds complete tranquil certainty knowing that Allah hears every word and knows every hidden intention.',
    estimatedLetters: 50,
  },
  {
    id: 'tv-4',
    category: 'Twin Verse',
    difficulty: 'hafiz',
    prompt: 'In Surah Al-Bayyinah (Ayah 8), what is the exact wording describing the eternal reward of the righteous?',
    arabicSnippet: 'جَزَاؤُهُمْ عِندَ رَبِّهِمْ جَنَّاتُ عَدْنٍ تَجْرِي مِن تَحْتِهَا الْأَنْهَارُ [...] رَّضِيَ اللَّهُ عَنْهُمْ وَرَضُوا عَنْهُ',
    surahReference: 'Surah Al-Bayyinah (98:8)',
    translation: 'Their reward with their Lord will be gardens of perpetual residence...',
    options: [
      'خَالِدِينَ فِيهَا أَبَدًا',
      'خَالِدِينَ فِيهَا',
      'مَا دَامَتِ السَّمَاوَاتُ وَالْأَرْضُ',
      'لَا يَبْغُونَ عَنْهَا حِوَلًا',
    ],
    correctIndex: 0,
    explanation: 'In Surah Al-Bayyinah (98:8), for the believers Allah specifically added: «خَالِدِينَ فِيهَا أَبَدًا» ("abiding therein forever"), whereas for the deniers in Ayah 6 it states: «خَالِدِينَ فِيهَا» without "abada".',
    tadabburPearl: 'The eternity of Paradise for believers is crowned with Allah\'s everlasting pleasure, after which He shall never be displeased with them.',
    estimatedLetters: 55,
  },
  {
    id: 'tv-5',
    category: 'Twin Verse',
    difficulty: 'mutqin',
    prompt: 'In Surah Al-Baqarah (Ayah 58), how was the command to enter the city phrased compared to Surah Al-A\'raf?',
    arabicSnippet: 'وَإِذْ قُلْنَا [...] الْقَرْيَةَ فَكُلُوا مِنْهَا حَيْثُ شِئْتُمْ رَغَدًا وَادْخُلُوا الْبَابَ سُجَّدًا',
    surahReference: 'Surah Al-Baqarah (2:58) vs Al-A\'raf (7:161)',
    translation: 'And when We said, "Enter this city..."',
    options: [
      'ادْخُلُوا هَٰذِهِ',
      'اسْكُنُوا هَٰذِهِ',
      'ادْخُلُوا تِلْكَ',
      'سِيرُوا فِي هَٰذِهِ',
    ],
    correctIndex: 0,
    explanation: 'In Al-Baqarah (2:58): «وَإِذْ قُلْنَا ادْخُلُوا هَٰذِهِ الْقَرْيَةَ» ("And when We said, Enter this city"), whereas in Al-A\'raf (7:161): «وَإِذْ قِيلَ لَهُمُ اسْكُنُوا هَٰذِهِ الْقَرْيَةَ» ("Dwell in this city").',
    tadabburPearl: 'Entering («ادْخُلُوا») is the initial entry, while dwelling («اسْكُنُوا») is permanent settlement. Each Quranic context reflects supreme linguistic precision.',
    estimatedLetters: 45,
  },
  {
    id: 'tv-6',
    category: 'Twin Verse',
    difficulty: 'mutqin',
    prompt: 'In Surah Yunus (Ayah 2), how did the disbelievers describe the Prophet ﷺ?',
    arabicSnippet: 'أَكَانَ لِلنَّاسِ عَجَبًا أَنْ أَوْحَيْنَا إِلَىٰ رَجُلٍ مِّنْهُمْ... قَالَ الْكَافِرُونَ إِنَّ هَٰذَا [...]',
    surahReference: 'Surah Yunus (10:2) vs Sad (38:4)',
    translation: 'The disbelievers said, "Indeed, this is..."',
    options: [
      'لَسَاحِرٌ مُّبِينٌ',
      'سَاحِرٌ كَذَّابٌ',
      'سِحْرٌ مُّبِينٌ',
      'شَاعِرٌ مَّجْنُونٌ',
    ],
    correctIndex: 0,
    explanation: 'In Surah Yunus (10:2): «إِنَّ هَٰذَا لَسَاحِرٌ مُّبِينٌ» ("Indeed, this is an evident magician"), whereas in Surah Sad (38:4): «وَقَالَ الْكَافِرُونَ هَٰذَا سَاحِرٌ كَذَّابٌ» ("This is a lying sorcerer").',
    tadabburPearl: 'The shifting doubts and fabrications of deniers crumble before the steadfast, luminous clarity of the divine revelation.',
    estimatedLetters: 52,
  },

  // -------------------------------------------------------------
  // 2. NEXT AYAH (Sequence & Continuous Tarteel across Surahs)
  // -------------------------------------------------------------
  {
    id: 'na-1',
    category: 'Next Ayah',
    difficulty: 'talib',
    prompt: 'Which verse immediately follows in Surah Al-Fatihah after:',
    arabicSnippet: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
    surahReference: 'Surah Al-Fatihah (1:6-7)',
    translation: 'Guide us to the straight path.',
    options: [
      'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
      'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
      'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
      'مَالِكِ يَوْمِ الدِّينِ',
    ],
    correctIndex: 0,
    explanation: 'Ayah 7 is the culminating verse of Surah Al-Fatihah, the Mother of the Book: «صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ».',
    tadabburPearl: 'We constantly implore Allah for the path of those favored with both sacred knowledge and righteous action, guarded against anger and straying.',
    estimatedLetters: 45,
  },
  {
    id: 'na-2',
    category: 'Next Ayah',
    difficulty: 'hafiz',
    prompt: 'Which verse immediately follows the opening verse of Surah Al-Mulk?',
    arabicSnippet: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
    surahReference: 'Surah Al-Mulk (67:1-2)',
    translation: 'Blessed is He in whose hand is dominion, and He is over all things competent.',
    options: [
      'الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ الْعَزِيزُ الْغَفُورُ',
      'الَّذِي خَلَقَ سَبْعَ سَمَاوَاتٍ طِبَاقًا ۖ مَّا تَرَىٰ فِي خَلْقِ الرَّحْمَٰنِ مِن تَفَاوُتٍ',
      'وَلَقَدْ زَيَّنَّا السَّمَاءَ الدُّنْيَا بِمَصَابِيحَ وَجَعَلْنَاهَا رُجُومًا لِّلشَّيَاطِينِ',
      'إِنَّ الَّذِينَ يَخْشَوْنَ رَبَّهُم بِالْغَيْبِ لَهُم مَّغْفِرَةٌ وَأَجْرٌ كَبِيرٌ',
    ],
    correctIndex: 0,
    explanation: 'The second verse of Surah Al-Mulk: «الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا» ("[He] who created death and life to test you as to which of you is best in deed").',
    tadabburPearl: 'Life and death are created to test who is best in deed — not merely most in quantity, but most sincere in intention and true to the Sunnah.',
    estimatedLetters: 60,
  },
  {
    id: 'na-3',
    category: 'Next Ayah',
    difficulty: 'hafiz',
    prompt: 'Which concluding verse immediately follows this Ayah in Surah Ya-Sin?',
    arabicSnippet: 'إِنَّمَا أَمْرُهُ إِذَا أَرَادَ شَيْئًا أَن يَقُولَ لَهُ كُن فَيَكُونُ',
    surahReference: 'Surah Ya-Sin (36:82-83)',
    translation: 'His command is only when He intends a thing that He says to it, "Be," and it is.',
    options: [
      'فَسُبْحَانَ الَّذِي بِيَدِهِ مَلَكُوتُ كُلِّ شَيْءٍ وَإِلَيْهِ تُرْجَعُونَ',
      'وَضَرَبَ لَنَا مَثَلًا وَنَسِيَ خَلْقَهُ ۖ قَالَ مَن يُحْيِي الْعِظَامَ وَهِيَ رَمِيمٌ',
      'أَوَلَمْ يَرَ الْإِنسَانُ أَنَّا خَلَقْنَاهُ مِن نُّطْفَةٍ فَإِذَا هُوَ خَصِيمٌ مُّبِينٌ',
      'وَالشَّمْسُ تَجْرِي لِمُسْتَقَرٍّ لَّهَا ۚ ذَٰلِكَ تَقْدِيرُ الْعَزِيزِ الْعَلِيمِ',
    ],
    correctIndex: 0,
    explanation: 'Ayah 83 is the glorious conclusion of Surah Ya-Sin: «فَسُبْحَانَ الَّذِي بِيَدِهِ مَلَكُوتُ كُلِّ شَيْءٍ وَإِلَيْهِ تُرْجَعُونَ» ("So exalted is He in whose hand is the realm of all things, and to Him you will be returned").',
    tadabburPearl: 'Whenever any difficulty weighs upon you, remember «كُن فَيَكُونُ» ("Be, and it is"); in His supreme hand alone resides the dominion of all existence.',
    estimatedLetters: 55,
  },
  {
    id: 'na-4',
    category: 'Next Ayah',
    difficulty: 'mutqin',
    prompt: 'In Surah Al-Kahf, which verse immediately follows after:',
    arabicSnippet: 'إِنَّ الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ كَانَتْ لَهُمْ جَنَّاتُ الْفِرْدَوْسِ نُزُلًا',
    surahReference: 'Surah Al-Kahf (18:107-108)',
    translation: 'Indeed, those who have believed and done righteous deeds - they will have the Gardens of Paradise as a lodging...',
    options: [
      'خَالِدِينَ فِيهَا لَا يَبْغُونَ عَنْهَا حِوَلًا',
      'قُل لَّوْ كَانَ الْبَحْرُ مِدَادًا لِّكَلِمَاتِ رَبِّي لَنَفِدَ الْبَحْرُ',
      'قُلْ إِنَّمَا أَنَا بَشَرٌ مِّثْلُكُمْ يُوحَىٰ إِلَيَّ أَنَّمَا إِلَٰهُكُمْ إِلَٰهٌ وَاحِدٌ',
      'أَفَحَسِبَ الَّذِينَ كَفَرُوا أَن يَتَّخِذُوا عِبَادِي مِن دُونِي أَوْلِيَاءَ',
    ],
    correctIndex: 0,
    explanation: 'Ayah 108 follows: «خَالِدِينَ فِيهَا لَا يَبْغُونَ عَنْهَا حِوَلًا» ("Wherein they abide eternally, they desire no transfer from it").',
    tadabburPearl: 'Unlike worldly luxuries that lose their charm, the inhabitants of Paradise will never tire of its bliss nor desire any change, due to its infinite divine perfection.',
    estimatedLetters: 52,
  },
  {
    id: 'na-5',
    category: 'Next Ayah',
    difficulty: 'mutqin',
    prompt: 'In Surah An-Nur (Ayah 35), which verse immediately follows Ayat An-Nur?',
    arabicSnippet: 'اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ ۚ مَثَلُ نُورِهِ كَمِشْكَاةٍ فِيهَا مِصْبَاحٌ...',
    surahReference: 'Surah An-Nur (24:35-36)',
    translation: 'Allah is the Light of the heavens and the earth...',
    options: [
      'فِي بُيُوتٍ أَذِنَ اللَّهُ أَن تُرْفَعَ وَيُذْكَرَ فِيهَا اسْمُهُ يُسَبِّحُ لَهُ فِيهَا بِالْغُدُوِّ وَالْآصَالِ',
      'رِجَالٌ لَّا تُلْهِيهِمْ تِجَارَةٌ وَلَا بَيْعٌ عَن ذِكْرِ اللَّهِ',
      'وَالَّذِينَ كَفَرُوا أَعْمَالُهُمْ كَسَرَابٍ بِقِيعَةٍ يَحْسَبُهُ الظَّمْآنُ مَاءً',
      'أَوْ كَظُلُمَاتٍ فِي بَحْرٍ لُّجِّيٍّ يَغْشَاهُ مَوْجٌ مِّن فَوْقِهِ مَوْجٌ',
    ],
    correctIndex: 0,
    explanation: 'Ayah 36 continues: «فِي بُيُوتٍ أَذِنَ اللَّهُ أَن تُرْفَعَ وَيُذْكَرَ فِيهَا اسْمُهُ» ("[Such niches are] in houses which Allah has ordered to be raised and that His name be mentioned therein").',
    tadabburPearl: 'The earthly resting place and reflection of that divine light resides in the houses of Allah (the mosques), kept alive through prayer and glorification.',
    estimatedLetters: 65,
  },
  {
    id: 'na-6',
    category: 'Next Ayah',
    difficulty: 'hafiz',
    prompt: 'Which verse immediately follows this Ayah in Surah Al-Furqan?',
    arabicSnippet: 'تَبَارَكَ الَّذِي جَعَلَ فِي السَّمَاءِ بُرُوجًا وَجَعَلَ فِيهَا سِرَاجًا وَقَمَرًا مُّنِيرًا',
    surahReference: 'Surah Al-Furqan (25:61-62)',
    translation: 'Blessed is He who has placed in the sky great stars and placed therein a burning lamp and luminous moon...',
    options: [
      'وَهُوَ الَّذِي جَعَلَ اللَّيْلَ وَالنَّهَارَ خِلْفَةً لِّمَنْ أَرَادَ أَن يَذَّكَّرَ أَوْ أَرَادَ شُكُورًا',
      'وَعِبَادُ الرَّحْمَٰنِ الَّذِينَ يَمْشُونَ عَلَى الْأَرْضِ هَوْنًا',
      'وَالَّذِينَ يَبِيتُونَ لِرَبِّهِمْ سُجَّدًا وَقِيَامًا',
      'وَالَّذِينَ يَقُولُونَ رَبَّنَا اصْرِفْ عَنَّا عَذَابَ جَهَنَّمَ',
    ],
    correctIndex: 0,
    explanation: 'Ayah 62 follows: «وَهُوَ الَّذِي جَعَلَ اللَّيْلَ وَالنَّهَارَ خِلْفَةً لِّمَنْ أَرَادَ أَن يَذَّكَّرَ أَوْ أَرَادَ شُكُورًا» ("And He is who has made the night and the day in succession for whoever desires to remember or desires gratitude").',
    tadabburPearl: 'The constant alternation of night and day is a renewed opportunity for anyone who missed a devotional deed in one to make it up in the other with gratitude and remembrance.',
    estimatedLetters: 58,
  },
  {
    id: 'na-7',
    category: 'Next Ayah',
    difficulty: 'mutqin',
    prompt: 'In Surah Fussilat (Ayah 30), which verse immediately follows:',
    arabicSnippet: 'إِنَّ الَّذِينَ قَالُوا رَبُّنَا اللَّهُ ثُمَّ اسْتَقَامُوا تَتَنَزَّلُ عَلَيْهِمُ الْمَلَائِكَةُ أَلَّا تَخَافُوا وَلَا تَحْزَنُوا...',
    surahReference: 'Surah Fussilat (41:30-31)',
    translation: 'Indeed, those who have said, "Our Lord is Allah" and then remained on a right course...',
    options: [
      'نَحْنُ أَوْلِيَاؤُكُمْ فِي الْحَيَاةِ الدُّنْيَا وَفِي الْآخِرَةِ ۖ وَلَكُمْ فِيهَا مَا تَشْتَهِي أَنفُسُكُمْ',
      'نُزُلًا مِّنْ غَفُورٍ رَّحِيمٍ',
      'وَمَنْ أَحْسَنُ قَوْلًا مِّمَّن دَعَا إِلَى اللَّهِ وَعَمِلَ صَالِحًا',
      'وَلَا تَسْتَوِي الْحَسَنَةُ وَلَا السَّيِّئَةُ ۚ ادْفَعْ بِالَّتِي هِيَ أَحْسَنُ',
    ],
    correctIndex: 0,
    explanation: 'Ayah 31 of Fussilat affirms the angelic glad tidings: «نَحْنُ أَوْلِيَاؤُكُمْ فِي الْحَيَاةِ الدُّنْيَا وَفِي الْآخِرَةِ» ("We were your allies in worldly life and [are so] in the Hereafter").',
    tadabburPearl: 'The fruit of steadfastness (istiqamah) is divine guardianship and angelic companionship that tranquilizes the heart in both life and death.',
    estimatedLetters: 62,
  },

  // -------------------------------------------------------------
  // 3. MISSING WORD (Precision of Harakat & Quranic Vocabulary)
  // -------------------------------------------------------------
  {
    id: 'mw-1',
    category: 'Missing Word',
    difficulty: 'hafiz',
    prompt: 'Complete the missing Quranic word in Ayat al-Kursi (Surah Al-Baqarah 2:255):',
    arabicSnippet: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ [...] وَلَا نَوْمٌ',
    surahReference: 'Surah Al-Baqarah (2:255)',
    translation: 'Neither drowsiness overtakes Him nor sleep...',
    options: ['سِنَةٌ', 'غَفْلَةٌ', 'حَسْرَةٌ', 'فَتْرَةٌ'],
    correctIndex: 0,
    explanation: 'The Quranic word is «سِنَةٌ» (sinah), referring to the initial onset of drowsiness or slumber.',
    tadabburPearl: 'The supreme perfection of Allah\'s self-subsisting sovereignty is that He never slumbers nor sleeps; your prayers and heart are always held in His watchful care.',
    estimatedLetters: 44,
  },
  {
    id: 'mw-2',
    category: 'Missing Word',
    difficulty: 'mutqin',
    prompt: 'Complete the missing Quranic word in Surah Ar-Rahman (Ayah 26):',
    arabicSnippet: 'كُلُّ مَنْ عَلَيْهَا [...] • وَيَبْقَىٰ وَجْهُ رَبِّكَ ذُو الْجَلَالِ وَالْإِكْرَامِ',
    surahReference: 'Surah Ar-Rahman (55:26-27)',
    translation: 'Everyone upon the earth will perish, and there will remain the Face of your Lord...',
    options: ['فَانٍ', 'مَيِّتٌ', 'زَائِلٌ', 'هَالِكٌ'],
    correctIndex: 0,
    explanation: 'Allah declares: «كُلُّ مَنْ عَلَيْهَا فَانٍ» ("Everyone upon it will perish"), reminding all creation that only the Creator endures.',
    tadabburPearl: 'The entire earthly realm is transient; only what is dedicated sincerely to Allah and His noble Face will remain eternally.',
    estimatedLetters: 38,
  },
  {
    id: 'mw-3',
    category: 'Missing Word',
    difficulty: 'talib',
    prompt: 'Complete the missing word in Surah Ash-Sharh (Ayah 5):',
    arabicSnippet: 'فَإِنَّ مَعَ الْعُسْرِ [...] • إِنَّ مَعَ الْعُسْرِ [...]',
    surahReference: 'Surah Ash-Sharh (94:5-6)',
    translation: 'For indeed, with hardship [will be] ease. Indeed, with hardship [will be] ease.',
    options: ['يُسْرًا', 'فَرَجًا', 'خَيْرًا', 'نَصْرًا'],
    correctIndex: 0,
    explanation: 'The Quranic word is: «يُسْرًا» ("ease") in indefinite form, while hardship is definite — meaning one hardship can never defeat two eases.',
    tadabburPearl: 'A reassuring divine promise: every hardship is not merely followed by ease, but is fundamentally intertwined with divine relief and grace.',
    estimatedLetters: 35,
  },
  {
    id: 'mw-4',
    category: 'Missing Word',
    difficulty: 'hafiz',
    prompt: 'What is the missing Quranic word in Surah Al-Hujurat (Ayah 10)?',
    arabicSnippet: 'إِنَّمَا الْمُؤْمِنُونَ [...] فَأَصْلِحُوا بَيْنَ أَخَوَيْكُمْ ۚ وَاتَّقُوا اللَّهَ لَعَلَّكُمْ تُرْحَمُونَ',
    surahReference: 'Surah Al-Hujurat (49:10)',
    translation: 'The believers are but brothers, so make settlement between your brothers...',
    options: ['إِخْوَةٌ', 'أَوْلِيَاءُ', 'أَصْحَابٌ', 'أَحِبَّاءُ'],
    correctIndex: 0,
    explanation: 'The Quran deliberately chooses «إِخْوَةٌ» (the plural form for brothers by blood lineage) to emphasize that the spiritual bond of faith is as intimate and sacred as biological kinship.',
    tadabburPearl: 'The brotherhood of faith is stronger than earthly bloodlines; its sacred duty is active reconciliation, compassion, and protective love for one another.',
    estimatedLetters: 50,
  },
  {
    id: 'mw-5',
    category: 'Missing Word',
    difficulty: 'mutqin',
    prompt: 'Complete the missing word in Surah Adh-Dhariyat (Ayah 56):',
    arabicSnippet: 'وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا [...]',
    surahReference: 'Surah Adh-Dhariyat (51:56)',
    translation: 'And I did not create the jinn and mankind except to worship Me.',
    options: [
      'لِيَعْبُدُونِ',
      'لِيَعْلَمُونِ',
      'لِيَذْكُرُونِ',
      'لِيَشْكُرُونِ',
    ],
    correctIndex: 0,
    explanation: 'The noble verse: «وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ» ("And I did not create the jinn and mankind except to worship Me").',
    tadabburPearl: 'The ultimate purpose behind our existence is the realization of pure Tawhid and sincere worship of Allah alone.',
    estimatedLetters: 36,
  },
  {
    id: 'mw-6',
    category: 'Missing Word',
    difficulty: 'mutqin',
    prompt: 'What is the exact Quranic word describing the hypocrites\' prayer in Surah An-Nisa (Ayah 142)?',
    arabicSnippet: 'إِنَّ الْمُنَافِقِينَ يُخَادِعُونَ اللَّهَ وَهُوَ خَادِعُهُمْ وَإِذَا قَامُوا إِلَى الصَّلَاةِ قَامُوا [...]',
    surahReference: 'Surah An-Nisa (4:142)',
    translation: 'And when they stand for prayer, they stand lazily...',
    options: [
      'كُسَالَىٰ',
      'مُرَائِينَ',
      'مُتَثَاقِلِينَ',
      'لَاهِينَ',
    ],
    correctIndex: 0,
    explanation: 'Describing their posture: «قَامُوا كُسَالَىٰ يُرَاءُونَ النَّاسَ وَلَا يَذْكُرُونَ اللَّهَ إِلَّا قَلِيلًا» ("they stand lazily, to be seen of men, and they remember Allah but little").',
    tadabburPearl: 'Vigor and mindfulness in prayer are true marks of sincere faith, whereas sluggishness is a perilous sign of hypocrisy to be vigilantly avoided.',
    estimatedLetters: 46,
  },
  {
    id: 'mw-7',
    category: 'Missing Word',
    difficulty: 'hafiz',
    prompt: 'In Surah Al-Anbiya (Ayah 87), which word did Yunus (peace be upon him) say from within the darkness?',
    arabicSnippet: 'فَنَادَىٰ فِي الظُّلُمَاتِ أَن لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ [...]',
    surahReference: 'Surah Al-Anbiya (21:87)',
    translation: 'And he called out within the darknesses, "There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers."',
    options: [
      'الظَّالِمِينَ',
      'الْغَافِلِينَ',
      'الْخَاطِئِينَ',
      'النَّادِمِينَ',
    ],
    correctIndex: 0,
    explanation: 'The supplication of Prophet Yunus (peace be upon him): «لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ».',
    tadabburPearl: 'Affirming Tawhid, glorifying Allah\'s perfection, and humbly acknowledging one\'s faults is the master key to deliverance from every sorrow and hardship.',
    estimatedLetters: 42,
  },

  // -------------------------------------------------------------
  // 4. IDENTIFY SURAH (Recognizing Surah by Distinctive Ayahs across 114 Surahs)
  // -------------------------------------------------------------
  {
    id: 'is-1',
    category: 'Identify Surah',
    difficulty: 'hafiz',
    prompt: 'In which Surah of the Holy Quran is this great verse of repentance and forgiveness revealed?',
    arabicSnippet: 'قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا',
    surahReference: 'Surah Az-Zumar (39:53)',
    translation: 'Say, "O My servants who have transgressed against themselves, do not despair of the mercy of Allah..."',
    options: ['Surah Az-Zumar (الزمر)', 'Surah Ghafir (غافر)', 'Surah Fussilat (فصلت)', 'Surah Ash-Shura (الشورى)'],
    correctIndex: 0,
    explanation: 'Ayah 53 of Surah Az-Zumar is recognized by scholars as the most hope-inspiring verse in the entire Quran for repentant souls.',
    tadabburPearl: 'He tenderly addresses them as «يَا عِبَادِيَ» ("O My servants") despite their transgressions, forbidding them from ever despairing of His infinite mercy.',
    estimatedLetters: 62,
  },
  {
    id: 'is-2',
    category: 'Identify Surah',
    difficulty: 'talib',
    prompt: 'In which Surah is this blessed divine oath revealed?',
    arabicSnippet: 'وَالتِّينِ وَالزَّيْتُونِ • وَطُورِ سِينِينَ • وَهَٰذَا الْبَلَدِ الْأَمِينِ',
    surahReference: 'Surah At-Tin (95:1-3)',
    translation: 'By the fig and the olive, and [by] Mount Sinai, and [by] this secure city...',
    options: ['Surah At-Tin (التين)', 'Surah Ash-Sharh (الشرح)', 'Surah Ad-Duha (الضحى)', 'Surah Al-Balad (البلد)'],
    correctIndex: 0,
    explanation: 'The opening of Surah At-Tin swears by the lands of the resolute prophets and the sanctuary of Makkah.',
    tadabburPearl: 'Human beings were created in the upright, noble mould; preserving that pristine spiritual nature is only possible through faith and good deeds.',
    estimatedLetters: 42,
  },
  {
    id: 'is-3',
    category: 'Identify Surah',
    difficulty: 'hafiz',
    prompt: 'In which Surah is this concluding passage containing glorious Names of Allah revealed?',
    arabicSnippet: 'هُوَ اللَّهُ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ الْمَلِكُ الْقُدُّوسُ السَّلَامُ الْمُؤْمِنُ الْمُهَيْمِنُ الْعَزِيزُ الْجَبَّارُ الْمُتَكَبِّرُ',
    surahReference: 'Surah Al-Hashr (59:23)',
    translation: 'He is Allah, other than whom there is no deity, the Sovereign, the Pure, the Perfection...',
    options: ['Surah Al-Hashr (الحشر)', 'Surah Al-Hadid (الحديد)', 'Surah Al-Jumu\'ah (الجمعة)', 'Surah As-Saff (الصف)'],
    correctIndex: 0,
    explanation: 'The conclusion of Surah Al-Hashr gathers a sublime assembly of Allah\'s Most Beautiful Names and Supreme Attributes.',
    tadabburPearl: 'Invoking Allah by His Most Beautiful Names and meditating on their meanings generates profound awe, certainty, and tranquility in the believer\'s heart.',
    estimatedLetters: 60,
  },
  {
    id: 'is-4',
    category: 'Identify Surah',
    difficulty: 'talib',
    prompt: 'In which Surah is the verse "So which of the favors of your Lord would you deny?" repeated 31 times?',
    arabicSnippet: 'فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ',
    surahReference: 'Surah Ar-Rahman (55)',
    translation: 'So which of the favors of your Lord would you deny?',
    options: ['Surah Ar-Rahman (الرحمن)', 'Surah Al-Waqi\'ah (الواقعة)', 'Surah Al-Mulk (الملك)', 'Surah Al-Insan (الإنسان)'],
    correctIndex: 0,
    explanation: 'Surah Ar-Rahman ("The Bride of the Quran") enumerates cosmic wonders, earthly gifts, and the exquisite rewards of Paradise.',
    tadabburPearl: 'Continually contemplating divine blessings inspires enduring gratitude; a heedless heart misses the supreme joy of acknowledging the Benefactor.',
    estimatedLetters: 25,
  },
  {
    id: 'is-5',
    category: 'Identify Surah',
    difficulty: 'mutqin',
    prompt: 'In which Surah is the verse "Has the time not come for those who have believed that their hearts should soften at the remembrance of Allah..." revealed?',
    arabicSnippet: 'أَلَمْ يَأْنِ لِلَّذِينَ آمَنُوا أَن تَخْشَعَ قُلُوبُهُمْ لِذِكْرِ اللَّهِ وَمَا نَزَلَ مِنَ الْحَقِّ...',
    surahReference: 'Surah Al-Hadid (57:16)',
    translation: 'Has the time not come for those who have believed that their hearts should become humbly submissive at the remembrance of Allah...',
    options: ['Surah Al-Hadid (الحديد)', 'Surah Al-Hashr (الحشر)', 'Surah Al-Mumtahanah (الممتحنة)', 'Surah Al-Mujadila (المجادلة)'],
    correctIndex: 0,
    explanation: 'Surah Al-Hadid (Ayah 16) — famously the transformative verse that caused great scholars such as Al-Fudayl ibn \'Iyad to turn completely in repentance to Allah.',
    tadabburPearl: 'A gentle, stirring admonition from the Most Merciful Lord urging His servants to soften their hearts to His revelation before they become hardened.',
    estimatedLetters: 56,
  },
  {
    id: 'is-6',
    category: 'Identify Surah',
    difficulty: 'mutqin',
    prompt: 'In which Surah are the counsels of Luqman to his son ("O my son, establish prayer, enjoin what is right...") revealed?',
    arabicSnippet: 'يَا بُنَيَّ أَقِمِ الصَّلَاةَ وَأْمُرْ بِالْمَعْرُوفِ وَانْهَ عَنِ الْمُنكَرِ وَاصْبِرْ عَلَىٰ مَا أَصَابَكَ...',
    surahReference: 'Surah Luqman (31:17)',
    translation: 'O my son, establish prayer, enjoin what is right, forbid what is wrong, and be patient over what befalls you...',
    options: ['Surah Luqman (لقمان)', 'Surah Al-Isra (الإسراء)', 'Surah Ar-Rum (الروم)', 'Surah Al-Ahqaf (الأحقاف)'],
    correctIndex: 0,
    explanation: 'Surah Luqman (Ayah 17) brings together the fundamental pillars of spiritual grounding, social responsibility, and moral fortitude.',
    tadabburPearl: 'Enjoining good requires patience when facing hardship, and maintaining prayer is the believer\'s essential spiritual fuel for calling others to Allah.',
    estimatedLetters: 58,
  },
  {
    id: 'is-7',
    category: 'Identify Surah',
    difficulty: 'hafiz',
    prompt: 'In which Surah is this great supplication revealed: "Our Lord, grant us from among our wives and offspring comfort to our eyes and make us an example for the righteous"?',
    arabicSnippet: 'وَالَّذِينَ يَقُولُونَ رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
    surahReference: 'Surah Al-Furqan (25:74)',
    translation: 'And those who say, "Our Lord, grant us from among our wives and offspring comfort to our eyes and make us an example for the righteous."',
    options: ['Surah Al-Furqan (الفرقان)', 'Surah Maryam (مريم)', 'Surah An-Nur (النور)', 'Surah Al-Mu\'minun (المؤمنون)'],
    correctIndex: 0,
    explanation: 'This prayer concludes the noble characteristics of the Servants of the Most Merciful (Ibad Ar-Rahman) in Surah Al-Furqan (Ayah 74).',
    tadabburPearl: 'True comfort of the eyes is witnessing your loved ones living in obedience to Allah, and the highest aspiration is to lead in piety rather than worldly status.',
    estimatedLetters: 60,
  },
  {
    id: 'is-8',
    category: 'Identify Surah',
    difficulty: 'mutqin',
    prompt: 'In which Surah is this verse revealed: "Then do they not reflect upon the Quran, or are there locks upon their hearts?"?',
    arabicSnippet: 'أَفَلَا يَتَدَبَّرُونَ الْقُرْآنَ أَمْ عَلَىٰ قُلُوبٍ أَقْفَالُهَا',
    surahReference: 'Surah Muhammad (47:24)',
    translation: 'Then do they not reflect upon the Quran, or are there locks upon [their] hearts?',
    options: ['Surah Muhammad (محمد)', 'Surah Al-Fath (الفتح)', 'Surah Qaf (ق)', 'Surah Al-Hujurat (الحجرات)'],
    correctIndex: 0,
    explanation: 'Surah Muhammad (Ayah 24) presents one of the most powerful Quranic wake-up calls to contemplate the Book of Allah and remove the locks of heedlessness.',
    tadabburPearl: 'Tadabbur (deep contemplation) is the master key that opens the heart; rust, sin, and spiritual neglect are the locks that imprison it.',
    estimatedLetters: 38,
  },

  // -------------------------------------------------------------
  // 5. TADABBUR & THEME (Depth of Meaning without Clues)
  // -------------------------------------------------------------
  {
    id: 'td-1',
    category: 'Tadabbur & Meaning',
    difficulty: 'hafiz',
    prompt: 'In Surah Al-Kahf (Ayah 46), what did Allah describe as "better with your Lord for reward and better for hope"?',
    arabicSnippet: 'الْمَالُ وَالْبَنُونَ زِينَةُ الْحَيَاةِ الدُّنْيَا ۖ [...] خَيْرٌ عِندَ رَبِّكَ ثَوَابًا وَخَيْرٌ أَمَلًا',
    surahReference: 'Surah Al-Kahf (18:46)',
    translation: 'Wealth and children are [but] adornment of the worldly life. But the enduring good deeds are better...',
    options: [
      'الْبَاقِيَاتُ الصَّالِحَاتُ',
      'الْقَنَاطِيرُ الْمُقَنطَرَةُ',
      'الْأَنْعَامُ وَالْحَرْثُ',
      'الْمُلْكُ وَالسُّلْطَانُ',
    ],
    correctIndex: 0,
    explanation: '«الْبَاقِيَاتُ الصَّالِحَاتُ» (The enduring righteous deeds: SubhanAllah, Alhamdulillah, La ilaha illa Allah, Allahu Akbar) are the eternal treasure before Allah.',
    tadabburPearl: 'The fleeting charms of this world will perish, but your righteous deeds and Quranic devotion accompany you into the grave and raise your rank in Paradise.',
    estimatedLetters: 65,
  },
  {
    id: 'td-2',
    category: 'Tadabbur & Meaning',
    difficulty: 'mutqin',
    prompt: 'In Surah Ad-Duha, how did Allah reassure His Prophet ﷺ after the pause in revelation?',
    arabicSnippet: 'مَا وَدَّعَكَ رَبُّكَ وَمَا [...] • وَلَلْآخِرَةُ خَيْرٌ لَّكَ مِنَ الْأُولَىٰ',
    surahReference: 'Surah Ad-Duha (93:3-4)',
    translation: 'Your Lord has not taken leave of you, nor has He detested you...',
    options: [
      'قَلَىٰ',
      'جَفَا',
      'سَلَا',
      'نَسِيَ',
    ],
    correctIndex: 0,
    explanation: 'Allah reassured His Messenger: «مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ» ("Your Lord has not forsaken you, nor does He detest you"), omitting the second pronoun out of supreme honor.',
    tadabburPearl: 'When worldly means fade and loneliness touches you, remember that your Lord has neither forsaken nor detested you; turn to Him and find His immediate closeness.',
    estimatedLetters: 48,
  },
  {
    id: 'td-3',
    category: 'Tadabbur & Meaning',
    difficulty: 'mutqin',
    prompt: 'In Surah Al-Qasas (Ayah 7), what glad tidings are promised to the mother of Musa?',
    arabicSnippet: 'وَأَوْحَيْنَا إِلَىٰ أُمِّ مُوسَىٰ أَنْ أَرْضِعِيهِ ۖ فَإِذَا خِفْتِ عَلَيْهِ فَأَلْقِيهِ فِي الْيَمِّ وَلَا تَخَافِي وَلَا تَحْزَنِي ۖ إِنَّا [...]',
    surahReference: 'Surah Al-Qasas (28:7)',
    translation: 'Indeed, We will return him to you and make him [one] of the messengers...',
    options: [
      'رَادُّوهُ إِلَيْكِ وَجَاعِلُوهُ مِنَ الْمُرْسَلِينَ',
      'عَاصِمُوهُ مِنْ كَيْدِ الْفِرْعَوْنِ',
      'مُنَجُّوهُ وَآتُوهُ حُكْمًا وَعِلْمًا',
      'حَافِظُوهُ وَمُؤْتُوهُ صَرْحًا عَظِيمًا',
    ],
    correctIndex: 0,
    explanation: 'This miraculous verse combines two commands, two prohibitions, two notifications, and two joyous promises in an unmatched rhetorical symmetry.',
    tadabburPearl: 'Unshakable faith in Allah\'s promise allowed Musa\'s mother to place her infant in the surging river, tranquil in the knowledge of the Creator\'s divine protection.',
    estimatedLetters: 68,
  },
];

/**
 * Deterministic pseudo-random number generator (LCG) based on integer seed.
 * Guarantees that challenger and friend receive the EXACT same questions!
 */
export function createSeededRandom(seed: number) {
  let s = Math.abs(seed) || 1;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/**
 * Dynamically generates Quran recall and reflection questions for ANY of the 114 Surahs!
 * Extracts actual verses from the Surah and generates Next Ayah and Missing Word questions
 * with pure Arabic choices and realistic distractors.
 */
export function generateDynamicSurahQuestions(
  surah: Surah,
  difficulty: DuelDifficulty = 'hafiz',
  count: number = 5,
  seed: number = 1001
): DuelQuestion[] {
  const rng = createSeededRandom(seed);
  const ayahs = surah.ayahs || [];
  if (ayahs.length === 0) return [];

  const questions: DuelQuestion[] = [];
  const surahMeta = SURAH_LIST.find((s) => s.number === surah.number) || {
    name: surah.name,
    englishName: surah.englishName,
  };

  // 1. Generate "Next Ayah" questions
  if (ayahs.length >= 2) {
    const maxIdx = ayahs.length - 2;
    const chosenIndices: number[] = [];
    for (let i = 0; i <= maxIdx && chosenIndices.length < count; i++) {
      const idx = Math.floor(rng() * (maxIdx + 1));
      if (!chosenIndices.includes(idx)) chosenIndices.push(idx);
    }

    chosenIndices.forEach((idx) => {
      const currentAyah = ayahs[idx];
      const nextAyah = ayahs[idx + 1];

      // Distractors from other ayahs of this surah
      const distractorAyahs = ayahs
        .filter((_, aIdx) => aIdx !== idx + 1 && aIdx !== idx)
        .sort(() => rng() - 0.5)
        .slice(0, 3);

      const options = [cleanAyahText(nextAyah.text, surah.number, nextAyah.number)];
      distractorAyahs.forEach((d) => options.push(cleanAyahText(d.text, surah.number, d.number)));

      while (options.length < 4) {
        options.push('إِنَّ اللَّهَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ');
      }

      // Shuffle options deterministically
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }

      const correctIndex = options.indexOf(cleanAyahText(nextAyah.text, surah.number, nextAyah.number));

      questions.push({
        id: `dyn-na-${surah.number}-${currentAyah.number}`,
        category: 'Next Ayah',
        difficulty,
        surahNumber: surah.number,
        surahName: surahMeta.englishName,
        ayahNumber: currentAyah.number,
        prompt: `Which verse immediately follows in ${surahMeta.englishName} after Ayah ${currentAyah.number}?`,
        arabicSnippet: cleanAyahText(currentAyah.text, surah.number, currentAyah.number),
        surahReference: `${surahMeta.englishName} (${surah.number}:${currentAyah.number})`,
        translation: currentAyah.translation || '',
        options,
        correctIndex: Math.max(0, correctIndex),
        explanation: `Ayah ${nextAyah.number} immediately follows: «${cleanAyahText(nextAyah.text, surah.number, nextAyah.number)}»`,
        tadabburPearl: `Reflect on the connection between the verses in ${surahMeta.englishName} to deepen memorization.`,
        estimatedLetters: cleanAyahText(currentAyah.text, surah.number, currentAyah.number).replace(/\s+/g, '').length,
      });
    });
  }

  // 2. Generate "Missing Word" questions
  ayahs.forEach((ayah) => {
    if (questions.length >= count * 2) return;
    const words = cleanAyahText(ayah.text, surah.number, ayah.number).split(/\s+/).filter((w) => w.length >= 3);
    if (words.length >= 4) {
      const targetWordIdx = Math.floor(rng() * words.length);
      const targetWord = words[targetWordIdx];
      const maskedText = words.map((w, i) => (i === targetWordIdx ? '[...]' : w)).join(' ');

      // Pick other words as distractors
      const otherWords = words.filter((_, i) => i !== targetWordIdx);
      const distractors = otherWords.slice(0, 3);
      while (distractors.length < 3) {
        distractors.push('عَلِيمٌ');
      }

      const options = [targetWord, ...distractors];
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }

      const correctIndex = options.indexOf(targetWord);

      questions.push({
        id: `dyn-mw-${surah.number}-${ayah.number}`,
        category: 'Missing Word',
        difficulty,
        surahNumber: surah.number,
        surahName: surahMeta.englishName,
        ayahNumber: ayah.number,
        prompt: `Complete the missing Quranic word in ${surahMeta.englishName} (Ayah ${ayah.number}):`,
        arabicSnippet: maskedText,
        surahReference: `${surahMeta.englishName} (${surah.number}:${ayah.number})`,
        translation: ayah.translation || '',
        options,
        correctIndex: Math.max(0, correctIndex),
        explanation: `The correct Quranic word is: «${targetWord}» in Ayah ${ayah.number}.`,
        tadabburPearl: `Every letter in ${surahMeta.englishName} earns tenfold reward; ponder its exact eloquence.`,
        estimatedLetters: cleanAyahText(ayah.text, surah.number, ayah.number).replace(/\s+/g, '').length,
      });
    }
  });

  // Shuffle final list deterministically
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }

  return questions.slice(0, count);
}

/**
 * Main Question Resolver:
 * - If specific Surah is requested and loaded, generate dynamic questions for that Surah.
 * - If "All 114 Surahs" or pool mode, deterministic seeded selection from the rich curated pool.
 * - Uniformly shuffles options across A, B, C, D for both players.
 */
export function getQuestionsBySeed(
  seed: number,
  count: number = 5,
  options?: {
    surahNumber?: number;
    surahData?: Surah;
    difficulty?: DuelDifficulty;
  }
): DuelQuestion[] {
  const rng = createSeededRandom(seed);
  const diff = options?.difficulty || 'hafiz';

  // If specific Surah data is supplied, generate from it
  if (options?.surahData && options.surahData.ayahs?.length > 0) {
    const dynamicQs = generateDynamicSurahQuestions(options.surahData, diff, count, seed);
    if (dynamicQs.length >= count) {
      return dynamicQs;
    }
  }

  // Filter pool by difficulty if specified, otherwise include matching
  let candidatePool = [...DUEL_QUESTIONS_POOL];
  if (options?.surahNumber && options.surahNumber > 0) {
    const surahMatch = candidatePool.filter((q) => q.surahNumber === options.surahNumber);
    if (surahMatch.length >= 3) {
      candidatePool = surahMatch;
    }
  }

  if (diff === 'mutqin') {
    // Bias towards twin verses and hard category
    candidatePool.sort((a, b) => (b.difficulty === 'mutqin' ? 1 : -1));
  }

  // Shuffle candidate pool questions with seed PRNG
  for (let i = candidatePool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [candidatePool[i], candidatePool[j]] = [candidatePool[j], candidatePool[i]];
  }

  const selectedQuestions = candidatePool.slice(0, Math.min(count, candidatePool.length));

  // Crucial: Deterministically shuffle the 4 options for each question so the correct answer
  // is naturally distributed across options 0, 1, 2, and 3 (A, B, C, D) instead of always being at 0
  return selectedQuestions.map((q) => {
    const correctText = q.options[q.correctIndex ?? 0];
    const shuffledOptions = [...q.options];

    for (let i = shuffledOptions.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
    }

    const newCorrectIndex = shuffledOptions.indexOf(correctText);

    return {
      ...q,
      options: shuffledOptions,
      correctIndex: newCorrectIndex >= 0 ? newCorrectIndex : 0,
    };
  });
}

/**
 * Production custom domain configuration:
 * Ensures all challenge and duel invitation links cleanly display the official
 * domain (https://ayahquest.pro.et) rather than cloudflare worker preview subdomains.
 */
export function getAppBaseUrl(): string {
  // If explicitly provided in environment, prioritize it
  const envUrl = (import.meta as any).env?.VITE_PUBLIC_APP_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  // If in browser context:
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    // If running on a workers.dev preview or test subdomain containing personal identifier,
    // seamlessly use the official domain instead so users never see personal names.
    if (hostname.includes('.workers.dev') || hostname.includes('lakin-awel')) {
      return 'https://ayahquest.pro.et';
    }
    return `${window.location.origin}${window.location.pathname}`.replace(/\/+$/, '');
  }

  return 'https://ayahquest.pro.et';
}

/**
 * Generate a friendly Islamic-themed room code (e.g. HIFZ42, NOOR18)
 */
export function generateRoomCode(): string {
  const words = ['HIFZ', 'AYAH', 'NOOR', 'FAJR', 'IMAN', 'HUDA', 'SABA', 'TAHA', 'ADAN', 'SIDQ', 'IKHLAS', 'MULK'];
  const base = words[Math.floor(Math.random() * words.length)];
  const num = Math.floor(10 + Math.random() * 89);
  return `${base}${num}`;
}

/**
 * Telegram Share Formatter:
 * Generates an inspiring, beautifully formatted Islamic Telegram invitation message
 */
export function formatTelegramChallengeMessage(params: {
  challengerName: string;
  surahTitle: string;
  score: number;
  totalQuestions: number;
  timeSeconds: number;
  difficulty: DuelDifficulty;
  challengeUrl: string;
}): string {
  const diffLabel = 
    params.difficulty === 'mutqin' ? '🔴 Mumtaz (Master)' :
    params.difficulty === 'hafiz' ? '🟡 Hafiz (Intermediate)' : '🟢 Talib (Student)';

  const cleanSurahTitle = params.surahTitle
    .replace(' (كامل المصحف)', ' (Complete Quran)')
    .replace('كامل المصحف', 'Complete Quran');

  const sender = params.challengerName && params.challengerName !== 'Companion in Faith'
    ? `${params.challengerName} challenges you`
    : 'I challenge you';

  return (
`✨ *QURAN CHALLENGE — BEAT MY SCORE* ✨
📖 *Quran Memorization & Study Challenge*

Peace be upon you!
${sender} to a friendly competition in the Book of Allah 📖

🎯 *Surah*: ${cleanSurahTitle}
⚡ *Score to Beat*: ${params.score}/${params.totalQuestions} in ${params.timeSeconds}s!
🏆 *Level*: ${diffLabel}

«وَفِي ذَٰلِكَ فَلْيَتَنَافَسِ الْمُتَنَافِسُونَ»
_"And for this let the competitors compete." (Surah Al-Mutaffifin: 26)_

👇 *Tap here to accept my Quran challenge and beat my score:*
${params.challengeUrl}`
  );
}

/**
 * Opens Telegram native share dialog or fallback to clipboard/browser
 */
export function shareToTelegram(url: string, text: string): boolean {
  try {
    const tg = (window as any).Telegram?.WebApp;
    const shareUrl = url 
      ? `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
      : `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`;

    if (tg?.openTelegramLink) {
      tg.openTelegramLink(shareUrl);
      return true;
    }

    if (window.open(shareUrl, '_blank')) {
      return true;
    }

    // Fallback copy if popups are blocked
    navigator.clipboard.writeText(url ? `${text}\n\n${url}` : text);
    return true;
  } catch (err) {
    console.error('Error opening Telegram share:', err);
    try {
      navigator.clipboard.writeText(url ? `${text}\n\n${url}` : text);
      return true;
    } catch {
      return false;
    }
  }
}

export const SINCERE_DUAS_FOR_FRIENDS = SINCERE_DUAS;
