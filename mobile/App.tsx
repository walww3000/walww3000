import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import { EventsProvider } from './src/hooks/useEvents';
import CalendarScreen from './src/screens/CalendarScreen';
import AddEventScreen from './src/screens/AddEventScreen';
import { Colors } from './src/utils/colors';

export type RootStackParamList = {
  Calendar: undefined;
  AddEvent: { dateKey: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <EventsProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Stack.Navigator
          initialRouteName="Calendar"
          screenOptions={{
            headerStyle: { backgroundColor: Colors.surface },
            headerTintColor: Colors.text,
            headerTitleStyle: { fontWeight: '700' },
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen
            name="Calendar"
            component={CalendarScreen}
            options={{ title: '日历' }}
          />
          <Stack.Screen
            name="AddEvent"
            component={AddEventScreen}
            options={{ title: '新建事件' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </EventsProvider>
  );
}
