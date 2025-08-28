"use client";

import { ChakraProvider, defaultSystem } from "@chakra-ui/react";

export default function RootLayout(props) {
  return (
    <ChakraProvider value={defaultSystem}>{props.children}</ChakraProvider>
  );
}
