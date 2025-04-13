import type { RootScreenProps } from '@/navigation/types';

import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';
import { PALETTE } from '@/theme/colors';
import type { Paths } from '@/navigation/paths';

import { handleErrorMessage, handleSuccessMessage } from '@/components/atoms/FlashMessage';
import { SmallTitle, Text, Title } from '@/components/atoms/Text';
import { SafeScreen } from '@/components/templates';

import { initStateAPIState, POST } from '@/services/API';
import { parseRemaining, remaingDays } from '@/utils/dateTime';
import moment from 'moment';

import Level from '@/assets/svg-app/level.svg'
import List from '@/assets/svg-app/list.svg'
import Video from '@/assets/svg-app/video.svg'
import Student from '@/assets/svg-app/student.svg'
import Clock from '@/assets/svg-app/clock.svg'

const ProgramCard = ({ level, programID }: { level: Level; programID: string }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.SURFACE }]}
      onPress={() => {
        Alert.alert('هل تود التسجيل فى برنامج', 'سيتم تسجيلك فى برنامج', [
          {
            text: 'نعم',
            onPress: () =>
              POST('/api/students/subscriptions/subscribe', { programId: `${programID}`, levelId: `${level.id}` })
                .then((res) => {
                  handleSuccessMessage(res.data.message | "تم تسجيلك بنجاح");
                })
                .catch((error) => {
                  handleErrorMessage(error.data.message);
                }),
          },
          {
            text: 'الغاء',
            isPreferred: true,
            style: 'cancel',
          },
        ]);
      }}>
      <Text style={[styles.programName, { color: colors.BLACK }]}>{level.name}</Text>
      <View style={styles.datesContainer}>
        <Text style={[styles.registrationText, { color: colors.BLACK }]}>
          انتهاء التسجيل: {parseRemaining(level.start)}
        </Text>
        <Text style={[styles.dateText, { color: colors.BLACK }]}>بدء البرنامج {parseRemaining(level.start)}</Text>
      </View>
    </TouchableOpacity>
  );
};

function Program({ navigation, route }: RootScreenProps<Paths.Program>) {
  const program: Program = route.params || Program;
  useEffect(() => {
    navigation.setOptions({ title: program.name, headerShown: true, });
  }, []);
  const { colors } = useTheme();
  //count program.levels.task
  const subjects = program.levels.reduce<number>((acc: number, level: Level) => {
    return acc + level.tasks.length;
  }, 0);

  const video = program.levels.reduce<number>((acc: number, level: Level) => {
    return acc + level.tasks.reduce((acc, task) => {
      return acc + task.lessons.length;
    }, 0);
  }, 0);


  return (
    <SafeScreen>
      <View style={styles.container}>
        <View style={styles.header}>
          <SmallTitle bgColor={styles.header.backgroundColor} >{program.name}</SmallTitle>
          <Title bgColor={styles.header.backgroundColor}>{program.name}</Title>
          <Text style={{ color: colors.WARNING }}>يبدا فى {moment(new Date(program.start)).format('YYYY/MM/DD')}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <View style={styles.element}><Level /><Text bgColor={styles.header.backgroundColor}>{` ${program.levels.length} مستويات `}</Text></View>
            <View style={styles.element}><List /><Text bgColor={styles.header.backgroundColor}>{` ${subjects} مواد `}</Text></View>
            <View style={styles.element}><Video /><Text bgColor={styles.header.backgroundColor}>{` ${video} محاضرة `}</Text></View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Student />
            <View style={styles.element}><Clock /><Text bgColor={styles.header.backgroundColor}>{remaingDays(program.end) - remaingDays(program.start)} يوم</Text></View>
          </View>


          <Text bgColor={styles.header.backgroundColor}>{parseRemaining(program.registrationStart)}</Text>
          <Text bgColor={styles.header.backgroundColor}>{parseRemaining(program.registrationEnd)}</Text>
          {/* <Text>{program.levels.length}</Text> */}
        </View>

        <FlatList
          data={program.levels as Level[]}
          renderItem={({ item }) => <ProgramCard programID={program.id} level={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeScreen>
  );
}

export default Program;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  element:
    { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  listContainer: {
    paddingBottom: 16,
  },
  header: {
    backgroundColor: PALETTE.BG_PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderRadius: 10,
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  datesContainer: {
    gap: 4,
  },
  dateText: {
    fontSize: 12,
  },
  registrationText: {
    fontSize: 12,
  },
});
