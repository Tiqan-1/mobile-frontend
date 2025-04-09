import type { RootScreenProps } from '@/navigation/types';

import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';
import { PALETTE } from '@/theme/colors';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import { Paths } from '@/navigation/paths';

import { handleErrorMessage, handleSuccessMessage } from '@/components/atoms/FlashMessage';
import { SmallTitle, Text, Title } from '@/components/atoms/Text';
import { SafeScreen } from '@/components/templates';

import { GET, initStateAPIState, POST } from '@/services/API';
import { parseRemaining, remaingDays } from '@/utils/dateTime';


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
                  handleSuccessMessage(res.data.message|"تم تسجيلك بنجاح");
                })
                .catch((res) => {
                  handleErrorMessage(res.data.message);
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
  const { isDark, colors, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const [apiState, setapiState] = useState<APISTATE>(initStateAPIState);
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth);
  const program: Program = route.params || Program;
  useEffect(() => {
    // GET('/api/students/open-programs', {}, setapiState);
    navigation.setOptions({ title: program.name });
  }, []);

  const onRefresh = () => {
    // GET('/api/students/open-programs', {}, setapiState);
  };

  return (
    <SafeScreen>
      <View style={styles.container}>
        <View style={styles.header}>
          <SmallTitle>{program.name}</SmallTitle>
          <Title>{program.name}</Title>
          <Text>{parseRemaining(program.registrationEnd)}</Text>
          <Text>{parseRemaining(program.registrationStart)}</Text>
          <Text>{parseRemaining(program.start)}</Text>
          <Text>{parseRemaining(program.end)}</Text>
          <Text>{program.levels.length}</Text>
          {/* <Text>{program.levels.length}</Text> */}
        </View>

        <FlatList
          data={program.levels as Level[]}
          renderItem={({ item }) => <ProgramCard programID={program.id} level={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={apiState.loading && !apiState.results}
          onRefresh={onRefresh}
        />
      </View>
    </SafeScreen>
  );
}

export default Program;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
