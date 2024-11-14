import { useFormContext, useWatch } from "react-hook-form";
import { AuthenticatorSchema } from "./type";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";

import { useMemo } from "react";
import { useMediaQuery } from "react-responsive";
import Link from "next/link";

export function InformationPage() {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const { control, setValue } = useFormContext<AuthenticatorSchema>();

  const email = useWatch({ control, name: "email" });
  const loading = useWatch({ control, name: "loading" });
  const name = useWatch({ control, name: "name" });
  const organization = useWatch({ control, name: "organization" });

  const handleSubmit = async () => {
    setValue("loading", true);

    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      // Camera access granted
      setValue("faceStep", true);
    } catch (error) {
      // Camera access denied
      alert("Allow to access your camera!");
      setValue("faceStep", false);
    } finally {
      setValue("loading", false);
    }
  };

  const handleDisable = useMemo(() => {
    if (name?.length === 0 && organization?.length === 0) {
      return true;
    }

    if (!name || !organization) {
      return true;
    }

    return false;
  }, [name, organization]);

  return (
    <>
      {
        // Web view
        !isMobile ? (
          <>
            <div className="flex flex-col gap-y-10">
              <div className="gap-y-2">
                <h1 className="text-2xl">Enter Basic Information</h1>
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

                <div className="text-sm">
                  By submiting you agree to the{" "}
                  <Link
                    href={"https://fptuaiclub.me/policy"}
                    target="_blank"
                    className="underline cursor-pointer"
                  >
                    Privacy policy
                  </Link>
                </div>

                <Button
                  color="primary"
                  isLoading={loading}
                  onClick={handleSubmit}
                  isDisabled={handleDisable}
                >
                  {loading ? "Allow to access your camera!" : "Submit"}
                </Button>
              </div>
            </div>
          </>
        ) : (
          // Mobile view
          <>
            <div className="flex flex-col gap-y-2">
              <div className="gap-y-2 p-4">
                <h1 className="text-2xl">Enter Basic Information</h1>
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

                <div className="text-sm">
                  By submiting you agree to the{" "}
                  <Link
                    href={"https://fptuaiclub.me/policy"}
                    target="_blank"
                    className="underline cursor-pointer"
                  >
                    Privacy policy
                  </Link>
                </div>

                <Button
                  color="primary"
                  isLoading={loading}
                  onClick={handleSubmit}
                  isDisabled={handleDisable}
                >
                  {loading ? "Allow to access your camera!" : "Submit"}
                </Button>
              </div>
            </div>
          </>
        )
      }
    </>
  );
}
