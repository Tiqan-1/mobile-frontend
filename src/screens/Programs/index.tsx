import { Text } from '@/components/atoms/Text';
import { SafeScreen } from '@/components/templates';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import { GET, initStateAPIState, POST } from '@/services/API';
import { useTheme } from '@/theme';
import { calculateProgress, parseRemaining } from '@/utils/dateTime';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';

const ProgramCard = ({ program }: { program: Program }) => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { items: subscriptionsState } = useAppSelector(state => state.subscriptions);
  const registerd = subscriptionsState.find(sub => sub.program.id === program.id);

  const progress = calculateProgress(program.registrationStart, program.registrationEnd);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.SURFACE }]}
      onPress={() => {
        navigation.navigate(Paths.Program, program);
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <FastImage
          resizeMode="contain"
          source={program.thumbnail ? { uri: `data:image/png;base64,${program.thumbnail}` } : require('@/assets/images/noImage.png')}
          defaultSource={require('@/assets/images/noImage.png')}
          style={{ width: 50, height: 50, flex: 1 }}
        />
        <View style={{ flex: 4, paddingHorizontal: 10 }}>
          <Text style={[styles.programName, { color: colors.BLACK }]}>{program.name}</Text>
          <Text numberOfLines={2} style={[styles.description, { color: colors.BLACK }]}>
            {program.description}
          </Text>
        </View>
      </View>
      <View style={styles.progressContainer}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 4 }}>
          <Text style={[styles.registrationText, { color: colors.BLACK }]}>انتهاء التسجيل: {parseRemaining(program.registrationEnd)}</Text>
          <Text style={[styles.dateText, { color: colors.BLACK }]}>بدء البرنامج {parseRemaining(program.start)}</Text>
        </View>
        <View style={[styles.progressBar, { backgroundColor: colors.GREY }]}>
          <View style={[styles.progressFill, { backgroundColor: colors.PRIMARY_COLOR, width: `${progress}%` }]} />
        </View>
      </View>
      <View style={[styles.statusTag, { backgroundColor: registerd ? colors.SUCCESS : colors.DISABLED }]}>
        <Text style={[styles.statusText, { color: colors.WHITE }]}>{registerd ? 'مسجل' : 'غير مسجل'}</Text>
      </View>
    </TouchableOpacity>
  );
};

function Programs({ navigation }: RootScreenProps<Paths.Programs>) {
  // const { isDark, colors, toggleTheme } = useTheme();
  // const { t, i18n } = useTranslation();
  const [apiState, setapiState] = useState<APISTATE<Program>>(initStateAPIState);
  // const dispatch = useAppDispatch();
  // const user = useAppSelector((state) => state.auth);

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
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={apiState.loading && !apiState.results.length}
          onRefresh={onRefresh}
          ListEmptyComponent={() =>
            apiState.loading ? (
              <View style={styles.emptyContainer}>
                {apiState.error ? <Text>يوجد مشكله فى الوصول الى المعلومات</Text> : <Text>لا يوجد برامج</Text>}
                <Text> حاول مرة اخرى لاحقا</Text>
              </View>
            ) : (
              <View />
            )
          }
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 1,
  },
  statusText: {
    fontSize: 12,
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
});
