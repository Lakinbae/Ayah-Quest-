/**
 * Quran 1v1 Duel & Friend Challenge Question Bank and Dynamic 114-Surah Generator
 */

import { Surah } from '../types';
import { SURAH_LIST } from './surahList';
import { cleanAyahText } from '../utils/quranUtils';

export type DuelDifficulty = 'talib' | 'hafiz' | 'mutqin';
export type DuelCategory = 
  | 'Next Ayah' 
  | 'Missing Word' 
  | 'Identify Surah' 
  | 'Twin Verse' 
  | 'Tadabbur & Meaning' 
  | 'Verse Sequence';

export interface DuelQuestion {
  id: string;
  category: DuelCategory;
  difficulty: DuelDifficulty;
  surahNumber?: number;
  surahName?: string;
  ayahNumber?: number;
  prompt: string;
  arabicSnippet: string;
  surahReference?: string;
  translation?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  tadabburPearl?: string; // Spiritual lesson/reflection to benefit Muslim friends
  estimatedLetters?: number; // Quranic letters recited for Hasanat calculation
}

export interface SincereDua {
  id: string;
  title: string;
  arabic: string;
  translation: string;
  source?: string;
}

export const SINCERE_DUAS_FOR_FRIENDS: SincereDua[] = [
  {
    id: 'dua-1',
    title: 'Spring of the Heart (ربيع القلب)',
    arabic: 'اللَّهُمَّ اجْعَلِ الْقُرْآنَ الْعَظِيمَ رَبِيعَ قَلْبِهِ، وَنُورَ صَدْرِهِ، وَجَلَاءَ حُزْنِهِ، وَذَهَابَ هَمِّهِ',
    translation: 'O Allah, make the Magnificent Quran the spring of his/her heart, the light of his/her chest, the banisher of his/her grief, and the reliever of his/her anxiety.',
    source: 'Prophet Muhammad ﷺ (Musnad Ahmad)',
  },
  {
    id: 'dua-2',
    title: 'Crown of Nobility (تاج الوقار والرفعة)',
    arabic: 'اللَّهُمَّ ارْفَعْهُ بِالْقُرْآنِ، وَأَلْبِسْ وَالِدَيْهِ تَاجَ الْوَقَارِ، وَاجْعَلْهُ مِنْ أَهْلِ الْقُرْآنِ الَّذِينَ هُمْ أَهْلُكَ وَخَاصَّتُكَ',
    translation: 'O Allah, elevate him/her through the Quran, clothe his/her parents in the Crown of Nobility, and count him/her among the people of the Quran who are Your people and Your chosen ones.',
    source: 'Prophet Muhammad ﷺ (Sunan Ibn Majah)',
  },
  {
    id: 'dua-3',
    title: 'Firm Memorization (تثبيت الحفظ)',
    arabic: 'بَارَكَ اللَّهُ فِيكَ يَا أَخِي، وَثَبَّتَ الْقُرْآنَ فِي صَدْرِكَ، وَرَزَقَكَ الْعَمَلَ بِمُحْكَمِهِ وَالْإِيمَانَ بِمُتَشَابِهِهِ',
    translation: 'May Allah bless you, my dear companion, firmly anchor the Quran in your chest, and grant you adherence to its clear rulings and faith in its allegorical verses.',
    source: 'Supplication for Quran Companions',
  },
  {
    id: 'dua-4',
    title: 'Divine Light in Heart & Senses (دعاء النور)',
    arabic: 'اللَّهُمَّ اجْعَلْ فِي قَلْبِهِ نُورًا، وَفِي سَمْعِهِ نُورًا، وَفِي بَصَرِهِ نُورًا، وَعَنْ يَمِينِهِ نُورًا، وَعَنْ شِمَالِهِ نُورًا، وَاجْعَلْ لَهُ نُورًا',
    translation: 'O Allah, place light in his/her heart, light in his/her hearing, light in his/her sight, light on his/her right, light on his/her left, and make for him/her a light.',
    source: 'Prophet Muhammad ﷺ (Sahih Muslim 763)',
  },
  {
    id: 'dua-5',
    title: 'Deep Understanding of Deen & Quran (الفقه والتأويل)',
    arabic: 'اللَّهُمَّ فَقِّهْهُ فِي الدِّينِ، وَعَلِّمْهُ التَّأْوِيلَ، وَبَارِكْ فِي حِفْظِهِ لِكِتَابِكَ',
    translation: 'O Allah, grant him/her deep understanding in the Religion, teach him/her the interpretation of the Quran, and bless his/her memorization.',
    source: 'Prophetic Dua for Ibn Abbas (Sahih al-Bukhari 143)',
  },
  {
    id: 'dua-6',
    title: 'Steadfastness of Heart (تثبيت القلوب)',
    arabic: 'يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبَهُ عَلَىٰ دِينِكَ وَعَلَىٰ تِلَاوَةِ كِتَابِكَ',
    translation: 'O Turner of the hearts, keep his/her heart steadfast upon Your religion and the regular recitation of Your Book.',
    source: 'Prophet Muhammad ﷺ (Jami at-Tirmidhi 2140)',
  },
  {
    id: 'dua-7',
    title: 'Increase in Beneficial Knowledge (زيادة العلم)',
    arabic: 'رَبِّ زِدْهُ عِلْمًا وَفَهْمًا، وَاجْعَلْ حِفْظَهُ حُجَّةً لَهُ يَوْمَ الْقِيَامَةِ لَا عَلَيْهِ',
    translation: 'O My Lord, increase him/her in knowledge and comprehension, and make his/her memorization a proof for him/her on the Day of Resurrection and not against him/her.',
    source: 'Derived from Surah Taha (20:114) & Prophetic Adab',
  },
  {
    id: 'dua-8',
    title: 'Gathering Under Allah’s Shade (ظل العرش)',
    arabic: 'اللَّهُمَّ اجْمَعْنَا فِي ظِلِّ عَرْشِكَ يَوْمَ لَا ظِلَّ إِلَّا ظِلُّكَ بِمَحَبَّتِنَا لِكِتَابِكَ وَمُدَارَسَتِهِ مَعًا',
    translation: 'O Allah, unite us under the shade of Your Throne on the Day when there is no shade but Yours, through our mutual love and study of Your Book.',
    source: 'Based on 7 shaded in Allah\'s Throne (Sahih al-Bukhari)',
  },
];

