import Hero from "@/components/(home)/hero";
import Container from "@/components/Container";
import { GradientBackground } from "@/components/gradient-wrapper";

export default function Home() {
  return (
    <div className="">
      {/*  gradient bd*/}
      <GradientBackground />
      <Container>
        <Hero />
      </Container>
    </div>
  );
}
