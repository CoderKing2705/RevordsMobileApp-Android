import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Favourite from "./Favourites";
import { Ionicons } from "@expo/vector-icons";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileStack from "./ProfileStack";
import LocationStack from "./LocationStack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useErrorHandler } from "./ErrorHandler";
import { useContext, useEffect, useState } from "react";
import PageSequenceContext from "./contexts/PageSequence/PageSequenceContext";

export default function TabNavigation({ route, navigation }) {
  const Tab = createBottomTabNavigator();
  const { MemberData } = route.params;
  const Stack = createNativeStackNavigator();
  const PageSequence = useContext(PageSequenceContext);
  AsyncStorage.getItem("token")
    .then((value) => {
      if (value === null) {
        AsyncStorage.setItem("token", JSON.stringify(MemberData))
          .then(() => {
            console.log("Data saved successfully!");
          })
          .catch(async (error) => {
            await useErrorHandler(
              "(Android): TabNavigation > AsyncStorage" + error
            );
          });
      }
    })
    .catch(async (error) => {
      await useErrorHandler("(Android): TabNavigation > AsyncStorage" + error);
    });

  return (
    <>
      <Tab.Navigator
        initialRouteName={PageSequence.pageSequenceData.mobileFirstTab}
        screenOptions={() => ({
          tabBarActiveTintColor: "white",
          tabBarInactiveTintColor: "gray",
          labelStyle: {
            fontSize: 20,
            fontWeight: "bold",
          },
          tabBarStyle: {
            backgroundColor: "black",
            height: 70,
            paddingBottom: 10,
          },
          style: {
            backgroundColor: "white",
            borderTopWidth: 1,
            borderTopColor: "lightgray",
          },
        })}
      >
        <Tab.Screen
          name="Location"
          component={LocationStack}
          options={{
            unmountOnBlur: true,
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="compass-outline" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Favorite"
          component={Favourite}
          initialParams={MemberData[0].memberId}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="heart" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileStack}
          initialParams={{ MemberData }}
          options={{
            unmountOnBlur: true,
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="person-circle-outline"
                color={color}
                size={size}
              />
            ),
          }}
        />
      </Tab.Navigator>
    </>
  );
}
