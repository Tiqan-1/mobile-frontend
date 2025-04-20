import Clock from '@/assets/svg-app/clock.svg';
import Student from '@/assets/svg-app/student.svg';
import Video from '@/assets/svg-app/video.svg';
import { SmallTitle, Text, Title } from '@/components/atoms/Text';
import { SafeScreen } from '@/components/templates';
import type { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import { initStateAPIState } from '@/services/API';
import { useTheme } from '@/theme';
import { PALETTE } from '@/theme/colors';
import { parseRemaining, remaingDays } from '@/utils/dateTime';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Linking, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import Timeline from 'react-native-beautiful-timeline';
import YoutubePlayer from 'react-native-youtube-iframe';

function Subscription({ navigation, route }: RootScreenProps<Paths.Subscription>) {
  const { colors } = useTheme();
  const [selectedVideo, setSelectedVideo] = useState<Lesson | null>(null);

  const subscription = route.params;
  useEffect(() => {
    // GET('/api/students/open-programs', {}, setapiState);
    navigation.setOptions({ title: subscription.program.name });
  }, []);

  const onRefresh = () => {
    // GET('/api/students/open-programs', {}, setapiState);
  };
  const lesson = 1; //subscription?.level?.tasks?.length;

  const lessons = subscription.level.tasks.map((task: Task, index) => {
    return {
      date: task.date,
      data: task.lessons.map((lesson: Lesson, index) => {
        return {
          title: lesson.type,
          subtitle: lesson.title,
          // type: 'custom',
          date: task.date,
          item: lesson,
        };
      }),
    };
  });

  const onCardPress = item => {
    console.log('item', item);
    const url = item.item.url;
    if (item.item.type === 'video' && (url.includes('youtube') || url.includes('youtu.be'))) {
      setSelectedVideo(item.item);
    } else if (item.item.type === 'pdf') {
      navigation.navigate('PDFViewer', { document: item.item });
    } else {
      Linking.openURL(item.item.url);
    }
  };

  const getYoutubeId = (url: string) => {
    if (url.includes('youtu.be')) {
      return url.split('youtu.be/')[1]?.split('?')[0];
    }
    return url.split('v=')[1]?.split('&')[0];
  };

  const youtubeId = selectedVideo?.url ? getYoutubeId(selectedVideo.url) : undefined;
  const isPlaylist =
    selectedVideo?.url.includes('list=') ||
    selectedVideo?.url.includes('playlist=') ||
    selectedVideo?.url.includes('p=') ||
    selectedVideo?.url.includes('listType=') ||
    selectedVideo?.url.includes('view_as=subscriber');
  const playlistId = selectedVideo?.url.split('list=')[1]?.split('&')[0];

  return (
    <SafeScreen>
      <View style={styles.container}>
        <View style={styles.header}>
          <SmallTitle bgColor={styles.header.backgroundColor}>{subscription.program.name}</SmallTitle>
          <Title bgColor={styles.header.backgroundColor}>{subscription.program.name}</Title>
          <Text style={{ color: colors.WARNING }}>يبدا فى {moment(new Date(subscription.program.start)).format('YYYY/MM/DD')}</Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}>
            <View style={styles.element}>
              <Video />
              <Text bgColor={styles.header.backgroundColor}>{` ${lesson} محاضرة `}</Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}>
            <Student />
            <View style={styles.element}>
              <Clock />
              <Text bgColor={styles.header.backgroundColor}>
                {remaingDays(subscription.program.end) - remaingDays(subscription.program.start)} يوم
              </Text>
            </View>
          </View>

          <Text bgColor={styles.header.backgroundColor}>{parseRemaining(subscription.program.registrationStart)}</Text>
          <Text bgColor={styles.header.backgroundColor}>{parseRemaining(subscription.program.registrationEnd)}</Text>
          {/* <Text>{program.levels.length}</Text> */}
        </View>
        <Timeline
          onCardPress={onCardPress}
          cardStyle={styles.timeLine}
          data={lessons}
          timelineStyle={{ direction: 'rtl', paddingBottom: 100 }}
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
                  webViewProps={{
                    androidLayerType: 'hardware',
                  }}
                  onChangeState={state => console.log({ state })}
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
    // padding: 16,
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
    margin: 15,
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
});
