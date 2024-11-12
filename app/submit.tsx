import { useFormContext, useWatch } from "react-hook-form";
import { AuthenticatorSchema } from "./type";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { convertNameEmail } from "@/config/name";
import { useMediaQuery } from "react-responsive";

export function Submit() {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const { control, setValue } = useFormContext<AuthenticatorSchema>();

  const email = useWatch({ control, name: "email" });
  const name = useWatch({ control, name: "name" });
  const organization = useWatch({ control, name: "organization" });
  const loading = useWatch({ control, name: "loading" });

  const handleSubmit = async () => {
    try {
      setValue("loading", true);

      const name_email = convertNameEmail(email);

      const response = await fetch("/api/check-folder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name_email,
          name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to check folder");
      }

      if (data.exists) {
        setValue("isFinish", true);
      }
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setValue("loading", false);
    }
  };

  return (
    <>
      {
        // Web view
        !isMobile ? (
          <>
            <div className="flex flex-col gap-y-10">
              <div className="gap-y-2">
                <h1 className="text-2xl">Checking Your Information</h1>
                <h2 className="text-sm">Please fill out this form!</h2>
              </div>
              <div className="w-[500px] h-[500px] flex flex-col gap-y-3">
                <Input type="email" label="Email" value={email} disabled />
                <Input
                  type="name"
                  label="Full Name"
                  placeholder="Ex: HOANG MAI DUNG"
                  value={name}
                  onChange={(e) => setValue("name", e.target.value)}
                />
                <Input
                  type="name"
                  label="Your Orgnization"
                  placeholder="Ex: JSCLUB"
                  className="mb-3"
                  value={organization}
                  onChange={(e) => setValue("organization", e.target.value)}
                />

                <Button
                  color="primary"
                  isLoading={loading}
                  onClick={handleSubmit}
                >
                  {loading
                    ? "To continue, you must allow to access your camera!"
                    : "Submit"}
                </Button>
              </div>
            </div>
          </>
        ) : (
          // Mobile view
          <>
            <div className="flex flex-col gap-y-2">
              <div className="gap-y-2 p-4">
                <h1 className="text-2xl">Checking Your Information</h1>
                <h2 className="text-sm">Please fill out this form!</h2>
              </div>
              <div className="w-[380px] h-[380px] flex flex-col gap-y-3 p-4">
                <Input type="email" label="Email" value={email} disabled />
                <Input
                  type="name"
                  label="Full Name"
                  placeholder="Ex: HOANG MAI DUNG"
                  value={name}
                  onChange={(e) => setValue("name", e.target.value)}
                />
                <Input
                  type="name"
                  label="Your Orgnization"
                  placeholder="Ex: JSCLUB"
                  className="mb-3"
                  value={organization}
                  onChange={(e) => setValue("organization", e.target.value)}
                />

                <Button
                  color="primary"
                  isLoading={loading}
                  onClick={handleSubmit}
                >
                  {loading
                    ? "To continue, you must allow to access your camera!"
                    : "Submit"}
                </Button>
              </div>
            </div>
          </>
        )
      }
    </>
  );
}
