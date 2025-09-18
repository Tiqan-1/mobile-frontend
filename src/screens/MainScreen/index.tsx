import CircleStatus from '@/components/atoms/CircleStatus';
import { SmallText, SmallTitle, Text } from '@/components/atoms/Text';
import { SafeScreen } from '@/components/templates';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import { GET, initStateAPIState } from '@/services/API';
import { Pagination, type PaginationState } from '@/services/Pagination';
import { setSubscriptions } from '@/store/subscriptionSlice';
import { useTheme } from '@/theme';
import { SHADOW } from '@/theme/styles';
import type { Lesson, Subscription, Task } from '@/types/program';
import { calculateProgress, parseRemaining } from '@/utils/dateTime';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';

type ViewMode = 'subscription' | 'timeline';

const ProgramCard = ({ program }: { program: Subscription }) => {
  const { colors } = useTheme();
  const progress = program.currentLevel ? calculateProgress(program.currentLevel.start, program.currentLevel.end) : 0;
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.SURFACE }]}
      onPress={() => {
        navigation.navigate(Paths.Subscription, program);
      }}>
      <View style={styles.cardContent}>
        <FastImage
          resizeMode="contain"
          source={
            program.program.thumbnail
              ? { uri: `data:image/png;base64,${program.program.thumbnail}` }
              : require('@/assets/images/noImage.png')
          }
          defaultSource={require('@/assets/images/noImage.png')}
          style={styles.programImage}
        />
        <View style={styles.programInfo}>
          <Text style={[styles.programName, { color: colors.BLACK }]}>
            {program.program.name} - {program.currentLevel?.name}
          </Text>
          <Text numberOfLines={2} style={[styles.description, { color: colors.BLACK, opacity: 0.7 }]}>
            {program.program.description}
          </Text>
        </View>
      </View>
      {/* <View style={styles.progressContainer}>
        <View style={styles.progressLabels}>
          <Text style={[styles.dateText, { color: colors.BLACK }]}>بدء البرنامج {parseRemaining(program.currentLevel?.start)}</Text>
          <Text style={[styles.registrationText, { color: colors.BLACK }]}>
            انتهاء البرنامج: {parseRemaining(program.currentLevel?.end)}
          </Text>
        </View>
        <View style={[styles.progressBar, { backgroundColor: colors.GREY }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: progress > 100 ? colors.ERROR : colors.WARNING,
                width: `${progress}%`,
              },
            ]}
          />
        </View>
      </View> */}
    </TouchableOpacity>
  );
};

const TimelineCard = ({ lesson, program, task }: { lesson: Lesson; program: Subscription; task: Task }) => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { t } = useTranslation();
  return (
    <TouchableOpacity
      style={[styles.timelineCard, { backgroundColor: colors.SURFACE }]}
      onPress={() => navigation.navigate(Paths.Subscription, program)}>
      <View style={styles.dateContainer}>
        <SmallTitle style={[styles.dateDayText, { color: colors.BLACK }]}>{moment(new Date(task.date)).format('DD')}</SmallTitle>
        <Text style={[styles.dateMonthText, { color: colors.GREY }]}>{moment(new Date(task.date)).format('MMM')}</Text>
      </View>
      <CircleStatus Dtstatus={lesson.date} />
      <View style={styles.lessonInfo}>
        <Text style={[styles.programLabel, { color: colors.GREY }]}>
          {t('TodayLessons.programLevel', { program: program.program.name, level: program.currentLevel?.name })}
        </Text>
        <Text style={[styles.lessonTitle, { color: colors.BLACK }]}>{lesson.title}</Text>
      </View>
    </TouchableOpacity>
  );
};

