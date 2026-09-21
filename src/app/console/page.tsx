import { Nav, Footer } from "@/components/chrome";
import { ConsoleApp } from "@/components/console-ui";

export const metadata = {
  title: "VYOMA Console — live satellite analysis",
};

export default function ConsolePage() {
  return (
    <main>
      <Nav />
      <ConsoleApp />
      <Footer />
    </main>
  );
}
