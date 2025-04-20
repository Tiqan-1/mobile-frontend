import { PALETTE } from "@/theme/colors";
import { isRTL } from "@/utils/constants";
import type React from "react";
import { useTranslation } from "react-i18next";
import { Linking } from "react-native";
import { showMessage } from "react-native-flash-message";

export const getErrorMessage = (e) => {
  if (typeof e === "string") {
    return e;
  }
  return e?.data?.message || null;
};

export const getErrorsText = (errors = {}) => {
  const errorsKeys = Object.keys(errors);
  if (errorsKeys.length) {
    let text = "";
    errorsKeys.forEach((key) => {
      if (Array.isArray(errors[key]) && errors[key].length) {
        text += errors[key] + " ";
      } else if (typeof errors[key] === "string") {
        text += errors[key] + " ";
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
  type: "danger" | "info" | "success" | "url" | "warning";
}

export default function showFlashMessage(params: Message) {
  const {
    message = null,
    description = null,
    type = "info",
    duration = 8000,
    ref,
  } = params;
  const HEADER_HEIGHT = 50;
  const defaultStyle = {
    minHeight: HEADER_HEIGHT,
    backgroundColor: PALETTE.INFO,
    color: PALETTE.WHITE,
    flexDirection: "row",
    paddingHorizontal: 20,
  };

  function getStyle() {
    switch (type) {
      case "danger":
        return {
          ...defaultStyle,
          backgroundColor: PALETTE.ERROR,
          color: PALETTE.WHITE,
          flexDirection: "row",
          paddingHorizontal: 20,
        };
      case "info":
        return {
          ...defaultStyle,
          backgroundColor: PALETTE.INFO,
          color: PALETTE.WHITE,
          flexDirection: "row",
          paddingHorizontal: 20,
        };
      case "success":
        return {
          ...defaultStyle,
          backgroundColor: PALETTE.SUCCESS,
          color: PALETTE.WHITE,
          flexDirection: "row",
          paddingHorizontal: 20,
        };
      case "warning":
        return {
          ...defaultStyle,
          backgroundColor: PALETTE.WARNING,
          color: PALETTE.WHITE,
          flexDirection: "row",
          paddingHorizontal: 20,
        };
      default:
        return defaultStyle;
    }
  }
  const navigateURL = () => {
    if (params?.url) {
      try {
        Linking.openURL(params?.url);
      } catch {}
    }
  };
  if (message) {
    if (ref?.current) {
      ref.current.showMessage({
        message,
        description,
        type,
        icon: "auto",
        duration: 3000,
        style: getStyle(),
        backgroundColor: getStyle().backgroundColor,
        color: getStyle().color,
        textStyle: {
          writingDirection: isRTL ? "rtl" : "auto",
          paddingRight: 20,
        },
        titleStyle: {
          writingDirection: isRTL ? "rtl" : "auto",
          paddingRight: 20,
        },
      });
    } else {
      showMessage({
        message,
        description,
        type,
        icon: "auto",
        duration,
        style: getStyle(),
        backgroundColor: getStyle().backgroundColor,
        color: getStyle().color,
        textStyle: {
          writingDirection: isRTL ? "rtl" : "auto",
          paddingRight: 20,
        },
        onPress: () => navigateURL(),
        titleStyle: {
          writingDirection: isRTL ? "rtl" : "auto",
          paddingRight: 20,
        },
      });
    }
  }
}

export function handleSuccessMessage(message?: string, ref?: React.RefObject<unknown>) {
  if (message) {
    showFlashMessage({ message, type: "success", ref });
  }
}

export function handleWarningMessage(message?: string, ref?: React.RefObject<unknown>) {
  if (message) {
    showFlashMessage({ message, type: "warning", ref });
  }
}

export function handleErrorMessage(e?: object, ref?: React.RefObject<unknown>) {
  const { t, i18n } = useTranslation();

  if (
    e.status >= 500 ||
    e.status === 401 ||
    e.data?.message === "Unauthenticated."
  ) {
    const message = t("common:something_went_wrong");
    const description = "";
  } else {
    const message = getErrorMessage(e) || t("common:something_went_wrong");
    const description = getErrorsText(e?.data?.errors);
    showFlashMessage({ message, description, type: "danger", ref });
  }
}