// Loading shimmer for program cards
const ProgramCardShimmer = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.SURFACE }]}>
      <View style={styles.cardContent}>
        <View style={[styles.shimmerImage, { backgroundColor: colors.DISABLED }]} />
        <View style={styles.programInfo}>
          <View style={[styles.shimmerText, { backgroundColor: colors.DISABLED, width: '80%', height: 20 }]} />
          <View style={[styles.shimmerText, { backgroundColor: colors.DISABLED, width: '90%', marginTop: 8 }]} />
          <View style={[styles.shimmerText, { backgroundColor: colors.DISABLED, width: '60%', marginTop: 8 }]} />
        </View>
      </View>
      {/* <View style={styles.progressContainer}>
        <View style={styles.progressLabels}>
          <View style={[styles.shimmerText, { backgroundColor: colors.DISABLED, width: '40%' }]} />
          <View style={[styles.shimmerText, { backgroundColor: colors.DISABLED, width: '40%' }]} />
        </View>
        <View style={[styles.progressBar, { backgroundColor: colors.DISABLED }]}>
          <View style={[styles.progressFill, { backgroundColor: colors.GREY, width: '60%' }]} />
        </View>
      </View> */}
    </View>
  );
};

function MainScreen({ navigation }: RootScreenProps<Paths.Main>) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth) || { name: 'المستخدم' };
  const { items: subscriptionsState } = useAppSelector(state => state.subscriptions) || {};
  const { colors: themeColors } = useTheme();

  const [viewMode, setViewMode] = useState<ViewMode>('subscription');
  const [apiState, setapiState] = useState<PaginationState<Subscription>>({
    ...initStateAPIState,
    url: '/api/students/subscriptions/v2',
    pagination: { page: 1 },
  });

  const ItemClass = useMemo(() => new Pagination<Subscription>(apiState, setapiState), [apiState]);

  useEffect(() => {
    ItemClass.init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = () => {
    ItemClass.reload(apiState);
  };

  const onEndReached = () => {
    if (apiState.loading) {
      return;
    }
    if (apiState.pagination?.page) {
      ItemClass.next(apiState);
    }
  };

  useEffect(() => {
    if (apiState.results.length) {
      dispatch(setSubscriptions(apiState.results as Subscription[]));
    }
  }, [apiState.results, dispatch]);

  const getTimelineData = () => {
    if (!subscriptionsState) {
      return [];
    }

    return subscriptionsState
      .flatMap((subscription: Subscription) =>
        subscription.currentLevel?.tasks?.flatMap((task: Task) =>
          task.lessons.map((lesson: Lesson) => ({
            ...lesson,
            program: subscription,
            lesson: task,
          })),
        ),
      )
      .filter(Boolean)
      .sort((a: Lesson & { program?: Subscription; lesson?: Task }, b: Lesson & { program?: Subscription; lesson?: Task }) => {
        if (!a?.date || !b?.date) {
          return 0;
        }
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
  };

  const goToToday = () => {
    const today = moment().startOf('day');
    const timelineData = getTimelineData();
    const todayIndex = timelineData.findIndex(
      (item: Lesson & { program?: Subscription; lesson?: Task }) => item?.date && moment(item.date).startOf('day').isSame(today),
    );

    if (todayIndex !== -1) {
      // Scroll to today's lesson
      // Implementation depends on your FlatList ref
    }
  };

  return (
    <SafeScreen>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.welcomeText}>اهلا, {user.name}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.viewButton,
                {
                  backgroundColor: viewMode === 'subscription' ? themeColors.PRIMARY_COLOR : 'transparent',
                  borderColor: themeColors.PRIMARY_COLOR,
                  borderWidth: 1,
                },
              ]}
              onPress={() => setViewMode('subscription')}>
              <SmallText
                style={[styles.buttonText, { color: viewMode === 'subscription' ? themeColors.WHITE : themeColors.PRIMARY_COLOR }]}>
                الاشتراكات
              </SmallText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.viewButton,
                {
                  backgroundColor: viewMode === 'timeline' ? themeColors.PRIMARY_COLOR : 'transparent',
                  borderColor: themeColors.PRIMARY_COLOR,
                  borderWidth: 1,
                },
              ]}
              onPress={() => setViewMode('timeline')}>
              <SmallText style={[styles.buttonText, { color: viewMode === 'timeline' ? themeColors.WHITE : themeColors.PRIMARY_COLOR }]}>
                الجدول الزمني
              </SmallText>
            </TouchableOpacity>
          </View>
        </View>

        {viewMode === 'subscription' ? (
          <FlatList
            data={(apiState.results as Subscription[]) || subscriptionsState}
            renderItem={({ item }) => (item ? <ProgramCard program={item} /> : null)}
            keyExtractor={(item, index) => item?.id || `item-${index}`}
            onEndReached={onEndReached}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshing={apiState.loading && !apiState.results.length}
            onRefresh={onRefresh}
            ListEmptyComponent={() =>
              apiState.loading ? (
                <View>
                  <ProgramCardShimmer />
                  <ProgramCardShimmer />
                  <ProgramCardShimmer />
                </View>
              ) : (
                <View style={styles.emptyStateContainer}>
                  <FastImage source={require('@/assets/images/noImage.png')} style={styles.emptyStateImage} resizeMode="contain" />
                  <Text style={[styles.emptyStateTitle, { color: themeColors.BLACK }]}>لا يوجد اشتراكات</Text>
                  <Text style={[styles.emptyStateText, { color: themeColors.GREY }]}>يمكنك اضافة اشتراك جديد من خلال البرامج المتاحة</Text>
                  <TouchableOpacity
                    style={[styles.emptyStateButton, { backgroundColor: themeColors.PRIMARY_COLOR }]}
                    onPress={() => navigation.navigate(Paths.Programs)}>
                    <Text style={[styles.emptyStateButtonText, { color: themeColors.WHITE }]}>عرض البرامج المتاحة</Text>
                  </TouchableOpacity>
                </View>
              )
            }
          />
        ) : (
          <View style={styles.timelineContainer}>
            <TouchableOpacity style={[styles.todayButton, { backgroundColor: themeColors.PRIMARY_COLOR }]} onPress={goToToday}>
              <SmallText style={[styles.todayButtonText, { color: themeColors.WHITE }]}>دروس اليوم</SmallText>
            </TouchableOpacity>
            <FlatList
              data={getTimelineData()}
              renderItem={({ item }) => {
                if (!item) {
                  return null;
                }
                return <TimelineCard task={item?.lesson as Task} lesson={item as Lesson} program={item?.program as Subscription} />;
              }}
              keyExtractor={(item, index) => (item?.id ? `${item.id}-${index}` : `timeline-${index}`)}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              refreshing={apiState.loading && !apiState.results.length}
              onRefresh={onRefresh}
              ListEmptyComponent={() => (
                <View style={styles.emptyStateContainer}>
                  <FastImage source={require('@/assets/images/noImage.png')} style={styles.emptyStateImage} resizeMode="contain" />
                  <Text style={[styles.emptyStateTitle, { color: themeColors.BLACK }]}>لا يوجد دروس</Text>
                  <Text style={[styles.emptyStateText, { color: themeColors.GREY }]}>سجل في برامج جديدة لمشاهدة الدروس المتاحة لك</Text>
                </View>
              )}
            />
          </View>
        )}
      </View>
    </SafeScreen>
  );
}

