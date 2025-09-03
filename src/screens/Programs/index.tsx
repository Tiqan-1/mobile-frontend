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
import { SHADOW } from '@/theme/styles';
import { calculateProgress, parseRemaining } from '@/utils/dateTime';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
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
      <View style={[styles.statusTag, { backgroundColor: registerd ? colors.SUCCESS : colors.DISABLED }]}>
        <Text style={[styles.statusText, { color: colors.WHITE }]}>{registerd ? 'مسجل' : 'غير مسجل'}</Text>
      </View>
      
      <View style={styles.cardContent}>
        <FastImage
          resizeMode="contain"
          source={program.thumbnail ? { uri: `data:image/png;base64,${program.thumbnail}` } : require('@/assets/images/noImage.png')}
          defaultSource={require('@/assets/images/noImage.png')}
          style={styles.programImage}
        />
        <View style={styles.programInfo}>
          <Text style={[styles.programName, { color: colors.BLACK }]}>{program.name}</Text>
          <Text numberOfLines={2} style={[styles.description, { color: colors.BLACK }]}>
            {program.description}
          </Text>
        </View>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressLabels}>
          <Text style={[styles.registrationText, { color: colors.BLACK }]}>انتهاء التسجيل: {parseRemaining(program.registrationEnd)}</Text>
          <Text style={[styles.dateText, { color: colors.BLACK }]}>بدء البرنامج {parseRemaining(program?.start)}</Text>
        </View>
        <View style={[styles.progressBar, { backgroundColor: colors.GREY }]}>
          <View style={[styles.progressFill, { 
            backgroundColor: progress>100 ? colors.ERROR : colors.WARNING, 
            width: `${progress}%` 
          }]} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Loading shimmer for program cards
