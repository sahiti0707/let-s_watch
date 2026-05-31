import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperBackground } from './src/components/PaperBackground';
import { FeedScreen } from './src/screens/FeedScreen';
import { WatchlistScreen } from './src/screens/WatchlistScreen';
import { DMsScreen } from './src/screens/DMsScreen';
import { WatchTogetherScreen } from './src/screens/WatchTogetherScreen';
import { Icon } from './src/components/Icon';
import { styles } from './src/utils/styles';

const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <PaperBackground>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: 'rgba(18, 18, 18, 0.95)',
            borderTopColor: 'rgba(255, 255, 255, 0.06)',
            borderTopWidth: 1,
            height: 72,
            paddingBottom: 12,
            paddingTop: 8,
            elevation: 0,
          },
          tabBarActiveTintColor: '#ffffff',
          tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.3)',
          tabBarLabelStyle: {
            fontSize: 10,
            fontFamily: 'System',
            letterSpacing: 0.5,
            textTransform: 'uppercase',
          },
        }}
      >
        <Tab.Screen
          name="Feed"
          component={FeedScreen}
          options={{
            tabBarIcon: ({ color }) => <Icon name="feed" color={color} />,
          }}
        />
        <Tab.Screen
          name="Watchlist"
          component={WatchlistScreen}
          options={{
            tabBarIcon: ({ color }) => <Icon name="watchlist" color={color} />,
          }}
        />
        <Tab.Screen
          name="DMs"
          component={DMsScreen}
          options={{
            tabBarIcon: ({ color }) => <Icon name="dm" color={color} />,
          }}
        />
      </Tab.Navigator>
    </PaperBackground>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer
        theme={{
          dark: true,
          colors: {
            primary: '#ffffff',
            background: '#0a0a0a',
            card: '#121212',
            text: '#ffffff',
            border: 'rgba(255,255,255,0.06)',
            notification: '#ffffff',
          },
        }}
      >
        <StatusBar style="light" />
        <MainTabs />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
