export interface MotivationalQuote {
  id: number;
  arabic: string;
  translation: string;
  source: string;
  theme: string;
  practicalTip: string;
}

export const MOTIVATIONAL_REFLECTIONS: MotivationalQuote[] = [
  {
    id: 1,
    arabic: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
    translation: 'The best among you are those who learn the Quran and teach it.',
    source: 'Sahih Al-Bukhari 5027',
    theme: 'Highest Honor',
    practicalTip: 'Even reciting or memorizing one single ayah today places you among the best in the eyes of the Creator.'
  },
  {
    id: 2,
    arabic: 'يُقَالُ لِصَاحِبِ الْقُرْآنِ: اقْرَأْ وَارْتَقِ وَرَتِّلْ كَمَا كُنْتَ تُرَتِّلُ فِي الدُّنْيَا، فَإِنَّ مَنْزِلَتَكَ عِنْدَ آخِرِ آيَةٍ تَقْرَؤُهَا',
    translation: 'It will be said to the companion of the Quran: Read, ascend, and recite as you used to recite in the world, for your status in Jannah is at the last verse you recite.',
    source: 'Abu Dawud & At-Tirmidhi (Hasan Sahih)',
    theme: 'Ascent in Jannah',
    practicalTip: 'Every ayah you commit to memory is another step higher in Paradise. Keep ascending.'
  },
  {
    id: 3,
    arabic: 'إِنَّ الَّذِي لَيْسَ فِي جَوْفِهِ شَيْءٌ مِنَ الْقُرْآنِ كَالْبَيْتِ الْخَرِبِ',
    translation: 'Verily, he in whose heart there is nothing of the Quran is like a ruined house.',
    source: 'Jami At-Tirmidhi 2913',
    theme: 'Spiritual Life',
    practicalTip: 'Renovate your heart today with words of revelation. Fill your chest with divine light.'
  },
  {
    id: 4,
    arabic: 'الَّذِي يَقْرَأُ القُرْآنَ وَهُوَ مَاهِرٌ بِهِ مَعَ السَّفَرَةِ الكِرَامِ البَرَرَةِ، وَالَّذِي يَقْرَأُ القُرْآنَ وَيَتَتَعْتَعُ فِيهِ وَهُوَ عَلَيْهِ شَاقٌّ لَهُ أَجْرَانِ',
    translation: 'The one who is skilled in the Quran will be with the noble angels; and the one who recites with difficulty, stammering through it, will receive a double reward.',
    source: 'Sahih Muslim 798',
    theme: 'Double Reward for Struggling',
    practicalTip: 'Never be discouraged when an ayah feels hard to memorize. Allah gives double reward for every hesitation and effort.'
  },
  {
    id: 5,
    arabic: 'وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ',
    translation: 'And We have certainly made the Quran easy for remembrance, so is there any who will remember?',
    source: 'Surah Al-Qamar (54:17)',
    theme: 'Divine Promise',
    practicalTip: 'Allah Himself promises that the Quran is made accessible. Trust the process and take it one verse at a time.'
  },
  {
    id: 6,
    arabic: 'مَنْ قَرَأَ حَرْفًا مِنْ كِتَابِ اللَّهِ فَلَهُ بِهِ حَسَنَةٌ، وَالْحَسَنَةُ بِعَشْرِ أَمْثَالِهَا',
    translation: 'Whoever recites a single letter from the Book of Allah will receive one reward, and each reward is multiplied by ten.',
    source: 'Jami At-Tirmidhi 2910',
    theme: 'Abundant Hasanat',
    practicalTip: 'Memorizing Surah Al-Fatihah alone (139 letters) yields over 1,390 good deeds each time you review.'
  },
  {
    id: 7,
    arabic: 'أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ',
    translation: 'The most beloved of deeds to Allah are those that are most consistent, even if they are small.',
    source: 'Sahih Al-Bukhari 6464',
    theme: 'Consistency Over Volume',
    practicalTip: '1 ayah memorized every day with solid review is far better than 20 ayahs memorized once and forgotten.'
  },
  {
    id: 8,
    arabic: 'اقْرَءُوا الْقُرْآنَ فَإِنَّهُ يَأْتِي يَوْمَ الْقِيَامَةِ شَفِيعًا لِأَصْحَابِهِ',
    translation: 'Recite the Quran, for it will come as an intercessor for its companions on the Day of Resurrection.',
    source: 'Sahih Muslim 804',
    theme: 'The Loyal Intercessor',
    practicalTip: 'The Quran will advocate for you when you need an advocate the most. Befriend it today.'
  },
  {
    id: 9,
    arabic: 'تَعَاهَدُوا هَذَا الْقُرْآنَ، فَوَالَّذِي نَفْسُ مُحَمَّدٍ بِيَدِهِ لَهُوَ أَشَدُّ تَفَلُّتًا مِنَ الإِبِلِ فِي عُقُلِهَا',
    translation: 'Keep refreshing your knowledge of the Quran, for by Him in Whose Hand is my life, it escapes faster than a camel from its rope.',
    source: 'Sahih Al-Bukhari 5033',
    theme: 'The Secret is Revision',
    practicalTip: 'Spending 5 minutes reviewing your past Surahs protects weeks of hard work. Always review before new Hifz.'
  },
  {
    id: 10,
    arabic: 'يُكْسَى وَالِدَاهُ حُلَّتَيْنِ لاَ تَقُومُ لَهُمَا أَهْلُ الدُّنْيَا، فَيَقُولاَنِ: بِمَ كُسِينَا هَذَا؟ فَيُقَالُ: بِأَخْذِ وَلَدِكُمَا الْقُرْآنَ',
    translation: 'The parents of the companion of the Quran will be dressed in two garments far exceeding this entire world. They will ask: Why were we honored with this? It will be said: Because your child held fast to the Quran.',
    source: 'Musnad Ahmad & Al-Hakim (Sahih)',
    theme: 'Crown for Your Parents',
    practicalTip: 'Every letter you memorize is the greatest gift of honor and mercy you can ever bestow upon your mother and father.'
  }
];
