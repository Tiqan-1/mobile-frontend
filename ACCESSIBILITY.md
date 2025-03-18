# Accessibility Guidelines

This document provides guidelines for making the app accessible to all users, including those with disabilities.

## Table of Contents

1. [Introduction](#introduction)
2. [Components](#components)
3. [Best Practices](#best-practices)
4. [Testing](#testing)
5. [Resources](#resources)

## Introduction

Accessibility is an important aspect of mobile app development. It ensures that all users, including those with disabilities, can use the app effectively. This document provides guidelines for making the app accessible.

## Components

The app includes several accessible components that you should use:

### Text

Use the `Text` component from `@/components/atoms/Text` which includes accessibility props:

```tsx
import { Text } from '@/components/atoms/Text';

<Text 
  accessibilityLabel="This is read by screen readers"
  accessibilityHint="Provides additional context"
  accessibilityRole="header"
>
  Hello World
</Text>
```

### Button

Use the `Button` component from `@/components/atoms/Button` which includes accessibility props:

```tsx
import Button from '@/components/atoms/Button';

<Button 
  title="Submit"
  accessibilityLabel="Submit form"
  accessibilityHint="Submits the form and saves your data"
/>
```

### AccessibleImage

Use the `AccessibleImage` component for images:

```tsx
import AccessibleImage from '@/components/atoms/AccessibleImage';

<AccessibleImage
  source={require('@/assets/images/logo.png')}
  accessibilityDescription="Company logo"
  isDecorative={false}
/>
```

### Accessibility Context

Use the `useAccessibility` hook to access accessibility settings:

```tsx
import { useAccessibility } from '@/utils/accessibility/AccessibilityContext';

const MyComponent = () => {
  const { isScreenReaderEnabled, announceForAccessibility } = useAccessibility();
  
  // Use this to announce messages to screen readers
  const handleSuccess = () => {
    announceForAccessibility('Form submitted successfully');
  };
  
  return (
    // Your component
  );
};
```

### Accessibility Focus

Use the `useAccessibilityFocus` hook to manage focus:

```tsx
import { useAccessibilityFocus } from '@/hooks/useAccessibilityFocus';

const MyComponent = () => {
  const { ref, setFocus } = useAccessibilityFocus();
  
  // Set focus to the element when component mounts
  useEffect(() => {
    setFocus();
  }, []);
  
  return (
    <Text ref={ref}>This will receive focus</Text>
  );
};
```

## Best Practices

1. **Provide text alternatives for non-text content**
   - Use `accessibilityLabel` for images, icons, and buttons without text
   - Use `accessibilityDescription` for `AccessibleImage` components

2. **Ensure sufficient color contrast**
   - Text should have a contrast ratio of at least 4.5:1 against its background
   - Use the theme's color palette which has been designed with accessibility in mind

3. **Make all functionality available from a keyboard**
   - Ensure all interactive elements are focusable and can be activated with a screen reader

4. **Provide clear and descriptive labels**
   - Use clear and concise text for buttons, links, and form controls
   - Use `accessibilityHint` to provide additional context when needed

5. **Create a logical tab order**
   - Ensure the tab order follows the visual layout of the screen
   - Use `accessibilityViewIsModal` for modals to trap focus

6. **Support text resizing**
   - Use relative units (e.g., percentages) for text and container sizes
   - Test with different font sizes

7. **Provide sufficient time**
   - Allow users to extend time limits or disable them altogether
   - Avoid auto-advancing content

8. **Avoid content that flashes**
   - Avoid content that flashes more than three times per second
   - Respect the user's reduce motion settings

## Testing

1. **Manual Testing**
   - Test with VoiceOver (iOS) or TalkBack (Android)
   - Test with different font sizes
   - Test with high contrast mode

2. **Automated Testing**
   - Use accessibility linting tools
   - Include accessibility checks in your unit and integration tests

3. **User Testing**
   - Conduct user testing with people who use assistive technologies

## Resources

- [React Native Accessibility](https://reactnative.dev/docs/accessibility)
- [iOS Accessibility](https://developer.apple.com/accessibility/ios/)
- [Android Accessibility](https://developer.android.com/guide/topics/ui/accessibility)
- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/standards-guidelines/wcag/)
- [BBC Mobile Accessibility Guidelines](https://www.bbc.co.uk/accessibility/forproducts/guides/mobile/) 