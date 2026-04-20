import mildImage from '../assets/mild.png';
import mildVideo from '../assets/mild.mp4';
import moderateImage from '../assets/moderate.png';
import moderateVideo from '../assets/moderate.mp4';
import normalImage from '../assets/normal.png';
import normalVideo from '../assets/normal.mp4';
import severeImage from '../assets/severe.png';
import severeVideo from '../assets/severe.mp4';
import type { Service } from '../types/service';

export const SERVICES_MOCK: Service[] = [
  {
    id: 1,
    name: 'Нормальная оксигенация',
    benchmark: 'PaO2/FiO2 > 300 мм рт.ст.',
    shortDescription: 'Нормальный газообмен.',
    fullDescription: 'Показатели соответствуют норме. Клинически значимой дыхательной недостаточности нет.',
    clinicalSigns: 'Одышки нет; SpO2 обычно > 95%; стабильные газы крови.',
    recommendations: 'Наблюдение в динамике; контроль сатурации и общего состояния.',
    availableDate: '2026-04-10',
    imageUrl: normalImage,
    videoUrl: normalVideo,
    indexMin: 301,
    indexMax: null,
  },
  {
    id: 2,
    name: 'Легкая ДН',
    benchmark: 'PaO2/FiO2 201-300 мм рт.ст.',
    shortDescription: 'Легкая дыхательная недостаточность.',
    fullDescription: 'Умеренно сниженная оксигенация с риском прогрессирования при неблагоприятной динамике.',
    clinicalSigns: 'Одышка при нагрузке; SpO2 90-94%; умеренная тахипноэ.',
    recommendations: 'Кислородотерапия по показаниям; контроль газов крови в динамике.',
    availableDate: '2026-04-11',
    imageUrl: mildImage,
    videoUrl: mildVideo,
    indexMin: 201,
    indexMax: 300,
  },
  {
    id: 3,
    name: 'Умеренная ДН (ОРДС)',
    benchmark: 'PaO2/FiO2 101-200 мм рт.ст.',
    shortDescription: 'Умеренная дыхательная недостаточность (ОРДС).',
    fullDescription:
      'Значимое нарушение газообмена, требующее активного наблюдения и коррекции респираторной поддержки.',
    clinicalSigns: 'Одышка в покое; SpO2 85-89%; тахипноэ более 20 в минуту.',
    recommendations: 'Мониторинг газов крови каждые 4-6 часов; оценка необходимости NIV/ИВЛ.',
    availableDate: '2026-04-12',
    imageUrl: moderateImage,
    videoUrl: moderateVideo,
    indexMin: 101,
    indexMax: 200,
  },
  {
    id: 4,
    name: 'Тяжелая ДН (ОРДС)',
    benchmark: 'PaO2/FiO2 <= 100 мм рт.ст.',
    shortDescription: 'Тяжелая дыхательная недостаточность (ОРДС).',
    fullDescription: 'Критическая гипоксемия, требующая интенсивной терапии и респираторной поддержки.',
    clinicalSigns: 'Выраженная дыхательная недостаточность; SpO2 < 85%; признаки истощения дыхания.',
    recommendations: 'Интенсивная терапия; инвазивная вентиляция по показаниям; круглосуточный мониторинг.',
    availableDate: '2026-04-13',
    imageUrl: severeImage,
    videoUrl: severeVideo,
    indexMin: null,
    indexMax: 100,
  },
];
