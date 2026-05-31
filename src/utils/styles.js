import { StyleSheet } from 'react-native';

export const colors = {
  bg: '#0a0a0a',
  surface: '#121212',
  card: '#1a1a1a',
  border: 'rgba(255, 255, 255, 0.06)',
  text: '#ffffff',
  textSecondary: 'rgba(255, 255, 255, 0.5)',
  textMuted: 'rgba(255, 255, 255, 0.3)',
  accent: '#ffffff',
  danger: '#ff4444',
  success: '#44ff88',
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  screen: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: 60,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '300',
    letterSpacing: 1,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  textSecondary: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  button: {
    backgroundColor: colors.text,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.bg,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
