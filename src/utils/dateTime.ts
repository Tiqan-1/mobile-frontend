import moment from 'moment';
import { useTranslation } from 'react-i18next';



export const remaingDays = (end) => {
  if (!end) {
    return '∞';
  }
  const a = moment(end);
  const b = moment(new Date());
  return a.diff(b, 'days');
};
export  const parseRemaining = (end) => {
  const { t, i18n } = useTranslation();

  const days = remaingDays(end);
  if (days < 0) {
    return `${t('Programs.past')} ${-days} ${t('Programs.day')}`;
  }
  return `${t('Programs.remainig')} ${days} ${t('Programs.day')}`;
};