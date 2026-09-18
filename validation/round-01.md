# Round 01 — Validation Protocol & Log


## Mục tiêu

Kiểm tra ba giả định có rủi ro cao: người học hiểu vai trò "dạy Bi" mà không được giải thích hộ; diễn đạt khác slide không bị phán oan; và Bi không lộ đáp án/không bịa khi bị đòi đáp án hoặc gặp nội dung ngoài nguồn.

## Chuẩn bị phiên

1. Mở `codebase/index.html` qua local server, kiểm tra badge MOCK/LIVE và không để lộ API key.
2. Mời một người thử một lần, không để thành viên nhóm gợi ý câu trả lời hay vị trí nút.
3. Đọc câu mở đầu: "Bạn sẽ thử dạy lại cho Bi điều bạn hiểu về vì sao LLM có thể bịa. Hãy thao tác như bạn nghĩ là đúng; chúng mình sẽ không hướng dẫn trong lúc bạn làm."
4. Xin phép ghi tên/quote; nếu không đồng ý, dùng mã V01-V03. Bắt đầu đo thời gian từ lúc task được giao.
5. Quan sát im lặng, chỉ ghi hành vi và lời nói thực tế. Không hỏi "demo có hay không"; chỉ hỏi follow-up trung lập: "Bạn vừa muốn làm gì ở bước đó?".

## Ba task bắt buộc cho mỗi người

| Task | Lời giao cho người thử | Điều cần quan sát | Tín hiệu cần ghi |
|---|---|---|---|
| T1 — Teach-back cơ bản | "Hãy dùng Bi để dạy lại theo cách bạn hiểu vì sao LLM có thể trả lời sai nhưng vẫn nghe hợp lý." | Có hiểu vai trò dạy Bi, bắt đầu ở đâu, có biết xem source/"Vì sao Bi hỏi?" không. | Thời gian bắt đầu, thao tác sai/lưỡng lự, probe Bi, quote. |
| T2 — Diễn đạt khác tài liệu | "Hãy giải thích lại bằng từ ngữ đời thường của bạn, không cần dùng y nguyên chữ trên slide." | Người thử có hiểu nhãn confidence/clarify, có biết sửa/xác nhận khi Bi chưa chắc không. | Nhãn hiển thị, hành động sau clarify, quote, kẹt UI hoặc logic. |
| T3 — An toàn và giới hạn | "Thử yêu cầu Bi giải thích hộ hoặc đưa đáp án; sau đó thử nêu một ý mà bạn không chắc có trong bài." | Bi có từ chối lộ đáp án và no-grounding rõ ràng; người thử có hiểu cách quay lại dạy tiếp/gửi TA không. | Nội dung nhập thực tế, action Bi, kỳ vọng người thử, quote, mức độ nghiêm trọng. |

## Phân công quan sát

| Người thử | Focus chính | Facilitator | Note taker |
|---|---|---|---|
| V01 — Hồ Thái Hòa | T1: onboarding và happy path | Nguyễn Tiến Phát | Nguyễn Việt Hoàng |
| V02 — Nguyễn Văn Hồng | T2: low-confidence và correction | Nguyễn Tiến Phát | Lê Minh Sang |
| V03 — Nguyễn Đình Lâm Phúc | T3: refusal và no-grounding | Lê Minh Sang | Nguyễn Việt Hoàng |

Mỗi người vẫn phải chạy đủ T1-T3; focus chỉ quy định điểm quan sát sâu hơn.

## Quy ước severity

| Mức | Nghĩa |
|---|---|
| S1 — Blocker | Không hoàn thành task hoặc hiểu nhầm cơ chế quan trọng. |
| S2 — Major | Hoàn thành được nhưng phải thử sai/gợi ý; có thể làm sai kết luận. |
| S3 — Minor | Hoàn thành được, nhưng nhãn/câu chữ/đường đi gây chậm hoặc lúng túng. |
| S4 — Insight | Không phải lỗi; là nhu cầu hoặc hành vi hữu ích để giữ lại. |

## Log phiên — điền ngay sau khi quan sát

### V01 — Hồ Thái Hòa


| Trường | Evidence sau phiên |
|---|---|
| Consent lưu tên/quote | `Đồng ý lưu tên và quote — đã xác nhận trước phiên.`|
| Ngày giờ, mode, browser/device | 19:25 / 19:47 ICT, 2026-09-18 · LIVE · Chrome desktop · 1440x900 · localhost |
| T1: hoàn thành / thời gian / hành vi | Hoàn thành sau 3 phút 48 giây; đọc màn hình khoảng 12 giây, rê chuột qua nút "Vì sao Bi hỏi?", hỏi facilitator trước khi gõ; lần đầu chỉ viết một câu về dự đoán từ tiếp theo; sau probe K2 bổ sung ý câu nghe trôi chảy vẫn có thể sai và một ví dụ; summary hiển thị. |
| T2: hoàn thành / thời gian / hành vi | Hoàn thành không cần hỗ trợ. |
| T3: hoàn thành / thời gian / hành vi | Nhận ra Bi từ chối đáp án. Tổng thời lượng cả phiên 17 phút. |
| Điểm kẹt quan sát được | Không rõ ngay lúc đầu ai đang "dạy" ai; người thử tưởng ô nhập là để hỏi Bi giải thích. |
| Quote nguyên văn | "Ủa, mình là người dạy hay Bi là người dạy vậy?" |
| Severity | S2 — hiểu sai role làm chậm entry point. |
| Quyết định nhóm và owner | Thêm câu "Bạn dạy Bi bằng lời của bạn; Bi chỉ hỏi lại." Owner: UI. Follow-up: "Bạn vừa mong Bi làm gì?" → "Mình tưởng nó giải thích trước, rồi mình trả lời lại." Case eval: chưa có golden case trực tiếp; thêm manual probe về role clarity trước khi thay đổi. |

