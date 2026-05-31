import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon';
import { colors, styles } from '../utils/styles';

const MOCK_FEED = [
  {
    id: '1',
    type: 'friend_watch',
    username: 'alex',
    movie: 'Blade Runner 2049',
    action: 'watched',
    time: '2h ago',
  },
  {
    id: '2',
    type: 'rating',
    username: 'sam',
    movie: 'The Matrix',
    action: 'rated',
    rating: 5,
    time: '4h ago',
  },
  {
    id: '3',
    type: 'watch_party',
    username: 'jordan',
    movie: 'Dune: Part Two',
    action: 'invites you to watch',
    time: '6h ago',
  },
  {
    id: '4',
    type: 'friend_added',
    username: 'riley',
    movie: null,
    action: 'joined let\'s_watch',
    time: '1d ago',
  },
  {
    id: '5',
    type: 'reflection',
    username: 'casey',
    movie: 'Interstellar',
    action: 'reflected on',
    reflection: '"the cornfield chase scene is perfection"',
    time: '2d ago',
  },
];

export function FeedScreen() {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [feed, setFeed] = useState(MOCK_FEED);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  function getIcon(type) {
    switch (type) {
      case 'friend_watch': return 'eye';
      case 'rating': return 'thumbsUp';
      case 'watch_party': return 'movie';
      case 'friend_added': return 'user';
      case 'reflection': return 'dm';
      default: return 'feed';
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={headerStyles.header}>
        <Text style={headerStyles.logo}>let's_watch</Text>
        <View style={headerStyles.headerRight}>
          <TouchableOpacity style={headerStyles.iconBtn}>
            <Icon name="search" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={headerStyles.iconBtn}>
            <Icon name="bell" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.textSecondary}
          />
        }
      >
        <Text style={styles.title}>Feed</Text>
        <Text style={styles.subtitle}>activity from your circle</Text>

        {feed.map((item) => (
          <TouchableOpacity key={item.id} style={styles.card} activeOpacity={0.7}>
            <View style={feedStyles.cardRow}>
              <View style={feedStyles.iconContainer}>
                <Icon name={getIcon(item.type)} size={18} color={colors.text} />
              </View>
              <View style={feedStyles.content}>
                <Text style={feedStyles.username}>{item.username}</Text>
                <Text style={feedStyles.action}>
                  {item.action}{item.movie ? ` ${item.movie}` : ''}
                </Text>
                {item.reflection && (
                  <Text style={feedStyles.reflection}>{item.reflection}</Text>
                )}
                {item.rating && (
                  <View style={feedStyles.ratingRow}>
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <Text key={i} style={feedStyles.star}>{'\u2605'}</Text>
                    ))}
                  </View>
                )}
                <Text style={feedStyles.time}>{item.time}</Text>
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
  headerRight: {
    flexDirection: 'row',
    gap: 16,
  },
  iconBtn: {
    padding: 4,
  },
};

const feedStyles = {
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  username: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  action: {
    color: colors.textSecondary,
    fontSize: 13,
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  reflection: {
    color: colors.textMuted,
    fontSize: 12,
    fontStyle: 'italic',
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    marginBottom: 4,
    gap: 2,
  },
  star: {
    color: colors.text,
    fontSize: 12,
  },
  time: {
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 0.3,
  },
};
