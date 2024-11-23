"use client";

import React from "react";
import { Tabs, Tab } from "@nextui-org/react";
import { ScrollShadow } from "@nextui-org/react";
import { useMediaQuery } from "react-responsive";

const PrivacyPolicy = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  return (
    <div className="w-full flex flex-col p-5">
      <div className="w-full max-w-4xl mx-auto">
        <Tabs aria-label="Privacy Policy Tabs">
          <Tab key="english" title="EN">
            <div className="border-1 border-transparent rounded-2xl backdrop-blur-3xl bg-white/20 p-5">
              <ScrollShadow
                hideScrollBar
                className={`h-[600px] ${isMobile ? "h-[600px]" : ""}`}
              >
                <div className="flex flex-col gap-y-4">
                  <h1 className="font-bold text-2xl text-center">
                    Privacy Policy
                  </h1>
                  <div className="flex flex-col gap-y-4">
                    <section className="flex flex-col gap-y-2">
                      <h2 className="font-bold uppercase">
                        Privacy Commitment
                      </h2>
                      <p>
                        We deeply understand the importance of protecting your
                        privacy and personal information. While participating in
                        our facial data collection project, you can rest assured
                        that your data will be highly protected. Our data
                        protection commitments are as follows:
                      </p>
                    </section>
                    <section className="flex flex-col gap-y-2">
                      <h2 className="font-bold">
                        1. Purpose of Data Collection
                      </h2>
                      <p>
                        The primary purpose of collecting facial data is to
                        support research and enhance AI algorithms. To achieve
                        high accuracy, AI models require a diverse range of
                        input data, including facial images from various angles,
                        to accurately identify the unique characteristics of
                        each individual. We commit to using your facial images
                        solely for improving AI models and will not employ such
                        data for any other purpose.
                      </p>
                    </section>
                    <section className="flex flex-col gap-y-2">
                      <h2 className="font-bold">2. Types of Data Collected</h2>
                      <p>
                        The data collected for this project is limited to facial
                        images captured from various angles, which optimizes the
                        AI facial recognition model’s performance. This approach
                        ensures that the model can recognize users under various
                        conditions, including changes in lighting, viewing
                        angles, or facial expressions. A diverse dataset with
                        images from multiple angles is essential for developing
                        a model with precise, robust recognition capabilities.
                      </p>
                      <p>
                        We understand your concerns about the potential misuse
                        of personal data. Therefore, we assure you that only
                        facial images will be collected, excluding sensitive
                        information such as names, addresses, or phone numbers.
                        We ensure that your data will remain anonymous and
                        cannot be used to trace back to your identity. By
                        following this procedure, we safeguard participants'
                        privacy and minimize the risk of personal information
                        misuse.
                      </p>
                    </section>
                    <section className="flex flex-col gap-y-2">
                      <h2 className="font-bold">3. Rights of Data Providers</h2>
                      <p>
                        You have the right to request review, modification, or
                        deletion of your data at any time and for any reason
                        (e.g. if you no longer wish to participate in the
                        project or have privacy concerns). We understand that
                        decisions about personal privacy and security are
                        significant, and any request for your data will be
                        processed promptly. We will also send a notification
                        once the request has been successfully processed
                      </p>
                    </section>
                    <section className="flex flex-col gap-y-2">
                      <h2 className="font-bold">4. Data Security</h2>
                      <p>
                        Your facial data will be strictly protected and will not
                        be publicly shared. The data will be stored securely in
                        our system, independent of any third-party storage tool
                        or service, to ensure your privacy and data security.
                      </p>
                      <p>
                        Only authorized individuals involved in AI model
                        processing and development will have access to the
                        facial data you provide. Data access is strictly
                        controlled based on specific work requirements;
                        individuals who are not directly involved in data
                        processing will not have access to your facial data.
                      </p>
                    </section>
                  </div>
                </div>
              </ScrollShadow>
            </div>
          </Tab>

          <Tab key="vietnamese" title="VI">
            <div className="border-1 border-transparent rounded-2xl backdrop-blur-3xl bg-white/20 p-5">
              <ScrollShadow
                hideScrollBar
                className={`h-[600px] ${isMobile ? "h-[600px]" : ""}`}
              >
                <div className="flex flex-col gap-y-4">
                  <h1 className="font-bold text-2xl text-center">
                    Chính sách bảo mật
                  </h1>
                  <div className="flex flex-col gap-y-4">
                    <section className="flex flex-col gap-y-2">
                      <h2 className="font-bold uppercase">
                        CAM KẾT QUYỀN RIÊNG TƯ
                      </h2>
                      <p>
                        Chúng tôi nhận thức sâu sắc tầm quan trọng của việc bảo
                        vệ quyền riêng tư và thông tin cá nhân của bạn. Khi tham
                        gia vào dự án thu thập dữ liệu khuôn mặt phục vụ mô hình
                        trí tuệ nhân tạo (AI), bạn hoàn toàn có thể yên tâm về
                        tính bảo mật và quyền riêng tư của dữ liệu. Các cam kết
                        bảo mật của chúng tôi bao gồm các nội dung sau:
                      </p>
                    </section>
                    <section className="flex flex-col gap-y-2">
                      <h2 className="font-bold">
                        1. Mục đích thu thập dữ liệu
                      </h2>
                      <p>
                        Mục đích chính của việc thu thập dữ liệu khuôn mặt là
                        phục vụ quá trình nghiên cứu và cải tiến thuật toán AI.
                        Để đạt được độ chính xác cao, mô hình AI cần lượng dữ
                        liệu đầu vào đa dạng, bao gồm các hình ảnh khuôn mặt từ
                        nhiều góc độ khác nhau, giúp nhận diện chính xác đặc
                        điểm riêng của từng cá nhân. Chúng tôi cam kết chỉ sử
                        dụng dữ liệu hình ảnh của bạn cho mục đích cải tiến mô
                        hình AI và tuyệt đối không sử dụng dữ liệu này cho bất
                        kỳ mục đích nào khác.
                      </p>
                    </section>
                    <section className="flex flex-col gap-y-2">
                      <h2 className="font-bold">2. Loại dữ liệu thu thập</h2>
                      <p>
                        Dữ liệu thu thập trong dự án chỉ giới hạn ở hình ảnh
                        khuôn mặt từ các góc độ khác nhau nhằm tối ưu hóa hiệu
                        quả của mô hình AI nhận diện khuôn mặt. Điều này giúp
                        đảm bảo mô hình có khả năng nhận diện người dùng trong
                        các điều kiện khác nhau như thay đổi ánh sáng, góc nhìn,
                        hoặc biểu cảm. Các dữ liệu đa dạng từ nhiều góc độ là
                        yếu tố cần thiết để phát triển một mô hình nhận diện
                        chính xác, mạnh mẽ và hiệu quả trong điều kiện thực tế.
                      </p>
                      <p>
                        Chúng tôi hiểu lo ngại của bạn về việc dữ liệu cá nhân
                        có thể bị thu thập và sử dụng không đúng mục đích. Chúng
                        tôi cam kết rằng dữ liệu thu thập sẽ chỉ bao gồm hình
                        ảnh khuôn mặt, không kèm bất kỳ thông tin nhạy cảm nào
                        như tên, địa chỉ, hoặc số điện thoại. Điều này đảm bảo
                        rằng dữ liệu của bạn hoàn toàn ẩn danh và không thể truy
                        vết lại danh tính cá nhân. Quy trình này nhằm bảo vệ
                        quyền riêng tư của người tham gia và giảm thiểu nguy cơ
                        lạm dụng thông tin cá nhân.
                      </p>
                    </section>
                    <section className="flex flex-col gap-y-2">
                      <h2 className="font-bold">
                        3. Quyền của người cung cấp với dữ liệu
                      </h2>
                      <p>
                        Bạn có thể yêu cầu xem xét, chỉnh sửa, hoặc xóa dữ liệu
                        của mình bất kỳ lúc nào, vì bất kỳ lý do gì (ví dụ như
                        bạn không còn muốn tham gia vào dự án, hoặc lo ngại về
                        quyền riêng tư). Chúng tôi hiểu rằng các quyết định về
                        quyền riêng tư và bảo mật cá nhân của bạn là rất quan
                        trọng, khi nhận được yêu cầu xem xét, chỉnh sửa hoặc xóa
                        bỏ dữ liệu, chúng tôi sẽ thực hiện yêu cầu này trong
                        thời gian sớm nhất có thể, đồng thời thông báo cho bạn
                        khi dữ liệu được xử lý thành công.
                      </p>
                    </section>
                    <section className="flex flex-col gap-y-2">
                      <h2 className="font-bold">4. Bảo mật dữ liệu</h2>
                      <p>
                        Dữ liệu khuôn mặt của bạn sẽ được bảo vệ nghiêm ngặt và
                        không công khai chia sẻ. Dữ liệu sẽ được lưu trữ trong
                        hệ thống bảo mật của chúng tôi, không phụ thuộc vào bất
                        kỳ công cụ hoặc dịch vụ lưu trữ của bên thứ ba, nhằm đảm
                        bảo quyền riêng tư và an toàn tuyệt đối.
                      </p>
                      <p>
                        Chỉ những cá nhân có thẩm quyền đối với việc xử lý và
                        phát triển mô hình AI mới được cấp quyền truy cập vào dữ
                        liệu khuôn mặt của bạn. Quyền truy cập dữ liệu sẽ được
                        phân quyền chặt chẽ dựa trên yêu cầu công việc cụ thể;
                        những cá nhân không liên quan trực tiếp đến xử lý dữ
                        liệu sẽ không được phép truy cập dữ liệu khuôn mặt của
                        bạn.
                      </p>
                    </section>
                  </div>
                </div>
              </ScrollShadow>
            </div>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
