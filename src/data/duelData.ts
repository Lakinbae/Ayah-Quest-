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
    prompt: 'في سورة البقرة (الآية ٣٥)، ما هو اللفظ القرآني الدقيق لأمر آدم وزوجه بالجنة؟',
    arabicSnippet: 'وَقُلْنَا يَا آدَمُ اسْكُنْ أَنتَ وَزَوْجُكَ الْجَنَّةَ وَكُلَا مِنْهَا [...] حَيْثُ شِئْتُمَا',
    surahReference: 'سورة البقرة (٢:٣٥) مقابل الأعراف (٧:١٩)',
    translation: 'And eat from it bountifully wherever you wish...',
    options: [
      'رَغَدًا',
      'هَنِيئًا',
      'طَيِّبًا',
      'سَائِغًا',
    ],
    correctIndex: 0,
    explanation: 'سورة البقرة (٣٥) زادت كلمة "رَغَدًا": «وَكُلَا مِنْهَا رَغَدًا حَيْثُ شِئْتُمَا»، بينما في الأعراف (١٩): «فَكُلَا مِنْ حَيْثُ شِئْتُمَا» دون لفظ "رغداً".',
    tadabburPearl: 'جاء لفظ "رغداً" في البقرة إكراماً لنعمة البداية وإظهاراً لسعة فضل الله قبل التكليف.',
    estimatedLetters: 42,
  },
  {
    id: 'tv-2',
    category: 'Twin Verse',
    difficulty: 'mutqin',
    prompt: 'في سورة آل عمران (الآية ١٣٣)، كيف بدأت الآية الكريمة بالحث على المغفرة والجنة؟',
    arabicSnippet: '[...] إِلَىٰ مَغْفِرَةٍ مِّن رَّبِّكُمْ وَجَنَّةٍ عَرْضُهَا السَّمَاوَاتُ وَالْأَرْضُ أُعِدَّتْ لِلْمُتَّقِينَ',
    surahReference: 'آل عمران (٣:١٣٣) مقابل الحديد (٥٧:٢١)',
    translation: 'And hasten to forgiveness from your Lord...',
    options: [
      'وَسَارِعُوا',
      'سَابِقُوا',
      'فَاسْتَبِقُوا',
      'سَارِعُوا',
    ],
    correctIndex: 0,
    explanation: 'في آل عمران (١٣٣) بالواو: «وَسَارِعُوا»، بينما في سورة الحديد (٢١): «سَابِقُوا إِلَىٰ مَغْفِرَةٍ مِّن رَّبِّكُمْ».',
    tadabburPearl: 'المسارعة استجابة فورية بعد غزوة أحد، والمسابقة في سورة الحديد تنافس واسع على مراتب الآخرة.',
    estimatedLetters: 48,
  },
  {
    id: 'tv-3',
    category: 'Twin Verse',
    difficulty: 'mutqin',
    prompt: 'ما هي الفاصلة القرآنية الدقيقة لختام هذه الآية في سورة الأنفال (الآية ٦١)؟',
    arabicSnippet: 'وَإِن جَنَحُوا لِلسَّلْمِ فَاجْنَحْ لَهَا وَتَوَكَّلْ عَلَى اللَّهِ ۚ إِنَّهُ هُوَ [...]',
    surahReference: 'الأنفال (٨:٦١)',
    translation: 'And if they incline to peace, then incline to it and rely upon Allah...',
    options: [
      'السَّمِيعُ الْعَلِيمُ',
      'الْعَلِيمُ الْحَكِيمُ',
      'الْغَفُورُ الرَّحِيمُ',
      'الْعَزِيزُ الْحَكِيمُ',
    ],
    correctIndex: 0,
    explanation: 'ختام آية الأنفال: «إِنَّهُ هُوَ السَّمِيعُ الْعَلِيمُ»؛ يسمع ما يعاهدون عليه ويعلم ما تكنه صدورهم.',
    tadabburPearl: 'عند إبرام المعاهدات يطمئن المؤمن بالله السميع لما يقال، العليم بما يضمر الأعداء.',
    estimatedLetters: 50,
  },
  {
    id: 'tv-4',
    category: 'Twin Verse',
    difficulty: 'hafiz',
    prompt: 'في سورة البينة (الآية ٨)، ما هو اللفظ الصحيح لخلود المؤمنين الصالحين؟',
    arabicSnippet: 'جَزَاؤُهُمْ عِندَ رَبِّهِمْ جَنَّاتُ عَدْنٍ تَجْرِي مِن تَحْتِهَا الْأَنْهَارُ [...] رَّضِيَ اللَّهُ عَنْهُمْ وَرَضُوا عَنْهُ',
    surahReference: 'البينة (٩٨:٨)',
    translation: 'Their reward with their Lord will be gardens of perpetual residence...',
    options: [
      'خَالِدِينَ فِيهَا أَبَدًا',
      'خَالِدِينَ فِيهَا',
      'مَا دَامَتِ السَّمَاوَاتُ وَالْأَرْضُ',
      'لَا يَبْغُونَ عَنْهَا حِوَلًا',
    ],
    correctIndex: 0,
    explanation: 'في سورة البينة للمؤمنين زاد: «خَالِدِينَ فِيهَا أَبَدًا»، بينما للكافرين قال: «خَالِدِينَ فِيهَا» دون "أبداً".',
    tadabburPearl: 'أبدية النعيم للمؤمنين قرنت برضوان الله الذي لا يسخط بعده أبداً.',
    estimatedLetters: 55,
  },
  {
    id: 'tv-5',
    category: 'Twin Verse',
    difficulty: 'mutqin',
    prompt: 'في سورة البقرة (الآية ٥٨)، كيف جاء الأمر في دخول القرية مقارنة بسورة الأعراف؟',
    arabicSnippet: 'وَإِذْ قُلْنَا [...] الْقَرْيَةَ فَكُلُوا مِنْهَا حَيْثُ شِئْتُمْ رَغَدًا وَادْخُلُوا الْبَابَ سُجَّدًا',
    surahReference: 'البقرة (٢:٥٨) مقابل الأعراف (٧:١٦١)',
    translation: 'And when We said, "Enter this city..."',
    options: [
      'ادْخُلُوا هَٰذِهِ',
      'اسْكُنُوا هَٰذِهِ',
      'ادْخُلُوا تِلْكَ',
      'سِيرُوا فِي هَٰذِهِ',
    ],
    correctIndex: 0,
    explanation: 'في البقرة (٥٨): «وَإِذْ قُلْنَا ادْخُلُوا هَٰذِهِ الْقَرْيَةَ»، بينما في الأعراف (١٦١): «وَإِذْ قِيلَ لَهُمُ اسْكُنُوا هَٰذِهِ الْقَرْيَةَ».',
    tadabburPearl: 'الدخول حركة أولى، والسكني إقامة واستقرار، ولكل سياق في القرآن إعجازه ودقته.',
    estimatedLetters: 45,
  },
  {
    id: 'tv-6',
    category: 'Twin Verse',
    difficulty: 'mutqin',
    prompt: 'في سورة يونس (الآية ٢) وسورة ص (الآية ٤)، ما هو وصف الكافرين للرسول بالمتشابهات؟',
    arabicSnippet: 'أَكَانَ لِلنَّاسِ عَجَبًا أَنْ أَوْحَيْنَا إِلَىٰ رَجُلٍ مِّنْهُمْ... قَالَ الْكَافِرُونَ إِنَّ هَٰذَا [...]',
    surahReference: 'يونس (١٠:٢) مقابل ص (٣٨:٤)',
    translation: 'The disbelievers said, "Indeed, this is..."',
    options: [
      'لَسَاحِرٌ مُّبِينٌ',
      'سَاحِرٌ كَذَّابٌ',
      'سِحْرٌ مُّبِينٌ',
      'شَاعِرٌ مَّجْنُونٌ',
    ],
    correctIndex: 0,
    explanation: 'في سورة يونس: «إِنَّ هَٰذَا لَسَاحِرٌ مُّبِينٌ»، بينما في سورة ص: «وَقَالَ الْكَافِرُونَ هَٰذَا سَاحِرٌ كَذَّابٌ».',
    tadabburPearl: 'تنوع شبهات المعاندين يقابله ثبات الحق الأبلج ووضوح الرسالة النبوية.',
    estimatedLetters: 52,
  },

  // -------------------------------------------------------------
  // 2. NEXT AYAH (Sequence & Continuous Tarteel across Surahs)
  // -------------------------------------------------------------
  {
    id: 'na-1',
    category: 'Next Ayah',
    difficulty: 'talib',
    prompt: 'ما هي الآية التالية مباشرة في سورة الفاتحة بعد قوله تعالى:',
    arabicSnippet: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
    surahReference: 'سورة الفاتحة (١:٦)',
    translation: 'Guide us to the straight path.',
    options: [
      'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
      'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
      'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
      'مَالِكِ يَوْمِ الدِّينِ',
    ],
    correctIndex: 0,
    explanation: 'الآية ٧ هي ختام سورة الفاتحة أم الكتاب.',
    tadabburPearl: 'نسأل الله صراط المهتدين بالعلم والعمل، سالمين من الغضب والضلال.',
    estimatedLetters: 45,
  },
  {
    id: 'na-2',
    category: 'Next Ayah',
    difficulty: 'hafiz',
    prompt: 'ما هي الآية التي تلي مطلع سورة الملك مباشرة؟',
    arabicSnippet: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
    surahReference: 'سورة الملك (٦٧:١)',
    translation: 'Blessed is He in whose hand is dominion, and He is over all things competent.',
    options: [
      'الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ الْعَزِيزُ الْغَفُورُ',
      'الَّذِي خَلَقَ سَبْعَ سَمَاوَاتٍ طِبَاقًا ۖ مَّا تَرَىٰ فِي خَلْقِ الرَّحْمَٰنِ مِن تَفَاوُتٍ',
      'وَلَقَدْ زَيَّنَّا السَّمَاءَ الدُّنْيَا بِمَصَابِيحَ وَجَعَلْنَاهَا رُجُومًا لِّلشَّيَاطِينِ',
      'إِنَّ الَّذِينَ يَخْشَوْنَ رَبَّهُم بِالْغَيْبِ لَهُم مَّغْفِرَةٌ وَأَجْرٌ كَبِيرٌ',
    ],
    correctIndex: 0,
    explanation: 'الآية الثانية في الملك: «الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا».',
    tadabburPearl: 'خلق الحياة والموت للابتلاء بالأحسن عملاً لا بالأكثر فقط: أخلصه وأصوبه.',
    estimatedLetters: 60,
  },
  {
    id: 'na-3',
    category: 'Next Ayah',
    difficulty: 'hafiz',
    prompt: 'ما هي الآية الختامية التي تعقب قوله تعالى في سورة يس؟',
    arabicSnippet: 'إِنَّمَا أَمْرُهُ إِذَا أَرَادَ شَيْئًا أَن يَقُولَ لَهُ كُن فَيَكُونُ',
    surahReference: 'سورة يس (٣٦:٨٢)',
    translation: 'His command is only when He intends a thing that He says to it, "Be," and it is.',
    options: [
      'فَسُبْحَانَ الَّذِي بِيَدِهِ مَلَكُوتُ كُلِّ شَيْءٍ وَإِلَيْهِ تُرْجَعُونَ',
      'وَضَرَبَ لَنَا مَثَلًا وَنَسِيَ خَلْقَهُ ۖ قَالَ مَن يُحْيِي الْعِظَامَ وَهِيَ رَمِيمٌ',
      'أَوَلَمْ يَرَ الْإِنسَانُ أَنَّا خَلَقْنَاهُ مِن نُّطْفَةٍ فَإِذَا هُوَ خَصِيمٌ مُّبِينٌ',
      'وَالشَّمْسُ تَجْرِي لِمُسْتَقَرٍّ لَّهَا ۚ ذَٰلِكَ تَقْدِيرُ الْعَزِيزِ الْعَلِيمِ',
    ],
    correctIndex: 0,
    explanation: 'الآية ٨٣ مسك ختام سورة يس: «فَسُبْحَانَ الَّذِي بِيَدِهِ مَلَكُوتُ كُلِّ شَيْءٍ وَإِلَيْهِ تُرْجَعُونَ».',
    tadabburPearl: 'إذا عظم عليك أمر فاستحضر (كن فيكون)؛ فبيده سبحانه ملكوت كل شيء.',
    estimatedLetters: 55,
  },
  {
    id: 'na-4',
    category: 'Next Ayah',
    difficulty: 'mutqin',
    prompt: 'في سورة الكهف، ما هي الآية التي تلي قوله تعالى مباشرة؟',
    arabicSnippet: 'إِنَّ الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ كَانَتْ لَهُمْ جَنَّاتُ الْفِرْدَوْسِ نُزُلًا',
    surahReference: 'سورة الكهف (١٨:١٠٧)',
    translation: 'Indeed, those who have believed and done righteous deeds - they will have the Gardens of Paradise as a lodging...',
    options: [
      'خَالِدِينَ فِيهَا لَا يَبْغُونَ عَنْهَا حِوَلًا',
      'قُل لَّوْ كَانَ الْبَحْرُ مِدَادًا لِّكَلِمَاتِ رَبِّي لَنَفِدَ الْبَحْرُ',
      'قُلْ إِنَّمَا أَنَا بَشَرٌ مِّثْلُكُمْ يُوحَىٰ إِلَيَّ أَنَّمَا إِلَٰهُكُمْ إِلَٰهٌ وَاحِدٌ',
      'أَفَحَسِبَ الَّذِينَ كَفَرُوا أَن يَتَّخِذُوا عِبَادِي مِن دُونِي أَوْلِيَاءَ',
    ],
    correctIndex: 0,
    explanation: 'الآية ١٠٨: «خَالِدِينَ فِيهَا لَا يَبْغُونَ عَنْهَا حِوَلًا».',
    tadabburPearl: 'أهل الجنة لا يملّون نعيمها ولا يطلبون تحولاً عنه لعظيم كماله ورضاهم به.',
    estimatedLetters: 52,
  },
  {
    id: 'na-5',
    category: 'Next Ayah',
    difficulty: 'mutqin',
    prompt: 'في سورة النور (الآية ٣٥)، ما هي الآية الكريمة التي تأتي بعد آية النور مباشرة؟',
    arabicSnippet: 'اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ ۚ مَثَلُ نُورِهِ كَمِشْكَاةٍ فِيهَا مِصْبَاحٌ...',
    surahReference: 'سورة النور (٢٤:٣٥)',
    translation: 'Allah is the Light of the heavens and the earth...',
    options: [
      'فِي بُيُوتٍ أَذِنَ اللَّهُ أَن تُرْفَعَ وَيُذْكَرَ فِيهَا اسْمُهُ يُسَبِّحُ لَهُ فِيهَا بِالْغُدُوِّ وَالْآصَالِ',
      'رِجَالٌ لَّا تُلْهِيهِمْ تِجَارَةٌ وَلَا بَيْعٌ عَن ذِكْرِ اللَّهِ',
      'وَالَّذِينَ كَفَرُوا أَعْمَالُهُمْ كَسَرَابٍ بِقِيعَةٍ يَحْسَبُهُ الظَّمْآنُ مَاءً',
      'أَوْ كَظُلُمَاتٍ فِي بَحْرٍ لُّجِّيٍّ يَغْشَاهُ مَوْجٌ مِّن فَوْقِهِ مَوْجٌ',
    ],
    correctIndex: 0,
    explanation: 'الآية ٣٦: «فِي بُيُوتٍ أَذِنَ اللَّهُ أَن تُرْفَعَ وَيُذْكَرَ فِيهَا اسْمُهُ».',
    tadabburPearl: 'مستقر ذلك النور الرباني ومشكاواته في الأرض هي بيوت الله وعمارتها بذكره وتسبيحه.',
    estimatedLetters: 65,
  },
  {
    id: 'na-6',
    category: 'Next Ayah',
    difficulty: 'hafiz',
    prompt: 'ما هي الآية التالية لقوله تعالى في سورة الفرقان؟',
    arabicSnippet: 'تَبَارَكَ الَّذِي جَعَلَ فِي السَّمَاءِ بُرُوجًا وَجَعَلَ فِيهَا سِرَاجًا وَقَمَرًا مُّنِيرًا',
    surahReference: 'سورة الفرقان (٢٥:٦١)',
    translation: 'Blessed is He who has placed in the sky great stars and placed therein a burning lamp and luminous moon...',
    options: [
      'وَهُوَ الَّذِي جَعَلَ اللَّيْلَ وَالنَّهَارَ خِلْفَةً لِّمَنْ أَرَادَ أَن يَذَّكَّرَ أَوْ أَرَادَ شُكُورًا',
      'وَعِبَادُ الرَّحْمَٰنِ الَّذِينَ يَمْشُونَ عَلَى الْأَرْضِ هَوْنًا',
      'وَالَّذِينَ يَبِيتُونَ لِرَبِّهِمْ سُجَّدًا وَقِيَامًا',
      'وَالَّذِينَ يَقُولُونَ رَبَّنَا اصْرِفْ عَنَّا عَذَابَ جَهَنَّمَ',
    ],
    correctIndex: 0,
    explanation: 'الآية ٦٢: «وَهُوَ الَّذِي جَعَلَ اللَّيْلَ وَالنَّهَارَ خِلْفَةً لِّمَنْ أَرَادَ أَن يَذَّكَّرَ أَوْ أَرَادَ شُكُورًا».',
    tadabburPearl: 'تعاقب الليل والنهار فرصة متجددة لمن فاته ورد في أحدهما أن يستدركه في الآخر شكراً وذكراً.',
    estimatedLetters: 58,
  },
  {
    id: 'na-7',
    category: 'Next Ayah',
    difficulty: 'mutqin',
    prompt: 'ما هي الآية التي تلي قوله تعالى في سورة فصلت (الآية ٣٠)؟',
    arabicSnippet: 'إِنَّ الَّذِينَ قَالُوا رَبُّنَا اللَّهُ ثُمَّ اسْتَقَامُوا تَتَنَزَّلُ عَلَيْهِمُ الْمَلَائِكَةُ أَلَّا تَخَافُوا وَلَا تَحْزَنُوا...',
    surahReference: 'سورة فصلت (٤١:٣٠)',
    translation: 'Indeed, those who have said, "Our Lord is Allah" and then remained on a right course...',
    options: [
      'نَحْنُ أَوْلِيَاؤُكُمْ فِي الْحَيَاةِ الدُّنْيَا وَفِي الْآخِرَةِ ۖ وَلَكُمْ فِيهَا مَا تَشْتَهِي أَنفُسُكُمْ',
      'نُزُلًا مِّنْ غَفُورٍ رَّحِيمٍ',
      'وَمَنْ أَحْسَنُ قَوْلًا مِّمَّن دَعَا إِلَى اللَّهِ وَعَمِلَ صَالِحًا',
      'وَلَا تَسْتَوِي الْحَسَنَةُ وَلَا السَّيِّئَةُ ۚ ادْفَعْ بِالَّتِي هِيَ أَحْسَنُ',
    ],
    correctIndex: 0,
    explanation: 'الآية ٣١ من فصلت تثبت بشرى الملائكة: «نَحْنُ أَوْلِيَاؤُكُمْ فِي الْحَيَاةِ الدُّنْيَا وَفِي الْآخِرَةِ».',
    tadabburPearl: 'ثمرة الاستقامة ولاية ربانية ومعية ملائكية تثبت القلب عند فراق الدنيا.',
    estimatedLetters: 62,
  },

  // -------------------------------------------------------------
  // 3. MISSING WORD (Precision of Harakat & Quranic Vocabulary)
  // -------------------------------------------------------------
  {
    id: 'mw-1',
    category: 'Missing Word',
    difficulty: 'hafiz',
    prompt: 'أكمل الكلمة القرآنية الناقصة في آية الكرسي من سورة البقرة:',
    arabicSnippet: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ [...] وَلَا نَوْمٌ',
    surahReference: 'سورة البقرة (٢:٢٥٥)',
    translation: 'Neither drowsiness overtakes Him nor sleep...',
    options: ['سِنَةٌ', 'غَفْلَةٌ', 'حَسْرَةٌ', 'فَتْرَةٌ'],
    correctIndex: 0,
    explanation: 'اللفظ القرآني: «سِنَةٌ» بكسر السين وفتح النون، وهي ابتداء النعاس.',
    tadabburPearl: 'كمال قيوميته سبحانه أنه لا يغفل ولا ينام، فدعاؤك في حفظه ورعايته دائماً.',
    estimatedLetters: 44,
  },
  {
    id: 'mw-2',
    category: 'Missing Word',
    difficulty: 'mutqin',
    prompt: 'أكمل الكلمة القرآنية في سورة الرحمن (الآية ٢٦):',
    arabicSnippet: 'كُلُّ مَنْ عَلَيْهَا [...] • وَيَبْقَىٰ وَجْهُ رَبِّكَ ذُو الْجَلَالِ وَالْإِكْرَامِ',
    surahReference: 'سورة الرحمن (٥٥:٢٦-٢٧)',
    translation: 'Everyone upon the earth will perish, and there will remain the Face of your Lord...',
    options: ['فَانٍ', 'مَيِّتٌ', 'زَائِلٌ', 'هَالِكٌ'],
    correctIndex: 0,
    explanation: 'قال الله تعالى: «كُلُّ مَنْ عَلَيْهَا فَانٍ» بالتنوين على الياء المحذوفة.',
    tadabburPearl: 'الدنيا برمتها زائلة، وما كان لله ولابتغاء وجهه الكريم فهو الباقي.',
    estimatedLetters: 38,
  },
  {
    id: 'mw-3',
    category: 'Missing Word',
    difficulty: 'talib',
    prompt: 'أكمل الكلمة في قوله تعالى من سورة الشرح:',
    arabicSnippet: 'فَإِنَّ مَعَ الْعُسْرِ [...] • إِنَّ مَعَ الْعُسْرِ [...]',
    surahReference: 'سورة الشرح (٩٤:٥-٦)',
    translation: 'For indeed, with hardship [will be] ease. Indeed, with hardship [will be] ease.',
    options: ['يُسْرًا', 'فَرَجًا', 'خَيْرًا', 'نَصْرًا'],
    correctIndex: 0,
    explanation: 'اللفظ القرآني: «يُسْرًا» نكرة، والعسر معرفة، فلن يغلب عسر يسرين.',
    tadabburPearl: 'بشارة ربانية أن العسر محفوف بلطف ويُسر مقترن به.',
    estimatedLetters: 35,
  },
  {
    id: 'mw-4',
    category: 'Missing Word',
    difficulty: 'hafiz',
    prompt: 'ما هي الكلمة القرآنية في سورة الحجرات (الآية ١٠)؟',
    arabicSnippet: 'إِنَّمَا الْمُؤْمِنُونَ [...] فَأَصْلِحُوا بَيْنَ أَخَوَيْكُمْ ۚ وَاتَّقُوا اللَّهَ لَعَلَّكُمْ تُرْحَمُونَ',
    surahReference: 'سورة الحجرات (٤٩:١٠)',
    translation: 'The believers are but brothers, so make settlement between your brothers...',
    options: ['إِخْوَةٌ', 'أَوْلِيَاءُ', 'أَصْحَابٌ', 'أَحِبَّاءُ'],
    correctIndex: 0,
    explanation: 'استخدم القرآن «إِخْوَةٌ» وهي صيغة تدل على أصل قرابة النسب للدلالة على توثق رابطة الإيمان.',
    tadabburPearl: 'أخوة الإيمان أمتن من حبال النسب، وأمانتها الإصلاح والتراحم.',
    estimatedLetters: 50,
  },
  {
    id: 'mw-5',
    category: 'Missing Word',
    difficulty: 'mutqin',
    prompt: 'أكمل الآية من سورة الذاريات (الآية ٥٦):',
    arabicSnippet: 'وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا [...]',
    surahReference: 'سورة الذاريات (٥١:٥٦)',
    translation: 'And I did not create the jinn and mankind except to worship Me.',
    options: [
      'لِيَعْبُدُونِ',
      'لِيَعْلَمُونِ',
      'لِيَذْكُرُونِ',
      'لِيَشْكُرُونِ',
    ],
    correctIndex: 0,
    explanation: 'الآية الكريمة: «وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ» بحذف ياء المتكلم تخفيفاً.',
    tadabburPearl: 'الغاية العظمى من وجود الثقلين هي تحقيق التوحيد والعبودية الخالصة لله.',
    estimatedLetters: 36,
  },
  {
    id: 'mw-6',
    category: 'Missing Word',
    difficulty: 'mutqin',
    prompt: 'أكمل الكلمة الدقيقة في قوله تعالى من سورة النساء (الآية ١٤٢):',
    arabicSnippet: 'إِنَّ الْمُنَافِقِينَ يُخَادِعُونَ اللَّهَ وَهُوَ خَادِعُهُمْ وَإِذَا قَامُوا إِلَى الصَّلَاةِ قَامُوا [...]',
    surahReference: 'سورة النساء (٤:١٤٢)',
    translation: 'And when they stand for prayer, they stand lazily...',
    options: [
      'كُسَالَىٰ',
      'مُرَائِينَ',
      'مُتَثَاقِلِينَ',
      'لَاهِينَ',
    ],
    correctIndex: 0,
    explanation: 'وصف صلاتهم: «قَامُوا كُسَالَىٰ يُرَاءُونَ النَّاسَ وَلَا يَذْكُرُونَ اللَّهَ إِلَّا قَلِيلًا».',
    tadabburPearl: 'النشاط في الصلاة علامة صدق الإيمان، والكسل عنها من سمات النفاق فاحذره.',
    estimatedLetters: 46,
  },
  {
    id: 'mw-7',
    category: 'Missing Word',
    difficulty: 'hafiz',
    prompt: 'في سورة الأنبياء (الآية ٨٧)، ما هي الكلمة التي نادى بها ذو النون في الظلمات؟',
    arabicSnippet: 'فَنَادَىٰ فِي الظُّلُمَاتِ أَن لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ [...]',
    surahReference: 'سورة الأنبياء (٢١:٨٧)',
    translation: 'And he called out within the darknesses, "There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers."',
    options: [
      'الظَّالِمِينَ',
      'الْغَافِلِينَ',
      'الْخَاطِئِينَ',
      'النَّادِمِينَ',
    ],
    correctIndex: 0,
    explanation: 'دعاء يونس عليه السلام: «لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ».',
    tadabburPearl: 'اعتراف بالتوحيد وتنزيه للرب وإقرار بالذنب؛ مفتاح النجاة من كل كرب وضيق.',
    estimatedLetters: 42,
  },

  // -------------------------------------------------------------
  // 4. IDENTIFY SURAH (Recognizing Surah by Distinctive Ayahs across 114 Surahs)
  // -------------------------------------------------------------
  {
    id: 'is-1',
    category: 'Identify Surah',
    difficulty: 'hafiz',
    prompt: 'في أي سورة من سور القرآن الكريم وردت هذه الآية العظيمة في التوبة والمغفرة؟',
    arabicSnippet: 'قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا',
    surahReference: 'سورة الزمر (٣٩:٥٣)',
    translation: 'Say, "O My servants who have transgressed against themselves, do not despair of the mercy of Allah..."',
    options: ['سورة الزمر', 'سورة غافر', 'سورة فصلت', 'سورة الشورى'],
    correctIndex: 0,
    explanation: 'الآية ٥٣ من سورة الزمر هي أرجى آية في كتاب الله تعالى.',
    tadabburPearl: 'نادهم بـ (يا عبادي) تلطفاً وإكراماً رغم إسرافهم، ونهاهم عن القنوط من سعة رحمته.',
    estimatedLetters: 62,
  },
  {
    id: 'is-2',
    category: 'Identify Surah',
    difficulty: 'talib',
    prompt: 'في أي سورة ورد هذا القسم الرباني المبارك؟',
    arabicSnippet: 'وَالتِّينِ وَالزَّيْتُونِ • وَطُورِ سِينِينَ • وَهَٰذَا الْبَلَدِ الْأَمِينِ',
    surahReference: 'سورة التين (٩٥:١-٣)',
    translation: 'By the fig and the olive, and [by] Mount Sinai, and [by] this secure city...',
    options: ['سورة التين', 'سورة الشرح', 'سورة الضحى', 'سورة البلد'],
    correctIndex: 0,
    explanation: 'مطلع سورة التين يقسم بمواطن أنبياء أولي العزم والبلد الحرام مكة.',
    tadabburPearl: 'خلق الإنسان في أحسن تقويم؛ وحفظ فطرته لا يكون إلا بالإيمان والعمل الصالح.',
    estimatedLetters: 42,
  },
  {
    id: 'is-3',
    category: 'Identify Surah',
    difficulty: 'hafiz',
    prompt: 'في أي سورة وردت هذه الخاتمة التي اشتملت على صفوة من أسماء الله الحسنى؟',
    arabicSnippet: 'هُوَ اللَّهُ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ الْمَلِكُ الْقُدُّوسُ السَّلَامُ الْمُؤْمِنُ الْمُهَيْمِنُ الْعَزِيزُ الْجَبَّارُ الْمُتَكَبِّرُ',
    surahReference: 'سورة الحشر (٥٩:٢٣)',
    translation: 'He is Allah, other than whom there is no deity, the Sovereign, the Pure, the Perfection...',
    options: ['سورة الحشر', 'سورة الحديد', 'سورة الجمعة', 'سورة الصف'],
    correctIndex: 0,
    explanation: 'خواتيم سورة الحشر حوت مجمعاً فريداً لأسماء الله وصفاته العلى.',
    tadabburPearl: 'دعاء الله بأسمائه الحسنى واستحضار معانيها يثمر تعظيماً ويقيناً وسكينة في الصدر.',
    estimatedLetters: 60,
  },
  {
    id: 'is-4',
    category: 'Identify Surah',
    difficulty: 'talib',
    prompt: 'في أي سورة تتكرر الآية الكريمة "فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ" إحدى وثلاثين مرة؟',
    arabicSnippet: 'فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ',
    surahReference: 'سورة الرحمن (٥٥)',
    translation: 'So which of the favors of your Lord would you deny?',
    options: ['سورة الرحمن', 'سورة الواقعة', 'سورة الملك', 'سورة الإنسان'],
    correctIndex: 0,
    explanation: 'سورة الرحمن عروس القرآن تذكر بآلاء الله الكونية والدينية ونعيم الجنان.',
    tadabburPearl: 'تعداد النعم يبعث على دوام الشكر، وغفلة القلب عن المنعم تحرمه لذة الشهود.',
    estimatedLetters: 25,
  },
  {
    id: 'is-5',
    category: 'Identify Surah',
    difficulty: 'mutqin',
    prompt: 'في أي سورة ورد قوله تعالى: "أَلَمْ يَأْنِ لِلَّذِينَ آمَنُوا أَن تَخْشَعَ قُلُوبُهُمْ لِذِكْرِ اللَّهِ وَمَا نَزَلَ مِنَ الْحَقِّ"؟',
    arabicSnippet: 'أَلَمْ يَأْنِ لِلَّذِينَ آمَنُوا أَن تَخْشَعَ قُلُوبُهُمْ لِذِكْرِ اللَّهِ وَمَا نَزَلَ مِنَ الْحَقِّ...',
    surahReference: 'سورة الحديد (٥٧:١٦)',
    translation: 'Has the time not come for those who have believed that their hearts should become humbly submissive at the remembrance of Allah...',
    options: ['سورة الحديد', 'سورة الحشر', 'سورة الممتحنة', 'سورة المجادلة'],
    correctIndex: 0,
    explanation: 'سورة الحديد الآية ١٦، وهي الآية التي كانت سبباً في توبة الفضيل بن عياض وابن المبارك.',
    tadabburPearl: 'عتاب رقيق من الرب الرحيم لأوليائه كي تلين قلوبهم لكلامه ولا يقسو عليها الأمد.',
    estimatedLetters: 56,
  },
  {
    id: 'is-6',
    category: 'Identify Surah',
    difficulty: 'mutqin',
    prompt: 'في أي سورة وردت وصايا لقمان الحكيم لابنه: "يَا بُنَيَّ أَقِمِ الصَّلَاةَ وَأْمُرْ بِالْمَعْرُوفِ وَانْهَ عَنِ الْمُنكَرِ"؟',
    arabicSnippet: 'يَا بُنَيَّ أَقِمِ الصَّلَاةَ وَأْمُرْ بِالْمَعْرُوفِ وَانْهَ عَنِ الْمُنكَرِ وَاصْبِرْ عَلَىٰ مَا أَصَابَكَ...',
    surahReference: 'سورة لقمان (٣١:١٧)',
    translation: 'O my son, establish prayer, enjoin what is right, forbid what is wrong, and be patient over what befalls you...',
    options: ['سورة لقمان', 'سورة الإسراء', 'سورة الروم', 'سورة الأحقاف'],
    correctIndex: 0,
    explanation: 'سورة لقمان الآية ١٧ تجمع أركان التربية الإيمانية والاجتماعية والخلقية.',
    tadabburPearl: 'الأمر بالمعروف يحتاج إلى الصبر على أذى الناس، والصلة بالله هي زاد الداعية.',
    estimatedLetters: 58,
  },
  {
    id: 'is-7',
    category: 'Identify Surah',
    difficulty: 'hafiz',
    prompt: 'في أي سورة ورد هذا الدعاء العظيم: "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا"؟',
    arabicSnippet: 'وَالَّذِينَ يَقُولُونَ رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
    surahReference: 'سورة الفرقان (٢٥:٧٤)',
    translation: 'And those who say, "Our Lord, grant us from among our wives and offspring comfort to our eyes and make us an example for the righteous."',
    options: ['سورة الفرقان', 'سورة مريم', 'سورة النور', 'سورة المؤمنون'],
    correctIndex: 0,
    explanation: 'خاتمة صفات عباد الرحمن في سورة الفرقان الآية ٧٤.',
    tadabburPearl: 'قرة العين أن ترى أهلك مطيعين لله؛ وعلّو الهمة أن تطلب الإمامة في التقوى لا في الدنيا.',
    estimatedLetters: 60,
  },
  {
    id: 'is-8',
    category: 'Identify Surah',
    difficulty: 'mutqin',
    prompt: 'في أي سورة ورد قوله تعالى: "أَفَلَا يَتَدَبَّرُونَ الْقُرْآنَ أَمْ عَلَىٰ قُلُوبٍ أَقْفَالُهَا"؟',
    arabicSnippet: 'أَفَلَا يَتَدَبَّرُونَ الْقُرْآنَ أَمْ عَلَىٰ قُلُوبٍ أَقْفَالُهَا',
    surahReference: 'سورة محمد (٤٧:٢٤)',
    translation: 'Then do they not reflect upon the Quran, or are there locks upon [their] hearts?',
    options: ['سورة محمد', 'سورة الفتح', 'سورة ق', 'سورة الحجرات'],
    correctIndex: 0,
    explanation: 'الآية ٢٤ من سورة محمد، وهي من أبلغ آيات الحث على تدبر كتاب الله وفك أقفال الغفلة.',
    tadabburPearl: 'مفتاح القلب هو التدبر؛ وقفل القلب هو الران والإعراض والمعاصي.',
    estimatedLetters: 38,
  },

  // -------------------------------------------------------------
  // 5. TADABBUR & THEME (Depth of Meaning without Clues)
  // -------------------------------------------------------------
  {
    id: 'td-1',
    category: 'Tadabbur & Meaning',
    difficulty: 'hafiz',
    prompt: 'في سورة الكهف (الآية ٤٦)، ما هو الذي وصفه الله بأنه "خَيْرٌ عِندَ رَبِّكَ ثَوَابًا وَخَيْرٌ أَمَلًا"؟',
    arabicSnippet: 'الْمَالُ وَالْبَنُونَ زِينَةُ الْحَيَاةِ الدُّنْيَا ۖ [...] خَيْرٌ عِندَ رَبِّكَ ثَوَابًا وَخَيْرٌ أَمَلًا',
    surahReference: 'سورة الكهف (١٨:٤٦)',
    translation: 'Wealth and children are [but] adornment of the worldly life. But the enduring good deeds are better...',
    options: [
      'الْبَاقِيَاتُ الصَّالِحَاتُ',
      'الْقَنَاطِيرُ الْمُقَنطَرَةُ',
      'الْأَنْعَامُ وَالْحَرْثُ',
      'الْمُلْكُ وَالسُّلْطَانُ',
    ],
    correctIndex: 0,
    explanation: '«الْبَاقِيَاتُ الصَّالِحَاتُ» (سبحان الله، والحمد لله، ولا إله إلا الله، والله أكبر) هي الكنز الخالد.',
    tadabburPearl: 'زينة الدنيا تفنى وتزول، وعملك الصالح وذكرك يرافقك في قبرك ويرفع درجاتك في الجنان.',
    estimatedLetters: 65,
  },
  {
    id: 'td-2',
    category: 'Tadabbur & Meaning',
    difficulty: 'mutqin',
    prompt: 'في سورة الضحى، بماذا طمأن الله نبيه ﷺ بعد فتور الوحي وتكذيب المشركين؟',
    arabicSnippet: 'مَا وَدَّعَكَ رَبُّكَ وَمَا [...] • وَلَلْآخِرَةُ خَيْرٌ لَّكَ مِنَ الْأُولَىٰ',
    surahReference: 'سورة الضحى (٩٣:٣-٤)',
    translation: 'Your Lord has not taken leave of you, nor has He detested you...',
    options: [
      'قَلَىٰ',
      'جَفَا',
      'سَلَا',
      'نَسِيَ',
    ],
    correctIndex: 0,
    explanation: 'قال الله: «مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ» ولم يقل (وما قلاك) إكراماً للجناب النبوي وتأدباً.',
    tadabburPearl: 'حين تنقطع الأسباب وتنتابك الوحشة، تذكر أن ربك لم يودعك ولم يقلك؛ فكن معه يكن معك.',
    estimatedLetters: 48,
  },
  {
    id: 'td-3',
    category: 'Tadabbur & Meaning',
    difficulty: 'mutqin',
    prompt: 'في سورة القصص (الآية ٧)، ما هي البشارة والأمران والنهيان في آية أم موسى؟',
    arabicSnippet: 'وَأَوْحَيْنَا إِلَىٰ أُمِّ مُوسَىٰ أَنْ أَرْضِعِيهِ ۖ فَإِذَا خِفْتِ عَلَيْهِ فَأَلْقِيهِ فِي الْيَمِّ وَلَا تَخَافِي وَلَا تَحْزَنِي ۖ إِنَّا [...]',
    surahReference: 'سورة القصص (٢٨:٧)',
    translation: 'Indeed, We will return him to you and make him [one] of the messengers...',
    options: [
      'رَادُّوهُ إِلَيْكِ وَجَاعِلُوهُ مِنَ الْمُرْسَلِينَ',
      'عَاصِمُوهُ مِنْ كَيْدِ الْفِرْعَوْنِ',
      'مُنَجُّوهُ وَآتُوهُ حُكْمًا وَعِلْمًا',
      'حَافِظُوهُ وَمُؤْتُوهُ صَرْحًا عَظِيمًا',
    ],
    correctIndex: 0,
    explanation: 'جمعت الآية أمرين ونهيين وخبرين وبشارتين في نسق بلاغي فريد.',
    tadabburPearl: 'اليقين بوعد الله يجعل الأم تلقي فلذة كبدها في اليم وهي مطمئنة لحفظ الباري سبحانه.',
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
        prompt: `ما هي الآية التالية مباشرة في ${surahMeta.name} بعد قوله تعالى (الآية ${currentAyah.number})؟`,
        arabicSnippet: cleanAyahText(currentAyah.text, surah.number, currentAyah.number),
        surahReference: `${surahMeta.name} (${surah.number}:${currentAyah.number})`,
        translation: currentAyah.translation || '',
        options,
        correctIndex: Math.max(0, correctIndex),
        explanation: `الآية ${nextAyah.number} تلي مباشرة: «${cleanAyahText(nextAyah.text, surah.number, nextAyah.number)}»`,
        tadabburPearl: `استحضر المعنى المتصل بين الآيتين في ${surahMeta.name} لترسيخ الحفظ وتذوق النظم القرآني.`,
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
        prompt: `ما هي الكلمة القرآنية الناقصة في ${surahMeta.name} (الآية ${ayah.number})؟`,
        arabicSnippet: maskedText,
        surahReference: `${surahMeta.name} (${surah.number}:${ayah.number})`,
        translation: ayah.translation || '',
        options,
        correctIndex: Math.max(0, correctIndex),
        explanation: `الكلمة الصحيحة هي: «${targetWord}» من الآية الكريمة رقم ${ayah.number}.`,
        tadabburPearl: `كل حرف في ${surahMeta.name} بعشر حسنات؛ تأمل دقة المبنى وجلال المعنى.`,
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
