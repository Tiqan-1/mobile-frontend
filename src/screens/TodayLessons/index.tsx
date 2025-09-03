import CircleStatus from '@/components/atoms/CircleStatus';
import { SmallTitle, Text } from '@/components/atoms/Text';
import { VideoModal } from '@/components/organisms/VideoModal';
import { SafeScreen } from '@/components/templates';
import { useAppSelector } from '@/hooks/useAppDispatch';
import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import { useTheme } from '@/theme';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import React, { useMemo, useState } from 'react';
import 'moment/locale/ar';
import { SHADOW } from '@/theme/styles';
import i18n from '@/translations';
import type { Lesson, Level as LEVEL, Program, Task } from '@/types/program';
import { useTranslation } from 'react-i18next';
import { FlatList, Linking, StyleSheet, TouchableOpacity, View } from 'react-native';
import type { DateData } from 'react-native-calendars';
import { Calendar, LocaleConfig } from 'react-native-calendars';

LocaleConfig.locales['ar'] = {
  monthNames: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  monthNamesShort: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  dayNames: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  dayNamesShort: ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'],
  today: 'اليوم',
};
LocaleConfig.locales['en'] = {
  monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  today: 'Today',
};
LocaleConfig.defaultLocale = i18n.language;

function TodayLessons({ navigation }: RootScreenProps<Paths.TodayLessons>) {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const { items: subscriptions } = useAppSelector(state => state.subscriptions);
  const [selectedVideo, setSelectedVideo] = useState<Lesson | null>(null);
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));

  // Set moment locale based on current language
  React.useEffect(() => {
    moment.locale(i18n.language);
  }, [i18n.language]);
  React.useEffect(() => {
    setSelectedDate(moment().format('YYYY-MM-DD'));
  }, []);

  const LessonCard = ({ subscription }: { subscription: { currentLevel: LEVEL; lesson: Lesson; program: Program; task: Task } }) => {
    const { lesson, task, currentLevel: level, program } = subscription;
    const { colors } = useTheme();
    const navigation = useNavigation();

    const onCardPress = (item: Lesson) => {
      const url = item.url;
      if (item.type === 'video' && (url.includes('youtube') || url.includes('youtu.be'))) {
        setSelectedVideo(item);
      } else if (item.type === 'pdf') {
        navigation.navigate(Paths.PDF, { ...item });
      } else {
        Linking.openURL(item.url);
      }
    };

    return (
      <TouchableOpacity style={[styles.card, { backgroundColor: colors.SURFACE }]} onPress={() => onCardPress(lesson)}>
        <View style={styles.timeContainer}>
          <Text style={[styles.timeText, { color: colors.BLACK }]}>{task && moment(new Date(task.date)).format('HH:mm')}</Text>
        </View>
        <CircleStatus Dtstatus={task.date} />
        <View style={styles.contentContainer}>
          <Text style={[styles.type, { color: colors.GREY }]}>
            {t('TodayLessons.programLevel', { program: program.name, level: level?.name })}
          </Text>
          <Text style={[styles.title, { color: colors.BLACK }]}>{lesson.title}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const allLessons = useMemo(() => {
    return subscriptions
      .flatMap(subscription => {
        if (!subscription.currentLevel) {
          return [];
        }
        return (
          subscription.currentLevel.tasks?.flatMap((task: Task) =>
            task.lessons.map((lesson: Lesson) => ({
              lesson,
              task,
              program: subscription.program,
              currentLevel: subscription.currentLevel!,
            })),
          ) || []
        );
      })
      .filter(Boolean);
  }, [subscriptions]);

  const markedDates = useMemo(() => {
    const dates: { [key: string]: { dots: { color: string }[] } } = {};
    allLessons.forEach(({ task }) => {
      if (!task) {
        return;
      }
      const date = moment(task.date).locale('en').format('YYYY-MM-DD');
      const dateStatus = moment(new Date(task.date)).diff(moment().startOf('day'), 'days');
      let colorSelected = '';
      if (dateStatus < 0) {
        colorSelected = colors.ERROR;
      } else if (dateStatus === 0) {
        colorSelected = colors.BUTTON_MAIN_COLOR;
      } else {
        colorSelected = colors.WARNING;
      }
      if (!dates[date]) {
        dates[date] = {
          dots: [{ color: colorSelected }],
        };
      } else {
        dates[date].dots.push({ color: colorSelected });
      }
    });
    return dates;
  }, [allLessons, colors]);

  const selectedDateLessons = useMemo(() => {
    return allLessons.filter(({ task }) => moment(task.date).locale('en').format('YYYY-MM-DD') === selectedDate);
  }, [allLessons, selectedDate]);

  const onDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  return (
    <SafeScreen>
      <View style={styles.container}>
        <SmallTitle style={[styles.header, { color: colors.BLACK }]}>{t('TodayLessons.title')}</SmallTitle>
        <Calendar
          onDayPress={onDayPress}
          markedDates={{
            ...markedDates,
            [selectedDate]: {
              ...markedDates[selectedDate],
              selected: true,
              selectedColor: colors.PRIMARY_COLOR,
            },
          }}
          markingType="multi-dot"
          theme={{
            todayTextColor: colors.PRIMARY_COLOR,
            arrowColor: colors.PRIMARY_COLOR,
            dotColor: colors.PRIMARY_COLOR,
            selectedDayBackgroundColor: colors.PRIMARY_COLOR,
            selectedDayTextColor: colors.WHITE,
            calendarBackground: colors.APP_BACKGROUND,
          }}
          monthFormat="MMMM yyyy"
        />
        <View style={styles.lessonsContainer}>
          <Text style={[styles.dateHeader, { color: colors.BLACK }]}>{moment(selectedDate).format('MMMM D, YYYY')}</Text>
          {selectedDateLessons.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.GREY }]}>{t('TodayLessons.noLessons')}</Text>
            </View>
          ) : (
            <FlatList
              data={selectedDateLessons}
              renderItem={({ item }) => (item ? <LessonCard subscription={item} /> : null)}
              keyExtractor={(item, index) => (item ? `${item.lesson.id}-${index}` : `empty-${index}`)}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
        <VideoModal selectedVideo={selectedVideo} onClose={() => setSelectedVideo(null)} />
      </View>
    </SafeScreen>
  );
}

export default TodayLessons;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  lessonsContainer: {
    flex: 1,
    marginTop: 16,
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    marginHorizontal: 16,
  },
  listContainer: {
    paddingBottom: 16,
  },
  card: {
    ...SHADOW,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeContainer: {
    width: 60,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    marginLeft: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  type: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
