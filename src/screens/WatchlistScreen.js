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

const MOCK_WATCHLIST = [
  { id: '1', title: 'Blade Runner 2049', year: '2017', addedBy: 'you', matched: true },
  { id: '2', title: 'The Matrix', year: '1999', addedBy: 'sam', matched: true },
  { id: '3', title: 'Dune: Part Two', year: '2024', addedBy: 'you', matched: false },
  { id: '4', title: 'Interstellar', year: '2014', addedBy: 'jordan', matched: false },
  { id: '5', title: 'Paprika', year: '2006', addedBy: 'you', matched: false },
  { id: '6', title: 'Arrival', year: '2016', addedBy: 'sam', matched: false },
];

const READY_MOVIES = [
  { id: '1', title: 'Blade Runner 2049', year: '2017', friend: 'sam' },
  { id: '2', title: 'The Matrix', year: '1999', friend: 'sam' },
];

export function WatchlistScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [watchlist] = useState(MOCK_WATCHLIST);
  const [ready] = useState(READY_MOVIES);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={headerStyles.header}>
        <Text style={headerStyles.logo}>let's_watch</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <Text style={styles.title}>Watchlist</Text>
        <Text style={styles.subtitle}>what you and your friends want to watch</Text>

        <View style={searchStyles.container}>
          <Icon name="search" size={16} color={colors.textMuted} />
          <TextInput
            style={searchStyles.input}
            placeholder="search movies..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {ready.length > 0 && (
          <>
            <Text style={[styles.subtitle, { marginTop: 8 }]}>
              ready to watch
            </Text>
            {ready.map((movie) => (
              <TouchableOpacity key={movie.id} style={[styles.card, readyStyles.card]} activeOpacity={0.7}>
                <View style={readyStyles.left}>
                  <View style={readyStyles.matchDot} />
                  <View>
                    <Text style={styles.text}>{movie.title}</Text>
                    <Text style={styles.textSecondary}>{movie.year}  \u00b7  matched with {movie.friend}</Text>
                  </View>
                </View>
                <View style={readyStyles.badge}>
                  <Text style={readyStyles.badgeText}>watch</Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        <Text style={[styles.subtitle, { marginTop: 16 }]}>
          all movies ({watchlist.length})
        </Text>

        {watchlist.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={watchlistStyles.row}>
              <View style={watchlistStyles.info}>
                <Text style={styles.text}>{item.title}</Text>
                <Text style={styles.textSecondary}>
                  {item.year}  \u00b7  added by {item.addedBy}
                </Text>
              </View>
              {item.matched && (
                <View style={watchlistStyles.matchBadge}>
                  <Icon name="check" size={14} color={colors.bg} />
                </View>
              )}
            </View>
          </View>
        ))}

        <TouchableOpacity style={[styles.button, { marginHorizontal: 20, marginTop: 16 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon name="plus" size={16} color={colors.bg} />
            <Text style={styles.buttonText}>add movie</Text>
          </View>
        </TouchableOpacity>
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
};

const searchStyles = {
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: 20,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    letterSpacing: 0.3,
    height: 40,
  },
};

const readyStyles = {
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  matchDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  badge: {
    backgroundColor: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  badgeText: {
    color: colors.bg,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
};

const watchlistStyles = {
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  info: {
    flex: 1,
  },
  matchBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
};
