import { useFormContext, useWatch } from "react-hook-form";
import { AuthenticatorSchema } from "./type";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { convertNameEmail } from "@/config/name";
import path from "path";
export function Submit() {
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
    <section className="flex flex-col gap-y-10">
      <div className="gap-y-2">
        <h1 className="text-2xl">Checking Your Information</h1>
        <h2 className="text-sm">
          Please validate your information and submit!
        </h2>
      </div>
      <div className="w-[500px] h-[500px] flex flex-col gap-y-3">
        <Input type="email" label="Email" value={email} disabled />
        <Input
          type="name"
          label="Full Name"
          value={name}
          onChange={(e) => setValue("name", e.target.value)}
        />
        <Input
          type="name"
          label="Your Orgnization"
          className="mb-3"
          value={organization}
          onChange={(e) => setValue("organization", e.target.value)}
        />

        <Button color="primary" isLoading={loading} onClick={handleSubmit}>
          {loading ? "Submiting..." : "Submit"}
        </Button>
      </div>
    </section>
  );
}
