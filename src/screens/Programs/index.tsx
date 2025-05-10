/* eslint-disable perfectionist/sort-object-types */
import { Text } from '@/components/atoms/Text';
import { SafeScreen } from '@/components/templates';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import { GET, initStateAPIState, POST } from '@/services/API';
import { logger } from '@/services/logger';
import { Pagination } from '@/services/Pagination';
import { useTheme } from '@/theme';
import { calculateProgress, parseRemaining } from '@/utils/dateTime';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, RefreshControl, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
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

type ProgramQuery = {
  id?: string;
  name?: string;
  description?: string;
  start?: string;
  end?: string;
  registrationStart?: string; //string($date-time);
  registrationEnd?: string; //string($date-time);
  state?: string;
  // page?: number;
  // pageSize?: number;
  // skip?: number;
  // limit?: number;
};

function Programs({ navigation }: RootScreenProps<Paths.Programs>) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [filters, setFilters] = useState<ProgramQuery>({});
  const [showFilters, setShowFilters] = useState(false);

  // Convert filters object to URL params string
  const getParamsString = (filterObj: ProgramQuery): string => {
    return Object.entries(filterObj)
      .filter(([_, value]) => value !== undefined && value !== '')
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&');
  };

  const [apiState, setapiState] = useState<PaginationState<Program>>({
    ...initStateAPIState,
    url: '/api/students/v2/programs',
    params: getParamsString(filters),
  });

  const ItemClass = new Pagination<Program>(apiState, setapiState);

  useEffect(() => {
    ItemClass.init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply filters when they change
  useEffect(() => {
    const newParams = getParamsString(filters);
    setapiState(prev => ({
      ...prev,
      params: newParams,
      forceUpdate: {},
    }));
    ItemClass.reload({
      ...apiState,
      params: newParams,
      forceUpdate: {},
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const onRefresh = () => {
    ItemClass.reload(apiState);
  };

  const onEndReached = () => {
    if (apiState.loading) {
      return;
    }
    ItemClass.next(apiState);
  };

  const applyFilters = (newFilters: ProgramQuery) => {
    setFilters(newFilters);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({});
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Format date for display and API
  const formatDateForInput = (dateString?: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
    } catch (e) {
      return dateString;
    }
  };

  // Format filter value for display
  const formatFilterValue = (key: string, value: string): string => {
    if (key.includes('Start') || key.includes('End') || key === 'start' || key === 'end') {
      return formatDateForInput(value);
    }
    return value;
  };

  // Get filter display name
  const getFilterDisplayName = (key: keyof ProgramQuery): string => {
    const displayNames: Record<keyof ProgramQuery, string> = {
      id: 'المعرف',
      name: 'الاسم',
      description: 'الوصف',
      start: 'تاريخ البدء',
      end: 'تاريخ الانتهاء',
      registrationStart: 'بدء التسجيل',
      registrationEnd: 'انتهاء التسجيل',
      state: 'الحالة',
    };
    return displayNames[key] || key;
  };

  // Filter component
  const FilterComponent = () => {
    const [localFilters, setLocalFilters] = useState<ProgramQuery>(filters);

    return (
      <View style={[styles.filterContainer, { backgroundColor: colors.SURFACE }]}>
        <ScrollView style={styles.filterScroll}>
          <Text style={[styles.filterTitle, { color: colors.BLACK }]}>تصفية البرامج</Text>

          <View style={styles.filterRow}>
            <Text style={{ color: colors.BLACK }}>اسم البرنامج:</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.GREY }]}
              value={localFilters.name}
              onChangeText={text => setLocalFilters({ ...localFilters, name: text })}
              placeholder="ادخل اسم البرنامج"
              placeholderTextColor={colors.GREY}
            />
          </View>

          <View style={styles.filterRow}>
            <Text style={{ color: colors.BLACK }}>الوصف:</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.GREY }]}
              value={localFilters.description}
              onChangeText={text => setLocalFilters({ ...localFilters, description: text })}
              placeholder="وصف البرنامج"
              placeholderTextColor={colors.GREY}
            />
          </View>

          <View style={styles.filterRow}>
            <Text style={{ color: colors.BLACK }}>تاريخ البدء:</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.GREY }]}
              value={formatDateForInput(localFilters.start)}
              onChangeText={text => setLocalFilters({ ...localFilters, start: text })}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.GREY}
            />
          </View>

          <View style={styles.filterRow}>
            <Text style={{ color: colors.BLACK }}>تاريخ الانتهاء:</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.GREY }]}
              value={formatDateForInput(localFilters.end)}
              onChangeText={text => setLocalFilters({ ...localFilters, end: text })}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.GREY}
            />
          </View>

          <View style={styles.filterRow}>
            <Text style={{ color: colors.BLACK }}>بدء التسجيل:</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.GREY }]}
              value={formatDateForInput(localFilters.registrationStart)}
              onChangeText={text => setLocalFilters({ ...localFilters, registrationStart: text })}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.GREY}
            />
          </View>

          <View style={styles.filterRow}>
            <Text style={{ color: colors.BLACK }}>انتهاء التسجيل:</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.GREY }]}
              value={formatDateForInput(localFilters.registrationEnd)}
              onChangeText={text => setLocalFilters({ ...localFilters, registrationEnd: text })}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.GREY}
            />
          </View>

          <View style={styles.filterRow}>
            <Text style={{ color: colors.BLACK }}>الحالة:</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.GREY }]}
              value={localFilters.state}
              onChangeText={text => setLocalFilters({ ...localFilters, state: text })}
              placeholder="حالة البرنامج"
              placeholderTextColor={colors.GREY}
            />
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, { backgroundColor: colors.PRIMARY_COLOR }]} onPress={() => applyFilters(localFilters)}>
              <Text style={[styles.buttonText, { color: colors.WHITE }]}>تطبيق</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.DISABLED }]}
              onPress={() => {
                setLocalFilters({});
                clearFilters();
              }}>
              <Text style={[styles.buttonText, { color: colors.WHITE }]}>مسح</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeScreen>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={[styles.headerTitle, { color: colors.BLACK }]}>البرامج المتاحة</Text>
          <TouchableOpacity style={[styles.filterButton, { backgroundColor: colors.PRIMARY_COLOR }]} onPress={toggleFilters}>
            <Text style={[styles.buttonText, { color: colors.WHITE }]}>{showFilters ? 'إخفاء التصفية' : 'تصفية'}</Text>
          </TouchableOpacity>
        </View>

        {showFilters && <FilterComponent />}

        {Object.keys(filters).length > 0 && (
          <View style={styles.activeFiltersContainer}>
            <Text style={{ color: colors.BLACK }}>التصفية النشطة: </Text>
            {Object.entries(filters).map(
              ([key, value]) =>
                value && (
                  <View key={key} style={[styles.filterTag, { backgroundColor: colors.SURFACE }]}>
                    <Text style={{ color: colors.BLACK }}>
                      {getFilterDisplayName(key as keyof ProgramQuery)}: {formatFilterValue(key, String(value))}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        const newFilters = { ...filters };
                        delete newFilters[key as keyof ProgramQuery];
                        setFilters(newFilters);
                      }}>
                      <Text style={{ color: colors.ERROR, marginLeft: 5 }}>×</Text>
                    </TouchableOpacity>
                  </View>
                ),
            )}

            <TouchableOpacity onPress={clearFilters}>
              <Text style={{ color: colors.ERROR, marginLeft: 10 }}>مسح الكل</Text>
            </TouchableOpacity>
          </View>
        )}

        <FlatList
          data={apiState.results as Program[]}
          renderItem={({ item }) => <ProgramCard program={item} />}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={apiState.loading && !apiState.results?.length}
          onRefresh={onRefresh}
          onEndReached={onEndReached}
          ListEmptyComponent={() =>
            apiState.loading ? (
              <View />
            ) : (
              <View style={styles.emptyContainer}>
                {apiState.error ? <Text>يوجد مشكله فى الوصول الى المعلومات</Text> : <Text>لا يوجد برامج</Text>}
                <Text> حاول مرة اخرى لاحقا</Text>
              </View>
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  filterContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxHeight: 500,
    minHeight: 350,
  },
  filterScroll: {
    flex: 1,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
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
