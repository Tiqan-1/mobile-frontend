import type { Theme } from '@/theme';
import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

export const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      width: Math.min(350, width * 0.9),
      height: '100%',
      borderLeftWidth: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.xl,
      borderBottomWidth: 1,
    },
    headerTitle: {
      margin: 0,
    },
    closeButton: {
      padding: theme.spacing.md,
    },
    closeButtonText: {
      fontSize: 24,
    },
    chatContent: {
      flex: 1,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    loadingText: {
      marginTop: theme.spacing.md,
    },
    errorText: {
      fontSize: 16,
      marginBottom: theme.spacing.md,
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
      padding: theme.spacing.xl,
    },
    messageContainer: {
      marginBottom: theme.spacing.xl,
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
      marginRight: theme.spacing.sm,
    },
    avatarText: {
      color: 'white',
      fontSize: 14,
    },
    messageContent: {
      flex: 1,
    },
    senderName: {
      fontSize: 12,
      marginBottom: theme.spacing.sm,
      fontWeight: '500',
    },
    messageBubble: {
      padding: theme.spacing.md,
      borderRadius: theme.radii.lg,
      borderWidth: 1,
    },
    messageText: {
      fontSize: 14,
      lineHeight: 20,
    },
    messageTimestamp: {
      fontSize: 11,
      marginTop: theme.spacing.sm,
    },
    inputContainer: {
      flexDirection: 'row',
      padding: theme.spacing.xl,
      borderTopWidth: 1,
      alignItems: 'flex-end',
    },
    textInput: {
      flex: 1,
      borderWidth: 1,
      borderRadius: 20,
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.md,
      marginRight: theme.spacing.md,
      maxHeight: 100,
      fontSize: 14,
    },
    sendButton: {
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.md,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      minWidth: 60,
    },
    sendButtonText: {
      fontSize: 14,
    },
  });
