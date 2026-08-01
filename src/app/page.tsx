import { EventConsole } from "@/features/events/components/EventConsole";
import { HomeWelcome } from "@/features/events/components/HomeWelcome";

export default function HomePage() {
  return (
    <>
      <HomeWelcome />
      <div id="event-studio" className="scroll-mt-4">
        <EventConsole />
      </div>
    </>
  );
}
