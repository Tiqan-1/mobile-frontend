import { translate } from '@/hooks/language/useI18n';
import { PALETTEDARK, PALETTELIGHT } from '@/theme/tokens/colors';
import { isRTL } from '@/utils/constants';
import type { ApiResponse } from 'apisauce';
import type React from 'react';
import { Linking } from 'react-native';
import type { MessageType } from 'react-native-flash-message';
import { showMessage } from 'react-native-flash-message';
import { storage } from '@/store';

export const getErrorMessage = (e: unknown): string | null => {
  if (typeof e === 'string') {
    return e;
  }
  const obj = e as { data?: { message?: string; error?: string } };
  return obj.data?.message || obj.data?.error || null;
};

export const getErrorsText = (errors: Record<string, unknown> = {}) => {
  const errorsKeys = Object.keys(errors);
  if (errorsKeys.length) {
    let text = '';
    errorsKeys.forEach(key => {
      const val = errors[key];
      if (Array.isArray(val) && val.length) {
        text += val.join(' ') + ' ';
      } else if (typeof val === 'string') {
        text += val + ' ';
      }
    });
    return text;
  }
  return null;
};

interface Message {
  description?: string;
  duration?: number;
  message?: string;
  ref?: React.RefObject<unknown>;
  type: MessageType;
  url?: string;
}

const HEADER_HEIGHT = 50;

function getActivePalette() {
  const savedTheme = storage.getString('theme');
  return savedTheme === 'dark' ? PALETTEDARK : PALETTELIGHT;
}

type Palette = ReturnType<typeof getActivePalette>;

function getStyle(type: MessageType, colors: Palette) {
  const base = {
    minHeight: HEADER_HEIGHT,
    backgroundColor: colors.INFO,
    color: colors.WHITE,
    flexDirection: 'row' as const,
    paddingHorizontal: 20,
  };

  switch (type) {
    case 'danger':
      return { ...base, backgroundColor: colors.ERROR };
    case 'info':
      return { ...base, backgroundColor: colors.INFO };
    case 'success':
      return { ...base, backgroundColor: colors.SUCCESS };
    case 'warning':
      return { ...base, backgroundColor: colors.WARNING };
    default:
      return base;
  }
}

export default function showFlashMessage(params: Message) {
  const { message = '', description = undefined, type = 'info', duration = 8000, ref } = params;
  const colors = getActivePalette();
  const style = getStyle(type, colors);

  function navigateURL() {
    if (params?.url) {
      try {
        Linking.openURL(params.url);
      } catch {}
    }
  }
  if (message) {
    if (ref?.current) {
      // @ts-ignore - flash-message types don't include showMessage on ref
      ref.current.showMessage({
        message,
        description,
        type,
        icon: 'auto',
        duration: 3000,
        style,
        backgroundColor: style.backgroundColor,
        color: style.color,
        textStyle: {
          writingDirection: isRTL ? 'rtl' : 'auto',
          paddingRight: 20,
        },
        titleStyle: {
          writingDirection: isRTL ? 'rtl' : 'auto',
          paddingRight: 20,
        },
      });
    } else {
      showMessage({
        message,
        description,
        type,
        icon: 'auto',
        duration,
        style,
        backgroundColor: style.backgroundColor,
        color: style.color,
        textStyle: {
          writingDirection: isRTL ? 'rtl' : 'auto',
          paddingRight: 20,
        },
        onPress: () => navigateURL(),
        titleStyle: {
          writingDirection: isRTL ? 'rtl' : 'auto',
          paddingRight: 20,
        },
      });
    }
  }
}

export function handleSuccessMessage(message?: string, ref?: React.RefObject<unknown>) {
  if (message) {
    showFlashMessage({ message, type: 'success', ref });
  }
}

export function handleWarningMessage(message?: string, ref?: React.RefObject<unknown>) {
  if (message) {
    showFlashMessage({ message, type: 'warning', ref });
  }
}

export function handleErrorMessage(e?: ApiResponse<unknown> | object | string, ref?: React.RefObject<unknown>) {
  if (typeof e === 'object' && e !== null && 'status' in e && typeof e.status === 'number' && e.status >= 500) {
    const message = translate('common:something_went_wrong');
    const description = '';
    showFlashMessage({ message, description, type: 'danger', ref });
  } else {
    const message = getErrorMessage(e) || translate('common:something_went_wrong');
    const desc = getErrorsText((e as { data?: { errors?: Record<string, unknown> } })?.data?.errors);
    showFlashMessage({ message, description: desc ?? undefined, type: 'danger', ref });
  }
}
