import { SmallTitle, Text } from '@/components/atoms/Text';
import { SafeScreen } from '@/components/templates';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import { useProgress } from '@/hooks/useProgress';
import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import { GET, initStateAPIState } from '@/services/API';
import { logger } from '@/services/logger';
import { Pagination } from '@/services/Pagination';
import { setSubscriptions } from '@/store/subscriptionSlice';
import { useTheme } from '@/theme';
import { calculateProgress, parseRemaining } from '@/utils/dateTime';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';

const ProgramCard = ({ program }: { program: Subscription }) => {
  const { colors } = useTheme();
  const progress = calculateProgress(program.level.start, program.level.end);
  const navigation = useNavigation();
  // const { saveProgress, getProgress } = useProgress(program.id);
  // return (
  //   <TouchableOpacity
  //     style={[styles.card, { backgroundColor: colors.SURFACE }]}
  //     onPress={() => {
  //       navigation.navigate(Paths.Subscription, program);
  //     }}>
  //     <Text style={[styles.programName, { color: colors.BLACK }]}>
  //       {program.program.name} - {program.level.name}
  //     </Text>

  //     <View style={styles.progressContainer}>
  //       <View style={[styles.progressBar, { backgroundColor: colors.GREY }]}>
  //         <View style={[styles.progressFill, { backgroundColor: colors.PRIMARY_COLOR, width: `${progress}%` }]} />
  //       </View>
  //     </View>
  //   </TouchableOpacity>
  // );
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.SURFACE }]}
      onPress={() => {
        navigation.navigate(Paths.Subscription, program);
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <FastImage
          resizeMode="contain"
          source={
            program.program.thumbnail
              ? { uri: `data:image/png;base64,${program.program.thumbnail}` }
              : require('@/assets/images/noImage.png')
          }
          defaultSource={require('@/assets/images/noImage.png')}
          style={{ width: 50, height: 50, flex: 1 }}
        />
        <View style={{ flex: 4, paddingHorizontal: 10 }}>
          <Text style={[styles.programName, { color: colors.BLACK }]}>
            {program.program.name} - {program.level.name}
          </Text>
          <Text numberOfLines={2} style={[styles.description, { color: colors.BLACK }]}>
            {program.program.description}
          </Text>
        </View>
      </View>
      <View style={styles.progressContainer}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 4 }}>
          <Text style={[styles.dateText, { color: colors.BLACK }]}>بدء البرنامج {parseRemaining(program.program.start)}</Text>
          <Text style={[styles.registrationText, { color: colors.BLACK }]}>انتهاء البرنامج: {parseRemaining(program.program.end)}</Text>
        </View>
        <View style={[styles.progressBar, { backgroundColor: colors.GREY }]}>
          <View style={[styles.progressFill, { backgroundColor: colors.PRIMARY_COLOR, width: `${progress}%` }]} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

function MainScreen({ navigation }: RootScreenProps<Paths.Main>) {
  // const { isDark, colors } = useTheme();
  // const { t, i18n } = useTranslation();
  const [apiState, setapiState] = useState<PaginationState<Subscription>>({ ...initStateAPIState, url: '/api/students/subscriptions/v2' });
  const ItemClass = new Pagination<Subscription>(apiState, setapiState);

  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth);
  const { items: subscriptionsState } = useAppSelector(state => state.subscriptions);
  const { colors: themeColors } = useTheme();

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
    ItemClass.next(apiState);
  };

  useEffect(() => {
    if (apiState.results.length) {
      dispatch(setSubscriptions(apiState.results as Subscription[]));
    }
  }, [apiState.results, dispatch]);

  logger.info('subscriptionsState', apiState);

  return (
    <SafeScreen>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <SmallTitle>اهلا {user.name}</SmallTitle>
          <TouchableOpacity
            style={[styles.todayButton, { backgroundColor: themeColors.PRIMARY_COLOR }]}
            onPress={() => navigation.navigate(Paths.TodayLessons)}>
            <Text style={[styles.todayButtonText, { color: themeColors.WHITE }]}>دروس اليوم</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={subscriptionsState || (apiState.results as Subscription[])}
          renderItem={({ item }) => <ProgramCard program={item} />}
          keyExtractor={item => item.id}
          onEndReached={onEndReached}
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
  progressBar: {
    height: 6,
    borderRadius: 2,
    overflow: 'visible',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  todayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  todayButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
