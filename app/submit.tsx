import { useFormContext, useWatch } from "react-hook-form";
import { AuthenticatorSchema } from "./type";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { convertNameEmail } from "@/config/name";
import { useMediaQuery } from "react-responsive";
import { reg } from "./api";
import { Select, SelectItem } from "@nextui-org/react";
import { clubs, plans } from "./data";

export function Submit() {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const { control, setValue } = useFormContext<AuthenticatorSchema>();

  const email = useWatch({ control, name: "email" });
  const name = useWatch({ control, name: "name" });
  const organization = useWatch({ control, name: "organization" });
  const loading = useWatch({ control, name: "loading" });
  const tempName = useWatch({ control, name: "tempName" });
  const tempOrganization = useWatch({ control, name: "tempOrganization" });
  const selectPlan = useWatch({ control, name: "selectPlan" });
  const tempSelectPlan = useWatch({ control, name: "tempSelectPlan" });

  const handleSubmit = async () => {
    try {
      setValue("loading", true);

      const name_email = convertNameEmail(email);

      if (
        tempName !== name ||
        tempOrganization !== organization ||
        tempSelectPlan !== selectPlan
      ) {
        try {
          const response = await fetch("/api/rename-folder", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name_email: name_email,
              name: name,
              tempName: tempName,
              organization: organization,
              tempOrganization: tempOrganization,
              selectPlan: selectPlan,
              tempSelectPlan: tempSelectPlan,
            }),
          });

          const data = await response.json();
        } catch (error) {
          console.error("Request failed:", error);
        }
      }

      const response = await fetch("/api/check-folder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name_email,
          name,
          organization,
          selectPlan,
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

      const email_lower = email.toLowerCase();

      try {
        // Make the API request using fetch
        const response = await fetch(`${reg}${email_lower}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("API request failed");
        }

        const data = await response.json();
      } catch (error) {
        console.error("Request failed:", error);
      }
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
                <h1 className="text-2xl">Vui lòng kiểm tra lại thông tin!</h1>
              </div>
              <div className="w-[500px] h-[500px] flex flex-col gap-y-3">
                <Input type="email" label="Email" value={email} disabled />
                <Input
                  type="name"
                  label="Họ và Tên"
                  placeholder="E.g: NGUYEN VAN A"
                  value={name}
                  onChange={(e) => setValue("name", e.target.value)}
                />
                <Select
                  label="Bạn đến từ CLB nào?"
                  className="w-full"
                  selectedKeys={organization ? [organization] : []}
                  onSelectionChange={(e) =>
                    setValue("organization", e.currentKey as string)
                  }
                >
                  {clubs.map((club) => (
                    <SelectItem key={club.key}>{club.label}</SelectItem>
                  ))}
                </Select>

                <Select
                  label="Bạn muốn tham dự chương trình nào?"
                  selectedKeys={selectPlan ? [selectPlan] : []}
                  onSelectionChange={(e) =>
                    setValue("selectPlan", e.currentKey as string)
                  }
                >
                  {plans.map((plan) => (
                    <SelectItem key={plan.key}>{plan.label}</SelectItem>
                  ))}
                </Select>

                <Button
                  color="primary"
                  isLoading={loading}
                  onClick={handleSubmit}
                >
                  {loading ? "Submiting..." : "Submit"}
                </Button>
              </div>
            </div>
          </>
        ) : (
          // Mobile view
          <>
            <div className="flex flex-col gap-y-2">
              <div className="gap-y-2 p-4">
                <h1 className="text-2xl">Vui lòng kiểm tra lại thông tin!</h1>
              </div>
              <div className="w-[380px] h-[380px] flex flex-col gap-y-3 p-4">
                <Input type="email" label="Email" value={email} disabled />
                <Input
                  type="name"
                  label="Họ và Tên"
                  placeholder="E.g: NGUYEN VAN A"
                  value={name}
                  onChange={(e) => setValue("name", e.target.value)}
                />
                <Select
                  label="Bạn đến từ CLB nào?"
                  className="w-full"
                  selectedKeys={organization ? [organization] : []}
                  onSelectionChange={(e) =>
                    setValue("organization", e.currentKey as string)
                  }
                >
                  {clubs.map((club) => (
                    <SelectItem key={club.key}>{club.label}</SelectItem>
                  ))}
                </Select>

                <Select
                  label="Bạn muốn tham dự chương trình nào?"
                  selectedKeys={selectPlan ? [selectPlan] : []}
                  onSelectionChange={(e) =>
                    setValue("selectPlan", e.currentKey as string)
                  }
                >
                  {plans.map((plan) => (
                    <SelectItem key={plan.key}>{plan.label}</SelectItem>
                  ))}
                </Select>

                <Button
                  color="primary"
                  isLoading={loading}
                  onClick={handleSubmit}
                >
                  {loading ? "Submiting..." : "Submit"}
                </Button>
              </div>
            </div>
          </>
        )
      }
    </>
  );
}
