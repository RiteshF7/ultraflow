import { CalendarIcon, FileTextIcon } from "@radix-ui/react-icons";
import { BellIcon, Share2Icon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { AnimatedBeamMultipleOutputDemo } from "@/components/animated-beam";
import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";
import Marquee from "@/components/magicui/marquee";
import {AnimatedListDemo} from "@/components/animated-list";
import { bentoGridContent } from "@/config/landing-page";

const features = [
  {
    Icon: FileTextIcon,
    name: bentoGridContent.features[0].name,
    description: bentoGridContent.features[0].description,
    href: bentoGridContent.features[0].href,
    cta: bentoGridContent.features[0].cta,
    className: "col-span-3 lg:col-span-1",
    background: (
      <Marquee
        pauseOnHover
        className="absolute top-10 [--duration:20s] [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] "
      >
        {bentoGridContent.files.map((f, idx) => (
          <figure
            key={idx}
            className={cn(
              "relative w-32 cursor-pointer overflow-hidden rounded-xl border p-4",
              "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
              "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
              "transform-gpu blur-[1px] transition-all duration-300 ease-out hover:blur-none",
            )}
          >
            <div className="flex flex-row items-center gap-2">
              <div className="flex flex-col">
                <figcaption className="text-sm font-medium dark:text-white ">
                  {f.name}
                </figcaption>
              </div>
            </div>
            <blockquote className="mt-2 text-xs">{f.body}</blockquote>
          </figure>
        ))}
      </Marquee>
    ),
  },
  // {
  //   Icon: BellIcon,
  //   name: "Notifications",
  //   description: "Get notified when something happens.",
  //   href: "#",
  //   cta: "Learn more",
  //   className: "col-span-3 lg:col-span-2",
  //   background: (
  //     <AnimatedListDemo className="absolute right-2 top-4 h-[300px] w-full border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-105" />
  //   ),
  // },
  // {
  //   Icon: Share2Icon,
  //   name: "Integrations",
  //   description: "Supports 100+ integrations and counting.",
  //   href: "#",
  //   cta: "Learn more",
  //   className: "col-span-3 lg:col-span-2",
  //   background: (
  //     <AnimatedBeamMultipleOutputDemo className="absolute right-2 top-4 h-[300px] border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-105" />
  //   ),
  // },
  {
    Icon: CalendarIcon,
    name: bentoGridContent.features[1].name,
    description: bentoGridContent.features[1].description,
    className: "col-span-3 lg:col-span-1",
    href: bentoGridContent.features[1].href,
    cta: bentoGridContent.features[1].cta,
    background: (
      <Calendar
        mode="single"
        selected={new Date(2022, 4, 11, 0, 0, 0)}
        className="absolute right-0 top-10 origin-top rounded-md border transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] group-hover:scale-105"
      />
    ),
  },
];

export function BentoDemo() {
  return (
    <div>
      <BentoGrid>
        {features.map((feature, idx) => (
          <BentoCard key={idx} {...feature} />
        ))}
      </BentoGrid>
    </div>
  );
}