export default MainScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    paddingTop: 6,
    paddingBottom: 24,
  },
  card: {
    ...SHADOW,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    marginHorizontal: 16,
  },
  timelineCard: {
    ...SHADOW,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    marginHorizontal: 16,
  },
  programName: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    marginBottom: 12,
    lineHeight: 20,
  },
  dateText: {
    fontWeight: '500',
  },
  registrationText: {
    fontWeight: '500',
  },
  progressContainer: {
    marginVertical: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  viewButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    ...SHADOW,
  },
  buttonText: {
    fontWeight: '600',
  },
  todayButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 16,
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: 4,
  },
  todayButtonText: {
    fontWeight: '600',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  programImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 10,
  },
  programInfo: {
    flex: 1,
    paddingHorizontal: 10,
  },
  shimmerImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 10,
  },
  shimmerText: {
    height: 14,
    borderRadius: 7,
    marginBottom: 4,
  },
  emptyStateImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyStateText: {
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 30,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  welcomeText: {
    fontWeight: 'bold',
  },
  dateContainer: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  dateDayText: {
    fontWeight: 'bold',
  },
  dateMonthText: {
    marginTop: 2,
  },
  lessonInfo: {
    flex: 1,
    paddingHorizontal: 10,
  },
  programLabel: {
    marginBottom: 4,
  },
  lessonTitle: {
    fontWeight: '600',
  },
  emptyStateButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
    ...SHADOW,
  },
  emptyStateButtonText: {
    fontWeight: '600',
  },
  timelineContainer: {
    flex: 1,
    // paddingTop: 10,
  },
});
