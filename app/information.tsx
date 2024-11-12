import { useFormContext, useWatch } from "react-hook-form";
import { AuthenticatorSchema } from "./type";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/modal";
import { useMemo, useState } from "react";

export function InformationPage() {
  const { control, setValue } = useFormContext<AuthenticatorSchema>();

  const email = useWatch({ control, name: "email" });
  const loading = useWatch({ control, name: "loading" });
  const name = useWatch({ control, name: "name" });
  const organization = useWatch({ control, name: "organization" });

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState<React.ReactNode>("");

  const handleLinkClick = (linkType: "terms" | "privacy") => {
    onOpen();
    if (linkType === "terms") {
      setModalTitle("Modal Terms & Conditions");
      setModalContent(<></>);
    } else if (linkType === "privacy") {
      setModalTitle("Privacy Policy");
      setModalContent(
        <>
          <section>
            <h2 className="font-bold pb-4">PRIVACY COMMITMENT</h2>
            <p>
              We deeply understand the importance of protecting your privacy and
              personal information. While participating in our facial data
              collection project, you can rest assured that your data will be
              highly protected. Our data protection commitments are as follows:
            </p>
          </section>
          <section>
            <h2 className="font-bold pb-4">Purpose of Data Collection</h2>
            <p>
              The primary purpose of collecting facial data is to support
              research and enhance AI algorithms. To achieve high accuracy, AI
              models require a diverse range of input data, including facial
              images from various angles, to accurately identify the unique
              characteristics of each individual. We commit to using your facial
              images solely for improving AI models and will not employ such
              data for any other purpose.
            </p>
          </section>
          <section>
            <h2 className="font-bold pb-4">Types of Data Collected</h2>
            <p className="flex flex-col gap-y-3">
              <span>
                The data collected for this project is limited to facial images
                captured from various angles, which optimizes the AI facial
                recognition model’s performance. This approach ensures that the
                model can recognize users under various conditions, including
                changes in lighting, viewing angles, or facial expressions. A
                diverse dataset with images from multiple angles is essential
                for developing a model with precise, robust recognition
                capabilities.
              </span>
              <span>
                We understand your concerns about the potential misuse of
                personal data. Therefore, we assure you that only facial images
                will be collected, excluding sensitive information such as
                names, addresses, or phone numbers. We ensure that your data
                will remain anonymous and cannot be used to trace back to your
                identity. By following this procedure, we safeguard
                participants' privacy and minimize the risk of personal
                information misuse.
              </span>
            </p>
          </section>
          <section>
            <h2 className="font-bold pb-4">Rights of Data Providers</h2>
            <p className="flex flex-col gap-y-3">
              You have the right to request review, modification, or deletion of
              your data at any time and for any reason (e.g. if you no longer
              wish to participate in the project or have privacy concerns). We
              understand that decisions about personal privacy and security are
              significant, and any request for your data will be processed
              promptly. We will also send a notification once the request has
              been successfully processed
            </p>
          </section>
          <section>
            <h2 className="font-bold pb-4">Data Security</h2>
            <p className="flex flex-col gap-y-3">
              <span>
                Your facial data will be strictly protected and will not be
                publicly shared. The data will be stored securely in our system,
                independent of any third-party storage tool or service, to
                ensure your privacy and data security.
              </span>
              <span>
                Only authorized individuals involved in AI model processing and
                development will have access to the facial data you provide.
                Data access is strictly controlled based on specific work
                requirements; individuals who are not directly involved in data
                processing will not have access to your facial data.
              </span>
            </p>
          </section>
        </>
      );
    }
  };

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
      alert("To continue, you must allow to access your camera!");
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
    <section className="flex flex-col gap-y-10">
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
          {/* <a onClick={() => handleLinkClick("terms")} className="underline">
            Terms & Conditions
          </a>{" "}
          and{" "} */}
          <a
            onClick={() => handleLinkClick("privacy")}
            className="underline cursor-pointer"
          >
            Privacy policy
          </a>
          .
          <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            scrollBehavior={"inside"}
          >
            <ModalContent>
              <ModalHeader className="flex flex-col gap-1">
                {modalTitle}
              </ModalHeader>
              <ModalBody>{modalContent}</ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onOpenChange}>
                  Close
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </div>

        <Button
          color="primary"
          isLoading={loading}
          onClick={handleSubmit}
          isDisabled={handleDisable}
        >
          {loading
            ? "To continue, you must allow to access your camera!"
            : "Submit"}
        </Button>
      </div>
    </section>
  );
}
