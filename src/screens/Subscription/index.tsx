import Clock from '@/assets/svg-app/clock.svg';
import Level from '@/assets/svg-app/level.svg';
import Student from '@/assets/svg-app/student.svg';
import Video from '@/assets/svg-app/video.svg';
import { SmallText, SmallTitle, Text, Title } from '@/components/atoms/Text';
import { SafeScreen } from '@/components/templates';
import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import { initStateAPIState } from '@/services/API';
import { logger } from '@/services/logger';
import { useTheme } from '@/theme';
import { PALETTE } from '@/theme/colors';
import { parseRemaining, remaingDays } from '@/utils/dateTime';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { FlatList, Linking, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import Timeline from 'react-native-beautiful-timeline';
import YoutubePlayer from 'react-native-youtube-iframe';

const getYoutubeId = (url: string) => {
  if (url.includes('youtu.be')) {
    return url.split('youtu.be/')[1]?.split('?')[0];
  }
  return url.split('v=')[1]?.split('&')[0];
};

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

  const youtubeId = selectedVideo?.url ? getYoutubeId(selectedVideo.url) : undefined;
  const isPlaylist =
    selectedVideo?.url.includes('list=') ||
    selectedVideo?.url.includes('playlist=') ||
    selectedVideo?.url.includes('p=') ||
    selectedVideo?.url.includes('listType=') ||
    selectedVideo?.url.includes('view_as=subscriber');
  const playlistId = selectedVideo?.url.split('list=')[1]?.split('&')[0];

  const renderLessonCard = ({ item }: { item: Lesson }) => {
    //check if data passed
    const dateStatus = moment(new Date(item.date)).diff(moment(new Date()), 'days');

    const status: 'Passed' | 'Next' | 'Done' | 'Now' = dateStatus < 0 ? 'Passed' : dateStatus === 0 ? 'Now' : 'Next';
    return (
      <TouchableOpacity style={[styles.card, { backgroundColor: colors.SURFACE }]} onPress={() => onCardPress(item)}>
        <View style={{ paddingHorizontal: 2 }}>
          <SmallTitle style={[styles.dateText, { color: colors.BLACK, fontWeight: 'bold' }]}>
            {moment(new Date(item.date)).format('DD')}
          </SmallTitle>
          <Text style={[styles.dateText, { color: colors.GREY }]}>{moment(new Date(item.date)).format('MMM')}</Text>
        </View>
        <Circle status={status} />
        <View style={{ paddingHorizontal: 2 }}>
          <Text style={[styles.programName, { color: colors.BLACK }]}>{item.title}</Text>
          <SmallText style={[styles.programName, { color: colors.GREY }]}>{item.title}</SmallText>
        </View>
      </TouchableOpacity>
    );
  };

  const Circle = ({ status }: { status: string }) => {
    const color =
      status === 'Passed'
        ? colors.ERROR
        : status === 'Next'
        ? colors.WARNING
        : status === 'Done'
        ? colors.SUCCESS
        : status === 'Now'
        ? colors.PRIMARY_COLOR
        : colors.GREY;
    return (
      <View
        style={{
          margin: 5,
          width: 15,
          height: 15,
          borderRadius: 12,
          padding: 4,
          borderWidth: 1,
          justifyContent: 'center',
          alignItems: 'center',
          borderStyle: 'dashed',
          borderColor: color,
        }}>
        <View style={{ width: 8, height: 8, backgroundColor: color, borderRadius: 12, padding: 4 }} />
      </View>
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
        <Modal visible={!!selectedVideo} animationType="slide" transparent={true} onRequestClose={() => setSelectedVideo(null)}>
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { backgroundColor: colors.SURFACE }]}>
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: colors.PRIMARY_COLOR }]}
                onPress={() => setSelectedVideo(null)}>
                <Text style={{ color: colors.WHITE }}>Close</Text>
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.BLACK }]}>{selectedVideo?.title}</Text>
              {!!selectedVideo && (playlistId || youtubeId) && (
                <YoutubePlayer
                  height={200}
                  width={'100%'}
                  playList={isPlaylist ? playlistId : undefined}
                  videoId={isPlaylist ? undefined : youtubeId}
                  webViewProps={{ androidLayerType: 'hardware' }}
                  // onChangeState={state => console.log({ state })}
                />
              )}
              {selectedVideo?.url && (
                <TouchableOpacity
                  style={[styles.closeButton, { backgroundColor: colors.PRIMARY_COLOR }]}
                  onPress={() => Linking.openURL(selectedVideo.url)}>
                  <Text style={{ color: colors.WHITE }}>Open External</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
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
    // fontSize: 18,
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

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  closeButton: {
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
  },
  dateText: {},
});
