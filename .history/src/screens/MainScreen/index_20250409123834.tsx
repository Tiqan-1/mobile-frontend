import type { RootScreenProps } from '@/navigation/types';

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import type { Paths } from '@/navigation/paths';

import { SmallTitle, Text } from '@/components/atoms/Text';
import { SafeScreen } from '@/components/templates';

import { GET, initStateAPIState } from '@/services/API';
import { parseRemaining } from '@/utils/dateTime';


const ProgramCard = ({ program }: { program: Subcription;  }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.SURFACE }]}
      onPress={() => {
      }}>
      <Text style={[styles.programName, { color: colors.BLACK }]}>{program.program.name} - {program.level.name}</Text>
      <View style={styles.datesContainer}>
        <Text style={[styles.registrationText, { color: colors.BLACK }]}>
          انتهاء التسجيل: {parseRemaining(program.level.start)}
        </Text>
        <Text style={[styles.dateText, { color: colors.BLACK }]}>بدء البرنامج {parseRemaining(program.level.start)}</Text>
      </View>
    </TouchableOpacity>
  );
};

function MainScreen({ navigation }: RootScreenProps<Paths.Main>) {
  const { isDark, colors } = useTheme();
  const { t, i18n } = useTranslation();
  const [apiState, setapiState] = useState<APISTATE>(initStateAPIState);
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth);

  useEffect(() => {
    GET('/api/students/subscriptions', {}, setapiState);
  }, []);

  const onRefresh = () => {
    GET('/api/students/subscriptions', {}, setapiState);
  };

  return (
    <SafeScreen>
      <View style={styles.container}>
        <SmallTitle>اهلا {user.name}</SmallTitle>
        <FlatList
          data={apiState.results as Subcription[]}
          renderItem={({ item }) => <ProgramCard program={item} />}
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

export default MainScreen;

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
