import { Button, Html, Head, Body } from "@react-email/components";
import * as React from "react";

export default function Email() {
  return (
    <Html>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Red+Hat+Text:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Body style={{ fontFamily: '"Red Hat Text", Arial, sans-serif' }}>
        <Button
          href="https://example.com"
          style={{ background: "#000", color: "#fff", padding: "12px 20px" }}
        >
          Click me
        </Button>
      </Body>
    </Html>
  );
}