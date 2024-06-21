import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmailButton, UsePhoneNumberButton } from "./buttons";
import { PhoneCallIcon } from "lucide-react";

export default function AuthPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const isEmail =
    typeof searchParams.email !== "undefined"
      ? searchParams.email.length > 0
      : false;

  return (
    <div className="fixed w-full h-full top-0 left-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1.5fr] xl:grid-cols-[1fr_2fr`]">
      <div className="flex items-center justify-center px-6">
        <div className="flex flex-col gap-6 min-w-[300px]">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">
              {isEmail ? "Enter your email" : "Authenticate"}
            </h1>
            <p className="text-balance text-muted-foreground">
              {isEmail
                ? "Enter your email to sign in."
                : "Enter your phone number to sign in / up."}
            </p>
          </div>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor={isEmail ? "email" : "tel"}>
                {isEmail ? "Your Email" : "Your Phone Number"}
              </Label>
              <Input
                id={isEmail ? "email" : "tel"}
                type={isEmail ? "email" : "tel"}
                className="placeholder:text-muted"
                placeholder={isEmail ? "john.doe@example.com" : "+123 456 7890"}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              {isEmail ? "Send a code to my Inbox" : "Send me an SMS"}
            </Button>
          </div>
          <div>
            <h3 className="my-4 text-center text-slate-400 uppercase font-mono">
              Or
            </h3>
            <div className="flex items-center gap-4 justify-center">
              {" "}
              {isEmail ? (
                <UsePhoneNumberButton />
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="rounded-full"
                    title="Call me instead"
                    aria-label="Call me instead"
                  >
                    <PhoneCallIcon size={16} />
                  </Button>
                  <EmailButton />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted md:block"></div>
    </div>
  );
}
