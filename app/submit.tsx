import { useFormContext, useWatch } from "react-hook-form";
import { AuthenticatorSchema } from "./type";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { convertNameEmail } from "@/config/name";
export function Submit() {
  const { control, setValue } = useFormContext<AuthenticatorSchema>();

  const email = useWatch({ control, name: "email" });
  const name = useWatch({ control, name: "name" });
  const organization = useWatch({ control, name: "organization" });
  const loading = useWatch({ control, name: "loading" });

  const handleSubmit = async () => {
    const name = convertNameEmail(email);
    setValue("loading", true);

    try {
      const response = await fetch(`/api/forwardZip?fileName=${name}`, {
        method: "POST",
      });

      if (response.ok) {
        setValue("loading", false);
        setValue("isFinish", true);
      } else {
        console.error("Error:", response.status, await response.text());
      }
    } catch (error) {
      console.error("Error:", error);
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
