import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./src/screens/HomeScreen";
import PatternScreen from "./src/screens/PatternScreen";

type RootStackParamList = {
  Home: undefined;
  Pattern: { type: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Pattern Drafting" }}
        />
        <Stack.Screen
          name="Pattern"
          component={PatternScreen}
          options={({ route }) => ({ title: route.params.type })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
