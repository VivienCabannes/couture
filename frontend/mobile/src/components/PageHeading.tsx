import { Text, StyleSheet } from "react-native";
import { useTheme } from "../hooks/useTheme";

interface Props {
  children: string;
}

/** Styled heading text, replacing the web's <h1> PageHeading. */
export function PageHeading({ children }: Props) {
  const { colors } = useTheme();

  return (
    <Text style={[styles.heading, { color: colors.text }]}>{children}</Text>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
  },
});
