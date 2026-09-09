import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Partners } from "@/components/sections/partners";
import { Join } from "@/components/sections/join";
import { Message } from "@/components/sections/message";
import { Faq } from "@/components/sections/faq";
import { Cta } from "@/components/sections/cta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Message />
      <About />
      <Partners />
      <Join />
      <Cta />
      <Faq />
    </>
  );
}
