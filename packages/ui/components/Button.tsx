import React from 'react';
import type { PressableProps, StyleProp, ViewStyle } from 'react-native';
import { Pressable, StyleSheet, Text } from 'react-native';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'medium',
  style,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      {...props}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        styles[size],
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}>
      <Text style={[
        styles.text,
        variant === 'secondary' && styles.textSecondary
      ]}>
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    userSelect: 'none',
  },
  primary: {
    backgroundColor: '#646cff',
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#646cff',
  },
  text: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  textSecondary: {
    color: '#646cff',
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
}); 