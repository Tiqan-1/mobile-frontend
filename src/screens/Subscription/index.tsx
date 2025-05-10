import Clock from '@/assets/svg-app/clock.svg';
import Level from '@/assets/svg-app/level.svg';
import Student from '@/assets/svg-app/student.svg';
import Video from '@/assets/svg-app/video.svg';
import CircleStatus from '@/components/atoms/CircleStatus';
import { SmallText, SmallTitle, Text, Title } from '@/components/atoms/Text';
import { VideoModal } from '@/components/organisms/VideoModal';
import { SafeScreen } from '@/components/templates';
import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import { useTheme } from '@/theme';
import { PALETTE } from '@/theme/colors';
import { remaingDays } from '@/utils/dateTime';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { FlatList, Linking, StyleSheet, TouchableOpacity, View } from 'react-native';


function Subscription({ navigation, route }: RootScreenProps<Paths.Subscription>) {
  const { colors } = useTheme();
  const [selectedVideo, setSelectedVideo] = useState<Lesson | null>(null);

  const subscription = route.params;
  useEffect(() => {
    navigation.setOptions({ title: subscription.program.name });
  }, [navigation, subscription]);

  const lesson = subscription.level.tasks.reduce((acc, task) => {
    return acc + task.lessons.length;
  }, 0);

  const flatLessons = subscription.level.tasks.flatMap((task: Task) =>
    task.lessons.map((lesson: Lesson) => ({
      ...lesson,
      date: task.date,
    })),
  );

  const onCardPress = (item: Lesson) => {
    const url = item.url;
    if (item.type === 'video' && (url.includes('youtube') || url.includes('youtu.be'))) {
      setSelectedVideo(item);
    } else if (item.type === 'pdf') {
      navigation.navigate(Paths.PDF, { ...item });
    } else {
      Linking.openURL(item.url);
    }
  };

  const renderLessonCard = ({ item }: { item: Lesson }) => {
    return (
      <TouchableOpacity style={[styles.card, { backgroundColor: colors.SURFACE }]} onPress={() => onCardPress(item)}>
        <View style={{ paddingHorizontal: 2 }}>
          <SmallTitle style={[styles.dateText, { color: colors.BLACK, fontWeight: 'bold' }]}>
            {moment(new Date(item.date)).format('DD')}
          </SmallTitle>
          <Text style={[styles.dateText, { color: colors.GREY }]}>{moment(new Date(item.date)).format('MMM')}</Text>
        </View>
        <CircleStatus Dtstatus={item.date} />
        <View style={{ paddingHorizontal: 2 }}>
          <Text style={[styles.programName, { color: colors.BLACK }]}>{item.title}</Text>
          <SmallText style={[styles.programName, { color: colors.GREY }]}>{item.title}</SmallText>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeScreen>
      <View style={styles.container}>
        <View style={styles.header}>
          <SmallTitle bgColor={styles.header.backgroundColor}>{subscription.program.name}</SmallTitle>
          <Title bgColor={styles.header.backgroundColor}>{subscription.program.name}</Title>
          <Text style={{ color: colors.WARNING }}>يبدا فى {moment(new Date(subscription.program.start)).format('YYYY/MM/DD')}</Text>
          <View style={styles.element}>
            <Level />
            <Text bgColor={styles.header.backgroundColor}>{subscription.level.name}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <View style={styles.element}>
              <Video />
              <Text bgColor={styles.header.backgroundColor}>{` ${lesson} محاضرة `}</Text>
            </View>
            <Student />
            <View style={styles.element}>
              <Clock />
              <Text bgColor={styles.header.backgroundColor}>{remaingDays(subscription.program.end)} يوم</Text>
            </View>
          </View>
        </View>
        <FlatList
          data={flatLessons}
          renderItem={renderLessonCard}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
        <VideoModal selectedVideo={selectedVideo} onClose={() => setSelectedVideo(null)} />
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
  timeLine: {},
  listContainer: {
    paddingBottom: 16,
  },
  element: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: PALETTE.BG_PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderRadius: 10,
    marginVertical: 15,
  },
  card: {
    padding: 8,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  programName: {
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
  dateText: {},
});
