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
    shortDescription: 'Нормальный газообмен без признаков дыхательной недостаточности.',
    shortDescriptionEn: 'Normal oxygenation with stable gas exchange.',
    fullDescription:
      'Показатели соответствуют физиологической норме, критических респираторных нарушений не выявлено.',
    clinicalSigns: 'Одышки нет, SpO2 обычно выше 95%, гемодинамика стабильна.',
    recommendations: 'Наблюдение в динамике и рутинный контроль сатурации.',
    availableDate: '2026-04-10',
    imageUrl: normalImage,
    videoUrl: normalVideo,
    embeddingText: 'Normal oxygenation, stable blood gases, no signs of respiratory distress.',
    indexMin: 301,
    indexMax: null,
  },
  {
    id: 2,
    name: 'Легкая дыхательная недостаточность',
    benchmark: 'PaO2/FiO2 201-300 мм рт.ст.',
    shortDescription: 'Умеренное снижение оксигенации при сохраненной компенсации.',
    shortDescriptionEn: 'Mild respiratory failure with reduced oxygenation.',
    fullDescription:
      'Есть риск прогрессирования при неблагоприятной динамике, требуется более частый контроль состояния.',
    clinicalSigns: 'Одышка при нагрузке, SpO2 90-94%, умеренная тахипноэ.',
    recommendations: 'Кислородотерапия по показаниям и повторная оценка газов крови.',
    availableDate: '2026-04-11',
    imageUrl: mildImage,
    videoUrl: mildVideo,
    embeddingText: 'Mild respiratory failure with reduced oxygenation and mild dyspnea.',
    indexMin: 201,
    indexMax: 300,
  },
  {
    id: 3,
    name: 'Умеренная дыхательная недостаточность (ОРДС)',
    benchmark: 'PaO2/FiO2 101-200 мм рт.ст.',
    shortDescription: 'Клинически значимое нарушение газообмена.',
    shortDescriptionEn: 'Moderate respiratory failure with ARDS signs.',
    fullDescription:
      'Состояние требует активного мониторинга и подбора респираторной поддержки в зависимости от динамики.',
    clinicalSigns: 'Одышка в покое, SpO2 85-89%, тахипноэ более 20 в минуту.',
    recommendations: 'Мониторинг газов крови каждые 4-6 часов, оценка необходимости NIV/ИВЛ.',
    availableDate: '2026-04-12',
    imageUrl: moderateImage,
    videoUrl: moderateVideo,
    embeddingText: 'Moderate respiratory failure with clinically significant oxygen deficit and ARDS.',
    indexMin: 101,
    indexMax: 200,
  },
  {
    id: 4,
    name: 'Тяжелая дыхательная недостаточность (ОРДС)',
    benchmark: 'PaO2/FiO2 <= 100 мм рт.ст.',
    shortDescription: 'Критическая гипоксемия с риском декомпенсации.',
    shortDescriptionEn: 'Severe respiratory failure with critical hypoxemia.',
    fullDescription: 'Требуется интенсивная терапия и, как правило, инвазивная респираторная поддержка.',
    clinicalSigns: 'Выраженная дыхательная недостаточность, SpO2 ниже 85%, признаки утомления дыхания.',
    recommendations: 'Интенсивная терапия, ИВЛ по показаниям, круглосуточный мониторинг.',
    availableDate: '2026-04-13',
    imageUrl: severeImage,
    videoUrl: severeVideo,
    embeddingText: 'Severe respiratory failure with critical hypoxemia and need for intensive respiratory support.',
    indexMin: null,
    indexMax: 100,
  },
];
