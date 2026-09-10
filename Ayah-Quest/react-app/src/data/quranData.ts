import { Reciter, Surah } from '../types';

export const RECITERS: Reciter[] = [
  {
    id: 'ar.alafasy',
    name: 'Mishary Rashid Alafasy',
    style: 'Murattal with resonant cadence',
    cdnPath: 'https://everyayah.com/data/Alafasy_128kbps'
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
      { number: 1, surahNumber: 67, surahName: 'Al-Mulk', text: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ', translation: 'Blessed is He in whose hand is dominion, and He is over all things competent -' },
      { number: 2, surahNumber: 67, surahName: 'Al-Mulk', text: 'الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا وَهُوَ الْعَزِيزُ الْغَفُورُ', translation: '[He] who created death and life to test you [as to] which of you is best in deed - and He is the Exalted in Might, the Forgiving -' },
      { number: 3, surahNumber: 67, surahName: 'Al-Mulk', text: 'الَّذِي خَلَقَ سَبْعَ سَمَاوَاتٍ طِبَاقًا مَّا تَرَىٰ فِي خَلْقِ الرَّحْمَٰنِ مِن تَفَاوُتٍ فَارْجِعِ الْبَصَرَ هَلْ تَرَىٰ مِن فُطُورٍ', translation: '[And] who created seven heavens in layers. You do not see in the creation of the Most Merciful any inconsistency. So return [your] vision; do you see any breaks?' },
      { number: 4, surahNumber: 67, surahName: 'Al-Mulk', text: 'ثُمَّ ارْجِعِ الْبَصَرَ كَرَّتَيْنِ يَنقَلِبْ إِلَيْكَ الْبَصَرُ خَاسِئًا وَهُوَ حَسِيرٌ', translation: 'Then return [your] vision twice again. [Your] vision will return to you humbled while it is fatigued.' },
      { number: 5, surahNumber: 67, surahName: 'Al-Mulk', text: 'وَلَقَدْ زَيَّنَّا السَّمَاءَ الدُّنْيَا بِمَصَابِيحَ وَجَعَلْنَاهَا رُجُومًا لِّلشَّيَاطِينِ وَأَعْتَدْنَا لَهُمْ عَذَابَ السَّعِيرِ', translation: 'And We have certainly beautified the nearest heaven with lamps and have made [from] them what is thrown at the devils and have prepared for them the punishment of the Blaze.' },
      { number: 6, surahNumber: 67, surahName: 'Al-Mulk', text: 'وَلِلَّذِينَ كَفَرُوا بِرَبِّهِمْ عَذَابُ جَهَنَّمَ وَبِئْسَ الْمَصِيرُ', translation: 'And for those who disbelieved in their Lord is the punishment of Hell, and wretched is the destination.' },
      { number: 7, surahNumber: 67, surahName: 'Al-Mulk', text: 'إِذَا أُلْقُوا فِيهَا سَمِعُوا لَهَا شَهِيقًا وَهِيَ تَفُورُ', translation: 'When they are thrown into it, they hear from it a dreadful inhaling while it boils up.' },
      { number: 8, surahNumber: 67, surahName: 'Al-Mulk', text: 'تَكَادُ تَمَيَّزُ مِنَ الْغَيْظِ كُلَّمَا أُلْقِيَ فِيهَا فَوْجٌ سَأَلَهُمْ خَزَنَتُهَا أَلَمْ يَأْتِكُمْ نَذِيرٌ', translation: 'It almost bursts with rage. Every time a company is thrown into it, its keepers ask them, "Did there not come to you a warner?"' },
      { number: 9, surahNumber: 67, surahName: 'Al-Mulk', text: 'قَالُوا بَلَىٰ قَدْ جَاءَنَا نَذِيرٌ فَكَذَّبْنَا وَقُلْنَا مَا نَزَّلَ اللَّهُ مِن شَيْءٍ إِنْ أَنتُمْ إِلَّا فِي ضَلَالٍ كَبِيرٍ', translation: 'They will say,"Yes, a warner had come to us, but we denied and said, \'Allah has not sent down anything. You are not but in great error.\'"' },
      { number: 10, surahNumber: 67, surahName: 'Al-Mulk', text: 'وَقَالُوا لَوْ كُنَّا نَسْمَعُ أَوْ نَعْقِلُ مَا كُنَّا فِي أَصْحَابِ السَّعِيرِ', translation: 'And they will say, "If only we had been listening or reasoning, we would not be among the companions of the Blaze."' }
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
