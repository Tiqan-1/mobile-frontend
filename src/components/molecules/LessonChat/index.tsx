import moment from 'moment';
import 'moment/locale/ar';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, FlatList, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Text, Title } from '@/components/atoms/Text';
import { GET, POST } from '@/services/API';
import { useTheme } from '@/theme';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { connectPusher, disconnectPusher, getSocketId, initializePusher, pusherClient } from '@/config/pusher';

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

interface LessonChatProps {
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
  send: async (chatRoomId: string, data: { message: string; socketId?: string }) => {
    // Replace with actual API call using POST
    return POST(`/chat/${chatRoomId}/send`, data);
  },
};

export const LessonChat: React.FC<LessonChatProps> = ({ chatRoomId, visible, onClose }) => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const isInitialLoad = useRef(true);
  const { colors } = useTheme();

  // Handle new message from Pusher
  const handleNewMessage = useCallback((data: Message) => {
    queryClient.setQueryData(chatQueryKey(chatRoomId), (oldData: { messages?: Message[] }) => {
      if (!oldData) {
        return oldData;
      }
      
      // Check if message already exists to avoid duplicates
      const messageExists = oldData.messages?.some((msg: Message) => msg.id === data.id);
      if (messageExists) {
        return oldData;
      }
      
      return {
        ...oldData,
        messages: [...(oldData.messages || []), data],
      };
    });
  }, [queryClient, chatRoomId]);

  // Initialize Pusher and handle real-time messages
  useEffect(() => {
    if (!visible || !chatRoomId) {
      return;
    }

    let channel: any = null; // eslint-disable-line @typescript-eslint/no-explicit-any

    const setupPusher = async () => {
      try {
        await initializePusher();
        await connectPusher();
        
        // Subscribe to the chat room channel
        channel = pusherClient.subscribe(`chat.${chatRoomId}`);
        
        // Handle new message events
        channel.bind('new-message', handleNewMessage);
        
        console.log(`Subscribed to channel: chat.${chatRoomId}`); // eslint-disable-line no-console
      } catch (error) {
        console.error('Failed to setup Pusher:', error); // eslint-disable-line no-console
      }
    };

    setupPusher();

    // Cleanup function
    return () => {
      if (channel) {
        channel.unbind('new-message', handleNewMessage);
        pusherClient.unsubscribe(`chat.${chatRoomId}`);
      }
      disconnectPusher().catch(console.error); // eslint-disable-line no-console
    };
  }, [visible, chatRoomId, handleNewMessage]);

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
    staleTime: Number.POSITIVE_INFINITY,
  });

  const messages = useMemo(() => chatData?.messages ?? [], [chatData?.messages]);

  useEffect(() => {
    if (!visible) {
      isInitialLoad.current = true;
    }
  }, [visible]);

  const { mutate: sendMessage, isPending: isSending } = useMutation({
    mutationFn: async (text: string) => {
      // Get socket ID from Pusher connection
      const socketId = await pusherClient.getSocketId();
      return chatApi.send(chatRoomId, { message: text, socketId: socketId || 'fallback-socket-id' });
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
            <View style={[styles.avatar, { backgroundColor: colors.PRIMARY_COLOR }]}>
              <Text style={styles.avatarText}>{item.sender.name.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <View style={styles.messageContent}>
            {!isCurrentUser && <Text style={[styles.senderName, { color: colors.BLACK }]}>{item.sender.name}</Text>}
            <View style={[
              styles.messageBubble,
              {
                backgroundColor: isCurrentUser ? colors.PRIMARY_COLOR : colors.SURFACE,
                borderColor: colors.LINE,
              }
            ]}>
              <Text style={[
                styles.messageText,
                { color: isCurrentUser ? colors.WHITE : colors.BLACK }
              ]}>
                {item.text}
              </Text>
            </View>
            <Text style={[styles.messageTimestamp, { color: colors.GREY }]}>
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
          <ActivityIndicator size="large" color={colors.PRIMARY_COLOR} />
          <Text style={[styles.loadingText, { color: colors.BLACK }]}>جاري تحميل الرسائل...</Text>
        </View>
      );
    }

    if (isError) {
      return (
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: colors.ERROR }]}>
            خطأ في تحميل المحادثة
          </Text>
          <Text style={[styles.errorDescription, { color: colors.GREY }]}>
            {error?.message || 'حدث خطأ غير متوقع'}
          </Text>
        </View>
      );
    }

    if (messages.length === 0) {
      return (
        <View style={styles.centered}>
          <Text style={[styles.emptyText, { color: colors.GREY }]}>لا توجد رسائل بعد. كن أول من يبدأ النقاش!</Text>
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
    <View style={[styles.container, { backgroundColor: colors.SURFACE }]}>
      <View style={[styles.header, { borderBottomColor: colors.LINE }]}>
        <Title style={[styles.headerTitle, { color: colors.BLACK }]}>محادثة المهمة</Title>
        <TouchableOpacity onPress={onClose} style={styles.closeButton} accessibilityLabel="إخفاء المحادثة">
          <Text style={[styles.closeButtonText, { color: colors.BLACK }]}>×</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.chatContent}>{renderContent()}</View>

      <View style={[styles.inputContainer, { borderTopColor: colors.LINE }]}>
        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: colors.SURFACE,
              borderColor: colors.LINE,
              color: colors.BLACK,
            }
          ]}
          value={inputText}
          onChangeText={setInputText}
          placeholder="اكتب رسالتك هنا..."
          placeholderTextColor={colors.GREY}
          multiline
          maxLength={500}
          editable={!isSending && !isLoading}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: colors.PRIMARY_COLOR,
              opacity: !inputText.trim() || isSending ? 0.5 : 1,
            },
          ]}
          onPress={handleSendMessage}
          disabled={!inputText.trim() || isSending}>
          {isSending ? (
            <ActivityIndicator size="small" color={colors.WHITE} />
          ) : (
            <Text style={[styles.sendButtonText, { color: colors.WHITE }]}>إرسال</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    width: Math.min(350, width * 0.9),
    height: '100%',
    borderLeftWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    margin: 0,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  chatContent: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
  },
  errorText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorDescription: {
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  theirMessageContainer: {
    alignItems: 'flex-start',
  },
  messageWrapper: {
    flexDirection: 'row',
    maxWidth: '80%',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  messageContent: {
    flex: 1,
  },
  senderName: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '500',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageTimestamp: {
    fontSize: 11,
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 14,
  },
  sendButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  sendButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
