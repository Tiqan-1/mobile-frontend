import type { Meta, StoryObj } from '@storybook/react-native';
import { ScrollView, View } from 'react-native';

import { Text } from '@/components/atoms/Text';
import { radii, spacing, useTheme } from '@/theme';
import type { ColorTokens } from '@/theme/tokens/colors';
import { PALETTEDARK, PALETTELIGHT } from '@/theme/tokens/colors';
import { getTypographyStyles } from '@/theme/tokens/typography';

// Token-scale review sheets (T2c) — not app components, just the fastest way
// to eyeball the T2a token work. Colocated with the tokens they read from.

function ColorColumn({ title, palette }: { palette: ColorTokens; title: string }) {
  return (
    <View style={{ flex: 1, paddingHorizontal: 8 }}>
      <Text isBold>{title}</Text>
      {Object.entries(palette).map(([name, value]) => (
        <View key={name} style={{ alignItems: 'center', flexDirection: 'row', marginVertical: 3 }}>
          <View
            style={{
              backgroundColor: value as string,
              borderColor: '#00000030',
              borderWidth: 1,
              height: 20,
              marginRight: 8,
              width: 20,
            }}
          />
          <Text style={{ flexShrink: 1 }} type="smallText">
            {name}: {value as string}
          </Text>
        </View>
      ))}
    </View>
  );
}

function ColorSwatchSheet() {
  return (
    <ScrollView>
      <View style={{ flexDirection: 'row' }}>
        <ColorColumn palette={PALETTELIGHT} title="فاتح (light)" />
        <ColorColumn palette={PALETTEDARK} title="داكن (dark)" />
      </View>
    </ScrollView>
  );
}

function TypeRamp() {
  const { colors } = useTheme();
  const typography = getTypographyStyles(colors);

  return (
    <ScrollView>
      {Object.entries(typography).map(([name, style]) => (
        <Text key={name} style={style}>
          {name} — نموذج نص عربي
        </Text>
      ))}
    </ScrollView>
  );
}

function SpacingRuler() {
  return (
    <ScrollView>
      {Object.entries(spacing).map(([name, value]) => (
        <View key={name} style={{ alignItems: 'center', flexDirection: 'row', marginVertical: 6 }}>
          <Text style={{ width: 60 }}>
            {name} ({value}px)
          </Text>
          <View style={{ backgroundColor: '#00A76F', height: 12, width: value }} />
        </View>
      ))}
      <Text isBold>Radii</Text>
      {Object.entries(radii).map(([name, value]) => (
        <View key={name} style={{ alignItems: 'center', flexDirection: 'row', marginVertical: 6 }}>
          <Text style={{ width: 60 }}>
            {name} ({value}px)
          </Text>
          <View
            style={{
              backgroundColor: '#00A76F',
              borderRadius: value,
              height: 32,
              width: 32,
            }}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const meta = {
  title: 'Tokens/Scales',
  component: ColorSwatchSheet,
} satisfies Meta<typeof ColorSwatchSheet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ColorSwatches: Story = {};

export const TypeRampStory: Story = {
  render: () => <TypeRamp />,
};

export const SpacingRulerStory: Story = {
  render: () => <SpacingRuler />,
};