/**
 * Curated Pool of Mutashabihat, Tarteel, and Tadabbur Questions
 * Designed to challenge both beginners and advanced Huffaz
 */
export const DUEL_QUESTIONS_POOL: DuelQuestion[] = [
  // 1. MUTASHABIHAT (Twin Verses) - Hard Level
  {
    id: 'tv-1',
    category: 'Twin Verse',
    difficulty: 'mutqin',
    prompt: 'Twin Verse Alert: In Surah Al-Baqarah (2:35), how does Allah command Adam and his wife regarding the bounty of Jannah?',
    arabicSnippet: 'وَكُلَا مِنْهَا رَغَدًا حَيْثُ شِئْتُمَا وَلَا تَقْرَبَا هَٰذِهِ الشَّجَرَةَ',
    surahReference: 'Al-Baqarah (2:35) vs Al-A\'raf (7:19)',
    translation: 'And eat from it bountifully wherever you wish...',
    options: [
      'وَكُلَا مِنْهَا رَغَدًا (Contains "رَغَدًا")',
      'فَكُلَا مِنْ حَيْثُ شِئْتُمَا (Without "رَغَدًا")',
      'وَكُلَا مِمَّا رَزَقَكُمُ اللَّهُ',
      'فَكُلُوا مِن طَيِّبَاتِ مَا رَزَقْنَاكُمْ',
    ],
    correctIndex: 0,
    explanation: 'Surah Al-Baqarah (2:35) adds "رَغَدًا" (abundantly), while Surah Al-A\'raf (7:19) says "فَكُلَا مِنْ حَيْثُ شِئْتُمَا" without "رَغَدًا".',
    tadabburPearl: 'Al-Baqarah honors Adam with lavish bounty (رغداً), highlighting Allah\'s boundless generosity before testing his obedience.',
    estimatedLetters: 42,
  },
  {
    id: 'tv-2',
    category: 'Twin Verse',
    difficulty: 'mutqin',
    prompt: 'Twin Verse: In Surah Al-Imran (3:133), how does the call to hasten towards forgiveness begin?',
    arabicSnippet: 'وَسَارِعُوا إِلَىٰ مَغْفِرَةٍ مِّن رَّبِّكُمْ وَجَنَّةٍ عَرْضُهَا السَّمَاوَاتُ وَالْأَرْضُ',
    surahReference: 'Al-Imran (3:133) vs Al-Hadid (57:21)',
    translation: 'And hasten to forgiveness from your Lord and a garden as wide as the heavens and earth...',
    options: [
      'وَسَارِعُوا (And hasten - with "Waw")',
      'سَابِقُوا (Race/Compete - in Surah Al-Hadid)',
      'فَاسْتَبِقُوا (So race towards)',
      'سَارِعُوا (Hasten - without "Waw")',
    ],
    correctIndex: 0,
    explanation: 'Surah Al-Imran begins with "وَسَارِعُوا", whereas Surah Al-Hadid (57:21) commands "سَابِقُوا إِلَىٰ مَغْفِرَةٍ".',
    tadabburPearl: 'Al-Imran addresses the believers after Uhud urging quick return to Allah\'s mercy; Al-Hadid invites all mankind into a competition for eternity.',
    estimatedLetters: 48,
  },
  {
    id: 'tv-3',
    category: 'Twin Verse',
    difficulty: 'mutqin',
    prompt: 'Twin Verse: In Surah Al-Mulk (67:29), how does the Prophet ﷺ tell the deniers they will find out their state?',
    arabicSnippet: 'قُلْ هُوَ الرَّحْمَٰنُ آمَنَّا بِهِ وَعَلَيْهِ تَوَكَّلْنَا فَسَتَعْلَمُونَ مَنْ هُوَ فِي...',
    surahReference: 'Al-Mulk (67:29)',
    translation: 'Say, "He is the Most Merciful; we have believed in Him..."',
    options: [
      'ضَلَالٍ مُّبِينٍ',
      'عَذَابٍ مُّهِينٍ',
      'خُسْرَانٍ مُّبِينٍ',
      'شَكٍّ مُّرِيبٍ',
    ],
    correctIndex: 0,
    explanation: 'Surah Al-Mulk 29 concludes with "ضَلَالٍ مُّبِينٍ", emphasizing their clear loss of true guidance.',
    tadabburPearl: 'Trust in Ar-Rahman yields inner serenity even when surrounded by doubt and opposition.',
    estimatedLetters: 58,
  },
  {
    id: 'tv-4',
    category: 'Twin Verse',
    difficulty: 'mutqin',
    prompt: 'Which twin ending closes this verse in Surah Al-Anfal (8:61): "وَإِن جَنَحُوا لِلسَّلْمِ فَاجْنَحْ لَهَا وَتَوَكَّلْ عَلَى اللَّهِ إِنَّهُ هُوَ..."?',
    arabicSnippet: 'وَإِن جَنَحُوا لِلسَّلْمِ فَاجْنَحْ لَهَا وَتَوَكَّلْ عَلَى اللَّهِ ۚ إِنَّهُ هُوَ...',
    surahReference: 'Al-Anfal (8:61)',
    translation: 'And if they incline to peace, then incline to it [also] and rely upon Allah...',
    options: [
      'السَّمِيعُ الْعَلِيمُ',
      'الْعَلِيمُ الْحَكِيمُ',
      'الْغَفُورُ الرَّحِيمُ',
      'الْعَزِيزُ الْحَكِيمُ',
    ],
    correctIndex: 0,
    explanation: 'It ends with "السَّمِيعُ الْعَلِيمُ" (The All-Hearing, All-Knowing) because Allah hears their treaties and knows their inner intentions.',
    tadabburPearl: 'When pursuing peace, trust in Allah; He hears the words spoken and knows the secret motives within hearts.',
    estimatedLetters: 50,
  },
  {
    id: 'tv-5',
    category: 'Twin Verse',
    difficulty: 'hafiz',
    prompt: 'Twin Verse: Does Surah Al-Bayyinah (98:8) mention "خَالِدِينَ فِيهَا أَبَدًا" or "خَالِدِينَ فِيهَا" alone for the righteous?',
    arabicSnippet: 'جَزَاؤُهُمْ عِندَ رَبِّهِمْ جَنَّاتُ عَدْنٍ تَجْرِي مِن تَحْتِهَا الْأَنْهَارُ...',
    surahReference: 'Al-Bayyinah (98:8)',
    translation: 'Their reward with their Lord will be gardens of perpetual residence...',
    options: [
      'خَالِدِينَ فِيهَا أَبَدًا (Includes "أَبَدًا")',
      'خَالِدِينَ فِيهَا (Without "أَبَدًا")',
      'مَا دَامَتِ السَّمَاوَاتُ وَالْأَرْضُ',
      'لَا يَبْغُونَ عَنْهَا حِوَلًا',
    ],
    correctIndex: 0,
    explanation: 'Surah Al-Bayyinah (98:8) explicitly adds "أَبَدًا" for the believers: "خَالِدِينَ فِيهَا أَبَدًا رَّضِيَ اللَّهُ عَنْهُمْ وَرَضُوا عَنْهُ".',
    tadabburPearl: 'The pleasure of Allah (رضوان الله) is the greatest eternal gift of Jannah.',
    estimatedLetters: 65,
  },

  // 2. NEXT AYAH (Tarteel & Memorization Sequence)
  {
    id: 'na-1',
    category: 'Next Ayah',
    difficulty: 'talib',
    prompt: 'Which Ayah comes immediately NEXT in Surah Al-Fatihah?',
    arabicSnippet: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
    surahReference: 'Al-Fatihah (1:6)',
    translation: 'Guide us to the straight path.',
    options: [
      'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
      'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
      'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
      'مَالِكِ يَوْمِ الدِّينِ',
    ],
    correctIndex: 0,
    explanation: 'Ayah 7 completes Surah Al-Fatihah right after verse 6.',
    tadabburPearl: 'We ask for the path of those favored with guidance, knowledge, and righteous action, avoiding anger and misguidance.',
    estimatedLetters: 45,
  },
  {
    id: 'na-2',
    category: 'Next Ayah',
    difficulty: 'hafiz',
    prompt: 'What is the NEXT verse after the opening of Surah Al-Mulk?',
    arabicSnippet: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
    surahReference: 'Al-Mulk (67:1)',
    translation: 'Blessed is He in whose hand is dominion, and He is over all things competent.',
    options: [
      'الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا',
      'الَّذِي خَلَقَ سَبْعَ سَمَاوَاتٍ طِبَاقًا',
      'وَلَقَدْ زَيَّنَّا السَّمَاءَ الدُّنْيَا بِمَصَابِيحَ',
      'إِنَّ الَّذِينَ يَخْشَوْنَ رَبَّهُم بِالْغَيْبِ',
    ],
    correctIndex: 0,
    explanation: 'Ayah 2 of Surah Al-Mulk begins: الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا.',
    tadabburPearl: 'Life and death were created with purpose: not for who does the most work, but who does the BEST (أحسن عملاً) with sincerity and accordance with the Sunnah.',
    estimatedLetters: 60,
  },
  {
    id: 'na-3',
    category: 'Next Ayah',
    difficulty: 'hafiz',
    prompt: 'Which Ayah follows this majestic verse from Surah Ya-Sin?',
    arabicSnippet: 'إِنَّمَا أَمْرُهُ إِذَا أَرَادَ شَيْئًا أَن يَقُولَ لَهُ كُن فَيَكُونُ',
    surahReference: 'Ya-Sin (36:82)',
    translation: 'His command is only when He intends a thing that He says to it, "Be," and it is.',
    options: [
      'فَسُبْحَانَ الَّذِي بِيَدِهِ مَلَكُوتُ كُلِّ شَيْءٍ وَإِلَيْهِ تُرْجَعُونَ',
      'وَضَرَبَ لَنَا مَثَلًا وَنَسِيَ خَلْقَهُ',
      'أَوَلَمْ يَرَ الْإِنسَانُ أَنَّا خَلَقْنَاهُ مِن نُّطْفَةٍ',
      'وَالشَّمْسُ تَجْرِي لِمُسْتَقَرٍّ لَّهَا',
    ],
    correctIndex: 0,
    explanation: 'Ayah 83 seals Surah Ya-Sin with the ultimate glorification of Allah\'s absolute sovereignty.',
    tadabburPearl: 'Whenever you feel helpless, remember "Kun Fayakun" (كن فيكون); no matter is difficult for the Creator of the cosmos.',
    estimatedLetters: 55,
  },
  {
    id: 'na-4',
    category: 'Next Ayah',
    difficulty: 'talib',
    prompt: 'What follows the opening of Surah An-Nasr?',
    arabicSnippet: 'إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ',
    surahReference: 'An-Nasr (110:1)',
    translation: 'When the victory of Allah has come and the conquest...',
    options: [
      'وَرَأَيْتَ النَّاسَ يَدْخُلُونَ فِي دِينِ اللَّهِ أَفْوَاجًا',
      'فَسَبِّحْ بِحَمْدِ رَبِّكَ وَاسْتَغْفِرْهُ',
      'قُلْ هُوَ اللَّهُ أَحَدٌ',
      'تَبَّتْ يَدَا أَبِي لَهَبٍ وَتَبَّ',
    ],
    correctIndex: 0,
    explanation: 'Ayah 2 is: وَرَأَيْتَ النَّاسَ يَدْخُلُونَ فِي دِينِ اللَّهِ أَفْوَاجًا.',
    tadabburPearl: 'Great victories in Islam culminate in humble glorification and Istighfar, not arrogant celebration.',
    estimatedLetters: 40,
  },
  {
    id: 'na-5',
    category: 'Next Ayah',
    difficulty: 'mutqin',
    prompt: 'In Surah Al-Kahf, which verse immediately follows: "إِنَّ الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ كَانَتْ لَهُمْ جَنَّاتُ الْفِرْدَوْسِ نُزُلًا"?',
    arabicSnippet: 'إِنَّ الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ كَانَتْ لَهُمْ جَنَّاتُ الْفِرْدَوْسِ نُزُلًا',
    surahReference: 'Al-Kahf (18:107)',
    translation: 'Indeed, those who have believed and done righteous deeds - they will have the Gardens of Paradise as a lodging...',
    options: [
      'خَالِدِينَ فِيهَا لَا يَبْغُونَ عَنْهَا حِوَلًا',
      'قُل لَّوْ كَانَ الْبَحْرُ مِدَادًا لِّكَلِمَاتِ رَبِّي',
      'قُلْ إِنَّمَا أَنَا بَشَرٌ مِّثْلُكُمْ يُوحَىٰ إِلَيَّ',
      'أَفَحَسِبَ الَّذِينَ كَفَرُوا أَن يَتَّخِذُوا عِبَادِي',
    ],
    correctIndex: 0,
    explanation: 'Ayah 108 is: خَالِدِينَ فِيهَا لَا يَبْغُونَ عَنْهَا حِوَلًا (Abiding therein; they desire no transfer from it).',
    tadabburPearl: 'In this dunya, humans get bored of repeated luxuries; but in Firdaus, one will never desire any replacement or change forever.',
    estimatedLetters: 52,
  },

  // 3. MISSING WORD (Precision of Harakat and Word Choice)
  {
    id: 'mw-1',
    category: 'Missing Word',
    difficulty: 'hafiz',
    prompt: 'Complete the missing word in Surah Al-Baqarah (2:255 - Ayat al-Kursi):',
    arabicSnippet: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ [...] وَلَا نَوْمٌ',
    surahReference: 'Al-Baqarah (2:255)',
    translation: 'Neither drowsiness overtakes Him nor sleep...',
    options: ['سِنَةٌ', 'غَفْلَةٌ', 'حَسْرَةٌ', 'فَتْرَةٌ'],
    correctIndex: 0,
    explanation: 'The word is "سِنَةٌ" (sinah: slumber/drowsiness).',
    tadabburPearl: 'Allah never tires or sleeps for a single instant, which is why your Dua is never left unattended.',
    estimatedLetters: 44,
  },
  {
    id: 'mw-2',
    category: 'Missing Word',
    difficulty: 'mutqin',
    prompt: 'Complete the precise word in Surah Ar-Rahman: "كُلُّ مَنْ عَلَيْهَا [...] • وَيَبْقَىٰ وَجْهُ رَبِّكَ ذُو الْجَلَالِ وَالْإِكْرَامِ":',
    arabicSnippet: 'كُلُّ مَنْ عَلَيْهَا [...] • وَيَبْقَىٰ وَجْهُ رَبِّكَ ذُو الْجَلَالِ وَالْإِكْرَامِ',
    surahReference: 'Ar-Rahman (55:26-27)',
    translation: 'Everyone upon the earth will perish, and there will remain the Face of your Lord...',
    options: ['فَانٍ', 'مَيِّتٌ', 'زَائِلٌ', 'هَالِكٌ'],
    correctIndex: 0,
    explanation: 'The Quran says "كُلُّ مَنْ عَلَيْهَا فَانٍ".',
    tadabburPearl: 'All creation is fleeting; only deeds done seeking the Face of Allah will remain and carry eternal value.',
    estimatedLetters: 38,
  },
  {
    id: 'mw-3',
    category: 'Missing Word',
    difficulty: 'talib',
    prompt: 'Complete the missing word in Surah Ash-Sharh:',
    arabicSnippet: 'فَإِنَّ مَعَ الْعُسْرِ [...] • إِنَّ مَعَ الْعُسْرِ [...]',
    surahReference: 'Ash-Sharh (94:5-6)',
    translation: 'For indeed, with hardship [will be] ease. Indeed, with hardship [will be] ease.',
    options: ['يُسْرًا', 'فَرَجًا', 'خَيْرًا', 'نَصْرًا'],
    correctIndex: 0,
    explanation: 'The word is "يُسْرًا" (ease).',
    tadabburPearl: 'The definite hardship (الـعسر) is accompanied by two undefined, manifold eases (يسراً), meaning one hardship can never defeat two eases.',
    estimatedLetters: 35,
  },
  {
    id: 'mw-4',
    category: 'Missing Word',
    difficulty: 'hafiz',
    prompt: 'Complete the word in Surah Al-Hujurat (49:10): "إِنَّمَا الْمُؤْمِنُونَ [...] فَأَصْلِحُوا بَيْنَ أَخَوَيْكُمْ"',
    arabicSnippet: 'إِنَّمَا الْمُؤْمِنُونَ [...] فَأَصْلِحُوا بَيْنَ أَخَوَيْكُمْ ۚ وَاتَّقُوا اللَّهَ لَعَلَّكُمْ تُرْحَمُونَ',
    surahReference: 'Al-Hujurat (49:10)',
    translation: 'The believers are but brothers, so make settlement between your brothers...',
    options: ['إِخْوَةٌ', 'أَوْلِيَاءُ', 'أَصْحَابٌ', 'أَحِبَّاءُ'],
    correctIndex: 0,
    explanation: 'The word is "إِخْوَةٌ" (brothers).',
    tadabburPearl: 'Islamic brotherhood is stronger than blood ties, bounded by mutual care, reconciliation, and mercy.',
    estimatedLetters: 50,
  },

  // 4. TADABBUR & THEME (Connecting with Deep Meaning)
  {
    id: 'td-1',
    category: 'Tadabbur & Meaning',
    difficulty: 'hafiz',
    prompt: 'In Surah Al-Kahf (18:46), what is described as "خير عند ربك ثوابا وخير أملا" (better with your Lord for reward and better for hope)?',
    arabicSnippet: 'الْمَالُ وَالْبَنُونَ زِينَةُ الْحَيَاةِ الدُّنْيَا ۖ وَالْبَاقِيَاتُ الصَّالِحَاتُ خَيْرٌ عِندَ رَبِّكَ ثَوَابًا وَخَيْرٌ أَمَلًا',
    surahReference: 'Al-Kahf (18:46)',
    translation: 'Wealth and children are [but] adornment of the worldly life. But the enduring good deeds are better...',
    options: [
      'الْبَاقِيَاتُ الصَّالِحَاتُ (Enduring Good Deeds)',
      'الْقَنَاطِيرُ الْمُقَنطَرَةُ',
      'الْأَنْعَامُ وَالْحَرْثُ',
      'الْمُلْكُ وَالسُّلْطَانُ',
    ],
    correctIndex: 0,
    explanation: 'Al-Baqiyat As-Salihat (SubhanAllah, Alhamdulillah, La ilaha illa Allah, Allahu Akbar) outlast all worldly riches.',
    tadabburPearl: 'Remembrance of Allah is an investment that outlives our bank accounts and houses.',
    estimatedLetters: 65,
  },
  {
    id: 'td-2',
    category: 'Tadabbur & Meaning',
    difficulty: 'talib',
    prompt: 'Which Surah is described by the Prophet ﷺ as equivalent to one-third of the Quran due to its pure declaration of Tawheed?',
    arabicSnippet: 'قُلْ هُوَ اللَّهُ أَحَدٌ • اللَّهُ الصَّمَدُ',
    surahReference: 'Al-Ikhlas (112)',
    translation: 'Say, "He is Allah, [who is] One. Allah, the Eternal Refuge."',
    options: ['Al-Ikhlas (112)', 'Al-Falaq (113)', 'Al-Kafirun (109)', 'Al-Fatihah (1)'],
    correctIndex: 0,
    explanation: 'Surah Al-Ikhlas encapsulates pure Monotheism and is equivalent to one third of the Quran.',
    tadabburPearl: 'Reciting Al-Ikhlas with true contemplation aligns the heart with the ultimate purpose of our existence.',
    estimatedLetters: 32,
  },
  {
    id: 'td-3',
    category: 'Tadabbur & Meaning',
    difficulty: 'mutqin',
    prompt: 'What was the central comfort given to the Prophet ﷺ in Surah Ad-Duha when the revelation temporarily paused?',
    arabicSnippet: 'مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ • وَلَلْآخِرَةُ خَيْرٌ لَّكَ مِنَ الْأُولَىٰ',
    surahReference: 'Ad-Duha (93:3-4)',
    translation: 'Your Lord has not taken leave of you, nor has He detested [you]. And the Hereafter is better for you than the first [life].',
    options: [
      'مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ (Your Lord hasn\'t forsaken nor hated you)',
      'إِنَّا فَتَحْنَا لَكَ فَتْحًا مُّبِينًا',
      'فَلَا تُطِعِ الْمُكَذِّبِينَ',
      'وَلَا تَمْنُن تَسْتَكْثِرُ',
    ],
    correctIndex: 0,
    explanation: 'Allah assured the Prophet ﷺ that His love and care never ceased.',
    tadabburPearl: 'Whenever you feel distant or in a spiritual slump, remember Allah has not abandoned you; turn back to Him with patience.',
    estimatedLetters: 48,
  },

  // 5. IDENTIFY SURAH (Theme & Distinctive Verses)
  {
    id: 'is-1',
    category: 'Identify Surah',
    difficulty: 'talib',
    prompt: 'In which Surah is this famous ayah of repentance: "قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ"?',
    arabicSnippet: 'قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا',
    surahReference: 'Az-Zumar (39:53)',
    translation: 'Say, "O My servants who have transgressed against themselves, do not despair of the mercy of Allah..."',
    options: ['Az-Zumar (39)', 'Ghafir (40)', 'Fussilat (41)', 'Ash-Shura (42)'],
    correctIndex: 0,
    explanation: 'Ayah 53 of Surah Az-Zumar is hailed as the most hope-inspiring verse in the Quran.',
    tadabburPearl: 'Allah addresses sinners tenderly as "My servants" (يا عبادي), assuring that no sin is greater than His boundless pardon.',
    estimatedLetters: 62,
  },
  {
    id: 'is-2',
    category: 'Identify Surah',
    difficulty: 'hafiz',
    prompt: 'Which Surah opens with an oath by five divine manifestations: "وَالتِّينِ وَالزَّيْتُونِ • وَطُورِ سِينِينَ • وَهَٰذَا الْبَلَدِ الْأَمِينِ"?',
    arabicSnippet: 'وَالتِّينِ وَالزَّيْتُونِ • وَطُورِ سِينِينَ • وَهَٰذَا الْبَلَدِ الْأَمِينِ',
    surahReference: 'At-Tin (95)',
    translation: 'By the fig and the olive, and [by] Mount Sinai, and [by] this secure city [Makkah]...',
    options: ['At-Tin (95)', 'Ash-Sharh (94)', 'Ad-Duha (93)', 'Al-Balad (90)'],
    correctIndex: 0,
    explanation: 'Surah At-Tin references the holy lands of Ibrahim, Musa, Isa, and Muhammad ﷺ.',
    tadabburPearl: 'Human beings are molded in the finest proportion (أحسن تقويم); our dignity is preserved only when upholding faith and virtue.',
    estimatedLetters: 42,
  },
  {
    id: 'is-3',
    category: 'Identify Surah',
    difficulty: 'hafiz',
    prompt: 'Which Surah contains the magnificent conclusion: "هُوَ اللَّهُ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ الْمَلِكُ الْقُدُّوسُ السَّلَامُ الْمُؤْمِنُ الْمُهَيْمِنُ الْعَزِيزُ الْجَبَّارُ الْمُتَكَبِّرُ"?',
    arabicSnippet: 'هُوَ اللَّهُ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ الْمَلِكُ الْقُدُّوسُ السَّلَامُ الْمُؤْمِنُ الْمُهَيْمِنُ...',
    surahReference: 'Al-Hashr (59:23)',
    translation: 'He is Allah, other than whom there is no deity, the Sovereign, the Pure, the Perfection, the Bestower of Faith...',
    options: ['Al-Hashr (59)', 'Al-Hadid (57)', 'Al-Jumu\'ah (62)', 'As-Saff (61)'],
    correctIndex: 0,
    explanation: 'The final verses of Surah Al-Hashr contain a rich concentration of the Most Beautiful Names of Allah (Asma ul Husna).',
    tadabburPearl: 'Calling upon Allah with His Asma ul-Husna softens the soul and establishes true reverence in prayer.',
    estimatedLetters: 60,
  },
  {
    id: 'is-4',
    category: 'Identify Surah',
    difficulty: 'talib',
    prompt: 'Which Surah repeats the rhythmic warning "فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ" thirty-one times?',
    arabicSnippet: 'فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ',
    surahReference: 'Ar-Rahman (55)',
    translation: 'So which of the favors of your Lord would you deny?',
    options: ['Ar-Rahman (55)', 'Al-Waqi\'ah (56)', 'Al-Mulk (67)', 'Al-Insan (76)'],
    correctIndex: 0,
    explanation: 'Surah Ar-Rahman highlights both physical and spiritual blessings across the cosmos.',
    tadabburPearl: 'Counting blessings brings contentment; ungratefulness blindfolds the soul from everyday miracles.',
    estimatedLetters: 25,
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
 * Extracts actual verses from the Surah and generates Next Ayah, Missing Word, and Sequence questions.
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
    // Pick indices deterministically
    const chosenIndices: number[] = [];
    for (let i = 0; i <= maxIdx && chosenIndices.length < 3; i++) {
      const idx = Math.floor(rng() * (maxIdx + 1));
      if (!chosenIndices.includes(idx)) chosenIndices.push(idx);
    }

    chosenIndices.forEach((idx) => {
      const currentAyah = ayahs[idx];
      const nextAyah = ayahs[idx + 1];

      // Generate 3 plausible distractors from other ayahs in this surah or similar surahs
      const distractorAyahs = ayahs
        .filter((_, aIdx) => aIdx !== idx + 1 && aIdx !== idx)
        .sort(() => rng() - 0.5)
        .slice(0, 3);

      const options = [cleanAyahText(nextAyah.text)];
      distractorAyahs.forEach((d) => options.push(cleanAyahText(d.text)));

      // If we don't have enough distractors, fill with generic well-known ayahs
      while (options.length < 4) {
        options.push('إِنَّ اللَّهَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ');
      }

      // Shuffle options with seed
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }

      const correctIndex = options.indexOf(cleanAyahText(nextAyah.text));

      questions.push({
        id: `dyn-na-${surah.number}-${currentAyah.number}`,
        category: 'Next Ayah',
        difficulty,
        surahNumber: surah.number,
        surahName: surahMeta.englishName,
        ayahNumber: currentAyah.number,
        prompt: `In ${surahMeta.englishName} (${surah.number}), what is the NEXT verse after ayah ${currentAyah.number}?`,
        arabicSnippet: cleanAyahText(currentAyah.text),
        surahReference: `${surahMeta.englishName} (${surah.number}:${currentAyah.number})`,
        translation: currentAyah.translation || '',
        options,
        correctIndex: Math.max(0, correctIndex),
        explanation: `Ayah ${nextAyah.number} immediately follows: "${cleanAyahText(nextAyah.text)}"`,
        tadabburPearl: `Recite both verses continuously to connect the divine thought-flow in ${surahMeta.englishName}.`,
        estimatedLetters: cleanAyahText(currentAyah.text).replace(/\s+/g, '').length,
      });
    });
  }

  // 2. Generate "Missing Word" questions
  ayahs.forEach((ayah) => {
    if (questions.length >= count * 2) return;
    const words = cleanAyahText(ayah.text).split(' ').filter((w) => w.length >= 3);
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
        prompt: `Complete the missing word in ${surahMeta.englishName} (${surah.number}:${ayah.number}):`,
        arabicSnippet: maskedText,
        surahReference: `${surahMeta.englishName} (${surah.number}:${ayah.number})`,
        translation: ayah.translation || '',
        options,
        correctIndex: Math.max(0, correctIndex),
        explanation: `The accurate word is "${targetWord}" from ayah ${ayah.number}.`,
        tadabburPearl: `Every single letter in ${surahMeta.englishName} carries 10 Hasanat. Pay close attention to subtle voweling!`,
        estimatedLetters: cleanAyahText(ayah.text).replace(/\s+/g, '').length,
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

  // Shuffle with seed PRNG
  for (let i = candidatePool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [candidatePool[i], candidatePool[j]] = [candidatePool[j], candidatePool[i]];
  }

  return candidatePool.slice(0, Math.min(count, candidatePool.length));
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
    params.difficulty === 'mutqin' ? '🔴 ممتاز (Mumtaz Master)' :
    params.difficulty === 'hafiz' ? '🟡 حافظ (Hafiz Intermediate)' : '🟢 طالب (Talib Student)';

  return (
`✨ *تَحَدِّي حِفْظِ وَتَدَبُّرِ القُرْآنِ الكَرِيمِ* ✨
📖 *Quran Challenge & Mutadarasa*

السلام عليكم ورحمة الله وبركاته!
أتحداك يا أخي في منافسة شريفة في كتاب الله 📖

🎯 *Surah*: ${params.surahTitle}
⚡ *Score*: ${params.score}/${params.totalQuestions} in ${params.timeSeconds}s!
🏆 *Level*: ${diffLabel}

«وَفِي ذَٰلِكَ فَلْيَتَنَافَسِ الْمُتَنَافِسُونَ»

👇 *Tap here to accept my Quran challenge:*
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
