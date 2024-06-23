import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CogIcon, PlusCircleIcon } from "lucide-react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Home() {
  return (
    <div className="md:fixed md:h-full md:w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1.5fr] xl:grid-cols-[1fr_2fr]">
      <div className="flex flex-col justify-center items-center bg-muted py-10 md:py-0">
        <h1 className="text-4xl mb-4 md:hidden font-bold">Your Calendar</h1>
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>You have x meetings this month</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar mode="single" fromDate={new Date()} />
          </CardContent>
          <CardFooter>
            <div className="flex items-center justify-center w-full gap-2">
              <p className="text-gray-700 dark:text-gray-200">In a hurry?</p>{" "}
              <Badge variant="secondary">
                <a href={`tel:${process.env.TWILIO_PHONE_NUMBER}`}>
                  Call {process.env.TWILIO_PHONE_NUMBER}
                </a>
              </Badge>
            </div>
          </CardFooter>
        </Card>
        <Card className="mt-4">
          <CardHeader>
            <div className="flex items-center justify-center gap-4">
              <ThemeSwitcher />
              <Button
                title="Settings"
                aria-label="Account settings"
                asChild
                variant="outline"
                size="icon"
              >
                <Link href="/settings">
                  <CogIcon className="size-5" />
                </Link>
              </Button>
              <Button asChild variant="destructive">
                <Link href="/logout">Logout</Link>
              </Button>
            </div>
          </CardHeader>
        </Card>
      </div>
      <ScrollArea className="px-6 py-4">
        <h1 className="text-4xl md:text-5xl mt-8 font-bold flex items-center justify-between">
          Your Events
          <Button asChild>
            <Link href="/new">
              <PlusCircleIcon className="size-5 md:mr-2" />
              <span className="sr-only md:not-sr-only">New Meeting</span>
            </Link>
          </Button>
        </h1>
        <hr className="border-t-2 border-muted my-4" />
        <h3 className="text-2xl md:text-4xl font-medium mt-8 mb-4 flex items-center gap-4">
          Events on this day <Badge>2024-05-03</Badge>
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          You have no events on this day.{" "}
          <Link href="/new" className="underline">
            Create one?
          </Link>
        </p>
        <h3 className="text-2xl md:text-4xl font-medium mt-8 mb-4 flex items-center gap-4">
          Other upcoming events
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          You have no upcoming events.{" "}
          <Link href="/new" className="underline">
            Create one?
          </Link>
        </p>
      </ScrollArea>
    </div>
  );
}