const ProgramCardShimmer = () => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.card, { backgroundColor: colors.SURFACE }]}>
      <View style={styles.cardContent}>
        <View style={[styles.shimmerImage, { backgroundColor: colors.DISABLED }]} />
        <View style={{ flex: 1, paddingHorizontal: 10 }}>
          <View style={[styles.shimmerText, { backgroundColor: colors.DISABLED, width: '80%' }]} />
          <View style={[styles.shimmerText, { backgroundColor: colors.DISABLED, width: '90%', marginTop: 8 }]} />
          <View style={[styles.shimmerText, { backgroundColor: colors.DISABLED, width: '60%', marginTop: 8 }]} />
        </View>
      </View>
      <View style={styles.progressContainer}>
        <View style={styles.progressLabels}>
          <View style={[styles.shimmerText, { backgroundColor: colors.DISABLED, width: '40%' }]} />
          <View style={[styles.shimmerText, { backgroundColor: colors.DISABLED, width: '40%' }]} />
        </View>
        <View style={[styles.progressBar, { backgroundColor: colors.DISABLED }]}>
          <View style={[styles.progressFill, { backgroundColor: colors.GREY, width: '60%' }]} />
        </View>
      </View>
    </View>
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
    url: '/api/students/v3/programs',
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
        <ScrollView style={styles.filterScroll} showsVerticalScrollIndicator={false}>
          <Text style={[styles.filterTitle, { color: colors.BLACK }]}>تصفية البرامج</Text>

          <View style={styles.filterRow}>
            <Text style={[styles.filterLabel, { color: colors.BLACK }]}>اسم البرنامج:</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.GREY, color: colors.BLACK }]}
              value={localFilters.name}
              onChangeText={text => setLocalFilters({ ...localFilters, name: text })}
              placeholder="ادخل اسم البرنامج"
              placeholderTextColor={colors.GREY}
            />
          </View>

          <View style={styles.filterRow}>
            <Text style={[styles.filterLabel, { color: colors.BLACK }]}>الوصف:</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.GREY, color: colors.BLACK }]}
              value={localFilters.description}
              onChangeText={text => setLocalFilters({ ...localFilters, description: text })}
              placeholder="وصف البرنامج"
              placeholderTextColor={colors.GREY}
            />
          </View>

          <View style={styles.filterRow}>
            <Text style={[styles.filterLabel, { color: colors.BLACK }]}>تاريخ البدء:</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.GREY, color: colors.BLACK }]}
              value={formatDateForInput(localFilters?.start)}
              onChangeText={text => setLocalFilters({ ...localFilters, start: text })}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.GREY}
            />
          </View>

          <View style={styles.filterRow}>
            <Text style={[styles.filterLabel, { color: colors.BLACK }]}>تاريخ الانتهاء:</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.GREY, color: colors.BLACK }]}
              value={formatDateForInput(localFilters.end)}
              onChangeText={text => setLocalFilters({ ...localFilters, end: text })}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.GREY}
            />
          </View>

          <View style={styles.filterRow}>
            <Text style={[styles.filterLabel, { color: colors.BLACK }]}>بدء التسجيل:</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.GREY, color: colors.BLACK }]}
              value={formatDateForInput(localFilters.registrationStart)}
              onChangeText={text => setLocalFilters({ ...localFilters, registrationStart: text })}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.GREY}
            />
          </View>

          <View style={styles.filterRow}>
            <Text style={[styles.filterLabel, { color: colors.BLACK }]}>انتهاء التسجيل:</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.GREY, color: colors.BLACK }]}
              value={formatDateForInput(localFilters.registrationEnd)}
              onChangeText={text => setLocalFilters({ ...localFilters, registrationEnd: text })}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.GREY}
            />
          </View>

          <View style={styles.filterRow}>
            <Text style={[styles.filterLabel, { color: colors.BLACK }]}>الحالة:</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.GREY, color: colors.BLACK }]}
              value={localFilters.state}
              onChangeText={text => setLocalFilters({ ...localFilters, state: text })}
              placeholder="حالة البرنامج"
              placeholderTextColor={colors.GREY}
            />
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: colors.PRIMARY_COLOR }]} 
              onPress={() => applyFilters(localFilters)}>
              <Text style={[styles.buttonText, { color: colors.WHITE }]}>تطبيق</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.GREY }]}
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
          <TouchableOpacity 
            style={[
              styles.filterButton, 
              { backgroundColor: showFilters ? colors.SURFACE : colors.PRIMARY_COLOR }
            ]} 
            onPress={toggleFilters}>
            <Text 
              style={[
                styles.buttonText, 
                { color: showFilters ? colors.PRIMARY_COLOR : colors.WHITE }
              ]}>
              {showFilters ? 'إخفاء التصفية' : 'تصفية'}
            </Text>
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
              <View>
                <ProgramCardShimmer />
                <ProgramCardShimmer />
                <ProgramCardShimmer />
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                {apiState.error ? (
                  <>
                    <FastImage 
                      source={require('@/assets/images/warning.png')} 
                      style={styles.emptyStateImage} 
                      resizeMode="contain"
                    />
                    <Text style={[styles.emptyStateTitle, { color: colors.ERROR }]}>يوجد مشكله فى الوصول الى المعلومات</Text>
                    <Text style={[styles.emptyStateText, { color: colors.BLACK }]}>حاول مرة اخرى لاحقا</Text>
                  </>
                ) : (
                  <>
                    <FastImage 
                      source={require('@/assets/images/noImage.png')} 
                      style={styles.emptyStateImage} 
                      resizeMode="contain"
                    />
                    <Text style={[styles.emptyStateTitle, { color: colors.BLACK }]}>لا يوجد برامج متاحة</Text>
                    <Text style={[styles.emptyStateText, { color: colors.BLACK }]}>حاول البحث بمعايير أخرى</Text>
                  </>
                )}
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
    // padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    padding: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  filterButton: {
    ...SHADOW,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  filterContainer: {
    ...SHADOW,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    maxHeight: 500,
    minHeight: 350,
    marginHorizontal: 16,
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
    paddingHorizontal: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  button: {
    ...SHADOW,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.02)',
    padding: 10,
    borderRadius: 8,
  },
  filterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  listContainer: {
    paddingBottom: 16,
  },
  card: {
    ...SHADOW,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    marginHorizontal: 16,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  programImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 10,
  },
  programInfo: {
    flex: 1,
    paddingHorizontal: 10,
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
    opacity: 0.7,
  },
  datesContainer: {
    gap: 4,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '500',
  },
  registrationText: {
    fontSize: 13,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  statusTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 4,
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 5,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    width: 100,
  },
  shimmerImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 10,
  },
  shimmerText: {
    height: 14,
    borderRadius: 7,
    marginBottom: 4,
  },
  emptyStateImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
});
