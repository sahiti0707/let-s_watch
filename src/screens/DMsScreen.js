import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon';
import { colors, styles } from '../utils/styles';

const MOCK_DMS = [
  {
    id: '1',
    username: 'sam',
    status: 'online',
    lastMessage: 'down to watch Dune tonight?',
    time: '5m ago',
    unread: 2,
  },
  {
    id: '2',
    username: 'alex',
    status: 'away',
    lastMessage: 'blade runner was incredible',
    time: '2h ago',
    unread: 0,
  },
  {
    id: '3',
    username: 'jordan',
    status: 'offline',
    lastMessage: 'adding interstellar to the list',
    time: '1d ago',
    unread: 0,
  },
  {
    id: '4',
    username: 'riley',
    status: 'online',
    lastMessage: 'the matrix is a 10/10',
    time: '3d ago',
    unread: 1,
  },
];

function getStatusColor(status) {
  switch (status) {
    case 'online': return colors.success;
    case 'away': return '#ffaa44';
    case 'offline': return colors.textMuted;
    default: return colors.textMuted;
  }
}

export function DMsScreen() {
  const insets = useSafeAreaInsets();
  const [dms] = useState(MOCK_DMS);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={headerStyles.header}>
        <Text style={headerStyles.logo}>let's_watch</Text>
        <TouchableOpacity style={headerStyles.newBtn}>
          <Icon name="send" size={18} color={colors.text} />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Messages</Text>
      <Text style={styles.subtitle}>chat with your watch party</Text>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {dms.map((dm) => (
          <TouchableOpacity key={dm.id} style={styles.card} activeOpacity={0.7}>
            <View style={dmStyles.row}>
              <View style={dmStyles.avatar}>
                <Text style={dmStyles.avatarText}>
                  {dm.username[0].toUpperCase()}
                </Text>
                <View style={[dmStyles.statusDot, { backgroundColor: getStatusColor(dm.status) }]} />
              </View>

              <View style={dmStyles.content}>
                <View style={dmStyles.topRow}>
                  <Text style={dmStyles.username}>{dm.username}</Text>
                  <Text style={dmStyles.time}>{dm.time}</Text>
                </View>
                <View style={dmStyles.bottomRow}>
                  <Text style={dmStyles.lastMessage} numberOfLines={1}>
                    {dm.lastMessage}
                  </Text>
                  {dm.unread > 0 && (
                    <View style={dmStyles.unreadBadge}>
                      <Text style={dmStyles.unreadText}>{dm.unread}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const headerStyles = {
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logo: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '300',
    letterSpacing: 1.5,
    textTransform: 'lowercase',
  },
  newBtn: {
    padding: 4,
  },
};

const dmStyles = {
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    position: 'relative',
  },
  avatarText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.card,
    position: 'absolute',
    bottom: -1,
    right: -1,
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  time: {
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 0.3,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    color: colors.textSecondary,
    fontSize: 13,
    letterSpacing: 0.3,
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: colors.text,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    color: colors.bg,
    fontSize: 10,
    fontWeight: '700',
  },
};
