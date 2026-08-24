import moment from 'moment';
import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, TextInput, TouchableOpacity, View } from 'react-native';
import { Text, Title } from '@/components/atoms/Text';
import { GET, POST } from '@/services/API';
import { useTheme } from '@/theme';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getStyles } from './style';

// TODO(T4): Pusher was removed during the Expo migration (unproven autolinking
// under CNG). Real-time delivery is stubbed out with polling below until a
// replacement (config plugin, or a plain WebSocket client against Pusher's
// protocol) is chosen. See docs/tasks/T4-expo-migration.md.
const CHAT_POLL_INTERVAL_MS = 5000;

moment.locale('ar');

interface Message {
  createdAt: string;
  id: string;
  sender: Sender;
  text: string;
  updatedAt: string;
}

interface Sender {
  email: string;
  name: string;
}

export interface LessonChatProps {
  chatRoomId: string;
  onClose: () => void;
  visible: boolean;
}

const mockCurrentUser: Sender = {
  name: 'الطالب الحالي',
  email: 'student@example.com',
};

const chatQueryKey = (chatRoomId: string) => ['chat', chatRoomId];

// Mock chat API functions - replace with actual API calls
const chatApi = {
  join: async (chatRoomId: string) => {
    // Replace with actual API call using GET
    return GET(`/chat/${chatRoomId}/join`);
  },
  send: async (chatRoomId: string, data: { message: string }) => {
    // Replace with actual API call using POST
    return POST(`/chat/${chatRoomId}/send`, data);
  },
};

export const LessonChat: React.FC<LessonChatProps> = ({ chatRoomId, visible, onClose }) => {
  const theme = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const queryClient = useQueryClient();
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const isInitialLoad = useRef(true);

  const {
    data: chatData,
    isLoading,
    isError,
    error,
    isSuccess,
  } = useQuery({
    queryKey: chatQueryKey(chatRoomId),
    queryFn: () => chatApi.join(chatRoomId),
    enabled: !!chatRoomId && visible,
    // Was real-time via Pusher; polling stand-in until T4's Pusher decision lands.
    refetchInterval: visible ? CHAT_POLL_INTERVAL_MS : false,
  });

  const messages = useMemo(() => chatData?.messages ?? [], [chatData?.messages]);

  useEffect(() => {
    if (!visible) {
      isInitialLoad.current = true;
    }
  }, [visible]);

  const { mutate: sendMessage, isPending: isSending } = useMutation({
    mutationFn: async (text: string) => {
      return chatApi.send(chatRoomId, { message: text });
    },
    onSuccess: (_data, sentText) => {
      setInputText('');

      const manualMessage: Message = {
        id: `temp-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        text: sentText,
        sender: mockCurrentUser,
      };

      queryClient.setQueryData<{ messages: Message[] }>(chatQueryKey(chatRoomId), (oldData) => {
        const existingMessages = oldData?.messages ?? [];
        return {
          ...oldData,
          messages: [...existingMessages, manualMessage],
        };
      });
    },
    onError: (err: unknown) => {
      // eslint-disable-next-line no-console
      console.error('Failed to send message:', err);
      Alert.alert('خطأ', 'فشل إرسال الرسالة. يرجى المحاولة مرة أخرى.');
    },
  });

  const handleSendMessage = () => {
    if (!inputText.trim()) {
      return;
    }
    sendMessage(inputText.trim());
  };

  useEffect(() => {
    if (!isSuccess || messages.length === 0) {return;}
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    // Scroll to bottom when new messages arrive
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, isSuccess]);

  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = item.sender.email === mockCurrentUser.email;

    return (
      <View style={[styles.messageContainer, isCurrentUser ? styles.myMessageContainer : styles.theirMessageContainer]}>
        <View style={styles.messageWrapper}>
          {!isCurrentUser && (
            <View style={[styles.avatar, { backgroundColor: theme.colors.PRIMARY_COLOR }]}>
              <Text isBold style={styles.avatarText}>{item.sender.name.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <View style={styles.messageContent}>
            {!isCurrentUser && <Text style={[styles.senderName, { color: theme.colors.BLACK }]}>{item.sender.name}</Text>}
            <View style={[
              styles.messageBubble,
              {
                backgroundColor: isCurrentUser ? theme.colors.PRIMARY_COLOR : theme.colors.SURFACE,
                borderColor: theme.colors.LINE,
              }
            ]}>
              <Text style={[
                styles.messageText,
                { color: isCurrentUser ? theme.colors.WHITE : theme.colors.BLACK }
              ]}>
                {item.text}
              </Text>
            </View>
            <Text style={[styles.messageTimestamp, { color: theme.colors.GREY }]}>
              {moment(item.createdAt).fromNow()}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.PRIMARY_COLOR} />
          <Text style={[styles.loadingText, { color: theme.colors.BLACK }]}>جاري تحميل الرسائل...</Text>
        </View>
      );
    }

    if (isError) {
      return (
        <View style={styles.centered}>
          <Text isBold style={[styles.errorText, { color: theme.colors.ERROR }]}>
            خطأ في تحميل المحادثة
          </Text>
          <Text style={[styles.errorDescription, { color: theme.colors.GREY }]}>
            {error?.message || 'حدث خطأ غير متوقع'}
          </Text>
        </View>
      );
    }

    if (messages.length === 0) {
      return (
        <View style={styles.centered}>
          <Text style={[styles.emptyText, { color: theme.colors.GREY }]}>لا توجد رسائل بعد. كن أول من يبدأ النقاش!</Text>
        </View>
      );
    }

    return (
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  if (!visible) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.SURFACE }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.LINE }]}>
        <Title style={[styles.headerTitle, { color: theme.colors.BLACK }]}>محادثة المهمة</Title>
        <TouchableOpacity onPress={onClose} style={styles.closeButton} accessibilityLabel="إخفاء المحادثة">
          <Text isBold style={[styles.closeButtonText, { color: theme.colors.BLACK }]}>×</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.chatContent}>{renderContent()}</View>

      <View style={[styles.inputContainer, { borderTopColor: theme.colors.LINE }]}>
        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: theme.colors.SURFACE,
              borderColor: theme.colors.LINE,
              color: theme.colors.BLACK,
            }
          ]}
          value={inputText}
          onChangeText={setInputText}
          placeholder="اكتب رسالتك هنا..."
          placeholderTextColor={theme.colors.GREY}
          multiline
          maxLength={500}
          editable={!isSending && !isLoading}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: theme.colors.PRIMARY_COLOR,
              opacity: !inputText.trim() || isSending ? 0.5 : 1,
            },
          ]}
          onPress={handleSendMessage}
          disabled={!inputText.trim() || isSending}>
          {isSending ? (
            <ActivityIndicator size="small" color={theme.colors.WHITE} />
          ) : (
            <Text isBold style={[styles.sendButtonText, { color: theme.colors.WHITE }]}>إرسال</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};
