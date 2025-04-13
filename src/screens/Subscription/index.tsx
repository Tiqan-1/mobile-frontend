import type { RootScreenProps } from '@/navigation/types';

import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';
import { PALETTE } from '@/theme/colors';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import type { Paths } from '@/navigation/paths';

import { handleErrorMessage, handleSuccessMessage } from '@/components/atoms/FlashMessage';
import { SmallTitle, Text, Title } from '@/components/atoms/Text';
import { SafeScreen } from '@/components/templates';

import { GET, initStateAPIState, POST } from '@/services/API';
import { parseRemaining, remaingDays } from '@/utils/dateTime';

const ProgramCard = ({ task }: { task: Lesson }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.SURFACE }]} onPress={() => {}}>
      <Text style={[styles.programName, { color: colors.BLACK }]}>{task.title}</Text>
      <View style={styles.datesContainer}>
        <Text style={[styles.registrationText, { color: colors.BLACK }]}>
          {task.title}
          {task.url}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

function Subscription({ navigation, route }: RootScreenProps<Paths.Subscription>) {
  // const { isDark, colors, toggleTheme } = useTheme();
  // const { t, i18n } = useTranslation();
  const [apiState, setapiState] = useState<APISTATE>(initStateAPIState);
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth);
  const subscription = route.params;
  useEffect(() => {
    // GET('/api/students/open-programs', {}, setapiState);
    navigation.setOptions({ title: subscription.program.name });
  }, []);

  const onRefresh = () => {
    // GET('/api/students/open-programs', {}, setapiState);
  };

  return (
    <SafeScreen>
      <View style={styles.container}>
        <View style={styles.header}>
          <SmallTitle>{subscription.program.name}</SmallTitle>
          <Title>{subscription.program.name}</Title>
          <Text>{parseRemaining(subscription.program.registrationEnd)}</Text>
          <Text>{parseRemaining(subscription.program.registrationStart)}</Text>
          <Text>{parseRemaining(subscription.program.start)}</Text>
          <Text>{parseRemaining(subscription.program.end)}</Text>
          {/* <Text>{subscription.program.levels.length}</Text> */}
        </View>
        {subscription.level.tasks.map((task: Task , index) => (
          <View key={index}>
            <Text>{task.date}</Text>
            <Text>{task.id}</Text>
            <FlatList
              data={task.lessons}
              renderItem={({ item }) => <ProgramCard task={item} />}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              refreshing={apiState.loading && !apiState.results}
              onRefresh={onRefresh}
            />
          </View>
        ))}
      </View>
    </SafeScreen>
  );
}

export default Subscription;

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
