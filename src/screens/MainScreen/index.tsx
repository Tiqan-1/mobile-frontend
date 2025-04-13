import type { RootScreenProps } from '@/navigation/types';

import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import { useProgress } from '@/hooks/useProgress';
import { Paths } from '@/navigation/paths';

import { SmallTitle, Text } from '@/components/atoms/Text';
import { SafeScreen } from '@/components/templates';

import { GET, initStateAPIState } from '@/services/API';
import { calculateProgress, parseRemaining } from '@/utils/dateTime';
import { setSubscriptions } from '@/store/subscriptionSlice';

const ProgramCard = ({ program }: { program: Subscription }) => {
  const { colors } = useTheme();
  const progress = calculateProgress(program.level.start, program.level.end);
  const navigation = useNavigation();
  // const { saveProgress, getProgress } = useProgress(program.id);
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.SURFACE }]}
      onPress={() => {
        navigation.navigate(Paths.Subscription, program);
      }}>
      <Text style={[styles.programName, { color: colors.BLACK }]}>
        {program.program.name} - {program.level.name}
      </Text>

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: colors.GREY }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: colors.PRIMARY_COLOR,
                width: `${progress}%`,
              },
            ]}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

function MainScreen({ navigation }: RootScreenProps<Paths.Main>) {
  // const { isDark, colors } = useTheme();
  // const { t, i18n } = useTranslation();
  const [apiState, setapiState] = useState<APISTATE<Subscription>>(initStateAPIState);
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth);
  const { items: subscriptionsState,  } = useAppSelector((state) => state.subscriptions);

  useEffect(() => {
    GET('/api/students/subscriptions', {}, setapiState);
  }, []);
  useEffect(() => {
    if (apiState.results.length) {
      dispatch(setSubscriptions(apiState.results));
    }
  }, [apiState.results, dispatch]);

  const onRefresh = () => {
    GET('/api/students/subscriptions', {}, setapiState);
  };

  return (
    <SafeScreen>
      <View style={styles.container}>
        <SmallTitle>اهلا {user.name}</SmallTitle>
        <FlatList
          data={apiState.results as Subscription[]}
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
  progressContainer: {
    marginVertical: 12,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 12,
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
  progressDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    top: -4,
  },
});
