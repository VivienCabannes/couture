import "./src/i18n";

import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { ThemeProvider } from "./src/theme/ThemeProvider";
import { useTheme } from "./src/hooks/useTheme";
import { HeaderActions } from "./src/components/HeaderActions";
import { HomeScreen } from "./src/features/home/HomeScreen";
import { DesignerScreen } from "./src/features/designer/DesignerScreen";
import { ShopScreen } from "./src/features/shop/ShopScreen";
import { ModelistScreen } from "./src/features/modelist/ModelistScreen";
import { MeasurementsScreen } from "./src/features/measurements/MeasurementsScreen";
import { SewingScreen } from "./src/features/sewing/SewingScreen";
import { HelpScreen } from "./src/features/help/HelpScreen";

export type RootStackParamList = {
  Home: undefined;
  Designer: undefined;
  Shop: undefined;
  Modelist: { garmentType: string };
  Measurements: undefined;
  Sewing: undefined;
  Help: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const { isDark, colors } = useTheme();
  const { t } = useTranslation();

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      card: colors.headerBg,
      text: colors.text,
      border: colors.cardBorder,
      primary: colors.primary,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerTintColor: colors.text,
          headerStyle: { backgroundColor: colors.headerBg },
          headerTitleStyle: { color: colors.text, fontWeight: "600" },
          headerRight: () => <HeaderActions />,
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Couture" }}
        />
        <Stack.Screen
          name="Designer"
          component={DesignerScreen}
          options={{ title: t("designer.title") }}
        />
        <Stack.Screen
          name="Shop"
          component={ShopScreen}
          options={{ title: t("shop.title") }}
        />
        <Stack.Screen
          name="Modelist"
          component={ModelistScreen}
          options={{ title: t("modelist.title") }}
        />
        <Stack.Screen
          name="Measurements"
          component={MeasurementsScreen}
          options={{ title: t("measurements.title") }}
        />
        <Stack.Screen
          name="Sewing"
          component={SewingScreen}
          options={{ title: t("sewing.title") }}
        />
        <Stack.Screen
          name="Help"
          component={HelpScreen}
          options={{ title: t("help.title") }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}
