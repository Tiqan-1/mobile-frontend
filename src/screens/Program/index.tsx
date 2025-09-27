import Clock from '@/assets/svg-app/clock.svg';
import Levels from '@/assets/svg-app/level.svg';
import List from '@/assets/svg-app/list.svg';
import Video from '@/assets/svg-app/video.svg';
import { handleErrorMessage, handleSuccessMessage } from '@/components/atoms/FlashMessage';
import { SmallText, Text, Title } from '@/components/atoms/Text';
import { SafeScreen } from '@/components/templates';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import { DELETE, POST } from '@/services/API';
import { setSubscriptions } from '@/store/subscriptionSlice';
import { useTheme } from '@/theme';
import { PALETTE } from '@/theme/colors';
import type { Level, Program, Subscription } from '@/types/program';
import { calculateProgress, parseRemaining, remaingDays } from '@/utils/dateTime';
import moment from 'moment';
import React, { useState } from 'react';
import { Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

const ProgramCard = ({ level, program }: { level: Level; program: Program }) => {
  const { colors } = useTheme();
  const { items: subscriptionsState } = useAppSelector(state => state.subscriptions);

  // const registerd = subscriptionsState.find(sub => sub.currentLevel?.id === level.id);

  return (
    <View style={[styles.card, { backgroundColor: colors.SURFACE }]}>
      <Text isBold style={[styles.programName, { color: colors.BLACK }]}>
        {level.name}
      </Text>
      <View style={styles.datesContainer}>
        <SmallText style={[styles.registrationText, { color: colors.BLACK }]}>انتهاء التسجيل: {parseRemaining(level.start)}</SmallText>
        <SmallText style={[styles.dateText, { color: colors.BLACK }]}>بدء البرنامج {parseRemaining(level.start)}</SmallText>
      </View>
    </View>
  );
};

function Program({ navigation, route }: RootScreenProps<Paths.Program>) {
  const program: Program = route.params || Program;
  const { items: subscriptionsState } = useAppSelector(state => state.subscriptions);
  const dispatch = useAppDispatch();

  // useEffect(() => {
  //   navigation.setOptions({ title: program.name, headerShown: true, });
  // }, []);
  const { colors } = useTheme();
  //count program.levels.task
  const subjects = program.levels?.reduce<number>((acc: number, level) => {
    const typedLevel = level as Level;
    return acc + (typedLevel.tasks?.length || 0);
  }, 0);

  const video = program.levels?.reduce<number>((acc: number, level: unknown) => {
    const typedLevel = level as Level;
    return (
      acc +
      typedLevel.tasks?.reduce((acc, task) => {
        return acc + (task.lessons?.length || 0);
      }, 0)
    );
  }, 0);

  const progress = calculateProgress(program.registrationStart, program.registrationEnd);

  const [isRegisterd, setIsRegisterd] = useState<boolean>(!!program?.subscriptionId || !!subscriptionsState?.find(sub => sub.program?.id === program.id));

  return (
    <SafeScreen>
      <View style={styles.container}>
        <View style={styles.header}>
          <Title bgColor={styles.header.backgroundColor}>{program.name}</Title>
          <Text bgColor={styles.header.backgroundColor}>يبدا فى {moment(new Date(program.start)).format('YYYY/MM/DD')}</Text>

          <View style={styles.row}>
            <View style={styles.element}>
              <Levels style={{ marginHorizontal: 3 }} />
              <Text bgColor={styles.header.backgroundColor}>{` ${program.levels?.length || 0} مستويات `}</Text>
            </View>
            <View style={styles.element}>
              <List style={{ marginHorizontal: 3 }} />
              <Text bgColor={styles.header.backgroundColor}>{` ${subjects} مهام `}</Text>
            </View>
            <View style={styles.element}>
              <Video style={{ marginHorizontal: 3 }} />
              <Text bgColor={styles.header.backgroundColor}>{` ${video} محاضرة `}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.element}>
              <Clock style={{ marginHorizontal: 3 }} />
              <Text bgColor={styles.header.backgroundColor}>{remaingDays(program.end) - remaingDays(program.start)} يوم</Text>
            </View>
          </View>
        </View>

        <FlatList
          data={program.levels as Level[]}
          renderItem={({ item }) => <ProgramCard level={item} program={program} />}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* FAB for subscription or navigation */}
      {isRegisterd && (
        <TouchableOpacity
          style={[styles.fab2, { backgroundColor: colors.ERROR }]}
          onPress={() => {
            Alert.alert('سيتم الغاء تسجيلك فى برنامج', program.name, [
              {
                text: 'نعم',
                onPress: () =>
                  DELETE('/api/students/subscriptions/' + `${program.subscriptionId}`, {})
                    .then(res => {
                      handleSuccessMessage(res.data?.message ?? 'تم الغاء تسجيلك بنجاح');
                      const newSubscriptions = subscriptionsState.filter(sub => sub.id !== program.id);
                      dispatch(setSubscriptions([...newSubscriptions] as Subscription[]));
                      program.subscriptionId = '';
                      setIsRegisterd(false);
                    })
                    .catch(error => {
                      handleErrorMessage(error);
                    }),
              },
              {
                text: 'الغاء',
                isPreferred: true,
                style: 'cancel',
              },
            ]);
          }}>
          <Text style={styles.fabText}>x</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.PRIMARY_COLOR }]}
        onPress={() => {
          if (isRegisterd) {
            navigation.navigate(Paths.Subscription, { program });
          } else {
            Alert.alert('سيتم تسجيلك فى برنامج', program.name, [
              {
                text: 'نعم',
                onPress: () =>
                  POST('/api/students/subscriptions/v2/create', {
                    programId: `${program.id}`,
                  })
                    .then(res => {
                      handleSuccessMessage(res.data?.message ?? 'تم تسجيلك بنجاح');
                      dispatch(setSubscriptions([...subscriptionsState, { ...program }] as Subscription[]));
                      program.subscriptionId = res.data?.id;
                      setIsRegisterd(true);
                    })
                    .catch(error => {
                      handleErrorMessage(error);
                    }),
              },
              {
                text: 'الغاء',
                isPreferred: true,
                style: 'cancel',
              },
            ]);
          }
        }}>
        <Text isBold style={styles.fabText}>
          {isRegisterd ? '→' : '+'}
        </Text>
      </TouchableOpacity>
    </SafeScreen>
  );
}

export default Program;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  element: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingBottom: 16,
  },
  header: {
    backgroundColor: PALETTE.BG_PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  programName: {
    marginBottom: 8,
  },
  description: {
    marginBottom: 12,
    lineHeight: 20,
  },
  datesContainer: {
    gap: 4,
  },

  statusTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
    position: 'absolute',
    right: 16,
    bottom: 16,
    zIndex: 1,
  },
  statusText: {
    fontWeight: '600',
  },

  progressContainer: {
    // marginVertical: 0,
  },
  progressBar: {
    height: 6,
    borderRadius: 2,
    overflow: 'visible',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },

  registrationText: {},
  dateText: {},
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  fab: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fab2: {
    position: 'absolute',
    bottom: 40 + 60,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: {
    color: '#FFFFFF',
  },
});
