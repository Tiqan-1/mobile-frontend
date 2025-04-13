import type { RootScreenProps } from '@/navigation/types';

import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import { Paths } from '@/navigation/paths';

import { Text } from '@/components/atoms/Text';
import { SafeScreen } from '@/components/templates';

import { GET, initStateAPIState, POST } from '@/services/API';
import { parseRemaining } from '@/utils/dateTime';

interface Program {
  createdBy: Record<string, unknown>;
  description: string;
  end: string;
  id: string;
  levels: unknown[];
  name: string;
  registrationEnd: string;
  registrationStart: string;
  start: string;
}

const ProgramCard = ({ program }: { program: Program }) => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.SURFACE }]}
      onPress={() => {
        navigation.navigate(Paths.Program, program);
        // POST('/api/students/subscriptions/subscribe', { programId: `${program.id}` });
      }}>
      <Text style={[styles.programName, { color: colors.BLACK }]}>{program.name}</Text>
      <Text style={[styles.description, { color: colors.BLACK }]}>{program.description}</Text>
      <View style={styles.datesContainer}>
        <Text style={[styles.registrationText, { color: colors.BLACK }]}>
          انتهاء التسجيل: {parseRemaining(program.registrationEnd)}
        </Text>
        <Text style={[styles.dateText, { color: colors.BLACK }]}>بدء البرنامج {parseRemaining(program.start)}</Text>
      </View>
    </TouchableOpacity>
  );
};

function Programs({ navigation }: RootScreenProps<Paths.Programs>) {
  const { isDark, colors, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const [apiState, setapiState] = useState<APISTATE>(initStateAPIState);
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth);

  useEffect(() => {
    GET('/api/students/open-programs', {}, setapiState);
  }, []);

  const onRefresh = () => {
    GET('/api/students/open-programs', {}, setapiState);
  };

  return (
    <SafeScreen>
      <View style={styles.container}>
        <FlatList
          data={apiState.results as Program[]}
          renderItem={({ item }) => <ProgramCard program={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={apiState.loading && !apiState.results.length}
          onRefresh={onRefresh}
        />
      </View>
    </SafeScreen>
  );
}

export default Programs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  listContainer: {
    paddingBottom: 16,
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