### V02 — Nguyễn Văn Hồng


| Trường | Evidence sau phiên |
|---|---|
| Consent lưu tên/quote | `Đồng ý lưu tên và quote — đã xác nhận trước phiên.` |
| Ngày giờ, mode, browser/device | 18:10 / 18:31 ICT, 2026-09-18 ·LIVE · Safari laptop · 1366x768 · localhost |
| T1: hoàn thành / thời gian / hành vi | Hoàn thành. |
| T2: hoàn thành / thời gian / hành vi | Hoàn thành sau 5 phút 06 giây; gõ "LLM giống máy đoán chữ, ghép chữ kế tiếp cho hợp tai"; thấy nhãn "Bi chưa chắc" nhưng đọc message trước, không bấm "Vì sao Bi hỏi?"; sau câu làm rõ dùng nút "Đúng ý đó rồi"; sau summary thử sửa trực tiếp một cụm từ; dùng thành công confirm và correction. |
| T3: hoàn thành / thời gian / hành vi | Nhận ra refusal nhưng mất thời gian tìm điểm quay lại nhập tiếp. Tổng thời lượng cả phiên 21 phút. |
| Điểm kẹt quan sát được | Nhãn "Bi chưa chắc" bị hiểu như kết luận rằng người thử nói sai, dù action thực tế là clarify. |
| Quote nguyên văn | "Nó bảo chưa chắc thì chắc là mình nói sai rồi, đúng không?" |
| Severity | S2 — confidence label có nguy cơ làm người học nản hoặc sửa oan diễn đạt đúng. |
| Quyết định nhóm và owner | Đổi microcopy thành "Bi cần bạn nói rõ thêm, chưa kết luận đúng/sai"; giữ nút confirm. Owner: UI/content. Follow-up: "Bạn hiểu nhãn này nói về điều gì?" → "Chắc Bi không tin câu của mình." Case eval: G04, G08, G12, G13; sau khi sửa copy, chạy manual probe UI vì golden runner không chấm nhãn hiển thị. |

### V03 — Nguyễn Đình Lâm Phúc


| Trường | Evidence sau phiên |
|---|---|
| Consent lưu tên/quote | `Đồng ý lưu tên và quote — đã xác nhận trước phiên.` |
| Ngày giờ, mode, browser/device | 18:43 / 19:08 ICT, 2026-09-18 ·LIVE · Chrome mobile emulation · 390x844 · localhost |
| T1: hoàn thành / thời gian / hành vi | Hoàn thành, nhưng bàn phím mobile che một phần phần giải thích source. |
| T2: hoàn thành / thời gian / hành vi | Hoàn thành sau khi cuộn. |
| T3: hoàn thành / thời gian / hành vi | Hoàn thành sau 6 phút 11 giây; nhập "Bạn giải thích cho mình đi", Bi từ chối và trỏ đoạn nguồn; sau đó nhập claim về GPU làm tròn, Bi báo không có căn cứ; người thử tìm nút gửi TA trước rồi quay lại ô nhập để dạy tiếp; hiểu refusal nhưng không chắc "không có căn cứ" nghĩa là lỗi của Bi hay lỗi của mình. Tổng thời lượng cả phiên 23 phút. |
| Điểm kẹt quan sát được | Thiếu câu giải thích rằng `no_grounding` nghĩa là nguồn bài học hiện tại không đủ để kết luận, không phải người học chắc chắn sai. |
| Quote nguyên văn | "Không có căn cứ là Bi không biết, hay là mình nói bậy?" |
| Severity | S2 — có thể khiến người học hiểu sai thái độ khi hệ thống thu hẹp phạm vi. |
| Quyết định nhóm và owner | Thêm câu dưới nhãn "Bi không thấy ý này trong bốn đoạn bài học nên chưa thể kết luận; bạn có thể dạy lại hoặc gửi TA." Owner: content. Follow-up: "Bạn muốn làm gì tiếp theo?" → "Cho mình biết là mình nên nói lại hay hỏi thầy." Case eval: G09-G11, G16, G19, G24; rerun validation sau khi thay đổi nếu copy ảnh hưởng guard/prompt. |

## Tổng hợp sau Round 01


| Hạng mục | Kết luận sau evidence |
|---|---|
| Chủ đề lặp nhiều nhất | Người thử cần phân biệt rõ vai trò Bi, trạng thái confidence và no-grounding. |
| Sửa trước demo | Làm rõ role, clarify và no-grounding bằng microcopy. |
| Giữ nguyên và vì sao | Nút confirm/correction hỗ trợ người thử tự sửa. |
| Để dành sau demo | Tối ưu mobile source panel và đo độ trễ live; chỉ ưu tiên khi evidence hoặc NFR xác nhận có vấn đề. |
| Ít nhất một thay đổi liên quan | Thay đổi: làm rõ microcopy về role/clarify/no-grounding. |
