import { useFormContext, useWatch } from "react-hook-form";
import { AuthenticatorSchema } from "./type";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";

import { useMemo } from "react";
import { useMediaQuery } from "react-responsive";
import Link from "next/link";
import {
  Autocomplete,
  AutocompleteItem,
  Radio,
  RadioGroup,
} from "@nextui-org/react";
import { clubs, plans } from "./data";

export function InformationPage() {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const { control, setValue } = useFormContext<AuthenticatorSchema>();

  const email = useWatch({ control, name: "email" });
  const loading = useWatch({ control, name: "loading" });
  const name = useWatch({ control, name: "name" });
  const organization = useWatch({ control, name: "organization" });
  const selectPlan = useWatch({ control, name: "selectPlan" });

  const handleSubmit = async () => {
    setValue("loading", true);
    setValue("tempName", name);
    setValue("tempOrganization", organization);
    setValue("tempSelectPlan", selectPlan);

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
                <h1 className="text-2xl">Thông tin cá nhân</h1>
                <h2 className="text-sm">Vui lòng điền vào mẫu này!</h2>
              </div>
              <div className="w-[500px] h-[500px] flex flex-col gap-y-3">
                <Input type="email" label="Email" value={email} disabled />
                <Input
                  type="name"
                  label="Họ và Tên"
                  placeholder="Ex: NGUYEN QUOC THAI"
                  value={name}
                  onChange={(e) => setValue("name", e.target.value)}
                />
                {/* <Input
                  type="name"
                  label="CLB của bạn"
                  placeholder="Ex: AI CLUB"
                  className="mb-3"
                  value={organization}
                  onChange={(e) => setValue("organization", e.target.value)}
                /> */}
                <Autocomplete
                  label="Select an CLUB"
                  className="w-full"
                  selectedKey={organization}
                  onSelectionChange={(e) =>
                    setValue("organization", e as string)
                  }
                >
                  {clubs.map((club) => (
                    <AutocompleteItem key={club.key}>
                      {club.label}
                    </AutocompleteItem>
                  ))}
                </Autocomplete>

                <Autocomplete
                  label="Select an Plan"
                  selectedKey={selectPlan}
                  onSelectionChange={(e) => setValue("selectPlan", e as string)}
                >
                  {plans.map((plan) => (
                    <AutocompleteItem key={plan.key}>
                      {plan.label}
                    </AutocompleteItem>
                  ))}
                </Autocomplete>

                <div className="text-sm">
                  Bằng cách ấn xác nhận, bạn đồng ý với{" "}
                  <Link
                    href={"https://fptuaiclub.me/policy"}
                    target="_blank"
                    className="underline cursor-pointer"
                  >
                    Chính sách bảo mật
                  </Link>{" "}
                  của chúng tôi.
                </div>

                <Button
                  color="primary"
                  isLoading={loading}
                  onClick={handleSubmit}
                  isDisabled={handleDisable}
                >
                  {loading
                    ? "Cho phép truy cập vào máy ảnh của bạn!"
                    : "Xác Nhận"}
                </Button>
              </div>
            </div>
          </>
        ) : (
          // Mobile view
          <>
            <div className="flex flex-col gap-y-2">
              <div className="gap-y-2 p-4">
                <h1 className="text-2xl">Thông tin cá nhân</h1>
                <h2 className="text-sm">Vui lòng điền vào mẫu này!</h2>
              </div>
              <div className="w-[380px] h-[450px] flex flex-col gap-y-3 p-4">
                <Input type="email" label="Email" value={email} disabled />
                <Input
                  type="name"
                  label="Họ và Tên"
                  placeholder="Ex: NGUYEN QUOC THAI"
                  value={name}
                  onChange={(e) => setValue("name", e.target.value)}
                />
                <Autocomplete
                  label="Select an CLUB"
                  className="w-full"
                  selectedKey={organization}
                  onSelectionChange={(e) =>
                    setValue("organization", e as string)
                  }
                >
                  {clubs.map((club) => (
                    <AutocompleteItem key={club.key}>
                      {club.label}
                    </AutocompleteItem>
                  ))}
                </Autocomplete>

                <Autocomplete
                  label="Select an CLUB"
                  className="w-full"
                  selectedKey={organization}
                  onSelectionChange={(e) =>
                    setValue("organization", e as string)
                  }
                >
                  {clubs.map((club) => (
                    <AutocompleteItem key={club.key}>
                      {club.label}
                    </AutocompleteItem>
                  ))}
                </Autocomplete>

                <Autocomplete
                  selectedKey={selectPlan}
                  onSelectionChange={(e) => setValue("selectPlan", e as string)}
                >
                  {plans.map((plan) => (
                    <AutocompleteItem key={plan.key}>
                      {plan.label}
                    </AutocompleteItem>
                  ))}
                </Autocomplete>

                <div className="text-sm">
                  Bằng cách ấn xác nhận, bạn đồng ý với{" "}
                  <Link
                    href={"https://fptuaiclub.me/policy"}
                    target="_blank"
                    className="underline cursor-pointer"
                  >
                    Chính sách bảo mật
                  </Link>{" "}
                  của chúng tôi.
                </div>

                <Button
                  color="primary"
                  isLoading={loading}
                  onClick={handleSubmit}
                  isDisabled={handleDisable}
                >
                  {loading
                    ? "Cho phép truy cập vào máy ảnh của bạn!"
                    : "Xác Nhận"}
                </Button>
              </div>
            </div>
          </>
        )
      }
    </>
  );
}
